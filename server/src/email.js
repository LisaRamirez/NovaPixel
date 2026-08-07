// Envío de correo vía la API HTTP de Resend (https://resend.com/docs/api-reference/emails/send-email).
// Se usa fetch nativo de Node en vez de un SDK para no añadir otra dependencia.

async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL

  if (!apiKey || !from) {
    throw new Error("Faltan RESEND_API_KEY o RESEND_FROM_EMAIL en el .env del backend.")
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Resend respondió ${response.status}: ${body}`)
  }
}

function sendPasswordResetEmail(to, resetUrl) {
  return sendEmail({
    to,
    subject: "Recupera tu contraseña de NovaPixel",
    html: `
      <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta de NovaPixel.</p>
      <p><a href="${resetUrl}">Haz clic aquí para elegir una contraseña nueva</a></p>
      <p>Este enlace expira en 1 hora. Si no fuiste tú, ignora este correo — tu cuenta sigue segura.</p>
    `,
  })
}

module.exports = { sendPasswordResetEmail }
