(()=>{
  const slug=decodeURIComponent(location.pathname.split('/').filter(Boolean).pop()||'');
  const preview=new URLSearchParams(location.search).get('preview')==='1';
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const session=(()=>{let s=sessionStorage.getItem('duit_bio_sid');if(!s){s=(crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now());sessionStorage.setItem('duit_bio_sid',s)}return s})();
  async function event(event,target_type,target_id){
    try{await fetch('/api/public/bio/'+encodeURIComponent(slug)+'/event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event,target_type,target_id,session_id:session,referrer:document.referrer})})}catch(_){}
  }
  function icon(p){const m={instagram:'IG',facebook:'f',linkedin:'in',youtube:'▶',tiktok:'♪',website:'↗',whatsapp:'WA',spotify:'♫',email:'@'};return m[String(p||'').toLowerCase()]||String(p||'').slice(0,2).toUpperCase()}
  async function boot(){
    const r=await fetch('/api/public/bio/'+encodeURIComponent(slug),{cache:'no-store'});if(!r.ok){document.body.innerHTML='<div class="empty">Bio indisponível.</div>';return}const b=await r.json();
    document.title=b.name+' · Bio';
    const root=document.documentElement.style;
    root.setProperty('--bg',b.background_color||'#f6f4ef');root.setProperty('--card',b.card_color||'#fff');root.setProperty('--text',b.text_color||'#111');root.setProperty('--accent',b.accent_color||'#ffd200');root.setProperty('--btn',b.button_color||'#111');root.setProperty('--btnText',b.button_text_color||'#fff');
    $('bio-name').textContent=b.name||'';$('bio-desc').textContent=b.description||'';
    const logo=$('bio-logo');if(b.logo_url){logo.src=b.logo_url}else logo.style.display='none';
    $('bio-socials').innerHTML=(b.socials||[]).map(s=>'<a href="'+esc(s.url)+'" target="_blank" rel="noopener" data-social="'+s.id+'" title="'+esc(s.platform)+'">'+icon(s.platform)+'</a>').join('');
    $('bio-socials').querySelectorAll('[data-social]').forEach(a=>a.addEventListener('click',()=>{if(!preview)event('social_click','social',Number(a.dataset.social))}));
    const tabs=b.tabs||[],cards=b.cards||[];let active=tabs[0]?.id||null;
    const render=()=>{
      $('bio-tabs').innerHTML=tabs.map(t=>'<button class="tab '+(Number(t.id)===Number(active)?'active':'')+'" data-tab="'+t.id+'">'+(t.icon?esc(t.icon)+' ':'')+esc(t.title)+'</button>').join('');
      $('bio-tabs').querySelectorAll('[data-tab]').forEach(x=>x.onclick=()=>{active=Number(x.dataset.tab);render()});
      const list=active?cards.filter(c=>Number(c.tab_id)===Number(active)):cards.filter(c=>!c.tab_id);
      $('bio-cards').innerHTML=list.length?list.map(c=>'<article class="card">'+(c.image_url?'<img src="'+esc(c.image_url)+'" alt="">':'')+'<div class="body"><h2>'+esc(c.title)+'</h2>'+(c.subtitle?'<p>'+esc(c.subtitle)+'</p>':'')+(c.url?'<a href="'+esc(c.url)+'" target="_blank" rel="noopener" data-card="'+c.id+'">'+esc(c.button_label||'Saber mais')+'</a>':'')+'</div></article>').join(''):'<div class="empty">Ainda não existem conteúdos neste separador.</div>';
      $('bio-cards').querySelectorAll('[data-card]').forEach(a=>a.addEventListener('click',()=>{if(!preview)event('click','card',Number(a.dataset.card))}));
    };
    render();if(!preview)event('view','bio',b.id);
  }
  boot().catch(()=>{document.body.innerHTML='<div class="empty">Não foi possível carregar esta Bio.</div>'});
})();