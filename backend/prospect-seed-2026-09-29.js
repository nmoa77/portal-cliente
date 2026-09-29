const crypto=require('crypto');
const bcrypt=require('bcryptjs');
const db=require('./db');
const {wasDeleted}=require('./prospect-deleted-guard');

const leads=[
['FBG Construção','Construção civil / Engenharia','Monção','https://fbg.pt/','+351 251 667 300','geral@fbg.pt','https://fbg.pt/contactos-fbg'],
['TEKSOUND','Audiovisual / Eventos','Portugal','https://teksound.pt/','+351 917 202 011','geral@teksound.pt','https://teksound.pt/'],
['PA Contabilidade','Contabilidade / Gestão','Odivelas','https://www.pa-contabilidade.pt/','+351 218 935 180','geral@pa-contabilidade.pt','https://www.pa-contabilidade.pt/contactos'],
['Arquiangra','Arquitetura / Engenharia','Angra do Heroísmo','https://www.arquiangra.pt/','+351 295 216 939','geral@arquiangra.pt','https://www.arquiangra.pt/'],
['Mobtec','Mobiliário técnico','Bragança','https://www.mobtec.pt/','+351 273 332 014','geral@mobtec.pt','https://www.mobtec.pt/pt/contactos-mobtec.html'],
['MGC Transportes','Transportes / Logística','Vila Nova de Gaia','https://www.mgc.pt/','+351 227 863 010','geral@mgc.pt','https://www.mgc.pt/pt/contactos/'],
['MomentIdeal','Eventos / Produção','Sintra','https://www.moment-eventos.com/','','info@moment-eventos.com','https://scoring.pt/empresas-certificadas/momentideal'],
['GeoPlus','Engenharia / Geotecnia','Montemor-o-Novo','https://www.geoplus.pt/','','geral@geoplus.pt','https://scoring.pt/empresas-certificadas/geoplus-engenharia-geotecnia-e-qualidade-unipessoal-lda'],
['Mário Moura Contabilidade','Contabilidade / Gestão','Loures','https://www.mmc.pt/','','office@mmc.pt','https://scoring.pt/empresas-certificadas/mmc'],
['RCR Contabilidade','Contabilidade / Gestão','Matosinhos','https://rcrcontabilidade.pt/','','geral@rcrcontabilidade.pt','https://scoring.pt/empresas-certificadas/rcr-contabilidade'],
['Optimistic','Engenharia / Equipamentos industriais','Lisboa','https://www.optimistic.pt/','','info@optimistic.pt','https://scoring.pt/empresas-certificadas/optimistic'],
['Costeira Engenharia e Construção','Construção / Engenharia','Braga','https://www.costeira.pt/','','geral@costeira.pt','https://www.scoring.pt/empresas-certificadas/costeira'],
['C2025 Engenharia','Engenharia / Certificação energética','Castelo de Paiva','https://www.c2025.pt/','','geral@c2025.pt','https://scoring.pt/empresas-certificadas/c2025'],
['Minutos Cardinais','Energia solar / Instalações elétricas','Leiria','https://www.minutoscardinais.pt/','','geral@minutoscardinais.pt','https://scoring.pt/empresas-certificadas/minutoscardinais'],
['MAFC','Construção civil / Obras públicas','Felgueiras','https://mafc.pt/','+351 255 921 516','geral@mafc.pt','https://mafc.pt/contactos/'],
['NEMA','Imobiliário','Portugal','https://nema.pt/','','geral@nema.pt','https://nema.pt/pt'],
['Atos Media','Audiovisual / Produção','Braga','https://atosmedia.pt/','+351 914 358 578','geral@atosmedia.pt','https://atosmedia.pt/'],
['HigiLethes','Higiene profissional / Comércio B2B','Ponte de Lima','https://www.higilethes.pt/','+351 258 028 234','geral@higilethes.pt','https://www.higilethes.pt/contactos/'],
['Viapetro','Limpeza industrial / Ambiente','Bombarral','https://viapetro.pt/','+351 262 604 007','geral@viapetro.pt','https://viapetro.pt/'],
['Ginásio 24/7 Madeira','Desporto / Fitness','Funchal','https://ginasio24-7.pt/','291 224 321','geral@ginasio24-7.pt','https://ginasio24-7.pt/'],
['Atelier Geometria','Arquitetura / Engenharia','Loures','https://ateliergeometria.com/','','geral@ateliergeometria.com','https://www.scoring.pt/empresas-certificadas/atelier-geometria'],
['BL Piscinas','Piscinas / SPA','Condeixa-a-Nova','https://blpiscinas.pt/','+351 969 648 216','geral@blpiscinas.pt','https://blpiscinas.pt/pt/termos'],
['Rodalgés','Equipamentos industriais / Logística','Coruche','https://rodalges.pt/','243 611 040','comercial@rodalges.pt','https://compronoribatejo.pt/empresa/rodalges'],
['Findmore Academy','Formação / Educação','Lisboa','https://academy.findmore.pt/','+351 21 820 8394','academy@findmore.pt','https://academy.findmore.pt/empresas/'],
['Transdefiro','Transportes / Logística','Guimarães','https://transdefiro.pt/','+351 253 468 095','geral@transdefiro.pt','https://transdefiro.pt/'],
['PECTA','Equipamentos industriais','Sever do Vouga','https://www.pecta.pt/','','info@pecta.pt','https://scoring.pt/empresas-certificadas/pecta'],
['Muratus','Piscinas / Wellness','Figueira da Foz','https://www.muratus.pt/','','geral@muratus.pt','https://scoring.pt/empresas-certificadas/muratus'],
['Construseco','Construção civil','Sintra','https://www.construseco.pt/','','geral@construseco.pt','https://scoring.pt/empresas-certificadas/construseco'],
['Inforlider','Tecnologia / Software','Porto','https://www.inforlider.com/','','inforlider@inforlider.com','https://scoring.pt/empresas-certificadas/inforlider-software'],
['Perímetro Final','Limpeza / Facilities','Cascais','https://www.perimetrofinal.pt/','','geral@perimetrofinal.pt','https://scoring.pt/empresas-certificadas/perimetrofinal'],
['Master Link','Tecnologia / Software','Lisboa','https://www.masterlink.pt/','','solutions@masterlink.pt','https://scoring.pt/empresas-certificadas/masterlink'],
['LiveSolutions','Tecnologia / Software','Matosinhos','https://www.livesolutions.pt/','','info@livesolutions.pt','https://scoring.pt/empresas-certificadas/livesolutions'],
['EliteTrainer','Tecnologia / Fitness','Sintra','https://elitetrainer.fit/','','fabiofilipe@elitetrainer.fit','https://scoring.pt/empresas-certificadas/elitetrainer'],
['Multilem','Eventos / Design e construção de espaços','Azambuja','https://www.multilem.com/pt-pt/','','info@multilem.com','https://scoring.pt/empresas-certificadas/multilem'],
['RCSoft','Tecnologia / Software','Coimbra','https://www.rcsoft.pt/','','rcsoft@rcsoft.pt','https://scoring.pt/empresas-certificadas/rcsoft'],
['Galileu','Formação / Educação','Lisboa','https://www.galileu.pt/','','info@galileu.pt','https://scoring.pt/empresas-certificadas/galileu'],
['Redcatpig','Tecnologia / Videojogos','Angra do Heroísmo','https://www.redcatpig.com/','','studio@redcatpig.com','https://scoring.pt/empresas-certificadas/redcatpig'],
['Abreu e Pedra','Equipamentos de limpeza / Comércio B2B','Viana do Castelo','https://abreuepedra.com/','','geral@abreuepedra.com','https://scoring.pt/empresas-certificadas/abreu-e-pedra'],
['Impeclimpa','Limpeza / Facilities','Amadora','https://www.impeclimpa.pt/','','geral@impeclimpa.pt','https://scoring.pt/empresas-certificadas/impeclimpa'],
['Limpaveiro','Limpeza / Facilities','Aveiro','https://www.limpaveiro.pt/','','geral@limpaveiro.pt','https://scoring.pt/empresas-certificadas/limpaveiro'],
['DigitalData','Tecnologia / Software','Vila Nova da Barquinha','https://digitaldata.pt/','','geral@digitaldata.pt','https://scoring.pt/empresas-certificadas/digitaldata'],
['Conta 100%','Contabilidade / Gestão','Lisboa','https://www.contacemporcento.pt/','','geral@contacemporcento.pt','https://scoring.pt/empresas-certificadas/conta-100'],
['Credimédia','Seguros','Figueira da Foz','https://www.credimedia.pt/','','credimedia@credimedia.pt','https://scoring.pt/empresas-certificadas/credimedia-corretores-de-seguros'],
['A3 Artes Gráficas','Impressão / Artes gráficas','Ramalhal','https://www.a3-pt.com/','261 912 191','info@a3-pt.com','https://www.a3-pt.com/contactos'],
['ACD Print','Impressão / Artes gráficas','Ramada / Odivelas','https://www.acdprint.pt/','219 345 800','geral@acdprint.pt','https://apigraf.pt/directory/acd-print-s-a/'],
['Alfaprint','Impressão / Artes gráficas','Lisboa','https://www.alfaprint.pt/','219 618 801','geral@alfaprint.pt','https://apigraf.pt/diretorio/'],
['Ancor','Comércio especializado / Papelaria','Guilhabreu','https://ancor.pt/','+351 229 866 630','ancor@ancor.pt','https://ancor.pt/contactos/pt/'],
['Bulhosas','Impressão / Rótulos e etiquetas','Aveiro','https://www.bulhosas.com/','256 200 600','abulhosa@bulhosas.com','https://apigraf.pt/directory/bulhosas-irmaos-s-a/'],
['Luimig','Impressão / Artes gráficas','Lisboa','https://www.luimig.pt/','214 263 450','geral@luimig.pt','https://apigraf.pt/diretorio/?location=lisboa'],
['SOPSEC','Engenharia / Arquitetura','Vila Nova de Gaia','https://www.sopsec.pt/','','sopsec@sopsec.pt','https://scoring.pt/empresas-certificadas/sopsec']
].map(x=>({company:x[0],sector:x[1],location:x[2],website:x[3],phone:x[4],email:x[5],source:x[6]}));

const blocked=new Set(['gmail.com','googlemail.com','hotmail.com','hotmail.pt','outlook.com','outlook.pt','live.com','live.pt','yahoo.com','yahoo.pt','icloud.com','me.com','aol.com','sapo.pt','mail.com','example.com','example.org','example.net']);
const planItems={intermedio:['3 publicações por semana','Até 6 stories por semana','Planeamento e gestão de destaques','Design + copy','Agendamento e publicação','Análise mensal com sugestões'],premium:['4 a 5 publicações por semana','Stories de segunda a sexta — até 15/semana','Edição simples de reels','Criação de campanhas e promoções','Gestão de mensagens/comentários (a definir)','Análises quinzenais']};

function enrich(l){
  const visual=/Arquitetura|Construção|Fitness|Piscinas|Audiovisual|Eventos|Imobiliário|Mobiliário/.test(l.sector);
  l.plan=visual?'premium':'intermedio';
  l.monthly=visual?280:200;
  l.offer=visual?140:100;
  l.priority=visual?'atacar':'possivel';
  l.opportunity='Comunicação digital regular para apresentar serviços, projetos, equipa, diferenciação e prova de trabalho a potenciais clientes.';
  l.idea='Serviços e soluções + projetos/casos reais + bastidores + equipa + dicas do setor + prova social.';
  return l;
}
leads.forEach(enrich);

function proposal(l){return `Assunto: ${l.company} — as redes ficaram para depois?

Olá,

Já publicou com frequência, depois parou… ou vai publicando quando consegue?

Não se desgaste com mais uma tarefa que precisa de acompanhamento diário para dar resultados.

A DUIT ajuda a aliviar essa tarefa e trata das suas redes sociais por si.

Por isso criámos o DUIT Start: uma forma simples de experimentar primeiro e perceber como podemos trabalhar a comunicação da sua empresa.

Veja como podemos tornar isto mais simples para si. 🙂`}

function valid(l){
  const e=l.email.trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))return false;
  const [local,domain]=e.split('@');
  if(blocked.has(domain)||/^(no-?reply|noreply)/i.test(local))return false;
  try{
    const host=new URL(l.website).hostname.replace(/^www\./,'').toLowerCase();
    if(!(domain===host||domain.endsWith('.'+host)||host.endsWith('.'+domain)))return false;
  }catch(_){return false}
  return /^https?:\/\//i.test(l.source);
}

function seed(){
  const hash=bcrypt.hashSync(crypto.randomBytes(24).toString('hex'),10);
  const byCompany=db.prepare(`SELECT id FROM users WHERE role='client' AND is_prospect=1 AND lower(trim(company))=lower(trim(?))`);
  const byEmail=db.prepare(`SELECT id FROM users WHERE lower(trim(email))=lower(trim(?))`);
  const addUser=db.prepare(`INSERT INTO users (name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES (?,?,?,?,?,?,1,0)`);
  const addCrm=db.prepare(`INSERT OR IGNORE INTO prospect_crm (user_id,sector,location,website,opportunity,idea,recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,notes,proposal_email,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?, 'por_contactar',?,?,?,datetime('now'))`);
  let added=0,duplicates=0,rejected=0,deleted=0;
  for(const l of leads){
    if(!valid(l)){rejected++;continue}
    const email=l.email.trim().toLowerCase();
    if(wasDeleted(email)){deleted++;continue}
    if(byCompany.get(l.company)||byEmail.get(email)){duplicates++;continue}
    const id=Number(addUser.run(l.company,email,hash,'client',l.company,l.phone||'').lastInsertRowid);
    addCrm.run(id,l.sector,l.location,l.website,l.opportunity,l.idea,l.plan,planItems[l.plan].join('; '),l.monthly,l.offer,l.priority,`Email profissional público confirmado. Fonte exata: ${l.source}`,proposal(l));
    added++;
  }
  console.log(`[crm] prospeção 2026-09-29: ${added} adicionados, ${duplicates} duplicados, ${deleted} apagados bloqueados, ${rejected} rejeitados`);
}
try{seed()}catch(e){console.warn('[crm] seed 2026-09-29:',e.message)}
