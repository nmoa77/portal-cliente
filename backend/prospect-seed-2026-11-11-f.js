// DUIT — Portugal continental, 2026-11-11-f. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "VIAMECAN Metalomecânica, Lda.",
    "sector": "Manutenção industrial e metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://viamecan.pt/",
    "email": "geral@viamecan.pt",
    "phone": "258101383",
    "source": "https://viamecan.pt/",
    "observation": "Empresa fundada em 2018; presta serviços de manutenção industrial e construção naval.",
    "opportunity": "Possível criação de apresentação técnica dos serviços industriais.",
    "service": "design"
  },
  {
    "company": "Baltor Steel",
    "sector": "Metalomecânica e engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Vila do Conde, Porto",
    "website": "https://baltorsteel.com/",
    "email": "construcao@baltorsteel.com",
    "phone": "258247935",
    "source": "https://baltorsteel.com/en/contacts/",
    "observation": "Empresa com atividades de metalomecânica, engenharia e construção.",
    "opportunity": "Possível produção de materiais gráficos para apresentação de projetos e serviços.",
    "service": "design"
  },
  {
    "company": "Damião & Belo, Lda.",
    "sector": "Construção civil e reabilitação",
    "email_area": "Construção & Engenharia",
    "location": "Portalegre, Portalegre",
    "website": "https://damiaoebelo.pt/",
    "email": "geral@d-b.pt",
    "phone": "245202424",
    "source": "https://damiaoebelo.pt/contactos",
    "observation": "Empresa de construção e reabilitação sediada na Zona Industrial de Portalegre.",
    "opportunity": "Possível criação de portefólio gráfico de obras e serviços.",
    "service": "design"
  },
  {
    "company": "Margens e Socalcos",
    "sector": "Arquitetura e engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Portalegre, Portalegre",
    "website": "https://margensesocalcos.pt/",
    "email": "geral@margensesocalcos.pt",
    "phone": "964153871",
    "source": "https://margensesocalcos.development.pt/detalhes-servicos/arquitetura",
    "observation": "Empresa com serviços de arquitetura, engenharia e construção em Portalegre.",
    "opportunity": "Possível desenvolvimento de apresentação visual de serviços e projetos.",
    "service": "design"
  },
  {
    "company": "Cliniform Saúde, Lda.",
    "sector": "Serviços de saúde",
    "email_area": "Saúde",
    "location": "Guarda, Guarda",
    "website": "",
    "email": "geral@cliniform.pt",
    "phone": "271211905",
    "source": "https://www.ageas.pt/media/5786/rede-ageas-2025.pdf",
    "observation": "Entidade de saúde identificada na rede de prestadores da Ageas na Guarda.",
    "opportunity": "Possível criação de materiais informativos dos serviços clínicos.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-11-f).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-11-f:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-11-f:',e.message)}
