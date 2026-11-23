// DUIT — 2026-11-23. Contactos profissionais públicos confirmados em fontes oficiais ou diretórios.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Casa Costa Carpintaria",
    "sector": "Carpintaria e marcenaria",
    "email_area": "Indústria & Produção",
    "location": "Viseu, Viseu",
    "website": "https://casacostacm.pt",
    "email": "geral@casacostacm.pt",
    "phone": "232972434",
    "source": "https://casacostacm.pt/",
    "observation": "A fonte pública identifica a atividade de carpintaria e marcenaria e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar serviços de carpintaria e marcenaria.",
    "service": "design"
  },
  {
    "company": "J.F Metal",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Silveiros, Braga",
    "website": "https://jfmetal.pt",
    "email": "geral@jfmetal.pt",
    "phone": "252963636",
    "source": "https://ruis.aiccopn.pt/empresas/j-f-metal-metalomecanica-unipessoal-lda/",
    "observation": "A fonte pública identifica a atividade de metalomecânica e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar serviços de metalomecânica.",
    "service": "design"
  },
  {
    "company": "IMAEAL",
    "sector": "Indústria metalúrgica",
    "email_area": "Indústria & Produção",
    "location": "Celeirós, Braga",
    "website": "https://imaeal.com.pt",
    "email": "geral@imaeal.com.pt",
    "phone": "253605250",
    "source": "https://www.imaeal.com.pt/hello-world/",
    "observation": "A fonte pública identifica a atividade de indústria metalúrgica e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar serviços de indústria metalúrgica.",
    "service": "design"
  },
  {
    "company": "Sifinox",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Adaúfe, Braga",
    "website": "https://sifinox.pt",
    "email": "geral@sifinox.pt",
    "phone": "253675751",
    "source": "https://sifinox.pt/",
    "observation": "A fonte pública identifica a atividade de metalomecânica e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar serviços de metalomecânica.",
    "service": "design"
  },
  {
    "company": "Projecto Dançar",
    "sector": "Escola de dança",
    "email_area": "Estúdios de Dança",
    "location": "Lisboa, Lisboa",
    "website": "https://projectodancar.com",
    "email": "geral@projectodancar.com",
    "phone": "967395470",
    "source": "https://www.portaldadanca.pt/escolas/projecto-dancar/",
    "observation": "A fonte pública identifica a atividade de escola de dança e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar serviços de escola de dança.",
    "service": "design"
  },
  {
    "company": "A Pompadourette",
    "sector": "Escola de dança",
    "email_area": "Estúdios de Dança",
    "location": "Lisboa, Lisboa",
    "website": "https://apompadourette.com",
    "email": "geral@apompadourette.com",
    "phone": "915716480",
    "source": "https://www.portaldadanca.pt/escolas/a-pompadourette/",
    "observation": "A fonte pública identifica a atividade de escola de dança e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar serviços de escola de dança.",
    "service": "design"
  },
  {
    "company": "Dance Etc",
    "sector": "Escola de dança",
    "email_area": "Estúdios de Dança",
    "location": "Lisboa, Lisboa",
    "website": "https://danceetc.pt",
    "email": "geral@danceetc.pt",
    "phone": "213866388",
    "source": "https://www.portaldadanca.pt/escolas/dance-etc/",
    "observation": "A fonte pública identifica a atividade de escola de dança e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar serviços de escola de dança.",
    "service": "design"
  },
  {
    "company": "Surpresa Total",
    "sector": "Transportes de madeira",
    "email_area": "Transportes & Logística",
    "location": "Sátão, Viseu",
    "website": "https://surpresatotal.pt",
    "email": "geral@surpresatotal.pt",
    "phone": "962428885",
    "source": "https://www.surpresatotal.pt/",
    "observation": "A fonte pública identifica a atividade de transportes de madeira e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar serviços de transportes de madeira.",
    "service": "design"
  },
  {
    "company": "Movimola",
    "sector": "Oficina e máquinas agrícolas",
    "email_area": "Automóvel",
    "location": "Évora, Évora",
    "website": "https://movimola.pt",
    "email": "geral@movimola.pt",
    "phone": "266744028",
    "source": "https://www.movimola.pt/oficina-mecanica",
    "observation": "A fonte pública identifica a atividade de oficina e máquinas agrícolas e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar serviços de oficina e máquinas agrícolas.",
    "service": "design"
  },
  {
    "company": "Cervimat",
    "sector": "Engenharia e construção",
    "email_area": "Construção & Engenharia",
    "location": "Vila Nova de Gaia, Porto",
    "website": "https://cervimat.pt",
    "email": "geral@cervimat.pt",
    "phone": "227836003",
    "source": "https://ruis.aiccopn.pt/empresas/cervimat-engenharia-e-construcao-lda/",
    "observation": "A fonte pública identifica a atividade de engenharia e construção e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar serviços de engenharia e construção.",
    "service": "design"
  },
  {
    "company": "Quinta da Retorta",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Pinhel, Guarda",
    "website": "https://quintadaretorta.pt",
    "email": "info@quintadaretorta.pt",
    "phone": "917411823",
    "source": "https://valedocoa.pt/alojamento/",
    "observation": "A fonte pública identifica a atividade de turismo rural e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Casas Serranas",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Gouveia, Guarda",
    "website": "https://casas-serranas.pt",
    "email": "geral@casas-serranas.pt",
    "phone": "961778671",
    "source": "https://www.cardapio.pt/turismo-rural/dir/d/guarda/p-19922/casa-do-lagarinho/",
    "observation": "A fonte pública identifica a atividade de turismo rural e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "FisioMin",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Vila do Conde, Porto",
    "website": "https://fisiomin.pt",
    "email": "geral@fisiomin.pt",
    "phone": "918336826",
    "source": "https://www.fisiomin.pt/fisioterapia-porto",
    "observation": "A fonte pública identifica a atividade de fisioterapia e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar serviços de fisioterapia.",
    "service": "design"
  },
  {
    "company": "VitaSaúde",
    "sector": "Clínica de saúde e bem-estar",
    "email_area": "Saúde",
    "location": "Porto, Porto",
    "website": "https://vitasaude.pt",
    "email": "geral@vitasaude.pt",
    "phone": "225105475",
    "source": "https://www.vitasaude.pt/equipa/bruno-silva/",
    "observation": "A fonte pública identifica a atividade de clínica de saúde e bem-estar e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar serviços de clínica de saúde e bem-estar.",
    "service": "design"
  },
  {
    "company": "Clínica do Bonfim",
    "sector": "Clínica médica",
    "email_area": "Saúde",
    "location": "Porto, Porto",
    "website": "https://clinicabonfim.pt",
    "email": "clinicabonfim@clinicabonfim.pt",
    "phone": "225103411",
    "source": "https://www.clinicabonfim.pt/contactos/",
    "observation": "A fonte pública identifica a atividade de clínica médica e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar serviços de clínica médica.",
    "service": "design"
  },
  {
    "company": "AxiomStrategy",
    "sector": "Fabrico de peças metálicas",
    "email_area": "Indústria & Produção",
    "location": "Évora, Évora",
    "website": "https://axiomstrategy.pt",
    "email": "geral@axiomstrategy.pt",
    "phone": "215903417",
    "source": "https://axiomstrategy.pt/servicos/fabrico-de-chassis-e-pecas-metalicas/",
    "observation": "A fonte pública identifica a atividade de fabrico de peças metálicas e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar serviços de fabrico de peças metálicas.",
    "service": "design"
  },
  {
    "company": "Saruga & Filhos",
    "sector": "Oficina automóvel",
    "email_area": "Automóvel",
    "location": "Évora, Évora",
    "website": "https://sarugaefilhos.pt",
    "email": "geral@sarugaefilhos.pt",
    "phone": "266707041",
    "source": "https://www.sarugaefilhos.pt/Contact.htm",
    "observation": "A fonte pública identifica a atividade de oficina automóvel e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar serviços de oficina automóvel.",
    "service": "design"
  },
  {
    "company": "Berrelhas Transportes",
    "sector": "Transportes",
    "email_area": "Transportes & Logística",
    "location": "Viseu, Viseu",
    "website": "https://berrelhas.pt",
    "email": "geral@berrelhas.pt",
    "phone": "232470500",
    "source": "https://berrelhas.pt/berrelhas/contactos/",
    "observation": "A fonte pública identifica a atividade de transportes e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar serviços de transportes.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-23).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-23:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-23:',e.message)}
