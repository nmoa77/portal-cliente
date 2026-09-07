/* DUIT — cliente/período dinâmicos + capa profissional + métricas de Reels */
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

  function ensureCoverStyle(){
    if(document.getElementById('mr-cover-v2-style'))return;
    const st=document.createElement('style');st.id='mr-cover-v2-style';
    st.textContent=`.mr-cover-final{background:#111!important;color:#fff!important;min-height:1120px!important;padding:56px 60px!important;display:flex!important;flex-direction:column!important;box-sizing:border-box}.mr-cover-final .mr-cover-v2-top{display:flex;justify-content:space-between;align-items:center;padding-bottom:22px;border-bottom:1px solid #303030;font-size:11px;letter-spacing:.18em;color:#8d8d8d}.mr-cover-final .mr-cover-v2-main{margin:auto 0;max-width:880px}.mr-cover-final .mr-cover-v2-eyebrow{font-size:12px;letter-spacing:.22em;color:#8d8d8d;margin-bottom:26px;text-transform:uppercase}.mr-cover-final .mr-cover-v2-client{font-size:94px!important;line-height:.9!important;letter-spacing:-.065em!important;font-weight:700!important;color:#fff!important;margin:0 0 30px!important;max-width:900px;overflow-wrap:anywhere}.mr-cover-final .mr-cover-v2-line{width:72px;height:3px;background:#fff;margin:0 0 30px}.mr-cover-final .mr-cover-v2-sub{font-size:22px;line-height:1.4;color:#b7b7b7;margin:0;max-width:680px}.mr-cover-final .mr-cover-v2-bottom{display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid #303030;padding-top:26px}.mr-cover-final .mr-cover-v2-logo{width:150px;max-height:52px;object-fit:contain;object-position:left center}.mr-cover-final .mr-cover-v2-bottom-copy{text-align:right;font-size:10px;line-height:1.7;letter-spacing:.16em;color:#777}@media(max-width:800px){.mr-cover-final{min-height:760px!important;padding:36px 30px!important}.mr-cover-final .mr-cover-v2-client{font-size:58px!important}.mr-cover-final .mr-cover-v2-sub{font-size:17px}}`;
    document.head.appendChild(st);
  }

  function replaceClientAndPeriod(book){
    if(!data)return;
    ensureCoverStyle();
    const client=String(data?.client?.name||'Cliente');
    const month=monthLabel();
    const monthUpper=month.toUpperCase();

    let cover=[...book.querySelectorAll(':scope > .mr-page')].find(p=>p.classList.contains('mr-cover-final')||(!p.querySelector('.mr-network')&&!p.classList.contains('mr-divider')&&!p.classList.contains('mr-closing')&&/Relatório de redes sociais/i.test(p.textContent||'')));
    if(!cover){cover=document.createElement('section');cover.className='mr-page mr-cover-final';book.insertBefore(cover,book.firstElementChild);}
    cover.classList.add('mr-cover-final');
    if(cover.dataset.coverV2!==`${client}|${month}`){
      cover.dataset.coverV2=`${client}|${month}`;
      cover.innerHTML=`<div class="mr-cover-v2-top"><span>RELATÓRIO DE REDES SOCIAIS</span><span>${monthUpper}</span></div><div class="mr-cover-v2-main"><div class="mr-cover-v2-eyebrow">FACEBOOK · INSTAGRAM</div><h1 class="mr-cover-v2-client">${client}</h1><div class="mr-cover-v2-line"></div><p class="mr-cover-v2-sub">Resultados, conteúdos e desempenho digital do mês.</p></div><div class="mr-cover-v2-bottom"><img class="mr-cover-v2-logo" src="/logo-branco.png" alt="DUIT"><div class="mr-cover-v2-bottom-copy">DESIGN · REDES SOCIAIS<br>DESIGN? WE DUIT.</div></div>`;
    }

    book.querySelectorAll('.mr-brand').forEach(el=>{const t=(el.textContent||'').trim();if(t==='Seven Fitness Club')el.textContent=client;if(/^Agosto 2026$/i.test(t)&&month)el.textContent=month;});
    book.querySelectorAll('.mr-divider-top span:last-child,.mr-closing-top span:last-child').forEach(el=>{if(monthUpper)el.textContent=monthUpper;});
  }

  function fixReelRows(book){
    if(!data)return;
    const media=(data.instagram?.media||[]).map(p=>({type:String(p.media_product_type||p.media_type||'').toUpperCase(),views:Number(p.metrics?.views||p.metrics?.plays||0),reach:Number(p.metrics?.reach||0),caption:p.caption||''})).sort((a,b)=>(b.views||b.reach)-(a.views||a.reach)).slice(0,5);
    const page=[...book.querySelectorAll('.mr-page')].find(p=>p.querySelector('.mr-network')?.textContent.includes('Instagram')&&p.querySelector('h2')?.textContent.trim()==='Visualizações');
    if(!page)return;
    page.querySelectorAll('.mr-top-row').forEach((row,i)=>{
      const item=media[i];if(!item)return;
      const isReel=item.type.includes('REEL');
      const network=row.querySelector('.mr-top-copy span');if(network)network.textContent=isReel?'REEL':'INSTAGRAM';
      const num=row.querySelector('.mr-top-number');if(num){const value=item.views||item.reach;num.innerHTML=`${n(value)}<small>visualizações</small>`;}
    });
  }

  function apply(){document.querySelectorAll('.mr-book').forEach(book=>{replaceClientAndPeriod(book);fixReelRows(book);});}
  let queued=false;
  const obs=new MutationObserver(()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;apply();},100);});
  obs.observe(document.body,{childList:true,subtree:true});
  apply();
})();
