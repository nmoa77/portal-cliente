// DUIT — 2026-11-04; emails empresariais publicados em fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Viriato Pires & Lázaro Pires",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Bragança, Bragança",
    "website": "https://vplp.pt/",
    "email": "geral@vplp.pt",
    "phone": "273326306",
    "source": "https://ruis.aiccopn.pt/empresas/viriato-pires-lazaro-pires-s-a/",
    "observation": "Atividade, localização e contacto profissional publicados na fonte indicada.",
    "opportunity": "Apresentar serviços e projetos em materiais comerciais e conteúdos digitais.",
    "service": "design"
  },
  {
    "company": "Diana Gráfica",
    "sector": "Artes gráficas",
    "email_area": "Artes Gráficas & Comunicação",
    "location": "Évora, Évora",
    "website": "https://www.dianagrafica.com/",
    "email": "geral@dianagrafica.com",
    "phone": "266759490",
    "source": "https://www.dianagrafica.com/contactos",
    "observation": "Atividade, localização e contacto profissional publicados na fonte indicada.",
    "opportunity": "Apresentar serviços e projetos em materiais comerciais e conteúdos digitais.",
    "service": "design"
  },
  {
    "company": "Caldeira & Grilo",
    "sector": "Contabilidade",
    "email_area": "Serviços Profissionais",
    "location": "Évora, Évora",
    "website": "https://www.caldeira-grilo.com/",
    "email": "geral@caldeira-grilo.com",
    "phone": "266701751",
    "source": "https://diretorio.fiz.co/caldeira-grilo-contabilidade-consultadoria-e-infor-504048643",
    "observation": "Atividade, localização e contacto profissional publicados na fonte indicada.",
    "opportunity": "Apresentar serviços e projetos em materiais comerciais e conteúdos digitais.",
    "service": "design"
  },
  {
    "company": "Catileno",
    "sector": "Engenharia e construção",
    "email_area": "Construção & Engenharia",
    "location": "Bragança, Bragança",
    "website": "https://www.catileno.com/",
    "email": "geral@catileno.com",
    "phone": "273094662",
    "source": "https://nerba.pt/site/project/catileno-engenharia-e-construcao/",
    "observation": "Atividade, localização e contacto profissional publicados na fonte indicada.",
    "opportunity": "Apresentar serviços e projetos em materiais comerciais e conteúdos digitais.",
    "service": "design"
  },
  {
    "company": "Analizza",
    "sector": "Consultoria empresarial e contabilidade",
    "email_area": "Serviços Profissionais",
    "location": "Évora, Évora",
    "website": "https://analizza.pt/",
    "email": "geral@analizza.pt",
    "phone": "936392209",
    "source": "https://analizza.pt/",
    "observation": "Atividade, localização e contacto profissional publicados na fonte indicada.",
    "opportunity": "Apresentar serviços e projetos em materiais comerciais e conteúdos digitais.",
    "service": "design"
  },
  {
    "company": "GCE Negócios",
    "sector": "Contabilidade e consultoria",
    "email_area": "Serviços Profissionais",
    "location": "Évora, Évora",
    "website": "https://gcenegocios.pt/",
    "email": "geral@gcenegocios.pt",
    "phone": "266707729",
    "source": "https://gcenegocios.pt/",
    "observation": "Atividade, localização e contacto profissional publicados na fonte indicada.",
    "opportunity": "Apresentar serviços e projetos em materiais comerciais e conteúdos digitais.",
    "service": "design"
  },
  {
    "company": "Contevora",
    "sector": "Contabilidade e consultoria",
    "email_area": "Serviços Profissionais",
    "location": "Évora, Évora",
    "website": "https://contevora.pt/",
    "email": "geral@contevora.pt",
    "phone": "266741383",
    "source": "https://contevora.pt/contactos-2/",
    "observation": "Atividade, localização e contacto profissional publicados na fonte indicada.",
    "opportunity": "Apresentar serviços e projetos em materiais comerciais e conteúdos digitais.",
    "service": "design"
  },
  {
    "company": "Carvalho & Fonseca",
    "sector": "Construção e remodelação",
    "email_area": "Construção & Engenharia",
    "location": "Amarante, Porto",
    "website": "https://cfconstrucao.pt/",
    "email": "geral@cfconstrucao.pt",
    "phone": "913534617",
    "source": "https://ruis.aiccopn.pt/empresas/carvalho-fonseca-construcao-civil-lda/",
    "observation": "Atividade, localização e contacto profissional publicados na fonte indicada.",
    "opportunity": "Apresentar serviços e projetos em materiais comerciais e conteúdos digitais.",
    "service": "design"
  },
  {
    "company": "Taskdone",
    "sector": "Engenharia e construção",
    "email_area": "Construção & Engenharia",
    "location": "Queijas, Lisboa",
    "website": "https://taskdone.pt/",
    "email": "geral@taskdone.pt",
    "phone": "210998097",
    "source": "https://ruis.aiccopn.pt/empresas/taskdone-engenharia-e-construcao-lda/",
    "observation": "Atividade, localização e contacto profissional publicados na fonte indicada.",
    "opportunity": "Apresentar serviços e projetos em materiais comerciais e conteúdos digitais.",
    "service": "design"
  },
  {
    "company": "CIQ Engenharia e Construção",
    "sector": "Construção e reabilitação",
    "email_area": "Construção & Engenharia",
    "location": "Coimbra, Coimbra",
    "website": "https://ciq-ec.pt/",
    "email": "geral@ciq-ec.pt",
    "phone": "239832198",
    "source": "https://ruis.aiccopn.pt/empresas/ciq-engenharia-e-construcao-lda/",
    "observation": "Atividade, localização e contacto profissional publicados na fonte indicada.",
    "opportunity": "Apresentar serviços e projetos em materiais comerciais e conteúdos digitais.",
    "service": "design"
  },
  {
    "company": "Costa & Carreira",
    "sector": "Construção civil e obras públicas",
    "email_area": "Construção & Engenharia",
    "location": "Ribeira de Pena, Vila Real",
    "website": "https://costaecarreira.com/",
    "email": "geral@costaecarreira.com",
    "phone": "259493367",
    "source": "https://ruis.aiccopn.pt/empresas/costa-carreira-lda/",
    "observation": "Atividade, localização e contacto profissional publicados na fonte indicada.",
    "opportunity": "Apresentar serviços e projetos em materiais comerciais e conteúdos digitais.",
    "service": "design"
  },
  {
    "company": "Construtora de Coimbrões",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Viseu, Viseu",
    "website": "https://construtoradecoimbroes.pt/",
    "email": "geral@construtoradecoimbroes.pt",
    "phone": "232414419",
    "source": "https://ruis.aiccopn.pt/empresas/construtora-de-coimbroes-lda/",
    "observation": "Atividade, localização e contacto profissional publicados na fonte indicada.",
    "opportunity": "Apresentar serviços e projetos em materiais comerciais e conteúdos digitais.",
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
