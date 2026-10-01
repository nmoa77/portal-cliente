/* DUIT — gestão de modelos de email de prospeção. O preview do prospect pertence exclusivamente a prospects-crm.js. */
(()=>{
  let templates=[];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  async function loadTemplates(){
    try{templates=await api('/api/admin/prospect-email-templates')||[];}catch(_){templates=[]}
    document.dispatchEvent(new CustomEvent('duit:prospect-email-templates',{detail:{templates:templates.slice()}}));
    return templates;
  }

  function ensureManager(){
    if(document.getElementById('crm-email-template-manager'))return;
    const o=document.createElement('div');o.className='overlay';o.id='crm-email-template-manager';
    o.innerHTML=`<div class="modal wide" style="max-width:900px"><div style="display:flex;justify-content:space-between;gap:12px;align-items:start"><div><h3>Modelos de email</h3><p class="lede">Crie e edite os modelos usados na prospeção.</p></div><button class="btn btn-icon" type="button" data-et-close>✕</button></div><div id="crm-et-list" style="display:grid;gap:10px;margin:18px 0"></div><div class="card" style="padding:16px"><div class="field"><label>Nome</label><input id="crm-et-name" placeholder="Ex.: Prospecção pessoal DUIT"></div><div class="field"><label>Assunto</label><input id="crm-et-subject" placeholder="{empresa} — reparei numa coisa"></div><div class="field"><label>Texto</label><textarea id="crm-et-body" rows="10"></textarea></div><label style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" id="crm-et-default"> Definir como predefinido</label><input type="hidden" id="crm-et-id"><div class="modal-actions" style="padding-bottom:0"><button class="btn btn-ghost" type="button" id="crm-et-cancel">Limpar</button><div class="spacer"></div><button class="btn btn-yellow" type="button" id="crm-et-save">Guardar modelo</button></div></div></div>`;
    document.body.appendChild(o);
    o.querySelector('[data-et-close]').onclick=()=>o.classList.remove('open');
    o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('open')});
    document.getElementById('crm-et-cancel').onclick=clearForm;
    document.getElementById('crm-et-save').onclick=saveTemplate;
  }

  function clearForm(){
    ['crm-et-id','crm-et-name','crm-et-subject','crm-et-body'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});
    const d=document.getElementById('crm-et-default');if(d)d.checked=false;
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
    try{await api(id?'/api/admin/prospect-email-templates/'+id:'/api/admin/prospect-email-templates',{method:id?'PATCH':'POST',body});await loadTemplates();renderTemplates();clearForm();toast('Modelo guardado.','check')}catch(e){toast(e.message,'cancel')}
  }

  async function setDefault(id){
    try{await api('/api/admin/prospect-email-templates/'+id,{method:'PATCH',body:{is_default:true}});await loadTemplates();renderTemplates();toast('Modelo predefinido atualizado.','check')}catch(e){toast(e.message,'cancel')}
  }

  async function deleteTemplate(id){
    if(!confirm('Apagar este modelo de email?'))return;
    try{await api('/api/admin/prospect-email-templates/'+id,{method:'DELETE'});await loadTemplates();renderTemplates();clearForm();toast('Modelo apagado.','check')}catch(e){toast(e.message,'cancel')}
  }

  window.openProspectEmailTemplates=async()=>{
    ensureManager();
    await loadTemplates();
    renderTemplates();
    clearForm();
    document.getElementById('crm-email-template-manager').classList.add('open');
  };

  loadTemplates();
})();