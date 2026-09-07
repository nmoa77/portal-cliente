/* DUIT — correções finais de branding, métricas e conclusão dos relatórios Meta */
(() => {
  const igSmall=`<svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>`;
  const igBig=`<svg viewBox="0 0 24 24" width="58" height="58" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>`;
  let reportData=null, applying=false;

  const prevFetch=window.fetch.bind(window);
  window.fetch=async (...args)=>{
    const res=await prevFetch(...args);
    try{
      const url=String(args[0]?.url||args[0]||'');
      if(url.includes('/api/meta/collect-test/')){
        res.clone().json().then(d=>{reportData=d; setTimeout(applyAll,0); setTimeout(applyAll,180); setTimeout(applyAll,500);}).catch(()=>{});
      }
    }catch(_){ }
    return res;
  };

  const n=v=>Number(v||0).toLocaleString('pt-PT');
  function logoImg(cls='mr-duit-logo'){return `<img class="${cls}" src="/logo-branco.png" alt="DUIT">`;}

  function recommendationHtml(d){
    const i=d?.instagram?.totals||{}, f=d?.facebook?.totals||{};
    const media=(d?.instagram?.media||[]).map(p=>({caption:p.caption||'',views:Number(p.metrics?.views||0),reach:Number(p.metrics?.reach||0),inter:Number(p.metrics?.total_interactions||0)})).sort((a,b)=>(b.views||b.reach)-(a.views||a.reach));
    const top=media[0], second=media[1], rec=[];
    const rate=Number(i.views||0)>0?(Number(i.interactions||0)/Number(i.views||0))*100:0;
    if(rate<2) rec.push(['Aumentar a taxa de interação',`O Instagram registou ${n(i.views)} visualizações e ${n(i.interactions)} interações. O próximo passo é transformar uma fatia maior dessa visibilidade em ações, com CTAs mais claros e conteúdos que convidem a guardar, partilhar ou responder.`]);
    if(Number(i.comments||0)===0) rec.push(['Gerar mais conversa','Não foram registados comentários no Instagram. No próximo mês, devemos introduzir mais perguntas, escolhas e chamadas à opinião para incentivar participação real.']);
    if(Number(i.shares||0)<5) rec.push(['Criar conteúdo mais partilhável','As partilhas continuam reduzidas. Dicas práticas, mitos, listas curtas, desafios e conteúdos em que o público se reconheça podem aumentar a distribuição orgânica.']);
    if(Number(i.saved||0)<8) rec.push(['Aumentar o valor útil dos conteúdos','Os guardados podem crescer com exercícios, pequenas rotinas, checklists, erros comuns e recomendações que as pessoas queiram consultar novamente.']);
    if(top) rec.push(['Replicar os temas que já funcionaram',`O conteúdo “${(top.caption||'conteúdo em destaque').slice(0,72)}${(top.caption||'').length>72?'…':''}” esteve entre os mais vistos. Devemos explorar novas variações do mesmo tema e formato, sem repetir a publicação.`]);
    if(second && rec.length<5) rec.push(['Criar séries a partir dos melhores temas',`O bom desempenho de “${(second.caption||'conteúdo em destaque').slice(0,68)}${(second.caption||'').length>68?'…':''}” mostra potencial para transformar o tema numa sequência de conteúdos relacionados.`]);
    const fbInt=Number(f.reactions||0)+Number(f.comments||0)+Number(f.shares||0);
    if(Number(f.posts||0)>0 && fbInt/Number(f.posts||1)<2) rec.push(['Reforçar o Facebook','A interação por publicação no Facebook foi baixa. Textos mais diretos, perguntas logo no início e conteúdos adaptados à própria rede podem ajudar a aumentar a participação.']);
    return rec.slice(0,5).map((r,idx)=>`<div class="mr-rec"><div class="mr-rec-n">0${idx+1}</div><div><h3>${r[0]}</h3><p>${r[1]}</p></div></div>`).join('');
  }

  function fixBranding(book){
    book.querySelectorAll('.mr-network').forEach(net=>{
      if(net.textContent.toLowerCase().includes('instagram')){
        let b=net.querySelector('b'); if(!b){b=document.createElement('b');net.prepend(b);} if(!b.querySelector('svg')) b.innerHTML=igSmall;
      }
    });
    book.querySelectorAll('.mr-divider').forEach(page=>{
      const title=page.querySelector('h2')?.textContent.trim();
      const icon=page.querySelector('.mr-divider-icon');
      if(title==='Instagram' && icon) icon.innerHTML=igBig;
      if(title==='Facebook' && icon) icon.innerHTML='<span class="mr-fb-icon" aria-hidden="true">f</span>';
      const foot=page.querySelector('.mr-divider-foot');
      if(foot && !foot.querySelector('.mr-duit-logo-divider')){const strong=foot.querySelector('strong'); if(strong) strong.outerHTML=logoImg('mr-duit-logo mr-duit-logo-divider');}
    });
    book.querySelectorAll('.mr-closing').forEach(page=>{
      const logo=page.querySelector('.mr-closing-logo'); if(logo && !logo.querySelector('.mr-duit-logo-closing')) logo.innerHTML=logoImg('mr-duit-logo mr-duit-logo-closing');
    });
  }

  function fixInteraction(book){
    if(!reportData) return;
    const i=reportData.instagram?.totals||{};
    const page=[...book.querySelectorAll('.mr-page')].find(p=>p.querySelector('.mr-network')?.textContent.includes('Instagram')&&p.querySelector('h2')?.textContent.trim()==='Interação');
    if(!page) return;
    const vals=[['Gostos',Number(i.likes||0)],['Comentários',Number(i.comments||0)],['Partilhas',Number(i.shares||0)],['Guardados',Number(i.saved||0)]];
    const max=Math.max(1,...vals.map(v=>v[1]));
    page.querySelectorAll('.mr-activity-row').forEach((row,idx)=>{
      const val=vals[idx]?.[1]??0;
      const strong=row.querySelector('.mr-activity-head strong'); if(strong) strong.textContent=val.toLocaleString('pt-PT');
      const fill=row.querySelector('.mr-activity-fill'); if(fill) fill.style.width=`${val?Math.max(4,(val/max)*100):0}%`;
    });
  }

  function fixConclusion(book){
    if(!reportData) return;
    const pages=[...book.querySelectorAll('.mr-page')];
    const page=pages.find(p=>/Durante\s+\w+\s+foram\s+publicados/i.test(p.textContent||'')) || pages.find(p=>[...p.querySelectorAll('.mr-brand')].some(x=>x.textContent.trim()==='Conclusão'));
    if(!page || page.dataset.dynamicConclusion==='1') return;
    page.dataset.dynamicConclusion='1';
    const h2=page.querySelector('h2'); if(h2) h2.textContent='O que melhorar no próximo mês';
    page.querySelectorAll('.mr-summary,.mr-section').forEach(el=>el.remove());
    const wrap=document.createElement('div'); wrap.className='mr-recommendations'; wrap.innerHTML=recommendationHtml(reportData);
    const head=page.querySelector('.mr-head');
    if(head) head.insertAdjacentElement('afterend',wrap); else page.appendChild(wrap);
  }

  function ensureStyle(){
    if(document.getElementById('mr-final-fix-style')) return;
    const s=document.createElement('style');s.id='mr-final-fix-style';
    s.textContent=`.mr-duit-logo{display:block;object-fit:contain;object-position:left center}.mr-duit-logo-divider{width:128px;max-height:48px}.mr-duit-logo-closing{width:300px;max-width:42vw;max-height:130px}.mr-divider-icon svg,.mr-network b svg{display:block}.mr-fb-icon{width:58px;height:58px;border-radius:50%;background:#fff;color:#111;display:flex;align-items:center;justify-content:center;font:700 48px/1 Arial,sans-serif;padding-top:7px;box-sizing:border-box}.mr-recommendations{display:grid;gap:0;margin-top:8px}.mr-rec{display:grid;grid-template-columns:54px 1fr;gap:18px;padding:22px 0;border-bottom:1px solid #e7e7e2}.mr-rec-n{font-size:22px;color:#aaa}.mr-rec h3{font-size:22px!important;margin:0 0 8px!important}.mr-rec p{font-size:16px;line-height:1.55;color:#575752;margin:0;max-width:820px}`;
    document.head.appendChild(s);
  }

  function applyAll(){
    if(applying) return; applying=true;
    try{ensureStyle();document.querySelectorAll('.mr-book').forEach(book=>{fixBranding(book);fixInteraction(book);fixConclusion(book);});}
    finally{applying=false;}
  }

  let queued=false;
  const obs=new MutationObserver(()=>{if(queued||applying)return;queued=true;requestAnimationFrame(()=>{queued=false;applyAll();});});
  obs.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-collect]')) reportData=null;},true);
  applyAll();
})();
