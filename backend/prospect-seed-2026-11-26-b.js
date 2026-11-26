// DUIT — 2026-11-26. Empresas e emails profissionais verificados em fontes públicas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "MR Clinic",
    "sector": "Dentistas",
    "email_area": "Dentistas",
    "location": "Tomar, Santarém",
    "website": "https://www.mrclinic.pt/",
    "email": "geral@mrclinic.pt",
    "phone": "249098143",
    "source": "https://www.mrclinic.pt/",
    "instagram": "",
    "observation": "Contacto profissional e atividade publicados na fonte indicada.",
    "opportunity": "divulgação das consultas nas duas clínicas.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.mrclinic.pt/"
  },
  {
    "company": "Pedro Pombo",
    "sector": "Dentistas",
    "email_area": "Dentistas",
    "location": "Tomar, Santarém",
    "website": "https://clinicapedropombo.pt/",
    "email": "geral@clinicapedropombo.pt",
    "phone": "249323378",
    "source": "https://clinicapedropombo.pt/",
    "instagram": "",
    "observation": "Contacto profissional e atividade publicados na fonte indicada.",
    "opportunity": "materiais informativos de implantologia e ortodontia.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://clinicapedropombo.pt/"
  },
  {
    "company": "Boca a Boca",
    "sector": "Dentistas",
    "email_area": "Dentistas",
    "location": "Tomar, Santarém",
    "website": "https://bocaaboca.pt/",
    "email": "geral@bocaaboca.pt",
    "phone": "249324876",
    "source": "https://bocaaboca.pt/",
    "instagram": "",
    "observation": "Contacto profissional e atividade publicados na fonte indicada.",
    "opportunity": "divulgação das consultas.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://bocaaboca.pt/"
  },
  {
    "company": "Serralharia Cardielos",
    "sector": "Indústria & Produção",
    "email_area": "Indústria & Produção",
    "location": "Cardielos, Viana do Castelo",
    "website": "https://www.serralhariacardielos.pt/",
    "email": "geral@serralhariacardielos.pt",
    "phone": "936112811",
    "source": "https://www.serralhariacardielos.pt/contactos/",
    "instagram": "",
    "observation": "Contacto profissional e atividade publicados na fonte indicada.",
    "opportunity": "portefólio de trabalhos em metal.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.serralhariacardielos.pt/contactos/"
  },
  {
    "company": "Pombalog",
    "sector": "Transportes & Logística",
    "email_area": "Transportes & Logística",
    "location": "Pombal, Leiria",
    "website": "https://www.pombalog.pt/",
    "email": "geral@pombalog.pt",
    "phone": "236214408",
    "source": "https://www.pombalog.pt/",
    "instagram": "",
    "observation": "Contacto profissional e atividade publicados na fonte indicada.",
    "opportunity": "apresentação comercial de serviços transitários.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.pombalog.pt/"
  },
  {
    "company": "Selmape",
    "sector": "Transportes & Logística",
    "email_area": "Transportes & Logística",
    "location": "Moncalva, Pombal, Leiria",
    "website": "https://selmape.pt/",
    "email": "geral@selmape.pt",
    "phone": "236211803",
    "source": "https://selmape.pt/contactos/",
    "instagram": "",
    "observation": "Contacto profissional e atividade publicados na fonte indicada.",
    "opportunity": "apresentação de transporte de grande volume.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://selmape.pt/contactos/"
  },
  {
    "company": "Transportes Manuel Mendes",
    "sector": "Transportes & Logística",
    "email_area": "Transportes & Logística",
    "location": "Vermoil, Pombal, Leiria",
    "website": "https://transportestmm.com/",
    "email": "geral@transportestmm.com",
    "phone": "236942939",
    "source": "https://transportestmm.com/tmm/contactos/",
    "instagram": "",
    "observation": "Contacto profissional e atividade publicados na fonte indicada.",
    "opportunity": "materiais comerciais de transporte.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://transportestmm.com/tmm/contactos/"
  },
  {
    "company": "Irmãos Vasconcelos",
    "sector": "Construção & Engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Bela, Monção, Viana do Castelo",
    "website": "",
    "email": "geral@irmaosvasconcelos.com",
    "phone": "251653049",
    "source": "https://ruis.aiccopn.pt/empresas/irmaos-vasconcelos-construcoes-lda/",
    "instagram": "",
    "observation": "Contacto profissional e atividade publicados na fonte indicada.",
    "opportunity": "portefólio de obras e reabilitação.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://ruis.aiccopn.pt/empresas/irmaos-vasconcelos-construcoes-lda/"
  },
  {
    "company": "Clínica Central do Cartaxo",
    "sector": "Dentistas",
    "email_area": "Dentistas",
    "location": "Cartaxo, Santarém",
    "website": "",
    "email": "info@clinicacentralcartaxo.pt",
    "phone": "963202587",
    "source": "https://www.sedacare.pt/en/partnership/",
    "instagram": "",
    "observation": "Contacto profissional e atividade publicados na fonte indicada.",
    "opportunity": "materiais informativos de saúde oral.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.sedacare.pt/en/partnership/"
  },
  {
    "company": "Domus Salutem",
    "sector": "Dentistas",
    "email_area": "Dentistas",
    "location": "Abrantes, Santarém",
    "website": "",
    "email": "rst@clinicadomussalutem.pt",
    "phone": "241333174",
    "source": "https://www.sedacare.pt/en/partnership/",
    "instagram": "",
    "observation": "Contacto profissional e atividade publicados na fonte indicada.",
    "opportunity": "divulgação de consultas médico-dentárias.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.sedacare.pt/en/partnership/"
  },
  {
    "company": "NCN",
    "sector": "Dentistas",
    "email_area": "Dentistas",
    "location": "Alcanena, Santarém",
    "website": "",
    "email": "geral@ncn.pt",
    "phone": "249891386",
    "source": "https://bauendental.pt/onde-estamos/",
    "instagram": "",
    "observation": "Contacto profissional e atividade publicados na fonte indicada.",
    "opportunity": "materiais sobre prevenção e reabilitação oral.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://bauendental.pt/onde-estamos/"
  },
  {
    "company": "Clínica do Milagre",
    "sector": "Dentistas",
    "email_area": "Dentistas",
    "location": "Santarém",
    "website": "",
    "email": "geral@clinicadomilagre.pt",
    "phone": "243322396",
    "source": "https://bauendental.pt/onde-estamos/",
    "instagram": "",
    "observation": "Contacto profissional e atividade publicados na fonte indicada.",
    "opportunity": "divulgação de tratamentos dentários.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://bauendental.pt/onde-estamos/"
  },
  {
    "company": "Cliabum",
    "sector": "Dentistas",
    "email_area": "Dentistas",
    "location": "Ílhavo, Aveiro",
    "website": "",
    "email": "geral@cliabum.pt",
    "phone": "234326439",
    "source": "https://bauendental.pt/onde-estamos/",
    "instagram": "",
    "observation": "Contacto profissional e atividade publicados na fonte indicada.",
    "opportunity": "materiais de comunicação das unidades dentárias.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://bauendental.pt/onde-estamos/"
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
