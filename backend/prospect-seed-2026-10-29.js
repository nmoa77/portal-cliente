// DUIT — prospects com emails publicados em fontes oficiais, 2026-10-29.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Academia +Sabedoria",
    "sector": "Centro de estudos e explicações",
    "email_area": "Educação & Formação",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://mais-sabedoria.pt/",
    "email": "geral@mais-sabedoria.pt",
    "phone": "",
    "source": "https://mais-sabedoria.pt/",
    "observation": "Centro de estudos com explicações, estudo acompanhado e campos de férias.",
    "opportunity": "Criar materiais de apresentação dos programas educativos.",
    "service": "design"
  },
  {
    "company": "Centro de Estudos Abelheira",
    "sector": "Centro de estudos e explicações",
    "email_area": "Centro de Estudos",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://abelheira.pt/",
    "email": "centroestudos@abelheira.pt",
    "phone": "963 940 557",
    "source": "https://abelheira.pt/contactos/",
    "observation": "Centro de estudos na Rua João Castelão Pereira, Viana do Castelo.",
    "opportunity": "Divulgar modalidades de apoio ao estudo e inscrições.",
    "service": "design"
  },
  {
    "company": "Intrafisio",
    "sector": "Fisioterapia e medicina",
    "email_area": "Fisioterapia",
    "location": "Coimbra, Coimbra",
    "website": "https://www.intrafisio.pt/",
    "email": "geral@intrafisio.pt",
    "phone": "239 821 659",
    "source": "https://www.intrafisio.pt/contactos",
    "observation": "Clínica de fisioterapia e medicina na Rua de Aveiro, Coimbra.",
    "opportunity": "Criar peças informativas sobre consultas e especialidades.",
    "service": "design"
  },
  {
    "company": "Actifisio",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Coimbra e Figueira da Foz, Coimbra",
    "website": "https://www.actifisio.pt/",
    "email": "geral@actifisio.pt",
    "phone": "919 090 510",
    "source": "https://www.actifisio.pt/",
    "observation": "Atendimento de fisioterapia em Coimbra e Figueira da Foz.",
    "opportunity": "Apresentar localizações e serviços em suportes digitais.",
    "service": "design"
  },
  {
    "company": "Madrugada Turismo Rural",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Évora, Évora",
    "website": "https://madrugadaturismorural.com/",
    "email": "info@madrugadaturismorural.com",
    "phone": "918 784 221",
    "source": "https://madrugadaturismorural.com/pt/contacto/",
    "observation": "Alojamento rural na Estrada Nacional 254, Évora.",
    "opportunity": "Criar conteúdos gráficos sobre alojamento e reservas.",
    "service": "ambas"
  },
  {
    "company": "Otomed",
    "sector": "Clínica médica e fisioterapia",
    "email_area": "Saúde",
    "location": "Évora, Évora",
    "website": "https://www.otomed.pt/",
    "email": "geral@otomed.pt",
    "phone": "266 703 140",
    "source": "https://www.otomed.pt/otomed",
    "observation": "Clínica médica e serviço de fisioterapia em Évora.",
    "opportunity": "Preparar materiais informativos das diferentes valências.",
    "service": "design"
  },
  {
    "company": "Centro Reabilitação de Coimbra",
    "sector": "Fisioterapia e reabilitação",
    "email_area": "Fisioterapia",
    "location": "Coimbra, Coimbra",
    "website": "https://www.crcoimbra.pt/",
    "email": "geral@crcoimbra.pt",
    "phone": "239 483 063",
    "source": "https://www.crcoimbra.pt/",
    "observation": "Centro de reabilitação na Rua Rodrigues Gusmão, Coimbra.",
    "opportunity": "Apresentar serviços e contactos em peças informativas.",
    "service": "design"
  }
];
try{
 const cols=db.prepare('PRAGMA table_info(prospect_crm)').all().map(x=>x.name);
 for(const col of ['email_area','email_observation','instagram','outreach_channel'])if(!cols.includes(col))db.exec('ALTER TABLE prospect_crm ADD COLUMN '+col+' TEXT');
 const norm=s=>{try{return new URL(s).hostname.toLowerCase().replace(/^www\\./,'')}catch(e){return ''}};
 const oldE=new Set(),oldC=new Set(),oldS=new Set();
 for(const f of fs.readdirSync(__dirname).filter(n=>/^prospect-seed-.*\\.js$/i.test(n)&&n!==path.basename(__filename))){
  const t=fs.readFileSync(path.join(__dirname,f),'utf8');
  for(const m of t.matchAll(/["']email["']\\s*:\\s*["']([^"']+)["']/g))oldE.add(m[1].toLowerCase().trim());
  for(const m of t.matchAll(/["']company["']\\s*:\\s*["']([^"']+)["']/g))oldC.add(m[1].toLowerCase().trim());
  for(const m of t.matchAll(/["']website["']\\s*:\\s*["']([^"']+)["']/g)){const h=norm(m[1]);if(h)oldS.add(h)}
 }
 const dbSites=new Set(db.prepare("SELECT website FROM prospect_crm WHERE website IS NOT NULL").all().map(x=>norm(x.website)).filter(Boolean));
 const hasE=db.prepare('SELECT 1 FROM users WHERE lower(trim(email))=? LIMIT 1');
 const hasC=db.prepare('SELECT 1 FROM users WHERE is_prospect=1 AND lower(trim(company))=? LIMIT 1');
 const addU=db.prepare('INSERT INTO users(name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES(?,?,?,?,?,?,1,0)');
 const addP=db.prepare("INSERT INTO prospect_crm(user_id,sector,email_area,location,website,instagram,opportunity,idea,email_observation,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,outreach_channel,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))");
 const pwd=bcrypt.hashSync(crypto.randomBytes(24).toString('hex'),10),seen=new Set();let added=0,skipped=0;
 db.transaction(()=>{for(const x of L){
  const e=x.email.toLowerCase().trim(),c=x.company.toLowerCase().trim(),h=norm(x.website),domain=e.split('@')[1];
  if(!domain||/^(gmail\\.com|hotmail\\.com|outlook\\.com|yahoo\\.[a-z.]+|icloud\\.com|sapo\\.pt)$/i.test(domain)||/^no-?reply@/.test(e)||!x.source||!x.email_area||wasDeleted(e)||oldE.has(e)||oldC.has(c)||(h&&oldS.has(h))||hasE.get(e)||hasC.get(c)||(h&&dbSites.has(h))||seen.has(e)||seen.has(c)||(h&&seen.has(h))){skipped++;continue}
  seen.add(e);seen.add(c);if(h)seen.add(h);
  const service=x.service==='design'?'design gráfico':x.service==='redes'?'gestão de redes sociais':'design gráfico e gestão de redes sociais';
  const proposal='Olá, sou o Nuno, da DUIT. Posso ajudar com '+service+', por exemplo na criação de materiais adequados à sua atividade. Se fizer sentido para si, terei gosto em conversar consigo. Cumprimentos, Nuno.';
  const id=Number(addU.run(x.company,e,pwd,'client',x.company,x.phone||'').lastInsertRowid);
  addP.run(id,x.sector,x.email_area,x.location,x.website,'',x.opportunity,x.opportunity,x.source+' — email profissional publicado no website oficial (verificado em 2026-10-29).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();
 console.log('[crm] seed 2026-10-29:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-10-29:',e.message)}
