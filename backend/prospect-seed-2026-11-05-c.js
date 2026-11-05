// DUIT — Portugal continental, 2026-11-05 (terceira execução). Contactos verificados em fontes oficiais e institucionais.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "MECTOP — Metalomecânica de Precisão",
    "sector": "Metalomecânica de precisão",
    "email_area": "Indústria & Produção",
    "location": "Setúbal, Setúbal",
    "website": "https://www.mectop.com/",
    "email": "mectop@mectop.com",
    "phone": "265 739 870",
    "source": "https://www.mectop.com/contactos/",
    "observation": "A empresa apresenta serviços de metalomecânica de precisão e parque de máquinas.",
    "opportunity": "Criar fichas comerciais sobre capacidades de maquinação.",
    "service": "design"
  },
  {
    "company": "J.F. Metal — Construções Metálicas",
    "sector": "Construção metálica",
    "email_area": "Construção & Engenharia",
    "location": "Barcelos, Braga",
    "website": "https://jfmetal.pt/",
    "email": "geral@jfmetal.pt",
    "phone": "252 963 636",
    "source": "https://ruis.aiccopn.pt/empresas/j-f-metal-metalomecanica-unipessoal-lda/",
    "observation": "Executa estruturas metálicas e coberturas para edifícios.",
    "opportunity": "Criar apresentações visuais de projetos de estruturas metálicas.",
    "service": "design"
  },
  {
    "company": "Monte Chalaça",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Ferreira do Alentejo, Beja",
    "website": "https://www.montechalaca.pt/",
    "email": "geral@montechalaca.pt",
    "phone": "284 739 015",
    "source": "https://www.montechalaca.pt/contactos",
    "observation": "A unidade disponibiliza suites, villas e experiências na quinta pedagógica.",
    "opportunity": "Criar materiais visuais sobre alojamentos e experiências.",
    "service": "design"
  },
  {
    "company": "Quinta de Azeméis",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Vimieiro, Évora",
    "website": "https://turismoruralalentejo.com.pt/",
    "email": "info@turismoruralalentejo.com.pt",
    "phone": "933 232 322",
    "source": "https://turismoruralalentejo.com.pt/",
    "observation": "A quinta disponibiliza alojamento rural e piscina interior.",
    "opportunity": "Criar peças de apresentação do alojamento e da região.",
    "service": "design"
  },
  {
    "company": "Vila Valmonte",
    "sector": "Alojamento rural",
    "email_area": "Turismo & Alojamento",
    "location": "Ferreira do Alentejo, Beja",
    "website": "https://www.vilavalmonte.eu/",
    "email": "info@vilavalmonte.eu",
    "phone": "917 757 354",
    "source": "https://www.vilavalmonte.eu/contactos/",
    "observation": "A unidade de turismo rural apresenta quartos e piscina de água salgada.",
    "opportunity": "Criar materiais de apresentação dos quartos e experiências.",
    "service": "design"
  },
  {
    "company": "Assisfluxo",
    "sector": "Equipamentos industriais e manutenção",
    "email_area": "Indústria & Produção",
    "location": "Bragança, Bragança",
    "website": "https://assisfluxo.pt/",
    "email": "geral@assisfluxo.pt",
    "phone": "273 094 947",
    "source": "https://assisfluxo.pt/contactos/",
    "observation": "Comercializa máquinas industriais e presta serviços de manutenção e reconversão.",
    "opportunity": "Criar fichas de produtos e materiais de apresentação técnica.",
    "service": "design"
  },
  {
    "company": "Madrugada Turismo Rural",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Évora, Évora",
    "website": "https://madrugadaturismorural.com/",
    "email": "info@madrugadaturismorural.com",
    "phone": "918 784 221",
    "source": "https://madrugadaturismorural.com/pt/contacto/",
    "observation": "Alojamento rural perto de Évora com quartos e piscina.",
    "opportunity": "Criar suportes de divulgação de quartos e experiências locais.",
    "service": "design"
  },
  {
    "company": "Fisiojá",
    "sector": "Fisioterapia e osteopatia",
    "email_area": "Fisioterapia",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://fisioja.pt/",
    "email": "info@fisioja.pt",
    "phone": "272 337 398",
    "source": "https://fisioja.pt/",
    "observation": "Clínica de fisioterapia, osteopatia, fisiatria e psicologia.",
    "opportunity": "Criar materiais informativos das especialidades clínicas.",
    "service": "design"
  },
  {
    "company": "MR Clinic",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Tomar, Santarém",
    "website": "https://www.mrclinic.pt/",
    "email": "geral@mrclinic.pt",
    "phone": "249 098 143",
    "source": "https://www.mrclinic.pt/",
    "observation": "Clínica dentária com unidades em Tomar e Santarém.",
    "opportunity": "Criar suportes visuais de informação sobre tratamentos dentários.",
    "service": "design"
  },
  {
    "company": "Pés de Cena — Escola de Dança",
    "sector": "Ensino de dança",
    "email_area": "Estúdios de Dança",
    "location": "Aveiro, Aveiro",
    "website": "https://www.pesdecena.com/",
    "email": "geral@pesdecena.com",
    "phone": "234 062 976",
    "source": "https://www.pesdecena.com/privacy-policy/",
    "observation": "A escola apresenta ballet clássico, dança criativa e dança contemporânea.",
    "opportunity": "Criar materiais para divulgação das modalidades e inscrições.",
    "service": "design"
  },
  {
    "company": "OSM — Oficinas de Metalomecânica",
    "sector": "Fabricação de equipamentos de perfuração",
    "email_area": "Indústria & Produção",
    "location": "Pedras Salgadas, Vila Real",
    "website": "https://osm.com.pt/",
    "email": "info@osm.com.pt",
    "phone": "259 433 002",
    "source": "https://osm.com.pt/contactos.php",
    "observation": "Fabrica equipamentos pneumáticos e componentes para a indústria.",
    "opportunity": "Criar fichas técnicas e apresentações comerciais de equipamentos.",
    "service": "design"
  },
  {
    "company": "Edifica4Life",
    "sector": "Construção de habitações",
    "email_area": "Construção & Engenharia",
    "location": "Vila Real, Vila Real",
    "website": "https://edifica.pt/",
    "email": "geral@edifica.pt",
    "phone": "965 395 500",
    "source": "https://ruis.aiccopn.pt/empresas/edifica4life-lda/",
    "observation": "Especializada na construção de habitações unifamiliares.",
    "opportunity": "Criar apresentações de projetos de construção residencial.",
    "service": "design"
  },
  {
    "company": "Confitec — Engenharia e Construção",
    "sector": "Construção e reabilitação",
    "email_area": "Construção & Engenharia",
    "location": "Constantim, Vila Real",
    "website": "https://confitec.pt/",
    "email": "geral@confitec.pt",
    "phone": "259 342 212",
    "source": "https://ruis.aiccopn.pt/empresas/confitec-engenharia-e-construcao-lda/",
    "observation": "Executa construção, reconstrução e reabilitação de edifícios.",
    "opportunity": "Criar suportes de apresentação de obras e serviços.",
    "service": "design"
  },
  {
    "company": "Termodouro",
    "sector": "Climatização e canalizações",
    "email_area": "Construção & Engenharia",
    "location": "Peso da Régua, Vila Real",
    "website": "https://termodouro.pt/",
    "email": "info@termodouro.pt",
    "phone": "254 322 217",
    "source": "https://ruis.aiccopn.pt/empresas/termodouro-unip-lda/",
    "observation": "Presta serviços de AVAC, aquecimento central e instalações solares.",
    "opportunity": "Criar materiais explicativos das soluções de climatização.",
    "service": "design"
  },
  {
    "company": "Selidomus",
    "sector": "Aluguer de máquinas para construção",
    "email_area": "Construção & Engenharia",
    "location": "Vila Real, Vila Real",
    "website": "https://selidomus.pt/",
    "email": "geral@selidomus.pt",
    "phone": "259 338 586",
    "source": "https://ruis.aiccopn.pt/empresas/selidomus-sociedade-europeia-de-locacao-de-maquinas-para-a-construcao-lda/",
    "observation": "Disponibiliza aluguer de maquinaria e serviços para construção.",
    "opportunity": "Criar catálogo visual de equipamentos disponíveis para aluguer.",
    "service": "design"
  },
  {
    "company": "DTM — Engenharia e Construção",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Vila Real, Vila Real",
    "website": "https://dtm.com.pt/",
    "email": "geral@dtm.com.pt",
    "phone": "968 454 791",
    "source": "https://ruis.aiccopn.pt/empresas/daniel-teixeira-magalhaes-unipessoal-lda/",
    "observation": "Executa obras públicas e privadas de construção civil.",
    "opportunity": "Criar portefólio comercial de projetos de engenharia.",
    "service": "design"
  },
  {
    "company": "Pavilamego",
    "sector": "Construção e materiais de construção",
    "email_area": "Construção & Engenharia",
    "location": "Lamego, Viseu",
    "website": "https://pavilamego.pt/",
    "email": "geral@pavilamego.pt",
    "phone": "254 656 378",
    "source": "https://ruis.aiccopn.pt/empresas/pavilamego-construcoes-e-pavimentos-de-lamego-lda/",
    "observation": "Atua no comércio de materiais de construção e construção civil.",
    "opportunity": "Criar apresentações comerciais de materiais e obras.",
    "service": "design"
  },
  {
    "company": "Carvalho & Fonseca — Construção Civil",
    "sector": "Construção e remodelações",
    "email_area": "Construção & Engenharia",
    "location": "Amarante, Porto",
    "website": "https://cfconstrucao.pt/",
    "email": "geral@cfconstrucao.pt",
    "phone": "913 534 617",
    "source": "https://ruis.aiccopn.pt/empresas/carvalho-fonseca-construcao-civil-lda/",
    "observation": "Presta serviços de restauro, remodelação e construção nova.",
    "opportunity": "Criar portefólio visual de intervenções e serviços.",
    "service": "design"
  },
  {
    "company": "Taskdone — Engenharia e Construção",
    "sector": "Engenharia e construção",
    "email_area": "Construção & Engenharia",
    "location": "Queijas, Lisboa",
    "website": "https://taskdone.pt/",
    "email": "geral@taskdone.pt",
    "phone": "210 998 097",
    "source": "https://ruis.aiccopn.pt/empresas/taskdone-engenharia-e-construcao-lda/",
    "observation": "Atua na construção, reabilitação e instalações técnicas.",
    "opportunity": "Criar suportes comerciais para diferentes serviços de engenharia.",
    "service": "design"
  },
  {
    "company": "Tapadas de Mourão",
    "sector": "Projeto de hotel rural e spa",
    "email_area": "Turismo & Alojamento",
    "location": "Mourão, Évora",
    "website": "https://tapadasdemourao.com/",
    "email": "geral@tapadasdemourao.com",
    "phone": "",
    "source": "https://tapadasdemourao.com/",
    "observation": "Projeto de pequeno hotel rural com abertura anunciada para a primavera de 2027.",
    "opportunity": "Criar materiais de pré-abertura e apresentação do alojamento.",
    "service": "ambas"
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-05).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');
  added++;
 }})();
 console.log('[crm] seed 2026-11-05:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-05:',e.message)}
