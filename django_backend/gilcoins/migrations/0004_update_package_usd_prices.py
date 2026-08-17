from django.db import migrations

# Tabla de precios en USD acordada (convertida desde CLP a ~910 por dólar).
# Antes el precio era simplemente gilcoins/100 (100 Gilcoins = $1); esta
# tabla es más barata y además escala el bono: cuanto más grande el
# paquete, menos cuesta cada Gilcoin (de 6.87 a 5.52 CLP por unidad).
#
#   id, precio_centavos, precio_CLP_referencia
NEW_PRICES = [
    ("pack-575", 434, 3950),
    ("pack-1380", 956, 8700),
    ("pack-2800", 1923, 17500),
    ("pack-4500", 3077, 28000),
    ("pack-6500", 4286, 39000),
    ("pack-13500", 8571, 78000),
    ("pack-33500", 20440, 186000),
    ("pack-60200", 36538, 332500),
]

# Precios anteriores, para poder revertir la migración sin perder el valor
# original (era gilcoins/100 en dólares -> gilcoins en centavos).
OLD_PRICES = {
    "pack-575": 575,
    "pack-1380": 1380,
    "pack-2800": 2800,
    "pack-4500": 4500,
    "pack-6500": 6500,
    "pack-13500": 13500,
    "pack-33500": 33500,
    "pack-60200": 60200,
}


def forwards(apps, schema_editor):
    GilcoinPackage = apps.get_model("gilcoins", "GilcoinPackage")
    for pid, cents, _clp in NEW_PRICES:
        # compare_at se deja en el precio viejo: es justamente el "antes"
        # tachado que muestra la tienda, y ahora refleja un descuento real.
        GilcoinPackage.objects.filter(id=pid).update(
            price_cents=cents, compare_at_price_cents=OLD_PRICES[pid]
        )


def backwards(apps, schema_editor):
    GilcoinPackage = apps.get_model("gilcoins", "GilcoinPackage")
    for pid, cents in OLD_PRICES.items():
        GilcoinPackage.objects.filter(id=pid).update(price_cents=cents)


class Migration(migrations.Migration):
    dependencies = [
        ("gilcoins", "0003_alter_gilcoinpackage_options_and_more"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
