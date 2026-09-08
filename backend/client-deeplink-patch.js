const fs=require('fs');
const path=require('path');

try{
  const file=path.join(process.cwd(),'public','js','cliente.js');
  let s=fs.readFileSync(file,'utf8');

  // Se o cliente ainda não tem sessão, preserva a página/vista pedida para voltar lá após login.
  const oldRedirect="    window.location.href = '/';";
  const redirectReplacement="    const next = window.location.pathname + window.location.search;\n    window.location.href = '/?next=' + encodeURIComponent(next);";
  if(s.includes(oldRedirect)&&!s.includes("encodeURIComponent(next)"))s=s.replace(oldRedirect,redirectReplacement);

  // Não limpar ?view=... no arranque. A URL é o estado persistente da SPA e permite refresh na mesma página.
  const oldClean="    try { window.history.replaceState({}, document.title, window.location.pathname); } catch (e) {}\n    go(initial);";
  const keepView="    go(initial);";
  if(s.includes(oldClean))s=s.replace(oldClean,keepView);

  // Sempre que muda de secção, grava a vista atual na URL sem recarregar a página.
  const goStart="async function go(view) {\n  state.view = view;\n  setActive();";
  const goPersist="async function go(view) {\n  state.view = view;\n  try {\n    const url = new URL(window.location.href);\n    if (view && view !== 'home') url.searchParams.set('view', view);\n    else url.searchParams.delete('view');\n    window.history.replaceState({ view }, document.title, url.pathname + (url.searchParams.toString() ? '?' + url.searchParams.toString() : ''));\n  } catch (e) {}\n  setActive();";
  if(s.includes(goStart)&&!s.includes("url.searchParams.set('view', view)"))s=s.replace(goStart,goPersist);

  fs.writeFileSync(file,s,'utf8');
}catch(e){console.warn('[client-deeplink-patch]',e.message);}
