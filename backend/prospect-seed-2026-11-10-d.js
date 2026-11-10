// DUIT — Portugal continental, 2026-11-10-d. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "GM Engenharia",
    "sector": "Construção & Engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Porto, Porto",
    "website": "https://gmengenharia.pt/",
    "email": "geral@gmengenharia.pt",
    "phone": "220958323",
    "source": "https://www.gmengenharia.pt/contactos",
    "observation": "Projetos de engenharia",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "MEC Engenharia",
    "sector": "Construção & Engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Lisboa, Lisboa",
    "website": "https://mec-engenharia.pt/",
    "email": "geral@mec-engenharia.pt",
    "phone": "218006119",
    "source": "https://www.mec-engenharia.pt/contactos",
    "observation": "Engenharia e construção",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Volume Dinâmico Engenharia",
    "sector": "Construção & Engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Oliveira de Azeméis, Aveiro",
    "website": "https://vdengenharia.pt/",
    "email": "geral@vdengenharia.pt",
    "phone": "",
    "source": "https://vdengenharia.pt/",
    "observation": "Projetos de engenharia",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "GBR Engenharia",
    "sector": "Construção & Engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Lisboa, Lisboa",
    "website": "https://gbr-engenharia.pt/",
    "email": "geral@gbr-engenharia.pt",
    "phone": "218068880",
    "source": "https://gbr-engenharia.pt/contactos/",
    "observation": "Engenharia",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "FDE Engenharia",
    "sector": "Construção & Engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Marco de Canaveses, Porto",
    "website": "https://fde-engenharia.pt/",
    "email": "geral@fde-engenharia.pt",
    "phone": "255582846",
    "source": "https://www.fde-engenharia.pt/contactos.html",
    "observation": "Projetos de engenharia",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Clinical Studio",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Vila Nova de Gaia, Porto",
    "website": "https://clinicalstudio.pt/",
    "email": "geral@clinicalstudio.pt",
    "phone": "926643908",
    "source": "https://clinicalstudio.pt/contactos/",
    "observation": "Fisioterapia e pilates",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Rasa Engenharia",
    "sector": "Construção & Engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Lisboa, Lisboa",
    "website": "https://rasaengenharia.pt/",
    "email": "geral@rasaengenharia.pt",
    "phone": "939474741",
    "source": "https://rasaengenharia.pt/contactos/",
    "observation": "Engenharia e construção",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Projectual",
    "sector": "Construção & Engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Torres Vedras, Lisboa",
    "website": "https://projectual.pt/",
    "email": "geral@projectual.pt",
    "phone": "261339270",
    "source": "https://www.projectual.pt/pt/contactos/",
    "observation": "Serviços de engenharia",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "ERI Engenharia",
    "sector": "Construção & Engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Matosinhos, Porto",
    "website": "https://eri.pt/",
    "email": "geral@eri.pt",
    "phone": "229477640",
    "source": "https://eri.pt/contactos/",
    "observation": "Engenharia e construção",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Output Engenharia",
    "sector": "Construção & Engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Camarate, Lisboa",
    "website": "https://outputengenharia.pt/",
    "email": "geral@outputengenharia.pt",
    "phone": "219488434",
    "source": "https://outputengenharia.pt/contactos/",
    "observation": "Engenharia",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Fisio 21",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Lisboa, Lisboa",
    "website": "https://fisio21.pt/",
    "email": "geral@fisio21.pt",
    "phone": "218471192",
    "source": "https://fisio21.pt/",
    "observation": "Fisioterapia",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "13 Engenharia",
    "sector": "Construção & Engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Ovar, Aveiro",
    "website": "https://13engenharia.pt/",
    "email": "geral@13engenharia.pt",
    "phone": "256575159",
    "source": "https://www.13engenharia.pt/",
    "observation": "Projetos de engenharia",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Smart Obras e Engenharia",
    "sector": "Construção & Engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Loulé, Faro",
    "website": "https://smart-engenharia.pt/",
    "email": "geral@smart-engenharia.pt",
    "phone": "289039299",
    "source": "https://www.smart-engenharia.pt/contactos.php",
    "observation": "Engenharia e obras",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Pluma Fisioterapia",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Pêro Pinheiro, Lisboa",
    "website": "https://plumafisioterapia.pt/",
    "email": "geral@plumafisioterapia.pt",
    "phone": "927754262",
    "source": "https://plumafisioterapia.pt/contactos/",
    "observation": "Fisioterapia",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Lopes Ribeiro Pinturas e Reparações Automóveis",
    "sector": "Automóvel",
    "email_area": "Automóvel",
    "location": "Vialonga, Lisboa",
    "website": "https://lopesribeiro.pt/",
    "email": "geral@lopesribeiro.pt",
    "phone": "219748180",
    "source": "https://www.lopesribeiro.pt/contactos",
    "observation": "Oficina de pintura e reparação automóvel",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "FisiOne",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Águeda, Aveiro",
    "website": "https://fisione.pt/",
    "email": "geral@fisione.pt",
    "phone": "911038821",
    "source": "https://fisione.pt/",
    "observation": "Gabinete de fisioterapia",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Fisiojoane",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Joane, Braga",
    "website": "https://fisiojoane.pt/",
    "email": "geral@fisiojoane.pt",
    "phone": "252993509",
    "source": "https://www.fisiojoane.pt/contactos/",
    "observation": "Clínica médica e fisioterapia",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Centro de Fisioterapia MP",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Massamá, Lisboa",
    "website": "https://fisioterapiamp.pt/",
    "email": "geral@fisioterapiamp.pt",
    "phone": "214372376",
    "source": "https://fisioterapiamp.pt/contactos/",
    "observation": "Centro de fisioterapia",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Fisiopower",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Cartaxo, Santarém",
    "website": "https://fisiopower.pt/",
    "email": "geral@fisiopower.pt",
    "phone": "243158438",
    "source": "https://fisiopower.pt/contactos/",
    "observation": "Fisioterapia e reabilitação",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Consigo Fisioterapia",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Amadora, Lisboa",
    "website": "https://consigofisioterapia.pt/",
    "email": "geral@consigofisioterapia.pt",
    "phone": "910640969",
    "source": "https://www.consigofisioterapia.pt/termos-e-condicoes",
    "observation": "Fisioterapia",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "ChangeSteel",
    "sector": "Indústria & Produção",
    "email_area": "Indústria & Produção",
    "location": "Lagares, Porto",
    "website": "https://changesteel.pt/",
    "email": "comercial@changesteel.pt",
    "phone": "925308048",
    "source": "https://changesteel.pt/",
    "observation": "Metalomecânica",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-10-d).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-10-d:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-10-d:',e.message)}
