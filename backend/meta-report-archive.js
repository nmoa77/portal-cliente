const db=require('./db');
const fs=require('fs');
const path=require('path');
const {requireAuth,requireAdmin}=require('./auth');

module.exports=function installMetaReportArchive(app){
  const cols=db.prepare(`PRAGMA table_info(meta_monthly_reports)`).all().map(c=>c.name);
  if(!cols.includes('viewed_at')) db.exec(`ALTER TABLE meta_monthly_reports ADD COLUMN viewed_at TEXT`);
  if(!cols.includes('downloaded_at')) db.exec(`ALTER TABLE meta_monthly_reports ADD COLUMN downloaded_at TEXT`);
  if(!cols.includes('email_opened_at')) db.exec(`ALTER TABLE meta_monthly_reports ADD COLUMN email_opened_at TEXT`);
  if(!cols.includes('email_tracking_token')) db.exec(`ALTER TABLE meta_monthly_reports ADD COLUMN email_tracking_token TEXT`);
  const reportsDir=()=>process.env.REPORTS_DIR||(process.env.DATABASE_PATH?path.join(path.dirname(process.env.DATABASE_PATH),'meta-reports'):path.join(process.cwd(),'data','meta-reports'));
  const reportPath=name=>path.join(reportsDir(),path.basename(String(name||'')));

  // Diagnóstico de leitura: verifica os registos SQLite e os PDFs sem alterar dados.
  app.get('/api/meta/reports/archive/diagnostics',requireAdmin,(req,res)=>{
    try{
      const rows=db.prepare(`SELECT r.id,r.user_id,r.ref_year,r.ref_month,r.status,r.totals_json,r.posts_json,r.pdf_path,r.generated_at,r.error_message,u.name,u.company
        FROM meta_monthly_reports r LEFT JOIN users u ON u.id=r.user_id
        WHERE (r.ref_year>2026 OR (r.ref_year=2026 AND r.ref_month>=8))
        ORDER BY COALESCE(u.company,u.name),r.ref_year,r.ref_month`).all();
      const diagnostic=rows.map(r=>{
        let totals=null,posts=null,totalsOk=false,postsOk=false;
        try{totals=JSON.parse(r.totals_json);totalsOk=!!totals&&typeof totals==='object'&&!!totals.instagram&&!!totals.facebook;}catch(_){}
        try{posts=JSON.parse(r.posts_json);postsOk=!!posts&&Array.isArray(posts.instagram)&&Array.isArray(posts.facebook);}catch(_){}
        const pdfPresent=!!r.pdf_path&&fs.existsSync(reportPath(r.pdf_path));
        return {id:r.id,user_id:r.user_id,client:r.company||r.name||'Cliente '+r.user_id,year:r.ref_year,month:r.ref_month,status:r.status,
          totals_ok:totalsOk,posts_ok:postsOk,pdf_referenced:!!r.pdf_path,pdf_present:pdfPresent,
          instagram_posts:postsOk?posts.instagram.length:null,facebook_posts:postsOk?posts.facebook.length:null,
          generated_at:r.generated_at,complete:['ready','sent'].includes(r.status)&&totalsOk&&postsOk&&pdfPresent,error:r.error_message||null};
      });
      const counts={records:diagnostic.length,complete:diagnostic.filter(x=>x.complete).length,incomplete:diagnostic.filter(x=>!x.complete).length};
      res.set('Cache-Control','no-store').json({database_configured_on_volume:!!(process.env.DATABASE_PATH||'').startsWith('/data/'),counts,records:diagnostic});
    }catch(e){res.status(500).json({error:'Erro ao verificar arquivo: '+e.message});}
  });

  app.get('/api/meta/reports/archive',requireAdmin,(req,res)=>{
    const rows=db.prepare(`SELECT r.id,r.user_id,r.ref_year,r.ref_month,r.status,r.summary_text,r.pdf_path,r.generated_at,r.sent_at,r.email_opened_at,r.viewed_at,r.downloaded_at,r.error_message,r.created_at,r.updated_at,u.name,u.company,u.email FROM meta_monthly_reports r JOIN users u ON u.id=r.user_id ORDER BY r.ref_year DESC,r.ref_month DESC,COALESCE(u.company,u.name) COLLATE NOCASE ASC`).all();
    res.json(rows);
  });

  app.get('/api/meta/reports/open/:token.gif',(req,res)=>{
    const token=String(req.params.token||'').trim();
    if(token){try{db.prepare(`UPDATE meta_monthly_reports SET email_opened_at=COALESCE(email_opened_at,datetime('now')),updated_at=datetime('now') WHERE email_tracking_token=?`).run(token);}catch(_){}}
    res.setHeader('Content-Type','image/gif');
    res.setHeader('Cache-Control','no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma','no-cache');
    res.setHeader('Expires','0');
    res.end(Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==','base64'));
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
