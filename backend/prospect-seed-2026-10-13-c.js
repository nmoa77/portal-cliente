const crypto=require('crypto'),bcrypt=require('bcryptjs'),db=require('./db');
const {wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Piclima",
    "sector": "Climatização",
    "location": "Miranda do Corvo",
    "website": "https://www.piclima.com/",
    "instagram": "https://www.instagram.com/piclima.lda/",
    "email": "geral@piclima.com",
    "phone": "",
    "source": "https://www.piclima.com/Content/docs/Piclima-C%C3%B3digo%20conduta%20V1.pdf",
    "observation": "Site e documento institucional oficial identificam serviços, email e Instagram. Frequência de publicações não confirmada.",
    "opportunity": "Publicar projetos de climatização regularmente sem ocupar a equipa técnica."
  },
  {
    "company": "Móveis Rosa e Alegria (MRA)",
    "sector": "Mobiliário por medida",
    "location": "Sintra",
    "website": "https://moveismra.pt/",
    "instagram": "https://www.instagram.com/moveis.mra/",
    "email": "geral@moveismra.pt",
    "phone": "",
    "source": "https://moveismra.pt/",
    "observation": "Site oficial identifica serviços de mobiliário por medida, email e Instagram. Frequência de publicações não confirmada.",
    "opportunity": "Organizar publicações sobre projetos, sem retirar tempo à produção e atendimento."
  }
];
const dm=x=>`Olá 👋 Sou o Nuno, da DUIT.\n\nEstive a ver a ${x.company}. Manter as redes ativas e publicar com regularidade consome tempo.\n\nEu posso tratar disso por si — conteúdos, design e publicação.\n\nSe lhe fizer sentido, estou aqui. 🙂`;
try{
for(const [col,type] of [['email_observation','TEXT'],['instagram','TEXT'],['outreach_channel','TEXT'],['dm_message','TEXT'],['dm_status','TEXT'],['instagram_checked_at','TEXT'],['instagram_source','TEXT']]){try{db.prepare(`ALTER TABLE prospect_crm ADD COLUMN ${col} ${type}`).run()}catch(e){if(!/duplicate column/i.test(e.message))throw e}}
const byCompany=db.prepare("SELECT id FROM users WHERE is_prospect=1 AND lower(trim(company))=lower(trim(?))");
const byEmail=db.prepare("SELECT id FROM users WHERE lower(trim(email))=lower(trim(?))");
const byIg=db.prepare("SELECT user_id FROM prospect_crm WHERE lower(trim(coalesce(instagram,'')))=lower(trim(?))");
const addUser=db.prepare("INSERT INTO users(name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES(?,?,?,?,?,?,1,0)");
const addCrm=db.prepare("INSERT INTO prospect_crm(user_id,sector,location,website,instagram,opportunity,idea,email_observation,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,outreach_channel,dm_message,dm_status,instagram_checked_at,instagram_source,updated_at) VALUES(?,?,?,?,?,?,?,?,'intermedio','Planeamento, design, copy e publicação de conteúdos',200,100,'por_contactar','atacar',?,?,'instagram',?,'por_enviar',datetime('now'),'official_website',datetime('now'))");
const h=bcrypt.hashSync(crypto.randomBytes(24).toString('hex'),10);
let added=0,duplicates=0,rejected=0;
db.transaction(()=>{for(const x of L){
const email=x.email.trim().toLowerCase(),domain=email.split('@')[1],host=new URL(x.website).hostname.toLowerCase().replace(/^www\./,'');
if(!domain||domain!==host||wasDeleted(email)){rejected++;continue}
if(byCompany.get(x.company)||byEmail.get(email)||byIg.get(x.instagram)){duplicates++;continue}
const id=Number(addUser.run(x.company,email,h,'client',x.company,x.phone).lastInsertRowid);
addCrm.run(id,x.sector,x.location,x.website,x.instagram,x.opportunity,'Presença consistente nas redes sociais sem ocupar tempo de produção.',x.observation,`Email e Instagram públicos identificados no website oficial: ${x.source}. Contacto prioritário por DM manual. Não afirmar que o Instagram está inativo.`,`Olá, sou o Nuno, da DUIT. Posso ajudar a manter as redes sociais da ${x.company} ativas com conteúdos, design e publicação. Se fizer sentido, estou disponível.`,dm(x));added++;
}})();
console.log(`[crm] prospeção social 2026-10-13-c: ${added} adicionados, ${duplicates} duplicados, ${rejected} rejeitados`);
}catch(e){console.warn('[crm] seed 2026-10-13-c:',e.message)}
