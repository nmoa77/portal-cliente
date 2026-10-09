const crypto=require('crypto'),bcrypt=require('bcryptjs'),db=require('./db');
const {wasDeleted}=require('./prospect-deleted-guard');
const L=[
{company:'Serralharia Auto Cabral',sector:'Metalomecânica / Serralharia',location:'Açores',website:'https://autocabral.com/',instagram:'https://www.instagram.com/serralhariaautocabral/',email:'geral@autocabral.com',phone:'+351 296 479 208',source:'https://autocabral.com/',observation:'a empresa identifica o Instagram @serralhariaautocabral e apresenta trabalhos em ferro, inox, alumínio e fabrico de equipamentos, temas que permitem mostrar diferentes fases e aplicações do trabalho',opportunity:'Criar uma rotina de conteúdos sobre fabrico, montagem e aplicações da serralharia, libertando tempo de quem acompanha as encomendas e a produção.'},
{company:'Medida Secreta',sector:'Carpintaria / Mobiliário por medida',location:'Camacha, Madeira',website:'https://medidasecreta.pt/',instagram:'https://www.instagram.com/medidasecreta/',email:'geral@medidasecreta.pt',phone:'+351 912 578 230',source:'https://medidasecreta.pt/contactos/',observation:'a empresa identifica o Instagram @medidasecreta e trabalha carpintaria geral e mobiliário, com oportunidades para explicar materiais, pormenores de fabrico e projetos por medida',opportunity:'Organizar uma sequência regular de projetos, detalhes e processos de carpintaria para as redes, sem exigir tempo adicional à produção.'}
];
const blocked=new Set(['gmail.com','hotmail.com','outlook.com','yahoo.com','icloud.com','sapo.pt','live.com']);
const dm=x=>`Olá 👋 Sou o Nuno, da DUIT.\n\nEstive a conhecer a ${x.company} e o tipo de trabalhos que realiza. Manter as redes ativas enquanto se acompanha o trabalho do dia a dia consome tempo.\n\nEu posso tratar disso por si — conteúdos, design e publicação.\n\nSe lhe fizer sentido, estou aqui. 🙂`;
try{
 const h=bcrypt.hashSync(crypto.randomBytes(24).toString('hex'),10);
 const byCompany=db.prepare("SELECT id FROM users WHERE is_prospect=1 AND lower(trim(company))=lower(trim(?))");
 const byEmail=db.prepare("SELECT id FROM users WHERE lower(trim(email))=lower(trim(?))");
 const byIg=db.prepare("SELECT user_id FROM prospect_crm WHERE lower(trim(coalesce(instagram,'')))=lower(trim(?))");
 const insertUser=db.prepare("INSERT INTO users(name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES(?,?,?,?,?,?,1,0)");
 const insertCrm=db.prepare("INSERT INTO prospect_crm(user_id,sector,location,website,instagram,opportunity,idea,email_observation,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,outreach_channel,dm_message,dm_status,instagram_checked_at,instagram_source,updated_at) VALUES(?,?,?,?,?,?,?,?,'intermedio','Gestão de redes sociais; Design e copy; Planeamento e publicação',200,100,'por_contactar','atacar',?,?,'instagram',?,'por_enviar',datetime('now'),'official_website',datetime('now'))");
 let added=0,duplicates=0,rejected=0;
 const tx=db.transaction(()=>{for(const x of L){
  const email=x.email.toLowerCase(),domain=email.split('@')[1],host=new URL(x.website).hostname.replace(/^www\./,'');
  if(!domain||blocked.has(domain)||domain!==host||wasDeleted(email)){rejected++;continue}
  if(byCompany.get(x.company)||byEmail.get(email)||byIg.get(x.instagram)){duplicates++;continue}
  const id=Number(insertUser.run(x.company,email,h,'client',x.company,x.phone).lastInsertRowid);
  insertCrm.run(id,x.sector,x.location,x.website,x.instagram,x.opportunity,'Ajudar a manter as redes ativas com regularidade sem ocupar tempo da operação.',x.observation,`Email e Instagram identificados em ${x.source}. A cadência e o engagement do perfil não foram verificados; não afirmar irregularidade. DM manual sem follow-up.`,`Olá, sou o Nuno, da DUIT. Posso ajudar a manter a comunicação da ${x.company} regular nas redes, com conteúdos, design e publicação, sem ocupar tempo da atividade diária. Se fizer sentido, estou disponível.`,dm(x));added++;
 }});
 tx();console.log(`[crm] prospeção social 2026-10-09: ${added} adicionados, ${duplicates} duplicados, ${rejected} rejeitados`);
}catch(e){console.warn('[crm] seed 2026-10-09:',e.message)}
