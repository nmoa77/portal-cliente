/* =========================================================================
   DUIT — Prospeção Comercial
   Substitui a vista antiga de Prospects por um CRM simples e direto.
   ========================================================================= */

(() => {
  const PLANS = {
    base: {
      label: 'Base', price: 150, offer: 75,
      items: [
        '2 publicações por semana',
        'Design + copy',
        'Planeamento mensal',
        'Agendamento e publicação',
        'Instagram + Facebook',
        'Consultoria básica de perfil',
        'Relatório mensal simples',
      ],
    },
    intermedio: {
      label: 'Intermédio', price: 200, offer: 100,
      items: [
        '3 publicações por semana',
        'Até 6 stories por semana',
        'Planeamento e gestão de destaques',
        'Design + copy',
        'Agendamento e publicação',
        'Análise mensal com sugestões',
      ],
    },
    premium: {
      label: 'Premium', price: 280, offer: 140,
      items: [
        '4 a 5 publicações por semana',
        'Stories de segunda a sexta — até 15/semana',
        'Edição simples de reels',
        'Criação de campanhas e promoções',
        'Gestão de mensagens/comentários (a definir)',
        'Análises quinzenais',
      ],
    },
  };

  const STATUS = {
    por_contactar: ['Por contactar', 'muted'],
    contactado: ['Contactado', 'accent'],
    respondeu: ['Respondeu', 'warn'],
    interessado: ['Interessado', 'ok'],
    proposta: ['Proposta', 'accent'],
    sem_resposta: ['Sem resposta', 'muted'],
    sem_interesse: ['Sem interesse', 'err'],
  };

  const PRIORITY = {
    atacar: ['🔥 Atacar', 'ok'],
    possivel: ['🟡 Possível', 'warn'],
    nao_prioritario: ['Não prioritário', 'muted'],
  };

  let crmProspects = [];
  let crmFilter = { q: '', status: 'all', priority: 'all' };

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function money(n) {
    return `${Number(n || 0).toFixed(0)}€`;
  }

  function safe(v) {
    return escapeHtml(v == null ? '' : String(v));
  }

  function planFromValues(monthly) {
    const n = Number(monthly || 0);
    if (n === 150) return 'base';
    if (n === 200) return 'intermedio';
    if (n === 280) return 'premium';
    return '';
  }

  function getPlan(p) {
    const key = p.recommended_plan || planFromValues(p.monthly_value);
    return PLANS[key] || null;
  }

  function defaultIntro(p) {
    const company = p.company || p.name || 'a sua empresa';
    const opp = (p.opportunity || '').trim();
    if (opp) {
      return `Estivemos a ver a comunicação da ${company} e acreditamos que ${opp.charAt(0).toLowerCase()}${opp.slice(1).replace(/[.]$/, '')}.`;
    }
    return `Estivemos a ver a comunicação da ${company} e acreditamos que há espaço para aproveitar melhor as redes sociais e manter a marca mais presente junto do seu público.`;
  }

  function buildProposal(p) {
    const company = p.company || p.name || 'a sua empresa';
    const plan = getPlan(p);
    const monthly = Number(p.monthly_value || plan?.price || 0);
    const offer = Number(p.offer_value || plan?.offer || 0);
    const items = plan?.items || (p.solution_text ? p.solution_text.split(';').map(s => s.trim()).filter(Boolean) : []);
    const subject = `${company} — 15 dias por nossa conta`;
    const lines = items.length ? items.map(i => `✓ ${i}`).join('\n') : '✓ Gestão de redes sociais adaptada ao negócio';

    return `Assunto: ${subject}\n\nOlá,\n\n${defaultIntro(p)}\n\nSabemos que nem sempre há tempo para pensar no que publicar. É aí que podemos ajudar.\n\nA nossa proposta para a ${company} é:\n\n${lines}\n\n${money(monthly)}/mês\n\nE para começar, os primeiros 15 dias são por nossa conta.\nPOUPA ${money(offer)}\n\nQuer avançar? Responda a este email e tratamos do resto.\n\nNuno | DUIT\nDesign? We DUIT.`;
  }

  function statusPill(status) {
    const [label, cls] = STATUS[status] || [status || '—', 'muted'];
    return `<span class="pill ${cls}">${safe(label)}</span>`;
  }

  function priorityPill(priority) {
    const [label, cls] = PRIORITY[priority] || [priority || '—', 'muted'];
    return `<span class="pill ${cls}">${safe(label)}</span>`;
  }

  function installStyles() {
    if (document.getElementById('crm-prospect-styles')) return;
    const style = document.createElement('style');
    style.id = 'crm-prospect-styles';
    style.textContent = `
      .crm-toolbar{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 14px}
      .crm-toolbar input,.crm-toolbar select{min-height:40px}
      .crm-toolbar .crm-search{flex:1;min-width:220px}
      .crm-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:16px}
      .crm-kpi{padding:16px;border:1px solid var(--line);border-radius:14px;background:var(--card)}
      .crm-kpi b{font-family:'Clash Display';font-size:26px;display:block;margin-top:4px}
      .crm-actions{display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap}
      .crm-contact-links{display:flex;gap:8px;flex-wrap:wrap;margin-top:5px;font-size:12px}
      .crm-contact-links a{color:var(--ink);text-decoration:underline;text-underline-offset:2px}
      .crm-modal-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      .crm-modal-grid .span-2{grid-column:1/-1}
      .crm-proposal-box{background:var(--bg-2);border:1px solid var(--line);border-radius:12px;padding:12px}
      .crm-proposal-box textarea{min-height:360px;font-family:inherit;font-size:13px;line-height:1.55}
      .crm-plan-preview{font-size:12px;color:var(--muted);padding:8px 10px;background:var(--bg-2);border-radius:8px;margin-top:6px}
      @media(max-width:900px){.crm-kpis{grid-template-columns:1fr 1fr}.crm-modal-grid{grid-template-columns:1fr}.crm-modal-grid .span-2{grid-column:auto}}
      @media(max-width:560px){.crm-kpis{grid-template-columns:1fr}.crm-actions{justify-content:flex-start}}
    `;
    document.head.appendChild(style);
  }

  function ensureModal() {
    if (document.getElementById('modal-crm-prospect')) return;
    const wrap = document.createElement('div');
    wrap.className = 'overlay';
    wrap.id = 'modal-crm-prospect';
    wrap.innerHTML = `
      <div class="modal wide" style="max-width:980px;">
        <div style="display:flex;justify-content:space-between;align-items:start;gap:10px">
          <div>
            <h3 id="crm-modal-title">Novo prospect</h3>
            <p class="lede">Tudo o que precisamos para decidir, abordar e acompanhar este potencial cliente.</p>
          </div>
          <button type="button" class="btn btn-icon" onclick="closeCrmProspect()">✕</button>
        </div>
        <form id="crmProspectForm">
          <input type="hidden" id="crm-id">
          <div class="crm-modal-grid">
            <div class="field"><label>Empresa *</label><input id="crm-company" required></div>
            <div class="field"><label>Nome / contacto</label><input id="crm-name"></div>
            <div class="field"><label>Email *</label><input id="crm-email" type="email" required></div>
            <div class="field"><label>Telefone</label><input id="crm-phone"></div>
            <div class="field"><label>Setor</label><input id="crm-sector" placeholder="Ex: Fisioterapia"></div>
            <div class="field"><label>Localidade</label><input id="crm-location" placeholder="Ex: Odivelas"></div>
            <div class="field"><label>Website</label><input id="crm-website" placeholder="https://..."></div>
            <div class="field"><label>Instagram</label><input id="crm-instagram" placeholder="https://instagram.com/..."></div>
            <div class="field span-2"><label>Problema / oportunidade</label><textarea id="crm-opportunity" rows="3"></textarea></div>
            <div class="field span-2"><label>Ideia / ângulo comercial</label><textarea id="crm-idea" rows="3"></textarea></div>
            <div class="field"><label>Prioridade</label>
              <select id="crm-priority">
                <option value="atacar">🔥 Atacar</option>
                <option value="possivel" selected>🟡 Possível</option>
                <option value="nao_prioritario">Não prioritário</option>
              </select>
            </div>
            <div class="field"><label>Estado</label>
              <select id="crm-status">
                ${Object.entries(STATUS).map(([k,v]) => `<option value="${k}">${v[0]}</option>`).join('')}
              </select>
            </div>
            <div class="field"><label>Solução recomendada</label>
              <select id="crm-plan" onchange="crmApplyPlan()">
                <option value="">— definir —</option>
                <option value="base">Base — 150€/mês</option>
                <option value="intermedio">Intermédio — 200€/mês</option>
                <option value="premium">Premium — 280€/mês</option>
                <option value="personalizado">Personalizado</option>
              </select>
              <div id="crm-plan-preview" class="crm-plan-preview" style="display:none"></div>
            </div>
            <div class="field"><label>Valor mensal</label><input id="crm-monthly" type="number" min="0" step="1"></div>
            <div class="field"><label>Oferta 15 dias</label><input id="crm-offer" type="number" min="0" step="1"></div>
            <div class="field"><label>1.º contacto</label><input id="crm-first-contact" type="date"></div>
            <div class="field"><label>Follow-up</label><input id="crm-followup" type="date"></div>
            <div class="field span-2"><label>Notas</label><textarea id="crm-notes" rows="3"></textarea></div>
            <div class="field span-2">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:6px">
                <label style="margin:0">Email-proposta</label>
                <div style="display:flex;gap:6px">
                  <button type="button" class="btn btn-ghost btn-sm" onclick="crmGenerateProposal()">Gerar proposta</button>
                  <button type="button" class="btn btn-ghost btn-sm" onclick="crmCopyProposal()">Copiar email</button>
                </div>
              </div>
              <div class="crm-proposal-box"><textarea id="crm-proposal"></textarea></div>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-danger" id="crm-delete" style="display:none" onclick="crmDeleteCurrent()">Apagar</button>
            <div class="spacer"></div>
            <button type="button" class="btn btn-ghost" onclick="closeCrmProspect()">Cancelar</button>
            <button type="submit" class="btn btn-yellow">Guardar prospect</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('click', e => { if (e.target === wrap) closeCrmProspect(); });
    document.getElementById('crmProspectForm').addEventListener('submit', saveCrmProspect);
  }

  async function loadProspects() {
    crmProspects = await api('/api/crm/prospects');
    return crmProspects;
  }

  function filteredProspects() {
    const q = crmFilter.q.trim().toLowerCase();
    return crmProspects.filter(p => {
      if (crmFilter.status !== 'all' && p.lead_status !== crmFilter.status) return false;
      if (crmFilter.priority !== 'all' && p.priority !== crmFilter.priority) return false;
      if (!q) return true;
      return [p.company,p.name,p.email,p.phone,p.sector,p.location,p.opportunity,p.idea]
        .filter(Boolean).join(' ').toLowerCase().includes(q);
    });
  }

  function renderCrmTable(main) {
    const list = filteredProspects();
    const totalPotential = list.reduce((sum,p) => sum + Number(p.monthly_value || 0), 0);
    const atacar = list.filter(p => p.priority === 'atacar').length;
    const ativos = list.filter(p => ['respondeu','interessado','proposta'].includes(p.lead_status)).length;

    main.innerHTML = `
      <div class="page-head">
        <div>
          <div class="eyebrow">Pipeline comercial</div>
          <h1>Prospecção</h1>
          <p class="lede">Encontre o cliente certo, defina a proposta certa e acompanhe tudo sem perder tempo.</p>
        </div>
        <div class="page-head-actions">
          <button class="btn btn-yellow" onclick="openCrmProspect()">${svg('plus')} Novo prospect</button>
        </div>
      </div>

      <div class="crm-kpis">
        <div class="crm-kpi"><div class="eyebrow">Prospects</div><b>${list.length}</b></div>
        <div class="crm-kpi"><div class="eyebrow">🔥 A atacar</div><b>${atacar}</b></div>
        <div class="crm-kpi"><div class="eyebrow">Em conversa</div><b>${ativos}</b></div>
        <div class="crm-kpi"><div class="eyebrow">Valor potencial / mês</div><b>${fmtMoney(totalPotential)}</b></div>
      </div>

      <div class="crm-toolbar">
        <input class="crm-search" id="crm-search" placeholder="Pesquisar empresa, setor, localidade..." value="${safe(crmFilter.q)}" oninput="crmSetFilter('q',this.value)">
        <select onchange="crmSetFilter('priority',this.value)">
          <option value="all" ${crmFilter.priority==='all'?'selected':''}>Todas as prioridades</option>
          <option value="atacar" ${crmFilter.priority==='atacar'?'selected':''}>🔥 Atacar</option>
          <option value="possivel" ${crmFilter.priority==='possivel'?'selected':''}>🟡 Possível</option>
          <option value="nao_prioritario" ${crmFilter.priority==='nao_prioritario'?'selected':''}>Não prioritário</option>
        </select>
        <select onchange="crmSetFilter('status',this.value)">
          <option value="all" ${crmFilter.status==='all'?'selected':''}>Todos os estados</option>
          ${Object.entries(STATUS).map(([k,v]) => `<option value="${k}" ${crmFilter.status===k?'selected':''}>${v[0]}</option>`).join('')}
        </select>
      </div>

      <div class="card table-card" style="overflow-x:auto">
        ${list.length === 0 ? `<div class="empty" style="padding:36px 0">Nenhum prospect com estes filtros.</div>` : `
          <table class="table">
            <thead><tr><th>Empresa</th><th>Setor</th><th>Potencial</th><th>Estado</th><th>Solução</th><th>Valor</th><th>Follow-up</th><th></th></tr></thead>
            <tbody>${list.map(p => {
              const plan = getPlan(p);
              return `<tr class="interactive" onclick="openCrmProspect(${p.id})">
                <td>
                  <div style="font-weight:600">${safe(p.company || p.name)}</div>
                  <div style="font-size:12px;color:var(--muted)">${safe(p.email || '')}${p.phone ? ' · '+safe(p.phone) : ''}</div>
                  <div class="crm-contact-links">
                    ${p.website ? `<a href="${safe(p.website)}" target="_blank" onclick="event.stopPropagation()">Website</a>` : ''}
                    ${p.instagram ? `<a href="${safe(p.instagram)}" target="_blank" onclick="event.stopPropagation()">Instagram</a>` : ''}
                  </div>
                </td>
                <td>${safe(p.sector || '—')}<div style="font-size:12px;color:var(--muted)">${safe(p.location || '')}</div></td>
                <td>${priorityPill(p.priority)}</td>
                <td>${statusPill(p.lead_status)}</td>
                <td>${safe(plan?.label || p.recommended_plan || '—')}</td>
                <td><strong>${p.monthly_value ? fmtMoney(p.monthly_value) : '—'}</strong></td>
                <td>${p.follow_up_at ? fmtDate(p.follow_up_at) : '—'}</td>
                <td><div class="crm-actions">
                  ${p.lead_status === 'por_contactar' ? `<button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();crmMarkContacted(${p.id})">Contactei</button>` : ''}
                  <button class="btn btn-icon" title="Abrir" onclick="event.stopPropagation();openCrmProspect(${p.id})">${svg('edit')}</button>
                </div></td>
              </tr>`;
            }).join('')}</tbody>
          </table>`}
      </div>`;
  }

  window.viewProspects = async function crmViewProspects(main) {
    installStyles();
    ensureModal();
    try {
      await loadProspects();
      renderCrmTable(main);
    } catch (e) {
      main.innerHTML = `<div class="empty">Erro: ${safe(e.message)}</div>`;
    }
  };

  window.crmSetFilter = function(key, value) {
    crmFilter[key] = value;
    renderCrmTable(document.getElementById('main'));
    if (key === 'q') {
      const el = document.getElementById('crm-search');
      if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
    }
  };

  window.openCrmProspect = function(id = null) {
    installStyles();
    ensureModal();
    const p = id ? crmProspects.find(x => Number(x.id) === Number(id)) : null;
    document.getElementById('crm-modal-title').textContent = p ? `Editar · ${p.company || p.name}` : 'Novo prospect';
    document.getElementById('crm-id').value = p?.id || '';
    document.getElementById('crm-company').value = p?.company || '';
    document.getElementById('crm-name').value = p?.name || '';
    document.getElementById('crm-email').value = p?.email || '';
    document.getElementById('crm-phone').value = p?.phone || '';
    document.getElementById('crm-sector').value = p?.sector || '';
    document.getElementById('crm-location').value = p?.location || '';
    document.getElementById('crm-website').value = p?.website || '';
    document.getElementById('crm-instagram').value = p?.instagram || '';
    document.getElementById('crm-opportunity').value = p?.opportunity || '';
    document.getElementById('crm-idea').value = p?.idea || '';
    document.getElementById('crm-priority').value = p?.priority || 'possivel';
    document.getElementById('crm-status').value = p?.lead_status || 'por_contactar';
    document.getElementById('crm-plan').value = p?.recommended_plan || planFromValues(p?.monthly_value) || '';
    document.getElementById('crm-monthly').value = p?.monthly_value || '';
    document.getElementById('crm-offer').value = p?.offer_value || '';
    document.getElementById('crm-first-contact').value = p?.first_contact_at ? String(p.first_contact_at).slice(0,10) : '';
    document.getElementById('crm-followup').value = p?.follow_up_at ? String(p.follow_up_at).slice(0,10) : '';
    document.getElementById('crm-notes').value = p?.notes || '';
    document.getElementById('crm-proposal').value = p?.proposal_email || (p ? buildProposal(p) : '');
    document.getElementById('crm-delete').style.display = p ? '' : 'none';
    crmApplyPlan(false);
    document.getElementById('modal-crm-prospect').classList.add('show');
  };

  window.closeCrmProspect = function() {
    document.getElementById('modal-crm-prospect')?.classList.remove('show');
  };

  window.crmApplyPlan = function(updateValues = true) {
    const key = document.getElementById('crm-plan')?.value;
    const plan = PLANS[key];
    const preview = document.getElementById('crm-plan-preview');
    if (!preview) return;
    if (!plan) { preview.style.display = 'none'; return; }
    preview.style.display = '';
    preview.innerHTML = `<strong>${safe(plan.label)}</strong> · ${money(plan.price)}/mês · oferta 15 dias ${money(plan.offer)}<br>${plan.items.map(safe).join(' · ')}`;
    if (updateValues) {
      document.getElementById('crm-monthly').value = plan.price;
      document.getElementById('crm-offer').value = plan.offer;
    }
  };

  function formData() {
    const planKey = document.getElementById('crm-plan').value;
    const plan = PLANS[planKey];
    return {
      company: document.getElementById('crm-company').value.trim(),
      name: document.getElementById('crm-name').value.trim(),
      email: document.getElementById('crm-email').value.trim(),
      phone: document.getElementById('crm-phone').value.trim(),
      sector: document.getElementById('crm-sector').value.trim(),
      location: document.getElementById('crm-location').value.trim(),
      website: document.getElementById('crm-website').value.trim(),
      instagram: document.getElementById('crm-instagram').value.trim(),
      opportunity: document.getElementById('crm-opportunity').value.trim(),
      idea: document.getElementById('crm-idea').value.trim(),
      priority: document.getElementById('crm-priority').value,
      lead_status: document.getElementById('crm-status').value,
      recommended_plan: planKey,
      solution_text: plan ? plan.items.join('; ') : '',
      monthly_value: Number(document.getElementById('crm-monthly').value || 0),
      offer_value: Number(document.getElementById('crm-offer').value || 0),
      first_contact_at: document.getElementById('crm-first-contact').value || null,
      follow_up_at: document.getElementById('crm-followup').value || null,
      notes: document.getElementById('crm-notes').value.trim(),
      proposal_email: document.getElementById('crm-proposal').value,
    };
  }

  async function saveCrmProspect(e) {
    e.preventDefault();
    const id = document.getElementById('crm-id').value;
    const body = formData();
    if (!body.company || !body.email) return toast('Empresa e email são obrigatórios.', 'cancel');
    try {
      if (id) await api(`/api/crm/prospects/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
      else await api('/api/crm/prospects', { method: 'POST', body: JSON.stringify(body) });
      toast(id ? 'Prospect atualizado.' : 'Prospect criado.', 'check');
      closeCrmProspect();
      await loadProspects();
      renderCrmTable(document.getElementById('main'));
    } catch (err) { toast(err.message, 'cancel'); }
  }

  window.crmGenerateProposal = function() {
    const p = formData();
    document.getElementById('crm-proposal').value = buildProposal(p);
    toast('Proposta atualizada.', 'check');
  };

  window.crmCopyProposal = async function() {
    const txt = document.getElementById('crm-proposal').value;
    if (!txt) return toast('Ainda não existe uma proposta para copiar.', 'cancel');
    try {
      await navigator.clipboard.writeText(txt);
      toast('Email copiado.', 'check');
    } catch (_) {
      document.getElementById('crm-proposal').select();
      document.execCommand('copy');
      toast('Email copiado.', 'check');
    }
  };

  window.crmMarkContacted = async function(id) {
    try {
      await api(`/api/crm/prospects/${id}/contacted`, { method: 'POST' });
      await loadProspects();
      renderCrmTable(document.getElementById('main'));
      toast('Marcado como contactado.', 'check');
    } catch (e) { toast(e.message, 'cancel'); }
  };

  window.crmDeleteCurrent = async function() {
    const id = document.getElementById('crm-id').value;
    const company = document.getElementById('crm-company').value;
    if (!id) return;
    if (!confirm(`Apagar o prospect "${company}"?`)) return;
    try {
      await api(`/api/crm/prospects/${id}`, { method: 'DELETE' });
      closeCrmProspect();
      await loadProspects();
      renderCrmTable(document.getElementById('main'));
      toast('Prospect apagado.');
    } catch (e) { toast(e.message, 'cancel'); }
  };

  // Se o admin já estava nesta vista quando o script carregou, redesenha.
  if (typeof state !== 'undefined' && state.view === 'prospects' && document.getElementById('main')) {
    window.viewProspects(document.getElementById('main'));
  }
})();
