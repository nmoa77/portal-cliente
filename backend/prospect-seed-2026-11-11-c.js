// DUIT — Portugal continental, 2026-11-11-c. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Sérgio Tapadas Construção Civil",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Évora, Évora",
    "website": "https://sergiotapadas.pt/",
    "email": "geral@sergiotapadas.pt",
    "phone": "967939972",
    "source": "https://sergiotapadas.pt/contactos.php",
    "observation": "PME de construção e remodelações em Évora.",
    "opportunity": "Portefólio de obras e serviços.",
    "service": "design"
  },
  {
    "company": "Fisiohealth",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Faro, Faro",
    "website": "https://fisiohealth.pt/",
    "email": "geral@fisiohealth.pt",
    "phone": "289847877",
    "source": "https://fisiohealth.pt/contato/",
    "observation": "Centro de fisioterapia em Faro.",
    "opportunity": "Materiais informativos das especialidades.",
    "service": "design"
  },
  {
    "company": "EcoTree",
    "sector": "Projetos e construção sustentável",
    "email_area": "Construção & Engenharia",
    "location": "Évora, Évora",
    "website": "https://www.ecotree.pt/",
    "email": "geral@ecotree.pt",
    "phone": "962181697",
    "source": "https://www.ecotree.pt/contactos/",
    "observation": "Empresa de projetos e construção sustentável.",
    "opportunity": "Apresentação visual de projetos sustentáveis.",
    "service": "design"
  },
  {
    "company": "MGETENSÃO",
    "sector": "Instalações elétricas e comunicações",
    "email_area": "Construção & Engenharia",
    "location": "Évora, Évora",
    "website": "https://www.mgetensao.pt/",
    "email": "geral@mgetensao.pt",
    "phone": "266247194",
    "source": "https://www.mgetensao.pt/contatos/",
    "observation": "Projetos, instalações elétricas e comunicações.",
    "opportunity": "Brochura técnica de serviços.",
    "service": "design"
  },
  {
    "company": "Macrofal",
    "sector": "Materiais de construção",
    "email_area": "Comércio & Retalho",
    "location": "Santarém, Santarém",
    "website": "https://macrofal.pt/",
    "email": "santarem@macrofal.pt",
    "phone": "917643467",
    "source": "https://macrofal.pt/contactos/",
    "observation": "Comercialização de materiais de construção em Santarém e Évora.",
    "opportunity": "Catálogo gráfico de produtos.",
    "service": "design"
  },
  {
    "company": "PSIFARO",
    "sector": "Psicologia clínica",
    "email_area": "Saúde Mental",
    "location": "Faro, Faro",
    "website": "https://psifaro.pt/",
    "email": "geral@psifaro.pt",
    "phone": "289075778",
    "source": "https://psifaro.pt/contactos/",
    "observation": "Serviços de psicologia com sede e clínica em Faro.",
    "opportunity": "Materiais informativos sobre consultas.",
    "service": "design"
  },
  {
    "company": "Almojanda 3Olivetree",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Portalegre, Portalegre",
    "website": "https://www.almojanda3olivetree.com/",
    "email": "geral@almojanda3olivetree.com",
    "phone": "963474524",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/portalegre",
    "observation": "Três casas de turismo rural em olival tradicional.",
    "opportunity": "Apresentação gráfica das experiências rurais.",
    "service": "design"
  },
  {
    "company": "Vigias – Casa Gaio",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Carreiras, Portalegre",
    "website": "https://vigias.pt/",
    "email": "geral@vigias.pt",
    "phone": "936721199",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/portalegre",
    "observation": "Turismo rural em Carreiras, Portalegre.",
    "opportunity": "Peças de divulgação do alojamento.",
    "service": "design"
  },
  {
    "company": "Meridiano Pitoresco",
    "sector": "Circuitos turísticos",
    "email_area": "Turismo & Alojamento",
    "location": "Fortios, Portalegre",
    "website": "https://meridiano-pitoresco.pt/",
    "email": "luis.miguel@meridiano-pitoresco.pt",
    "phone": "919674841",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/portalegre",
    "observation": "Circuitos turísticos culturais no Alto Alentejo.",
    "opportunity": "Materiais de divulgação de roteiros.",
    "service": "design"
  },
  {
    "company": "Grupo VCLN Construções",
    "sector": "Construção",
    "email_area": "Construção & Engenharia",
    "location": "Évora, Évora",
    "website": "https://grupovcln.com/",
    "email": "geral@grupovcln.com",
    "phone": "211302610",
    "source": "https://grupovcln.com/pt/contactos",
    "observation": "Empresa de construção sediada em Évora.",
    "opportunity": "Portefólio comercial de projetos.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-11-c).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-11-c:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-11-c:',e.message)}
