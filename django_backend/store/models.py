from django.db import models


class Product(models.Model):
    """Catálogo de la tienda, editable desde el admin (antes vivía hardcodeado
    en server/src/products.js). `id` usa el mismo slug que ya conocen
    script.js y el plugin (ej. "rango-angelical-30", "donador-vip-lv10")."""

    id = models.SlugField(primary_key=True, max_length=64)
    name = models.CharField(max_length=120)
    category = models.CharField(
        max_length=60,
        blank=True,
        help_text="Agrupa el producto en una pestaña de la tienda, ej. 'Rangos 30 días'.",
    )
    price_gilcoins = models.PositiveIntegerField(help_text="Costo en Gilcoins (100 Gilcoins = $1 USD).")
    commands = models.JSONField(
        default=list,
        blank=True,
        help_text='Lista de comandos de consola que ejecuta el plugin al entregar. Usa %player% como marcador del nick.',
    )
    manual_delivery = models.BooleanField(
        default=False,
        help_text="Si está marcado, el plugin no ejecuta comandos: solo avisa a un admin conectado para entregarlo a mano.",
    )
    is_active = models.BooleanField(default=True, help_text="Si no está activo, no aparece en la tienda.")
    order = models.PositiveIntegerField(default=0, help_text="Orden dentro de su categoría (menor primero).")

    class Meta:
        ordering = ["category", "order", "name"]

    def __str__(self):
        return self.name


class Purchase(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente"
        PAID = "paid", "Pagado"
        DELIVERED = "delivered", "Entregado"

    minecraft_nick = models.CharField(max_length=16, db_index=True)
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="purchases")
    reference = models.CharField(max_length=255, unique=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PAID)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["minecraft_nick", "status"])]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.minecraft_nick} · {self.product_id} · {self.status}"
