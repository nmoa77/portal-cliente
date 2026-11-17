/* DUIT · Diálogos e notificações próprios — sem janelas nativas do browser. */
(function(){
'use strict';
const style=document.createElement('style');
style.textContent=`
.duit-ui-toasts{position:fixed;top:20px;right:20px;z-index:2147483647;display:flex;flex-direction:column;gap:10px;max-width:min(390px,calc(100vw - 30px));pointer-events:none}
.duit-ui-toast{pointer-events:auto;display:flex;align-items:flex-start;gap:12px;border:1px solid #dedede;background:#fff;color:#191919;padding:15px 16px;border-radius:13px;box-shadow:0 16px 36px rgba(0,0,0,.16);font:600 13px/1.5 Montserrat,system-ui,sans-serif;animation:duit-ui-in .2s ease both}
.duit-ui-toast[data-type=success]{border-left:4px solid #218045}.duit-ui-toast[data-type=error]{border-left:4px solid #d34444}.duit-ui-toast[data-type=info]{border-left:4px solid #ffd200}
.duit-ui-toast-mark{font-size:18px;line-height:1.1}.duit-ui-toast-close{margin-left:auto;background:transparent;border:0;color:#666;font-size:22px;cursor:pointer}
.duit-ui-backdrop{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(0,0,0,.6);backdrop-filter:blur(4px)}
.duit-ui-dialog{width:min(450px,100%);max-height:calc(100vh - 40px);overflow:auto;border-radius:18px;background:white;color:#161616;padding:26px;box-shadow:0 24px 70px rgba(0,0,0,.28);font-family:Montserrat,system-ui,sans-serif}
.duit-ui-dialog-brand{font-weight:900;letter-spacing:1px;font-size:13px;margin-bottom:19px}.duit-ui-dialog-brand span{color:#d5ab00}
.duit-ui-dialog h2{font-size:21px;line-height:1.25;font-weight:800;margin:0 0 11px;color:#151515}.duit-ui-dialog p{font-size:13px;white-space:pre-line;line-height:1.65;color:#525252;margin:0 0 19px}
.duit-ui-dialog input{width:100%;padding:12px 14px;border:1px solid #c6c6c6;border-radius:9px;font:500 14px Montserrat,system-ui,sans-serif;margin-bottom:19px;background:#fff;color:#111}
.duit-ui-dialog input:focus{outline:2px solid #ffd200;outline-offset:2px}
.duit-ui-dialog-actions{display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap}
.duit-ui-dialog-actions button{border:0;border-radius:9px;padding:12px 17px;font:700 13px Montserrat,system-ui,sans-serif;cursor:pointer}
.duit-ui-cancel{background:#ededed;color:#222}.duit-ui-accept{background:#ffd200;color:#111}
.duit-ui-dialog[data-danger=true] .duit-ui-accept{background:#252525;color:white}
@keyframes duit-ui-in{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:600px){.duit-ui-toasts{top:12px;left:12px;right:12px;max-width:none}.duit-ui-dialog{padding:22px}}
`;
document.head.appendChild(style);
const toasts=document.createElement('div');toasts.className='duit-ui-toasts';
document.body.appendChild(toasts);
function toast(message,type='info'){
 const el=document.createElement('div');el.className='duit-ui-toast';
 el.dataset.type=['success','error','info'].includes(type)?type:'info';
 const mark=document.createElement('span');mark.className='duit-ui-toast-mark';mark.textContent=type==='success'?'✓':type==='error'?'!':'●';
 const text=document.createElement('span');text.textContent=String(message??'');
 const close=document.createElement('button');close.type='button';close.className='duit-ui-toast-close';close.textContent='×';close.setAttribute('aria-label','Fechar aviso');
 el.append(mark,text,close);toasts.appendChild(el);
 const remove=()=>el.remove();close.onclick=remove;setTimeout(remove,5500);return el;
}
let queue=Promise.resolve();
function dialog(opts={}){
 const run=()=>new Promise(resolve=>{
  const overlay=document.createElement('div');overlay.className='duit-ui-backdrop';
  const box=document.createElement('section');box.className='duit-ui-dialog';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');
  box.dataset.danger=opts.danger?'true':'false';
  const brand=document.createElement('div');brand.className='duit-ui-dialog-brand';brand.innerHTML='DUIT<span>.</span>';
  const heading=document.createElement('h2');heading.textContent=opts.title||(opts.mode==='prompt'?'Indique a informação':'Confirmar ação');
  heading.id='duit-ui-dialog-title';box.setAttribute('aria-labelledby',heading.id);
  const message=document.createElement('p');message.textContent=String(opts.message||'');
  box.append(brand,heading,message);
  let field=null;
  if(opts.mode==='prompt'){
   field=document.createElement('input');field.type='text';field.value=String(opts.defaultValue||'');
   field.placeholder=String(opts.placeholder||'');field.autocomplete='off';
   box.append(field);
  }
  const actions=document.createElement('div');actions.className='duit-ui-dialog-actions';
  const cancel=document.createElement('button');cancel.type='button';cancel.className='duit-ui-cancel';cancel.textContent='Cancelar';
  const okay=document.createElement('button');okay.type='button';okay.className='duit-ui-accept';okay.textContent=opts.confirmText||'Confirmar';
  actions.append(cancel,okay);box.append(actions);overlay.append(box);
  const previous=document.activeElement;
  function finish(value){overlay.remove();document.removeEventListener('keydown',onKey,true);previous?.focus?.();resolve(value);}
  function onKey(e){
   if(!overlay.isConnected)return;
   if(e.key==='Escape'){e.preventDefault();e.stopPropagation();finish(opts.mode==='prompt'?null:false);}
   if(e.key==='Tab'){
    const focusable=[...(field?[field]:[]),cancel,okay];const i=focusable.indexOf(document.activeElement);
    if(e.shiftKey&&i<=0){e.preventDefault();okay.focus();}
    else if(!e.shiftKey&&i===focusable.length-1){e.preventDefault();focusable[0].focus();}
   }
   if(e.key==='Enter'&&opts.mode==='prompt'&&document.activeElement===field){e.preventDefault();finish(field.value);}
  }
  document.addEventListener('keydown',onKey,true);
  cancel.onclick=()=>finish(opts.mode==='prompt'?null:false);
  okay.onclick=()=>finish(opts.mode==='prompt'?field.value:true);
  document.body.append(overlay);(field||okay).focus();
 });
 const next=queue.then(run,run);queue=next.then(()=>{},()=>{});return next;
}
window.duitToast=toast;
window.duitConfirm=(message,options={})=>dialog({message,...options,mode:'confirm'});
window.duitPrompt=(message,defaultValue='',options={})=>dialog({message,defaultValue,...options,mode:'prompt'});
})();
