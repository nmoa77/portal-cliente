// DUIT — Portugal continental, 2026-11-10-b. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Afonso & Afonso",
    "sector": "Carpintaria e marcenaria",
    "email_area": "Indústria & Produção",
    "location": "Loures, Lisboa",
    "website": "https://www.afonsoeafonso.pt/",
    "email": "geral@afonsoeafonso.pt",
    "phone": "219 827 330",
    "source": "https://www.afonsoeafonso.pt/",
    "observation": "Oficina de carpintaria com projetos 3D e lacagem.",
    "opportunity": "Catálogo gráfico de trabalhos por medida.",
    "service": "design"
  },
  {
    "company": "Quinta das Lavandas",
    "sector": "Agroturismo",
    "email_area": "Turismo & Alojamento",
    "location": "Castelo de Vide, Portalegre",
    "website": "https://quintadaslavandas.pt/",
    "email": "geral@quintadaslavandas.pt",
    "phone": "245 919 133",
    "source": "https://quintadaslavandas.pt/policies/contact-information",
    "observation": "Agroturismo registado em Castelo de Vide.",
    "opportunity": "Peças visuais para divulgar estadias e experiências.",
    "service": "design"
  },
  {
    "company": "Apolinário Turismo Rural",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Castro Vicente, Alfândega da Fé, Bragança",
    "website": "https://apolinarioturismo.com/",
    "email": "geral@apolinarioturismo.com",
    "phone": "937 124 692",
    "source": "https://apolinarioturismo.com/contactos/",
    "observation": "Alojamento rural junto ao rio Sabor.",
    "opportunity": "Materiais de divulgação do alojamento.",
    "service": "design"
  },
  {
    "company": "Dancespot",
    "sector": "Escola de dança",
    "email_area": "Estúdios de Dança",
    "location": "Lisboa, Lisboa",
    "website": "https://dancespot.pt/",
    "email": "geral@dancespot.pt",
    "phone": "915 773 155",
    "source": "https://dancespot.pt/contact-us/",
    "observation": "Escola de dança no Campo Grande.",
    "opportunity": "Peças gráficas para aulas e atividades.",
    "service": "design"
  },
  {
    "company": "Carpintaria A. Faria",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Lago, Amares, Braga",
    "website": "https://www.carpintariafaria.pt/",
    "email": "geral@carpintariafaria.pt",
    "phone": "253 311 741",
    "source": "https://www.carpintariafaria.pt/Contato.aspx",
    "observation": "Carpintaria com instalações em Lago.",
    "opportunity": "Catálogo de soluções de carpintaria.",
    "service": "design"
  },
  {
    "company": "12 Meses Turismo Rural",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Cerdeira, Arganil, Coimbra",
    "website": "https://www.12meses-turismo.com/",
    "email": "info@12meses-turismo.com",
    "phone": "968 068 676",
    "source": "https://www.12meses-turismo.com/contactos.html",
    "observation": "Turismo rural em Cerdeira.",
    "opportunity": "Peças de divulgação das estadias.",
    "service": "design"
  },
  {
    "company": "UDance",
    "sector": "Escola de dança",
    "email_area": "Estúdios de Dança",
    "location": "Lisboa, Lisboa",
    "website": "https://www.udance.pt/",
    "email": "geral@udance.pt",
    "phone": "912 160 967",
    "source": "https://www.udance.pt/contacto",
    "observation": "Escola de dança com várias modalidades em Lisboa.",
    "opportunity": "Peças de apresentação das aulas.",
    "service": "design"
  },
  {
    "company": "Sesmarias Turismo Rural & SPA",
    "sector": "Agroturismo e spa",
    "email_area": "Turismo & Alojamento",
    "location": "Alfundão, Ferreira do Alentejo, Beja",
    "website": "https://www.sesmariasturismoruralspa.com/",
    "email": "info@sesmariasturismoruralspa.com",
    "phone": "284 400 366",
    "source": "https://www.sesmariasturismoruralspa.com/contactos/",
    "observation": "Agroturismo e spa em Alfundão.",
    "opportunity": "Materiais gráficos para experiências e estadias.",
    "service": "design"
  },
  {
    "company": "Três Marias Turismo Rural",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Vila Nova de Milfontes, Beja",
    "website": "https://tresmarias.pt/",
    "email": "info@tresmarias.pt",
    "phone": "965 666 231",
    "source": "https://tresmarias.pt/pt/contactos/",
    "observation": "Turismo rural na Ribeira da Azenha.",
    "opportunity": "Materiais de apresentação das estadias.",
    "service": "design"
  },
  {
    "company": "Casas Econatura",
    "sector": "Turismo rural e glamping",
    "email_area": "Turismo & Alojamento",
    "location": "Mouriscas, Abrantes, Santarém",
    "website": "https://casaseconatura.com/",
    "email": "geral@casaseconatura.com",
    "phone": "927 179 648",
    "source": "https://casaseconatura.com/contact/",
    "observation": "Turismo rural e glamping em Mouriscas.",
    "opportunity": "Peças visuais para experiências de alojamento.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-10-b).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-10-b:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-10-b:',e.message)}
