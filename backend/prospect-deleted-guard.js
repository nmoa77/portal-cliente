const db = require('./db');

// Registo permanente de prospects apagados. Fica na BD persistente e não depende dos seeds.
db.exec(`
  CREATE TABLE IF NOT EXISTS deleted_prospects (
    email TEXT PRIMARY KEY COLLATE NOCASE,
    company TEXT,
    deleted_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TRIGGER IF NOT EXISTS remember_deleted_prospect
  BEFORE DELETE ON users
  WHEN OLD.is_prospect = 1 AND OLD.email IS NOT NULL AND trim(OLD.email) <> ''
  BEGIN
    INSERT INTO deleted_prospects (email, company, deleted_at)
    VALUES (lower(trim(OLD.email)), OLD.company, datetime('now'))
    ON CONFLICT(email) DO UPDATE SET
      company=excluded.company,
      deleted_at=excluded.deleted_at;
  END;
`);

function cleanupDeletedProspects(){
  const info = db.prepare(`
    DELETE FROM users
    WHERE is_prospect=1
      AND lower(trim(email)) IN (SELECT lower(trim(email)) FROM deleted_prospects)
  `).run();
  if(info.changes) console.log(`[crm] ${info.changes} prospect(s) apagado(s) foram bloqueados na importação`);
  return info.changes;
}

function wasDeleted(email){
  const value=String(email||'').trim().toLowerCase();
  if(!value) return false;
  return !!db.prepare(`SELECT 1 FROM deleted_prospects WHERE lower(trim(email))=? LIMIT 1`).get(value);
}

module.exports={cleanupDeletedProspects,wasDeleted};