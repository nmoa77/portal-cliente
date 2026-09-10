const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');

const leads = [
  {company:'RS Imobiliária',sector:'Imobiliário',location:'Ronfe - Guimarães',website:'https://imobiliariars.pt/',phone:'+351 934 311 801',email:'geral@imobiliariars.pt',source:'https://imobiliariars.pt/',opportunity:'a carteira de imóveis e o posicionamento local permitem criar comunicação recorrente para proprietários e compradores, combinando imóveis, mercado e confiança no processo',idea:'Imóveis em destaque + visitas + dicas para proprietários + mercado local + bastidores',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Union Coworking',sector:'Coworking / Centro de Negócios',location:'Braga',website:'https://unioncoworking.pt/',phone:'+351 253 272 168 / +351 933 940 357',email:'geral@unioncoworking.pt',source:'https://unioncoworking.pt/politica-de-privacidade/',opportunity:'um espaço de coworking vive de comunidade, ocupação e eventos, criando necessidade de comunicação contínua para mostrar ambiente, vantagens e disponibilidade',idea:'Espaço + membros + eventos + produtividade + comunidade + disponibilidade',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'CSW',sector:'Consultoria / Projetos / Formação',location:'Vila Nova de Famalicão',website:'https://csw.pt/',phone:'+351 252 312 406',email:'geral@csw.pt',source:'https://csw.pt/contactos/',opportunity:'a combinação de projetos, consultoria e formação permite trabalhar autoridade B2B, casos de estudo, conhecimento técnico e oportunidades comerciais de forma regular',idea:'Projetos + casos de estudo + equipa + formação + dicas técnicas + resultados',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'Idealização',sector:'Engenharia / Arquitetura',location:'Guarda',website:'https://idealizacao.pt/',phone:'+351 271 224 251 / +351 919 200 800',email:'geral@idealizacao.pt',source:'https://idealizacao.pt/contactos',opportunity:'projetos de engenharia e arquitetura têm forte potencial visual e educativo, permitindo mostrar processo, obra, detalhe e credibilidade técnica',idea:'Projetos + obra + processo + detalhes técnicos + antes/depois + equipa',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'Auto FR',sector:'Automóvel / Oficina / Performance',location:'Faro',website:'https://www.autofr.pt/',phone:'+351 289 882 237 / +351 965 034 773',email:'geral@autofr.pt',source:'https://www.autofr.pt/pt/contacts/',opportunity:'serviços automóveis, oficina e performance permitem produzir conteúdo visual recorrente sobre viaturas, intervenções, manutenção, confiança técnica e resultados',idea:'Oficina + viaturas + manutenção + performance + bastidores + dicas automóveis',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'JR Automóveis',sector:'Stand Automóvel / Oficina',location:'Cabanelas - Vila Verde',website:'https://jr-automoveis.pt/',phone:'+351 917 631 394',email:'geral@jr-automoveis.pt',source:'https://jr-automoveis.pt/',opportunity:'stock automóvel, retomas, financiamento e oficina geram matéria visual constante e oportunidades diretas de captação comercial através das redes sociais',idea:'Viaturas + chegadas de stock + entregas + retomas + financiamento + oficina',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Homeart',sector:'Design de Interiores / Decoração / Retail',location:'Barcelos',website:'https://www.homeart.pt/',phone:'+351 253 894 254',email:'geral@homeart.pt',source:'https://www.homeart.pt/contatos/',opportunity:'projetos de decoração, mobiliário e soluções para espaços residenciais, comerciais e hotelaria oferecem uma base visual forte para inspiração e geração de pedidos',idea:'Ambientes + projetos + produtos + materiais + antes/depois + inspiração',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Switch On',sector:'Educação / Formação Profissional',location:'Viana do Castelo / Penafiel',website:'https://www.switchon.pt/',phone:'+351 800 210 701 / +351 912 109 578',email:'geral@switchon.pt',source:'https://www.switchon.pt/cms/contactos/',opportunity:'a atividade formativa exige comunicação frequente sobre cursos, inscrições, saídas profissionais, centros de formação e resultados, com forte potencial de geração de leads',idea:'Cursos + inscrições + formadores + saídas profissionais + FAQs + histórias de alunos',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'MPF Máquinas',sector:'Máquinas Florestais / Equipamento Industrial',location:'Batalha',website:'https://www.mpf-maquinas.com/',phone:'+351 913 381 365 / +351 936 125 627',email:'geral@mpf-maquinas.com',source:'https://www.mpf-maquinas.com/contact',opportunity:'máquinas florestais, peças e assistência técnica permitem criar comunicação B2B muito visual, com demonstrações, entregas, manutenção e conteúdo técnico útil',idea:'Máquinas em ação + demonstrações + entregas + peças + assistência + dicas técnicas',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Energia Coletiva',sector:'Energia Solar / Sustentabilidade',location:'Barcelos',website:'https://energiacoletiva.pt/',phone:'+351 935 327 514',email:'geral@energiacoletiva.pt',source:'https://energiacoletiva.pt/contactos/',opportunity:'energia solar para empresas e residências beneficia de conteúdo educativo e visual contínuo que explique poupança, instalações, tecnologia e casos reais',idea:'Instalações + painéis + poupança + casos reais + FAQs + bastidores de obra',priority:'atacar',plan:'premium',monthly:280,offer:140}
];

const planItems = {
  base:['2 publicações por semana','Design + copy','Planeamento mensal','Agendamento e publicação','Adaptação Instagram/Facebook','Consultoria básica de perfil','Relatório mensal simples'],
  intermedio:['3 publicações por semana','Até 6 stories por semana','Planeamento e gestão de destaques','Design + copy','Agendamento e publicação','Análise mensal com sugestões'],
  premium:['4 a 5 publicações por semana','Stories de segunda a sexta — até 15/semana','Edição simples de reels','Criação de campanhas e promoções','Gestão de mensagens/comentários (a definir)','Análises quinzenais']
};

const blockedDomains = new Set(['gmail.com','googlemail.com','hotmail.com','hotmail.pt','outlook.com','outlook.pt','live.com','live.pt','yahoo.com','yahoo.pt','icloud.com','me.com','aol.com','sapo.pt','mail.com','example.com','example.org','example.net']);

function proposal(l) {
  return `Assunto: ${l.company} — preparámos algo para si\n\nOlá,\n\nEstivemos a ver a comunicação da ${l.company} e acreditamos que há espaço para tirar mais partido das redes sociais.\n\nPreparámos uma proposta pensada para a ${l.company}. Veja o que preparámos para si e receba também um ebook gratuito.\n\nCumprimentos,`;
}

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

function validateLeadSet() {
  const companies = new Set();
  const emails = new Set();
  for (const l of leads) {
    if (!emailPassesStrictRules(l)) throw new Error(`email inválido: ${l.company} <${l.email}>`);
    const companyKey = l.company.trim().toLowerCase();
    const emailKey = l.email.trim().toLowerCase();
    if (companies.has(companyKey)) throw new Error(`empresa duplicada no seed: ${l.company}`);
    if (emails.has(emailKey)) throw new Error(`email duplicado no seed: ${l.email}`);
    companies.add(companyKey);
    emails.add(emailKey);
    const expected = `Assunto: ${l.company} — preparámos algo para si\n\nOlá,\n\nEstivemos a ver a comunicação da ${l.company} e acreditamos que há espaço para tirar mais partido das redes sociais.\n\nPreparámos uma proposta pensada para a ${l.company}. Veja o que preparámos para si e receba também um ebook gratuito.\n\nCumprimentos,`;
    if (proposal(l) !== expected) throw new Error(`proposal_email inválido: ${l.company}`);
  }
}

function seed(){
  validateLeadSet();
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
  console.log(`[crm] prospeção 2026-09-10: ${added} adicionados, ${duplicates} duplicados ignorados, ${rejected} rejeitados pela validação estrita`);
}

try { seed(); } catch (e) { console.warn('[crm] seed 2026-09-10:', e.message); }
