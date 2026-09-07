/* DUIT — páginas editoriais adicionais do relatório Meta */
(() => {
  const instagramSvg=`<svg viewBox="0 0 24 24" width="54" height="54" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>`;
  const facebookSvg=`<svg viewBox="0 0 24 24" width="54" height="54" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M13.6 7.4h2V4.2c-.35-.05-1.55-.15-2.98-.15-2.95 0-4.97 1.8-4.97 5.1V12H4.5v3.6h3.15V24h3.86v-8.4h3.22l.51-3.6h-3.73V9.5c0-1.04.28-2.1 2.09-2.1Z" fill="#fff"/></svg>`;

  function monthLabel(book){
    const txt=book.textContent||'';
    const m=txt.match(/(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+20\d{2}/i);
    return m?m[0].toUpperCase():'';
  }
  function divider(network,month){
    const isIg=network==='Instagram';
    const el=document.createElement('section');
    el.className='mr-page mr-divider';
    el.innerHTML=`<div class="mr-divider-top"><span>RELATÓRIO DE REDES SOCIAIS</span><span>${month}</span></div><div class="mr-divider-main"><div class="mr-divider-icon">${isIg?instagramSvg:facebookSvg}</div><div class="mr-divider-kicker">RESULTADOS · ANÁLISE · CONTEÚDOS</div><h2>${network}</h2><p>${isIg?'Desempenho e conteúdos publicados no Instagram.':'Desempenho e conteúdos publicados no Facebook.'}</p></div><div class="mr-divider-foot"><strong>DUIT</strong><span>DESIGN · REDES SOCIAIS</span></div>`;
    return el;
  }
  function closing(month){
    const el=document.createElement('section');
    el.className='mr-page mr-closing';
    el.innerHTML=`<div class="mr-closing-top"><span>RELATÓRIO DE REDES SOCIAIS</span><span>${month}</span></div><div class="mr-closing-main"><div class="mr-closing-eyebrow">RELATÓRIO DESENVOLVIDO POR</div><div class="mr-closing-logo">DUIT<span>.</span></div><h2>Design? We DUIT.</h2><p>Design, estratégia e gestão de redes sociais.</p></div><div class="mr-contact-grid"><div><small>WEB</small><strong>www.duit.pt</strong></div><div><small>EMAIL</small><strong>geral@duit.pt</strong></div><div><small>INSTAGRAM</small><strong>@duit.pt</strong></div></div><div class="mr-closing-foot">DUIT · DESIGN & REDES SOCIAIS</div>`;
    return el;
  }
  function enhance(book){
    if(!book||book.dataset.dividers==='1') return;
    const pages=[...book.querySelectorAll(':scope > .mr-page')];
    if(!pages.length) return;
    book.dataset.dividers='1';
    const month=monthLabel(book);
    const firstIg=pages.find(p=>p.querySelector('.mr-network')?.textContent.includes('Instagram'));
    const firstFb=pages.find(p=>p.querySelector('.mr-network')?.textContent.includes('Facebook'));
    if(firstIg) firstIg.before(divider('Instagram',month));
    if(firstFb) firstFb.before(divider('Facebook',month));
    book.appendChild(closing(month));
    if(!document.getElementById('mr-divider-style')){
      const st=document.createElement('style');st.id='mr-divider-style';st.textContent=`.mr-divider,.mr-closing{background:#111!important;color:#fff!important;min-height:1120px;display:flex!important;flex-direction:column!important;padding:54px 58px!important;box-sizing:border-box}.mr-divider-top,.mr-closing-top{display:flex;justify-content:space-between;font-size:11px;letter-spacing:.18em;color:#aaa}.mr-divider-main{margin:auto 0}.mr-divider-icon{margin-bottom:34px}.mr-divider-kicker,.mr-closing-eyebrow{font-size:12px;letter-spacing:.2em;color:#aaa;margin-bottom:15px}.mr-divider h2{font-size:92px!important;line-height:.95!important;letter-spacing:-.06em!important;margin:0 0 22px!important;color:#fff!important}.mr-divider p,.mr-closing-main p{font-size:18px;line-height:1.5;color:#aaa;max-width:560px}.mr-divider-foot{display:flex;justify-content:space-between;align-items:end;border-top:1px solid #333;padding-top:22px}.mr-divider-foot strong{font-size:34px;letter-spacing:-.05em}.mr-divider-foot span{font-size:10px;letter-spacing:.18em;color:#888}.mr-closing-main{margin:auto 0 65px}.mr-closing-logo{font-size:104px;font-weight:900;letter-spacing:-.09em;line-height:.9}.mr-closing-logo span{color:#f2c400}.mr-closing h2{font-size:38px!important;color:#fff!important;margin:30px 0 8px!important}.mr-contact-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;border-top:1px solid #333;border-bottom:1px solid #333;padding:28px 0}.mr-contact-grid div{display:grid;gap:7px}.mr-contact-grid small{font-size:9px;letter-spacing:.18em;color:#777}.mr-contact-grid strong{font-size:15px;color:#fff}.mr-closing-foot{font-size:10px;letter-spacing:.18em;color:#777;margin-top:26px}@media print{.mr-divider,.mr-closing{break-before:page;break-after:page;page-break-before:always;page-break-after:always}}`;document.head.appendChild(st);
    }
  }
  const obs=new MutationObserver(()=>document.querySelectorAll('.mr-book').forEach(enhance));
  obs.observe(document.body,{childList:true,subtree:true});
  document.querySelectorAll('.mr-book').forEach(enhance);
})();
