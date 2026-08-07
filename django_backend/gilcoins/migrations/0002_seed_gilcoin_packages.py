from django.db import migrations

# Mismos 8 paquetes que server/src/gilcoinPackages.js (totales calcados de
# los paquetes de RP de League of Legends, a pedido).
PACKAGES = [
    ("pack-575", "575 Gilcoins", 575, 575, 675, 0),
    ("pack-1380", "1,380 Gilcoins", 1380, 1380, 1625, 1),
    ("pack-2800", "2,800 Gilcoins", 2800, 2800, 3300, 2),
    ("pack-4500", "4,500 Gilcoins", 4500, 4500, 5300, 3),
    ("pack-6500", "6,500 Gilcoins", 6500, 6500, 7650, 4),
    ("pack-13500", "13,500 Gilcoins", 13500, 13500, 15900, 5),
    ("pack-33500", "33,500 Gilcoins", 33500, 33500, 39400, 6),
    ("pack-60200", "60,200 Gilcoins", 60200, 60200, 70800, 7),
]


def seed_packages(apps, schema_editor):
    GilcoinPackage = apps.get_model("gilcoins", "GilcoinPackage")
    GilcoinPackage.objects.bulk_create(
        [
            GilcoinPackage(
                id=pid,
                name=name,
                gilcoins=gilcoins,
                price_cents=price_cents,
                compare_at_price_cents=compare_at,
                order=order,
            )
            for pid, name, gilcoins, price_cents, compare_at, order in PACKAGES
        ]
    )


def remove_packages(apps, schema_editor):
    GilcoinPackage = apps.get_model("gilcoins", "GilcoinPackage")
    GilcoinPackage.objects.filter(id__in=[p[0] for p in PACKAGES]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("gilcoins", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_packages, remove_packages),
    ]
