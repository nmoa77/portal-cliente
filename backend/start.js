const fs = require('fs');
const path = require('path');

// Prospects é um CRM de prospeção independente de Orçamentos.
try {
  const crmServer = path.join(__dirname, 'crm-server.js');
  let serverSource = fs.readFileSync(crmServer, 'utf8');
  const installLine = "require('./prospect-crm-actions')(capturedApp);";
  if (!serverSource.includes(installLine)) serverSource = serverSource.replace('// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.', `${installLine}\n\n// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.`);
  serverSource = serverSource.replace(/prospects-crm\.js\?v=[^'\"]+/g, 'prospects-crm.js?v=20260904f');
  if (!serverSource.includes("/api/app-version")) serverSource = serverSource.replace('// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.', `const DUIT_APP_VERSION = Date.now().toString();\ncapturedApp.get('/api/app-version', (req,res) => { res.set('Cache-Control','no-store, no-cache, must-revalidate'); res.json({version: DUIT_APP_VERSION}); });\n\n// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.`);
  fs.writeFileSync(crmServer, serverSource, 'utf8');

  const crmJs = path.join(__dirname, '..', 'public', 'js', 'prospects-crm.js');
  let source = fs.readFileSync(crmJs, 'utf8');
  source = source.replace(/body:JSON\.stringify\(body\)/g, 'body');
  const marker='prospects-actions.js';
  if (!source.includes(marker)) source += `\n;(() => { if (document.querySelector('script[data-duit-prospect-actions]')) return; const s=document.createElement('script'); s.src='/js/prospects-actions.js?v=20260904f'; s.dataset.duitProspectActions='1'; document.body.appendChild(s); })();\n`;
  else source=source.replace(/prospects-actions\.js\?v=[^'\"]+/g,'prospects-actions.js?v=20260904f');

  if (!source.includes('DUIT_AUTO_VERSION_REFRESH')) source += `\n;(() => { /* DUIT_AUTO_VERSION_REFRESH */ let knownVersion=null,reloading=false; async function checkVersion(){ if(reloading)return; try{const r=await fetch('/api/app-version?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;const data=await r.json();if(!data?.version)return;if(knownVersion===null){knownVersion=data.version;return;}if(data.version!==knownVersion){reloading=true;location.reload();}}catch(_){}} checkVersion();setInterval(checkVersion,10000);window.addEventListener('focus',checkVersion);document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkVersion();});})();\n`;

  const oldLoader="async function loadProspects(){ crmProspects = await api('/api/crm/prospects'); return crmProspects; }";
  const newLoader=`async function loadProspects(){ const [prospects,statuses]=await Promise.all([api('/api/crm/prospects'),api('/api/crm/prospects/email-status')]); const sm=new Map((statuses||[]).map(s=>[Number(s.user_id),s])); crmProspects=(prospects||[]).map(p=>({...p,...(sm.get(Number(p.id))||{})})).sort((a,b)=>{const ad=a.email_sent_at?new Date(String(a.email_sent_at).replace(' ','T')+'Z').getTime():0;const bd=b.email_sent_at?new Date(String(b.email_sent_at).replace(' ','T')+'Z').getTime():0;if(ad!==bd)return bd-ad;return Number(b.id||0)-Number(a.id||0);});return crmProspects;}`;
  if(source.includes(oldLoader))source=source.replace(oldLoader,newLoader);
  const oldFiltered="function filteredProspects(){ const q=crmFilter.q.trim().toLowerCase(); return crmProspects.filter(p=>{ if(crmFilter.status!=='all'&&p.lead_status!==crmFilter.status)return false;if(crmFilter.priority!=='all'&&p.priority!==crmFilter.priority)return false;if(!q)return true;return [p.company,p.name,p.email,p.phone,p.sector,p.location,p.opportunity,p.idea].filter(Boolean).join(' ').toLowerCase().includes(q); }); }";
  const newFiltered=`function filteredProspects(){const q=crmFilter.q.trim().toLowerCase();return crmProspects.filter(p=>{if(crmFilter.status!=='all'){if(crmFilter.status==='sem_resposta'){if(!(p.email_sent_at&&!p.outreach_response))return false;}else if(crmFilter.status==='respondeu'){if(!p.outreach_response)return false;}else if(p.lead_status!==crmFilter.status)return false;}if(crmFilter.priority!=='all'&&p.priority!==crmFilter.priority)return false;if(!q)return true;return[p.company,p.name,p.email,p.phone,p.sector,p.location,p.opportunity,p.idea].filter(Boolean).join(' ').toLowerCase().includes(q);});}`;
  if(source.includes(oldFiltered))source=source.replace(oldFiltered,newFiltered);
  source=source.replace('<th>Follow-up</th><th></th>','<th>Último envio</th><th>Follow-up</th><th></th>');
  source=source.replace("<td>${p.follow_up_at?fmtDate(p.follow_up_at):'—'}</td><td><div class=\"crm-actions\">","<td>${p.email_sent_at?fmtDateTime(p.email_sent_at):'—'}</td><td>${p.follow_up_at?fmtDate(p.follow_up_at):'—'}</td><td><div class=\"crm-actions\">");
  fs.writeFileSync(crmJs,source,'utf8');
} catch(e){console.warn('[crm] não foi possível ligar ações de Prospects:',e.message);}

try { const adminHtml=path.join(__dirname,'..','public','admin.html'); let s=fs.readFileSync(adminHtml,'utf8'); s=s.replace('<div class="brand"><span class="d">DUIT</span><span class="dot">.</span></div>','<div class="brand"><img src="/logo-branco.png" alt="DUIT" style="display:block;width:100%;max-width:135px;height:auto;object-fit:contain"></div>'); fs.writeFileSync(adminHtml,s,'utf8'); } catch(e){}
try { const adminJs=path.join(__dirname,'..','public','js','admin.js'); let s=fs.readFileSync(adminJs,'utf8'); s=s.replace("const initial = (new URLSearchParams(window.location.search).get('view')) || 'home';","const queryView=new URLSearchParams(window.location.search).get('view'); const hashView=decodeURIComponent((window.location.hash||'').replace(/^#/,'')); const initial=hashView||queryView||'home';"); if(!s.includes("window.location.pathname + '#' + encodeURIComponent(view)")) s=s.replace("async function go(view) {\n  state.view = view;","async function go(view) {\n  state.view = view;\n  try { window.history.replaceState({}, document.title, window.location.pathname + '#' + encodeURIComponent(view)); } catch (e) {}"); fs.writeFileSync(adminJs,s,'utf8'); } catch(e){}

require('./crm-server');
require('./prospect-seed');
require('./prospect-seed-20');
require('./prospect-seed-10-email');
require('./prospect-seed-2026-08-29');
require('./prospect-seed-2026-08-31');

// Regra DUIT: só permanecem prospects com email real.
// Corre DEPOIS dos seeds para remover definitivamente placeholders antigos.
try {
  const db = require('./db');
  const invalid = db.prepare(`
    SELECT id, email FROM users
    WHERE is_prospect=1 AND (
      email IS NULL OR TRIM(email)='' OR email NOT LIKE '%@%'
      OR LOWER(TRIM(email)) LIKE '%@prospect.local'
      OR LOWER(TRIM(email)) LIKE 'prospect-%'
      OR LOWER(TRIM(email)) LIKE '%@example.%'
      OR LOWER(TRIM(email)) LIKE '%@example.com'
      OR LOWER(TRIM(email)) LIKE '%@test.%'
    )
  `).all();
  if (invalid.length) {
    const tx = db.transaction(() => {
      for (const row of invalid) {
        db.prepare('DELETE FROM prospect_crm WHERE user_id=?').run(row.id);
        db.prepare('DELETE FROM users WHERE id=? AND is_prospect=1').run(row.id);
      }
    });
    tx();
    console.log(`[prospects] removidos ${invalid.length} prospects com email inválido/placeholder.`);
  }
} catch (e) { console.warn('[prospects] limpeza:', e.message); }

// Modelo curto de primeiro contacto. Valores e detalhe ficam apenas na proposta.
try {
  const db = require('./db');
  const rows = db.prepare(`
    SELECT u.id,u.company,u.name,c.opportunity,c.email_sent_at
    FROM users u
    JOIN prospect_crm c ON c.user_id=u.id
    WHERE u.is_prospect=1 AND c.email_sent_at IS NULL
  `).all();

  const update = db.prepare(`UPDATE prospect_crm SET proposal_email=?,updated_at=datetime('now') WHERE user_id=? AND email_sent_at IS NULL`);
  const tx = db.transaction(() => {
    for (const p of rows) {
      const company = String(p.company || p.name || 'empresa').trim();
      const opportunity = String(p.opportunity || 'há margem para tornar a presença nas redes sociais mais consistente e apelativa').trim();
      const email = `Assunto: ${company} — preparámos algo para si\n\nOlá,\n\nEstivemos a ver a comunicação da ${company} e acreditamos que há espaço para tirar mais partido das redes sociais.\n\nNo vosso caso, vemos esta oportunidade: ${opportunity}.\n\nPreparámos uma proposta pensada para a ${company}. Veja o que preparámos para si e receba também um ebook DUIT com 6 curiosidades sobre design, imagem e comunicação.\n\nCumprimentos,`;
      update.run(email,p.id);
    }
  });
  tx();
  if (rows.length) console.log(`[prospects] modelo curto aplicado a ${rows.length} prospects ainda não enviados.`);
} catch (e) { console.warn('[prospects] atualização do modelo curto:', e.message); }
