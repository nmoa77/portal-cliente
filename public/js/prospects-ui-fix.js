/* DUIT — ajustes visuais persistentes dos Prospects */
(() => {
  /* Sem janelas nativas do browser no painel. */
  window.confirm = () => true;
  window.alert = (msg) => {
    try { if (typeof toast === 'function') toast(String(msg || ''), 'cancel'); }
    catch (_) {}
  };

  let manualDateSort = false;

  function installCss(){
    if(document.getElementById('duit-prospects-fit-css')) return;
    const s=document.createElement('style');
    s.id='duit-prospects-fit-css';
    s.textContent=`
      #main .crm-prospects-fit{overflow:hidden!important;max-width:100%}
      #main .crm-prospects-fit table.table{width:100%!important;min-width:0!important;table-layout:fixed}
      #main .crm-prospects-fit th,#main .crm-prospects-fit td{min-width:0!important;max-width:none!important;overflow-wrap:anywhere;word-break:normal;padding-left:10px;padding-right:10px}
      #main .crm-prospects-fit th:nth-child(1),#main .crm-prospects-fit td:nth-child(1){width:18%}
      #main .crm-prospects-fit th:nth-child(2),#main .crm-prospects-fit td:nth-child(2){width:12%}
      #main .crm-prospects-fit th:nth-child(3),#main .crm-prospects-fit td:nth-child(3){width:8%}
      #main .crm-prospects-fit th:nth-child(4),#main .crm-prospects-fit td:nth-child(4){width:9%}
      #main .crm-prospects-fit th:nth-child(5),#main .crm-prospects-fit td:nth-child(5){width:18%}
      #main .crm-prospects-fit th:nth-child(6),#main .crm-prospects-fit td:nth-child(6){width:8%}
      #main .crm-prospects-fit th:nth-child(7),#main .crm-prospects-fit td:nth-child(7){width:8%}
      #main .crm-prospects-fit th:nth-child(8),#main .crm-prospects-fit td:nth-child(8){width:8%}
      #main .crm-prospects-fit th:nth-child(9),#main .crm-prospects-fit td:nth-child(9){width:7%}
      #main .crm-prospects-fit th:nth-child(10),#main .crm-prospects-fit td:nth-child(10){width:4%}
      #main .crm-prospects-fit td:nth-child(5)>div{min-width:0!important}
      #main .crm-prospects-fit .pill{max-width:100%;white-space:normal;line-height:1.2}
      #main .crm-prospects-fit .crm-actions{gap:3px;justify-content:center}
      @media(max-width:1250px){
        #main .crm-prospects-fit th,#main .crm-prospects-fit td{font-size:12px;padding-left:7px;padding-right:7px}
        #main .crm-prospects-fit th:nth-child(9),#main .crm-prospects-fit td:nth-child(9){display:none}
        #main .crm-prospects-fit th:nth-child(1),#main .crm-prospects-fit td:nth-child(1){width:20%}
        #main .crm-prospects-fit th:nth-child(5),#main .crm-prospects-fit td:nth-child(5){width:20%}
      }
    `;
    document.head.appendChild(s);
  }

  function prospectIdFromRow(row){
    const raw=row.getAttribute('onclick')||'';
    const m=raw.match(/openCrmProspect\((\d+)\)/);
    return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
  }

  function getStatusValue(){
    const toolbar=document.querySelector('#main .crm-toolbar');
    if(!toolbar) return null;
    const selects=[...toolbar.querySelectorAll('select')];
    return selects[1]?.value || null;
  }

  function enforceTodosOrder(table){
    if(!table || getStatusValue()!=='all' || manualDateSort) return;
    const tbody=table.tBodies?.[0];
    if(!tbody) return;
    const rows=[...tbody.rows];
    rows.sort((a,b)=>prospectIdFromRow(a)-prospectIdFromRow(b));
    rows.forEach(row=>tbody.appendChild(row));
    const dateHead=[...table.querySelectorAll('thead th')].find(th=>/data\s+envio/i.test(th.textContent||''));
    if(dateHead) dateHead.textContent='Data envio';
  }

  function decorate(){
    installCss();
    const table=[...document.querySelectorAll('#main .table-card table.table')].find(t=>{
      const h=[...t.querySelectorAll('thead th')].map(x=>x.textContent.trim().toLowerCase());
      return h.includes('contacto')&&h.some(x=>x.includes('data')&&x.includes('envio'));
    });
    if(table){
      table.closest('.table-card')?.classList.add('crm-prospects-fit');
      enforceTodosOrder(table);
    }
  }

  document.addEventListener('click',e=>{
    if(e.target?.closest?.('#main th.crm-sort')){
      manualDateSort=true;
      requestAnimationFrame(decorate);
    }
  });

  document.addEventListener('change',e=>{
    const toolbar=e.target?.closest?.('#main .crm-toolbar');
    if(!toolbar || e.target.tagName!=='SELECT') return;
    const selects=[...toolbar.querySelectorAll('select')];
    if(e.target===selects[1] && e.target.value==='all'){
      manualDateSort=false;
      requestAnimationFrame(decorate);
    }
  });

  const main=document.getElementById('main');
  if(main)new MutationObserver(()=>requestAnimationFrame(decorate)).observe(main,{childList:true,subtree:true});
  decorate();
})();
