const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');

const leads = [
  {company:'VA Imobiliária',sector:'Imobiliário',location:'Pinhal Novo',website:'https://www.vaimobiliaria.pt/',phone:'+351 212 380 191 / +351 926 060 833',email:'geral@vaimobiliaria.pt',source:'https://www.vaimobiliaria.pt/contactus',opportunity:'a carteira imobiliária e a presença local permitem criar comunicação recorrente sobre imóveis, zona, processo de compra e venda e captação de proprietários',idea:'Imóveis + visitas + zona + dicas para proprietários + mercado local + oportunidades',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'A & M Automóveis',sector:'Automóvel / Stand / Consultoria Automóvel',location:'São Pedro do Sul',website:'https://www.aemautomoveis.pt/',phone:'+351 938 578 675',email:'geral@aemautomoveis.pt',source:'https://www.aemautomoveis.pt/',opportunity:'o stock de usados e seminovos, entregas, encomendas específicas e aconselhamento permitem conteúdo visual frequente orientado para confiança e geração de contactos',idea:'Viaturas + novidades de stock + entregas + detalhes + consultoria + bastidores',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'SIRMAF',sector:'Indústria / Máquinas Especiais / Automação',location:'Taveiro - Coimbra',website:'https://www.sirmaf.pt/',phone:'+351 239 980 420',email:'geral@sirmaf.pt',source:'https://www.sirmaf.pt/',opportunity:'máquinas especiais, células robotizadas, reconversões e serviços industriais dão matéria para conteúdo B2B técnico, demonstrações e casos de aplicação',idea:'Máquinas + automação + projetos + demonstrações + engenharia + bastidores industriais',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'GPA',sector:'Máquinas / Manutenção Industrial / Rochas Ornamentais',location:'Aljubarrota',website:'https://gpa.com.pt/',phone:'+351 262 582 143',email:'geral@gpa.com.pt',source:'https://gpa.com.pt/',opportunity:'a oferta de máquinas para extração e transformação de pedra e os serviços de manutenção permitem comunicar produto, aplicações e assistência com foco B2B',idea:'Máquinas + aplicações + manutenção + marcas + demonstrações + projetos especiais',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'MOOD HomeStyling',sector:'Design de Interiores / Decoração',location:'Aveiro',website:'https://moodhomestyling.com/',phone:'+351 234 138 552 / +351 963 561 318',email:'geral@moodhomestyling.com',source:'https://moodhomestyling.com/contactos-3/',opportunity:'os projetos de interiores e decoração têm forte componente visual e permitem trabalhar inspiração, materiais, detalhe, transformação e pedidos de projeto',idea:'Projetos + ambientes + materiais + detalhes + antes/depois + bastidores',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Ginásio Fullbeat',sector:'Desporto / Fitness',location:'Alcabideche - Cascais',website:'https://fullbeat.pt/',phone:'+351 962 593 564',email:'geral@fullbeat.pt',source:'https://fullbeat.pt/contactos',opportunity:'o treino, as aulas, o ambiente do clube e a comunidade permitem criar conteúdo humano e visual frequente para alcance local, interação e novas inscrições',idea:'Treino + aulas + equipa + comunidade + hábitos + experiência no clube',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'CorpusChristi',sector:'Alojamento Local / Turismo',location:'Coimbra',website:'https://corpuschristi.pt/',phone:'+351 935 545 403',email:'geral@corpuschristi.pt',source:'https://corpuschristi.pt/',opportunity:'o alojamento no centro de Coimbra, os espaços e a envolvente turística permitem criar comunicação visual orientada para experiência, destino e reservas diretas',idea:'Alojamento + Coimbra + quartos + experiência + roteiros + reservas diretas',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'PEP Produção Eventos Publicidade',sector:'Eventos / Produção / Ativação de Marca',location:'Tábua',website:'https://pep.com.pt/',phone:'+351 235 412 250',email:'info@pep.com.pt',source:'https://pep.com.pt/',opportunity:'feiras, exposições, ativações e eventos corporativos geram conteúdo visual forte para mostrar escala, bastidores, criatividade e capacidade de execução',idea:'Eventos + montagens + ativações + stands + bastidores + projetos concluídos',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'A3S Arquitetura',sector:'Arquitetura',location:'Guimarães',website:'https://a3sarquitetura.com/',phone:'+351 253 133 958',email:'geral@a3sarquitetura.com',source:'https://a3sarquitetura.com/',opportunity:'o portefólio de arquitetura permite transformar projetos, processo e detalhes construtivos em conteúdo visual de autoridade para captar novos trabalhos',idea:'Projetos + processo + obra + detalhes + conceito + equipa',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'HostCare Group',sector:'Comércio B2B / Hotelaria / Alojamento',location:'Caniço - Madeira',website:'https://www.hostcare.pt/',phone:'+351 963 091 457 / +351 917 275 084',email:'geral@hostcare.pt',source:'https://www.hostcare.pt/v1/inicio.php',opportunity:'têxteis, amenities e consumíveis para hotelaria e alojamento permitem uma comunicação B2B regular baseada em produto, qualidade, aplicações e soluções para operadores turísticos',idea:'Produtos + aplicações + hotelaria + dicas B2B + novidades + soluções para alojamentos',priority:'possivel',plan:'premium',monthly:280,offer:140}
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
  console.log(`[crm] prospeção 2026-09-13: ${added} adicionados, ${duplicates} duplicados ignorados, ${rejected} rejeitados pela validação estrita`);
}

try { seed(); } catch (e) { console.warn('[crm] seed 2026-09-13:', e.message); }
