// DUIT — 2026-10-30 lote c. Emails profissionais publicados em fontes empresariais.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Azores4Fun",
    "sector": "Animação turística e alojamento",
    "email_area": "Aventura",
    "location": "Horta, Açores",
    "website": "https://azores4fun.com/",
    "email": "info@azores4fun.com",
    "phone": "934 993 770",
    "source": "https://azores4fun.com/contact",
    "observation": "Operador de animação turística e alojamento no Faial.",
    "opportunity": "Criar materiais para divulgação de experiências.",
    "service": "ambas"
  },
  {
    "company": "Polinox",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Viseu, Viseu",
    "website": "https://polinox.pt/",
    "email": "geral@polinox.pt",
    "phone": "232 089 436",
    "source": "https://polinox.pt/",
    "observation": "Fabrico de estruturas, portões e peças metálicas à medida.",
    "opportunity": "Criar fichas visuais de soluções metálicas.",
    "service": "design"
  },
  {
    "company": "Konstrumat",
    "sector": "Materiais de construção",
    "email_area": "Comércio & Retalho",
    "location": "Funchal, Madeira",
    "website": "https://konstrumat.pt/",
    "email": "geral@konstrumat.pt",
    "phone": "291 143 929",
    "source": "https://konstrumat.pt/contactos",
    "observation": "Comercialização de materiais de construção com delegação no Funchal.",
    "opportunity": "Criar catálogos e suportes comerciais de produtos.",
    "service": "design"
  },
  {
    "company": "Valema",
    "sector": "Construção em madeira",
    "email_area": "Construção & Engenharia",
    "location": "Gandra, Valença, Viana do Castelo",
    "website": "https://www.valema.pt/",
    "email": "geral@valema.pt",
    "phone": "251 031 262",
    "source": "https://www.valema.pt/contactos",
    "observation": "Desenvolve estruturas e coberturas em madeira.",
    "opportunity": "Criar apresentações de projetos e soluções.",
    "service": "design"
  },
  {
    "company": "Permanente Caprice",
    "sector": "Construção civil e remodelações",
    "email_area": "Construção & Engenharia",
    "location": "Machico, Madeira",
    "website": "https://www.pconstrucoes.pt/",
    "email": "geral@pconstrucoes.pt",
    "phone": "968 016 710",
    "source": "https://www.pconstrucoes.pt/contactos/",
    "observation": "Executa construção e remodelação de imóveis em Machico.",
    "opportunity": "Criar materiais de apresentação de obras.",
    "service": "design"
  },
  {
    "company": "Clínica Médica José Viana",
    "sector": "Clínica médica",
    "email_area": "Saúde",
    "location": "Faro, Faro",
    "website": "https://clinicaviana.pt/",
    "email": "geral@clinicaviana.pt",
    "phone": "289 821 624",
    "source": "https://clinicaviana.pt/",
    "observation": "Clínica com especialidades médicas e fisioterapia pélvica.",
    "opportunity": "Criar materiais informativos de especialidades.",
    "service": "design"
  },
  {
    "company": "Shadows Arquitetura",
    "sector": "Arquitetura e construção",
    "email_area": "Construção & Engenharia",
    "location": "São João da Madeira, Aveiro",
    "website": "https://www.shadows.pt/",
    "email": "geral@shadows.pt",
    "phone": "933 693 815",
    "source": "https://www.shadows.pt/contactos",
    "observation": "Estúdio de arquitetura, interiores, engenharia e construção.",
    "opportunity": "Criar suportes de apresentação de projetos.",
    "service": "design"
  },
  {
    "company": "GlobalTools",
    "sector": "Distribuição de consumíveis industriais",
    "email_area": "Indústria & Produção",
    "location": "Viseu, Viseu",
    "website": "https://www.globaltools.pt/",
    "email": "geral@globaltools.pt",
    "phone": "232 479 469",
    "source": "https://www.globaltools.pt/sobre-nos/",
    "observation": "Distribui consumíveis para construção, metalomecânica e outros setores.",
    "opportunity": "Criar fichas comerciais de gamas de produtos.",
    "service": "design"
  },
  {
    "company": "Ent'Artes",
    "sector": "Escola de dança",
    "email_area": "Estúdios de Dança",
    "location": "Braga, Braga",
    "website": "https://entartes.pt/",
    "email": "geral@entartes.pt",
    "phone": "964 693 247",
    "source": "https://entartes.pt/Contactos.php",
    "observation": "Escola de dança certificada pela Royal Academy of Dance.",
    "opportunity": "Criar materiais de divulgação de aulas e inscrições.",
    "service": "ambas"
  },
  {
    "company": "Casa da Baía Guest House",
    "sector": "Alojamento local",
    "email_area": "Turismo & Alojamento",
    "location": "Horta, Açores",
    "website": "https://www.casadabaia.com",
    "email": "geral@casadabaia.com",
    "phone": "969 656 355",
    "source": "https://ala.pt/alojamentos",
    "observation": "Alojamento na Rua Vasco da Gama, Horta.",
    "opportunity": "Criar peças de apresentação do alojamento.",
    "service": "design"
  },
  {
    "company": "Casa do António",
    "sector": "Alojamento local",
    "email_area": "Turismo & Alojamento",
    "location": "São Jorge, Açores",
    "website": "https://www.casadoantonio.com",
    "email": "geral@casadoantonio.com",
    "phone": "919 576 290",
    "source": "https://ala.pt/alojamentos",
    "observation": "Alojamento na ilha de São Jorge, registado em diretório regional.",
    "opportunity": "Criar suportes digitais para informação aos hóspedes.",
    "service": "design"
  },
  {
    "company": "Loving Strangers Hostel",
    "sector": "Hostel",
    "email_area": "Turismo & Alojamento",
    "location": "Madalena, Pico, Açores",
    "website": "https://www.lovingstrangershostel.com",
    "email": "info@lovingstrangershostel.com",
    "phone": "915 111 011",
    "source": "https://ala.pt/alojamentos",
    "observation": "Hostel na Madalena do Pico.",
    "opportunity": "Criar materiais de apresentação e informação para hóspedes.",
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
 const hasEmail=db.prepare('SELECT 1 FROM users WHERE lower(trim(email))=? LIMIT 1'),hasCompany=db.prepare('SELECT 1 FROM users WHERE is_prospect=1 AND lower(trim(company))=? LIMIT 1');
 const addUser=db.prepare('INSERT INTO users(name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES(?,?,?,?,?,?,1,0)');
 const addCrm=db.prepare("INSERT INTO prospect_crm(user_id,sector,email_area,location,website,instagram,opportunity,idea,email_observation,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,outreach_channel,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))");
 const pwd=bcrypt.hashSync(crypto.randomBytes(24).toString('hex'),10),seenE=new Set(),seenC=new Set(),seenS=new Set();
 let added=0,skipped=0;
 db.transaction(()=>{for(const x of L){
  const email=x.email.trim().toLowerCase(),company=x.company.trim().toLowerCase(),domain=email.split('@')[1],site=normSite(x.website);
  if(!domain||/^(gmail\.com|hotmail\.com|outlook\.com|yahoo\.[a-z.]+|icloud\.com|sapo\.pt)$/i.test(domain)||/^no-?reply@/i.test(email)||!x.source||!x.email_area||wasDeleted(email)||oldEmails.has(email)||oldCompanies.has(company)||(site&&oldSites.has(site))||seenE.has(email)||seenC.has(company)||(site&&seenS.has(site))||hasEmail.get(email)||hasCompany.get(company)||(site&&sites.has(site))){skipped++;continue}
  seenE.add(email);seenC.add(company);if(site)seenS.add(site);
  const service=x.service==='design'?'design gráfico e materiais comerciais':x.service==='redes'?'gestão de redes sociais':'design gráfico e comunicação nas redes sociais';
  const proposal='Olá, sou o Nuno, da DUIT. Estive a conhecer a '+x.company+'. Posso ajudar com '+service+', nomeadamente com '+x.opportunity.toLowerCase()+' Se fizer sentido para si, terei gosto em conversar consigo. Cumprimentos, Nuno.';
  const id=Number(addUser.run(x.company,email,pwd,'client',x.company,x.phone||'').lastInsertRowid);
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-10-30).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');
  added++;
 }})();
 console.log('[crm] seed 2026-10-30-c:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-10-30-c:',e.message)}
