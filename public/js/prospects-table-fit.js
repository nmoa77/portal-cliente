/* DUIT — mantém a listagem de Prospects dentro da largura do painel. */
(() => {
  function install(){
    if(document.getElementById('duit-prospects-table-fit-v2')) return;
    const s=document.createElement('style');
    s.id='duit-prospects-table-fit-v2';
    s.textContent=`
      #main .crm-prospects-fit{width:100%!important;max-width:100%!important;overflow:hidden!important}
      #main .crm-prospects-fit table.table{width:100%!important;max-width:100%!important;min-width:0!important;table-layout:fixed!important}
      #main .crm-prospects-fit th,#main .crm-prospects-fit td{box-sizing:border-box;min-width:0!important;overflow:hidden;overflow-wrap:anywhere}
      #main .crm-prospects-fit th:nth-child(1),#main .crm-prospects-fit td:nth-child(1){width:17%!important}
      #main .crm-prospects-fit th:nth-child(2),#main .crm-prospects-fit td:nth-child(2){width:11%!important}
      #main .crm-prospects-fit th:nth-child(3),#main .crm-prospects-fit td:nth-child(3){width:8%!important}
      #main .crm-prospects-fit th:nth-child(4),#main .crm-prospects-fit td:nth-child(4){width:8%!important}
      #main .crm-prospects-fit th:nth-child(5),#main .crm-prospects-fit td:nth-child(5){width:15%!important}
      #main .crm-prospects-fit th:nth-child(6),#main .crm-prospects-fit td:nth-child(6){width:8%!important}
      #main .crm-prospects-fit th:nth-child(7),#main .crm-prospects-fit td:nth-child(7){width:8%!important}
      #main .crm-prospects-fit th:nth-child(8),#main .crm-prospects-fit td:nth-child(8){width:8%!important}
      #main .crm-prospects-fit th:nth-child(9),#main .crm-prospects-fit td:nth-child(9){width:6%!important}
      #main .crm-prospects-fit th:nth-child(10),#main .crm-prospects-fit td:nth-child(10){width:11%!important}
      #main .crm-prospects-fit .crm-actions{display:flex!important;align-items:center;justify-content:flex-end!important;gap:4px!important;flex-wrap:wrap!important;max-width:100%}
      #main .crm-prospects-fit .crm-actions .btn{max-width:100%;padding-left:8px;padding-right:8px;font-size:11px}
      #main .crm-prospects-fit td a,#main .crm-prospects-fit td strong,#main .crm-prospects-fit td span{max-width:100%}
      @media(max-width:1250px){
        #main .crm-prospects-fit th:nth-child(9),#main .crm-prospects-fit td:nth-child(9){display:none!important}
        #main .crm-prospects-fit th:nth-child(1),#main .crm-prospects-fit td:nth-child(1){width:19%!important}
        #main .crm-prospects-fit th:nth-child(5),#main .crm-prospects-fit td:nth-child(5){width:16%!important}
        #main .crm-prospects-fit th:nth-child(10),#main .crm-prospects-fit td:nth-child(10){width:13%!important}
      }
    `;
    document.head.appendChild(s);
  }
  install();
  new MutationObserver(install).observe(document.documentElement,{childList:true,subtree:true});
})();