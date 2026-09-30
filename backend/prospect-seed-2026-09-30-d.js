const crypto=require('crypto');
const bcrypt=require('bcryptjs');
const db=require('./db');
const {wasDeleted}=require('./prospect-deleted-guard');

const leads=[
{company:'Metalome',sector:'Metalomecânica / Indústria',location:'Chaves',website:'https://metalome.com/',phone:'',email:'geral@metalome.com',source:'https://metalome.com/contactos/',observation:'o site explica bem as capacidades técnicas, mas os processos de corte, maquinagem, quinagem e soldadura têm potencial para uma comunicação visual mais orientada a casos reais',idea:'Transformar processos e peças produzidas em pequenos casos visuais: problema, processo e resultado.',priority:'atacar',plan:'premium',monthly:280,offer:140},
{company:'SSAF — Susete da Silva + Ana Ferreira Arquitectos',sector:'Arquitetura / Design / Engenharia',location:'Loures',website:'https://www.ssaf.pt/',phone:'+351 216 055 196',email:'geral@ssaf.pt',source:'https://www.ssaf.pt/',observation:'o site apresenta vários projetos e modelação 3D, mas há espaço para dar mais protagonismo visual ao processo e às decisões por trás de cada projeto',idea:'Série projeto a projeto com conceito, modelação 3D, evolução e resultado.',priority:'atacar',plan:'premium',monthly:280,offer:140},
{company:'LC Piscinas',sector:'Piscinas / Manutenção / Construção',location:'Lisboa',website:'https://lcpiscinas.pt/',phone:'966 708 147',email:'geral@lcpiscinas.pt',source:'https://lcpiscinas.pt/contactos/',observation:'o site comunica muitos serviços e planos de manutenção, mas esses serviços podem ser mostrados de forma mais visual através de intervenções e resultados concretos',idea:'Antes/depois de reparações, manutenção e construção, com explicação curta do trabalho realizado.',priority:'atacar',plan:'premium',monthly:280,offer:140},
{company:'Gesto Artes Gráficas',sector:'Impressão / Artes gráficas',location:'Câmara de Lobos',website:'https://www.gesto.pt/',phone:'+351 291 946 750',email:'geral@gesto.pt',source:'https://www.gesto.pt/contactos',observation:'a presença online identifica claramente a atividade de artes gráficas, um serviço muito visual que permite mostrar melhor materiais, acabamentos e trabalhos produzidos',idea:'Conteúdo de detalhe sobre materiais, acabamentos e peças acabadas, com bastidores de produção.',priority:'atacar',plan:'premium',monthly:280,offer:140},
{company:'Miguel Monteiro — Sistemas de Segurança',sector:'Segurança eletrónica / Domótica',location:'Loures',website:'https://mmsistemasdeseguranca.pt/',phone:'+351 920 280 049',email:'geral@mmsistemasdeseguranca.pt',source:'https://mmsistemasdeseguranca.pt/contactos',observation:'o site detalha CCTV, intrusão, incêndio, acessos e domótica, mas a variedade de soluções pode ser tornada mais simples para quem ainda não sabe qual sistema precisa',idea:'Conteúdos por cenário: moradia, loja, armazém ou empresa, explicando de forma simples a solução indicada.',priority:'possivel',plan:'intermedio',monthly:200,offer:100},
{company:'Aquapiscinas',sector:'Piscinas / Construção / Manutenção',location:'Viana do Castelo',website:'https://www.aquapiscinas.pt/',phone:'253 780 916',email:'geral@aquapiscinas.pt',source:'https://www.aquapiscinas.pt/contactos',observation:'o site está muito orientado ao pedido de orçamento para construção de piscinas, deixando uma oportunidade para trabalhar mais prova visual de obras concluídas e transformação dos espaços',idea:'Projetos concluídos, evolução da obra e antes/depois com foco no espaço exterior.',priority:'atacar',plan:'premium',monthly:280,offer:140},
{company:'Atelier — Arquitetura e Engenharia',sector:'Arquitetura / Engenharia',location:'Vila Verde',website:'https://atelier.pt/',phone:'+351 253 321 453',email:'geral@atelier.pt',source:'https://atelier.pt/contactos/',observation:'o site convida o cliente a apresentar projetos e ideias, mas o próprio processo do atelier pode ganhar mais visibilidade para ajudar a perceber como uma ideia evolui até à execução',idea:'Conteúdo sobre etapas do projeto, escolhas de materiais, desenho e acompanhamento de obra.',priority:'atacar',plan:'premium',monthly:280,offer:140},
{company:'Litoprint',sector:'Impressão / Artes gráficas',location:'Águeda',website:'https://litoprint.pt/',phone:'234 600 330',email:'geral@litoprint.pt',source:'https://litoprint.pt/contactos/',observation:'a empresa disponibiliza vários contactos por área e tem uma atividade fortemente visual, criando uma oportunidade para aproximar a comunicação comercial dos trabalhos e capacidades de produção',idea:'Mostrar produtos impressos reais, pormenores de acabamento, máquinas e etapas de produção.',priority:'atacar',plan:'premium',monthly:280,offer:140},
{company:'Etigráfe',sector:'Impressão / Artes gráficas',location:'Loures',website:'https://www.etigrafe.pt/',phone:'21 981 75 20',email:'geral@etigrafe.pt',source:'https://www.etigrafe.pt/pt/content/54-contactos',observation:'o contacto online é bastante direto e funcional, mas a natureza gráfica do negócio permite uma apresentação mais forte dos trabalhos, materiais e aplicações finais',idea:'Portefólio editorial recorrente com trabalhos finais, materiais, formatos e detalhes de produção.',priority:'atacar',plan:'premium',monthly:280,offer:140},
{company:'ACMA Piscinas',sector:'Piscinas / Impermeabilizações',location:'Albergaria-a-Velha',website:'https://acma.com.pt/',phone:'234 524 744',email:'geral@acma.com.pt',source:'https://acma.com.pt/contacto/',observation:'o site destaca experiência e soluções tecnológicas, mas há uma oportunidade clara para tornar essa experiência mais tangível através de projetos, etapas de construção e resultados',idea:'Casos reais de construção e impermeabilização com sequência de obra e resultado final.',priority:'atacar',plan:'premium',monthly:280,offer:140}
];

const blocked=new Set(['gmail.com','googlemail.com','hotmail.com','hotmail.pt','outlook.com','outlook.pt','live.com','live.pt','yahoo.com','yahoo.pt','icloud.com','me.com','aol.com','sapo.pt','mail.com','example.com','example.org','example.net']);
const planItems={intermedio:['3 publicações por semana','Até 6 stories por semana','Planeamento e gestão de destaques','Design + copy','Agendamento e publicação','Análise mensal com sugestões'],premium:['4 a 5 publicações por semana','Stories de segunda a sexta — até 15/semana','Edição simples de reels','Criação de campanhas e promoções','Gestão de mensagens/comentários (a definir)','Análises quinzenais']};

function proposal(l){return `Assunto: ${l.company} — reparei numa coisa

Olá,

Sou o Nuno, da DUIT.

Estive a conhecer melhor a ${l.company} e reparei que ${l.observation}.

Acho que há aqui uma oportunidade simples de melhorar este ponto.

Se fizer sentido para si, basta responder a este email e digo-lhe qual seria a primeira alteração que eu faria.

Nuno
DUIT`}

function valid(l){
 const e=l.email.trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))return false;
 const [local,domain]=e.split('@');
 if(blocked.has(domain)||/^(no-?reply|noreply)/i.test(local))return false;
 try{const host=new URL(l.website).hostname.replace(/^www\./,'').toLowerCase();if(!(domain===host||domain.endsWith('.'+host)||host.endsWith('.'+domain)))return false}catch(_){return false}
 return /^https?:\/\//i.test(l.source);
}

function seed(){
 const hash=bcrypt.hashSync(crypto.randomBytes(24).toString('hex'),10);
 const byCompany=db.prepare(`SELECT id FROM users WHERE role='client' AND is_prospect=1 AND lower(trim(company))=lower(trim(?))`);
 const byEmail=db.prepare(`SELECT id FROM users WHERE lower(trim(email))=lower(trim(?))`);
 const addUser=db.prepare(`INSERT INTO users (name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES (?,?,?,?,?,?,1,0)`);
 const addCrm=db.prepare(`INSERT OR IGNORE INTO prospect_crm (user_id,sector,location,website,opportunity,idea,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?, 'por_contactar',?,?,?,datetime('now'))`);
 let added=0,duplicates=0,rejected=0,deleted=0;
 for(const l of leads){
  if(!valid(l)){rejected++;continue}
  const email=l.email.trim().toLowerCase();
  if(wasDeleted(email)){deleted++;continue}
  if(byCompany.get(l.company)||byEmail.get(email)){duplicates++;continue}
  const id=Number(addUser.run(l.company,email,hash,'client',l.company,l.phone||'').lastInsertRowid);
  const opportunity=`Oportunidade observada: ${l.observation}`;
  const notes=`Email profissional público confirmado. Fonte exata: ${l.source} | Observação personalizada: ${l.observation} | Abordagem única: não fazer follow-up.`;
  addCrm.run(id,l.sector,l.location,l.website,opportunity,l.idea,l.plan,planItems[l.plan].join('; '),l.monthly,l.offer,l.priority,notes,proposal(l));
  added++;
 }
 console.log(`[crm] prospeção 2026-09-30-d: ${added} adicionados, ${duplicates} duplicados, ${deleted} apagados bloqueados, ${rejected} rejeitados`);
}
try{seed()}catch(e){console.warn('[crm] seed 2026-09-30-d:',e.message)}
