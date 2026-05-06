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
    revised:     ['warn',  'Revisto'],
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
  const map = { hosting: 'Alojamento', domain: 'Domínio', social: 'Redes sociais', design: 'Design' };
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

/* ---- Acessibilidade: injetar data-label nas tabelas para layout mobile.
   No modo cartão (ecrãs pequenos), o CSS usa content:attr(data-label) para
   mostrar o nome da coluna antes do valor. Em vez de atualizar cada
   viewX(), observamos o <main> e aplicamos sempre que houver novas tabelas. */
function applyTableLabels(root) {
  const tables = (root || document).querySelectorAll('table.table');
  tables.forEach(t => {
    const headers = Array.from(t.querySelectorAll('thead th')).map(th => th.textContent.trim());
    if (headers.length === 0) return;
    t.querySelectorAll('tbody tr').forEach(tr => {
      Array.from(tr.children).forEach((td, i) => {
        const label = headers[i] || '';
        if (label && !td.hasAttribute('data-label')) td.setAttribute('data-label', label);
      });
    });
  });
}
(function watchTables() {
  if (typeof MutationObserver === 'undefined') return;
  const main = document.getElementById('main') || document.body;
  const obs = new MutationObserver(() => applyTableLabels(main));
  obs.observe(main, { childList: true, subtree: true });
  // Aplica também na primeira render
  document.addEventListener('DOMContentLoaded', () => applyTableLabels(document));
})();

/* ---- Registo do Service Worker (PWA) ----------------------------------
   Quando há uma nova versão do SW (= mudámos VERSION em sw.js, ou novos
   ficheiros pré-cache), aparece um pequeno cartão a oferecer "Atualizar".
   Clicar manda SKIP_WAITING ao SW novo e recarrega a página, garantindo
   que o utilizador apanha a nova versão sem reinstalar a app. */
if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      // Se já há um SW à espera (instalado mas não ativo), oferece atualizar.
      if (reg.waiting) showUpdateBanner(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const next = reg.installing;
        if (!next) return;
        next.addEventListener('statechange', () => {
          if (next.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner(next);
          }
        });
      });
    }).catch((e) => {
      console.warn('SW registration failed:', e && e.message);
    });

    // Quando o SW novo assume o controlo, recarrega para apanhar tudo fresco.
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  });
}
function showUpdateBanner(worker) {
  if (document.getElementById('duit-update-cta')) return;
  const el = document.createElement('div');
  el.id = 'duit-update-cta';
  el.style = `
    position: fixed; left: 16px; bottom: 16px; z-index: 9001;
    background: #0a0a0a; color: #fff; padding: 12px 14px;
    border-radius: 12px; box-shadow: 0 6px 18px rgba(0,0,0,0.25);
    font-size: 13px; max-width: 320px;
    border-left: 4px solid #ffd60a;
  `;
  el.innerHTML = `
    <div style="font-weight:600; margin-bottom:6px;">Nova versão disponível</div>
    <div style="color:rgba(255,255,255,0.78); margin-bottom:10px; line-height:1.5;">
      O DUIT foi atualizado. Recarregue para aplicar as novidades.
    </div>
    <button style="background:#ffd60a; color:#0a0a0a; border:0; padding:7px 12px; border-radius:8px; font-weight:600; cursor:pointer; font-family:inherit;">Atualizar agora</button>
  `;
  el.querySelector('button').addEventListener('click', () => {
    try { worker.postMessage({ type: 'SKIP_WAITING' }); } catch (_) {}
    el.remove();
  });
  document.body.appendChild(el);
}

/* ---- Prompt de instalação (Android/Chrome) ---------------------------- */
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  // Mostra um pequeno botão flutuante "Instalar app" no canto inferior direito.
  if (document.getElementById('duit-install-cta')) return;
  const btn = document.createElement('button');
  btn.id = 'duit-install-cta';
  btn.textContent = '+ Instalar app DUIT';
  btn.style = `
    position: fixed; right: 16px; bottom: 16px; z-index: 9000;
    background: #ffd60a; color: #0a0a0a; font-weight: 600;
    border: 0; padding: 10px 14px; border-radius: 999px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.18); cursor: pointer;
    font-family: inherit; font-size: 13px;
  `;
  btn.onclick = async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    try { await deferredInstallPrompt.userChoice; } catch (_) {}
    deferredInstallPrompt = null;
    btn.remove();
  };
  document.body.appendChild(btn);
});
window.addEventListener('appinstalled', () => {
  const btn = document.getElementById('duit-install-cta');
  if (btn) btn.remove();
});

/* ---- Auto-logout por inatividade ----------------------------------------
   Após 5 minutos sem qualquer interação (rato, teclado, scroll ou toque),
   a sessão é encerrada e o utilizador é redirecionado para a página de login.
   Aplica-se ao portal do cliente e ao painel de admin (carrega via common.js).
   Não corre em páginas públicas (login, recuperação, orçamento de prospect).
---------------------------------------------------------------------------- */
(function setupIdleTimeout() {
  const path = window.location.pathname || '';
  // Não ativa nas páginas públicas (login, reset, quote público).
  if (/(^|\/)(index\.html|reset\.html|quote\.html)?$/i.test(path) && !/cliente\.html|admin\.html/i.test(path)) {
    return;
  }

  const TIMEOUT_MS = 5 * 60 * 1000;     // 5 minutos
  const WARN_MS    = 30 * 1000;         // aviso 30s antes
  let warnTimer = null;
  let logoutTimer = null;
  let warnEl = null;

  function clearTimers() {
    if (warnTimer)   { clearTimeout(warnTimer);   warnTimer = null; }
    if (logoutTimer) { clearTimeout(logoutTimer); logoutTimer = null; }
    if (warnEl) { warnEl.remove(); warnEl = null; }
  }

  async function doLogout() {
    clearTimers();
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) { /* ignore */ }
    // Volta sempre para a raiz (login).
    window.location.href = '/?reason=idle';
  }

  function showWarning() {
    if (warnEl) return;
    warnEl = document.createElement('div');
    warnEl.style = `
      position: fixed; right: 20px; bottom: 20px; z-index: 9999;
      background: #0a0a0a; color: #fff; padding: 14px 18px;
      border-radius: 12px; box-shadow: 0 8px 28px rgba(0,0,0,0.25);
      font-size: 13px; line-height: 1.5; max-width: 320px;
      border-left: 4px solid #ffd60a;
    `;
    warnEl.innerHTML = `
      <div style="font-weight:600; margin-bottom:4px;">Sessão prestes a expirar</div>
      <div style="color:rgba(255,255,255,0.75);">
        Por inatividade, a sessão será encerrada em 30 segundos. Mexa o rato ou clique para continuar.
      </div>
    `;
    document.body.appendChild(warnEl);
  }

  function reset() {
    if (warnTimer)   clearTimeout(warnTimer);
    if (logoutTimer) clearTimeout(logoutTimer);
    if (warnEl) { warnEl.remove(); warnEl = null; }
    warnTimer   = setTimeout(showWarning, TIMEOUT_MS - WARN_MS);
    logoutTimer = setTimeout(doLogout, TIMEOUT_MS);
  }

  ['mousemove','mousedown','keydown','scroll','touchstart','click','focus','wheel']
    .forEach(ev => document.addEventListener(ev, reset, { passive: true, capture: true }));
  window.addEventListener('focus', reset);

  // Sincroniza entre tabs do mesmo portal — atividade num separador renova
  // o relógio nos restantes.
  try {
    const KEY = 'duit-last-activity';
    const sync = () => {
      try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {}
    };
    document.addEventListener('mousemove', sync, { passive: true });
    document.addEventListener('keydown',   sync, { passive: true });
    window.addEventListener('storage', (e) => {
      if (e.key === KEY) reset();
    });
  } catch (e) { /* localStorage indisponível — segue sem sync */ }

  reset();
})();
