/* DUIT — ações de Prospects: enviar email, tracking, duplicar e converter. */
(() => {
  const esc = v => typeof escapeHtml === 'function' ? escapeHtml(String(v ?? '')) : String(v ?? '');
  let rows = [];

  async function refresh() { try { rows = await api('/api/crm/prospects'); } catch (_) { rows = []; } return rows; }
  const byId = id => rows.find(p => Number(p.id) === Number(id));

  function emailState(p) {
    if (!p.email_sent_at) return '<span class="pill muted">⚪ Não enviado</span>';
    if (!p.email_first_opened_at) return `<span class="pill warn" title="Enviado ${fmtDateTime(p.email_sent_at)}">🟡 Enviado · por abrir</span>`;
    return `<span class="pill ok" title="1ª abertura ${fmtDateTime(p.email_first_opened_at)}${p.email_last_opened_at ? ' · última '+fmtDateTime(p.email_last_opened_at) : ''}">🟢 Visto${Number(p.email_open_count||0)>1?' · '+p.email_open_count+'x':''}</span>`;
  }

  function decorateTable() {
    document.querySelectorAll('tr[onclick*="openCrmProspect("]').forEach(tr => {
      const m=(tr.getAttribute('onclick')||'').match(/openCrmProspect\((\d+)\)/); if(!m)return;
      const p=byId(m[1]); if(!p)return;
      const first=tr.querySelector('td');
      if(first && !first.querySelector('.crm-email-track')) {
        const d=document.createElement('div'); d.className='crm-email-track'; d.style.marginTop='7px'; d.innerHTML=emailState(p); first.appendChild(d);
      }
      const actions=tr.querySelector('.crm-actions');
      if(actions && !actions.querySelector('[data-crm-dup]')) {
        const b=document.createElement('button'); b.className='btn btn-icon'; b.dataset.crmDup='1'; b.title='Duplicar prospect'; b.innerHTML='⧉'; b.onclick=e=>{e.stopPropagation();crmDuplicateProspect(p.id)}; actions.prepend(b);
      }
    });
  }

  function decorateModal(id) {
    const p=byId(id); if(!p)return;
    const form=document.getElementById('crmProspectForm'); if(!form)return;
    let stateBox=document.getElementById('crm-email-state-box');
    if(!stateBox){stateBox=document.createElement('div');stateBox.id='crm-email-state-box';stateBox.className='span-2';stateBox.style='padding:10px 12px;background:var(--bg-2);border-radius:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap';const grid=form.querySelector('.crm-modal-grid');grid?.appendChild(stateBox);}
    stateBox.innerHTML=`<strong style="font-size:12px">Estado do email:</strong> ${emailState(p)}`;
    const bar=form.querySelector('.modal-actions'); if(!bar)return;
    bar.querySelectorAll('[data-crm-extra]').forEach(x=>x.remove());
    const dup=document.createElement('button');dup.type='button';dup.className='btn btn-ghost';dup.dataset.crmExtra='1';dup.textContent='⧉ Duplicar';dup.onclick=()=>crmDuplicateProspect(p.id);bar.insertBefore(dup,bar.querySelector('.spacer')?.nextSibling||bar.firstChild);
    const send=document.createElement('button');send.type='button';send.className='btn btn-ghost';send.dataset.crmExtra='1';send.innerHTML='✉ Enviar email';send.onclick=()=>crmSendProspectEmail(p.id);bar.insertBefore(send,bar.lastElementChild);
    const conv=document.createElement('button');conv.type='button';conv.className='btn btn-yellow';conv.dataset.crmExtra='1';conv.innerHTML='✓ Converter em cliente';conv.onclick=()=>crmConvertProspect(p.id);bar.insertBefore(conv,bar.lastElementChild);
  }

  window.crmDuplicateProspect=function(id){
    const p=byId(id); if(!p)return toast('Prospect não encontrado.','cancel');
    closeCrmProspect?.(); openCrmProspect();
    setTimeout(()=>{
      const set=(id,v)=>{const e=document.getElementById(id);if(e)e.value=v??''};
      set('crm-company',p.company);set('crm-name',p.name);set('crm-email','');set('crm-phone',p.phone);set('crm-sector',p.sector);set('crm-location',p.location);set('crm-website',p.website);set('crm-instagram',p.instagram);set('crm-opportunity',p.opportunity);set('crm-idea',p.idea);set('crm-priority',p.priority||'possivel');set('crm-status','por_contactar');set('crm-plan',p.recommended_plan);set('crm-monthly',p.monthly_value);set('crm-offer',p.offer_value);set('crm-first-contact','');set('crm-followup','');set('crm-notes',p.notes);set('crm-proposal',p.proposal_email);
      const title=document.getElementById('crm-modal-title');if(title)title.textContent=`Duplicar · ${p.company||p.name}`;
      crmApplyPlan?.(false); document.getElementById('crm-email')?.focus();
    },50);
  };

  window.crmSendProspectEmail=async function(id){
    const p=byId(id); if(!p)return;
    const currentId=Number(document.getElementById('crm-id')?.value||0);
    const text=currentId===Number(id)?document.getElementById('crm-proposal')?.value:p.proposal_email;
    if(!text?.trim())return toast('O email está vazio.','cancel');
    if(!confirm(`Enviar agora o email comercial para ${p.email}?`))return;
    try{await api(`/api/crm/prospects/${id}/send-email`,{method:'POST',body:{text}});toast('Email enviado. O tracking ficou ativo.','check');closeCrmProspect?.();await refresh();if(typeof viewProspects==='function')await viewProspects(document.getElementById('main'));}
    catch(e){toast(e.message,'cancel');}
  };

  window.crmConvertProspect=async function(id){
    const p=byId(id); if(!p)return;
    if(!confirm(`Converter "${p.company||p.name}" em cliente?\n\nA conta será ativada e o cliente receberá as credenciais por email.`))return;
    try{await api(`/api/crm/prospects/${id}/convert`,{method:'POST'});toast('Prospect convertido em cliente.','check');closeCrmProspect?.();if(typeof refreshClients==='function')await refreshClients();go('clients');}
    catch(e){toast(e.message,'cancel');}
  };

  const originalView=window.viewProspects;
  if(typeof originalView==='function') window.viewProspects=async function(main){await originalView(main);await refresh();decorateTable();};
  const originalOpen=window.openCrmProspect;
  if(typeof originalOpen==='function') window.openCrmProspect=function(id=null){originalOpen(id);if(id){if(rows.length)decorateModal(id);else refresh().then(()=>decorateModal(id));}};

  refresh().then(()=>{ if(typeof state!=='undefined'&&state.view==='prospects')decorateTable(); });
})();
