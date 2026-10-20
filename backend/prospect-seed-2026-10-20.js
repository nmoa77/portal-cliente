const crypto=require('crypto');
const bcrypt=require('bcryptjs');
const db=require('./db');
const {wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "RTPS Engenharia & Construção",
    "sector": "Construção civil",
    "location": "Leiria, Leiria",
    "website": "https://www.rtps.pt/",
    "email": "construcoes@rtps.pt",
    "phone": "+351 964 495 865",
    "source": "https://www.rtps.pt/",
    "observation": "Construção residencial, comercial e remodelações.",
    "opportunity": "Criar apresentações gráficas de serviços e projetos.",
    "service": "design"
  },
  {
    "company": "JJCARS",
    "sector": "Oficina automóvel",
    "location": "Repeses, Viseu",
    "website": "https://www.jjcars.pt/",
    "email": "geral@jjcars.pt",
    "phone": "232 099 821",
    "source": "https://www.jjcars.pt/",
    "observation": "Oficina com mecânica, eletrónica e pneus.",
    "opportunity": "Criar peças de comunicação por especialidade.",
    "service": "design"
  },
  {
    "company": "Brites Motores",
    "sector": "Comércio automóvel",
    "location": "Viseu, Viseu",
    "website": "https://britesmotores.com/",
    "email": "automoveis@britesmotores.com",
    "phone": "914 226 771",
    "source": "https://britesmotores.com/contactos/",
    "observation": "Stand multimarca com apresentação de viaturas.",
    "opportunity": "Desenvolver peças de apresentação de viaturas e campanhas.",
    "service": "ambas"
  },
  {
    "company": "Nelo Car's",
    "sector": "Oficina automóvel",
    "location": "Viseu, Viseu",
    "website": "https://nelocars.pt/",
    "email": "geral@nelocars.pt",
    "phone": "925 472 875",
    "source": "https://nelocars.pt/",
    "observation": "Oficina com revisões e reparação de motores.",
    "opportunity": "Comunicar serviços de manutenção em peças informativas.",
    "service": "design"
  },
  {
    "company": "Ímpar Auto",
    "sector": "Comércio automóvel",
    "location": "Viseu, Viseu",
    "website": "https://imparauto.pt/",
    "email": "geral@imparauto.pt",
    "phone": "934 260 573",
    "source": "https://imparauto.pt/",
    "observation": "Stand com catálogo de viaturas usadas.",
    "opportunity": "Criar materiais visuais para apresentação do stock.",
    "service": "ambas"
  },
  {
    "company": "AutoCancelas",
    "sector": "Oficina de escapes automóveis",
    "location": "Viseu, Viseu",
    "website": "https://autocancelas.com/",
    "email": "geral@autocancelas.com",
    "phone": "232 411 918",
    "source": "https://autocancelas.com/",
    "observation": "Empresa especializada em escapes e componentes automóveis.",
    "opportunity": "Preparar catálogo gráfico de produtos e serviços.",
    "service": "design"
  },
  {
    "company": "Sul Villas & Spa",
    "sector": "Alojamento turístico",
    "location": "Lagoa, São Miguel, Açores",
    "website": "https://www.sulvillasazores.com/",
    "email": "reservations@sulvillasazores.com",
    "phone": null,
    "source": "https://www.sulvillasazores.com/",
    "observation": "Alojamento com spa e piscina em São Miguel.",
    "opportunity": "Promover experiências de estadia com conteúdos visuais.",
    "service": "ambas"
  },
  {
    "company": "À do Toni",
    "sector": "Mercearia e produtos regionais",
    "location": "Campo Maior, Portalegre",
    "website": "https://www.adotoni.com/",
    "email": "geral@adotoni.com",
    "phone": "965 533 991",
    "source": "https://www.adotoni.com/",
    "observation": "Mercearia com frescos, charcutaria e queijos.",
    "opportunity": "Criar comunicação de produtos regionais e campanhas.",
    "service": "ambas"
  },
  {
    "company": "CGEA Vale do Tua",
    "sector": "Formação agrícola",
    "location": "Mirandela, Bragança",
    "website": "https://valedotua.com/",
    "email": "geral@valedotua.com",
    "phone": "278 203 509",
    "source": "https://valedotua.com/",
    "observation": "Centro com formação agrícola presencial e online.",
    "opportunity": "Criar materiais gráficos para divulgação de cursos.",
    "service": "design"
  },
  {
    "company": "EcoTree",
    "sector": "Projetos e construção sustentável",
    "location": "Évora, Évora",
    "website": "https://www.ecotree.pt/",
    "email": "geral@ecotree.pt",
    "phone": "962 181 697",
    "source": "https://www.ecotree.pt/contactos/",
    "observation": "Empresa de arquitetura e construção sustentável.",
    "opportunity": "Apresentar projetos e soluções de construção sustentável.",
    "service": "design"
  },
  {
    "company": "Evoflex",
    "sector": "Remodelação e construção",
    "location": "Évora, Évora",
    "website": "https://evoflex.pt/",
    "email": "geral@evoflex.pt",
    "phone": "966 311 420",
    "source": "https://evoflex.pt/contacto/",
    "observation": "Empresa de obras e remodelações em Évora.",
    "opportunity": "Organizar comunicação gráfica de serviços e obras.",
    "service": "design"
  },
  {
    "company": "MGETENSÃO",
    "sector": "Instalações elétricas e comunicações",
    "location": "Évora, Évora",
    "website": "https://www.mgetensao.pt/",
    "email": "geral@mgetensao.pt",
    "phone": "266 247 194",
    "source": "https://www.mgetensao.pt/contatos/",
    "observation": "Empresa de projetos e instalações elétricas.",
    "opportunity": "Desenvolver apresentações de serviços técnicos.",
    "service": "design"
  },
  {
    "company": "Maria Bolota",
    "sector": "Comércio de produtos",
    "location": "Ponte de Sor, Portalegre",
    "website": "https://mariabolota.pt/",
    "email": "geral@mariabolota.pt",
    "phone": "918 278 580",
    "source": "https://mariabolota.pt/contactos/",
    "observation": "Loja com contactos e sede em Ponte de Sor.",
    "opportunity": "Produzir peças de apresentação de produtos.",
    "service": "design"
  },
  {
    "company": "LSF Indústrias Metalúrgicas",
    "sector": "Metalurgia e serralharia",
    "location": "Rocas do Vouga, Aveiro",
    "website": "https://lsf-metal.com/",
    "email": "marco.rocha@lsf-metal.com",
    "phone": null,
    "source": "https://lsf-metal.com/",
    "observation": "Empresa de estruturas metálicas, montagens e fachadas.",
    "opportunity": "Criar portfólio comercial de obras e soluções.",
    "service": "design"
  },
  {
    "company": "Materi.alls",
    "sector": "Serralharia personalizada",
    "location": "Gafanha da Encarnação, Aveiro",
    "website": "https://materialls.pt/",
    "email": "comercial@materialls.pt",
    "phone": "910 579 355",
    "source": "https://materialls.pt/",
    "observation": "Empresa de serralharia e produtos metálicos à medida.",
    "opportunity": "Criar catálogo visual de soluções personalizadas.",
    "service": "design"
  },
  {
    "company": "Viaggio Transportes e Logística",
    "sector": "Transportes e logística",
    "location": "Setúbal, Setúbal",
    "website": "https://viaggiotrans-logistica.com/",
    "email": "info@viaggiotrans-logistica.com",
    "phone": "910 281 623",
    "source": "https://viaggiotrans-logistica.com/contact-us/",
    "observation": "Empresa de transporte e distribuição de mercadorias.",
    "opportunity": "Criar apresentação de serviços logísticos.",
    "service": "design"
  },
  {
    "company": "Evolus",
    "sector": "Transportes turísticos",
    "location": "Setúbal, Setúbal",
    "website": "https://evolus.pt/",
    "email": "evolus@evolus.pt",
    "phone": "265 092 016",
    "source": "https://evolus.pt/",
    "observation": "Operador de transporte turístico com frota de várias lotações.",
    "opportunity": "Promover serviços de transporte e roteiros.",
    "service": "ambas"
  },
  {
    "company": "Bordal",
    "sector": "Bordados tradicionais",
    "location": "Funchal, Madeira",
    "website": "https://bordal.pt/",
    "email": "bordal@bordal.pt",
    "phone": "291 222 965",
    "source": "https://visitmadeira.com/pt/o-que-fazer/apaixonados-por-cultura/artesanato/",
    "observation": "Empresa de bordado tradicional identificada no portal turístico oficial.",
    "opportunity": "Comunicar coleções e tradição artesanal.",
    "service": "ambas"
  },
  {
    "company": "Água da Madeira",
    "sector": "Perfumes e produtos regionais",
    "location": "Câmara de Lobos, Madeira",
    "website": "https://aguadamadeira.pt/",
    "email": "info@aguadamadeira.pt",
    "phone": "291 940 286",
    "source": "https://www.visitmadeira.com/pt/o-que-fazer/associados-animacao-turistica/agua-da-madeira/",
    "observation": "Marca de fragrâncias e produtos inspirados na Madeira.",
    "opportunity": "Criar conteúdos visuais para diferentes linhas de produtos.",
    "service": "ambas"
  },
  {
    "company": "NATUR-al-CARNES",
    "sector": "Produção e comercialização pecuária",
    "location": "Portalegre, Portalegre",
    "website": "https://www.naturalcarnes.com/",
    "email": "geral@naturalcarnes.com",
    "phone": "245 366 227",
    "source": "https://www.naturalcarnes.com/contactos/",
    "observation": "Agrupamento de produtores pecuários do Norte Alentejo.",
    "opportunity": "Criar materiais de apresentação de origem e produtos.",
    "service": "design"
  },
  {
    "company": "Ludefer",
    "sector": "Construções metálicas",
    "location": "Aveiro, Aveiro",
    "website": "https://ludefer.pt/",
    "email": "geral@ludefer.pt",
    "phone": "234 318 097",
    "source": "https://ludefer.pt/contactos/",
    "observation": "Empresa de estruturas metálicas com departamento de comunicação identificado.",
    "opportunity": "Desenvolver portfólio técnico de projetos.",
    "service": "design"
  },
  {
    "company": "Metal Focus",
    "sector": "Serralharia e construção metálica",
    "location": "Covões, Cantanhede, Coimbra",
    "website": "https://metalfocus.pt/",
    "email": "geral@metalfocus.pt",
    "phone": "231 460 199",
    "source": "https://metalfocus.pt/fotogaleria/",
    "observation": "Empresa de serralharia com galeria de obras.",
    "opportunity": "Organizar galeria em portfólio comercial.",
    "service": "design"
  },
  {
    "company": "Experiences AZ",
    "sector": "Alojamento e experiências turísticas",
    "location": "Ilha do Pico, Açores",
    "website": "https://azores.com.pt/",
    "email": "exp@azoresx.com",
    "phone": "968 803 179",
    "source": "https://azores.com.pt/pt/contacts",
    "observation": "Site apresenta alojamentos e experiências na ilha do Pico.",
    "opportunity": "Promover alojamentos e atividades em peças digitais.",
    "service": "ambas"
  }
];
try {
for(const col of ['email_observation','instagram','outreach_channel','dm_message','dm_status']){try{db.prepare('ALTER TABLE prospect_crm ADD COLUMN '+col+' TEXT').run()}catch(e){if(!/duplicate column/i.test(e.message))throw e}}
const existsCompany=db.prepare('SELECT id FROM users WHERE is_prospect=1 AND lower(trim(company))=lower(trim(?))');
const existsEmail=db.prepare('SELECT id FROM users WHERE lower(trim(email))=lower(trim(?))');
const existsSite=db.prepare("SELECT user_id FROM prospect_crm WHERE lower(trim(coalesce(website,'')))=lower(trim(?))");
const addUser=db.prepare('INSERT INTO users(name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES(?,?,?,?,?,?,1,0)');
const addCrm=db.prepare("INSERT INTO prospect_crm(user_id,sector,location,website,opportunity,idea,email_observation,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,outreach_channel,updated_at) VALUES(?,?,?,?,?,?,?,'intermedio',?,200,100,'por_contactar','normal',?,?,'email',datetime('now'))");
const password=bcrypt.hashSync(crypto.randomBytes(24).toString('hex'),10);let added=0,skipped=0;const seen=new Set();
db.transaction(()=>{for(const x of L){const email=x.email.trim().toLowerCase();const key=x.company.trim().toLowerCase();const domain=email.split('@')[1];const host=new URL(x.website).hostname.toLowerCase().replace(/^www\./,'');const forbidden=/^(gmail\.com|hotmail\.com|outlook\.com|yahoo\.com|icloud\.com|sapo\.pt)$/i;
if(!domain||forbidden.test(domain)||email.startsWith('noreply@')||wasDeleted(email)||seen.has(email)||seen.has(key)||existsCompany.get(x.company)||existsEmail.get(email)||existsSite.get(x.website)){skipped++;continue;}
if(domain!==host&&!x.source){skipped++;continue;}seen.add(email);seen.add(key);
const id=Number(addUser.run(x.company,email,password,'client',x.company,x.phone).lastInsertRowid);
const service=x.service==='design'?'design gráfico e materiais comerciais':x.service==='redes'?'gestão de redes sociais':'design gráfico e comunicação nas redes sociais';
const proposal='Olá, sou o Nuno, da DUIT. Estive a conhecer a '+x.company+' e posso ajudar com '+service+'. Se lhe fizer sentido, terei gosto em conversar consigo. Cumprimentos, Nuno.';
addCrm.run(id,x.sector,x.location,x.website,x.opportunity,x.service,x.source+' — email profissional publicado na fonte indicada.',x.opportunity,x.observation+' Serviço sugerido: '+x.service+'. Fonte: '+x.source,proposal);added++;}})();
console.log('[crm] seed 2026-10-20:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-10-20:',e.message)}
