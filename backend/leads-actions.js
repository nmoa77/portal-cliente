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
      SELECT u.id user_id,u.name,u.company,u.email,u.phone,u.prospect_portal_active,u.prospect_portal_activated_at,
             lp.title landing_page,lp.slug landing_page_slug,
             ll.created_at lead_at,ll.utm_source,ll.utm_medium,ll.utm_campaign,ll.source_type,ll.message lead_message,ll.plan lead_plan,
             c.recommended_plan,c.monthly_value,c.notes,c.landing_page_id,
             c.email_first_sent_at,c.email_sent_at,c.email_first_opened_at,c.email_last_opened_at,
             COALESCE(c.email_open_count,0) email_open_count,
             c.proposal_first_viewed_at,c.proposal_last_viewed_at,COALESCE(c.proposal_view_count,0) proposal_view_count,
             c.outreach_response,c.outreach_response_reason,c.outreach_responded_at,c.outreach_question,c.outreach_question_at,
             COALESCE(ls.status,'novo') lead_state,ls.read_at,
             (SELECT COUNT(*) FROM prospect_portal_messages pm WHERE pm.user_id=u.id AND pm.sender='prospect' AND pm.read_by_admin_at IS NULL) unread_messages,
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
        AND NOT EXISTS (
          SELECT 1
          FROM duit_start_prospect_orders dso
          WHERE dso.user_id=u.id
        )
        AND COALESCE(lp.slug,'')<>'duit-start'
      ORDER BY datetime(COALESCE(ll.created_at,c.outreach_question_at,c.outreach_responded_at,c.updated_at)) DESC,u.id DESC
    `).all();
    res.json(rows);
  });


  app.post('/api/crm/leads/:id/activate-area',requireAdmin,(req,res)=>{
    const id=Number(req.params.id),u=db.prepare("SELECT id,name,email,company,is_prospect,prospect_portal_active FROM users WHERE id=?").get(id);
    if(!u||+u.is_prospect!==1)return res.status(404).json({error:'Lead não encontrado.'});
    if(+u.prospect_portal_active===1)return res.json({ok:true,already_active:true});
    const crypto=require('crypto'),bcrypt=require('bcryptjs'),{deliver}=require('./email');
    const password=crypto.randomBytes(6).toString('base64url').slice(0,10);
    db.prepare("UPDATE users SET password_hash=?,is_active=1,prospect_portal_active=1,prospect_portal_activated_at=datetime('now') WHERE id=?").run(bcrypt.hashSync(password,10),id);
    const portal=(process.env.PORTAL_URL||'https://cliente.duit.pt').replace(/\/+$/,'');
    const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
    const body='A DUIT criou uma área reservada para acompanhar o seu contacto connosco, consultar os planos e falar diretamente com a nossa equipa.\n\nEmail: '+u.email+'\nPalavra-passe temporária: '+password;
    const html='<div style="font-family:Arial,sans-serif;color:#111;max-width:600px;margin:auto"><h2>A sua Área DUIT está pronta</h2><p>Olá '+esc(u.name||'')+',</p><p>A DUIT criou uma área reservada para acompanhar o seu contacto connosco, consultar os planos e falar diretamente com a nossa equipa.</p><div style="padding:14px;background:#faf8f1;border-radius:10px"><strong>Email:</strong> '+esc(u.email)+'<br><strong>Palavra-passe temporária:</strong> '+esc(password)+'</div><p><a href="'+portal+'/prospect.html" style="display:inline-block;background:#ffd60a;color:#111;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:9px">Aceder à sua Área DUIT →</a></p></div>';
    deliver(db,{to:u.email,subject:'A sua Área DUIT está pronta',body,html,user_id:id,kind:'prospect_portal_activation',force:true});
    res.json({ok:true});
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