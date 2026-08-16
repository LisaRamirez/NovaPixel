// ==========================================================================
// Tienda: checkout con nick de Minecraft
// ==========================================================================

// URL base del backend de la tienda (ver carpeta /django_backend). Cámbiala
// por la URL real donde despliegues el backend (ej: "https://api.novapixel.host").
const NOVAPIXEL_API_BASE = "http://localhost:8001"

// Catálogo solo para mostrar el nombre del producto en el modal.
// El precio real y la validación del producto viven en server/src/products.js
const STORE_PRODUCT_NAMES = {
  "rango-angelical-30": "Rango Angelical · 30 días",
  "rango-celestial-30": "Rango Celestial · 30 días",
  "rango-divino-30": "Rango Divino · 30 días",
  "rango-donador-30": "Rango Donador · 30 días",
  "rango-angelical-indef": "Rango Angelical · Indefinido",
  "rango-celestial-indef": "Rango Celestial · Indefinido",
  "rango-divino-indef": "Rango Divino · Indefinido",
  "rango-donador-indef": "Rango Donador · Indefinido",
  "pico-3x3": "Pico 3x3",
  "proteccion-diamante-128": "Protección Diamante 128x128",
  "proteccion-netherita-256": "Protección Netherita 256x256",
  "proteccion-esmeralda-512": "Protección Esmeralda 512x512",
  "kit-star-light": "Kit Star Light",
  "kit-samurai": "Kit Samurai",
  "kit-conqueror": "Kit Conqueror",
  "kit-bahamon": "Kit Bahamon",
  "kit-loki": "Kit Loki",
  "kit-darkflame": "Kit Darkflame",
  "kit-ifrit": "Kit Ifrit",
  "kit-molten": "Kit Molten",
  "kit-necros": "Kit Necros",
  "kit-bee": "Kit Bee",
  "kit-sakura": "Kit Sakura",
  "brillo-azul": "Brillo Azul",
  "brillo-agua": "Brillo Agua",
  "brillo-arcoiris": "Brillo Arcoíris",
  "brillo-rosado": "Brillo Rosado",
  "brillo-negro": "Brillo Negro",
  "tag-personalizado": "Tag Personalizado",
  "exp-100": "Experiencia 100 Niveles",
  "exp-250": "Experiencia 250 Niveles",
  "economia-50k": "50,000 de Economía",
  "economia-100k": "100,000 de Economía",
  "fly-indefinido": "Fly Indefinido",
  "fly-30": "Fly 30 días",
  "comandos-pack": "Pack Comandos (/hat /ec /craft)",
  "spawner-vaca": "Spawner de Vaca",
  "spawner-pollo": "Spawner de Pollo",
  "spawner-cerdo": "Spawner de Cerdo",
  "spawner-arana": "Spawner de Araña",
  "schematic-pegado": "Pegado de Schematic",
  "donador-vip-lv10": "Donador VIP LV10",
  "donador-vip-lv14": "Donador VIP LV14",
  "donador-vip-lv18": "Donador VIP LV18",
  "donador-vip-lv22": "Donador VIP LV22",
}

// Costo en Gilcoins de cada producto (100 Gilcoins = $1, mismo valor que
// priceCents en server/src/products.js). El backend siempre revalida el
// precio real al comprar — esto es solo para mostrarlo en el modal.
const STORE_PRODUCT_PRICES = {
  "rango-angelical-30": 400,
  "rango-celestial-30": 900,
  "rango-divino-30": 1600,
  "rango-donador-30": 5000,
  "rango-angelical-indef": 1500,
  "rango-celestial-indef": 2100,
  "rango-divino-indef": 3800,
  "rango-donador-indef": 15000,
  "pico-3x3": 1500,
  "proteccion-diamante-128": 800,
  "proteccion-netherita-256": 2100,
  "proteccion-esmeralda-512": 4500,
  "kit-star-light": 3500,
  "kit-samurai": 3200,
  "kit-conqueror": 2000,
  "kit-bahamon": 1700,
  "kit-loki": 1700,
  "kit-darkflame": 2200,
  "kit-ifrit": 1500,
  "kit-molten": 1800,
  "kit-necros": 2000,
  "kit-bee": 1600,
  "kit-sakura": 1500,
  "brillo-azul": 500,
  "brillo-agua": 500,
  "brillo-arcoiris": 500,
  "brillo-rosado": 500,
  "brillo-negro": 500,
  "tag-personalizado": 300,
  "exp-100": 400,
  "exp-250": 900,
  "economia-50k": 900,
  "economia-100k": 1500,
  "fly-indefinido": 1500,
  "fly-30": 800,
  "comandos-pack": 400,
  "spawner-vaca": 300,
  "spawner-pollo": 300,
  "spawner-cerdo": 300,
  "spawner-arana": 500,
  "schematic-pegado": 1200,
  "donador-vip-lv10": 5000,
  "donador-vip-lv14": 9000,
  "donador-vip-lv18": 15000,
  "donador-vip-lv22": 25000,
}

// Beneficios de rangos y Donador VIP para el modal "Ver beneficios" (botón
// .rank-detail-link[data-detail]). Texto tal cual la información de producto
// ya provista — no se agregan beneficios nuevos. rango-donador-30/indef no
// tienen entrada a propósito: nunca se recibió su detalle.
const PRODUCT_DETAILS = {
  "rango-angelical-30": {
    image: "images/rango-angelical-icon.png",
    name: "Rango Angelical",
    price: "400 🪙",
    duration: "30 días",
    benefits: [
      "🔒 6 Protecciones",
      "⚔️ Encantamientos hasta Nivel 6",
      "🏠 6 Hogares",
      "🎒 3 Mochilas",
      "🧰 Kit Angelical (una vez durante el rango)",
      "🎨 Chat con Color",
      "🚪 Acceso al servidor lleno",
      "😴 Modo AFK",
      "💰 $10,000 de economía inicial",
      "📈 10 espacios de subasta",
      "🎯 150 niveles de XP",
    ],
  },
  "rango-celestial-30": {
    image: "images/rango-celestial-icon.png",
    name: "Rango Celestial",
    price: "900 🪙",
    duration: "30 días",
    benefits: [
      "🔒 7 Protecciones",
      "⚔️ Encantamientos hasta Nivel 7",
      "🏠 7 Hogares",
      "🎒 6 Mochilas",
      "🧰 Kit Celestial (una vez durante el rango)",
      "🎨 Chat con Color",
      "🚪 Acceso al servidor lleno",
      "😴 Modo AFK",
      "⚡ Comandos premium: /fly /anvil /craft /enderchest /recipe /afk",
      "⛏️ Acceso a la Mina VIP",
      "💰 $15,000 de economía inicial",
      "🎯 200 niveles de XP",
    ],
  },
  "rango-divino-30": {
    image: "images/rango-divino-icon.png",
    name: "Rango Divino",
    price: "1,600 🪙",
    duration: "30 días",
    benefits: [
      "🔒 8 Protecciones",
      "⚔️ Encantamientos hasta Nivel 8",
      "🏠 8 Hogares",
      "🎒 9 Mochilas",
      "🧰 Kit Divino (una vez durante el rango)",
      "🎨 Chat con Color",
      "🚪 Acceso al servidor lleno",
      "😴 Modo AFK",
      "⚡ Comandos: /afk /anvil /craft /enderchest /feed /fly /heal /recipe /repair",
      "💰 $30,000 de economía inicial",
      "🎯 350 niveles de XP",
    ],
  },
  "rango-angelical-indef": {
    image: "images/rango-angelical-icon.png",
    name: "Rango Angelical",
    price: "1,500 🪙",
    duration: "Indefinido",
    benefits: [
      "🔒 6 Protecciones",
      "⚔️ Encantamientos hasta Nivel 6",
      "🏠 6 Hogares",
      "🎒 3 Mochilas",
      "🧰 Kit Angelical (reclamable cada 30 días)",
      "🎨 Chat con Color",
      "🚪 Acceso al servidor lleno",
      "😴 Modo AFK",
      "⚙️ 3 comandos exclusivos: /enderchest /recipe /repair",
      "💰 $10,000 de economía inicial (única vez)",
      "🎯 150 niveles de XP (única vez)",
      "💬 Rango Angelical en Discord",
    ],
  },
  "rango-celestial-indef": {
    image: "images/rango-celestial-icon.png",
    name: "Rango Celestial",
    price: "2,100 🪙",
    duration: "Indefinido",
    benefits: [
      "🔒 7 Protecciones",
      "⚔️ Encantamientos hasta Nivel 7",
      "🏠 7 Hogares",
      "🎒 6 Mochilas",
      "🧰 Kit Celestial (reclamable cada 30 días)",
      "🎨 Chat con Color",
      "🚪 Acceso al servidor lleno",
      "😴 Modo AFK",
      "⚡ /fly y comandos premium",
      "⛏️ Acceso a la Mina VIP",
      "💰 $15,000 de economía inicial (única vez)",
      "🎯 200 niveles de XP (única vez)",
      "💬 Rango Celestial en Discord",
    ],
  },
  "rango-divino-indef": {
    image: "images/rango-divino-icon.png",
    name: "Rango Divino",
    price: "3,800 🪙",
    duration: "Indefinido",
    benefits: [
      "🔒 8 Protecciones",
      "⚔️ Encantamientos hasta Nivel 8",
      "🏠 8 Hogares",
      "🎒 9 Mochilas",
      "🧰 Kit Divino (reclamable cada 30 días)",
      "🎨 Chat con Color",
      "🚪 Acceso al servidor lleno",
      "😴 Modo AFK",
      "⚡ /fly · /heal · /feed y más",
      "⛏️ Acceso a la Mina VIP",
      "💰 $30,000 de economía inicial (única vez)",
      "🎯 350 niveles de XP (única vez)",
      "💬 Rango Divino en Discord",
    ],
  },
  "donador-vip-lv10": {
    icon: "fa-crown",
    name: "Donador VIP LV10",
    price: "5,000 🪙 · $50 USD",
    duration: "Indefinido",
    benefits: [
      "🔒 10 Protecciones",
      "🏠 10 Hogares",
      "🎒 50 Mochilas",
      "⚔️ Encantamientos hasta Nivel 10",
      "🧰 Kit LUXURY (una única vez)",
      "🎨 Chat con Color",
      "🚪 Acceso al servidor lleno",
      "😴 Modo AFK",
      "⚡ 11 comandos premium: /afk /anvil /beezoka /craft /enderchest /feed /fly /nick /recipe /repair /repair all",
      "💰 $50,000 de economía inicial",
      "🎯 500 niveles de XP",
      "📈 12 espacios de subasta",
      "⛏️ Acceso a la Mina VIP",
      "🏰 Acceso a todas las mazmorras",
      "💬 Canal VIP + rango LUXURY en Discord",
      "🏷️ Descuentos exclusivos",
    ],
  },
  "donador-vip-lv14": {
    icon: "fa-crown",
    name: "Donador VIP LV14",
    price: "9,000 🪙 · $90 USD",
    duration: "Indefinido",
    benefits: [
      "🔒 10 Protecciones",
      "🏠 10 Hogares",
      "🎒 50 Mochilas",
      "⚔️ Encantamientos hasta Nivel 14",
      "🧰 Kit LUXURY (una única vez)",
      "🎨 Chat con Color",
      "🚪 Acceso al servidor lleno",
      "😴 Modo AFK",
      "⚡ Comandos premium LUXURY completos",
      "💰 $90,000 de economía inicial",
      "🎯 600 niveles de XP",
      "📈 13 espacios de subasta",
      "⛏️ Acceso a la Mina VIP",
      "🏰 Acceso a todas las mazmorras",
      "💬 Canal VIP + rango LUXURY en Discord",
      "🏷️ Descuentos exclusivos",
    ],
  },
  "donador-vip-lv18": {
    icon: "fa-crown",
    name: "Donador VIP LV18",
    price: "15,000 🪙 · $150 USD",
    duration: "Indefinido",
    benefits: [
      "🔒 10 Protecciones",
      "🏠 10 Hogares",
      "🎒 50 Mochilas",
      "⚔️ Encantamientos hasta Nivel 18",
      "🧰 Kit LUXURY (una única vez)",
      "🎨 Chat con Color",
      "🚪 Acceso al servidor lleno",
      "😴 Modo AFK",
      "⚡ Comandos premium LUXURY completos",
      "💰 $150,000 de economía inicial",
      "🎯 700 niveles de XP",
      "📈 13 espacios de subasta",
      "⛏️ Acceso a la Mina VIP",
      "🏰 Acceso a todas las mazmorras",
      "💬 Canal VIP + rango LUXURY en Discord",
      "🏷️ Descuentos exclusivos",
    ],
  },
  "donador-vip-lv22": {
    icon: "fa-crown",
    name: "Donador VIP LV22",
    price: "25,000 🪙 · $250 USD",
    duration: "Indefinido",
    benefits: [
      "🔒 10 Protecciones",
      "🏠 10 Hogares",
      "🎒 50 Mochilas",
      "⚔️ Encantamientos hasta Nivel 25",
      "🧰 Kit LUXURY (una única vez)",
      "🎨 Chat con Color",
      "🚪 Acceso al servidor lleno",
      "😴 Modo AFK",
      "⚡ Comandos premium LUXURY completos",
      "💰 $250,000 de economía inicial",
      "🎯 900 niveles de XP",
      "📈 13 espacios de subasta",
      "⛏️ Acceso a la Mina VIP",
      "🏰 Acceso a todas las mazmorras",
      "💬 Canal VIP + rango LUXURY en Discord",
      "🏷️ Descuentos exclusivos",
    ],
  },
}

function apiFetch(path, options = {}) {
  return fetch(`${NOVAPIXEL_API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  })
}

function avatarUrlFor(nick) {
  return `https://mc-heads.net/avatar/${encodeURIComponent(nick)}/40`
}

function escapeHtml(str) {
  const div = document.createElement("div")
  div.textContent = str
  return div.innerHTML
}

// Vista previa de la cabeza del skin usando mc-heads.net (servicio público
// no oficial). Funciona bien con nicks de Java; para nicks de Bedrock sin
// vincular muestra un skin genérico porque Mojang no conoce ese nombre.
function wireNickAvatarPreview(inputEl, imgEl) {
  if (!inputEl || !imgEl) return
  let debounceTimer = null
  inputEl.addEventListener("input", () => {
    clearTimeout(debounceTimer)
    const nick = inputEl.value.trim()
    debounceTimer = setTimeout(() => {
      if (nick.length < 3) {
        imgEl.classList.remove("visible")
        return
      }
      imgEl.src = avatarUrlFor(nick)
      imgEl.alt = `Skin de ${nick}`
      imgEl.classList.add("visible")
    }, 350)
  })
}

// Estado de sesión compartido entre el navbar, el modal de auth y el checkout.
const NovaPixelAuth = {
  user: null,

  async refresh() {
    try {
      const res = await apiFetch("/api/auth/me")
      this.user = res.ok ? await res.json() : null
    } catch {
      this.user = null
    }
    this.render()
    return this.user
  },

  render() {
    document.dispatchEvent(new CustomEvent("novapixel:auth-changed"))

    const container = document.getElementById("nav-account")
    if (!container) return

    if (this.user) {
      container.innerHTML = `
        <div class="nav-account-user">
          <span class="nav-gilcoin-balance">🪙 ${this.user.gilcoinBalance.toLocaleString("es")}</span>
          <img class="nav-account-avatar" src="${avatarUrlFor(this.user.minecraftNick)}" alt="Skin de ${escapeHtml(this.user.minecraftNick)}" width="28" height="28">
          <span>Hola, <strong>${escapeHtml(this.user.username)}</strong></span>
          <a href="mis-compras.html">Mis compras</a>
          <button id="nav-logout-btn" type="button">Salir</button>
        </div>
      `
      document.getElementById("nav-logout-btn").addEventListener("click", async () => {
        await apiFetch("/api/auth/logout", { method: "POST" })
        this.user = null
        this.render()
      })
    } else {
      container.innerHTML = `<button id="nav-login-btn" class="nav-account-login-btn" type="button">Iniciar sesión</button>`
      document.getElementById("nav-login-btn").addEventListener("click", () => {
        document.dispatchEvent(new CustomEvent("novapixel:open-auth-modal"))
      })
    }
  },
}

// Modal de login/registro, presente en index.html y tienda.html.
function setupAuthModal(onAuthSuccess) {
  const modal = document.getElementById("auth-modal")
  if (!modal) return null

  const closeBtn = document.getElementById("auth-modal-close")
  const loginView = document.getElementById("auth-login-view")
  const registerView = document.getElementById("auth-register-view")
  const forgotView = document.getElementById("auth-forgot-view")
  const showRegisterLink = document.getElementById("show-register-link")
  const showLoginLink = document.getElementById("show-login-link")
  const showForgotLink = document.getElementById("show-forgot-link")
  const showLoginFromForgotLink = document.getElementById("show-login-from-forgot-link")

  const loginUsername = document.getElementById("login-username-input")
  const loginPassword = document.getElementById("login-password-input")
  const loginError = document.getElementById("login-error")
  const loginSubmit = document.getElementById("login-submit")

  const registerUsername = document.getElementById("register-username-input")
  const registerEmail = document.getElementById("register-email-input")
  const registerPassword = document.getElementById("register-password-input")
  const registerNick = document.getElementById("register-nick-input")
  const registerAvatar = document.getElementById("register-nick-avatar")
  const registerError = document.getElementById("register-error")
  const registerSubmit = document.getElementById("register-submit")

  const forgotEmail = document.getElementById("forgot-email-input")
  const forgotError = document.getElementById("forgot-error")
  const forgotSuccess = document.getElementById("forgot-success")
  const forgotSubmit = document.getElementById("forgot-submit")

  wireNickAvatarPreview(registerNick, registerAvatar)

  function setError(el, message) {
    el.textContent = message
    el.classList.add("active")
  }

  function clearError(el) {
    el.textContent = ""
    el.classList.remove("active")
  }

  function showLoginView() {
    loginView.style.display = ""
    registerView.style.display = "none"
    forgotView.style.display = "none"
    clearError(loginError)
  }

  function showRegisterView() {
    loginView.style.display = "none"
    registerView.style.display = ""
    forgotView.style.display = "none"
    clearError(registerError)
  }

  function showForgotView() {
    loginView.style.display = "none"
    registerView.style.display = "none"
    forgotView.style.display = ""
    forgotEmail.value = ""
    clearError(forgotError)
    forgotSuccess.classList.remove("active")
  }

  function open() {
    showLoginView()
    loginUsername.value = ""
    loginPassword.value = ""
    modal.classList.add("active")
    setTimeout(() => loginUsername.focus(), 50)
  }

  function close() {
    modal.classList.remove("active")
  }

  closeBtn.addEventListener("click", close)
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close()
  })
  showRegisterLink.addEventListener("click", (e) => {
    e.preventDefault()
    showRegisterView()
  })
  showLoginLink.addEventListener("click", (e) => {
    e.preventDefault()
    showLoginView()
  })
  showForgotLink.addEventListener("click", (e) => {
    e.preventDefault()
    showForgotView()
  })
  showLoginFromForgotLink.addEventListener("click", (e) => {
    e.preventDefault()
    showLoginView()
  })
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) close()
  })
  document.addEventListener("novapixel:open-auth-modal", open)

  forgotSubmit.addEventListener("click", async () => {
    const email = forgotEmail.value.trim()
    clearError(forgotError)
    forgotSuccess.classList.remove("active")

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(forgotError, "Ingresa un correo válido.")
      return
    }

    forgotSubmit.disabled = true
    try {
      const res = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "No se pudo enviar el correo.")
      forgotSuccess.textContent = data.message
      forgotSuccess.classList.add("active")
    } catch (err) {
      setError(forgotError, err.message)
    } finally {
      forgotSubmit.disabled = false
    }
  })

  loginSubmit.addEventListener("click", async () => {
    const username = loginUsername.value.trim()
    const password = loginPassword.value
    clearError(loginError)

    if (!username || !password) {
      setError(loginError, "Completa usuario y contraseña.")
      return
    }

    loginSubmit.disabled = true
    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "No se pudo iniciar sesión.")
      NovaPixelAuth.user = data
      NovaPixelAuth.render()
      close()
      if (onAuthSuccess) onAuthSuccess()
    } catch (err) {
      setError(loginError, err.message)
    } finally {
      loginSubmit.disabled = false
    }
  })

  registerSubmit.addEventListener("click", async () => {
    const username = registerUsername.value.trim()
    const email = registerEmail.value.trim()
    const password = registerPassword.value
    const minecraftNick = registerNick.value.trim()
    clearError(registerError)

    if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
      setError(registerError, "Usuario inválido (3-20 caracteres: letras, números, guion bajo).")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(registerError, "Ingresa un correo válido.")
      return
    }
    if (password.length < 8) {
      setError(registerError, "La contraseña debe tener al menos 8 caracteres.")
      return
    }
    if (!/^[A-Za-z0-9_ .-]{3,16}$/.test(minecraftNick)) {
      setError(registerError, "Ingresa un nick de Minecraft válido.")
      return
    }

    registerSubmit.disabled = true
    try {
      const res = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password, minecraftNick }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "No se pudo crear la cuenta.")
      NovaPixelAuth.user = data
      NovaPixelAuth.render()
      close()
      if (onAuthSuccess) onAuthSuccess()
    } catch (err) {
      setError(registerError, err.message)
    } finally {
      registerSubmit.disabled = false
    }
  })

  return { open, close }
}

document.addEventListener("DOMContentLoaded", () => {
  NovaPixelAuth.refresh()

  let pendingGilcoinPurchase = null
  let pendingCartCheckout = false
  const authModal = setupAuthModal(() => {
    if (pendingGilcoinPurchase) {
      const { packageId, provider } = pendingGilcoinPurchase
      pendingGilcoinPurchase = null
      startGilcoinCheckout(packageId, provider)
    } else if (pendingCartCheckout) {
      pendingCartCheckout = false
      if (cartApi) cartApi.checkout()
    }
  })

  // Botones de paquetes de Gilcoins: piden login si hace falta y luego
  // redirigen al proveedor de pago elegido (Stripe o PayPal).
  async function startGilcoinCheckout(packageId, provider) {
    if (!NovaPixelAuth.user) {
      pendingGilcoinPurchase = { packageId, provider }
      if (authModal) authModal.open()
      return
    }

    try {
      const res = await apiFetch(`/api/gilcoins/checkout/${provider}`, {
        method: "POST",
        body: JSON.stringify({ packageId }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || "No se pudo iniciar el pago.")
      window.location.href = data.url
    } catch (err) {
      alert(err.message || "No se pudo iniciar el pago. Intenta de nuevo.")
    }
  }

  document.querySelectorAll(".gilcoin-luxury-buy-btn[data-package]").forEach((btn) => {
    btn.addEventListener("click", () => startGilcoinCheckout(btn.dataset.package, btn.dataset.provider))
  })

  // Modal "Ver beneficios": muestra el detalle de un rango o Donador VIP
  // (PRODUCT_DETAILS) sin salir de la tienda. Reutiliza el mismo componente
  // visual que el modal de login (.checkout-modal-overlay/.checkout-modal).
  function setupProductDetailModal(cartApi) {
    const modalEl = document.getElementById("product-detail-modal")
    if (!modalEl) return

    const closeBtn = document.getElementById("product-detail-close")
    const imageEl = document.getElementById("product-detail-image")
    const nameEl = document.getElementById("product-detail-name")
    const priceEl = document.getElementById("product-detail-price")
    const durationEl = document.getElementById("product-detail-duration")
    const benefitsEl = document.getElementById("product-detail-benefits")
    const buyBtn = document.getElementById("product-detail-buy-btn")

    let currentProductId = null

    function open(productId) {
      const detail = PRODUCT_DETAILS[productId]
      if (!detail) return

      currentProductId = productId
      imageEl.innerHTML = detail.image
        ? `<img src="${detail.image}" alt="${escapeHtml(detail.name)}">`
        : `<i class="fas ${detail.icon}"></i>`
      nameEl.textContent = detail.name
      priceEl.textContent = detail.price
      durationEl.textContent = detail.duration
      benefitsEl.innerHTML = detail.benefits.map((b) => `<li>${escapeHtml(b)}</li>`).join("")

      const affordable = isAffordable(productId)
      buyBtn.classList.toggle("needs-recharge", !affordable)
      buyBtn.textContent = affordable ? "Añadir al carrito" : "Recargar Gilcoins"

      modalEl.classList.add("active")
    }

    function close() {
      modalEl.classList.remove("active")
      currentProductId = null
    }

    document.querySelectorAll(".rank-detail-link[data-detail]").forEach((btn) => {
      btn.addEventListener("click", () => open(btn.dataset.detail))
    })

    closeBtn.addEventListener("click", close)
    modalEl.addEventListener("click", (e) => {
      if (e.target === modalEl) close()
    })

    buyBtn.addEventListener("click", () => {
      if (!currentProductId) return
      if (buyBtn.classList.contains("needs-recharge")) {
        close()
        document.dispatchEvent(new CustomEvent("novapixel:open-recharge-modal"))
        return
      }
      if (cartApi) cartApi.addItem(currentProductId)
      close()
    })
  }

  // Modal "Recargar Gilcoins": los paquetes ya no viven en una pestaña
  // propia, sino en este modal, abierto desde cualquier botón "Recargar"
  // (saldo insuficiente para un ítem) o desde el aviso de saldo del carrito.
  function setupGilcoinRechargeModal() {
    const modalEl = document.getElementById("gilcoin-recharge-modal")
    if (!modalEl) return null

    const closeBtn = document.getElementById("gilcoin-recharge-close")

    function open() {
      modalEl.classList.add("active")
    }

    function close() {
      modalEl.classList.remove("active")
    }

    closeBtn.addEventListener("click", close)
    modalEl.addEventListener("click", (e) => {
      if (e.target === modalEl) close()
    })
    document.addEventListener("novapixel:open-recharge-modal", open)

    return { open, close }
  }

  // Un producto es "no asequible" cuando hay sesión iniciada y el saldo de
  // Gilcoins de la cuenta no alcanza para ESE ítem en particular. Sin
  // sesión no se penaliza: agregar al carrito sigue funcionando igual,
  // el login se pide recién al pagar.
  function isAffordable(productId) {
    if (!NovaPixelAuth.user) return true
    const price = STORE_PRODUCT_PRICES[productId]
    if (price === undefined) return true
    return NovaPixelAuth.user.gilcoinBalance >= price
  }

  function updateBuyButtonAffordability() {
    document
      .querySelectorAll(".rank-buy-btn[data-product], .price-buy-btn[data-product], .vip-product-buy-btn[data-product]")
      .forEach((btn) => {
        const affordable = isAffordable(btn.dataset.product)
        btn.classList.toggle("needs-recharge", !affordable)
        if (btn.classList.contains("price-buy-btn")) {
          btn.innerHTML = affordable ? '<i class="fas fa-shopping-cart"></i>' : '<i class="fas fa-coins"></i>'
          btn.title = affordable ? "" : "Te faltan Gilcoins — clic para recargar"
        } else {
          btn.textContent = affordable ? "Añadir" : "Recargar"
        }
      })
  }

  // Carrito de la tienda: los botones de producto ya no compran al instante,
  // solo agregan al carrito (persistido en localStorage). El pago real de
  // todo el carrito junto ocurre en checkout() contra /api/store/checkout.
  function setupCart() {
    const cartEl = document.getElementById("store-cart")
    if (!cartEl) return null

    const emptyEl = document.getElementById("cart-empty")
    const itemsEl = document.getElementById("cart-items")
    const footerEl = document.getElementById("cart-footer")
    const countEl = document.getElementById("cart-count")
    const totalEl = document.getElementById("cart-total")
    const balanceEl = document.getElementById("cart-balance")
    const errorEl = document.getElementById("cart-error")
    const successEl = document.getElementById("cart-success")
    const checkoutBtn = document.getElementById("cart-checkout-btn")
    const clearBtn = document.getElementById("cart-clear-btn")
    const closeBtn = document.getElementById("cart-close-btn")
    const fabBtn = document.getElementById("cart-fab")
    const fabCountEl = document.getElementById("cart-fab-count")
    const backdropEl = document.getElementById("cart-backdrop")

    function openMobileCart() {
      cartEl.classList.add("mobile-open")
      if (backdropEl) backdropEl.classList.add("active")
    }

    function closeMobileCart() {
      cartEl.classList.remove("mobile-open")
      if (backdropEl) backdropEl.classList.remove("active")
    }

    if (fabBtn) fabBtn.addEventListener("click", openMobileCart)
    if (closeBtn) closeBtn.addEventListener("click", closeMobileCart)
    if (backdropEl) backdropEl.addEventListener("click", closeMobileCart)

    const CART_STORAGE_KEY = "novapixel_cart"
    const MAX_QTY_PER_ITEM = 20

    function loadCart() {
      try {
        const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]")
        return Array.isArray(parsed)
          ? parsed.filter((item) => item && STORE_PRODUCT_PRICES[item.productId] !== undefined && item.quantity > 0)
          : []
      } catch {
        return []
      }
    }

    let cart = loadCart()

    function saveCart() {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    }

    function clearMessages() {
      errorEl.textContent = ""
      errorEl.classList.remove("active")
      successEl.textContent = ""
      successEl.classList.remove("active")
    }

    function render() {
      const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0)
      countEl.textContent = totalQty
      if (fabCountEl) fabCountEl.textContent = totalQty

      if (cart.length === 0) {
        emptyEl.style.display = ""
        itemsEl.style.display = "none"
        footerEl.style.display = "none"
        itemsEl.innerHTML = ""
        return
      }

      emptyEl.style.display = "none"
      itemsEl.style.display = ""
      footerEl.style.display = ""

      let total = 0
      itemsEl.innerHTML = cart
        .map((item) => {
          const price = STORE_PRODUCT_PRICES[item.productId] || 0
          const name = STORE_PRODUCT_NAMES[item.productId] || item.productId
          total += price * item.quantity
          return `
            <div class="store-cart-item" data-product="${item.productId}">
              <div class="store-cart-item-info">
                <span class="store-cart-item-name">${escapeHtml(name)}</span>
                <span class="store-cart-item-price">${price.toLocaleString("es")} 🪙 c/u</span>
              </div>
              <div class="store-cart-item-qty">
                <button type="button" class="cart-qty-btn" data-action="decrease" aria-label="Restar">−</button>
                <span class="cart-qty-value">${item.quantity}</span>
                <button type="button" class="cart-qty-btn" data-action="increase" aria-label="Sumar">+</button>
              </div>
              <button type="button" class="cart-item-remove" data-action="remove" aria-label="Quitar"><i class="fas fa-trash"></i></button>
            </div>
          `
        })
        .join("")

      totalEl.textContent = total.toLocaleString("es")

      if (NovaPixelAuth.user) {
        const balance = NovaPixelAuth.user.gilcoinBalance
        const insufficient = balance < total
        balanceEl.innerHTML = insufficient
          ? `Tu saldo: ${balance.toLocaleString("es")} 🪙 · <a href="#" id="cart-buy-gilcoins-link">Comprar más</a>`
          : `Tu saldo: ${balance.toLocaleString("es")} 🪙`
        balanceEl.classList.toggle("insufficient", insufficient)
        checkoutBtn.disabled = insufficient
        checkoutBtn.textContent = insufficient ? "Saldo insuficiente" : "Finalizar compra"
      } else {
        balanceEl.textContent = "Inicia sesión para pagar con tus Gilcoins."
        balanceEl.classList.remove("insufficient")
        checkoutBtn.disabled = false
        checkoutBtn.textContent = "Iniciar sesión y pagar"
      }
    }

    function addItem(productId) {
      if (STORE_PRODUCT_PRICES[productId] === undefined) return
      const existing = cart.find((item) => item.productId === productId)
      if (existing) {
        if (existing.quantity < MAX_QTY_PER_ITEM) existing.quantity += 1
      } else {
        cart.push({ productId, quantity: 1 })
      }
      saveCart()
      clearMessages()
      render()
      cartEl.classList.add("pulse")
      setTimeout(() => cartEl.classList.remove("pulse"), 400)
    }

    itemsEl.addEventListener("click", (e) => {
      const actionBtn = e.target.closest("[data-action]")
      if (!actionBtn) return
      const itemEl = e.target.closest(".store-cart-item")
      const productId = itemEl?.dataset.product
      const item = cart.find((it) => it.productId === productId)
      if (!item) return

      if (actionBtn.dataset.action === "increase") {
        if (item.quantity < MAX_QTY_PER_ITEM) item.quantity += 1
      } else if (actionBtn.dataset.action === "decrease") {
        item.quantity -= 1
        if (item.quantity <= 0) cart = cart.filter((it) => it.productId !== productId)
      } else if (actionBtn.dataset.action === "remove") {
        cart = cart.filter((it) => it.productId !== productId)
      }
      saveCart()
      render()
    })

    balanceEl.addEventListener("click", (e) => {
      const link = e.target.closest("#cart-buy-gilcoins-link")
      if (!link) return
      e.preventDefault()
      document.dispatchEvent(new CustomEvent("novapixel:open-recharge-modal"))
    })

    clearBtn.addEventListener("click", () => {
      cart = []
      saveCart()
      clearMessages()
      render()
    })

    async function checkout() {
      if (cart.length === 0) return
      if (!NovaPixelAuth.user) {
        pendingCartCheckout = true
        if (authModal) authModal.open()
        return
      }

      clearMessages()
      checkoutBtn.disabled = true
      checkoutBtn.textContent = "Comprando..."

      try {
        const response = await apiFetch("/api/store/checkout", {
          method: "POST",
          body: JSON.stringify({ items: cart.map(({ productId, quantity }) => ({ productId, quantity })) }),
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "No se pudo completar la compra.")
        }

        NovaPixelAuth.user.gilcoinBalance = data.gilcoinBalance
        NovaPixelAuth.render()
        cart = []
        saveCart()
        render()
        successEl.textContent = "¡Compra exitosa! Se entregará cuando entres al servidor."
        successEl.classList.add("active")
      } catch (err) {
        render()
        errorEl.textContent = err.message || "Error de conexión con la tienda. Intenta de nuevo."
        errorEl.classList.add("active")
      } finally {
        checkoutBtn.disabled = false
      }
    }

    checkoutBtn.addEventListener("click", checkout)
    document.addEventListener("novapixel:auth-changed", render)

    render()
    return { addItem, checkout }
  }

  const cartApi = setupCart()
  setupProductDetailModal(cartApi)
  setupGilcoinRechargeModal()

  document
    .querySelectorAll(".rank-buy-btn[data-product], .price-buy-btn[data-product], .vip-product-buy-btn[data-product]")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.classList.contains("needs-recharge")) {
          document.dispatchEvent(new CustomEvent("novapixel:open-recharge-modal"))
          return
        }
        if (cartApi) cartApi.addItem(btn.dataset.product)
      })
    })

  updateBuyButtonAffordability()
  document.addEventListener("novapixel:auth-changed", updateBuyButtonAffordability)
})

// ==========================================================================
// Página "Mis Compras"
// ==========================================================================

const PURCHASE_STATUS_LABELS = {
  pending: "Pendiente de pago",
  paid: "Pagado · se entrega al entrar al server",
  delivered: "Entregado ✅",
}

document.addEventListener("DOMContentLoaded", async () => {
  const table = document.getElementById("purchases-table")
  if (!table) return

  const tableBody = document.getElementById("purchases-table-body")
  const loadingState = document.getElementById("purchases-loading")
  const signedOutState = document.getElementById("purchases-signed-out")
  const emptyState = document.getElementById("purchases-empty-state")
  const loginBtn = document.getElementById("purchases-login-btn")

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("novapixel:open-auth-modal"))
    })
  }

  // No llama a NovaPixelAuth.refresh() aquí: se dispara desde el evento
  // "novapixel:auth-changed" (emitido por NovaPixelAuth.render()), así que
  // llamar refresh() de nuevo aquí re-disparía el evento en bucle.
  async function loadPurchases() {
    loadingState.style.display = ""
    signedOutState.style.display = "none"
    emptyState.style.display = "none"
    table.style.display = "none"

    if (!NovaPixelAuth.user) {
      loadingState.style.display = "none"
      signedOutState.style.display = ""
      return
    }

    try {
      const res = await apiFetch("/api/purchases/me")
      if (!res.ok) throw new Error()
      const data = await res.json()

      loadingState.style.display = "none"

      if (data.purchases.length === 0) {
        emptyState.style.display = ""
        return
      }

      tableBody.innerHTML = data.purchases
        .map(
          (p) => `
        <tr>
          <td>${escapeHtml(p.productName)}</td>
          <td>${escapeHtml(PURCHASE_STATUS_LABELS[p.status] || p.status)}</td>
          <td>${escapeHtml(new Date(p.createdAt).toLocaleString("es"))}</td>
        </tr>
      `
        )
        .join("")
      table.style.display = ""
    } catch {
      loadingState.style.display = "none"
      signedOutState.style.display = ""
      signedOutState.querySelector("p").textContent = "No se pudo cargar tu historial. Intenta de nuevo más tarde."
    }
  }

  // La otra escucha de DOMContentLoaded (arriba en este archivo) ya llama a
  // NovaPixelAuth.refresh() en cada página; solo hace falta escuchar su resultado.
  document.addEventListener("novapixel:auth-changed", loadPurchases)
})

// ==========================================================================
// Página "Confirmando pago" (retorno de PayPal al comprar Gilcoins)
// ==========================================================================

document.addEventListener("DOMContentLoaded", async () => {
  const loadingState = document.getElementById("callback-loading")
  if (!loadingState) return

  const successState = document.getElementById("callback-success")
  const errorState = document.getElementById("callback-error")
  const balanceLabel = document.getElementById("callback-balance")
  const errorMessage = document.getElementById("callback-error-message")

  function showError(message) {
    loadingState.style.display = "none"
    errorState.style.display = ""
    errorMessage.textContent = message
  }

  const orderId = new URLSearchParams(window.location.search).get("token")
  if (!orderId) {
    showError("Falta el identificador del pago. Si ya pagaste, revisa tu saldo en la tienda.")
    return
  }

  await NovaPixelAuth.refresh()
  if (!NovaPixelAuth.user) {
    showError("Tu sesión expiró. Inicia sesión de nuevo y revisa tu saldo en la tienda.")
    return
  }

  try {
    const res = await apiFetch("/api/gilcoins/paypal/capture", {
      method: "POST",
      body: JSON.stringify({ orderId }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "No se pudo confirmar el pago.")

    NovaPixelAuth.user.gilcoinBalance = data.gilcoinBalance
    NovaPixelAuth.render()

    loadingState.style.display = "none"
    successState.style.display = ""
    balanceLabel.textContent = data.gilcoinBalance.toLocaleString("es")
  } catch (err) {
    showError(err.message || "No se pudo confirmar el pago con PayPal.")
  }
})

// ==========================================================================
// Página "Restablecer contraseña"
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  const formView = document.getElementById("reset-form-view")
  if (!formView) return

  const successView = document.getElementById("reset-success-view")
  const missingTokenView = document.getElementById("reset-missing-token-view")
  const passwordInput = document.getElementById("reset-password-input")
  const confirmInput = document.getElementById("reset-password-confirm-input")
  const errorLabel = document.getElementById("reset-error")
  const submitBtn = document.getElementById("reset-submit")

  const token = new URLSearchParams(window.location.search).get("token")
  if (!token) {
    formView.style.display = "none"
    missingTokenView.style.display = ""
    return
  }

  submitBtn.addEventListener("click", async () => {
    const password = passwordInput.value
    const confirm = confirmInput.value
    errorLabel.classList.remove("active")

    if (password.length < 8) {
      errorLabel.textContent = "La contraseña debe tener al menos 8 caracteres."
      errorLabel.classList.add("active")
      return
    }
    if (password !== confirm) {
      errorLabel.textContent = "Las contraseñas no coinciden."
      errorLabel.classList.add("active")
      return
    }

    submitBtn.disabled = true
    try {
      const res = await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword: password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "No se pudo restablecer la contraseña.")

      formView.style.display = "none"
      successView.style.display = ""
    } catch (err) {
      errorLabel.textContent = err.message
      errorLabel.classList.add("active")
      submitBtn.disabled = false
    }
  })
})

// Smooth scrolling for navigation links (excluye href="#" sueltos, que se
// usan como botones JS dentro del modal de auth, ej. "¿Olvidaste tu contraseña?")
document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  })
})

// Copy IP function
function copyIP() {
  const ip = "novapixel.host:25565"
  navigator.clipboard
    .writeText(ip)
    .then(() => {
      // Create notification
      const notification = document.createElement("div")
      notification.textContent = "¡IP copiada al portapapeles!"
      notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00d4ff, #0099cc);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `

      // Add animation keyframes
      if (!document.querySelector("#notification-styles")) {
        const style = document.createElement("style")
        style.id = "notification-styles"
        style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `
        document.head.appendChild(style)
      }

      document.body.appendChild(notification)

      // Remove notification after 3 seconds
      setTimeout(() => {
        notification.style.animation = "slideOut 0.3s ease-out"
        setTimeout(() => {
          document.body.removeChild(notification)
        }, 300)
      }, 3000)
    })
    .catch(() => {
      alert("IP del servidor: " + ip)
    })
}
// Copy IP function
function copyIP1() {
  const ip = "novapixel.host  Puerto: 25565"
  navigator.clipboard
    .writeText(ip)
    .then(() => {
      // Create notification
      const notification = document.createElement("div")
      notification.textContent = "¡IP copiada al portapapeles!"
      notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00d4ff, #0099cc);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `

      // Add animation keyframes
      if (!document.querySelector("#notification-styles")) {
        const style = document.createElement("style")
        style.id = "notification-styles"
        style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `
        document.head.appendChild(style)
      }

      document.body.appendChild(notification)

      // Remove notification after 3 seconds
      setTimeout(() => {
        notification.style.animation = "slideOut 0.3s ease-out"
        setTimeout(() => {
          document.body.removeChild(notification)
        }, 300)
      }, 3000)
    })
    .catch(() => {
      alert("IP del servidor: " + ip)
    })
}

// Navbar scroll effect
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar")
  if (window.scrollY > 100) {
    navbar.style.background = "rgba(10, 10, 10, 0.98)"
  } else {
    navbar.style.background = "rgba(10, 10, 10, 0.95)"
  }
})

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animation = "fadeInUp 0.8s ease-out forwards"
    }
  })
}, observerOptions)

// Observe elements for animation
document.addEventListener("DOMContentLoaded", () => {
  const animateElements = document.querySelectorAll(".feature-card, .rule-item, .event-card, .rank-card, .price-card")
  animateElements.forEach((el) => {
    el.style.opacity = "0"
    el.style.transform = "translateY(30px)"
    observer.observe(el)
  })
})

// Banner dorado "NovaPixel VIP": al hacer clic entra a una "tienda" exclusiva
// que reemplaza la tienda normal (la oculta) y deja ver Donador VIP + el
// carrito. El botón "Volver" regresa a la tienda normal. Es la única
// segunda "tienda" que existe aparte del catálogo principal.
document.addEventListener("DOMContentLoaded", () => {
  const vipBannerBtn = document.getElementById("vip-hero-banner-btn")
  const vipBackBtn = document.getElementById("vip-back-btn")
  const vipSection = document.getElementById("cat-donador-vip")
  if (!vipSection) return

  if (vipBannerBtn) {
    vipBannerBtn.addEventListener("click", () => {
      document.body.classList.add("vip-exclusive-mode")
      vipSection.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  if (vipBackBtn) {
    vipBackBtn.addEventListener("click", () => {
      document.body.classList.remove("vip-exclusive-mode")
      vipSection.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  // Los links "VIP" del footer en otras páginas apuntan a
  // tienda.html#cat-donador-vip: sin esto, el ancla llegaba a un elemento
  // display:none y no pasaba nada visible.
  if (window.location.hash === "#cat-donador-vip") {
    document.body.classList.add("vip-exclusive-mode")
    vipSection.scrollIntoView({ block: "start" })
  }
})

// Menú horizontal de categorías de la tienda. "Todos" (data-target="all")
// muestra todas las categorías a la vez; el resto de pestañas muestra solo
// la suya. Único catálogo — ya no hay página de inicio previa ni sidebar.
document.addEventListener("DOMContentLoaded", () => {
  // El botón "Recargar Gilcoins" vive al final del menú (misma pinta que
  // las pestañas), pero no activa una categoría: abre el modal de recarga.
  const rechargeMenuBtn = document.getElementById("store-menu-recharge-btn")
  if (rechargeMenuBtn) {
    rechargeMenuBtn.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("novapixel:open-recharge-modal"))
    })
  }

  const tabs = Array.from(document.querySelectorAll(".store-tab")).filter((t) => t.dataset.target)
  const categories = document.querySelectorAll(".store-category")
  if (tabs.length === 0) return

  function activateTab(tab) {
    tabs.forEach((t) => t.classList.remove("active"))
    tab.classList.add("active")

    if (tab.dataset.target === "all") {
      categories.forEach((c) => c.classList.add("active"))
      return
    }
    categories.forEach((c) => c.classList.remove("active"))
    document.getElementById(tab.dataset.target)?.classList.add("active")
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab))
  })

  // Permite llegar directo a una categoría desde otra página o desde el
  // propio navbar, ej. tienda.html#cat-donador-vip abre la pestaña Donador
  // VIP. Si ya estás en tienda.html, cambiar el hash no recarga la página
  // (mismo path), así que también hay que escuchar "hashchange".
  function syncTabFromHash() {
    const hashTarget = window.location.hash.replace("#", "")
    if (!hashTarget) return
    const matchingTab = Array.from(tabs).find((t) => t.dataset.target === hashTarget)
    if (matchingTab) activateTab(matchingTab)
  }

  // Estado inicial: si el hash no marcó ninguna pestaña, se activa la que
  // ya viene marcada en el HTML ("Todos" por defecto) para que "Todos"
  // realmente muestre todas las categorías desde el primer render.
  if (!window.location.hash) {
    const initialTab = document.querySelector(".store-tab.active") || tabs[0]
    activateTab(initialTab)
  }

  syncTabFromHash()
  window.addEventListener("hashchange", syncTabFromHash)
})

// Selector "30 días" / "Indefinido" dentro de la pestaña Rangos: alterna
// qué panel de precios se ve sin salir de la categoría.
document.addEventListener("DOMContentLoaded", () => {
  const durationBtns = document.querySelectorAll(".rank-duration-btn")
  const durationPanels = document.querySelectorAll(".rank-duration-panel")
  if (durationBtns.length === 0) return

  durationBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      durationBtns.forEach((b) => b.classList.remove("active"))
      durationPanels.forEach((p) => p.classList.remove("active"))
      btn.classList.add("active")
      document.querySelector(`.rank-duration-panel[data-duration="${btn.dataset.duration}"]`)?.classList.add("active")
    })
  })
})

// Menú móvil: en pantallas angostas el navbar se reduce a solo logo +
// botón de hamburguesa. Al abrirlo, mueve (no clona) los links de
// navegación, Discord/TikTok y el bloque de carrito+cuenta dentro de un
// panel desplegable único. Al volver a escritorio los regresa a su lugar
// original, así los mismos elementos (con sus listeners y el id
// #nav-account que usa NovaPixelAuth) siguen funcionando en ambos layouts.
function setupMobileMenu() {
  const navbar = document.querySelector(".navbar")
  if (!navbar) return

  const navContent = navbar.querySelector(".nav-content")
  const navbarTop = navbar.querySelector(".navbar-top")
  const navLinks = navbar.querySelector(".nav-links")
  const socialLinks = navbar.querySelector(".navbar-top .social-links")
  const navActions = navbar.querySelector(".nav-actions")

  let menuBtn = navbar.querySelector(".mobile-menu-btn")
  let dropdown = navbar.querySelector(".mobile-menu-dropdown")

  const isMobile = window.matchMedia("(max-width: 768px)").matches

  if (isMobile) {
    if (!menuBtn) {
      menuBtn = document.createElement("button")
      menuBtn.type = "button"
      menuBtn.className = "mobile-menu-btn"
      menuBtn.setAttribute("aria-label", "Abrir menú")
      menuBtn.innerHTML = '<i class="fas fa-bars"></i>'
      menuBtn.addEventListener("click", () => {
        dropdown.classList.toggle("mobile-active")
      })
      navContent.appendChild(menuBtn)
    }

    if (!dropdown) {
      dropdown = document.createElement("div")
      dropdown.className = "mobile-menu-dropdown"
      navContent.appendChild(dropdown)
    }

    // Orden dentro del desplegable: Inicio/Eventos/Reglas/Información,
    // luego carrito + iniciar sesión, y Discord/TikTok al final (abajo).
    if (navLinks && navLinks.parentElement !== dropdown) dropdown.appendChild(navLinks)
    if (navActions && navActions.parentElement !== dropdown) dropdown.appendChild(navActions)
    if (socialLinks && socialLinks.parentElement !== dropdown) dropdown.appendChild(socialLinks)
  } else {
    // Restaura cada elemento a su posición original en el navbar de
    // escritorio. Se compara el padre actual (no solo si existe dropdown)
    // para que esto sea seguro de llamar aunque nunca se haya movido nada.
    if (navLinks && navContent && navLinks.parentElement !== navContent) {
      navContent.insertBefore(navLinks, navActions && navActions.parentElement === navContent ? navActions : (menuBtn || null))
    }
    if (navActions && navContent && navActions.parentElement !== navContent) {
      navContent.insertBefore(navActions, menuBtn || null)
    }
    if (socialLinks && navbarTop && socialLinks.parentElement !== navbarTop) {
      navbarTop.appendChild(socialLinks)
    }
    if (dropdown) dropdown.classList.remove("mobile-active")
  }
}

window.addEventListener("load", setupMobileMenu)
window.matchMedia("(max-width: 768px)").addEventListener("change", setupMobileMenu)

// Carousel functionality for hero images
let slideIndex = 1
let slideInterval

function showSlides(n) {
  const slides = document.getElementsByClassName("hero-slide")
  const dots = document.getElementsByClassName("dot")

  if (n > slides.length) {
    slideIndex = 1
  }
  if (n < 1) {
    slideIndex = slides.length
  }

  for (let i = 0; i < slides.length; i++) {
    slides[i].classList.remove("active")
  }

  for (let i = 0; i < dots.length; i++) {
    dots[i].classList.remove("active")
  }

  if (slides[slideIndex - 1]) {
    slides[slideIndex - 1].classList.add("active")
  }

  if (dots[slideIndex - 1]) {
    dots[slideIndex - 1].classList.add("active")
  }
}

function currentSlide(n) {
  clearInterval(slideInterval)
  showSlides((slideIndex = n))
  startAutoSlide()
}

function nextSlide() {
  showSlides((slideIndex += 1))
}

function startAutoSlide() {
  slideInterval = setInterval(nextSlide, 8000) // Change slide every 8 seconds
}

// Initialize carousel when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Wait a bit for images to load
  setTimeout(() => {
    showSlides(slideIndex)
    startAutoSlide()
  }, 100)
})

// ==========================================================================
// Eventos: antes eran cards fijas hardcodeadas acá mismo, ahora el staff
// las administra desde el panel de Django (/admin/events/event/) y esto
// solo las pinta.
// ==========================================================================

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("events-grid")
  if (!grid) return

  try {
    const res = await apiFetch("/api/events/")
    if (!res.ok) throw new Error("No se pudo cargar")
    const { events } = await res.json()

    if (events.length === 0) {
      grid.innerHTML = `<p class="events-loading">No hay eventos activos por ahora.</p>`
      return
    }

    grid.innerHTML = events
      .map(
        (event) => `
          <div class="event-card">
            <div class="event-image">
              ${event.image ? `<img src="${event.image}" alt="${escapeHtml(event.title)}">` : ""}
              <div class="event-badge">${escapeHtml(event.badgeLabel)}</div>
            </div>
            <div class="event-content">
              <h3>${escapeHtml(event.title)}</h3>
              <p>${escapeHtml(event.description)}</p>
            </div>
          </div>
        `,
      )
      .join("")
  } catch {
    grid.innerHTML = `<p class="events-loading">No se pudieron cargar los eventos. Intenta más tarde.</p>`
  }
})
