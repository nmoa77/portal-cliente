const fs=require('fs');
const path=require('path');

try{
  const file=path.join(__dirname,'email.js');
  let s=fs.readFileSync(file,'utf8');
  s=s.replace("const SIGNATURE_URL = `${PORTAL_URL}/assinatura_duit.png`;","const SIGNATURE_URL = `${PORTAL_URL}/assinatura-email.png`;");
  fs.writeFileSync(file,s,'utf8');
}catch(e){
  console.warn('[email-signature-patch]',e.message);
}
