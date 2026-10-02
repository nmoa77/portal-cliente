const fs=require('fs');
const path=require('path');

try{
  const file=path.join(__dirname,'meta-report-automation.js');
  let s=fs.readFileSync(file,'utf8');

  const exposeMarker="  app.post('/api/meta/reports/:userId/:year/:month/generate'";
  if(s.includes(exposeMarker)&&!s.includes('app.locals.metaReportGenerate=generate')){
    s=s.replace(exposeMarker,"  app.locals.metaReportGenerate=generate;\n  app.locals.metaReportSend=sendReport;\n\n"+exposeMarker);
  }

  const oldTail="  setTimeout(scheduledTick,15000);setInterval(scheduledTick,60*60*1000);";
  const newTail="  if(process.env.META_REPORT_LEGACY_AUTOMATION==='1'){setTimeout(scheduledTick,15000);setInterval(scheduledTick,60*60*1000);}";
  if(s.includes(oldTail))s=s.replace(oldTail,newTail);

  fs.writeFileSync(file,s,'utf8');
}catch(e){console.warn('[meta-report-scheduling-sync]',e.message);}
