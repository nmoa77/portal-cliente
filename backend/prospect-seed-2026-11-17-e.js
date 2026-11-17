// DUIT — Portugal continental, 2026-11-17-e. Contactos públicos confirmados em fontes oficiais ou institucionais.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Clínica Nova Aliança",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Ramada, Lisboa",
    "website": "https://clinicanovaalianca.pt",
    "email": "geral@clinicanovaalianca.pt",
    "phone": "927420963",
    "source": "https://clinicanovaalianca.pt/contact-us/",
    "observation": "Atividade de fisioterapia e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de fisioterapia.",
    "service": "design"
  },
  {
    "company": "Carlos A. Lacerda",
    "sector": "Serralharia e caixilharia",
    "email_area": "Indústria & Produção",
    "location": "Lisboa, Lisboa",
    "website": "https://serralharia.pt",
    "email": "info@carlosalacerda.com",
    "phone": "217164599",
    "source": "https://www.serralharia.pt/contacts",
    "observation": "Atividade de serralharia e caixilharia e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de serralharia e caixilharia.",
    "service": "design"
  },
  {
    "company": "Transportes Figueiredo",
    "sector": "Transportes e logística",
    "email_area": "Transportes & Logística",
    "location": "Oliveira de Azeméis, Aveiro",
    "website": "https://transportesfigueiredo.pt",
    "email": "comercial@transportesfigueiredo.pt",
    "phone": "256664020",
    "source": "https://transportesfigueiredo.pt/contactos/",
    "observation": "Atividade de transportes e logística e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de transportes e logística.",
    "service": "design"
  },
  {
    "company": "Serralharia JR",
    "sector": "Serralharia",
    "email_area": "Indústria & Produção",
    "location": "Mortágua, Viseu",
    "website": "https://serralhariajr.pt",
    "email": "geral@serralhariajr.pt",
    "phone": "917393374",
    "source": "https://www.serralhariajr.pt/contactos",
    "observation": "Atividade de serralharia e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de serralharia.",
    "service": "design"
  },
  {
    "company": "AFF Serralharia Civil",
    "sector": "Serralharia",
    "email_area": "Indústria & Produção",
    "location": "Sever do Vouga, Aveiro",
    "website": "https://aff.com.pt",
    "email": "geral@aff.com.pt",
    "phone": "234558749",
    "source": "https://aff.com.pt/contactos/",
    "observation": "Atividade de serralharia e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de serralharia.",
    "service": "design"
  },
  {
    "company": "Serralharia Costa",
    "sector": "Serralharia",
    "email_area": "Indústria & Produção",
    "location": "Braga, Braga",
    "website": "https://serralharia-costa.pt",
    "email": "geral@serralharia-costa.pt",
    "phone": "253672516",
    "source": "https://serralharia-costa.pt/contactos/",
    "observation": "Atividade de serralharia e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de serralharia.",
    "service": "design"
  },
  {
    "company": "Clínica 3D Physio",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Lisboa, Lisboa",
    "website": "https://clinica3dphysio.pt",
    "email": "geral@clinica3dphysio.pt",
    "phone": "939849615",
    "source": "https://clinica3dphysio.pt/contactos/",
    "observation": "Atividade de fisioterapia e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de fisioterapia.",
    "service": "design"
  },
  {
    "company": "Clínica Rui Faria",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Leiria, Leiria",
    "website": "https://clinicaruifaria.pt",
    "email": "info@clinicaruifaria.pt",
    "phone": "244827685",
    "source": "https://clinicaruifaria.pt/contactos/",
    "observation": "Atividade de fisioterapia e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de fisioterapia.",
    "service": "design"
  },
  {
    "company": "Alcantra Fisio",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Lisboa, Lisboa",
    "website": "https://alcantrafisio.pt",
    "email": "clinica@alcantrafisio.pt",
    "phone": "217575721",
    "source": "https://alcantrafisio.pt/",
    "observation": "Atividade de fisioterapia e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de fisioterapia.",
    "service": "design"
  },
  {
    "company": "Serralharia Prefilipe",
    "sector": "Serralharia",
    "email_area": "Indústria & Produção",
    "location": "Santa Maria da Feira, Aveiro",
    "website": "https://serralharia.net",
    "email": "prefilipe@serralharia.net",
    "phone": "256911620",
    "source": "https://www.serralharia.net/sobre.html",
    "observation": "Atividade de serralharia e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de serralharia.",
    "service": "design"
  },
  {
    "company": "Explicas Centro de Estudos",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Seixal, Setúbal",
    "website": "https://explicas.pt",
    "email": "centro@explicas.pt",
    "phone": "913443721",
    "source": "https://explicas.pt/",
    "observation": "Atividade de centro de estudos e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de centro de estudos.",
    "service": "design"
  },
  {
    "company": "Aldeia do Pontido",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Fafe, Braga",
    "website": "https://aldeiadopontido.com",
    "email": "geral@aldeiadopontido.com",
    "phone": "253508108",
    "source": "https://www.visitportugal.com/pt-pt/taxonomy/term/530",
    "observation": "Atividade de turismo rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Madrugada Turismo Rural",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Évora, Évora",
    "website": "https://madrugadaturismorural.com",
    "email": "info@madrugadaevora.com",
    "phone": "918784221",
    "source": "https://www.visitportugal.com/pt-pt/taxonomy/term/530",
    "observation": "Atividade de turismo rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de turismo rural.",
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
    "source": "https://www.visitportugal.com/pt-pt/taxonomy/term/530",
    "observation": "Atividade de turismo rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de turismo rural.",
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
    "source": "https://www.visitportugal.com/pt-pt/taxonomy/term/530",
    "observation": "Atividade de agroturismo e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de agroturismo.",
    "service": "design"
  },
  {
    "company": "Encostas do Côa",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Pinhel, Guarda",
    "website": "https://encostasdocoa.pt",
    "email": "geral@encostasdocoa.pt",
    "phone": "271411132",
    "source": "https://valedocoa.pt/alojamento/",
    "observation": "Atividade de turismo rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Quinta das Pias",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Pinhel, Guarda",
    "website": "https://quintadaspias.com",
    "email": "reservas@quintadaspias.com",
    "phone": "919792315",
    "source": "https://valedocoa.pt/alojamento/",
    "observation": "Atividade de turismo rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Casas do Juízo",
    "sector": "Turismo de aldeia",
    "email_area": "Turismo & Alojamento",
    "location": "Pinhel, Guarda",
    "website": "https://casasdojuizo.com",
    "email": "reservas@casasdojuizo.com",
    "phone": "927585758",
    "source": "https://valedocoa.pt/alojamento/",
    "observation": "Atividade de turismo de aldeia e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de turismo de aldeia.",
    "service": "design"
  },
  {
    "company": "Cidadelhe Rupestre",
    "sector": "Alojamento turístico",
    "email_area": "Turismo & Alojamento",
    "location": "Pinhel, Guarda",
    "website": "https://cidadelherupestre.com",
    "email": "info@cidadelherupestre.com",
    "phone": "961083914",
    "source": "https://valedocoa.pt/alojamento/",
    "observation": "Atividade de alojamento turístico e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de alojamento turístico.",
    "service": "design"
  },
  {
    "company": "In Bulla",
    "sector": "Turismo rural e bem-estar",
    "email_area": "Turismo & Alojamento",
    "location": "Guarda, Guarda",
    "website": "https://inbulla.pt",
    "email": "info@inbulla.pt",
    "phone": "964806977",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo/Portugal?f%5B0%5D=bm_field_ma_acesso_internet_%3Atrue&f%5B1%5D=im_subtipo_alojamento%3A586&f%5B2%5D=sm_field_ts_tipo_alojamento%3Acasasdecampo&f%5B3%5D=bm_field_ma_parque_de_estacionam%3Atrue&f%5B4%5D=bm_field_ma_acesso_internet_no_q%3Atrue&f%5B5%5D=bm_field_ma_smokefree%3Atrue&f%5B6%5D=bm_field_ma_parque_jardim%3Atrue&f%5B7%5D=bm_field_ma_quarto_com_aquecimen%3Atrue&f%5B8%5D=bm_field_ma_aceita_animais_de_es%3Atrue&visitas=1",
    "observation": "Atividade de turismo rural e bem-estar e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de turismo rural e bem-estar.",
    "service": "design"
  },
  {
    "company": "Retiro da Devesa",
    "sector": "Alojamento local",
    "email_area": "Turismo & Alojamento",
    "location": "Sertã, Castelo Branco",
    "website": "https://retirodadevesa.pt",
    "email": "al@retirodadevesa.pt",
    "phone": "914267943",
    "source": "https://esferareal.com/contactos-uteis/",
    "observation": "Atividade de alojamento local e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de alojamento local.",
    "service": "design"
  },
  {
    "company": "Casa dos Alicates",
    "sector": "Alojamento local",
    "email_area": "Turismo & Alojamento",
    "location": "Sertã, Castelo Branco",
    "website": "https://casadosalicates.pt",
    "email": "info@casadosalicates.pt",
    "phone": "913888520",
    "source": "https://esferareal.com/contactos-uteis/",
    "observation": "Atividade de alojamento local e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de alojamento local.",
    "service": "design"
  },
  {
    "company": "Clínica Dentária Dra. Ana Chin",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Odivelas, Lisboa",
    "website": "https://clinicadentaria-anachin.pt",
    "email": "geral@clinicadentaria-anachin.pt",
    "phone": "219324865",
    "source": "https://clinicadentaria-anachin.pt/contactos/",
    "observation": "Atividade de medicina dentária e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de medicina dentária.",
    "service": "design"
  },
  {
    "company": "João Andrade Clínica",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Odivelas, Lisboa",
    "website": "https://joaoandradeclinica.pt",
    "email": "geral@joaoandradeclinica.pt",
    "phone": "211506468",
    "source": "https://joaoandradeclinica.pt/",
    "observation": "Atividade de medicina dentária e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de medicina dentária.",
    "service": "design"
  },
  {
    "company": "KFZ Technik",
    "sector": "Oficina automóvel",
    "email_area": "Automóvel",
    "location": "Odivelas, Lisboa",
    "website": "https://kfz.pt",
    "email": "geral@kfz.pt",
    "phone": "968585829",
    "source": "https://www.kfz.pt/",
    "observation": "Atividade de oficina automóvel e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de oficina automóvel.",
    "service": "design"
  },
  {
    "company": "Central Clinic",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Lisboa, Lisboa",
    "website": "https://centralclinic.pt",
    "email": "geral@centralclinic.pt",
    "phone": "218821779",
    "source": "https://centralclinic.pt/pt/",
    "observation": "Atividade de medicina dentária e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de medicina dentária.",
    "service": "design"
  },
  {
    "company": "Clínica Dentária do Marquês",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Lisboa, Lisboa",
    "website": "https://clinicadomarques.pt",
    "email": "geral@clinicadomarques.pt",
    "phone": "211977188",
    "source": "https://clinicadomarques.pt/contactos/",
    "observation": "Atividade de medicina dentária e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de medicina dentária.",
    "service": "design"
  },
  {
    "company": "Prime Dental Clinic",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Lisboa, Lisboa",
    "website": "https://primedentalclinic.pt",
    "email": "geral@primedentalclinic.pt",
    "phone": "926679801",
    "source": "https://primedentalclinic.pt/contactos/",
    "observation": "Atividade de medicina dentária e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de medicina dentária.",
    "service": "design"
  },
  {
    "company": "ACR Clínica Dentária",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Santiago do Cacém, Setúbal",
    "website": "https://acrclinicadentaria.pt",
    "email": "geral@acrclinicadentaria.pt",
    "phone": "269744706",
    "source": "https://www.acrclinicadentaria.pt/",
    "observation": "Atividade de medicina dentária e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de medicina dentária.",
    "service": "design"
  },
  {
    "company": "JJ Dental Clinic",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Lisboa, Lisboa",
    "website": "https://jjdentalclinic.pt",
    "email": "geral@jjdentalclinic.pt",
    "phone": "215906669",
    "source": "https://jjdentalclinic.pt/contactos/",
    "observation": "Atividade de medicina dentária e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentação dos serviços de medicina dentária.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-17-e).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-17-e:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-17-e:',e.message)}
