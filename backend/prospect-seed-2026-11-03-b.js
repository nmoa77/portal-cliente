// DUIT — Portugal continental, 2026-11-03. Contactos confirmados em páginas oficiais ou diretório AICCOPN.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Custódio Martins Transportes",
    "sector": "Transportes de mercadorias",
    "email_area": "Transportes & Logística",
    "location": "Ferreira do Zêzere, Santarém",
    "website": "https://www.custodiomartinstransportes.com/",
    "email": "geral@custodiomartinstransportes.com",
    "phone": "917 307 214",
    "source": "https://www.custodiomartinstransportes.com/",
    "observation": "Transporte nacional e internacional de mercadorias com temperatura controlada.",
    "opportunity": "Criar apresentação comercial dos serviços de transporte.",
    "service": "design"
  },
  {
    "company": "DG Metal Metalomecânica",
    "sector": "Soldadura industrial e montagem metálica",
    "email_area": "Indústria & Produção",
    "location": "Vieira de Leiria, Leiria",
    "website": "https://dgmetalomecanica.pt/",
    "email": "geral@dgmetalomecanica.pt",
    "phone": "910 748 852",
    "source": "https://dgmetalomecanica.pt/contactos/",
    "observation": "Presta serviços de soldadura industrial e montagem de estruturas metálicas.",
    "opportunity": "Preparar materiais de apresentação de capacidades técnicas.",
    "service": "design"
  },
  {
    "company": "Transportes Fátima Brígida",
    "sector": "Transportes rodoviários",
    "email_area": "Transportes & Logística",
    "location": "Amiais de Baixo, Santarém",
    "website": "https://fatimabrigida.com/",
    "email": "geral@fatimabrigida.com",
    "phone": "249 870 433",
    "source": "https://fatimabrigida.com/",
    "observation": "Transporte nacional e internacional de mercadorias.",
    "opportunity": "Apresentar rotas e serviços em peças comerciais.",
    "service": "design"
  },
  {
    "company": "SBC Carpintaria",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Mundão, Viseu",
    "website": "https://www.sbc-carpintaria.com/",
    "email": "info@sbc-carpintaria.com",
    "phone": "232 921 834",
    "source": "https://www.sbc-carpintaria.com/contactos/",
    "observation": "Carpintaria com instalações na Zona Industrial de Mundão.",
    "opportunity": "Criar catálogo de soluções e trabalhos de carpintaria.",
    "service": "design"
  },
  {
    "company": "Nomogno",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Viseu, Viseu",
    "website": "https://nomogno.pt/",
    "email": "geral@nomogno.pt",
    "phone": "232 412 225",
    "source": "https://nomogno.pt/contactos/",
    "observation": "Empresa de carpintaria com mais de 45 anos de experiência declarada.",
    "opportunity": "Organizar portefólio de trabalhos em suportes comerciais.",
    "service": "design"
  },
  {
    "company": "Carpintaria Vitti & Teixeira",
    "sector": "Carpintaria e mobiliário",
    "email_area": "Indústria & Produção",
    "location": "Vouzela, Viseu",
    "website": "https://carpintariavt.pt/",
    "email": "contacto@carpintariavt.pt",
    "phone": "928 360 053",
    "source": "https://carpintariavt.pt/",
    "observation": "Produz mobiliário personalizado em Fataunços, Vouzela.",
    "opportunity": "Criar materiais de apresentação de mobiliário por medida.",
    "service": "design"
  },
  {
    "company": "Duplometal",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Leiria, Leiria",
    "website": "https://duplometal.pt/",
    "email": "geral@duplometal.pt",
    "phone": "244 812 103",
    "source": "https://duplometal.pt/info/contactos/",
    "observation": "Empresa metalomecânica na zona industrial dos Pousos.",
    "opportunity": "Criar fichas e suportes gráficos de produtos e serviços.",
    "service": "design"
  },
  {
    "company": "Usimeca",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Pousos, Leiria",
    "website": "https://usimeca.pt/",
    "email": "usimeca@usimeca.pt",
    "phone": "244 801 590",
    "source": "https://usimeca.pt/",
    "observation": "Produz peças metalomecânicas e estruturas para moldes.",
    "opportunity": "Preparar apresentação visual das soluções industriais.",
    "service": "design"
  },
  {
    "company": "Casa Costa Carpintaria",
    "sector": "Carpintaria e marcenaria",
    "email_area": "Indústria & Produção",
    "location": "Bodiosa, Viseu",
    "website": "https://casacostacm.pt/",
    "email": "geral@casacostacm.pt",
    "phone": "232 972 434",
    "source": "https://casacostacm.pt/",
    "observation": "Carpintaria e marcenaria sediada em Queirela de Bodiosa.",
    "opportunity": "Criar catálogo visual de trabalhos de carpintaria.",
    "service": "design"
  },
  {
    "company": "Detalhe Carpintaria",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Viseu, Viseu",
    "website": "https://detalhecarpintaria.pt/",
    "email": "geral@detalhecarpintaria.pt",
    "phone": "232 098 360",
    "source": "https://detalhecarpintaria.pt/",
    "observation": "Empresa de carpintaria com contactos publicados em Viseu.",
    "opportunity": "Desenvolver apresentação gráfica dos serviços.",
    "service": "design"
  },
  {
    "company": "FPRM Logística",
    "sector": "Logística e transportes",
    "email_area": "Transportes & Logística",
    "location": "Rio Maior, Santarém",
    "website": "https://fprmlogistica.pt/",
    "email": "geral@fprmlogistica.pt",
    "phone": "243 093 118",
    "source": "https://fprmlogistica.pt/pt/contactos",
    "observation": "Presta serviços de transporte urgente e envio de encomendas.",
    "opportunity": "Apresentar soluções logísticas em materiais comerciais.",
    "service": "design"
  },
  {
    "company": "Plátano — Contabilidade e Serviços",
    "sector": "Contabilidade",
    "email_area": "Serviços Profissionais",
    "location": "Portalegre, Portalegre",
    "website": "https://contabilidade.platanoservicos.pt/",
    "email": "adelinomauricio@platanoservicos.pt",
    "phone": "245 202 049",
    "source": "https://contabilidade.platanoservicos.pt/contactos/",
    "observation": "Gabinete de contabilidade na Rua do Semeador, Portalegre.",
    "opportunity": "Criar materiais explicativos dos serviços contabilísticos.",
    "service": "design"
  },
  {
    "company": "Finanças 100 Dúvidas — Joana Machado Gomes",
    "sector": "Contabilidade e consultoria",
    "email_area": "Serviços Profissionais",
    "location": "Portalegre, Portalegre",
    "website": "https://financas100duvidas.com/",
    "email": "info@financas100duvidas.com",
    "phone": "",
    "source": "https://financas100duvidas.com/contacte-nos/",
    "observation": "Serviços de contabilidade e acompanhamento financeiro em Portalegre.",
    "opportunity": "Preparar conteúdos informativos sobre serviços e consultas.",
    "service": "design"
  },
  {
    "company": "JG Instalações Elétricas",
    "sector": "Instalações elétricas e energia",
    "email_area": "Construção & Engenharia",
    "location": "Mós, Bragança",
    "website": "https://jgie.net/",
    "email": "geral@jgie.net",
    "phone": "273 331 491",
    "source": "https://jgie.net/",
    "observation": "Realiza projetos, instalações elétricas e soluções de energia renovável.",
    "opportunity": "Criar apresentação de serviços e projetos técnicos.",
    "service": "design"
  },
  {
    "company": "AgroPeças",
    "sector": "Comércio de peças agrícolas",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Beja, Beja",
    "website": "https://agropecas.pt/",
    "email": "geral@agropecas.pt",
    "phone": "284 389 290",
    "source": "https://agropecas.pt/contactos/",
    "observation": "Comércio de peças e componentes para o setor agrícola em Beja.",
    "opportunity": "Criar suportes comerciais para gamas de peças.",
    "service": "design"
  },
  {
    "company": "AgroArea",
    "sector": "Serviços agrícolas",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Beja, Beja",
    "website": "https://agroarea.pt/",
    "email": "geral@agroarea.pt",
    "phone": "963 592 146",
    "source": "https://agroarea.pt/contactos/",
    "observation": "Empresa com atendimento na Rua Frei Amador Arrais, Beja.",
    "opportunity": "Criar apresentação visual dos serviços agrícolas.",
    "service": "design"
  },
  {
    "company": "Sulco",
    "sector": "Comércio de alfaias agrícolas",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Beja, Beja",
    "website": "https://www.sulco.pt/",
    "email": "geral@sulco.pt",
    "phone": "284 326 922",
    "source": "https://www.sulco.pt/",
    "observation": "Comercializa alfaias agrícolas e presta assistência técnica.",
    "opportunity": "Criar materiais comerciais de equipamentos e assistência.",
    "service": "design"
  },
  {
    "company": "Agro121",
    "sector": "Máquinas e assistência agrícola",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Beja, Beja",
    "website": "https://www.agro121.com/",
    "email": "geral@agro121.pt",
    "phone": "284 070 258",
    "source": "https://www.agro121.com/contactos",
    "observation": "Empresa de máquinas agrícolas com oficina, peças e assistência.",
    "opportunity": "Criar fichas comerciais dos equipamentos e serviços.",
    "service": "design"
  },
  {
    "company": "Agrosync",
    "sector": "Consultoria agrícola",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Beja, Beja",
    "website": "https://www.agrosync.pt/",
    "email": "geral@agrosync.pt",
    "phone": "915 033 766",
    "source": "https://www.agrosync.pt/contactos",
    "observation": "Consultoria em agricultura regenerativa e tecnologia de precisão.",
    "opportunity": "Criar materiais explicativos das soluções agrícolas.",
    "service": "design"
  },
  {
    "company": "Energlobo",
    "sector": "Instalações elétricas e térmicas",
    "email_area": "Construção & Engenharia",
    "location": "Bragança, Bragança",
    "website": "https://www.energlobo.pt/",
    "email": "geral@energlobo.pt",
    "phone": "912 608 594",
    "source": "https://www.energlobo.pt/",
    "observation": "Empresa de instalações elétricas, climatização e fotovoltaico.",
    "opportunity": "Apresentar soluções de energia em suportes informativos.",
    "service": "design"
  },
  {
    "company": "HPmotors",
    "sector": "Oficina automóvel",
    "email_area": "Automóvel",
    "location": "Guarda, Guarda",
    "website": "https://www.hpmotors.pt/",
    "email": "geral@hpmotors.pt",
    "phone": "927 532 829",
    "source": "https://www.hpmotors.pt/",
    "observation": "Oficina especializada em eletrónica e mecânica automóvel.",
    "opportunity": "Criar materiais de apresentação dos serviços de oficina.",
    "service": "design"
  },
  {
    "company": "Oliglobe",
    "sector": "Consultoria agrícola",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Beja, Beja",
    "website": "https://oliglobe.pt/",
    "email": "geral@oliglobe.pt",
    "phone": "",
    "source": "https://oliglobe.pt/",
    "observation": "Consultoria e acompanhamento técnico de olival e produção de azeite.",
    "opportunity": "Criar apresentação comercial dos serviços de consultoria.",
    "service": "design"
  },
  {
    "company": "EQ Auto",
    "sector": "Importação automóvel",
    "email_area": "Automóvel",
    "location": "Guarda, Guarda",
    "website": "https://eqauto.pt/",
    "email": "geral@eqauto.pt",
    "phone": "928 310 484",
    "source": "https://eqauto.pt/contactos/",
    "observation": "Empresa de importação e legalização automóvel na Guarda.",
    "opportunity": "Criar peças informativas sobre o processo de importação.",
    "service": "design"
  },
  {
    "company": "Agro Borrego Leonor & Irmão",
    "sector": "Comércio agrícola",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Almeirim, Santarém",
    "website": "https://www.borrego-leonor.com/",
    "email": "geral@borregoleonor.com.pt",
    "phone": "243 570 800",
    "source": "https://www.borrego-leonor.com/contactos",
    "observation": "Empresa familiar de comércio de fatores de produção agrícola.",
    "opportunity": "Criar materiais para divulgação de produtos e serviços.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-03).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');
  added++;
 }})();
 console.log('[crm] seed 2026-11-03-b:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-03-b:',e.message)}
