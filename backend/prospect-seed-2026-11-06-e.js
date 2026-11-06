// DUIT — Portugal continental, 2026-11-06-e. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Visagrícola",
    "sector": "Agricultura, máquinas e distribuição agrícola",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Viseu, Viseu",
    "website": "https://www.visagricola.pt/",
    "email": "geral@visagricola.pt",
    "phone": "232 410 070",
    "source": "https://www.visagricola.pt/contactos/",
    "observation": "Empresa com sede, loja e armazéns de distribuição em Viseu.",
    "opportunity": "Criar materiais de produto e comunicação comercial para equipamentos e soluções agrícolas.",
    "service": "design"
  },
  {
    "company": "Imoklass",
    "sector": "Mediação imobiliária",
    "email_area": "Imobiliário",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://www.imoklass.pt/",
    "email": "geral@imoklass.pt",
    "phone": "272 329 362",
    "source": "https://www.imoklass.pt/contactos",
    "observation": "Imobiliária especializada em Castelo Branco, Alcains e localidades envolventes.",
    "opportunity": "Criar peças de captação e apresentação de imóveis para comunicação local.",
    "service": "ambas"
  },
  {
    "company": "AM Contabilidade",
    "sector": "Contabilidade e serviços empresariais",
    "email_area": "Serviços Profissionais",
    "location": "Évora, Évora",
    "website": "https://am-contabilidade.com/",
    "email": "geral@am-contabilidade.com",
    "phone": "266 739 140",
    "source": "https://am-contabilidade.com/contactos/",
    "observation": "Empresa de contabilidade sediada em Évora.",
    "opportunity": "Criar materiais institucionais para apresentar serviços e apoio a empresas.",
    "service": "design"
  },
  {
    "company": "Clínica CERPROS",
    "sector": "Saúde e serviços clínicos",
    "email_area": "Saúde",
    "location": "Portalegre, Portalegre",
    "website": "https://cerpros.pt/",
    "email": "geral@cerpros.pt",
    "phone": "245 339 020",
    "source": "https://cerpros.pt/contactos/",
    "observation": "Clínica em Portalegre com consultas e análises clínicas.",
    "opportunity": "Criar materiais informativos sobre serviços, horários e especialidades.",
    "service": "design"
  },
  {
    "company": "Contévora",
    "sector": "Contabilidade e consultoria de gestão",
    "email_area": "Serviços Profissionais",
    "location": "Évora, Évora",
    "website": "https://contevora.pt/",
    "email": "geral@contevora.pt",
    "phone": "266 741 383",
    "source": "https://contevora.pt/contactos-2/",
    "observation": "Empresa familiar de contabilidade e consultoria de gestão com sede em Évora.",
    "opportunity": "Criar comunicação institucional para diferentes serviços empresariais.",
    "service": "design"
  },
  {
    "company": "Martins & Irmão",
    "sector": "Construção, reabilitação e imobiliário",
    "email_area": "Construção & Engenharia",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://www.martinsirmao.pt/",
    "email": "geral@martinsirmao.pt",
    "phone": "272 344 273",
    "source": "https://www.martinsirmao.pt/contactos.php",
    "observation": "Empresa com atividade em promoção imobiliária, construção, reabilitação e mediação.",
    "opportunity": "Criar portefólios e apresentações de empreendimentos e obras.",
    "service": "ambas"
  },
  {
    "company": "Chimba Transportes",
    "sector": "Transportes e logística",
    "email_area": "Transportes & Logística",
    "location": "Leiria, Leiria",
    "website": "https://chimba.pt/",
    "email": "geral@chimba.pt",
    "phone": "219 501 935",
    "source": "https://chimba.pt/contactos/",
    "observation": "Empresa de transportes com presença em Lisboa, Porto, Leiria e Salvaterra de Magos.",
    "opportunity": "Criar apresentação comercial de serviços, cobertura e capacidade de transporte.",
    "service": "design"
  },
  {
    "company": "ADJ Máquinas Agrícolas",
    "sector": "Máquinas agrícolas, venda e reparação",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Barcelos, Braga",
    "website": "https://adj.pt/",
    "email": "geral@adj.pt",
    "phone": "253 882 459",
    "source": "https://adj.pt/contactos/",
    "observation": "Empresa de venda e reparação de máquinas agrícolas sediada em Roriz, Barcelos.",
    "opportunity": "Criar fichas de equipamentos e materiais para assistência e venda.",
    "service": "design"
  },
  {
    "company": "Albicasa",
    "sector": "Construção e imobiliário",
    "email_area": "Imobiliário",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://www.albicasa.pt/",
    "email": "geral@albicasa.pt",
    "phone": "272 326 329",
    "source": "https://www.albicasa.pt/contactos.php",
    "observation": "Empresa de construção e promoção imobiliária com atividade em Castelo Branco.",
    "opportunity": "Criar materiais de apresentação de empreendimentos, obras e imóveis.",
    "service": "ambas"
  },
  {
    "company": "Carlos Rocha Construções",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Albergaria-a-Velha, Aveiro",
    "website": "https://www.carlosrochaconstrucoes.com/",
    "email": "geral@carlosrochaconstrucoes.com",
    "phone": "234 524 380",
    "source": "https://www.carlosrochaconstrucoes.com/contactos.html",
    "observation": "Empresa de construção civil sediada em Albergaria-a-Velha.",
    "opportunity": "Criar portefólios visuais de obras e materiais institucionais.",
    "service": "design"
  },
  {
    "company": "Maquiloendro",
    "sector": "Máquinas para agricultura, floresta, jardim e indústria",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Campia, Viseu",
    "website": "https://maquiloendro.pt/",
    "email": "geral@maquiloendro.pt",
    "phone": "232 752 278",
    "source": "https://maquiloendro.pt/pages/contactos",
    "observation": "Empresa sediada na Zona Industrial de Campia especializada em máquinas e peças.",
    "opportunity": "Criar fichas de equipamentos, peças e campanhas comerciais sazonais.",
    "service": "ambas"
  },
  {
    "company": "GCE Negócios",
    "sector": "Gestão, consultoria e contabilidade",
    "email_area": "Serviços Profissionais",
    "location": "Évora, Évora",
    "website": "https://gcenegocios.pt/",
    "email": "geral@gcenegocios.pt",
    "phone": "266 707 729",
    "source": "https://gcenegocios.pt/",
    "observation": "Empresa de gestão, consultoria e contabilidade com escritórios em Évora e outras localidades.",
    "opportunity": "Criar materiais institucionais para apresentar serviços a empresas.",
    "service": "design"
  },
  {
    "company": "Dance Point",
    "sector": "Escola de dança",
    "email_area": "Estúdios de Dança",
    "location": "Leça do Balio, Porto",
    "website": "https://www.dancepoint.pt/",
    "email": "geral@dancepoint.pt",
    "phone": "927 689 812",
    "source": "https://www.dancepoint.pt/contactos",
    "observation": "Associação e escola de dança com várias modalidades em Leça do Balio.",
    "opportunity": "Criar comunicação para modalidades, inscrições, horários e eventos.",
    "service": "ambas"
  },
  {
    "company": "Bússola da Sabedoria",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Braga, Braga",
    "website": "https://bussoladasabedoria.com/",
    "email": "geral@bussoladasabedoria.com",
    "phone": "919 335 541",
    "source": "https://bussoladasabedoria.com/contacte-nos/",
    "observation": "Centro de estudos sediado em Braga.",
    "opportunity": "Criar materiais para inscrições, serviços educativos e comunicação com famílias.",
    "service": "ambas"
  },
  {
    "company": "Agro-Ribatejo",
    "sector": "Comércio agrícola",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Santarém, Santarém",
    "website": "https://www.agroribatejo.com/",
    "email": "geral@agroribatejo.com",
    "phone": "243 359 280",
    "source": "https://www.agroribatejo.com/contactos/",
    "observation": "Empresa do setor agrícola sediada na Zona Industrial da Várzea, Santarém.",
    "opportunity": "Criar materiais de produto e apoio comercial para clientes agrícolas.",
    "service": "design"
  },
  {
    "company": "Autoalegre",
    "sector": "Comércio e assistência automóvel",
    "email_area": "Automóvel",
    "location": "Portalegre, Portalegre",
    "website": "https://autoalegre.pt/",
    "email": "geral@autoalegre.pt",
    "phone": "245 300 900",
    "source": "https://autoalegre.pt/contactos/",
    "observation": "Empresa automóvel em Portalegre com vendas, oficina, peças e serviços administrativos.",
    "opportunity": "Criar comunicação comercial para viaturas, oficina e serviços pós-venda.",
    "service": "ambas"
  },
  {
    "company": "João Silva Alumínios",
    "sector": "Alumínios e caixilharia",
    "email_area": "Construção & Engenharia",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://www.jsaluminios.pt/",
    "email": "geral@jsaluminios.pt",
    "phone": "917 028 821",
    "source": "https://www.jsaluminios.pt/contactos",
    "observation": "Empresa de alumínios sediada em Viana do Castelo.",
    "opportunity": "Criar materiais de apresentação de soluções, acabamentos e projetos executados.",
    "service": "design"
  },
  {
    "company": "A Magia de Aprender",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Leiria, Leiria",
    "website": "https://www.amagiadeaprender.com/",
    "email": "geral@amagiadeaprender.com",
    "phone": "910 609 733",
    "source": "https://www.amagiadeaprender.com/contactos",
    "observation": "Centro de estudos em Leiria com oferta formativa e serviços especializados.",
    "opportunity": "Criar comunicação para inscrições, serviços e períodos de férias escolares.",
    "service": "ambas"
  },
  {
    "company": "Vectorplano",
    "sector": "Engenharia, arquitetura e construção",
    "email_area": "Construção & Engenharia",
    "location": "Guarda, Guarda",
    "website": "",
    "email": "geral@vectorplano.pt",
    "phone": "961 099 807",
    "source": "https://ruis.aiccopn.pt/empresas/vectorplano-projeto-construcao-e-engenharia-lda/",
    "observation": "Empresa da Guarda com atividade em projeto, construção, engenharia e reabilitação.",
    "opportunity": "Criar apresentações técnicas de serviços, projetos e referências de obra.",
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
    "observation": "Clínica de fisioterapia e medicina em Coimbra.",
    "opportunity": "Criar materiais informativos sobre tratamentos, lesões e recuperação.",
    "service": "design"
  },
  {
    "company": "Ativefit",
    "sector": "Fisioterapia, saúde e bem-estar",
    "email_area": "Fisioterapia",
    "location": "Leiria, Leiria",
    "website": "https://ativefit.pt/",
    "email": "geral@ativefit.pt",
    "phone": "916 408 702",
    "source": "https://ativefit.pt/contactos/",
    "observation": "Espaço em Leiria com serviços de fisioterapia e bem-estar.",
    "opportunity": "Criar comunicação visual para especialidades, serviços e marcações.",
    "service": "ambas"
  },
  {
    "company": "Orfeão de Leiria",
    "sector": "Ensino de música e dança",
    "email_area": "Educação & Formação",
    "location": "Leiria, Leiria",
    "website": "https://www.orfeaodeleiria.com/",
    "email": "geral@orfeaodeleiria.com",
    "phone": "244 829 550",
    "source": "https://www.orfeaodeleiria.com/",
    "observation": "Instituição cultural com escola de música e dança em Leiria.",
    "opportunity": "Criar materiais para cursos, eventos, inscrições e programação cultural.",
    "service": "ambas"
  },
  {
    "company": "Idealização",
    "sector": "Engenharia e arquitetura",
    "email_area": "Construção & Engenharia",
    "location": "Guarda, Guarda",
    "website": "https://idealizacao.pt/",
    "email": "geral@idealizacao.pt",
    "phone": "271 224 251",
    "source": "https://idealizacao.pt/contactos",
    "observation": "Empresa de soluções de engenharia e arquitetura sediada na Guarda.",
    "opportunity": "Criar apresentações de projetos e materiais institucionais para serviços técnicos.",
    "service": "design"
  },
  {
    "company": "Actifisio",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Coimbra, Coimbra",
    "website": "https://www.actifisio.pt/",
    "email": "geral@actifisio.pt",
    "phone": "919 090 510",
    "source": "https://www.actifisio.pt/",
    "observation": "Clínica de fisioterapia com espaços em Coimbra e Figueira da Foz.",
    "opportunity": "Criar conteúdos informativos sobre fisioterapia, marcações e serviços.",
    "service": "ambas"
  },
  {
    "company": "Genial Alumínios",
    "sector": "Alumínios e caixilharia",
    "email_area": "Construção & Engenharia",
    "location": "Mafra, Lisboa",
    "website": "https://www.genial-aluminios.pt/",
    "email": "geral@genial-aluminios.pt",
    "phone": "261 859 977",
    "source": "https://www.genial-aluminios.pt/contactos/",
    "observation": "Empresa de alumínios sediada na Encarnação, Mafra.",
    "opportunity": "Criar portefólio visual de soluções e projetos para apoio comercial.",
    "service": "design"
  },
  {
    "company": "JAFOC",
    "sector": "Arquitetura e engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Vila Real, Vila Real",
    "website": "https://jafoc.pt/",
    "email": "geral@jafoc.pt",
    "phone": "259 347 188",
    "source": "https://jafoc.pt/contactos/",
    "observation": "Empresa de projetos de arquitetura e engenharia sediada em Vila Real.",
    "opportunity": "Criar materiais institucionais e apresentações de projetos técnicos.",
    "service": "design"
  },
  {
    "company": "Mecânica Agrícola da Bufarda",
    "sector": "Máquinas agrícolas e assistência",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Peniche, Leiria",
    "website": "",
    "email": "geral@mecanicaab.pt",
    "phone": "262 758 008",
    "source": "https://ascendum.pt/agro/concessionarios-kioti/",
    "observation": "Empresa de máquinas agrícolas listada como concessionário em Bufarda, Peniche.",
    "opportunity": "Criar materiais comerciais de equipamentos e serviços de assistência.",
    "service": "design"
  },
  {
    "company": "Automecânica",
    "sector": "Máquinas e assistência mecânica",
    "email_area": "Automóvel",
    "location": "Agualva-Cacém, Lisboa",
    "website": "",
    "email": "geral@automecanica.pt",
    "phone": "219 169 600",
    "source": "https://ascendum.pt/agro/concessionarios-kioti/",
    "observation": "Empresa listada como concessionário com instalações em Vale Mourão, Agualva-Cacém.",
    "opportunity": "Criar materiais de serviço e comunicação comercial para equipamentos e assistência.",
    "service": "design"
  },
  {
    "company": "Agro Gaspares",
    "sector": "Máquinas e alfaias agrícolas",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Coruche, Santarém",
    "website": "",
    "email": "geral@agrogaspares.pt",
    "phone": "243 605 054",
    "source": "https://ascendum.pt/agro/concessionarios-kioti/",
    "observation": "Empresa de tratores e alfaias agrícolas listada como concessionário em Coruche.",
    "opportunity": "Criar fichas de equipamentos e comunicação comercial para clientes agrícolas.",
    "service": "design"
  },
  {
    "company": "Castelo Imobiliária",
    "sector": "Mediação imobiliária",
    "email_area": "Imobiliário",
    "location": "Olhão, Faro",
    "website": "https://casteloimobiliaria.pt/",
    "email": "geral@casteloimobiliaria.pt",
    "phone": "966 782 233",
    "source": "https://casteloimobiliaria.pt/contactos",
    "observation": "Agência imobiliária sediada em Olhão.",
    "opportunity": "Criar materiais para apresentação de imóveis, captação e campanhas locais.",
    "service": "ambas"
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-06).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-06-e:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-06-e:',e.message)}
