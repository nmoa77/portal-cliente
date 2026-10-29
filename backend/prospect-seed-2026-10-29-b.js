// DUIT — 2026-10-29. Fontes de email profissional verificadas publicamente nesta data.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "CELL — Centro de Estudos",
    "sector": "Centro de estudos",
    "email_area": "Educação & Formação",
    "location": "Vila Nova de Gaia, Porto",
    "website": "https://centrodeestudos.pt/",
    "email": "geral@centrodeestudos.pt",
    "phone": "968 638 869",
    "source": "https://centrodeestudos.pt/contatos/",
    "observation": "Centro de estudos com explicações presenciais e online.",
    "opportunity": "Apresentar modalidades de explicações e preparação de exames.",
    "service": "design"
  },
  {
    "company": "A Magia de Aprender",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Leiria, Leiria",
    "website": "https://www.amagiadeaprender.com/",
    "email": "geral@amagiadeaprender.com",
    "phone": "910 609 733",
    "source": "https://www.amagiadeaprender.com/contactos",
    "observation": "Centro de estudos com apoio escolar e atividades nas férias.",
    "opportunity": "Divulgar programas educativos e inscrições.",
    "service": "design"
  },
  {
    "company": "Fisio Clínica da Ribeira",
    "sector": "Fisioterapia e reabilitação",
    "email_area": "Fisioterapia",
    "location": "Viseu, Viseu",
    "website": "https://fisiocr.pt/",
    "email": "geral@fisiocr.pt",
    "phone": "232 397 312",
    "source": "https://fisiocr.pt/",
    "observation": "Clínica de fisioterapia no Edifício Hospital CUF Viseu.",
    "opportunity": "Criar materiais sobre serviços de reabilitação.",
    "service": "design"
  },
  {
    "company": "Planycorpo",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Viseu e Nelas, Viseu",
    "website": "https://planycorpo.pt/",
    "email": "planycorpo@planycorpo.pt",
    "phone": "232 945 945",
    "source": "https://planycorpo.pt/contactos/",
    "observation": "Fisioterapia com unidades em Viseu e Nelas.",
    "opportunity": "Comunicar serviços e contactos das duas unidades.",
    "service": "design"
  },
  {
    "company": "Monte Chalaça",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Ferreira do Alentejo, Beja",
    "website": "https://montechalaca.pt/",
    "email": "geral@montechalaca.pt",
    "phone": "284 739 015",
    "source": "https://montechalaca.pt/contactos",
    "observation": "Alojamento de turismo rural em Ferreira do Alentejo.",
    "opportunity": "Criar suportes de divulgação do alojamento.",
    "service": "ambas"
  },
  {
    "company": "Aqui n'al-deia",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Mértola, Beja",
    "website": "https://www.aquinaldeia.pt/",
    "email": "geral@aquinaldeia.pt",
    "phone": "931 741 110",
    "source": "https://www.aquinaldeia.pt/contact.php",
    "observation": "Alojamento em São João dos Caldeireiros, Mértola.",
    "opportunity": "Criar materiais digitais de apresentação e reservas.",
    "service": "design"
  },
  {
    "company": "A Sociedade Rural",
    "sector": "Alojamento rural",
    "email_area": "Turismo & Alojamento",
    "location": "Serra de São Mamede, Portalegre",
    "website": "https://asociedaderural.pt/",
    "email": "hello@asociedaderural.pt",
    "phone": "910 262 461",
    "source": "https://asociedaderural.pt/contactos",
    "observation": "Alojamento rural no Parque Natural da Serra de São Mamede.",
    "opportunity": "Divulgar experiências e opções de estadia.",
    "service": "ambas"
  },
  {
    "company": "Vila Valmonte",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Aldeia do Rouquenho, Beja",
    "website": "https://www.vilavalmonte.eu/",
    "email": "info@vilavalmonte.eu",
    "phone": "917 757 354",
    "source": "https://www.vilavalmonte.eu/contactos/",
    "observation": "Alojamento turístico na Aldeia do Rouquenho.",
    "opportunity": "Criar peças de apresentação da oferta de alojamento.",
    "service": "design"
  },
  {
    "company": "Ent'Artes — Escola de Dança",
    "sector": "Escola de dança",
    "email_area": "Estúdios de Dança",
    "location": "Braga, Braga",
    "website": "https://entartes.pt/",
    "email": "geral@entartes.pt",
    "phone": "964 693 247",
    "source": "https://entartes.pt/Contactos.php",
    "observation": "Escola de dança certificada pela Royal Academy of Dance.",
    "opportunity": "Divulgar modalidades e inscrições em peças gráficas.",
    "service": "ambas"
  },
  {
    "company": "AutoRia",
    "sector": "Comércio automóvel e oficina",
    "email_area": "Automóvel",
    "location": "Aveiro, Aveiro",
    "website": "https://auto-ria.pt/",
    "email": "comercial@auto-ria.pt",
    "phone": "234 305 350",
    "source": "https://auto-ria.pt/contactos",
    "observation": "Empresa automóvel com área comercial e oficina em Aveiro.",
    "opportunity": "Criar materiais de apresentação de viaturas e serviços.",
    "service": "design"
  },
  {
    "company": "DS Imobiliária Guarda",
    "sector": "Mediação imobiliária",
    "email_area": "Imobiliário",
    "location": "Guarda, Guarda",
    "website": "https://www.dsimobiliaria.pt/",
    "email": "guarda@dsimobiliaria.pt",
    "phone": "271 211 012",
    "source": "https://www.dsimobiliaria.pt/pt/agencias/ds-imobiliaria-guarda_11",
    "observation": "Agência de mediação imobiliária na Guarda, AMI 22075.",
    "opportunity": "Criar peças de apresentação de imóveis e serviços.",
    "service": "design"
  },
  {
    "company": "Clínica Médica José Viana",
    "sector": "Clínica médica",
    "email_area": "Saúde",
    "location": "Faro, Faro",
    "website": "https://clinicaviana.pt/",
    "email": "geral@clinicaviana.pt",
    "phone": "289 821 624",
    "source": "https://clinicaviana.pt/especialidades-medicas/nutricao/",
    "observation": "Clínica médica em Faro com consulta de nutrição.",
    "opportunity": "Criar materiais de informação sobre especialidades.",
    "service": "design"
  },
  {
    "company": "FACELAB Clínica Médica",
    "sector": "Clínica médica e nutrição",
    "email_area": "Saúde",
    "location": "Faro, Faro",
    "website": "https://facelab.pt/",
    "email": "geral@facelab.pt",
    "phone": "961 023 229",
    "source": "https://facelab.pt/especialidades/nutricao/",
    "observation": "Clínica com unidades em Faro e Albufeira.",
    "opportunity": "Divulgar especialidades e localizações em suportes digitais.",
    "service": "design"
  },
  {
    "company": "iCARS",
    "sector": "Comércio automóvel",
    "email_area": "Automóvel",
    "location": "Aveiro, Aveiro",
    "website": "https://icars.pt/",
    "email": "geral@icars.pt",
    "phone": "925 415 225",
    "source": "https://icars.pt/contactos",
    "observation": "Empresa de automóveis usados e seminovos em Aveiro.",
    "opportunity": "Criar peças de apresentação de viaturas.",
    "service": "design"
  },
  {
    "company": "Vitor Guimarães & Filhos",
    "sector": "Comércio e reparação automóvel",
    "email_area": "Automóvel",
    "location": "Aveiro, Aveiro",
    "website": "https://www.vitorguimaraes.com/",
    "email": "geral@vitorguimaraes.com",
    "phone": "234 340 300",
    "source": "https://www.vitorguimaraes.com/contactos/",
    "observation": "Empresa com oficina, reparação autorizada e centro logístico.",
    "opportunity": "Criar materiais de apresentação de serviços pós-venda.",
    "service": "design"
  },
  {
    "company": "Auto Mondego — Aveiro",
    "sector": "Comércio automóvel",
    "email_area": "Automóvel",
    "location": "Aveiro, Aveiro",
    "website": "https://automondego.pt/",
    "email": "corvauto@corvauto.pt",
    "phone": "234 303 150",
    "source": "https://automondego.pt/contactos-e-localizacao-aveiro/",
    "observation": "Instalações de vendas e oficina em Esgueira, Aveiro.",
    "opportunity": "Criar suportes comerciais para viaturas e oficina.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-10-29).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');
  added++;
 }})();
 console.log('[crm] seed 2026-10-29:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-10-29:',e.message)}
