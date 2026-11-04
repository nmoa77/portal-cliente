// DUIT — 2026-11-04; emails empresariais publicados em fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Transportes Guardense",
    "sector": "Transporte rodoviário e logística",
    "email_area": "Transportes & Logística",
    "location": "Guarda, Guarda",
    "website": "https://tgtrans.pt/",
    "email": "info@tgtrans.pt",
    "phone": "271239487",
    "source": "https://tgtrans.pt/",
    "observation": "Atividade, localização e email profissional publicados no website oficial.",
    "opportunity": "Apresentar serviços e projetos em suportes gráficos comerciais.",
    "service": "design"
  },
  {
    "company": "Translifty",
    "sector": "Transportes e logística",
    "email_area": "Transportes & Logística",
    "location": "Guarda, Guarda",
    "website": "https://translifty.com/",
    "email": "info@translifty.com",
    "phone": "964652077",
    "source": "https://translifty.com/contactos/",
    "observation": "Atividade, localização e email profissional publicados no website oficial.",
    "opportunity": "Apresentar serviços e projetos em suportes gráficos comerciais.",
    "service": "design"
  },
  {
    "company": "DICARGO Transportes",
    "sector": "Transportes de mercadorias",
    "email_area": "Transportes & Logística",
    "location": "Guarda, Guarda",
    "website": "https://www.dicargo.pt/",
    "email": "dicargo@dicargo.pt",
    "phone": "232650020",
    "source": "https://www.dicargo.pt/contactos/",
    "observation": "Atividade, localização e email profissional publicados no website oficial.",
    "opportunity": "Apresentar serviços e projetos em suportes gráficos comerciais.",
    "service": "design"
  },
  {
    "company": "Metalome",
    "sector": "Componentes metalúrgicos",
    "email_area": "Indústria & Produção",
    "location": "Chaves, Vila Real",
    "website": "https://metalome.com/",
    "email": "geral@metalome.com",
    "phone": "",
    "source": "https://metalome.com/contactos/",
    "observation": "Atividade, localização e email profissional publicados no website oficial.",
    "opportunity": "Apresentar serviços e projetos em suportes gráficos comerciais.",
    "service": "design"
  },
  {
    "company": "Carpintaria Parente",
    "sector": "Carpintaria e mobiliário",
    "email_area": "Indústria & Produção",
    "location": "Santa Marta de Portuzelo, Viana do Castelo",
    "website": "https://carpintariaparente.com/",
    "email": "geral@carpintariaparente.com",
    "phone": "258830484",
    "source": "https://carpintariaparente.com/pt/home",
    "observation": "Atividade, localização e email profissional publicados no website oficial.",
    "opportunity": "Apresentar serviços e projetos em suportes gráficos comerciais.",
    "service": "design"
  },
  {
    "company": "Metalomecânica MJS",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Santa Maria de Lamas, Aveiro",
    "website": "https://metalomecanica-mjs.com/",
    "email": "geral@metalomecanica-mjs.com",
    "phone": "227445071",
    "source": "https://metalomecanica-mjs.com/contatos/",
    "observation": "Atividade, localização e email profissional publicados no website oficial.",
    "opportunity": "Apresentar serviços e projetos em suportes gráficos comerciais.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-04).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');
  added++;
 }})();
 console.log('[crm] seed 2026-11-04:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-04:',e.message)}
