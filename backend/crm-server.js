const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const express = require('express');
const db = require('./db');
const { requireAdmin } = require('./auth');

/*
 * Camada adicional de prospeção comercial DUIT.
 *
 * Mantém o server.js original intacto e acrescenta:
 * - persistência de dados comerciais de prospects;
 * - API CRUD /api/crm/prospects;
 * - injeção do módulo frontend prospects-crm.js no painel admin.
 */

const originalStatic = express.static;
const originalListen = express.application.listen;
let capturedApp = null;
let capturedListenArgs = null;

express.static = function patchedStatic(root, options) {
  const middleware = originalStatic(root, options);
  const adminPath = path.join(root, 'admin.html');

  return function duitStatic(req, res, next) {
    if (req.path !== '/admin.html') return middleware(req, res, next);

    fs.readFile(adminPath, 'utf8', (err, html) => {
      if (err) return middleware(req, res, next);
      const script = '<script src="/js/prospects-crm.js?v=20260904m"></script>';
      const output = html.includes('/js/prospects-crm.js')
        ? html
        : html.replace('</body>', `  ${script}\n</body>`);
      res.type('html').send(output);
    });
  };
};

express.application.listen = function captureListen(...args) {
  capturedApp = this;
  capturedListenArgs = args;
  return { close() {} };
};

require('./server');

express.static = originalStatic;
express.application.listen = originalListen;

if (!capturedApp || !capturedListenArgs) {
  throw new Error('Não foi possível inicializar o portal DUIT com a camada CRM.');
}

db.exec(`
CREATE TABLE IF NOT EXISTS prospect_crm (
  user_id INTEGER PRIMARY KEY,
  sector TEXT,
  location TEXT,
  website TEXT,
  instagram TEXT,
  opportunity TEXT,
  idea TEXT,
  recommended_plan TEXT,
  solution_text TEXT,
  monthly_value REAL DEFAULT 0,
  offer_value REAL DEFAULT 0,
  lead_status TEXT NOT NULL DEFAULT 'por_contactar',
  priority TEXT NOT NULL DEFAULT 'possivel',
  first_contact_at TEXT,
  follow_up_at TEXT,
  notes TEXT,
  proposal_email TEXT,
  ebook_page_id INTEGER,
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_prospect_crm_status ON prospect_crm(lead_status);
CREATE INDEX IF NOT EXISTS idx_prospect_crm_priority ON prospect_crm(priority);
`);
const crmCols=db.prepare(`PRAGMA table_info(prospect_crm)`).all().map(c=>c.name);
if(!crmCols.includes('ebook_page_id')) db.exec(`ALTER TABLE prospect_crm ADD COLUMN ebook_page_id INTEGER`);

const allowedStatuses = new Set([
  'por_contactar', 'contactado', 'respondeu', 'interessado',
  'proposta', 'sem_resposta', 'sem_interesse'
]);
const allowedPriorities = new Set(['atacar', 'possivel', 'nao_prioritario']);
const allowedPlans = new Set(['base', 'intermedio', 'premium', 'personalizado', '']);

function clean(value, max = 4000) {
  if (value === undefined || value === null) return null;
  return String(value).trim().slice(0, max);
}

function asMoney(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? +n.toFixed(2) : 0;
}

function randomPasswordHash() {
  return bcrypt.hashSync(crypto.randomBytes(18).toString('base64url'), 10);
}

function validEbookPageId(value){
  const id=Number(value||0);if(!id)return null;
  try{return db.prepare(`SELECT id FROM ebook_pages WHERE id=?`).get(id)?id:null}catch(_){return null}
}

function getCrmProspect(id) {
  return db.prepare(`
    SELECT u.id, u.name, u.email, u.company, u.phone, u.created_at,
           c.sector, c.location, c.website, c.instagram,
           c.opportunity, c.idea, c.recommended_plan, c.solution_text,
           COALESCE(c.monthly_value,0) monthly_value,
           COALESCE(c.offer_value,0) offer_value,
           COALESCE(c.lead_status,'por_contactar') lead_status,
           COALESCE(c.priority,'possivel') priority,
           c.first_contact_at, c.follow_up_at, c.notes, c.proposal_email,
           c.ebook_page_id, c.updated_at,
           (SELECT COUNT(*) FROM quotes q WHERE q.user_id=u.id) quote_count,
           (SELECT COUNT(*) FROM quotes q WHERE q.user_id=u.id AND q.status='accepted') accepted_count
      FROM users u
      LEFT JOIN prospect_crm c ON c.user_id=u.id
     WHERE u.id=? AND u.role='client' AND u.is_prospect=1
  `).get(id);
}

capturedApp.get('/api/crm/prospects', requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT u.id, u.name, u.email, u.company, u.phone, u.created_at,
           c.sector, c.location, c.website, c.instagram,
           c.opportunity, c.idea, c.recommended_plan, c.solution_text,
           COALESCE(c.monthly_value,0) monthly_value,
           COALESCE(c.offer_value,0) offer_value,
           COALESCE(c.lead_status,'por_contactar') lead_status,
           COALESCE(c.priority,'possivel') priority,
           c.first_contact_at, c.follow_up_at, c.notes, c.proposal_email,
           c.ebook_page_id, c.updated_at,
           (SELECT COUNT(*) FROM quotes q WHERE q.user_id=u.id) quote_count,
           (SELECT COUNT(*) FROM quotes q WHERE q.user_id=u.id AND q.status='accepted') accepted_count
      FROM users u
      LEFT JOIN prospect_crm c ON c.user_id=u.id
     WHERE u.role='client' AND u.is_prospect=1
     ORDER BY
       CASE COALESCE(c.priority,'possivel')
         WHEN 'atacar' THEN 0 WHEN 'possivel' THEN 1 ELSE 2 END,
       COALESCE(c.updated_at, u.created_at) DESC
  `).all();
  res.json(rows);
});

capturedApp.get('/api/crm/prospects/stats', requireAdmin, (req, res) => {
  const row = db.prepare(`
    SELECT
      COUNT(*) total,
      SUM(CASE WHEN COALESCE(c.priority,'possivel')='atacar' THEN 1 ELSE 0 END) atacar,
      SUM(CASE WHEN COALESCE(c.lead_status,'por_contactar')='contactado' THEN 1 ELSE 0 END) contactados,
      SUM(CASE WHEN COALESCE(c.lead_status,'por_contactar') IN ('respondeu','interessado','proposta') THEN 1 ELSE 0 END) ativos,
      COALESCE(SUM(CASE WHEN COALESCE(c.lead_status,'por_contactar') NOT IN ('sem_interesse') THEN COALESCE(c.monthly_value,0) ELSE 0 END),0) valor_potencial
    FROM users u
    LEFT JOIN prospect_crm c ON c.user_id=u.id
    WHERE u.role='client' AND u.is_prospect=1
  `).get();
  res.json(row || { total: 0, atacar: 0, contactados: 0, ativos: 0, valor_potencial: 0 });
});

capturedApp.post('/api/crm/prospects', requireAdmin, (req, res) => {
  const body = req.body || {};
  const company = clean(body.company, 180);
  const name = clean(body.name, 180) || company;
  const email = clean(body.email, 240)?.toLowerCase();

  if (!company) return res.status(400).json({ error: 'Empresa obrigatória.' });
  if (!email) return res.status(400).json({ error: 'Email obrigatório.' });

  const exists = db.prepare('SELECT id, is_prospect FROM users WHERE lower(email)=lower(?)').get(email);
  if (exists) return res.status(409).json({ error: 'Já existe um utilizador com este email.' });

  const status = allowedStatuses.has(body.lead_status) ? body.lead_status : 'por_contactar';
  const priority = allowedPriorities.has(body.priority) ? body.priority : 'possivel';
  const plan = allowedPlans.has(body.recommended_plan || '') ? (body.recommended_plan || '') : '';
  const ebookPageId=validEbookPageId(body.ebook_page_id);

  const tx = db.transaction(() => {
    const u = db.prepare(`
      INSERT INTO users (name,email,password_hash,role,company,phone,is_prospect,is_active)
      VALUES (?,?,?,?,?,?,1,0)
    `).run(name, email, randomPasswordHash(), 'client', company, clean(body.phone, 80));

    db.prepare(`
      INSERT INTO prospect_crm (
        user_id,sector,location,website,instagram,opportunity,idea,
        recommended_plan,solution_text,monthly_value,offer_value,
        lead_status,priority,first_contact_at,follow_up_at,notes,proposal_email,ebook_page_id,updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))
    `).run(
      u.lastInsertRowid,
      clean(body.sector, 120), clean(body.location, 120), clean(body.website, 500), clean(body.instagram, 500),
      clean(body.opportunity), clean(body.idea), plan, clean(body.solution_text),
      asMoney(body.monthly_value), asMoney(body.offer_value), status, priority,
      clean(body.first_contact_at, 30), clean(body.follow_up_at, 30), clean(body.notes), clean(body.proposal_email, 12000),ebookPageId
    );
    return Number(u.lastInsertRowid);
  });

  try {
    const id = tx();
    res.status(201).json(getCrmProspect(id));
  } catch (e) {
    if (/UNIQUE/i.test(e.message)) return res.status(409).json({ error: 'Já existe um prospect com estes dados.' });
    console.error('[crm] create prospect:', e);
    res.status(500).json({ error: 'Não foi possível criar o prospect.' });
  }
});

capturedApp.patch('/api/crm/prospects/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const current = getCrmProspect(id);
  if (!current) return res.status(404).json({ error: 'Prospect não encontrado.' });
  const body = req.body || {};

  const leadStatus = body.lead_status === undefined
    ? current.lead_status
    : (allowedStatuses.has(body.lead_status) ? body.lead_status : current.lead_status);
  const priority = body.priority === undefined
    ? current.priority
    : (allowedPriorities.has(body.priority) ? body.priority : current.priority);
  const plan = body.recommended_plan === undefined
    ? (current.recommended_plan || '')
    : (allowedPlans.has(body.recommended_plan || '') ? (body.recommended_plan || '') : (current.recommended_plan || ''));
  const ebookPageId=body.ebook_page_id===undefined?current.ebook_page_id:validEbookPageId(body.ebook_page_id);

  const tx = db.transaction(() => {
    db.prepare(`
      UPDATE users SET
        name=COALESCE(?,name), company=COALESCE(?,company),
        email=COALESCE(?,email), phone=COALESCE(?,phone)
      WHERE id=? AND is_prospect=1
    `).run(
      body.name === undefined ? null : clean(body.name, 180),
      body.company === undefined ? null : clean(body.company, 180),
      body.email === undefined ? null : clean(body.email, 240)?.toLowerCase(),
      body.phone === undefined ? null : clean(body.phone, 80),
      id
    );

    db.prepare(`
      INSERT INTO prospect_crm (user_id, lead_status, priority, updated_at)
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(user_id) DO NOTHING
    `).run(id, leadStatus, priority);

    db.prepare(`
      UPDATE prospect_crm SET
        sector=?, location=?, website=?, instagram=?, opportunity=?, idea=?,
        recommended_plan=?, solution_text=?, monthly_value=?, offer_value=?,
        lead_status=?, priority=?, first_contact_at=?, follow_up_at=?, notes=?, proposal_email=?,ebook_page_id=?,
        updated_at=datetime('now')
      WHERE user_id=?
    `).run(
      body.sector === undefined ? current.sector : clean(body.sector, 120),
      body.location === undefined ? current.location : clean(body.location, 120),
      body.website === undefined ? current.website : clean(body.website, 500),
      body.instagram === undefined ? current.instagram : clean(body.instagram, 500),
      body.opportunity === undefined ? current.opportunity : clean(body.opportunity),
      body.idea === undefined ? current.idea : clean(body.idea),
      plan,
      body.solution_text === undefined ? current.solution_text : clean(body.solution_text),
      body.monthly_value === undefined ? asMoney(current.monthly_value) : asMoney(body.monthly_value),
      body.offer_value === undefined ? asMoney(current.offer_value) : asMoney(body.offer_value),
      leadStatus, priority,
      body.first_contact_at === undefined ? current.first_contact_at : clean(body.first_contact_at, 30),
      body.follow_up_at === undefined ? current.follow_up_at : clean(body.follow_up_at, 30),
      body.notes === undefined ? current.notes : clean(body.notes),
      body.proposal_email === undefined ? current.proposal_email : clean(body.proposal_email, 12000),ebookPageId,
      id
    );
  });

  try {
    tx();
    res.json(getCrmProspect(id));
  } catch (e) {
    if (/UNIQUE/i.test(e.message)) return res.status(409).json({ error: 'Este email já está a ser utilizado.' });
    console.error('[crm] update prospect:', e);
    res.status(500).json({ error: 'Não foi possível guardar o prospect.' });
  }
});

capturedApp.post('/api/crm/prospects/:id/contacted', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!getCrmProspect(id)) return res.status(404).json({ error: 'Prospect não encontrado.' });
  db.prepare(`
    INSERT INTO prospect_crm (user_id, lead_status, priority, first_contact_at, updated_at)
    VALUES (?, 'contactado', 'possivel', date('now'), datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      lead_status='contactado',
      first_contact_at=COALESCE(prospect_crm.first_contact_at, date('now')),
      updated_at=datetime('now')
  `).run(id);
  res.json(getCrmProspect(id));
});

capturedApp.delete('/api/crm/prospects/:id', requireAdmin, (req, res) => {
  const info = db.prepare(`DELETE FROM users WHERE id=? AND role='client' AND is_prospect=1`).run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Prospect não encontrado.' });
  res.json({ ok: true });
});

// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.
originalListen.apply(capturedApp, capturedListenArgs);
