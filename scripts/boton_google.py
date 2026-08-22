# -*- coding: utf-8 -*-
"""Inserta el botón "Continuar con Google" y la pantalla del nick.

El modal de acceso está repetido tal cual en las cuatro páginas que lo
usan, así que el cambio se aplica igual en todas. Es idempotente: si ya
está puesto, no lo duplica.
"""

import io
import os

SITE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "site")
PAGINAS = ["gilcoins-callback.html", "index.html", "mis-compras.html", "tienda.html"]

MARCA = "data-google-signin"

# Logo oficial de Google en SVG, para no depender de una imagen externa.
LOGO = (
    '<svg class="google-signin-logo" viewBox="0 0 18 18" aria-hidden="true">'
    '<path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>'
    '<path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/>'
    '<path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"/>'
    '<path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>'
    "</svg>"
)

BOTON = """                <button type="button" class="google-signin-btn" data-google-signin>
                    {logo}
                    Continuar con Google
                </button>
                <div class="auth-divider"><span>o</span></div>
""".format(logo=LOGO)

# Tercera pantalla del modal: Google ya dijo quién es, falta su nick.
VISTA_NICK = """
            <div id="auth-google-nick-view" style="display:none;">
                <h3 class="checkout-modal-title">Ya casi está</h3>
                <p class="checkout-modal-hint" id="google-nick-intro"></p>
                <label class="checkout-modal-label" for="google-username-input">Usuario</label>
                <input type="text" id="google-username-input" class="checkout-modal-input" autocomplete="username">
                <label class="checkout-modal-label" for="google-nick-input">Tu nick de Minecraft (Java o Bedrock)</label>
                <div class="checkout-nick-row">
                    <img id="google-nick-avatar" class="checkout-nick-avatar" src="" alt="" width="40" height="40">
                    <input type="text" id="google-nick-input" class="checkout-modal-input" placeholder="Ej: Steve123" autocomplete="off">
                </div>
                <p class="checkout-modal-hint">Este nick queda ligado a tu cuenta para siempre — revísalo bien, ahí se entregan tus compras.</p>
                <p class="checkout-modal-hint">¿Juegas en <strong>Bedrock</strong>? Escribe un punto delante del nick: <strong>.Steve123</strong></p>
                <p class="checkout-modal-error" id="google-nick-error"></p>
                <button class="checkout-modal-submit" id="google-nick-submit">Crear cuenta</button>
            </div>
"""

TITULO_LOGIN = '                <h3 class="checkout-modal-title">Iniciar sesión</h3>\n'
TITULO_REGISTRO = '                <h3 class="checkout-modal-title">Crear cuenta</h3>\n'
CIERRE_FORGOT = '                <p class="checkout-modal-hint"><a href="#" id="show-login-from-forgot-link">Volver a iniciar sesión</a></p>\n            </div>\n'


def procesar(ruta):
    original = io.open(ruta, encoding="utf-8").read()
    if MARCA in original:
        return "ya estaba"

    texto = original
    fallos = []

    # El botón va arriba del todo en las dos pantallas: es el camino corto,
    # y el formulario de siempre queda debajo para quien lo prefiera.
    for titulo, nombre in ((TITULO_LOGIN, "login"), (TITULO_REGISTRO, "registro")):
        if titulo in texto:
            texto = texto.replace(titulo, titulo + BOTON, 1)
        else:
            fallos.append(nombre)

    if CIERRE_FORGOT in texto:
        texto = texto.replace(CIERRE_FORGOT, CIERRE_FORGOT + VISTA_NICK, 1)
    else:
        fallos.append("vista del nick")

    if fallos:
        return "SIN APLICAR (no encontré: %s)" % ", ".join(fallos)

    io.open(ruta, "w", encoding="utf-8", newline="").write(texto)
    return "listo"


def main():
    for nombre in PAGINAS:
        ruta = os.path.join(SITE, nombre)
        print("  %-26s %s" % (nombre, procesar(ruta)))


if __name__ == "__main__":
    main()
