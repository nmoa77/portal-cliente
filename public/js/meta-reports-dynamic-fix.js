/* DUIT — cliente/período dinâmicos + métricas de Reels */
(() => {
  let data=null;
  const months=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const n=v=>Number(v||0).toLocaleString('pt-PT');

  const prevFetch=window.fetch.bind(window);
  window.fetch=async(...args)=>{
    const res=await prevFetch(...args);
    try{
      const url=String(args[0]?.url||args[0]||'');
      if(url.includes('/api/meta/collect-test/')){
        res.clone().json().then(d=>{data=d;setTimeout(apply,60);setTimeout(apply,260);setTimeout(apply,650);}).catch(()=>{});
      }
    }catch(_){ }
    return res;
  };

  function monthLabel(){
    const y=Number(data?.period?.year||0),m=Number(data?.period?.month||0);
    return y&&m>=1&&m<=12?`${months[m-1]} ${y}`:'';
  }

  function replaceClientAndPeriod(book){
    if(!data)return;
    const client=String(data?.client?.name||'Cliente');
    const month=monthLabel();
    const monthUpper=month.toUpperCase();
    const monthName=month.split(' ')[0]||'';

    const cover=[...book.querySelectorAll(':scope > .mr-page')].find(p=>p.classList.contains('mr-cover-final')||(!p.querySelector('.mr-network')&&!p.classList.contains('mr-divider')&&!p.classList.contains('mr-closing')&&/Relatório de redes sociais/i.test(p.textContent||'')));
    if(cover){
      cover.classList.add('mr-cover-final');
      const top=cover.querySelector('.mr-cover-top span:last-child');if(top&&monthUpper)top.textContent=monthUpper;
      const foot=cover.querySelector('.mr-cover-foot span:first-child');if(foot)foot.textContent=client;
      const mainP=cover.querySelector('.mr-cover-main p');if(mainP)mainP.textContent=client;
      cover.querySelectorAll('div,p,span').forEach(el=>{if(el.children.length)return;const t=(el.textContent||'').trim();if(t==='Seven Fitness Club')el.textContent=client;if(/^Agosto 2026$/i.test(t)&&month)el.textContent=month;});
      const summary=cover.querySelector('.mr-summary');
      if(summary)summary.textContent=`Uma leitura objetiva do desempenho digital da ${client} durante ${monthName}, com os principais indicadores e os conteúdos que mais se destacaram.`;
    }

    book.querySelectorAll('.mr-brand').forEach(el=>{const t=(el.textContent||'').trim();if(t==='Seven Fitness Club')el.textContent=client;if(/^Agosto 2026$/i.test(t)&&month)el.textContent=month;});
    book.querySelectorAll('.mr-divider-top span:last-child,.mr-closing-top span:last-child').forEach(el=>{if(monthUpper)el.textContent=monthUpper;});
  }

  function fixReelRows(book){
    if(!data)return;
    const media=(data.instagram?.media||[]).map(p=>({
      type:String(p.media_product_type||p.media_type||'').toUpperCase(),
      views:Number(p.metrics?.views||p.metrics?.plays||0),
      reach:Number(p.metrics?.reach||0),
      caption:p.caption||''
    })).sort((a,b)=>(b.views||b.reach)-(a.views||a.reach)).slice(0,5);
    const page=[...book.querySelectorAll('.mr-page')].find(p=>p.querySelector('.mr-network')?.textContent.includes('Instagram')&&p.querySelector('h2')?.textContent.trim()==='Visualizações');
    if(!page)return;
    page.querySelectorAll('.mr-top-row').forEach((row,i)=>{
      const item=media[i];if(!item)return;
      const network=row.querySelector('.mr-top-copy span');
      if(network)network.textContent=item.type==='REELS'||item.type==='REEL'?'REEL':'INSTAGRAM';
      const num=row.querySelector('.mr-top-number');
      if(num){
        const value=item.views||item.reach;
        num.innerHTML=`${n(value)}<small>${item.type==='REELS'||item.type==='REEL'?'visualizações':'visualizações'}</small>`;
      }
    });
  }

  function apply(){document.querySelectorAll('.mr-book').forEach(book=>{replaceClientAndPeriod(book);fixReelRows(book);});}
  let queued=false;
  const obs=new MutationObserver(()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;apply();},100);});
  obs.observe(document.body,{childList:true,subtree:true});
  apply();
})();
