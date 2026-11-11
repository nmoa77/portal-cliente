(()=>{
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let bios=[],current=null,stats=null;
  async function load(){bios=await api('/api/admin/bios');return bios}
  function urlFor(b){return location.origin+'/bio/'+encodeURIComponent(b.slug)}
  async function uploadImage(bioId,file){
    const data=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)});
    const out=await api('/api/admin/bios/'+bioId+'/assets',{method:'POST',body:{filename:file.name,data_url:data}});
    return out.url;
  }
  window.duitViewBios=async function(main){
    main=main||document.getElementById('main');await load();
    main.innerHTML=`
      <div class="page-head"><div><div class="eyebrow">Microsites</div><h1>Bio</h1><p class="lede">Crie e gira páginas de bio com separadores, cards, redes sociais e estatísticas.</p></div>
      <div class="page-head-actions"><button class="btn btn-yellow" onclick="duitNewBio()">+ Nova Bio</button></div></div>
      <div class="grid g-3">${bios.map(b=>`
        <div class="card" style="padding:18px">
          <div style="display:flex;gap:12px;align-items:center">
            ${b.logo_url?'<img src="'+esc(b.logo_url)+'" style="width:54px;height:54px;object-fit:contain;border-radius:12px;background:#f6f6f6">':'<div style="width:54px;height:54px;border-radius:12px;background:#f1efe9"></div>'}
            <div style="flex:1;min-width:0"><strong style="display:block;font-size:16px">${esc(b.name)}</strong><div style="font-size:12px;color:var(--muted)">/${esc(b.slug)}</div></div>
            <span class="pill ${Number(b.is_active)?'ok':'err'}">${Number(b.is_active)?'Ativa':'Inativa'}</span>
          </div>
          <div class="grid g-2" style="gap:8px;margin:15px 0"><div class="card" style="padding:10px"><div class="eyebrow">Visitas</div><strong style="font-size:20px">${Number(b.views||0)}</strong></div><div class="card" style="padding:10px"><div class="eyebrow">Cliques</div><strong style="font-size:20px">${Number(b.clicks||0)}</strong></div></div>
          <div style="font-size:11px;color:var(--muted);margin:-4px 0 12px">${esc(b.client_company||b.client_name||'Sem cliente associado')}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-ghost btn-sm" onclick="duitEditBio(${b.id})">Editar</button><button class="btn btn-ghost btn-sm" onclick="duitBioStats(${b.id})">Estatísticas</button><a class="btn btn-ghost btn-sm" href="${esc(urlFor(b))}?preview=1" target="_blank">Pré-visualizar ↗</a><a class="btn btn-ghost btn-sm" href="${esc(urlFor(b))}" target="_blank">Abrir publicada ↗</a></div>
        </div>`).join('')||'<div class="empty">Ainda não existem Bios.</div>'}
      </div>`;
  };
  window.duitNewBio=async()=>{
    const name=prompt('Nome da Bio / empresa:');if(!name)return;
    const b=await api('/api/admin/bios',{method:'POST',body:{name,slug:name}});
    await duitEditBio(b.id);
  };
  window.duitEditBio=async id=>{
    current=await api('/api/admin/bios/'+id);showEditor(current);
  };
  function showEditor(b){
    document.getElementById('bio-editor')?.remove();
    const o=document.createElement('div');o.id='bio-editor';o.className='overlay open';
    o.innerHTML=`<div class="modal wide" style="max-width:1120px;max-height:92vh;overflow:auto">
      <div style="display:flex;justify-content:space-between;align-items:start;gap:12px"><div><div class="eyebrow">Bio</div><h3 style="margin:4px 0">${esc(b.name)}</h3><div style="font-size:12px;color:var(--muted)">${esc(urlFor(b))}</div></div><button class="btn btn-icon" onclick="document.getElementById('bio-editor').remove()">✕</button></div>
      <div class="grid g-2" style="gap:18px;margin-top:18px">
        <div>
          <div class="card" style="padding:16px">
            <div class="grid g-2" style="gap:10px"><div class="field"><label>Nome</label><input id="bio-name" value="${esc(b.name)}"></div><div class="field"><label>Slug</label><input id="bio-slug" value="${esc(b.slug)}"></div></div>
            <div class="field"><label>Cliente associado</label><select id="bio-user"><option value="">— sem cliente —</option>${(state.clients||[]).map(x=>'<option value="'+x.id+'" '+(Number(b.user_id)===Number(x.id)?'selected':'')+'>'+esc(clientOptionLabel(x))+'</option>').join('')}</select></div>
            <div class="field"><label>Descrição</label><textarea id="bio-desc" rows="4">${esc(b.description||'')}</textarea></div>
            <div class="field"><label>Logo</label><input id="bio-logo-file" type="file" accept="image/*"><div style="font-size:11px;color:var(--muted);margin-top:5px">${b.logo_url?'<img src="'+esc(b.logo_url)+'" style="max-width:100px;max-height:70px">':''}</div></div>
            <div class="grid g-3" style="gap:8px">
              ${[['background_color','Fundo'],['card_color','Cards'],['text_color','Texto'],['accent_color','Destaque'],['button_color','Botão'],['button_text_color','Texto botão']].map(x=>'<div class="field"><label>'+x[1]+'</label><input data-color="'+x[0]+'" value="'+esc(b[x[0]]||'')+'"></div>').join('')}
            </div>
            <div style="display:flex;gap:8px;margin-top:10px"><button class="btn btn-yellow" onclick="duitSaveBio(${b.id})">Guardar Bio</button><a class="btn btn-ghost" target="_blank" href="${esc(urlFor(b))}">Abrir publicada ↗</a></div>
          </div>
          <div class="section-head"><h2>Redes sociais</h2></div>
          <div class="card" style="padding:16px">
            <div id="bio-social-list">${(b.socials||[]).map(s=>socialRow(s)).join('')}</div>
            <button class="btn btn-ghost btn-sm" onclick="duitAddSocialRow()">+ Rede social</button>
            <button class="btn btn-yellow btn-sm" onclick="duitSaveSocials(${b.id})">Guardar redes</button>
          </div>
        </div>
        <div>
          <div class="section-head"><h2>Separadores</h2><button class="btn btn-yellow btn-sm" onclick="duitAddTab(${b.id})">+ Separador</button></div>
          <div id="bio-tabs-admin">${(b.tabs||[]).map(t=>tabBlock(b,t)).join('')||'<div class="empty">Crie o primeiro separador.</div>'}</div>
        </div>
      </div>
    </div>`;
    document.body.appendChild(o);
  }
  function socialRow(s={}){return '<div class="grid g-2 bio-social-row" style="gap:8px;margin-bottom:8px"><input data-platform placeholder="Instagram" value="'+esc(s.platform||'')+'"><input data-url placeholder="https://..." value="'+esc(s.url||'')+'"></div>'}
  function tabBlock(b,t){
    const cards=(b.cards||[]).filter(c=>Number(c.tab_id)===Number(t.id));
    return `<div class="card" style="padding:14px;margin-bottom:12px"><div style="display:flex;gap:8px;align-items:center"><strong style="flex:1">${esc(t.icon||'')} ${esc(t.title)}</strong><button class="btn btn-ghost btn-sm" onclick="duitEditTab(${t.id},${b.id})">Editar</button><button class="btn btn-ghost btn-sm" onclick="duitDeleteTab(${t.id},${b.id})">Apagar</button></div>
      <div style="display:grid;gap:8px;margin-top:10px">${cards.map(c=>`<div style="display:flex;gap:10px;align-items:center;padding:9px;background:var(--bg-2);border-radius:10px">${c.image_url?'<img src="'+esc(c.image_url)+'" style="width:52px;height:42px;object-fit:cover;border-radius:7px">':''}<div style="flex:1"><strong style="font-size:13px">${esc(c.title)}</strong><div style="font-size:11px;color:var(--muted)">${esc(c.subtitle||'')}</div></div><button class="btn btn-ghost btn-sm" onclick="duitEditCard(${c.id},${b.id})">Editar</button><button class="btn btn-ghost btn-sm" onclick="duitDeleteCard(${c.id},${b.id})">✕</button></div>`).join('')}</div>
      <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="duitAddCard(${b.id},${t.id})">+ Card</button></div>`;
  }
  window.duitSaveBio=async id=>{
    const body={name:document.getElementById('bio-name').value.trim(),slug:document.getElementById('bio-slug').value.trim(),description:document.getElementById('bio-desc').value.trim(),user_id:Number(document.getElementById('bio-user').value||0)||null};
    document.querySelectorAll('[data-color]').forEach(x=>body[x.dataset.color]=x.value.trim());
    const f=document.getElementById('bio-logo-file').files[0];if(f)body.logo_url=await uploadImage(id,f);
    current=await api('/api/admin/bios/'+id,{method:'PATCH',body});toast('Bio guardada.','check');showEditor(current);await load();
  };
  window.duitAddSocialRow=()=>document.getElementById('bio-social-list').insertAdjacentHTML('beforeend',socialRow());
  window.duitSaveSocials=async id=>{const items=[...document.querySelectorAll('.bio-social-row')].map(r=>({platform:r.querySelector('[data-platform]').value.trim(),url:r.querySelector('[data-url]').value.trim()})).filter(x=>x.platform&&x.url);await api('/api/admin/bios/'+id+'/socials',{method:'PUT',body:{items}});toast('Redes guardadas.','check');await duitEditBio(id)};
  window.duitAddTab=async id=>{const title=prompt('Nome do separador:');if(!title)return;const icon=prompt('Ícone/emoji (opcional):')||'';await api('/api/admin/bios/'+id+'/tabs',{method:'POST',body:{title,icon,sort_order:(current?.tabs?.length||0)+1}});await duitEditBio(id)};
  window.duitEditTab=async(tabId,bioId)=>{const t=current.tabs.find(x=>Number(x.id)===Number(tabId));const title=prompt('Nome do separador:',t?.title||'');if(!title)return;const icon=prompt('Ícone/emoji:',t?.icon||'')||'';await api('/api/admin/bio-tabs/'+tabId,{method:'PATCH',body:{title,icon}});await duitEditBio(bioId)};
  window.duitDeleteTab=async(tabId,bioId)=>{if(!confirm('Apagar este separador e os cards associados?'))return;await api('/api/admin/bio-tabs/'+tabId,{method:'DELETE'});await duitEditBio(bioId)};
  window.duitAddCard=async(bioId,tabId)=>editCardModal({bio_id:bioId,tab_id:tabId});
  window.duitEditCard=async(cardId,bioId)=>{const b=await api('/api/admin/bios/'+bioId);const c=b.cards.find(x=>Number(x.id)===Number(cardId));editCardModal(c)};
  async function editCardModal(c){
    document.getElementById('bio-card-editor')?.remove();const o=document.createElement('div');o.id='bio-card-editor';o.className='overlay open';o.innerHTML=`<div class="modal" style="max-width:650px"><h3>${c.id?'Editar':'Novo'} card</h3><div class="field"><label>Título</label><input id="bc-title" value="${esc(c.title||'')}"></div><div class="field"><label>Subtítulo</label><textarea id="bc-subtitle" rows="3">${esc(c.subtitle||'')}</textarea></div><div class="grid g-2" style="gap:10px"><div class="field"><label>Texto botão</label><input id="bc-button" value="${esc(c.button_label||'Saber mais')}"></div><div class="field"><label>Link</label><input id="bc-url" value="${esc(c.url||'')}"></div></div><div class="field"><label>Imagem</label><input id="bc-file" type="file" accept="image/*">${c.image_url?'<img src="'+esc(c.image_url)+'" style="max-width:180px;max-height:110px;margin-top:8px;border-radius:10px">':''}</div><div class="modal-actions"><button class="btn btn-ghost" onclick="document.getElementById('bio-card-editor').remove()">Cancelar</button><button class="btn btn-yellow" id="bc-save">Guardar</button></div></div>`;document.body.appendChild(o);
    document.getElementById('bc-save').onclick=async()=>{const body={tab_id:c.tab_id,title:document.getElementById('bc-title').value.trim(),subtitle:document.getElementById('bc-subtitle').value.trim(),button_label:document.getElementById('bc-button').value.trim(),url:document.getElementById('bc-url').value.trim()};const f=document.getElementById('bc-file').files[0];if(f)body.image_url=await uploadImage(c.bio_id||current.id,f);if(c.id)await api('/api/admin/bio-cards/'+c.id,{method:'PATCH',body});else await api('/api/admin/bios/'+c.bio_id+'/cards',{method:'POST',body});o.remove();await duitEditBio(c.bio_id||current.id)};
  }
  window.duitDeleteCard=async(cardId,bioId)=>{if(!confirm('Apagar este card?'))return;await api('/api/admin/bio-cards/'+cardId,{method:'DELETE'});await duitEditBio(bioId)};
  window.duitBioStats=async id=>{
    const b=bios.find(x=>Number(x.id)===Number(id))||await api('/api/admin/bios/'+id);stats=await api('/api/admin/bios/'+id+'/stats');
    document.getElementById('bio-stats')?.remove();const o=document.createElement('div');o.id='bio-stats';o.className='overlay open';o.innerHTML=`<div class="modal wide" style="max-width:900px"><div style="display:flex;justify-content:space-between"><div><div class="eyebrow">Estatísticas</div><h3>${esc(b.name)}</h3></div><button class="btn btn-icon" onclick="document.getElementById('bio-stats').remove()">✕</button></div><div class="grid g-3" style="gap:10px;margin:16px 0"><div class="card stat"><div class="eyebrow">Visitas</div><div class="value">${stats.summary.views}</div></div><div class="card stat"><div class="eyebrow">Cliques cards</div><div class="value">${stats.summary.clicks}</div></div><div class="card stat"><div class="eyebrow">Cliques redes</div><div class="value">${stats.summary.social_clicks}</div></div></div><div class="section-head"><h2>Cliques por card</h2></div><div class="card table-card"><table class="table"><thead><tr><th>Card</th><th>Cliques</th></tr></thead><tbody>${stats.cards.map(x=>'<tr><td>'+esc(x.title)+'</td><td>'+x.clicks+'</td></tr>').join('')||'<tr><td colspan="2">Sem dados</td></tr>'}</tbody></table></div>
      <div class="section-head"><h2>Redes sociais</h2></div><div class="card table-card"><table class="table"><thead><tr><th>Rede</th><th>Cliques</th></tr></thead><tbody>${stats.socials.map(x=>'<tr><td>'+esc(x.platform)+'</td><td>'+x.clicks+'</td></tr>').join('')||'<tr><td colspan="2">Sem dados</td></tr>'}</tbody></table></div>
      <div class="section-head"><h2>Últimos 30 dias</h2></div><div class="card table-card"><table class="table"><thead><tr><th>Dia</th><th>Visitas</th><th>Cliques</th></tr></thead><tbody>${stats.days.slice().reverse().map(x=>'<tr><td>'+esc(x.day)+'</td><td>'+x.views+'</td><td>'+x.clicks+'</td></tr>').join('')||'<tr><td colspan="3">Sem dados</td></tr>'}</tbody></table></div></div>`;document.body.appendChild(o);
  };
})();