const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const express = require('express');
const db = require('./db');
const { requireAdmin } = require('./auth');

/*
 * Camada adicional de prospeção comercial DUIT.
 *
 * Mantém o server.js original intacto e acrescenta:
 * - persistência de dados comerciais de prospects;
 * - API CRUD /api/crm/prospects;
 * - injeção do módulo frontend prospects-crm.js no painel admin.
 */

const originalStatic = express.static;
const originalListen = express.application.listen;
let capturedApp = null;
let capturedListenArgs = null;

express.static = function patchedStatic(root, options) {
  const middleware = originalStatic(root, options);
  const adminPath = path.join(root, 'admin.html');

  return function duitStatic(req, res, next) {
    if (req.path !== '/admin.html') return middleware(req, res, next);

    fs.readFile(adminPath, 'utf8', (err, html) => {
      if (err) return middleware(req, res, next);
      const script = '<script src="/js/prospects-crm.js?v=20261013approach2"></script><script src="/js/leads-admin.js?v=20260928d"></script>';
      const output = html.includes('/js/leads-admin.js')
        ? html
        : html.replace('</body>', `  ${script}\n</body>`);
      res.type('html').send(output);
    });
  };
};

express.application.listen = function captureListen(...args) {
  capturedApp = this;
  capturedListenArgs = args;
  return { close() {} };
};

require('./server');

express.static = originalStatic;
express.application.listen = originalListen;

if (!capturedApp || !capturedListenArgs) {
  throw new Error('Não foi possível inicializar o portal DUIT com a camada CRM.');
}

db.exec(`
CREATE TABLE IF NOT EXISTS prospect_crm (
  user_id INTEGER PRIMARY KEY,
  sector TEXT,
  location TEXT,
  website TEXT,
  instagram TEXT,
  opportunity TEXT,
  idea TEXT,
  recommended_plan TEXT,
  solution_text TEXT,
  monthly_value REAL DEFAULT 0,
  offer_value REAL DEFAULT 0,
  lead_status TEXT NOT NULL DEFAULT 'por_contactar',
  priority TEXT NOT NULL DEFAULT 'possivel',
  first_contact_at TEXT,
  follow_up_at TEXT,
  notes TEXT,
  proposal_email TEXT,
  email_observation TEXT,
  ebook_page_id INTEGER,
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_prospect_crm_status ON prospect_crm(lead_status);
CREATE INDEX IF NOT EXISTS idx_prospect_crm_priority ON prospect_crm(priority);
CREATE TABLE IF NOT EXISTS prospect_sector_content (
  sector TEXT PRIMARY KEY,
  headline TEXT,
  subheadline TEXT,
  hero_image TEXT,
  image_1 TEXT,
  image_2 TEXT,
  image_3 TEXT,
  image_4 TEXT,
  advantage_1_title TEXT,
  advantage_1_text TEXT,
  advantage_2_title TEXT,
  advantage_2_text TEXT,
  advantage_3_title TEXT,
  advantage_3_text TEXT,
  advantage_4_title TEXT,
  advantage_4_text TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS prospect_sector_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sector TEXT NOT NULL,
  filename TEXT,
  mime_type TEXT NOT NULL,
  image_data BLOB NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_prospect_sector_images_sector ON prospect_sector_images(sector,id);
`);
const sectorContentCols=db.prepare(`PRAGMA table_info(prospect_sector_content)`).all().map(c=>c.name);
if(!sectorContentCols.includes('landing_page_id')) db.exec(`ALTER TABLE prospect_sector_content ADD COLUMN landing_page_id INTEGER`);
const crmCols=db.prepare(`PRAGMA table_info(prospect_crm)`).all().map(c=>c.name);
if(!crmCols.includes('email_area')) db.exec(`ALTER TABLE prospect_crm ADD COLUMN email_area TEXT`);if(!crmCols.includes('email_observation')) db.exec(`ALTER TABLE prospect_crm ADD COLUMN email_observation TEXT`);if(!crmCols.includes('ebook_page_id')) db.exec(`ALTER TABLE prospect_crm ADD COLUMN ebook_page_id INTEGER`);if(!crmCols.includes('landing_page_id')) db.exec(`ALTER TABLE prospect_crm ADD COLUMN landing_page_id INTEGER`);if(!crmCols.includes('email_template_id')) db.exec(`ALTER TABLE prospect_crm ADD COLUMN email_template_id INTEGER`);
try{
  const legacyLp=db.prepare("SELECT id FROM landing_pages WHERE slug='duit-start' LIMIT 1").get();
  if(legacyLp) db.prepare("UPDATE prospect_crm SET landing_page_id=? WHERE landing_page_id IS NULL AND (email_sent_at IS NOT NULL OR email_first_sent_at IS NOT NULL OR COALESCE(email_send_count,0)>0)").run(legacyLp.id);
}catch(e){ console.warn('[crm] legacy LP association:',e.message); }

const allowedStatuses = new Set([
  'por_contactar', 'contactado', 'respondeu', 'interessado',
  'proposta', 'sem_resposta', 'sem_interesse'
]);
const allowedPriorities = new Set(['atacar', 'possivel', 'nao_prioritario']);
const allowedPlans = new Set(['base', 'intermedio', 'premium', 'personalizado', '']);

function clean(value, max = 4000) {
  if (value === undefined || value === null) return null;
  return String(value).trim().slice(0, max);
}

function asMoney(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? +n.toFixed(2) : 0;
}

const EMAIL_AREAS=[
  'Saúde & Bem-estar',
  'Beleza & Estética',
  'Construção & Engenharia',
  'Indústria & Produção',
  'Artes Gráficas & Comunicação',
  'Automóvel',
  'Imobiliário',
  'Turismo & Alojamento',
  'Restauração',
  'Comércio & Retalho',
  'Serviços Profissionais',
  'Educação & Formação',
  'Transportes & Logística',
  'Tecnologia & Digital',
  'Agricultura & Agroalimentar',
  'Desporto & Fitness'
];

function emailAreaForSector(value){
  const s=String(value||'').trim().toLowerCase();
  if(!s)return 'Serviços Profissionais';
  if(/fisioter|clínic|clinica|saúde|saude|médic|medic|dent|terap|farm|osteop|podolog|psicolog|nutri/.test(s))return 'Saúde & Bem-estar';
  if(/beleza|estét|estet|cabele|barbear|spa|unhas|cosmét|cosmet/.test(s))return 'Beleza & Estética';
  if(/constru|obra|arquitet|engenh|remodel|instala|eletric|canaliz|climat|avac/.test(s))return 'Construção & Engenharia';
  if(/indústr|industr|fábrica|fabrica|metal|produção|producao|manuf|maquin/.test(s))return 'Indústria & Produção';
  if(/gráfic|grafic|impress|publicidade|sinalética|sinalet|brinde|offset|serigraf|comunicação visual|comunicacao visual/.test(s))return 'Artes Gráficas & Comunicação';
  if(/oficina|auto|automó|automov|mecân|mecan|pneu|carro|stand/.test(s))return 'Automóvel';
  if(/imobili|mediação|mediacao|property|real estate|imóvel|imovel/.test(s))return 'Imobiliário';
  if(/turis|hotel|aloj|viagen|travel|rent|tour|hostel|resort/.test(s))return 'Turismo & Alojamento';
  if(/restaur|café|cafe|pastel|food|bar|gastr|catering/.test(s))return 'Restauração';
  if(/loja|comércio|comercio|retalho|retail|boutique|mercearia/.test(s))return 'Comércio & Retalho';
  if(/educa|escola|formaç|formac|academ|colégio|colegio|curso/.test(s))return 'Educação & Formação';
  if(/transport|logíst|logist|distribu|estafeta|mudança|mudanca/.test(s))return 'Transportes & Logística';
  if(/tecnolog|software|digital|informát|informat|it\b|web|saas/.test(s))return 'Tecnologia & Digital';
  if(/agric|agro|vinho|vinícola|vinicola|quinta|pecuár|pecuar|alimentar/.test(s))return 'Agricultura & Agroalimentar';
  if(/desporto|fitness|ginás|ginas|personal trainer|crossfit|padel|futebol/.test(s))return 'Desporto & Fitness';
  return 'Serviços Profissionais';
}

function defaultSectorContent(sector){
  const s=String(sector||'').toLowerCase();
  let headline='Uma presença mais forte para fazer o seu negócio crescer.';
  let subheadline='Comunicação profissional, clara e consistente para transformar atenção em confiança e novas oportunidades.';
  let advantages=[
    ['Mais confiança','Uma imagem profissional ajuda potenciais clientes a escolher a sua empresa.'],
    ['Mais visibilidade','Conteúdos pensados para chegar às pessoas certas.'],
    ['Mais oportunidades','Uma comunicação clara facilita o contacto e gera novas oportunidades.'],
    ['Mais consistência','Uma presença coerente reforça a marca ao longo do tempo.']
  ];

  if(/fisioter|clínic|clinica|saúde|saude|médic|medic|dent|terap/.test(s)){
    headline='Mais confiança antes da primeira consulta.';
    subheadline='Mostre especializações, serviços e experiência de forma clara para que novos pacientes sintam confiança antes de entrar em contacto.';
    advantages=[
      ['Mais pedidos de marcação','Ajude novos pacientes a perceber rapidamente como pode ajudá-los.'],
      ['Mais confiança','Mostre equipa, espaço, especializações e experiência profissional.'],
      ['Mais visibilidade local','Reforce a presença junto de pessoas que procuram estes serviços na sua zona.'],
      ['Mais diferenciação','Comunique de forma clara porque devem escolher a sua clínica.']
    ];
  }else if(/constru|obra|arquitet|engenh|remodel|instala/.test(s)){
    headline='Mostre melhor a qualidade do trabalho que já faz.';
    subheadline='Transforme obras, projetos e detalhes de execução numa presença profissional que transmite capacidade e confiança.';
    advantages=[
      ['Mais confiança','Mostre projetos reais, acabamentos e qualidade de execução.'],
      ['Mais pedidos de orçamento','Ajude potenciais clientes a perceber o que faz e a pedir contacto.'],
      ['Mais credibilidade','Uma imagem consistente reforça a dimensão e profissionalismo da empresa.'],
      ['Mais diferenciação','Destaque experiência, especialização e resultados concretos.']
    ];
  }else if(/imobili|mediação|mediacao|property|real estate/.test(s)){
    headline='Mais impacto para imóveis que merecem ser vistos.';
    subheadline='Uma comunicação visual mais forte para valorizar imóveis, reforçar confiança e gerar mais contactos.';
    advantages=[
      ['Mais contactos','Apresente imóveis de forma mais apelativa e orientada à ação.'],
      ['Mais confiança','Reforce a credibilidade da marca e dos consultores.'],
      ['Mais valorização','Uma apresentação cuidada aumenta a perceção de valor dos imóveis.'],
      ['Mais consistência','Mantenha uma presença profissional em todos os canais.']
    ];
  }else if(/turis|hotel|aloj|viagen|travel|rent|tour/.test(s)){
    headline='Transforme destinos e experiências em vontade de reservar.';
    subheadline='Conteúdos visuais que mostram a experiência, despertam desejo e facilitam a decisão de quem está a escolher.';
    advantages=[
      ['Mais reservas','Mostre a experiência de forma clara e apelativa.'],
      ['Mais desejo','Conteúdos visuais ajudam o cliente a imaginar-se no destino.'],
      ['Mais confiança','Uma presença cuidada reforça credibilidade antes da reserva.'],
      ['Mais diferenciação','Destaque aquilo que torna a experiência única.']
    ];
  }else if(/oficina|auto|automó|mecân|pneu|carro/.test(s)){
    headline='Mais confiança para quem precisa de deixar o carro em boas mãos.';
    subheadline='Mostre serviços, especialização e trabalho real para reforçar confiança e gerar mais marcações.';
    advantages=[
      ['Mais marcações','Explique serviços e facilite o contacto de quem precisa de assistência.'],
      ['Mais confiança','Mostre trabalho real, equipa e especialização técnica.'],
      ['Mais visibilidade local','Chegue a mais condutores na sua zona.'],
      ['Mais recorrência','Mantenha a oficina presente quando surgir uma nova necessidade.']
    ];
  }else if(/restaur|café|cafe|pastel|food|bar|gastr/.test(s)){
    headline='Faça com que a vontade comece antes de chegar à mesa.';
    subheadline='Uma presença visual que mostra produto, ambiente e experiência para transformar atenção em visitas e reservas.';
    advantages=[
      ['Mais reservas','Conteúdo apelativo incentiva a decisão e o contacto.'],
      ['Mais desejo','Boas imagens valorizam pratos, espaço e experiência.'],
      ['Mais alcance local','Reforce a presença junto de quem está perto.'],
      ['Mais notoriedade','Crie uma imagem reconhecível e consistente.']
    ];
  }else if(/beleza|estét|estet|cabele|barbear|spa|unhas/.test(s)){
    headline='Resultados que se veem merecem uma comunicação à altura.';
    subheadline='Mostre serviços, resultados e experiência com uma imagem profissional que gera confiança e novas marcações.';
    advantages=[
      ['Mais marcações','Apresente serviços de forma clara e apelativa.'],
      ['Mais confiança','Mostre resultados e experiência com consistência.'],
      ['Mais desejo','Uma presença visual cuidada aumenta a intenção de experimentar.'],
      ['Mais fidelização','Mantenha a marca presente entre visitas.']
    ];
  }else if(/indústr|industr|fábrica|fabrica|metal|produção|producao/.test(s)){
    headline='Mostre capacidade, rigor e experiência antes da primeira reunião.';
    subheadline='Uma comunicação profissional para apresentar processos, projetos e competência técnica a potenciais clientes e parceiros.';
    advantages=[
      ['Mais credibilidade','Mostre capacidade produtiva, experiência e rigor.'],
      ['Mais oportunidades B2B','Facilite a perceção do que a empresa consegue executar.'],
      ['Mais diferenciação','Destaque tecnologia, processos e especialização.'],
      ['Mais confiança','Uma presença sólida reforça a decisão de contacto.']
    ];
  }else if(/transport|logíst|logist|distribu/.test(s)){
    headline='Faça a sua capacidade chegar primeiro ao cliente.';
    subheadline='Mostre cobertura, fiabilidade e operação de forma clara para gerar confiança e novas oportunidades comerciais.';
    advantages=[
      ['Mais confiança','Comunique fiabilidade, cobertura e capacidade operacional.'],
      ['Mais oportunidades','Ajude empresas a perceber rapidamente como pode servi-las.'],
      ['Mais credibilidade','Mostre frota, operação e experiência.'],
      ['Mais presença','Mantenha a marca visível junto de decisores.']
    ];
  }else if(/educa|escola|formaç|formac|academ/.test(s)){
    headline='Mostre porque aprender consigo faz diferença.';
    subheadline='Uma comunicação clara para apresentar oferta, metodologia e resultados a alunos e famílias.';
    advantages=[
      ['Mais inscrições','Torne a oferta mais clara e fácil de escolher.'],
      ['Mais confiança','Mostre metodologia, equipa e resultados.'],
      ['Mais envolvimento','Crie conteúdos úteis para alunos e famílias.'],
      ['Mais diferenciação','Destaque aquilo que torna a formação especial.']
    ];
  }

  const out={headline,subheadline};
  advantages.forEach((a,i)=>{out['advantage_'+(i+1)+'_title']=a[0];out['advantage_'+(i+1)+'_text']=a[1]});
  return out;
}

/* DUIT_EMAIL_AREA_MIGRATION */
try{
  const rows=db.prepare("SELECT user_id,sector,email_area FROM prospect_crm").all();
  const upd=db.prepare("UPDATE prospect_crm SET email_area=? WHERE user_id=?");
  for(const row of rows){
    if(!String(row.email_area||'').trim())upd.run(emailAreaForSector(row.sector),row.user_id);
  }

  const contentRows=db.prepare("SELECT * FROM prospect_sector_content").all();
  const targetExists=db.prepare("SELECT sector FROM prospect_sector_content WHERE lower(sector)=lower(?) LIMIT 1");
  const insertContent=db.prepare(`
    INSERT OR IGNORE INTO prospect_sector_content(
      sector,headline,subheadline,hero_image,image_1,image_2,image_3,image_4,
      advantage_1_title,advantage_1_text,advantage_2_title,advantage_2_text,
      advantage_3_title,advantage_3_text,advantage_4_title,advantage_4_text,updated_at
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))
  `);
  const oldImages=db.prepare("SELECT filename,mime_type,image_data FROM prospect_sector_images WHERE lower(sector)=lower(?) ORDER BY id").all.bind(db.prepare("SELECT filename,mime_type,image_data FROM prospect_sector_images WHERE lower(sector)=lower(?) ORDER BY id"));
  const insertImage=db.prepare("INSERT INTO prospect_sector_images(sector,filename,mime_type,image_data) VALUES(?,?,?,?)");
  for(const row of contentRows){
    const area=emailAreaForSector(row.sector);
    if(String(area).toLowerCase()===String(row.sector||'').trim().toLowerCase())continue;
    if(!targetExists.get(area)){
      insertContent.run(area,row.headline,row.subheadline,row.hero_image,row.image_1,row.image_2,row.image_3,row.image_4,
        row.advantage_1_title,row.advantage_1_text,row.advantage_2_title,row.advantage_2_text,
        row.advantage_3_title,row.advantage_3_text,row.advantage_4_title,row.advantage_4_text);
      const imgs=db.prepare("SELECT filename,mime_type,image_data FROM prospect_sector_images WHERE lower(sector)=lower(?) ORDER BY id").all(row.sector);
      for(const img of imgs)insertImage.run(area,img.filename,img.mime_type,img.image_data);
    }
  }
}catch(e){console.warn('[crm] email-area migration:',e.message);}

function randomPasswordHash() {
  return bcrypt.hashSync(crypto.randomBytes(18).toString('base64url'), 10);
}

function validEbookPageId(value){
  const id=Number(value||0);if(!id)return null;
  try{return db.prepare(`SELECT id FROM ebook_pages WHERE id=?`).get(id)?id:null}catch(_){return null}
}

function getCrmProspect(id) {
  return db.prepare(`
    SELECT u.id, u.name, u.email, u.company, u.phone, u.created_at,
           c.sector, c.email_area, c.location, c.website, c.instagram,
           c.opportunity, c.idea, c.recommended_plan, c.solution_text,
           COALESCE(c.monthly_value,0) monthly_value,
           COALESCE(c.offer_value,0) offer_value,
           COALESCE(c.lead_status,'por_contactar') lead_status,
           COALESCE(c.priority,'possivel') priority,
           c.first_contact_at, c.follow_up_at, c.notes, c.proposal_email, c.email_observation,
           c.ebook_page_id, c.landing_page_id, c.email_template_id, c.instagram_checked_at, c.instagram_source, c.updated_at,
           (SELECT COUNT(*) FROM quotes q WHERE q.user_id=u.id) quote_count,
           (SELECT COUNT(*) FROM quotes q WHERE q.user_id=u.id AND q.status='accepted') accepted_count
      FROM users u
      LEFT JOIN prospect_crm c ON c.user_id=u.id
     WHERE u.id=? AND u.role='client' AND u.is_prospect=1
       AND NOT EXISTS (SELECT 1 FROM landing_page_leads ll WHERE ll.user_id=u.id)
       AND COALESCE(c.outreach_response,'')='' AND COALESCE(c.outreach_question,'')=''
  `).get(id);
}

capturedApp.get('/api/crm/prospect-sectors', requireAdmin, (req, res) => {
  const counts=db.prepare(`
    SELECT COALESCE(NULLIF(TRIM(email_area),''),'Serviços Profissionais') area,COUNT(*) prospect_count
      FROM prospect_crm
     GROUP BY COALESCE(NULLIF(TRIM(email_area),''),'Serviços Profissionais')
  `).all();
  const countMap=new Map(counts.map(x=>[String(x.area).toLowerCase(),Number(x.prospect_count||0)]));
  const insert=db.prepare(`
    INSERT OR IGNORE INTO prospect_sector_content(
      sector,headline,subheadline,
      advantage_1_title,advantage_1_text,advantage_2_title,advantage_2_text,
      advantage_3_title,advantage_3_text,advantage_4_title,advantage_4_text
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?)
  `);
  for(const area of EMAIL_AREAS){
    const d=defaultSectorContent(area);
    insert.run(area,d.headline,d.subheadline,
      d.advantage_1_title,d.advantage_1_text,d.advantage_2_title,d.advantage_2_text,
      d.advantage_3_title,d.advantage_3_text,d.advantage_4_title,d.advantage_4_text);
  }
  const content=db.prepare('SELECT * FROM prospect_sector_content').all();
  const map=new Map(content.map(x=>[String(x.sector).trim().toLowerCase(),x]));
  res.json(EMAIL_AREAS.map(area=>({sector:area,prospect_count:countMap.get(area.toLowerCase())||0,...(map.get(area.toLowerCase())||{})})));
});

capturedApp.get('/api/crm/prospect-sectors/:sector/images', requireAdmin, (req,res)=>{
  const sector=decodeURIComponent(String(req.params.sector||'')).trim();
  const rows=db.prepare('SELECT id,sector,filename,mime_type,created_at FROM prospect_sector_images WHERE lower(sector)=lower(?) ORDER BY id DESC').all(sector);
  res.json(rows.map(x=>({...x,url:'/api/public/prospect-sector-images/'+x.id})));
});

capturedApp.post('/api/crm/prospect-sectors/:sector/images', requireAdmin, (req,res)=>{
  const sector=decodeURIComponent(String(req.params.sector||'')).trim().slice(0,120);
  const filename=clean(req.body?.filename,180)||'imagem';
  const dataUrl=String(req.body?.data_url||'');
  const m=dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/i);
  if(!sector||!m)return res.status(400).json({error:'Imagem inválida.'});
  const data=Buffer.from(m[2],'base64');
  if(!data.length||data.length>900000)return res.status(400).json({error:'A imagem deve ter menos de 900 KB após otimização.'});
  const info=db.prepare('INSERT INTO prospect_sector_images(sector,filename,mime_type,image_data) VALUES(?,?,?,?)').run(sector,filename,m[1].toLowerCase(),data);
  res.status(201).json({id:Number(info.lastInsertRowid),sector,filename,mime_type:m[1].toLowerCase(),url:'/api/public/prospect-sector-images/'+info.lastInsertRowid});
});

capturedApp.delete('/api/crm/prospect-sector-images/:id', requireAdmin, (req,res)=>{
  const id=Number(req.params.id||0);
  const url='/api/public/prospect-sector-images/'+id;
  db.prepare(`UPDATE prospect_sector_content SET
    hero_image=CASE WHEN hero_image=? THEN NULL ELSE hero_image END,
    image_1=CASE WHEN image_1=? THEN NULL ELSE image_1 END,
    image_2=CASE WHEN image_2=? THEN NULL ELSE image_2 END,
    image_3=CASE WHEN image_3=? THEN NULL ELSE image_3 END,
    image_4=CASE WHEN image_4=? THEN NULL ELSE image_4 END
  `).run(url,url,url,url,url);
  db.prepare('DELETE FROM prospect_sector_images WHERE id=?').run(id);
  res.json({ok:true});
});

capturedApp.get('/api/public/prospect-sector-images/:id',(req,res)=>{
  const row=db.prepare('SELECT mime_type,image_data FROM prospect_sector_images WHERE id=?').get(Number(req.params.id||0));
  if(!row)return res.status(404).end();
  res.set('Content-Type',row.mime_type||'image/jpeg');
  res.set('Cache-Control','public,max-age=31536000,immutable');
  res.send(row.image_data);
});

capturedApp.put('/api/crm/prospect-sectors/:sector', requireAdmin, (req, res) => {
  const sector=decodeURIComponent(String(req.params.sector||'')).trim().slice(0,120);
  if(!sector)return res.status(400).json({error:'Setor inválido.'});
  const x=req.body||{};
  const areaLandingPageId=Number(x.landing_page_id||0)||null;
  const validAreaLandingPageId=areaLandingPageId&&db.prepare('SELECT id FROM landing_pages WHERE id=? AND is_active=1').get(areaLandingPageId)?areaLandingPageId:null;
  const fields=[
    'headline','subheadline','hero_image','image_1','image_2','image_3','image_4',
    'advantage_1_title','advantage_1_text','advantage_2_title','advantage_2_text',
    'advantage_3_title','advantage_3_text','advantage_4_title','advantage_4_text'
  ];
  const values=fields.map(k=>clean(x[k],k.includes('image')?1000:500));
  db.prepare(`
    INSERT INTO prospect_sector_content (
      sector,headline,subheadline,hero_image,image_1,image_2,image_3,image_4,
      advantage_1_title,advantage_1_text,advantage_2_title,advantage_2_text,
      advantage_3_title,advantage_3_text,advantage_4_title,advantage_4_text,landing_page_id,updated_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))
    ON CONFLICT(sector) DO UPDATE SET
      headline=excluded.headline,subheadline=excluded.subheadline,hero_image=excluded.hero_image,
      image_1=excluded.image_1,image_2=excluded.image_2,image_3=excluded.image_3,image_4=excluded.image_4,
      advantage_1_title=excluded.advantage_1_title,advantage_1_text=excluded.advantage_1_text,
      advantage_2_title=excluded.advantage_2_title,advantage_2_text=excluded.advantage_2_text,
      advantage_3_title=excluded.advantage_3_title,advantage_3_text=excluded.advantage_3_text,
      advantage_4_title=excluded.advantage_4_title,advantage_4_text=excluded.advantage_4_text,
      landing_page_id=excluded.landing_page_id,
      updated_at=datetime('now')
  `).run(sector,...values,validAreaLandingPageId);
  res.json({ok:true,sector});
});

capturedApp.get('/api/crm/prospects', requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT u.id, u.name, u.email, u.company, u.phone, u.created_at,
           c.sector, c.location, c.website, c.instagram,
           c.opportunity, c.idea, c.recommended_plan, c.solution_text,
           COALESCE(c.monthly_value,0) monthly_value,
           COALESCE(c.offer_value,0) offer_value,
           COALESCE(c.lead_status,'por_contactar') lead_status,
           COALESCE(c.priority,'possivel') priority,
           c.first_contact_at, c.follow_up_at, c.notes, c.proposal_email, c.email_observation,
           c.ebook_page_id, c.landing_page_id, c.email_template_id, c.instagram_checked_at, c.instagram_source, c.updated_at,
           (SELECT COUNT(*) FROM quotes q WHERE q.user_id=u.id) quote_count,
           (SELECT COUNT(*) FROM quotes q WHERE q.user_id=u.id AND q.status='accepted') accepted_count
      FROM users u
      LEFT JOIN prospect_crm c ON c.user_id=u.id
     WHERE u.role='client' AND u.is_prospect=1
       AND NOT EXISTS (SELECT 1 FROM landing_page_leads ll WHERE ll.user_id=u.id)
       AND COALESCE(c.outreach_response,'')='' AND COALESCE(c.outreach_question,'')=''
     ORDER BY
       CASE COALESCE(c.priority,'possivel')
         WHEN 'atacar' THEN 0 WHEN 'possivel' THEN 1 ELSE 2 END,
       COALESCE(c.updated_at, u.created_at) DESC
  `).all();
  res.json(rows);
});

capturedApp.get('/api/crm/prospects/stats', requireAdmin, (req, res) => {
  const row = db.prepare(`
    SELECT
      COUNT(*) total,
      SUM(CASE WHEN COALESCE(c.priority,'possivel')='atacar' THEN 1 ELSE 0 END) atacar,
      SUM(CASE WHEN COALESCE(c.lead_status,'por_contactar')='contactado' THEN 1 ELSE 0 END) contactados,
      SUM(CASE WHEN COALESCE(c.lead_status,'por_contactar') IN ('respondeu','interessado','proposta') THEN 1 ELSE 0 END) ativos,
      COALESCE(SUM(CASE WHEN COALESCE(c.lead_status,'por_contactar') NOT IN ('sem_interesse') THEN COALESCE(c.monthly_value,0) ELSE 0 END),0) valor_potencial
    FROM users u
    LEFT JOIN prospect_crm c ON c.user_id=u.id
    WHERE u.role='client' AND u.is_prospect=1
  `).get();
  res.json(row || { total: 0, atacar: 0, contactados: 0, ativos: 0, valor_potencial: 0 });
});

capturedApp.post('/api/crm/prospects', requireAdmin, (req, res) => {
  const body = req.body || {};
  const company = clean(body.company, 180);
  const name = clean(body.name, 180) || company;
  const email = clean(body.email, 240)?.toLowerCase();

  if (!company) return res.status(400).json({ error: 'Empresa obrigatória.' });
  if (!email) return res.status(400).json({ error: 'Email obrigatório.' });

  const exists = db.prepare('SELECT id, is_prospect FROM users WHERE lower(email)=lower(?)').get(email);
  if (exists) return res.status(409).json({ error: 'Já existe um utilizador com este email.' });

  const status = allowedStatuses.has(body.lead_status) ? body.lead_status : 'por_contactar';
  const priority = allowedPriorities.has(body.priority) ? body.priority : 'possivel';
  const plan = allowedPlans.has(body.recommended_plan || '') ? (body.recommended_plan || '') : '';
  const ebookPageId=validEbookPageId(body.ebook_page_id);const landingPageId=Number(body.landing_page_id||0)||null;const emailTemplateId=Number(body.email_template_id||0)||null;

  const tx = db.transaction(() => {
    const u = db.prepare(`
      INSERT INTO users (name,email,password_hash,role,company,phone,is_prospect,is_active)
      VALUES (?,?,?,?,?,?,1,0)
    `).run(name, email, randomPasswordHash(), 'client', company, clean(body.phone, 80));

    db.prepare(`
      INSERT INTO prospect_crm (
        user_id,sector,email_area,location,website,instagram,opportunity,idea,
        recommended_plan,solution_text,monthly_value,offer_value,
        lead_status,priority,first_contact_at,follow_up_at,notes,proposal_email,email_observation,ebook_page_id,landing_page_id,email_template_id,updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))
    `).run(
      u.lastInsertRowid,
      clean(body.sector, 120), clean(body.email_area,120)||emailAreaForSector(body.sector), clean(body.location, 120), clean(body.website, 500), clean(body.instagram, 500),
      clean(body.opportunity), clean(body.idea), plan, clean(body.solution_text),
      asMoney(body.monthly_value), asMoney(body.offer_value), status, priority,
      clean(body.first_contact_at, 30), clean(body.follow_up_at, 30), clean(body.notes), clean(body.proposal_email, 12000),clean(body.email_observation,1200),ebookPageId,landingPageId,emailTemplateId
    );
    return Number(u.lastInsertRowid);
  });

  try {
    const id = tx();
    res.status(201).json(getCrmProspect(id));
  } catch (e) {
    if (/UNIQUE/i.test(e.message)) return res.status(409).json({ error: 'Já existe um prospect com estes dados.' });
    console.error('[crm] create prospect:', e);
    res.status(500).json({ error: 'Não foi possível criar o prospect.' });
  }
});

capturedApp.patch('/api/crm/prospects/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const current = getCrmProspect(id);
  if (!current) return res.status(404).json({ error: 'Prospect não encontrado.' });
  const body = req.body || {};

  const leadStatus = body.lead_status === undefined
    ? current.lead_status
    : (allowedStatuses.has(body.lead_status) ? body.lead_status : current.lead_status);
  const priority = body.priority === undefined
    ? current.priority
    : (allowedPriorities.has(body.priority) ? body.priority : current.priority);
  const plan = body.recommended_plan === undefined
    ? (current.recommended_plan || '')
    : (allowedPlans.has(body.recommended_plan || '') ? (body.recommended_plan || '') : (current.recommended_plan || ''));
  const ebookPageId=body.ebook_page_id===undefined?current.ebook_page_id:validEbookPageId(body.ebook_page_id);const landingPageId=body.landing_page_id===undefined?current.landing_page_id:(Number(body.landing_page_id||0)||null);const emailTemplateId=body.email_template_id===undefined?current.email_template_id:(Number(body.email_template_id||0)||null);

  const tx = db.transaction(() => {
    db.prepare(`
      UPDATE users SET
        name=COALESCE(?,name), company=COALESCE(?,company),
        email=COALESCE(?,email), phone=COALESCE(?,phone)
      WHERE id=? AND is_prospect=1
    `).run(
      body.name === undefined ? null : clean(body.name, 180),
      body.company === undefined ? null : clean(body.company, 180),
      body.email === undefined ? null : clean(body.email, 240)?.toLowerCase(),
      body.phone === undefined ? null : clean(body.phone, 80),
      id
    );

    db.prepare(`
      INSERT INTO prospect_crm (user_id, lead_status, priority, updated_at)
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(user_id) DO NOTHING
    `).run(id, leadStatus, priority);

    db.prepare(`
      UPDATE prospect_crm SET
        sector=?, email_area=?, location=?, website=?, instagram=?, opportunity=?, idea=?,
        recommended_plan=?, solution_text=?, monthly_value=?, offer_value=?,
        lead_status=?, priority=?, first_contact_at=?, follow_up_at=?, notes=?, proposal_email=?,email_observation=?,ebook_page_id=?,landing_page_id=?,email_template_id=?,
        updated_at=datetime('now')
      WHERE user_id=?
    `).run(
      body.sector === undefined ? current.sector : clean(body.sector, 120),
      body.email_area === undefined ? (current.email_area||emailAreaForSector(body.sector===undefined?current.sector:body.sector)) : (clean(body.email_area,120)||emailAreaForSector(body.sector===undefined?current.sector:body.sector)),
      body.location === undefined ? current.location : clean(body.location, 120),
      body.website === undefined ? current.website : clean(body.website, 500),
      body.instagram === undefined ? current.instagram : clean(body.instagram, 500),
      body.opportunity === undefined ? current.opportunity : clean(body.opportunity),
      body.idea === undefined ? current.idea : clean(body.idea),
      plan,
      body.solution_text === undefined ? current.solution_text : clean(body.solution_text),
      body.monthly_value === undefined ? asMoney(current.monthly_value) : asMoney(body.monthly_value),
      body.offer_value === undefined ? asMoney(current.offer_value) : asMoney(body.offer_value),
      leadStatus, priority,
      body.first_contact_at === undefined ? current.first_contact_at : clean(body.first_contact_at, 30),
      body.follow_up_at === undefined ? current.follow_up_at : clean(body.follow_up_at, 30),
      body.notes === undefined ? current.notes : clean(body.notes),
      body.proposal_email === undefined ? current.proposal_email : clean(body.proposal_email, 12000),body.email_observation === undefined ? current.email_observation : clean(body.email_observation, 1200),ebookPageId,landingPageId,emailTemplateId,
      id
    );
  });

  try {
    tx();
    res.json(getCrmProspect(id));
  } catch (e) {
    if (/UNIQUE/i.test(e.message)) return res.status(409).json({ error: 'Este email já está a ser utilizado.' });
    console.error('[crm] update prospect:', e);
    res.status(500).json({ error: 'Não foi possível guardar o prospect.' });
  }
});

capturedApp.post('/api/crm/prospects/:id/contacted', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!getCrmProspect(id)) return res.status(404).json({ error: 'Prospect não encontrado.' });
  db.prepare(`
    INSERT INTO prospect_crm (user_id, lead_status, priority, first_contact_at, updated_at)
    VALUES (?, 'contactado', 'possivel', date('now'), datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      lead_status='contactado',
      first_contact_at=COALESCE(prospect_crm.first_contact_at, date('now')),
      updated_at=datetime('now')
  `).run(id);
  res.json(getCrmProspect(id));
});

capturedApp.delete('/api/crm/prospects/:id', requireAdmin, (req, res) => {
  const info = db.prepare(`DELETE FROM users WHERE id=? AND role='client' AND is_prospect=1`).run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Prospect não encontrado.' });
  res.json({ ok: true });
});

require('./unsubscribe-actions')(capturedApp);
require('./crm-optout-actions')(capturedApp, requireAdmin);
require('./social-prospect-actions')(capturedApp, requireAdmin);
require('./leads-actions')(capturedApp);
require('./site-actions')(capturedApp);

// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.
originalListen.apply(capturedApp, capturedListenArgs);
