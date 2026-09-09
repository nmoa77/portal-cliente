const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');

const leads = [
  {company:'Dona Vila',sector:'Design de Interiores / Decoração',location:'Vila Real',website:'https://donavila.pt/',phone:'+351 259 378 122 / +351 910 304 376',email:'geral@donavila.pt',source:'https://donavila.pt/',opportunity:'o portefólio de interiores, peças, ambientes e projetos oferece matéria visual contínua para reforçar posicionamento, inspiração e pedidos de projeto',idea:'Projetos + ambientes + detalhes + materiais + bastidores + antes/depois',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'J.Couto Imobiliária',sector:'Imobiliário',location:'Caldas da Rainha',website:'https://www.imobiliaria-jcouto.com/',phone:'+351 262 832 097 / +351 919 553 881',email:'geral@imobiliaria-jcouto.com',source:'https://www.imobiliaria-jcouto.com/contactos',opportunity:'a carteira de imóveis e a experiência local desde 1991 permitem criar comunicação recorrente sobre imóveis, mercado, zona e confiança no processo de compra e venda',idea:'Imóveis + visitas + mercado local + dicas para proprietários + equipa + testemunhos',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Grupo Branco & Almeida',sector:'Automóvel / Máquinas Agrícolas / Oficina',location:'Chaves',website:'https://grupo-brancoealmeida.pt/',phone:'+351 917 499 116 / +351 935 045 832 / +351 932 801 243',email:'geral@grupo-brancoealmeida.pt',source:'https://grupo-brancoealmeida.pt/',opportunity:'a combinação de viaturas, tratores Landini, alfaias e oficina permite uma comunicação regular muito visual, orientada para stock, demonstrações, manutenção e confiança comercial',idea:'Viaturas + tratores + entregas + oficina + demonstrações + novidades de stock',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'ARQUIANGRA',sector:'Arquitetura / Engenharia',location:'Angra do Heroísmo - Açores',website:'https://www.arquiangra.pt/',phone:'+351 295 216 939 / +351 963 827 535',email:'geral@arquiangra.pt',source:'https://www.arquiangra.pt/',opportunity:'projetos de arquitetura e engenharia podem ser transformados em conteúdo de autoridade, mostrando processo, obra, soluções técnicas e impacto final',idea:'Projetos + obra + processo + detalhes técnicos + equipa + antes/depois',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'Algarpalcos',sector:'Eventos / Produção Técnica / Palcos',location:'Loulé',website:'https://www.algarpalcos.com/',phone:'+351 289 463 193',email:'geral@algarpalcos.com',source:'https://www.algarpalcos.com/contactos',opportunity:'montagens, palcos, produção técnica e eventos geram conteúdo visual forte e recorrente, ideal para mostrar escala, bastidores, capacidade operacional e resultados',idea:'Montagens + bastidores + eventos + timelapses + equipa técnica + projetos concluídos',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Onnea Cowork',sector:'Coworking / Centro de Negócios',location:'Viana do Castelo',website:'https://www.onneacowork.com/',phone:'+351 928 294 501',email:'geral@onneacowork.com',source:'https://www.onneacowork.com/contactos/',opportunity:'o espaço de coworking precisa de comunicação regular para mostrar ambiente, comunidade, postos disponíveis, vantagens e atividades que ajudem a converter visitas em membros',idea:'Espaço + comunidade + membros + dicas de produtividade + eventos + disponibilidade',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'Vilreinatur',sector:'Turismo Rural / Alojamento / Experiências',location:'Vila de Rei',website:'https://vilreinatur.pt/',phone:'+351 913 453 179 / +351 913 453 180',email:'geral@vilreinatur.pt',source:'https://vilreinatur.pt/experiencias/',opportunity:'alojamento, natureza e experiências locais oferecem uma base visual forte para criar desejo, trabalhar sazonalidade e estimular reservas diretas',idea:'Alojamentos + natureza + experiências + roteiros + hóspedes + épocas especiais',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Centro de Formação Rumo Certo',sector:'Educação / Formação Profissional',location:'Espinho',website:'https://centrorumocerto.pt/',phone:'+351 924 714 851',email:'geral@centrorumocerto.pt',source:'https://centrorumocerto.pt/',opportunity:'a oferta formativa exige comunicação frequente sobre cursos, inscrições, saídas profissionais, testemunhos e esclarecimento de dúvidas para gerar novas inscrições',idea:'Cursos + inscrições + saídas profissionais + formadores + testemunhos + FAQs',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'Academia Telma Cabral',sector:'Desporto / Dança / Academia',location:'Espinho',website:'https://academiatelmacabral.pt/',phone:'+351 919 277 764',email:'geral@academiatelmacabral.pt',source:'https://academiatelmacabral.pt/contactos/',opportunity:'a atividade diária da academia, aulas, alunos e eventos permite criar conteúdo humano e visual com forte potencial de alcance local, experimentação e novas inscrições',idea:'Aulas + professores + alunos + evolução + eventos + inscrições',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'MEC Engenharia',sector:'Engenharia / Construção',location:'Lisboa',website:'https://www.mec-engenharia.pt/',phone:'+351 218 006 119',email:'geral@mec-engenharia.pt',source:'https://www.mec-engenharia.pt/contactos',opportunity:'projetos, fiscalização, microcimento e execução técnica podem ser comunicados de forma visual e educativa para reforçar credibilidade, portefólio e captação B2B e particular',idea:'Obras + soluções técnicas + microcimento + processo + equipa + casos de projeto',priority:'possivel',plan:'intermedio',monthly:200,offer:100}
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
  console.log(`[crm] prospeção 2026-09-09: ${added} adicionados, ${duplicates} duplicados ignorados, ${rejected} rejeitados pela validação estrita`);
}

try { seed(); } catch (e) { console.warn('[crm] seed 2026-09-09:', e.message); }
