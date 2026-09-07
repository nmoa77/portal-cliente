/* DUIT — Relatórios Meta · administração */
(() => {
  const esc = (v) => typeof escapeHtml === 'function' ? escapeHtml(String(v ?? '')) : String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const notice = (msg, type='check') => typeof toast === 'function' ? toast(msg, type) : alert(msg);

  let metaAssets = [];
  let metaConnections = [];
  let metaStatus = null;
  let metaIdentity = null;
  let metaTestedOk = false;

  function statusPill(ok, yes='OK', no='Em falta') {
    return `<span class="pill ${ok ? 'ok' : 'err'}">${ok ? yes : no}</span>`;
  }

  function clientLabel(c) { return c.company || c.name || c.email || `Cliente #${c.id}`; }
  function assetLabel(a) {
    const ig = a.instagram_username ? ` · Instagram @${a.instagram_username}` : ' · sem Instagram associado';
    return `${a.page_name || a.page_id}${ig}`;
  }

  async function loadMetaData({test=false} = {}) {
    metaStatus = await api('/api/meta/status');
    metaAssets = [];
    metaConnections = [];
    if (metaStatus.token_present && test) {
      metaIdentity = await api('/api/meta/me');
      metaTestedOk = true;
    }
    if (metaStatus.token_present) {
      try { metaAssets = await api('/api/meta/assets'); } catch (e) { if (test) throw e; }
    }
    try { metaConnections = await api('/api/meta/connections'); } catch (_) { metaConnections = []; }
  }

  window.viewMetaReports = async function viewMetaReports(main) {
    await loadMetaData();
    const clients = (state.clients || []).filter(c => !c.is_prospect && (c.role === 'client' || !c.role));
    const connectedIds = new Set(metaConnections.map(c => Number(c.user_id)));
    const identityHtml = metaTestedOk
      ? `<span class="pill ok">✓ Ligação testada com sucesso</span>${metaIdentity?.name ? ` <span style="margin-left:8px;color:var(--muted)">Ligado como <strong>${esc(metaIdentity.name)}</strong></span>` : ''}`
      : 'Ainda não testado nesta sessão.';

    main.innerHTML = `
      <div class="page-head"><div><div class="eyebrow">Automação DUIT</div><h1>Relatórios Meta</h1><p class="lede">Ligação central da DUIT ao Facebook e Instagram para recolher métricas e gerar relatórios mensais por cliente.</p></div><div class="page-head-actions"><button class="btn btn-yellow" id="meta-test-btn">Testar ligação</button></div></div>
      <div class="grid g-4" style="margin-bottom:24px">
        <div class="card stat"><div class="eyebrow">App ID</div><div style="margin-top:10px">${statusPill(metaStatus.app_id_present,'Configurado')}</div></div>
        <div class="card stat"><div class="eyebrow">App Secret</div><div style="margin-top:10px">${statusPill(metaStatus.app_secret_present,'Configurado')}</div></div>
        <div class="card stat"><div class="eyebrow">Access Token</div><div style="margin-top:10px">${statusPill(metaStatus.token_present,'Presente')}</div></div>
        <div class="card stat"><div class="eyebrow">Graph API</div><div class="value" style="font-size:24px">${esc(metaStatus.graph_version||'—')}</div></div>
      </div>
      <div class="card" style="margin-bottom:24px"><div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap"><div><h3 style="margin-bottom:6px">Ligação à Meta</h3><p class="lede" style="margin:0">O token nunca é mostrado no portal. O teste valida a credencial diretamente na Graph API.</p></div><div id="meta-identity">${identityHtml}</div></div></div>
      <div class="section-head"><h2>Contas disponíveis</h2><span class="pill accent">${metaAssets.length}</span></div>
      <div class="card" id="meta-assets-card" style="margin-bottom:24px">${metaStatus.token_present ? (metaAssets.length ? `<div style="display:grid;gap:10px">${metaAssets.map(a=>`<div style="padding:12px 0;border-bottom:1px solid var(--line-2)"><div style="font-weight:600">${esc(a.page_name||a.page_id)}</div><div style="font-size:12px;color:var(--muted);margin-top:3px">Facebook ID ${esc(a.page_id)}${a.instagram_username?` · Instagram @${esc(a.instagram_username)}`:' · sem conta Instagram profissional associada'}</div></div>`).join('')}</div>` : `<div class="empty">Nenhuma Página devolvida pela Meta. Carregue em <b>Testar ligação</b> para ver o erro real, caso exista.</div>`) : `<div class="empty">Falta configurar o META_ACCESS_TOKEN no Railway.</div>`}</div>
      <div class="section-head"><h2>Associar clientes</h2></div><div class="card">${metaAssets.length?`<div style="display:grid;grid-template-columns:minmax(180px,1fr) minmax(260px,2fr) auto;gap:12px;align-items:end;margin-bottom:18px"><div class="field" style="margin:0"><label>Cliente</label><select id="meta-client-select"><option value="">Escolha um cliente</option>${clients.map(c=>`<option value="${c.id}">${esc(clientLabel(c))}${connectedIds.has(Number(c.id))?' · já associado':''}</option>`).join('')}</select></div><div class="field" style="margin:0"><label>Página / Instagram</label><select id="meta-asset-select"><option value="">Escolha uma conta Meta</option>${metaAssets.map((a,i)=>`<option value="${i}">${esc(assetLabel(a))}</option>`).join('')}</select></div><button class="btn btn-yellow" id="meta-save-map">Associar</button></div>`:''}<div id="meta-connections-list">${metaConnections.length?metaConnections.map(c=>`<div style="display:flex;justify-content:space-between;gap:14px;align-items:center;padding:13px 0;border-bottom:1px solid var(--line-2)"><div><div style="font-weight:600">${esc(c.client_company||c.client_name)}</div><div style="font-size:12px;color:var(--muted);margin-top:3px">${esc(c.page_name||c.page_id)}${c.instagram_username?` · @${esc(c.instagram_username)}`:''}</div></div><button class="btn btn-ghost btn-sm" data-meta-remove="${c.user_id}">Remover</button></div>`).join(''):`<div class="empty">Ainda não há clientes associados a contas Meta.</div>`}</div></div>`;

    document.getElementById('meta-test-btn')?.addEventListener('click', async (e) => {
      const btn=e.currentTarget, old=btn.textContent; btn.disabled=true; btn.textContent='A testar…';
      try { await loadMetaData({test:true}); notice(`Ligação Meta OK${metaIdentity?.name?` — ${metaIdentity.name}`:''}.`,'check'); await window.viewMetaReports(main); }
      catch(err){ metaTestedOk=false; notice(`Meta: ${err.message}`,'cancel'); const box=document.getElementById('meta-identity'); if(box) box.innerHTML=`<span style="color:#c03030">${esc(err.message)}</span>`; }
      finally { btn.disabled=false; btn.textContent=old; }
    });
    document.getElementById('meta-save-map')?.addEventListener('click', async()=>{ const userId=Number(document.getElementById('meta-client-select')?.value||0); const index=Number(document.getElementById('meta-asset-select')?.value); const asset=Number.isInteger(index)?metaAssets[index]:null; if(!userId||!asset)return notice('Escolha o cliente e a conta Meta.','cancel'); try{await api(`/api/meta/connections/${userId}`,{method:'PUT',body:asset});notice('Conta Meta associada ao cliente.','check');await window.viewMetaReports(main);}catch(err){notice(err.message,'cancel');} });
    main.querySelectorAll('[data-meta-remove]').forEach(btn=>btn.addEventListener('click',async()=>{const userId=Number(btn.dataset.metaRemove);if(!confirm('Remover esta associação Meta do cliente?'))return;try{await api(`/api/meta/connections/${userId}`,{method:'DELETE'});notice('Associação removida.','check');await window.viewMetaReports(main);}catch(err){notice(err.message,'cancel');}}));
  };
})();
