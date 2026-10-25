const crypto=require('crypto');
const bcrypt=require('bcryptjs');
const db=require('./db');
const {wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Fisio Clínica da Ribeira",
    "sector": "Fisioterapia",
    "location": "Viseu, Viseu",
    "website": "https://fisiocr.pt/",
    "email": "geral@fisiocr.pt",
    "phone": "232 397 312",
    "source": "https://fisiocr.pt/",
    "observation": "Clínica de reabilitação em Viseu.",
    "opportunity": "Criar materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "R.Fisio",
    "sector": "Fisioterapia e osteopatia",
    "location": "Viseu, Viseu",
    "website": "https://www.rfisio.pt/",
    "email": "geral@rfisioviseu.pt",
    "phone": "938 140 418",
    "source": "https://www.rfisio.pt/",
    "observation": "Clínica em Viseu com exercício clínico.",
    "opportunity": "Criar materiais gráficos e conteúdos informativos adaptados ao negócio.",
    "service": "ambas"
  },
  {
    "company": "Clínica de Psicologia e Psicoterapia",
    "sector": "Psicologia",
    "location": "Coimbra, Coimbra",
    "website": "https://clinicadepsicologiaepsicoterapia.pt/",
    "email": "geral@clinicadepsicologiaepsicoterapia.pt",
    "phone": "239 824 343",
    "source": "https://clinicadepsicologiaepsicoterapia.pt/contactos/",
    "observation": "Consultório na Rua Avelar Brotero.",
    "opportunity": "Criar materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "PsicoVida",
    "sector": "Psicologia",
    "location": "Coimbra, Coimbra",
    "website": "https://psicovida.pt/",
    "email": "contacto@psicovida.pt",
    "phone": "913 233 341",
    "source": "https://psicovida.pt/psicologos/",
    "observation": "Equipa de psicólogos na zona de Celas.",
    "opportunity": "Criar materiais gráficos e conteúdos informativos adaptados ao negócio.",
    "service": "ambas"
  },
  {
    "company": "CR-Oral - Dr. António Domingos",
    "sector": "Medicina dentária",
    "location": "Évora, Évora",
    "website": "https://www.cr-oral.pt/",
    "email": "info@croaevora.pt",
    "phone": "266 106 471",
    "source": "https://www.cr-oral.pt/",
    "observation": "Clínica dentária dirigida pelo Dr. António Domingos.",
    "opportunity": "Criar materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Montes de Saúde",
    "sector": "Clínica médica",
    "location": "Bragança, Bragança",
    "website": "https://montes-saude.pt/",
    "email": "geral@montes-saude.pt",
    "phone": "961 165 555",
    "source": "https://montes-saude.pt/",
    "observation": "Clínica em Bragança com várias especialidades.",
    "opportunity": "Criar materiais gráficos e conteúdos informativos adaptados ao negócio.",
    "service": "ambas"
  },
  {
    "company": "Pelvita",
    "sector": "Fisioterapia pélvica",
    "location": "Bragança, Bragança",
    "website": "https://www.pelvita.pt/",
    "email": "geral@pelvita.pt",
    "phone": "964 794 204",
    "source": "https://www.pelvita.pt/blank",
    "observation": "Espaço de fisioterapia pélvica e outras terapias.",
    "opportunity": "Criar materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Egiclinica",
    "sector": "Serviços médicos",
    "location": "Guarda, Guarda",
    "website": "https://www.egiclinica.pt/",
    "email": "geral@egiclinica.pt",
    "phone": "271 095 000",
    "source": "https://www.egiclinica.pt/egiclinica.aspx",
    "observation": "Clínica com duas localizações na Guarda.",
    "opportunity": "Criar materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Clínica Rainha D. Leonor",
    "sector": "Clínica médica",
    "location": "Beja, Beja",
    "website": "https://clinicarainhadonaleonor.pt/",
    "email": "geral@clinicarainhadonaleonor.pt",
    "phone": "284 341 588",
    "source": "https://clinicarainhadonaleonor.pt/medicos/",
    "observation": "Clínica com corpo médico em Beja.",
    "opportunity": "Criar materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Associação Dança Leiria",
    "sector": "Escola de dança",
    "location": "Leiria, Leiria",
    "website": "https://www.dancaleiria.pt/",
    "email": "geral@dancaleiria.pt",
    "phone": "244 854 391",
    "source": "https://www.dancaleiria.pt/contactos/",
    "observation": "Escola de dança no Estádio Municipal de Leiria.",
    "opportunity": "Criar materiais gráficos e conteúdos informativos adaptados ao negócio.",
    "service": "ambas"
  },
  {
    "company": "Almojanda 3 Olive Tree",
    "sector": "Turismo rural",
    "location": "Portalegre, Portalegre",
    "website": "https://www.almojanda3olivetree.com/",
    "email": "reservas@almojanda3olivetree.com",
    "phone": "963 474 524",
    "source": "https://www.almojanda3olivetree.com/",
    "observation": "Alojamento com três casas de campo.",
    "opportunity": "Criar materiais gráficos e conteúdos informativos adaptados ao negócio.",
    "service": "ambas"
  },
  {
    "company": "Casa da Urra",
    "sector": "Turismo rural e adega",
    "location": "Urra, Portalegre",
    "website": "https://casadaurra.com/",
    "email": "geral@casadaurra.com",
    "phone": "917 614 363",
    "source": "https://casadaurra.com/contactos/",
    "observation": "Herdade com alojamento e adega na Urra.",
    "opportunity": "Criar materiais gráficos e conteúdos informativos adaptados ao negócio.",
    "service": "ambas"
  },
  {
    "company": "Let Me Dance Studios",
    "sector": "Escola de dança",
    "location": "Samora Correia, Santarém",
    "website": "https://letmedance.pt/",
    "email": "geral@letmedance.pt",
    "phone": "263 658 507",
    "source": "https://letmedance.pt/contactos/",
    "observation": "Escola de dança em Samora Correia.",
    "opportunity": "Criar materiais gráficos e conteúdos informativos adaptados ao negócio.",
    "service": "ambas"
  },
  {
    "company": "My Flow Studio",
    "sector": "Pilates",
    "location": "Portimão, Faro",
    "website": "https://myflowstudio.pt/",
    "email": "info@myflowstudio.pt",
    "phone": "969 084 803",
    "source": "https://myflowstudio.pt/localizacao.html/amp",
    "observation": "Estúdio em Portimão com Pilates de máquinas.",
    "opportunity": "Criar materiais gráficos e conteúdos informativos adaptados ao negócio.",
    "service": "ambas"
  },
  {
    "company": "Centro de Fisioterapia de Ponta Delgada",
    "sector": "Fisioterapia",
    "location": "Ponta Delgada, Açores",
    "website": "https://cfpdl.com/",
    "email": "geral@cfpdl.com",
    "phone": "296 304 930",
    "source": "https://cfpdl.com/contacto.php",
    "observation": "Unidade de medicina física e reabilitação.",
    "opportunity": "Criar materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Medical Concept",
    "sector": "Clínica médica",
    "location": "Ponta Delgada, Açores",
    "website": "https://mcclinic.pt/",
    "email": "geral@mcclinic.pt",
    "phone": "296 288 888",
    "source": "https://mcclinic.pt/contatos/",
    "observation": "Clínica no centro comercial Parque Atlântico.",
    "opportunity": "Criar materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Ginásio da Linha",
    "sector": "Fitness",
    "location": "Santa Marta de Portuzelo, Viana do Castelo",
    "website": "https://ginasiodalinha.pt/",
    "email": "geral@ginasiodalinha.pt",
    "phone": "258 076 051",
    "source": "https://ginasiodalinha.pt/",
    "observation": "Ginásio em Santa Marta de Portuzelo.",
    "opportunity": "Divulgar aulas e atividades nas redes sociais.",
    "service": "redes"
  },
  {
    "company": "Pedro Coutinho Clínica",
    "sector": "Psicologia e psiquiatria",
    "location": "Braga, Braga",
    "website": "https://pedrocoutinho.pt/",
    "email": "geral@pedrocoutinho.pt",
    "phone": "915 029 633",
    "source": "https://pedrocoutinho.pt/",
    "observation": "Clínica em Braga com consultas presenciais e online.",
    "opportunity": "Criar materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Luís Cunha Psicologia",
    "sector": "Psicologia",
    "location": "Braga, Braga",
    "website": "https://luiscunhapsicologia.pt/",
    "email": "geral@luiscunhapsicologia.pt",
    "phone": "938 697 475",
    "source": "https://luiscunhapsicologia.pt/contactos/",
    "observation": "Profissional com consultório em São Vítor.",
    "opportunity": "Criar materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Therapy Viana",
    "sector": "Fisioterapia e pilates clínico",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://therapyviana.pt/",
    "email": "geral@therapyviana.pt",
    "phone": "938 131 502",
    "source": "https://therapyviana.pt/servicos/",
    "observation": "Clínica com fisioterapia e terapia da fala.",
    "opportunity": "Criar materiais gráficos e conteúdos informativos adaptados ao negócio.",
    "service": "ambas"
  },
  {
    "company": "Clínica Terapia da Fala",
    "sector": "Terapia da fala e psicologia",
    "location": "Funchal, Madeira",
    "website": "https://www.clinicatf.pt/",
    "email": "geral@clinicatf.pt",
    "phone": "291 617 755",
    "source": "https://www.clinicatf.pt/index.php/dr-a-catarina-gouveia",
    "observation": "Clínica no Funchal com consultas de psicologia.",
    "opportunity": "Criar materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "MoveMais",
    "sector": "Clínica e reabilitação",
    "location": "Aveiro, Aveiro",
    "website": "https://movemaisfisiotraining.pt/",
    "email": "geral@movemaisfisiotraining.pt",
    "phone": "234 482 033",
    "source": "https://movemaisfisiotraining.pt/corpo-clinico/jessica-pinheiro/",
    "observation": "Clínica com equipa multidisciplinar e nutrição.",
    "opportunity": "Criar materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Asas nos Pés",
    "sector": "Terapias pediátricas",
    "location": "Vila Real, Vila Real",
    "website": "https://www.asasnospes.com/",
    "email": "geral@asasnospes.com",
    "phone": "917 378 597",
    "source": "https://www.asasnospes.com/equipa-psicologia-terapia-da-fala-terapia-ocupacional",
    "observation": "Gabinete de terapia da fala e psicologia pediátrica.",
    "opportunity": "Criar materiais gráficos e conteúdos informativos adaptados ao negócio.",
    "service": "ambas"
  },
  {
    "company": "Clínica Médica e Dentária das Tílias",
    "sector": "Clínica médica e dentária",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://clinicadastilias.pt/",
    "email": "geral@clinicadastilias.pt",
    "phone": "272 325 110",
    "source": "https://clinicadastilias.pt/contactos/",
    "observation": "Clínica com unidades em Castelo Branco e Oleiros.",
    "opportunity": "Criar materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Libros&libros",
    "sector": "Livraria independente",
    "location": "Viseu, Viseu",
    "website": "",
    "email": "geral@libroslibrosviseu.com",
    "phone": "232 394 699",
    "source": "https://www.reli.pt/libroslibros/",
    "observation": "Livraria familiar em Viseu registada na ReLI.",
    "opportunity": "Criar materiais gráficos e conteúdos informativos adaptados ao negócio.",
    "service": "ambas"
  },
  {
    "company": "Restaurante Napolitano",
    "sector": "Restauração",
    "location": "Coimbra, Coimbra",
    "website": "https://restaurantenapolitano.pt/",
    "email": "geral@restaurantenapolitano.pt",
    "phone": "239 701 422",
    "source": "https://restaurantenapolitano.pt/reservas/",
    "observation": "Restaurante e marisqueira na Estrada da Beira.",
    "opportunity": "Criar materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Carne Mertolenga DOP",
    "sector": "Comércio alimentar",
    "location": "Évora, Évora",
    "website": "https://www.carnemertolenga.com/",
    "email": "geral@carnemertolenga.com",
    "phone": "266 707 197",
    "source": "https://www.carnemertolenga.com/pt/onde-comprar/loja-evora/",
    "observation": "Loja de produtos de carne Mertolenga DOP.",
    "opportunity": "Criar materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Mercearia Alentejana",
    "sector": "Comércio especializado",
    "location": "Mora, Évora",
    "website": "https://www.merceariaalentejana.pt/",
    "email": "geral@merceariaalentejana.pt",
    "phone": "266 409 170",
    "source": "https://tintasepintura.pt/lojas/mercearia-alentejana/",
    "observation": "Loja de Mora identificada num diretório comercial.",
    "opportunity": "Criar materiais gráficos de apresentação dos serviços e produtos.",
    "service": "design"
  },
  {
    "company": "Pernalonga",
    "sector": "Loja de bicicletas",
    "location": "Aveiro, Aveiro",
    "website": "https://www.pernalonga.pt/",
    "email": "geral@pernalonga.pt",
    "phone": "234 423 110",
    "source": "https://euroveloportugal.com/pt/poi/pernalonga",
    "observation": "Loja de bicicletas identificada na rede EuroVelo.",
    "opportunity": "Criar materiais gráficos e conteúdos informativos adaptados ao negócio.",
    "service": "ambas"
  },
  {
    "company": "Quinta Carvalhas",
    "sector": "Turismo rural e retiros",
    "location": "Casével, Santarém",
    "website": "https://quintacarvalhas.com/",
    "email": "geral@quintacarvalhas.com",
    "phone": "916 700 304",
    "source": "https://www.visitesantarem.pt/en/lista/quinta-das-carvalhas/",
    "observation": "Quinta dedicada a alojamento, retiros e eventos.",
    "opportunity": "Criar materiais gráficos e conteúdos informativos adaptados ao negócio.",
    "service": "ambas"
  }
];
try {
for(const col of ['email_observation','instagram','outreach_channel','dm_message','dm_status']){try{db.prepare('ALTER TABLE prospect_crm ADD COLUMN '+col+' TEXT').run()}catch(e){if(!/duplicate column/i.test(e.message))throw e}}
const existsCompany=db.prepare('SELECT id FROM users WHERE is_prospect=1 AND lower(trim(company))=lower(trim(?))');
const existsEmail=db.prepare('SELECT id FROM users WHERE lower(trim(email))=lower(trim(?))');
const existsSite=db.prepare("SELECT user_id FROM prospect_crm WHERE lower(trim(coalesce(website,'')))=lower(trim(?))");
const addUser=db.prepare('INSERT INTO users(name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES(?,?,?,?,?,?,1,0)');
const addCrm=db.prepare("INSERT INTO prospect_crm(user_id,sector,location,website,opportunity,idea,email_observation,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,outreach_channel,updated_at) VALUES(?,?,?,?,?,?,?,'intermedio',?,200,100,'por_contactar','normal',?,?,'email',datetime('now'))");
const password=bcrypt.hashSync(crypto.randomBytes(24).toString('hex'),10);let added=0,skipped=0;const seen=new Set();
db.transaction(()=>{for(const x of L){const email=x.email.trim().toLowerCase();const key=x.company.trim().toLowerCase();const domain=email.split('@')[1];const host=x.website?new URL(x.website).hostname.toLowerCase().replace(/^www\./,''):'';const forbidden=/^(gmail\.com|hotmail\.com|outlook\.com|yahoo\.com|icloud\.com|sapo\.pt)$/i;
if(!domain||forbidden.test(domain)||email.startsWith('noreply@')||wasDeleted(email)||seen.has(email)||seen.has(key)||existsCompany.get(x.company)||existsEmail.get(email)||(x.website&&existsSite.get(x.website))){skipped++;continue;}
if(domain!==host&&!x.source){skipped++;continue;}seen.add(email);seen.add(key);
const id=Number(addUser.run(x.company,email,password,'client',x.company,x.phone).lastInsertRowid);
const service=x.service==='design'?'design gráfico e materiais comerciais':x.service==='redes'?'gestão de redes sociais':'design gráfico e comunicação nas redes sociais';
const proposal='Olá, sou o Nuno, da DUIT. Estive a conhecer a '+x.company+' e posso ajudar com '+service+'. Se lhe fizer sentido, terei gosto em conversar consigo. Cumprimentos, Nuno.';
addCrm.run(id,x.sector,x.location,x.website,x.opportunity,x.service,x.source+' — email profissional publicado na fonte indicada.',x.opportunity,x.observation+' Serviço sugerido: '+x.service+'. Fonte: '+x.source,proposal);added++;}})();
console.log('[crm] seed 2026-10-25:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-10-25:',e.message)}
