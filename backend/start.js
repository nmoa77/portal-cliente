const fs = require('fs');
const path = require('path');

// Prospects é um CRM de prospeção independente de Orçamentos.
// Antes de arrancar, liga apenas as ações próprias do CRM:
// envio/tracking de email, duplicação e conversão em cliente.
try {
  const crmServer = path.join(__dirname, 'crm-server.js');
  let serverSource = fs.readFileSync(crmServer, 'utf8');
  const installLine = "require('./prospect-crm-actions')(capturedApp);";
  if (!serverSource.includes(installLine)) {
    serverSource = serverSource.replace(
      '// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.',
      `${installLine}\n\n// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.`
    );
    fs.writeFileSync(crmServer, serverSource, 'utf8');
  }

  const crmJs = path.join(__dirname, '..', 'public', 'js', 'prospects-crm.js');
  let source = fs.readFileSync(crmJs, 'utf8');
  // Remove o loader antigo que misturava Prospects com Orçamentos.
  source = source.replace(/\n;\(\(\) => \{\n  if \(document\.querySelector\('script\[data-duit-legacy-bridge\]'\)\)[\s\S]*?\n\}\)\(\);\n?/g, '\n');
  const marker = 'prospects-actions.js';
  if (!source.includes(marker)) {
    source += `\n;(() => {\n  if (document.querySelector('script[data-duit-prospect-actions]')) return;\n  const s = document.createElement('script');\n  s.src = '/js/prospects-actions.js?v=20260825c';\n  s.dataset.duitProspectActions = '1';\n  document.body.appendChild(s);\n})();\n`;
  }
  fs.writeFileSync(crmJs, source, 'utf8');
} catch (e) {
  console.warn('[crm] não foi possível ligar ações de Prospects:', e.message);
}

require('./crm-server');
require('./prospect-seed');
