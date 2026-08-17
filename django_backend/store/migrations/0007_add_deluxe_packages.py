from django.db import migrations

# Paquetes Deluxe Permanentes: agrupan varios productos con descuento sobre
# la suma de comprarlos por separado (5.200 -> 4.600, 8.600 -> 7.700 y
# 12.700 -> 11.600).
#
# Van con manual_delivery=True y sin comandos a propósito: cada paquete
# incluye ítems "a elección" (el brillo, el spawner) que el jugador tiene
# que elegir, así que no hay un comando fijo que los entregue. El plugin
# avisa a los admins conectados para que los entreguen a mano, igual que
# con el resto de productos marcados como manuales.
NEW_PRODUCTS = [
    ("paquete-inmortal", "Paquete Inmortal", "Paquetes Deluxe", 4600, [], True, 1),
    ("paquete-absoluto", "Paquete Absoluto", "Paquetes Deluxe", 7700, [], True, 2),
    ("paquete-supremo", "Paquete Supremo", "Paquetes Deluxe", 11600, [], True, 3),
]


def forwards(apps, schema_editor):
    Product = apps.get_model("store", "Product")
    for pid, name, category, price, commands, manual, order in NEW_PRODUCTS:
        Product.objects.update_or_create(
            id=pid,
            defaults={
                "name": name,
                "category": category,
                "price_gilcoins": price,
                "commands": commands,
                "manual_delivery": manual,
                "order": order,
            },
        )


def backwards(apps, schema_editor):
    Product = apps.get_model("store", "Product")
    Product.objects.filter(id__in=[p[0] for p in NEW_PRODUCTS]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("store", "0006_alter_product_options_alter_purchase_options_and_more"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
