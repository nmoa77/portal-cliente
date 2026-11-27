// DUIT — 2026-11-27. Empresas e emails profissionais verificados em fontes públicas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "SBC Carpintaria",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Mundão, Viseu",
    "website": "https://www.sbc-carpintaria.com/",
    "email": "info@sbc-carpintaria.com",
    "phone": "232921834",
    "source": "https://www.sbc-carpintaria.com/contactos/",
    "instagram": "",
    "observation": "Atividade de carpintaria e contacto profissional publicados na fonte indicada.",
    "opportunity": "apresentação gráfica dos trabalhos de carpintaria.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.sbc-carpintaria.com/contactos/"
  },
  {
    "company": "Carpintaria VT",
    "sector": "Mobiliário personalizado",
    "email_area": "Indústria & Produção",
    "location": "Vouzela, Viseu",
    "website": "https://carpintariavt.pt/",
    "email": "contacto@carpintariavt.pt",
    "phone": "928360053",
    "source": "https://carpintariavt.pt/",
    "instagram": "",
    "observation": "Atividade de mobiliário personalizado e contacto profissional publicados na fonte indicada.",
    "opportunity": "catálogo de mobiliário à medida.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://carpintariavt.pt/"
  },
  {
    "company": "Quinta do Rio Noémi",
    "sector": "Alojamento",
    "email_area": "Turismo & Alojamento",
    "location": "Guarda",
    "website": "https://quintadorionoemi.com/",
    "email": "geral@quintadorionoemi.com",
    "phone": "910658202",
    "source": "https://www.visitportugal.com/pt-pt/content/quinta-do-rio-no%C3%A9mi",
    "instagram": "",
    "observation": "Atividade de alojamento e contacto profissional publicados na fonte indicada.",
    "opportunity": "materiais promocionais de estadias.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.visitportugal.com/pt-pt/content/quinta-do-rio-no%C3%A9mi"
  },
  {
    "company": "Véstia Santos",
    "sector": "Maquinaria agrícola e rega",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Portalegre",
    "website": "https://vestiasantos.pt/",
    "email": "geral@vestiasantos.pt",
    "phone": "969709433",
    "source": "https://vestiasantos.pt/content/4-quem-somos",
    "instagram": "",
    "observation": "Atividade de maquinaria agrícola e rega e contacto profissional publicados na fonte indicada.",
    "opportunity": "catálogo de maquinaria e sistemas de rega.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://vestiasantos.pt/content/4-quem-somos"
  },
  {
    "company": "Fornima",
    "sector": "Contabilidade",
    "email_area": "Serviços Profissionais",
    "location": "Vila Real",
    "website": "https://fornima.pt/",
    "email": "contato@fornima.pt",
    "phone": "259308215",
    "source": "https://fornima.pt/",
    "instagram": "",
    "observation": "Atividade de contabilidade e contacto profissional publicados na fonte indicada.",
    "opportunity": "apresentação dos serviços contabilísticos.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://fornima.pt/"
  },
  {
    "company": "Contamontes",
    "sector": "Contabilidade e consultoria",
    "email_area": "Serviços Profissionais",
    "location": "Vila Real",
    "website": "https://www.contamontes.pt/",
    "email": "geral@contamontes.pt",
    "phone": "259325591",
    "source": "https://www.contamontes.pt/",
    "instagram": "",
    "observation": "Atividade de contabilidade e consultoria e contacto profissional publicados na fonte indicada.",
    "opportunity": "materiais comerciais de apoio à gestão.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.contamontes.pt/"
  },
  {
    "company": "Aleliv",
    "sector": "Contabilidade",
    "email_area": "Serviços Profissionais",
    "location": "Vila Real",
    "website": "https://www.aleliv.pt/",
    "email": "geral@aleliv.pt",
    "phone": "259301058",
    "source": "https://diretorio.fiz.co/aleliv-gabinete-de-contabilidade-lda-506784495",
    "instagram": "",
    "observation": "Atividade de contabilidade e contacto profissional publicados na fonte indicada.",
    "opportunity": "apresentação dos serviços de consultoria fiscal.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://diretorio.fiz.co/aleliv-gabinete-de-contabilidade-lda-506784495"
  },
  {
    "company": "Climoeste",
    "sector": "Climatização e energias renováveis",
    "email_area": "Construção & Engenharia",
    "location": "Caldas da Rainha, Leiria",
    "website": "https://climoeste.com/",
    "email": "geral@climoeste.com",
    "phone": "262938070",
    "source": "https://climoeste.com/contactos/",
    "instagram": "",
    "observation": "Atividade de climatização e energias renováveis e contacto profissional publicados na fonte indicada.",
    "opportunity": "catálogo de soluções de climatização.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://climoeste.com/contactos/"
  },
  {
    "company": "AC Lourenço",
    "sector": "Equipamentos de hotelaria e climatização",
    "email_area": "Comércio & Retalho",
    "location": "Caldas da Rainha, Leiria",
    "website": "https://www.aclourenco.pt/",
    "email": "geral@aclourenco.pt",
    "phone": "262844408",
    "source": "https://www.aclourenco.pt/contactos/",
    "instagram": "",
    "observation": "Atividade de equipamentos de hotelaria e climatização e contacto profissional publicados na fonte indicada.",
    "opportunity": "catálogo de equipamentos profissionais.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.aclourenco.pt/contactos/"
  },
  {
    "company": "TecniFonte",
    "sector": "Instalação de climatização",
    "email_area": "Construção & Engenharia",
    "location": "Caldas da Rainha, Leiria",
    "website": "https://tecnifonte.pt/",
    "email": "geral@tecnifonte.pt",
    "phone": "262835153",
    "source": "https://tecnifonte.pt/climatizacao/",
    "instagram": "",
    "observation": "Atividade de instalação de climatização e contacto profissional publicados na fonte indicada.",
    "opportunity": "materiais de apresentação de soluções de aquecimento.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://tecnifonte.pt/climatizacao/"
  },
  {
    "company": "Paulo J. V. Dias",
    "sector": "Assistência técnica de climatização",
    "email_area": "Construção & Engenharia",
    "location": "Caldas da Rainha, Leiria",
    "website": "https://paulodiasbaxiroca.com/",
    "email": "geral@paulodiasbaxiroca.com",
    "phone": "262085118",
    "source": "https://paulodiasbaxiroca.com/termos-condicoes.php",
    "instagram": "",
    "observation": "Atividade de assistência técnica de climatização e contacto profissional publicados na fonte indicada.",
    "opportunity": "divulgação de serviços de manutenção.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://paulodiasbaxiroca.com/termos-condicoes.php"
  },
  {
    "company": "FH Clima",
    "sector": "Climatização e energias renováveis",
    "email_area": "Construção & Engenharia",
    "location": "Caldas da Rainha, Leiria",
    "website": "https://www.fhclima.com/",
    "email": "geral@fhclima.com",
    "phone": "",
    "source": "https://scoring.pt/empresas-certificadas/francisco-duarte",
    "instagram": "",
    "observation": "Atividade de climatização e energias renováveis e contacto profissional publicados na fonte indicada.",
    "opportunity": "apresentação gráfica de soluções AVAC.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://scoring.pt/empresas-certificadas/francisco-duarte"
  },
  {
    "company": "Triplo Saber",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Aveiro",
    "website": "https://triplosaber.pt/",
    "email": "geral@triplosaber.pt",
    "phone": "917352893",
    "source": "https://triplosaber.pt/centro-de-estudos/",
    "instagram": "",
    "observation": "Atividade de centro de estudos e contacto profissional publicados na fonte indicada.",
    "opportunity": "materiais de divulgação de explicações e preparação de exames.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://triplosaber.pt/centro-de-estudos/"
  },
  {
    "company": "Topdata",
    "sector": "Sistemas de informação",
    "email_area": "Tecnologia & Digital",
    "location": "Leiria",
    "website": "https://www.topdata.pt/",
    "email": "topdata@topdata.pt",
    "phone": "918849691",
    "source": "https://www.topdata.pt/Site/Contactos",
    "instagram": "",
    "observation": "Atividade de sistemas de informação e contacto profissional publicados na fonte indicada.",
    "opportunity": "apresentação comercial de software de gestão.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.topdata.pt/Site/Contactos"
  },
  {
    "company": "PMR Informática",
    "sector": "Software",
    "email_area": "Tecnologia & Digital",
    "location": "Leiria",
    "website": "https://pmr.pt/",
    "email": "comercial@pmrleiria.pt",
    "phone": "",
    "source": "https://pmr.pt/contactos/",
    "instagram": "",
    "observation": "Atividade de software e contacto profissional publicados na fonte indicada.",
    "opportunity": "materiais comerciais de soluções informáticas.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://pmr.pt/contactos/"
  },
  {
    "company": "TCSi Solutions",
    "sector": "Informática e reparações",
    "email_area": "Tecnologia & Digital",
    "location": "Carvide, Leiria",
    "website": "https://tcsi-solutions.pt/",
    "email": "geral@tcsi-solutions.pt",
    "phone": "918062033",
    "source": "https://tcsi-solutions.pt/",
    "instagram": "",
    "observation": "Atividade de informática e reparações e contacto profissional publicados na fonte indicada.",
    "opportunity": "divulgação de serviços de reparação.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://tcsi-solutions.pt/"
  },
  {
    "company": "Filosoft",
    "sector": "Software",
    "email_area": "Tecnologia & Digital",
    "location": "Leiria",
    "website": "https://www.filosoft.pt/",
    "email": "geral@filosoft.pt",
    "phone": "244820820",
    "source": "https://www.filosoft.pt/index.php/contactos",
    "instagram": "",
    "observation": "Atividade de software e contacto profissional publicados na fonte indicada.",
    "opportunity": "apresentação gráfica de software e formação.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.filosoft.pt/index.php/contactos"
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'',x.instagram||'',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-27).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-27:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-27:',e.message)}
