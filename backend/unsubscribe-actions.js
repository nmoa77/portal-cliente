const db = require('./db');
const { verifyUnsubscribeToken } = require('./email');

module.exports = function installUnsubscribeActions(app) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS email_unsubscribes (
      email TEXT PRIMARY KEY COLLATE NOCASE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS deleted_prospects (
      email TEXT PRIMARY KEY COLLATE NOCASE,
      company TEXT,
      deleted_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  app.get('/unsubscribe', (req, res) => {
    const token = String(req.query?.token || '');
    const email = verifyUnsubscribeToken(token);
    if (!email) {
      return res.status(400).type('html').send('<!doctype html><html lang="pt"><meta charset="utf-8"><title>Ligação inválida</title><body style="font-family:Arial,sans-serif;padding:40px"><h2>Ligação inválida</h2><p>Esta ligação de cancelamento não é válida.</p></body></html>');
    }

    const safeEmail = email.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    return res.type('html').send(`<!doctype html>
<html lang="pt">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cancelar subscrição — DUIT</title></head>
<body style="margin:0;background:#f5f3ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#111">
  <div style="max-width:560px;margin:60px auto;padding:0 18px">
    <div style="background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06)">
      <div style="background:#0a0a0a;color:#fff;padding:26px 32px;font-weight:800;font-size:24px">DUIT</div>
      <div style="height:5px;background:#ffd60a"></div>
      <div style="padding:34px 32px">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.14em;color:#8b8680;margin-bottom:10px">Preferências de contacto</div>
        <h1 style="font-size:28px;margin:0 0 14px">Cancelar subscrição</h1>
        <p style="line-height:1.6;color:#333">Deixará de receber comunicações não essenciais da DUIT em <strong>${safeEmail}</strong>.</p>
        <p style="line-height:1.6;color:#666;font-size:13px">Emails essenciais relacionados com segurança, acesso ou serviços ativos podem continuar a ser enviados quando necessários.</p>
        <form method="post" action="/unsubscribe">
          <input type="hidden" name="token" value="${token.replace(/"/g,'&quot;')}">
          <button type="submit" style="border:0;background:#ffd60a;color:#111;font-weight:800;padding:14px 20px;border-radius:10px;cursor:pointer">Confirmar cancelamento</button>
        </form>
      </div>
    </div>
  </div>
</body></html>`);
  });

  app.post('/unsubscribe', require('express').urlencoded({ extended: false }), (req, res) => {
    const token = String(req.body?.token || '');
    const email = verifyUnsubscribeToken(token);
    if (!email) return res.status(400).send('Ligação inválida.');

    db.prepare(`
      INSERT INTO email_unsubscribes (email, created_at)
      VALUES (?, datetime('now'))
      ON CONFLICT(email) DO UPDATE SET created_at=excluded.created_at
    `).run(email);

    try {
      db.prepare(`UPDATE users SET notifications_enabled=0 WHERE lower(trim(email))=lower(trim(?))`).run(email);
    } catch (_) {}

    try {
      const prospect = db.prepare(`
        SELECT id, company FROM users
        WHERE is_prospect=1 AND lower(trim(email))=lower(trim(?))
        LIMIT 1
      `).get(email);
      if (prospect) {
        db.prepare(`
          INSERT INTO deleted_prospects (email, company, deleted_at)
          VALUES (?, ?, datetime('now'))
          ON CONFLICT(email) DO UPDATE SET company=excluded.company, deleted_at=excluded.deleted_at
        `).run(email, prospect.company || null);
        db.prepare(`DELETE FROM users WHERE id=? AND is_prospect=1`).run(prospect.id);
      }
    } catch (e) {
      console.warn('[unsubscribe] prospect cleanup:', e.message);
    }

    return res.type('html').send(`<!doctype html>
<html lang="pt">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Subscrição cancelada — DUIT</title></head>
<body style="margin:0;background:#f5f3ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#111">
  <div style="max-width:560px;margin:60px auto;padding:0 18px">
    <div style="background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06)">
      <div style="background:#0a0a0a;color:#fff;padding:26px 32px;font-weight:800;font-size:24px">DUIT</div>
      <div style="height:5px;background:#ffd60a"></div>
      <div style="padding:34px 32px">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.14em;color:#8b8680;margin-bottom:10px">Preferências atualizadas</div>
        <h1 style="font-size:28px;margin:0 0 14px">Subscrição cancelada</h1>
        <p style="line-height:1.6;color:#333">O endereço <strong>${email}</strong> deixou de receber comunicações não essenciais da DUIT.</p>
      </div>
    </div>
  </div>
</body></html>`);
  });
};
