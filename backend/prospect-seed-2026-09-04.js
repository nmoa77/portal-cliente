const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');

// Prospecção DUIT 2026-09-04 — regra estrita:
// - apenas email profissional público e confirmado;
// - rejeita serviços de email gratuitos, placeholders, noreply e domínios suspeitos;
// - empresa e email são novamente verificados na BD antes de inserir.
const leads = [
  {
    company:'Páteo Restaurante',
    sector:'Restauração / Eventos',
    location:'Parque das Nações - Lisboa',
    website:'https://www.pateorestaurante.pt/',
    phone:'+351 218 687 208',
    email:'geral@pateorestaurante.pt',
    source:'https://www.pateorestaurante.pt/',
    opportunity:'os menus de grupo, a cozinha, o espaço e os eventos permitem criar uma comunicação visual regular orientada a reservas e grupos',
    idea:'Pratos + menus de grupo + ambiente + bastidores + campanhas de reserva',
    priority:'atacar', plan:'intermedio', monthly:200, offer:100
  },
  {
    company:'Clínica Clube18',
    sector:'Ginásio / Clínica / Saúde',
    location:'Santo António da Charneca - Barreiro',
    website:'https://clube18.pt/',
    phone:'+351 928 031 418 / +351 928 038 153',
    email:'geral@clube18.pt',
    source:'https://clube18.pt/contactos/',
    opportunity:'a combinação de ginásio e clínica gera muitos temas recorrentes sobre treino, recuperação, equipa e acompanhamento, com potencial claro para captação local',
    idea:'Treino + recuperação + equipa + educação + experiência experimental',
    priority:'atacar', plan:'premium', monthly:280, offer:140
  },
  {
    company:'Nacional Fitness',
    sector:'Ginásio / Fitness',
    location:'Lisboa - São Bento',
    website:'https://nacionalfitness.pt/',
    phone:'+351 213 933 436',
    email:'geral@nacionalfitness.pt',
    source:'https://landingpage.nacionalfitness.pt/',
    opportunity:'o posicionamento premium, a localização central e a experiência de treino permitem criar campanhas de adesão e conteúdos de comunidade com forte valor visual',
    idea:'Experiência premium + treino + comunidade + resultados + campanha de inscrição',
    priority:'atacar', plan:'premium', monthly:280, offer:140
  },
  {
    company:'Palácio Chiado',
    sector:'Restauração / Bar / Eventos',
    location:'Chiado - Lisboa',
    website:'https://www.palaciochiado.pt/',
    phone:'+351 210 101 184',
    email:'geral@palaciochiado.pt',
    source:'https://www.palaciochiado.pt/contactos/',
    opportunity:'a arquitetura do espaço, gastronomia, bar e programação noturna oferecem matéria visual forte para conteúdos aspiracionais e campanhas de reservas',
    idea:'Espaço + pratos + cocktails + noites especiais + grupos + reservas',
    priority:'atacar', plan:'premium', monthly:280, offer:140
  },
  {
    company:'O Bem Disposto',
    sector:'Restauração / Catering / Eventos',
    location:'Avenidas Novas - Lisboa',
    website:'https://www.obemdisposto.pt/',
    phone:'+351 967 362 336',
    email:'geral@obemdisposto.pt',
    source:'https://www.obemdisposto.pt/contactos',
    opportunity:'o restaurante, catering, grupos e eventos permitem uma comunicação frequente que pode ligar conteúdo apetecível a reservas e pedidos de orçamento',
    idea:'Pratos + catering + eventos + grupos + bastidores + reservas',
    priority:'atacar', plan:'intermedio', monthly:200, offer:100
  },
  {
    company:'Gin Lovers',
    sector:'Restauração / Bar / Lifestyle',
    location:'Príncipe Real - Lisboa',
    website:'https://ginlovers.pt/',
    phone:'+351 213 010 212',
    email:'geral@ginlovers.pt',
    source:'https://ginlovers.pt/contact-us/',
    opportunity:'cocktails, gastronomia, ambiente e localização criam conteúdo de forte impacto visual e motivos constantes para comunicar experiências e reservas',
    idea:'Cocktails + gastronomia + ambiente + experiências + agenda + reservas',
    priority:'atacar', plan:'premium', monthly:280, offer:140
  },
  {
    company:'GARE Restaurant',
    sector:'Restauração / Eventos / Terraço',
    location:'Alcântara - Lisboa',
    website:'https://garerestaurant.pt/',
    phone:'+351 967 505 320',
    email:'geral@garerestaurant.pt',
    source:'https://garerestaurant.pt/',
    opportunity:'o restaurante, os menus, a Terrazza e os DJ sets dão uma base muito visual para promover experiências, agenda e reservas durante toda a semana',
    idea:'Pratos + Terrazza + DJ sets + sunsets + menus + reservas',
    priority:'atacar', plan:'premium', monthly:280, offer:140
  },
  {
    company:'Salão do Bairro',
    sector:'Cabeleireiro / Beleza',
    location:'Arroios - Lisboa',
    website:'https://www.salaodobairro.pt/',
    phone:'+351 213 555 021 / +351 911 811 884',
    email:'info@salaodobairro.pt',
    source:'https://www.salaodobairro.pt/pt/contactos',
    opportunity:'cortes, cor, transformação e rotina do salão dão conteúdo visual recorrente, fácil de converter em prova social e marcações',
    idea:'Antes/depois + cor + equipa + dicas + agenda + campanhas sazonais',
    priority:'atacar', plan:'intermedio', monthly:200, offer:100
  },
  {
    company:'Swing n’ Smile',
    sector:'Dança / Aulas / Eventos',
    location:'Lisboa - Anjos',
    website:'https://swingnsmile.com/',
    phone:'+351 916 395 379',
    email:'geral@swingnsmile.com',
    source:'https://swingnsmile.com/contact/',
    opportunity:'aulas, dança, comunidade e eventos são naturalmente dinâmicos e muito adequados a reels, testemunhos e campanhas de experimentação',
    idea:'Aulas + comunidade + professores + eventos + vídeos curtos + aula experimental',
    priority:'atacar', plan:'intermedio', monthly:200, offer:100
  },
  {
    company:'SEM DÚVIDA Restaurante',
    sector:'Restauração Portuguesa',
    location:'Campo Pequeno - Lisboa',
    website:'https://www.semduvida.pt/',
    phone:'+351 217 932 254',
    email:'geral@semduvida.pt',
    source:'https://www.semduvida.pt/contact',
    opportunity:'a cozinha portuguesa, o ambiente e a localização permitem trabalhar conteúdo apetecível e recorrente para reforçar notoriedade e aumentar reservas',
    idea:'Pratos + sugestões + cozinha + ambiente + equipa + reservas',
    priority:'atacar', plan:'intermedio', monthly:200, offer:100
  }
];

const planItems = {
  base:['2 publicações por semana','Design + copy','Planeamento mensal','Agendamento e publicação','Adaptação Instagram/Facebook','Consultoria básica de perfil','Relatório mensal simples'],
  intermedio:['3 publicações por semana','Até 6 stories por semana','Planeamento e gestão de destaques','Design + copy','Agendamento e publicação','Análise mensal com sugestões'],
  premium:['4 a 5 publicações por semana','Stories de segunda a sexta — até 15/semana','Edição simples de reels','Criação de campanhas e promoções','Gestão de mensagens/comentários (a definir)','Análises quinzenais']
};

const blockedDomains = new Set([
  'gmail.com','googlemail.com','hotmail.com','hotmail.pt','outlook.com','outlook.pt','live.com','live.pt',
  'yahoo.com','yahoo.pt','icloud.com','me.com','aol.com','sapo.pt','mail.com','example.com','example.org','example.net'
]);

function emailPassesStrictRules(l) {
  const email = String(l.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  const [local, domain] = email.split('@');
  if (!local || !domain) return false;
  if (blockedDomains.has(domain)) return false;
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
  console.log(`[crm] prospeção 2026-09-04: ${added} adicionados, ${duplicates} duplicados ignorados, ${rejected} rejeitados pela validação estrita`);
}

try { seed(); } catch (e) { console.warn('[crm] seed 2026-09-04:', e.message); }
