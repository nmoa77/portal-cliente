// Email DUIT — em dev regista na consola + tabela `notifications`.
// Em produção, se existir RESEND_API_KEY, envia via Resend (HTML + texto).

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'DUIT <no-reply@duit.pt>';
const PORTAL_URL = process.env.PORTAL_URL || 'https://cliente.duit.pt';

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => (
    { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]
  ));
}

/* ---------- Layout partilhado (tabelas, tudo inline — para clientes de email) ---------- */
function layout({ eyebrow, title, greeting, paragraphs = [], ctaLabel, ctaUrl }) {
  const paraRows = paragraphs.map(p =>
    `<tr><td style="padding:0 0 16px 0; color:#2a2a2a; font-size:15px; line-height:1.65;">${p}</td></tr>`
  ).join('');

  const cta = (ctaLabel && ctaUrl) ? `
    <tr><td style="padding:12px 0 4px 0;">
      <a href="${ctaUrl}" style="display:inline-block; background:#ffd60a; color:#0a0a0a; font-weight:700; text-decoration:none; padding:14px 26px; border-radius:10px; font-size:15px; letter-spacing:-0.01em; border:1px solid #0a0a0a;">${escapeHtml(ctaLabel)}</a>
    </td></tr>` : '';

  const greetRow = greeting ? `
    <tr><td style="padding:0 0 14px 0; color:#0a0a0a; font-size:15px;">${escapeHtml(greeting)}</td></tr>` : '';

  const eyebrowRow = eyebrow ? `
    <tr><td style="padding:0 0 10px 0; font-size:11px; text-transform:uppercase; letter-spacing:0.14em; color:#8b8680;">${escapeHtml(eyebrow)}</td></tr>` : '';

  return `<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0; padding:0; background:#f5f3ef; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Space Grotesk',Helvetica,Arial,sans-serif; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f3ef; padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 1px 3px rgba(10,10,10,0.06);">

        <!-- Header preto com logo -->
        <tr><td style="background:#0a0a0a; padding:28px 40px;">
          <div style="font-family:'Clash Display',-apple-system,BlinkMacSystemFont,sans-serif; font-weight:700; font-size:30px; color:#ffffff; letter-spacing:-0.03em; line-height:1;">
            DUIT<span style="color:#ffd60a;">.</span>
          </div>
        </td></tr>

        <!-- Barra amarela -->
        <tr><td style="background:#ffd60a; height:5px; font-size:0; line-height:0;">&nbsp;</td></tr>

        <!-- Conteúdo -->
        <tr><td style="padding:40px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${eyebrowRow}
            <tr><td style="padding:0 0 22px 0; font-family:'Clash Display',-apple-system,sans-serif; font-size:26px; font-weight:700; color:#0a0a0a; letter-spacing:-0.025em; line-height:1.2;">${escapeHtml(title)}</td></tr>
            ${greetRow}
            ${paraRows}
            ${cta}
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#fafaf8; padding:22px 40px; border-top:1px solid #ece9e2;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="font-size:12px; color:#8b8680; line-height:1.6;">
              <strong style="color:#0a0a0a; font-weight:600;">DUIT</strong> — Design com método<br>
              <a href="${PORTAL_URL}" style="color:#8b8680; text-decoration:none;">${escapeHtml(PORTAL_URL.replace(/^https?:\/\//, ''))}</a>
              &middot;
              <a href="mailto:ola@duit.pt" style="color:#8b8680; text-decoration:none;">ola@duit.pt</a>
            </td></tr>
          </table>
        </td></tr>

      </table>

      <!-- Rodapé fora do cartão -->
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin-top:16px;">
        <tr><td align="center" style="font-size:11px; color:#a39e96;">
          Recebeste este email porque tens conta no portal DUIT.
        </td></tr>
      </table>

    </td></tr>
  </table>
</body>
</html>`;
}

/* ---------- Entrega ---------- */
function sendViaResend({ to, subject, text, html }) {
  if (!RESEND_API_KEY) return;
  const payload = { from: EMAIL_FROM, to: [to], subject };
  if (text) payload.text = text;
  if (html) payload.html = html;
  try {
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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

function deliver(db, { to, subject, body, html, user_id = null, kind = 'generic' }) {
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
  } catch (e) { /* tabela pode não existir na 1ª boot */ }

  sendViaResend({ to, subject, text: body || '', html: html || '' });
}

/* ---------- Templates ---------- */
const T = {
  welcome: (name, email, password) => {
    const first = (name || '').split(' ')[0] || 'olá';
    const subject = `Bem-vindo à DUIT, ${first} 👋`;
    const body =
`Olá ${name},

A tua conta no portal DUIT está pronta.

→ Email: ${email}
→ Password: ${password}

Entra em ${PORTAL_URL} e muda a password no primeiro acesso (Perfil).
Qualquer dúvida é só responder a este email.

— Equipa DUIT`;
    const html = layout({
      eyebrow: 'Conta criada',
      title: `Bem-vindo à DUIT, ${first}.`,
      greeting: `Olá ${name},`,
      paragraphs: [
        'A tua conta no portal está pronta. A partir de agora acompanhas num só sítio as tuas <strong>subscrições</strong>, <strong>projetos</strong>, <strong>calendário editorial</strong>, <strong>orçamentos</strong> e <strong>pedidos de suporte</strong>.',
        `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 8px 0; background:#fafaf8; border:1px solid #ece9e2; border-radius:10px;">
          <tr><td style="padding:14px 18px; font-size:14px; color:#0a0a0a;">
            <div style="color:#8b8680; font-size:11px; text-transform:uppercase; letter-spacing:0.12em; margin-bottom:6px;">Credenciais de acesso</div>
            <div style="line-height:1.8;">
              <strong style="display:inline-block; width:90px;">Email</strong> ${escapeHtml(email)}<br>
              <strong style="display:inline-block; width:90px;">Password</strong> <code style="background:#ffd60a; padding:2px 8px; border-radius:4px; font-family:'SF Mono',Monaco,Consolas,monospace; font-size:13px; color:#0a0a0a;">${escapeHtml(password)}</code>
            </div>
          </td></tr>
        </table>`,
        'Muda a password no primeiro acesso, em <em>Perfil</em>. Qualquer coisa, responde a este email.',
      ],
      ctaLabel: 'Entrar no portal →',
      ctaUrl: PORTAL_URL,
    });
    return { subject, body, html };
  },

  projectStatus: (name, project, stage, msg) => {
    const first = (name || '').split(' ')[0] || 'olá';
    const subject = `Projeto "${project}" — agora em ${stage}`;
    const body =
`Olá ${first},

O teu projeto "${project}" mudou de fase: está agora em ${stage}.
${msg ? '\n' + msg + '\n' : ''}
Vê os detalhes em ${PORTAL_URL}

— Equipa DUIT`;
    const html = layout({
      eyebrow: 'Atualização de projeto',
      title: `"${project}" — ${stage}`,
      greeting: `Olá ${first},`,
      paragraphs: [
        `O teu projeto <strong>${escapeHtml(project)}</strong> mudou de fase: está agora em <strong style="color:#0a0a0a; background:#ffd60a; padding:2px 8px; border-radius:4px;">${escapeHtml(stage)}</strong>.`,
        ...(msg ? [`<em style="color:#4a4a4a;">${escapeHtml(msg)}</em>`] : []),
        'Podes ver o andamento completo, mockups e ficheiros no portal.',
      ],
      ctaLabel: 'Ver projeto →',
      ctaUrl: PORTAL_URL,
    });
    return { subject, body, html };
  },

  cancelRequest: (client, service) => {
    const subject = `Pedido de cancelamento recebido — ${service}`;
    const body =
`O teu pedido de cancelamento de "${service}" foi recebido e será analisado em 48h úteis.
Até lá, a subscrição mantém-se ativa.

Consulta o estado em ${PORTAL_URL}

— Equipa DUIT`;
    const html = layout({
      eyebrow: 'Pedido recebido',
      title: 'Pedido de cancelamento recebido',
      paragraphs: [
        `Recebemos o teu pedido de cancelamento de <strong>${escapeHtml(service)}</strong>. Vamos analisar e dar-te uma resposta em <strong>48h úteis</strong>.`,
        'Enquanto decidimos, a subscrição mantém-se ativa — continua a ter tudo a funcionar normalmente.',
      ],
      ctaLabel: 'Ver estado no portal →',
      ctaUrl: PORTAL_URL,
    });
    return { subject, body, html };
  },

  cancelDecision: (name, service, approved) => {
    const first = (name || '').split(' ')[0] || 'olá';
    const subject = approved
      ? `Cancelamento aprovado — ${service}`
      : `Cancelamento recusado — ${service}`;
    const body = approved
      ? `Olá ${first},\n\nO teu pedido de cancelamento de "${service}" foi aprovado.\nObrigado por teres estado connosco.\n\n— Equipa DUIT`
      : `Olá ${first},\n\nNão conseguimos aprovar o cancelamento de "${service}" neste momento. Entraremos em contacto com alternativas.\n\n— Equipa DUIT`;
    const html = layout({
      eyebrow: approved ? 'Cancelamento aprovado' : 'Cancelamento não aprovado',
      title: approved
        ? `"${service}" foi cancelado`
        : `"${service}" — não foi possível cancelar`,
      greeting: `Olá ${first},`,
      paragraphs: approved
        ? [
            `O teu pedido de cancelamento de <strong>${escapeHtml(service)}</strong> foi aprovado. A subscrição deixa de renovar.`,
            'Obrigado por teres estado connosco. Se precisares de algo no futuro, a porta fica aberta.',
          ]
        : [
            `Neste momento não conseguimos aprovar o cancelamento de <strong>${escapeHtml(service)}</strong>. Entraremos em contacto brevemente para ver alternativas que funcionem para ti.`,
          ],
      ctaLabel: 'Entrar no portal →',
      ctaUrl: PORTAL_URL,
    });
    return { subject, body, html };
  },

  mockupReady: (name, title) => {
    const first = (name || '').split(' ')[0] || 'olá';
    const subject = `Novo mockup à espera da tua aprovação — ${title}`;
    const body =
`Olá ${first},

Temos uma nova versão de "${title}" pronta para aprovação.
Entra em ${PORTAL_URL} e dá-nos o teu feedback.

— Equipa DUIT`;
    const html = layout({
      eyebrow: 'A aguardar aprovação',
      title: `Novo mockup: ${title}`,
      greeting: `Olá ${first},`,
      paragraphs: [
        `Temos uma nova versão de <strong>${escapeHtml(title)}</strong> pronta para a tua aprovação.`,
        'Entra no portal para veres o preview e deixares feedback — ou aprovar de vez.',
      ],
      ctaLabel: 'Ver mockup →',
      ctaUrl: PORTAL_URL,
    });
    return { subject, body, html };
  },

  postsCleared: (name, month) => {
    const first = (name || '').split(' ')[0] || 'olá';
    const subject = `Calendário de ${month} atualizado`;
    const body =
`Olá ${first},

O calendário editorial para ${month} foi redefinido.
Em breve receberás os novos posts para aprovação em ${PORTAL_URL}

— Equipa DUIT`;
    const html = layout({
      eyebrow: 'Calendário editorial',
      title: `${month} — calendário redefinido`,
      greeting: `Olá ${first},`,
      paragraphs: [
        `O calendário editorial para <strong>${escapeHtml(month)}</strong> foi redefinido. Estamos a preparar uma nova proposta de posts alinhada com o que conversámos.`,
        'Assim que estiver pronta, vais receber notificação para aprovares no portal.',
      ],
      ctaLabel: 'Ver calendário →',
      ctaUrl: PORTAL_URL,
    });
    return { subject, body, html };
  },
};

module.exports = { deliver, T };
