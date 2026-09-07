/* DUIT — acabamento dos relatórios Meta */
(() => {
  const n=v=>Number(v||0).toLocaleString('pt-PT');
  let lastData=null, timer=null, progress=0;

  const originalFetch=window.fetch.bind(window);
  window.fetch=async (...args)=>{
    const res=await originalFetch(...args);
    try{
      const url=String(args[0]?.url||args[0]||'');
      if(url.includes('/api/meta/collect-test/')){
        const clone=res.clone();
        clone.json().then(d=>{lastData=d; setProgress(Math.max(progress,92));}).catch(()=>{});
      }
    }catch(_){ }
    return res;
  };

  function ensureLoader(){
    let el=document.getElementById('meta-report-preload');
    if(el) return el;
    el=document.createElement('div');
    el.id='meta-report-preload';
    el.innerHTML=`<div class="mr-preload-card"><div class="mr-preload-label">A gerar relatório</div><div class="mr-preload-value">0%</div><div class="mr-preload-track"><div class="mr-preload-bar"></div></div><div class="mr-preload-note">A recolher conteúdos, métricas e imagens da Meta…</div></div>`;
    Object.assign(el.style,{position:'fixed',inset:'0',background:'rgba(255,255,255,.88)',backdropFilter:'blur(8px)',zIndex:'99999',display:'flex',alignItems:'center',justifyContent:'center'});
    document.body.appendChild(el);
    const style=document.createElement('style');
    style.id='meta-report-preload-style';
    style.textContent=`#meta-report-preload .mr-preload-card{width:min(460px,82vw);padding:34px 36px;background:#fff;border:1px solid #e7e7e2;border-radius:18px;box-shadow:0 18px 55px rgba(0,0,0,.10)}#meta-report-preload .mr-preload-label{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#888;font-weight:700}#meta-report-preload .mr-preload-value{font-size:64px;line-height:1;font-weight:800;letter-spacing:-.05em;margin:14px 0 18px}#meta-report-preload .mr-preload-track{height:8px;background:#ecece8;border-radius:999px;overflow:hidden}#meta-report-preload .mr-preload-bar{height:100%;width:0;background:#111;transition:width .28s ease;border-radius:999px}#meta-report-preload .mr-preload-note{font-size:12px;color:#8a8a84;margin-top:12px}`;
    document.head.appendChild(style);
    return el;
  }
  function setProgress(v){
    progress=Math.max(0,Math.min(100,Math.round(v)));
    const el=document.getElementById('meta-report-preload'); if(!el) return;
    el.querySelector('.mr-preload-value').textContent=`${progress}%`;
    el.querySelector('.mr-preload-bar').style.width=`${progress}%`;
    if(progress>=100) el.querySelector('.mr-preload-note').textContent='Relatório concluído.';
  }
  function startProgress(){
    clearInterval(timer); progress=3; ensureLoader(); setProgress(progress);
    timer=setInterval(()=>{ if(progress<88){ const step=progress<45?7:progress<70?4:2; setProgress(progress+step); } },260);
  }
  function finishProgress(){
    clearInterval(timer); setProgress(100);
    setTimeout(()=>document.getElementById('meta-report-preload')?.remove(),420);
  }

  document.addEventListener('click',e=>{
    const btn=e.target.closest?.('[data-collect]');
    if(btn) startProgress();
  },true);

  const instagramSvg=`<svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>`;
  const instagramBigSvg=`<svg viewBox="0 0 24 24" width="54" height="54" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>`;
  const facebookSvg=`<svg viewBox="0 0 24 24" width="54" height="54" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M13.6 7.4h2V4.2c-.35-.05-1.55-.15-2.98-.15-2.95 0-4.97 1.8-4.97 5.1V12H4.5v3.6h3.15V24h3.86v-8.4h3.22l.51-3.6h-3.73V9.5c0-1.04.28-2.1 2.09-2.1Z" fill="#fff"/></svg>`;

  function lineChart(points,label){
    const clean=(points||[]).filter(p=>Number.isFinite(Number(p.value))).sort((a,b)=>new Date(a.date)-new Date(b.date));
    if(!clean.length) return '<div class="mr-chart-empty">Sem dados suficientes para este gráfico.</div>';
    const w=760,h=210,padL=42,padR=18,padT=20,padB=36,max=Math.max(1,...clean.map(p=>Number(p.value||0)));
    const usableW=w-padL-padR,usableH=h-padT-padB,step=clean.length>1?usableW/(clean.length-1):0;
    const pts=clean.map((p,i)=>({x:padL+i*step,y:padT+usableH-(Number(p.value||0)/max)*usableH,...p}));
    const grid=[0,.25,.5,.75,1].map(q=>{const y=padT+usableH-(q*usableH);return `<line x1="${padL}" y1="${y}" x2="${w-padR}" y2="${y}" stroke="#ecece8" stroke-width="1"/><text x="${padL-8}" y="${y+4}" text-anchor="end" font-size="10" fill="#999">${n(Math.round(max*q))}</text>`;}).join('');
    const poly=pts.map(p=>`${p.x},${p.y}`).join(' ');
    return `<div class="mr-chart-box"><svg viewBox="0 0 ${w} ${h}" class="mr-line-svg" role="img" aria-label="${label}">${grid}<polyline points="${poly}" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${pts.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="4.5" fill="#fff" stroke="#111" stroke-width="2"><title>${p.label}: ${n(p.value)}</title></circle><text x="${p.x}" y="${h-12}" text-anchor="middle" font-size="10" fill="#999">${p.label}</text>`).join('')}</svg></div>`;
  }

  function recommendationHtml(d){
    const i=d?.instagram?.totals||{}, f=d?.facebook?.totals||{};
    const media=(d?.instagram?.media||[]).map(p=>({caption:p.caption||'',views:Number(p.metrics?.views||0),reach:Number(p.metrics?.reach||0),inter:Number(p.metrics?.total_interactions||0)})).sort((a,b)=>(b.views||b.reach)-(a.views||a.reach));
    const top=media[0], second=media[1];
    const rec=[];
    if(Number(i.comments||0)===0) rec.push(['Gerar mais conversa','O Instagram não registou comentários. No próximo mês, usar perguntas simples, escolhas e chamadas à opinião para transformar visualizações em conversa.']);
    const rate=Number(i.views||0)>0?(Number(i.interactions||0)/Number(i.views||0))*100:0;
    if(rate<2) rec.push(['Aumentar a taxa de interação',`As publicações tiveram ${n(i.views)} visualizações e ${n(i.interactions)} interações. Há margem para incluir CTAs mais claros e formatos que convidem a guardar, partilhar ou responder.`]);
    if(Number(i.shares||0)<5) rec.push(['Criar conteúdo mais partilhável','As partilhas ainda são reduzidas. Apostar em dicas práticas, mitos, listas curtas, desafios e conteúdos em que o público se reconheça pode aumentar a distribuição orgânica.']);
    if(Number(i.saved||0)<8) rec.push(['Dar mais valor útil aos posts','Os guardados podem crescer com conteúdos de referência: exercícios, pequenas rotinas, erros comuns, checklists e recomendações que as pessoas queiram consultar novamente.']);
    if(top) rec.push(['Replicar o que já funcionou',`O conteúdo “${(top.caption||'conteúdo em destaque').slice(0,72)}${(top.caption||'').length>72?'…':''}” esteve entre os mais vistos. Vale manter o mesmo tipo de tema/abordagem e criar novas variações sem repetir a publicação.`]);
    if(second && rec.length<5) rec.push(['Construir séries de conteúdo',`O segundo conteúdo com melhor desempenho foi “${(second.caption||'conteúdo em destaque').slice(0,68)}${(second.caption||'').length>68?'…':''}”. Transformar temas fortes em séries ajuda a criar consistência e reconhecimento.`]);
    const fbInt=Number(f.reactions||0)+Number(f.comments||0)+Number(f.shares||0);
    if(Number(f.posts||0)>0 && fbInt/Number(f.posts||1)<2) rec.push(['Reforçar o Facebook','O Facebook apresentou pouca interação por publicação. Adaptar os conteúdos ao comportamento da rede, com textos mais diretos e perguntas no início, pode ajudar a recuperar participação.']);
    return rec.slice(0,5).map((r,idx)=>`<div class="mr-rec"><div class="mr-rec-n">0${idx+1}</div><div><h3>${r[0]}</h3><p>${r[1]}</p></div></div>`).join('');
  }

  function addCharts(pages,d){
    const igMedia=d?.instagram?.media||[];
    const fbPosts=d?.facebook?.posts||[];
    const igViews=igMedia.map(p=>({date:p.timestamp,label:p.timestamp?new Date(p.timestamp).toLocaleDateString('pt-PT',{day:'2-digit',month:'2-digit'}):'',value:Number(p.metrics?.views||p.metrics?.reach||0)}));
    const igInter=igMedia.map(p=>({date:p.timestamp,label:p.timestamp?new Date(p.timestamp).toLocaleDateString('pt-PT',{day:'2-digit',month:'2-digit'}):'',value:Number(p.metrics?.total_interactions||0)}));
    const fbInter=fbPosts.map(p=>({date:p.created_time,label:p.created_time?new Date(p.created_time).toLocaleDateString('pt-PT',{day:'2-digit',month:'2-digit'}):'',value:Number(p.reactions_count||0)+Number(p.comments_count||0)+Number(p.shares_count||0)}));

    const igViewsPage=pages.find(p=>p.querySelector('.mr-network')?.textContent.includes('Instagram') && p.querySelector('h2')?.textContent.trim()==='Visualizações');
    if(igViewsPage && !igViewsPage.querySelector('.mr-real-chart')){
      const section=igViewsPage.querySelector('.mr-section');
      if(section){const chart=document.createElement('div');chart.className='mr-section mr-real-chart';chart.innerHTML=`<h3>Visualizações por conteúdo publicado</h3>${lineChart(igViews,'Visualizações por conteúdo')}<p class="mr-note">Cada ponto corresponde a um conteúdo publicado no mês. Não representa visualizações diárias da conta.</p>`;section.parentNode.insertBefore(chart,section);}
    }

    const igInteraction=pages.find(p=>p.querySelector('.mr-network')?.textContent.includes('Instagram') && p.querySelector('h2')?.textContent.trim()==='Interação');
    if(igInteraction && !igInteraction.querySelector('.mr-real-chart')){
      const section=igInteraction.querySelector('.mr-section');
      if(section){const chart=document.createElement('div');chart.className='mr-section mr-real-chart';chart.innerHTML=`<h3>Interações por conteúdo publicado</h3>${lineChart(igInter,'Interações por conteúdo')}<p class="mr-note">Evolução do desempenho entre os conteúdos publicados ao longo do mês.</p>`;section.insertAdjacentElement('afterend',chart);}
    }

    const fbInteraction=pages.find(p=>p.querySelector('.mr-network')?.textContent.includes('Facebook') && p.querySelector('h2')?.textContent.trim()==='Interação');
    if(fbInteraction && !fbInteraction.querySelector('.mr-real-chart')){
      const section=fbInteraction.querySelector('.mr-section');
      if(section){const chart=document.createElement('div');chart.className='mr-section mr-real-chart';chart.innerHTML=`<h3>Interações por conteúdo publicado</h3>${lineChart(fbInter,'Interações Facebook por conteúdo')}<p class="mr-note">Reações, comentários e partilhas agrupados por publicação.</p>`;section.parentNode.insertBefore(chart,section);}
    }
  }

  function monthLabel(book){
    const m=(book.textContent||'').match(/(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+20\d{2}/i);
    return m?m[0].toUpperCase():'';
  }
  function divider(network,month){
    const el=document.createElement('section'); el.className='mr-page mr-divider';
    el.innerHTML=`<div class="mr-divider-top"><span>RELATÓRIO DE REDES SOCIAIS</span><span>${month}</span></div><div class="mr-divider-main"><div class="mr-divider-icon">${network==='Instagram'?instagramBigSvg:facebookSvg}</div><div class="mr-divider-kicker">RESULTADOS · ANÁLISE · CONTEÚDOS</div><h2>${network}</h2><p>${network==='Instagram'?'Desempenho e conteúdos publicados no Instagram.':'Desempenho e conteúdos publicados no Facebook.'}</p></div><div class="mr-divider-foot"><strong>DUIT</strong><span>DESIGN · REDES SOCIAIS</span></div>`;
    return el;
  }
  function closing(month){
    const el=document.createElement('section'); el.className='mr-page mr-closing';
    el.innerHTML=`<div class="mr-closing-top"><span>RELATÓRIO DE REDES SOCIAIS</span><span>${month}</span></div><div class="mr-closing-main"><div class="mr-closing-eyebrow">RELATÓRIO DESENVOLVIDO POR</div><div class="mr-closing-logo">DUIT<span>.</span></div><h2>Design? We DUIT.</h2><p>Design, estratégia e gestão de redes sociais.</p></div><div class="mr-contact-grid"><div><small>WEB</small><strong>www.duit.pt</strong></div><div><small>EMAIL</small><strong>geral@duit.pt</strong></div><div><small>INSTAGRAM</small><strong>@duit.pt</strong></div></div><div class="mr-closing-foot">DUIT · DESIGN & REDES SOCIAIS</div>`;
    return el;
  }
  function addDividers(book,pages){
    if(book.dataset.dividers==='1') return;
    book.dataset.dividers='1';
    const month=monthLabel(book);
    const firstIg=pages.find(p=>p.querySelector('.mr-network')?.textContent.includes('Instagram'));
    const firstFb=pages.find(p=>p.querySelector('.mr-network')?.textContent.includes('Facebook'));
    if(firstIg) firstIg.before(divider('Instagram',month));
    if(firstFb) firstFb.before(divider('Facebook',month));
    book.appendChild(closing(month));
  }

  function polishBook(book){
    if(!book || book.dataset.polished==='1') return;
    book.dataset.polished='1';

    book.querySelectorAll('.mr-network').forEach(net=>{
      if(net.textContent.toLowerCase().includes('instagram')){
        const b=net.querySelector('b'); if(b) b.innerHTML=instagramSvg;
      }
    });

    const pages=[...book.querySelectorAll('.mr-page')];
    const igInteraction=pages.find(p=>p.querySelector('.mr-network')?.textContent.includes('Instagram') && p.querySelector('h2')?.textContent.trim()==='Interação');
    if(igInteraction){
      const section=igInteraction.querySelector('.mr-section');
      const i=lastData?.instagram?.totals||{};
      if(section){
        const vals=[['Gostos',i.likes],['Comentários',i.comments],['Partilhas',i.shares],['Guardados',i.saved]];
        const max=Math.max(1,...vals.map(x=>Number(x[1]||0)));
        section.innerHTML=`<h3>Composição da interação</h3><div class="mr-activity-list">${vals.map(([label,val])=>`<div class="mr-activity-row"><div class="mr-activity-head"><span>${label}</span><strong>${n(val)}</strong></div><div class="mr-activity-track"><div class="mr-activity-fill" style="width:${Math.max(2,(Number(val||0)/max)*100)}%"></div></div></div>`).join('')}</div><p class="mr-note">Distribuição das interações registadas. Esta visualização compara tipos de interação e não representa evolução ao longo dos dias.</p>`;
      }
    }

    if(lastData) addCharts(pages,lastData);

    const conclusion=pages.find(p=>[...p.querySelectorAll('.mr-brand')].some(x=>x.textContent.trim()==='Conclusão'));
    if(conclusion && lastData){
      const h2=conclusion.querySelector('h2'); if(h2) h2.textContent='O que melhorar no próximo mês';
      conclusion.querySelectorAll('.mr-summary,.mr-section').forEach(el=>el.remove());
      const head=conclusion.querySelector('.mr-head');
      const wrap=document.createElement('div'); wrap.className='mr-recommendations'; wrap.innerHTML=recommendationHtml(lastData);
      head?.insertAdjacentElement('afterend',wrap);
    }

    addDividers(book,pages);

    if(!document.getElementById('mr-polish-style')){
      const st=document.createElement('style'); st.id='mr-polish-style'; st.textContent=`.mr-network b svg{display:block}.mr-activity-list{display:grid;gap:18px;margin-top:18px}.mr-activity-head{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:7px;font-size:14px}.mr-activity-head strong{font-size:20px}.mr-activity-track{height:10px;background:#efefec;border-radius:999px;overflow:hidden}.mr-activity-fill{height:100%;background:#111;border-radius:999px}.mr-recommendations{display:grid;gap:0;margin-top:8px}.mr-rec{display:grid;grid-template-columns:54px 1fr;gap:18px;padding:22px 0;border-bottom:1px solid #e7e7e2}.mr-rec-n{font-size:22px;color:#aaa}.mr-rec h3{font-size:22px!important;margin:0 0 8px!important}.mr-rec p{font-size:16px;line-height:1.55;color:#575752;margin:0;max-width:820px}.mr-chart-box{width:100%;overflow:hidden;margin-top:10px}.mr-line-svg{width:100%;height:auto;display:block}.mr-chart-empty{padding:30px;background:#fafaf8;color:#999;font-size:13px;border-radius:8px}.mr-divider,.mr-closing{background:#111!important;color:#fff!important;min-height:1120px;display:flex!important;flex-direction:column!important;padding:54px 58px!important;box-sizing:border-box}.mr-divider-top,.mr-closing-top{display:flex;justify-content:space-between;font-size:11px;letter-spacing:.18em;color:#aaa}.mr-divider-main{margin:auto 0}.mr-divider-icon{margin-bottom:34px}.mr-divider-kicker,.mr-closing-eyebrow{font-size:12px;letter-spacing:.2em;color:#aaa;margin-bottom:15px}.mr-divider h2{font-size:92px!important;line-height:.95!important;letter-spacing:-.06em!important;margin:0 0 22px!important;color:#fff!important}.mr-divider p,.mr-closing-main p{font-size:18px;line-height:1.5;color:#aaa;max-width:560px}.mr-divider-foot{display:flex;justify-content:space-between;align-items:end;border-top:1px solid #333;padding-top:22px}.mr-divider-foot strong{font-size:34px;letter-spacing:-.05em}.mr-divider-foot span{font-size:10px;letter-spacing:.18em;color:#888}.mr-closing-main{margin:auto 0 65px}.mr-closing-logo{font-size:104px;font-weight:900;letter-spacing:-.09em;line-height:.9}.mr-closing-logo span{color:#f2c400}.mr-closing h2{font-size:38px!important;color:#fff!important;margin:30px 0 8px!important}.mr-contact-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;border-top:1px solid #333;border-bottom:1px solid #333;padding:28px 0}.mr-contact-grid div{display:grid;gap:7px}.mr-contact-grid small{font-size:9px;letter-spacing:.18em;color:#777}.mr-contact-grid strong{font-size:15px;color:#fff}.mr-closing-foot{font-size:10px;letter-spacing:.18em;color:#777;margin-top:26px}@media print{.mr-divider,.mr-closing{break-before:page;break-after:page;page-break-before:always;page-break-after:always}}`; document.head.appendChild(st);
    }
    finishProgress();
  }

  const observer=new MutationObserver(()=>{ document.querySelectorAll('.mr-book').forEach(polishBook); });
  observer.observe(document.body,{childList:true,subtree:true});
})();