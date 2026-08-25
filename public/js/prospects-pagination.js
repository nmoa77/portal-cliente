(() => {
  const PAGE_SIZE = 15;
  let currentPage = 1;
  let scheduled = false;

  function isProspectsView() {
    const h1 = document.querySelector('#main h1');
    return !!h1 && /prospec/i.test(h1.textContent || '');
  }

  function getTable() {
    if (!isProspectsView()) return null;
    return document.querySelector('#main .table-card table.table');
  }

  function renderPagination() {
    scheduled = false;
    const table = getTable();
    if (!table) {
      document.getElementById('crm-pagination')?.remove();
      return;
    }

    const rows = Array.from(table.querySelectorAll('tbody > tr'));
    const total = rows.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (currentPage > pages) currentPage = pages;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    rows.forEach((row, i) => { row.style.display = (i >= start && i < end) ? '' : 'none'; });

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

    const from = start + 1;
    const to = Math.min(end, total);
    const buttons = Array.from({length: pages}, (_, i) => i + 1).map(n =>
      `<button type="button" data-crm-page="${n}" class="btn ${n === currentPage ? 'btn-yellow' : 'btn-ghost'} btn-sm" style="min-width:36px">${n}</button>`
    ).join('');

    pager.innerHTML = `
      <span>A mostrar ${from}–${to} de ${total}</span>
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <button type="button" data-crm-page="prev" class="btn btn-ghost btn-sm" ${currentPage === 1 ? 'disabled' : ''}>‹ Anterior</button>
        ${buttons}
        <button type="button" data-crm-page="next" class="btn btn-ghost btn-sm" ${currentPage === pages ? 'disabled' : ''}>Seguinte ›</button>
      </div>`;

    pager.querySelectorAll('[data-crm-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = btn.dataset.crmPage;
        if (v === 'prev') currentPage--;
        else if (v === 'next') currentPage++;
        else currentPage = Number(v) || 1;
        renderPagination();
        table.closest('.table-card')?.scrollIntoView({behavior:'smooth', block:'start'});
      });
    });
  }

  function schedule(reset = false) {
    if (reset) currentPage = 1;
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(renderPagination);
  }

  const main = document.getElementById('main');
  if (main) {
    new MutationObserver(() => schedule(false)).observe(main, {childList:true, subtree:true});
  }

  document.addEventListener('input', e => {
    if (e.target?.id === 'crm-search') setTimeout(() => schedule(true), 0);
  });
  document.addEventListener('change', e => {
    if (e.target?.closest?.('.crm-toolbar')) setTimeout(() => schedule(true), 0);
  });

  schedule(true);
})();
