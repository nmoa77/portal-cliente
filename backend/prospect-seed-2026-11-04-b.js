// DUIT — 2026-11-04; emails empresariais publicados em fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Carpintaria Portugal",
    "sector": "Carpintaria e mobiliário",
    "email_area": "Indústria & Produção",
    "location": "Lisboa, Lisboa",
    "website": "https://carpintariaportugal.com/",
    "email": "geral@carpintariaportugal.com",
    "phone": "912 256 343",
    "source": "https://carpintariaportugal.com/",
    "observation": "Atividade e contacto profissional publicados na fonte indicada.",
    "opportunity": "Criar materiais comerciais e conteúdos visuais para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Oferbraga",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Braga, Braga",
    "website": "https://oferbraga.com/",
    "email": "geral@oferbraga.com",
    "phone": "253 687 361",
    "source": "https://oferbraga.com/contacts",
    "observation": "Atividade e contacto profissional publicados na fonte indicada.",
    "opportunity": "Criar materiais comerciais e conteúdos visuais para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Edibest — Engenharia e Construção",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Tondela, Viseu",
    "website": "",
    "email": "geral@edibestlda.com",
    "phone": "232 822 047",
    "source": "https://ruis.aiccopn.pt/empresas/edibest-engenharia-e-construcao-lda/",
    "observation": "Atividade e contacto profissional publicados na fonte indicada.",
    "opportunity": "Criar materiais comerciais e conteúdos visuais para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "ABTEC — Actividades Construção Civil",
    "sector": "Construção e reabilitação",
    "email_area": "Construção & Engenharia",
    "location": "Oliveira do Hospital, Coimbra",
    "website": "",
    "email": "geral@abtec.pt",
    "phone": "967 530 796",
    "source": "https://ruis.aiccopn.pt/empresas/abtec-actividades-construcao-civil-unip-lda/",
    "observation": "Atividade e contacto profissional publicados na fonte indicada.",
    "opportunity": "Criar materiais comerciais e conteúdos visuais para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Maias — Engenharia e Construção",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Vila Nova de Famalicão, Braga",
    "website": "",
    "email": "geral@maias.com.pt",
    "phone": "934 402 209",
    "source": "https://ruis.aiccopn.pt/empresas/maias-engenharia-e-construcao-lda/",
    "observation": "Atividade e contacto profissional publicados na fonte indicada.",
    "opportunity": "Criar materiais comerciais e conteúdos visuais para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Varela Construção",
    "sector": "Construção e remodelações",
    "email_area": "Construção & Engenharia",
    "location": "Santa Comba Dão, Viseu",
    "website": "",
    "email": "geral@varelaconstrucao.com",
    "phone": "962 560 448",
    "source": "https://ruis.aiccopn.pt/empresas/varela-construcao-lda/",
    "observation": "Atividade e contacto profissional publicados na fonte indicada.",
    "opportunity": "Criar materiais comerciais e conteúdos visuais para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Ambidag",
    "sector": "Engenharia e construção",
    "email_area": "Construção & Engenharia",
    "location": "Viseu, Viseu",
    "website": "",
    "email": "geral@visurb.pt",
    "phone": "917 388 966",
    "source": "https://ruis.aiccopn.pt/empresas/ambidag-lda/",
    "observation": "Atividade e contacto profissional publicados na fonte indicada.",
    "opportunity": "Criar materiais comerciais e conteúdos visuais para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Vectorplano",
    "sector": "Projeto e construção",
    "email_area": "Construção & Engenharia",
    "location": "Guarda, Guarda",
    "website": "",
    "email": "geral@vectorplano.pt",
    "phone": "961 099 807",
    "source": "https://ruis.aiccopn.pt/empresas/vectorplano-projeto-construcao-e-engenharia-lda/",
    "observation": "Atividade e contacto profissional publicados na fonte indicada.",
    "opportunity": "Criar materiais comerciais e conteúdos visuais para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Engioliveira",
    "sector": "Construção e reabilitação",
    "email_area": "Construção & Engenharia",
    "location": "Santa Comba Dão, Viseu",
    "website": "",
    "email": "geral@engioliveira.pt",
    "phone": "966 849 430",
    "source": "https://ruis.aiccopn.pt/empresas/engioliveira-lda/",
    "observation": "Atividade e contacto profissional publicados na fonte indicada.",
    "opportunity": "Criar materiais comerciais e conteúdos visuais para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "MCTU Construtora",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Trofa, Porto",
    "website": "",
    "email": "geral@mctu-construtora.pt",
    "phone": "252 414 059",
    "source": "https://ruis.aiccopn.pt/empresas/mctu-construtora-lda/",
    "observation": "Atividade e contacto profissional publicados na fonte indicada.",
    "opportunity": "Criar materiais comerciais e conteúdos visuais para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Empribuild",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Porto, Porto",
    "website": "",
    "email": "geral@empribuild.pt",
    "phone": "917 249 883",
    "source": "https://ruis.aiccopn.pt/empresas/empribuild-lda/",
    "observation": "Atividade e contacto profissional publicados na fonte indicada.",
    "opportunity": "Criar materiais comerciais e conteúdos visuais para apresentar os serviços.",
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
 console.log('[crm] seed 2026-11-04-b:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-04-b:',e.message)}
