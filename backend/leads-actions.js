const db=require('./db');
const {requireAdmin}=require('./auth');

module.exports=function(app){
  db.exec(`CREATE TABLE IF NOT EXISTS crm_lead_state(
    user_id INTEGER PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'novo',
    read_at TEXT,
    updated_at TEXT DEFAULT(datetime('now'))
  )`);

  app.get('/api/crm/leads',requireAdmin,(req,res)=>{
    const rows=db.prepare(`
      SELECT u.id user_id,u.name,u.company,u.email,u.phone,
             lp.title landing_page,lp.slug landing_page_slug,
             ll.created_at lead_at,ll.utm_source,ll.utm_medium,ll.utm_campaign,ll.source_type,
             c.recommended_plan,c.monthly_value,c.notes,c.landing_page_id,
             c.email_first_sent_at,c.email_sent_at,c.email_first_opened_at,c.email_last_opened_at,
             COALESCE(c.email_open_count,0) email_open_count,
             c.proposal_first_viewed_at,c.proposal_last_viewed_at,COALESCE(c.proposal_view_count,0) proposal_view_count,
             c.outreach_response,c.outreach_response_reason,c.outreach_responded_at,c.outreach_question,c.outreach_question_at,
             COALESCE(ls.status,'novo') lead_state,ls.read_at,
             CASE WHEN ll.id IS NOT NULL THEN 'formulario'
                  WHEN COALESCE(c.outreach_question,'')<>'' THEN 'mensagem'
                  WHEN COALESCE(c.outreach_response,'')<>'' THEN 'resposta'
                  ELSE 'contacto' END lead_type
      FROM users u
      JOIN prospect_crm c ON c.user_id=u.id
      LEFT JOIN landing_page_leads ll ON ll.id=(SELECT x.id FROM landing_page_leads x WHERE x.user_id=u.id ORDER BY datetime(x.created_at) DESC,x.id DESC LIMIT 1)
      LEFT JOIN landing_pages lp ON lp.id=COALESCE(ll.landing_page_id,c.landing_page_id)
      LEFT JOIN crm_lead_state ls ON ls.user_id=u.id
      WHERE u.role='client' AND u.is_prospect=1
        AND (ll.id IS NOT NULL OR COALESCE(c.outreach_question,'')<>'' OR COALESCE(c.outreach_response,'')<>'')
      ORDER BY datetime(COALESCE(ll.created_at,c.outreach_question_at,c.outreach_responded_at,c.updated_at)) DESC,u.id DESC
    `).all();
    res.json(rows);
  });

  app.post('/api/crm/leads/:id/read',requireAdmin,(req,res)=>{
    const id=Number(req.params.id);
    db.prepare(`INSERT INTO crm_lead_state(user_id,status,read_at,updated_at) VALUES(?,'lido',datetime('now'),datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET read_at=COALESCE(crm_lead_state.read_at,datetime('now')),
      status=CASE WHEN crm_lead_state.status='novo' THEN 'lido' ELSE crm_lead_state.status END,updated_at=datetime('now')`).run(id);
    res.json({ok:true});
  });

  app.patch('/api/crm/leads/:id',requireAdmin,(req,res)=>{
    const id=Number(req.params.id),status=String(req.body?.status||'');
    if(!['novo','lido','em_contacto','convertido'].includes(status))return res.status(400).json({error:'Estado inválido.'});
    db.prepare(`INSERT INTO crm_lead_state(user_id,status,read_at,updated_at) VALUES(?,?,CASE WHEN ?='novo' THEN NULL ELSE datetime('now') END,datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET status=excluded.status,read_at=CASE WHEN excluded.status='novo' THEN crm_lead_state.read_at ELSE COALESCE(crm_lead_state.read_at,datetime('now')) END,updated_at=datetime('now')`).run(id,status,status);
    res.json({ok:true});
  });
};