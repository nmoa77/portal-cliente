const crypto=require('crypto'),bcrypt=require('bcryptjs'),db=require('./db');
const {wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Carpintaria Pendão",
    "sector": "Carpintaria e mobiliário por medida",
    "location": "São Pedro do Sul, Viseu",
    "website": "https://www.carpintariapendao.pt/",
    "email": "geral@carpintariapendao.pt",
    "phone": "963 271 509",
    "source": "https://www.carpintariapendao.pt/contactos",
    "observation": "O site oficial apresenta fabrico e instalação de mobiliário personalizado e disponibiliza email profissional na página de contactos.",
    "opportunity": "Apresentar projetos de mobiliário por medida em materiais comerciais e conteúdos visuais.",
    "service": "ambas"
  },
  {
    "company": "Movilco – Carpintaria e Marcenaria, Lda.",
    "sector": "Carpintaria e marcenaria",
    "location": "Penalva do Castelo, Viseu",
    "website": "https://movilco.pt/",
    "email": "geral@movilco.pt",
    "phone": "232 646 260",
    "source": "https://movilco.pt/termos-e-condicoes/",
    "observation": "A página institucional identifica a sociedade, sede, website e email profissional; refere portfólio e pedidos de orçamento.",
    "opportunity": "Desenvolver peças de apresentação de serviços e projetos para apoio à captação de orçamentos.",
    "service": "design"
  },
  {
    "company": "Nomogno",
    "sector": "Carpintaria",
    "location": "Viseu, Viseu",
    "website": "https://nomogno.pt/",
    "email": "geral@nomogno.pt",
    "phone": "232 412 225",
    "source": "https://nomogno.pt/contactos/",
    "observation": "A página oficial de contactos identifica email e telefone; a empresa apresenta atividade de carpintaria.",
    "opportunity": "Organizar um portfólio visual de trabalhos e peças comerciais para apresentar soluções.",
    "service": "design"
  },
  {
    "company": "Movimola",
    "sector": "Assistência mecânica e oficina móvel",
    "location": "Évora, Évora",
    "website": "https://www.movimola.pt/",
    "email": "geral@movimola.pt",
    "phone": "266 744 028",
    "source": "https://www.movimola.pt/contactos",
    "observation": "A página oficial identifica oficina móvel, morada em Évora e email profissional do domínio.",
    "opportunity": "Criar comunicação gráfica clara sobre serviços e modalidades de assistência mecânica.",
    "service": "design"
  }
];
try {
for(const [col,type] of [['email_observation','TEXT'],['instagram','TEXT'],['outreach_channel','TEXT'],['dm_message','TEXT'],['dm_status','TEXT']]) {try{db.prepare(`ALTER TABLE prospect_crm ADD COLUMN ${col} ${type}`).run()}catch(e){if(!/duplicate column/i.test(e.message))throw e}}
const existsCompany=db.prepare('SELECT id FROM users WHERE is_prospect=1 AND lower(trim(company))=lower(trim(?))');
const existsEmail=db.prepare('SELECT id FROM users WHERE lower(trim(email))=lower(trim(?))');
const existsSite=db.prepare("SELECT user_id FROM prospect_crm WHERE lower(trim(coalesce(website,'')))=lower(trim(?))");
const addUser=db.prepare('INSERT INTO users(name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES(?,?,?,?,?,?,1,0)');
const addCrm=db.prepare("INSERT INTO prospect_crm(user_id,sector,location,website,opportunity,idea,email_observation,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,outreach_channel,updated_at) VALUES(?,?,?,?,?,?,?,'intermedio',?,200,100,'por_contactar','normal',?,?,'email',datetime('now'))");
const pass=bcrypt.hashSync(crypto.randomBytes(24).toString('hex'),10);let added=0,skipped=0;const seen=new Set();
db.transaction(()=>{for(const x of L){const email=x.email.toLowerCase().trim();const domain=email.split('@')[1];const host=new URL(x.website).hostname.toLowerCase().replace(/^www\\./,'');const key=x.company.toLowerCase().trim();if(!domain||domain!==host||wasDeleted(email)||seen.has(email)||seen.has(key)||existsCompany.get(x.company)||existsEmail.get(email)||existsSite.get(x.website)){skipped++;continue}seen.add(email);seen.add(key);const id=Number(addUser.run(x.company,email,pass,'client',x.company,x.phone).lastInsertRowid);const proposal=`Olá, sou o Nuno, da DUIT. Estive a conhecer a ${x.company} e posso ajudar com ${x.service==='design'?'design gráfico e materiais de apresentação':x.service==='redes'?'gestão de redes sociais':'design gráfico e comunicação nas redes sociais'}. Se lhe fizer sentido, terei gosto em conversar consigo. Cumprimentos, Nuno.`;addCrm.run(id,x.sector,x.location,x.website,x.opportunity,x.service,x.source+' — email profissional identificado em fonte oficial.',x.opportunity,x.observation+' Serviço sugerido: '+x.service+'. Fonte: '+x.source,proposal);added++}})();console.log('[crm] prospects 2026-10-15:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-10-15:',e.message)}
