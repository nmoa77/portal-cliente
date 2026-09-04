const crypto = require('crypto');
const db = require('./db');
const { requireAdmin } = require('./auth');
const { deliver } = require('./email');

module.exports = function installEbookLeads(app) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ebook_leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT,
      source TEXT,
      campaign TEXT,
      marketing_consent INTEGER NOT NULL DEFAULT 0,
      token TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      first_downloaded_at TEXT,
      last_downloaded_at TEXT,
      download_count INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_ebook_leads_email ON ebook_leads(lower(email));
    CREATE INDEX IF NOT EXISTS idx_ebook_leads_created ON ebook_leads(created_at);
  `);

  const portal = (process.env.PORTAL_URL || 'https://cliente.duit.pt').replace(/\/+$/, '');
  const clean = (v, max=500) => String(v ?? '').trim().slice(0,max);
  const validEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  app.post('/api/public/ebook-leads', (req,res) => {
    try {
      const name = clean(req.body?.name,120);
      const email = clean(req.body?.email,180).toLowerCase();
      const company = clean(req.body?.company,180);
      const source = clean(req.body?.source,120) || 'direto';
      const campaign = clean(req.body?.campaign,120);
      const marketingConsent = req.body?.marketing_consent ? 1 : 0;
      if (!name) return res.status(400).json({error:'Indique o seu nome.'});
      if (!validEmail(email)) return res.status(400).json({error:'Indique um email válido.'});

      let lead = db.prepare(`SELECT * FROM ebook_leads WHERE lower(email)=lower(?) ORDER BY id DESC LIMIT 1`).get(email);
      let token;
      if (lead) {
        token = lead.token || crypto.randomBytes(24).toString('hex');
        db.prepare(`UPDATE ebook_leads SET name=?,company=?,source=?,campaign=?,marketing_consent=?,token=? WHERE id=?`)
          .run(name,company,source,campaign,marketingConsent,token,lead.id);
      } else {
        token = crypto.randomBytes(24).toString('hex');
        db.prepare(`INSERT INTO ebook_leads(name,email,company,source,campaign,marketing_consent,token) VALUES(?,?,?,?,?,?,?)`)
          .run(name,email,company,source,campaign,marketingConsent,token);
      }

      const downloadUrl = `${portal}/api/public/ebook-download/${encodeURIComponent(token)}`;
      try {
        const body = `Olá ${name},\n\nO seu ebook gratuito da DUIT está pronto.\n\nDescarregar: ${downloadUrl}\n\nBoa leitura,\nDUIT`;
        const html = `<!doctype html><html><body style="margin:0;background:#f5f3ef;font-family:Arial,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 14px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:14px;overflow:hidden"><tr><td style="background:#0a0a0a;padding:18px 30px"><img src="${portal}/logo-branco.png" width="135" alt="DUIT" style="display:block;border:0"></td></tr><tr><td style="height:4px;background:#ffd60a"></td></tr><tr><td style="padding:34px"><h1 style="font-size:26px;margin:0 0 14px;color:#111">O seu ebook gratuito está pronto.</h1><p style="font-size:15px;line-height:1.6;color:#555;margin:0 0 22px">Obrigado, ${name}. Esperamos que goste destas 6 curiosidades.</p><a href="${downloadUrl}" style="display:inline-block;background:#ffd60a;color:#111;text-decoration:none;font-weight:700;padding:13px 20px;border-radius:9px">Descarregar ebook gratuito</a></td></tr></table></td></tr></table></body></html>`;
        deliver(db,{to:email,subject:'O seu ebook gratuito DUIT',body,html,kind:'ebook_lead',force:true});
      } catch(e) { console.warn('[ebook] email:', e.message); }

      res.json({ok:true,download_url:downloadUrl});
    } catch(e) {
      console.warn('[ebook] lead:',e.message);
      res.status(500).json({error:'Não foi possível preparar o ebook. Tente novamente.'});
    }
  });

  app.get('/api/public/ebook-download/:token', (req,res) => {
    try {
      const token = clean(req.params.token,100);
      const lead = db.prepare(`SELECT id FROM ebook_leads WHERE token=?`).get(token);
      if (!lead) return res.status(404).send('Ligação inválida ou expirada.');
      db.prepare(`UPDATE ebook_leads SET first_downloaded_at=COALESCE(first_downloaded_at,datetime('now')),last_downloaded_at=datetime('now'),download_count=download_count+1 WHERE id=?`).run(lead.id);
      res.set('Cache-Control','no-store');
      res.redirect(302,'/ebook-duit.pdf');
    } catch(e) { res.status(500).send('Não foi possível abrir o ebook.'); }
  });

  app.get('/api/crm/ebook-leads', requireAdmin, (req,res) => {
    res.json(db.prepare(`SELECT id,name,email,company,source,campaign,marketing_consent,created_at,first_downloaded_at,last_downloaded_at,download_count FROM ebook_leads ORDER BY datetime(created_at) DESC,id DESC`).all());
  });
};
