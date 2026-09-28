const crypto=require('crypto');
const bcrypt=require('bcryptjs');
const db=require('./db');
const {wasDeleted}=require('./prospect-deleted-guard');

const leads=[
['Metalome','Metalomecânica / Indústria','Chaves','https://metalome.com/','','geral@metalome.com','https://metalome.com/contactos/'],
['Corticlasse','Materiais / Carpintaria','Loures','https://corticlasse.pt/','219 820 762','geral@corticlasse.pt','https://corticlasse.pt/index.php/contactos/'],
['Visualsynk','Audiovisual / Eventos','Loures','https://visualsynk.pt/','+351 211 625 983','geral@visualsynk.pt','https://visualsynk.pt/contactos/'],
['EMAV','Audiovisual / Produção','Loures','https://emav.pt/','+351 219 689 100','geral@emav.pt','https://emav.pt/contactos/'],
['Metalomil','Metalomecânica / Serralharia','Trofa','https://metalomil.com/','+351 252 412 484','geral@metalomil.com','https://metalomil.com/contactos/'],
['PortalClima','Climatização / AVAC','Lisboa','https://portalclima.pt/','217 961 097','geral@portalclima.pt','https://portalclima.pt/contactos/'],
['Formação Desportiva','Formação / Desporto','Loures','https://formacaodesportiva.pt/','+351 926 888 764','geral@formacaodesportiva.pt','https://formacaodesportiva.pt/contactos/'],
['GENERG','Energia Renovável','Lisboa','https://www.generg.pt/','+351 217 802 020','geral@generg.pt','https://www.generg.pt/pt/contactos/'],
['ENG&COOP','Engenharia / Construção','Vila Nova de Gaia / Sintra','https://engecoop.pt/','+351 220 927 736','geral@engecoop.pt','https://engecoop.pt/contacto/'],
['CISFRA','Metalomecânica / Indústria','Oliveira de Frades','https://www.cisfra.com/','+351 232 752 113','geral@cisfra.com','https://www.cisfra.com/pt_pt/contacts'],
['Energia Activa','Instalações Técnicas / Energia','Loures','https://www.energiaactiva.pt/','214 041 731','geral@energiaactiva.pt','https://www.energiaactiva.pt/'],
['Metafer','Metalomecânica Industrial','Felgueiras','https://metafer.eu/','+351 923 577 027','geral@metafer.pt','https://metafer.eu/contacto'],
['Miguel Monteiro Sistemas de Segurança','Segurança Eletrónica','Loures','https://mmsistemasdeseguranca.pt/','+351 920 280 049','geral@mmsistemasdeseguranca.pt','https://mmsistemasdeseguranca.pt/contactos'],
['Diagonal Seguros','Seguros','Loures / Porto / Caldas da Rainha','https://www.diagonalseguros.pt/','219 826 660','geral@diagonalseguros.pt','https://www.diagonalseguros.pt/contactos/'],
['Gesto Artes Gráficas','Artes Gráficas / Impressão','Câmara de Lobos','https://www.gesto.pt/','291 946 750','geral@gesto.pt','https://www.gesto.pt/contactos'],
['FTC Piscinas','Piscinas / Manutenção','Setúbal','https://ftcpiscinas.pt/','962 652 430','geral@ftcpiscinas.pt','https://ftcpiscinas.pt/contacto/'],
['Litoprint','Artes Gráficas / Impressão','Águeda','https://litoprint.pt/','234 600 330','geral@litoprint.pt','https://litoprint.pt/contactos/'],
['ACMA Piscinas','Piscinas / Impermeabilização','Albergaria-a-Velha','https://acma.com.pt/','234 524 744','geral@acma.com.pt','https://acma.com.pt/contacto/'],
['Aquapiscinas','Piscinas / Construção','Viana do Castelo','https://www.aquapiscinas.pt/','253 780 916','geral@aquapiscinas.pt','https://www.aquapiscinas.pt/contactos'],
['Piscinas do Távora','Piscinas / Construção','Penedono','https://piscinasdotavora.pt/','+351 933 482 989','geral@piscinasdotavora.pt','https://piscinasdotavora.pt/contactos/'],
['Piscinas Prestígio','Piscinas / Equipamentos','Braga','https://www.piscinasprestigio.pt/','+351 253 611 419','geral@piscinasprestigio.pt','https://www.piscinasprestigio.pt/contactos.php'],
['Etigráfe','Artes Gráficas / Impressão','Loures','https://www.etigrafe.pt/','219 817 520','geral@etigrafe.pt','https://www.etigrafe.pt/pt/content/54-contactos'],
['AFC Piscinas','Piscinas / Equipamentos','Arcozelo','https://afcpiscinas.pt/','+351 967 335 707','geral@afcpiscinas.pt','https://afcpiscinas.pt/contactos/'],
['Gotazul','Piscinas / Manutenção','Sintra','https://www.gotazul.pt/','210 476 073','geral@gotazul.pt','https://www.gotazul.pt/'],
['WaterComfort','Piscinas / Climatização / Fotovoltaico','Freixianda','https://www.watercomfort.pt/','249 196 045','geral@watercomfort.pt','https://www.watercomfort.pt/info/contactos.php'],
['Anassisgraf','Artes Gráficas / Equipamentos','Porto','https://www.anassisgraf.pt/','+351 228 328 715','geral@anassisgraf.pt','https://www.anassisgraf.pt/contactos/'],
['Hexacar','Automóvel / Rent-a-Car','Loures / Odivelas','https://hexacar.pt/','211 368 574','geral@hexacar.pt','https://hexacar.pt/rent-a-car'],
['Huric','Mobiliário / Design','Mafra','https://huric.pt/','+351 261 816 200','geral@huric.pt','https://huric.pt/contactos/'],
['Costa Graça Architects','Arquitetura','Caldas da Rainha','https://architects.pt/','964 919 733','geral@architects.pt','https://architects.pt/contactos/'],
['GERA Eventos','Eventos / Produção','Portugal','https://geraeventos.pt/','+351 963 141 715','geral@geraeventos.pt','https://geraeventos.pt/'],
['Girosoft','Software / Tecnologia','Massamá','https://girosoft.pt/','','geral@girosoft.pt','https://girosoft.pt/'],
['Transnautica','Transportes / Logística','Porto / Lisboa / Coimbra','https://www.transnautica.pt/','+351 229 991 200','geral@transnautica.pt','https://www.transnautica.pt/contactos/'],
['ALPI Portugal','Transportes / Logística','Vila do Conde / Mealhada / Cacém','https://alpiportugal.pt/','+351 252 650 200','geral@alpiportugal.com','https://alpiportugal.pt/contactos'],
['Solargus','Energia Solar / Climatização','Arganil','https://solargus.pt/','+351 235 712 180','geral@solargus.pt','https://solargus.pt/contactos/'],
['Mollier','Climatização / Engenharia','Lisboa / Vila Nova de Gaia','https://mollier.pt/','+351 215 810 473','geral@mollier.pt','https://mollier.pt/contactos/'],
['Timelink','Software / Construção','Cascais','https://www.timelink.pt/','+351 214 866 440','geral@timelink.pt','https://www.timelink.pt/contactos'],
['GV+Arquitectos','Arquitetura','Lisboa','https://www.gv-arquitectos.com/','+351 965 019 485','geral@gv-arquitectos.com','https://www.gv-arquitectos.com/'],
['Arqama','Arquitetura / Interiores','Massamá','https://www.arqama.pt/','+351 214 371 650','geral@arqama.pt','https://www.arqama.pt/contactos'],
['Limpex Ambiente','Limpeza / Facilities','Lisboa','https://www.limpex-ambiente.com/','+351 213 933 500','geral@limpex-ambiente.com','https://www.limpex-ambiente.com/contactos.php'],
['Serralharia do Outeiro','Serralharia / Autopeças','Açores','https://serralhariaouteiro.pt/','+351 296 307 200','geral@serralhariaouteiro.pt','https://serralhariaouteiro.pt/contactos/'],
['Lafec','Equipamentos Industriais','Paredes','https://www.lafec.pt/','+351 224 337 310','geral@lafec.pt','https://www.lafec.pt/contacto/'],
['Cafilesa','Artes Gráficas / Impressão','Venda do Pinheiro','https://www.cafilesa.pt/','219 663 500','geral@cafilesa.pt','https://apigraf.pt/diretorio/'],
['Cromotema','Artes Gráficas / Impressão','Porto','https://www.cromotema.pt/','227 153 090','geral@cromotema.pt','https://apigraf.pt/diretorio/'],
['Dapigraf','Artes Gráficas / Impressão','Aveiro','https://www.dapigraf.com/','256 852 075','geral@dapigraf.com','https://apigraf.pt/diretorio/'],
['DBV Artes Gráficas','Artes Gráficas / Impressão','Setúbal','https://www.dbv-artesgraficas.com/','212 361 075','geral@dbv-artesgraficas.com','https://apigraf.pt/diretorio/'],
['Decoração de Interiores - Maria João Torres','Design de Interiores','Lisboa','https://decoracao-interiores.pt/','+351 965 400 665','geral@decoracao-interiores.pt','https://decoracao-interiores.pt/contactos/'],
['Codipostal','Comércio B2B / Artigos de Festa','Loures','https://codipostal.com/','+351 219 385 432','geral@codipostal.com','https://codipostal.com/'],
['Acontece Design Solutions','Design de Interiores / Remodelação','Pontinha','https://www.acontece-design-solutions.pt/','937 378 468','geral@acontece-design-solutions.pt','https://www.acontece-design-solutions.pt/contactos'],
['HomeArt','Design de Interiores / Decoração','Barcelos','https://www.homeart.pt/','+351 253 894 254','geral@homeart.pt','https://www.homeart.pt/contatos/'],
['Companhia da Decoração','Decoração / Comércio Especializado','Mafra','https://companhiadadecoracao.pt/','+351 927 131 544','geral@companhiadadecoracao.pt','https://companhiadadecoracao.pt/contactos/']
].map(x=>({company:x[0],sector:x[1],location:x[2],website:x[3],phone:x[4],email:x[5],source:x[6]}));

const blocked=new Set(['gmail.com','googlemail.com','hotmail.com','hotmail.pt','outlook.com','outlook.pt','live.com','live.pt','yahoo.com','yahoo.pt','icloud.com','me.com','aol.com','sapo.pt','mail.com','example.com','example.org','example.net']);
const planItems={intermedio:['3 publicações por semana','Até 6 stories por semana','Planeamento e gestão de destaques','Design + copy','Agendamento e publicação','Análise mensal com sugestões'],premium:['4 a 5 publicações por semana','Stories de segunda a sexta — até 15/semana','Edição simples de reels','Criação de campanhas e promoções','Gestão de mensagens/comentários (a definir)','Análises quinzenais']};
function enrich(l){const visual=/Arquitetura|Construção|Fitness|Jardinagem|Hotelaria|Carpintaria|Piscinas|Audiovisual|Turismo|Automóvel|Design|Decoração|Eventos/.test(l.sector);l.plan=visual?'premium':'intermedio';l.monthly=visual?280:200;l.offer=visual?140:100;l.priority=visual?'atacar':'possivel';l.opportunity='Presença digital com potencial para comunicar serviços, projetos, equipa, casos reais e conhecimento do setor de forma consistente.';l.idea='Serviços + projetos/casos + bastidores + equipa + dicas + prova social';return l}leads.forEach(enrich);
function proposal(l){return `Assunto: ${l.company} — as redes ficaram para depois?\n\nOlá,\n\nJá publicou com frequência, depois parou… ou vai publicando quando consegue?\n\nNão se desgaste com mais uma tarefa que precisa de acompanhamento diário para dar resultados.\n\nA DUIT ajuda a aliviar essa tarefa e trata das suas redes sociais por si.\n\nPor isso criámos o DUIT Start: uma forma simples de experimentar primeiro e perceber como podemos trabalhar a comunicação da sua empresa.\n\nVeja como podemos tornar isto mais simples para si. 🙂`}
function valid(l){const e=l.email.trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))return false;const [local,domain]=e.split('@');if(blocked.has(domain)||/^(no-?reply|noreply)/i.test(local))return false;try{const host=new URL(l.website).hostname.replace(/^www\./,'').toLowerCase();if(!(domain===host||domain.endsWith('.'+host)||host.endsWith('.'+domain)))return false}catch(_){return false}return /^https?:\/\//i.test(l.source)}
function seed(){const hash=bcrypt.hashSync(crypto.randomBytes(24).toString('hex'),10),byCompany=db.prepare(`SELECT id FROM users WHERE role='client' AND is_prospect=1 AND lower(trim(company))=lower(trim(?))`),byEmail=db.prepare(`SELECT id FROM users WHERE lower(trim(email))=lower(trim(?))`),addUser=db.prepare(`INSERT INTO users (name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES (?,?,?,?,?,?,1,0)`),addCrm=db.prepare(`INSERT OR IGNORE INTO prospect_crm (user_id,sector,location,website,opportunity,idea,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?, 'por_contactar',?,?,?,datetime('now'))`);let added=0,duplicates=0,rejected=0,deleted=0;for(const l of leads){if(!valid(l)){rejected++;continue}const email=l.email.trim().toLowerCase();if(wasDeleted(email)){deleted++;continue}if(byCompany.get(l.company)||byEmail.get(email)){duplicates++;continue}const id=Number(addUser.run(l.company,email,hash,'client',l.company,l.phone||'').lastInsertRowid);addCrm.run(id,l.sector,l.location,l.website,l.opportunity,l.idea,l.plan,planItems[l.plan].join('; '),l.monthly,l.offer,l.priority,`Email profissional público confirmado. Fonte exata: ${l.source}`,proposal(l));added++}console.log(`[crm] prospeção 2026-09-28: ${added} adicionados, ${duplicates} duplicados, ${deleted} apagados bloqueados, ${rejected} rejeitados`)}
try{seed()}catch(e){console.warn('[crm] seed 2026-09-28:',e.message)}
