const crypto = require("crypto")
const express = require("express")
const {
  createUser,
  getUserByUsername,
  getUserByEmail,
  updateUserPassword,
  createSession,
  deleteSession,
  deleteSessionsForUser,
  createPasswordReset,
  getPasswordReset,
  deletePasswordReset,
  deletePasswordResetsForUser,
} = require("../db")
const { hashPassword, verifyPassword } = require("../passwords")
const { isValidUsername, isValidNick, isValidPassword, isValidEmail } = require("../validators")
const { setSessionCookie, clearSessionCookie } = require("../cookies")
const {
  requireAuth,
  generateSessionToken,
  sessionExpiryDate,
  SESSION_TTL_SECONDS,
} = require("../middleware/auth")
const { sendPasswordResetEmail } = require("../email")

const router = express.Router()

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000 // 1 hora

function startSession(res, userId) {
  const token = generateSessionToken()
  createSession({ token, userId, expiresAt: sessionExpiryDate() })
  setSessionCookie(res, token, SESSION_TTL_SECONDS)
}

router.post("/api/auth/register", (req, res) => {
  const { username, password, minecraftNick, email } = req.body || {}

  if (!isValidUsername(username)) {
    return res.status(400).json({ error: "Usuario inválido (3-20 caracteres, letras/números/guion bajo)." })
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres." })
  }
  if (!isValidNick(minecraftNick)) {
    return res.status(400).json({ error: "Nick de Minecraft no válido." })
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Correo no válido." })
  }

  if (getUserByUsername(username)) {
    return res.status(409).json({ error: "Ese usuario ya está registrado." })
  }

  try {
    const passwordHash = hashPassword(password)
    const result = createUser({ username, passwordHash, minecraftNick, email })
    startSession(res, Number(result.lastInsertRowid))
    res.status(201).json({ username, minecraftNick, gilcoinBalance: 0 })
  } catch (err) {
    if (String(err.message).includes("UNIQUE")) {
      return res.status(409).json({ error: "Ese usuario, correo o nick ya está registrado." })
    }
    console.error("Error registrando usuario:", err)
    res.status(500).json({ error: "No se pudo crear la cuenta." })
  }
})

router.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {}

  if (!isValidUsername(username) || !isValidPassword(password)) {
    return res.status(400).json({ error: "Usuario o contraseña incorrectos." })
  }

  const user = getUserByUsername(username)
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos." })
  }

  startSession(res, user.id)
  res.json({ username: user.username, minecraftNick: user.minecraft_nick, gilcoinBalance: user.gilcoin_balance })
})

router.post("/api/auth/logout", (req, res) => {
  if (req.sessionToken) {
    deleteSession(req.sessionToken)
  }
  clearSessionCookie(res)
  res.json({ ok: true })
})

router.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({
    username: req.user.username,
    minecraftNick: req.user.minecraftNick,
    gilcoinBalance: req.user.gilcoinBalance,
  })
})

// Respuesta genérica sin importar si el correo existe, para no revelar
// qué correos están registrados (evita enumeración de cuentas).
const FORGOT_PASSWORD_GENERIC_MESSAGE = "Si ese correo está registrado, te enviamos un enlace para restablecer tu contraseña."

router.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body || {}

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Correo no válido." })
  }

  const user = getUserByEmail(email)
  if (!user) {
    return res.json({ message: FORGOT_PASSWORD_GENERIC_MESSAGE })
  }

  try {
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS).toISOString()
    createPasswordReset({ token, userId: user.id, expiresAt })

    const resetUrl = `${process.env.SITE_URL}/reset-password.html?token=${token}`
    await sendPasswordResetEmail(user.email, resetUrl)

    res.json({ message: FORGOT_PASSWORD_GENERIC_MESSAGE })
  } catch (err) {
    console.error("Error enviando correo de recuperación:", err)
    res.status(500).json({ error: "No se pudo enviar el correo. Intenta de nuevo más tarde." })
  }
})

router.post("/api/auth/reset-password", (req, res) => {
  const { token, newPassword } = req.body || {}

  if (typeof token !== "string" || !token) {
    return res.status(400).json({ error: "Enlace inválido." })
  }
  if (!isValidPassword(newPassword)) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres." })
  }

  const resetRow = getPasswordReset(token)
  if (!resetRow || new Date(resetRow.expires_at).getTime() < Date.now()) {
    if (resetRow) deletePasswordReset(token)
    return res.status(400).json({ error: "Enlace inválido o expirado. Solicita uno nuevo." })
  }

  updateUserPassword(resetRow.user_id, hashPassword(newPassword))
  deletePasswordResetsForUser(resetRow.user_id)
  // Si la cuenta se comprometió por una cookie robada, esto cierra esa
  // sesión también — quien resetea la contraseña queda deslogueado y debe
  // iniciar sesión de nuevo con la contraseña nueva.
  deleteSessionsForUser(resetRow.user_id)

  res.json({ ok: true })
})

module.exports = router
