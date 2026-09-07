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
  const metaReportsInstallLine = "require('./meta-reports-actions')(capturedApp);";
  if (!serverSource.includes(metaReportsInstallLine)) serverSource = serverSource.replace('// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.', `${metaReportsInstallLine}\n\n// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.`);
  serverSource = serverSource.replace(/prospects-crm\.js\?v=[^'\"]+/g, 'prospects-crm.js?v=20260904p');
  if (!serverSource.includes("/api/app-version")) serverSource = serverSource.replace('// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.', `const DUIT_APP_VERSION = Date.now().toString();\ncapturedApp.get('/api/app-version', (req,res) => { res.set('Cache-Control','no-store, no-cache, must-revalidate'); res.json({version: DUIT_APP_VERSION}); });\n\n// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.`);
  fs.writeFileSync(crmServer, serverSource, 'utf8');

  const crmJs = path.join(__dirname, '..', 'public', 'js', 'prospects-crm.js');
  let source = fs.readFileSync(crmJs, 'utf8');
  source = source.replace(/body:JSON\.stringify\(body\)/g, 'body');
  source = source.replace(/receba também um ebook gratuito com 6 curiosidades\./g,'receba também um ebook gratuito.');
  const marker='prospects-actions.js';
  if (!source.includes(marker)) source += `\n;(() => { if (document.querySelector('script[data-duit-prospect-actions]')) return; const s=document.createElement('script'); s.src='/js/prospects-actions.js?v=20260904p'; s.dataset.duitProspectActions='1'; document.body.appendChild(s); })();\n`;
  else source=source.replace(/prospects-actions\.js\?v=[^'\"]+/g,'prospects-actions.js?v=20260904p');
  const uiFixMarker='prospects-ui-fix.js';
  if (!source.includes(uiFixMarker)) source += `\n;(() => { if (document.querySelector('script[data-duit-prospect-ui-fix]')) return; const s=document.createElement('script'); s.src='/js/prospects-ui-fix.js?v=20260904p'; s.dataset.duitProspectUiFix='1'; document.body.appendChild(s); })();\n`;
  else source=source.replace(/prospects-ui-fix\.js\?v=[^'\"]+/g,'prospects-ui-fix.js?v=20260904p');
  if (!source.includes('DUIT_AUTO_VERSION_REFRESH')) source += `\n;(() => { /* DUIT_AUTO_VERSION_REFRESH */ let knownVersion=null,reloading=false; async function checkVersion(){ if(reloading)return; try{const r=await fetch('/api/app-version?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;const data=await r.json();if(!data?.version)return;if(knownVersion===null){knownVersion=data.version;return;}if(data.version!==knownVersion){reloading=true;location.reload();}}catch(_){}} checkVersion();setInterval(checkVersion,10000);window.addEventListener('focus',checkVersion);document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkVersion();});})();\n`;
  fs.writeFileSync(crmJs,source,'utf8');
} catch(e){console.warn('[crm] não foi possível ligar ações de Prospects:',e.message);}

try { const adminHtml=path.join(__dirname,'..','public','admin.html'); let s=fs.readFileSync(adminHtml,'utf8'); s=s.replace('<div class="brand"><span class="d">DUIT</span><span class="dot">.</span></div>','<div class="brand"><img src="/logo-branco.png" alt="DUIT" style="display:block;width:100%;max-width:135px;height:auto;object-fit:contain"></div>'); fs.writeFileSync(adminHtml,s,'utf8'); } catch(e){}
try {
  const adminJs=path.join(__dirname,'..','public','js','admin.js');
  let s=fs.readFileSync(adminJs,'utf8');
  s=s.replace("const initial = (new URLSearchParams(window.location.search).get('view')) || 'home';","const queryView=new URLSearchParams(window.location.search).get('view'); const hashView=decodeURIComponent((window.location.hash||'').replace(/^#/,'')); const initial=hashView||queryView||'home';");
  if(!s.includes("window.location.pathname + '#' + encodeURIComponent(view)")) s=s.replace("async function go(view) {\n  state.view = view;","async function go(view) {\n  state.view = view;\n  try { window.history.replaceState({}, document.title, window.location.pathname + '#' + encodeURIComponent(view)); } catch (e) {}");
  if(!s.includes("id: 'metareports'")) s=s.replace("{ id: 'metaads',   icon: 'quote',   label: 'Meta Ads' },","{ id: 'metaads',   icon: 'quote',   label: 'Meta Ads' },\n    { id: 'metareports', icon: 'cal', label: 'Relatórios Meta' },");
  if(!s.includes("view === 'metareports'")) s=s.replace("else if (view === 'metaads')  await viewMetaAds(main);","else if (view === 'metaads')  await viewMetaAds(main);\n    else if (view === 'metareports') await viewMetaReports(main);");
  const metaUiMarker='meta-reports-admin.js';
  if(!s.includes(metaUiMarker)) s += `\n;(() => { if (document.querySelector('script[data-duit-meta-reports]')) return; const sc=document.createElement('script'); sc.src='/js/meta-reports-admin.js?v=20260907c'; sc.dataset.duitMetaReports='1'; document.body.appendChild(sc); })();\n`;
  else s=s.replace(/meta-reports-admin\.js\?v=[^'\"]+/g,'meta-reports-admin.js?v=20260907c');
  const metaPolishMarker='meta-reports-polish.js';
  if(!s.includes(metaPolishMarker)) s += `\n;(() => { if (document.querySelector('script[data-duit-meta-polish]')) return; const sc=document.createElement('script'); sc.src='/js/meta-reports-polish.js?v=20260907b'; sc.dataset.duitMetaPolish='1'; document.body.appendChild(sc); })();\n`;
  else s=s.replace(/meta-reports-polish\.js\?v=[^'\"]+/g,'meta-reports-polish.js?v=20260907b');
  const metaFixMarker='meta-reports-fix.js';
  if(!s.includes(metaFixMarker)) s += `\n;(() => { if (document.querySelector('script[data-duit-meta-fix]')) return; const sc=document.createElement('script'); sc.src='/js/meta-reports-fix.js?v=20260907d'; sc.dataset.duitMetaFix='1'; document.body.appendChild(sc); })();\n`;
  else s=s.replace(/meta-reports-fix\.js\?v=[^'\"]+/g,'meta-reports-fix.js?v=20260907d');
  fs.writeFileSync(adminJs,s,'utf8');
} catch(e){console.warn('[meta] não foi possível ligar UI de relatórios:',e.message);}

// Acrescenta miniaturas reais e métricas por conteúdo ao relatório Meta sem duplicar a UI principal.
try {
  const metaJs=path.join(__dirname,'..','public','js','meta-reports-admin.js');
  let s=fs.readFileSync(metaJs,'utf8');
  s=s.replace("function topRows(items,network){return items.slice(0,5).map((p,k)=>`<div class=\"mr-top-row\"><div class=\"mr-rank\">0${k+1}</div><div class=\"mr-top-copy\"><span>${network}</span><strong>${esc((p.text||'Publicação sem legenda').slice(0,90))}${(p.text||'').length>90?'…':''}</strong><small>${p.date?new Date(p.date).toLocaleDateString('pt-PT'):''}</small></div><div class=\"mr-top-number\">${n(p.score)}</div></div>`).join('')||'<div class=\"empty\">Sem conteúdos neste período.</div>';}" , "function topRows(items,network){return items.slice(0,5).map((p,k)=>`<div class=\"mr-top-row mr-top-with-image\"><div class=\"mr-rank\">0${k+1}</div><div class=\"mr-thumb\">${p.image?`<img src=\"${esc(p.image)}\" alt=\"\" loading=\"lazy\">`:'<span>Sem imagem</span>'}</div><div class=\"mr-top-copy\"><span>${network}</span><strong>${esc((p.text||'Publicação sem legenda').slice(0,90))}${(p.text||'').length>90?'…':''}</strong><small>${p.date?new Date(p.date).toLocaleDateString('pt-PT'):''}</small></div><div class=\"mr-top-number\">${n(p.score)}<small>${network==='Instagram'?' visualizações':' interações'}</small></div></div>`).join('')||'<div class=\"empty\">Sem conteúdos neste período.</div>';}" );
  s=s.replace("const ig=(d.instagram?.media||[]).map(p=>({text:p.caption||'',date:p.timestamp,score:Number(p.insights?.views||p.insights?.reach||0),eng:Number(p.insights?.total_interactions||0),likes:Number(p.like_count||0),comments:Number(p.comments_count||0)}))", "const ig=(d.instagram?.media||[]).map(p=>({text:p.caption||'',date:p.timestamp,image:p.thumbnail_url||p.media_url||'',score:Number(p.metrics?.views||p.metrics?.reach||0),eng:Number(p.metrics?.total_interactions||0),likes:Number(p.like_count||0),comments:Number(p.comments_count||0)}))");
  s=s.replace("const fb=(d.facebook?.posts||[]).map(p=>({text:p.message||'',date:p.created_time,score:Number(p.reactions?.summary?.total_count||0)+Number(p.comments?.summary?.total_count||0)+Number(p.shares?.count||0)}))", "const fb=(d.facebook?.posts||[]).map(p=>({text:p.message||'',date:p.created_time,image:p.full_picture||p.attachments?.data?.[0]?.media?.image?.src||p.attachments?.data?.[0]?.subattachments?.data?.[0]?.media?.image?.src||'',score:Number(p.reactions_count||p.reactions?.summary?.total_count||0)+Number(p.comments_count||p.comments?.summary?.total_count||0)+Number(p.shares_count||p.shares?.count||0)}))");
  s=s.replace('.mr-top-row{display:grid;grid-template-columns:52px 1fr 100px;', '.mr-top-row{display:grid;grid-template-columns:52px 1fr 100px;').replace('.mr-rank{font-size:24px;color:#aaa}', '.mr-top-with-image{grid-template-columns:52px 92px 1fr 110px}.mr-thumb{width:82px;height:82px;border-radius:8px;overflow:hidden;background:#f2f2ef;display:flex;align-items:center;justify-content:center;color:#aaa;font-size:10px}.mr-thumb img{width:100%;height:100%;object-fit:cover;display:block}.mr-rank{font-size:24px;color:#aaa}').replace('.mr-top-number{text-align:right;font-size:22px;font-weight:800}', '.mr-top-number{text-align:right;font-size:22px;font-weight:800}.mr-top-number small{display:block;font-size:9px;color:#999;text-transform:uppercase;letter-spacing:.08em;margin-top:3px}');
  fs.writeFileSync(metaJs,s,'utf8');
} catch(e){console.warn('[meta] não foi possível aplicar miniaturas ao relatório:',e.message);}

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
