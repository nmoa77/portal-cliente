// DUIT — Portugal continental, 2026-11-06-c. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Aqua6",
    "sector": "Construção de piscinas e wellness",
    "email_area": "Construção & Engenharia",
    "location": "Évora, Évora",
    "website": "https://aqua6.pt/",
    "email": "geral@aqua6.pt",
    "phone": "926 388 788",
    "source": "https://newhomebeja.pt/conecte-se/",
    "observation": "Empresa de piscinas e espaços wellness.",
    "opportunity": "Peças de apresentação de projetos.",
    "service": "design"
  },
  {
    "company": "Estruturas em Movimento",
    "sector": "Construção sustentável",
    "email_area": "Construção & Engenharia",
    "location": "Ferreira do Alentejo, Beja",
    "website": "https://estruturasemmovimento.pt/",
    "email": "geral@estruturasemmovimento.pt",
    "phone": "926 432 886",
    "source": "https://newhomebeja.pt/conecte-se/",
    "observation": "Atividade de construção civil.",
    "opportunity": "Portefólio visual de obras.",
    "service": "design"
  },
  {
    "company": "Giobras",
    "sector": "Construção e engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Beja, Beja",
    "website": "https://giobras.pt/",
    "email": "orcamentos@giobras.pt",
    "phone": "284 106 823",
    "source": "https://giobras.pt/contactos/",
    "observation": "Dispõe de operações de construção em várias localidades.",
    "opportunity": "Materiais gráficos para serviços e obras.",
    "service": "design"
  },
  {
    "company": "Almojanda 3 Olive Tree",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Portalegre, Portalegre",
    "website": "https://www.almojanda3olivetree.com/",
    "email": "geral@almojanda3olivetree.com",
    "phone": "963 474 524",
    "source": "https://www.almojanda3olivetree.com/contactos/",
    "observation": "Turismo rural com três casas de campo.",
    "opportunity": "Peças gráficas para experiências de alojamento.",
    "service": "design"
  },
  {
    "company": "Casa da Urra",
    "sector": "Turismo e enoturismo",
    "email_area": "Turismo & Alojamento",
    "location": "Urra, Portalegre",
    "website": "https://casadaurra.com/",
    "email": "geral@casadaurra.com",
    "phone": "917 614 363",
    "source": "https://casadaurra.com/contactos/",
    "observation": "Alojamento e adega em Urra.",
    "opportunity": "Materiais de apresentação de estadias e vinhos.",
    "service": "design"
  },
  {
    "company": "Nomogno",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Viseu, Viseu",
    "website": "https://nomogno.pt/",
    "email": "geral@nomogno.pt",
    "phone": "232 412 225",
    "source": "https://nomogno.pt/contactos/",
    "observation": "Carpintaria com mais de 45 anos de experiência.",
    "opportunity": "Catálogo de soluções de carpintaria.",
    "service": "design"
  },
  {
    "company": "ION Construções",
    "sector": "Construção e remodelação",
    "email_area": "Construção & Engenharia",
    "location": "Penedo Gordo, Beja",
    "website": "https://ionconstrucoes.com/",
    "email": "geral@ionconstrucoes.com",
    "phone": "963 914 512",
    "source": "https://ionconstrucoes.com/contacto/",
    "observation": "Empresa de construção no Alentejo e Algarve.",
    "opportunity": "Portefólio de projetos e remodelações.",
    "service": "design"
  },
  {
    "company": "Dona Maria Guesthouse",
    "sector": "Alojamento local",
    "email_area": "Turismo & Alojamento",
    "location": "Portalegre, Portalegre",
    "website": "https://www.donamariagh.com/",
    "email": "geral@donamariagh.com",
    "phone": "245 331 212",
    "source": "https://www.donamariagh.com/",
    "observation": "Alojamento no centro histórico de Portalegre.",
    "opportunity": "Peças gráficas para promoção de estadias.",
    "service": "design"
  },
  {
    "company": "Carpintaria VT",
    "sector": "Fabrico de mobiliário",
    "email_area": "Indústria & Produção",
    "location": "Vouzela, Viseu",
    "website": "https://carpintariavt.pt/",
    "email": "contacto@carpintariavt.pt",
    "phone": "928 360 053",
    "source": "https://carpintariavt.pt/",
    "observation": "Fabrico de mobiliário personalizado.",
    "opportunity": "Catálogo de móveis por medida.",
    "service": "design"
  },
  {
    "company": "Dança Leiria",
    "sector": "Escola de dança",
    "email_area": "Estúdios de Dança",
    "location": "Leiria, Leiria",
    "website": "https://www.dancaleiria.pt/",
    "email": "geral@dancaleiria.pt",
    "phone": "244 854 391",
    "source": "https://www.dancaleiria.pt/contactos/",
    "observation": "Escola e associação de dança em Leiria.",
    "opportunity": "Peças de divulgação de aulas e eventos.",
    "service": "design"
  },
  {
    "company": "PBR Automóveis",
    "sector": "Stand e oficina automóvel",
    "email_area": "Automóvel",
    "location": "Bragança, Bragança",
    "website": "https://pbrautomoveis.pt/",
    "email": "geral@pbrautomoveis.pt",
    "phone": "273 322 277",
    "source": "https://pbrautomoveis.pt/",
    "observation": "Stand e oficina multimarcas em Bragança.",
    "opportunity": "Materiais de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Chamauto",
    "sector": "Stand e oficina automóvel",
    "email_area": "Automóvel",
    "location": "Bragança, Bragança",
    "website": "https://www.chamauto.pt/",
    "email": "diogo@chamauto.pt",
    "phone": "273 312 903",
    "source": "https://www.chamauto.pt/pagina/oficina/1202",
    "observation": "Oficina com serviços de mecânica e colisão.",
    "opportunity": "Peças informativas para serviços de oficina.",
    "service": "design"
  },
  {
    "company": "Duafar",
    "sector": "Construção e metalomecânica",
    "email_area": "Construção & Engenharia",
    "location": "Escalos de Cima, Castelo Branco",
    "website": "https://duafar.com/",
    "email": "comercial@duafar.com",
    "phone": "272 425 900",
    "source": "https://duafar.com/",
    "observation": "Empresa com projetos de construção e metalomecânica.",
    "opportunity": "Dossiês de apresentação de projetos.",
    "service": "design"
  },
  {
    "company": "Masterfor",
    "sector": "Stand e oficina automóvel",
    "email_area": "Automóvel",
    "location": "Bragança, Bragança",
    "website": "https://www.masterfor.pt/",
    "email": "geral@masterfor.pt",
    "phone": "934 667 559",
    "source": "https://www.masterfor.pt/",
    "observation": "Oficina e venda de automóveis em Bragança.",
    "opportunity": "Materiais de comunicação de serviços e viaturas.",
    "service": "design"
  },
  {
    "company": "Carge",
    "sector": "Stand e oficina automóvel",
    "email_area": "Automóvel",
    "location": "Bragança, Bragança",
    "website": "https://carge.pt/",
    "email": "carge@carge.pt",
    "phone": "273 313 588",
    "source": "https://carge.pt/site/contactos/",
    "observation": "Empresa de comércio e reparação automóvel.",
    "opportunity": "Peças gráficas para serviços e campanhas.",
    "service": "design"
  },
  {
    "company": "Auto Imperial Bragança",
    "sector": "Stand e oficina automóvel",
    "email_area": "Automóvel",
    "location": "Bragança, Bragança",
    "website": "https://autoimperial.pt/",
    "email": "geral@autoimperial.eu",
    "phone": "273 302 600",
    "source": "https://autoimperial.pt/contacto/",
    "observation": "Stand e oficina em Bragança e Mirandela.",
    "opportunity": "Materiais gráficos para serviços de oficina.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-06-c).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');
  added++;
 }})();
 console.log('[crm] seed 2026-11-06-c:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-06-c:',e.message)}
