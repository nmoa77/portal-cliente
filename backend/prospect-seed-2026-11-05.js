// DUIT — Portugal continental, 2026-11-05. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Carpintaria Moreira",
    "sector": "Carpintaria e trabalhos em madeira",
    "email_area": "Indústria & Produção",
    "location": "Oleirinhos, Bragança",
    "website": "https://moreiracarpintaria.pt/",
    "email": "geral@moreiracarpintaria.pt",
    "phone": "273 322 662",
    "source": "https://moreiracarpintaria.pt/",
    "observation": "Empresa de trabalhos em madeira sediada em Oleirinhos.",
    "opportunity": "Apresentação visual de trabalhos de carpintaria.",
    "service": "design"
  },
  {
    "company": "Fisiart — Clínica de Saúde e Bem-estar",
    "sector": "Clínica de fisioterapia e bem-estar",
    "email_area": "Fisioterapia",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://fisiart.pt/",
    "email": "geral@fisiart.pt",
    "phone": "272 345 082",
    "source": "https://fisiart.pt/especialidades/fisioterapia/fisioterapia-domicilio/",
    "observation": "Presta fisioterapia ao domicílio e dispõe de unidades em Castelo Branco e Proença-a-Nova.",
    "opportunity": "Materiais informativos sobre fisioterapia e serviços clínicos.",
    "service": "design"
  },
  {
    "company": "Herdade da Matinha",
    "sector": "Turismo rural e alojamento",
    "email_area": "Turismo & Alojamento",
    "location": "Cercal do Alentejo, Setúbal",
    "website": "https://www.herdadedamatinha.com/",
    "email": "reservas@herdadedamatinha.com",
    "phone": "968 848 579",
    "source": "https://www.herdadedamatinha.com/en/",
    "observation": "Alojamento rural e farmstay em Cercal do Alentejo.",
    "opportunity": "Materiais gráficos para divulgar experiências de alojamento.",
    "service": "design"
  },
  {
    "company": "Casa da Meada — Herdade de Santo Isidro",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Castelo de Vide, Portalegre",
    "website": "https://casadameada.pt/",
    "email": "reservas@casadameada.pt",
    "phone": "925 238 987",
    "source": "https://casadameada.pt/",
    "observation": "Turismo com atividades como caminhadas, pesca e passeios de bicicleta.",
    "opportunity": "Apresentações visuais das atividades e estadias.",
    "service": "design"
  },
  {
    "company": "Herdade dos Moreiros",
    "sector": "Turismo rural e alojamento",
    "email_area": "Turismo & Alojamento",
    "location": "Arronches, Portalegre",
    "website": "https://www.herdadedosmoreiros.com/",
    "email": "reservas@herdadedosmoreiros.com",
    "phone": "939 347 433",
    "source": "https://www.herdadedosmoreiros.com/en/contact",
    "observation": "Alojamento em herdade em Arronches, perto de património histórico.",
    "opportunity": "Materiais de divulgação das experiências e do alojamento.",
    "service": "design"
  },
  {
    "company": "CR-Oral — Clínica de Reabilitação Oral Avançada",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Évora, Évora",
    "website": "https://www.cr-oral.pt/",
    "email": "info@croaevora.pt",
    "phone": "266 106 471",
    "source": "https://www.cr-oral.pt/contacto/",
    "observation": "Clínica de medicina dentária em Évora com tratamentos multidisciplinares.",
    "opportunity": "Peças informativas para explicar os tratamentos dentários.",
    "service": "design"
  },
  {
    "company": "DentalClinic Évora",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Évora, Évora",
    "website": "https://dentalclinic.pt/",
    "email": "rececao@dentalclinic.pt",
    "phone": "266 744 214",
    "source": "https://dentalclinic.pt/corpo-clinico/",
    "observation": "Clínica dentária em Évora com equipa de medicina dentária e estomatologia.",
    "opportunity": "Materiais de apresentação das especialidades clínicas.",
    "service": "design"
  },
  {
    "company": "Carpi Trade",
    "sector": "Construção civil e obras públicas",
    "email_area": "Construção & Engenharia",
    "location": "Barcelos, Braga",
    "website": "https://carpitrade.wixsite.com/carpitrade/",
    "email": "info@carpitrade.pt",
    "phone": "966 778 446",
    "source": "https://carpitrade.wixsite.com/carpitrade/informaes",
    "observation": "Empresa de construção civil e obras públicas com contactos em Barcelos.",
    "opportunity": "Materiais de apresentação de serviços de construção.",
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
