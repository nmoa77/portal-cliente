// DUIT — 2026-11-20. Contactos públicos verificados em páginas empresariais e fontes institucionais.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Casa da Pousada",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Roriz, Barcelos, Braga",
    "website": "https://casadapousada.com",
    "email": "info@casadapousada.com",
    "phone": "253880618",
    "source": "https://cm-barcelos.pt/visitar/onde-ficar/turismo-no-espaco-rural/",
    "observation": "A fonte pública identifica a atividade de turismo rural e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Casa de Sequiade",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Sequiade, Barcelos, Braga",
    "website": "https://casadesequiade.com",
    "email": "geral@casadesequiade.com",
    "phone": "253952754",
    "source": "https://cm-barcelos.pt/visitar/onde-ficar/turismo-no-espaco-rural/",
    "observation": "A fonte pública identifica a atividade de turismo rural e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Casa do Monte",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Abade de Neiva, Barcelos, Braga",
    "website": "https://casadomonte.eu",
    "email": "info@casadomonte.eu",
    "phone": "967057779",
    "source": "https://cm-barcelos.pt/visitar/onde-ficar/turismo-no-espaco-rural/",
    "observation": "A fonte pública identifica a atividade de turismo rural e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Casas do Rio Barcelos",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Cossourado, Barcelos, Braga",
    "website": "https://casasdoriobarcelos.com",
    "email": "geral@casasdoriobarcelos.com",
    "phone": "927754421",
    "source": "https://cm-barcelos.pt/visitar/onde-ficar/turismo-no-espaco-rural/",
    "observation": "A fonte pública identifica a atividade de turismo rural e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Naturena Agroturismo",
    "sector": "Agroturismo e bem-estar",
    "email_area": "Turismo & Alojamento",
    "location": "Durrães, Barcelos, Braga",
    "website": "https://naturena.pt",
    "email": "geral@naturena.pt",
    "phone": "258778514",
    "source": "https://cm-barcelos.pt/visitar/onde-ficar/turismo-no-espaco-rural/",
    "observation": "A fonte pública identifica a atividade de agroturismo e bem-estar e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de agroturismo e bem-estar.",
    "service": "design"
  },
  {
    "company": "Quinta de Malta",
    "sector": "Turismo de habitação",
    "email_area": "Turismo & Alojamento",
    "location": "Durrães, Barcelos, Braga",
    "website": "https://quintademalta.com",
    "email": "reservas@quintademalta.com",
    "phone": "258773773",
    "source": "https://cm-barcelos.pt/visitar/onde-ficar/turismo-no-espaco-rural/",
    "observation": "A fonte pública identifica a atividade de turismo de habitação e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de turismo de habitação.",
    "service": "design"
  },
  {
    "company": "Solar Vila Meã",
    "sector": "Hotel rural",
    "email_area": "Turismo & Alojamento",
    "location": "Silveiros, Barcelos, Braga",
    "website": "https://solardevilamea.pt",
    "email": "reservas@solardevilamea.pt",
    "phone": "253400850",
    "source": "https://cm-barcelos.pt/visitar/onde-ficar/turismo-no-espaco-rural/",
    "observation": "A fonte pública identifica a atividade de hotel rural e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de hotel rural.",
    "service": "design"
  },
  {
    "company": "Aires da Serra Hotel",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Torres Novas, Santarém",
    "website": "https://airesdaserrahotel.com",
    "email": "geral@hotelairesdaserra.com",
    "phone": "249824824",
    "source": "https://turismo.reativa.pt/pt/planear-viagem/descobrir/alojamento",
    "observation": "A fonte pública identifica a atividade de turismo rural e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Hotel dos Cavaleiros",
    "sector": "Hotelaria",
    "email_area": "Turismo & Alojamento",
    "location": "Torres Novas, Santarém",
    "website": "https://hoteldoscavaleiros.com",
    "email": "reservas@hoteldoscavaleiros.com",
    "phone": "249819370",
    "source": "https://turismo.reativa.pt/pt/planear-viagem/descobrir/alojamento",
    "observation": "A fonte pública identifica a atividade de hotelaria e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de hotelaria.",
    "service": "design"
  },
  {
    "company": "Hotel Torres Novas",
    "sector": "Hotelaria",
    "email_area": "Turismo & Alojamento",
    "location": "Torres Novas, Santarém",
    "website": "https://hoteltorresnovas.pt",
    "email": "geral@hoteltorresnovas.pt",
    "phone": "249813660",
    "source": "https://turismo.reativa.pt/pt/planear-viagem/descobrir/alojamento",
    "observation": "A fonte pública identifica a atividade de hotelaria e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de hotelaria.",
    "service": "design"
  },
  {
    "company": "Quintinha da Eira",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Assentis, Torres Novas, Santarém",
    "website": "https://quintinhadaeira.com",
    "email": "info@quintinhadaeira.com",
    "phone": "249790462",
    "source": "https://turismo.reativa.pt/pt/planear-viagem/descobrir/alojamento",
    "observation": "A fonte pública identifica a atividade de turismo rural e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Casa das Rendufas",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Chancelaria, Torres Novas, Santarém",
    "website": "https://casadasrendufas.com",
    "email": "geral@casadasrendufas.com",
    "phone": "249791547",
    "source": "https://turismo.reativa.pt/pt/planear-viagem/descobrir/alojamento",
    "observation": "A fonte pública identifica a atividade de turismo rural e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Quinta Manel da Gaita",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Ribeira Branca, Torres Novas, Santarém",
    "website": "https://quintamaneldagaita.pt",
    "email": "info@quintamaneldagaita.pt",
    "phone": "249820352",
    "source": "https://turismo.reativa.pt/pt/planear-viagem/descobrir/alojamento",
    "observation": "A fonte pública identifica a atividade de turismo rural e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "DG Metal Metalomecânica",
    "sector": "Metalomecânica industrial",
    "email_area": "Indústria & Produção",
    "location": "Vieira de Leiria, Leiria",
    "website": "https://dgmetalomecanica.pt",
    "email": "geral@dgmetalomecanica.pt",
    "phone": "910748852",
    "source": "https://dgmetalomecanica.pt/contactos/",
    "observation": "A fonte pública identifica a atividade de metalomecânica industrial e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de metalomecânica industrial.",
    "service": "design"
  },
  {
    "company": "USIMECA Metalomecânica",
    "sector": "Metalomecânica de precisão",
    "email_area": "Indústria & Produção",
    "location": "Pousos, Leiria",
    "website": "https://usimeca.pt",
    "email": "usimeca@usimeca.pt",
    "phone": "244801590",
    "source": "https://usimeca.pt/contact",
    "observation": "A fonte pública identifica a atividade de metalomecânica de precisão e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de metalomecânica de precisão.",
    "service": "design"
  },
  {
    "company": "METALOME",
    "sector": "Fabrico de componentes metalúrgicos",
    "email_area": "Indústria & Produção",
    "location": "Chaves, Vila Real",
    "website": "https://metalome.com",
    "email": "geral@metalome.com",
    "phone": "",
    "source": "https://metalome.com/contactos/",
    "observation": "A fonte pública identifica a atividade de fabrico de componentes metalúrgicos e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de fabrico de componentes metalúrgicos.",
    "service": "design"
  },
  {
    "company": "MECTOP",
    "sector": "Metalomecânica de precisão",
    "email_area": "Indústria & Produção",
    "location": "Setúbal, Setúbal",
    "website": "https://mectop.com",
    "email": "mectop@mectop.com",
    "phone": "265739870",
    "source": "https://www.mectop.com/contactos/",
    "observation": "A fonte pública identifica a atividade de metalomecânica de precisão e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de metalomecânica de precisão.",
    "service": "design"
  },
  {
    "company": "DUA FAR",
    "sector": "Construção e metalomecânica",
    "email_area": "Construção & Engenharia",
    "location": "Escalos de Cima, Castelo Branco",
    "website": "https://duafar.com",
    "email": "comercial@duafar.com",
    "phone": "272425900",
    "source": "https://www.duafar.com/servicos/metalomec%C3%A2nica/",
    "observation": "A fonte pública identifica a atividade de construção e metalomecânica e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de construção e metalomecânica.",
    "service": "design"
  },
  {
    "company": "IMV Metalomecânica",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Amor, Leiria",
    "website": "https://imvlda.com",
    "email": "imv@imvlda.com",
    "phone": "244861706",
    "source": "https://pub-mediabox-storage.rxweb-prd.com/exhibitor/document/exh-29e97dc1-7a25-43a3-bd1a-de1adb661b48/acce66f8-25a6-4e2d-8a03-5f01cf4867f1.pdf",
    "observation": "A fonte pública identifica a atividade de metalomecânica e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de metalomecânica.",
    "service": "design"
  },
  {
    "company": "Auto Mecânica dos Galegos",
    "sector": "Oficina automóvel",
    "email_area": "Automóvel",
    "location": "Guarda, Guarda",
    "website": "https://automecanicagalegos.pt",
    "email": "geral@automecanicagalegos.pt",
    "phone": "271214690",
    "source": "https://automecanicagalegos.pt/",
    "observation": "A fonte pública identifica a atividade de oficina automóvel e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de oficina automóvel.",
    "service": "design"
  },
  {
    "company": "Auto Pereira Costa Pires",
    "sector": "Oficina automóvel",
    "email_area": "Automóvel",
    "location": "Guarda, Guarda",
    "website": "https://autopereiracostapires.pt",
    "email": "geral@autopereiracostapires.pt",
    "phone": "271211645",
    "source": "https://autopereiracostapires.pt/oficina-local/",
    "observation": "A fonte pública identifica a atividade de oficina automóvel e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de oficina automóvel.",
    "service": "design"
  },
  {
    "company": "Autoalegre",
    "sector": "Comércio e assistência automóvel",
    "email_area": "Automóvel",
    "location": "Portalegre, Portalegre",
    "website": "https://autoalegre.pt",
    "email": "geral@autoalegre.pt",
    "phone": "245300900",
    "source": "https://autoalegre.pt/contactos/",
    "observation": "A fonte pública identifica a atividade de comércio e assistência automóvel e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de comércio e assistência automóvel.",
    "service": "design"
  },
  {
    "company": "HPmotors",
    "sector": "Manutenção e reparação automóvel",
    "email_area": "Automóvel",
    "location": "Guarda, Guarda",
    "website": "https://hpmotors.pt",
    "email": "geral@hpmotors.pt",
    "phone": "966711662",
    "source": "https://www.hpmotors.pt/",
    "observation": "A fonte pública identifica a atividade de manutenção e reparação automóvel e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de manutenção e reparação automóvel.",
    "service": "design"
  },
  {
    "company": "Centro de Dança do Porto",
    "sector": "Ensino de dança",
    "email_area": "Estúdios de Dança",
    "location": "Porto, Porto",
    "website": "https://centrodedancadoporto.com",
    "email": "geral@cdancaporto.pt",
    "phone": "228303786",
    "source": "https://centrodedancadoporto.com/Contactos-2",
    "observation": "A fonte pública identifica a atividade de ensino de dança e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de ensino de dança.",
    "service": "design"
  },
  {
    "company": "Sabor Latino",
    "sector": "Escola de dança",
    "email_area": "Estúdios de Dança",
    "location": "Porto, Porto",
    "website": "https://saborlatino.pt",
    "email": "saborlatino@saborlatino.pt",
    "phone": "226095510",
    "source": "https://saborlatino.pt/",
    "observation": "A fonte pública identifica a atividade de escola de dança e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de escola de dança.",
    "service": "design"
  },
  {
    "company": "Escola Domus Dança",
    "sector": "Ensino de dança",
    "email_area": "Estúdios de Dança",
    "location": "Porto, Porto",
    "website": "https://escoladomusdanca.org",
    "email": "edd@escoladomusdanca.org",
    "phone": "220927372",
    "source": "https://escoladomusdanca.org/",
    "observation": "A fonte pública identifica a atividade de ensino de dança e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de ensino de dança.",
    "service": "design"
  },
  {
    "company": "Casa de Onor",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Rio de Onor, Bragança",
    "website": "https://casadeonor.com",
    "email": "reservas@casadeonor.com",
    "phone": "273927163",
    "source": "https://www.cardapio.pt/turismo-rural/dir/d/braganca/c/braganca/p-20103/casa-de-onor/",
    "observation": "A fonte pública identifica a atividade de turismo rural e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Sebenta Triunfal",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Viseu, Viseu",
    "website": "https://sebentatriunfal.pt",
    "email": "geral@sebentatriunfal.pt",
    "phone": "232416155",
    "source": "https://www.sebentatriunfal.pt/contactos",
    "observation": "A fonte pública identifica a atividade de centro de estudos e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de centro de estudos.",
    "service": "design"
  },
  {
    "company": "Fisired",
    "sector": "Fisioterapia e medicina",
    "email_area": "Fisioterapia",
    "location": "Redondo, Évora",
    "website": "https://fisired.pt",
    "email": "geral@fisired.pt",
    "phone": "266999732",
    "source": "https://www.ageas.pt/media/5786/rede-ageas-2025.pdf",
    "observation": "A fonte pública identifica a atividade de fisioterapia e medicina e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de fisioterapia e medicina.",
    "service": "design"
  },
  {
    "company": "Casa de Salsas",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Salsas, Bragança",
    "website": "https://acasadesalsas.pt",
    "email": "reservas@casadesalsas.pt",
    "phone": "273968025",
    "source": "https://www.cm-terrasdebouro.pt/images/noticias/2016/11/19/Agenda_dos_Fins_de_Semana_Gastron%C3%B3micos_2016_-_2017.pdf",
    "observation": "A fonte pública identifica a atividade de turismo rural e apresenta o contacto profissional.",
    "opportunity": "Possível criação de materiais gráficos para apresentar os serviços de turismo rural.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-20).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-20:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-20:',e.message)}
