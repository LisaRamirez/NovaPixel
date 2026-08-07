from django.db import migrations

NEW_KITS = [
    ("kit-molten", "Kit Molten", "Kits", 1800, [], True, 7),
    ("kit-necros", "Kit Necros", "Kits", 2000, [], True, 8),
    ("kit-bee", "Kit Bee", "Kits", 1600, [], True, 9),
    ("kit-sakura", "Kit Sakura", "Kits", 1500, [], True, 10),
]


def forwards(apps, schema_editor):
    Product = apps.get_model("store", "Product")
    for pid, name, category, price, commands, manual, order in NEW_KITS:
        Product.objects.create(
            id=pid, name=name, category=category, price_gilcoins=price,
            commands=commands, manual_delivery=manual, order=order,
        )


def backwards(apps, schema_editor):
    Product = apps.get_model("store", "Product")
    Product.objects.filter(id__in=[k[0] for k in NEW_KITS]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("store", "0003_update_kits_and_brillo"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
