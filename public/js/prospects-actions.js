/* DUIT — ações de Prospects: enviar email, tracking, resposta, duplicar e converter. */
(() => {
  let rows = [];
  async function refresh() {
    try {
      const [prospects,statuses] = await Promise.all([api('/api/crm/prospects'),api('/api/crm/prospects/email-status')]);
      const sm = new Map((statuses||[]).map(s=>[Number(s.user_id),s]));
      rows = (prospects||[]).map(p=>({...p,...(sm.get(Number(p.id))||{})}));
    } catch (_) { rows = []; }
    return rows;
  }
  const byId = id => rows.find(p => Number(p.id) === Number(id));

  function emailState(p) {
    if (!p.email_sent_at) return '<span class="pill muted">⚪ Não enviado</span>';
    if (!p.email_first_opened_at) return `<span class="pill warn" title="Enviado ${fmtDateTime(p.email_sent_at)}">🟡 Enviado · por abrir</span>`;
    return `<span class="pill ok" title="1ª abertura ${fmtDateTime(p.email_first_opened_at)}${p.email_last_opened_at ? ' · última '+fmtDateTime(p.email_last_opened_at) : ''}">🟢 Visto · ${Number(p.email_open_count||0)}x</span>`;
  }

  function responseState(p) {
    if (p.outreach_response === 'accepted') return `<span class="pill ok" title="Respondido ${p.outreach_responded_at ? fmtDateTime(p.outreach_responded_at) : ''}">✓ Aceitou</span>`;
    if (p.outreach_response === 'rejected') {
      const reason = String(p.outreach_response_reason || '').trim();
      return `<span class="pill err" title="${reason ? 'Motivo: '+escapeHtml(reason) : 'Sem motivo indicado'}">✕ Rejeitou</span>`;
    }
    if (p.email_sent_at) return '<span class="pill muted">Sem resposta</span>';
    return '';
  }

  function decorateTable() {
    document.querySelectorAll('tr[onclick*="openCrmProspect("]').forEach(tr => {
      const m=(tr.getAttribute('onclick')||'').match(/openCrmProspect\((\d+)\)/); if(!m)return; const p=byId(m[1]); if(!p)return;
      const first=tr.querySelector('td');
      if(first){
        let d=first.querySelector('.crm-email-track');
        if(!d){d=document.createElement('div');d.className='crm-email-track';d.style.cssText='margin-top:7px;display:flex;gap:6px;flex-wrap:wrap';first.appendChild(d)}
        d.innerHTML=emailState(p)+(responseState(p)?' '+responseState(p):'');
        if(p.outreach_response==='rejected' && p.outreach_response_reason){
          let r=first.querySelector('.crm-response-reason');
          if(!r){r=document.createElement('div');r.className='crm-response-reason';r.style.cssText='font-size:11px;color:var(--muted);margin-top:4px';first.appendChild(r)}
          r.textContent='Motivo: '+p.outreach_response_reason;
        } else first.querySelector('.crm-response-reason')?.remove();
      }
      const actions=tr.querySelector('.crm-actions'); if(actions&&!actions.querySelector('[data-crm-dup]')){const b=document.createElement('button');b.className='btn btn-icon';b.dataset.crmDup='1';b.title='Duplicar prospect';b.innerHTML='⧉';b.onclick=e=>{e.stopPropagation();crmDuplicateProspect(p.id)};actions.prepend(b);}
    });
  }

  function decorateModal(id) {
    const p=byId(id); if(!p)return; const form=document.getElementById('crmProspectForm');if(!form)return;
    let stateBox=document.getElementById('crm-email-state-box');
    if(!stateBox){stateBox=document.createElement('div');stateBox.id='crm-email-state-box';stateBox.className='span-2';stateBox.style='padding:10px 12px;background:var(--bg-2);border-radius:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap';form.querySelector('.crm-modal-grid')?.appendChild(stateBox)}
    stateBox.innerHTML=`<strong style="font-size:12px">Email:</strong> ${emailState(p)} ${responseState(p)}`;
    let responseBox=document.getElementById('crm-response-box');
    if(p.outreach_response){
      if(!responseBox){responseBox=document.createElement('div');responseBox.id='crm-response-box';responseBox.className='span-2';responseBox.style='padding:12px;background:var(--bg-2);border-radius:10px;font-size:13px;line-height:1.5';form.querySelector('.crm-modal-grid')?.appendChild(responseBox)}
      const label=p.outreach_response==='accepted'?'Aceitou a proposta':'Rejeitou a proposta';
      const reason=p.outreach_response_reason?`<div style="margin-top:6px"><strong>Motivo:</strong> ${escapeHtml(p.outreach_response_reason)}</div>`:'';
      const when=p.outreach_responded_at?`<div style="margin-top:4px;color:var(--muted);font-size:12px">Resposta em ${fmtDateTime(p.outreach_responded_at)}</div>`:'';
      responseBox.innerHTML=`<strong>${label}</strong>${reason}${when}`;
    } else responseBox?.remove();
    const bar=form.querySelector('.modal-actions');if(!bar)return;bar.querySelectorAll('[data-crm-extra]').forEach(x=>x.remove());
    const dup=document.createElement('button');dup.type='button';dup.className='btn btn-ghost';dup.dataset.crmExtra='1';dup.textContent='⧉ Duplicar';dup.onclick=()=>crmDuplicateProspect(p.id);bar.insertBefore(dup,bar.querySelector('.spacer')?.nextSibling||bar.firstChild);
    const send=document.createElement('button');send.type='button';send.className='btn btn-ghost';send.dataset.crmExtra='1';send.innerHTML='✉ Enviar email';send.onclick=()=>crmSendProspectEmail(p.id);bar.insertBefore(send,bar.lastElementChild);
    const conv=document.createElement('button');conv.type='button';conv.className='btn btn-yellow';conv.dataset.crmExtra='1';conv.innerHTML='✓ Converter em cliente';conv.onclick=()=>crmConvertProspect(p.id);bar.insertBefore(conv,bar.lastElementChild);
  }

  window.crmDuplicateProspect=function(id){const p=byId(id);if(!p)return toast('Prospect não encontrado.','cancel');closeCrmProspect?.();openCrmProspect();setTimeout(()=>{const set=(id,v)=>{const e=document.getElementById(id);if(e)e.value=v??''};set('crm-company',p.company);set('crm-name',p.name);set('crm-email','');set('crm-phone',p.phone);set('crm-sector',p.sector);set('crm-location',p.location);set('crm-website',p.website);set('crm-instagram',p.instagram);set('crm-opportunity',p.opportunity);set('crm-idea',p.idea);set('crm-priority',p.priority||'possivel');set('crm-status','por_contactar');set('crm-plan',p.recommended_plan);set('crm-monthly',p.monthly_value);set('crm-offer',p.offer_value);set('crm-first-contact','');set('crm-followup','');set('crm-notes',p.notes);set('crm-proposal',p.proposal_email);const title=document.getElementById('crm-modal-title');if(title)title.textContent=`Duplicar · ${p.company||p.name}`;crmApplyPlan?.(false);document.getElementById('crm-email')?.focus();},50)};

  window.crmSendProspectEmail=async function(id){
    const p=byId(id);if(!p)return;
    const currentId=Number(document.getElementById('crm-id')?.value||0);
    const editing=currentId===Number(id);
    const text=editing?document.getElementById('crm-proposal')?.value:p.proposal_email;
    const email=String(editing?document.getElementById('crm-email')?.value:p.email||'').trim();
    if(!email)return toast('Indique o email do prospect.','cancel');
    if(!text?.trim())return toast('O email está vazio.','cancel');
    if(!confirm(`Enviar agora o email comercial para ${email}?`))return;
    try{
      // Se o email foi alterado no modal, guarda primeiro o Prospect. Assim o envio e o tracking
      // ficam associados ao endereço que o utilizador está efetivamente a ver no formulário.
      if(editing && email!==String(p.email||'').trim()){
        const form=document.getElementById('crmProspectForm');
        if(form){
          const body={};
          new FormData(form).forEach((v,k)=>body[k]=v);
          body.email=email;
          await api(`/api/crm/prospects/${id}`,{method:'PUT',body});
          p.email=email;
        }
      }
      await api(`/api/crm/prospects/${id}/send-email`,{method:'POST',body:{text,email}});
      toast('Email enviado. O tracking ficou ativo.','check');closeCrmProspect?.();await refresh();if(typeof viewProspects==='function')await viewProspects(document.getElementById('main'));
    }catch(e){toast(e.message,'cancel')}
  };

  window.crmConvertProspect=async function(id){const p=byId(id);if(!p)return;if(!confirm(`Converter "${p.company||p.name}" em cliente?\n\nA conta será ativada e o cliente receberá as credenciais por email.`))return;try{await api(`/api/crm/prospects/${id}/convert`,{method:'POST'});toast('Prospect convertido em cliente.','check');closeCrmProspect?.();if(typeof refreshClients==='function')await refreshClients();go('clients');}catch(e){toast(e.message,'cancel')}};

  let decorateTimer=null;
  function queueDecorate(){clearTimeout(decorateTimer);decorateTimer=setTimeout(()=>{if(typeof state!=='undefined'&&state.view==='prospects')decorateTable();},25)}
  const main=document.getElementById('main');
  if(main)new MutationObserver(m=>{if(m.some(x=>x.type==='childList'&&(x.addedNodes.length||x.removedNodes.length)))queueDecorate()}).observe(main,{childList:true,subtree:true});
  const originalView=window.viewProspects;if(typeof originalView==='function')window.viewProspects=async function(main){await originalView(main);await refresh();decorateTable()};
  const originalOpen=window.openCrmProspect;if(typeof originalOpen==='function')window.openCrmProspect=function(id=null){originalOpen(id);if(id){if(rows.length)decorateModal(id);else refresh().then(()=>decorateModal(id))}};
  refresh().then(()=>{if(typeof state!=='undefined'&&state.view==='prospects')decorateTable()});
})();
