// DUIT — 2026-11-19. Contactos profissionais públicos verificados em fontes empresariais e institucionais.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Serralharia A. F. Lopes",
    "sector": "Serralharia e caixilharia",
    "email_area": "Indústria & Produção",
    "location": "Vila Chã de Sá, Viseu",
    "website": "https://serralhariafl.com",
    "email": "geral@serralhariafl.com",
    "phone": "232469913",
    "source": "https://contribuinte.pt/nif/508878802/serralharia-aflopes-unipessoal-lda",
    "observation": "A fonte indicada apresenta a atividade de serralharia e caixilharia e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de serralharia e caixilharia.",
    "service": "design"
  },
  {
    "company": "Serralharia Rui & Vieira",
    "sector": "Serralharia e construções metálicas",
    "email_area": "Indústria & Produção",
    "location": "Souselo, Cinfães, Viseu",
    "website": "https://serralhariaruivieira.pt",
    "email": "geral@serralhariaruivieira.pt",
    "phone": "255640749",
    "source": "https://serralhariaruivieira.pt/contactos/",
    "observation": "A fonte indicada apresenta a atividade de serralharia e construções metálicas e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de serralharia e construções metálicas.",
    "service": "design"
  },
  {
    "company": "Varela Construção",
    "sector": "Construção e remodelação",
    "email_area": "Construção & Engenharia",
    "location": "Treixedo, Santa Comba Dão, Viseu",
    "website": "https://varelaconstrucao.com",
    "email": "geral@varelaconstrucao.com",
    "phone": "962560448",
    "source": "https://ruis.aiccopn.pt/empresas/varela-construcao-lda/",
    "observation": "A fonte indicada apresenta a atividade de construção e remodelação e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de construção e remodelação.",
    "service": "design"
  },
  {
    "company": "Assisfluxo",
    "sector": "Automação e equipamentos industriais",
    "email_area": "Indústria & Produção",
    "location": "Bragança, Bragança",
    "website": "https://assisfluxo.pt",
    "email": "geral@assisfluxo.pt",
    "phone": "273094947",
    "source": "https://assisfluxo.pt/",
    "observation": "A fonte indicada apresenta a atividade de automação e equipamentos industriais e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de automação e equipamentos industriais.",
    "service": "design"
  },
  {
    "company": "Herdade Água d'Alte",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Redondo, Évora",
    "website": "https://herdadeaguadalte.pt",
    "email": "geral@herdadeaguadalte.pt",
    "phone": "961695637",
    "source": "https://herdadeaguadalte.pt/?currency=eur",
    "observation": "A fonte indicada apresenta a atividade de turismo rural e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Serralharia Civil Nova Forma",
    "sector": "Serralharia civil",
    "email_area": "Indústria & Produção",
    "location": "São Martinho de Orgens, Viseu",
    "website": "https://novaforma.pt",
    "email": "geral@novaforma.pt",
    "phone": "232411983",
    "source": "https://roteirosdeportugal.pt/rtcl_listing/serralharia-civil-nova-forma-lda/",
    "observation": "A fonte indicada apresenta a atividade de serralharia civil e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de serralharia civil.",
    "service": "design"
  },
  {
    "company": "Ferroviseu",
    "sector": "Comércio de ferro e derivados",
    "email_area": "Comércio & Retalho",
    "location": "Vila Chã de Sá, Viseu",
    "website": "https://ferroviseu.pt",
    "email": "geral@ferroviseu.pt",
    "phone": "232954745",
    "source": "https://ferroviseu.pt/",
    "observation": "A fonte indicada apresenta a atividade de comércio de ferro e derivados e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de comércio de ferro e derivados.",
    "service": "design"
  },
  {
    "company": "ALC Dance Studios",
    "sector": "Escola de dança",
    "email_area": "Estúdios de Dança",
    "location": "Vila Nova de Gaia, Porto",
    "website": "https://alcdance.pt",
    "email": "gaia@alcdance.pt",
    "phone": "227138727",
    "source": "https://www.alcdance.pt/pages/contactos",
    "observation": "A fonte indicada apresenta a atividade de escola de dança e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de escola de dança.",
    "service": "design"
  },
  {
    "company": "UDance",
    "sector": "Escola de dança",
    "email_area": "Estúdios de Dança",
    "location": "Lisboa, Lisboa",
    "website": "https://udance.pt",
    "email": "geral@udance.pt",
    "phone": "912160967",
    "source": "https://www.udance.pt/contacto",
    "observation": "A fonte indicada apresenta a atividade de escola de dança e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de escola de dança.",
    "service": "design"
  },
  {
    "company": "ACTION Performing Arts Center",
    "sector": "Escola de dança",
    "email_area": "Estúdios de Dança",
    "location": "Porto, Porto",
    "website": "https://actioncenter.pt",
    "email": "geral@actioncenter.pt",
    "phone": "915437508",
    "source": "https://www.portaldadanca.pt/escolas/action-performing-arts-center/",
    "observation": "A fonte indicada apresenta a atividade de escola de dança e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de escola de dança.",
    "service": "design"
  },
  {
    "company": "CMI Évora",
    "sector": "Medicina integrativa",
    "email_area": "Saúde",
    "location": "Évora, Évora",
    "website": "https://cmievora.pt",
    "email": "geral@cmievora.pt",
    "phone": "926762900",
    "source": "https://www.cmievora.pt/",
    "observation": "A fonte indicada apresenta a atividade de medicina integrativa e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de medicina integrativa.",
    "service": "design"
  },
  {
    "company": "Quinta de Fiães",
    "sector": "Agroturismo",
    "email_area": "Turismo & Alojamento",
    "location": "Vilar de Maçada, Alijó, Vila Real",
    "website": "https://quintadefiaes.pt",
    "email": "geral@quintadefiaes.pt",
    "phone": "259919275",
    "source": "https://www.cardapio.pt/turismo-rural/dir/d/vila-real/c/alijo/p-19717/quinta-de-fiaes/contactos/",
    "observation": "A fonte indicada apresenta a atividade de agroturismo e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de agroturismo.",
    "service": "design"
  },
  {
    "company": "Escola de Ballet do Porto",
    "sector": "Escola de ballet",
    "email_area": "Estúdios de Dança",
    "location": "Porto, Porto",
    "website": "https://escoladeballetdoporto.pt",
    "email": "geral@escoladeballetdoporto.pt",
    "phone": "226169031",
    "source": "https://www.portaldadanca.pt/escolas/escola-de-ballet-do-porto/",
    "observation": "A fonte indicada apresenta a atividade de escola de ballet e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de escola de ballet.",
    "service": "design"
  },
  {
    "company": "Glamping Hills",
    "sector": "Glamping e alojamento",
    "email_area": "Turismo & Alojamento",
    "location": "Santa Comba de Rossas, Bragança",
    "website": "https://glampinghills.pt",
    "email": "geral@glampinghills.pt",
    "phone": "938712419",
    "source": "https://travelmagg.pt/turismo-rural/artigos/glamping-hills-braganca-oito-anos/",
    "observation": "A fonte indicada apresenta a atividade de glamping e alojamento e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de glamping e alojamento.",
    "service": "design"
  },
  {
    "company": "Quinta da Corredoura Hotel Rural",
    "sector": "Turismo rural e restauração",
    "email_area": "Turismo & Alojamento",
    "location": "São Torcato, Guimarães, Braga",
    "website": "https://quintadacorredourahotelrural.pt",
    "email": "geral@quintadacorredourahotelrural.pt",
    "phone": "912354560",
    "source": "https://www.quintadacorredourahotelrural.pt/termos-condicoes/",
    "observation": "A fonte indicada apresenta a atividade de turismo rural e restauração e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de turismo rural e restauração.",
    "service": "design"
  },
  {
    "company": "Senpapor",
    "sector": "Construção civil e obras públicas",
    "email_area": "Construção & Engenharia",
    "location": "Portalegre, Portalegre",
    "website": "https://senpapor.pt",
    "email": "geral@senpapor.pt",
    "phone": "245203448",
    "source": "https://senpapor.pt/",
    "observation": "A fonte indicada apresenta a atividade de construção civil e obras públicas e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de construção civil e obras públicas.",
    "service": "design"
  },
  {
    "company": "MaiaPerfil",
    "sector": "Serralharia e estruturas metálicas",
    "email_area": "Indústria & Produção",
    "location": "Fátima, Ourém, Santarém",
    "website": "https://maiaperfil.pt",
    "email": "geral@maiaperfil.pt",
    "phone": "244741334",
    "source": "https://maiaperfil.pt/",
    "observation": "A fonte indicada apresenta a atividade de serralharia e estruturas metálicas e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de serralharia e estruturas metálicas.",
    "service": "design"
  },
  {
    "company": "Casa dos Gomes",
    "sector": "Agroturismo",
    "email_area": "Turismo & Alojamento",
    "location": "São João de Lourosa, Viseu",
    "website": "https://casadosgomes.pt",
    "email": "geral@casadosgomes.pt",
    "phone": "964365220",
    "source": "https://www.allaboutportugal.pt/pt/viseu/hoteis/casa-dos-gomes",
    "observation": "A fonte indicada apresenta a atividade de agroturismo e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de agroturismo.",
    "service": "design"
  },
  {
    "company": "Dialogus",
    "sector": "Clínica de psicologia e terapias",
    "email_area": "Saúde Mental",
    "location": "Faro, Faro",
    "website": "https://dialogus.pt",
    "email": "geral@dialogus.pt",
    "phone": "289075605",
    "source": "https://dialogus.pt/equipa/",
    "observation": "A fonte indicada apresenta a atividade de clínica de psicologia e terapias e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de clínica de psicologia e terapias.",
    "service": "design"
  },
  {
    "company": "Clínica Médica José Viana",
    "sector": "Clínica médica",
    "email_area": "Saúde",
    "location": "Faro, Faro",
    "website": "https://clinicaviana.pt",
    "email": "geral@clinicaviana.pt",
    "phone": "289821624",
    "source": "https://clinicaviana.pt/sobre-a-clinica/",
    "observation": "A fonte indicada apresenta a atividade de clínica médica e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de clínica médica.",
    "service": "design"
  },
  {
    "company": "Socalor",
    "sector": "Sistemas de climatização",
    "email_area": "Construção & Engenharia",
    "location": "Elvas, Portalegre",
    "website": "https://socalor.com",
    "email": "geral@socalor.com",
    "phone": "268623333",
    "source": "https://ruis.aiccopn.pt/empresas/socalor-sistemas-climatizacao-lda/",
    "observation": "A fonte indicada apresenta a atividade de sistemas de climatização e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de sistemas de climatização.",
    "service": "design"
  },
  {
    "company": "Academia do Saber Coimbra",
    "sector": "Centro de estudos e explicações",
    "email_area": "Centro de Estudos",
    "location": "Coimbra, Coimbra",
    "website": "https://explicacoescoimbra.pt",
    "email": "geral@explicacoescoimbra.pt",
    "phone": "239151924",
    "source": "https://www.explicacoescoimbra.pt/index.php/contactos",
    "observation": "A fonte indicada apresenta a atividade de centro de estudos e explicações e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de centro de estudos e explicações.",
    "service": "design"
  },
  {
    "company": "Artifer Serralharia",
    "sector": "Serralharia e estruturas metálicas",
    "email_area": "Indústria & Produção",
    "location": "Taboeira, Aveiro",
    "website": "https://artifer.pt",
    "email": "geral@artifer.pt",
    "phone": "234111777",
    "source": "https://www.artifer.pt/",
    "observation": "A fonte indicada apresenta a atividade de serralharia e estruturas metálicas e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de serralharia e estruturas metálicas.",
    "service": "design"
  },
  {
    "company": "MPS Metalomecânica",
    "sector": "Metalomecânica e sistemas de alumínio",
    "email_area": "Indústria & Produção",
    "location": "Cedrim, Sever do Vouga, Aveiro",
    "website": "https://mpsmetal.pt",
    "email": "geral@mpsmetal.pt",
    "phone": "234552758",
    "source": "https://www.mpsmetal.pt/pt_pt/contacts",
    "observation": "A fonte indicada apresenta a atividade de metalomecânica e sistemas de alumínio e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de metalomecânica e sistemas de alumínio.",
    "service": "design"
  },
  {
    "company": "Casa da Praça Guest House",
    "sector": "Alojamento local",
    "email_area": "Turismo & Alojamento",
    "location": "Pinhel, Guarda",
    "website": "https://casadapracapinhel.com",
    "email": "geral@casadapracapinhel.com",
    "phone": "969465553",
    "source": "https://valedocoa.pt/alojamento/",
    "observation": "A fonte indicada apresenta a atividade de alojamento local e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de alojamento local.",
    "service": "design"
  },
  {
    "company": "Casas da Pedra",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Aldeia do Bispo, Sabugal, Guarda",
    "website": "https://casasdapedra.com",
    "email": "geral@casasdapedra.com",
    "phone": "271496224",
    "source": "https://valedocoa.pt/alojamento/",
    "observation": "A fonte indicada apresenta a atividade de turismo rural e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Casa Tapada dos Moinhos",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Seia, Guarda",
    "website": "https://casatapadadosmoinhos.pt",
    "email": "geral@casatapadadosmoinhos.pt",
    "phone": "238977069",
    "source": "https://www.cardapio.pt/turismo-rural/dir/d/guarda/c/seia/p-18929/casa-tapada-dos-moinhos/",
    "observation": "A fonte indicada apresenta a atividade de turismo rural e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Casa do Meio da Vila",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Loriga, Seia, Guarda",
    "website": "https://casadomeiodavila.com",
    "email": "geral@casadomeiodavila.com",
    "phone": "238953401",
    "source": "https://www.cardapio.pt/turismo-rural/dir/d/guarda/c/seia/p-20006/casa-do-meio-da-vila/",
    "observation": "A fonte indicada apresenta a atividade de turismo rural e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Unisolda",
    "sector": "Equipamentos e metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Taboeira, Aveiro",
    "website": "https://unisolda.pt",
    "email": "geral@unisolda.pt",
    "phone": "234313081",
    "source": "https://unisolda.pt/tornearia-e-fresagem",
    "observation": "A fonte indicada apresenta a atividade de equipamentos e metalomecânica e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de equipamentos e metalomecânica.",
    "service": "design"
  },
  {
    "company": "CVB Conceito Metálico",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Ílhavo, Aveiro",
    "website": "https://conceitometalico.pt",
    "email": "geral@conceitometalico.pt",
    "phone": "234327269",
    "source": "https://www.conceitometalico.pt/",
    "observation": "A fonte indicada apresenta a atividade de metalomecânica e o contacto profissional da empresa.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de metalomecânica.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-19).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-19:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-19:',e.message)}
