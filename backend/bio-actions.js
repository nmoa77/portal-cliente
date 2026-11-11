const db=require('./db');
const path=require('path');
const crypto=require('crypto');
const {requireAdmin}=require('./auth');

function slugify(v){
  return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/&/g,' e ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80);
}
function clean(v,max=2000){return v==null?null:String(v).trim().slice(0,max)}
function makeToken(){return crypto.randomBytes(8).toString('hex')}

module.exports=function(app){
  db.exec(`
    CREATE TABLE IF NOT EXISTS bio_sites(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      logo_url TEXT,
      background_color TEXT DEFAULT '#F6F4EF',
      card_color TEXT DEFAULT '#FFFFFF',
      text_color TEXT DEFAULT '#111111',
      accent_color TEXT DEFAULT '#FFD200',
      button_color TEXT DEFAULT '#111111',
      button_text_color TEXT DEFAULT '#FFFFFF',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT(datetime('now')),
      updated_at TEXT DEFAULT(datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS bio_tabs(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bio_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      icon TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY(bio_id) REFERENCES bio_sites(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS bio_cards(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bio_id INTEGER NOT NULL,
      tab_id INTEGER,
      title TEXT NOT NULL,
      subtitle TEXT,
      button_label TEXT DEFAULT 'Saber mais',
      url TEXT,
      image_url TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY(bio_id) REFERENCES bio_sites(id) ON DELETE CASCADE,
      FOREIGN KEY(tab_id) REFERENCES bio_tabs(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS bio_socials(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bio_id INTEGER NOT NULL,
      platform TEXT NOT NULL,
      url TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(bio_id) REFERENCES bio_sites(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS bio_assets(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bio_id INTEGER,
      filename TEXT,
      mime_type TEXT NOT NULL,
      image_data BLOB NOT NULL,
      created_at TEXT DEFAULT(datetime('now')),
      FOREIGN KEY(bio_id) REFERENCES bio_sites(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS bio_events(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bio_id INTEGER NOT NULL,
      event TEXT NOT NULL,
      target_type TEXT,
      target_id INTEGER,
      session_id TEXT,
      referrer TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT(datetime('now')),
      FOREIGN KEY(bio_id) REFERENCES bio_sites(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_bio_events_bio_date ON bio_events(bio_id,created_at);
  `);

  try{
    const cols=new Set(db.prepare('PRAGMA table_info(bio_sites)').all().map(x=>x.name));
    if(!cols.has('profile_width')) db.exec('ALTER TABLE bio_sites ADD COLUMN profile_width INTEGER NOT NULL DEFAULT 340');
    if(!cols.has('card_width')) db.exec('ALTER TABLE bio_sites ADD COLUMN card_width INTEGER NOT NULL DEFAULT 280');
    const ev=new Set(db.prepare('PRAGMA table_info(bio_events)').all().map(x=>x.name));
    if(!ev.has('visitor_key')) db.exec('ALTER TABLE bio_events ADD COLUMN visitor_key TEXT');
    if(!ev.has('device')) db.exec('ALTER TABLE bio_events ADD COLUMN device TEXT');
    if(!ev.has('source')) db.exec('ALTER TABLE bio_events ADD COLUMN source TEXT');
    if(!ev.has('event_id')) db.exec('ALTER TABLE bio_events ADD COLUMN event_id TEXT');
    try{db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_bio_events_event_id ON bio_events(event_id)')}catch(_){}
  }catch(e){console.warn('[bio] migrations:',e.message)}

  const full=(id)=>{
    const bio=db.prepare(`SELECT b.*,u.name client_name,u.company client_company
      FROM bio_sites b LEFT JOIN users u ON u.id=b.user_id WHERE b.id=?`).get(id);
    if(!bio)return null;
    bio.tabs=db.prepare('SELECT * FROM bio_tabs WHERE bio_id=? ORDER BY sort_order,id').all(id);
    bio.cards=db.prepare('SELECT * FROM bio_cards WHERE bio_id=? ORDER BY sort_order,id').all(id);
    bio.socials=db.prepare('SELECT * FROM bio_socials WHERE bio_id=? ORDER BY sort_order,id').all(id);
    return bio;
  };

  app.get('/api/admin/bios',requireAdmin,(req,res)=>{
    const rows=db.prepare(`SELECT b.*,u.name client_name,u.company client_company,
      (SELECT COUNT(*) FROM bio_events e WHERE e.bio_id=b.id AND e.event='view') views,
      (SELECT COUNT(*) FROM bio_events e WHERE e.bio_id=b.id AND e.event='click') clicks
      FROM bio_sites b LEFT JOIN users u ON u.id=b.user_id ORDER BY b.id DESC`).all();
    res.json(rows);
  });

  app.get('/api/admin/bios/:id',requireAdmin,(req,res)=>{
    const row=full(Number(req.params.id)); if(!row)return res.status(404).json({error:'Bio não encontrada.'}); res.json(row);
  });

  app.post('/api/admin/bios',requireAdmin,(req,res)=>{
    const b=req.body||{}; let slug=slugify(b.slug||b.name)||('bio-'+makeToken());
    if(db.prepare('SELECT 1 FROM bio_sites WHERE slug=?').get(slug))slug+='-'+makeToken().slice(0,4);
    const info=db.prepare(`INSERT INTO bio_sites(user_id,name,slug,description,background_color,card_color,text_color,accent_color,button_color,button_text_color)
      VALUES(?,?,?,?,?,?,?,?,?,?)`).run(
        Number(b.user_id||0)||null,clean(b.name,150)||'Nova Bio',slug,clean(b.description,1000),
        clean(b.background_color,20)||'#F6F4EF',clean(b.card_color,20)||'#FFFFFF',clean(b.text_color,20)||'#111111',
        clean(b.accent_color,20)||'#FFD200',clean(b.button_color,20)||'#111111',clean(b.button_text_color,20)||'#FFFFFF'
      );
    res.status(201).json(full(Number(info.lastInsertRowid)));
  });

  app.patch('/api/admin/bios/:id',requireAdmin,(req,res)=>{
    const id=Number(req.params.id),cur=full(id); if(!cur)return res.status(404).json({error:'Bio não encontrada.'});
    const b=req.body||{}; let slug=b.slug===undefined?cur.slug:slugify(b.slug);
    if(!slug)slug=cur.slug;
    const dup=db.prepare('SELECT id FROM bio_sites WHERE slug=? AND id<>?').get(slug,id); if(dup)return res.status(409).json({error:'Este endereço já está a ser usado.'});
    db.prepare(`UPDATE bio_sites SET user_id=?,name=?,slug=?,description=?,logo_url=?,background_color=?,card_color=?,text_color=?,accent_color=?,button_color=?,button_text_color=?,profile_width=?,card_width=?,is_active=?,updated_at=datetime('now') WHERE id=?`).run(
      b.user_id===undefined?cur.user_id:(Number(b.user_id||0)||null),
      b.name===undefined?cur.name:clean(b.name,150),slug,
      b.description===undefined?cur.description:clean(b.description,1000),
      b.logo_url===undefined?cur.logo_url:clean(b.logo_url,1000),
      b.background_color||cur.background_color,b.card_color||cur.card_color,b.text_color||cur.text_color,b.accent_color||cur.accent_color,
      b.button_color||cur.button_color,b.button_text_color||cur.button_text_color,
      Math.min(480,Math.max(260,Number(b.profile_width===undefined?cur.profile_width:b.profile_width)||340)),
      Math.min(600,Math.max(220,Number(b.card_width===undefined?cur.card_width:b.card_width)||280)),
      b.is_active===undefined?cur.is_active:(b.is_active?1:0),id
    );
    res.json(full(id));
  });

  app.put('/api/admin/bios/:id/config',requireAdmin,(req,res)=>{
    const id=Number(req.params.id),cur=full(id);if(!cur)return res.status(404).json({error:'Bio não encontrada.'});
    const b=req.body||{},sections=Array.isArray(b.sections)?b.sections:[],socials=b.socials&&typeof b.socials==='object'?b.socials:{};
    let slug=b.slug===undefined?cur.slug:slugify(b.slug);if(!slug)slug=cur.slug;
    const dup=db.prepare('SELECT id FROM bio_sites WHERE slug=? AND id<>?').get(slug,id);if(dup)return res.status(409).json({error:'Este endereço já está a ser usado.'});
    const tx=db.transaction(()=>{
      db.prepare(`UPDATE bio_sites SET user_id=?,name=?,slug=?,description=?,logo_url=?,background_color=?,text_color=?,accent_color=?,profile_width=?,card_width=?,updated_at=datetime('now') WHERE id=?`).run(
        Number(b.user_id||0)||null,clean(b.name,150)||cur.name,slug,clean(b.description,1000),clean(b.logo_url,1000),
        clean(b.background_color,20)||'#F6F4EF',clean(b.text_color,20)||'#111111',clean(b.accent_color,20)||'#FFD200',
        Math.min(480,Math.max(260,Number(b.profile_width)||340)),Math.min(600,Math.max(220,Number(b.card_width)||280)),id
      );
      db.prepare('DELETE FROM bio_socials WHERE bio_id=?').run(id);
      const insSocial=db.prepare('INSERT INTO bio_socials(bio_id,platform,url,sort_order) VALUES(?,?,?,?)');
      ['instagram','facebook','youtube','email'].forEach((k,i)=>{const v=clean(socials[k],1000);if(v)insSocial.run(id,k,v,i)});
      const keepTabs=[],keepCards=[];
      const insTab=db.prepare('INSERT INTO bio_tabs(bio_id,title,icon,sort_order,is_active) VALUES(?,?,?,?,?)');
      const updTab=db.prepare('UPDATE bio_tabs SET title=?,icon=?,sort_order=?,is_active=? WHERE id=? AND bio_id=?');
      const insCard=db.prepare('INSERT INTO bio_cards(bio_id,tab_id,title,subtitle,button_label,url,image_url,sort_order,is_active) VALUES(?,?,?,?,?,?,?,?,?)');
      const updCard=db.prepare('UPDATE bio_cards SET tab_id=?,title=?,subtitle=?,button_label=?,url=?,image_url=?,sort_order=?,is_active=? WHERE id=? AND bio_id=?');
      sections.slice(0,60).forEach((s,si)=>{
        let tid=Number(s.id||0);
        if(tid&&db.prepare('SELECT 1 FROM bio_tabs WHERE id=? AND bio_id=?').get(tid,id)) updTab.run(clean(s.title,160)||'Separador',clean(s.icon,48),si,s.enabled===false?0:1,tid,id);
        else tid=Number(insTab.run(id,clean(s.title,160)||'Separador',clean(s.icon,48),si,s.enabled===false?0:1).lastInsertRowid);
        keepTabs.push(tid);
        (Array.isArray(s.cards)?s.cards:[]).slice(0,100).forEach((card,ci)=>{
          let cid=Number(card.id||0);
          const args=[tid,clean(card.title,160)||'Sem título',clean(card.subtitle,500),clean(card.button_label||card.buttonText,60)||'VER MAIS',clean(card.url,1200),clean(card.image_url||card.image,1200),ci,card.enabled===false?0:1];
          if(cid&&db.prepare('SELECT 1 FROM bio_cards WHERE id=? AND bio_id=?').get(cid,id)) updCard.run(...args,cid,id);
          else cid=Number(insCard.run(id,...args).lastInsertRowid);
          keepCards.push(cid);
        });
      });
      if(keepCards.length)db.prepare(`DELETE FROM bio_cards WHERE bio_id=? AND id NOT IN (${keepCards.map(()=>'?').join(',')})`).run(id,...keepCards);else db.prepare('DELETE FROM bio_cards WHERE bio_id=?').run(id);
      if(keepTabs.length)db.prepare(`DELETE FROM bio_tabs WHERE bio_id=? AND id NOT IN (${keepTabs.map(()=>'?').join(',')})`).run(id,...keepTabs);else db.prepare('DELETE FROM bio_tabs WHERE bio_id=?').run(id);
    });
    tx();res.json(full(id));
  });

  app.delete('/api/admin/bios/:id',requireAdmin,(req,res)=>{
    const x=db.prepare('DELETE FROM bio_sites WHERE id=?').run(Number(req.params.id)); if(!x.changes)return res.status(404).json({error:'Bio não encontrada.'}); res.json({ok:true});
  });

  app.post('/api/admin/bios/:id/tabs',requireAdmin,(req,res)=>{
    const id=Number(req.params.id),b=req.body||{}; const info=db.prepare('INSERT INTO bio_tabs(bio_id,title,icon,sort_order) VALUES(?,?,?,?)').run(id,clean(b.title,100)||'Separador',clean(b.icon,50),Number(b.sort_order||0));res.json({id:Number(info.lastInsertRowid)});
  });
  app.patch('/api/admin/bio-tabs/:id',requireAdmin,(req,res)=>{
    const b=req.body||{},cur=db.prepare('SELECT * FROM bio_tabs WHERE id=?').get(req.params.id);if(!cur)return res.status(404).json({error:'Separador não encontrado.'});
    db.prepare('UPDATE bio_tabs SET title=?,icon=?,sort_order=?,is_active=? WHERE id=?').run(b.title===undefined?cur.title:clean(b.title,100),b.icon===undefined?cur.icon:clean(b.icon,50),b.sort_order===undefined?cur.sort_order:Number(b.sort_order),b.is_active===undefined?cur.is_active:(b.is_active?1:0),cur.id);res.json({ok:true});
  });
  app.delete('/api/admin/bio-tabs/:id',requireAdmin,(req,res)=>{db.prepare('DELETE FROM bio_tabs WHERE id=?').run(req.params.id);res.json({ok:true})});

  app.post('/api/admin/bios/:id/cards',requireAdmin,(req,res)=>{
    const id=Number(req.params.id),b=req.body||{};const info=db.prepare(`INSERT INTO bio_cards(bio_id,tab_id,title,subtitle,button_label,url,image_url,sort_order) VALUES(?,?,?,?,?,?,?,?)`).run(id,Number(b.tab_id||0)||null,clean(b.title,160)||'Novo card',clean(b.subtitle,500),clean(b.button_label,80)||'Saber mais',clean(b.url,1000),clean(b.image_url,1000),Number(b.sort_order||0));res.json({id:Number(info.lastInsertRowid)});
  });
  app.patch('/api/admin/bio-cards/:id',requireAdmin,(req,res)=>{
    const b=req.body||{},cur=db.prepare('SELECT * FROM bio_cards WHERE id=?').get(req.params.id);if(!cur)return res.status(404).json({error:'Card não encontrado.'});
    db.prepare(`UPDATE bio_cards SET tab_id=?,title=?,subtitle=?,button_label=?,url=?,image_url=?,sort_order=?,is_active=? WHERE id=?`).run(
      b.tab_id===undefined?cur.tab_id:(Number(b.tab_id||0)||null),b.title===undefined?cur.title:clean(b.title,160),b.subtitle===undefined?cur.subtitle:clean(b.subtitle,500),b.button_label===undefined?cur.button_label:clean(b.button_label,80),b.url===undefined?cur.url:clean(b.url,1000),b.image_url===undefined?cur.image_url:clean(b.image_url,1000),b.sort_order===undefined?cur.sort_order:Number(b.sort_order),b.is_active===undefined?cur.is_active:(b.is_active?1:0),cur.id
    );res.json({ok:true});
  });
  app.delete('/api/admin/bio-cards/:id',requireAdmin,(req,res)=>{db.prepare('DELETE FROM bio_cards WHERE id=?').run(req.params.id);res.json({ok:true})});

  app.put('/api/admin/bios/:id/socials',requireAdmin,(req,res)=>{
    const id=Number(req.params.id),rows=Array.isArray(req.body?.items)?req.body.items:[];const tx=db.transaction(()=>{db.prepare('DELETE FROM bio_socials WHERE bio_id=?').run(id);const ins=db.prepare('INSERT INTO bio_socials(bio_id,platform,url,sort_order) VALUES(?,?,?,?)');rows.forEach((x,i)=>{if(x?.platform&&x?.url)ins.run(id,clean(x.platform,50),clean(x.url,1000),i)})});tx();res.json({ok:true});
  });

  app.post('/api/admin/bios/:id/assets',requireAdmin,(req,res)=>{
    const id=Number(req.params.id),dataUrl=String(req.body?.data_url||''),m=dataUrl.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/i);
    if(!m)return res.status(400).json({error:'Imagem inválida.'});const data=Buffer.from(m[2],'base64');if(!data.length||data.length>2000000)return res.status(400).json({error:'Imagem demasiado grande (máx. 2 MB).'});
    const info=db.prepare('INSERT INTO bio_assets(bio_id,filename,mime_type,image_data) VALUES(?,?,?,?)').run(id,clean(req.body?.filename,180)||'imagem',m[1].toLowerCase(),data);
    res.json({url:'/api/public/bio-assets/'+info.lastInsertRowid});
  });
  app.get('/api/public/bio-assets/:id',(req,res)=>{const a=db.prepare('SELECT mime_type,image_data FROM bio_assets WHERE id=?').get(Number(req.params.id));if(!a)return res.status(404).end();res.set('Content-Type',a.mime_type);res.set('Cache-Control','public,max-age=31536000,immutable');res.send(a.image_data)});

  app.get('/api/admin/bios/:id/stats',requireAdmin,(req,res)=>{
    const id=Number(req.params.id),allowed=new Set([1,7,30,90]),days=allowed.has(Number(req.query.days))?Number(req.query.days):30;
    const since=`datetime('now','-${days-1} days','start of day')`;
    const summary=db.prepare(`SELECT
      SUM(CASE WHEN event='view' THEN 1 ELSE 0 END) views,
      SUM(CASE WHEN event='click' THEN 1 ELSE 0 END) clicks,
      SUM(CASE WHEN event='social_click' THEN 1 ELSE 0 END) social_clicks,
      COUNT(DISTINCT CASE WHEN event='view' THEN date(created_at)||'|'||COALESCE(visitor_key,session_id,'') END) unique_visitors
      FROM bio_events WHERE bio_id=? AND created_at>=${since}`).get(id)||{};
    const daysRows=db.prepare(`SELECT date(created_at) day,
      SUM(CASE WHEN event='view' THEN 1 ELSE 0 END) views,
      SUM(CASE WHEN event IN ('click','social_click') THEN 1 ELSE 0 END) clicks
      FROM bio_events WHERE bio_id=? AND created_at>=${since} GROUP BY date(created_at) ORDER BY day`).all(id);
    const cards=db.prepare(`SELECT c.id,c.title,t.title section,COUNT(e.id) clicks FROM bio_cards c
      LEFT JOIN bio_tabs t ON t.id=c.tab_id
      LEFT JOIN bio_events e ON e.target_type='card' AND e.target_id=c.id AND e.event='click' AND e.created_at>=${since}
      WHERE c.bio_id=? GROUP BY c.id ORDER BY clicks DESC,c.id`).all(id);
    const socials=db.prepare(`SELECT s.platform,COUNT(e.id) clicks FROM bio_socials s
      LEFT JOIN bio_events e ON e.target_type='social' AND e.target_id=s.id AND e.event='social_click' AND e.created_at>=${since}
      WHERE s.bio_id=? GROUP BY s.platform ORDER BY clicks DESC`).all(id);
    const sources=db.prepare(`SELECT COALESCE(source,'Direto') name,COUNT(*) total FROM bio_events WHERE bio_id=? AND event='view' AND created_at>=${since} GROUP BY COALESCE(source,'Direto') ORDER BY total DESC`).all(id);
    const devices=db.prepare(`SELECT COALESCE(device,'Desktop') name,COUNT(*) total FROM bio_events WHERE bio_id=? AND event='view' AND created_at>=${since} GROUP BY COALESCE(device,'Desktop') ORDER BY total DESC`).all(id);
    res.json({days,summary:{views:Number(summary.views||0),clicks:Number(summary.clicks||0),social_clicks:Number(summary.social_clicks||0),unique_visitors:Number(summary.unique_visitors||0)},daily:daysRows,cards,socials,sources,devices});
  });

  app.get('/api/public/bio/:slug',(req,res)=>{
    const b=db.prepare('SELECT * FROM bio_sites WHERE slug=? AND is_active=1').get(req.params.slug);if(!b)return res.status(404).json({error:'Bio não encontrada.'});
    b.tabs=db.prepare('SELECT * FROM bio_tabs WHERE bio_id=? AND is_active=1 ORDER BY sort_order,id').all(b.id);
    b.cards=db.prepare('SELECT * FROM bio_cards WHERE bio_id=? AND is_active=1 ORDER BY sort_order,id').all(b.id);
    b.socials=db.prepare('SELECT * FROM bio_socials WHERE bio_id=? ORDER BY sort_order,id').all(b.id);
    res.json(b);
  });
  app.post('/api/public/bio/:slug/event',(req,res)=>{
    const b=db.prepare('SELECT id FROM bio_sites WHERE slug=? AND is_active=1').get(req.params.slug);if(!b)return res.status(404).json({error:'Bio não encontrada.'});
    const x=req.body||{},event=clean(x.event,40)||'view',eventId=clean(x.event_id,80);
    if(eventId&&db.prepare('SELECT 1 FROM bio_events WHERE event_id=?').get(eventId))return res.json({ok:true});
    const ua=String(req.headers['user-agent']||'');
    if(/bot|crawler|spider|headless|lighthouse|preview/i.test(ua))return res.json({ok:true});
    const ip=String(req.headers['x-forwarded-for']||req.ip||'unknown').split(',')[0].trim();
    const date=new Date().toISOString().slice(0,10),secret=process.env.BIO_ANALYTICS_SECRET||process.env.AUTH_SECRET||'duit-bio';
    const visitorKey=crypto.createHmac('sha256',secret).update(date+'|'+ip+'|'+ua).digest('hex');
    const device=/iPad|tablet/i.test(ua)?'Tablet':/Mobi|Android|iPhone/i.test(ua)?'Mobile':'Desktop';
    const ref=clean(x.referrer,1000)||'',host=(()=>{try{return new URL(ref).hostname.toLowerCase()}catch(_){return ''}})();
    let source='Direto';if(/instagram\.com$/.test(host))source='Instagram';else if(/facebook\.com$|fb\.com$/.test(host))source='Facebook';else if(/google\./.test(host))source='Google';else if(/tiktok\.com$/.test(host))source='TikTok';else if(host&&host!==String(req.hostname||''))source='Outros';
    try{db.prepare('INSERT INTO bio_events(bio_id,event,target_type,target_id,session_id,referrer,user_agent,visitor_key,device,source,event_id) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(b.id,event,clean(x.target_type,30),Number(x.target_id||0)||null,clean(x.session_id,100),ref,clean(ua,500),visitorKey,device,source,eventId||null)}catch(e){if(!/UNIQUE/i.test(e.message))throw e}
    res.json({ok:true});
  });

  app.get('/bio',(req,res)=>res.sendFile(path.join(__dirname,'..','public','bio.html')));
  app.get('/bio/:slug',(req,res)=>res.sendFile(path.join(__dirname,'..','public','bio.html')));
};
