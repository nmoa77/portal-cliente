// DUIT — Portugal continental, 2026-11-11-e. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Score Tek",
    "sector": "Construção e renovação",
    "email_area": "Construção & Engenharia",
    "location": "Viseu, Viseu",
    "website": "https://scoretek.pt",
    "email": "info@scoretek.pt",
    "phone": "963268237",
    "source": "https://scoretek.pt/contactos/",
    "observation": "Construção e renovação em Viseu",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "André & Nuno – Construção Civil, Lda.",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Viseu, Viseu",
    "website": "https://anc-construcoes.pt",
    "email": "geral@anc-construcoes.pt",
    "phone": "232428075",
    "source": "https://anc-construcoes.pt/",
    "observation": "Construção, reconstrução e coberturas",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Construpersal",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Viseu, Viseu",
    "website": "https://construpersal.pt",
    "email": "geral@construpersal.pt",
    "phone": "966379636",
    "source": "https://construpersal.pt/contactos/",
    "observation": "Construção civil com sede em Viseu",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Visurb",
    "sector": "Engenharia e construção",
    "email_area": "Construção & Engenharia",
    "location": "Viseu, Viseu",
    "website": "https://visurb.pt",
    "email": "geral@visurb.pt",
    "phone": "968339226",
    "source": "https://visurb.pt/pt/contactos",
    "observation": "Construção, reabilitação e remodelação",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Construtora de Coimbrões, Lda.",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Viseu, Viseu",
    "website": "https://construtoradecoimbroes.pt",
    "email": "geral@construtoradecoimbroes.pt",
    "phone": "232414419",
    "source": "https://ruis.aiccopn.pt/empresas/construtora-de-coimbroes-lda/",
    "observation": "Construção civil e obras públicas",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Construções Izes, Unipessoal, Lda.",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Viseu, Viseu",
    "website": "https://construcoesizes.pt",
    "email": "geral@construcoesizes.pt",
    "phone": "232112445",
    "source": "https://ruis.aiccopn.pt/empresas/construcoes-izes-unipessoal-lda/",
    "observation": "Construção nova e reabilitação",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Monte Chalaça",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Ferreira do Alentejo, Beja",
    "website": "https://montechalaca.pt",
    "email": "geral@montechalaca.pt",
    "phone": "284739015",
    "source": "https://www.montechalaca.pt/contactos",
    "observation": "Turismo rural em Abegoaria",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Viscivil",
    "sector": "Projetos de engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Viseu, Viseu",
    "website": "https://viscivil.com",
    "email": "geral@viscivil.com",
    "phone": "232426200",
    "source": "https://www.viscivil.com/contactos/",
    "observation": "Projetos de engenharia para edifícios",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Domingos Alves da Silva & Irmãos, Lda.",
    "sector": "Serração e carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Guarda, Guarda",
    "website": "https://doalsil.com",
    "email": "geral@doalsil.com",
    "phone": "271238199",
    "source": "https://www.doalsil.com/",
    "observation": "Serração, carpintaria e materiais de construção",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Metalguarda – Indústria Metalúrgica S.A.",
    "sector": "Metalurgia",
    "email_area": "Indústria & Produção",
    "location": "Guarda, Guarda",
    "website": "https://metalguarda.pt",
    "email": "metalguarda@metalguarda.pt",
    "phone": "271223692",
    "source": "https://ruis.aiccopn.pt/empresas/metalguarda-industria-metalurgica-sa/",
    "observation": "Indústria metalúrgica e serralharia",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Vila Valmonte",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Ferreira do Alentejo, Beja",
    "website": "https://vilavalmonte.eu",
    "email": "info@vilavalmonte.eu",
    "phone": "917757354",
    "source": "https://www.vilavalmonte.eu/contactos/",
    "observation": "Alojamento de turismo rural",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Metalome",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Chaves, Vila Real",
    "website": "https://metalome.com",
    "email": "geral@metalome.com",
    "phone": "",
    "source": "https://metalome.com/contactos/",
    "observation": "Fabrico de componentes metalúrgicos",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Oficina da Fisio",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Braga, Braga",
    "website": "https://oficinadafisio.pt",
    "email": "geral@oficinadafisio.pt",
    "phone": "",
    "source": "https://oficinadafisio.pt/contactos/",
    "observation": "Serviços de fisioterapia em Braga",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Atelier – Arquitetura e Engenharia",
    "sector": "Arquitetura e engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Vila Verde, Braga",
    "website": "https://atelier.pt",
    "email": "geral@atelier.pt",
    "phone": "253321453",
    "source": "https://atelier.pt/contactos/",
    "observation": "Projetos de arquitetura e engenharia",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Cooptar – Atelier de Arquitetura",
    "sector": "Arquitetura",
    "email_area": "Construção & Engenharia",
    "location": "Faro, Faro",
    "website": "https://cooptar.pt",
    "email": "info@cooptar.pt",
    "phone": "966008770",
    "source": "https://encomenda.oasrs.org/directorio/detalhe/4ymswe/cooptar-atelier-de-arquitetura",
    "observation": "Projetos de arquitetura e urbanismo",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Metalúrgica Figueirense",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Figueira da Foz, Coimbra",
    "website": "https://mfmetalurgica.pt",
    "email": "geral@mfmetalurgica.pt",
    "phone": "233435915",
    "source": "https://mfmetalurgica.pt/contactos/",
    "observation": "Produção metalúrgica na Figueira da Foz",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Atelier Teresa Correia, Arquitetura e Urbanismo, Lda.",
    "sector": "Arquitetura",
    "email_area": "Construção & Engenharia",
    "location": "Faro, Faro",
    "website": "https://atcorreia.pt",
    "email": "atcorreia@atcorreia.pt",
    "phone": "289899040",
    "source": "https://encomenda.oasrs.org/directorio/detalhe/1zBueJ/atelier-teresa-correia-arquitetura-e-urbanismo-lda",
    "observation": "Arquitetura e urbanismo em Faro",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "MaisReabilitar",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Braga, Braga",
    "website": "https://maisreabilitar.pt",
    "email": "geral@maisreabilitar.pt",
    "phone": "917673723",
    "source": "https://maisreabilitar.pt/",
    "observation": "Gabinete de fisioterapia e reabilitação",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Blooverve",
    "sector": "Comércio de equipamentos de fisioterapia",
    "email_area": "Comércio & Retalho",
    "location": "Braga, Braga",
    "website": "https://blooverve.pt",
    "email": "info@blooverve.pt",
    "phone": "913778592",
    "source": "https://blooverve.com/contact",
    "observation": "Comércio online de consumíveis profissionais",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Fisioavançada",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Braga, Braga",
    "website": "https://fisioavancada.pt",
    "email": "geral@fisioavancada.pt",
    "phone": "915984965",
    "source": "https://www.fisioavancada.pt/",
    "observation": "Clínica de fisioterapia em Braga",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Escola Domus Dança",
    "sector": "Escola de dança",
    "email_area": "Estúdios de Dança",
    "location": "Porto, Porto",
    "website": "https://escoladomusdanca.org",
    "email": "edd@escoladomusdanca.org",
    "phone": "220927372",
    "source": "https://escoladomusdanca.org/",
    "observation": "Escola de dança no Porto",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Centro de Dança do Porto",
    "sector": "Escola de dança",
    "email_area": "Estúdios de Dança",
    "location": "Porto, Porto",
    "website": "https://centrodedancadoporto.com",
    "email": "geral@cdancaporto.pt",
    "phone": "228303786",
    "source": "https://centrodedancadoporto.com/Contactos-2",
    "observation": "Centro de formação em dança",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Cerâmica do Centro",
    "sector": "Cerâmica",
    "email_area": "Indústria & Produção",
    "location": "Leiria, Leiria",
    "website": "https://ceramicacentro.pt",
    "email": "geral@ceramicacentro.pt",
    "phone": "244619070",
    "source": "https://ceramicacentro.pt/",
    "observation": "Empresa de cerâmica em Leiria",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "CCA – Cerâmica Culinária e Alimentar",
    "sector": "Cerâmica",
    "email_area": "Indústria & Produção",
    "location": "Oliveira do Bairro, Aveiro",
    "website": "https://ccaceramica.com",
    "email": "geral@ccaceramica.com",
    "phone": "234730300",
    "source": "https://ccaceramica.com/contactos/",
    "observation": "Fabrico de cerâmica culinária",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Sabor Latino",
    "sector": "Escola de dança",
    "email_area": "Estúdios de Dança",
    "location": "Porto, Porto",
    "website": "https://saborlatino.pt",
    "email": "saborlatino@saborlatino.pt",
    "phone": "226095510",
    "source": "https://saborlatino.pt/contactos/",
    "observation": "Escola de dança e formação",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Porque Será Automóveis",
    "sector": "Comércio automóvel",
    "email_area": "Automóvel",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://porqueserautomoveis.pt",
    "email": "geral@porqueserautomoveis.pt",
    "phone": "962685077",
    "source": "https://www.porqueserautomoveis.pt/contactos",
    "observation": "Comércio de automóveis em Castelo Branco",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Metrocar",
    "sector": "Peças automóveis",
    "email_area": "Automóvel",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://metrocar.pt",
    "email": "geral@metrocar.pt",
    "phone": "272322850",
    "source": "https://metrocar.pt/index.php?controller=contact",
    "observation": "Comércio de peças automóveis",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Sorgila",
    "sector": "Matérias-primas cerâmicas",
    "email_area": "Indústria & Produção",
    "location": "Leiria, Leiria",
    "website": "https://sorgila.pt",
    "email": "geral@sorgila.pt",
    "phone": "244720580",
    "source": "https://sorgila.pt/empresa/",
    "observation": "Fornecedor de matérias-primas minerais",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Escola de Ballet do Porto",
    "sector": "Escola de dança",
    "email_area": "Estúdios de Dança",
    "location": "Porto, Porto",
    "website": "https://escoladeballetdoporto.pt",
    "email": "geral@escoladeballetdoporto.pt",
    "phone": "226169031",
    "source": "https://www.escoladeballetdoporto.pt/novidades/",
    "observation": "Ensino de ballet e dança",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Apolinário Turismo Rural",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Alfândega da Fé, Bragança",
    "website": "https://apolinarioturismo.com",
    "email": "geral@apolinarioturismo.com",
    "phone": "937124692",
    "source": "https://apolinarioturismo.com/contactos/",
    "observation": "Alojamento em Castro Vicente",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Global Embalagem",
    "sector": "Embalagens",
    "email_area": "Indústria & Produção",
    "location": "Marco de Canaveses, Porto",
    "website": "https://global-embalagem.pt",
    "email": "geral@global-embalagem.pt",
    "phone": "255538200",
    "source": "https://global-embalagem.pt/contactos",
    "observation": "Empresa de embalagens com instalações no Marco de Canaveses",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "4.Operations",
    "sector": "Recursos humanos",
    "email_area": "Serviços Profissionais",
    "location": "Évora, Évora",
    "website": "https://4operations.pt",
    "email": "info@4operations.pt",
    "phone": "211451083",
    "source": "https://www.4operations.pt/contactos",
    "observation": "Recrutamento especializado em transportes e logística",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "SAVV, Unipessoal, Lda.",
    "sector": "Transportes de mercadorias",
    "email_area": "Transportes & Logística",
    "location": "Évora, Évora",
    "website": "https://savv.pt",
    "email": "geral@savv.pt",
    "phone": "",
    "source": "https://scoring.pt/empresas-certificadas/savv",
    "observation": "Transportes nacionais e internacionais",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Lactoceleiro – Lacticínios e Produtos Regionais",
    "sector": "Lacticínios",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Fornos de Algodres, Guarda",
    "website": "https://lactoceleiro.pt",
    "email": "geral@lactoceleiro.pt",
    "phone": "271700140",
    "source": "https://www.confrariaqueijoserradaestrela.com/produtores",
    "observation": "Produção de lacticínios e produtos regionais",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Queijaria Vale da Estrela",
    "sector": "Queijaria",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Mangualde, Viseu",
    "website": "https://valedaestrela.pt",
    "email": "info@valedaestrela.pt",
    "phone": "232247644",
    "source": "https://www.confrariaqueijoserradaestrela.com/produtores",
    "observation": "Produção de queijo Serra da Estrela",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Alma Serrana",
    "sector": "Comércio de produtos regionais",
    "email_area": "Comércio & Retalho",
    "location": "Seia, Guarda",
    "website": "https://almaserrana.pt",
    "email": "geral@almaserrana.pt",
    "phone": "238311500",
    "source": "https://almaserrana.pt/",
    "observation": "Loja de produtos regionais",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Alentejo Transfers – Auto Táxis Modelares Dianenses",
    "sector": "Transportes turísticos",
    "email_area": "Transportes & Logística",
    "location": "Évora, Évora",
    "website": "https://alentejotransfers.com",
    "email": "geral@alentejotransfers.com",
    "phone": "968035386",
    "source": "https://www.alentejotransfers.com/contactos/",
    "observation": "Transfers e tours privados",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Queijos Casa Matias",
    "sector": "Queijaria",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Seia, Guarda",
    "website": "https://queijoscasamatias.com",
    "email": "info@queijoscasamatias.com",
    "phone": "238902250",
    "source": "https://125anosevb.drapc.gov.pt/documentos/guia_queijo_web.pdf",
    "observation": "Produção de queijo na Serra da Estrela",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Transportes do Alentejo Central",
    "sector": "Transportes de passageiros",
    "email_area": "Transportes & Logística",
    "location": "Évora, Évora",
    "website": "https://transportesdoalentejocentral.pt",
    "email": "geral@transportesdoalentejocentral.pt",
    "phone": "266048924",
    "source": "https://tpac.pt/contacts",
    "observation": "Transporte rodoviário de passageiros",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços e produtos.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-11-e).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-11-e:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-11-e:',e.message)}
