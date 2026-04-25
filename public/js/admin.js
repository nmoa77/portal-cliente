/* =========================================================================
   DUIT — admin.js · Painel de admin (SPA)
   ========================================================================= */

const state = {
  me: null,
  stats: null,
  view: 'home',
  clients: [],
  selectedClientId: null,
  calMonth: monthKey(new Date()),
  calMode: 'day',             // 'month' | 'day' — por defeito abre em modo diário
  calDay: null,               // 'YYYY-MM-DD', set on first daily render
  calClientFilter: 'all',     // 'all' or user_id
  currentPostId: null,
  currentTicket: null,
};

/* ---- Boot ---- */
(async function boot() {
  try {
    state.me = await api('/api/auth/me');
    if (!state.me) return;
    if (state.me.role !== 'admin') { window.location.href = '/cliente.html'; return; }
    await Promise.all([refreshStats(), refreshClients()]);
    renderShell();
    go('home');
  } catch (e) {
    console.error(e);
    window.location.href = '/';
  }
})();

async function refreshStats() {
  try { state.stats = await api('/api/stats'); } catch (e) { state.stats = null; }
}
async function refreshClients() {
  try { state.clients = await api('/api/clients'); } catch (e) { state.clients = []; }
}

/* ---- Shell ---- */
function renderShell() {
  document.getElementById('side-avatar').textContent = initials(state.me.name);
  document.getElementById('side-name').textContent = state.me.name;
  document.getElementById('side-role').textContent = 'DUIT · Admin';

  const s = state.stats || {};
  const items = [
    { id: 'home',      icon: 'home',    label: 'Visão geral' },
    { id: 'clients',   icon: 'users',   label: 'Clientes',     badge: s.clients },
    { id: 'subs',      icon: 'box',     label: 'Subscrições',  badge: s.activeSubs },
    { id: 'plans',     icon: 'sparkle', label: 'Planos' },
    { id: 'projects',  icon: 'folder',  label: 'Projetos',     badge: s.openProjects },
    { id: 'calendar',  icon: 'cal',     label: 'Calendário',   badge: s.awaitingPosts },
    { id: 'quotes',    icon: 'quote',   label: 'Orçamentos',   badge: s.pendingQuotes },
    { id: 'cancels',   icon: 'cancel',  label: 'Cancelamentos',badge: s.pendingCancels },
    { id: 'support',   icon: 'chat',    label: 'Suporte',      badge: s.openTickets },
    { id: 'notifications', icon: 'bell', label: 'Notificações' },
    { id: 'profile',   icon: 'user',    label: 'Perfil' },
  ];
  const nav = document.getElementById('nav');
  nav.innerHTML = `
    <div class="nav-section">Painel DUIT</div>
    ${items.map(it => `
      <button class="nav-item" data-view="${it.id}">
        ${svg(it.icon)}
        <span>${it.label}</span>
        ${it.badge ? `<span class="badge-count">${it.badge}</span>` : ''}
      </button>
    `).join('')}
  `;
  nav.querySelectorAll('.nav-item').forEach(b => {
    b.addEventListener('click', () => go(b.dataset.view));
  });
  setActive();
}

function setActive() {
  document.querySelectorAll('.nav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.view === state.view);
  });
}

async function go(view) {
  state.view = view;
  setActive();
  const main = document.getElementById('main');
  main.innerHTML = `<div class="empty">A carregar…</div>`;
  try {
    if (view === 'home')          await viewHome(main);
    else if (view === 'clients')  await viewClients(main);
    else if (view === 'subs')     await viewSubs(main);
    else if (view === 'plans')    await viewPlans(main);
    else if (view === 'projects') await viewProjects(main);
    else if (view === 'calendar') await viewCalendar(main);
    else if (view === 'quotes')   await viewQuotes(main);
    else if (view === 'invoices') await viewInvoices(main);
    else if (view === 'cancels')  await viewCancels(main);
    else if (view === 'support')  await viewSupport(main);
    else if (view === 'notifications') await viewNotifications(main);
    else if (view === 'profile')  await viewProfile(main);
  } catch (e) {
    console.error(e);
    main.innerHTML = `<div class="empty">Erro: ${escapeHtml(e.message)}</div>`;
  }
  await refreshStats();
  renderShell();
}

/* =========================================================================
   HOME — visão geral
   ========================================================================= */
async function viewHome(main) {
  const [cancels, tickets, mockups, posts] = await Promise.all([
    api('/api/cancellations'),
    api('/api/tickets'),
    api('/api/mockups'),
    api('/api/social-posts'),
  ]);
  const s = state.stats || {};
  const pendingCancels = cancels.filter(c => c.status === 'pending');
  const draftPosts = posts.filter(p => p.status === 'draft');
  const openTickets = tickets.filter(t => t.status !== 'closed').slice(0, 4);

  main.innerHTML = `
    <div class="page-head">
      <div>
        <div class="eyebrow">Painel DUIT</div>
        <h1>Olá, ${escapeHtml((state.me.name || '').split(' ')[0])}.</h1>
        <p class="lede">O estado do estúdio hoje, ${fmtDate(new Date().toISOString(), true)}.</p>
      </div>
      <div class="page-head-actions">
        <button class="btn btn-ghost" onclick="openNewClient()">${svg('plus')} Novo cliente</button>
        <button class="btn btn-yellow" onclick="openNewQuote()">${svg('quote')} Novo orçamento</button>
      </div>
    </div>

    <div class="grid g-4">
      <div class="card stat y">
        <div class="eyebrow">Receita recorrente</div>
        <div class="value">${fmtMoney(s.monthlyRevenue || 0)}</div>
        <div class="delta">${s.activeSubs || 0} subscrições ativas</div>
      </div>
      <div class="card stat dark">
        <div class="eyebrow">Clientes</div>
        <div class="value">${s.clients || 0}</div>
        <div class="delta">+ portfolio DUIT</div>
      </div>
      <div class="card stat">
        <div class="eyebrow">Projetos em curso</div>
        <div class="value">${s.openProjects || 0}</div>
        <div class="delta">a trabalhar</div>
      </div>
      <div class="card stat">
        <div class="eyebrow">A precisar de ti</div>
        <div class="value">${(s.openTickets||0) + (s.pendingCancels||0) + (s.pendingQuotes||0)}</div>
        <div class="delta">tickets + cancelamentos + orçamentos</div>
      </div>
    </div>

    <div class="section-head"><h2>A precisar de atenção</h2></div>
    <div class="grid g-3">
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <h3>Cancelamentos</h3>
          <span class="pill err">${pendingCancels.length}</span>
        </div>
        ${pendingCancels.length === 0 ? `<div class="empty">Nenhum.</div>` : pendingCancels.slice(0,3).map(c => `
          <div style="padding:10px 0; border-bottom:1px solid var(--line-2);">
            <div style="font-weight:500;">${escapeHtml(c.client_name)}</div>
            <div style="font-size:12px; color:var(--muted); margin-top:2px;">${escapeHtml(c.service_name)} · ${escapeHtml(c.reason)}</div>
          </div>
        `).join('')}
        ${pendingCancels.length > 0 ? `<button class="link" onclick="go('cancels')" style="margin-top:10px;">Ver todos ${svg('arrow')}</button>` : ''}
      </div>

      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <h3>Posts em rascunho</h3>
          <span class="pill warn">${draftPosts.length}</span>
        </div>
        ${draftPosts.length === 0 ? `<div class="empty">Sem rascunhos pendentes.</div>` : draftPosts.slice(0,3).map(p => `
          <div style="padding:10px 0; border-bottom:1px solid var(--line-2);">
            <div style="font-weight:500;">${escapeHtml(p.client_name)}</div>
            <div style="font-size:12px; color:var(--muted); margin-top:2px;">${netLabel(p.network)} · ${fmtDate(p.date)} · ${escapeHtml((p.text || '(sem texto)').slice(0,40))}</div>
          </div>
        `).join('')}
        ${draftPosts.length > 0 ? `<button class="link" onclick="go('calendar')" style="margin-top:10px;">Abrir calendário ${svg('arrow')}</button>` : ''}
      </div>

      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <h3>Tickets abertos</h3>
          <span class="pill accent">${openTickets.length}</span>
        </div>
        ${openTickets.length === 0 ? `<div class="empty">Caixa limpa.</div>` : openTickets.map(t => `
          <div style="padding:10px 0; border-bottom:1px solid var(--line-2);">
            <div style="font-weight:500;">${escapeHtml(t.subject)}</div>
            <div style="font-size:12px; color:var(--muted); margin-top:2px;">${escapeHtml(t.client_name)} · ${priorityPill(t.priority)}</div>
          </div>
        `).join('')}
        ${openTickets.length > 0 ? `<button class="link" onclick="go('support')" style="margin-top:10px;">Abrir suporte ${svg('arrow')}</button>` : ''}
      </div>
    </div>
  `;
}

/* =========================================================================
   CLIENTES
   ========================================================================= */
async function viewClients(main) {
  await refreshClients();
  const list = state.clients;
  const selectedId = state.selectedClientId || (list[0] && list[0].id) || null;
  state.selectedClientId = selectedId;

  main.innerHTML = `
    <div class="page-head">
      <div>
        <div class="eyebrow">Gestão</div>
        <h1>Clientes</h1>
        <p class="lede">Quem confia na DUIT. Toca num cliente para ver notas internas e histórico.</p>
      </div>
      <div class="page-head-actions">
        <button class="btn btn-yellow" onclick="openNewClient()">${svg('plus')} Novo cliente</button>
      </div>
    </div>

    <div class="grid g-2-1" style="align-items:start;">
      <div class="card table-card">
        ${list.length === 0 ? `<div class="empty">Sem clientes.</div>` : `
          <table class="table">
            <thead><tr><th>Cliente</th><th>Contacto</th><th>Subs</th><th>Projetos</th><th>MRR</th><th></th></tr></thead>
            <tbody>
              ${list.map(c => `
                <tr class="interactive" style="${c.id === selectedId ? 'background:var(--bg-2);' : ''}" onclick="selectClient(${c.id})">
                  <td>
                    <div style="display:flex; gap:10px; align-items:center;">
                      <div class="avatar" style="background:var(--yellow); color:var(--black); font-size:12px; width:32px; height:32px;">${initials(c.name)}</div>
                      <div>
                        <div style="font-weight:500;">${escapeHtml(c.name)}</div>
                        <div style="font-size:12px; color:var(--muted);">${escapeHtml(c.company || '—')}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style="font-size:13px;">${escapeHtml(c.email)}</div>
                    <div style="font-size:12px; color:var(--muted);">${escapeHtml(c.phone || '—')}</div>
                  </td>
                  <td>${c.subs}</td>
                  <td>${c.projects}</td>
                  <td><strong>${fmtMoney(c.mrr)}</strong></td>
                  <td style="text-align:right; white-space:nowrap;">
                    <button class="btn btn-icon" title="Editar" onclick="event.stopPropagation(); openEditClient(${c.id})">${svg('edit')}</button>
                    <button class="btn btn-icon" title="Apagar" onclick="event.stopPropagation(); deleteClient(${c.id}, '${escapeHtml(c.name).replace(/'/g,"\\'")}')">${svg('trash')}</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>

      <div id="notes-panel" class="card">
        ${selectedId ? `<div class="empty">A carregar notas…</div>` : `<div class="empty">Seleciona um cliente para ver notas internas.</div>`}
      </div>
    </div>
  `;

  if (selectedId) await renderNotesPanel(selectedId);
}

function selectClient(id) {
  state.selectedClientId = id;
  viewClients(document.getElementById('main'));
}

async function deleteClient(id, name) {
  if (!confirm(`Apagar cliente "${name}"? Isto apaga também subscrições, projetos e tudo o que lhe está associado.`)) return;
  try { await api(`/api/clients/${id}`, { method: 'DELETE' }); toast('Cliente apagado.'); go('clients'); }
  catch (err) { toast(err.message, 'cancel'); }
}

function openNewClient() {
  document.getElementById('modal-client-title').textContent = 'Novo cliente';
  document.getElementById('modal-client-lede').textContent = 'Ao criar, é enviado um email de boas-vindas com as credenciais.';
  document.getElementById('cl-id').value = '';
  document.getElementById('cl-name').value = '';
  document.getElementById('cl-company').value = '';
  document.getElementById('cl-email').value = '';
  document.getElementById('cl-password').value = '';
  document.getElementById('cl-phone').value = '';
  const pw = document.getElementById('cl-password');
  const pwLabel = document.getElementById('cl-password-label');
  if (pwLabel) pwLabel.textContent = 'Password temporária';
  pw.setAttribute('required', 'required');
  pw.placeholder = 'ex: bem-vindo123';
  document.getElementById('cl-submit').textContent = 'Criar & enviar email';
  openModal('modal-client');
}

function openEditClient(id) {
  const c = (state.clients || []).find(x => x.id === id);
  if (!c) { toast('Cliente não encontrado.', 'cancel'); return; }
  document.getElementById('modal-client-title').textContent = 'Editar cliente';
  document.getElementById('modal-client-lede').textContent = `Atualizar dados de ${c.name}. Deixe a password em branco para manter a atual.`;
  document.getElementById('cl-id').value = c.id;
  document.getElementById('cl-name').value = c.name || '';
  document.getElementById('cl-company').value = c.company || '';
  document.getElementById('cl-email').value = c.email || '';
  document.getElementById('cl-password').value = '';
  document.getElementById('cl-phone').value = c.phone || '';
  const pw = document.getElementById('cl-password');
  const pwLabel = document.getElementById('cl-password-label');
  if (pwLabel) pwLabel.textContent = 'Nova password (opcional)';
  pw.removeAttribute('required');
  pw.placeholder = 'Deixe em branco para manter';
  document.getElementById('cl-submit').textContent = 'Guardar alterações';
  openModal('modal-client');
}

async function renderNotesPanel(uid) {
  const panel = document.getElementById('notes-panel');
  const client = state.clients.find(c => c.id === uid);
  let notes = [];
  try { notes = await api(`/api/notes/${uid}`); } catch (e) {}

  panel.innerHTML = `
    <h3 style="margin-bottom:4px;">Notas internas</h3>
    <p style="color:var(--muted); font-size:12px; margin-bottom:14px;">Só a equipa DUIT vê. ${client ? escapeHtml(client.name) : ''}.</p>
    <form id="noteForm" style="margin-bottom:16px;">
      <div class="field">
        <textarea id="note-body" rows="2" required placeholder="Ex: Prefere reuniões às terças..."></textarea>
      </div>
      <button class="btn btn-yellow btn-sm" type="submit">${svg('plus')} Adicionar nota</button>
    </form>
    <div>
      ${notes.length === 0 ? `<div class="empty">Sem notas.</div>` : notes.map(n => `
        <div class="note">
          <div class="note-meta">${escapeHtml(n.author_name)} · ${fmtDateTime(n.created_at)}
            <button class="btn btn-icon btn-sm" style="float:right" onclick="deleteNote(${n.id})" title="Apagar">${svg('trash')}</button>
          </div>
          <div>${escapeHtml(n.body)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

async function deleteNote(id) {
  if (!confirm('Apagar esta nota?')) return;
  try { await api(`/api/notes/${id}`, { method: 'DELETE' }); renderNotesPanel(state.selectedClientId); }
  catch (err) { toast(err.message, 'cancel'); }
}

/* =========================================================================
   SUBSCRIÇÕES
   ========================================================================= */
async function viewSubs(main) {
  const subs = await api('/api/subscriptions');
  state.subs = subs;
  main.innerHTML = `
    <div class="page-head">
      <div>
        <div class="eyebrow">Gestão</div>
        <h1>Subscrições</h1>
        <p class="lede">Todas as subscrições ativas, pausadas e canceladas. A partir daqui pode renovar, pausar ou cancelar.</p>
      </div>
      <div class="page-head-actions">
        <button class="btn btn-yellow" onclick="openNewSub()">${svg('plus')} Nova subscrição</button>
      </div>
    </div>
    <div class="card table-card">
      ${subs.length === 0 ? `<div class="empty">Sem subscrições.</div>` : `
        <table class="table">
          <thead><tr><th>Cliente</th><th>Serviço</th><th>Tipo</th><th>Renovação</th><th>Preço</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            ${subs.map(r => `
              <tr>
                <td>
                  <div style="font-weight:500;">${escapeHtml(r.client_name)}</div>
                  <div style="font-size:12px; color:var(--muted);">${escapeHtml(r.client_company || '')}</div>
                </td>
                <td>
                  <div style="font-weight:500;">${escapeHtml(r.name)}</div>
                  <div style="font-size:12px; color:var(--muted);">${escapeHtml(r.detail || '')}</div>
                </td>
                <td>${typePill(r.type)}</td>
                <td>${fmtDate(r.renewal_date)}</td>
                <td><strong>${fmtMoney(r.price)}</strong><span style="color:var(--muted); font-size:12px;">/${r.period}</span></td>
                <td>${statusPill(r.status)}</td>
                <td style="text-align:right; white-space:nowrap;">
                  <button class="btn btn-icon" title="Editar" onclick="openSubEdit(${r.id})">${svg('edit')}</button>
                  <button class="btn btn-icon" title="Apagar" onclick="deleteSub(${r.id})">${svg('trash')}</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `}
    </div>
  `;
}

function openNewSub() {
  document.getElementById('modal-sub-title').textContent = 'Nova subscrição';
  document.getElementById('s-submit').textContent = 'Criar';
  document.getElementById('s-id').value = '';
  const sel = document.getElementById('s-user');
  sel.innerHTML = state.clients.map(c => `<option value="${c.id}">${escapeHtml(c.name)} · ${escapeHtml(c.company || '')}</option>`).join('');
  sel.disabled = false;
  document.getElementById('s-type').value = 'hosting';
  document.getElementById('s-period').value = 'mês';
  document.getElementById('s-name').value = '';
  document.getElementById('s-detail').value = '';
  document.getElementById('s-price').value = 0;
  document.getElementById('s-renewal').value = '';
  document.getElementById('s-status-wrap').style.display = 'none';
  openModal('modal-sub');
}

function openSubEdit(id) {
  const s = (state.subs || []).find(x => x.id === id);
  if (!s) { toast('Subscrição não encontrada.', 'cancel'); return; }
  document.getElementById('modal-sub-title').textContent = 'Editar subscrição';
  document.getElementById('s-submit').textContent = 'Guardar';
  document.getElementById('s-id').value = s.id;
  const sel = document.getElementById('s-user');
  sel.innerHTML = state.clients.map(c => `<option value="${c.id}">${escapeHtml(c.name)} · ${escapeHtml(c.company || '')}</option>`).join('');
  sel.value = s.user_id;
  sel.disabled = true;
  document.getElementById('s-type').value = s.type || 'hosting';
  document.getElementById('s-period').value = s.period || 'mês';
  document.getElementById('s-name').value = s.name || '';
  document.getElementById('s-detail').value = s.detail || '';
  document.getElementById('s-price').value = s.price || 0;
  document.getElementById('s-renewal').value = s.renewal_date ? String(s.renewal_date).slice(0,10) : '';
  document.getElementById('s-status-wrap').style.display = '';
  document.getElementById('s-status').value = s.status || 'active';
  openModal('modal-sub');
}

async function deleteSub(id) {
  if (!confirm('Apagar esta subscrição?')) return;
  try { await api(`/api/subscriptions/${id}`, { method: 'DELETE' }); toast('Subscrição apagada.'); go('subs'); }
  catch (err) { toast(err.message, 'cancel'); }
}

/* =========================================================================
   PLANOS
   ========================================================================= */
async function viewPlans(main) {
  const plans = await api('/api/plans');
  state.plans = plans;
  const catLabel = { social: 'Redes sociais', hosting: 'Alojamento', domain: 'Domínio' };

  main.innerHTML = `
    <div class="page-head">
      <div>
        <div class="eyebrow">Templates de oferta</div>
        <h1>Planos</h1>
        <p class="lede">Os planos-base que a DUIT oferece. Ao criar uma subscrição, pode puxar destes templates.</p>
      </div>
      <div class="page-head-actions">
        <button class="btn btn-yellow" onclick="openNewPlan()">${svg('plus')} Novo plano</button>
      </div>
    </div>
    <div class="card table-card">
      ${plans.length === 0 ? `<div class="empty">Sem planos.</div>` : `
        <table class="table">
          <thead><tr><th>Plano</th><th>Categoria</th><th>Preço</th><th>Funcionalidades</th><th>Destaque</th><th></th></tr></thead>
          <tbody>
            ${plans.map(p => `
              <tr>
                <td>
                  <div style="font-weight:500;">${escapeHtml(p.name)}</div>
                  <div style="font-size:12px; color:var(--muted);">${escapeHtml(p.description || '—')}</div>
                </td>
                <td>${typePill(p.category)}</td>
                <td><strong>${fmtMoney(p.price)}</strong><span style="color:var(--muted); font-size:12px;">/${p.period || 'mês'}</span></td>
                <td style="font-size:12px; color:var(--muted);">${(p.features || []).length} itens</td>
                <td>${p.is_featured ? `<span class="pill warn">Popular</span>` : `<span class="pill muted">—</span>`}</td>
                <td style="text-align:right; white-space:nowrap;">
                  <button class="btn btn-icon" title="Editar" onclick="openEditPlan(${p.id})">${svg('edit')}</button>
                  <button class="btn btn-icon" title="Apagar" onclick="deletePlan(${p.id})">${svg('trash')}</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `}
    </div>
  `;
}

async function deletePlan(id) {
  if (!confirm('Apagar este plano?')) return;
  try { await api(`/api/plans/${id}`, { method: 'DELETE' }); toast('Plano apagado.'); go('plans'); }
  catch (err) { toast(err.message, 'cancel'); }
}

function openNewPlan() {
  document.getElementById('modal-plan-title').textContent = 'Novo plano';
  document.getElementById('pl-submit').textContent = 'Criar';
  document.getElementById('pl-id').value = '';
  document.getElementById('pl-cat').value = 'social';
  document.getElementById('pl-period').value = 'mês';
  document.getElementById('pl-name').value = '';
  document.getElementById('pl-desc').value = '';
  document.getElementById('pl-price').value = 0;
  document.getElementById('pl-feats').value = '';
  document.getElementById('pl-featured').checked = false;
  openModal('modal-plan');
}

function openEditPlan(id) {
  const p = (state.plans || []).find(x => x.id === id);
  if (!p) { toast('Plano não encontrado.', 'cancel'); return; }
  document.getElementById('modal-plan-title').textContent = 'Editar plano';
  document.getElementById('pl-submit').textContent = 'Guardar';
  document.getElementById('pl-id').value = p.id;
  document.getElementById('pl-cat').value = p.category;
  document.getElementById('pl-period').value = p.period || 'mês';
  document.getElementById('pl-name').value = p.name || '';
  document.getElementById('pl-desc').value = p.description || '';
  document.getElementById('pl-price').value = p.price || 0;
  document.getElementById('pl-feats').value = (p.features || []).join('\n');
  document.getElementById('pl-featured').checked = !!p.is_featured;
  openModal('modal-plan');
}

/* =========================================================================
   PROJETOS
   ========================================================================= */
async function viewProjects(main) {
  const rows = await api('/api/projects');
  state.projects = rows;
  main.innerHTML = `
    <div class="page-head">
      <div>
        <div class="eyebrow">Operações</div>
        <h1>Projetos</h1>
        <p class="lede">Pipeline da DUIT. Ao mudar uma fase, o cliente recebe um email automático.</p>
      </div>
      <div class="page-head-actions">
        <button class="btn btn-yellow" onclick="openNewProject()">${svg('plus')} Novo projeto</button>
      </div>
    </div>
    <div class="card table-card">
      ${rows.length === 0 ? `<div class="empty">Sem projetos.</div>` : rows.map(p => adminProjectRow(p)).join('')}
    </div>
  `;
}

function adminProjectRow(p) {
  const order = ['new','analysis','production','final_review','done','cancelled'];
  const idx = order.indexOf(p.stage);
  const stages = order.map((k, i) => {
    const cls = i < idx ? 'done' : (i === idx ? 'current' : '');
    return `<div class="stage ${cls}"></div>`;
  }).join('');
  const labels = order.map((k, i) =>
    `<span class="${i === idx ? 'cur' : ''}">${stageLabel(k)}</span>`
  ).join('');
  return `
    <div class="project-row">
      <div style="min-width:220px; max-width:280px;">
        <div class="project-title">${escapeHtml(p.name)}</div>
        <div class="project-meta">${escapeHtml(p.client_name)} · ${p.deadline ? 'Entrega ' + fmtDate(p.deadline) : 'sem data'}</div>
      </div>
      <div style="flex:1; min-width:220px;">
        <div class="project-stages">${stages}</div>
        <div class="stage-labels">${labels}</div>
      </div>
      <div style="display:flex; gap:4px;">
        <button class="btn btn-ghost btn-sm" onclick="openProjectEdit(${p.id})">${svg('edit')} Editar</button>
        <button class="btn btn-icon" title="Apagar" onclick="deleteProject(${p.id})">${svg('trash')}</button>
      </div>
    </div>
  `;
}

function openNewProject() {
  const sel = document.getElementById('pr-user');
  sel.innerHTML = state.clients.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
  sel.disabled = false;
  document.getElementById('pr-modal-title').textContent = 'Novo projeto';
  document.getElementById('pr-submit').textContent = 'Criar';
  document.getElementById('pr-id').value = '';
  document.getElementById('pr-name').value = '';
  document.getElementById('pr-desc').value = '';
  document.getElementById('pr-deadline').value = '';
  document.getElementById('pr-stage').value = 'new';
  document.getElementById('pr-msg').value = '';
  document.getElementById('pr-client-wrap').style.display = '';
  openModal('modal-project');
}

function openProjectEdit(id) {
  const p = (state.projects || []).find(x => x.id === id);
  if (!p) { toast('Projeto não encontrado.', 'cancel'); return; }
  const sel = document.getElementById('pr-user');
  sel.innerHTML = state.clients.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
  sel.value = p.user_id;
  sel.disabled = true;
  document.getElementById('pr-modal-title').textContent = 'Editar projeto';
  document.getElementById('pr-submit').textContent = 'Guardar';
  document.getElementById('pr-id').value = p.id;
  document.getElementById('pr-name').value = p.name || '';
  document.getElementById('pr-desc').value = p.description || '';
  document.getElementById('pr-deadline').value = p.deadline ? String(p.deadline).slice(0,10) : '';
  document.getElementById('pr-stage').value = p.stage || 'new';
  document.getElementById('pr-msg').value = '';
  document.getElementById('pr-client-wrap').style.display = '';
  openModal('modal-project');
}

async function deleteProject(id) {
  if (!confirm('Apagar este projeto?')) return;
  try { await api(`/api/projects/${id}`, { method: 'DELETE' }); toast('Projeto apagado.'); go('projects'); }
  catch (err) { toast(err.message, 'cancel'); }
}

/* =========================================================================
   CALENDÁRIO (editor completo)
   ========================================================================= */
async function viewCalendar(main) {
  if (!state.calDay) state.calDay = todayISO();
  const mode = state.calMode;
  const filter = state.calClientFilter;
  const pageHead = `
    <div class="page-head">
      <div>
        <div class="eyebrow">Operações sociais</div>
        <h1>Calendário</h1>
        <p class="lede">${mode === 'month'
          ? 'Vista mensal — clica num dia para criar um post, clica num post para editar.'
          : 'Vista diária — pica os posts como vais fazendo. Mostra também o dia seguinte.'}</p>
      </div>
      <div class="page-head-actions" style="display:flex; gap:6px; align-items:center;">
        <div class="seg">
          <button class="seg-btn ${mode === 'month' ? 'active' : ''}" onclick="setCalMode('month')">Mês</button>
          <button class="seg-btn ${mode === 'day'   ? 'active' : ''}" onclick="setCalMode('day')">Dia</button>
        </div>
        ${mode === 'month' ? `
          <button class="btn btn-ghost btn-sm" onclick="shiftAdminMonth(-1)">←</button>
          <strong style="font-family:'Clash Display'; font-size:18px; min-width:180px; text-align:center;">${monthLabel(state.calMonth)}</strong>
          <button class="btn btn-ghost btn-sm" onclick="shiftAdminMonth(1)">→</button>
        ` : `
          <button class="btn btn-ghost btn-sm" onclick="shiftCalDay(-1)">←</button>
          <strong style="font-family:'Clash Display'; font-size:18px; min-width:180px; text-align:center;">${fmtDate(state.calDay, true)}</strong>
          <button class="btn btn-ghost btn-sm" onclick="shiftCalDay(1)">→</button>
          <button class="btn btn-ghost btn-sm" onclick="goToCalToday()">Hoje</button>
        `}
      </div>
    </div>

    <div class="cal-toolbar">
      <div class="cal-filters">
        <button class="cal-filter ${filter === 'all' ? 'active' : ''}" onclick="setCalFilter('all')">Todos</button>
        ${state.clients.map(c => `
          <button class="cal-filter ${filter == c.id ? 'active' : ''}" onclick="setCalFilter(${c.id})">
            ${escapeHtml(c.company || c.name)}
          </button>
        `).join('')}
      </div>
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        <button class="btn btn-yellow btn-sm" onclick="openNewPostForDate('${mode === 'day' ? state.calDay : ''}')">${svg('plus')} Novo post</button>
        ${filter !== 'all'
          ? `<button class="btn btn-ghost btn-sm" onclick="openGenPosts()">${svg('cal')} Gerar posts do mês</button>`
          : ''}
        ${filter !== 'all'
          ? `<button class="btn btn-ghost btn-sm" onclick="openClearClient()">${svg('trash')} Apagar mês deste cliente</button>`
          : ''}
      </div>
    </div>
  `;

  if (mode === 'month') {
    const month = state.calMonth;
    const qs = new URLSearchParams({ month });
    if (filter !== 'all') qs.set('user_id', filter);
    const posts = await api(`/api/social-posts?${qs.toString()}`);
    state.calPostsCache = posts;
    const days = daysOfMonth(month);
    const first = dayOfWeekISO(month, 1);
    const [y, m] = month.split('-').map(Number);

    const cells = [];
    for (let i = 0; i < first; i++) cells.push(`<div class="cal-day other"></div>`);
    for (let d = 1; d <= days; d++) {
      const dateStr = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const dayPosts = posts.filter(p => p.date === dateStr);
      const isToday = dateStr === todayISO();
      cells.push(`
        <div class="cal-day ${isToday ? 'today' : ''}" onclick="openNewPostForDate('${dateStr}')">
          <div class="date">${d}</div>
          ${dayPosts.map(p => {
            const label = p.client_company || p.client_name || '';
            return `
            <div class="cal-post ${netCls(p.network)} ${p.status}"
                 title="${escapeHtml(label + ' · ' + netLabel(p.network) + ' · ' + p.text)}"
                 onclick="event.stopPropagation(); openEditPost(${p.id})">
              <span style="font-weight:600">${escapeHtml(label)}</span>
              <span style="opacity:.75">·</span>
              ${escapeHtml(p.text.slice(0, 20))}${p.text.length > 20 ? '…' : ''}
            </div>
          `;}).join('')}
        </div>
      `);
    }

    main.innerHTML = `
      ${pageHead}
      <div class="cal">
        <div class="cal-grid">
          ${['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d => `<div class="cal-dow">${d}</div>`).join('')}
          ${cells.join('')}
        </div>
      </div>
    `;
    return;
  }

  // DAILY MODE — fetch current month & next month if needed so hoje + amanhã covered
  const today = state.calDay;
  const tomorrow = addDaysISO(today, 1);
  const months = new Set([today.slice(0,7), tomorrow.slice(0,7)]);
  const all = [];
  for (const mo of months) {
    const qs = new URLSearchParams({ month: mo });
    if (filter !== 'all') qs.set('user_id', filter);
    const rows = await api(`/api/social-posts?${qs.toString()}`);
    all.push(...rows);
  }
  state.calPostsCache = all;
  const todayPosts    = all.filter(p => p.date === today).sort(sortByStatusThenNet);
  const tomorrowPosts = all.filter(p => p.date === tomorrow).sort(sortByStatusThenNet);

  main.innerHTML = `
    ${pageHead}
    <div class="grid" style="gap:18px">
      ${dayBlock('Hoje', today, todayPosts)}
      ${dayBlock('Amanhã', tomorrow, tomorrowPosts)}
    </div>
  `;
}

function dayBlock(title, dateStr, posts) {
  const counts = posts.reduce((acc, p) => { acc[p.status] = (acc[p.status]||0)+1; return acc; }, {});
  const summary = [
    counts.scheduled && `${counts.scheduled} agendados`,
    counts.published && `${counts.published} publicados`,
    counts.draft && `${counts.draft} rascunhos`,
    counts.cancelled && `${counts.cancelled} cancelados`,
  ].filter(Boolean).join(' · ');

  return `
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; gap:10px; flex-wrap:wrap;">
        <div>
          <h3 style="margin:0;">${title} <span style="color:var(--muted); font-weight:400; font-size:14px;">· ${fmtDate(dateStr, true)}</span></h3>
          <div style="font-size:12px; color:var(--muted); margin-top:4px;">${summary || 'Sem posts agendados.'}</div>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="openNewPostForDate('${dateStr}')">${svg('plus')} Adicionar</button>
      </div>
      ${posts.length === 0 ? `<div class="empty">Sem posts.</div>` : `
        <div class="day-list">
          ${posts.map(p => dayPostRow(p)).join('')}
        </div>
      `}
    </div>
  `;
}

function dayPostRow(p) {
  const next = nextStatusLabel(p.status);
  return `
    <div class="day-post ${p.status}">
      <div class="dp-left">
        <span class="pill ${netCls(p.network)}" style="min-width:36px; text-align:center;">${netLabel(p.network).slice(0,2).toUpperCase()}</span>
        <div style="flex:1; min-width:0;">
          <div style="font-weight:500; display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <span>${escapeHtml(p.client_company || p.client_name || '')}</span>
            ${statusPill(p.status)}
          </div>
          <div style="color:var(--muted); font-size:13px; margin-top:3px;">${escapeHtml(p.text)}</div>
          ${p.client_suggestion ? `<div style="font-size:12px; margin-top:4px; color:var(--accent, #b88700);">💡 Sugestão: ${escapeHtml(p.client_suggestion)}</div>` : ''}
        </div>
      </div>
      <div class="dp-actions">
        ${next ? `<button class="btn btn-yellow btn-sm" onclick="quickSetStatus(${p.id}, '${next.key}')" title="${next.title}">${next.label}</button>` : ''}
        <button class="btn btn-ghost btn-sm" onclick="openEditPost(${p.id})" title="Editar">${svg('edit')}</button>
        <button class="btn btn-icon" title="Cancelar post" onclick="quickSetStatus(${p.id}, 'cancelled')">✕</button>
      </div>
    </div>
  `;
}

function nextStatusLabel(status) {
  // Fluxo "pica como vais fazendo": rascunho → agendado → publicado
  switch (status) {
    case 'draft':     return { key: 'scheduled', label: 'Agendar',     title: 'Passar para agendado' };
    case 'scheduled': return { key: 'published', label: '✓ Publicado', title: 'Marcar como publicado' };
    case 'cancelled': return { key: 'scheduled', label: 'Reativar',    title: 'Voltar a agendar' };
    case 'published': return null;
    default:          return { key: 'scheduled', label: 'Agendar',     title: 'Agendar' };
  }
}

async function quickSetStatus(id, status) {
  try {
    await api(`/api/social-posts/${id}`, { method: 'PATCH', body: { status } });
    toast('Post atualizado.', 'check');
    go('calendar');
  } catch (err) { toast(err.message, 'cancel'); }
}

function setCalMode(m) {
  state.calMode = m;
  if (m === 'day' && !state.calDay) state.calDay = todayISO();
  go('calendar');
}

function shiftCalDay(delta) {
  state.calDay = addDaysISO(state.calDay || todayISO(), delta);
  go('calendar');
}

function goToCalToday() {
  state.calDay = todayISO();
  state.calMonth = monthKey(new Date());
  go('calendar');
}

function addDaysISO(iso, delta) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d + delta);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
}

function sortByStatusThenNet(a, b) {
  const order = { scheduled: 0, draft: 1, published: 2, cancelled: 3 };
  const ao = order[a.status] ?? 9;
  const bo = order[b.status] ?? 9;
  if (ao !== bo) return ao - bo;
  return (a.network || '').localeCompare(b.network || '');
}

function setCalFilter(v) { state.calClientFilter = v; go('calendar'); }
function shiftAdminMonth(delta) {
  const [y, m] = state.calMonth.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  state.calMonth = monthKey(d);
  go('calendar');
}
function netCls(n) { return n === 'instagram' ? 'ig' : n === 'facebook' ? 'fb' : 'li'; }
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function openNewPostForDate(dateStr) {
  state.currentPostId = null;
  document.getElementById('modal-post-title').textContent = 'Novo post';
  document.getElementById('modal-post-lede').textContent = 'Agenda uma publicação. O cliente vai receber para aprovar.';
  document.getElementById('mp-id').value = '';
  document.getElementById('mp-date').value = dateStr || todayISO();
  document.getElementById('mp-net').value = 'instagram';
  document.getElementById('mp-text').value = '';
  document.getElementById('mp-status').value = 'scheduled';
  const sel = document.getElementById('mp-user');
  sel.innerHTML = state.clients.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
  if (state.calClientFilter !== 'all') sel.value = state.calClientFilter;
  document.getElementById('mp-delete-btn').style.display = 'none';
  const sw = document.getElementById('mp-suggestion-wrap');
  if (sw) sw.style.display = 'none';
  openModal('modal-post');
}

async function openEditPost(id) {
  state.currentPostId = id;
  let p = (state.calPostsCache || []).find(x => x.id === id);
  if (!p) {
    const posts = await api(`/api/social-posts?month=${encodeURIComponent(state.calMonth)}`);
    p = posts.find(x => x.id === id);
  }
  if (!p) { toast('Post não encontrado.', 'cancel'); return; }
  document.getElementById('modal-post-title').textContent = 'Editar post';
  document.getElementById('modal-post-lede').textContent = `${p.client_company || p.client_name || ''} · ${netLabel(p.network)}`;
  document.getElementById('mp-id').value = id;
  document.getElementById('mp-date').value = p.date;
  document.getElementById('mp-net').value = p.network;
  document.getElementById('mp-text').value = p.text;
  document.getElementById('mp-status').value = p.status;
  const sel = document.getElementById('mp-user');
  sel.innerHTML = state.clients.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
  sel.value = p.user_id;
  document.getElementById('mp-delete-btn').style.display = '';
  const sw = document.getElementById('mp-suggestion-wrap');
  const sv = document.getElementById('mp-suggestion-view');
  if (sw && sv) {
    if (p.client_suggestion && p.client_suggestion.trim()) {
      sv.value = p.client_suggestion;
      sw.style.display = '';
    } else {
      sv.value = '';
      sw.style.display = 'none';
    }
  }
  openModal('modal-post');
}

function activeCalMonth() {
  return state.calMode === 'day' && state.calDay
    ? state.calDay.slice(0, 7)
    : state.calMonth;
}

function openClearClient() {
  if (state.calClientFilter === 'all') return;
  const client = state.clients.find(c => c.id == state.calClientFilter);
  if (!client) return;
  document.getElementById('mcc-client').textContent = `${client.name} · ${monthLabel(activeCalMonth())}`;
  openModal('modal-clear-client');
}

function openGenPosts() {
  if (state.calClientFilter === 'all') { toast('Escolha um cliente primeiro.', 'cancel'); return; }
  const client = state.clients.find(c => c.id == state.calClientFilter);
  if (!client) return;
  const mo = activeCalMonth();
  const lede = document.getElementById('mgp-lede');
  if (lede) lede.textContent = `Criar posts em branco para ${client.name} em ${monthLabel(mo)}. O conteúdo preenches depois.`;
  // reset checkboxes
  document.querySelectorAll('#modal-gen-posts .wd-chip input').forEach(i => { i.checked = false; });
  document.getElementById('mgp-net').value = 'instagram';
  document.getElementById('mgp-ppw').value = '3';
  document.getElementById('mgp-skip').checked = true;
  openModal('modal-gen-posts');
}

/* =========================================================================
   ORÇAMENTOS
   ========================================================================= */
async function viewQuotes(main) {
  const rows = await api('/api/quotes');
  state.quotes = rows;
  main.innerHTML = `
    <div class="page-head">
      <div>
        <div class="eyebrow">Propostas</div>
        <h1>Orçamentos</h1>
        <p class="lede">Acompanha cada proposta até ao sim (ou ao não).</p>
      </div>
      <div class="page-head-actions">
        <button class="btn btn-yellow" onclick="openNewQuote()">${svg('plus')} Novo orçamento</button>
      </div>
    </div>
    <div class="card table-card">
      ${rows.length === 0 ? `<div class="empty">Sem orçamentos.</div>` : `
        <table class="table">
          <thead><tr><th>Nº</th><th>Cliente</th><th>Título</th><th>Enviado</th><th>Válido até</th><th>Total</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            ${rows.map(q => `
              <tr>
                <td><strong>${q.number}</strong></td>
                <td>${escapeHtml(q.client_name)}</td>
                <td>${escapeHtml(q.title)}</td>
                <td>${fmtDate(q.sent_at)}</td>
                <td>${fmtDate(q.valid_until)}</td>
                <td><strong>${fmtMoney(q.total)}</strong></td>
                <td>${statusPill(q.status)}</td>
                <td style="text-align:right; white-space:nowrap;">
                  <button class="btn btn-icon" title="Editar" onclick="openEditQuote(${q.id})">${svg('edit')}</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `}
    </div>
  `;
}

function openNewQuote() {
  const sel = document.getElementById('q-user');
  sel.innerHTML = state.clients.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
  sel.disabled = false;
  const today = new Date(); const thirty = new Date(Date.now() + 30*86400000);
  document.getElementById('modal-quote-title').textContent = 'Novo orçamento';
  document.getElementById('q-submit').textContent = 'Criar & enviar';
  document.getElementById('q-id').value = '';
  document.getElementById('q-number').value = `${today.getFullYear()}-${String(Math.floor(Math.random()*900+100))}`;
  document.getElementById('q-valid').value = thirty.toISOString().slice(0,10);
  document.getElementById('q-title').value = '';
  document.getElementById('q-items').innerHTML = '';
  const statusWrap = document.getElementById('q-status-wrap');
  if (statusWrap) statusWrap.style.display = 'none';
  addQuoteItem();
  openModal('modal-quote');
}

async function openEditQuote(id) {
  let full;
  try { full = await api(`/api/quotes/${id}`); }
  catch (err) { toast(err.message, 'cancel'); return; }
  const sel = document.getElementById('q-user');
  sel.innerHTML = state.clients.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
  sel.value = full.user_id;
  sel.disabled = false;
  document.getElementById('modal-quote-title').textContent = `Editar orçamento ${full.number || ''}`.trim();
  document.getElementById('q-submit').textContent = 'Guardar alterações';
  document.getElementById('q-id').value = full.id;
  document.getElementById('q-number').value = full.number || '';
  document.getElementById('q-valid').value = full.valid_until ? String(full.valid_until).slice(0,10) : '';
  document.getElementById('q-title').value = full.title || '';
  const statusWrap = document.getElementById('q-status-wrap');
  if (statusWrap) {
    statusWrap.style.display = '';
    document.getElementById('q-status').value = full.status || 'draft';
  }
  document.getElementById('q-items').innerHTML = '';
  const items = Array.isArray(full.items) ? full.items : [];
  if (items.length === 0) addQuoteItem();
  else items.forEach(it => {
    addQuoteItem();
    const rows = document.querySelectorAll('#q-items .quote-item');
    const row = rows[rows.length - 1];
    row.querySelector('.q-label').value = it.label || '';
    row.querySelector('.q-detail').value = it.detail || '';
    row.querySelector('.q-amount').value = it.amount ?? 0;
  });
  openModal('modal-quote');
}

function addQuoteItem() {
  const wrap = document.getElementById('q-items');
  const row = document.createElement('div');
  row.className = 'quote-item';
  row.style = 'padding:8px 0; border-bottom:1px solid var(--line-2); gap:8px; display:flex; flex-wrap:wrap;';
  row.innerHTML = `
    <input placeholder="Linha" class="q-label" style="flex:2; min-width:160px;">
    <input placeholder="Detalhe" class="q-detail" style="flex:3; min-width:160px;">
    <input type="number" step="0.01" placeholder="€" class="q-amount" style="flex:1; min-width:100px;">
    <button type="button" class="btn btn-icon" onclick="this.parentElement.remove()" title="Remover">${svg('trash')}</button>
  `;
  wrap.appendChild(row);
}

/* =========================================================================
   FATURAS
   ========================================================================= */
async function viewInvoices(main) {
  const rows = await api('/api/invoices');
  main.innerHTML = `
    <div class="page-head">
      <div>
        <div class="eyebrow">Finanças</div>
        <h1>Faturas</h1>
        <p class="lede">Emissão de faturas e acompanhamento de pagamentos.</p>
      </div>
      <div class="page-head-actions">
        <button class="btn btn-yellow" onclick="openNewInvoice()">${svg('plus')} Nova fatura</button>
      </div>
    </div>
    <div class="card table-card">
      ${rows.length === 0 ? `<div class="empty">Sem faturas.</div>` : `
        <table class="table">
          <thead><tr><th>Nº</th><th>Cliente</th><th>Descrição</th><th>Data</th><th>Valor</th><th>Estado</th></tr></thead>
          <tbody>
            ${rows.map(i => `
              <tr>
                <td><strong>${i.number}</strong></td>
                <td>${escapeHtml(i.client_name)}</td>
                <td>${escapeHtml(i.description)}</td>
                <td>${fmtDate(i.issued_at)}</td>
                <td><strong>${fmtMoney(i.amount)}</strong></td>
                <td>${statusPill(i.status)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `}
    </div>
  `;
}

function openNewInvoice() {
  const sel = document.getElementById('i-user');
  sel.innerHTML = state.clients.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
  const today = new Date();
  document.getElementById('i-number').value = `${today.getFullYear()}/${String(Math.floor(Math.random()*900+100))}`;
  openModal('modal-invoice');
}

/* =========================================================================
   CANCELAMENTOS
   ========================================================================= */
async function viewCancels(main) {
  const rows = await api('/api/cancellations');
  main.innerHTML = `
    <div class="page-head">
      <div>
        <div class="eyebrow">Queue</div>
        <h1>Pedidos de cancelamento</h1>
        <p class="lede">Decide se aprovas, pausas ou recusas. O cliente recebe email em qualquer caso.</p>
      </div>
    </div>
    <div class="grid" style="gap:14px;">
      ${rows.length === 0 ? `<div class="empty">Sem pedidos.</div>` : rows.map(c => `
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:14px; flex-wrap:wrap;">
            <div style="flex:1; min-width:260px;">
              <div style="font-family:'Clash Display'; font-size:22px;">${escapeHtml(c.client_name)}</div>
              <div style="color:var(--muted); font-size:13px; margin-bottom:10px;">${escapeHtml(c.client_company || '')} · ${escapeHtml(c.client_email)}</div>
              <div style="padding:10px 14px; background:var(--bg-2); border-radius:10px; margin-bottom:10px;">
                <div style="font-weight:500; font-size:14px;">${escapeHtml(c.service_name)}</div>
                <div style="font-size:12px; color:var(--muted);">${fmtMoney(c.service_price || 0)}/${c.service_period || 'mês'} · pedido em ${fmtDate(c.created_at)}</div>
              </div>
              <div style="font-size:13px; margin-bottom:4px;"><strong>Razão:</strong> ${escapeHtml(c.reason || '—')}</div>
              ${c.comment ? `<div style="font-size:13px; color:var(--muted);">"${escapeHtml(c.comment)}"</div>` : ''}
            </div>
            <div style="display:flex; flex-direction:column; gap:6px; min-width:180px;">
              ${statusPill(c.status)}
              ${c.status === 'pending' ? `
                <button class="btn btn-yellow btn-sm" onclick="decideCancel(${c.id},'approved')">${svg('check')} Aprovar</button>
                <button class="btn btn-ghost btn-sm" onclick="decideCancel(${c.id},'paused')">Oferecer pausa</button>
                <button class="btn btn-ghost btn-sm" onclick="decideCancel(${c.id},'rejected')">Recusar</button>
              ` : `<span style="font-size:11px; color:var(--muted); text-align:right;">Decidido ${fmtDateTime(c.decided_at)}</span>`}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

async function decideCancel(id, status) {
  try {
    await api(`/api/cancellations/${id}`, { method: 'PATCH', body: { status } });
    toast(status === 'approved' ? 'Cancelamento aprovado.' :
          status === 'paused'   ? 'Pausa proposta ao cliente.' :
                                  'Pedido recusado.');
    go('cancels');
  } catch (err) { toast(err.message, 'cancel'); }
}

/* =========================================================================
   SUPORTE
   ========================================================================= */
async function viewSupport(main) {
  const tickets = await api('/api/tickets');
  main.innerHTML = `
    <div class="page-head">
      <div>
        <div class="eyebrow">Atendimento</div>
        <h1>Suporte</h1>
        <p class="lede">Todos os tickets abertos pelos clientes. Resolve o mais urgente primeiro.</p>
      </div>
    </div>
    <div class="card table-card">
      ${tickets.length === 0 ? `<div class="empty">Caixa limpa.</div>` : tickets.map(t => `
        <div class="project-row" onclick="openTicket(${t.id})" style="cursor:pointer;">
          <div style="flex:1; min-width:240px;">
            <div class="project-title">${escapeHtml(t.subject)}</div>
            <div class="project-meta">${escapeHtml(t.client_name)} · ${fmtDateTime(t.updated_at)} · ${t.message_count} mensagens</div>
          </div>
          ${priorityPill(t.priority)}
          ${statusPill(t.status)}
        </div>
      `).join('')}
    </div>
  `;
}

async function openTicket(id) {
  const t = await api(`/api/tickets/${id}`);
  state.currentTicket = t;
  const main = document.getElementById('main');
  main.innerHTML = `
    <div class="page-head">
      <div>
        <button class="btn btn-ghost btn-sm" onclick="go('support')">← Voltar</button>
        <h1 style="margin-top:8px;">${escapeHtml(t.subject)}</h1>
        <p class="lede">${escapeHtml(t.client_name)} · ${escapeHtml(t.client_email)} · ${priorityPill(t.priority)}</p>
      </div>
      <div style="display:flex; gap:6px;">
        <select onchange="setTicketStatus(${t.id}, this.value)" style="padding:8px; border:1px solid var(--line); border-radius:10px;">
          <option value="open"        ${t.status === 'open' ? 'selected' : ''}>Aberto</option>
          <option value="in_progress" ${t.status === 'in_progress' ? 'selected' : ''}>Em curso</option>
          <option value="closed"      ${t.status === 'closed' ? 'selected' : ''}>Fechado</option>
        </select>
      </div>
    </div>
    <div class="card">
      <div style="display:flex; flex-direction:column; gap:12px;">
        ${t.messages.map(m => `
          <div class="bubble ${m.author_role === 'admin' ? 'mine' : ''}">
            <div class="author">${escapeHtml(m.author_name)} · ${fmtDateTime(m.created_at)}</div>
            <div>${escapeHtml(m.body)}</div>
          </div>
        `).join('')}
      </div>
      ${t.status !== 'closed' ? `
        <form id="msgForm" style="margin-top:20px;">
          <div class="field"><label>Responder</label><textarea id="msg-body" rows="3" required placeholder="Escreva a resposta..."></textarea></div>
          <div class="modal-actions"><button class="btn btn-yellow" type="submit">Enviar ${svg('arrow')}</button></div>
        </form>
      ` : ''}
    </div>
  `;
}

async function setTicketStatus(id, status) {
  try {
    await api(`/api/tickets/${id}`, { method: 'PATCH', body: { status } });
    toast('Estado atualizado.');
    await openTicket(id);
  } catch (err) { toast(err.message, 'cancel'); }
}

/* =========================================================================
   NOTIFICAÇÕES
   ========================================================================= */
async function viewNotifications(main) {
  const rows = await api('/api/notifications');
  main.innerHTML = `
    <div class="page-head">
      <div>
        <div class="eyebrow">Emails enviados</div>
        <h1>Notificações</h1>
        <p class="lede">Registo dos últimos emails que a DUIT despachou (simulados em dev, prontos para SMTP).</p>
      </div>
    </div>
    <div class="card table-card">
      ${rows.length === 0 ? `<div class="empty">Sem notificações.</div>` : `
        <table class="table">
          <thead><tr><th>Para</th><th>Tipo</th><th>Assunto</th><th>Quando</th></tr></thead>
          <tbody>
            ${rows.map(n => `
              <tr>
                <td>
                  <div style="font-weight:500;">${escapeHtml(n.user_name || n.to_email || '—')}</div>
                  <div style="font-size:12px; color:var(--muted);">${escapeHtml(n.to_email || '')}</div>
                </td>
                <td><span class="pill muted">${escapeHtml(n.kind || '—')}</span></td>
                <td>${escapeHtml(n.subject || '')}</td>
                <td>${fmtDateTime(n.created_at)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `}
    </div>
  `;
}

/* =========================================================================
   PERFIL (admin)
   ========================================================================= */
async function viewProfile(main) {
  const me = state.me;
  main.innerHTML = `
    <div class="page-head">
      <div>
        <div class="eyebrow">A sua conta</div>
        <h1>Perfil</h1>
        <p class="lede">Os seus dados e preferências da DUIT.</p>
      </div>
    </div>
    <div class="grid g-2-1">
      <div class="card">
        <h3 style="margin-bottom:14px;">Dados pessoais</h3>
        <form id="profileForm">
          <div class="grid g-2" style="gap:12px;">
            <div class="field"><label>Nome</label><input id="pf-name" value="${escapeHtml(me.name || '')}"></div>
            <div class="field"><label>Empresa</label><input id="pf-company" value="${escapeHtml(me.company || 'DUIT')}"></div>
          </div>
          <div class="field"><label>Email</label><input type="email" value="${escapeHtml(me.email)}" disabled></div>
          <div class="field"><label>Telefone</label><input id="pf-phone" value="${escapeHtml(me.phone || '')}"></div>
          <div class="field"><label>URL da foto</label><input id="pf-avatar" value="${escapeHtml(me.avatar_url || '')}" placeholder="https://..."></div>
          <div class="modal-actions"><button class="btn btn-yellow" type="submit">Guardar alterações</button></div>
        </form>
      </div>
      <div class="card">
        <h3 style="margin-bottom:14px;">Mudar password</h3>
        <form id="passwordForm">
          <div class="field"><label>Password atual</label><input type="password" id="pw-current" required></div>
          <div class="field"><label>Nova password</label><input type="password" id="pw-new" required minlength="8" placeholder="Mínimo 8 caracteres"></div>
          <div class="field"><label>Confirmar nova password</label><input type="password" id="pw-confirm" required minlength="8"></div>
          <div class="modal-actions"><button class="btn btn-yellow" type="submit">Atualizar password</button></div>
        </form>
        <hr style="border:none; border-top:1px solid var(--line); margin:18px 0;">
        <h4 style="margin-bottom:8px;">Preferências</h4>
        <p style="color:var(--muted); font-size:13px; margin-bottom:10px;">Tema claro ou escuro. Fica guardado neste navegador.</p>
        <button class="btn btn-ghost btn-block" onclick="toggleTheme()">${svg('sparkle')} Alternar tema</button>
      </div>
    </div>

    <div class="card" style="margin-top:24px; border:1px solid #e06060; background:rgba(224,96,96,0.04);">
      <h3 style="margin-bottom:6px; color:#c03030;">${svg('cancel')} Zona de perigo</h3>
      <p style="color:var(--muted); font-size:13px; margin-bottom:14px;">
        Apaga <strong>todos</strong> os clientes, subscrições, planos, projetos, mockups, ficheiros,
        calendário, orçamentos, faturas, tickets, notas e notificações. Só a sua conta de admin
        continua activa. Útil para arrancar com dados reais depois da demo. <strong>Não tem volta.</strong>
      </p>
      <button class="btn btn-ghost" onclick="openWipeDb()" style="color:#c03030; border-color:#e06060;">
        Apagar todos os dados
      </button>
    </div>
  `;
}

/* Modal/confirmação de wipe */
function openWipeDb() {
  const phrase = prompt(
    'Vão ser apagados TODOS os dados da base de dados (clientes, projetos, faturas, calendário, etc.).\n\n' +
    'A sua conta de admin mantém-se. Esta ação não tem volta.\n\n' +
    'Para confirmar, escreva exactamente: APAGAR TUDO'
  );
  if (phrase === null) return; // cancelou
  if (phrase !== 'APAGAR TUDO') {
    toast('Confirmação não bate certo. Nada foi apagado.', 'cancel');
    return;
  }
  api('/api/admin/wipe-db', { method: 'POST', body: { confirm: 'APAGAR TUDO' } })
    .then(async () => {
      toast('Base de dados limpa.', 'check');
      // refresca state e manda para home
      await refreshStats();
      await refreshClients();
      go('home');
    })
    .catch(err => toast(err.message, 'cancel'));
}

/* =========================================================================
   FORMS (global handlers)
   ========================================================================= */
document.addEventListener('submit', async (e) => {
  if (e.target.id === 'profileForm') {
    e.preventDefault();
    const body = {
      name: document.getElementById('pf-name').value,
      company: document.getElementById('pf-company').value,
      phone: document.getElementById('pf-phone').value,
      avatar_url: document.getElementById('pf-avatar').value,
    };
    try {
      await api('/api/auth/me', { method: 'PATCH', body });
      state.me = { ...state.me, ...body };
      renderShell();
      toast('Perfil guardado.', 'check');
    } catch (err) { toast(err.message, 'cancel'); }
    return;
  }

  if (e.target.id === 'passwordForm') {
    e.preventDefault();
    const current = document.getElementById('pw-current').value;
    const next = document.getElementById('pw-new').value;
    const confirm = document.getElementById('pw-confirm').value;
    if (next !== confirm) { toast('A confirmação não coincide.', 'cancel'); return; }
    if (next.length < 8)  { toast('A nova password precisa de 8+ caracteres.', 'cancel'); return; }
    try {
      await api('/api/auth/change-password', {
        method: 'POST',
        body: { currentPassword: current, newPassword: next }
      });
      e.target.reset();
      toast('Password atualizada.', 'check');
    } catch (err) { toast(err.message, 'cancel'); }
    return;
  }

  if (e.target.id === 'clientForm') {
    e.preventDefault();
    const id = document.getElementById('cl-id').value;
    const password = document.getElementById('cl-password').value;
    const body = {
      name: document.getElementById('cl-name').value,
      email: document.getElementById('cl-email').value,
      company: document.getElementById('cl-company').value,
      phone: document.getElementById('cl-phone').value,
    };
    if (password) body.password = password;
    try {
      if (id) {
        await api(`/api/clients/${id}`, { method: 'PATCH', body });
        toast('Cliente atualizado.', 'check');
      } else {
        if (!password) { toast('Define uma password.', 'cancel'); return; }
        body.password = password;
        await api('/api/clients', { method: 'POST', body });
        toast('Cliente criado. Email de boas-vindas enviado.', 'check');
      }
      closeModal('modal-client'); e.target.reset();
      document.getElementById('cl-id').value = '';
      await refreshClients();
      go('clients');
    } catch (err) { toast(err.message, 'cancel'); }
  }

  if (e.target.id === 'subForm') {
    e.preventDefault();
    const id = document.getElementById('s-id').value;
    const body = {
      user_id: Number(document.getElementById('s-user').value),
      type: document.getElementById('s-type').value,
      name: document.getElementById('s-name').value,
      detail: document.getElementById('s-detail').value,
      period: document.getElementById('s-period').value,
      price: Number(document.getElementById('s-price').value),
      renewal_date: document.getElementById('s-renewal').value || null,
    };
    if (id) body.status = document.getElementById('s-status').value;
    try {
      if (id) {
        await api(`/api/subscriptions/${id}`, { method: 'PATCH', body });
        toast('Subscrição atualizada.', 'check');
      } else {
        await api('/api/subscriptions', { method: 'POST', body });
        toast('Subscrição criada.', 'check');
      }
      closeModal('modal-sub'); e.target.reset();
      document.getElementById('s-user').disabled = false;
      go('subs');
    } catch (err) { toast(err.message, 'cancel'); }
  }

  if (e.target.id === 'projectForm') {
    e.preventDefault();
    const id = document.getElementById('pr-id').value;
    const name = document.getElementById('pr-name').value;
    const description = document.getElementById('pr-desc').value;
    const stage = document.getElementById('pr-stage').value;
    const deadline = document.getElementById('pr-deadline').value || null;
    const message = document.getElementById('pr-msg').value;
    try {
      if (id) {
        await api(`/api/projects/${id}`, { method: 'PATCH', body: { name, description, stage, deadline, message } });
        toast('Projeto atualizado.', 'check');
      } else {
        const body = {
          user_id: Number(document.getElementById('pr-user').value),
          name, description, stage, deadline,
        };
        await api('/api/projects', { method: 'POST', body });
        toast('Projeto criado.', 'check');
      }
      closeModal('modal-project'); e.target.reset();
      document.getElementById('pr-user').disabled = false;
      go('projects');
    } catch (err) { toast(err.message, 'cancel'); }
  }

  if (e.target.id === 'postForm') {
    e.preventDefault();
    const id = document.getElementById('mp-id').value;
    const body = {
      user_id: Number(document.getElementById('mp-user').value),
      network: document.getElementById('mp-net').value,
      date: document.getElementById('mp-date').value,
      text: document.getElementById('mp-text').value,
      status: document.getElementById('mp-status').value,
    };
    try {
      if (id) await api(`/api/social-posts/${id}`, { method: 'PATCH', body });
      else    await api('/api/social-posts', { method: 'POST', body });
      closeModal('modal-post');
      toast(id ? 'Post atualizado.' : 'Post criado.', 'check');
      go('calendar');
    } catch (err) { toast(err.message, 'cancel'); }
  }

  if (e.target.id === 'clearForm') {
    e.preventDefault();
    const keep = document.getElementById('mcc-keep').value;
    try {
      const r = await api('/api/social-posts/bulk-delete', { method: 'POST', body: {
        user_id: Number(state.calClientFilter),
        month: activeCalMonth(),
        keep,
      }});
      closeModal('modal-clear-client');
      toast(`${r.deleted} posts apagados.`, 'trash');
      go('calendar');
    } catch (err) { toast(err.message, 'cancel'); }
  }

  if (e.target.id === 'genPostsForm') {
    e.preventDefault();
    if (state.calClientFilter === 'all') { toast('Escolha um cliente primeiro.', 'cancel'); return; }
    const weekdays = Array.from(document.querySelectorAll('#modal-gen-posts .wd-chip input:checked'))
      .map(i => Number(i.value));
    const body = {
      user_id: Number(state.calClientFilter),
      month: activeCalMonth(),
      network: document.getElementById('mgp-net').value,
      posts_per_week: Number(document.getElementById('mgp-ppw').value),
      weekdays,
      skip_existing: document.getElementById('mgp-skip').checked,
    };
    try {
      const r = await api('/api/social-posts/bulk-generate', { method: 'POST', body });
      closeModal('modal-gen-posts');
      toast(`${r.created} posts criados${r.planned !== r.created ? ` (${r.planned - r.created} já existiam)` : ''}.`, 'check');
      go('calendar');
    } catch (err) { toast(err.message, 'cancel'); }
  }

  if (e.target.id === 'planForm') {
    e.preventDefault();
    const id = document.getElementById('pl-id').value;
    const body = {
      category: document.getElementById('pl-cat').value,
      period: document.getElementById('pl-period').value,
      name: document.getElementById('pl-name').value,
      description: document.getElementById('pl-desc').value,
      price: Number(document.getElementById('pl-price').value),
      features: document.getElementById('pl-feats').value.split('\n').map(s => s.trim()).filter(Boolean),
      is_featured: document.getElementById('pl-featured').checked,
    };
    try {
      if (id) {
        await api(`/api/plans/${id}`, { method: 'PATCH', body });
        toast('Plano atualizado.', 'check');
      } else {
        await api('/api/plans', { method: 'POST', body });
        toast('Plano criado.', 'check');
      }
      closeModal('modal-plan'); e.target.reset();
      go('plans');
    } catch (err) { toast(err.message, 'cancel'); }
  }

  if (e.target.id === 'quoteForm') {
    e.preventDefault();
    const id = document.getElementById('q-id').value;
    const items = Array.from(document.querySelectorAll('#q-items .quote-item')).map(row => ({
      label: row.querySelector('.q-label').value,
      detail: row.querySelector('.q-detail').value,
      amount: Number(row.querySelector('.q-amount').value) || 0,
    })).filter(x => x.label);
    const body = {
      number: document.getElementById('q-number').value,
      user_id: Number(document.getElementById('q-user').value),
      title: document.getElementById('q-title').value,
      valid_until: document.getElementById('q-valid').value || null,
      items,
    };
    if (id) body.status = document.getElementById('q-status').value;
    try {
      if (id) {
        await api(`/api/quotes/${id}`, { method: 'PATCH', body });
        toast('Orçamento atualizado.', 'check');
      } else {
        await api('/api/quotes', { method: 'POST', body });
        toast('Orçamento criado e enviado.', 'check');
      }
      closeModal('modal-quote'); e.target.reset();
      document.getElementById('q-id').value = '';
      go('quotes');
    } catch (err) { toast(err.message, 'cancel'); }
  }

  if (e.target.id === 'invoiceForm') {
    e.preventDefault();
    const body = {
      number: document.getElementById('i-number').value,
      user_id: Number(document.getElementById('i-user').value),
      description: document.getElementById('i-desc').value,
      amount: Number(document.getElementById('i-amount').value),
      status: document.getElementById('i-status').value,
    };
    try {
      await api('/api/invoices', { method: 'POST', body });
      closeModal('modal-invoice'); e.target.reset();
      toast('Fatura emitida.', 'check');
      go('invoices');
    } catch (err) { toast(err.message, 'cancel'); }
  }

  if (e.target.id === 'noteForm') {
    e.preventDefault();
    const body_txt = document.getElementById('note-body').value;
    try {
      await api('/api/notes', { method: 'POST', body: {
        about_user_id: state.selectedClientId, body: body_txt
      }});
      document.getElementById('note-body').value = '';
      await renderNotesPanel(state.selectedClientId);
    } catch (err) { toast(err.message, 'cancel'); }
  }

  if (e.target.id === 'msgForm') {
    e.preventDefault();
    const body_txt = document.getElementById('msg-body').value;
    try {
      await api(`/api/tickets/${state.currentTicket.id}/messages`, { method: 'POST', body: { body: body_txt } });
      await openTicket(state.currentTicket.id);
    } catch (err) { toast(err.message, 'cancel'); }
  }
});

document.addEventListener('click', async (e) => {
  if (e.target.id === 'mp-delete-btn') {
    const id = document.getElementById('mp-id').value;
    if (!id || !confirm('Apagar este post?')) return;
    try {
      await api(`/api/social-posts/${id}`, { method: 'DELETE' });
      closeModal('modal-post');
      toast('Post apagado.', 'trash');
      go('calendar');
    } catch (err) { toast(err.message, 'cancel'); }
  }
});
