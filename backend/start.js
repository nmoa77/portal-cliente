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

  source = source.replace(/body:JSON\.stringify\(body\)/g, 'body');
  source = source.replace(/\n;\(\(\) => \{\n  if \(document\.querySelector\('script\[data-duit-legacy-bridge\]'\)\)[\s\S]*?\n\}\)\(\);\n?/g, '\n');
  const marker = 'prospects-actions.js';
  if (!source.includes(marker)) {
    source += `\n;(() => {\n  if (document.querySelector('script[data-duit-prospect-actions]')) return;\n  const s = document.createElement('script');\n  s.src = '/js/prospects-actions.js?v=20260825d';\n  s.dataset.duitProspectActions = '1';\n  document.body.appendChild(s);\n})();\n`;
  } else {
    source = source.replace(/prospects-actions\.js\?v=[^'\"]+/g, 'prospects-actions.js?v=20260825d');
  }
  fs.writeFileSync(crmJs, source, 'utf8');
} catch (e) {
  console.warn('[crm] não foi possível ligar ações de Prospects:', e.message);
}

// Usa o logo branco real na sidebar do painel Admin e mantém-no mais compacto.
try {
  const adminHtml = path.join(__dirname, '..', 'public', 'admin.html');
  let adminSource = fs.readFileSync(adminHtml, 'utf8');

  adminSource = adminSource.replace(
    '<div class="brand"><span class="d">DUIT</span><span class="dot">.</span></div>',
    '<div class="brand"><img src="/logo-branco.png" alt="DUIT" style="display:block;width:100%;max-width:135px;height:auto;object-fit:contain"></div>'
  );

  adminSource = adminSource.replace(
    /<div class="brand"><img src="\/logo-branco\.png" alt="DUIT" style="[^"]*max-width:\d+px;[^"]*"><\/div>/,
    '<div class="brand"><img src="/logo-branco.png" alt="DUIT" style="display:block;width:100%;max-width:135px;height:auto;object-fit:contain"></div>'
  );

  fs.writeFileSync(adminHtml, adminSource, 'utf8');
} catch (e) {
  console.warn('[admin] não foi possível aplicar o logo branco:', e.message);
}

// Mantém a secção atual da Admin no URL (#prospects, #quotes, etc.).
// Assim, ao fazer refresh, o painel regressa à página onde o utilizador estava.
try {
  const adminJs = path.join(__dirname, '..', 'public', 'js', 'admin.js');
  let adminJsSource = fs.readFileSync(adminJs, 'utf8');

  adminJsSource = adminJsSource.replace(
    "const initial = (new URLSearchParams(window.location.search).get('view')) || 'home';",
    "const queryView = new URLSearchParams(window.location.search).get('view');\n    const hashView = decodeURIComponent((window.location.hash || '').replace(/^#/, ''));\n    const initial = hashView || queryView || 'home';"
  );

  adminJsSource = adminJsSource.replace(
    "try { window.history.replaceState({}, document.title, window.location.pathname); } catch (e) {}",
    "try { window.history.replaceState({}, document.title, window.location.pathname + '#' + encodeURIComponent(initial)); } catch (e) {}"
  );

  if (!adminJsSource.includes("window.location.pathname + '#' + encodeURIComponent(view)")) {
    adminJsSource = adminJsSource.replace(
      "async function go(view) {\n  state.view = view;",
      "async function go(view) {\n  state.view = view;\n  try { window.history.replaceState({}, document.title, window.location.pathname + '#' + encodeURIComponent(view)); } catch (e) {}"
    );
  }

  fs.writeFileSync(adminJs, adminJsSource, 'utf8');
} catch (e) {
  console.warn('[admin] não foi possível manter a página após refresh:', e.message);
}

require('./crm-server');
require('./prospect-seed');
require('./prospect-seed-20');
