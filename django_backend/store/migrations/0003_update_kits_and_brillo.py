from django.db import migrations

# Los 6 kits viejos se reemplazan por 7 con nombre e imagen coincidentes
# (el arte nuevo trae Star Light/Bahamon/Conqueror/Loki/Samurai/Ifrit/
# Darkflame, no los nombres anteriores). brillo-fuego se cambia por
# brillo-arcoiris porque el set de brillos nuevo no incluye fuego pero sí
# arcoíris.

OLD_KIT_IDS = ["kit-alas", "kit-angelical", "kit-bahamut", "kit-asura", "kit-sakura"]
# kit-samurai se mantiene igual (mismo id, mismo nombre, coincide con el arte nuevo)

NEW_KITS = [
    ("kit-star-light", "Kit Star Light", "Kits", 3500, [], True, 0),
    ("kit-conqueror", "Kit Conqueror", "Kits", 2000, [], True, 2),
    ("kit-bahamon", "Kit Bahamon", "Kits", 1700, [], True, 3),
    ("kit-loki", "Kit Loki", "Kits", 1700, [], True, 4),
    ("kit-darkflame", "Kit Darkflame", "Kits", 2200, [], True, 5),
    ("kit-ifrit", "Kit Ifrit", "Kits", 1500, [], True, 6),
]


def forwards(apps, schema_editor):
    Product = apps.get_model("store", "Product")
    Product.objects.filter(id__in=OLD_KIT_IDS).delete()
    for pid, name, category, price, commands, manual, order in NEW_KITS:
        Product.objects.create(
            id=pid, name=name, category=category, price_gilcoins=price,
            commands=commands, manual_delivery=manual, order=order,
        )
    Product.objects.filter(id="brillo-fuego").delete()
    Product.objects.create(
        id="brillo-arcoiris", name="Brillo Arcoíris", category="Cosméticos",
        price_gilcoins=500, commands=[], manual_delivery=True, order=2,
    )


def backwards(apps, schema_editor):
    Product = apps.get_model("store", "Product")
    Product.objects.filter(id__in=[k[0] for k in NEW_KITS]).delete()
    Product.objects.filter(id="brillo-arcoiris").delete()
    for pid, name, price in [
        ("kit-alas", "Kit de Alas", 3500),
        ("kit-angelical", "Kit Angelical", 2000),
        ("kit-bahamut", "Kit Bahamut", 1700),
        ("kit-asura", "Kit Asura", 1700),
        ("kit-sakura", "Kit Sakura", 1500),
    ]:
        Product.objects.create(id=pid, name=name, category="Kits", price_gilcoins=price, commands=[], manual_delivery=True)
    Product.objects.create(
        id="brillo-fuego", name="Brillo Fuego", category="Cosméticos",
        price_gilcoins=500, commands=[], manual_delivery=True,
    )


class Migration(migrations.Migration):
    dependencies = [
        ("store", "0002_seed_products"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
