// DUIT — Portugal continental, 2026-11-18-b. Emails públicos em fontes comerciais e institucionais.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Manuel Mata – Fabrico e Montagem Alumínios",
    "sector": "Fabrico de caixilharia",
    "email_area": "Indústria & Produção",
    "location": "Vendas Novas, Évora",
    "website": "https://mmaluminios.pt",
    "email": "geral@mmaluminios.pt",
    "phone": "265805346",
    "source": "https://ruis.aiccopn.pt/empresas/manuel-mata-fabrico-e-montagem-aluminios-lda/",
    "observation": "Atividade de fabrico de caixilharia documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de fabrico de caixilharia.",
    "service": "design"
  },
  {
    "company": "Vertentefabulosa",
    "sector": "Revestimentos de fachadas",
    "email_area": "Construção & Engenharia",
    "location": "Canelas, Porto",
    "website": "https://vertentefabulosa.pt",
    "email": "geral@vertentefabulosa.pt",
    "phone": "227128288",
    "source": "https://ruis.aiccopn.pt/empresas/vertentefabulosa-lda/",
    "observation": "Atividade de revestimentos de fachadas documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de revestimentos de fachadas.",
    "service": "design"
  },
  {
    "company": "Metalviçosa",
    "sector": "Fabrico de máquinas industriais",
    "email_area": "Indústria & Produção",
    "location": "Alandroal, Évora",
    "website": "https://metalvicosa.com",
    "email": "geral@metalvicosa.com",
    "phone": "268431104",
    "source": "https://ruis.aiccopn.pt/empresas/metalvicosa-fabricacao-de-maquinas-industriais-lda/",
    "observation": "Atividade de fabrico de máquinas industriais documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de fabrico de máquinas industriais.",
    "service": "design"
  },
  {
    "company": "Armindo Afonso",
    "sector": "Construção civil e obras públicas",
    "email_area": "Construção & Engenharia",
    "location": "Caminha, Viana do Castelo",
    "website": "https://armindoafonso.pt",
    "email": "geral@armindoafonso.pt",
    "phone": "258722576",
    "source": "https://ruis.aiccopn.pt/empresas/armindo-afonso-lda/",
    "observation": "Atividade de construção civil e obras públicas documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de construção civil e obras públicas.",
    "service": "design"
  },
  {
    "company": "Construções Izes",
    "sector": "Construção e reabilitação",
    "email_area": "Construção & Engenharia",
    "location": "Viseu, Viseu",
    "website": "https://construcoesizes.pt",
    "email": "geral@construcoesizes.pt",
    "phone": "232112445",
    "source": "https://ruis.aiccopn.pt/empresas/construcoes-izes-unipessoal-lda/",
    "observation": "Atividade de construção e reabilitação documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de construção e reabilitação.",
    "service": "design"
  },
  {
    "company": "Antero Alves de Paiva",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Torre de Moncorvo, Bragança",
    "website": "https://anteroalvespaiva.pt",
    "email": "geral@anteroalvespaiva.pt",
    "phone": "279258301",
    "source": "https://ruis.aiccopn.pt/empresas/antero-alves-de-paiva-sociedade-de-construcoes-lda/",
    "observation": "Atividade de construção civil documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de construção civil.",
    "service": "design"
  },
  {
    "company": "Edibest Engenharia e Construção",
    "sector": "Engenharia e construção",
    "email_area": "Construção & Engenharia",
    "location": "Tondela, Viseu",
    "website": "https://edibestlda.com",
    "email": "geral@edibestlda.com",
    "phone": "",
    "source": "https://ruis.aiccopn.pt/empresas/edibest-engenharia-e-construcao-lda/",
    "observation": "Atividade de engenharia e construção documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de engenharia e construção.",
    "service": "design"
  },
  {
    "company": "Vectorplano",
    "sector": "Construção e engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Guarda, Guarda",
    "website": "https://vectorplano.pt",
    "email": "geral@vectorplano.pt",
    "phone": "",
    "source": "https://ruis.aiccopn.pt/empresas/vectorplano-projeto-construcao-e-engenharia-lda/",
    "observation": "Atividade de construção e engenharia documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de construção e engenharia.",
    "service": "design"
  },
  {
    "company": "JMA Construções",
    "sector": "Construção e imobiliário",
    "email_area": "Construção & Engenharia",
    "location": "Guarda, Guarda",
    "website": "https://jma.com.pt",
    "email": "geral@jma.com.pt",
    "phone": "",
    "source": "https://ruis.aiccopn.pt/empresas/jma-construcoes/",
    "observation": "Atividade de construção e imobiliário documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de construção e imobiliário.",
    "service": "design"
  },
  {
    "company": "Engioliveira",
    "sector": "Construção e reabilitação",
    "email_area": "Construção & Engenharia",
    "location": "Santa Comba Dão, Viseu",
    "website": "https://engioliveira.pt",
    "email": "geral@engioliveira.pt",
    "phone": "",
    "source": "https://ruis.aiccopn.pt/empresas/engioliveira-lda/",
    "observation": "Atividade de construção e reabilitação documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de construção e reabilitação.",
    "service": "design"
  },
  {
    "company": "Pavilamego",
    "sector": "Construção e materiais de construção",
    "email_area": "Construção & Engenharia",
    "location": "Lamego, Viseu",
    "website": "https://pavilamego.pt",
    "email": "geral@pavilamego.pt",
    "phone": "",
    "source": "https://ruis.aiccopn.pt/empresas/pavilamego-construcoes-e-pavimentos-de-lamego-lda/",
    "observation": "Atividade de construção e materiais de construção documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de construção e materiais de construção.",
    "service": "design"
  },
  {
    "company": "João Tomé Saraiva",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Guarda, Guarda",
    "website": "https://joaotomesaraiva.pt",
    "email": "geral@joaotomesaraiva.pt",
    "phone": "",
    "source": "https://ruis.aiccopn.pt/empresas/joao-tome-saraiva-sociedade-de-construcoes-lda/",
    "observation": "Atividade de construção civil documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de construção civil.",
    "service": "design"
  },
  {
    "company": "Construções Jaime Mendo",
    "sector": "Construção e obras públicas",
    "email_area": "Construção & Engenharia",
    "location": "Pinhel, Guarda",
    "website": "https://jaimemendo.com",
    "email": "geral@jaimemendo.com",
    "phone": "",
    "source": "https://ruis.aiccopn.pt/empresas/construcoes-jaime-mendo-soc-unip-lda/",
    "observation": "Atividade de construção e obras públicas documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de construção e obras públicas.",
    "service": "design"
  },
  {
    "company": "Jorge Sousa Construções",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Ponte de Lima, Viana do Castelo",
    "website": "https://jsconstrucoes.pt",
    "email": "geral@jsconstrucoes.pt",
    "phone": "258741624",
    "source": "https://ruis.aiccopn.pt/empresas/jorge-sousa-construcoes-lda/",
    "observation": "Atividade de construção civil documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de construção civil.",
    "service": "design"
  },
  {
    "company": "Irmãos Vasconcelos Construções",
    "sector": "Construção de edifícios",
    "email_area": "Construção & Engenharia",
    "location": "Monção, Viana do Castelo",
    "website": "https://irmaosvasconcelos.com",
    "email": "geral@irmaosvasconcelos.com",
    "phone": "",
    "source": "https://ruis.aiccopn.pt/empresas/irmaos-vasconcelos-construcoes-lda/",
    "observation": "Atividade de construção de edifícios documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de construção de edifícios.",
    "service": "design"
  },
  {
    "company": "Centro de Estudos CEAP",
    "sector": "Apoio escolar",
    "email_area": "Centro de Estudos",
    "location": "Braga, Braga",
    "website": "https://centroestudosceap.pt",
    "email": "geral@centroestudosceap.pt",
    "phone": "",
    "source": "https://centroestudosceap.pt/",
    "observation": "Atividade de apoio escolar documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de apoio escolar.",
    "service": "design"
  },
  {
    "company": "Bússola da Sabedoria",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Braga, Braga",
    "website": "https://bussoladasabedoria.com",
    "email": "geral@bussoladasabedoria.com",
    "phone": "",
    "source": "https://bussoladasabedoria.com/contacte-nos/",
    "observation": "Atividade de centro de estudos documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de centro de estudos.",
    "service": "design"
  },
  {
    "company": "Navegadores Braga",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Braga, Braga",
    "website": "https://navegadores-braga.com",
    "email": "geral@navegadores-braga.com",
    "phone": "",
    "source": "https://navegadores-braga.com/contactos/",
    "observation": "Atividade de centro de estudos documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de centro de estudos.",
    "service": "design"
  },
  {
    "company": "Casas do Regato",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Póvoa de Rio de Moinhos, Castelo Branco",
    "website": "https://herdadedoregato.com",
    "email": "geral@herdadedoregato.com",
    "phone": "",
    "source": "https://www.visitportugal.com/pt-pt/content/casas-do-regato",
    "observation": "Atividade de turismo rural documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de turismo rural.",
    "service": "design"
  },
  {
    "company": "Casa de Santa Catarina",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Penha Garcia, Castelo Branco",
    "website": "https://casasantacatarina.com",
    "email": "geral@casasantacatarina.com",
    "phone": "966864640",
    "source": "https://rnt.turismodeportugal.pt/RNT/RNET.aspx?nr=916",
    "observation": "Atividade de turismo rural documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de turismo rural.",
    "service": "design"
  },
  {
    "company": "São Torcato Moradal",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Oleiros, Castelo Branco",
    "website": "https://storcatomoradal.com",
    "email": "geral@storcatomoradal.com",
    "phone": "",
    "source": "https://www.cardapio.pt/turismo-rural/dir/d/castelo-branco/c/oleiros/p-19982/sao-torcato-moradal/",
    "observation": "Atividade de turismo rural documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de turismo rural.",
    "service": "design"
  },
  {
    "company": "Casa Cova do Barro",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Fundão, Castelo Branco",
    "website": "https://covadobarro.com",
    "email": "geral@covadobarro.com",
    "phone": "",
    "source": "https://www.cardapio.pt/turismo-rural/dir/d/castelo-branco/c/fundao/p-19869/casa-cova-do-barro/",
    "observation": "Atividade de turismo rural documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de turismo rural.",
    "service": "design"
  },
  {
    "company": "Clínica Joaquim Coutinho",
    "sector": "Fisioterapia e saúde",
    "email_area": "Saúde",
    "location": "Coimbra, Coimbra",
    "website": "https://clinicajoaquimcoutinho.pt",
    "email": "geral@clinicajoaquimcoutinho.pt",
    "phone": "",
    "source": "https://clinicajoaquimcoutinho.pt/fisioterapia/",
    "observation": "Atividade de fisioterapia e saúde documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de fisioterapia e saúde.",
    "service": "design"
  },
  {
    "company": "Actifisio",
    "sector": "Fisioterapia e psicologia",
    "email_area": "Fisioterapia",
    "location": "Coimbra, Coimbra",
    "website": "https://actifisio.pt",
    "email": "geral@actifisio.pt",
    "phone": "",
    "source": "https://www.actifisio.pt/",
    "observation": "Atividade de fisioterapia e psicologia documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de fisioterapia e psicologia.",
    "service": "design"
  },
  {
    "company": "Intrafisio",
    "sector": "Fisioterapia e medicina",
    "email_area": "Fisioterapia",
    "location": "Coimbra, Coimbra",
    "website": "https://intrafisio.pt",
    "email": "geral@intrafisio.pt",
    "phone": "",
    "source": "https://www.intrafisio.pt/contactos",
    "observation": "Atividade de fisioterapia e medicina documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de fisioterapia e medicina.",
    "service": "design"
  },
  {
    "company": "Centro Reabilitação Coimbra",
    "sector": "Medicina física e reabilitação",
    "email_area": "Fisioterapia",
    "location": "Coimbra, Coimbra",
    "website": "https://crcoimbra.pt",
    "email": "geral@crcoimbra.pt",
    "phone": "",
    "source": "https://www.crcoimbra.pt/pt/clinica",
    "observation": "Atividade de medicina física e reabilitação documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de medicina física e reabilitação.",
    "service": "design"
  },
  {
    "company": "Alqueiturismo",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Corujeira, Guarda",
    "website": "https://alqueiturismo.pt",
    "email": "geral@alqueiturismo.pt",
    "phone": "",
    "source": "https://www.visitguarda.pt/ponto_de_interesse/alqueiturismo/",
    "observation": "Atividade de turismo rural documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de turismo rural.",
    "service": "design"
  },
  {
    "company": "Triplo Saber",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Aveiro, Aveiro",
    "website": "https://triplosaber.pt",
    "email": "geral@triplosaber.pt",
    "phone": "917352893",
    "source": "https://triplosaber.pt/centro-de-estudos/",
    "observation": "Atividade de centro de estudos documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de centro de estudos.",
    "service": "design"
  },
  {
    "company": "Nelly's Dance",
    "sector": "Escola de dança",
    "email_area": "Estúdios de Dança",
    "location": "Marinha Grande, Leiria",
    "website": "https://nellysdance.com",
    "email": "geral@nellysdance.com",
    "phone": "",
    "source": "https://nellysdance.com/contactos-2/",
    "observation": "Atividade de escola de dança documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de escola de dança.",
    "service": "design"
  },
  {
    "company": "Azul Banana — Hub Educativo",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Aveiro, Aveiro",
    "website": "https://azulbanana.pt",
    "email": "geral@azulbanana.pt",
    "phone": "",
    "source": "https://www.azulbanana.pt/",
    "observation": "Atividade de centro de estudos documentada na fonte indicada; o contacto profissional está publicado nessa fonte.",
    "opportunity": "Possível apoio em design gráfico para apresentar serviços e projetos de centro de estudos.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-18-b).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-18-b:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-18-b:',e.message)}
