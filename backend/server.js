const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const db = require('./db');
const { deliver, T } = require('./email');
const {
  signToken, setAuthCookie, clearAuthCookie,
  requireAuth, requireAdmin
} = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Atrás do proxy do Railway (ou qualquer reverse proxy HTTPS) — necessário para
// o cookie `secure: true` funcionar e para req.ip refletir o cliente real.
app.set('trust proxy', 1);

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Healthcheck simples para o Railway
app.get('/healthz', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

const stageLabels = {
  new: 'Novo', analysis: 'Em análise', production: 'Em produção',
  final_review: 'Revisão final', done: 'Concluído', cancelled: 'Cancelado',
};

/* ================================================================
   AUTH
   ================================================================ */
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email e password obrigatórios' });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  setAuthCookie(res, signToken(user));
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

app.post('/api/auth/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = db.prepare(
    'SELECT id, name, email, role, company, phone, avatar_url, notifications_enabled FROM users WHERE id = ?'
  ).get(req.user.id);
  res.json(user);
});

app.patch('/api/auth/me', requireAuth, (req, res) => {
  const { name, company, phone, avatar_url, notifications_enabled } = req.body || {};
  let notifVal = null;
  if (typeof notifications_enabled === 'boolean') notifVal = notifications_enabled ? 1 : 0;
  else if (notifications_enabled === 0 || notifications_enabled === 1) notifVal = notifications_enabled;
  db.prepare(
    `UPDATE users SET
       name = COALESCE(?, name),
       company = COALESCE(?, company),
       phone = COALESCE(?, phone),
       avatar_url = COALESCE(?, avatar_url),
       notifications_enabled = COALESCE(?, notifications_enabled)
     WHERE id = ?`
  ).run(name ?? null, company ?? null, phone ?? null, avatar_url ?? null, notifVal, req.user.id);
  res.json({ ok: true });
});

// Pedido de recuperação — envia email com link válido durante 1 hora.
// Devolve sempre 200 para não revelar quais emails existem na BD.
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Indique o seu email.' });
  }
  const user = db.prepare('SELECT id, name, email FROM users WHERE email = ?').get(email.trim());
  if (user) {
    try {
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1h
      db.prepare(
        `INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)`
      ).run(user.id, tokenHash, expires);

      const portalUrl = (process.env.PORTAL_URL || 'https://cliente.duit.pt').replace(/\/+$/, '');
      const resetUrl = `${portalUrl}/reset.html?token=${token}`;
      const tpl = T.passwordReset(user.name, resetUrl);
      // force: true porque é um email crítico de segurança — ignora preferência de notificações
      deliver(db, {
        to: user.email, subject: tpl.subject, body: tpl.body, html: tpl.html,
        user_id: user.id, kind: 'password_reset', force: true,
      });
    } catch (e) {
      console.warn('[auth] forgot-password falhou:', e.message);
    }
  }
  res.json({ ok: true });
});

// Aplica a nova palavra-passe a partir de um token válido.
app.post('/api/auth/reset-password', (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password) {
    return res.status(400).json({ error: 'Token e nova palavra-passe são obrigatórios.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'A nova palavra-passe tem de ter pelo menos 8 caracteres.' });
  }
  const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
  const row = db.prepare(
    `SELECT id, user_id, expires_at, used_at FROM password_resets WHERE token_hash = ?`
  ).get(tokenHash);

  if (!row)                                  return res.status(400).json({ error: 'Ligação inválida.' });
  if (row.used_at)                           return res.status(400).json({ error: 'Esta ligação já foi utilizada.' });
  if (new Date(row.expires_at) < new Date()) return res.status(400).json({ error: 'A ligação expirou. Solicite uma nova.' });

  const newHash = bcrypt.hashSync(password, 10);
  const tx = db.transaction(() => {
    db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(newHash, row.user_id);
    db.prepare(`UPDATE password_resets SET used_at = datetime('now') WHERE id = ?`).run(row.id);
    // Invalida quaisquer outros pedidos pendentes para o mesmo utilizador
    db.prepare(`UPDATE password_resets SET used_at = datetime('now') WHERE user_id = ? AND used_at IS NULL`).run(row.user_id);
  });
  tx();
  res.json({ ok: true });
});

app.post('/api/auth/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Preenche a password atual e a nova.' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'A nova password tem de ter pelo menos 8 caracteres.' });
  }
  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
  if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
    return res.status(401).json({ error: 'Password atual incorreta.' });
  }
  const newHash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.user.id);
  res.json({ ok: true });
});

/* ================================================================
   STATS
   ================================================================ */
app.get('/api/stats', requireAdmin, (req, res) => {
  const clients = db.prepare(`SELECT COUNT(*) c FROM users WHERE role='client'`).get().c;
  const activeSubs = db.prepare(`SELECT COUNT(*) c FROM subscriptions WHERE status='active'`).get().c;
  const openTickets = db.prepare(`SELECT COUNT(*) c FROM tickets WHERE status!='closed'`).get().c;
  const openProjects = db.prepare(`SELECT COUNT(*) c FROM projects WHERE stage NOT IN ('done','cancelled')`).get().c;
  const pendingCancels = db.prepare(`SELECT COUNT(*) c FROM cancellation_requests WHERE status='pending'`).get().c;
  const pendingQuotes = db.prepare(`SELECT COUNT(*) c FROM quotes WHERE status='sent'`).get().c;
  const draftPosts = db.prepare(`SELECT COUNT(*) c FROM social_posts WHERE status='draft'`).get().c;
  const monthlyRevenue = db.prepare(
    `SELECT COALESCE(SUM(price),0) r FROM subscriptions WHERE status='active' AND period='mês'`
  ).get().r;
  // Mantém awaitingPosts como alias para compatibilidade, aponta para rascunhos
  res.json({ clients, activeSubs, openTickets, openProjects, pendingCancels, pendingQuotes, awaitingPosts: draftPosts, draftPosts, monthlyRevenue });
});

app.get('/api/client-summary', requireAuth, (req, res) => {
  if (req.user.role === 'admin') return res.status(400).json({ error: 'Só para clientes' });
  const uid = req.user.id;
  const activeSubs = db.prepare(`SELECT COUNT(*) c FROM subscriptions WHERE user_id=? AND status='active'`).get(uid).c;
  const openProjects = db.prepare(`SELECT COUNT(*) c FROM projects WHERE user_id=? AND stage NOT IN ('done','cancelled')`).get(uid).c;
  const pendingMockups = db.prepare(
    `SELECT COUNT(*) c FROM mockups m JOIN projects p ON p.id=m.project_id
     WHERE p.user_id=? AND m.status='pending'`
  ).get(uid).c;
  const pendingQuotes = db.prepare(`SELECT COUNT(*) c FROM quotes WHERE user_id=? AND status='sent'`).get(uid).c;
  const monthTotal = db.prepare(
    `SELECT COALESCE(SUM(price),0) r FROM subscriptions WHERE user_id=? AND status='active' AND period='mês'`
  ).get(uid).r;
  const weekPosts = db.prepare(`SELECT COUNT(*) c FROM social_posts WHERE user_id=?`).get(uid).c;
  const draftPosts = db.prepare(`SELECT COUNT(*) c FROM social_posts WHERE user_id=? AND status='draft'`).get(uid).c;
  res.json({ activeSubs, openProjects, pendingMockups, pendingQuotes, monthTotal, weekPosts, awaitingPosts: draftPosts, draftPosts });
});

/* ================================================================
   CLIENTES
   ================================================================ */
app.get('/api/clients', requireAdmin, (req, res) => {
  const rows = db.prepare(
    `SELECT u.id, u.name, u.email, u.company, u.phone, u.avatar_url, u.created_at,
            (SELECT COUNT(*) FROM subscriptions s WHERE s.user_id=u.id) AS subs,
            (SELECT COUNT(*) FROM projects p WHERE p.user_id=u.id AND p.stage NOT IN ('done','cancelled')) AS projects,
            (SELECT COUNT(*) FROM tickets t WHERE t.user_id=u.id AND t.status!='closed') AS open_tickets,
            (SELECT COALESCE(SUM(price),0) FROM subscriptions s WHERE s.user_id=u.id AND s.status='active' AND s.period='mês') AS mrr
       FROM users u WHERE u.role='client' ORDER BY u.name`
  ).all();
  res.json(rows);
});

app.post('/api/clients', requireAdmin, (req, res) => {
  const { name, email, password, company, phone } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'Nome, email e password obrigatórios' });
  if (db.prepare('SELECT id FROM users WHERE email=?').get(email)) {
    return res.status(409).json({ error: 'Já existe um utilizador com este email' });
  }
  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare(
    `INSERT INTO users (name, email, password_hash, role, company, phone) VALUES (?, ?, ?, 'client', ?, ?)`
  ).run(name, email, hash, company || '', phone || '');
  const msg = T.welcome(name, email, password);
  deliver(db, { to: email, subject: msg.subject, body: msg.body, html: msg.html, user_id: info.lastInsertRowid, kind: 'welcome' });
  res.status(201).json({ id: info.lastInsertRowid });
});

app.patch('/api/clients/:id', requireAdmin, (req, res) => {
  const { name, email, company, phone, password } = req.body || {};
  const client = db.prepare(`SELECT id FROM users WHERE id=? AND role='client'`).get(req.params.id);
  if (!client) return res.status(404).json({ error: 'Cliente não encontrado' });
  if (email) {
    const dup = db.prepare(`SELECT id FROM users WHERE email=? AND id<>?`).get(email, req.params.id);
    if (dup) return res.status(409).json({ error: 'Já existe outro utilizador com este email' });
  }
  const password_hash = password ? bcrypt.hashSync(password, 10) : null;
  db.prepare(
    `UPDATE users SET
       name=COALESCE(?, name),
       email=COALESCE(?, email),
       company=COALESCE(?, company),
       phone=COALESCE(?, phone),
       password_hash=COALESCE(?, password_hash)
     WHERE id=? AND role='client'`
  ).run(
    name ?? null, email ?? null, company ?? null, phone ?? null,
    password_hash, req.params.id
  );
  res.json({ ok: true });
});

app.delete('/api/clients/:id', requireAdmin, (req, res) => {
  const info = db.prepare(`DELETE FROM users WHERE id=? AND role='client'`).run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Cliente não encontrado' });
  res.json({ ok: true });
});

/* ================================================================
   PLANOS (templates)
   ================================================================ */
app.get('/api/plans', requireAuth, (req, res) => {
  const rows = db.prepare(`SELECT * FROM plans ORDER BY category, price`).all();
  res.json(rows.map(p => ({ ...p, features: JSON.parse(p.features || '[]') })));
});

app.post('/api/plans', requireAdmin, (req, res) => {
  const { category, name, description, price, period, features, is_featured } = req.body || {};
  if (!category || !name) return res.status(400).json({ error: 'Categoria e nome obrigatórios' });
  const info = db.prepare(
    `INSERT INTO plans (category, name, description, price, period, features, is_featured)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(category, name, description || '', price || 0, period || 'mês',
        JSON.stringify(features || []), is_featured ? 1 : 0);
  res.status(201).json({ id: info.lastInsertRowid });
});

app.patch('/api/plans/:id', requireAdmin, (req, res) => {
  const { category, name, description, price, period, features, is_featured } = req.body || {};
  const info = db.prepare(
    `UPDATE plans SET
       category=COALESCE(?, category),
       name=COALESCE(?, name),
       description=COALESCE(?, description),
       price=COALESCE(?, price),
       period=COALESCE(?, period),
       features=COALESCE(?, features),
       is_featured=COALESCE(?, is_featured)
     WHERE id=?`
  ).run(
    category ?? null, name ?? null, description ?? null,
    price ?? null, period ?? null,
    features ? JSON.stringify(features) : null,
    is_featured === undefined ? null : (is_featured ? 1 : 0),
    req.params.id
  );
  if (!info.changes) return res.status(404).json({ error: 'Plano não encontrado' });
  res.json({ ok: true });
});

app.delete('/api/plans/:id', requireAdmin, (req, res) => {
  db.prepare(`DELETE FROM plans WHERE id=?`).run(req.params.id);
  res.json({ ok: true });
});

/* ================================================================
   SUBSCRIÇÕES
   ================================================================ */
app.get('/api/subscriptions', requireAuth, (req, res) => {
  if (req.user.role === 'admin') {
    const rows = db.prepare(
      `SELECT s.*, u.name client_name, u.email client_email, u.company client_company
         FROM subscriptions s JOIN users u ON u.id=s.user_id ORDER BY s.renewal_date`
    ).all();
    return res.json(rows);
  }
  res.json(db.prepare(
    `SELECT * FROM subscriptions WHERE user_id=? ORDER BY type`
  ).all(req.user.id));
});

app.post('/api/subscriptions', requireAdmin, (req, res) => {
  const { user_id, type, name, detail, status, price, period, renewal_date, plan_id } = req.body || {};
  if (!user_id || !type || !name) return res.status(400).json({ error: 'Cliente, tipo e nome obrigatórios' });
  const info = db.prepare(
    `INSERT INTO subscriptions (user_id, plan_id, type, name, detail, status, price, period, renewal_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(user_id, plan_id || null, type, name, detail || '', status || 'active',
        price || 0, period || 'mês', renewal_date || null);
  res.status(201).json({ id: info.lastInsertRowid });
});

app.patch('/api/subscriptions/:id', requireAdmin, (req, res) => {
  const { type, name, detail, status, price, period, renewal_date, plan_id } = req.body || {};
  const info = db.prepare(
    `UPDATE subscriptions SET
       type=COALESCE(?, type),
       name=COALESCE(?, name),
       detail=COALESCE(?, detail),
       status=COALESCE(?, status),
       price=COALESCE(?, price),
       period=COALESCE(?, period),
       renewal_date=COALESCE(?, renewal_date),
       plan_id=COALESCE(?, plan_id)
     WHERE id=?`
  ).run(
    type ?? null, name ?? null, detail ?? null, status ?? null,
    price ?? null, period ?? null, renewal_date ?? null, plan_id ?? null,
    req.params.id
  );
  if (!info.changes) return res.status(404).json({ error: 'Subscrição não encontrada' });
  res.json({ ok: true });
});

app.delete('/api/subscriptions/:id', requireAdmin, (req, res) => {
  const info = db.prepare(`DELETE FROM subscriptions WHERE id=?`).run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Subscrição não encontrada' });
  res.json({ ok: true });
});

/* ================================================================
   PROJETOS
   ================================================================ */
app.get('/api/projects', requireAuth, (req, res) => {
  if (req.user.role === 'admin') {
    const rows = db.prepare(
      `SELECT p.*, u.name client_name, u.company client_company
         FROM projects p JOIN users u ON u.id=p.user_id ORDER BY p.updated_at DESC`
    ).all();
    return res.json(rows);
  }
  res.json(db.prepare(`SELECT * FROM projects WHERE user_id=? ORDER BY updated_at DESC`).all(req.user.id));
});

app.post('/api/projects', requireAdmin, (req, res) => {
  const { user_id, name, description, stage, deadline } = req.body || {};
  if (!user_id || !name) return res.status(400).json({ error: 'Cliente e nome obrigatórios' });
  const info = db.prepare(
    `INSERT INTO projects (user_id, name, description, stage, deadline) VALUES (?, ?, ?, ?, ?)`
  ).run(user_id, name, description || '', stage || 'new', deadline || null);
  res.status(201).json({ id: info.lastInsertRowid });
});

app.patch('/api/projects/:id', requireAdmin, (req, res) => {
  const { stage, message, name, description, deadline } = req.body || {};
  const proj = db.prepare(
    `SELECT p.*, u.name client_name, u.email client_email
       FROM projects p JOIN users u ON u.id=p.user_id WHERE p.id=?`
  ).get(req.params.id);
  if (!proj) return res.status(404).json({ error: 'Projeto não encontrado' });
  db.prepare(
    `UPDATE projects SET
       stage=COALESCE(?, stage),
       name=COALESCE(?, name),
       description=COALESCE(?, description),
       deadline=COALESCE(?, deadline),
       updated_at=datetime('now')
     WHERE id=?`
  ).run(stage ?? null, name ?? null, description ?? null, deadline ?? null, req.params.id);
  // Só notifica o cliente se a fase mudou
  if (stage && stage !== proj.stage) {
    const tpl = T.projectStatus(proj.client_name, name || proj.name, stageLabels[stage] || stage, message);
    deliver(db, { to: proj.client_email, subject: tpl.subject, body: tpl.body, html: tpl.html, user_id: proj.user_id, kind: 'project_status' });
  }
  res.json({ ok: true });
});

app.delete('/api/projects/:id', requireAdmin, (req, res) => {
  db.prepare(`DELETE FROM projects WHERE id=?`).run(req.params.id);
  res.json({ ok: true });
});

// Detalhe de um projeto (cliente vê apenas o seu)
app.get('/api/projects/:id', requireAuth, (req, res) => {
  const proj = db.prepare(
    `SELECT p.*, u.name client_name, u.email client_email, u.company client_company
       FROM projects p JOIN users u ON u.id=p.user_id WHERE p.id=?`
  ).get(req.params.id);
  if (!proj) return res.status(404).json({ error: 'Projeto não encontrado' });
  if (req.user.role !== 'admin' && proj.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Sem permissão' });
  }
  // Anexa ficheiros e mockups associados (read-only)
  const files = db.prepare(
    `SELECT id, name, kind, size_kb, uploaded_by, created_at
       FROM files WHERE project_id=? ORDER BY created_at DESC`
  ).all(req.params.id);
  const mockups = db.prepare(
    `SELECT id, title, version, status, thumb_style, note, created_at
       FROM mockups WHERE project_id=? ORDER BY created_at DESC`
  ).all(req.params.id);
  // Para o cliente expomos o e-mail/empresa só se for admin
  if (req.user.role !== 'admin') {
    delete proj.client_email;
  }
  res.json({ ...proj, files, mockups });
});

// Listar notas/mensagens de um projeto
app.get('/api/projects/:id/messages', requireAuth, (req, res) => {
  const proj = db.prepare('SELECT user_id FROM projects WHERE id=?').get(req.params.id);
  if (!proj) return res.status(404).json({ error: 'Projeto não encontrado' });
  if (req.user.role !== 'admin' && proj.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Sem permissão' });
  }
  const rows = db.prepare(
    `SELECT pm.*, u.name author_name, u.role author_role
       FROM project_messages pm JOIN users u ON u.id=pm.author_id
      WHERE pm.project_id=? ORDER BY pm.created_at ASC`
  ).all(req.params.id);
  res.json(rows);
});

// Enviar nota num projeto (cliente ou admin)
app.post('/api/projects/:id/messages', requireAuth, (req, res) => {
  const { body } = req.body || {};
  if (!body || !body.trim()) return res.status(400).json({ error: 'Mensagem obrigatória' });

  const proj = db.prepare(
    `SELECT p.*, u.name client_name, u.email client_email
       FROM projects p JOIN users u ON u.id=p.user_id WHERE p.id=?`
  ).get(req.params.id);
  if (!proj) return res.status(404).json({ error: 'Projeto não encontrado' });
  if (req.user.role !== 'admin' && proj.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Sem permissão' });
  }

  db.prepare(
    `INSERT INTO project_messages (project_id, author_id, body) VALUES (?, ?, ?)`
  ).run(req.params.id, req.user.id, body.trim());
  db.prepare(`UPDATE projects SET updated_at=datetime('now') WHERE id=?`).run(req.params.id);

  // Notifica a outra parte
  try {
    if (req.user.role === 'admin') {
      // admin escreveu → notifica cliente
      const tpl = T.projectMessage(proj.client_name, proj.name, 'DUIT', body.trim());
      deliver(db, {
        to: proj.client_email, subject: tpl.subject, body: tpl.body, html: tpl.html,
        user_id: proj.user_id, kind: 'project_message',
      });
    } else {
      // cliente escreveu → notifica todos os admins
      const admins = db.prepare(`SELECT id, name, email FROM users WHERE role='admin'`).all();
      const author = db.prepare(`SELECT name, company FROM users WHERE id=?`).get(req.user.id);
      const authorLabel = author?.company ? `${author.name} · ${author.company}` : (author?.name || 'Cliente');
      for (const a of admins) {
        const tpl = T.projectMessage(a.name, proj.name, authorLabel, body.trim());
        deliver(db, {
          to: a.email, subject: tpl.subject, body: tpl.body, html: tpl.html,
          user_id: a.id, kind: 'project_message', force: true,
        });
      }
    }
  } catch (e) { console.warn('projectMessage notify:', e.message); }

  res.status(201).json({ ok: true });
});

/* ================================================================
   MOCKUPS (aprovações)
   ================================================================ */
app.get('/api/mockups', requireAuth, (req, res) => {
  if (req.user.role === 'admin') {
    const rows = db.prepare(
      `SELECT m.*, p.name project_name, u.name client_name, u.id user_id
         FROM mockups m JOIN projects p ON p.id=m.project_id JOIN users u ON u.id=p.user_id
        ORDER BY m.created_at DESC`
    ).all();
    return res.json(rows);
  }
  res.json(db.prepare(
    `SELECT m.*, p.name project_name
       FROM mockups m JOIN projects p ON p.id=m.project_id
      WHERE p.user_id=? ORDER BY m.status='pending' DESC, m.created_at DESC`
  ).all(req.user.id));
});

app.post('/api/mockups', requireAdmin, (req, res) => {
  const { project_id, title, version, thumb_style } = req.body || {};
  if (!project_id || !title) return res.status(400).json({ error: 'Projeto e título obrigatórios' });
  const info = db.prepare(
    `INSERT INTO mockups (project_id, title, version, thumb_style) VALUES (?, ?, ?, ?)`
  ).run(project_id, title, version || 1, thumb_style || 'yellow');
  const proj = db.prepare(`SELECT p.*, u.name client_name, u.email client_email FROM projects p JOIN users u ON u.id=p.user_id WHERE p.id=?`).get(project_id);
  if (proj) {
    const tpl = T.mockupReady(proj.client_name, title);
    deliver(db, { to: proj.client_email, subject: tpl.subject, body: tpl.body, html: tpl.html, user_id: proj.user_id, kind: 'mockup_ready' });
  }
  res.status(201).json({ id: info.lastInsertRowid });
});

app.patch('/api/mockups/:id', requireAuth, (req, res) => {
  const { status, note } = req.body || {};
  const mk = db.prepare(
    `SELECT m.*, p.user_id FROM mockups m JOIN projects p ON p.id=m.project_id WHERE m.id=?`
  ).get(req.params.id);
  if (!mk) return res.status(404).json({ error: 'Mockup não encontrado' });
  if (req.user.role !== 'admin' && mk.user_id !== req.user.id) return res.status(403).json({ error: 'Sem permissão' });
  db.prepare(`UPDATE mockups SET status=COALESCE(?, status), note=COALESCE(?, note) WHERE id=?`)
    .run(status || null, note || null, req.params.id);
  res.json({ ok: true });
});

/* ================================================================
   FICHEIROS
   ================================================================ */
app.get('/api/files', requireAuth, (req, res) => {
  if (req.user.role === 'admin') {
    const rows = db.prepare(
      `SELECT f.*, p.name project_name, u.name client_name
         FROM files f LEFT JOIN projects p ON p.id=f.project_id
                      JOIN users u ON u.id=f.user_id ORDER BY f.created_at DESC`
    ).all();
    return res.json(rows);
  }
  res.json(db.prepare(
    `SELECT f.*, p.name project_name
       FROM files f LEFT JOIN projects p ON p.id=f.project_id
      WHERE f.user_id=? ORDER BY f.created_at DESC`
  ).all(req.user.id));
});

app.post('/api/files', requireAuth, (req, res) => {
  const { project_id, name, kind, size_kb, user_id } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Nome obrigatório' });
  const finalUid = req.user.role === 'admin' ? (user_id || req.user.id) : req.user.id;
  const uploadedBy = req.user.role === 'admin' ? 'DUIT' : 'Cliente';
  const info = db.prepare(
    `INSERT INTO files (project_id, user_id, name, kind, size_kb, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(project_id || null, finalUid, name, kind || 'pdf', size_kb || 0, uploadedBy);
  res.status(201).json({ id: info.lastInsertRowid });
});

app.delete('/api/files/:id', requireAuth, (req, res) => {
  const f = db.prepare(`SELECT * FROM files WHERE id=?`).get(req.params.id);
  if (!f) return res.status(404).json({ error: 'Ficheiro não encontrado' });
  if (req.user.role !== 'admin' && f.user_id !== req.user.id) return res.status(403).json({ error: 'Sem permissão' });
  db.prepare(`DELETE FROM files WHERE id=?`).run(req.params.id);
  res.json({ ok: true });
});

/* ================================================================
   CANCELAMENTOS
   ================================================================ */
app.get('/api/cancellations', requireAuth, (req, res) => {
  if (req.user.role === 'admin') {
    const rows = db.prepare(
      `SELECT c.*, s.name service_name, s.price service_price, s.period service_period,
              u.name client_name, u.email client_email, u.company client_company
         FROM cancellation_requests c
         JOIN subscriptions s ON s.id=c.subscription_id
         JOIN users u ON u.id=c.user_id
        ORDER BY c.status='pending' DESC, c.created_at DESC`
    ).all();
    return res.json(rows);
  }
  res.json(db.prepare(
    `SELECT c.*, s.name service_name FROM cancellation_requests c
       JOIN subscriptions s ON s.id=c.subscription_id
      WHERE c.user_id=? ORDER BY c.created_at DESC`
  ).all(req.user.id));
});

app.post('/api/cancellations', requireAuth, (req, res) => {
  const { subscription_id, reason, comment } = req.body || {};
  if (!subscription_id) return res.status(400).json({ error: 'subscription_id obrigatório' });
  const sub = db.prepare(`SELECT * FROM subscriptions WHERE id=?`).get(subscription_id);
  if (!sub) return res.status(404).json({ error: 'Subscrição não encontrada' });
  if (req.user.role !== 'admin' && sub.user_id !== req.user.id) return res.status(403).json({ error: 'Sem permissão' });
  const info = db.prepare(
    `INSERT INTO cancellation_requests (subscription_id, user_id, reason, comment) VALUES (?, ?, ?, ?)`
  ).run(subscription_id, sub.user_id, reason || '', comment || '');
  const tpl = T.cancelRequest('', sub.name);
  deliver(db, { to: req.user.email, subject: tpl.subject, body: tpl.body, html: tpl.html, user_id: sub.user_id, kind: 'cancel_request' });
  res.status(201).json({ id: info.lastInsertRowid });
});

app.patch('/api/cancellations/:id', requireAdmin, (req, res) => {
  const { status } = req.body || {};
  if (!['approved','rejected','paused'].includes(status)) return res.status(400).json({ error: 'Status inválido' });
  const cr = db.prepare(
    `SELECT c.*, s.name service_name, u.name client_name, u.email client_email
       FROM cancellation_requests c
       JOIN subscriptions s ON s.id=c.subscription_id
       JOIN users u ON u.id=c.user_id WHERE c.id=?`
  ).get(req.params.id);
  if (!cr) return res.status(404).json({ error: 'Pedido não encontrado' });
  db.prepare(`UPDATE cancellation_requests SET status=?, decided_at=datetime('now') WHERE id=?`)
    .run(status, req.params.id);
  if (status === 'approved') {
    db.prepare(`UPDATE subscriptions SET status='cancelled' WHERE id=?`).run(cr.subscription_id);
  }
  const tpl = T.cancelDecision(cr.client_name, cr.service_name, status === 'approved');
  deliver(db, { to: cr.client_email, subject: tpl.subject, body: tpl.body, html: tpl.html, user_id: cr.user_id, kind: 'cancel_decision' });
  res.json({ ok: true });
});

/* ================================================================
   ORÇAMENTOS
   ================================================================ */
app.get('/api/quotes', requireAuth, (req, res) => {
  const where = req.user.role === 'admin' ? '' : 'WHERE q.user_id=?';
  const params = req.user.role === 'admin' ? [] : [req.user.id];
  const quotes = db.prepare(
    `SELECT q.*, u.name client_name, u.company client_company,
            (SELECT COALESCE(SUM(amount),0) FROM quote_items WHERE quote_id=q.id) total
       FROM quotes q JOIN users u ON u.id=q.user_id ${where}
      ORDER BY q.sent_at DESC`
  ).all(...params);
  res.json(quotes);
});

app.get('/api/quotes/:id', requireAuth, (req, res) => {
  const q = db.prepare(
    `SELECT q.*, u.name client_name, u.email client_email, u.company client_company,
            (SELECT COALESCE(SUM(amount),0) FROM quote_items WHERE quote_id=q.id) total
       FROM quotes q JOIN users u ON u.id=q.user_id WHERE q.id=?`
  ).get(req.params.id);
  if (!q) return res.status(404).json({ error: 'Orçamento não encontrado' });
  if (req.user.role !== 'admin' && q.user_id !== req.user.id) return res.status(403).json({ error: 'Sem permissão' });
  const items = db.prepare(`SELECT * FROM quote_items WHERE quote_id=? ORDER BY id`).all(req.params.id);
  res.json({ ...q, items });
});

app.post('/api/quotes', requireAdmin, (req, res) => {
  const { number, user_id, title, valid_until, items } = req.body || {};
  if (!number || !user_id || !title) return res.status(400).json({ error: 'Campos obrigatórios em falta' });
  const info = db.prepare(
    `INSERT INTO quotes (number, user_id, title, valid_until, status) VALUES (?, ?, ?, ?, 'sent')`
  ).run(number, user_id, title, valid_until || null);
  const insertItem = db.prepare(
    `INSERT INTO quote_items (quote_id, label, detail, amount) VALUES (?, ?, ?, ?)`
  );
  (items || []).forEach(it => insertItem.run(info.lastInsertRowid, it.label, it.detail || '', it.amount || 0));
  res.status(201).json({ id: info.lastInsertRowid });
});

app.patch('/api/quotes/:id', requireAuth, (req, res) => {
  const q = db.prepare(`SELECT * FROM quotes WHERE id=?`).get(req.params.id);
  if (!q) return res.status(404).json({ error: 'Orçamento não encontrado' });
  if (req.user.role !== 'admin' && q.user_id !== req.user.id) return res.status(403).json({ error: 'Sem permissão' });
  const { status, number, title, valid_until, user_id, items } = req.body || {};
  // Cliente só pode alterar status (aceitar/rejeitar)
  if (req.user.role !== 'admin') {
    if (!['accepted','rejected'].includes(status)) return res.status(400).json({ error: 'Status inválido' });
    db.prepare(`UPDATE quotes SET status=? WHERE id=?`).run(status, req.params.id);
    return res.json({ ok: true });
  }
  // Admin — pode alterar tudo
  if (status && !['accepted','rejected','draft','sent'].includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }
  if (number && number !== q.number) {
    const dup = db.prepare(`SELECT id FROM quotes WHERE number=? AND id<>?`).get(number, req.params.id);
    if (dup) return res.status(409).json({ error: 'Já existe outro orçamento com este número' });
  }
  db.prepare(
    `UPDATE quotes SET
       status=COALESCE(?, status),
       number=COALESCE(?, number),
       title=COALESCE(?, title),
       valid_until=COALESCE(?, valid_until),
       user_id=COALESCE(?, user_id)
     WHERE id=?`
  ).run(
    status ?? null, number ?? null, title ?? null,
    valid_until ?? null, user_id ?? null, req.params.id
  );
  // Se recebeu items, substitui tudo
  if (Array.isArray(items)) {
    db.prepare(`DELETE FROM quote_items WHERE quote_id=?`).run(req.params.id);
    const insertItem = db.prepare(
      `INSERT INTO quote_items (quote_id, label, detail, amount) VALUES (?, ?, ?, ?)`
    );
    items.forEach(it => insertItem.run(req.params.id, it.label, it.detail || '', it.amount || 0));
  }
  res.json({ ok: true });
});

/* ================================================================
   FATURAS
   ================================================================ */
app.get('/api/invoices', requireAuth, (req, res) => {
  const where = req.user.role === 'admin' ? '' : 'WHERE i.user_id=?';
  const params = req.user.role === 'admin' ? [] : [req.user.id];
  res.json(db.prepare(
    `SELECT i.*, u.name client_name FROM invoices i JOIN users u ON u.id=i.user_id ${where}
      ORDER BY i.issued_at DESC`
  ).all(...params));
});

app.post('/api/invoices', requireAdmin, (req, res) => {
  const { number, user_id, description, amount, status } = req.body || {};
  if (!number || !user_id || !description) return res.status(400).json({ error: 'Campos obrigatórios em falta' });
  const info = db.prepare(
    `INSERT INTO invoices (number, user_id, description, amount, status) VALUES (?, ?, ?, ?, ?)`
  ).run(number, user_id, description, amount || 0, status || 'pending');
  res.status(201).json({ id: info.lastInsertRowid });
});

/* ================================================================
   NOTAS (admin privado sobre cada cliente)
   ================================================================ */
app.get('/api/notes/:user_id', requireAdmin, (req, res) => {
  res.json(db.prepare(
    `SELECT n.*, u.name author_name FROM notes n JOIN users u ON u.id=n.author_id
      WHERE n.about_user_id=? ORDER BY n.created_at DESC`
  ).all(req.params.user_id));
});

app.post('/api/notes', requireAdmin, (req, res) => {
  const { about_user_id, body } = req.body || {};
  if (!about_user_id || !body) return res.status(400).json({ error: 'about_user_id e body obrigatórios' });
  const info = db.prepare(
    `INSERT INTO notes (about_user_id, author_id, body) VALUES (?, ?, ?)`
  ).run(about_user_id, req.user.id, body);
  res.status(201).json({ id: info.lastInsertRowid });
});

app.delete('/api/notes/:id', requireAdmin, (req, res) => {
  db.prepare(`DELETE FROM notes WHERE id=?`).run(req.params.id);
  res.json({ ok: true });
});

/* ================================================================
   POSTS SOCIAIS (calendário)
   ================================================================ */
app.get('/api/social-posts', requireAuth, (req, res) => {
  const { month, user_id } = req.query; // month = YYYY-MM
  const monthPrefix = month ? `${month}-%` : '%';
  if (req.user.role === 'admin') {
    const params = [monthPrefix];
    let where = `WHERE sp.date LIKE ?`;
    if (user_id) { where += ` AND sp.user_id=?`; params.push(user_id); }
    return res.json(db.prepare(
      `SELECT sp.*, u.name client_name, u.company client_company
         FROM social_posts sp JOIN users u ON u.id=sp.user_id ${where} ORDER BY sp.date`
    ).all(...params));
  }
  res.json(db.prepare(
    `SELECT * FROM social_posts WHERE user_id=? AND date LIKE ? ORDER BY date`
  ).all(req.user.id, monthPrefix));
});

app.post('/api/social-posts', requireAdmin, (req, res) => {
  const { user_id, network, date, text, status } = req.body || {};
  if (!user_id || !network || !date || !text) return res.status(400).json({ error: 'Campos obrigatórios em falta' });
  const info = db.prepare(
    `INSERT INTO social_posts (user_id, network, date, text, status) VALUES (?, ?, ?, ?, ?)`
  ).run(user_id, network, date, text, status || 'scheduled');
  res.status(201).json({ id: info.lastInsertRowid });
});

app.patch('/api/social-posts/:id', requireAdmin, (req, res) => {
  const post = db.prepare(`SELECT * FROM social_posts WHERE id=?`).get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post não encontrado' });
  const { network, date, text, status, client_suggestion } = req.body || {};
  db.prepare(
    `UPDATE social_posts SET
       network=COALESCE(?, network), date=COALESCE(?, date),
       text=COALESCE(?, text), status=COALESCE(?, status),
       client_suggestion=COALESCE(?, client_suggestion)
     WHERE id=?`
  ).run(network ?? null, date ?? null, text ?? null, status ?? null,
        client_suggestion === undefined ? null : client_suggestion,
        req.params.id);
  res.json({ ok: true });
});

// Cliente envia sugestão de alteração — não altera o post em si
app.post('/api/social-posts/:id/suggestion', requireAuth, (req, res) => {
  const post = db.prepare(`SELECT * FROM social_posts WHERE id=?`).get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post não encontrado' });
  if (req.user.role !== 'admin' && post.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Sem permissão' });
  }
  const { suggestion } = req.body || {};
  if (!suggestion || !String(suggestion).trim()) {
    return res.status(400).json({ error: 'Sugestão vazia' });
  }
  db.prepare(`UPDATE social_posts SET client_suggestion=? WHERE id=?`)
    .run(String(suggestion).trim(), req.params.id);
  // Notifica a equipa DUIT
  const admin = db.prepare(`SELECT email FROM users WHERE role='admin' LIMIT 1`).get();
  if (admin) {
    deliver(db, {
      to: admin.email,
      subject: `Sugestão de alteração — post ${post.date}`,
      body: `O cliente enviou uma sugestão para o post de ${post.date}:\n\n"${suggestion}"\n\nPost original: ${post.text}`,
      user_id: post.user_id,
      kind: 'post_suggestion',
    });
  }
  res.json({ ok: true });
});

app.delete('/api/social-posts/:id', requireAdmin, (req, res) => {
  db.prepare(`DELETE FROM social_posts WHERE id=?`).run(req.params.id);
  res.json({ ok: true });
});

// Bulk delete: apaga todos os posts de um cliente num dado mês
app.post('/api/social-posts/bulk-delete', requireAdmin, (req, res) => {
  const { user_id, month, keep } = req.body || {}; // keep: 'published' | 'all' (apaga tudo)
  if (!user_id || !month) return res.status(400).json({ error: 'user_id e month (YYYY-MM) obrigatórios' });
  let sql = `DELETE FROM social_posts WHERE user_id=? AND date LIKE ?`;
  const params = [user_id, `${month}-%`];
  if (keep === 'published') sql += ` AND status != 'published'`;
  const info = db.prepare(sql).run(...params);
  const user = db.prepare(`SELECT * FROM users WHERE id=?`).get(user_id);
  if (user) {
    const tpl = T.postsCleared(user.name, month);
    deliver(db, { to: user.email, subject: tpl.subject, body: tpl.body, html: tpl.html, user_id, kind: 'posts_cleared' });
  }
  res.json({ ok: true, deleted: info.changes });
});

// Bulk generate: cria posts vazios (rascunho) num mês com base em posts/semana e dias da semana
// body: { user_id, month:'YYYY-MM', network:'instagram|facebook|linkedin',
//         posts_per_week: 1..7, weekdays: [1..7] opcional (1=Seg, 7=Dom),
//         skip_existing: true|false }
app.post('/api/social-posts/bulk-generate', requireAdmin, (req, res) => {
  const { user_id, month, network, posts_per_week, weekdays, skip_existing } = req.body || {};
  if (!user_id || !month || !network) {
    return res.status(400).json({ error: 'user_id, month (YYYY-MM) e network obrigatórios' });
  }
  const ppw = Math.min(7, Math.max(1, Number(posts_per_week) || 1));
  const validNet = ['instagram','facebook','linkedin'];
  if (!validNet.includes(network)) return res.status(400).json({ error: 'Rede inválida' });
  const [y, m] = month.split('-').map(Number);
  if (!y || !m || m < 1 || m > 12) return res.status(400).json({ error: 'Mês inválido (YYYY-MM)' });

  // Organizar dias do mês em semanas ISO (segunda-feira como início)
  const daysInMonth = new Date(y, m, 0).getDate();
  const weeks = []; let currentWeek = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(y, m - 1, d);
    const iso = String(d).padStart(2,'0');
    const dateStr = `${y}-${String(m).padStart(2,'0')}-${iso}`;
    // JS: 0=Dom..6=Sáb → normalizar para 1=Seg..7=Dom
    const js = dt.getDay();
    const wd = js === 0 ? 7 : js;
    currentWeek.push({ dateStr, wd });
    if (wd === 7) { weeks.push(currentWeek); currentWeek = []; }
  }
  if (currentWeek.length) weeks.push(currentWeek);

  // Selecionar dias
  const chosenDays = new Set(Array.isArray(weekdays) ? weekdays.map(Number).filter(n => n >= 1 && n <= 7) : []);
  const dates = [];
  for (const week of weeks) {
    if (chosenDays.size > 0) {
      const picks = week.filter(d => chosenDays.has(d.wd)).slice(0, ppw);
      picks.forEach(d => dates.push(d.dateStr));
    } else {
      // Aleatório: escolher ppw dias distintos dentro da semana
      const pool = [...week];
      const picks = [];
      while (picks.length < ppw && pool.length) {
        const i = Math.floor(Math.random() * pool.length);
        picks.push(pool.splice(i, 1)[0]);
      }
      picks.sort((a,b) => a.dateStr.localeCompare(b.dateStr))
           .forEach(d => dates.push(d.dateStr));
    }
  }

  // Evitar duplicar se já existe algo nesse dia (opcional)
  const existing = new Set(
    db.prepare(`SELECT date FROM social_posts WHERE user_id=? AND date LIKE ?`)
      .all(user_id, `${month}-%`)
      .map(r => r.date)
  );

  const insert = db.prepare(
    `INSERT INTO social_posts (user_id, network, date, text, status) VALUES (?, ?, ?, ?, 'draft')`
  );
  const txn = db.transaction((list) => {
    let created = 0;
    for (const date of list) {
      if (skip_existing && existing.has(date)) continue;
      insert.run(user_id, network, date, '');
      created++;
    }
    return created;
  });
  const created = txn(dates);

  res.json({ ok: true, created, planned: dates.length });
});

/* ================================================================
   NOTIFICAÇÕES (admin vê emails enviados)
   ================================================================ */
app.get('/api/notifications', requireAdmin, (req, res) => {
  res.json(db.prepare(
    `SELECT n.*, u.name user_name FROM notifications n
       LEFT JOIN users u ON u.id=n.user_id
      ORDER BY n.created_at DESC LIMIT 50`
  ).all());
});

/* ================================================================
   TICKETS
   ================================================================ */
app.get('/api/tickets', requireAuth, (req, res) => {
  if (req.user.role === 'admin') {
    return res.json(db.prepare(
      `SELECT t.*, u.name client_name,
              (SELECT COUNT(*) FROM messages m WHERE m.ticket_id=t.id) message_count
         FROM tickets t JOIN users u ON u.id=t.user_id
        ORDER BY CASE t.status WHEN 'open' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END,
                 CASE t.priority WHEN 'high' THEN 0 WHEN 'normal' THEN 1 ELSE 2 END,
                 t.updated_at DESC`
    ).all());
  }
  res.json(db.prepare(
    `SELECT t.*, (SELECT COUNT(*) FROM messages m WHERE m.ticket_id=t.id) message_count
       FROM tickets t WHERE t.user_id=? ORDER BY t.updated_at DESC`
  ).all(req.user.id));
});

app.post('/api/tickets', requireAuth, (req, res) => {
  const { subject, priority, body } = req.body || {};
  if (!subject || !body) return res.status(400).json({ error: 'Assunto e mensagem obrigatórios' });
  const userId = req.user.role === 'admin' ? (req.body.user_id || req.user.id) : req.user.id;
  const t = db.prepare(
    `INSERT INTO tickets (user_id, subject, priority) VALUES (?, ?, ?)`
  ).run(userId, subject, priority || 'normal');
  db.prepare(`INSERT INTO messages (ticket_id, user_id, body) VALUES (?, ?, ?)`)
    .run(t.lastInsertRowid, req.user.id, body);
  res.status(201).json({ id: t.lastInsertRowid });
});

app.get('/api/tickets/:id', requireAuth, (req, res) => {
  const ticket = db.prepare(
    `SELECT t.*, u.name client_name, u.email client_email
       FROM tickets t JOIN users u ON u.id=t.user_id WHERE t.id=?`
  ).get(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket não encontrado' });
  if (req.user.role !== 'admin' && ticket.user_id !== req.user.id) return res.status(403).json({ error: 'Sem permissão' });
  const messages = db.prepare(
    `SELECT m.*, u.name author_name, u.role author_role
       FROM messages m JOIN users u ON u.id=m.user_id
      WHERE m.ticket_id=? ORDER BY m.created_at ASC`
  ).all(req.params.id);
  res.json({ ...ticket, messages });
});

app.post('/api/tickets/:id/messages', requireAuth, (req, res) => {
  const ticket = db.prepare('SELECT * FROM tickets WHERE id=?').get(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket não encontrado' });
  if (req.user.role !== 'admin' && ticket.user_id !== req.user.id) return res.status(403).json({ error: 'Sem permissão' });
  const { body } = req.body || {};
  if (!body) return res.status(400).json({ error: 'Mensagem obrigatória' });
  db.prepare(`INSERT INTO messages (ticket_id, user_id, body) VALUES (?, ?, ?)`)
    .run(req.params.id, req.user.id, body);
  db.prepare(`UPDATE tickets SET updated_at=datetime('now') WHERE id=?`).run(req.params.id);
  res.status(201).json({ ok: true });
});

app.patch('/api/tickets/:id', requireAdmin, (req, res) => {
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: 'Campo status obrigatório' });
  const info = db.prepare(
    `UPDATE tickets SET status=?, updated_at=datetime('now') WHERE id=?`
  ).run(status, req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Ticket não encontrado' });
  res.json({ ok: true });
});

/* ================================================================
   ZONA DE PERIGO — limpar BD
   ================================================================ */
app.post('/api/admin/wipe-db', requireAdmin, (req, res) => {
  const { confirm } = req.body || {};
  if (confirm !== 'APAGAR TUDO') {
    return res.status(400).json({
      error: 'Escreve exatamente "APAGAR TUDO" para confirmar.'
    });
  }

  const meId = req.user.id;

  // apaga tudo menos o admin atual; ordem conta para FKs mas usamos transação + FKs off
  const wipe = db.transaction(() => {
    db.pragma('foreign_keys = OFF');
    const tables = [
      'messages', 'tickets', 'notifications', 'social_posts', 'notes',
      'quote_items', 'quotes', 'invoices', 'cancellation_requests',
      'files', 'mockups', 'projects', 'subscriptions', 'plans',
    ];
    for (const t of tables) db.exec(`DELETE FROM "${t}"`);
    db.prepare(`DELETE FROM users WHERE id != ?`).run(meId);

    // reset AUTOINCREMENT (se sqlite_sequence existir)
    try { db.exec(`DELETE FROM sqlite_sequence`); } catch (e) {}

    db.pragma('foreign_keys = ON');
  });

  try {
    wipe();
    console.log(`[wipe-db] BD esvaziada pelo admin id=${meId} (${req.user.email})`);
    res.json({ ok: true });
  } catch (e) {
    console.error('[wipe-db] erro:', e);
    res.status(500).json({ error: 'Não consegui limpar a BD: ' + e.message });
  }
});

/* ================================================================
   Fallback
   ================================================================ */
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));

app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  DUIT · Portal do Cliente                        ║');
  console.log(`║  http://localhost:${PORT}                              ║`);
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  Admin:   admin@duit.pt       / admin123         ║');
  console.log('║  Cliente: ana@exemplo.pt      / cliente123       ║');
  console.log('║           joao@exemplo.pt     / cliente123       ║');
  console.log('║           rita@exemplo.pt     / cliente123       ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
});
