// DUIT — Portugal continental, 2026-11-05 (continuação da quinta execução). Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Consulset",
    "sector": "Consultoria e serviços empresariais",
    "email_area": "Serviços Profissionais",
    "location": "Setúbal, Setúbal",
    "website": "https://consulset.pt/",
    "email": "geral@consulset.pt",
    "phone": "265 528 240",
    "source": "https://consulset.pt/contactos/",
    "observation": "Empresa de consultoria com sede em Setúbal e delegações em Coimbra e Castelo Branco.",
    "opportunity": "Criar materiais institucionais e apresentações de serviços para apoio comercial.",
    "service": "design"
  },
  {
    "company": "KMP Equipamentos e Serviços",
    "sector": "Equipamentos e serviços técnicos",
    "email_area": "Indústria & Produção",
    "location": "Torres Vedras, Lisboa",
    "website": "https://kmp.pt/",
    "email": "geral@kmp.pt",
    "phone": "261 404 740",
    "source": "https://kmp.pt/contactos/",
    "observation": "Empresa de equipamentos e serviços sediada em Torres Vedras.",
    "opportunity": "Criar fichas de equipamentos e materiais comerciais para apoio a vendas.",
    "service": "design"
  },
  {
    "company": "J.A. Patrocínio",
    "sector": "Contabilidade, fiscalidade e gestão",
    "email_area": "Serviços Profissionais",
    "location": "Torres Vedras, Lisboa",
    "website": "https://japatrocinio.pt/",
    "email": "geral@japatrocinio.pt",
    "phone": "261 325 990",
    "source": "https://japatrocinio.pt/contactos/",
    "observation": "Empresa de contabilidade, consultoria fiscal, financeira e de gestão com mais de 25 anos.",
    "opportunity": "Criar materiais institucionais para apresentar serviços e áreas de apoio empresarial.",
    "service": "design"
  },
  {
    "company": "Marserra Alimentar",
    "sector": "Transformação e comercialização de congelados",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Oliveira do Hospital, Coimbra",
    "website": "https://www.marserra.pt/",
    "email": "geral@marserra.pt",
    "phone": "238 605 841",
    "source": "https://www.marserra.pt/contactos/",
    "observation": "Empresa de transformação e comercialização de produtos congelados e ultracongelados.",
    "opportunity": "Criar materiais de produto, catálogo e comunicação comercial B2B.",
    "service": "design"
  },
  {
    "company": "Centro Diagnóstico e Tratamento de Tomar",
    "sector": "Saúde e diagnóstico",
    "email_area": "Saúde",
    "location": "Tomar, Santarém",
    "website": "https://cdtonline.pt/",
    "email": "geral@cdtonline.pt",
    "phone": "249 329 030",
    "source": "https://cdtonline.pt/contactos/",
    "observation": "Centro de diagnóstico e tratamento sediado em Tomar.",
    "opportunity": "Criar materiais informativos sobre serviços, especialidades e percursos de atendimento.",
    "service": "design"
  },
  {
    "company": "Aluvedras",
    "sector": "Alumínios e soluções para construção",
    "email_area": "Construção & Engenharia",
    "location": "Torres Vedras, Lisboa",
    "website": "https://aluvedras.pt/",
    "email": "geral@aluvedras.pt",
    "phone": "261 322 604",
    "source": "https://aluvedras.pt/contact-us/",
    "observation": "Empresa sediada na Zona Industrial do Paúl, Torres Vedras, com atividade em soluções de alumínio.",
    "opportunity": "Criar materiais de apresentação de soluções, acabamentos e projetos.",
    "service": "design"
  },
  {
    "company": "Inalva",
    "sector": "Agência de viagens e turismo",
    "email_area": "Turismo & Alojamento",
    "location": "Torres Vedras, Lisboa",
    "website": "https://inalva.pt/",
    "email": "geral@inalva.pt",
    "phone": "261 314 859",
    "source": "https://inalva.pt/contactos/",
    "observation": "Agência de viagens sediada em Torres Vedras com atendimento a clientes em Portugal e no estrangeiro.",
    "opportunity": "Criar peças de campanha e materiais visuais para destinos e experiências.",
    "service": "ambas"
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-05).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');
  added++;
 }})();
 console.log('[crm] seed 2026-11-05-f:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-05-f:',e.message)}
