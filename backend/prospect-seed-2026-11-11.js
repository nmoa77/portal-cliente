// DUIT — Portugal continental, 2026-11-11. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Carpintaria Mário",
    "sector": "Indústria & Produção",
    "email_area": "Indústria & Produção",
    "location": "Vale de Cavalos, Santarém",
    "website": "https://carpintariamario.pt/",
    "email": "geral@carpintariamario.pt",
    "phone": "249780184",
    "source": "https://carpintariamario.pt/contactos.html",
    "observation": "Carpintaria em Vale de Cavalos.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Quinta da Riba Má",
    "sector": "Turismo & Alojamento",
    "email_area": "Turismo & Alojamento",
    "location": "Vieira do Minho, Braga",
    "website": "https://ribama.pt/",
    "email": "reservas@ribama.pt",
    "phone": "933122336",
    "source": "https://ribama.pt/contact-us",
    "observation": "Turismo rural em Soutelos, Ruivães.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Carpibel",
    "sector": "Indústria & Produção",
    "email_area": "Indústria & Produção",
    "location": "Ponte da Barca, Viana do Castelo",
    "website": "https://carpibel.com/",
    "email": "geral@carpibel.com",
    "phone": "966895707",
    "source": "https://carpibel.com/contactos-carpibel/",
    "observation": "Carpintaria e mobiliário em Lavradas.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Carpilimia",
    "sector": "Indústria & Produção",
    "email_area": "Indústria & Produção",
    "location": "Ponte de Lima, Viana do Castelo",
    "website": "https://carpilimia.com/",
    "email": "geral@carpilimia.com",
    "phone": "258735887",
    "source": "https://www.carpilimia.com/",
    "observation": "Carpintaria e mobiliário por medida.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Carpintaria Sucupira",
    "sector": "Indústria & Produção",
    "email_area": "Indústria & Produção",
    "location": "Sintra, Lisboa",
    "website": "https://sucupira.pt/",
    "email": "geral@sucupira.pt",
    "phone": "210995075",
    "source": "https://www.sucupira.pt/index.php/contacts/",
    "observation": "Carpintaria com showroom em Sintra.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Carplic",
    "sector": "Indústria & Produção",
    "email_area": "Indústria & Produção",
    "location": "Vila Nova de Famalicão, Braga",
    "website": "https://carplic.pt/",
    "email": "geral@carplic.pt",
    "phone": "252320010",
    "source": "https://carplic.pt/pt",
    "observation": "Trabalhos de carpintaria e mobiliário personalizado.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Carpinthouse",
    "sector": "Indústria & Produção",
    "email_area": "Indústria & Produção",
    "location": "Cascais, Lisboa",
    "website": "https://carpinthouse.com/",
    "email": "geral@carpinthouse.com",
    "phone": "930580988",
    "source": "https://carpinthouse.com/",
    "observation": "Carpintaria, restauros e mobiliário por medida.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Lusocarpi",
    "sector": "Indústria & Produção",
    "email_area": "Indústria & Produção",
    "location": "Trofa, Porto",
    "website": "https://lusocarpi.com/",
    "email": "planeamento@lusocarpi.com",
    "phone": "220923400",
    "source": "https://lusocarpi.com/index.php/contactos/",
    "observation": "Carpintaria em Covelas, Trofa.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "GHAF Carpintaria",
    "sector": "Indústria & Produção",
    "email_area": "Indústria & Produção",
    "location": "Setúbal, Setúbal",
    "website": "https://ghafcarpintaria.pt/",
    "email": "contato@ghafcarpintaria.pt",
    "phone": "967636000",
    "source": "https://ghafcarpintaria.pt/",
    "observation": "Carpintaria com serviços em Setúbal e Lisboa.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Quinta do Sardanito de Trás",
    "sector": "Turismo & Alojamento",
    "email_area": "Turismo & Alojamento",
    "location": "Zambujeira do Mar, Beja",
    "website": "https://quintadosardanito.com/",
    "email": "reservas@quintadosardanito.com",
    "phone": "926153405",
    "source": "https://www.quintadosardanito.com/SARDANITO_contactos.aspx",
    "observation": "Turismo rural com casas de campo.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "SoajoNature",
    "sector": "Turismo & Alojamento",
    "email_area": "Turismo & Alojamento",
    "location": "Soajo, Arcos de Valdevez, Viana do Castelo",
    "website": "https://soajonature.com/",
    "email": "reservas@soajonature.com",
    "phone": "912193240",
    "source": "https://soajonature.com/casas/",
    "observation": "Casas de férias em Soajo.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-11).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-11:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-11:',e.message)}
