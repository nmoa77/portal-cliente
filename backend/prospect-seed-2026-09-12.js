const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');

const leads = [
  {company:'Casas econatura',sector:'Turismo Rural / Glamping',location:'Mouriscas - Abrantes',website:'https://casaseconatura.com/',phone:'+351 927 179 648',email:'geral@casaseconatura.com',source:'https://casaseconatura.com/contact/',opportunity:'o alojamento rural, o glamping e a componente de sustentabilidade oferecem conteúdo visual recorrente para trabalhar desejo, escapadinhas, natureza e reservas diretas',idea:'Alojamentos + glamping + natureza + sustentabilidade + experiências + reservas diretas',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'RBG Arquitectura & Decoração',sector:'Arquitetura / Interiores / Decoração',location:'Lisboa',website:'https://www.rbg.pt/',phone:'+351 210 998 384 / +351 915 836 002',email:'geral@rbg.pt',source:'https://www.rbg.pt/contactos.html',opportunity:'o portefólio de arquitetura e interiores tem forte componente visual e permite comunicar conceito, materiais, processo criativo e resultados de forma consistente',idea:'Projetos + interiores + materiais + detalhes + processo + antes/depois',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'ARQMAT',sector:'Arquitetura / Urbanismo / Engenharia',location:'Pombal',website:'https://arqmat.pt/',phone:'+351 968 347 557',email:'geral@arqmat.pt',source:'https://arqmat.pt/',opportunity:'a combinação de arquitetura, urbanismo, engenharia e topografia permite criar conteúdo técnico e visual que reforça autoridade e ajuda a captar novos projetos',idea:'Projetos + obra + topografia + soluções técnicas + processo + equipa',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'Fátima Neto',sector:'Decoração de Interiores / Estofos / Tecidos',location:'Lisboa',website:'https://www.fatimaneto.com/',phone:'+351 213 950 867',email:'geral@fatimaneto.com',source:'https://www.fatimaneto.com/',opportunity:'cortinados, estofos, tecidos e decoração geram conteúdo altamente visual e recorrente, ideal para mostrar transformação, detalhe artesanal e inspiração para casa',idea:'Antes/depois + tecidos + estofos + cortinados + detalhes + projetos concluídos',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Instituto de Formação IFCTS',sector:'Formação Profissional / Consultoria Empresarial',location:'Braga',website:'https://institutodeformacao.com/',phone:'+351 253 265 403 / +351 922 283 636',email:'geral@institutodeformacao.com',source:'https://institutodeformacao.com/site/content/o-ifcts',opportunity:'a atividade de formação e consultoria exige comunicação regular sobre cursos, programas, inscrições, resultados, equipa e qualificação profissional',idea:'Formações + inscrições + competências + equipa + empresas + conteúdos educativos',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'GO Automóveis',sector:'Automóvel / Stand',location:'Felgueiras',website:'https://goauto.pt/',phone:'+351 255 311 206',email:'geral@goauto.pt',source:'https://goauto.pt/contactos/',opportunity:'o stock automóvel, novidades, detalhes das viaturas e entregas permitem produzir conteúdo visual frequente orientado para confiança, alcance local e geração de contactos',idea:'Viaturas + novidades de stock + detalhes + entregas + dicas de compra + bastidores',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Eventos By Transalpino',sector:'Eventos / Produção',location:'Lisboa',website:'https://eventosbyt.pt/',phone:'+351 211 316 527',email:'geral@eventosbyt.pt',source:'https://eventosbyt.pt/contactos/',opportunity:'a produção de eventos oferece matéria visual forte para mostrar conceitos, montagens, bastidores, momentos finais e capacidade de execução',idea:'Eventos + montagens + bastidores + conceitos + equipa + resultados finais',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'FDE Engenharia',sector:'Engenharia / Projetos / Acompanhamento Técnico',location:'Paços de Gaiolo - Marco de Canaveses',website:'https://www.fde-engenharia.pt/',phone:'+351 255 582 846',email:'geral@fde-engenharia.pt',source:'https://www.fde-engenharia.pt/contactos.html',opportunity:'projetos, estudos e acompanhamento técnico podem ser transformados em conteúdo de autoridade, mostrando soluções, processo e valor técnico de forma acessível',idea:'Projetos + obra + estudos + soluções técnicas + equipa + conhecimento',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'2RID',sector:'Máquinas / Ferramentas / Manutenção Industrial',location:'Tomar',website:'https://2rid.pt/',phone:'+351 249 324 905 / +351 916 981 881',email:'geral@2rid.pt',source:'https://2rid.pt/',opportunity:'a variedade de máquinas, ferramentas e soluções de manutenção industrial permite criar conteúdo B2B recorrente com demonstrações, aplicações, produto e assistência técnica',idea:'Máquinas + ferramentas + demonstrações + aplicações + assistência técnica + novidades',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'HTC Imobiliária',sector:'Imobiliário',location:'Golegã',website:'https://imobiliaria.htcgolega.pt/',phone:'+351 249 153 723',email:'geral@htcgolega.pt',source:'https://imobiliaria.htcgolega.pt/contacto/',opportunity:'a carteira imobiliária e a presença local permitem criar comunicação contínua sobre imóveis, zona, processo de compra e venda e captação de proprietários',idea:'Imóveis + visitas + zona + dicas para proprietários + mercado local + oportunidades',priority:'atacar',plan:'premium',monthly:280,offer:140}
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
  console.log(`[crm] prospeção 2026-09-12: ${added} adicionados, ${duplicates} duplicados ignorados, ${rejected} rejeitados pela validação estrita`);
}

try { seed(); } catch (e) { console.warn('[crm] seed 2026-09-12:', e.message); }
