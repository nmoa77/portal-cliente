const crypto=require('crypto');
const bcrypt=require('bcryptjs');
const db=require('./db');
const {wasDeleted}=require('./prospect-deleted-guard');
const leads=[
['SSAF','Arquitetura / Design','Loures','https://www.ssaf.pt/','+351 216 055 196','geral@ssaf.pt','https://www.ssaf.pt/'],
['Construções Ladislau','Construção Civil','Vila Franca de Xira','https://construcoesladislau.pt/','+351 919 767 342','geral@construcoesladislau.pt','https://construcoesladislau.pt/'],
['ATAR Serviços','Formação / Consultoria','Leiria','https://www.atarservicos.pt/','244 827 188','geral@atarservicos.pt','https://www.atarservicos.pt/contactos/'],
['Conta Oculta','Contabilidade / Fiscalidade','Loures','https://www.contaoculta.pt/','+351 219 830 862','geral@contaoculta.pt','https://www.contaoculta.pt/'],
['Mesis Engenharia','Construção / Engenharia','Leiria','https://mesis.pt/','+351 244 854 339','geral@mesis.pt','https://mesis.pt/'],
['TTF','Fitness / Desporto','Lisboa e vários concelhos','https://ttf.pt/','','geral@ttf.pt','https://ttf.pt/contactos/'],
['Desígnios da Natureza','Jardinagem / Espaços Verdes','Torres Vedras','https://www.designiosdanatureza.pt/','965 251 533','geral@designiosdanatureza.pt','https://www.designiosdanatureza.pt/empresa-de-jardinagem/'],
['FCK Engenharia','Construção / Engenharia','Lisboa','https://www.fck.pt/','962 184 852','geral@fck.pt','https://www.fck.pt/'],
['Transdaire','Transportes / Logística','Castro Daire','https://transdaire.pt/','+351 232 382 102','geral@transdaire.pt','https://transdaire.pt/contactos/'],
['ACV Transportes','Transportes / Logística','Portugal','https://transportesacv.pt/','910 392 692','geral@transportesacv.pt','https://transportesacv.pt/pt'],
['Grupo PEJ','Construção / Indústria','Barcelos','https://grupopej.com/','+351 253 833 073','geral@grupopej.com','https://grupopej.com/'],
['Vitrúvio','Engenharia / Construção','Porto','https://vitruvio.pt/','229 279 860','geral@vitruvio.pt','https://vitruvio.pt/'],
['RB Espaços Verdes','Jardinagem / Paisagismo','Lisboa','https://rbespacosverdes.pt/','926 607 941','geral@rbespacosverdes.pt','https://rbespacosverdes.pt/'],
['PSG Real','Segurança Privada','Porto Salvo','https://www.psg-real.pt/','','geral@psg-real.pt','https://www.psg-real.pt/'],
['CARJ','Construção Civil','Arganil / Coimbra','https://www.carj.pt/','','geral@carj.pt','https://www.carj.pt/'],
['Hotel Conde de Águeda','Hotelaria','Águeda','http://www.hotelcondedagueda.com','+351 234 610 390','geral@hotelcondedagueda.com','https://www.visitportugal.com/pt-pt/content/hotel-conde-de-%C3%A1gueda'],
['Open Space','Formação / Consultoria','Viana do Castelo','https://open-space.pt/','+351 258 835 500','geral@open-space.pt','https://open-space.pt/'],
['Carpintaria 3','Carpintaria / Mobiliário','Pero Pinheiro','https://www.carpintaria3.pt/','210 998 481','geral@carpintaria3.pt','https://www.carpintaria3.pt/'],
['Fesel','Equipamentos Industriais','Rio de Mouro','https://www.fesel.pt/','214 548 440','geral@fesel.pt','https://www.fesel.pt/contactos'],
['EquipWare','Equipamentos / Assistência Técnica','Leiria','https://www.equipware.pt/','244 025 441','geral@equipware.pt','https://www.equipware.pt/contactos'],
['Norcranes','Equipamentos de Elevação','Trofa','https://www.norcranes.pt/','+351 229 823 420','geral@norcranes.pt','https://www.norcranes.pt/contactos/'],
['HSS Carpintaria','Carpintaria / Mobiliário','Pombal','https://www.hsscarpintaria.pt/','+351 236 214 394','geral@hsscarpintaria.pt','https://www.hsscarpintaria.pt/contactos/'],
['Metalomecânica MJS','Metalomecânica','Santa Maria de Lamas','https://metalomecanica-mjs.com/','+351 227 445 071','geral@metalomecanica-mjs.com','https://metalomecanica-mjs.com/contatos/'],
['MG Equipamentos','Equipamentos Auto','Carcavelos','https://www.mgequipamentos.com/','+351 214 528 899','geral@mgequipamentos.com','https://www.mgequipamentos.com/contactos/'],
['Perfomec','Metalomecânica / Hidráulica','Sintra','https://www.perfomec.pt/','+351 219 619 670','geral@perfomec.pt','https://www.perfomec.pt/contactos'],
['Carpintaria Pentágono','Carpintaria / Mobiliário','Pombal','https://www.cpentagono.pt/','+351 236 219 120','geral@cpentagono.pt','https://www.cpentagono.pt/novo/contactos/'],
['LC Piscinas','Piscinas / Manutenção','Lisboa','https://lcpiscinas.pt/','966 708 147','geral@lcpiscinas.pt','https://lcpiscinas.pt/contactos/'],
['Viamecan','Metalomecânica / Manutenção Industrial','Ponte de Lima','https://viamecan.pt/','+351 258 098 748','geral@viamecan.pt','https://viamecan.pt/contactos/'],
['UP Grupo','Audiovisuais / Domótica','Portugal','https://www.upgrupo.pt/','+351 964 427 729','geral@upgrupo.pt','https://www.upgrupo.pt/'],
['FCF Carpintaria','Carpintaria / Mobiliário','Amarante','https://fcfcarpintaria.com/','+351 255 001 055','geral@fcfcarpintaria.com','https://fcfcarpintaria.com/contactos/'],
['Carpintaria Pendão','Carpintaria / Mobiliário','São Pedro do Sul','https://www.carpintariapendao.pt/','+351 963 271 509','geral@carpintariapendao.pt','https://www.carpintariapendao.pt/contactos'],
['Softnova','Software Empresarial / Informática','Aveiro','https://softnova.pt/','234 198 183','geral@softnova.pt','https://softnova.pt/contactos/'],
['IDG','Impressão / Artes Gráficas','Loures','https://www.idg.pt/','','geral@idg.pt','https://www.idg.pt/'],
['Naturthoughts','Turismo de Natureza','Mirandela','http://www.naturthoughts.com','+351 919 310 675','geral@naturthoughts.com','https://www.visitportugal.com/pt-pt/content/naturthoughts-turismo-de-natureza-lda'],
['MAQMAIS','Máquinas / Ferramentas Industriais','Gondomar / Maia','https://maqmais.pt/','224 542 997','geral@maqmais.pt','https://maqmais.pt/contactos/'],
['Miguel Martins','Equipamentos Industriais','Paredes','https://www.miguelmartins.pt/','255 862 172','geral@miguelmartins.pt','https://www.miguelmartins.pt/contactos.html'],
['Máquinas Lider','Máquinas / Equipamentos','Trofa','https://maquinaslider.com/','252 413 525','geral@maquinaslider.com','https://maquinaslider.com/contact-us/'],
['Tractopais','Máquinas Agrícolas','Viseu','https://tractopais.pt/','+351 232 461 269','geral@tractopais.pt','https://tractopais.pt/contactos/'],
['Fonsecar','Automóvel / Rent-a-Car','Vila do Conde','https://www.fonsecar.pt/','252 671 167','geral@fonsecar.pt','https://www.fonsecar.pt/rent-a-car'],
['JCD','Máquinas / Ferramentas','Pombal','https://www.jcd.com.pt/','236 219 230','geral@jcd.com.pt','https://www.jcd.com.pt/contactos/'],
['IPES Natura','Turismo de Natureza','Santo André','https://www.ipes.pt/','938 349 458','geral@ipes.pt','https://www.ipes.pt/'],
['ADJ','Máquinas Agrícolas','Barcelos','https://adj.pt/','+351 253 882 459','geral@adj.pt','https://adj.pt/contactos/'],
['Polimáquina','Equipamentos Industriais','Funchal','https://polimaquina.pt/','+351 291 792 920','geral@polimaquina.pt','https://polimaquina.pt/contactos/'],
['ATECMO','Manutenção / Equipamentos Industriais','Loulé','https://atecmo.pt/','+351 289 422 195','geral@atecmo.pt','https://atecmo.pt/contactos/'],
['Carlis','Equipamentos Industriais','Leiria','https://www.carlis.pt/','244 820 040','geral@carlis.pt','https://www.carlis.pt/contactos.html'],
['ASM','Máquinas / Acessórios Industriais','São João da Talha','https://www.asmlda.com.pt/','219 550 193','geral@asmlda.pt','https://www.asmlda.com.pt/contactos'],
['Pé no Mundo','Turismo / Aventura','Fundão','https://penomundo.pt/','+351 916 589 413','geral@penomundo.pt','https://penomundo.pt/'],
['Lonking Portugal','Equipamentos Industriais','Ponte de Lima','https://www.lonking.pt/','+351 258 772 759','geral@lonking.pt','https://www.lonking.pt/contactos/'],
['Autocrip','Automóvel / Oficina','Paredes','https://autocrip.pt/','255 782 236','geral@autocrip.pt','https://autocrip.pt/'],
['Inovação Motor','Automóvel','Águeda','https://inovacaomotor.pt/','910 956 137','geral@inovacaomotor.pt','https://inovacaomotor.pt/contactos/']
].map(x=>({company:x[0],sector:x[1],location:x[2],website:x[3],phone:x[4],email:x[5],source:x[6]}));
const blocked=new Set(['gmail.com','googlemail.com','hotmail.com','hotmail.pt','outlook.com','outlook.pt','live.com','live.pt','yahoo.com','yahoo.pt','icloud.com','me.com','aol.com','sapo.pt','mail.com','example.com','example.org','example.net']);
const planItems={intermedio:['3 publicações por semana','Até 6 stories por semana','Planeamento e gestão de destaques','Design + copy','Agendamento e publicação','Análise mensal com sugestões'],premium:['4 a 5 publicações por semana','Stories de segunda a sexta — até 15/semana','Edição simples de reels','Criação de campanhas e promoções','Gestão de mensagens/comentários (a definir)','Análises quinzenais']};
function enrich(l){const visual=/Arquitetura|Construção|Fitness|Jardinagem|Hotelaria|Carpintaria|Piscinas|Audiovisuais|Turismo|Automóvel/.test(l.sector);l.plan=visual?'premium':'intermedio';l.monthly=visual?280:200;l.offer=visual?140:100;l.priority=visual?'atacar':'possivel';l.opportunity='Presença digital com potencial para comunicar serviços, projetos, equipa, casos reais e conhecimento do setor de forma consistente.';l.idea='Serviços + projetos/casos + bastidores + equipa + dicas + prova social';return l} leads.forEach(enrich);
function proposal(l){return `Assunto: ${l.company} — as redes ficaram para depois?\n\nOlá,\n\nJá publicou com frequência, depois parou… ou vai publicando quando consegue?\n\nNão se desgaste com mais uma tarefa que precisa de acompanhamento diário para dar resultados.\n\nA DUIT ajuda a aliviar essa tarefa e trata das suas redes sociais por si.\n\nVeja o que preparámos para si e ganhe um ebook. 🙂`}
function valid(l){const e=l.email.trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))return false;const [local,domain]=e.split('@');if(blocked.has(domain)||/^(no-?reply|noreply)/i.test(local))return false;try{const host=new URL(l.website).hostname.replace(/^www\./,'').toLowerCase();if(!(domain===host||domain.endsWith('.'+host)||host.endsWith('.'+domain)))return false}catch(_){return false}return /^https?:\/\//i.test(l.source)}
function seed(){const hash=bcrypt.hashSync(crypto.randomBytes(24).toString('hex'),10),byCompany=db.prepare(`SELECT id FROM users WHERE role='client' AND is_prospect=1 AND lower(trim(company))=lower(trim(?))`),byEmail=db.prepare(`SELECT id FROM users WHERE lower(trim(email))=lower(trim(?))`),addUser=db.prepare(`INSERT INTO users (name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES (?,?,?,?,?,?,1,0)`),addCrm=db.prepare(`INSERT OR IGNORE INTO prospect_crm (user_id,sector,location,website,opportunity,idea,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?, 'por_contactar',?,?,?,datetime('now'))`);let added=0,duplicates=0,rejected=0,deleted=0;for(const l of leads){if(!valid(l)){rejected++;continue}const email=l.email.trim().toLowerCase();if(wasDeleted(email)){deleted++;continue}if(byCompany.get(l.company)||byEmail.get(email)){duplicates++;continue}const id=Number(addUser.run(l.company,email,hash,'client',l.company,l.phone||'').lastInsertRowid);addCrm.run(id,l.sector,l.location,l.website,l.opportunity,l.idea,l.plan,planItems[l.plan].join('; '),l.monthly,l.offer,l.priority,`Email profissional público confirmado. Fonte exata: ${l.source}`,proposal(l));added++}console.log(`[crm] prospeção 2026-09-25: ${added} adicionados, ${duplicates} duplicados, ${deleted} apagados bloqueados, ${rejected} rejeitados`)}
try{seed()}catch(e){console.warn('[crm] seed 2026-09-25:',e.message)}
