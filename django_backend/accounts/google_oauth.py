"""Inicio de sesión con Google (OAuth 2.0, flujo de código de autorización).

El flujo tiene tres pasos porque una cuenta de Google no trae lo que la
tienda necesita para entregar una compra: el nick de Minecraft. Google da
correo y nombre; el nick hay que pedirlo aparte la primera vez.

    1. /google/start     el navegador se va a Google
    2. /google/callback  Google vuelve con un código; se canjea por el correo
                         - si ya conocemos ese Google → sesión iniciada
                         - si el correo ya tiene cuenta → se enlazan
                         - si es gente nueva → se guarda en sesión y se
                           devuelve al sitio pidiendo el nick
    3. /google/complete  llega el nick, se crea la cuenta y entra

El "state" es la protección CSRF del propio OAuth: se genera aquí, viaja a
Google y tiene que volver idéntico. Sin esa comprobación, cualquiera podría
inducir a un usuario a completar un login que no pidió.
"""

import secrets
from urllib.parse import urlencode

import requests
from django.conf import settings

AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo"

# Lo mínimo: quién es y su correo. Nada de esto es un permiso "sensible",
# así que la app puede publicarse sin pasar por la verificación de Google.
SCOPES = "openid email profile"

# Clave de sesión donde espera el candidato mientras elige su nick.
PENDIENTE = "google_pendiente"
ESTADO = "google_state"


class GoogleOAuthError(Exception):
    """Algo falló hablando con Google. El mensaje ya viene en español y es
    apto para enseñárselo a la persona."""


def esta_configurado():
    return bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET)


def url_de_autorizacion(state):
    """URL a la que se manda el navegador para que Google pregunte."""
    parametros = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": SCOPES,
        "state": state,
        # Sin esto, quien tenga varias cuentas entra siempre con la última
        # que usó y no puede elegir.
        "prompt": "select_account",
    }
    return f"{AUTH_ENDPOINT}?{urlencode(parametros)}"


def nuevo_state():
    return secrets.token_urlsafe(32)


def perfil_desde_codigo(code):
    """Canjea el código por un token y devuelve el perfil de la persona.

    Devuelve un dict con "sub" (el id estable de Google), "email" y "name".
    """
    try:
        respuesta = requests.post(
            TOKEN_ENDPOINT,
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
            timeout=15,
        )
    except requests.RequestException as exc:
        raise GoogleOAuthError("No pudimos contactar con Google. Inténtalo de nuevo.") from exc

    if respuesta.status_code != 200:
        # El fallo típico aquí es redirect_uri_mismatch: la URI registrada en
        # la consola de Google no es idéntica a GOOGLE_REDIRECT_URI.
        raise GoogleOAuthError("Google rechazó la autenticación. Inténtalo de nuevo.")

    access_token = respuesta.json().get("access_token")
    if not access_token:
        raise GoogleOAuthError("Google no devolvió un token válido.")

    try:
        perfil = requests.get(
            USERINFO_ENDPOINT,
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=15,
        )
    except requests.RequestException as exc:
        raise GoogleOAuthError("No pudimos leer tu perfil de Google.") from exc

    if perfil.status_code != 200:
        raise GoogleOAuthError("No pudimos leer tu perfil de Google.")

    datos = perfil.json()
    sub = datos.get("sub")
    email = datos.get("email")

    if not sub or not email:
        raise GoogleOAuthError("Tu cuenta de Google no compartió un correo.")

    # Una cuenta sin el correo verificado no sirve para enlazar por correo:
    # cualquiera podría registrar un Google con el correo de otra persona y
    # quedarse con su cuenta de la tienda.
    if datos.get("email_verified") is False:
        raise GoogleOAuthError("Tu correo de Google no está verificado.")

    return {"sub": sub, "email": email, "name": datos.get("name") or ""}


def sugerir_usuario(email, existe):
    """Propone un nombre de usuario libre a partir del correo.

    `existe` es una función que dice si un nombre ya está cogido; se pasa
    desde la vista para no importar el modelo aquí.
    """
    base = "".join(c for c in email.split("@")[0] if c.isalnum() or c == "_")[:20]
    if len(base) < 3:
        base = f"jugador{secrets.randbelow(9000) + 1000}"
    if not existe(base):
        return base
    for _ in range(20):
        sufijo = str(secrets.randbelow(9000) + 1000)
        candidato = f"{base[: 20 - len(sufijo)]}{sufijo}"
        if not existe(candidato):
            return candidato
    return ""
