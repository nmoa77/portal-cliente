// DUIT — 2026-11-24. Empresas e emails profissionais verificados em fontes públicas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Actimeca",
    "sector": "Metalomecânica industrial",
    "email_area": "Indústria & Produção",
    "location": "Setúbal, Setúbal",
    "website": "https://actimeca.pt",
    "email": "producao@actimeca.pt",
    "phone": "265247531",
    "source": "https://actimeca.pt/",
    "observation": "A fonte indicada identifica a atividade de metalomecânica industrial e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de metalomecânica industrial.",
    "service": "design"
  },
  {
    "company": "Metalomecânica MJS",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Paços de Brandão, Aveiro",
    "website": "https://metalomecanica-mjs.com",
    "email": "geral@metalomecanica-mjs.com",
    "phone": "227445071",
    "source": "https://metalomecanica-mjs.com/contatos/",
    "observation": "A fonte indicada identifica a atividade de metalomecânica e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de metalomecânica.",
    "service": "design"
  },
  {
    "company": "Cobalto Douro Metalomecânica",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Barcos, Tabuaço, Viseu",
    "website": "https://cobaltometalomecanica.com",
    "email": "geral@cobaltometalomecanica.com",
    "phone": "254090473",
    "source": "https://cobaltometalomecanica.com/contactos/",
    "observation": "A fonte indicada identifica a atividade de metalomecânica e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de metalomecânica.",
    "service": "design"
  },
  {
    "company": "SPWOOD",
    "sector": "Carpintaria e mobiliário",
    "email_area": "Indústria & Produção",
    "location": "Várzea, Barcelos, Braga",
    "website": "https://spwood.pt",
    "email": "geral@spwood.pt",
    "phone": "253953160",
    "source": "https://spwood.pt/contactos/",
    "observation": "A fonte indicada identifica a atividade de carpintaria e mobiliário e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de carpintaria e mobiliário.",
    "service": "design"
  },
  {
    "company": "HMF Sociedade de Metalomecânica",
    "sector": "Metalomecânica e soldadura",
    "email_area": "Indústria & Produção",
    "location": "Figueira da Foz, Coimbra",
    "website": "https://hmf.com.pt",
    "email": "geral@hmf.com.pt",
    "phone": "233094147",
    "source": "https://hmf-com-pt.webnode.pt/contactos/",
    "observation": "A fonte indicada identifica a atividade de metalomecânica e soldadura e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de metalomecânica e soldadura.",
    "service": "design"
  },
  {
    "company": "Carpintaria Portugal",
    "sector": "Carpintaria e mobiliário por medida",
    "email_area": "Indústria & Produção",
    "location": "Lisboa, Lisboa",
    "website": "https://carpintariaportugal.com",
    "email": "geral@carpintariaportugal.com",
    "phone": "912256343",
    "source": "https://carpintariaportugal.com/",
    "observation": "A fonte indicada identifica a atividade de carpintaria e mobiliário por medida e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de carpintaria e mobiliário por medida.",
    "service": "design"
  },
  {
    "company": "FCF Carpintaria",
    "sector": "Carpintaria e mobiliário",
    "email_area": "Indústria & Produção",
    "location": "Telões, Amarante, Porto",
    "website": "https://fcfcarpintaria.com",
    "email": "geral@fcfcarpintaria.com",
    "phone": "255001055",
    "source": "https://fcfcarpintaria.com/contactos/",
    "observation": "A fonte indicada identifica a atividade de carpintaria e mobiliário e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de carpintaria e mobiliário.",
    "service": "design"
  },
  {
    "company": "António Abreu Metalomecânica",
    "sector": "Produção de componentes metálicos",
    "email_area": "Indústria & Produção",
    "location": "Portugal continental",
    "website": "https://aametalomecanica.com",
    "email": "geral@aametalomecanica.com",
    "phone": "",
    "source": "https://www.aametalomecanica.com/",
    "observation": "A fonte indicada identifica a atividade de produção de componentes metálicos e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de produção de componentes metálicos.",
    "service": "design"
  },
  {
    "company": "Carpintaria António Pacheco",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Galegos, Penafiel, Porto",
    "website": "https://cap.com.pt",
    "email": "geral@cap.com.pt",
    "phone": "255724555",
    "source": "https://www.cap.com.pt/web/contactos/",
    "observation": "A fonte indicada identifica a atividade de carpintaria e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de carpintaria.",
    "service": "design"
  },
  {
    "company": "AMCA Carpintaria",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Grijó, Vila Nova de Gaia, Porto",
    "website": "https://amcacarpintaria.pt",
    "email": "geral@amcacarpintaria.pt",
    "phone": "227647628",
    "source": "https://amcacarpintaria.pt/contactos/",
    "observation": "A fonte indicada identifica a atividade de carpintaria e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de carpintaria.",
    "service": "design"
  },
  {
    "company": "Carpintaria Lino & Filhos",
    "sector": "Carpintaria e remodelação",
    "email_area": "Indústria & Produção",
    "location": "Lisboa, Lisboa",
    "website": "https://linoefilhos.pt",
    "email": "geral@linoefilhos.pt",
    "phone": "218480204",
    "source": "https://linoefilhos.pt/",
    "observation": "A fonte indicada identifica a atividade de carpintaria e remodelação e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de carpintaria e remodelação.",
    "service": "design"
  },
  {
    "company": "Carpintaria Miguel Batista",
    "sector": "Carpintaria e mobiliário",
    "email_area": "Indústria & Produção",
    "location": "Sátão, Viseu",
    "website": "https://carpintariambatista.pt",
    "email": "geral@carpintariambatista.pt",
    "phone": "232982099",
    "source": "https://www.carpintariambatista.pt/empresa",
    "observation": "A fonte indicada identifica a atividade de carpintaria e mobiliário e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de carpintaria e mobiliário.",
    "service": "design"
  },
  {
    "company": "Vila Valmonte",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Aldeia do Rouquenho, Beja",
    "website": "https://vilavalmonte.eu",
    "email": "info@vilavalmonte.eu",
    "phone": "917757354",
    "source": "https://www.vilavalmonte.eu/contactos/",
    "observation": "A fonte indicada identifica a atividade de turismo rural e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Transaliados",
    "sector": "Transporte de carga e logística",
    "email_area": "Transportes & Logística",
    "location": "Cascais, Lisboa",
    "website": "https://transaliados.pt",
    "email": "geral@transaliados.pt",
    "phone": "",
    "source": "https://transaliados.pt/contact/",
    "observation": "A fonte indicada identifica a atividade de transporte de carga e logística e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de transporte de carga e logística.",
    "service": "design"
  },
  {
    "company": "Trans F. Silva",
    "sector": "Transporte rodoviário de mercadorias",
    "email_area": "Transportes & Logística",
    "location": "Silvares, Guimarães, Braga",
    "website": "https://transportesfsilva.pt",
    "email": "geral@transportesfsilva.pt",
    "phone": "916019050",
    "source": "https://www.transportesfsilva.pt/",
    "observation": "A fonte indicada identifica a atividade de transporte rodoviário de mercadorias e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de transporte rodoviário de mercadorias.",
    "service": "design"
  },
  {
    "company": "Transbesouro",
    "sector": "Transportes rodoviários",
    "email_area": "Transportes & Logística",
    "location": "Faro, Faro",
    "website": "https://transbesouro.com",
    "email": "info@transbesouro.com",
    "phone": "289832884",
    "source": "https://www.transbesouro.com/contactos/",
    "observation": "A fonte indicada identifica a atividade de transportes rodoviários e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de transportes rodoviários.",
    "service": "design"
  },
  {
    "company": "Bärdade",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Castelo de Vide, Portalegre",
    "website": "https://baerdade.pt",
    "email": "ola@baerdade.pt",
    "phone": "926530610",
    "source": "https://baerdade.pt/pt/",
    "observation": "A fonte indicada identifica a atividade de turismo rural e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "HN Transportes",
    "sector": "Transportes rodoviários",
    "email_area": "Transportes & Logística",
    "location": "Cesar, Oliveira de Azeméis, Aveiro",
    "website": "https://hntransportes.pt",
    "email": "info@hntransportes.pt",
    "phone": "913310440",
    "source": "https://hntransportes.pt/termos.html",
    "observation": "A fonte indicada identifica a atividade de transportes rodoviários e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de transportes rodoviários.",
    "service": "design"
  },
  {
    "company": "Quinta das Ratoeiras",
    "sector": "Enoturismo e alojamento rural",
    "email_area": "Turismo & Alojamento",
    "location": "Vila de Frades, Vidigueira, Beja",
    "website": "https://quintadasratoeiras.pt",
    "email": "info@quintadasratoeiras.pt",
    "phone": "918737437",
    "source": "https://quintadasratoeiras.pt/contact?lang=es",
    "observation": "A fonte indicada identifica a atividade de enoturismo e alojamento rural e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de enoturismo e alojamento rural.",
    "service": "design"
  },
  {
    "company": "Monte Tons da Terra",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Santiago do Cacém, Setúbal",
    "website": "https://tonsdaterra.com",
    "email": "geral@tonsdaterra.com",
    "phone": "269909016",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=35&f%5B0%5D=bm_field_ma_gin_sio%3Atrue&f%5B1%5D=bm_field_ma_restaurante%3Atrue&f%5B2%5D=im_subtipo_alojamento%3A586",
    "observation": "A fonte indicada identifica a atividade de turismo rural e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "DentalClinic",
    "sector": "Clínica dentária",
    "email_area": "Dentistas",
    "location": "Évora, Évora",
    "website": "https://dentalclinic.pt",
    "email": "rececao@dentalclinic.pt",
    "phone": "266744214",
    "source": "https://dentalclinic.pt/contactos/",
    "observation": "A fonte indicada identifica a atividade de clínica dentária e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de clínica dentária.",
    "service": "design"
  },
  {
    "company": "CR Oral",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Évora, Évora",
    "website": "https://cr-oral.pt",
    "email": "info@croaevora.pt",
    "phone": "266106471",
    "source": "https://www.cr-oral.pt/",
    "observation": "A fonte indicada identifica a atividade de medicina dentária e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de medicina dentária.",
    "service": "design"
  },
  {
    "company": "EXPLICAS Centro de Estudos",
    "sector": "Centro de estudos e explicações",
    "email_area": "Centro de Estudos",
    "location": "Torre da Marinha, Seixal, Setúbal",
    "website": "https://explicas.pt",
    "email": "centro@explicas.pt",
    "phone": "913443721",
    "source": "https://explicas.pt/",
    "observation": "A fonte indicada identifica a atividade de centro de estudos e explicações e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de centro de estudos e explicações.",
    "service": "design"
  },
  {
    "company": "EV Oral Center",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Évora, Évora",
    "website": "https://evoral.pt",
    "email": "ev@evoral.pt",
    "phone": "266048608",
    "source": "https://www.fadadodente.pt.elios.pt/clinica/ev-oral-center-evora",
    "observation": "A fonte indicada identifica a atividade de medicina dentária e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de medicina dentária.",
    "service": "design"
  },
  {
    "company": "Geresmont",
    "sector": "Turismo de aventura",
    "email_area": "Aventura",
    "location": "Vilar da Veiga, Terras de Bouro, Braga",
    "website": "https://geresmont.com",
    "email": "info@geresmont.com",
    "phone": "919617773",
    "source": "https://geres.pt/geresmont/",
    "observation": "A fonte indicada identifica a atividade de turismo de aventura e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de turismo de aventura.",
    "service": "design"
  },
  {
    "company": "Green Man Gerês",
    "sector": "Turismo de natureza",
    "email_area": "Aventura",
    "location": "Gerês, Braga",
    "website": "https://greenmangeres.com",
    "email": "info@greenmangeres.com",
    "phone": "913948596",
    "source": "https://geresativo.cm-terrasdebouro.pt/empresas/",
    "observation": "A fonte indicada identifica a atividade de turismo de natureza e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de turismo de natureza.",
    "service": "design"
  },
  {
    "company": "Lobo Tours",
    "sector": "Turismo de aventura",
    "email_area": "Aventura",
    "location": "Gerês, Braga",
    "website": "https://gereslobotours.pt",
    "email": "geral@gereslobotours.pt",
    "phone": "911989651",
    "source": "https://geresativo.cm-terrasdebouro.pt/empresas/",
    "observation": "A fonte indicada identifica a atividade de turismo de aventura e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de turismo de aventura.",
    "service": "design"
  },
  {
    "company": "RB Hiking & Trekking",
    "sector": "Caminhadas e turismo de natureza",
    "email_area": "Aventura",
    "location": "Gerês, Braga",
    "website": "https://barbosa-trekking.pt",
    "email": "hiking@barbosa-trekking.pt",
    "phone": "938450305",
    "source": "https://geresativo.cm-terrasdebouro.pt/empresas/",
    "observation": "A fonte indicada identifica a atividade de caminhadas e turismo de natureza e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de caminhadas e turismo de natureza.",
    "service": "design"
  },
  {
    "company": "Sulco",
    "sector": "Comércio de alfaias agrícolas",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Beja, Beja",
    "website": "https://sulco.pt",
    "email": "geral@sulco.pt",
    "phone": "284326922",
    "source": "https://www.sulco.pt/",
    "observation": "A fonte indicada identifica a atividade de comércio de alfaias agrícolas e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de comércio de alfaias agrícolas.",
    "service": "design"
  },
  {
    "company": "Paladares e Aventuras",
    "sector": "Turismo de aventura",
    "email_area": "Aventura",
    "location": "Estremoz, Évora",
    "website": "https://paladareseaventuras.com",
    "email": "geral@paladareseaventuras.com",
    "phone": "912322911",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=485&f%5B0%5D=bm_field_ma_aluguer_de_bicicleta%3Atrue&f%5B1%5D=bm_field_ma_rappel_e_slide%3Atrue&f%5B2%5D=bm_field_ma_paintball%3Atrue&page=2&visitas=1",
    "observation": "A fonte indicada identifica a atividade de turismo de aventura e apresenta o email profissional da empresa.",
    "opportunity": "Possível criação de materiais gráficos para comunicar serviços de turismo de aventura.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-23).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-24:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-24:',e.message)}
