/* =========================================================================
   DUIT — Bridge CRM + fluxo antigo de propostas
   Mantém no novo CRM todo o fluxo que já existia:
   - orçamento personalizado a partir dos Serviços
   - valores livres por item
   - envio do orçamento pelo fluxo existente
   - estado de leitura (por abrir / aberto / nº de leituras)
   - edição de orçamento
   - conversão do prospect em cliente após aceitação
   ========================================================================= */
(() => {
  let legacyProspects = [];

  const esc = v => (typeof escapeHtml === 'function' ? escapeHtml(v == null ? '' : String(v)) : String(v == null ? '' : v));

  function quoteStatusInfo(s) {
    if (s === 'accepted') return { cls:'ok', label:'Aceite' };
    if (s === 'rejected') return { cls:'err', label:'Rejeitado' };
    if (s === 'revised')  return { cls:'warn', label:'Revisto' };
    if (s === 'sent')     return { cls:'accent', label:'Enviado' };
    if (s === 'draft')    return { cls:'muted', label:'Rascunho' };
    return { cls:'muted', label:s || '—' };
  }

  async function loadLegacy() {
    try { legacyProspects = await api('/api/prospects'); }
    catch (_) { legacyProspects = []; }
    return legacyProspects;
  }

  function getProspect(id) {
    return legacyProspects.find(p => Number(p.id) === Number(id));
  }

  function hasAccepted(p) {
    return !!(p?.quotes || []).find(q => q.status === 'accepted');
  }

  function openQuoteForProspect(p) {
    if (!p) return;
    closeCrmProspect?.();
    openNewQuote();
    setTimeout(() => {
      try {
        setQuoteRecipientMode('prospect');
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
        set('q-prospect-name', p.name || p.company || '');
        set('q-prospect-email', p.email || '');
        set('q-prospect-company', p.company || '');
        set('q-prospect-phone', p.phone || '');
      } catch (e) { console.error('[crm bridge] preencher orçamento:', e); }
    }, 80);
  }

  function ensureQuotesModal() {
    if (document.getElementById('modal-crm-quotes')) return;
    const wrap = document.createElement('div');
    wrap.className = 'overlay';
    wrap.id = 'modal-crm-quotes';
    wrap.innerHTML = `
      <div class="modal wide" style="max-width:900px">
        <div style="display:flex;justify-content:space-between;align-items:start;gap:12px">
          <div>
            <h3 id="crm-quotes-title">Propostas</h3>
            <p class="lede" id="crm-quotes-sub">Orçamentos, leitura e conversão deste prospect.</p>
          </div>
          <button type="button" class="btn btn-icon" onclick="closeCrmQuotes()">✕</button>
        </div>
        <div id="crm-quotes-body"></div>
      </div>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('click', e => { if (e.target === wrap) closeCrmQuotes(); });
  }

  window.closeCrmQuotes = function() {
    document.getElementById('modal-crm-quotes')?.classList.remove('open');
  };

  window.openCrmQuotes = async function(id) {
    ensureQuotesModal();
    if (!legacyProspects.length) await loadLegacy();
    const p = getProspect(id);
    if (!p) return toast('Não foi possível carregar os orçamentos deste prospect.', 'cancel');

    document.getElementById('crm-quotes-title').textContent = `Propostas · ${p.company || p.name}`;
    document.getElementById('crm-quotes-sub').textContent = `${p.email || 'Sem email'}${p.phone ? ' · ' + p.phone : ''}`;

    const quotes = p.quotes || [];
    const canConvert = hasAccepted(p);
    const body = document.getElementById('crm-quotes-body');
    body.innerHTML = `
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 18px">
        <button class="btn btn-yellow" onclick="crmNewQuote(${p.id})">${svg('plus')} Nova proposta personalizada</button>
        ${canConvert ? `<button class="btn btn-ghost" onclick="closeCrmQuotes();convertProspect(${p.id}, '${esc(p.name || p.company).replace(/'/g,"\\'")}')">${svg('check')} Converter em cliente</button>` : ''}
      </div>
      ${quotes.length === 0 ? `<div class="empty" style="padding:30px 0">Ainda não foi enviada nenhuma proposta.</div>` : `
        <div style="border-top:1px solid var(--line-2)">
          ${quotes.map(q => {
            const si = quoteStatusInfo(q.status);
            const subtotal = Number(q.subtotal || 0);
            const total = +(subtotal * 1.23).toFixed(2);
            const link = q.public_token ? `${window.location.origin}/quote.html?token=${encodeURIComponent(q.public_token)}` : '';
            const viewed = !!q.first_viewed_at;
            const read = viewed
              ? `<span class="pill ok" title="1ª leitura ${fmtDateTime(q.first_viewed_at)}${q.view_count > 1 ? ' · última ' + fmtDateTime(q.last_viewed_at) : ''}">${svg('check')} aberto${q.view_count > 1 ? ' · '+q.view_count+'x' : ''}</span>`
              : `<span class="pill muted" title="O prospect ainda não abriu a proposta">por abrir</span>`;
            return `
              <div style="padding:14px 0;border-bottom:1px dashed var(--line-2);display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
                <div style="min-width:230px;flex:1">
                  <div style="display:flex;gap:7px;align-items:center;flex-wrap:wrap">
                    <strong>${esc(q.title)}</strong>
                    <span class="pill ${si.cls}">${esc(si.label)}</span>
                    ${read}
                  </div>
                  <div style="font-size:12px;color:var(--muted);margin-top:4px">
                    Nº ${esc(q.number)} · ${q.sent_at ? 'enviado '+fmtDate(q.sent_at) : 'não enviado'}${q.first_viewed_at ? ' · 1ª leitura '+fmtDateTime(q.first_viewed_at) : ''}${q.responded_at ? ' · resposta '+fmtDate(q.responded_at) : ''} · ${fmtMoney(total)} c/ IVA
                  </div>
                  ${q.rejection_reason ? `<div style="font-size:12px;color:#9a2828;margin-top:5px;font-style:italic">“${esc(q.rejection_reason)}”</div>` : ''}
                </div>
                <div style="display:flex;gap:6px">
                  ${link ? `<button class="btn btn-icon" title="Copiar link público" onclick="copyToClipboard('${link}')">${svg('chat')}</button>` : ''}
                  <button class="btn btn-icon" title="Editar proposta" onclick="closeCrmQuotes();openEditQuote(${q.id})">${svg('edit')}</button>
                </div>
              </div>`;
          }).join('')}
        </div>`}
    `;
    document.getElementById('modal-crm-quotes').classList.add('open');
  };

  window.crmNewQuote = function(id) {
    const p = getProspect(id);
    closeCrmQuotes();
    openQuoteForProspect(p);
  };

  function decorateRows() {
    legacyProspects.forEach(p => {
      const row = [...document.querySelectorAll('tr[onclick]')].find(r => (r.getAttribute('onclick') || '').includes(`openCrmProspect(${p.id})`));
      if (!row || row.dataset.quoteBridge === '1') return;
      row.dataset.quoteBridge = '1';

      const actionCell = row.querySelector('td:last-child .crm-actions') || row.querySelector('td:last-child');
      if (actionCell) {
        const quotes = p.quotes || [];
        const latest = quotes[0];
        const btn = document.createElement('button');
        btn.className = 'btn btn-ghost btn-sm';
        btn.innerHTML = `${svg('quote')} Propostas${quotes.length ? ' ('+quotes.length+')' : ''}`;
        btn.title = latest?.first_viewed_at ? `Última proposta aberta${latest.view_count > 1 ? ' '+latest.view_count+'x' : ''}` : (quotes.length ? 'Há proposta(s) ainda por abrir' : 'Criar proposta personalizada');
        btn.addEventListener('click', e => { e.stopPropagation(); openCrmQuotes(p.id); });
        actionCell.prepend(btn);

        if (hasAccepted(p)) {
          const convert = document.createElement('button');
          convert.className = 'btn btn-yellow btn-sm';
          convert.innerHTML = `${svg('check')} Converter`;
          convert.addEventListener('click', e => { e.stopPropagation(); convertProspect(p.id, p.name || p.company); });
          actionCell.prepend(convert);
        }
      }

      const first = row.querySelector('td');
      if (first && (p.quotes || []).length) {
        const latest = p.quotes[0];
        const info = document.createElement('div');
        info.style.cssText = 'font-size:11px;color:var(--muted);margin-top:6px;display:flex;gap:6px;align-items:center;flex-wrap:wrap';
        info.innerHTML = `<span>${p.quote_count || p.quotes.length} proposta(s)</span> · ${latest.first_viewed_at ? `<span style="color:var(--ok)">aberta${latest.view_count > 1 ? ' '+latest.view_count+'x' : ''}</span>` : '<span>por abrir</span>'}`;
        first.appendChild(info);
      }
    });
  }

  // Acrescenta ações de proposta também dentro da ficha CRM sem substituir nada.
  function decorateCrmModal(id) {
    const p = getProspect(id);
    if (!p) return;
    const actions = document.querySelector('#modal-crm-prospect .modal-actions');
    if (!actions) return;
    actions.querySelectorAll('[data-legacy-quote-action]').forEach(el => el.remove());

    const quotes = document.createElement('button');
    quotes.type = 'button';
    quotes.className = 'btn btn-ghost';
    quotes.dataset.legacyQuoteAction = '1';
    quotes.innerHTML = `${svg('quote')} Propostas / histórico`;
    quotes.onclick = () => { closeCrmProspect(); openCrmQuotes(p.id); };
    actions.insertBefore(quotes, actions.querySelector('.spacer')?.nextSibling || actions.firstChild);

    const nq = document.createElement('button');
    nq.type = 'button';
    nq.className = 'btn btn-yellow';
    nq.dataset.legacyQuoteAction = '1';
    nq.innerHTML = `${svg('plus')} Nova proposta`;
    nq.onclick = () => openQuoteForProspect(p);
    actions.insertBefore(nq, actions.lastElementChild);

    if (hasAccepted(p)) {
      const cv = document.createElement('button');
      cv.type = 'button';
      cv.className = 'btn btn-ghost';
      cv.dataset.legacyQuoteAction = '1';
      cv.innerHTML = `${svg('check')} Converter em cliente`;
      cv.onclick = () => { closeCrmProspect(); convertProspect(p.id, p.name || p.company); };
      actions.insertBefore(cv, actions.lastElementChild);
    }
  }

  const originalView = window.viewProspects;
  if (typeof originalView === 'function') {
    window.viewProspects = async function(main) {
      await originalView(main);
      await loadLegacy();
      decorateRows();
    };
  }

  const originalOpen = window.openCrmProspect;
  if (typeof originalOpen === 'function') {
    window.openCrmProspect = function(id = null) {
      originalOpen(id);
      if (id) {
        if (!legacyProspects.length) loadLegacy().then(() => decorateCrmModal(id));
        else decorateCrmModal(id);
      }
    };
  }

  // Se a vista já estiver aberta quando este ficheiro carregar.
  if (typeof state !== 'undefined' && state.view === 'prospects') {
    loadLegacy().then(decorateRows);
  }
})();
