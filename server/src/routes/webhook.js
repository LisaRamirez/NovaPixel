const express = require("express")
const Stripe = require("stripe")
const { markGilcoinPurchasePaidAndCredit } = require("../db")

const router = express.Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Nota: esta ruta necesita el body "crudo" (sin parsear como JSON) para
// poder verificar la firma de Stripe. Por eso se monta con express.raw()
// en index.js, antes del middleware express.json() global.
//
// Los productos de la tienda ya no se pagan con Stripe (se compran al
// instante con el saldo de Gilcoins, ver routes/store.js), así que este
// webhook solo confirma compras de paquetes de Gilcoins.
router.post("/webhook/stripe", express.raw({ type: "application/json" }), (req, res) => {
  const signature = req.headers["stripe-signature"]

  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error("Firma de webhook inválida:", err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object

    // Con métodos de pago asíncronos (transferencia, OXXO, boleto...) Stripe
    // manda este evento con payment_status "unpaid" y confirma después con
    // checkout.session.async_payment_succeeded. Como esos eventos no están
    // manejados aquí, hay que asegurarse de no acreditar antes de tiempo.
    if (session.payment_status !== "paid") {
      console.warn(`checkout.session.completed con payment_status=${session.payment_status}, no se acredita todavía: ${session.id}`)
      return res.json({ received: true })
    }

    const result = markGilcoinPurchasePaidAndCredit(session.id)
    if (!result) {
      console.warn(`Webhook recibido para sesión desconocida o ya procesada: ${session.id}`)
    } else {
      console.log(
        `Gilcoins acreditados: usuario=${result.purchase.user_id} paquete=${result.purchase.package_id} nuevo saldo=${result.balanceAfter}`
      )
    }
  }

  res.json({ received: true })
})

module.exports = router
