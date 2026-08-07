// Paquetes de Gilcoins que se compran con dinero real (Stripe o PayPal).
// Tasa fija: 100 Gilcoins = $1 USD. Los precios del catálogo de productos
// (server/src/products.js) usan la misma tasa, así que su `priceCents` ya
// es directamente el costo en Gilcoins — no hace falta convertir nada ahí.
//
// Los 8 montos de Gilcoins replican los totales de RP de una tienda de
// referencia (League of Legends). `compareAtPriceCents` es un precio
// "regular" ficticio (no es un precio real anterior, es solo para mostrar
// tachado como oferta de apertura ~15% off) — priceCents es lo único que
// realmente se cobra. Nunca se le dan más Gilcoins al jugador por el
// descuento, solo se le cobra menos: el descuento vive en el precio, no en
// la cantidad de monedas.

const GILCOIN_PACKAGES = {
  "pack-575": { name: "575 Gilcoins", gilcoins: 575, priceCents: 575, compareAtPriceCents: 675 },
  "pack-1380": { name: "1,380 Gilcoins", gilcoins: 1380, priceCents: 1380, compareAtPriceCents: 1625 },
  "pack-2800": { name: "2,800 Gilcoins", gilcoins: 2800, priceCents: 2800, compareAtPriceCents: 3300 },
  "pack-4500": { name: "4,500 Gilcoins", gilcoins: 4500, priceCents: 4500, compareAtPriceCents: 5300 },
  "pack-6500": { name: "6,500 Gilcoins", gilcoins: 6500, priceCents: 6500, compareAtPriceCents: 7650 },
  "pack-13500": { name: "13,500 Gilcoins", gilcoins: 13500, priceCents: 13500, compareAtPriceCents: 15900 },
  "pack-33500": { name: "33,500 Gilcoins", gilcoins: 33500, priceCents: 33500, compareAtPriceCents: 39400 },
  "pack-60200": { name: "60,200 Gilcoins", gilcoins: 60200, priceCents: 60200, compareAtPriceCents: 70800 },
}

// Ver el mismo tratamiento en products.js: evita que packageId="__proto__"
// (u otras claves heredadas) devuelva un objeto verdadero en vez de undefined.
Object.setPrototypeOf(GILCOIN_PACKAGES, null)

module.exports = { GILCOIN_PACKAGES }
