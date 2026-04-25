// Email DUIT — em dev regista na consola + tabela `notifications`.
// Em produção, se existir RESEND_API_KEY, envia via Resend (HTML + texto).

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'DUIT <no-reply@duit.pt>';
const PORTAL_URL = (process.env.PORTAL_URL || 'https://cliente.duit.pt').replace(/\/+$/, '');
const LOGO_URL = `${PORTAL_URL}/logo-email.png`;

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => (
    { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]
  ));
}

/* ---------- Layout partilhado (tabelas + inline CSS, para clientes de email) ---------- */
function layout({ eyebrow, title, greeting, paragraphs = [], ctaLabel, ctaUrl }) {
  const paraRows = paragraphs.map(p =>
    `<tr><td style="padding:0 0 16px 0; color:#2a2a2a; font-size:15px; line-height:1.65;">${p}</td></tr>`
  ).join('');

  const cta = (ctaLabel && ctaUrl) ? `
    <tr><td style="padding:12px 0 4px 0;">
      <a href="${ctaUrl}" style="display:inline-block; background:#ffd60a; color:#0a0a0a; font-weight:700; text-decoration:none; padding:14px 28px; border-radius:10px; font-size:15px; letter-spacing:-0.01em;">${escapeHtml(ctaLabel)}</a>
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

        <!-- Header preto com logo (HTML/CSS para funcionar em qualquer cliente de email) -->
        <tr><td style="background:#0a0a0a; padding:28px 40px;" align="left">
          <a href="${PORTAL_URL}" style="text-decoration:none; display:inline-block; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif;">
            <span style="font-size:30px; font-weight:900; letter-spacing:-0.04em; color:#ffffff; line-height:1;">DUIT</span><span style="display:inline-block; width:12px; height:12px; background:#ffd60a; margin-left:4px; vertical-align:baseline;">&nbsp;</span>
          </a>
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
              <a href="mailto:info@duit.pt" style="color:#8b8680; text-decoration:none;">info@duit.pt</a>
            </td></tr>
          </table>
        </td></tr>

      </table>

      <!-- Aviso fora do cartão -->
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin-top:16px;">
        <tr><td align="center" style="font-size:11px; color:#a39e96;">
          Este email foi enviado a partir do portal DUIT.
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

function deliver(db, { to, subject, body, html, user_id = null, kind = 'generic', force = false }) {
  const line = `[EMAIL → ${to}] ${subject}`;
  console.log('\n' + '━'.repeat(Math.min(line.length, 80)));
  console.log(line);
  if (body) console.log(body.split('\n').map(l => '  ' + l).join('\n'));
  console.log('━'.repeat(Math.min(line.length, 80)) + '\n');

  // Respeita a preferência de notificações do destinatário (exceto emails críticos: force=true)
  let suppressed = false;
  if (!force && user_id) {
    try {
      const u = db.prepare(`SELECT notifications_enabled FROM users WHERE id=?`).get(user_id);
      if (u && u.notifications_enabled === 0) suppressed = true;
    } catch (e) { /* coluna pode não existir antes da migração */ }
  }

  try {
    db.prepare(
      `INSERT INTO notifications (user_id, kind, to_email, subject, body)
       VALUES (?, ?, ?, ?, ?)`
    ).run(user_id, kind, to, (suppressed ? '[SUPRIMIDO] ' : '') + subject, body || '');
  } catch (e) { /* tabela pode não existir na 1ª boot */ }

  if (suppressed) {
    console.log(`[email] suprimido (utilizador desativou notificações): ${to}`);
    return;
  }

  sendViaResend({ to, subject, text: body || '', html: html || '' });
}

/* ---------- Templates (tratamento formal — você) ---------- */
const T = {
  welcome: (name, email, password) => {
    const first = (name || '').split(' ')[0] || '';
    const subject = `Bem-vindo à DUIT — a sua conta foi criada`;
    const body =
`Caro(a) ${name},

A sua conta no portal DUIT encontra-se pronta.

Credenciais de acesso:
→ Email: ${email}
→ Palavra-passe: ${password}

Por favor, aceda ao portal em ${PORTAL_URL} e altere a palavra-passe no primeiro acesso, através da secção Perfil.

Para qualquer esclarecimento adicional, agradecemos que responda diretamente a este email.

Com os melhores cumprimentos,
Equipa DUIT`;
    const html = layout({
      eyebrow: 'Conta criada',
      title: `Bem-vindo à DUIT${first ? ', ' + first : ''}.`,
      greeting: `Caro(a) ${name},`,
      paragraphs: [
        'A sua conta no portal encontra-se pronta. A partir deste momento poderá acompanhar num só local as suas <strong>subscrições</strong>, <strong>projetos</strong>, <strong>calendário editorial</strong>, <strong>orçamentos</strong> e <strong>pedidos de suporte</strong>.',
        `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 8px 0; background:#fafaf8; border:1px solid #ece9e2; border-radius:10px;">
          <tr><td style="padding:14px 18px; font-size:14px; color:#0a0a0a;">
            <div style="color:#8b8680; font-size:11px; text-transform:uppercase; letter-spacing:0.12em; margin-bottom:6px;">Credenciais de acesso</div>
            <div style="line-height:1.9;">
              <strong style="display:inline-block; width:110px;">Email</strong> ${escapeHtml(email)}<br>
              <strong style="display:inline-block; width:110px;">Palavra-passe</strong> <code style="background:#ffd60a; padding:2px 8px; border-radius:4px; font-family:'SF Mono',Monaco,Consolas,monospace; font-size:13px; color:#0a0a0a;">${escapeHtml(password)}</code>
            </div>
          </td></tr>
        </table>`,
        'Aconselhamos a alterar a palavra-passe no primeiro acesso, na secção <em>Perfil</em>. Para qualquer esclarecimento adicional, agradecemos que responda diretamente a este email.',
      ],
      ctaLabel: 'Aceder ao portal →',
      ctaUrl: PORTAL_URL,
    });
    return { subject, body, html };
  },

  projectStatus: (name, project, stage, msg) => {
    const subject = `Projeto "${project}" — agora em ${stage}`;
    const body =
`Caro(a) ${name},

Informamos que o seu projeto "${project}" mudou de fase: encontra-se agora em ${stage}.
${msg ? '\n' + msg + '\n' : ''}
Poderá consultar o andamento completo em ${PORTAL_URL}

Com os melhores cumprimentos,
Equipa DUIT`;
    const html = layout({
      eyebrow: 'Atualização de projeto',
      title: `"${project}" — ${stage}`,
      greeting: `Caro(a) ${name},`,
      paragraphs: [
        `Informamos que o seu projeto <strong>${escapeHtml(project)}</strong> mudou de fase. Encontra-se agora em <strong style="color:#0a0a0a; background:#ffd60a; padding:2px 8px; border-radius:4px;">${escapeHtml(stage)}</strong>.`,
        ...(msg ? [`<em style="color:#4a4a4a;">${escapeHtml(msg)}</em>`] : []),
        'Poderá consultar o andamento completo, mockups e ficheiros no portal.',
      ],
      ctaLabel: 'Consultar projeto →',
      ctaUrl: PORTAL_URL,
    });
    return { subject, body, html };
  },

  cancelRequest: (client, service) => {
    const subject = `Pedido de cancelamento recebido — ${service}`;
    const body =
`Confirmamos a receção do seu pedido de cancelamento referente a "${service}".

O pedido será analisado e receberá resposta no prazo de 48 horas úteis.
Durante este período, a subscrição mantém-se ativa e todos os serviços funcionam normalmente.

Poderá consultar o estado do pedido em ${PORTAL_URL}

Com os melhores cumprimentos,
Equipa DUIT`;
    const html = layout({
      eyebrow: 'Pedido recebido',
      title: 'Pedido de cancelamento recebido',
      paragraphs: [
        `Confirmamos a receção do seu pedido de cancelamento referente a <strong>${escapeHtml(service)}</strong>. O pedido será analisado e receberá resposta no prazo de <strong>48 horas úteis</strong>.`,
        'Durante este período, a subscrição mantém-se ativa e todos os serviços funcionam normalmente.',
      ],
      ctaLabel: 'Consultar estado →',
      ctaUrl: PORTAL_URL,
    });
    return { subject, body, html };
  },

  cancelDecision: (name, service, approved) => {
    const subject = approved
      ? `Cancelamento aprovado — ${service}`
      : `Cancelamento não aprovado — ${service}`;
    const body = approved
      ? `Caro(a) ${name},

Informamos que o seu pedido de cancelamento referente a "${service}" foi aprovado. A subscrição deixará de ser renovada.

Agradecemos a confiança depositada na DUIT. Caso volte a necessitar dos nossos serviços, estaremos ao seu inteiro dispor.

Com os melhores cumprimentos,
Equipa DUIT`
      : `Caro(a) ${name},

De momento não foi possível aprovar o cancelamento referente a "${service}". Entraremos em contacto brevemente para apresentar alternativas que possam ir ao encontro das suas necessidades.

Com os melhores cumprimentos,
Equipa DUIT`;
    const html = layout({
      eyebrow: approved ? 'Cancelamento aprovado' : 'Cancelamento não aprovado',
      title: approved
        ? `"${service}" foi cancelado`
        : `"${service}" — não foi possível cancelar`,
      greeting: `Caro(a) ${name},`,
      paragraphs: approved
        ? [
            `Informamos que o seu pedido de cancelamento referente a <strong>${escapeHtml(service)}</strong> foi aprovado. A subscrição deixará de ser renovada.`,
            'Agradecemos a confiança depositada na DUIT. Caso volte a necessitar dos nossos serviços, estaremos ao seu inteiro dispor.',
          ]
        : [
            `De momento não foi possível aprovar o cancelamento referente a <strong>${escapeHtml(service)}</strong>. Entraremos em contacto brevemente para apresentar alternativas que possam ir ao encontro das suas necessidades.`,
          ],
      ctaLabel: 'Aceder ao portal →',
      ctaUrl: PORTAL_URL,
    });
    return { subject, body, html };
  },

  mockupReady: (name, title) => {
    const subject = `Novo mockup para aprovação — ${title}`;
    const body =
`Caro(a) ${name},

Informamos que se encontra disponível uma nova versão de "${title}" para a sua aprovação.

Convidamo-lo(a) a aceder ao portal em ${PORTAL_URL} para visualizar a proposta e partilhar o seu feedback, ou aprovar a versão apresentada.

Com os melhores cumprimentos,
Equipa DUIT`;
    const html = layout({
      eyebrow: 'A aguardar aprovação',
      title: `Novo mockup: ${title}`,
      greeting: `Caro(a) ${name},`,
      paragraphs: [
        `Informamos que se encontra disponível uma nova versão de <strong>${escapeHtml(title)}</strong> para a sua aprovação.`,
        'Convidamo-lo(a) a aceder ao portal para visualizar a proposta e partilhar o seu feedback, ou aprovar a versão apresentada.',
      ],
      ctaLabel: 'Visualizar mockup →',
      ctaUrl: PORTAL_URL,
    });
    return { subject, body, html };
  },

  passwordReset: (name, resetUrl) => {
    const subject = `Recuperação da palavra-passe — Portal DUIT`;
    const body =
`Caro(a) ${name},

Recebemos um pedido de recuperação da palavra-passe associada à sua conta no portal DUIT.

Para definir uma nova palavra-passe, aceda à seguinte ligação:
${resetUrl}

A ligação é válida durante 1 hora e só pode ser utilizada uma vez.

Caso não tenha sido o(a) próprio(a) a solicitar esta alteração, ignore este email — a palavra-passe atual mantém-se inalterada.

Com os melhores cumprimentos,
Equipa DUIT`;
    const html = layout({
      eyebrow: 'Recuperação de acesso',
      title: 'Definir nova palavra-passe',
      greeting: `Caro(a) ${name},`,
      paragraphs: [
        'Recebemos um pedido de recuperação da palavra-passe associada à sua conta no portal DUIT.',
        'A ligação abaixo é válida durante <strong>1 hora</strong> e só pode ser utilizada uma vez.',
        'Caso não tenha sido o(a) próprio(a) a solicitar esta alteração, agradecemos que ignore este email — a palavra-passe atual mantém-se inalterada.',
      ],
      ctaLabel: 'Definir nova palavra-passe →',
      ctaUrl: resetUrl,
    });
    return { subject, body, html };
  },

  projectMessage: (recipientName, project, authorLabel, body) => {
    const isAdminAuthor = authorLabel === 'DUIT';
    const subject = isAdminAuthor
      ? `Nova nota da DUIT — projeto "${project}"`
      : `Nova nota do cliente — projeto "${project}"`;
    const txt =
`Caro(a) ${recipientName},

${isAdminAuthor ? 'A equipa DUIT' : `O cliente (${authorLabel})`} deixou uma nova nota no projeto "${project}":

"${body}"

Poderá consultar e responder no portal: ${PORTAL_URL}

Com os melhores cumprimentos,
Equipa DUIT`;
    const html = layout({
      eyebrow: 'Nota de projeto',
      title: `Nova nota — ${project}`,
      greeting: `Caro(a) ${recipientName},`,
      paragraphs: [
        isAdminAuthor
          ? `A equipa <strong>DUIT</strong> deixou uma nova nota no projeto <strong>${escapeHtml(project)}</strong>:`
          : `O cliente <strong>${escapeHtml(authorLabel)}</strong> deixou uma nova nota no projeto <strong>${escapeHtml(project)}</strong>:`,
        `<div style="background:#fafaf8; border-left:3px solid #ffd60a; padding:14px 18px; border-radius:6px; color:#2a2a2a; font-style:italic; line-height:1.6;">${escapeHtml(body)}</div>`,
        'Poderá consultar e responder no portal.',
      ],
      ctaLabel: 'Abrir projeto →',
      ctaUrl: PORTAL_URL,
    });
    return { subject, body: txt, html };
  },

  postsCleared: (name, month) => {
    const subject = `Calendário editorial de ${month} — atualização`;
    const body =
`Caro(a) ${name},

Informamos que o calendário editorial referente a ${month} foi redefinido. Encontramo-nos a preparar uma nova proposta alinhada com a conversa mais recente.

Assim que estiver pronta, receberá notificação para aprovação no portal.

Com os melhores cumprimentos,
Equipa DUIT`;
    const html = layout({
      eyebrow: 'Calendário editorial',
      title: `${month} — calendário redefinido`,
      greeting: `Caro(a) ${name},`,
      paragraphs: [
        `Informamos que o calendário editorial referente a <strong>${escapeHtml(month)}</strong> foi redefinido. Encontramo-nos a preparar uma nova proposta alinhada com a conversa mais recente.`,
        'Assim que estiver pronta, receberá notificação para aprovação no portal.',
      ],
      ctaLabel: 'Consultar calendário →',
      ctaUrl: PORTAL_URL,
    });
    return { subject, body, html };
  },
};

module.exports = { deliver, T };
