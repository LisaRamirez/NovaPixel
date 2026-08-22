# -*- coding: utf-8 -*-
"""Prepara las paginas de site/ para publicar.

Hace dos cosas, las dos idempotentes (se puede ejecutar tantas veces como
haga falta sin duplicar nada):

1. Sella styles.css y script.js con ?v=<version>, para que el navegador del
   jugador se baje la version nueva en vez de servir la que tiene en cache.
   Sin esto, un cambio en la tienda tarda horas en verse.

2. Inserta la etiqueta de Google Analytics justo antes de </head>.

Uso:
    python scripts/versionar.py            # version = fecha de hoy (AAAAMMDD)
    python scripts/versionar.py 20260822   # version concreta
"""

import io
import os
import re
import sys
from datetime import date

SITE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "site")
GA_ID = "G-WW11GKD3NV"

# Marca para reconocer el bloque ya insertado y no meterlo dos veces.
GA_MARCA = "googletagmanager.com/gtag/js"

GA_BLOQUE = """    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id={id}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());

      gtag('config', '{id}');
    </script>
""".format(id=GA_ID)


def procesar(ruta, version):
    original = io.open(ruta, encoding="utf-8").read()
    texto = original

    # 1. Sellado de version. El patron acepta que ya lleve un ?v= anterior,
    #    asi que reemplaza en vez de acumular.
    for archivo in ("styles.css", "script.js"):
        texto = re.sub(
            r'(href|src)="%s(\?v=[^"]*)?"' % re.escape(archivo),
            lambda m: '%s="%s?v=%s"' % (m.group(1), archivo, version),
            texto,
        )

    # 2. Google Analytics, solo si no estaba ya.
    if GA_MARCA not in texto:
        texto = texto.replace("</head>", GA_BLOQUE + "</head>", 1)

    if texto != original:
        io.open(ruta, "w", encoding="utf-8", newline="").write(texto)
        return True
    return False


def main():
    version = sys.argv[1] if len(sys.argv) > 1 else date.today().strftime("%Y%m%d")
    paginas = sorted(f for f in os.listdir(SITE) if f.endswith(".html"))

    print("version: %s" % version)
    for nombre in paginas:
        cambiada = procesar(os.path.join(SITE, nombre), version)
        print("  %-26s %s" % (nombre, "actualizada" if cambiada else "sin cambios"))


if __name__ == "__main__":
    main()
