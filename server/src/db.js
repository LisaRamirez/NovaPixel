const path = require("path")
const { DatabaseSync } = require("node:sqlite")

const db = new DatabaseSync(path.join(__dirname, "..", "store.db"))

db.exec("PRAGMA journal_mode = WAL")

db.exec(`
  CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    minecraft_nick TEXT NOT NULL,
    product_id TEXT NOT NULL,
    stripe_session_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending | paid | delivered
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    paid_at TEXT,
    delivered_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_purchases_nick_status
    ON purchases (minecraft_nick, status);

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    minecraft_nick TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users (username COLLATE NOCASE);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_nick ON users (minecraft_nick COLLATE NOCASE);

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS password_resets (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS gilcoin_purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    package_id TEXT NOT NULL,
    gilcoins INTEGER NOT NULL,
    price_cents INTEGER NOT NULL,
    provider TEXT NOT NULL, -- 'stripe' | 'paypal'
    provider_ref TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending | paid
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    paid_at TEXT
  );

  CREATE TABLE IF NOT EXISTS gilcoin_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    delta INTEGER NOT NULL,
    reason TEXT NOT NULL, -- 'pack_purchase' | 'store_purchase'
    reference TEXT,
    balance_after INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_gilcoin_transactions_user
    ON gilcoin_transactions (user_id, created_at);
`)

// Migración: las bases creadas antes de agregar recuperación por correo no
// tienen la columna email. ALTER TABLE ADD COLUMN es la única forma de
// añadirla sin perder los usuarios ya registrados.
const usersColumns = db.prepare(`PRAGMA table_info(users)`).all()
if (!usersColumns.some((col) => col.name === "email")) {
  db.exec(`ALTER TABLE users ADD COLUMN email TEXT`)
}
if (!usersColumns.some((col) => col.name === "gilcoin_balance")) {
  db.exec(`ALTER TABLE users ADD COLUMN gilcoin_balance INTEGER NOT NULL DEFAULT 0`)
}
db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email COLLATE NOCASE)`)

// Las compras de productos ya no pasan por Stripe: se pagan al instante con
// el saldo de Gilcoins, así que nacen directamente en estado 'paid'. La
// columna stripe_session_id se reutiliza como referencia única genérica
// (aquí lleva un identificador sintético "gilcoin:<hex>", ver store.js).
function createPaidPurchase({ nick, productId, reference }) {
  const stmt = db.prepare(`
    INSERT INTO purchases (minecraft_nick, product_id, stripe_session_id, status, paid_at)
    VALUES (?, ?, ?, 'paid', datetime('now'))
  `)
  return stmt.run(nick, productId, reference)
}

// Inserta una compra pagada por cada unidad de cada línea del carrito, todo
// en una sola transacción: si algo falla a mitad de camino no queda ninguna
// fila a medias (el gasto de Gilcoins ya se hizo atómicamente antes, aparte).
function createPaidPurchasesBatch(nick, items, reference) {
  const stmt = db.prepare(`
    INSERT INTO purchases (minecraft_nick, product_id, stripe_session_id, status, paid_at)
    VALUES (?, ?, ?, 'paid', datetime('now'))
  `)

  db.exec("BEGIN")
  try {
    let unit = 0
    for (const item of items) {
      for (let i = 0; i < item.quantity; i++) {
        stmt.run(nick, item.productId, `${reference}-${unit++}`)
      }
    }
    db.exec("COMMIT")
  } catch (err) {
    db.exec("ROLLBACK")
    throw err
  }
}

function getPaidUndeliveredByNick(nick) {
  const stmt = db.prepare(`
    SELECT * FROM purchases
    WHERE minecraft_nick = ? COLLATE NOCASE AND status = 'paid'
    ORDER BY paid_at ASC
  `)
  return stmt.all(nick)
}

function markDelivered(id) {
  const stmt = db.prepare(`
    UPDATE purchases
    SET status = 'delivered', delivered_at = datetime('now')
    WHERE id = ? AND status = 'paid'
  `)
  return stmt.run(id)
}

function getPurchasesByNick(nick) {
  const stmt = db.prepare(`
    SELECT * FROM purchases
    WHERE minecraft_nick = ? COLLATE NOCASE
    ORDER BY created_at DESC
  `)
  return stmt.all(nick)
}

function createUser({ username, passwordHash, minecraftNick, email }) {
  const stmt = db.prepare(`
    INSERT INTO users (username, password_hash, minecraft_nick, email)
    VALUES (?, ?, ?, ?)
  `)
  return stmt.run(username, passwordHash, minecraftNick, email)
}

function getUserByUsername(username) {
  const stmt = db.prepare(`SELECT * FROM users WHERE username = ? COLLATE NOCASE`)
  return stmt.get(username)
}

function getUserByEmail(email) {
  const stmt = db.prepare(`SELECT * FROM users WHERE email = ? COLLATE NOCASE`)
  return stmt.get(email)
}

function getUserById(id) {
  const stmt = db.prepare(`SELECT * FROM users WHERE id = ?`)
  return stmt.get(id)
}

function updateUserPassword(userId, passwordHash) {
  const stmt = db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`)
  return stmt.run(passwordHash, userId)
}

function createSession({ token, userId, expiresAt }) {
  const stmt = db.prepare(`INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)`)
  return stmt.run(token, userId, expiresAt)
}

function getSessionWithUser(token) {
  const stmt = db.prepare(`
    SELECT sessions.token, sessions.expires_at, users.*
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token = ?
  `)
  return stmt.get(token)
}

function deleteSession(token) {
  const stmt = db.prepare(`DELETE FROM sessions WHERE token = ?`)
  return stmt.run(token)
}

// Se llama al resetear la contraseña: si la cuenta fue comprometida por una
// cookie de sesión robada, esto la cierra en cualquier dispositivo.
function deleteSessionsForUser(userId) {
  const stmt = db.prepare(`DELETE FROM sessions WHERE user_id = ?`)
  return stmt.run(userId)
}

function createPasswordReset({ token, userId, expiresAt }) {
  const stmt = db.prepare(`INSERT INTO password_resets (token, user_id, expires_at) VALUES (?, ?, ?)`)
  return stmt.run(token, userId, expiresAt)
}

function getPasswordReset(token) {
  const stmt = db.prepare(`SELECT * FROM password_resets WHERE token = ?`)
  return stmt.get(token)
}

function deletePasswordReset(token) {
  const stmt = db.prepare(`DELETE FROM password_resets WHERE token = ?`)
  return stmt.run(token)
}

function deletePasswordResetsForUser(userId) {
  const stmt = db.prepare(`DELETE FROM password_resets WHERE user_id = ?`)
  return stmt.run(userId)
}

function recordGilcoinTransaction({ userId, delta, reason, reference, balanceAfter }) {
  const stmt = db.prepare(`
    INSERT INTO gilcoin_transactions (user_id, delta, reason, reference, balance_after)
    VALUES (?, ?, ?, ?, ?)
  `)
  return stmt.run(userId, delta, reason, reference ?? null, balanceAfter)
}

function creditGilcoins(userId, amount, reason, reference) {
  db.prepare(`UPDATE users SET gilcoin_balance = gilcoin_balance + ? WHERE id = ?`).run(amount, userId)
  const { gilcoin_balance: balanceAfter } = db.prepare(`SELECT gilcoin_balance FROM users WHERE id = ?`).get(userId)
  recordGilcoinTransaction({ userId, delta: amount, reason, reference, balanceAfter })
  return balanceAfter
}

// Descuento atómico: la condición gilcoin_balance >= ? en el propio UPDATE
// evita que el saldo quede negativo si hay dos compras casi simultáneas.
function trySpendGilcoins(userId, amount, reason, reference) {
  const result = db
    .prepare(`UPDATE users SET gilcoin_balance = gilcoin_balance - ? WHERE id = ? AND gilcoin_balance >= ?`)
    .run(amount, userId, amount)

  if (result.changes === 0) return null

  const { gilcoin_balance: balanceAfter } = db.prepare(`SELECT gilcoin_balance FROM users WHERE id = ?`).get(userId)
  recordGilcoinTransaction({ userId, delta: -amount, reason, reference, balanceAfter })
  return balanceAfter
}

function createGilcoinPurchase({ userId, packageId, gilcoins, priceCents, provider, providerRef }) {
  const stmt = db.prepare(`
    INSERT INTO gilcoin_purchases (user_id, package_id, gilcoins, price_cents, provider, provider_ref)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  return stmt.run(userId, packageId, gilcoins, priceCents, provider, providerRef)
}

function getGilcoinPurchaseByProviderRef(providerRef) {
  const stmt = db.prepare(`SELECT * FROM gilcoin_purchases WHERE provider_ref = ?`)
  return stmt.get(providerRef)
}

// Marca el paquete como pagado y acredita el saldo, todo de una vez.
// Devuelve null si ya se había procesado antes (idempotente ante reintentos
// de webhooks o de la URL de retorno de PayPal).
function markGilcoinPurchasePaidAndCredit(providerRef) {
  const purchase = getGilcoinPurchaseByProviderRef(providerRef)
  if (!purchase || purchase.status !== "pending") return null

  db.prepare(`UPDATE gilcoin_purchases SET status = 'paid', paid_at = datetime('now') WHERE id = ?`).run(purchase.id)
  const balanceAfter = creditGilcoins(purchase.user_id, purchase.gilcoins, "pack_purchase", purchase.package_id)

  return { purchase, balanceAfter }
}

module.exports = {
  db,
  createPaidPurchase,
  createPaidPurchasesBatch,
  getPaidUndeliveredByNick,
  getPurchasesByNick,
  markDelivered,
  createUser,
  getUserByUsername,
  getUserByEmail,
  getUserById,
  updateUserPassword,
  createSession,
  getSessionWithUser,
  deleteSession,
  deleteSessionsForUser,
  createPasswordReset,
  getPasswordReset,
  deletePasswordReset,
  deletePasswordResetsForUser,
  creditGilcoins,
  trySpendGilcoins,
  createGilcoinPurchase,
  getGilcoinPurchaseByProviderRef,
  markGilcoinPurchasePaidAndCredit,
}
