// DUIT — 2026-11-26. Empresas e emails profissionais verificados em fontes públicas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Premetal",
    "sector": "Metalomecânica agrícola",
    "email_area": "Indústria & Produção",
    "location": "Évora",
    "website": "https://premetal.pt/",
    "email": "geral@premetal.pt",
    "phone": "266760090",
    "source": "https://premetal.pt/contactos/",
    "instagram": "",
    "observation": "Atividade de metalomecânica agrícola identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "catálogo de equipamentos agropecuários.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://premetal.pt/contactos/"
  },
  {
    "company": "CMV",
    "sector": "Reabilitação médica",
    "email_area": "Fisioterapia",
    "location": "Viseu",
    "website": "https://www.cmv.pt/",
    "email": "geral@cmv.pt",
    "phone": "232460348",
    "source": "https://www.cmv.pt/contacto/",
    "instagram": "",
    "observation": "Atividade de reabilitação médica identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "materiais informativos de reabilitação.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.cmv.pt/contacto/"
  },
  {
    "company": "Fisio Clínica da Ribeira",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Viseu",
    "website": "https://fisiocr.pt/",
    "email": "geral@fisiocr.pt",
    "phone": "232397312",
    "source": "https://fisiocr.pt/",
    "instagram": "",
    "observation": "Atividade de fisioterapia identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "divulgação de serviços de fisioterapia.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://fisiocr.pt/"
  },
  {
    "company": "AFF",
    "sector": "Serralharia civil",
    "email_area": "Construção & Engenharia",
    "location": "Sever do Vouga, Aveiro",
    "website": "https://aff.com.pt/",
    "email": "geral@aff.com.pt",
    "phone": "234558749",
    "source": "https://aff.com.pt/contactos/",
    "instagram": "",
    "observation": "Atividade de serralharia civil identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "portefólio de trabalhos em metal.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://aff.com.pt/contactos/"
  },
  {
    "company": "Sometambi",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Évora",
    "website": "https://sometambi.pt/",
    "email": "sometambi@sometambi.pt",
    "phone": "266745920",
    "source": "https://sometambi.pt/servicos/",
    "instagram": "",
    "observation": "Atividade de metalomecânica identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "catálogo de serviços industriais.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://sometambi.pt/servicos/"
  },
  {
    "company": "Bela Vista Saúde",
    "sector": "Clínica médica",
    "email_area": "Saúde",
    "location": "Silgueiros, Viseu",
    "website": "https://belavistasaude.pt/",
    "email": "geral@belavistasaude.pt",
    "phone": "960177888",
    "source": "https://belavistasaude.pt/",
    "instagram": "",
    "observation": "Atividade de clínica médica identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "materiais de divulgação das especialidades.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://belavistasaude.pt/"
  },
  {
    "company": "Planycorpo",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Nelas, Viseu",
    "website": "https://planycorpo.pt/",
    "email": "planycorpo@planycorpo.pt",
    "phone": "232945945",
    "source": "https://planycorpo.pt/contactos/",
    "instagram": "",
    "observation": "Atividade de fisioterapia identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "comunicação das unidades de fisioterapia.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://planycorpo.pt/contactos/"
  },
  {
    "company": "Auto Imperial",
    "sector": "Comércio e oficina automóvel",
    "email_area": "Automóvel",
    "location": "Bragança",
    "website": "https://autoimperial.pt/",
    "email": "geral@autoimperial.eu",
    "phone": "273302600",
    "source": "https://autoimperial.pt/contacto/",
    "instagram": "",
    "observation": "Atividade de comércio e oficina automóvel identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "materiais comerciais de oficina.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://autoimperial.pt/contacto/"
  },
  {
    "company": "Masterfor",
    "sector": "Oficina e venda automóvel",
    "email_area": "Automóvel",
    "location": "Bragança",
    "website": "https://www.masterfor.pt/",
    "email": "geral@masterfor.pt",
    "phone": "934667559",
    "source": "https://www.masterfor.pt/",
    "instagram": "",
    "observation": "Atividade de oficina e venda automóvel identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "divulgação de serviços de manutenção.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.masterfor.pt/"
  },
  {
    "company": "HPmotors",
    "sector": "Reparação automóvel",
    "email_area": "Automóvel",
    "location": "Guarda",
    "website": "https://www.hpmotors.pt/",
    "email": "geral@hpmotors.pt",
    "phone": "966711662",
    "source": "https://www.hpmotors.pt/",
    "instagram": "",
    "observation": "Atividade de reparação automóvel identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "apresentação de serviços de diagnóstico.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.hpmotors.pt/"
  },
  {
    "company": "Auto Sabor",
    "sector": "Stand e oficina",
    "email_area": "Automóvel",
    "location": "Bragança",
    "website": "https://www.autosabor.pt/",
    "email": "geral@autosabor.pt",
    "phone": "273302723",
    "source": "https://www.autosabor.pt/pagina/contactos/1966",
    "instagram": "",
    "observation": "Atividade de stand e oficina identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "materiais promocionais de viaturas.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.autosabor.pt/pagina/contactos/1966"
  },
  {
    "company": "Auto Mecânica dos Galegos",
    "sector": "Oficina automóvel",
    "email_area": "Automóvel",
    "location": "Guarda",
    "website": "https://automecanicagalegos.pt/",
    "email": "geral@automecanicagalegos.pt",
    "phone": "271214690",
    "source": "https://automecanicagalegos.pt/",
    "instagram": "",
    "observation": "Atividade de oficina automóvel identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "divulgação dos serviços de reparação.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://automecanicagalegos.pt/"
  },
  {
    "company": "Explica Centro",
    "sector": "Explicações",
    "email_area": "Centro de Estudos",
    "location": "Coimbra",
    "website": "https://explicacentro.pt/",
    "email": "geral@explicacentro.pt",
    "phone": "913303723",
    "source": "https://explicacentro.pt/explicacentro-contatos.html",
    "instagram": "",
    "observation": "Atividade de explicações identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "materiais de divulgação de explicações.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://explicacentro.pt/explicacentro-contatos.html"
  },
  {
    "company": "Academia do Saber",
    "sector": "Centro de explicações",
    "email_area": "Centro de Estudos",
    "location": "Coimbra",
    "website": "https://explicacoescoimbra.pt/",
    "email": "geral@explicacoescoimbra.pt",
    "phone": "239151924",
    "source": "https://explicacoescoimbra.pt/index.php/contactos",
    "instagram": "",
    "observation": "Atividade de centro de explicações identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "comunicação de inscrições.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://explicacoescoimbra.pt/index.php/contactos"
  },
  {
    "company": "Dona Maria",
    "sector": "Alojamento",
    "email_area": "Turismo & Alojamento",
    "location": "Portalegre",
    "website": "https://www.donamariagh.com/",
    "email": "geral@donamariagh.com",
    "phone": "245331212",
    "source": "https://www.donamariagh.com/",
    "instagram": "",
    "observation": "Atividade de alojamento identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "divulgação dos quartos e estadias.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.donamariagh.com/"
  },
  {
    "company": "Hotel Melius",
    "sector": "Hotelaria",
    "email_area": "Turismo & Alojamento",
    "location": "Beja",
    "website": "https://hotelmelius.com/",
    "email": "geral@hotelmelius.com",
    "phone": "284313080",
    "source": "https://hotelmelius.com/alojamento/",
    "instagram": "",
    "observation": "Atividade de hotelaria identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "materiais promocionais de alojamento.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://hotelmelius.com/alojamento/"
  },
  {
    "company": "BejaParque Hotel",
    "sector": "Hotelaria",
    "email_area": "Turismo & Alojamento",
    "location": "Beja",
    "website": "https://www.bejaparquehotel.com/",
    "email": "geral@bejaparquehotel.com",
    "phone": "284310500",
    "source": "https://www.bejaparquehotel.com/contactos",
    "instagram": "",
    "observation": "Atividade de hotelaria identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "divulgação de estadias de lazer e negócios.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.bejaparquehotel.com/contactos"
  },
  {
    "company": "Rossio Hotel",
    "sector": "Hotelaria familiar",
    "email_area": "Turismo & Alojamento",
    "location": "Portalegre",
    "website": "http://www.rossiohotel.com",
    "email": "geral@rossiohotel.com",
    "phone": "245082218",
    "source": "https://www.visitportugal.com/pt-pt/search/site/Portalegre?f%5B0%5D=im_field_poi_tipo%3A490&f%5B1%5D=im_subtipo_alojamento%3A582",
    "instagram": "",
    "observation": "Atividade de hotelaria familiar identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "promoção visual de estadias.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.visitportugal.com/pt-pt/search/site/Portalegre?f%5B0%5D=im_field_poi_tipo%3A490&f%5B1%5D=im_subtipo_alojamento%3A582"
  },
  {
    "company": "Almojanda 3Olivetree",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Portalegre",
    "website": "https://www.almojanda3olivetree.com/",
    "email": "geral@almojanda3olivetree.com",
    "phone": "963474524",
    "source": "https://www.visitportugal.com/pt-pt/search/site/Portalegre?f%5B0%5D=im_field_poi_tipo%3A490&f%5B1%5D=bm_field_ma_acesso_internet_%3Atrue",
    "instagram": "",
    "observation": "Atividade de turismo rural identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "divulgação das casas de turismo rural.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.visitportugal.com/pt-pt/search/site/Portalegre?f%5B0%5D=im_field_poi_tipo%3A490&f%5B1%5D=bm_field_ma_acesso_internet_%3Atrue"
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'',x.instagram||'',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-26).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-26:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-26:',e.message)}
