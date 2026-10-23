const crypto=require('crypto');
const bcrypt=require('bcryptjs');
const db=require('./db');
const {wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Clínica Dentária Dra. Ana Chin",
    "sector": "Medicina dentária",
    "location": "Odivelas, Lisboa",
    "website": "https://clinicadentaria-anachin.pt/",
    "email": "geral@clinicadentaria-anachin.pt",
    "phone": "219 324 865",
    "source": "https://clinicadentaria-anachin.pt/contactos/",
    "observation": "Consultório dentário identificado pelo nome da médica em Odivelas.",
    "opportunity": "Criar materiais informativos de especialidades e consultas.",
    "service": "design"
  },
  {
    "company": "Clínica Dentária de Arouca",
    "sector": "Medicina dentária",
    "location": "Arouca, Aveiro",
    "website": "https://clinicadentariadearouca.pt/",
    "email": "geral@clinicadentariadearouca.pt",
    "phone": "256 943 549",
    "source": "https://clinicadentariadearouca.pt/contactos/",
    "observation": "Clínica de medicina dentária em Arouca com atendimento por marcação.",
    "opportunity": "Organizar comunicação visual dos serviços clínicos.",
    "service": "design"
  },
  {
    "company": "Clinical Studio",
    "sector": "Fisioterapia e pilates clínico",
    "location": "Vila Nova de Gaia, Porto",
    "website": "https://clinicalstudio.pt/",
    "email": "geral@clinicalstudio.pt",
    "phone": "926 643 908",
    "source": "https://clinicalstudio.pt/contactos/",
    "observation": "Estúdio de fisioterapia e pilates clínico em Vila Nova de Gaia.",
    "opportunity": "Criar conteúdos informativos sobre serviços disponíveis.",
    "service": "ambas"
  },
  {
    "company": "George Gomes Dental Center",
    "sector": "Medicina dentária",
    "location": "Oeiras, Lisboa",
    "website": "https://www.ggdc.pt/",
    "email": "geral@ggdc.pt",
    "phone": "211 376 141",
    "source": "https://www.ggdc.pt/contactos/",
    "observation": "Clínica dentária com serviços de prevenção e reabilitação oral.",
    "opportunity": "Preparar apresentações claras das áreas clínicas.",
    "service": "design"
  },
  {
    "company": "Hiclinic",
    "sector": "Medicina dentária",
    "location": "Aveiro, Aveiro",
    "website": "https://hiclinic.pt/",
    "email": "geral@hiclinic.pt",
    "phone": "234 421 000",
    "source": "https://hiclinic.pt/contactos/",
    "observation": "Clínica médico-dentária com localização em Aveiro.",
    "opportunity": "Criar materiais de informação sobre especialidades.",
    "service": "design"
  },
  {
    "company": "Physiocare",
    "sector": "Fisioterapia e reabilitação",
    "location": "Branca, Albergaria-a-Velha, Aveiro",
    "website": "https://physiocare.pt/",
    "email": "geral@physiocare.pt",
    "phone": "234 029 009",
    "source": "https://physiocare.pt/contactos",
    "observation": "Clínica de fisioterapia e reabilitação com terapias manuais.",
    "opportunity": "Apresentar especialidades em peças gráficas e digitais.",
    "service": "ambas"
  },
  {
    "company": "Fisiojoane",
    "sector": "Fisioterapia e clínica médica",
    "location": "Joane, Vila Nova de Famalicão, Braga",
    "website": "https://www.fisiojoane.pt/",
    "email": "geral@fisiojoane.pt",
    "phone": "252 993 509",
    "source": "https://www.fisiojoane.pt/contactos/",
    "observation": "Clínica médica e de fisioterapia com atendimento em Joane.",
    "opportunity": "Criar conteúdos sobre serviços e informação ao utente.",
    "service": "ambas"
  },
  {
    "company": "BeneVital",
    "sector": "Fisioterapia",
    "location": "Lisboa, Lisboa",
    "website": "https://benevital.pt/",
    "email": "geral@benevital.pt",
    "phone": "211 603 148",
    "source": "https://benevital.pt/",
    "observation": "Clínica de fisioterapia e recuperação funcional em Lisboa.",
    "opportunity": "Criar comunicação visual sobre áreas de intervenção.",
    "service": "design"
  },
  {
    "company": "Clínica Dentária Morgado",
    "sector": "Medicina dentária",
    "location": "Leiria, Leiria",
    "website": "https://clinicadentariamorgado.pt/",
    "email": "geral@clinicadentariamorgado.pt",
    "phone": "244 824 356",
    "source": "https://clinicadentariamorgado.pt/contactos",
    "observation": "Clínica dentária com unidades em Leiria e Batalha.",
    "opportunity": "Organizar informação das duas localizações em materiais gráficos.",
    "service": "design"
  },
  {
    "company": "Restart Clinic",
    "sector": "Fisioterapia e saúde integrativa",
    "location": "Loures, Lisboa",
    "website": "https://restartclinic.pt/",
    "email": "geral@restartclinic.pt",
    "phone": "935 480 340",
    "source": "https://restartclinic.pt/",
    "observation": "Clínica em Loures com fisioterapia, osteopatia e nutrição.",
    "opportunity": "Criar peças de apresentação de serviços e especialidades.",
    "service": "ambas"
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
console.log('[crm] seed 2026-10-23-c:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-10-23-c:',e.message)}
