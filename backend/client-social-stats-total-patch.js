const fs=require('fs');
const path=require('path');

try{
  const file=path.join(process.cwd(),'public','js','cliente.js');
  let s=fs.readFileSync(file,'utf8');

  if(!s.includes('TOTAL GERAL · REDES SOCIAIS')){
    const sectionStart=s.indexOf('Resumo dos posts agendados, publicados e em rascunho nos últimos meses.');
    if(sectionStart!==-1){
      const tbodyEnd=s.indexOf('</tbody>',sectionStart);
      if(tbodyEnd!==-1){
        const totalRow=[
          "                ${(() => {",
          "                  const totals=(s.socialPostStats || []).reduce((acc,m)=>{",
          "                    acc.published+=Number(m.published||0);",
          "                    acc.scheduled+=Number(m.scheduled||0);",
          "                    acc.draft+=Number(m.draft||0);",
          "                    acc.cancelled+=Number(m.cancelled||0);",
          "                    acc.total+=Number(m.total||0);",
          "                    return acc;",
          "                  },{published:0,scheduled:0,draft:0,cancelled:0,total:0});",
          "                  return `<tr style=\"background:var(--bg-2);border-top:2px solid var(--line)\"><td><strong>TOTAL GERAL · REDES SOCIAIS</strong></td><td style=\"text-align:right;color:#2a8a2a\"><strong>${totals.published}</strong></td><td style=\"text-align:right;color:#5a4a00\"><strong>${totals.scheduled}</strong></td><td style=\"text-align:right;color:var(--muted)\"><strong>${totals.draft}</strong></td><td style=\"text-align:right;color:#9a2828\"><strong>${totals.cancelled}</strong></td><td style=\"text-align:right\"><strong>${totals.total}</strong></td></tr>`;",
          "                })()}\n"
        ].join('\n');
        s=s.slice(0,tbodyEnd)+totalRow+s.slice(tbodyEnd);
      }
    }
  }

  fs.writeFileSync(file,s,'utf8');
}catch(e){console.warn('[client-social-stats-total-patch]',e.message);}
