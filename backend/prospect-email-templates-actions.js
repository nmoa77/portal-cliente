const db=require('./db');
const {requireAdmin}=require('./auth');
const {ensureTable,resolveProspectEmail}=require('./prospect-email-resolver');

module.exports=function(app){
  ensureTable();

  app.get('/api/admin/prospect-email-templates',requireAdmin,(req,res)=>{
    res.json(db.prepare('SELECT * FROM prospect_email_templates ORDER BY is_default DESC,id ASC').all());
  });

  app.post('/api/admin/prospect-email-templates',requireAdmin,(req,res)=>{
    const b=req.body||{},name=String(b.name||'').trim(),subject=String(b.subject||'').trim(),body=String(b.body||'').trim();
    if(!name||!subject||!body)return res.status(400).json({error:'Indique nome, assunto e texto do email.'});
    const tx=db.transaction(()=>{
      if(Number(b.is_default||0)===1)db.prepare('UPDATE prospect_email_templates SET is_default=0').run();
      const x=db.prepare(`INSERT INTO prospect_email_templates(name,subject,body,is_default,is_active,updated_at)
        VALUES(?,?,?,?,?,datetime('now'))`).run(name.slice(0,120),subject.slice(0,250),body.slice(0,12000),Number(b.is_default||0)===1?1:0,b.is_active===false?0:1);
      if(!db.prepare('SELECT id FROM prospect_email_templates WHERE is_default=1 AND is_active=1').get())db.prepare('UPDATE prospect_email_templates SET is_default=1 WHERE id=?').run(x.lastInsertRowid);
      return x.lastInsertRowid;
    });
    res.json({ok:true,id:tx()});
  });

  app.patch('/api/admin/prospect-email-templates/:id',requireAdmin,(req,res)=>{
    const id=Number(req.params.id),cur=db.prepare('SELECT * FROM prospect_email_templates WHERE id=?').get(id);
    if(!cur)return res.status(404).json({error:'Modelo não encontrado.'});
    const b=req.body||{},name=b.name===undefined?cur.name:String(b.name||'').trim(),subject=b.subject===undefined?cur.subject:String(b.subject||'').trim(),body=b.body===undefined?cur.body:String(b.body||'').trim(),makeDefault=b.is_default===undefined?Number(cur.is_default):Number(Boolean(b.is_default));let active=b.is_active===undefined?Number(cur.is_active):Number(Boolean(b.is_active));
    if(!name||!subject||!body)return res.status(400).json({error:'Nome, assunto e texto são obrigatórios.'});
    const tx=db.transaction(()=>{
      if(makeDefault){db.prepare('UPDATE prospect_email_templates SET is_default=0').run();active=1;}
      db.prepare(`UPDATE prospect_email_templates SET name=?,subject=?,body=?,is_default=?,is_active=?,updated_at=datetime('now') WHERE id=?`).run(name.slice(0,120),subject.slice(0,250),body.slice(0,12000),makeDefault,active,id);
      if(!db.prepare('SELECT id FROM prospect_email_templates WHERE is_default=1 AND is_active=1').get()){
        const first=db.prepare('SELECT id FROM prospect_email_templates WHERE is_active=1 ORDER BY id LIMIT 1').get();
        if(first)db.prepare('UPDATE prospect_email_templates SET is_default=CASE WHEN id=? THEN 1 ELSE 0 END').run(first.id);
      }
    });
    tx();res.json({ok:true});
  });

  app.delete('/api/admin/prospect-email-templates/:id',requireAdmin,(req,res)=>{
    const id=Number(req.params.id),cur=db.prepare('SELECT * FROM prospect_email_templates WHERE id=?').get(id);
    if(!cur)return res.status(404).json({error:'Modelo não encontrado.'});
    if(Number(cur.is_default)===1)return res.status(400).json({error:'Defina outro modelo como predefinido antes de apagar este.'});
    db.prepare('DELETE FROM prospect_email_templates WHERE id=?').run(id);res.json({ok:true});
  });

  app.get('/api/crm/prospects/:id/email-preview',requireAdmin,(req,res)=>{
    const resolved=resolveProspectEmail(Number(req.params.id),Number(req.query.landing_page_id||0));
    if(!resolved)return res.status(404).json({error:'Prospect não encontrado.'});
    if(resolved.error)return res.status(400).json({error:resolved.error});
    const portal=(process.env.PORTAL_URL||'https://cliente.duit.pt').replace(/\/+$/,'');
    res.json({
      source_type:resolved.source_type,
      source_name:resolved.source_name,
      subject:resolved.subject,
      body:resolved.body,
      landing_page_id:resolved.landing_page?.id||null,
      url:resolved.landing_page?portal+'/'+encodeURIComponent(resolved.landing_page.public_key):null
    });
  });
};
