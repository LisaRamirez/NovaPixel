const crypto = require("crypto")
const express = require("express")
const { PRODUCTS } = require("../products")
const { getPaidUndeliveredByNick, markDelivered } = require("../db")

const router = express.Router()

function timingSafeEqualStrings(a, b) {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  // Buffers de largo distinto igual deben compararse en tiempo constante:
  // comparar contra sí mismo evita que el largo de `a` filtre información
  // por temporización, y siempre da como resultado "no coincide".
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA)
    return false
  }
  return crypto.timingSafeEqual(bufA, bufB)
}

function requirePluginSecret(req, res, next) {
  const secret = req.headers["x-plugin-secret"]
  const expected = process.env.PLUGIN_SHARED_SECRET
  if (typeof secret !== "string" || !secret || !timingSafeEqualStrings(secret, expected)) {
    return res.status(401).json({ error: "No autorizado." })
  }
  next()
}

router.use("/api/plugin", requirePluginSecret)

// El plugin llama esto cuando un jugador entra al servidor.
router.get("/api/plugin/purchases/:nick", (req, res) => {
  const nick = req.params.nick
  const purchases = getPaidUndeliveredByNick(nick).map((row) => {
    const product = PRODUCTS[row.product_id]
    return {
      id: row.id,
      productId: row.product_id,
      productName: product ? product.name : row.product_id,
      commands: product ? product.commands : [],
      manual: product ? Boolean(product.manual) : true,
    }
  })
  res.json({ purchases })
})

// El plugin llama esto tras ejecutar los comandos de entrega.
router.post("/api/plugin/purchases/:id/delivered", (req, res) => {
  const id = Number(req.params.id)
  const result = markDelivered(id)
  if (result.changes === 0) {
    return res.status(404).json({ error: "Compra no encontrada o ya entregada." })
  }
  res.json({ ok: true })
})

module.exports = router
