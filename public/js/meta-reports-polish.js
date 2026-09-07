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

    const conclusion=pages.find(p=>[...p.querySelectorAll('.mr-brand')].some(x=>x.textContent.trim()==='Conclusão'));
    if(conclusion && lastData){
      const h2=conclusion.querySelector('h2'); if(h2) h2.textContent='O que melhorar no próximo mês';
      conclusion.querySelectorAll('.mr-summary,.mr-section').forEach(el=>el.remove());
      const head=conclusion.querySelector('.mr-head');
      const wrap=document.createElement('div'); wrap.className='mr-recommendations'; wrap.innerHTML=recommendationHtml(lastData);
      head?.insertAdjacentElement('afterend',wrap);
    }

    if(!document.getElementById('mr-polish-style')){
      const st=document.createElement('style'); st.id='mr-polish-style'; st.textContent=`.mr-network b svg{display:block}.mr-activity-list{display:grid;gap:18px;margin-top:18px}.mr-activity-head{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:7px;font-size:14px}.mr-activity-head strong{font-size:20px}.mr-activity-track{height:10px;background:#efefec;border-radius:999px;overflow:hidden}.mr-activity-fill{height:100%;background:#111;border-radius:999px}.mr-recommendations{display:grid;gap:0;margin-top:8px}.mr-rec{display:grid;grid-template-columns:54px 1fr;gap:18px;padding:22px 0;border-bottom:1px solid #e7e7e2}.mr-rec-n{font-size:22px;color:#aaa}.mr-rec h3{font-size:22px!important;margin:0 0 8px!important}.mr-rec p{font-size:16px;line-height:1.55;color:#575752;margin:0;max-width:820px}`; document.head.appendChild(st);
    }
    finishProgress();
  }

  const observer=new MutationObserver(()=>{ document.querySelectorAll('.mr-book').forEach(polishBook); });
  observer.observe(document.body,{childList:true,subtree:true});
})();
