const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');

const leads = [
  {company:'La Trattoria',sector:'Restauração Italiana / Eventos',location:'Lisboa - Avenidas Novas',website:'https://www.latrattoria.pt/',phone:'+351 213 853 043',email:'geral@latrattoria.pt',source:'https://www.latrattoria.pt/',opportunity:'gastronomia italiana, menus, eventos e ambiente oferecem matéria visual recorrente para aumentar notoriedade e reservas',idea:'Pratos + bastidores + chef + eventos + sugestões semanais + reservas',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Restaurante Orienta-te',sector:'Restauração / Grupos',location:'Marvila - Lisboa',website:'https://www.orienta-te.pt/',phone:'+351 217 966 881',email:'geral@orienta-te.pt',source:'https://www.orienta-te.pt/contactos',opportunity:'a oferta de restauração e jantares de grupo permite criar campanhas locais e conteúdo regular orientado para reservas',idea:'Pratos + menus de grupo + ambiente + equipa + datas especiais + reservas',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'VillaSkin Clinic',sector:'Medicina Estética / Clínica',location:'Parque das Nações - Lisboa',website:'https://villaskin.clinic/',phone:'+351 924 041 058',email:'info@villaskin.clinic',source:'https://villaskin.clinic/',opportunity:'tratamentos estéticos, tecnologia e equipa clínica permitem conteúdo educativo e visual com forte potencial de marcação',idea:'Tratamentos + tecnologia + equipa + educação + FAQs + campanhas de consulta',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Ginásio Clube Português',sector:'Ginásio / Desporto / Saúde',location:'Lisboa - Rato',website:'https://gcp.pt/',phone:'+351 213 841 580',email:'info@gcp.pt',source:'https://gcp.pt/gcp/',opportunity:'a variedade de modalidades, equipas, aulas e comunidade cria um calendário editorial muito rico e constante',idea:'Modalidades + aulas + comunidade + professores + eventos + testemunhos',priority:'possivel',plan:'premium',monthly:280,offer:140},
  {company:'Restaurante Jardim da Luz',sector:'Restauração Portuguesa',location:'Carnide - Lisboa',website:'https://jardimdaluz.pt/',phone:'+351 217 156 087 / +351 937 120 231',email:'geral@jardimdaluz.pt',source:'https://jardimdaluz.pt/',opportunity:'gastronomia portuguesa, grelhados, história do espaço e localização dão conteúdo visual forte para reservas e grupos',idea:'Pratos + grelhados + história + ambiente + sugestões + reservas',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Casa do Alentejo',sector:'Restauração / Cultura / Eventos',location:'Baixa - Lisboa',website:'https://casadoalentejo.pt/',phone:'+351 213 405 140',email:'geral@casadoalentejo.pt',source:'https://casadoalentejo.pt/tavern/',opportunity:'gastronomia, património, música e eventos tornam o espaço altamente visual e adequado a comunicação cultural e comercial regular',idea:'Gastronomia + património + música + eventos + bastidores + reservas',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Restaurante Gardens',sector:'Restauração / Esplanada / Grupos',location:'Paço do Lumiar - Lisboa',website:'http://www.restaurantegardens.pt/',phone:'+351 217 571 087',email:'geral@restaurantegardens.pt',source:'https://www.visitportugal.com/pt-pt/content/restaurante-gardens',opportunity:'a vista panorâmica, esplanada e gastronomia oferecem conteúdo visual diferenciador para reservas, grupos e ocasiões especiais',idea:'Paisagem + pratos + esplanada + grupos + eventos + reservas',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Derma360',sector:'Dermatologia / Medicina Estética',location:'Lisboa - Duque de Loulé',website:'https://derma360.pt/',phone:'+351 210 434 052 / +351 961 048 515',email:'info@derma360.pt',source:'https://derma360.pt/contactos/',opportunity:'tratamentos dermatológicos, laser e medicina estética permitem conteúdo educativo, autoridade clínica e campanhas de marcação',idea:'Tratamentos + equipa médica + mitos e dúvidas + tecnologia + marcações',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'IPFace',sector:'Clínica Médica / Estética',location:'Lisboa - Alto dos Moinhos',website:'https://www.ipface.pt/',phone:'+351 214 412 544',email:'info@ipface.pt',source:'https://www.ipface.pt/contactos',opportunity:'a forte componente médica, estética e educativa permite uma estratégia de autoridade com conteúdo visual e informativo recorrente',idea:'Especialidades + equipa + educação + casos explicativos + bastidores + consultas',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Art Beauty Clinic',sector:'Medicina Estética / Cirurgia Plástica / Beleza',location:'Lisboa - Saldanha',website:'https://artclinic.pt/',phone:'+351 213 570 335 / +351 926 446 034',email:'info@artclinic.pt',source:'https://artclinic.pt/',opportunity:'medicina estética, cirurgia plástica, nutrição e estética avançada geram conteúdo visual e educativo com elevado potencial de captação',idea:'Tratamentos + equipa + educação + FAQs + resultados explicados + marcações',priority:'atacar',plan:'premium',monthly:280,offer:140}
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
  console.log(`[crm] prospeção 2026-09-05: ${added} adicionados, ${duplicates} duplicados ignorados, ${rejected} rejeitados pela validação estrita`);
}

try { seed(); } catch (e) { console.warn('[crm] seed 2026-09-05:', e.message); }
