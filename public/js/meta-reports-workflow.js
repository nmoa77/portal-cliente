/* DUIT — fluxo final: gerar, agendar, arquivar, acompanhar e enviar relatórios Meta */
(() => {
  const months=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  let archiveFilter='all',archiveMonth='',archiveYear='',scheduleRows=[],scheduleLoaded=false,scheduleLoading=false;

  const dt=v=>v?new Date(String(v).replace(' ','T')+'Z').toLocaleString('pt-PT',{dateStyle:'short',timeStyle:'short'}):'—';
  function statusText(r){if(r.status==='error')return['Erro','err'];if(r.downloaded_at)return['Descarregado','ok'];if(r.viewed_at)return['Lido','ok'];if(r.sent_at||r.status==='sent')return['Enviado','accent'];if(r.status==='ready')return['Gerado','ok'];if(r.status==='collecting')return['A gerar','accent'];return['Pendente',''];}
  function match(r){if(archiveMonth&&Number(r.ref_month)!==Number(archiveMonth))return false;if(archiveYear&&Number(r.ref_year)!==Number(archiveYear))return false;if(archiveFilter==='generated')return r.status==='ready'&&!r.sent_at;if(archiveFilter==='sent')return !!r.sent_at&&!r.viewed_at;if(archiveFilter==='read')return !!r.viewed_at&&!r.downloaded_at;if(archiveFilter==='downloaded')return !!r.downloaded_at;if(archiveFilter==='error')return r.status==='error';return true;}

  async function renderArchive(){
    const host=document.getElementById('meta-report-archive');if(!host)return;let rows=[];
    try{rows=await api('/api/meta/reports/archive');}catch(e){host.innerHTML=`<div class="empty">Erro: ${e.message}</div>`;return;}
    const currentYear=new Date().getFullYear(),years=Array.from({length:Math.max(1,currentYear-2024+1)},(_,i)=>currentYear-i),shown=rows.filter(match);
    host.innerHTML=`<div class="section-head" style="margin-top:28px"><div><div class="eyebrow">Histórico</div><h2>Relatórios gerados</h2></div><span class="pill accent">${shown.length} de ${rows.length}</span></div><div class="card"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:18px"><select class="input" id="report-month-filter" style="width:auto"><option value="">Todos os meses</option>${months.map((m,i)=>`<option value="${i+1}" ${String(i+1)===String(archiveMonth)?'selected':''}>${m[0].toUpperCase()+m.slice(1)}</option>`).join('')}</select><select class="input" id="report-year-filter" style="width:auto"><option value="">Todos os anos</option>${years.map(y=>`<option value="${y}" ${String(y)===String(archiveYear)?'selected':''}>${y}</option>`).join('')}</select>${[['all','Todos'],['generated','Gerados'],['sent','Enviados'],['read','Lidos'],['downloaded','Descarregados'],['error','Erros']].map(([k,l])=>`<button class="btn btn-sm ${archiveFilter===k?'btn-yellow':'btn-ghost'}" data-report-filter="${k}">${l}</button>`).join('')}</div>${shown.length?`<div style="overflow:auto"><table class="table"><thead><tr><th>Cliente</th><th>Período</th><th>Estado</th><th>Gerado</th><th>Enviado</th><th>Lido</th><th>Descarregado</th><th>Ações</th></tr></thead><tbody>${shown.map(r=>{const [label,cls]=statusText(r);return `<tr><td><strong>${r.company||r.name||r.email}</strong></td><td>${months[r.ref_month-1]} ${r.ref_year}</td><td><span class="pill ${cls}">${label}</span></td><td>${dt(r.generated_at)}</td><td>${dt(r.sent_at)}</td><td>${dt(r.viewed_at)}</td><td>${dt(r.downloaded_at)}</td><td style="white-space:nowrap">${r.pdf_path?`<a class="btn btn-ghost btn-sm" href="/api/meta/reports/${r.id}/pdf">PDF</a>`:''}${r.pdf_path&&!r.sent_at?` <button class="btn btn-yellow btn-sm" data-send-report="${r.id}">Enviar</button>`:''} <button class="btn btn-ghost btn-sm" data-delete-report="${r.id}" data-delete-label="${r.company||r.name||''} · ${months[r.ref_month-1]} ${r.ref_year}" style="color:#b42318">Apagar</button></td></tr>`}).join('')}</tbody></table></div>`:'<div class="empty">Nenhum relatório para estes filtros.</div>'}</div>`;
  }

  async function send(b){b.disabled=true;try{await api(`/api/meta/reports/${b.dataset.sendReport}/send`,{method:'POST'});await renderArchive();toast?.('Relatório enviado.');}catch(e){b.disabled=false;toast?.(e.message,'cancel');}}
  async function del(b){if(!confirm(`Apagar definitivamente o relatório ${b.dataset.deleteLabel}?\n\nO PDF também será eliminado.`))return;b.disabled=true;try{await api(`/api/meta/reports/${b.dataset.deleteReport}`,{method:'DELETE'});await renderArchive();toast?.('Relatório apagado.');}catch(e){b.disabled=false;toast?.(e.message,'cancel');}}

  function progressBox(w){let e=w.querySelector('.meta-pdf-progress');if(e)return e;e=document.createElement('div');e.className='meta-pdf-progress';e.style.cssText='margin-top:10px;max-width:360px';e.innerHTML='<div style="display:flex;justify-content:space-between"><span>A gerar relatório</span><strong class="meta-pdf-progress-value">0%</strong></div><div style="height:7px;background:var(--line-2);border-radius:99px;overflow:hidden;margin-top:6px"><div class="meta-pdf-progress-bar" style="height:100%;width:0;background:var(--text);transition:width .28s"></div></div>';w.appendChild(e);return e;}
  async function run(b){const box=b.closest('.meta-manual-report'),m=box.querySelector('.meta-manual-month').value,y=box.querySelector('.meta-manual-year').value,w=box,p=progressBox(w);b.disabled=true;let x=3,t=setInterval(()=>{x=Math.min(96,x+(x<70?5:2));p.querySelector('.meta-pdf-progress-value').textContent=x+'%';p.querySelector('.meta-pdf-progress-bar').style.width=x+'%';b.textContent=`A gerar · ${x}%`},420);try{await api(`/api/meta/reports/${b.dataset.manualGenerate}/${y}/${m}/generate`,{method:'POST'});clearInterval(t);p.querySelector('.meta-pdf-progress-value').textContent='100%';p.querySelector('.meta-pdf-progress-bar').style.width='100%';b.textContent='Concluído · 100%';await renderArchive();setTimeout(()=>{b.disabled=false;b.textContent='Gerar relatório';p.style.display='none'},800);}catch(e){clearInterval(t);b.disabled=false;b.textContent='Gerar relatório';toast?.(e.message,'cancel');}}

  function scheduleFor(uid){return scheduleRows.find(s=>Number(s.user_id)===Number(uid));}
  async function loadSchedules(force=false){
    if(scheduleLoading||(!force&&scheduleLoaded))return;
    scheduleLoading=true;
    try{scheduleRows=await api('/api/meta/report-schedules');scheduleLoaded=true;}catch(_){scheduleRows=[];}
    finally{scheduleLoading=false;decorateScheduleState();}
  }
  function decorateScheduleState(){
    document.querySelectorAll('[data-meta-client-id]').forEach(row=>{
      const uid=Number(row.dataset.metaClientId),s=scheduleFor(uid),btn=row.querySelector('[data-report-schedule-client]'),pill=row.querySelector('.meta-schedule-pill');
      if(btn){btn.classList.toggle('btn-yellow',!!s?.enabled);btn.classList.toggle('btn-ghost',!s?.enabled);btn.title=s?.enabled?'Editar agendamento mensal':'Agendar relatórios mensais';}
      if(pill){pill.innerHTML=s?.enabled?`<span class="pill accent">Agendado · ${s.remaining_runs} ${Number(s.remaining_runs)===1?'mês':'meses'}</span>`:'';}
    });
  }
  function closeSchedulePanels(){document.querySelectorAll('.meta-schedule-panel').forEach(x=>x.remove());}
  function openSchedulePanel(btn){
    const row=btn.closest('[data-meta-client-id]'),uid=Number(btn.dataset.reportScheduleClient),s=scheduleFor(uid);closeSchedulePanels();
    const panel=document.createElement('div');panel.className='meta-schedule-panel card';panel.style.cssText='margin-top:10px;padding:16px;max-width:580px;border-left:4px solid #ffd60a';
    panel.innerHTML=`<div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start"><div><div class="eyebrow">Envio automático</div><strong style="display:block;font-size:16px;margin-top:3px">Dia 1 de cada mês</strong><div style="font-size:13px;color:var(--muted);margin-top:5px">Gera o relatório do mês anterior e envia-o automaticamente ao cliente.</div></div><button class="btn btn-ghost btn-sm" data-close-report-schedule>Fechar</button></div><div style="display:flex;gap:8px;align-items:end;flex-wrap:wrap;margin-top:14px"><div class="field" style="margin:0"><label>Duração</label><select class="input meta-schedule-duration" style="width:auto"><option value="3" ${Number(s?.remaining_runs)===3?'selected':''}>3 meses</option><option value="6" ${!s||Number(s?.remaining_runs)===6?'selected':''}>6 meses</option><option value="12" ${Number(s?.remaining_runs)===12?'selected':''}>12 meses</option><option value="18" ${Number(s?.remaining_runs)===18?'selected':''}>18 meses</option><option value="24" ${Number(s?.remaining_runs)===24?'selected':''}>24 meses</option></select></div><button class="btn btn-yellow btn-sm" data-save-report-schedule="${uid}">${s?.enabled?'Atualizar agendamento':'Ativar agendamento'}</button>${s?.enabled?`<button class="btn btn-ghost btn-sm" data-cancel-report-schedule="${uid}" style="color:#b42318">Cancelar agendamento</button>`:''}</div>`;
    row.appendChild(panel);
  }
  async function saveSchedule(b){const panel=b.closest('.meta-schedule-panel'),months=Number(panel.querySelector('.meta-schedule-duration').value||6);b.disabled=true;try{await api(`/api/meta/report-schedules/${b.dataset.saveReportSchedule}`,{method:'POST',body:{months}});await loadSchedules(true);closeSchedulePanels();toast?.(`Agendamento ativo durante ${months} meses.`);}catch(e){b.disabled=false;toast?.(e.message,'cancel');}}
  async function cancelSchedule(b){if(!confirm('Cancelar o envio automático mensal deste cliente?'))return;b.disabled=true;try{await api(`/api/meta/report-schedules/${b.dataset.cancelReportSchedule}`,{method:'DELETE'});await loadSchedules(true);closeSchedulePanels();toast?.('Agendamento cancelado.');}catch(e){b.disabled=false;toast?.(e.message,'cancel');}}

  function enhance(){
    document.querySelectorAll('[data-collect]').forEach(base=>{
      const uid=base.dataset.collect,row=base.closest('[style*="border-bottom"]')||base.parentElement?.parentElement;if(!uid||!row)return;
      row.dataset.metaClientId=uid;base.remove();if(row.querySelector('.meta-manual-report'))return;
      const box=document.createElement('div');box.className='meta-manual-report';box.style.cssText='display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px';
      const now=new Date(),dm=now.getMonth()||12,dy=now.getMonth()?now.getFullYear():now.getFullYear()-1;
      box.innerHTML=`<span class="meta-schedule-pill"></span><button class="btn btn-ghost btn-sm" data-report-schedule-client="${uid}" title="Agendar relatórios mensais" style="min-width:38px;padding-left:9px;padding-right:9px">${typeof svg==='function'?svg('cal'):'◷'}</button><select class="input meta-manual-month" style="width:auto">${months.map((m,i)=>`<option value="${i+1}" ${i+1===dm?'selected':''}>${m[0].toUpperCase()+m.slice(1)}</option>`).join('')}</select><select class="input meta-manual-year" style="width:auto">${Array.from({length:Math.max(1,dy-2024+1)},(_,i)=>dy-i).map(y=>`<option>${y}</option>`).join('')}</select><button class="btn btn-yellow btn-sm" data-manual-generate="${uid}">Gerar relatório</button>`;
      row.appendChild(box);
    });
    const main=document.getElementById('main');if(main&&/Relatórios Meta/i.test(main.textContent||'')&&!document.getElementById('meta-report-archive')){const a=document.createElement('div');a.id='meta-report-archive';main.appendChild(a);renderArchive();}
    loadSchedules();decorateScheduleState();
  }

  document.addEventListener('change',e=>{if(e.target.id==='report-month-filter'){archiveMonth=e.target.value;renderArchive()}if(e.target.id==='report-year-filter'){archiveYear=e.target.value;renderArchive()}});
  document.addEventListener('click',e=>{
    const b=e.target.closest?.('[data-manual-generate]');if(b){e.preventDefault();run(b);return;}
    const sc=e.target.closest?.('[data-report-schedule-client]');if(sc){e.preventDefault();openSchedulePanel(sc);return;}
    const ss=e.target.closest?.('[data-save-report-schedule]');if(ss){e.preventDefault();saveSchedule(ss);return;}
    const cs=e.target.closest?.('[data-cancel-report-schedule]');if(cs){e.preventDefault();cancelSchedule(cs);return;}
    if(e.target.closest?.('[data-close-report-schedule]')){e.preventDefault();closeSchedulePanels();return;}
    const s=e.target.closest?.('[data-send-report]');if(s){e.preventDefault();send(s);return;}
    const d=e.target.closest?.('[data-delete-report]');if(d){e.preventDefault();del(d);return;}
    const f=e.target.closest?.('[data-report-filter]');if(f){archiveFilter=f.dataset.reportFilter;renderArchive();}
  },true);

  new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true});enhance();
})();
