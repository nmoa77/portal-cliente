const crypto=require('crypto'),bcrypt=require('bcryptjs'),db=require('./db');
const {wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Leober",
    "sector": "Carpintaria",
    "location": "Darque, Viana do Castelo",
    "website": "https://leober.pt/",
    "email": "geral@leober.pt",
    "phone": "+351 258 838 242",
    "source": "https://leober.pt/contact/",
    "observation": "Contacto profissional e atividade apresentados na fonte oficial indicada.",
    "opportunity": "Apresentar soluções de carpintaria e projetos por medida.",
    "service": "design"
  },
  {
    "company": "Carpintaria Parente",
    "sector": "Carpintaria e mobiliário",
    "location": "Santa Marta de Portuzelo, Viana do Castelo",
    "website": "https://carpintariaparente.com/",
    "email": "geral@carpintariaparente.com",
    "phone": "+351 258 830 484",
    "source": "https://carpintariaparente.com/",
    "observation": "Contacto profissional e atividade apresentados na fonte oficial indicada.",
    "opportunity": "Valorizar o portfólio de acabamentos interiores em suportes comerciais.",
    "service": "design"
  },
  {
    "company": "TurAventur",
    "sector": "Animação turística",
    "location": "Évora, Évora",
    "website": "https://turaventur.com/",
    "email": "turaventur@turaventur.com",
    "phone": "+351 266 743 134",
    "source": "https://turaventur.com/contactos/",
    "observation": "Contacto profissional e atividade apresentados na fonte oficial indicada.",
    "opportunity": "Comunicar experiências de turismo de natureza com peças digitais e campanhas.",
    "service": "ambas"
  },
  {
    "company": "Évora Tourism Tours",
    "sector": "Tours e turismo",
    "location": "Évora, Évora",
    "website": "https://www.evoratourismtours.com/",
    "email": "info@evoratourismtours.com",
    "phone": "+351 963 918 181",
    "source": "https://www.evoratourismtours.com/contacto/",
    "observation": "Contacto profissional e atividade apresentados na fonte oficial indicada.",
    "opportunity": "Promover roteiros e experiências com materiais digitais específicos.",
    "service": "ambas"
  },
  {
    "company": "100% Auto",
    "sector": "Oficina automóvel",
    "location": "Faro, Faro",
    "website": "https://100porcentoauto.pt/",
    "email": "info@100porcentoauto.pt",
    "phone": "+351 289 149 353",
    "source": "https://100porcentoauto.pt/contactos",
    "observation": "Contacto profissional e atividade apresentados na fonte oficial indicada.",
    "opportunity": "Criar materiais gráficos claros para comunicar serviços de manutenção.",
    "service": "design"
  },
  {
    "company": "Auto FR Performance",
    "sector": "Oficina automóvel e diagnóstico",
    "location": "Faro, Faro",
    "website": "https://www.autofr.pt/",
    "email": "geral@autofr.pt",
    "phone": "+351 289 882 237",
    "source": "https://www.autofr.pt/pt/contacts/",
    "observation": "Contacto profissional e atividade apresentados na fonte oficial indicada.",
    "opportunity": "Apresentar serviços especializados de diagnóstico em comunicação comercial.",
    "service": "design"
  },
  {
    "company": "JAuto",
    "sector": "Eletrónica e diagnóstico automóvel",
    "location": "Faro, Faro",
    "website": "https://www.jauto.pt/",
    "email": "geral@jauto.pt",
    "phone": "+351 925 766 027",
    "source": "https://www.jauto.pt/",
    "observation": "Contacto profissional e atividade apresentados na fonte oficial indicada.",
    "opportunity": "Criar comunicação de serviços técnicos para públicos automóveis.",
    "service": "design"
  },
  {
    "company": "Plantalegre",
    "sector": "Viveiros e espaços verdes",
    "location": "Portalegre, Portalegre",
    "website": "https://plantalegre.pt/",
    "email": "geral@plantalegre.pt",
    "phone": "+351 245 337 529",
    "source": "https://plantalegre.pt/contactos/",
    "observation": "Contacto profissional e atividade apresentados na fonte oficial indicada.",
    "opportunity": "Mostrar serviços de jardinagem, rega e produção de plantas em catálogo visual.",
    "service": "ambas"
  },
  {
    "company": "Tapada do Chaves",
    "sector": "Produção agrícola e vinhos",
    "location": "Portalegre, Portalegre",
    "website": "https://www.tapadadochaves.pt/",
    "email": "geral@tapadadochaves.pt",
    "phone": "+351 245 201 973",
    "source": "https://www.tapadadochaves.pt/politicas/",
    "observation": "Contacto profissional e atividade apresentados na fonte oficial indicada.",
    "opportunity": "Desenvolver materiais de comunicação para produtos e experiências da propriedade.",
    "service": "design"
  },
  {
    "company": "Decomat",
    "sector": "Revestimentos e materiais de construção",
    "location": "Bragança, Bragança",
    "website": "https://www.decomat.pt/",
    "email": "geral@decomat.pt",
    "phone": "+351 273 333 849",
    "source": "https://www.decomat.pt/",
    "observation": "Contacto profissional e atividade apresentados na fonte oficial indicada.",
    "opportunity": "Apresentar coleções e projetos de interiores em materiais de venda.",
    "service": "design"
  },
  {
    "company": "Spot Tours",
    "sector": "Tours e transfers",
    "location": "Angra do Heroísmo, Açores",
    "website": "https://spottours.pt/",
    "email": "geral@spottours.pt",
    "phone": "+351 964 242 969",
    "source": "https://spottours.pt/",
    "observation": "Contacto profissional e atividade apresentados na fonte oficial indicada.",
    "opportunity": "Promover experiências e transfers com conteúdos turísticos específicos.",
    "service": "ambas"
  },
  {
    "company": "Angra 2000",
    "sector": "Agência de viagens",
    "location": "Angra do Heroísmo, Açores",
    "website": "https://angra2000.com/",
    "email": "geral@angra2000.com",
    "phone": "+351 295 215 553",
    "source": "https://angra2000.com/contactos/",
    "observation": "Contacto profissional e atividade apresentados na fonte oficial indicada.",
    "opportunity": "Criar peças para divulgação de destinos e pacotes turísticos.",
    "service": "ambas"
  },
  {
    "company": "Trilhos da Natureza",
    "sector": "Animação turística",
    "location": "Açores",
    "website": "https://trilhosdanatureza.com/",
    "email": "info@trilhosdanatureza.com",
    "phone": "+351 919 020 506",
    "source": "https://trilhosdanatureza.com/tours/",
    "observation": "Contacto profissional e atividade apresentados na fonte oficial indicada.",
    "opportunity": "Comunicar atividades terrestres e marítimas com materiais de promoção.",
    "service": "ambas"
  },
  {
    "company": "Armintalurgica",
    "sector": "Serralharia civil",
    "location": "Santa Catarina da Serra, Leiria",
    "website": "https://armintalurgica.com/",
    "email": "geral@armintalurgica.com",
    "phone": "+351 244 744 816",
    "source": "https://armintalurgica.com/",
    "observation": "Contacto profissional e atividade apresentados na fonte oficial indicada.",
    "opportunity": "Organizar um portfólio comercial de estruturas e serviços por medida.",
    "service": "design"
  },
  {
    "company": "Weldart",
    "sector": "Soldadura e serralharia",
    "location": "Monte Real, Leiria",
    "website": "https://weldart.pt/",
    "email": "geral@weldart.pt",
    "phone": "+351 910 916 189",
    "source": "https://weldart.pt/",
    "observation": "Contacto profissional e atividade apresentados na fonte oficial indicada.",
    "opportunity": "Criar materiais de apresentação de projetos industriais e serviços.",
    "service": "design"
  },
  {
    "company": "Maiaperfil",
    "sector": "Construções metálicas",
    "location": "Loureira, Leiria",
    "website": "https://maiaperfil.pt/",
    "email": "geral@maiaperfil.pt",
    "phone": "+351 244 741 334",
    "source": "https://maiaperfil.pt/",
    "observation": "Contacto profissional e atividade apresentados na fonte oficial indicada.",
    "opportunity": "Valorizar projetos metálicos com apresentações para clientes empresariais.",
    "service": "design"
  },
  {
    "company": "Dapaferro",
    "sector": "Serralharia civil",
    "location": "Ortigosa, Leiria",
    "website": "https://www.dapaferro.com/",
    "email": "comercial@dapaferro.com",
    "phone": "+351 244 613 119",
    "source": "https://www.dapaferro.com/",
    "observation": "Contacto profissional e atividade apresentados na fonte oficial indicada.",
    "opportunity": "Produzir peças comerciais a partir do portfólio de gradeamentos e escadas.",
    "service": "design"
  }
];
try {
for(const [col,type] of [['email_observation','TEXT'],['instagram','TEXT'],['outreach_channel','TEXT'],['dm_message','TEXT'],['dm_status','TEXT']]) {try{db.prepare('ALTER TABLE prospect_crm ADD COLUMN '+col+' '+type).run()}catch(e){if(!/duplicate column/i.test(e.message))throw e}}
const companyExists=db.prepare('SELECT id FROM users WHERE is_prospect=1 AND lower(trim(company))=lower(trim(?))');
const emailExists=db.prepare('SELECT id FROM users WHERE lower(trim(email))=lower(trim(?))');
const siteExists=db.prepare("SELECT user_id FROM prospect_crm WHERE lower(trim(coalesce(website,'')))=lower(trim(?))");
const addUser=db.prepare('INSERT INTO users(name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES(?,?,?,?,?,?,1,0)');
const addCrm=db.prepare("INSERT INTO prospect_crm(user_id,sector,location,website,opportunity,idea,email_observation,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,outreach_channel,updated_at) VALUES(?,?,?,?,?,?,?,'intermedio',?,200,100,'por_contactar','normal',?,?,'email',datetime('now'))");
const hash=bcrypt.hashSync(crypto.randomBytes(24).toString('hex'),10);
let added=0,skipped=0;const seen=new Set();
db.transaction(()=>{for(const x of L){const email=x.email.trim().toLowerCase();const domain=email.split('@')[1];const host=new URL(x.website).hostname.toLowerCase().replace(/^www\./,'');const key=x.company.trim().toLowerCase();if(!domain||domain!==host||wasDeleted(email)||seen.has(email)||seen.has(key)||companyExists.get(x.company)||emailExists.get(email)||siteExists.get(x.website)){skipped++;continue}seen.add(email);seen.add(key);const id=Number(addUser.run(x.company,email,hash,'client',x.company,x.phone).lastInsertRowid);const proposal='Olá, sou o Nuno, da DUIT. Estive a conhecer a '+x.company+'. Posso ajudar com '+(x.service==='design'?'design gráfico e materiais comerciais':x.service==='redes'?'gestão de redes sociais':'design gráfico e comunicação nas redes sociais')+'. Se lhe fizer sentido, terei gosto em conversar consigo. Cumprimentos, Nuno.';addCrm.run(id,x.sector,x.location,x.website,x.opportunity,x.service,x.source+' — contacto profissional publicado na fonte oficial.',x.opportunity,x.observation+' Serviço sugerido: '+x.service+'. Fonte: '+x.source,proposal);added++}})();console.log('[crm] 2026-10-16:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-10-16:',e.message)}
