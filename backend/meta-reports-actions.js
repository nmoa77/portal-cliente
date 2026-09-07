const db = require('./db');
const { requireAuth, requireAdmin } = require('./auth');

/*
 * DUIT — Relatórios mensais Meta
 * Modelo centralizado: a DUIT autentica uma vez e associa os ativos Meta
 * disponíveis (Página Facebook / conta Instagram profissional) a cada cliente.
 */

module.exports = function installMetaReports(app) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta_business_connection (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      meta_user_id TEXT,
      meta_user_name TEXT,
      business_id TEXT,
      business_name TEXT,
      access_token TEXT,
      token_expires_at TEXT,
      scopes_json TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      last_sync_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS meta_client_assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      page_id TEXT,
      page_name TEXT,
      instagram_account_id TEXT,
      instagram_username TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      last_sync_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS meta_monthly_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      ref_year INTEGER NOT NULL,
      ref_month INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK(status IN ('pending','collecting','ready','sent','error')),
      totals_json TEXT,
      posts_json TEXT,
      summary_text TEXT,
      pdf_path TEXT,
      generated_at TEXT,
      sent_at TEXT,
      error_message TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, ref_year, ref_month),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_meta_reports_user_month
      ON meta_monthly_reports(user_id, ref_year, ref_month);
  `);

  const graphVersion = () => process.env.META_GRAPH_VERSION || '';
  const graphBase = () => `https://graph.facebook.com/${graphVersion()}`;

  function centralToken() {
    // Para a primeira ligação real podemos usar uma credencial central no Railway.
    // O fluxo OAuth substituirá/renovará isto posteriormente sem alterar os clientes.
    if (process.env.META_ACCESS_TOKEN) return process.env.META_ACCESS_TOKEN;
    const row = db.prepare(`SELECT access_token FROM meta_business_connection WHERE id=1 AND is_active=1`).get();
    return row?.access_token || '';
  }

  async function metaGet(pathname, params = {}) {
    const token = centralToken();
    if (!token) throw new Error('A ligação central à Meta ainda não tem access token.');
    if (!graphVersion()) throw new Error('META_GRAPH_VERSION não está configurada.');

    const url = new URL(`${graphBase()}/${String(pathname).replace(/^\//, '')}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
    });
    url.searchParams.set('access_token', token);

    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error) {
      const message = data?.error?.message || `Erro Meta HTTP ${response.status}`;
      const err = new Error(message);
      err.meta = data?.error || null;
      throw err;
    }
    return data;
  }

  function safeBusinessConnection(row) {
    if (!row) return null;
    return {
      meta_user_id: row.meta_user_id,
      meta_user_name: row.meta_user_name,
      business_id: row.business_id,
      business_name: row.business_name,
      token_expires_at: row.token_expires_at,
      scopes: row.scopes_json ? JSON.parse(row.scopes_json) : [],
      is_active: !!row.is_active,
      last_sync_at: row.last_sync_at,
      updated_at: row.updated_at,
    };
  }

  function clientAssetRow(userId) {
    return db.prepare(`
      SELECT a.*, u.name client_name, u.company client_company, u.email client_email
      FROM meta_client_assets a
      JOIN users u ON u.id=a.user_id
      WHERE a.user_id=?
    `).get(userId);
  }

  app.get('/api/meta/status', requireAdmin, (req, res) => {
    const business = db.prepare(`SELECT * FROM meta_business_connection WHERE id=1`).get();
    res.json({
      configured: !!(process.env.META_APP_ID && process.env.META_APP_SECRET && graphVersion()),
      token_present: !!centralToken(),
      app_id_present: !!process.env.META_APP_ID,
      app_secret_present: !!process.env.META_APP_SECRET,
      graph_version: graphVersion() || null,
      redirect_uri: process.env.META_REDIRECT_URI || null,
      central_connection: safeBusinessConnection(business),
    });
  });

  // Teste simples da credencial central. Não devolve o token.
  app.get('/api/meta/me', requireAdmin, async (req, res) => {
    try {
      const data = await metaGet('me', { fields: 'id,name' });
      res.json(data);
    } catch (e) {
      res.status(502).json({ error: e.message, meta: e.meta || null });
    }
  });

  // Lista as páginas que a credencial DUIT consegue gerir e a conta Instagram
  // profissional associada a cada página, quando disponível.
  app.get('/api/meta/assets', requireAdmin, async (req, res) => {
    try {
      const data = await metaGet('me/accounts', {
        fields: 'id,name,instagram_business_account{id,username}',
        limit: 200,
      });
      const assets = (data.data || []).map(page => ({
        page_id: page.id,
        page_name: page.name,
        instagram_account_id: page.instagram_business_account?.id || null,
        instagram_username: page.instagram_business_account?.username || null,
      }));
      res.json(assets);
    } catch (e) {
      res.status(502).json({ error: e.message, meta: e.meta || null });
    }
  });

  app.get('/api/meta/connections', requireAdmin, (req, res) => {
    const rows = db.prepare(`
      SELECT a.*, u.name client_name, u.company client_company, u.email client_email
      FROM meta_client_assets a
      JOIN users u ON u.id=a.user_id
      ORDER BY COALESCE(u.company,u.name) COLLATE NOCASE
    `).all();
    res.json(rows.map(r => ({
      id: r.id,
      user_id: r.user_id,
      client_name: r.client_name,
      client_company: r.client_company,
      client_email: r.client_email,
      page_id: r.page_id,
      page_name: r.page_name,
      instagram_account_id: r.instagram_account_id,
      instagram_username: r.instagram_username,
      is_active: !!r.is_active,
      last_sync_at: r.last_sync_at,
      updated_at: r.updated_at,
    })));
  });

  // Associa um cliente do portal a um dos ativos devolvidos por /api/meta/assets.
  app.put('/api/meta/connections/:userId', requireAdmin, (req, res) => {
    const userId = Number(req.params.userId);
    const user = db.prepare(`SELECT id FROM users WHERE id=? AND role='client' AND is_prospect=0`).get(userId);
    if (!user) return res.status(404).json({ error: 'Cliente não encontrado.' });

    const body = req.body || {};
    const pageId = String(body.page_id || '').trim();
    if (!pageId) return res.status(400).json({ error: 'page_id é obrigatório.' });

    db.prepare(`
      INSERT INTO meta_client_assets (
        user_id,page_id,page_name,instagram_account_id,instagram_username,is_active,updated_at
      ) VALUES (?,?,?,?,?,1,datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET
        page_id=excluded.page_id,
        page_name=excluded.page_name,
        instagram_account_id=excluded.instagram_account_id,
        instagram_username=excluded.instagram_username,
        is_active=1,
        updated_at=datetime('now')
    `).run(
      userId,
      pageId,
      String(body.page_name || '').trim() || null,
      String(body.instagram_account_id || '').trim() || null,
      String(body.instagram_username || '').trim() || null
    );

    res.json(clientAssetRow(userId));
  });

  app.delete('/api/meta/connections/:userId', requireAdmin, (req, res) => {
    const info = db.prepare(`DELETE FROM meta_client_assets WHERE user_id=?`).run(Number(req.params.userId));
    res.json({ ok: true, removed: info.changes });
  });

  app.get('/api/meta/reports', requireAuth, (req, res) => {
    const requestedUserId = Number(req.query.user_id || 0);
    const userId = req.user.role === 'admin' && requestedUserId ? requestedUserId : Number(req.user.id);
    const rows = db.prepare(`
      SELECT id,user_id,ref_year,ref_month,status,summary_text,pdf_path,generated_at,sent_at,error_message,created_at,updated_at
      FROM meta_monthly_reports
      WHERE user_id=?
      ORDER BY ref_year DESC, ref_month DESC
    `).all(userId);
    res.json(rows);
  });

  app.post('/api/meta/reports/:userId/:year/:month/queue', requireAdmin, (req, res) => {
    const userId = Number(req.params.userId);
    const year = Number(req.params.year);
    const month = Number(req.params.month);
    if (!userId || year < 2020 || year > 2100 || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Cliente ou período inválido.' });
    }
    const user = db.prepare(`SELECT id FROM users WHERE id=? AND role='client' AND is_prospect=0`).get(userId);
    if (!user) return res.status(404).json({ error: 'Cliente não encontrado.' });
    if (!clientAssetRow(userId)) return res.status(409).json({ error: 'Este cliente ainda não tem ativos Meta associados.' });

    db.prepare(`
      INSERT INTO meta_monthly_reports (user_id,ref_year,ref_month,status,updated_at)
      VALUES (?,?,?,'pending',datetime('now'))
      ON CONFLICT(user_id,ref_year,ref_month)
      DO UPDATE SET status='pending',error_message=NULL,updated_at=datetime('now')
    `).run(userId, year, month);

    const report = db.prepare(`
      SELECT id,user_id,ref_year,ref_month,status,created_at,updated_at
      FROM meta_monthly_reports WHERE user_id=? AND ref_year=? AND ref_month=?
    `).get(userId, year, month);
    res.status(202).json(report);
  });
};
