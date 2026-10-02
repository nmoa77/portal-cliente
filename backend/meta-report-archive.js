const db=require('./db');
const fs=require('fs');
const path=require('path');
const {requireAuth,requireAdmin}=require('./auth');

module.exports=function installMetaReportArchive(app){
  const cols=db.prepare(`PRAGMA table_info(meta_monthly_reports)`).all().map(c=>c.name);
  if(!cols.includes('viewed_at')) db.exec(`ALTER TABLE meta_monthly_reports ADD COLUMN viewed_at TEXT`);
  if(!cols.includes('downloaded_at')) db.exec(`ALTER TABLE meta_monthly_reports ADD COLUMN downloaded_at TEXT`);
  const reportsDir=()=>process.env.REPORTS_DIR||(process.env.DATABASE_PATH?path.join(path.dirname(process.env.DATABASE_PATH),'meta-reports'):path.join(process.cwd(),'data','meta-reports'));
  const reportPath=name=>path.join(reportsDir(),path.basename(String(name||'')));

  app.get('/api/meta/reports/archive',requireAdmin,(req,res)=>{
    const rows=db.prepare(`SELECT r.id,r.user_id,r.ref_year,r.ref_month,r.status,r.summary_text,r.pdf_path,r.generated_at,r.sent_at,r.viewed_at,r.downloaded_at,r.error_message,r.created_at,r.updated_at,u.name,u.company,u.email FROM meta_monthly_reports r JOIN users u ON u.id=r.user_id ORDER BY r.ref_year DESC,r.ref_month DESC,COALESCE(u.company,u.name) COLLATE NOCASE ASC`).all();
    res.json(rows);
  });

  app.get('/api/meta/reports/:id/preview.png',requireAuth,(req,res)=>{
    const id=Number(req.params.id),r=db.prepare(`SELECT id,user_id,pdf_path FROM meta_monthly_reports WHERE id=?`).get(id);
    if(!r)return res.status(404).json({error:'Relatório não encontrado.'});
    if(req.user.role!=='admin'&&Number(req.user.id)!==Number(r.user_id))return res.status(403).json({error:'Sem permissão.'});
    if(!r.pdf_path)return res.status(404).json({error:'Pré-visualização indisponível.'});
    const preview=reportPath(String(r.pdf_path).replace(/\.pdf$/i,'.preview.png'));
    if(!fs.existsSync(preview))return res.status(404).json({error:'Pré-visualização indisponível. Gere novamente este relatório.'});
    if(req.user.role!=='admin')db.prepare(`UPDATE meta_monthly_reports SET viewed_at=COALESCE(viewed_at,datetime('now')),updated_at=datetime('now') WHERE id=?`).run(id);
    res.setHeader('Content-Type','image/png');
    res.setHeader('Cache-Control','private, max-age=300');
    res.sendFile(preview);
  });

  app.delete('/api/meta/reports/:id',requireAdmin,(req,res)=>{
    const id=Number(req.params.id),r=db.prepare(`SELECT id,pdf_path FROM meta_monthly_reports WHERE id=?`).get(id);
    if(!r)return res.status(404).json({error:'Relatório não encontrado.'});
    if(r.pdf_path){for(const f of [reportPath(r.pdf_path),reportPath(String(r.pdf_path).replace(/\.pdf$/i,'.preview.png'))]){try{if(fs.existsSync(f))fs.unlinkSync(f);}catch(e){console.warn('[meta-report] apagar ficheiro:',e.message);}}}
    db.prepare(`DELETE FROM meta_monthly_reports WHERE id=?`).run(id);
    res.json({ok:true});
  });

  app.post('/api/meta/reports/:id/viewed',requireAuth,(req,res)=>{const id=Number(req.params.id),r=db.prepare(`SELECT id,user_id FROM meta_monthly_reports WHERE id=?`).get(id);if(!r)return res.status(404).json({error:'Relatório não encontrado.'});if(req.user.role!=='admin'&&Number(req.user.id)!==Number(r.user_id))return res.status(403).json({error:'Sem permissão.'});if(req.user.role!=='admin')db.prepare(`UPDATE meta_monthly_reports SET viewed_at=COALESCE(viewed_at,datetime('now')),updated_at=datetime('now') WHERE id=?`).run(id);res.json({ok:true});});
  app.post('/api/meta/reports/:id/downloaded',requireAuth,(req,res)=>{const id=Number(req.params.id),r=db.prepare(`SELECT id,user_id FROM meta_monthly_reports WHERE id=?`).get(id);if(!r)return res.status(404).json({error:'Relatório não encontrado.'});if(req.user.role!=='admin'&&Number(req.user.id)!==Number(r.user_id))return res.status(403).json({error:'Sem permissão.'});if(req.user.role!=='admin')db.prepare(`UPDATE meta_monthly_reports SET downloaded_at=COALESCE(downloaded_at,datetime('now')),viewed_at=COALESCE(viewed_at,datetime('now')),updated_at=datetime('now') WHERE id=?`).run(id);res.json({ok:true});});
};
