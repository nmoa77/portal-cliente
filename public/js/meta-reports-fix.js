/* DUIT — correções visuais seguras dos relatórios Meta (sem tocar na recolha de dados) */
(() => {
  const igSmall=`<svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>`;
  const igBig=`<svg viewBox="0 0 24 24" width="58" height="58" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>`;
  const logo=(cls='mr-duit-logo')=>`<img class="${cls}" src="/logo-branco.png" alt="DUIT">`;
  const parseNum=t=>Number(String(t||'0').replace(/\./g,'').replace(',','.'))||0;
  function numFrom(text,re){const m=(text||'').match(re);return m?parseNum(m[1]):0;}

  function recommendationsFromPage(page){
    const txt=page.textContent||'';
    const views=numFrom(txt,/(\d[\d\.]*)\s+visualiza[cç][oõ]es/i),reach=numFrom(txt,/(\d[\d\.]*)\s+contas/i),interactions=numFrom(txt,/(\d[\d\.]*)\s+intera[cç][oõ]es/i);
    const fbReactions=numFrom(txt,/(\d+)\s+rea[cç][oõ]es/i),fbComments=numFrom(txt,/(\d+)\s+coment[aá]rios?/i),fbShares=numFrom(txt,/(\d+)\s+partilhas?/i);
    const rate=views?((interactions/views)*100):0,rec=[];
    if(views&&interactions&&rate<2)rec.push(['Aumentar a taxa de interação',`O Instagram gerou ${views.toLocaleString('pt-PT')} visualizações, mas apenas ${interactions.toLocaleString('pt-PT')} interações. No próximo mês, o objetivo deve ser transformar mais visualizações em ações através de CTAs mais claros e conteúdos que incentivem resposta, partilha e guardado.`]);
    if(reach)rec.push(['Aproveitar melhor o alcance',`Foram alcançadas ${reach.toLocaleString('pt-PT')} contas. Devemos manter os formatos que estão a gerar visibilidade e testar novas abordagens dentro dos mesmos temas para aumentar a frequência de interação sem perder alcance.`]);
    rec.push(['Criar mais conversa','Introduzir perguntas diretas, escolhas, opiniões e pequenos desafios nas legendas pode ajudar a gerar mais comentários e participação real.']);
    rec.push(['Aumentar partilhas e guardados','Conteúdos úteis e fáceis de consultar — exercícios, dicas, erros comuns, listas rápidas e pequenas rotinas — têm maior probabilidade de ser guardados e partilhados.']);
    if(fbReactions+fbComments+fbShares<10)rec.push(['Reforçar o Facebook',`O Facebook apresentou ${fbReactions} reações, ${fbComments} comentário${fbComments===1?'':'s'} e ${fbShares} partilha${fbShares===1?'':'s'}. Vale adaptar melhor o texto e o início das publicações ao comportamento desta rede para aumentar a participação.`]);
    return rec.slice(0,5);
  }

  function fixBranding(book){
    book.querySelectorAll('.mr-network').forEach(net=>{if(net.textContent.toLowerCase().includes('instagram')){let b=net.querySelector('b');if(!b){b=document.createElement('b');net.prepend(b);}if(!b.querySelector('svg'))b.innerHTML=igSmall;}});
    book.querySelectorAll('.mr-divider').forEach(page=>{const title=page.querySelector('h2')?.textContent.trim(),icon=page.querySelector('.mr-divider-icon');if(title==='Instagram'&&icon&&!icon.querySelector('svg'))icon.innerHTML=igBig;if(title==='Facebook'&&icon&&!icon.querySelector('.mr-fb-icon'))icon.innerHTML='<span class="mr-fb-icon" aria-hidden="true">f</span>';const foot=page.querySelector('.mr-divider-foot');if(foot&&!foot.querySelector('.mr-duit-logo-divider')){const strong=foot.querySelector('strong');if(strong)strong.outerHTML=logo('mr-duit-logo mr-duit-logo-divider');}});
    book.querySelectorAll('.mr-closing').forEach(page=>{const old=page.querySelector('.mr-closing-logo');if(old&&!old.querySelector('.mr-duit-logo-closing'))old.innerHTML=logo('mr-duit-logo mr-duit-logo-closing');});
  }

  function compositionValues(page,labels){const out={};page.querySelectorAll('.mr-kpi').forEach(k=>{const label=k.querySelector('span')?.textContent.trim().toLowerCase();if(label)out[label]=parseNum(k.querySelector('strong')?.textContent);});return labels.map(l=>out[l.toLowerCase()]||0);}
  function updateComposition(page,vals){const max=Math.max(1,...vals);page.querySelectorAll('.mr-activity-row').forEach((row,idx)=>{const value=vals[idx]??0,strong=row.querySelector('.mr-activity-head strong'),next=Number(value).toLocaleString('pt-PT'),fill=row.querySelector('.mr-activity-fill'),width=value?`${Math.max(4,(value/max)*100)}%`:'0%';if(strong&&strong.textContent!==next)strong.textContent=next;if(fill&&fill.style.width!==width)fill.style.width=width;});}
  function fixInstagramComposition(book){const page=[...book.querySelectorAll('.mr-page')].find(p=>p.querySelector('.mr-network')?.textContent.includes('Instagram')&&p.querySelector('h2')?.textContent.trim()==='Interação');if(page)updateComposition(page,compositionValues(page,['Gostos','Comentários','Partilhas','Guardados']));}

  function addFacebookComposition(book){
    const page=[...book.querySelectorAll('.mr-page')].find(p=>p.querySelector('.mr-network')?.textContent.includes('Facebook')&&p.querySelector('h2')?.textContent.trim()==='Interação');
    if(!page||page.dataset.fbComposition==='1')return;
    const vals=compositionValues(page,['Reações','Comentários','Partilhas','Interações']);
    const labels=['Reações','Comentários','Partilhas'];
    const values=vals.slice(0,3),max=Math.max(1,...values);
    const month=page.querySelector('.mr-brand')?.textContent.trim()||'';
    const fbHead=page.querySelector('.mr-network')?.outerHTML||'<div class="mr-network"><b>f</b> Facebook</div>';
    const extra=document.createElement('section');extra.className='mr-page mr-facebook-composition';
    extra.innerHTML=`<div class="mr-head"><div>${fbHead}<h2>Interação</h2></div><div class="mr-brand">${month}</div></div><div class="mr-hero"><div><div class="mr-big-label">Interações</div><div class="mr-big">${Number(vals[3]||values.reduce((a,v)=>a+v,0)).toLocaleString('pt-PT')}</div><p class="mr-note">Interações confirmadas nas publicações de Facebook recolhidas pela Meta.</p></div><div class="mr-kpis"><div class="mr-kpi"><strong>${values[0].toLocaleString('pt-PT')}</strong><span>Reações</span></div><div class="mr-kpi"><strong>${values[1].toLocaleString('pt-PT')}</strong><span>Comentários</span></div><div class="mr-kpi"><strong>${values[2].toLocaleString('pt-PT')}</strong><span>Partilhas</span></div><div class="mr-kpi"><strong>${(vals[3]||values.reduce((a,v)=>a+v,0)).toLocaleString('pt-PT')}</strong><span>Interações</span></div></div></div><div class="mr-section"><h3>Composição da interação</h3><div class="mr-activity">${labels.map((label,i)=>`<div class="mr-activity-row"><div class="mr-activity-head"><span>${label}</span><strong>${values[i].toLocaleString('pt-PT')}</strong></div><div class="mr-activity-track"><div class="mr-activity-fill" style="width:${values[i]?Math.max(4,(values[i]/max)*100):0}%"></div></div></div>`).join('')}</div><p class="mr-note">Distribuição das interações registadas. Esta visualização compara tipos de interação e não representa evolução ao longo dos dias.</p></div><div class="mr-footer"><span>Facebook</span><span>DUIT</span></div>`;
    page.dataset.fbComposition='1';page.insertAdjacentElement('afterend',extra);
  }

  function fixOldConclusion(book){const pages=[...book.querySelectorAll('.mr-page')],page=pages.find(p=>/Durante\s+\w+\s+foram\s+publicados/i.test(p.textContent||''));if(!page||page.dataset.safeConclusion==='1')return;const rec=recommendationsFromPage(page);page.dataset.safeConclusion='1';page.innerHTML=`<div class="mr-head"><div><div class="mr-brand">Conclusão</div><h2>O que melhorar no próximo mês</h2></div></div><div class="mr-recommendations">${rec.map((r,i)=>`<div class="mr-rec"><div class="mr-rec-n">0${i+1}</div><div><h3>${r[0]}</h3><p>${r[1]}</p></div></div>`).join('')}</div><div class="mr-footer"><span>RELATÓRIO EFETUADO POR @DUIT</span><span>DUIT</span></div>`;}

  function ensureStyle(){if(document.getElementById('mr-safe-fix-style'))return;const s=document.createElement('style');s.id='mr-safe-fix-style';s.textContent=`.mr-duit-logo{display:block;object-fit:contain;object-position:left center}.mr-duit-logo-divider{width:128px;max-height:48px}.mr-duit-logo-closing{width:300px;max-width:42vw;max-height:130px}.mr-divider-icon svg,.mr-network b svg{display:block}.mr-fb-icon{width:58px;height:58px;border-radius:50%;background:#fff;color:#111;display:flex;align-items:center;justify-content:center;font:700 48px/1 Arial,sans-serif;padding-top:7px;box-sizing:border-box}.mr-recommendations{display:grid;gap:0;margin-top:8px}.mr-rec{display:grid;grid-template-columns:54px 1fr;gap:18px;padding:22px 0;border-bottom:1px solid #e7e7e2}.mr-rec-n{font-size:22px;color:#aaa}.mr-rec h3{font-size:22px!important;margin:0 0 8px!important}.mr-rec p{font-size:16px;line-height:1.55;color:#575752;margin:0;max-width:820px}`;document.head.appendChild(s);}
  function apply(){ensureStyle();document.querySelectorAll('.mr-book').forEach(book=>{fixBranding(book);fixInstagramComposition(book);addFacebookComposition(book);fixOldConclusion(book);});}
  let scheduled=false;const obs=new MutationObserver(()=>{if(scheduled)return;scheduled=true;setTimeout(()=>{scheduled=false;apply();},60);});obs.observe(document.body,{childList:true,subtree:true});apply();
})();
