from django.db import migrations

# Mismo catálogo que server/src/products.js, portado tal cual. category
# corresponde a las pestañas de la tienda (sidebar). order controla el
# orden dentro de cada pestaña.


def rank_commands(group, duration):
    if duration == "indefinido":
        return [f"lp user %player% parent add {group}"]
    return [f"lp user %player% parent addtemp {group} 30d accumulate"]


PRODUCTS = [
    # --- Rangos 30 días ---
    ("rango-angelical-30", "Rango Angelical · 30 días", "Rangos 30 días", 400, rank_commands("angelical", "30d"), False, 0),
    ("rango-celestial-30", "Rango Celestial · 30 días", "Rangos 30 días", 900, rank_commands("celestial", "30d"), False, 1),
    ("rango-divino-30", "Rango Divino · 30 días", "Rangos 30 días", 1600, rank_commands("divino", "30d"), False, 2),
    ("rango-donador-30", "Rango Donador · 30 días", "Rangos 30 días", 5000, rank_commands("donador", "30d"), False, 3),
    # --- Rangos indefinido ---
    ("rango-angelical-indef", "Rango Angelical · Indefinido", "Rangos Indefinido", 1500, rank_commands("angelical", "indefinido"), False, 0),
    ("rango-celestial-indef", "Rango Celestial · Indefinido", "Rangos Indefinido", 2100, rank_commands("celestial", "indefinido"), False, 1),
    ("rango-divino-indef", "Rango Divino · Indefinido", "Rangos Indefinido", 3800, rank_commands("divino", "indefinido"), False, 2),
    ("rango-donador-indef", "Rango Donador · Indefinido", "Rangos Indefinido", 15000, rank_commands("donador", "indefinido"), False, 3),
    # --- Protecciones y herramientas ---
    ("pico-3x3", "Pico 3x3", "Protecciones y Herramientas", 1500, [], True, 0),
    ("proteccion-diamante-128", "Protección Diamante 128x128", "Protecciones y Herramientas", 800, [], True, 1),
    ("proteccion-netherita-256", "Protección Netherita 256x256", "Protecciones y Herramientas", 2100, [], True, 2),
    ("proteccion-esmeralda-512", "Protección Esmeralda 512x512", "Protecciones y Herramientas", 4500, [], True, 3),
    # --- Kits ---
    ("kit-alas", "Kit de Alas", "Kits", 3500, [], True, 0),
    ("kit-samurai", "Kit Samurai", "Kits", 3200, [], True, 1),
    ("kit-angelical", "Kit Angelical", "Kits", 2000, [], True, 2),
    ("kit-bahamut", "Kit Bahamut", "Kits", 1700, [], True, 3),
    ("kit-asura", "Kit Asura", "Kits", 1700, [], True, 4),
    ("kit-sakura", "Kit Sakura", "Kits", 1500, [], True, 5),
    # --- Cosméticos ---
    ("brillo-azul", "Brillo Azul", "Cosméticos", 500, [], True, 0),
    ("brillo-agua", "Brillo Agua", "Cosméticos", 500, [], True, 1),
    ("brillo-fuego", "Brillo Fuego", "Cosméticos", 500, [], True, 2),
    ("brillo-rosado", "Brillo Rosado", "Cosméticos", 500, [], True, 3),
    ("brillo-negro", "Brillo Negro", "Cosméticos", 500, [], True, 4),
    ("tag-personalizado", "Tag Personalizado", "Cosméticos", 300, [], True, 5),
    # --- Experiencia y economía ---
    ("exp-100", "Experiencia 100 Niveles", "Experiencia y Economía", 400, ["xp add %player% 100 levels"], False, 0),
    ("exp-250", "Experiencia 250 Niveles", "Experiencia y Economía", 900, ["xp add %player% 250 levels"], False, 1),
    ("economia-50k", "50,000 de Economía", "Experiencia y Economía", 900, ["eco give %player% 50000"], False, 2),
    ("economia-100k", "100,000 de Economía", "Experiencia y Economía", 1500, ["eco give %player% 100000"], False, 3),
    # --- Comandos y vuelo ---
    ("fly-indefinido", "Fly Indefinido", "Comandos y Vuelo", 1500, ["lp user %player% permission set essentials.fly true"], False, 0),
    ("fly-30", "Fly 30 días", "Comandos y Vuelo", 800, ["lp user %player% permission settemp essentials.fly true 30d"], False, 1),
    (
        "comandos-pack",
        "Pack Comandos (/hat /ec /craft)",
        "Comandos y Vuelo",
        400,
        [
            "lp user %player% permission set essentials.hat true",
            "lp user %player% permission set essentials.enderchest true",
            "lp user %player% permission set essentials.craft true",
        ],
        False,
        2,
    ),
    # --- Spawners y construcción ---
    ("spawner-vaca", "Spawner de Vaca", "Spawners y Construcción", 300, [], True, 0),
    ("spawner-pollo", "Spawner de Pollo", "Spawners y Construcción", 300, [], True, 1),
    ("spawner-cerdo", "Spawner de Cerdo", "Spawners y Construcción", 300, [], True, 2),
    ("spawner-arana", "Spawner de Araña", "Spawners y Construcción", 500, [], True, 3),
    ("schematic-pegado", "Pegado de Schematic", "Spawners y Construcción", 1200, [], True, 4),
    # --- Donador VIP ---
    ("donador-vip-lv10", "Donador VIP LV10", "Donador VIP", 5000, ["lp user %player% parent add donador_lv10"], False, 0),
    ("donador-vip-lv14", "Donador VIP LV14", "Donador VIP", 9000, ["lp user %player% parent add donador_lv14"], False, 1),
    ("donador-vip-lv18", "Donador VIP LV18", "Donador VIP", 15000, ["lp user %player% parent add donador_lv18"], False, 2),
    ("donador-vip-lv22", "Donador VIP LV22", "Donador VIP", 25000, ["lp user %player% parent add donador_lv22"], False, 3),
]


def seed_products(apps, schema_editor):
    Product = apps.get_model("store", "Product")
    Product.objects.bulk_create(
        [
            Product(
                id=pid,
                name=name,
                category=category,
                price_gilcoins=price,
                commands=commands,
                manual_delivery=manual,
                order=order,
            )
            for pid, name, category, price, commands, manual, order in PRODUCTS
        ]
    )


def remove_products(apps, schema_editor):
    Product = apps.get_model("store", "Product")
    Product.objects.filter(id__in=[p[0] for p in PRODUCTS]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("store", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_products, remove_products),
    ]
