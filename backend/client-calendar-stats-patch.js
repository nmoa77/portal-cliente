const fs=require('fs');
const path=require('path');

try{
  const file=path.join(process.cwd(),'public','js','cliente.js');
  let s=fs.readFileSync(file,'utf8');

  const statsMarker="  const [y, m] = month.split('-').map(Number);";
  const statsInsert="  const [y, m] = month.split('-').map(Number);\n  const socialStats = posts.reduce((acc,p)=>{\n    acc.total++;\n    if(p.status==='published') acc.published++;\n    else if(p.status==='scheduled') acc.scheduled++;\n    else if(p.status==='draft') acc.draft++;\n    else if(p.status==='cancelled') acc.cancelled++;\n    return acc;\n  },{published:0,scheduled:0,draft:0,cancelled:0,total:0});\n  const calendarYears = Array.from({length:(new Date().getFullYear()+1)-2024+1},(_,i)=>(new Date().getFullYear()+1)-i);";
  if(s.includes(statsMarker)&&!s.includes('const socialStats = posts.reduce'))s=s.replace(statsMarker,statsInsert);

  const oldActions="      <div class=\"page-head-actions\">\n        <button class=\"btn btn-ghost btn-sm\" onclick=\"shiftMonth(-1)\">←</button>\n        <strong style=\"font-family:'Clash Display'; font-size:18px; min-width:180px; text-align:center;\">${monthLabel(month)}</strong>\n        <button class=\"btn btn-ghost btn-sm\" onclick=\"shiftMonth(1)\">→</button>\n      </div>";
  const newActions="      <div class=\"page-head-actions\" style=\"display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end\">\n        <button class=\"btn btn-ghost btn-sm\" onclick=\"shiftMonth(-1)\" title=\"Mês anterior\">←</button>\n        <select id=\"calendar-month-filter\" class=\"input\" onchange=\"setCalendarPeriod()\" style=\"width:auto;min-width:150px\">\n          ${['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].map((label,idx)=>'<option value=\"'+String(idx+1).padStart(2,'0')+'\" '+(Number(m)===idx+1?'selected':'')+'>'+label+'</option>').join('')}\n        </select>\n        <select id=\"calendar-year-filter\" class=\"input\" onchange=\"setCalendarPeriod()\" style=\"width:auto;min-width:100px\">\n          ${calendarYears.map(year=>'<option value=\"'+year+'\" '+(Number(y)===year?'selected':'')+'>'+year+'</option>').join('')}\n        </select>\n        <button class=\"btn btn-ghost btn-sm\" onclick=\"shiftMonth(1)\" title=\"Mês seguinte\">→</button>\n      </div>";
  if(s.includes(oldActions))s=s.replace(oldActions,newActions);

  const oldCalendar="    <div class=\"cal\">\n      <div class=\"cal-grid\">";
  const newCalendar="    <div class=\"card\" style=\"margin-bottom:18px;padding:0;overflow:hidden\">\n      <div style=\"padding:18px 20px 14px;border-bottom:1px solid var(--line-2)\">\n        <div class=\"eyebrow\">Resumo do mês</div>\n        <h3 style=\"margin:4px 0 0;font-family:'Clash Display';font-size:22px;text-transform:capitalize\">${monthLabel(month)}</h3>\n      </div>\n      <div style=\"overflow-x:auto\">\n        <table class=\"table\" style=\"margin:0\">\n          <thead><tr><th>Publicados</th><th>Agendados</th><th>Rascunhos</th><th>Cancelados</th><th>Total</th></tr></thead>\n          <tbody><tr>\n            <td style=\"color:#2a8a2a\"><strong>${socialStats.published}</strong></td>\n            <td style=\"color:#5a4a00\"><strong>${socialStats.scheduled}</strong></td>\n            <td style=\"color:var(--muted)\">${socialStats.draft}</td>\n            <td style=\"color:#9a2828\">${socialStats.cancelled}</td>\n            <td><strong>${socialStats.total}</strong></td>\n          </tr></tbody>\n        </table>\n      </div>\n    </div>\n    <div class=\"cal\">\n      <div class=\"cal-grid\">";
  if(s.includes(oldCalendar)&&!s.includes('Resumo do mês'))s=s.replace(oldCalendar,newCalendar);

  const shiftFn="function shiftMonth(delta) {\n  const [y, m] = state.calMonth.split('-').map(Number);\n  const d = new Date(y, m - 1 + delta, 1);\n  state.calMonth = monthKey(d);\n  go('calendar');\n}";
  const shiftWithSet="function shiftMonth(delta) {\n  const [y, m] = state.calMonth.split('-').map(Number);\n  const d = new Date(y, m - 1 + delta, 1);\n  state.calMonth = monthKey(d);\n  go('calendar');\n}\n\nfunction setCalendarPeriod() {\n  const month=document.getElementById('calendar-month-filter')?.value;\n  const year=document.getElementById('calendar-year-filter')?.value;\n  if(!month||!year)return;\n  state.calMonth=year+'-'+month;\n  go('calendar');\n}";
  if(s.includes(shiftFn)&&!s.includes('function setCalendarPeriod()'))s=s.replace(shiftFn,shiftWithSet);

  fs.writeFileSync(file,s,'utf8');
}catch(e){console.warn('[client-calendar-stats-patch]',e.message);}
