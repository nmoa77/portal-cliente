// DUIT — Portugal continental, 2026-11-06-b. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "SPwood",
    "sector": "Carpintaria e mobiliário",
    "email_area": "Indústria & Produção",
    "location": "Várzea, Barcelos, Braga",
    "website": "https://spwood.pt/",
    "email": "geral@spwood.pt",
    "phone": "253 953 160",
    "source": "https://spwood.pt/contactos/",
    "observation": "Produz mobiliário, cozinhas e pavimentos.",
    "opportunity": "Catálogo visual dos trabalhos de carpintaria.",
    "service": "design"
  },
  {
    "company": "AMCA Carpintaria",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Grijó, Vila Nova de Gaia, Porto",
    "website": "https://amcacarpintaria.pt/",
    "email": "geral@amcacarpintaria.pt",
    "phone": "227 647 628",
    "source": "https://amcacarpintaria.pt/contactos/",
    "observation": "Executa carpintaria interior, exterior e caixilharia.",
    "opportunity": "Portefólio gráfico para projetos executados.",
    "service": "design"
  },
  {
    "company": "Vicente e Ramos",
    "sector": "Carpintaria e mobiliário",
    "email_area": "Indústria & Produção",
    "location": "Pedrógão, Torres Novas, Santarém",
    "website": "https://www.vicenteeramos.pt/",
    "email": "geral@vicenteeramos.pt",
    "phone": "249 831 546",
    "source": "https://www.vicenteeramos.pt/contactos/",
    "observation": "Dispõe de fábrica em Pedrógão e showroom no Cartaxo.",
    "opportunity": "Apresentação comercial dos produtos de madeira.",
    "service": "design"
  },
  {
    "company": "Carpintaria Portugal",
    "sector": "Mobiliário por medida",
    "email_area": "Indústria & Produção",
    "location": "Sacavém, Loures, Lisboa",
    "website": "https://carpintariaportugal.com/",
    "email": "geral@carpintariaportugal.com",
    "phone": "219 410 483",
    "source": "https://carpintariaportugal.com/",
    "observation": "Oficina de mobiliário por medida em Sacavém.",
    "opportunity": "Catálogo de mobiliário e acabamentos.",
    "service": "design"
  },
  {
    "company": "FCF Carpintaria",
    "sector": "Carpintaria e mobiliário",
    "email_area": "Indústria & Produção",
    "location": "Telões, Amarante, Porto",
    "website": "https://fcfcarpintaria.com/",
    "email": "geral@fcfcarpintaria.com",
    "phone": "255 001 055",
    "source": "https://fcfcarpintaria.com/contactos/",
    "observation": "Apresenta serviços de mobiliário e carpintaria.",
    "opportunity": "Portefólio visual de soluções de madeira.",
    "service": "design"
  },
  {
    "company": "Fortuna Construction",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Lisboa, Lisboa",
    "website": "https://fortunaconstruction.pt/",
    "email": "info@fortunaconstruction.pt",
    "phone": "915 228 839",
    "source": "https://fortunaconstruction.pt/contacto/",
    "observation": "Empresa familiar com projetos residenciais e comerciais.",
    "opportunity": "Dossiês gráficos de apresentação de obras.",
    "service": "design"
  },
  {
    "company": "Azempor",
    "sector": "Indústria agroalimentar e lagar",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://www.azempor.pt/",
    "email": "geral@azempor.pt",
    "phone": "272 344 316",
    "source": "https://www.azempor.pt/pages/contact",
    "observation": "Tem instalações industriais e lagar em Castelo Branco.",
    "opportunity": "Materiais gráficos para apresentação de produtos.",
    "service": "design"
  },
  {
    "company": "Lagar Gralha",
    "sector": "Produção de azeite",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Campo Maior, Portalegre",
    "website": "https://lagargralha.pt/",
    "email": "geral@lagargralha.pt",
    "phone": "268 685 014",
    "source": "https://lagargralha.pt/contactos/",
    "observation": "Lagar situado na zona industrial de Campo Maior.",
    "opportunity": "Peças gráficas para comunicar gamas de azeite.",
    "service": "design"
  },
  {
    "company": "Lagar Sr. Branco",
    "sector": "Produção e comercialização de azeite",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Mascarenhas, Mirandela, Bragança",
    "website": "https://lagarsrbranco.com/",
    "email": "geral@lagarsrbranco.com",
    "phone": "278 097 426",
    "source": "https://lagarsrbranco.com/contactos/",
    "observation": "Produz e comercializa azeite transmontano.",
    "opportunity": "Catálogo de produtos e materiais de divulgação.",
    "service": "design"
  },
  {
    "company": "LPstudio",
    "sector": "Estúdio de dança",
    "email_area": "Estúdios de Dança",
    "location": "Aveiro, Aveiro",
    "website": "https://lpstudio.pt/",
    "email": "lpstudio@lpstudio.pt",
    "phone": "234 338 394",
    "source": "https://lpstudio.pt/contactos/",
    "observation": "Estúdio de dança localizado na Rua Nova de Vilar.",
    "opportunity": "Materiais gráficos para divulgação de aulas.",
    "service": "design"
  },
  {
    "company": "AUTODC",
    "sector": "Comércio e serviços automóveis",
    "email_area": "Automóvel",
    "location": "Lisboa, Lisboa",
    "website": "https://autodc.pt/",
    "email": "mundoautomovel@autodc.pt",
    "phone": "963 287 055",
    "source": "https://autodc.pt/contactos/",
    "observation": "Disponibiliza stand, oficina e lavagem automóvel.",
    "opportunity": "Materiais comerciais para serviços automóveis.",
    "service": "design"
  },
  {
    "company": "Estúdio Sabor & Dança",
    "sector": "Estúdio de dança",
    "email_area": "Estúdios de Dança",
    "location": "Lisboa, Lisboa",
    "website": "https://www.estudiosaboredanca.pt/",
    "email": "contato@estudiosaboredanca.pt",
    "phone": "918 202 395",
    "source": "https://www.estudiosaboredanca.pt/entre-em-contato",
    "observation": "Estúdio localizado junto ao Metro Alto dos Moinhos.",
    "opportunity": "Peças visuais de divulgação de atividades.",
    "service": "design"
  },
  {
    "company": "Susana Luz Psicologia Clínica",
    "sector": "Psicologia clínica",
    "email_area": "Saúde Mental",
    "location": "Carcavelos, Cascais, Lisboa",
    "website": "https://psicologialuz.pt/",
    "email": "geral@psicologialuz.pt",
    "phone": "935 257 418",
    "source": "https://psicologialuz.pt/contactos/",
    "observation": "Apresenta consultórios em Carcavelos e Lisboa.",
    "opportunity": "Materiais informativos sobre consultas de psicologia.",
    "service": "design"
  },
  {
    "company": "Tânia Daniela Carvalho Psicologia",
    "sector": "Psicologia clínica",
    "email_area": "Saúde Mental",
    "location": "Porto, Porto",
    "website": "https://www.taniadanielacarvalho.pt/",
    "email": "info@taniadanielacarvalho.pt",
    "phone": "939 532 690",
    "source": "https://www.taniadanielacarvalho.pt/contactos/",
    "observation": "Disponibiliza contactos para consultas e parcerias.",
    "opportunity": "Materiais de apresentação dos serviços clínicos.",
    "service": "design"
  },
  {
    "company": "CogniLab",
    "sector": "Saúde mental e terapia integrativa",
    "email_area": "Saúde Mental",
    "location": "Cascais, Lisboa",
    "website": "https://cognilab.pt/",
    "email": "geral@cognilab.pt",
    "phone": "214 843 180",
    "source": "https://cognilab.pt/contact/",
    "observation": "Clínica com instalações em Cascais e Lisboa.",
    "opportunity": "Materiais informativos das áreas terapêuticas.",
    "service": "design"
  },
  {
    "company": "Diana Moreno Psicologia",
    "sector": "Psicologia clínica",
    "email_area": "Saúde Mental",
    "location": "Lisboa, Lisboa",
    "website": "https://www.dianamoreno.pt/",
    "email": "psi@dianamoreno.pt",
    "phone": "910 618 576",
    "source": "https://www.dianamoreno.pt/contactos/",
    "observation": "Consulta de psicologia na Avenida Duque de Ávila.",
    "opportunity": "Peças informativas sobre serviços de psicologia.",
    "service": "design"
  },
  {
    "company": "Fonte da Bica",
    "sector": "Produção de azeite e experiências",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Rio Maior, Santarém",
    "website": "https://www.fontedabica.com/",
    "email": "mail@fontedabica.com",
    "phone": "243 993 274",
    "source": "https://www.fontedabica.com/",
    "observation": "Produz azeite e promove provas e visitas ao lagar.",
    "opportunity": "Materiais de divulgação das experiências e produtos.",
    "service": "design"
  },
  {
    "company": "Lagar Mourão",
    "sector": "Produção de azeite",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Tentúgal, Montemor-o-Velho, Coimbra",
    "website": "https://lagarmourao.pt/",
    "email": "geral@lagarmourao.pt",
    "phone": "239 951 305",
    "source": "https://lagarmourao.pt/empresa/",
    "observation": "Produz azeite em Tentúgal e comercializa azeitonas.",
    "opportunity": "Catálogo gráfico de azeites e produtos.",
    "service": "design"
  },
  {
    "company": "HEF",
    "sector": "Materiais de construção e lagar",
    "email_area": "Construção & Engenharia",
    "location": "Juncais, Fornos de Algodres, Guarda",
    "website": "https://www.hef.pt/",
    "email": "info@hef.pt",
    "phone": "271 703 652",
    "source": "https://www.hef.pt/",
    "observation": "Empresa familiar com áreas de construção, manutenção e lagar.",
    "opportunity": "Materiais comerciais para apresentar as diferentes áreas.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-06-b).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');
  added++;
 }})();
 console.log('[crm] seed 2026-11-06-b:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-06-b:',e.message)}
