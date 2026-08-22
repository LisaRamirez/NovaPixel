import secrets
from datetime import timedelta
from urllib.parse import urlencode

from django.conf import settings
from django.contrib.auth import login as django_login
from django.contrib.auth import logout as django_logout
from django.contrib.sessions.models import Session
from django.db import IntegrityError
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from novapixel.http_utils import error_response, json_body

from . import google_oauth
from .emails import EmailSendError, send_password_reset_email
from .models import PasswordResetToken, User
from .validators import is_valid_email, is_valid_nick, is_valid_password, is_valid_username

from django.http import HttpResponseRedirect, JsonResponse

AUTH_BACKEND = "django.contrib.auth.backends.ModelBackend"


def _user_payload(user):
    return {
        "username": user.username,
        "minecraftNick": user.minecraft_nick,
        "gilcoinBalance": user.gilcoin_balance,
    }


@csrf_exempt
@require_http_methods(["POST"])
def register(request):
    data = json_body(request)
    username = data.get("username")
    password = data.get("password")
    minecraft_nick = data.get("minecraftNick")
    email = data.get("email")

    if not is_valid_username(username):
        return error_response("El usuario debe tener entre 3 y 20 caracteres (letras, números y guion bajo).")
    if not is_valid_password(password):
        return error_response("La contraseña debe tener al menos 8 caracteres.")
    if not is_valid_nick(minecraft_nick):
        return error_response("El nick de Minecraft no es válido.")
    if not is_valid_email(email):
        return error_response("Correo no válido.")

    if User.objects.filter(username__iexact=username).exists():
        return error_response("Ese usuario ya está registrado.", status=409)

    user = User(username=username, minecraft_nick=minecraft_nick, email=email)
    user.set_password(password)
    try:
        user.save()
    except IntegrityError:
        return error_response("Ese usuario, correo o nick ya está registrado.", status=409)

    django_login(request, user, backend=AUTH_BACKEND)
    return JsonResponse(_user_payload(user), status=201)


@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    data = json_body(request)
    username = data.get("username")
    password = data.get("password")
    generic_error = "Usuario o contraseña incorrectos."

    if not isinstance(username, str) or not isinstance(password, str) or not username or not password:
        return error_response(generic_error, status=400)

    # Búsqueda case-insensitive (igual que COLLATE NOCASE en el backend
    # Node) — por eso no se usa authenticate() directo, que por defecto
    # hace match exacto sobre USERNAME_FIELD.
    user = User.objects.filter(username__iexact=username).first()
    if user is None or not user.check_password(password):
        return error_response(generic_error, status=401)

    django_login(request, user, backend=AUTH_BACKEND)
    return JsonResponse(_user_payload(user))


@csrf_exempt
@require_http_methods(["POST"])
def logout_view(request):
    django_logout(request)
    return JsonResponse({"ok": True})


@require_http_methods(["GET"])
def me(request):
    if not request.user.is_authenticated:
        return error_response("Debes iniciar sesión.", status=401)
    return JsonResponse(_user_payload(request.user))


@csrf_exempt
@require_http_methods(["POST"])
def forgot_password(request):
    data = json_body(request)
    email = data.get("email")
    generic_message = "Si ese correo está registrado, te enviamos un enlace para restablecer tu contraseña."

    if not is_valid_email(email):
        return error_response("Correo no válido.")

    # Misma respuesta exista o no la cuenta, a propósito: evita que alguien
    # use este endpoint para saber qué correos están registrados.
    user = User.objects.filter(email__iexact=email).first()
    if user is None:
        return JsonResponse({"message": generic_message})

    token = secrets.token_hex(32)
    PasswordResetToken.objects.create(token=token, user=user, expires_at=timezone.now() + timedelta(hours=1))
    reset_url = f"{settings.SITE_URL}/reset-password.html?token={token}"

    try:
        send_password_reset_email(user.email, reset_url)
    except EmailSendError:
        return error_response("No se pudo enviar el correo. Intenta de nuevo más tarde.", status=500)

    return JsonResponse({"message": generic_message})


@csrf_exempt
@require_http_methods(["POST"])
def reset_password(request):
    data = json_body(request)
    token = data.get("token")
    new_password = data.get("newPassword")

    if not isinstance(token, str) or not token:
        return error_response("Enlace inválido.")
    if not is_valid_password(new_password):
        return error_response("La contraseña debe tener al menos 8 caracteres.")

    reset = PasswordResetToken.objects.filter(token=token).select_related("user").first()
    if reset is None or reset.expires_at < timezone.now():
        if reset is not None:
            reset.delete()
        return error_response("Enlace inválido o expirado. Solicita uno nuevo.")

    user = reset.user
    user.set_password(new_password)
    user.save()
    PasswordResetToken.objects.filter(user=user).delete()

    # Cierra sesión en todos los dispositivos (igual que
    # deleteSessionsForUser en el backend Node) por si la cuenta se
    # comprometió por una cookie de sesión robada.
    for session in Session.objects.all():
        if str(session.get_decoded().get("_auth_user_id")) == str(user.pk):
            session.delete()

    return JsonResponse({"ok": True})


# --- Inicio de sesión con Google -------------------------------------------
# El flujo y sus tres pasos están explicados en accounts/google_oauth.py.


def _volver_al_sitio(**parametros):
    """Redirige al navegador de vuelta a la tienda.

    El callback de Google es una navegación del navegador, no un fetch, así
    que aquí no se responde JSON: se devuelve a la persona a la web con el
    resultado en el query string, y el frontend decide qué enseñar.
    """
    destino = f"{settings.SITE_URL}/tienda.html"
    if parametros:
        destino = f"{destino}?{urlencode(parametros)}"
    return HttpResponseRedirect(destino)


@require_http_methods(["GET"])
def google_start(request):
    if not google_oauth.esta_configurado():
        return error_response("El inicio de sesión con Google no está disponible.", status=503)

    state = google_oauth.nuevo_state()
    request.session[google_oauth.ESTADO] = state
    return HttpResponseRedirect(google_oauth.url_de_autorizacion(state))


@require_http_methods(["GET"])
def google_callback(request):
    if not google_oauth.esta_configurado():
        return error_response("El inicio de sesión con Google no está disponible.", status=503)

    # Si la persona pulsó "Cancelar" en la pantalla de Google.
    if request.GET.get("error"):
        return _volver_al_sitio(google="cancelado")

    state_esperado = request.session.pop(google_oauth.ESTADO, None)
    if not state_esperado or request.GET.get("state") != state_esperado:
        return _volver_al_sitio(google="error")

    code = request.GET.get("code")
    if not code:
        return _volver_al_sitio(google="error")

    try:
        perfil = google_oauth.perfil_desde_codigo(code)
    except google_oauth.GoogleOAuthError:
        return _volver_al_sitio(google="error")

    # 1. Ya se había registrado con Google alguna vez.
    user = User.objects.filter(google_id=perfil["sub"]).first()

    # 2. Tiene cuenta de toda la vida con ese correo: se enlazan, para que no
    #    acabe con dos cuentas y las compras repartidas entre las dos.
    if user is None:
        user = User.objects.filter(email__iexact=perfil["email"]).first()
        if user is not None:
            user.google_id = perfil["sub"]
            user.save(update_fields=["google_id"])

    if user is not None:
        django_login(request, user, backend=AUTH_BACKEND)
        return _volver_al_sitio(google="ok")

    # 3. Gente nueva: Google no sabe su nick de Minecraft, así que la cuenta
    #    aún no se puede crear. Queda en la sesión hasta que lo escriba.
    request.session[google_oauth.PENDIENTE] = {
        "sub": perfil["sub"],
        "email": perfil["email"],
        "name": perfil["name"],
    }
    return _volver_al_sitio(google="falta-nick")


@require_http_methods(["GET"])
def google_pending(request):
    """Qué sabemos de quien está a medio registrar, para rellenar el
    formulario del nick sin volver a preguntarle el correo."""
    pendiente = request.session.get(google_oauth.PENDIENTE)
    if not pendiente:
        return error_response("No hay ningún registro de Google en curso.", status=404)

    def existe(nombre):
        return User.objects.filter(username__iexact=nombre).exists()

    return JsonResponse(
        {
            "email": pendiente["email"],
            "name": pendiente.get("name", ""),
            "suggestedUsername": google_oauth.sugerir_usuario(pendiente["email"], existe),
        }
    )


@csrf_exempt
@require_http_methods(["POST"])
def google_complete(request):
    """Cierra el registro con el nick que acaba de escribir la persona."""
    pendiente = request.session.get(google_oauth.PENDIENTE)
    if not pendiente:
        return error_response("Tu sesión de Google caducó. Vuelve a empezar.", status=409)

    data = json_body(request)
    username = data.get("username")
    minecraft_nick = data.get("minecraftNick")

    if not is_valid_username(username):
        return error_response("El usuario debe tener entre 3 y 20 caracteres (letras, números y guion bajo).")
    if not is_valid_nick(minecraft_nick):
        return error_response("El nick de Minecraft no es válido.")

    if User.objects.filter(username__iexact=username).exists():
        return error_response("Ese usuario ya está registrado.", status=409)

    user = User(
        username=username,
        minecraft_nick=minecraft_nick,
        email=pendiente["email"],
        google_id=pendiente["sub"],
    )
    # Entra por Google, así que no hay contraseña que valga: se marca como
    # inutilizable. Si algún día quiere una, la pide por "olvidé mi
    # contraseña" con su correo, que ya está verificado por Google.
    user.set_unusable_password()

    try:
        user.save()
    except IntegrityError:
        return error_response("Ese usuario o nick ya está registrado.", status=409)

    request.session.pop(google_oauth.PENDIENTE, None)
    django_login(request, user, backend=AUTH_BACKEND)
    return JsonResponse(_user_payload(user), status=201)
