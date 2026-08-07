// Catálogo de productos de la tienda de NovaPixel.
//
// `commands` son los comandos de consola que el plugin ejecuta al entregar
// la compra. Usa %player% como marcador de posición para el nick.
//
// Los rangos asumen que usas LuckPerms con grupos llamados "angelical",
// "celestial", "divino" y "donador" — ajusta los nombres de grupo si los
// tuyos son distintos.
//
// Las protecciones, kits y cosméticos dependen totalmente de los plugins
// que uses en tu servidor (WorldGuard, Essentials, un plugin de kits/cosméticos
// propio, etc). Se dejan con `commands: []` y `manual: true` como marcador:
// el plugin igual registrará la compra como pagada y avisará a un admin en
// vez de inventar un comando que podría estar mal. Reemplázalos por los
// comandos reales de tu servidor antes de usar la tienda en producción.

const RANK_GROUPS = {
  angelical: "angelical",
  celestial: "celestial",
  divino: "divino",
  donador: "donador",
}

function rankCommands(group, duration) {
  return duration === "indefinido"
    ? [`lp user %player% parent add ${group}`]
    : [`lp user %player% parent addtemp ${group} 30d accumulate`]
}

const PRODUCTS = {
  // --- Rangos 30 días ---
  "rango-angelical-30": { name: "Rango Angelical · 30 días", priceCents: 400, commands: rankCommands(RANK_GROUPS.angelical, "30d") },
  "rango-celestial-30": { name: "Rango Celestial · 30 días", priceCents: 900, commands: rankCommands(RANK_GROUPS.celestial, "30d") },
  "rango-divino-30": { name: "Rango Divino · 30 días", priceCents: 1600, commands: rankCommands(RANK_GROUPS.divino, "30d") },
  "rango-donador-30": { name: "Rango Donador · 30 días", priceCents: 5000, commands: rankCommands(RANK_GROUPS.donador, "30d") },

  // --- Rangos indefinido ---
  "rango-angelical-indef": { name: "Rango Angelical · Indefinido", priceCents: 1500, commands: rankCommands(RANK_GROUPS.angelical, "indefinido") },
  "rango-celestial-indef": { name: "Rango Celestial · Indefinido", priceCents: 2100, commands: rankCommands(RANK_GROUPS.celestial, "indefinido") },
  "rango-divino-indef": { name: "Rango Divino · Indefinido", priceCents: 3800, commands: rankCommands(RANK_GROUPS.divino, "indefinido") },
  "rango-donador-indef": { name: "Rango Donador · Indefinido", priceCents: 15000, commands: rankCommands(RANK_GROUPS.donador, "indefinido") },

  // --- Protecciones y herramientas (ajusta a tus plugins) ---
  "pico-3x3": { name: "Pico 3x3", priceCents: 1500, commands: [], manual: true },
  "proteccion-diamante-128": { name: "Protección Diamante 128x128", priceCents: 800, commands: [], manual: true },
  "proteccion-netherita-256": { name: "Protección Netherita 256x256", priceCents: 2100, commands: [], manual: true },
  "proteccion-esmeralda-512": { name: "Protección Esmeralda 512x512", priceCents: 4500, commands: [], manual: true },

  // --- Kits (ajusta al plugin de kits que uses, ej. Essentials: "kit alas") ---
  "kit-alas": { name: "Kit de Alas", priceCents: 3500, commands: [], manual: true },
  "kit-samurai": { name: "Kit Samurai", priceCents: 3200, commands: [], manual: true },
  "kit-angelical": { name: "Kit Angelical", priceCents: 2000, commands: [], manual: true },
  "kit-bahamut": { name: "Kit Bahamut", priceCents: 1700, commands: [], manual: true },
  "kit-asura": { name: "Kit Asura", priceCents: 1700, commands: [], manual: true },
  "kit-sakura": { name: "Kit Sakura", priceCents: 1500, commands: [], manual: true },

  // --- Cosméticos (ajusta a tu plugin de cosméticos) ---
  "brillo-azul": { name: "Brillo Azul", priceCents: 500, commands: [], manual: true },
  "brillo-agua": { name: "Brillo Agua", priceCents: 500, commands: [], manual: true },
  "brillo-fuego": { name: "Brillo Fuego", priceCents: 500, commands: [], manual: true },
  "brillo-rosado": { name: "Brillo Rosado", priceCents: 500, commands: [], manual: true },
  "brillo-negro": { name: "Brillo Negro", priceCents: 500, commands: [], manual: true },
  "tag-personalizado": { name: "Tag Personalizado", priceCents: 300, commands: [], manual: true },

  // --- Experiencia y economía (comando /xp es vanilla; /eco asume EssentialsX) ---
  "exp-100": { name: "Experiencia 100 Niveles", priceCents: 400, commands: ["xp add %player% 100 levels"] },
  "exp-250": { name: "Experiencia 250 Niveles", priceCents: 900, commands: ["xp add %player% 250 levels"] },
  "economia-50k": { name: "50,000 de Economía", priceCents: 900, commands: ["eco give %player% 50000"] },
  "economia-100k": { name: "100,000 de Economía", priceCents: 1500, commands: ["eco give %player% 100000"] },

  // --- Comandos y vuelo (asume permisos de EssentialsX gestionados por LuckPerms) ---
  "fly-indefinido": { name: "Fly Indefinido", priceCents: 1500, commands: ["lp user %player% permission set essentials.fly true"] },
  "fly-30": { name: "Fly 30 días", priceCents: 800, commands: ["lp user %player% permission settemp essentials.fly true 30d"] },
  "comandos-pack": {
    name: "Pack Comandos (/hat /ec /craft)",
    priceCents: 400,
    commands: [
      "lp user %player% permission set essentials.hat true",
      "lp user %player% permission set essentials.enderchest true",
      "lp user %player% permission set essentials.craft true",
    ],
  },

  // --- Spawners y construcción (dependen del plugin de spawners que uses y de revisión manual del terreno) ---
  "spawner-vaca": { name: "Spawner de Vaca", priceCents: 300, commands: [], manual: true },
  "spawner-pollo": { name: "Spawner de Pollo", priceCents: 300, commands: [], manual: true },
  "spawner-cerdo": { name: "Spawner de Cerdo", priceCents: 300, commands: [], manual: true },
  "spawner-arana": { name: "Spawner de Araña", priceCents: 500, commands: [], manual: true },
  "schematic-pegado": { name: "Pegado de Schematic", priceCents: 1200, commands: [], manual: true },

  // --- Donador VIP (compra directa, de una sola vez — asume grupos de LuckPerms donador_lvXX) ---
  "donador-vip-lv10": { name: "Donador VIP LV10", priceCents: 5000, commands: ["lp user %player% parent add donador_lv10"] },
  "donador-vip-lv14": { name: "Donador VIP LV14", priceCents: 9000, commands: ["lp user %player% parent add donador_lv14"] },
  "donador-vip-lv18": { name: "Donador VIP LV18", priceCents: 15000, commands: ["lp user %player% parent add donador_lv18"] },
  "donador-vip-lv22": { name: "Donador VIP LV22", priceCents: 25000, commands: ["lp user %player% parent add donador_lv22"] },
}

// Sin prototipo: evita que un productId como "__proto__" o "constructor"
// devuelva un objeto heredado (verdadero) en vez de undefined al hacer
// PRODUCTS[productId], que colaría el chequeo `if (!product)`.
Object.setPrototypeOf(PRODUCTS, null)

module.exports = { PRODUCTS }
