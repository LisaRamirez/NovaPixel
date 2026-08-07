const crypto = require("crypto")

const KEY_LENGTH = 64

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex")
  const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH)
  return `${salt}:${derivedKey.toString("hex")}`
}

function verifyPassword(password, storedHash) {
  const [salt, hashHex] = storedHash.split(":")
  const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH)
  const storedKey = Buffer.from(hashHex, "hex")
  if (derivedKey.length !== storedKey.length) return false
  return crypto.timingSafeEqual(derivedKey, storedKey)
}

module.exports = { hashPassword, verifyPassword }
