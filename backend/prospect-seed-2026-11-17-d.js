// DUIT — Portugal continental, 2026-11-17-d. Contactos verificados em fontes públicas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Therapy Viana",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://therapyviana.pt",
    "email": "geral@therapyviana.pt",
    "phone": "938131502",
    "source": "https://therapyviana.pt/contacto/",
    "observation": "Fisioterapia e pilates clínico.",
    "opportunity": "Possível apoio de design gráfico para divulgação dos serviços e especialidades.",
    "service": "design"
  },
  {
    "company": "Motriviana",
    "sector": "Fisioterapia e bem-estar",
    "email_area": "Fisioterapia",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://motriviana.pt",
    "email": "clinica@motriviana.com",
    "phone": "258843065",
    "source": "https://motriviana.pt/quem-somos/",
    "observation": "Fisioterapia, osteopatia e estética avançada.",
    "opportunity": "Possível apoio de design gráfico para divulgação dos serviços e especialidades.",
    "service": "design"
  },
  {
    "company": "CMVA Clinic",
    "sector": "Clínica médica",
    "email_area": "Saúde",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://www.cmvaclinic.com",
    "email": "geral@cmvaclinic.com",
    "phone": "258834858",
    "source": "https://www.cmvaclinic.com/",
    "observation": "Clínica com gabinetes para profissionais de saúde.",
    "opportunity": "Possível apoio de design gráfico para divulgação dos serviços e especialidades.",
    "service": "design"
  },
  {
    "company": "Clínica Despertar",
    "sector": "Clínica multidisciplinar",
    "email_area": "Saúde",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://clinicadespertar.pt",
    "email": "geral@clinicadespertar.pt",
    "phone": "962335962",
    "source": "https://clinicadespertar.pt/contactos/",
    "observation": "Clínica multidisciplinar com atendimento de saúde e bem-estar.",
    "opportunity": "Possível apoio de design gráfico para divulgação dos serviços e especialidades.",
    "service": "design"
  },
  {
    "company": "DarqueMed",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Darque, Viana do Castelo",
    "website": "https://darquemed.pt",
    "email": "darquemed@darquemed.pt",
    "phone": "258330231",
    "source": "https://darquemed.pt/contactos/",
    "observation": "Fisioterapia com agendamento de sessões e consultas.",
    "opportunity": "Possível apoio de design gráfico para divulgação dos serviços e especialidades.",
    "service": "design"
  },
  {
    "company": "Associação Dança Leiria",
    "sector": "Escola de dança",
    "email_area": "Estúdios de Dança",
    "location": "Leiria, Leiria",
    "website": "https://www.dancaleiria.pt",
    "email": "geral@dancaleiria.pt",
    "phone": "244854391",
    "source": "https://www.dancaleiria.pt/contactos/",
    "observation": "Escola e associação de dança com projetos educativos.",
    "opportunity": "Possível apoio de design gráfico para divulgação dos serviços e especialidades.",
    "service": "design"
  },
  {
    "company": "OTOMED",
    "sector": "Clínica médica e fisioterapia",
    "email_area": "Saúde",
    "location": "Évora, Évora",
    "website": "https://www.otomed.pt",
    "email": "geral@otomed.pt",
    "phone": "266703140",
    "source": "https://www.otomed.pt/",
    "observation": "Clínica médica e unidade de fisioterapia.",
    "opportunity": "Possível apoio de design gráfico para divulgação dos serviços e especialidades.",
    "service": "design"
  },
  {
    "company": "Auto Sertório",
    "sector": "Comércio e reparação automóvel",
    "email_area": "Automóvel",
    "location": "Viseu, Viseu",
    "website": "https://autosertorio.pt",
    "email": "geral@autosertorio.pt",
    "phone": "232420860",
    "source": "https://autosertorio.pt/contactos/",
    "observation": "Stand, oficina multimarca e aluguer de viaturas.",
    "opportunity": "Possível apoio de design gráfico para divulgação dos serviços e especialidades.",
    "service": "design"
  },
  {
    "company": "Eborae Fisio",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Évora, Évora",
    "website": "https://eboraefisio.pt",
    "email": "eboraefisio@eboraefisio.pt",
    "phone": "",
    "source": "https://physioindex.com/pt/perfil/eborae-fisio-centro-terapeutico-evora",
    "observation": "Clínica de fisioterapia com serviços de reabilitação.",
    "opportunity": "Possível apoio de design gráfico para divulgação dos serviços e especialidades.",
    "service": "design"
  }
];
try{
 const cols=db.prepare('PRAGMA table_info(prospect_crm)').all().map(c=>c.name);
 for(const col of ['email_area','email_observation','instagram','outreach_channel'])if(!cols.includes(col))db.exec('ALTER TABLE prospect_crm ADD COLUMN '+col+' TEXT');
 const normSite=s=>{try{return new URL(s).hostname.toLowerCase().replace(/^www\./,'')}catch(_){return ''}};
 const oldEmails=new Set(),oldCompanies=new Set(),oldSites=new Set();
 for(const f of fs.readdirSync(__dirname).filter(n=>/^prospect-seed-.*\.js$/i.test(n)&&n!==path.basename(__filename))){
  const txt=fs.readFileSync(path.join(__dirname,f),'utf8');
  for(const m of txt.matchAll(/["']email["']\s*:\s*["']([^"']+)["']/g))oldEmails.add(m[1].trim().toLowerCase());
  for(const m of txt.matchAll(/["']company["']\s*:\s*["']([^"']+)["']/g))oldCompanies.add(m[1].trim().toLowerCase());
  for(const m of txt.matchAll(/["']website["']\s*:\s*["']([^"']+)["']/g)){const site=normSite(m[1]);if(site)oldSites.add(site)}
 }
 const sites=new Set(db.prepare("SELECT website FROM prospect_crm WHERE website IS NOT NULL AND trim(website)<>''").all().map(x=>normSite(x.website)).filter(Boolean));
 const deletedCompany=db.prepare("SELECT 1 FROM deleted_prospects WHERE lower(trim(company))=? LIMIT 1");
 const hasEmail=db.prepare('SELECT 1 FROM users WHERE lower(trim(email))=? LIMIT 1'),hasCompany=db.prepare('SELECT 1 FROM users WHERE is_prospect=1 AND lower(trim(company))=? LIMIT 1');
 const addUser=db.prepare('INSERT INTO users(name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES(?,?,?,?,?,?,1,0)');
 const addCrm=db.prepare("INSERT INTO prospect_crm(user_id,sector,email_area,location,website,instagram,opportunity,idea,email_observation,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,outreach_channel,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))");
 const pwd=bcrypt.hashSync(crypto.randomBytes(24).toString('hex'),10),seenE=new Set(),seenC=new Set(),seenS=new Set();let added=0,skipped=0;
 db.transaction(()=>{for(const x of L){const email=x.email.trim().toLowerCase(),company=x.company.trim().toLowerCase(),domain=email.split('@')[1],site=normSite(x.website);
  if(!domain||/^(gmail\.com|hotmail\.com|outlook\.com|yahoo\.[a-z.]+|icloud\.com|sapo\.pt)$/i.test(domain)||/^no-?reply@/i.test(email)||!x.source||!x.email_area||wasDeleted(email)||deletedCompany.get(company)||oldEmails.has(email)||oldCompanies.has(company)||(site&&oldSites.has(site))||seenE.has(email)||seenC.has(company)||(site&&seenS.has(site))||hasEmail.get(email)||hasCompany.get(company)||(site&&sites.has(site))){skipped++;continue}
  seenE.add(email);seenC.add(company);if(site)seenS.add(site);
  const service=x.service==='design'?'design gráfico e materiais comerciais':x.service==='redes'?'gestão de redes sociais':'design gráfico e comunicação nas redes sociais';
  const proposal='Olá, sou o Nuno, da DUIT. Estive a conhecer a '+x.company+'. Posso ajudar com '+service+', nomeadamente com '+x.opportunity.toLowerCase()+' Se fizer sentido para si, terei gosto em conversar consigo. Cumprimentos, Nuno.';
  const id=Number(addUser.run(x.company,email,pwd,'client',x.company,x.phone||'').lastInsertRowid);
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-17-d).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-17-d:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-17-d:',e.message)}
