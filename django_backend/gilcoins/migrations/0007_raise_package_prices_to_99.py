from django.db import migrations

# Los montos suben al .99 del mismo dólar. price_cents es lo que se le cobra
# de verdad al comprador en Stripe y PayPal, así que sin esta migración la
# tienda mostraría $4.99 y cobraría $4.34.
#
#   id, centavos_nuevos, centavos_anteriores
NEW_PRICES = [
    ("pack-575", 499, 434),
    ("pack-1380", 999, 956),
    ("pack-2800", 1999, 1923),
    ("pack-4500", 3099, 3077),
    ("pack-6500", 4299, 4286),
    ("pack-13500", 8599, 8571),
    ("pack-33500", 20499, 20440),
    ("pack-60200", 36599, 36538),
]


def forwards(apps, schema_editor):
    GilcoinPackage = apps.get_model("gilcoins", "GilcoinPackage")
    for package_id, new_cents, _old_cents in NEW_PRICES:
        GilcoinPackage.objects.filter(id=package_id).update(price_cents=new_cents)


def backwards(apps, schema_editor):
    GilcoinPackage = apps.get_model("gilcoins", "GilcoinPackage")
    for package_id, _new_cents, old_cents in NEW_PRICES:
        GilcoinPackage.objects.filter(id=package_id).update(price_cents=old_cents)


class Migration(migrations.Migration):

    dependencies = [
        ("gilcoins", "0006_rename_currency_to_ggcoins"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
