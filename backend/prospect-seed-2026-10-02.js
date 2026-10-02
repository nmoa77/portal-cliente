const crypto=require('crypto');
const bcrypt=require('bcryptjs');
const db=require('./db');
const {wasDeleted}=require('./prospect-deleted-guard');

try { db.prepare("ALTER TABLE prospect_crm ADD COLUMN email_observation TEXT").run(); } catch(e) { if(!/duplicate column name/i.test(e.message)) console.warn('[crm] email_observation:',e.message); }

const leads=[
{company:'Metalome',sector:'Metalomecânica / Indústria',location:'Chaves',website:'https://metalome.com/',phone:'',email:'geral@metalome.com',source:'https://metalome.com/contactos/',opportunity:'Transformar capacidade industrial, processos e investimento tecnológico em prova comercial baseada em aplicações e trabalhos concretos.',email_observation:'o website explica bem processos como corte, maquinagem, quinagem e soldadura, mas a galeria mostra sobretudo categorias e imagens sem explicar o trabalho realizado em cada caso',idea:'Casos de produção com necessidade do cliente, processo usado, detalhe técnico e resultado.',priority:'atacar',plan:'premium',monthly:280,offer:140},
{company:'GIROSOFT',sector:'Tecnologia / Software',location:'Massamá, Queluz',website:'https://girosoft.pt/',phone:'+351 214 301 376',email:'geral@girosoft.pt',source:'https://girosoft.pt/contacto/',opportunity:'Dar maior protagonismo a resultados concretos e casos de utilização das soluções à medida, complementando a comunicação muito centrada nas funcionalidades.',email_observation:'o website explica muito bem os serviços e o processo de desenvolvimento, mas os resultados concretos dos projetos aparecem com bastante menos destaque do que as funcionalidades',idea:'Mini casos com problema inicial, solução desenvolvida, integração e ganho obtido.',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
{company:'Paisagem',sector:'Paisagismo / Espaços exteriores',location:'Braga',website:'https://paisagem.eu/',phone:'+351 253 055 473',email:'geral@paisagem.eu',source:'https://paisagem.eu/',opportunity:'Explorar melhor o portefólio de espaços verdes, aquapaisagismo e projetos 2D/3D através de histórias visuais por intervenção.',email_observation:'o portefólio reúne projetos muito diferentes, desde jardins verticais a redes de rega e aquapaisagismo, mas muitos aparecem apenas pelo título e categoria, sem contar a transformação realizada',idea:'Antes/depois, conceito, solução técnica e evolução de cada espaço exterior.',priority:'atacar',plan:'premium',monthly:280,offer:140},
{company:'21atelier',sector:'Arquitetura / Engenharia',location:'Seixal',website:'https://www.21atelier.pt/',phone:'+351 967 004 501',email:'geral@21atelier.pt',source:'https://www.21atelier.pt/',opportunity:'Dar contexto aos projetos e ligar arquitetura, engenharia e acompanhamento de obra numa narrativa mais diferenciadora.',email_observation:'o website mostra vários projetos de habitação e construção, mas a maioria aparece apenas através de imagens e localização, com muito pouco contexto sobre conceito ou solução',idea:'Projeto em foco com condicionantes, conceito, especialidades e resultado.',priority:'atacar',plan:'premium',monthly:280,offer:140},
{company:'RESSA',sector:'Engenharia / Construção / Energia',location:'Algés, Oeiras',website:'https://ressa.pt/',phone:'+351 214 058 726',email:'geral@ressa.pt',source:'https://ressa.pt/portfolio/',opportunity:'Converter um portefólio amplo de obras públicas, reabilitação, energia e ambiente em conteúdo técnico acessível e recorrente.',email_observation:'o portefólio apresenta obras muito relevantes em áreas diferentes, mas vários projetos surgem apenas com o nome e a categoria, sem mostrar de forma imediata o desafio e a intervenção realizada',idea:'Caso de obra: contexto, problema, intervenção técnica e impacto final.',priority:'atacar',plan:'premium',monthly:280,offer:140},
{company:'PortalClima',sector:'Climatização / AVAC',location:'Lisboa',website:'https://portalclima.pt/',phone:'+351 916 679 029',email:'geral@portalclima.pt',source:'https://portalclima.pt/contactos/',opportunity:'Transformar a amplitude de serviços AVAC e manutenção em conteúdo orientado a situações reais de clientes residenciais, industriais e hotelaria.',email_observation:'o website apresenta claramente climatização, ventilação, refrigeração e assistência técnica, mas quase não mostra instalações ou intervenções reais que ajudem a visualizar cada solução',idea:'Instalações reais, manutenção preventiva, problema/solução e eficiência por tipo de espaço.',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
{company:'Energia Activa',sector:'Instalações Técnicas / Energia / Segurança',location:'São João da Talha, Loures',website:'https://www.energiaactiva.pt/',phone:'+351 214 041 731',email:'geral@energiaactiva.pt',source:'https://www.energiaactiva.pt/',opportunity:'Aproveitar projetos de referência e experiência multissetorial para criar casos técnicos com maior profundidade e prova de execução.',email_observation:'o website destaca projetos para marcas e espaços muito reconhecidos, mas na entrada essa prova aparece sobretudo em formato de portefólio, com pouco detalhe sobre o que foi executado em cada projeto',idea:'Projetos de referência explicados por especialidade, desafio, execução e resultado.',priority:'atacar',plan:'premium',monthly:280,offer:140},
{company:'Diagonal',sector:'Engenharia / Construção',location:'Oeiras',website:'https://www.diagonal.pt/',phone:'+351 939 122 769',email:'geral@diagonal.pt',source:'https://www.diagonal.pt/contactos/',opportunity:'Organizar os muitos registos de obra existentes em casos mais comerciais, mostrando processo, dificuldade e resultado.',email_observation:'a área de projetos tem muitas imagens de remodelações, fachadas e coberturas, mas vários trabalhos aparecem com títulos muito genéricos e sem explicar a intervenção feita',idea:'Antes/depois e caso de obra com problema, solução aplicada e resultado.',priority:'atacar',plan:'premium',monthly:280,offer:140},
{company:'VELNOR II',sector:'Engenharia / Arquitetura / Urbanismo',location:'Santa Maria da Feira',website:'https://www.velnor.pt/',phone:'+351 256 374 993',email:'geral@velnor.pt',source:'https://www.velnor.pt/',opportunity:'Dar mais profundidade narrativa ao portefólio residencial e mostrar a combinação entre arquitetura, engenharia e urbanismo.',email_observation:'o website tem muitos projetos residenciais em destaque, mas vários surgem repetidos em galeria apenas com nome e categoria, sem explicar o conceito ou a solução desenvolvida',idea:'Série por projeto com conceito, condicionantes, especialidades e pormenores do resultado.',priority:'atacar',plan:'premium',monthly:280,offer:140},
{company:'Intento',sector:'Tecnologia / Software de Gestão',location:'Carcavelos, Cascais',website:'https://www.intento.pt/',phone:'+351 916 610 655',email:'geral@intento.pt',source:'https://www.intento.pt/',opportunity:'Atualizar a apresentação comercial do software e transformar a extensa carteira de clientes em casos de utilização que demonstrem valor.',email_observation:'o website mostra uma carteira extensa de clientes e vários módulos de gestão, mas quase não transforma essas referências em casos que expliquem como o software resolveu necessidades concretas',idea:'Casos de cliente por módulo: necessidade, workflow implementado e benefício operacional.',priority:'atacar',plan:'intermedio',monthly:200,offer:100}
];

const blocked=new Set(['gmail.com','googlemail.com','hotmail.com','hotmail.pt','outlook.com','outlook.pt','live.com','live.pt','yahoo.com','yahoo.pt','icloud.com','me.com','aol.com','sapo.pt','mail.com','example.com','example.org','example.net']);
const planItems={intermedio:['3 publicações por semana','Até 6 stories por semana','Planeamento e gestão de destaques','Design + copy','Agendamento e publicação','Análise mensal com sugestões'],premium:['4 a 5 publicações por semana','Stories de segunda a sexta — até 15/semana','Edição simples de reels','Criação de campanhas e promoções','Gestão de mensagens/comentários (a definir)','Análises quinzenais']};

function proposal(l){return `Assunto: ${l.company} — reparei numa coisa\n\nOlá,\n\nSou o Nuno, da DUIT.\n\nEstive a conhecer melhor a ${l.company} e reparei que ${l.email_observation}.\n\nAcho que há aqui uma oportunidade simples de melhorar este ponto.\n\nSe fizer sentido para si, basta responder a este email e digo-lhe qual seria a primeira alteração que eu faria.`}

function valid(l){
 const e=l.email.trim().toLowerCase();
 const parts=e.split('@');
 if(parts.length!==2||!parts[0]||!parts[1]||!parts[1].includes('.'))return false;
 const local=parts[0],domain=parts[1];
 if(blocked.has(domain)||local.startsWith('noreply')||local.startsWith('no-reply'))return false;
 try{const host=new URL(l.website).hostname.toLowerCase().replace(/^www\./,'');if(!(domain===host||domain.endsWith('.'+host)||host.endsWith('.'+domain)))return false}catch(_){return false}
 return (l.source.startsWith('https://')||l.source.startsWith('http://'))&&Boolean(l.email_observation)&&Boolean(l.opportunity);
}

function seed(){
 const hash=bcrypt.hashSync(crypto.randomBytes(24).toString('hex'),10);
 const byCompany=db.prepare(`SELECT id FROM users WHERE role='client' AND is_prospect=1 AND lower(trim(company))=lower(trim(?))`);
 const byEmail=db.prepare(`SELECT id FROM users WHERE lower(trim(email))=lower(trim(?))`);
 const addUser=db.prepare(`INSERT INTO users (name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES (?,?,?,?,?,?,1,0)`);
 const addCrm=db.prepare(`INSERT OR IGNORE INTO prospect_crm (user_id,sector,location,website,opportunity,idea,email_observation,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,'por_contactar',?,?,?,datetime('now'))`);
 let added=0,duplicates=0,rejected=0,deleted=0;
 for(const l of leads){
  if(!valid(l)){rejected++;continue}
  const email=l.email.trim().toLowerCase();
  if(wasDeleted(email)){deleted++;continue}
  if(byCompany.get(l.company)||byEmail.get(email)){duplicates++;continue}
  const id=Number(addUser.run(l.company,email,hash,'client',l.company,l.phone||'').lastInsertRowid);
  addCrm.run(id,l.sector,l.location,l.website,l.opportunity,l.idea,l.email_observation,l.plan,planItems[l.plan].join('; '),l.monthly,l.offer,l.priority,`Email profissional público confirmado. Fonte exata: ${l.source} | Abordagem única: não fazer follow-up.`,proposal(l));
  added++;
 }
 console.log(`[crm] prospeção 2026-10-02: ${added} adicionados, ${duplicates} duplicados, ${deleted} apagados bloqueados, ${rejected} rejeitados`);
}
try{seed()}catch(e){console.warn('[crm] seed 2026-10-02:',e.message)}
