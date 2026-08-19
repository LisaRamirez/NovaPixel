from django.db import migrations

# Los rangos indefinidos se quitaron de la web el 19 ago 2026 porque esa
# compra permanente pasa a la sección VIP. Quitar las tarjetas no basta:
# el checkout valida `is_active`, no si el producto sale en la página, así
# que seguían siendo comprables llamando a la API con su id.
RANK_IDS = [
    "rango-angelical-indef",
    "rango-celestial-indef",
    "rango-divino-indef",
    "rango-donador-indef",
]


def forwards(apps, schema_editor):
    Product = apps.get_model("store", "Product")
    Product.objects.filter(id__in=RANK_IDS).update(is_active=False)


def backwards(apps, schema_editor):
    Product = apps.get_model("store", "Product")
    Product.objects.filter(id__in=RANK_IDS).update(is_active=True)


class Migration(migrations.Migration):

    dependencies = [
        ("store", "0009_pack_comandos_add_anvil"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
