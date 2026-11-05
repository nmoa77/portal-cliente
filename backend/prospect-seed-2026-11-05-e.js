// DUIT — Portugal continental, 2026-11-05 (quinta execução). Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "Contracta",
    "sector": "Construção e engenharia",
    "email_area": "Construção & Engenharia",
    "location": "Aveiro, Aveiro",
    "website": "https://contracta.pt/",
    "email": "geral@contracta.pt",
    "phone": "234 053 150",
    "source": "https://contracta.pt/contactos/",
    "observation": "Empresa de construção e engenharia sediada em Aveiro.",
    "opportunity": "Criar apresentações de obras, capacidades técnicas e propostas comerciais.",
    "service": "design"
  },
  {
    "company": "Prisma Construções",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Aveiro, Aveiro",
    "website": "https://www.prismaconstrucoes.pt/",
    "email": "geral@prismaconstrucoes.pt",
    "phone": "918 018 080",
    "source": "https://www.prismaconstrucoes.pt/contactos/",
    "observation": "Empresa de construção civil com sede em Aveiro.",
    "opportunity": "Criar portefólio visual de obras e materiais de apresentação comercial.",
    "service": "design"
  },
  {
    "company": "Marques Tavares",
    "sector": "Construção modular",
    "email_area": "Construção & Engenharia",
    "location": "Aveiro, Aveiro",
    "website": "https://www.marquestavares.pt/",
    "email": "geral@marquestavares.pt",
    "phone": "920 765 463",
    "source": "https://www.marquestavares.pt/",
    "observation": "Empresa de construção modular, LSF e construção tradicional.",
    "opportunity": "Criar materiais visuais para modelos de habitação e processos construtivos.",
    "service": "ambas"
  },
  {
    "company": "Suriterra",
    "sector": "Construção civil e movimentação de terras",
    "email_area": "Construção & Engenharia",
    "location": "Aveiro, Aveiro",
    "website": "https://www.suriterra.pt/",
    "email": "geral@suriterra.pt",
    "phone": "",
    "source": "https://www.suriterra.pt/",
    "observation": "Empresa de construção civil, demolições e movimentação de terras.",
    "opportunity": "Criar apresentações de serviços, frota e trabalhos executados.",
    "service": "design"
  },
  {
    "company": "SCARP",
    "sector": "Construção civil e obras públicas",
    "email_area": "Construção & Engenharia",
    "location": "Albergaria-a-Velha, Aveiro",
    "website": "",
    "email": "geral@scarp-sa.com",
    "phone": "234 529 650",
    "source": "https://ruis.aiccopn.pt/empresas/scarp-sociedade-de-construcoes-civis-e-obras-publicas-antonio-rodrigues-parente-lda/",
    "observation": "Empresa de obras públicas, infraestruturas e reabilitação de edifícios.",
    "opportunity": "Criar documentação visual para serviços e referências de obra.",
    "service": "design"
  },
  {
    "company": "Norda",
    "sector": "Construção modular",
    "email_area": "Construção & Engenharia",
    "location": "Águeda, Aveiro",
    "website": "https://norda.pt/",
    "email": "geral@norda.pt",
    "phone": "963 591 456",
    "source": "https://norda.pt/contactos/",
    "observation": "Empresa de construção modular com fábrica em Aguada de Cima e casa-modelo em Aveiro.",
    "opportunity": "Criar materiais de apresentação de modelos, acabamentos e processo de construção.",
    "service": "ambas"
  },
  {
    "company": "Engeadria",
    "sector": "Engenharia, construção e reabilitação",
    "email_area": "Construção & Engenharia",
    "location": "Maia, Porto",
    "website": "https://engeadria.pt/",
    "email": "geral@engeadria.pt",
    "phone": "939 110 300",
    "source": "https://ruis.aiccopn.pt/empresas/engeadria-engenharia-e-construcoes-lda/",
    "observation": "Empresa de engenharia e construção com atividade em edifícios residenciais, comerciais e industriais.",
    "opportunity": "Criar apresentações técnicas e comerciais de projetos e serviços.",
    "service": "design"
  },
  {
    "company": "Construções António Virgílio Teixeira",
    "sector": "Construção civil",
    "email_area": "Construção & Engenharia",
    "location": "Aveiro, Aveiro",
    "website": "",
    "email": "geral@construcoesavt.pt",
    "phone": "256 364 473",
    "source": "https://ruis.aiccopn.pt/empresas/const-s-antonio-virgilio-teixeira-lda/",
    "observation": "Empresa de construção nova e reabilitação integral.",
    "opportunity": "Criar portefólio de obras e materiais institucionais.",
    "service": "design"
  },
  {
    "company": "Volume Dinâmico Engenharia",
    "sector": "Engenharia e construção",
    "email_area": "Construção & Engenharia",
    "location": "Oliveira de Azeméis, Aveiro",
    "website": "https://vdengenharia.pt/",
    "email": "geral@vdengenharia.pt",
    "phone": "",
    "source": "https://vdengenharia.pt/",
    "observation": "Empresa de projetos de engenharia, construção e licenciamento de edifícios.",
    "opportunity": "Criar materiais visuais para explicar serviços e projetos de engenharia.",
    "service": "design"
  },
  {
    "company": "Construlautus",
    "sector": "Construção",
    "email_area": "Construção & Engenharia",
    "location": "Aveiro, Aveiro",
    "website": "https://construlautus.pt/",
    "email": "geral@construlautus.pt",
    "phone": "234 135 831",
    "source": "https://pt.linkedin.com/company/construlautus-lda",
    "observation": "Empresa privada de construção sediada em Aveiro, com 2 a 10 colaboradores segundo o perfil público.",
    "opportunity": "Criar materiais institucionais e apresentações de projetos.",
    "service": "design"
  },
  {
    "company": "FRAS Construções",
    "sector": "Construção civil e obras públicas",
    "email_area": "Construção & Engenharia",
    "location": "Milheirós de Poiares, Aveiro",
    "website": "",
    "email": "geral@frasconstrucoes.com",
    "phone": "256 010 024",
    "source": "https://ruis.aiccopn.pt/empresas/fras-construcoes-lda/",
    "observation": "Empresa de construção civil, obras públicas e promoção imobiliária.",
    "opportunity": "Criar portefólios e apresentações comerciais de obras e serviços.",
    "service": "design"
  },
  {
    "company": "Transportes Canidelo",
    "sector": "Transportes e logística",
    "email_area": "Transportes & Logística",
    "location": "Gondomar, Porto",
    "website": "https://www.transportescanidelo.pt/",
    "email": "geral@transportescanidelo.pt",
    "phone": "969 773 977",
    "source": "https://www.transportescanidelo.pt/contactos",
    "observation": "Empresa de transportes com sede em Gondomar e operação na Maia.",
    "opportunity": "Criar apresentação comercial de serviços, frota e cobertura logística.",
    "service": "design"
  },
  {
    "company": "Transportes Rápido",
    "sector": "Transportes nacionais e internacionais",
    "email_area": "Transportes & Logística",
    "location": "Coimbra, Coimbra",
    "website": "https://www.transportesrapido.com/",
    "email": "geral@transportesrapido.com",
    "phone": "239 429 050",
    "source": "https://www.transportesrapido.com/contactos/",
    "observation": "Empresa de transporte nacional e internacional.",
    "opportunity": "Criar materiais comerciais para serviços, rotas e tipos de transporte.",
    "service": "design"
  },
  {
    "company": "TA Transportes",
    "sector": "Transportes",
    "email_area": "Transportes & Logística",
    "location": "Samora Correia, Santarém",
    "website": "https://tatransportes.com/",
    "email": "geral@tatransportes.com",
    "phone": "932 778 015",
    "source": "https://tatransportes.com/pt/contactos",
    "observation": "Empresa de transportes sediada em Samora Correia.",
    "opportunity": "Criar apresentação visual de serviços e capacidade operacional.",
    "service": "design"
  },
  {
    "company": "Clube18",
    "sector": "Ginásio e clínica",
    "email_area": "Desporto & Fitness",
    "location": "Santo António da Charneca, Setúbal",
    "website": "https://clube18.pt/",
    "email": "geral@clube18.pt",
    "phone": "928 031 418",
    "source": "https://clube18.pt/contactos/",
    "observation": "Negócio com ginásio e clínica de apoio à recuperação.",
    "opportunity": "Criar comunicação visual integrada para treino, recuperação e serviços clínicos.",
    "service": "ambas"
  },
  {
    "company": "Pluma Fisioterapia",
    "sector": "Fisioterapia",
    "email_area": "Fisioterapia",
    "location": "Pêro Pinheiro, Lisboa",
    "website": "https://plumafisioterapia.pt/",
    "email": "geral@plumafisioterapia.pt",
    "phone": "927 754 262",
    "source": "https://plumafisioterapia.pt/contactos/",
    "observation": "Clínica de fisioterapia em Pêro Pinheiro.",
    "opportunity": "Criar materiais informativos para tratamentos e percurso de recuperação.",
    "service": "design"
  },
  {
    "company": "Clínica Dentária Morgado",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Leiria, Leiria",
    "website": "https://clinicadentariamorgado.pt/",
    "email": "geral@clinicadentariamorgado.pt",
    "phone": "244 824 356",
    "source": "https://clinicadentariamorgado.pt/contactos",
    "observation": "Clínica dentária com unidades em Leiria e Batalha.",
    "opportunity": "Criar conteúdos visuais sobre tratamentos, prevenção e equipa clínica.",
    "service": "design"
  },
  {
    "company": "TMMS Transportes",
    "sector": "Transportes e logística",
    "email_area": "Transportes & Logística",
    "location": "Argoncilhe, Aveiro",
    "website": "https://www.tmms.com.pt/",
    "email": "geral@tmms.com.pt",
    "phone": "917 844 335",
    "source": "https://www.tmms.com.pt/contact",
    "observation": "Empresa de transportes com sede em Argoncilhe e armazém em Esmoriz.",
    "opportunity": "Criar materiais comerciais sobre serviços, frota e logística.",
    "service": "design"
  },
  {
    "company": "Centro de Estudos Maria Miguel",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Porto, Porto",
    "website": "https://mariamiguelestudos.com/",
    "email": "geral@mariamiguelestudos.com",
    "phone": "918 227 847",
    "source": "https://mariamiguelestudos.com/contactos/",
    "observation": "Centro de estudos no Porto.",
    "opportunity": "Criar materiais para inscrições, calendário e comunicação com famílias.",
    "service": "ambas"
  },
  {
    "company": "Transportes Eduardo Cardoso",
    "sector": "Transportes",
    "email_area": "Transportes & Logística",
    "location": "Castelo Branco, Castelo Branco",
    "website": "https://www.transporteseduardocardoso.pt/",
    "email": "geral@transporteseduardocardoso.pt",
    "phone": "272 327 672",
    "source": "https://www.transporteseduardocardoso.pt/contactos.php",
    "observation": "Empresa de transportes sediada em Benquerenças, Castelo Branco.",
    "opportunity": "Criar apresentação comercial dos serviços e capacidade de transporte.",
    "service": "design"
  },
  {
    "company": "Dental Clínica",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://dentalclinica.pt/",
    "email": "geral@dentalclinica.pt",
    "phone": "258 813 074",
    "source": "https://dentalclinica.pt/contactos/",
    "observation": "Clínica dentária com unidades em Viana do Castelo e Braga.",
    "opportunity": "Criar materiais informativos e conteúdos por tratamento e unidade.",
    "service": "ambas"
  },
  {
    "company": "George Gomes Dental Center",
    "sector": "Medicina dentária",
    "email_area": "Dentistas",
    "location": "Oeiras, Lisboa",
    "website": "https://www.ggdc.pt/",
    "email": "geral@ggdc.pt",
    "phone": "211 376 141",
    "source": "https://www.ggdc.pt/contactos/",
    "observation": "Clínica dentária especializada em estética, reabilitação oral e prevenção.",
    "opportunity": "Criar conteúdos visuais educativos sobre tratamentos e prevenção.",
    "service": "design"
  },
  {
    "company": "Associação Dança Leiria",
    "sector": "Ensino de dança",
    "email_area": "Estúdios de Dança",
    "location": "Leiria, Leiria",
    "website": "https://www.dancaleiria.pt/",
    "email": "geral@dancaleiria.pt",
    "phone": "244 854 391",
    "source": "https://www.dancaleiria.pt/contactos/",
    "observation": "Associação e escola de dança em Leiria.",
    "opportunity": "Criar materiais para aulas, espetáculos, inscrições e agenda.",
    "service": "ambas"
  },
  {
    "company": "Nelly's Dance",
    "sector": "Ensino de dança",
    "email_area": "Estúdios de Dança",
    "location": "Marinha Grande, Leiria",
    "website": "https://nellysdance.com/",
    "email": "geral@nellysdance.com",
    "phone": "918 406 451",
    "source": "https://nellysdance.com/contactos-2/",
    "observation": "Escola de dança com aulas presenciais e online.",
    "opportunity": "Criar comunicação visual para modalidades, inscrições e eventos.",
    "service": "ambas"
  },
  {
    "company": "Montes de Encanto",
    "sector": "Ecoturismo e turismo de natureza",
    "email_area": "Aventura",
    "location": "Pedras Salgadas, Vila Real",
    "website": "http://www.montes-de-encanto.pt",
    "email": "info@montes-de-encanto.pt",
    "phone": "259 433 146",
    "source": "https://www.visitportugal.com/pt-pt/content/montes-de-encanto-lda",
    "observation": "Empresa de ecoturismo com passeios pedestres, oficinas de natureza e atividades em Trás-os-Montes.",
    "opportunity": "Criar materiais de divulgação de experiências, percursos e produtos locais.",
    "service": "ambas"
  },
  {
    "company": "ANADVISE Imóveis",
    "sector": "Mediação imobiliária",
    "email_area": "Imobiliário",
    "location": "Viseu, Viseu",
    "website": "https://www.anadvise.com/",
    "email": "geral@anadvise.com",
    "phone": "969 678 582",
    "source": "https://www.anadvise.com/contactos/pt",
    "observation": "Agência imobiliária sediada em Viseu.",
    "opportunity": "Criar materiais visuais para imóveis, captação e comunicação institucional.",
    "service": "ambas"
  },
  {
    "company": "New-Lar Imobiliária",
    "sector": "Mediação imobiliária",
    "email_area": "Imobiliário",
    "location": "Viseu, Viseu",
    "website": "https://www.newlarimobiliaria.pt/",
    "email": "geral@newlarimobiliaria.pt",
    "phone": "232 439 040",
    "source": "https://www.newlarimobiliaria.pt/contactos/?idioma=pt&title=contactos",
    "observation": "Agência imobiliária com presença em Viseu e Tondela.",
    "opportunity": "Criar peças de captação, apresentação de imóveis e campanhas locais.",
    "service": "ambas"
  },
  {
    "company": "Grupo Santa Lúcia",
    "sector": "Mediação imobiliária",
    "email_area": "Imobiliário",
    "location": "Viseu, Viseu",
    "website": "https://gruposantalucia.pt/",
    "email": "geral@gruposantalucia.pt",
    "phone": "232 437 473",
    "source": "https://gruposantalucia.pt/contactos/",
    "observation": "Empresa de compra, venda e administração de propriedades em Viseu.",
    "opportunity": "Criar materiais de apresentação de imóveis e serviços de mediação.",
    "service": "ambas"
  },
  {
    "company": "CASAVIS",
    "sector": "Mediação imobiliária",
    "email_area": "Imobiliário",
    "location": "Viseu, Viseu",
    "website": "https://www.casavis.pt/",
    "email": "geral@casavis.pt",
    "phone": "232 089 990",
    "source": "https://www.casavis.pt/contacte-nos",
    "observation": "Agência imobiliária sediada em Viseu.",
    "opportunity": "Criar conteúdos de captação, apresentação de imóveis e comunicação de marca.",
    "service": "ambas"
  },
  {
    "company": "Pena Aventura Park",
    "sector": "Turismo de aventura",
    "email_area": "Aventura",
    "location": "Ribeira de Pena, Vila Real",
    "website": "http://www.penaaventura.com.pt",
    "email": "geral@penaaventura.com.pt",
    "phone": "259 498 085",
    "source": "https://www.visitportugal.com/pt-pt/content/pena-aventura-park-1",
    "observation": "Parque de atividades de aventura e natureza em Ribeira de Pena.",
    "opportunity": "Criar peças de campanha e conteúdos visuais para atividades e experiências.",
    "service": "ambas"
  },
  {
    "company": "Morgado",
    "sector": "Equipamentos e soluções de limpeza profissional",
    "email_area": "Comércio & Retalho",
    "location": "Évora, Évora",
    "website": "https://tiagomorgado.com/",
    "email": "geral@tiagomorgado.com",
    "phone": "266 771 710",
    "source": "https://tiagomorgado.com/contactos/",
    "observation": "Empresa de equipamentos e soluções de limpeza profissional sediada em Évora.",
    "opportunity": "Criar catálogos, fichas de produto e materiais de apoio comercial.",
    "service": "design"
  },
  {
    "company": "Guarda 21",
    "sector": "Produção e transformação alimentar",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Guarda, Guarda",
    "website": "https://www.guarda21.pt/",
    "email": "geral@guarda21.pt",
    "phone": "910 780 118",
    "source": "https://www.guarda21.pt/contactos/",
    "observation": "Empresa que produz, transforma e embala produtos na Quinta da Forca Velha, Guarda.",
    "opportunity": "Criar materiais de produto, embalagem e comunicação de origem.",
    "service": "ambas"
  },
  {
    "company": "LA Contabilidades",
    "sector": "Contabilidade e apoio financeiro",
    "email_area": "Serviços Profissionais",
    "location": "Guarda, Guarda",
    "website": "https://www.lacontabilidades.pt/",
    "email": "geral@lacontabilidades.pt",
    "phone": "271 082 109",
    "source": "https://www.lacontabilidades.pt/contact",
    "observation": "Empresa de contabilidade e apoio financeiro sediada na Guarda.",
    "opportunity": "Criar materiais institucionais para explicar serviços e benefícios a empresas.",
    "service": "design"
  },
  {
    "company": "SulAccount",
    "sector": "Contabilidade, consultoria e gestão",
    "email_area": "Serviços Profissionais",
    "location": "Beja, Beja",
    "website": "https://sulaccount.pt/",
    "email": "geral@sulaccount.pt",
    "phone": "284 321 505",
    "source": "https://sulaccount.pt/",
    "observation": "Empresa de contabilidade, consultoria, fiscalidade e recursos humanos com presença em Beja e outras cidades.",
    "opportunity": "Criar comunicação institucional e conteúdos de serviços para empresas.",
    "service": "design"
  },
  {
    "company": "Tractores e Máquinas Moura",
    "sector": "Máquinas, reparação e aluguer de equipamentos",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Bragança, Bragança",
    "website": "https://tmmaluga.com/",
    "email": "geral@tmmaluga.com",
    "phone": "273 313 933",
    "source": "https://tmmaluga.com/contactos/",
    "observation": "Empresa de comércio, reparação e aluguer de equipamentos sediada em Bragança.",
    "opportunity": "Criar fichas de equipamentos e materiais comerciais para aluguer e assistência.",
    "service": "design"
  },
  {
    "company": "IWS",
    "sector": "Serviços técnicos e empresariais",
    "email_area": "Serviços Profissionais",
    "location": "Santarém, Santarém",
    "website": "https://www.iws.pt/",
    "email": "geral@iws.pt",
    "phone": "243 092 137",
    "source": "https://www.iws.pt/contactos",
    "observation": "Empresa com sede em Santarém e atendimento comercial público.",
    "opportunity": "Criar apresentação institucional e materiais comerciais dos serviços.",
    "service": "design"
  },
  {
    "company": "Subtilconta",
    "sector": "Contabilidade e seguros",
    "email_area": "Serviços Profissionais",
    "location": "Setúbal, Setúbal",
    "website": "https://subtilconta.pt/",
    "email": "geral@subtilconta.pt",
    "phone": "265 220 596",
    "source": "https://subtilconta.pt/contactos/",
    "observation": "Empresa de contabilidade e serviços associados sediada em Setúbal.",
    "opportunity": "Criar materiais institucionais para serviços de contabilidade, seguros e apoio empresarial.",
    "service": "design"
  },
  {
    "company": "Vianês",
    "sector": "Indústria alimentar",
    "email_area": "Agricultura & Agroalimentar",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://vianes.pt/",
    "email": "geral@vianes.pt",
    "phone": "258 871 099",
    "source": "https://vianes.pt/contactos/",
    "observation": "Empresa alimentar sediada na Zona Industrial de Neiva, Viana do Castelo.",
    "opportunity": "Criar materiais de produto, embalagem e comunicação de marca.",
    "service": "ambas"
  },
  {
    "company": "Charneca Alumínios",
    "sector": "Caixilharia e alumínios",
    "email_area": "Construção & Engenharia",
    "location": "Setúbal, Setúbal",
    "website": "https://www.charneca-aluminios.pt/",
    "email": "geral@charneca-aluminios.com",
    "phone": "265 525 737",
    "source": "https://www.charneca-aluminios.pt/contactos",
    "observation": "Empresa de alumínios e caixilharia sediada em Setúbal.",
    "opportunity": "Criar materiais de apresentação de soluções, acabamentos e projetos executados.",
    "service": "design"
  },
  {
    "company": "Vianaazul",
    "sector": "Mediação imobiliária",
    "email_area": "Imobiliário",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://www.vianaazul.com/",
    "email": "geral@vianaazul.com",
    "phone": "258 823 139",
    "source": "https://www.vianaazul.com/contactos",
    "observation": "Agência imobiliária sediada em Viana do Castelo.",
    "opportunity": "Criar peças de apresentação de imóveis, captação e campanhas locais.",
    "service": "ambas"
  },
  {
    "company": "Globalsac",
    "sector": "Fabrico de sacos de papel",
    "email_area": "Indústria & Produção",
    "location": "Viana do Castelo, Viana do Castelo",
    "website": "https://globalsac.pt/",
    "email": "geral@globalsac.pt",
    "phone": "258 325 600",
    "source": "https://globalsac.pt/pt/contactos/",
    "observation": "Empresa de sacos de papel sediada na Zona Industrial de Neiva.",
    "opportunity": "Criar catálogos, fichas de produto e materiais comerciais B2B.",
    "service": "design"
  },
  {
    "company": "ENGISUN",
    "sector": "Engenharia e sustentabilidade",
    "email_area": "Construção & Engenharia",
    "location": "Vila Real, Vila Real",
    "website": "https://engisun.pt/",
    "email": "geral@engisun.pt",
    "phone": "259 308 208",
    "source": "https://engisun.pt/contactos/",
    "observation": "Empresa de engenharia focada em sustentabilidade e soluções construtivas, sediada em Vila Real.",
    "opportunity": "Criar apresentações técnicas e comerciais de soluções sustentáveis.",
    "service": "design"
  },
  {
    "company": "Numeraprimorado",
    "sector": "Contabilidade e consultoria",
    "email_area": "Serviços Profissionais",
    "location": "Setúbal, Setúbal",
    "website": "https://www.numeraprimorado.pt/",
    "email": "geral@numeraprimorado.pt",
    "phone": "265 239 049",
    "source": "https://www.numeraprimorado.pt/contactos/",
    "observation": "Empresa de serviços empresariais e contabilidade sediada em Setúbal.",
    "opportunity": "Criar materiais institucionais para explicar serviços e diferenciação.",
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
 const deletedCompany=db.prepare("SELECT 1 FROM deleted_prospects WHERE lower(trim(company))=? LIMIT 1");
 const hasEmail=db.prepare('SELECT 1 FROM users WHERE lower(trim(email))=? LIMIT 1'),hasCompany=db.prepare('SELECT 1 FROM users WHERE is_prospect=1 AND lower(trim(company))=? LIMIT 1');
 const addUser=db.prepare('INSERT INTO users(name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES(?,?,?,?,?,?,1,0)');
 const addCrm=db.prepare("INSERT INTO prospect_crm(user_id,sector,email_area,location,website,instagram,opportunity,idea,email_observation,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,outreach_channel,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))");
 const pwd=bcrypt.hashSync(crypto.randomBytes(24).toString('hex'),10),seenE=new Set(),seenC=new Set(),seenS=new Set();
 let added=0,skipped=0;
 db.transaction(()=>{for(const x of L){
  const email=x.email.trim().toLowerCase(),company=x.company.trim().toLowerCase(),domain=email.split('@')[1],site=normSite(x.website);
  if(!domain||/^(gmail\.com|hotmail\.com|outlook\.com|yahoo\.[a-z.]+|icloud\.com|sapo\.pt)$/i.test(domain)||/^no-?reply@/i.test(email)||!x.source||!x.email_area||wasDeleted(email)||deletedCompany.get(company)||oldEmails.has(email)||oldCompanies.has(company)||(site&&oldSites.has(site))||seenE.has(email)||seenC.has(company)||(site&&seenS.has(site))||hasEmail.get(email)||hasCompany.get(company)||(site&&sites.has(site))){skipped++;continue}
  seenE.add(email);seenC.add(company);if(site)seenS.add(site);
  const service=x.service==='design'?'design gráfico e materiais comerciais':x.service==='redes'?'gestão de redes sociais':'design gráfico e comunicação nas redes sociais';
  const proposal='Olá, sou o Nuno, da DUIT. Estive a conhecer a '+x.company+'. Posso ajudar com '+service+', nomeadamente com '+x.opportunity.toLowerCase()+' Se fizer sentido para si, terei gosto em conversar consigo. Cumprimentos, Nuno.';
  const id=Number(addUser.run(x.company,email,pwd,'client',x.company,x.phone||'').lastInsertRowid);
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-05).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');
  added++;
 }})();
 console.log('[crm] seed 2026-11-05-e:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-05-e:',e.message)}
