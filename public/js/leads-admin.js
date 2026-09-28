/* DUIT — Leads inbound */
(() => {
  const safe=v=>escapeHtml(v==null?'':String(v));
  const dt=v=>v?new Date(String(v).replace(' ','T')+'Z').toLocaleString('pt-PT',{dateStyle:'short',timeStyle:'short'}):'—';
  const statusLabel={novo:'Novo',lido:'Lido',em_contacto:'Em contacto',convertido:'Convertido'};
  const typeLabel={formulario:'Formulário enviado',mensagem:'Mensagem enviada',resposta:'Resposta à proposta',contacto:'Contacto'};
  function emailState(l){
    if(!l.email_sent_at)return '—';
    if(!l.email_first_opened_at)return 'Enviado · abertura não detetada';
    return 'Email aberto · '+Number(l.email_open_count||0)+'x';
  }
  function proposalState(l){return Number(l.proposal_view_count||0)>0?'Proposta vista · '+Number(l.proposal_view_count)+'x':'Proposta por abrir'}
  window.viewLeads=async main=>{
    const leads=await api('/api/crm/leads');
    const novos=leads.filter(x=>x.lead_state==='novo').length;
    main.innerHTML=`<div class="page-head"><div><div class="eyebrow">Contactos recebidos</div><h1>Leads</h1><p class="lede">Pessoas que responderam ou enviaram um formulário/mensagem através das Landing Pages.</p></div></div>
    <div class="crm-kpis"><div class="crm-kpi"><div class="eyebrow">Leads</div><b>${leads.length}</b></div><div class="crm-kpi"><div class="eyebrow">Novos</div><b>${novos}</b></div></div>
    <div class="card table-card" style="overflow-x:auto">${!leads.length?'<div class="empty" style="padding:36px">Ainda não existem leads.</div>':`<table class="table"><thead><tr><th>Contacto</th><th>Origem</th><th>Ação</th><th>Mensagem / interesse</th><th>Tracking</th><th>Recebido</th><th>Estado</th></tr></thead><tbody>${leads.map(l=>`<tr class="${l.lead_state==='novo'?'lead-new':''}" onclick="duitReadLead(${l.user_id},this)"><td><strong>${safe(l.company||l.name)}</strong><div style="font-size:12px;color:var(--muted)">${safe(l.name||'')} · ${safe(l.email||'')}${l.phone?' · '+safe(l.phone):''}</div></td><td><strong>${safe(l.landing_page||'Direto')}</strong><div style="font-size:12px;color:var(--muted)">${safe(l.utm_source||l.source_type||'')}</div></td><td>${safe(typeLabel[l.lead_type]||l.lead_type)}</td><td style="max-width:320px">${safe(l.outreach_question||l.outreach_response_reason||l.notes||'—')}</td><td><div>${safe(emailState(l))}</div><div style="font-size:12px;color:var(--muted)">${safe(proposalState(l))}</div></td><td>${dt(l.lead_at||l.outreach_question_at||l.outreach_responded_at)}</td><td><select onclick="event.stopPropagation()" onchange="duitLeadStatus(${l.user_id},this.value)"><option value="novo" ${l.lead_state==='novo'?'selected':''}>Novo</option><option value="lido" ${l.lead_state==='lido'?'selected':''}>Lido</option><option value="em_contacto" ${l.lead_state==='em_contacto'?'selected':''}>Em contacto</option><option value="convertido" ${l.lead_state==='convertido'?'selected':''}>Convertido</option></select></td></tr>`).join('')}</tbody></table>`}</div>`;
  };
  window.duitReadLead=async(id,row)=>{await api('/api/crm/leads/'+id+'/read',{method:'POST'});row?.classList.remove('lead-new')};
  window.duitLeadStatus=async(id,status)=>{await api('/api/crm/leads/'+id,{method:'PATCH',body:JSON.stringify({status})});toast('Estado do lead atualizado.','ok')};
})();