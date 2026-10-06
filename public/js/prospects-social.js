/* DUIT social prospecting — manual Instagram DM control */
(()=>{
 let social=new Map(),filter='all';
 const statusLabel=s=>({
   por_enviar:'DM pronta',enviado:'Enviada',respondeu:'Respondeu',
   interessado:'Interessado',sem_interesse:'Sem interesse'
 }[s]||s||'Por enviar');
 const defaultDm=p=>{
   const c=p.company||p.name||'a vossa empresa';
   const o=String(p.email_observation||p.opportunity||'').replace(/[.!?]+$/,'');
   return `Olá 👋 Sou o Nuno, da DUIT.\n\nEstive a ver a página da ${c} e reparei que ${o||'há trabalho interessante que pode ser mais aproveitado nas redes sociais'}.\n\nVi uma alteração simples que eu faria aqui. Se quiser, digo-lhe qual é — sem compromisso.`;
 };
 async function load(){
   try{
     const rows=await api('/api/crm/prospects/social');
     social=new Map((rows||[]).map(x=>[Number(x.user_id),x]));
   }catch(e){}
 }
 async function patch(id,data){
   await api('/api/crm/prospects/'+id+'/social',{method:'PATCH',body:data});
   await load();
   refresh();
 }
 function prospect(id){return (window.duitCrmProspectsCache||[]).find(x=>Number(x.id)===Number(id))}
 function stateFor(id){
   const p=prospect(id)||{},s=social.get(Number(id))||{};
   if(p.instagram){
     if(s.dm_status==='enviado')return 'enviado';
     if(s.dm_status==='respondeu')return 'respondeu';
     if(s.dm_status==='interessado')return 'interessado';
     if(s.dm_status==='sem_interesse')return 'sem_interesse';
     return 'pronto';
   }
   return p.instagram_checked_at?'nao_encontrado':'por_verificar';
 }
 window.crmCopyDm=async id=>{
   const p=prospect(id);if(!p)return;
   const s=social.get(Number(id))||{},msg=s.dm_message||defaultDm(p);
   try{await navigator.clipboard.writeText(msg);toast('DM copiada.','check')}
   catch(e){toast('Não foi possível copiar.','cancel')}
 };
 window.crmOpenInstagram=id=>{
   const p=prospect(id);
   if(!p?.instagram)return toast('Este prospect ainda não tem Instagram validado.','cancel');
   window.open(p.instagram,'_blank','noopener');
 };
 window.crmPrepareDm=async id=>{
   const p=prospect(id);
   if(!p?.instagram)return toast('Este prospect ainda não tem Instagram validado.','cancel');
   const s=social.get(Number(id))||{},msg=s.dm_message||defaultDm(p);
   window.open(p.instagram,'_blank','noopener');
   try{await navigator.clipboard.writeText(msg);toast('Instagram aberto e DM copiada. Depois marque como enviada.','check')}
   catch(e){toast('Instagram aberto. Não foi possível copiar a DM.','cancel')}
 };
 window.crmSetDmStatus=async(id,status)=>{
   const p=prospect(id);if(!p)return;
   const s=social.get(Number(id))||{};
   await patch(id,{outreach_channel:'instagram',dm_status:status,dm_message:s.dm_message||defaultDm(p)});
   toast(status==='enviado'?'DM marcada como enviada.':'Estado da DM atualizado.','check');
 };
 window.crmMarkDmSent=id=>crmSetDmStatus(id,'enviado');

 function addControl(){
   const toolbar=document.querySelector('.crm-toolbar');
   if(!toolbar||document.getElementById('crm-social-control'))return;
   const box=document.createElement('div');
   box.id='crm-social-control';
   box.style='margin:0 0 16px;padding:14px;border:1px solid var(--line);border-radius:14px;background:var(--card)';
   toolbar.insertAdjacentElement('afterend',box);
 }
 function count(st){return (window.duitCrmProspectsCache||[]).filter(p=>stateFor(p.id)===st).length}
 function renderControl(){
   addControl();const box=document.getElementById('crm-social-control');if(!box)return;
   const items=[
     ['all','Todos',(window.duitCrmProspectsCache||[]).length],
     ['por_verificar','🔎 Por verificar',count('por_verificar')],
     ['pronto','📩 DM pronta',count('pronto')],
     ['enviado','✓ Enviadas',count('enviado')],
     ['respondeu','💬 Responderam',count('respondeu')],
     ['interessado','⭐ Interessados',count('interessado')],
     ['nao_encontrado','— Sem Instagram',count('nao_encontrado')]
   ];
   box.innerHTML='<div style="font-weight:700;margin-bottom:9px">Controlo Instagram</div><div style="display:flex;gap:7px;flex-wrap:wrap">'+
     items.map(([k,l,n])=>`<button type="button" class="btn ${filter===k?'btn-yellow':'btn-ghost'}" onclick="crmSocialFilter('${k}')">${l} · ${n}</button>`).join('')+
     '</div>';
 }
 window.crmSocialFilter=k=>{filter=k;refresh()};

 function addModal(){
   const grid=document.querySelector('#crmProspectForm .crm-modal-grid');
   if(!grid||document.getElementById('crm-dm-message'))return;
   const box=document.createElement('div');box.className='field span-2';
   box.innerHTML='<div style="display:flex;align-items:end;gap:12px;flex-wrap:wrap"><div style="flex:1;min-width:220px"><label>Estado Instagram / DM</label><select id="crm-dm-status"><option value="por_enviar">DM pronta</option><option value="enviado">Enviada</option><option value="respondeu">Respondeu</option><option value="interessado">Interessado</option><option value="sem_interesse">Sem interesse</option></select></div></div><label style="margin-top:12px">Mensagem Instagram / DM</label><textarea id="crm-dm-message" rows="6" placeholder="Mensagem personalizada para Instagram"></textarea><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><button type="button" class="btn btn-yellow" id="crm-dm-prepare">Abrir + copiar DM</button><button type="button" class="btn btn-ghost" id="crm-dm-sent">✓ Marcar enviada</button><button type="button" class="btn btn-ghost" id="crm-dm-replied">💬 Respondeu</button><button type="button" class="btn btn-ghost" id="crm-dm-interested">⭐ Interessado</button></div>';
   grid.appendChild(box);
 }
 function fillModal(){
   addModal();
   const id=Number(document.getElementById('crm-id')?.value||0);if(!id)return;
   const p=prospect(id),s=social.get(id)||{};
   const ta=document.getElementById('crm-dm-message'),sel=document.getElementById('crm-dm-status');
   if(ta)ta.value=s.dm_message||defaultDm(p||{});
   if(sel)sel.value=s.dm_status||'por_enviar';
   const save=async status=>{await patch(id,{outreach_channel:'instagram',dm_status:status,dm_message:ta.value});if(sel)sel.value=status};
   sel.onchange=()=>save(sel.value);
   document.getElementById('crm-dm-prepare').onclick=async()=>{await patch(id,{outreach_channel:'instagram',dm_status:sel.value||'por_enviar',dm_message:ta.value});crmPrepareDm(id)};
   document.getElementById('crm-dm-sent').onclick=()=>save('enviado');
   document.getElementById('crm-dm-replied').onclick=()=>save('respondeu');
   document.getElementById('crm-dm-interested').onclick=()=>save('interessado');
 }
 const oldOpen=window.openCrmProspect;
 window.openCrmProspect=function(...a){oldOpen?.(...a);setTimeout(fillModal,0)};

 function decorate(){
   document.querySelectorAll('.crm-table tbody tr').forEach(tr=>{
     const edit=tr.querySelector('button[title="Abrir"]');if(!edit)return;
     const m=String(edit.getAttribute('onclick')||'').match(/openCrmProspect\((\d+)\)/);if(!m)return;
     const id=Number(m[1]),p=prospect(id),s=social.get(id)||{},st=stateFor(id);
     tr.dataset.socialState=st;
     tr.style.display=(filter==='all'||filter===st)?'':'none';

     let badge=tr.querySelector('.social-dm-badge');
     if(!badge){
       badge=document.createElement('div');badge.className='social-dm-badge';badge.style='margin-top:6px;font-size:12px';
       const cell=tr.children[3]||tr.children[0];cell.appendChild(badge);
     }
     const labels={por_verificar:'🔎 IG por verificar',nao_encontrado:'— IG não encontrado',pronto:'📩 DM pronta',enviado:'✓ DM enviada',respondeu:'💬 Respondeu',interessado:'⭐ Interessado',sem_interesse:'Sem interesse'};
     badge.textContent=labels[st]||st;

     let actions=tr.querySelector('.social-dm-actions');
     if(!p?.instagram){if(actions)actions.remove();return}
     if(!actions){
       actions=document.createElement('div');actions.className='social-dm-actions';actions.style='display:flex;gap:5px;flex-wrap:wrap;margin-top:6px';
       edit.parentElement.appendChild(actions);
     }
     actions.innerHTML=`<button class="btn btn-icon" title="Abrir Instagram + copiar DM" onclick="event.stopPropagation();crmPrepareDm(${id})">DM</button><button class="btn btn-icon" title="Marcar DM enviada" onclick="event.stopPropagation();crmSetDmStatus(${id},'enviado')">${s.dm_status==='enviado'?'✓':'→'}</button>`;
   });
   renderControl();
 }
 function refresh(){decorate();renderControl()}

 const oldView=window.viewProspects;
 if(typeof oldView==='function'){
   window.viewProspects=async function(main){
     await oldView(main);
     await load();
     refresh();
   };
 }
 const oldSetFilter=window.crmSetFilter;
 if(typeof oldSetFilter==='function'){
   window.crmSetFilter=function(...args){
     oldSetFilter(...args);
     setTimeout(refresh,0);
   };
 }
 const oldToggleDateSort=window.crmToggleDateSort;
 if(typeof oldToggleDateSort==='function'){
   window.crmToggleDateSort=function(...args){
     oldToggleDateSort(...args);
     setTimeout(refresh,0);
   };
 }

 async function bootSocialControl(){
   await load();
   const main=document.getElementById('main');
   const title=String(main?.querySelector('.page-head h1')?.textContent||'').trim().toLocaleLowerCase('pt-PT');
   const onProspects=(location.hash||'').replace(/^#/,'')==='prospects'||title==='prospects'||title==='prospecção';
   if(onProspects&&!main?.querySelector('.crm-toolbar')&&typeof window.viewProspects==='function'){
     try{await window.viewProspects(main)}catch(e){console.error('[social prospect] render:',e)}
   }
   refresh();
 }
 bootSocialControl();
})();
