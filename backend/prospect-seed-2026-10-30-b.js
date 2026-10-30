// DUIT — 2026-10-30 lote b. Fontes de email profissional verificadas publicamente nesta data.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Transportela",
    "sector": "Transportes de mercadorias",
    "email_area": "Transportes & Logística",
    "location": "Parceiros, Leiria",
    "website": "https://www.transportela.com/",
    "email": "geral@transportela.com",
    "phone": "244 616 132",
    "source": "https://www.transportela.com/contactos/",
    "observation": "Transportadora de carga com instalações em Parceiros, Leiria.",
    "opportunity": "Criar materiais comerciais para apresentação dos serviços de transporte.",
    "service": "design"
  },
  {
    "company": "AM Contabilidade",
    "sector": "Contabilidade",
    "email_area": "Serviços Profissionais",
    "location": "Évora, Évora",
    "website": "https://am-contabilidade.com/",
    "email": "geral@am-contabilidade.com",
    "phone": "266 739 140",
    "source": "https://am-contabilidade.com/contactos/",
    "observation": "Gabinete de contabilidade na Urbanização da Cartuxa, Évora.",
    "opportunity": "Criar materiais informativos sobre serviços contabilísticos.",
    "service": "design"
  },
  {
    "company": "Serralharia O Bota",
    "sector": "Serralharia",
    "email_area": "Indústria & Produção",
    "location": "Cabeceiras de Basto, Braga",
    "website": "https://www.serralharia-obota.pt/",
    "email": "comercial@serralhariaobota.pt",
    "phone": "253 665 060",
    "source": "https://www.serralharia-obota.pt/contacto/",
    "observation": "Serralharia no Parque Industrial de Olela, Cabeceiras de Basto.",
    "opportunity": "Preparar fichas de apresentação de projetos e soluções.",
    "service": "design"
  },
  {
    "company": "Dentibus — Clínica Médica e Dentária",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Setúbal, Setúbal",
    "website": "https://dentibus.pt/",
    "email": "consultas@dentibus.pt",
    "phone": "",
    "source": "https://www.medicare.pt/rede-medica/dentibus-clinica-medica-e-dentaria-setubal",
    "observation": "Clínica dentária na Avenida República da Guiné Bissau, Setúbal.",
    "opportunity": "Criar peças informativas sobre especialidades e consultas.",
    "service": "design"
  },
  {
    "company": "Clínica do Convento",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Setúbal, Setúbal",
    "website": "https://clinicadoconvento.com/",
    "email": "geral@clinicadoconvento.com",
    "phone": "265 220 700",
    "source": "https://clinicadoconvento.com/clinica-dentaria-em-setubal-contactos",
    "observation": "Clínica dentária na Rua Acácio Barradas, Setúbal.",
    "opportunity": "Criar materiais sobre tratamentos e marcações.",
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
    "source": "https://dnaschool.pt/",
    "observation": "Escola de dança, música e artes performativas em Coimbra.",
    "opportunity": "Divulgar aulas, modalidades e inscrições.",
    "service": "ambas"
  },
  {
    "company": "GHV — Materiais de Construção",
    "sector": "Comércio de materiais de construção",
    "email_area": "Comércio & Retalho",
    "location": "Santarém, Santarém",
    "website": "https://ghvconstrucao.com/",
    "email": "geral@ghvconstrucao.com",
    "phone": "918 713 560",
    "source": "https://ghvconstrucao.com/",
    "observation": "Comércio de materiais de construção e artigos de jardim em Santarém.",
    "opportunity": "Preparar catálogos e peças promocionais por produto.",
    "service": "design"
  },
  {
    "company": "O Abel",
    "sector": "Comércio e retalho",
    "email_area": "Comércio & Retalho",
    "location": "Bragança, Bragança",
    "website": "https://loja.oabel.pt/",
    "email": "loja@oabel.pt",
    "phone": "273 327 207",
    "source": "https://loja.oabel.pt/contacte-nos",
    "observation": "Loja na Rua Almirante Reis, em Bragança.",
    "opportunity": "Criar suportes digitais de apresentação de produtos.",
    "service": "design"
  },
  {
    "company": "ClimatizaStore",
    "sector": "Climatização e equipamentos",
    "email_area": "Comércio & Retalho",
    "location": "Darque, Viana do Castelo",
    "website": "https://www.climatizastore.pt/",
    "email": "loja@climatizastore.pt",
    "phone": "969 806 812",
    "source": "https://www.climatizastore.pt/index.php?route=information%2Fcontact",
    "observation": "Loja de climatização em Darque, Viana do Castelo.",
    "opportunity": "Criar materiais explicativos das soluções de climatização.",
    "service": "design"
  },
  {
    "company": "Santarepair",
    "sector": "Reparação automóvel",
    "email_area": "Automóvel",
    "location": "Várzea, Santarém",
    "website": "https://santarepair.pt/",
    "email": "geral@santarepair.pt",
    "phone": "243 092 454",
    "source": "https://santarepair.pt/",
    "observation": "Oficina de reparação automóvel na Zona Industrial de Várzea.",
    "opportunity": "Criar peças de apresentação de serviços de oficina.",
    "service": "design"
  },
  {
    "company": "Staidel Imobiliária",
    "sector": "Mediação imobiliária",
    "email_area": "Imobiliário",
    "location": "Viseu, Viseu",
    "website": "https://staidelimobiliaria.com/",
    "email": "geral@staidelimobiliaria.com",
    "phone": "232 429 110",
    "source": "https://staidelimobiliaria.com/",
    "observation": "Imobiliária com escritório na Rua Paulo Emílio, Viseu.",
    "opportunity": "Criar materiais comerciais para divulgação de imóveis.",
    "service": "ambas"
  },
  {
    "company": "Restaurante O Galego",
    "sector": "Restauração",
    "email_area": "Restauração",
    "location": "Guarda, Guarda",
    "website": "",
    "email": "geral@restauranteogalego.pt",
    "phone": "271 227 328",
    "source": "https://aldeiasdemontanha.pt/en/villages/trinta-meios-corujeira/o-galego/",
    "observation": "Restaurante na Estrada dos Galegos, Guarda.",
    "opportunity": "Criar peças para menus e divulgação de refeições.",
    "service": "design"
  },
  {
    "company": "Vischave",
    "sector": "Mediação imobiliária",
    "email_area": "Imobiliário",
    "location": "Viseu, Viseu",
    "website": "https://vischave.pt/",
    "email": "geral@vischave.pt",
    "phone": "963 562 444",
    "source": "https://vischave.pt/",
    "observation": "Imobiliária com licença AMI 23450 em Viseu.",
    "opportunity": "Preparar peças de apresentação de imóveis.",
    "service": "ambas"
  },
  {
    "company": "Etelgra",
    "sector": "Comércio e reparação de máquinas agrícolas",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Vendas Novas, Évora",
    "website": "https://www.etelgra.pt/",
    "email": "geral@etelgra.pt",
    "phone": "265 809 040",
    "source": "https://www.etelgra.pt/contactos.php",
    "observation": "Empresa de máquinas agrícolas com instalações em Vendas Novas.",
    "opportunity": "Criar fichas comerciais para máquinas e assistência.",
    "service": "design"
  },
  {
    "company": "A.S.P. Eletricidade",
    "sector": "Instalações elétricas",
    "email_area": "Construção & Engenharia",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://www.asp-eletricidade.pt/",
    "email": "geral@asp-eletricidade.pt",
    "phone": "258 402 979",
    "source": "https://www.asp-eletricidade.pt/index.php/contacto",
    "observation": "Empresa de eletricidade sediada em Viana do Castelo.",
    "opportunity": "Criar materiais de apresentação de serviços de instalação.",
    "service": "design"
  },
  {
    "company": "Cherry Sculpture Hotel",
    "sector": "Turismo e alojamento",
    "email_area": "Turismo & Alojamento",
    "location": "Paul, Covilhã, Castelo Branco",
    "website": "https://cherrycovilha.pt/",
    "email": "info@cherrycovilha.pt",
    "phone": "275 961 101",
    "source": "https://cherrycovilha.pt/",
    "observation": "Hotel no Paul, junto à Covilhã, com alojamento, restaurante e experiências.",
    "opportunity": "Criar conteúdos para apresentar estadias e experiências.",
    "service": "ambas"
  },
  {
    "company": "Tractolitoral",
    "sector": "Máquinas agrícolas",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Albergaria-a-Velha, Aveiro",
    "website": "https://www.tractolitoral.pt/",
    "email": "geral@tractolitoral.pt",
    "phone": "234 529 444",
    "source": "https://www.tractolitoral.pt/contactos/",
    "observation": "Comércio e reparação de máquinas agrícolas em Albergaria-a-Velha.",
    "opportunity": "Preparar suportes comerciais para equipamentos e reparações.",
    "service": "design"
  },
  {
    "company": ".EDU — Centro de Explicação",
    "sector": "Centro de estudos e explicações",
    "email_area": "Centro de Estudos",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://www.pontoedu.com.pt/",
    "email": "suporte@pontoedu.com.pt",
    "phone": "914 978 879",
    "source": "https://www.cm-castelobranco.pt/media/12854/guia_recursos_locais_regionais_cb_2025_2026.pdf",
    "observation": "Centro de explicação e acompanhamento escolar identificado no guia municipal.",
    "opportunity": "Criar peças de divulgação de disciplinas e inscrições.",
    "service": "design"
  },
  {
    "company": "ExplicaMat — Vítor Pereira",
    "sector": "Explicações de matemática e físico-química",
    "email_area": "Centro de Estudos",
    "location": "Castelo Branco e Alcains, Castelo Branco",
    "website": "https://www.explicamat.pt/",
    "email": "geral@explicamat.pt",
    "phone": "966 449 836",
    "source": "https://www.cm-castelobranco.pt/media/12854/guia_recursos_locais_regionais_cb_2025_2026.pdf",
    "observation": "Serviço de explicações de Matemática e Física e Química identificado no guia municipal.",
    "opportunity": "Divulgar explicações e preparação de exames.",
    "service": "design"
  },
  {
    "company": "Drubloc Energias Renováveis",
    "sector": "Instalações e energias renováveis",
    "email_area": "Construção & Engenharia",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "",
    "email": "geral@drubloc.pt",
    "phone": "258 821 754",
    "source": "https://www.airzonecontrol.com/pt/pt/contacto/parceiros/drubloc-energias-renovaveis-lda/",
    "observation": "Empresa de energias renováveis identificada como parceira técnica de climatização.",
    "opportunity": "Criar materiais de apresentação de instalações e serviços.",
    "service": "design"
  },
  {
    "company": "TEC — Transportes Eduardo Cardoso",
    "sector": "Transportes rodoviários",
    "email_area": "Transportes & Logística",
    "location": "Benquerenças, Castelo Branco",
    "website": "https://www.transporteseduardocardoso.pt/",
    "email": "geral@transporteseduardocardoso.pt",
    "phone": "272 327 672",
    "source": "https://www.transporteseduardocardoso.pt/contactos.php",
    "observation": "Transportadora sediada no Cruzamento dos Maxiais, Benquerenças.",
    "opportunity": "Criar apresentação comercial de serviços de transporte.",
    "service": "design"
  },
  {
    "company": "Universalcare",
    "sector": "Limpeza e manutenção",
    "email_area": "Serviços Profissionais",
    "location": "Guarda, Guarda",
    "website": "https://universalcare.pt/",
    "email": "geral@universalcare.pt",
    "phone": "964 358 746",
    "source": "https://universalcare.pt/a-universalcare/",
    "observation": "Empresa de limpeza técnica, manutenção e conservação na Guarda.",
    "opportunity": "Criar materiais para apresentação dos serviços.",
    "service": "design"
  },
  {
    "company": "Tecnilagos",
    "sector": "Instalações elétricas e climatização",
    "email_area": "Construção & Engenharia",
    "location": "Lagos, Faro",
    "website": "https://www.tecnilagos.pt/",
    "email": "geral@tecnilagos.pt",
    "phone": "282 764 191",
    "source": "https://www.tecnilagos.pt/",
    "observation": "Empresa de instalações elétricas e climatização com loja em Lagos.",
    "opportunity": "Preparar suportes de apresentação das soluções técnicas.",
    "service": "design"
  },
  {
    "company": "Servilas",
    "sector": "Reparações e canalizações",
    "email_area": "Construção & Engenharia",
    "location": "Lagos, Faro",
    "website": "https://servilas.com/",
    "email": "geral@servilas.com",
    "phone": "282 764 953",
    "source": "https://servilas.com/",
    "observation": "Empresa de reparações, eletricidade e canalizações em Lagos.",
    "opportunity": "Criar peças comerciais de apresentação de serviços.",
    "service": "design"
  },
  {
    "company": "Clínica Cor Alentejo",
    "sector": "Clínica médica",
    "email_area": "Saúde",
    "location": "Portalegre, Portalegre",
    "website": "https://clinicacoralentejo.pt/",
    "email": "geral@clinicacoralentejo.pt",
    "phone": "245 308 040",
    "source": "https://clinicacoralentejo.pt/especialidades/medicinainterna/",
    "observation": "Clínica em Portalegre com diversas especialidades médicas.",
    "opportunity": "Criar materiais informativos sobre consultas e especialidades.",
    "service": "design"
  },
  {
    "company": "Véstia Santos",
    "sector": "Comércio e assistência de equipamentos",
    "email_area": "Comércio & Retalho",
    "location": "Portalegre, Portalegre",
    "website": "https://vestiasantos.pt/",
    "email": "geral@vestiasantos.pt",
    "phone": "969 709 433",
    "source": "https://vestiasantos.pt/contacte-nos",
    "observation": "Loja de equipamentos e assistência técnica em Portalegre.",
    "opportunity": "Criar fichas de produto e materiais de assistência.",
    "service": "design"
  },
  {
    "company": "Vialimentos",
    "sector": "Indústria alimentar",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Viana do Alentejo, Évora",
    "website": "https://www.vialimentos.com/",
    "email": "vialimentos@vialimentos.com",
    "phone": "266 953 127",
    "source": "https://www.vialimentos.com/",
    "observation": "Empresa de comercialização de produtos alimentares em Viana do Alentejo.",
    "opportunity": "Criar materiais comerciais para apresentação das gamas de produtos.",
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
 console.log('[crm] seed 2026-10-30-b:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-10-30-b:',e.message)}
