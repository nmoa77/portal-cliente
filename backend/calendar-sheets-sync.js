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

async function notifyPostChanged(postId,action='upsert'){
  try{
    const post=db.prepare('SELECT * FROM social_posts WHERE id=?').get(Number(postId));
    if(!post&&action!=='delete') return;
    const userId=post?.user_id||db.prepare('SELECT user_id FROM calendar_sheet_mappings m JOIN social_posts p ON p.id=m.post_id WHERE m.post_id=? LIMIT 1').get(Number(postId))?.user_id;
    if(!userId)return;
    const link=getLink(userId);
    if(!link||!Number(link.enabled)||!link.apps_script_url)return;
    const mappings=getMappings(postId);
    const body={
      secret:link.webhook_secret,source:'portal',action,
      post:post?postPayload(post):{id:Number(postId),user_id:Number(userId)},
      mappings
    };
    const r=await fetch(link.apps_script_url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(!r.ok)throw new Error('Apps Script '+r.status);
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

function onOpen() {
  SpreadsheetApp.getUi().createMenu('DUIT')
    .addItem('Ativar sincronização', 'duitInstallTriggers')
    .addItem('Ligar célula selecionada a um post', 'duitMapSelectedCell')
    .addItem('Ver ligações', 'duitOpenSyncSheet')
    .addToUi();
}

function duitInstallTriggers() {
  const ss = duitSpreadsheet_();
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === 'duitHandleEdit') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('duitHandleEdit').forSpreadsheet(ss).onEdit().create();
  SpreadsheetApp.getUi().alert('Sincronização DUIT ativada nesta folha.');
}

function duitSpreadsheet_() {
  return DUIT_SPREADSHEET_ID ? SpreadsheetApp.openById(DUIT_SPREADSHEET_ID) : SpreadsheetApp.getActive();
}

function duitSyncSheet_() {
  const ss = duitSpreadsheet_();
  let sh = ss.getSheetByName(SYNC_SHEET);
  if (!sh) {
    sh = ss.insertSheet(SYNC_SHEET);
    sh.getRange(1,1,1,4).setValues([['post_id','field','sheet_name','cell_a1']]);
    sh.hideSheet();
  }
  return sh;
}

function duitOpenSyncSheet() {
  const sh = duitSyncSheet_();
  sh.showSheet();
  duitSpreadsheet_().setActiveSheet(sh);
}

function duitMapSelectedCell() {
  const ss = duitSpreadsheet_();
  const range = ss.getActiveRange();
  if (!range) return;
  const ui = SpreadsheetApp.getUi();
  const p = ui.prompt('DUIT · ID do post', 'Indique o ID do post no portal.', ui.ButtonSet.OK_CANCEL);
  if (p.getSelectedButton() !== ui.Button.OK) return;
  const postId = Number(p.getResponseText());
  if (!postId) return ui.alert('ID inválido.');
  const f = ui.prompt('DUIT · Campo', 'Use: text, inspiration, story, date ou status', ui.ButtonSet.OK_CANCEL);
  if (f.getSelectedButton() !== ui.Button.OK) return;
  const field = String(f.getResponseText()||'').trim();
  if (!['text','inspiration','story','date','status'].includes(field)) return ui.alert('Campo inválido.');
  const sh = duitSyncSheet_();
  const values = sh.getDataRange().getValues();
  for (let i=1;i<values.length;i++) {
    if (Number(values[i][0])===postId && String(values[i][1])===field) {
      sh.getRange(i+1,1,1,4).setValues([[postId,field,range.getSheet().getName(),range.getA1Notation()]]);
      sh.hideSheet();
      return ui.alert('Ligação atualizada.');
    }
  }
  sh.appendRow([postId,field,range.getSheet().getName(),range.getA1Notation()]);
  sh.hideSheet();
  ui.alert('Célula ligada ao portal.');
}

function duitHandleEdit(e) {
  try {
    if (!e || !e.range || e.range.getSheet().getName()===SYNC_SHEET) return;
    const ss=e.source, sh=ss.getSheetByName(SYNC_SHEET); if(!sh)return;
    const rows=sh.getDataRange().getValues();
    const sheetName=e.range.getSheet().getName(), a1=e.range.getA1Notation();
    for(let i=1;i<rows.length;i++){
      if(String(rows[i][2])===sheetName && String(rows[i][3])===a1){
        UrlFetchApp.fetch(DUIT_WEBHOOK,{
          method:'post',contentType:'application/json',muteHttpExceptions:true,
          payload:JSON.stringify({secret:DUIT_SECRET,source:'sheet',post_id:Number(rows[i][0]),field:String(rows[i][1]),value:e.value==null?'':e.value,sheet_name:sheetName,cell_a1:a1})
        });
        break;
      }
    }
  } catch(err) { console.log(err); }
}

function doPost(e) {
  try {
    const x=JSON.parse(e.postData.contents||'{}');
    if(x.secret!==DUIT_SECRET) return ContentService.createTextOutput('forbidden');
    if(x.source!=='portal') return ContentService.createTextOutput('ignored');
    const ss=duitSpreadsheet_(), sh=duitSyncSheet_();
    const rows=sh.getDataRange().getValues();
    const post=x.post||{};
    for(let i=1;i<rows.length;i++){
      if(Number(rows[i][0])!==Number(post.id)) continue;
      const field=String(rows[i][1]), tab=ss.getSheetByName(String(rows[i][2])); if(!tab)continue;
      const range=tab.getRange(String(rows[i][3]));
      if(x.action==='delete') range.clearContent();
      else if(Object.prototype.hasOwnProperty.call(post,field)) range.setValue(post[field]??'');
    }
    return ContentService.createTextOutput('ok');
  } catch(err) {
    return ContentService.createTextOutput('error: '+err.message);
  }
}
`;
}

function register(app){
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
    const b=req.body||{},postId=Number(b.post_id||0),field=String(b.field||''),value=b.value==null?'':String(b.value);
    if(!postId||!['text','inspiration','story','date','status'].includes(field))return res.status(400).json({error:'Payload inválido.'});
    const post=db.prepare('SELECT * FROM social_posts WHERE id=?').get(postId);if(!post)return res.status(404).json({error:'Post não encontrado.'});
    const link=getLink(post.user_id);if(!link||!Number(link.enabled)||String(b.secret||'')!==String(link.webhook_secret))return res.status(403).json({error:'Ligação inválida.'});
    if(field==='date'&&!/^\d{4}-\d{2}-\d{2}$/.test(value))return res.status(400).json({error:'Data deve estar em YYYY-MM-DD.'});
    if(field==='status'&&!['draft','scheduled','published','cancelled'].includes(value))return res.status(400).json({error:'Estado inválido.'});
    db.prepare(`UPDATE social_posts SET ${field}=? WHERE id=?`).run(value||((field==='inspiration'||field==='story')?null:''),postId);
    if(b.sheet_name&&b.cell_a1){
      db.prepare(`INSERT INTO calendar_sheet_mappings(post_id,field,sheet_name,cell_a1) VALUES(?,?,?,?)
        ON CONFLICT(post_id,field) DO UPDATE SET sheet_name=excluded.sheet_name,cell_a1=excluded.cell_a1,updated_at=datetime('now')`)
        .run(postId,field,clean(b.sheet_name,200),clean(b.cell_a1,50));
    }
    db.prepare(`UPDATE calendar_sheet_links SET last_sheet_event_at=datetime('now'),last_error=NULL,updated_at=datetime('now') WHERE user_id=?`).run(post.user_id);
    res.json({ok:true,post_id:postId,field});
  });

  app.post('/api/calendar-sheet-links/:userId/test',requireAdmin,async(req,res)=>{
    const link=getLink(Number(req.params.userId));if(!link)return res.status(404).json({error:'Ligação não encontrada.'});
    if(!link.apps_script_url)return res.status(400).json({error:'Falta o URL do Apps Script.'});
    try{
      const r=await fetch(link.apps_script_url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:link.webhook_secret,source:'portal',action:'ping',post:{id:0}})});
      const text=await r.text();
      db.prepare(`UPDATE calendar_sheet_links SET last_portal_sync_at=datetime('now'),last_error=NULL WHERE user_id=?`).run(link.user_id);
      res.json({ok:r.ok,status:r.status,response:text.slice(0,300)});
    }catch(e){
      db.prepare(`UPDATE calendar_sheet_links SET last_error=? WHERE user_id=?`).run(String(e.message||e).slice(0,500),link.user_id);
      res.status(502).json({error:'Não foi possível contactar o Apps Script.'});
    }
  });
}

module.exports={register,notifyPostChanged};
