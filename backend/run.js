const fs = require('fs');
const path = require('path');

// Arranca a aplicação existente primeiro.
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
