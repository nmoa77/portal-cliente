const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');

const leads = [
  {company:'Martynova Cabeleireiros',sector:'Cabeleireiro / Estética / Beleza',location:'Lisboa - Avenida de Roma',website:'https://www.martynova-cabeleireiros.com/',phone:'+351 215 920 902 / +351 966 560 736',email:'geral@martynova-cabeleireiros.com',source:'https://www.martynova-cabeleireiros.com/contactos/',opportunity:'cortes, coloração, estética, unhas e rotina de salão oferecem conteúdo visual recorrente com forte potencial para marcações e fidelização',idea:'Transformações + cor + unhas + equipa + bastidores + dicas + agenda disponível',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Abruclínica',sector:'Clínica / Saúde / Bem-estar',location:'Abrunheira - Sintra',website:'https://abruclinica.pt/',phone:'+351 219 152 799 / +351 964 861 384',email:'geral@abruclinica.pt',source:'https://abruclinica.pt/contactos/',opportunity:'uma clínica local pode reforçar confiança e proximidade com conteúdo educativo regular, apresentação de serviços e equipa',idea:'Especialidades + equipa + perguntas frequentes + prevenção + bastidores + marcações',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'Lifeclinic',sector:'Clínica / Saúde / Bem-estar',location:'Cascais - Bairro do Rosário',website:'https://www.lifeclinic.pt/',phone:'+351 211 914 322 / +351 910 310 478',email:'info@lifeclinic.pt',source:'https://www.lifeclinic.pt/contactos',opportunity:'a componente clínica e de bem-estar permite construir autoridade local através de conteúdo informativo, humano e orientado para marcações',idea:'Serviços + profissionais + educação + mitos e dúvidas + testemunhos + marcações',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Prisma Hair Studio',sector:'Cabeleireiro / Estética',location:'Marina de Cascais - Cascais',website:'https://prismahairstudio.pt/',phone:'+351 215 808 988 / +351 918 880 890',email:'info@prismahairstudio.pt',source:'https://prismahairstudio.pt/contactos/',opportunity:'a localização na Marina de Cascais e os serviços de cabelo e estética criam uma base forte para conteúdo premium, visual e orientado para reservas',idea:'Antes/depois + coloração + styling + estética + Marina + equipa + vagas da semana',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Dentosauro',sector:'Clínica Dentária / Estética Facial',location:'Arneiro dos Marinheiros - Sintra',website:'https://dentosauro.pt/',phone:'+351 927 051 818',email:'info@dentosauro.pt',source:'https://dentosauro.pt/',opportunity:'saúde oral e estética facial permitem conteúdo educativo e visual que reduz dúvidas, reforça confiança e gera pedidos de consulta',idea:'Sorrisos + tratamentos + equipa + educação + FAQs + tecnologia + marcações',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Clínica Forjaz',sector:'Dermatologia / Medicina Estética / Tricologia',location:'Sintra / Lisboa',website:'https://clinicaforjaz.com/',phone:'+351 936 727 222 / +351 936 727 224',email:'info@clinicaforjaz.com',source:'https://clinicaforjaz.com/',opportunity:'dermatologia, medicina estética, tricologia e tecnologia clínica geram conteúdo especializado com forte potencial de autoridade e captação',idea:'Tratamentos + equipamentos + equipa médica + educação + dúvidas + consultas',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'O Cabeleireiro',sector:'Cabeleireiro / Coloração / Beleza',location:'Lisboa - Rato',website:'https://ocabeleireiro.pt/',phone:'+351 213 870 296 / +351 927 704 499',email:'geral@ocabeleireiro.pt',source:'https://ocabeleireiro.pt/',opportunity:'o posicionamento orgânico, a cor e o corte personalizado permitem criar uma identidade visual diferenciada e conteúdo de transformação muito forte',idea:'Corte + cor + transformações + produtos + filosofia orgânica + bastidores + agenda',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Mandala Beauty Lounge',sector:'Estética Avançada / Beleza / Formação',location:'Rio de Mouro - Sintra',website:'https://www.mandalabeautylounge.pt/',phone:'+351 219 026 237',email:'geral@mandalabeautylounge.pt',source:'https://www.mandalabeautylounge.pt/',opportunity:'a variedade de tratamentos, estética avançada e formações permite manter um calendário editorial constante e muito visual',idea:'Tratamentos + antes/depois + formação + dicas + bastidores + promoções + marcações',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'FITCLINIC',sector:'Medicina Estética / Clínica / Bem-estar',location:'Linhó - Sintra',website:'https://fitclinic.pt/',phone:'+351 218 046 560 / +351 935 196 670',email:'geral@fitclinic.pt',source:'https://fitclinic.pt/medicina-estetica/',opportunity:'a medicina estética e os vários tratamentos permitem uma estratégia de conteúdo educativo, visual e de conversão para consultas',idea:'Tratamentos + equipa + educação + perguntas frequentes + resultados explicados + marcações',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Pandora Cabeleireiros',sector:'Cabeleireiro / Estética',location:'Lisboa - Avenida João XXI',website:'https://www.pandora-cabeleireiros.pt/',phone:'+351 211 366 428 / +351 914 230 743',email:'geral@pandora-cabeleireiros.pt',source:'https://www.pandora-cabeleireiros.pt/',opportunity:'cabeleireiro, estética e marcas profissionais oferecem conteúdo visual recorrente, demonstração de resultados e campanhas sazonais',idea:'Transformações + cabelo + estética + marcas + equipa + dicas + marcações',priority:'atacar',plan:'intermedio',monthly:200,offer:100}
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
  console.log(`[crm] prospeção 2026-09-06: ${added} adicionados, ${duplicates} duplicados ignorados, ${rejected} rejeitados pela validação estrita`);
}

try { seed(); } catch (e) { console.warn('[crm] seed 2026-09-06:', e.message); }
