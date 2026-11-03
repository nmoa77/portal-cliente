// DUIT — Portugal continental, 2026-11-03. Contactos confirmados em páginas oficiais ou diretório AICCOPN.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Premetal",
    "sector": "Metalomecânica para agropecuária",
    "email_area": "Indústria & Produção",
    "location": "Évora, Évora",
    "website": "https://premetal.pt/",
    "email": "geral@premetal.pt",
    "phone": "266 760 090",
    "source": "https://premetal.pt/contactos/",
    "observation": "Comercializa máquinas agrícolas, reboques e produtos de metalurgia.",
    "opportunity": "Criar materiais visuais de apresentação das gamas de equipamentos.",
    "service": "design"
  },
  {
    "company": "Despertar — Formação e Psicologia",
    "sector": "Formação e desenvolvimento pessoal",
    "email_area": "Educação & Formação",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://despertar.com.pt/",
    "email": "geral@despertar.com.pt",
    "phone": "962 335 962",
    "source": "https://despertar.com.pt/",
    "observation": "Entidade formadora com programas de desenvolvimento de competências.",
    "opportunity": "Criar suportes para divulgação das ações de formação.",
    "service": "design"
  },
  {
    "company": "Construções Jaime Mendo",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Pinhel, Guarda",
    "website": "https://jaimemendo.com/",
    "email": "geral@jaimemendo.com",
    "phone": "271 411 008",
    "source": "https://ruis.aiccopn.pt/empresas/construcoes-jaime-mendo-soc-unip-lda/",
    "observation": "Empresa de construção e reabilitação com sede em Pinhel.",
    "opportunity": "Criar apresentações de obras e serviços de construção.",
    "service": "design"
  },
  {
    "company": "Domingos Alves da Silva & Irmãos",
    "sector": "Serração e carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Guarda, Guarda",
    "website": "https://www.doalsil.com/",
    "email": "geral@doalsil.com",
    "phone": "271 238 199",
    "source": "https://www.doalsil.com/",
    "observation": "Empresa de serração, carpintaria e comércio de materiais de construção.",
    "opportunity": "Criar catálogo de serviços e materiais comercializados.",
    "service": "design"
  },
  {
    "company": "IFT — Instituto de Formação e Transportes",
    "sector": "Formação profissional",
    "email_area": "Educação & Formação",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://formacao.grupoift.pt/",
    "email": "geral@grupoift.pt",
    "phone": "258 023 347",
    "source": "https://formacao.grupoift.pt/",
    "observation": "Disponibiliza formação profissional e contactos em Viana do Castelo e Braga.",
    "opportunity": "Criar peças de apresentação de cursos e ações formativas.",
    "service": "design"
  },
  {
    "company": "Metalviçosa",
    "sector": "Fabricação de máquinas industriais",
    "email_area": "Indústria & Produção",
    "location": "Alandroal, Évora",
    "website": "https://metalvicosa.com/",
    "email": "geral@metalvicosa.com",
    "phone": "268 431 104",
    "source": "https://ruis.aiccopn.pt/empresas/metalvicosa-fabricacao-de-maquinas-industriais-lda/",
    "observation": "Empresa de fabricação de máquinas industriais e serviços de engenharia.",
    "opportunity": "Criar fichas técnicas e apresentações comerciais de equipamentos.",
    "service": "design"
  },
  {
    "company": "Vertentefabulosa",
    "sector": "Revestimentos de fachadas",
    "email_area": "Construção & Engenharia",
    "location": "Vila Nova de Gaia, Porto",
    "website": "https://vertentefabulosa.pt/",
    "email": "geral@vertentefabulosa.pt",
    "phone": "227 128 288",
    "source": "https://ruis.aiccopn.pt/empresas/vertentefabulosa-lda/",
    "observation": "Especializada em revestimentos fenólicos e compósitos metálicos.",
    "opportunity": "Criar portefólio de soluções e aplicações em fachada.",
    "service": "design"
  },
  {
    "company": "Condutar",
    "sector": "Metalomecânica e ventilação",
    "email_area": "Indústria & Produção",
    "location": "Camarate, Lisboa",
    "website": "https://condutar.pt/",
    "email": "geral@condutar.pt",
    "phone": "219 484 540",
    "source": "https://condutar.pt/contactos/",
    "observation": "Fabrica equipamentos para climatização e ventilação.",
    "opportunity": "Criar fichas visuais para produtos de ventilação.",
    "service": "design"
  },
  {
    "company": "Mare Vitae",
    "sector": "Engenharia ambiental e formação náutica",
    "email_area": "Educação & Formação",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://www.marevitae.pt/",
    "email": "geral@marevitae.pt",
    "phone": "964 818 439",
    "source": "https://www.marevitae.pt/form/contacto",
    "observation": "Presta consultoria ambiental, formação náutica e atividades de mergulho.",
    "opportunity": "Criar materiais de divulgação das formações e atividades.",
    "service": "ambas"
  },
  {
    "company": "Domus Qualitas",
    "sector": "Construção e reabilitação",
    "email_area": "Construção & Engenharia",
    "location": "Braga, Braga",
    "website": "https://domusqualitas.pt/",
    "email": "geral@domusqualitas.pt",
    "phone": "253 187 094",
    "source": "https://ruis.aiccopn.pt/empresas/domus-qualitas-construcao-e-reabilitacao-lda/",
    "observation": "Empresa de construção e reabilitação do património edificado.",
    "opportunity": "Criar apresentações de projetos de reabilitação.",
    "service": "design"
  },
  {
    "company": "Arborea — Espaço Terapêutico e Pedagógico",
    "sector": "Psicologia e terapias",
    "email_area": "Saúde Mental",
    "location": "Santarém, Santarém",
    "website": "https://www.arborea.space/",
    "email": "geral@arborea.space",
    "phone": "936 566 759",
    "source": "https://www.arborea.space/",
    "observation": "Espaço terapêutico com psicologia, psiquiatria e outras especialidades.",
    "opportunity": "Criar materiais informativos de serviços terapêuticos.",
    "service": "design"
  },
  {
    "company": "VIG — Prevenção de Riscos Profissionais",
    "sector": "Segurança e saúde no trabalho",
    "email_area": "Serviços Profissionais",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://vigshst.pt/",
    "email": "geral@vigshst.com",
    "phone": "258 811 911",
    "source": "https://vigshst.pt/quem-somos/",
    "observation": "Presta serviços de segurança, higiene e saúde no trabalho.",
    "opportunity": "Criar materiais de apresentação de serviços para empresas.",
    "service": "design"
  },
  {
    "company": "Bautec",
    "sector": "Coberturas e construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Perosinho, Porto",
    "website": "https://bautec.pt/",
    "email": "geral@bautec.pt",
    "phone": "227 845 391",
    "source": "https://ruis.aiccopn.pt/empresas/bautec-coberturas-e-construcao-civil-lda/",
    "observation": "Presta serviços de construção, consultoria e reabilitação.",
    "opportunity": "Criar suportes de apresentação de projetos e serviços.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-03).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');
  added++;
 }})();
 console.log('[crm] seed 2026-11-03:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-03:',e.message)}
