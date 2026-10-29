/* DUIT — Prospeção Comercial */
(() => {
  const PLANS={base:{label:'Base',price:150,offer:75,items:['2 publicações por semana','Design + copy','Planeamento mensal','Agendamento e publicação','Instagram + Facebook','Consultoria básica de perfil','Relatório mensal simples']},intermedio:{label:'Intermédio',price:200,offer:100,items:['3 publicações por semana','Até 6 stories por semana','Planeamento e gestão de destaques','Design + copy','Agendamento e publicação','Análise mensal com sugestões']},premium:{label:'Premium',price:280,offer:140,items:['4 a 5 publicações por semana','Stories de segunda a sexta — até 15/semana','Edição simples de reels','Criação de campanhas e promoções','Gestão de mensagens/comentários (a definir)','Análises quinzenais']}};
  const STATUS={por_contactar:['Por contactar','muted'],contactado:['Contactado','accent'],respondeu:['Respondeu','warn'],interessado:['Interessado','ok'],proposta:['Proposta','accent'],sem_resposta:['Sem resposta','muted'],sem_interesse:['Sem interesse','err']};
  const PRIORITY={atacar:['🔥 Atacar','ok'],possivel:['🟡 Possível','warn'],nao_prioritario:['Não prioritário','muted']};
  let crmSectorContent=[];
  let crmProspects=[],crmLandingPages=[],crmEmailTemplates=[],crmFilter={q:'',status:'all',priority:'all',proposal:'all'},crmSocialFilter='all',crmDateSort='desc',crmDateSortField='activity',autoSaveTimer=null,loadingForm=false;
  const safe=v=>escapeHtml(v==null?'':String(v)); const money=n=>`${Number(n||0).toFixed(0)}€`; const planFromValues=n=>Number(n)===150?'base':Number(n)===200?'intermedio':Number(n)===280?'premium':''; const getPlan=p=>PLANS[p.recommended_plan||planFromValues(p.monthly_value)]||null;
  const statusPill=s=>{const [label,cls]=STATUS[s]||[s||'—','muted'];return `<span class="pill ${cls}">${safe(label)}</span>`}; const priorityPill=p=>{const [label,cls]=PRIORITY[p]||[p||'—','muted'];return `<span class="pill ${cls}">${safe(label)}</span>`};
  const dmStatusLabel=s=>({por_enviar:'DM pronta',enviado:'DM enviada',respondeu:'Respondeu',interessado:'Interessado',sem_interesse:'Sem interesse'}[s]||'DM pronta');
  function crmHumanize(v,fallback=''){let s=String(v||'').trim().replace(/[.!?]+$/,'').replace(/^que\s+/i,'').trim();if(!s)s=String(fallback||'').trim();return s?s.charAt(0).toLocaleLowerCase('pt-PT')+s.slice(1):''}
  function crmApproachFill(text,p){
    const company=String(document.getElementById('crm-company')?.value||p?.company||p?.name||'').trim();
    const name=String(document.getElementById('crm-name')?.value||p?.name||'').trim();
    const observation=crmHumanize(p?.email_observation,'há elementos interessantes na comunicação atual');
    const opportunity=crmHumanize(document.getElementById('crm-opportunity')?.value||p?.opportunity,p?.email_observation||'há espaço para tornar a comunicação mais clara e consistente');
    const idea=crmHumanize(document.getElementById('crm-idea')?.value||p?.idea,'começar por transformar esse ponto numa comunicação mais clara, regular e fácil de reconhecer');
    const sectorName=String(document.getElementById('crm-sector')?.value||p?.sector||'').trim();
    const areaName=String(document.getElementById('crm-email-area')?.value||p?.email_area||'').trim();
    const sector=(crmSectorContent||[]).find(x=>String(x.sector||'').trim().toLowerCase()===areaName.toLowerCase())||{};
    const abs=v=>{const s=String(v||'').trim();if(!s)return '';if(/^https?:\/\//i.test(s))return s;return location.origin+(s.startsWith('/')?'':'/')+s};
    return String(text||'')
      .replace(/\{empresa\}/gi,company)
      .replace(/\{nome\}/gi,name)
      .replace(/\{observacao\}/gi,observation)
      .replace(/\{oportunidade\}/gi,opportunity)
      .replace(/\{problema\}/gi,opportunity)
      .replace(/\{ideia\}/gi,idea)
      .replace(/\{setor\}/gi,sectorName)
      .replace(/\{area_email\}/gi,areaName)
      .replace(/\{sector_headline\}/gi,String(sector.headline||''))
      .replace(/\{sector_subheadline\}/gi,String(sector.subheadline||''))
      .replace(/\{hero\}/gi,abs(sector.hero_image))
      .replace(/\{imagem_1\}/gi,abs(sector.image_1))
      .replace(/\{imagem_2\}/gi,abs(sector.image_2))
      .replace(/\{imagem_3\}/gi,abs(sector.image_3))
      .replace(/\{imagem_4\}/gi,abs(sector.image_4))
      .replace(/\{vantagem_1\}/gi,String(sector.advantage_1_title||''))
      .replace(/\{vantagem_1_texto\}/gi,String(sector.advantage_1_text||''))
      .replace(/\{vantagem_2\}/gi,String(sector.advantage_2_title||''))
      .replace(/\{vantagem_2_texto\}/gi,String(sector.advantage_2_text||''))
      .replace(/\{vantagem_3\}/gi,String(sector.advantage_3_title||''))
      .replace(/\{vantagem_3_texto\}/gi,String(sector.advantage_3_text||''))
      .replace(/\{vantagem_4\}/gi,String(sector.advantage_4_title||''))
      .replace(/\{vantagem_4_texto\}/gi,String(sector.advantage_4_text||''));
  }
  function crmSelectedApproach(p){
    const active=crmEmailTemplates.filter(t=>Number(t.is_active)===1),sel=document.getElementById('crm-email-template'),id=sel?Number(sel.value||0):Number(p?.email_template_id||0);
    return (id?active.find(t=>Number(t.id)===id):null)||active.find(t=>Number(t.is_default)===1)||active[0]||null;
  }
  function crmDefaultDm(p){const tpl=crmSelectedApproach(p||{}),fallback='Olá 👋 Sou o Nuno, da DUIT.\n\nEstive a ver a {empresa} e reparei numa oportunidade concreta: {oportunidade}.\n\nEu abordaria isto assim: {ideia}';return crmApproachFill(tpl?.dm_body||fallback,p||{})}
  function crmSocialState(p){if(p?.dm_status==='cancelado')return 'cancelado';if(p?.instagram){if(['enviado','respondeu','interessado','sem_interesse'].includes(p.dm_status))return p.dm_status;return 'pronto'}return p?.instagram_checked_at?'nao_encontrado':'por_verificar'}
  function crmSocialBadge(p){const s=crmSocialState(p),m={por_verificar:['🔎 IG por verificar','muted'],nao_encontrado:['— IG não encontrado','muted'],pronto:['📩 DM pronta','accent'],enviado:['✓ DM enviada','ok'],respondeu:['💬 IG respondeu','warn'],interessado:['⭐ IG interessado','ok'],sem_interesse:['IG sem interesse','err'],cancelado:['⛔ Cancelado','err']},v=m[s]||['','muted'];return `<div style="margin-top:6px"><span class="pill ${v[1]}">${v[0]}</span></div>`}
  function crmSocialCounts(){const c={por_verificar:0,nao_encontrado:0,pronto:0,enviado:0,respondeu:0,interessado:0,sem_interesse:0,cancelado:0};for(const x of crmProspects){const s=crmSocialState(x);if(c[s]!==undefined)c[s]++}return c}
  const CRM_DM_DAILY_LIMIT=10,CRM_DM_WARN_AT=7;
  function crmLocalDateKey(d){const x=d instanceof Date?d:new Date(d);if(Number.isNaN(x.getTime()))return '';const y=x.getFullYear(),m=String(x.getMonth()+1).padStart(2,'0'),day=String(x.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}
  function crmParseSqliteUtc(v){if(!v)return null;const s=String(v).trim();return new Date(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s)?s.replace(' ','T')+'Z':s)}
  function crmDmSentToday(){const today=crmLocalDateKey(new Date());return crmProspects.filter(p=>p.dm_sent_at&&crmLocalDateKey(crmParseSqliteUtc(p.dm_sent_at))===today).length}
  function crmDmDailyInfo(){const n=crmDmSentToday(),left=Math.max(0,CRM_DM_DAILY_LIMIT-n);if(n>=CRM_DM_DAILY_LIMIT)return{n,left,blocked:true,label:'⛔ Parar por hoje',cls:'err'};if(n>=CRM_DM_WARN_AT)return{n,left,blocked:false,label:`⚠️ Abrande · faltam ${left}`,cls:'warn'};return{n,left,blocked:false,label:'✓ Ritmo controlado',cls:'ok'}}
  function crmSocialControlHtml(){const c=crmSocialCounts(),daily=crmDmDailyInfo(),items=[['all','Todos',crmProspects.length],['por_verificar','🔎 Por verificar',c.por_verificar],['pronto','📩 DM pronta',c.pronto],['enviado','✓ Enviadas',c.enviado],['respondeu','💬 Responderam',c.respondeu],['interessado','⭐ Interessados',c.interessado],['cancelado','⛔ Cancelados',c.cancelado],['nao_encontrado','— Sem Instagram',c.nao_encontrado]];return `<div id="crm-social-control" style="margin:0 0 16px;padding:14px;border:1px solid var(--line);border-radius:14px;background:var(--card)"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:9px"><div style="font-weight:700">Controlo Instagram</div><div style="display:flex;gap:7px;align-items:center;flex-wrap:wrap"><span class="pill ${daily.cls}">Hoje: ${daily.n} / ${CRM_DM_DAILY_LIMIT}</span><span class="pill ${daily.cls}">${daily.label}</span></div></div><div style="display:flex;gap:7px;flex-wrap:wrap">${items.map(([k,l,n])=>`<button type="button" class="btn ${crmSocialFilter===k?'btn-yellow':'btn-ghost'}" onclick="crmSetSocialFilter('${k}')">${l} · ${n}</button>`).join('')}</div><div style="font-size:11px;color:var(--muted);margin-top:9px">Limite interno DUIT: 10 DMs/dia. As DMs só contam quando ficam marcadas como Enviada no CRM.</div></div>`}

  function resendState(p){
    if(!p.email_sent_at)return '<span class="pill muted">—</span>';
    const rs=String(p.resend_status||'').toLowerCase();
    const map={
      sent:['warn','Enviado'],
      delivered:['ok','Entregue'],
      opened:['ok','Aberto'],
      clicked:['ok','Clicado'],
      delivery_delayed:['warn','Entrega atrasada'],
      bounced:['err','Bounce'],
      complained:['err','Spam'],
      suppressed:['err','Suprimido'],
      failed:['err','Falhou'],
      not_configured:['muted','Sem configuração'],
      unknown:['muted','Sem estado']
    };
    const v=map[rs]||['muted',rs||'Sem estado'];

    let title='',detail='';
    const type=String(p.resend_detail_type||'').toLowerCase();
    const subtype=String(p.resend_detail_subtype||'').trim();

    if(rs==='delivery_delayed'){
      title='Falha temporária de comunicação';
      detail='O email ainda não foi entregue porque ocorreu um problema temporário no servidor do destinatário. O Resend continuará a tentar a entrega.';
    }else if(rs==='bounced'){
      if(type==='transient'){
        title='Falha temporária de comunicação';
        detail='O servidor do destinatário recusou temporariamente o email. Pode ser uma caixa cheia ou uma indisponibilidade temporária.';
      }else if(type==='permanent'){
        title='Falha permanente';
        detail='O servidor do destinatário rejeitou definitivamente o email. Convém confirmar se o endereço existe e está correto.';
      }else{
        title='Email devolvido';
        detail='O servidor do destinatário recusou o email.';
      }
    }else if(rs==='complained'){
      title='Marcado como spam';
      detail='O destinatário assinalou este email como spam.';
    }else if(rs==='failed'){
      title='Falha no envio';
      detail='O Resend não conseguiu concluir o envio deste email.';
    }else if(rs==='delivered'){
      detail='O servidor de email do destinatário confirmou a entrega.';
    }

    if(subtype)title+=(title?' · ':'')+subtype;
    const raw=String(p.resend_detail_message||'').trim();
    const tooltip=[title,detail,raw].filter(Boolean).join(' — ');
    return '<div style="display:flex;flex-direction:column;gap:3px;align-items:flex-start"><span class="pill '+v[0]+'"'+(tooltip?' title="'+safe(tooltip)+'"':'')+'>'+safe(v[1])+'</span>'+(title?'<span style="font-size:10px;color:var(--muted);line-height:1.25;max-width:150px">'+safe(title)+'</span>':'')+'</div>';
  }

  function contactState(p){const parts=[];if(!p.email_sent_at)parts.push('<span class="pill muted">⚪ Não enviado</span>');else if(!p.email_first_opened_at)parts.push('<span class="pill warn">🟡 Enviado · por abrir</span>');else parts.push(`<span class="pill ok">🟢 Email visto · ${Number(p.email_open_count||0)}x</span>`);if(p.email_sent_at){const cc=Number(p.cta_click_count||0);if(cc>0)parts.push(`<span class="pill ok" title="${safe(p.cta_last_clicked_at?'Último clique: '+fmtDateTime(p.cta_last_clicked_at):'CTA clicado')}">🔗 CTA clicado · ${cc}x</span>`);const pv=Number(p.proposal_view_count||0);parts.push(pv?`<span class="pill ok">👁 Proposta vista · ${pv}x</span>`:'<span class="pill muted">Proposta · por abrir</span>');if(Number(p.guide_open_count||0)>0)parts.push(`<span class="pill ok">📖 Ebook visto · ${Number(p.guide_open_count||0)}x</span>`);if(p.outreach_response==='accepted')parts.push('<span class="pill ok">✓ Aceitou</span>');else if(p.outreach_response==='rejected')parts.push('<span class="pill err">✕ Rejeitou</span>')}return `<div style="display:flex;gap:5px;flex-wrap:wrap;min-width:180px">${parts.join('')}</div>`}
  function buildProposal(p){const company=(p.company||p.name||'a sua empresa').trim();return `Assunto: ${company} — as redes ficaram para depois?\n\nOlá,\n\nJá publicou com frequência, depois parou… ou vai publicando quando consegue?\n\nNão se desgaste com mais uma tarefa que precisa de acompanhamento diário para dar resultados.\n\nA DUIT ajuda a aliviar essa tarefa e trata das suas redes sociais por si.\n\nPor isso criámos o DUIT Start: uma forma simples de experimentar primeiro e perceber como podemos trabalhar a comunicação da sua empresa.\n\nVeja como podemos tornar isto mais simples para si. 🙂`}
  function landingPageOptions(){return `<option value="">— sem Landing Page —</option>${crmLandingPages.filter(p=>p.is_active&&p.slug!=='site-duit').map(p=>`<option value="${p.id}">${safe(p.title)}</option>`).join('')}`}
  function emailTemplateOptions(){const active=crmEmailTemplates.filter(t=>Number(t.is_active)===1),def=active.find(t=>Number(t.is_default)===1);return `<option value="">— usar predefinido${def?' · '+safe(def.name):''} —</option>${active.map(t=>`<option value="${t.id}">${safe(t.name)}${Number(t.is_default)===1?' · predefinida':''}</option>`).join('')}`}
  function installStyles(){if(document.getElementById('crm-prospect-styles'))return;const s=document.createElement('style');s.id='crm-prospect-styles';s.textContent='.crm-toolbar{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 14px}.crm-toolbar input,.crm-toolbar select{min-height:40px}.crm-toolbar .crm-search{flex:1;min-width:260px}.crm-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-bottom:16px}.crm-kpi{padding:16px;border:1px solid var(--line);border-radius:14px;background:var(--card)}.crm-kpi b{font-family:\'Clash Display\';font-size:26px;display:block;margin-top:4px}.crm-actions{display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap}.crm-contact-links{display:flex;gap:8px;flex-wrap:wrap;margin-top:5px;font-size:12px}.crm-contact-links a{color:var(--ink);text-decoration:underline;text-underline-offset:2px}.crm-modal-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px 16px;align-items:start}.crm-modal-grid>.field{min-width:0;margin:0}.crm-modal-grid>.field input,.crm-modal-grid>.field select,.crm-modal-grid>.field textarea{width:100%;box-sizing:border-box}.crm-modal-grid>.field>div[style*="font-size:12px"]{min-height:34px;line-height:1.35}.crm-modal-grid .span-2{grid-column:1/-1}.crm-proposal-box{background:var(--bg-2);border:1px solid var(--line);border-radius:12px;padding:12px}.crm-proposal-box textarea{min-height:330px;font-family:inherit;font-size:13px;line-height:1.55}.crm-plan-preview{font-size:12px;color:var(--muted);padding:8px 10px;background:var(--bg-2);border-radius:8px;margin-top:6px}.crm-email-preview{grid-column:1/-1;border:1px solid var(--line);background:var(--bg-2);border-radius:12px;padding:14px 16px;min-width:0;max-height:620px;overflow:auto}.crm-email-preview .eyebrow{margin-bottom:4px}.crm-email-preview .subject{font-weight:700;margin:5px 0 10px}.crm-email-preview .body{white-space:pre-wrap;font-size:13px;line-height:1.5;color:var(--ink)}.crm-save-state{font-size:12px;color:var(--muted);align-self:center}.crm-sort{cursor:pointer;user-select:none;white-space:nowrap}.crm-table{min-width:1540px;table-layout:fixed}.crm-table th:nth-child(1){width:240px}.crm-table th:nth-child(2){width:180px}.crm-table th:nth-child(3){width:115px}.crm-table th:nth-child(4){width:125px}.crm-table th:nth-child(5){width:230px}.crm-table th:nth-child(6){width:120px}.crm-table th:nth-child(7){width:105px}.crm-table th:nth-child(8){width:150px}.crm-table th:nth-child(9){width:110px}.crm-table th:nth-child(10){width:55px}.crm-table td{vertical-align:top}@media(max-width:1100px){.crm-kpis{grid-template-columns:repeat(3,1fr)}}@media(max-width:900px){.crm-kpis{grid-template-columns:1fr 1fr}.crm-modal-grid{grid-template-columns:1fr}.crm-modal-grid .span-2{grid-column:auto}}';document.head.appendChild(s)}
  let crmSectorAutoSaveTimer=null;
  let crmSectorPopulating=false;

  function crmSectorEditorHtml({modal=false}={}){
    return `
      <form id="crm-sector-form">
        <input type="hidden" id="crm-sector-name">
        <div id="crm-sector-empty" class="empty" style="padding:50px 12px">Escolha uma área.</div>
        <div id="crm-sector-fields" style="display:none">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">
            <div><div class="eyebrow">Área</div><h3 id="crm-sector-title" style="margin:3px 0"></h3></div>
            <div style="display:flex;align-items:center;gap:10px"><span id="crm-sector-save-state" style="font-size:12px;color:var(--muted)"></span><span id="crm-sector-count" class="pill muted"></span></div>
          </div>
          <div class="field"><label>Headline do email</label><input id="crm-sector-headline"></div>
          <div class="field"><label>Subheadline</label><textarea id="crm-sector-subheadline" rows="2"></textarea></div>
          <div class="field"><label>Landing Page do botão “Saber mais”</label><select id="crm-sector-lp"><option value="">— sem Landing Page —</option></select><div style="font-size:11px;color:var(--muted);margin-top:5px">O CTA dos emails desta área abre esta Landing Page.</div></div>

          <div style="padding:14px;border:1px solid var(--line);border-radius:14px;margin:16px 0">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
              <div><div class="eyebrow">Galeria da área</div><strong>Imagens para usar nos emails e LP</strong></div>
              <label class="btn btn-yellow" style="cursor:pointer">+ Adicionar imagens<input id="crm-sector-upload" type="file" accept="image/jpeg,image/png,image/webp" multiple hidden></label>
            </div>
            <div id="crm-sector-gallery" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:12px"></div>
          </div>

          <div style="margin:16px 0 8px"><div class="eyebrow">Imagens escolhidas</div><strong>Hero + 4 imagens de apoio</strong></div>
          <div id="crm-sector-selected-images" style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-bottom:18px"></div>

          <div style="margin:18px 0 10px"><div class="eyebrow">Vantagens para este negócio</div><strong>Conteúdo específico desta área.</strong></div>
          <div class="grid g-2" style="gap:12px">
            ${[1,2,3,4].map(n=>`<div style="padding:12px;border:1px solid var(--line);border-radius:12px"><div class="field"><label>Vantagem ${n}</label><input id="crm-sector-adv-title-${n}"></div><div class="field"><label>Texto curto</label><textarea id="crm-sector-adv-text-${n}" rows="2"></textarea></div></div>`).join('')}
          </div>
          ${modal?'<div class="modal-actions" style="margin-top:18px"><div class="spacer"></div><button type="button" class="btn btn-ghost" onclick="closeCrmSectorContent()">Fechar</button></div>':''}
        </div>
      </form>`;
  }

  function bindCrmSectorEditor(){
    const form=document.getElementById('crm-sector-form');
    if(form&&!form.dataset.bound){
      form.dataset.bound='1';
      form.addEventListener('submit',e=>{e.preventDefault();saveCrmSectorContent(e,false)});
      form.addEventListener('input',scheduleCrmSectorAutoSave);
      form.addEventListener('change',scheduleCrmSectorAutoSave);
    }
    const upload=document.getElementById('crm-sector-upload');
    if(upload&&!upload.dataset.bound){upload.dataset.bound='1';upload.addEventListener('change',uploadCrmSectorImages)}
  }

  function renderCrmSectorPageList(){
    const box=document.getElementById('crm-sector-page-list');if(!box)return;
    if(!crmSectorContent.length){box.innerHTML='<div class="empty">Ainda não existem áreas.</div>';return}
    box.innerHTML=`<div class="card" style="padding:0;overflow:hidden">
      <div style="display:grid;grid-template-columns:minmax(220px,1.4fr) 110px minmax(220px,1fr) 100px;gap:12px;padding:12px 16px;border-bottom:1px solid var(--line);font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em">
        <div>Área</div><div>Prospects</div><div>Landing Page</div><div></div>
      </div>
      ${crmSectorContent.map((s,i)=>{
        const lp=(crmLandingPages||[]).find(x=>Number(x.id)===Number(s.landing_page_id));
        return `<div style="display:grid;grid-template-columns:minmax(220px,1.4fr) 110px minmax(220px,1fr) 100px;gap:12px;align-items:center;padding:14px 16px;border-bottom:1px solid var(--line)">
          <div><strong>${safe(s.sector)}</strong></div>
          <div><span class="pill muted">${Number(s.prospect_count||0)}</span></div>
          <div style="font-size:12px;color:var(--muted)">${lp?safe(lp.title||lp.slug):'—'}</div>
          <div style="text-align:right"><button type="button" class="btn btn-ghost btn-sm" onclick="editCrmSectorPage(${i})">Editar</button></div>
        </div>`;
      }).join('')}
    </div>`;
  }

  window.editCrmSectorPage=async index=>{
    const list=document.getElementById('crm-sector-page-list');
    const editor=document.getElementById('crm-sector-page-editor');
    if(list)list.style.display='none';
    if(editor)editor.style.display='';
    await selectCrmSectorContent(index);
    document.getElementById('crm-sector-page-editor')?.scrollIntoView({behavior:'smooth',block:'start'});
  };

  window.closeCrmSectorPageEditor=()=>{
    clearTimeout(crmSectorAutoSaveTimer);
    document.getElementById('crm-sector-page-editor')?.style.setProperty('display','none');
    document.getElementById('crm-sector-page-list')?.style.removeProperty('display');
  };

  window.duitViewAreas=async main=>{
    if(!main)return;
    document.getElementById('modal-crm-sectors')?.remove();
    main.innerHTML=`
      <div class="page-head"><div><div class="eyebrow">Landing Pages</div><h1>Áreas</h1><p class="lede">Conteúdo, imagens e Landing Page associados a cada área.</p></div></div>
      <div id="crm-sector-page-list"><div class="empty">A carregar áreas…</div></div>
      <div id="crm-sector-page-editor" style="display:none">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px">
          <button type="button" class="btn btn-ghost" onclick="closeCrmSectorPageEditor()">← Voltar à listagem</button>
          <span style="font-size:12px;color:var(--muted)">As alterações são guardadas automaticamente.</span>
        </div>
        <div class="card" style="padding:20px">${crmSectorEditorHtml()}</div>
      </div>`;
    try{
      const [sectors,lps]=await Promise.all([
        api('/api/crm/prospect-sectors'),
        api('/api/admin/landing-pages').catch(()=>crmLandingPages||[])
      ]);
      crmSectorContent=sectors||[];
      crmLandingPages=lps||crmLandingPages||[];
      renderCrmSectorPageList();
      bindCrmSectorEditor();
    }catch(e){
      const box=document.getElementById('crm-sector-page-list');if(box)box.innerHTML='<div class="empty">Erro: '+safe(e.message)+'</div>';
    }
  };

  function ensureSectorContentModal(){
    if(document.getElementById('modal-crm-sectors'))return;
    const wrap=document.createElement('div');
    wrap.className='overlay';
    wrap.id='modal-crm-sectors';
    wrap.innerHTML=`<div class="modal wide" style="max-width:1120px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
        <div><div class="eyebrow">Emails visuais</div><h3 style="margin:4px 0">Conteúdo por área</h3><p class="lede">Edite os conteúdos e imagens de cada área.</p></div>
        <button type="button" class="btn btn-icon" onclick="closeCrmSectorContent()">✕</button>
      </div>
      <div style="display:grid;grid-template-columns:250px minmax(0,1fr);gap:18px;margin-top:18px">
        <div id="crm-sector-list" style="border-right:1px solid var(--line);padding-right:14px;max-height:700px;overflow:auto"></div>
        ${crmSectorEditorHtml({modal:true})}
      </div>
    </div>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('click',e=>{if(e.target===wrap)closeCrmSectorContent()});
    bindCrmSectorEditor();
  }

  let crmSectorGallery=[];

  function sectorImageSlots(s){
    return [
      ['hero_image','Hero'],
      ['image_1','Imagem 1'],
      ['image_2','Imagem 2'],
      ['image_3','Imagem 3'],
      ['image_4','Imagem 4']
    ].map(([key,label])=>({key,label,url:String(s?.[key]||'')}));
  }

  function renderCrmSectorSelectedImages(){
    const sector=String(document.getElementById('crm-sector-name')?.value||'');
    const s=crmSectorContent.find(x=>String(x.sector)===sector)||{};
    const box=document.getElementById('crm-sector-selected-images');if(!box)return;
    box.innerHTML=sectorImageSlots(s).map(slot=>`<div style="border:1px solid var(--line);border-radius:12px;padding:7px;min-height:120px"><div style="font-size:10px;font-weight:700;margin-bottom:6px">${slot.label}</div>${slot.url?`<img src="${safe(slot.url)}" style="width:100%;height:82px;object-fit:cover;border-radius:8px"><button type="button" class="btn btn-ghost btn-sm" style="width:100%;margin-top:5px" onclick="clearCrmSectorImageSlot('${slot.key}')">Remover</button>`:'<div style="height:82px;border:1px dashed var(--line);border-radius:8px;display:grid;place-items:center;font-size:11px;color:var(--muted)">Escolha na galeria</div>'}</div>`).join('');
  }

  function renderCrmSectorGallery(){
    const box=document.getElementById('crm-sector-gallery');if(!box)return;
    if(!crmSectorGallery.length){box.innerHTML='<div class="empty" style="grid-column:1/-1;padding:18px">Ainda não adicionou imagens a esta área.</div>';return}
    box.innerHTML=crmSectorGallery.map(img=>`<div style="border:1px solid var(--line);border-radius:12px;padding:6px;position:relative">
      <img src="${safe(img.url)}" alt="" style="width:100%;height:105px;object-fit:cover;border-radius:8px">
      <select style="width:100%;margin-top:6px;font-size:11px" onchange="assignCrmSectorImage(${img.id},this.value);this.value=''">
        <option value="">Usar como…</option><option value="hero_image">Hero</option><option value="image_1">Imagem 1</option><option value="image_2">Imagem 2</option><option value="image_3">Imagem 3</option><option value="image_4">Imagem 4</option>
      </select>
      <button type="button" class="btn btn-icon" title="Apagar imagem" style="position:absolute;right:8px;top:8px;background:#fff" onclick="deleteCrmSectorImage(${img.id})">×</button>
    </div>`).join('');
  }

  function crmAreaLandingPageOptions(selected=''){
    const current=String(selected||'');
    const pages=(crmLandingPages||[]).filter(lp=>Number(lp.is_active)!==0&&String(lp.slug||'').toLowerCase()!=='site-duit');
    return '<option value="">— sem Landing Page —</option>'+pages.map(lp=>`<option value="${Number(lp.id)}" ${String(lp.id)===current?'selected':''}>${safe(lp.title||lp.slug||('Landing Page '+lp.id))}</option>`).join('');
  }

  function renderCrmSectorList(){
    const box=document.getElementById('crm-sector-list');if(!box)return;
    box.innerHTML=crmSectorContent.length?crmSectorContent.map((s,i)=>`<button type="button" class="btn btn-ghost" style="width:100%;justify-content:space-between;margin-bottom:6px;text-align:left" onclick="selectCrmSectorContent(${i})"><span style="overflow:hidden;text-overflow:ellipsis">${safe(s.sector)}</span><span class="pill muted">${Number(s.prospect_count||0)}</span></button>`).join(''):'<div class="empty">Ainda não existem setores nos prospects.</div>';
  }

  window.openCrmSectorContent=async()=>{
    ensureSectorContentModal();
    document.getElementById('modal-crm-sectors')?.classList.add('open');
    const box=document.getElementById('crm-sector-list');if(box)box.innerHTML='<div class="empty">A carregar setores…</div>';
    try{crmSectorContent=await api('/api/crm/prospect-sectors');renderCrmSectorList()}
    catch(e){if(box)box.innerHTML='<div class="empty">Erro: '+safe(e.message)+'</div>'}
  };
  window.closeCrmSectorContent=()=>document.getElementById('modal-crm-sectors')?.classList.remove('open');

  window.selectCrmSectorContent=async index=>{
    const s=crmSectorContent[Number(index)];if(!s)return;
    crmSectorPopulating=true;
    document.getElementById('crm-sector-empty').style.display='none';
    document.getElementById('crm-sector-fields').style.display='';
    document.getElementById('crm-sector-title').textContent=s.sector||'Setor';
    document.getElementById('crm-sector-count').textContent=(Number(s.prospect_count||0))+' prospects';
    const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v||''};
    set('crm-sector-name',s.sector);set('crm-sector-headline',s.headline);set('crm-sector-subheadline',s.subheadline);const lpSel=document.getElementById('crm-sector-lp');if(lpSel){lpSel.innerHTML=crmAreaLandingPageOptions(s.landing_page_id);lpSel.value=s.landing_page_id||'';}
    [1,2,3,4].forEach(n=>{set('crm-sector-adv-title-'+n,s['advantage_'+n+'_title']);set('crm-sector-adv-text-'+n,s['advantage_'+n+'_text'])});
    try{crmSectorGallery=await api('/api/crm/prospect-sectors/'+encodeURIComponent(s.sector)+'/images')}catch(_){crmSectorGallery=[]}
    renderCrmSectorGallery();renderCrmSectorSelectedImages();
    crmSectorPopulating=false;
  };

  function currentCrmSector(){
    const name=String(document.getElementById('crm-sector-name')?.value||'');
    return crmSectorContent.find(x=>String(x.sector)===name);
  }

  window.assignCrmSectorImage=(id,slot)=>{
    if(!slot)return;const s=currentCrmSector(),img=crmSectorGallery.find(x=>Number(x.id)===Number(id));if(!s||!img)return;
    s[slot]=img.url;renderCrmSectorSelectedImages();scheduleCrmSectorAutoSave();
  };
  window.clearCrmSectorImageSlot=slot=>{const s=currentCrmSector();if(!s)return;s[slot]='';renderCrmSectorSelectedImages();scheduleCrmSectorAutoSave()};

  async function compressSectorImage(file){
    const bitmap=await createImageBitmap(file);
    const maxW=1200,maxH=800,scale=Math.min(1,maxW/bitmap.width,maxH/bitmap.height);
    const w=Math.max(1,Math.round(bitmap.width*scale)),h=Math.max(1,Math.round(bitmap.height*scale));
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    canvas.getContext('2d').drawImage(bitmap,0,0,w,h);
    bitmap.close?.();
    return canvas.toDataURL('image/jpeg',0.82);
  }

  async function uploadCrmSectorImages(e){
    const sector=String(document.getElementById('crm-sector-name')?.value||'').trim(),files=[...(e.target.files||[])];
    if(!sector||!files.length)return;
    const label=e.target.closest('label'),old=label?.firstChild?.textContent;
    try{
      if(label)label.childNodes[0].textContent='A carregar…';
      for(const file of files){
        if(!/^image\//.test(file.type))continue;
        const data_url=await compressSectorImage(file);
        await api('/api/crm/prospect-sectors/'+encodeURIComponent(sector)+'/images',{method:'POST',body:{filename:file.name,data_url}});
      }
      crmSectorGallery=await api('/api/crm/prospect-sectors/'+encodeURIComponent(sector)+'/images');
      renderCrmSectorGallery();toast('Imagem(ns) adicionada(s) à galeria.','check');
    }catch(err){toast(err.message||'Não foi possível carregar a imagem.','cancel')}
    finally{e.target.value='';if(label)label.childNodes[0].textContent='+ Adicionar imagens'}
  }

  window.deleteCrmSectorImage=async id=>{
    if(!confirm('Apagar esta imagem da galeria?'))return;
    try{
      await api('/api/crm/prospect-sector-images/'+id,{method:'DELETE'});
      const sector=String(document.getElementById('crm-sector-name')?.value||'');
      crmSectorGallery=await api('/api/crm/prospect-sectors/'+encodeURIComponent(sector)+'/images');
      const s=currentCrmSector();if(s){const url='/api/public/prospect-sector-images/'+id;['hero_image','image_1','image_2','image_3','image_4'].forEach(k=>{if(s[k]===url)s[k]=''})}
      renderCrmSectorGallery();renderCrmSectorSelectedImages();
    }catch(err){toast(err.message||'Não foi possível apagar a imagem.','cancel')}
  };

  function scheduleCrmSectorAutoSave(){
    if(crmSectorPopulating)return;
    const sector=String(document.getElementById('crm-sector-name')?.value||'').trim();
    if(!sector)return;
    clearTimeout(crmSectorAutoSaveTimer);
    const state=document.getElementById('crm-sector-save-state');
    if(state){state.textContent='A guardar…';state.style.color='var(--muted)'}
    crmSectorAutoSaveTimer=setTimeout(()=>saveCrmSectorContent(null,true),650);
  }

  async function saveCrmSectorContent(e,silent=false){
    e?.preventDefault?.();
    const sector=String(document.getElementById('crm-sector-name')?.value||'').trim(),s=currentCrmSector();if(!sector||!s)return;
    const body={
      headline:document.getElementById('crm-sector-headline')?.value||'',
      subheadline:document.getElementById('crm-sector-subheadline')?.value||'',
      landing_page_id:Number(document.getElementById('crm-sector-lp')?.value||0)||null,
      hero_image:s.hero_image||'',image_1:s.image_1||'',image_2:s.image_2||'',image_3:s.image_3||'',image_4:s.image_4||''
    };
    [1,2,3,4].forEach(n=>{body['advantage_'+n+'_title']=document.getElementById('crm-sector-adv-title-'+n)?.value||'';body['advantage_'+n+'_text']=document.getElementById('crm-sector-adv-text-'+n)?.value||''});
    const state=document.getElementById('crm-sector-save-state');
    try{
      await api('/api/crm/prospect-sectors/'+encodeURIComponent(sector),{method:'PUT',body});
      Object.assign(s,body);
      if(state){state.textContent='Guardado';state.style.color='var(--ok, #2d8a4e)'}
      if(!silent)toast('Conteúdo da área guardado.','check');
      renderCrmSectorPageList();
      if(document.getElementById('modal-crm-prospect')?.classList.contains('open'))crmRefreshEmailPreview();
    }catch(err){
      if(state){state.textContent='Erro ao guardar';state.style.color='var(--danger, #c33)'}
      if(!silent)toast(err.message||'Não foi possível guardar a área.','cancel');
    }
  }

  function crmSectorOptions(selected=''){
    const current=String(selected||'').trim();
    const names=[...new Set((crmProspects||[]).map(x=>String(x.sector||'').trim()).filter(Boolean))];
    if(current&&!names.some(x=>x.toLowerCase()===current.toLowerCase()))names.push(current);
    names.sort((a,b)=>a.localeCompare(b,'pt-PT',{sensitivity:'base'}));
    return '<option value="">— escolher setor —</option>'+names.map(name=>`<option value="${safe(name)}" ${name===current?'selected':''}>${safe(name)}</option>`).join('');
  }
  function crmEmailAreaOptions(selected=''){
    const current=String(selected||'').trim();
    const names=(crmSectorContent||[]).map(x=>String(x.sector||'').trim()).filter(Boolean);
    return '<option value="">— escolher área —</option>'+names.map(name=>`<option value="${safe(name)}" ${name===current?'selected':''}>${safe(name)}</option>`).join('');
  }
  function refreshCrmSectorSelect(selected){
    const el=document.getElementById('crm-sector');if(!el)return;
    const value=selected!==undefined?String(selected||''):el.value;
    el.innerHTML=crmSectorOptions(value);
    if(value)el.value=value;
  }
  function refreshCrmEmailAreaSelect(selected){
    const el=document.getElementById('crm-email-area');if(!el)return;
    const value=selected!==undefined?String(selected||''):el.value;
    el.innerHTML=crmEmailAreaOptions(value);
    if(value)el.value=value;
  }

  function ensureModal(){if(document.getElementById('modal-crm-prospect'))return;const wrap=document.createElement('div');wrap.className='overlay';wrap.id='modal-crm-prospect';wrap.innerHTML=`<div class="modal wide" style="max-width:980px"><div style="display:flex;justify-content:space-between;align-items:start;gap:10px"><div><h3 id="crm-modal-title">Novo prospect</h3><p class="lede">Dados comerciais, proposta e acompanhamento num só sítio.</p></div><button type="button" class="btn btn-icon" onclick="closeCrmProspect()">✕</button></div><form id="crmProspectForm"><input type="hidden" id="crm-id"><div class="crm-modal-grid"><div class="field"><label>Empresa *</label><input id="crm-company" required></div><div class="field"><label>Nome / contacto</label><input id="crm-name"></div><div class="field"><label>Email *</label><input id="crm-email" type="email" required></div><div class="field"><label>Telefone</label><input id="crm-phone"></div><div class="field"><label>Setor</label><select id="crm-sector" onchange="scheduleAutoSave()"><option value="">— escolher setor —</option></select></div><div class="field"><label>Área do email</label><select id="crm-email-area" onchange="crmEmailAreaChanged()"><option value="">— escolher área —</option></select></div><div class="field"><label>Localidade</label><input id="crm-location"></div><div class="field"><label>Website</label><input id="crm-website"></div><div class="field"><label>Instagram</label><input id="crm-instagram"></div><div class="field span-2"><label>Problema / oportunidade</label><textarea id="crm-opportunity" rows="3"></textarea></div><div class="field span-2"><label>Ideia / ângulo comercial</label><textarea id="crm-idea" rows="3"></textarea></div><div class="field"><label>Prioridade</label><select id="crm-priority"><option value="atacar">🔥 Atacar</option><option value="possivel">🟡 Possível</option><option value="nao_prioritario">Não prioritário</option></select></div><div class="field"><label>Estado</label><select id="crm-status">${Object.entries(STATUS).map(([k,v])=>`<option value="${k}">${v[0]}</option>`).join('')}</select></div><div class="field"><label>Solução recomendada</label><select id="crm-plan" onchange="crmApplyPlan()"><option value="">— definir —</option><option value="base">Base — 150€/mês</option><option value="intermedio">Intermédio — 200€/mês</option><option value="premium">Premium — 280€/mês</option><option value="personalizado">Personalizado</option></select><div id="crm-plan-preview" class="crm-plan-preview" style="display:none"></div></div><div class="field"><label>Valor mensal</label><input id="crm-monthly" type="number" min="0"></div><div class="field"><label>1.º contacto</label><input id="crm-first-contact" type="date"></div><div class="field"><label>Follow-up</label><input id="crm-followup" type="date"></div><div class="field"><label>Abordagem</label><select id="crm-email-template" onchange="crmChooseEmailTemplate(this.value)"></select><div style="font-size:12px;color:var(--muted);margin-top:6px">Define o email e a DM. <button type="button" class="btn btn-ghost btn-sm" style="margin-left:6px" onclick="openProspectApproaches()">Gerir abordagens</button></div></div><div class="field"><label>Landing Page a enviar</label><select id="crm-landing-page" onchange="crmChooseLandingPage(this.value)"></select><div style="font-size:12px;color:var(--muted);margin-top:6px">Se escolher uma Landing Page, é usado o email associado a essa LP.</div></div><div id="crm-email-preview" class="crm-email-preview"><div class="eyebrow">Preview do email</div><div class="subject">A carregar…</div><div class="body"></div></div><div class="field span-2" id="crm-dm-control"><div style="padding:14px;border:1px solid var(--line);border-radius:12px;background:var(--bg-2)"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><div><div class="eyebrow">Instagram / DM</div><strong>Contacto manual com controlo no CRM</strong></div><select id="crm-dm-status" style="max-width:220px"><option value="por_enviar">DM pronta</option><option value="enviado">Enviada</option><option value="respondeu">Respondeu</option><option value="interessado">Interessado</option><option value="sem_interesse">Sem interesse</option><option value="cancelado">Cancelado — não contactar</option></select></div><label style="margin-top:12px">Mensagem pronta</label><textarea id="crm-dm-message" rows="6" placeholder="Mensagem personalizada para Instagram"></textarea><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:9px"><button type="button" class="btn btn-yellow" id="crm-open-dm" onclick="crmOpenCopyDmCurrent()">Abrir Instagram + copiar DM</button><button type="button" class="btn btn-ghost" onclick="crmApplyApproachToDm()">↻ Aplicar abordagem</button><button type="button" class="btn btn-ghost" onclick="crmSetDmCurrent('enviado')">✓ Marcar enviada</button><button type="button" class="btn btn-ghost" onclick="crmSetDmCurrent('respondeu')">💬 Respondeu</button><button type="button" class="btn btn-ghost" onclick="crmSetDmCurrent('interessado')">⭐ Interessado</button><button type="button" class="btn btn-ghost" onclick="crmSetDmCurrent('sem_interesse')">Sem interesse</button><button type="button" class="btn btn-ghost" onclick="crmSetDmCurrent('cancelado')">⛔ Cancelar contacto</button></div><div id="crm-dm-hint" style="font-size:12px;color:var(--muted);margin-top:8px"></div></div></div><div class="field span-2"><label>Notas</label><textarea id="crm-notes" rows="3"></textarea></div></div><div class="modal-actions"><button type="button" class="btn btn-danger" id="crm-delete" style="display:none" onclick="crmDeleteCurrent()">Apagar</button><button type="button" class="btn btn-ghost" id="crm-optout" style="display:none" onclick="crmOptOutCurrent()">⛔ Não contactar</button><span id="crm-save-state" class="crm-save-state"></span><div class="spacer"></div><button type="button" class="btn btn-ghost" id="crm-native-send" style="display:none" onclick="crmSendCurrentProspect()">✉ Enviar email</button><button type="button" class="btn btn-ghost" onclick="closeCrmProspect()">Fechar</button><button type="submit" class="btn btn-yellow" id="crm-save-button">Guardar prospect</button></div></form></div>`;document.body.appendChild(wrap);wrap.addEventListener('click',e=>{if(e.target===wrap)closeCrmProspect()});const form=document.getElementById('crmProspectForm');form.addEventListener('submit',saveCrmProspect);form.addEventListener('input',scheduleAutoSave);form.addEventListener('change',scheduleAutoSave);['crm-company','crm-name','crm-opportunity','crm-idea'].forEach(id=>document.getElementById(id)?.addEventListener('input',crmRefreshEmailPreview));['crm-sector','crm-email-area'].forEach(id=>document.getElementById(id)?.addEventListener('change',crmRefreshEmailPreview))}
  async function loadProspects(){const [prospects,statuses,lps,emailTemplates,socialRows,sectors]=await Promise.all([api('/api/crm/prospects'),api('/api/crm/prospects/email-status'),api('/api/admin/landing-pages'),api('/api/admin/prospect-email-templates').catch(()=>[]),api('/api/crm/prospects/social').catch(()=>[]),api('/api/crm/prospect-sectors').catch(()=>[])]);crmLandingPages=lps||[];crmEmailTemplates=emailTemplates||[];crmSectorContent=sectors||[];const sm=new Map((statuses||[]).map(s=>[Number(s.user_id),s])),soc=new Map((socialRows||[]).map(s=>[Number(s.user_id),s]));crmProspects=(prospects||[]).map(p=>({...p,...(sm.get(Number(p.id))||{}),...(soc.get(Number(p.id))||{})}));window.duitCrmProspectsCache=crmProspects;window.duitCrmLandingPagesCache=crmLandingPages;window.duitCrmEmailTemplatesCache=crmEmailTemplates;return crmProspects}
  function filteredProspects(){const q=crmFilter.q.trim().toLowerCase();const list=crmProspects.filter(p=>{if(crmSocialFilter!=='all'&&crmSocialState(p)!==crmSocialFilter)return false;if(crmFilter.status!=='all'){if(crmFilter.status==='falta_contactar'&&p.lead_status!=='por_contactar')return false;if(crmFilter.status==='contactado'&&p.lead_status!=='contactado')return false;if(crmFilter.status==='nao_abriu'&&(!p.email_sent_at||p.email_first_opened_at))return false;if(crmFilter.status==='email_visto'&&(!p.email_sent_at||(!p.email_first_opened_at&&Number(p.email_open_count||0)<=0)))return false;if(crmFilter.status==='nao_respondeu'&&(!p.email_sent_at||p.outreach_response))return false}if(crmFilter.priority!=='all'&&p.priority!==crmFilter.priority)return false;if(crmFilter.proposal==='vista'&&Number(p.proposal_view_count||0)<=0)return false;if(crmFilter.proposal==='por_abrir'&&(!p.email_sent_at||Number(p.proposal_view_count||0)>0))return false;if(!q)return true;return[p.company,p.name,p.email,p.phone,p.sector,p.email_area,p.location,p.opportunity,p.idea,p.notes].filter(Boolean).join(' ').toLowerCase().includes(q)});const stamp=(p,field)=>{const raw=field==='activity'?(p.email_sent_at||p.email_first_sent_at):(field==='first'?p.email_first_sent_at:p.email_sent_at);return raw?new Date(String(raw).replace(' ','T')+'Z').getTime():0};return list.sort((a,b)=>{const av=stamp(a,crmDateSortField),bv=stamp(b,crmDateSortField);if(av===bv)return Number(b.id)-Number(a.id);if(!av)return 1;if(!bv)return -1;return crmDateSort==='asc'?av-bv:bv-av})}
  function crmApproachName(p){
    if(p.landing_page_id){
      const lp=crmLandingPages.find(x=>Number(x.id)===Number(p.landing_page_id));
      if(lp)return lp.title||'Landing Page';
    }
    if(p.email_template_id){
      const t=crmEmailTemplates.find(x=>Number(x.id)===Number(p.email_template_id));
      if(t)return t.name||'Abordagem';
    }
    const def=crmEmailTemplates.find(x=>Number(x.is_default)===1&&Number(x.is_active)===1)||crmEmailTemplates.find(x=>Number(x.is_active)===1);
    return def?.name||'Abordagem predefinida';
  }

  function crmApproachStatsHtml(){
    const groups=new Map();
    const siteLpIds=new Set(
      crmLandingPages
        .filter(lp=>String(lp.slug||'').toLowerCase()==='site-duit')
        .map(lp=>Number(lp.id))
    );

    for(const p of crmProspects){
      // O site institucional não é uma abordagem de prospeção.
      if(p.landing_page_id && siteLpIds.has(Number(p.landing_page_id))) continue;

      const name=crmApproachName(p);
      if(!groups.has(name))groups.set(name,{
        name,total:0,sent:0,resendKnown:0,delivered:0,opened:0,clicked:0,
        proposal:0,replied:0,interested:0
      });
      const g=groups.get(name);
      g.total++;

      if(!p.email_sent_at) continue;
      g.sent++;

      const rs=String(p.resend_status||'').toLowerCase();
      const knownStatuses=['sent','delivered','opened','clicked','delivery_delayed','bounced','complained','suppressed','failed'];
      if(knownStatuses.includes(rs)) g.resendKnown++;
      if(['delivered','opened','clicked'].includes(rs)) g.delivered++;
      if(rs==='clicked') g.clicked++;

      if(p.email_first_opened_at||Number(p.email_open_count||0)>0)g.opened++;
      if(Number(p.proposal_view_count||0)>0)g.proposal++;
      if(['respondeu','interessado','proposta'].includes(String(p.lead_status||''))||String(p.outreach_response||''))g.replied++;
      if(['interessado','proposta'].includes(String(p.lead_status||''))||String(p.outreach_response||'')==='accepted')g.interested++;
    }

    const MIN_SAMPLE=30;
    const pct=(n,d)=>d?Math.round(n/d*100):0;
    const rows=[...groups.values()].filter(g=>g.sent>0).sort((a,b)=>{
      const ar=a.sent?a.opened/a.sent:0,br=b.sent?b.opened/b.sent:0;
      return br-ar||b.sent-a.sent;
    });

    if(!rows.length)return '<div class="card" style="padding:18px;margin-bottom:16px"><div class="eyebrow">Performance por abordagem</div><strong>Ainda não existem envios suficientes para comparar abordagens.</strong></div>';

    const eligible=rows.filter(g=>g.sent>=MIN_SAMPLE);
    const best=eligible.length?eligible[0]:null;

    const deliveryCell=g=>{
      const coverage=pct(g.resendKnown,g.sent);
      const rate=g.resendKnown?pct(g.delivered,g.resendKnown):0;
      if(!g.resendKnown)return '<span style="color:var(--muted)">—</span><div style="font-size:10px;color:var(--muted);margin-top:2px">sem dados Resend</div>';
      return `<strong>${g.delivered}</strong><div style="font-size:10px;color:var(--muted);margin-top:2px">${rate}% dos confirmados · cobertura ${coverage}%</div>`;
    };

    const rateCell=(value,base,label='')=>`<strong>${pct(value,base)}%</strong><div style="font-size:10px;color:var(--muted);margin-top:2px">${value}/${base}${label?' · '+label:''}</div>`;

    return `<div class="card" style="padding:18px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap;margin-bottom:14px">
        <div>
          <div class="eyebrow">Performance por abordagem</div>
          <h3 style="margin:3px 0 4px">O que está a funcionar melhor</h3>
          <div style="font-size:12px;color:var(--muted)">Funil por abordagem: envio → entrega → abertura → clique/proposta → resposta → interesse.</div>
        </div>
        <div style="padding:10px 12px;border-radius:10px;background:var(--bg-2);font-size:12px">
          <span style="color:var(--muted)">Melhor taxa de abertura</span><br>
          <strong>${best?safe(best.name)+' · '+pct(best.opened,best.sent)+'%':'Amostra insuficiente'}</strong>
          ${best?'<div style="font-size:10px;color:var(--muted);margin-top:2px">'+best.opened+'/'+best.sent+' abertos</div>':'<div style="font-size:10px;color:var(--muted);margin-top:2px">mínimo '+MIN_SAMPLE+' envios</div>'}
        </div>
      </div>

      <div style="overflow-x:auto">
        <table class="table" style="min-width:1180px">
          <thead><tr>
            <th>Abordagem</th>
            <th>Enviados</th>
            <th>Entregues</th>
            <th>Taxa entrega</th>
            <th>Abertos</th>
            <th>Taxa abertura</th>
            <th>Cliques</th>
            <th>Proposta vista</th>
            <th>Responderam</th>
            <th>Interesse</th>
          </tr></thead>
          <tbody>${rows.map(g=>{
            const coverage=pct(g.resendKnown,g.sent);
            const deliveryRate=g.resendKnown?pct(g.delivered,g.resendKnown):0;
            return `<tr>
              <td>
                <strong>${safe(g.name)}</strong>
                <div style="font-size:11px;color:var(--muted)">${g.total} prospect${g.total===1?'':'s'} associados</div>
              </td>
              <td><strong>${g.sent}</strong></td>
              <td>${deliveryCell(g)}</td>
              <td>
                ${coverage>=80
                  ? rateCell(g.delivered,g.resendKnown)
                  : '<strong>—</strong><div style="font-size:10px;color:var(--muted);margin-top:2px">cobertura Resend '+coverage+'% · incompleta</div>'}
              </td>
              <td><strong>${g.opened}</strong></td>
              <td>${rateCell(g.opened,g.sent,g.sent<MIN_SAMPLE?'amostra baixa':'')}</td>
              <td>
                <strong>${g.clicked}</strong>
                <div style="font-size:10px;color:var(--muted);margin-top:2px">${g.resendKnown?pct(g.clicked,g.resendKnown):0}% dos confirmados</div>
              </td>
              <td>
                <strong>${g.proposal}</strong>
                <div style="font-size:10px;color:var(--muted);margin-top:2px">${pct(g.proposal,g.sent)}% dos enviados</div>
              </td>
              <td>
                <strong>${g.replied}</strong>
                <div style="font-size:10px;color:var(--muted);margin-top:2px">${pct(g.replied,g.sent)}% dos enviados</div>
              </td>
              <td>
                <strong>${g.interested}</strong>
                <div style="font-size:10px;color:var(--muted);margin-top:2px">${pct(g.interested,g.sent)}% dos enviados</div>
              </td>
            </tr>`;
          }).join('')}</tbody>
        </table>
      </div>

      <div style="font-size:10px;color:var(--muted);margin-top:10px;line-height:1.5">
        Entregues e cliques usam estados confirmados pelo Resend. Quando a cobertura Resend é inferior a 80%, a taxa de entrega não é apresentada para evitar conclusões erradas sobre envios históricos.
      </div>
    </div>`;
  }

  function renderCrmTable(main){const daily=crmDmDailyInfo(),list=filteredProspects(),potential=list.reduce((s,p)=>s+Number(p.monthly_value||0),0),atacar=list.filter(p=>p.priority==='atacar').length,ativos=list.filter(p=>['respondeu','interessado','proposta'].includes(p.lead_status)).length,enviados=list.filter(p=>p.email_sent_at).length;main.innerHTML=`<div class="page-head"><div><div class="eyebrow">Pipeline comercial</div><h1>Prospecção</h1><p class="lede">Encontre o cliente certo, defina a proposta certa e acompanhe tudo sem perder tempo.</p></div><div class="page-head-actions"><button class="btn btn-ghost" onclick="openProspectApproaches()">Abordagens</button><button class="btn btn-yellow" onclick="openCrmProspect()">${svg('plus')} Novo prospect</button></div></div><div class="crm-kpis"><div class="crm-kpi"><div class="eyebrow">Prospects</div><b>${list.length}</b></div><div class="crm-kpi"><div class="eyebrow">🔥 A atacar</div><b>${atacar}</b></div><div class="crm-kpi"><div class="eyebrow">✉️ Enviados</div><b>${enviados}</b></div><div class="crm-kpi"><div class="eyebrow">Em conversa</div><b>${ativos}</b></div><div class="crm-kpi"><div class="eyebrow">Valor potencial / mês</div><b>${fmtMoney(potential)}</b></div></div>${crmApproachStatsHtml()}<div class="crm-toolbar"><input class="crm-search" id="crm-search" placeholder="Pesquisar empresa, setor, localidade..." value="${safe(crmFilter.q)}" oninput="crmSetFilter('q',this.value)"><select onchange="crmSetFilter('priority',this.value)"><option value="all" ${crmFilter.priority==='all'?'selected':''}>Todas as prioridades</option><option value="atacar" ${crmFilter.priority==='atacar'?'selected':''}>🔥 Atacar</option><option value="possivel" ${crmFilter.priority==='possivel'?'selected':''}>🟡 Possível</option><option value="nao_prioritario" ${crmFilter.priority==='nao_prioritario'?'selected':''}>Não prioritário</option></select><select onchange="crmSetFilter('status',this.value)"><option value="all" ${crmFilter.status==='all'?'selected':''}>Todos</option><option value="falta_contactar" ${crmFilter.status==='falta_contactar'?'selected':''}>Falta contactar</option><option value="contactado" ${crmFilter.status==='contactado'?'selected':''}>Contactados</option><option value="nao_abriu" ${crmFilter.status==='nao_abriu'?'selected':''}>Não abriu</option><option value="email_visto" ${crmFilter.status==='email_visto'?'selected':''}>Email visto</option><option value="nao_respondeu" ${crmFilter.status==='nao_respondeu'?'selected':''}>Não respondeu</option></select><select onchange="crmSetFilter('proposal',this.value)"><option value="all" ${crmFilter.proposal==='all'?'selected':''}>Todas as propostas</option><option value="vista" ${crmFilter.proposal==='vista'?'selected':''}>👁 Proposta vista</option><option value="por_abrir" ${crmFilter.proposal==='por_abrir'?'selected':''}>Proposta por abrir</option></select></div>${crmSocialControlHtml()}<div class="card table-card" style="overflow-x:auto">${!list.length?'<div class="empty" style="padding:36px 0">Nenhum prospect com estes filtros.</div>':`<table class="table crm-table"><thead><tr><th>Empresa</th><th>Setor</th><th>Potencial</th><th>Estado</th><th>Contacto</th><th>Abordagem</th><th>Solução</th><th>Valor</th><th class="crm-sort" onclick="event.stopPropagation();crmToggleDateSort('first')">1.º envio ${crmDateSortField==='first'&&crmDateSort!=='none'?(crmDateSort==='asc'?'↑':'↓'):''}</th><th class="crm-sort" onclick="event.stopPropagation();crmToggleDateSort('last')">Último envio ${crmDateSortField==='last'&&crmDateSort!=='none'?(crmDateSort==='asc'?'↑':'↓'):''}</th><th>Follow-up</th><th></th></tr></thead><tbody>${list.map(p=>{const plan=getPlan(p);return `<tr class="interactive" onclick="openCrmProspect(${p.id})"><td><strong>${safe(p.company||p.name)}</strong><div style="font-size:12px;color:var(--muted)">${safe(p.email||'')}${p.phone?' · '+safe(p.phone):''}</div><div class="crm-contact-links">${p.website?`<a href="${safe(p.website)}" target="_blank" onclick="event.stopPropagation()">Website</a>`:''}${p.instagram?(daily.blocked?'<span style="color:var(--muted)">🔒 Instagram bloqueado hoje</span>':`<a href="${safe(p.instagram)}" target="_blank" onclick="event.stopPropagation()">📸 Instagram</a>`):(p.instagram_checked_at?'<span style="color:var(--muted)">— Instagram não encontrado</span>':'<span style="color:var(--muted)">🔎 Instagram por verificar</span>')}</div></td><td>${safe(p.sector||'—')}<div style="font-size:12px;color:var(--muted)">${safe(p.email_area||'')}${p.location?' · '+safe(p.location):''}</div></td><td>${priorityPill(p.priority)}</td><td>${statusPill(p.lead_status)}${crmSocialBadge(p)}</td><td>${contactState(p)}</td><td>${safe((p.landing_page_id&&crmLandingPages.find(lp=>Number(lp.id)===Number(p.landing_page_id))?.title)||crmEmailTemplates.find(t=>Number(t.id)===Number(p.email_template_id)&&Number(t.is_active)===1)?.name||crmEmailTemplates.find(t=>Number(t.is_default)===1&&Number(t.is_active)===1)?.name||crmEmailTemplates.find(t=>Number(t.is_active)===1)?.name||'Abordagem predefinida')}</td><td>${safe(plan?.label||p.recommended_plan||'—')}</td><td><strong>${p.monthly_value?fmtMoney(p.monthly_value):'—'}</strong></td><td>${p.email_first_sent_at?fmtDateTime(p.email_first_sent_at):(p.email_sent_at?fmtDateTime(p.email_sent_at):'—')}</td><td>${p.email_sent_at?fmtDateTime(p.email_sent_at):'—'}${p.email_sent_at?'<div style="margin-top:5px">'+resendState(p)+'</div>':''}</td><td>${p.follow_up_at?fmtDate(p.follow_up_at):'—'}</td><td><div class="crm-actions"><button class="btn btn-icon" title="Não contactar" onclick="event.stopPropagation();crmOptOut(${p.id},${JSON.stringify(p.company||p.name||'Prospect')})">⛔</button><button class="btn btn-icon" title="Abrir" onclick="event.stopPropagation();openCrmProspect(${p.id})">${svg('edit')}</button></div></td></tr>`}).join('')}</tbody></table>`}</div>`}
  window.viewProspects=async main=>{installStyles();ensureModal();try{await loadProspects();renderCrmTable(main)}catch(e){main.innerHTML=`<div class="empty">Erro: ${safe(e.message)}</div>`}};
  window.crmSetFilter=(key,value)=>{crmFilter[key]=value;renderCrmTable(document.getElementById('main'));if(key==='q'){const el=document.getElementById('crm-search');if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length)}}}; window.crmSetSocialFilter=value=>{crmSocialFilter=value;renderCrmTable(document.getElementById('main'))};
  window.crmToggleDateSort=(field='last')=>{if(crmDateSortField!==field){crmDateSortField=field;crmDateSort='desc'}else{crmDateSort=crmDateSort==='none'?'desc':crmDateSort==='desc'?'asc':'desc'}renderCrmTable(document.getElementById('main'))};
  window.crmEmailAreaChanged=async function(){
    try{
      await autoSaveCurrent();
      await crmReloadAreasForPreview();
      await crmRefreshEmailPreview();
    }catch(e){
      toast(e.message||'Não foi possível atualizar a área do email.','cancel');
    }
  }
  window.crmChooseEmailTemplate=function(){crmRefreshEmailPreview();crmApplyApproachToDm();scheduleAutoSave()}
  window.crmChooseLandingPage=function(){crmRefreshEmailPreview();scheduleAutoSave()}
  async function crmReloadAreasForPreview(){
    try{crmSectorContent=await api('/api/crm/prospect-sectors');refreshCrmEmailAreaSelect(document.getElementById('crm-email-area')?.value||'')}catch(_){}
  }
  function crmPreviewFill(text,p){return crmApproachFill(text,p)}
  async function crmRefreshEmailPreview(){
    const id=Number(document.getElementById('crm-id')?.value||0),box=document.getElementById('crm-email-preview');
    if(!box)return;
    const bodyEl=box.querySelector('.body');
    if(!id){
      box.querySelector('.subject').textContent='Guarde primeiro o prospect para ver o email final.';
      bodyEl.style.whiteSpace='normal';
      bodyEl.innerHTML='';
      return;
    }

    const lpId=Number(document.getElementById('crm-landing-page')?.value||0)||null;
    const tplId=Number(document.getElementById('crm-email-template')?.value||0)||null;

    try{
      box.querySelector('.subject').textContent='A carregar email final…';
      bodyEl.style.whiteSpace='normal';
      bodyEl.innerHTML='<div style="padding:18px;color:var(--muted)">A gerar exatamente o email que será enviado…</div>';

      const out=await api(`/api/crm/prospects/${id}/email-preview-final`,{
        method:'POST',
        body:{landing_page_id:lpId,email_template_id:tplId}
      });

      box.querySelector('.subject').textContent=out?.subject||'Preview do email';
      bodyEl.innerHTML=`<iframe title="Preview final do email" style="display:block;width:100%;height:1100px;border:0;background:#fff;border-radius:10px" sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox" srcdoc="${String(out?.html||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;')}"></iframe>`;
    }catch(e){
      box.querySelector('.subject').textContent='Não foi possível gerar o preview final.';
      bodyEl.textContent=e.message||'Erro ao gerar preview.';
    }
  }
  window.crmRefreshEmailPreview=crmRefreshEmailPreview;
  document.addEventListener('duit:prospect-email-templates',e=>{
    const next=e?.detail?.templates;
    if(!Array.isArray(next))return;
    crmEmailTemplates=next;
    window.duitCrmEmailTemplatesCache=crmEmailTemplates;
    const sel=document.getElementById('crm-email-template');
    if(sel){
      const current=sel.value;
      sel.innerHTML=emailTemplateOptions();
      if([...sel.options].some(o=>o.value===current))sel.value=current;
    }
    if(document.getElementById('modal-crm-prospect')?.classList.contains('open'))crmRefreshEmailPreview();
  });
  window.openCrmProspect=async function(id=null){installStyles();ensureModal();await crmReloadAreasForPreview();refreshCrmSectorSelect();refreshCrmEmailAreaSelect();loadingForm=true;const p=id?crmProspects.find(x=>Number(x.id)===Number(id)):null,set=(id,v)=>{const e=document.getElementById(id);if(e)e.value=v??''};document.getElementById('crm-modal-title').textContent=p?`Editar · ${p.company||p.name}`:'Novo prospect';document.getElementById('crm-landing-page').innerHTML=landingPageOptions();document.getElementById('crm-email-template').innerHTML=emailTemplateOptions();

const areaName=String(p?.email_area||'').trim();
const areaContent=(crmSectorContent||[]).find(x=>String(x.sector||'').trim().toLowerCase()===areaName.toLowerCase());
const sectorApproach=(crmEmailTemplates||[]).find(x=>Number(x.is_active)===1&&String(x.name||'').trim().toLowerCase()==='email por sector');
const inferredTemplateId=p?.email_template_id||(!p?.email_sent_at?sectorApproach?.id:'')||'';
const inferredLandingPageId=p?.landing_page_id||areaContent?.landing_page_id||'';

set('crm-id',p?.id);set('crm-company',p?.company);set('crm-name',p?.name);set('crm-email',p?.email);set('crm-phone',p?.phone);refreshCrmSectorSelect(p?.sector);refreshCrmEmailAreaSelect(p?.email_area);set('crm-sector',p?.sector);set('crm-email-area',p?.email_area);set('crm-location',p?.location);set('crm-website',p?.website);set('crm-instagram',p?.instagram);set('crm-opportunity',p?.opportunity);set('crm-idea',p?.idea);set('crm-priority',p?.priority||'possivel');set('crm-status',p?.lead_status||'por_contactar');set('crm-plan',p?.recommended_plan||planFromValues(p?.monthly_value));set('crm-monthly',p?.monthly_value);set('crm-email-template',inferredTemplateId);set('crm-landing-page',inferredLandingPageId);set('crm-first-contact',p?.first_contact_at?String(p.first_contact_at).slice(0,10):'');set('crm-followup',p?.follow_up_at?String(p.follow_up_at).slice(0,10):'');set('crm-notes',p?.notes);set('crm-dm-status',p?.dm_status||'por_enviar');set('crm-dm-message',p?.dm_message||crmDefaultDm(p||{}));const dmHint=document.getElementById('crm-dm-hint'),dmOpen=document.getElementById('crm-open-dm'),daily=crmDmDailyInfo();if(dmHint)dmHint.textContent=daily.blocked?'⛔ Limite diário atingido. Retome amanhã.':(p?.instagram?'Instagram validado: '+p.instagram:(p?.instagram_checked_at?'Instagram não encontrado na pesquisa automática.':'Instagram ainda por verificar.'));if(dmOpen){dmOpen.disabled=!!daily.blocked;dmOpen.textContent=daily.blocked?'⛔ Limite diário atingido':'Abrir Instagram + copiar DM';}document.getElementById('crm-delete').style.display=p?'':'none';document.getElementById('crm-optout').style.display=p?'':'none';document.getElementById('crm-native-send').style.display=p?'':'none';document.getElementById('crm-save-button').style.display=p?'none':'';document.getElementById('crm-save-state').textContent=p?'Alterações guardadas automaticamente':'';crmApplyPlan(false);document.getElementById('modal-crm-prospect').classList.add('open');if(p)crmRefreshEmailPreview();setTimeout(()=>loadingForm=false,0)};
  window.closeCrmProspect=()=>document.getElementById('modal-crm-prospect')?.classList.remove('open');
  window.crmApplyApproachToDm=async()=>{const id=Number(document.getElementById('crm-id')?.value||0),p=id?crmProspects.find(x=>Number(x.id)===id):null,tpl=crmSelectedApproach(p||{}),ta=document.getElementById('crm-dm-message');if(!ta)return;if(!tpl?.dm_body)return toast('Esta abordagem ainda não tem DM configurada.','cancel');ta.value=crmApproachFill(tpl.dm_body,p||{});if(id){try{await crmSaveDm()}catch(e){toast(e.message||'Não foi possível guardar a DM.','cancel')}}};
  async function crmSaveDm(statusOverride=null){const id=Number(document.getElementById('crm-id')?.value||0);if(!id)return toast('Guarde primeiro o prospect.','cancel');const msg=String(document.getElementById('crm-dm-message')?.value||'').trim(),status=statusOverride||document.getElementById('crm-dm-status')?.value||'por_enviar';const saved=await api(`/api/crm/prospects/${id}/social`,{method:'PATCH',body:{outreach_channel:'instagram',dm_status:status,dm_message:msg}});const x=crmProspects.find(v=>Number(v.id)===id);if(x){x.dm_status=saved?.dm_status||status;x.dm_message=msg;if(saved?.dm_sent_at)x.dm_sent_at=saved.dm_sent_at;else if(status==='enviado'&&!x.dm_sent_at)x.dm_sent_at=new Date().toISOString();if(status==='enviado'&&x.lead_status==='por_contactar')x.lead_status='contactado';if(status==='respondeu')x.lead_status='respondeu';if(status==='interessado')x.lead_status='interessado';if(status==='sem_interesse')x.lead_status='sem_interesse'}const sel=document.getElementById('crm-dm-status');if(sel)sel.value=saved?.dm_status||status;const st=document.getElementById('crm-status');if(st&&x)st.value=x.lead_status;const main=document.getElementById('main');if(main&&main.querySelector('.crm-toolbar'))renderCrmTable(main);return {id,msg,status:saved?.dm_status||status,dm_sent_at:saved?.dm_sent_at||x?.dm_sent_at||null}}
  window.crmSetDmCurrent=async status=>{try{await crmSaveDm(status);closeCrmProspect();renderCrmTable(document.getElementById('main'));toast(status==='enviado'?'DM marcada como enviada.':status==='cancelado'?'Contacto cancelado. Não será enviado por DM.':'Estado da DM atualizado.','check')}catch(e){toast(e.message||'Não foi possível atualizar a DM.','cancel')}};
  window.crmOpenCopyDmCurrent=async()=>{const id=Number(document.getElementById('crm-id')?.value||0);if(!id)return toast('Guarde primeiro o prospect.','cancel');const daily=crmDmDailyInfo();if(daily.blocked)return toast('Limite interno de 10 DMs atingido hoje. Retome amanhã.','cancel');const instagram=String(document.getElementById('crm-instagram')?.value||'').trim();if(!instagram)return toast('Este prospect ainda não tem Instagram validado.','cancel');try{await autoSaveCurrent();const r=await crmSaveDm();try{await navigator.clipboard.writeText(r.msg)}catch(_){const ta=document.getElementById('crm-dm-message');ta?.select();document.execCommand('copy')}window.open(instagram,'_blank','noopener');toast(daily.n>=CRM_DM_WARN_AT?'Instagram aberto e DM copiada. Atenção ao ritmo de hoje.':'Instagram aberto e DM copiada. Depois marque como enviada.','check')}catch(e){toast(e.message||'Não foi possível preparar a DM.','cancel')}};
  document.addEventListener('change',e=>{if(e.target?.id==='crm-dm-status'){crmSetDmCurrent(e.target.value)}});

  window.crmApplyPlan=function(update=true){const key=document.getElementById('crm-plan')?.value,plan=PLANS[key],preview=document.getElementById('crm-plan-preview');if(!preview)return;if(!plan){preview.style.display='none';if(update)scheduleAutoSave();return}preview.style.display='';preview.innerHTML=`<strong>${safe(plan.label)}</strong> · ${money(plan.price)}/mês · oferta ${money(plan.offer)}<br>${plan.items.map(safe).join(' · ')}`;if(update){document.getElementById('crm-monthly').value=plan.price;scheduleAutoSave()}};
  function formData(){const key=document.getElementById('crm-plan').value,plan=PLANS[key];return{company:document.getElementById('crm-company').value.trim(),name:document.getElementById('crm-name').value.trim(),email:document.getElementById('crm-email').value.trim(),phone:document.getElementById('crm-phone').value.trim(),sector:document.getElementById('crm-sector').value.trim(),email_area:document.getElementById('crm-email-area').value.trim(),location:document.getElementById('crm-location').value.trim(),website:document.getElementById('crm-website').value.trim(),instagram:document.getElementById('crm-instagram').value.trim(),opportunity:document.getElementById('crm-opportunity').value.trim(),idea:document.getElementById('crm-idea').value.trim(),priority:document.getElementById('crm-priority').value,lead_status:document.getElementById('crm-status').value,recommended_plan:key,solution_text:plan?plan.items.join('; '):'',monthly_value:Number(document.getElementById('crm-monthly').value||0),email_template_id:Number(document.getElementById('crm-email-template').value||0)||null,landing_page_id:Number(document.getElementById('crm-landing-page').value||0)||null,first_contact_at:document.getElementById('crm-first-contact').value||null,follow_up_at:document.getElementById('crm-followup').value||null,notes:document.getElementById('crm-notes').value.trim()}}
  function scheduleAutoSave(){if(loadingForm)return;const id=document.getElementById('crm-id')?.value;if(!id)return;clearTimeout(autoSaveTimer);const state=document.getElementById('crm-save-state');if(state)state.textContent='A guardar…';autoSaveTimer=setTimeout(autoSaveCurrent,450)}
  async function autoSaveCurrent(){const id=document.getElementById('crm-id')?.value;if(!id)return;const body=formData();if(!body.company||!body.email)return;try{await api(`/api/crm/prospects/${id}`,{method:'PATCH',body});const i=crmProspects.findIndex(p=>Number(p.id)===Number(id));if(i>=0)crmProspects[i]={...crmProspects[i],...body};const state=document.getElementById('crm-save-state');if(state)state.textContent='✓ Guardado'}catch(e){const state=document.getElementById('crm-save-state');if(state)state.textContent='Erro ao guardar'}}
  async function saveCrmProspect(e){e.preventDefault();const id=document.getElementById('crm-id').value,body=formData();if(!body.company||!body.email)return toast('Empresa e email são obrigatórios.','cancel');try{if(id)await api(`/api/crm/prospects/${id}`,{method:'PATCH',body});else await api('/api/crm/prospects',{method:'POST',body});toast(id?'Prospect atualizado.':'Prospect criado.','check');closeCrmProspect();await loadProspects();renderCrmTable(document.getElementById('main'))}catch(err){toast(err.message,'cancel')}}
  window.crmSendCurrentProspect=async()=>{const id=Number(document.getElementById('crm-id')?.value||0);if(!id)return toast('Guarde primeiro o prospect.','cancel');const btn=document.getElementById('crm-native-send');if(btn){btn.disabled=true;btn.textContent='A enviar…'}try{await autoSaveCurrent();if(typeof window.crmSendProspectEmail==='function')return await window.crmSendProspectEmail(id);const body=formData(),text=String(body.proposal_email||'').trim();if(!body.email)return toast('Indique o email do prospect.','cancel');if(!text)return toast('O email está vazio.','cancel');await api(`/api/crm/prospects/${id}/send-email`,{method:'POST',body:{text,email:body.email,ebook_page_id:body.ebook_page_id}});toast('Email enviado.','check');closeCrmProspect();await loadProspects();renderCrmTable(document.getElementById('main'));}catch(e){toast(e.message||'Não foi possível enviar o email.','cancel')}finally{if(btn){btn.disabled=false;btn.textContent='✉ Enviar email'}}};
  window.crmPreviewProposal=async()=>{const id=document.getElementById('crm-id')?.value;if(!id)return;try{await autoSaveCurrent();const r=await api(`/api/crm/prospects/${id}/preview-link`);if(!r?.url)throw new Error('Não foi possível criar a pré-visualização.');window.open(r.url,'_blank','noopener')}catch(e){toast(e.message,'cancel')}};
  window.crmGenerateProposal=()=>{document.getElementById('crm-proposal').value=buildProposal(formData());scheduleAutoSave();toast('Email atualizado.','check')};
  window.crmCopyProposal=async()=>{const txt=document.getElementById('crm-proposal').value;if(!txt)return toast('Ainda não existe um email para copiar.','cancel');try{await navigator.clipboard.writeText(txt);toast('Email copiado.','check')}catch(_){document.getElementById('crm-proposal').select();document.execCommand('copy');toast('Email copiado.','check')}};
  window.crmOptOut=async(id,company='Prospect')=>{const reason=prompt('Motivo para não voltar a contactar '+company+':','Pedido para sair da lista de distribuição');if(reason===null)return;if(!confirm('Marcar "'+company+'" como NÃO CONTACTAR?\n\nO contacto será removido da prospeção, ficará bloqueado para futuras importações e receberá automaticamente um email de confirmação.'))return;try{const out=await api(`/api/crm/prospects/${id}/do-not-contact`,{method:'POST',body:{reason:String(reason||'').trim()||'Pedido para sair da lista de distribuição'}});crmProspects=crmProspects.filter(p=>Number(p.id)!==Number(id));window.duitCrmProspectsCache=crmProspects;closeCrmProspect();renderCrmTable(document.getElementById('main'));toast(out?.confirmation_email_queued?'Contacto excluído e email de confirmação enviado.':'Contacto excluído. O email de confirmação não ficou confirmado.','check')}catch(e){toast(e.message||'Não foi possível excluir o contacto.','cancel')}};
  window.crmOptOutCurrent=async()=>{const id=Number(document.getElementById('crm-id')?.value||0),company=document.getElementById('crm-company')?.value||'Prospect';if(!id)return;return crmOptOut(id,company)};
  window.crmDeleteCurrent=async()=>{const id=document.getElementById('crm-id').value,company=document.getElementById('crm-company').value;if(!id||!confirm(`Apagar o prospect "${company}"?`))return;try{await api(`/api/crm/prospects/${id}`,{method:'DELETE'});closeCrmProspect();await loadProspects();renderCrmTable(document.getElementById('main'));toast('Prospect apagado.')}catch(e){toast(e.message,'cancel')}};
  if(typeof state!=='undefined'&&state.view==='prospects'&&document.getElementById('main'))window.viewProspects(document.getElementById('main'));
})();