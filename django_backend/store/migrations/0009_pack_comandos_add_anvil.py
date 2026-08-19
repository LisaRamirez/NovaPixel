from django.db import migrations

# Revisión del 19 ago 2026: el Pack de Comandos entrega cuatro permisos, no
# tres. Faltaba /anvil tanto en la lista de comandos como en el nombre, así
# que el producto se anunciaba con menos de lo que da.
PRODUCT_ID = "comandos-pack"

OLD_NAME = "Pack Comandos (/hat /ec /craft)"
NEW_NAME = "Pack Comandos (/anvil /hat /ec /craft)"

ANVIL = "lp user %player% permission set essentials.anvil true"


def forwards(apps, schema_editor):
    Product = apps.get_model("store", "Product")
    product = Product.objects.filter(id=PRODUCT_ID).first()
    if product is None:
        return
    product.name = NEW_NAME
    if ANVIL not in product.commands:
        # Delante, para que el orden coincida con el del nombre.
        product.commands = [ANVIL] + list(product.commands)
    product.save(update_fields=["name", "commands"])


def backwards(apps, schema_editor):
    Product = apps.get_model("store", "Product")
    product = Product.objects.filter(id=PRODUCT_ID).first()
    if product is None:
        return
    product.name = OLD_NAME
    product.commands = [c for c in product.commands if c != ANVIL]
    product.save(update_fields=["name", "commands"])


class Migration(migrations.Migration):

    dependencies = [
        ("store", "0008_alter_product_price_gilcoins"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
