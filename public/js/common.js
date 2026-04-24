/* =========================================================================
   DUIT — utilidades partilhadas
   ========================================================================= */

/* ---- API fetch ---- */
async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (res.status === 401) { window.location.href = '/'; return; }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Erro no pedido');
  return data;
}

async function logout() {
  try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (_) {}
  window.location.href = '/';
}

/* ---- Format helpers ---- */
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function fmtMoney(v) {
  return (Number(v) || 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
}

function fmtDate(s, long = false) {
  if (!s) return '—';
  const d = new Date(s.includes('T') ? s : s.replace(' ', 'T'));
  if (isNaN(d)) return s;
  return d.toLocaleDateString('pt-PT',
    long ? { day: '2-digit', month: 'long', year: 'numeric' }
         : { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateTime(s) {
  if (!s) return '—';
  const d = new Date(s.includes('T') ? s : s.replace(' ', 'T'));
  if (isNaN(d)) return s;
  return d.toLocaleString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function initials(name) {
  return String(name || '')
    .split(/\s+/).filter(Boolean).slice(0, 2)
    .map(w => w[0].toUpperCase()).join('') || '—';
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.round((d - today) / 86400000);
}

/* ---- Theme (light/dark) ---- */
(function initTheme() {
  const saved = localStorage.getItem('duit-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
})();
function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  const next = cur === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('duit-theme', next);
}

/* ---- Toasts ---- */
function toast(msg, icon = 'check') {
  const wrap = document.getElementById('toasts');
  if (!wrap) { console.log('[toast]', msg); return; }
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span class="toast-ico">${svg(icon)}</span><span>${escapeHtml(msg)}</span>`;
  wrap.appendChild(el);
  setTimeout(() => el.classList.add('out'), 2800);
  setTimeout(() => el.remove(), 3200);
}

/* ---- Modal helpers ---- */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}
document.addEventListener('click', (e) => {
  const close = e.target.getAttribute && e.target.getAttribute('data-close');
  if (close) closeModal(close);
  if (e.target.classList && e.target.classList.contains('overlay')) {
    e.target.classList.remove('open');
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
});

/* ---- Badges / pills ---- */
function statusPill(status) {
  const map = {
    active:      ['ok',    'Ativa'],
    pending:     ['warn',  'Pendente'],
    expired:     ['err',   'Expirada'],
    cancelled:   ['muted', 'Cancelada'],
    open:        ['warn',  'Aberto'],
    in_progress: ['accent','Em curso'],
    closed:      ['muted', 'Fechado'],
    paid:        ['ok',    'Pago'],
    overdue:     ['err',   'Em atraso'],
    sent:        ['accent','Enviado'],
    accepted:    ['ok',    'Aceite'],
    rejected:    ['err',   'Rejeitado'],
    draft:       ['muted', 'Rascunho'],
    scheduled:   ['accent','Agendado'],
    published:   ['ok',    'Publicado'],
    paused:      ['warn',  'Em pausa'],
    new:         ['accent','Novo'],
    analysis:    ['warn',  'Em análise'],
    production:  ['accent','Em produção'],
    final_review:['warn',  'Revisão final'],
  };
  const [cls, label] = map[status] || ['muted', status];
  return `<span class="pill ${cls}">${label}</span>`;
}

function priorityPill(p) {
  const map = { low: ['muted', 'Baixa'], normal: ['accent', 'Normal'], high: ['err', 'Alta'] };
  const [cls, label] = map[p] || ['accent', p];
  return `<span class="pill ${cls}">${label}</span>`;
}

function typePill(type) {
  const map = { hosting: 'Alojamento', domain: 'Domínio', social: 'Redes sociais' };
  return `<span class="pill">${map[type] || type}</span>`;
}

function stageLabel(stage) {
  const map = { new: 'Novo', analysis: 'Em análise', production: 'Em produção',
                final_review: 'Revisão final', done: 'Concluído', cancelled: 'Cancelado' };
  return map[stage] || stage;
}

function netLabel(n) {
  const map = { instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn' };
  return map[n] || n;
}

function fileKindIcon(kind) {
  const map = { pdf: 'pdf', fig: 'fig', png: 'png', jpg: 'png', zip: 'zip' };
  return `<span class="file-ico ${map[kind] || 'pdf'}">${(kind || 'FILE').toUpperCase().slice(0,3)}</span>`;
}

/* ---- SVG icon map (linhas soltas, stroke currentColor) ---- */
const ICO = {
  home:    '<path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1Z"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  box:     '<path d="M3 7l9-4 9 4-9 4-9-4Zm0 0v10l9 4 9-4V7"/><path d="M12 11v10"/>',
  folder:  '<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
  cal:     '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>',
  chat:    '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12Z"/>',
  users:   '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><circle cx="17" cy="7" r="3"/><path d="M15 14a5 5 0 0 1 7 4.5"/>',
  zap:     '<path d="M13 2 3 14h8l-1 8 10-12h-8Z"/>',
  help:    '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 4.8.9c0 1.6-2.3 2.1-2.3 3.6M12 17h.01"/>',
  quote:   '<path d="M3 5a2 2 0 0 1 2-2h11l5 5v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M15 3v6h6M8 13h8M8 17h6"/>',
  cancel:  '<circle cx="12" cy="12" r="9"/><path d="M5 5l14 14"/>',
  user:    '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  plus:    '<path d="M12 5v14M5 12h14"/>',
  arrow:   '<path d="M5 12h14M13 6l6 6-6 6"/>',
  check:   '<path d="M5 13l4 4L19 7"/>',
  eye:     '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  chart:   '<path d="M3 3v18h18"/><path d="M7 15v-4M11 15v-7M15 15v-2M19 15v-6"/>',
  file:    '<path d="M7 3h8l5 5v13H7z"/><path d="M14 3v6h6"/>',
  note:    '<path d="M4 4h14v14l-5 4H4z"/><path d="M14 18v4l4-4M8 8h10M8 12h8"/>',
  invoice: '<path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2z"/><path d="M9 7h6M9 11h6M9 15h4"/>',
  trash:   '<path d="M4 7h16M10 7V4h4v3M6 7l1 13h10l1-13"/>',
  edit:    '<path d="M4 20h4L20 8l-4-4L4 16z"/>',
  dl:      '<path d="M12 3v12M6 11l6 6 6-6M4 21h16"/>',
  pic:     '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m3 18 6-6 4 4 3-3 5 5"/>',
  bell:    '<path d="M6 10a6 6 0 1 1 12 0v5l2 3H4l2-3Z"/><path d="M10 21a2 2 0 0 0 4 0"/>',
  search:  '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
};

function svg(name, extraClass = '') {
  return `<svg class="ico ${extraClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICO[name] || ''}</svg>`;
}

/* ---- Mockup thumb placeholder ---- */
function mockupThumb(style, label) {
  return `<div class="mockup-thumb ${style || 'yellow'}">
    <span class="mk-label">${escapeHtml(label || '')}</span>
  </div>`;
}

/* ---- Calendar helpers ---- */
function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
}

function daysOfMonth(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

function dayOfWeekISO(key, day) {
  // returns 0 (mon) .. 6 (sun)
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1, day).getDay(); // 0 sun .. 6 sat
  return (d + 6) % 7;
}

/* ---- Keep theme attribute set on <html> from storage ---- */
document.documentElement.setAttribute(
  'data-theme',
  localStorage.getItem('duit-theme') || document.documentElement.getAttribute('data-theme') || 'light'
);
