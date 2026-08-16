from django.db import models


class Product(models.Model):
    """Catálogo de la tienda, editable desde el admin (antes vivía hardcodeado
    en server/src/products.js). `id` usa el mismo slug que ya conocen
    script.js y el plugin (ej. "rango-angelical-30", "donador-vip-lv10")."""

    id = models.SlugField(primary_key=True, max_length=64, verbose_name="ID")
    name = models.CharField(max_length=120, verbose_name="Nombre")
    category = models.CharField(
        max_length=60,
        blank=True,
        verbose_name="Categoría",
        help_text="Agrupa el producto en una pestaña de la tienda, ej. 'Rangos 30 días'.",
    )
    price_gilcoins = models.PositiveIntegerField(
        verbose_name="Precio (Gilcoins)", help_text="Costo en Gilcoins (100 Gilcoins = $1 USD)."
    )
    commands = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Comandos",
        help_text='Lista de comandos de consola que ejecuta el plugin al entregar. Usa %player% como marcador del nick.',
    )
    manual_delivery = models.BooleanField(
        default=False,
        verbose_name="Entrega manual",
        help_text="Si está marcado, el plugin no ejecuta comandos: solo avisa a un admin conectado para entregarlo a mano.",
    )
    is_active = models.BooleanField(default=True, verbose_name="Activo", help_text="Si no está activo, no aparece en la tienda.")
    order = models.PositiveIntegerField(default=0, verbose_name="Orden", help_text="Orden dentro de su categoría (menor primero).")

    class Meta:
        ordering = ["category", "order", "name"]
        verbose_name = "Producto"
        verbose_name_plural = "Productos"

    def __str__(self):
        return self.name


class Purchase(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente"
        PAID = "paid", "Pagado"
        DELIVERED = "delivered", "Entregado"

    minecraft_nick = models.CharField(max_length=16, db_index=True, verbose_name="Nick de Minecraft")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="purchases", verbose_name="Producto")
    reference = models.CharField(max_length=255, unique=True, verbose_name="Referencia")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PAID, verbose_name="Estado")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creado el")
    paid_at = models.DateTimeField(null=True, blank=True, verbose_name="Pagado el")
    delivered_at = models.DateTimeField(null=True, blank=True, verbose_name="Entregado el")

    class Meta:
        indexes = [models.Index(fields=["minecraft_nick", "status"])]
        ordering = ["-created_at"]
        verbose_name = "Compra"
        verbose_name_plural = "Compras"

    def __str__(self):
        return f"{self.minecraft_nick} · {self.product_id} · {self.status}"
