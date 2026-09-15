(() => {
  const PAGE_SIZE = 15;
  let currentPage = 1;
  let rendering = false;
  let timer = null;
  let kpiFilter = 'all';
  let rows = [];
  let loading = null;
  const filters = { period:'all', sector:'all', plan:'all' };

  const norm=v=>String(v??'').trim().toLocaleLowerCase('pt-PT');
  const money=n=>Number(n||0).toLocaleString('pt-PT',{style:'currency',currency:'EUR'});
  const pct=(a,b)=>b>0?`${((a/b)*100).toFixed(1).replace('.',',')}%`:'0,0%';
  const safe=v=>{const e=document.createElement('div');e.textContent=String(v??'');return e.innerHTML};
  const planFromMonthly=n=>Number(n||0)===150?'base':Number(n||0)===200?'intermedio':Number(n||0)===280?'premium':'';
  const planLabel=p=>({base:'Base',intermedio:'Intermédio',premium:'Premium',personalizado:'Personalizado'}[p]||p||'Sem plano');

  function sectorGroup(value){
    const raw=String(value||'').trim(); if(!raw)return 'Outros'; const n=norm(raw);
    if(/restaura|pastelaria|catering|gastronomia|marisqueira|bar\b|fine dining/.test(n))return 'Restauração';
    if(/medicina estética|estética|cirurgia plástica|beleza/.test(n))return 'Estética / Beleza';
    if(/saúde|clínica|fisioterapia|pilates|bem-estar|bem estar/.test(n))return 'Saúde / Bem-estar';
    if(/turismo|alojamento|hotel|experiências|experiencias/.test(n))return 'Turismo / Alojamento';
    if(/imobili/.test(n))return 'Imobiliário';
    if(/construção|construcao|arquitetura|interiores|decoração|decoracao/.test(n))return 'Construção / Arquitetura';
    if(/automóvel|automovel|oficina|stand/.test(n))return 'Automóvel';
    if(/desporto|fitness|ginásio|ginasio/.test(n))return 'Desporto / Fitness';
    if(/educação|educacao|formação|formacao|escola|academia/.test(n))return 'Educação / Formação';
    return raw.split('/')[0].trim()||'Outros';
  }

  function installCss(){
    if(document.getElementById('duit-analytics-self-css'))return;
    const s=document.createElement('style'); s.id='duit-analytics-self-css'; s.textContent=`
      #main .crm-kpis{display:none!important}
      #duit-prospect-analytics{margin:2px 0 18px}
      #duit-prospect-analytics .duit-analytics-toolbar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
      #duit-prospect-analytics .duit-analytics-toolbar select{min-width:180px;min-height:38px;padding:7px 10px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--ink)}
      #duit-prospect-analytics .duit-analytics-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}
      #duit-prospect-analytics .duit-analytics-card{padding:14px;border:1px solid var(--line);border-radius:14px;background:var(--card);min-width:0}
      #duit-prospect-analytics .duit-analytics-card[data-kpi-list-filter]{cursor:pointer}
      #duit-prospect-analytics .duit-analytics-card.active{outline:2px solid #111;outline-offset:-2px}
      #duit-prospect-analytics .duit-analytics-card.highlight{background:var(--yellow);border-color:var(--yellow);color:#0a0a0a}
      #duit-prospect-analytics .k-label{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
      #duit-prospect-analytics .k-value{font-family:'Clash Display';font-size:27px;font-weight:600;line-height:1.05;margin-top:5px;white-space:nowrap}
      #duit-prospect-analytics .k-sub{font-size:11px;color:var(--muted);margin-top:5px;line-height:1.35}
      @media(max-width:1250px){#duit-prospect-analytics .duit-analytics-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
      @media(max-width:900px){#duit-prospect-analytics .duit-analytics-grid{grid-template-columns:1fr 1fr}}
      @media(max-width:620px){#duit-prospect-analytics .duit-analytics-grid{grid-template-columns:1fr}}
    `; document.head.appendChild(s);
  }

  async function loadRows(force=false){
    if(rows.length&&!force)return rows; if(loading)return loading;
    loading=(async()=>{try{const [prospects,statuses]=await Promise.all([api('/api/crm/prospects'),api('/api/crm/prospects/email-status')]);const sm=new Map((statuses||[]).map(x=>[Number(x.user_id),x]));rows=(prospects||[]).map(p=>({...p,...(sm.get(Number(p.id))||{})}));}catch(_){rows=[]}finally{loading=null}return rows})();
    return loading;
  }

  function filteredAnalyticsRows(){
    const now=Date.now(),days=filters.period==='30'?30:filters.period==='90'?90:filters.period==='365'?365:null;
    return rows.filter(p=>{
      if(days){const raw=p.email_sent_at||p.first_contact_at||p.created_at||p.updated_at;if(!raw)return false;const ts=new Date(String(raw).replace(' ','T')).getTime();if(!Number.isFinite(ts)||now-ts>days*86400000)return false}
      if(filters.sector!=='all'&&norm(sectorGroup(p.sector))!==norm(filters.sector))return false;
      if(filters.plan!=='all'&&norm(p.recommended_plan||planFromMonthly(p.monthly_value))!==norm(filters.plan))return false;
      return true;
    });
  }

  function renderAnalytics(){
    const main=document.getElementById('main'),old=main?.querySelector('.crm-kpis'); if(!main||!old)return;
    installCss(); let root=document.getElementById('duit-prospect-analytics');
    if(!root){root=document.createElement('section');root.id='duit-prospect-analytics';old.parentNode.insertBefore(root,old)}
    const list=filteredAnalyticsRows(),total=list.length,sentRows=list.filter(p=>p.email_sent_at),sent=sentRows.length;
    const openedRows=sentRows.filter(p=>p.email_first_opened_at||Number(p.email_open_count||0)>0),opened=openedRows.length;
    const reads=sentRows.reduce((n,p)=>n+Number(p.email_open_count||0),0);
    const respondedRows=sentRows.filter(p=>p.outreach_response||['respondeu','interessado','proposta'].includes(p.lead_status)),responded=respondedRows.length;
    const interested=list.filter(p=>['interessado','proposta'].includes(p.lead_status)).length;
    const proposals=list.filter(p=>p.lead_status==='proposta'||Number(p.proposal_view_count||0)>0).length;
    const proposalViews=list.filter(p=>Number(p.proposal_view_count||0)>0).length;
    const acceptedRows=list.filter(p=>p.outreach_response==='accepted'),accepted=acceptedRows.length;
    const potential=list.reduce((n,p)=>n+Number(p.monthly_value||0),0),won=acceptedRows.reduce((n,p)=>n+Number(p.monthly_value||0),0);
    const sectors=[...new Set(rows.map(p=>sectorGroup(p.sector)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt'));
    const plans=[...new Set(rows.map(p=>String(p.recommended_plan||planFromMonthly(p.monthly_value)||'').trim()).filter(Boolean))].sort();
    const card=(key,label,value,sub,cls='')=>`<div class="duit-analytics-card ${cls} ${kpiFilter===key?'active':''}" data-kpi-list-filter="${key}" title="Filtrar a listagem por este indicador"><div class="k-label">${label}</div><div class="k-value">${value}</div><div class="k-sub">${sub}</div></div>`;
    root.innerHTML=`<div class="duit-analytics-toolbar"><select data-a-filter="period"><option value="all">Todo o período</option><option value="30" ${filters.period==='30'?'selected':''}>Últimos 30 dias</option><option value="90" ${filters.period==='90'?'selected':''}>Últimos 90 dias</option><option value="365" ${filters.period==='365'?'selected':''}>Últimos 12 meses</option></select><select data-a-filter="sector"><option value="all">Todos os setores</option>${sectors.map(v=>`<option value="${safe(v)}" ${norm(filters.sector)===norm(v)?'selected':''}>${safe(v)}</option>`).join('')}</select><select data-a-filter="plan"><option value="all">Todos os serviços</option>${plans.map(v=>`<option value="${safe(v)}" ${norm(filters.plan)===norm(v)?'selected':''}>${safe(planLabel(v))}</option>`).join('')}</select></div><div class="duit-analytics-grid">${card('all','Prospects',total,'no filtro atual')}${card('sent','✉️ Enviados',sent,`${pct(sent,total)} dos prospects`)}${card('opened','👁️ Abertos',opened,`taxa de abertura ${pct(opened,sent)}`)}${card('reads','Leituras totais',reads,'inclui reaberturas do email')}${card('responded','💬 Responderam',responded,`taxa de resposta ${pct(responded,sent)}`)}${card('interested','🔥 Interessados',interested,`${pct(interested,sent)} dos enviados`)}${card('proposal','📄 Propostas',proposals,`${proposalViews} vista(s) pelo prospect`)}${card('accepted','✅ Taxa de sucesso',pct(accepted,sent),`${accepted} aceite(s) em ${sent} enviados`,'highlight')}${card('potential','Valor potencial / mês',money(potential),'pipeline no filtro atual')}${card('won','Valor ganho / mês',money(won),'associado a propostas aceites')}</div>`;
  }

  function getTable(){const h1=document.querySelector('#main h1');if(!h1||!/prospec/i.test(h1.textContent||''))return null;return document.querySelector('#main .table-card table.table')}
  function rowId(row){const m=(row.getAttribute('onclick')||'').match(/openCrmProspect\((\d+)\)/);return m?Number(m[1]):0}
  function matchesKpi(p){if(!p||['all','reads','potential','won'].includes(kpiFilter))return true;if(kpiFilter==='sent')return!!p.email_sent_at;if(kpiFilter==='opened')return!!p.email_sent_at&&(!!p.email_first_opened_at||Number(p.email_open_count||0)>0);if(kpiFilter==='responded')return!!p.email_sent_at&&(!!p.outreach_response||['respondeu','interessado','proposta'].includes(p.lead_status));if(kpiFilter==='interested')return['interessado','proposta'].includes(p.lead_status);if(kpiFilter==='proposal')return p.lead_status==='proposta'||Number(p.proposal_view_count||0)>0;if(kpiFilter==='accepted')return p.outreach_response==='accepted';return true}

  function renderList(){
    if(rendering)return;const table=getTable();if(!table)return;rendering=true;
    try{const all=[...table.querySelectorAll('tbody>tr')],map=new Map(rows.map(p=>[Number(p.id),p])),matched=kpiFilter==='all'?all:all.filter(r=>matchesKpi(map.get(rowId(r))));all.forEach(r=>r.style.display=matched.includes(r)?'':'none');let pager=document.getElementById('crm-pagination');if(!pager){pager=document.createElement('div');pager.id='crm-pagination';pager.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 2px 0;font-size:13px;color:var(--muted)';table.closest('.table-card')?.insertAdjacentElement('afterend',pager)}pager.innerHTML=kpiFilter==='all'?`<span>A mostrar todos os ${matched.length} prospects</span>`:`<span>A mostrar ${matched.length} de ${all.length} prospects · <button type="button" data-clear-kpi-filter class="link">Limpar filtro</button></span>`;renderAnalytics()}finally{rendering=false}
  }

  document.addEventListener('click',async e=>{const card=e.target.closest?.('#duit-prospect-analytics [data-kpi-list-filter]');if(card){const key=card.dataset.kpiListFilter;if(['reads','potential','won'].includes(key))return;e.preventDefault();await loadRows();kpiFilter=kpiFilter===key&&key!=='all'?'all':key;currentPage=1;renderList();getTable()?.closest('.table-card')?.scrollIntoView({behavior:'smooth',block:'start'});return}if(e.target.closest?.('[data-clear-kpi-filter]')){e.preventDefault();kpiFilter='all';renderList()}});
  document.addEventListener('change',async e=>{const key=e.target?.dataset?.aFilter;if(key){filters[key]=e.target.value;kpiFilter='all';await loadRows();renderAnalytics();renderList();return}if(e.target?.closest?.('.crm-toolbar')){kpiFilter='all';setTimeout(renderList,30)}});
  document.addEventListener('input',e=>{if(e.target?.id==='crm-search'){kpiFilter='all';setTimeout(renderList,30)}});

  async function ensure(){const h1=document.querySelector('#main h1'),old=document.querySelector('#main .crm-kpis');if(!h1||!/prospec/i.test(h1.textContent||'')||!old)return;await loadRows();renderAnalytics();renderList()}
  const main=document.getElementById('main');if(main)new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(ensure,60)}).observe(main,{childList:true,subtree:true});
  setTimeout(ensure,80);
})();