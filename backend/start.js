const fs = require('fs');
const path = require('path');

// Prospects é um CRM de prospeção independente de Orçamentos.
try {
  const crmServer = path.join(__dirname, 'crm-server.js');
  let serverSource = fs.readFileSync(crmServer, 'utf8');
  const installLine = "require('./prospect-crm-actions')(capturedApp);";
  if (!serverSource.includes(installLine)) {
    serverSource = serverSource.replace(
      '// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.',
      `${installLine}\n\n// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.`
    );
  }

  // Endpoint simples com a versão deste arranque. Em cada deploy/restart muda automaticamente.
  // O frontend usa-o para perceber que existe uma versão nova e recarrega sozinho.
  if (!serverSource.includes("/api/app-version")) {
    serverSource = serverSource.replace(
      '// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.',
      `const DUIT_APP_VERSION = Date.now().toString();\ncapturedApp.get('/api/app-version', (req,res) => {\n  res.set('Cache-Control','no-store, no-cache, must-revalidate');\n  res.json({version: DUIT_APP_VERSION});\n});\n\n// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.`
    );
  }
  fs.writeFileSync(crmServer, serverSource, 'utf8');

  const crmJs = path.join(__dirname, '..', 'public', 'js', 'prospects-crm.js');
  let source = fs.readFileSync(crmJs, 'utf8');

  source = source.replace(/body:JSON\.stringify\(body\)/g, 'body');
  source = source.replace(/\n;\(\(\) => \{\n  if \(document\.querySelector\('script\[data-duit-legacy-bridge\]'\)\)[\s\S]*?\n\}\)\(\);\n?/g, '\n');

  const marker = 'prospects-actions.js';
  if (!source.includes(marker)) {
    source += `\n;(() => {\n  if (document.querySelector('script[data-duit-prospect-actions]')) return;\n  const s = document.createElement('script');\n  s.src = '/js/prospects-actions.js?v=20260827a';\n  s.dataset.duitProspectActions = '1';\n  document.body.appendChild(s);\n})();\n`;
  } else {
    source = source.replace(/prospects-actions\.js\?v=[^'\"]+/g, 'prospects-actions.js?v=20260827a');
  }

  // Auto-refresh após novo deploy: verifica a versão do servidor e recarrega a página sozinho.
  if (!source.includes('DUIT_AUTO_VERSION_REFRESH')) {
    source += `\n;(() => {\n  /* DUIT_AUTO_VERSION_REFRESH */\n  let knownVersion = null;\n  let reloading = false;\n  async function checkVersion(){\n    if (reloading) return;\n    try {\n      const r = await fetch('/api/app-version?t=' + Date.now(), { cache:'no-store' });\n      if (!r.ok) return;\n      const data = await r.json();\n      if (!data?.version) return;\n      if (knownVersion === null) { knownVersion = data.version; return; }\n      if (data.version !== knownVersion) {\n        reloading = true;\n        location.reload();\n      }\n    } catch (_) {}\n  }\n  checkVersion();\n  setInterval(checkVersion, 10000);\n  window.addEventListener('focus', checkVersion);\n  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkVersion(); });\n})();\n`;
  }

  source = source.replace(/\n;\(\(\) => \{\n  if \(document\.querySelector\('script\[data-duit-prospect-pagination\]'\)\)[\s\S]*?\n\}\)\(\);\n?/g, '\n');

  const oldLoader = "async function loadProspects(){ crmProspects = await api('/api/crm/prospects'); return crmProspects; }";
  const newLoader = `async function loadProspects(){
    const [prospects,statuses] = await Promise.all([api('/api/crm/prospects'),api('/api/crm/prospects/email-status')]);
    const sm = new Map((statuses||[]).map(s=>[Number(s.user_id),s]));
    crmProspects = (prospects||[]).map(p=>({...p,...(sm.get(Number(p.id))||{})})).sort((a,b)=>{
      const ad = a.email_sent_at ? new Date(String(a.email_sent_at).replace(' ','T')+'Z').getTime() : 0;
      const bd = b.email_sent_at ? new Date(String(b.email_sent_at).replace(' ','T')+'Z').getTime() : 0;
      if (ad !== bd) return bd - ad;
      return Number(b.id||0) - Number(a.id||0);
    });
    return crmProspects;
  }`;
  if (source.includes(oldLoader)) source = source.replace(oldLoader, newLoader);

  if (!source.includes('DUIT_CRM_NATIVE_PAGINATION')) {
    const paginationPatch = `\n  /* DUIT_CRM_NATIVE_PAGINATION */\n  let crmCurrentPage = 1;\n  const CRM_PAGE_SIZE = 15;\n  const crmRenderTableBase = renderCrmTable;\n\n  function crmApplyNativePagination(main) {\n    const table = main?.querySelector('.table-card table.table');\n    main?.querySelector('#crm-pagination-native')?.remove();\n    if (!table) return;\n    const rows = Array.from(table.querySelectorAll('tbody > tr'));\n    const total = rows.length;\n    const pages = Math.max(1, Math.ceil(total / CRM_PAGE_SIZE));\n    crmCurrentPage = Math.max(1, Math.min(crmCurrentPage, pages));\n    const start = (crmCurrentPage - 1) * CRM_PAGE_SIZE;\n    const end = Math.min(start + CRM_PAGE_SIZE, total);\n    rows.forEach((row, index) => { row.style.display = index >= start && index < end ? '' : 'none'; });\n    const pager = document.createElement('div');\n    pager.id = 'crm-pagination-native';\n    pager.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 2px 0;font-size:13px;color:var(--muted)';\n    if (total <= CRM_PAGE_SIZE) {\n      pager.innerHTML = '<span>' + total + ' prospect' + (total === 1 ? '' : 's') + '</span>';\n    } else {\n      const nums = Array.from({length:pages}, (_,i)=>i+1).map(n => '<button type="button" class="btn ' + (n===crmCurrentPage?'btn-yellow':'btn-ghost') + ' btn-sm" style="min-width:36px" onclick="crmGoPage(' + n + ')">' + n + '</button>').join('');\n      pager.innerHTML = '<span>A mostrar ' + (start + 1) + '–' + end + ' de ' + total + '</span><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><button type="button" class="btn btn-ghost btn-sm" onclick="crmGoPage(' + (crmCurrentPage - 1) + ')" ' + (crmCurrentPage===1?'disabled':'') + '>‹ Anterior</button>' + nums + '<button type="button" class="btn btn-ghost btn-sm" onclick="crmGoPage(' + (crmCurrentPage + 1) + ')" ' + (crmCurrentPage===pages?'disabled':'') + '>Seguinte ›</button></div>';\n    }\n    table.closest('.table-card')?.insertAdjacentElement('afterend', pager);\n  }\n  renderCrmTable = function(main) { crmRenderTableBase(main); crmApplyNativePagination(main); };\n  window.crmGoPage = function(page) {\n    const total = filteredProspects().length;\n    const pages = Math.max(1, Math.ceil(total / CRM_PAGE_SIZE));\n    crmCurrentPage = Math.max(1, Math.min(Number(page) || 1, pages));\n    renderCrmTable(document.getElementById('main'));\n    document.querySelector('#main .table-card')?.scrollIntoView({behavior:'smooth', block:'start'});\n  };\n  const crmSetFilterBase = window.crmSetFilter;\n  if (typeof crmSetFilterBase === 'function') { window.crmSetFilter = function(key, value) { crmCurrentPage = 1; return crmSetFilterBase(key, value); }; }\n`;
    source = source.replace('\n  window.viewProspects=async function(main){', paginationPatch + '\n  window.viewProspects=async function(main){');
  }

  fs.writeFileSync(crmJs, source, 'utf8');
} catch (e) {
  console.warn('[crm] não foi possível ligar ações/paginação de Prospects:', e.message);
}

try {
  const adminHtml = path.join(__dirname, '..', 'public', 'admin.html');
  let adminSource = fs.readFileSync(adminHtml, 'utf8');
  adminSource = adminSource.replace('<div class="brand"><span class="d">DUIT</span><span class="dot">.</span></div>','<div class="brand"><img src="/logo-branco.png" alt="DUIT" style="display:block;width:100%;max-width:135px;height:auto;object-fit:contain"></div>');
  adminSource = adminSource.replace(/<div class="brand"><img src="\/logo-branco\.png" alt="DUIT" style="[^"]*max-width:\d+px;[^"]*"><\/div>/,'<div class="brand"><img src="/logo-branco.png" alt="DUIT" style="display:block;width:100%;max-width:135px;height:auto;object-fit:contain"></div>');
  fs.writeFileSync(adminHtml, adminSource, 'utf8');
} catch (e) { console.warn('[admin] não foi possível aplicar o logo branco:', e.message); }

try {
  const adminJs = path.join(__dirname, '..', 'public', 'js', 'admin.js');
  let adminJsSource = fs.readFileSync(adminJs, 'utf8');
  adminJsSource = adminJsSource.replace("const initial = (new URLSearchParams(window.location.search).get('view')) || 'home';","const queryView = new URLSearchParams(window.location.search).get('view');\n    const hashView = decodeURIComponent((window.location.hash || '').replace(/^#/, ''));\n    const initial = hashView || queryView || 'home';");
  adminJsSource = adminJsSource.replace("try { window.history.replaceState({}, document.title, window.location.pathname); } catch (e) {}","try { window.history.replaceState({}, document.title, window.location.pathname + '#' + encodeURIComponent(initial)); } catch (e) {}");
  if (!adminJsSource.includes("window.location.pathname + '#' + encodeURIComponent(view)")) {
    adminJsSource = adminJsSource.replace("async function go(view) {\n  state.view = view;","async function go(view) {\n  state.view = view;\n  try { window.history.replaceState({}, document.title, window.location.pathname + '#' + encodeURIComponent(view)); } catch (e) {}");
  }
  fs.writeFileSync(adminJs, adminJsSource, 'utf8');
} catch (e) { console.warn('[admin] não foi possível manter a página após refresh:', e.message); }

require('./crm-server');
require('./prospect-seed');
require('./prospect-seed-20');
