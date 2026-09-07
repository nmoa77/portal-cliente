const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');

const leads = [
  {company:'Alva Restaurante',sector:'Restauração / Eventos',location:'Parque das Nações - Lisboa',website:'https://alvarestaurante.pt/',phone:'+351 913 192 863 / +351 218 954 161',email:'reservas@alvarestaurante.pt',source:'https://alvarestaurante.pt/',opportunity:'a localização no Parque das Nações, os pratos e a componente de reservas permitem uma comunicação visual frequente orientada para ocupação de mesas e grupos',idea:'Pratos + ambiente + sugestões do chef + grupos + datas especiais + reservas',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'É Um Restaurante',sector:'Restauração / Impacto Social',location:'Lisboa - São José',website:'https://www.eumrestaurante.pt/',phone:'+351 916 051 969',email:'reservas@eumrestaurante.pt',source:'https://www.eumrestaurante.pt/encomendar/',opportunity:'a proposta gastronómica e o projeto social diferenciam a marca e oferecem histórias humanas fortes para criar comunidade e aumentar reservas',idea:'Pratos + equipa + impacto social + bastidores + histórias + reservas',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Eleven Restaurant',sector:'Restauração Premium / Fine Dining',location:'Lisboa - Jardim Amália Rodrigues',website:'https://www.restauranteleven.com/',phone:'+351 213 862 211',email:'11@restauranteleven.com',source:'https://www.restauranteleven.com/pt/contactos',opportunity:'a experiência premium, gastronomia de autor e localização permitem conteúdo aspiracional de elevada qualidade para reforçar marca, eventos e reservas',idea:'Experiência Eleven + pratos + chef + vinhos + eventos + bastidores + reservas',priority:'possivel',plan:'premium',monthly:280,offer:140},
  {company:'Tabik Restaurant',sector:'Restauração / Lifestyle',location:'Lisboa - Avenida da Liberdade',website:'https://tabikrestaurant.com/',phone:'+351 213 470 549',email:'info@tabikrestaurant.com',source:'https://tabikrestaurant.com/reservas/',opportunity:'a Avenida da Liberdade, a gastronomia e o ambiente criam matéria visual constante para posicionamento, tráfego turístico e reservas',idea:'Pratos + ambiente + Avenida da Liberdade + cocktails + agenda + reservas',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Indomável Restaurante',sector:'Restauração / Gastronomia Portuguesa',location:'Lisboa - Bairro Alto',website:'https://indomavel.rest/',phone:'+351 960 396 370 / +351 911 904 075',email:'info@indomavel.rest',source:'https://indomavel.rest/reservas/',opportunity:'o conceito ligado aos sabores portugueses e a localização no Bairro Alto permitem uma narrativa visual forte para turistas, locais e reservas',idea:'Pratos + conceito português + Bairro Alto + bebidas + bastidores + reservas',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Clínica Metro Plaza',sector:'Clínica Médica / Medicina Dentária',location:'Odivelas',website:'https://www.clinicametroplaza.com/',phone:'+351 219 337 597 / +351 934 020 673',email:'geral@clinicametroplaza.com',source:'https://www.clinicametroplaza.com/en/contactos',opportunity:'a oferta multidisciplinar e a proximidade ao metro permitem trabalhar confiança local, educação em saúde e captação regular de consultas',idea:'Especialidades + equipa + prevenção + dúvidas frequentes + tecnologia + marcações',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Clínica Metamorfose',sector:'Medicina Estética / Bem-estar',location:'Odivelas',website:'https://www.clinicametamorfose.com/',phone:'+351 927 555 928',email:'geral@clinicametamorfose.com',source:'https://www.clinicametamorfose.com/contactos',opportunity:'a medicina estética avançada é altamente visual e beneficia de comunicação frequente sobre tratamentos, diferenciação, confiança e marcações',idea:'Tratamentos + educação + equipa + perguntas frequentes + resultados explicados + marcações',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Clínica Dentária Dr. José Maria Cardoso',sector:'Medicina Dentária',location:'Lisboa - Entrecampos',website:'https://www.clinicadentariajmc.com/',phone:'+351 217 931 487 / +351 912 735 001',email:'geral@clinicadentariajmc.com',source:'https://www.clinicadentariajmc.com/contactos',opportunity:'a medicina dentária permite criar autoridade e confiança com conteúdo educativo, equipa, tratamentos e respostas às dúvidas que antecedem a marcação',idea:'Tratamentos + equipa + saúde oral + FAQs + casos explicados + marcações',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'Clínica Patrão',sector:'Medicina Dentária',location:'Amadora - Moinhos da Funcheira',website:'https://www.clinicapatrao.pt/',phone:'+351 214 915 768 / +351 934 915 774',email:'geral@clinicapatrao.pt',source:'https://www.clinicapatrao.pt/contactos.html',opportunity:'uma clínica dentária local pode ganhar maior presença recorrente com educação, prova de competência, apresentação da equipa e campanhas de consulta',idea:'Especialidades + equipa + prevenção + dúvidas + tecnologia + campanhas de marcação',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'Clínica Dentária das Laranjeiras',sector:'Medicina Dentária',location:'Lisboa - Laranjeiras',website:'https://cddl.pt/',phone:'+351 929 443 780 / +351 218 224 022',email:'geral@cddl.pt',source:'https://cddl.pt/contactos/',opportunity:'o posicionamento familiar e multidisciplinar pode ser reforçado através de conteúdo consistente que humanize a equipa e eduque antes da decisão de consulta',idea:'Equipa + tratamentos + prevenção + dúvidas frequentes + rotina clínica + marcações',priority:'possivel',plan:'intermedio',monthly:200,offer:100}
];

const planItems = {
  base:['2 publicações por semana','Design + copy','Planeamento mensal','Agendamento e publicação','Adaptação Instagram/Facebook','Consultoria básica de perfil','Relatório mensal simples'],
  intermedio:['3 publicações por semana','Até 6 stories por semana','Planeamento e gestão de destaques','Design + copy','Agendamento e publicação','Análise mensal com sugestões'],
  premium:['4 a 5 publicações por semana','Stories de segunda a sexta — até 15/semana','Edição simples de reels','Criação de campanhas e promoções','Gestão de mensagens/comentários (a definir)','Análises quinzenais']
};

const blockedDomains = new Set(['gmail.com','googlemail.com','hotmail.com','hotmail.pt','outlook.com','outlook.pt','live.com','live.pt','yahoo.com','yahoo.pt','icloud.com','me.com','aol.com','sapo.pt','mail.com','example.com','example.org','example.net']);

function emailPassesStrictRules(l) {
  const email = String(l.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  const [local, domain] = email.split('@');
  if (!local || !domain || blockedDomains.has(domain)) return false;
  if (domain.includes('prospect.local') || domain.startsWith('test.') || domain.startsWith('example.')) return false;
  if (email.includes('@prospect.local') || email.startsWith('prospect-') || /^(no-?reply|noreply)/i.test(local)) return false;
  try {
    const host = new URL(l.website).hostname.replace(/^www\./,'').toLowerCase();
    if (!(domain === host || domain.endsWith('.' + host) || host.endsWith('.' + domain))) return false;
  } catch (_) { return false; }
  return Boolean(l.source && /^https?:\/\//i.test(l.source));
}

function proposal(l){
  const lines = planItems[l.plan].map(x => `✓ ${x}`).join('\n');
  const planName = l.plan === 'premium' ? 'Premium' : l.plan === 'intermedio' ? 'Intermédio' : 'Base';
  return `Assunto: ${l.company} — uma ideia concreta para as vossas redes\n\nOlá,\n\nEstivemos a analisar a comunicação da ${l.company} e identificámos uma oportunidade: ${l.opportunity}.\n\nA ideia que gostaríamos de vos apresentar é: ${l.idea}.\n\nPara a ${l.company}, recomendamos o plano ${planName}:\n\n${lines}\n\n${l.monthly}€/mês\n\nPara facilitar o arranque, os primeiros 15 dias ficam por nossa conta — uma poupança de ${l.offer}€.\n\nSe fizer sentido, respondam a este email e mostramos um exemplo visual pensado especificamente para a ${l.company}.\n\nDUIT — Design? We DUIT.`;
}

function seed(){
  const placeholderHash = bcrypt.hashSync(crypto.randomBytes(24).toString('hex'), 10);
  const findByCompany = db.prepare(`SELECT id FROM users WHERE role='client' AND is_prospect=1 AND lower(trim(company))=lower(trim(?))`);
  const findByEmail = db.prepare(`SELECT id FROM users WHERE lower(trim(email))=lower(trim(?))`);
  const insertUser = db.prepare(`INSERT INTO users (name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES (?,?,?,?,?,?,1,0)`);
  const insertCrm = db.prepare(`INSERT OR IGNORE INTO prospect_crm (user_id,sector,location,website,opportunity,idea,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?, 'por_contactar',?,?,?,datetime('now'))`);
  let added = 0, rejected = 0, duplicates = 0;
  for (const l of leads) {
    if (!emailPassesStrictRules(l)) { rejected++; continue; }
    const email = l.email.trim().toLowerCase();
    if (findByCompany.get(l.company) || findByEmail.get(email)) { duplicates++; continue; }
    const id = Number(insertUser.run(l.company,email,placeholderHash,'client',l.company,l.phone || '').lastInsertRowid);
    insertCrm.run(id,l.sector,l.location,l.website,l.opportunity,l.idea,l.plan,planItems[l.plan].join('; '),l.monthly,l.offer,l.priority,`Email profissional público confirmado. Fonte exata: ${l.source}`,proposal(l));
    added++;
  }
  console.log(`[crm] prospeção 2026-09-07: ${added} adicionados, ${duplicates} duplicados ignorados, ${rejected} rejeitados pela validação estrita`);
}

try { seed(); } catch (e) { console.warn('[crm] seed 2026-09-07:', e.message); }
