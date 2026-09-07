const fs=require('fs');
const path=require('path');

try{
  const crm=path.join(__dirname,'crm-server.js');
  let s=fs.readFileSync(crm,'utf8');
  const line="require('./meta-report-automation')(capturedApp);";
  const marker='// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.';
  if(!s.includes(line))s=s.replace(marker,`${line}\n\n${marker}`);
  fs.writeFileSync(crm,s,'utf8');
}catch(e){console.warn('[meta-report] bootstrap backend:',e.message);}

try{
  const admin=path.join(__dirname,'..','public','js','admin.js');
  let s=fs.readFileSync(admin,'utf8');
  const marker='meta-reports-workflow.js';
  if(!s.includes(marker))s+=`\n;(() => { if (document.querySelector('script[data-duit-meta-workflow]')) return; const sc=document.createElement('script'); sc.src='/js/meta-reports-workflow.js?v=20260907a'; sc.dataset.duitMetaWorkflow='1'; document.body.appendChild(sc); })();\n`;
  else s=s.replace(/meta-reports-workflow\.js\?v=[^'\"]+/g,'meta-reports-workflow.js?v=20260907a');
  fs.writeFileSync(admin,s,'utf8');
}catch(e){console.warn('[meta-report] bootstrap admin:',e.message);}

try{
  const client=path.join(__dirname,'..','public','js','cliente.js');
  let s=fs.readFileSync(client,'utf8');
  const marker='meta-reports-client.js';
  if(!s.includes(marker))s+=`\n;(() => { if (document.querySelector('script[data-duit-meta-client]')) return; const sc=document.createElement('script'); sc.src='/js/meta-reports-client.js?v=20260907a'; sc.dataset.duitMetaClient='1'; document.body.appendChild(sc); })();\n`;
  else s=s.replace(/meta-reports-client\.js\?v=[^'\"]+/g,'meta-reports-client.js?v=20260907a');
  fs.writeFileSync(client,s,'utf8');
}catch(e){console.warn('[meta-report] bootstrap client:',e.message);}
