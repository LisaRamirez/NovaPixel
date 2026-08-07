const crypto = require("crypto")
const { getSessionWithUser, deleteSession } = require("../db")
const { parseCookies, SESSION_COOKIE_NAME } = require("../cookies")

const SESSION_TTL_DAYS = 30

function generateSessionToken() {
  return crypto.randomBytes(32).toString("hex")
}

function sessionExpiryDate() {
  const date = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)
  return date.toISOString()
}

const SESSION_TTL_SECONDS = SESSION_TTL_DAYS * 24 * 60 * 60

// Lee la cookie de sesión (si existe) y adjunta req.user. No bloquea la
// petición si no hay sesión válida: eso lo decide requireAuth.
function attachUser(req, res, next) {
  req.user = null
  const cookies = parseCookies(req)
  const token = cookies[SESSION_COOKIE_NAME]
  if (!token) return next()

  const row = getSessionWithUser(token)
  if (!row) return next()

  if (new Date(row.expires_at).getTime() < Date.now()) {
    deleteSession(token)
    return next()
  }

  req.user = {
    id: row.id,
    username: row.username,
    minecraftNick: row.minecraft_nick,
    gilcoinBalance: row.gilcoin_balance,
  }
  req.sessionToken = token
  next()
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Debes iniciar sesión." })
  }
  next()
}

module.exports = {
  attachUser,
  requireAuth,
  generateSessionToken,
  sessionExpiryDate,
  SESSION_TTL_SECONDS,
}
