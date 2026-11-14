// DUIT — Portugal continental, 2026-11-13. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Transdaire",
    "sector": "Transportes de mercadorias",
    "email_area": "Transportes & Logística",
    "location": "Castro Daire, Viseu",
    "website": "https://transdaire.pt",
    "email": "geral@transdaire.pt",
    "phone": "232382102",
    "source": "https://transdaire.pt/contactos/",
    "observation": "Atividade de transportes de mercadorias; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de transportes de mercadorias.",
    "service": "design"
  },
  {
    "company": "Transportes Louzeiro",
    "sector": "Transportes de mercadorias",
    "email_area": "Transportes & Logística",
    "location": "Fânzeres, Porto",
    "website": "https://transporteslouzeiro.pt",
    "email": "geral@transporteslouzeiro.pt",
    "phone": "919107926",
    "source": "https://www.transporteslouzeiro.pt/",
    "observation": "Atividade de transportes de mercadorias; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de transportes de mercadorias.",
    "service": "design"
  },
  {
    "company": "Dental Design Institute",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Benedita, Leiria",
    "website": "https://dentaldesigninstitute.pt",
    "email": "geral@dentaldesigninstitute.pt",
    "phone": "262247290",
    "source": "https://www.dentaldesigninstitute.pt/contactos/",
    "observation": "Atividade de medicina dentária; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de medicina dentária.",
    "service": "design"
  },
  {
    "company": "George Gomes Dental Center",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Oeiras, Lisboa",
    "website": "https://ggdc.pt",
    "email": "geral@ggdc.pt",
    "phone": "211376141",
    "source": "https://www.ggdc.pt/contactos/",
    "observation": "Atividade de medicina dentária; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de medicina dentária.",
    "service": "design"
  },
  {
    "company": "Hiclinic Dental Care",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Aveiro, Aveiro",
    "website": "https://hiclinic.pt",
    "email": "geral@hiclinic.pt",
    "phone": "234421000",
    "source": "https://hiclinic.pt/contactos/",
    "observation": "Atividade de medicina dentária; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de medicina dentária.",
    "service": "design"
  },
  {
    "company": "DentaliUM",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Almada, Setúbal",
    "website": "https://dentalium.pt",
    "email": "geral@dentalium.pt",
    "phone": "212590869",
    "source": "https://www.dentalium.pt/contactos",
    "observation": "Atividade de medicina dentária; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de medicina dentária.",
    "service": "design"
  },
  {
    "company": "Selmape",
    "sector": "Transportes rodoviários",
    "email_area": "Transportes & Logística",
    "location": "Pombal, Leiria",
    "website": "https://selmape.pt",
    "email": "geral@selmape.pt",
    "phone": "236211803",
    "source": "https://selmape.pt/contactos/",
    "observation": "Atividade de transportes rodoviários; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de transportes rodoviários.",
    "service": "design"
  },
  {
    "company": "Afonso & Afonso",
    "sector": "Carpintaria e mobiliário",
    "email_area": "Indústria & Produção",
    "location": "Loures, Lisboa",
    "website": "https://afonsoeafonso.pt",
    "email": "geral@afonsoeafonso.pt",
    "phone": "219827330",
    "source": "https://www.afonsoeafonso.pt/carpintaria",
    "observation": "Atividade de carpintaria e mobiliário; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de carpintaria e mobiliário.",
    "service": "design"
  },
  {
    "company": "Quinta da Corredoura",
    "sector": "Hotel rural e restauração",
    "email_area": "Turismo & Alojamento",
    "location": "Guimarães, Braga",
    "website": "https://quintadacorredourahotelrural.pt",
    "email": "geral@quintadacorredourahotelrural.pt",
    "phone": "912354560",
    "source": "https://www.quintadacorredourahotelrural.pt/termos-condicoes/",
    "observation": "Atividade de hotel rural e restauração; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de hotel rural e restauração.",
    "service": "design"
  },
  {
    "company": "Caixaltur",
    "sector": "Caixilharia de alumínio",
    "email_area": "Construção & Engenharia",
    "location": "Alcobaça, Leiria",
    "website": "https://caixaltur.pt",
    "email": "geral@caixaltur.pt",
    "phone": "967818572",
    "source": "https://www.fundoambiental.pt/plataforma-vales-de-eficiencia/lista-de-fornecedores-vale-eficiencia.aspx",
    "observation": "Atividade de caixilharia de alumínio; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de caixilharia de alumínio.",
    "service": "design"
  },
  {
    "company": "Pedro Correia Silva Serralharia",
    "sector": "Serralharia",
    "email_area": "Indústria & Produção",
    "location": "Póvoa de Varzim, Porto",
    "website": "https://pc-serralharia.pt",
    "email": "geral@pc-serralharia.pt",
    "phone": "917471042",
    "source": "https://www.fundoambiental.pt/plataforma-vales-de-eficiencia/lista-de-fornecedores-vale-eficiencia.aspx",
    "observation": "Atividade de serralharia; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de serralharia.",
    "service": "design"
  },
  {
    "company": "BIGSOLAR",
    "sector": "Energias renováveis",
    "email_area": "Construção & Engenharia",
    "location": "Guarda, Guarda",
    "website": "https://bigsolar.eu",
    "email": "geral@bigsolar.eu",
    "phone": "271225025",
    "source": "https://www.fundoambiental.pt/plataforma-vales-de-eficiencia/lista-de-fornecedores-vale-eficiencia.aspx",
    "observation": "Atividade de energias renováveis; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de energias renováveis.",
    "service": "design"
  },
  {
    "company": "Jorge F. Ramos",
    "sector": "Transformação de alumínio",
    "email_area": "Indústria & Produção",
    "location": "Trancoso, Guarda",
    "website": "https://aluminiosjramos.pt",
    "email": "geral@aluminiosjramos.pt",
    "phone": "963050368",
    "source": "https://www.fundoambiental.pt/plataforma-vales-de-eficiencia/lista-de-fornecedores-vale-eficiencia.aspx",
    "observation": "Atividade de transformação de alumínio; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de transformação de alumínio.",
    "service": "design"
  },
  {
    "company": "Serralharia Progresso",
    "sector": "Serralharia",
    "email_area": "Indústria & Produção",
    "location": "Sabrosa, Vila Real",
    "website": "https://serralhariaprogresso.com",
    "email": "comercial@serralhariaprogresso.com",
    "phone": "259930182",
    "source": "https://www.fundoambiental.pt/plataforma-vales-de-eficiencia/lista-de-fornecedores-vale-eficiencia.aspx",
    "observation": "Atividade de serralharia; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de serralharia.",
    "service": "design"
  },
  {
    "company": "Estores e Alumínios Lindo Sol",
    "sector": "Estores e alumínios",
    "email_area": "Construção & Engenharia",
    "location": "Penafiel, Porto",
    "website": "https://lindosol.com",
    "email": "geral@lindosol.com",
    "phone": "255752441",
    "source": "https://www.fundoambiental.pt/plataforma-vales-de-eficiencia/lista-de-fornecedores-vale-eficiencia.aspx",
    "observation": "Atividade de estores e alumínios; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de estores e alumínios.",
    "service": "design"
  },
  {
    "company": "Janelas4life",
    "sector": "Caixilharia e janelas",
    "email_area": "Construção & Engenharia",
    "location": "Viseu, Viseu",
    "website": "https://janelas4life.pt",
    "email": "geral@janelas4life.pt",
    "phone": "232103531",
    "source": "https://www.fundoambiental.pt/plataforma-vales-de-eficiencia/lista-de-fornecedores-vale-eficiencia.aspx",
    "observation": "Atividade de caixilharia e janelas; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de caixilharia e janelas.",
    "service": "design"
  },
  {
    "company": "Gobar Serralharia",
    "sector": "Serralharia de construção civil",
    "email_area": "Indústria & Produção",
    "location": "Vila Pouca de Aguiar, Vila Real",
    "website": "https://gobar.pt",
    "email": "geral@gobar.pt",
    "phone": "259434673",
    "source": "https://www.fundoambiental.pt/plataforma-vales-de-eficiencia/lista-de-fornecedores-vale-eficiencia.aspx",
    "observation": "Atividade de serralharia de construção civil; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de serralharia de construção civil.",
    "service": "design"
  },
  {
    "company": "Pereira e Filhos",
    "sector": "Construção e caixilharia",
    "email_area": "Construção & Engenharia",
    "location": "Bragança, Bragança",
    "website": "https://pereiraefilhos.com",
    "email": "geral@pereiraefilhos.com",
    "phone": "273313133",
    "source": "https://www.fundoambiental.pt/plataforma-vales-de-eficiencia/lista-de-fornecedores-vale-eficiencia.aspx",
    "observation": "Atividade de construção e caixilharia; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de construção e caixilharia.",
    "service": "design"
  },
  {
    "company": "Serralharia Matos",
    "sector": "Serralharia",
    "email_area": "Indústria & Produção",
    "location": "Estarreja, Aveiro",
    "website": "https://serralhariamatos.pt",
    "email": "geral@serralhariamatos.pt",
    "phone": "234843841",
    "source": "https://www.fundoambiental.pt/plataforma-vales-de-eficiencia/lista-de-fornecedores-vale-eficiencia.aspx",
    "observation": "Atividade de serralharia; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de serralharia.",
    "service": "design"
  },
  {
    "company": "Janelas Norte",
    "sector": "Caixilharia",
    "email_area": "Construção & Engenharia",
    "location": "Vila Nova de Famalicão, Braga",
    "website": "https://janelasnorte.pt",
    "email": "comercial@janelasnorte.pt",
    "phone": "913851492",
    "source": "https://www.fundoambiental.pt/plataforma-vales-de-eficiencia/lista-de-fornecedores-vale-eficiencia.aspx",
    "observation": "Atividade de caixilharia; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de caixilharia.",
    "service": "design"
  },
  {
    "company": "DGF Indústria de Alumínios",
    "sector": "Indústria de alumínios",
    "email_area": "Indústria & Produção",
    "location": "Almeirim, Santarém",
    "website": "https://dgf-aluminios.com",
    "email": "geral@dgf-aluminios.com",
    "phone": "917995012",
    "source": "https://www.fundoambiental.pt/plataforma-vales-de-eficiencia/lista-de-fornecedores-vale-eficiencia.aspx",
    "observation": "Atividade de indústria de alumínios; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de indústria de alumínios.",
    "service": "design"
  },
  {
    "company": "Serralharia A. F. Lopes",
    "sector": "Serralharia",
    "email_area": "Indústria & Produção",
    "location": "Viseu, Viseu",
    "website": "https://serralhariaafl.com",
    "email": "geral@serralhariaafl.com",
    "phone": "968526650",
    "source": "https://www.fundoambiental.pt/plataforma-vales-de-eficiencia/lista-de-fornecedores-vale-eficiencia.aspx",
    "observation": "Atividade de serralharia; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de serralharia.",
    "service": "design"
  },
  {
    "company": "Sicoalumínios",
    "sector": "Caixilharia de alumínio",
    "email_area": "Construção & Engenharia",
    "location": "Pombal, Leiria",
    "website": "https://sicoaluminios.pt",
    "email": "geral@sicoaluminios.pt",
    "phone": "236921351",
    "source": "https://www.fundoambiental.pt/plataforma-vales-de-eficiencia/lista-de-fornecedores-vale-eficiencia.aspx",
    "observation": "Atividade de caixilharia de alumínio; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de caixilharia de alumínio.",
    "service": "design"
  },
  {
    "company": "Janelas Diafanas",
    "sector": "Caixilharia",
    "email_area": "Construção & Engenharia",
    "location": "Cascais, Lisboa",
    "website": "https://janelasdiafanas.pt",
    "email": "geral@janelasdiafanas.pt",
    "phone": "211303888",
    "source": "https://www.fundoambiental.pt/plataforma-vales-de-eficiencia/lista-de-fornecedores-vale-eficiencia.aspx",
    "observation": "Atividade de caixilharia; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de caixilharia.",
    "service": "design"
  },
  {
    "company": "Caixiplás",
    "sector": "Caixilharias isolantes",
    "email_area": "Construção & Engenharia",
    "location": "Cascais, Lisboa",
    "website": "https://caixiplas.pt",
    "email": "leonorantunes@caixiplas.pt",
    "phone": "214449460",
    "source": "https://www.fundoambiental.pt/plataforma-vales-de-eficiencia/lista-de-fornecedores-vale-eficiencia.aspx",
    "observation": "Atividade de caixilharias isolantes; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de caixilharias isolantes.",
    "service": "design"
  },
  {
    "company": "Cidade PVC",
    "sector": "Caixilharia PVC",
    "email_area": "Construção & Engenharia",
    "location": "Entroncamento, Santarém",
    "website": "https://cidadepvc.pt",
    "email": "joao.patinha@cidadepvc.pt",
    "phone": "933608703",
    "source": "https://www.fundoambiental.pt/plataforma-vales-de-eficiencia/lista-de-fornecedores-vale-eficiencia.aspx",
    "observation": "Atividade de caixilharia pvc; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de caixilharia pvc.",
    "service": "design"
  },
  {
    "company": "Alubicer",
    "sector": "Indústria de alumínios",
    "email_area": "Indústria & Produção",
    "location": "Leiria, Leiria",
    "website": "https://alubicer.com",
    "email": "geral@alubicer.com",
    "phone": "244722183",
    "source": "https://www.fundoambiental.pt/plataforma-vales-de-eficiencia/lista-de-fornecedores-vale-eficiencia.aspx",
    "observation": "Atividade de indústria de alumínios; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de indústria de alumínios.",
    "service": "design"
  },
  {
    "company": "Amadeu Bastos Serralharia",
    "sector": "Serralharia",
    "email_area": "Indústria & Produção",
    "location": "Felgueiras, Porto",
    "website": "https://serralhariabastos.com",
    "email": "geral@serralhariabastos.com",
    "phone": "255482299",
    "source": "https://www.fundoambiental.pt/plataforma-vales-de-eficiencia/lista-de-fornecedores-vale-eficiencia.aspx",
    "observation": "Atividade de serralharia; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de serralharia.",
    "service": "design"
  },
  {
    "company": "Caixitâmega Alumínios",
    "sector": "Caixilharia",
    "email_area": "Construção & Engenharia",
    "location": "Amarante, Porto",
    "website": "https://caixitamega.pt",
    "email": "geral@caixitamega.pt",
    "phone": "255134292",
    "source": "https://www.fundoambiental.pt/plataforma-vales-de-eficiencia/lista-de-fornecedores-vale-eficiencia.aspx",
    "observation": "Atividade de caixilharia; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de caixilharia.",
    "service": "design"
  },
  {
    "company": "Viscaixi",
    "sector": "Caixilharia",
    "email_area": "Construção & Engenharia",
    "location": "Viseu, Viseu",
    "website": "https://viscaixi.pt",
    "email": "geral@viscaixi.pt",
    "phone": "232094778",
    "source": "https://www.fundoambiental.pt/plataforma-vales-de-eficiencia/lista-de-fornecedores-vale-eficiencia.aspx",
    "observation": "Atividade de caixilharia; email e localização constam da fonte indicada.",
    "opportunity": "Possível desenvolvimento de peças gráficas para apresentação de serviços de caixilharia.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-14).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-14-b:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-14-b:',e.message)}
