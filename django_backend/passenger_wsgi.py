"""Punto de entrada para Passenger (cPanel → Setup Python App, de v2nets).

CloudLinux arranca la app buscando un `application` WSGI en este archivo, en la
raíz del "Application root". No se usa ASGI/daphne aquí: Passenger sólo habla
WSGI, así que el WebSocket de entrega en tiempo real queda inactivo y el plugin
cae en su sondeo periódico (`recheck-interval-seconds` en config.yml) — la
entrega llega igual, con hasta un minuto de retraso.
"""

import os
import sys

# La app corre con el cwd de Passenger, no con el de este archivo.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "novapixel.settings")

from novapixel.wsgi import application  # noqa: E402
