// Integración con la API REST v2 de PayPal usando fetch nativo (sin SDK).
// Docs: https://developer.paypal.com/docs/api/orders/v2/

function baseUrl() {
  return process.env.PAYPAL_MODE === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com"
}

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const response = await fetch(`${baseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  if (!response.ok) {
    throw new Error(`PayPal OAuth respondió ${response.status}: ${await response.text()}`)
  }

  const data = await response.json()
  return data.access_token
}

// Crea una orden por el precio en USD del paquete. Devuelve el id de la
// orden y el link de aprobación al que hay que redirigir al jugador.
async function createOrder({ priceCents, referenceId, returnUrl, cancelUrl }) {
  const accessToken = await getAccessToken()

  const response = await fetch(`${baseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: referenceId,
          amount: {
            currency_code: "USD",
            value: (priceCents / 100).toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        user_action: "PAY_NOW",
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`PayPal creando orden respondió ${response.status}: ${await response.text()}`)
  }

  const order = await response.json()
  const approveLink = order.links.find((link) => link.rel === "approve")
  return { orderId: order.id, approveUrl: approveLink ? approveLink.href : null }
}

// Confirma el pago tras que el jugador aprueba en PayPal y vuelve a la web.
async function captureOrder(orderId) {
  const accessToken = await getAccessToken()

  const response = await fetch(`${baseUrl()}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(`PayPal capturando orden respondió ${response.status}: ${JSON.stringify(data)}`)
  }

  const completed = data.status === "COMPLETED"
  return { completed, raw: data }
}

module.exports = { createOrder, captureOrder }
