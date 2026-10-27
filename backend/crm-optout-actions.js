const db = require('./db');
const { deliver } = require('./email');

module.exports = function installCrmOptOut(app, requireAdmin) {
  // Reutiliza a blacklist persistente já usada pelo guard de prospects apagados.
  db.exec(`
    CREATE TABLE IF NOT EXISTS deleted_prospects (
      email TEXT PRIMARY KEY COLLATE NOCASE,
      company TEXT,
      deleted_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const cols = db.prepare('PRAGMA table_info(deleted_prospects)').all().map(c => c.name);
  const additions = [
    ['name', 'TEXT'],
    ['phone', 'TEXT'],
    ['website', 'TEXT'],
    ['reason', 'TEXT'],
    ['source', "TEXT DEFAULT 'manual'"],
    ['confirmation_email_sent_at', 'TEXT']
  ];
  for (const [name, type] of additions) {
    if (!cols.includes(name)) db.exec(`ALTER TABLE deleted_prospects ADD COLUMN ${name} ${type}`);
  }

  function clean(value, max = 1000) {
    if (value === undefined || value === null) return null;
    const s = String(value).trim();
    return s ? s.slice(0, max) : null;
  }

  app.get('/api/crm/do-not-contact', requireAdmin, (req, res) => {
    const rows = db.prepare(`
      SELECT email, company, name, phone, website, reason, source,
             deleted_at, confirmation_email_sent_at
        FROM deleted_prospects
       ORDER BY deleted_at DESC
    `).all();
    res.json(rows);
  });

  app.post('/api/crm/prospects/:id/do-not-contact', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const prospect = db.prepare(`
      SELECT u.id, u.name, u.email, u.company, u.phone, c.website
        FROM users u
        LEFT JOIN prospect_crm c ON c.user_id = u.id
       WHERE u.id=? AND u.role='client' AND u.is_prospect=1
    `).get(id);

    if (!prospect) return res.status(404).json({ error: 'Prospect não encontrado.' });

    const email = clean(prospect.email, 240)?.toLowerCase();
    if (!email) return res.status(400).json({ error: 'O prospect não tem um email válido para confirmar a remoção.' });

    const reason = clean(req.body?.reason, 500) || 'Pedido do destinatário para não receber novas comunicações.';
    const company = clean(prospect.company, 180);
    const name = clean(prospect.name, 180);

    // Guarda primeiro a exclusão para nunca depender do sucesso do envio.
    db.prepare(`
      INSERT INTO deleted_prospects
        (email, company, name, phone, website, reason, source, deleted_at)
      VALUES (?, ?, ?, ?, ?, ?, 'opt_out', datetime('now'))
      ON CONFLICT(email) DO UPDATE SET
        company=excluded.company,
        name=excluded.name,
        phone=excluded.phone,
        website=excluded.website,
        reason=excluded.reason,
        source='opt_out',
        deleted_at=datetime('now')
    `).run(email, company, name, clean(prospect.phone, 80), clean(prospect.website, 500), reason);

    const subject = 'Confirmação de remoção — DUIT';
    const body = `Olá,

Confirmamos a remoção do seu contacto da nossa lista de prospeção/comunicação.

Não receberá novas comunicações comerciais da DUIT.

Obrigado pela indicação.

Cumprimentos,
Nuno
DUIT`;

    let confirmationQueued = false;
    try {
      deliver(db, {
        to: email,
        subject,
        body,
        user_id: id,
        kind: 'prospect_opt_out_confirmation',
        force: true,
      });
      confirmationQueued = true;
      db.prepare(`
        UPDATE deleted_prospects
           SET confirmation_email_sent_at=datetime('now')
         WHERE lower(trim(email))=lower(trim(?))
      `).run(email);
    } catch (e) {
      console.warn('[crm] confirmação de opt-out:', e.message);
    }

    // Apagar dos prospects ativos dispara também o guard existente.
    db.prepare(`DELETE FROM users WHERE id=? AND role='client' AND is_prospect=1`).run(id);

    res.json({
      ok: true,
      email,
      company,
      reason,
      confirmation_email_queued: confirmationQueued,
    });
  });
};
