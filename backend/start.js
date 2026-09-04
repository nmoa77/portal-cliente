const fs = require('fs');
const path = require('path');

// Prospects é um CRM de prospeção independente de Orçamentos.
try {
  const crmServer = path.join(__dirname, 'crm-server.js');
  let serverSource = fs.readFileSync(crmServer, 'utf8');
  const installLine = "require('./prospect-crm-actions')(capturedApp);";
  if (!serverSource.includes(installLine)) serverSource = serverSource.replace('// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.', `${installLine}\n\n// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.`);
  serverSource = serverSource.replace(/prospects-crm\.js\?v=[^'\"]+/g, 'prospects-crm.js?v=20260904b');
  fs.writeFileSync(crmServer, serverSource, 'utf8');
} catch (e) { console.warn('[crm] patch:', e.message); }

// Regra DUIT: só permanecem prospects com email real. Remove vazios e placeholders.
try {
  const db = require('./db');
  const invalid = db.prepare(`
    SELECT id FROM users
    WHERE is_prospect=1 AND (
      email IS NULL OR TRIM(email)='' OR email NOT LIKE '%@%'
      OR LOWER(TRIM(email)) LIKE '%@prospect.local'
      OR LOWER(TRIM(email)) LIKE 'prospect-%'
      OR LOWER(TRIM(email)) LIKE '%@example.%'
      OR LOWER(TRIM(email)) LIKE '%@example.com'
      OR LOWER(TRIM(email)) LIKE '%@test.%'
    )
  `).all();
  if (invalid.length) {
    const tx = db.transaction(() => {
      for (const row of invalid) {
        db.prepare('DELETE FROM prospect_crm WHERE user_id=?').run(row.id);
        db.prepare('DELETE FROM users WHERE id=? AND is_prospect=1').run(row.id);
      }
    });
    tx();
    console.log(`[prospects] removidos ${invalid.length} prospects sem email real/placeholder.`);
  }
} catch (e) { console.warn('[prospects] limpeza:', e.message); }

require('./crm-server');
require('./prospect-seed');
require('./prospect-seed-20');
require('./prospect-seed-10-email');
require('./prospect-seed-2026-08-29');
require('./prospect-seed-2026-08-31');
