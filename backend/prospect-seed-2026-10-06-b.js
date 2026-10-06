const db=require('./db');
try{db.prepare("ALTER TABLE prospect_crm ADD COLUMN email_observation TEXT").run()}catch(e){if(!/duplicate column/i.test(e.message))console.warn(e.message)}
function angle(sector=''){const s=sector.toLowerCase();
if(/arquitet|interior|mobili|paisag/.test(s))return 'o trabalho visual e os projetos da empresa dão matéria para mostrar mais processo, detalhes e resultados nas redes sociais, em vez de a comunicação ficar apenas na apresentação final';
if(/metal|indústr|engenh|constru|equip|climat|avac|energia/.test(s))return 'a atividade técnica da empresa dá matéria para conteúdos mais visuais nas redes sociais, mostrando projetos, bastidores, processos e conhecimento de uma forma simples e regular';
if(/contab|fiscal|seguro|consult/.test(s))return 'há conhecimento útil na atividade da empresa que pode ser transformado em conteúdos simples e regulares nas redes sociais, tornando temas técnicos mais próximos e fáceis de acompanhar';
if(/segurança/.test(s))return 'os diferentes serviços e situações reais da atividade dão matéria para conteúdos úteis nas redes sociais, explicando prevenção, soluções e bastidores de forma mais próxima';
if(/storage|armazen|logíst/.test(s))return 'há várias situações reais de utilização do serviço que podem ser exploradas nas redes sociais com conteúdos práticos, exemplos e vídeo, tornando a proposta mais fácil de perceber';
return 'a atividade da empresa tem bastante matéria para ser trabalhada nas redes sociais com maior consistência, variedade e conteúdos mais visuais';
}
function proposal(company,obs){return `Assunto: ${company} — reparei numa coisa\n\nOlá,\n\nSou o Nuno, da DUIT.\n\nEstive a conhecer melhor a ${company} e reparei que ${obs}.\n\nAcho que há aqui uma oportunidade simples de dar mais consistência e variedade à forma como esse trabalho é mostrado nas redes sociais.\n\nSe fizer sentido para si, basta responder a este email e digo-lhe qual seria a primeira alteração que eu faria.`}
try{
 const rows=db.prepare(`SELECT p.user_id,p.sector,u.company FROM prospect_crm p JOIN users u ON u.id=p.user_id WHERE u.is_prospect=1 AND lower(coalesce(p.lead_status,''))='por_contactar'`).all();
 const up=db.prepare(`UPDATE prospect_crm SET opportunity=?,email_observation=?,proposal_email=?,updated_at=datetime('now') WHERE user_id=? AND lower(coalesce(lead_status,''))='por_contactar'`);
 let n=0; const tx=db.transaction(()=>{for(const r of rows){const obs=angle(r.sector);const opp='Gestão de redes sociais: criar uma presença mais consistente, visual e útil, aproveitando melhor o trabalho real, conhecimento, projetos e bastidores da empresa.';const z=up.run(opp,obs,proposal(r.company,obs),r.user_id);n+=z.changes}});tx();console.log(`[crm] reformulação social 2026-10-06: ${n} prospects por contactar atualizados; enviados não alterados`);
}catch(e){console.warn('[crm] reformulação social 2026-10-06:',e.message)}
