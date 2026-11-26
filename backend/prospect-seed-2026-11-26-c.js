// DUIT — 2026-11-26. Empresas e emails profissionais verificados em fontes públicas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Conta G",
    "sector": "Contabilidade e seguros",
    "email_area": "Serviços Profissionais",
    "location": "Mirandela, Bragança",
    "website": "https://contag.pt/",
    "email": "geral@contag.pt",
    "phone": "278263432",
    "source": "https://contag.pt/",
    "instagram": "",
    "observation": "Atividade de contabilidade e seguros e contacto profissional publicados na fonte.",
    "opportunity": "apresentação comercial de seguros.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email publicado em https://contag.pt/"
  },
  {
    "company": "DTD Automatismos",
    "sector": "Portas e automatismos",
    "email_area": "Construção & Engenharia",
    "location": "Viana do Castelo",
    "website": "https://www.dtdautomatismos.pt/",
    "email": "geral@dtdautomatismos.pt",
    "phone": "258820059",
    "source": "https://www.dtdautomatismos.pt/contactos",
    "instagram": "",
    "observation": "Atividade de portas e automatismos e contacto profissional publicados na fonte.",
    "opportunity": "catálogo de automatismos.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email publicado em https://www.dtdautomatismos.pt/contactos"
  },
  {
    "company": "Armazéns do Lima",
    "sector": "Comércio de metais",
    "email_area": "Comércio & Retalho",
    "location": "Ponte de Lima, Viana do Castelo",
    "website": "https://armazensdolima.pt/",
    "email": "geral@armazensdolima.pt",
    "phone": "258909120",
    "source": "https://armazensdolima.pt/contactos/",
    "instagram": "",
    "observation": "Atividade de comércio de metais e contacto profissional publicados na fonte.",
    "opportunity": "catálogo de produtos metálicos.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email publicado em https://armazensdolima.pt/contactos/"
  },
  {
    "company": "TNF",
    "sector": "Contabilidade",
    "email_area": "Serviços Profissionais",
    "location": "Mirandela, Bragança",
    "website": "https://tnf.pt/",
    "email": "geral@tnf.pt",
    "phone": "914414777",
    "source": "https://tnf.pt/contactos/",
    "instagram": "",
    "observation": "Atividade de contabilidade e contacto profissional publicados na fonte.",
    "opportunity": "apresentação dos serviços contabilísticos.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email publicado em https://tnf.pt/contactos/"
  },
  {
    "company": "Rencad",
    "sector": "Construção e montagens elétricas",
    "email_area": "Construção & Engenharia",
    "location": "Lanheses, Viana do Castelo",
    "website": "https://www.rencad.pt/",
    "email": "geral@rencad.pt",
    "phone": "258847243",
    "source": "https://www.rencad.pt/contactos",
    "instagram": "",
    "observation": "Atividade de construção e montagens elétricas e contacto profissional publicados na fonte.",
    "opportunity": "portefólio de montagens.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email publicado em https://www.rencad.pt/contactos"
  },
  {
    "company": "Artur Pais",
    "sector": "Serralharia de alumínio",
    "email_area": "Indústria & Produção",
    "location": "Ponte de Lima, Viana do Castelo",
    "website": "https://www.arturpais.pt/",
    "email": "geral@arturpais.pt",
    "phone": "965253775",
    "source": "https://www.arturpais.pt/contactos/",
    "instagram": "",
    "observation": "Atividade de serralharia de alumínio e contacto profissional publicados na fonte.",
    "opportunity": "catálogo de soluções em alumínio.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email publicado em https://www.arturpais.pt/contactos/"
  },
  {
    "company": "UtilJardim",
    "sector": "Equipamentos de jardinagem",
    "email_area": "Comércio & Retalho",
    "location": "Loulé, Faro",
    "website": "https://www.utiljardim.pt/",
    "email": "geral@utiljardim.pt",
    "phone": "289098915",
    "source": "https://www.utiljardim.pt/",
    "instagram": "",
    "observation": "Atividade de equipamentos de jardinagem e contacto profissional publicados na fonte.",
    "opportunity": "catálogo de equipamentos.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email publicado em https://www.utiljardim.pt/"
  },
  {
    "company": "Namaste Jardins",
    "sector": "Jardinagem e paisagismo",
    "email_area": "Serviços Profissionais",
    "location": "Algarve, Faro",
    "website": "https://www.namastejardins.pt/",
    "email": "geral@namastejardins.pt",
    "phone": "938474378",
    "source": "https://www.namastejardins.pt/",
    "instagram": "",
    "observation": "Atividade de jardinagem e paisagismo e contacto profissional publicados na fonte.",
    "opportunity": "portefólio de jardins.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email publicado em https://www.namastejardins.pt/"
  },
  {
    "company": "Jorge Sousa Construções",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Ponte de Lima, Viana do Castelo",
    "website": "",
    "email": "geral@jsconstrucoes.pt",
    "phone": "258741624",
    "source": "https://ruis.aiccopn.pt/empresas/jorge-sousa-construcoes-lda/",
    "instagram": "",
    "observation": "Atividade de construção civil e contacto profissional publicados na fonte.",
    "opportunity": "portefólio de obras.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email publicado em https://ruis.aiccopn.pt/empresas/jorge-sousa-construcoes-lda/"
  },
  {
    "company": "Serralharia Inovadora",
    "sector": "Serralharia",
    "email_area": "Indústria & Produção",
    "location": "Bragança",
    "website": "https://serralhariainovadora.pt/",
    "email": "geral@serralhariainovadora.pt",
    "phone": "273381071",
    "source": "https://serralhariainovadora.pt/",
    "instagram": "",
    "observation": "Atividade de serralharia e contacto profissional publicados na fonte.",
    "opportunity": "apresentação gráfica de portas e portões.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email publicado em https://serralhariainovadora.pt/"
  },
  {
    "company": "Wisekey",
    "sector": "Contabilidade",
    "email_area": "Serviços Profissionais",
    "location": "Bragança",
    "website": "https://wkey.pt/",
    "email": "geral@wkey.pt",
    "phone": "273310371",
    "source": "https://wkey.pt/contabilidade",
    "instagram": "",
    "observation": "Atividade de contabilidade e contacto profissional publicados na fonte.",
    "opportunity": "apresentação dos serviços financeiros.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email publicado em https://wkey.pt/contabilidade"
  },
  {
    "company": "Floral do Algarve",
    "sector": "Centro de jardinagem",
    "email_area": "Comércio & Retalho",
    "location": "Faro",
    "website": "https://floraldoalgarve.pt/",
    "email": "geral@floraldoalgarve.pt",
    "phone": "289816028",
    "source": "https://floraldoalgarve.pt/contactos.htm",
    "instagram": "",
    "observation": "Atividade de centro de jardinagem e contacto profissional publicados na fonte.",
    "opportunity": "materiais promocionais de jardinagem.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email publicado em https://floraldoalgarve.pt/contactos.htm"
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'',x.instagram||'',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-26).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-26:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-26:',e.message)}
