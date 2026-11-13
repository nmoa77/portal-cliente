// DUIT — Portugal continental, 2026-11-13. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Metalome",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Chaves, Vila Real",
    "website": "https://metalome.com",
    "email": "geral@metalome.com",
    "phone": "",
    "source": "https://metalome.com/contactos/",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
    "service": "design"
  },
  {
    "company": "Restart Clinic",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Loures, Lisboa",
    "website": "https://restartclinic.pt",
    "email": "geral@restartclinic.pt",
    "phone": "",
    "source": "https://restartclinic.pt/",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
    "service": "design"
  },
  {
    "company": "SPWOOD",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Barcelos, Braga",
    "website": "https://spwood.pt",
    "email": "geral@spwood.pt",
    "phone": "",
    "source": "https://spwood.pt/contactos/",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
    "service": "design"
  },
  {
    "company": "AMCA Carpintaria",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Grijó, Porto",
    "website": "https://amcacarpintaria.pt",
    "email": "geral@amcacarpintaria.pt",
    "phone": "",
    "source": "https://amcacarpintaria.pt/contactos/",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
    "service": "design"
  },
  {
    "company": "FCF Carpintaria",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Amarante, Porto",
    "website": "https://fcfcarpintaria.com",
    "email": "geral@fcfcarpintaria.com",
    "phone": "",
    "source": "https://fcfcarpintaria.com/contactos/",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
    "service": "design"
  },
  {
    "company": "Lino & Filhos",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Lisboa, Lisboa",
    "website": "https://linoefilhos.pt",
    "email": "geral@linoefilhos.pt",
    "phone": "",
    "source": "https://linoefilhos.pt/",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
    "service": "design"
  },
  {
    "company": "Perfomec",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Sintra, Lisboa",
    "website": "https://perfomec.pt",
    "email": "geral@perfomec.pt",
    "phone": "",
    "source": "https://www.perfomec.pt/contactos",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
    "service": "design"
  },
  {
    "company": "PERUF",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Romariz, Aveiro",
    "website": "https://peruf.pt",
    "email": "peruf@peruf.pt",
    "phone": "",
    "source": "https://www.peruf.pt/contactos",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
    "service": "design"
  },
  {
    "company": "Dunas da Barra",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Lousada, Porto",
    "website": "https://dunasdabarra.pt",
    "email": "geral@dunasdabarra.pt",
    "phone": "",
    "source": "https://dunasdabarra.pt/contactos.php",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
    "service": "design"
  },
  {
    "company": "Carpi JS",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Matosinhos, Porto",
    "website": "https://carpijs.pt",
    "email": "comercial@carpijs.pt",
    "phone": "",
    "source": "https://carpijs.pt/contactos/",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
    "service": "design"
  },
  {
    "company": "Actimeca",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Setúbal, Setúbal",
    "website": "https://actimeca.pt",
    "email": "producao@actimeca.pt",
    "phone": "",
    "source": "https://actimeca.pt/contatos/",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
    "service": "design"
  },
  {
    "company": "MOCOPE",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Monte Córdova, Porto",
    "website": "https://mocope.pt",
    "email": "geral@mocope.pt",
    "phone": "",
    "source": "https://mocope.pt/contacts/",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
    "service": "design"
  },
  {
    "company": "Atelier Arquitetura e Engenharia",
    "sector": "Arquitetura e engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Vila Verde, Braga",
    "website": "https://atelier.pt",
    "email": "geral@atelier.pt",
    "phone": "",
    "source": "https://atelier.pt/contactos/",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
    "service": "design"
  },
  {
    "company": "Atelier de Arquitectura",
    "sector": "Arquitetura",
    "email_area": "Construção & Engenharia",
    "location": "Braga, Braga",
    "website": "https://atelierdearquitectura.com",
    "email": "info@atelierdearquitectura.com",
    "phone": "",
    "source": "https://atelierdearquitectura.com/pt/contactos",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
    "service": "design"
  },
  {
    "company": "SP Arquitectos",
    "sector": "Arquitetura",
    "email_area": "Construção & Engenharia",
    "location": "Lisboa, Lisboa",
    "website": "https://sp-arquitectos.pt",
    "email": "atelier@sp-arquitectos.pt",
    "phone": "",
    "source": "https://www.sp-arquitectos.pt/contacto",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
    "service": "design"
  },
  {
    "company": "CJC Interior Design",
    "sector": "Design de interiores",
    "email_area": "Serviços Profissionais",
    "location": "Lisboa, Lisboa",
    "website": "https://cjc-interiordesign.com",
    "email": "contact@cjc-interiordesign.com",
    "phone": "",
    "source": "https://www.cjc-interiordesign.com/pt/contactos/",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
    "service": "design"
  },
  {
    "company": "AUTODC",
    "sector": "Comércio automóvel e oficina",
    "email_area": "Automóvel",
    "location": "Lisboa, Lisboa",
    "website": "https://autodc.pt",
    "email": "mundoautomovel@autodc.pt",
    "phone": "",
    "source": "https://autodc.pt/contactos/",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
    "service": "design"
  },
  {
    "company": "Raquel Morais Arquitectura",
    "sector": "Arquitetura",
    "email_area": "Construção & Engenharia",
    "location": "Aljezur, Faro",
    "website": "https://raquelmorais.pt",
    "email": "info@raquelmorais.pt",
    "phone": "",
    "source": "https://raquelmorais.pt/contactos.html",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
    "service": "design"
  },
  {
    "company": "RCX Arquitetos",
    "sector": "Arquitetura",
    "email_area": "Construção & Engenharia",
    "location": "Lisboa, Lisboa",
    "website": "https://rcx.pt",
    "email": "bruno.bras@rcx.pt",
    "phone": "",
    "source": "https://rcx.pt/contactos/",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
    "service": "design"
  },
  {
    "company": "Falanstério",
    "sector": "Arquitetura",
    "email_area": "Construção & Engenharia",
    "location": "Lisboa, Lisboa",
    "website": "https://falansterio.pt",
    "email": "atelier@falansterio.pt",
    "phone": "",
    "source": "https://www.falansterio.pt/contactos",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
    "service": "design"
  },
  {
    "company": "Estrutura com Detalhe",
    "sector": "Arquitetura e engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Guimarães, Braga",
    "website": "https://estruturacomdetalhe.pt",
    "email": "geral@estruturacomdetalhe.pt",
    "phone": "",
    "source": "https://estruturacomdetalhe.pt/contactos/",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
    "service": "design"
  },
  {
    "company": "EVA Atelier",
    "sector": "Arquitetura",
    "email_area": "Construção & Engenharia",
    "location": "Porto, Porto",
    "website": "https://eva-atelier.com",
    "email": "global@eva-atelier.com",
    "phone": "",
    "source": "https://www.eva-atelier.com/contactos",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
    "service": "design"
  },
  {
    "company": "Thema Atelier",
    "sector": "Arquitetura e interiores",
    "email_area": "Construção & Engenharia",
    "location": "Porto, Porto",
    "website": "https://themaatelier.com",
    "email": "info@themaatelier.com",
    "phone": "",
    "source": "https://themaatelier.com/contactos",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
    "service": "design"
  },
  {
    "company": "Tânia Daniela Carvalho Psicologia",
    "sector": "Psicologia",
    "email_area": "Saúde Mental",
    "location": "Porto, Porto",
    "website": "https://taniadanielacarvalho.pt",
    "email": "info@taniadanielacarvalho.pt",
    "phone": "",
    "source": "https://www.taniadanielacarvalho.pt/contactos/",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
    "service": "design"
  },
  {
    "company": "Susana Luz Psicologia",
    "sector": "Psicologia",
    "email_area": "Saúde Mental",
    "location": "Carcavelos, Lisboa",
    "website": "https://psicologialuz.pt",
    "email": "geral@psicologialuz.pt",
    "phone": "",
    "source": "https://psicologialuz.pt/contactos/",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
    "service": "design"
  },
  {
    "company": "AutoRia",
    "sector": "Comércio automóvel e oficina",
    "email_area": "Automóvel",
    "location": "Aveiro, Aveiro",
    "website": "https://auto-ria.pt",
    "email": "comercial@auto-ria.pt",
    "phone": "",
    "source": "https://auto-ria.pt/contactos",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
    "service": "design"
  },
  {
    "company": "Gaspar Auto",
    "sector": "Oficina automóvel",
    "email_area": "Automóvel",
    "location": "Lisboa, Lisboa",
    "website": "https://gasparauto.pt",
    "email": "oficina@gasparauto.pt",
    "phone": "",
    "source": "https://gasparauto.pt/contactos/",
    "observation": "Atividade e contacto profissional publicados na página oficial.",
    "opportunity": "Possível criação de materiais de apresentação dos serviços e projetos.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-13).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-13-c:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-13-c:',e.message)}
