(()=>{
  const parts=location.pathname.split('/').filter(Boolean);
  const slug=decodeURIComponent(parts.length===1&&parts[0]==='bio'?'duit':(parts.pop()||''));
  const preview=new URLSearchParams(location.search).get('preview')==='1';
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const eventId=()=>crypto.randomUUID?crypto.randomUUID():(Date.now()+'-'+Math.random().toString(16).slice(2));
  const session=(()=>{let s=sessionStorage.getItem('duit_bio_sid');if(!s){s=eventId();sessionStorage.setItem('duit_bio_sid',s)}return s})();
  async function track(event,target_type,target_id){if(preview)return;try{await fetch('/api/public/bio/'+encodeURIComponent(slug)+'/event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event,event_id:eventId(),target_type,target_id,session_id:session,referrer:document.referrer})})}catch(_){}}
  function socialIcon(name){
    const common='width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"';
    if(name==='instagram')return '<svg '+common+'><rect x="2.5" y="2.5" width="19" height="19" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.6" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>';
    if(name==='facebook')return '<svg '+common+'><path d="M15.5 3.5h-2.2c-2.2 0-3.3 1.4-3.3 3.6V10H7v3h3v8h3.4v-8h3l.5-3h-3.5V7.6c0-.7.3-1.1 1.1-1.1h2V3.5Z" fill="currentColor" stroke="none"/></svg>';
    if(name==='youtube')return '<svg '+common+'><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none"/></svg>';
    return '<svg '+common+'><rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="m3 7 9 7 9-7"/></svg>';
  }
  async function boot(){
    const r=await fetch('/api/public/bio/'+encodeURIComponent(slug),{cache:'no-store'});if(!r.ok)throw Error('Bio indisponível');const b=await r.json();
    document.title=b.name||'Bio';
    const root=document.documentElement.style;
    root.setProperty('--bg',b.background_color||'#f6f4ef');root.setProperty('--text',b.text_color||'#111');root.setProperty('--accent',b.accent_color||'#ffd200');root.setProperty('--section-title',b.section_title_color||b.text_color||'#111');root.setProperty('--profile-width',(Number(b.profile_width)||340)+'px');root.setProperty('--card-width',(Number(b.card_width)||280)+'px');
    $('bio-root').innerHTML='<div class="bio-layout"><aside class="bio-profile">'+
      (b.logo_url?'<img class="bio-logo" src="'+esc(b.logo_url)+'" alt="">':'')+
      '<h1>'+esc(b.name||'')+'</h1><p>'+esc(b.description||'')+'</p>'+
      '<div class="bio-socials">'+(b.socials||[]).map(s=>{const href=s.platform==='email'?'mailto:'+s.url:s.url;return '<a href="'+esc(href)+'" '+(s.platform==='email'?'':'target="_blank" rel="noopener noreferrer"')+' data-social="'+s.id+'" aria-label="'+esc(s.platform)+'">'+socialIcon(s.platform)+'</a>'}).join('')+'</div></aside>'+
      '<div class="bio-sections">'+(b.tabs||[]).map(t=>{const cards=(b.cards||[]).filter(c=>Number(c.tab_id)===Number(t.id));return '<section class="bio-section"><h2>'+(t.icon?'<span>'+esc(t.icon)+'</span> ':'')+esc(t.title)+'</h2>'+(cards.length>1?'<p class="swipe-hint">Deslize para ver mais →</p>':'')+'<div class="bio-cards">'+cards.map(c=>'<article class="bio-card">'+(c.image_url?'<img src="'+esc(c.image_url)+'" alt="">':'')+'<div class="bio-card-body">'+(c.title?'<strong class="bio-card-title">'+esc(c.title)+'</strong>':'')+(c.subtitle?'<div class="bio-card-subtitle">'+esc(c.subtitle)+'</div>':'')+(c.url?'<a class="bio-cta" href="'+esc(c.url)+'" '+(/^https?:/i.test(c.url)?'target="_blank" rel="noopener noreferrer"':'')+' data-card="'+c.id+'">'+esc(c.button_label||'VER MAIS')+' <span>→</span></a>':'')+'</div></article>').join('')+'</div></section>'}).join('')+'</div></div>';
    document.querySelectorAll('[data-card]').forEach(a=>a.addEventListener('click',()=>track('click','card',Number(a.dataset.card))));
    document.querySelectorAll('[data-social]').forEach(a=>a.addEventListener('click',()=>track('social_click','social',Number(a.dataset.social))));
    track('view','bio',b.id);
  }
  boot().catch(()=>{document.body.innerHTML='<div style="padding:60px;text-align:center;font-family:Arial">Bio indisponível.</div>'});
})();