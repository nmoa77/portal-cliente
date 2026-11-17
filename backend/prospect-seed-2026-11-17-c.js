// DUIT — Portugal continental, 2026-11-17-c. Fontes públicas identificadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Pesamatrans",
    "sector": "Transportes e logística",
    "email_area": "Transportes & Logística",
    "location": "Coimbra, Coimbra",
    "website": "https://pesamatrans.pt",
    "email": "geral@pesamatrans.pt",
    "phone": "939133911",
    "source": "https://pesamatrans.pt/",
    "observation": "Especialista em transporte e logística de peças automóveis.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços e ofertas ao público.",
    "service": "design"
  },
  {
    "company": "Movig",
    "sector": "Transporte de passageiros",
    "email_area": "Transportes & Logística",
    "location": "Oliveira do Hospital, Coimbra",
    "website": "https://movig.pt",
    "email": "geral@movig.pt",
    "phone": "238607137",
    "source": "https://movig.pt/contactos/",
    "observation": "Aluguer com condutor de viaturas para transporte de passageiros.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços e ofertas ao público.",
    "service": "design"
  },
  {
    "company": "Transportes Braz",
    "sector": "Mudanças e armazenagem",
    "email_area": "Transportes & Logística",
    "location": "Fala, Coimbra",
    "website": "https://www.transportesbraz.com",
    "email": "geral@transportesbraz.pt",
    "phone": "239813060",
    "source": "https://www.transportesbraz.com/contactos",
    "observation": "Presta serviços de mudanças, armazenagem e entrega ao domicílio.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços e ofertas ao público.",
    "service": "design"
  },
  {
    "company": "TCT Transportes",
    "sector": "Distribuição e logística",
    "email_area": "Transportes & Logística",
    "location": "Condeixa-a-Nova, Coimbra",
    "website": "https://tct-transportes.com",
    "email": "geral@tct-transportes.com",
    "phone": "239431047",
    "source": "https://tct-transportes.com/pt",
    "observation": "Realiza transporte de carga completa, grupagem, pacotaria e armazenagem.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços e ofertas ao público.",
    "service": "design"
  },
  {
    "company": "Hotel Rural Santo António",
    "sector": "Hotelaria rural",
    "email_area": "Turismo & Alojamento",
    "location": "Arronches, Portalegre",
    "website": "https://www.santoantoniohotel.com",
    "email": "reservas@santoantoniohotel.com",
    "phone": "245589003",
    "source": "https://www.santoantoniohotel.com/pt/contacto/",
    "observation": "Hotel rural com alojamento em Arronches.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços e ofertas ao público.",
    "service": "design"
  },
  {
    "company": "Rossio Hotel",
    "sector": "Hotelaria",
    "email_area": "Turismo & Alojamento",
    "location": "Portalegre, Portalegre",
    "website": "https://rossiohotel.com",
    "email": "geral@rossiohotel.com",
    "phone": "245082218",
    "source": "https://api.5g-rural.eu/uploads/5_G_RURAL_Interconnectivity_for_all_PT_314c04e07c.pdf",
    "observation": "Hotel em Portalegre identificado em documento de informações úteis de projeto regional.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços e ofertas ao público.",
    "service": "design"
  },
  {
    "company": "Hotel José Régio",
    "sector": "Hotelaria",
    "email_area": "Turismo & Alojamento",
    "location": "Portalegre, Portalegre",
    "website": "https://hoteljoseregio.com",
    "email": "info@hoteljoseregio.com",
    "phone": "245009190",
    "source": "https://api.5g-rural.eu/uploads/5_G_RURAL_Interconnectivity_for_all_PT_314c04e07c.pdf",
    "observation": "Hotel em Portalegre identificado em documento de informações úteis de projeto regional.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços e ofertas ao público.",
    "service": "design"
  },
  {
    "company": "Alojamento Ammaia",
    "sector": "Alojamento turístico",
    "email_area": "Turismo & Alojamento",
    "location": "Portalegre, Portalegre",
    "website": "https://alojamentoammaia.pt",
    "email": "geral@alojamentoammaia.pt",
    "phone": "245082218",
    "source": "https://api.5g-rural.eu/uploads/5_G_RURAL_Interconnectivity_for_all_PT_314c04e07c.pdf",
    "observation": "Alojamento em Portalegre identificado em documento de informações úteis de projeto regional.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços e ofertas ao público.",
    "service": "design"
  },
  {
    "company": "Cedros — Centrajuste",
    "sector": "Formação profissional",
    "email_area": "Educação & Formação",
    "location": "Castro Verde, Beja",
    "website": "https://www.cedros.pt",
    "email": "cedros@cedros.pt",
    "phone": "210868855",
    "source": "https://www.cedros.pt/contactos/",
    "observation": "Entidade de formação com localizações em Palmela, Beja e Castro Verde.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços e ofertas ao público.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-17-c).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-17-c:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-17-c:',e.message)}
