const fs = require('fs');
const path = require('path');

// Instala antes do servidor o registo permanente dos prospects apagados.
// Assim, qualquer eliminação feita no CRM fica guardada na BD persistente.
const { cleanupDeletedProspects } = require('./prospect-deleted-guard');

// Sincroniza o módulo de relatórios Meta antes de arrancar o servidor.
require('./meta-report-pdf-sync-patch');
require('./meta-report-preview-sync-patch');
require('./meta-report-email-sync-patch');
require('./email-signature-patch');
require('./client-deeplink-patch');
require('./client-calendar-stats-patch');
require('./client-social-lifetime-total-patch');
require('./client-social-stats-total-patch');
require('./meta-report-scheduling-sync-patch');

// Arranca a aplicação com a camada de templates de proposta instalada.
require('./start-proposal-templates');

// Importa automaticamente todas as rondas diárias de prospects, incluindo lotes adicionais do mesmo dia (ex.: -b, -c).
// Depois de cada seed remove imediatamente qualquer contacto que já tenha sido apagado no CRM.
// Regista os IDs existentes antes dos seeds para preservar escolhas manuais.
const prospectDb = require('./db');
const existingProspectIds = new Set(prospectDb.prepare('SELECT user_id FROM prospect_crm').all().map(r=>r.user_id));
const datedSeed = /^prospect-seed-\d{4}-\d{2}-\d{2}(?:-[a-z0-9]+)?\.js$/i;
for (const file of fs.readdirSync(__dirname).filter(name => datedSeed.test(name)).sort()) {
  try {
    require(path.join(__dirname, file));
    cleanupDeletedProspects();
  } catch (e) {
    console.warn(`[crm] não foi possível importar ${file}:`, e.message);
  }
}

// Limpeza final de segurança para impedir que um seed volte a deixar um prospect apagado na listagem.
cleanupDeletedProspects();

// Garante que propostas criadas pelo gerador antigo usam o texto comercial DUIT atual.
require('./prospect-email-template');

// Aplica a campanha DUIT Design apenas aos prospects novos importados nesta execução.
try {
  require('./prospect-email-resolver').ensureTable();
  const lp = prospectDb.prepare("SELECT id FROM landing_pages WHERE slug='duit-design' AND is_active=1").get();
  const tpl = prospectDb.prepare("SELECT id FROM prospect_email_templates WHERE name=? AND is_active=1 ORDER BY id LIMIT 1").get('DUIT Design — O seu designer');
  if (!lp || !tpl) throw new Error('Campanha DUIT Design ativa não encontrada');
  const rows = prospectDb.prepare("SELECT c.user_id FROM prospect_crm c JOIN users u ON u.id=c.user_id WHERE u.is_prospect=1 AND c.lead_status='por_contactar'").all();
  const update = prospectDb.prepare("UPDATE prospect_crm SET landing_page_id=?,email_template_id=?,updated_at=datetime('now') WHERE user_id=? AND lead_status='por_contactar'");
  let count=0;
  prospectDb.transaction(()=>{for(const row of rows) if(!existingProspectIds.has(row.user_id)) count+=update.run(lp.id,tpl.id,row.user_id).changes;})();
  console.log('[crm] DUIT Design nos novos prospects:',count);
} catch(e) { console.warn('[crm] DUIT Design novos prospects:',e.message); }
