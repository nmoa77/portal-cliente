// DUIT — Portugal continental, 2026-11-13. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "OTOMED",
    "sector": "Fisioterapia e clínica médica",
    "email_area": "Fisioterapia",
    "location": "Évora, Évora",
    "website": "https://otomed.pt",
    "email": "geral@otomed.pt",
    "phone": "965755035",
    "source": "https://www.otomed.pt/",
    "observation": "Clínica médica e fisioterapia em Évora",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Detalhe Carpintaria",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Viseu, Viseu",
    "website": "https://detalhecarpintaria.pt",
    "email": "geral@detalhecarpintaria.pt",
    "phone": "232098360",
    "source": "https://detalhecarpintaria.pt/",
    "observation": "Carpintaria localizada em Viseu",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "ALCORSAL – Tratamento e Lacagem de Metais, Lda.",
    "sector": "Tratamento e lacagem de metais",
    "email_area": "Indústria & Produção",
    "location": "Leiria, Leiria",
    "website": "https://alcorsal.com",
    "email": "info@alcorsal.com",
    "phone": "244024438",
    "source": "https://alcorsal.com/quem-somos/",
    "observation": "Tratamento e lacagem de metais em Monte Redondo",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "CCM – Carlos Calhelhas Metalúrgica, Lda.",
    "sector": "Metalurgia e manutenção industrial",
    "email_area": "Indústria & Produção",
    "location": "Leiria, Leiria",
    "website": "https://ccm.com.pt",
    "email": "info@ccm.com.pt",
    "phone": "244686360",
    "source": "https://ccm.com.pt/pt/contactos",
    "observation": "Montagem e manutenção industrial",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "SBC Carpintaria",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Viseu, Viseu",
    "website": "https://sbc-carpintaria.com",
    "email": "info@sbc-carpintaria.com",
    "phone": "232921834",
    "source": "https://www.sbc-carpintaria.com/contactos/",
    "observation": "Carpintaria na Zona Industrial de Mundão",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Steelfer",
    "sector": "Estruturas metálicas",
    "email_area": "Indústria & Produção",
    "location": "Leiria, Leiria",
    "website": "https://steelfer.pt",
    "email": "geral@steelfer.pt",
    "phone": "244859020",
    "source": "https://steelfer.pt/contactos/",
    "observation": "Unidade de produção na Touria, Leiria",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Indusmade – Indústria de Madeiras, Lda.",
    "sector": "Indústria de madeiras",
    "email_area": "Indústria & Produção",
    "location": "Viseu, Viseu",
    "website": "https://indusmade.com",
    "email": "geral@indusmade.com",
    "phone": "232440565",
    "source": "https://indusmade.com/contactos",
    "observation": "Indústria de madeiras em Barbeita, Viseu",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Duplometal",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Leiria, Leiria",
    "website": "https://duplometal.pt",
    "email": "geral@duplometal.pt",
    "phone": "244812103",
    "source": "https://duplometal.pt/info/contactos/",
    "observation": "Empresa de metalomecânica na Zona Industrial dos Pousos",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Eborae Fisio",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Évora, Évora",
    "website": "https://eboraefisio.pt",
    "email": "eboraefisio@eboraefisio.pt",
    "phone": "",
    "source": "https://physioindex.com/pt/perfil/eborae-fisio-centro-terapeutico-evora",
    "observation": "Centro terapêutico de Évora com contacto publicado em diretório especializado",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços.",
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
 }})();console.log('[crm] seed 2026-11-13:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-13:',e.message)}
