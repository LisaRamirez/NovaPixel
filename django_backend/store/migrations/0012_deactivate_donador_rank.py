from django.db import migrations

# El rango Donador sale de la sección de Rangos: esa compra vive en la zona
# Luxury/VIP, no entre los rangos generales de 30 días. Mismo motivo que con
# los rangos indefinidos en 0010 — quitar la tarjeta de la web no basta,
# porque el checkout valida `is_active` y no si el producto se pinta en la
# página, así que seguiría siendo comprable llamando a la API con su id.
RANK_ID = "rango-donador-30"


def forwards(apps, schema_editor):
    Product = apps.get_model("store", "Product")
    Product.objects.filter(id=RANK_ID).update(is_active=False)


def backwards(apps, schema_editor):
    Product = apps.get_model("store", "Product")
    Product.objects.filter(id=RANK_ID).update(is_active=True)


class Migration(migrations.Migration):

    dependencies = [
        ("store", "0011_price_update_2026_08_19"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
