const crypto=require('crypto');
const bcrypt=require('bcryptjs');
const db=require('./db');
const {wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Actifisio",
    "sector": "Fisioterapia",
    "location": "Coimbra, Coimbra",
    "website": "https://www.actifisio.pt/",
    "email": "geral@actifisio.pt",
    "phone": "919 090 510",
    "source": "https://www.actifisio.pt/",
    "observation": "Clínica de fisioterapia com atendimento em Coimbra e Figueira da Foz.",
    "opportunity": "Criar materiais de apresentação das duas localizações e serviços.",
    "service": "design"
  },
  {
    "company": "Encanto Clínica",
    "sector": "Psicologia e psiquiatria",
    "location": "Montemor-o-Novo, Évora",
    "website": "https://www.encantoclinica.pt/",
    "email": "geral@encantoclinica.pt",
    "phone": "927 465 938",
    "source": "https://www.encantoclinica.pt/new-page07a77335",
    "observation": "Consultório com psicologia, psiquiatria e pedopsiquiatria em Montemor-o-Novo.",
    "opportunity": "Desenvolver peças informativas sobre consultas e especialidades.",
    "service": "design"
  },
  {
    "company": "Intrafisio",
    "sector": "Fisioterapia e medicina",
    "location": "Coimbra, Coimbra",
    "website": "https://www.intrafisio.pt/",
    "email": "geral@intrafisio.pt",
    "phone": "239 821 659",
    "source": "https://www.intrafisio.pt/contactos",
    "observation": "Centro de fisioterapia e medicina na Rua de Aveiro, Coimbra.",
    "opportunity": "Apresentar modalidades de fisioterapia em suportes gráficos.",
    "service": "design"
  },
  {
    "company": "Fisiminho",
    "sector": "Fisioterapia e pilates",
    "location": "Braga, Braga",
    "website": "https://fisiminho.pt/",
    "email": "geral@fisiminho.pt",
    "phone": "253 251 524",
    "source": "https://fisiminho.pt/content/fisioterapia",
    "observation": "Centro de fisioterapia e reabilitação em Dume, Braga.",
    "opportunity": "Preparar comunicação visual das áreas de reabilitação.",
    "service": "design"
  },
  {
    "company": "Valebesteiros Saúde",
    "sector": "Clínica médica",
    "location": "Viseu, Viseu",
    "website": "https://valebesteiros.pt/",
    "email": "geral@valebesteiros.pt",
    "phone": "232 853 800",
    "source": "https://valebesteiros.pt/clinica-viseu/",
    "observation": "Clínica em Viseu com serviços de saúde e atendimento ao domicílio.",
    "opportunity": "Criar materiais explicativos das valências disponíveis.",
    "service": "ambas"
  },
  {
    "company": "Leirivida",
    "sector": "Fisioterapia e saúde",
    "location": "Leiria, Leiria",
    "website": "https://leirivida.pai.pt/",
    "email": "geral@leirivida.pt",
    "phone": "244 827 000",
    "source": "https://leirivida.pai.pt/fisioterapia",
    "observation": "Clínica de fisioterapia com unidade em Leiria e referência à Marinha Grande.",
    "opportunity": "Organizar informação sobre serviços e unidades em peças gráficas.",
    "service": "design"
  },
  {
    "company": "Fisiomobilidade",
    "sector": "Fisioterapia e reabilitação",
    "location": "Caranguejeira, Leiria",
    "website": "https://fisiomobilidade.pt/",
    "email": "geral@fisiomobilidade.pt",
    "phone": "244 739 175",
    "source": "https://fisiomobilidade.pt/",
    "observation": "Clínica com atendimento na Caranguejeira e em Fátima.",
    "opportunity": "Criar peças de divulgação dos serviços por localização.",
    "service": "ambas"
  },
  {
    "company": "Clínica Zela Pra Si",
    "sector": "Medicina dentária",
    "location": "Sertã, Castelo Branco",
    "website": "https://www.clinica-zelaprasi.pt/",
    "email": "geral@clinica-zelaprasi.pt",
    "phone": "274 608 185",
    "source": "https://fadadodente.pt/clinica/clinica-zela-pra-si-serta",
    "observation": "Clínica dentária na Sertã, identificada num diretório setorial com contactos.",
    "opportunity": "Desenvolver materiais de apresentação das especialidades.",
    "service": "design"
  },
  {
    "company": "Camila Monteiro Fisioterapia",
    "sector": "Fisioterapia independente",
    "location": "Pombal, Leiria",
    "website": "https://www.camilamonteiro.pt/",
    "email": "geral@camilamonteiro.pt",
    "phone": "915 712 032",
    "source": "https://www.camilamonteiro.pt/",
    "observation": "Profissional de fisioterapia com gabinete em Pombal e pilates clínico.",
    "opportunity": "Preparar conteúdos gráficos sobre serviços de fisioterapia.",
    "service": "ambas"
  },
  {
    "company": "Filipe Cachopas Fisioterapia",
    "sector": "Fisioterapia independente",
    "location": "Cascais, Lisboa",
    "website": "https://filipecachopas.pt/",
    "email": "geral@filipecachopas.pt",
    "phone": "927 979 699",
    "source": "https://filipecachopas.pt/project/fisioterapia-ao-domicilio/",
    "observation": "Atividade de fisioterapia com opção de atendimento ao domicílio.",
    "opportunity": "Criar materiais informativos sobre modalidades de atendimento.",
    "service": "design"
  },
  {
    "company": "Maria João Nobre",
    "sector": "Psicologia clínica independente",
    "location": "Lisboa, Lisboa",
    "website": "https://mariajoaonobre.pt/",
    "email": "info@mariajoaonobre.pt",
    "phone": "964 006 126",
    "source": "https://mariajoaonobre.pt/",
    "observation": "Psicóloga clínica com consultas presenciais em Lisboa e online.",
    "opportunity": "Organizar a apresentação visual das modalidades de consulta.",
    "service": "design"
  },
  {
    "company": "innerWays",
    "sector": "Psicologia e psicoterapia",
    "location": "Lisboa, Lisboa",
    "website": "https://www.innerways.pt/",
    "email": "info@innerways.pt",
    "phone": "964 476 422",
    "source": "https://www.innerways.pt/marcacoes-e-contactos/",
    "observation": "Consultório de psicologia e psicoterapia em Lisboa.",
    "opportunity": "Desenvolver materiais informativos para marcações e consultas.",
    "service": "design"
  },
  {
    "company": "VMPSI",
    "sector": "Psicologia e psicoterapia",
    "location": "Setúbal, Setúbal",
    "website": "https://www.vmpsi.pt/",
    "email": "geral@vmpsi.pt",
    "phone": "933 851 576",
    "source": "https://www.vmpsi.pt/contactos/",
    "observation": "Consultório de psicologia e psicoterapia na Avenida 5 de Outubro, Setúbal.",
    "opportunity": "Criar peças de apresentação das consultas disponíveis.",
    "service": "design"
  },
  {
    "company": "Bruno Miranda — Psicólogo",
    "sector": "Psicologia clínica independente",
    "location": "Montemor-o-Velho, Coimbra",
    "website": "https://consultapsicologiaonline.pt/",
    "email": "apoiocliente@consultapsicologiaonline.pt",
    "phone": "928 350 522",
    "source": "https://consultapsicologiaonline.pt/contactos/",
    "observation": "Psicólogo clínico com consultas online e sede fiscal em Montemor-o-Velho.",
    "opportunity": "Criar materiais explicativos do serviço de psicologia online.",
    "service": "ambas"
  },
  {
    "company": "Lia Faria Nutricionista",
    "sector": "Nutrição",
    "location": "Guimarães, Braga / Santo Tirso, Porto",
    "website": "https://liafarianutricionista.com/",
    "email": "info@liafarianutricionista.com",
    "phone": "910 535 605",
    "source": "https://liafarianutricionista.com/contactos/",
    "observation": "Nutricionista com consultas online e parcerias presenciais em Guimarães e Santo Tirso.",
    "opportunity": "Apresentar modalidades de consulta e marcação em materiais gráficos.",
    "service": "design"
  },
  {
    "company": "Nutrição com Peso e Medida",
    "sector": "Nutrição independente",
    "location": "Figueira da Foz, Coimbra",
    "website": "https://nutricaocompesoemedida.pt/",
    "email": "andreia@nutricaocompesoemedida.pt",
    "phone": "967 743 512",
    "source": "https://nutricaocompesoemedida.pt/contactos/",
    "observation": "Projeto de nutrição da nutricionista Andreia Nascimento, identificada na Figueira da Foz.",
    "opportunity": "Criar peças para explicar serviços e eventos de nutrição.",
    "service": "ambas"
  },
  {
    "company": "Dr. Fernando Mesquita",
    "sector": "Psicologia clínica independente",
    "location": "Lisboa, Lisboa",
    "website": "https://www.fernandomesquita.net/",
    "email": "sexualideias@fernandomesquita.net",
    "phone": "969 091 221",
    "source": "https://www.fernandomesquita.net/contacto",
    "observation": "Psicólogo clínico e terapeuta sexual com consultório no Campo Grande, Lisboa.",
    "opportunity": "Desenvolver materiais de informação sobre consultas.",
    "service": "design"
  },
  {
    "company": "Herdade Vale de Cabras",
    "sector": "Turismo e alojamento rural",
    "location": "Portel, Évora",
    "website": "https://www.valedecabras.pt/",
    "email": "info@valedecabras.pt",
    "phone": "912 489 592",
    "source": "https://www.valedecabras.pt/contact/",
    "observation": "Alojamento de pequena dimensão em Portel com reservas diretas.",
    "opportunity": "Criar peças visuais para apresentação de estadias e experiências.",
    "service": "ambas"
  },
  {
    "company": "Herdadinha",
    "sector": "Alojamento local e eventos",
    "location": "Vimieiro, Évora",
    "website": "https://herdadinha.pt/",
    "email": "geral@herdadinha.pt",
    "phone": "266 419 007",
    "source": "https://herdadinha.pt/contactos/",
    "observation": "Alojamento local em Vimieiro com eventos e casamentos.",
    "opportunity": "Preparar materiais gráficos para alojamento e eventos.",
    "service": "ambas"
  },
  {
    "company": "Agroturismo Xistos",
    "sector": "Agroturismo",
    "location": "Beja, Beja",
    "website": "http://www.xistos.pt/",
    "email": "reservas@xistos.pt",
    "phone": "964 814 928",
    "source": "https://greenkey.abaae.pt/empreendimento/agroturismo-xistos/",
    "observation": "Empreendimento de agroturismo em Beja identificado pelo programa Green Key.",
    "opportunity": "Desenvolver materiais de apresentação do alojamento.",
    "service": "design"
  },
  {
    "company": "Centro de Línguas de Lagos",
    "sector": "Ensino de línguas",
    "location": "Lagos, Faro",
    "website": "https://www.centrodelinguas.com/",
    "email": "info@centrodelinguas.com",
    "phone": "282 761 070",
    "source": "https://www.centrodelinguas.com/en/",
    "observation": "Escola de línguas em Lagos com aulas de grupo e particulares.",
    "opportunity": "Criar suportes gráficos para apresentar cursos e horários.",
    "service": "ambas"
  },
  {
    "company": "Academia de Línguas Mais",
    "sector": "Ensino de línguas",
    "location": "Faro, Faro",
    "website": "https://academialinguasmais.pt/",
    "email": "geral@formacaoalgarve.pt",
    "phone": "926 025 196",
    "source": "https://academialinguasmais.pt/contacto.php",
    "observation": "Academia de línguas em Faro; o site oficial identifica FormAlgarve como marca da mesma empresa e divulga o email.",
    "opportunity": "Desenvolver peças de apresentação dos cursos presenciais e online.",
    "service": "design"
  },
  {
    "company": "CLCC Portimão",
    "sector": "Ensino de línguas",
    "location": "Portimão, Faro",
    "website": "https://www.clcc.pt/",
    "email": "geral@clcc.pt",
    "phone": "282 430 250",
    "source": "https://www.clcc.pt/formulario-de-contacto-cursos.aspx",
    "observation": "Centro de línguas em Portimão com contactos para cursos.",
    "opportunity": "Criar materiais visuais de divulgação de cursos.",
    "service": "design"
  },
  {
    "company": "FitPlus",
    "sector": "Ginásio",
    "location": "Angra do Heroísmo, Açores",
    "website": "https://fitplus.pt/",
    "email": "geral@fitplus.pt",
    "phone": "295 333 586",
    "source": "https://fitplus.pt/",
    "observation": "Ginásio identificado no Terceira Mar Hotel, em Angra do Heroísmo.",
    "opportunity": "Criar conteúdos e materiais de divulgação das atividades.",
    "service": "ambas"
  },
  {
    "company": "Veramar Pilates Studio",
    "sector": "Estúdio de pilates",
    "location": "Mindelo, Vila do Conde, Porto",
    "website": "https://veramarpilatesstudio.pt/",
    "email": "geral@veramarpilatesstudio.pt",
    "phone": "",
    "source": "https://veramarpilatesstudio.pt/contacto/",
    "observation": "Estúdio de pilates com espaço na Praia de Mindelo.",
    "opportunity": "Criar materiais de apresentação de sessões e modalidades.",
    "service": "ambas"
  },
  {
    "company": "Natualma",
    "sector": "Pilates, yoga e terapias",
    "location": "Vila Nova de Gaia, Porto",
    "website": "https://natualma.pt/",
    "email": "info@natualma.pt",
    "phone": "939 389 265",
    "source": "https://natualma.pt/",
    "observation": "Estúdio de pilates, yoga e terapias em Santa Marinha, Gaia.",
    "opportunity": "Desenvolver conteúdos informativos sobre as atividades.",
    "service": "ambas"
  },
  {
    "company": "Casas da Vereda",
    "sector": "Alojamento turístico",
    "location": "Estreito da Calheta, Madeira",
    "website": "https://www.casasdavereda.com/",
    "email": "info@casasdavereda.com",
    "phone": "917 778 812",
    "source": "https://visitmadeira.com/fr/ou-sejourner/hebergement/casas-da-vereda/",
    "observation": "Alojamento turístico no Estreito da Calheta divulgado pelo turismo da Madeira.",
    "opportunity": "Criar peças de apresentação das unidades e da experiência de estadia.",
    "service": "ambas"
  },
  {
    "company": "Prana Yoga e Pilates",
    "sector": "Yoga e pilates",
    "location": "São João da Madeira, Aveiro",
    "website": "https://www.pranayogapilates.pt/",
    "email": "prana@pranayogapilates.pt",
    "phone": "963 320 638",
    "source": "https://www.pranayogapilates.pt/contacto/",
    "observation": "Estúdio de yoga e pilates em São João da Madeira.",
    "opportunity": "Criar peças para apresentação de aulas e modalidades.",
    "service": "ambas"
  },
  {
    "company": "Ericeira Waves Surf School",
    "sector": "Escola de surf",
    "location": "Ericeira, Lisboa",
    "website": "https://www.ericeirawaves.com/",
    "email": "info@ericeirawaves.com",
    "phone": "916 000 123",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/ericeira",
    "observation": "Escola de surf na Ericeira identificada no portal oficial VisitPortugal.",
    "opportunity": "Preparar materiais visuais para aulas e experiências de surf.",
    "service": "ambas"
  },
  {
    "company": "Fish Surf School",
    "sector": "Escola de surf",
    "location": "Portugal — localidade a confirmar",
    "website": "https://fishsurfschool.com/",
    "email": "info@fishsurfschool.com",
    "phone": "916 082 218",
    "source": "https://www.flytap.com/pt-mz/stopover/parceiros",
    "observation": "Escola de surf identificada como parceira de experiências no programa Stopover da TAP.",
    "opportunity": "Criar peças de apresentação de aulas e experiências.",
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
console.log('[crm] seed 2026-10-26:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-10-26:',e.message)}
