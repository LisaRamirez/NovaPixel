from django.db import migrations

NEW_PRODUCTS = [
    ("libro-ilimitado", "Libro Ilimitado", "Comandos y Vuelo", 1200, [], True, 3),
    ("alas-angelicales", "Alas Angelicales", "Comandos y Vuelo", 1800, [], True, 4),
    ("pocion-suerte", "Poción de la Suerte", "Experiencia y Economía", 900, [], True, 4),
]


def forwards(apps, schema_editor):
    Product = apps.get_model("store", "Product")
    for pid, name, category, price, commands, manual, order in NEW_PRODUCTS:
        Product.objects.create(
            id=pid, name=name, category=category, price_gilcoins=price,
            commands=commands, manual_delivery=manual, order=order,
        )


def backwards(apps, schema_editor):
    Product = apps.get_model("store", "Product")
    Product.objects.filter(id__in=[p[0] for p in NEW_PRODUCTS]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("store", "0004_add_more_kits"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
