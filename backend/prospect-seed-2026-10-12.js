const crypto=require('crypto'),bcrypt=require('bcryptjs'),db=require('./db');
const {wasDeleted}=require('./prospect-deleted-guard');
const L=[{
 company:'Brazão e Caldas',sector:'Construção / Engenharia / Avaliação imobiliária',location:'Vagos',
 website:'https://www.brazaoecaldas.pt/',instagram:'https://www.instagram.com/brazaoecaldas/',
 email:'geral@brazaoecaldas.pt',phone:'+351 234 427 115',
 source:'https://www.brazaoecaldas.pt/',
 observation:'O website oficial apresenta portefólio de construção, estruturas metálicas, carpintaria, interiores e aerogeradores, e identifica o Instagram @brazaoecaldas. Não foi possível confirmar a frequência de publicação no Instagram.',
 opportunity:'Organizar conteúdos recorrentes a partir de projetos e especialidades distintas, sem retirar tempo à atividade técnica da empresa.'
}];
const dm=x=>`Olá 👋 Sou o Nuno, da DUIT.\n\nEstive a ver a ${x.company}. Manter as redes ativas e publicar com regularidade consome tempo.\n\nEu posso tratar disso por si — conteúdos, design e publicação.\n\nSe lhe fizer sentido, estou aqui. 🙂`;
try{
 for(const [c,t] of [['instagram','TEXT'],['outreach_channel','TEXT'],['dm_status','TEXT'],['dm_message','TEXT'],['email_observation','TEXT'],['instagram_checked_at','TEXT'],['instagram_source','TEXT']]){
 try{db.prepare(`ALTER TABLE prospect_crm ADD COLUMN ${c} ${t}`).run()}catch(e){if(!/duplicate column/i.test(e.message))throw e}
 }
 const blocked=new Set(['gmail.com','hotmail.com','outlook.com','yahoo.com','icloud.com','sapo.pt','live.com']);
 const byCompany=db.prepare("SELECT id FROM users WHERE is_prospect=1 AND lower(trim(company))=lower(trim(?))");
 const byEmail=db.prepare("SELECT id FROM users WHERE lower(trim(email))=lower(trim(?))");
 const byIg=db.prepare("SELECT user_id FROM prospect_crm WHERE lower(trim(coalesce(instagram,'')))=lower(trim(?))");
 const addUser=db.prepare("INSERT INTO users(name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES(?,?,?,?,?,?,1,0)");
 const addCrm=db.prepare("INSERT INTO prospect_crm(user_id,sector,location,website,instagram,opportunity,idea,email_observation,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,outreach_channel,dm_message,dm_status,instagram_checked_at,instagram_source,updated_at) VALUES(?,?,?,?,?,?,?,?,'intermedio','Planeamento, design, copy e publicação de conteúdos para Instagram e Facebook',200,100,'por_contactar','atacar',?,?,'instagram',?,'por_enviar',datetime('now'),'official_website',datetime('now'))");
 const h=bcrypt.hashSync(crypto.randomBytes(24).toString('hex'),10);
 let added=0,duplicates=0,rejected=0;
 db.transaction(()=>{for(const x of L){
 const email=x.email.trim().toLowerCase(),domain=email.split('@')[1],host=new URL(x.website).hostname.replace(/^www\./,'');
 if(!domain||blocked.has(domain)||domain!==host||wasDeleted(email)){rejected++;continue}
 if(byCompany.get(x.company)||byEmail.get(email)||byIg.get(x.instagram)){duplicates++;continue}
 const id=Number(addUser.run(x.company,email,h,'client',x.company,x.phone).lastInsertRowid);
 addCrm.run(id,x.sector,x.location,x.website,x.instagram,x.opportunity,'Manter as redes ativas com conteúdos retirados dos projetos reais.',x.observation,`Email profissional e Instagram identificados no website oficial: ${x.source}. Contacto prioritário por DM; sem follow-up automático.`,`Olá, sou o Nuno, da DUIT. Posso ajudar a ${x.company} a manter conteúdos regulares nas redes sociais, sem ocupar tempo da equipa. Se fizer sentido, estou disponível.`,dm(x));added++;
 }})();
 console.log(`[crm] prospeção 2026-10-12: ${added} adicionados, ${duplicates} duplicados, ${rejected} rejeitados`);
}catch(e){console.warn('[crm] seed 2026-10-12:',e.message)}
