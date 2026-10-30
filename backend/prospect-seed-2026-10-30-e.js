// DUIT — 2026-10-30 lote e. Fontes públicas consultadas para emails profissionais.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "DG Metal Metalomecânica",
    "sector": "Soldadura e montagem industrial",
    "email_area": "Indústria & Produção",
    "location": "Vieira de Leiria, Leiria",
    "website": "https://dgmetalomecanica.pt/",
    "email": "geral@dgmetalomecanica.pt",
    "phone": "910 748 852",
    "source": "https://dgmetalomecanica.pt/contactos/",
    "observation": "Executa soldadura industrial e montagem de estruturas metálicas.",
    "opportunity": "Criar fichas comerciais de serviços industriais.",
    "service": "design"
  },
  {
    "company": "Carpifárrio",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Fárrio, Santarém",
    "website": "https://www.carpifarrio.pt/",
    "email": "geral@carpifarrio.pt",
    "phone": "964 818 025",
    "source": "https://compronoribatejo.pt/empresa/carpifarrio-lda",
    "observation": "Fabrica e monta cozinhas, portas, roupeiros e pavimentos.",
    "opportunity": "Criar catálogos de soluções de carpintaria.",
    "service": "design"
  },
  {
    "company": "FISIOIN",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Leiria, Leiria",
    "website": "https://fisioin.com/",
    "email": "geral@fisioin.com",
    "phone": "244 092 222",
    "source": "https://fisioin.com/contactos-fale-connosco/",
    "observation": "Centro de terapias manuais e fisioterapia.",
    "opportunity": "Criar materiais explicativos dos serviços clínicos.",
    "service": "ambas"
  },
  {
    "company": "INSIDE Lab",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Leiria, Leiria",
    "website": "https://www.insidelab.pt/",
    "email": "geral@insidelab.pt",
    "phone": "966 460 937",
    "source": "https://www.insidelab.pt/fisioterapia/",
    "observation": "Presta fisioterapia e recuperação musculoesquelética.",
    "opportunity": "Criar suportes informativos de tratamentos.",
    "service": "design"
  },
  {
    "company": "Traços Fortes",
    "sector": "Carpintaria e construção em madeira",
    "email_area": "Indústria & Produção",
    "location": "Abrã, Santarém",
    "website": "https://tracosfortes.pt/",
    "email": "geral@tracosfortes.pt",
    "phone": "243 405 182",
    "source": "https://tracosfortes.pt/",
    "observation": "Produz portas, cozinhas, pavimentos e mobiliário personalizado.",
    "opportunity": "Criar portefólio de trabalhos e acabamentos.",
    "service": "design"
  },
  {
    "company": "Lança Encanto",
    "sector": "Indústria de mobiliário",
    "email_area": "Indústria & Produção",
    "location": "Ourém, Santarém",
    "website": "https://lancaencanto.pt/",
    "email": "geral@lancaencanto.pt",
    "phone": "249 595 894",
    "source": "https://lancaencanto.pt/",
    "observation": "Fabrica mobiliário e transforma painéis de madeira.",
    "opportunity": "Criar catálogo B2B de produtos.",
    "service": "design"
  },
  {
    "company": "MetalCrush",
    "sector": "Mecânica de precisão",
    "email_area": "Indústria & Produção",
    "location": "Campeã, Vila Real",
    "website": "https://www.metalcrush.pt/",
    "email": "geral@metalcrush.pt",
    "phone": "259 098 852",
    "source": "https://www.metalcrush.pt/",
    "observation": "Presta tornearia e fresagem CNC.",
    "opportunity": "Criar apresentação técnica das capacidades produtivas.",
    "service": "design"
  },
  {
    "company": "Cobalto Douro Metalomecânica",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Barcos, Tabuaço, Viseu",
    "website": "https://cobaltometalomecanica.com/",
    "email": "geral@cobaltometalomecanica.com",
    "phone": "254 090 473",
    "source": "https://cobaltometalomecanica.com/contactos/",
    "observation": "Empresa metalomecânica com instalações em Tabuaço.",
    "opportunity": "Criar materiais de apresentação de serviços.",
    "service": "design"
  },
  {
    "company": "Enorme Sentido",
    "sector": "Formação e consultoria",
    "email_area": "Educação & Formação",
    "location": "Évora, Évora",
    "website": "https://www.enormesentido.com/",
    "email": "geral@enormesentido.com",
    "phone": "",
    "source": "https://www.enormesentido.com/",
    "observation": "Entidade formadora certificada pela DGERT.",
    "opportunity": "Criar suportes de divulgação de cursos.",
    "service": "ambas"
  },
  {
    "company": "Berrelhas Transportes",
    "sector": "Transportes",
    "email_area": "Transportes & Logística",
    "location": "Viseu, Viseu",
    "website": "https://berrelhas.pt/",
    "email": "geral@berrelhas.pt",
    "phone": "232 470 500",
    "source": "https://berrelhas.pt/berrelhas/contactos/",
    "observation": "Empresa de transportes com instalações em Coimbrões.",
    "opportunity": "Criar apresentações comerciais dos serviços.",
    "service": "design"
  },
  {
    "company": "Asfaltolargo",
    "sector": "Transportes e logística",
    "email_area": "Transportes & Logística",
    "location": "Viseu, Viseu",
    "website": "https://asfaltolargo.pt/",
    "email": "geral@asfaltolargo.pt",
    "phone": "232 099 999",
    "source": "https://asfaltolargo.pt/pt/contactos",
    "observation": "Disponibiliza transporte de mercadorias e logística.",
    "opportunity": "Criar fichas de serviços para empresas.",
    "service": "design"
  },
  {
    "company": "Agrobeja",
    "sector": "Comércio e serviços agrícolas",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Ferreira do Alentejo, Beja",
    "website": "https://agrobeja.pt/",
    "email": "geral@agrobeja.pt",
    "phone": "284 739 464",
    "source": "https://agrobeja.pt/contacts/",
    "observation": "Empresa de apoio à agricultura desde 1981.",
    "opportunity": "Criar fichas de produtos e serviços agrícolas.",
    "service": "design"
  },
  {
    "company": "Lagar Mourão",
    "sector": "Produção de azeite",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Tentúgal, Coimbra",
    "website": "https://lagarmourao.pt/",
    "email": "geral@lagarmourao.pt",
    "phone": "239 951 305",
    "source": "https://lagarmourao.pt/empresa/",
    "observation": "Produz azeite por extração mecânica.",
    "opportunity": "Criar materiais de apresentação dos azeites.",
    "service": "design"
  },
  {
    "company": "Azempor",
    "sector": "Indústria agroalimentar",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://www.azempor.pt/",
    "email": "geral@azempor.pt",
    "phone": "272 344 316",
    "source": "https://www.azempor.pt/pages/contact",
    "observation": "Empresa agroalimentar com lagar de azeite.",
    "opportunity": "Criar suportes comerciais para produtos alimentares.",
    "service": "design"
  },
  {
    "company": "Auto Nogueira",
    "sector": "Oficina automóvel",
    "email_area": "Automóvel",
    "location": "Braga, Braga",
    "website": "https://www.autonogueira.pt/",
    "email": "geral@autonogueira.pt",
    "phone": "253 674 078",
    "source": "https://www.autonogueira.pt/contactos/",
    "observation": "Oficina de reparação automóvel em Braga.",
    "opportunity": "Criar peças de comunicação de serviços de oficina.",
    "service": "ambas"
  },
  {
    "company": "Idrivemobile",
    "sector": "Comércio automóvel",
    "email_area": "Automóvel",
    "location": "Celeirós, Braga",
    "website": "https://www.idrivemobile.pt/",
    "email": "geral@idrivemobile.pt",
    "phone": "911 797 893",
    "source": "https://www.idrivemobile.pt/contactos",
    "observation": "Stand de automóveis em Celeirós.",
    "opportunity": "Criar peças de apresentação de viaturas.",
    "service": "ambas"
  },
  {
    "company": "LSC Automóveis",
    "sector": "Comércio automóvel",
    "email_area": "Automóvel",
    "location": "Braga, Braga",
    "website": "https://www.lscautomoveis.pt/",
    "email": "geral@lscautomoveis.pt",
    "phone": "253 282 750",
    "source": "https://www.lscautomoveis.pt/carros-usados-braga/contactos",
    "observation": "Stand de automóveis usados em Braga.",
    "opportunity": "Criar suportes gráficos para campanhas de viaturas.",
    "service": "ambas"
  },
  {
    "company": "Agrifiba",
    "sector": "Produção e engarrafamento de azeite",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Andrães, Vila Real",
    "website": "https://agrifiba.com/",
    "email": "geral@agrifiba.com",
    "phone": "259 321 166",
    "source": "https://agrifiba.com/contactos",
    "observation": "Produz e engarrafa azeite do Douro e Trás-os-Montes.",
    "opportunity": "Criar materiais de apresentação dos azeites.",
    "service": "design"
  },
  {
    "company": "Bettertech",
    "sector": "Software empresarial",
    "email_area": "Tecnologia & Digital",
    "location": "Coimbra, Coimbra",
    "website": "https://www.bettertech.pt/",
    "email": "geral@bettertechsoftware.com",
    "phone": "239 244 510",
    "source": "https://www.bettertech.pt/contactos.aspx",
    "observation": "Desenvolve projetos e soluções tecnológicas empresariais.",
    "opportunity": "Criar suportes comerciais para soluções tecnológicas.",
    "service": "design"
  },
  {
    "company": "Coimbra Labs",
    "sector": "Engenharia de software",
    "email_area": "Tecnologia & Digital",
    "location": "Coimbra, Coimbra",
    "website": "https://coimbralabs.com/",
    "email": "hello@coimbralabs.com",
    "phone": "",
    "source": "https://coimbralabs.com/",
    "observation": "Organização independente de engenharia de software.",
    "opportunity": "Criar materiais de apresentação de produtos digitais.",
    "service": "design"
  },
  {
    "company": "O Javali",
    "sector": "Restauração",
    "email_area": "Restauração",
    "location": "Bragança, Bragança",
    "website": "https://www.ojavali.pt/",
    "email": "geral@ojavali.pt",
    "phone": "273 333 898",
    "source": "https://www.ojavali.pt/contactos/",
    "observation": "Restaurante e taberna em Bragança.",
    "opportunity": "Criar suportes de divulgação da oferta gastronómica.",
    "service": "ambas"
  },
  {
    "company": "Candeias do Souto",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Meixedo, Bragança",
    "website": "https://candeiasdosouto.pt/",
    "email": "reservas@candeiasdosouto.pt",
    "phone": "273 331 259",
    "source": "https://candeiasdosouto.pt/contacts/",
    "observation": "Alojamento de turismo rural em Meixedo.",
    "opportunity": "Criar materiais digitais de apresentação do alojamento.",
    "service": "ambas"
  },
  {
    "company": "UDance",
    "sector": "Escola de dança",
    "email_area": "Estúdios de Dança",
    "location": "Lisboa, Lisboa",
    "website": "https://www.udance.pt/",
    "email": "geral@udance.pt",
    "phone": "912 160 967",
    "source": "https://www.udance.pt/",
    "observation": "Escola com várias modalidades de dança em Lisboa.",
    "opportunity": "Criar suportes de divulgação de modalidades e inscrições.",
    "service": "ambas"
  },
  {
    "company": "Alojamento Girassol",
    "sector": "Alojamento local",
    "email_area": "Turismo & Alojamento",
    "location": "Castelo Branco, Castelo Branco",
    "website": "http://alojamentogirassol.pt/",
    "email": "geral@alojamentogirassol.pt",
    "phone": "966 358 488",
    "source": "https://cm-castelobranco.pt/visitante/descanse-no-nosso-concelho/alojamento-local/",
    "observation": "Alojamento local registado no diretório municipal.",
    "opportunity": "Criar suportes de informação para hóspedes.",
    "service": "design"
  },
  {
    "company": "Boutique a Esplanada",
    "sector": "Alojamento local",
    "email_area": "Turismo & Alojamento",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://www.boutiqueesplanada.com/",
    "email": "info@boutiqueesplanada.com",
    "phone": "272 084 544",
    "source": "https://cm-castelobranco.pt/visitante/descanse-no-nosso-concelho/alojamento-local/",
    "observation": "Alojamento identificado pelo município de Castelo Branco.",
    "opportunity": "Criar peças digitais de apresentação do alojamento.",
    "service": "design"
  },
  {
    "company": "Casa 92",
    "sector": "Alojamento local",
    "email_area": "Turismo & Alojamento",
    "location": "Castelo Branco, Castelo Branco",
    "website": "http://www.casa92.pt/",
    "email": "geral@casa92.pt",
    "phone": "272 322 398",
    "source": "https://cm-castelobranco.pt/visitante/descanse-no-nosso-concelho/alojamento-local/",
    "observation": "Alojamento na Avenida General Humberto Delgado.",
    "opportunity": "Criar informação gráfica para hóspedes.",
    "service": "design"
  },
  {
    "company": "Casa da Nora",
    "sector": "Alojamento local",
    "email_area": "Turismo & Alojamento",
    "location": "Salgueiro do Campo, Castelo Branco",
    "website": "https://www.casadanora.pt/",
    "email": "geral@casadanora.pt",
    "phone": "928 021 696",
    "source": "https://cm-castelobranco.pt/visitante/descanse-no-nosso-concelho/alojamento-local/",
    "observation": "Alojamento local em Salgueiro do Campo.",
    "opportunity": "Criar suportes de apresentação do alojamento.",
    "service": "design"
  },
  {
    "company": "PSIFARO",
    "sector": "Psicologia e saúde mental",
    "email_area": "Saúde Mental",
    "location": "Faro, Faro",
    "website": "https://psifaro.pt/",
    "email": "geral@psifaro.pt",
    "phone": "289 075 778",
    "source": "https://pub.psifaro.pt/contactos/",
    "observation": "Centro com sede e clínica em Faro.",
    "opportunity": "Criar suportes informativos de consultas.",
    "service": "design"
  },
  {
    "company": "MedPires Clinic",
    "sector": "Clínica médica",
    "email_area": "Saúde",
    "location": "Faro, Faro",
    "website": "https://medpiresclinic.pt/",
    "email": "atendimento@medpiresclinic.pt",
    "phone": "289 802 171",
    "source": "https://medpiresclinic.pt/contactos",
    "observation": "Clínica com instalações em Faro e Quarteira.",
    "opportunity": "Criar materiais de informação sobre consultas.",
    "service": "design"
  },
  {
    "company": "Ferral",
    "sector": "Serralharia civil",
    "email_area": "Indústria & Produção",
    "location": "Leça do Balio, Porto",
    "website": "https://www.ferral.pt/",
    "email": "geral@ferral.pt",
    "phone": "229 513 643",
    "source": "https://www.ferral.pt/contactos",
    "observation": "Produz caixilharias, portões e estruturas metálicas.",
    "opportunity": "Criar catálogo de soluções e acabamentos.",
    "service": "design"
  },
  {
    "company": "CMDV",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Viseu, Viseu",
    "website": "https://cmdv.pt/",
    "email": "atendimento@cmdviseu.com",
    "phone": "232 421 793",
    "source": "https://cmdv.pt/",
    "observation": "Clínica médica dentária de Viseu.",
    "opportunity": "Criar peças informativas sobre especialidades.",
    "service": "design"
  },
  {
    "company": "Green Man Gerês",
    "sector": "Turismo de natureza",
    "email_area": "Aventura",
    "location": "Campo do Gerês, Braga",
    "website": "https://www.greenmangeres.com/",
    "email": "info@greenmangeres.com",
    "phone": "913 948 596",
    "source": "https://geres.pt/greenmangeresat/",
    "observation": "Organiza caminhadas e passeios de jipe no Gerês.",
    "opportunity": "Criar materiais para apresentação de experiências.",
    "service": "ambas"
  },
  {
    "company": "NatourGerês",
    "sector": "Animação turística",
    "email_area": "Aventura",
    "location": "Rio Caldo, Braga",
    "website": "https://www.natourgeres.com/",
    "email": "info@natourgeres.com",
    "phone": "914 885 322",
    "source": "https://turismo.cm-terrasdebouro.pt/listings/natourgeres/",
    "observation": "Organiza passeios de jipe e percursos pedestres.",
    "opportunity": "Criar suportes de divulgação de atividades.",
    "service": "ambas"
  },
  {
    "company": "Geresmont",
    "sector": "Animação turística",
    "email_area": "Aventura",
    "location": "Vilar da Veiga, Braga",
    "website": "https://geresmont.com/",
    "email": "info@geresmont.com",
    "phone": "966 793 234",
    "source": "https://geresativo.cm-terrasdebouro.pt/empresa/geresmont/",
    "observation": "Organiza atividades de natureza e aventura.",
    "opportunity": "Criar materiais gráficos de experiências.",
    "service": "ambas"
  },
  {
    "company": "GlamTours",
    "sector": "Turismo de natureza",
    "email_area": "Aventura",
    "location": "Vieira do Minho, Braga",
    "website": "https://glamtours.pt/",
    "email": "geral@glamtours.pt",
    "phone": "962 289 774",
    "source": "https://glamtours.pt/contactos",
    "observation": "Operador de experiências privadas de natureza e aventura.",
    "opportunity": "Criar suportes comerciais de programas turísticos.",
    "service": "ambas"
  },
  {
    "company": "Restaurante Muralhas",
    "sector": "Restaurante",
    "email_area": "Restauração",
    "location": "Leiria, Leiria",
    "website": "https://muralhas.pt/",
    "email": "geral@muralhas.pt",
    "phone": "244 032 138",
    "source": "https://www.visiteleiria.pt/ondecomer/restaurante-muralhas/",
    "observation": "Restaurante com gastronomia portuguesa e rooftop.",
    "opportunity": "Criar peças para divulgação da carta e eventos.",
    "service": "ambas"
  },
  {
    "company": "Civil On",
    "sector": "Engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://www.civilon.pt/",
    "email": "geral@civilon.pt",
    "phone": "272 034 458",
    "source": "https://www.civilon.pt/contactos/",
    "observation": "Presta serviços de certificação energética e projetos.",
    "opportunity": "Criar apresentações dos serviços de engenharia.",
    "service": "design"
  },
  {
    "company": "Vectorplano",
    "sector": "Engenharia e construção",
    "email_area": "Construção & Engenharia",
    "location": "Guarda, Guarda",
    "website": "https://www.vectorplano.pt/",
    "email": "geral@vectorplano.pt",
    "phone": "961 099 807",
    "source": "https://ruis.aiccopn.pt/empresas/vectorplano-projeto-construcao-e-engenharia-lda/",
    "observation": "Empresa de projeto, construção e engenharia.",
    "opportunity": "Criar materiais de apresentação de projetos.",
    "service": "design"
  },
  {
    "company": "Aprender À Grande",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Odivelas, Lisboa",
    "website": "https://aprenderagrande.pt/",
    "email": "geral@aprenderagrande.pt",
    "phone": "219 330 842",
    "source": "https://aprenderagrande.pt/contactos",
    "observation": "Centro de estudos e explicações em Odivelas.",
    "opportunity": "Criar materiais para apresentação dos serviços educativos.",
    "service": "ambas"
  },
  {
    "company": "Marques e Nunes",
    "sector": "Construção e remodelação",
    "email_area": "Construção & Engenharia",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://www.marquesenunes.pt/",
    "email": "geral@marquesenunes.pt",
    "phone": "966 109 046",
    "source": "https://www.marquesenunes.pt/contactos/",
    "observation": "Empresa de construção e remodelação desde 1990.",
    "opportunity": "Criar suportes de apresentação de obras.",
    "service": "design"
  },
  {
    "company": "Eliseu e Farinha",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://efconstrucoes.pt/",
    "email": "geral@eliseuefarinha.pt",
    "phone": "272 347 365",
    "source": "https://efconstrucoes.pt/contactos/",
    "observation": "Empresa de construção com escritório em Castelo Branco.",
    "opportunity": "Criar apresentações comerciais de projetos.",
    "service": "design"
  },
  {
    "company": "PEC Engenharia",
    "sector": "Engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://pecengenharia.pt/",
    "email": "projectos@pecengenharia.pt",
    "phone": "272 092 964",
    "source": "https://pecengenharia.pt/contactos/",
    "observation": "Empresa de engenharia com escritório em Castelo Branco.",
    "opportunity": "Criar materiais de apresentação de serviços.",
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
 console.log('[crm] seed 2026-10-30-e:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-10-30-e:',e.message)}
