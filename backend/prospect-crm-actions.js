const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');
const { requireAdmin } = require('./auth');
const { deliver, T } = require('./email');

module.exports = function installProspectCrmActions(app) {
  const cols = db.prepare(`PRAGMA table_info(prospect_crm)`).all().map(c => c.name);
  const add = (name, sql) => { if (!cols.includes(name)) db.exec(`ALTER TABLE prospect_crm ADD COLUMN ${name} ${sql}`); };
  add('email_tracking_token', 'TEXT');
  add('email_sent_at', 'TEXT');
  add('email_first_opened_at', 'TEXT');
  add('email_last_opened_at', 'TEXT');
  add('email_open_count', 'INTEGER DEFAULT 0');
  add('guide_first_opened_at', 'TEXT');
  add('guide_last_opened_at', 'TEXT');
  add('guide_open_count', 'INTEGER DEFAULT 0');
  add('outreach_response', 'TEXT');
  add('outreach_response_reason', 'TEXT');
  add('outreach_responded_at', 'TEXT');

  const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const portal = (process.env.PORTAL_URL || 'https://cliente.duit.pt').replace(/\/+$/, '');
  const guideTarget = process.env.DUIT_GUIDE_URL || `${portal}/ebook-duit.pdf`;

  function emailHtml(text, token) {
    let clean = String(text || '').replace(/^Assunto:.*?(\r?\n){1,2}/i, '').trim();
    clean = clean.replace(/Quer avançar\?\s*Responda a este email e tratamos do resto\.?/gi, '').trim();
    const paragraphs = clean.split(/\n{2,}/).filter(Boolean).map(p => `<div style="margin:0 0 15px;color:#2a2a2a;font-size:15px;line-height:1.65;white-space:pre-line">${esc(p)}</div>`).join('');
    const guideUrl = `${portal}/api/public/prospect-guide/${encodeURIComponent(token)}`;
    const responseUrl = `${portal}/prospect-response.html?token=${encodeURIComponent(token)}`;
    const cacheKey = Date.now();
    return `<!doctype html><html><body style="margin:0;background:#f5f3ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:28px 14px;background:#f5f3ef"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:14px;overflow:hidden"><tr><td style="background:#0a0a0a;padding:18px 34px"><img src="${portal}/logo-branco.png?v=${cacheKey}" width="135" alt="DUIT" style="display:block;width:135px;max-width:100%;height:auto;border:0"></td></tr><tr><td style="height:4px;background:#ffd60a"></td></tr><tr><td style="padding:34px">${paragraphs}<div style="margin:28px 0 8px;padding:20px;background:#f7f7f5;border-radius:12px"><div style="font-size:15px;font-weight:700;color:#111;margin-bottom:7px">Uma pequena oferta da DUIT</div><div style="font-size:13px;line-height:1.55;color:#666;margin-bottom:14px">Preparámos um pequeno guia com curiosidades sobre design, imagem e comunicação. É apenas conteúdo — sem formulários ou registos.</div><a href="${guideUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:11px 18px;border-radius:8px">Ver guia</a></div><div style="margin:18px 0 10px"><a href="${responseUrl}" style="display:inline-block;background:#ffd60a;color:#0a0a0a;text-decoration:none;font-weight:700;font-size:15px;padding:13px 22px;border-radius:9px">Ver proposta</a></div><div style="padding-top:12px;color:#2a2a2a;font-size:15px">Cumprimentos,</div><div style="padding-top:8px"><img src="${portal}/assinatura-email.png?v=${cacheKey}" width="400" alt="Nuno Alho — DUIT" style="display:block;width:100%;max-width:400px;height:auto;border:0"></div></td></tr></table><img src="${portal}/api/crm/prospects/email-open/${encodeURIComponent(token)}.png" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0"></td></tr></table></body></html>`;
  }

  app.get('/api/crm/prospects/email-status', requireAdmin, (req,res) => {
    res.json(db.prepare(`SELECT user_id,email_sent_at,email_first_opened_at,email_last_opened_at,COALESCE(email_open_count,0) email_open_count,guide_first_opened_at,guide_last_opened_at,COALESCE(guide_open_count,0) guide_open_count,outreach_response,outreach_response_reason,outreach_responded_at FROM prospect_crm`).all());
  });

  app.get('/api/crm/prospects/email-open/:token.png', (req, res) => {
    try { const token=String(req.params.token||''); if(token) db.prepare(`UPDATE prospect_crm SET email_first_opened_at=COALESCE(email_first_opened_at,datetime('now')),email_last_opened_at=datetime('now'),email_open_count=COALESCE(email_open_count,0)+1 WHERE email_tracking_token=?`).run(token); } catch(e){ console.warn('[crm] tracking email:',e.message); }
    res.set('Content-Type','image/png'); res.set('Cache-Control','no-store, no-cache, must-revalidate, private'); res.send(pixel);
  });

  app.get('/api/public/prospect-guide/:token', (req,res) => {
    const token=String(req.params.token||'');
    const p=db.prepare(`SELECT user_id FROM prospect_crm WHERE email_tracking_token=?`).get(token);
    if(!p) return res.status(404).send('Ligação inválida ou expirada.');
    db.prepare(`UPDATE prospect_crm SET guide_first_opened_at=COALESCE(guide_first_opened_at,datetime('now')),guide_last_opened_at=datetime('now'),guide_open_count=COALESCE(guide_open_count,0)+1,updated_at=datetime('now') WHERE email_tracking_token=?`).run(token);
    res.set('Cache-Control','no-store'); res.redirect(302, guideTarget);
  });

  app.get('/api/public/prospect-outreach/:token', (req,res) => {
    const p=db.prepare(`SELECT u.name,u.company,c.recommended_plan,c.monthly_value,c.offer_value,c.outreach_response,c.outreach_response_reason,c.outreach_responded_at FROM prospect_crm c JOIN users u ON u.id=c.user_id WHERE c.email_tracking_token=? AND u.is_prospect=1`).get(String(req.params.token||''));
    if(!p) return res.status(404).json({error:'Ligação inválida ou expirada.'}); res.json(p);
  });

  app.post('/api/public/prospect-outreach/:token/respond', (req,res) => {
    const token=String(req.params.token||''); const status=String(req.body?.status||''); const reason=String(req.body?.reason||'').trim();
    if(!['accepted','rejected'].includes(status)) return res.status(400).json({error:'Resposta inválida.'});
    const p=db.prepare(`SELECT c.user_id FROM prospect_crm c JOIN users u ON u.id=c.user_id WHERE c.email_tracking_token=? AND u.is_prospect=1`).get(token);
    if(!p) return res.status(404).json({error:'Ligação inválida ou expirada.'});
    db.prepare(`UPDATE prospect_crm SET outreach_response=?,outreach_response_reason=?,outreach_responded_at=datetime('now'),lead_status=?,updated_at=datetime('now') WHERE email_tracking_token=?`).run(status,reason,status==='accepted'?'interessado':'sem_interesse',token); res.json({ok:true,status});
  });

  app.post('/api/crm/prospects/:id/send-email', requireAdmin, (req,res) => {
    const id=Number(req.params.id); const p=db.prepare(`SELECT u.id,u.name,u.email,u.company,c.proposal_email FROM users u LEFT JOIN prospect_crm c ON c.user_id=u.id WHERE u.id=? AND u.is_prospect=1`).get(id);
    if(!p) return res.status(404).json({error:'Prospect não encontrado.'});
    const text=String(req.body?.text||p.proposal_email||'').trim(); if(!text) return res.status(400).json({error:'O email está vazio.'}); if(!p.email) return res.status(400).json({error:'Este prospect não tem email.'});
    const subjectMatch=text.match(/^Assunto:\s*(.+)$/mi); const subject=(subjectMatch?.[1]||`${p.company||p.name} — proposta DUIT`).trim(); const token=crypto.randomBytes(24).toString('hex');
    db.prepare(`UPDATE prospect_crm SET proposal_email=?,email_tracking_token=?,email_sent_at=datetime('now'),email_first_opened_at=NULL,email_last_opened_at=NULL,email_open_count=0,guide_first_opened_at=NULL,guide_last_opened_at=NULL,guide_open_count=0,outreach_response=NULL,outreach_response_reason=NULL,outreach_responded_at=NULL,lead_status='contactado',first_contact_at=COALESCE(first_contact_at,date('now')),updated_at=datetime('now') WHERE user_id=?`).run(text,token,id);
    deliver(db,{to:p.email,subject,body:text,html:emailHtml(text,token),user_id:id,kind:'prospect_outreach',force:true}); res.json({ok:true});
  });

  app.post('/api/crm/prospects/:id/convert', requireAdmin, (req,res) => {
    const id=Number(req.params.id); const u=db.prepare(`SELECT * FROM users WHERE id=? AND role='client' AND is_prospect=1`).get(id);
    if(!u) return res.status(404).json({error:'Prospect não encontrado ou já convertido.'});
    const tempPassword=crypto.randomBytes(8).toString('base64url').slice(0,12); const hash=bcrypt.hashSync(tempPassword,10); db.prepare(`UPDATE users SET password_hash=?,is_prospect=0,is_active=1 WHERE id=?`).run(hash,id);
    try { const tpl=T.welcome(u.name,u.email,tempPassword); deliver(db,{to:u.email,subject:tpl.subject,body:tpl.body,html:tpl.html,user_id:id,kind:'welcome_after_conversion',force:true}); } catch(e){ console.warn('[crm] welcome convert:',e.message); }
    res.json({ok:true});
  });
};
