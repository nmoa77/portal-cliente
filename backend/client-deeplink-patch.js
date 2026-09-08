const fs=require('fs');
const path=require('path');

try{
  const file=path.join(process.cwd(),'public','js','cliente.js');
  let s=fs.readFileSync(file,'utf8');
  const old="    window.location.href = '/';";
  const replacement="    const next = window.location.pathname + window.location.search;\n    window.location.href = '/?next=' + encodeURIComponent(next);";
  if(s.includes(old)&&!s.includes("encodeURIComponent(next)"))s=s.replace(old,replacement);
  fs.writeFileSync(file,s,'utf8');
}catch(e){console.warn('[client-deeplink-patch]',e.message);}
