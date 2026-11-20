'use strict';
// Publicação agendada DUIT. Desativada até configurar explicitamente a Meta.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),express=require('express');
const db=require('./db'),{requireAdmin}=require('./auth'),{cfg,decrypt}=require('./duit-meta-accounts');
const {facebookCarouselParams,isFacebookReelPublished,validateFacebookReelUploadUrl,validateMediaSet,validMetaPostId,canReconcile,isFutureSchedule}=require('./duit-social-meta-helpers');
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
// A publicação editorial e o trabalho Meta pertencem à mesma entrada
// do calendário. A chave única impede duplicações por cliques repetidos.
if(!db.prepare("PRAGMA table_info(duit_publish_jobs)").all().some(c=>c.name==='source_post_id'))
 db.exec("ALTER TABLE duit_publish_jobs ADD COLUMN source_post_id INTEGER");
db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_duit_publish_editorial_source ON duit_publish_jobs(source_post_id) WHERE source_post_id IS NOT NULL");
// Conciliar rascunhos legados criados durante os testes (antes de existir
// source_post_id). Só liga se cliente, dia e legenda coincidirem exatamente
// e se a correspondência for inequívoca em ambos os sentidos. Nunca apaga.
try {
 const legacy=db.prepare("SELECT id,client_id,caption,scheduled_at FROM duit_publish_jobs WHERE source_post_id IS NULL AND status='draft'").all();
 const editorial=db.prepare("SELECT id,user_id,date,text FROM social_posts").all();
 const possibilities=[];
 for(const job of legacy){
  const day=new Date(job.scheduled_at).toLocaleDateString('sv-SE',{timeZone:'Europe/Lisbon'});
  const candidates=editorial.filter(p=>p.user_id===job.client_id&&p.date===day&&
    String(p.text||'').trim()===String(job.caption||'').trim());
  if(candidates.length===1)possibilities.push({jobId:job.id,postId:candidates[0].id});
 }
 const counts=new Map();
 for(const pair of possibilities)counts.set(pair.postId,(counts.get(pair.postId)||0)+1);
 let linked=0;
 for(const pair of possibilities){
  if(counts.get(pair.postId)!==1)continue;
  const existing=db.prepare("SELECT id FROM duit_publish_jobs WHERE source_post_id=?").get(pair.postId);
  if(existing)continue;
  const change=db.prepare("UPDATE duit_publish_jobs SET source_post_id=? WHERE id=? AND source_post_id IS NULL")
   .run(pair.postId,pair.jobId);
  linked+=change.changes;
 }
 if(linked)console.log('[duit-media] rascunhos editoriais reconciliados:',linked);
}catch(error){console.warn('[duit-media] conciliação conservadora:',error.message)}
// Legendas específicas por rede, preservadas na base de dados.
if(!db.prepare("PRAGMA table_info(duit_publish_jobs)").all().some(c=>c.name==='captions_json'))
 db.exec("ALTER TABLE duit_publish_jobs ADD COLUMN captions_json TEXT NOT NULL DEFAULT '{}'");
function checkCaptions(value){
 if(value===undefined)return {};
 if(!value||Array.isArray(value)||typeof value!=='object')return null;
 const result={};
 for(const [network,caption] of Object.entries(value)){
  if(!['facebook','instagram','threads'].includes(network)||typeof caption!=='string'||caption.length>2200)return null;
  result[network]=caption;
 }
 return result;
}
function captionFor(job,network){
 try{
  const captions=JSON.parse(job.captions_json||'{}');
  return typeof captions[network]==='string'?captions[network]:job.caption;
 }catch(_){return job.caption;}
}
const publicRoot=()=>String(process.env.DUIT_SOCIAL_PUBLIC_URL||'').replace(/\/$/,'');
const signingKey=()=>process.env.DUIT_SOCIAL_MEDIA_SIGNING_KEY||'';
const enabled=()=>process.env.DUIT_SOCIAL_PUBLISH_ENABLED==='true'&&!!cfg()&&/^https:\/\//.test(publicRoot())&&signingKey().length>=32;
function mediaPath(job,name){return path.join(folder,'job-'+job+'-'+name);}
// Em staging, só um clique explícito em «Publicar teste» autoriza
// o worker a tratar aquele trabalho. Agendamentos antigos ficam intocados.
if(!db.prepare("PRAGMA table_info(duit_publish_jobs)").all().some(c=>c.name==='test_manual_approved'))
 db.exec("ALTER TABLE duit_publish_jobs ADD COLUMN test_manual_approved INTEGER NOT NULL DEFAULT 0");
// Publicar o mesmo vídeo como Story do Instagram depois do Reel, apenas nos
// NOVOS trabalhos. Nunca aplicar retroativamente a Reels já agendados/publicados.
for(const [col,definition] of [
 ['auto_story','INTEGER NOT NULL DEFAULT 0'],
 ['auto_story_status',"TEXT NOT NULL DEFAULT 'pending'"],
 ['auto_story_remote_id','TEXT'],
 ['auto_story_error','TEXT']
]){
 if(!db.prepare("PRAGMA table_info(duit_publish_jobs)").all().some(x=>x.name===col))
   db.exec('ALTER TABLE duit_publish_jobs ADD COLUMN '+col+' '+definition);
}
const isManualTest=()=>Boolean(String(process.env.DUIT_SOCIAL_TEST_ONLY_PAGE_ID||'').trim());
function testNetwork(){
 return String(process.env.DUIT_SOCIAL_TEST_ONLY_NETWORK||'facebook').trim();
}
function testRestriction(job){
 const pageId=String(process.env.DUIT_SOCIAL_TEST_ONLY_PAGE_ID||'').trim();
 if(!pageId)return null;
 const network=testNetwork();
 if(!['facebook','instagram'].includes(network))
   return 'Modo de teste inválido: rede não suportada.';
 const account=db.prepare('SELECT facebook_page_id,instagram_business_id FROM duit_meta_accounts WHERE id=? AND client_id=?')
   .get(job.account_id,job.client_id);
 if(!account||String(account.facebook_page_id)!==pageId)
   return 'Modo de teste: só é permitida a conta Meta da DUIT.';
 const igId=String(process.env.DUIT_SOCIAL_TEST_ONLY_INSTAGRAM_ID||'').trim();
 if(network==='instagram'&&(!igId||String(account.instagram_business_id)!==igId))
   return 'Modo de teste: só é permitida a conta Instagram profissional da DUIT.';
 const networks=JSON.parse(job.networks||'[]');
 if(networks.length!==1||networks[0]!==network)
   return 'Modo de teste: escolha exclusivamente '+(network==='instagram'?'Instagram':'Facebook')+' DUIT.';
 return null;
}
function validateJobMedia(job){
 const rows=db.prepare('SELECT position,mime,name FROM duit_publish_media WHERE job_id=? ORDER BY position').all(job.id);
 if(!validateMediaSet(job.kind,rows))
   return {ok:false,error:'Carregue os ficheiros por ordem e no formato adequado'};
 // A Graph API de fotografias indica um limite de 10 MB por imagem.
 // Validar antes de pedir à Meta que tente descarregar o ficheiro.
 if(job.kind!=='reel' && JSON.parse(job.networks).includes('facebook')){
   for(const item of rows){
     let bytes=0;
     try{bytes=fs.statSync(mediaPath(job.id,item.name)).size;}
     catch(_){return {ok:false,error:'Ficheiro da publicação não encontrado no armazenamento'};}
     if(bytes>=10*1024*1024)
       return {ok:false,error:'O Facebook aceita fotografias inferiores a 10 MB. Reduza o ficheiro e guarde novamente antes de publicar.'};
   }
 }
 return {ok:true};
}

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
 if(!res.ok||json.error){
  const err=json?.error||{};
  const safeNode=String(node).replace(/^\\d+/, '[page]');
  const fields=[
   'Meta '+method+' '+safeNode+' · HTTP '+res.status,
   'code '+(Number.isInteger(err.code)?err.code:'n/d'),
   ...(Number.isInteger(err.error_subcode)?['subcode '+err.error_subcode]:[]),
   ...(err.type?['type '+String(err.type).slice(0,55)]:[]),
   String(err.message||'Resposta da Meta sem descrição').slice(0,180),
   ...(err.error_user_msg?['detalhe: '+String(err.error_user_msg).slice(0,110)]:[]),
   ...(err.fbtrace_id?['trace '+String(err.fbtrace_id).slice(0,90)]:[])
  ];
  throw Error(fields.join(' · '));
 }
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
   // Fotografias e vídeos podem necessitar de processamento antes do publish.
   await waitContainer(created.id,token);
   return await graph(ig+'/media_publish',{creation_id:created.id},token);
  }
 }
 // A Meta pode ainda estar a processar os contentores do carrossel.
 for(const child of children)await waitContainer(child,token);
 const parent=await graph(ig+'/media',{media_type:'CAROUSEL',children:children.join(','),caption:job.caption},token);
 await waitContainer(parent.id,token);
 return await graph(ig+'/media_publish',{creation_id:parent.id},token);
}
// Facebook Reels Publishing API (start -> hosted upload -> finish -> status).
async function sendFacebookReel(job,media,account,token){
  if(media.length!==1||media[0].mime!=='video/mp4')throw Error('Reel Facebook requer um MP4');
  const page=account.facebook_page_id;
  const created=await graph(page+'/video_reels',{upload_phase:'start'},token);
  const videoId=String(created.video_id||'');
  // Validar host exato antes de transmitir o token de Página Facebook.
  const uploadUrl=validateFacebookReelUploadUrl(String(created.upload_url||''),videoId);
  const upload=await fetch(uploadUrl,{
    method:'POST',
    headers:{Authorization:'OAuth '+token,file_url:signedUrl(media[0].id)},
    signal:AbortSignal.timeout(120000),
    redirect:'error'
  });
  const uploaded=await upload.json().catch(()=>({}));
  if(!upload.ok||uploaded.success!==true)throw Error('A Meta não confirmou o upload do Reel Facebook');
  const finished=await graph(page+'/video_reels',{
    upload_phase:'finish',video_id:videoId,video_state:'PUBLISHED',description:job.caption
  },token);
  if(finished.success!==true)throw Error('A Meta não confirmou o pedido de publicação Facebook');
  // Sucesso de "finish" pode apenas iniciar processamento; não apagar o vídeo
  // enquanto o estado da publicação não estiver confirmado.
  for(let attempt=0;attempt<10;attempt++){
    const info=await graph(videoId,{fields:'status'},token,'GET');
    const status=info.status||{};
    const publishing=String(status.publishing_phase?.status||'').toLowerCase();
    const videoStatus=String(status.video_status||'').toLowerCase();
    if(isFacebookReelPublished(status)){
      return {id:videoId};
    }
    if(['error','failed','expired','upload_failed'].includes(videoStatus)||
       ['error','failed'].includes(publishing))throw Error('Falha de publicação do Reel Facebook');
    await new Promise(resolve=>setTimeout(resolve,9000));
  }
  throw Error('Facebook ainda não confirmou publicação: verificar manualmente');
}

async function sendFacebook(job,media,account,token){
 const page=account.facebook_page_id;
 if(job.kind==='reel')return sendFacebookReel(job,media,account,token);
 if(job.kind==='post'){
  const response=await graph(page+'/photos',{url:signedUrl(media[0].id),caption:job.caption},token);
  return {id:response.post_id||response.id};
 }
 const attached=[];
 for(const item of media){
  const created=await graph(page+'/photos',{url:signedUrl(item.id),published:'false'},token);
  attached.push({media_fbid:created.id});
 }
 // O endpoint de feed exige attached_media[0], attached_media[1], ...
 // (não um único campo attached_media com o array todo).
 const params=facebookCarouselParams(attached.map(item=>String(item.media_fbid)),job.caption);
 return await graph(page+'/feed',params,token);
}
function removeMedia(jobId){
 const all=db.prepare('SELECT * FROM duit_publish_media WHERE job_id=?').all(jobId);
 for(const m of all){
  try{fs.unlinkSync(mediaPath(jobId,m.name));}catch(e){if(e.code!=='ENOENT')throw e;}
  db.prepare('DELETE FROM duit_publish_media WHERE id=?').run(m.id);
 }
}
function cleanupCompleted(){
 // Limpar APENAS trabalhos cujo envio a todos os canais terminou confirmado.
 // Preservar draft/scheduled/processing/review: podem precisar do vídeo para
 // publicar ou resolver um erro. A Story automática já foi tentada quando
 // o job passa a published. Guardar o estado e resultados, não os ficheiros.
 const completed=db.prepare("SELECT id FROM duit_publish_jobs WHERE status='published'").all();
 let removed=0;
 for(const job of completed){
  try{
   const count=db.prepare('SELECT COUNT(*) AS count FROM duit_publish_media WHERE job_id=?').get(job.id).count;
   if(count){removeMedia(job.id);removed+=count;}
  }catch(e){console.warn('[duit-social] limpeza de publicação '+job.id+':',e.message);}
 }
 if(removed)console.info('[duit-social] ficheiros publicados removidos:',removed);
}
// Esta é uma publicação STORY autónoma do mesmo vídeo (não um sticker
// clicável de partilha do Reel). Só tenta uma vez para evitar duplicados
// quando a Meta conclui a publicação mas ocorre um timeout.
async function autoPublishInstagramStory(job,media,account,token){
 if(job.kind!=='reel'||!job.auto_story||!account.instagram_business_id)return;
 const claimed=db.prepare("UPDATE duit_publish_jobs SET auto_story_status='processing',auto_story_error=NULL WHERE id=? AND auto_story=1 AND auto_story_status='pending'").run(job.id);
 if(!claimed.changes)return;
 try{
   const source=media[0];
   if(!source||source.mime!=='video/mp4')throw Error('Vídeo MP4 indisponível para a Story.');
   // A Meta impõe limites distintos aos vídeos nas Stories.
   // Não colocar em fila vídeos de dimensões incompatíveis.
   const bytes=fs.statSync(mediaPath(job.id,source.name)).size;
   if(bytes>100*1024*1024)throw Error('O Reel foi publicado, mas a Story automática aceita vídeos até 100 MB. É necessário um ficheiro mais leve.');
   const ig=account.instagram_business_id;
   const created=await graph(ig+'/media',{media_type:'STORIES',video_url:signedUrl(source.id)},token);
   if(!created?.id)throw Error('A Meta não aceitou preparar a Story.');
   await waitContainer(created.id,token);
   const sent=await graph(ig+'/media_publish',{creation_id:created.id},token);
   if(!sent?.id)throw Error('A Meta não confirmou o identificador da Story.');
   db.prepare("UPDATE duit_publish_jobs SET auto_story_status='published',auto_story_remote_id=?,auto_story_error=NULL WHERE id=?")
     .run(String(sent.id),job.id);
 }catch(err){
   // Não repetir automaticamente: a Story pode ter sido publicada antes de
   // um timeout. O estado do Reel não sofre alterações.
   db.prepare("UPDATE duit_publish_jobs SET auto_story_status='review',auto_story_error=? WHERE id=?")
     .run(String(err.message||'Falha na Story automática').slice(0,500),job.id);
 }
}
async function publish(job){
 const testError=testRestriction(job);
 if(testError)throw Error(testError);
 if(JSON.parse(job.networks).includes('threads'))throw Error('Publicação Threads não configurada; requer autorização específica.');
 const account=db.prepare('SELECT * FROM duit_meta_accounts WHERE id=? AND client_id=?').get(job.account_id,job.client_id);
 if(!account)throw Error('Conta Meta não ligada');
 const items=db.prepare('SELECT * FROM duit_publish_media WHERE job_id=? ORDER BY position').all(job.id);
 if(!items.length)throw Error('Ficheiros em falta');
 const token=decrypt(account.access_token_encrypted,cfg().key);
 for(const status of db.prepare("SELECT * FROM duit_publish_results WHERE job_id=? AND status='pending'").all(job.id)){
  db.prepare("UPDATE duit_publish_results SET status='processing' WHERE job_id=? AND network=?").run(job.id,status.network);
  try{
   const result=status.network==='instagram'
     ? await sendInstagram({...job,caption:captionFor(job,'instagram')},items,account,token)
     : await sendFacebook({...job,caption:captionFor(job,'facebook')},items,account,token);
   if(!result?.id)throw Error('Meta não confirmou o identificador publicado');
   db.prepare("UPDATE duit_publish_results SET status='published',remote_id=?,error=NULL WHERE job_id=? AND network=?")
     .run(String(result.id),job.id,status.network);
   // Publicação da Story inicia-se APENAS após confirmação do Reel Instagram.
   if(status.network==='instagram'&&job.kind==='reel')
     await autoPublishInstagramStory(job,items,account,token);
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
  // O envio terminou em todos os canais e a Story automática (se ativada)
  // já foi tentada. Eliminar imediatamente os ficheiros locais, preservando
  // o histórico e os identificadores das publicações.
  try{removeMedia(job.id);}catch(e){
   console.warn('[duit-social] limpeza após publicação '+job.id+':',e.message);
  }
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
  if(!media)return res.sendStatus(404);
  res.set('Cache-Control','private, no-store');res.type(media.mime);res.sendFile(mediaPath(media.job_id,media.name));
 });
 const router=express.Router();router.use(requireAdmin);
 router.use((req,res,next)=>{
  const origin=req.get('origin');
  try{if(origin&&new URL(origin).host!==req.get('host'))return res.sendStatus(403);}catch(_){return res.sendStatus(403);}
  next();
 });
 router.get('/jobs/:id/files/:mediaId',(req,res)=>{
   const jobId=Number(req.params.id),mediaId=Number(req.params.mediaId);
   if(!Number.isSafeInteger(jobId)||!Number.isSafeInteger(mediaId))return res.sendStatus(404);
   const media=db.prepare('SELECT * FROM duit_publish_media WHERE id=? AND job_id=?').get(mediaId,jobId);
   if(!media)return res.sendStatus(404);
   res.set('Cache-Control','private, no-store');
   res.set('X-Content-Type-Options','nosniff');
   res.type(media.mime);
   res.sendFile(mediaPath(media.job_id,media.name));
 });
 router.get('/config',(_req,res)=>{
  const connected=db.prepare('SELECT COUNT(*) AS c FROM duit_meta_accounts').get().c;
  const config={
   enabled:enabled(),
   clientLimit:null,
   hasMetaCredentials:!!cfg(),
   hasPublicMediaUrl:/^https:\/\//.test(publicRoot()),
   hasSigningKey:signingKey().length>=32,
   hasPersistentStorage:!!process.env.DATABASE_PATH,
   connectedAccounts:connected,
   workerEnabled:process.env.DUIT_SOCIAL_PUBLISH_ENABLED==='true',
   testOnlyNetwork:isManualTest()?testNetwork():null,
   testScheduleEnabled:isManualTest()&&testNetwork()==='instagram'&&process.env.DUIT_SOCIAL_TEST_SCHEDULE_ENABLED==='true'
  };
  res.json(config);
 });
 // Leitura do calendário por intervalo, sem o limite de 200 itens da listagem.
 // Alargamos 1 dia em cada extremo para cobrir os fusos horários locais.
 router.get('/calendar',(req,res)=>{
   const start=String(req.query.start||''),end=String(req.query.end||'');
   if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||
      !/^\d{4}-\d{2}-\d{2}$/.test(end)||
      !Number.isFinite(Date.parse(start))||!Number.isFinite(Date.parse(end))||
      Date.parse(end)<Date.parse(start)||Date.parse(end)-Date.parse(start)>1000*60*60*24*65)
     return res.status(400).json({error:'Intervalo inválido (máximo 65 dias)'});
   const utcStart=new Date(Date.parse(start)-86400000).toISOString();
   const utcEnd=new Date(Date.parse(end)+2*86400000).toISOString();
   const clientId=req.query.client_id===undefined?null:Number(req.query.client_id);
   if(clientId!==null&&(!Number.isSafeInteger(clientId)||clientId<=0))
     return res.status(400).json({error:'Cliente inválido'});
   const rows=db.prepare(`SELECT j.id,j.client_id,j.account_id,j.kind,j.scheduled_at,j.status,j.source_post_id,
       j.networks,j.error,j.auto_story,j.auto_story_status,j.auto_story_error,
       u.name AS client_name,u.company AS client_company
       FROM duit_publish_jobs j JOIN users u ON u.id=j.client_id
       LEFT JOIN social_posts sp ON sp.id=j.source_post_id AND sp.user_id=j.client_id
       WHERE ((j.scheduled_at>=? AND j.scheduled_at<?) OR
          (sp.date>=? AND sp.date<=?))
         AND (? IS NULL OR j.client_id=?)
       ORDER BY j.scheduled_at ASC LIMIT 1000`)
     .all(utcStart,utcEnd,start,end,clientId,clientId);
   res.json(rows.map(row=>({...row,networks:JSON.parse(row.networks),
     results:db.prepare('SELECT network,status,error FROM duit_publish_results WHERE job_id=?').all(row.id)})));
 });
 router.get('/jobs/:id',(req,res)=>{
   const id=Number(req.params.id);
   if(!Number.isSafeInteger(id)||id<=0)return res.status(400).json({error:'Identificador inválido'});
   const job=db.prepare(`SELECT j.*,u.name AS client_name,u.company AS client_company,
       a.facebook_page_name AS page_name
       FROM duit_publish_jobs j JOIN users u ON u.id=j.client_id
       LEFT JOIN duit_meta_accounts a ON a.id=j.account_id WHERE j.id=?`).get(id);
   if(!job)return res.status(404).json({error:'Publicação não encontrada'});
   res.json({...job,networks:JSON.parse(job.networks),
     results:db.prepare('SELECT network,status,remote_id,error FROM duit_publish_results WHERE job_id=?').all(id),
     files:db.prepare('SELECT id,position,mime FROM duit_publish_media WHERE job_id=? ORDER BY position').all(id)});
 });
 router.get('/jobs',(_req,res)=>{
  const jobs=db.prepare(`SELECT j.*,u.name AS client_name,u.company AS client_company,
    a.facebook_page_name AS page_name
    FROM duit_publish_jobs j JOIN users u ON u.id=j.client_id
    LEFT JOIN duit_meta_accounts a ON a.id=j.account_id
    ORDER BY j.scheduled_at DESC LIMIT 200`).all();
  res.json(jobs.map(job=>({...job,networks:JSON.parse(job.networks),
   results:db.prepare('SELECT network,status,remote_id,error FROM duit_publish_results WHERE job_id=?').all(job.id),
   files:db.prepare('SELECT id,position,mime FROM duit_publish_media WHERE job_id=? ORDER BY position').all(job.id)})));
 });
 router.post('/jobs',(req,res)=>{
  const {client_id,account_id,kind,networks,caption='',captions,scheduled_at,source_post_id}=req.body||{};
  const validCaptions=checkCaptions(captions);
  if(!['post','carousel','reel'].includes(kind)||!Array.isArray(networks)||networks.length<1||
   (!validCaptions)||networks.some(n=>!['instagram','facebook','threads'].includes(n))||new Set(networks).size!==networks.length||
   typeof caption!=='string'||caption.length>2200||!Number.isFinite(Date.parse(scheduled_at)))
   return res.status(400).json({error:'Formato, canais ou data inválidos'});
  const account=db.prepare('SELECT * FROM duit_meta_accounts WHERE id=? AND client_id=?').get(account_id,client_id);
  if(!account)return res.status(400).json({error:'Selecione primeiro a conta Meta deste cliente'});
  if(networks.includes('instagram')&&!account.instagram_business_id)return res.status(400).json({error:'Instagram profissional não ligado'});
  const sourceId=source_post_id===undefined||source_post_id===null?null:Number(source_post_id);
  if(sourceId!==null){
    if(!Number.isSafeInteger(sourceId)||sourceId<=0)return res.status(400).json({error:'Post editorial inválido'});
    const source=db.prepare('SELECT id FROM social_posts WHERE id=? AND user_id=?').get(sourceId,client_id);
    if(!source)return res.status(404).json({error:'Post editorial não encontrado neste cliente'});
    // Reaproveitar um rascunho de teste criado antes desta associação,
    // apenas quando há correspondência EXATA e única de cliente, texto e dia.
    const exactJobs=db.prepare("SELECT id,caption,scheduled_at FROM duit_publish_jobs WHERE source_post_id IS NULL AND status='draft' AND client_id=?")
      .all(client_id).filter(j=>j.caption.trim()===caption.trim() &&
        new Date(j.scheduled_at).toLocaleDateString('sv-SE',{timeZone:'Europe/Lisbon'})===
        db.prepare("SELECT date FROM social_posts WHERE id=?").get(sourceId)?.date);
    if(exactJobs.length===1){
      const matches=db.prepare("SELECT COUNT(*) AS c FROM social_posts WHERE user_id=? AND date=? AND trim(text)=trim(?)")
        .get(client_id,db.prepare("SELECT date FROM social_posts WHERE id=?").get(sourceId).date,caption.trim());
      if(matches.c===1){
        db.prepare("UPDATE duit_publish_jobs SET source_post_id=? WHERE id=? AND source_post_id IS NULL")
          .run(sourceId,exactJobs[0].id);
      }
    }
    const existing=db.prepare('SELECT id,status FROM duit_publish_jobs WHERE source_post_id=?').get(sourceId);
    if(existing){
      if(existing.status!=='draft')
        return res.status(409).json({error:'Este post já foi preparado na Duit Media. Abra a publicação existente no calendário.'});
      // Reutilizar o mesmo rascunho; não criar outro trabalho.
      return res.json({id:existing.id,reused:true});
    }
  }
  const id=db.transaction(()=>{
   const result=db.prepare('INSERT INTO duit_publish_jobs(client_id,account_id,kind,caption,networks,scheduled_at,source_post_id,captions_json,auto_story) VALUES (?,?,?,?,?,?,?,?,?)')
     .run(account.client_id,account.id,kind,caption,JSON.stringify(networks),new Date(scheduled_at).toISOString(),sourceId,JSON.stringify(validCaptions),kind==='reel'&&networks.includes('instagram')?1:0);
   for(const network of networks)db.prepare('INSERT INTO duit_publish_results(job_id,network) VALUES (?,?)').run(result.lastInsertRowid,network);
   return result.lastInsertRowid;
  })();
  res.status(201).json({id});
 });
 router.patch('/jobs/:id',(req,res)=>{
   const id=Number(req.params.id);
   if(!Number.isSafeInteger(id)||id<=0)return res.status(400).json({error:'Publicação inválida'});
   const job=db.prepare('SELECT * FROM duit_publish_jobs WHERE id=?').get(id);
   if(!job)return res.status(404).json({error:'Publicação não encontrada'});
   if(job.status!=='draft')
     return res.status(409).json({error:'Para editar todos os campos, cancele primeiro o agendamento. Publicações em processamento ou publicadas não podem ser modificadas.'});
   const body=req.body||{};
   const caption=body.caption===undefined?job.caption:body.caption;
   const date=body.scheduled_at===undefined?job.scheduled_at:body.scheduled_at;
   const kind=body.kind===undefined?job.kind:body.kind;
   const accountId=body.account_id===undefined?job.account_id:Number(body.account_id);
   const networks=body.networks===undefined?JSON.parse(job.networks):body.networks;
   const captions=body.captions===undefined?JSON.parse(job.captions_json||'{}'):checkCaptions(body.captions);
   if(typeof caption!=='string'||caption.length>2200||typeof date!=='string'||
      !Number.isFinite(Date.parse(date))||!['post','carousel','reel'].includes(kind)||
      !Array.isArray(networks)||networks.length<1||new Set(networks).size!==networks.length||
      networks.some(n=>!['instagram','facebook','threads'].includes(n))||!captions)
     return res.status(400).json({error:'Dados da publicação inválidos'});
   const account=db.prepare('SELECT * FROM duit_meta_accounts WHERE id=?').get(accountId);
   if(!account)return res.status(400).json({error:'Conta Meta inválida ou desligada'});
   if(networks.includes('instagram')&&!account.instagram_business_id)
     return res.status(400).json({error:'Instagram profissional não associado a esta conta'});
   const isDifferentKind=kind!==job.kind;
   // A mudança de formato só é confirmada depois de fornecer novos ficheiros;
   // evita apagar o ficheiro anterior num simples clique de edição.
   if(isDifferentKind&&!body.replace_media)
     return res.status(400).json({error:'Para mudar o formato selecione o novo ficheiro.'});
   const changed=db.transaction(()=>{
     const update=db.prepare(`UPDATE duit_publish_jobs SET client_id=?,account_id=?,kind=?,
       caption=?,captions_json=?,networks=?,scheduled_at=?,source_post_id=?,auto_story=?
       WHERE id=? AND status='draft'`).run(
         account.client_id,accountId,kind,caption,JSON.stringify(captions),
         JSON.stringify(networks),new Date(date).toISOString(),
         account.client_id===job.client_id?job.source_post_id:null,
         kind==='reel'&&networks.includes('instagram')?1:0,id);
     if(!update.changes)return false;
     db.prepare('DELETE FROM duit_publish_results WHERE job_id=?').run(id);
     for(const network of networks)
       db.prepare('INSERT INTO duit_publish_results(job_id,network) VALUES (?,?)').run(id,network);
     return true;
   })();
   if(!changed)return res.status(409).json({error:'O estado da publicação mudou. Atualize a página.'});
   if(isDifferentKind){
     // Só é autorizado em rascunhos. A interface exige ficheiros substitutos.
     try{removeMedia(id);}catch(e){console.error('[duit-media] troca de formato:',e);}
   }
   res.json({ok:true,client_id:account.client_id,kind,media_reset:isDifferentKind});
 });
 // Upload de Reels maiores: partes de 5 MiB, sem carregar o vídeo inteiro
 // em memória. O ficheiro só substitui o anterior após conclusão validada.
 const REEL_MAX_BYTES=300*1024*1024;
 const REEL_CHUNK_BYTES=5*1024*1024;
 function chunkParams(req,res){
   const id=Number(req.params.id),position=Number(req.params.position);
   const upload=String(req.params.uploadId||'');
   const index=Number(req.params.index);
   const job=db.prepare('SELECT * FROM duit_publish_jobs WHERE id=?').get(id);
   if(!job||job.status!=='draft'||job.kind!=='reel'||position!==0)
     {res.status(409).json({error:'Reel não editável'});return null;}
   if(!/^[0-9a-f-]{36}$/.test(upload))
     {res.status(400).json({error:'Identificador de upload inválido'});return null;}
   const temp=mediaPath(id,'reel-'+upload+'.part');
   return {job,temp,index};
 }
 router.put('/jobs/:id/files/:position/chunks/:uploadId/:index',
   express.raw({type:()=>true,limit:'6mb'}),(req,res)=>{
   const params=chunkParams(req,res);if(!params)return;
   const {temp,index}=params;
   const declared=Number(req.get('x-duit-file-size'));
   if(!Number.isSafeInteger(declared)||declared<=0||declared>REEL_MAX_BYTES)
     return res.status(413).json({error:'Reels até 300 MB por ficheiro para publicação automática.'});
   const total=Math.ceil(declared/REEL_CHUNK_BYTES);
   if(!Number.isInteger(index)||index<0||index>=total)return res.status(400).json({error:'Parte inválida'});
   const expected=Math.min(REEL_CHUNK_BYTES,declared-index*REEL_CHUNK_BYTES);
   if(!Buffer.isBuffer(req.body)||req.body.length!==expected)
     return res.status(400).json({error:'Parte do vídeo incompleta; volte a tentar'});
   let fd;
   try{
     const current=fs.existsSync(temp)?fs.statSync(temp).size:0;
     const offset=index*REEL_CHUNK_BYTES;
     if(current===offset+expected)return res.json({ok:true,part:index,alreadyReceived:true});
     if(current!==offset)return res.status(409).json({error:'Envie as partes do vídeo por ordem.'});
     if(index===0 && req.body.toString('ascii',4,8)!=='ftyp')
       return res.status(400).json({error:'O vídeo deve ser MP4 válido'});
     fd=fs.openSync(temp,index===0?'wx':'r+');
     fs.writeSync(fd,req.body,0,req.body.length,offset);
     fs.closeSync(fd);fd=null;
     res.json({ok:true,part:index});
   }catch(e){
     if(fd!==undefined&&fd!==null)try{fs.closeSync(fd);}catch(_){}
     console.warn('[duit-media] chunk upload:',e.message);
     res.status(500).json({error:'Falha ao guardar parte do Reel. Tente novamente.'});
   }
 });
 router.post('/jobs/:id/files/:position/chunks/:uploadId/complete',(req,res)=>{
   const params=chunkParams(req,res);if(!params)return;
   const {job,temp}=params;
   const declared=Number(req.body?.size);
   if(!Number.isSafeInteger(declared)||declared<=0||declared>REEL_MAX_BYTES)
     return res.status(413).json({error:'Reels até 300 MB.'});
   if(!fs.existsSync(temp)||fs.statSync(temp).size!==declared)
     return res.status(409).json({error:'Upload incompleto. O Reel não foi substituído.'});
   const fd=fs.openSync(temp,'r');
   const magic=Buffer.alloc(12);const count=fs.readSync(fd,magic,0,12,0);fs.closeSync(fd);
   if(count<12||magic.toString('ascii',4,8)!=='ftyp')
     return res.status(400).json({error:'Ficheiro MP4 inválido'});
   const name=crypto.randomBytes(16).toString('hex')+'.mp4';
   const target=mediaPath(job.id,name);
   try{
     fs.renameSync(temp,target);
     const before=db.prepare('SELECT name FROM duit_publish_media WHERE job_id=? AND position=0').get(job.id);
     db.prepare(`INSERT INTO duit_publish_media(job_id,name,mime,position) VALUES (?,?,'video/mp4',0)
       ON CONFLICT(job_id,position) DO UPDATE SET name=excluded.name,mime=excluded.mime`).run(job.id,name);
     if(before)try{fs.unlinkSync(mediaPath(job.id,before.name));}catch(_){}
     res.json({ok:true,size:declared});
   }catch(e){
     console.error('[duit-media] concluir upload:',e.message);
     res.status(500).json({error:'Não foi possível concluir o upload do Reel.'});
   }
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
 router.post('/jobs/:id/resume-pending',(req,res)=>{
  const job=db.prepare('SELECT * FROM duit_publish_jobs WHERE id=?').get(Number(req.params.id));
  if(!job||job.status!=='review')return res.status(409).json({error:'Esta publicação não está em revisão'});
  if(JSON.parse(job.networks).includes('threads'))return res.status(409).json({error:'Threads ainda não está ligado. Não é possível retomar a publicação automática.'});
  // Apenas trabalhos ainda por iniciar podem ser retomados. Nunca alterar
  // canais em revisão ou já publicados.
  const pending=db.prepare("SELECT COUNT(*) AS c FROM duit_publish_results WHERE job_id=? AND status='pending'").get(job.id).c;
  const uncertain=db.prepare("SELECT COUNT(*) AS c FROM duit_publish_results WHERE job_id=? AND status IN ('review','processing')").get(job.id).c;
  if(!pending)return res.status(409).json({error:'Não existem canais por iniciar'});
  if(uncertain)return res.status(409).json({error:'Verifique primeiro os canais cujo resultado é desconhecido'});
  if(!enabled())return res.status(503).json({error:'Publicação Meta desativada'});
  const updated=db.prepare("UPDATE duit_publish_jobs SET status='scheduled',scheduled_at=?,error=NULL WHERE id=? AND status='review'")
    .run(new Date().toISOString(),job.id);
  res.json({ok:!!updated.changes,status:'scheduled'});
 });
 router.post('/jobs/:id/reconcile',(req,res)=>{
  const id=Number(req.params.id);
  const job=db.prepare('SELECT * FROM duit_publish_jobs WHERE id=?').get(id);
  if(!job||job.status!=='review')
    return res.status(409).json({error:'Apenas publicações em revisão podem ser reconciliadas'});
  const network=String(req.body?.network||'');
  const action=String(req.body?.action||'');
  const remoteId=String(req.body?.remote_id||'').trim();
  if(!['instagram','facebook'].includes(network)||
     !['confirm_published','verified_not_published'].includes(action))
    return res.status(400).json({error:'Rede ou ação inválida'});
  if(action==='confirm_published'&&!validMetaPostId(remoteId))
    return res.status(400).json({error:'Indique o identificador Meta da publicação confirmada'});
  const channel=db.prepare('SELECT * FROM duit_publish_results WHERE job_id=? AND network=?').get(id,network);
  if(!channel||!canReconcile(job.status,channel.status,action))
    return res.status(409).json({error:'Esta rede não está pendente de revisão'});
  if(action==='confirm_published'){
    db.prepare("UPDATE duit_publish_results SET status='published',remote_id=?,error=NULL WHERE job_id=? AND network=?")
      .run(remoteId,id,network);
    const left=db.prepare("SELECT COUNT(*) AS c FROM duit_publish_results WHERE job_id=? AND status!='published'").get(id).c;
    if(!left){
      db.prepare("UPDATE duit_publish_jobs SET status='published',error=NULL WHERE id=?").run(id);
          try{removeMedia(id);}catch(e){console.warn('[duit-social] reconciliação media:',e.message);}
    }
    return res.json({ok:true,status:left?'review':'published'});
  }
  // A confirmação do administrador autoriza APENAS a reentrega daquele canal.
  // Em staging a autorização manual é por publicação, nunca para toda a fila.
  if(isManualTest()){
    const testError=testRestriction(job);
    if(testError)return res.status(409).json({error:testError});
    if(network!==testNetwork())return res.status(409).json({error:'Teste limitado à rede DUIT autorizada.'});
  }
  const updated=db.transaction(()=>{
    db.prepare("UPDATE duit_publish_results SET status='pending',remote_id=NULL,error=NULL WHERE job_id=? AND network=?").run(id,network);
    return db.prepare("UPDATE duit_publish_jobs SET status='scheduled',scheduled_at=?,error=NULL,test_manual_approved=? WHERE id=? AND status='review'")
      .run(new Date().toISOString(),isManualTest()?1:0,id).changes;
  })();
  if(!updated)return res.status(409).json({error:'O estado mudou. Atualize o calendário.'});
  res.json({ok:true,status:'scheduled',manualTest:isManualTest()});
 });
 router.post('/jobs/:id/unschedule',(req,res)=>{
  const id=Number(req.params.id);
  if(!Number.isSafeInteger(id)||id<=0)return res.status(400).json({error:'Publicação inválida'});
  // O worker também altera status de scheduled para processing de forma atómica.
  // Só anulamos quando ainda não começou nenhuma entrega.
  const changed=db.prepare(`UPDATE duit_publish_jobs SET status='draft'
    WHERE id=? AND status='scheduled'
      AND NOT EXISTS(SELECT 1 FROM duit_publish_results
                     WHERE job_id=? AND status!='pending')`).run(id,id);
  if(!changed.changes)return res.status(409).json({error:'Já não é possível cancelar: o envio pode ter começado. Atualize o estado.'});
  res.json({ok:true,status:'draft',filesPreserved:true});
 });
 router.post('/jobs/:id/publish-now',(req,res)=>{
  const job=db.prepare('SELECT * FROM duit_publish_jobs WHERE id=?').get(Number(req.params.id));
  if(!job||job.status!=='draft')return res.status(409).json({error:'A publicação já não é um rascunho'});
  const testError=testRestriction(job);
  if(testError)return res.status(409).json({error:testError});
  if(JSON.parse(job.networks).includes('threads'))return res.status(409).json({error:'A publicação Threads precisa de autorização específica. Mantenha o rascunho até a integração estar configurada.'});
  const valid=validateJobMedia(job);
  if(!valid.ok)return res.status(400).json({error:valid.error});
  if(!enabled())return res.status(503).json({error:'O motor Meta ainda não está configurado nem ativado'});
  // O worker só tratará este ID após consentimento explícito neste pedido.
  const changed=db.prepare("UPDATE duit_publish_jobs SET scheduled_at=?,status='scheduled',test_manual_approved=? WHERE id=? AND status='draft'")
    .run(new Date().toISOString(),1,job.id);
  if(!changed.changes)return res.status(409).json({error:'O estado da publicação mudou.'});
  res.json({ok:true,status:'scheduled',manualTest:isManualTest()});
 });
 router.post('/jobs/:id/schedule',(req,res)=>{
  const id=Number(req.params.id);
  if(!Number.isSafeInteger(id)||id<=0)return res.status(400).json({error:'Publicação inválida'});
  const job=db.prepare('SELECT * FROM duit_publish_jobs WHERE id=?').get(id);
  if(!job||job.status!=='draft')return res.status(409).json({error:'Já não é um rascunho'});
  if(JSON.parse(job.networks).includes('threads'))
    return res.status(409).json({error:'Threads necessita de ligação própria; mantenha o rascunho.'});
  const testError=testRestriction(job);
  if(testError)return res.status(409).json({error:testError});
  if(isManualTest()){
    // O teste agendado é autorizado por clique num rascunho específico.
    // Nenhum agendamento legado ou de outro cliente é ativado.
    if(process.env.DUIT_SOCIAL_TEST_SCHEDULE_ENABLED!=='true'||testNetwork()!=='instagram')
      return res.status(403).json({error:'Agendamento de teste ainda não autorizado neste ambiente.'});
    if(req.body?.confirm_test_schedule!==true)
      return res.status(400).json({error:'Confirme explicitamente este agendamento de teste.'});
    const minutes=(Date.parse(job.scheduled_at)-Date.now())/60000;
    if(!Number.isFinite(minutes)||minutes<2||minutes>1440)
      return res.status(400).json({error:'Para o teste DUIT, escolha entre 2 minutos e 24 horas a partir de agora.'});
  }
  const valid=validateJobMedia(job);
  if(!valid.ok)return res.status(400).json({error:valid.error});
  if(!enabled())return res.status(503).json({error:'O motor de publicação não está ativado'});
  if(!isFutureSchedule(job.scheduled_at))
    return res.status(400).json({error:'A data já passou. Escolha uma data futura.'});
  const changed=db.prepare("UPDATE duit_publish_jobs SET status='scheduled',test_manual_approved=? WHERE id=? AND status='draft'")
    .run(1,job.id);
  if(!changed.changes)return res.status(409).json({error:'O estado mudou; atualize a lista'});
  res.json({ok:true,status:'scheduled',manualTest:isManualTest(),scheduled_at:job.scheduled_at});
 });
 router.delete('/jobs/:id',(req,res)=>{
  const id=Number(req.params.id);
  if(!Number.isSafeInteger(id)||id<=0)return res.status(400).json({error:'Publicação inválida'});
  const job=db.prepare('SELECT * FROM duit_publish_jobs WHERE id=?').get(id);
  if(!job)return res.status(404).json({error:'Publicação não encontrada'});
  // Antes de apagar um agendamento é obrigatório cancelar. O worker nunca
  // utiliza ficheiros de um draft, pelo que não existe envio em curso.
  if(job.status!=='draft')
    return res.status(409).json({error:'Cancele primeiro o agendamento. Publicações iniciadas ou em revisão não podem ser apagadas.'});
  try{
    removeMedia(id);
    db.prepare("DELETE FROM duit_publish_jobs WHERE id=? AND status='draft'").run(id);
    res.json({ok:true});
  }catch(e){
    console.error('[duit-social] apagar rascunho:',e.message);
    res.status(500).json({error:'Não foi possível apagar os ficheiros. Pode tentar novamente.'});
  }
 });

 app.use('/api/duit-social/publisher',router);
 try{cleanupCompleted();}catch(e){console.warn('[duit-social] limpeza inicial:',e.message);}
 // O estado editorial é sempre alterado manualmente no calendário.
 if(process.env.DUIT_SOCIAL_PUBLISH_ENABLED==='true'){
  let busy=false;
  const tick=async()=>{
   if(busy||!enabled())return;busy=true;
   try{
    const jobs=db.prepare("SELECT * FROM duit_publish_jobs WHERE status='scheduled' AND scheduled_at<=? AND test_manual_approved=1 ORDER BY scheduled_at LIMIT 3")
      .all(new Date().toISOString());
    for(const job of jobs){
     if(testRestriction(job))continue; // não tocar nos agendamentos de outros clientes
     const claimed=db.prepare("UPDATE duit_publish_jobs SET status='processing',test_manual_approved=0 WHERE id=? AND status='scheduled' AND test_manual_approved=1")
       .run(job.id);
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
