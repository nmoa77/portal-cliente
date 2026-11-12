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
`);
try {
  const cols = db.prepare("PRAGMA table_info(duit_social_stories)").all();
  if (!cols.some(c => c.name === 'notified_at')) db.exec("ALTER TABLE duit_social_stories ADD COLUMN notified_at TEXT");
} catch (error) { console.error('[duit-social] migration:', error); }

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
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    && Number.isFinite(Date.parse(value));
}
function originOk(req, res, next) {
  const origin = req.get('origin');
  if (origin && new URL(origin).host !== req.get('host')) return res.status(403).json({error:'Origem não autorizada'});
  next();
}
function register(app) {
  const router = express.Router();
  router.use(requireAdmin);
  router.use(originOk);

  router.get('/push/public-key', (req, res) => {
    const config = vapidConfig();
    res.json({ enabled: !!config, publicKey: config?.pub.toString('base64url') || null });
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
    const { client_id, scheduled_at, status = 'draft' } = req.body || {};
    if (!Number.isInteger(Number(client_id)) || !validSchedule(scheduled_at))
      return res.status(400).json({error:'Cliente e data/hora com fuso horário são obrigatórios'});
    if (!['draft','scheduled'].includes(status))
      return res.status(400).json({error:'Estado inválido'});
    const client = db.prepare("SELECT id FROM users WHERE id=? AND role='client'").get(Number(client_id));
    if (!client) return res.status(400).json({error:'Cliente inválido'});
    const result = db.prepare('INSERT INTO duit_social_stories(client_id,scheduled_at,status) VALUES (?,?,?)')
      .run(client.id, new Date(scheduled_at).toISOString(), status);
    res.status(201).json(publicRow(findStory(result.lastInsertRowid)));
  });

  // O browser envia o ficheiro bruto (sem multipart), para evitar dependências adicionais.
  router.put('/stories/:id/media', express.raw({type: () => true, limit:'80mb'}), (req, res) => {
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
      res.json(publicRow(findStory(story.id)));
    } catch (e) {
      try { fs.unlinkSync(target); } catch (_) {}
      console.error('[duit-social] upload:', e.message);
      res.status(500).json({error:'Não foi possível guardar o ficheiro'});
    }
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
          ORDER BY s.scheduled_at ASC LIMIT 30`).all();
        const subscribers=db.prepare('SELECT endpoint,subscription_json FROM duit_social_push_subscriptions').all();
        if(!subscribers.length)return;
        for(const story of due) {
          let sent=0;
          for(const row of subscribers) {
            try{
              await sendPush(JSON.parse(row.subscription_json),{
                title:'DUIT · Story pronta',
                body:(story.company||story.name)+' · Está na hora de publicar no Instagram.',
                url:'/social-stories.html?story='+story.id
              });
              sent++;
            }catch(e){
              if([404,410].includes(e.status))
                db.prepare('DELETE FROM duit_social_push_subscriptions WHERE endpoint=?').run(row.endpoint);
              else console.warn('[duit-social] push:',e.message);
            }
          }
          // Retry quando nenhum dispositivo recebeu. Se houve entregas, não
          // repetir em todos os dispositivos a cada minuto.
          if(sent) db.prepare("UPDATE duit_social_stories SET notified_at=datetime('now') WHERE id=? AND notified_at IS NULL").run(story.id);
        }
      }catch(e){console.error('[duit-social] reminder job:',e);}
      finally{busy=false;}
    };
    const timer=setInterval(checkDue,60*1000);timer.unref?.();
    setTimeout(checkDue,2000).unref?.();
  }
}
module.exports = { register };
