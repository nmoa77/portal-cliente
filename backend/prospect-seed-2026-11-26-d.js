// DUIT — 2026-11-26. Empresas e emails profissionais verificados em fontes públicas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Serralharia Júlio Fernandes",
    "sector": "Caixilharia e estruturas metálicas",
    "email_area": "Indústria & Produção",
    "location": "Marrancos, Vila Verde, Braga",
    "website": "https://www.sjf.com.pt/",
    "email": "geral@sjf.com.pt",
    "phone": "253388232",
    "source": "https://www.sjf.com.pt/contactos/",
    "instagram": "",
    "observation": "Empresa de caixilharia e estruturas metálicas com localização e contacto profissional publicados na fonte indicada.",
    "opportunity": "portefólio de caixilharias e estruturas metálicas.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional confirmado em https://www.sjf.com.pt/contactos/"
  },
  {
    "company": "Serralharia Irmãos Fernandes",
    "sector": "Serralharia",
    "email_area": "Indústria & Produção",
    "location": "Amares, Braga",
    "website": "https://www.serralhariairmaosfernandes.com/",
    "email": "geral@serralhariairmaosfernandes.com",
    "phone": "253195757",
    "source": "https://www.serralhariairmaosfernandes.com/",
    "instagram": "",
    "observation": "Empresa de serralharia com localização e contacto profissional publicados na fonte indicada.",
    "opportunity": "apresentação gráfica de trabalhos de serralharia.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional confirmado em https://www.serralhariairmaosfernandes.com/"
  },
  {
    "company": "Fisiobeira",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Fundão, Castelo Branco",
    "website": "https://www.fisiobeira.pt/",
    "email": "geral@fisiobeira.pt",
    "phone": "275773206",
    "source": "https://www.fisiobeira.pt/contactos/",
    "instagram": "",
    "observation": "Empresa de fisioterapia com localização e contacto profissional publicados na fonte indicada.",
    "opportunity": "materiais de divulgação das duas clínicas.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional confirmado em https://www.fisiobeira.pt/contactos/"
  },
  {
    "company": "TLI",
    "sector": "Transportes internacionais",
    "email_area": "Transportes & Logística",
    "location": "Mangualde, Viseu",
    "website": "https://www.tli.com.pt/",
    "email": "geral@tli.com.pt",
    "phone": "232622973",
    "source": "https://www.tli.com.pt/contactos/",
    "instagram": "",
    "observation": "Empresa de transportes internacionais com localização e contacto profissional publicados na fonte indicada.",
    "opportunity": "apresentação de serviços logísticos internacionais.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional confirmado em https://www.tli.com.pt/contactos/"
  },
  {
    "company": "Transportes MEG",
    "sector": "Transportes",
    "email_area": "Transportes & Logística",
    "location": "Tondela, Viseu",
    "website": "https://meg.pt/",
    "email": "geral@meg.pt",
    "phone": "232099542",
    "source": "https://meg.pt/contactos/",
    "instagram": "",
    "observation": "Empresa de transportes com localização e contacto profissional publicados na fonte indicada.",
    "opportunity": "apresentação comercial da empresa familiar de transportes.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional confirmado em https://meg.pt/contactos/"
  },
  {
    "company": "Transportes Lemos",
    "sector": "Transportes",
    "email_area": "Transportes & Logística",
    "location": "Chãs de Tavares, Mangualde, Viseu",
    "website": "https://www.tlemos.pt/",
    "email": "tlemos@tlemos.pt",
    "phone": "232657000",
    "source": "https://www.tlemos.pt/contactos/",
    "instagram": "",
    "observation": "Empresa de transportes com localização e contacto profissional publicados na fonte indicada.",
    "opportunity": "materiais comerciais de transporte.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional confirmado em https://www.tlemos.pt/contactos/"
  },
  {
    "company": "Escola Vocacional de Dança das Caldas da Rainha",
    "sector": "Ensino de dança",
    "email_area": "Estúdios de Dança",
    "location": "Caldas da Rainha, Leiria",
    "website": "https://evdcr.pt/",
    "email": "geral@evdcr.pt",
    "phone": "262843707",
    "source": "https://evdcr.pt/escola/contactos/",
    "instagram": "",
    "observation": "Empresa de ensino de dança com localização e contacto profissional publicados na fonte indicada.",
    "opportunity": "materiais de divulgação de ensino de dança.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional confirmado em https://evdcr.pt/escola/contactos/"
  },
  {
    "company": "Mooves Dance Studio",
    "sector": "Estúdio de dança",
    "email_area": "Estúdios de Dança",
    "location": "Caldas da Rainha, Leiria",
    "website": "https://mooves.pt/",
    "email": "info@mooves.pt",
    "phone": "914124451",
    "source": "https://mooves.pt/contactos/",
    "instagram": "",
    "observation": "Empresa de estúdio de dança com localização e contacto profissional publicados na fonte indicada.",
    "opportunity": "comunicação visual de aulas e professores.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional confirmado em https://mooves.pt/contactos/"
  },
  {
    "company": "Nordeste Máquinas",
    "sector": "Equipamentos agrícolas",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Mirandela, Bragança",
    "website": "https://nordestemaquinas.pt/",
    "email": "comercial@nordestemaquinas.pt",
    "phone": "278248303",
    "source": "https://nordestemaquinas.pt/contactos/",
    "instagram": "",
    "observation": "Empresa de equipamentos agrícolas com localização e contacto profissional publicados na fonte indicada.",
    "opportunity": "catálogo comercial de equipamentos agrícolas.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional confirmado em https://nordestemaquinas.pt/contactos/"
  },
  {
    "company": "Pedro Plácido Climatização",
    "sector": "Climatização",
    "email_area": "Construção & Engenharia",
    "location": "Abrantes, Santarém",
    "website": "https://www.pedroplacido.pt/",
    "email": "mail@pedroplacido.pt",
    "phone": "241071679",
    "source": "https://www.pedroplacido.pt/contact.html",
    "instagram": "",
    "observation": "Empresa de climatização com localização e contacto profissional publicados na fonte indicada.",
    "opportunity": "apresentação de soluções de climatização.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional confirmado em https://www.pedroplacido.pt/contact.html"
  },
  {
    "company": "Álvaro Grupo",
    "sector": "Eletrodomésticos e cozinhas",
    "email_area": "Comércio & Retalho",
    "location": "Entroncamento, Santarém",
    "website": "https://alvarogrupo.com/",
    "email": "geral@alvarogrupo.com",
    "phone": "249727355",
    "source": "https://alvarogrupo.com/lojas-e-contactos",
    "instagram": "",
    "observation": "Empresa de eletrodomésticos e cozinhas com localização e contacto profissional publicados na fonte indicada.",
    "opportunity": "catálogo de cozinhas e divulgação do showroom.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional confirmado em https://alvarogrupo.com/lojas-e-contactos"
  },
  {
    "company": "AbranFogo",
    "sector": "Equipamentos de aquecimento",
    "email_area": "Comércio & Retalho",
    "location": "Abrantes, Santarém",
    "website": "https://www.abranfogo.com/",
    "email": "geral@abranfogo.com",
    "phone": "241366353",
    "source": "https://www.abranfogo.com/",
    "instagram": "",
    "observation": "Empresa de equipamentos de aquecimento com localização e contacto profissional publicados na fonte indicada.",
    "opportunity": "catálogo de recuperadores de calor e instalação.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional confirmado em https://www.abranfogo.com/"
  },
  {
    "company": "Helenometal",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Entroncamento, Santarém",
    "website": "",
    "email": "geral@helenometal.com",
    "phone": "249720390",
    "source": "https://www.fundoambiental.pt/plataforma-vales-de-eficiencia/lista-de-fornecedores-vale-eficiencia.aspx",
    "instagram": "",
    "observation": "Empresa de metalomecânica com localização e contacto profissional publicados na fonte indicada.",
    "opportunity": "apresentação comercial de soluções metálicas.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional confirmado em https://www.fundoambiental.pt/plataforma-vales-de-eficiencia/lista-de-fornecedores-vale-eficiencia.aspx"
  },
  {
    "company": "Pedro Cruz Climatizações",
    "sector": "Climatização",
    "email_area": "Construção & Engenharia",
    "location": "Arcos de Valdevez, Viana do Castelo",
    "website": "",
    "email": "geral@climatiza.pt",
    "phone": "933326755",
    "source": "https://www.fundoambiental.pt/plataforma-vales-de-eficiencia/lista-de-fornecedores-vale-eficiencia.aspx",
    "instagram": "",
    "observation": "Empresa de climatização com localização e contacto profissional publicados na fonte indicada.",
    "opportunity": "materiais comerciais de climatização.",
    "service": "design",
    "outreach_channel": "email",
    "email_observation": "Email profissional confirmado em https://www.fundoambiental.pt/plataforma-vales-de-eficiencia/lista-de-fornecedores-vale-eficiencia.aspx"
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
