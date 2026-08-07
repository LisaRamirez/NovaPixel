from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .consumers import PLUGIN_GROUP


def notify_purchase(nick):
    """Le avisa al plugin (si está conectado por WebSocket) que revise de
    inmediato las compras pendientes de este nick, en vez de esperar a su
    próximo sondeo periódico. Llamado desde store.views.checkout tras una
    compra exitosa."""
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    async_to_sync(channel_layer.group_send)(
        PLUGIN_GROUP,
        {"type": "deliver.event", "nick": nick},
    )
