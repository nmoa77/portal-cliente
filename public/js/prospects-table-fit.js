/* DUIT — mantém a listagem de Prospects dentro da largura do painel, incluindo após filtros. */
(() => {
  function install(){
    if(document.getElementById('duit-prospects-table-fit-v3')) return;
    document.getElementById('duit-prospects-table-fit-v2')?.remove();
    const s=document.createElement('style');
    s.id='duit-prospects-table-fit-v3';
    s.textContent=`
      #main{min-width:0!important;max-width:100%!important}
      #main .crm-prospects-fit{width:100%!important;max-width:100%!important;min-width:0!important;overflow:hidden!important}
      #main .crm-prospects-fit table.table{width:100%!important;max-width:100%!important;min-width:0!important;table-layout:fixed!important}
      #main .crm-prospects-fit th,#main .crm-prospects-fit td{box-sizing:border-box;min-width:0!important;max-width:none!important;overflow:hidden!important;overflow-wrap:anywhere;word-break:normal;padding-left:9px;padding-right:9px}
      #main .crm-prospects-fit th:nth-child(1),#main .crm-prospects-fit td:nth-child(1){width:18%!important}
      #main .crm-prospects-fit th:nth-child(2),#main .crm-prospects-fit td:nth-child(2){width:12%!important}
      #main .crm-prospects-fit th:nth-child(3),#main .crm-prospects-fit td:nth-child(3){width:8%!important}
      #main .crm-prospects-fit th:nth-child(4),#main .crm-prospects-fit td:nth-child(4){width:9%!important}
      #main .crm-prospects-fit th:nth-child(5),#main .crm-prospects-fit td:nth-child(5){width:17%!important}
      #main .crm-prospects-fit th:nth-child(6),#main .crm-prospects-fit td:nth-child(6){width:8%!important}
      #main .crm-prospects-fit th:nth-child(7),#main .crm-prospects-fit td:nth-child(7){width:8%!important}
      #main .crm-prospects-fit th:nth-child(8),#main .crm-prospects-fit td:nth-child(8){width:8%!important}
      #main .crm-prospects-fit th:nth-child(9),#main .crm-prospects-fit td:nth-child(9){width:6%!important}
      #main .crm-prospects-fit th:nth-child(10),#main .crm-prospects-fit td:nth-child(10){width:6%!important}
      #main .crm-prospects-fit .pill{max-width:100%!important;white-space:normal!important;line-height:1.2}
      #main .crm-prospects-fit .crm-actions{display:flex!important;align-items:center!important;justify-content:center!important;gap:3px!important;flex-wrap:wrap!important;min-width:0!important;max-width:100%!important}
      #main .crm-prospects-fit .crm-actions .btn{min-width:0!important;max-width:100%!important;padding-left:6px!important;padding-right:6px!important;font-size:11px!important}
      #main .crm-prospects-fit td:last-child .btn{white-space:normal!important}
      #main .crm-prospects-fit td a,#main .crm-prospects-fit td strong,#main .crm-prospects-fit td span,#main .crm-prospects-fit td div{max-width:100%}
      @media(max-width:1250px){
        #main .crm-prospects-fit th,#main .crm-prospects-fit td{font-size:12px;padding-left:6px;padding-right:6px}
        #main .crm-prospects-fit th:nth-child(9),#main .crm-prospects-fit td:nth-child(9){display:none!important}
        #main .crm-prospects-fit th:nth-child(1),#main .crm-prospects-fit td:nth-child(1){width:20%!important}
        #main .crm-prospects-fit th:nth-child(5),#main .crm-prospects-fit td:nth-child(5){width:20%!important}
        #main .crm-prospects-fit th:nth-child(10),#main .crm-prospects-fit td:nth-child(10){width:8%!important}
      }
    `;
    document.head.appendChild(s);
  }

  function fit(){
    install();
    const h1=document.querySelector('#main h1');
    if(!h1||!/prospec/i.test(h1.textContent||'')) return;
    const table=document.querySelector('#main .table-card table.table');
    if(!table) return;
    const card=table.closest('.table-card');
    if(card){
      card.classList.add('crm-prospects-fit');
      card.style.setProperty('overflow-x','hidden','important');
      card.style.setProperty('max-width','100%','important');
      card.style.setProperty('min-width','0','important');
    }
    table.style.setProperty('width','100%','important');
    table.style.setProperty('max-width','100%','important');
    table.style.setProperty('min-width','0','important');
    table.style.setProperty('table-layout','fixed','important');
  }

  let timer=null;
  function queue(){clearTimeout(timer);timer=setTimeout(()=>requestAnimationFrame(fit),20)}
  fit();
  const main=document.getElementById('main');
  if(main)new MutationObserver(queue).observe(main,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
  document.addEventListener('input',e=>{if(e.target?.id==='crm-search')queue()});
  document.addEventListener('change',e=>{if(e.target?.closest?.('.crm-toolbar')||e.target?.dataset?.aFilter||e.target?.dataset?.analyticsFilter)queue()});
  document.addEventListener('click',e=>{if(e.target?.closest?.('[data-kpi-list-filter],[data-clear-kpi-filter]'))queue()});
})();