(() => {
  const PAGE_SIZE = 15;
  let currentPage = 1;
  let rendering = false;
  let timer = null;
  let kpiFilter = 'all';
  let kpiRows = new Map();
  let kpiLoading = null;

  function getTable() {
    const h1 = document.querySelector('#main h1');
    if (!h1 || !/prospec/i.test(h1.textContent || '')) return null;
    return document.querySelector('#main .table-card table.table');
  }

  function getStatusFilterValue() {
    const toolbar = document.querySelector('#main .crm-toolbar');
    if (!toolbar) return 'all';
    const selects = [...toolbar.querySelectorAll('select')];
    return selects[1]?.value || 'all';
  }

  function rowId(row){
    const m=(row.getAttribute('onclick')||'').match(/openCrmProspect\((\d+)\)/);
    return m ? Number(m[1]) : 0;
  }

  async function loadKpiRows(){
    if(kpiLoading) return kpiLoading;
    kpiLoading=(async()=>{
      try{
        const [prospects,statuses]=await Promise.all([
          api('/api/crm/prospects'),
          api('/api/crm/prospects/email-status')
        ]);
        const sm=new Map((statuses||[]).map(s=>[Number(s.user_id),s]));
        kpiRows=new Map((prospects||[]).map(p=>[Number(p.id),{...p,...(sm.get(Number(p.id))||{})}]));
      }catch(_){ kpiRows=new Map(); }
      finally{ kpiLoading=null; }
    })();
    return kpiLoading;
  }

  function matchesKpi(p){
    if(!p || kpiFilter==='all') return true;
    if(kpiFilter==='sent') return !!p.email_sent_at;
    if(kpiFilter==='opened') return !!p.email_sent_at && (!!p.email_first_opened_at || Number(p.email_open_count||0)>0);
    if(kpiFilter==='responded') return !!p.email_sent_at && (!!p.outreach_response || ['respondeu','interessado','proposta'].includes(p.lead_status));
    if(kpiFilter==='interested') return ['interessado','proposta'].includes(p.lead_status);
    if(kpiFilter==='proposal') return p.lead_status==='proposta' || Number(p.proposal_view_count||0)>0;
    if(kpiFilter==='accepted') return p.outreach_response==='accepted';
    return true;
  }

  function applyKpiFilter(){
    const table=getTable();
    if(!table) return [];
    const rows=Array.from(table.querySelectorAll('tbody > tr'));
    const matched=[];
    rows.forEach(row=>{
      const ok=matchesKpi(kpiRows.get(rowId(row)));
      row.dataset.kpiMatch=ok?'1':'0';
      if(ok) matched.push(row);
    });
    return matched;
  }

  function paintKpiCards(){
    document.querySelectorAll('#duit-prospect-analytics .duit-analytics-card').forEach(card=>{
      const label=(card.querySelector('.k-label')?.textContent||'').toLowerCase();
      const key=label.includes('enviados')?'sent':label.includes('abertos')?'opened':label.includes('responderam')?'responded':label.includes('interessados')?'interested':label.includes('propostas')?'proposal':label.includes('taxa de sucesso')?'accepted':label.trim()==='prospects'?'all':'';
      if(!key) return;
      card.dataset.kpiListFilter=key;
      card.style.cursor='pointer';
      card.title=key==='all'?'Mostrar todos os prospects':'Filtrar a listagem por este indicador';
      card.style.outline=kpiFilter===key?'2px solid #111':'';
      card.style.outlineOffset=kpiFilter===key?'-2px':'';
    });
  }

  function renderPagination() {
    if (rendering) return;
    const table = getTable();
    if (!table) {
      document.getElementById('crm-pagination')?.remove();
      return;
    }

    rendering = true;
    try {
      const allRows = Array.from(table.querySelectorAll('tbody > tr'));
      const rows = kpiFilter==='all' ? allRows : applyKpiFilter();
      const total = rows.length;
      const statusValue = getStatusFilterValue();
      allRows.forEach(row=>{ if(kpiFilter!=='all' && row.dataset.kpiMatch!=='1') row.style.display='none'; });

      let pager = document.getElementById('crm-pagination');
      if (!pager) {
        pager = document.createElement('div');
        pager.id = 'crm-pagination';
        pager.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 2px 0;font-size:13px;color:var(--muted)';
        table.closest('.table-card')?.insertAdjacentElement('afterend', pager);
      }

      if (statusValue === 'all') {
        rows.forEach(row => { row.style.display = ''; });
        currentPage = 1;
        pager.innerHTML = kpiFilter==='all'
          ? `<span>A mostrar todos os ${total} prospects</span>`
          : `<span>A mostrar ${total} de ${allRows.length} prospects · <button type="button" data-clear-kpi-filter class="link">Limpar filtro</button></span>`;
        paintKpiCards();
        return;
      }

      const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      currentPage = Math.max(1, Math.min(currentPage, pages));
      const start = (currentPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      rows.forEach((row, i) => { row.style.display = i >= start && i < end ? '' : 'none'; });

      if (total <= PAGE_SIZE) {
        pager.innerHTML = `<span>${total} prospect${total === 1 ? '' : 's'}${kpiFilter!=='all'?' · <button type="button" data-clear-kpi-filter class="link">Limpar filtro</button>':''}</span>`;
        paintKpiCards();
        return;
      }

      const buttons = Array.from({length: pages}, (_, i) => i + 1).map(n => `<button type="button" data-crm-page="${n}" class="btn ${n === currentPage ? 'btn-yellow' : 'btn-ghost'} btn-sm" style="min-width:36px">${n}</button>`).join('');
      pager.innerHTML = `<span>A mostrar ${start + 1}–${Math.min(end,total)} de ${total}</span><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><button type="button" data-crm-page="prev" class="btn btn-ghost btn-sm" ${currentPage===1?'disabled':''}>‹ Anterior</button>${buttons}<button type="button" data-crm-page="next" class="btn btn-ghost btn-sm" ${currentPage===pages?'disabled':''}>Seguinte ›</button></div>`;
      paintKpiCards();
    } finally {
      rendering = false;
    }
  }

  document.addEventListener('click', async e => {
    const card=e.target.closest?.('#duit-prospect-analytics .duit-analytics-card');
    if(card){
      const key=card.dataset.kpiListFilter;
      if(key){
        e.preventDefault();
        await loadKpiRows();
        kpiFilter=(kpiFilter===key && key!=='all')?'all':key;
        currentPage=1;
        renderPagination();
        getTable()?.closest('.table-card')?.scrollIntoView({behavior:'smooth',block:'start'});
        return;
      }
    }

    const clear=e.target.closest?.('[data-clear-kpi-filter]');
    if(clear){
      e.preventDefault();
      kpiFilter='all';currentPage=1;renderPagination();return;
    }

    const btn = e.target.closest?.('[data-crm-page]');
    if (!btn || !document.getElementById('crm-pagination')?.contains(btn) || btn.disabled) return;
    e.preventDefault();
    e.stopPropagation();
    const table = getTable();
    if (!table) return;
    const total = (kpiFilter==='all'?Array.from(table.querySelectorAll('tbody > tr')):applyKpiFilter()).length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const v = btn.dataset.crmPage;
    if (v === 'prev') currentPage = Math.max(1,currentPage-1);
    else if (v === 'next') currentPage = Math.min(pages,currentPage+1);
    else currentPage = Math.max(1,Math.min(pages,Number(v)||1));
    renderPagination();
    table.closest('.table-card')?.scrollIntoView({behavior:'smooth',block:'start'});
  });

  function queue(reset=false) {
    if (reset) currentPage=1;
    clearTimeout(timer);
    timer=setTimeout(async()=>{if(kpiFilter!=='all')await loadKpiRows();renderPagination();paintKpiCards();},40);
  }

  const main=document.getElementById('main');
  if(main) new MutationObserver(mutations=>{
    const structural=mutations.some(m=>m.type==='childList' && (m.addedNodes.length||m.removedNodes.length));
    if(structural) queue(false);
  }).observe(main,{childList:true,subtree:true});

  document.addEventListener('input',e=>{if(e.target?.id==='crm-search'){kpiFilter='all';queue(true)}});
  document.addEventListener('change',e=>{if(e.target?.closest?.('.crm-toolbar')){kpiFilter='all';queue(true)}});
  queue(true);
})();