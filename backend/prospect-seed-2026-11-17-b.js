// DUIT — Portugal continental, 2026-11-17-b. Contactos públicos nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Duplometal",
    "sector": "Serralharia e metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Leiria, Leiria",
    "website": "https://duplometal.pt",
    "email": "geral@duplometal.pt",
    "phone": "244812103",
    "source": "https://duplometal.pt/info/contactos/",
    "observation": "Empresa de serralharia e metalomecânica com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de serralharia e metalomecânica.",
    "service": "design"
  },
  {
    "company": "Equipévora",
    "sector": "Carpintaria e mobiliário",
    "email_area": "Indústria & Produção",
    "location": "Évora, Évora",
    "website": "https://equipevora.com",
    "email": "escritorio@equipevora.com",
    "phone": "266707837",
    "source": "https://equipevora.com/contactos/",
    "observation": "Empresa de carpintaria e mobiliário com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de carpintaria e mobiliário.",
    "service": "design"
  },
  {
    "company": "IVODREIA",
    "sector": "Serralharia e estufas agrícolas",
    "email_area": "Indústria & Produção",
    "location": "Colmeias, Leiria",
    "website": "https://ivodreia.com",
    "email": "geral@ivodreia.com",
    "phone": "244723215",
    "source": "https://ivodreia.com/",
    "observation": "Empresa de serralharia e estufas agrícolas com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de serralharia e estufas agrícolas.",
    "service": "design"
  },
  {
    "company": "Armintalurgica",
    "sector": "Serralharia civil",
    "email_area": "Indústria & Produção",
    "location": "Santa Catarina da Serra, Leiria",
    "website": "https://armintalurgica.com",
    "email": "geral@armintalurgica.com",
    "phone": "244744816",
    "source": "https://armintalurgica.com/",
    "observation": "Empresa de serralharia civil com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de serralharia civil.",
    "service": "design"
  },
  {
    "company": "CCM — Carlos Calhelhas Metalúrgica",
    "sector": "Montagem e manutenção industrial",
    "email_area": "Indústria & Produção",
    "location": "Regueira de Pontes, Leiria",
    "website": "https://ccm.com.pt",
    "email": "info@ccm.com.pt",
    "phone": "244686360",
    "source": "https://ccm.com.pt/pt/contactos",
    "observation": "Empresa de montagem e manutenção industrial com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de montagem e manutenção industrial.",
    "service": "design"
  },
  {
    "company": "Artur Camponês",
    "sector": "Serralharia e transformação de chapa",
    "email_area": "Indústria & Produção",
    "location": "Arrabal, Leiria",
    "website": "https://arturcampones.pt",
    "email": "geral@arturcampones.pt",
    "phone": "244744515",
    "source": "https://www.arturcampones.pt/contactos/",
    "observation": "Empresa de serralharia e transformação de chapa com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de serralharia e transformação de chapa.",
    "service": "design"
  },
  {
    "company": "Weldart",
    "sector": "Soldadura e serralharia",
    "email_area": "Indústria & Produção",
    "location": "Monte Real, Leiria",
    "website": "https://weldart.pt",
    "email": "geral@weldart.pt",
    "phone": "910916189",
    "source": "https://weldart.pt/",
    "observation": "Empresa de soldadura e serralharia com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de soldadura e serralharia.",
    "service": "design"
  },
  {
    "company": "Dapaferro",
    "sector": "Serralharia civil",
    "email_area": "Indústria & Produção",
    "location": "Ortigosa, Leiria",
    "website": "https://dapaferro.com",
    "email": "comercial@dapaferro.com",
    "phone": "244613119",
    "source": "https://www.dapaferro.com/",
    "observation": "Empresa de serralharia civil com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de serralharia civil.",
    "service": "design"
  },
  {
    "company": "Abel Luís Nogueiro & Irmãos",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Bragança, Bragança",
    "website": "https://alnconstrucoes.com",
    "email": "geral@alnconstrucoes.com",
    "phone": "273326827",
    "source": "https://ruis.aiccopn.pt/empresas/abel-luis-nogueiro-irmaos-lda/",
    "observation": "Empresa de construção civil com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de construção civil.",
    "service": "design"
  },
  {
    "company": "Habinordeste",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Bragança, Bragança",
    "website": "https://habinordeste.pt",
    "email": "geral@habinordeste.pt",
    "phone": "273331441",
    "source": "https://www.habinordeste.pt/",
    "observation": "Empresa de construção civil com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de construção civil.",
    "service": "design"
  },
  {
    "company": "JJCARS Performance",
    "sector": "Oficina automóvel",
    "email_area": "Automóvel",
    "location": "Repeses, Viseu",
    "website": "https://jjcars.pt",
    "email": "geral@jjcars.pt",
    "phone": "232099821",
    "source": "https://www.jjcars.pt/contactos/",
    "observation": "Empresa de oficina automóvel com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de oficina automóvel.",
    "service": "design"
  },
  {
    "company": "FormAlgarve — Grande Génio",
    "sector": "Formação profissional",
    "email_area": "Educação & Formação",
    "location": "Faro, Faro",
    "website": "https://formacaoalgarve.pt",
    "email": "geral@formacaoalgarve.pt",
    "phone": "926025196",
    "source": "https://formacaoalgarve.pt/contacto.php",
    "observation": "Empresa de formação profissional com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de formação profissional.",
    "service": "design"
  },
  {
    "company": "Obraki",
    "sector": "Construção e engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Vila Real, Vila Real",
    "website": "https://obraki.pt",
    "email": "geral@obraki.pt",
    "phone": "259338520",
    "source": "https://obraki.pt/contactos/",
    "observation": "Empresa de construção e engenharia com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de construção e engenharia.",
    "service": "design"
  },
  {
    "company": "MGF Engenharia",
    "sector": "Engenharia e consultadoria",
    "email_area": "Construção & Engenharia",
    "location": "Vila Real, Vila Real",
    "website": "https://mgf-engenharia.com",
    "email": "geral@mgf-engenharia.com",
    "phone": "937147135",
    "source": "https://www.mgf-engenharia.com/contactos/",
    "observation": "Empresa de engenharia e consultadoria com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de engenharia e consultadoria.",
    "service": "design"
  },
  {
    "company": "JAFOC Projetos",
    "sector": "Arquitetura e engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Vila Real, Vila Real",
    "website": "https://jafoc.pt",
    "email": "geral@jafoc.pt",
    "phone": "259347188",
    "source": "https://jafoc.pt/contactos/",
    "observation": "Empresa de arquitetura e engenharia com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de arquitetura e engenharia.",
    "service": "design"
  },
  {
    "company": "Confitec",
    "sector": "Construção e reabilitação",
    "email_area": "Construção & Engenharia",
    "location": "Constantim, Vila Real",
    "website": "https://confitec.pt",
    "email": "geral@confitec.pt",
    "phone": "259342212",
    "source": "https://ruis.aiccopn.pt/empresas/confitec-engenharia-e-construcao-lda/",
    "observation": "Empresa de construção e reabilitação com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de construção e reabilitação.",
    "service": "design"
  },
  {
    "company": "EDUGEP",
    "sector": "Formação profissional",
    "email_area": "Educação & Formação",
    "location": "Setúbal, Setúbal",
    "website": "https://edugep.pt",
    "email": "geral@edugep.pt",
    "phone": "265185750",
    "source": "https://edugep.pt/contactos/",
    "observation": "Empresa de formação profissional com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de formação profissional.",
    "service": "design"
  },
  {
    "company": "DTM — Engenharia e Construção",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Vila Real, Vila Real",
    "website": "https://dtm.com.pt",
    "email": "geral@dtm.com.pt",
    "phone": "968454791",
    "source": "https://ruis.aiccopn.pt/empresas/daniel-teixeira-magalhaes-unipessoal-lda/",
    "observation": "Empresa de construção civil com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de construção civil.",
    "service": "design"
  },
  {
    "company": "TTB Engenharia e Construção",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Vila Real, Vila Real",
    "website": "https://ttbconstrucoes.pt",
    "email": "geral@ttbconstrucoes.pt",
    "phone": "918202073",
    "source": "https://ttbconstrucoes.pt/contactos/",
    "observation": "Empresa de construção civil com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de construção civil.",
    "service": "design"
  },
  {
    "company": "Engisun",
    "sector": "Construção e energia",
    "email_area": "Construção & Engenharia",
    "location": "Vila Real, Vila Real",
    "website": "https://engisun.pt",
    "email": "geral@engisun.pt",
    "phone": "259308208",
    "source": "https://engisun.pt/",
    "observation": "Empresa de construção e energia com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de construção e energia.",
    "service": "design"
  },
  {
    "company": "Viga D'Ideias",
    "sector": "Construção e engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Constantim, Vila Real",
    "website": "https://vdi-ts.com",
    "email": "geral@vdi-ts.com",
    "phone": "961830351",
    "source": "https://www.vdi-ts.com/contactos",
    "observation": "Empresa de construção e engenharia com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de construção e engenharia.",
    "service": "design"
  },
  {
    "company": "Paulo Duarte Unipessoal",
    "sector": "Comércio agropecuário",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Abitureiras, Santarém",
    "website": "https://pauloduartelda.pt",
    "email": "geral@pauloduartelda.pt",
    "phone": "243469177",
    "source": "https://pauloduartelda.pt/",
    "observation": "Empresa de comércio agropecuário com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de comércio agropecuário.",
    "service": "design"
  },
  {
    "company": "Projenor",
    "sector": "Engenharia e projetos",
    "email_area": "Construção & Engenharia",
    "location": "Vila Real, Vila Real",
    "website": "https://projenor.pt",
    "email": "geral@projenor.pt",
    "phone": "259098093",
    "source": "https://projenor.pt/",
    "observation": "Empresa de engenharia e projetos com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de engenharia e projetos.",
    "service": "design"
  },
  {
    "company": "Avalprojet",
    "sector": "Engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Vila Real, Vila Real",
    "website": "https://avalprojet.pt",
    "email": "geral@avalprojet.pt",
    "phone": "",
    "source": "https://diretorio.fiz.co/avalprojet-engenharia-lda-509817599",
    "observation": "Empresa de engenharia com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de engenharia.",
    "service": "design"
  },
  {
    "company": "Quimialbi",
    "sector": "Equipamentos de limpeza industrial",
    "email_area": "Comércio & Retalho",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://quimialbi.pt",
    "email": "geral@quimialbi.pt",
    "phone": "",
    "source": "https://www.quimialbi.pt/sobre-nos",
    "observation": "Empresa de equipamentos de limpeza industrial com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de equipamentos de limpeza industrial.",
    "service": "design"
  },
  {
    "company": "Hidráulica das Beiras",
    "sector": "Componentes industriais",
    "email_area": "Indústria & Produção",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://hidraulicadasbeiras.pt",
    "email": "geral@hidraulicadasbeiras.pt",
    "phone": "272324376",
    "source": "https://www.hidraulicadasbeiras.pt/",
    "observation": "Empresa de componentes industriais com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de componentes industriais.",
    "service": "design"
  },
  {
    "company": "Amorim & Rodrigues",
    "sector": "Transportes e mudanças",
    "email_area": "Transportes & Logística",
    "location": "Meadela, Viana do Castelo",
    "website": "https://amorimerodrigues.com",
    "email": "geral@amorimerodrigues.com",
    "phone": "258822177",
    "source": "https://www.amorimerodrigues.com/",
    "observation": "Empresa de transportes e mudanças com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de transportes e mudanças.",
    "service": "design"
  },
  {
    "company": "Frinox",
    "sector": "Equipamentos hoteleiros",
    "email_area": "Indústria & Produção",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://frinox.pt",
    "email": "geral@frinox.pt",
    "phone": "272343053",
    "source": "https://www.frinox.pt/sobre",
    "observation": "Empresa de equipamentos hoteleiros com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de equipamentos hoteleiros.",
    "service": "design"
  },
  {
    "company": "Aluexpresso",
    "sector": "Caixilharia de alumínio e PVC",
    "email_area": "Construção & Engenharia",
    "location": "Aveiro, Aveiro",
    "website": "https://aluexpresso.com",
    "email": "geral@aluexpresso.com",
    "phone": "234308727",
    "source": "https://www.aluexpresso.com/",
    "observation": "Empresa de caixilharia de alumínio e pvc com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de caixilharia de alumínio e pvc.",
    "service": "design"
  },
  {
    "company": "Anepe",
    "sector": "Fabrico de artigos plásticos",
    "email_area": "Indústria & Produção",
    "location": "Argoncilhe, Aveiro",
    "website": "https://anepe.net",
    "email": "geral@anepe.net",
    "phone": "227471710",
    "source": "https://anepe.net/",
    "observation": "Empresa de fabrico de artigos plásticos com contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de fabrico de artigos plásticos.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-17-b).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-17-b:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-17-b:',e.message)}
