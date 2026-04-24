// Stub de email — em dev regista na consola e grava em `notifications`.
// Em produção, se existir RESEND_API_KEY, envia também via Resend (https://resend.com).
// Qualquer erro de rede é silencioso — o stub continua a funcionar.

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'DUIT <no-reply@duit.pt>';

function sendViaResend({ to, subject, body }) {
  if (!RESEND_API_KEY) return;
  // Node 18+ tem fetch global. Fire-and-forget.
  try {
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [to],
        subject,
        text: body,
      }),
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => '');
        console.warn(`[email] Resend falhou (${r.status}): ${t}`);
      }
    }).catch((e) => console.warn('[email] Resend erro:', e.message));
  } catch (e) {
    console.warn('[email] Resend erro:', e.message);
  }
}

function deliver(db, { to, subject, body, user_id = null, kind = 'generic' }) {
  const line = `[EMAIL → ${to}] ${subject}`;
  console.log('\n' + '━'.repeat(Math.min(line.length, 80)));
  console.log(line);
  if (body) console.log(body.split('\n').map(l => '  ' + l).join('\n'));
  console.log('━'.repeat(Math.min(line.length, 80)) + '\n');

  try {
    db.prepare(
      `INSERT INTO notifications (user_id, kind, to_email, subject, body)
       VALUES (?, ?, ?, ?, ?)`
    ).run(user_id, kind, to, subject, body || '');
  } catch (e) {
    // tabela pode ainda não existir na primeira boot
  }

  // Envia via Resend se estiver configurado
  sendViaResend({ to, subject, body });
}

// Templates simples
const T = {
  welcome: (name, email, password) => ({
    subject: `Bem-vindo à DUIT, ${name.split(' ')[0]} 👋`,
    body:
`Olá ${name},

A tua conta no portal DUIT está pronta.

→ Email: ${email}
→ Password: ${password}

Aconselhamos a mudar a password no primeiro acesso, em Perfil.

Qualquer dúvida é só responder a este email.
— Equipa DUIT`,
  }),
  projectStatus: (name, project, stage, msg) => ({
    subject: `Projeto "${project}" — agora em ${stage}`,
    body:
`Olá ${name.split(' ')[0]},

O teu projeto "${project}" mudou de fase: está agora em ${stage}.
${msg ? '\n' + msg + '\n' : ''}
Vê os detalhes no portal: https://duit.pt/portal

— Equipa DUIT`,
  }),
  cancelRequest: (client, service) => ({
    subject: `Pedido de cancelamento recebido — ${service}`,
    body:
`O pedido de cancelamento de "${service}" foi recebido e será analisado em 48h úteis.
Até lá, a subscrição mantém-se ativa.

— Equipa DUIT`,
  }),
  cancelDecision: (name, service, approved) => ({
    subject: approved
      ? `Cancelamento aprovado — ${service}`
      : `Cancelamento recusado — ${service}`,
    body: approved
      ? `Olá ${name.split(' ')[0]},\n\nO teu pedido de cancelamento de "${service}" foi aprovado.\nObrigado por teres estado connosco.\n\n— Equipa DUIT`
      : `Olá ${name.split(' ')[0]},\n\nNão conseguimos aprovar o cancelamento de "${service}" neste momento. Entraremos em contacto com alternativas.\n\n— Equipa DUIT`,
  }),
  mockupReady: (name, title) => ({
    subject: `Novo mockup à espera da tua aprovação — ${title}`,
    body: `Olá ${name.split(' ')[0]},\n\nTemos uma nova versão de "${title}" pronta para aprovação no portal.\n\n— Equipa DUIT`,
  }),
  postsCleared: (name, month) => ({
    subject: `Calendário de ${month} atualizado`,
    body: `Olá ${name.split(' ')[0]},\n\nO calendário editorial para ${month} foi redefinido. Em breve receberás os novos posts para aprovação.\n\n— Equipa DUIT`,
  }),
};

module.exports = { deliver, T };
