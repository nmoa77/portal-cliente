'use strict';
// Passkeys WebAuthn: exclusivamente administradores.
// As chaves privadas permanecem no autenticador do Android; apenas a chave pública
// e o contador de assinaturas são guardados na base de dados persistente.
const crypto=require('crypto');
const db=require('./db');
const {requireAdmin}=require('./auth');
const {signToken,setAuthCookie}=require('./auth');
const {
 generateRegistrationOptions,verifyRegistrationResponse,
 generateAuthenticationOptions,verifyAuthenticationResponse
}=require('@simplewebauthn/server');

const RP_ID='cliente.duit.pt';
const EXPECTED_ORIGIN='https://cliente.duit.pt';
const TTL=5*60*1000;
db.exec(`
CREATE TABLE IF NOT EXISTS duit_admin_passkeys (
 id TEXT PRIMARY KEY,
 user_id INTEGER NOT NULL,
 public_key TEXT NOT NULL,
 counter INTEGER NOT NULL DEFAULT 0,
 transports TEXT NOT NULL DEFAULT '[]',
 label TEXT NOT NULL DEFAULT 'Dispositivo',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 last_used_at TEXT
);
CREATE TABLE IF NOT EXISTS duit_passkey_challenges (
 id TEXT PRIMARY KEY,
 user_id INTEGER,
 purpose TEXT NOT NULL CHECK(purpose IN ('register','login')),
 challenge TEXT NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_duit_passkey_challenges_exp ON duit_passkey_challenges(expires_at);
`);
const jsonFail=(res,e,status=400)=>res.status(status).json({error:e});
function isSecureHost(req,res,next){
 if(String(req.hostname||'').toLowerCase()!==RP_ID)return jsonFail(res,'A biometria só está disponível em cliente.duit.pt.',403);
 if(req.method==='POST'||req.method==='DELETE'){
   if(req.get('origin')!==EXPECTED_ORIGIN)return jsonFail(res,'Origem não autorizada.',403);
 }
 next();
}
function newChallenge(userId,purpose,challenge){
 db.prepare('DELETE FROM duit_passkey_challenges WHERE expires_at<?').run(Date.now());
 const id=crypto.randomBytes(24).toString('base64url');
 db.prepare('INSERT INTO duit_passkey_challenges(id,user_id,purpose,challenge,expires_at) VALUES (?,?,?,?,?)')
  .run(id,userId,purpose,challenge,Date.now()+TTL);
 return id;
}
function takeChallenge(id,userId,purpose){
 if(typeof id!=='string'||id.length>100)return null;
 const row=db.prepare('SELECT * FROM duit_passkey_challenges WHERE id=?').get(id);
 db.prepare('DELETE FROM duit_passkey_challenges WHERE id=?').run(id);
 if(!row||row.purpose!==purpose||row.user_id!==userId||row.expires_at<Date.now())return null;
 return row.challenge;
}
function adminById(id){
 return db.prepare("SELECT id,email,name,role,is_active FROM users WHERE id=? AND role='admin' AND COALESCE(is_active,1)<>0").get(id);
}
const rate=new Map();
function limitLogin(req,res,next){
 const ip=String(req.ip||'unknown');
 const now=Date.now();
 if(rate.size>2500)for(const [k,v] of rate)if(v.until<now)rate.delete(k);
 const cur=rate.get(ip);
 if(cur&&cur.until>now&&cur.count>=15)return jsonFail(res,'Demasiadas tentativas. Experimente mais tarde.',429);
 rate.set(ip,{count:cur&&cur.until>now?cur.count+1:1,until:now+10*60*1000});
 next();
}
function register(app){
 const router=require('express').Router();
 router.use(isSecureHost);
 router.get('/register/status',requireAdmin,(req,res)=>{
  const keys=db.prepare('SELECT id,label,created_at,last_used_at FROM duit_admin_passkeys WHERE user_id=? ORDER BY created_at DESC').all(req.user.id);
  res.json({supported:true,keys});
 });
 router.post('/register/options',requireAdmin,async(req,res)=>{
  try{
   const user=adminById(req.user.id);
   if(!user)return jsonFail(res,'Conta de administrador inválida.',403);
   const existing=db.prepare('SELECT id,transports FROM duit_admin_passkeys WHERE user_id=?').all(user.id);
   const options=await generateRegistrationOptions({
     rpName:'DUIT Portal',rpID:RP_ID,
     userName:user.email,userDisplayName:user.name||user.email,
     userID:new Uint8Array(Buffer.from('duit-admin:'+user.id)),
     attestationType:'none',
     excludeCredentials:existing.map(k=>({id:k.id,transports:JSON.parse(k.transports)})),
     authenticatorSelection:{residentKey:'required',requireResidentKey:true,userVerification:'required'},
     supportedAlgorithmIDs:[-7,-257]
   });
   const challengeId=newChallenge(user.id,'register',options.challenge);
   res.json({options,challengeId});
  }catch(e){console.error('[passkey] reg options',e.message);jsonFail(res,'Não foi possível preparar a biometria.',500);}
 });
 router.post('/register/verify',requireAdmin,async(req,res)=>{
  try{
   const user=adminById(req.user.id);
   if(!user)return jsonFail(res,'Conta inválida.',403);
   const expectedChallenge=takeChallenge(req.body?.challengeId,user.id,'register');
   if(!expectedChallenge)return jsonFail(res,'Pedido expirado. Volte a tentar.');
   const verified=await verifyRegistrationResponse({
     response:req.body?.credential,expectedChallenge,expectedOrigin:EXPECTED_ORIGIN,expectedRPID:RP_ID,
     requireUserVerification:true
   });
   const cred=verified.registrationInfo?.credential;
   if(!verified.verified||!cred?.id||!cred?.publicKey)return jsonFail(res,'Não foi possível validar a biometria.');
   const transports=Array.isArray(req.body.credential?.response?.transports)
     ?req.body.credential.response.transports.filter(x=>typeof x==='string').slice(0,10):[];
   const label=String(req.body?.label||'Android / Passkey').trim().slice(0,64)||'Dispositivo';
   db.prepare('INSERT INTO duit_admin_passkeys(id,user_id,public_key,counter,transports,label) VALUES (?,?,?,?,?,?)')
    .run(cred.id,user.id,Buffer.from(cred.publicKey).toString('base64url'),cred.counter||0,JSON.stringify(transports),label);
   res.json({ok:true});
  }catch(e){console.warn('[passkey] reg verify',e.message);jsonFail(res,'Não foi possível confirmar a passkey.');}
 });
 router.delete('/register/:id',requireAdmin,(req,res)=>{
  const row=db.prepare('DELETE FROM duit_admin_passkeys WHERE id=? AND user_id=?').run(req.params.id,req.user.id);
  res.json({ok:row.changes>0});
 });
 router.post('/login/options',limitLogin,async(req,res)=>{
  try{
   // Sem email: pedir ao Android uma passkey detetável deste domínio.
   // O servidor identifica o administrador através do ID da credencial assinada.
   const email=String(req.body?.email||'').trim().toLowerCase().slice(0,254);
   // Preferir a credencial já utilizada neste navegador quando indicada.
   // É apenas um identificador público, nunca substitui a assinatura WebAuthn.
   const preferredId=typeof req.body?.credentialId==='string' && req.body.credentialId.length<=1024
     ?req.body.credentialId:'';
   let user=null,credentials=null;
   if(!email && preferredId){
     const previous=db.prepare(`SELECT k.id,k.transports,k.user_id
       FROM duit_admin_passkeys k JOIN users u ON u.id=k.user_id
       WHERE k.id=? AND u.role='admin' AND COALESCE(u.is_active,1)<>0`).get(preferredId);
     if(previous){
       user=adminById(previous.user_id);
       credentials=[previous];
     }
   }
   if(email){
     user=db.prepare("SELECT id,email FROM users WHERE lower(email)=? AND role='admin' AND COALESCE(is_active,1)<>0").get(email);
     credentials=user?db.prepare('SELECT id,transports FROM duit_admin_passkeys WHERE user_id=?').all(user.id):[];
     if(!credentials.length)return jsonFail(res,'Não existe biometria registada para esta conta.');
   }else if(!credentials){
     const any=db.prepare("SELECT 1 FROM duit_admin_passkeys k JOIN users u ON u.id=k.user_id WHERE u.role='admin' AND COALESCE(u.is_active,1)<>0 LIMIT 1").get();
     if(!any)return jsonFail(res,'Ainda não existem passkeys de administrador registadas.');
   }
   const opts={rpID:RP_ID,userVerification:'required'};
   if(credentials)opts.allowCredentials=credentials.map(k=>({id:k.id,transports:JSON.parse(k.transports)}));
   const options=await generateAuthenticationOptions(opts);
   res.json({options,challengeId:newChallenge(user?.id??null,'login',options.challenge),
     userId:user?.id??null});
  }catch(e){console.warn('[passkey] login options',e.message);jsonFail(res,'Não foi possível iniciar a autenticação.',500);}
 });
 router.post('/login/verify',limitLogin,async(req,res)=>{
  try{
   // Sem email, a identificação vem da passkey e é confirmada pela assinatura.
   const assertedUserId=req.body?.userId==null?null:Number(req.body.userId);
   const credentialId=String(req.body?.credential?.id||'');
   const key=db.prepare('SELECT * FROM duit_admin_passkeys WHERE id=?').get(credentialId);
   const user=key?adminById(key.user_id):null;
   const expectedChallenge=takeChallenge(req.body?.challengeId,assertedUserId,'login');
   if(!expectedChallenge)return jsonFail(res,'A autenticação expirou. Tente novamente.',401);
   if(assertedUserId!==null && (!key||key.user_id!==assertedUserId))
     return jsonFail(res,'Passkey não corresponde ao administrador.',401);
   if(!key||!user)return jsonFail(res,'Passkey não reconhecida.',401);
   const verification=await verifyAuthenticationResponse({
     response:req.body.credential,expectedChallenge,expectedOrigin:EXPECTED_ORIGIN,expectedRPID:RP_ID,
     credential:{
       id:key.id,
       publicKey:new Uint8Array(Buffer.from(key.public_key,'base64url')),
       counter:key.counter,
       transports:JSON.parse(key.transports)
     },
     requireUserVerification:true
   });
   if(!verification.verified)return jsonFail(res,'Autenticação não confirmada.',401);
   db.prepare('UPDATE duit_admin_passkeys SET counter=?,last_used_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?')
    .run(verification.authenticationInfo.newCounter,key.id,user.id);
   setAuthCookie(res,signToken(user));
   res.json({ok:true,role:'admin'});
  }catch(e){console.warn('[passkey] login verify',e.message);jsonFail(res,'A impressão digital ou reconhecimento facial não foi validado.',401);}
 });
 app.use('/api/auth/passkeys',router);
}
module.exports={register};
