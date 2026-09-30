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
        'Olá,\n\nSou o Nuno, da DUIT.\n\nEstive a ver a presença digital da {empresa} e notei {observacao}.\n\nAcho que há aqui uma oportunidade simples de melhorar este ponto.\n\nSe fizer sentido para si, basta responder a este email e digo-lhe qual seria a primeira alteração que eu faria.\n\nNuno\nDUIT',
        1
      );
  }
  const def=db.prepare('SELECT id FROM prospect_email_templates WHERE is_default=1 AND is_active=1 ORDER BY id LIMIT 1').get();
  if(!def){
    const first=db.prepare('SELECT id FROM prospect_email_templates WHERE is_active=1 ORDER BY id LIMIT 1').get();
    if(first) db.prepare('UPDATE prospect_email_templates SET is_default=CASE WHEN id=? THEN 1 ELSE 0 END').run(first.id);
  }
}

function humanizeObservation(raw){
  let text=String(raw||'').trim().replace(/[.。!！?？]+$/,'').trim();
  if(!text) return 'que há espaço para tornar a comunicação mais clara e eficaz';

  const lower=text.toLocaleLowerCase('pt-PT');

  if(/^comunica[cç][aã]o digital regular\s+para\s+/i.test(text)){
    const rest=text.replace(/^comunica[cç][aã]o digital regular\s+para\s+/i,'').trim();
    const cleaned=rest
      .replace(/\s+a potenciais clientes$/i,'')
      .replace(/\s+para potenciais clientes$/i,'')
      .replace(/\s+e prova de trabalho/i,', prova de trabalho')
      .trim();
    return 'que há espaço para mostrar melhor '+cleaned;
  }

  if(/instagram.*identidade visual.*pouco consistente/i.test(lower) || /identidade visual.*pouco consistente/i.test(lower))
    return 'que a comunicação visual pode ganhar mais consistência';

  if(/website.*(desatualizado|antigo|datado)/i.test(lower))
    return 'que o website pode transmitir uma imagem mais atual';

  if(/boa presen[cç]a digital.*comunica[cç][aã]o pouco clara/i.test(lower) || /comunica[cç][aã]o pouco clara/i.test(lower))
    return 'que a comunicação pode ficar mais clara e direta';

  if(/publica[cç][aã]o irregular|publica[cç][oõ]es irregulares|pouca regularidade/i.test(lower))
    return 'que há margem para dar mais consistência à frequência das publicações';

  if(/servi[cç]o forte.*apresenta[cç][aã]o visual fraca|apresenta[cç][aã]o visual fraca/i.test(lower))
    return 'que a apresentação visual pode valorizar melhor a qualidade dos serviços';

  if(/redes sociais.*(paradas|inativas|sem publica[cç][aã]o|pouco ativas)/i.test(lower))
    return 'que as redes sociais podem ter uma presença mais consistente';

  if(/(servi[cç]os|projetos|equipa|diferencia[cç][aã]o|prova de trabalho)/i.test(lower) && /apresentar|mostrar|comunicar|destacar/i.test(lower)){
    const nouns=[];
    if(/servi[cç]os/i.test(lower)) nouns.push('os serviços');
    if(/projetos/i.test(lower)) nouns.push('os projetos');
    if(/equipa/i.test(lower)) nouns.push('a equipa');
    if(/diferencia[cç][aã]o/i.test(lower)) nouns.push('o que diferencia a marca');
    if(/prova de trabalho/i.test(lower)) nouns.push('a prova de trabalho');
    const phrase=nouns.length>1?nouns.slice(0,-1).join(', ')+' e '+nouns[nouns.length-1]:(nouns[0]||'a comunicação');
    return 'que há espaço para mostrar melhor '+phrase;
  }

  if(/^que\s+/i.test(text)) return text.charAt(0).toLocaleLowerCase('pt-PT')+text.slice(1);

  return 'que há espaço para tornar a comunicação mais clara e eficaz';
}

function fill(text,p){
  const company=String(p.company||p.name||'').trim();
  const name=String(p.name||'').trim();
  const rawObservation=String(p.opportunity||p.idea||'').trim();
  const observation=humanizeObservation(rawObservation);
  return String(text||'')
    .replace(/\{empresa\}/gi,company)
    .replace(/\{nome\}/gi,name)
    .replace(/\{observacao\}/gi,observation)
    .replace(/\{oportunidade\}/gi,observation);
}

function resolveProspectEmail(userId,landingPageId){
  ensureTable();
  const p=db.prepare(`SELECT u.id,u.name,u.email,u.company,c.opportunity,c.idea,c.landing_page_id
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
