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

  // Corrige a gravação do formulário CRM: a função api() já serializa objetos
  // para JSON. O código antigo fazia JSON.stringify() antes, provocando uma
  // dupla serialização e o backend recebia uma string em vez de req.body.
  source = source.replace(/body:JSON\.stringify\(body\)/g, 'body');

  // Remove o loader antigo que misturava Prospects com Orçamentos.
  source = source.replace(/\n;\(\(\) => \{\n  if \(document\.querySelector\('script\[data-duit-legacy-bridge\]'\)\)[\s\S]*?\n\}\)\(\);\n?/g, '\n');
  const marker = 'prospects-actions.js';
  if (!source.includes(marker)) {
    source += `\n;(() => {\n  if (document.querySelector('script[data-duit-prospect-actions]')) return;\n  const s = document.createElement('script');\n  s.src = '/js/prospects-actions.js?v=20260825d';\n  s.dataset.duitProspectActions = '1';\n  document.body.appendChild(s);\n})();\n`;
  } else {
    // Bump simples da versão para evitar cache do browser/service worker.
    source = source.replace(/prospects-actions\.js\?v=[^'\"]+/g, 'prospects-actions.js?v=20260825d');
  }
  fs.writeFileSync(crmJs, source, 'utf8');
} catch (e) {
  console.warn('[crm] não foi possível ligar ações de Prospects:', e.message);
}

// Usa o logo branco real na sidebar do painel Admin.
try {
  const adminHtml = path.join(__dirname, '..', 'public', 'admin.html');
  let adminSource = fs.readFileSync(adminHtml, 'utf8');
  adminSource = adminSource.replace(
    '<div class="brand"><span class="d">DUIT</span><span class="dot">.</span></div>',
    '<div class="brand"><img src="/logo-branco.png" alt="DUIT" style="display:block;width:100%;max-width:170px;height:auto;object-fit:contain"></div>'
  );
  fs.writeFileSync(adminHtml, adminSource, 'utf8');
} catch (e) {
  console.warn('[admin] não foi possível aplicar o logo branco:', e.message);
}

require('./crm-server');
require('./prospect-seed');
