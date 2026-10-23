const db=require('./db');
const crypto=require('crypto');
const bcrypt=require('bcryptjs');
const {deliver}=require('./email');

module.exports=function(app){
  function clean(v,max=2000){return String(v??'').trim().slice(0,max)}
  function ensureWebsitePage(){
    let p=db.prepare("SELECT id FROM landing_pages WHERE slug='site-duit' LIMIT 1").get();
    if(p)return p.id;
    const key=crypto.randomBytes(9).toString('base64url');
    const x=db.prepare(`INSERT INTO landing_pages(title,slug,public_key,eyebrow,headline,intro,price_cents,credit_cents,is_active)
      VALUES(?,?,?,?,?,?,?,?,1)`).run(
        'Site DUIT','site-duit',key,'Website DUIT','Contacto através do site','Lead recebido através de duit.pt',0,0
      );
    return Number(x.lastInsertRowid);
  }

  app.post('/api/public/site-lead',(req,res)=>{
    const b=req.body||{};
    const name=clean(b.nome||b.name,150);
    const company=clean(b.empresa||b.company,150);
    const email=clean(b.email,240).toLowerCase();
    const phone=clean(b.telefone||b.phone,80);
    const area=clean(b.area,120);
    const message=clean(b.mensagem||b.message,4000);
    if(!name||!email.includes('@')||!phone||!area)return res.status(400).json({erro:'Indique nome, email, telefone e área de interesse.'});

    try{
      const landingPageId=ensureWebsitePage();
      let u=db.prepare('SELECT * FROM users WHERE lower(email)=lower(?)').get(email);
      let uid;
      if(u){
        uid=u.id;
        db.prepare(`UPDATE users SET
          name=COALESCE(NULLIF(?,''),name),
          company=COALESCE(NULLIF(?,''),company),
          phone=COALESCE(NULLIF(?,''),phone)
          WHERE id=?`).run(name,company,phone,uid);
      }else{
        const hash=bcrypt.hashSync(crypto.randomBytes(18).toString('base64url'),10);
        uid=Number(db.prepare(`INSERT INTO users(name,email,password_hash,role,company,phone,is_prospect,is_active)
          VALUES(?,?,?,?,?,?,1,1)`).run(name,email,hash,'client',company,phone).lastInsertRowid);
      }

      const note='Lead recebido através de duit.pt · Área: '+area+(message?' · '+message:'');
      db.prepare(`INSERT INTO prospect_crm(user_id,lead_status,priority,notes,landing_page_id,updated_at)
        VALUES(?,'interessado','atacar',?,?,datetime('now'))
        ON CONFLICT(user_id) DO UPDATE SET
          lead_status='interessado',
          priority='atacar',
          landing_page_id=excluded.landing_page_id,
          notes=CASE WHEN prospect_crm.notes IS NULL OR prospect_crm.notes='' THEN excluded.notes ELSE prospect_crm.notes||char(10)||excluded.notes END,
          updated_at=datetime('now')`).run(uid,note,landingPageId);

      db.prepare(`INSERT INTO landing_page_leads(
        landing_page_id,name,company,email,phone,user_id,source_type,message,plan
      ) VALUES(?,?,?,?,?,?,?,?,?)`).run(
        landingPageId,name,company,email,phone,uid,'website',message,area
      );

      try{
        const adminUrl=(process.env.PORTAL_URL||'https://cliente.duit.pt').replace(/\/+$/,'')+'/admin.html';
        const subject='Novo lead do site DUIT — '+(company||name);
        const body=['Novo contacto através de duit.pt.','','Nome: '+name,'Empresa: '+(company||'—'),'Email: '+email,'Telefone: '+phone,'Área: '+area,'Mensagem: '+(message||'—'),'','Abrir Leads: '+adminUrl].join('\n');
        deliver(db,{to:'info@duit.pt',subject,body,kind:'duit_site_new_lead',force:true});
      }catch(e){console.warn('[site] email admin:',e.message)}

      try{
        const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
        const subject='Recebemos o seu contacto — DUIT';
        const body=['Olá '+name+',','','Recebemos o seu contacto através do site da DUIT.','Entraremos em contacto consigo brevemente.','','Até breve,','Nuno · DUIT'].join('\n');
        const html='<div style="font-family:Arial,sans-serif;color:#111;line-height:1.6;max-width:620px;margin:auto"><div style="padding:24px 0"><img src="https://cliente.duit.pt/logo-email.png" alt="DUIT" width="130" style="display:block;width:130px;height:auto"></div><div style="background:#fff;border:1px solid #eee;border-radius:16px;padding:28px"><h2 style="margin:0 0 14px;font-size:26px">Recebemos o seu contacto.</h2><p>Olá '+esc(name)+',</p><p>Obrigado pelo contacto através do site da DUIT. Entraremos em contacto consigo brevemente.</p><p style="margin-top:22px">Até breve,<br><strong>Nuno · DUIT</strong></p></div></div>';
        deliver(db,{to:email,subject,body,html,user_id:uid,kind:'duit_site_lead_confirmation',force:true});
      }catch(e){console.warn('[site] confirmação cliente:',e.message)}

      res.json({ok:true});
    }catch(e){
      console.error('[site] lead:',e);
      res.status(500).json({erro:'Não foi possível enviar o pedido.'});
    }
  });
};
