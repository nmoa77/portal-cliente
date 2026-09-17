const fs=require('fs');
const path=require('path');

// Instala as rotas de templates no wrapper que captura a app Express antes do server original.
try{
  const p=path.join(__dirname,'crm-server.js');
  let s=fs.readFileSync(p,'utf8');
  const line="require('./proposal-template-actions')(capturedApp);";
  const marker='// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.';
  if(!s.includes(line)) s=s.replace(marker,`${line}\n\n${marker}`);
  fs.writeFileSync(p,s,'utf8');
}catch(e){console.warn('[proposal-templates] backend install:',e.message)}

// Carrega a gestão de templates no BO sem alterar o admin.js principal.
try{
  const p=path.join(__dirname,'..','public','admin.html');
  let s=fs.readFileSync(p,'utf8');
  const tag='<script src="/js/proposal-templates-admin.js?v=20260917a"></script>';
  if(!s.includes('proposal-templates-admin.js')) s=s.replace('</body>',`${tag}\n</body>`);
  fs.writeFileSync(p,s,'utf8');
}catch(e){console.warn('[proposal-templates] admin install:',e.message)}

// A proposta atual mantém-se intacta; esta camada só acrescenta funcionalidades conforme o template associado.
try{
  const p=path.join(__dirname,'..','public','quote.html');
  let s=fs.readFileSync(p,'utf8');
  const tag='<script src="/js/proposal-template-public.js?v=20260917a"></script>';
  if(!s.includes('proposal-template-public.js')) s=s.replace('</body>',`${tag}\n</body>`);
  fs.writeFileSync(p,s,'utf8');
}catch(e){console.warn('[proposal-templates] public install:',e.message)}

require('./start');
