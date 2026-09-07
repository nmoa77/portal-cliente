/* DUIT — Relatórios Meta na área de cliente */
(() => {
  const oldRenderShell=window.renderShell;
  const oldGo=window.go;

  function monthName(m){return ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'][Number(m)-1]||'';}
  function statusLabel(s){return ({pending:'A preparar',collecting:'A gerar',ready:'Disponível',sent:'Disponível',error:'Erro'})[s]||s;}
  async function markViewed(rows){await Promise.all((rows||[]).filter(r=>r.pdf_path).map(r=>api(`/api/meta/reports/${r.id}/viewed`,{method:'POST'}).catch(()=>null)));}

  async function viewReports(main){
    const rows=await api('/api/meta/reports');
    await markViewed(rows);
    main.innerHTML=`<div class="page-head"><div><div class="eyebrow">Redes sociais</div><h1>Relatórios mensais</h1><p class="lede">Consulte e descarregue os relatórios de desempenho das suas redes sociais.</p></div></div>
    <div class="card table-card">${rows.length?rows.map(r=>`<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:16px 0;border-bottom:1px solid var(--line-2)"><div><strong style="font-size:16px">${monthName(r.ref_month)} ${r.ref_year}</strong><div style="font-size:12px;color:var(--muted);margin-top:4px">${r.summary_text||'Relatório mensal de redes sociais'}</div></div><div style="display:flex;align-items:center;gap:10px"><span class="pill ${r.status==='ready'||r.status==='sent'?'ok':r.status==='error'?'err':''}">${statusLabel(r.status)}</span>${r.pdf_path?`<a class="btn btn-yellow btn-sm" data-report-download="${r.id}" href="/api/meta/reports/${r.id}/pdf">Descarregar PDF</a>`:''}</div></div>`).join(''):'<div class="empty">Ainda não existem relatórios disponíveis.</div>'}</div>`;
  }

  document.addEventListener('click',e=>{const a=e.target.closest?.('[data-report-download]');if(!a)return;try{navigator.sendBeacon?.(`/api/meta/reports/${a.dataset.reportDownload}/downloaded`,new Blob([], {type:'application/json'}));}catch(_){api(`/api/meta/reports/${a.dataset.reportDownload}/downloaded`,{method:'POST'}).catch(()=>{});}},true);

  if(typeof oldRenderShell==='function'){
    window.renderShell=function(){oldRenderShell();const nav=document.getElementById('nav');if(nav&&!nav.querySelector('[data-view="reports"]')){const b=document.createElement('button');b.className='nav-item';b.dataset.view='reports';b.innerHTML=`${typeof svg==='function'?svg('cal'):''}<span>Relatórios</span>`;b.addEventListener('click',()=>window.go('reports'));nav.appendChild(b);}if(typeof setActive==='function')setActive();};
  }
  if(typeof oldGo==='function'){
    window.go=async function(view){if(view!=='reports')return oldGo(view);state.view='reports';if(typeof setActive==='function')setActive();const main=document.getElementById('main');main.innerHTML='<div class="empty">A carregar…</div>';try{await viewReports(main);}catch(e){main.innerHTML=`<div class="empty">Erro: ${escapeHtml(e.message)}</div>`;}if(typeof refreshSummary==='function')await refreshSummary();window.renderShell();};
  }
  setTimeout(()=>{if(window.state?.view==='reports')window.go?.('reports');else window.renderShell?.();},0);
})();
