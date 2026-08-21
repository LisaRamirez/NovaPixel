from django.db import migrations

# Tabla de precios acordada el 19/08/2026. price_gilcoins es lo que el
# backend descuenta del saldo al comprar: si no se actualiza aqui, la web
# anuncia el precio nuevo y el checkout sigue cobrando el viejo.
#
#   id, precio_nuevo, precio_anterior
PRICES = [
    ("rango-angelical-30", 1400, 400),
    ("rango-celestial-30", 2900, 900),
    ("rango-divino-30", 4400, 1600),
    ("donador-vip-lv10", 10300, 5000),
    ("donador-vip-lv14", 13450, 9000),
    ("donador-vip-lv18", 23600, 15000),
    ("donador-vip-lv22", 41000, 25000),
    ("pico-3x3", 3200, 1500),
    ("proteccion-diamante-128", 2400, 800),
    ("proteccion-netherita-256", 5000, 2100),
    ("proteccion-esmeralda-512", 7000, 4500),
    ("economia-50k", 2700, 900),
    ("economia-100k", 5000, 1500),
    ("spawner-vaca", 600, 300),
    ("spawner-pollo", 600, 300),
    ("spawner-cerdo", 600, 300),
    ("spawner-arana", 1380, 500),
    ("schematic-pegado", 5000, 1200),
    ("paquete-inmortal", 11100, 4600),
    ("paquete-absoluto", 22300, 7700),
    ("paquete-supremo", 25400, 11600),
]


def forwards(apps, schema_editor):
    Product = apps.get_model("store", "Product")
    for product_id, new_price, _old in PRICES:
        Product.objects.filter(id=product_id).update(price_gilcoins=new_price)


def backwards(apps, schema_editor):
    Product = apps.get_model("store", "Product")
    for product_id, _new, old_price in PRICES:
        Product.objects.filter(id=product_id).update(price_gilcoins=old_price)


class Migration(migrations.Migration):

    dependencies = [
        ("store", "0010_deactivate_indefinite_ranks"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
