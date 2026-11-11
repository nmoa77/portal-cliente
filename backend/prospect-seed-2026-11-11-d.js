// DUIT — Portugal continental, 2026-11-11-d. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Abel Luís Nogueiro & Irmãos, Lda.",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Bragança, Bragança",
    "website": "https://alnconstrucoes.com/",
    "email": "geral@alnconstrucoes.com",
    "phone": "273326827",
    "source": "https://ruis.aiccopn.pt/empresas/abel-luis-nogueiro-irmaos-lda/",
    "observation": "Empresa de construção de edifícios públicos e privados.",
    "opportunity": "Portefólio de intervenções e serviços.",
    "service": "design"
  },
  {
    "company": "Bridgepoint",
    "sector": "Engenharia de sistemas",
    "email_area": "Tecnologia & Digital",
    "location": "Évora, Évora",
    "website": "https://www.bridgepoint.pt/",
    "email": "geral@bridgepoint.pt",
    "phone": "210963802",
    "source": "https://www.bridgepoint.pt/wordpress/contact-us/",
    "observation": "Engenharia de sistemas de teste, medida e visão artificial.",
    "opportunity": "Brochura técnica das soluções de engenharia.",
    "service": "design"
  },
  {
    "company": "Clínica Rui Faria",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Leiria, Leiria",
    "website": "https://clinicaruifaria.pt/",
    "email": "info@clinicaruifaria.pt",
    "phone": "244827685",
    "source": "https://clinicaruifaria.pt/contactos/",
    "observation": "Clínica com unidades em Leiria, Santarém, Aveiro e Torres Novas.",
    "opportunity": "Materiais informativos das áreas clínicas.",
    "service": "design"
  },
  {
    "company": "Carpintaria Moreira",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Oleirinhos, Bragança",
    "website": "https://moreiracarpintaria.pt/",
    "email": "geral@moreiracarpintaria.pt",
    "phone": "273322662",
    "source": "https://moreiracarpintaria.pt/",
    "observation": "Empresa de carpintaria em Oleirinhos.",
    "opportunity": "Catálogo de trabalhos em madeira.",
    "service": "design"
  },
  {
    "company": "Ativefit",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "São Romão, Leiria",
    "website": "https://ativefit.pt/",
    "email": "geral@ativefit.pt",
    "phone": "916408702",
    "source": "https://ativefit.pt/contactos/",
    "observation": "Centro de fisioterapia e bem-estar em Leiria.",
    "opportunity": "Materiais de apresentação das especialidades.",
    "service": "design"
  },
  {
    "company": "Metalviçosa – Fabricação de Máquinas Industriais, Lda.",
    "sector": "Fabricação de máquinas industriais",
    "email_area": "Indústria & Produção",
    "location": "Alandroal, Évora",
    "website": "https://metalvicosa.com/",
    "email": "geral@metalvicosa.com",
    "phone": "268431104",
    "source": "https://ruis.aiccopn.pt/empresas/metalvicosa-fabricacao-de-maquinas-industriais-lda/",
    "observation": "Empresa de fabrico de máquinas industriais e serralharia.",
    "opportunity": "Catálogo técnico de equipamentos e serviços.",
    "service": "design"
  },
  {
    "company": "Blackbird, Unipessoal Lda.",
    "sector": "Consultoria empresarial",
    "email_area": "Serviços Profissionais",
    "location": "Évora, Évora",
    "website": "https://blackbird.pt/",
    "email": "geral@blackbird.pt",
    "phone": "917618559",
    "source": "https://blackbird.pt/contactos/",
    "observation": "Consultoria de gestão e projetos com sede em Évora.",
    "opportunity": "Apresentação comercial de serviços de consultoria.",
    "service": "design"
  },
  {
    "company": "CEPOMEL",
    "sector": "Clínica médica e fisioterapia",
    "email_area": "Saúde",
    "location": "Leiria, Leiria",
    "website": "https://cepomel.com/",
    "email": "info@cepomel.com",
    "phone": "244828098",
    "source": "https://www.cepomel.com/contactos.php",
    "observation": "Clínica médica com fisioterapia e estética em Leiria.",
    "opportunity": "Peças informativas de especialidades clínicas.",
    "service": "design"
  },
  {
    "company": "Premetal",
    "sector": "Metalomecânica agropecuária",
    "email_area": "Indústria & Produção",
    "location": "Évora, Évora",
    "website": "https://premetal.pt/",
    "email": "geral@premetal.pt",
    "phone": "266760090",
    "source": "https://premetal.pt/contactos/",
    "observation": "Empresa de metalomecânica especializada no setor agropecuário.",
    "opportunity": "Catálogo gráfico de produtos metalomecânicos.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-11-d).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-11-d:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-11-d:',e.message)}
