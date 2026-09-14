const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');

const leads = [
  {company:'CIRTEC',sector:'Equipamentos Industriais / Engenharia',location:'Lisboa',website:'https://cirtec.pt/',phone:'+351 213 833 434',email:'geral@cirtec.pt',source:'https://cirtec.pt/contactos-cirtec/',opportunity:'equipamentos industriais, representações técnicas e pedidos de orçamento permitem criar conteúdo B2B sobre aplicações, soluções, demonstrações e conhecimento técnico',idea:'Equipamentos + aplicações + demonstrações + casos de uso + assistência + conhecimento técnico',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'Casa do Fundo',sector:'Turismo de Habitação / Alojamento',location:'Tourais - Seia',website:'https://casadofundo.com/',phone:'+351 967 332 005 / +351 238 902 118',email:'geral@casadofundo.com',source:'https://casadofundo.com/',opportunity:'o alojamento e a envolvente da Serra da Estrela oferecem matéria visual para trabalhar experiência, escapadinhas, património local e reservas diretas',idea:'Alojamento + Serra da Estrela + experiências + detalhes da casa + roteiros + reservas',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'AutoGirar',sector:'Automóvel / Stand / Pós-venda',location:'Santarém',website:'https://autogirar.pt/',phone:'+351 243 309 030 / +351 933 090 310',email:'geral@autogirar.pt',source:'https://autogirar.pt/stand/',opportunity:'stock automóvel, oficina, peças e pós-venda permitem comunicação frequente orientada para viaturas, confiança, entregas e geração de contactos',idea:'Stock + entregas + oficina + peças + dicas automóvel + oportunidades',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Miguel Arruda Arquitectos',sector:'Arquitetura',location:'Lisboa',website:'https://www.miguelarruda.com/',phone:'+351 213 021 858 / +351 213 021 863',email:'geral@miguelarruda.com',source:'https://www.miguelarruda.com/sobre/',opportunity:'o portefólio e a equipa de arquitetura permitem desenvolver conteúdo de autoridade sobre conceito, processo, detalhe, obra e projetos concluídos',idea:'Projetos + conceito + processo + equipa + detalhes + obra concluída',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'Focus Imobiliária',sector:'Imobiliário',location:'Aveiro',website:'https://www.focus-imobiliaria.com/',phone:'+351 234 891 030',email:'geral@focus-imobiliaria.com',source:'https://www.focus-imobiliaria.com/contactos',opportunity:'a carteira de imóveis e presença local em Aveiro permitem criar comunicação recorrente sobre imóveis, mercado, zona e captação de proprietários',idea:'Imóveis + visitas + mercado local + dicas para proprietários + zona + oportunidades',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'BLK Porto Arquitectura',sector:'Arquitetura / Serviços Técnicos',location:'Maia',website:'https://blk-porto.pt/',phone:'+351 229 488 776',email:'geral@blk-porto.pt',source:'https://blk-porto.pt/contact-us/',opportunity:'serviços de arquitetura e áreas conexas podem ser transformados em conteúdo técnico e visual para reforçar portefólio, processo e diferenciação',idea:'Projetos + processo + soluções + detalhes + obra + conhecimento técnico',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'Lugar Certo Imobiliária',sector:'Imobiliário',location:'Cotovia - Sesimbra',website:'https://www.lugarcerto.pt/',phone:'+351 211 622 967 / +351 925 847 063',email:'geral@lugarcerto.pt',source:'https://www.lugarcerto.pt/',opportunity:'a atividade imobiliária local permite trabalhar imóveis, estilo de vida em Sesimbra, avaliação, venda e captação através de conteúdo recorrente',idea:'Imóveis + Sesimbra + visitas + avaliação + dicas + captação de proprietários',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'TECMACAL',sector:'Máquinas / Indústria / Equipamento Técnico',location:'São João da Madeira',website:'https://www.tecmacal.pt/',phone:'+351 256 200 480',email:'tecmacal@tecmacal.pt',source:'https://www.tecmacal.pt/',opportunity:'máquinas para calçado, impressão e indústria geral oferecem oportunidades de comunicação B2B através de demonstrações, inovação, aplicações e feiras',idea:'Máquinas + demonstrações + aplicações + inovação + feiras + assistência técnica',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'ExpoEuropa',sector:'Automóvel / Stand',location:'Pedreiras - Porto de Mós',website:'https://www.expoeuropa.pt/',phone:'+351 244 498 090',email:'geral@expoeuropa.pt',source:'https://usados.autonews.pt/stands-automoveis/dir/d/leiria/c/porto-de-mos/p-36989/expoeuropa/',opportunity:'um stock alargado de viaturas e serviços associados permite comunicação diária sobre entradas, oportunidades, confiança, garantias e experiência de compra',idea:'Novas entradas + viaturas em destaque + entregas + garantias + dicas + bastidores',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Bolas S.A.',sector:'Máquinas / Ferramentas / Equipamento Industrial',location:'Évora',website:'https://www.bolas.pt/',phone:'+351 266 749 300',email:'geral@bolas.pt',source:'https://www.bolas.pt/pt/',opportunity:'a gama extensa de máquinas, ferramentas e serviços para profissionais permite criar conteúdo B2B educativo, demonstrações e campanhas de produto com elevada recorrência',idea:'Máquinas + ferramentas + demonstrações + aplicações + marcas + dicas profissionais',priority:'possivel',plan:'intermedio',monthly:200,offer:100}
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
  console.log(`[crm] prospeção 2026-09-14: ${added} adicionados, ${duplicates} duplicados ignorados, ${rejected} rejeitados pela validação estrita`);
}

try { seed(); } catch (e) { console.warn('[crm] seed 2026-09-14:', e.message); }
