// DUIT — 2026-10-30. Fontes de email profissional verificadas publicamente nesta data.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "PCBEM — Informática",
    "sector": "Comércio de informática e assistência técnica",
    "email_area": "Tecnologia & Digital",
    "location": "Ponta Delgada, Açores",
    "website": "https://www.pcbem.pt/",
    "email": "geral@pcbem.pt",
    "phone": "296 654 500",
    "source": "https://www.pcbem.pt/contatos/",
    "observation": "Loja de informática com dois espaços em Ponta Delgada.",
    "opportunity": "Criar peças de apresentação de produtos e assistência técnica.",
    "service": "design"
  },
  {
    "company": "Carlos Sebastião — Materiais de Construção",
    "sector": "Comércio de materiais de construção",
    "email_area": "Comércio & Retalho",
    "location": "Relva, Ponta Delgada, Açores",
    "website": "https://carlossebastiao.eu/",
    "email": "geral@carlossebastiao.pt",
    "phone": "296 683 658",
    "source": "https://carlossebastiao.eu/",
    "observation": "Loja de ferramentas, ferragens, revestimentos e materiais de construção.",
    "opportunity": "Preparar catálogos e suportes promocionais por gama de produtos.",
    "service": "design"
  },
  {
    "company": "NAVEL Açores",
    "sector": "Máquinas e ferramentas industriais",
    "email_area": "Indústria & Produção",
    "location": "Pico da Pedra e Ponta Delgada, Açores",
    "website": "https://mail.navel.pt/",
    "email": "comercial@navel.pt",
    "phone": "296 630 120",
    "source": "https://mail.navel.pt/",
    "observation": "Comercialização e assistência de máquinas e equipamentos industriais nos Açores.",
    "opportunity": "Criar fichas comerciais e materiais para divulgação de equipamentos.",
    "service": "design"
  },
  {
    "company": "JAMÉ Surf Shop",
    "sector": "Loja de surf e desporto",
    "email_area": "Comércio & Retalho",
    "location": "Ponta Delgada, Açores",
    "website": "https://jame.pt/",
    "email": "geral@jame.pt",
    "phone": "296 282 229",
    "source": "https://www.solmaravenidacenter.com/lojas/jame-surf-shop/",
    "observation": "Loja de surf no Solmar Avenida Center, em Ponta Delgada.",
    "opportunity": "Criar peças de divulgação de artigos e novidades da loja.",
    "service": "ambas"
  },
  {
    "company": "Brignor — Revestimentos e Isolamentos",
    "sector": "Isolamentos e revestimentos",
    "email_area": "Construção & Engenharia",
    "location": "Bragança, Bragança",
    "website": "https://brignor.com/",
    "email": "geral@brignor.com",
    "phone": "273 313 467",
    "source": "https://brignor.com/contact-2/",
    "observation": "Empresa de revestimentos, isolamentos térmicos e acústicos em Bragança.",
    "opportunity": "Criar materiais explicativos de soluções de isolamento e revestimento.",
    "service": "design"
  },
  {
    "company": "BrigToldos",
    "sector": "Toldos e proteção solar",
    "email_area": "Construção & Engenharia",
    "location": "Bragança, Bragança",
    "website": "https://brigtoldos.pt/",
    "email": "geral@brigtoldos.pt",
    "phone": "273 332 702",
    "source": "https://brigtoldos.pt/contactos/",
    "observation": "Empresa de toldos localizada na Zona Industrial das Cantarias.",
    "opportunity": "Criar fichas de apresentação de soluções e aplicações.",
    "service": "design"
  },
  {
    "company": "Tractores e Máquinas Moura",
    "sector": "Comércio e reparação de maquinaria",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Bragança, Bragança",
    "website": "https://tmmaluga.com/",
    "email": "geral@tmmaluga.com",
    "phone": "273 313 933",
    "source": "https://tmmaluga.com/aluguer/",
    "observation": "Empresa de comércio, reparação e aluguer de equipamentos.",
    "opportunity": "Criar suportes comerciais para venda e aluguer de máquinas.",
    "service": "design"
  },
  {
    "company": "Norcredito — Finibragança",
    "sector": "Intermediação de crédito",
    "email_area": "Serviços Profissionais",
    "location": "Bragança, Bragança",
    "website": "https://www.norcredito.com/",
    "email": "geral@norcredito.com",
    "phone": "273 405 889",
    "source": "https://www.norcredito.com/contactos/",
    "observation": "Intermediário de crédito vinculado em Bragança, com registo indicado no website.",
    "opportunity": "Criar materiais informativos claros sobre serviços de intermediação.",
    "service": "design"
  },
  {
    "company": "Auto Mecânica dos Galegos",
    "sector": "Oficina de reparação automóvel",
    "email_area": "Automóvel",
    "location": "Guarda, Guarda",
    "website": "https://www.automecanicagalegos.pt/",
    "email": "geral@automecanicagalegos.pt",
    "phone": "271 214 690",
    "source": "https://www.automecanicagalegos.pt/",
    "observation": "Oficina de reparação automóvel na Rua do Prado, Guarda.",
    "opportunity": "Criar suportes gráficos para apresentação dos serviços da oficina.",
    "service": "design"
  },
  {
    "company": "Reerguer — Reconstrução e Construção de Imóveis",
    "sector": "Construção e reabilitação de imóveis",
    "email_area": "Construção & Engenharia",
    "location": "Portalegre, Portalegre",
    "website": "",
    "email": "geral@reerguer.pt",
    "phone": "245 092 357",
    "source": "https://ruis.aiccopn.pt/empresas/reerguer-reconstrucao-e-construcao-de-imoveis-lda/",
    "observation": "Empresa de construção e reabilitação registada no diretório empresarial da AICCOPN.",
    "opportunity": "Criar materiais de apresentação de serviços e intervenções.",
    "service": "design"
  },
  {
    "company": "FXC",
    "sector": "Construção civil e reabilitação",
    "email_area": "Construção & Engenharia",
    "location": "Funchal, Madeira",
    "website": "https://fxc.pt/",
    "email": "geral@fxc.pt",
    "phone": "291 230 225",
    "source": "https://fxc.pt/alvara-da-empresa/",
    "observation": "Empresa de construção com alvará e sede na Rua da Mouraria, Funchal.",
    "opportunity": "Preparar materiais de apresentação de áreas de obra e especialidades.",
    "service": "design"
  },
  {
    "company": "Rectificadora",
    "sector": "Metalomecânica e retificação de motores",
    "email_area": "Indústria & Produção",
    "location": "Funchal, Madeira",
    "website": "https://rectificadora.pt/",
    "email": "geral@rectificadora.com.pt",
    "phone": "291 764 130",
    "source": "https://rectificadora.pt/",
    "observation": "Oficina de metalomecânica e retificação de motores no Funchal.",
    "opportunity": "Criar suportes técnicos e comerciais sobre serviços de oficina.",
    "service": "design"
  },
  {
    "company": "Charme Rent",
    "sector": "Aluguer de automóveis",
    "email_area": "Turismo & Alojamento",
    "location": "Funchal, Madeira",
    "website": "https://charmerent.com/",
    "email": "geral@charmerent.com",
    "phone": "291 610 303",
    "source": "https://charmerent.com/",
    "observation": "Rent-a-car no Funchal com frota e reservas online.",
    "opportunity": "Criar materiais digitais de apresentação de viaturas e reservas.",
    "service": "ambas"
  },
  {
    "company": "Neutrão — Imagiologia",
    "sector": "Imagiologia e análises clínicas",
    "email_area": "Saúde",
    "location": "Vila Real, Vila Real",
    "website": "https://neutrao.pt/",
    "email": "geral@neutrao.pt",
    "phone": "259 322 025",
    "source": "https://neutrao.pt/contacto/",
    "observation": "Centro de imagiologia com análises clínicas e marcações em Vila Real.",
    "opportunity": "Preparar materiais informativos sobre exames e horários.",
    "service": "design"
  },
  {
    "company": "Fenómeno Geométrico",
    "sector": "Arquitetura e engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Chaves, Vila Real",
    "website": "https://fenomenogeometrico.pt/",
    "email": "geral@fenomenogeometrico.pt",
    "phone": "963 876 417",
    "source": "https://fenomenogeometrico.pt/contactos/",
    "observation": "Estúdio de arquitetura, engenharia e gestão em Chaves.",
    "opportunity": "Criar peças de apresentação de projetos e serviços.",
    "service": "design"
  },
  {
    "company": "Unopezzi",
    "sector": "Loja de brinquedos educativos",
    "email_area": "Comércio & Retalho",
    "location": "Vila Real, Vila Real",
    "website": "https://www.unopezzi.pt/",
    "email": "geral@unopezzi.pt",
    "phone": "916 659 690",
    "source": "https://marketplace.bcdvilareal.pt/lojas/unopezzi",
    "observation": "Loja de brinquedos educativos e criativos com loja física em Vila Real.",
    "opportunity": "Criar materiais de apresentação de brinquedos e campanhas sazonais.",
    "service": "ambas"
  },
  {
    "company": "Transportes MEG",
    "sector": "Transportes rodoviários",
    "email_area": "Transportes & Logística",
    "location": "Tondela, Viseu",
    "website": "https://meg.pt/",
    "email": "geral@meg.pt",
    "phone": "232 099 542",
    "source": "https://meg.pt/contactos/",
    "observation": "Empresa familiar de transportes sediada em Tondela.",
    "opportunity": "Criar apresentação comercial dos serviços de transporte.",
    "service": "design"
  },
  {
    "company": "REFAL",
    "sector": "Soluções de alumínio",
    "email_area": "Indústria & Produção",
    "location": "Campia, Vouzela, Viseu",
    "website": "https://refal.pt/",
    "email": "geral@refal.pt",
    "phone": "232 094 231",
    "source": "https://refal.pt/?page_id=55",
    "observation": "Empresa de soluções de alumínio na Zona Industrial de Campia.",
    "opportunity": "Criar fichas de apresentação de produtos e soluções.",
    "service": "design"
  },
  {
    "company": "Albigás",
    "sector": "Instalações e distribuição de gás",
    "email_area": "Construção & Engenharia",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://www.albigas.pt/",
    "email": "geral@albigas.pt",
    "phone": "272 342 190",
    "source": "https://www.albigas.pt/servicos.php",
    "observation": "Empresa de instalações de gás e distribuição de gás engarrafado e industrial.",
    "opportunity": "Criar materiais de apresentação de serviços e equipamentos.",
    "service": "design"
  },
  {
    "company": "GRINCOP",
    "sector": "Soluções e serviços de informática",
    "email_area": "Tecnologia & Digital",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://grincop.pt/",
    "email": "geral@grincop.pt",
    "phone": "272 330 060",
    "source": "https://grincop.pt/f-contactos/",
    "observation": "Empresa de fornecimento de produtos e serviços informáticos em Castelo Branco.",
    "opportunity": "Preparar materiais comerciais para serviços e soluções de TI.",
    "service": "design"
  },
  {
    "company": "SP CONTA",
    "sector": "Contabilidade e serviços empresariais",
    "email_area": "Serviços Profissionais",
    "location": "Aveiro, Aveiro",
    "website": "https://spconta-aveiro.pt/",
    "email": "geral@spconta-aveiro.pt",
    "phone": "968 403 081",
    "source": "https://spconta-aveiro.pt/contabilidade/contactos/",
    "observation": "Gabinete de contabilidade no Centro Comercial Bairro do Liceu, Aveiro.",
    "opportunity": "Criar peças informativas sobre serviços contabilísticos.",
    "service": "design"
  },
  {
    "company": "Clinic4you",
    "sector": "Clínica médica e dentária",
    "email_area": "Saúde",
    "location": "Coimbra, Coimbra",
    "website": "https://www.clinic4you.pt/",
    "email": "info@clinic4you.pt",
    "phone": "239 440 184",
    "source": "https://www.clinic4you.pt/equipa",
    "observation": "Clínica em Coimbra com especialidades médicas e dentárias.",
    "opportunity": "Preparar materiais de apresentação de especialidades e marcações.",
    "service": "design"
  },
  {
    "company": "GOBELI",
    "sector": "Manutenção e reabilitação de edifícios",
    "email_area": "Construção & Engenharia",
    "location": "Lisboa, Lisboa",
    "website": "https://gobeli.pt/",
    "email": "geral@gobeli.pt",
    "phone": "913 728 294",
    "source": "https://gobeli.pt/",
    "observation": "Serviços de manutenção técnica, remodelação e redes de água e esgoto.",
    "opportunity": "Criar apresentação comercial de serviços e intervenções.",
    "service": "design"
  },
  {
    "company": "Caniço Restaurante",
    "sector": "Restauração",
    "email_area": "Restauração",
    "location": "Alvor, Portimão, Faro",
    "website": "https://canicorestaurante.pt/",
    "email": "geral@canicorestaurante.pt",
    "phone": "282 458 503",
    "source": "https://canicorestaurante.pt/contactos/",
    "observation": "Restaurante localizado no Aldeamento da Prainha, Praia dos Três Irmãos.",
    "opportunity": "Criar materiais de apresentação do restaurante e reservas.",
    "service": "ambas"
  },
  {
    "company": "PintSoft",
    "sector": "Pintura de construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Leiria, Leiria",
    "website": "https://www.pintsoft.pt/",
    "email": "geral@pintsoft.pt",
    "phone": "915 465 393",
    "source": "https://www.pintsoft.pt/contactos",
    "observation": "Empresa de serviços de pintura de construção civil em Leiria.",
    "opportunity": "Criar materiais de apresentação de trabalhos e serviços.",
    "service": "design"
  },
  {
    "company": "Keepwise",
    "sector": "Manutenção industrial",
    "email_area": "Indústria & Produção",
    "location": "Setúbal, Setúbal",
    "website": "https://www.keepwise.pt/",
    "email": "geral@keepwise.pt",
    "phone": "928 206 680",
    "source": "https://www.keepwise.pt/sp/",
    "observation": "Empresa de manutenção industrial no parque empresarial BlueBiz, Setúbal.",
    "opportunity": "Criar suportes técnicos e comerciais para serviços industriais.",
    "service": "design"
  },
  {
    "company": "Worktel",
    "sector": "Telecomunicações e manutenção de infraestruturas",
    "email_area": "Tecnologia & Digital",
    "location": "Setúbal, Setúbal",
    "website": "https://www.worktel.pt/",
    "email": "geral@worktel.pt",
    "phone": "265 245 471",
    "source": "https://www.worktel.pt/index.php/contacto",
    "observation": "Empresa de instalação e manutenção de infraestruturas de telecomunicações.",
    "opportunity": "Criar fichas comerciais sobre instalação e manutenção.",
    "service": "design"
  },
  {
    "company": "Nã T'acho",
    "sector": "Restaurante",
    "email_area": "Restauração",
    "location": "Évora, Évora",
    "website": "https://natacho.com/",
    "email": "geral@natacho.com",
    "phone": "968 456 076",
    "source": "https://natacho.com/",
    "observation": "Restaurante de cozinha alentejana na Rua da Misericórdia, Évora.",
    "opportunity": "Criar materiais de apresentação de carta e reservas.",
    "service": "ambas"
  },
  {
    "company": "Autogirar",
    "sector": "Comércio e oficina automóvel",
    "email_area": "Automóvel",
    "location": "Santarém, Santarém",
    "website": "https://autogirar.pt/",
    "email": "geral@autogirar.pt",
    "phone": "243 309 030",
    "source": "https://autogirar.pt/loja-online/",
    "observation": "Empresa com vendas, oficina e peças automóveis em Santarém.",
    "opportunity": "Criar suportes gráficos para viaturas e serviços pós-venda.",
    "service": "design"
  },
  {
    "company": "Sabforma",
    "sector": "Formação profissional",
    "email_area": "Educação & Formação",
    "location": "Braga, Braga",
    "website": "https://academia.sabforma.pt/",
    "email": "geral@sabforma.pt",
    "phone": "253 094 266",
    "source": "https://academia.sabforma.pt/faq.asp",
    "observation": "Entidade de formação com contacto na Praça do Comércio, Braga.",
    "opportunity": "Criar materiais de divulgação da oferta formativa.",
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
 console.log('[crm] seed 2026-10-30:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-10-30:',e.message)}
