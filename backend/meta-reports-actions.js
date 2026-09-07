const db = require('./db');
const { requireAuth, requireAdmin } = require('./auth');

/*
 * DUIT — Relatórios mensais Meta
 * Primeira camada: persistência, configuração e endpoints-base.
 * A recolha Graph API, geração de PDF e envio mensal serão ligados sobre estas tabelas.
 */

module.exports = function installMetaReports(app) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta_connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      page_id TEXT,
      page_name TEXT,
      instagram_account_id TEXT,
      instagram_username TEXT,
      access_token TEXT,
      token_expires_at TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      last_sync_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id),
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

  function safeConnection(row) {
    if (!row) return null;
    return {
      id: row.id,
      user_id: row.user_id,
      page_id: row.page_id,
      page_name: row.page_name,
      instagram_account_id: row.instagram_account_id,
      instagram_username: row.instagram_username,
      token_expires_at: row.token_expires_at,
      is_active: !!row.is_active,
      last_sync_at: row.last_sync_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  app.get('/api/meta/status', requireAdmin, (req, res) => {
    res.json({
      configured: !!(process.env.META_APP_ID && process.env.META_APP_SECRET && process.env.META_GRAPH_VERSION),
      app_id_present: !!process.env.META_APP_ID,
      app_secret_present: !!process.env.META_APP_SECRET,
      graph_version: process.env.META_GRAPH_VERSION || null,
      redirect_uri: process.env.META_REDIRECT_URI || null,
    });
  });

  app.get('/api/meta/connections', requireAdmin, (req, res) => {
    const rows = db.prepare(`
      SELECT mc.*, u.name client_name, u.company client_company, u.email client_email
      FROM meta_connections mc
      JOIN users u ON u.id=mc.user_id
      ORDER BY COALESCE(u.company,u.name) COLLATE NOCASE
    `).all();
    res.json(rows.map(r => ({ ...safeConnection(r), client_name: r.client_name, client_company: r.client_company, client_email: r.client_email })));
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
