const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');

// Terceira ronda DUIT — apenas prospects com email público confirmado.
const leads = [
  {company:'Siluet',sector:'Clínica de Estética',location:'Odivelas - Colinas do Cruzeiro',website:'https://siluet.pt/',phone:'+351 211 380 794 / +351 910 021 681',email:'geral@siluet.pt',opportunity:'a variedade de tratamentos e a componente visual da estética permitem criar campanhas regulares, explicar benefícios e manter a clínica presente no momento em que potenciais clientes decidem marcar',idea:'Tratamentos + campanhas + conteúdos de confiança',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Clínica Nova Aliança',sector:'Fisioterapia / Saúde',location:'Ramada - Odivelas',website:'https://clinicanovaalianca.pt/',phone:'+351 927 420 963',email:'geral@clinicanovaalianca.pt',opportunity:'a especialização em fisioterapia, medicina desportiva e recuperação dá matéria para conteúdos educativos que reforçam autoridade e ajudam a gerar novas marcações',idea:'Fisioterapia + recuperação + autoridade da equipa',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'City Realty Odivelas',sector:'Imobiliário',location:'Odivelas',website:'https://www.city-realty.pt/',phone:'+351 216 073 244 / +351 937 548 820',email:'odivelas@city-realty.pt',opportunity:'imóveis, equipa, conhecimento local e casos de venda permitem uma comunicação muito visual e frequente, capaz de reforçar a presença da agência na zona de Odivelas',idea:'Imóveis + equipa + conhecimento local + captação',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Centro de Recuperação Física de Bucelas',sector:'Fisioterapia / Recuperação',location:'Bucelas - Loures',website:'https://fisioterapiasloures.com/',phone:'+351 210 183 266',email:'isabeln2011@hotmail.com',opportunity:'os vários tratamentos de recuperação podem ser transformados em conteúdos simples e úteis que expliquem problemas comuns e mantenham o centro presente junto do público local',idea:'Patologias + tratamentos + conteúdos educativos',priority:'possivel',plan:'base',monthly:150,offer:75},
  {company:'Medixira - Centro de Reabilitação de Odivelas',sector:'Fisioterapia / Reabilitação',location:'Odivelas',website:'https://medixira.com/',phone:'+351 219 328 655',email:'geral@medixira.com',opportunity:'a diversidade de cuidados de reabilitação permite organizar uma comunicação por especialidade, esclarecer dúvidas e reforçar confiança antes do primeiro contacto',idea:'Especialidades + educação + marcações',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Albeguilerto',sector:'Construção Civil / Remodelações',location:'Odivelas',website:'https://www.albeguilerto.pt/',phone:'+351 933 157 272',email:'geral@albeguilerto.pt',opportunity:'obras, remodelações e reabilitações geram conteúdo visual forte para mostrar qualidade, processo e resultados, ajudando a transformar trabalhos realizados em novos pedidos de orçamento',idea:'Antes/depois + obras + processo + confiança',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Odiconstroi',sector:'Construção / Remodelações',location:'Odivelas',website:'https://odiconstroi.pt/',phone:'+351 910 586 967 / +351 910 586 969',email:'geral@odiconstroi.pt',opportunity:'a construção e remodelação têm uma componente visual muito forte e cada obra pode alimentar conteúdos de processo, detalhe e resultado que ajudam futuros clientes a perceber a qualidade do trabalho',idea:'Obras + antes/depois + bastidores + pedidos de orçamento',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Move Clinics - Odiset Odivelas',sector:'Fisioterapia / Saúde',location:'Odivelas',website:'https://moveclinics.pt/pt/clinica-odivelas',phone:'+351 219 348 313 / +351 968 484 940',email:'odiset@moveclinics.pt',opportunity:'a clínica tem várias especialidades e uma presença local consolidada que pode ser aproveitada em conteúdos educativos, apresentação da equipa e comunicação regular dos serviços',idea:'Especialidades + equipa + educação + marcações',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Centro de Fisioterapia dos Pedernais',sector:'Fisioterapia / Saúde',location:'Ramada - Odivelas',website:'https://www.centrofisioterapiapedernais.pt/',phone:'+351 210 467 366 / +351 966 561 500',email:'c.fisiotpedernais@sapo.pt',opportunity:'a experiência clínica, os tratamentos ao domicílio e a disponibilidade alargada são diferenciais que podem ser comunicados de forma mais clara e consistente para aumentar notoriedade local',idea:'Diferenciais + tratamentos + equipa + conteúdos úteis',priority:'possivel',plan:'base',monthly:150,offer:75},
  {company:'Clínica VetLoures',sector:'Clínica Veterinária',location:'Loures',website:'https://clinicavetloures.pt/',phone:'+351 216 096 426',email:'geral@clinicavetloures.pt',opportunity:'saúde animal oferece temas úteis, sazonais e próximos das pessoas, permitindo manter a clínica presente junto dos tutores e reforçar confiança na equipa',idea:'Prevenção + cuidados sazonais + equipa + pacientes',priority:'atacar',plan:'intermedio',monthly:200,offer:100}
];

const planItems={
  base:['2 publicações por semana','Design + copy','Planeamento mensal','Agendamento e publicação','Adaptação Instagram/Facebook','Consultoria básica de perfil','Relatório mensal simples'],
  intermedio:['3 publicações por semana','Até 6 stories por semana','Planeamento e gestão de destaques','Design + copy','Agendamento e publicação','Análise mensal com sugestões']
};

function proposal(l){
  const lines=planItems[l.plan].map(x=>`✓ ${x}`).join('\n');
  return `Assunto: ${l.company} — 15 dias por nossa conta\n\nOlá,\n\nEstivemos a ver a comunicação da ${l.company} e acreditamos que ${l.opportunity}.\n\nSabemos que nem sempre há tempo para pensar no que publicar. É aí que podemos ajudar.\n\nA nossa proposta para a ${l.company} é:\n\n${lines}\n\n${l.monthly}€/mês\n\nPrimeiros 15 dias por nossa conta.\nPoupa ${l.offer}€ no arranque.`;
}

function seed(){
  const placeholderHash=bcrypt.hashSync(crypto.randomBytes(24).toString('hex'),10);
  const findByCompany=db.prepare(`SELECT id FROM users WHERE role='client' AND is_prospect=1 AND lower(company)=lower(?)`);
  const findByEmail=db.prepare(`SELECT id FROM users WHERE lower(email)=lower(?)`);
  const insertUser=db.prepare(`INSERT INTO users (name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES (?,?,?,?,?,?,1,0)`);
  const insertCrm=db.prepare(`INSERT OR IGNORE INTO prospect_crm (user_id,sector,location,website,opportunity,idea,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?, 'por_contactar',?,?,?,datetime('now'))`);
  let added=0;
  for(const l of leads){
    let u=findByCompany.get(l.company) || findByEmail.get(l.email);
    if(u) continue;
    const id=Number(insertUser.run(l.company,l.email,placeholderHash,'client',l.company,l.phone).lastInsertRowid);
    insertCrm.run(id,l.sector,l.location,l.website,l.opportunity,l.idea,l.plan,planItems[l.plan].join('; '),l.monthly,l.offer,l.priority,'Email público confirmado antes da importação.',proposal(l));
    added++;
  }
  console.log(`[crm] ronda email verificado: ${added} novos prospects importados`);
}

try{seed();}catch(e){console.warn('[crm] seed email verificado:',e.message);}
