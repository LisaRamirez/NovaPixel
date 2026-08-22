// ==========================================================================
// Tienda: checkout con nick de Minecraft
// ==========================================================================

// URL base del backend de la tienda (ver carpeta /django_backend).
// En producción el backend vive en el subdominio api.* del mismo dominio raíz:
// eso es lo que mantiene válida la cookie de sesión (SameSite=Lax la descarta
// entre dominios distintos, y el login parecería fallar sin ningún error).
// En desarrollo se deriva del host desde el que se sirve la página (puerto
// 8001) en vez de fijar "localhost": así el sitio también funciona al
// abrirlo desde otro equipo de la red local, donde "localhost" apuntaría
// al equipo del visitante y no al que corre el backend.
const NOVAPIXEL_API_BASE = (() => {
  const { protocol, hostname } = window.location
  const isLocal =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.")
  if (isLocal) return `${protocol}//${hostname}:8001`
  // Producción: novapixelmc.com y www.novapixelmc.com → api.novapixelmc.com
  return `https://api.${hostname.replace(/^www\./, "")}`
})()

// Catálogo solo para mostrar el nombre del producto en el modal.
// El precio real y la validación del producto viven en server/src/products.js
const STORE_PRODUCT_NAMES = {
  "paquete-inmortal": "Paquete Inmortal",
  "paquete-absoluto": "Paquete Absoluto",
  "paquete-supremo": "Paquete Supremo",
  "rango-angelical-30": "Rango Angelical · 30 días",
  "rango-celestial-30": "Rango Celestial · 30 días",
  "rango-divino-30": "Rango Divino · 30 días",
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
  "comandos-pack": "Pack Comandos (/anvil /hat /ec /craft)",
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

// Costo en GGcoins de cada producto (100 GGcoins = $1, mismo valor que
// priceCents en server/src/products.js). El backend siempre revalida el
// precio real al comprar — esto es solo para mostrarlo en el modal.
const STORE_PRODUCT_PRICES = {
  "paquete-inmortal": 11100,
  "paquete-absoluto": 22300,
  "paquete-supremo": 25400,
  "rango-angelical-30": 1400,
  "rango-celestial-30": 2900,
  "rango-divino-30": 4400,
  "pico-3x3": 3200,
  "proteccion-diamante-128": 2400,
  "proteccion-netherita-256": 5000,
  "proteccion-esmeralda-512": 7000,
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
  "economia-50k": 2700,
  "economia-100k": 5000,
  "fly-indefinido": 1500,
  "fly-30": 800,
  "comandos-pack": 400,
  "spawner-vaca": 600,
  "spawner-pollo": 600,
  "spawner-cerdo": 600,
  "spawner-arana": 1380,
  "schematic-pegado": 5000,
  "donador-vip-lv10": 10300,
  "donador-vip-lv14": 13450,
  "donador-vip-lv18": 23600,
  "donador-vip-lv22": 41000,
}

// Beneficios de rangos y Donador VIP para el modal de detalle, que se abre
// al tocar la imagen del producto (.product-detail-trigger[data-detail]).
// Texto tal cual la información de producto ya provista — no se agregan
// beneficios nuevos.
const PRODUCT_DETAILS = {
  "paquete-inmortal": {
    image: "images/paquete-inmortal-icon.png",
    name: "Paquete Inmortal",
    description:
      "Ocho beneficios en una sola compra, por 600 GGcoins menos que adquirirlos sueltos. Incluye el Rango Angelical indefinido, que desde la retirada de los rangos permanentes ya solo se consigue dentro de un paquete.",
    price: "11,100 🪙",
    duration: "Permanente",
    benefits: [
      "👑 Rango Angelical INDEFINIDO",
      "🔒 Protección Diamante 128x128",
      "✨ Brillo (Glowing) a tu elección",
      "🧪 100 Lv de Exp",
      "💰 50k de economía",
      "🪶 Fly x 30 días",
      "📦 01 Spawner a elección de la tienda",
      "🗝️ 01 Llave Ancestral",
      "🏷️ Por separado costaría 11,800 🪙 — ahorras 700",
    ],
  },
  "paquete-absoluto": {
    image: "images/paquete-absoluto-icon.png",
    name: "Paquete Absoluto",
    description:
      "El escalón intermedio: sube el rango a Celestial indefinido, dobla el alcance de la protección hasta 256x256 y añade el pegado de schematic y una segunda Llave Ancestral. Ahorras 900 GGcoins frente a comprarlo por separado.",
    price: "22,300 🪙",
    duration: "Permanente",
    benefits: [
      "👑 Rango Celestial INDEFINIDO",
      "🔒 Protección Netherita 256x256",
      "✨ Brillo (Glowing) a tu elección",
      "🧪 250 Lv de Exp",
      "💰 100k de economía",
      "📦 01 Spawner a elección de la tienda",
      "🏗️ Pegado de Schematic",
      "🗝️ 02 Llaves Ancestrales",
      "🏷️ Por separado costaría 23,200 🪙 — ahorras 900",
    ],
  },
  "paquete-supremo": {
    image: "images/paquete-supremo-icon.png",
    name: "Paquete Supremo",
    description:
      "El lote más completo de la tienda: Rango Divino indefinido, la protección más grande que se vende, tres Llaves Ancestrales y 150k de economía inicial. Ahorras 1.100 GGcoins frente a comprar cada pieza por su cuenta.",
    price: "25,400 🪙",
    duration: "Permanente",
    benefits: [
      "👑 Rango Divino INDEFINIDO",
      "🔒 Protección Esmeralda 512x512",
      "✨ Brillo (Glowing) a tu elección",
      "🧪 300 Lv de Exp",
      "💰 150k de economía",
      "📦 01 Spawner a elección de la tienda",
      "🏗️ Pegado de Schematic",
      "🗝️ 03 Llaves Ancestrales",
      "🏷️ Por separado costaría 26,500 🪙 — ahorras 1,100",
    ],
  },
  "rango-angelical-30": {
    image: "images/rango-angelical-icon.png",
    name: "Rango Angelical",
    description:
      "¿Quieres progresar más rápido, disfrutar de mayor comodidad y desbloquear ventajas exclusivas sin perder la esencia de la supervivencia?",
    price: "1,400 🪙",
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
    description:
      "El Rango Celestial es la opción ideal para quienes buscan máxima comodidad, mayor libertad y beneficios exclusivos durante 30 días.",
    price: "2,900 🪙",
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
    description:
      "El Rango Divinity está diseñado para jugadores que quieren disfrutar de una experiencia premium durante 30 días, con una enorme cantidad de ventajas, comandos exclusivos, mayor capacidad de almacenamiento y un poderoso impulso para su progreso.",
    price: "4,400 🪙",
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
  "donador-vip-lv10": {
    image: "images/donador-vip-lv10-icon.png",
    name: "Donador VIP LV10",
    description:
      "El DONADOR LUXURY está creado para quienes quieren llevar su experiencia al máximo, disfrutar de beneficios exclusivos y destacar dentro de la comunidad.",
    price: "10,300 🪙 · $65 USD",
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
    image: "images/donador-vip-lv14-icon.png",
    name: "Donador VIP LV14",
    description:
      "El DONADOR LUXURY de $90 USD es un rango INDEFINIDO diseñado para quienes quieren disfrutar de una de las experiencias más completas y exclusivas de NOVAPIXEL.",
    price: "13,450 🪙 · $85 USD",
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
    image: "images/donador-vip-lv18-icon.png",
    name: "Donador VIP LV18",
    description:
      "El DONADOR LUXURY de $150 USD representa el nivel más alto de esta línea de beneficios. Un rango INDEFINIDO creado para jugadores que buscan disfrutar de una experiencia premium, destacar dentro de la comunidad y acceder a una enorme cantidad de ventajas exclusivas.",
    price: "23,600 🪙 · $150 USD",
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
    image: "images/donador-vip-lv22-icon.png",
    name: "Donador VIP LV22",
    description:
      "El DONADOR LUXURY de $250 USD es la edición más exclusiva y costosa de nuestra tienda, creada para jugadores que quieren disfrutar de una experiencia premium llevada al máximo nivel.",
    price: "41,000 🪙 · $250 USD",
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
  "brillo-agua": {
    image: "images/brillo-agua-icon.png",
    name: "Brillo Agua",
    description:
      "Con Brillo Agua podrás disfrutar de un espectacular efecto Glowing que hará que tu personaje resalte con un intenso tono agua, creando una apariencia fresca, brillante y diferente.",
    price: "500 🪙",
    duration: "Permanente",
    benefits: [
      "💧 Brillo color agua alrededor de tu personaje",
      "✨ Efecto Glowing",
      "👀 Destaca fácilmente entre los demás jugadores",
      "🌎 Disfrútalo en todo el servidor",
      "💎 Beneficio cosmético exclusivo",
    ],
  },
  "brillo-arcoiris": {
    image: "images/brillo-arcoiris-icon.png",
    name: "Brillo Arcoíris",
    description:
      "Lleva tu apariencia al siguiente nivel con Brillo Arcoíris, un espectacular beneficio cosmético que hará que tu personaje destaque con un llamativo efecto Glowing multicolor.",
    price: "500 🪙",
    duration: "Permanente",
    benefits: [
      "🌈 Efecto Arcoíris",
      "✨ Glowing alrededor de todo tu personaje",
      "👀 Destaca fácilmente entre los demás jugadores",
      "🌎 Disfrútalo en todo el servidor",
      "💎 Un efecto cosmético único y llamativo",
    ],
  },
  "brillo-azul": {
    image: "images/brillo-azul-icon.png",
    name: "Brillo Azul",
    description:
      "Con Brillo Azul podrás darle a tu personaje un espectacular efecto de brillo (Glowing) que hará que resaltes visualmente estés donde estés.",
    price: "500 🪙",
    duration: "Permanente",
    benefits: [
      "💙 Brillo azul alrededor de tu personaje",
      "✨ Efecto Glowing",
      "👀 Hazte visible y destaca entre los demás",
      "🌎 Disfrútalo en todo el servidor",
      "💎 Beneficio cosmético exclusivo",
    ],
  },
  "brillo-negro": {
    image: "images/brillo-negro-icon.png",
    name: "Brillo Negro",
    description:
      "Con Brillo Negro podrás disfrutar de un exclusivo efecto Glowing que hará resaltar tu personaje con una estética oscura, elegante y única.",
    price: "500 🪙",
    duration: "Permanente",
    benefits: [
      "🖤 Brillo negro alrededor de tu personaje",
      "✨ Efecto Glowing",
      "👀 Destaca entre todos los jugadores",
      "🌎 Disfrútalo en todo el servidor",
      "💎 Beneficio cosmético exclusivo",
    ],
  },
  "brillo-rosado": {
    image: "images/brillo-rosado-icon.png",
    name: "Brillo Rosado",
    description:
      "Con Brillo Rosado podrás disfrutar de un espectacular efecto Glowing que hará resaltar todo tu personaje con un intenso tono rosado.",
    price: "500 🪙",
    duration: "Permanente",
    benefits: [
      "💗 Brillo rosado alrededor de tu personaje",
      "✨ Efecto Glowing",
      "👀 Destaca fácilmente entre los demás jugadores",
      "🌎 Disfrútalo en todo el servidor",
      "💎 Beneficio cosmético exclusivo",
    ],
  },
  "comandos-pack": {
    name: "Pack Comandos (/anvil /hat /ec /craft)",
    description:
      "Con el Pack de Comandos tendrás acceso a /hat, /ec y /craft, disponibles tanto en Survival como en el MapaMundi.",
    price: "400 🪙",
    duration: "Permanente",
    benefits: [
      "⚡ 3 comandos incluidos",
      "🌎 Disponibles en Survival",
      "🗺 Disponibles en MapaMundi",
      "💎 Una alternativa económica a un rango premium",
      "🚀 Más comodidad durante tu aventura",
    ],
  },
  "economia-100k": {
    name: "100,000 de Economía",
    description:
      "Con 100,000 de Economía recibirás 100,000 de dinero IN-GAME directamente dentro de NOVAPIXEL, listo para gastar, invertir y aprovechar en la economía del servidor.",
    price: "5,000 🪙",
    duration: "Entrega unica",
    benefits: [
      "🪙 +100,000 de dinero dentro del juego",
      "🛒 Compra todo lo que necesites dentro del servidor",
      "⚔ Invierte en tu equipamiento y progreso",
      "🏠 Consigue recursos y productos del mercado",
      "🚀 Impulsa tu aventura desde el primer momento",
    ],
  },
  "economia-50k": {
    name: "50,000 de Economía",
    description:
      "Con este producto recibirás 50,000 de dinero dentro del juego, listos para utilizar en la economía del servidor.",
    price: "2,700 🪙",
    duration: "Entrega unica",
    benefits: [
      "🪙 +50,000 de dinero IN-GAME",
      "🛒 Compra productos y objetos dentro del servidor",
      "⚔ Invierte en tu progreso",
      "🏠 Obtén lo que necesitas para tu aventura",
      "🚀 Impulsa tu economía desde el primer momento",
    ],
  },
  "exp-100": {
    name: "Experiencia 100 Niveles",
    description:
      "Con Experiencia 100 Niveles recibirás un bote de experiencia dentro del juego que te permitirá obtener 100 niveles de XP y acelerar tu progreso inmediatamente.",
    price: "400 🪙",
    duration: "Entrega unica",
    benefits: [
      "🎯 +100 niveles de experiencia",
      "🧪 Bote de experiencia entregado dentro del juego",
      "⚡ Recibe tu XP y úsala cuando quieras",
      "🔥 Ideal para potenciar tu equipamiento",
    ],
  },
  "exp-250": {
    name: "Experiencia 250 Niveles",
    description:
      "¿Necesitas una gran cantidad de experiencia para potenciar tus objetos y avanzar más rápido?",
    price: "900 🪙",
    duration: "Entrega unica",
    benefits: [
      "🎯 +250 niveles de experiencia",
      "🧪 Bote de experiencia entregado dentro del juego",
      "⚡ Gran impulso instantáneo de XP",
      "🔥 Perfecto para encantar y mejorar tu equipamiento",
    ],
  },
  "fly-30": {
    name: "Fly 30 días",
    description:
      "¿Quieres moverte libremente por el servidor, explorar desde las alturas y construir con mucha más comodidad?",
    price: "800 🪙",
    duration: "30 dias",
    benefits: [
      "🕊 Acceso a /fly durante 30 días",
      "🌎 Vuela en Survival",
      "🗺 Vuela en el MapaMundi",
      "🏗 Construye desde el aire con mayor facilidad",
      "⚡ Desplázate rápidamente por el mundo",
    ],
  },
  "fly-indefinido": {
    name: "Fly Indefinido",
    description:
      "¿Cansado de caminar largas distancias? ¿Quieres construir, explorar y moverte por el mundo con total libertad?",
    price: "1,500 🪙",
    duration: "Indefinido",
    benefits: [
      "🕊 Acceso a /fly INDEFINIDO",
      "🌎 Vuela en Survival",
      "🗺 Vuela en el MapaMundi",
      "🏗 Construye desde el aire con mayor comodidad",
      "🚀 Muévete rápidamente por el mundo",
      "🕊 Survival + Fly",
      "🗺 MapaMundi + Fly",
      "♾ Acceso INDEFINIDO",
    ],
  },
  "kit-bahamon": {
    image: "images/kit-bahamon-icon.png",
    name: "Kit Bahamon",
    description:
      "¿Te gustan las armaduras oscuras, las criaturas legendarias y las apariencias que imponen respeto?",
    price: "1,700 🪙",
    duration: "Permanente",
    benefits: [
      "🌑 Estética oscura",
      "🐉 Inspiración de dragón",
      "🪽 Alas imponentes",
      "⚔ Armas a juego",
      "👑 Diseño exclusivo y amenazante",
      "🪽 Alas majestuosas",
      "🌑 Armadura oscura",
      "🐉 Detalles inspirados en dragones",
    ],
  },
  "kit-bee": {
    image: "images/kit-bee-icon.png",
    name: "Kit Bee",
    description:
      "El Kit Bee llega para demostrar que también puedes ser tierno, elegante y espectacular al mismo tiempo.",
    price: "1,600 🪙",
    duration: "Permanente",
    benefits: [
      "🐝 Temática de abeja",
      "✨ Armadura dorada",
      "🪽 Alas espectaculares",
      "⚔ Armas personalizadas",
      "🛠 Herramientas a juego",
      "👑 Diseño exclusivo de NOVAPIXEL",
      "🪽 Alas majestuosas",
      "💛 Detalles dorados",
    ],
  },
  "kit-conqueror": {
    image: "images/kit-conqueror-icon.png",
    name: "Kit Conqueror",
    description:
      "El Kit Conqueror es un conjunto estético especial que combina una imponente inspiración árabe y maya, acompañado de unas alas majestuosas que convierten tu personaje en una presencia imposible de ignorar.",
    price: "2,000 🪙",
    duration: "Permanente",
    benefits: [
      "✨ Diseño exclusivo",
      "🪽 Alas majestuosas",
      "🏜 Inspiración árabe",
      "🌿 Detalles de estilo maya",
      "👑 Apariencia digna de un conquistador",
    ],
  },
  "kit-darkflame": {
    image: "images/kit-darkflame-icon.png",
    name: "Kit Darkflame",
    description:
      "El Kit Darkflame está diseñado para quienes prefieren un estilo oscuro, demoníaco y amenazante, con una estética dominada por intensas llamas rojas y una armadura que parece salida de las profundidades del Nether.",
    price: "2,200 🪙",
    duration: "Permanente",
    benefits: [
      "🔥 Llamas rojas imponentes",
      "😈 Diseño demoníaco",
      "🪖 Casco de apariencia siniestra",
      "⚔ Armadura oscura y amenazante",
      "✨ Diseño estético exclusivo",
      "😈 Detalles malignos",
      "🔥 Efectos y elementos de fuego",
      "🪖 Casco intimidante",
    ],
  },
  "kit-ifrit": {
    image: "images/kit-ifrit-icon.png",
    name: "Kit Ifrit",
    description:
      "El Kit Ifrit combina una estética oscura con intensos detalles en rojo y negro, acompañada de unas espectaculares alas inspiradas en un dragón.",
    price: "1,500 🪙",
    duration: "Permanente",
    benefits: [
      "🐉 Estética de criatura legendaria",
      "🪽 Alas rojas y negras",
      "🔥 Detalles intensos y llamativos",
      "🌑 Armadura oscura",
      "👑 Diseño exclusivo y majestuoso",
      "🪽 Rojo intenso",
      "🌑 Negro profundo",
      "🐉 Inspiración de dragón",
    ],
  },
  "kit-loki": {
    image: "images/kit-loki-icon.png",
    name: "Kit Loki",
    description:
      "El Kit Loki está inspirado en la estética del legendario Loki, con una imponente armadura verde, un casco con características similares a sus emblemáticos cuernos y un conjunto de armas que completan su apariencia.",
    price: "1,700 🪙",
    duration: "Permanente",
    benefits: [
      "💚 Armadura verde imponente",
      "🪖 Casco inspirado en sus característicos cuernos",
      "⚔ Armas a juego",
      "🐍 Estética inspirada en Loki",
      "👑 Diseño único y llamativo",
      "⚔ Tus encantamientos",
      "➕💚 La estética de Loki",
      "🟰🔥 Una armadura completamente personalizada",
    ],
  },
  "kit-molten": {
    image: "images/kit-molten-icon.png",
    name: "Kit Molten",
    description:
      "El Kit Molten combina una estética oscura con un diseño sofisticado que transforma por completo la apariencia de tu personaje.",
    price: "1,800 🪙",
    duration: "Permanente",
    benefits: [
      "🖤 Armadura de tonos oscuros",
      "🪽 Alas de diseño espectacular",
      "🎩 Casco elegante e imponente",
      "✨ Estética refinada y exclusiva",
      "👑 Diseño pensado para destacar",
      "🪽 Diseño oscuro",
      "🌑 Detalles misteriosos",
      "✨ Apariencia sofisticada",
    ],
  },
  "kit-necros": {
    image: "images/kit-necros-icon.png",
    name: "Kit Necros",
    description:
      "¿Te gustan las apariencias oscuras, pero quieres añadir un toque de brillo, misterio y poder?",
    price: "2,000 🪙",
    duration: "Permanente",
    benefits: [
      "💜 Color morado brillante",
      "🪽 Alas espectaculares",
      "🌑 Estética de ángel oscuro",
      "✨ Armadura con detalles luminosos",
      "👑 Diseño exclusivo y llamativo",
      "💜 Brillo morado",
      "🪽 Alas imponentes",
      "🌑 Estética oscura",
    ],
  },
  "kit-sakura": {
    image: "images/kit-sakura-icon.png",
    name: "Kit Sakura",
    description:
      "Inspirado en la belleza de los cerezos en flor, este kit combina tonos rosados, detalles delicados y una estética espectacular que transforma por completo la apariencia de tu personaje.",
    price: "1,500 🪙",
    duration: "Permanente",
    benefits: [
      "🌸 Inspiración Sakura",
      "💗 Estética rosa exclusiva",
      "🪽 Alas espectaculares",
      "⚔ Armas personalizadas",
      "🛠 Herramientas a juego",
      "✨ Diseño elegante y llamativo",
      "🪽 Alas con estética Sakura",
      "🛡 Armadura personalizada",
    ],
  },
  "kit-samurai": {
    image: "images/kit-samurai-icon.png",
    name: "Kit Samurai",
    description:
      "¿Quieres dejar atrás las armaduras convencionales y darle a tu personaje una apariencia completamente diferente?",
    price: "3,200 🪙",
    duration: "Permanente",
    benefits: [
      "✨ Diseños asiáticos exclusivos",
    ],
  },
  "kit-star-light": {
    image: "images/kit-star-light-icon.png",
    name: "Kit Star Light",
    description:
      "El Kit Star Light es nuestra propuesta más lujosa, llamativa y exclusiva para quienes quieren destacar visualmente dentro del servidor.",
    price: "3,500 🪙",
    duration: "Permanente",
    benefits: [
      "👑 Diseño exclusivo",
      "✨ Estética dorada",
      "🪽 Alas impresionantes",
      "💎 Aspecto premium",
      "🔥 Un look que no encontrarás en una armadura convencional",
      "✨ Una apariencia exclusiva",
      "⚔ Tus propios encantamientos",
      "🪽 Alas espectaculares",
    ],
  },
  "pico-3x3": {
    image: "images/pico-3x3-icon.png",
    name: "Pico 3x3",
    description:
      "Con el PICO 3×3 podrás romper 9 bloques de una sola vez, haciendo que tus sesiones de minería sean mucho más rápidas, cómodas y eficientes.",
    price: "3,200 🪙",
    duration: "Permanente",
    benefits: [
      "⛏ Área de excavación 3×3",
      "⚡ Rompe hasta 9 bloques simultáneamente",
      "🌍 Úsalo en la Mina, Survival o Mapamundi",
      "🔥 Una herramienta ideal para acelerar tu progreso",
      "⛏ 3×3 por golpe",
      "⚡ Más bloques en menos tiempo",
      "🌍 Múltiples zonas de uso",
      "📖 Compatible con Irrompibilidad custom",
    ],
  },
  "proteccion-diamante-128": {
    image: "images/proteccion-128-icon.png",
    name: "Protección Diamante 128x128",
    description:
      "¿Tienes una casa, una base o un terreno enorme que quieres mantener completamente protegido?",
    price: "2,400 🪙",
    duration: "Permanente",
    benefits: [
      "🏠 Protección de 128×128 bloques",
      "🛡 Protege tus construcciones y propiedades",
      "🔒 Evita que otros jugadores dañen tu zona protegida",
      "👥 Ideal para compartir un área segura con tus amigos",
      "🌍 Perfecta para bases grandes, ciudades, proyectos y zonas comunitarias",
      "🏡 Una gran base",
      "🏰 Un castillo",
      "🌳 Una zona de supervivencia",
    ],
  },
  "proteccion-esmeralda-512": {
    image: "images/proteccion-512-icon.png",
    name: "Protección Esmeralda 512x512",
    description:
      "La Protección Esmeralda 512×512 está diseñada para quienes necesitan un territorio gigantesco donde construir, expandirse y compartir sus proyectos con amigos.",
    price: "7,000 🪙",
    duration: "Permanente",
    benefits: [
      "💚 512×512 bloques de protección",
      "🛡 Protege tus construcciones y propiedades",
      "🔒 Mantén tu territorio protegido frente a otros jugadores",
      "👥 Ideal para compartir una gran zona con tus amigos",
      "🏰 Perfecta para mega bases, ciudades y proyectos de gran escala",
      "💎 Diamante: 128×128",
      "🔥 Netherita: 256×256",
      "💚 Esmeralda: 512×512",
    ],
  },
  "proteccion-netherita-256": {
    image: "images/proteccion-256-icon.png",
    name: "Protección Netherita 256x256",
    description:
      "¿Tu base está creciendo? ¿Tienes un proyecto enorme o quieres crear una zona completa para ti y tus amigos?",
    price: "5,000 🪙",
    duration: "Permanente",
    benefits: [
      "💎 256×256 bloques de protección",
      "🛡 Protege tus construcciones y propiedades",
      "🔒 Mantén tu zona protegida frente a otros jugadores",
      "👥 Perfecta para jugar y construir con tus amigos",
      "🏰 Ideal para grandes bases, ciudades y proyectos ambiciosos",
      "🏰 Mega bases",
      "🏙 Ciudades y comunidades",
      "🌳 Grandes zonas de supervivencia",
    ],
  },
  "schematic-pegado": {
    image: "images/schematic-pegado-icon.png",
    name: "Pegado de Schematic",
    description:
      "¿Encontraste una construcción increíble pero no quieres pasar horas colocándola bloque por bloque?",
    price: "5,000 🪙",
    duration: "Entrega unica",
    benefits: [
      "🏗 Schematic de hasta 40×40",
      "🎨 Tú eliges la construcción",
      "⚡ Ahorra horas de construcción",
      "🌎 Disponible en Survival",
      "🗺 Disponible en MapaMundi",
      "👷 Colocación realizada por un miembro autorizado del Staff",
    ],
  },
  "spawner-arana": {
    image: "images/spawner-arana-icon.png",
    name: "Spawner de Araña",
    description:
      "¿Quieres tener una fuente de arañas cerca de tu base y aprovechar sus recursos sin tener que recorrer el mundo en busca de mobs?",
    price: "1,380 🪙",
    duration: "Permanente",
    benefits: [
      "🕷 Generación de arañas",
      "🧵 Ideal para obtener hilo",
      "👁 Posibilidad de conseguir ojos de araña",
      "⚙ Perfecto para construir granjas de mobs",
      "🏠 Colócalo cerca de tu zona de trabajo",
    ],
  },
  "spawner-cerdo": {
    image: "images/spawner-cerdo-icon.png",
    name: "Spawner de Cerdo",
    description:
      "Con el Spawner de Cerdo podrás generar cerdos en tu propia zona y crear una granja cerca de tu base, teniendo tus recursos siempre a mano.",
    price: "600 🪙",
    duration: "Permanente",
    benefits: [
      "🐷 Generación de cerdos",
      "🍖 Fuente de alimento para tu Survival",
      "🏠 Ideal para colocar cerca de tu base",
      "🌾 Perfecto para crear tu propia granja",
      "⚡ Ahorra tiempo buscando animales",
      "🍖 Carne de cerdo",
      "🐷 Generación constante de animales",
      "📦 Recursos para tu supervivencia",
    ],
  },
  "spawner-pollo": {
    image: "images/spawner-pollo-icon.png",
    name: "Spawner de Pollo",
    description:
      "¿Cansado de recorrer el mundo buscando animales cada vez que necesitas comida o materiales?",
    price: "600 🪙",
    duration: "Permanente",
    benefits: [
      "🐔 Generación de pollos",
      "🍗 Ideal para crear una granja de alimentos",
      "🪶 Obtén plumas y otros recursos",
      "🏠 Perfecto para colocar cerca de tu base",
      "⚡ Ahorra tiempo buscando animales",
      "🍗 Alimento",
      "🪶 Plumas",
      "🐔 Animales para tu granja",
    ],
  },
  "spawner-vaca": {
    image: "images/spawner-vaca-icon.png",
    name: "Spawner de Vaca",
    description:
      "Con el Spawner de Vaca podrás colocar un spawner que generará vacas dentro de tu zona, permitiéndote crear y gestionar tu propia granja.",
    price: "600 🪙",
    duration: "Permanente",
    benefits: [
      "🥩 Generación de vacas",
      "🏠 Ideal para tu base o granja",
      "🌾 Crea tu propia zona de producción",
      "⚡ Ahorra tiempo buscando animales por el mundo",
      "💎 Perfecto para jugadores de Survival",
      "🍖 Alimento",
      "🟫 Cuero",
      "📚 Materiales para tus proyectos",
    ],
  },
  "tag-personalizado": {
    image: "images/tag-personalizado-icon.png",
    name: "Tag Personalizado",
    description:
      "Con el Tag Personalizado podrás elegir una etiqueta exclusiva para acompañar tu nombre y darle a tu perfil una identidad completamente única dentro de NOVAPIXEL.",
    price: "300 🪙",
    duration: "Permanente",
    benefits: [
      "🏷 Elige entre una gran variedad de Tags disponibles",
      "✨ Haz que tu nombre destaque",
      "💬 Visible en tus mensajes del chat",
      "📋 Visible en el TAB",
      "📊 Visible en el Scoreboard",
      "👑 Dale personalidad a tu nombre",
      "⚔ Épico",
      "👑 Elegante",
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

// Aviso breve tipo "toast". En móvil el carrito es un panel cerrado, así
// que sin esto añadir un producto no daba ninguna señal visible.
let toastTimer = null
function showToast(message) {
  let toast = document.getElementById("novapixel-toast")
  if (!toast) {
    toast = document.createElement("div")
    toast.id = "novapixel-toast"
    toast.className = "novapixel-toast"
    toast.setAttribute("role", "status")
    toast.setAttribute("aria-live", "polite")
    document.body.appendChild(toast)
  }

  toast.innerHTML = `<i class="fas fa-circle-check"></i><span>${escapeHtml(message)}</span>`
  // Reiniciar la animación cuando ya había un toast en pantalla.
  toast.classList.remove("visible")
  void toast.offsetWidth
  toast.classList.add("visible")

  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2200)
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

  // Cuarta pantalla: Google ya dijo quién es, pero no sabe su nick de
  // Minecraft — y sin nick no hay dónde entregar las compras.
  const googleNickView = document.getElementById("auth-google-nick-view")
  const googleUsername = document.getElementById("google-username-input")
  const googleNick = document.getElementById("google-nick-input")
  const googleAvatar = document.getElementById("google-nick-avatar")
  const googleIntro = document.getElementById("google-nick-intro")
  const googleError = document.getElementById("google-nick-error")
  const googleSubmit = document.getElementById("google-nick-submit")

  wireNickAvatarPreview(registerNick, registerAvatar)
  if (googleNick && googleAvatar) wireNickAvatarPreview(googleNick, googleAvatar)

  function setError(el, message) {
    el.textContent = message
    el.classList.add("active")
  }

  function clearError(el) {
    el.textContent = ""
    el.classList.remove("active")
  }

  function ocultarGoogleNick() {
    if (googleNickView) googleNickView.style.display = "none"
  }

  function showLoginView() {
    loginView.style.display = ""
    registerView.style.display = "none"
    forgotView.style.display = "none"
    ocultarGoogleNick()
    clearError(loginError)
  }

  function showRegisterView() {
    loginView.style.display = "none"
    registerView.style.display = ""
    forgotView.style.display = "none"
    ocultarGoogleNick()
    clearError(registerError)
  }

  function showForgotView() {
    loginView.style.display = "none"
    registerView.style.display = "none"
    forgotView.style.display = ""
    ocultarGoogleNick()
    forgotEmail.value = ""
    clearError(forgotError)
    forgotSuccess.classList.remove("active")
  }

  // Se abre al volver de Google cuando el correo todavía no tenía cuenta.
  // Los datos vienen del backend, que los guardó en la sesión al validar el
  // código: aquí no se toca nada que Google haya dicho.
  async function showGoogleNickView() {
    if (!googleNickView) return
    loginView.style.display = "none"
    registerView.style.display = "none"
    forgotView.style.display = "none"
    googleNickView.style.display = ""
    clearError(googleError)
    modal.classList.add("active")

    try {
      const res = await apiFetch("/api/auth/google/pending")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Tu sesión de Google caducó.")
      googleIntro.textContent = `Entraste con ${data.email}. Solo falta elegir tu usuario y decirnos tu nick de Minecraft.`
      if (!googleUsername.value) googleUsername.value = data.suggestedUsername || ""
      setTimeout(() => googleNick.focus(), 50)
    } catch (err) {
      setError(googleError, err.message)
    }
  }

  function open() {
    showLoginView()
    loginUsername.value = ""
    loginPassword.value = ""
    modal.classList.add("active")
    revelarGoogleSiProcede()
    setTimeout(() => loginUsername.focus(), 50)
  }

  function close() {
    modal.classList.remove("active")
  }

  closeBtn.addEventListener("click", close)
  // El clic en el fondo NO cierra: se perdía el formulario a medio llenar
  // por rozar fuera de la tarjeta. Se sale con la X o con Escape.
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
      if (onAuthSuccess) onAuthSuccess("login")
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
      if (onAuthSuccess) onAuthSuccess("register")
    } catch (err) {
      setError(registerError, err.message)
    } finally {
      registerSubmit.disabled = false
    }
  })

  // El botón de Google saca al navegador del sitio (no es un fetch): va a
  // /google/start, que redirige a Google, y Google devuelve a la tienda con
  // un ?google=... que se lee al cargar la página.
  modal.querySelectorAll("[data-google-signin]").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.disabled = true
      window.location.href = `${NOVAPIXEL_API_BASE}/api/auth/google/start`
    })
  })

  // Los botones vienen ocultos del HTML: un botón que falla al pulsarlo es
  // peor que no tenerlo, y sin credenciales en el .env el flujo no puede
  // funcionar. Se pregunta una sola vez, la primera que se abre el modal.
  let googleComprobado = false
  async function revelarGoogleSiProcede() {
    if (googleComprobado) return
    googleComprobado = true
    try {
      const res = await apiFetch("/api/auth/google/available")
      const data = await res.json()
      if (!res.ok || !data.available) return
      modal
        .querySelectorAll("[data-google-signin], [data-google-divider]")
        .forEach((el) => el.removeAttribute("hidden"))
    } catch {
      // Si la API no responde, el formulario de siempre sigue ahí.
    }
  }

  if (googleSubmit) {
    googleSubmit.addEventListener("click", async () => {
      const username = googleUsername.value.trim()
      const minecraftNick = googleNick.value.trim()
      clearError(googleError)

      if (username.length < 3 || username.length > 20) {
        setError(googleError, "El usuario debe tener entre 3 y 20 caracteres.")
        return
      }
      if (!minecraftNick) {
        setError(googleError, "Escribe tu nick de Minecraft.")
        return
      }

      googleSubmit.disabled = true
      try {
        const res = await apiFetch("/api/auth/google/complete", {
          method: "POST",
          body: JSON.stringify({ username, minecraftNick }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "No se pudo crear la cuenta.")
        close()
        await NovaPixelAuth.refresh()
        // Igual que en el registro normal: recién creada la cuenta el saldo
        // es 0, así que no se arrastra ninguna compra pendiente.
        if (typeof onAuthSuccess === "function") onAuthSuccess("register")
      } catch (err) {
        setError(googleError, err.message)
      } finally {
        googleSubmit.disabled = false
      }
    })
  }

  return { open, close, showGoogleNickView }
}

// Añade un ojo para ver/ocultar a cada campo de contraseña. Se hace desde
// aquí y no en el HTML porque el formulario está copiado en cuatro páginas.
// Engancha por la clase del campo y no por el modal que lo contiene: así
// entra también reset-password.html, que no usa .checkout-modal.
function setupPasswordToggles() {
  document.querySelectorAll('input.checkout-modal-input[type="password"]').forEach((input) => {
    if (input.dataset.toggleReady) return
    input.dataset.toggleReady = "1"

    const field = document.createElement("div")
    field.className = "password-field"
    input.parentNode.insertBefore(field, input)
    field.appendChild(input)

    const btn = document.createElement("button")
    btn.type = "button"
    btn.className = "password-toggle"
    btn.innerHTML = '<i class="fas fa-eye" aria-hidden="true"></i>'
    btn.setAttribute("aria-label", "Mostrar contraseña")
    btn.setAttribute("aria-pressed", "false")
    field.appendChild(btn)

    btn.addEventListener("click", () => {
      const visible = input.type === "text"
      input.type = visible ? "password" : "text"
      btn.innerHTML = `<i class="fas fa-eye${visible ? "" : "-slash"}" aria-hidden="true"></i>`
      btn.setAttribute("aria-label", visible ? "Mostrar contraseña" : "Ocultar contraseña")
      btn.setAttribute("aria-pressed", String(!visible))
      input.focus()
    })
  })
}

document.addEventListener("DOMContentLoaded", () => {
  NovaPixelAuth.refresh()
  setupPasswordToggles()

  let pendingGilcoinPurchase = null
  let pendingCartCheckout = false
  const authModal = setupAuthModal((mode) => {
    // Recién creada la cuenta el saldo es 0, así que la acción pendiente
    // sería un pago que se lleva al jugador fuera de la tienda justo al
    // registrarse. Se descarta y se queda donde estaba.
    if (mode === "register") {
      pendingGilcoinPurchase = null
      pendingCartCheckout = false
      return
    }
    if (pendingGilcoinPurchase) {
      const { packageId, provider } = pendingGilcoinPurchase
      pendingGilcoinPurchase = null
      startGilcoinCheckout(packageId, provider)
    } else if (pendingCartCheckout) {
      pendingCartCheckout = false
      if (cartApi) cartApi.checkout()
    }
  })

  // Vuelta de Google. El backend no puede responder JSON aquí (es una
  // navegación del navegador, no un fetch), así que manda el resultado en
  // el query string. Se limpia de la URL en cuanto se lee, para que
  // recargar la página no repita el mensaje ni reabra el formulario.
  if (authModal) {
    const params = new URLSearchParams(window.location.search)
    const resultadoGoogle = params.get("google")
    if (resultadoGoogle) {
      params.delete("google")
      const resto = params.toString()
      window.history.replaceState(
        {},
        "",
        window.location.pathname + (resto ? `?${resto}` : "") + window.location.hash
      )

      if (resultadoGoogle === "falta-nick") {
        authModal.showGoogleNickView()
      } else if (resultadoGoogle === "ok") {
        NovaPixelAuth.refresh()
      } else if (resultadoGoogle === "error") {
        authModal.open()
        const loginError = document.getElementById("login-error")
        if (loginError) {
          loginError.textContent = "No pudimos completar el acceso con Google. Inténtalo de nuevo."
          loginError.classList.add("active")
        }
      }
      // "cancelado" no dice nada: la persona pulsó Cancelar en Google y ya
      // sabe lo que hizo.
    }
  }

  // Botones de paquetes de GGcoins: piden login si hace falta y luego
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
    const descriptionEl = document.getElementById("product-detail-description")
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
      // Los productos que todavía no tienen descripción escrita no dejan un
      // párrafo vacío abriendo hueco sobre la lista de beneficios.
      if (descriptionEl) {
        descriptionEl.textContent = detail.description || ""
        descriptionEl.style.display = detail.description ? "" : "none"
      }
      priceEl.textContent = detail.price
      durationEl.textContent = detail.duration
      benefitsEl.innerHTML = detail.benefits.map((b) => `<li>${escapeHtml(b)}</li>`).join("")

      const affordable = isAffordable(productId)
      buyBtn.classList.toggle("needs-recharge", !affordable)
      buyBtn.textContent = affordable ? "Añadir al carrito" : "Recargar GGcoins"

      modalEl.classList.add("active")
    }

    function close() {
      modalEl.classList.remove("active")
      currentProductId = null
    }

    // Las tarjetas del catálogo no traen el disparador escrito en el HTML:
    // se marca aquí a partir del id que ya lleva su botón de compra, para no
    // repetir el mismo atributo en las 33 tarjetas y que no se desincronice
    // al añadir productos. Solo se marcan las que tienen ficha escrita.
    document.querySelectorAll(".price-card").forEach((card) => {
      const productId = card.querySelector("[data-product]")?.dataset.product
      const icon = card.querySelector(".price-icon")
      if (!productId || !icon || !PRODUCT_DETAILS[productId]) return
      if (icon.dataset.detail) return
      icon.classList.add("product-detail-trigger")
      icon.dataset.detail = productId
      icon.setAttribute("role", "button")
      icon.setAttribute("tabindex", "0")
      icon.setAttribute("aria-label", `Ver detalle de ${PRODUCT_DETAILS[productId].name}`)
    })

    // El detalle se abre al tocar la imagen del producto (no hay botón
    // "Ver beneficios"); tabindex/Enter lo mantienen accesible por teclado.
    document.querySelectorAll(".product-detail-trigger[data-detail]").forEach((trigger) => {
      trigger.addEventListener("click", () => open(trigger.dataset.detail))
      trigger.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          open(trigger.dataset.detail)
        }
      })
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

  // Modal "Recargar GGcoins": los paquetes ya no viven en una pestaña
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
  // GGcoins de la cuenta no alcanza para ESE ítem en particular. Sin
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
          btn.title = affordable ? "" : "Te faltan GGcoins — clic para recargar"
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
        balanceEl.textContent = "Inicia sesión para pagar con tus GGcoins."
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
      showToast(`${STORE_PRODUCT_NAMES[productId] || "Producto"} añadido al carrito`)
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
// Página "Confirmando pago" (retorno de PayPal al comprar GGcoins)
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
    const href = this.getAttribute("href")

    // Actualizar el hash es lo que dispara los handlers de "hashchange"
    // (modo VIP, pestañas de categoría), que son los que revelan secciones
    // ocultas. Antes el preventDefault dejaba el hash intacto y esos
    // handlers nunca corrían: el link "VIP" no hacía nada. Se usa
    // pushState + evento manual para no dar el salto brusco del navegador.
    if (window.location.hash !== href) {
      history.pushState(null, "", href)
    }
    window.dispatchEvent(new HashChangeEvent("hashchange"))

    // Solo se hace scroll si el destino ya es visible; si estaba oculto, el
    // handler correspondiente lo muestra y hace scroll él mismo.
    const target = document.querySelector(href)
    if (target && getComputedStyle(target).display !== "none") {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  })
})

// Copy IP function
function copyIP() {
  const ip = "play.novapixelmc.com"
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
  const ip = "play.novapixelmc.com  Puerto: 33334"
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

  // Los links "VIP" del navbar y del footer apuntan a
  // tienda.html#cat-donador-vip: sin esto, el ancla llegaba a un elemento
  // display:none y no pasaba nada visible. Se escucha también
  // "hashchange" porque estando ya en tienda.html el link solo cambia el
  // hash (mismo path) y no recarga la página.
  function syncVipFromHash(smooth) {
    if (window.location.hash === "#cat-donador-vip") {
      document.body.classList.add("vip-exclusive-mode")
      vipSection.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" })
    } else if (window.location.hash === "#tienda") {
      // El link "Tienda" del navbar sale del modo VIP.
      document.body.classList.remove("vip-exclusive-mode")
    }
  }

  syncVipFromHash(false)
  window.addEventListener("hashchange", () => syncVipFromHash(true))
})

// Menú horizontal de categorías de la tienda. "Todos" (data-target="all")
// muestra todas las categorías a la vez; el resto de pestañas muestra solo
// la suya. Único catálogo — ya no hay página de inicio previa ni sidebar.
document.addEventListener("DOMContentLoaded", () => {
  // El botón "Recargar GGcoins" vive al final del menú (misma pinta que
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

// Buscador del catálogo. Busca en el nombre, en el título de la categoría y en
// la descripción que enseña la ficha de detalle, así que "spawner" encuentra
// también los paquetes que incluyen uno. Mientras hay texto escrito manda
// sobre las pestañas: se ven todas las secciones y se ocultan las fichas que
// no coinciden. Al vaciarlo, la pestaña que estuviera activa vuelve sola,
// porque nunca se le quita la clase .active a nadie.
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("store-search-input")
  const clearBtn = document.getElementById("store-search-clear")
  const status = document.getElementById("store-search-status")
  const items = document.querySelector(".store-items")
  if (!input || !items || !clearBtn || !status) return

  // Sin acentos y en minúsculas, para que "protección" y "proteccion"
  // encuentren lo mismo — media tienda se escribe con tilde.
  const normaliza = (texto) =>
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")

  const categorias = Array.from(items.querySelectorAll(".store-category"))

  // El índice se construye una sola vez al cargar: cada ficha con todo su
  // texto buscable ya normalizado, para no recorrer el DOM en cada tecla.
  const fichas = []
  categorias.forEach((categoria) => {
    const titulo = categoria.querySelector(".store-category-title")?.textContent ?? ""
    categoria.querySelectorAll(".price-card, .rank-card, .deluxe-card").forEach((card) => {
      const nombre = card.querySelector(".price-name, .rank-name, .deluxe-name")?.textContent ?? ""
      const productId = card.querySelector("[data-product]")?.dataset.product ?? ""
      const detalle = PRODUCT_DETAILS[productId]
      const texto = [
        nombre,
        titulo,
        productId.replace(/-/g, " "),
        detalle?.description ?? "",
        (detalle?.benefits ?? []).join(" "),
      ].join(" ")
      fichas.push({ card, categoria, texto: normaliza(texto) })
    })
  })

  function aplicar(consulta) {
    const limpia = consulta.trim()
    const q = normaliza(limpia)
    clearBtn.hidden = limpia.length === 0

    if (q.length === 0) {
      items.classList.remove("searching")
      fichas.forEach(({ card }) => (card.hidden = false))
      categorias.forEach((categoria) => (categoria.hidden = false))
      status.hidden = true
      return
    }

    items.classList.add("searching")

    // Todas las palabras deben aparecer, en cualquier orden: así "rango
    // divino" encuentra el Divino aunque su nombre no lleve "rango".
    const palabras = q.split(/\s+/)
    let encontradas = 0

    fichas.forEach(({ card, texto }) => {
      const coincide = palabras.every((palabra) => texto.includes(palabra))
      card.hidden = !coincide
      if (coincide) encontradas += 1
    })

    categorias.forEach((categoria) => {
      const tieneAlgo = fichas.some((f) => f.categoria === categoria && !f.card.hidden)
      categoria.hidden = !tieneAlgo
    })

    status.hidden = false
    status.textContent =
      encontradas === 0
        ? `Nada coincide con «${limpia}». Prueba con otra palabra.`
        : `${encontradas} ${encontradas === 1 ? "producto" : "productos"} para «${limpia}».`
  }

  function vaciar() {
    input.value = ""
    aplicar("")
    input.focus()
  }

  input.addEventListener("input", () => aplicar(input.value))
  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") vaciar()
  })
  clearBtn.addEventListener("click", vaciar)

  // Elegir una categoría cancela la búsqueda: si no, la pestaña parecería no
  // hacer nada porque el buscador seguiría mandando sobre las secciones.
  document.querySelectorAll(".store-tab[data-target]").forEach((tab) => {
    tab.addEventListener("click", () => {
      if (input.value) {
        input.value = ""
        aplicar("")
      }
    })
  })
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
// navegación y el bloque de carrito+cuenta dentro de un panel desplegable
// único. Al volver a escritorio los regresa a su lugar original, así los
// mismos elementos (con sus listeners y el id #nav-account que usa
// NovaPixelAuth) siguen funcionando en ambos layouts.
function setupMobileMenu() {
  const navbar = document.querySelector(".navbar")
  if (!navbar) return

  const navContent = navbar.querySelector(".nav-content")
  const navLinks = navbar.querySelector(".nav-links")
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

    // Orden dentro del desplegable: Inicio/Eventos/Información y luego
    // carrito + iniciar sesión. Discord/TikTok se quedan fuera: viven en
    // .navbar-top, que está oculto en móvil, y siguen en el footer.
    if (navLinks && navLinks.parentElement !== dropdown) dropdown.appendChild(navLinks)
    if (navActions && navActions.parentElement !== dropdown) dropdown.appendChild(navActions)
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
