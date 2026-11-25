// DUIT — 2026-11-25. Empresas e emails profissionais verificados em fontes públicas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "D&B Sideral",
    "sector": "Soldadura e serralharia",
    "email_area": "Indústria & Produção",
    "location": "Marinha Grande, Leiria",
    "website": "https://dbsideral.pt/",
    "email": "geral.sideralequacao@dbsideral.pt",
    "phone": "910478129",
    "source": "https://dbsideral.pt/",
    "instagram": "",
    "observation": "Atividade de soldadura e serralharia identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "apresentação de serviços industriais.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://dbsideral.pt/"
  },
  {
    "company": "Mundie Tec",
    "sector": "Manutenção industrial",
    "email_area": "Indústria & Produção",
    "location": "Marinha Grande, Leiria",
    "website": "https://mundie.pt/",
    "email": "geral@mundie.pt",
    "phone": "244102860",
    "source": "https://mundie.pt/contactos/",
    "instagram": "",
    "observation": "Atividade de manutenção industrial identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "catálogo de assistência técnica.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://mundie.pt/contactos/"
  },
  {
    "company": "DG Metal",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Vieira de Leiria, Leiria",
    "website": "https://dgmetalomecanica.pt/",
    "email": "geral@dgmetalomecanica.pt",
    "phone": "910748852",
    "source": "https://dgmetalomecanica.pt/",
    "instagram": "",
    "observation": "Atividade de metalomecânica identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "portefólio de soldadura e montagem.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://dgmetalomecanica.pt/"
  },
  {
    "company": "DNC Técnica",
    "sector": "Manutenção industrial",
    "email_area": "Indústria & Produção",
    "location": "Regueira de Pontes, Leiria",
    "website": "https://www.dnctecnica.com",
    "email": "comercial@dnctecnica.com",
    "phone": "917231901",
    "source": "https://www.aneme.pt/site/wp-content/uploads/2025/12/boletim_249.pdf",
    "instagram": "",
    "observation": "Atividade de manutenção industrial identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "apresentação comercial de equipamentos.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.aneme.pt/site/wp-content/uploads/2025/12/boletim_249.pdf"
  },
  {
    "company": "CODI",
    "sector": "Desenvolvimento de produto",
    "email_area": "Indústria & Produção",
    "location": "Andrinos, Leiria",
    "website": "https://www.codi.pt",
    "email": "comercial@codi.pt",
    "phone": "244555120",
    "source": "https://www.vejaportugal.pt/wp-content/uploads/2025/11/Revista-Veja-Portugal-%E2%80%93-MOLDPLAS-%E2%80%93-Edicao-2025.pdf",
    "instagram": "",
    "observation": "Atividade de desenvolvimento de produto identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "catálogo de soluções de impressão 3D.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.vejaportugal.pt/wp-content/uploads/2025/11/Revista-Veja-Portugal-%E2%80%93-MOLDPLAS-%E2%80%93-Edicao-2025.pdf"
  },
  {
    "company": "Physios",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Vila Real",
    "website": "https://physios.pt/",
    "email": "geral@physios.pt",
    "phone": "927118772",
    "source": "https://physios.pt/contactos/",
    "instagram": "",
    "observation": "Atividade de fisioterapia identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "materiais informativos sobre fisioterapia.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://physios.pt/contactos/"
  },
  {
    "company": "Fisimagna",
    "sector": "Reabilitação física",
    "email_area": "Fisioterapia",
    "location": "Vila Real",
    "website": "https://fisimagna.com/",
    "email": "geral@fisimagna.com",
    "phone": "259373199",
    "source": "https://fisimagna.com/",
    "instagram": "",
    "observation": "Atividade de reabilitação física identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "comunicação visual dos serviços de reabilitação.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://fisimagna.com/"
  },
  {
    "company": "Montes de Saúde",
    "sector": "Clínica médica",
    "email_area": "Saúde",
    "location": "Bragança",
    "website": "https://montes-saude.pt/",
    "email": "geral@montes-saude.pt",
    "phone": "273332130",
    "source": "https://montes-saude.pt/contactos/",
    "instagram": "",
    "observation": "Atividade de clínica médica identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "materiais informativos para utentes.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://montes-saude.pt/contactos/"
  },
  {
    "company": "Pelvita",
    "sector": "Fisioterapia pélvica",
    "email_area": "Fisioterapia",
    "location": "Bragança",
    "website": "https://www.pelvita.pt/",
    "email": "geral@pelvita.pt",
    "phone": "964794204",
    "source": "https://www.pelvita.pt/",
    "instagram": "",
    "observation": "Atividade de fisioterapia pélvica identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "conteúdos educativos sobre fisioterapia pélvica.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.pelvita.pt/"
  },
  {
    "company": "Handcare Clínica",
    "sector": "Fisioterapia avançada",
    "email_area": "Fisioterapia",
    "location": "Vila Real",
    "website": "https://www.handcare.pt/",
    "email": "geral@handcare.pt",
    "phone": "",
    "source": "https://www.handcare.pt/",
    "instagram": "",
    "observation": "Atividade de fisioterapia avançada identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "apresentação visual das terapias e recuperação pós-operatória.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.handcare.pt/"
  },
  {
    "company": "Movimola",
    "sector": "Oficina móvel",
    "email_area": "Automóvel",
    "location": "Évora",
    "website": "https://www.movimola.pt/",
    "email": "geral@movimola.pt",
    "phone": "963470213",
    "source": "https://www.movimola.pt/contactos",
    "instagram": "",
    "observation": "Atividade de oficina móvel identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "materiais comerciais para serviços mecânicos.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.movimola.pt/contactos"
  },
  {
    "company": "Quinta dos Carvalhos",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Castelo Branco",
    "website": "http://quintadoscarvalhos.net/pt/",
    "email": "reservas@quintadoscarvalhos.net",
    "phone": "912753256",
    "source": "https://www.cm-castelobranco.pt/visitante/descanse-no-nosso-concelho/turismo-espaco-rural/",
    "instagram": "",
    "observation": "Atividade de turismo rural identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "promoção visual de estadias.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.cm-castelobranco.pt/visitante/descanse-no-nosso-concelho/turismo-espaco-rural/"
  },
  {
    "company": "Xisto Sentido",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Almaceda, Castelo Branco",
    "website": "http://www.xistosentido.pt",
    "email": "info@xistosentido.pt",
    "phone": "964659714",
    "source": "https://www.cm-castelobranco.pt/visitante/descanse-no-nosso-concelho/turismo-espaco-rural/",
    "instagram": "",
    "observation": "Atividade de turismo rural identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "promoção gráfica de experiências rurais.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.cm-castelobranco.pt/visitante/descanse-no-nosso-concelho/turismo-espaco-rural/"
  },
  {
    "company": "Quinta da Vineadouro",
    "sector": "Circuitos turísticos",
    "email_area": "Turismo & Alojamento",
    "location": "Numão, Guarda",
    "website": "http://www.vineadouro.com",
    "email": "geral@vineadouro.com",
    "phone": "912007287",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/guarda",
    "instagram": "https://www.instagram.com/quintadavineadouro/",
    "observation": "Atividade de circuitos turísticos identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "divulgação de experiências na quinta.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.visitportugal.com/pt-pt/regioes-e-localidades/guarda"
  },
  {
    "company": "Viseu Executive Hotel",
    "sector": "Hotelaria",
    "email_area": "Turismo & Alojamento",
    "location": "Viseu",
    "website": "https://viseuexecutivehotel.pt/",
    "email": "geral@viseuexecutivehotel.pt",
    "phone": "232246060",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/viseu",
    "instagram": "",
    "observation": "Atividade de hotelaria identificada na fonte indicada, com contacto profissional publicado.",
    "opportunity": "materiais promocionais de alojamento.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional publicado em https://www.visitportugal.com/pt-pt/regioes-e-localidades/viseu"
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'',x.instagram||'',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-25).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-25:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-25:',e.message)}
