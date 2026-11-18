// DUIT — prospeção 2026-11-18. Fontes públicas oficiais e diretórios institucionais.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "TRADO Construção e Obras Públicas",
    "sector": "Construção e reabilitação",
    "email_area": "Construção & Engenharia",
    "location": "Penafiel, Porto",
    "website": "https://trado.pt",
    "email": "geral@trado.pt",
    "phone": "224155447",
    "source": "https://ruis.aiccopn.pt/empresas/trado-construcao-e-obras-publicas-lda/",
    "observation": "Atividade de construção e reabilitação identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de construção e reabilitação.",
    "service": "design"
  },
  {
    "company": "Empribuild",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Porto, Porto",
    "website": "https://empribuild.pt",
    "email": "geral@empribuild.pt",
    "phone": "917249883",
    "source": "https://ruis.aiccopn.pt/empresas/empribuild-lda/",
    "observation": "Atividade de construção civil identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de construção civil.",
    "service": "design"
  },
  {
    "company": "ARGS Construções",
    "sector": "Construção de edifícios",
    "email_area": "Construção & Engenharia",
    "location": "Fafe, Braga",
    "website": "https://args.pt",
    "email": "geral@args.pt",
    "phone": "253059804",
    "source": "https://ruis.aiccopn.pt/empresas/a-r-g-s-construcoes-unip-lda/",
    "observation": "Atividade de construção de edifícios identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de construção de edifícios.",
    "service": "design"
  },
  {
    "company": "Construções António Monteiro",
    "sector": "Construção e manutenção",
    "email_area": "Construção & Engenharia",
    "location": "Barcelos, Braga",
    "website": "https://construcoesam.pt",
    "email": "geral@construcoesam.pt",
    "phone": "253811455",
    "source": "https://ruis.aiccopn.pt/empresas/sociedade-de-construcoes-antonio-monteiro-c-lda/",
    "observation": "Atividade de construção e manutenção identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de construção e manutenção.",
    "service": "design"
  },
  {
    "company": "ABTEC",
    "sector": "Construção e assistência ao lar",
    "email_area": "Construção & Engenharia",
    "location": "Oliveira do Hospital, Coimbra",
    "website": "https://abtec.pt",
    "email": "geral@abtec.pt",
    "phone": "967530796",
    "source": "https://ruis.aiccopn.pt/empresas/abtec-actividades-construcao-civil-unip-lda/",
    "observation": "Atividade de construção e assistência ao lar identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de construção e assistência ao lar.",
    "service": "design"
  },
  {
    "company": "Qualifica Construções",
    "sector": "Reabilitação de edifícios",
    "email_area": "Construção & Engenharia",
    "location": "Braga, Braga",
    "website": "https://qualifica-construcoes.pt",
    "email": "geral@qualifica-construcoes.pt",
    "phone": "253612580",
    "source": "https://ruis.aiccopn.pt/empresas/qualifica-reabilitacao-e-construcao-de-edificios-lda/",
    "observation": "Atividade de reabilitação de edifícios identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de reabilitação de edifícios.",
    "service": "design"
  },
  {
    "company": "Mescla Premium",
    "sector": "Arquitetura e construção",
    "email_area": "Construção & Engenharia",
    "location": "Prior Velho, Lisboa",
    "website": "https://mescla.pt",
    "email": "geral@mescla.pt",
    "phone": "219261083",
    "source": "https://ruis.aiccopn.pt/empresas/mescla-premium-lda/",
    "observation": "Atividade de arquitetura e construção identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de arquitetura e construção.",
    "service": "design"
  },
  {
    "company": "XPTOBRA",
    "sector": "Construção e remodelações",
    "email_area": "Construção & Engenharia",
    "location": "Braga, Braga",
    "website": "https://xptobra.pt",
    "email": "geral@xptobra.pt",
    "phone": "253678346",
    "source": "https://ruis.aiccopn.pt/empresas/xptobra-unip-lda/",
    "observation": "Atividade de construção e remodelações identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de construção e remodelações.",
    "service": "design"
  },
  {
    "company": "Cervimat Engenharia e Construção",
    "sector": "Engenharia e construção",
    "email_area": "Construção & Engenharia",
    "location": "Vila Nova de Gaia, Porto",
    "website": "https://cervimat.pt",
    "email": "geral@cervimat.pt",
    "phone": "227836003",
    "source": "https://ruis.aiccopn.pt/empresas/cervimat-engenharia-e-construcao-lda/",
    "observation": "Atividade de engenharia e construção identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de engenharia e construção.",
    "service": "design"
  },
  {
    "company": "JTSL Soluções Técnicas",
    "sector": "Manutenção metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Penacova, Coimbra",
    "website": "https://jtsl.pt",
    "email": "geral@jtsl.pt",
    "phone": "239470080",
    "source": "https://ruis.aiccopn.pt/empresas/jtsl-solucoes-tecnicas-manutencao-metalomecanica-s-a/",
    "observation": "Atividade de manutenção metalomecânica identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de manutenção metalomecânica.",
    "service": "design"
  },
  {
    "company": "Almojanda 3Olivetree",
    "sector": "Turismo rural e olivicultura",
    "email_area": "Turismo & Alojamento",
    "location": "Portalegre, Portalegre",
    "website": "https://almojanda3olivetree.com",
    "email": "geral@almojanda3olivetree.com",
    "phone": "963474524",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/portalegre",
    "observation": "Atividade de turismo rural e olivicultura identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de turismo rural e olivicultura.",
    "service": "design"
  },
  {
    "company": "Vigias Casa Gaio",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Carreiras, Portalegre",
    "website": "https://vigias.pt",
    "email": "geral@vigias.pt",
    "phone": "936721199",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/portalegre",
    "observation": "Atividade de turismo rural identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Ninho do Melro II",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Rabal, Bragança",
    "website": "https://ninhodomelro.com",
    "email": "turismorural@ninhodomelro.com",
    "phone": "962578374",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/bragan%C3%A7a",
    "observation": "Atividade de turismo rural identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Hotel Tic Tac",
    "sector": "Hotelaria",
    "email_area": "Turismo & Alojamento",
    "location": "Bragança, Bragança",
    "website": "https://hoteltictac.pt",
    "email": "reservas@hoteltictac.pt",
    "phone": "273331373",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/bragan%C3%A7a?page=6",
    "observation": "Atividade de hotelaria identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de hotelaria.",
    "service": "design"
  },
  {
    "company": "Viseu Executive Hotel",
    "sector": "Hotelaria",
    "email_area": "Turismo & Alojamento",
    "location": "Viseu, Viseu",
    "website": "https://viseuexecutivehotel.pt",
    "email": "geral@viseuexecutivehotel.pt",
    "phone": "232246060",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/viseu",
    "observation": "Atividade de hotelaria identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de hotelaria.",
    "service": "design"
  },
  {
    "company": "Douro Cister Hotel",
    "sector": "Hotel rural e spa",
    "email_area": "Turismo & Alojamento",
    "location": "Tarouca, Viseu",
    "website": "https://dourocisterhotel.pt",
    "email": "geral@dourocisterhotel.pt",
    "phone": "254671110",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/viseu",
    "observation": "Atividade de hotel rural e spa identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de hotel rural e spa.",
    "service": "design"
  },
  {
    "company": "Quinta do Fontelo",
    "sector": "Alojamento local",
    "email_area": "Turismo & Alojamento",
    "location": "Vouzela, Viseu",
    "website": "https://quintadofontelo.com",
    "email": "info@quintadofontelo.com",
    "phone": "232778097",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/vouzela",
    "observation": "Atividade de alojamento local identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de alojamento local.",
    "service": "design"
  },
  {
    "company": "Pousadela Village",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Vieira do Minho, Braga",
    "website": "https://pousadela.pt",
    "email": "reservas@pousadela.pt",
    "phone": "253646267",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/vieira-do-minho",
    "observation": "Atividade de turismo rural identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Refúgio dos Cregos",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Monção, Viana do Castelo",
    "website": "https://refugiodoscregos.com",
    "email": "info@refugiodoscregos.com",
    "phone": "938924042",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/mon%C3%A7%C3%A3o",
    "observation": "Atividade de turismo rural identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Monte Tons da Terra",
    "sector": "Casa de campo e spa",
    "email_area": "Turismo & Alojamento",
    "location": "Santiago do Cacém, Setúbal",
    "website": "https://tonsdaterra.com",
    "email": "geral@tonsdaterra.com",
    "phone": "269909016",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=35&f%5B0%5D=bm_field_ma_acesso_internet_%3Atrue&f%5B1%5D=bm_field_ma_bikefriendly%3Atrue&order=1&page=3",
    "observation": "Atividade de casa de campo e spa identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de casa de campo e spa.",
    "service": "design"
  },
  {
    "company": "Negrifer",
    "sector": "Serralharia",
    "email_area": "Indústria & Produção",
    "location": "Montes Velhos, Beja",
    "website": "https://negrifer.pt",
    "email": "geral@negrifer.pt",
    "phone": "918903546",
    "source": "https://negrifer.pt/contactos/",
    "observation": "Atividade de serralharia identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de serralharia.",
    "service": "design"
  },
  {
    "company": "Clínica Cor Alentejo",
    "sector": "Clínica multidisciplinar",
    "email_area": "Saúde",
    "location": "Portalegre, Portalegre",
    "website": "https://clinicacoralentejo.pt",
    "email": "geral@clinicacoralentejo.pt",
    "phone": "245308040",
    "source": "https://clinicacoralentejo.pt/especialidades/psicologia/",
    "observation": "Atividade de clínica multidisciplinar identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de clínica multidisciplinar.",
    "service": "design"
  },
  {
    "company": "Auto Imperial Bragança",
    "sector": "Comércio e oficina automóvel",
    "email_area": "Automóvel",
    "location": "Bragança, Bragança",
    "website": "https://autoimperial.pt",
    "email": "geral@autoimperial.eu",
    "phone": "273302600",
    "source": "https://autoimperial.pt/contacto/",
    "observation": "Atividade de comércio e oficina automóvel identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de comércio e oficina automóvel.",
    "service": "design"
  },
  {
    "company": "JOPAUTO",
    "sector": "Comércio e assistência automóvel",
    "email_area": "Automóvel",
    "location": "São João da Pesqueira, Viseu",
    "website": "https://jopauto.pt",
    "email": "geral@jopauto.pt",
    "phone": "254489150",
    "source": "https://jopauto.pt/contactos/",
    "observation": "Atividade de comércio e assistência automóvel identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de comércio e assistência automóvel.",
    "service": "design"
  },
  {
    "company": "Setubaltours.fun",
    "sector": "Atividades outdoor",
    "email_area": "Aventura",
    "location": "Setúbal, Setúbal",
    "website": "https://setubaltours.fun",
    "email": "info@setubaltours.fun",
    "phone": "932127401",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/set%C3%BAbal",
    "observation": "Atividade de atividades outdoor identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de atividades outdoor.",
    "service": "design"
  },
  {
    "company": "Sabino Boat Tours",
    "sector": "Passeios de barco",
    "email_area": "Aventura",
    "location": "Faro, Faro",
    "website": "https://sabinoboattours.com",
    "email": "info@sabinoboattours.com",
    "phone": "915661860",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo/faro?f%5B0%5D=im_field_poi_tipo%3A562",
    "observation": "Atividade de passeios de barco identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de passeios de barco.",
    "service": "design"
  },
  {
    "company": "Algarve Tuk Group",
    "sector": "Circuitos turísticos",
    "email_area": "Aventura",
    "location": "Carvoeiro, Faro",
    "website": "https://algarvetukgroup.pt",
    "email": "reservas@algarvetukgroup.pt",
    "phone": "967150582",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=93&f%5B0%5D=bm_field_ma_visitas_guiadas_%3Atrue&f%5B1%5D=im_field_poi_tipo%3A562&page=1&visitas=1",
    "observation": "Atividade de circuitos turísticos identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de circuitos turísticos.",
    "service": "design"
  },
  {
    "company": "PinkMyBike",
    "sector": "Passeios e aluguer de motos",
    "email_area": "Aventura",
    "location": "Bragança, Bragança",
    "website": "https://pinkmybike.pt",
    "email": "geral@pinkmybike.pt",
    "phone": "961112699",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/bragan%C3%A7a",
    "observation": "Atividade de passeios e aluguer de motos identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de passeios e aluguer de motos.",
    "service": "design"
  },
  {
    "company": "Foz Tua",
    "sector": "Enoturismo",
    "email_area": "Turismo & Alojamento",
    "location": "Carrazeda de Ansiães, Bragança",
    "website": "https://foztua.pt",
    "email": "info@foztua.pt",
    "phone": "919995548",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/bragan%C3%A7a",
    "observation": "Atividade de enoturismo identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de enoturismo.",
    "service": "design"
  },
  {
    "company": "Centro de Estudos APP",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Coimbra, Coimbra",
    "website": "https://aprevidenciaportuguesa.pt",
    "email": "centrodeestudos@aprevidenciaportuguesa.pt",
    "phone": "239091262",
    "source": "https://www.aprevidenciaportuguesa.pt/centro-de-estudos-app/",
    "observation": "Atividade de centro de estudos identificada na fonte pública indicada.",
    "opportunity": "Possível apoio no design de materiais de apresentação de serviços de centro de estudos.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-18).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-18:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-18:',e.message)}
