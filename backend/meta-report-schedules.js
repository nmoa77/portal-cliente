const db=require('./db');
const {requireAdmin}=require('./auth');

module.exports=function installMetaReportSchedules(app){
  db.exec(`CREATE TABLE IF NOT EXISTS meta_report_schedules (
    user_id INTEGER PRIMARY KEY,
    enabled INTEGER NOT NULL DEFAULT 1,
    duration_months INTEGER NOT NULL DEFAULT 6,
    remaining_runs INTEGER NOT NULL DEFAULT 6,
    start_month TEXT NOT NULL,
    last_run_month TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );`);

  const nowLisbon=()=>{
    const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Lisbon',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hour12:false}).formatToParts(new Date()).reduce((a,x)=>(a[x.type]=x.value,a),{});
    return {year:Number(p.year),month:Number(p.month),day:Number(p.day),hour:Number(p.hour),key:`${p.year}-${p.month}`};
  };
  const previousPeriod=({year,month})=>month===1?{year:year-1,month:12}:{year,month:month-1};
  const currentMonthKey=()=>{const n=nowLisbon();return `${n.year}-${String(n.month).padStart(2,'0')}`;};

  app.get('/api/meta/report-schedules',requireAdmin,(req,res)=>{
    const rows=db.prepare(`SELECT s.*,u.name,u.company,u.email FROM meta_report_schedules s JOIN users u ON u.id=s.user_id ORDER BY COALESCE(u.company,u.name) COLLATE NOCASE`).all();
    res.json(rows);
  });

  app.post('/api/meta/report-schedules/:userId',requireAdmin,(req,res)=>{
    const userId=Number(req.params.userId),months=Math.max(1,Math.min(36,Number(req.body?.months||6)));
    const user=db.prepare(`SELECT id FROM users WHERE id=? AND role='client' AND is_active=1`).get(userId);
    if(!user)return res.status(404).json({error:'Cliente não encontrado ou inativo.'});
    const start=currentMonthKey();
    db.prepare(`INSERT INTO meta_report_schedules(user_id,enabled,duration_months,remaining_runs,start_month,last_run_month,updated_at)
      VALUES(?,1,?,?,?,NULL,datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET enabled=1,duration_months=excluded.duration_months,remaining_runs=excluded.remaining_runs,start_month=excluded.start_month,last_run_month=NULL,updated_at=datetime('now')`)
      .run(userId,months,months,start);
    res.json(db.prepare(`SELECT * FROM meta_report_schedules WHERE user_id=?`).get(userId));
  });

  app.delete('/api/meta/report-schedules/:userId',requireAdmin,(req,res)=>{
    db.prepare(`UPDATE meta_report_schedules SET enabled=0,updated_at=datetime('now') WHERE user_id=?`).run(Number(req.params.userId));
    res.json({ok:true});
  });

  let running=false;
  async function tick(){
    if(running)return;
    const now=nowLisbon();
    if(now.day!==1)return;
    const runKey=`${now.year}-${String(now.month).padStart(2,'0')}`;
    const gen=app.locals.metaReportGenerate;
    if(typeof gen!=='function')return;
    running=true;
    try{
      const schedules=db.prepare(`SELECT * FROM meta_report_schedules WHERE enabled=1 AND remaining_runs>0`).all();
      const prev=previousPeriod(now);
      for(const s of schedules){
        if(s.last_run_month===runKey)continue;
        try{
          await gen(Number(s.user_id),prev.year,prev.month,{send:true});
          const remaining=Math.max(0,Number(s.remaining_runs)-1);
          db.prepare(`UPDATE meta_report_schedules SET remaining_runs=?,last_run_month=?,enabled=?,updated_at=datetime('now') WHERE user_id=?`).run(remaining,runKey,remaining>0?1:0,s.user_id);
        }catch(e){
          console.warn('[meta-report-schedule]',s.user_id,e.message);
        }
      }
    }finally{running=false;}
  }

  setTimeout(tick,20000);
  setInterval(tick,60*60*1000);
};
