// DUIT — Portugal continental, 2026-11-06-d. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Clínica AO Armando Oliveira",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Viseu, Viseu",
    "website": "https://clinica-ao.pt/",
    "email": "marcacoes@clinica-ao.pt",
    "phone": "232 421 040",
    "source": "https://clinica-ao.pt/contactos/",
    "observation": "Clínica de medicina dentária em Viseu.",
    "opportunity": "Materiais informativos sobre tratamentos.",
    "service": "design"
  },
  {
    "company": "Clínica Médica Dentária de Viseu",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Viseu, Viseu",
    "website": "https://www.cmdv.pt/",
    "email": "atendimento@cmdviseu.com",
    "phone": "232 421 793",
    "source": "https://www.cmdv.pt/contactos.php",
    "observation": "Clínica com diferentes tratamentos dentários.",
    "opportunity": "Peças gráficas para especialidades.",
    "service": "design"
  },
  {
    "company": "Cliniviseu",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Viseu, Viseu",
    "website": "https://www.cliniviseu.com/",
    "email": "geral@cliniviseu.com",
    "phone": "232 422 692",
    "source": "https://www.cliniviseu.com/contactos-viseu/",
    "observation": "Clínica dentária na Rua D. Francisco Alexandre Lobo.",
    "opportunity": "Materiais informativos sobre consultas.",
    "service": "design"
  },
  {
    "company": "Clínica Dentária Dr. Fernandes",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Viseu, Viseu",
    "website": "https://www.clinicadrfernandes.com/",
    "email": "geral@clinicadrfernandes.com",
    "phone": "232 421 530",
    "source": "https://www.clinicadrfernandes.com/inicio/contactos/",
    "observation": "Clínica dentária na Avenida António José de Almeida.",
    "opportunity": "Peças de divulgação de serviços.",
    "service": "design"
  },
  {
    "company": "Clínica RR",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Viseu, Viseu",
    "website": "https://clinicarr.com/",
    "email": "geral@clinicarr.com",
    "phone": "232 411 595",
    "source": "https://clinicarr.com/contactos/",
    "observation": "Clínica dentária com licença de funcionamento publicada.",
    "opportunity": "Materiais de apresentação clínica.",
    "service": "design"
  },
  {
    "company": "Clínica Gisela Sousa",
    "sector": "Clínica médica e dentária",
    "email_area": "Dentistas",
    "location": "Viseu, Viseu",
    "website": "https://clinicagiselasousa.com/",
    "email": "geral@clinicagiselasousa.com",
    "phone": "232 405 268",
    "source": "https://clinicagiselasousa.com/contactos/",
    "observation": "Clínica médica e dentária em Viseu.",
    "opportunity": "Materiais de informação sobre consultas.",
    "service": "design"
  },
  {
    "company": "Madrugada Turismo Rural",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Évora, Évora",
    "website": "https://madrugadaturismorural.com/",
    "email": "info@madrugadaturismorural.com",
    "phone": "918 784 221",
    "source": "https://madrugadaturismorural.com/pt/contacto/",
    "observation": "Alojamento rural com quartos e piscina perto de Évora.",
    "opportunity": "Peças de apresentação das estadias.",
    "service": "design"
  },
  {
    "company": "Casa de Baco",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Igrejinha, Arraiolos, Évora",
    "website": "https://casadebaco.pt/",
    "email": "geral@casadebaco.pt",
    "phone": "934 797 814",
    "source": "https://casadebaco.pt/pt/contacte-nos",
    "observation": "Alojamento de turismo rural em Igrejinha.",
    "opportunity": "Materiais de divulgação de alojamento.",
    "service": "design"
  },
  {
    "company": "Escola de Ballet do Porto",
    "sector": "Ensino de dança",
    "email_area": "Estúdios de Dança",
    "location": "Porto, Porto",
    "website": "https://www.escoladeballetdoporto.pt/",
    "email": "geral@escoladeballetdoporto.pt",
    "phone": "226 169 031",
    "source": "https://www.escoladeballetdoporto.pt/contacto/",
    "observation": "Escola de ballet na Rua José Augusto de Castro.",
    "opportunity": "Peças de divulgação de cursos.",
    "service": "design"
  },
  {
    "company": "Escola Domus Dança",
    "sector": "Ensino de dança",
    "email_area": "Estúdios de Dança",
    "location": "Porto, Porto",
    "website": "https://www.escoladomusdanca.org/",
    "email": "edd@escoladomusdanca.org",
    "phone": "220 927 372",
    "source": "https://www.escoladomusdanca.org/",
    "observation": "Escola de dança na Rua da Aliança.",
    "opportunity": "Materiais para apresentações e cursos.",
    "service": "design"
  },
  {
    "company": "Móveis e Carpintaria",
    "sector": "Carpintaria e mobiliário",
    "email_area": "Indústria & Produção",
    "location": "Avelada, Braga",
    "website": "https://moveisecarpintaria.pt/",
    "email": "geral@moveisecarpintaria.pt",
    "phone": "912 823 295",
    "source": "https://moveisecarpintaria.pt/contactos/",
    "observation": "Empresa de carpintaria na Avelada.",
    "opportunity": "Catálogo de trabalhos de mobiliário.",
    "service": "design"
  },
  {
    "company": "Clínica Rui Faria",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Leiria, Leiria",
    "website": "https://clinicaruifaria.pt/",
    "email": "info@clinicaruifaria.pt",
    "phone": "244 827 685",
    "source": "https://clinicaruifaria.pt/contactos/",
    "observation": "Clínica de fisioterapia com unidades em várias cidades.",
    "opportunity": "Materiais informativos de tratamentos.",
    "service": "design"
  },
  {
    "company": "Sabor Latino",
    "sector": "Escola de dança",
    "email_area": "Estúdios de Dança",
    "location": "Porto, Porto",
    "website": "https://saborlatino.pt/",
    "email": "saborlatino@saborlatino.pt",
    "phone": "226 095 510",
    "source": "https://saborlatino.pt/contactos/",
    "observation": "Escola de dança com estúdios no Porto.",
    "opportunity": "Peças de divulgação de modalidades.",
    "service": "design"
  },
  {
    "company": "Formel",
    "sector": "Carpintaria e mobiliário",
    "email_area": "Indústria & Produção",
    "location": "Vila Verde, Braga",
    "website": "https://formel.pt/",
    "email": "geral@formel.pt",
    "phone": "924 329 892",
    "source": "https://formel.pt/",
    "observation": "Produz cozinhas e mobiliário por medida.",
    "opportunity": "Catálogo de soluções por medida.",
    "service": "design"
  },
  {
    "company": "Quinta da Pitarrela",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Vila Real, Vila Real",
    "website": "https://quintadapitarrela.com/",
    "email": "geral@quintadapitarrela.com",
    "phone": "932 008 014",
    "source": "https://quintadapitarrela.com/contact/",
    "observation": "Alojamento de turismo rural em Vila Real.",
    "opportunity": "Materiais de apresentação de experiências.",
    "service": "design"
  },
  {
    "company": "Lição de Tango",
    "sector": "Escola de dança",
    "email_area": "Estúdios de Dança",
    "location": "Porto, Porto",
    "website": "https://www.licaodetango.com/",
    "email": "info@licaodetango.com",
    "phone": "936 007 883",
    "source": "https://www.licaodetango.com/contacto",
    "observation": "Escola de tango na Rua Faria Guimarães.",
    "opportunity": "Peças de divulgação de aulas.",
    "service": "design"
  },
  {
    "company": "Casa da Quinta de São Martinho",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Mateus, Vila Real",
    "website": "http://www.quintasaomartinho.com",
    "email": "geral@quintasaomartinho.com",
    "phone": "259 323 986",
    "source": "https://www.visitportugal.com/pt-pt/content/casa-da-quinta-de-s%C3%A3o-martinho",
    "observation": "Turismo rural numa casa do século XVII.",
    "opportunity": "Materiais gráficos para promoção de estadias.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-06-d).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');
  added++;
 }})();
 console.log('[crm] seed 2026-11-06-d:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-06-d:',e.message)}
