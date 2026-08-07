require("dotenv").config()
const express = require("express")
const cors = require("cors")

const webhookRouter = require("./routes/webhook")
const storeRouter = require("./routes/store")
const gilcoinsRouter = require("./routes/gilcoins")
const pluginRouter = require("./routes/plugin")
const authRouter = require("./routes/auth")
const { attachUser } = require("./middleware/auth")

const REQUIRED_ENV = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "PLUGIN_SHARED_SECRET",
  "SITE_URL",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "PAYPAL_CLIENT_ID",
  "PAYPAL_CLIENT_SECRET",
]
const missing = REQUIRED_ENV.filter((key) => !process.env[key])
if (missing.length > 0) {
  console.error(`Faltan variables de entorno: ${missing.join(", ")}. Revisa .env (usa .env.example como plantilla).`)
  process.exit(1)
}

const app = express()

// credentials:true + origin explícito (en vez de "*") porque ahora la API
// usa cookies de sesión: un origin abierto con cookies sería una falla CSRF.
app.use(cors({ origin: process.env.SITE_URL, credentials: true }))

// El webhook de Stripe necesita el body sin parsear para verificar la firma,
// así que se registra ANTES del express.json() global.
app.use(webhookRouter)

app.use(express.json())
app.use(attachUser)
app.use(authRouter)
app.use(storeRouter)
app.use(gilcoinsRouter)
app.use(pluginRouter)

app.get("/health", (req, res) => res.json({ ok: true }))

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`NovaPixel store backend escuchando en el puerto ${port}`)
})
