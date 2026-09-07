const db = require('./db');
const { requireAuth, requireAdmin } = require('./auth');

module.exports = function installMetaReports(app) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta_business_connection (id INTEGER PRIMARY KEY CHECK (id=1),meta_user_id TEXT,meta_user_name TEXT,business_id TEXT,business_name TEXT,access_token TEXT,token_expires_at TEXT,scopes_json TEXT,is_active INTEGER NOT NULL DEFAULT 1,last_sync_at TEXT,created_at TEXT DEFAULT (datetime('now')),updated_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS meta_client_assets (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL UNIQUE,page_id TEXT,page_name TEXT,instagram_account_id TEXT,instagram_username TEXT,is_active INTEGER NOT NULL DEFAULT 1,last_sync_at TEXT,created_at TEXT DEFAULT (datetime('now')),updated_at TEXT DEFAULT (datetime('now')),FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS meta_monthly_reports (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL,ref_year INTEGER NOT NULL,ref_month INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','collecting','ready','sent','error')),totals_json TEXT,posts_json TEXT,summary_text TEXT,pdf_path TEXT,generated_at TEXT,sent_at TEXT,error_message TEXT,created_at TEXT DEFAULT (datetime('now')),updated_at TEXT DEFAULT (datetime('now')),UNIQUE(user_id,ref_year,ref_month),FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
    CREATE INDEX IF NOT EXISTS idx_meta_reports_user_month ON meta_monthly_reports(user_id,ref_year,ref_month);
  `);

  const graphVersion = () => process.env.META_GRAPH_VERSION || '';
  const graphBase = () => `https://graph.facebook.com/${graphVersion()}`;

  function centralToken() {
    if (process.env.META_ACCESS_TOKEN) return process.env.META_ACCESS_TOKEN;
    const r = db.prepare(`SELECT access_token FROM meta_business_connection WHERE id=1 AND is_active=1`).get();
    return r?.access_token || '';
  }

  async function metaGet(pathname, params = {}, tokenOverride = '') {
    const token = tokenOverride || centralToken();
    if (!token) throw new Error('A ligação central à Meta ainda não tem access token.');
    if (!graphVersion()) throw new Error('META_GRAPH_VERSION não está configurada.');

    const url = new URL(`${graphBase()}/${String(pathname).replace(/^\//, '')}`);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    });
    url.searchParams.set('access_token', token);

    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error) {
      const err = new Error(data?.error?.message || `Erro Meta HTTP ${response.status}`);
      err.meta = data?.error || null;
      throw err;
    }
    return data;
  }

  async function getPageCredential(pageId) {
    const data = await metaGet('me/accounts', {
      fields: 'id,name,access_token,instagram_business_account{id,username},connected_instagram_account{id,username}',
      limit: 200,
    });
    const page = (data.data || []).find(p => String(p.id) === String(pageId));
    if (!page) throw new Error('A Página não foi devolvida por /me/accounts para esta credencial.');
    if (!page.access_token) throw new Error('A Meta não devolveu Page Access Token para esta Página.');
    const ig = page.instagram_business_account || page.connected_instagram_account || null;
    return {
      pageToken: page.access_token,
      pageName: page.name || null,
      instagram_account_id: ig?.id || null,
      instagram_username: ig?.username || null,
    };
  }

  function clientAssetRow(userId) {
    return db.prepare(`SELECT a.*,u.name client_name,u.company client_company,u.email client_email FROM meta_client_assets a JOIN users u ON u.id=a.user_id WHERE a.user_id=?`).get(userId);
  }

  function period(year, month) {
    const y = Number(year), m = Number(month);
    if (y < 2020 || y > 2100 || m < 1 || m > 12) throw new Error('Período inválido.');
    const since = Math.floor(Date.UTC(y, m - 1, 1) / 1000);
    const until = Math.floor(Date.UTC(m === 12 ? y + 1 : y, m === 12 ? 0 : m, 1) / 1000);
    return { since, until };
  }

  app.get('/api/meta/status', requireAdmin, (req, res) => {
    res.json({
      configured: !!(process.env.META_APP_ID && process.env.META_APP_SECRET && graphVersion()),
      token_present: !!centralToken(),
      app_id_present: !!process.env.META_APP_ID,
      app_secret_present: !!process.env.META_APP_SECRET,
      graph_version: graphVersion() || null,
      redirect_uri: process.env.META_REDIRECT_URI || null,
    });
  });

  app.get('/api/meta/me', requireAdmin, async (req, res) => {
    try { res.json(await metaGet('me', { fields: 'id,name' })); }
    catch (e) { res.status(502).json({ error: e.message, meta: e.meta || null }); }
  });

  app.get('/api/meta/assets', requireAdmin, async (req, res) => {
    try {
      const data = await metaGet('me/accounts', {
        fields: 'id,name,instagram_business_account{id,username},connected_instagram_account{id,username}',
        limit: 200,
      });
      const assets = (data.data || []).map(page => {
        const ig = page.instagram_business_account || page.connected_instagram_account || null;
        return {
          page_id: page.id,
          page_name: page.name,
          instagram_account_id: ig?.id || null,
          instagram_username: ig?.username || null,
          instagram_source: page.instagram_business_account ? 'instagram_business_account' : (page.connected_instagram_account ? 'connected_instagram_account' : null),
        };
      });
      res.json(assets);
    } catch (e) {
      res.status(502).json({ error: e.message, meta: e.meta || null });
    }
  });

  app.get('/api/meta/instagram-test/:instagramId', requireAdmin, async (req, res) => {
    try {
      const id = String(req.params.instagramId || '').trim();
      if (!/^\d+$/.test(id)) return res.status(400).json({ error: 'Instagram ID inválido.' });
      const data = await metaGet(id, { fields: 'id,username,name' });
      res.json({ ok: true, id: data.id || id, username: data.username || null, name: data.name || null });
    } catch (e) {
      res.status(502).json({ ok: false, error: e.message, meta: e.meta || null });
    }
  });

  app.get('/api/meta/collect-test/:userId/:year/:month', requireAdmin, async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const asset = clientAssetRow(userId);
      if (!asset) return res.status(404).json({ error: 'Cliente sem conta Meta associada.' });

      const { since, until } = period(req.params.year, req.params.month);
      const result = {
        client: { id: userId, name: asset.client_company || asset.client_name },
        period: { year: Number(req.params.year), month: Number(req.params.month) },
        facebook: { page_id: asset.page_id, page_name: asset.page_name, posts: [] },
        instagram: { account_id: asset.instagram_account_id, username: asset.instagram_username, media: [] },
        warnings: [],
      };

      let pageCredential = null;
      if (asset.page_id) {
        try {
          pageCredential = await getPageCredential(asset.page_id);
          const fb = await metaGet(`${asset.page_id}/posts`, {
            fields: 'id,message,created_time,permalink_url,attachments{media_type,type,url}',
            since,
            until,
            limit: 100,
          }, pageCredential.pageToken);
          result.facebook.posts = fb.data || [];
        } catch (e) {
          result.warnings.push(`Facebook: ${e.message}`);
        }
      }

      const igId = pageCredential?.instagram_account_id || asset.instagram_account_id;
      if (igId) {
        try {
          const tokenForInstagram = pageCredential?.pageToken || centralToken();
          const ig = await metaGet(`${igId}/media`, {
            fields: 'id,caption,media_type,media_product_type,timestamp,permalink,like_count,comments_count',
            since,
            until,
            limit: 100,
          }, tokenForInstagram);
          result.instagram.account_id = igId;
          result.instagram.username = pageCredential?.instagram_username || asset.instagram_username;
          result.instagram.media = ig.data || [];
        } catch (e) {
          result.warnings.push(`Instagram: ${e.message}`);
        }
      }

      res.json(result);
    } catch (e) {
      res.status(502).json({ error: e.message, meta: e.meta || null });
    }
  });

  app.get('/api/meta/connections', requireAdmin, (req, res) => {
    const rows = db.prepare(`SELECT a.*,u.name client_name,u.company client_company,u.email client_email FROM meta_client_assets a JOIN users u ON u.id=a.user_id ORDER BY COALESCE(u.company,u.name) COLLATE NOCASE`).all();
    res.json(rows.map(r => ({ ...r, is_active: !!r.is_active })));
  });

  app.put('/api/meta/connections/:userId', requireAdmin, (req, res) => {
    const userId = Number(req.params.userId);
    const user = db.prepare(`SELECT id FROM users WHERE id=? AND role='client' AND is_prospect=0`).get(userId);
    if (!user) return res.status(404).json({ error: 'Cliente não encontrado.' });
    const b = req.body || {};
    const pageId = String(b.page_id || '').trim();
    if (!pageId) return res.status(400).json({ error: 'page_id é obrigatório.' });
    db.prepare(`INSERT INTO meta_client_assets(user_id,page_id,page_name,instagram_account_id,instagram_username,is_active,updated_at) VALUES(?,?,?,?,?,1,datetime('now')) ON CONFLICT(user_id) DO UPDATE SET page_id=excluded.page_id,page_name=excluded.page_name,instagram_account_id=excluded.instagram_account_id,instagram_username=excluded.instagram_username,is_active=1,updated_at=datetime('now')`).run(userId,pageId,String(b.page_name||'').trim()||null,String(b.instagram_account_id||'').trim()||null,String(b.instagram_username||'').trim()||null);
    res.json(clientAssetRow(userId));
  });

  app.delete('/api/meta/connections/:userId', requireAdmin, (req, res) => {
    const info = db.prepare(`DELETE FROM meta_client_assets WHERE user_id=?`).run(Number(req.params.userId));
    res.json({ ok: true, removed: info.changes });
  });

  app.get('/api/meta/reports', requireAuth, (req, res) => {
    const requested = Number(req.query.user_id || 0);
    const userId = req.user.role === 'admin' && requested ? requested : Number(req.user.id);
    res.json(db.prepare(`SELECT id,user_id,ref_year,ref_month,status,summary_text,pdf_path,generated_at,sent_at,error_message,created_at,updated_at FROM meta_monthly_reports WHERE user_id=? ORDER BY ref_year DESC,ref_month DESC`).all(userId));
  });

  app.post('/api/meta/reports/:userId/:year/:month/queue', requireAdmin, (req, res) => {
    const userId = Number(req.params.userId), year = Number(req.params.year), month = Number(req.params.month);
    if (!userId || year < 2020 || year > 2100 || month < 1 || month > 12) return res.status(400).json({ error: 'Cliente ou período inválido.' });
    const user = db.prepare(`SELECT id FROM users WHERE id=? AND role='client' AND is_prospect=0`).get(userId);
    if (!user) return res.status(404).json({ error: 'Cliente não encontrado.' });
    if (!clientAssetRow(userId)) return res.status(409).json({ error: 'Este cliente ainda não tem ativos Meta associados.' });
    db.prepare(`INSERT INTO meta_monthly_reports(user_id,ref_year,ref_month,status,updated_at) VALUES(?,?,?,'pending',datetime('now')) ON CONFLICT(user_id,ref_year,ref_month) DO UPDATE SET status='pending',error_message=NULL,updated_at=datetime('now')`).run(userId,year,month);
    res.status(202).json(db.prepare(`SELECT id,user_id,ref_year,ref_month,status,created_at,updated_at FROM meta_monthly_reports WHERE user_id=? AND ref_year=? AND ref_month=?`).get(userId,year,month));
  });
};
