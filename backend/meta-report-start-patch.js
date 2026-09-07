const fs=require('fs');
const path=require('path');

try{
  const crm=path.join(__dirname,'crm-server.js');
  let s=fs.readFileSync(crm,'utf8');
  const marker='// Arranca finalmente o servidor original, agora já com as rotas CRM registadas.';
  const automation="require('./meta-report-automation')(capturedApp);";
  const archive="require('./meta-report-archive')(capturedApp);";
  if(!s.includes(automation))s=s.replace(marker,`${automation}\n\n${marker}`);
  if(!s.includes(archive))s=s.replace(marker,`${archive}\n\n${marker}`);
  fs.writeFileSync(crm,s,'utf8');
}catch(e){console.warn('[meta-report] bootstrap backend:',e.message);}

try{
  const admin=path.join(__dirname,'..','public','js','admin.js');
  let s=fs.readFileSync(admin,'utf8');
  const marker='meta-reports-workflow.js';
  if(!s.includes(marker))s+=`\n;(() => { if (document.querySelector('script[data-duit-meta-workflow]')) return; const sc=document.createElement('script'); sc.src='/js/meta-reports-workflow.js?v=20260907c'; sc.dataset.duitMetaWorkflow='1'; document.body.appendChild(sc); })();\n`;
  else s=s.replace(/meta-reports-workflow\.js\?v=[^'\"]+/g,'meta-reports-workflow.js?v=20260907c');
  fs.writeFileSync(admin,s,'utf8');
}catch(e){console.warn('[meta-report] bootstrap admin:',e.message);}

try{
  const client=path.join(__dirname,'..','public','js','cliente.js');
  let s=fs.readFileSync(client,'utf8');
  const marker='meta-reports-client.js';
  if(!s.includes(marker))s+=`\n;(() => { if (document.querySelector('script[data-duit-meta-client]')) return; const sc=document.createElement('script'); sc.src='/js/meta-reports-client.js?v=20260907b'; sc.dataset.duitMetaClient='1'; document.body.appendChild(sc); })();\n`;
  else s=s.replace(/meta-reports-client\.js\?v=[^'\"]+/g,'meta-reports-client.js?v=20260907b');
  fs.writeFileSync(client,s,'utf8');
}catch(e){console.warn('[meta-report] bootstrap client:',e.message);}
