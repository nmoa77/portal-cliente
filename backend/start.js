const fs = require('fs');
const path = require('path');

// Prospects é um CRM de prospeção independente de Orçamentos.
try {
  const crmServer = path.join(__dirname, 'crm-server.js');
  let serverSource = fs.readFileSync(crmServer, 'utf8');
  const installLine = "require('./prospect-crm-actions')(capturedApp);";
  if (!serverSource.includes(installLine)) serverSource = serverSource.replace('// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.', `${installLine}\n\n// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.`);
  const ebookInstallLine = "require('./ebook-leads-actions')(capturedApp);";
  if (!serverSource.includes(ebookInstallLine)) serverSource = serverSource.replace('// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.', `${ebookInstallLine}\n\n// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.`);
  const ebookDeleteInstallLine = "require('./ebook-delete-actions')(capturedApp);";
  if (!serverSource.includes(ebookDeleteInstallLine)) serverSource = serverSource.replace('// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.', `${ebookDeleteInstallLine}\n\n// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.`);

  // A API de Prospects devolve todos os prospects pela ordem real de inserção na BD.
  // O mais recente aparece primeiro. Estado/contacto nunca interfere nesta ordem base.
  serverSource = serverSource.replace(
    /ORDER BY\s+CASE COALESCE\(c\.priority,'possivel'\)\s+WHEN 'atacar' THEN 0 WHEN 'possivel' THEN 1 ELSE 2 END,\s+COALESCE\(c\.updated_at, u\.created_at\) DESC/g,
    'ORDER BY u.id DESC'
  );

  serverSource = serverSource.replace(/prospects-crm\.js\?v=[^'\"]+/g, 'prospects-crm.js?v=20260917a');
  if (!serverSource.includes("/api/app-version")) serverSource = serverSource.replace('// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.', `const DUIT_APP_VERSION = Date.now().toString();\ncapturedApp.get('/api/app-version', (req,res) => { res.set('Cache-Control','no-store, no-cache, must-revalidate'); res.json({version: DUIT_APP_VERSION}); });\n\n// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.`);
  fs.writeFileSync(crmServer, serverSource, 'utf8');

  const crmJs = path.join(__dirname, '..', 'public', 'js', 'prospects-crm.js');
  let source = fs.readFileSync(crmJs, 'utf8');
  source = source.replace(/body:JSON\.stringify\(body\)/g, 'body');
  source = source.replace(/receba também um ebook gratuito com 6 curiosidades\./g,'receba também um ebook gratuito.');

  // “Todos” significa todos os prospects. Sem ordenação por envio por defeito.
  // A ordem normal é a ordem de inserção na BD, com os mais recentes primeiro.
  source = source.replace("crmDateSort='desc'", "crmDateSort='none'");
  source = source.replace("if(crmDateSort==='none')return list.sort((a,b)=>Number(a.id)-Number(b.id));", "if(crmDateSort==='none')return list.sort((a,b)=>Number(b.id)-Number(a.id));");
  source = source.replace("if(crmDateSort==='none')return Number(a.id)-Number(b.id);", "if(crmDateSort==='none')return Number(b.id)-Number(a.id);");
  source = source.replace("if(key==='status'&&value==='all'){crmFilter={q:'',status:'all',priority:'all',proposal:'all'}}", "if(key==='status'&&value==='all'){crmFilter={q:'',status:'all',priority:'all',proposal:'all'};crmDateSort='none'}");
  source = source.replace("Data envio ${crmDateSort==='asc'?'↑':'↓'}", "Data envio ${crmDateSort==='none'?'':(crmDateSort==='asc'?'↑':'↓')}");

  const marker='prospects-actions.js';
  if (!source.includes(marker)) source += `\n;(() => { if (document.querySelector('script[data-duit-prospect-actions]')) return; const s=document.createElement('script'); s.src='/js/prospects-actions.js?v=20260917a'; s.dataset.duitProspectActions='1'; document.body.appendChild(s); })();\n`;
  else source=source.replace(/prospects-actions\.js\?v=[^'\"]+/g,'prospects-actions.js?v=20260917a');
  const uiFixMarker='prospects-ui-fix.js';
  if (!source.includes(uiFixMarker)) source += `\n;(() => { if (document.querySelector('script[data-duit-prospect-ui-fix]')) return; const s=document.createElement('script'); s.src='/js/prospects-ui-fix.js?v=20260917a'; s.dataset.duitProspectUiFix='1'; document.body.appendChild(s); })();\n`;
  else source=source.replace(/prospects-ui-fix\.js\?v=[^'\"]+/g,'prospects-ui-fix.js?v=20260917a');
  const sectorChartMarker='prospects-sector-chart.js';
  if (!source.includes(sectorChartMarker)) source += `\n;(() => { if (document.querySelector('script[data-duit-prospect-sector-chart]')) return; const s=document.createElement('script'); s.src='/js/prospects-sector-chart.js?v=20260917a'; s.dataset.duitProspectSectorChart='1'; document.body.appendChild(s); })();\n`;
  else source=source.replace(/prospects-sector-chart\.js\?v=[^'\"]+/g,'prospects-sector-chart.js?v=20260917a');
  if (!source.includes('DUIT_AUTO_VERSION_REFRESH')) source += `\n;(() => { /* DUIT_AUTO_VERSION_REFRESH */ let knownVersion=null,reloading=false; async function checkVersion(){ if(reloading)return; try{const r=await fetch('/api/app-version?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;const data=await r.json();if(!data?.version)return;if(knownVersion===null){knownVersion=data.version;return;}if(data.version!==knownVersion){reloading=true;location.reload();}}catch(_){}} checkVersion();setInterval(checkVersion,10000);window.addEventListener('focus',checkVersion);document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkVersion();});})();\n`;
  fs.writeFileSync(crmJs,source,'utf8');

  // Analytics: KPI de ebooks no topo e ícone de abertura compatível em todos os browsers.
  try {
    const uiFixJs = path.join(__dirname, '..', 'public', 'js', 'prospects-ui-fix.js');
    let ui = fs.readFileSync(uiFixJs, 'utf8');
    ui = ui.replace("grid-template-columns:repeat(5,minmax(0,1fr))", "grid-template-columns:repeat(6,minmax(0,1fr))");
    ui = ui.replace('<div class="k-label">👁️ Abertos</div>', '<div class="k-label"><span aria-hidden="true">◉</span> Abertos</div>');
    if (!ui.includes('<div class="k-label">Ebooks lidos</div>')) {
      ui = ui.replace(
        '<div class="duit-analytics-card"><div class="k-label">Leituras totais</div><div class="k-value">${reads}</div><div class="k-sub">inclui reaberturas do email</div></div>',
        '<div class="duit-analytics-card"><div class="k-label">Leituras totais</div><div class="k-value">${reads}</div><div class="k-sub">inclui reaberturas do email</div></div>\n        <div class="duit-analytics-card"><div class="k-label">Ebooks lidos</div><div class="k-value">${ebookOpened}</div><div class="k-sub">${pct(ebookOpened,sent)} dos enviados abriram o ebook</div></div>'
      );
    }
    fs.writeFileSync(uiFixJs, ui, 'utf8');
  } catch (e) { console.warn('[prospects] analytics ebook/icon:', e.message); }
} catch(e){console.warn('[crm] não foi possível ligar ações de Prospects:',e.message);}

try { const adminHtml=path.join(__dirname,'..','public','admin.html'); let s=fs.readFileSync(adminHtml,'utf8'); s=s.replace('<div class="brand"><span class="d">DUIT</span><span class="dot">.</span></div>','<div class="brand"><img src="/logo-branco.png" alt="DUIT" style="display:block;width:100%;max-width:135px;height:auto;object-fit:contain"></div>'); fs.writeFileSync(adminHtml,s,'utf8'); } catch(e){}
try { const adminJs=path.join(__dirname,'..','public','js','admin.js'); let s=fs.readFileSync(adminJs,'utf8'); s=s.replace("const initial = (new URLSearchParams(window.location.search).get('view')) || 'home';","const queryView=new URLSearchParams(window.location.search).get('view'); const hashView=decodeURIComponent((window.location.hash||'').replace(/^#/,'')); const initial=hashView||queryView||'home';"); if(!s.includes("window.location.pathname + '#' + encodeURIComponent(view)")) s=s.replace("async function go(view) {\n  state.view = view;","async function go(view) {\n  state.view = view;\n  try { window.history.replaceState({}, document.title, window.location.pathname + '#' + encodeURIComponent(view)); } catch (e) {}"); fs.writeFileSync(adminJs,s,'utf8'); } catch(e){}

require('./crm-server');
require('./prospect-seed');
require('./prospect-seed-20');
require('./prospect-seed-10-email');
require('./prospect-seed-2026-08-29');
require('./prospect-seed-2026-08-31');

try {
  const db = require('./db');
  const invalid = db.prepare(`SELECT id, email FROM users WHERE is_prospect=1 AND (email IS NULL OR TRIM(email)='' OR email NOT LIKE '%@%' OR LOWER(TRIM(email)) LIKE '%@prospect.local' OR LOWER(TRIM(email)) LIKE 'prospect-%' OR LOWER(TRIM(email)) LIKE '%@example.%' OR LOWER(TRIM(email)) LIKE '%@example.com' OR LOWER(TRIM(email)) LIKE '%@test.%')`).all();
  if (invalid.length) { const tx=db.transaction(()=>{for(const row of invalid){db.prepare('DELETE FROM prospect_crm WHERE user_id=?').run(row.id);db.prepare('DELETE FROM users WHERE id=? AND is_prospect=1').run(row.id);}});tx();console.log(`[prospects] removidos ${invalid.length} prospects com email inválido/placeholder.`); }
} catch (e) { console.warn('[prospects] limpeza:', e.message); }

try {
  const db = require('./db');
  const rows = db.prepare(`SELECT u.id,u.company,u.name,c.email_sent_at FROM users u JOIN prospect_crm c ON c.user_id=u.id WHERE u.is_prospect=1 AND c.email_sent_at IS NULL`).all();
  const update = db.prepare(`UPDATE prospect_crm SET proposal_email=?,updated_at=datetime('now') WHERE user_id=? AND email_sent_at IS NULL`);
  const tx = db.transaction(() => {
    for (const p of rows) {
      const company = String(p.company || p.name || 'empresa').trim();
      const email = `Assunto: ${company} — preparámos algo para si\n\nOlá,\n\nEstivemos a ver a comunicação da ${company} e acreditamos que há espaço para tirar mais partido das redes sociais.\n\nPreparámos uma proposta pensada para a ${company}. Veja o que preparámos para si e receba também um ebook gratuito.\n\nCumprimentos,`;
      update.run(email,p.id);
    }
  });
  tx();
  if (rows.length) console.log(`[prospects] modelo curto aplicado a ${rows.length} prospects ainda não enviados.`);
} catch (e) { console.warn('[prospects] atualização do modelo curto:', e.message); }
