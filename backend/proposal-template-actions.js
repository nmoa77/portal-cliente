const db = require('./db');
const { requireAdmin } = require('./auth');

function ensureSchema(){
  db.exec(`
    CREATE TABLE IF NOT EXISTS proposal_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL DEFAULT 'standard',
      is_active INTEGER NOT NULL DEFAULT 1,
      is_default INTEGER NOT NULL DEFAULT 0,
      config TEXT NOT NULL DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS duit_start_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quote_id INTEGER NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'briefing',
      price REAL NOT NULL DEFAULT 19.99,
      content_count INTEGER NOT NULL DEFAULT 3,
      business_description TEXT,
      communication_goal TEXT,
      audience TEXT,
      links TEXT,
      materials TEXT,
      exclusions TEXT,
      payment_method TEXT,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS duit_start_contents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      position INTEGER NOT NULL,
      title TEXT,
      image_url TEXT,
      post_text TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (order_id) REFERENCES duit_start_orders(id) ON DELETE CASCADE,
      UNIQUE(order_id, position)
    );
  `);
  const cols=db.prepare(`PRAGMA table_info(quotes)`).all();
  if(!cols.some(c=>c.name==='template_id')) db.exec(`ALTER TABLE quotes ADD COLUMN template_id INTEGER`);

  const standardConfig=JSON.stringify({showStart:false});
  const startConfig=JSON.stringify({showStart:true,startPrice:19.99,contentCount:3,discountOnFirstMonth:19.99});
  db.prepare(`INSERT OR IGNORE INTO proposal_templates (key,name,description,type,is_active,is_default,config) VALUES ('standard','Proposta Standard','Modelo atual da proposta DUIT.','standard',1,1,?)`).run(standardConfig);
  db.prepare(`INSERT OR IGNORE INTO proposal_templates (key,name,description,type,is_active,is_default,config) VALUES ('duit-start','DUIT Start — 19,99 €','Planos mensais + experiência DUIT Start com 3 conteúdos.','duit_start',1,0,?)`).run(startConfig);
  db.prepare(`UPDATE proposal_templates SET name='DUIT Start — 19,99 €',config=? WHERE key='duit-start'`).run(startConfig);
  const standard=db.prepare(`SELECT id FROM proposal_templates WHERE key='standard'`).get();
  db.prepare(`UPDATE quotes SET template_id=? WHERE template_id IS NULL`).run(standard.id);

  db.exec(`DROP TRIGGER IF EXISTS trg_quotes_proposal_template`);
  db.exec(`CREATE TRIGGER trg_quotes_proposal_template AFTER INSERT ON quotes
    WHEN NEW.template_id IS NULL
    BEGIN
      UPDATE quotes SET template_id=(SELECT id FROM proposal_templates WHERE is_default=1 AND is_active=1 ORDER BY id LIMIT 1) WHERE id=NEW.id;
    END;`);
}

function templateRow(row){
  if(!row) return null;
  let config={}; try{config=JSON.parse(row.config||'{}')}catch(e){}
  return {...row,config};
}

module.exports=function install(app){
  ensureSchema();

  app.get('/api/proposal-templates', requireAdmin, (req,res)=>{
    res.json(db.prepare(`SELECT * FROM proposal_templates ORDER BY is_default DESC,id`).all().map(templateRow));
  });

  app.patch('/api/proposal-templates/:id', requireAdmin, (req,res)=>{
    const row=db.prepare(`SELECT * FROM proposal_templates WHERE id=?`).get(req.params.id);
    if(!row) return res.status(404).json({error:'Template não encontrado.'});
    const {name,description,is_active,config}=req.body||{};
    db.prepare(`UPDATE proposal_templates SET name=COALESCE(?,name),description=COALESCE(?,description),is_active=COALESCE(?,is_active),config=COALESCE(?,config),updated_at=datetime('now') WHERE id=?`).run(
      name??null,description??null,is_active===undefined?null:(is_active?1:0),config===undefined?null:JSON.stringify(config),row.id
    );
    res.json({ok:true});
  });

  app.post('/api/proposal-templates/:id/default', requireAdmin, (req,res)=>{
    const row=db.prepare(`SELECT * FROM proposal_templates WHERE id=? AND is_active=1`).get(req.params.id);
    if(!row) return res.status(404).json({error:'Template ativo não encontrado.'});
    const tx=db.transaction(()=>{db.prepare(`UPDATE proposal_templates SET is_default=0`).run();db.prepare(`UPDATE proposal_templates SET is_default=1,updated_at=datetime('now') WHERE id=?`).run(row.id)});tx();
    res.json({ok:true});
  });

  app.patch('/api/quotes/:id/template', requireAdmin, (req,res)=>{
    const t=db.prepare(`SELECT id FROM proposal_templates WHERE id=? AND is_active=1`).get(req.body?.template_id);
    if(!t) return res.status(400).json({error:'Template inválido.'});
    const q=db.prepare(`SELECT id,first_viewed_at FROM quotes WHERE id=?`).get(req.params.id);
    if(!q) return res.status(404).json({error:'Proposta não encontrada.'});
    if(q.first_viewed_at) return res.status(409).json({error:'Esta proposta já foi vista. O template ficou bloqueado para preservar a versão enviada.'});
    db.prepare(`UPDATE quotes SET template_id=? WHERE id=?`).run(t.id,q.id);
    res.json({ok:true});
  });

  app.get('/api/public/quote-template/:token',(req,res)=>{
    const q=db.prepare(`SELECT q.id,q.user_id,q.template_id,pt.key,pt.name,pt.type,pt.config FROM quotes q LEFT JOIN proposal_templates pt ON pt.id=q.template_id WHERE q.public_token=?`).get(req.params.token);
    if(!q) return res.status(404).json({error:'Proposta não encontrada.'});
    const t=templateRow(q);
    const order=db.prepare(`SELECT id,status,price,content_count,payment_status FROM duit_start_orders WHERE quote_id=?`).get(q.id)||null;
    res.json({template:{id:q.template_id,key:q.key||'standard',name:q.name||'Proposta Standard',type:q.type||'standard',config:t.config},duit_start:order});
  });

  app.post('/api/public/duit-start/:token',(req,res)=>{
    const q=db.prepare(`SELECT q.id,q.user_id,pt.type,pt.config FROM quotes q LEFT JOIN proposal_templates pt ON pt.id=q.template_id WHERE q.public_token=?`).get(req.params.token);
    if(!q) return res.status(404).json({error:'Proposta não encontrada.'});
    if(q.type!=='duit_start') return res.status(400).json({error:'DUIT Start não está disponível nesta proposta.'});
    let cfg={};try{cfg=JSON.parse(q.config||'{}')}catch(e){}
    const b=req.body||{};
    const existing=db.prepare(`SELECT id FROM duit_start_orders WHERE quote_id=?`).get(q.id);
    if(existing){
      db.prepare(`UPDATE duit_start_orders SET business_description=?,communication_goal=?,audience=?,links=?,materials=?,exclusions=?,payment_method=?,status='awaiting_payment',updated_at=datetime('now') WHERE id=?`).run(b.business_description||'',b.communication_goal||'',b.audience||'',b.links||'',b.materials||'',b.exclusions||'',b.payment_method||'',existing.id);
      return res.json({ok:true,id:existing.id,status:'awaiting_payment'});
    }
    const info=db.prepare(`INSERT INTO duit_start_orders (quote_id,user_id,status,price,content_count,business_description,communication_goal,audience,links,materials,exclusions,payment_method) VALUES (?,?, 'awaiting_payment',?,?,?,?,?,?,?,?,?)`).run(q.id,q.user_id,Number(cfg.startPrice||19.99),Number(cfg.contentCount||3),b.business_description||'',b.communication_goal||'',b.audience||'',b.links||'',b.materials||'',b.exclusions||'',b.payment_method||'');
    res.status(201).json({ok:true,id:info.lastInsertRowid,status:'awaiting_payment'});
  });

  app.get('/api/duit-start-orders', requireAdmin, (req,res)=>{
    const rows=db.prepare(`SELECT o.*,q.number quote_number,u.name client_name,u.company client_company,u.email client_email FROM duit_start_orders o JOIN quotes q ON q.id=o.quote_id JOIN users u ON u.id=o.user_id ORDER BY o.created_at DESC`).all();
    res.json(rows);
  });

  app.patch('/api/duit-start-orders/:id', requireAdmin, (req,res)=>{
    const {status,payment_status}=req.body||{};
    db.prepare(`UPDATE duit_start_orders SET status=COALESCE(?,status),payment_status=COALESCE(?,payment_status),updated_at=datetime('now') WHERE id=?`).run(status??null,payment_status??null,req.params.id);
    res.json({ok:true});
  });

  app.put('/api/duit-start-orders/:id/contents/:position', requireAdmin, (req,res)=>{
    const pos=Math.max(1,Math.min(3,Number(req.params.position)||1));
    const {title,image_url,post_text}=req.body||{};
    db.prepare(`INSERT INTO duit_start_contents (order_id,position,title,image_url,post_text) VALUES (?,?,?,?,?) ON CONFLICT(order_id,position) DO UPDATE SET title=excluded.title,image_url=excluded.image_url,post_text=excluded.post_text`).run(req.params.id,pos,title||`Conteúdo ${pos}`,image_url||'',post_text||'');
    const count=db.prepare(`SELECT COUNT(*) c FROM duit_start_contents WHERE order_id=? AND (image_url!='' OR post_text!='')`).get(req.params.id).c;
    if(count>=3) db.prepare(`UPDATE duit_start_orders SET status='ready',updated_at=datetime('now') WHERE id=?`).run(req.params.id);
    res.json({ok:true});
  });

  app.get('/api/public/duit-start/:token',(req,res)=>{
    const order=db.prepare(`SELECT o.id,o.status,o.price,o.content_count,o.payment_status,q.number,u.company client_company,u.name client_name FROM duit_start_orders o JOIN quotes q ON q.id=o.quote_id JOIN users u ON u.id=o.user_id WHERE q.public_token=?`).get(req.params.token);
    if(!order) return res.status(404).json({error:'DUIT Start ainda não iniciado.'});
    const contents=db.prepare(`SELECT position,title,image_url,post_text FROM duit_start_contents WHERE order_id=? ORDER BY position`).all(order.id);
    res.json({...order,contents,can_convert:order.status==='ready'&&contents.length>=3});
  });
};
