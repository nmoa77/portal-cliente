// DUIT — Portugal continental, 2026-11-03. Contactos confirmados em páginas oficiais ou diretório AICCOPN.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Fisimagna",
    "sector": "Clínica de fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Vila Real, Vila Real",
    "website": "https://fisimagna.com/",
    "email": "geral@fisimagna.com",
    "phone": "259 373 199",
    "source": "https://fisimagna.com/",
    "observation": "Clínica de reabilitação física em Vila Real.",
    "opportunity": "Criar peças informativas sobre tratamentos e consultas.",
    "service": "design"
  },
  {
    "company": "RTPS Engenharia & Construção",
    "sector": "Construção civil e remodelações",
    "email_area": "Construção & Engenharia",
    "location": "Santa Eufémia, Leiria",
    "website": "https://www.rtps.pt/",
    "email": "construcoes@rtps.pt",
    "phone": "964 495 865",
    "source": "https://www.rtps.pt/",
    "observation": "Empresa de construção residencial, comercial e remodelações.",
    "opportunity": "Preparar materiais de apresentação de projetos e serviços.",
    "service": "design"
  },
  {
    "company": "INC Construção",
    "sector": "Construção e reabilitação de imóveis",
    "email_area": "Construção & Engenharia",
    "location": "São Romão, Leiria",
    "website": "https://construcao.incgroup.pt/",
    "email": "inc@incgroup.pt",
    "phone": "244 815 271",
    "source": "https://construcao.incgroup.pt/contact/",
    "observation": "Empresa de construção e reabilitação de imóveis.",
    "opportunity": "Criar suportes gráficos para apresentar obras e serviços.",
    "service": "design"
  },
  {
    "company": "Physios",
    "sector": "Gabinete de fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Vila Real, Vila Real",
    "website": "https://physios.pt/",
    "email": "geral@physios.pt",
    "phone": "927 118 772",
    "source": "https://physios.pt/contactos/",
    "observation": "Gabinete de fisioterapia na Rua Cidade de Portimão, Vila Real.",
    "opportunity": "Apresentar modalidades de atendimento e serviços.",
    "service": "design"
  },
  {
    "company": "Agro-Ribatejo",
    "sector": "Comércio agrícola",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Várzea, Santarém",
    "website": "https://www.agroribatejo.com/",
    "email": "geral@agroribatejo.com",
    "phone": "243 359 280",
    "source": "https://www.agroribatejo.com/contactos/",
    "observation": "Empresa do setor agrícola com instalações na Zona Industrial da Várzea.",
    "opportunity": "Criar suportes de apresentação de produtos e serviços.",
    "service": "design"
  },
  {
    "company": "FisioMiranda",
    "sector": "Fisioterapia e terapias",
    "email_area": "Fisioterapia",
    "location": "Vila Real, Vila Real",
    "website": "https://fisiomiranda.pt/",
    "email": "fisiomiranda@fisiomiranda.pt",
    "phone": "926 390 161",
    "source": "https://fisiomiranda.pt/vila-real/",
    "observation": "Unidade de fisioterapia em Vila Real com várias especialidades.",
    "opportunity": "Criar conteúdos gráficos informativos sobre especialidades.",
    "service": "design"
  },
  {
    "company": "DNA — Dance N'Arts School",
    "sector": "Escola de dança e artes",
    "email_area": "Estúdios de Dança",
    "location": "Coimbra, Coimbra",
    "website": "https://dnaschool.pt/",
    "email": "secretaria@dnaschool.pt",
    "phone": "913 802 049",
    "source": "https://dnaschool.pt/contactos/",
    "observation": "Escola de dança, música e artes performativas em Coimbra.",
    "opportunity": "Divulgar modalidades e inscrições através de materiais visuais.",
    "service": "ambas"
  },
  {
    "company": "Polinox",
    "sector": "Metalomecânica e estruturas metálicas",
    "email_area": "Indústria & Produção",
    "location": "Viseu, Viseu",
    "website": "https://polinox.pt/",
    "email": "geral@polinox.pt",
    "phone": "232 089 436",
    "source": "https://polinox.pt/",
    "observation": "Fabrico e instalação de estruturas, portões e trabalhos em inox.",
    "opportunity": "Criar catálogo de soluções e projetos realizados.",
    "service": "design"
  },
  {
    "company": "NAC — Machining Solutions",
    "sector": "Metalomecânica de precisão",
    "email_area": "Indústria & Produção",
    "location": "Abraveses, Viseu",
    "website": "https://www.nac-ms.com/",
    "email": "geral@nac-ms.com",
    "phone": "964 939 332",
    "source": "https://www.nac-ms.com/contacto/",
    "observation": "Produção de peças metalomecânicas de geometria complexa.",
    "opportunity": "Preparar fichas visuais de capacidades e serviços.",
    "service": "design"
  },
  {
    "company": "Sidor — Metalomecânica",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Mundão, Viseu",
    "website": "https://www.sidor.pt/",
    "email": "comercial@sidor.pt",
    "phone": "232 929 405",
    "source": "https://www.sidor.pt/Contactos/",
    "observation": "Empresa metalomecânica na Zona Industrial do Mundão.",
    "opportunity": "Criar materiais de apresentação de produtos industriais.",
    "service": "design"
  },
  {
    "company": "AFSANTOS — Metalomecânica",
    "sector": "Maquinagem e metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Viseu, Viseu",
    "website": "https://www.afsantos.pt/",
    "email": "geral@afsantos.pt",
    "phone": "232 459 965",
    "source": "https://diretorio.fiz.co/afsantos-metalomecanica-unipessoal-lda-513493409",
    "observation": "Empresa de maquinagem, soldadura e manutenção industrial em Viseu.",
    "opportunity": "Apresentar capacidades técnicas em materiais comerciais.",
    "service": "design"
  },
  {
    "company": ".EDU — Centro de Explicações",
    "sector": "Centro de explicações e acompanhamento escolar",
    "email_area": "Centro de Estudos",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://www.pontoedu.com.pt/",
    "email": "suporte@pontoedu.com.pt",
    "phone": "914 978 879",
    "source": "https://www.pontoedu.com.pt/",
    "observation": "Centro de explicações e acompanhamento escolar em Castelo Branco.",
    "opportunity": "Divulgar disciplinas e preparação de exames.",
    "service": "design"
  },
  {
    "company": "Casa Agrícola AVR — Quinta da Cortiçada",
    "sector": "Viticultura",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Outeiro da Cortiçada, Santarém",
    "website": "http://www.quintadacorticada.pt",
    "email": "geral@quintadacorticada.pt",
    "phone": "962 109 291",
    "source": "https://www.outeiro-arruda.pt/freguesia/empresas/12-casa_agricola_avr_sa",
    "observation": "Empresa agrícola de viticultura identificada pela junta de freguesia.",
    "opportunity": "Criar apresentação da atividade e produtos vitivinícolas.",
    "service": "design"
  },
  {
    "company": "HMWOOD",
    "sector": "Carpintaria e mobiliário por medida",
    "email_area": "Indústria & Produção",
    "location": "Coimbra, Coimbra",
    "website": "https://www.hmwood.pt/",
    "email": "geral@hmwood.pt",
    "phone": "936 777 006",
    "source": "https://www.hmwood.pt/contato/",
    "observation": "Carpintaria de cozinhas, roupeiros e mobiliário personalizado.",
    "opportunity": "Criar catálogo de mobiliário e serviços.",
    "service": "design"
  },
  {
    "company": "Nelly's Dance",
    "sector": "Escola de dança",
    "email_area": "Estúdios de Dança",
    "location": "Marinha Grande, Leiria",
    "website": "https://nellysdance.com/",
    "email": "geral@nellysdance.com",
    "phone": "918 406 451",
    "source": "https://nellysdance.com/contactos-2/",
    "observation": "Escola de dança com aulas presenciais e online na Marinha Grande.",
    "opportunity": "Divulgar modalidades e inscrições em conteúdos gráficos.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-03).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');
  added++;
 }})();
 console.log('[crm] seed 2026-11-03-c:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-03-c:',e.message)}
