// DUIT Social — fase 1: Stories preparadas para partilha manual no Android.
// Não publica na Meta, não envia push e não elimina ficheiros sem confirmação.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const db = require('./db');
const { requireAdmin } = require('./auth');

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
  published_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_duit_social_stories_schedule
  ON duit_social_stories (status, scheduled_at);
`);

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
}
module.exports = { register };
