const crypto=require('crypto');
const bcrypt=require('bcryptjs');
const db=require('./db');
const {wasDeleted}=require('./prospect-deleted-guard');
const prospects=[
  {
    "company": "Carpintaria Moreira",
    "sector": "Carpintaria e mobiliário por medida",
    "location": "Oleirinhos, Bragança",
    "website": "https://moreiracarpintaria.pt/",
    "email": "geral@moreiracarpintaria.pt",
    "phone": "273 322 662",
    "source": "https://moreiracarpintaria.pt/",
    "observation": "O site descreve cozinhas, roupeiros, portas e pavimentos por medida.",
    "opportunity": "Criar catálogo gráfico de soluções por medida.",
    "service": "design"
  },
  {
    "company": "Gardi",
    "sector": "Jardinagem e venda de plantas",
    "location": "Funchal, Madeira",
    "website": "https://gardi.pt/",
    "email": "geral@gardi.pt",
    "phone": "+351 932 129 501",
    "source": "https://gardi.pt/",
    "observation": "O site apresenta venda de plantas, sistemas de rega, construção e manutenção de jardins.",
    "opportunity": "Comunicar projetos de jardins e serviços com conteúdos visuais.",
    "service": "ambas"
  },
  {
    "company": "Land & Sea Alentejo",
    "sector": "Turismo e transfers",
    "location": "Beja, Beja",
    "website": "https://www.landseaalentejo.com/pt/",
    "email": "info@landseaalentejo.com",
    "phone": "+351 965 589 291",
    "source": "https://www.landseaalentejo.com/pt/",
    "observation": "O site apresenta roteiros culturais, enoturismo e serviços de transfer.",
    "opportunity": "Desenvolver peças de promoção de roteiros e experiências.",
    "service": "ambas"
  },
  {
    "company": "Santos & Mota",
    "sector": "Serralharia e estruturas metálicas",
    "location": "Canedo, Santa Maria da Feira, Aveiro",
    "website": "https://www.santosemota.com/",
    "email": "geral@santosemota.com",
    "phone": "+351 227 633 874",
    "source": "https://www.santosemota.com/",
    "observation": "O site publica um portfólio de estruturas metálicas, gradeamentos e escadarias.",
    "opportunity": "Organizar portfólio comercial por tipos de projeto.",
    "service": "design"
  },
  {
    "company": "Metrocar",
    "sector": "Comércio de peças automóveis",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://metrocar.pt/",
    "email": "geral@metrocar.pt",
    "phone": "272 322 850",
    "source": "https://metrocar.pt/",
    "observation": "O site apresenta loja de peças multimarca, campanhas e notícias.",
    "opportunity": "Criar peças de divulgação de produtos e campanhas.",
    "service": "design"
  },
  {
    "company": "Arte & Flor",
    "sector": "Florista e decoração de eventos",
    "location": "Coimbra, Coimbra",
    "website": "https://arteeflor.nicepage.io/",
    "email": "geral@arteeflor.pt",
    "phone": "917 505 061",
    "source": "https://arteeflor.nicepage.io/",
    "observation": "O site descreve decoração de espaços e eventos, assinaturas e arte floral.",
    "opportunity": "Comunicar arranjos e projetos de eventos em suportes digitais.",
    "service": "ambas"
  },
  {
    "company": "Atelier Ana Aguiar",
    "sector": "Decoração de interiores",
    "location": "Coimbra, Coimbra",
    "website": "https://www.atelieranaaguiar.pt/",
    "email": "info@atelieranaaguiar.pt",
    "phone": "+351 965 471 609",
    "source": "https://www.atelieranaaguiar.pt/",
    "observation": "O site identifica atelier de decoração de interiores e contactos em Coimbra.",
    "opportunity": "Criar apresentações visuais de serviços e projetos.",
    "service": "design"
  },
  {
    "company": "RDR Reciclagem",
    "sector": "Reciclagem automóvel e peças usadas",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://www.rdr-reciclagem.pt/",
    "email": "geral@rdr-reciclagem.pt",
    "phone": "+351 272 325 453",
    "source": "https://www.rdr-reciclagem.pt/servicos/",
    "observation": "O site identifica centro de abate licenciado e venda de peças.",
    "opportunity": "Explicar serviços e disponibilidade de peças em materiais comerciais.",
    "service": "design"
  },
  {
    "company": "Ponto Chave",
    "sector": "Chaves e fechaduras",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://pontochave.pt/",
    "email": "geral@pontochave.pt",
    "phone": "272 343 037",
    "source": "https://pontochave.pt/",
    "observation": "O site apresenta duplicação de chaves, fechaduras e assistência automóvel.",
    "opportunity": "Criar peças informativas por serviço e público-alvo.",
    "service": "design"
  },
  {
    "company": "Mimos & Comp.ª",
    "sector": "Comércio de presentes",
    "location": "Pombal, Leiria",
    "website": "https://prendasnet.com/",
    "email": "loja@prendasnet.com",
    "phone": "236 213 022",
    "source": "https://prendasnet.com/contactos",
    "observation": "O site identifica lojas em Pombal e Coimbra e um contacto profissional.",
    "opportunity": "Promover coleções e ocasiões de oferta com conteúdos visuais.",
    "service": "ambas"
  },
  {
    "company": "All House",
    "sector": "Comércio de decoração",
    "location": "Coimbra, Coimbra",
    "website": "https://allhouse.pt/pt/",
    "email": "clientes@allhouse.pt",
    "phone": "239 946 528",
    "source": "https://allhouse.pt/pt/",
    "observation": "A loja online apresenta têxteis e artigos de decoração e contactos das lojas.",
    "opportunity": "Desenvolver conteúdos de produtos e campanhas sazonais.",
    "service": "ambas"
  },
  {
    "company": "Pires & Duarte",
    "sector": "Comércio e assistência técnica",
    "location": "Escalos de Cima, Castelo Branco",
    "website": "https://pireseduarte.pt/",
    "email": "geral@pireseduarte.pt",
    "phone": "272 425 538",
    "source": "https://pireseduarte.pt/lojas",
    "observation": "O site identifica sede e serviço de assistência técnica em Castelo Branco.",
    "opportunity": "Distinguir graficamente áreas de venda e assistência.",
    "service": "design"
  },
  {
    "company": "Restaurante Dois Irmãos",
    "sector": "Restauração",
    "location": "Faro, Faro",
    "website": "http://www.restaurantedoisirmaos.com",
    "email": "info@restaurantedoisirmaos.com",
    "phone": "+351 289 823 337",
    "source": "https://www.visitportugal.com/pt-pt/content/adega-dois-irm%C3%A3os",
    "observation": "O portal oficial de turismo identifica restaurante familiar em Faro e email profissional.",
    "opportunity": "Criar materiais de comunicação de especialidades e reservas.",
    "service": "design"
  },
  {
    "company": "Matobra",
    "sector": "Materiais de construção e decoração",
    "location": "Coimbra, Coimbra",
    "website": "https://www.matobra.pt/",
    "email": "mail@matobra.pt",
    "phone": "239 433 778",
    "source": "https://www.matobra.pt/contactos",
    "observation": "O site identifica showroom de cozinhas, decoração e casas de banho.",
    "opportunity": "Produzir peças comerciais segmentadas por categorias.",
    "service": "design"
  }
];
try {
  for(const col of ['email_observation','instagram','outreach_channel','dm_message','dm_status']) {
    try { db.prepare('ALTER TABLE prospect_crm ADD COLUMN '+col+' TEXT').run(); }
    catch(e) { if(!/duplicate column/i.test(e.message)) throw e; }
  }
  const byCompany=db.prepare('SELECT id FROM users WHERE is_prospect=1 AND lower(trim(company))=lower(trim(?))');
  const byEmail=db.prepare('SELECT id FROM users WHERE lower(trim(email))=lower(trim(?))');
  const bySite=db.prepare("SELECT user_id FROM prospect_crm WHERE lower(trim(coalesce(website,'')))=lower(trim(?))");
  const addUser=db.prepare('INSERT INTO users(name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES(?,?,?,?,?,?,1,0)');
  const addCrm=db.prepare("INSERT INTO prospect_crm(user_id,sector,location,website,opportunity,idea,email_observation,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,outreach_channel,updated_at) VALUES(?,?,?,?,?,?,?,'intermedio',?,200,100,'por_contactar','normal',?,?,'email',datetime('now'))");
  const password=bcrypt.hashSync(crypto.randomBytes(24).toString('hex'),10);
  const seenEmails=new Set(),seenCompanies=new Set(),seenSites=new Set();
  let added=0,skipped=0;
  db.transaction(()=>{
    for(const x of prospects){
      const email=x.email.trim().toLowerCase();
      const company=x.company.trim().toLowerCase();
      const site=x.website.replace(/\/$/,'').toLowerCase();
      const domain=email.split('@')[1];
      const host=new URL(x.website).hostname.toLowerCase().replace(/^www\./,'');
      const forbidden=/^(gmail\.com|hotmail\.com|outlook\.com|yahoo\.com|icloud\.com|sapo\.pt)$/i;
      if(!domain||forbidden.test(domain)||email.startsWith('noreply@')||wasDeleted(email)||seenEmails.has(email)||seenCompanies.has(company)||seenSites.has(site)||byCompany.get(x.company)||byEmail.get(email)||bySite.get(x.website)){skipped++;continue;}
      if(domain!==host && !x.source){skipped++;continue;}
      seenEmails.add(email);seenCompanies.add(company);seenSites.add(site);
      const id=Number(addUser.run(x.company,email,password,'client',x.company,x.phone).lastInsertRowid);
      const serviceText=x.service==='design'?'design gráfico e materiais comerciais':x.service==='redes'?'gestão de redes sociais':'design gráfico e comunicação nas redes sociais';
      const proposal='Olá, sou o Nuno, da DUIT. Estive a conhecer a '+x.company+' e posso ajudar com '+serviceText+'. Se lhe fizer sentido, terei gosto em conversar consigo. Cumprimentos, Nuno.';
      addCrm.run(id,x.sector,x.location,x.website,x.opportunity,x.service,x.source+' — email profissional publicado na fonte indicada.',x.opportunity,x.observation+' Serviço sugerido: '+x.service+'. Fonte: '+x.source,proposal);
      added++;
    }
  })();
  console.log('[crm] seed 2026-10-19:',added,'adicionados,',skipped,'ignorados');
} catch(e) {console.warn('[crm] seed 2026-10-19:',e.message);}
