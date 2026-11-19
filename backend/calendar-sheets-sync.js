const crypto=require('crypto');
const db=require('./db');
const {requireAdmin}=require('./auth');

function clean(v,max=2000){return v==null?null:String(v).trim().slice(0,max)}
function sheetIdFromUrl(v){
  const s=String(v||'').trim();
  const m=s.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return m?m[1]:(/^[a-zA-Z0-9-_]{20,}$/.test(s)?s:null);
}
function newSecret(){return crypto.randomBytes(24).toString('hex')}
db.exec(`CREATE TABLE IF NOT EXISTS calendar_sheet_delivery_acks(
 request_id TEXT PRIMARY KEY,
 user_id INTEGER NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending',
 detail TEXT,
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);`);
function beginSheetAck(userId){
 const id=crypto.randomUUID();
 db.prepare('INSERT INTO calendar_sheet_delivery_acks(request_id,user_id) VALUES (?,?)').run(id,userId);
 db.prepare("DELETE FROM calendar_sheet_delivery_acks WHERE created_at<datetime('now','-2 days')").run();
 return id;
}
async function waitSheetAck(id,ms=3500){
 const start=Date.now();
 while(Date.now()-start<ms){
  const ack=db.prepare('SELECT status,detail FROM calendar_sheet_delivery_acks WHERE request_id=?').get(id);
  if(ack&&ack.status!=='pending')return ack;
  await new Promise(resolve=>setTimeout(resolve,250));
 }
 return null;
}


db.exec(`
  CREATE TABLE IF NOT EXISTS calendar_sheet_links(
    user_id INTEGER PRIMARY KEY,
    spreadsheet_id TEXT,
    spreadsheet_url TEXT,
    apps_script_url TEXT,
    webhook_secret TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1,
    last_sheet_event_at TEXT,
    last_portal_sync_at TEXT,
    last_error TEXT,
    created_at TEXT DEFAULT(datetime('now')),
    updated_at TEXT DEFAULT(datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS calendar_sheet_mappings(
    post_id INTEGER NOT NULL,
    field TEXT NOT NULL,
    sheet_name TEXT NOT NULL,
    cell_a1 TEXT NOT NULL,
    updated_at TEXT DEFAULT(datetime('now')),
    PRIMARY KEY(post_id,field),
    FOREIGN KEY(post_id) REFERENCES social_posts(id) ON DELETE CASCADE
  );
`);

try{
  const seven=db.prepare(`SELECT id FROM users WHERE role='client' AND parent_user_id IS NULL
    AND (lower(company) LIKE '%seven fitness%' OR lower(name) LIKE '%eunice costa%') ORDER BY id LIMIT 1`).get();
  if(seven){
    const exists=db.prepare('SELECT 1 FROM calendar_sheet_links WHERE user_id=?').get(seven.id);
    if(!exists){
      db.prepare(`INSERT INTO calendar_sheet_links(user_id,spreadsheet_id,spreadsheet_url,apps_script_url,webhook_secret,enabled)
        VALUES(?,?,?,?,?,1)`).run(
          seven.id,
          '1IYmcH2ZulW6z2EAgtHKmFj9KmdTDn0yYfvy4ajJVSZo',
          'https://docs.google.com/spreadsheets/d/1IYmcH2ZulW6z2EAgtHKmFj9KmdTDn0yYfvy4ajJVSZo/edit',
          'https://script.google.com/macros/s/AKfycbxmTomA-pyOwdrXl-z2eDUpzlA36qVyHf0AIW2VFKWchlvrYm_8-X5YIzvMBNDRVf0G2w/exec',
          newSecret()
        );
      console.log('[calendar-sheet] Google Sheet nativa associada ao Seven Fitness Club');
    } else {
      db.prepare(`UPDATE calendar_sheet_links
        SET spreadsheet_id=?,spreadsheet_url=?,apps_script_url=?,enabled=1,updated_at=datetime('now')
        WHERE user_id=?`).run(
          '1IYmcH2ZulW6z2EAgtHKmFj9KmdTDn0yYfvy4ajJVSZo',
          'https://docs.google.com/spreadsheets/d/1IYmcH2ZulW6z2EAgtHKmFj9KmdTDn0yYfvy4ajJVSZo/edit',
          'https://script.google.com/macros/s/AKfycbxmTomA-pyOwdrXl-z2eDUpzlA36qVyHf0AIW2VFKWchlvrYm_8-X5YIzvMBNDRVf0G2w/exec',
          seven.id
        );
    }
  }
}catch(e){console.warn('[calendar-sheet] seed Seven:',e.message)}

function getLink(userId){
  return db.prepare(`SELECT l.*,u.name client_name,u.company client_company
    FROM calendar_sheet_links l JOIN users u ON u.id=l.user_id WHERE l.user_id=?`).get(Number(userId));
}
function getMappings(postId){
  return db.prepare('SELECT post_id,field,sheet_name,cell_a1 FROM calendar_sheet_mappings WHERE post_id=? ORDER BY field').all(Number(postId));
}
function postPayload(post){
  return {
    id:Number(post.id),user_id:Number(post.user_id),date:post.date,
    text:post.text||'',inspiration:post.inspiration||'',story:post.story||'',
    status:post.status||'draft'
  };
}

async function sheetScriptResponse(response,body){
  const txt=String(body||'').trim();
  if(response.ok&&txt==='ok')return {ok:true,message:'Ligação confirmada.'};
  const html=/^\s*<(?:!doctype|html)/i.test(txt);
  if(response.status===401||response.status===403||/sign in|accounts\.google\.com|login/i.test(txt.slice(0,600)))
    return {ok:false,message:'O Google está a pedir autenticação. Edite a implementação do Apps Script e defina o acesso como «Qualquer pessoa».'};
  if(html||/script\.google\.com\/macros\//i.test(response.url||'')&&response.status===404)
    return {ok:false,message:'O URL do Apps Script está incorreto, a implementação não está acessível ou o Google devolveu uma página HTML. Confirme a implementação Web App e o URL terminado em /exec.'};
  if(txt==='forbidden')return {ok:false,message:'A chave de ligação não coincide. Copie novamente o script atualizado do portal DUIT e implemente uma nova versão na implementação existente.'};
  if(txt==='ignored')return {ok:false,message:'O Apps Script ignorou o teste: pode estar instalada uma versão antiga.'};
  if(txt.startsWith('error:'))return {ok:false,message:txt.slice(0,260)};
  return {ok:false,message:'Resposta inesperada do Apps Script (HTTP '+response.status+'): '+txt.slice(0,160)};
}

async function notifyPostChanged(postId,action='upsert'){
  try{
    const post=db.prepare('SELECT * FROM social_posts WHERE id=?').get(Number(postId));
    if(!post&&action!=='delete') return;
    const userId=post?.user_id||db.prepare('SELECT user_id FROM calendar_sheet_mappings m JOIN social_posts p ON p.id=m.post_id WHERE m.post_id=? LIMIT 1').get(Number(postId))?.user_id;
    if(!userId)return;
    const link=getLink(userId);
    if(!link||!Number(link.enabled)||!link.apps_script_url)return;
    const mappings=getMappings(postId);
    const requestId=beginSheetAck(userId);
    const body={
      secret:link.webhook_secret,source:'portal',action,request_id:requestId,
      post:post?postPayload(post):{id:Number(postId),user_id:Number(userId)},
      mappings
    };
    const r=await fetch(link.apps_script_url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const responseBody=await r.text();
    const ack=await waitSheetAck(requestId,1800);
    if(ack?.status==='error')throw new Error('Apps Script: '+String(ack.detail||'erro de execução'));
    if(ack?.status!=='ok'){
      const answer=sheetScriptResponse(r,responseBody);
      if(!answer.ok)throw new Error('Sem confirmação do Apps Script: '+answer.message);
    }
    db.prepare(`UPDATE calendar_sheet_links SET last_portal_sync_at=datetime('now'),last_error=NULL,updated_at=datetime('now') WHERE user_id=?`).run(userId);
  }catch(e){
    try{
      const row=db.prepare('SELECT user_id FROM social_posts WHERE id=?').get(Number(postId));
      if(row)db.prepare(`UPDATE calendar_sheet_links SET last_error=?,updated_at=datetime('now') WHERE user_id=?`).run(String(e.message||e).slice(0,500),row.user_id);
    }catch(_){}
    console.warn('[calendar-sheet] portal -> sheet:',e.message);
  }
}

function appsScriptTemplate(link,baseUrl){
  const secret=link.webhook_secret;
  const webhook=(baseUrl||'https://cliente.duit.pt')+'/api/google-sheets/calendar/webhook';
  return `const DUIT_WEBHOOK = ${JSON.stringify(webhook)};
const DUIT_SECRET = ${JSON.stringify(secret)};
const DUIT_SPREADSHEET_ID = ${JSON.stringify(link.spreadsheet_id||'')};
const SYNC_SHEET = '_DUIT_SYNC';
const DUIT_ACK_URL = 'https://cliente.duit.pt/api/google-sheets/calendar/ack';

function duitSpreadsheet_() {
  return DUIT_SPREADSHEET_ID ? SpreadsheetApp.openById(DUIT_SPREADSHEET_ID) : SpreadsheetApp.getActive();
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('DUIT')
    .addItem('Ativar sincronização automática', 'duitInstallTriggers')
    .addItem('Sincronizar plano completo agora', 'duitSyncAll')
    .addToUi();
}

function duitInstallTriggers() {
  const ss = duitSpreadsheet_();
  ScriptApp.getProjectTriggers().forEach(t => {
    if (['duitHandleEdit','duitRefresh'].includes(t.getHandlerFunction())) ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('duitHandleEdit').forSpreadsheet(ss).onEdit().create();
  ScriptApp.newTrigger('duitRefresh').timeBased().everyHours(6).create();
  const result=duitSyncAll_(false);
  SpreadsheetApp.getUi().alert('Sincronização automática DUIT ativada.\\n\\n'+result);
}

function duitRefresh() {
  return duitSyncAll_(false);
}

function duitSyncAll() {
  const result=duitSyncAll_(true);
  SpreadsheetApp.getUi().alert(result);
}

function duitSyncAll_(showDetails) {
  const ss=duitSpreadsheet_();
  const byDate={};
  const now=new Date();
  const currentY=now.getFullYear(), currentM=now.getMonth()+1;
  const prevDate=new Date(currentY,currentM-2,1);
  const prevY=prevDate.getFullYear(), prevM=prevDate.getMonth()+1;
  for(const sheet of ss.getSheets()){
    if(sheet.getName()===SYNC_SHEET)continue;
    const my=duitMonthYear_(sheet); if(!my)continue;
    const allowed=(my.year===currentY&&my.month===currentM)||(my.year===prevY&&my.month===prevM);
    if(!allowed)continue;
    const lastRow=Math.min(sheet.getLastRow(),250), lastCol=Math.min(sheet.getLastColumn(),26);
    if(lastRow<1||lastCol<2)continue;
    const vals=sheet.getRange(1,1,lastRow,lastCol).getDisplayValues();
    for(let r=0;r<vals.length;r++){
      const field=duitPortalField_(vals[r][0]); if(!field)continue;
      for(let col=1;col<lastCol;col++){
        const value=String(vals[r][col]||'');
        if(!value.trim())continue;
        const dayRow=duitDayRowForContentRow_(sheet,r+1);
        if(!dayRow)continue;
        const day=Number(sheet.getRange(dayRow,col+1).getDisplayValue());
        if(!(day>=1&&day<=31))continue;
        const mm=String(my.month).padStart(2,'0'),dd=String(day).padStart(2,'0');
        const date=my.year+'-'+mm+'-'+dd;
        if(!byDate[date])byDate[date]={date:date,text:'',inspiration:'',story:''};
        byDate[date][field]=value;
      }
    }
  }
  const entries=Object.values(byDate).filter(x =>
    String(x.text||'').trim() || String(x.inspiration||'').trim() || String(x.story||'').trim()
  );
  if(!entries.length)return 'Não encontrei conteúdos preenchidos para sincronizar.';
  const url=DUIT_WEBHOOK.replace('/webhook','/bulk-sync');
  const resp=UrlFetchApp.fetch(url,{
    method:'post',contentType:'application/json',muteHttpExceptions:true,
    payload:JSON.stringify({secret:DUIT_SECRET,source:'sheet',script_url:ScriptApp.getService().getUrl(),entries:entries})
  });
  const code=resp.getResponseCode(),body=resp.getContentText();
  if(code<200||code>=300)return 'Erro na sincronização ('+code+'): '+body;
  try{
    const x=JSON.parse(body);
    return 'Plano sincronizado: '+x.created+' criados, '+x.updated+' atualizados, '+x.conflicts+' conflitos.';
  }catch(_){return 'Plano sincronizado.'}
}

function duitMonthYear_(sheet) {
  const title = sheet.getName();
  let m = title.match(/(0?[1-9]|1[0-2])[-\\s](20\\d{2})/);
  if (m) return {month:Number(m[1]),year:Number(m[2])};
  const months={janeiro:1,fevereiro:2,março:3,abril:4,maio:5,junho:6,julho:7,agosto:8,setembro:9,outubro:10,novembro:11,dezembro:12};
  const low=title.toLowerCase();
  for (const k in months) {
    const y=(title.match(/20\\d{2}/)||[])[0];
    if (low.includes(k)&&y) return {month:months[k],year:Number(y)};
  }
  try {
    const head=String(sheet.getRange('B1').getDisplayValue()||'').toLowerCase();
    for (const k in months) {
      const y=(head.match(/20\\d{2}/)||[])[0];
      if (head.includes(k)&&y) return {month:months[k],year:Number(y)};
    }
  } catch(_){}
  return null;
}

function duitPortalField_(label) {
  const s=String(label||'').trim().toLowerCase();
  if (s==='inspiração'||s==='inspiracao') return 'inspiration';
  if (s==='post') return 'text';
  if (s==='stories'||s==='story') return 'story';
  return null;
}

function duitSheetLabel_(field) {
  if (field==='inspiration') return ['inspiração','inspiracao'];
  if (field==='text') return ['post'];
  if (field==='story') return ['stories','story'];
  return [];
}

function duitDayRowForContentRow_(sheet,row) {
  // Estrutura real da folha:
  // inspiração -> post -> stories -> DATA
  // Portanto o conteúdo pertence à primeira linha DATA válida logo abaixo.
  const maxRow=Math.min(sheet.getLastRow(),row+5);
  for(let r=row+1;r<=maxRow;r++){
    const vals=sheet.getRange(r,2,1,7).getDisplayValues()[0];
    const nums=vals.map(v=>Number(v));
    const valid=nums.filter(v=>v>=1&&v<=31);

    if(valid.length>=2){
      let sequential=0,prev=null;
      for(const n of nums){
        if(!(n>=1&&n<=31)) continue;
        if(prev===null || n===prev+1 || (prev>=28&&n===1)) sequential++;
        prev=n;
      }
      if(sequential>=2) return r;
    }

    const label=String(sheet.getRange(r,1).getDisplayValue()||'').trim().toLowerCase();
    if(['inspiração','inspiracao','post','stories','story'].includes(label) && r>row+3) break;
  }
  return null;
}

function duitDateForRange_(range) {
  const sheet=range.getSheet();
  const my=duitMonthYear_(sheet); if(!my) return null;
  const row=range.getRow(), col=range.getColumn();
  const field=duitPortalField_(sheet.getRange(row,1).getDisplayValue());
  if(!field) return null;
  const dayRow=duitDayRowForContentRow_(sheet,row);
  if(!dayRow) return null;
  const day=Number(sheet.getRange(dayRow,col).getDisplayValue());
  if(!(day>=1&&day<=31)) return null;
  const mm=String(my.month).padStart(2,'0'), dd=String(day).padStart(2,'0');
  return {date:my.year+'-'+mm+'-'+dd,field};
}

function duitFindCell_(date,field) {
  const ss=duitSpreadsheet_();
  const d=String(date||'').match(/^(20\\d{2})-(\\d{2})-(\\d{2})$/); if(!d)return null;
  const year=Number(d[1]),month=Number(d[2]),day=Number(d[3]);
  const labels=duitSheetLabel_(field);
  for(const sheet of ss.getSheets()){
    if(sheet.getName()===SYNC_SHEET)continue;
    const my=duitMonthYear_(sheet);
    if(!my||my.year!==year||my.month!==month)continue;
    const lastRow=Math.min(sheet.getLastRow(),250), lastCol=Math.min(sheet.getLastColumn(),26);
    const vals=sheet.getRange(1,1,lastRow,lastCol).getDisplayValues();
    for(let r=0;r<vals.length;r++){
      const label=String(vals[r][0]||'').trim().toLowerCase();
      if(!labels.includes(label))continue;
      const dayRow=duitDayRowForContentRow_(sheet,r+1);
      if(!dayRow)continue;
      for(let col=1;col<lastCol;col++){
        if(Number(sheet.getRange(dayRow,col+1).getDisplayValue())===day) return sheet.getRange(r+1,col+1);
      }
    }
  }
  return null;
}

// Procura a célula numérica do próprio dia na aba mensal.
// O modelo da folha apresenta o número no CABEÇALHO da semana, antes do
// conteúdo, e não na linha de data abaixo do conteúdo.
function duitFindDayNumberCell_(date) {
  const matched=String(date||'').match(/^(20\\d{2})-(\\d{2})-(\\d{2})$/);
  if(!matched)return null;
  const year=Number(matched[1]),month=Number(matched[2]),day=Number(matched[3]);
  const ss=duitSpreadsheet_();
  for(const sheet of ss.getSheets()){
    if(sheet.getName()===SYNC_SHEET)continue;
    const my=duitMonthYear_(sheet);
    if(!my||my.year!==year||my.month!==month)continue;
    const rows=Math.min(sheet.getLastRow(),250);
    const cols=Math.min(sheet.getLastColumn(),26);
    if(rows<1||cols<3)continue;
    const values=sheet.getRange(1,1,rows,cols).getDisplayValues();
    for(let r=0;r<rows;r++){
      // As linhas dos dias possuem vários números de dia juntos.
      // Impede confundir números que aparecem no corpo dos posts.
      let numericCount=0;
      for(let col=1;col<cols;col++){
        const v=String(values[r][col]||'').trim();
        if(/^\\d{1,2}$/.test(v)&&Number(v)>=1&&Number(v)<=31)
          numericCount++;
      }
      if(numericCount<2)continue;
      for(let col=1;col<cols;col++){
        const v=String(values[r][col]||'').trim();
        if(/^\\d{1,2}$/.test(v)&&Number(v)===day)
          return sheet.getRange(r+1,col+1);
      }
    }
  }
  return null;
}

// Pinta o bloco vertical COMPLETO desse dia com o verde DUIT escolhido.
// Na folha, a DATA fica na base do bloco; o bloco começa imediatamente
// depois da linha de números da semana anterior e inclui o número do dia.
// Não modifica texto, links, fórmulas, bordas ou células de outros dias.
function duitColorPublishedDay_(date,status) {
  const dayCell=duitFindDayNumberCell_(date);
  if(!dayCell)return;
  const sheet=dayCell.getSheet(),endRow=dayCell.getRow(),col=dayCell.getColumn();
  const props=PropertiesService.getScriptProperties();
  const legacy='DUIT_DAY_BG_'+sheet.getSheetId()+'_'+endRow+'_'+col;
  const legacyText=legacy+'_TEXT';

  // Encontrar a linha de datas da semana anterior, na mesma folha.
  let startRow=1;
  if(endRow>1){
    const grid=sheet.getRange(1,1,endRow-1,Math.min(sheet.getLastColumn(),26)).getDisplayValues();
    for(let r=grid.length-1;r>=0;r--){
      let count=0;
      for(let j=1;j<grid[r].length;j++){
        const value=String(grid[r][j]||'').trim();
        if(/^\\d{1,2}$/.test(value)&&Number(value)>=1&&Number(value)<=31)count++;
      }
      if(count>=2){startRow=r+2;break;}
    }
  }
  const range=sheet.getRange(startRow,col,endRow-startRow+1,1);
  const key='DUIT_DAY_BLOCK_'+sheet.getSheetId()+'_'+endRow+'_'+col;
  const saved=props.getProperty(key);

  if(status==='published'){
    if(saved===null){
      const colors=range.getBackgrounds();
      // Migrar corretamente uma data que o script antigo já pintou.
      const oldBackground=props.getProperty(legacy);
      if(oldBackground!==null)colors[colors.length-1][0]=oldBackground;
      props.setProperty(key,JSON.stringify({startRow:startRow,colors:colors}));
    }
    // Verde fornecido para o bloco completo, incluindo a célula da data.
    range.setBackground('#7FAB55');
    // O script anterior alterava também a fonte do número do dia:
    // recuperar a cor original do texto.
    const originalText=props.getProperty(legacyText);
    if(originalText!==null)dayCell.setFontColor(originalText);
    if(props.getProperty(legacy)!==null)props.deleteProperty(legacy);
    if(originalText!==null)props.deleteProperty(legacyText);
  }else{
    if(saved!==null){
      const previous=JSON.parse(saved);
      sheet.getRange(previous.startRow,col,previous.colors.length,1)
        .setBackgrounds(previous.colors);
      props.deleteProperty(key);
    }else{
      // Compatibilidade: reverter também datas pintadas pelo código antigo.
      const original=props.getProperty(legacy);
      if(original!==null){
        dayCell.setBackground(original);
        props.deleteProperty(legacy);
      }
    }
    const originalText=props.getProperty(legacyText);
    if(originalText!==null){
      dayCell.setFontColor(originalText);
      props.deleteProperty(legacyText);
    }
  }
}

function duitHandleEdit(e) {
  try {
    if(!e||!e.range||e.range.getSheet().getName()===SYNC_SHEET)return;
    const ctx=duitDateForRange_(e.range); if(!ctx)return;
    const value=e.range.getDisplayValue();
    UrlFetchApp.fetch(DUIT_WEBHOOK,{
      method:'post',contentType:'application/json',muteHttpExceptions:true,
      payload:JSON.stringify({
        secret:DUIT_SECRET,source:'sheet',date:ctx.date,field:ctx.field,value:value,
        script_url:ScriptApp.getService().getUrl(),
        sheet_name:e.range.getSheet().getName(),cell_a1:e.range.getA1Notation()
      })
    });
  } catch(err) { console.log(err); }
}

function duitConfirmReceipt_(requestId,status,detail) {
  if(!requestId||!/^[0-9a-f-]{36}$/.test(String(requestId)))return;
  try{
    UrlFetchApp.fetch(DUIT_ACK_URL,{
      method:'post',contentType:'application/json',muteHttpExceptions:true,
      payload:JSON.stringify({secret:DUIT_SECRET,request_id:String(requestId),
        status:status,detail:String(detail||'').slice(0,300)})
    });
  }catch(err){console.log('DUIT confirmação:',err);}
}
function doPost(e) {
  let requestId='';
  try {
    const x=JSON.parse(e.postData.contents||'{}');
    if(x.secret!==DUIT_SECRET)return ContentService.createTextOutput('forbidden');
    if(x.source!=='portal')return ContentService.createTextOutput('ignored');
    requestId=x.request_id||'';
    if(x.action==='ping'){
      duitConfirmReceipt_(requestId,'ok','ping');
      return ContentService.createTextOutput('ok');
    }
    const post=x.post||{};
    if(x.action==='delete'){
      ['text','inspiration','story'].forEach(f=>{
        const cell=duitFindCell_(post.date,f);
        if(cell)cell.clearContent();
      });
      duitConfirmReceipt_(requestId,'ok','delete');
      return ContentService.createTextOutput('ok');
    }
    ['text','inspiration','story'].forEach(f=>{
      if(!Object.prototype.hasOwnProperty.call(post,f))return;
      const cell=duitFindCell_(post.date,f);
      if(cell)cell.setValue(post[f]??'');
    });
    if(['draft','scheduled','published','cancelled'].includes(post.status))
      duitColorPublishedDay_(post.date,post.status);
    duitConfirmReceipt_(requestId,'ok','upsert');
    return ContentService.createTextOutput('ok');
  }catch(err){
    duitConfirmReceipt_(requestId,'error',err.message);
    return ContentService.createTextOutput('error: '+err.message);
  }
}
`;
}

function register(app){
  // Confirmação assinada pelo Apps Script após a execução efetiva,
  // independente do redirecionamento ContentService do Google.
  app.post('/api/google-sheets/calendar/ack',(req,res)=>{
    const b=req.body||{};
    const id=String(b.request_id||'');
    if(!/^[0-9a-f-]{36}$/.test(id))return res.status(400).json({error:'ID inválido'});
    const pending=db.prepare('SELECT * FROM calendar_sheet_delivery_acks WHERE request_id=?').get(id);
    if(!pending)return res.status(404).json({error:'Pedido não encontrado'});
    const link=getLink(pending.user_id);
    if(!link||!link.webhook_secret||b.secret!==link.webhook_secret)
      return res.status(403).json({error:'Não autorizado'});
    const status=b.status==='ok'?'ok':'error';
    db.prepare("UPDATE calendar_sheet_delivery_acks SET status=?,detail=? WHERE request_id=? AND status='pending'")
      .run(status,clean(b.detail,300),id);
    return res.json({ok:true});
  });

  app.get('/api/calendar-sheet-links/:userId',requireAdmin,(req,res)=>{
    const user=db.prepare(`SELECT id,name,company FROM users WHERE id=? AND role='client' AND parent_user_id IS NULL`).get(Number(req.params.userId));
    if(!user)return res.status(404).json({error:'Cliente não encontrado.'});
    const link=getLink(user.id);
    res.json(link||{user_id:user.id,client_name:user.name,client_company:user.company,enabled:0});
  });

  app.put('/api/calendar-sheet-links/:userId',requireAdmin,(req,res)=>{
    const userId=Number(req.params.userId),user=db.prepare(`SELECT id FROM users WHERE id=? AND role='client' AND parent_user_id IS NULL`).get(userId);
    if(!user)return res.status(404).json({error:'Cliente não encontrado.'});
    const b=req.body||{},url=clean(b.spreadsheet_url,1500),sheetId=sheetIdFromUrl(url||b.spreadsheet_id);
    let cur=getLink(userId),secret=cur?.webhook_secret||newSecret();
    db.prepare(`INSERT INTO calendar_sheet_links(user_id,spreadsheet_id,spreadsheet_url,apps_script_url,webhook_secret,enabled,updated_at)
      VALUES(?,?,?,?,?,?,datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET spreadsheet_id=excluded.spreadsheet_id,spreadsheet_url=excluded.spreadsheet_url,apps_script_url=excluded.apps_script_url,enabled=excluded.enabled,updated_at=datetime('now')`)
      .run(userId,sheetId,url,clean(b.apps_script_url,1500),secret,b.enabled===false?0:1);
    res.json(getLink(userId));
  });

  app.post('/api/calendar-sheet-links/:userId/rotate-secret',requireAdmin,(req,res)=>{
    const userId=Number(req.params.userId);if(!getLink(userId))return res.status(404).json({error:'Ligação não encontrada.'});
    db.prepare(`UPDATE calendar_sheet_links SET webhook_secret=?,updated_at=datetime('now') WHERE user_id=?`).run(newSecret(),userId);
    res.json(getLink(userId));
  });

  app.get('/api/calendar-sheet-links/:userId/script',requireAdmin,(req,res)=>{
    const link=getLink(Number(req.params.userId));if(!link)return res.status(404).json({error:'Guarde primeiro a ligação à Sheet.'});
    const base='https://cliente.duit.pt';
    res.type('text/plain').send(appsScriptTemplate(link,base));
  });

  app.get('/api/calendar-sheet-links/:userId/mappings',requireAdmin,(req,res)=>{
    const rows=db.prepare(`SELECT m.*,p.date,p.text,p.inspiration,p.story,p.status
      FROM calendar_sheet_mappings m JOIN social_posts p ON p.id=m.post_id
      WHERE p.user_id=? ORDER BY p.date,m.post_id,m.field`).all(Number(req.params.userId));
    res.json(rows);
  });

  app.put('/api/calendar-sheet-mappings/:postId/:field',requireAdmin,(req,res)=>{
    const postId=Number(req.params.postId),field=String(req.params.field||'');
    if(!['text','inspiration','story','date','status'].includes(field))return res.status(400).json({error:'Campo inválido.'});
    const post=db.prepare('SELECT * FROM social_posts WHERE id=?').get(postId);if(!post)return res.status(404).json({error:'Post não encontrado.'});
    const sheet=clean(req.body?.sheet_name,200),cell=clean(req.body?.cell_a1,50);
    if(!sheet||!cell)return res.status(400).json({error:'sheet_name e cell_a1 são obrigatórios.'});
    db.prepare(`INSERT INTO calendar_sheet_mappings(post_id,field,sheet_name,cell_a1) VALUES(?,?,?,?)
      ON CONFLICT(post_id,field) DO UPDATE SET sheet_name=excluded.sheet_name,cell_a1=excluded.cell_a1,updated_at=datetime('now')`).run(postId,field,sheet,cell);
    res.json({ok:true});
  });

  app.delete('/api/calendar-sheet-mappings/:postId/:field',requireAdmin,(req,res)=>{
    db.prepare('DELETE FROM calendar_sheet_mappings WHERE post_id=? AND field=?').run(Number(req.params.postId),String(req.params.field));
    res.json({ok:true});
  });

  app.post('/api/google-sheets/calendar/webhook',(req,res)=>{
    const b=req.body||{},field=String(b.field||''),value=b.value==null?'':String(b.value);
    if(!['text','inspiration','story','date','status'].includes(field))return res.status(400).json({error:'Campo inválido.'});

    let post=null;
    if(Number(b.post_id||0)){
      post=db.prepare('SELECT * FROM social_posts WHERE id=?').get(Number(b.post_id));
    } else if(/^\d{4}-\d{2}-\d{2}$/.test(String(b.date||''))){
      const links=db.prepare(`SELECT user_id,webhook_secret FROM calendar_sheet_links WHERE enabled=1`).all();
      const link=links.find(x=>String(x.webhook_secret)===String(b.secret||''));
      if(!link)return res.status(403).json({error:'Ligação inválida.'});
      const rows=db.prepare(`SELECT * FROM social_posts WHERE user_id=? AND date=? ORDER BY id`).all(link.user_id,String(b.date));
      if(rows.length===0)return res.status(404).json({error:'Não existe post para essa data.'});
      if(rows.length>1)return res.status(409).json({error:'Existe mais do que um post nessa data.'});
      post=rows[0];
    }
    if(!post)return res.status(404).json({error:'Post não encontrado.'});

    const link=getLink(post.user_id);
    if(!link||!Number(link.enabled)||String(b.secret||'')!==String(link.webhook_secret))return res.status(403).json({error:'Ligação inválida.'});
    if(b.script_url&&/^https:\/\/script\.google\.com\/macros\/s\//.test(String(b.script_url))){
      db.prepare(`UPDATE calendar_sheet_links SET apps_script_url=?,updated_at=datetime('now') WHERE user_id=?`)
        .run(String(b.script_url).slice(0,1500),post.user_id);
    }
    if(field==='date'&&!/^\d{4}-\d{2}-\d{2}$/.test(value))return res.status(400).json({error:'Data deve estar em YYYY-MM-DD.'});
    if(field==='status'&&!['draft','scheduled','published','cancelled'].includes(value))return res.status(400).json({error:'Estado inválido.'});

    db.prepare(`UPDATE social_posts SET ${field}=? WHERE id=?`).run(value||((field==='inspiration'||field==='story')?null:''),post.id);
    if(b.sheet_name&&b.cell_a1){
      db.prepare(`INSERT INTO calendar_sheet_mappings(post_id,field,sheet_name,cell_a1) VALUES(?,?,?,?)
        ON CONFLICT(post_id,field) DO UPDATE SET sheet_name=excluded.sheet_name,cell_a1=excluded.cell_a1,updated_at=datetime('now')`)
        .run(post.id,field,clean(b.sheet_name,200),clean(b.cell_a1,50));
    }
    db.prepare(`UPDATE calendar_sheet_links SET last_sheet_event_at=datetime('now'),last_error=NULL,updated_at=datetime('now') WHERE user_id=?`).run(post.user_id);
    res.json({ok:true,post_id:post.id,date:post.date,field});
  });

  app.post('/api/google-sheets/calendar/bulk-sync',(req,res)=>{
    const b=req.body||{},entries=Array.isArray(b.entries)?b.entries:[];
    const links=db.prepare(`SELECT user_id,webhook_secret FROM calendar_sheet_links WHERE enabled=1`).all();
    const link=links.find(x=>String(x.webhook_secret)===String(b.secret||''));
    if(!link)return res.status(403).json({error:'Ligação inválida.'});
    if(b.script_url&&/^https:\/\/script\.google\.com\/macros\/s\//.test(String(b.script_url))){
      db.prepare(`UPDATE calendar_sheet_links SET apps_script_url=?,updated_at=datetime('now') WHERE user_id=?`)
        .run(String(b.script_url).slice(0,1500),link.user_id);
    }
    if(entries.length>1000)return res.status(400).json({error:'Demasiados registos numa só sincronização.'});

    let created=0,updated=0,ignored=0,conflicts=0;
    const tx=db.transaction(()=>{
      for(const raw of entries){
        const date=String(raw.date||'');
        if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){ignored++;continue;}
        const text=raw.text==null?'':String(raw.text);
        const inspiration=raw.inspiration==null?'':String(raw.inspiration);
        const story=raw.story==null?'':String(raw.story);
        if(!text.trim()&&!inspiration.trim()&&!story.trim()){ignored++;continue;}

        const rows=db.prepare(`SELECT * FROM social_posts WHERE user_id=? AND date=? ORDER BY id`).all(link.user_id,date);
        if(rows.length>1){conflicts++;continue;}
        if(rows.length===1){
          db.prepare(`UPDATE social_posts SET text=?,inspiration=?,story=? WHERE id=?`)
            .run(text,inspiration||null,story||null,rows[0].id);
          updated++;
        }else{
          db.prepare(`INSERT INTO social_posts(user_id,network,date,text,inspiration,story,status)
            VALUES(?,?,?,?,?,?,?)`).run(link.user_id,'instagram',date,text,inspiration||null,story||null,'draft');
          created++;
        }
      }
    });
    tx();
    db.prepare(`UPDATE calendar_sheet_links SET last_sheet_event_at=datetime('now'),last_error=NULL,updated_at=datetime('now') WHERE user_id=?`).run(link.user_id);
    res.json({ok:true,created,updated,ignored,conflicts,total:entries.length});
  });

  app.post('/api/calendar-sheet-links/:userId/test',requireAdmin,async(req,res)=>{
    const link=getLink(Number(req.params.userId));if(!link)return res.status(404).json({error:'Ligação não encontrada.'});
    if(!link.apps_script_url)return res.status(400).json({error:'Falta o URL do Apps Script.'});
    try{
      const requestId=beginSheetAck(link.user_id);
      const r=await fetch(link.apps_script_url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:link.webhook_secret,source:'portal',action:'ping',request_id:requestId,post:{id:0}})});
      const body=await r.text();
      const ack=await waitSheetAck(requestId,3500);
      const result=ack?.status==='ok'
        ? {ok:true,message:'Confirmado diretamente pelo Apps Script (independente do HTTP Google).'}
        : ack?.status==='error'
          ? {ok:false,message:'Apps Script devolveu erro: '+String(ack.detail||'sem detalhe')}
          : sheetScriptResponse(r,body);
      db.prepare(`UPDATE calendar_sheet_links SET last_portal_sync_at=CASE WHEN ? THEN datetime('now') ELSE last_portal_sync_at END,last_error=? WHERE user_id=?`)
        .run(result.ok?1:0,result.ok?null:result.message,link.user_id);
      res.set('Cache-Control','no-store');
      res.json({ok:result.ok,status:r.status,message:result.message,
        google_response:body.trim().slice(0,500),
        google_content_type:r.headers.get('content-type')||'desconhecido',
        test_version:'duit-google-test-v3'});
    }catch(e){
      const code=String(e.cause?.code||e.code||'').slice(0,60);
      const msg=String(e.message||e||'Erro desconhecido').slice(0,250);
      const detail='Não foi possível contactar o Apps Script: '+msg+(code?' ('+code+')':'')+'. Confirme o URL da implementação Web App (/exec), o acesso público e a ligação à Internet.';
      db.prepare(`UPDATE calendar_sheet_links SET last_error=? WHERE user_id=?`).run(detail.slice(0,500),link.user_id);
      console.warn('[calendar-sheet] teste Apps Script:',msg,code);
      res.status(502).json({ok:false,error:detail,message:detail});
    }
  });
}

module.exports={register,notifyPostChanged};
