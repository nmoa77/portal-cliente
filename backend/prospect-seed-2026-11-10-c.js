// DUIT — Portugal continental, 2026-11-10-c. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Restart Clinic",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Loures, Lisboa",
    "website": "https://restartclinic.pt/",
    "email": "geral@restartclinic.pt",
    "phone": "935480340",
    "source": "https://restartclinic.pt/",
    "observation": "Clínica com fisioterapia e osteopatia",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Carpintaria Portugal",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Sacavém, Lisboa",
    "website": "https://carpintariaportugal.com/",
    "email": "geral@carpintariaportugal.com",
    "phone": "912256343",
    "source": "https://carpintariaportugal.com/",
    "observation": "Mobiliário por medida",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "SPWOOD",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Barcelos, Braga",
    "website": "https://spwood.pt/",
    "email": "geral@spwood.pt",
    "phone": "253953160",
    "source": "https://spwood.pt/contactos/",
    "observation": "Mobiliário e carpintaria",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Metalome",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Chaves, Vila Real",
    "website": "https://metalome.com/",
    "email": "geral@metalome.com",
    "phone": "",
    "source": "https://metalome.com/contactos/",
    "observation": "Fabricação de componentes metalúrgicos",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Actimeca",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Setúbal, Setúbal",
    "website": "https://actimeca.pt/",
    "email": "producao@actimeca.pt",
    "phone": "265247531",
    "source": "https://actimeca.pt/contatos/",
    "observation": "Produção e instalação metalomecânica",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "AMCA Carpintaria",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Grijó, Vila Nova de Gaia, Porto",
    "website": "https://amcacarpintaria.pt/",
    "email": "geral@amcacarpintaria.pt",
    "phone": "227647628",
    "source": "https://amcacarpintaria.pt/contactos/",
    "observation": "Carpintaria interior e exterior",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Lino & Filhos",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Lisboa, Lisboa",
    "website": "https://linoefilhos.pt/",
    "email": "geral@linoefilhos.pt",
    "phone": "218480204",
    "source": "https://linoefilhos.pt/",
    "observation": "Carpintaria e remodelação",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Guribema",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Guimarães, Braga",
    "website": "https://guribema.com/",
    "email": "geral@guribema.com",
    "phone": "253574026",
    "source": "https://guribema.com/contactos/",
    "observation": "Carpintaria em madeira",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "HMWOOD",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Coimbra, Coimbra",
    "website": "https://hmwood.pt/",
    "email": "geral@hmwood.pt",
    "phone": "936777006",
    "source": "https://www.hmwood.pt/contato/",
    "observation": "Cozinhas, roupeiros e lacagem",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "MPS Metal",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Sever do Vouga, Aveiro",
    "website": "https://mpsmetal.pt/",
    "email": "geral@mpsmetal.pt",
    "phone": "234552758",
    "source": "https://www.mpsmetal.pt/pt_pt/contacts",
    "observation": "Metalomecânica e alumínio",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Dental Design Institute",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Benedita, Leiria",
    "website": "https://dentaldesigninstitute.pt/",
    "email": "geral@dentaldesigninstitute.pt",
    "phone": "262247290",
    "source": "https://www.dentaldesigninstitute.pt/contactos/",
    "observation": "Clínica dentária",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Transdaire",
    "sector": "Transportes de mercadorias",
    "email_area": "Transportes & Logística",
    "location": "Castro Daire, Viseu",
    "website": "https://transdaire.pt/",
    "email": "geral@transdaire.pt",
    "phone": "232382102",
    "source": "https://transdaire.pt/contactos/",
    "observation": "Transportes nacionais e internacionais",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Cantinho do Estudo",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Póvoa de Santa Iria, Lisboa",
    "website": "https://cantinhodoestudo.com/",
    "email": "geral@cantinhodoestudo.com",
    "phone": "962997788",
    "source": "https://cantinhodoestudo.com/contactos/",
    "observation": "Centro de estudos",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Clínica Dentária Morgado",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Leiria, Leiria",
    "website": "https://clinicadentariamorgado.pt/",
    "email": "geral@clinicadentariamorgado.pt",
    "phone": "244824356",
    "source": "https://clinicadentariamorgado.pt/contactos",
    "observation": "Clínica dentária em Leiria e Batalha",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Transportes Rápido",
    "sector": "Transportes de mercadorias",
    "email_area": "Transportes & Logística",
    "location": "Vila Nova de Poiares, Coimbra",
    "website": "https://transportesrapido.com/",
    "email": "geral@transportesrapido.com",
    "phone": "239429050",
    "source": "https://www.transportesrapido.com/contactos/",
    "observation": "Transportes nacionais e internacionais",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Clínica Dentária das Laranjeiras",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Lisboa, Lisboa",
    "website": "https://cddl.pt/",
    "email": "geral@cddl.pt",
    "phone": "218224022",
    "source": "https://cddl.pt/contactos/",
    "observation": "Clínica dentária",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Transportes Coelho Mariano",
    "sector": "Transportes de mercadorias",
    "email_area": "Transportes & Logística",
    "location": "Fátima, Santarém",
    "website": "https://coelhomariano.com/",
    "email": "geral@coelhomariano.com",
    "phone": "249539020",
    "source": "https://www.coelhomariano.com/frota/",
    "observation": "Transportes nacionais e internacionais",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Dental Clínica",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://dentalclinica.pt/",
    "email": "geral@dentalclinica.pt",
    "phone": "258813074",
    "source": "https://dentalclinica.pt/contactos/",
    "observation": "Clínica dentária com unidades em Viana e Braga",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "JJ Dental Clinic",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Lisboa, Lisboa",
    "website": "https://jjdentalclinic.pt/",
    "email": "geral@jjdentalclinic.pt",
    "phone": "215906669",
    "source": "https://jjdentalclinic.pt/contactos/",
    "observation": "Clínica dentária nas Laranjeiras",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Transportes Miguel e Moreira",
    "sector": "Transportes de mercadorias",
    "email_area": "Transportes & Logística",
    "location": "Castro Daire, Viseu",
    "website": "https://transportesmiguelemoreira.com/",
    "email": "geral@transportesmiguelemoreira.com",
    "phone": "919997442",
    "source": "https://transportesmiguelemoreira.com/contactos/",
    "observation": "Transportes e logística",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "TLI Transportes e Logística Internacionais",
    "sector": "Transportes e logística",
    "email_area": "Transportes & Logística",
    "location": "Mangualde, Viseu",
    "website": "https://tli.com.pt/",
    "email": "geral@tli.com.pt",
    "phone": "232622973",
    "source": "https://www.tli.com.pt/contactos/",
    "observation": "Transportes internacionais",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Transportes Eduardo Cardoso",
    "sector": "Transportes de mercadorias",
    "email_area": "Transportes & Logística",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://transporteseduardocardoso.pt/",
    "email": "geral@transporteseduardocardoso.pt",
    "phone": "272327672",
    "source": "https://www.transporteseduardocardoso.pt/esp/contactos.php",
    "observation": "Transportes rodoviários",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "GetSmile",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Lisboa, Lisboa",
    "website": "https://getsmile.pt/",
    "email": "geral@getsmile.pt",
    "phone": "935258999",
    "source": "https://getsmile.pt/contactos/",
    "observation": "Clínicas dentárias em Lisboa e Almada",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Dentya",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Vila do Conde, Porto",
    "website": "https://dentya.pt/",
    "email": "viladoconde@dentya.pt",
    "phone": "252644371",
    "source": "https://dentya.pt/contactos/",
    "observation": "Clínica dentária com três unidades",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "George Gomes Dental Center",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Oeiras, Lisboa",
    "website": "https://ggdc.pt/",
    "email": "geral@ggdc.pt",
    "phone": "211376141",
    "source": "https://www.ggdc.pt/contactos/",
    "observation": "Clínica dentária",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "AJRC Transportes",
    "sector": "Transportes",
    "email_area": "Transportes & Logística",
    "location": "Maia, Porto",
    "website": "https://ajrctransportes.com/",
    "email": "geral@ajrctransportes.com",
    "phone": "229421449",
    "source": "https://ajrctransportes.com/",
    "observation": "Transporte de automóveis",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Transportela",
    "sector": "Transportes",
    "email_area": "Transportes & Logística",
    "location": "Leiria, Leiria",
    "website": "https://transportela.com/",
    "email": "geral@transportela.com",
    "phone": "244616132",
    "source": "https://www.transportela.com/contactos/",
    "observation": "Transportes de carga",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Clínica Bessa",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Porto, Porto",
    "website": "https://clinicabessa.pt/",
    "email": "geral@clinicabessa.pt",
    "phone": "223321239",
    "source": "https://www.clinicabessa.pt/contactos/",
    "observation": "Clínica dentária",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
    "service": "design"
  },
  {
    "company": "Transaliados",
    "sector": "Transportes e logística",
    "email_area": "Transportes & Logística",
    "location": "Cascais, Lisboa",
    "website": "https://transaliados.pt/",
    "email": "geral@transaliados.pt",
    "phone": "",
    "source": "https://transaliados.pt/contact/",
    "observation": "Transportes marítimos, aéreos e rodoviários",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-10-c).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-10-c:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-10-c:',e.message)}
