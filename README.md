# NovaPixel — Tienda con entrega automática

Este repo tiene cuatro partes:

- **/site**: el sitio web estático — `index.html` (portada), `tienda.html` (tienda), `informacion.html` (info de productos), `mis-compras.html` (historial), `reset-password.html` y `gilcoins-callback.html` (retorno de PayPal), compartiendo `script.js` y `styles.css`. **Es lo único que se sube al hosting del sitio (ej. v2networks)** — no necesita build, son archivos estáticos.
- **/django_backend**: backend Django con cuentas de usuario, la economía de GGcoins, pagos con Stripe/PayPal, eventos y un panel de administración (Jazzmin). Corre aparte, en su propio servidor/proceso (no en el mismo hosting estático que `/site`).
- **/plugin**: plugin de Paper/Spigot que entrega la compra en el juego cuando el jugador entra al server.
- **/scripts**: `pterodactyl.py`, cliente mínimo de la API de Pterodactyl (panel de TaroHosting) para desplegar el plugin y operar el servidor de Minecraft remoto sin entrar al panel web.

Flujo completo: el jugador crea una cuenta (usuario + contraseña) ligada a **un** nick de Minecraft → inicia sesión → compra **GGcoins** (moneda virtual, 100 GGcoins = $1 USD) con Stripe o PayPal → gasta esos GGcoins al instante en productos de la tienda (sin pasar por una pasarela de pago de nuevo) → el plugin, al detectar al jugador conectado, consulta el backend y ejecuta los comandos de entrega. El jugador puede ver su saldo en el navbar y su historial de compras en `mis-compras.html`.

## 1. Requisitos de infraestructura

- Un hosting estático para `/site` (ej. v2networks) — no ejecuta código, solo sirve los archivos HTML/CSS/JS/imágenes tal cual.
- Un lugar donde correr `/django_backend` de forma **persistente** (VPS propio, Railway, Render, Fly.io, o el mismo VPS donde está el servidor de Minecraft). Hosts gratuitos tipo Aternos **no sirven** para esto porque no permiten procesos externos.
- Acceso para instalar plugins `.jar` en tu servidor de Minecraft (Paper/Spigot).
- Una cuenta de [Stripe](https://dashboard.stripe.com) (tiene modo de pruebas gratis).
- Una app de [PayPal Developer](https://developer.paypal.com/dashboard/applications) (el modo Sandbox da credenciales de prueba al instante).
- Java 21 y Maven instalados donde vayas a compilar el plugin.

**Importante sobre dónde alojar el sitio y el backend**: la cookie de sesión usa `SameSite=Lax`, que solo viaja en peticiones `fetch` entre dominios que compartan el mismo "site" (mismo dominio raíz). Despliega `/site` y `/django_backend` como subdominios del mismo dominio (ej. `novapixel.host` para el sitio en v2networks y `api.novapixel.host` para el backend Django) — **no** en dominios completamente distintos, porque ahí el navegador descartaría la cookie silenciosamente y el login parecería no funcionar.

Antes de publicar, cambia `NOVAPIXEL_API_BASE` en `site/script.js` (línea ~7) por la URL real de tu backend Django — ahora mismo apunta a `http://localhost:8001`.

## 2. Backend (`/django_backend`)

```bash
cd django_backend
python -m venv ../django_backend_venv
../django_backend_venv/Scripts/activate   # Windows; en Linux/Mac: source ../django_backend_venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edita `.env` (ver comentarios en `.env.example` para dónde conseguir cada valor): `DJANGO_SECRET_KEY`, `SITE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PLUGIN_SHARED_SECRET`, `COOKIE_SECURE`, `RESEND_API_KEY`, `PAYPAL_CLIENT_ID`/`SECRET`.

Arrancar:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 8001
```

`daphne` (primer app en `INSTALLED_APPS`) hace que `runserver` sirva ASGI automáticamente, necesario para el WebSocket de entrega instantánea del plugin (`pluginapi`).

### Panel de administración

`/admin/` usa el tema [Jazzmin](https://django-jazzmin.readthedocs.io/) (sidebar oscura, buscador, iconos). Incluye:
- Exportar a Excel/PDF desde cualquier listado de GGcoins (`novapixel/admin_export.py`, `ExportMixin`).
- Panel de métricas de GGcoins (`admin:gilcoins_dashboard`): total recaudado, compradores únicos y detalle por cuenta.

### Cuentas de usuario

El registro y login viven en `accounts/`. Cada cuenta (`accounts.User`, extiende `AbstractUser`) tiene usuario, contraseña y **un solo nick de Minecraft**, fijado al registrarse. La sesión se guarda en una cookie `httpOnly` de Django.

Comprar **requiere sesión iniciada**: `POST /api/store/checkout` descuenta GGcoins del saldo de la cuenta autenticada — nunca recibe el nick del cliente, lo toma de la sesión, así nadie puede comprar a nombre de otro jugador. `GET /api/purchases/me` devuelve el historial de la cuenta logueada, usado por `mis-compras.html`.

Limitación conocida: el nick queda fijo al registrarse, no hay forma de cambiarlo desde la web todavía (editar directo en el admin de `accounts.User` si un jugador se equivoca al escribirlo).

### Recuperar contraseña por correo

"¿Olvidaste tu contraseña?" en el modal de login llama a `POST /api/auth/forgot-password`, que genera un token de un solo uso (`accounts.PasswordResetToken`, expira en 1 hora) y envía un enlace a `reset-password.html?token=...` usando la API de [Resend](https://resend.com). Esa página llama a `POST /api/auth/reset-password` para guardar la contraseña nueva.

### Economía de GGcoins

Los productos de la tienda se compran al instante gastando **GGcoins**, una moneda virtual a tasa fija de **100 GGcoins = $1 USD**.

- `gilcoins.GilcoinPackage`: los paquetes que se compran con dinero real (Stripe o PayPal), editables desde el admin.
- `POST /api/gilcoins/checkout/stripe` y `POST /api/gilcoins/checkout/paypal`: crean el pago y una fila `pending` en `GilcoinPurchase`.
- Confirmación: el webhook de Stripe (`webhook/stripe`) o `POST /api/gilcoins/paypal/capture` (llamado desde `gilcoins-callback.html`) acreditan el saldo y quedan registrados en `GilcoinTransaction` (ledger de auditoría).
- `POST /api/store/checkout`: recibe el carrito completo, valida cada línea contra `store.Product`, calcula el total y gasta los GGcoins de una sola vez de forma atómica. Si el saldo alcanza, inserta una fila `store.Purchase` por cada unidad comprada — no pasa por ninguna pasarela de pago.

### Carrito de compra

`tienda.html` funciona como un carrito: cada botón "Añadir" agrega el producto a un carrito persistido en `localStorage` (columna derecha) en vez de comprarlo al instante. Desde el carrito se puede subir/bajar cantidad, quitar líneas o vaciarlo, y "Finalizar compra" manda todo junto a `POST /api/store/checkout`. Si el usuario no inició sesión, agregar al carrito funciona igual, pero al pagar se le pide iniciar sesión y luego se reintenta el checkout automáticamente.

### Donador VIP y Rangos Indefinido

El banner dorado "NovaPixel VIP" abre una vista exclusiva con los rangos permanentes (Donador VIP LV10/14/18/22). Los rangos indefinidos normales (Angelical/Celestial/Divino indefinido) viven como pestaña propia del sidebar de la tienda ("Rangos Indefinido"), junto a "Rangos 30 días".

### Catálogo de productos

`store.Product` (gestionable desde el admin) define cada producto: precio en GGcoins y los comandos de consola que se ejecutan al entregarlo (usa `%player%` como marcador del nick).

- Los **rangos** vienen con comandos de [LuckPerms](https://luckperms.net/) asumiendo grupos `angelical`, `celestial`, `divino`, `donador` — ajusta los nombres si los tuyos son distintos.
- **Protecciones, kits y cosméticos** dependen de los plugins que uses, así que algunos se dejan con `commands: []` y entrega manual: el plugin de Minecraft avisará a los admins conectados (permiso `novapixel.store.notify`) para que la entreguen a mano.

## 3. Plugin de Minecraft (`/plugin`)

Compilar (requiere JDK 21 + Maven, o usa el workflow de GitHub Actions en `.github/workflows/build-plugin.yml`):

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

## 4. Despliegue remoto del server de Minecraft (`/scripts`)

`scripts/pterodactyl.py` es un cliente mínimo de la API Client de [Pterodactyl](https://pterodactyl.io/) (panel de TaroHosting) para desplegar el plugin y operar el server remoto sin entrar al panel web. Lee `PTERODACTYL_URL` / `PTERODACTYL_API_KEY` / `PTERODACTYL_SERVER_ID` desde `django_backend/.env`.

```bash
python scripts/pterodactyl.py status
python scripts/pterodactyl.py list [directorio]
python scripts/pterodactyl.py upload <archivo_local> [directorio_remoto]
python scripts/pterodactyl.py command "<comando de consola>"
python scripts/pterodactyl.py power <start|stop|restart|kill>
```

## 5. Soporte Bedrock (Geyser + Floodgate)

Para que un solo servidor Java atienda jugadores de Java y Bedrock:

1. Instala [Geyser](https://geysermc.org/download) y [Floodgate](https://geysermc.org/download#floodgate) en tu servidor Paper.
2. En `plugins/floodgate/config.yml`, pon el prefijo de usuario vacío:
   ```yaml
   username-prefix: ""
   ```
   Por defecto Floodgate antepone un `.` al nombre de los jugadores de Bedrock no vinculados (ej. `.Steve123`). Si dejas el prefijo por defecto, el nick que el jugador escriba en la web (`Steve123`) no coincidirá con el nombre real dentro del juego (`.Steve123`) y la compra nunca se entregará. Con el prefijo vacío coinciden exactamente.
3. Si tus jugadores de Bedrock **vinculan** su cuenta a una cuenta Java (`/linkaccount`), Floodgate usa el nombre Java vinculado en vez del gamertag — en ese caso deben comprar usando su nick de Java.

## 6. Vista previa del skin en la web

El modal de compra muestra la cabeza del skin junto al campo del nick usando [mc-heads.net](https://mc-heads.net) (servicio público no oficial, gratuito). Funciona bien con nicks de Java. Para gamertags de Bedrock no vinculados no existe una API pública de skins de Bedrock, así que se mostrará un skin genérico (Steve/Alex) — es solo estético, no afecta la entrega de la compra.

## 7. Limitaciones conocidas / próximos pasos

- Si el backend no puede conectarse a internet al momento de confirmar la entrega, la compra queda como `paid` y se reintentará en la siguiente conexión o revisión periódica del jugador.
- No hay cambio de nick post-registro — si lo necesitas, es el siguiente candidato a construir.
- Los umbrales de la Tienda VIP están en USD gastado en GGcoins; si algún día agregas otro método de pago que no pase por `GilcoinPurchase`, ese gasto no contaría para los niveles VIP.
