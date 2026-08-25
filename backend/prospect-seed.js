const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');

const leads = [
  {company:'FocusFisio',sector:'Fisioterapia',location:'Odivelas',website:'https://www.focusfisio.com/',phone:'+351 215 834 991 / +351 968 902 922',email:'focusfisio@gmail.com',opportunity:'há espaço para aproveitar melhor as redes sociais para divulgar os serviços, criar confiança e manter a clínica mais presente junto de potenciais clientes',idea:'Campanha sazonal + conteúdos educativos',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'CFSA Clínica Fisioterapia',sector:'Fisioterapia',location:'Póvoa de Santo Adrião',phone:'+351 21 938 4354',opportunity:'as redes sociais podem ajudar a dar mais visibilidade às diferentes áreas da clínica e reforçar a confiança de quem procura acompanhamento de fisioterapia',idea:'Comunicação por especialidade + conteúdos educativos',priority:'atacar',plan:'base',monthly:150,offer:75},
  {company:'Predipereira',sector:'Imobiliário / Construção',location:'Ramada',website:'http://www.predipereira.net/',phone:'+351 219 345 933 / +351 916 032 123',email:'ppgeral@predipereira.net',opportunity:'há uma oportunidade interessante em juntar melhor as duas vertentes do negócio: os imóveis que comercializam e o trabalho ligado à construção, mostrando experiência e gerando confiança',idea:'Templates de imóveis + obras + conteúdos de conhecimento',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Ironmeka Fitness Club',sector:'Fitness',location:'Odivelas',phone:'+351 211 651 345',email:'admin@ironmeka.com',opportunity:'um ginásio tem muito mais para mostrar do que apenas o espaço: treinos, equipa, comunidade, aulas e campanhas são oportunidades constantes para manter a marca presente e gerar interesse',idea:'Campanha de inscrições + aulas + equipa',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Evolution Life Ginásio',sector:'Fitness',location:'Odivelas',website:'https://evolutionlifeginasio.wixsite.com/evolutionlife',phone:'+351 210 127 716',opportunity:'há espaço para tornar as redes mais regulares e aproveitar melhor tudo o que acontece no ginásio — desde treinos e aulas até à comunidade e campanhas de adesão',idea:'Campanhas mensais + conteúdos de aulas e captação',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'BelaDona Centro de Estética',sector:'Estética',location:'Odivelas',phone:'+351 964 406 525',opportunity:'há uma boa oportunidade para usar as redes sociais de forma mais regular na divulgação dos tratamentos, dos seus benefícios e das campanhas ao longo do mês',idea:'Campanha por tratamento + linha visual consistente',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'Luciana Abdalla Estética',sector:'Estética',location:'Odivelas',website:'https://www.luabdalla.com/',phone:'+351 932 126 314',opportunity:'as redes podem ser ainda mais aproveitadas para explicar os tratamentos, esclarecer dúvidas e reforçar a confiança de quem está a considerar marcar um serviço',idea:'Campanhas por tratamento + conteúdos de confiança',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'GoFisio',sector:'Fisioterapia',location:'Odivelas',website:'http://www.gofisio.pt',phone:'+351 928 113 921',opportunity:'há espaço para usar melhor as redes na divulgação dos serviços e na criação de conteúdos simples que esclareçam dúvidas e reforcem a confiança na clínica',idea:'Rubricas educativas + campanha de avaliação',priority:'possivel',plan:'base',monthly:150,offer:75},
  {company:'O Cantinho do João',sector:'Restauração',location:'Odivelas',website:'http://www.ocantinhodojoao.netplanos.com/',phone:'+351 21 937 6297',opportunity:'há muito conteúdo que pode ser aproveitado para dar vontade de visitar o restaurante — pratos, sugestões, menus, momentos da casa e ocasiões especiais',idea:'Menu visual + campanhas sazonais + stories',priority:'possivel',plan:'intermedio',monthly:200,offer:100}
];

const planItems = {
  base:['2 publicações por semana','Design + copy','Planeamento mensal','Agendamento e publicação','Instagram + Facebook','Consultoria básica de perfil','Relatório mensal simples'],
  intermedio:['3 publicações por semana','Até 6 stories por semana','Planeamento e gestão de destaques','Design + copy','Agendamento e publicação','Análise mensal com sugestões'],
  premium:['4 a 5 publicações por semana','Stories de segunda a sexta — até 15/semana','Edição simples de reels','Criação de campanhas e promoções','Gestão de mensagens/comentários (a definir)','Análises quinzenais']
};

function proposal(l){
  const lines=planItems[l.plan].map(x=>`✓ ${x}`).join('\n');
  return `Assunto: ${l.company} — 15 dias por nossa conta\n\nOlá,\n\nEstivemos a ver a comunicação da ${l.company} e acreditamos que ${l.opportunity}.\n\nSabemos que nem sempre há tempo para pensar no que publicar. É aí que podemos ajudar.\n\nA nossa proposta para a ${l.company} é:\n\n${lines}\n\n${l.monthly}€/mês\n\nPrimeiros 15 dias por nossa conta.\nPoupa ${l.offer}€ no arranque.\n\nQuer avançar? Responda a este email e tratamos do resto.`;
}

function ensureTables(){
  db.exec(`CREATE TABLE IF NOT EXISTS prospect_crm (
    user_id INTEGER PRIMARY KEY, sector TEXT, location TEXT, website TEXT, instagram TEXT,
    opportunity TEXT, idea TEXT, recommended_plan TEXT, solution_text TEXT,
    monthly_value REAL DEFAULT 0, offer_value REAL DEFAULT 0,
    lead_status TEXT NOT NULL DEFAULT 'por_contactar', priority TEXT NOT NULL DEFAULT 'possivel',
    first_contact_at TEXT, follow_up_at TEXT, notes TEXT, proposal_email TEXT,
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );`);
}

function seed(){
  ensureTables();
  const placeholderHash = bcrypt.hashSync(crypto.randomBytes(24).toString('hex'),10);
  const findByCompany = db.prepare(`SELECT id,email FROM users WHERE role='client' AND is_prospect=1 AND lower(company)=lower(?)`);
  const findByEmail = db.prepare(`SELECT id,email FROM users WHERE lower(email)=lower(?)`);
  const insertUser = db.prepare(`INSERT INTO users (name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES (?,?,?,?,?,?,1,0)`);
  const insertCrm = db.prepare(`INSERT OR IGNORE INTO prospect_crm (user_id,sector,location,website,opportunity,idea,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?, 'por_contactar',?,?,?,datetime('now'))`);

  for(const l of leads){
    let u=findByCompany.get(l.company);
    const internalEmail=l.email || `prospect-${l.company.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}@prospect.local`;
    if(!u && l.email) u=findByEmail.get(l.email);
    let id=u?.id;
    if(!id){ id=Number(insertUser.run(l.company,internalEmail,placeholderHash,'client',l.company,l.phone||'').lastInsertRowid); }
    insertCrm.run(id,l.sector||'',l.location||'',l.website||'',l.opportunity||'',l.idea||'',l.plan,planItems[l.plan].join('; '),l.monthly,l.offer,l.priority,l.email?'':'Email por encontrar — contacto telefónico disponível.',proposal(l));
  }
  console.log('[crm] radar comercial inicial verificado/importado');
}

try{ seed(); }catch(e){ console.warn('[crm] seed inicial:',e.message); }
