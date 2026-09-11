/* DUIT — ajustes visuais persistentes dos Prospects + analytics comercial */
(() => {
  /* Sem janelas nativas do browser no painel. */
  window.confirm = () => true;
  window.alert = (msg) => {
    try { if (typeof toast === 'function') toast(String(msg || ''), 'cancel'); }
    catch (_) {}
  };

  const analyticsState = {
    rows: [],
    loaded: false,
    loading: false,
    filters: { period: 'all', sector: 'all', plan: 'all' }
  };

  const safeText = (v) => {
    const el = document.createElement('div');
    el.textContent = v == null ? '' : String(v);
    return el.innerHTML;
  };
  const money = (n) => Number(n || 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
  const pct = (a, b) => b > 0 ? `${((a / b) * 100).toFixed(1).replace('.', ',')}%` : '0,0%';
  const planLabel = (p) => ({ base:'Base', intermedio:'Intermédio', premium:'Premium', personalizado:'Personalizado' }[p] || p || 'Sem plano');

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

      #main .crm-kpis{display:none!important}
      #main .duit-analytics{margin:2px 0 18px}
      #main .duit-analytics-toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px}
      #main .duit-analytics-toolbar select{min-height:38px;padding:7px 10px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--ink)}
      #main .duit-analytics-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}
      #main .duit-analytics-card{padding:14px;border:1px solid var(--line);border-radius:14px;background:var(--card);min-width:0}
      #main .duit-analytics-card .k-label{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
      #main .duit-analytics-card .k-value{font-family:'Clash Display';font-size:27px;font-weight:600;line-height:1.05;margin-top:5px;white-space:nowrap}
      #main .duit-analytics-card .k-sub{font-size:11px;color:var(--muted);margin-top:5px;line-height:1.35}
      #main .duit-analytics-card.highlight{background:var(--yellow);border-color:var(--yellow);color:#0a0a0a}
      #main .duit-analytics-card.highlight .k-label,#main .duit-analytics-card.highlight .k-sub{color:#4a4300}
      #main .duit-analytics-sections{display:grid;grid-template-columns:1.35fr 1fr;gap:12px;margin-top:12px}
      #main .duit-analytics-panel{padding:16px;border:1px solid var(--line);border-radius:14px;background:var(--card)}
      #main .duit-analytics-panel h3{margin:0 0 12px;font-family:'Clash Display';font-size:17px}
      #main .funnel-row{display:grid;grid-template-columns:130px 1fr 58px;gap:10px;align-items:center;margin:9px 0;font-size:12px}
      #main .funnel-track{height:9px;border-radius:999px;background:var(--bg-2);overflow:hidden;border:1px solid var(--line-2)}
      #main .funnel-fill{height:100%;background:var(--yellow);border-radius:999px;min-width:2px}
      #main .loss-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      #main .loss-item{padding:10px;border-radius:10px;background:var(--bg-2);border:1px solid var(--line-2)}
      #main .loss-item b{font-family:'Clash Display';font-size:20px;display:block;margin-top:3px}
      #main .loss-item span{font-size:11px;color:var(--muted)}
      #main .analytics-note{font-size:11px;color:var(--muted);margin-top:10px;line-height:1.45}
      @media(max-width:1250px){
        #main .crm-prospects-fit th,#main .crm-prospects-fit td{font-size:12px;padding-left:7px;padding-right:7px}
        #main .crm-prospects-fit th:nth-child(9),#main .crm-prospects-fit td:nth-child(9){display:none}
        #main .crm-prospects-fit th:nth-child(1),#main .crm-prospects-fit td:nth-child(1){width:20%}
        #main .crm-prospects-fit th:nth-child(5),#main .crm-prospects-fit td:nth-child(5){width:20%}
        #main .duit-analytics-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
      }
      @media(max-width:900px){
        #main .duit-analytics-grid{grid-template-columns:1fr 1fr}
        #main .duit-analytics-sections{grid-template-columns:1fr}
      }
      @media(max-width:620px){
        #main .duit-analytics-grid{grid-template-columns:1fr}
        #main .funnel-row{grid-template-columns:100px 1fr 50px}
      }
    `;
    document.head.appendChild(s);
  }

  function currentAnalyticsRows(){
    const now = Date.now();
    const days = analyticsState.filters.period === '30' ? 30 : analyticsState.filters.period === '90' ? 90 : analyticsState.filters.period === '365' ? 365 : null;
    return analyticsState.rows.filter(p => {
      if(days){
        const raw = p.email_sent_at || p.first_contact_at || p.created_at || p.updated_at;
        if(!raw) return false;
        const ts = new Date(String(raw).replace(' ', 'T') + (String(raw).includes('T') ? '' : 'Z')).getTime();
        if(!Number.isFinite(ts) || now - ts > days * 86400000) return false;
      }
      if(analyticsState.filters.sector !== 'all' && String(p.sector || '') !== analyticsState.filters.sector) return false;
      if(analyticsState.filters.plan !== 'all' && String(p.recommended_plan || '') !== analyticsState.filters.plan) return false;
      return true;
    });
  }

  function buildAnalyticsHtml(){
    const rows = currentAnalyticsRows();
    const total = rows.length;
    const sentRows = rows.filter(p => !!p.email_sent_at);
    const sent = sentRows.length;
    const openedRows = sentRows.filter(p => !!p.email_first_opened_at || Number(p.email_open_count || 0) > 0);
    const opened = openedRows.length;
    const reads = sentRows.reduce((n,p) => n + Number(p.email_open_count || 0), 0);
    const respondedRows = sentRows.filter(p => !!p.outreach_response || ['respondeu','interessado','proposta'].includes(p.lead_status));
    const responded = respondedRows.length;
    const interested = rows.filter(p => ['interessado','proposta'].includes(p.lead_status)).length;
    const proposalRows = rows.filter(p => p.lead_status === 'proposta' || Number(p.proposal_view_count || 0) > 0);
    const proposals = proposalRows.length;
    const proposalViews = rows.filter(p => Number(p.proposal_view_count || 0) > 0).length;
    const acceptedRows = rows.filter(p => p.outreach_response === 'accepted');
    const accepted = acceptedRows.length;
    const rejected = rows.filter(p => p.outreach_response === 'rejected' || p.lead_status === 'sem_interesse').length;
    const noReply = Math.max(0, sent - responded);
    const potential = rows.reduce((n,p) => n + Number(p.monthly_value || 0), 0);
    const wonValue = acceptedRows.reduce((n,p) => n + Number(p.monthly_value || 0), 0);
    const ebookOpened = rows.filter(p => Number(p.guide_open_count || 0) > 0).length;

    const unopened = Math.max(0, sent - opened);
    const openedNoReply = openedRows.filter(p => !p.outreach_response && !['respondeu','interessado','proposta'].includes(p.lead_status)).length;
    const repliedNoProgress = respondedRows.filter(p => p.outreach_response !== 'accepted' && !['interessado','proposta'].includes(p.lead_status)).length;
    const proposalNoWin = Math.max(0, proposals - accepted);

    const sectors = [...new Set(analyticsState.rows.map(p => String(p.sector || '').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt'));
    const plans = [...new Set(analyticsState.rows.map(p => String(p.recommended_plan || '').trim()).filter(Boolean))].sort();
    const sectorOptions = sectors.map(v => `<option value="${safeText(v)}" ${analyticsState.filters.sector===v?'selected':''}>${safeText(v)}</option>`).join('');
    const planOptions = plans.map(v => `<option value="${safeText(v)}" ${analyticsState.filters.plan===v?'selected':''}>${safeText(planLabel(v))}</option>`).join('');

    const funnel = [
      ['Enviados', sent, sent],
      ['Abertos', opened, sent],
      ['Responderam', responded, sent],
      ['Interessados', interested, sent],
      ['Propostas', proposals, sent],
      ['Aceites', accepted, sent]
    ].map(([label,value,base]) => {
      const width = base > 0 ? Math.max(2, Math.round((value / base) * 100)) : 0;
      return `<div class="funnel-row"><span>${label}</span><div class="funnel-track"><div class="funnel-fill" style="width:${width}%"></div></div><strong>${value}</strong></div>`;
    }).join('');

    return `
      <div class="duit-analytics-toolbar">
        <select onchange="duitAnalyticsSet('period',this.value)" aria-label="Período">
          <option value="all" ${analyticsState.filters.period==='all'?'selected':''}>Todo o período</option>
          <option value="30" ${analyticsState.filters.period==='30'?'selected':''}>Últimos 30 dias</option>
          <option value="90" ${analyticsState.filters.period==='90'?'selected':''}>Últimos 90 dias</option>
          <option value="365" ${analyticsState.filters.period==='365'?'selected':''}>Últimos 12 meses</option>
        </select>
        <select onchange="duitAnalyticsSet('sector',this.value)" aria-label="Setor"><option value="all">Todos os setores</option>${sectorOptions}</select>
        <select onchange="duitAnalyticsSet('plan',this.value)" aria-label="Serviço"><option value="all">Todos os serviços</option>${planOptions}</select>
      </div>

      <div class="duit-analytics-grid">
        <div class="duit-analytics-card"><div class="k-label">Prospects</div><div class="k-value">${total}</div><div class="k-sub">no filtro atual</div></div>
        <div class="duit-analytics-card"><div class="k-label">✉️ Enviados</div><div class="k-value">${sent}</div><div class="k-sub">${total ? pct(sent,total) : '0,0%'} dos prospects</div></div>
        <div class="duit-analytics-card"><div class="k-label">👁️ Abertos</div><div class="k-value">${opened}</div><div class="k-sub">taxa de abertura ${pct(opened,sent)}</div></div>
        <div class="duit-analytics-card"><div class="k-label">Leituras totais</div><div class="k-value">${reads}</div><div class="k-sub">inclui reaberturas do email</div></div>
        <div class="duit-analytics-card"><div class="k-label">💬 Responderam</div><div class="k-value">${responded}</div><div class="k-sub">taxa de resposta ${pct(responded,sent)}</div></div>
        <div class="duit-analytics-card"><div class="k-label">🔥 Interessados</div><div class="k-value">${interested}</div><div class="k-sub">${pct(interested,sent)} dos enviados</div></div>
        <div class="duit-analytics-card"><div class="k-label">📄 Propostas</div><div class="k-value">${proposals}</div><div class="k-sub">${proposalViews} vista(s) pelo prospect</div></div>
        <div class="duit-analytics-card highlight"><div class="k-label">✅ Taxa de sucesso</div><div class="k-value">${pct(accepted,sent)}</div><div class="k-sub">${accepted} aceite(s) em ${sent} enviados</div></div>
        <div class="duit-analytics-card"><div class="k-label">Valor potencial / mês</div><div class="k-value" style="font-size:22px">${money(potential)}</div><div class="k-sub">pipeline no filtro atual</div></div>
        <div class="duit-analytics-card"><div class="k-label">Valor ganho / mês</div><div class="k-value" style="font-size:22px">${money(wonValue)}</div><div class="k-sub">associado a propostas aceites</div></div>
      </div>

      <div class="duit-analytics-sections">
        <div class="duit-analytics-panel">
          <h3>Funil comercial</h3>
          ${funnel}
          <div class="analytics-note">As percentagens são calculadas sobre emails enviados. “Abertos” significa abertura detetada; não garante leitura integral do email.</div>
        </div>
        <div class="duit-analytics-panel">
          <h3>Onde estamos a perder?</h3>
          <div class="loss-grid">
            <div class="loss-item"><span>Não abriu</span><b>${unopened}</b><span>${pct(unopened,sent)} dos enviados</span></div>
            <div class="loss-item"><span>Abriu, não respondeu</span><b>${openedNoReply}</b><span>${pct(openedNoReply,opened)} dos abertos</span></div>
            <div class="loss-item"><span>Respondeu, não avançou</span><b>${repliedNoProgress}</b><span>${pct(repliedNoProgress,responded)} das respostas</span></div>
            <div class="loss-item"><span>Proposta sem sucesso</span><b>${proposalNoWin}</b><span>${pct(proposalNoWin,proposals)} das propostas</span></div>
            <div class="loss-item"><span>Sem resposta</span><b>${noReply}</b><span>${pct(noReply,sent)} dos enviados</span></div>
            <div class="loss-item"><span>Sem interesse / rejeitados</span><b>${rejected}</b><span>${pct(rejected,sent)} dos enviados</span></div>
            <div class="loss-item"><span>Ebook aberto</span><b>${ebookOpened}</b><span>${pct(ebookOpened,sent)} dos enviados</span></div>
            <div class="loss-item"><span>Aceites</span><b>${accepted}</b><span>${pct(accepted,proposals || sent)} conversão final</span></div>
          </div>
        </div>
      </div>
    `;
  }

  function renderAnalytics(){
    const root=document.getElementById('duit-prospect-analytics');
    if(root) root.innerHTML=buildAnalyticsHtml();
  }

  window.duitAnalyticsSet=(key,value)=>{
    analyticsState.filters[key]=value;
    renderAnalytics();
  };

  async function ensureAnalytics(){
    const main=document.getElementById('main');
    if(!main) return;
    const h1=main.querySelector('.page-head h1');
    if(!h1 || h1.textContent.trim().toLowerCase()!=='prospecção') return;
    const oldKpis=main.querySelector('.crm-kpis');
    if(!oldKpis) return;

    let root=document.getElementById('duit-prospect-analytics');
    if(!root){
      root=document.createElement('section');
      root.id='duit-prospect-analytics';
      root.className='duit-analytics';
      oldKpis.parentNode.insertBefore(root,oldKpis);
    }

    if(analyticsState.loaded){ renderAnalytics(); return; }
    if(analyticsState.loading) return;
    analyticsState.loading=true;
    root.innerHTML='<div class="card"><div class="empty" style="padding:20px 0">A calcular métricas comerciais…</div></div>';
    try{
      const [prospects,statuses]=await Promise.all([
        api('/api/crm/prospects'),
        api('/api/crm/prospects/email-status')
      ]);
      const map=new Map((statuses||[]).map(s=>[Number(s.user_id),s]));
      analyticsState.rows=(prospects||[]).map(p=>({...p,...(map.get(Number(p.id))||{})}));
      analyticsState.loaded=true;
      renderAnalytics();
    }catch(e){
      root.innerHTML=`<div class="card"><div class="empty" style="padding:20px 0">Não foi possível calcular as métricas: ${safeText(e.message)}</div></div>`;
    }finally{ analyticsState.loading=false; }
  }

  function decorate(){
    installCss();
    const table=[...document.querySelectorAll('#main .table-card table.table')].find(t=>{
      const h=[...t.querySelectorAll('thead th')].map(x=>x.textContent.trim().toLowerCase());
      return h.includes('contacto')&&h.some(x=>x.includes('data')&&x.includes('envio'));
    });
    if(table) table.closest('.table-card')?.classList.add('crm-prospects-fit');
    ensureAnalytics();
  }

  let timer=null;
  const main=document.getElementById('main');
  if(main)new MutationObserver(()=>{
    clearTimeout(timer);
    timer=setTimeout(()=>requestAnimationFrame(decorate),80);
    if(!document.getElementById('duit-prospect-analytics')) analyticsState.loaded=false;
  }).observe(main,{childList:true,subtree:true});
  decorate();
})();
