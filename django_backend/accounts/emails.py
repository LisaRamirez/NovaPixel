import requests
from django.conf import settings


class EmailSendError(Exception):
    pass


def _send_email(to, subject, html):
    """Igual que server/src/email.js: llama la API de Resend directo por
    HTTP en vez de usar su SDK."""
    if not settings.RESEND_API_KEY or not settings.RESEND_FROM_EMAIL:
        raise EmailSendError("Falta RESEND_API_KEY o RESEND_FROM_EMAIL.")

    response = requests.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {settings.RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
        json={"from": settings.RESEND_FROM_EMAIL, "to": to, "subject": subject, "html": html},
        timeout=10,
    )
    if not response.ok:
        raise EmailSendError(f"Resend respondió {response.status_code}: {response.text}")


def send_password_reset_email(to, reset_url):
    html = f"""
    <p>Recibimos una solicitud para restablecer tu contraseña de NovaPixel.</p>
    <p><a href="{reset_url}">Haz clic aquí para elegir una nueva contraseña</a></p>
    <p>Este enlace expira en 1 hora. Si no pediste esto, puedes ignorar el correo.</p>
    """
    _send_email(to, "Recupera tu contraseña de NovaPixel", html)
