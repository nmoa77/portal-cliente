// DUIT — Portugal continental, 2026-11-11-b. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "DYM",
    "sector": "Fabrico de mobiliário por medida",
    "email_area": "Indústria & Produção",
    "location": "Braga, Braga",
    "website": "https://dym.pt/",
    "email": "geral@dym.pt",
    "phone": "253785593",
    "source": "https://dym.pt/contactos/",
    "observation": "Fabrico de mobiliário por medida com fábrica em Vimieiro.",
    "opportunity": "Catálogo comercial de mobiliário e projetos.",
    "service": "design"
  },
  {
    "company": "Uood",
    "sector": "Carpintaria e decoração",
    "email_area": "Indústria & Produção",
    "location": "Paços de Ferreira, Porto",
    "website": "https://uood.pt/",
    "email": "info@uood.pt",
    "phone": "255099617",
    "source": "https://uood.pt/contactos/",
    "observation": "Mobiliário, carpintaria interior e decoração por medida.",
    "opportunity": "Apresentação gráfica das soluções por medida.",
    "service": "design"
  },
  {
    "company": "Madeitrofa",
    "sector": "Comércio de ferragens",
    "email_area": "Comércio & Retalho",
    "location": "Trofa, Porto",
    "website": "https://madeitrofa.pt/",
    "email": "madeitrofa@madeitrofa.pt",
    "phone": "252413017",
    "source": "https://madeitrofa.pt/contact-us",
    "observation": "Comércio de materiais para serralharia e carpintaria.",
    "opportunity": "Materiais de divulgação das linhas de produtos.",
    "service": "design"
  },
  {
    "company": "Carpilux – Indústria de Carpintarias, Lda.",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Nazaré, Leiria",
    "website": "https://ruis.aiccopn.pt/empresas/carpilux-industria-de-carpintarias-lda/",
    "email": "carpilux@carpilux.com",
    "phone": "262569190",
    "source": "https://ruis.aiccopn.pt/empresas/carpilux-industria-de-carpintarias-lda/",
    "observation": "Empresa de carpintaria inscrita na associação AICCOPN.",
    "opportunity": "Portefólio gráfico de soluções de carpintaria.",
    "service": "design"
  },
  {
    "company": "G.Planus – Engenharia e Construção, Unipessoal, Lda.",
    "sector": "Engenharia e construção",
    "email_area": "Construção & Engenharia",
    "location": "Nelas, Viseu",
    "website": "https://gplanus.pt/",
    "email": "geral@gplanus.pt",
    "phone": "934212629",
    "source": "https://ruis.aiccopn.pt/empresas/g-planus-engenharia-e-construcao-unipessoal-lda/",
    "observation": "Empresa de arquitetura, engenharia e reabilitação.",
    "opportunity": "Apresentação comercial dos serviços de engenharia.",
    "service": "design"
  },
  {
    "company": "Linhas Gerais – Sociedade de Construções e Reabilitação Urbana, Lda.",
    "sector": "Construção e reabilitação",
    "email_area": "Construção & Engenharia",
    "location": "Lisboa, Lisboa",
    "website": "https://linhasgerais.pt/",
    "email": "contacto@linhasgerais.pt",
    "phone": "214003025",
    "source": "https://ruis.aiccopn.pt/empresas/linhas-gerais-sociedade-de-construcoes-e-reabilitacao-urbana-lda/",
    "observation": "Construção civil, reabilitação urbana e manutenção de edifícios.",
    "opportunity": "Portefólio visual de projetos de reabilitação.",
    "service": "design"
  },
  {
    "company": "Encostas do Côa",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Pinhel, Guarda",
    "website": "http://www.encostasdocoa.pt/",
    "email": "geral@encostasdocoa.pt",
    "phone": "271411132",
    "source": "https://www.allaboutportugal.pt/pt/pinhel/hoteis/encostas-do-coa",
    "observation": "Turismo rural em Quinta Nova, Pinhel.",
    "opportunity": "Materiais visuais para experiências e estadias.",
    "service": "design"
  },
  {
    "company": "Sal e Neve – Engenharia",
    "sector": "Engenharia civil",
    "email_area": "Construção & Engenharia",
    "location": "Nelas, Viseu",
    "website": "https://saleneve.pt/",
    "email": "geral@saleneve.pt",
    "phone": "232399923",
    "source": "https://saleneve.pt/contactos/",
    "observation": "Projetos de construção, reabilitação e inspeções técnicas.",
    "opportunity": "Brochura de apresentação das especialidades.",
    "service": "design"
  },
  {
    "company": "InteriorÚnico",
    "sector": "Construção e remodelações",
    "email_area": "Construção & Engenharia",
    "location": "Guarda, Guarda",
    "website": "https://www.interiorunico.pt/",
    "email": "geral@interiorunico.pt",
    "phone": "967384139",
    "source": "https://www.interiorunico.pt/contactos/",
    "observation": "Empresa de construção e remodelações com sede na Guarda.",
    "opportunity": "Portefólio gráfico de obras e remodelações.",
    "service": "design"
  },
  {
    "company": "MMCorreia Construções",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Nelas, Viseu",
    "website": "https://www.mmcorreia.pt/",
    "email": "geral@mmcorreia.pt",
    "phone": "962361998",
    "source": "https://www.mmcorreia.pt/",
    "observation": "Construção de pavilhões e instalações industriais.",
    "opportunity": "Apresentação visual de projetos industriais.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-11-b).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-11-b:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-11-b:',e.message)}
