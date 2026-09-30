const crypto=require('crypto');
const bcrypt=require('bcryptjs');
const db=require('./db');
const {wasDeleted}=require('./prospect-deleted-guard');

const leads=[
['ARV Projetos','Arquitetura / Engenharia / BIM','Setúbal','https://arv.pt/','+351 265 233 078','geral@arv.pt','https://arv.pt/contacts/'],
['DOME','Arquitetura / Engenharias integradas','Guimarães','https://www.dome.pt/','+351 253 547 239','geral@dome.pt','https://www.dome.pt/contactos/'],
['Duality','Arquitetura / Construção / Interiores','Maia','https://www.duality.pt/','+351 961 529 380','geral@duality.pt','https://www.duality.pt/contactos'],
['R&B Espaços Verdes','Jardinagem / Paisagismo','Grande Lisboa','https://rbespacosverdes.pt/','+351 926 607 941','geral@rbespacosverdes.pt','https://rbespacosverdes.pt/contacto'],
['ÚtilJardim','Equipamentos / Jardinagem','Algarve','https://www.utiljardim.pt/','+351 289 098 915','geral@utiljardim.pt','https://www.utiljardim.pt/'],
['BMG Services','Limpeza / Facilities','Pontinha / Vila do Conde','https://bmg-services.pt/','+351 213 885 479','geral@bmg-services.pt','https://bmg-services.pt/pt/contactos'],
['TJ Multimédia','Audiovisual / Eventos','Portugal','https://tj-multimedia.pt/','+351 935 547 622','geral@tj-multimedia.pt','https://tj-multimedia.pt/contactos/'],
['Cleancare','Limpeza / Higienização','Seixal','https://www.cleancare.pt/','+351 917 517 737','geral@cleancare.pt','https://www.cleancare.pt/contactos'],
['ATECMO','Equipamentos industriais / Assistência técnica','Loulé','https://atecmo.pt/','+351 289 422 195','geral@atecmo.pt','https://atecmo.pt/contactos/'],
['Carpintaria 3','Carpintaria / Mobiliário','Pêro Pinheiro','https://www.carpintaria3.pt/','+351 210 998 481','geral@carpintaria3.pt','https://www.carpintaria3.pt/'],
['SPwood','Carpintaria / Mobiliário','Barcelos','https://spwood.pt/','+351 253 953 160','geral@spwood.pt','https://spwood.pt/contactos/'],
['DV Carpintaria','Carpintaria / Mobiliário','Machico','https://www.carpintariadv.pt/','+351 291 652 229','geral@carpintariadv.pt','https://www.carpintariadv.pt/pages/contact'],
['Carpintaria Pendão','Carpintaria / Mobiliário','São Pedro do Sul','https://www.carpintariapendao.pt/','+351 963 271 509','geral@carpintariapendao.pt','https://www.carpintariapendao.pt/contactos'],
['Carpintaria Pentágono','Carpintaria / Mobiliário','Pombal','https://www.cpentagono.pt/','+351 236 219 120','geral@cpentagono.pt','https://www.cpentagono.pt/novo/contactos/'],
['Segursystems','Segurança eletrónica / Domótica','Seixezelo','https://www.segursystems.com/','+351 934 033 549','geral@segursystems.com','https://www.segursystems.com/contactos/'],
['Corbroker','Seguros','Lisboa','https://corbroker.pt/','+351 213 245 140','seguros@corbroker.pt','https://corbroker.pt/contactos/'],
['Dêncio Mediação de Seguros','Seguros','Lisboa','https://www.dencio.pt/','+351 213 190 890','geral@dencio.pt','https://www.dencio.pt/pt/home'],
['BIS Seguros','Seguros','Amadora','https://www.bis.pt/','+351 214 906 310','geral@bis.pt','https://www.bis.pt/'],
['Safenor','Seguros','Vila de Prado','https://safenor.pt/','+351 253 926 589','geral@safenor.pt','https://safenor.pt/'],
['ATAR Serviços','Formação / Consultoria','Leiria','https://www.atarservicos.pt/','+351 244 827 188','geral@atarservicos.pt','https://www.atarservicos.pt/contactos/']
].map(x=>({company:x[0],sector:x[1],location:x[2],website:x[3],phone:x[4],email:x[5],source:x[6]}));

const blocked=new Set(['gmail.com','googlemail.com','hotmail.com','hotmail.pt','outlook.com','outlook.pt','live.com','live.pt','yahoo.com','yahoo.pt','icloud.com','me.com','aol.com','sapo.pt','mail.com','example.com','example.org','example.net']);
const planItems={intermedio:['3 publicações por semana','Até 6 stories por semana','Planeamento e gestão de destaques','Design + copy','Agendamento e publicação','Análise mensal com sugestões'],premium:['4 a 5 publicações por semana','Stories de segunda a sexta — até 15/semana','Edição simples de reels','Criação de campanhas e promoções','Gestão de mensagens/comentários (a definir)','Análises quinzenais']};

function enrich(l){
  const visual=/Arquitetura|Construção|Jardinagem|Audiovisual|Carpintaria|Mobiliário/.test(l.sector);
  l.plan=visual?'premium':'intermedio';
  l.monthly=visual?280:200;
  l.offer=visual?140:100;
  l.priority=visual?'atacar':'possivel';
  l.opportunity='Comunicação digital regular para apresentar serviços, projetos, equipa, diferenciação e prova de trabalho a potenciais clientes.';
  l.idea='Serviços e soluções + projetos/casos reais + bastidores + equipa + dicas do setor + prova social.';
  return l;
}
leads.forEach(enrich);

function proposal(l){return `Assunto: ${l.company} — as redes ficaram para depois?

Olá,

Já publicou com frequência, depois parou… ou vai publicando quando consegue?

Não se desgaste com mais uma tarefa que precisa de acompanhamento diário para dar resultados.

A DUIT ajuda a aliviar essa tarefa e trata das suas redes sociais por si.

Por isso criámos o DUIT Start: uma forma simples de experimentar primeiro e perceber como podemos trabalhar a comunicação da sua empresa.

Veja como podemos tornar isto mais simples para si. 🙂`}

function valid(l){
  const e=l.email.trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))return false;
  const [local,domain]=e.split('@');
  if(blocked.has(domain)||/^(no-?reply|noreply)/i.test(local))return false;
  try{
    const host=new URL(l.website).hostname.replace(/^www\./,'').toLowerCase();
    if(!(domain===host||domain.endsWith('.'+host)||host.endsWith('.'+domain)))return false;
  }catch(_){return false}
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
    addCrm.run(id,l.sector,l.location,l.website,l.opportunity,l.idea,l.plan,planItems[l.plan].join('; '),l.monthly,l.offer,l.priority,`Email profissional público confirmado. Fonte exata: ${l.source}`,proposal(l));
    added++;
  }
  console.log(`[crm] prospeção 2026-09-30: ${added} adicionados, ${duplicates} duplicados, ${deleted} apagados bloqueados, ${rejected} rejeitados`);
}
try{seed()}catch(e){console.warn('[crm] seed 2026-09-30:',e.message)}
