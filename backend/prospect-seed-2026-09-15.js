const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');

const leads = [
  {company:'RL Home',sector:'Decoração / Design de Interiores',location:'Quinta do Anjo - Palmela',website:'https://rl-home.pt/',phone:'+351 933 953 022',email:'geral@rl-home.pt',source:'https://rl-home.pt/',opportunity:'projetos de interiores, mobiliário por medida, tecidos e montagens oferecem matéria visual recorrente para mostrar transformação, detalhe e serviço',idea:'Projetos + antes/depois + mobiliário por medida + tecidos + detalhes + bastidores',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Hotel Rural Vilarinho',sector:'Turismo Rural / Hotelaria',location:'Talhadas - Sever do Vouga',website:'https://www.hotelruralvilarinho.com/',phone:'+351 234 568 204',email:'geral@hotelruralvilarinho.com',source:'https://www.visitportugal.com/pt-pt/content/hotel-rural-vilarinho',opportunity:'hotel rural e envolvente natural permitem criar conteúdo de inspiração sobre estadias, experiências locais, quartos e reservas diretas',idea:'Quartos + natureza + experiências + região + escapadinhas + reservas diretas',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Hotel Rural da Freita',sector:'Turismo Rural / Hotelaria',location:'Mizarela - Arouca',website:'https://hotelruraldafreita.pt/',phone:'+351 256 130 993',email:'geral@hotelruraldafreita.pt',source:'https://visitarouca.pt/alojamentos/hotel-rural-da-freita/',opportunity:'a localização na Serra da Freita e proximidade a pontos turísticos fortes criam excelente matéria para comunicar alojamento, território e reservas',idea:'Hotel + Serra da Freita + Arouca + experiências + quartos + reservas',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Milita Decoração',sector:'Decoração / Interiores',location:'Leiria',website:'https://militadecoracao.com/',phone:'+351 244 871 884 / +351 918 265 099',email:'geral@militadecoracao.com',source:'https://militadecoracao.com/servicos-prestados/',opportunity:'projetos de decoração, artigos por medida, papel de parede e cortinados permitem mostrar resultados, materiais e personalização de forma muito visual',idea:'Projetos + antes/depois + artigos por medida + materiais + 3D + montagens',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'João Maia Automóveis',sector:'Automóvel / Stand',location:'Sertã',website:'https://www.joaomaiaautomoveis.com/',phone:'+351 274 800 100 / +351 917 211 258',email:'geral@joaomaiaautomoveis.com',source:'https://usados.autonews.pt/stands-automoveis/dir/d/castelo-branco/c/serta/p-36853/joao-maia-automoveis/',opportunity:'o stock automóvel permite comunicação frequente de novas entradas, destaques, entregas e argumentos de confiança para gerar contactos comerciais',idea:'Stock + novas entradas + entregas + viaturas em destaque + dicas + bastidores',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'FS Automóveis',sector:'Automóvel / Stand',location:'Lisboa',website:'https://www.fsautomoveis.com/',phone:'+351 217 965 734 / +351 917 226 613',email:'geral@fsautomoveis.com',source:'https://usados.autonews.pt/stands-automoveis/dir/d/lisboa/c/lisboa/p-36991/fs-automoveis/',opportunity:'um stand em Lisboa pode transformar stock, oportunidades e entregas em conteúdo comercial recorrente orientado para mensagens e visitas',idea:'Viaturas + oportunidades + novas entradas + entregas + financiamento + confiança',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Logisformação',sector:'Formação Profissional',location:'Lisboa - Parque das Nações',website:'https://logisformacao.pt/',phone:'+351 218 610 520 / +351 919 456 912',email:'geral@logisformacao.pt',source:'https://logisformacao.pt/contactos.html',opportunity:'cursos profissionais e certificações permitem calendário editorial contínuo sobre próximas formações, competências, legislação e inscrições',idea:'Cursos + calendário + competências + certificações + dicas profissionais + inscrições',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'Área X Imobiliária',sector:'Imobiliário',location:'Oliveira de Azeméis',website:'https://www.areax-imobiliaria.pt/',phone:'+351 256 289 480 / +351 914 508 951',email:'geral@areax-imobiliaria.pt',source:'https://www.areax-imobiliaria.pt/contactos',opportunity:'carteira imobiliária e forte componente local permitem trabalhar imóveis, avaliação, mercado e captação de proprietários com frequência',idea:'Imóveis + visitas + mercado local + avaliação + dicas + captação',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'MGF Engenharia',sector:'Engenharia / Consultadoria / Projetos',location:'Vila Real',website:'https://www.mgf-engenharia.com/',phone:'+351 937 147 135',email:'geral@mgf-engenharia.com',source:'https://www.mgf-engenharia.com/contactos/',opportunity:'estudos, projetos e consultadoria de engenharia podem ser comunicados através de casos, processo, conhecimento técnico e acompanhamento de obra',idea:'Projetos + engenharia + processo + obra + conhecimento técnico + equipa',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
  {company:'Terceiro Piso',sector:'Organização de Eventos',location:'Rio Tinto - Gondomar',website:'https://terceiropiso.pt/',phone:'+351 915 720 849',email:'geral@terceiropiso.pt',source:'https://terceiropiso.pt/contactos/',opportunity:'organização de eventos oferece conteúdo altamente visual através de conceitos, produção, montagens, bastidores e resultados finais',idea:'Eventos + conceitos + montagens + bastidores + detalhes + eventos concluídos',priority:'atacar',plan:'premium',monthly:280,offer:140}
];

const planItems = {
  base:['2 publicações por semana','Design + copy','Planeamento mensal','Agendamento e publicação','Adaptação Instagram/Facebook','Consultoria básica de perfil','Relatório mensal simples'],
  intermedio:['3 publicações por semana','Até 6 stories por semana','Planeamento e gestão de destaques','Design + copy','Agendamento e publicação','Análise mensal com sugestões'],
  premium:['4 a 5 publicações por semana','Stories de segunda a sexta — até 15/semana','Edição simples de reels','Criação de campanhas e promoções','Gestão de mensagens/comentários (a definir)','Análises quinzenais']
};
const blockedDomains = new Set(['gmail.com','googlemail.com','hotmail.com','hotmail.pt','outlook.com','outlook.pt','live.com','live.pt','yahoo.com','yahoo.pt','icloud.com','me.com','aol.com','sapo.pt','mail.com','example.com','example.org','example.net']);
function proposal(l) { return `Assunto: ${l.company} — preparámos algo para si\n\nOlá,\n\nEstivemos a ver a comunicação da ${l.company} e acreditamos que há espaço para tirar mais partido das redes sociais.\n\nPreparámos uma proposta pensada para a ${l.company}. Veja o que preparámos para si e receba também um ebook gratuito.\n\nCumprimentos,`; }
function emailPassesStrictRules(l) {
  const email = String(l.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  const [local, domain] = email.split('@');
  if (!local || !domain || blockedDomains.has(domain)) return false;
  if (domain.includes('prospect.local') || domain.startsWith('test.') || domain.startsWith('example.')) return false;
  if (email.includes('@prospect.local') || email.startsWith('prospect-') || /^(no-?reply|noreply)/i.test(local)) return false;
  try { const host = new URL(l.website).hostname.replace(/^www\./,'').toLowerCase(); if (!(domain === host || domain.endsWith('.' + host) || host.endsWith('.' + domain))) return false; } catch (_) { return false; }
  return Boolean(l.source && /^https?:\/\//i.test(l.source));
}
function validateLeadSet() {
  const companies = new Set(), emails = new Set();
  for (const l of leads) {
    if (!emailPassesStrictRules(l)) throw new Error(`email inválido: ${l.company} <${l.email}>`);
    const companyKey = l.company.trim().toLowerCase(), emailKey = l.email.trim().toLowerCase();
    if (companies.has(companyKey)) throw new Error(`empresa duplicada no seed: ${l.company}`);
    if (emails.has(emailKey)) throw new Error(`email duplicado no seed: ${l.email}`);
    companies.add(companyKey); emails.add(emailKey);
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
  let added=0,rejected=0,duplicates=0;
  for (const l of leads) {
    if (!emailPassesStrictRules(l)) { rejected++; continue; }
    const email=l.email.trim().toLowerCase();
    if (findByCompany.get(l.company) || findByEmail.get(email)) { duplicates++; continue; }
    const id=Number(insertUser.run(l.company,email,placeholderHash,'client',l.company,l.phone||'').lastInsertRowid);
    insertCrm.run(id,l.sector,l.location,l.website,l.opportunity,l.idea,l.plan,planItems[l.plan].join('; '),l.monthly,l.offer,l.priority,`Email profissional público confirmado. Fonte exata: ${l.source}`,proposal(l)); added++;
  }
  console.log(`[crm] prospeção 2026-09-15: ${added} adicionados, ${duplicates} duplicados ignorados, ${rejected} rejeitados pela validação estrita`);
}
try { seed(); } catch (e) { console.warn('[crm] seed 2026-09-15:', e.message); }
