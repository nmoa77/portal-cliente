// DUIT — 2026-11-04; emails empresariais publicados em fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "MaiaPerfil",
    "sector": "Serralharia civil",
    "email_area": "Indústria & Produção",
    "location": "Loureira, Leiria",
    "website": "https://maiaperfil.pt/",
    "email": "geral@maiaperfil.pt",
    "phone": "244741334",
    "source": "https://maiaperfil.pt/",
    "observation": "Empresa de serralharia civil com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possibilidade de criar materiais gráficos de apresentação de serviços de serralharia civil.",
    "service": "design"
  },
  {
    "company": "Cervimat",
    "sector": "Engenharia e construção",
    "email_area": "Construção & Engenharia",
    "location": "Vila Nova de Gaia, Porto",
    "website": "https://cervimat.pt/",
    "email": "geral@cervimat.pt",
    "phone": "227836003",
    "source": "https://ruis.aiccopn.pt/empresas/cervimat-engenharia-e-construcao-lda/",
    "observation": "Empresa de engenharia e construção com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possibilidade de criar materiais gráficos de apresentação de serviços de engenharia e construção.",
    "service": "design"
  },
  {
    "company": "Manuel Mata Alumínios",
    "sector": "Fabrico e montagem de alumínios",
    "email_area": "Construção & Engenharia",
    "location": "Vendas Novas, Évora",
    "website": "https://mmaluminios.pt/",
    "email": "geral@mmaluminios.pt",
    "phone": "265805346",
    "source": "https://ruis.aiccopn.pt/empresas/manuel-mata-fabrico-e-montagem-aluminios-lda/",
    "observation": "Empresa de fabrico e montagem de alumínios com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possibilidade de criar materiais gráficos de apresentação de serviços de fabrico e montagem de alumínios.",
    "service": "design"
  },
  {
    "company": "Habinordeste",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Bragança, Bragança",
    "website": "https://habinordeste.pt/",
    "email": "geral@habinordeste.pt",
    "phone": "273331441",
    "source": "https://ruis.aiccopn.pt/empresas/habinordeste-sociedade-de-construcoes-lda/",
    "observation": "Empresa de construção civil com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possibilidade de criar materiais gráficos de apresentação de serviços de construção civil.",
    "service": "design"
  },
  {
    "company": "Weldart",
    "sector": "Serralharia e soldadura TIG",
    "email_area": "Indústria & Produção",
    "location": "Monte Real, Leiria",
    "website": "https://weldart.pt/",
    "email": "geral@weldart.pt",
    "phone": "910916189",
    "source": "https://weldart.pt/",
    "observation": "Empresa de serralharia e soldadura tig com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possibilidade de criar materiais gráficos de apresentação de serviços de serralharia e soldadura tig.",
    "service": "design"
  },
  {
    "company": "Abel Luís Nogueiro & Irmãos",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Bragança, Bragança",
    "website": "https://alnconstrucoes.com/",
    "email": "geral@alnconstrucoes.com",
    "phone": "273326827",
    "source": "https://ruis.aiccopn.pt/empresas/abel-luis-nogueiro-irmaos-lda/",
    "observation": "Empresa de construção civil com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possibilidade de criar materiais gráficos de apresentação de serviços de construção civil.",
    "service": "design"
  },
  {
    "company": "Equilibrium Fisio & Baby SPA",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://equilibriumfisio.pt/",
    "email": "geral@equilibriumfisio.pt",
    "phone": "926512221",
    "source": "https://equilibriumfisio.pt/node/81",
    "observation": "Empresa de fisioterapia com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possibilidade de criar materiais gráficos de apresentação de serviços de fisioterapia.",
    "service": "design"
  },
  {
    "company": "Artur Camponês",
    "sector": "Serralharia civil",
    "email_area": "Indústria & Produção",
    "location": "Arrabal, Leiria",
    "website": "https://arturcampones.pt/",
    "email": "geral@arturcampones.pt",
    "phone": "244744515",
    "source": "https://www.arturcampones.pt/contactos/",
    "observation": "Empresa de serralharia civil com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possibilidade de criar materiais gráficos de apresentação de serviços de serralharia civil.",
    "service": "design"
  },
  {
    "company": "Martimferro",
    "sector": "Estruturas metálicas",
    "email_area": "Indústria & Produção",
    "location": "Pousaflores, Leiria",
    "website": "https://martimferro.pt/",
    "email": "geral@martimferro.pt",
    "phone": "917874892",
    "source": "https://martimferro.pt/",
    "observation": "Empresa de estruturas metálicas com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possibilidade de criar materiais gráficos de apresentação de serviços de estruturas metálicas.",
    "service": "design"
  },
  {
    "company": "Martinho Auto",
    "sector": "Reparação automóvel",
    "email_area": "Automóvel",
    "location": "Santarém, Santarém",
    "website": "https://martinhoauto.pt/",
    "email": "geral@martinhoauto.pt",
    "phone": "243302228",
    "source": "https://www.descarbonizar.pt/martinho-auto",
    "observation": "Empresa de reparação automóvel com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possibilidade de criar materiais gráficos de apresentação de serviços de reparação automóvel.",
    "service": "design"
  },
  {
    "company": "O Teu Mestre",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Sátão, Viseu",
    "website": "https://oteumestre.pt/",
    "email": "geral@oteumestre.pt",
    "phone": "934485072",
    "source": "https://oteumestre.pt/?lang=en",
    "observation": "Empresa de centro de estudos com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possibilidade de criar materiais gráficos de apresentação de serviços de centro de estudos.",
    "service": "design"
  },
  {
    "company": "Sebenta Triunfal",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Viseu, Viseu",
    "website": "https://sebentatriunfal.pt/",
    "email": "geral@sebentatriunfal.pt",
    "phone": "232416155",
    "source": "https://www.sebentatriunfal.pt/contactos",
    "observation": "Empresa de centro de estudos com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possibilidade de criar materiais gráficos de apresentação de serviços de centro de estudos.",
    "service": "design"
  },
  {
    "company": "Maiopção",
    "sector": "Mediação imobiliária",
    "email_area": "Imobiliário",
    "location": "Guarda, Guarda",
    "website": "https://maiopcao.pt/",
    "email": "geral@maiopcao.pt",
    "phone": "928030614",
    "source": "https://www.maiopcao.pt/contacto.php",
    "observation": "Empresa de mediação imobiliária com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possibilidade de criar materiais gráficos de apresentação de serviços de mediação imobiliária.",
    "service": "design"
  },
  {
    "company": "Glamping Hills",
    "sector": "Alojamento turístico",
    "email_area": "Turismo & Alojamento",
    "location": "Santa Comba de Rossas, Bragança",
    "website": "https://glampinghills.pt/",
    "email": "geral@glampinghills.pt",
    "phone": "938712419",
    "source": "https://www.allaboutportugal.pt/pt/braganca/hoteis/glamping-hills",
    "observation": "Empresa de alojamento turístico com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possibilidade de criar materiais gráficos de apresentação de serviços de alojamento turístico.",
    "service": "design"
  },
  {
    "company": "O Moinho",
    "sector": "Restaurante",
    "email_area": "Restauração",
    "location": "Miranda do Douro, Bragança",
    "website": "https://restaurantemoinho.com/",
    "email": "geral@restaurantemoinho.com",
    "phone": "273431116",
    "source": "https://www.allaboutportugal.pt/pt/miranda-do-douro/restaurantes/o-moinho-9",
    "observation": "Empresa de restaurante com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possibilidade de criar materiais gráficos de apresentação de serviços de restaurante.",
    "service": "design"
  },
  {
    "company": "O Encontro",
    "sector": "Hotel e restaurante",
    "email_area": "Turismo & Alojamento",
    "location": "Sendim, Bragança",
    "website": "https://hrencontro.pt/",
    "email": "geral@hrencontro.pt",
    "phone": "273738050",
    "source": "https://www.allaboutportugal.pt/pt/miranda-do-douro/restaurantes/o-encontro-4",
    "observation": "Empresa de hotel e restaurante com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possibilidade de criar materiais gráficos de apresentação de serviços de hotel e restaurante.",
    "service": "design"
  },
  {
    "company": "LDAgro",
    "sector": "Comércio e consultoria agrícola",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Torre dos Coelheiros, Évora",
    "website": "https://ldagro.pt/",
    "email": "geral@ldagro.pt",
    "phone": "915520709",
    "source": "https://www.ldagro.pt/comercializacao-de-produtos",
    "observation": "Empresa de comércio e consultoria agrícola com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possibilidade de criar materiais gráficos de apresentação de serviços de comércio e consultoria agrícola.",
    "service": "design"
  },
  {
    "company": "Conclusão Estudos e Formação",
    "sector": "Formação profissional",
    "email_area": "Educação & Formação",
    "location": "Coimbra, Coimbra",
    "website": "https://conclusao.pt/",
    "email": "geral@conclusao.pt",
    "phone": "239497990",
    "source": "https://conclusao.pt/portal/entidade/",
    "observation": "Empresa de formação profissional com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possibilidade de criar materiais gráficos de apresentação de serviços de formação profissional.",
    "service": "design"
  },
  {
    "company": "Cerpros",
    "sector": "Clínica dentária",
    "email_area": "Dentistas",
    "location": "Portalegre, Portalegre",
    "website": "https://cerpros.pt/",
    "email": "geral@cerpros.pt",
    "phone": "245339020",
    "source": "https://fadadodente.pt/clinica/centro-de-recuperacao-de-portalegre-cerpros-portalegre",
    "observation": "Empresa de clínica dentária com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possibilidade de criar materiais gráficos de apresentação de serviços de clínica dentária.",
    "service": "design"
  },
  {
    "company": "Oral Care Pires",
    "sector": "Clínica dentária",
    "email_area": "Dentistas",
    "location": "Crato, Portalegre",
    "website": "https://oralcarepires.com/",
    "email": "geral@oralcarepires.com",
    "phone": "934553467",
    "source": "https://fadadodente.pt/clinica/oral-care-pires-crato",
    "observation": "Empresa de clínica dentária com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possibilidade de criar materiais gráficos de apresentação de serviços de clínica dentária.",
    "service": "design"
  },
  {
    "company": "Casa Foz do Corgo",
    "sector": "Alojamento rural",
    "email_area": "Turismo & Alojamento",
    "location": "Peso da Régua, Vila Real",
    "website": "https://casafozdocorgo.pt/",
    "email": "geral@casafozdocorgo.pt",
    "phone": "918791105",
    "source": "https://www.allaboutportugal.pt/pt/peso-da-regua/hoteis/casa-foz-do-corgo",
    "observation": "Empresa de alojamento rural com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possibilidade de criar materiais gráficos de apresentação de serviços de alojamento rural.",
    "service": "design"
  },
  {
    "company": "Restaurante Quinta de São Domingos",
    "sector": "Restauração",
    "email_area": "Restauração",
    "location": "Peso da Régua, Vila Real",
    "website": "https://quintadesaodomingos.com/",
    "email": "geral@quintadesaodomingos.com",
    "phone": "254318200",
    "source": "https://roteirosdeportugal.pt/rtcl_listing/restaurante-quinta-de-sao-domingos/",
    "observation": "Empresa de restauração com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possibilidade de criar materiais gráficos de apresentação de serviços de restauração.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-04).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');
  added++;
 }})();
 console.log('[crm] seed 2026-11-04:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-04:',e.message)}
