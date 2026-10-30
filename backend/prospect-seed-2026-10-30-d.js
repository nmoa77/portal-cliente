// DUIT — 2026-10-30 lote d. Emails públicos verificados em fontes empresariais e institucionais.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Agência de Contabilidade Ideal de Beja",
    "sector": "Contabilidade",
    "email_area": "Serviços Profissionais",
    "location": "Beja, Beja",
    "website": "https://agenciaidealdebeja.com/",
    "email": "geral@agenciaidealdebeja.com",
    "phone": "284 323 354",
    "source": "https://agenciaidealdebeja.com/contactos/",
    "observation": "Presta serviços de contabilidade e consultoria fiscal.",
    "opportunity": "Criar suportes informativos sobre serviços fiscais.",
    "service": "design"
  },
  {
    "company": "Planipax",
    "sector": "Contabilidade e gestão",
    "email_area": "Serviços Profissionais",
    "location": "Beja, Beja",
    "website": "https://www.planipax.pt/",
    "email": "geral.beja@planipax.pt",
    "phone": "284 320 278",
    "source": "https://www.planipax.pt/contactos",
    "observation": "Presta contabilidade e apoio à gestão em Beja e Moura.",
    "opportunity": "Criar materiais de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "SCS Soluções de Gestão",
    "sector": "Contabilidade e consultoria",
    "email_area": "Serviços Profissionais",
    "location": "Beja, Beja",
    "website": "https://www.scs-gestao.pt/",
    "email": "geral@scs-gestao.pt",
    "phone": "284 086 088",
    "source": "https://www.scs-gestao.pt/",
    "observation": "Presta apoio à gestão e contabilidade.",
    "opportunity": "Criar peças informativas para empresas clientes.",
    "service": "design"
  },
  {
    "company": "Therapy Viana",
    "sector": "Fisioterapia e Pilates Clínico",
    "email_area": "Fisioterapia",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://therapyviana.pt/",
    "email": "geral@therapyviana.pt",
    "phone": "938 131 502",
    "source": "https://therapyviana.pt/contacto/",
    "observation": "Espaço de fisioterapia e Pilates Clínico em Viana do Castelo.",
    "opportunity": "Criar suportes de apresentação dos serviços clínicos.",
    "service": "ambas"
  },
  {
    "company": "Metalguarda",
    "sector": "Metalurgia",
    "email_area": "Indústria & Produção",
    "location": "Guarda, Guarda",
    "website": "https://metalguarda.pt/",
    "email": "metalguarda@metalguarda.pt",
    "phone": "271 223 692",
    "source": "https://ruis.aiccopn.pt/empresas/metalguarda-industria-metalurgica-sa/",
    "observation": "Empresa de serralharia e estruturas metálicas na Guarda.",
    "opportunity": "Criar fichas de soluções e trabalhos executados.",
    "service": "design"
  },
  {
    "company": "Damião & Belo",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Portalegre, Portalegre",
    "website": "https://damiaoebelo.pt/",
    "email": "geral@d-b.pt",
    "phone": "245 202 424",
    "source": "https://damiaoebelo.pt/contactos",
    "observation": "Empresa de construção e reabilitação sediada em Portalegre.",
    "opportunity": "Criar apresentações de obras e competências.",
    "service": "design"
  },
  {
    "company": "Automóveis P3M",
    "sector": "Comércio automóvel",
    "email_area": "Automóvel",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://automoveisp3m.pt/",
    "email": "geral@automoveisp3m.pt",
    "phone": "916 138 145",
    "source": "https://automoveisp3m.pt/",
    "observation": "Stand de automóveis usados e seminovos em Castelo Branco.",
    "opportunity": "Criar peças de apresentação de viaturas e serviços.",
    "service": "ambas"
  },
  {
    "company": "Barreiras e Perímetros",
    "sector": "Construção e vedações",
    "email_area": "Construção & Engenharia",
    "location": "Bragança, Bragança",
    "website": "https://bep.com.pt/",
    "email": "geral@bep.com.pt",
    "phone": "966 640 616",
    "source": "https://bep.com.pt/contactos",
    "observation": "Empresa sediada na Estrada do Turismo, em Bragança.",
    "opportunity": "Criar materiais comerciais para apresentação de soluções.",
    "service": "design"
  },
  {
    "company": "Metalúrgica do Fundão",
    "sector": "Automóvel e oficina",
    "email_area": "Automóvel",
    "location": "Fundão, Castelo Branco",
    "website": "https://www.metalurgicadofundao.pt/",
    "email": "geral@metalurgicafundao.pt",
    "phone": "275 750 710",
    "source": "https://www.metalurgicadofundao.pt/contactos",
    "observation": "Disponibiliza oficina, peças e vendas automóveis no Fundão.",
    "opportunity": "Criar suportes de comunicação dos serviços.",
    "service": "design"
  },
  {
    "company": "Tiago Velez",
    "sector": "Manutenção rodoviária e construção",
    "email_area": "Construção & Engenharia",
    "location": "Arronches, Portalegre",
    "website": "https://tiagovelez.pt/",
    "email": "geral@tiagovelez.pt",
    "phone": "245 580 067",
    "source": "https://tiagovelez.pt/contactos/",
    "observation": "Empresa de manutenção rodoviária e construção civil.",
    "opportunity": "Criar apresentação visual de serviços e projetos.",
    "service": "design"
  },
  {
    "company": "Carpintaria Pendão",
    "sector": "Carpintaria e mobiliário",
    "email_area": "Indústria & Produção",
    "location": "São Pedro do Sul, Viseu",
    "website": "https://www.carpintariapendao.pt/",
    "email": "geral@carpintariapendao.pt",
    "phone": "963 271 509",
    "source": "https://www.carpintariapendao.pt/contactos",
    "observation": "Produz mobiliário e projetos por medida.",
    "opportunity": "Criar portefólio visual de soluções de mobiliário.",
    "service": "design"
  },
  {
    "company": "Hiclinic Dental Care",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Aveiro, Aveiro",
    "website": "https://hiclinic.pt/",
    "email": "geral@hiclinic.pt",
    "phone": "234 421 000",
    "source": "https://hiclinic.pt/contactos/",
    "observation": "Clínica de medicina dentária em Aveiro.",
    "opportunity": "Criar materiais informativos de especialidades.",
    "service": "design"
  },
  {
    "company": "Plazamed",
    "sector": "Clínica médica e dentária",
    "email_area": "Saúde",
    "location": "Vagos, Aveiro",
    "website": "https://plazamed.pt/",
    "email": "geral@plazamed.pt",
    "phone": "234 426 533",
    "source": "https://plazamed.pt/",
    "observation": "Clínica em Vagos com serviços médicos e dentários.",
    "opportunity": "Criar suportes de informação sobre consultas e serviços.",
    "service": "ambas"
  },
  {
    "company": "Cliabum",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Ílhavo, Aveiro",
    "website": "https://cliabum.pt/",
    "email": "geral@cliabum.pt",
    "phone": "234 326 439",
    "source": "https://cliabum.pt/contacto/",
    "observation": "Clínica dentária com unidades em Ílhavo e Gafanha da Nazaré.",
    "opportunity": "Criar peças explicativas das especialidades clínicas.",
    "service": "design"
  },
  {
    "company": "Outsupport",
    "sector": "Consultoria e formação",
    "email_area": "Educação & Formação",
    "location": "Coimbra, Coimbra",
    "website": "https://outsupport.pt/",
    "email": "geral@outsupport.pt",
    "phone": "",
    "source": "https://outsupport.pt/contatos/",
    "observation": "Presta consultoria e formação empresarial em Coimbra.",
    "opportunity": "Criar materiais de divulgação de ações formativas.",
    "service": "design"
  },
  {
    "company": "Guest Mar",
    "sector": "Alojamento local",
    "email_area": "Turismo & Alojamento",
    "location": "Olhão, Faro",
    "website": "https://guestmar.pt/",
    "email": "geral@guestmar.pt",
    "phone": "915 618 134",
    "source": "https://guestmar.pt/contactos/",
    "observation": "Alojamento local situado em Olhão.",
    "opportunity": "Criar materiais digitais de apresentação do alojamento.",
    "service": "ambas"
  },
  {
    "company": "Pátio Camaleónico",
    "sector": "Turismo e bem-estar",
    "email_area": "Turismo & Alojamento",
    "location": "Sotavento Algarvio, Faro",
    "website": "https://patiocamaleonico.pt/",
    "email": "geral@patiocamaleonico.pt",
    "phone": "968 047 845",
    "source": "https://patiocamaleonico.pt/",
    "observation": "Disponibiliza alojamento e experiências marítimo-turísticas.",
    "opportunity": "Criar materiais para divulgação de experiências e alojamento.",
    "service": "ambas"
  },
  {
    "company": "Mentores & Tutores",
    "sector": "Formação e consultoria",
    "email_area": "Educação & Formação",
    "location": "Coimbra, Coimbra",
    "website": "https://formacao-acao.pt/",
    "email": "geral@mentoresetutores.org",
    "phone": "239 853 214",
    "source": "https://formacao-acao.pt/",
    "observation": "Promove projetos de formação-ação para PME.",
    "opportunity": "Criar materiais de apresentação de programas formativos.",
    "service": "design"
  },
  {
    "company": "Socalor",
    "sector": "Climatização",
    "email_area": "Construção & Engenharia",
    "location": "Elvas, Portalegre",
    "website": "https://socalor.com/",
    "email": "geral@socalor.com",
    "phone": "268 623 333",
    "source": "https://ruis.aiccopn.pt/empresas/socalor-sistemas-climatizacao-lda/",
    "observation": "Empresa de sistemas de climatização em Elvas.",
    "opportunity": "Criar fichas de soluções de climatização.",
    "service": "design"
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
 const hasEmail=db.prepare('SELECT 1 FROM users WHERE lower(trim(email))=? LIMIT 1'),hasCompany=db.prepare('SELECT 1 FROM users WHERE is_prospect=1 AND lower(trim(company))=? LIMIT 1');
 const addUser=db.prepare('INSERT INTO users(name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES(?,?,?,?,?,?,1,0)');
 const addCrm=db.prepare("INSERT INTO prospect_crm(user_id,sector,email_area,location,website,instagram,opportunity,idea,email_observation,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,outreach_channel,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))");
 const pwd=bcrypt.hashSync(crypto.randomBytes(24).toString('hex'),10),seenE=new Set(),seenC=new Set(),seenS=new Set();
 let added=0,skipped=0;
 db.transaction(()=>{for(const x of L){
  const email=x.email.trim().toLowerCase(),company=x.company.trim().toLowerCase(),domain=email.split('@')[1],site=normSite(x.website);
  if(!domain||/^(gmail\.com|hotmail\.com|outlook\.com|yahoo\.[a-z.]+|icloud\.com|sapo\.pt)$/i.test(domain)||/^no-?reply@/i.test(email)||!x.source||!x.email_area||wasDeleted(email)||oldEmails.has(email)||oldCompanies.has(company)||(site&&oldSites.has(site))||seenE.has(email)||seenC.has(company)||(site&&seenS.has(site))||hasEmail.get(email)||hasCompany.get(company)||(site&&sites.has(site))){skipped++;continue}
  seenE.add(email);seenC.add(company);if(site)seenS.add(site);
  const service=x.service==='design'?'design gráfico e materiais comerciais':x.service==='redes'?'gestão de redes sociais':'design gráfico e comunicação nas redes sociais';
  const proposal='Olá, sou o Nuno, da DUIT. Estive a conhecer a '+x.company+'. Posso ajudar com '+service+', nomeadamente com '+x.opportunity.toLowerCase()+' Se fizer sentido para si, terei gosto em conversar consigo. Cumprimentos, Nuno.';
  const id=Number(addUser.run(x.company,email,pwd,'client',x.company,x.phone||'').lastInsertRowid);
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-10-30).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');
  added++;
 }})();
 console.log('[crm] seed 2026-10-30-d:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-10-30-d:',e.message)}
