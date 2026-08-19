from django.conf import settings
from django.db import models


class GilcoinPackage(models.Model):
    """Paquetes de GGcoins que se compran con dinero real (antes en
    server/src/gilcoinPackages.js). `id` es el slug ya conocido por el
    frontend, ej. "pack-575"."""

    id = models.SlugField(primary_key=True, max_length=32, verbose_name="ID")
    name = models.CharField(max_length=80, verbose_name="Nombre")
    gilcoins = models.PositiveIntegerField(verbose_name="GGcoins")
    price_cents = models.PositiveIntegerField(verbose_name="Precio (centavos)", help_text="Precio real en centavos de USD.")
    compare_at_price_cents = models.PositiveIntegerField(
        verbose_name="Precio anterior (centavos)",
        help_text="Precio 'antes' ficticio, solo para mostrar el descuento tachado. No afecta el cobro real.",
    )
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    order = models.PositiveIntegerField(default=0, verbose_name="Orden")

    class Meta:
        ordering = ["order"]
        verbose_name = "Paquete de GGcoins"
        verbose_name_plural = "Paquetes de GGcoins"

    def __str__(self):
        return self.name


class GilcoinPurchase(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente"
        PAID = "paid", "Pagado"

    class Provider(models.TextChoices):
        STRIPE = "stripe", "Stripe"
        PAYPAL = "paypal", "PayPal"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="gilcoin_purchases", verbose_name="Usuario"
    )
    package = models.ForeignKey(
        GilcoinPackage, on_delete=models.PROTECT, related_name="purchases", verbose_name="Paquete"
    )
    gilcoins = models.PositiveIntegerField(verbose_name="GGcoins")
    price_cents = models.PositiveIntegerField(verbose_name="Precio (centavos)")
    provider = models.CharField(max_length=10, choices=Provider.choices, verbose_name="Proveedor")
    provider_ref = models.CharField(max_length=255, unique=True, verbose_name="Referencia del proveedor")
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.PENDING, verbose_name="Estado"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creado el")
    paid_at = models.DateTimeField(null=True, blank=True, verbose_name="Pagado el")

    class Meta:
        verbose_name = "Compra de GGcoins"
        verbose_name_plural = "Compras de GGcoins"

    def __str__(self):
        return f"{self.user.username} · {self.package_id} · {self.status}"


class GilcoinTransaction(models.Model):
    class Reason(models.TextChoices):
        PACK_PURCHASE = "pack_purchase", "Compra de paquete"
        STORE_PURCHASE = "store_purchase", "Compra en tienda"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="gilcoin_transactions", verbose_name="Usuario"
    )
    delta = models.IntegerField(verbose_name="Variación", help_text="Positivo al acreditar, negativo al gastar.")
    reason = models.CharField(max_length=20, choices=Reason.choices, verbose_name="Motivo")
    reference = models.CharField(max_length=255, blank=True, null=True, verbose_name="Referencia")
    balance_after = models.PositiveIntegerField(verbose_name="Saldo resultante")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creado el")

    class Meta:
        indexes = [models.Index(fields=["user", "created_at"])]
        ordering = ["-created_at"]
        verbose_name = "Transacción de GGcoins"
        verbose_name_plural = "Transacciones de GGcoins"

    def __str__(self):
        return f"{self.user.username} · {self.delta:+d} · {self.reason}"
