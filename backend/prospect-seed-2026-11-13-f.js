// DUIT — Portugal continental, 2026-11-13. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Carpintaria Pentágono",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Pombal, Leiria",
    "website": "https://cpentagono.pt",
    "email": "geral@cpentagono.pt",
    "phone": "236219120",
    "source": "https://www.cpentagono.pt/novo/contactos/",
    "observation": "Atividade de carpintaria e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de carpintaria.",
    "service": "design"
  },
  {
    "company": "Carpintaria Pendão",
    "sector": "Carpintaria e mobiliário",
    "email_area": "Indústria & Produção",
    "location": "São Pedro do Sul, Viseu",
    "website": "https://carpintariapendao.pt",
    "email": "geral@carpintariapendao.pt",
    "phone": "963271509",
    "source": "https://www.carpintariapendao.pt/contactos",
    "observation": "Atividade de carpintaria e mobiliário e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de carpintaria e mobiliário.",
    "service": "design"
  },
  {
    "company": "Consigo Fisioterapia",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Amadora, Lisboa",
    "website": "https://consigofisioterapia.pt",
    "email": "geral@consigofisioterapia.pt",
    "phone": "910640969",
    "source": "https://www.consigofisioterapia.pt/termos-e-condicoes",
    "observation": "Atividade de fisioterapia e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de fisioterapia.",
    "service": "design"
  },
  {
    "company": "Hotel Quinta da Lagoa",
    "sector": "Hotelaria rural",
    "email_area": "Turismo & Alojamento",
    "location": "Mira, Coimbra",
    "website": "https://quintadalagoa.pt",
    "email": "geral@quintadalagoa.pt",
    "phone": "231458688",
    "source": "https://www.quintadalagoa.pt/localizacao-contactos/",
    "observation": "Atividade de hotelaria rural e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de hotelaria rural.",
    "service": "design"
  },
  {
    "company": "B&W Hotel Rural",
    "sector": "Hotelaria rural",
    "email_area": "Turismo & Alojamento",
    "location": "Arganil, Coimbra",
    "website": "https://bwhotelrural.pt",
    "email": "geral@bwhotelrural.pt",
    "phone": "235200000",
    "source": "https://cdn.visitportugal.com/pt-pt/content/bw-hotel-rural",
    "observation": "Atividade de hotelaria rural e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de hotelaria rural.",
    "service": "design"
  },
  {
    "company": "Hotel Rural Vale do Rio",
    "sector": "Hotelaria rural",
    "email_area": "Turismo & Alojamento",
    "location": "Oliveira de Azeméis, Aveiro",
    "website": "https://valedorio.com",
    "email": "geral@valedorio.com",
    "phone": "256990000",
    "source": "https://www.visitportugal.com/pt-pt/content/hotel-rural-vale-do-rio",
    "observation": "Atividade de hotelaria rural e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de hotelaria rural.",
    "service": "design"
  },
  {
    "company": "Cró Hotel Rural",
    "sector": "Hotelaria rural",
    "email_area": "Turismo & Alojamento",
    "location": "Sabugal, Guarda",
    "website": "https://hoteldocro.com",
    "email": "geral@hoteldocro.com",
    "phone": "271141070",
    "source": "https://www.crotermas-hotel.guestcentric.net/hotel-contacts.html",
    "observation": "Atividade de hotelaria rural e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de hotelaria rural.",
    "service": "design"
  },
  {
    "company": "Physius",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Almada, Setúbal",
    "website": "https://physius.pt",
    "email": "geral@physius.pt",
    "phone": "210504274",
    "source": "https://www.physius.pt/",
    "observation": "Atividade de fisioterapia e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de fisioterapia.",
    "service": "design"
  },
  {
    "company": "Longroiva Hotel Rural",
    "sector": "Hotelaria rural",
    "email_area": "Turismo & Alojamento",
    "location": "Mêda, Guarda",
    "website": "https://hoteldelongroiva.com",
    "email": "geral@hoteldelongroiva.com",
    "phone": "279149020",
    "source": "https://www.hoteldelongroiva.com/hotel-contacts.html",
    "observation": "Atividade de hotelaria rural e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de hotelaria rural.",
    "service": "design"
  },
  {
    "company": "Herdade do Lago Real",
    "sector": "Hotelaria rural",
    "email_area": "Turismo & Alojamento",
    "location": "Mira, Coimbra",
    "website": "https://lagoreal.pt",
    "email": "geral@lagoreal.pt",
    "phone": "231488269",
    "source": "https://www.lagoreal.pt/es/contactos/",
    "observation": "Atividade de hotelaria rural e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de hotelaria rural.",
    "service": "design"
  },
  {
    "company": "Clínica Dentária Dr. Fernandes",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Viseu, Viseu",
    "website": "https://clinicadrfernandes.com",
    "email": "geral@clinicadrfernandes.com",
    "phone": "232421530",
    "source": "https://www.clinicadrfernandes.com/inicio/contactos/",
    "observation": "Atividade de medicina dentária e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de medicina dentária.",
    "service": "design"
  },
  {
    "company": "Clínica Dentária Dr. Alexandre Libório",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Viseu, Viseu",
    "website": "https://alexandreliborio.pt",
    "email": "geral@alexandreliborio.pt",
    "phone": "232435141",
    "source": "https://www.alexandreliborio.pt/contactos",
    "observation": "Atividade de medicina dentária e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de medicina dentária.",
    "service": "design"
  },
  {
    "company": "MPC Ferro",
    "sector": "Comércio de produtos siderúrgicos",
    "email_area": "Indústria & Produção",
    "location": "Leiria, Leiria",
    "website": "https://mpcferro.pt",
    "email": "geral@mpcferro.pt",
    "phone": "244860220",
    "source": "https://mpcferro.pt/contactos.php",
    "observation": "Atividade de comércio de produtos siderúrgicos e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de comércio de produtos siderúrgicos.",
    "service": "design"
  },
  {
    "company": "CEAP Centro de Estudos",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Braga, Braga",
    "website": "https://centroestudosceap.pt",
    "email": "geral@centroestudosceap.pt",
    "phone": "253051976",
    "source": "https://centroestudosceap.pt/",
    "observation": "Atividade de centro de estudos e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de centro de estudos.",
    "service": "design"
  },
  {
    "company": "Clínica Dentária Isabel Mimoso",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Tondela, Viseu",
    "website": "https://clinicaisabelmimoso.pt",
    "email": "geral@clinicaisabelmimoso.pt",
    "phone": "232812923",
    "source": "https://clinicaisabelmimoso.pt/",
    "observation": "Atividade de medicina dentária e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de medicina dentária.",
    "service": "design"
  },
  {
    "company": "Facies Identidade",
    "sector": "Clínica médica e dentária",
    "email_area": "Saúde",
    "location": "Viseu, Viseu",
    "website": "https://faciesidentidade.pt",
    "email": "geral@faciesidentidade.pt",
    "phone": "232461926",
    "source": "https://www.faciesidentidade.pt/",
    "observation": "Atividade de clínica médica e dentária e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de clínica médica e dentária.",
    "service": "design"
  },
  {
    "company": "Casa do Largo",
    "sector": "Turismo de habitação",
    "email_area": "Turismo & Alojamento",
    "location": "Crato, Portalegre",
    "website": "https://casadolargo.com",
    "email": "casadolargo@casadolargo.com",
    "phone": "245997001",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=35&f%5B0%5D=bm_field_ma_acesso_internet_no_q%3Atrue&f%5B1%5D=bm_field_ma_parque_de_estacionam%3Atrue&f%5B2%5D=bm_field_ma_acesso_internet_%3Atrue&page=7&visitas=1",
    "observation": "Atividade de turismo de habitação e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de turismo de habitação.",
    "service": "design"
  },
  {
    "company": "Vitória Stone Hotel",
    "sector": "Hotelaria",
    "email_area": "Turismo & Alojamento",
    "location": "Évora, Évora",
    "website": "https://vitoriastonehotel.com",
    "email": "info@vitoriastonehotel.com",
    "phone": "266707174",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=35&f%5B0%5D=bm_field_ma_acesso_internet_no_q%3Atrue&f%5B1%5D=bm_field_ma_parque_de_estacionam%3Atrue&f%5B2%5D=bm_field_ma_acesso_internet_%3Atrue&page=7&visitas=1",
    "observation": "Atividade de hotelaria e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de hotelaria.",
    "service": "design"
  },
  {
    "company": "Birdwatching Alentejo",
    "sector": "Turismo de natureza",
    "email_area": "Aventura",
    "location": "Santiago do Cacém, Setúbal",
    "website": "https://birdwatchingalentejo.com",
    "email": "bert@birdwatchingalentejo.com",
    "phone": "269825383",
    "source": "https://www.visitportugal.com/pt-pt/search/site/alentejo",
    "observation": "Atividade de turismo de natureza e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de turismo de natureza.",
    "service": "design"
  },
  {
    "company": "Monte das Oliveiras",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Montemor-o-Novo, Évora",
    "website": "https://monte-das-oliveiras.com",
    "email": "info@monte-das-oliveiras.com",
    "phone": "266499507",
    "source": "https://www.visitportugal.com/pt-pt/search/site?context=490&localidades=%28tid%3A42%29&regioes=%28tid%3A35%29&visitas=1",
    "observation": "Atividade de turismo rural e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Quinta da Tapada de S. Pedro",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Évora, Évora",
    "website": "https://tapadadesaopedro.com",
    "email": "info@tapadadesaopedro.com",
    "phone": "914303688",
    "source": "https://www.visitportugal.com/pt-pt/search/site?context=490&localidades=%28tid%3A42%29&regioes=%28tid%3A35%29&visitas=1",
    "observation": "Atividade de turismo rural e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Gabinete Psicologia Aliados",
    "sector": "Psicologia",
    "email_area": "Saúde Mental",
    "location": "Porto, Porto",
    "website": "https://psicologiaaliados.pt",
    "email": "geral@psicologiaaliados.pt",
    "phone": "222084532",
    "source": "https://psicologiaaliados.pt/contactos/",
    "observation": "Atividade de psicologia e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de psicologia.",
    "service": "design"
  },
  {
    "company": "Clínica BemEstar",
    "sector": "Psicologia",
    "email_area": "Saúde Mental",
    "location": "Porto, Porto",
    "website": "https://clinica-bemestar.pt",
    "email": "geral@clinica-bemestar.pt",
    "phone": "222084458",
    "source": "https://www.clinica-bemestar.pt/contato",
    "observation": "Atividade de psicologia e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de psicologia.",
    "service": "design"
  },
  {
    "company": "Márcia Gonçalves Psicologia",
    "sector": "Psicologia",
    "email_area": "Saúde Mental",
    "location": "Porto, Porto",
    "website": "https://marciagoncalvespsi.com",
    "email": "geral@marciagoncalvespsi.com",
    "phone": "969190380",
    "source": "https://marciagoncalvespsi.com/contactos/",
    "observation": "Atividade de psicologia e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de psicologia.",
    "service": "design"
  },
  {
    "company": "Dolphin Perspective Transport",
    "sector": "Transportes e logística",
    "email_area": "Transportes & Logística",
    "location": "Viseu, Viseu",
    "website": "https://dolphinperspective.com",
    "email": "geral@dolphinperspective.com",
    "phone": "934441222",
    "source": "https://www.dolphinperspective.com/",
    "observation": "Atividade de transportes e logística e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de transportes e logística.",
    "service": "design"
  },
  {
    "company": "Mudança Psicologia e Psicoterapia",
    "sector": "Psicologia",
    "email_area": "Saúde Mental",
    "location": "Porto, Porto",
    "website": "https://mudancapsi.pt",
    "email": "geral@mudancapsi.pt",
    "phone": "963302772",
    "source": "https://mudancapsi.pt/contactos/",
    "observation": "Atividade de psicologia e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de psicologia.",
    "service": "design"
  },
  {
    "company": "Surpresa Total Transportes",
    "sector": "Transportes de madeira",
    "email_area": "Transportes & Logística",
    "location": "Sátão, Viseu",
    "website": "https://surpresatotal.pt",
    "email": "geral@surpresatotal.pt",
    "phone": "962428885",
    "source": "https://www.surpresatotal.pt/",
    "observation": "Atividade de transportes de madeira e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de transportes de madeira.",
    "service": "design"
  },
  {
    "company": "Neca Mudanças",
    "sector": "Transportes e mudanças",
    "email_area": "Transportes & Logística",
    "location": "Viseu, Viseu",
    "website": "https://necamudancas.pt",
    "email": "geral@necamudancas.pt",
    "phone": "232422819",
    "source": "https://www.necamudancas.pt/contactos.php",
    "observation": "Atividade de transportes e mudanças e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de transportes e mudanças.",
    "service": "design"
  },
  {
    "company": "Clínica S.I.",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Porto, Porto",
    "website": "https://clinicasi.pt",
    "email": "geral@clinicasi.pt",
    "phone": "223393350",
    "source": "https://clinicasi.pt/contactos/",
    "observation": "Atividade de medicina dentária e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de medicina dentária.",
    "service": "design"
  },
  {
    "company": "NeuroImprove Clinic",
    "sector": "Neurofeedback e psicologia",
    "email_area": "Saúde Mental",
    "location": "Porto, Porto",
    "website": "https://neuroimprove.pt",
    "email": "geral@neuroimprove.pt",
    "phone": "220280029",
    "source": "https://www.neuroimprove.pt/contactos",
    "observation": "Atividade de neurofeedback e psicologia e email publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação dos serviços de neurofeedback e psicologia.",
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
