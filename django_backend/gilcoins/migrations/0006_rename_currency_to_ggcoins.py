from django.db import migrations


def rename_forward(apps, schema_editor):
    """La moneda pasó a llamarse GGcoins. El nombre de cada paquete se
    guarda en la base, así que cambiarlo en el código no basta: sin esto
    la tienda seguiría vendiendo «575 Gilcoins»."""
    GilcoinPackage = apps.get_model("gilcoins", "GilcoinPackage")
    for package in GilcoinPackage.objects.filter(name__contains="Gilcoin"):
        package.name = package.name.replace("Gilcoin", "GGcoin")
        package.save(update_fields=["name"])


def rename_backward(apps, schema_editor):
    GilcoinPackage = apps.get_model("gilcoins", "GilcoinPackage")
    for package in GilcoinPackage.objects.filter(name__contains="GGcoin"):
        package.name = package.name.replace("GGcoin", "Gilcoin")
        package.save(update_fields=["name"])


class Migration(migrations.Migration):

    dependencies = [
        ("gilcoins", "0005_alter_gilcoinpackage_options_and_more"),
    ]

    operations = [
        migrations.RunPython(rename_forward, rename_backward),
    ]
