/* DUIT — Modelos de email de prospeção + preview */
(()=>{
  let templates=[];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  async function loadTemplates(){
    try{templates=await api('/api/admin/prospect-email-templates')||[];}catch(_){templates=[]}
    return templates;
  }

  function defaultTemplate(){return templates.find(x=>Number(x.is_default)===1&&Number(x.is_active)===1)||templates.find(x=>Number(x.is_active)===1)||null}

  function ensureManager(){
    if(document.getElementById('crm-email-template-manager'))return;
    const o=document.createElement('div');o.className='overlay';o.id='crm-email-template-manager';
    o.innerHTML=`<div class="modal wide" style="max-width:900px"><div style="display:flex;justify-content:space-between;gap:12px;align-items:start"><div><h3>Modelos de email</h3><p class="lede">O modelo predefinido é usado automaticamente quando não escolher uma Landing Page.</p></div><button class="btn btn-icon" type="button" data-et-close>✕</button></div><div id="crm-et-list" style="display:grid;gap:10px;margin:18px 0"></div><div class="card" style="padding:16px"><div class="field"><label>Nome</label><input id="crm-et-name" placeholder="Ex.: Prospecção pessoal DUIT"></div><div class="field"><label>Assunto</label><input id="crm-et-subject" placeholder="{empresa} — reparei numa coisa"></div><div class="field"><label>Texto</label><textarea id="crm-et-body" rows="10"></textarea></div><label style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" id="crm-et-default"> Definir como predefinido</label><input type="hidden" id="crm-et-id"><div class="modal-actions" style="padding-bottom:0"><button class="btn btn-ghost" type="button" id="crm-et-cancel">Limpar</button><div class="spacer"></div><button class="btn btn-yellow" type="button" id="crm-et-save">Guardar modelo</button></div></div></div>`;
    document.body.appendChild(o);
    o.querySelector('[data-et-close]').onclick=()=>o.classList.remove('open');
    o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('open')});
    document.getElementById('crm-et-cancel').onclick=clearForm;
    document.getElementById('crm-et-save').onclick=saveTemplate;
  }

  function clearForm(){
    ['crm-et-id','crm-et-name','crm-et-subject','crm-et-body'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('crm-et-default').checked=false;
  }

  function renderTemplates(){
    const box=document.getElementById('crm-et-list');if(!box)return;
    box.innerHTML=templates.map(t=>`<div class="card" style="padding:13px 15px;display:flex;gap:12px;align-items:center"><div style="flex:1"><strong>${esc(t.name)}</strong> ${Number(t.is_default)===1?'<span class="pill ok">Predefinido</span>':''}<div style="font-size:12px;color:var(--muted);margin-top:4px">${esc(t.subject)}</div></div><button class="btn btn-ghost" type="button" data-et-edit="${t.id}">Editar</button>${Number(t.is_default)!==1?'<button class="btn btn-ghost" type="button" data-et-default="'+t.id+'">Usar por defeito</button><button class="btn btn-danger" type="button" data-et-delete="'+t.id+'">Apagar</button>':''}</div>`).join('')||'<div class="empty">Ainda não existem modelos.</div>';
    box.querySelectorAll('[data-et-edit]').forEach(b=>b.onclick=()=>editTemplate(Number(b.dataset.etEdit)));
    box.querySelectorAll('[data-et-default]').forEach(b=>b.onclick=()=>setDefault(Number(b.dataset.etDefault)));
    box.querySelectorAll('[data-et-delete]').forEach(b=>b.onclick=()=>deleteTemplate(Number(b.dataset.etDelete)));
  }

  function editTemplate(id){
    const t=templates.find(x=>Number(x.id)===id);if(!t)return;
    document.getElementById('crm-et-id').value=t.id;
    document.getElementById('crm-et-name').value=t.name||'';
    document.getElementById('crm-et-subject').value=t.subject||'';
    document.getElementById('crm-et-body').value=t.body||'';
    document.getElementById('crm-et-default').checked=Number(t.is_default)===1;
  }

  async function saveTemplate(){
    const id=Number(document.getElementById('crm-et-id').value||0),body={
      name:document.getElementById('crm-et-name').value.trim(),
      subject:document.getElementById('crm-et-subject').value.trim(),
      body:document.getElementById('crm-et-body').value.trim(),
      is_default:document.getElementById('crm-et-default').checked,
      is_active:true
    };
    if(!body.name||!body.subject||!body.body)return toast('Preencha nome, assunto e texto.','cancel');
    try{await api(id?'/api/admin/prospect-email-templates/'+id:'/api/admin/prospect-email-templates',{method:id?'PATCH':'POST',body});await loadTemplates();renderTemplates();clearForm();decorateModal();toast('Modelo guardado.','check')}catch(e){toast(e.message,'cancel')}
  }

  async function setDefault(id){
    try{await api('/api/admin/prospect-email-templates/'+id,{method:'PATCH',body:{is_default:true}});await loadTemplates();renderTemplates();decorateModal();toast('Modelo predefinido atualizado.','check')}catch(e){toast(e.message,'cancel')}
  }

  async function deleteTemplate(id){
    if(!confirm('Apagar este modelo de email?'))return;
    try{await api('/api/admin/prospect-email-templates/'+id,{method:'DELETE'});await loadTemplates();renderTemplates();clearForm();decorateModal();toast('Modelo apagado.','check')}catch(e){toast(e.message,'cancel')}
  }

  window.openProspectEmailTemplates=async()=>{
    ensureManager();await loadTemplates();renderTemplates();clearForm();document.getElementById('crm-email-template-manager').classList.add('open');
  };

  async function refreshPreview(){
    const id=Number(document.getElementById('crm-id')?.value||0),box=document.getElementById('crm-email-preview');
    if(!box||!id)return;
    const lp=Number(document.getElementById('crm-landing-page')?.value||0);
    box.innerHTML='<div style="color:var(--muted);font-size:12px">A preparar pré-visualização…</div>';
    try{
      const p=await api('/api/crm/prospects/'+id+'/email-preview?landing_page_id='+(lp||''));
      box.innerHTML=`<div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">${p.source_type==='landing_page'?'Landing Page':'Email predefinido'} · ${esc(p.source_name||'')}</div><div style="font-size:13px;margin-bottom:9px"><strong>Assunto:</strong> ${esc(p.subject||'')}</div><div style="white-space:pre-wrap;font-size:13px;line-height:1.55">${esc(p.body||'')}</div>${p.url?'<div style="margin-top:12px;font-size:12px"><strong>Link:</strong> '+esc(p.url)+'</div>':''}`;
    }catch(e){box.innerHTML='<div style="color:#b42318;font-size:12px">'+esc(e.message||'Não foi possível gerar o preview.')+'</div>'}
  }

  function decorateModal(){
    const lp=document.getElementById('crm-landing-page');if(!lp)return;
    const field=lp.closest('.field');if(!field)return;
    let info=document.getElementById('crm-email-default-info');
    if(!info){
      info=document.createElement('div');info.id='crm-email-default-info';info.style.cssText='margin-bottom:12px;padding:11px 12px;border:1px solid var(--line);border-radius:10px;background:var(--bg-2);font-size:12px';
      field.insertBefore(info,lp);
    }
    const d=defaultTemplate();
    info.innerHTML=`<div style="display:flex;gap:8px;align-items:center;justify-content:space-between"><div><strong>Email predefinido</strong><div style="color:var(--muted);margin-top:3px">${esc(d?.name||'Nenhum modelo ativo')}</div></div><button type="button" class="btn btn-ghost" onclick="openProspectEmailTemplates()">Modelos de email</button></div>`;
    const help=field.querySelector('select + div');if(help)help.textContent='Sem Landing Page usa o email predefinido. Com Landing Page usa o texto e o link associados à LP.';
    let preview=document.getElementById('crm-email-preview');
    if(!preview){
      const wrap=document.createElement('div');wrap.className='field span-2';wrap.innerHTML='<label>Pré-visualização do email</label><div id="crm-email-preview" style="border:1px solid var(--line);border-radius:12px;padding:14px;background:var(--bg-2);max-height:330px;overflow:auto"></div>';
      field.insertAdjacentElement('afterend',wrap);
    }
    if(!lp.dataset.previewBound){lp.dataset.previewBound='1';lp.addEventListener('change',()=>setTimeout(refreshPreview,60));}
    refreshPreview();
  }

  const orig=window.openCrmProspect;
  if(typeof orig==='function')window.openCrmProspect=function(id=null){orig(id);if(id)setTimeout(async()=>{if(!templates.length)await loadTemplates();decorateModal()},80)};
  loadTemplates();
})();
