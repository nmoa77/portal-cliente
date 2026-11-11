// DUIT — Portugal continental, 2026-11-11-g. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Carpintaria António Pacheco",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Penafiel, Porto",
    "website": "https://cap.com.pt",
    "email": "geral@cap.com.pt",
    "phone": "255724555",
    "source": "https://www.cap.com.pt/web/contactos/",
    "observation": "Atividade publicamente apresentada: carpintaria; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de carpintaria.",
    "service": "design"
  },
  {
    "company": "Pórtico – Arquitetura e Engenharia",
    "sector": "Arquitetura",
    "email_area": "Construção & Engenharia",
    "location": "Porto, Porto",
    "website": "https://portico.com.pt",
    "email": "geral@portico.com.pt",
    "phone": "222046000",
    "source": "https://portico.com.pt/contacts/",
    "observation": "Atividade publicamente apresentada: arquitetura; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de arquitetura.",
    "service": "design"
  },
  {
    "company": "Helena Morais Arquitetura",
    "sector": "Arquitetura",
    "email_area": "Construção & Engenharia",
    "location": "Lisboa, Lisboa",
    "website": "https://hm-arch.com",
    "email": "geral@hm-arch.com",
    "phone": "914999259",
    "source": "https://hm-arch.com/contactos-contacts/",
    "observation": "Atividade publicamente apresentada: arquitetura; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de arquitetura.",
    "service": "design"
  },
  {
    "company": "Dune Architects",
    "sector": "Arquitetura",
    "email_area": "Construção & Engenharia",
    "location": "Grândola, Setúbal",
    "website": "https://dunearchitects.pt",
    "email": "geral@dunearchitects.pt",
    "phone": "269456219",
    "source": "https://dunearchitects.pt/contactos/",
    "observation": "Atividade publicamente apresentada: arquitetura; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de arquitetura.",
    "service": "design"
  },
  {
    "company": "Carpintaria Portugal",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Lisboa, Lisboa",
    "website": "https://carpintariaportugal.com",
    "email": "geral@carpintariaportugal.com",
    "phone": "912256343",
    "source": "https://carpintariaportugal.com/",
    "observation": "Atividade publicamente apresentada: carpintaria; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de carpintaria.",
    "service": "design"
  },
  {
    "company": "Arqama",
    "sector": "Arquitetura",
    "email_area": "Construção & Engenharia",
    "location": "Massamá, Lisboa",
    "website": "https://arqama.pt",
    "email": "geral@arqama.pt",
    "phone": "214371650",
    "source": "https://www.arqama.pt/contactos",
    "observation": "Atividade publicamente apresentada: arquitetura; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de arquitetura.",
    "service": "design"
  },
  {
    "company": "Vicente e Ramos Carpintaria",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Torres Novas, Santarém",
    "website": "https://vicenteeramos.pt",
    "email": "geral@vicenteeramos.pt",
    "phone": "249831546",
    "source": "https://www.vicenteeramos.pt/contactos/",
    "observation": "Atividade publicamente apresentada: carpintaria; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de carpintaria.",
    "service": "design"
  },
  {
    "company": "Guribema Carpintaria",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Guimarães, Braga",
    "website": "https://guribema.com",
    "email": "geral@guribema.com",
    "phone": "253574026",
    "source": "https://guribema.com/contactos/",
    "observation": "Atividade publicamente apresentada: carpintaria; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de carpintaria.",
    "service": "design"
  },
  {
    "company": "Fisio 21",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Lisboa, Lisboa",
    "website": "https://fisio21.pt",
    "email": "geral@fisio21.pt",
    "phone": "218471192",
    "source": "https://fisio21.pt/contactos/",
    "observation": "Atividade publicamente apresentada: fisioterapia; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de fisioterapia.",
    "service": "design"
  },
  {
    "company": "DOME Arquitetura",
    "sector": "Arquitetura",
    "email_area": "Construção & Engenharia",
    "location": "Guimarães, Braga",
    "website": "https://dome.pt",
    "email": "geral@dome.pt",
    "phone": "253547239",
    "source": "https://www.dome.pt/contactos/",
    "observation": "Atividade publicamente apresentada: arquitetura; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de arquitetura.",
    "service": "design"
  },
  {
    "company": "Consigo Fisioterapia",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Amadora, Lisboa",
    "website": "https://consigofisioterapia.pt",
    "email": "geral@consigofisioterapia.pt",
    "phone": "910640969",
    "source": "https://www.consigofisioterapia.pt/termos-e-condicoes",
    "observation": "Atividade publicamente apresentada: fisioterapia; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de fisioterapia.",
    "service": "design"
  },
  {
    "company": "Groupnew",
    "sector": "Arquitetura e interiores",
    "email_area": "Construção & Engenharia",
    "location": "Sintra, Lisboa",
    "website": "https://groupnew.pt",
    "email": "geral@groupnew.pt",
    "phone": "219108011",
    "source": "https://groupnew.pt/contactos/",
    "observation": "Atividade publicamente apresentada: arquitetura e interiores; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de arquitetura e interiores.",
    "service": "design"
  },
  {
    "company": "ARV Projetos",
    "sector": "Arquitetura e engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Setúbal, Setúbal",
    "website": "https://arv.pt",
    "email": "geral@arv.pt",
    "phone": "265233078",
    "source": "https://arv.pt/contacts/",
    "observation": "Atividade publicamente apresentada: arquitetura e engenharia; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de arquitetura e engenharia.",
    "service": "design"
  },
  {
    "company": "NOA Arquitetos",
    "sector": "Arquitetura",
    "email_area": "Construção & Engenharia",
    "location": "Olhão, Faro",
    "website": "https://noa.org.pt",
    "email": "geral@noa.org.pt",
    "phone": "289721606",
    "source": "https://noa.org.pt/contactos/",
    "observation": "Atividade publicamente apresentada: arquitetura; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de arquitetura.",
    "service": "design"
  },
  {
    "company": "Carpintaria Mirante 55",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Loures, Lisboa",
    "website": "https://carpintariamirante55.pt",
    "email": "geral@m55.pt",
    "phone": "210449327",
    "source": "https://www.carpintariamirante55.pt/contactos",
    "observation": "Atividade publicamente apresentada: carpintaria; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de carpintaria.",
    "service": "design"
  },
  {
    "company": "Housewood",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Vagos, Aveiro",
    "website": "https://housewood.pt",
    "email": "geral@housewood.pt",
    "phone": "925900641",
    "source": "https://housewood.pt/contactos/",
    "observation": "Atividade publicamente apresentada: carpintaria; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de carpintaria.",
    "service": "design"
  },
  {
    "company": "Restart Clinic",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Loures, Lisboa",
    "website": "https://restartclinic.pt",
    "email": "geral@restartclinic.pt",
    "phone": "935480340",
    "source": "https://restartclinic.pt/",
    "observation": "Atividade publicamente apresentada: fisioterapia; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de fisioterapia.",
    "service": "design"
  },
  {
    "company": "R.A.Ramos Oficina",
    "sector": "Oficina automóvel",
    "email_area": "Automóvel",
    "location": "Lisboa, Lisboa",
    "website": "https://oficina.raramos.pt",
    "email": "geral@raramos.pt",
    "phone": "212697870",
    "source": "https://oficina.raramos.pt/",
    "observation": "Atividade publicamente apresentada: oficina automóvel; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de oficina automóvel.",
    "service": "design"
  },
  {
    "company": "Amorcar",
    "sector": "Oficina automóvel",
    "email_area": "Automóvel",
    "location": "Queluz, Lisboa",
    "website": "https://amorcar.pt",
    "email": "geral@amorcar.pt",
    "phone": "214362680",
    "source": "https://amorcar.pt/",
    "observation": "Atividade publicamente apresentada: oficina automóvel; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de oficina automóvel.",
    "service": "design"
  },
  {
    "company": "GDAuto",
    "sector": "Automóvel",
    "email_area": "Automóvel",
    "location": "Torres Vedras, Lisboa",
    "website": "https://gdauto.pt",
    "email": "geral@gdauto.pt",
    "phone": "261249900",
    "source": "https://gdauto.pt/contactos/",
    "observation": "Atividade publicamente apresentada: automóvel; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de automóvel.",
    "service": "design"
  },
  {
    "company": "CVL Auto",
    "sector": "Oficina automóvel",
    "email_area": "Automóvel",
    "location": "Ponte de Lima, Viana do Castelo",
    "website": "https://cvlauto.pt",
    "email": "geral@cvlauto.pt",
    "phone": "258938359",
    "source": "https://cvlauto.pt/contactos/",
    "observation": "Atividade publicamente apresentada: oficina automóvel; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de oficina automóvel.",
    "service": "design"
  },
  {
    "company": "Moutinho Automóveis",
    "sector": "Automóvel",
    "email_area": "Automóvel",
    "location": "Valpaços, Vila Real",
    "website": "https://moutinhoautomoveis.pt",
    "email": "geral@mlauto.pt",
    "phone": "934592260",
    "source": "https://moutinhoautomoveis.pt/contactos/",
    "observation": "Atividade publicamente apresentada: automóvel; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de automóvel.",
    "service": "design"
  },
  {
    "company": "Quinta da Mó",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Terras de Bouro, Braga",
    "website": "https://quintadamo.pt",
    "email": "geral@quintadamo.pt",
    "phone": "961706588",
    "source": "https://quintadamo.pt/contactos/",
    "observation": "Atividade publicamente apresentada: turismo rural; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Auto Nogueira",
    "sector": "Oficina automóvel",
    "email_area": "Automóvel",
    "location": "Braga, Braga",
    "website": "https://autonogueira.pt",
    "email": "geral@autonogueira.pt",
    "phone": "253674078",
    "source": "https://www.autonogueira.pt/contactos/",
    "observation": "Atividade publicamente apresentada: oficina automóvel; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de oficina automóvel.",
    "service": "design"
  },
  {
    "company": "Oliveira Car",
    "sector": "Oficina automóvel",
    "email_area": "Automóvel",
    "location": "Braga, Braga",
    "website": "https://oliveira-car.pt",
    "email": "geral@oliveira-car.pt",
    "phone": "938759070",
    "source": "https://www.oliveira-car.pt/informacao-legal.html",
    "observation": "Atividade publicamente apresentada: oficina automóvel; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de oficina automóvel.",
    "service": "design"
  },
  {
    "company": "AutoBuild",
    "sector": "Oficina automóvel",
    "email_area": "Automóvel",
    "location": "Carnaxide, Lisboa",
    "website": "https://autobuild.pt",
    "email": "geral@autobuild.pt",
    "phone": "214104115",
    "source": "https://www.autobuild.pt/",
    "observation": "Atividade publicamente apresentada: oficina automóvel; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de oficina automóvel.",
    "service": "design"
  },
  {
    "company": "Auto2100",
    "sector": "Oficina automóvel",
    "email_area": "Automóvel",
    "location": "Santarém, Santarém",
    "website": "https://auto2100.pt",
    "email": "geral@auto2100.pt",
    "phone": "243689524",
    "source": "https://auto2100.pt/",
    "observation": "Atividade publicamente apresentada: oficina automóvel; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de oficina automóvel.",
    "service": "design"
  },
  {
    "company": "Auto Prior",
    "sector": "Oficina automóvel",
    "email_area": "Automóvel",
    "location": "Prior Velho, Lisboa",
    "website": "https://autoprior.pt",
    "email": "geral@autoprior.pt",
    "phone": "219491520",
    "source": "https://www.autoprior.pt/",
    "observation": "Atividade publicamente apresentada: oficina automóvel; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de oficina automóvel.",
    "service": "design"
  },
  {
    "company": "Casal de Tralhariz",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Carrazeda de Ansiães, Bragança",
    "website": "https://casaldetralhariz.com",
    "email": "geral@casaldetralhariz.com",
    "phone": "932909622",
    "source": "https://casaldetralhariz.com/contactos/",
    "observation": "Atividade publicamente apresentada: turismo rural; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Casas Econatura",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Abrantes, Santarém",
    "website": "https://casaseconatura.com",
    "email": "geral@casaseconatura.com",
    "phone": "927179648",
    "source": "https://casaseconatura.com/contact/",
    "observation": "Atividade publicamente apresentada: turismo rural; contacto publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de turismo rural.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-11-g).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-11-g:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-11-g:',e.message)}
