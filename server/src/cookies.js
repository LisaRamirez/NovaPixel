const SESSION_COOKIE_NAME = "npx_session"

function parseCookies(req) {
  const header = req.headers.cookie
  const cookies = {}
  if (!header) return cookies
  for (const pair of header.split(";")) {
    const idx = pair.indexOf("=")
    if (idx === -1) continue
    const name = pair.slice(0, idx).trim()
    const value = pair.slice(idx + 1).trim()
    cookies[name] = decodeURIComponent(value)
  }
  return cookies
}

function setSessionCookie(res, token, maxAgeSeconds) {
  const secure = process.env.COOKIE_SECURE === "true"
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    `Max-Age=${maxAgeSeconds}`,
    "SameSite=Lax",
  ]
  if (secure) parts.push("Secure")
  res.setHeader("Set-Cookie", parts.join("; "))
}

function clearSessionCookie(res) {
  const secure = process.env.COOKIE_SECURE === "true"
  const parts = [`${SESSION_COOKIE_NAME}=`, "Path=/", "HttpOnly", "Max-Age=0", "SameSite=Lax"]
  if (secure) parts.push("Secure")
  res.setHeader("Set-Cookie", parts.join("; "))
}

module.exports = { SESSION_COOKIE_NAME, parseCookies, setSessionCookie, clearSessionCookie }
