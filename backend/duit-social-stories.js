// DUIT Social — fase 1: Stories preparadas para partilha manual no Android.
// Não publica na Meta, não envia push e não elimina ficheiros sem confirmação.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const db = require('./db');
const { requireAdmin } = require('./auth');
const { sendPush, vapidConfig } = require('./duit-web-push');

const mediaDir = process.env.DUIT_SOCIAL_MEDIA_DIR ||
  path.join(path.dirname(process.env.DATABASE_PATH || path.join(__dirname, 'portal.db')), 'duit-social-media');
fs.mkdirSync(mediaDir, { recursive: true });

db.exec(`
CREATE TABLE IF NOT EXISTS duit_social_stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES users(id),
  media_name TEXT,
  media_mime TEXT,
  scheduled_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','scheduled','ready','published')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  published_at TEXT,
  notified_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_duit_social_stories_schedule
  ON duit_social_stories (status, scheduled_at);

CREATE TABLE IF NOT EXISTS duit_social_push_subscriptions (
  endpoint TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS duit_push_delivery_receipts (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  story_id INTEGER,
  accepted_at TEXT,
  received_at TEXT,
  shown_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_duit_push_receipts_user ON duit_push_delivery_receipts(user_id,created_at);
`);
try {
  const cols = db.prepare("PRAGMA table_info(duit_social_stories)").all();
  if (!cols.some(c => c.name === 'notified_at')) db.exec("ALTER TABLE duit_social_stories ADD COLUMN notified_at TEXT");
} catch (error) { console.error('[duit-social] migration:', error); }

// Limpeza de segurança: ficheiros que ficaram no disco depois de uma falha
// são removidos apenas se não estiverem referenciados e tiverem >24 horas.
function cleanupOrphanMedia() {
  const rows=db.prepare('SELECT id,media_name FROM duit_social_stories WHERE media_name IS NOT NULL').all();
  const referenced=new Set(rows.map(r=>String(r.id)+'-'+r.media_name));
  const cutoff=Date.now()-24*60*60*1000;
  for(const name of fs.readdirSync(mediaDir)) {
    if(!/^\\d+-[a-f0-9]{32}\\.(?:jpg|png|webp|mp4)$/.test(name))continue;
    if(referenced.has(name))continue;
    try{
      const full=path.join(mediaDir,name);
      if(fs.statSync(full).mtimeMs<cutoff) fs.unlinkSync(full);
    }catch(e){console.warn('[duit-social] orphan cleanup:',e.message);}
  }
}

function filePath(id, name) {
  return path.join(mediaDir, String(id) + '-' + name);
}
function findStory(id) {
  return db.prepare(`SELECT s.*, u.name AS client_name, u.company AS client_company
    FROM duit_social_stories s JOIN users u ON u.id=s.client_id
    WHERE s.id=?`).get(id);
}
function publicRow(row) {
  if (!row) return null;
  const { media_name, ...rest } = row;
  return { ...rest, has_media: Boolean(media_name), media_url: media_name ? '/api/duit-social/stories/' + row.id + '/media' : null };
}
function validSchedule(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    && Number.isFinite(Date.parse(value));
}
function originOk(req, res, next) {
  const origin = req.get('origin');
  if (origin && new URL(origin).host !== req.get('host')) return res.status(403).json({error:'Origem não autorizada'});
  next();
}
// Envia a notificação apenas depois de a Story estar integralmente guardada.
async function notifyReadyStory(story,userId){
  let notification={sent:0,total:0};
  if(story.status==='ready' && !story.notified_at && vapidConfig()){
        const subscriptions=db.prepare('SELECT endpoint,subscription_json FROM duit_social_push_subscriptions WHERE user_id=?').all(userId);
        notification.total=subscriptions.length;
        for(const row of subscriptions){
          try{
            await sendPush(JSON.parse(row.subscription_json),{
              title:'DUIT · Story pronta para partilhar',
              body:(story.client_company||story.client_name||'DUIT')+' · Abra a Story no Android e publique no Instagram.',
              url:'/social-stories.html?story='+story.id,
              type:'story', notification_id:crypto.randomUUID()
            });
            notification.sent++;
          }catch(err){
            if([404,410].includes(err.status)){
              db.prepare('DELETE FROM duit_social_push_subscriptions WHERE endpoint=? AND user_id=?').run(row.endpoint,userId);
            }else console.warn('[duit-social] push imediato:',err.message);
          }
        }
        if(notification.sent)db.prepare("UPDATE duit_social_stories SET notified_at=datetime('now') WHERE id=? AND notified_at IS NULL").run(story.id);
      }

  return notification;
}
function register(app) {
  const router = express.Router();
  // O ficheiro assinado é validado exclusivamente pelo publicador.
  // Ignorar este router de Stories só para a rota específica da Meta.
  router.use((req,res,next)=>{
    if(req.method==='GET' && /^\/publisher\/media\/[1-9]\d*$/.test(req.path))
      return next('router');
    return requireAdmin(req,res,next);
  });
  router.use(originOk);

  router.get('/push/public-key', (req, res) => {
    const config = vapidConfig();
    res.json({ enabled: !!config, publicKey: config?.pub.toString('base64url') || null });
  });

  // A confirmação vem do Service Worker do Android, não do serviço Push.
  // Um UUID imprevisível por envio evita expor subscrições ou credenciais.
  router.post('/push/receipt', express.json({limit:'2kb'}), (req,res)=>{
    const id=String(req.body?.id||'');
    const phase=req.body?.phase;
    if(!/^[0-9a-f-]{36}$/.test(id)||!['received','shown'].includes(phase))
      return res.status(400).json({error:'Confirmação inválida'});
    const field=phase==='received'?'received_at':'shown_at';
    const updated=db.prepare(`UPDATE duit_push_delivery_receipts SET ${field}=datetime('now')
      WHERE id=? AND ${field} IS NULL`).run(id);
    if(phase==='shown' && updated.changes){
      // Só agora o Android confirmou que a notificação foi criada.
      // Evita considerar concluído um lembrete apenas aceite pelo serviço Push.
      const row=db.prepare('SELECT story_id FROM duit_push_delivery_receipts WHERE id=?').get(id);
      if(row?.story_id)db.prepare(`UPDATE duit_social_stories SET notified_at=datetime('now')
        WHERE id=? AND status='ready' AND notified_at IS NULL`).run(row.story_id);
    }
    res.json({ok:updated.changes>0});
  });
  router.get('/push/receipts/:id', (req,res)=>{
    const id=String(req.params.id||'');
    if(!/^[0-9a-f-]{36}$/.test(id))return res.status(400).json({error:'ID inválido'});
    const row=db.prepare('SELECT accepted_at,received_at,shown_at FROM duit_push_delivery_receipts WHERE id=? AND user_id=?')
      .get(id,req.user.id);
    if(!row)return res.status(404).json({error:'Envio não encontrado'});
    res.set('Cache-Control','no-store');
    res.json({accepted:!!row.accepted_at,received:!!row.received_at,shown:!!row.shown_at});
  });

  router.post('/push/subscribe', (req, res) => {
    const sub = req.body?.subscription;
    try {
      const url = new URL(sub?.endpoint);
      if (url.protocol !== 'https:' || !url.hostname || String(sub?.endpoint).length > 1500 ||
          !sub?.keys?.p256dh || !sub?.keys?.auth ||
          Buffer.from(sub.keys.p256dh,'base64url').length !== 65 ||
          Buffer.from(sub.keys.auth,'base64url').length !== 16) {
        return res.status(400).json({error:'Subscrição Push inválida'});
      }
      const minimal = {endpoint:url.href,keys:{p256dh:sub.keys.p256dh,auth:sub.keys.auth}};
      db.prepare(`INSERT INTO duit_social_push_subscriptions(endpoint,user_id,subscription_json)
        VALUES(?,?,?) ON CONFLICT(endpoint) DO UPDATE SET user_id=excluded.user_id,subscription_json=excluded.subscription_json`)
        .run(url.href, req.user.id, JSON.stringify(minimal));
      res.json({ok:true});
    } catch (_) {res.status(400).json({error:'Subscrição Push inválida'});}
  });

  router.post('/push/unsubscribe', (req, res) => {
    const endpoint = String(req.body?.endpoint || '');
    db.prepare('DELETE FROM duit_social_push_subscriptions WHERE endpoint=? AND user_id=?')
      .run(endpoint,req.user.id);
    res.json({ok:true});
  });

  router.get('/push/status', (req,res) => {
    const configured=!!vapidConfig();
    const remindersEnabled=process.env.DUIT_SOCIAL_REMINDERS_ENABLED==='true';
    const registered=db.prepare('SELECT COUNT(*) AS count FROM duit_social_push_subscriptions WHERE user_id=?').get(req.user.id).count;
    res.set('Cache-Control','no-store');
    res.json({configured,remindersEnabled,registered,ready:configured&&remindersEnabled&&registered>0});
  });

  router.post('/push/test', async (req, res) => {
    const subscriptions=db.prepare('SELECT endpoint, subscription_json FROM duit_social_push_subscriptions WHERE user_id=?').all(req.user.id);
    if (!vapidConfig()) return res.status(503).json({error:'Chaves VAPID em falta'});
    let delivered=0;
    for(const row of subscriptions) {
      try {await sendPush(JSON.parse(row.subscription_json),{title:'DUIT · Notificações ativas',body:'O Android já pode receber alertas de Stories.',url:'/social-stories.html'});delivered++;}
      catch(err) {
        if ([404,410].includes(err.status)) db.prepare('DELETE FROM duit_social_push_subscriptions WHERE endpoint=?').run(row.endpoint);
      }
    }
    res.json({delivered,total:subscriptions.length});
  });

  router.get('/stories', (req, res) => {
    const rows = db.prepare(`SELECT s.*, u.name AS client_name, u.company AS client_company
      FROM duit_social_stories s JOIN users u ON u.id=s.client_id
      ORDER BY s.scheduled_at DESC LIMIT 300`).all();
    res.json(rows.map(publicRow));
  });

  router.post('/stories', (req, res) => {
    const { client_id, scheduled_at, status = 'draft', immediate = false } = req.body || {};
    const clientId=Number(client_id);
    if (!Number.isSafeInteger(clientId)||clientId<=0)
      return res.status(400).json({error:'Selecione um cliente válido'});
    if (immediate !== true && !validSchedule(scheduled_at))
      return res.status(400).json({error:'Selecione uma data e hora válidas para agendar'});
    if (immediate !== true && !['draft','scheduled'].includes(status))
      return res.status(400).json({error:'Estado inválido'});
    const client = db.prepare("SELECT id FROM users WHERE id=? AND role='client'").get(clientId);
    if (!client) return res.status(400).json({error:'Cliente inválido'});
    // Partilhar agora prepara para o Android, sem publicar na Meta.
    const storyDate=immediate===true?new Date().toISOString():new Date(scheduled_at).toISOString();
    const initialStatus=immediate===true?'ready':status;
    const result = db.prepare('INSERT INTO duit_social_stories(client_id,scheduled_at,status) VALUES (?,?,?)')
      .run(client.id, storyDate, initialStatus);
    const record=publicRow(findStory(result.lastInsertRowid));
    // Agendar não significa que existam dispositivos a receber alertas.
    // Expor este risco de imediato sem cancelar ou alterar a Story.
    const registered=db.prepare('SELECT COUNT(*) AS count FROM duit_social_push_subscriptions').get().count;
    const remindersEnabled=process.env.DUIT_SOCIAL_REMINDERS_ENABLED==='true';
    res.status(201).json({...record,
      reminder_ready:!!vapidConfig()&&remindersEnabled&&registered>0,
      reminder_warning:immediate===true?null:
        !remindersEnabled?'Os lembretes automáticos não estão ativos no servidor.':
        !vapidConfig()?'A configuração de notificações está incompleta no servidor.':
        !registered?'Nenhum Android está registado para receber notificações. Ative e teste antes do horário agendado.':
        null
    });
  });

  // O browser envia o ficheiro bruto (sem multipart), para evitar dependências adicionais.
  router.put('/stories/:id/media', express.raw({type: () => true, limit:'80mb'}), async (req, res) => {
    const story = findStory(Number(req.params.id));
    if (!story) return res.status(404).json({error:'Story não encontrada'});
    if (story.status === 'published') return res.status(409).json({error:'Story já publicada'});
    const mime = String(req.get('content-type') || '').split(';')[0].toLowerCase();
    const extensions = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp','video/mp4':'mp4'};
    const ext = extensions[mime];
    if (!ext || !Buffer.isBuffer(req.body) || req.body.length < 1)
      return res.status(400).json({error:'Escolha JPG, PNG, WEBP ou MP4 válido'});
    // Não confiar apenas no MIME enviado pelo navegador.
    const magic = req.body;
    const signatureOk = (
      (mime === 'image/jpeg' && magic.length >= 3 && magic[0] === 0xff && magic[1] === 0xd8 && magic[2] === 0xff) ||
      (mime === 'image/png' && magic.length >= 8 && magic.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex'))) ||
      (mime === 'image/webp' && magic.length >= 12 && magic.toString('ascii',0,4)==='RIFF' && magic.toString('ascii',8,12)==='WEBP') ||
      (mime === 'video/mp4' && magic.length >= 12 && magic.toString('ascii',4,8)==='ftyp')
    );
    if (!signatureOk) return res.status(400).json({error:'O ficheiro não corresponde ao formato selecionado'});
    const name = crypto.randomBytes(16).toString('hex') + '.' + ext;
    const target = filePath(story.id, name);
    try {
      fs.writeFileSync(target, req.body, { flag:'wx' });
      db.prepare('UPDATE duit_social_stories SET media_name=?, media_mime=? WHERE id=?').run(name, mime, story.id);
      if (story.media_name) {
        try { fs.unlinkSync(filePath(story.id, story.media_name)); } catch (_) {}
      }
      const notification=await notifyReadyStory(story,req.user.id);
      res.json({...publicRow(findStory(story.id)),notification});
    } catch (e) {
      try { fs.unlinkSync(target); } catch (_) {}
      console.error('[duit-social] upload:', e.message);
      res.status(500).json({error:'Não foi possível guardar o ficheiro'});
    }
  });

  // Upload de vídeos Story até 300 MB, por partes sequenciais de 5 MB.
  // O ficheiro definitivo e a notificação só são criados no último passo.
  const STORY_MAX=300*1024*1024;
  const STORY_PART=5*1024*1024;
  function storyChunkContext(req,res){
    const id=Number(req.params.id),uploadId=String(req.params.uploadId||'');
    const story=Number.isSafeInteger(id)&&id>0?findStory(id):null;
    if(!story)return res.status(404).json({error:'Story não encontrada'}),null;
    if(story.status==='published')return res.status(409).json({error:'Story já publicada'}),null;
    if(!/^[0-9a-f-]{36}$/.test(uploadId))return res.status(400).json({error:'Identificador de upload inválido'}),null;
    const temp=filePath(id,'upload-'+uploadId+'.part');
    return {story,temp};
  }
  router.put('/stories/:id/media/chunks/:uploadId/:index',express.raw({type:()=>true,limit:'6mb'}),(req,res)=>{
    const ctx=storyChunkContext(req,res);if(!ctx)return;
    const declared=Number(req.get('x-duit-file-size')),index=Number(req.params.index);
    if(!Number.isSafeInteger(declared)||declared<=0||declared>STORY_MAX)
      return res.status(413).json({error:'Vídeo Story até 300 MB.'});
    const parts=Math.ceil(declared/STORY_PART);
    if(!Number.isInteger(index)||index<0||index>=parts)return res.status(400).json({error:'Parte inválida'});
    const offset=index*STORY_PART,expected=Math.min(STORY_PART,declared-offset);
    if(!Buffer.isBuffer(req.body)||req.body.length!==expected)
      return res.status(400).json({error:'Parte incompleta. Tente novamente.'});
    let fd;
    try{
      const current=fs.existsSync(ctx.temp)?fs.statSync(ctx.temp).size:0;
      if(current===offset+expected)return res.json({ok:true,part:index,alreadyReceived:true});
      if(current!==offset)return res.status(409).json({error:'As partes do vídeo devem ser enviadas por ordem.'});
      if(index===0&&req.body.toString('ascii',4,8)!=='ftyp')
        return res.status(400).json({error:'O vídeo deve ser um MP4 válido.'});
      fd=fs.openSync(ctx.temp,index===0?'wx':'r+');
      fs.writeSync(fd,req.body,0,req.body.length,offset);
      fs.closeSync(fd);fd=null;
      res.json({ok:true,part:index});
    }catch(e){
      if(fd!=null)try{fs.closeSync(fd);}catch(_){}
      console.error('[duit-social] upload Story por partes:',e.message);
      res.status(500).json({error:'Não foi possível guardar esta parte do vídeo.'});
    }
  });
  router.post('/stories/:id/media/chunks/:uploadId/complete',async(req,res)=>{
    const ctx=storyChunkContext(req,res);if(!ctx)return;
    const declared=Number(req.body?.size);
    if(!Number.isSafeInteger(declared)||declared<=0||declared>STORY_MAX)
      return res.status(413).json({error:'Vídeo Story até 300 MB.'});
    if(!fs.existsSync(ctx.temp)||fs.statSync(ctx.temp).size!==declared)
      return res.status(409).json({error:'Upload incompleto: a Story não foi substituída.'});
    const fd=fs.openSync(ctx.temp,'r'),magic=Buffer.alloc(12);
    const n=fs.readSync(fd,magic,0,12,0);fs.closeSync(fd);
    if(n<12||magic.toString('ascii',4,8)!=='ftyp')
      return res.status(400).json({error:'O ficheiro não é um MP4 válido.'});
    const name=crypto.randomBytes(16).toString('hex')+'.mp4';
    const target=filePath(ctx.story.id,name);
    try{
      fs.renameSync(ctx.temp,target);
      db.prepare('UPDATE duit_social_stories SET media_name=?,media_mime=? WHERE id=?')
        .run(name,'video/mp4',ctx.story.id);
      if(ctx.story.media_name)try{fs.unlinkSync(filePath(ctx.story.id,ctx.story.media_name));}catch(_){}
      const notification=await notifyReadyStory(ctx.story,req.user.id);
      res.json({...publicRow(findStory(ctx.story.id)),notification});
    }catch(e){
      console.error('[duit-social] finalizar Story:',e.message);
      // Se a base de dados foi atualizada, o ficheiro mantém-se acessível.
      res.status(500).json({error:'Não foi possível concluir o upload da Story.'});
    }
  });

  // Reenvio intencional para uma Story já guardada, sem voltar a criar conteúdo.
  router.post('/stories/:id/notify', async (req,res)=>{
    const id=Number(req.params.id);
    if(!Number.isSafeInteger(id)||id<=0)return res.status(400).json({error:'Story inválida'});
    const story=findStory(id);
    if(!story||!story.media_name)return res.status(404).json({error:'Story ou ficheiro indisponível'});
    if(story.status!=='ready')return res.status(409).json({error:'Apenas Stories prontas podem enviar aviso imediato'});
    if(!vapidConfig())return res.status(503).json({error:'Notificações ainda não configuradas'});
    const subscriptions=db.prepare('SELECT endpoint,subscription_json FROM duit_social_push_subscriptions WHERE user_id=?').all(req.user.id);
    let sent=0;
    const receiptIds=[];
    db.prepare("DELETE FROM duit_push_delivery_receipts WHERE created_at<datetime('now','-3 days')").run();
    for(const row of subscriptions){
      const notificationId=crypto.randomUUID();
      db.prepare('INSERT INTO duit_push_delivery_receipts(id,user_id,story_id) VALUES(?,?,?)')
        .run(notificationId,req.user.id,story.id);
      try{
        await sendPush(JSON.parse(row.subscription_json),{
          title:'DUIT · Story pronta para partilhar',
          body:(story.client_company||story.client_name||'DUIT')+' · Abra a Story no Android e publique no Instagram.',
          url:'/social-stories.html?story='+story.id,
          type:'story', notification_id:notificationId
        });
        sent++;
        receiptIds.push(notificationId);
        db.prepare("UPDATE duit_push_delivery_receipts SET accepted_at=datetime('now') WHERE id=?").run(notificationId);
      }catch(error){
        db.prepare('DELETE FROM duit_push_delivery_receipts WHERE id=?').run(notificationId);
        if([404,410].includes(error.status))
          db.prepare('DELETE FROM duit_social_push_subscriptions WHERE endpoint=? AND user_id=?').run(row.endpoint,req.user.id);
        else console.warn('[duit-social] reenvio push:',error.message);
      }
    }
    if(sent)db.prepare("UPDATE duit_social_stories SET notified_at=datetime('now') WHERE id=? AND notified_at IS NULL").run(story.id);
    res.json({sent,total:subscriptions.length,receiptIds});
  });

  router.get('/stories/:id/media', (req, res) => {
    const story = findStory(Number(req.params.id));
    if (!story || !story.media_name) return res.status(404).json({error:'Ficheiro indisponível'});
    res.set('Cache-Control','private, no-store');
    res.type(story.media_mime);
    res.sendFile(filePath(story.id, story.media_name));
  });

  router.patch('/stories/:id', (req, res) => {
    const story = findStory(Number(req.params.id));
    if (!story) return res.status(404).json({error:'Story não encontrada'});
    const status = String(req.body?.status || '');
    if (!['draft','scheduled','ready','published'].includes(status))
      return res.status(400).json({error:'Estado inválido'});
    if (status === 'published' && !story.media_name)
      return res.status(400).json({error:'A Story não tem ficheiro'});
    if (story.status === 'published') return res.status(409).json({error:'Story já concluída'});
    // Uma Story só fica 'published' após confirmação manual de quem a publicou.
    if (status === 'published') {
      db.prepare("UPDATE duit_social_stories SET status='published', published_at=datetime('now'), media_name=NULL, media_mime=NULL WHERE id=?").run(story.id);
      try { fs.unlinkSync(filePath(story.id, story.media_name)); }
      catch (e) { console.warn('[duit-social] media pendente de limpeza:', e.message); }
    } else {
      db.prepare('UPDATE duit_social_stories SET status=? WHERE id=?').run(status, story.id);
    }
    res.json(publicRow(findStory(story.id)));
  });

  router.delete('/stories/:id', (req, res) => {
    const story = findStory(Number(req.params.id));
    if (!story) return res.status(404).json({error:'Story não encontrada'});
    db.prepare('DELETE FROM duit_social_stories WHERE id=?').run(story.id);
    if (story.media_name) try { fs.unlinkSync(filePath(story.id, story.media_name)); } catch (_) {}
    res.json({ok:true});
  });
  app.use('/api/duit-social', router);
  try {cleanupOrphanMedia();} catch(error) {console.warn('[duit-social] orphan cleanup:',error.message);}


  // Só uma instância do worker por base de dados. Configurar apenas um processo
  // do Railway com DUIT_SOCIAL_REMINDERS_ENABLED=true.
  if (process.env.DUIT_SOCIAL_REMINDERS_ENABLED === 'true') {
    let busy=false;
    const checkDue = async () => {
      if(busy) return;
      busy=true;
      try {
        const now = new Date().toISOString();
        db.prepare(`UPDATE duit_social_stories SET status='ready'
          WHERE status='scheduled' AND media_name IS NOT NULL AND scheduled_at<=?`).run(now);
        const config=vapidConfig();
        if(!config)return;
        const due=db.prepare(`SELECT s.id,s.client_id,s.scheduled_at,u.name,u.company
          FROM duit_social_stories s JOIN users u ON u.id=s.client_id
          WHERE s.status='ready' AND s.notified_at IS NULL AND s.media_name IS NOT NULL
            AND datetime(s.scheduled_at)>=datetime('now','-15 minutes')
          ORDER BY s.scheduled_at ASC LIMIT 30`).all();
        const subscribers=db.prepare('SELECT endpoint,subscription_json FROM duit_social_push_subscriptions').all();
        if(!subscribers.length){
          if(due.length)console.warn('[duit-social] lembretes sem Android registado:',due.length);
          return;
        }
        db.prepare("DELETE FROM duit_push_delivery_receipts WHERE created_at<datetime('now','-3 days')").run();
        for(const story of due){
          // Confirmações feitas pelo Android em envios anteriores.
          const existing=db.prepare(`SELECT COUNT(*) attempts,
              MAX(accepted_at) last_accepted,
              SUM(CASE WHEN shown_at IS NOT NULL THEN 1 ELSE 0 END) shown
            FROM duit_push_delivery_receipts WHERE story_id=?`).get(story.id);
          if(existing.shown>0){
            db.prepare("UPDATE duit_social_stories SET notified_at=datetime('now') WHERE id=? AND notified_at IS NULL").run(story.id);
            continue;
          }
          // No máximo 3 tentativas, com intervalo mínimo de 2 minutos.
          // Não repetir incessantemente se o Android estiver offline.
          if(existing.attempts>=3){
            console.warn('[duit-social] Story '+story.id+': 3 tentativas sem confirmação do Android; alerta pendente de verificação');
            continue;
          }
          if(existing.last_accepted && Date.now()-Date.parse(existing.last_accepted.replace(' ','T')+'Z')<120000)continue;
          let sent=0;
          for(const row of subscribers){
            const id=crypto.randomUUID();
            db.prepare('INSERT INTO duit_push_delivery_receipts(id,user_id,story_id) VALUES(?,?,?)')
              .run(id,Number(db.prepare('SELECT user_id FROM duit_social_push_subscriptions WHERE endpoint=?').get(row.endpoint).user_id),story.id);
            try{
              await sendPush(JSON.parse(row.subscription_json),{
                title:'DUIT · Story pronta',
                body:(story.company||story.name)+' · Está na hora de publicar no Instagram.',
                url:'/social-stories.html?story='+story.id,
                type:'story',notification_id:id
              });
              db.prepare("UPDATE duit_push_delivery_receipts SET accepted_at=datetime('now') WHERE id=?").run(id);
              sent++;
            }catch(e){
              db.prepare('DELETE FROM duit_push_delivery_receipts WHERE id=?').run(id);
              if([404,410].includes(e.status))
                db.prepare('DELETE FROM duit_social_push_subscriptions WHERE endpoint=?').run(row.endpoint);
              else console.warn('[duit-social] lembrete Story '+story.id+': '+e.message);
            }
          }
          console.info('[duit-social] lembrete Story '+story.id+': serviço Push aceitou '+sent+'/'+subscribers.length+
            '; a aguardar confirmação do Android antes de concluir');
        }
      }catch(e){console.error('[duit-social] reminder job:',e);}
      finally{busy=false;}
    };
    const timer=setInterval(checkDue,60*1000);timer.unref?.();
    setTimeout(checkDue,2000).unref?.();
  }
}
module.exports = { register };
