// DUIT — Portugal continental, 2026-11-16-b. Contactos públicos nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Nomogno",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Viseu, Viseu",
    "website": "https://nomogno.pt",
    "email": "geral@nomogno.pt",
    "phone": "232412225",
    "source": "https://nomogno.pt/contactos/",
    "observation": "Empresa de carpintaria com mais de 45 anos de experiência.",
    "opportunity": "Possível desenvolvimento de catálogo gráfico de trabalhos e soluções.",
    "service": "design"
  },
  {
    "company": "Agro 121",
    "sector": "Máquinas agrícolas e assistência",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Beja, Beja",
    "website": "https://www.agro121.com",
    "email": "geral@agro121.pt",
    "phone": "284070258",
    "source": "https://www.agro121.com/contactos",
    "observation": "Comercializa equipamentos e disponibiliza oficina, peças e assistência técnica.",
    "opportunity": "Possível criação de materiais gráficos para divulgação de serviços e equipamentos.",
    "service": "design"
  },
  {
    "company": "Ensiguarda — Escola Profissional da Guarda",
    "sector": "Ensino e formação profissional",
    "email_area": "Educação & Formação",
    "location": "Guarda, Guarda",
    "website": "https://www.ensiguarda.com",
    "email": "geral@ensiguarda.com",
    "phone": "271237034",
    "source": "https://www.ensiguarda.com/contactos/",
    "observation": "Escola profissional sediada na Guarda, com oferta de cursos profissionais.",
    "opportunity": "Possível apoio gráfico à divulgação de cursos e inscrições.",
    "service": "design"
  },
  {
    "company": "Borrego Leonor & Irmão",
    "sector": "Comércio de produtos agrícolas",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Almeirim, Santarém",
    "website": "https://www.borrego-leonor.com",
    "email": "geral@borregoleonor.com.pt",
    "phone": "243570800",
    "source": "https://www.borrego-leonor.com/contactos",
    "observation": "Empresa familiar com lojas em Almeirim, Salvaterra de Magos e Beja.",
    "opportunity": "Possível criação de peças gráficas para apresentação de gamas e lojas.",
    "service": "design"
  },
  {
    "company": "Agroreguengos",
    "sector": "Comércio de produtos agropecuários",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Reguengos de Monsaraz, Évora",
    "website": "https://www.agroreguengos.pt",
    "email": "geral@agroreguengos.pt",
    "phone": "266502991",
    "source": "https://www.agro.basf.pt/pt/Servi%C3%A7os/Onde-comprar/Distribuidores-Beja-%C3%89vora-Faro-Set%C3%BAbal.html",
    "observation": "Identificada como distribuidora agrícola na rede de parceiros da BASF.",
    "opportunity": "Possível criação de materiais gráficos para comunicação de produtos e serviços.",
    "service": "design"
  },
  {
    "company": "CABB — Cooperativa Agrícola de Beja e Brinches",
    "sector": "Cooperativa agrícola",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Beja, Beja",
    "website": "https://coopbejabrinches.pt/s/",
    "email": "info@coopbejabrinches.pt",
    "phone": "284322051",
    "source": "https://www.agro.basf.pt/pt/Servi%C3%A7os/Onde-comprar/Distribuidores-Beja-%C3%89vora-Faro-Set%C3%BAbal.html",
    "observation": "Cooperativa agrícola identificada como distribuidora pela BASF.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços aos associados.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-16-b).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-16-b:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-16-b:',e.message)}
