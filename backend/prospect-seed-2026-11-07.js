// DUIT — Portugal continental, 2026-11-07. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Carpintaria Mário",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Vale de Cavalos, Santarém",
    "website": "https://carpintariamario.pt/",
    "email": "geral@carpintariamario.pt",
    "phone": "249 780 184",
    "source": "https://carpintariamario.pt/contactos.html",
    "observation": "Carpintaria com instalações em Vale de Cavalos.",
    "opportunity": "Catálogo de serviços de carpintaria.",
    "service": "design"
  },
  {
    "company": "Carpilimia",
    "sector": "Carpintaria e mobiliário",
    "email_area": "Indústria & Produção",
    "location": "Ponte de Lima, Viana do Castelo",
    "website": "https://www.carpilimia.com/",
    "email": "geral@carpilimia.com",
    "phone": "258 735 887",
    "source": "https://www.carpilimia.com/",
    "observation": "Empresa de mobiliário por medida em São Pedro d'Arcos.",
    "opportunity": "Portefólio gráfico de projetos.",
    "service": "design"
  },
  {
    "company": "Casas Econatura",
    "sector": "Turismo rural e glamping",
    "email_area": "Turismo & Alojamento",
    "location": "Mouriscas, Abrantes, Santarém",
    "website": "https://casaseconatura.com/",
    "email": "geral@casaseconatura.com",
    "phone": "927 179 648",
    "source": "https://casaseconatura.com/contact/",
    "observation": "Turismo rural e glamping em Mouriscas.",
    "opportunity": "Materiais visuais de divulgação de estadias.",
    "service": "design"
  },
  {
    "company": "Quinta do Vale Sanguinho",
    "sector": "Agroturismo",
    "email_area": "Turismo & Alojamento",
    "location": "Seia, Guarda",
    "website": "https://www.quintadovalesanguinho.pt/",
    "email": "reservas@quintadovalesanguinho.pt",
    "phone": "964 022 115",
    "source": "https://www.visitportugal.com/pt-pt/content/quinta-do-vale-sanguinho",
    "observation": "Alojamento de agroturismo com nove quartos.",
    "opportunity": "Peças gráficas para alojamento.",
    "service": "design"
  },
  {
    "company": "Clipsa",
    "sector": "Clínica e fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Silves, Faro",
    "website": "https://www.clipsa.pt/",
    "email": "geral@clipsa.pt",
    "phone": "282 443 306",
    "source": "https://www.clipsa.pt/marcar-consulta",
    "observation": "Clínica com unidades em Silves e Portimão.",
    "opportunity": "Materiais informativos de tratamentos.",
    "service": "design"
  },
  {
    "company": "Carpintaria Sucupira",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Sintra, Lisboa",
    "website": "https://www.sucupira.pt/",
    "email": "geral@sucupira.pt",
    "phone": "210 995 075",
    "source": "https://www.sucupira.pt/index.php/contacts/",
    "observation": "Carpintaria com showroom em Sintra.",
    "opportunity": "Catálogo de produtos e serviços.",
    "service": "design"
  },
  {
    "company": "Carpintaria Rocha",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Neiva, Viana do Castelo",
    "website": "https://www.carpintariarocha.com/",
    "email": "geral@carpintariarocha.com",
    "phone": "258 871 715",
    "source": "https://www.carpintariarocha.com/pt/2-contactos/",
    "observation": "Carpintaria na zona industrial de Neiva.",
    "opportunity": "Portefólio gráfico de trabalhos.",
    "service": "design"
  },
  {
    "company": "Woodtouch",
    "sector": "Carpintaria e decoração",
    "email_area": "Indústria & Produção",
    "location": "Lordelo, Paredes, Porto",
    "website": "https://woodtouch.pt/",
    "email": "geral@woodtouch.pt",
    "phone": "963 983 838",
    "source": "https://woodtouch.pt/",
    "observation": "Atividade de marcenaria, carpintaria e estofos.",
    "opportunity": "Apresentação gráfica de soluções por medida.",
    "service": "design"
  },
  {
    "company": "Carplic",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Gavião, Vila Nova de Famalicão, Braga",
    "website": "https://carplic.pt/",
    "email": "geral@carplic.pt",
    "phone": "252 320 010",
    "source": "https://carplic.pt/pt/contactos",
    "observation": "Trabalhos de madeira e derivados por medida.",
    "opportunity": "Catálogo de carpintaria e acabamentos.",
    "service": "design"
  },
  {
    "company": "Herdade dos Adaens",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Campo Maior, Portalegre",
    "website": "https://www.adaens.com/",
    "email": "reservas@adaens.com",
    "phone": "268 249 340",
    "source": "https://www.allaboutportugal.pt/fr/campo-maior/hotels/herdade-dos-adaens",
    "observation": "Herdade com turismo, agropecuária e ecologia.",
    "opportunity": "Materiais gráficos de experiências turísticas.",
    "service": "design"
  },
  {
    "company": "Casas do Cruzeiro",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Sabugueiro, Seia, Guarda",
    "website": "https://www.casasdocruzeiro.pt/",
    "email": "reservas@casasdocruzeiro.pt",
    "phone": "238 315 872",
    "source": "https://www.allaboutportugal.pt/es/seia/hoteles/casas-do-cruzeiro",
    "observation": "Conjunto de casas rurais na Serra da Estrela.",
    "opportunity": "Materiais de divulgação de alojamento.",
    "service": "design"
  },
  {
    "company": "Burro Ville",
    "sector": "Turismo de natureza",
    "email_area": "Turismo & Alojamento",
    "location": "Mexilhoeira Grande, Portimão, Faro",
    "website": "https://www.burroville.com/",
    "email": "reservas@burroville.com",
    "phone": "915 349 970",
    "source": "https://www.allaboutportugal.pt/pt/lagos/hoteis/burro-ville",
    "observation": "Turismo rural com passeios de burro.",
    "opportunity": "Peças de apresentação de experiências.",
    "service": "design"
  },
  {
    "company": "CarpiFoz",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Figueira da Foz, Coimbra",
    "website": "https://www.carpifoz.pt/",
    "email": "geral@carpifoz.pt",
    "phone": "233 430 079",
    "source": "https://www.carpifoz.pt/",
    "observation": "Carpintaria com trabalhos por medida.",
    "opportunity": "Portefólio comercial de carpintaria.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-07).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');
  added++;
 }})();
 console.log('[crm] seed 2026-11-07:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-07:',e.message)}
