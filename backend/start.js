const fs = require('fs');
const path = require('path');

// Bootstrap DUIT: liga as extensões ao servidor capturado antes do listen real.
try {
  const crmServer = path.join(__dirname, 'crm-server.js');
  let serverSource = fs.readFileSync(crmServer, 'utf8');
  const marker = '// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.';
  const installs = [
    "require('./proposal-template-actions')(capturedApp);",
    "require('./prospect-template-actions')(capturedApp);",
    "require('./prospect-crm-actions')(capturedApp);",
    "require('./ebook-leads-actions')(capturedApp);",
    "require('./ebook-delete-actions')(capturedApp);",
    "require('./landing-pages-actions')(capturedApp);"
  ];
  for (const line of installs) {
    if (!serverSource.includes(line)) serverSource = serverSource.replace(marker, `${line}\n\n${marker}`);
  }
  serverSource = serverSource.replace(
    /ORDER BY\s+CASE COALESCE\(c\.priority,'possivel'\)\s+WHEN 'atacar' THEN 0 WHEN 'possivel' THEN 1 ELSE 2 END,\s+COALESCE\(c\.updated_at, u\.created_at\) DESC/g,
    'ORDER BY u.id DESC'
  );
  serverSource = serverSource.replace(/prospects-crm\.js\?v=[^'\"]+/g, 'prospects-crm.js?v=20260922c');
  if (!serverSource.includes('/api/app-version')) {
    serverSource = serverSource.replace(marker, `const DUIT_APP_VERSION = Date.now().toString();\ncapturedApp.get('/api/app-version', (req,res) => { res.set('Cache-Control','no-store, no-cache, must-revalidate'); res.json({version: DUIT_APP_VERSION}); });\n\n${marker}`);
  }
  fs.writeFileSync(crmServer, serverSource, 'utf8');

  // Garante que, no envio, o template predefinido ativo fica gravado no prospect.
  // Isto é feito também aqui para não depender da ordem dos middlewares numa instalação antiga.
  const prospectActionsPath = path.join(__dirname, 'prospect-crm-actions.js');
  let pa = fs.readFileSync(prospectActionsPath, 'utf8');
  if (!pa.includes('DUIT_DEFAULT_TEMPLATE_ON_SEND')) {
    pa = pa.replace(
      "const text=String(req.body?.text||p.proposal_email||'').trim();",
      "/* DUIT_DEFAULT_TEMPLATE_ON_SEND */ const defaultTemplate=(()=>{try{return Number(req.body?.proposal_template_id)||db.prepare(`SELECT id FROM proposal_templates WHERE is_default=1 AND is_active=1 ORDER BY id LIMIT 1`).get()?.id||null}catch(_){return null}})();if(defaultTemplate){try{const cc=db.prepare(`PRAGMA table_info(prospect_crm)`).all();if(!cc.some(c=>c.name==='proposal_template_id'))db.exec(`ALTER TABLE prospect_crm ADD COLUMN proposal_template_id INTEGER`);db.prepare(`UPDATE prospect_crm SET proposal_template_id=? WHERE user_id=?`).run(defaultTemplate,id)}catch(e){console.warn('[crm] template on send:',e.message)}}const text=String(req.body?.text||p.proposal_email||'').trim();"
    );
    fs.writeFileSync(prospectActionsPath, pa, 'utf8');
  }

  // Módulos do painel de Prospects.
  const crmJs = path.join(__dirname, '..', 'public', 'js', 'prospects-crm.js');
  let source = fs.readFileSync(crmJs, 'utf8');
  source = source.replace(/body:JSON\.stringify\(body\)/g, 'body');
  source = source.replace("crmDateSort='desc'", "crmDateSort='none'");
  source = source.replace("if(crmDateSort==='none')return list.sort((a,b)=>Number(a.id)-Number(b.id));", "if(crmDateSort==='none')return list.sort((a,b)=>Number(b.id)-Number(a.id));");
  source = source.replace("if(crmDateSort==='none')return Number(a.id)-Number(b.id);", "if(crmDateSort==='none')return Number(b.id)-Number(a.id);");
  const modules = [
    ['prospects-actions.js','duitProspectActions'],
    ['prospects-ui-fix.js','duitProspectUiFix'],
    ['prospects-sector-chart.js','duitProspectSectorChart']
  ];
  for (const [file,key] of modules) {
    if (!source.includes(file)) source += `\n;(()=>{if(document.querySelector('script[data-${key}]'))return;const s=document.createElement('script');s.src='/js/${file}?v=20260917c';s.dataset.${key}='1';document.body.appendChild(s)})();\n`;
    else source = source.replace(new RegExp(file.replace('.','\\.')+'\\?v=[^\'\"]+','g'), file+'?v=20260917c');
  }
  if (!source.includes('DUIT_AUTO_VERSION_REFRESH')) source += `\n;(()=>{/* DUIT_AUTO_VERSION_REFRESH */let v=null,b=false;async function c(){if(b)return;try{const r=await fetch('/api/app-version?t='+Date.now(),{cache:'no-store'}),d=await r.json();if(!d?.version)return;if(v===null){v=d.version;return}if(d.version!==v){b=true;location.reload()}}catch(_){}}c();setInterval(c,10000);window.addEventListener('focus',c)})();\n`;
  fs.writeFileSync(crmJs, source, 'utf8');

  // BO: templates e gestão DUIT Start.
  const adminHtml = path.join(__dirname, '..', 'public', 'admin.html');
  let ah = fs.readFileSync(adminHtml, 'utf8');
  ah = ah.replace('<div class="brand"><span class="d">DUIT</span><span class="dot">.</span></div>','<div class="brand"><img src="/logo-branco.png" alt="DUIT" style="display:block;width:100%;max-width:135px;height:auto;object-fit:contain"></div>');
  if (!ah.includes('/js/proposal-templates-admin.js')) ah = ah.replace('</body>', '<script src="/js/proposal-templates-admin.js?v=20260918n"></script>\n<script src="/js/duit-start-admin.js?v=20260921e"></script>\n<script src="/js/landing-pages-admin.js?v=20260922a"></script>\n</body>');
  else { ah = ah.replace(/proposal-templates-admin\.js\?v=[^'\"]+/g,'proposal-templates-admin.js?v=20260918n').replace(/duit-start-admin\.js\?v=[^'\"]+/g,'duit-start-admin.js?v=20260921e'); if(!ah.includes('/js/landing-pages-admin.js')) ah=ah.replace('</body>','<script src="/js/landing-pages-admin.js?v=20260922a"></script>\n</body>'); else ah=ah.replace(/landing-pages-admin\.js\?v=[^'\"]+/g,'landing-pages-admin.js?v=20260922a'); }
  fs.writeFileSync(adminHtml, ah, 'utf8');

  // Proposta pública de prospeção: aplica o template selecionado/predefinido.
  const prospectPage = path.join(__dirname, '..', 'public', 'prospect-response.html');
  let ph = fs.readFileSync(prospectPage, 'utf8');
  if (!ph.includes('/js/prospect-template-public.js')) ph = ph.replace('</body>', '<script src="/js/prospect-template-public.js?v=20260921d"></script>\n</body>');
  else ph = ph.replace(/prospect-template-public\.js\?v=[^'\"]+/g,'prospect-template-public.js?v=20260921d');
  fs.writeFileSync(prospectPage, ph, 'utf8');

  // Analytics: mantém 6 KPIs no topo.
  try {
    const uiFixJs = path.join(__dirname, '..', 'public', 'js', 'prospects-ui-fix.js');
    let ui = fs.readFileSync(uiFixJs, 'utf8');
    ui = ui.replace('grid-template-columns:repeat(5,minmax(0,1fr))','grid-template-columns:repeat(6,minmax(0,1fr))');
    fs.writeFileSync(uiFixJs, ui, 'utf8');
  } catch (_) {}
} catch(e) {
  console.warn('[crm] não foi possível ligar ações de Prospects:', e.message);
}

try {
  const adminJs=path.join(__dirname,'..','public','js','admin.js');
  let s=fs.readFileSync(adminJs,'utf8');
  // As páginas novas usam o mesmo router nativo das restantes páginas do Admin.
  s=s.replace("const initial = (new URLSearchParams(window.location.search).get('view')) || 'home';","const queryView=new URLSearchParams(window.location.search).get('view'); const hashView=decodeURIComponent((window.location.hash||'').replace(/^#/,'')); const initial=hashView||queryView||'home';");
  s=s.replace("try { window.history.replaceState({}, document.title, window.location.pathname); } catch (e) {}","try { if(!window.location.hash) window.history.replaceState({}, document.title, window.location.pathname); } catch (e) {}");
  if(!s.includes("DUIT_ROUTE_PERSIST_V3")) s=s.replace("async function go(view) {\n  state.view = view;","async function go(view) {\n  /* DUIT_ROUTE_PERSIST_V3 */\n  state.view = view;\n  try { window.history.replaceState({}, document.title, window.location.pathname + '#' + encodeURIComponent(view)); } catch (e) {}");
  fs.writeFileSync(adminJs,s,'utf8');
} catch(e){}

require('./start-proposal-templates');
require('./crm-server');
require('./prospect-seed');
require('./prospect-seed-20');
require('./prospect-seed-10-email');
require('./prospect-seed-2026-08-29');
require('./prospect-seed-2026-08-31');

try {
  const db = require('./db');
  const invalid = db.prepare(`SELECT id, email FROM users WHERE is_prospect=1 AND (email IS NULL OR TRIM(email)='' OR email NOT LIKE '%@%' OR LOWER(TRIM(email)) LIKE '%@prospect.local' OR LOWER(TRIM(email)) LIKE 'prospect-%' OR LOWER(TRIM(email)) LIKE '%@example.%' OR LOWER(TRIM(email)) LIKE '%@example.com' OR LOWER(TRIM(email)) LIKE '%@test.%')`).all();
  if (invalid.length) {
    const tx=db.transaction(()=>{for(const row of invalid){db.prepare('DELETE FROM prospect_crm WHERE user_id=?').run(row.id);db.prepare('DELETE FROM users WHERE id=? AND is_prospect=1').run(row.id);}});tx();
    console.log(`[prospects] removidos ${invalid.length} prospects com email inválido/placeholder.`);
  }
} catch (e) { console.warn('[prospects] limpeza:', e.message); }
