import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import login as django_login
from django.contrib.auth import logout as django_logout
from django.contrib.sessions.models import Session
from django.db import IntegrityError
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from novapixel.http_utils import error_response, json_body

from .emails import EmailSendError, send_password_reset_email
from .models import PasswordResetToken, User
from .validators import is_valid_email, is_valid_nick, is_valid_password, is_valid_username

from django.http import JsonResponse

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
