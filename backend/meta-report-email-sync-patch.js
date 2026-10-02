const fs=require('fs');
const path=require('path');

try{
  const file=path.join(__dirname,'meta-report-automation.js');
  let s=fs.readFileSync(file,'utf8');
  s=s.replace(/assinatura_duit\.png/g,'assinatura-email.png');
  fs.writeFileSync(file,s,'utf8');
}catch(e){
  console.warn('[meta-report-email-sync]',e.message);
}
