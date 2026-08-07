"""
ASGI config for the NovaPixel project.

Sirve tanto HTTP normal (la API REST) como el WebSocket que usa el plugin
de Minecraft para recibir avisos de entrega instantánea (ver
pluginapi/consumers.py). Con "daphne" en INSTALLED_APPS, `manage.py
runserver` ya sirve esto directamente sin configuración aparte.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "novapixel.settings")

# Debe crearse ANTES de importar cualquier cosa que toque modelos/apps
# (incluido pluginapi.routing), para que el app registry ya esté listo.
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter  # noqa: E402

from pluginapi.routing import websocket_urlpatterns  # noqa: E402

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": URLRouter(websocket_urlpatterns),
    }
)
