// DUIT — 2026-11-25. Empresas e emails profissionais verificados em fontes públicas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Cerpros",
    "sector": "Clínica médica",
    "email_area": "Saúde",
    "location": "Portalegre",
    "website": "https://cerpros.pt/",
    "email": "geral@cerpros.pt",
    "phone": "245339020",
    "source": "https://cerpros.pt/contactos/",
    "instagram": "",
    "observation": "Contacto publicado na página oficial da empresa.",
    "opportunity": "criação de materiais gráficos para apresentar os serviços de clínica médica.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email publicado em https://cerpros.pt/contactos/"
  },
  {
    "company": "Nova Clínica",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Beja",
    "website": "https://novaclinica.pt/",
    "email": "geral@novaclinica.pt",
    "phone": "284328100",
    "source": "https://novaclinica.pt/contactos/",
    "instagram": "",
    "observation": "Contacto publicado na página oficial da empresa.",
    "opportunity": "criação de materiais gráficos para apresentar os serviços de medicina dentária.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email publicado em https://novaclinica.pt/contactos/"
  },
  {
    "company": "Serralharia Rui Vieira",
    "sector": "Serralharia",
    "email_area": "Indústria & Produção",
    "location": "Cinfães, Viseu",
    "website": "https://serralhariaruivieira.pt/",
    "email": "geral@serralhariaruivieira.pt",
    "phone": "255640749",
    "source": "https://serralhariaruivieira.pt/contactos/",
    "instagram": "",
    "observation": "Contacto publicado na página oficial da empresa.",
    "opportunity": "criação de materiais gráficos para apresentar os serviços de serralharia.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email publicado em https://serralhariaruivieira.pt/contactos/"
  },
  {
    "company": "Polinox",
    "sector": "Metalúrgica",
    "email_area": "Indústria & Produção",
    "location": "Viseu",
    "website": "https://polinox.pt/",
    "email": "geral@polinox.pt",
    "phone": "",
    "source": "https://polinox.pt/contactos",
    "instagram": "",
    "observation": "Contacto publicado na página oficial da empresa.",
    "opportunity": "criação de materiais gráficos para apresentar os serviços de metalúrgica.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email publicado em https://polinox.pt/contactos"
  },
  {
    "company": "Pesamatrans",
    "sector": "Logística de peças automóvel",
    "email_area": "Transportes & Logística",
    "location": "Coimbra",
    "website": "https://pesamatrans.pt/",
    "email": "geral@pesamatrans.pt",
    "phone": "939133911",
    "source": "https://pesamatrans.pt/",
    "instagram": "",
    "observation": "Contacto publicado na página oficial da empresa.",
    "opportunity": "criação de materiais gráficos para apresentar os serviços de logística de peças automóvel.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email publicado em https://pesamatrans.pt/"
  },
  {
    "company": "Clínica Rainha D. Leonor",
    "sector": "Clínica",
    "email_area": "Saúde",
    "location": "Beja",
    "website": "https://clinicarainhadonaleonor.pt/",
    "email": "geral@clinicarainhadonaleonor.pt",
    "phone": "284341588",
    "source": "https://clinicarainhadonaleonor.pt/contactos/",
    "instagram": "",
    "observation": "Contacto publicado na página oficial da empresa.",
    "opportunity": "criação de materiais gráficos para apresentar os serviços de clínica.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email publicado em https://clinicarainhadonaleonor.pt/contactos/"
  },
  {
    "company": "Inovisfer",
    "sector": "Serralharia",
    "email_area": "Indústria & Produção",
    "location": "Viseu",
    "website": "https://inovisfer.pt/",
    "email": "geral@inovisfer.pt",
    "phone": "232450060",
    "source": "https://inovisfer.pt/",
    "instagram": "",
    "observation": "Contacto publicado na página oficial da empresa.",
    "opportunity": "criação de materiais gráficos para apresentar os serviços de serralharia.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email publicado em https://inovisfer.pt/"
  },
  {
    "company": "Serralharia JR",
    "sector": "Serralharia",
    "email_area": "Indústria & Produção",
    "location": "Mortágua, Viseu",
    "website": "https://www.serralhariajr.pt/",
    "email": "geral@serralhariajr.pt",
    "phone": "917393374",
    "source": "https://www.serralhariajr.pt/contactos",
    "instagram": "",
    "observation": "Contacto publicado na página oficial da empresa.",
    "opportunity": "criação de materiais gráficos para apresentar os serviços de serralharia.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email publicado em https://www.serralhariajr.pt/contactos"
  },
  {
    "company": "Ferroviseu",
    "sector": "Comércio de ferro",
    "email_area": "Comércio & Retalho",
    "location": "Viseu",
    "website": "https://ferroviseu.pt/",
    "email": "geral@ferroviseu.pt",
    "phone": "232954745",
    "source": "https://ferroviseu.pt/",
    "instagram": "",
    "observation": "Contacto publicado na página oficial da empresa.",
    "opportunity": "criação de materiais gráficos para apresentar os serviços de comércio de ferro.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email publicado em https://ferroviseu.pt/"
  },
  {
    "company": "Coimbra Tours & Transfers",
    "sector": "Transfers turísticos",
    "email_area": "Turismo & Alojamento",
    "location": "Coimbra",
    "website": "https://coimbratoursandtransfers.pt/",
    "email": "geral@coimbratoursandtransfers.pt",
    "phone": "928029323",
    "source": "https://coimbratoursandtransfers.pt/contacte-a-coimbra-tours-transfers-para-reservas-transfers-privados-transporte-para-empresas-e-servicos-a-medida-a-partir-de-coimbra/",
    "instagram": "",
    "observation": "Contacto publicado na página oficial da empresa.",
    "opportunity": "criação de materiais gráficos para apresentar os serviços de transfers turísticos.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email publicado em https://coimbratoursandtransfers.pt/contacte-a-coimbra-tours-transfers-para-reservas-transfers-privados-transporte-para-empresas-e-servicos-a-medida-a-partir-de-coimbra/"
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'',x.instagram||'',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-25).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-25:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-25:',e.message)}
