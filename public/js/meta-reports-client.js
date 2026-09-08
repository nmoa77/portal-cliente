/* DUIT — Relatórios Meta na área de cliente */
(() => {
  const oldRenderShell=window.renderShell;
  const oldGo=window.go;
  const months=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  let rows=[],filterMonth='',filterYear='',previewId=null;

  function monthName(m){return months[Number(m)-1]||'';}
  function statusLabel(s){return ({pending:'A preparar',collecting:'A gerar',ready:'Disponível',sent:'Disponível',error:'Erro'})[s]||s;}
  function fmtDate(v){if(!v)return'—';try{return new Date(String(v).replace(' ','T')+'Z').toLocaleDateString('pt-PT',{day:'2-digit',month:'short',year:'numeric'});}catch(_){return v;}}
  function filtered(){return rows.filter(r=>(!filterMonth||String(r.ref_month)===String(filterMonth))&&(!filterYear||String(r.ref_year)===String(filterYear)));}
  function latest(){return [...rows].filter(r=>r.pdf_path).sort((a,b)=>(Number(b.ref_year)-Number(a.ref_year))||(Number(b.ref_month)-Number(a.ref_month)))[0]||null;}
  function currentYears(){const now=new Date().getFullYear(),from=Math.min(2024,...rows.map(r=>Number(r.ref_year)||now));return Array.from({length:now-from+1},(_,i)=>now-i);}

  async function markViewed(id){try{await api(`/api/meta/reports/${id}/viewed`,{method:'POST'});}catch(_){}}

  function latestCard(){const r=latest();if(!r)return'';return `<div class="card" style="margin:22px 0 24px;padding:0;overflow:hidden;border:0;background:#0b0b0b;color:white">
    <div style="padding:28px 30px;display:grid;grid-template-columns:1fr auto;gap:24px;align-items:end">
      <div><div class="eyebrow" style="color:#8d8d8d">Último relatório</div><div style="font-family:'Clash Display',sans-serif;font-size:38px;font-weight:600;line-height:1;margin-top:8px;text-transform:capitalize">${monthName(r.ref_month)} ${r.ref_year}</div><div style="font-size:13px;color:#aaa;margin-top:10px">Gerado em ${fmtDate(r.generated_at||r.created_at)}</div></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end"><button class="btn btn-ghost btn-sm" data-report-preview="${r.id}" style="background:#fff;color:#111;border-color:#fff">Pré-visualizar</button><a class="btn btn-yellow btn-sm" data-report-download="${r.id}" href="/api/meta/reports/${r.id}/pdf">Descarregar PDF</a></div>
    </div>
    <div style="height:5px;background:#ffd60a"></div>
  </div>`;}

  function previewBlock(){const r=rows.find(x=>Number(x.id)===Number(previewId));if(!r||!r.pdf_path)return'';return `<div class="card" style="margin-bottom:24px;padding:0;overflow:hidden">
    <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 18px;border-bottom:1px solid var(--line-2)"><div><div class="eyebrow">Pré-visualização</div><strong style="font-size:17px;text-transform:capitalize">${monthName(r.ref_month)} ${r.ref_year}</strong></div><button class="btn btn-ghost btn-sm" data-close-preview>Fechar</button></div>
    <iframe src="/api/meta/reports/${r.id}/pdf#toolbar=0&navpanes=0" title="Pré-visualização do relatório" style="display:block;width:100%;height:680px;border:0;background:#e9e9e7"></iframe>
  </div>`;}

  function filtersHtml(){return `<div style="display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin:0 0 14px"><div><div class="eyebrow">Histórico</div><h2 style="margin:4px 0 0">Todos os relatórios</h2></div><div style="display:flex;gap:8px;flex-wrap:wrap"><select class="input" id="client-report-month" style="width:auto"><option value="">Todos os meses</option>${months.map((m,i)=>`<option value="${i+1}" ${String(filterMonth)===String(i+1)?'selected':''}>${m[0].toUpperCase()+m.slice(1)}</option>`).join('')}</select><select class="input" id="client-report-year" style="width:auto"><option value="">Todos os anos</option>${currentYears().map(y=>`<option value="${y}" ${String(filterYear)===String(y)?'selected':''}>${y}</option>`).join('')}</select></div></div>`;}

  function listHtml(){const data=filtered();if(!data.length)return'<div class="card"><div class="empty">Não existem relatórios para este período.</div></div>';return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:14px">${data.map(r=>`<div class="card" style="padding:20px;display:flex;flex-direction:column;gap:18px;min-height:165px"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start"><div><div class="eyebrow">Relatório mensal</div><strong style="font-family:'Clash Display',sans-serif;font-size:23px;text-transform:capitalize">${monthName(r.ref_month)} ${r.ref_year}</strong><div style="font-size:12px;color:var(--muted);margin-top:5px">${r.summary_text||'Desempenho mensal das redes sociais'}</div></div><span class="pill ${r.status==='ready'||r.status==='sent'?'ok':r.status==='error'?'err':''}">${statusLabel(r.status)}</span></div><div style="margin-top:auto;display:flex;gap:8px;flex-wrap:wrap">${r.pdf_path?`<button class="btn btn-ghost btn-sm" data-report-preview="${r.id}">Pré-visualizar</button><a class="btn btn-yellow btn-sm" data-report-download="${r.id}" href="/api/meta/reports/${r.id}/pdf">Descarregar PDF</a>`:''}</div></div>`).join('')}</div>`;}

  function render(main){main.innerHTML=`<div class="page-head"><div><div class="eyebrow">Redes sociais</div><h1>Relatórios mensais</h1><p class="lede">Acompanhe o histórico, pré-visualize e descarregue os seus relatórios mensais.</p></div><div style="align-self:flex-end"><span class="pill accent">${rows.filter(r=>r.pdf_path).length} relatório${rows.filter(r=>r.pdf_path).length===1?'':'s'}</span></div></div>${latestCard()}${previewBlock()}${filtersHtml()}${listHtml()}`;}

  async function viewReports(main){rows=await api('/api/meta/reports');render(main);}

  document.addEventListener('change',e=>{if(e.target.id==='client-report-month'){filterMonth=e.target.value;render(document.getElementById('main'));}if(e.target.id==='client-report-year'){filterYear=e.target.value;render(document.getElementById('main'));}},true);
  document.addEventListener('click',e=>{const p=e.target.closest?.('[data-report-preview]');if(p){e.preventDefault();previewId=Number(p.dataset.reportPreview);markViewed(previewId);render(document.getElementById('main'));setTimeout(()=>document.querySelector('iframe[title="Pré-visualização do relatório"]')?.scrollIntoView({behavior:'smooth',block:'start'}),30);return;}if(e.target.closest?.('[data-close-preview]')){previewId=null;render(document.getElementById('main'));return;}const a=e.target.closest?.('[data-report-download]');if(a){markViewed(Number(a.dataset.reportDownload));try{const ok=navigator.sendBeacon?.(`/api/meta/reports/${a.dataset.reportDownload}/downloaded`,new Blob([], {type:'application/json'}));if(ok===false)api(`/api/meta/reports/${a.dataset.reportDownload}/downloaded`,{method:'POST'}).catch(()=>{});}catch(_){api(`/api/meta/reports/${a.dataset.reportDownload}/downloaded`,{method:'POST'}).catch(()=>{});}}},true);

  if(typeof oldRenderShell==='function'){
    window.renderShell=function(){oldRenderShell();const nav=document.getElementById('nav');if(nav&&!nav.querySelector('[data-view="reports"]')){const b=document.createElement('button');b.className='nav-item';b.dataset.view='reports';b.innerHTML=`${typeof svg==='function'?svg('cal'):''}<span>Relatórios</span>`;b.addEventListener('click',()=>window.go('reports'));nav.appendChild(b);}if(typeof setActive==='function')setActive();};
  }
  if(typeof oldGo==='function'){
    window.go=async function(view){if(view!=='reports')return oldGo(view);state.view='reports';if(typeof setActive==='function')setActive();const main=document.getElementById('main');main.innerHTML='<div class="empty">A carregar…</div>';try{await viewReports(main);}catch(e){main.innerHTML=`<div class="empty">Erro: ${typeof escapeHtml==='function'?escapeHtml(e.message):e.message}</div>`;}if(typeof refreshSummary==='function')await refreshSummary();window.renderShell();};
  }
  setTimeout(()=>{if(window.state?.view==='reports')window.go?.('reports');else window.renderShell?.();},0);
})();
