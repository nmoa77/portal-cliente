const fs = require('fs');
const path = require('path');

// Instala antes do servidor o registo permanente dos prospects apagados.
// Assim, qualquer eliminação feita no CRM fica guardada na BD persistente.
const { cleanupDeletedProspects } = require('./prospect-deleted-guard');

// Arranca a aplicação com a camada de templates de proposta instalada.
require('./start-proposal-templates');

// Importa automaticamente todas as rondas diárias de prospects.
// Depois de cada seed remove imediatamente qualquer contacto que já tenha sido apagado no CRM.
const datedSeed = /^prospect-seed-\d{4}-\d{2}-\d{2}\.js$/;
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
