const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');

// Prospecção DUIT 2026-09-01 — apenas empresas com email público real confirmado.
const leads = [
  {company:'Gingole Restaurante',sector:'Restauração',location:'Casal do Chapim - Odivelas',website:'https://www.gingolerestaurante.pt/',phone:'+351 214 038 526 / +351 927 324 856',email:'gingole@gingolerestaurante.pt',source:'https://www.gingolerestaurante.pt/contacto/',opportunity:'a cozinha, os pratos do dia, o ambiente e as reservas geram conteúdo visual recorrente capaz de aumentar notoriedade local e transformar seguidores em mesas ocupadas',idea:'Pratos + bastidores + equipa + sugestões da semana + reservas',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:"Queda d'Água - Odivelas",sector:'Restaurante / Marisqueira',location:'Colinas do Cruzeiro - Odivelas',website:'https://www.quedadagua.pt/',phone:'+351 969 301 129 / +351 216 058 501',email:'info@quedadagua.pt',source:'https://www.quedadagua.pt/',opportunity:'marisco, rodízio, paelha, vinhos e especialidades têm enorme força visual e permitem campanhas frequentes orientadas a reservas, grupos e ocasiões especiais',idea:'Especialidades + marisco + reels de cozinha + menus de grupo + reservas',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Sofia Hair Designer',sector:'Cabeleireiro / Beleza',location:'Odivelas',website:'https://www.sofiahairdesigner.pt/',phone:'+351 933 654 311',email:'estupendabelezalda@gmail.com',source:'https://www.sofiahairdesigner.pt/localizacao-e-horarios',opportunity:'transformações de corte e cor, aconselhamento e testemunhos reais dão matéria visual constante para reforçar confiança e gerar marcações',idea:'Antes/depois + cor + dicas de cuidado + testemunhos + agenda',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Ana Antunes Fotografia',sector:'Fotografia / Marca Pessoal',location:'Odivelas - Lisboa',website:'https://www.anaantunesfotografia.com/',phone:'+351 911 798 256',email:'anaantunesfotografia@gmail.com',source:'https://www.anaantunesfotografia.com/contato',opportunity:'retratos, gravidez, famílias, recém-nascidos e marca pessoal são serviços altamente visuais, com portefólio forte para transformar conteúdo em pedidos de sessão',idea:'Portefólio + histórias de clientes + bastidores + preparação de sessão + vagas',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Pastelaria Didu',sector:'Pastelaria / Restauração',location:'Flamenga - Loures',website:'https://pastelariadidu.pt/',phone:'+351 219 884 332',email:'info@pastelariadidu.pt',source:'https://pastelariadidu.pt/contactos/',opportunity:'pastelaria, bolos, encomendas e refeições oferecem conteúdo apetecível todos os dias e campanhas sazonais com potencial direto de venda',idea:'Produto do dia + encomendas + fabrico + datas especiais + refeições',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Ginásio Super Tónico',sector:'Ginásio / Fitness',location:'Lisboa - Alcântara',website:'https://bvalente1979.wixsite.com/supertonico',phone:'+351 931 784 722',email:'supertonico@gmail.com',source:'https://bvalente1979.wixsite.com/supertonico/contact',opportunity:'treinos, aulas experimentais, evolução dos alunos e rotina do ginásio permitem uma comunicação energética e frequente orientada a novas inscrições',idea:'Treinos + alunos + desafios + dicas + aula experimental',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Restaurante Salero',sector:'Restauração / Eventos',location:'Loures',website:'https://www.salero.pt/',phone:'+351 219 820 119 / +351 919 550 988',email:'reservas@salero.pt',source:'https://rotadosvinhosbcc.com/index.php/pt/bucelas-locais-comer/83-13',opportunity:'restauração, esplanada, eventos, casamentos e grupos criam vários ângulos de conteúdo e campanhas capazes de aumentar reservas e pedidos de orçamento',idea:'Pratos + eventos + grupos + espaço + bastidores + reservas',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Osteria Villa Medici',sector:'Restauração Italiana',location:'Odivelas',website:'https://osteriavillamedici.pt/',phone:'+351 935 171 574',email:'reservas@osteriavillamedici.pt',source:'https://osteriavillamedici.pt/',opportunity:'cozinha romana, pinsas, noites com música ao vivo, grupos e ambiente pet friendly criam uma identidade visual forte e muitos motivos semanais para comunicar',idea:'Cozinha romana + noite italiana + pinsas + grupos + pet friendly',priority:'atacar',plan:'premium',monthly:280,offer:140},
  {company:'Atelier Átrio',sector:'Arquitetura / Remodelação',location:'Loures',website:'https://www.atelier-atrio.pt/',phone:'+351 926 056 723',email:'info@atelier-atrio.pt',source:'https://www.atelier-atrio.pt/sobre',opportunity:'projetos de habitação, restauração, turismo e remodelação têm forte valor visual e podem mostrar processo, rigor e resultados para gerar novos pedidos de projeto',idea:'Projetos + plantas/renders + obra + detalhe + antes/depois + processo',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
  {company:'Pastelaria Espiga Dourada',sector:'Pastelaria / Restauração',location:'Odivelas',website:'https://www.espigadourada.com/',phone:'+351 219 339 316',email:'espiga1@espigadourada.com',source:'https://www.espigadourada.com/contactos.htm',opportunity:'fabrico próprio, pão, pastelaria e refeições permitem criar uma presença diária muito visual e campanhas sazonais que tragam visitas e encomendas',idea:'Fabrico próprio + produto do dia + refeições + datas especiais + encomendas',priority:'atacar',plan:'intermedio',monthly:200,offer:100}
];

const planItems = {
  base:['2 publicações por semana','Design + copy','Planeamento mensal','Agendamento e publicação','Adaptação Instagram/Facebook','Consultoria básica de perfil','Relatório mensal simples'],
  intermedio:['3 publicações por semana','Até 6 stories por semana','Planeamento e gestão de destaques','Design + copy','Agendamento e publicação','Análise mensal com sugestões'],
  premium:['4 a 5 publicações por semana','Stories de segunda a sexta — até 15/semana','Edição simples de reels','Criação de campanhas e promoções','Gestão de mensagens/comentários (a definir)','Análises quinzenais']
};

function proposal(l){
  const lines = planItems[l.plan].map(x => `✓ ${x}`).join('\n');
  const planName = l.plan === 'premium' ? 'Premium' : l.plan === 'intermedio' ? 'Intermédio' : 'Base';
  return `Assunto: ${l.company} — uma ideia para transformar conteúdo em clientes\n\nOlá,\n\nEstivemos a analisar a comunicação da ${l.company} e vimos uma oportunidade concreta: ${l.opportunity}.\n\nA linha que propomos trabalhar é: ${l.idea}.\n\nPara a ${l.company}, recomendamos o plano ${planName}:\n\n${lines}\n\n${l.monthly}€/mês\n\nPara facilitar o arranque, os primeiros 15 dias ficam por nossa conta — uma poupança de ${l.offer}€.\n\nSe fizer sentido, respondam a este email e mostramos um exemplo prático de como aplicaríamos esta linha de conteúdos à ${l.company}.\n\nDUIT — Design? We DUIT.`;
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
  console.log(`[crm] prospeção 2026-09-01: ${added} novos prospects importados sem duplicações`);
}

try { seed(); } catch (e) { console.warn('[crm] seed 2026-09-01:', e.message); }
