const db=require('./db');
const PORTAL_URL=(process.env.PORTAL_URL||'https://cliente.duit.pt').replace(/\/+$/,'');

const DEFAULT_EMAIL_BODY='Olá,\n\nSou o Nuno, da DUIT.\n\nEstive a conhecer melhor a {empresa} e reparei numa oportunidade concreta: {oportunidade}.\n\nA forma como eu abordaria isto seria simples: {ideia}.\n\nSe fizer sentido para si, responda a este email e explico-lhe como aplicaria isto à comunicação da {empresa}.';
const DEFAULT_DM_BODY='Olá 👋 Sou o Nuno, da DUIT.\n\nEstive a ver a {empresa} e reparei numa oportunidade concreta: {oportunidade}.\n\nEu abordaria isto assim: {ideia}';

function ensureTable(){
  db.exec(`
    CREATE TABLE IF NOT EXISTS prospect_email_templates(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      dm_body TEXT,
      is_default INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT(datetime('now')),
      updated_at TEXT DEFAULT(datetime('now'))
    );
  `);
  const cols=db.prepare('PRAGMA table_info(prospect_email_templates)').all().map(c=>c.name);
  if(!cols.includes('description'))db.exec('ALTER TABLE prospect_email_templates ADD COLUMN description TEXT');
  if(!cols.includes('dm_body'))db.exec('ALTER TABLE prospect_email_templates ADD COLUMN dm_body TEXT');
  if(!cols.includes('html_body'))db.exec('ALTER TABLE prospect_email_templates ADD COLUMN html_body TEXT');

  const has=db.prepare('SELECT id FROM prospect_email_templates LIMIT 1').get();
  if(!has){
    db.prepare(`INSERT INTO prospect_email_templates(name,description,subject,body,dm_body,is_default,is_active)
      VALUES(?,?,?,?,?,1,1)`).run(
        'Oportunidade concreta',
        'Parte de um problema real do negócio e apresenta logo um caminho simples para o melhorar.',
        '{empresa} — reparei numa oportunidade',
        DEFAULT_EMAIL_BODY,
        DEFAULT_DM_BODY
      );
  }

  // Migra apenas o antigo modelo predefinido da DUIT; modelos personalizados ficam intactos.
  try{
    const rows=db.prepare('SELECT id,name,body,dm_body,description,is_default FROM prospect_email_templates').all();
    const upd=db.prepare("UPDATE prospect_email_templates SET body=?,dm_body=?,description=COALESCE(NULLIF(description,''),?),updated_at=datetime('now') WHERE id=?");
    for(const row of rows){
      const old1='Estive a conhecer melhor a {empresa} e reparei que {observacao}.';
      const old2='Estive a ver a presença digital da {empresa} e notei {observacao}.';
      let body=String(row.body||'');
      if(Number(row.is_default)===1&&(body.includes(old1)||body.includes(old2))){
        body=DEFAULT_EMAIL_BODY;
      }
      const dm=String(row.dm_body||'').trim()||DEFAULT_DM_BODY;
      if(body!==String(row.body||'')||dm!==String(row.dm_body||'')||!String(row.description||'').trim()){
        upd.run(body,dm,'Abordagem reutilizável para email e Instagram, personalizada com os dados do prospect.',row.id);
      }
    }
  }catch(_){}

  /* DUIT_APPROACH_LIBRARY_20261013 — biblioteca inicial; nunca duplica nomes já existentes. */
  try{
    const starters=[
      {
        name:'Valor do trabalho',
        description:'Para empresas com bom portfólio/produto em que a comunicação ainda não transmite todo o valor do que fazem.',
        subject:'{empresa} — o trabalho merece ser mostrado melhor',
        body:'Olá,\n\nSou o Nuno, da DUIT.\n\nEstive a conhecer melhor a {empresa} e há um ponto que me chamou a atenção: {oportunidade}.\n\nO trabalho já existe. O que eu mudaria seria a forma de o transformar em comunicação: {ideia}.\n\nSe fizer sentido, responda a este email e explico-lhe como começaria.',
        dm:'Olá 👋 Sou o Nuno, da DUIT.\n\nEstive a ver a {empresa} e achei que há trabalho aí que podia estar a ser mostrado com mais força.\n\nO ponto que me chamou a atenção foi este: {oportunidade}.\n\nEu começaria por {ideia}.'
      },
      {
        name:'Tempo e consistência',
        description:'Para negócios em que o principal ganho é retirar à equipa o peso de preparar e manter a comunicação regular.',
        subject:'{empresa} — tornar a comunicação mais simples',
        body:'Olá,\n\nSou o Nuno, da DUIT.\n\nAo conhecer melhor a {empresa}, reparei nesta oportunidade: {oportunidade}.\n\nA ideia não é criar mais trabalho para a equipa. Pelo contrário: eu estruturaria isto de forma simples — {ideia}.\n\nÉ este tipo de acompanhamento que faço na DUIT para a comunicação não ficar sempre para depois.',
        dm:'Olá 👋 Sou o Nuno, da DUIT.\n\nEstive a conhecer a {empresa} e reparei numa oportunidade: {oportunidade}.\n\nA minha ideia seria simplificar isso, não acrescentar trabalho: {ideia}.'
      },
      {
        name:'Direta e curta',
        description:'Primeiro contacto curto para empresas em que existe uma oportunidade clara e não é preciso explicar demasiado.',
        subject:'{empresa} — uma ideia concreta',
        body:'Olá,\n\nSou o Nuno, da DUIT.\n\nReparei nisto na {empresa}: {oportunidade}.\n\nEu faria uma alteração simples: {ideia}.\n\nSe este ponto fizer sentido para si, estou disponível.',
        dm:'Olá 👋 Sou o Nuno, da DUIT.\n\nReparei numa coisa na {empresa}: {oportunidade}.\n\nEu começaria por {ideia}.'
      }
    ];
    const exists=db.prepare('SELECT id FROM prospect_email_templates WHERE lower(name)=lower(?) LIMIT 1');
    const ins=db.prepare(`INSERT INTO prospect_email_templates(name,description,subject,body,dm_body,is_default,is_active) VALUES(?,?,?,?,?,0,1)`);
    for(const x of starters)if(!exists.get(x.name))ins.run(x.name,x.description,x.subject,x.body,x.dm);
  }catch(_){}

  /* DUIT_RENAME_VISUAL_EMAIL_CTA */
  try{
    const rows=db.prepare("SELECT id,html_body FROM prospect_email_templates WHERE html_body IS NOT NULL AND TRIM(html_body)!=''").all();
    const upd=db.prepare("UPDATE prospect_email_templates SET html_body=?,updated_at=datetime('now') WHERE id=?");
    for(const row of rows){
      const html=String(row.html_body||'');
      const next=html
        .replace(/>\s*Ver proposta\s*→\s*</gi,'>Saber mais →<')
        .replace(/>\s*Ver proposta\s*</gi,'>Saber mais<');
      if(next!==html)upd.run(next,row.id);
    }
  }catch(_){}

  /* DUIT_TUNE_SECTOR_VISUAL_EMAIL — remove área, troca marcadores por ícones e CTA para LP */
  try{
    const rows=db.prepare("SELECT id,name,html_body FROM prospect_email_templates WHERE html_body IS NOT NULL AND TRIM(html_body)!=''").all();
    const upd=db.prepare("UPDATE prospect_email_templates SET html_body=?,updated_at=datetime('now') WHERE id=?");
    for(const row of rows){
      let html=String(row.html_body||'');
      if(!html)continue;

      // Remove o rótulo da área/setor no topo.
      html=html.replace(/<div[^>]*>\s*\{setor\}\s*<\/div>/i,'');

      // Substitui os traços coloridos dos quatro benefícios por ícones simples.
      html=html
        .replace(/<div style="width:32px;height:4px;background:#FFD200;margin-bottom:14px;"><\/div>/g,
          '<div style="width:34px;height:34px;border-radius:50%;background:#FFF4B8;color:#111111;font-size:18px;line-height:34px;text-align:center;margin-bottom:14px;">✓</div>')
        .replace(/<div style="width:32px;height:4px;background:#16B3B1;margin-bottom:14px;"><\/div>/g,
          '<div style="width:34px;height:34px;border-radius:50%;background:#DDF7F6;color:#111111;font-size:18px;line-height:34px;text-align:center;margin-bottom:14px;">✓</div>');

      // Fecho passa a CTA direto para a landing page.
      html=html.replace(
        /<h2[^>]*>\s*Faz sentido para a \{empresa\}\?\s*<\/h2>[\s\S]*?<p[^>]*>\s*Responda a este email e explico-lhe como aplicaria esta abordagem ao seu negócio\.\s*<\/p>/i,
        '<h2 style="font-size:24px;line-height:1.25;margin:0 0 14px;color:#111111;">Veja como isto pode funcionar na {empresa}.</h2><a href="{lp_url}" style="display:inline-block;background:#FFD200;color:#111111;text-decoration:none;font-weight:800;font-size:15px;padding:15px 24px;border-radius:10px;">Ver proposta →</a>'
      );

      upd.run(html,row.id);
    }
  }catch(_){}

  /* DUIT_REMOVE_OPPORTUNITY_BLOCK_FROM_VISUAL_EMAIL — oportunidade interna não deve ser exposta no email visual */
  try{
    const rows=db.prepare("SELECT id,html_body FROM prospect_email_templates WHERE html_body IS NOT NULL AND TRIM(html_body)!=''").all();
    const upd=db.prepare("UPDATE prospect_email_templates SET html_body=?,updated_at=datetime('now') WHERE id=?");
    for(const row of rows){
      let html=String(row.html_body||'');
      let cleaned=html
        .replace(/<!--\s*OPORTUNIDADE\s*-->[\s\S]*?<!--\s*VANTAGENS\s*-->/i,'<!-- VANTAGENS -->')
        .replace(/<!--\s*PERSONALIZAÇÃO\s*-->[\s\S]*?<!--\s*VANTAGENS\s*-->/i,'<!-- VANTAGENS -->');
      if(cleaned!==html)upd.run(cleaned,row.id);
    }
  }catch(_){}

  /* DUIT_REMOVE_INTERNAL_IDEA_BLOCK — o ângulo comercial é interno e não deve aparecer no email visual */
  try{
    const rows=db.prepare("SELECT id,html_body FROM prospect_email_templates WHERE html_body IS NOT NULL AND TRIM(html_body)!=''").all();
    const upd=db.prepare("UPDATE prospect_email_templates SET html_body=?,updated_at=datetime('now') WHERE id=?");
    for(const row of rows){
      let html=String(row.html_body||'');
      const cleaned=html.replace(/<!--\s*IDEIA PARA A EMPRESA\s*-->[\s\S]*?<!--\s*GALERIA\s*-->/i,'<!-- GALERIA -->');
      if(cleaned!==html)upd.run(cleaned,row.id);
    }
  }catch(_){}

  /* DUIT_UNIFORM_SUPPORT_IMAGES — 4 imagens de apoio com dimensão visual consistente */
  try{
    const rows=db.prepare("SELECT id,html_body FROM prospect_email_templates WHERE html_body IS NOT NULL AND TRIM(html_body)!=''").all();
    const upd=db.prepare("UPDATE prospect_email_templates SET html_body=?,updated_at=datetime('now') WHERE id=?");
    for(const row of rows){
      let html=String(row.html_body||'');
      const next=html.replace(
        /<img([^>]*?)src=["']\{imagem_([1-4])\}["']([^>]*?)>/gi,
        (m,a,n,b)=>{
          let attrs=(a+b)
            .replace(/\swidth=["'][^"']*["']/gi,'')
            .replace(/\sheight=["'][^"']*["']/gi,'')
            .replace(/\sstyle=["'][^"']*["']/gi,'');
          return '<img'+attrs+' src="{imagem_'+n+'}" width="260" height="220" style="display:block;width:100%;height:220px;object-fit:cover;border:0;border-radius:12px;">';
        }
      );
      if(next!==html)upd.run(next,row.id);
    }
  }catch(_){}

  /* DUIT_CENTERED_BENEFITS_ICONS — vantagens centradas com cores DUIT e ícones distintos */
  try{
    const rows=db.prepare("SELECT id,html_body FROM prospect_email_templates WHERE html_body IS NOT NULL AND TRIM(html_body)!=''").all();
    const upd=db.prepare("UPDATE prospect_email_templates SET html_body=?,updated_at=datetime('now') WHERE id=?");
    for(const row of rows){
      let html=String(row.html_body||'');
      if(!html)continue;

      // Centro do título da secção.
      html=html
        .replace(/(<[^>]+style=["'][^"']*color:#16B3B1[^"']*)text-align:left;?/gi,'$1text-align:center;')
        .replace(/(<[^>]+style=["'][^"']*color:#111111[^"']*)text-align:left;?/gi,'$1text-align:center;');

      // Ícones DUIT diferentes para os quatro cartões.
      const icons=[
        {n:1,bg:'#FFF1A8',icon:'+'},
        {n:2,bg:'#DDF7F6',icon:'✓'},
        {n:3,bg:'#DDF7F6',icon:'⌖'},
        {n:4,bg:'#FFF1A8',icon:'★'}
      ];
      for(const x of icons){
        const re=new RegExp('<div style="width:34px;height:34px;border-radius:50%;background:[^;]+;color:#111111;font-size:18px;line-height:34px;text-align:center;margin-bottom:14px;">[^<]*<\\/div>','i');
        html=html.replace(re,`<div style="width:54px;height:54px;border-radius:50%;background:${x.bg};color:#111111;font-size:24px;line-height:54px;text-align:center;margin:0 auto 16px;">${x.icon}</div>`);
      }

      // Centra o conteúdo dentro dos cartões de vantagens.
      html=html
        .replace(/(<td[^>]*style=["'][^"']*padding:[^"']*)(["'])/gi,(m,a,q)=>{
          if(/vantagem_|Mais pedidos|Mais confiança|Mais visibilidade|Mais diferenciação/i.test(m))return m;
          return m;
        })
        .replace(/(<div style="font-size:18px;line-height:1\.3;font-weight:800;color:#111111;margin-bottom:10px;">)/g,
          '<div style="font-size:18px;line-height:1.3;font-weight:800;color:#111111;margin-bottom:10px;text-align:center;">')
        .replace(/(<div style="font-size:15px;line-height:1\.6;color:#5F5A54;">)/g,
          '<div style="font-size:15px;line-height:1.6;color:#5F5A54;text-align:center;">');

      // Fallback para títulos/textos que usam outras variações de inline CSS.
      html=html.replace(
        /(<[^>]+style=["'][^"']*)(font-weight:8\d\d;)([^"']*)(["'][^>]*>\s*\{vantagem_[1-4]\}\s*<\/[^>]+>)/gi,
        '$1$2$3text-align:center;$4'
      );
      html=html.replace(
        /(<[^>]+style=["'][^"']*)(color:#(?:5F5A54|666666|6B6B6B);)([^"']*)(["'][^>]*>\s*\{vantagem_[1-4]_texto\}\s*<\/[^>]+>)/gi,
        '$1$2$3text-align:center;$4'
      );

      if(html!==String(row.html_body||''))upd.run(html,row.id);
    }
  }catch(_){}

  /* DUIT_STRONG_COLORS_CENTER_SECTION */
  try{
    const rows=db.prepare("SELECT id,html_body FROM prospect_email_templates WHERE html_body IS NOT NULL AND TRIM(html_body)!=''").all();
    const upd=db.prepare("UPDATE prospect_email_templates SET html_body=?,updated_at=datetime('now') WHERE id=?");
    for(const row of rows){
      let html=String(row.html_body||'');
      if(!html)continue;

      html=html
        .replace(/background:#FFF1A8/gi,'background:#FFD200')
        .replace(/background:#DDF7F6/gi,'background:#16B3B1');

      html=html.replace(
        /(<[^>]+style=["'][^"']*color:#16B3B1[^"']*)(["'][^>]*>\s*O QUE PODE GANHAR\s*<\/[^>]+>)/i,
        (m,a,b)=>a.replace(/text-align:[^;]+;?/i,'')+'text-align:center;'+b
      );

      html=html.replace(
        /(<[^>]+style=["'][^"']*font-size:2[4-9]px[^"']*)(["'][^>]*>\s*Uma comunicação pensada para o seu negócio\.\s*<\/[^>]+>)/i,
        (m,a,b)=>a.replace(/text-align:[^;]+;?/i,'')+'text-align:center;'+b
      );

      if(html!==String(row.html_body||''))upd.run(html,row.id);
    }
  }catch(_){}

  /* DUIT_REMOVE_DUPLICATE_TEXT_SIGNATURE */
  try{
    const rows=db.prepare('SELECT id,body FROM prospect_email_templates').all();
    const upd=db.prepare("UPDATE prospect_email_templates SET body=?,updated_at=datetime('now') WHERE id=?");
    for(const row of rows){
      const clean=String(row.body||'').replace(/\n\s*Nuno\s*\n\s*DUIT\s*$/i,'').trimEnd();
      if(clean!==String(row.body||''))upd.run(clean,row.id);
    }
  }catch(_){}

  const def=db.prepare('SELECT id FROM prospect_email_templates WHERE is_default=1 AND is_active=1 ORDER BY id LIMIT 1').get();
  if(!def){
    const first=db.prepare('SELECT id FROM prospect_email_templates WHERE is_active=1 ORDER BY id LIMIT 1').get();
    if(first)db.prepare('UPDATE prospect_email_templates SET is_default=CASE WHEN id=? THEN 1 ELSE 0 END').run(first.id);
  }
}

function humanize(raw,fallback=''){
  let text=String(raw||'').trim().replace(/[.。!！?？]+$/,'').trim();
  if(!text)text=String(fallback||'').trim();
  if(!text)return '';
  text=text.replace(/^que\s+/i,'').trim();
  return text?text.charAt(0).toLocaleLowerCase('pt-PT')+text.slice(1):'';
}

function asset(value){
  const v=String(value||'').trim();
  if(!v)return '';
  if(/^https?:\/\//i.test(v))return v;
  return PORTAL_URL+(v.startsWith('/')?'':'/')+v;
}

function fill(text,p){
  const company=String(p?.company||p?.name||'').trim();
  const name=String(p?.name||'').trim();
  const observation=humanize(p?.email_observation,'há elementos interessantes na comunicação atual');
  const opportunity=humanize(p?.opportunity,p?.email_observation||'há espaço para tornar a comunicação mais clara e consistente');
  const idea=humanize(p?.idea,'começar por transformar esse ponto numa comunicação mais clara, regular e fácil de reconhecer');
  return String(text||'')
    .replace(/\{empresa\}/gi,company)
    .replace(/\{nome\}/gi,name)
    .replace(/\{observacao\}/gi,observation)
    .replace(/\{oportunidade\}/gi,opportunity)
    .replace(/\{problema\}/gi,opportunity)
    .replace(/\{ideia\}/gi,idea)
    .replace(/\{setor\}/gi,String(p?.sector||''))
    .replace(/\{area_email\}/gi,String(p?.email_area||''))
    .replace(/\{sector_headline\}/gi,String(p?.sector_headline||''))
    .replace(/\{sector_subheadline\}/gi,String(p?.sector_subheadline||''))
    .replace(/\{hero\}/gi,asset(p?.sector_hero))
    .replace(/\{imagem_1\}/gi,asset(p?.sector_image_1))
    .replace(/\{imagem_2\}/gi,asset(p?.sector_image_2))
    .replace(/\{imagem_3\}/gi,asset(p?.sector_image_3))
    .replace(/\{imagem_4\}/gi,asset(p?.sector_image_4))
    .replace(/\{vantagem_1\}/gi,String(p?.sector_advantage_1_title||''))
    .replace(/\{vantagem_1_texto\}/gi,String(p?.sector_advantage_1_text||''))
    .replace(/\{vantagem_2\}/gi,String(p?.sector_advantage_2_title||''))
    .replace(/\{vantagem_2_texto\}/gi,String(p?.sector_advantage_2_text||''))
    .replace(/\{vantagem_3\}/gi,String(p?.sector_advantage_3_title||''))
    .replace(/\{vantagem_3_texto\}/gi,String(p?.sector_advantage_3_text||''))
    .replace(/\{vantagem_4\}/gi,String(p?.sector_advantage_4_title||''))
    .replace(/\{vantagem_4_texto\}/gi,String(p?.sector_advantage_4_text||''))
    .replace(/\{lp_url\}/gi,p?.sector_landing_page_key?PORTAL_URL+'/'+encodeURIComponent(p.sector_landing_page_key):'')
    .replace(/\{landing_page_url\}/gi,p?.sector_landing_page_key?PORTAL_URL+'/'+encodeURIComponent(p.sector_landing_page_key):'');
}

function getTemplate(emailTemplateId){
  const tplId=Number(emailTemplateId||0);
  return tplId
    ?db.prepare('SELECT * FROM prospect_email_templates WHERE id=? AND is_active=1').get(tplId)
    :db.prepare('SELECT * FROM prospect_email_templates WHERE is_active=1 ORDER BY is_default DESC,id ASC LIMIT 1').get();
}

function prospectRow(userId){
  return db.prepare(`SELECT u.id,u.name,u.email,u.company,c.sector,c.email_area,c.email_observation,c.opportunity,c.idea,c.landing_page_id,c.email_template_id,
    s.headline sector_headline,s.subheadline sector_subheadline,s.hero_image sector_hero,
    s.image_1 sector_image_1,s.image_2 sector_image_2,s.image_3 sector_image_3,s.image_4 sector_image_4,
    s.advantage_1_title sector_advantage_1_title,s.advantage_1_text sector_advantage_1_text,
    s.advantage_2_title sector_advantage_2_title,s.advantage_2_text sector_advantage_2_text,
    s.advantage_3_title sector_advantage_3_title,s.advantage_3_text sector_advantage_3_text,
    s.advantage_4_title sector_advantage_4_title,s.advantage_4_text sector_advantage_4_text,
    s.landing_page_id sector_landing_page_id, alp.public_key sector_landing_page_key, alp.title sector_landing_page_title
    FROM users u LEFT JOIN prospect_crm c ON c.user_id=u.id
    LEFT JOIN prospect_sector_content s ON lower(TRIM(s.sector))=lower(TRIM(COALESCE(NULLIF(c.email_area,''),c.sector)))
    LEFT JOIN landing_pages alp ON alp.id=s.landing_page_id AND alp.is_active=1
    WHERE u.id=? AND u.is_prospect=1`).get(Number(userId));
}

function resolveProspectApproach(userId,emailTemplateId){
  ensureTable();
  const p=prospectRow(userId);
  if(!p)return null;
  const tpl=getTemplate(emailTemplateId||p.email_template_id);
  if(!tpl)return {error:'Não existe nenhuma abordagem ativa.',prospect:p};
  return {
    prospect:p,
    template:tpl,
    source_name:tpl.name,
    subject:fill(tpl.subject,p),
    body:fill(tpl.body,p),
    dm_body:fill(tpl.dm_body||DEFAULT_DM_BODY,p),
    email_html:fill(tpl.html_body||'',p),
    email_format:String(tpl.html_body||'').trim()?'html':'text'
  };
}

function resolveProspectEmail(userId,landingPageId,emailTemplateId){
  ensureTable();
  const p=prospectRow(userId);
  if(!p)return null;
  const lpId=Number(landingPageId||0);
  if(lpId){
    const lp=db.prepare('SELECT * FROM landing_pages WHERE id=? AND is_active=1').get(lpId);
    if(!lp)return {error:'Landing Page não encontrada ou inativa.'};
    const subject=fill(lp.email_subject,p)||('DUIT — '+lp.title);
    const body=fill(lp.email_body,p);
    const emailHtml=fill(lp.email_html,p);
    const emailFormat=String(lp.email_format||'text')==='html'&&emailHtml.trim()?'html':'text';
    if(emailFormat==='html'&&!emailHtml.trim())return {error:'Esta Landing Page está em modo HTML mas ainda não tem HTML configurado.'};
    if(emailFormat==='text'&&!body.trim())return {error:'Esta Landing Page ainda não tem texto de email configurado.'};
    return {prospect:p,source_type:'landing_page',source_name:lp.title,landing_page:lp,template:null,subject,body,email_html:emailHtml,email_format:emailFormat};
  }
  const tpl=getTemplate(emailTemplateId);
  if(!tpl)return {error:Number(emailTemplateId||0)?'A abordagem selecionada não existe ou está inativa.':'Não existe nenhuma abordagem ativa.'};
  return {prospect:p,source_type:Number(emailTemplateId||0)?'selected_template':'default_template',source_name:tpl.name,landing_page:null,template:tpl,subject:fill(tpl.subject,p),body:fill(tpl.body,p),email_html:fill(tpl.html_body||'',p),email_format:String(tpl.html_body||'').trim()?'html':'text'};
}

module.exports={ensureTable,fill,resolveProspectApproach,resolveProspectEmail,DEFAULT_DM_BODY};
