const db = require('./db');

function proposal(company) {
  return `Assunto: ${company} — as redes ficaram para depois?\n\nOlá,\n\nJá publicou com frequência, depois parou… ou vai publicando quando consegue?\n\nNão se desgaste com mais uma tarefa que precisa de acompanhamento diário para dar resultados.\n\nA DUIT ajuda a aliviar essa tarefa e trata das suas redes sociais por si.\n\nPor isso criámos o DUIT Start: uma forma simples de experimentar primeiro e perceber como podemos trabalhar a comunicação da sua empresa.\n\nVeja como podemos tornar isto mais simples para si. 🙂`;
}

try {
  // Atualiza apenas prospects que continuam por contactar.
  // Prospects já contactados/enviados mantêm o texto histórico.
  const rows = db.prepare(`
    SELECT u.id, u.company
    FROM users u
    JOIN prospect_crm c ON c.user_id=u.id
    WHERE u.is_prospect=1
      AND c.lead_status='por_contactar'
  `).all();

  const update = db.prepare(`UPDATE prospect_crm SET proposal_email=?, updated_at=datetime('now') WHERE user_id=?`);
  const tx = db.transaction(() => {
    for (const row of rows) update.run(proposal(row.company), row.id);
  });
  tx();
  if (rows.length) console.log(`[crm] ${rows.length} prospects por contactar atualizados para o texto DUIT Start.`);
} catch (e) {
  console.warn('[crm] atualização do template de email:', e.message);
}

module.exports = { proposal };
