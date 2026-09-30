const crypto=require('crypto');
const bcrypt=require('bcryptjs');
const db=require('./db');
const {wasDeleted}=require('./prospect-deleted-guard');

const leads=[
['Lusocargo','Transportes / Logística','Portugal','https://www.lusocargo.pt/','','geral@lusocargo.pt','https://www.lusocargo.pt/pt/contactos/'],
['Renovus','Energia / Eficiência energética','Portugal','https://renovus.pt/','','geral@renovus.pt','https://renovus.pt/contactos/'],
['Solminho','Energia solar / Climatização','Braga','https://solminho.pt/','','geral@solminho.pt','https://solminho.pt/contactos/'],
['Climatização AVAC','Climatização / AVAC','Portugal','https://climatizacaoavac.pt/','','geral@climatizacaoavac.pt','https://climatizacaoavac.pt/contactos/'],
['JOPAUTO','Automóvel / Oficina','Portugal','https://jopauto.pt/','','geral@jopauto.pt','https://jopauto.pt/contactos/'],
['Amorcar','Automóvel / Comércio e assistência','Portugal','https://amorcar.pt/','','geral@amorcar.pt','https://amorcar.pt/contactos/'],
['Impactar','Impressão / Comunicação visual','Portugal','https://impactar.pt/','','geral@impactar.pt','https://impactar.pt/contactos/'],
['Canalcentro','Equipamentos / Canalização','Portugal','https://canalcentro.pt/','','geral@canalcentro.pt','https://canalcentro.pt/contactos/'],
['Odicar','Automóvel / Comércio e assistência','Portugal','https://odicar.pt/','','geral@odicar.pt','https://odicar.pt/contactos/'],
['Moveiras','Mobiliário / Carpintaria','Portugal','https://moveiras.com/','','geral@moveiras.com','https://moveiras.com/contactos/'],
['Lino & Filhos','Indústria / Metalomecânica','Portugal','https://linoefilhos.pt/','','geral@linoefilhos.pt','https://linoefilhos.pt/contactos/'],
['MBGouveia','Construção / Engenharia','Portugal','https://mbgouveia.pt/','','geral@mbgouveia.pt','https://mbgouveia.pt/contactos/'],
['MF Carpintaria Profissional','Carpintaria / Mobiliário','Portugal','https://carpintariaprofissional.pt/','','geral@carpintariaprofissional.pt','https://carpintariaprofissional.pt/contactos/'],
['HighSkills','Formação / Educação','Lisboa','https://highskills.pt/','','geral@highskills.pt','https://highskills.pt/contactos/'],
['Portugal Best Holiday','Turismo / Alojamento / Atividades','Portugal','https://portugalbestholiday.com/','','info@portugalbestholiday.com','https://portugalbestholiday.com/contactos/'],
['Arquitectura 3','Arquitetura','Portugal','https://arquitectura3.pt/','','geral@arquitectura3.pt','https://arquitectura3.pt/contactos/'],
['Strong Charon','Segurança / Serviços B2B','Portugal','https://strongcharon.pt/','','geral@strongcharon.pt','https://strongcharon.pt/contactos/'],
['Ambigroup','Ambiente / Serviços industriais','Portugal','https://ambigroup.com/','','geral@ambigroup.com','https://ambigroup.com/contactos/'],
['HR Group','Limpeza / Facilities','Portugal','https://hrgroup.pt/','','geral@hrgroup.pt','https://hrgroup.pt/contactos/'],
['Electroclima','Climatização / Equipamentos','Portugal','https://electroclima.pt/','','geral@electroclima.pt','https://electroclima.pt/contactos/']
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
function seed(){const hash=bcrypt.hashSync(crypto.randomBytes(24).toString('hex'),10),byCompany=db.prepare(`SELECT id FROM users WHERE role='client' AND is_prospect=1 AND lower(trim(company))=lower(trim(?))`),byEmail=db.prepare(`SELECT id FROM users WHERE lower(trim(email))=lower(trim(?))`),addUser=db.prepare(`INSERT INTO users (name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES (?,?,?,?,?,?,1,0)`),addCrm=db.prepare(`INSERT OR IGNORE INTO prospect_crm (user_id,sector,location,website,opportunity,idea,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?, 'por_contactar',?,?,?,datetime('now'))`);let added=0,duplicates=0,rejected=0,deleted=0;for(const l of leads){if(!valid(l)){rejected++;continue}const email=l.email.trim().toLowerCase();if(wasDeleted(email)){deleted++;continue}if(byCompany.get(l.company)||byEmail.get(email)){duplicates++;continue}const id=Number(addUser.run(l.company,email,hash,'client',l.company,l.phone||'').lastInsertRowid);addCrm.run(id,l.sector,l.location,l.website,l.opportunity,l.idea,l.plan,planItems[l.plan].join('; '),l.monthly,l.offer,l.priority,`Email profissional público confirmado. Fonte exata: ${l.source}`,proposal(l));added++}console.log(`[crm] prospeção 2026-09-30-b: ${added} adicionados, ${duplicates} duplicados, ${deleted} apagados bloqueados, ${rejected} rejeitados`)}
try{seed()}catch(e){console.warn('[crm] seed 2026-09-30-b:',e.message)}
