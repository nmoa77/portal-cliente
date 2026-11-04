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
    sendLimit: null,
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
  const norm = (v) => String(v == null ? '' : v).trim().toLocaleLowerCase('pt-PT');

  function sectorGroup(value){
    const raw=String(value||'').trim();
    if(!raw) return 'Outros';
    const n=norm(raw);
    if(/restaura|restaurante|pastelaria|catering|gastronomia|marisqueira|bar\b|fine dining/.test(n)) return 'Restauração';
    if(/medicina estética|estética|cirurgia plástica|beleza/.test(n)) return 'Estética / Beleza';
    if(/saúde|clínica|fisioterapia|pilates|bem-estar|bem estar/.test(n)) return 'Saúde / Bem-estar';
    if(/turismo|alojamento|hotel|experiências|experiencias/.test(n)) return 'Turismo / Alojamento';
    if(/imobili|mediação imobiliária|mediacao imobiliaria/.test(n)) return 'Imobiliário';
    if(/construção|construcao|arquitetura|interiores|decoração|decoracao/.test(n)) return 'Construção / Arquitetura';
    if(/automóvel|automovel|oficina|stand/.test(n)) return 'Automóvel';
    if(/desporto|fitness|ginásio|ginasio/.test(n)) return 'Desporto / Fitness';
    if(/educação|educacao|formação|formacao|escola|academia/.test(n)) return 'Educação / Formação';
    if(/eventos/.test(n)) return 'Eventos';
    if(/veterin/.test(n)) return 'Veterinária';
    const first=raw.split('/')[0].trim();
    return first || 'Outros';
  }

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
      #main .duit-analytics-toolbar select{flex:0 1 230px;width:auto!important;min-width:180px;min-height:38px;padding:7px 10px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--ink)}
      #main .duit-send-quota{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:10px}
      #main .duit-send-quota-card{padding:14px 16px;border:1px solid var(--line);border-radius:14px;background:var(--bg-2)}
      #main .duit-send-quota-card .quota-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted)}
      #main .duit-send-quota-card .quota-value{font-family:'Clash Display';font-size:28px;font-weight:650;line-height:1;margin-top:7px}
      #main .duit-send-quota-card .quota-sub{font-size:11px;color:var(--muted);margin-top:5px}
      #main .duit-send-quota-card.warning{border-color:#eab308;background:#fff9db}
      #main .duit-send-quota-card.critical{border-color:#dc2626;background:#fff0f0}

      #main .duit-analytics-summary{display:grid;grid-template-columns:1.15fr 1fr 1fr 1fr;gap:10px;margin-bottom:10px}
      #main .duit-analytics-secondary{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}
      #main .duit-analytics-card{position:relative;padding:16px 16px 14px;border:1px solid var(--line);border-radius:15px;background:var(--card);min-width:0;cursor:pointer;transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease}
      #main .duit-analytics-card:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(0,0,0,.07);border-color:#d7d2c8}
      #main .duit-analytics-card.primary{min-height:108px}
      #main .duit-analytics-card .k-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.11em;color:var(--muted)}
      #main .duit-analytics-card .k-value{font-family:'Clash Display';font-size:31px;font-weight:650;line-height:1.02;margin-top:8px;white-space:nowrap;letter-spacing:-.02em}
      #main .duit-analytics-card .k-sub{font-size:11px;color:var(--muted);margin-top:6px;line-height:1.35}
      #main .duit-analytics-card .k-rate{position:absolute;right:14px;top:14px;font-size:10px;font-weight:700;padding:5px 7px;border-radius:999px;background:var(--bg-2);color:var(--muted);border:1px solid var(--line-2)}
      #main .duit-analytics-card.highlight{background:var(--yellow);border-color:var(--yellow);color:#0a0a0a}
      #main .duit-analytics-card.highlight .k-label,#main .duit-analytics-card.highlight .k-sub{color:#4a4300}
      #main .duit-analytics-card.highlight .k-rate{background:rgba(255,255,255,.48);border-color:rgba(0,0,0,.08);color:#332f00}
      #main .duit-analytics-card.money .k-value{font-size:24px}
      #main .duit-analytics-card.success{background:#111;color:#fff;border-color:#111}
      #main .duit-analytics-card.success .k-label,#main .duit-analytics-card.success .k-sub{color:#aaa}
      #main .duit-analytics-card.success .k-rate{background:#222;border-color:#333;color:#ffd60a}
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
        #main .duit-analytics-summary{grid-template-columns:repeat(2,minmax(0,1fr))}#main .duit-analytics-secondary{grid-template-columns:repeat(3,minmax(0,1fr))}
      }
      @media(max-width:900px){
        #main .duit-analytics-summary,#main .duit-analytics-secondary,#main .duit-send-quota{grid-template-columns:1fr 1fr}
        #main .duit-analytics-sections{grid-template-columns:1fr}
      }
      @media(max-width:620px){
        #main .duit-analytics-toolbar select{flex:1 1 100%;width:100%!important}
        #main .duit-analytics-summary,#main .duit-analytics-secondary,#main .duit-send-quota{grid-template-columns:1fr}
        #main .funnel-row{grid-template-columns:100px 1fr 50px}
      }
    `;
    document.head.appendChild(s);
  }

  function parseAnalyticsDate(raw){
    if(!raw) return NaN;
    const txt=String(raw).trim();
    const normalized=/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(txt) ? txt.replace(' ','T')+'Z' : txt;
    return new Date(normalized).getTime();
  }

  function currentAnalyticsRows(){
    const now = Date.now();
    const days = analyticsState.filters.period === '30' ? 30 : analyticsState.filters.period === '90' ? 90 : analyticsState.filters.period === '365' ? 365 : null;
    return analyticsState.rows.filter(p => {
      if(days){
        const raw = p.email_sent_at || p.first_contact_at || p.created_at || p.updated_at;
        const ts = parseAnalyticsDate(raw);
        if(!Number.isFinite(ts) || now - ts > days * 86400000) return false;
      }
      if(analyticsState.filters.sector !== 'all' && norm(sectorGroup(p.sector)) !== norm(analyticsState.filters.sector)) return false;
      if(analyticsState.filters.plan !== 'all' && norm(p.recommended_plan || planFromMonthly(p.monthly_value)) !== norm(analyticsState.filters.plan)) return false;
      return true;
    });
  }

  function planFromMonthly(n){
    const v=Number(n||0);
    if(v===150) return 'base';
    if(v===200) return 'intermedio';
    if(v===280) return 'premium';
    return '';
  }

  function buildAnalyticsHtml(){
    const rows = currentAnalyticsRows();
    const total = rows.length;
    const hardFailStates = new Set(['suppressed','failed','bounced','complained']);
    const providerAcceptedStates = new Set(['sent','delivered','opened','clicked','delivery_delayed']);
    const deliveredStates = new Set(['delivered','opened','clicked']);

    const attemptedRows = rows.filter(p => {
      const rs=String(p.resend_status||'').toLowerCase();
      return !!p.email_sent_at || !!p.resend_email_id || !!rs;
    });
    const attempted = attemptedRows.length;

    const contactedRows = rows.filter(p => {
      const rs=String(p.resend_status||'').toLowerCase();
      if(hardFailStates.has(rs)) return false;
      return !!p.email_sent_at || providerAcceptedStates.has(rs);
    });
    const contacted = contactedRows.length;

    const failedRows = attemptedRows.filter(p => hardFailStates.has(String(p.resend_status||'').toLowerCase()));
    const failed = failedRows.length;

    const deliveredRows = contactedRows.filter(p => {
      const rs=String(p.resend_status||'').toLowerCase();
      const pixelOpen=!!p.email_first_opened_at || Number(p.email_open_count||0)>0;
      return deliveredStates.has(rs) || pixelOpen;
    });
    const delivered = deliveredRows.length;

    const delayedRows = contactedRows.filter(p => String(p.resend_status||'').toLowerCase()==='delivery_delayed');
    const delayed = delayedRows.length;

    const openedRows = contactedRows.filter(p => {
      const rs=String(p.resend_status||'').toLowerCase();
      const pixelOpen=!!p.email_first_opened_at || Number(p.email_open_count||0)>0;
      return pixelOpen || ['opened','clicked'].includes(rs);
    });
    const opened = openedRows.length;

    const reads = contactedRows.reduce((n,p) => n + Number(p.email_open_count || 0), 0);
    const ctaRows = contactedRows.filter(p => Number(p.cta_click_count||0)>0 || String(p.resend_status||'').toLowerCase()==='clicked');
    const cta = ctaRows.length;
    const ctaClicks = contactedRows.reduce((n,p)=>n+Number(p.cta_click_count||0),0);

    const respondedRows = contactedRows.filter(p => !!p.outreach_response || ['respondeu','interessado','proposta'].includes(p.lead_status));
    const responded = respondedRows.length;
    const interestedRows = rows.filter(p => ['interessado','proposta'].includes(p.lead_status) || p.outreach_response==='accepted');
    const interested = interestedRows.length;
    const proposalRows = rows.filter(p => p.lead_status === 'proposta' || Number(p.proposal_view_count || 0) > 0);
    const proposals = proposalRows.length;
    const proposalViews = rows.filter(p => Number(p.proposal_view_count || 0) > 0).length;
    const acceptedRows = rows.filter(p => p.outreach_response === 'accepted');
    const accepted = acceptedRows.length;
    const rejected = rows.filter(p => p.outreach_response === 'rejected' || p.lead_status === 'sem_interesse').length;
    const ebookOpened = rows.filter(p => Number(p.guide_open_count || 0) > 0).length;

    const unopened = Math.max(0, contacted - opened);
    const openedNoClick = openedRows.filter(p => Number(p.cta_click_count||0)<=0 && String(p.resend_status||'').toLowerCase()!=='clicked').length;
    const openedNoReply = openedRows.filter(p => !p.outreach_response && !['respondeu','interessado','proposta'].includes(p.lead_status)).length;
    const repliedNoProgress = respondedRows.filter(p => p.outreach_response !== 'accepted' && !['interessado','proposta'].includes(p.lead_status)).length;
    const proposalNoWin = Math.max(0, proposals - accepted);
    const noReply = Math.max(0, contacted - responded);

    const sectors = [...new Set(analyticsState.rows.map(p => sectorGroup(p.sector)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt'));
    const plans = [...new Set(analyticsState.rows.map(p => String(p.recommended_plan || planFromMonthly(p.monthly_value) || '').trim()).filter(Boolean))].sort();
    const sectorOptions = sectors.map(v => `<option value="${safeText(v)}" ${norm(analyticsState.filters.sector)===norm(v)?'selected':''}>${safeText(v)}</option>`).join('');
    const planOptions = plans.map(v => `<option value="${safeText(v)}" ${norm(analyticsState.filters.plan)===norm(v)?'selected':''}>${safeText(planLabel(v))}</option>`).join('');

    const funnel = [
      ['Contactados', contacted, contacted],
      ['Entregues', delivered, contacted],
      ['Abertos', opened, contacted],
      ['CTA', cta, contacted],
      ['Responderam', responded, contacted],
      ['Interessados', interested, contacted],
      ['Aceites', accepted, contacted]
    ].map(([label,value,base]) => {
      const width = base > 0 ? Math.max(2, Math.round((value / base) * 100)) : 0;
      return `<div class="funnel-row"><span>${label}</span><div class="funnel-track"><div class="funnel-fill" style="width:${width}%"></div></div><strong>${value}</strong></div>`;
    }).join('');

    return `
      <div class="duit-analytics-toolbar">
        <select data-analytics-filter="period" aria-label="Período">
          <option value="all" ${analyticsState.filters.period==='all'?'selected':''}>Todo o período</option>
          <option value="30" ${analyticsState.filters.period==='30'?'selected':''}>Últimos 30 dias</option>
          <option value="90" ${analyticsState.filters.period==='90'?'selected':''}>Últimos 90 dias</option>
          <option value="365" ${analyticsState.filters.period==='365'?'selected':''}>Últimos 12 meses</option>
        </select>
        <select data-analytics-filter="sector" aria-label="Setor"><option value="all" ${analyticsState.filters.sector==='all'?'selected':''}>Todos os setores</option>${sectorOptions}</select>
        <select data-analytics-filter="plan" aria-label="Serviço"><option value="all" ${analyticsState.filters.plan==='all'?'selected':''}>Todos os serviços</option>${planOptions}</select>
      </div>

      ${(()=>{
        const l=analyticsState.sendLimit;
        if(!l)return '';
        const dailyLeft=Math.max(0,Number(l.daily_remaining??(Number(l.daily_limit||100)-Number(l.today||0))));
        const monthlyLeft=Math.max(0,Number(l.monthly_remaining??(Number(l.monthly_limit||3000)-Number(l.month||0))));
        const cls=l.warning_level==='critical'?'critical':l.warning_level==='warning'?'warning':'';
        return `<div class="duit-send-quota">
          <div class="duit-send-quota-card ${cls}">
            <div class="quota-label">Capacidade disponível hoje</div>
            <div class="quota-value">${dailyLeft}</div>
            <div class="quota-sub">${Number(l.today||0)}/${Number(l.daily_limit||100)} registos de envio hoje</div>
          </div>
          <div class="duit-send-quota-card ${cls}">
            <div class="quota-label">Capacidade disponível no mês</div>
            <div class="quota-value">${monthlyLeft}</div>
            <div class="quota-sub">${Number(l.month||0)}/${Number(l.monthly_limit||3000)} registos de envio este mês</div>
          </div>
        </div>`;
      })()}

      <div class="duit-analytics-summary">
        <div class="duit-analytics-card primary" data-kpi-click="all"><div class="k-label">Prospects</div><div class="k-value">${total}</div><div class="k-sub">no filtro atual</div></div>
        <div class="duit-analytics-card primary" data-kpi-click="sent"><div class="k-label">Contactados</div><div class="k-rate">${pct(contacted,total)}</div><div class="k-value">${contacted}</div><div class="k-sub">prospects com envio válido</div></div>
        <div class="duit-analytics-card primary"><div class="k-label">Entregues</div><div class="k-rate">${pct(delivered,contacted)}</div><div class="k-value">${delivered}</div><div class="k-sub">entrega confirmada ou abertura detetada</div></div>
        <div class="duit-analytics-card primary" data-kpi-click="opened"><div class="k-label">Abertos</div><div class="k-rate">${pct(opened,contacted)}</div><div class="k-value">${opened}</div><div class="k-sub">prospects com abertura detetada</div></div>
      </div>

      <div class="duit-analytics-secondary">
        <div class="duit-analytics-card"><div class="k-label">Tentativas</div><div class="k-value">${attempted}</div><div class="k-sub">prospects com tentativa registada</div></div>
        <div class="duit-analytics-card"><div class="k-label">Falhas</div><div class="k-value">${failed}</div><div class="k-sub">${pct(failed,attempted)} das tentativas · bounce/suprimido/falhou/spam</div></div>
        <div class="duit-analytics-card"><div class="k-label">Entrega atrasada</div><div class="k-value">${delayed}</div><div class="k-sub">${pct(delayed,contacted)} dos contactados</div></div>
        <div class="duit-analytics-card" data-kpi-click="opened"><div class="k-label">Leituras totais</div><div class="k-value">${reads}</div><div class="k-sub">inclui reaberturas do email</div></div>
        <div class="duit-analytics-card"><div class="k-label">CTA clicado</div><div class="k-value">${cta}</div><div class="k-sub">${ctaClicks} clique(s) · ${pct(cta,opened)} dos que abriram</div></div>
        <div class="duit-analytics-card success" data-kpi-click="responded"><div class="k-label">Responderam</div><div class="k-value">${responded}</div><div class="k-sub">${pct(responded,contacted)} dos contactados</div></div>
        <div class="duit-analytics-card" data-kpi-click="interested"><div class="k-label">Interessados</div><div class="k-value">${interested}</div><div class="k-sub">${pct(interested,contacted)} dos contactados</div></div>
        <div class="duit-analytics-card" data-kpi-click="proposals"><div class="k-label">Propostas</div><div class="k-value">${proposals}</div><div class="k-sub">${proposalViews} vista(s) pelo prospect</div></div>
        <div class="duit-analytics-card highlight" data-kpi-click="accepted"><div class="k-label">Conversão</div><div class="k-value">${pct(accepted,contacted)}</div><div class="k-sub">${accepted} aceite(s) em ${contacted} contactados</div></div>
      </div>

      <div class="duit-analytics-sections">
        <div class="duit-analytics-panel">
          <h3>Funil comercial</h3>
          ${funnel}
          <div class="analytics-note">As percentagens usam prospects contactados como base. “Abertos” é abertura detetada pelo tracking; “Entregues” exige confirmação do fornecedor ou uma abertura real detetada.</div>
        </div>
        <div class="duit-analytics-panel">
          <h3>Onde estamos a perder?</h3>
          <div class="loss-grid">
            <div class="loss-item"><span>Falha de envio</span><b>${failed}</b><span>${pct(failed,attempted)} das tentativas</span></div>
            <div class="loss-item"><span>Não abriu</span><b>${unopened}</b><span>${pct(unopened,contacted)} dos contactados</span></div>
            <div class="loss-item"><span>Abriu, não clicou</span><b>${openedNoClick}</b><span>${pct(openedNoClick,opened)} dos abertos</span></div>
            <div class="loss-item"><span>Abriu, não respondeu</span><b>${openedNoReply}</b><span>${pct(openedNoReply,opened)} dos abertos</span></div>
            <div class="loss-item"><span>Sem resposta</span><b>${noReply}</b><span>${pct(noReply,contacted)} dos contactados</span></div>
            <div class="loss-item"><span>Respondeu, não avançou</span><b>${repliedNoProgress}</b><span>${pct(repliedNoProgress,responded)} das respostas</span></div>
            <div class="loss-item"><span>Proposta sem sucesso</span><b>${proposalNoWin}</b><span>${pct(proposalNoWin,proposals)} das propostas</span></div>
            <div class="loss-item"><span>Sem interesse / rejeitados</span><b>${rejected}</b><span>${pct(rejected,contacted)} dos contactados</span></div>
            <div class="loss-item"><span>Ebook aberto</span><b>${ebookOpened}</b><span>${pct(ebookOpened,contacted)} dos contactados</span></div>
            <div class="loss-item"><span>Aceites</span><b>${accepted}</b><span>${pct(accepted,contacted)} conversão final</span></div>
          </div>
        </div>
      </div>
    `;
  }

  function bindKpiClicks(root){
    root.querySelectorAll('[data-kpi-click]').forEach(card=>card.addEventListener('click',()=>{
      const key=card.dataset.kpiClick;
      const statusMap={all:'all',sent:'contactado',opened:'email_visto',responded:'respondeu',interested:'interessado'};
      if(key==='proposals'){
        if(typeof window.crmSetFilter==='function') window.crmSetFilter('proposal','vista');
      }else if(key==='accepted'){
        // Não existe filtro CRM próprio para "aceite"; usa o estado mais próximo sem inventar opções no seletor.
        if(typeof window.crmSetFilter==='function') window.crmSetFilter('status','interessado');
      }else if(typeof window.crmSetFilter==='function'){
        window.crmSetFilter('proposal','all');
        window.crmSetFilter('status',statusMap[key]||'all');
      }
      setTimeout(()=>document.querySelector('#main .table-card')?.scrollIntoView({behavior:'smooth',block:'start'}),50);
    }));
  }

  function bindAnalyticsFilters(root){
    root.querySelectorAll('[data-analytics-filter]').forEach(select=>{
      select.addEventListener('change',()=>{
        const key=select.dataset.analyticsFilter;
        if(!key) return;
        analyticsState.filters[key]=select.value;
        renderAnalytics();
      });
    });
  }

  function renderAnalytics(){
    const root=document.getElementById('duit-prospect-analytics');
    if(!root) return;
    root.innerHTML=buildAnalyticsHtml();
    bindAnalyticsFilters(root);
    bindKpiClicks(root);
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

    if(analyticsState.loaded){
      if(!root.dataset.rendered){ renderAnalytics(); root.dataset.rendered='1'; }
      return;
    }
    if(analyticsState.loading) return;
    analyticsState.loading=true;
    root.innerHTML='<div class="card"><div class="empty" style="padding:20px 0">A calcular métricas comerciais…</div></div>';
    try{
      if(Array.isArray(window.duitCrmProspectsCache)){
        analyticsState.rows=window.duitCrmProspectsCache.slice();
        analyticsState.sendLimit=await api('/api/crm/prospects/send-limit').catch(()=>null);
      } else {
        const [prospects,statuses,sendLimit]=await Promise.all([
          api('/api/crm/prospects'),
          api('/api/crm/prospects/email-status'),
          api('/api/crm/prospects/send-limit').catch(()=>null)
        ]);
        const map=new Map((statuses||[]).map(s=>[Number(s.user_id),s]));
        analyticsState.rows=(prospects||[]).map(p=>({...p,...(map.get(Number(p.id))||{})}));
        analyticsState.sendLimit=sendLimit||null;
      }
      analyticsState.loaded=true;
      renderAnalytics();
      root.dataset.rendered='1';
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
  }).observe(main,{childList:true});
  decorate();
})();
