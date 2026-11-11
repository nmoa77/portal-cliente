(()=>{
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const legacyIcons=[['🏋️','Ginásio'],['💪','Treino'],['🏃','Corrida'],['🚴','Cycling'],['🏊','Piscina'],['🧘','Pilates'],['🥗','Nutrição'],['📅','Agenda'],['🗓️','Calendário'],['📍','Localização'],['🗺️','Mapa'],['📚','Ebooks'],['📖','Livro'],['🎁','Ofertas'],['🔥','Em alta'],['⭐','Destaques'],['🏆','Prémios'],['🎯','Objetivos'],['👥','Comunidade'],['👨‍👩‍👧','Família'],['📲','App'],['📱','Telemóvel'],['📷','Fotografias'],['🎬','Vídeo'],['▶️','Play'],['💬','Chat'],['✉️','Email'],['☎️','Telefone'],['🔗','Links'],['🌐','Website'],['🛒','Loja'],['🤝','Parceiros'],['🎟️','Eventos'],['📝','Inscrição'],['✅','Check'],['❓','Quiz'],['🏠','Clube'],['💧','Água'],['❤️','Saúde'],['☀️','Bem-estar'],['💡','Dicas'],['⚡','Energia'],['📢','Novidades'],['🎵','Música'],['🥇','Resultados'],['📈','Progresso'],['🔔','Avisos'],['🎉','Festa'],['➕','Mais'],['🎓','Aprender'],['🌿','Natureza'],['🧠','Mind'],['🕒','Horários']];
  const ptIconTerms={users:'pessoas comunidade equipa clientes grupo',user:'pessoa cliente utilizador',phone:'telefone chamada contacto',mail:'email mensagem envelope',map:'mapa localização local',pin:'localização pin morada',calendar:'calendario agenda data',clock:'horario horas tempo',dumbbell:'ginasio treino fitness peso',heart:'saude coração amor',activity:'atividade fitness pulso',music:'musica som playlist',camera:'fotografia foto',video:'video filme',play:'reproduzir video',palette:'design cor criatividade',paintbrush:'design pintura criatividade',pen:'design escrita edição',briefcase:'empresa trabalho negocio',building:'empresa edificio',store:'loja comercio',shopping:'compras loja',gift:'oferta presente campanha',star:'destaque favorito',trophy:'premio resultado',target:'objetivo meta',flame:'em alta fogo destaque',zap:'energia rapido',globe:'website internet mundo',link:'ligacao link',book:'ebook livro',graduation:'formacao aprender educação',leaf:'natureza ambiente',brain:'mente coaching',megaphone:'anuncio novidade comunicação',bell:'aviso alerta',ticket:'evento bilhete',clipboard:'inscricao formulario',circlecheck:'check aprovado',circlehelp:'ajuda pergunta',house:'casa clube',droplets:'agua piscina',bike:'bicicleta cycling',personstanding:'pessoa treino',waves:'piscina agua'};
  function lucideNames(){
    const all=Object.keys(window.lucide?.icons||{});
    return all.filter(n=>!/^(create|icons|default)$/i.test(n));
  }
  function iconSearchBlob(name){
    const simple=String(name).replace(/([a-z])([A-Z])/g,'$1 $2').replace(/[-_]/g,' ').toLowerCase();
    const extra=Object.entries(ptIconTerms).filter(([k])=>simple.includes(k)).map(([,v])=>v).join(' ');
    return simple+' '+extra;
  }
  function iconValueHtml(value,size=24){
    const v=String(value||'');
    if(v.startsWith('lucide:')){
      const name=v.slice(7);
      return '<i data-lucide="'+esc(name)+'" style="width:'+size+'px;height:'+size+'px;stroke-width:1.8"></i>';
    }
    return esc(v||'—');
  }
  function refreshLucide(root){
    try{if(window.lucide?.createIcons)window.lucide.createIcons({icons:window.lucide.icons,root:root||document})}catch(_){}
  }
  function filteredLucideIcons(query){
    const q=String(query||'').trim().toLowerCase();
    const names=lucideNames();
    const filtered=q?names.filter(n=>iconSearchBlob(n).includes(q)):names;
    return filtered.slice(0,q?220:180);
  }
  let bios=[],draft=null,expanded=null,previewMode='mobile',iconSearch='';
  async function load(){bios=await api('/api/admin/bios');return bios}
  function urlFor(b){return String(b?.slug||'').toLowerCase()==='duit'?'https://duit.pt/bio':location.origin+'/bio/'+encodeURIComponent(b.slug)}
  async function uploadImage(bioId,file){const data=await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.onerror=rej;fr.readAsDataURL(file)});return (await api('/api/admin/bios/'+bioId+'/assets',{method:'POST',body:{filename:file.name,data_url:data}})).url}
  function toDraft(b){
    const socials=Object.fromEntries(['instagram','facebook','youtube','email'].map(k=>[k,(b.socials||[]).find(x=>x.platform===k)?.url||'']));
    b.section_title_color=b.section_title_color||b.text_color||'#111111';
    b.description_color=b.description_color||'#77736d';
    b.card_title_color=b.card_title_color||'#1d1b18';
    b.card_text_color=b.card_text_color||'#77736d';
    b.social_bg_color=b.social_bg_color||'#242424';
    b.social_icon_color=b.social_icon_color||'#ffffff';
    return {...b,profile_width:Number(b.profile_width||340),card_width:Number(b.card_width||280),socials,
      sections:(b.tabs||[]).map(t=>({id:t.id,title:t.title,icon:t.icon||'',enabled:Number(t.is_active)!==0,cards:(b.cards||[]).filter(c=>Number(c.tab_id)===Number(t.id)).map(c=>({...c,enabled:Number(c.is_active)!==0}))}))};
  }
  function move(arr,i,d){const n=[...arr],j=i+d;if(j<0||j>=n.length)return n;[n[i],n[j]]=[n[j],n[i]];return n}
  function field(label,html){return '<label style="display:block;font-size:12px;font-weight:700;color:#59616b;margin-bottom:12px">'+label+html+'</label>'}
  function socialIcon(name){
    const common='width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"';
    if(name==='instagram')return '<svg '+common+'><rect x="2.5" y="2.5" width="19" height="19" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.6" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>';
    if(name==='facebook')return '<svg '+common+'><path d="M15.5 3.5h-2.2c-2.2 0-3.3 1.4-3.3 3.6V10H7v3h3v8h3.4v-8h3l.5-3h-3.5V7.6c0-.7.3-1.1 1.1-1.1h2V3.5Z" fill="currentColor" stroke="none"/></svg>';
    if(name==='youtube')return '<svg '+common+'><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none"/></svg>';
    return '<svg '+common+'><rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="m3 7 9 7 9-7"/></svg>';
  }
  window.duitViewBios=async main=>{
    main=main||document.getElementById('main');await load();
    main.innerHTML='<div class="page-head"><div><div class="eyebrow">Microsites</div><h1>Bio</h1><p class="lede">Separadores, cartões e estatísticas para páginas de bio.</p></div><div class="page-head-actions"><button class="btn btn-yellow" onclick="duitNewBio()">+ Nova Bio</button></div></div>'+
      '<div class="grid g-3">'+(bios.map(b=>'<div class="card" style="padding:18px"><div style="display:flex;gap:12px;align-items:center">'+
      (b.logo_url?'<img src="'+esc(b.logo_url)+'" style="width:58px;height:58px;object-fit:contain;border-radius:14px;background:#f7f7f7;padding:6px">':'<div style="width:58px;height:58px;border-radius:14px;background:#f3f3f3"></div>')+
      '<div style="flex:1"><strong style="font-size:16px">'+esc(b.name)+'</strong><div style="font-size:12px;color:var(--muted)">'+esc(b.client_company||b.client_name||'Sem cliente associado')+'</div><div style="font-size:11px;color:var(--muted)">/bio/'+esc(b.slug)+'</div></div></div>'+
      '<div class="grid g-2" style="gap:8px;margin:14px 0"><div class="card" style="padding:10px"><div class="eyebrow">Visitas</div><b style="font-size:21px">'+Number(b.views||0)+'</b></div><div class="card" style="padding:10px"><div class="eyebrow">Cliques</div><b style="font-size:21px">'+Number(b.clicks||0)+'</b></div></div>'+
      '<div style="display:flex;gap:7px;flex-wrap:wrap"><button class="btn btn-ghost btn-sm" onclick="duitEditBio('+b.id+')">Editar</button><button class="btn btn-ghost btn-sm" onclick="duitBioStats('+b.id+',30)">Estatísticas</button><a class="btn btn-ghost btn-sm" target="_blank" href="'+esc(urlFor(b))+'">Ver página ↗</a></div></div>').join('')||'<div class="empty">Ainda não existem Bios.</div>')+'</div>';
  };
  window.duitNewBio=async()=>{const name=prompt('Nome da Bio / empresa:');if(!name)return;const b=await api('/api/admin/bios',{method:'POST',body:{name,slug:name}});await duitEditBio(b.id)};
  window.duitEditBio=async id=>{const b=await api('/api/admin/bios/'+id);draft=toDraft(b);expanded=draft.sections[0]?.id||null;previewMode='mobile';renderEditor()};
  function renderEditor(){
    const main=document.getElementById('main'),b=draft;if(!b)return;
    main.innerHTML=`
      <style>
        .bio-builder .bio-card{border:1px solid #edf0f3;border-radius:22px;box-shadow:0 8px 28px rgba(10,25,50,.045);padding:24px;background:#fff}
        .bio-builder .bio-field{width:100%;padding:12px 14px;border:1px solid #e4e7eb;background:#fff;border-radius:13px;font:inherit;box-sizing:border-box;outline-color:#e0b126;margin-top:6px}
        .bio-builder .bio-surface{background:#f8fafc;border:1px solid #edf0f3;border-radius:17px;padding:16px}
        .bio-builder .bio-preview h3,.bio-builder .bio-preview h4,.bio-builder .bio-preview .bio-preview-title{font-family:Montserrat,Arial,sans-serif;font-weight:800}
        .bio-builder .bio-preview{font-family:Montserrat,Arial,sans-serif;border-radius:24px;overflow:hidden}
        .bio-preview-card{background:#fff;color:#1d1b18;border-radius:14px;overflow:hidden;box-shadow:0 5px 17px rgba(29,27,24,.12)}
        .bio-preview-card-list{display:flex;flex-wrap:nowrap;gap:16px;align-items:flex-start;overflow-x:auto;padding:3px 3px 16px}
        .bio-preview-card-list>.bio-preview-card{flex:0 0 min(100%,min(var(--preview-card-width),280px));min-width:0}
        .bio-preview-cta{display:inline-flex;align-items:center;gap:10px;padding:10px 15px;border-radius:9px;color:#fff;text-decoration:none;font-size:12px;font-weight:700;margin-top:13px}
      </style>
      <div class="bio-builder">
        <div class="page-head"><div><h1>Bio</h1><p class="lede">Separadores e cartões · ${esc(urlFor(b))}</p></div><div class="page-head-actions"><button class="btn btn-ghost" onclick="duitBioStats(${b.id},30)">Estatísticas ↗</button><a class="btn btn-ghost" target="_blank" href="${esc(urlFor(b))}">Ver página ↗</a><button class="btn btn-yellow" onclick="duitSaveBioConfig()">Guardar e publicar</button></div></div>
        <div style="display:grid;grid-template-columns:minmax(430px,1fr) minmax(390px,1fr);gap:20px;align-items:start">
          <div>
            <section class="bio-card">
              <h2 style="margin-top:0">Identidade</h2>
              ${field('Nome','<input class="bio-field" id="bio-title" value="'+esc(b.name)+'">')}
              ${field('Cliente associado','<select class="bio-field" id="bio-client"><option value="">— sem cliente —</option>'+(state.clients||[]).map(x=>'<option value="'+x.id+'" '+(Number(b.user_id)===Number(x.id)?'selected':'')+'>'+esc(clientOptionLabel(x))+'</option>').join('')+'</select>')}
              ${field('Descrição','<textarea class="bio-field" id="bio-description" rows="4">'+esc(b.description||'')+'</textarea>')}
              <div style="display:flex;align-items:center;gap:18px;background:#f8f9fb;border-radius:17px;padding:16px;flex-wrap:wrap;margin-bottom:18px">
                ${b.logo_url?'<img src="'+esc(b.logo_url)+'" style="width:86px;height:86px;object-fit:contain;background:#101b2c;border-radius:17px;padding:12px">':''}
                <div style="flex:1 1 190px"><strong style="display:block;margin-bottom:8px">Logótipo da Bio</strong><input id="bio-logo-file" type="file" accept="image/*"></div>
              </div>
              ${field('Ou introduza o URL do logótipo','<input class="bio-field" id="bio-logo-url" value="'+esc(b.logo_url||'')+'">')}
              <h3>Cores da Bio</h3>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
                ${[['background_color','Fundo'],['text_color','Texto'],['description_color','Descrição Bio'],['section_title_color','Título separador'],['card_title_color','Título caixas'],['card_text_color','Texto caixas'],['accent_color','Destaque'],['social_bg_color','Fundo redes'],['social_icon_color','Ícones redes']].map(([k,l])=>'<div class="bio-surface"><label style="font-size:12px;font-weight:700">'+l+'</label><div style="display:flex;gap:8px;align-items:center;margin-top:7px"><input data-color-picker="'+k+'" type="color" value="'+esc(b[k]||'#000000')+'" style="width:42px;height:42px;border:0;background:transparent"><input class="bio-field" data-color-text="'+k+'" value="'+esc(b[k]||'')+'" style="margin:0;font-family:monospace"></div></div>').join('')}
              </div>
              <h3>Redes sociais</h3>
              ${['instagram','facebook','youtube','email'].map(k=>field(k,'<input class="bio-field" data-social="'+k+'" value="'+esc(b.socials[k]||'')+'" placeholder="'+(k==='email'?'email@exemplo.pt':'https://…')+'">')).join('')}
              <h3>Layout</h3>
              <label style="font-size:12px;font-weight:700;display:block;margin-bottom:12px">Largura do perfil no desktop: <span id="bio-profile-val">${b.profile_width}</span>px<input id="bio-profile-width" type="range" min="260" max="480" step="10" value="${b.profile_width}" style="width:100%"></label>
              <label style="font-size:12px;font-weight:700;display:block">Largura mínima dos cartões: <span id="bio-card-val">${b.card_width}</span>px<input id="bio-card-width" type="range" min="220" max="600" step="10" value="${b.card_width}" style="width:100%"></label>
            </section>
            <section class="bio-card" style="margin-top:18px">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:16px"><h2 style="margin:0">Separadores</h2><button class="btn btn-yellow" onclick="duitAddBioSection()">+ Separador</button></div>
              <div id="bio-section-list"></div>
            </section>
          </div>
          <aside class="bio-card" style="position:sticky;top:15px;min-width:0">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><h2 style="margin:0">Pré-visualização</h2><div style="display:flex;gap:6px"><button class="btn btn-small" id="bio-prev-mobile" onclick="duitSetBioPreview('mobile')">Mobile</button><button class="btn btn-small" id="bio-prev-desktop" onclick="duitSetBioPreview('desktop')">Desktop</button></div></div>
            <div id="bio-preview-wrap" style="overflow-x:auto;padding:14px 4px"></div>
            <p class="muted" style="font-size:12px">As alterações só são publicadas depois de guardar.</p>
          </aside>
        </div>
      </div>`;
    bindIdentity();renderSections();renderPreview();
  }
  function syncDraft(){
    const b=draft;b.name=document.getElementById('bio-title')?.value||b.name;b.user_id=Number(document.getElementById('bio-client')?.value||0)||null;b.description=document.getElementById('bio-description')?.value||'';b.logo_url=document.getElementById('bio-logo-url')?.value||b.logo_url;
    document.querySelectorAll('[data-color-text]').forEach(x=>b[x.dataset.colorText]=x.value);
    document.querySelectorAll('[data-social]').forEach(x=>b.socials[x.dataset.social]=x.value);
    b.profile_width=Number(document.getElementById('bio-profile-width')?.value||b.profile_width);b.card_width=Number(document.getElementById('bio-card-width')?.value||b.card_width);
  }
  function bindIdentity(){
    document.querySelectorAll('#bio-title,#bio-description,#bio-logo-url,[data-color-text],[data-social],#bio-profile-width,#bio-card-width,#bio-client').forEach(el=>el.addEventListener('input',()=>{syncDraft();if(el.id==='bio-profile-width')document.getElementById('bio-profile-val').textContent=el.value;if(el.id==='bio-card-width')document.getElementById('bio-card-val').textContent=el.value;renderPreview()}));
    const lf=document.getElementById('bio-logo-file');if(lf)lf.addEventListener('change',async()=>{const f=lf.files?.[0];if(!f)return;draft.logo_url=await uploadImage(draft.id,f);document.getElementById('bio-logo-url').value=draft.logo_url;renderEditor()});
    document.querySelectorAll('[data-color-picker]').forEach(el=>el.addEventListener('input',()=>{const t=document.querySelector('[data-color-text="'+el.dataset.colorPicker+'"]');t.value=el.value;syncDraft();renderPreview()}));
  }
  function renderSections(){
    const box=document.getElementById('bio-section-list');if(!box)return;
    box.innerHTML=draft.sections.map((s,i)=>`<article style="padding:14px;border:1px solid #dfe3e8;border-radius:12px;margin-bottom:14px">
      <div style="display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap">
        <button type="button" onclick="duitToggleBioSection('${s.id}')" style="border:0;background:transparent;font-weight:800;font-size:16px;cursor:pointer;text-align:left">${String(expanded)===String(s.id)?'▾':'▸'} ${iconValueHtml(s.icon,20)} ${esc(s.title||'Novo separador')} (${s.cards.length})</button>
        <div style="display:flex;gap:5px;align-items:center"><label style="font-size:12px"><input type="checkbox" ${s.enabled?'checked':''} onchange="duitSectionVisible('${s.id}',this.checked)"> Visível</label><button class="btn btn-small" ${i===0?'disabled':''} onclick="duitMoveSection(${i},-1)">↑</button><button class="btn btn-small" ${i===draft.sections.length-1?'disabled':''} onclick="duitMoveSection(${i},1)">↓</button></div>
      </div>
      ${String(expanded)===String(s.id)?sectionExpanded(s):''}
    </article>`).join('')||'<div class="empty">Crie o primeiro separador.</div>';
    refreshLucide(box);
  }
  function sectionExpanded(s){
    const filtered=filteredLucideIcons(iconSearch);
    return `<div style="margin-top:16px">
      ${field('Nome do separador','<input class="bio-field" placeholder="Nome do separador" value="'+esc(s.title)+'" oninput="duitEditSectionTitle(\''+s.id+'\',this.value)">')}
      <label style="font-size:12px;font-weight:700">Ícone (opcional)</label><div style="display:flex;gap:8px;align-items:center;margin:8px 0"><span class="bio-current-icon" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:28px">${iconValueHtml(s.icon,28)}</span><button class="btn btn-small" onclick="duitEditSection('${s.id}',{icon:''})">Sem ícone</button></div>
      <input class="bio-field" placeholder="Pesquisar: pessoas, telefone, design, música, loja..." value="${esc(iconSearch)}" oninput="duitBioIconSearch('${s.id}',this.value)">
      <div style="font-size:11px;color:var(--muted);margin-top:6px">Biblioteca Lucide · mais de 2.000 ícones. Mostro até 220 resultados por pesquisa.</div>
      <div id="bio-icon-grid-${String(s.id).replace(/[^a-zA-Z0-9_-]/g,'_')}" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(50px,1fr));gap:7px;max-height:310px;overflow:auto;margin-top:9px;padding-right:3px">${filtered.map(name=>{const val='lucide:'+name;return '<button title="'+esc(name)+'" aria-label="'+esc(name)+'" onclick="duitEditSection(\''+s.id+'\',{icon:\''+val+'\'})" style="height:48px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:'+(s.icon===val?'2px solid #d3a000':'1px solid #ddd')+';border-radius:9px;background:'+(s.icon===val?'#fff3c2':'white')+';color:#1d1b18"><i data-lucide="'+esc(name)+'" style="width:22px;height:22px;stroke-width:1.8"></i></button>'}).join('')}</div>
      <div style="display:flex;justify-content:space-between;gap:8px;margin:16px 0"><button class="btn btn-yellow" onclick="duitAddBioCard('${s.id}')">+ Adicionar cartão</button><button class="btn btn-small" onclick="duitDeleteBioSection('${s.id}')">Eliminar separador</button></div>
      ${s.cards.map((c,j)=>cardEditor(s,c,j)).join('')}
    </div>`;
  }
  function cardEditor(s,c,j){return `<div class="bio-surface" style="margin-bottom:12px">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:9px"><b>Cartão ${j+1}</b><div style="display:flex;gap:6px;align-items:center"><label style="font-size:12px"><input type="checkbox" ${c.enabled?'checked':''} onchange="duitCardPatch('${s.id}','${c.id}',{enabled:this.checked})"> Visível</label><button class="btn btn-small" ${j===0?'disabled':''} onclick="duitMoveCard('${s.id}',${j},-1)">↑</button><button class="btn btn-small" ${j===s.cards.length-1?'disabled':''} onclick="duitMoveCard('${s.id}',${j},1)">↓</button><button class="btn btn-small" onclick="duitDeleteBioCard('${s.id}','${c.id}')">Eliminar</button></div></div>
    <div style="display:flex;gap:12px;align-items:center;background:#fff;border-radius:14px;padding:12px;margin:12px 0">${c.image_url?'<img src="'+esc(c.image_url)+'" style="width:95px;height:75px;object-fit:contain">':''}<div style="flex:1"><strong>Imagem do cartão</strong><input type="file" accept="image/*" onchange="duitCardImage('${s.id}','${c.id}',this.files[0])"></div></div>
    ${field('Ou URL da imagem','<input class="bio-field" value="'+esc(c.image_url||'')+'" oninput="duitCardPatch(\''+s.id+'\',\''+c.id+'\',{image_url:this.value})">')}
    ${field('Título','<input class="bio-field" value="'+esc(c.title||'')+'" oninput="duitCardPatch(\''+s.id+'\',\''+c.id+'\',{title:this.value})">')}
    ${field('Subtítulo','<textarea class="bio-field" rows="3" oninput="duitCardPatch(\''+s.id+'\',\''+c.id+'\',{subtitle:this.value})">'+esc(c.subtitle||'')+'</textarea>')}
    ${field('Texto do botão','<input class="bio-field" maxlength="60" value="'+esc(c.button_label||'VER MAIS')+'" oninput="duitCardPatch(\''+s.id+'\',\''+c.id+'\',{button_label:this.value})">')}
    ${field('Link','<input class="bio-field" value="'+esc(c.url||'')+'" oninput="duitCardPatch(\''+s.id+'\',\''+c.id+'\',{url:this.value})">')}
  </div>`}
  window.duitToggleBioSection=id=>{expanded=String(expanded)===String(id)?null:id;renderSections()};
  window.duitBioIconSearch=(id,v)=>{
    iconSearch=v;
    const s=draft.sections.find(x=>String(x.id)===String(id));if(!s)return;
    const grid=document.getElementById('bio-icon-grid-'+String(id).replace(/[^a-zA-Z0-9_-]/g,'_'));if(!grid)return;
    const filtered=filteredLucideIcons(iconSearch);
    grid.innerHTML=filtered.map(name=>{const val='lucide:'+name;return '<button title="'+esc(name)+'" aria-label="'+esc(name)+'" onclick="duitEditSection(\''+s.id+'\',{icon:\''+val+'\'})" style="height:48px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:'+(s.icon===val?'2px solid #d3a000':'1px solid #ddd')+';border-radius:9px;background:'+(s.icon===val?'#fff3c2':'white')+';color:#1d1b18"><i data-lucide="'+esc(name)+'" style="width:22px;height:22px;stroke-width:1.8"></i></button>'}).join('');
    refreshLucide(grid);
  };
  window.duitEditSectionTitle=(id,value)=>{const s=draft.sections.find(x=>String(x.id)===String(id));if(!s)return;s.title=value;renderPreview()};
  window.duitEditSection=(id,p)=>{const s=draft.sections.find(x=>String(x.id)===String(id));Object.assign(s,p);renderSections();renderPreview()};
  window.duitSectionVisible=(id,v)=>duitEditSection(id,{enabled:v});
  window.duitMoveSection=(i,d)=>{draft.sections=move(draft.sections,i,d);renderSections();renderPreview()};
  window.duitAddBioSection=()=>{const id='new-'+Date.now();draft.sections.push({id,title:'',icon:'',enabled:true,cards:[]});expanded=id;renderSections();renderPreview()};
  window.duitDeleteBioSection=id=>{if(!confirm('Eliminar separador e todos os seus cartões?'))return;draft.sections=draft.sections.filter(x=>String(x.id)!==String(id));renderSections();renderPreview()};
  window.duitAddBioCard=id=>{const s=draft.sections.find(x=>String(x.id)===String(id));s.cards.push({id:'new-'+Date.now()+'-'+Math.random(),title:'',subtitle:'',button_label:'VER MAIS',url:'',image_url:'',enabled:true});renderSections();renderPreview()};
  window.duitCardPatch=(sid,cid,p)=>{const s=draft.sections.find(x=>String(x.id)===String(sid)),c=s.cards.find(x=>String(x.id)===String(cid));Object.assign(c,p);renderPreview()};
  window.duitMoveCard=(sid,i,d)=>{const s=draft.sections.find(x=>String(x.id)===String(sid));s.cards=move(s.cards,i,d);renderSections();renderPreview()};
  window.duitDeleteBioCard=(sid,cid)=>{if(!confirm('Eliminar cartão?'))return;const s=draft.sections.find(x=>String(x.id)===String(sid));s.cards=s.cards.filter(x=>String(x.id)!==String(cid));renderSections();renderPreview()};
  window.duitCardImage=async(sid,cid,file)=>{if(!file)return;const url=await uploadImage(draft.id,file);duitCardPatch(sid,cid,{image_url:url});renderSections()};
  window.duitSetBioPreview=m=>{previewMode=m;renderPreview()};
  function previewPayload(){
    const b=draft;
    return {
      id:b.id,name:b.name,slug:b.slug,description:b.description,logo_url:b.logo_url,
      background_color:b.background_color,text_color:b.text_color,accent_color:b.accent_color,
      section_title_color:b.section_title_color,description_color:b.description_color,
      card_title_color:b.card_title_color,card_text_color:b.card_text_color,
      social_bg_color:b.social_bg_color,social_icon_color:b.social_icon_color,
      profile_width:b.profile_width,card_width:b.card_width,
      socials:['instagram','facebook','youtube','email'].filter(k=>b.socials?.[k]).map((k,i)=>({id:'preview-social-'+i,platform:k,url:b.socials[k]})),
      tabs:(b.sections||[]).map((s,i)=>({id:s.id,title:s.title,icon:s.icon||'',sort_order:i,is_active:s.enabled===false?0:1})),
      cards:(b.sections||[]).flatMap((s,si)=>(s.cards||[]).map((card,ci)=>({
        id:card.id,tab_id:s.id,title:card.title||'',subtitle:card.subtitle||'',
        button_label:card.button_label||'VER MAIS',url:card.url||'',image_url:card.image_url||'',
        sort_order:ci,is_active:card.enabled===false?0:1
      })))
    };
  }

  function postPreview(){
    const iframe=document.getElementById('bio-live-preview');
    if(!iframe?.contentWindow)return;
    iframe.contentWindow.postMessage({type:'duit-bio-preview-data',bio:previewPayload()},'*');
  }

  function renderPreview(){
    syncDraft();
    const w=document.getElementById('bio-preview-wrap');if(!w)return;
    const mobile=previewMode==='mobile';
    document.getElementById('bio-prev-mobile').style.background=mobile?'#e0b126':'';
    document.getElementById('bio-prev-desktop').style.background=!mobile?'#e0b126':'';

    let iframe=document.getElementById('bio-live-preview');
    if(!iframe){
      iframe=document.createElement('iframe');
      iframe.id='bio-live-preview';
      iframe.title='Pré-visualização da Bio';
      iframe.src=urlFor(draft)+(urlFor(draft).includes('?')?'&':'?')+'preview=1';
      iframe.style.border='0';
      iframe.style.display='block';
      iframe.style.margin='0 auto';
      iframe.style.background='transparent';
      iframe.style.minHeight='720px';
      iframe.style.borderRadius='20px';
      iframe.style.transition='width .2s ease';
      iframe.addEventListener('load',()=>setTimeout(postPreview,50));
      w.innerHTML='';
      w.appendChild(iframe);
    }
    iframe.style.width=mobile?'390px':'100%';
    iframe.style.maxWidth=mobile?'390px':'1100px';
    postPreview();
  }

  if(!window.__duitBioPreviewHeightBound){
    window.__duitBioPreviewHeightBound=true;
    window.addEventListener('message',e=>{
      if(e?.data?.type!=='duit-bio-preview-height')return;
      const iframe=document.getElementById('bio-live-preview');if(!iframe)return;
      const h=Math.max(650,Math.min(2400,Number(e.data.height)||720));
      iframe.style.height=h+'px';
    });
  }

  window.duitSaveBioConfig=async()=>{
    syncDraft();
    const f=document.getElementById('bio-logo-file')?.files?.[0];if(f){draft.logo_url=await uploadImage(draft.id,f)}
    const body={user_id:draft.user_id,name:draft.name,slug:draft.slug,description:draft.description,logo_url:draft.logo_url,background_color:draft.background_color,text_color:draft.text_color,description_color:draft.description_color,section_title_color:draft.section_title_color,card_title_color:draft.card_title_color,card_text_color:draft.card_text_color,accent_color:draft.accent_color,social_bg_color:draft.social_bg_color,social_icon_color:draft.social_icon_color,profile_width:draft.profile_width,card_width:draft.card_width,socials:draft.socials,sections:draft.sections.map(s=>({...s,id:String(s.id).startsWith('new-')?null:s.id,cards:s.cards.map(c=>({...c,id:String(c.id).startsWith('new-')?null:c.id}))}))};
    draft=toDraft(await api('/api/admin/bios/'+draft.id+'/config',{method:'PUT',body}));expanded=draft.sections[0]?.id||null;toast('Alterações guardadas e publicadas.','check');renderEditor();await load();
  };
  window.duitBioStats=async(id,days=30)=>{
    const b=(bios.find(x=>Number(x.id)===Number(id)))||await api('/api/admin/bios/'+id),s=await api('/api/admin/bios/'+id+'/stats?days='+days),main=document.getElementById('main');
    const rate=s.summary.views?Math.round((s.summary.clicks/s.summary.views)*1000)/10:0;
    const bar=(n,total)=>'<div style="height:7px;background:#f0eee9;border-radius:20px;overflow:hidden;margin-top:6px"><div style="width:'+Math.min(100,total?n/total*100:0)+'%;background:#D5AA39;height:100%"></div></div>';
    main.innerHTML='<div class="page-head"><div><h1>Estatísticas da Bio</h1><p class="lede">'+esc(b.name)+' · '+esc(urlFor(b))+'</p></div><button class="btn btn-ghost" onclick="duitEditBio('+id+')">← Voltar à Bio</button></div>'+
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:20px 0">'+[1,7,30,90].map(n=>'<button class="btn '+(n===days?'btn-yellow':'btn-ghost')+'" onclick="duitBioStats('+id+','+n+')">'+(n===1?'Hoje':'Últimos '+n+' dias')+'</button>').join('')+'</div>'+
    '<div class="grid g-4"><div class="card stat"><div class="eyebrow">Visualizações</div><div class="value">'+s.summary.views+'</div><div class="delta">Aberturas da página</div></div><div class="card stat"><div class="eyebrow">Visitantes únicos</div><div class="value">'+s.summary.unique_visitors+'</div><div class="delta">Estimativa diária sem cookies</div></div><div class="card stat"><div class="eyebrow">Cliques em cartões</div><div class="value">'+s.summary.clicks+'</div><div class="delta">Conteúdos e ligações</div></div><div class="card stat"><div class="eyebrow">Taxa de cliques</div><div class="value">'+rate+'%</div><div class="delta">Cliques ÷ visitas</div></div></div>'+
    dailyChart(s.daily,days)+
    '<div class="grid g-2" style="gap:18px;margin-top:20px">'+
    statList('Cartões com mais cliques',s.cards.map(x=>({name:x.title,sub:x.section,total:x.clicks})),s.summary.clicks,bar)+
    statList('Origem das visitas',s.sources.map(x=>({name:x.name,total:x.total})),s.summary.views,bar)+
    statList('Dispositivos',s.devices.map(x=>({name:x.name,total:x.total})),s.summary.views,bar)+
    statList('Cliques nas redes sociais',s.socials.map(x=>({name:x.platform,total:x.clicks})),s.summary.social_clicks,bar)+'</div>';
  };
  function dailyChart(rows,days){
    const max=Math.max(1,...rows.map(x=>Number(x.views||0)));
    return '<section class="card" style="margin-top:20px"><h2 style="margin-bottom:4px">Evolução das visitas</h2><p class="muted" style="margin-top:0">Visitas por dia · passe o rato nas barras para ver o total.</p><div style="display:flex;align-items:end;gap:'+(days>30?2:7)+'px;height:220px;overflow-x:auto;padding:10px 0 0;border-bottom:1px solid #ebe8e2">'+rows.map((d,i)=>'<div title="'+esc(d.day)+': '+Number(d.views||0)+' visitas, '+Number(d.clicks||0)+' cliques" style="flex:1 0 auto;min-width:'+(days>=90?5:days>=30?12:25)+'px;max-width:'+(days===1?80:40)+'px;height:100%;display:flex;flex-direction:column;justify-content:flex-end;gap:3px;align-items:center"><div style="height:'+Math.max(2,Number(d.views||0)/max*170)+'px;width:85%;background:#D5AA39;border-radius:5px 5px 0 0"></div><small class="muted" style="font-size:9px;white-space:nowrap">'+(days<=7?String(d.day).slice(8):(i%Math.ceil(days/10)===0?String(d.day).slice(5):''))+'</small></div>').join('')+'</div></section>';
  }
  function statList(title,rows,total,bar){return '<section class="card"><h2>'+esc(title)+'</h2>'+(rows.length?rows.map(x=>'<div style="padding:10px 0;border-bottom:1px solid #f0eeea"><div style="display:flex;justify-content:space-between;gap:14px"><span><strong>'+esc(x.name||'—')+'</strong>'+(x.sub?'<small class="muted" style="display:block">'+esc(x.sub)+'</small>':'')+'</span><strong>'+Number(x.total||0)+'</strong></div>'+bar(Number(x.total||0),total)+'</div>').join(''):'<p class="muted">Sem dados neste período.</p>')+'</section>'}
})();