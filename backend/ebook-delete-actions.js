const db=require('./db');
const {requireAdmin}=require('./auth');

module.exports=function installEbookDeleteActions(app){
  app.delete('/api/crm/ebook-pages/:id',requireAdmin,(req,res)=>{
    const id=Number(req.params.id);
    const page=db.prepare('SELECT id,title,is_favorite FROM ebook_pages WHERE id=?').get(id);
    if(!page)return res.status(404).json({error:'Landing page não encontrada.'});
    const total=Number(db.prepare('SELECT COUNT(*) n FROM ebook_pages').get()?.n||0);
    if(total<=1)return res.status(400).json({error:'Não pode apagar a única landing page existente.'});
    if(page.is_favorite)return res.status(400).json({error:'Esta LP é a favorita. Defina primeiro outra LP como favorita.'});
    const tx=db.transaction(()=>{
      db.prepare('UPDATE ebook_leads SET page_id=NULL WHERE page_id=?').run(id);
      db.prepare('DELETE FROM ebook_page_visits WHERE page_id=?').run(id);
      try{db.prepare('UPDATE prospect_crm SET ebook_page_id=NULL WHERE ebook_page_id=?').run(id)}catch(_){}
      db.prepare('DELETE FROM ebook_pages WHERE id=?').run(id);
    });
    tx();
    res.json({ok:true});
  });
};
