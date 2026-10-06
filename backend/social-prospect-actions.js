const db=require('./db');
module.exports=function(app,requireAdmin){
  const cols=db.prepare('PRAGMA table_info(prospect_crm)').all().map(c=>c.name);
  for(const [name,type] of [['outreach_channel','TEXT'],['dm_message','TEXT'],['dm_status','TEXT'],['dm_sent_at','TEXT']]){
    if(!cols.includes(name)) try{db.exec(`ALTER TABLE prospect_crm ADD COLUMN ${name} ${type}`)}catch(e){console.warn('[social prospect]',e.message)}
  }
  app.get('/api/crm/prospects/social',requireAdmin,(req,res)=>{
    const rows=db.prepare(`SELECT user_id,instagram,COALESCE(outreach_channel,CASE WHEN instagram IS NOT NULL AND trim(instagram)<>'' THEN 'instagram' ELSE 'email' END) outreach_channel,dm_message,COALESCE(dm_status,'por_enviar') dm_status,dm_sent_at FROM prospect_crm`).all();
    res.json(rows);
  });
  app.patch('/api/crm/prospects/:id/social',requireAdmin,(req,res)=>{
    const id=Number(req.params.id),b=req.body||{};
    const exists=db.prepare('SELECT user_id FROM prospect_crm WHERE user_id=?').get(id);if(!exists)return res.status(404).json({error:'Prospect não encontrado.'});
    const channel=['instagram','email'].includes(b.outreach_channel)?b.outreach_channel:'instagram';
    const status=['por_enviar','enviado','respondeu','interessado','sem_interesse'].includes(b.dm_status)?b.dm_status:'por_enviar';
    const msg=String(b.dm_message||'').trim().slice(0,4000);
    db.prepare(`UPDATE prospect_crm SET outreach_channel=?,dm_message=?,dm_status=?,dm_sent_at=CASE WHEN ?='enviado' THEN COALESCE(dm_sent_at,datetime('now')) ELSE dm_sent_at END,lead_status=CASE WHEN ?='enviado' AND lead_status='por_contactar' THEN 'contactado' ELSE lead_status END,first_contact_at=CASE WHEN ?='enviado' THEN COALESCE(first_contact_at,date('now')) ELSE first_contact_at END,updated_at=datetime('now') WHERE user_id=?`).run(channel,msg,status,status,status,status,id);
    res.json({ok:true,user_id:id,outreach_channel:channel,dm_message:msg,dm_status:status});
  });
};