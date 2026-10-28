// DUIT — 2026-10-28. Fontes de email profissional verificadas publicamente nesta data.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Centro de Hipnoterapia — A Terapia da Pessoa",
    "sector": "Psicologia e hipnoterapia",
    "email_area": "Saúde",
    "location": "Bragança, Bragança",
    "website": "https://centrohipnoterapia.pt/",
    "email": "geral@centrohipnoterapia.pt",
    "phone": "915 128 646",
    "source": "https://centrohipnoterapia.pt/hipnoterapia-a-terapia-da-pessoa/",
    "observation": "Centro de hipnoterapia e psicologia em Bragança.",
    "opportunity": "Criar materiais informativos sobre consultas e modalidades.",
    "service": "design"
  },
  {
    "company": "Clínica Médica Avançada Isabel Eirô",
    "sector": "Clínica médica e nutrição",
    "email_area": "Saúde",
    "location": "Vila Real, Vila Real",
    "website": "https://clinica-avancada.pt/",
    "email": "geral@clinica-avancada.pt",
    "phone": "259 378 188",
    "source": "https://clinica-avancada.pt/especialidades/nutricao/",
    "observation": "Clínica de Vila Real com consulta de nutrição e outras especialidades.",
    "opportunity": "Organizar peças visuais para explicar as especialidades.",
    "service": "design"
  },
  {
    "company": "CLIPSA",
    "sector": "Fisioterapia e cuidados de saúde",
    "email_area": "Saúde",
    "location": "Silves, Faro",
    "website": "https://www.clipsa.pt/",
    "email": "geral@clipsa.pt",
    "phone": "282 443 306",
    "source": "https://www.clipsa.pt/marcar-consulta",
    "observation": "Clínica com atendimento em Silves, Armação de Pêra e Portimão.",
    "opportunity": "Criar comunicação gráfica diferenciada por unidade.",
    "service": "ambas"
  },
  {
    "company": "Alojamento Girassol",
    "sector": "Alojamento local",
    "email_area": "Turismo & Alojamento",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://alojamentogirassol.pt/",
    "email": "geral@alojamentogirassol.pt",
    "phone": "966 358 488",
    "source": "https://alojamentogirassol.pt/destaques",
    "observation": "Alojamento local com licença 112005/AL em Castelo Branco.",
    "opportunity": "Apresentar comodidades e informações de reserva em peças digitais.",
    "service": "design"
  },
  {
    "company": "Centro de Reabilitação Neurocorpus",
    "sector": "Fisioterapia e reabilitação",
    "email_area": "Saúde",
    "location": "Guarda, Guarda",
    "website": "https://www.neurocorpus.pt/",
    "email": "geral@neurocorpus.pt",
    "phone": "962 989 341",
    "source": "https://www.neurocorpus.pt/",
    "observation": "Centro multidisciplinar com fisioterapia, psicologia e terapia da fala.",
    "opportunity": "Comunicar as valências da equipa em conteúdos informativos.",
    "service": "ambas"
  },
  {
    "company": "Portifisio",
    "sector": "Fisioterapia",
    "email_area": "Saúde",
    "location": "Portimão, Faro",
    "website": "https://www.portifisio.pt/",
    "email": "info@portifisio.pt",
    "phone": "282 425 189",
    "source": "https://www.portifisio.pt/fisioterapia",
    "observation": "Clínica de fisioterapia com dois endereços em Portimão.",
    "opportunity": "Preparar suportes gráficos com serviços e localizações.",
    "service": "design"
  },
  {
    "company": "REFIMA — Centro de Medicina Física e Reabilitação da Guarda",
    "sector": "Fisioterapia e reabilitação",
    "email_area": "Saúde",
    "location": "Guarda, Guarda",
    "website": "https://www.refima.pt/",
    "email": "geral@refima.pt",
    "phone": "271 214 561",
    "source": "https://www.refima.pt/medicina-reabilitacao/content/recepcao.html",
    "observation": "Centro de medicina física e reabilitação na Guarda.",
    "opportunity": "Apresentar especialidades e formas de contacto em peças claras.",
    "service": "design"
  },
  {
    "company": "Sara Cruz — Clínica de Psicologia",
    "sector": "Psicologia clínica",
    "email_area": "Saúde",
    "location": "Viseu, Viseu",
    "website": "https://saracruzclinica.pt/",
    "email": "viseu@saracruzclinica.pt",
    "phone": "963 797 228",
    "source": "https://saracruzclinica.pt/contacto/",
    "observation": "Clínica de psicologia com unidades em Viseu e Lisboa.",
    "opportunity": "Preparar materiais informativos para a unidade de Viseu.",
    "service": "design"
  },
  {
    "company": "Mimabô — Artes Cénicas",
    "sector": "Dança e formação artística",
    "email_area": "Educação & Formação",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://www.mimabo.app/",
    "email": "mimabo.producao@mimabo.org",
    "phone": "933 163 443",
    "source": "https://www.mimabo.app/",
    "observation": "Companhia de artes cénicas com cursos de teatro e dança.",
    "opportunity": "Criar peças de divulgação de cursos e espetáculos.",
    "service": "ambas"
  },
  {
    "company": "Magia das Línguas",
    "sector": "Ensino de línguas",
    "email_area": "Educação & Formação",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://magiadaslinguas.pt/",
    "email": "susana@magiadaslinguas.pt",
    "phone": "969 526 371",
    "source": "https://magiadaslinguas.pt/",
    "observation": "Projeto de ensino de línguas de Susana da Silva Rodrigues.",
    "opportunity": "Apresentar cursos e modalidades de aprendizagem em materiais digitais.",
    "service": "design"
  },
  {
    "company": "Monsanto Geo-Hotel Escola",
    "sector": "Hotel rural",
    "email_area": "Turismo & Alojamento",
    "location": "Idanha-a-Nova, Castelo Branco",
    "website": "http://www.monsantoghe.com/",
    "email": "geral@monsantoghe.com",
    "phone": "277 314 061",
    "source": "https://www.visitportugal.com/pt-pt/content/monsanto-geo-hotel-escola",
    "observation": "Hotel rural em Monsanto registado no Turismo de Portugal.",
    "opportunity": "Criar materiais de apresentação da estadia e serviços.",
    "service": "design"
  },
  {
    "company": "Conservatório Regional de Castelo Branco",
    "sector": "Ensino de música",
    "email_area": "Educação & Formação",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://conservatoriocb.pt/",
    "email": "secretaria.crcb@conservatoriocb.pt",
    "phone": "272 344 405",
    "source": "https://conservatoriocb.pt/contatos/",
    "observation": "Conservatório com pólos em Castelo Branco e Idanha-a-Nova.",
    "opportunity": "Desenvolver peças para divulgar cursos e inscrições.",
    "service": "design"
  },
  {
    "company": "Yvonne's Pilates Studio",
    "sector": "Estúdio de pilates",
    "email_area": "Bem-estar",
    "location": "Torres Vedras, Lisboa",
    "website": "https://yvonnespilatesstudio.com/",
    "email": "yvonne@yvonnespilatesstudio.com",
    "phone": "261 317 033",
    "source": "https://yvonnespilatesstudio.com/pt-torres-vedras/",
    "observation": "Estúdio de pilates em Torres Vedras.",
    "opportunity": "Criar conteúdos de apresentação de aulas e inscrições.",
    "service": "ambas"
  },
  {
    "company": "Fisioflaviae",
    "sector": "Fisioterapia e reabilitação",
    "email_area": "Saúde",
    "location": "Chaves, Vila Real",
    "website": "https://fisioflaviae.pt/",
    "email": "geral@fisioflaviae.pt",
    "phone": "",
    "source": "https://www.medicare.pt/rede-medica/fisioflaviae-clinica-de-reabilitacao-chaves",
    "observation": "Centro de reabilitação na Quinta do Leão em Chaves.",
    "opportunity": "Criar peças explicativas dos serviços de reabilitação.",
    "service": "design"
  },
  {
    "company": "Hotel Rural Monte da Provença",
    "sector": "Hotel rural",
    "email_area": "Turismo & Alojamento",
    "location": "Elvas, Portalegre",
    "website": "https://www.montedaprovenca.com/",
    "email": "geral@montedaprovenca.com",
    "phone": "268 098 151",
    "source": "https://www.montedaprovenca.com/pt/contact-us.html",
    "observation": "Hotel rural em São Vicente e Ventosa, Elvas.",
    "opportunity": "Valorizar experiências e serviços em suportes gráficos.",
    "service": "ambas"
  },
  {
    "company": "Hotel Vale do Côa",
    "sector": "Hotelaria",
    "email_area": "Turismo & Alojamento",
    "location": "Vila Nova de Foz Côa, Guarda",
    "website": "https://www.hotelvaledocoa.net",
    "email": "informacoes@hotelvaledocoa.net",
    "phone": "279 760 010",
    "source": "https://valedocoa.pt/alojamento/",
    "observation": "Hotel na Avenida Cidade Nova, Vila Nova de Foz Côa.",
    "opportunity": "Criar peças de apresentação dos quartos e reservas.",
    "service": "design"
  },
  {
    "company": "Motiva — Centro Terapêutico",
    "sector": "Centro terapêutico",
    "email_area": "Saúde",
    "location": "Chaves, Vila Real",
    "website": "https://centromotiva.pt/",
    "email": "geral@centromotiva.pt",
    "phone": "276 321 222",
    "source": "https://centromotiva.pt/contactos.php",
    "observation": "Centro terapêutico na Avenida 5 de Outubro em Chaves.",
    "opportunity": "Apresentar serviços e opções de marcação de forma clara.",
    "service": "design"
  },
  {
    "company": "Casa de Baco",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Igrejinha, Évora",
    "website": "https://casadebaco.pt/",
    "email": "geral@casadebaco.pt",
    "phone": "934 797 814",
    "source": "https://casadebaco.pt/pt/contacte-nos",
    "observation": "Alojamento de turismo rural em Igrejinha.",
    "opportunity": "Criar materiais de apresentação do alojamento e experiências.",
    "service": "ambas"
  },
  {
    "company": "Clínica Vilas Boas",
    "sector": "Medicina dentária",
    "email_area": "Saúde",
    "location": "Pombal, Leiria",
    "website": "https://www.clinicavilasboas.pt",
    "email": "mail@clinicavilasboas.pt",
    "phone": "915 695 859",
    "source": "https://fadadodente.pt/clinica/clinica-vilas-boas-pombal",
    "observation": "Clínica dentária em Pombal com várias especialidades.",
    "opportunity": "Preparar peças informativas sobre consultas e tratamentos.",
    "service": "design"
  },
  {
    "company": "Chave Clínica",
    "sector": "Saúde e terapias",
    "email_area": "Saúde",
    "location": "Chaves, Vila Real",
    "website": "https://chaveclinica.pt/",
    "email": "geral@chaveclinica.pt",
    "phone": "936 215 672",
    "source": "https://chaveclinica.pt/servicos/physical-therapy/",
    "observation": "Clínica com psicologia, terapias e bem-estar em Chaves.",
    "opportunity": "Organizar comunicação visual das diferentes áreas de atendimento.",
    "service": "ambas"
  },
  {
    "company": "Chaves Saúde — Clínica do Desenvolvimento e Reabilitação",
    "sector": "Clínica terapêutica",
    "email_area": "Saúde",
    "location": "Chaves, Vila Real",
    "website": "https://chaves-saude.pt/",
    "email": "geral@chaves-saude.com",
    "phone": "968 753 803",
    "source": "https://chaves-saude.pt/contactos/",
    "observation": "Clínica de desenvolvimento e reabilitação em Chaves.",
    "opportunity": "Criar suportes informativos sobre especialidades e marcações.",
    "service": "design"
  },
  {
    "company": "Casa de Baixo — Nature Hotel",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Alvoco das Várzeas, Coimbra",
    "website": "",
    "email": "geral@casadebaixo.pt",
    "phone": "238 092 777",
    "source": "https://www.aldeiasdemontanha.pt/pt/aldeias/alvoco-das-v%C3%A1rzeas/casa-de-baixo-petit-hotel/",
    "observation": "Casa de turismo rural em Alvoco das Várzeas.",
    "opportunity": "Desenvolver peças de apresentação da experiência de alojamento.",
    "service": "design"
  },
  {
    "company": "PSIAVEIRO — Clínica de Psicologia",
    "sector": "Psicologia clínica",
    "email_area": "Saúde",
    "location": "Aveiro, Aveiro",
    "website": "https://www.psiaveiro.pt/",
    "email": "geral@psiaveiro.pt",
    "phone": "913 089 980",
    "source": "https://www.psiaveiro.pt/contactos",
    "observation": "Clínica de psicologia na Avenida Doutor Lourenço Peixinho.",
    "opportunity": "Criar peças sobre áreas de acompanhamento psicológico.",
    "service": "design"
  },
  {
    "company": "ITAPA — Instituto Terapêutico Analítico",
    "sector": "Psicologia e psicoterapia",
    "email_area": "Saúde",
    "location": "Aveiro, Aveiro",
    "website": "https://psicologiaveiro.pt/",
    "email": "geral.itapa@psicologiaveiro.pt",
    "phone": "234 098 647",
    "source": "https://psicologiaveiro.pt/contactos/",
    "observation": "Instituto terapêutico na Rua da Aviação Naval, Aveiro.",
    "opportunity": "Organizar materiais de apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Escola de Surf de Peniche",
    "sector": "Escola de surf",
    "email_area": "Desporto & Fitness",
    "location": "Peniche, Leiria",
    "website": "https://escolasurfpeniche.com/",
    "email": "booking@escolasurfpeniche.com",
    "phone": "262 184 593",
    "source": "https://escolasurfpeniche.com/en/contacts-and-bookings/",
    "observation": "Escola de surf em Peniche com aulas e reservas.",
    "opportunity": "Criar conteúdos de divulgação de aulas e experiências.",
    "service": "ambas"
  },
  {
    "company": "Tribo do Mar — Escola de Surf e SUP",
    "sector": "Escola de surf e SUP",
    "email_area": "Desporto & Fitness",
    "location": "Atouguia da Baleia, Leiria",
    "website": "https://surfschooltribodomar.pt/",
    "email": "info@surfschooltribodomar.pt",
    "phone": "918 322 196",
    "source": "https://surfschooltribodomar.pt/contacto/",
    "observation": "Escola de surf e SUP na Praia da Consolação.",
    "opportunity": "Preparar conteúdos sobre aulas e modalidades.",
    "service": "ambas"
  },
  {
    "company": "EXPLICAS — Centro de Estudos",
    "sector": "Centro de explicações",
    "email_area": "Educação & Formação",
    "location": "Torre da Marinha, Seixal, Setúbal",
    "website": "https://explicas.pt/",
    "email": "centro@explicas.pt",
    "phone": "913 443 721",
    "source": "https://explicas.pt/",
    "observation": "Centro de estudos e explicações na Torre da Marinha.",
    "opportunity": "Criar peças de apresentação de disciplinas e inscrições.",
    "service": "design"
  },
  {
    "company": "Candeias do Souto",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Meixedo, Bragança",
    "website": "https://candeiasdosouto.pt/",
    "email": "reservas@candeiasdosouto.pt",
    "phone": "273 331 259",
    "source": "https://candeiasdosouto.pt/en/accommodation/trovisco/",
    "observation": "Alojamento de turismo rural em Meixedo, Bragança.",
    "opportunity": "Criar materiais de apresentação de quartos e reservas.",
    "service": "design"
  },
  {
    "company": "Chaparro Alentejano",
    "sector": "Restauração",
    "email_area": "Restauração",
    "location": "Beja, Beja",
    "website": "https://www.chaparroalentejano.pt/",
    "email": "reservas@chaparroalentejano.pt",
    "phone": "284 244 041",
    "source": "https://www.chaparroalentejano.pt/",
    "observation": "Restaurante de cozinha alentejana na Rua de Lisboa, Beja.",
    "opportunity": "Criar peças gráficas para menus e reservas.",
    "service": "ambas"
  },
  {
    "company": "Clínica Anima",
    "sector": "Saúde mental e terapias",
    "email_area": "Saúde",
    "location": "Aveiro, Aveiro",
    "website": "https://clinicanima.pt/",
    "email": "anima@anima2.pt",
    "phone": "234 385 395",
    "source": "https://clinicanima.pt/contactos/",
    "observation": "Clínica em Aveiro com psicologia e outras terapias.",
    "opportunity": "Apresentar valências e processos de marcação em materiais claros.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-10-28).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');
  added++;
 }})();
 console.log('[crm] seed 2026-10-28:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-10-28:',e.message)}
