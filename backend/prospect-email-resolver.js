const db=require('./db');

function ensureTable(){
  db.exec(`
    CREATE TABLE IF NOT EXISTS prospect_email_templates(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT(datetime('now')),
      updated_at TEXT DEFAULT(datetime('now'))
    );
  `);
  const has=db.prepare('SELECT id FROM prospect_email_templates LIMIT 1').get();
  if(!has){
    db.prepare(`INSERT INTO prospect_email_templates(name,subject,body,is_default,is_active)
      VALUES(?,?,?,?,1)`).run(
        'Prospecção pessoal DUIT',
        '{empresa} — reparei numa coisa',
        'Olá,\n\nSou o Nuno, da DUIT.\n\nEstive a conhecer melhor a {empresa} e reparei que {observacao}.\n\nAcho que há aqui uma oportunidade simples de melhorar este ponto.\n\nSe fizer sentido para si, basta responder a este email e digo-lhe qual seria a primeira alteração que eu faria.',
        1
      );
  }
  /* DUIT_MIGRATE_DEFAULT_OBSERVATION_COPY */
  try{
    const rows=db.prepare('SELECT id,body FROM prospect_email_templates').all();
    const upd=db.prepare("UPDATE prospect_email_templates SET body=?,updated_at=datetime('now') WHERE id=?");
    for(const row of rows){
      const old='Estive a ver a presença digital da {empresa} e notei {observacao}.';
      const newer='Estive a conhecer melhor a {empresa} e reparei que {observacao}.';
      if(String(row.body||'').includes(old))upd.run(String(row.body).replace(old,newer),row.id);
    }
  }catch(_){}
  /* DUIT_REMOVE_DUPLICATE_TEXT_SIGNATURE */
  try{
    const rows=db.prepare('SELECT id,body FROM prospect_email_templates').all();
    const upd=db.prepare("UPDATE prospect_email_templates SET body=?,updated_at=datetime('now') WHERE id=?");
    for(const row of rows){
      const clean=String(row.body||'').replace(/\n\s*Nuno\s*\n\s*DUIT\s*$/i,'').trimEnd();
      if(clean!==String(row.body||''))upd.run(clean,row.id);
    }
  }catch(_){}
  const def=db.prepare('SELECT id FROM prospect_email_templates WHERE is_default=1 AND is_active=1 ORDER BY id LIMIT 1').get();
  if(!def){
    const first=db.prepare('SELECT id FROM prospect_email_templates WHERE is_active=1 ORDER BY id LIMIT 1').get();
    if(first) db.prepare('UPDATE prospect_email_templates SET is_default=CASE WHEN id=? THEN 1 ELSE 0 END').run(first.id);
  }
}

function humanizeObservation(raw){
  let text=String(raw||'').trim().replace(/[.。!！?？]+$/,'').trim();
  if(!text) return 'há espaço para tornar a comunicação mais clara e eficaz';
  text=text.replace(/^que\s+/i,'').trim();
  if(!text) return 'há espaço para tornar a comunicação mais clara e eficaz';
  return text.charAt(0).toLocaleLowerCase('pt-PT')+text.slice(1);
}

function fill(text,p){
  const company=String(p.company||p.name||'').trim();
  const name=String(p.name||'').trim();
  const rawObservation=String(p.email_observation||'').trim();
  const observation=humanizeObservation(rawObservation);
  return String(text||'')
    .replace(/\{empresa\}/gi,company)
    .replace(/\{nome\}/gi,name)
    .replace(/\{observacao\}/gi,observation)
    .replace(/\{oportunidade\}/gi,observation);
}

function resolveProspectEmail(userId,landingPageId){
  ensureTable();
  const p=db.prepare(`SELECT u.id,u.name,u.email,u.company,c.email_observation,c.opportunity,c.idea,c.landing_page_id
    FROM users u LEFT JOIN prospect_crm c ON c.user_id=u.id
    WHERE u.id=? AND u.is_prospect=1`).get(Number(userId));
  if(!p) return null;
  const lpId=Number(landingPageId||0);
  if(lpId){
    const lp=db.prepare('SELECT * FROM landing_pages WHERE id=? AND is_active=1').get(lpId);
    if(!lp) return {error:'Landing Page não encontrada ou inativa.'};
    const subject=fill(lp.email_subject,p)||('DUIT — '+lp.title);
    const body=fill(lp.email_body,p);
    if(!body.trim()) return {error:'Esta Landing Page ainda não tem texto de email configurado.'};
    return {prospect:p,source_type:'landing_page',source_name:lp.title,landing_page:lp,template:null,subject,body};
  }
  const tpl=db.prepare('SELECT * FROM prospect_email_templates WHERE is_active=1 ORDER BY is_default DESC,id ASC LIMIT 1').get();
  if(!tpl) return {error:'Não existe nenhum modelo de email ativo.'};
  return {prospect:p,source_type:'default_template',source_name:tpl.name,landing_page:null,template:tpl,subject:fill(tpl.subject,p),body:fill(tpl.body,p)};
}

module.exports={ensureTable,fill,resolveProspectEmail};
