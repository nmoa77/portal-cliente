const db = require('./db');

function proposal(company) {
  return `Assunto: ${company} — preparámos algo para si\n\nOlá,\n\nEstivemos a ver a comunicação da ${company} e acreditamos que há espaço para tirar mais partido das redes sociais.\n\nPreparámos uma proposta pensada para a ${company}. Veja o que preparámos para si e receba também um ebook gratuito.\n\nCumprimentos,`;
}

try {
  // Corrige apenas propostas geradas pelo modelo antigo automático.
  const rows = db.prepare(`
    SELECT u.id, u.company
    FROM users u
    JOIN prospect_crm c ON c.user_id=u.id
    WHERE u.is_prospect=1
      AND c.proposal_email LIKE 'Assunto:%uma ideia concreta para as vossas redes%'
  `).all();

  const update = db.prepare(`UPDATE prospect_crm SET proposal_email=?, updated_at=datetime('now') WHERE user_id=?`);
  const tx = db.transaction(() => {
    for (const row of rows) update.run(proposal(row.company), row.id);
  });
  tx();
  if (rows.length) console.log(`[crm] ${rows.length} emails de prospects atualizados para o template DUIT atual.`);
} catch (e) {
  console.warn('[crm] atualização do template de email:', e.message);
}

module.exports = { proposal };
