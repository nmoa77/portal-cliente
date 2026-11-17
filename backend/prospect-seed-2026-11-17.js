// DUIT — Portugal continental, 2026-11-17. Contactos públicos nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Neuro IN",
    "sector": "Fisioterapia neurológica",
    "email_area": "Fisioterapia",
    "location": "Viseu, Viseu",
    "website": "https://www.neuroin.pt",
    "email": "geral@neuroin.pt",
    "phone": "232452395",
    "source": "https://www.neuroin.pt/equipa/",
    "observation": "Atividade de fisioterapia neurológica e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de fisioterapia neurológica.",
    "service": "design"
  },
  {
    "company": "Fisio Clínica da Ribeira",
    "sector": "Fisioterapia e reabilitação",
    "email_area": "Fisioterapia",
    "location": "Viseu, Viseu",
    "website": "https://www.clinicadaribeira.pt",
    "email": "geral@clinicadaribeira.pt",
    "phone": "232436062",
    "source": "https://www.clinicadaribeira.pt/fisioterapia-e-reabilitacao",
    "observation": "Atividade de fisioterapia e reabilitação e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de fisioterapia e reabilitação.",
    "service": "design"
  },
  {
    "company": "R.Fisio",
    "sector": "Fisioterapia e osteopatia",
    "email_area": "Fisioterapia",
    "location": "Viseu, Viseu",
    "website": "https://www.rfisio.pt",
    "email": "geral@rfisioviseu.pt",
    "phone": "938140418",
    "source": "https://www.rfisio.pt/",
    "observation": "Atividade de fisioterapia e osteopatia e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de fisioterapia e osteopatia.",
    "service": "design"
  },
  {
    "company": "FisioSpark",
    "sector": "Fisioterapia e pilates",
    "email_area": "Fisioterapia",
    "location": "Viseu, Viseu",
    "website": "https://www.fisiospark.pt",
    "email": "geral@fisiospark.pt",
    "phone": "911138677",
    "source": "https://www.fisiospark.pt/equipa/",
    "observation": "Atividade de fisioterapia e pilates e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de fisioterapia e pilates.",
    "service": "design"
  },
  {
    "company": "Explica Centro",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Coimbra, Coimbra",
    "website": "https://explicacentro.pt",
    "email": "geral@explicacentro.pt",
    "phone": "913303723",
    "source": "https://explicacentro.pt/explicacentro-contatos.html",
    "observation": "Atividade de centro de estudos e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de centro de estudos.",
    "service": "design"
  },
  {
    "company": "Serralharia Inovadora",
    "sector": "Serralharia e remodelações",
    "email_area": "Indústria & Produção",
    "location": "Bragança, Bragança",
    "website": "https://serralhariainovadora.pt",
    "email": "geral@serralhariainovadora.pt",
    "phone": "273381071",
    "source": "https://serralhariainovadora.pt/",
    "observation": "Atividade de serralharia e remodelações e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de serralharia e remodelações.",
    "service": "design"
  },
  {
    "company": "Domingos Alves da Silva & Irmãos",
    "sector": "Serração, carpintaria e materiais",
    "email_area": "Indústria & Produção",
    "location": "Guarda, Guarda",
    "website": "https://www.doalsil.com",
    "email": "geral@doalsil.com",
    "phone": "271238199",
    "source": "https://www.doalsil.com/",
    "observation": "Atividade de serração, carpintaria e materiais e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de serração, carpintaria e materiais.",
    "service": "design"
  },
  {
    "company": "PAC Carpintaria",
    "sector": "Fabrico de mobiliário",
    "email_area": "Indústria & Produção",
    "location": "Guarda, Guarda",
    "website": "https://moveispac.pt",
    "email": "orcamentos@moveispac.pt",
    "phone": "965538507",
    "source": "https://moveispac.pt/",
    "observation": "Atividade de fabrico de mobiliário e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de fabrico de mobiliário.",
    "service": "design"
  },
  {
    "company": "Premetal",
    "sector": "Metalomecânica para agropecuária",
    "email_area": "Indústria & Produção",
    "location": "Évora, Évora",
    "website": "https://premetal.pt",
    "email": "geral@premetal.pt",
    "phone": "266760090",
    "source": "https://premetal.pt/contactos/",
    "observation": "Atividade de metalomecânica para agropecuária e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de metalomecânica para agropecuária.",
    "service": "design"
  },
  {
    "company": "EPIAP",
    "sector": "Indústria metálica",
    "email_area": "Indústria & Produção",
    "location": "Benedita, Leiria",
    "website": "https://www.epiap.pt",
    "email": "comercial@epiap.pt",
    "phone": "262929530",
    "source": "https://www.epiap.pt/pt/contactos",
    "observation": "Atividade de indústria metálica e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de indústria metálica.",
    "service": "design"
  },
  {
    "company": "Ventos Tranquilos",
    "sector": "Transportes e logística",
    "email_area": "Transportes & Logística",
    "location": "Vila Real, Vila Real",
    "website": "https://ventostranquilos.com",
    "email": "geral@ventostranquilos.com",
    "phone": "259044353",
    "source": "https://ventostranquilos.com/pt",
    "observation": "Atividade de transportes e logística e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de transportes e logística.",
    "service": "design"
  },
  {
    "company": "Geosil",
    "sector": "Exploração agroflorestal",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Bragança, Bragança",
    "website": "https://geosil.pt",
    "email": "geral@geosil.pt",
    "phone": "273969238",
    "source": "https://geosil.pt/",
    "observation": "Atividade de exploração agroflorestal e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de exploração agroflorestal.",
    "service": "design"
  },
  {
    "company": "Roady Centro-Auto Évora",
    "sector": "Oficina automóvel",
    "email_area": "Automóvel",
    "location": "Évora, Évora",
    "website": "https://roadyevora.com",
    "email": "geral@roadyevora.com",
    "phone": "266248969",
    "source": "https://roadyevora.com/",
    "observation": "Atividade de oficina automóvel e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de oficina automóvel.",
    "service": "design"
  },
  {
    "company": "HautoJabe",
    "sector": "Oficina de reparação automóvel",
    "email_area": "Automóvel",
    "location": "Évora, Évora",
    "website": "https://www.hautojabe.com.pt",
    "email": "heldergraca@hautojabe.com",
    "phone": "266750540",
    "source": "https://www.hautojabe.com.pt/index.html",
    "observation": "Atividade de oficina de reparação automóvel e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de oficina de reparação automóvel.",
    "service": "design"
  },
  {
    "company": "ViveiroBri",
    "sector": "Viveiro de plantas",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Bragança, Bragança",
    "website": "https://viveirobri.com",
    "email": "geral@viveirobri.com",
    "phone": "912163915",
    "source": "https://viveirobri.com/contato/",
    "observation": "Atividade de viveiro de plantas e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de viveiro de plantas.",
    "service": "design"
  },
  {
    "company": "TP Logística",
    "sector": "Transportes e logística",
    "email_area": "Transportes & Logística",
    "location": "Vila do Conde, Porto",
    "website": "https://tp-logistica.com",
    "email": "geral@tp-logistica.com",
    "phone": "915454048",
    "source": "https://tp-logistica.com/contactos/",
    "observation": "Atividade de transportes e logística e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de transportes e logística.",
    "service": "design"
  },
  {
    "company": "Almojanda 3Olivetree",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Portalegre, Portalegre",
    "website": "https://www.almojanda3olivetree.com",
    "email": "geral@almojanda3olivetree.com",
    "phone": "963474524",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/portalegre",
    "observation": "Atividade de turismo rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de turismo rural.",
    "service": "design"
  },
  {
    "company": "Briferarte",
    "sector": "Construções metálicas",
    "email_area": "Indústria & Produção",
    "location": "Bragança, Bragança",
    "website": "",
    "email": "geral@briferarte.pt",
    "phone": "273326094",
    "source": "https://paginas-nacionais.pt/e/briferarte-serralharia-brigantina-lda/",
    "observation": "Atividade de construções metálicas e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de construções metálicas.",
    "service": "design"
  },
  {
    "company": "Centro de Estudos APP",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Coimbra, Coimbra",
    "website": "https://www.aprevidenciaportuguesa.pt",
    "email": "centrodeestudos@aprevidenciaportuguesa.pt",
    "phone": "239091262",
    "source": "https://www.aprevidenciaportuguesa.pt/centro-de-estudos-app/",
    "observation": "Atividade de centro de estudos e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de centro de estudos.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-17).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-17:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-17:',e.message)}
