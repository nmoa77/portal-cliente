const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');

// Prospecção DUIT 2026-09-02 — apenas empresas com email público real confirmado.
const leads = [
  {company:'Sua Linda Health & Beauty',sector:'Beleza / Estética',location:'Odivelas',website:'https://sualinda.pt/',phone:'+351 932 768 231',email:'sualinda.info@gmail.com',source:'https://sualinda.pt/',opportunity:'cabelo, unhas, sobrancelhas, tratamentos faciais e maquilhagem dão conteúdo visual constante e campanhas fáceis de ligar a marcações',idea:'Antes/depois + serviços da semana + bastidores + agenda + campanhas',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Marisqueira Florbela',sector:'Restauração / Marisqueira',location:'Olival Basto - Odivelas',website:'http://florbela.amawebs.com/',phone:'+351 219 370 308',email:'marisqueiraflorbela@gmail.com',source:'https://www.aiyellow.com/marisqueiraflorbela/',opportunity:'marisco, peixe fresco, carne e serviço de refeições são altamente visuais e permitem campanhas semanais orientadas a reservas e grupos',idea:'Marisco + peixe fresco + cozinha + especialidades + reservas',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Ginásio Contraste',sector:'Ginásio / Fitness',location:'Moscavide - Loures',website:'http://www.ginasiocontraste.com',phone:'+351 219 446 577',email:'geral@ginasiocontraste.com',source:'https://lifecooler.com/artigo/atividades/ginasio-contraste/343507/',opportunity:'musculação, cardio, sauna e serviços complementares permitem uma comunicação mais frequente focada em comunidade, resultados e inscrições',idea:'Treinos + comunidade + desafios + serviços + campanha experimental',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Siluet',sector:'Clínica de Estética',location:'Colinas do Cruzeiro - Odivelas',website:'https://siluet.pt/',phone:'+351 211 380 794 / +351 910 021 681',email:'geral@siluet.pt',source:'https://siluet.pt/contactos/',opportunity:'tratamentos de rosto e corpo têm forte componente visual e permitem trabalhar educação, resultados, tecnologia e campanhas mensais orientadas a marcações',idea:'Tratamento do mês + tecnologia + resultados + dúvidas + marcações',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Restaurante À Mesa',sector:'Restauração',location:'Colinas do Cruzeiro - Odivelas',website:'https://www.facebook.com/restauranteamesa2016/',phone:'+351 219 332 191',email:'restauranteamesa2016@gmail.com',source:'https://lifecooler.com/artigo/atividades/restaurante-mesa/457287',opportunity:'pratos portugueses, risottos, ambiente e sugestões da casa permitem criar conteúdo apetecível e campanhas regulares para reservas e grupos',idea:'Pratos assinatura + sugestão semanal + cozinha + ambiente + reservas',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Restaurante Tons & Sabores',sector:'Restauração',location:'Odivelas',website:'http://www.tonsesabores.pt',phone:'+351 214 074 713',email:'tons.sabores@gmail.com',source:'https://lifecooler.com/artigo/atividades/restaurante-tons-sabores/458578',opportunity:'comida caseira, esplanada e rotina diária do restaurante oferecem matéria recorrente para conteúdos simples, próximos e orientados a visitas',idea:'Prato do dia + cozinha + equipa + esplanada + reservas',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Casa dos Caracóis',sector:'Restauração',location:'Odivelas',website:'https://www.facebook.com/pages/CASA-DOS-CARAC%C3%93IS/112273948806794',phone:'+351 219 334 757',email:'casadoscaracois@gmail.com',source:'https://lifecooler.com/artigo/atividades/casa-dos-caracis/364417',opportunity:'a notoriedade local dos caracóis e a restante cozinha tradicional podem ser transformadas em conteúdo sazonal, visual e muito partilhável',idea:'Época dos caracóis + pratos tradicionais + bastidores + horários + reservas',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'SR Restaurante Garrafeira',sector:'Restauração / Vinhos',location:'Infantado - Loures',website:'https://rotadosvinhosbcc.com/index.php/pt/bucelas-locais-comer/243-sr-restaurante-garrafeira',phone:'+351 218 018 413',email:'sr2restaurante@gmail.com',source:'https://rotadosvinhosbcc.com/index.php/pt/bucelas-locais-comer/243-sr-restaurante-garrafeira',opportunity:'a combinação de gastronomia, carta de vinhos e ambiente cuidado permite posicionar o restaurante com conteúdos de maior valor visual e campanhas de reserva',idea:'Prato + vinho + harmonizações + sala + ocasiões especiais',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Lisboa Ginásio Clube',sector:'Ginásio / Desporto',location:'Lisboa - Arroios',website:'http://www.lgc.pt',phone:'+351 213 154 002',email:'geral@lgc.pt',source:'https://www.aglisboa.pt/clubesfiliados',opportunity:'a variedade de modalidades e a história do clube permitem trabalhar comunidade, aulas, atletas e campanhas de captação durante todo o ano',idea:'Modalidades + atletas + calendário + comunidade + inscrição experimental',priority:'possivel',plan:'premium',monthly:280,offer:140},
  {company:'PTdoRestelo',sector:'Ginásio / Personal Training',location:'Lisboa - Restelo',website:'https://www.ptdorestelo.pt/',phone:'+351 910 409 173',email:'geral@ptdorestelo.pt',source:'https://www.nit.pt/fit/ginasios-e-outdoor/o-ginasio-ptdorestelo-tem-novas-modalidades-e-esta-ainda-melhor',opportunity:'personal training, pilates, fitboxe, nutrição, spa e massagens dão uma base rica para conteúdos de autoridade, transformação e aquisição de novos clientes',idea:'Treino + modalidades + transformação + especialistas + aula experimental',priority:'atacar',plan:'premium',monthly:280,offer:140}
];

const planItems = {
  base:['2 publicações por semana','Design + copy','Planeamento mensal','Agendamento e publicação','Adaptação Instagram/Facebook','Consultoria básica de perfil','Relatório mensal simples'],
  intermedio:['3 publicações por semana','Até 6 stories por semana','Planeamento e gestão de destaques','Design + copy','Agendamento e publicação','Análise mensal com sugestões'],
  premium:['4 a 5 publicações por semana','Stories de segunda a sexta — até 15/semana','Edição simples de reels','Criação de campanhas e promoções','Gestão de mensagens/comentários (a definir)','Análises quinzenais']
};

function proposal(l){
  const lines = planItems[l.plan].map(x => `✓ ${x}`).join('\n');
  const planName = l.plan === 'premium' ? 'Premium' : l.plan === 'intermedio' ? 'Intermédio' : 'Base';
  return `Assunto: ${l.company} — uma ideia para transformar redes em clientes\n\nOlá,\n\nEstivemos a analisar a comunicação da ${l.company} e vimos uma oportunidade concreta: ${l.opportunity}.\n\nA linha que sugerimos trabalhar é: ${l.idea}.\n\nPara a ${l.company}, recomendamos o plano ${planName}:\n\n${lines}\n\n${l.monthly}€/mês\n\nPara facilitar o arranque, os primeiros 15 dias ficam por nossa conta — uma poupança de ${l.offer}€.\n\nSe fizer sentido, respondam a este email e mostramos um exemplo prático de como aplicaríamos esta linha de conteúdos à ${l.company}.\n\nDUIT — Design? We DUIT.`;
}

function seed(){
  const placeholderHash = bcrypt.hashSync(crypto.randomBytes(24).toString('hex'), 10);
  const findByCompany = db.prepare(`SELECT id FROM users WHERE role='client' AND is_prospect=1 AND lower(trim(company))=lower(trim(?))`);
  const findByEmail = db.prepare(`SELECT id FROM users WHERE lower(trim(email))=lower(trim(?))`);
  const insertUser = db.prepare(`INSERT INTO users (name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES (?,?,?,?,?,?,1,0)`);
  const insertCrm = db.prepare(`INSERT OR IGNORE INTO prospect_crm (user_id,sector,location,website,opportunity,idea,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?, 'por_contactar',?,?,?,datetime('now'))`);
  let added = 0;
  for (const l of leads) {
    const email = String(l.email || '').trim().toLowerCase();
    if (!email || email.endsWith('@prospect.local')) continue;
    if (findByCompany.get(l.company) || findByEmail.get(email)) continue;
    const id = Number(insertUser.run(l.company,email,placeholderHash,'client',l.company,l.phone || '').lastInsertRowid);
    insertCrm.run(id,l.sector,l.location,l.website,l.opportunity,l.idea,l.plan,planItems[l.plan].join('; '),l.monthly,l.offer,l.priority,`Email público confirmado. Fonte: ${l.source}`,proposal(l));
    added++;
  }
  console.log(`[crm] prospeção 2026-09-02: ${added} novos prospects importados sem duplicações`);
}

try { seed(); } catch (e) { console.warn('[crm] seed 2026-09-02:', e.message); }
