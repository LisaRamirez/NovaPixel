# NovaPixel — Tienda con entrega automática

Este repo tiene tres partes:

- **/** (raíz): el sitio web — `index.html` (portada), `tienda.html` (tienda, pestaña aparte), `tienda-vip.html` (niveles Donador VIP), `mis-compras.html` (historial), `reset-password.html` y `gilcoins-callback.html` (retorno de PayPal), compartiendo `script.js` y `styles.css`.
- **/server**: backend Node/Express con cuentas de usuario, la economía de Gilcoins, pagos con Stripe/PayPal y una base SQLite.
- **/plugin**: plugin de Paper/Spigot que entrega la compra en el juego cuando el jugador entra al server.

Flujo completo: el jugador crea una cuenta (usuario + contraseña) ligada a **un** nick de Minecraft → inicia sesión → compra **Gilcoins** (moneda virtual, 100 Gilcoins = $1 USD) con Stripe o PayPal → gasta esos Gilcoins al instante en productos de la tienda (sin pasar por una pasarela de pago de nuevo) → el plugin, al detectar al jugador conectado, consulta el backend y ejecuta los comandos de entrega. El jugador puede ver su saldo en el navbar y su historial de compras en `mis-compras.html`.

## 1. Requisitos de infraestructura

- Un lugar donde correr el backend de forma **persistente** (VPS propio, Railway, Render, Fly.io, o el mismo VPS donde está el servidor de Minecraft). Hosts gratuitos tipo Aternos **no sirven** para esto porque no permiten procesos externos ni instalar plugins con acceso a red arbitrario.
- Acceso para instalar plugins `.jar` en tu servidor de Minecraft (Paper/Spigot).
- Una cuenta de [Stripe](https://dashboard.stripe.com) (tiene modo de pruebas gratis).
- Una app de [PayPal Developer](https://developer.paypal.com/dashboard/applications) (el modo Sandbox da credenciales de prueba al instante).
- Java 21 y Maven instalados donde vayas a compilar el plugin (no en este equipo, aquí no había JDK disponible).

**Importante sobre dónde alojar el sitio y el backend**: la cookie de sesión usa `SameSite=Lax`, que solo viaja en peticiones `fetch` entre dominios que compartan el mismo "site" (mismo dominio raíz). Despliega el sitio y el backend como subdominios del mismo dominio (ej. `novapixel.host` para el sitio y `api.novapixel.host` para el backend) — **no** en dominios completamente distintos (ej. un frontend en Netlify y un backend en Railway con dominios propios de cada proveedor), porque ahí el navegador descartaría la cookie silenciosamente y el login parecería no funcionar.

## 2. Backend (`/server`)

```bash
cd server
npm install
cp .env.example .env
```

Edita `.env`:

- `STRIPE_SECRET_KEY`: la encuentras en el dashboard de Stripe (Developers → API keys).
- `STRIPE_WEBHOOK_SECRET`: se genera al crear el endpoint del webhook (Developers → Webhooks → Add endpoint → URL `https://tu-backend/webhook/stripe`, evento `checkout.session.completed`). Para probar en local usa `stripe listen --forward-to localhost:4000/webhook/stripe`.
- `PLUGIN_SHARED_SECRET`: un secreto largo y aleatorio (`openssl rand -hex 32`). Debe ser **idéntico** al `plugin-secret` de `plugin/src/main/resources/config.yml`.
- `SITE_URL`: la URL pública de tu web. La API solo acepta peticiones (con cookies) desde este origin — es la protección contra CSRF, así que debe coincidir exactamente con la URL real del sitio.
- `COOKIE_SECURE`: déjalo en `false` para probar en local por `http`. Ponlo en `true` en producción (el sitio debe servirse por `https` o el navegador descarta la cookie de sesión).
- `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET`: créalos en [developer.paypal.com/dashboard/applications](https://developer.paypal.com/dashboard/applications) (modo Sandbox para pruebas, sin costo).
- `PAYPAL_MODE`: `sandbox` para pruebas o `live` en producción.

Arrancar:

```bash
npm start
```

### Cuentas de usuario

El registro y login viven en `server/src/routes/auth.js`. Cada cuenta tiene usuario, contraseña (hash con `scrypt`, sin dependencias externas) y **un solo nick de Minecraft**, fijado al registrarse. La sesión se guarda en una cookie `httpOnly` que apunta a una fila en la tabla `sessions` (30 días de duración).

Comprar **requiere sesión iniciada**: `POST /api/store/checkout` (`server/src/routes/store.js`) descuenta Gilcoins del saldo de la cuenta autenticada — nunca recibe el nick del cliente, lo toma de `req.user.minecraftNick`, así nadie puede comprar a nombre de otro jugador. `GET /api/purchases/me` devuelve el historial de la cuenta logueada, usado por `mis-compras.html`.

Limitación conocida: el nick queda fijo al registrarse, no hay forma de cambiarlo desde la web todavía (habría que editarlo directo en la tabla `users` si un jugador se equivoca al escribirlo).

### Recuperar contraseña por correo

El registro ahora también pide un correo. "¿Olvidaste tu contraseña?" en el modal de login llama a `POST /api/auth/forgot-password`, que genera un token de un solo uso (expira en 1 hora, tabla `password_resets`) y envía un enlace a `reset-password.html?token=...` usando la API de [Resend](https://resend.com). Esa página llama a `POST /api/auth/reset-password` para guardar la contraseña nueva.

Configura en `.env`:
- `RESEND_API_KEY`: créala en [resend.com/api-keys](https://resend.com/api-keys) — empieza con `re_`.
- `RESEND_FROM_EMAIL`: mientras no verifiques tu propio dominio en Resend, puedes usar `NovaPixel <onboarding@resend.dev>` (funciona para probar, pero no se ve profesional para producción).

No hay verificación de que el correo ingresado al registrarse sea real (no se manda un correo de confirmación) — solo se usa para la recuperación.

### Economía de Gilcoins

Los productos de la tienda ya no se pagan directo con Stripe: se compran al instante gastando **Gilcoins**, una moneda virtual a tasa fija de **100 Gilcoins = $1 USD** (así que el `priceCents` de cada producto en `products.js` es numéricamente igual a su costo en Gilcoins, sin conversión).

- `server/src/gilcoinPackages.js`: los 4 paquetes que se compran con dinero real (Inicial $5, Aventurero $10 +10%, Campeón $20 +20%, Leyenda $50 +30% de bono). Se pagan con Stripe o PayPal desde la pestaña "Comprar Gilcoins" de `tienda.html`.
- `POST /api/gilcoins/checkout/stripe` y `POST /api/gilcoins/checkout/paypal`: crean el pago y una fila `pending` en `gilcoin_purchases`.
- Confirmación: el webhook de Stripe (`routes/webhook.js`) o `POST /api/gilcoins/paypal/capture` (llamado desde `gilcoins-callback.html`, la URL de retorno de PayPal) acreditan el saldo y quedan registrados en `gilcoin_transactions` (ledger de auditoría).
- `POST /api/store/checkout`: recibe el carrito completo (`{ items: [{ productId, quantity }] }`), valida cada línea contra `products.js`, calcula el total y gasta los Gilcoins de una sola vez de forma atómica (`UPDATE ... WHERE gilcoin_balance >= ?`, no hay condición de carrera posible). Si el saldo alcanza, inserta una fila `purchases` por cada unidad comprada, todo dentro de una misma transacción SQLite (`createPaidPurchasesBatch` en `db.js`) — no pasa por ninguna pasarela de pago.

### Carrito de compra

La tienda (`tienda.html`) funciona como un carrito: cada botón "Añadir" agrega el producto a un carrito persistido en `localStorage` (columna derecha, visible mientras se navega entre categorías) en vez de comprarlo al instante. Desde el carrito se puede subir/bajar cantidad, quitar líneas o vaciarlo, y el botón "Finalizar compra" manda todo junto a `POST /api/store/checkout`. Si el usuario no inició sesión, agregar al carrito funciona igual (es solo estado local), pero al intentar pagar se le pide iniciar sesión y luego se reintenta el checkout automáticamente.

### Donador VIP

Los 4 niveles de Donador (LV10 @ $50, LV14 @ $90, LV18 @ $150, LV22 @ $250, definidos como productos normales en `server/src/products.js` con ids `donador-vip-lv*`) viven dentro de la misma tienda, en la pestaña "Donador VIP", y se agregan al carrito igual que cualquier otro producto — no hay desbloqueo automático por gasto acumulado ni página aparte. Los grupos de LuckPerms que otorgan (`donador_lv10`, etc.) vienen de una referencia dada en el juego — ajusta los comandos en `products.js` si tus grupos se llaman distinto.

### Catálogo de productos

`server/src/products.js` define cada producto de la tienda: precio y los comandos de consola que se ejecutan al entregarlo (usa `%player%` como marcador del nick).

- Los **rangos** ya vienen con comandos de [LuckPerms](https://luckperms.net/) asumiendo grupos `angelical`, `celestial`, `divino`, `donador` — ajusta los nombres si los tuyos son distintos.
- **Protecciones, kits y cosméticos** dependen 100% de los plugins que uses (WorldGuard, Essentials, un plugin de cosméticos propio, etc.), así que se dejaron con `commands: []` y `manual: true`: el plugin de Minecraft avisará a los admins conectados (permiso `novapixel.store.notify`) para que la entreguen a mano, en vez de ejecutar un comando adivinado que podría estar mal. Reemplaza esos comandos por los reales de tu servidor antes de salir a producción.

## 3. Plugin de Minecraft (`/plugin`)

Compilar (requiere JDK 21 + Maven):

```bash
cd plugin
mvn package
```

El `.jar` queda en `plugin/target/novapixel-store.jar`. Cópialo a la carpeta `plugins/` de tu servidor Paper/Spigot.

Al iniciar el server por primera vez se genera `plugins/NovaPixelStore/config.yml`. Edítalo:

```yaml
api-base-url: "https://tu-backend"
plugin-secret: "el-mismo-secreto-que-PLUGIN_SHARED_SECRET-en-.env"
```

Luego `/novapixelstore reload` en consola, o reinicia el server.

Comandos:
- `/novapixelstore check <jugador>` — fuerza la revisión de compras pendientes de un jugador conectado.
- `/novapixelstore reload` — recarga `config.yml`.

## 4. Soporte Bedrock (Geyser + Floodgate)

Para que un solo servidor Java atienda jugadores de Java y Bedrock:

1. Instala [Geyser](https://geysermc.org/download) y [Floodgate](https://geysermc.org/download#floodgate) en tu servidor Paper.
2. En `plugins/floodgate/config.yml`, pon el prefijo de usuario vacío:
   ```yaml
   username-prefix: ""
   ```
   Por defecto Floodgate antepone un `.` al nombre de los jugadores de Bedrock no vinculados (ej. `.Steve123`). Si dejas el prefijo por defecto, el nick que el jugador escriba en la web (`Steve123`) no coincidirá con el nombre real dentro del juego (`.Steve123`) y la compra nunca se entregará. Con el prefijo vacío coinciden exactamente.
3. Si tus jugadores de Bedrock **vinculan** su cuenta a una cuenta Java (`/linkaccount`), Floodgate usa el nombre Java vinculado en vez del gamertag — en ese caso deben comprar usando su nick de Java.

## 5. Vista previa del skin en la web

El modal de compra muestra la cabeza del skin junto al campo del nick usando [mc-heads.net](https://mc-heads.net) (servicio público no oficial, gratuito). Funciona bien con nicks de Java. Para gamertags de Bedrock no vinculados no existe una API pública de skins de Bedrock, así que se mostrará un skin genérico (Steve/Alex) — es solo estético, no afecta la entrega de la compra.

## 6. Limitaciones conocidas / próximos pasos

- Si el backend no puede conectarse a internet al momento de confirmar la entrega (`markDelivered`), la compra queda como `paid` y se reintentará en la siguiente conexión o revisión periódica del jugador — para rangos con `addtemp ... accumulate` esto solo suma más duración, no rompe nada.
- Cambia `NOVAPIXEL_API_BASE` en `script.js` (línea ~7) por la URL real de tu backend antes de publicar el sitio — ahora mismo apunta a `http://localhost:4000`.
- Completa los comandos de entrega marcados como `manual: true` en `server/src/products.js` en cuanto definas qué plugins vas a usar para kits/protecciones/cosméticos/spawners.
- No hay cambio de nick post-registro — si lo necesitas, es el siguiente candidato a construir.
- Los umbrales de la Tienda VIP están en USD gastado en Gilcoins; si algún día agregas otro método de pago que no pase por `gilcoin_purchases`, ese gasto no contaría para los niveles VIP a menos que también llames a `grantEligibleVipTiers()`.
- La curva de bono de los paquetes de Gilcoins (+10%/+20%/+30%) es más generosa que la de referencias como League of Legends a precios equivalentes — si te interesa optimizar ingresos, considera bajarla (ver conversación del proyecto para una curva alternativa sugerida).
