/* =========================================================================
   DUIT — cliente.js · Área do cliente (SPA)
   ========================================================================= */

const state = {
  me: null,
  summary: null,
  view: 'home',
  calMonth: monthKey(new Date()),
  faqOpen: new Set(),
  currentTicket: null,
  currentQuote: null,
  currentMockupId: null,
  currentProjectId: null,
};

/* ---- Boot ---- */
(async function boot() {
  try {
    state.me = await api('/api/auth/me');
    if (!state.me) return;
    if (state.me.role !== 'client') { window.location.href = '/admin.html'; return; }
    await refreshSummary();
    renderShell();
    go('home');
  } catch (e) {
    console.error(e);
    window.location.href = '/';
  }
})();

async function refreshSummary() {
  try { state.summary = await api('/api/client-summary'); } catch (e) { state.summary = null; }
}

/* ---- Shell (sidebar + nav) ---- */
function renderShell() {
  document.getElementById('side-avatar').textContent = initials(state.me.name);
  document.getElementById('side-name').textContent = state.me.name;
  document.getElementById('side-role').textContent = state.me.company || 'Cliente';

  const nav = document.getElementById('nav');
  const s = state.summary || {};
  const items = [
    { id: 'home',      icon: 'home',    label: 'Início' },
    { id: 'subs',      icon: 'box',     label: 'Subscrições', badge: s.activeSubs },
    { id: 'projects',  icon: 'folder',  label: 'Projetos',    badge: s.openProjects },
    { id: 'calendar',  icon: 'cal',     label: 'Calendário',  badge: s.awaitingPosts },
    { id: 'quotes',    icon: 'quote',   label: 'Orçamentos',  badge: s.pendingQuotes },
    { id: 'support',   icon: 'chat',    label: 'Suporte' },
    { id: 'profile',   icon: 'user',    label: 'Perfil' },
  ];
  nav.innerHTML = `
    <div class="nav-section">Área do cliente</div>
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
    if (view === 'home')       await viewHome(main);
    else if (view === 'subs')      await viewSubs(main);
    else if (view === 'projects')  await viewProjects(main);
    else if (view === 'calendar')  await viewCalendar(main);
    else if (view === 'quotes')    await viewQuotes(main);
    else if (view === 'support')   await viewSupport(main);
    else if (view === 'profile')   await viewProfile(main);
    // views ainda implementadas mas sem entrada no menu:
    else if (view === 'mockups')   await viewMockups(main);
    else if (view === 'invoices')  await viewInvoices(main);
  } catch (e) {
    console.error(e);
    main.innerHTML = `<div class="empty">Erro: ${escapeHtml(e.message)}</div>`;
  }
  await refreshSummary();
  renderShell();
}

/* =========================================================================
   HOME
   ========================================================================= */
async function viewHome(main) {
  const [subs, projs, invs] = await Promise.all([
    api('/api/subscriptions'),
    api('/api/projects'),
    api('/api/invoices'),
  ]);
  const s = state.summary || {};
  const now = new Date();
  const hour = now.getHours();
  const greet = hour < 12 ? 'Bom dia' : hour < 19 ? 'Boa tarde' : 'Boa noite';
  const firstName = (state.me.name || '').split(' ')[0];

  const nextRenewal = subs
    .filter(x => x.status === 'active' && x.renewal_date)
    .sort((a,b) => new Date(a.renewal_date) - new Date(b.renewal_date))[0];

  const activeProj = projs.filter(p => p.stage !== 'done' && p.stage !== 'cancelled').slice(0, 3);
  const revised = Array.isArray(s.revisedQuotes) ? s.revisedQuotes : [];

  main.innerHTML = `
    <div class="page-head">
      <div>
        <div class="eyebrow">Olá</div>
        <h1>${greet}, ${escapeHtml(firstName)}.</h1>
        <p class="lede">Tudo o que a DUIT está a tratar, num só sítio.</p>
      </div>
      <div class="page-head-actions">
        <button class="btn btn-ghost" onclick="go('support')">${svg('chat')} Abrir pedido</button>
        <button class="btn btn-yellow" onclick="go('projects')">${svg('folder')} Os meus projetos</button>
      </div>
    </div>

    ${revised.length ? `
      <div class="card" style="margin-bottom:20px; border-left:4px solid #ffd60a; background:#fffbe6;">
        <div style="display:flex; align-items:flex-start; gap:14px; flex-wrap:wrap;">
          <div style="flex:1; min-width:240px;">
            <div class="eyebrow" style="margin-bottom:6px; color:#5a4a00;">${revised.length === 1 ? 'Orçamento revisto' : 'Orçamentos revistos'}</div>
            <h3 style="margin:0 0 6px 0; font-family:'Clash Display'; font-size:20px;">
              ${revised.length === 1
                ? 'Tem um orçamento revisto à sua espera.'
                : `Tem ${revised.length} orçamentos revistos à sua espera.`}
            </h3>
            <p style="margin:0; color:#5a4a00; font-size:14px; line-height:1.5;">
              A equipa DUIT preparou uma nova versão com base no feedback partilhado. Por favor consulte e indique se aceita ou cancela.
            </p>
            <div style="margin-top:10px; display:flex; flex-wrap:wrap; gap:8px;">
              ${revised.slice(0, 3).map(q => `
                <button class="btn btn-yellow btn-sm" onclick="openQuote(${q.id})" style="font-size:13px;">
                  ${escapeHtml(q.title)} (Nº ${escapeHtml(q.number)}) →
                </button>
              `).join('')}
              ${revised.length > 3 ? `<button class="btn btn-ghost btn-sm" onclick="go('quotes')">Ver todos os orçamentos</button>` : ''}
            </div>
          </div>
        </div>
      </div>
    ` : ''}

    <div class="grid g-3">
      <div class="card stat y">
        <div class="eyebrow">Subscrições ativas</div>
        <div class="value">${s.activeSubs || 0}</div>
        <div class="delta">${fmtMoney(s.monthTotal || 0)}/mês</div>
      </div>
      <div class="card stat dark">
        <div class="eyebrow">Projetos em curso</div>
        <div class="value">${s.openProjects || 0}</div>
        <div class="delta">DUIT a trabalhar</div>
      </div>
      <div class="card stat">
        <div class="eyebrow">Orçamentos</div>
        <div class="value">${s.pendingQuotes || 0}</div>
        <div class="delta">por decidir</div>
      </div>
    </div>

    <div class="section-head">
      <h2>Projetos em curso</h2>
      <button class="link" onclick="go('projects')">Ver todos ${svg('arrow')}</button>
    </div>
    <div class="card table-card">
      ${activeProj.length === 0 ? `<div class="empty">Sem projetos ativos.</div>` :
        activeProj.map(p => projectRow(p)).join('')}
    </div>

    <div class="grid g-2" style="margin-top:24px;">
      <div class="card">
        <h3 style="margin-bottom:14px;">Próxima renovação</h3>
        ${nextRenewal ? `
          <div>
            <div style="font-family:'Clash Display'; font-size:22px; margin-bottom:6px;">
              ${escapeHtml(nextRenewal.name)}
            </div>
            <div style="color:var(--muted); font-size:13px; margin-bottom:14px;">
              ${fmtDate(nextRenewal.renewal_date, true)}
              · ${fmtMoney(nextRenewal.price)} / ${nextRenewal.period}
            </div>
            <button class="btn btn-ghost btn-sm" onclick="go('subs')">Ver subscrições</button>
          </div>
        ` : `<div class="empty">Nenhuma renovação agendada.</div>`}
      </div>
      <div class="card">
        <h3 style="margin-bottom:14px;">Últimas faturas</h3>
        ${invs.slice(0,3).map(i => `
          <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--line-2);">
            <div>
              <div style="font-weight:500; font-size:14px;">${escapeHtml(i.description)}</div>
              <div style="font-size:12px; color:var(--muted);">${i.number} · ${fmtDate(i.issued_at)}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-weight:500;">${fmtMoney(i.amount)}</div>
              ${statusPill(i.status)}
            </div>
          </div>
        `).join('') || `<div class="empty">Sem faturas.</div>`}
      </div>
    </div>
  `;
}

function projectRow(p) {
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
    <div class="project-row" onclick="openProject(${p.id})" style="cursor:pointer;">
      <div style="min-width:220px; max-width:280px;">
        <div class="project-title">${escapeHtml(p.name)}</div>
        <div class="project-meta">${p.deadline ? 'Entrega ' + fmtDate(p.deadline) : 'Sem data definida'}</div>
      </div>
      <div style="flex:1; min-width:220px;">
        <div class="project-stages">${stages}</div>
        <div class="stage-labels">${labels}</div>
      </div>
      ${statusPillForStage(p.stage)}
    </div>
  `;
}

function statusPillForStage(stage) {
  if (stage === 'done') return `<span class="pill ok">${svg('check')} Concluído</span>`;
  if (stage === 'cancelled') return `<span class="pill muted">Cancelado</span>`;
  if (stage === 'final_review') return `<span class="pill warn">A sua ação</span>`;
  return `<span class="pill y-soft">Em curso</span>`;
}

/* =========================================================================
   SUBS
   ========================================================================= */
async function viewSubs(main) {
  const rows = await api('/api/subscriptions');
  main.innerHTML = `
    <div class="page-head">
      <div>
        <div class="eyebrow">As suas subscrições</div>
        <h1>Subscrições</h1>
        <p class="lede">Aqui pode consultar tudo o que tem ativo com a DUIT. Pode pedir cancelamento a qualquer momento — analisamos em 48h.</p>
      </div>
    </div>
    <div class="card table-card">
      ${rows.length === 0 ? `<div class="empty">Sem subscrições ativas.</div>` : `
        <table class="table">
          <thead><tr><th>Serviço</th><th>Tipo</th><th>Renovação</th><th>Preço</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td>
                  <div style="font-weight:500;">${escapeHtml(r.name)}</div>
                  <div style="font-size:12px; color:var(--muted); margin-top:2px;">${escapeHtml(r.detail || '')}</div>
                </td>
                <td>${typePill(r.type)}</td>
                <td>${fmtDate(r.renewal_date)}</td>
                <td>${fmtMoney(r.price)}<span style="color:var(--muted); font-size:12px;">/${r.period}</span></td>
                <td>${statusPill(r.status)}</td>
                <td style="text-align:right;">
                  ${r.status === 'active'
                    ? `<button class="btn btn-ghost btn-sm" onclick="openCancel(${r.id})">Cancelar</button>`
                    : '—'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `}
    </div>
  `;
}

function openCancel(subId) {
  document.getElementById('c-sub-id').value = subId;
  openModal('modal-cancel');
}

/* =========================================================================
   PROJETOS
   ========================================================================= */
async function viewProjects(main) {
  const rows = await api('/api/projects');
  main.innerHTML = `
    <div class="page-head">
      <div>
        <div class="eyebrow">DUIT a trabalhar consigo</div>
        <h1>Projetos</h1>
        <p class="lede">Clique num projeto para consultar os detalhes e enviar uma nota. A cada mudança de fase, receberá um email.</p>
      </div>
    </div>
    <div class="card table-card">
      ${rows.length === 0 ? `<div class="empty">Sem projetos.</div>` : rows.map(projectRow).join('')}
    </div>
  `;
}

async function openProject(id) {
  state.currentProjectId = id;
  const main = document.getElementById('main');
  main.innerHTML = `<div class="card"><div class="empty">A carregar projeto…</div></div>`;
  let p, msgs;
  try {
    [p, msgs] = await Promise.all([
      api(`/api/projects/${id}`),
      api(`/api/projects/${id}/messages`),
    ]);
  } catch (err) {
    main.innerHTML = `<div class="card"><div class="empty">Não foi possível carregar o projeto.</div></div>`;
    return;
  }

  const order = ['new','analysis','production','final_review','done','cancelled'];
  const idx = order.indexOf(p.stage);
  const stages = order.map((k, i) => {
    const cls = i < idx ? 'done' : (i === idx ? 'current' : '');
    return `<div class="stage ${cls}"></div>`;
  }).join('');
  const labels = order.map((k, i) =>
    `<span class="${i === idx ? 'cur' : ''}">${stageLabel(k)}</span>`
  ).join('');

  const threadHtml = msgs.length === 0
    ? `<div class="empty" style="padding:20px 0;">Ainda não existem notas neste projeto. Envie a primeira em baixo.</div>`
    : msgs.map(m => `
        <div class="bubble ${m.author_id === state.me.id ? 'mine' : ''}">
          <div class="author">${escapeHtml(m.author_name)}${m.author_role === 'admin' ? ' · DUIT' : ''} · ${fmtDateTime(m.created_at)}</div>
          <div>${escapeHtml(m.body).replace(/\n/g, '<br>')}</div>
        </div>`).join('');

  const canSend = p.stage !== 'cancelled';

  main.innerHTML = `
    <div class="page-head">
      <div>
        <button class="btn btn-ghost btn-sm" onclick="go('projects')">← Voltar aos projetos</button>
        <h1 style="margin-top:8px;">${escapeHtml(p.name)}</h1>
        <p class="lede">${p.deadline ? 'Entrega prevista: ' + fmtDate(p.deadline, true) : 'Sem data de entrega definida'} · Atualizado a ${fmtDate(p.updated_at)}</p>
      </div>
      ${statusPillForStage(p.stage)}
    </div>

    <div class="card" style="margin-bottom:18px;">
      <div style="display:flex; gap:8px; align-items:center; margin-bottom:10px;">
        <span class="eyebrow" style="margin:0;">Fase atual</span>
        <strong style="font-size:14px;">${stageLabel(p.stage)}</strong>
      </div>
      <div style="margin-top:6px;">
        <div class="project-stages">${stages}</div>
        <div class="stage-labels">${labels}</div>
      </div>
      ${p.description ? `
        <hr style="border:none; border-top:1px solid var(--line); margin:18px 0;">
        <div class="eyebrow" style="margin-bottom:6px;">Descrição</div>
        <div style="font-size:14px; line-height:1.6; color:var(--text);">${escapeHtml(p.description).replace(/\n/g,'<br>')}</div>
      ` : ''}
      <div style="margin-top:14px; padding:10px 14px; border:1px dashed var(--line); border-radius:10px; color:var(--muted); font-size:13px;">
        Esta vista é apenas de consulta. Para sugerir alterações, utilize o campo de notas mais abaixo — a equipa DUIT irá responder por aqui e por email.
      </div>
    </div>

    <div class="card">
      <h3 style="margin-bottom:6px;">Notas do projeto</h3>
      <p style="color:var(--muted); font-size:13px; margin-bottom:14px;">Conversa entre o cliente e a equipa DUIT sobre este projeto. Cada nova nota é também enviada por email.</p>
      <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:18px;">
        ${threadHtml}
      </div>
      ${canSend ? `
        <form id="projectMsgForm">
          <div class="field">
            <label>Enviar nova nota</label>
            <textarea id="pmsg-body" rows="3" required placeholder="Descreva a sua dúvida, sugestão ou comentário…"></textarea>
          </div>
          <div class="modal-actions">
            <button class="btn btn-yellow" type="submit">Enviar nota ${svg('arrow')}</button>
          </div>
        </form>
      ` : `
        <div class="empty">O projeto encontra-se cancelado. Não é possível adicionar novas notas.</div>
      `}
    </div>
  `;
}

/* =========================================================================
   MOCKUPS
   ========================================================================= */
async function viewMockups(main) {
  const rows = await api('/api/mockups');
  main.innerHTML = `
    <div class="page-head">
      <div>
        <div class="eyebrow">Aprovações</div>
        <h1>Mockups</h1>
        <p class="lede">Clique num mockup para o consultar, pedir alterações ou aprovar.</p>
      </div>
    </div>
    <div class="mockup-grid">
      ${rows.length === 0 ? `<div class="empty" style="grid-column:1/-1">Nada a aprovar.</div>` :
        rows.map(m => `
          <div class="mockup-card" onclick="openMockup(${m.id})">
            ${mockupThumb(m.thumb_style, m.title)}
            <div class="mockup-info">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div class="mockup-title">${escapeHtml(m.title)}</div>
                  <div class="mockup-meta">${escapeHtml(m.project_name)} · v${m.version}</div>
                </div>
                ${statusPill(m.status)}
              </div>
            </div>
          </div>
        `).join('')}
    </div>
  `;
}

async function openMockup(id) {
  const mockups = await api('/api/mockups');
  const m = mockups.find(x => x.id === id);
  if (!m) return;
  state.currentMockupId = id;
  document.getElementById('mk-title').textContent = m.title;
  document.getElementById('mk-meta').textContent = `${m.project_name} · v${m.version} · ${fmtDate(m.created_at)}`;
  const thumb = document.getElementById('mk-thumb');
  thumb.className = `mockup-thumb ${m.thumb_style || 'yellow'}`;
  thumb.style = 'aspect-ratio:16/10; margin-bottom:16px; border-radius:12px;';
  thumb.innerHTML = `<span class="mk-label">${escapeHtml(m.title)}</span>`;
  document.getElementById('mk-note').value = m.note || '';
  openModal('modal-mockup');
}

/* =========================================================================
   FICHEIROS
   ========================================================================= */
async function viewFiles(main) {
  const files = await api('/api/files');
  main.innerHTML = `
    <div class="page-head">
      <div>
        <div class="eyebrow">Partilhados com a DUIT</div>
        <h1>Ficheiros</h1>
        <p class="lede">Descarregue o que recebeu e envie o que for necessário.</p>
      </div>
      <div class="page-head-actions">
        <button class="btn btn-yellow" onclick="uploadFile()">${svg('plus')} Enviar ficheiro</button>
      </div>
    </div>
    <div class="card table-card">
      ${files.length === 0 ? `<div class="empty">Sem ficheiros.</div>` : files.map(f => `
        <div class="file-row">
          ${fileKindIcon(f.kind)}
          <div style="flex:1;">
            <div class="file-name">${escapeHtml(f.name)}</div>
            <div class="file-meta">
              ${escapeHtml(f.project_name || 'Sem projeto')} ·
              ${Math.round((f.size_kb || 0)/1024*10)/10} MB ·
              ${f.uploaded_by} · ${fmtDate(f.created_at)}
            </div>
          </div>
          <div style="display:flex; gap:4px;">
            <button class="btn btn-icon" title="Descarregar" onclick="toast('Download iniciado','dl')">${svg('dl')}</button>
            ${f.user_id === state.me.id && f.uploaded_by !== 'DUIT'
              ? `<button class="btn btn-icon" title="Apagar" onclick="deleteFile(${f.id})">${svg('trash')}</button>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
    <input type="file" id="file-input" style="display:none" onchange="onFileChosen(this)">
  `;
}

function uploadFile() { document.getElementById('file-input').click(); }

async function onFileChosen(input) {
  const f = input.files[0]; if (!f) return;
  const ext = (f.name.split('.').pop() || '').toLowerCase();
  const kind = ['pdf','fig','png','jpg','jpeg','zip'].includes(ext) ? ext : 'pdf';
  try {
    await api('/api/files', { method: 'POST', body: {
      name: f.name, kind, size_kb: Math.round(f.size/1024)
    }});
    toast('Ficheiro enviado.', 'check');
    go('files');
  } catch (err) { toast(err.message, 'cancel'); }
  input.value = '';
}

async function deleteFile(id) {
  if (!confirm('Apagar este ficheiro?')) return;
  try { await api(`/api/files/${id}`, { method: 'DELETE' }); toast('Ficheiro apagado.'); go('files'); }
  catch (err) { toast(err.message, 'cancel'); }
}

/* =========================================================================
   CALENDÁRIO (read-only)
   ========================================================================= */
async function viewCalendar(main) {
  const month = state.calMonth;
  const posts = await api(`/api/social-posts?month=${encodeURIComponent(month)}`);
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
      <div class="cal-day ${isToday ? 'today' : ''}">
        <div class="date">${d}</div>
        ${dayPosts.map(p => `
          <div class="cal-post ${netCls(p.network)} ${p.status === 'draft' ? 'draft' : ''}" title="${escapeHtml(p.text)} — clica para ver/sugerir" onclick="openPostView(${p.id})" style="cursor:pointer;">
            ${escapeHtml(p.text.slice(0, 22))}${p.text.length > 22 ? '…' : ''}
          </div>
        `).join('')}
      </div>
    `);
  }

  main.innerHTML = `
    <div class="page-head">
      <div>
        <div class="eyebrow">Redes sociais</div>
        <h1>Calendário de publicações</h1>
        <p class="lede">Consulte o que está agendado e aprove as publicações que precisam da sua validação.</p>
      </div>
      <div class="page-head-actions">
        <button class="btn btn-ghost btn-sm" onclick="shiftMonth(-1)">←</button>
        <strong style="font-family:'Clash Display'; font-size:18px; min-width:180px; text-align:center;">${monthLabel(month)}</strong>
        <button class="btn btn-ghost btn-sm" onclick="shiftMonth(1)">→</button>
      </div>
    </div>
    <div class="cal">
      <div class="cal-grid">
        ${['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d => `<div class="cal-dow">${d}</div>`).join('')}
        ${cells.join('')}
      </div>
    </div>
    <div class="grid g-3" style="margin-top:18px;">
      <div class="card"><div style="display:flex; gap:10px; align-items:center;"><span class="pill violet">IG</span> <span style="font-size:13px;">Instagram</span></div></div>
      <div class="card"><div style="display:flex; gap:10px; align-items:center;"><span class="pill ok">FB</span> <span style="font-size:13px;">Facebook</span></div></div>
      <div class="card"><div style="display:flex; gap:10px; align-items:center;"><span class="pill teal">LI</span> <span style="font-size:13px;">LinkedIn</span></div></div>
    </div>
  `;
}

function netCls(n) { return n === 'instagram' ? 'ig' : n === 'facebook' ? 'fb' : 'li'; }

function shiftMonth(delta) {
  const [y, m] = state.calMonth.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  state.calMonth = monthKey(d);
  go('calendar');
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

async function openPostView(id) {
  try {
    const posts = await api(`/api/social-posts?month=${encodeURIComponent(state.calMonth)}`);
    const p = posts.find(x => x.id === id);
    if (!p) { toast('Post não encontrado.', 'cancel'); return; }
    document.getElementById('mp-id').value = p.id;
    document.getElementById('mp-net-view').value = netLabel(p.network);
    document.getElementById('mp-date-view').value = fmtDate(p.date);
    document.getElementById('mp-text-view').value = p.text || '';
    const statusMap = { draft: 'Rascunho', scheduled: 'Agendado', published: 'Publicado', cancelled: 'Cancelado' };
    document.getElementById('mp-status-view').value = statusMap[p.status] || p.status;
    document.getElementById('mp-suggestion').value = '';
    const lede = document.getElementById('modal-post-lede');
    if (lede) lede.textContent = p.client_suggestion
      ? `Já enviou uma sugestão anterior: "${p.client_suggestion}". Pode enviar outra se assim o entender.`
      : 'Consulte o detalhe do post. Se desejar sugerir uma alteração à equipa, escreva em baixo.';
    openModal('modal-post');
  } catch (err) { toast(err.message, 'cancel'); }
}

/* =========================================================================
   ANALÍTICA (estática)
   ========================================================================= */
async function viewAnalytics(main) {
  const labels = ['Nov','Dez','Jan','Fev','Mar','Abr'];
  const vals   = [46, 58, 72, 85, 94, 112];
  const max = Math.max(...vals);
  main.innerHTML = `
    <div class="page-head">
      <div>
        <div class="eyebrow">Performance das redes</div>
        <h1>Analítica</h1>
        <p class="lede">Visão geral do alcance e engagement dos últimos 6 meses.</p>
      </div>
    </div>
    <div class="grid g-4">
      <div class="card stat y"><div class="eyebrow">Alcance total</div><div class="value">112k</div><div class="delta">+19% vs mês anterior</div></div>
      <div class="card stat"><div class="eyebrow">Seguidores novos</div><div class="value">+1.4k</div><div class="delta">+22% vs mês anterior</div></div>
      <div class="card stat"><div class="eyebrow">Engajamento</div><div class="value">6.2%</div><div class="delta">+0.4 pp</div></div>
      <div class="card stat dark"><div class="eyebrow">Posts publicados</div><div class="value">48</div><div class="delta">100% cumpridos</div></div>
    </div>

    <div class="card" style="margin-top:24px;">
      <h3 style="margin-bottom:8px;">Alcance mensal</h3>
      <div class="chart-bars">
        ${vals.map((v,i) => `
          <div class="chart-bar ${i === vals.length-1 ? '' : 'dim'}" style="height:${(v/max)*100}%"></div>
        `).join('')}
      </div>
      <div class="chart-labels">${labels.map(l => `<span>${l}</span>`).join('')}</div>
    </div>
  `;
}

/* =========================================================================
   ORÇAMENTOS
   ========================================================================= */
async function viewQuotes(main) {
  const rows = await api('/api/quotes');
  main.innerHTML = `
    <div class="page-head">
      <div>
        <div class="eyebrow">Propostas da DUIT</div>
        <h1>Orçamentos</h1>
        <p class="lede">Clique num orçamento para consultar o detalhe e aceitar ou rejeitar. Os valores apresentados já incluem IVA à taxa de 23%.</p>
      </div>
    </div>
    <div class="grid g-2">
      ${rows.length === 0 ? `<div class="empty" style="grid-column:1/-1">Sem orçamentos.</div>` :
        rows.map(q => `
          <div class="card quote-card" onclick="openQuote(${q.id})" style="cursor:pointer; ${q.status === 'revised' ? 'border-left:3px solid #ffd60a;' : ''}">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
              <div>
                <div style="font-family:'Clash Display'; font-size:22px;">${escapeHtml(q.title)}</div>
                <div style="font-size:12px; color:var(--muted);">Nº ${q.number} · ${fmtDate(q.sent_at)}${q.status === 'revised' ? ' · nova versão' : ''}</div>
              </div>
              ${statusPill(q.status)}
            </div>
            <div class="quote-total" style="margin-top:14px;">
              <span style="color:var(--muted); font-size:12px;">Total c/ IVA</span>
              <strong style="font-family:'Clash Display'; font-size:22px;">${fmtMoney(q.total)}</strong>
            </div>
          </div>
        `).join('')}
    </div>
  `;
}

async function openQuote(id) {
  const q = await api(`/api/quotes/${id}`);
  state.currentQuote = q;
  const main = document.getElementById('main');
  main.innerHTML = `
    <div class="page-head">
      <div>
        <button class="btn btn-ghost btn-sm" onclick="go('quotes')">← Voltar</button>
        <h1 style="margin-top:8px;">${escapeHtml(q.title)}</h1>
        <p class="lede">Nº ${q.number} · Enviado ${fmtDate(q.sent_at)}${q.valid_until ? ' · Válido até ' + fmtDate(q.valid_until) : ''}</p>
      </div>
      ${statusPill(q.status)}
    </div>

    ${q.status === 'rejected' && q.rejection_reason ? `
      <div class="card" style="margin-bottom:14px; border-left:3px solid #ff3b30;">
        <div class="eyebrow" style="margin-bottom:6px;">Motivo da rejeição</div>
        <div style="font-size:14px; color:var(--text); white-space:pre-wrap;">${escapeHtml(q.rejection_reason)}</div>
      </div>
    ` : ''}

    <div class="card quote-card">
      <div class="quote-items">
        ${q.items.map(it => `
          <div class="quote-item">
            <div>
              <div style="font-weight:500;">${escapeHtml(it.label)}</div>
              <div style="font-size:12px; color:var(--muted); margin-top:2px;">${escapeHtml(it.detail || '')}</div>
            </div>
            <strong>${fmtMoney(it.amount)}</strong>
          </div>
        `).join('')}
      </div>

      <div style="margin-top:18px; padding-top:14px; border-top:1px solid var(--line);">
        <div style="display:flex; justify-content:space-between; padding:6px 0; color:var(--muted); font-size:13px;">
          <span>Subtotal</span>
          <span>${fmtMoney(q.subtotal)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding:6px 0; color:var(--muted); font-size:13px; border-bottom:1px solid var(--line-2);">
          <span>IVA (23%)</span>
          <span>${fmtMoney(q.iva)}</span>
        </div>
        <div class="quote-total" style="padding:14px 0 0 0;">
          <span style="font-weight:600;">Total c/ IVA</span>
          <strong style="font-family:'Clash Display'; font-size:28px;">${fmtMoney(q.total)}</strong>
        </div>
      </div>

      ${(q.status === 'sent' || q.status === 'revised') ? `
        ${q.status === 'revised' ? `
          <div style="margin-top:18px; padding:12px 14px; border-radius:10px; background:#fffbe6; border:1px solid #ecd96a; color:#5a4a00; font-size:13px;">
            Esta é uma <strong>versão revista</strong> do orçamento, preparada pela equipa DUIT. Por favor confirme se aceita ou cancela.
          </div>
        ` : ''}
        <div class="modal-actions" style="margin-top:20px;">
          <button class="btn btn-ghost" onclick="openQuoteReject(${q.id})">${q.status === 'revised' ? 'Cancelar' : 'Rejeitar'}</button>
          <button class="btn btn-yellow" onclick="acceptQuote(${q.id})">${svg('check')} ${q.status === 'revised' ? 'Confirmar nova versão' : 'Aceitar orçamento'}</button>
        </div>
      ` : ''}
    </div>
  `;
}

async function acceptQuote(id) {
  if (!confirm('Confirma a aceitação deste orçamento?')) return;
  try {
    await api(`/api/quotes/${id}`, { method: 'PATCH', body: { status: 'accepted' } });
    toast('Orçamento aceite. A equipa DUIT vai avançar.', 'check');
    go('quotes');
  } catch (err) { toast(err.message, 'cancel'); }
}

function openQuoteReject(id) {
  document.getElementById('qr-id').value = id;
  document.getElementById('qr-reason').value = '';
  openModal('modal-quote-reject');
}

/* =========================================================================
   FATURAS
   ========================================================================= */
async function viewInvoices(main) {
  const rows = await api('/api/invoices');
  main.innerHTML = `
    <div class="page-head">
      <div>
        <div class="eyebrow">Histórico financeiro</div>
        <h1>Faturas</h1>
        <p class="lede">Descarrega em PDF sempre que precisares. Faturas emitidas em euros com IVA incluído.</p>
      </div>
    </div>
    <div class="card table-card">
      ${rows.length === 0 ? `<div class="empty">Sem faturas.</div>` : `
        <table class="table">
          <thead><tr><th>Nº</th><th>Descrição</th><th>Data</th><th>Valor</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            ${rows.map(i => `
              <tr>
                <td><strong>${i.number}</strong></td>
                <td>${escapeHtml(i.description)}</td>
                <td>${fmtDate(i.issued_at)}</td>
                <td>${fmtMoney(i.amount)}</td>
                <td>${statusPill(i.status)}</td>
                <td style="text-align:right;">
                  <button class="btn btn-ghost btn-sm" onclick="toast('PDF descarregado', 'dl')">${svg('dl')} PDF</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `}
    </div>
  `;
}

/* =========================================================================
   SUPORTE (FAQ + tickets)
   ========================================================================= */
async function viewSupport(main) {
  const tickets = await api('/api/tickets');
  const faqs = [
    { q: 'Quando são publicados os posts nas redes sociais?',
      a: 'Seguimos o calendário acordado consigo. Em "Calendário" pode ver o que está agendado e abrir um post para enviar uma sugestão à equipa.' },
    { q: 'Como acompanho o estado de um projeto?',
      a: 'Em "Projetos" encontra a lista dos seus projetos e a respetiva fase (análise, produção, revisão final, etc.). Sempre que mudamos a fase, recebe uma notificação por email — desde que tenha as notificações ativas no Perfil.' },
    { q: 'Como aceito ou rejeito um orçamento?',
      a: 'Em "Orçamentos" clique no orçamento para ver o detalhe e os itens incluídos. No fundo encontra os botões para aceitar ou rejeitar. Se precisar de uma alteração, abra um pedido de suporte antes de decidir.' },
    { q: 'Consigo cancelar uma subscrição a meio do mês?',
      a: 'Sim. Em "Subscrições" clique em "Cancelar". A equipa analisa em 48h. A subscrição continua ativa até ao fim do ciclo já pago.' },
    { q: 'Como altero a palavra-passe ou desativo as notificações?',
      a: 'Tudo no Perfil. Pode atualizar dados pessoais, mudar a palavra-passe e ativar/desativar emails de notificação. As alterações são imediatas.' },
  ];

  main.innerHTML = `
    <div class="page-head">
      <div>
        <div class="eyebrow">Precisa de ajuda?</div>
        <h1>Suporte</h1>
        <p class="lede">Tem uma dúvida rápida? Consulte a base de conhecimento. Algo mais específico? Abra um pedido.</p>
      </div>
      <div class="page-head-actions">
        <button class="btn btn-yellow" onclick="openModal('modal-ticket')">${svg('plus')} Novo pedido</button>
      </div>
    </div>

    <div class="grid g-2-1" style="align-items:start;">
      <div class="card">
        <h3 style="margin-bottom:10px;">Perguntas frequentes</h3>
        ${faqs.map((f, i) => `
          <div class="faq-item ${state.faqOpen.has(i) ? 'open' : ''}" onclick="toggleFaq(${i})">
            <div class="faq-q"><span>${f.q}</span>${svg('plus')}</div>
            <div class="faq-a">${f.a}</div>
          </div>
        `).join('')}
      </div>

      <div class="card">
        <h3 style="margin-bottom:10px;">Os seus pedidos</h3>
        ${tickets.length === 0 ? `<div class="empty">Nenhum pedido aberto.</div>` : tickets.map(t => `
          <div class="project-row" onclick="openTicket(${t.id})" style="cursor:pointer;">
            <div style="flex:1;">
              <div class="project-title">${escapeHtml(t.subject)}</div>
              <div class="project-meta">${fmtDateTime(t.updated_at)} · ${t.message_count} mensagens</div>
            </div>
            ${statusPill(t.status)}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function toggleFaq(i) {
  if (state.faqOpen.has(i)) state.faqOpen.delete(i);
  else state.faqOpen.add(i);
  go('support');
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
        <p class="lede">Aberto a ${fmtDate(t.created_at)} · ${priorityPill(t.priority)}</p>
      </div>
      ${statusPill(t.status)}
    </div>
    <div class="card">
      <div style="display:flex; flex-direction:column; gap:12px;">
        ${t.messages.map(m => `
          <div class="bubble ${m.user_id === state.me.id ? 'mine' : ''}">
            <div class="author">${escapeHtml(m.author_name)} · ${fmtDateTime(m.created_at)}</div>
            <div>${escapeHtml(m.body)}</div>
          </div>
        `).join('')}
      </div>
      ${t.status !== 'closed' ? `
        <form id="msgForm" style="margin-top:20px;">
          <div class="field"><label>Nova mensagem</label><textarea id="msg-body" rows="3" required placeholder="Escreva aqui..."></textarea></div>
          <div class="modal-actions"><button class="btn btn-yellow" type="submit">Enviar ${svg('arrow')}</button></div>
        </form>
      ` : ''}
    </div>
  `;
}

/* =========================================================================
   PERFIL
   ========================================================================= */
async function viewProfile(main) {
  const me = state.me;
  main.innerHTML = `
    <div class="page-head">
      <div>
        <div class="eyebrow">A sua conta</div>
        <h1>Perfil</h1>
        <p class="lede">Dados que a DUIT utiliza para o(a) contactar e faturar.</p>
      </div>
    </div>
    <div class="grid g-2-1">
      <div class="card">
        <h3 style="margin-bottom:14px;">Dados pessoais</h3>
        <form id="profileForm">
          <div class="grid g-2" style="gap:12px;">
            <div class="field"><label>Nome</label><input id="pf-name" value="${escapeHtml(me.name || '')}"></div>
            <div class="field"><label>Empresa</label><input id="pf-company" value="${escapeHtml(me.company || '')}"></div>
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
        <h4 style="margin-bottom:8px;">Notificações por email</h4>
        <p style="color:var(--muted); font-size:13px; margin-bottom:10px;">Receber emails de atualizações de projetos, mockups e cancelamentos.</p>
        <label style="display:flex; align-items:center; gap:10px; cursor:pointer; padding:10px 12px; border:1px solid var(--line); border-radius:10px;">
          <input type="checkbox" id="pf-notifs" ${me.notifications_enabled !== 0 ? 'checked' : ''} style="width:18px; height:18px; accent-color:#ffd60a; cursor:pointer;">
          <span style="font-size:14px;">Quero receber notificações por email</span>
        </label>
        <hr style="border:none; border-top:1px solid var(--line); margin:18px 0;">
        <h4 style="margin-bottom:8px;">Aspeto</h4>
        <p style="color:var(--muted); font-size:13px; margin-bottom:10px;">Tema claro ou escuro. Fica guardado neste navegador.</p>
        <button class="btn btn-ghost btn-block" onclick="toggleTheme()">${svg('sparkle')} Alternar tema</button>
        <hr style="border:none; border-top:1px solid var(--line); margin:18px 0;">
        <h4 style="margin-bottom:8px;">A sua equipa DUIT</h4>
        <p style="color:var(--muted); font-size:13px;">Gestor principal: Nuno Alho · +351 918 390 570 · info@duit.pt</p>
      </div>
    </div>
  `;
}

/* =========================================================================
   FORM HANDLERS (global)
   ========================================================================= */
document.addEventListener('submit', async (e) => {
  if (e.target.id === 'cancelForm') {
    e.preventDefault();
    const id = document.getElementById('c-sub-id').value;
    const reason = document.getElementById('c-reason').value;
    const comment = document.getElementById('c-comment').value;
    try {
      await api('/api/cancellations', { method: 'POST',
        body: { subscription_id: Number(id), reason, comment } });
      closeModal('modal-cancel');
      e.target.reset();
      toast('Pedido enviado. A equipa vai analisar.', 'check');
      go('subs');
    } catch (err) { toast(err.message, 'cancel'); }
  }

  if (e.target.id === 'ticketForm') {
    e.preventDefault();
    const subject = document.getElementById('t-subject').value;
    const priority = document.getElementById('t-priority').value;
    const body = document.getElementById('t-body').value;
    try {
      await api('/api/tickets', { method: 'POST', body: { subject, priority, body } });
      closeModal('modal-ticket');
      e.target.reset();
      toast('Pedido enviado. Respondemos em 24h úteis.', 'check');
      go('support');
    } catch (err) { toast(err.message, 'cancel'); }
  }

  if (e.target.id === 'msgForm') {
    e.preventDefault();
    const body = document.getElementById('msg-body').value;
    try {
      await api(`/api/tickets/${state.currentTicket.id}/messages`, { method: 'POST', body: { body } });
      await openTicket(state.currentTicket.id);
    } catch (err) { toast(err.message, 'cancel'); }
  }

  if (e.target.id === 'quoteRejectForm') {
    e.preventDefault();
    const id = document.getElementById('qr-id').value;
    const rejection_reason = document.getElementById('qr-reason').value.trim();
    if (!rejection_reason) { toast('Indique o motivo da rejeição.', 'cancel'); return; }
    try {
      await api(`/api/quotes/${id}`, { method: 'PATCH', body: { status: 'rejected', rejection_reason } });
      closeModal('modal-quote-reject');
      e.target.reset();
      toast('Orçamento rejeitado. A equipa DUIT foi notificada.', 'check');
      go('quotes');
    } catch (err) { toast(err.message, 'cancel'); }
  }

  if (e.target.id === 'projectMsgForm') {
    e.preventDefault();
    const body = document.getElementById('pmsg-body').value.trim();
    if (!body) { toast('Escreva uma nota antes de enviar.', 'cancel'); return; }
    try {
      await api(`/api/projects/${state.currentProjectId}/messages`, { method: 'POST', body: { body } });
      toast('Nota enviada à equipa DUIT.', 'check');
      await openProject(state.currentProjectId);
    } catch (err) { toast(err.message, 'cancel'); }
  }

  if (e.target.id === 'postSuggestForm') {
    e.preventDefault();
    const id = document.getElementById('mp-id').value;
    const suggestion = document.getElementById('mp-suggestion').value.trim();
    if (!suggestion) {
      toast('Escreva a sua sugestão antes de enviar.', 'cancel');
      return;
    }
    try {
      await api(`/api/social-posts/${id}/suggestion`, { method: 'POST', body: { suggestion } });
      closeModal('modal-post');
      toast('Sugestão enviada à equipa.', 'check');
    } catch (err) { toast(err.message, 'cancel'); }
  }

  if (e.target.id === 'profileForm') {
    e.preventDefault();
    const notifEl = document.getElementById('pf-notifs');
    const body = {
      name: document.getElementById('pf-name').value,
      company: document.getElementById('pf-company').value,
      phone: document.getElementById('pf-phone').value,
      avatar_url: document.getElementById('pf-avatar').value,
      notifications_enabled: notifEl ? (notifEl.checked ? 1 : 0) : undefined,
    };
    try {
      await api('/api/auth/me', { method: 'PATCH', body });
      state.me = { ...state.me, ...body };
      renderShell();
      toast('Perfil guardado.', 'check');
    } catch (err) { toast(err.message, 'cancel'); }
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
  }
});

document.addEventListener('click', async (e) => {
  if (e.target.id === 'mk-approve' || e.target.id === 'mk-reject') {
    const status = e.target.id === 'mk-approve' ? 'approved' : 'changes_requested';
    const note = document.getElementById('mk-note').value;
    try {
      await api(`/api/mockups/${state.currentMockupId}`, { method: 'PATCH', body: { status, note } });
      closeModal('modal-mockup');
      toast(status === 'approved' ? 'Mockup aprovado.' : 'Feedback enviado à equipa.', 'check');
      go('mockups');
    } catch (err) { toast(err.message, 'cancel'); }
  }
});
