const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');
const { requireAdmin } = require('./auth');
const { deliver, T } = require('./email');

module.exports = function installProspectCrmActions(app) {
  const cols = db.prepare(`PRAGMA table_info(prospect_crm)`).all().map(c => c.name);
  const add = (name, sql) => { if (!cols.includes(name)) db.exec(`ALTER TABLE prospect_crm ADD COLUMN ${name} ${sql}`); };
  add('email_tracking_token', 'TEXT'); add('email_sent_at', 'TEXT'); add('email_first_sent_at', 'TEXT'); add('email_send_count', 'INTEGER DEFAULT 0'); add('email_first_opened_at', 'TEXT');
  // Prospects anteriores a esta coluna: a data que já existia era o primeiro envio.
  db.prepare(`UPDATE prospect_crm SET email_first_sent_at=email_sent_at WHERE email_first_sent_at IS NULL AND email_sent_at IS NOT NULL`).run();
  db.prepare(`UPDATE prospect_crm SET email_send_count=1 WHERE email_sent_at IS NOT NULL AND COALESCE(email_send_count,0)=0`).run(); add('email_last_opened_at', 'TEXT'); add('email_open_count', 'INTEGER DEFAULT 0'); add('proposal_first_viewed_at', 'TEXT'); add('proposal_last_viewed_at', 'TEXT'); add('proposal_view_count', 'INTEGER DEFAULT 0'); add('guide_first_opened_at', 'TEXT'); add('guide_last_opened_at', 'TEXT'); add('guide_open_count', 'INTEGER DEFAULT 0'); add('outreach_response', 'TEXT'); add('outreach_response_reason', 'TEXT'); add('outreach_responded_at', 'TEXT'); add('ebook_page_id', 'INTEGER'); add('outreach_question', 'TEXT'); add('outreach_question_at', 'TEXT');

  const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
  const portal = (process.env.PORTAL_URL || 'https://cliente.duit.pt').replace(/\/+$/, '');
  const guideTarget = process.env.DUIT_GUIDE_URL || `${portal}/ebook-duit.pdf`;
  const LIMIT_30M=6, LIMIT_60M=15, DAILY_LIMIT=100;

  function favoritePage(){ try{return db.prepare(`SELECT * FROM ebook_pages WHERE active=1 ORDER BY is_favorite DESC,id ASC LIMIT 1`).get();}catch(_){return null;} }
  function resolvedPage(explicitId){ try{if(explicitId){const p=db.prepare(`SELECT * FROM ebook_pages WHERE id=? AND active=1`).get(Number(explicitId));if(p)return p;}return favoritePage();}catch(_){return null;} }
  const sentSince = mins => db.prepare(`SELECT email_sent_at FROM prospect_crm WHERE email_sent_at IS NOT NULL AND datetime(email_sent_at) > datetime('now', ?) ORDER BY datetime(email_sent_at) ASC`).all(`-${mins} minutes`);
  function sendingState(){const today=Number(db.prepare(`SELECT COUNT(*) n FROM prospect_crm WHERE email_sent_at IS NOT NULL AND date(email_sent_at,'localtime')=date('now','localtime')`).get().n||0);const m30=sentSince(10),m60=sentSince(60);let nextAt=0,reason='';if(today>=DAILY_LIMIT){const d=new Date();d.setDate(d.getDate()+1);d.setHours(0,0,0,0);nextAt=d.getTime();reason='daily';}else if(m30.length>=LIMIT_30M){nextAt=new Date(String(m30[0].email_sent_at).replace(' ','T')+'Z').getTime()+10*60000;reason='10m';}else if(m60.length>=LIMIT_60M){nextAt=new Date(String(m60[0].email_sent_at).replace(' ','T')+'Z').getTime()+60*60000;reason='60m';}return {allowed:!nextAt,reason,next_at:nextAt?new Date(nextAt).toISOString():null,today,daily_limit:DAILY_LIMIT,sent_10m:m30.length,limit_10m:LIMIT_30M,sent_60m:m60.length,limit_60m:LIMIT_60M};}

  function emailHtml(text, token) {
    const clean=String(text||'').replace(/^Assunto:.*?(\r?\n){1,2}/i,'').trim();
    const responseUrl=`${portal}/proposta?token=${encodeURIComponent(token)}`;
    const cacheKey=Date.now();
    return `<!doctype html>
<html>
<body style="margin:0;background:#f3f1ed;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#111">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:28px 14px;background:#f3f1ed">
    <tr><td align="center">
      <table role="presentation" width="640" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="width:100%;max-width:640px;background-color:#ffffff;border-radius:16px;overflow:hidden">
        <tr>
          <td style="padding:0 0 18px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px 16px 0 0;border-bottom:3px solid #ffd60a">
              <tr>
                <td style="padding:20px 26px"><img src="${portal}/logo-branco.png?v=${cacheKey}" width="138" alt="DUIT" style="display:block;border:0"></td>
                <td align="right" style="padding:20px 26px;color:#b9b9b9;font-size:11px;letter-spacing:.12em;text-transform:uppercase">DUIT START</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td style="padding:0 6px 22px;color:#2a2a2a;font-size:15px;line-height:1.7">
          ${clean?clean.replace(/\n{2,}/g,'</p><p style="margin:0 0 14px">').replace(/^/,'<p style="margin:0 0 14px">').replace(/$/,'</p>'):''}
        </td></tr>
        <tr><td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #ffd60a;border-radius:0 0 18px 18px;overflow:hidden">
            <tr><td style="padding:34px 34px 10px">
              <div style="color:#ffd60a;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px">A forma mais simples de começar</div>
              <div style="font-size:36px;line-height:1.05;font-weight:800;color:#fff;margin-bottom:16px">Experimente primeiro.</div>
              <div style="font-size:16px;line-height:1.6;color:#cfcfcf">Antes de assumir uma mensalidade, veja como a DUIT pode trabalhar a comunicação da sua empresa.</div>
            </td></tr>
            <tr><td style="padding:14px 34px 10px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" valign="top" style="padding:8px 8px 8px 0">
                    <div style="border:1px solid #333;border-radius:14px;padding:18px">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px"><tr><td align="center" valign="middle" width="40" height="40" bgcolor="#ffd60a" style="width:40px;height:40px;background:#ffd60a;border-radius:9px;color:#111;font-size:21px;font-weight:800;line-height:40px">▦</td></tr></table>
                      <div style="color:#fff;font-size:16px;font-weight:700;margin-bottom:6px">3 conteúdos completos</div>
                      <div style="color:#9e9e9e;font-size:13px;line-height:1.5">Três peças pensadas para mostrar como a sua marca pode comunicar.</div>
                    </div>
                  </td>
                  <td width="50%" valign="top" style="padding:8px 0 8px 8px">
                    <div style="border:1px solid #333;border-radius:14px;padding:18px">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px"><tr><td align="center" valign="middle" width="40" height="40" bgcolor="#ffd60a" style="width:40px;height:40px;background:#ffd60a;border-radius:9px;color:#111;font-size:21px;font-weight:800;line-height:40px">✎</td></tr></table>
                      <div style="color:#fff;font-size:16px;font-weight:700;margin-bottom:6px">Design + texto</div>
                      <div style="color:#9e9e9e;font-size:13px;line-height:1.5">Visual e mensagem trabalhados em conjunto, prontos para comunicar.</div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td width="50%" valign="top" style="padding:8px 8px 8px 0">
                    <div style="border:1px solid #333;border-radius:14px;padding:18px">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px"><tr><td align="center" valign="middle" width="40" height="40" bgcolor="#ffd60a" style="width:40px;height:40px;background:#ffd60a;border-radius:9px;color:#111;font-size:21px;font-weight:800;line-height:40px">⌂</td></tr></table>
                      <div style="color:#fff;font-size:16px;font-weight:700;margin-bottom:6px">Feito para a sua empresa</div>
                      <div style="color:#9e9e9e;font-size:13px;line-height:1.5">Nada de modelos genéricos: criamos a partir do seu negócio e objetivos.</div>
                    </div>
                  </td>
                  <td width="50%" valign="top" style="padding:8px 0 8px 8px">
                    <div style="border:1px solid #333;border-radius:14px;padding:18px">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px"><tr><td align="center" valign="middle" width="40" height="40" bgcolor="#ffd60a" style="width:40px;height:40px;background:#ffd60a;border-radius:9px;color:#111;font-size:21px;font-weight:800;line-height:40px">↻</td></tr></table>
                      <div style="color:#fff;font-size:16px;font-weight:700;margin-bottom:6px">Sem fidelização</div>
                      <div style="color:#9e9e9e;font-size:13px;line-height:1.5">Experimente por 9,99 €. Depois decide se quer continuar connosco.</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td></tr>
            <tr><td style="padding:22px 34px 30px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="middle">
                    <div style="color:#fff;font-size:42px;font-weight:800;line-height:1">9,99 €</div>
                    <div style="color:#9d9d9d;font-size:10px;letter-spacing:.13em;text-transform:uppercase;margin-top:6px">Pagamento único</div>
                  </td>
                  <td align="right" valign="middle">
                    <a href="${responseUrl}" style="display:inline-block;background:#ffd60a;color:#111;text-decoration:none;font-weight:800;font-size:15px;padding:15px 24px;border-radius:10px">Quero experimentar →</a>
                  </td>
                </tr>
              </table>
              <div style="margin-top:16px;color:#9e9e9e;font-size:12px;line-height:1.5">Se depois avançar para um plano mensal, recebe 10 € de crédito na primeira mensalidade.</div>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:18px 6px 0">
          <div style="padding-top:4px"><img src="${portal}/assinatura-email.png?v=${cacheKey}" width="360" alt="Nuno Alho — DUIT" style="display:block;width:100%;max-width:360px;height:auto;border:0"></div>
        </td></tr>
      </table>
      <img src="${portal}/api/crm/prospects/email-open/${encodeURIComponent(token)}.png" width="1" height="1" alt="">
    </td></tr>
  </table>
</body>
</html>`;
  }

  app.get('/proposta', (req,res)=>res.sendFile(require('path').join(__dirname,'..','public','prospect-response.html')));
  app.get('/api/crm/prospects/email-status',requireAdmin,(req,res)=>res.json(db.prepare(`SELECT user_id,email_sent_at,email_first_sent_at,COALESCE(email_send_count,0) email_send_count,email_first_opened_at,email_last_opened_at,COALESCE(email_open_count,0) email_open_count,proposal_first_viewed_at,proposal_last_viewed_at,COALESCE(proposal_view_count,0) proposal_view_count,guide_first_opened_at,guide_last_opened_at,COALESCE(guide_open_count,0) guide_open_count,outreach_response,outreach_response_reason,outreach_responded_at,outreach_question,outreach_question_at FROM prospect_crm`).all()));
  app.get('/api/crm/prospects/send-limit',requireAdmin,(req,res)=>res.json(sendingState()));
  app.get('/api/crm/prospects/email-open/:token.png',(req,res)=>{try{const token=String(req.params.token||'');if(token)db.prepare(`UPDATE prospect_crm SET email_first_opened_at=COALESCE(email_first_opened_at,datetime('now')),email_last_opened_at=datetime('now'),email_open_count=COALESCE(email_open_count,0)+1 WHERE email_tracking_token=?`).run(token);}catch(e){console.warn('[crm] tracking email:',e.message);}res.set('Content-Type','image/png');res.set('Cache-Control','no-store, no-cache, must-revalidate, private');res.send(pixel);});
  app.post('/api/public/prospect-outreach/:token/view',(req,res)=>{const token=String(req.params.token||'');const p=db.prepare(`SELECT user_id FROM prospect_crm WHERE email_tracking_token=?`).get(token);if(!p)return res.status(404).json({error:'Ligação inválida ou expirada.'});db.prepare(`UPDATE prospect_crm SET proposal_first_viewed_at=COALESCE(proposal_first_viewed_at,datetime('now')),proposal_last_viewed_at=datetime('now'),proposal_view_count=COALESCE(proposal_view_count,0)+1,updated_at=datetime('now') WHERE email_tracking_token=?`).run(token);res.json({ok:true});});
  app.get('/api/public/prospect-guide/:token',(req,res)=>{const token=String(req.params.token||'');const p=db.prepare(`SELECT user_id,ebook_page_id FROM prospect_crm WHERE email_tracking_token=?`).get(token);if(!p)return res.status(404).send('Ligação inválida ou expirada.');db.prepare(`UPDATE prospect_crm SET guide_first_opened_at=COALESCE(guide_first_opened_at,datetime('now')),guide_last_opened_at=datetime('now'),guide_open_count=COALESCE(guide_open_count,0)+1,updated_at=datetime('now') WHERE email_tracking_token=?`).run(token);const page=resolvedPage(p.ebook_page_id);res.set('Cache-Control','no-store');res.redirect(302,page?.pdf_path||guideTarget);});
  app.get('/api/public/prospect-outreach/:token',(req,res)=>{const p=db.prepare(`SELECT u.name,u.company,c.recommended_plan,c.monthly_value,c.offer_value,c.outreach_response,c.outreach_response_reason,c.outreach_responded_at,c.outreach_question,c.outreach_question_at,c.ebook_page_id,e.title ebook_title FROM prospect_crm c JOIN users u ON u.id=c.user_id LEFT JOIN ebook_pages e ON e.id=c.ebook_page_id WHERE c.email_tracking_token=? AND u.is_prospect=1`).get(String(req.params.token||''));if(!p)return res.status(404).json({error:'Ligação inválida ou expirada.'});res.json(p);});
  app.post('/api/public/prospect-outreach/:token/respond',(req,res)=>{const token=String(req.params.token||''),status=String(req.body?.status||''),reason=String(req.body?.reason||'').trim();if(!['accepted','rejected'].includes(status))return res.status(400).json({error:'Resposta inválida.'});const p=db.prepare(`SELECT c.user_id FROM prospect_crm c JOIN users u ON u.id=c.user_id WHERE c.email_tracking_token=? AND u.is_prospect=1`).get(token);if(!p)return res.status(404).json({error:'Ligação inválida ou expirada.'});db.prepare(`UPDATE prospect_crm SET outreach_response=?,outreach_response_reason=?,outreach_responded_at=datetime('now'),lead_status=?,updated_at=datetime('now') WHERE email_tracking_token=?`).run(status,reason,status==='accepted'?'interessado':'sem_interesse',token);res.json({ok:true,status});});
  app.post('/api/public/prospect-outreach/:token/question',(req,res)=>{const token=String(req.params.token||''),message=String(req.body?.message||'').trim();if(message.length<3)return res.status(400).json({error:'Escreva a sua dúvida antes de enviar.'});if(message.length>2000)return res.status(400).json({error:'A mensagem é demasiado longa.'});const p=db.prepare(`SELECT c.user_id,u.name,u.company,u.email FROM prospect_crm c JOIN users u ON u.id=c.user_id WHERE c.email_tracking_token=? AND u.is_prospect=1`).get(token);if(!p)return res.status(404).json({error:'Ligação inválida ou expirada.'});db.prepare(`UPDATE prospect_crm SET outreach_question=?,outreach_question_at=datetime('now'),lead_status='respondeu',updated_at=datetime('now') WHERE email_tracking_token=?`).run(message,token);try{const admins=db.prepare(`SELECT id,name,email FROM users WHERE role='admin' AND email IS NOT NULL AND TRIM(email)!=''`).all();const who=p.company||p.name||'Prospect';for(const a of admins){deliver(db,{to:a.email,subject:`Dúvida sobre proposta — ${who}`,body:`${who}${p.email?` (${p.email})`:''} enviou uma dúvida através da proposta:\n\n${message}\n\nAbra o CRM de Prospects para acompanhar este contacto.`,html:`<div style="font-family:Arial,sans-serif;color:#222;line-height:1.6"><h2 style="margin:0 0 14px">Nova dúvida sobre uma proposta</h2><p><strong>${esc(who)}</strong>${p.email?` · ${esc(p.email)}`:''}</p><div style="padding:16px;border-left:4px solid #ffd60a;background:#f7f7f4;white-space:pre-wrap">${esc(message)}</div><p style="color:#666;font-size:13px">A dúvida ficou guardada no CRM de Prospects.</p></div>`,user_id:a.id,kind:'prospect_question',force:true});}}catch(e){console.warn('[crm] notify prospect question:',e.message);}res.json({ok:true});});

  app.post('/api/crm/prospects/:id/send-email',requireAdmin,(req,res)=>{const limit=sendingState();if(!limit.allowed){const mins=Math.max(1,Math.ceil((new Date(limit.next_at).getTime()-Date.now())/60000));const msg=limit.reason==='daily'?`Limite diário de ${DAILY_LIMIT} emails atingido. Novos envios ficam disponíveis amanhã.`:limit.reason==='10m'?`Já enviou ${LIMIT_30M} emails nos últimos 10 minutos. Aguarde cerca de ${mins} min.`:`Já enviou ${LIMIT_60M} emails na última hora. Aguarde cerca de ${mins} min.`;return res.status(429).json({error:msg,send_limit:limit});}const id=Number(req.params.id);const p=db.prepare(`SELECT u.id,u.name,u.email,u.company,c.proposal_email,c.ebook_page_id FROM users u LEFT JOIN prospect_crm c ON c.user_id=u.id WHERE u.id=? AND u.is_prospect=1`).get(id);if(!p)return res.status(404).json({error:'Prospect não encontrado.'});const text=String(req.body?.text||p.proposal_email||'').trim();if(!text)return res.status(400).json({error:'O email está vazio.'});if(!p.email)return res.status(400).json({error:'Este prospect não tem email.'});const subjectMatch=text.match(/^Assunto:\s*(.+)$/mi),subject=(subjectMatch?.[1]||`${p.company||p.name} — proposta DUIT`).trim(),token=crypto.randomBytes(24).toString('hex'),chosen=resolvedPage(req.body?.ebook_page_id||p.ebook_page_id);db.prepare(`UPDATE prospect_crm SET proposal_email=?,ebook_page_id=?,email_tracking_token=?,email_first_sent_at=COALESCE(email_first_sent_at,datetime('now')),email_sent_at=datetime('now'),email_send_count=COALESCE(email_send_count,0)+1,email_first_opened_at=NULL,email_last_opened_at=NULL,email_open_count=0,proposal_first_viewed_at=NULL,proposal_last_viewed_at=NULL,proposal_view_count=0,guide_first_opened_at=NULL,guide_last_opened_at=NULL,guide_open_count=0,outreach_response=NULL,outreach_response_reason=NULL,outreach_responded_at=NULL,outreach_question=NULL,outreach_question_at=NULL,lead_status='contactado',first_contact_at=COALESCE(first_contact_at,date('now')),updated_at=datetime('now') WHERE user_id=?`).run(text,chosen?.id||null,token,id);deliver(db,{to:p.email,subject,body:text,html:emailHtml(text,token),user_id:id,kind:'prospect_outreach',force:true});res.json({ok:true,ebook_page_id:chosen?.id||null,send_limit:sendingState()});});

  app.post('/api/crm/prospects/:id/convert',requireAdmin,(req,res)=>{const id=Number(req.params.id),u=db.prepare(`SELECT * FROM users WHERE id=? AND role='client' AND is_prospect=1`).get(id);if(!u)return res.status(404).json({error:'Prospect não encontrado ou já convertido.'});const tempPassword=crypto.randomBytes(8).toString('base64url').slice(0,12),hash=bcrypt.hashSync(tempPassword,10);db.prepare(`UPDATE users SET password_hash=?,is_prospect=0,is_active=1 WHERE id=?`).run(hash,id);try{const tpl=T.welcome(u.name,u.email,tempPassword);deliver(db,{to:u.email,subject:tpl.subject,body:tpl.body,html:tpl.html,user_id:id,kind:'welcome_after_conversion',force:true});}catch(e){console.warn('[crm] welcome convert:',e.message);}res.json({ok:true});});
};