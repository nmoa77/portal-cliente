const crypto=require('crypto');
const bcrypt=require('bcryptjs');
const db=require('./db');
const {wasDeleted}=require('./prospect-deleted-guard');

const leads=[
['Lusocargo','Transportes / Logística','Maia / Loures','https://www.lusocargo.pt/','+351 229 990 900','geral@lusocargo.pt','https://www.lusocargo.pt/contactos'],
['Renovus','Energia renovável / Climatização','Leça do Balio','https://www.renovus.pt/','','geral@renovus.pt','https://www.renovus.pt/index.php?page=contactos'],
['Solminho','Energia renovável','Vila Verde','https://solminho.pt/','+351 253 322 643','geral@solminho.pt','https://solminho.pt/'],
['Climatização AVAC','Climatização / AVAC','Montijo','https://climatizacaoavac.pt/','','geral@climatizacaoavac.pt','https://climatizacaoavac.pt/contactos/'],
['JOPAUTO','Automóvel / Oficina / Peças','São João da Pesqueira / Vila Real','https://jopauto.pt/','254 489 150','geral@jopauto.pt','https://jopauto.pt/contactos/'],
['Amorcar','Automóvel / Oficina','Queluz','https://amorcar.pt/','214 362 680','geral@amorcar.pt','https://amorcar.pt/'],
['Impactar','Climatização / Energias renováveis','Guimarães','https://www.impactar.pt/','+351 933 831 459','geral@impactar.pt','https://www.impactar.pt/'],
['Canalcentro','Equipamentos / Climatização','Leiria','https://www.canalcentro.pt/','+351 244 800 160','geral@canalcentro.pt','https://www.canalcentro.pt/privacidade/'],
['Odicar','Automóvel / Stand / Oficina','Póvoa de Santo Adrião','https://odicar.pai.pt/','219 379 790','geral@odicar.pt','https://odicar.pai.pt/contactos'],
['Moveiras','Mobiliário / Indústria','Paços de Ferreira','https://www.moveiras.com/','+351 255 962 693','geral@moveiras.com','https://www.moveiras.com/contactos_moveiras/'],
['Lino & Filhos','Carpintaria / Mobiliário','Lisboa','https://linoefilhos.pt/','+351 218 480 204','geral@linoefilhos.pt','https://linoefilhos.pt/contactos/'],
['MBGouveia & Filhos','Madeiras / Carpintaria / Comércio especializado','Rabo de Peixe','https://mbgouveia.pt/','296 491 692','geral@mbgouveia.pt','https://mbgouveia.pt/contactos/'],
['MF Carpintaria','Carpintaria / Remodelação','Setúbal','https://carpintariaprofissional.pt/','','geral@carpintariaprofissional.pt','https://carpintariaprofissional.pt/termos-condicoes'],
['HighSkills','Formação / Consultoria','Lisboa','https://highskills.pt/','+351 217 931 365','geral@highskills.pt','https://highskills.pt/contactos/'],
['Strong Charon','Segurança','Amadora','https://strongcharon.pt/','210 420 801','geral@strongcharon.pt','https://amchamportugal.pt/lista-de-socios/'],
['Ambigroup','Ambiente / Gestão de resíduos / Demolições','Pontinha','https://www.ambigroup.com/','+351 219 687 430','geral@ambigroup.com','https://www.ambigroup.com/pt/politica-de-privacidade/'],
['HomeServe Serviços para Energia Portugal','Facilities / Energia / Assistência técnica','Vila Nova de Gaia / Vialonga','https://servitis.pt/','227 863 050','geral@servitis.pt','https://servitis.pt/contactos/'],
['Sonur','Climatização / Aquecimento','Lisboa','https://www.sonur.pt/','+351 217 261 711','geral@sonur.pt','https://www.sonur.pt/'],
['Manuel J. Monteiro & Cª','Equipamentos / Climatização / Hotelaria','Barcarena','https://www.mjm.pt/','214 349 700','gestor@mjm.pt','https://www.mjm.pt/index.php?id=16'],
['SOPSEC','Engenharia / Arquitetura','Vila Nova de Gaia','https://www.sopsec.pt/','','sopsec@sopsec.pt','https://scoring.pt/empresas-certificadas/sopsec']
].map(x=>({company:x[0],sector:x[1],location:x[2],website:x[3],phone:x[4],email:x[5],source:x[6]}));

const blocked=new Set(['gmail.com','googlemail.com','hotmail.com','hotmail.pt','outlook.com','outlook.pt','live.com','live.pt','yahoo.com','yahoo.pt','icloud.com','me.com','aol.com','sapo.pt','mail.com','example.com','example.org','example.net']);
const planItems={intermedio:['3 publicações por semana','Até 6 stories por semana','Planeamento e gestão de destaques','Design + copy','Agendamento e publicação','Análise mensal com sugestões'],premium:['4 a 5 publicações por semana','Stories de segunda a sexta — até 15/semana','Edição simples de reels','Criação de campanhas e promoções','Gestão de mensagens/comentários (a definir)','Análises quinzenais']};
function enrich(l){const visual=/Arquitetura|Construção|Turismo|Automóvel|Mobiliário|Carpintaria|Impressão/.test(l.sector);l.plan=visual?'premium':'intermedio';l.monthly=visual?280:200;l.offer=visual?140:100;l.priority=visual?'atacar':'possivel';l.opportunity='Comunicação digital regular para apresentar serviços, projetos, equipa, diferenciação e prova de trabalho a potenciais clientes.';l.idea='Serviços e soluções + projetos/casos reais + bastidores + equipa + dicas do setor + prova social.';return l}
leads.forEach(enrich);
function proposal(l){return `Assunto: ${l.company} — as redes ficaram para depois?

Olá,

Já publicou com frequência, depois parou… ou vai publicando quando consegue?

Não se desgaste com mais uma tarefa que precisa de acompanhamento diário para dar resultados.

A DUIT ajuda a aliviar essa tarefa e trata das suas redes sociais por si.

Por isso criámos o DUIT Start: uma forma simples de experimentar primeiro e perceber como podemos trabalhar a comunicação da sua empresa.

Veja como podemos tornar isto mais simples para si. 🙂`}
function valid(l){const e=l.email.trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))return false;const [local,domain]=e.split('@');if(blocked.has(domain)||/^(no-?reply|noreply)/i.test(local))return false;try{const host=new URL(l.website).hostname.replace(/^www\./,'').toLowerCase();if(!(domain===host||domain.endsWith('.'+host)||host.endsWith('.'+domain)))return false}catch(_){return false}return /^https?:\/\//i.test(l.source)}
function seed(){const hash=bcrypt.hashSync(crypto.randomBytes(24).toString('hex'),10),byCompany=db.prepare(`SELECT id FROM users WHERE role='client' AND is_prospect=1 AND lower(trim(company))=lower(trim(?))`),byEmail=db.prepare(`SELECT id FROM users WHERE lower(trim(email))=lower(trim(?))`),addUser=db.prepare(`INSERT INTO users (name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES (?,?,?,?,?,?,1,0)`),addCrm=db.prepare(`INSERT OR IGNORE INTO prospect_crm (user_id,sector,location,website,opportunity,idea,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?, 'por_contactar',?,?,?,datetime('now'))`);let added=0,duplicates=0,rejected=0,deleted=0;for(const l of leads){if(!valid(l)){rejected++;continue}const email=l.email.trim().toLowerCase();if(wasDeleted(email)){deleted++;continue}if(byCompany.get(l.company)||byEmail.get(email)){duplicates++;continue}const id=Number(addUser.run(l.company,email,hash,'client',l.company,l.phone||'').lastInsertRowid);addCrm.run(id,l.sector,l.location,l.website,l.opportunity,l.idea,l.plan,planItems[l.plan].join('; '),l.monthly,l.offer,l.priority,`Email profissional público confirmado. Fonte exata: ${l.source}`,proposal(l));added++}console.log(`[crm] prospeção 2026-09-30-c: ${added} adicionados, ${duplicates} duplicados, ${deleted} apagados bloqueados, ${rejected} rejeitados`)}
try{seed()}catch(e){console.warn('[crm] seed 2026-09-30-c:',e.message)}
