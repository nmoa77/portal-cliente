const fs = require('fs');
const path = require('path');

// Primeiro sincroniza o PDF, preview, email e deep links com os modelos aprovados.
// Estes patches têm de correr ANTES de o módulo de automação Meta ser carregado.
require('./meta-report-pdf-sync-patch');
require('./meta-report-preview-sync-patch');
require('./meta-report-email-sync-patch');
require('./email-signature-patch');
require('./client-deeplink-patch');
require('./client-calendar-stats-patch');
require('./client-social-stats-total-patch');

// Liga depois o fluxo completo de relatórios Meta (backend + admin + cliente).
require('./meta-report-start-patch');

// Arranca a aplicação existente.
require('./start');

// Importa automaticamente todas as rondas diárias de prospects.
// Cada seed valida empresa/email antes de inserir, por isso é seguro repetir no arranque.
const datedSeed = /^prospect-seed-\d{4}-\d{2}-\d{2}\.js$/;
for (const file of fs.readdirSync(__dirname).filter(name => datedSeed.test(name)).sort()) {
  try {
    require(path.join(__dirname, file));
  } catch (e) {
    console.warn(`[crm] não foi possível importar ${file}:`, e.message);
  }
}

// Garante que propostas criadas pelo gerador antigo usam o texto comercial DUIT atual.
require('./prospect-email-template');
