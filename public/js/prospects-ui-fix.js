/* DUIT — ajustes visuais persistentes dos Prospects */
(() => {
  /* Sem janelas nativas do browser no painel. As ações seguem diretamente
     e o feedback continua a ser apresentado pelos toasts/modais da DUIT. */
  window.confirm = () => true;
  window.alert = (msg) => {
    try { if (typeof toast === 'function') toast(String(msg || ''), 'cancel'); }
    catch (_) {}
  };

  const KEY_STATUS='duit_prospects_status_filter';
  const KEY_PRIORITY='duit_prospects_priority_filter';
  const KEY_PROPOSAL='duit_prospects_proposal_filter';
  let restoring=false;

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

  function ensureProposalFilter(){
    const toolbar=document.querySelector('#main .crm-toolbar');
    if(!toolbar) return null;
    let proposal=toolbar.querySelector('[data-crm-proposal-filter]');
    if(!proposal){
      proposal=document.createElement('select');
      proposal.dataset.crmProposalFilter='1';
      proposal.innerHTML='<option value="all">Todas as propostas</option><option value="vista">👁 Proposta vista</option><option value="por_abrir">Proposta por abrir</option>';
      toolbar.appendChild(proposal);
    }
    return proposal;
  }

  function getFilterSelects(){
    const toolbar=document.querySelector('#main .crm-toolbar');
    if(!toolbar) return {};
    const proposal=ensureProposalFilter();
    const selects=[...toolbar.querySelectorAll('select:not([data-crm-proposal-filter])')];
    return {priority:selects[0]||null,status:selects[1]||null,proposal};
  }

  function applyProposalFilter(){
    const proposal=ensureProposalFilter();
    if(!proposal) return;
    const value=proposal.value||'all';
    document.querySelectorAll('#main .table-card table.table tbody tr').forEach(tr=>{
      const contact=tr.querySelector('td:nth-child(5)');
      const text=(contact?.textContent||'').toLowerCase();
      let show=true;
      if(value==='vista') show=text.includes('proposta vista');
      if(value==='por_abrir') show=text.includes('proposta · por abrir')||text.includes('proposta por abrir');
      tr.style.display=show?'':'none';
    });
  }

  function syncFilterUi(){
    const {priority,status,proposal}=getFilterSelects();
    if(priority){const v=sessionStorage.getItem(KEY_PRIORITY)||'all';if([...priority.options].some(o=>o.value===v))priority.value=v;}
    if(status){const v=sessionStorage.getItem(KEY_STATUS)||'all';if([...status.options].some(o=>o.value===v))status.value=v;}
    if(proposal){const v=sessionStorage.getItem(KEY_PROPOSAL)||'all';if([...proposal.options].some(o=>o.value===v))proposal.value=v;}
    applyProposalFilter();
  }

  function decorate(){
    installCss();
    const table=[...document.querySelectorAll('#main .table-card table.table')].find(t=>{
      const h=[...t.querySelectorAll('thead th')].map(x=>x.textContent.trim().toLowerCase());
      return h.includes('contacto')&&h.some(x=>x.includes('data')&&x.includes('envio'));
    });
    if(table) table.closest('.table-card')?.classList.add('crm-prospects-fit');
    syncFilterUi();
  }

  document.addEventListener('change',e=>{
    const {priority,status,proposal}=getFilterSelects();
    if(e.target===priority) sessionStorage.setItem(KEY_PRIORITY,e.target.value);
    if(e.target===status) sessionStorage.setItem(KEY_STATUS,e.target.value);
    if(e.target===proposal){sessionStorage.setItem(KEY_PROPOSAL,e.target.value);applyProposalFilter();}
    setTimeout(syncFilterUi,0);
  },true);

  const originalView=window.viewProspects;
  if(typeof originalView==='function'){
    window.viewProspects=async function(main){
      await originalView(main);
      decorate();
      if(restoring) return;
      const pv=sessionStorage.getItem(KEY_PRIORITY)||'all';
      const sv=sessionStorage.getItem(KEY_STATUS)||'all';
      if((pv!=='all'||sv!=='all')&&typeof window.crmSetFilter==='function'){
        restoring=true;
        if(pv!=='all') window.crmSetFilter('priority',pv);
        if(sv!=='all') window.crmSetFilter('status',sv);
        restoring=false;
        decorate();
      }
    };
  }

  const main=document.getElementById('main');
  if(main)new MutationObserver(()=>requestAnimationFrame(decorate)).observe(main,{childList:true,subtree:true});
  decorate();
})();
