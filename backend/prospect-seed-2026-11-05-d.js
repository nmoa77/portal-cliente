// DUIT — Portugal continental, 2026-11-05 (quarta execução). Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Visurb",
    "sector": "Engenharia, construção e reabilitação",
    "email_area": "Construção & Engenharia",
    "location": "Viseu, Viseu",
    "website": "https://visurb.pt/",
    "email": "geral@visurb.pt",
    "phone": "968 339 226",
    "source": "https://visurb.pt/pt/contactos",
    "observation": "Empresa sediada em Viseu com serviços de engenharia, construção, reabilitação e remodelação.",
    "opportunity": "Criar apresentações visuais de obras e serviços técnicos.",
    "service": "design"
  },
  {
    "company": "ANC Construção Civil",
    "sector": "Construção civil e obras públicas",
    "email_area": "Construção & Engenharia",
    "location": "Viseu, Viseu",
    "website": "https://anc-construcoes.pt/",
    "email": "geral@anc-construcoes.pt",
    "phone": "232 428 075",
    "source": "https://anc-construcoes.pt/contactos",
    "observation": "Empresa de construção civil e obras públicas sediada em Viseu.",
    "opportunity": "Criar materiais comerciais para apresentar serviços e portefólio de obras.",
    "service": "design"
  },
  {
    "company": "Construpersal",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Viseu, Viseu",
    "website": "https://construpersal.pt/",
    "email": "geral@construpersal.pt",
    "phone": "966 379 636",
    "source": "https://construpersal.pt/contactos/",
    "observation": "Empresa de construção civil fundada em 1971 com presença em Viseu e Figueira da Foz.",
    "opportunity": "Criar portefólios e peças comerciais de projetos concluídos.",
    "service": "design"
  },
  {
    "company": "ASFormação",
    "sector": "Explicações e formação profissional",
    "email_area": "Educação & Formação",
    "location": "Aveiro, Aveiro",
    "website": "https://www.asformacao.com/",
    "email": "geral@asformacao.com",
    "phone": "234 420 883",
    "source": "https://www.asformacao.com/site/contactos/",
    "observation": "Centro com explicações, estudo acompanhado e formação profissional em Aveiro.",
    "opportunity": "Criar materiais gráficos para cursos, inscrições e calendário formativo.",
    "service": "ambas"
  },
  {
    "company": "Agro 121",
    "sector": "Máquinas agrícolas e assistência técnica",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Beja, Beja",
    "website": "https://www.agro121.com/",
    "email": "geral@agro121.pt",
    "phone": "284 070 258",
    "source": "https://www.agro121.com/contactos",
    "observation": "Empresa de máquinas agrícolas com oficina, peças e assistência técnica em Beja.",
    "opportunity": "Criar fichas comerciais de equipamentos e serviços de assistência.",
    "service": "design"
  },
  {
    "company": "FisioIN",
    "sector": "Fisioterapia e terapias manuais",
    "email_area": "Fisioterapia",
    "location": "Leiria, Leiria",
    "website": "https://fisioin.com/",
    "email": "geral@fisioin.com",
    "phone": "244 092 222",
    "source": "https://fisioin.com/contactos-fale-connosco/",
    "observation": "Clínica de fisioterapia e terapias manuais em Leiria.",
    "opportunity": "Criar materiais informativos sobre tratamentos e serviços clínicos.",
    "service": "design"
  },
  {
    "company": "Damião & Belo",
    "sector": "Construção, engenharia e reabilitação",
    "email_area": "Construção & Engenharia",
    "location": "Portalegre, Portalegre",
    "website": "https://damiaoebelo.pt/",
    "email": "geral@d-b.pt",
    "phone": "245 202 424",
    "source": "https://damiaoebelo.pt/contactos",
    "observation": "Construtora portuguesa com atividade em edificação, obra pública e reabilitação.",
    "opportunity": "Criar apresentações institucionais e de projetos para apoio comercial.",
    "service": "design"
  },
  {
    "company": "Imobiliária Henrique Figueiredo",
    "sector": "Construção e imobiliário",
    "email_area": "Imobiliário",
    "location": "Viseu, Viseu",
    "website": "https://imobiliariahf.com/",
    "email": "geral@imobiliariahf.com",
    "phone": "916 781 212",
    "source": "https://imobiliariahf.com/contactos/",
    "observation": "Empresa ligada à construção de edifícios de habitação, comércio e serviços para venda.",
    "opportunity": "Criar materiais de apresentação de empreendimentos e imóveis.",
    "service": "ambas"
  },
  {
    "company": "Another Step",
    "sector": "Educação, formação e consultoria",
    "email_area": "Educação & Formação",
    "location": "Torres Novas, Santarém",
    "website": "https://anotherstep.pt/",
    "email": "info@anotherstep.pt",
    "phone": "249 825 213",
    "source": "https://anotherstep.pt/contactos",
    "observation": "Empresa vocacionada para educação, formação e consultoria, sediada em Torres Novas.",
    "opportunity": "Criar materiais gráficos para programas formativos e comunicação institucional.",
    "service": "ambas"
  },
  {
    "company": "HigiLethes",
    "sector": "Higiene e limpeza profissional",
    "email_area": "Comércio & Retalho",
    "location": "Ponte de Lima, Viana do Castelo",
    "website": "https://www.higilethes.pt/",
    "email": "geral@higilethes.pt",
    "phone": "258 028 234",
    "source": "https://www.higilethes.pt/contactos/",
    "observation": "Comercializa sistemas de higiene e limpeza profissional em Ponte de Lima.",
    "opportunity": "Criar catálogos e fichas visuais para produtos e soluções profissionais.",
    "service": "design"
  },
  {
    "company": "Telágueda",
    "sector": "Eletricidade, AVAC e videovigilância",
    "email_area": "Tecnologia & Digital",
    "location": "Águeda, Aveiro",
    "website": "https://www.telagueda.pt/",
    "email": "geral@telagueda.pt",
    "phone": "234 690 180",
    "source": "https://www.telagueda.pt/",
    "observation": "Empresa de Águeda com projetos de quadros elétricos, AVAC, videovigilância e controlo de acessos.",
    "opportunity": "Criar materiais técnicos e comerciais para apresentar soluções e projetos.",
    "service": "design"
  },
  {
    "company": "Embalágueda",
    "sector": "Materiais e soluções de embalagem",
    "email_area": "Indústria & Produção",
    "location": "Águeda, Aveiro",
    "website": "https://www.embalagueda.pt/",
    "email": "geral@embalagueda.pt",
    "phone": "913 433 819",
    "source": "https://www.embalagueda.pt/pt_pt/company",
    "observation": "Empresa de Águeda dedicada à venda de materiais e soluções de embalagem.",
    "opportunity": "Criar catálogos e fichas de produto para apoio comercial.",
    "service": "design"
  },
  {
    "company": "Eira & Pereira",
    "sector": "Carpintaria e mobiliário",
    "email_area": "Indústria & Produção",
    "location": "Oliveira de Azeméis, Aveiro",
    "website": "https://eiraepereira.pt/",
    "email": "info@eiraepereira.pt",
    "phone": "256 692 572",
    "source": "https://eiraepereira.pt/contactos/",
    "observation": "Empresa de carpintaria, cozinhas e mobiliário com fabrico próprio.",
    "opportunity": "Criar portefólios visuais de projetos e materiais de apresentação.",
    "service": "design"
  },
  {
    "company": "WTT Workers",
    "sector": "Trabalho temporário e recursos humanos",
    "email_area": "Serviços Profissionais",
    "location": "Caldas da Rainha, Leiria",
    "website": "https://wtt.pt/",
    "email": "geral@wtt.pt",
    "phone": "",
    "source": "https://wtt.pt/",
    "observation": "Empresa de trabalho temporário com presença em Caldas da Rainha e Lisboa.",
    "opportunity": "Criar materiais institucionais e de recrutamento para diferentes perfis.",
    "service": "design"
  },
  {
    "company": "TATRA Construções",
    "sector": "Remodelação e construção",
    "email_area": "Construção & Engenharia",
    "location": "Abrantes, Santarém",
    "website": "https://tatra.pt/",
    "email": "info@tatra.pt",
    "phone": "929 029 283",
    "source": "https://tatra.pt/contactos/",
    "observation": "Empresa de remodelações completas, pintura, pavimentos, canalização e instalação elétrica.",
    "opportunity": "Criar portefólio comercial de remodelações e serviços especializados.",
    "service": "design"
  },
  {
    "company": "Moleiro Contabilidade",
    "sector": "Contabilidade e gestão",
    "email_area": "Serviços Profissionais",
    "location": "Caldas da Rainha, Leiria",
    "website": "https://moleirocontabilidade.pt/",
    "email": "geral@moleirocontabilidade.pt",
    "phone": "262 835 255",
    "source": "https://moleirocontabilidade.pt/",
    "observation": "Empresa de contabilidade, assessoria fiscal, apoio à gestão e recursos humanos.",
    "opportunity": "Criar materiais institucionais para explicar serviços e propostas de valor.",
    "service": "design"
  },
  {
    "company": "LimaLOG Transportes",
    "sector": "Transportes e logística",
    "email_area": "Transportes & Logística",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://www.limalog.pt/",
    "email": "info@limalog.pt",
    "phone": "258 822 178",
    "source": "https://www.limalog.pt/",
    "observation": "Empresa transitária com transporte rodoviário e logística na Península Ibérica.",
    "opportunity": "Criar apresentações comerciais de serviços, rotas e capacidade logística.",
    "service": "design"
  },
  {
    "company": "VivaCor",
    "sector": "Indústria e soluções de acabamento",
    "email_area": "Indústria & Produção",
    "location": "Águeda, Aveiro",
    "website": "https://vivacor.pt/",
    "email": "geral@vivacor.pt",
    "phone": "234 622 881",
    "source": "https://vivacor.pt/contactos/",
    "observation": "Empresa industrial sediada na Zona Industrial de Assequins, Águeda.",
    "opportunity": "Criar materiais comerciais e fichas visuais de soluções industriais.",
    "service": "design"
  },
  {
    "company": "Ambiente S.A.",
    "sector": "Produtos e soluções industriais",
    "email_area": "Indústria & Produção",
    "location": "Marinha Grande, Leiria",
    "website": "https://www.ambiente-sa.com/",
    "email": "info@ambiente-sa.com",
    "phone": "244 840 500",
    "source": "https://www.ambiente-sa.com/contactos/",
    "observation": "Empresa sediada na Marinha Grande com catálogo de produtos e atendimento comercial.",
    "opportunity": "Criar catálogos e suportes de apresentação de produtos.",
    "service": "design"
  },
  {
    "company": "JLF Rent",
    "sector": "Aluguer de veículos",
    "email_area": "Automóvel",
    "location": "Águeda, Aveiro",
    "website": "https://jlfrent.pt/",
    "email": "geral@jlfrent.pt",
    "phone": "234 244 060",
    "source": "https://jlfrent.pt/contactos/",
    "observation": "Empresa de aluguer de veículos com sede em Águeda e pontos de encontro em Albergaria-a-Velha e Mealhada.",
    "opportunity": "Criar peças visuais para categorias de veículos e condições de aluguer.",
    "service": "ambas"
  },
  {
    "company": "JS Electrónica",
    "sector": "Eletrónica, eletricidade e reparação",
    "email_area": "Comércio & Retalho",
    "location": "Caldas da Rainha, Leiria",
    "website": "https://jselectronica.pt/",
    "email": "geral@jselectronica.pt",
    "phone": "262 845 948",
    "source": "https://jselectronica.pt/sobre-nos/",
    "observation": "Loja e assistência técnica de eletrónica e equipamentos profissionais nas Caldas da Rainha.",
    "opportunity": "Criar materiais de produto e serviços para comunicação em loja e canais digitais.",
    "service": "ambas"
  },
  {
    "company": "Inovadisplay",
    "sector": "Displays e soluções para ponto de venda",
    "email_area": "Indústria & Produção",
    "location": "Águeda, Aveiro",
    "website": "https://www.inovadisplay.com/",
    "email": "geral@inovadisplay.pt",
    "phone": "234 660 620",
    "source": "https://www.inovadisplay.com/",
    "observation": "Empresa de Águeda dedicada a soluções personalizadas para ponto de venda.",
    "opportunity": "Criar apresentações comerciais e casos de projeto para apoio a vendas.",
    "service": "design"
  },
  {
    "company": "Amivatio",
    "sector": "Produtos de reparação, manutenção e ferramentas",
    "email_area": "Comércio & Retalho",
    "location": "Caldas da Rainha, Leiria",
    "website": "https://amivatio.com/",
    "email": "geral@amivatio.com",
    "phone": "262 096 504",
    "source": "https://amivatio.com/quem-somos/",
    "observation": "Empresa de distribuição de produtos de reparação, manutenção e ferramentas.",
    "opportunity": "Criar catálogos e fichas de produto mais orientados para equipas comerciais.",
    "service": "design"
  },
  {
    "company": "Sialnor",
    "sector": "Sistemas de alumínio para arquitetura",
    "email_area": "Construção & Engenharia",
    "location": "Macedo de Cavaleiros, Bragança",
    "website": "https://www.sialnor.pt/",
    "email": "geral@sialnor.pt",
    "phone": "278 420 180",
    "source": "https://www.sialnor.pt/contactos/",
    "observation": "Empresa de sistemas de alumínio com unidades em Macedo de Cavaleiros e Vila Real.",
    "opportunity": "Criar documentação comercial e apresentações de sistemas e projetos.",
    "service": "design"
  },
  {
    "company": "A. J. Dias - Transportes",
    "sector": "Transporte rodoviário de mercadorias",
    "email_area": "Transportes & Logística",
    "location": "Macedo de Cavaleiros, Bragança",
    "website": "https://www.ajdias.com/",
    "email": "geral@ajdias.com",
    "phone": "278 421 927",
    "source": "https://www.ajdias.com/",
    "observation": "Empresa de transporte rodoviário com distribuição, grupagem e armazenamento temporário.",
    "opportunity": "Criar apresentação comercial de serviços, rotas e tipos de carga.",
    "service": "design"
  },
  {
    "company": "Casa Isidoro",
    "sector": "Materiais de construção",
    "email_area": "Comércio & Retalho",
    "location": "Lamego, Viseu",
    "website": "https://casaisidoro.pt/",
    "email": "geral@casaisidoro.pt",
    "phone": "254 697 000",
    "source": "https://casaisidoro.pt/pages/sobre-nos",
    "observation": "Empresa familiar de materiais e equipamentos para construção e remodelação.",
    "opportunity": "Criar materiais de loja e catálogos visuais por gama de produto.",
    "service": "ambas"
  },
  {
    "company": "SPC-ICS",
    "sector": "Inspeções e segurança de equipamentos",
    "email_area": "Serviços Profissionais",
    "location": "Elvas, Portalegre",
    "website": "https://spc-ics.com/",
    "email": "info@spc-ics.com",
    "phone": "268 621 416",
    "source": "https://spc-ics.com/contactos/",
    "observation": "Empresa de inspeções técnicas e segurança sediada em Elvas.",
    "opportunity": "Criar materiais explicativos de serviços, certificações e processos de inspeção.",
    "service": "design"
  },
  {
    "company": "Macmel",
    "sector": "Mel e produtos da colmeia",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Macedo de Cavaleiros, Bragança",
    "website": "https://www.macmel.pt/",
    "email": "geral@macmel.pt",
    "phone": "278 105 343",
    "source": "https://geoparkterrasdecavaleiros.pt/gpoip/95/117",
    "observation": "Produtor de mel e derivados em Macedo de Cavaleiros com atividade ligada à apicultura.",
    "opportunity": "Criar materiais de produto, embalagem e conteúdos sobre origem e produção.",
    "service": "ambas"
  },
  {
    "company": "Bid Harbour",
    "sector": "Serviços empresariais e industriais",
    "email_area": "Serviços Profissionais",
    "location": "Montemor-o-Novo, Évora",
    "website": "https://www.bidharbour.com/",
    "email": "info@bidharbour.com",
    "phone": "266 092 801",
    "source": "https://www.bidharbour.com/?cat=contactos",
    "observation": "Empresa sediada na Zona Industrial da Adua, Montemor-o-Novo.",
    "opportunity": "Criar apresentação institucional e materiais comerciais dos serviços.",
    "service": "design"
  },
  {
    "company": "Moutinho Automóveis",
    "sector": "Comércio e oficina automóvel",
    "email_area": "Automóvel",
    "location": "Mirandela, Bragança",
    "website": "https://mlauto.pt/",
    "email": "geral@mlauto.pt",
    "phone": "934 592 260",
    "source": "https://mlauto.pt/contactos/",
    "observation": "Empresa automóvel com stands em Valpaços, Mirandela e Macedo de Cavaleiros e oficina própria.",
    "opportunity": "Criar peças comerciais para stock, serviços de oficina e campanhas sazonais.",
    "service": "ambas"
  },
  {
    "company": "Clínica Dentária Dr. Fernandes",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Viseu, Viseu",
    "website": "https://www.clinicadrfernandes.com/",
    "email": "geral@clinicadrfernandes.com",
    "phone": "232 421 530",
    "source": "https://www.clinicadrfernandes.com/inicio/contactos/",
    "observation": "Clínica dentária em Viseu com cuidados de saúde oral e tratamentos de ortodontia.",
    "opportunity": "Criar materiais informativos para tratamentos e educação do paciente.",
    "service": "design"
  },
  {
    "company": "Cliniviseu",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Viseu, Viseu",
    "website": "https://www.cliniviseu.com/",
    "email": "geral@cliniviseu.com",
    "phone": "232 422 692",
    "source": "https://www.cliniviseu.com/contactos-viseu/",
    "observation": "Clínica médica dentária sediada em Viseu.",
    "opportunity": "Criar materiais visuais para explicar especialidades e percursos de tratamento.",
    "service": "design"
  },
  {
    "company": "Clínica Gisela Sousa",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Viseu, Viseu",
    "website": "https://clinicagiselasousa.com/",
    "email": "geral@clinicagiselasousa.com",
    "phone": "232 405 268",
    "source": "https://clinicagiselasousa.com/contactos/",
    "observation": "Clínica médica e dentária em Viseu com tratamentos de ortodontia e implantologia.",
    "opportunity": "Criar conteúdos visuais educativos sobre tratamentos e cuidados de saúde oral.",
    "service": "design"
  },
  {
    "company": "Clínica RR",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Viseu, Viseu",
    "website": "https://clinicarr.com/",
    "email": "geral@clinicarr.com",
    "phone": "232 411 595",
    "source": "https://clinicarr.com/contactos/",
    "observation": "Clínica médica dentária licenciada em Viseu.",
    "opportunity": "Criar materiais informativos para tratamentos, prevenção e acompanhamento.",
    "service": "design"
  },
  {
    "company": "Auto Nogueira",
    "sector": "Oficina e reparação automóvel",
    "email_area": "Automóvel",
    "location": "Braga, Braga",
    "website": "https://www.autonogueira.pt/",
    "email": "geral@autonogueira.pt",
    "phone": "253 674 078",
    "source": "https://www.autonogueira.pt/contactos/",
    "observation": "Oficina de reparação automóvel sediada em Braga.",
    "opportunity": "Criar materiais de serviço e campanhas sazonais para manutenção automóvel.",
    "service": "ambas"
  },
  {
    "company": "Oralook",
    "sector": "Laboratório de prótese dentária",
    "email_area": "Dentistas",
    "location": "Santa Eufémia, Leiria",
    "website": "https://oralook.pt/",
    "email": "info@oralook.pt",
    "phone": "244 099 230",
    "source": "https://oralook.pt/contactos/",
    "observation": "Laboratório de prótese dentária com soluções CAD-CAM e produção de goteiras e próteses.",
    "opportunity": "Criar materiais técnicos e comerciais dirigidos a clínicas e médicos dentistas.",
    "service": "design"
  },
  {
    "company": "Gentilcare",
    "sector": "Fisioterapia e reabilitação",
    "email_area": "Fisioterapia",
    "location": "Setúbal, Setúbal",
    "website": "https://gentilcare.pt/",
    "email": "geral@gentilcare.pt",
    "phone": "265 187 902",
    "source": "https://gentilcare.pt/services/fisioterapia/",
    "observation": "Clínica em Setúbal com fisioterapia em várias áreas de intervenção.",
    "opportunity": "Criar materiais informativos por área clínica e tipo de reabilitação.",
    "service": "design"
  },
  {
    "company": "HN Transportes",
    "sector": "Transporte rodoviário de mercadorias",
    "email_area": "Transportes & Logística",
    "location": "Oliveira de Azeméis, Aveiro",
    "website": "https://hntransportes.pt/",
    "email": "info@hntransportes.pt",
    "phone": "913 310 440",
    "source": "https://hntransportes.pt/termos.html",
    "observation": "Empresa licenciada para transporte rodoviário de mercadorias com sede em Cesar, Oliveira de Azeméis.",
    "opportunity": "Criar apresentação comercial de serviços de transporte e capacidade operacional.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-05).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');
  added++;
 }})();
 console.log('[crm] seed 2026-11-05-d:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-05-d:',e.message)}
