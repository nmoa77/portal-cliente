/* DUIT — Gestor simples de Landing Pages de Ebooks */
(() => {
  let pages=[];
  let current=null;

  function ensureModal(){
    if(document.getElementById('modal-ebook-page')) return;
    const el=document.createElement('div');
    el.className='overlay';
    el.id='modal-ebook-page';
    el.innerHTML=`<div class="modal wide" style="max-width:820px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px">
        <div><h3 id="ebook-modal-title">Nova landing page</h3><p class="lede">Só precisa de definir título, imagem e PDF. O resto mantém-se igual.</p></div>
        <button class="btn btn-icon" type="button" onclick="closeModal('modal-ebook-page')">✕</button>
      </div>
      <form id="ebookPageForm">
        <input type="hidden" id="ebook-id">
        <div class="field"><label>Título *</label><input id="ebook-title" required placeholder="6 curiosidades para olhar de outra forma."></div>
        <div class="grid g-2" style="gap:14px">
          <div class="field"><label>Imagem / capa</label><input id="ebook-image" type="file" accept="image/png,image/jpeg,image/webp"><small id="ebook-image-current" style="display:block;margin-top:6px;color:var(--muted)"></small></div>
          <div class="field"><label>PDF</label><input id="ebook-pdf" type="file" accept="application/pdf"><small id="ebook-pdf-current" style="display:block;margin-top:6px;color:var(--muted)"></small></div>
        </div>
        <div class="modal-actions"><button type="button" class="btn btn-ghost" data-close="modal-ebook-page">Cancelar</button><button type="submit" class="btn btn-yellow" id="ebook-save">Guardar</button></div>
      </form>
    </div>`;
    document.body.appendChild(el);
    document.getElementById('ebookPageForm').addEventListener('submit',savePage);
  }

  async function upload(id,kind,file){
    if(!file) return;
    const r=await fetch(`/api/crm/ebook-pages/${id}/upload/${kind}`,{method:'POST',headers:{'Content-Type':file.type||'application/octet-stream','X-File-Name':encodeURIComponent(file.name||'ficheiro')},body:file});
    const data=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(data.error||'Falha no upload.');
    return data;
  }

  async function savePage(e){
    e.preventDefault();
    const btn=document.getElementById('ebook-save');
    btn.disabled=true;btn.textContent='A guardar…';
    try{
      const id=Number(document.getElementById('ebook-id').value||0);
      const title=document.getElementById('ebook-title').value.trim();
      let page;
      if(id) page=await api(`/api/crm/ebook-pages/${id}`,{method:'PATCH',body:{title}});
      else page=await api('/api/crm/ebook-pages',{method:'POST',body:{title}});
      const img=document.getElementById('ebook-image').files[0];
      const pdf=document.getElementById('ebook-pdf').files[0];
      if(img) await upload(page.id,'image',img);
      if(pdf) await upload(page.id,'pdf',pdf);
      closeModal('modal-ebook-page');
      toast(id?'Landing page atualizada.':'Landing page criada.');
      await window.viewEbookPages(document.getElementById('main'));
    }catch(err){toast(err.message,'cancel');}
    finally{btn.disabled=false;btn.textContent='Guardar';}
  }

  window.openEbookPage=function(id){
    ensureModal();
    current=id?pages.find(p=>Number(p.id)===Number(id)):null;
    document.getElementById('ebook-modal-title').textContent=current?'Editar landing page':'Nova landing page';
    document.getElementById('ebook-id').value=current?.id||'';
    document.getElementById('ebook-title').value=current?.title||'';
    document.getElementById('ebook-image').value='';
    document.getElementById('ebook-pdf').value='';
    document.getElementById('ebook-image-current').textContent=current?.image_path?'Imagem atual definida.':'Sem imagem definida.';
    document.getElementById('ebook-pdf-current').textContent=current?.pdf_path?'PDF atual definido.':'Sem PDF definido.';
    openModal('modal-ebook-page');
  };

  window.duplicateEbookPage=async function(id){
    try{await api(`/api/crm/ebook-pages/${id}/duplicate`,{method:'POST'});toast('Landing page duplicada.');await window.viewEbookPages(document.getElementById('main'));}
    catch(e){toast(e.message,'cancel');}
  };

  window.toggleEbookPage=async function(id,active){
    try{await api(`/api/crm/ebook-pages/${id}`,{method:'PATCH',body:{active:active?1:0}});await window.viewEbookPages(document.getElementById('main'));}
    catch(e){toast(e.message,'cancel');}
  };

  window.copyEbookLink=async function(url){
    try{await navigator.clipboard.writeText(url);toast('Link copiado.');}catch(_){prompt('Copie o link:',url);}
  };

  window.viewEbookPages=async function(main){
    ensureModal();
    pages=await api('/api/crm/ebook-pages');
    const totals=pages.reduce((a,p)=>({views:a.views+Number(p.views||0),leads:a.leads+Number(p.leads||0),downloads:a.downloads+Number(p.downloads||0)}),{views:0,leads:0,downloads:0});
    main.innerHTML=`<div class="page-head"><div><div class="eyebrow">Captação de leads</div><h1>Ebook LPs</h1><p class="lede">Crie, duplique e acompanhe landing pages de ebooks. O layout e o formulário são sempre os mesmos.</p></div><div class="page-head-actions"><button class="btn btn-yellow" onclick="openEbookPage()">${svg('plus')} Nova LP</button></div></div>
      <div class="grid g-3" style="margin-bottom:18px"><div class="card stat"><div class="eyebrow">Visitas</div><div class="value">${totals.views}</div></div><div class="card stat"><div class="eyebrow">Leads</div><div class="value">${totals.leads}</div></div><div class="card stat"><div class="eyebrow">Downloads</div><div class="value">${totals.downloads}</div></div></div>
      <div class="card table-card" style="overflow-x:auto">${pages.length?`<table class="table"><thead><tr><th>Landing page</th><th>Visitas</th><th>Leads</th><th>Downloads</th><th>Conversão</th><th>Estado</th><th></th></tr></thead><tbody>${pages.map(p=>{const url=`${location.origin}/ebook/${encodeURIComponent(p.slug)}`;const conv=Number(p.views)?Math.round(Number(p.leads||0)*100/Number(p.views)):0;return `<tr><td><div style="font-weight:700">${escapeHtml(p.title)}</div><div style="font-size:12px;color:var(--muted);margin-top:3px">/ebook/${escapeHtml(p.slug)}</div></td><td>${p.views||0}</td><td>${p.leads||0}</td><td>${p.downloads||0}</td><td>${conv}%</td><td>${p.active?'<span class="pill ok">Ativa</span>':'<span class="pill muted">Inativa</span>'}</td><td><div class="crm-actions" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end"><button class="btn btn-ghost btn-sm" onclick="window.open('${url}','_blank')">Ver</button><button class="btn btn-ghost btn-sm" onclick="copyEbookLink('${url}')">Link</button><button class="btn btn-ghost btn-sm" onclick="openEbookPage(${p.id})">Editar</button><button class="btn btn-ghost btn-sm" onclick="duplicateEbookPage(${p.id})">Duplicar</button><button class="btn btn-ghost btn-sm" onclick="toggleEbookPage(${p.id},${p.active?0:1})">${p.active?'Desativar':'Ativar'}</button></div></td></tr>`}).join('')}</tbody></table>`:'<div class="empty" style="padding:36px 0">Ainda não existem landing pages.</div>'}</div>`;
  };
})();
