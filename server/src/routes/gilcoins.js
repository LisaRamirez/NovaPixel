const express = require("express")
const Stripe = require("stripe")
const { GILCOIN_PACKAGES } = require("../gilcoinPackages")
const {
  createGilcoinPurchase,
  markGilcoinPurchasePaidAndCredit,
  getGilcoinPurchaseByProviderRef,
  getUserById,
} = require("../db")
const { requireAuth } = require("../middleware/auth")
const paypal = require("../payments/paypal")

const router = express.Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

router.post("/api/gilcoins/checkout/stripe", requireAuth, async (req, res) => {
  const { packageId } = req.body || {}
  const pkg = GILCOIN_PACKAGES[packageId]
  if (!pkg) {
    return res.status(400).json({ error: "Paquete no válido." })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `${pkg.name} (${pkg.gilcoins} Gilcoins)` },
            unit_amount: pkg.priceCents,
          },
          quantity: 1,
        },
      ],
      metadata: { packageId, userId: String(req.user.id) },
      success_url: `${process.env.SITE_URL}/tienda.html?gilcoins=exito`,
      cancel_url: `${process.env.SITE_URL}/tienda.html?gilcoins=cancelado`,
    })

    createGilcoinPurchase({
      userId: req.user.id,
      packageId,
      gilcoins: pkg.gilcoins,
      priceCents: pkg.priceCents,
      provider: "stripe",
      providerRef: session.id,
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error("Error creando sesión de Stripe para Gilcoins:", err)
    res.status(500).json({ error: "No se pudo iniciar el pago." })
  }
})

router.post("/api/gilcoins/checkout/paypal", requireAuth, async (req, res) => {
  const { packageId } = req.body || {}
  const pkg = GILCOIN_PACKAGES[packageId]
  if (!pkg) {
    return res.status(400).json({ error: "Paquete no válido." })
  }

  try {
    const { orderId, approveUrl } = await paypal.createOrder({
      priceCents: pkg.priceCents,
      referenceId: packageId,
      returnUrl: `${process.env.SITE_URL}/gilcoins-callback.html`,
      cancelUrl: `${process.env.SITE_URL}/tienda.html?gilcoins=cancelado`,
    })

    createGilcoinPurchase({
      userId: req.user.id,
      packageId,
      gilcoins: pkg.gilcoins,
      priceCents: pkg.priceCents,
      provider: "paypal",
      providerRef: orderId,
    })

    res.json({ url: approveUrl })
  } catch (err) {
    console.error("Error creando orden de PayPal:", err)
    res.status(500).json({ error: "No se pudo iniciar el pago con PayPal." })
  }
})

// Llamado desde gilcoins-callback.html cuando PayPal redirige de vuelta
// tras la aprobación del jugador.
router.post("/api/gilcoins/paypal/capture", requireAuth, async (req, res) => {
  const { orderId } = req.body || {}
  if (typeof orderId !== "string" || !orderId) {
    return res.status(400).json({ error: "Falta el id de la orden." })
  }

  // La orden debe ser del usuario que hace la petición — si no, cualquiera
  // que consiga el orderId de otra persona podría forzar su captura.
  const pendingPurchase = getGilcoinPurchaseByProviderRef(orderId)
  if (!pendingPurchase || pendingPurchase.user_id !== req.user.id) {
    return res.status(404).json({ error: "Orden no encontrada." })
  }

  try {
    const { completed } = await paypal.captureOrder(orderId)
    if (!completed) {
      return res.status(400).json({ error: "El pago no se completó." })
    }

    const result = markGilcoinPurchasePaidAndCredit(orderId)
    if (!result) {
      // Ya se había procesado (reintento de la página de retorno) o la orden
      // no es de este usuario: devolvemos el saldo actual sin duplicar el abono.
      const user = getUserById(req.user.id)
      return res.json({ ok: true, gilcoinBalance: user.gilcoin_balance })
    }

    res.json({ ok: true, gilcoinBalance: result.balanceAfter })
  } catch (err) {
    console.error("Error capturando orden de PayPal:", err)
    res.status(500).json({ error: "No se pudo confirmar el pago." })
  }
})

module.exports = router
