/* DUIT — correções finais de branding e métricas dos relatórios Meta */
(() => {
  const igSmall=`<svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>`;
  const igBig=`<svg viewBox="0 0 24 24" width="58" height="58" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>`;
  let reportData=null;

  const prevFetch=window.fetch.bind(window);
  window.fetch=async (...args)=>{
    const res=await prevFetch(...args);
    try{
      const url=String(args[0]?.url||args[0]||'');
      if(url.includes('/api/meta/collect-test/')){
        res.clone().json().then(d=>{reportData=d; setTimeout(applyAll,0); setTimeout(applyAll,150);}).catch(()=>{});
      }
    }catch(_){ }
    return res;
  };

  function logoImg(cls='mr-duit-logo'){
    return `<img class="${cls}" src="/logo-branco.png" alt="DUIT">`;
  }

  function fixBranding(book){
    book.querySelectorAll('.mr-network').forEach(net=>{
      if(net.textContent.toLowerCase().includes('instagram')){
        let b=net.querySelector('b');
        if(!b){b=document.createElement('b');net.prepend(b);}
        b.innerHTML=igSmall;
      }
    });
    book.querySelectorAll('.mr-divider').forEach(page=>{
      const title=page.querySelector('h2')?.textContent.trim();
      if(title==='Instagram'){
        const icon=page.querySelector('.mr-divider-icon'); if(icon) icon.innerHTML=igBig;
      }
      const foot=page.querySelector('.mr-divider-foot strong');
      if(foot) foot.outerHTML=logoImg('mr-duit-logo mr-duit-logo-divider');
    });
    book.querySelectorAll('.mr-closing').forEach(page=>{
      const logo=page.querySelector('.mr-closing-logo'); if(logo) logo.innerHTML=logoImg('mr-duit-logo mr-duit-logo-closing');
    });
  }

  function fixInteraction(book){
    if(!reportData) return;
    const i=reportData.instagram?.totals||{};
    const page=[...book.querySelectorAll('.mr-page')].find(p=>p.querySelector('.mr-network')?.textContent.includes('Instagram')&&p.querySelector('h2')?.textContent.trim()==='Interação');
    if(!page) return;
    const vals=[['Gostos',Number(i.likes||0)],['Comentários',Number(i.comments||0)],['Partilhas',Number(i.shares||0)],['Guardados',Number(i.saved||0)]];
    const max=Math.max(1,...vals.map(v=>v[1]));
    const rows=page.querySelectorAll('.mr-activity-row');
    rows.forEach((row,idx)=>{
      const val=vals[idx]?.[1]??0;
      const strong=row.querySelector('.mr-activity-head strong'); if(strong) strong.textContent=val.toLocaleString('pt-PT');
      const fill=row.querySelector('.mr-activity-fill'); if(fill) fill.style.width=`${val?Math.max(4,(val/max)*100):0}%`;
    });
  }

  function ensureStyle(){
    if(document.getElementById('mr-final-fix-style')) return;
    const s=document.createElement('style');s.id='mr-final-fix-style';
    s.textContent=`.mr-duit-logo{display:block;object-fit:contain;object-position:left center}.mr-duit-logo-divider{width:128px;max-height:48px}.mr-duit-logo-closing{width:300px;max-width:42vw;max-height:130px}.mr-divider-icon svg{display:block}.mr-network b svg{display:block}`;
    document.head.appendChild(s);
  }

  function applyAll(){
    ensureStyle();
    document.querySelectorAll('.mr-book').forEach(book=>{fixBranding(book);fixInteraction(book);});
  }

  const obs=new MutationObserver(applyAll);
  obs.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-collect]')) reportData=null;},true);
  applyAll();
})();
