// DUIT — Portugal continental, 2026-11-16. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Templar Aço",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Tomar, Santarém",
    "website": "https://templaraco.com",
    "email": "geral@templaraco.com",
    "phone": "249324830",
    "source": "https://templaraco.com/",
    "observation": "Atividade de metalomecânica, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de metalomecânica.",
    "service": "design"
  },
  {
    "company": "SMI - Soluções Metálicas Industriais",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Turquel, Leiria",
    "website": "https://smi.com.pt",
    "email": "geral@smi.com.pt",
    "phone": "244029628",
    "source": "https://www.smi.com.pt/pt/contactos",
    "observation": "Atividade de metalomecânica, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de metalomecânica.",
    "service": "design"
  },
  {
    "company": "MestreFerro",
    "sector": "Serralharia e metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Chaves, Vila Real",
    "website": "https://mestreferro.pt",
    "email": "geral@mestreferro.pt",
    "phone": "912473799",
    "source": "https://www.mestreferro.pt/?page_id=11",
    "observation": "Atividade de serralharia e metalomecânica, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de serralharia e metalomecânica.",
    "service": "design"
  },
  {
    "company": "ForPhysio",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Marinha Grande, Leiria",
    "website": "https://forphysio.pt",
    "email": "geral@forphysio.pt",
    "phone": "917730222",
    "source": "https://www.forphysio.pt/pt/contactos",
    "observation": "Atividade de fisioterapia, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de fisioterapia.",
    "service": "design"
  },
  {
    "company": "Clínica Fisiátrica das Antas",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Porto, Porto",
    "website": "https://clinicafa.pt",
    "email": "geral@clinicafa.pt",
    "phone": "917552923",
    "source": "https://clinicafa.pt/",
    "observation": "Atividade de fisioterapia, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de fisioterapia.",
    "service": "design"
  },
  {
    "company": "Centro de Estudo de Tavira",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Tavira, Faro",
    "website": "https://centrodeestudotavira.pt",
    "email": "info@centrodeestudotavira.pt",
    "phone": "931440953",
    "source": "https://www.centrodeestudotavira.pt/pt/contacts/",
    "observation": "Atividade de centro de estudos, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de centro de estudos.",
    "service": "design"
  },
  {
    "company": "AML Metalomecânica",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Seia, Guarda",
    "website": "https://amlmetais.pt",
    "email": "geral@amlmetais.pt",
    "phone": "961878652",
    "source": "https://amlmetais.pt/",
    "observation": "Atividade de metalomecânica, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de metalomecânica.",
    "service": "design"
  },
  {
    "company": "Metalúrgica António Barradas & Filhos",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Vila Viçosa, Évora",
    "website": "https://metalurgicabarradas.com",
    "email": "geral@mab.pt",
    "phone": "967789597",
    "source": "https://www.metalurgicabarradas.com/index.html",
    "observation": "Atividade de metalomecânica, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de metalomecânica.",
    "service": "design"
  },
  {
    "company": "SMEM",
    "sector": "Estruturas metálicas",
    "email_area": "Indústria & Produção",
    "location": "Carvoeiro, Viana do Castelo",
    "website": "https://smem.pt",
    "email": "geral@smem.pt",
    "phone": "258117079",
    "source": "https://smem.pt/",
    "observation": "Atividade de estruturas metálicas, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de estruturas metálicas.",
    "service": "design"
  },
  {
    "company": "Lacovale",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "São Pedro da Cova, Porto",
    "website": "https://lacovale.com",
    "email": "lacovale@lacovale.com",
    "phone": "224671103",
    "source": "https://lacovale.com/retail/",
    "observation": "Atividade de metalomecânica, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de metalomecânica.",
    "service": "design"
  },
  {
    "company": "AGMOL",
    "sector": "Construção e metalomecânica",
    "email_area": "Construção & Engenharia",
    "location": "Custóias, Porto",
    "website": "https://agmol.pt",
    "email": "geral@agmol.pt",
    "phone": "961138013",
    "source": "https://agmol.pt/",
    "observation": "Atividade de construção e metalomecânica, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de construção e metalomecânica.",
    "service": "design"
  },
  {
    "company": "Metalotrofa",
    "sector": "Metalomecânica de precisão",
    "email_area": "Indústria & Produção",
    "location": "Vila Nova de Famalicão, Braga",
    "website": "https://metalotrofa.com",
    "email": "info@metalotrofa.com",
    "phone": "252491094",
    "source": "https://www.metalportugal.pt/pages.php?page_id=924",
    "observation": "Atividade de metalomecânica de precisão, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de metalomecânica de precisão.",
    "service": "design"
  },
  {
    "company": "R.C.C. Ribeiro",
    "sector": "Cunhos cortantes",
    "email_area": "Indústria & Produção",
    "location": "Lousada, Porto",
    "website": "https://rcclaminas.com",
    "email": "rcc-portugal@rcclaminas.com",
    "phone": "255911932",
    "source": "https://www.metalportugal.pt/pages.php?page_id=924",
    "observation": "Atividade de cunhos cortantes, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de cunhos cortantes.",
    "service": "design"
  },
  {
    "company": "Servimolas",
    "sector": "Fabrico de molas metálicas",
    "email_area": "Indústria & Produção",
    "location": "Águeda, Aveiro",
    "website": "https://servimolas.pt",
    "email": "geral@servimolas.pt",
    "phone": "234629139",
    "source": "https://www.metalportugal.pt/pages.php?page_id=924",
    "observation": "Atividade de fabrico de molas metálicas, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de fabrico de molas metálicas.",
    "service": "design"
  },
  {
    "company": "Shapetek",
    "sector": "Maquinação industrial",
    "email_area": "Indústria & Produção",
    "location": "Pombal, Leiria",
    "website": "https://shapetek.pt",
    "email": "comercial@shapetek.pt",
    "phone": "236024188",
    "source": "https://www.metalportugal.pt/pages.php?page_id=924",
    "observation": "Atividade de maquinação industrial, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de maquinação industrial.",
    "service": "design"
  },
  {
    "company": "Techmatic",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Águeda, Aveiro",
    "website": "https://techmatic.pt",
    "email": "techmatic@techmatic.pt",
    "phone": "234603272",
    "source": "https://www.metalportugal.pt/pages.php?page_id=924",
    "observation": "Atividade de metalomecânica, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de metalomecânica.",
    "service": "design"
  },
  {
    "company": "TSF Metalúrgica de Precisão",
    "sector": "Metalúrgica de precisão",
    "email_area": "Indústria & Produção",
    "location": "Vila Nova de Famalicão, Braga",
    "website": "https://tsf-trofa.com",
    "email": "geral@tsf-trofa.com",
    "phone": "252411844",
    "source": "https://www.metalportugal.pt/pages.php?page_id=924",
    "observation": "Atividade de metalúrgica de precisão, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de metalúrgica de precisão.",
    "service": "design"
  },
  {
    "company": "Turismo Rural Sete Quintas",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Miranda do Corvo, Coimbra",
    "website": "https://sete-quintas.pt",
    "email": "info@sete-quintas.pt",
    "phone": "239538562",
    "source": "https://www.visitportugal.com/en/search/site/Rural?page=1",
    "observation": "Atividade de turismo rural, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Hotel Rural Vilarinho",
    "sector": "Hotelaria rural",
    "email_area": "Turismo & Alojamento",
    "location": "Sever do Vouga, Aveiro",
    "website": "https://hotelruralvilarinho.com",
    "email": "geral@hotelruralvilarinho.com",
    "phone": "234568204",
    "source": "https://www.visitportugal.com/en/search/site/Rural?page=1",
    "observation": "Atividade de hotelaria rural, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de hotelaria rural.",
    "service": "design"
  },
  {
    "company": "Hotel Rural Fonte Velha",
    "sector": "Hotelaria rural",
    "email_area": "Turismo & Alojamento",
    "location": "Ponte da Barca, Viana do Castelo",
    "website": "https://hotelfontevelha.pt",
    "email": "geral@hotelfontevelha.pt",
    "phone": "258101699",
    "source": "https://www.visitportugal.com/en/search/site/Rural?page=1",
    "observation": "Atividade de hotelaria rural, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de hotelaria rural.",
    "service": "design"
  },
  {
    "company": "Casas Vale Martinho",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Santa Comba Dão, Viseu",
    "website": "https://valemartinho.pt",
    "email": "geral@valemartinho.pt",
    "phone": "232882622",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo/Portugal?f%5B0%5D=bm_field_ma_acesso_internet_%3Atrue&f%5B1%5D=im_subtipo_alojamento%3A586&f%5B2%5D=sm_field_ts_tipo_alojamento%3Acasasdecampo&f%5B3%5D=bm_field_ma_parque_de_estacionam%3Atrue&f%5B4%5D=bm_field_ma_parque_jardim%3Atrue&f%5B5%5D=im_field_poi_tipo%3A490&f%5B6%5D=bm_field_melhoria_acessivel_pesq%3Atrue&f%5B7%5D=bm_field_ma_tarifas_allinc%3Atrue&f%5B8%5D=bm_field_ma_bikefriendly%3Atrue&visitas=1",
    "observation": "Atividade de turismo rural, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Quinta M",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Golegã, Santarém",
    "website": "https://quinta-m.com",
    "email": "contact@quinta-m.com",
    "phone": "243448206",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo/Portugal?f%5B0%5D=bm_field_ma_acesso_internet_%3Atrue&f%5B1%5D=im_subtipo_alojamento%3A586&f%5B2%5D=sm_field_ts_tipo_alojamento%3Acasasdecampo&f%5B3%5D=bm_field_ma_parque_de_estacionam%3Atrue&f%5B4%5D=bm_field_ma_parque_jardim%3Atrue&f%5B5%5D=im_field_poi_tipo%3A490&f%5B6%5D=bm_field_melhoria_acessivel_pesq%3Atrue&f%5B7%5D=bm_field_ma_tarifas_allinc%3Atrue&f%5B8%5D=bm_field_ma_bikefriendly%3Atrue&visitas=1",
    "observation": "Atividade de turismo rural, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Hotel Póvoa de Além Sabor",
    "sector": "Hotelaria",
    "email_area": "Turismo & Alojamento",
    "location": "Torre de Moncorvo, Bragança",
    "website": "https://hotelpovoalemsabor.com",
    "email": "info@hotelpovoalemsabor.com",
    "phone": "278511089",
    "source": "https://www.visitportugal.com/pt-pt/search/site?context=490&localidades=%28tid%3A368%29&regioes=%28tid%3A285%29&visitas=1",
    "observation": "Atividade de hotelaria, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de hotelaria.",
    "service": "design"
  },
  {
    "company": "Quinta Pero Vicente",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Aljezur, Faro",
    "website": "https://terrasdemouros.pt",
    "email": "geral@terrasdemouros.pt",
    "phone": "962416885",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?f%5B0%5D=bm_field_ma_acesso_internet_no_q%3Atrue&f%5B1%5D=im_subtipo_alojamento%3A586&f%5B2%5D=bm_field_ma_quarto_com_aquecimen%3Atrue&page=1&visitas=1",
    "observation": "Atividade de turismo rural, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Monte Vale Pereiro",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Santiago do Cacém, Setúbal",
    "website": "https://montevalepereiro.com",
    "email": "info@montevalepereiro.com",
    "phone": "938277430",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?f%5B0%5D=bm_field_ma_acesso_internet_no_q%3Atrue&f%5B1%5D=im_subtipo_alojamento%3A586&f%5B2%5D=bm_field_ma_quarto_com_aquecimen%3Atrue&page=1&visitas=1",
    "observation": "Atividade de turismo rural, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Casa das Amoras",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Marvão, Portalegre",
    "website": "https://casadasamoras.com",
    "email": "info@casadasamoras.com",
    "phone": "245993089",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?f%5B0%5D=bm_field_ma_acesso_internet_no_q%3Atrue&f%5B1%5D=im_subtipo_alojamento%3A586&f%5B2%5D=bm_field_ma_quarto_com_aquecimen%3Atrue&page=1&visitas=1",
    "observation": "Atividade de turismo rural, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Herdade do Freixial",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Odemira, Beja",
    "website": "https://herdadedofreixial.com",
    "email": "info@herdadedofreixial.com",
    "phone": "283998556",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?f%5B0%5D=bm_field_ma_acesso_internet_no_q%3Atrue&f%5B1%5D=im_subtipo_alojamento%3A586&f%5B2%5D=bm_field_ma_quarto_com_aquecimen%3Atrue&page=1&visitas=1",
    "observation": "Atividade de turismo rural, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Casa da Amendoeira",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Figueira de Castelo Rodrigo, Guarda",
    "website": "https://casadaamendoeira.pt",
    "email": "geral@casadaamendoeira.pt",
    "phone": "271313053",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?f%5B0%5D=bm_field_ma_acesso_internet_no_q%3Atrue&f%5B1%5D=im_subtipo_alojamento%3A586&f%5B2%5D=bm_field_ma_quarto_com_aquecimen%3Atrue&page=1&visitas=1",
    "observation": "Atividade de turismo rural, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Estalagem de Marvão",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Marvão, Portalegre",
    "website": "https://innmarvao.com",
    "email": "geral@innmarvao.com",
    "phone": "245993059",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?f%5B0%5D=bm_field_ma_acesso_internet_no_q%3Atrue&f%5B1%5D=im_subtipo_alojamento%3A586&f%5B2%5D=bm_field_ma_quarto_com_aquecimen%3Atrue&page=1&visitas=1",
    "observation": "Atividade de turismo rural, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Sesmarias Turismo Rural & Spa",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Ferreira do Alentejo, Beja",
    "website": "https://sesmariasturismoruralspa.com",
    "email": "info@sesmariasturismoruralspa.com",
    "phone": "284400366",
    "source": "https://www.sesmariasturismoruralspa.com/wp-content/uploads/2019/08/brochura-sesmarias-turismo-rural.pdf",
    "observation": "Atividade de turismo rural, com email profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de turismo rural.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-16).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-16:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-16:',e.message)}
