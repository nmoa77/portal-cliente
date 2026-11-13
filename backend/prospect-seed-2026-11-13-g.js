// DUIT — Portugal continental, 2026-11-13. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "MECTOP",
    "sector": "Metalomecânica de precisão",
    "email_area": "Indústria & Produção",
    "location": "Setúbal, Setúbal",
    "website": "https://mectop.com",
    "email": "mectop@mectop.com",
    "phone": "265739870",
    "source": "https://www.mectop.com/contactos/",
    "observation": "Atividade de metalomecânica de precisão e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de metalomecânica de precisão.",
    "service": "design"
  },
  {
    "company": "Fisioalbi",
    "sector": "Fisioterapia e material ortopédico",
    "email_area": "Fisioterapia",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://fisioalbi.pt",
    "email": "geral@fisioalbi.pt",
    "phone": "272085986",
    "source": "https://fisioalbi.pt/",
    "observation": "Atividade de fisioterapia e material ortopédico e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de fisioterapia e material ortopédico.",
    "service": "design"
  },
  {
    "company": "A Magia de Aprender",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Leiria, Leiria",
    "website": "https://amagiadeaprender.com",
    "email": "geral@amagiadeaprender.com",
    "phone": "910609733",
    "source": "https://www.amagiadeaprender.com/contactos",
    "observation": "Atividade de centro de estudos e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de centro de estudos.",
    "service": "design"
  },
  {
    "company": "Carpintaria Parente",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://carpintariaparente.com",
    "email": "geral@carpintariaparente.com",
    "phone": "258830484",
    "source": "https://carpintariaparente.com/",
    "observation": "Atividade de carpintaria e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de carpintaria.",
    "service": "design"
  },
  {
    "company": "Fisiojá",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://fisioja.pt",
    "email": "info@fisioja.pt",
    "phone": "272337398",
    "source": "https://fisioja.pt/",
    "observation": "Atividade de fisioterapia e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de fisioterapia.",
    "service": "design"
  },
  {
    "company": "Carpintaria Rocha",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://carpintariarocha.com",
    "email": "geral@carpintariarocha.com",
    "phone": "258871715",
    "source": "https://www.carpintariarocha.com/pt/2-contactos/",
    "observation": "Atividade de carpintaria e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de carpintaria.",
    "service": "design"
  },
  {
    "company": "FisioNunes",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://fisionunes.pt",
    "email": "fisioterapia@fisionunes.pt",
    "phone": "961929618",
    "source": "https://www.fisionunes.pt/",
    "observation": "Atividade de fisioterapia e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de fisioterapia.",
    "service": "design"
  },
  {
    "company": "Fisiart",
    "sector": "Fisioterapia e saúde",
    "email_area": "Fisioterapia",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://fisiart.pt",
    "email": "geral@fisiart.pt",
    "phone": "272345082",
    "source": "https://fisiart.pt/",
    "observation": "Atividade de fisioterapia e saúde e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de fisioterapia e saúde.",
    "service": "design"
  },
  {
    "company": "Equilibrium Fisio",
    "sector": "Fisioterapia e bem-estar",
    "email_area": "Fisioterapia",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://equilibriumfisio.pt",
    "email": "geral@equilibriumfisio.pt",
    "phone": "926512221",
    "source": "https://equilibriumfisio.pt/contactos",
    "observation": "Atividade de fisioterapia e bem-estar e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de fisioterapia e bem-estar.",
    "service": "design"
  },
  {
    "company": "x-Smile Clínicas Dentárias",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Portalegre, Portalegre",
    "website": "https://x-smile.pt",
    "email": "portalegre@x-smile.pt",
    "phone": "245202034",
    "source": "https://x-smile.pt/portalegre",
    "observation": "Atividade de medicina dentária e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de medicina dentária.",
    "service": "design"
  },
  {
    "company": "Quinta do Rio Noémi",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Guarda, Guarda",
    "website": "https://quintadorionoemi.com",
    "email": "geral@quintadorionoemi.com",
    "phone": "910658202",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/guarda",
    "observation": "Atividade de turismo rural e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Custódio Martins Transportes",
    "sector": "Transporte de mercadorias",
    "email_area": "Transportes & Logística",
    "location": "Ferreira do Zêzere, Santarém",
    "website": "https://custodiomartinstransportes.com",
    "email": "geral@custodiomartinstransportes.com",
    "phone": "917307214",
    "source": "https://www.custodiomartinstransportes.com/",
    "observation": "Atividade de transporte de mercadorias e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de transporte de mercadorias.",
    "service": "design"
  },
  {
    "company": "MSaúde",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Portalegre, Portalegre",
    "website": "https://msaude.pt",
    "email": "geral@msaude.pt",
    "phone": "245035974",
    "source": "https://msaude.pt/pt/clinicas",
    "observation": "Atividade de medicina dentária e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de medicina dentária.",
    "service": "design"
  },
  {
    "company": "Serralharia Cardielos",
    "sector": "Serralharia",
    "email_area": "Indústria & Produção",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://serralhariacardielos.pt",
    "email": "geral@serralhariacardielos.pt",
    "phone": "936112811",
    "source": "https://www.serralhariacardielos.pt/contactos/",
    "observation": "Atividade de serralharia e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de serralharia.",
    "service": "design"
  },
  {
    "company": "Lumiinox",
    "sector": "Serralharia e alumínio",
    "email_area": "Indústria & Produção",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://lumiinox.pt",
    "email": "luis@lumiinox.pt",
    "phone": "967323696",
    "source": "https://lumiinox.pt/contactos-serralharia-lumiinox/",
    "observation": "Atividade de serralharia e alumínio e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de serralharia e alumínio.",
    "service": "design"
  },
  {
    "company": "Vigias Casa Gaio",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Portalegre, Portalegre",
    "website": "https://vigias.pt",
    "email": "geral@vigias.pt",
    "phone": "936721199",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/portalegre",
    "observation": "Atividade de turismo rural e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Meridiano Pitoresco",
    "sector": "Circuitos turísticos",
    "email_area": "Aventura",
    "location": "Portalegre, Portalegre",
    "website": "https://meridiano-pitoresco.pt",
    "email": "luis.miguel@meridiano-pitoresco.pt",
    "phone": "919674841",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/portalegre",
    "observation": "Atividade de circuitos turísticos e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de circuitos turísticos.",
    "service": "design"
  },
  {
    "company": "Aldeia do Pontido",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Fafe, Braga",
    "website": "https://aldeiadopontido.com",
    "email": "geral@aldeiadopontido.com",
    "phone": "253508108",
    "source": "https://www.visitportugal.com/pt-pt/taxonomy/term/530",
    "observation": "Atividade de turismo rural e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Vale de S. Torcato Hotel Rural",
    "sector": "Hotelaria rural",
    "email_area": "Turismo & Alojamento",
    "location": "Guimarães, Braga",
    "website": "https://valedestorcato.pt",
    "email": "geral@valedestorcato.pt",
    "phone": "253534008",
    "source": "https://www.visitportugal.com/pt-pt/taxonomy/term/530",
    "observation": "Atividade de hotelaria rural e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de hotelaria rural.",
    "service": "design"
  },
  {
    "company": "Madrugada Turismo Rural",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Évora, Évora",
    "website": "https://madrugadaturismorural.com",
    "email": "info@madrugadaevora.com",
    "phone": "918784221",
    "source": "https://www.visitportugal.com/pt-pt/taxonomy/term/530",
    "observation": "Atividade de turismo rural e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Casa da Avó Faia",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Macedo de Cavaleiros, Bragança",
    "website": "https://casadavofaia.pt",
    "email": "info@casadavofaia.pt",
    "phone": "934196252",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/macedo-de-cavaleiros?page=3",
    "observation": "Atividade de turismo rural e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Pureazibo",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Macedo de Cavaleiros, Bragança",
    "website": "https://pureazibo.pt",
    "email": "geral@pureazibo.pt",
    "phone": "278431146",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/macedo-de-cavaleiros?page=3",
    "observation": "Atividade de turismo rural e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Casa do Parada",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Monção, Viana do Castelo",
    "website": "https://casadoparada.com",
    "email": "info@casadoparada.com",
    "phone": "251538252",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=490&f%5B0%5D=im_subtipo_alojamento%3A586&f%5B1%5D=im_field_poi_tipo%3A490&f%5B2%5D=bm_field_ma_acesso_internet_no_q%3Atrue&page=7",
    "observation": "Atividade de turismo rural e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Hotel Rural Maria da Fonte",
    "sector": "Hotelaria rural",
    "email_area": "Turismo & Alojamento",
    "location": "Póvoa de Lanhoso, Braga",
    "website": "https://mariadafonte.com",
    "email": "info@mariadafonte.com",
    "phone": "253639600",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=530&f%5B0%5D=im_field_poi_tipo%3A490&f%5B1%5D=bm_field_ma_gin_sio%3Atrue&page=2&visitas=1",
    "observation": "Atividade de hotelaria rural e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de hotelaria rural.",
    "service": "design"
  },
  {
    "company": "Quinta de VillaSete",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Marco de Canaveses, Porto",
    "website": "https://villasete.com",
    "email": "info@villasete.com",
    "phone": "919903017",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=530&f%5B0%5D=im_field_poi_tipo%3A490&f%5B1%5D=bm_field_ma_gin_sio%3Atrue&page=2&visitas=1",
    "observation": "Atividade de turismo rural e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Quintinha da Eira",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Santarém, Santarém",
    "website": "https://quintinhadaeira.com",
    "email": "info@quintinhadaeira.com",
    "phone": "249790462",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?f%5B0%5D=im_subtipo_alojamento%3A586&f%5B1%5D=bm_field_ma_acesso_para_deficien%3Atrue&f%5B2%5D=bm_field_ma_aceita_animais_de_es%3Atrue&page=2",
    "observation": "Atividade de turismo rural e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Sobrenatura",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Arcos de Valdevez, Viana do Castelo",
    "website": "https://sobrenatura.com",
    "email": "info@sobrenatura.com",
    "phone": "917540404",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?f%5B0%5D=im_subtipo_alojamento%3A586&f%5B1%5D=bm_field_ma_acesso_para_deficien%3Atrue&f%5B2%5D=bm_field_ma_aceita_animais_de_es%3Atrue&page=2",
    "observation": "Atividade de turismo rural e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Casa de Trás o Rio",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Caminha, Viana do Castelo",
    "website": "https://quintatrasorio.pt",
    "email": "geral@quintatrasorio.pt",
    "phone": "258912350",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?f%5B0%5D=bm_field_ma_acesso_internet_%3Atrue&f%5B1%5D=bm_field_ma_aceita_animais_de_es%3Atrue&order=1&page=1&regioes=285",
    "observation": "Atividade de turismo rural e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Hotel Rural da Ameira",
    "sector": "Hotelaria rural",
    "email_area": "Turismo & Alojamento",
    "location": "Montemor-o-Novo, Évora",
    "website": "https://hoteldaameira.pt",
    "email": "recepcao@hoteldaameira.pt",
    "phone": "266898240",
    "source": "https://www.visitportugal.com/pt-pt/search/site/Turismo%20rural?page=1",
    "observation": "Atividade de hotelaria rural e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de hotelaria rural.",
    "service": "design"
  },
  {
    "company": "Hotel Rural Quinta do Pégo",
    "sector": "Hotelaria rural",
    "email_area": "Turismo & Alojamento",
    "location": "Tabuaço, Viseu",
    "website": "https://quintadopego.com",
    "email": "info@quintadopego.com",
    "phone": "254730070",
    "source": "https://www.visitportugal.com/pt-pt/search/site?f%5B0%5D=bm_field_ma_bar%3Atrue&f%5B1%5D=bm_field_ma_instala_es_para_defi%3Atrue&f%5B2%5D=im_subtipo_alojamento%3A586&page=3&visitas=1",
    "observation": "Atividade de hotelaria rural e contacto publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de hotelaria rural.",
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
 }})();console.log('[crm] seed 2026-11-13-g:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-13-g:',e.message)}
