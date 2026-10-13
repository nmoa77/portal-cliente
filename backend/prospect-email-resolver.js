const db=require('./db');

const DEFAULT_EMAIL_BODY='Olá,\n\nSou o Nuno, da DUIT.\n\nEstive a conhecer melhor a {empresa} e reparei numa oportunidade concreta: {oportunidade}.\n\nA forma como eu abordaria isto seria simples: {ideia}.\n\nSe fizer sentido para si, responda a este email e explico-lhe como aplicaria isto à comunicação da {empresa}.';
const DEFAULT_DM_BODY='Olá 👋 Sou o Nuno, da DUIT.\n\nEstive a ver a {empresa} e reparei numa oportunidade concreta: {oportunidade}.\n\nEu abordaria isto assim: {ideia}';

function ensureTable(){
  db.exec(`
    CREATE TABLE IF NOT EXISTS prospect_email_templates(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      dm_body TEXT,
      is_default INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT(datetime('now')),
      updated_at TEXT DEFAULT(datetime('now'))
    );
  `);
  const cols=db.prepare('PRAGMA table_info(prospect_email_templates)').all().map(c=>c.name);
  if(!cols.includes('description'))db.exec('ALTER TABLE prospect_email_templates ADD COLUMN description TEXT');
  if(!cols.includes('dm_body'))db.exec('ALTER TABLE prospect_email_templates ADD COLUMN dm_body TEXT');

  const has=db.prepare('SELECT id FROM prospect_email_templates LIMIT 1').get();
  if(!has){
    db.prepare(`INSERT INTO prospect_email_templates(name,description,subject,body,dm_body,is_default,is_active)
      VALUES(?,?,?,?,?,1,1)`).run(
        'Oportunidade concreta',
        'Parte de um problema real do negócio e apresenta logo um caminho simples para o melhorar.',
        '{empresa} — reparei numa oportunidade',
        DEFAULT_EMAIL_BODY,
        DEFAULT_DM_BODY
      );
  }

  // Migra apenas o antigo modelo predefinido da DUIT; modelos personalizados ficam intactos.
  try{
    const rows=db.prepare('SELECT id,name,body,dm_body,description FROM prospect_email_templates').all();
    const upd=db.prepare("UPDATE prospect_email_templates SET body=?,dm_body=?,description=COALESCE(NULLIF(description,''),?),updated_at=datetime('now') WHERE id=?");
    for(const row of rows){
      const old1='Estive a conhecer melhor a {empresa} e reparei que {observacao}.';
      const old2='Estive a ver a presença digital da {empresa} e notei {observacao}.';
      let body=String(row.body||'');
      if(body.includes(old1)||body.includes(old2)){
        body=DEFAULT_EMAIL_BODY;
      }
      const dm=String(row.dm_body||'').trim()||DEFAULT_DM_BODY;
      if(body!==String(row.body||'')||dm!==String(row.dm_body||'')||!String(row.description||'').trim()){
        upd.run(body,dm,'Abordagem reutilizável para email e Instagram, personalizada com os dados do prospect.',row.id);
      }
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
    if(first)db.prepare('UPDATE prospect_email_templates SET is_default=CASE WHEN id=? THEN 1 ELSE 0 END').run(first.id);
  }
}

function humanize(raw,fallback=''){
  let text=String(raw||'').trim().replace(/[.。!！?？]+$/,'').trim();
  if(!text)text=String(fallback||'').trim();
  if(!text)return '';
  text=text.replace(/^que\s+/i,'').trim();
  return text?text.charAt(0).toLocaleLowerCase('pt-PT')+text.slice(1):'';
}

function fill(text,p){
  const company=String(p?.company||p?.name||'').trim();
  const name=String(p?.name||'').trim();
  const observation=humanize(p?.email_observation,'há elementos interessantes na comunicação atual');
  const opportunity=humanize(p?.opportunity,p?.email_observation||'há espaço para tornar a comunicação mais clara e consistente');
  const idea=humanize(p?.idea,'começar por transformar esse ponto numa comunicação mais clara, regular e fácil de reconhecer');
  return String(text||'')
    .replace(/\{empresa\}/gi,company)
    .replace(/\{nome\}/gi,name)
    .replace(/\{observacao\}/gi,observation)
    .replace(/\{oportunidade\}/gi,opportunity)
    .replace(/\{problema\}/gi,opportunity)
    .replace(/\{ideia\}/gi,idea);
}

function getTemplate(emailTemplateId){
  const tplId=Number(emailTemplateId||0);
  return tplId
    ?db.prepare('SELECT * FROM prospect_email_templates WHERE id=? AND is_active=1').get(tplId)
    :db.prepare('SELECT * FROM prospect_email_templates WHERE is_active=1 ORDER BY is_default DESC,id ASC LIMIT 1').get();
}

function prospectRow(userId){
  return db.prepare(`SELECT u.id,u.name,u.email,u.company,c.email_observation,c.opportunity,c.idea,c.landing_page_id,c.email_template_id
    FROM users u LEFT JOIN prospect_crm c ON c.user_id=u.id
    WHERE u.id=? AND u.is_prospect=1`).get(Number(userId));
}

function resolveProspectApproach(userId,emailTemplateId){
  ensureTable();
  const p=prospectRow(userId);
  if(!p)return null;
  const tpl=getTemplate(emailTemplateId||p.email_template_id);
  if(!tpl)return {error:'Não existe nenhuma abordagem ativa.',prospect:p};
  return {
    prospect:p,
    template:tpl,
    source_name:tpl.name,
    subject:fill(tpl.subject,p),
    body:fill(tpl.body,p),
    dm_body:fill(tpl.dm_body||DEFAULT_DM_BODY,p)
  };
}

function resolveProspectEmail(userId,landingPageId,emailTemplateId){
  ensureTable();
  const p=prospectRow(userId);
  if(!p)return null;
  const lpId=Number(landingPageId||0);
  if(lpId){
    const lp=db.prepare('SELECT * FROM landing_pages WHERE id=? AND is_active=1').get(lpId);
    if(!lp)return {error:'Landing Page não encontrada ou inativa.'};
    const subject=fill(lp.email_subject,p)||('DUIT — '+lp.title);
    const body=fill(lp.email_body,p);
    if(!body.trim())return {error:'Esta Landing Page ainda não tem texto de email configurado.'};
    return {prospect:p,source_type:'landing_page',source_name:lp.title,landing_page:lp,template:null,subject,body};
  }
  const tpl=getTemplate(emailTemplateId);
  if(!tpl)return {error:Number(emailTemplateId||0)?'A abordagem selecionada não existe ou está inativa.':'Não existe nenhuma abordagem ativa.'};
  return {prospect:p,source_type:Number(emailTemplateId||0)?'selected_template':'default_template',source_name:tpl.name,landing_page:null,template:tpl,subject:fill(tpl.subject,p),body:fill(tpl.body,p)};
}

module.exports={ensureTable,fill,resolveProspectApproach,resolveProspectEmail,DEFAULT_DM_BODY};
