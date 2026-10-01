const crypto=require('crypto');
const bcrypt=require('bcryptjs');
const db=require('./db');
const {wasDeleted}=require('./prospect-deleted-guard');

try { db.prepare("ALTER TABLE prospect_crm ADD COLUMN email_observation TEXT").run(); } catch(e) { if(!/duplicate column name/i.test(e.message)) console.warn('[crm] email_observation:',e.message); }

const leads=[
{company:'FDE Engenharia',sector:'Engenharia / Construção',location:'Paços de Gaiolo, Marco de Canaveses',website:'https://www.fde-engenharia.pt/',phone:'+351 255 582 846',email:'geral@fde-engenharia.pt',source:'https://www.fde-engenharia.pt/contactos.html',opportunity:'Aproveitar o portefólio de empreendimentos e a amplitude das especialidades técnicas para criar conteúdo de autoridade orientado a casos reais.',email_observation:'o website apresenta vários empreendimentos de referência, mas explica pouco o desafio técnico e a solução de engenharia por trás de cada projeto',idea:'Casos de projeto com desafio, especialidades envolvidas, decisão técnica e resultado.',priority:'atacar',plan:'premium',monthly:280,offer:140},
{company:'Em arquitetura',sector:'Arquitetura / Reabilitação',location:'Portugal',website:'https://emarquitetura.pt/',phone:'+351 910 508 831',email:'geral@emarquitetura.pt',source:'https://emarquitetura.pt/contactos/',opportunity:'Transformar o portefólio existente numa narrativa mais completa sobre processo, contexto e decisões de projeto.',email_observation:'o website mostra muitos projetos pelo nome e pela imagem, mas quase não explica o conceito ou as decisões que tornam cada obra diferente',idea:'Um projeto de cada vez: contexto, problema, conceito, detalhe e resultado.',priority:'atacar',plan:'premium',monthly:280,offer:140},
{company:'Metalomecânica MJS',sector:'Metalomecânica / Indústria',location:'Santa Maria de Lamas / Paços de Brandão',website:'https://metalomecanica-mjs.com/',phone:'+351 227 445 071',email:'geral@metalomecanica-mjs.com',source:'https://metalomecanica-mjs.com/contatos/',opportunity:'Converter capacidade industrial, equipamentos CNC e experiência multissetorial em prova visual e técnica mais atual.',email_observation:'o website detalha bastante o parque de máquinas e os setores onde trabalham, mas quase não liga essas capacidades a peças ou trabalhos concretos realizados',idea:'Peça/problema/processo: mostrar maquinação, manutenção e soluções produzidas para cada indústria.',priority:'atacar',plan:'premium',monthly:280,offer:140},
{company:'TMMS Transportes',sector:'Transportes / Logística',location:'Argoncilhe / Esmoriz',website:'https://www.tmms.com.pt/',phone:'+351 917 844 335',email:'geral@tmms.com.pt',source:'https://www.tmms.com.pt/contact',opportunity:'Dar mais prova operacional à experiência em cargas, grupagem, expresso, armazenamento e distribuição.',email_observation:'o website explica bem os serviços de cargas e logística, mas a comunicação está muito centrada na descrição e mostra pouco da operação, frota e trabalho no terreno',idea:'Rotas, bastidores da operação, tipos de carga, frota e pequenos casos logísticos.',priority:'atacar',plan:'premium',monthly:280,offer:140},
{company:'Mobtec',sector:'Mobiliário Técnico / Equipamentos',location:'Bragança',website:'https://www.mobtec.pt/',phone:'+351 273 332 014',email:'geral@mobtec.pt',source:'https://www.mobtec.pt/pt/contactos-mobtec.html',opportunity:'Organizar a enorme variedade de soluções por contexto de utilização e dar maior protagonismo a projetos chave-na-mão.',email_observation:'o website reúne soluções para muitos setores diferentes, mas essa variedade torna menos evidente à primeira vista o trabalho de projeto e montagem chave-na-mão',idea:'Projetos por setor com espaço inicial, solução proposta, montagem e resultado final.',priority:'atacar',plan:'premium',monthly:280,offer:140},
{company:'CB Energia & Consultoria',sector:'Energia / Consultoria',location:'Paredes',website:'https://www.cb-energia.pt/',phone:'+351 255 136 248',email:'geral@cb-energia.pt',source:'https://www.cb-energia.pt/',opportunity:'Tornar serviços de consultoria e eficiência energética mais tangíveis através de cenários, poupança e aplicações reais.',email_observation:'o website identifica consultoria energética, fotovoltaicos, baterias de condensadores e LED, mas quase não mostra exemplos concretos de aplicação ou resultados obtidos',idea:'Casos de eficiência energética com situação inicial, solução e benefício mensurável.',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
{company:'Gráfica da Vergada',sector:'Impressão / Packaging / Artes gráficas',location:'Mozelos, Santa Maria da Feira',website:'https://graficadavergada.pt/',phone:'+351 227 643 122',email:'geral@graficadavergada.pt',source:'https://graficadavergada.pt/',opportunity:'Explorar visualmente packaging, sacos, acabamentos e produção para transformar o portefólio num argumento comercial recorrente.',email_observation:'o website mostra uma galeria extensa de projetos, mas muitos trabalhos aparecem apenas como imagem, sem contexto sobre materiais, acabamentos ou solução produzida',idea:'Projeto em detalhe: produto final, material, acabamento, técnica de impressão e objetivo da peça.',priority:'atacar',plan:'premium',monthly:280,offer:140},
{company:'MGC Transportes',sector:'Transportes de Passageiros / Mobilidade',location:'Avintes, Vila Nova de Gaia',website:'https://www.mgc.pt/',phone:'+351 227 863 010',email:'geral@mgc.pt',source:'https://www.mgc.pt/pt/contactos/',opportunity:'Dar maior visibilidade aos diferentes usos do serviço ocasional, frota e transporte especializado para empresas e escolas.',email_observation:'o website apresenta números fortes de operação e uma frota de elevada capacidade, mas esses dados aparecem pouco transformados em histórias ou exemplos concretos de serviço',idea:'Serviços reais por cenário: eventos, turismo, empresas, escolas e deslocações desportivas.',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
{company:'Engenharia Líquida',sector:'Tecnologias de Água / Rega / Tratamento',location:'Carnaxide',website:'https://engenharialiquida.pt/',phone:'+351 214 181 055',email:'geral@engenharialiquida.pt',source:'https://engenharialiquida.pt/en/contactos/',opportunity:'Atualizar a prova de atividade e comunicar aplicações recentes das soluções de rega e tratamento de água.',email_observation:'a área de destaques do website ainda dá grande visibilidade a conteúdos antigos, como a AgroGlobal 2018, apesar de a empresa trabalhar soluções técnicas com aplicações muito atuais',idea:'Projetos recentes, eficiência hídrica, tecnologias de tratamento e aplicações por setor.',priority:'atacar',plan:'intermedio',monthly:200,offer:100},
{company:'Gráfica Pimenta',sector:'Impressão / Artes gráficas',location:'Cartaxo',website:'https://graficapimenta.pt/',phone:'+351 243 770 026',email:'geral@graficapimenta.pt',source:'https://graficapimenta.pt/contactos/',opportunity:'Aproveitar a diversidade de impressão, packaging, rótulos e acabamentos para criar conteúdo comercial baseado em trabalhos reais.',email_observation:'o website apresenta muitos serviços e já tem conteúdos editoriais, mas os projetos concluídos quase não aparecem explicados como casos reais de produção',idea:'Casos de produção com objetivo, suporte, técnica, acabamento e peça final.',priority:'atacar',plan:'premium',monthly:280,offer:140}
];

const blocked=new Set(['gmail.com','googlemail.com','hotmail.com','hotmail.pt','outlook.com','outlook.pt','live.com','live.pt','yahoo.com','yahoo.pt','icloud.com','me.com','aol.com','sapo.pt','mail.com','example.com','example.org','example.net']);
const planItems={intermedio:['3 publicações por semana','Até 6 stories por semana','Planeamento e gestão de destaques','Design + copy','Agendamento e publicação','Análise mensal com sugestões'],premium:['4 a 5 publicações por semana','Stories de segunda a sexta — até 15/semana','Edição simples de reels','Criação de campanhas e promoções','Gestão de mensagens/comentários (a definir)','Análises quinzenais']};

function proposal(l){return `Assunto: ${l.company} — reparei numa coisa\n\nOlá,\n\nSou o Nuno, da DUIT.\n\nEstive a conhecer melhor a ${l.company} e reparei que ${l.email_observation}.\n\nAcho que há aqui uma oportunidade simples de melhorar este ponto.\n\nSe fizer sentido para si, basta responder a este email e digo-lhe qual seria a primeira alteração que eu faria.`}

function valid(l){
 const e=l.email.trim().toLowerCase();
 if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(e))return false;
 const [local,domain]=e.split('@');
 if(blocked.has(domain)||/^(no-?reply|noreply)/i.test(local))return false;
 try{const host=new URL(l.website).hostname.replace(/^www\\./,'').toLowerCase();if(!(domain===host||domain.endsWith('.'+host)||host.endsWith('.'+domain)))return false}catch(_){return false}
 return /^https?:\\/\\//i.test(l.source)&&Boolean(l.email_observation)&&Boolean(l.opportunity);
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
 console.log(`[crm] prospeção 2026-10-01-b: ${added} adicionados, ${duplicates} duplicados, ${deleted} apagados bloqueados, ${rejected} rejeitados`);
}
try{seed()}catch(e){console.warn('[crm] seed 2026-10-01-b:',e.message)}
