const db=require('./db');

module.exports=function(app,requireAdmin){
  const cols=db.prepare('PRAGMA table_info(prospect_crm)').all().map(c=>c.name);
  for(const [name,type] of [
    ['outreach_channel','TEXT'],
    ['dm_message','TEXT'],
    ['dm_status','TEXT'],
    ['dm_sent_at','TEXT'],
    ['instagram_checked_at','TEXT'],
    ['instagram_source','TEXT']
  ]){
    if(!cols.includes(name)){
      try{db.exec(`ALTER TABLE prospect_crm ADD COLUMN ${name} ${type}`)}
      catch(e){console.warn('[social prospect]',e.message)}
    }
  }

  const ignoredIgPaths=new Set([
    'p','reel','reels','stories','explore','accounts','share','developer',
    'about','legal','privacy','terms','directory','web'
  ]);

  function dmFor(p){
    const c=(p.company||'a sua empresa').trim();
    return 'Olá 👋 Sou o Nuno, da DUIT.\n\nEstive a ver a '+c+'. Manter as redes ativas e publicar com regularidade consome tempo.\n\nEu posso tratar disso por si — conteúdos, design e publicação.\n\nSe lhe fizer sentido, estou aqui. 🙂';
  }

  function extractInstagram(html){
    const normalized=String(html||'')
      .replace(/\\u002[fF]/g,'/')
      .replace(/\\\//g,'/')
      .replace(/&amp;/g,'&')
      .replace(/&#x2F;/gi,'/');
    const re=/(?:https?:)?\/\/(?:www\.)?instagram\.com\/([A-Za-z0-9._]{2,30})(?:[\/?#"'\\<\s]|$)/ig;
    let m;
    while((m=re.exec(normalized))){
      const handle=String(m[1]||'').toLowerCase();
      if(!handle||ignoredIgPaths.has(handle))continue;
      return 'https://www.instagram.com/'+m[1].replace(/\.+$/,'')+'/';
    }
    return '';
  }

  function internalContactLinks(html,baseUrl){
    const out=[];
    const re=/href\s*=\s*["']([^"'#]+)["']/ig;
    let m;
    while((m=re.exec(String(html||'')))&&out.length<6){
      try{
        const u=new URL(m[1],baseUrl);
        const b=new URL(baseUrl);
        if(u.hostname!==b.hostname)continue;
        if(!/(contact|contacto|contactos|about|sobre|empresa)/i.test(u.pathname))continue;
        const href=u.href.split('#')[0];
        if(!out.includes(href))out.push(href);
      }catch(_){}
    }
    return out.slice(0,2);
  }

  async function getHtml(url){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),5000);
    try{
      const res=await fetch(url,{
        redirect:'follow',
        signal:controller.signal,
        headers:{
          'user-agent':'Mozilla/5.0 (compatible; DUIT-CRM/1.0; +https://www.duit.pt/)',
          'accept':'text/html,application/xhtml+xml'
        }
      });
      if(!res.ok)return {html:'',visited:false};
      const type=String(res.headers.get('content-type')||'').toLowerCase();
      if(type&&!type.includes('text/html')&&!type.includes('application/xhtml'))return {html:'',visited:true};
      const html=(await res.text()).slice(0,1500000);
      return {html,visited:true,url:res.url||url};
    }catch(_){
      return {html:'',visited:false};
    }finally{
      clearTimeout(timer);
    }
  }

  async function findInstagram(website){
    let start='';
    try{start=new URL(String(website||'').trim()).href}catch(_){return {profile:'',visited:false}}
    const first=await getHtml(start);
    if(!first.visited)return {profile:'',visited:false};
    let profile=extractInstagram(first.html);
    if(profile)return {profile,visited:true};
    const links=internalContactLinks(first.html,first.url||start);
    for(const link of links){
      const page=await getHtml(link);
      if(!page.visited)continue;
      profile=extractInstagram(page.html);
      if(profile)return {profile,visited:true};
    }
    return {profile:'',visited:true};
  }

  function eligibleRows(onlyUnchecked=false){
    return db.prepare(`
      SELECT p.user_id,p.instagram,p.website,p.email_observation,p.opportunity,p.dm_status,u.company
      FROM prospect_crm p
      JOIN users u ON u.id=p.user_id
      WHERE u.is_prospect=1
        AND COALESCE(p.lead_status,'por_contactar')<>'sem_interesse'
        AND (p.email_sent_at IS NULL OR p.email_first_opened_at IS NOT NULL OR COALESCE(p.email_open_count,0)>0)
        AND (p.instagram IS NULL OR trim(p.instagram)='')
        ${onlyUnchecked?"AND (p.instagram_checked_at IS NULL OR datetime(p.instagram_checked_at)<datetime('now','-30 days'))":''}
    `).all();
  }

  async function enrichInstagram({onlyUnchecked=true}={}){
    const rows=eligibleRows(onlyUnchecked);
    let cursor=0,found=0,visited=0,failed=0;
    const saveFound=db.prepare(`
      UPDATE prospect_crm SET
        instagram=?,
        instagram_source='website',
        instagram_checked_at=datetime('now'),
        outreach_channel='instagram',
        dm_status=CASE WHEN COALESCE(dm_status,'') IN ('enviado','respondeu','interessado','sem_interesse') THEN dm_status ELSE 'por_enviar' END,
        dm_message=CASE WHEN COALESCE(dm_message,'')='' THEN ? ELSE dm_message END,
        updated_at=datetime('now')
      WHERE user_id=?
    `);
    const saveChecked=db.prepare(`
      UPDATE prospect_crm SET instagram_checked_at=datetime('now'),updated_at=datetime('now') WHERE user_id=?
    `);
    async function worker(){
      while(true){
        const i=cursor++;
        if(i>=rows.length)return;
        const p=rows[i];
        if(!p.website){saveChecked.run(p.user_id);continue}
        const result=await findInstagram(p.website);
        if(result.visited)visited++; else failed++;
        if(result.profile){
          saveFound.run(result.profile,dmFor(p),p.user_id);
          found++;
        }else if(result.visited){
          saveChecked.run(p.user_id);
        }
      }
    }
    await Promise.all(Array.from({length:Math.min(8,Math.max(1,rows.length))},()=>worker()));
    console.log(`[social prospect] Instagram: ${found} encontrados em ${rows.length} prospects elegíveis; ${visited} sites consultados; ${failed} falhas de acesso`);
    return {checked:rows.length,sites_visited:visited,found,failed};
  }

  // DUIT_DM_TIME_FOCUS_20261006 — atualiza apenas DMs ainda não enviadas.
  try{
    const pending=db.prepare(`
      SELECT p.user_id,p.instagram,p.dm_status,u.company
      FROM prospect_crm p JOIN users u ON u.id=p.user_id
      WHERE u.is_prospect=1
        AND p.instagram IS NOT NULL AND trim(p.instagram)<>''
        AND COALESCE(p.dm_status,'por_enviar')='por_enviar'
        AND p.dm_sent_at IS NULL
    `).all();
    const up=db.prepare(`UPDATE prospect_crm SET dm_message=?,updated_at=datetime('now') WHERE user_id=? AND COALESCE(dm_status,'por_enviar')='por_enviar' AND dm_sent_at IS NULL`);
    const tx=db.transaction(()=>{for(const x of pending)up.run(dmFor(x),x.user_id)});
    tx();
  }catch(e){console.warn('[social prospect] refresh DM time focus:',e.message)}

  // DUIT_DM_SHORT_20261006 — atualiza apenas DMs ainda não enviadas para versão curta.
  try{
    const pending=db.prepare(`
      SELECT p.user_id,u.company
      FROM prospect_crm p JOIN users u ON u.id=p.user_id
      WHERE u.is_prospect=1
        AND p.instagram IS NOT NULL AND trim(p.instagram)<>''
        AND COALESCE(p.dm_status,'por_enviar')='por_enviar'
        AND p.dm_sent_at IS NULL
    `).all();
    const up=db.prepare(`UPDATE prospect_crm SET dm_message=?,updated_at=datetime('now') WHERE user_id=? AND COALESCE(dm_status,'por_enviar')='por_enviar' AND dm_sent_at IS NULL`);
    const tx=db.transaction(()=>{for(const x of pending)up.run(dmFor(x),x.user_id)});
    tx();
  }catch(e){console.warn('[social prospect] refresh short DM:',e.message)}

  // DUIT_DM_SOFT_CLOSE_20261006 — atualiza apenas DMs ainda não enviadas.
  try{
    const pending=db.prepare(`
      SELECT p.user_id,u.company
      FROM prospect_crm p JOIN users u ON u.id=p.user_id
      WHERE u.is_prospect=1
        AND p.instagram IS NOT NULL AND trim(p.instagram)<>''
        AND COALESCE(p.dm_status,'por_enviar')='por_enviar'
        AND p.dm_sent_at IS NULL
    `).all();
    const up=db.prepare(`UPDATE prospect_crm SET dm_message=?,updated_at=datetime('now') WHERE user_id=? AND COALESCE(dm_status,'por_enviar')='por_enviar' AND dm_sent_at IS NULL`);
    const tx=db.transaction(()=>{for(const x of pending)up.run(dmFor(x),x.user_id)});
    tx();
  }catch(e){console.warn('[social prospect] refresh soft close DM:',e.message)}

  // Aproveita imediatamente os Instagrams já existentes.
  try{
    const eligible=db.prepare(`
      SELECT p.user_id,p.instagram,p.email_observation,p.opportunity,u.company
      FROM prospect_crm p JOIN users u ON u.id=p.user_id
      WHERE u.is_prospect=1
        AND (p.email_sent_at IS NULL OR p.email_first_opened_at IS NOT NULL OR COALESCE(p.email_open_count,0)>0)
        AND p.instagram IS NOT NULL AND trim(p.instagram)<>''
    `).all();
    const save=db.prepare(`
      UPDATE prospect_crm SET outreach_channel='instagram',
        dm_status=CASE WHEN COALESCE(dm_status,'') IN ('enviado','respondeu','interessado','sem_interesse') THEN dm_status ELSE 'por_enviar' END,
        dm_message=CASE WHEN COALESCE(dm_message,'')='' THEN ? ELSE dm_message END,
        updated_at=datetime('now')
      WHERE user_id=?
    `);
    const tx=db.transaction(()=>{for(const p of eligible)save.run(dmFor(p),p.user_id)});
    tx();
  }catch(e){console.warn('[social prospect] preparação:',e.message)}

  // Faz enriquecimento em background após o arranque, sem bloquear o deploy.
  setTimeout(()=>{
    enrichInstagram({onlyUnchecked:true}).catch(e=>console.warn('[social prospect] enriquecimento:',e.message));
  },1500);

  app.post('/api/crm/prospects/enrich-instagram',requireAdmin,async(req,res)=>{
    try{res.json(await enrichInstagram({onlyUnchecked:req.body?.force!==true}))}
    catch(e){console.error('[social prospect] enrich endpoint:',e);res.status(500).json({error:'Não foi possível procurar os perfis de Instagram.'})}
  });

  app.get('/api/crm/prospects/social',requireAdmin,(req,res)=>{
    const rows=db.prepare(`
      SELECT user_id,instagram,
             COALESCE(outreach_channel,CASE WHEN instagram IS NOT NULL AND trim(instagram)<>'' THEN 'instagram' ELSE 'email' END) outreach_channel,
             dm_message,COALESCE(dm_status,'por_enviar') dm_status,dm_sent_at,
             instagram_checked_at,instagram_source
      FROM prospect_crm
    `).all();
    res.json(rows);
  });

  app.patch('/api/crm/prospects/:id/social',requireAdmin,(req,res)=>{
    const id=Number(req.params.id),b=req.body||{};
    const exists=db.prepare('SELECT user_id FROM prospect_crm WHERE user_id=?').get(id);
    if(!exists)return res.status(404).json({error:'Prospect não encontrado.'});
    const channel=['instagram','email'].includes(b.outreach_channel)?b.outreach_channel:'instagram';
    const status=['por_enviar','enviado','respondeu','interessado','sem_interesse'].includes(b.dm_status)?b.dm_status:'por_enviar';
    const msg=String(b.dm_message||'').trim().slice(0,4000);
    db.prepare(`
      UPDATE prospect_crm SET outreach_channel=?,dm_message=?,dm_status=?,
        dm_sent_at=CASE WHEN ?='enviado' THEN COALESCE(dm_sent_at,datetime('now')) ELSE dm_sent_at END,
        lead_status=CASE
          WHEN ?='interessado' THEN 'interessado'
          WHEN ?='respondeu' AND lead_status NOT IN ('interessado','proposta') THEN 'respondeu'
          WHEN ?='sem_interesse' THEN 'sem_interesse'
          WHEN ?='enviado' AND lead_status='por_contactar' THEN 'contactado'
          ELSE lead_status END,
        first_contact_at=CASE WHEN ? IN ('enviado','respondeu','interessado','sem_interesse') THEN COALESCE(first_contact_at,date('now')) ELSE first_contact_at END,
        updated_at=datetime('now')
      WHERE user_id=?
    `).run(channel,msg,status,status,status,status,status,status,status,id);
    res.json({ok:true,user_id:id,outreach_channel:channel,dm_message:msg,dm_status:status});
  });
};
