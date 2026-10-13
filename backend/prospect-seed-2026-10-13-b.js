const crypto=require('crypto'),bcrypt=require('bcryptjs'),db=require('./db');
const {wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Grupo Mendes",
    "sector": "Remodelação de interiores e marcenaria",
    "location": "Carnaxide, Oeiras",
    "website": "https://www.grupomendes.pt/",
    "instagram": "https://www.instagram.com/grupomendesofc/",
    "email": "geral@grupomendes.pt",
    "phone": "+351 965 249 250",
    "source": "https://www.grupomendes.pt/",
    "observation": "O website oficial identifica @grupomendesofc e apresenta uma galeria de projetos de remodelação e marcenaria. Não foi verificada a frequência de publicações.",
    "opportunity": "Organizar a apresentação regular de projetos, detalhes e bastidores, libertando tempo para o acompanhamento das obras."
  },
  {
    "company": "Loja da Capital",
    "sector": "Mobiliário por medida",
    "location": "Boliqueime, Loulé",
    "website": "https://lojadacapital.com/",
    "instagram": "https://www.instagram.com/lojadacapital/",
    "email": "geral@lojadacapital.com",
    "phone": "+351 912 255 066",
    "source": "https://lojadacapital.com/empresa",
    "observation": "A página oficial apresenta mobiliário por medida, portfólio e o Instagram @lojadacapital. A frequência de publicação não foi verificada.",
    "opportunity": "Criar conteúdos regulares sobre peças e projetos de mobiliário, mantendo a comunicação ativa sem retirar tempo ao fabrico e atendimento."
  },
  {
    "company": "VP Móveis",
    "sector": "Mobiliário por medida",
    "location": "Portugal",
    "website": "https://www.vpmoveis.pt/",
    "instagram": "https://www.instagram.com/vpmoveis.pt/",
    "email": "geral@vpmoveis.pt",
    "phone": "+351 925 966 794",
    "source": "https://www.vpmoveis.pt/",
    "observation": "O website oficial apresenta projetos de móveis à medida, identifica @vpmoveis.pt e publica contacto de orçamento. Não foi verificada a cadência do Instagram.",
    "opportunity": "Transformar fotografias de projetos e soluções de arrumação numa comunicação planeada, poupando tempo de gestão de redes."
  },
  {
    "company": "GPC Atelier",
    "sector": "Construção e remodelação",
    "location": "Estoril, Cascais",
    "website": "https://www.gpc.com.pt/",
    "instagram": "https://www.instagram.com/gpcatelier/",
    "email": "site@gpc.com.pt",
    "phone": "+351 931 455 247",
    "source": "https://www.gpc.com.pt/",
    "observation": "O website oficial apresenta serviços de remodelação e portfólio de obras em Cascais, Estoril e Lisboa e liga para Instagram gpcatelier. A frequência de publicação não foi verificada.",
    "opportunity": "Preparar conteúdos consistentes de portfólio, fases de obra e acabamentos, sem sobrecarregar a gestão dos projetos."
  },
  {
    "company": "Construsud",
    "sector": "Construção e remodelação",
    "location": "Lisboa",
    "website": "https://construsud.com/",
    "instagram": "https://www.instagram.com/construsud_/",
    "email": "geral@construsud.com",
    "phone": "+351 939 553 803",
    "source": "https://construsud.com/",
    "observation": "O website oficial mostra obras de remodelação, projetos comerciais e ligação ao Instagram construsud_. Não foi verificada a frequência de publicações.",
    "opportunity": "Planear uma sequência de conteúdos com projetos executados e etapas das obras, reduzindo o tempo gasto a preparar publicações."
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
console.log(`[crm] prospeção social 2026-10-13-b: ${added} adicionados, ${duplicates} duplicados, ${rejected} rejeitados`);
}catch(e){console.warn('[crm] seed 2026-10-13-b:',e.message)}
