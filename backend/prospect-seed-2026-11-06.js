// DUIT — Portugal continental, 2026-11-06. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Mizo Interiores",
    "sector": "Comércio de mobiliário e interiores",
    "email_area": "Comércio & Retalho",
    "location": "Aveiro, Aveiro",
    "website": "https://www.mizo.pt/",
    "email": "geral@mizo.pt",
    "phone": "234 381 801",
    "source": "https://www.mizo.pt/proposta",
    "observation": "Loja de interiores com contacto e morada em Aveiro.",
    "opportunity": "Catálogos e peças gráficas de apresentação de coleções.",
    "service": "design"
  },
  {
    "company": "Clínica de Fisioterapia Nossa Senhora da Caridade",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://caridade-viana.com/",
    "email": "clinica@caridade-viana.com",
    "phone": "258 825 132",
    "source": "https://caridade-viana.com/clinica-fisioterapia/",
    "observation": "Clínica com serviços de fisiatria, fisioterapia e terapia da fala.",
    "opportunity": "Materiais informativos sobre serviços clínicos.",
    "service": "design"
  },
  {
    "company": "Clínica Despertar",
    "sector": "Clínica multidisciplinar",
    "email_area": "Saúde",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://clinicadespertar.pt/",
    "email": "geral@clinicadespertar.pt",
    "phone": "962 335 062",
    "source": "https://clinicadespertar.pt/marcacao-de-consultas/",
    "observation": "Clínica com marcações de consultas e licença ERS publicada.",
    "opportunity": "Peças gráficas para apresentar consultas e especialidades.",
    "service": "design"
  },
  {
    "company": "DarqueMed",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Darque, Viana do Castelo",
    "website": "https://darquemed.pt/",
    "email": "darquemed@darquemed.pt",
    "phone": "258 330 231",
    "source": "https://darquemed.pt/contactos/",
    "observation": "Disponibiliza fisioterapia e consultas de especialidade.",
    "opportunity": "Materiais de apresentação das modalidades de atendimento.",
    "service": "design"
  },
  {
    "company": "Therapy Viana",
    "sector": "Fisioterapia e Pilates Clínico",
    "email_area": "Fisioterapia",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://therapyviana.pt/",
    "email": "geral@therapyviana.pt",
    "phone": "938 131 502",
    "source": "https://therapyviana.pt/contacto/",
    "observation": "Clínica com registo ERS e contactos publicados.",
    "opportunity": "Materiais informativos de fisioterapia e Pilates Clínico.",
    "service": "design"
  },
  {
    "company": "Lar Darte",
    "sector": "Cozinhas e carpintaria por medida",
    "email_area": "Indústria & Produção",
    "location": "Castro Daire, Viseu",
    "website": "https://lardarte.pt/",
    "email": "lardarte@lardarte.pt",
    "phone": "232 388 059",
    "source": "https://lardarte.pt/",
    "observation": "Fábrica e showroom em Castro Daire, com cozinhas e mobiliário por medida.",
    "opportunity": "Catálogo gráfico de cozinhas e mobiliário por medida.",
    "service": "design"
  },
  {
    "company": "Carpintaria Mecânica António Marques Costa",
    "sector": "Carpintaria e marcenaria",
    "email_area": "Indústria & Produção",
    "location": "Aradas, Aveiro",
    "website": "http://www.antoniomarquesdacosta.com",
    "email": "geral@antoniomarquesdacosta.com",
    "phone": "234 427 763",
    "source": "https://www.diretorioempresarial.pt/carpintaria_mecanica_antonio_marques_costa_carpintarias_marcenarias_serracoes_aveiro1",
    "observation": "Carpintaria com contacto profissional divulgado em diretório empresarial.",
    "opportunity": "Portefólio gráfico de trabalhos de carpintaria.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-06).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');
  added++;
 }})();
 console.log('[crm] seed 2026-11-06:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-06:',e.message)}
