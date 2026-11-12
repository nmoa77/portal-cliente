// DUIT — Portugal continental, 2026-11-12. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Actifisio",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Coimbra, Coimbra",
    "website": "https://actifisio.pt",
    "email": "geral@actifisio.pt",
    "phone": "919090510",
    "source": "https://www.actifisio.pt/",
    "observation": "Atividade identificada em fonte pública: Fisioterapia.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de fisioterapia.",
    "service": "design"
  },
  {
    "company": "Usimeca",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Leiria, Leiria",
    "website": "https://usimeca.pt",
    "email": "usimeca@usimeca.pt",
    "phone": "244801590",
    "source": "https://usimeca.pt/centro-mais",
    "observation": "Atividade identificada em fonte pública: Metalomecânica.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de metalomecânica.",
    "service": "design"
  },
  {
    "company": "DG Metal",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Marinha Grande, Leiria",
    "website": "https://dgmetalomecanica.pt",
    "email": "geral@dgmetalomecanica.pt",
    "phone": "910748852",
    "source": "https://dgmetalomecanica.pt/contactos/",
    "observation": "Atividade identificada em fonte pública: Metalomecânica.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de metalomecânica.",
    "service": "design"
  },
  {
    "company": "Casa Agrícola Santos Jorge",
    "sector": "Agricultura",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Moura, Beja",
    "website": "https://casantosjorge.com",
    "email": "geral@casantosjorge.com",
    "phone": "285251575",
    "source": "https://alentejomaisdigital.pt/empresa/casa-agricola-santos-jorge-s-a/",
    "observation": "Atividade identificada em fonte pública: Agricultura.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de agricultura.",
    "service": "design"
  },
  {
    "company": "Rosa do Campo - Casa da Avó",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Beja, Beja",
    "website": "https://rosadocampo.pt",
    "email": "info@rosadocampo.pt",
    "phone": "284323578",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/beja",
    "observation": "Atividade identificada em fonte pública: Turismo rural.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de turismo rural.",
    "service": "design"
  },
  {
    "company": "Ninho do Melro II",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Bragança, Bragança",
    "website": "https://ninhodomelro.com",
    "email": "turismorural@ninhodomelro.com",
    "phone": "962578374",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/bragan%C3%A7a",
    "observation": "Atividade identificada em fonte pública: Turismo rural.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de turismo rural.",
    "service": "design"
  },
  {
    "company": "Foz Tua",
    "sector": "Enoturismo",
    "email_area": "Turismo & Alojamento",
    "location": "Carrazeda de Ansiães, Bragança",
    "website": "https://foztua.pt",
    "email": "info@foztua.pt",
    "phone": "919995548",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/bragan%C3%A7a",
    "observation": "Atividade identificada em fonte pública: Enoturismo.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de enoturismo.",
    "service": "design"
  },
  {
    "company": "PinkMyBike",
    "sector": "Turismo de aventura",
    "email_area": "Aventura",
    "location": "Bragança, Bragança",
    "website": "https://pinkmybike.pt",
    "email": "geral@pinkmybike.pt",
    "phone": "961112699",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/bragan%C3%A7a",
    "observation": "Atividade identificada em fonte pública: Turismo de aventura.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de turismo de aventura.",
    "service": "design"
  },
  {
    "company": "Casa de Ceis Retreat",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Sabrosa, Vila Real",
    "website": "https://quintadeceis.com",
    "email": "geral@quintadeceis.com",
    "phone": "226178157",
    "source": "https://www.visitportugal.com/pt-pt/taxonomy/term/586",
    "observation": "Atividade identificada em fonte pública: Turismo rural.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de turismo rural.",
    "service": "design"
  },
  {
    "company": "Agroturismo Casal de Castro",
    "sector": "Agroturismo",
    "email_area": "Turismo & Alojamento",
    "location": "Mirandela, Bragança",
    "website": "https://casaldecastro.com",
    "email": "manuel.silva@casaldecastro.com",
    "phone": "913300384",
    "source": "https://www.visitportugal.com/pt-pt/taxonomy/term/586",
    "observation": "Atividade identificada em fonte pública: Agroturismo.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de agroturismo.",
    "service": "design"
  },
  {
    "company": "Al Mar Guesthouse",
    "sector": "Alojamento local",
    "email_area": "Turismo & Alojamento",
    "location": "Odemira, Beja",
    "website": "https://apartments-alentejo.com",
    "email": "almar@apartments-alentejo.com",
    "phone": "961088853",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/odemira",
    "observation": "Atividade identificada em fonte pública: Alojamento local.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de alojamento local.",
    "service": "design"
  },
  {
    "company": "Casa do Passal",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Bragança, Bragança",
    "website": "https://casasdegondesende.pt",
    "email": "info@casasdegondesende.pt",
    "phone": "913811838",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/bragan%C3%A7a?page=2",
    "observation": "Atividade identificada em fonte pública: Turismo rural.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de turismo rural.",
    "service": "design"
  },
  {
    "company": "Igualhabitat",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Bragança, Bragança",
    "website": "https://igualhabitat.com",
    "email": "geral@igualhabitat.com",
    "phone": "918666138",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/bragan%C3%A7a?page=2",
    "observation": "Atividade identificada em fonte pública: Turismo rural.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de turismo rural.",
    "service": "design"
  },
  {
    "company": "Casa Moleiro de Baçal",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Bragança, Bragança",
    "website": "https://casamoleirobacal.com",
    "email": "reservas@casamoleirobacal.com",
    "phone": "273326289",
    "source": "https://www.visitportugal.com/pt-pt/regioes-e-localidades/bragan%C3%A7a?page=2",
    "observation": "Atividade identificada em fonte pública: Turismo rural.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de turismo rural.",
    "service": "design"
  },
  {
    "company": "Hotel Freixo Douro Superior",
    "sector": "Hotelaria",
    "email_area": "Turismo & Alojamento",
    "location": "Freixo de Espada à Cinta, Bragança",
    "website": "https://hotelfreixo.pt",
    "email": "reservas@hotelfreixo.pt",
    "phone": "279034930",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=285&f%5B0%5D=bm_field_ma_parque_de_estacionam%3Atrue&f%5B1%5D=bm_field_ma_parque_jardim%3Atrue&f%5B2%5D=bm_field_ma_bikefriendly%3Atrue&order=1&page=2",
    "observation": "Atividade identificada em fonte pública: Hotelaria.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de hotelaria.",
    "service": "design"
  },
  {
    "company": "Hotel Miracastro",
    "sector": "Hotelaria",
    "email_area": "Turismo & Alojamento",
    "location": "Castro Laboreiro, Viana do Castelo",
    "website": "https://hotelmiracastro.com",
    "email": "geral@hotelmiracastro.com",
    "phone": "251460020",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=285&f%5B0%5D=bm_field_ma_parque_de_estacionam%3Atrue&f%5B1%5D=bm_field_ma_parque_jardim%3Atrue&f%5B2%5D=bm_field_ma_bikefriendly%3Atrue&order=1&page=2",
    "observation": "Atividade identificada em fonte pública: Hotelaria.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de hotelaria.",
    "service": "design"
  },
  {
    "company": "Hotel da Vila",
    "sector": "Hotelaria",
    "email_area": "Turismo & Alojamento",
    "location": "Seia, Guarda",
    "website": "https://hoteldavila.pt",
    "email": "geral@hoteldavila.pt",
    "phone": "963968013",
    "source": "https://www.visitportugal.com/pt-pt/search/site?context=490&localidades=%28tid%3A130+OR+tid%3A141+OR+tid%3A145+OR+tid%3A151+OR+tid%3A154+OR+tid%3A155+OR+tid%3A163+OR+tid%3A176+OR+tid%3A190%29&page=11&regioes=%28tid%3A118%29&visitas=1",
    "observation": "Atividade identificada em fonte pública: Hotelaria.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de hotelaria.",
    "service": "design"
  },
  {
    "company": "Hotel Solar do Rebolo",
    "sector": "Hotelaria",
    "email_area": "Turismo & Alojamento",
    "location": "Oliveira do Hospital, Coimbra",
    "website": "https://solardorebolo.pt",
    "email": "geral@solardorebolo.pt",
    "phone": "238607135",
    "source": "https://www.visitportugal.com/pt-pt/search/site?context=490&localidades=%28tid%3A130+OR+tid%3A141+OR+tid%3A145+OR+tid%3A151+OR+tid%3A154+OR+tid%3A155+OR+tid%3A163+OR+tid%3A176+OR+tid%3A190%29&page=11&regioes=%28tid%3A118%29&visitas=1",
    "observation": "Atividade identificada em fonte pública: Hotelaria.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de hotelaria.",
    "service": "design"
  },
  {
    "company": "Monte do Corgo da Vaca",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Odemira, Beja",
    "website": "https://corgodavaca.pt",
    "email": "reservas@corgodavaca.pt",
    "phone": "965683454",
    "source": "https://www.visitportugal.com/pt-pt/search/site?context=490&localidades=%28tid%3A45+OR+tid%3A46+OR+tid%3A53+OR+tid%3A54+OR+tid%3A58+OR+tid%3A74+OR+tid%3A81+OR+tid%3A82+OR+tid%3A83+OR+tid%3A84+OR+tid%3A89%29&page=9&regioes=%28tid%3A35%29&visitas=1",
    "observation": "Atividade identificada em fonte pública: Turismo rural.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de turismo rural.",
    "service": "design"
  },
  {
    "company": "Ecoland",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Mértola, Beja",
    "website": "https://ecoland.pt",
    "email": "info@ecoland.pt",
    "phone": "286611111",
    "source": "https://www.visitportugal.com/pt-pt/search/site?context=490&localidades=%28tid%3A40+OR+tid%3A46+OR+tid%3A50+OR+tid%3A58+OR+tid%3A68+OR+tid%3A71+OR+tid%3A64+OR+tid%3A74+OR+tid%3A82+OR+tid%3A84+OR+tid%3A89%29&page=4&regioes=%28tid%3A35%29&visitas=1",
    "observation": "Atividade identificada em fonte pública: Turismo rural.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de turismo rural.",
    "service": "design"
  },
  {
    "company": "A Serenada",
    "sector": "Enoturismo e alojamento",
    "email_area": "Turismo & Alojamento",
    "location": "Grândola, Setúbal",
    "website": "https://serenada.pt",
    "email": "reservas@serenada.pt",
    "phone": "269498014",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=35&f%5B0%5D=bm_field_ma_acesso_internet_%3Atrue&f%5B1%5D=bm_field_ma_bar%3Atrue&f%5B2%5D=bm_field_ma_ar_condicionado_no_q%3Atrue&order=1",
    "observation": "Atividade identificada em fonte pública: Enoturismo e alojamento.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de enoturismo e alojamento.",
    "service": "design"
  },
  {
    "company": "Bética Hotel Rural",
    "sector": "Hotelaria",
    "email_area": "Turismo & Alojamento",
    "location": "Pias, Beja",
    "website": "https://beticahotelrural.com",
    "email": "geral@beticahotelrural.com",
    "phone": "284858714",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=35&f%5B0%5D=bm_field_ma_acesso_internet_%3Atrue&f%5B1%5D=bm_field_ma_bar%3Atrue&f%5B2%5D=bm_field_ma_ar_condicionado_no_q%3Atrue&order=1",
    "observation": "Atividade identificada em fonte pública: Hotelaria.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de hotelaria.",
    "service": "design"
  },
  {
    "company": "Mendes & Duarte",
    "sector": "Carpintaria e mobiliário",
    "email_area": "Indústria & Produção",
    "location": "Santarém, Santarém",
    "website": "",
    "email": "geral@mendeseduarte.com",
    "phone": "243469336",
    "source": "https://compronoribatejo.pt/empresa/mendes-e-duarte-lda",
    "observation": "Atividade identificada em fonte pública: Carpintaria e mobiliário.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de carpintaria e mobiliário.",
    "service": "design"
  },
  {
    "company": "PONTOTOP",
    "sector": "Topografia e arquitetura",
    "email_area": "Construção & Engenharia",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://pontotop.pt",
    "email": "geral@pontotop.pt",
    "phone": "272323328",
    "source": "https://www.pontotop.pt/",
    "observation": "Atividade identificada em fonte pública: Topografia e arquitetura.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de topografia e arquitetura.",
    "service": "design"
  },
  {
    "company": "Centro de Estudos da Boavista",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Porto, Porto",
    "website": "https://centboavista.webnode.pt",
    "email": "geral@estudosboavista.com",
    "phone": "226094393",
    "source": "https://centboavista.webnode.pt/contactos/",
    "observation": "Atividade identificada em fonte pública: Centro de estudos.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de centro de estudos.",
    "service": "design"
  },
  {
    "company": "JTSL Soluções Técnicas",
    "sector": "Manutenção industrial",
    "email_area": "Indústria & Produção",
    "location": "Penacova, Coimbra",
    "website": "https://jtsl.pt",
    "email": "geral@jtsl.pt",
    "phone": "239470080",
    "source": "https://ruis.aiccopn.pt/empresas/jtsl-solucoes-tecnicas-manutencao-metalomecanica-s-a/",
    "observation": "Atividade identificada em fonte pública: Manutenção industrial.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de manutenção industrial.",
    "service": "design"
  },
  {
    "company": "CVB Conceito Metálico",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Ílhavo, Aveiro",
    "website": "https://conceitometalico.pt",
    "email": "geral@conceitometalico.pt",
    "phone": "234327269",
    "source": "https://www.conceitometalico.pt/",
    "observation": "Atividade identificada em fonte pública: Metalomecânica.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de metalomecânica.",
    "service": "design"
  },
  {
    "company": "Traços Fortes",
    "sector": "Carpintaria e construção",
    "email_area": "Construção & Engenharia",
    "location": "Santarém, Santarém",
    "website": "https://tracosfortes.pt",
    "email": "geral@tracosfortes.pt",
    "phone": "243405182",
    "source": "https://tracosfortes.pt/",
    "observation": "Atividade identificada em fonte pública: Carpintaria e construção.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de carpintaria e construção.",
    "service": "design"
  },
  {
    "company": "Centro de Estudos Maria Miguel",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Porto, Porto",
    "website": "https://mariamiguelestudos.com",
    "email": "geral@mariamiguelestudos.com",
    "phone": "918227847",
    "source": "https://mariamiguelestudos.com/contactos/",
    "observation": "Atividade identificada em fonte pública: Centro de estudos.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de centro de estudos.",
    "service": "design"
  },
  {
    "company": "Lança Encanto",
    "sector": "Carpintaria e mobiliário",
    "email_area": "Indústria & Produção",
    "location": "Ourém, Santarém",
    "website": "https://lancaencanto.pt",
    "email": "geral@lancaencanto.pt",
    "phone": "249595894",
    "source": "https://www.lancaencanto.pt/index.php",
    "observation": "Atividade identificada em fonte pública: Carpintaria e mobiliário.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de carpintaria e mobiliário.",
    "service": "design"
  },
  {
    "company": "GAPLR Engenharia",
    "sector": "Engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Mafra, Lisboa",
    "website": "https://gaplr.com",
    "email": "geral@gaplr.com",
    "phone": "219863894",
    "source": "https://www.gaplr.com/",
    "observation": "Atividade identificada em fonte pública: Engenharia.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de engenharia.",
    "service": "design"
  },
  {
    "company": "VA Construções",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://vaconstrucoes.pt",
    "email": "geral@vaconstrucoes.pt",
    "phone": "932346145",
    "source": "https://vaconstrucoes.pt/",
    "observation": "Atividade identificada em fonte pública: Construção civil.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de construção civil.",
    "service": "design"
  },
  {
    "company": "GEV Grupo de Estudos Vasculares",
    "sector": "Saúde",
    "email_area": "Saúde",
    "location": "Porto, Porto",
    "website": "https://grupoestudosvasculares.com",
    "email": "info@grupoestudosvasculares.com",
    "phone": "222056963",
    "source": "https://www.grupoestudosvasculares.com/contactos",
    "observation": "Atividade identificada em fonte pública: Saúde.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de saúde.",
    "service": "design"
  },
  {
    "company": "Smarties Centro de Estudos",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Porto, Porto",
    "website": "https://smartiescentrodeestudos.pt",
    "email": "geral@smartiescentrodeestudos.pt",
    "phone": "935895325",
    "source": "https://smartiescentrodeestudos.pt/",
    "observation": "Atividade identificada em fonte pública: Centro de estudos.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de centro de estudos.",
    "service": "design"
  },
  {
    "company": "Smart Value Consulting",
    "sector": "Consultoria",
    "email_area": "Serviços Profissionais",
    "location": "Porto, Porto",
    "website": "https://smartvalue.eu",
    "email": "geral@smartvalue.eu",
    "phone": "960166392",
    "source": "https://www.smartvalue.eu/",
    "observation": "Atividade identificada em fonte pública: Consultoria.",
    "opportunity": "Possível desenvolvimento de materiais gráficos de apresentação de consultoria.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-12).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-12:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-12:',e.message)}
