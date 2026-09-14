/* DUIT — distribuição de prospects por setor */
(() => {
  if (window.__DUIT_SECTOR_CHART__) return;
  window.__DUIT_SECTOR_CHART__ = true;

  const state = { rows: [], loading: false, loaded: false };
  const norm = v => String(v == null ? '' : v).trim().toLocaleLowerCase('pt-PT');
  const esc = v => {
    const el = document.createElement('div');
    el.textContent = v == null ? '' : String(v);
    return el.innerHTML;
  };

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

  function planFromMonthly(n){
    const v=Number(n||0);
    if(v===150) return 'base';
    if(v===200) return 'intermedio';
    if(v===280) return 'premium';
    return '';
  }

  function parseDate(raw){
    if(!raw) return NaN;
    const txt=String(raw).trim();
    const normalized=/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(txt) ? txt.replace(' ','T')+'Z' : txt;
    return new Date(normalized).getTime();
  }

  function currentFilters(){
    const root=document.getElementById('duit-prospect-analytics');
    return {
      period: root?.querySelector('[data-analytics-filter="period"]')?.value || 'all',
      sector: root?.querySelector('[data-analytics-filter="sector"]')?.value || 'all',
      plan: root?.querySelector('[data-analytics-filter="plan"]')?.value || 'all'
    };
  }

  function rowsForChart(){
    const f=currentFilters();
    const now=Date.now();
    const days=f.period==='30'?30:f.period==='90'?90:f.period==='365'?365:null;
    return state.rows.filter(p=>{
      if(days){
        const ts=parseDate(p.email_sent_at||p.first_contact_at||p.created_at||p.updated_at);
        if(!Number.isFinite(ts)||now-ts>days*86400000) return false;
      }
      if(f.plan!=='all' && norm(p.recommended_plan||planFromMonthly(p.monthly_value))!==norm(f.plan)) return false;
      return true;
    });
  }

  function installCss(){
    if(document.getElementById('duit-sector-chart-css')) return;
    const s=document.createElement('style');
    s.id='duit-sector-chart-css';
    s.textContent=`
      #main .duit-sector-panel{margin-top:12px;padding:16px;border:1px solid var(--line);border-radius:14px;background:var(--card)}
      #main .duit-sector-panel h3{margin:0;font-family:'Clash Display';font-size:17px}
      #main .duit-sector-head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin-bottom:14px;flex-wrap:wrap}
      #main .duit-sector-sub{font-size:11px;color:var(--muted);margin-top:4px}
      #main .duit-sector-list{display:grid;gap:9px}
      #main .duit-sector-row{display:grid;grid-template-columns:minmax(150px,220px) 1fr 90px;gap:12px;align-items:center;font-size:12px}
      #main .duit-sector-name{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      #main .duit-sector-track{height:12px;border-radius:999px;background:var(--bg-2);border:1px solid var(--line-2);overflow:hidden}
      #main .duit-sector-fill{height:100%;background:var(--yellow);border-radius:999px;min-width:2px}
      #main .duit-sector-value{text-align:right;white-space:nowrap}
      #main .duit-sector-value strong{font-family:'Clash Display';font-size:15px}
      #main .duit-sector-selected{background:rgba(255,210,0,.08);border-radius:8px;padding:5px 7px;margin:-5px -7px}
      @media(max-width:700px){
        #main .duit-sector-row{grid-template-columns:120px 1fr 72px;gap:8px}
        #main .duit-sector-name{font-size:11px}
      }
    `;
    document.head.appendChild(s);
  }

  function render(){
    const analytics=document.getElementById('duit-prospect-analytics');
    if(!analytics) return;
    installCss();
    let panel=document.getElementById('duit-sector-chart');
    if(!panel){
      panel=document.createElement('section');
      panel.id='duit-sector-chart';
      panel.className='duit-sector-panel';
      analytics.appendChild(panel);
    }

    const rows=rowsForChart();
    const total=rows.length;
    const counts=new Map();
    rows.forEach(p=>{
      const group=sectorGroup(p.sector);
      counts.set(group,(counts.get(group)||0)+1);
    });
    const data=[...counts.entries()].map(([sector,count])=>({sector,count,pct:total?count/total*100:0})).sort((a,b)=>b.count-a.count||a.sector.localeCompare(b.sector,'pt'));
    const selected=currentFilters().sector;

    panel.innerHTML=`
      <div class="duit-sector-head">
        <div><h3>Prospects por setor</h3><div class="duit-sector-sub">Peso de cada setor no universo filtrado por período e serviço.</div></div>
        <div class="duit-sector-sub"><strong>${total}</strong> prospects analisados</div>
      </div>
      ${!data.length?'<div class="empty" style="padding:18px 0">Sem dados para este filtro.</div>':`<div class="duit-sector-list">${data.map(item=>{
        const width=Math.max(2,Math.round(item.pct));
        const active=selected!=='all'&&norm(selected)===norm(item.sector);
        return `<div class="duit-sector-row ${active?'duit-sector-selected':''}"><div class="duit-sector-name" title="${esc(item.sector)}">${esc(item.sector)}</div><div class="duit-sector-track"><div class="duit-sector-fill" style="width:${width}%"></div></div><div class="duit-sector-value"><strong>${item.pct.toFixed(1).replace('.',',')}%</strong> · ${item.count}</div></div>`;
      }).join('')}</div>`}
    `;
  }

  async function load(){
    if(state.loading) return;
    if(state.loaded){render();return;}
    state.loading=true;
    try{
      state.rows=await api('/api/crm/prospects')||[];
      state.loaded=true;
      render();
    }catch(e){
      console.warn('[prospects-sector-chart]',e.message);
    }finally{state.loading=false;}
  }

  function sync(){
    const main=document.getElementById('main');
    const title=main?.querySelector('.page-head h1')?.textContent?.trim().toLowerCase();
    if(title!=='prospecção') return;
    if(!document.getElementById('duit-prospect-analytics')) return;
    load();
  }

  document.addEventListener('change',e=>{
    if(e.target?.matches?.('[data-analytics-filter]')) setTimeout(render,0);
  });

  const main=document.getElementById('main');
  if(main)new MutationObserver(()=>requestAnimationFrame(sync)).observe(main,{childList:true,subtree:true});
  sync();
})();
