// DUIT — 2026-11-22. Contactos públicos em fontes oficiais e diretórios empresariais.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Carpintaria Mário",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Vale de Cavalos, Santarém",
    "website": "https://carpintariamario.pt",
    "email": "geral@carpintariamario.pt",
    "phone": "249780184",
    "source": "https://carpintariamario.pt/contactos.html",
    "observation": "A fonte indicada apresenta a atividade de carpintaria e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de carpintaria.",
    "service": "design"
  },
  {
    "company": "Fisiomobilidade",
    "sector": "Fisioterapia e osteopatia",
    "email_area": "Fisioterapia",
    "location": "Caranguejeira, Leiria",
    "website": "https://fisiomobilidade.pt",
    "email": "geral@fisiomobilidade.pt",
    "phone": "912340202",
    "source": "https://fisiomobilidade.pt/contactos-fisiomobilidade-leiria/",
    "observation": "A fonte indicada apresenta a atividade de fisioterapia e osteopatia e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de fisioterapia e osteopatia.",
    "service": "design"
  },
  {
    "company": "Leirivida",
    "sector": "Clínica de fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Leiria, Leiria",
    "website": "https://leirivida.pt",
    "email": "geral@leirivida.pt",
    "phone": "244827000",
    "source": "https://leirivida.pai.pt/fisioterapia",
    "observation": "A fonte indicada apresenta a atividade de clínica de fisioterapia e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de clínica de fisioterapia.",
    "service": "design"
  },
  {
    "company": "HSS Carpintaria",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Pelariga, Leiria",
    "website": "https://hsscarpintaria.pt",
    "email": "geral@hsscarpintaria.pt",
    "phone": "236214394",
    "source": "https://www.hsscarpintaria.pt/contactos/",
    "observation": "A fonte indicada apresenta a atividade de carpintaria e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de carpintaria.",
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
    "source": "https://www.montechalaca.pt/en/contacts",
    "observation": "A fonte indicada apresenta a atividade de turismo rural e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Cinética Saúde",
    "sector": "Fisioterapia e Pilates",
    "email_area": "Fisioterapia",
    "location": "Ortigosa, Leiria",
    "website": "https://cineticasaude.pt",
    "email": "geral@cineticasaude.pt",
    "phone": "912260252",
    "source": "https://cineticasaude.pt/contactos",
    "observation": "A fonte indicada apresenta a atividade de fisioterapia e pilates e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de fisioterapia e pilates.",
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
    "observation": "A fonte indicada apresenta a atividade de turismo rural e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Carpintaria Pentágono",
    "sector": "Carpintaria e mobiliário",
    "email_area": "Indústria & Produção",
    "location": "Pombal, Leiria",
    "website": "https://cpentagono.pt",
    "email": "geral@cpentagono.pt",
    "phone": "236219120",
    "source": "https://www.cpentagono.pt/novo/contactos/",
    "observation": "A fonte indicada apresenta a atividade de carpintaria e mobiliário e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de carpintaria e mobiliário.",
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
    "observation": "A fonte indicada apresenta a atividade de carpintaria e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de carpintaria.",
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
    "source": "https://www.drafil.pt/contactos/",
    "observation": "A fonte indicada apresenta a atividade de carpintaria e mobiliário e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de carpintaria e mobiliário.",
    "service": "design"
  },
  {
    "company": "Carplic",
    "sector": "Carpintaria e mobiliário",
    "email_area": "Indústria & Produção",
    "location": "Vila Nova de Famalicão, Braga",
    "website": "https://carplic.pt",
    "email": "geral@carplic.pt",
    "phone": "252320010",
    "source": "https://carplic.pt/pt",
    "observation": "A fonte indicada apresenta a atividade de carpintaria e mobiliário e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de carpintaria e mobiliário.",
    "service": "design"
  },
  {
    "company": "Fisiohand",
    "sector": "Medicina física e reabilitação",
    "email_area": "Fisioterapia",
    "location": "Leiria, Leiria",
    "website": "https://fisiohand.com",
    "email": "geral@fisiohand.com",
    "phone": "244745272",
    "source": "https://www.ordemdosengenheiros.pt/fotos/gca/blocks_items/todos_os_protocolos56_272270063668e9658adc2a.pdf",
    "observation": "A fonte indicada apresenta a atividade de medicina física e reabilitação e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de medicina física e reabilitação.",
    "service": "design"
  },
  {
    "company": "Generation Fit Center",
    "sector": "Ginásio",
    "email_area": "Desporto & Fitness",
    "location": "Mangualde, Viseu",
    "website": "https://generationfitcenter.pt",
    "email": "geral@generationfitcenter.pt",
    "phone": "966172996",
    "source": "https://www.ordemdosengenheiros.pt/fotos/gca/blocks_items/todos_os_protocolos56_272270063668e9658adc2a.pdf",
    "observation": "A fonte indicada apresenta a atividade de ginásio e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de ginásio.",
    "service": "design"
  },
  {
    "company": "Coroferma",
    "sector": "Comércio de ferramentas",
    "email_area": "Comércio & Retalho",
    "location": "Frossos, Braga",
    "website": "https://coroferma.pt",
    "email": "geral@coroferma.pt",
    "phone": "253319533",
    "source": "https://coroferma.pt/metalomecanica/",
    "observation": "A fonte indicada apresenta a atividade de comércio de ferramentas e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de comércio de ferramentas.",
    "service": "design"
  },
  {
    "company": "AR Alumínios",
    "sector": "Serralharia e caixilharia",
    "email_area": "Indústria & Produção",
    "location": "Viseu, Viseu",
    "website": "https://araluminios.com",
    "email": "geral@araluminios.com",
    "phone": "232911438",
    "source": "https://www.araluminios.com/contactos",
    "observation": "A fonte indicada apresenta a atividade de serralharia e caixilharia e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de serralharia e caixilharia.",
    "service": "design"
  },
  {
    "company": "Centro de Estudos da Boavista",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Porto, Porto",
    "website": "https://centboavista.webnode.pt",
    "email": "geral@estudosboavista.com",
    "phone": "226094393",
    "source": "https://centboavista.webnode.pt/contactos/",
    "observation": "A fonte indicada apresenta a atividade de centro de estudos e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de centro de estudos.",
    "service": "design"
  },
  {
    "company": "Casal de Tralhariz",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Carrazeda de Ansiães, Bragança",
    "website": "https://casaldetralhariz.com",
    "email": "geral@casaldetralhariz.com",
    "phone": "932909622",
    "source": "https://casaldetralhariz.com/contactos/",
    "observation": "A fonte indicada apresenta a atividade de turismo rural e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Auto Nogueira",
    "sector": "Oficina automóvel",
    "email_area": "Automóvel",
    "location": "Braga, Braga",
    "website": "https://autonogueira.pt",
    "email": "geral@autonogueira.pt",
    "phone": "253674078",
    "source": "https://www.autonogueira.pt/contactos/",
    "observation": "A fonte indicada apresenta a atividade de oficina automóvel e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de oficina automóvel.",
    "service": "design"
  },
  {
    "company": "Oficina da Fisio",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Braga, Braga",
    "website": "https://oficinadafisio.pt",
    "email": "geral@oficinadafisio.pt",
    "phone": "",
    "source": "https://oficinadafisio.pt/contactos/",
    "observation": "A fonte indicada apresenta a atividade de fisioterapia e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de fisioterapia.",
    "service": "design"
  },
  {
    "company": "Centro de Estudos Maria Miguel",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Porto, Porto",
    "website": "https://mariamiguelestudos.com",
    "email": "geral@mariamiguelestudos.com",
    "phone": "918227847",
    "source": "https://mariamiguelestudos.com/contactos/",
    "observation": "A fonte indicada apresenta a atividade de centro de estudos e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de centro de estudos.",
    "service": "design"
  },
  {
    "company": "A. Montesinho",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Gimonde, Bragança",
    "website": "https://amontesinho.pt",
    "email": "geral@amontesinho.pt",
    "phone": "273302510",
    "source": "https://www.cardapio.pt/turismo-rural/dir/d/braganca/c/braganca/p-19762/a-montesinho/",
    "observation": "A fonte indicada apresenta a atividade de turismo rural e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Quinta da Avózinha",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Samil, Bragança",
    "website": "https://quintadavozinha.pt",
    "email": "geral@quintadavozinha.pt",
    "phone": "273331101",
    "source": "https://lifecooler.com/artigo/atividades/quinta-da-avzinha/381809",
    "observation": "A fonte indicada apresenta a atividade de turismo rural e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Orfeão de Leiria",
    "sector": "Ensino de música e dança",
    "email_area": "Educação & Formação",
    "location": "Leiria, Leiria",
    "website": "https://orfeaodeleiria.com",
    "email": "geral@orfeaodeleiria.com",
    "phone": "244829550",
    "source": "https://www.orfeaodeleiria.com/",
    "observation": "A fonte indicada apresenta a atividade de ensino de música e dança e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de ensino de música e dança.",
    "service": "design"
  },
  {
    "company": "RacingMania",
    "sector": "Oficina automóvel",
    "email_area": "Automóvel",
    "location": "Figueira de Lorvão, Coimbra",
    "website": "https://racingmania.pt",
    "email": "geral@racingmania.pt",
    "phone": "239098930",
    "source": "https://racingmania.pt/contactos/",
    "observation": "A fonte indicada apresenta a atividade de oficina automóvel e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de oficina automóvel.",
    "service": "design"
  },
  {
    "company": "Encostas do Côa",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Pinhel, Guarda",
    "website": "https://encostasdocoa.pt",
    "email": "geral@encostasdocoa.pt",
    "phone": "271411132",
    "source": "https://valedocoa.pt/alojamento/",
    "observation": "A fonte indicada apresenta a atividade de turismo rural e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Quinta das Pias",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Pinhel, Guarda",
    "website": "https://quintadaspias.com",
    "email": "reservas@quintadaspias.com",
    "phone": "919792315",
    "source": "https://valedocoa.pt/alojamento/",
    "observation": "A fonte indicada apresenta a atividade de turismo rural e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Casas do Juízo",
    "sector": "Turismo de aldeia",
    "email_area": "Turismo & Alojamento",
    "location": "Juízo, Guarda",
    "website": "https://casasdojuizo.com",
    "email": "reservas@casasdojuizo.com",
    "phone": "927585758",
    "source": "https://valedocoa.pt/alojamento/",
    "observation": "A fonte indicada apresenta a atividade de turismo de aldeia e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de turismo de aldeia.",
    "service": "design"
  },
  {
    "company": "Cidadelhe Rupestre",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Cidadelhe, Guarda",
    "website": "https://cidadelherupestre.com",
    "email": "info@cidadelherupestre.com",
    "phone": "961083914",
    "source": "https://valedocoa.pt/alojamento/",
    "observation": "A fonte indicada apresenta a atividade de turismo rural e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Casa do Fundo",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Tourais, Guarda",
    "website": "https://casadofundo.com",
    "email": "geral@casadofundo.com",
    "phone": "238902118",
    "source": "https://lifecooler.com/artigo/comer/casa-do-fundo/379278",
    "observation": "A fonte indicada apresenta a atividade de turismo rural e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Chave Vertical",
    "sector": "Comércio de equipamento de oficina",
    "email_area": "Comércio & Retalho",
    "location": "Cacia, Aveiro",
    "website": "https://chavevertical.pt",
    "email": "geral@chavevertical.pt",
    "phone": "234020500",
    "source": "https://backup.chavevertical.com/categoria-produto/equip-p-oficina-automovel/",
    "observation": "A fonte indicada apresenta a atividade de comércio de equipamento de oficina e o contacto profissional público.",
    "opportunity": "Possível desenvolvimento de materiais gráficos para apresentar serviços de comércio de equipamento de oficina.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-22).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-22:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-22:',e.message)}
