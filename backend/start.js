const fs = require('fs');
const path = require('path');

// Garante que o CRM novo carrega também a ponte para o fluxo antigo de propostas.
// Assim mantemos: serviços/valores personalizados, envio por email, leitura e conversão.
try {
  const crmJs = path.join(__dirname, '..', 'public', 'js', 'prospects-crm.js');
  let source = fs.readFileSync(crmJs, 'utf8');
  const marker = 'prospects-legacy-bridge.js';
  if (!source.includes(marker)) {
    source += `\n;(() => {\n  if (document.querySelector('script[data-duit-legacy-bridge]')) return;\n  const s = document.createElement('script');\n  s.src = '/js/prospects-legacy-bridge.js?v=20260825b';\n  s.dataset.duitLegacyBridge = '1';\n  document.body.appendChild(s);\n})();\n`;
    fs.writeFileSync(crmJs, source, 'utf8');
  }
} catch (e) {
  console.warn('[crm] não foi possível ligar bridge de propostas:', e.message);
}

require('./crm-server');
require('./prospect-seed');
