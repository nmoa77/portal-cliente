const crypto=require('crypto');
const bcrypt=require('bcryptjs');
const db=require('./db');
const {wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Ana Magalhães — Psicologia e Psicoterapia",
    "sector": "Psicologia clínica",
    "location": "Porto, Porto",
    "website": "https://www.anamagalhaes.pt/",
    "email": "info@anamagalhaes.pt",
    "phone": "965 475 736",
    "source": "https://www.anamagalhaes.pt/contactos",
    "observation": "Consultório de psicologia clínica e psicoterapia no Porto.",
    "opportunity": "Materiais informativos sobre modalidades de consulta.",
    "service": "design"
  },
  {
    "company": "Dulce Silva — Psicóloga Clínica",
    "sector": "Psicologia clínica",
    "location": "Lisboa, Lisboa",
    "website": "https://www.dulcesilvapsicologia.pt/",
    "email": "consultorio@dulcesilvapsicologia.pt",
    "phone": "916 413 992",
    "source": "https://www.dulcesilvapsicologia.pt/contacto",
    "observation": "Consultório na Avenida 5 de Outubro com consultas presenciais e online.",
    "opportunity": "Apresentar os formatos de consulta em peças informativas.",
    "service": "design"
  },
  {
    "company": "Inês Barbosa — Psicóloga Clínica",
    "sector": "Psicologia clínica",
    "location": "Paredes, Porto",
    "website": "https://www.inesbarbosa.com/",
    "email": "psicologia@inesbarbosa.com",
    "phone": "914 300 592",
    "source": "https://www.inesbarbosa.com/",
    "observation": "Profissional com consultas presenciais em Paredes e online.",
    "opportunity": "Organizar informação das áreas de acompanhamento em materiais gráficos.",
    "service": "design"
  },
  {
    "company": "Priscila Oliveira — Nutricionista",
    "sector": "Nutrição",
    "location": "Senhora da Hora, Matosinhos, Porto",
    "website": "https://nutricionistapriscilaoliveira.pt/",
    "email": "contato@nutricionistapriscilaoliveira.pt",
    "phone": "928 422 525",
    "source": "https://nutricionistapriscilaoliveira.pt/contacto",
    "observation": "Consultório de nutrição na Senhora da Hora com consultas presenciais e online.",
    "opportunity": "Criar materiais de apresentação das consultas.",
    "service": "design"
  },
  {
    "company": "Diana Ferreira — Nutricionista",
    "sector": "Nutrição",
    "location": "Leiria, Leiria",
    "website": "https://nutricionistadianaferreira.pt/",
    "email": "diana@nutricionistadianaferreira.pt",
    "phone": "928 124 183",
    "source": "https://nutricionistadianaferreira.pt/contactos/",
    "observation": "Consultas em Leiria, Batalha e online.",
    "opportunity": "Comunicar os locais e formatos de consulta em suportes digitais.",
    "service": "design"
  },
  {
    "company": "Ana Lucas Rebelo — Nutricionista",
    "sector": "Nutrição",
    "location": "Aveiro, Aveiro",
    "website": "https://analucasrebelo.com/",
    "email": "consultas@analucasrebelo.com",
    "phone": "",
    "source": "https://analucasrebelo.com/contacto/",
    "observation": "Nutricionista com consultório profissional na Rua de Angola, Aveiro.",
    "opportunity": "Preparar conteúdos de apresentação dos serviços de nutrição.",
    "service": "ambas"
  },
  {
    "company": "Mónica Oliveira — Psicóloga",
    "sector": "Psicologia clínica",
    "location": "Vila Nova de Gaia, Porto",
    "website": "https://www.psicologamonicaoliveira.com/",
    "email": "contato@psicologamonicaoliveira.com",
    "phone": "912 634 791",
    "source": "https://www.psicologamonicaoliveira.com/contato",
    "observation": "Psicóloga com atendimento profissional em Vila Nova de Gaia.",
    "opportunity": "Criar peças de apresentação da prática clínica.",
    "service": "design"
  },
  {
    "company": "Priscila Orpinelli — Psicóloga",
    "sector": "Psicologia e neuropsicologia",
    "location": "Santarém, Santarém",
    "website": "https://www.priscilaorpinelli.com/",
    "email": "atendimento@priscilaorpinelli.com",
    "phone": "937 203 197",
    "source": "https://www.priscilaorpinelli.com/",
    "observation": "Psicóloga com consultório na Quinta de São Roque, Santarém.",
    "opportunity": "Criar suportes informativos sobre as áreas de consulta.",
    "service": "design"
  },
  {
    "company": "Ana Martins — Nutricionista",
    "sector": "Nutrição",
    "location": "Barcelos, Braga",
    "website": "https://anamartinsnutri.com/",
    "email": "geral@anamartinsnutri.com",
    "phone": "917 002 843",
    "source": "https://anamartinsnutri.com/pages/contact",
    "observation": "Nutricionista com local de atendimento na Avenida da Liberdade, Barcelos.",
    "opportunity": "Organizar informação das consultas em materiais digitais.",
    "service": "design"
  },
  {
    "company": "Mónica Borba — Fisioterapia",
    "sector": "Fisioterapia",
    "location": "Angra do Heroísmo, Açores",
    "website": "https://monicaborbafisio.pt/",
    "email": "geral@monicaborbafisio.pt",
    "phone": "963 430 012",
    "source": "https://monicaborbafisio.pt/",
    "observation": "Fisioterapeuta com gabinete e atendimento ao domicílio na ilha Terceira.",
    "opportunity": "Apresentar as modalidades de atendimento em materiais gráficos.",
    "service": "design"
  },
  {
    "company": "Consultório de Psicologia do Porto",
    "sector": "Psicologia clínica",
    "location": "Porto, Porto",
    "website": "https://www.psicologiaporto.com/",
    "email": "geral@psicologiaporto.com",
    "phone": "223 212 085",
    "source": "https://www.psicologiaporto.com/",
    "observation": "Consultório na Rua da Constituição, Porto, identificado como Raquel Lira Unipessoal.",
    "opportunity": "Criar suportes informativos de consulta e marcação.",
    "service": "design"
  },
  {
    "company": "Chez Psi — Consultório de Psicologia e Psiquiatria",
    "sector": "Psicologia e psiquiatria",
    "location": "Porto, Porto",
    "website": "https://chezpsi.pt/",
    "email": "info@chezpsi.pt",
    "phone": "927 659 307",
    "source": "https://chezpsi.pt/contacto/",
    "observation": "Consultório de psicologia e psiquiatria na Rua São João de Brito.",
    "opportunity": "Criar apresentação clara das áreas de consulta.",
    "service": "design"
  },
  {
    "company": "Clínica de Psicologia Ágata Marques",
    "sector": "Psicologia clínica",
    "location": "Porto, Porto",
    "website": "https://agatamarques.com/",
    "email": "info@agatamarques.com",
    "phone": "913 297 700",
    "source": "https://agatamarques.com/contactos/",
    "observation": "Clínica com profissionais de psicologia clínica na Rua Professor Manuel Baganha.",
    "opportunity": "Apresentar especialidades e equipa em peças informativas.",
    "service": "design"
  },
  {
    "company": "PsicOeiras",
    "sector": "Psicologia",
    "location": "Oeiras, Lisboa",
    "website": "https://www.psicoeiras.pt/",
    "email": "info@psicoeiras.pt",
    "phone": "931 369 339",
    "source": "https://www.psicoeiras.pt/contactos",
    "observation": "Serviço de psicologia com dois locais de atendimento em Oeiras.",
    "opportunity": "Criar peças de informação sobre consultas e localizações.",
    "service": "design"
  },
  {
    "company": "Fisiohealth",
    "sector": "Fisioterapia",
    "location": "Faro, Faro",
    "website": "https://fisiohealth.pt/",
    "email": "geral@fisiohealth.pt",
    "phone": "289 847 877",
    "source": "https://fisiohealth.pt/contato/",
    "observation": "Centro de fisioterapia na Praceta Francisco Brito do Vale, Faro.",
    "opportunity": "Criar apresentação dos serviços e da localização.",
    "service": "design"
  },
  {
    "company": "Motriviana",
    "sector": "Fisioterapia e bem-estar",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://motriviana.pt/",
    "email": "clinica@motriviana.com",
    "phone": "258 843 065",
    "source": "https://motriviana.pt/marcacoes/",
    "observation": "Clínica com fisioterapia, osteopatia, massagens e estética avançada.",
    "opportunity": "Organizar materiais gráficos das diferentes valências.",
    "service": "design"
  },
  {
    "company": "DarqueMed",
    "sector": "Fisioterapia",
    "location": "Darque, Viana do Castelo",
    "website": "https://darquemed.pt/",
    "email": "darquemed@darquemed.pt",
    "phone": "258 330 231",
    "source": "https://darquemed.pt/contactos/",
    "observation": "Clínica de fisioterapia em Darque com consultas de especialidade.",
    "opportunity": "Criar peças informativas para marcações e serviços.",
    "service": "design"
  },
  {
    "company": "Click Saúde & Bem-Estar",
    "sector": "Fisioterapia e bem-estar",
    "location": "Horta, Açores",
    "website": "https://clickonline.pt/",
    "email": "rececao@clickonline.pt",
    "phone": "292 700 443",
    "source": "https://clickonline.pt/",
    "observation": "Centro de fisioterapia na ilha do Faial com atendimento em clínica e ao domicílio.",
    "opportunity": "Criar comunicação visual das modalidades de atendimento.",
    "service": "ambas"
  },
  {
    "company": "Fisio3",
    "sector": "Fisioterapia",
    "location": "Angra do Heroísmo, Açores",
    "website": "https://www.fisio3.pt/",
    "email": "geral@fisio3.pt",
    "phone": "295 628 333",
    "source": "https://www.fisio3.pt/contactos",
    "observation": "Clínica de fisioterapia na Rua do Palácio, Angra do Heroísmo.",
    "opportunity": "Preparar materiais informativos sobre serviços e marcações.",
    "service": "design"
  },
  {
    "company": "CSG Clinic — São Gonçalo",
    "sector": "Clínica de saúde",
    "location": "Ponta Delgada, Açores",
    "website": "https://www.csgclinic.com/",
    "email": "geral@csgclinic.com",
    "phone": "296 650 390",
    "source": "https://www.csgclinic.com/contactos",
    "observation": "Clínica de saúde em Ponta Delgada com contacto profissional de marcações.",
    "opportunity": "Criar suportes de apresentação das especialidades.",
    "service": "design"
  },
  {
    "company": "Symetrix Pilates & Functional Training Studio",
    "sector": "Pilates e treino funcional",
    "location": "Funchal, Madeira",
    "website": "https://symetrix.pt/",
    "email": "geral@symetrix.pt",
    "phone": "291 743 464",
    "source": "https://symetrix.pt/index.php/en/contacts",
    "observation": "Estúdio de pilates e treino funcional no Funchal.",
    "opportunity": "Criar peças gráficas para modalidades e horários.",
    "service": "ambas"
  },
  {
    "company": "Pilates & Beyond Algarve",
    "sector": "Pilates",
    "location": "Portimão, Faro",
    "website": "https://pilatesnbeyond.pt/",
    "email": "info@pilatesnbeyond.pt",
    "phone": "961 084 847",
    "source": "https://pilatesnbeyond.pt/contact.html",
    "observation": "Estúdio de Pilates Reformer na Avenida Francisco Sá Carneiro, Portimão.",
    "opportunity": "Preparar materiais de apresentação de aulas e planos.",
    "service": "design"
  },
  {
    "company": "Pro Health & Fitness",
    "sector": "Pilates, fisioterapia e treino",
    "location": "Setúbal, Setúbal",
    "website": "https://www.proaventuras.com/",
    "email": "info@proaventuras.com",
    "phone": "913 405 602",
    "source": "https://www.proaventuras.com/",
    "observation": "Espaço em Setúbal com pilates, fisioterapia e treino.",
    "opportunity": "Criar comunicação visual para modalidades e horários.",
    "service": "ambas"
  },
  {
    "company": "Hotel Rural Santo António",
    "sector": "Hotel rural",
    "location": "Arronches, Portalegre",
    "website": "https://www.santoantoniohotel.com/",
    "email": "reservas@santoantoniohotel.com",
    "phone": "245 589 003",
    "source": "https://www.santoantoniohotel.com/en/",
    "observation": "Hotel rural em Arronches com restaurante e espaços de lazer.",
    "opportunity": "Criar materiais comerciais para estadias e serviços.",
    "service": "design"
  },
  {
    "company": "Estalagem do Vale",
    "sector": "Hotel rural",
    "location": "São Vicente, Madeira",
    "website": "https://estalagemdovale.com/",
    "email": "estalagemdovale@estalagemdovale.com",
    "phone": "291 840 160",
    "source": "https://www.visitportugal.com/pt-pt/content/estalagem-do-vale-2",
    "observation": "Hotel rural de 40 quartos em São Vicente, Madeira, registado no Turismo de Portugal.",
    "opportunity": "Criar peças de apresentação do alojamento e experiências.",
    "service": "design"
  },
  {
    "company": "Omega Natura",
    "sector": "Comércio de produtos naturais",
    "location": "Porto, Porto",
    "website": "https://omeganatura.pt/",
    "email": "geral@omeganatura.pt",
    "phone": "224 037 364",
    "source": "https://omeganatura.pt/contactos/",
    "observation": "Loja de produtos naturais na Rua Padre Alexandre, Porto, com loja online.",
    "opportunity": "Criar materiais gráficos para categorias de produtos.",
    "service": "design"
  },
  {
    "company": "DNA — Dance N'Arts School",
    "sector": "Escola de dança e artes",
    "location": "Coimbra, Coimbra",
    "website": "https://dnaschool.pt/",
    "email": "secretaria@dnaschool.pt",
    "phone": "913 802 049",
    "source": "https://dnaschool.pt/",
    "observation": "Escola de dança, música e artes performativas em Coimbra.",
    "opportunity": "Criar suportes de divulgação de cursos e inscrições.",
    "service": "ambas"
  },
  {
    "company": "LPstudio — Estúdio de Dança",
    "sector": "Escola de dança",
    "location": "Aveiro, Aveiro",
    "website": "https://lpstudio.pt/",
    "email": "lpstudio@lpstudio.pt",
    "phone": "234 338 394",
    "source": "https://lpstudio.pt/contactos/",
    "observation": "Estúdio de dança na Rua Nova de Vilar, Aveiro.",
    "opportunity": "Criar materiais gráficos para modalidades e inscrições.",
    "service": "ambas"
  },
  {
    "company": "Do Largo",
    "sector": "Restauração e brunch",
    "location": "Évora, Évora",
    "website": "https://www.dolargo.pt/",
    "email": "geral@dolargo.pt",
    "phone": "266 095 250",
    "source": "https://www.dolargo.pt/contactos/",
    "observation": "Restaurante de brunch no Largo de Álvaro Velho, Évora.",
    "opportunity": "Criar peças gráficas de apresentação de menus e horários.",
    "service": "design"
  },
  {
    "company": "EBA — Escola de Bailado de Aveiro",
    "sector": "Escola de dança",
    "location": "Anadia, Aveiro",
    "website": "",
    "email": "geral@eba.com.pt",
    "phone": "234 426 143",
    "source": "https://viveranadia.pt/comercio/eba-escola-de-bailado-de-aveiro/",
    "observation": "Escola de bailado com aulas para diferentes idades em Anadia.",
    "opportunity": "Criar materiais de divulgação de modalidades e inscrições.",
    "service": "design"
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
console.log('[crm] seed 2026-10-27:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-10-27:',e.message)}
