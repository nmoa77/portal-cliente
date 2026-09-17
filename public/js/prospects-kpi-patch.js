/* DUIT — KPI patch: ebook no topo + label Abertos sem glyph incompatível */
(() => {
  function syncProspectKpis(){
    const root=document.getElementById('duit-prospect-analytics');
    if(!root) return;

    const cards=[...root.querySelectorAll('.duit-analytics-card')];
    const openedCard=cards.find(c=>/abertos/i.test(c.querySelector('.k-label')?.textContent||''));
    if(openedCard){
      const label=openedCard.querySelector('.k-label');
      if(label) label.textContent='Abertos';
    }

    const ebookLoss=[...root.querySelectorAll('.loss-item')].find(el=>/ebook aberto/i.test(el.textContent||''));
    if(!ebookLoss) return;
    const value=ebookLoss.querySelector('b')?.textContent?.trim()||'0';
    const sub=ebookLoss.querySelectorAll('span')[1]?.textContent?.trim()||'';

    let ebookCard=root.querySelector('.duit-analytics-card[data-duit-ebook-kpi="1"]');
    if(!ebookCard){
      ebookCard=document.createElement('div');
      ebookCard.className='duit-analytics-card';
      ebookCard.dataset.duitEbookKpi='1';
      const grid=root.querySelector('.duit-analytics-grid');
      const readsCard=cards.find(c=>/leituras totais/i.test(c.querySelector('.k-label')?.textContent||''));
      if(grid){
        if(readsCard?.nextSibling) grid.insertBefore(ebookCard,readsCard.nextSibling);
        else grid.appendChild(ebookCard);
      }
    }
    ebookCard.innerHTML=`<div class="k-label">Ebooks lidos</div><div class="k-value">${value}</div><div class="k-sub">${sub || 'ebooks abertos pelos prospects'}</div>`;
  }

  let busy=false;
  const schedule=()=>{
    if(busy) return;
    busy=true;
    requestAnimationFrame(()=>{ busy=false; syncProspectKpis(); });
  };

  const main=document.getElementById('main')||document.body;
  new MutationObserver(schedule).observe(main,{childList:true,subtree:true});
  schedule();
})();
