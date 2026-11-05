// DUIT — Portugal continental, 2026-11-05 (segunda execução). Emails publicados nas páginas oficiais indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "CEPOMEL — Centro Polivalente de Medicina e Enfermagem de Leiria",
    "sector": "Clínica de medicina e fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Leiria, Leiria",
    "website": "https://www.cepomel.com/",
    "email": "info@cepomel.com",
    "phone": "244 828 098",
    "source": "https://www.cepomel.com/fisioterapia.php",
    "observation": "A clínica disponibiliza fisioterapia para condições músculo-esqueléticas, neuromusculares, oncológicas e cardiorrespiratórias.",
    "opportunity": "Desenvolver materiais informativos sobre as áreas de fisioterapia.",
    "service": "design"
  },
  {
    "company": "NAC — Machining Solutions",
    "sector": "Metalomecânica de precisão e maquinação CNC",
    "email_area": "Indústria & Produção",
    "location": "Viseu, Viseu",
    "website": "https://www.nac-ms.com/",
    "email": "geral@nac-ms.com",
    "phone": "964 939 332",
    "source": "https://www.nac-ms.com/",
    "observation": "Produz peças de elevada complexidade geométrica e presta serviços de engenharia, maquinação CNC e metrologia.",
    "opportunity": "Criar fichas de capacidades técnicas e apresentações industriais.",
    "service": "design"
  },
  {
    "company": "Sidor — Metalomecânica",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Mundão, Viseu",
    "website": "https://www.sidor.pt/",
    "email": "comercial@sidor.pt",
    "phone": "232 929 405",
    "source": "https://www.sidor.pt/Contactos/",
    "observation": "A empresa publica contacto comercial na Zona Industrial do Mundão, Viseu.",
    "opportunity": "Criar materiais de apresentação comercial para clientes industriais.",
    "service": "design"
  },
  {
    "company": "Aqui n'al-deia",
    "sector": "Turismo rural e alojamento",
    "email_area": "Turismo & Alojamento",
    "location": "São João dos Caldeireiros, Beja",
    "website": "https://www.aquinaldeia.pt/",
    "email": "geral@aquinaldeia.pt",
    "phone": "931 741 110",
    "source": "https://www.aquinaldeia.pt/contact.php",
    "observation": "A unidade de alojamento divulga contactos em São João dos Caldeireiros, concelho de Mértola.",
    "opportunity": "Criar peças de comunicação visual para apresentar o alojamento.",
    "service": "design"
  },
  {
    "company": "Ativefit",
    "sector": "Fisioterapia e bem-estar",
    "email_area": "Fisioterapia",
    "location": "Leiria, Leiria",
    "website": "https://ativefit.pt/",
    "email": "geral@ativefit.pt",
    "phone": "916 408 702",
    "source": "https://ativefit.pt/contactos/",
    "observation": "O espaço de São Romão, Leiria, disponibiliza serviços de fisioterapia e bem-estar.",
    "opportunity": "Criar materiais de apresentação das especialidades e serviços.",
    "service": "design"
  }
];
try {
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
 const pwd=bcrypt.hashSync(crypto.randomBytes(24).toString('hex'),10),seenE=new Set(),seenC=new Set(),seenS=new Set();
 let added=0,skipped=0;
 db.transaction(()=>{for(const x of L){
  const email=x.email.trim().toLowerCase(),company=x.company.trim().toLowerCase(),domain=email.split('@')[1],site=normSite(x.website);
  if(!domain||/^(gmail\.com|hotmail\.com|outlook\.com|yahoo\.[a-z.]+|icloud\.com|sapo\.pt)$/i.test(domain)||/^no-?reply@/i.test(email)||!x.source||!x.email_area||wasDeleted(email)||deletedCompany.get(company)||oldEmails.has(email)||oldCompanies.has(company)||(site&&oldSites.has(site))||seenE.has(email)||seenC.has(company)||(site&&seenS.has(site))||hasEmail.get(email)||hasCompany.get(company)||(site&&sites.has(site))){skipped++;continue}
  seenE.add(email);seenC.add(company);if(site)seenS.add(site);
  const service=x.service==='design'?'design gráfico e materiais comerciais':x.service==='redes'?'gestão de redes sociais':'design gráfico e comunicação nas redes sociais';
  const proposal='Olá, sou o Nuno, da DUIT. Estive a conhecer a '+x.company+'. Posso ajudar com '+service+', nomeadamente com '+x.opportunity.toLowerCase()+' Se fizer sentido para si, terei gosto em conversar consigo. Cumprimentos, Nuno.';
  const id=Number(addUser.run(x.company,email,pwd,'client',x.company,x.phone||'').lastInsertRowid);
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-05).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');
  added++;
 }})();
 console.log('[crm] seed 2026-11-05:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-05:',e.message)}
