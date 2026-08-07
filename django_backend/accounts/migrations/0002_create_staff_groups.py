from django.db import migrations

# Permisos por rol de staff, como (app_label, model, [acciones]).
# "dev" no está acá: ese rol se maneja aparte como superusuario (ve TODO
# el admin sin restricciones, incluida la gestión de otros usuarios/staff).
GROUP_PERMISSIONS = {
    "Admin": [
        ("store", "product", ["add", "change", "delete", "view"]),
        ("store", "purchase", ["add", "change", "delete", "view"]),
        ("gilcoins", "gilcoinpackage", ["add", "change", "delete", "view"]),
        ("gilcoins", "gilcoinpurchase", ["view", "change"]),
        ("gilcoins", "gilcointransaction", ["view"]),
        ("events", "event", ["add", "change", "delete", "view"]),
        ("accounts", "user", ["add", "change", "view"]),  # sin delete: evita borrar cuentas por accidente
        ("accounts", "passwordresettoken", ["view"]),
    ],
    "Mod": [
        ("store", "purchase", ["view", "change"]),  # ej. para marcar entregas manuales
        ("gilcoins", "gilcoinpurchase", ["view"]),
        ("events", "event", ["add", "change", "view"]),
        ("accounts", "user", ["view"]),
    ],
    "Helper": [
        ("store", "purchase", ["view"]),
        ("events", "event", ["add", "change", "view"]),
    ],
}


def create_groups(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    Permission = apps.get_model("auth", "Permission")
    ContentType = apps.get_model("contenttypes", "ContentType")

    for group_name, entries in GROUP_PERMISSIONS.items():
        group, _ = Group.objects.get_or_create(name=group_name)
        perms = []
        for app_label, model_name, actions in entries:
            try:
                ct = ContentType.objects.get(app_label=app_label, model=model_name)
            except ContentType.DoesNotExist:
                continue
            for action in actions:
                try:
                    perms.append(Permission.objects.get(content_type=ct, codename=f"{action}_{model_name}"))
                except Permission.DoesNotExist:
                    continue
        group.permissions.set(perms)


def delete_groups(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    Group.objects.filter(name__in=GROUP_PERMISSIONS.keys()).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0001_initial"),
        ("store", "0001_initial"),
        ("gilcoins", "0001_initial"),
        ("events", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_groups, delete_groups),
    ]
