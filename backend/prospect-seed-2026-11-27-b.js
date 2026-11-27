// DUIT — 2026-11-27. Empresas e emails profissionais verificados em fontes públicas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Agro121",
    "sector": "Equipamentos agrícolas",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Beja",
    "website": "https://www.agro121.com/",
    "email": "geral@agro121.pt",
    "phone": "",
    "source": "https://www.agro121.com/contactos",
    "instagram": "",
    "observation": "Atividade de equipamentos agrícolas e contacto profissional publicados na fonte indicada.",
    "opportunity": "catálogo de equipamentos agrícolas.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.agro121.com/contactos"
  },
  {
    "company": "Chave Clínica",
    "sector": "Clínica de saúde",
    "email_area": "Saúde",
    "location": "Chaves, Vila Real",
    "website": "https://chaveclinica.pt/",
    "email": "geral@chaveclinica.pt",
    "phone": "936215672",
    "source": "https://chaveclinica.pt/contactos/",
    "instagram": "",
    "observation": "Atividade de clínica de saúde e contacto profissional publicados na fonte indicada.",
    "opportunity": "materiais informativos de consultas.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://chaveclinica.pt/contactos/"
  },
  {
    "company": "Chaves Saúde",
    "sector": "Desenvolvimento e reabilitação",
    "email_area": "Fisioterapia",
    "location": "Chaves, Vila Real",
    "website": "https://chaves-saude.pt/",
    "email": "geral@chaves-saude.com",
    "phone": "",
    "source": "https://chaves-saude.pt/contactos/",
    "instagram": "",
    "observation": "Atividade de desenvolvimento e reabilitação e contacto profissional publicados na fonte indicada.",
    "opportunity": "divulgação dos serviços de reabilitação.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://chaves-saude.pt/contactos/"
  },
  {
    "company": "Custódio Martins Transportes",
    "sector": "Transporte de mercadorias",
    "email_area": "Transportes & Logística",
    "location": "Santarém",
    "website": "https://www.custodiomartinstransportes.com/",
    "email": "geral@custodiomartinstransportes.com",
    "phone": "",
    "source": "https://www.custodiomartinstransportes.com/",
    "instagram": "",
    "observation": "Atividade de transporte de mercadorias e contacto profissional publicados na fonte indicada.",
    "opportunity": "apresentação comercial de transporte.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.custodiomartinstransportes.com/"
  },
  {
    "company": "Transportes Fátima Brígida",
    "sector": "Transporte rodoviário",
    "email_area": "Transportes & Logística",
    "location": "Amiais de Baixo, Santarém",
    "website": "https://fatimabrigida.com/",
    "email": "geral@fatimabrigida.com",
    "phone": "",
    "source": "https://fatimabrigida.com/",
    "instagram": "",
    "observation": "Atividade de transporte rodoviário e contacto profissional publicados na fonte indicada.",
    "opportunity": "apresentação gráfica da frota e serviços.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://fatimabrigida.com/"
  },
  {
    "company": "FPRM",
    "sector": "Logística",
    "email_area": "Transportes & Logística",
    "location": "Rio Maior, Santarém",
    "website": "https://fprmlogistica.pt/",
    "email": "geral@fprmlogistica.pt",
    "phone": "",
    "source": "https://fprmlogistica.pt/pt/contactos",
    "instagram": "",
    "observation": "Atividade de logística e contacto profissional publicados na fonte indicada.",
    "opportunity": "materiais comerciais de transporte urgente.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://fprmlogistica.pt/pt/contactos"
  },
  {
    "company": "Clínica Rica Saúde",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Chaves, Vila Real",
    "website": "",
    "email": "geral@clinicaricasaude.pt",
    "phone": "",
    "source": "https://sfj.pt/assistencia-medica/hospitais-e-clinicas/clinica-rica-saude/",
    "instagram": "",
    "observation": "Atividade de fisioterapia e contacto profissional publicados na fonte indicada.",
    "opportunity": "materiais informativos de fisioterapia.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://sfj.pt/assistencia-medica/hospitais-e-clinicas/clinica-rica-saude/"
  },
  {
    "company": "Revolution Fitness",
    "sector": "Ginásio",
    "email_area": "Desporto & Fitness",
    "location": "Buarcos, Figueira da Foz, Coimbra",
    "website": "https://revolutionfitness.pt/",
    "email": "geral@revolutionfitness.pt",
    "phone": "936154598",
    "source": "https://revolutionfitness.pt/contactos/",
    "instagram": "",
    "observation": "Atividade de ginásio e contacto profissional publicados na fonte indicada.",
    "opportunity": "materiais promocionais de modalidades.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://revolutionfitness.pt/contactos/"
  },
  {
    "company": "Banix Automóveis",
    "sector": "Comércio automóvel",
    "email_area": "Automóvel",
    "location": "Torres Vedras, Lisboa",
    "website": "https://banix.pt/",
    "email": "geral@banix.pt",
    "phone": "",
    "source": "https://banix.pt/contact-us/",
    "instagram": "",
    "observation": "Atividade de comércio automóvel e contacto profissional publicados na fonte indicada.",
    "opportunity": "apresentação comercial de viaturas.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://banix.pt/contact-us/"
  },
  {
    "company": "Granmotor",
    "sector": "Peças automóveis",
    "email_area": "Automóvel",
    "location": "Torres Vedras, Lisboa",
    "website": "https://www.granmotor.pt/",
    "email": "geral@granmotor.pt",
    "phone": "",
    "source": "https://www.granmotor.pt/nossas-lojas/",
    "instagram": "",
    "observation": "Atividade de peças automóveis e contacto profissional publicados na fonte indicada.",
    "opportunity": "catálogo de peças e comunicação das lojas.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.granmotor.pt/nossas-lojas/"
  },
  {
    "company": "OesteDrive",
    "sector": "Stand automóvel",
    "email_area": "Automóvel",
    "location": "Torres Vedras, Lisboa",
    "website": "https://www.oestedrive.pt/",
    "email": "geral@oestedrive.pt",
    "phone": "",
    "source": "https://www.oestedrive.pt/pagina/contactos/2219",
    "instagram": "",
    "observation": "Atividade de stand automóvel e contacto profissional publicados na fonte indicada.",
    "opportunity": "materiais promocionais de viaturas.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.oestedrive.pt/pagina/contactos/2219"
  },
  {
    "company": "GDAuto",
    "sector": "Oficina automóvel",
    "email_area": "Automóvel",
    "location": "Torres Vedras, Lisboa",
    "website": "https://gdauto.pt/",
    "email": "geral@gdauto.pt",
    "phone": "",
    "source": "https://gdauto.pt/contactos/",
    "instagram": "",
    "observation": "Atividade de oficina automóvel e contacto profissional publicados na fonte indicada.",
    "opportunity": "divulgação dos serviços de oficina.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://gdauto.pt/contactos/"
  },
  {
    "company": "Arenescar",
    "sector": "Comércio e reparação automóvel",
    "email_area": "Automóvel",
    "location": "Torres Vedras, Lisboa",
    "website": "https://www.arenescar.pt/",
    "email": "geral@arenescar.pt",
    "phone": "",
    "source": "https://www.arenescar.pt/contacts",
    "instagram": "",
    "observation": "Atividade de comércio e reparação automóvel e contacto profissional publicados na fonte indicada.",
    "opportunity": "materiais comerciais de reparação automóvel.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.arenescar.pt/contacts"
  },
  {
    "company": "Pinhalfer",
    "sector": "Caixilharias e serralharia",
    "email_area": "Indústria & Produção",
    "location": "Proença-a-Nova, Castelo Branco",
    "website": "https://pinhalfer.pt/",
    "email": "geral@pinhalfer.pt",
    "phone": "",
    "source": "https://pinhalfer.pt/",
    "instagram": "",
    "observation": "Atividade de caixilharias e serralharia e contacto profissional publicados na fonte indicada.",
    "opportunity": "portefólio de caixilharias e estruturas.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://pinhalfer.pt/"
  },
  {
    "company": "VetAl",
    "sector": "Serviços veterinários",
    "email_area": "Saúde",
    "location": "Portalegre",
    "website": "https://vetal.pt/",
    "email": "geral@vetal.pt",
    "phone": "",
    "source": "https://vetal.pt/",
    "instagram": "",
    "observation": "Atividade de serviços veterinários e contacto profissional publicados na fonte indicada.",
    "opportunity": "materiais informativos dos serviços veterinários.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://vetal.pt/"
  },
  {
    "company": "NaTour Way",
    "sector": "Animação turística",
    "email_area": "Aventura",
    "location": "Canelas, Arouca, Aveiro",
    "website": "https://natourway.com/",
    "email": "geral@natourway.com",
    "phone": "913158062",
    "source": "https://natourway.com/natour-way/",
    "instagram": "",
    "observation": "Atividade de animação turística e contacto profissional publicados na fonte indicada.",
    "opportunity": "catálogo de tours e experiências.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://natourway.com/natour-way/"
  },
  {
    "company": "Nature 4",
    "sector": "Animação turística",
    "email_area": "Aventura",
    "location": "Arcos de Valdevez, Viana do Castelo",
    "website": "https://nature4.pt/",
    "email": "geral@nature4.pt",
    "phone": "",
    "source": "https://nature4.pt/pt",
    "instagram": "",
    "observation": "Atividade de animação turística e contacto profissional publicados na fonte indicada.",
    "opportunity": "materiais promocionais de experiências de natureza.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://nature4.pt/pt"
  },
  {
    "company": "Arena Fitness",
    "sector": "Ginásio",
    "email_area": "Desporto & Fitness",
    "location": "Tavarede, Figueira da Foz, Coimbra",
    "website": "https://promo.arenafitnessclub.pt/",
    "email": "geral@arenafitness.pt",
    "phone": "",
    "source": "https://promo.arenafitnessclub.pt/politica-de-privacidade/",
    "instagram": "",
    "observation": "Atividade de ginásio e contacto profissional publicados na fonte indicada.",
    "opportunity": "materiais de comunicação do ginásio.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://promo.arenafitnessclub.pt/politica-de-privacidade/"
  },
  {
    "company": "KUBU Fitness",
    "sector": "Ginásio",
    "email_area": "Desporto & Fitness",
    "location": "Tavarede, Figueira da Foz, Coimbra",
    "website": "",
    "email": "geral@kubu.pt",
    "phone": "",
    "source": "https://www.fitness4all.pt/ginasios/kubu-fitness-figueira-da-foz/",
    "instagram": "",
    "observation": "Atividade de ginásio e contacto profissional publicados na fonte indicada.",
    "opportunity": "divulgação de treino acompanhado.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.fitness4all.pt/ginasios/kubu-fitness-figueira-da-foz/"
  },
  {
    "company": "Carpintaria Mateus",
    "sector": "Carpintaria",
    "email_area": "Indústria & Produção",
    "location": "Barco, Covilhã, Castelo Branco",
    "website": "",
    "email": "geral@carpintariamateus.com",
    "phone": "",
    "source": "https://contribuinte.pt/nif/504153846/carpintaria-mateus-lda",
    "instagram": "",
    "observation": "Atividade de carpintaria e contacto profissional publicados na fonte indicada.",
    "opportunity": "apresentação de trabalhos de carpintaria.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://contribuinte.pt/nif/504153846/carpintaria-mateus-lda"
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'',x.instagram||'',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-27).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-27:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-27:',e.message)}
