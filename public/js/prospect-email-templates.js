/* DUIT — repositório de abordagens comerciais para prospeção (email + DM). */
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
    o.innerHTML=`<div class="modal wide" style="max-width:940px">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:start">
        <div><h3>Abordagens comerciais</h3><p class="lede">Guarde abordagens reutilizáveis para email e Instagram. Escolhe uma no prospect e adapta apenas quando necessário.</p></div>
        <button class="btn btn-icon" type="button" data-et-close>✕</button>
      </div>
      <div id="crm-et-list" style="display:grid;gap:10px;margin:18px 0"></div>
      <div class="card" style="padding:16px">
        <div class="field"><label>Nome da abordagem</label><input id="crm-et-name" placeholder="Ex.: Oportunidade concreta"></div>
        <div class="field"><label>Quando usar</label><textarea id="crm-et-description" rows="2" placeholder="Ex.: Empresas com bom trabalho, mas comunicação pouco consistente."></textarea></div>
        <div class="field"><label>Assunto do email</label><input id="crm-et-subject" placeholder="{empresa} — reparei numa oportunidade"></div>
        <div class="field"><label>Email · versão texto <span style="font-weight:400;color:var(--muted)">(opcional se usar HTML)</span></label><textarea id="crm-et-body" rows="7"></textarea></div><div class="field"><label>Email · HTML visual</label><textarea id="crm-et-html" rows="14" spellcheck="false" style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px"></textarea><small style="display:block;color:var(--muted);margin-top:5px">Se preencher este campo, o envio usa esta versão HTML. O texto acima fica como fallback.</small></div>
        <div class="field"><label>Instagram / DM</label><textarea id="crm-et-dm" rows="6"></textarea></div>
        <div style="font-size:12px;color:var(--muted);line-height:1.5;margin-top:8px">Variáveis: <code>{empresa}</code>, <code>{nome}</code>, <code>{setor}</code>, <code>{observacao}</code>, <code>{oportunidade}</code>, <code>{ideia}</code>, <code>{sector_headline}</code>, <code>{sector_subheadline}</code>, <code>{hero}</code>, <code>{imagem_1}</code>–<code>{imagem_4}</code>, <code>{vantagem_1}</code>–<code>{vantagem_4}</code> e <code>{vantagem_1_texto}</code>–<code>{vantagem_4_texto}</code>.</div>
        <label style="display:flex;gap:8px;align-items:center;margin-top:12px"><input type="checkbox" id="crm-et-default"> Definir como abordagem predefinida</label>
        <input type="hidden" id="crm-et-id">
        <div class="modal-actions" style="padding-bottom:0"><button class="btn btn-ghost" type="button" id="crm-et-cancel">Limpar</button><div class="spacer"></div><button class="btn btn-yellow" type="button" id="crm-et-save">Guardar abordagem</button></div>
      </div>
    </div>`;
    document.body.appendChild(o);
    o.querySelector('[data-et-close]').onclick=()=>o.classList.remove('open');
    o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('open')});
    document.getElementById('crm-et-cancel').onclick=clearForm;
    document.getElementById('crm-et-save').onclick=saveTemplate;
  }

  function clearForm(){
    ['crm-et-id','crm-et-name','crm-et-description','crm-et-subject','crm-et-body','crm-et-html','crm-et-dm'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});
    const d=document.getElementById('crm-et-default');if(d)d.checked=false;
  }

  function renderTemplates(){
    const box=document.getElementById('crm-et-list');if(!box)return;
    box.innerHTML=templates.map(t=>`<div class="card" style="padding:13px 15px;display:flex;gap:12px;align-items:center">
      <div style="flex:1;min-width:0"><strong>${esc(t.name)}</strong> ${Number(t.is_default)===1?'<span class="pill ok">Predefinida</span>':''}
        <div style="font-size:12px;color:var(--muted);margin-top:4px">${esc(t.description||t.subject||'')}</div>
      </div>
      <button class="btn btn-ghost" type="button" data-et-edit="${t.id}">Editar</button>
      ${Number(t.is_default)!==1?'<button class="btn btn-ghost" type="button" data-et-default="'+t.id+'">Usar por defeito</button><button class="btn btn-danger" type="button" data-et-delete="'+t.id+'">Apagar</button>':''}
    </div>`).join('')||'<div class="empty">Ainda não existem abordagens.</div>';
    box.querySelectorAll('[data-et-edit]').forEach(b=>b.onclick=()=>editTemplate(Number(b.dataset.etEdit)));
    box.querySelectorAll('[data-et-default]').forEach(b=>b.onclick=()=>setDefault(Number(b.dataset.etDefault)));
    box.querySelectorAll('[data-et-delete]').forEach(b=>b.onclick=()=>deleteTemplate(Number(b.dataset.etDelete)));
  }

  function editTemplate(id){
    const t=templates.find(x=>Number(x.id)===id);if(!t)return;
    document.getElementById('crm-et-id').value=t.id;
    document.getElementById('crm-et-name').value=t.name||'';
    document.getElementById('crm-et-description').value=t.description||'';
    document.getElementById('crm-et-subject').value=t.subject||'';
    document.getElementById('crm-et-body').value=t.body||'';
    document.getElementById('crm-et-html').value=t.html_body||'';
    document.getElementById('crm-et-dm').value=t.dm_body||'';
    document.getElementById('crm-et-default').checked=Number(t.is_default)===1;
  }

  async function saveTemplate(){
    const id=Number(document.getElementById('crm-et-id').value||0),body={
      name:document.getElementById('crm-et-name').value.trim(),
      description:document.getElementById('crm-et-description').value.trim(),
      subject:document.getElementById('crm-et-subject').value.trim(),
      body:document.getElementById('crm-et-body').value.trim(),
      html_body:document.getElementById('crm-et-html').value.trim(),
      dm_body:document.getElementById('crm-et-dm').value.trim(),
      is_default:document.getElementById('crm-et-default').checked,
      is_active:true
    };
    if(!body.name||!body.subject||(!body.body&&!body.html_body))return toast('Preencha nome, assunto e pelo menos uma versão do email (texto ou HTML).','cancel');
    try{await api(id?'/api/admin/prospect-email-templates/'+id:'/api/admin/prospect-email-templates',{method:id?'PATCH':'POST',body});await loadTemplates();renderTemplates();clearForm();toast('Abordagem guardada.','check')}catch(e){toast(e.message,'cancel')}
  }

  async function setDefault(id){
    try{await api('/api/admin/prospect-email-templates/'+id,{method:'PATCH',body:{is_default:true}});await loadTemplates();renderTemplates();toast('Abordagem predefinida atualizada.','check')}catch(e){toast(e.message,'cancel')}
  }

  async function deleteTemplate(id){
    if(!confirm('Apagar esta abordagem?'))return;
    try{await api('/api/admin/prospect-email-templates/'+id,{method:'DELETE'});await loadTemplates();renderTemplates();clearForm();toast('Abordagem apagada.','check')}catch(e){toast(e.message,'cancel')}
  }

  window.openProspectApproaches=async()=>{
    ensureManager();
    await loadTemplates();
    renderTemplates();
    clearForm();
    document.getElementById('crm-email-template-manager').classList.add('open');
  };
  // Compatibilidade com chamadas antigas.
  window.openProspectEmailTemplates=window.openProspectApproaches;

  loadTemplates();
})();
