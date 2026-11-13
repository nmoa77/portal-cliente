// DUIT — Portugal continental, 2026-11-13. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Vicente e Ramos",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Torres Novas, Santarém",
    "website": "https://vicenteeramos.pt",
    "email": "geral@vicenteeramos.pt",
    "phone": "249831546",
    "source": "https://www.vicenteeramos.pt/contactos/",
    "observation": "Empresa com atividade de carpintaria e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de carpintaria.",
    "service": "design"
  },
  {
    "company": "MEC Engenharia",
    "sector": "Engenharia e construção",
    "email_area": "Construção & Engenharia",
    "location": "Lisboa, Lisboa",
    "website": "https://mec-engenharia.pt",
    "email": "geral@mec-engenharia.pt",
    "phone": "218006119",
    "source": "https://www.mec-engenharia.pt/contactos",
    "observation": "Empresa com atividade de engenharia e construção e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de engenharia e construção.",
    "service": "design"
  },
  {
    "company": "Carpintaria António Pacheco",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Penafiel, Porto",
    "website": "https://cap.com.pt",
    "email": "geral@cap.com.pt",
    "phone": "255724555",
    "source": "https://www.cap.com.pt/web/contactos/",
    "observation": "Empresa com atividade de carpintaria e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de carpintaria.",
    "service": "design"
  },
  {
    "company": "Transportes Central Pombalense",
    "sector": "Transportes rodoviários",
    "email_area": "Transportes & Logística",
    "location": "Pombal, Leiria",
    "website": "https://tcp.pt",
    "email": "geral@tcp.pt",
    "phone": "236949080",
    "source": "https://www.tcp.pt/contactos/",
    "observation": "Empresa com atividade de transportes rodoviários e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de transportes rodoviários.",
    "service": "design"
  },
  {
    "company": "Transportes MEG",
    "sector": "Transportes rodoviários",
    "email_area": "Transportes & Logística",
    "location": "Tondela, Viseu",
    "website": "https://meg.pt",
    "email": "geral@meg.pt",
    "phone": "232099542",
    "source": "https://meg.pt/contactos/",
    "observation": "Empresa com atividade de transportes rodoviários e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de transportes rodoviários.",
    "service": "design"
  },
  {
    "company": "MGC Transportes",
    "sector": "Transportes e logística",
    "email_area": "Transportes & Logística",
    "location": "Vila Nova de Gaia, Porto",
    "website": "https://mgc.pt",
    "email": "geral@mgc.pt",
    "phone": "227863010",
    "source": "https://www.mgc.pt/pt/contactos/",
    "observation": "Empresa com atividade de transportes e logística e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de transportes e logística.",
    "service": "design"
  },
  {
    "company": "Rasa Engenharia",
    "sector": "Engenharia e construção",
    "email_area": "Construção & Engenharia",
    "location": "Lisboa, Lisboa",
    "website": "https://rasaengenharia.pt",
    "email": "geral@rasaengenharia.pt",
    "phone": "939474741",
    "source": "https://rasaengenharia.pt/contactos/",
    "observation": "Empresa com atividade de engenharia e construção e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de engenharia e construção.",
    "service": "design"
  },
  {
    "company": "Pluma Fisioterapia",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Sintra, Lisboa",
    "website": "https://plumafisioterapia.pt",
    "email": "geral@plumafisioterapia.pt",
    "phone": "927754262",
    "source": "https://plumafisioterapia.pt/contactos/",
    "observation": "Empresa com atividade de fisioterapia e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de fisioterapia.",
    "service": "design"
  },
  {
    "company": "HSS Carpintaria",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Pombal, Leiria",
    "website": "https://hsscarpintaria.pt",
    "email": "geral@hsscarpintaria.pt",
    "phone": "236214394",
    "source": "https://www.hsscarpintaria.pt/contactos/",
    "observation": "Empresa com atividade de carpintaria e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de carpintaria.",
    "service": "design"
  },
  {
    "company": "Be Motion",
    "sector": "Pilates clínico e fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Caxias, Lisboa",
    "website": "https://bemotion.pt",
    "email": "geral@bemotion.pt",
    "phone": "967069820",
    "source": "https://bemotion.pt/contactos/",
    "observation": "Empresa com atividade de pilates clínico e fisioterapia e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de pilates clínico e fisioterapia.",
    "service": "design"
  },
  {
    "company": "FDE Engenharia",
    "sector": "Engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Marco de Canaveses, Porto",
    "website": "https://fde-engenharia.pt",
    "email": "geral@fde-engenharia.pt",
    "phone": "255582846",
    "source": "https://www.fde-engenharia.pt/contactos.html",
    "observation": "Empresa com atividade de engenharia e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de engenharia.",
    "service": "design"
  },
  {
    "company": "GBR Engenharia",
    "sector": "Engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Lisboa, Lisboa",
    "website": "https://gbr-engenharia.pt",
    "email": "geral@gbr-engenharia.pt",
    "phone": "218068880",
    "source": "https://gbr-engenharia.pt/contactos/",
    "observation": "Empresa com atividade de engenharia e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de engenharia.",
    "service": "design"
  },
  {
    "company": "JDR José Duarte Rodrigues",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Seixal, Setúbal",
    "website": "https://jdr.pt",
    "email": "geral@jdr.pt",
    "phone": "210452199",
    "source": "https://jdr.pai.pt/localizacao-contactos",
    "observation": "Empresa com atividade de carpintaria e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de carpintaria.",
    "service": "design"
  },
  {
    "company": "José Carlos Faneca Transportes",
    "sector": "Transportes rodoviários",
    "email_area": "Transportes & Logística",
    "location": "Lourosa, Aveiro",
    "website": "https://transportesfaneca.pt",
    "email": "geral@transportesfaneca.pt",
    "phone": "914228898",
    "source": "https://transportesfaneca.pt/",
    "observation": "Empresa com atividade de transportes rodoviários e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de transportes rodoviários.",
    "service": "design"
  },
  {
    "company": "Clinical Studio",
    "sector": "Fisioterapia e pilates",
    "email_area": "Fisioterapia",
    "location": "Vila Nova de Gaia, Porto",
    "website": "https://clinicalstudio.pt",
    "email": "geral@clinicalstudio.pt",
    "phone": "926643908",
    "source": "https://clinicalstudio.pt/contactos/",
    "observation": "Empresa com atividade de fisioterapia e pilates e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de fisioterapia e pilates.",
    "service": "design"
  },
  {
    "company": "Carpin Solutions",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Montijo, Setúbal",
    "website": "https://carpinsolutions.pt",
    "email": "geral@carpinsolutions.pt",
    "phone": "212532410",
    "source": "https://www.carpinsolutions.pt/",
    "observation": "Empresa com atividade de carpintaria e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de carpintaria.",
    "service": "design"
  },
  {
    "company": "Ignição Paralela Transportes",
    "sector": "Transportes rodoviários",
    "email_area": "Transportes & Logística",
    "location": "Oliveira de Frades, Viseu",
    "website": "https://iptransportes.pt",
    "email": "geral@iptransportes.pt",
    "phone": "232763741",
    "source": "https://iptransportes.pt/contactos/",
    "observation": "Empresa com atividade de transportes rodoviários e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de transportes rodoviários.",
    "service": "design"
  },
  {
    "company": "CLIAPSI",
    "sector": "Psicologia clínica",
    "email_area": "Saúde Mental",
    "location": "Luso, Aveiro",
    "website": "https://cliapsi.pt",
    "email": "geral@cliapsi.pt",
    "phone": "234381689",
    "source": "https://www.cliapsi.pt/contactos",
    "observation": "Empresa com atividade de psicologia clínica e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de psicologia clínica.",
    "service": "design"
  },
  {
    "company": "Clínica de Psicologia e Psicoterapia",
    "sector": "Psicologia clínica",
    "email_area": "Saúde Mental",
    "location": "Coimbra, Coimbra",
    "website": "https://clinicadepsicologiaepsicoterapia.pt",
    "email": "geral@clinicadepsicologiaepsicoterapia.pt",
    "phone": "239824343",
    "source": "https://clinicadepsicologiaepsicoterapia.pt/contactos/",
    "observation": "Empresa com atividade de psicologia clínica e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de psicologia clínica.",
    "service": "design"
  },
  {
    "company": "R.A. Ramos Oficina",
    "sector": "Oficina automóvel",
    "email_area": "Automóvel",
    "location": "Lisboa, Lisboa",
    "website": "https://raramos.pt",
    "email": "geral@raramos.pt",
    "phone": "212697870",
    "source": "https://oficina.raramos.pt/",
    "observation": "Empresa com atividade de oficina automóvel e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de oficina automóvel.",
    "service": "design"
  },
  {
    "company": "Lopes Ribeiro Pinturas",
    "sector": "Reparação automóvel",
    "email_area": "Automóvel",
    "location": "Vialonga, Lisboa",
    "website": "https://lopesribeiro.pt",
    "email": "geral@lopesribeiro.pt",
    "phone": "219748180",
    "source": "https://www.lopesribeiro.pt/contactos",
    "observation": "Empresa com atividade de reparação automóvel e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de reparação automóvel.",
    "service": "design"
  },
  {
    "company": "Amorcar",
    "sector": "Oficina automóvel",
    "email_area": "Automóvel",
    "location": "Queluz, Lisboa",
    "website": "https://amorcar.pt",
    "email": "geral@amorcar.pt",
    "phone": "214362680",
    "source": "https://amorcar.pt/",
    "observation": "Empresa com atividade de oficina automóvel e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de oficina automóvel.",
    "service": "design"
  },
  {
    "company": "L.D. Agro",
    "sector": "Comércio de produtos agrícolas",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Évora, Évora",
    "website": "https://ldagro.pt",
    "email": "geral@ldagro.pt",
    "phone": "915520709",
    "source": "https://www.ldagro.pt/",
    "observation": "Empresa com atividade de comércio de produtos agrícolas e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de comércio de produtos agrícolas.",
    "service": "design"
  },
  {
    "company": "Nutrima Agri Feeds",
    "sector": "Alimentação animal",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Évora, Évora",
    "website": "https://nutrima.pt",
    "email": "geral@nutrima.pt",
    "phone": "266104474",
    "source": "https://www.nutrima.pt/pt/contactos_221.html",
    "observation": "Empresa com atividade de alimentação animal e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de alimentação animal.",
    "service": "design"
  },
  {
    "company": "RacingMania",
    "sector": "Oficina automóvel",
    "email_area": "Automóvel",
    "location": "Penacova, Coimbra",
    "website": "https://racingmania.pt",
    "email": "geral@racingmania.pt",
    "phone": "239098930",
    "source": "https://racingmania.pt/contactos/",
    "observation": "Empresa com atividade de oficina automóvel e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de oficina automóvel.",
    "service": "design"
  },
  {
    "company": "Psicóloga Cristina Cabral",
    "sector": "Psicologia clínica",
    "email_area": "Saúde Mental",
    "location": "Coimbra, Coimbra",
    "website": "https://psicologaclinicacristinacabral.pt",
    "email": "geral@psicologaclinicacristinacabral.pt",
    "phone": "936603303",
    "source": "https://psicologaclinicacristinacabral.pt/contactos/",
    "observation": "Empresa com atividade de psicologia clínica e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de psicologia clínica.",
    "service": "design"
  },
  {
    "company": "Cars Inc",
    "sector": "Oficina automóvel",
    "email_area": "Automóvel",
    "location": "Faro, Faro",
    "website": "https://carsinc.pt",
    "email": "geral@carsinc.pt",
    "phone": "289832156",
    "source": "https://carsinc.pt/",
    "observation": "Empresa com atividade de oficina automóvel e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de oficina automóvel.",
    "service": "design"
  },
  {
    "company": "Marlene Marques Clínica Dentária",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Guarda, Guarda",
    "website": "https://marlenemarques.pt",
    "email": "geral@marlenemarques.pt",
    "phone": "968144594",
    "source": "https://www.marlenemarques.pt/clinica-dentaria-guarda/pt-pt/geral/contactos",
    "observation": "Empresa com atividade de medicina dentária e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de medicina dentária.",
    "service": "design"
  },
  {
    "company": "Centro de Estudo Total",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Vila Nova de Gaia, Porto",
    "website": "https://totalestudo.pt",
    "email": "geral@totalestudo.pt",
    "phone": "912889180",
    "source": "https://www.totalestudo.pt/home",
    "observation": "Empresa com atividade de centro de estudos e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de centro de estudos.",
    "service": "design"
  },
  {
    "company": "Clínica Dentária Franco",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Alcobaça, Leiria",
    "website": "https://clinicadentariafranco.pt",
    "email": "geral@clinicadentariafranco.pt",
    "phone": "262598399",
    "source": "https://www.oa.pt/cd/Conteudos/Directorio/resultado_pesquisa.aspx?idc=31850&idsc=107192&npage=3&sidc=31846&tema=107267",
    "observation": "Empresa com atividade de medicina dentária e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação de serviços de medicina dentária.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-13).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-13-e:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-13-e:',e.message)}
