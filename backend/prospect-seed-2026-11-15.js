// DUIT — Portugal continental, 2026-11-13. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Serralharia das Granjas",
    "sector": "Serralharia",
    "email_area": "Indústria & Produção",
    "location": "Esporões, Braga",
    "website": "https://serralhariagranjas.com",
    "email": "geral@serralhariagranjas.com",
    "phone": "253684719",
    "source": "https://www.serralhariagranjas.com/contactos/",
    "observation": "Empresa de serralharia com contacto profissional publicado na fonte.",
    "opportunity": "Possível criação de materiais gráficos de apresentação dos serviços de serralharia.",
    "service": "design"
  },
  {
    "company": "Serralharia O Bota",
    "sector": "Serralharia",
    "email_area": "Indústria & Produção",
    "location": "Cabeceiras de Basto, Braga",
    "website": "https://serralharia-obota.pt",
    "email": "comercial@serralhariaobota.pt",
    "phone": "253665060",
    "source": "https://www.serralharia-obota.pt/contacto/",
    "observation": "Empresa de serralharia com contacto profissional publicado na fonte.",
    "opportunity": "Possível criação de materiais gráficos de apresentação dos serviços de serralharia.",
    "service": "design"
  },
  {
    "company": "RXM Serralharia",
    "sector": "Serralharia",
    "email_area": "Indústria & Produção",
    "location": "Barcelos, Braga",
    "website": "https://rxm.com.pt",
    "email": "contact@rxm.com.pt",
    "phone": "253773294",
    "source": "https://rxm.com.pt/contactos/",
    "observation": "Empresa de serralharia com contacto profissional publicado na fonte.",
    "opportunity": "Possível criação de materiais gráficos de apresentação dos serviços de serralharia.",
    "service": "design"
  },
  {
    "company": "IGS Serralharia",
    "sector": "Serralharia",
    "email_area": "Indústria & Produção",
    "location": "Trofa, Porto",
    "website": "https://igs.com.pt",
    "email": "geral@igs.com.pt",
    "phone": "229827105",
    "source": "https://igs.com.pt/contact/",
    "observation": "Empresa de serralharia com contacto profissional publicado na fonte.",
    "opportunity": "Possível criação de materiais gráficos de apresentação dos serviços de serralharia.",
    "service": "design"
  },
  {
    "company": "BeneVital",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Lisboa, Lisboa",
    "website": "https://benevital.pt",
    "email": "geral@benevital.pt",
    "phone": "211603148",
    "source": "https://benevital.pt/",
    "observation": "Empresa de fisioterapia com contacto profissional publicado na fonte.",
    "opportunity": "Possível criação de materiais gráficos de apresentação dos serviços de fisioterapia.",
    "service": "design"
  },
  {
    "company": "Fisio 21",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Lisboa, Lisboa",
    "website": "https://fisio21.pt",
    "email": "geral@fisio21.pt",
    "phone": "218471192",
    "source": "https://fisio21.pt/contactos/",
    "observation": "Empresa de fisioterapia com contacto profissional publicado na fonte.",
    "opportunity": "Possível criação de materiais gráficos de apresentação dos serviços de fisioterapia.",
    "service": "design"
  },
  {
    "company": "Portifisio",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Portimão, Faro",
    "website": "https://portifisio.pt",
    "email": "info@portifisio.pt",
    "phone": "282425189",
    "source": "https://www.portifisio.pt/",
    "observation": "Empresa de fisioterapia com contacto profissional publicado na fonte.",
    "opportunity": "Possível criação de materiais gráficos de apresentação dos serviços de fisioterapia.",
    "service": "design"
  },
  {
    "company": "Serralharia Moderna",
    "sector": "Serralharia",
    "email_area": "Indústria & Produção",
    "location": "Amares, Braga",
    "website": "https://serralhariamoderna.com",
    "email": "geral@serralhariamoderna.com",
    "phone": "253993500",
    "source": "https://serralhariamoderna.com/contactos/",
    "observation": "Empresa de serralharia com contacto profissional publicado na fonte.",
    "opportunity": "Possível criação de materiais gráficos de apresentação dos serviços de serralharia.",
    "service": "design"
  },
  {
    "company": "RCMETAL",
    "sector": "Serralharia",
    "email_area": "Indústria & Produção",
    "location": "Sintra, Lisboa",
    "website": "https://rcmetal.pt",
    "email": "geral@rcmetal.pt",
    "phone": "219283237",
    "source": "https://www.rcmetal.pt/",
    "observation": "Empresa de serralharia com contacto profissional publicado na fonte.",
    "opportunity": "Possível criação de materiais gráficos de apresentação dos serviços de serralharia.",
    "service": "design"
  },
  {
    "company": "WAGO House",
    "sector": "Construção modular",
    "email_area": "Construção & Engenharia",
    "location": "Paredes, Porto",
    "website": "https://wagohouse.pt",
    "email": "geral@wagohouse.pt",
    "phone": "224156747",
    "source": "https://wagohouse.pt/contactos/",
    "observation": "Empresa de construção modular com contacto profissional publicado na fonte.",
    "opportunity": "Possível criação de materiais gráficos de apresentação dos serviços de construção modular.",
    "service": "design"
  },
  {
    "company": "COM CORPUS",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Lisboa, Lisboa",
    "website": "https://comcorpus.pt",
    "email": "info@comcorpus.pt",
    "phone": "214010733",
    "source": "https://comcorpus.pt/en/contacts/",
    "observation": "Empresa de fisioterapia com contacto profissional publicado na fonte.",
    "opportunity": "Possível criação de materiais gráficos de apresentação dos serviços de fisioterapia.",
    "service": "design"
  },
  {
    "company": "Drafil",
    "sector": "Carpintaria e mobiliário",
    "email_area": "Indústria & Produção",
    "location": "Guimarães, Braga",
    "website": "https://drafil.pt",
    "email": "geral@drafil.pt",
    "phone": "253413192",
    "source": "https://www.drafil.pt/",
    "observation": "Empresa de carpintaria e mobiliário com contacto profissional publicado na fonte.",
    "opportunity": "Possível criação de materiais gráficos de apresentação dos serviços de carpintaria e mobiliário.",
    "service": "design"
  },
  {
    "company": "O2a Composites",
    "sector": "Indústria de compósitos",
    "email_area": "Indústria & Produção",
    "location": "Vila Nova de Gaia, Porto",
    "website": "https://o2acomposites.pt",
    "email": "comercial@o2a.pt",
    "phone": "227534156",
    "source": "https://www.o2acomposites.pt/contactos",
    "observation": "Empresa de indústria de compósitos com contacto profissional publicado na fonte.",
    "opportunity": "Possível criação de materiais gráficos de apresentação dos serviços de indústria de compósitos.",
    "service": "design"
  },
  {
    "company": "Lusimat",
    "sector": "Indústria",
    "email_area": "Indústria & Produção",
    "location": "Cantanhede, Coimbra",
    "website": "https://lusimat.pt",
    "email": "geral@lusimat.pt",
    "phone": "231420450",
    "source": "https://lusimat.pt/contactos/",
    "observation": "Empresa de indústria com contacto profissional publicado na fonte.",
    "opportunity": "Possível criação de materiais gráficos de apresentação dos serviços de indústria.",
    "service": "design"
  },
  {
    "company": "Metalúrgica Figueirense",
    "sector": "Metalurgia",
    "email_area": "Indústria & Produção",
    "location": "Figueira da Foz, Coimbra",
    "website": "https://mfmetalurgica.pt",
    "email": "geral@mfmetalurgica.pt",
    "phone": "233435915",
    "source": "https://mfmetalurgica.pt/contactos/",
    "observation": "Empresa de metalurgia com contacto profissional publicado na fonte.",
    "opportunity": "Possível criação de materiais gráficos de apresentação dos serviços de metalurgia.",
    "service": "design"
  },
  {
    "company": "Ambicare Industrial",
    "sector": "Serviços industriais",
    "email_area": "Indústria & Produção",
    "location": "Setúbal, Setúbal",
    "website": "https://ambicare.com",
    "email": "ambicare@ambicare.com",
    "phone": "265719830",
    "source": "https://www.ambicare.com/contactos/",
    "observation": "Empresa de serviços industriais com contacto profissional publicado na fonte.",
    "opportunity": "Possível criação de materiais gráficos de apresentação dos serviços de serviços industriais.",
    "service": "design"
  },
  {
    "company": "Clínica Cristina Matias",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Reguengos de Monsaraz, Évora",
    "website": "https://clinicacristinamatias.pt",
    "email": "geral@clinicacristinamatias.pt",
    "phone": "266503748",
    "source": "https://www.fadadodente.pt.elios.pt/clinica/clinica-cristina-matias-reguengos-de-monsaraz",
    "observation": "Empresa de medicina dentária com contacto profissional publicado na fonte.",
    "opportunity": "Possível criação de materiais gráficos de apresentação dos serviços de medicina dentária.",
    "service": "design"
  },
  {
    "company": "Encanto Clínica",
    "sector": "Clínica de saúde familiar",
    "email_area": "Saúde",
    "location": "Montemor-o-Novo, Évora",
    "website": "https://encantoclinica.pt",
    "email": "geral@encantoclinica.pt",
    "phone": "927465938",
    "source": "https://fadadodente.pt/clinica/encanto-clinica-de-saude-familiar-e-bem-estar-montemor-o-novo",
    "observation": "Empresa de clínica de saúde familiar com contacto profissional publicado na fonte.",
    "opportunity": "Possível criação de materiais gráficos de apresentação dos serviços de clínica de saúde familiar.",
    "service": "design"
  },
  {
    "company": "Conclusão Estudos e Formação",
    "sector": "Formação profissional",
    "email_area": "Educação & Formação",
    "location": "Coimbra, Coimbra",
    "website": "https://conclusao.pt",
    "email": "geral@conclusao.pt",
    "phone": "239497990",
    "source": "https://conclusao.pt/portal/entidade/",
    "observation": "Empresa de formação profissional com contacto profissional publicado na fonte.",
    "opportunity": "Possível criação de materiais gráficos de apresentação dos serviços de formação profissional.",
    "service": "design"
  },
  {
    "company": "Benogue",
    "sector": "Mudanças e transportes",
    "email_area": "Transportes & Logística",
    "location": "Lisboa, Lisboa",
    "website": "https://benogue.pt",
    "email": "geral@benogue.pt",
    "phone": "210137906",
    "source": "https://www.benogue.pt/contactos.html",
    "observation": "Empresa de mudanças e transportes com contacto profissional publicado na fonte.",
    "opportunity": "Possível criação de materiais gráficos de apresentação dos serviços de mudanças e transportes.",
    "service": "design"
  },
  {
    "company": "Aqui n'al-deia",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Mértola, Beja",
    "website": "https://aquinaldeia.pt",
    "email": "geral@aquinaldeia.pt",
    "phone": "931741110",
    "source": "https://www.aquinaldeia.pt/contact.php",
    "observation": "Empresa de turismo rural com contacto profissional publicado na fonte.",
    "opportunity": "Possível criação de materiais gráficos de apresentação dos serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Monte Chalaça",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Ferreira do Alentejo, Beja",
    "website": "https://montechalaca.pt",
    "email": "geral@montechalaca.pt",
    "phone": "284739015",
    "source": "https://www.montechalaca.pt/fr/contacts",
    "observation": "Empresa de turismo rural com contacto profissional publicado na fonte.",
    "opportunity": "Possível criação de materiais gráficos de apresentação dos serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Herdade do Burrazeiro",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Borba, Évora",
    "website": "https://herdadedoburrazeiro.com",
    "email": "geral@burrazeiro.com",
    "phone": "913137258",
    "source": "https://www.herdadedoburrazeiro.com/%7B%7B%20C.mail%20%7D%7D",
    "observation": "Empresa de turismo rural com contacto profissional publicado na fonte.",
    "opportunity": "Possível criação de materiais gráficos de apresentação dos serviços de turismo rural.",
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
 }})();console.log('[crm] seed 2026-11-15:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-15:',e.message)}
