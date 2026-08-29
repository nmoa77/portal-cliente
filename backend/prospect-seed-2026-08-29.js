const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');

// Prospecção DUIT 2026-08-29 — apenas negócios com email público confirmado em fonte credível.
const leads = [
  {company:'Absolut Pets',sector:'Clínica Veterinária',location:'Odivelas',website:'https://www.absolutpets.com/',phone:'+351 210 468 068 / +351 219 325 418',email:'absolutpets@gmail.com',source:'https://www.absolutpets.com/horario-e-contactos',opportunity:'a clínica tem consultas, prevenção e acompanhamento veterinário que dão matéria para conteúdos úteis e sazonais, reforçando confiança e lembrança da marca junto dos tutores locais',idea:'Prevenção sazonal + equipa + cuidados + marcações',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Clínica Veterinária Dom Dinis',sector:'Clínica Veterinária',location:'Odivelas - Quinta Nova',website:'https://www.clinicaveterinariadomdinis.pt/',phone:'+351 219 338 652',email:'cvddinis@gmail.com',source:'https://www.clinicaveterinariadomdinis.pt/sobre-nos/contatos',opportunity:'a proximidade de uma clínica local pode ser melhor explorada com conteúdos de prevenção, bastidores e educação que aproximem a equipa dos tutores e gerem novas marcações',idea:'Cuidados sazonais + equipa + dicas + pacientes',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Hospital dos Animais',sector:'Hospital Veterinário',location:'Ramada - Odivelas',website:'https://www.hospitaldosanimais.com/',phone:'+351 219 348 550',email:'apoiocliente@hospitaldosanimais.com',source:'https://www.hospitaldosanimais.com/',opportunity:'a grande variedade de especialidades, urgências e cuidados 24 horas permite transformar conhecimento clínico em comunicação educativa, recorrente e de elevada confiança',idea:'Especialidades + prevenção + urgências + autoridade clínica',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Delinea Centro de Estética',sector:'Estética / Bem-estar',location:'Odivelas',website:'https://delineacentroestetica.pt/',phone:'+351 914 863 380',email:'info@delineacentroestetica.pt',source:'https://delineacentroestetica.pt/quem-somos/',opportunity:'os tratamentos faciais e corporais são altamente visuais e adequados a campanhas regulares, antes/depois, explicação de benefícios e conteúdos de confiança',idea:'Tratamentos + campanhas mensais + resultados + stories',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'João Andrade Clínica',sector:'Clínica Dentária',location:'Odivelas',website:'https://joaoandradeclinica.pt/',phone:'+351 211 506 468 / +351 938 393 220',email:'geral@joaoandradeclinica.pt',source:'https://joaoandradeclinica.pt/',opportunity:'a oferta completa de medicina dentária permite criar conteúdos que expliquem tratamentos, mostrem a equipa e reduzam dúvidas antes da marcação, reforçando confiança local',idea:'Tratamentos + equipa + educação + transformação do sorriso',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Nova Imobiliária',sector:'Imobiliário',location:'Odivelas - Colinas do Cruzeiro',website:'https://www.nova-imobiliaria.com/',phone:'+351 215 959 108 / +351 914 611 970',email:'geral@nova-imobiliaria.pt',source:'https://www.nova-imobiliaria.com/',opportunity:'imóveis, captação, conhecimento da zona e casos de venda criam conteúdo visual constante e uma oportunidade clara para reforçar notoriedade e gerar contactos de proprietários e compradores',idea:'Imóveis + captação + bairro + casos de venda',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Clínica Dentária Dra. Ana Chin',sector:'Clínica Dentária',location:'Odivelas',website:'https://clinicadentaria-anachin.pt/',phone:'+351 219 324 865 / +351 962 549 904',email:'geral@clinicadentaria-anachin.pt',source:'https://clinicadentaria-anachin.pt/contactos/',opportunity:'a clínica pode transformar prevenção, tratamentos e respostas a dúvidas frequentes numa presença regular que aumenta confiança e mantém a marca presente no momento de escolher dentista',idea:'Prevenção + tratamentos + perguntas frequentes + equipa',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Clínica da Póvoa',sector:'Clínica Médica / Saúde',location:'Póvoa de Santo Adrião',website:'https://www.clinicadapovoa.pt/',phone:'+351 219 386 172 / +351 919 111 807',email:'geral@clinicadapovoa.pt',source:'https://www.clinicadapovoa.pt/contact/',opportunity:'as diferentes especialidades e análises clínicas permitem criar uma comunicação organizada por serviço, com conteúdos úteis que reforçam proximidade e confiança junto da população local',idea:'Especialidades + prevenção + análises + conteúdos úteis',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'Clínica do Chapim',sector:'Clínica Dentária',location:'Odivelas',website:'https://www.clinicadochapim.com/',phone:'+351 214 008 210 / +351 913 817 618',email:'clinicadochapim@gmail.com',source:'https://www.clinicadochapim.com/contactos/',opportunity:'a medicina dentária tem uma forte componente educativa e visual, permitindo criar conteúdos que expliquem serviços, combatam objeções e gerem confiança antes da marcação',idea:'Educação oral + tratamentos + equipa + marcações',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Clínica Central da Radial',sector:'Clínica Dentária',location:'Ramada - Odivelas',website:'https://clinicacentraldaradial.pt/',phone:'+351 219 316 671 / +351 910 052 078',email:'geral@clinicacentraldaradial.com',source:'https://clinicacentraldaradial.pt/contactos',opportunity:'a clínica pode reforçar a presença local com uma linha visual consistente e conteúdos sobre prevenção, tratamentos e equipa que ajudem a transformar atenção em pedidos de consulta',idea:'Linha visual + tratamentos + prevenção + equipa',priority:'atacar',plan:'intermedio',monthly:200,offer:100}
];

const planItems = {
  base:['2 publicações por semana','Design + copy','Planeamento mensal','Agendamento e publicação','Adaptação Instagram/Facebook','Consultoria básica de perfil','Relatório mensal simples'],
  intermedio:['3 publicações por semana','Até 6 stories por semana','Planeamento e gestão de destaques','Design + copy','Agendamento e publicação','Análise mensal com sugestões'],
  premium:['4 a 5 publicações por semana','Stories de segunda a sexta — até 15/semana','Edição simples de reels','Criação de campanhas e promoções','Gestão de mensagens/comentários (a definir)','Análises quinzenais']
};

function proposal(l){
  const lines = planItems[l.plan].map(x => `✓ ${x}`).join('\n');
  return `Assunto: ${l.company} — 15 dias por nossa conta\n\nOlá,\n\nEstivemos a ver a comunicação da ${l.company} e acreditamos que ${l.opportunity}.\n\nSabemos que nem sempre há tempo para pensar no que publicar, manter uma linha visual consistente e transformar o dia a dia do negócio em conteúdos que tragam contactos. É aí que a DUIT pode ajudar.\n\nPara a ${l.company}, recomendamos:\n\n${lines}\n\n${l.monthly}€/mês\n\nPrimeiros 15 dias por nossa conta.\nPoupa ${l.offer}€ no arranque.`;
}

function seed(){
  const placeholderHash = bcrypt.hashSync(crypto.randomBytes(24).toString('hex'), 10);
  const findByCompany = db.prepare(`SELECT id FROM users WHERE role='client' AND is_prospect=1 AND lower(company)=lower(?)`);
  const findByEmail = db.prepare(`SELECT id FROM users WHERE lower(email)=lower(?)`);
  const insertUser = db.prepare(`INSERT INTO users (name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES (?,?,?,?,?,?,1,0)`);
  const insertCrm = db.prepare(`INSERT OR IGNORE INTO prospect_crm (user_id,sector,location,website,opportunity,idea,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?, 'por_contactar',?,?,?,datetime('now'))`);
  let added = 0;
  for (const l of leads) {
    const existing = findByCompany.get(l.company) || findByEmail.get(l.email);
    if (existing) continue;
    const id = Number(insertUser.run(l.company,l.email,placeholderHash,'client',l.company,l.phone || '').lastInsertRowid);
    insertCrm.run(id,l.sector,l.location,l.website,l.opportunity,l.idea,l.plan,planItems[l.plan].join('; '),l.monthly,l.offer,l.priority,`Email público confirmado. Fonte: ${l.source}`,proposal(l));
    added++;
  }
  console.log(`[crm] prospeção 2026-08-29: ${added} novos prospects importados`);
}

try { seed(); } catch (e) { console.warn('[crm] seed 2026-08-29:', e.message); }
