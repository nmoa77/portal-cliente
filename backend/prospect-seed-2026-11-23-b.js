// DUIT — 2026-11-23, lote adicional. Contactos profissionais públicos em fontes empresariais e institucionais.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Intrafisio",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Coimbra, Coimbra",
    "website": "https://intrafisio.pt",
    "email": "geral@intrafisio.pt",
    "phone": "239821659",
    "source": "https://www.intrafisio.pt/contactos",
    "observation": "A fonte pública identifica a atividade de fisioterapia e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de fisioterapia.",
    "service": "design"
  },
  {
    "company": "MPC Ferro",
    "sector": "Comércio de produtos siderúrgicos",
    "email_area": "Comércio & Retalho",
    "location": "Ponte da Pedra, Leiria",
    "website": "https://mpcferro.pt",
    "email": "geral@mpcferro.pt",
    "phone": "244860220",
    "source": "https://mpcferro.pt/contactos.php",
    "observation": "A fonte pública identifica a atividade de comércio de produtos siderúrgicos e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de comércio de produtos siderúrgicos.",
    "service": "design"
  },
  {
    "company": "Clínica Joaquim Coutinho",
    "sector": "Clínica de fisioterapia e bem-estar",
    "email_area": "Fisioterapia",
    "location": "Coimbra, Coimbra",
    "website": "https://clinicajoaquimcoutinho.pt",
    "email": "geral@clinicajoaquimcoutinho.pt",
    "phone": "239093072",
    "source": "https://clinicajoaquimcoutinho.pt/fisioterapia/",
    "observation": "A fonte pública identifica a atividade de clínica de fisioterapia e bem-estar e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de clínica de fisioterapia e bem-estar.",
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
    "observation": "A fonte pública identifica a atividade de carpintaria e mobiliário e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de carpintaria e mobiliário.",
    "service": "design"
  },
  {
    "company": "Centro de Reabilitação de Coimbra",
    "sector": "Fisioterapia e reabilitação",
    "email_area": "Fisioterapia",
    "location": "Coimbra, Coimbra",
    "website": "https://crcoimbra.pt",
    "email": "geral@crcoimbra.pt",
    "phone": "239483063",
    "source": "https://www.crcoimbra.pt/",
    "observation": "A fonte pública identifica a atividade de fisioterapia e reabilitação e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de fisioterapia e reabilitação.",
    "service": "design"
  },
  {
    "company": "Nomogno",
    "sector": "Carpintaria e mobiliário",
    "email_area": "Indústria & Produção",
    "location": "Viseu, Viseu",
    "website": "https://nomogno.pt",
    "email": "geral@nomogno.pt",
    "phone": "232412225",
    "source": "https://nomogno.pt/contactos/",
    "observation": "A fonte pública identifica a atividade de carpintaria e mobiliário e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de carpintaria e mobiliário.",
    "service": "design"
  },
  {
    "company": "Actifisio",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Coimbra, Coimbra",
    "website": "https://actifisio.pt",
    "email": "geral@actifisio.pt",
    "phone": "919090510",
    "source": "https://www.actifisio.pt/",
    "observation": "A fonte pública identifica a atividade de fisioterapia e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de fisioterapia.",
    "service": "design"
  },
  {
    "company": "Herdade da Barbosa",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Reguengos de Monsaraz, Évora",
    "website": "https://herdadedabarbosa.pt",
    "email": "geral@herdadedabarbosa.pt",
    "phone": "910449134",
    "source": "https://herdadedabarbosa.pt/",
    "observation": "A fonte pública identifica a atividade de turismo rural e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Dance Point",
    "sector": "Escola de dança",
    "email_area": "Estúdios de Dança",
    "location": "Leça do Balio, Porto",
    "website": "https://dancepoint.pt",
    "email": "geral@dancepoint.pt",
    "phone": "927689812",
    "source": "https://www.dancepoint.pt/contactos",
    "observation": "A fonte pública identifica a atividade de escola de dança e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de escola de dança.",
    "service": "design"
  },
  {
    "company": "Dental Clínica Moderno",
    "sector": "Clínica dentária",
    "email_area": "Dentistas",
    "location": "Bragança, Bragança",
    "website": "https://dentalclinica.net",
    "email": "geral@dentalclinica.net",
    "phone": "273331546",
    "source": "https://fadadodente.pt/clinica/dental-clinica-moderno-lda-braganca",
    "observation": "A fonte pública identifica a atividade de clínica dentária e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de clínica dentária.",
    "service": "design"
  },
  {
    "company": "Clínica Vaz Saúde",
    "sector": "Clínica dentária",
    "email_area": "Dentistas",
    "location": "Bragança, Bragança",
    "website": "https://vazsaude.pt",
    "email": "geral@vazsaude.pt",
    "phone": "273404493",
    "source": "https://www.fadadodente.pt.elios.pt/clinica/clinica-medico-dentaria-vaz-saude-braganca",
    "observation": "A fonte pública identifica a atividade de clínica dentária e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de clínica dentária.",
    "service": "design"
  },
  {
    "company": "Clínica São Judas Tadeu",
    "sector": "Clínica médica e dentária",
    "email_area": "Dentistas",
    "location": "Bragança, Bragança",
    "website": "https://clinicasaojudastadeu.pt",
    "email": "geral@clinicasaojudastadeu.pt",
    "phone": "273325276",
    "source": "https://fadadodente.pt/clinica/clinica-medica-e-dentaria-sao-judas-tadeu-braganca",
    "observation": "A fonte pública identifica a atividade de clínica médica e dentária e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de clínica médica e dentária.",
    "service": "design"
  },
  {
    "company": "Cliarcos",
    "sector": "Clínica dentária",
    "email_area": "Dentistas",
    "location": "Mirandela, Bragança",
    "website": "https://cliarcos.pt",
    "email": "geral@cliarcos.pt",
    "phone": "278262054",
    "source": "https://fadadodente.pt/clinica/cliarcos-clinica-dentaria-mirandela-mirandela",
    "observation": "A fonte pública identifica a atividade de clínica dentária e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de clínica dentária.",
    "service": "design"
  },
  {
    "company": "Montes de Saúde",
    "sector": "Clínica médica",
    "email_area": "Saúde",
    "location": "Bragança, Bragança",
    "website": "https://montes-saude.pt",
    "email": "geral@montes-saude.pt",
    "phone": "961165555",
    "source": "https://montes-saude.pt/",
    "observation": "A fonte pública identifica a atividade de clínica médica e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de clínica médica.",
    "service": "design"
  },
  {
    "company": "Smile Dente",
    "sector": "Clínica dentária",
    "email_area": "Dentistas",
    "location": "Bragança, Bragança",
    "website": "https://smiledente.pt",
    "email": "geral@smiledente.pt",
    "phone": "938242279",
    "source": "https://fadadodente.pt/clinica/smile-dente-braganca",
    "observation": "A fonte pública identifica a atividade de clínica dentária e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de clínica dentária.",
    "service": "design"
  },
  {
    "company": "GET Ride",
    "sector": "Transportes personalizados",
    "email_area": "Transportes & Logística",
    "location": "Amadora, Lisboa",
    "website": "https://get-ride.pt",
    "email": "geral@get-ride.pt",
    "phone": "966886896",
    "source": "https://www.get-ride.pt/",
    "observation": "A fonte pública identifica a atividade de transportes personalizados e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de transportes personalizados.",
    "service": "design"
  },
  {
    "company": "Marques",
    "sector": "Transportes de passageiros",
    "email_area": "Transportes & Logística",
    "location": "Viseu, Viseu",
    "website": "https://marques.pt",
    "email": "geral@marques.pt",
    "phone": "232421954",
    "source": "https://www.marques.pt/marques/Contatos",
    "observation": "A fonte pública identifica a atividade de transportes de passageiros e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de transportes de passageiros.",
    "service": "design"
  },
  {
    "company": "ALVOSTEEL",
    "sector": "Engenharia e construção metálica",
    "email_area": "Construção & Engenharia",
    "location": "Lobão, Aveiro",
    "website": "https://alvosteel.com",
    "email": "geral@alvosteel.com",
    "phone": "910997383",
    "source": "https://ruis.aiccopn.pt/empresas/alvosteel-engenharia-e-construcao/",
    "observation": "A fonte pública identifica a atividade de engenharia e construção metálica e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de engenharia e construção metálica.",
    "service": "design"
  },
  {
    "company": "Academia Salsa Algarve",
    "sector": "Escola de dança",
    "email_area": "Estúdios de Dança",
    "location": "Faro, Faro",
    "website": "https://salsa-algarve.com",
    "email": "geral@salsa-algarve.com",
    "phone": "912544500",
    "source": "https://portaldadanca.pt/escolas/academia-salsa-algarve/",
    "observation": "A fonte pública identifica a atividade de escola de dança e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de escola de dança.",
    "service": "design"
  },
  {
    "company": "SCARP",
    "sector": "Construção civil e obras públicas",
    "email_area": "Construção & Engenharia",
    "location": "Albergaria-a-Velha, Aveiro",
    "website": "https://scarp-sa.com",
    "email": "geral@scarp-sa.com",
    "phone": "234529650",
    "source": "https://ruis.aiccopn.pt/empresas/scarp-sociedade-de-construcoes-civis-e-obras-publicas-antonio-rodrigues-parente-lda/",
    "observation": "A fonte pública identifica a atividade de construção civil e obras públicas e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de construção civil e obras públicas.",
    "service": "design"
  },
  {
    "company": "Páginas Válidas",
    "sector": "Construção e reabilitação",
    "email_area": "Construção & Engenharia",
    "location": "Oliveira do Bairro, Aveiro",
    "website": "https://paginasvalidas.pt",
    "email": "geral@paginasvalidas.com",
    "phone": "938330775",
    "source": "https://www.paginasvalidas.pt/contact",
    "observation": "A fonte pública identifica a atividade de construção e reabilitação e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de construção e reabilitação.",
    "service": "design"
  },
  {
    "company": "Metal Focus",
    "sector": "Serralharia e construção metálica",
    "email_area": "Indústria & Produção",
    "location": "Covões, Cantanhede, Coimbra",
    "website": "https://metalfocus.pt",
    "email": "geral@metalfocus.pt",
    "phone": "231460199",
    "source": "https://metalfocus.pt/fotogaleria/",
    "observation": "A fonte pública identifica a atividade de serralharia e construção metálica e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de serralharia e construção metálica.",
    "service": "design"
  },
  {
    "company": "JTSL",
    "sector": "Manutenção metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Penacova, Coimbra",
    "website": "https://jtsl.pt",
    "email": "geral@jtsl.pt",
    "phone": "239470080",
    "source": "https://ruis.aiccopn.pt/empresas/jtsl-solucoes-tecnicas-manutencao-metalomecanica-s-a/",
    "observation": "A fonte pública identifica a atividade de manutenção metalomecânica e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de manutenção metalomecânica.",
    "service": "design"
  },
  {
    "company": "Oral Care Pires",
    "sector": "Clínica dentária",
    "email_area": "Dentistas",
    "location": "Crato, Portalegre",
    "website": "https://oralcarepires.com",
    "email": "geral@oralcarepires.com",
    "phone": "245997119",
    "source": "https://oralcarepires.com/",
    "observation": "A fonte pública identifica a atividade de clínica dentária e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de clínica dentária.",
    "service": "design"
  },
  {
    "company": "Clínica COR Alentejo",
    "sector": "Clínica dentária",
    "email_area": "Dentistas",
    "location": "Portalegre, Portalegre",
    "website": "https://clinicacoralentejo.pt",
    "email": "geral@clinicacoralentejo.pt",
    "phone": "245308040",
    "source": "https://fadadodente.pt/clinica/clinica-cor-alentejo-portalegre",
    "observation": "A fonte pública identifica a atividade de clínica dentária e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de clínica dentária.",
    "service": "design"
  },
  {
    "company": "Cerpros",
    "sector": "Centro de recuperação e clínica dentária",
    "email_area": "Saúde",
    "location": "Portalegre, Portalegre",
    "website": "https://cerpros.pt",
    "email": "geral@cerpros.pt",
    "phone": "245339020",
    "source": "https://fadadodente.pt/clinica/centro-de-recuperacao-de-portalegre-cerpros-portalegre",
    "observation": "A fonte pública identifica a atividade de centro de recuperação e clínica dentária e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de centro de recuperação e clínica dentária.",
    "service": "design"
  },
  {
    "company": "Formiga de Asa",
    "sector": "Centro de estudos e ATL",
    "email_area": "Centro de Estudos",
    "location": "Santarém, Santarém",
    "website": "https://formigadeasa.com",
    "email": "geral@formigadeasa.com",
    "phone": "914971430",
    "source": "https://formigadeasa.wixsite.com/formigadeasa/inscricoes-atl-2023-2024",
    "observation": "A fonte pública identifica a atividade de centro de estudos e atl e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de centro de estudos e atl.",
    "service": "design"
  },
  {
    "company": "Serra do Saber",
    "sector": "Formação profissional",
    "email_area": "Educação & Formação",
    "location": "Alcanede, Santarém",
    "website": "https://serradosaber.com",
    "email": "geral@serradosaber.com",
    "phone": "243406050",
    "source": "https://serradosaber.com/sobre/",
    "observation": "A fonte pública identifica a atividade de formação profissional e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de formação profissional.",
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
 }})();console.log('[crm] seed 2026-11-23-b:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-23-b:',e.message)}
