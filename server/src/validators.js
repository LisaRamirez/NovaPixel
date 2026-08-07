// Nombre de usuario de la cuenta web (distinto del nick de Minecraft).
const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/

// Java: 3-16 caracteres alfanuméricos y guion bajo. Bedrock (via Floodgate)
// permite además espacios, puntos y guiones en el gamertag.
const NICK_PATTERN = /^[A-Za-z0-9_ .-]{3,16}$/

// No es una validación exhaustiva de RFC 5322 a propósito: solo filtra
// errores de tipeo obvios. La verificación real es que el correo reciba el enlace.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidUsername(value) {
  return typeof value === "string" && USERNAME_PATTERN.test(value)
}

function isValidNick(value) {
  return typeof value === "string" && NICK_PATTERN.test(value)
}

function isValidPassword(value) {
  return typeof value === "string" && value.length >= 8 && value.length <= 200
}

function isValidEmail(value) {
  return typeof value === "string" && value.length <= 200 && EMAIL_PATTERN.test(value)
}

module.exports = { isValidUsername, isValidNick, isValidPassword, isValidEmail }
