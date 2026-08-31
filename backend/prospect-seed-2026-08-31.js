const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');

// Prospecção DUIT 2026-08-31 — apenas empresas com email público real confirmado em fonte pública credível.
const leads = [
  {company:'5 Elementos',sector:'Ginásio / Fitness',location:'Odivelas',website:'https://ginasio5elementos.pt/',phone:'+351 219 316 117 / +351 939 737 899',email:'ginasio5elementos@gmail.com',source:'https://ginasio5elementos.pt/contactos/',opportunity:'o ginásio tem treinos, PT, nutrição e comunidade suficientes para alimentar uma presença social muito mais frequente, visual e orientada a novas inscrições',idea:'Aulas + PT + comunidade + campanhas de adesão + resultados',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Ginásios da Educação Da Vinci - Odivelas',sector:'Educação / Centro de Explicações',location:'Odivelas - Colinas do Cruzeiro',website:'https://www.ginasiosdavinci.com/odivelas/',phone:'+351 911 778 764',email:'odivelas@davinci.edu.pt',source:'https://www.ginasiosdavinci.com/odivelas/contactos.php',opportunity:'explicações, idiomas, exames e summer school criam temas recorrentes ao longo do ano letivo e permitem campanhas muito segmentadas para pais e alunos',idea:'Calendário escolar + dicas de estudo + resultados + inscrições',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Onodera Odivelas',sector:'Medicina Estética / Estética',location:'Ramada - Odivelas',website:'https://clinicasonodera.pt/clinica/odivelas/',phone:'+351 939 572 826',email:'geralodivelas@onodera.com.pt',source:'https://clinicasonodera.pt/clinica/odivelas/',opportunity:'a forte componente visual dos tratamentos, tecnologia e equipa clínica permite criar conteúdos de confiança, educação e campanhas recorrentes com elevado potencial de marcação',idea:'Tratamentos + tecnologia + equipa + dúvidas + campanhas mensais',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Florista Rosiflor - Odivelas',sector:'Florista / Decoração Floral',location:'Odivelas',website:'https://www.floristarosiflor.pt/',phone:'+351 214 367 958',email:'rosiflor.queluz@gmail.com',source:'https://www.floristarosiflor.pt/contactos-e-localizacao',opportunity:'flores, arranjos, datas especiais e decoração são conteúdo naturalmente visual e sazonal, ideal para gerar encomendas recorrentes através de Instagram e Facebook',idea:'Arranjos + datas especiais + bastidores + encomendas + inspiração',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Carlos Florindo Arquitetura e Urbanismo',sector:'Arquitetura / Urbanismo',location:'Loures',website:'https://www.arqcarlosflorindo.com/',phone:'+351 935 097 990',email:'arqcarlosflorindo@gmail.com',source:'https://www.arqcarlosflorindo.com/',opportunity:'projetos, renders, obra e detalhe arquitetónico têm enorme força visual e podem posicionar o gabinete como referência local enquanto geram novos pedidos de projeto',idea:'Projetos + renders + processo + antes/depois + autoridade',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Marimba Restaurante',sector:'Restauração / Eventos',location:'Infantado - Loures',website:'https://www.marimbarestaurante.pt/',phone:'+351 933 756 703',email:'marimbarestaurante.1@gmail.com',source:'https://www.marimbarestaurante.pt/',opportunity:'a combinação de gastronomia africana, pratos do dia, música e eventos cria matéria muito forte para reels, stories e campanhas que tragam reservas e grupos',idea:'Pratos + música + eventos + bastidores + reservas',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:"Paullu's Odivelas",sector:'Restauração',location:'Odivelas',website:'https://paullus.pt/',phone:'+351 219 341 373',email:'paullusodivelas@gmail.com',source:'https://paullus.pt/contactos/',opportunity:'a cozinha portuguesa, os fornecedores locais e o ambiente da casa permitem criar uma comunicação apetecível e regular que transforme visualizações em reservas',idea:'Pratos assinatura + produto local + equipa + menus + reservas',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Aquassis Florista',sector:'Florista / Decoração Floral',location:'Portela - Loures',website:'https://aquassis.pt/',phone:'+351 219 431 004',email:'geral@aquassis.pt',source:'https://aquassis.pt/contactos/',opportunity:'decoração floral, ocasiões especiais e trabalhos personalizados dão conteúdo visual constante e permitem campanhas sazonais orientadas a encomendas',idea:'Decoração floral + eventos + épocas especiais + encomendas',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Instituto Katiuscia Teles',sector:'Beleza / Formação',location:'Odivelas',website:'https://www.katiusciateles.pt/',phone:'+351 939 040 667',email:'suportekatiusciateles@gmail.com',source:'https://www.katiusciateles.pt/contact',opportunity:'serviços de beleza e formação permitem cruzar resultados visuais, demonstrações, autoridade e campanhas de cursos numa comunicação regular e muito vendável',idea:'Resultados + técnicas + formação + bastidores + inscrições',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Codipostal / Party Place',sector:'Artigos de Festa / Decoração / B2B',location:'Montemor - Loures',website:'https://www.codipostal.com/',phone:'+351 219 385 432 / +351 917 587 798',email:'geral@codipostal.com',source:'https://www.codipostal.com/contacts',opportunity:'o catálogo de festas, balões, decoração, novidades e coleções é extremamente visual e dá margem para comunicação frequente dirigida a profissionais e lojas',idea:'Novidades + tendências + coleções + inspiração + campanhas B2B',priority:'atacar',plan:'intermedio',monthly:200,offer:100}
];

const planItems = {
  base:['2 publicações por semana','Design + copy','Planeamento mensal','Agendamento e publicação','Adaptação Instagram/Facebook','Consultoria básica de perfil','Relatório mensal simples'],
  intermedio:['3 publicações por semana','Até 6 stories por semana','Planeamento e gestão de destaques','Design + copy','Agendamento e publicação','Análise mensal com sugestões'],
  premium:['4 a 5 publicações por semana','Stories de segunda a sexta — até 15/semana','Edição simples de reels','Criação de campanhas e promoções','Gestão de mensagens/comentários (a definir)','Análises quinzenais']
};

function proposal(l){
  const lines = planItems[l.plan].map(x => `✓ ${x}`).join('\n');
  return `Assunto: ${l.company} — uma ideia para as vossas redes\n\nOlá,\n\nEstivemos a analisar a comunicação da ${l.company} e vimos uma oportunidade concreta: ${l.opportunity}.\n\nA ideia que prepararíamos para vocês seria: ${l.idea}.\n\nPara a ${l.company}, recomendamos o plano ${l.plan === 'premium' ? 'Premium' : l.plan === 'intermedio' ? 'Intermédio' : 'Base'}:\n\n${lines}\n\n${l.monthly}€/mês\n\nPara tornar a decisão mais simples, os primeiros 15 dias ficam por nossa conta — uma poupança de ${l.offer}€ no arranque.\n\nSe fizer sentido, respondam a este email e mostramos como aplicaríamos esta linha de conteúdos à ${l.company}.\n\nDUIT — Design? We DUIT.`;
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
    const existing = findByCompany.get(l.company) || findByEmail.get(email);
    if (existing) continue;
    const id = Number(insertUser.run(l.company,email,placeholderHash,'client',l.company,l.phone || '').lastInsertRowid);
    insertCrm.run(id,l.sector,l.location,l.website,l.opportunity,l.idea,l.plan,planItems[l.plan].join('; '),l.monthly,l.offer,l.priority,`Email público confirmado. Fonte: ${l.source}`,proposal(l));
    added++;
  }
  console.log(`[crm] prospeção 2026-08-31: ${added} novos prospects importados sem duplicações`);
}

try { seed(); } catch (e) { console.warn('[crm] seed 2026-08-31:', e.message); }
