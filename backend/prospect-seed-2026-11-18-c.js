// DUIT — Portugal continental, 2026-11-18-c. Contactos públicos consultados em páginas oficiais e diretórios.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "TopoDuarte",
    "sector": "Topografia e construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Santarém, Santarém",
    "website": "https://topoduarte.pt",
    "email": "geral@topoduarte.pt",
    "phone": "243306115",
    "source": "https://www.topoduarte.pt/contacto/",
    "observation": "Atividade de topografia e construção civil e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de topografia e construção civil.",
    "service": "design"
  },
  {
    "company": "Scalabis Obras",
    "sector": "Remodelações e manutenção",
    "email_area": "Construção & Engenharia",
    "location": "Santarém, Santarém",
    "website": "https://scalabisobras.pt",
    "email": "geral@scalabisobras.pt",
    "phone": "914379184",
    "source": "https://scalabisobras.pt/contactos/",
    "observation": "Atividade de remodelações e manutenção e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de remodelações e manutenção.",
    "service": "design"
  },
  {
    "company": "Abrancop",
    "sector": "Construção e remodelações",
    "email_area": "Construção & Engenharia",
    "location": "Tramagal, Santarém",
    "website": "https://abrancop.pt",
    "email": "geral@abrancop.pt",
    "phone": "241897030",
    "source": "https://compronoribatejo.pt/empresa/abrancop-lda",
    "observation": "Atividade de construção e remodelações e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de construção e remodelações.",
    "service": "design"
  },
  {
    "company": "O Mundo do Saber",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Ferreiros, Braga",
    "website": "https://omundodosaber.pt",
    "email": "geral@omundodosaber.pt",
    "phone": "918153980",
    "source": "https://www.fundosocial-braga.pt/protocolos/protocolos/educacao/",
    "observation": "Atividade de centro de estudos e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de centro de estudos.",
    "service": "design"
  },
  {
    "company": "Abrangreen",
    "sector": "Instalações técnicas e manutenção",
    "email_area": "Construção & Engenharia",
    "location": "Alferrarede, Santarém",
    "website": "https://abrangreen.pt",
    "email": "geral@abrangreen.pt",
    "phone": "241404635",
    "source": "https://compronoribatejo.pt/empresa/abrangreen-instalacoes-tecnicas-unipessoal-lda",
    "observation": "Atividade de instalações técnicas e manutenção e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de instalações técnicas e manutenção.",
    "service": "design"
  },
  {
    "company": "EHN Civil",
    "sector": "Engenharia e construção",
    "email_area": "Construção & Engenharia",
    "location": "Carregueiros, Santarém",
    "website": "https://ehn.pt",
    "email": "geral@ehn.pt",
    "phone": "914317096",
    "source": "https://compronoribatejo.pt/empresa/ehn-civil-engenharia-e-construcao",
    "observation": "Atividade de engenharia e construção e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de engenharia e construção.",
    "service": "design"
  },
  {
    "company": "Construtora Civil de Casal dos Bernardos",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Casal dos Bernardos, Santarém",
    "website": "https://cccb.pt",
    "email": "geral@cccb.pt",
    "phone": "236931441",
    "source": "https://compronoribatejo.pt/empresa/construtora-civil-de-casal-dos-bernardos-lda",
    "observation": "Atividade de construção civil e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de construção civil.",
    "service": "design"
  },
  {
    "company": "HACL Sociedade de Construções",
    "sector": "Construção e reabilitação",
    "email_area": "Construção & Engenharia",
    "location": "Parreira, Santarém",
    "website": "https://hacl.pt",
    "email": "info@hacl.pt",
    "phone": "243333202",
    "source": "https://compronoribatejo.pt/empresa/hacl-sociedade-de-construcoes-lda",
    "observation": "Atividade de construção e reabilitação e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de construção e reabilitação.",
    "service": "design"
  },
  {
    "company": "EXPAL",
    "sector": "Caixilharia de alumínio",
    "email_area": "Indústria & Produção",
    "location": "Torres Novas, Santarém",
    "website": "https://expal.pt",
    "email": "expal@expal.pt",
    "phone": "249819000",
    "source": "https://compronoribatejo.pt/empresa/expal-lda",
    "observation": "Atividade de caixilharia de alumínio e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de caixilharia de alumínio.",
    "service": "design"
  },
  {
    "company": "Grupo Medisigma",
    "sector": "Saúde e segurança no trabalho",
    "email_area": "Serviços Profissionais",
    "location": "Abrantes, Santarém",
    "website": "https://medisigma.pt",
    "email": "info@medisigma.pt",
    "phone": "241331504",
    "source": "https://compronoribatejo.pt/empresa/grupo-medisigma-lda",
    "observation": "Atividade de saúde e segurança no trabalho e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de saúde e segurança no trabalho.",
    "service": "design"
  },
  {
    "company": "Caminhos da História",
    "sector": "Turismo cultural",
    "email_area": "Turismo & Alojamento",
    "location": "Tomar, Santarém",
    "website": "https://caminhosdahistoria.com",
    "email": "geral@caminhosdahistoria.com",
    "phone": "249145026",
    "source": "https://compronoribatejo.pt/empresa/caminhos-da-historia",
    "observation": "Atividade de turismo cultural e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de turismo cultural.",
    "service": "design"
  },
  {
    "company": "AM Auto Santarém",
    "sector": "Automóveis",
    "email_area": "Automóvel",
    "location": "Santarém, Santarém",
    "website": "https://amautosantarem.pt",
    "email": "geral@amautosantarem.pt",
    "phone": "911866584",
    "source": "https://www.amautosantarem.pt/contactos",
    "observation": "Atividade de automóveis e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de automóveis.",
    "service": "design"
  },
  {
    "company": "LMauto",
    "sector": "Comércio automóvel",
    "email_area": "Automóvel",
    "location": "Santarém, Santarém",
    "website": "https://lmauto.pt",
    "email": "geral@lmauto.pt",
    "phone": "243047646",
    "source": "https://lmauto.pt/contactos",
    "observation": "Atividade de comércio automóvel e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de comércio automóvel.",
    "service": "design"
  },
  {
    "company": "Autogirar",
    "sector": "Comércio automóvel",
    "email_area": "Automóvel",
    "location": "Santarém, Santarém",
    "website": "https://autogirar.pt",
    "email": "vendas@autogirar.pt",
    "phone": "243309030",
    "source": "https://autogirar.pt/",
    "observation": "Atividade de comércio automóvel e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de comércio automóvel.",
    "service": "design"
  },
  {
    "company": "Rectapeças",
    "sector": "Peças para automóveis",
    "email_area": "Automóvel",
    "location": "Romeira, Santarém",
    "website": "https://rectapecas.pt",
    "email": "geral@rectapecas.pt",
    "phone": "243468238",
    "source": "https://compronoribatejo.pt/empresa/rectapecas-lda",
    "observation": "Atividade de peças para automóveis e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de peças para automóveis.",
    "service": "design"
  },
  {
    "company": "Avitrata",
    "sector": "Serviços agroindustriais",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Benavente, Santarém",
    "website": "https://avitrata.pt",
    "email": "geral@avitrata.pt",
    "phone": "263507325",
    "source": "https://www.compronoribatejo.pt/empresa/avitrata-lda",
    "observation": "Atividade de serviços agroindustriais e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de serviços agroindustriais.",
    "service": "design"
  },
  {
    "company": "Nextgreen",
    "sector": "Comércio de equipamentos e soluções",
    "email_area": "Comércio & Retalho",
    "location": "Santarém, Santarém",
    "website": "https://nextgreen.pt",
    "email": "infogeral@nextgreen.pt",
    "phone": "243302538",
    "source": "https://compronoribatejo.pt/empresa/nextgreen-lda",
    "observation": "Atividade de comércio de equipamentos e soluções e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de comércio de equipamentos e soluções.",
    "service": "design"
  },
  {
    "company": "Olitrem",
    "sector": "Refrigeração comercial e industrial",
    "email_area": "Indústria & Produção",
    "location": "Tremês, Santarém",
    "website": "https://olitrem.com",
    "email": "comercial@olitrem.com",
    "phone": "243479123",
    "source": "https://compronoribatejo.pt/empresa/olitrem-sa",
    "observation": "Atividade de refrigeração comercial e industrial e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de refrigeração comercial e industrial.",
    "service": "design"
  },
  {
    "company": "Micromineiro",
    "sector": "Comércio de tecnologia",
    "email_area": "Tecnologia & Digital",
    "location": "Santarém, Santarém",
    "website": "https://micromineiro.pt",
    "email": "geral@micromineiro.pt",
    "phone": "243305120",
    "source": "https://compronoribatejo.pt/empresa/micromineiro-lda",
    "observation": "Atividade de comércio de tecnologia e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de comércio de tecnologia.",
    "service": "design"
  },
  {
    "company": "ETPR",
    "sector": "Educação e formação profissional",
    "email_area": "Educação & Formação",
    "location": "Tremês, Santarém",
    "website": "https://etpr.pt",
    "email": "geral@etpr.pt",
    "phone": "243479845",
    "source": "https://compronoribatejo.pt/empresa/etpr",
    "observation": "Atividade de educação e formação profissional e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de educação e formação profissional.",
    "service": "design"
  },
  {
    "company": "Tech4all",
    "sector": "Serviços de tecnologia",
    "email_area": "Tecnologia & Digital",
    "location": "Torres Novas, Santarém",
    "website": "https://tech4all.pt",
    "email": "ruialves@tech4all.pt",
    "phone": "913124075",
    "source": "https://compronoribatejo.pt/empresa/rui-ribeiro-alves",
    "observation": "Atividade de serviços de tecnologia e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de serviços de tecnologia.",
    "service": "design"
  },
  {
    "company": "Fisioalbi",
    "sector": "Fisioterapia e ortopedia",
    "email_area": "Fisioterapia",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://fisioalbi.pt",
    "email": "geral@fisioalbi.pt",
    "phone": "272085986",
    "source": "https://fisioalbi.pt/",
    "observation": "Atividade de fisioterapia e ortopedia e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de fisioterapia e ortopedia.",
    "service": "design"
  },
  {
    "company": "Fisiart",
    "sector": "Clínica de fisioterapia e bem-estar",
    "email_area": "Fisioterapia",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://fisiart.pt",
    "email": "geral@fisiart.pt",
    "phone": "272345082",
    "source": "https://fisiart.pt/",
    "observation": "Atividade de clínica de fisioterapia e bem-estar e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de clínica de fisioterapia e bem-estar.",
    "service": "design"
  },
  {
    "company": "Viamecan",
    "sector": "Metalomecânica industrial",
    "email_area": "Indústria & Produção",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://viamecan.pt",
    "email": "geral@viamecan.pt",
    "phone": "",
    "source": "https://viamecan.pt/",
    "observation": "Atividade de metalomecânica industrial e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de metalomecânica industrial.",
    "service": "design"
  },
  {
    "company": "Magnetic Construction",
    "sector": "Construção naval e metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://magnetic-construction.pt",
    "email": "geral@magnetic-construction.pt",
    "phone": "937965183",
    "source": "https://magnetic-construction.pt/",
    "observation": "Atividade de construção naval e metalomecânica e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de construção naval e metalomecânica.",
    "service": "design"
  },
  {
    "company": "Estúdio de Dança Paulo e Adelaide",
    "sector": "Ensino de dança",
    "email_area": "Estúdios de Dança",
    "location": "Coimbra, Coimbra",
    "website": "https://estudiodancapa.pt",
    "email": "geral@estudiodancapa.pt",
    "phone": "915589929",
    "source": "https://xn--directrio-de-empresas-qcc.cybo.com/PT-biz/est%C3%BAdio-de-dan%C3%A7a-paulo-e-adelaide",
    "observation": "Atividade de ensino de dança e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de ensino de dança.",
    "service": "design"
  },
  {
    "company": "EDAC Escola de Dança Arte e Corpo",
    "sector": "Ensino de dança",
    "email_area": "Estúdios de Dança",
    "location": "Coimbra, Coimbra",
    "website": "https://edac.pt",
    "email": "geral@edac.pt",
    "phone": "",
    "source": "https://www.thekidsagenda.pt/activity/edac-escola-de-danca-arte-e-corpo?contact=1",
    "observation": "Atividade de ensino de dança e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de ensino de dança.",
    "service": "design"
  },
  {
    "company": "Herdade da Diabrória",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Beja, Beja",
    "website": "https://diabroria.com",
    "email": "reservas@diabroria.com",
    "phone": "284998177",
    "source": "https://diabroria.com/actividades/turismo-rural/",
    "observation": "Atividade de turismo rural e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de turismo rural.",
    "service": "design"
  },
  {
    "company": "Alberto Silva & Filhos",
    "sector": "Metalomecânica industrial",
    "email_area": "Indústria & Produção",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://albertosilva.pt",
    "email": "geral@albertosilva.pt",
    "phone": "258822543",
    "source": "https://albertosilva.pt/",
    "observation": "Atividade de metalomecânica industrial e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de metalomecânica industrial.",
    "service": "design"
  },
  {
    "company": "Cliribeirão",
    "sector": "Clínica de saúde e fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Ribeirão, Braga",
    "website": "https://cliribeirao.pt",
    "email": "geral@cliribeirao.pt",
    "phone": "252411184",
    "source": "https://cliribeirao.pt/web/contactos/",
    "observation": "Atividade de clínica de saúde e fisioterapia e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de clínica de saúde e fisioterapia.",
    "service": "design"
  },
  {
    "company": "DentalClinic Évora",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Évora, Évora",
    "website": "https://dentalclinic.pt",
    "email": "rececao@dentalclinic.pt",
    "phone": "266744214",
    "source": "https://dentalclinic.pt/contactos/",
    "observation": "Atividade de medicina dentária e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de medicina dentária.",
    "service": "design"
  },
  {
    "company": "EV Oral Center",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Évora, Évora",
    "website": "https://evoral.pt",
    "email": "ev@evoral.pt",
    "phone": "266048608",
    "source": "https://evoral.pt/contactos/",
    "observation": "Atividade de medicina dentária e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de medicina dentária.",
    "service": "design"
  },
  {
    "company": "Sanireal",
    "sector": "Comércio de materiais de construção",
    "email_area": "Comércio & Retalho",
    "location": "Vila Real, Vila Real",
    "website": "https://sanireal.pt",
    "email": "geral@sanireal.pt",
    "phone": "259332445",
    "source": "https://sanireal.pt/contactos/",
    "observation": "Atividade de comércio de materiais de construção e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de comércio de materiais de construção.",
    "service": "design"
  },
  {
    "company": "NRB Peças Auto",
    "sector": "Comércio de peças automóveis",
    "email_area": "Automóvel",
    "location": "Vila Real, Vila Real",
    "website": "https://nrbpecas.pt",
    "email": "geral@nrbpecas.com",
    "phone": "259100586",
    "source": "https://nrbpecas.pt/pt/contactos/",
    "observation": "Atividade de comércio de peças automóveis e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de comércio de peças automóveis.",
    "service": "design"
  },
  {
    "company": "Geração Dinâmica",
    "sector": "Montagem e manutenção de gruas",
    "email_area": "Construção & Engenharia",
    "location": "Vila Real, Vila Real",
    "website": "https://geracaodinamica.net",
    "email": "geral@geracaodinamica.com",
    "phone": "936865807",
    "source": "https://www.geracaodinamica.net/contacto",
    "observation": "Atividade de montagem e manutenção de gruas e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de montagem e manutenção de gruas.",
    "service": "design"
  },
  {
    "company": "PSI Faro",
    "sector": "Psicologia e saúde mental",
    "email_area": "Saúde Mental",
    "location": "Faro, Faro",
    "website": "https://psifaro.pt",
    "email": "geral@psifaro.pt",
    "phone": "289075778",
    "source": "https://psifaro.pt/contactos/",
    "observation": "Atividade de psicologia e saúde mental e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de psicologia e saúde mental.",
    "service": "design"
  },
  {
    "company": "Physiohub Faro",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Faro, Faro",
    "website": "https://physiohub.pt",
    "email": "faro@physiohub.pt",
    "phone": "289091735",
    "source": "https://www.physiohub.pt/faro",
    "observation": "Atividade de fisioterapia e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de fisioterapia.",
    "service": "design"
  },
  {
    "company": "Serralharia Sul",
    "sector": "Serralharia e coberturas metálicas",
    "email_area": "Indústria & Produção",
    "location": "Setúbal, Setúbal",
    "website": "https://serralhariasul.pt",
    "email": "geral@serralhariasul.pt",
    "phone": "",
    "source": "https://serralhariasul.pt/zonas/setubal/",
    "observation": "Atividade de serralharia e coberturas metálicas e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de serralharia e coberturas metálicas.",
    "service": "design"
  },
  {
    "company": "Amitrónica",
    "sector": "Fabrico de equipamento eletrónico",
    "email_area": "Indústria & Produção",
    "location": "Amiais de Baixo, Santarém",
    "website": "https://amitronica.com",
    "email": "joaomanata@amitronica.com",
    "phone": "249870152",
    "source": "https://www.compronoribatejo.pt/empresa/amitronica",
    "observation": "Atividade de fabrico de equipamento eletrónico e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de fabrico de equipamento eletrónico.",
    "service": "design"
  },
  {
    "company": "Clínica Filipe Leitão Moreira",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Évora, Évora",
    "website": "https://filipeleitaomoreira.pt",
    "email": "info@croaevora.pt",
    "phone": "266106471",
    "source": "https://www.filipeleitaomoreira.pt/clinica/",
    "observation": "Atividade de medicina dentária e contacto profissional identificados na fonte pública indicada.",
    "opportunity": "Poderá beneficiar de peças gráficas de apresentação dos serviços de medicina dentária.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-18-c).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-18-c:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-18-c:',e.message)}
