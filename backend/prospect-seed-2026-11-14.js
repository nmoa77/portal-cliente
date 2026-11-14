// DUIT — Portugal continental, 2026-11-14. Contactos públicos verificados nas fontes indicadas.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs');
const db=require('./db'),{wasDeleted}=require('./prospect-deleted-guard');
const L=[
  {
    "company": "HMF Sociedade de Metalomecânica e Soldadura",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Figueira da Foz, Coimbra",
    "website": "https://www.hmf.com.pt",
    "email": "geral@hmf.com.pt",
    "phone": "233094147",
    "source": "https://hmf-com-pt.webnode.pt/contactos/",
    "observation": "Atividade de metalomecânica e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de metalomecânica.",
    "service": "design"
  },
  {
    "company": "Fercor Indústria Metalomecânica de Precisão",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Cartaxo, Santarém",
    "website": "https://fercorimp.pt",
    "email": "geral@fercorimp.pt",
    "phone": "243709709",
    "source": "https://fercorimp.pt/contactos/",
    "observation": "Atividade de metalomecânica e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de metalomecânica.",
    "service": "design"
  },
  {
    "company": "SAP Metal",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Amares, Braga",
    "website": "https://sapmetal.wixsite.com/sapmetal",
    "email": "info@sapmetal.com",
    "phone": "253995443",
    "source": "https://sapmetal.wixsite.com/sapmetal/contactoeng",
    "observation": "Atividade de metalomecânica e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de metalomecânica.",
    "service": "design"
  },
  {
    "company": "Tornitrofa",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Trofa, Porto",
    "website": "https://www.tornitrofa.com",
    "email": "geral@tornitrofa.com",
    "phone": "252494716",
    "source": "https://www.tornitrofa.com/en/contact.php",
    "observation": "Atividade de metalomecânica e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de metalomecânica.",
    "service": "design"
  },
  {
    "company": "Sulimet",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Canedo, Aveiro",
    "website": "https://www.sulimet.com",
    "email": "geral@sulimet.com",
    "phone": "227634196",
    "source": "https://www.sulimet.com/metalworking.html",
    "observation": "Atividade de metalomecânica e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de metalomecânica.",
    "service": "design"
  },
  {
    "company": "Metalcertima",
    "sector": "Metalomecânica",
    "email_area": "Indústria & Produção",
    "location": "Oliveira do Bairro, Aveiro",
    "website": "https://www.metalcertima.pt",
    "email": "metalcertima@metalcertima.pt",
    "phone": "",
    "source": "https://www.ccip.pt/pt/associados/associados/industria/metalcertima-industria-metalomecanica-s-a",
    "observation": "Atividade de metalomecânica e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de metalomecânica.",
    "service": "design"
  },
  {
    "company": "CEL Centro de Estudos de Línguas",
    "sector": "Formação em línguas",
    "email_area": "Educação & Formação",
    "location": "Lisboa, Lisboa",
    "website": "https://cel.pt",
    "email": "infocel@cel.pt",
    "phone": "218407425",
    "source": "https://cel.pt/en/contacts/",
    "observation": "Atividade de formação em línguas e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de formação em línguas.",
    "service": "design"
  },
  {
    "company": "CELL Centro de Estudos",
    "sector": "Centro de estudos",
    "email_area": "Centro de Estudos",
    "location": "Vila Nova de Gaia, Porto",
    "website": "https://centrodeestudos.pt",
    "email": "geral@centrodeestudos.pt",
    "phone": "221178915",
    "source": "https://centrodeestudos.pt/contatos/",
    "observation": "Atividade de centro de estudos e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de centro de estudos.",
    "service": "design"
  },
  {
    "company": "Quinta do Mocho Turismo Rural",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Faro, Faro",
    "website": "https://www.quintadomocho.com",
    "email": "info@quintadomocho.com",
    "phone": "965701957",
    "source": "https://agorium.pt/c/quinta-do-mocho-turismo-rural-mfu1cs",
    "observation": "Atividade de turismo rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de turismo rural.",
    "service": "design"
  },
  {
    "company": "Aldear Turismo Rural",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Alvaiázere, Leiria",
    "website": "http://www.aldearturismorural.com",
    "email": "geral@aldearturismorural.com",
    "phone": "236651303",
    "source": "https://www.cardapio.pt/turismo-rural/dir/d/leiria/c/alvaiazere/p-19761/aldear-turismo-rural-e-de-habitacao/",
    "observation": "Atividade de turismo rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de turismo rural.",
    "service": "design"
  },
  {
    "company": "Casa dos Lagares de Vara e Pedra",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Vila Flor, Bragança",
    "website": "http://www.lagaresdevaraepedra.com",
    "email": "geral@lagaresdevaraepedra.com",
    "phone": "278512167",
    "source": "https://www.visitportugal.com/pt-pt/search/site?context=490&localidades=%28tid%3A368%29&regioes=%28tid%3A285%29&visitas=1",
    "observation": "Atividade de turismo rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de turismo rural.",
    "service": "design"
  },
  {
    "company": "Hotel Rural Villa Julia",
    "sector": "Hotelaria rural",
    "email_area": "Turismo & Alojamento",
    "location": "Vila Flor, Bragança",
    "website": "http://www.hotelruralvillajulia.com",
    "email": "reservas@hotelruralvillajulia.com",
    "phone": "278511447",
    "source": "https://www.visitportugal.com/pt-pt/search/site?context=490&localidades=%28tid%3A368%29&regioes=%28tid%3A285%29&visitas=1",
    "observation": "Atividade de hotelaria rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de hotelaria rural.",
    "service": "design"
  },
  {
    "company": "Quinta do Palame",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Vila Flor, Bragança",
    "website": "http://www.quintadopalame.com",
    "email": "info@quintadopalame.com",
    "phone": "962839966",
    "source": "https://www.visitportugal.com/pt-pt/search/site?context=490&localidades=%28tid%3A368%29&regioes=%28tid%3A285%29&visitas=1",
    "observation": "Atividade de turismo rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de turismo rural.",
    "service": "design"
  },
  {
    "company": "SerraVale House & Nature",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Manteigas, Guarda",
    "website": "http://serravale.pt",
    "email": "mail@serravale.pt",
    "phone": "965611163",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=530&f%5B0%5D=bm_field_ma_quarto_com_aquecimen%3Atrue&f%5B1%5D=bm_field_ma_bar%3Atrue&f%5B2%5D=im_subtipo_alojamento%3A586&order=1&page=11",
    "observation": "Atividade de turismo rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de turismo rural.",
    "service": "design"
  },
  {
    "company": "Casas do Vale do Ninho",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Penela, Coimbra",
    "website": "http://www.vn-nature.com",
    "email": "enjoy@vn-nature.com",
    "phone": "919048373",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo/Portugal?f%5B0%5D=bm_field_ma_acesso_internet_%3Atrue&f%5B1%5D=im_subtipo_alojamento%3A586&f%5B2%5D=sm_field_ts_tipo_alojamento%3Acasasdecampo&f%5B3%5D=bm_field_ma_aceita_animais_de_es%3Atrue&f%5B4%5D=bm_field_ma_parque_jardim%3Atrue&f%5B5%5D=im_field_poi_tipo%3A490&f%5B6%5D=bm_field_melhoria_acessivel_pesq%3Atrue&f%5B7%5D=bm_field_ma_acesso_internet_no_q%3Atrue&f%5B8%5D=bm_field_ma_parque_infantil%3Atrue&visitas=1",
    "observation": "Atividade de turismo rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de turismo rural.",
    "service": "design"
  },
  {
    "company": "Quinta de Fiães",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Alijó, Vila Real",
    "website": "https://www.quintadefiaes.pt",
    "email": "geral@quintadefiaes.pt",
    "phone": "259919275",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=586&f%5B0%5D=bm_field_ma_acesso_internet_%3Atrue&f%5B1%5D=bm_field_ma_acesso_para_deficien%3Atrue&f%5B2%5D=im_subtipo_alojamento%3A586&f%5B3%5D=sm_field_ts_tipo_alojamento%3Aagroturismo&visitas=1",
    "observation": "Atividade de turismo rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de turismo rural.",
    "service": "design"
  },
  {
    "company": "Monte Meu",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Odemira, Beja",
    "website": "http://www.moitanova.com",
    "email": "info@moitanova.com",
    "phone": "283647357",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=586&f%5B0%5D=bm_field_ma_acesso_internet_%3Atrue&f%5B1%5D=bm_field_ma_acesso_para_deficien%3Atrue&f%5B2%5D=im_subtipo_alojamento%3A586&f%5B3%5D=sm_field_ts_tipo_alojamento%3Aagroturismo&visitas=1",
    "observation": "Atividade de turismo rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de turismo rural.",
    "service": "design"
  },
  {
    "company": "Quinta de Lograssol",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Mealhada, Aveiro",
    "website": "http://www.quintadelograssol.com",
    "email": "geral@quintadelograssol.pt",
    "phone": "231939145",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo/Portugal?f%5B0%5D=im_subtipo_alojamento%3A586&f%5B1%5D=bm_field_ma_piscina_%3Atrue&f%5B2%5D=bm_field_ma_quarto_com_aquecimen%3Atrue&f%5B3%5D=bm_field_ma_instala_es_para_defi%3Atrue&f%5B4%5D=bm_field_ma_acesso_internet_%3Atrue&visitas=1",
    "observation": "Atividade de turismo rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de turismo rural.",
    "service": "design"
  },
  {
    "company": "Vale de Ferreiros",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Abrantes, Santarém",
    "website": "",
    "email": "info@vdf.pt",
    "phone": "241833517",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo/Portugal?f%5B0%5D=im_subtipo_alojamento%3A586&f%5B1%5D=bm_field_ma_piscina_%3Atrue&f%5B2%5D=bm_field_ma_quarto_com_aquecimen%3Atrue&f%5B3%5D=bm_field_ma_instala_es_para_defi%3Atrue&f%5B4%5D=bm_field_ma_acesso_internet_%3Atrue&visitas=1",
    "observation": "Atividade de turismo rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de turismo rural.",
    "service": "design"
  },
  {
    "company": "Hotel Rural Capela das Artes",
    "sector": "Hotelaria rural",
    "email_area": "Turismo & Alojamento",
    "location": "Silves, Faro",
    "website": "http://www.capeladasartes.com",
    "email": "admin@capeladasartes.com",
    "phone": "282320200",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo/Portugal?f%5B0%5D=im_subtipo_alojamento%3A586&f%5B1%5D=bm_field_ma_piscina_%3Atrue&f%5B2%5D=bm_field_ma_quarto_com_aquecimen%3Atrue&f%5B3%5D=bm_field_ma_instala_es_para_defi%3Atrue&f%5B4%5D=bm_field_ma_acesso_internet_%3Atrue&visitas=1",
    "observation": "Atividade de hotelaria rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de hotelaria rural.",
    "service": "design"
  },
  {
    "company": "Casas da Cerca",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Odemira, Beja",
    "website": "http://www.casasdacerca.com.pt",
    "email": "info@casasdacerca.com.pt",
    "phone": "283975263",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo/Portugal?f%5B0%5D=im_subtipo_alojamento%3A586&f%5B1%5D=bm_field_ma_piscina_%3Atrue&f%5B2%5D=bm_field_ma_quarto_com_aquecimen%3Atrue&f%5B3%5D=bm_field_ma_instala_es_para_defi%3Atrue&f%5B4%5D=bm_field_ma_acesso_internet_%3Atrue&visitas=1",
    "observation": "Atividade de turismo rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de turismo rural.",
    "service": "design"
  },
  {
    "company": "Hotel Rural Monte da Lezíria",
    "sector": "Hotelaria rural",
    "email_area": "Turismo & Alojamento",
    "location": "Santiago do Cacém, Setúbal",
    "website": "http://www.montedaleziria.com",
    "email": "mail@montedaleziria.com",
    "phone": "269084935",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo/Portugal?f%5B0%5D=im_subtipo_alojamento%3A586&f%5B1%5D=bm_field_ma_piscina_%3Atrue&f%5B2%5D=bm_field_ma_quarto_com_aquecimen%3Atrue&f%5B3%5D=bm_field_ma_instala_es_para_defi%3Atrue&f%5B4%5D=bm_field_ma_acesso_internet_%3Atrue&visitas=1",
    "observation": "Atividade de hotelaria rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de hotelaria rural.",
    "service": "design"
  },
  {
    "company": "Quinta do Vaqueirinho",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Marvão, Portalegre",
    "website": "http://www.quintadovaqueirinho.com",
    "email": "geral@quintadovaqueirinho.com",
    "phone": "967011567",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=530&f%5B0%5D=bm_field_ma_quarto_com_aquecimen%3Atrue&f%5B1%5D=bm_field_ma_bar%3Atrue&f%5B2%5D=im_subtipo_alojamento%3A586&order=1&page=11",
    "observation": "Atividade de turismo rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de turismo rural.",
    "service": "design"
  },
  {
    "company": "Quinta Manhãs Douro",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Sabrosa, Vila Real",
    "website": "http://www.manhasdouro.pt",
    "email": "geral@manhasdouro.pt",
    "phone": "254731041",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=530&f%5B0%5D=bm_field_ma_quarto_com_aquecimen%3Atrue&f%5B1%5D=bm_field_ma_bar%3Atrue&f%5B2%5D=im_subtipo_alojamento%3A586&order=1&page=11",
    "observation": "Atividade de turismo rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de turismo rural.",
    "service": "design"
  },
  {
    "company": "Quinta Rosa Amarela",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Loulé, Faro",
    "website": "http://www.quintarosaamarela.com",
    "email": "hello@quintarosaamarela.com",
    "phone": "919902643",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=530&f%5B0%5D=bm_field_ma_quarto_com_aquecimen%3Atrue&f%5B1%5D=bm_field_ma_bar%3Atrue&f%5B2%5D=im_subtipo_alojamento%3A586&order=1&page=11",
    "observation": "Atividade de turismo rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de turismo rural.",
    "service": "design"
  },
  {
    "company": "Quinta Rota d'Oliveira",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Mirandela, Bragança",
    "website": "http://www.quintarotadoliveira.com",
    "email": "info@quintarotadoliveira.com",
    "phone": "278789382",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=530&f%5B0%5D=bm_field_ma_quarto_com_aquecimen%3Atrue&f%5B1%5D=bm_field_ma_bar%3Atrue&f%5B2%5D=im_subtipo_alojamento%3A586&order=1&page=11",
    "observation": "Atividade de turismo rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de turismo rural.",
    "service": "design"
  },
  {
    "company": "Santa Barbara dos Mineiros Hotel Rural",
    "sector": "Hotelaria rural",
    "email_area": "Turismo & Alojamento",
    "location": "Grândola, Setúbal",
    "website": "http://www.hotelruralsantabarbara.com",
    "email": "geral@hotelruralsantabarbara.com",
    "phone": "269508630",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=530&f%5B0%5D=bm_field_ma_quarto_com_aquecimen%3Atrue&f%5B1%5D=bm_field_ma_bar%3Atrue&f%5B2%5D=im_subtipo_alojamento%3A586&order=1&page=11",
    "observation": "Atividade de hotelaria rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de hotelaria rural.",
    "service": "design"
  },
  {
    "company": "Quinta das Lavandas",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Castelo de Vide, Portalegre",
    "website": "http://www.quintadaslavandas.pt",
    "email": "geral@quintadaslavandas.pt",
    "phone": "245919133",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=35&f%5B0%5D=bm_field_ma_acesso_internet_no_q%3Atrue&f%5B1%5D=bm_field_ma_parque_jardim%3Atrue&f%5B2%5D=bm_field_ma_piscina_%3Atrue&page=1&visitas=1",
    "observation": "Atividade de turismo rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de turismo rural.",
    "service": "design"
  },
  {
    "company": "Monte Tons da Terra",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Santiago do Cacém, Setúbal",
    "website": "http://www.tonsdaterra.com",
    "email": "geral@tonsdaterra.com",
    "phone": "269909016",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=35&f%5B0%5D=bm_field_ma_acesso_internet_no_q%3Atrue&f%5B1%5D=bm_field_ma_parque_jardim%3Atrue&f%5B2%5D=bm_field_ma_piscina_%3Atrue&page=1&visitas=1",
    "observation": "Atividade de turismo rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de turismo rural.",
    "service": "design"
  },
  {
    "company": "Monte da Ameira",
    "sector": "Turismo rural",
    "email_area": "Turismo & Alojamento",
    "location": "Santiago do Cacém, Setúbal",
    "website": "http://www.monte-ameira.com",
    "email": "info@monte-ameira.com",
    "phone": "934666563",
    "source": "https://www.visitportugal.com/pt-pt/encontre-tipo?context=35&f%5B0%5D=bm_field_ma_acesso_internet_no_q%3Atrue&f%5B1%5D=bm_field_ma_parque_jardim%3Atrue&f%5B2%5D=bm_field_ma_piscina_%3Atrue&page=1&visitas=1",
    "observation": "Atividade de turismo rural e contacto profissional publicado na fonte indicada.",
    "opportunity": "Possível criação de materiais gráficos para apresentar a oferta de turismo rural.",
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
  addCrm.run(id,x.sector,x.email_area,x.location,x.website||'','',x.opportunity,x.opportunity,x.source+' — email profissional publicado na fonte indicada (verificado em 2026-11-13).','intermedio',service,200,100,'por_contactar','normal',x.observation+' Fonte: '+x.source+'; serviço sugerido: '+x.service,proposal,'email');added++;
 }})();console.log('[crm] seed 2026-11-14:',added,'adicionados,',skipped,'ignorados');
}catch(e){console.warn('[crm] seed 2026-11-14:',e.message)}
