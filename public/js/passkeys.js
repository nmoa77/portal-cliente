/* DUIT · Passkeys / biometria para administradores. Sem bibliotecas externas no browser. */
(function(){
  'use strict';
  const endpoint='/api/auth/passkeys';
  const textError=e=>e?.name==='NotAllowedError'
    ? 'Operação cancelada ou não autorizada no dispositivo.'
    : e?.message||'Falha na autenticação biométrica.';
  const decode=value=>{
    const s=String(value||'').replace(/-/g,'+').replace(/_/g,'/');
    const bytes=atob(s.padEnd(Math.ceil(s.length/4)*4,'='));
    return Uint8Array.from(bytes,c=>c.charCodeAt(0));
  };
  const encode=value=>{
    if(value===null||value===undefined)return null;
    const bytes=new Uint8Array(value),chunk=8192;
    let raw='';
    for(let i=0;i<bytes.length;i+=chunk)raw+=String.fromCharCode(...bytes.subarray(i,i+chunk));
    return btoa(raw).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  };
  const createOptions=options=>window.PublicKeyCredential?.parseCreationOptionsFromJSON
    ?PublicKeyCredential.parseCreationOptionsFromJSON(options)
    :{...options,challenge:decode(options.challenge),
      user:{...options.user,id:decode(options.user.id)},
      excludeCredentials:(options.excludeCredentials||[]).map(x=>({...x,id:decode(x.id)}))};
  const requestOptions=options=>window.PublicKeyCredential?.parseRequestOptionsFromJSON
    ?PublicKeyCredential.parseRequestOptionsFromJSON(options)
    :{...options,challenge:decode(options.challenge),
      allowCredentials:(options.allowCredentials||[]).map(x=>({...x,id:decode(x.id)}))};
  function asJSON(cred){
    if(typeof cred.toJSON==='function')return cred.toJSON();
    const res=cred.response,registration=cred.type==='public-key' && typeof res.getTransports==='function';
    return {id:cred.id,rawId:encode(cred.rawId),type:cred.type,
      authenticatorAttachment:cred.authenticatorAttachment,
      clientExtensionResults:cred.getClientExtensionResults?.()||{},
      response:registration?{
        clientDataJSON:encode(res.clientDataJSON),
        attestationObject:encode(res.attestationObject),
        transports:res.getTransports()
      }:{
        clientDataJSON:encode(res.clientDataJSON),
        authenticatorData:encode(res.authenticatorData),
        signature:encode(res.signature),
        userHandle:encode(res.userHandle)
      }};
  }
  async function post(path,data){
    const response=await fetch(endpoint+path,{
      method:'POST',credentials:'same-origin',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(data)
    });
    const json=await response.json().catch(()=>({}));
    if(!response.ok)throw Error(json.error||'Não foi possível concluir.');
    return json;
  }
  const supported=()=>!!(window.isSecureContext&&window.PublicKeyCredential&&navigator.credentials);
  window.duitPasskeyLogin=async function(){
    const err=document.getElementById('err');
    const button=document.getElementById('passkey-login-button');
    const email=document.getElementById('email')?.value.trim();
    if(err){err.textContent='';err.classList.remove('show');}
    if(!supported())return showError('Este dispositivo/navegador não suporta passkeys.',err);
    if(!email)return showError('Indique primeiro o seu email.',err);
    if(button)button.disabled=true;
    try{
      const data=await post('/login/options',{email});
      const credential=await navigator.credentials.get({publicKey:requestOptions(data.options)});
      if(!credential)throw Error('Autenticação não concluída.');
      await post('/login/verify',{challengeId:data.challengeId,userId:data.userId,credential:asJSON(credential)});
      window.location.assign('/admin.html');
    }catch(e){showError(textError(e),err);}
    finally{if(button)button.disabled=false;}
  };
  function showError(message,element){
    if(element){element.textContent=message;element.classList.add('show');}
    else if(typeof window.toast==='function')window.toast(message,'cancel');
    else alert(message);
  }
  window.duitPasskeyRegister=async function(){
    if(!supported())return showError('Este dispositivo/navegador não suporta passkeys.');
    const button=document.getElementById('passkey-register-button');
    if(button)button.disabled=true;
    try{
      const data=await post('/register/options',{});
      const credential=await navigator.credentials.create({publicKey:createOptions(data.options)});
      if(!credential)throw Error('Registo cancelado.');
      await post('/register/verify',{challengeId:data.challengeId,credential:asJSON(credential),
        label:/Android/i.test(navigator.userAgent)?'Android':'Dispositivo pessoal'});
      if(typeof window.toast==='function')window.toast('Biometria ativada neste dispositivo.','check');
      await window.duitPasskeyRender();
    }catch(e){showError(textError(e));}
    finally{if(button)button.disabled=false;}
  };
  window.duitPasskeyRender=async function(){
    const root=document.getElementById('passkey-registered-list');
    if(!root)return;
    if(!supported()){
      root.textContent='Este navegador não suporta passkeys ou não está num contexto HTTPS.';
      return;
    }
    try{
      const res=await fetch(endpoint+'/register/status',{credentials:'same-origin'});
      if(!res.ok)throw Error('Não foi possível consultar os dispositivos.');
      const data=await res.json();
      root.replaceChildren();
      if(!data.keys?.length){root.textContent='Ainda não tem dispositivos com biometria registada.';return;}
      for(const key of data.keys){
        const row=document.createElement('div');
        row.style.cssText='display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;border-top:1px solid #eee;flex-wrap:wrap';
        const info=document.createElement('span');
        info.textContent=key.label+' · '+new Date(key.created_at+'Z').toLocaleDateString('pt-PT');
        const remove=document.createElement('button');remove.className='btn btn-ghost btn-sm';
        remove.type='button';remove.textContent='Remover';
        remove.addEventListener('click',async()=>{
          if(!confirm('Remover esta passkey? O login por palavra-passe mantém-se disponível.'))return;
          try{
            const answer=await fetch(endpoint+'/register/'+encodeURIComponent(key.id),{method:'DELETE',credentials:'same-origin',headers:{'Content-Type':'application/json'}});
            if(!answer.ok)throw Error('Não foi possível remover.');
            await window.duitPasskeyRender();
          }catch(e){showError(textError(e));}
        });
        row.append(info,remove);root.append(row);
      }
    }catch(e){root.textContent=e.message;}
  };
  const loginButton=document.getElementById('passkey-login-button');
  if(loginButton){
    loginButton.addEventListener('click',window.duitPasskeyLogin);
    loginButton.hidden=!supported();
  }
})();
