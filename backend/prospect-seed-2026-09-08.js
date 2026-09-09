const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');

const leads = [
  {company:'Lumina Pilates Studio',sector:'Pilates / Fisioterapia / Bem-estar',location:'Lisboa - Quinta do Lambert',website:'https://www.luminapilatestudio.pt/',phone:'+351 910 237 008',email:'geral@luminapilatestudio.pt',source:'https://www.luminapilatestudio.pt/contactos',opportunity:'a combinação de Pilates clínico, Reformer, fisioterapia e treino funcional cria conteúdo visual recorrente e uma forte oportunidade para comunicar diferenciação, equipa e marcações',idea:'Reformer + exercícios + equipa + educação postural + bastidores + marcações',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Sintra Boutique Hotel',sector:'Hotelaria / Turismo',location:'Sintra',website:'https://sintraboutiquehotel.com/',phone:'+351 219 244 177',email:'geral@sintraboutiquehotel.com',source:'https://sintraboutiquehotel.com/',opportunity:'a localização no centro histórico de Sintra, os quartos, a restauração e a envolvente turística oferecem matéria visual contínua para reforçar desejo, reservas diretas e notoriedade',idea:'Quartos + gastronomia + Sintra + experiências + bastidores + reservas diretas',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:"Jamie's Italian Lisboa",sector:'Restauração / Lifestyle',location:'Lisboa - Príncipe Real',website:'https://www.jamiesitalian.pt/',phone:'+351 925 301 411',email:'info@jamiesitalian.pt',source:'https://www.jamiesitalian.pt/pt/ji-lisbon/contact/',opportunity:'a gastronomia, o ambiente e a localização no Príncipe Real permitem uma comunicação muito visual e frequente orientada para reservas, novidades e experiência de marca',idea:'Pratos + ambiente + equipa + novidades + momentos de serviço + reservas',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Drenaclinic',sector:'Estética Facial / Bem-estar',location:'Lisboa - Lumiar',website:'https://drenaclinic.pt/',phone:'+351 215 955 005 / +351 915 162 862',email:'geral@drenaclinic.pt',source:'https://drenaclinic.pt/contactos/',opportunity:'os tratamentos de estética facial e bem-estar beneficiam de comunicação frequente, educativa e visual para construir confiança, explicar serviços e gerar marcações',idea:'Tratamentos + equipa + educação + dúvidas frequentes + bastidores + marcações',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'GV+Arquitectos',sector:'Arquitetura',location:'Lisboa',website:'https://www.gv-arquitectos.com/',phone:'+351 965 019 485',email:'geral@gv-arquitectos.com',source:'https://www.gv-arquitectos.com/fale-connosco',opportunity:'o portefólio de arquitetura tem forte potencial visual e pode ser transformado em conteúdo regular sobre projetos, processo, detalhe e autoridade técnica',idea:'Projetos + antes/depois + processo + detalhes + equipa + conhecimento técnico',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'Visage Clinic Boutique',sector:'Medicina Estética',location:'Lisboa - Matinha',website:'https://www.visageclinicboutique.pt/',phone:'+351 933 078 810 / +351 210 148 418',email:'geral@visageclinicboutique.pt',source:'https://www.visageclinicboutique.pt/',opportunity:'a medicina estética é altamente visual e exige comunicação de confiança, diferenciação dos tratamentos, equipa e esclarecimento regular antes da marcação',idea:'Tratamentos + equipa + educação + tecnologia + perguntas frequentes + marcações',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Clínica Ibérico Nogueira',sector:'Cirurgia Plástica / Medicina Estética',location:'Lisboa - Santos',website:'https://www.clinicain.pt/',phone:'+351 213 932 810',email:'geral@clinicain.pt',source:'https://www.clinicain.pt/',opportunity:'a cirurgia plástica e estética requerem uma presença digital consistente que transmita autoridade médica, segurança, equipa, procedimentos e respostas às principais dúvidas',idea:'Especialidades + equipa médica + educação + procedimentos + FAQs + marcações',priority:'possivel',plan:'premium',monthly:280,offer:140},
  {company:'Oficina do Largo',sector:'Arquitetura / Retail',location:'Alcochete',website:'https://oficinadolargo.com/',phone:'+351 919 611 137',email:'geral@oficinadolargo.com',source:'https://oficinadolargo.com/',opportunity:'o portefólio de arquitetura, incluindo projetos de retalho e espaços de grande visibilidade, permite criar uma narrativa visual forte sobre conceito, execução e resultados',idea:'Projetos + retail + processo criativo + detalhes + obra + equipa',priority:'possivel',plan:'intermedio',monthly:200,offer:100}
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
  console.log(`[crm] prospeção 2026-09-08: ${added} adicionados, ${duplicates} duplicados ignorados, ${rejected} rejeitados pela validação estrita`);
}

try { seed(); } catch (e) { console.warn('[crm] seed 2026-09-08:', e.message); }
