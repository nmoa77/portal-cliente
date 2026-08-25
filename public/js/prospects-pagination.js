(() => {
  const PAGE_SIZE = 15;
  let currentPage = 1;
  let rendering = false;
  let timer = null;

  function getTable() {
    const h1 = document.querySelector('#main h1');
    if (!h1 || !/prospec/i.test(h1.textContent || '')) return null;
    return document.querySelector('#main .table-card table.table');
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
      const rows = Array.from(table.querySelectorAll('tbody > tr'));
      const total = rows.length;
      const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      currentPage = Math.max(1, Math.min(currentPage, pages));
      const start = (currentPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      rows.forEach((row, i) => { row.style.display = i >= start && i < end ? '' : 'none'; });

      let pager = document.getElementById('crm-pagination');
      if (!pager) {
        pager = document.createElement('div');
        pager.id = 'crm-pagination';
        pager.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 2px 0;font-size:13px;color:var(--muted)';
        table.closest('.table-card')?.insertAdjacentElement('afterend', pager);
      }

      if (total <= PAGE_SIZE) {
        pager.innerHTML = `<span>${total} prospect${total === 1 ? '' : 's'}</span>`;
        return;
      }

      const buttons = Array.from({length: pages}, (_, i) => i + 1).map(n => `<button type="button" data-crm-page="${n}" class="btn ${n === currentPage ? 'btn-yellow' : 'btn-ghost'} btn-sm" style="min-width:36px">${n}</button>`).join('');
      pager.innerHTML = `<span>A mostrar ${start + 1}–${Math.min(end,total)} de ${total}</span><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><button type="button" data-crm-page="prev" class="btn btn-ghost btn-sm" ${currentPage===1?'disabled':''}>‹ Anterior</button>${buttons}<button type="button" data-crm-page="next" class="btn btn-ghost btn-sm" ${currentPage===pages?'disabled':''}>Seguinte ›</button></div>`;
    } finally {
      rendering = false;
    }
  }

  // Delegação: os botões são recriados a cada render, por isso o clique fica no document.
  document.addEventListener('click', e => {
    const btn = e.target.closest?.('[data-crm-page]');
    if (!btn || !document.getElementById('crm-pagination')?.contains(btn) || btn.disabled) return;
    e.preventDefault();
    e.stopPropagation();
    const table = getTable();
    if (!table) return;
    const total = table.querySelectorAll('tbody > tr').length;
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
    timer=setTimeout(renderPagination,40);
  }

  const main=document.getElementById('main');
  if(main) new MutationObserver(mutations=>{
    // Ignora alterações provocadas pelo próprio pager fora de #main e mudanças de style nas linhas.
    const structural=mutations.some(m=>m.type==='childList' && (m.addedNodes.length||m.removedNodes.length));
    if(structural) queue(false);
  }).observe(main,{childList:true,subtree:true});

  document.addEventListener('input',e=>{if(e.target?.id==='crm-search') queue(true)});
  document.addEventListener('change',e=>{if(e.target?.closest?.('.crm-toolbar')) queue(true)});
  queue(true);
})();
