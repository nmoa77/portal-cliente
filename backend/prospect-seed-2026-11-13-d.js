// DUIT — Portugal continental, 2026-11-13. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Cobalto Douro Metalomecânica",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Tabuaço, Viseu",
    "website": "https://cobaltometalomecanica.com",
    "email": "geral@cobaltometalomecanica.com",
    "phone": "254090473",
    "source": "https://cobaltometalomecanica.com/contactos/",
    "observation": "Empresa de metalomecânica com contacto profissional publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos de apresentação de metalomecânica.",
    "service": "design"
  },
  {
    "company": "RRMP",
    "sector": "Metalomecânica de precisão",
    "email_area": "Indústria & Produção",
    "location": "Tocha, Coimbra",
    "website": "https://rrmp.eu",
    "email": "geral@rrmp.eu",
    "phone": "231443246",
    "source": "https://rrmp.eu/",
    "observation": "Empresa de metalomecânica de precisão com contacto profissional publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos de apresentação de metalomecânica de precisão.",
    "service": "design"
  },
  {
    "company": "Pedro Costa Freire",
    "sector": "Serviços técnicos industriais",
    "email_area": "Indústria & Produção",
    "location": "Amora, Setúbal",
    "website": "https://pedrocostafreire.pt",
    "email": "geral@pedrocostafreire.pt",
    "phone": "212269380",
    "source": "https://industria.pedrocostafreire.pt/contacto/",
    "observation": "Empresa de serviços técnicos industriais com contacto profissional publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos de apresentação de serviços técnicos industriais.",
    "service": "design"
  },
  {
    "company": "Grupo Henriques",
    "sector": "Metalomecânica e ambiente",
    "email_area": "Indústria & Produção",
    "location": "Ourém, Santarém",
    "website": "https://henriquesgroup.com",
    "email": "info@henriquesgroup.com",
    "phone": "249540990",
    "source": "https://henriquesgroup.com/contactos/",
    "observation": "Empresa de metalomecânica e ambiente com contacto profissional publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos de apresentação de metalomecânica e ambiente.",
    "service": "design"
  },
  {
    "company": "Metalomecânica MJS",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Santa Maria de Lamas, Aveiro",
    "website": "https://metalomecanica-mjs.com",
    "email": "geral@metalomecanica-mjs.com",
    "phone": "227445071",
    "source": "https://metalomecanica-mjs.com/contatos/",
    "observation": "Empresa de metalomecânica com contacto profissional publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos de apresentação de metalomecânica.",
    "service": "design"
  },
  {
    "company": "SiderInox",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Setúbal, Setúbal",
    "website": "https://siderinox.pt",
    "email": "geral@siderinox.pt",
    "phone": "265094111",
    "source": "https://siderinox.pt/",
    "observation": "Empresa de metalomecânica com contacto profissional publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos de apresentação de metalomecânica.",
    "service": "design"
  },
  {
    "company": "ChangeSteel",
    "sector": "Metalurgia e metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Lagares, Porto",
    "website": "https://changesteel.pt",
    "email": "comercial@changesteel.pt",
    "phone": "925308048",
    "source": "https://changesteel.pt/",
    "observation": "Empresa de metalurgia e metalomecânica com contacto profissional publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos de apresentação de metalurgia e metalomecânica.",
    "service": "design"
  },
  {
    "company": "Metafer",
    "sector": "Metalomecânica industrial",
    "email_area": "Indústria & Produção",
    "location": "Felgueiras, Porto",
    "website": "https://metafer.eu",
    "email": "geral@metafer.pt",
    "phone": "923577027",
    "source": "https://www.metafer.eu/contacto",
    "observation": "Empresa de metalomecânica industrial com contacto profissional publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos de apresentação de metalomecânica industrial.",
    "service": "design"
  },
  {
    "company": "Carpintaria A. Faria",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Lago, Braga",
    "website": "https://carpintariafaria.pt",
    "email": "geral@carpintariafaria.pt",
    "phone": "253311741",
    "source": "https://www.carpintariafaria.pt/Contato.aspx",
    "observation": "Empresa de carpintaria com contacto profissional publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos de apresentação de carpintaria.",
    "service": "design"
  },
  {
    "company": "Carpinthouse",
    "sector": "Carpintaria e restauros",
    "email_area": "Indústria & Produção",
    "location": "Cascais, Lisboa",
    "website": "https://carpinthouse.com",
    "email": "geral@carpinthouse.com",
    "phone": "930580988",
    "source": "https://carpinthouse.com/",
    "observation": "Empresa de carpintaria e restauros com contacto profissional publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos de apresentação de carpintaria e restauros.",
    "service": "design"
  },
  {
    "company": "Transportela",
    "sector": "Transporte de carga",
    "email_area": "Transportes & Logística",
    "location": "Leiria, Leiria",
    "website": "https://transportela.com",
    "email": "geral@transportela.com",
    "phone": "244616132",
    "source": "https://www.transportela.com/contactos/",
    "observation": "Empresa de transporte de carga com contacto profissional publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos de apresentação de transporte de carga.",
    "service": "design"
  },
  {
    "company": "DIMD",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Braga, Braga",
    "website": "https://dimd.pt",
    "email": "geral@dimd.pt",
    "phone": "253610757",
    "source": "https://www.dimd.pt/",
    "observation": "Empresa de medicina dentária com contacto profissional publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos de apresentação de medicina dentária.",
    "service": "design"
  },
  {
    "company": "Dental Clínica",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://dentalclinica.pt",
    "email": "geral@dentalclinica.pt",
    "phone": "258813074",
    "source": "https://dentalclinica.pt/contactos/",
    "observation": "Empresa de medicina dentária com contacto profissional publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos de apresentação de medicina dentária.",
    "service": "design"
  },
  {
    "company": "Clínica Dentária Braga Parque",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Braga, Braga",
    "website": "https://cdbragaparque.pt",
    "email": "geral@cdbragaparque.pt",
    "phone": "253252860",
    "source": "https://cdbragaparque.pt/aviso-legal",
    "observation": "Empresa de medicina dentária com contacto profissional publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos de apresentação de medicina dentária.",
    "service": "design"
  },
  {
    "company": "Agrobeja",
    "sector": "Apoio à agricultura",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Ferreira do Alentejo, Beja",
    "website": "https://agrobeja.pt",
    "email": "geral@agrobeja.pt",
    "phone": "284739464",
    "source": "https://agrobeja.pt/contacts/",
    "observation": "Empresa de apoio à agricultura com contacto profissional publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos de apresentação de apoio à agricultura.",
    "service": "design"
  },
  {
    "company": "Clinibraga",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Braga, Braga",
    "website": "https://clinibraga.pt",
    "email": "geral@clinibraga.pt",
    "phone": "253220230",
    "source": "https://clinibraga.pt/",
    "observation": "Empresa de medicina dentária com contacto profissional publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos de apresentação de medicina dentária.",
    "service": "design"
  },
  {
    "company": "Vitiagro",
    "sector": "Comércio de maquinaria agrícola",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Beja, Beja",
    "website": "https://vitiagro.pt",
    "email": "geral@vitiagro.pt",
    "phone": "284437220",
    "source": "https://www.vitiagro.pt/",
    "observation": "Empresa de comércio de maquinaria agrícola com contacto profissional publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos de apresentação de comércio de maquinaria agrícola.",
    "service": "design"
  },
  {
    "company": "Clínica Médico-Dentária de Gualtar",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Braga, Braga",
    "website": "https://clinicadentariagualtar.com",
    "email": "geral@clinicadentariagualtar.com",
    "phone": "253694234",
    "source": "https://clinicadentariagualtar.com/contactos/",
    "observation": "Empresa de medicina dentária com contacto profissional publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos de apresentação de medicina dentária.",
    "service": "design"
  },
  {
    "company": "Sanusdente",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Braga, Braga",
    "website": "https://sanusdente.com",
    "email": "geral@sanusdente.com",
    "phone": "253258424",
    "source": "https://www.sanusdente.com/",
    "observation": "Empresa de medicina dentária com contacto profissional publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos de apresentação de medicina dentária.",
    "service": "design"
  },
  {
    "company": "Clínica Dentária Caniço",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Braga, Braga",
    "website": "https://clinicacanico.pt",
    "email": "geral@clinicacanico.pt",
    "phone": "253263470",
    "source": "https://clinicacanico.pt/contactos-clinica-dentaria-braga/",
    "observation": "Empresa de medicina dentária com contacto profissional publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos de apresentação de medicina dentária.",
    "service": "design"
  },
  {
    "company": "Planycorpo",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Viseu, Viseu",
    "website": "https://planycorpo.pt",
    "email": "planycorpo@planycorpo.pt",
    "phone": "232945946",
    "source": "https://planycorpo.pt/contactos/",
    "observation": "Empresa de fisioterapia com contacto profissional publicado no website indicado.",
    "opportunity": "Possível criação de materiais gráficos de apresentação de fisioterapia.",
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
 }})();console.log('[crm] seed 2026-11-13-d:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-13-d:',e.message)}
