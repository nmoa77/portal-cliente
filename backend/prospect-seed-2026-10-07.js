const crypto=require('crypto'),bcrypt=require('bcryptjs'),db=require('./db');
const{wasDeleted}=require('./prospect-deleted-guard');

for(const col of [
  ['email_observation','TEXT'],['instagram','TEXT'],['outreach_channel','TEXT'],
  ['dm_message','TEXT'],['dm_status','TEXT'],['dm_sent_at','TEXT'],
  ['instagram_checked_at','TEXT'],['instagram_source','TEXT']
]){
  try{db.prepare(`ALTER TABLE prospect_crm ADD COLUMN ${col[0]} ${col[1]}`).run()}
  catch(e){if(!/duplicate column/i.test(e.message))console.warn(e.message)}
}

const L=[
  {
    company:'Albeguilerto',
    sector:'Construção / Remodelação',
    location:'Odivelas / Lisboa',
    website:'https://www.albeguilerto.pt/',
    instagram:'https://www.instagram.com/albeguilerto/',
    phone:'+351 933 157 272',
    email:'geral@albeguilerto.pt',
    source:'https://www.albeguilerto.pt/',
    observation:'o site apresenta construção, remodelação e vários projetos recentes e liga diretamente ao Instagram oficial',
    opportunity:'Transformar obras, remodelações e bastidores em conteúdo regular sem a equipa ter de planear e publicar tudo internamente.'
  },
  {
    company:'SteelBuilding',
    sector:'Construção LSF / Arquitetura / Engenharia',
    location:'Torres Novas',
    website:'https://steelbuilding.pt/',
    instagram:'https://www.instagram.com/steelbuilding.pt',
    phone:'+351 916 933 433',
    email:'geral@steelbuilding.pt',
    source:'https://steelbuilding.pt/',
    observation:'o site apresenta soluções completas de construção LSF e identifica o Instagram oficial @steelbuilding.pt',
    opportunity:'Criar uma presença social consistente a partir de obras, fases de construção e soluções técnicas, poupando tempo à equipa.'
  },
  {
    company:'Brisatec',
    sector:'Climatização / Energia solar / Piscinas',
    location:'',
    website:'https://www.brisatec.pt/',
    instagram:'https://www.instagram.com/brisatec.pt/',
    phone:'+351 936 600 862',
    email:'geral@brisatec.pt',
    source:'https://www.brisatec.pt/',
    observation:'o site reúne climatização, energia solar, piscinas, jardim e equipamentos profissionais e identifica o Instagram @brisatec.pt',
    opportunity:'Organizar os vários serviços em conteúdos regulares e fáceis de perceber, sem exigir tempo diário à equipa.'
  },
  {
    company:'Grupo Mendes',
    sector:'Construção / Remodelação / Marcenaria',
    location:'Carnaxide',
    website:'https://www.grupomendes.pt/',
    instagram:'https://www.instagram.com/grupomendesofc',
    phone:'+351 965 249 250',
    email:'geral@grupomendes.pt',
    source:'https://www.grupomendes.pt/',
    observation:'o site incorpora conteúdos reais do Instagram com remodelações, pintura e vídeo e identifica @grupomendesofc',
    opportunity:'Aproveitar continuamente obras e marcenaria própria em conteúdos, mantendo a página ativa sem retirar tempo à execução dos projetos.'
  },
  {
    company:'MC Memória Curiosa',
    sector:'Construção / Reabilitação / Arquitetura',
    location:'',
    website:'https://memoriacuriosa.pt/',
    instagram:'https://www.instagram.com/memoriacuriosa.pt/',
    phone:'+351 913 302 513',
    email:'geral@memoriacuriosa.pt',
    source:'https://memoriacuriosa.pt/',
    observation:'o site apresenta projeto, construção, reabilitação, fiscalização e direção técnica e liga ao Instagram oficial /memoriacuriosa.pt',
    opportunity:'Transformar as várias fases de projeto e obra numa comunicação social consistente sem sobrecarregar a equipa.'
  },
  {
    company:'CIRIACO Construções',
    sector:'Construção / Remodelação',
    location:'',
    website:'https://www.ciriacoconstrucoes.pt/',
    instagram:'https://www.instagram.com/ciriaco_construcoes',
    phone:'+351 963 783 333',
    email:'geral@ciriacoconstrucoes.pt',
    source:'https://www.ciriacoconstrucoes.pt/contacto',
    observation:'a página de contacto identifica explicitamente o Instagram @ciriaco_construcoes como canal oficial da empresa',
    opportunity:'Manter a presença social ativa com obras, evolução dos trabalhos e resultados sem a gestão de conteúdos ficar a cargo da operação.'
  },
  {
    company:'Ennova',
    sector:'Engenharia / Gestão de obra',
    location:'Lisboa',
    website:'https://ennova.pt/',
    instagram:'https://www.instagram.com/ennova_engenharia',
    phone:'+351 919 535 438',
    email:'geral@ennova.pt',
    source:'https://ennova.pt/',
    observation:'o portefólio do site reúne dezenas de obras entre 2019 e 2026 e identifica o Instagram oficial @ennova_engenharia',
    opportunity:'Dar cadência social ao portefólio e às obras em execução sem consumir tempo de acompanhamento técnico da equipa.'
  },
  {
    company:'VP Móveis',
    sector:'Mobiliário por medida',
    location:'',
    website:'https://www.vpmoveis.pt/',
    instagram:'https://www.instagram.com/vpmoveis.pt/',
    phone:'+351 925 966 794',
    email:'geral@vpmoveis.pt',
    source:'https://www.vpmoveis.pt/',
    observation:'o site apresenta projetos de mobiliário por medida e assume o Instagram @vpmoveis.pt como canal para acompanhar o trabalho',
    opportunity:'Converter projetos, detalhes e soluções por medida em conteúdos regulares sem a empresa ter de gerir a página no dia a dia.'
  },
  {
    company:'DAXUS',
    sector:'AVAC / Climatização',
    location:'Viana do Castelo',
    website:'https://daxus.pt/',
    instagram:'https://www.instagram.com/daxus.pt/',
    phone:'+351 926 656 186',
    email:'geral@daxus.pt',
    source:'https://daxus.pt/',
    observation:'o site apresenta casos reais de instalações de climatização e liga diretamente ao Instagram oficial da DAXUS',
    opportunity:'Usar instalações, manutenção e soluções técnicas como conteúdo contínuo, retirando à equipa o esforço de planeamento e publicação.'
  },
  {
    company:'Construsud',
    sector:'Construção / Remodelação / Carpintaria',
    location:'Lisboa',
    website:'https://construsud.com/',
    instagram:'https://www.instagram.com/construsud_',
    phone:'+351 939 553 803',
    email:'geral@construsud.com',
    source:'https://construsud.com/',
    observation:'o site apresenta várias obras concluídas e inclui um acesso específico “Ver obras no Instagram” para o perfil oficial',
    opportunity:'Manter obras, processos e carpintaria própria a alimentar as redes com consistência sem ocupar tempo da equipa de obra.'
  }
];

const blocked=new Set(['gmail.com','googlemail.com','hotmail.com','hotmail.pt','outlook.com','outlook.pt','live.com','yahoo.com','yahoo.pt','icloud.com','sapo.pt']);
const dm=x=>`Olá 👋 Sou o Nuno, da DUIT.

Estive a ver a ${x.company}. Manter as redes ativas e publicar com regularidade consome tempo.

Eu posso tratar disso por si — conteúdos, design e publicação.

Se lhe fizer sentido, estou aqui. 🙂`;

function proposal(x){return `Assunto: ${x.company} — redes sociais

Olá,

Sou o Nuno, da DUIT.

Estive a conhecer melhor a ${x.company}. Manter uma presença ativa nas redes enquanto se acompanha o trabalho do dia a dia nem sempre é simples.

Se lhe fizer sentido, posso ajudar a retirar essa tarefa da sua rotina.`}

try{
  const h=bcrypt.hashSync(crypto.randomBytes(24).toString('hex'),10);
  const byCompany=db.prepare("SELECT id FROM users WHERE role='client' AND is_prospect=1 AND lower(trim(company))=lower(trim(?))");
  const byEmail=db.prepare("SELECT id FROM users WHERE lower(trim(email))=lower(trim(?))");
  const byInstagram=db.prepare("SELECT user_id FROM prospect_crm WHERE lower(trim(COALESCE(instagram,'')))=lower(trim(?))");
  const addUser=db.prepare("INSERT INTO users(name,email,password_hash,role,company,phone,is_prospect,is_active) VALUES(?,?,?,?,?,?,1,0)");
  const addCrm=db.prepare(`
    INSERT OR IGNORE INTO prospect_crm(
      user_id,sector,location,website,instagram,opportunity,idea,email_observation,
      recommended_plan,solution_text,monthly_value,offer_value,lead_status,priority,
      notes,proposal_email,outreach_channel,dm_message,dm_status,instagram_checked_at,
      instagram_source,updated_at
    ) VALUES(
      ?,?,?,?,?,?,?,?,
      'intermedio',
      '3 publicações por semana; Até 6 stories por semana; Planeamento e gestão de destaques; Design + copy; Agendamento e publicação; Análise mensal com sugestões',
      200,100,'por_contactar','atacar',
      ?,?,'instagram',?,'por_enviar',datetime('now'),'official_website',datetime('now')
    )
  `);
  let added=0,duplicates=0,rejected=0;
  const tx=db.transaction(()=>{
    for(const x of L){
      const email=x.email.trim().toLowerCase(),parts=email.split('@'),domain=parts[1];
      if(parts.length!==2||!domain||blocked.has(domain)||/^no-?reply/.test(parts[0])||wasDeleted(email)){rejected++;continue}
      let host='';
      try{host=new URL(x.website).hostname.toLowerCase().replace(/^www\./,'')}catch(_){rejected++;continue}
      if(!(domain===host||domain.endsWith('.'+host)||host.endsWith('.'+domain))){rejected++;continue}
      if(byCompany.get(x.company)||byEmail.get(email)||byInstagram.get(x.instagram)){duplicates++;continue}
      const id=Number(addUser.run(x.company,email,h,'client',x.company,x.phone).lastInsertRowid);
      addCrm.run(
        id,x.sector,x.location,x.website,x.instagram,x.opportunity,
        'Poupar tempo à empresa mantendo uma presença social regular e profissional.',
        x.observation,
        `Email profissional público confirmado em ${x.source}. Instagram oficial confirmado no website da empresa. Abordagem principal: DM manual, sem follow-up automático.`,
        proposal(x),dm(x)
      );
      added++;
    }
  });
  tx();
  console.log(`[crm] prospeção social 2026-10-07: ${added} adicionados, ${duplicates} duplicados, ${rejected} rejeitados`);
}catch(e){console.warn('[crm] seed social 2026-10-07:',e.message)}
