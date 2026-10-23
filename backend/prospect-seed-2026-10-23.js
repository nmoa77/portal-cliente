const crypto=require('crypto');
const bcrypt=require('bcryptjs');
const db=require('./db');
const {wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Dare You Travel",
    "sector": "Agência de viagens personalizadas",
    "location": "Funchal, Madeira",
    "website": "https://dareyoutravel.com/",
    "email": "info@dareyoutravel.com",
    "phone": "+351 924 028 544",
    "source": "https://dareyoutravel.com/",
    "observation": "Agência digital de viagens à medida sediada no Funchal.",
    "opportunity": "Apresentar roteiros e destinos com conteúdos visuais.",
    "service": "ambas"
  },
  {
    "company": "Madeira Wonder Hikes",
    "sector": "Turismo de natureza e caminhadas",
    "location": "Ponta do Sol, Madeira",
    "website": "https://www.madeirawonderhikes.com/",
    "email": "geral@madeirawonderhikes.com",
    "phone": "+351 964 492 963",
    "source": "https://www.visitportugal.com/pt-pt/content/madeira-wonder-hikes-lda",
    "observation": "Operador de caminhadas e percursos alternativos na Madeira.",
    "opportunity": "Comunicar experiências de caminhada em peças digitais.",
    "service": "ambas"
  },
  {
    "company": "Travel Biz",
    "sector": "Agência de viagens",
    "location": "Leiria, Leiria",
    "website": "http://www.travel-biz.pt",
    "email": "geral@travel-biz.pt",
    "phone": "+351 244 850 436",
    "source": "https://www.visitportugal.com/pt-pt/content/travel-biz-lda",
    "observation": "Agência com viagens empresariais, lazer e incoming.",
    "opportunity": "Apresentar ofertas específicas para viagens de lazer e empresas.",
    "service": "ambas"
  },
  {
    "company": "Cheer Up Viagens",
    "sector": "Agência de viagens",
    "location": "Leiria, Leiria",
    "website": "http://www.cheerupviagens.com/pt/cheer-up/",
    "email": "reservas@cheerupviagens.com",
    "phone": "+351 244 825 004",
    "source": "https://www.visitportugal.com/pt-pt/content/cheer-viagens-e-turismo-lda",
    "observation": "Agência de viagens registada em Leiria.",
    "opportunity": "Criar peças de apresentação de destinos e serviços.",
    "service": "design"
  },
  {
    "company": "Capitaltur",
    "sector": "Agência de viagens",
    "location": "Leiria, Leiria",
    "website": "http://www.capitaltur.pt",
    "email": "geral@capitaltur.pt",
    "phone": "+351 244 830 810",
    "source": "https://www.visitportugal.com/pt-pt/content/capitaltur-viagens-e-turismo",
    "observation": "Agência com programas turísticos próprios e experiência no setor.",
    "opportunity": "Comunicar programas de viagem em suportes gráficos.",
    "service": "design"
  },
  {
    "company": "FRG Travel",
    "sector": "Agência de viagens",
    "location": "Leiria, Leiria",
    "website": "http://www.frgtravel.pt",
    "email": "geral@frgtravel.pt",
    "phone": "+351 244 829 560",
    "source": "https://www.visitportugal.com/pt-pt/content/frg-travel",
    "observation": "Agência de viagens com contactos profissionais em diretório oficial.",
    "opportunity": "Desenvolver materiais visuais para destinos e campanhas.",
    "service": "ambas"
  },
  {
    "company": "Grosso Rent",
    "sector": "Aluguer de automóveis",
    "location": "Leiria, Leiria",
    "website": "http://www.grossorent.com/",
    "email": "reservas@grossorent.com",
    "phone": "+351 244 812 309",
    "source": "https://www.visitportugal.com/pt-pt/node/439159",
    "observation": "Empresa de aluguer de automóveis identificada em Leiria.",
    "opportunity": "Criar peças gráficas de apresentação de serviços.",
    "service": "design"
  },
  {
    "company": "Land of Alandroal",
    "sector": "Alojamento turístico",
    "location": "Alandroal, Évora",
    "website": "https://landofalandroal.pt/",
    "email": "andre.carvalho@landofalandroal.pt",
    "phone": "+351 918 644 917",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=35&f%5B0%5D=sm_field_al1_classificacao%3A4E&page=141&visitas=1",
    "observation": "Alojamento turístico identificado no diretório Visit Portugal.",
    "opportunity": "Apresentar experiências de estadia em peças digitais.",
    "service": "ambas"
  },
  {
    "company": "AL-TAURUS",
    "sector": "Animação turística equestre",
    "location": "Ribatejo, Santarém",
    "website": "http://www.al-taurus.com",
    "email": "safari@al-taurus.com",
    "phone": "+351 914 079 570",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=35&f%5B0%5D=bm_field_ma_turismo_equestre%3Atrue",
    "observation": "Operador de rotas temáticas e turismo de natureza no estuário do Tejo.",
    "opportunity": "Comunicar roteiros e experiências temáticas.",
    "service": "ambas"
  },
  {
    "company": "Backcountry Tours",
    "sector": "Turismo de natureza",
    "location": "Alentejo",
    "website": "http://www.backcountry-tours.pt",
    "email": "info@backcountry-tours.pt",
    "phone": "+351 266 094 4283",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=35&f%5B0%5D=bm_field_ma_turismo_equestre%3Atrue",
    "observation": "Operador de turismo alternativo no Alentejo.",
    "opportunity": "Criar materiais visuais de roteiros e experiências.",
    "service": "ambas"
  },
  {
    "company": "Multitour Trip",
    "sector": "Animação turística",
    "location": "Alentejo",
    "website": "http://www.multitour.pt",
    "email": "geral@multitour.pt",
    "phone": "+351 914 794 000",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=35&f%5B0%5D=bm_field_ma_outras_atividades%3Atrue&f%5B1%5D=bm_field_ma_enoturismo_e_gastron%3Atrue&f%5B2%5D=im_field_poi_tipo%3A562&visitas=1",
    "observation": "Operador de passeios privados no Alentejo.",
    "opportunity": "Desenvolver comunicação visual para experiências e passeios.",
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
console.log('[crm] seed 2026-10-23:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-10-23:',e.message)}
