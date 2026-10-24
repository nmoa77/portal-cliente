const crypto=require('crypto');
const bcrypt=require('bcryptjs');
const db=require('./db');
const {wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Consultórios de Psicologia Dra. Cristina Cabral",
    "sector": "Psicologia clínica",
    "location": "Coimbra, Coimbra",
    "website": "https://psicologaclinicacristinacabral.pt/",
    "email": "geral@psicologaclinicacristinacabral.pt",
    "phone": "936 603 303",
    "source": "https://psicologaclinicacristinacabral.pt/contactos/",
    "observation": "Consultórios identificados em Coimbra, Cantanhede e Leiria.",
    "opportunity": "Apresentar consultas e localizações em materiais informativos.",
    "service": "design"
  },
  {
    "company": "João Santos Clínica",
    "sector": "Fisioterapia e saúde",
    "location": "Vizela, Braga",
    "website": "https://joaosantosclinica.pt/",
    "email": "info@joaosantosclinica.pt",
    "phone": "253 582 127",
    "source": "https://joaosantosclinica.pt/contactos/",
    "observation": "Clínica identificada pelo nome João Santos, com contactos em Vizela.",
    "opportunity": "Organizar apresentação visual das áreas de intervenção.",
    "service": "ambas"
  },
  {
    "company": "PSI Consultório de Psicologia",
    "sector": "Psicologia",
    "location": "Vila Nova de Gaia, Porto",
    "website": "https://consultoriopsi.pt/",
    "email": "geral@consultoriopsi.pt",
    "phone": "916 842 201",
    "source": "https://consultoriopsi.pt/contactos/",
    "observation": "Consultório de psicologia na Avenida da República, em Gaia.",
    "opportunity": "Criar materiais informativos sobre consultas e acompanhamento.",
    "service": "design"
  },
  {
    "company": "Neuro IN",
    "sector": "Fisioterapia neurológica",
    "location": "Viseu, Viseu",
    "website": "https://www.neuroin.pt/",
    "email": "geral@neuroin.pt",
    "phone": "961 319 588",
    "source": "https://www.neuroin.pt/equipa/",
    "observation": "Equipa de fisioterapia com intervenção neurológica em Viseu.",
    "opportunity": "Apresentar as áreas clínicas da equipa de forma acessível.",
    "service": "design"
  },
  {
    "company": "Physius",
    "sector": "Fisioterapia",
    "location": "Almada, Setúbal",
    "website": "https://physius.pt/",
    "email": "geral@physius.pt",
    "phone": "925 305 200",
    "source": "https://physius.pt/",
    "observation": "Clínica de fisioterapia em Almada que anuncia atendimento domiciliário.",
    "opportunity": "Criar comunicação sobre atendimento em clínica e domicílio.",
    "service": "ambas"
  },
  {
    "company": "Fisioclinic",
    "sector": "Fisioterapia e reabilitação",
    "location": "Funchal, Madeira",
    "website": "https://www.fisioclinic.pt/",
    "email": "geral@fisioclinic.pt",
    "phone": "291 751 393",
    "source": "https://www.fisioclinic.pt/servicos/paulo-nascimento/",
    "observation": "Clínica no Funchal que apresenta equipa e horários de atendimento.",
    "opportunity": "Desenvolver conteúdos sobre serviços e profissionais.",
    "service": "ambas"
  },
  {
    "company": "Palavras Tácteis",
    "sector": "Fisioterapia",
    "location": "Terrugem, Sintra, Lisboa",
    "website": "https://palavrastacteis.pt/",
    "email": "geral@palavrastacteis.pt",
    "phone": "966 906 169",
    "source": "https://palavrastacteis.pt/contactos/",
    "observation": "Clínica de fisioterapia com contacto público na Terrugem.",
    "opportunity": "Criar apresentação visual das valências da clínica.",
    "service": "design"
  },
  {
    "company": "Consigo Fisioterapia",
    "sector": "Fisioterapia",
    "location": "Amadora, Lisboa",
    "website": "https://www.consigofisioterapia.pt/",
    "email": "geral@consigofisioterapia.pt",
    "phone": "910 640 969",
    "source": "https://www.consigofisioterapia.pt/contactos-consigo-fisioterapia-amadora",
    "observation": "Serviço de fisioterapia na Urbanização Vila Chã, Amadora.",
    "opportunity": "Criar conteúdos informativos para utentes da clínica.",
    "service": "ambas"
  },
  {
    "company": "Clínica Cristina Matias",
    "sector": "Medicina dentária",
    "location": "Reguengos de Monsaraz, Évora",
    "website": "https://www.clinicacristinamatias.pt/",
    "email": "geral@clinicacristinamatias.pt",
    "phone": "266 503 748",
    "source": "https://fadadodente.pt/clinica/clinica-cristina-matias-reguengos-de-monsaraz",
    "observation": "Clínica dentária identificada pelo nome Cristina Matias, em Reguengos.",
    "opportunity": "Preparar materiais informativos de especialidades dentárias.",
    "service": "design"
  },
  {
    "company": "Clínica Médica Dentária Oceanus",
    "sector": "Medicina dentária",
    "location": "Ponta Delgada, Açores",
    "website": "https://www.clinicaoceanus.pt/",
    "email": "geral@clinicaoceanus.pt",
    "phone": "296 630 600",
    "source": "https://fadadodente.pt/clinica/clinica-medica-dentaria-oceanus-ponta-delgada",
    "observation": "Clínica dentária em Ponta Delgada com serviço de ortodontia listado.",
    "opportunity": "Criar comunicação visual das especialidades disponíveis.",
    "service": "design"
  },
  {
    "company": "Clínica Cor Alentejo",
    "sector": "Clínica médica multidisciplinar",
    "location": "Portalegre, Portalegre",
    "website": "https://clinicacoralentejo.pt/",
    "email": "geral@clinicacoralentejo.pt",
    "phone": "245 308 040",
    "source": "https://clinicacoralentejo.pt/especialidades/psicologia/",
    "observation": "Clínica em Portalegre que divulga várias especialidades médicas.",
    "opportunity": "Organizar apresentação das especialidades e contactos.",
    "service": "design"
  },
  {
    "company": "Clínica Médica da Ajuda",
    "sector": "Clínica médica",
    "location": "Funchal, Madeira",
    "website": "https://www.clinicamedicadaajuda.pt/",
    "email": "geral@clinicamedicadaajuda.pt",
    "phone": "291 773 948",
    "source": "https://www.clinicamedicadaajuda.pt/informacoes-uteis/",
    "observation": "Clínica do Funchal com medicina geral, especialidades e análises.",
    "opportunity": "Criar materiais explicativos de consultas e serviços.",
    "service": "design"
  },
  {
    "company": "Gentilcare",
    "sector": "Saúde e psicologia",
    "location": "Setúbal, Setúbal",
    "website": "https://gentilcare.pt/",
    "email": "geral@gentilcare.pt",
    "phone": "265 187 902",
    "source": "https://gentilcare.pt/services/psicologia/",
    "observation": "Espaço de saúde em Setúbal que apresenta serviço de psicologia.",
    "opportunity": "Desenvolver conteúdos de apresentação dos serviços.",
    "service": "ambas"
  },
  {
    "company": "Clínica Vaz Saúde",
    "sector": "Medicina dentária e especialidades",
    "location": "Bragança, Bragança",
    "website": "https://vazsaude.pt/",
    "email": "geral@vazsaude.pt",
    "phone": "273 404 493",
    "source": "https://vazsaude.pt/sobre-nos/",
    "observation": "Clínica em Bragança com medicina dentária e outras especialidades.",
    "opportunity": "Organizar portefólio de especialidades em suportes gráficos.",
    "service": "design"
  },
  {
    "company": "Fisioalbi",
    "sector": "Fisioterapia e centro terapêutico",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://fisioalbi.pt/",
    "email": "geral@fisioalbi.pt",
    "phone": "272 085 986",
    "source": "https://fisioalbi.pt/",
    "observation": "Centro de fisioterapia com duas moradas em Castelo Branco.",
    "opportunity": "Criar apresentação visual dos serviços e localizações.",
    "service": "design"
  },
  {
    "company": "Clínica Dr. Luís Marques",
    "sector": "Medicina dentária e geral",
    "location": "Guarda, Guarda",
    "website": "https://www.clinicadrlm.pt/",
    "email": "geral@clinicadrlm.pt",
    "phone": "271 223 676",
    "source": "https://www.clinicadrlm.pt/medicina-dentaria/",
    "observation": "Clínica na Guarda com especialidades de medicina dentária.",
    "opportunity": "Criar materiais informativos de especialidades.",
    "service": "design"
  },
  {
    "company": "Fisiart",
    "sector": "Fisioterapia e saúde",
    "location": "Proença-a-Nova, Castelo Branco",
    "website": "https://fisiart.pt/",
    "email": "geral@fisiart.pt",
    "phone": "274 673 210",
    "source": "https://fisiart.pt/especialidades/",
    "observation": "Clínica com atendimento em Proença-a-Nova e Castelo Branco.",
    "opportunity": "Comunicar serviços e localizações de forma organizada.",
    "service": "ambas"
  },
  {
    "company": "Clínica do Sorriso",
    "sector": "Medicina dentária e especialidades",
    "location": "Guarda, Guarda",
    "website": "https://clinicadosorriso.pt/",
    "email": "geral@clinicadosorriso.pt",
    "phone": "271 105 652",
    "source": "https://clinicadosorriso.pt/site/contact-me",
    "observation": "Clínica da Guarda com direção clínica de Rita Vilar.",
    "opportunity": "Criar peças informativas sobre especialidades da clínica.",
    "service": "design"
  },
  {
    "company": "Ent'Artes",
    "sector": "Escola de dança",
    "location": "Braga, Braga",
    "website": "https://entartes.pt/",
    "email": "geral@entartes.pt",
    "phone": "964 693 247",
    "source": "https://entartes.pt/Contactos.php",
    "observation": "Escola de dança em Braga com modalidades para diferentes idades.",
    "opportunity": "Criar comunicação gráfica de aulas e inscrições.",
    "service": "ambas"
  },
  {
    "company": "Chuva de Amor",
    "sector": "Comércio especializado",
    "location": "Faro, Faro",
    "website": "https://www.chuvadeamor.pt/",
    "email": "geral@chuvadeamor.pt",
    "phone": "919 691 093",
    "source": "https://www.chuvadeamor.pt/pages/contactos",
    "observation": "Loja física com atendimento na Rua Vasco da Gama, Faro.",
    "opportunity": "Desenvolver campanhas visuais para produtos da loja.",
    "service": "ambas"
  },
  {
    "company": "HARVITA",
    "sector": "Estúdio de Pilates",
    "location": "Marrazes, Leiria",
    "website": "https://www.harvita.pt/",
    "email": "geral@harvita.pt",
    "phone": "924 716 125",
    "source": "https://www.harvita.pt/contact",
    "observation": "Estúdio de Pilates em Marrazes que anuncia aulas individuais e duo.",
    "opportunity": "Criar materiais de divulgação dos formatos de aula.",
    "service": "ambas"
  },
  {
    "company": "V. Martins Imobiliária e Condomínios",
    "sector": "Imobiliário e gestão de condomínios",
    "location": "Bragança, Bragança",
    "website": "https://vm-imobiliaria.pt/",
    "email": "geral@vm-imobiliaria.pt",
    "phone": "273 107 674",
    "source": "https://vm-imobiliaria.pt/",
    "observation": "Agência em Bragança com mediação imobiliária e gestão de condomínios.",
    "opportunity": "Preparar apresentações de serviços imobiliários.",
    "service": "design"
  },
  {
    "company": "Restaurante O Portão",
    "sector": "Restauração",
    "location": "Ferreira do Alentejo, Beja",
    "website": "https://restauranteoportao.pt/",
    "email": "geral@restauranteoportao.pt",
    "phone": "284 739 591",
    "source": "https://restauranteoportao.pt/contactos/",
    "observation": "Restaurante em Ferreira do Alentejo que aceita reservas por email.",
    "opportunity": "Criar materiais de ementa e comunicação de reservas.",
    "service": "design"
  },
  {
    "company": "Sem-Fim",
    "sector": "Restauração",
    "location": "Monsaraz, Évora",
    "website": "https://sem-fim.com/",
    "email": "geral@sem-fim.com",
    "phone": "266 557 471",
    "source": "https://sem-fim.com/restaurante-sem-fim/",
    "observation": "Restaurante em Telheiro, Monsaraz, com horários publicados.",
    "opportunity": "Criar materiais de comunicação de gastronomia e horários.",
    "service": "ambas"
  },
  {
    "company": "B de Brincar",
    "sector": "Comércio de brinquedos",
    "location": "Évora, Évora",
    "website": "https://bdebrincar.com/",
    "email": "geral@bdebrincar.com",
    "phone": "928 115 946",
    "source": "https://bdebrincar.com/pages/contactos",
    "observation": "Loja de Évora identificada como Manobras de Brincadeira, Lda.",
    "opportunity": "Criar peças para divulgação de produtos e novidades.",
    "service": "ambas"
  },
  {
    "company": "Restaurante Santa Isabel",
    "sector": "Restauração",
    "location": "Abrantes, Santarém",
    "website": "http://restaurantesantaisabel.com",
    "email": "geral@restaurantesantaisabel.com",
    "phone": "916 777 068",
    "source": "https://www.visitportugal.com/pt-pt/content/santa-isabel",
    "observation": "Restaurante de cozinha regional em Abrantes listado no VisitPortugal.",
    "opportunity": "Criar comunicação gráfica de ementa e especialidades.",
    "service": "design"
  },
  {
    "company": "Casa Pimentel Bornes",
    "sector": "Turismo rural",
    "location": "Bornes, Macedo de Cavaleiros, Bragança",
    "website": "https://www.casapimentel.com/pt",
    "email": "reservas@casapimentel.com",
    "phone": "919 715 788",
    "source": "https://lifecooler.com/artigo/dormir/casa-pimentel-bornes/391720",
    "observation": "Turismo rural em Bornes com alojamento distribuído por duas casas.",
    "opportunity": "Criar apresentação visual de quartos e experiências de estadia.",
    "service": "ambas"
  },
  {
    "company": "Restaurante Alcides",
    "sector": "Restauração",
    "location": "Ponta Delgada, Açores",
    "website": "https://alcides.pt/",
    "email": "geral@alcides.pt",
    "phone": "296 282 677",
    "source": "https://www.acores9.com/places/restaurante-alcides/",
    "observation": "Restaurante de cozinha açoriana em Ponta Delgada associado à residencial Alcides.",
    "opportunity": "Criar materiais visuais para especialidades e alojamento.",
    "service": "ambas"
  },
  {
    "company": "ALC Dance Studios",
    "sector": "Escola de dança",
    "location": "Vila Nova de Gaia, Porto",
    "website": "https://www.alcdance.pt/",
    "email": "geral@alcdance.pt",
    "phone": "227 138 727",
    "source": "https://www.alcdance.pt/pages/professores-alcdance-studios",
    "observation": "Escola de dança em Vila Nova de Gaia que apresenta professores.",
    "opportunity": "Criar materiais de divulgação de aulas e professores.",
    "service": "ambas"
  },
  {
    "company": "Quinta da Amendoeira",
    "sector": "Alojamento e restauração",
    "location": "Évora, Évora",
    "website": "https://www.quintadaamendoeira.com/",
    "email": "geral@quintadaamendoeira.com",
    "phone": "926 300 004",
    "source": "https://www.quintadaamendoeira.com/restaurante",
    "observation": "Quinta em Évora com alojamento e restaurante Flor da Amendoeira.",
    "opportunity": "Criar comunicação integrada de estadias e restaurante.",
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
db.transaction(()=>{for(const x of L){const email=x.email.trim().toLowerCase();const key=x.company.trim().toLowerCase();const domain=email.split('@')[1];const host=new URL(x.website).hostname.toLowerCase().replace(/^www\./,'');const forbidden=/^(gmail\.com|hotmail\.com|outlook\.com|yahoo\.com|icloud\.com|sapo\.pt)$/i;
if(!domain||forbidden.test(domain)||email.startsWith('noreply@')||wasDeleted(email)||seen.has(email)||seen.has(key)||existsCompany.get(x.company)||existsEmail.get(email)||existsSite.get(x.website)){skipped++;continue;}
if(domain!==host&&!x.source){skipped++;continue;}seen.add(email);seen.add(key);
const id=Number(addUser.run(x.company,email,password,'client',x.company,x.phone).lastInsertRowid);
const service=x.service==='design'?'design gráfico e materiais comerciais':x.service==='redes'?'gestão de redes sociais':'design gráfico e comunicação nas redes sociais';
const proposal='Olá, sou o Nuno, da DUIT. Estive a conhecer a '+x.company+' e posso ajudar com '+service+'. Se lhe fizer sentido, terei gosto em conversar consigo. Cumprimentos, Nuno.';
addCrm.run(id,x.sector,x.location,x.website,x.opportunity,x.service,x.source+' — email profissional publicado na fonte indicada.',x.opportunity,x.observation+' Serviço sugerido: '+x.service+'. Fonte: '+x.source,proposal);added++;}})();
console.log('[crm] seed 2026-10-24:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-10-24:',e.message)}
