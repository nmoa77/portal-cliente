const fs=require('fs');
const path=require('path');

try{
  const file=path.join(__dirname,'meta-report-automation.js');
  let s=fs.readFileSync(file,'utf8');

  s=s.replace('<meta charset="utf-8"><style>@page','<meta charset="utf-8"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet"><link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap" rel="stylesheet"><style>@page');
  s=s.replace('body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#111}',"body{margin:0;font-family:'Space Grotesk',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;-webkit-font-smoothing:antialiased}h1,h2,h3,.title,.cover h1,.divider h2{font-family:'Clash Display','Space Grotesk',sans-serif;font-weight:600;letter-spacing:-.02em}");

  if(!s.includes('/* mr-preview-kpis */')){
    s=s.replace('</style></head>',`/* mr-preview-kpis */
      .hero{grid-template-columns:1.15fr .85fr;gap:9mm;align-items:end}
      .kpis{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:#dededb;border:0!important}
      .kpi{background:#fff;padding:7mm 6mm;border:0!important;box-shadow:none!important}
      .kpi strong{font-size:31px;line-height:1.05}
      .kpi span{font-size:10px;letter-spacing:.08em}
      .section{border-top:1px solid #dededb}
      .toprow{border-top:1px solid #ecece8}
      .cover .client-name{font-family:'Clash Display','Space Grotesk',sans-serif;font-size:34px;line-height:1.05;font-weight:600;letter-spacing:-.02em;margin-top:9mm;color:#fff}
      .interaction-page .hero{margin-top:10mm}
      .interaction-page .section{margin-top:8mm;padding-top:5mm}
      .interaction-page .section h3{margin-bottom:4mm}
      .interaction-page .barrow{margin:3mm 0}
      .interaction-page .track{height:3.2mm;margin-top:1.5mm}
    </style></head>`);
  }

  const originalCover='<section class="page black cover"><div class="eyebrow">RELATÓRIO DE REDES SOCIAIS · ${month.toUpperCase()}</div><div class="main"><div class="eyebrow">FACEBOOK · INSTAGRAM</div><h1>${esc(client)}</h1><p class="summary muted">Análise mensal de desempenho, interação e conteúdos com maior destaque nas redes sociais.</p></div><div class="bottom">${logo?`<img class="logo" src="${logo}">`:\'\'}<div class="eyebrow">RESULTADOS · ANÁLISE · CONTEÚDOS</div></div></section>';
  const currentCover='<section class="page black cover"><div style="display:flex;justify-content:space-between" class="eyebrow"><span>RELATÓRIO DE REDES SOCIAIS</span><span>${month.toUpperCase()}</span></div><div class="main">${logo?`<img class="logo" src="${logo}" style="margin-bottom:16mm">`:\'\'}<div class="eyebrow">FACEBOOK + INSTAGRAM</div><h1>Resultados<br>do mês.</h1><p class="summary">${esc(client)}</p></div><div class="bottom"><span>${esc(client)}</span><div class="eyebrow">DESIGN · REDES SOCIAIS</div></div></section>';
  const cleanCover='<section class="page black cover"><div style="display:flex;justify-content:space-between" class="eyebrow"><span>RELATÓRIO DE REDES SOCIAIS</span><span>${month.toUpperCase()}</span></div><div class="main"><div class="eyebrow">FACEBOOK + INSTAGRAM</div><h1>Resultados<br>do mês.</h1><div class="client-name">${esc(client)}</div></div><div class="bottom"><span>${esc(client)}</span><div class="eyebrow">DESIGN · REDES SOCIAIS</div></div></section>';
  if(s.includes(currentCover))s=s.replace(currentCover,cleanCover);
  else if(s.includes(originalCover))s=s.replace(originalCover,cleanCover);

  // Evita corte do último gráfico/barra nas páginas de interação.
  s=s.replace('<section class="page"><div class="head"><div><div class="network">Instagram</div><div class="title">Interação</div>', '<section class="page interaction-page"><div class="head"><div><div class="network">Instagram</div><div class="title">Interação</div>');

  // Facebook passa a repetir a mesma estrutura editorial de 3 páginas do Instagram:
  // Visualizações, Interação e Conteúdos em destaque. Só usa métricas reais devolvidas pela Meta.
  const fbBlockRe=/<section class="page black divider"><div class="eyebrow">RESULTADOS · ANÁLISE · CONTEÚDOS<\/div><h2>Facebook<\/h2><p class="muted">Desempenho e conteúdos publicados no Facebook\.<\/p><\/section>\n<section class="page"><div class="head"><div><div class="network">Facebook<\/div><div class="title">Interação<\/div>[\s\S]*?<section class="page"><div class="head"><div><div class="network">Facebook<\/div><div class="title">Conteúdos em destaque<\/div>[\s\S]*?<\/section>/;
  const fbBlock=`<section class="page black divider"><div class="eyebrow">RESULTADOS · ANÁLISE · CONTEÚDOS</div><h2>Facebook</h2><p class="muted">Desempenho e conteúdos publicados no Facebook.</p></section>
<section class="page"><div class="head"><div><div class="network">Facebook</div><div class="title">Visualizações</div></div><div class="eyebrow">\${month}</div></div><div class="hero"><div><div class="eyebrow">VISUALIZAÇÕES DOS CONTEÚDOS</div><div class="big">\${n(Number(f.impressions||0)>0?f.impressions:f.video_views)}</div><p class="muted">Total confirmado pela Meta para os conteúdos publicados no período.</p></div><div class="kpis"><div class="kpi"><strong>\${n(f.reach)}</strong><span>Alcance</span></div><div class="kpi"><strong>\${n(f.posts)}</strong><span>Conteúdos</span></div><div class="kpi"><strong>\${n(f.reactions)}</strong><span>Reações</span></div><div class="kpi"><strong>\${n(f.shares)}</strong><span>Partilhas</span></div></div></div><div class="section"><h3>Visualizações por conteúdo publicado</h3>\${lineChart(d.facebook.posts,p=>Number(p.metrics?.post_impressions||0)>0?p.metrics.post_impressions:p.video_views,p=>p.created_time)}</div></section>
<section class="page interaction-page"><div class="head"><div><div class="network">Facebook</div><div class="title">Interação</div></div><div class="eyebrow">\${month}</div></div><div class="hero"><div><div class="eyebrow">INTERAÇÕES</div><div class="big">\${n(Number(f.reactions||0)+Number(f.comments||0)+Number(f.shares||0))}</div></div><div class="kpis"><div class="kpi"><strong>\${n(f.reactions)}</strong><span>Reações</span></div><div class="kpi"><strong>\${n(f.comments)}</strong><span>Comentários</span></div><div class="kpi"><strong>\${n(f.shares)}</strong><span>Partilhas</span></div><div class="kpi"><strong>\${n(f.video_views)}</strong><span>Visualizações vídeo/Reels</span></div></div></div><div class="section"><h3>Composição da interação</h3>\${bars([['Reações',f.reactions],['Comentários',f.comments],['Partilhas',f.shares],['Vídeo / Reels',f.video_views]])}</div></section>
<section class="page"><div class="head"><div><div class="network">Facebook</div><div class="title">Conteúdos em destaque</div></div><div class="eyebrow">\${month}</div></div><div class="section" style="margin-top:0;border-top:0">\${topRows(fb,'Facebook')}</div></section>`;
  s=s.replace(fbBlockRe,fbBlock);

  if(!s.includes('function pdfRecommendations(')){
    const marker='  function html(d){';
    const helper=[
      '  function pdfRecommendations(d){',
      "    const i=d?.instagram?.totals||{},f=d?.facebook?.totals||{},media=(d?.instagram?.media||[]).map(p=>({caption:p.caption||'',views:Number(p.metrics?.views||0),reach:Number(p.metrics?.reach||0)})).sort((a,b)=>(b.views||b.reach)-(a.views||a.reach)),top=media[0],second=media[1],rec=[];",
      "    if(Number(i.comments||0)===0)rec.push(['Gerar mais conversa','O Instagram não registou comentários. No próximo mês, usar perguntas simples, escolhas e chamadas à opinião para transformar visualizações em conversa.']);",
      "    const rate=Number(i.views||0)>0?(Number(i.interactions||0)/Number(i.views||0))*100:0;",
      "    if(rate<2)rec.push(['Aumentar a taxa de interação','As publicações tiveram '+n(i.views)+' visualizações e '+n(i.interactions)+' interações. Há margem para incluir CTAs mais claros e formatos que convidem a guardar, partilhar ou responder.']);",
      "    if(Number(i.shares||0)<5)rec.push(['Criar conteúdo mais partilhável','As partilhas ainda são reduzidas. Apostar em dicas práticas, mitos, listas curtas, desafios e conteúdos em que o público se reconheça pode aumentar a distribuição orgânica.']);",
      "    if(Number(i.saved||0)<8)rec.push(['Dar mais valor útil aos posts','Os guardados podem crescer com conteúdos de referência: exercícios, pequenas rotinas, erros comuns, checklists e recomendações que as pessoas queiram consultar novamente.']);",
      "    if(top)rec.push(['Replicar o que já funcionou','O conteúdo “'+(top.caption||'conteúdo em destaque').slice(0,72)+((top.caption||'').length>72?'…':'')+'” esteve entre os mais vistos. Vale manter o mesmo tipo de tema/abordagem e criar novas variações sem repetir a publicação.']);",
      "    if(second&&rec.length<5)rec.push(['Construir séries de conteúdo','O segundo conteúdo com melhor desempenho foi “'+(second.caption||'conteúdo em destaque').slice(0,68)+((second.caption||'').length>68?'…':'')+'”. Transformar temas fortes em séries ajuda a criar consistência e reconhecimento.']);",
      "    const fbInt=Number(f.reactions||0)+Number(f.comments||0)+Number(f.shares||0);if(Number(f.posts||0)>0&&fbInt/Number(f.posts||1)<2)rec.push(['Reforçar o Facebook','O Facebook apresentou pouca interação por publicação. Adaptar os conteúdos ao comportamento da rede, com textos mais diretos e perguntas no início, pode ajudar a recuperar participação.']);",
      "    return rec.slice(0,5).map((r,idx)=>'<div style=\"display:grid;grid-template-columns:14mm 1fr;gap:5mm;padding:5mm 0;border-bottom:1px solid #e7e7e2\"><div style=\"font-size:18px;color:#aaa\">0'+(idx+1)+'</div><div><h3 style=\"font-size:20px;margin:0 0 2mm\">'+r[0]+'</h3><p style=\"font-size:13px;line-height:1.55;color:#575752;margin:0\">'+r[1]+'</p></div></div>').join('');",
      '  }','',''
    ].join('\n');
    s=s.replace(marker,helper+marker);
  }

  const conclusionRe=/<section class="page"><div class="head"><div><div class="eyebrow">CONCLUSÃO<\/div><div class="title">O que melhorar no próximo mês<\/div><\/div><\/div><div class="summary">Foram publicados[\s\S]*?<\/section>\n<section class="page black closing">/;
  const conclusion='<section class="page"><div class="head"><div><div class="eyebrow">CONCLUSÃO</div><div class="title">O que melhorar no próximo mês</div></div></div><div class="section" style="margin-top:0;border-top:0;padding-top:0">${pdfRecommendations(d)}</div><div style="position:absolute;left:18mm;right:18mm;bottom:12mm;display:flex;justify-content:space-between" class="eyebrow"><span>RELATÓRIO EFETUADO POR @DUIT</span><span>DUIT</span></div></section>\n<section class="page black closing">';
  s=s.replace(conclusionRe,conclusion);

  fs.writeFileSync(file,s,'utf8');
}catch(e){console.warn('[meta-report-pdf-sync]',e.message);}
