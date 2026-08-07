const crypto = require("crypto")
const express = require("express")
const { PRODUCTS } = require("../products")
const { createPaidPurchasesBatch, getPurchasesByNick, trySpendGilcoins } = require("../db")
const { requireAuth } = require("../middleware/auth")

const router = express.Router()

const MAX_CART_LINES = 50
const MAX_QTY_PER_ITEM = 20

// Los productos ya no se pagan con Stripe: se compran al instante gastando
// el saldo de Gilcoins de la cuenta (100 Gilcoins = $1, así que
// product.priceCents ya es directamente el costo en Gilcoins). El nick
// tampoco viene del body: se toma de la cuenta con sesión iniciada.
// El carrito puede traer varias líneas (distintos productos y cantidades):
// se valida y cobra todo junto, en una sola transacción atómica.
router.post("/api/store/checkout", requireAuth, (req, res) => {
  const { items } = req.body || {}

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "El carrito está vacío." })
  }
  if (items.length > MAX_CART_LINES) {
    return res.status(400).json({ error: "Demasiados productos distintos en el carrito." })
  }

  const validatedItems = []
  let totalGilcoins = 0

  for (const rawItem of items) {
    const productId = rawItem && rawItem.productId
    const quantity = Number(rawItem && rawItem.quantity)
    const product = PRODUCTS[productId]

    if (!product) {
      return res.status(400).json({ error: "Producto no válido." })
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY_PER_ITEM) {
      return res.status(400).json({ error: "Cantidad inválida." })
    }

    totalGilcoins += product.priceCents * quantity
    validatedItems.push({ productId, quantity })
  }

  const reference = `gilcoin:${crypto.randomBytes(8).toString("hex")}`
  const newBalance = trySpendGilcoins(req.user.id, totalGilcoins, "store_purchase", reference)

  if (newBalance === null) {
    return res.status(400).json({ error: "Saldo de Gilcoins insuficiente." })
  }

  createPaidPurchasesBatch(req.user.minecraftNick, validatedItems, reference)

  res.json({ ok: true, gilcoinBalance: newBalance })
})

router.get("/api/purchases/me", requireAuth, (req, res) => {
  const purchases = getPurchasesByNick(req.user.minecraftNick).map((row) => {
    const product = PRODUCTS[row.product_id]
    return {
      id: row.id,
      productName: product ? product.name : row.product_id,
      status: row.status,
      createdAt: row.created_at,
      paidAt: row.paid_at,
      deliveredAt: row.delivered_at,
    }
  })
  res.json({ purchases })
})

module.exports = router
