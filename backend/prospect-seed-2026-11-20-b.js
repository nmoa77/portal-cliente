// DUIT — 2026-11-20, lote adicional. Fontes públicas verificadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "AML Metalomecânica",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Carragozela, Guarda",
    "website": "https://amlmetais.pt",
    "email": "geral@amlmetais.pt",
    "phone": "961878652",
    "source": "https://amlmetais.pt/sobre/",
    "observation": "A fonte indicada identifica a atividade de metalomecânica e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de metalomecânica.",
    "service": "design"
  },
  {
    "company": "RRMP",
    "sector": "Metalomecânica de precisão",
    "email_area": "Indústria & Produção",
    "location": "Tocha, Coimbra",
    "website": "https://rrmp.eu",
    "email": "geral@rrmp.eu",
    "phone": "231443246",
    "source": "https://rrmp.eu/",
    "observation": "A fonte indicada identifica a atividade de metalomecânica de precisão e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de metalomecânica de precisão.",
    "service": "design"
  },
  {
    "company": "Clínica 3D Physio",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Lisboa, Lisboa",
    "website": "https://clinica3dphysio.pt",
    "email": "geral@clinica3dphysio.pt",
    "phone": "939849615",
    "source": "https://clinica3dphysio.pt/contactos/",
    "observation": "A fonte indicada identifica a atividade de fisioterapia e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de fisioterapia.",
    "service": "design"
  },
  {
    "company": "Fisávin",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Vila Nova de Gaia, Porto",
    "website": "https://fisavin.pt",
    "email": "geral@fisavin.pt",
    "phone": "223709833",
    "source": "https://www.fisavin.pt/contactos.html",
    "observation": "A fonte indicada identifica a atividade de fisioterapia e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de fisioterapia.",
    "service": "design"
  },
  {
    "company": "BeneVital",
    "sector": "Fisioterapia e Pilates clínico",
    "email_area": "Fisioterapia",
    "location": "Lisboa, Lisboa",
    "website": "https://benevital.pt",
    "email": "geral@benevital.pt",
    "phone": "211603148",
    "source": "https://benevital.pt/",
    "observation": "A fonte indicada identifica a atividade de fisioterapia e pilates clínico e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de fisioterapia e pilates clínico.",
    "service": "design"
  },
  {
    "company": "Restart Clinic",
    "sector": "Fisioterapia e osteopatia",
    "email_area": "Fisioterapia",
    "location": "Loures, Lisboa",
    "website": "https://restartclinic.pt",
    "email": "geral@restartclinic.pt",
    "phone": "935480340",
    "source": "https://restartclinic.pt/",
    "observation": "A fonte indicada identifica a atividade de fisioterapia e osteopatia e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de fisioterapia e osteopatia.",
    "service": "design"
  },
  {
    "company": "Damião & Belo",
    "sector": "Construção e reabilitação",
    "email_area": "Construção & Engenharia",
    "location": "Portalegre, Portalegre",
    "website": "https://damiaoebelo.pt",
    "email": "geral@d-b.pt",
    "phone": "245202424",
    "source": "https://damiaoebelo.pt/contactos",
    "observation": "A fonte indicada identifica a atividade de construção e reabilitação e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de construção e reabilitação.",
    "service": "design"
  },
  {
    "company": "Agro121",
    "sector": "Máquinas e assistência agrícola",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Beja, Beja",
    "website": "https://agro121.com",
    "email": "geral@agro121.pt",
    "phone": "284070258",
    "source": "https://www.agro121.com/contactos",
    "observation": "A fonte indicada identifica a atividade de máquinas e assistência agrícola e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de máquinas e assistência agrícola.",
    "service": "design"
  },
  {
    "company": "Agroarea",
    "sector": "Serviços agrícolas",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Beja, Beja",
    "website": "https://agroarea.pt",
    "email": "geral@agroarea.pt",
    "phone": "963592146",
    "source": "https://agroarea.pt/contactos/",
    "observation": "A fonte indicada identifica a atividade de serviços agrícolas e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de serviços agrícolas.",
    "service": "design"
  },
  {
    "company": "Borrego Leonor & Irmão",
    "sector": "Comércio de produtos agrícolas",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Almeirim, Santarém",
    "website": "https://borrego-leonor.com",
    "email": "geral@borregoleonor.com.pt",
    "phone": "243570800",
    "source": "https://www.borrego-leonor.com/contactos",
    "observation": "A fonte indicada identifica a atividade de comércio de produtos agrícolas e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de comércio de produtos agrícolas.",
    "service": "design"
  },
  {
    "company": "Agricert",
    "sector": "Certificação e serviços agrícolas",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Elvas, Portalegre",
    "website": "https://agricert.pt",
    "email": "agricert@agricert.pt",
    "phone": "268625026",
    "source": "https://agricert.pt/pt/contactos",
    "observation": "A fonte indicada identifica a atividade de certificação e serviços agrícolas e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de certificação e serviços agrícolas.",
    "service": "design"
  },
  {
    "company": "Agroreguengos",
    "sector": "Comércio de produtos agropecuários",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Reguengos de Monsaraz, Évora",
    "website": "https://agroreguengos.pt",
    "email": "geral@agroreguengos.pt",
    "phone": "266502991",
    "source": "https://www.agro.basf.pt/pt/Servi%C3%A7os/Onde-comprar/Distribuidores-Beja-%C3%89vora-Faro-Set%C3%BAbal.html",
    "observation": "A fonte indicada identifica a atividade de comércio de produtos agropecuários e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de comércio de produtos agropecuários.",
    "service": "design"
  },
  {
    "company": "Ldagro",
    "sector": "Comércio de produtos fitofarmacêuticos",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Torre dos Coelheiros, Évora",
    "website": "https://ldagro.pt",
    "email": "geral@ldagro.pt",
    "phone": "915520709",
    "source": "https://www.agro.basf.pt/pt/Servi%C3%A7os/Onde-comprar/Distribuidores-Beja-%C3%89vora-Faro-Set%C3%BAbal.html",
    "observation": "A fonte indicada identifica a atividade de comércio de produtos fitofarmacêuticos e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de comércio de produtos fitofarmacêuticos.",
    "service": "design"
  },
  {
    "company": "Protejagro",
    "sector": "Comércio de máquinas agrícolas",
    "email_area": "Agricultura & Agroalimentar",
    "location": "São João de Negrilhos, Beja",
    "website": "https://protejagro.pt",
    "email": "geral@protejagro.pt",
    "phone": "284666425",
    "source": "https://www.agro.basf.pt/pt/Servi%C3%A7os/Onde-comprar/Distribuidores-Beja-%C3%89vora-Faro-Set%C3%BAbal.html",
    "observation": "A fonte indicada identifica a atividade de comércio de máquinas agrícolas e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de comércio de máquinas agrícolas.",
    "service": "design"
  },
  {
    "company": "Martins & Irmão",
    "sector": "Construção e imobiliário",
    "email_area": "Construção & Engenharia",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://martinsirmao.pt",
    "email": "geral@martinsirmao.pt",
    "phone": "272344273",
    "source": "https://www.martinsirmao.pt/contactos.php",
    "observation": "A fonte indicada identifica a atividade de construção e imobiliário e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de construção e imobiliário.",
    "service": "design"
  },
  {
    "company": "Warelog",
    "sector": "Transportes e logística",
    "email_area": "Transportes & Logística",
    "location": "Leixões, Porto",
    "website": "https://warelog.com.pt",
    "email": "roadpricing@warelog.com.pt",
    "phone": "964565320",
    "source": "https://warelog.com.pt/contactos/",
    "observation": "A fonte indicada identifica a atividade de transportes e logística e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de transportes e logística.",
    "service": "design"
  },
  {
    "company": "MR Clinic",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Tomar, Santarém",
    "website": "https://mrclinic.pt",
    "email": "geral@mrclinic.pt",
    "phone": "249098143",
    "source": "https://www.mrclinic.pt/",
    "observation": "A fonte indicada identifica a atividade de medicina dentária e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de medicina dentária.",
    "service": "design"
  },
  {
    "company": "Interiores Viana",
    "sector": "Carpintaria e mobiliário",
    "email_area": "Indústria & Produção",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://interioresviana.com",
    "email": "geral@interioresviana.com",
    "phone": "258731311",
    "source": "https://www.interioresviana.com/index.php/contatos",
    "observation": "A fonte indicada identifica a atividade de carpintaria e mobiliário e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de carpintaria e mobiliário.",
    "service": "design"
  },
  {
    "company": "Carpintaria Rocha",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Neiva, Viana do Castelo",
    "website": "https://carpintariarocha.com",
    "email": "geral@carpintariarocha.com",
    "phone": "258871715",
    "source": "https://www.carpintariarocha.com/pt/2-contactos/",
    "observation": "A fonte indicada identifica a atividade de carpintaria e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de carpintaria.",
    "service": "design"
  },
  {
    "company": "Carpintaria Parente",
    "sector": "Carpintaria e mobiliário",
    "email_area": "Indústria & Produção",
    "location": "Santa Marta de Portuzelo, Viana do Castelo",
    "website": "https://carpintariaparente.com",
    "email": "geral@carpintariaparente.com",
    "phone": "258830484",
    "source": "https://carpintariaparente.com/",
    "observation": "A fonte indicada identifica a atividade de carpintaria e mobiliário e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de carpintaria e mobiliário.",
    "service": "design"
  },
  {
    "company": "SVP Auto",
    "sector": "Peças e comércio automóvel",
    "email_area": "Automóvel",
    "location": "Coimbra, Coimbra",
    "website": "https://svpauto.com",
    "email": "geral@svpauto.com",
    "phone": "239433060",
    "source": "https://svpauto.com/contactos/",
    "observation": "A fonte indicada identifica a atividade de peças e comércio automóvel e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de peças e comércio automóvel.",
    "service": "design"
  },
  {
    "company": "PsiEquilibra",
    "sector": "Clínica de saúde mental",
    "email_area": "Saúde Mental",
    "location": "Évora, Évora",
    "website": "https://psiequilibra.pt",
    "email": "info@psiequilibra.pt",
    "phone": "266082220",
    "source": "https://psiequilibra.pt/",
    "observation": "A fonte indicada identifica a atividade de clínica de saúde mental e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de clínica de saúde mental.",
    "service": "design"
  },
  {
    "company": "Encanto Clínica",
    "sector": "Psicologia e psiquiatria",
    "email_area": "Saúde Mental",
    "location": "Montemor-o-Novo, Évora",
    "website": "https://encantoclinica.pt",
    "email": "geral@encantoclinica.pt",
    "phone": "927465938",
    "source": "https://www.encantoclinica.pt/",
    "observation": "A fonte indicada identifica a atividade de psicologia e psiquiatria e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de psicologia e psiquiatria.",
    "service": "design"
  },
  {
    "company": "Escola Profissional Prática Universal",
    "sector": "Ensino profissional",
    "email_area": "Educação & Formação",
    "location": "Bragança, Bragança",
    "website": "https://eppu.pt",
    "email": "eppu@eppu.edu.pt",
    "phone": "273300970",
    "source": "https://eppu.pt/contactos/",
    "observation": "A fonte indicada identifica a atividade de ensino profissional e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de ensino profissional.",
    "service": "design"
  },
  {
    "company": "Duarte & Amorim",
    "sector": "Metalomecânica e manutenção industrial",
    "email_area": "Indústria & Produção",
    "location": "Aveiro, Aveiro",
    "website": "https://duarteeamorim.com",
    "email": "geral@duarteeamorim.pt",
    "phone": "234422562",
    "source": "https://duarteeamorim.com/",
    "observation": "A fonte indicada identifica a atividade de metalomecânica e manutenção industrial e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de metalomecânica e manutenção industrial.",
    "service": "design"
  },
  {
    "company": "Ecoevasão",
    "sector": "Turismo de aventura",
    "email_area": "Aventura",
    "location": "Carlão, Alijó, Vila Real",
    "website": "https://ecoevasao.pt",
    "email": "geral@ecoevasao.pt",
    "phone": "259658051",
    "source": "https://www.visitportugal.com/pt-pt/content/ecoevas%C3%A3o-desporto-e-aventura-na-natureza-lda",
    "observation": "A fonte indicada identifica a atividade de turismo de aventura e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de turismo de aventura.",
    "service": "design"
  },
  {
    "company": "100DestinosAventura",
    "sector": "Turismo e desporto de aventura",
    "email_area": "Aventura",
    "location": "Braga, Braga",
    "website": "https://100destinosaventura.com",
    "email": "geral@100destinosaventura.com",
    "phone": "253612599",
    "source": "https://www.visitportugal.com/pt-pt/content/100destinosaventura",
    "observation": "A fonte indicada identifica a atividade de turismo e desporto de aventura e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de turismo e desporto de aventura.",
    "service": "design"
  },
  {
    "company": "Transportes MEG",
    "sector": "Transportes rodoviários",
    "email_area": "Transportes & Logística",
    "location": "Tondela, Viseu",
    "website": "https://meg.pt",
    "email": "geral@meg.pt",
    "phone": "232099542",
    "source": "https://meg.pt/contactos/",
    "observation": "A fonte indicada identifica a atividade de transportes rodoviários e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de transportes rodoviários.",
    "service": "design"
  },
  {
    "company": "A Magia de Aprender",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Leiria, Leiria",
    "website": "https://amagiadeaprender.com",
    "email": "geral@amagiadeaprender.com",
    "phone": "910609733",
    "source": "https://www.amagiadeaprender.com/contactos",
    "observation": "A fonte indicada identifica a atividade de centro de estudos e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de centro de estudos.",
    "service": "design"
  },
  {
    "company": "1000 Odisseias",
    "sector": "Turismo de aventura",
    "email_area": "Aventura",
    "location": "Vila Flor, Bragança",
    "website": "https://1000-odisseias.pt",
    "email": "geral@1000-odisseias.pt",
    "phone": "910912743",
    "source": "https://www.visitportugal.com/pt-pt/content/1000-odisseias-atividades-de-lazer-lda",
    "observation": "A fonte indicada identifica a atividade de turismo de aventura e publica o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a atividade de turismo de aventura.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-20).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-20-b:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-20-b:',e.message)}
