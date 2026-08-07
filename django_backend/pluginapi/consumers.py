import hmac
import json

from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings

# Todas las conexiones autenticadas del plugin se agregan a este grupo —
# en la práctica solo hay un servidor de Minecraft conectado, pero un grupo
# soporta varios sin cambiar nada si algún día hay más de un server.
PLUGIN_GROUP = "plugin_connections"


class PluginConsumer(AsyncWebsocketConsumer):
    """WebSocket que usa el plugin para recibir avisos de entrega instantánea.

    Protocolo: el plugin se conecta, manda {"type":"auth","secret":"..."} y
    si el secreto coincide con PLUGIN_SHARED_SECRET se une al grupo y
    empieza a recibir {"type":"deliver","nick":"..."} cada vez que alguien
    con ese nick compra algo en el sitio. Es una optimización sobre el
    sondeo periódico que ya existe — si el WebSocket está caído, el plugin
    de todas formas agarra la compra en su próximo sondeo."""

    async def connect(self):
        self.authenticated = False
        await self.accept()

    async def disconnect(self, close_code):
        if self.authenticated:
            await self.channel_layer.group_discard(PLUGIN_GROUP, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        if self.authenticated:
            return  # no se esperan más mensajes del plugin por ahora

        try:
            data = json.loads(text_data or "")
        except (TypeError, ValueError):
            await self.close(code=4000)
            return

        secret = str(data.get("secret", ""))
        if data.get("type") == "auth" and hmac.compare_digest(secret, settings.PLUGIN_SHARED_SECRET):
            self.authenticated = True
            await self.channel_layer.group_add(PLUGIN_GROUP, self.channel_name)
            await self.send(text_data=json.dumps({"type": "auth_ok"}))
        else:
            await self.close(code=4003)

    async def deliver_event(self, event):
        """Handler invocado por channel_layer.group_send (ver realtime.py)."""
        await self.send(text_data=json.dumps({"type": "deliver", "nick": event["nick"]}))
