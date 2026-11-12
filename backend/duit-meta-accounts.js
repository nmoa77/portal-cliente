'use strict';
// DUIT Social — ligação das contas profissionais à API oficial da Meta.
// Esta fase autentica e guarda contas, mas NÃO publica conteúdos.
const crypto = require('crypto');
const express = require('express');
const db = require('./db');
const { requireAdmin } = require('./auth');

db.exec(`
CREATE TABLE IF NOT EXISTS duit_meta_oauth_states (
 state TEXT PRIMARY KEY,
 admin_id INTEGER NOT NULL,
 client_id INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS duit_meta_oauth_pending (
 token TEXT PRIMARY KEY,
 admin_id INTEGER NOT NULL,
 client_id INTEGER NOT NULL,
 pages_encrypted TEXT NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS duit_meta_accounts (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 client_id INTEGER NOT NULL,
 facebook_page_id TEXT NOT NULL,
 facebook_page_name TEXT NOT NULL,
 instagram_business_id TEXT,
 access_token_encrypted TEXT NOT NULL,
 connected_at TEXT NOT NULL DEFAULT (datetime('now')),
 UNIQUE(client_id, facebook_page_id)
);
`);


const graphVersion = process.env.DUIT_META_GRAPH_VERSION || 'v25.0';
function cfg() {
  const appId = process.env.DUIT_META_APP_ID;
  const secret = process.env.DUIT_META_APP_SECRET;
  const key = Buffer.from(process.env.DUIT_META_ENCRYPTION_KEY || '', 'base64url');
  const callback = process.env.DUIT_META_REDIRECT_URI;
  if (!/^v[0-9]{1,2}\.0$/.test(graphVersion)) throw new Error('Versão Graph inválida');
  if (!appId || !secret || key.length !== 32 || !/^https:\/\//.test(callback || '')) return null;
  return {appId,secret,key,callback};
}
function encrypt(value,key) {
  const iv=crypto.randomBytes(12);
  const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);
  const ciphertext=Buffer.concat([cipher.update(String(value),'utf8'),cipher.final()]);
  return [iv,cipher.getAuthTag(),ciphertext].map(x=>x.toString('base64url')).join('.');
}
function decrypt(value,key) {
  const [iv,tag,data]=String(value).split('.').map(s=>Buffer.from(s,'base64url'));
  const decipher=crypto.createDecipheriv('aes-256-gcm',key,iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data),decipher.final()]).toString('utf8');
}
async function graph(path,params={}) {
  const url=new URL('https://graph.facebook.com/'+graphVersion+'/'+path.replace(/^\//,''));
  for (const [k,v] of Object.entries(params)) url.searchParams.set(k,String(v));
  const response=await fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(16000)});
  const body=await response.json().catch(()=>({}));
  if(!response.ok || body.error) throw new Error('Meta Graph: '+(body.error?.message||response.status));
  return body;
}
function register(app) {
  const router=express.Router();
  router.use(requireAdmin);
  router.use((req,res,next)=>{
    const origin=req.get('origin');
    if(origin) {
      try { if(new URL(origin).host!==req.get('host')) return res.status(403).json({error:'Origem não autorizada'}); }
      catch (_) {return res.status(403).json({error:'Origem inválida'});}
    }
    next();
  });
  router.get('/config',(_req,res)=>{
    const config=cfg();
    res.json({enabled:!!config,version:graphVersion});
  });
  router.get('/pending',(req,res)=>{
    const row=db.prepare('SELECT * FROM duit_meta_oauth_pending WHERE admin_id=? AND expires_at>? ORDER BY expires_at DESC LIMIT 1').get(req.user.id,Date.now());
    if(!row)return res.json({pages:[],client_id:null});
    try {
      const list=JSON.parse(decrypt(row.pages_encrypted,cfg().key));
      res.json({client_id:row.client_id,pages:list.map(p=>({id:p.id,name:p.name,instagram_business_id:p.instagram_business_id||null}))});
    }catch(_){res.status(500).json({error:'Não foi possível ler as Páginas autorizadas'});}
  });
  router.post('/select-page',(req,res)=>{
    const config=cfg();if(!config)return res.status(503).json({error:'Meta não configurada'});
    const row=db.prepare('SELECT * FROM duit_meta_oauth_pending WHERE admin_id=? AND expires_at>? ORDER BY expires_at DESC LIMIT 1').get(req.user.id,Date.now());
    if(!row)return res.status(410).json({error:'Autorização expirada. Volte a ligar a conta.'});
    let pages;
    try {pages=JSON.parse(decrypt(row.pages_encrypted,config.key));}
    catch(_){return res.status(500).json({error:'Autorização inválida'});}
    const page=pages.find(p=>p.id===String(req.body?.page_id));
    if(!page||!page.token)return res.status(400).json({error:'Página não autorizada'});
    // Um cliente, uma Página selecionada. Não importar restantes Páginas nem outros clientes.
    db.transaction(()=>{
      db.prepare('DELETE FROM duit_meta_accounts WHERE client_id=?').run(row.client_id);
      db.prepare(`INSERT INTO duit_meta_accounts
        (client_id,facebook_page_id,facebook_page_name,instagram_business_id,access_token_encrypted)
        VALUES(?,?,?,?,?)`).run(row.client_id,page.id,page.name,page.instagram_business_id||null,encrypt(page.token,config.key));
      db.prepare('DELETE FROM duit_meta_oauth_pending WHERE token=?').run(row.token);
    })();
    res.json({ok:true,page_name:page.name});
  });
  router.get('/accounts',(req,res)=>{
    const rows=db.prepare(`SELECT a.id,a.client_id,a.facebook_page_id,a.facebook_page_name,
      a.instagram_business_id,a.connected_at,u.name AS client_name,u.company AS client_company
      FROM duit_meta_accounts a JOIN users u ON a.client_id=u.id ORDER BY a.client_id,a.id`).all();
    res.json(rows);
  });
  router.post('/connect',(req,res)=>{
    const config=cfg();
    if(!config)return res.status(503).json({error:'A ligação Meta ainda não está configurada no Railway'});
    const clientId=Number(req.body?.client_id);
    if(!Number.isSafeInteger(clientId)||clientId<=0||!db.prepare("SELECT id FROM users WHERE id=? AND role='client' AND parent_user_id IS NULL AND COALESCE(is_prospect,0)=0").get(clientId))
      return res.status(400).json({error:'Cliente inválido'});
    const state=crypto.randomBytes(24).toString('base64url');
    db.prepare('DELETE FROM duit_meta_oauth_states WHERE expires_at<?').run(Date.now());
    db.prepare('INSERT INTO duit_meta_oauth_states(state,admin_id,client_id,expires_at) VALUES (?,?,?,?)')
      .run(state,req.user.id,clientId,Date.now()+10*60*1000);
    const auth=new URL('https://www.facebook.com/'+graphVersion+'/dialog/oauth');
    auth.searchParams.set('client_id',config.appId);
    auth.searchParams.set('redirect_uri',config.callback);
    auth.searchParams.set('response_type','code');
    auth.searchParams.set('state',state);
    auth.searchParams.set('scope','pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish');
    res.json({url:auth.href});
  });
  router.delete('/accounts/:id',(req,res)=>{
    const result=db.prepare('DELETE FROM duit_meta_accounts WHERE id=?').run(Number(req.params.id));
    res.json({deleted:result.changes});
  });
  app.use('/api/duit-social/meta',router);

  // O redirect Meta chega de outro domínio; SameSite=Lax conserva o cookie
  // nos GET de navegação de topo. Confirmar utilizador e state antes de guardar.
  app.get('/api/duit-social/meta/callback',requireAdmin,async(req,res)=>{
    const state=String(req.query.state||'');
    const row=db.prepare('SELECT * FROM duit_meta_oauth_states WHERE state=?').get(state);
    if(!row || row.expires_at<Date.now() || row.admin_id!==req.user.id)
      return res.status(403).send('Sessão Meta expirada ou inválida.');
    // Consumir estado numa única utilização antes da chamada externa.
    db.prepare('DELETE FROM duit_meta_oauth_states WHERE state=?').run(state);
    if(req.query.error)return res.status(400).send('A autorização foi recusada na Meta.');
    const code=String(req.query.code||'');
    if(!code)return res.status(400).send('A Meta não devolveu o código de autorização.');
    const config=cfg();
    if(!config)return res.status(503).send('Ligação Meta não configurada.');
    try{
      const short=await graph('oauth/access_token',{
        client_id:config.appId,client_secret:config.secret,redirect_uri:config.callback,code
      });
      const long=await graph('oauth/access_token',{
        grant_type:'fb_exchange_token',client_id:config.appId,client_secret:config.secret,
        fb_exchange_token:short.access_token
      });
      const accounts=await graph('me/accounts',{
        fields:'id,name,access_token,instagram_business_account',
        limit:100,access_token:long.access_token
      });
      const pages=(accounts.data||[]).filter(p=>p.id&&p.access_token).map(p=>({
        id:String(p.id),
        name:String(p.name||'Página'),
        instagram_business_id:p.instagram_business_account?.id?String(p.instagram_business_account.id):null,
        token:String(p.access_token)
      }));
      // Guardar temporariamente a lista cifrada. Só a Página escolhida pelo
      // administrador será associada ao cliente; nunca importar automaticamente.
      const pending=crypto.randomBytes(24).toString('base64url');
      db.prepare('DELETE FROM duit_meta_oauth_pending WHERE expires_at<? OR admin_id=?').run(Date.now(),req.user.id);
      db.prepare('INSERT INTO duit_meta_oauth_pending(token,admin_id,client_id,pages_encrypted,expires_at) VALUES(?,?,?,?,?)')
        .run(pending,req.user.id,row.client_id,encrypt(JSON.stringify(pages),config.key),Date.now()+15*60*1000);
      res.redirect(303,'/social-stories.html?meta_choose=1');
    }catch(e){
      console.error('[duit-social] OAuth Meta:',e.message);
      res.status(502).send('Não foi possível concluir a ligação à Meta. Verifique as permissões e as definições da app.');
    }
  });
}
module.exports={register,encrypt,decrypt,graph,cfg};
