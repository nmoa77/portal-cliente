const crypto=require('crypto'),bcrypt=require('bcryptjs'),db=require('./db');
const {wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Scalconta",
    "sector": "Contabilidade e serviços empresariais",
    "location": "Santarém",
    "website": "https://www.scalconta.pt/",
    "email": "geral@scalconta.pt",
    "phone": "+351 243 325 059",
    "source": "https://www.scalconta.pt/contactos",
    "area": "ambas",
    "observation": "O website oficial apresenta serviços de contabilidade, fiscalidade e apoio a pequenas e médias empresas e publica este email e telefone de contacto.",
    "opportunity": "Apoio externo pode ajudar a transformar temas fiscais e empresariais em comunicação mais clara e regular."
  },
  {
    "company": "Filosoft",
    "sector": "Software e soluções informáticas",
    "location": "Leiria",
    "website": "https://www.filosoft.pt/",
    "email": "geral@filosoft.pt",
    "phone": "+351 244 820 820",
    "source": "https://www.filosoft.pt/contactos",
    "area": "ambas",
    "observation": "A página oficial de contactos publica o email geral, telefone e contactos comerciais, de suporte e formação.",
    "opportunity": "Há margem para apoiar materiais comerciais, apresentações e conteúdos explicativos sobre software e formação."
  },
  {
    "company": "Plasgal",
    "sector": "Produção de embalagens",
    "location": "Leiria",
    "website": "https://plasgal.pt/",
    "email": "geral@plasgal.pt",
    "phone": "+351 244 830 700",
    "source": "https://plasgal.pt/pt/contactos",
    "area": "design",
    "observation": "A página oficial identifica a PLASGAL – Produção de Embalagens, Lda., a morada em Leiria, telefone e email geral.",
    "opportunity": "Catálogos, fichas comerciais e apresentação visual de soluções de embalagem podem beneficiar de apoio gráfico externo."
  },
  {
    "company": "ILF",
    "sector": "Carpintaria e materiais de construção",
    "location": "Canhas, Ponta do Sol, Madeira",
    "website": "https://www.ilf.pt/",
    "email": "geral@ilf.pt",
    "phone": "+351 291 972 269",
    "source": "https://www.ilf.pt/contactos",
    "area": "ambas",
    "observation": "O website oficial publica contactos dos escritórios e carpintaria, loja/showroom e armazém de materiais de construção.",
    "opportunity": "Projetos de carpintaria e soluções de showroom dão matéria para peças visuais, portefólio e conteúdos regulares."
  },
  {
    "company": "Sialnor",
    "sector": "Sistemas de alumínio",
    "location": "Macedo de Cavaleiros, Bragança",
    "website": "https://www.sialnor.pt/",
    "email": "geral@sialnor.pt",
    "phone": "+351 278 420 180",
    "source": "https://www.sialnor.pt/contactos/",
    "area": "ambas",
    "observation": "A página oficial de contactos identifica instalações em Macedo de Cavaleiros e Vila Real, telefone e email geral.",
    "opportunity": "Projetos e soluções de alumínio podem ser apresentados com uma linha visual consistente para apoio comercial."
  },
  {
    "company": "Leirivolt",
    "sector": "Energia, eletricidade e fotovoltaico",
    "location": "Leiria",
    "website": "https://www.leirivolt.pt/",
    "email": "geral@leirivolt.pt",
    "phone": "+351 244 838 703",
    "source": "https://www.leirivolt.pt/contactos/",
    "area": "ambas",
    "observation": "O website oficial publica email, telefone e serviços nas áreas elétrica, quadros elétricos e fotovoltaico.",
    "opportunity": "Casos de instalação e soluções energéticas podem ser organizados em conteúdos e materiais comerciais mais fáceis de consumir."
  },
  {
    "company": "Sanireal",
    "sector": "Materiais de construção, bricolage e soluções agrícolas",
    "location": "Vila Real",
    "website": "https://sanireal.pt/",
    "email": "geral@sanireal.pt",
    "phone": "+351 259 332 445",
    "source": "https://sanireal.pt/contactos/",
    "area": "ambas",
    "observation": "A página oficial apresenta lojas em Vila Real e Alijó e publica email e contactos telefónicos.",
    "opportunity": "A variedade de produtos permite criar comunicação por categorias, campanhas sazonais e peças gráficas de apoio à loja."
  },
  {
    "company": "Visagricola",
    "sector": "Comércio agrícola",
    "location": "Viseu",
    "website": "https://www.visagricola.pt/",
    "email": "geral@visagricola.pt",
    "phone": "+351 232 410 070",
    "source": "https://www.visagricola.pt/contactos/",
    "area": "ambas",
    "observation": "O website oficial publica contactos da sede, armazéns de distribuição e loja CAMPOCHEIO em Viseu.",
    "opportunity": "Produtos, épocas agrícolas e soluções técnicas podem ser trabalhados em comunicação visual e conteúdos úteis."
  },
  {
    "company": "ViseuIN",
    "sector": "Remodelação e interiores",
    "location": "Viseu",
    "website": "https://viseuin.pt/",
    "email": "geral@viseuin.pt",
    "phone": "+351 935 532 102",
    "source": "https://viseuin.pt/contact/",
    "area": "ambas",
    "observation": "A página oficial de contactos apresenta morada em Viseu, email, telefone e convite a pedidos de orçamento.",
    "opportunity": "Projetos e transformações de espaços podem ganhar valor com apresentação de portefólio e conteúdos visuais consistentes."
  },
  {
    "company": "Ferbroca",
    "sector": "Ferragens e componentes para mobiliário e construção",
    "location": "Frielas, Loures",
    "website": "https://www.ferbroca.pt/",
    "email": "geral@ferbroca.pt",
    "phone": "+351 219 385 126",
    "source": "https://www.ferbroca.pt/contactos/",
    "area": "design",
    "observation": "O site oficial publica contactos de Loures, Cascais e Caldas da Rainha e descreve a comercialização de ferragens e componentes.",
    "opportunity": "Catálogos, campanhas de produto e materiais de ponto de venda podem beneficiar de reforço de design."
  },
  {
    "company": "Tuacar",
    "sector": "Comércio e assistência automóvel",
    "location": "Mirandela, Bragança",
    "website": "https://tuacar.pt/",
    "email": "geral@tuacar.pt",
    "phone": "+351 278 265 222",
    "source": "https://tuacar.pt/contactos/",
    "area": "ambas",
    "observation": "A página oficial publica contactos gerais, comerciais, oficina, peças e combustíveis na unidade de Mirandela.",
    "opportunity": "Serviços de oficina, viaturas e pós-venda permitem criar peças comerciais e comunicação segmentada por serviço."
  },
  {
    "company": "Abrantimetal",
    "sector": "Perfis e acessórios de alumínio",
    "location": "Abrantes, Santarém",
    "website": "https://www.abrantimetal.pt/",
    "email": "geral@abrantimetal.pt",
    "phone": "+351 241 890 320",
    "source": "https://www.abrantimetal.pt/contactos.php",
    "area": "design",
    "observation": "O website oficial publica contactos da empresa em Abrantes e apresenta perfis de alumínio e acessórios.",
    "opportunity": "Uma apresentação gráfica consistente de gamas, soluções e aplicações pode apoiar o trabalho comercial."
  },
  {
    "company": "NAP Conta",
    "sector": "Contabilidade e fiscalidade",
    "location": "Torres Vedras, Lisboa",
    "website": "https://napconta.com/",
    "email": "geral@napconta.com",
    "phone": "+351 261 332 735",
    "source": "https://napconta.com/contactos/",
    "area": "ambas",
    "observation": "O site oficial apresenta serviços de contabilidade, fiscalidade, recursos humanos e criação de empresas, com contactos públicos.",
    "opportunity": "Conteúdos informativos e peças de serviço podem tornar temas contabilísticos mais simples e reforçar a presença comercial."
  },
  {
    "company": "Visurb",
    "sector": "Engenharia, construção e reabilitação",
    "location": "Viseu",
    "website": "https://visurb.pt/",
    "email": "geral@visurb.pt",
    "phone": "+351 968 339 226",
    "source": "https://visurb.pt/pt/contactos",
    "area": "ambas",
    "observation": "A página oficial identifica morada em Viseu, telefone, email e atuação em engenharia, construção, reabilitação e remodelação.",
    "opportunity": "Obras, reabilitações e soluções técnicas podem ser organizadas em portefólio e conteúdos de apoio à captação comercial."
  },
  {
    "company": "MD Klinic",
    "sector": "Saúde e serviços clínicos",
    "location": "Funchal, Madeira",
    "website": "https://mdklinic.com/",
    "email": "geral@mdklinic.com",
    "phone": "+351 917 757 072",
    "source": "https://mdklinic.com/contatos/",
    "area": "ambas",
    "observation": "A página oficial publica contactos e moradas das unidades do Funchal e Machico.",
    "opportunity": "Serviços e informação ao paciente podem beneficiar de materiais visuais claros e comunicação digital organizada."
  },
  {
    "company": "Giving Care",
    "sector": "Apoio domiciliário e cuidados",
    "location": "Angra do Heroísmo, Açores",
    "website": "https://givingcare.pt/",
    "email": "geral@givingcare.pt",
    "phone": "+351 295 217 694",
    "source": "https://givingcare.pt/",
    "area": "ambas",
    "observation": "O website oficial apresenta a empresa de apoio domiciliário, morada em Angra do Heroísmo, telefone e email.",
    "opportunity": "Serviços de apoio domiciliário podem ser explicados com materiais claros, próximos e consistentes para famílias e cuidadores."
  },
  {
    "company": "Analizza",
    "sector": "Consultoria empresarial e contabilidade",
    "location": "Évora",
    "website": "https://analizza.pt/",
    "email": "geral@analizza.pt",
    "phone": "+351 936 392 209",
    "source": "https://analizza.pt/contactos/",
    "area": "ambas",
    "observation": "O site oficial apresenta escritórios em Évora e Elvas e serviços de consultoria, contabilidade, fundos e acompanhamento financeiro.",
    "opportunity": "Serviços complexos podem ser traduzidos em peças comerciais e conteúdos mais simples para empresários."
  },
  {
    "company": "Permanente Caprice",
    "sector": "Construção civil e remodelação",
    "location": "Machico, Madeira",
    "website": "https://www.pconstrucoes.pt/",
    "email": "geral@pconstrucoes.pt",
    "phone": "+351 968 016 710",
    "source": "https://www.pconstrucoes.pt/",
    "area": "ambas",
    "observation": "O website oficial apresenta serviços de construção civil, remodelação, instalações e projetos, com contacto em Machico.",
    "opportunity": "Projetos, fases de obra e remodelações fornecem base para portefólio visual e conteúdos comerciais."
  },
  {
    "company": "DLB Auto",
    "sector": "Reparação e comércio automóvel",
    "location": "Elvas, Portalegre",
    "website": "https://www.dlbauto.pt/",
    "email": "geral@dlbauto.pt",
    "phone": "+351 268 622 538",
    "source": "https://www.dlbauto.pt/contactos/",
    "area": "ambas",
    "observation": "A página oficial de contactos identifica a DLB - Auto Reparação e Comércio Automóvel Lda em Elvas, com email e telefone.",
    "opportunity": "Serviços de oficina e soluções automóveis podem ser comunicados com campanhas locais e peças visuais de serviço."
  },
  {
    "company": "2RB",
    "sector": "Contabilidade e serviços empresariais",
    "location": "Elvas, Portalegre",
    "website": "https://www.2rb.pt/",
    "email": "geral@2rb.pt",
    "phone": "+351 268 622 182",
    "source": "https://www.2rb.pt/contactos/",
    "area": "ambas",
    "observation": "O site oficial identifica o gabinete de contabilidade em Elvas e publica email e telefone.",
    "opportunity": "Informação fiscal e serviços do gabinete podem ser apresentados em conteúdos simples e materiais de apoio comercial."
  },
  {
    "company": "Servifune",
    "sector": "Serviços funerários",
    "location": "Angra do Heroísmo, Açores",
    "website": "https://servifune.pt/",
    "email": "geral@servifune.pt",
    "phone": "+351 295 215 242",
    "source": "https://servifune.pt/contactos/",
    "area": "design",
    "observation": "A página oficial publica morada, telefone, email e atendimento permanente em Angra do Heroísmo.",
    "opportunity": "Materiais institucionais claros e discretos podem ajudar a apresentar serviços e informação prática com consistência."
  },
  {
    "company": "Clínica da Sé",
    "sector": "Saúde oral e medicina dentária",
    "location": "Angra do Heroísmo, Açores",
    "website": "https://www.clinica-se.com/",
    "email": "geral@clinica-se.com",
    "phone": "+351 295 206 050",
    "source": "https://www.clinica-se.com/contactos/",
    "area": "ambas",
    "observation": "A página oficial publica contactos da clínica em Angra do Heroísmo e lista várias especialidades de saúde oral.",
    "opportunity": "Especialidades e informação preventiva podem ser organizadas em peças visuais e conteúdos digitais claros."
  },
  {
    "company": "JRCO - Engenharia e Construção",
    "sector": "Engenharia e construção civil",
    "location": "Portimão, Faro",
    "website": "https://www.jrco.pt/",
    "email": "geral@jrco.pt",
    "phone": "+351 282 431 266",
    "source": "https://www.jrco.pt/",
    "area": "ambas",
    "observation": "O website oficial apresenta construção civil, obras públicas e privadas, projetos recentes e contactos em Portimão.",
    "opportunity": "Portefólio de obras e soluções técnicas podem ganhar consistência gráfica e maior aproveitamento comercial em canais digitais."
  },
  {
    "company": "Pastelaria Elvas",
    "sector": "Produção de pastelaria para revenda",
    "location": "Aldeia de Paio Pires, Seixal",
    "website": "https://pastelariaelvas.pt/",
    "email": "geral@pastelariaelvas.pt",
    "phone": "+351 212 241 810",
    "source": "https://pastelariaelvas.pt/quem-somos/",
    "area": "ambas",
    "observation": "O website oficial apresenta a fábrica, produção para revenda, morada, email e telefone.",
    "opportunity": "Produtos, encomendas e comunicação B2B podem ser reforçados com peças gráficas, catálogos e conteúdos de produto."
  },
  {
    "company": "Exaclean",
    "sector": "Higiene e limpeza profissional",
    "location": "Alcanede, Santarém",
    "website": "https://www.exaclean.pt/",
    "email": "geral@exaclean.pt",
    "phone": "+351 243 409 050",
    "source": "https://www.exaclean.pt/pt/contactos_40.html",
    "area": "design",
    "observation": "A página oficial publica contactos da sede em Santarém e filiais em várias regiões, incluindo email e telefone.",
    "opportunity": "Gamas de higiene e limpeza podem beneficiar de materiais comerciais, fichas de produto e campanhas visuais por setor."
  },
  {
    "company": "Atlantis Seguros",
    "sector": "Mediação de seguros",
    "location": "Angra do Heroísmo, Açores",
    "website": "https://atlantisseguros.pt/",
    "email": "geral@atlantisseguros.pt",
    "phone": "+351 295 705 970",
    "source": "https://atlantisseguros.pt/contactos/",
    "area": "ambas",
    "observation": "A página oficial publica morada em Angra do Heroísmo, telefone e email geral.",
    "opportunity": "Produtos e coberturas podem ser explicados com conteúdos simples e peças gráficas orientadas a diferentes perfis de cliente."
  },
  {
    "company": "Construserv",
    "sector": "Construção, engenharia e instalações",
    "location": "Elvas, Portalegre",
    "website": "https://construserv.pt/",
    "email": "geral@construserv.pt",
    "phone": "+351 268 689 277",
    "source": "https://construserv.pt/",
    "area": "ambas",
    "observation": "O website oficial apresenta construção civil, engenharia, arquitetura, energia renovável, fiscalização e contactos em Elvas.",
    "opportunity": "As várias áreas técnicas podem ser organizadas numa comunicação mais clara, com portefólio, serviços e materiais comerciais."
  },
  {
    "company": "WinDoor Porto",
    "sector": "Janelas e caixilharia em PVC",
    "location": "Maia, Porto",
    "website": "https://www.windoorporto.pt/",
    "email": "geral@windoorporto.pt",
    "phone": "+351 934 316 283",
    "source": "https://www.windoorporto.pt/contactos/",
    "area": "ambas",
    "observation": "A página oficial publica contacto da WinDoor Porto, morada na Maia e informação sobre fabrico e comercialização de janelas em PVC.",
    "opportunity": "Projetos, soluções e comparações de produto podem ser trabalhados em peças visuais para apoio comercial e redes."
  },
  {
    "company": "Bakaus Portugal",
    "sector": "Comércio de equipamentos eletrónicos e telecomunicações",
    "location": "Mem Martins, Sintra",
    "website": "https://bakaus-portugal.com/",
    "email": "geral@bakaus-portugal.com",
    "phone": "+351 210 992 119",
    "source": "https://bakaus-portugal.com/contactos/",
    "area": "design",
    "observation": "A página oficial publica morada em Mem Martins, email e telefone; fonte empresarial credível identifica atividade em equipamentos eletrónicos e telecomunicações.",
    "opportunity": "Produtos e soluções técnicas podem beneficiar de materiais comerciais, apresentações e comunicação gráfica consistente."
  },
  {
    "company": "Pavimir",
    "sector": "Materiais e execução de obras",
    "location": "Carvalhais, Mirandela",
    "website": "https://www.pavimir.pt/",
    "email": "geral@pavimir.pt",
    "phone": "+351 278 257 380",
    "source": "https://www.pavimir.pt/contactos",
    "area": "ambas",
    "observation": "O website oficial identifica a PAVIMIR - Belmiro & Barreira Lda, sede/fábrica em Carvalhais, Mirandela, com email e telefone; a página institucional refere produtos comercializados e obras efetuadas.",
    "opportunity": "Produtos e obras executadas podem ser organizados em portefólio, materiais comerciais e conteúdos visuais."
  }
];
try{
for(const [col,type] of [['email_observation','TEXT'],['instagram','TEXT'],['outreach_channel','TEXT'],['dm_message','TEXT'],['dm_status','TEXT'],['instagram_checked_at','TEXT'],['instagram_source','TEXT']]){
  try{db.prepare(`ALTER TABLE prospect_crm ADD COLUMN ${col} ${type}`).run()}catch(e){if(!/duplicate column/i.test(e.message))throw e}
}
const blocked=new Set(['gmail.com','hotmail.com','outlook.com','yahoo.com','icloud.com','sapo.pt','live.com']);
const byCompany=db.prepare("SELECT id FROM users WHERE is_prospect=1 AND lower(trim(company))=lower(trim(?))");
const byEmail=db.prepare("SELECT id FROM users WHERE lower(trim(email))=lower(trim(?))");
const byWebsite=db.prepare("SELECT user_id FROM prospect_crm WHERE lower(trim(coalesce(website,'')))=lower(trim(?))");
const byIg=db.prepare("SELECT user_id FROM prospect_crm WHERE lower(trim(coalesce(instagram,'')))=lower(trim(?))");
const addUser=db.prepare("INSERT INTO users(name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES(?,?,?,?,?,?,1,0)");
const addCrm=db.prepare("INSERT INTO prospect_crm(user_id,sector,location,website,instagram,opportunity,idea,email_observation,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,outreach_channel,dm_message,dm_status,instagram_checked_at,instagram_source,updated_at) VALUES(?,?,?,?,?,?,?,?,'intermedio',?,200,100,'por_contactar','atacar',?,?,'email','','',NULL,NULL,datetime('now'))");
const h=bcrypt.hashSync(crypto.randomBytes(24).toString('hex'),10);
let added=0,duplicates=0,rejected=0;
db.transaction(()=>{for(const x of L){
  const email=x.email.trim().toLowerCase(),domain=(email.split('@')[1]||'').toLowerCase(),host=new URL(x.website).hostname.toLowerCase().replace(/^www\./,'');
  if(!domain||blocked.has(domain)||domain!==host||wasDeleted(email)){rejected++;continue}
  if(byCompany.get(x.company)||byEmail.get(email)||byWebsite.get(x.website)||(x.instagram&&byIg.get(x.instagram))){duplicates++;continue}
  const id=Number(addUser.run(x.company,email,h,'client',x.company,x.phone).lastInsertRowid);
  const emailObs=`Email profissional público confirmado em fonte oficial: ${x.source}. Domínio do email validado contra o website oficial.`;
  const idea=`Área DUIT sugerida: ${x.area}.`;
  const solution=x.area==='design'?'Design gráfico para materiais comerciais, campanhas, apresentações e peças digitais conforme as necessidades do negócio.':x.area==='redes'?'Planeamento, design e publicação de conteúdos para redes sociais, com contacto sempre manual.':'Apoio combinado em design gráfico e gestão de redes sociais, ajustado aos materiais e canais que a empresa realmente utiliza.';
  const notes=`${x.observation} Fonte: ${x.source}. Não foi enviado qualquer contacto automático.`;
  const proposal=x.area==='design'
    ? `Olá, sou o Nuno, da DUIT. Estive a conhecer a ${x.company} e acredito que posso ajudar com design gráfico para materiais comerciais e comunicação visual. Se lhe fizer sentido, posso mostrar-lhe como trabalho.`
    : x.area==='redes'
    ? `Olá, sou o Nuno, da DUIT. Estive a conhecer a ${x.company} e posso ajudar a preparar e gerir conteúdos para as redes sociais, caso seja uma área que queira reforçar. Se lhe fizer sentido, estou disponível.`
    : `Olá, sou o Nuno, da DUIT. Estive a conhecer a ${x.company} e posso ajudar tanto na parte de design gráfico como na gestão de redes sociais, de acordo com o que fizer mais sentido para si. Se quiser, posso explicar-lhe como trabalho.`;
  addCrm.run(id,x.sector,x.location,x.website,'',x.opportunity,idea,emailObs,solution,notes,proposal);added++;
}})();
console.log(`[crm] prospeção nacional 2026-10-13-d: ${added} adicionados, ${duplicates} duplicados, ${rejected} rejeitados`);
}catch(e){console.warn('[crm] seed 2026-10-13-d:',e.message)}
