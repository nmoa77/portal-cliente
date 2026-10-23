const crypto=require('crypto');
const bcrypt=require('bcryptjs');
const db=require('./db');
const {wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Serralharia JC",
    "sector": "Serralharia e estruturas metálicas",
    "location": "Esporões, Braga",
    "website": "https://www.serralhariajc.com/",
    "email": "geral@serralhariajc.com",
    "phone": "253 685 671",
    "source": "https://www.serralhariajc.com/contactos",
    "observation": "Empresa de soluções metálicas por medida.",
    "opportunity": "Organizar portfólio comercial de trabalhos metálicos.",
    "service": "design"
  },
  {
    "company": "Serralharia Costa",
    "sector": "Serralharia e construção metálica",
    "location": "Celeirós, Braga",
    "website": "https://serralharia-costa.pt/",
    "email": "geral@serralharia-costa.pt",
    "phone": "253 672 516",
    "source": "https://serralharia-costa.pt/contactos/",
    "observation": "Empresa de produção e instalação de serralharia.",
    "opportunity": "Criar materiais de apresentação de projetos.",
    "service": "design"
  },
  {
    "company": "Serralharia Moderna",
    "sector": "Serralharia civil",
    "location": "Braga, Braga",
    "website": "https://serralhariamoderna.com/",
    "email": "geral@serralhariamoderna.com",
    "phone": "253 993 500",
    "source": "https://serralhariamoderna.com/",
    "observation": "Trabalha ferro, inox, alumínio, PVC e vidro.",
    "opportunity": "Criar catálogo de soluções por material.",
    "service": "design"
  },
  {
    "company": "LusoSteel",
    "sector": "Estruturas metálicas",
    "location": "Vimieiro, Braga",
    "website": "https://www.lusosteel.pt/",
    "email": "geral@lusosteel.pt",
    "phone": "253 670 309",
    "source": "https://www.lusosteel.pt/contactos/",
    "observation": "Produção e montagem de estruturas metálicas e revestimentos.",
    "opportunity": "Preparar apresentação visual de projetos e serviços.",
    "service": "design"
  },
  {
    "company": "Serralharia das Granjas",
    "sector": "Serralharia",
    "location": "Esporões, Braga",
    "website": "https://www.serralhariagranjas.com/",
    "email": "geral@serralhariagranjas.com",
    "phone": "253 684 719",
    "source": "https://www.serralhariagranjas.com/contactos/",
    "observation": "Serviços de serralharia para clientes particulares e industriais.",
    "opportunity": "Criar portfólio comercial por área de atividade.",
    "service": "design"
  },
  {
    "company": "Serralharia O Bota",
    "sector": "Serralharia e metalomecânica",
    "location": "Cabeceiras de Basto, Braga",
    "website": "https://www.serralharia-obota.pt/",
    "email": "comercial@serralhariaobota.pt",
    "phone": "253 665 060",
    "source": "https://www.serralharia-obota.pt/contacto/",
    "observation": "Serralharia sediada no Parque Industrial de Olela.",
    "opportunity": "Criar peças de apresentação de soluções metálicas.",
    "service": "design"
  },
  {
    "company": "Luxmetal",
    "sector": "Serralharia",
    "location": "Nogueira, Braga",
    "website": "https://luxmetal.pt/",
    "email": "geral@luxmetal.pt",
    "phone": "253 097 689",
    "source": "https://luxmetal.pt/contactos/",
    "observation": "Serralharia com escritório e fábrica em Braga.",
    "opportunity": "Desenvolver materiais gráficos para projetos.",
    "service": "design"
  },
  {
    "company": "Sier Energia",
    "sector": "Energias e instalações",
    "location": "Vila Real, Vila Real",
    "website": "https://sierenergia.pt/",
    "email": "vila.real@sierenergia.pt",
    "phone": "965 551 717",
    "source": "https://sierenergia.pt/contactos/",
    "observation": "Empresa com pontos de atendimento em Vila Real e Bragança.",
    "opportunity": "Criar peças explicativas de serviços energéticos.",
    "service": "design"
  },
  {
    "company": "Carlos Rito",
    "sector": "Instalações elétricas",
    "location": "Lordelo, Vila Real",
    "website": "https://www.carlosrito.com/",
    "email": "geral@carlosrito.com",
    "phone": "933 375 590",
    "source": "https://www.carlosrito.com/",
    "observation": "Empresa de instalações elétricas com projetos apresentados no site.",
    "opportunity": "Organizar portfólio técnico em suportes comerciais.",
    "service": "design"
  },
  {
    "company": "EDIFICA4LIFE",
    "sector": "Construção civil",
    "location": "Vila Real, Vila Real",
    "website": "https://edifica.pt/",
    "email": "geral@edifica.pt",
    "phone": "965 395 500",
    "source": "https://ruis.aiccopn.pt/empresas/edifica4life-lda/",
    "observation": "Construtora de habitações unifamiliares inscrita na associação setorial.",
    "opportunity": "Criar apresentação de projetos de habitação.",
    "service": "design"
  }
];
try {
for(const col of ['email_observation','instagram','outreach_channel','dm_message','dm_status']){try{db.prepare('ALTER TABLE prospect_crm ADD COLUMN '+col+' TEXT').run()}catch(e){if(!/duplicate column/i.test(e.message))throw e}}
const existsCompany=db.prepare('SELECT id FROM users WHERE is_prospect=1 AND lower(trim(company))=lower(trim(?))');
const existsEmail=db.prepare('SELECT id FROM users WHERE lower(trim(email))=lower(trim(?))');
const existsSite=db.prepare("SELECT user_id FROM prospect_crm WHERE lower(trim(coalesce(website,'')))=lower(trim(?))");
const addUser=db.prepare('INSERT INTO users(name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES(?,?,?,?,?,?,1,0)');
const addCrm=db.prepare("INSERT INTO prospect_crm(user_id,sector,location,website,opportunity,idea,email_observation,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,outreach_channel,updated_at) VALUES(?,?,?,?,?,?,?,'intermedio',?,200,100,'por_contactar','normal',?,?,'email',datetime('now'))");
const password=bcrypt.hashSync(crypto.randomBytes(24).toString('hex'),10);let added=0,skipped=0;const seen=new Set();
db.transaction(()=>{for(const x of L){const email=x.email.trim().toLowerCase();const key=x.company.trim().toLowerCase();const domain=email.split('@')[1];const host=new URL(x.website).hostname.toLowerCase().replace(/^www\./,'');const forbidden=/^(gmail\.com|hotmail\.com|outlook\.com|yahoo\.com|icloud\.com|sapo\.pt)$/i;
if(!domain||forbidden.test(domain)||email.startsWith('noreply@')||wasDeleted(email)||seen.has(email)||seen.has(key)||existsCompany.get(x.company)||existsEmail.get(email)||existsSite.get(x.website)){skipped++;continue;}
if(domain!==host&&!x.source){skipped++;continue;}seen.add(email);seen.add(key);
const id=Number(addUser.run(x.company,email,password,'client',x.company,x.phone).lastInsertRowid);
const service=x.service==='design'?'design gráfico e materiais comerciais':x.service==='redes'?'gestão de redes sociais':'design gráfico e comunicação nas redes sociais';
const proposal='Olá, sou o Nuno, da DUIT. Estive a conhecer a '+x.company+' e posso ajudar com '+service+'. Se lhe fizer sentido, terei gosto em conversar consigo. Cumprimentos, Nuno.';
addCrm.run(id,x.sector,x.location,x.website,x.opportunity,x.service,x.source+' — email profissional publicado na fonte indicada.',x.opportunity,x.observation+' Serviço sugerido: '+x.service+'. Fonte: '+x.source,proposal);added++;}})();
console.log('[crm] seed 2026-10-23-b:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-10-23-b:',e.message)}
