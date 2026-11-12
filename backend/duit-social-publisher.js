'use strict';
// Publicação agendada DUIT. Desativada até configurar explicitamente a Meta.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),express=require('express');
const db=require('./db'),{requireAdmin}=require('./auth'),{cfg,decrypt}=require('./duit-meta-accounts');
const folder=process.env.DUIT_SOCIAL_MEDIA_DIR||path.join(path.dirname(process.env.DATABASE_PATH||path.join(__dirname,'portal.db')),'duit-social-media');
fs.mkdirSync(folder,{recursive:true});
db.exec(`
CREATE TABLE IF NOT EXISTS duit_publish_jobs(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 client_id INTEGER NOT NULL,account_id INTEGER NOT NULL,
 kind TEXT NOT NULL,caption TEXT NOT NULL,networks TEXT NOT NULL,
 scheduled_at TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'draft',error TEXT
);
CREATE TABLE IF NOT EXISTS duit_publish_media(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 job_id INTEGER NOT NULL REFERENCES duit_publish_jobs(id) ON DELETE CASCADE,
 name TEXT NOT NULL,mime TEXT NOT NULL,position INTEGER NOT NULL,
 UNIQUE(job_id,position)
);
CREATE TABLE IF NOT EXISTS duit_publish_results(
 job_id INTEGER NOT NULL REFERENCES duit_publish_jobs(id) ON DELETE CASCADE,
 network TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',
 remote_id TEXT,error TEXT,PRIMARY KEY(job_id,network)
);`);
const publicRoot=()=>String(process.env.DUIT_SOCIAL_PUBLIC_URL||'').replace(/\/$/,'');
const signingKey=()=>process.env.DUIT_SOCIAL_MEDIA_SIGNING_KEY||'';
const enabled=()=>process.env.DUIT_SOCIAL_PUBLISH_ENABLED==='true'&&!!cfg()&&/^https:\/\//.test(publicRoot())&&signingKey().length>=32;
function mediaPath(job,name){return path.join(folder,'job-'+job+'-'+name);}
function signedUrl(id){
 const expires=Math.floor(Date.now()/1000)+21600;
 const sig=crypto.createHmac('sha256',signingKey()).update(id+':'+expires).digest('hex');
 return publicRoot()+'/api/duit-social/publisher/media/'+id+'?expires='+expires+'&sig='+sig;
}
async function graph(node,params,token,method='POST'){
 const v=process.env.DUIT_META_GRAPH_VERSION||'v25.0';
 const url=new URL('https://graph.facebook.com/'+v+'/'+node);
 const fields=new URLSearchParams(params);fields.set('access_token',token);
 const options={method,signal:AbortSignal.timeout(30000)};
 if(method==='POST')options.body=fields;else url.search=fields.toString();
 const res=await fetch(url,options),json=await res.json().catch(()=>({}));
 if(!res.ok||json.error)throw Error(json.error?.message||'Meta HTTP '+res.status);
 return json;
}
async function waitContainer(id,token){
 for(let i=0;i<10;i++){
  const status=await graph(id,{fields:'status_code'},token,'GET');
  if(status.status_code==='FINISHED')return;
  if(['ERROR','EXPIRED'].includes(status.status_code))throw Error('Falha no processamento do vídeo');
  await new Promise(resolve=>setTimeout(resolve,12000));
 }
 throw Error('Processamento Meta sem confirmação. Verificar manualmente.');
}
async function sendInstagram(job,media,account,token){
 const ig=account.instagram_business_id;
 if(!ig)throw Error('Conta Instagram profissional não ligada');
 const children=[];
 for(const m of media){
  if(job.kind!=='reel'&&m.mime!=='image/jpeg')throw Error('Instagram requer JPG');
  const params=job.kind==='reel'
   ? {media_type:'REELS',video_url:signedUrl(m.id),caption:job.caption}
   : {image_url:signedUrl(m.id)};
  if(job.kind==='carousel')params.is_carousel_item='true';
  if(job.kind==='post')params.caption=job.caption;
  const created=await graph(ig+'/media',params,token);
  if(job.kind==='carousel')children.push(created.id);
  else{
   if(job.kind==='reel')await waitContainer(created.id,token);
   return await graph(ig+'/media_publish',{creation_id:created.id},token);
  }
 }
 const parent=await graph(ig+'/media',{media_type:'CAROUSEL',children:children.join(','),caption:job.caption},token);
 return await graph(ig+'/media_publish',{creation_id:parent.id},token);
}
async function sendFacebook(job,media,account,token){
 const page=account.facebook_page_id;
 if(job.kind==='reel')throw Error('Reels do Facebook ainda não suportados');
 if(job.kind==='post'){
  const response=await graph(page+'/photos',{url:signedUrl(media[0].id),caption:job.caption},token);
  return {id:response.post_id||response.id};
 }
 const attached=[];
 for(const item of media){
  const created=await graph(page+'/photos',{url:signedUrl(item.id),published:'false'},token);
  attached.push({media_fbid:created.id});
 }
 return await graph(page+'/feed',{message:job.caption,attached_media:JSON.stringify(attached)},token);
}
function removeMedia(jobId){
 const all=db.prepare('SELECT * FROM duit_publish_media WHERE job_id=?').all(jobId);
 for(const m of all){
  try{fs.unlinkSync(mediaPath(jobId,m.name));}catch(e){if(e.code!=='ENOENT')throw e;}
  db.prepare('DELETE FROM duit_publish_media WHERE id=?').run(m.id);
 }
}
function cleanupCompleted(){
 // Repetir limpeza após reinício se a eliminação física falhou, sem republicar.
 const completed=db.prepare("SELECT id FROM duit_publish_jobs WHERE status='published'").all();
 for(const job of completed){
  try{removeMedia(job.id);}catch(e){console.warn('[duit-social] cleanup pendente',job.id,e.message);}
 }
}
async function publish(job){
 const account=db.prepare('SELECT * FROM duit_meta_accounts WHERE id=? AND client_id=?').get(job.account_id,job.client_id);
 if(!account)throw Error('Conta Meta não ligada');
 const items=db.prepare('SELECT * FROM duit_publish_media WHERE job_id=? ORDER BY position').all(job.id);
 if(!items.length)throw Error('Ficheiros em falta');
 const token=decrypt(account.access_token_encrypted,cfg().key);
 for(const status of db.prepare("SELECT * FROM duit_publish_results WHERE job_id=? AND status='pending'").all(job.id)){
  db.prepare("UPDATE duit_publish_results SET status='processing' WHERE job_id=? AND network=?").run(job.id,status.network);
  try{
   const result=status.network==='instagram'
     ? await sendInstagram(job,items,account,token)
     : await sendFacebook(job,items,account,token);
   if(!result?.id)throw Error('Meta não confirmou o identificador publicado');
   db.prepare("UPDATE duit_publish_results SET status='published',remote_id=?,error=NULL WHERE job_id=? AND network=?")
     .run(String(result.id),job.id,status.network);
  }catch(e){
   // Nunca repetir automaticamente: a Meta pode ter publicado antes do timeout.
   db.prepare("UPDATE duit_publish_results SET status='review',error=? WHERE job_id=? AND network=?")
     .run(e.message.slice(0,500),job.id,status.network);
  }
 }
 const left=db.prepare("SELECT COUNT(*) AS c FROM duit_publish_results WHERE job_id=? AND status!='published'").get(job.id).c;
 if(left){
  db.prepare("UPDATE duit_publish_jobs SET status='review',error='Verificar os canais pendentes antes de repetir' WHERE id=?").run(job.id);
 }else{
  db.prepare("UPDATE duit_publish_jobs SET status='published',error=NULL WHERE id=?").run(job.id);
  try{removeMedia(job.id);}catch(e){console.warn('[duit-social] limpar ficheiro:',e.message);}
 }
}
function register(app){
 app.get('/api/duit-social/publisher/media/:id',(req,res)=>{
  if(!enabled())return res.sendStatus(404);
  const id=Number(req.params.id),expires=Number(req.query.expires);
  if(!Number.isSafeInteger(id)||!Number.isSafeInteger(expires)||expires<Math.floor(Date.now()/1000)||expires>Math.floor(Date.now()/1000)+21600)return res.sendStatus(403);
  const expected=crypto.createHmac('sha256',signingKey()).update(id+':'+expires).digest('hex');
  const sig=String(req.query.sig||'');
  if(!/^[0-9a-f]{64}$/.test(sig)||!crypto.timingSafeEqual(Buffer.from(sig,'hex'),Buffer.from(expected,'hex')))return res.sendStatus(403);
  const media=db.prepare('SELECT m.*,j.status FROM duit_publish_media m JOIN duit_publish_jobs j ON m.job_id=j.id WHERE m.id=?').get(id);
  if(!media||media.status==='published')return res.sendStatus(404);
  res.set('Cache-Control','private, no-store');res.type(media.mime);res.sendFile(mediaPath(media.job_id,media.name));
 });
 const router=express.Router();router.use(requireAdmin);
 router.use((req,res,next)=>{
  const origin=req.get('origin');
  try{if(origin&&new URL(origin).host!==req.get('host'))return res.sendStatus(403);}catch(_){return res.sendStatus(403);}
  next();
 });
 router.get('/config',(_req,res)=>res.json({enabled:enabled(),maxClients:2}));
 router.get('/jobs',(_req,res)=>{
  const jobs=db.prepare('SELECT * FROM duit_publish_jobs ORDER BY scheduled_at DESC LIMIT 200').all();
  res.json(jobs.map(job=>({...job,networks:JSON.parse(job.networks),
   results:db.prepare('SELECT network,status,remote_id,error FROM duit_publish_results WHERE job_id=?').all(job.id),
   files:db.prepare('SELECT id,position,mime FROM duit_publish_media WHERE job_id=? ORDER BY position').all(job.id)})));
 });
 router.post('/jobs',(req,res)=>{
  const {client_id,account_id,kind,networks,caption='',scheduled_at}=req.body||{};
  if(!['post','carousel','reel'].includes(kind)||!Array.isArray(networks)||networks.length<1||
   networks.some(n=>!['instagram','facebook'].includes(n))||new Set(networks).size!==networks.length||
   (kind==='reel'&&networks.includes('facebook'))||
   typeof caption!=='string'||caption.length>2200||!Number.isFinite(Date.parse(scheduled_at)))
   return res.status(400).json({error:'Formato, canais ou data inválidos'});
  const account=db.prepare('SELECT * FROM duit_meta_accounts WHERE id=? AND client_id=?').get(account_id,client_id);
  if(!account)return res.status(400).json({error:'Selecione primeiro a conta Meta deste cliente'});
  if(networks.includes('instagram')&&!account.instagram_business_id)return res.status(400).json({error:'Instagram profissional não ligado'});
  const id=db.transaction(()=>{
   const result=db.prepare('INSERT INTO duit_publish_jobs(client_id,account_id,kind,caption,networks,scheduled_at) VALUES (?,?,?,?,?,?)')
     .run(account.client_id,account.id,kind,caption,JSON.stringify(networks),new Date(scheduled_at).toISOString());
   for(const network of networks)db.prepare('INSERT INTO duit_publish_results(job_id,network) VALUES (?,?)').run(result.lastInsertRowid,network);
   return result.lastInsertRowid;
  })();
  res.status(201).json({id});
 });
 router.put('/jobs/:id/files/:position',express.raw({type:()=>true,limit:'80mb'}),(req,res)=>{
  const job=db.prepare('SELECT * FROM duit_publish_jobs WHERE id=?').get(Number(req.params.id));
  const position=Number(req.params.position);
  if(!job||job.status!=='draft'||!Number.isInteger(position)||position<0||position>9||
    (job.kind!=='carousel'&&position!==0))return res.status(409).json({error:'Publicação não editável'});
  const mime=String(req.get('content-type')||'').split(';')[0];
  const image=mime==='image/jpeg'&&req.body?.[0]===255&&req.body?.[1]===216&&req.body?.[2]===255;
  const video=mime==='video/mp4'&&req.body?.toString('ascii',4,8)==='ftyp';
  if(!Buffer.isBuffer(req.body)||!req.body.length||!(job.kind==='reel'?video:image))
   return res.status(400).json({error:'Use JPEG para posts ou MP4 para Reels'});
  const name=crypto.randomBytes(16).toString('hex')+(video?'.mp4':'.jpg');
  fs.writeFileSync(mediaPath(job.id,name),req.body,{flag:'wx'});
  const before=db.prepare('SELECT name FROM duit_publish_media WHERE job_id=? AND position=?').get(job.id,position);
  db.prepare(`INSERT INTO duit_publish_media(job_id,name,mime,position) VALUES (?,?,?,?)
    ON CONFLICT(job_id,position) DO UPDATE SET name=excluded.name,mime=excluded.mime`).run(job.id,name,mime,position);
  if(before)try{fs.unlinkSync(mediaPath(job.id,before.name));}catch(_){}
  res.json({ok:true});
 });
 router.post('/jobs/:id/schedule',(req,res)=>{
  const job=db.prepare('SELECT * FROM duit_publish_jobs WHERE id=?').get(Number(req.params.id));
  if(!job||job.status!=='draft')return res.status(409).json({error:'Já não é um rascunho'});
  const count=db.prepare('SELECT COUNT(*) c FROM duit_publish_media WHERE job_id=?').get(job.id).c;
  if(count<(job.kind==='carousel'?2:1))return res.status(400).json({error:'Ficheiros insuficientes'});
  if(!enabled())return res.status(503).json({error:'Publicação automática desativada até configuração e testes'});
  db.prepare("UPDATE duit_publish_jobs SET status='scheduled' WHERE id=?").run(job.id);
  res.json({ok:true});
 });
 router.delete('/jobs/:id',(req,res)=>{
  const job=db.prepare('SELECT * FROM duit_publish_jobs WHERE id=?').get(Number(req.params.id));
  if(!job||!['draft','scheduled'].includes(job.status))return res.status(409).json({error:'Não pode apagar um conteúdo em processamento'});
  removeMedia(job.id);
  db.prepare('DELETE FROM duit_publish_jobs WHERE id=?').run(job.id);
  res.json({ok:true});
 });
 app.use('/api/duit-social/publisher',router);
 try{cleanupCompleted();}catch(e){console.warn('[duit-social] limpeza inicial:',e.message);}

 if(process.env.DUIT_SOCIAL_PUBLISH_ENABLED==='true'){
  let busy=false;
  const tick=async()=>{
   if(busy||!enabled())return;busy=true;
   try{
    const jobs=db.prepare("SELECT * FROM duit_publish_jobs WHERE status='scheduled' AND scheduled_at<=? ORDER BY scheduled_at LIMIT 3").all(new Date().toISOString());
    for(const job of jobs){
     const claimed=db.prepare("UPDATE duit_publish_jobs SET status='processing' WHERE id=? AND status='scheduled'").run(job.id);
     if(!claimed.changes)continue;
     try{await publish(job);}catch(e){
      db.prepare("UPDATE duit_publish_jobs SET status='review',error=? WHERE id=?").run(e.message.slice(0,500),job.id);
     }
    }
   }catch(e){console.error('[duit-social] publicador:',e.message);}
   finally{busy=false;}
  };
  const timer=setInterval(tick,60000);timer.unref?.();
  setTimeout(tick,10000).unref?.();
 }
}
module.exports={register};
