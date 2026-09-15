const db = require('./db');

function proposal(company) {
  return `Assunto: ${company} — as redes ficaram para depois?\n\nOlá,\n\nJá publicou com frequência, depois parou… ou vai publicando quando consegue?\n\nNão se desgaste com mais uma tarefa que precisa de acompanhamento diário para dar resultados.\n\nA DUIT ajuda a aliviar essa tarefa e trata das suas redes sociais por si.\n\nVeja como podemos tornar isto mais simples para si. 🙂\n\nCumprimentos,\nNuno`;
}

try {
  // Atualiza apenas prospects que ainda não receberam o email.
  // Emails já enviados ficam exatamente como foram enviados.
  const rows = db.prepare(`
    SELECT u.id, u.company
    FROM users u
    JOIN prospect_crm c ON c.user_id=u.id
    WHERE u.is_prospect=1
      AND c.email_sent_at IS NULL
  `).all();

  const update = db.prepare(`UPDATE prospect_crm SET proposal_email=?, updated_at=datetime('now') WHERE user_id=?`);
  const tx = db.transaction(() => {
    for (const row of rows) update.run(proposal(row.company), row.id);
  });
  tx();
  if (rows.length) console.log(`[crm] ${rows.length} emails de prospects ainda não enviados atualizados para o novo texto DUIT.`);
} catch (e) {
  console.warn('[crm] atualização do template de email:', e.message);
}

module.exports = { proposal };
