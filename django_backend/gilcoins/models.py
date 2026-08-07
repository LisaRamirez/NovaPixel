from django.conf import settings
from django.db import models


class GilcoinPackage(models.Model):
    """Paquetes de Gilcoins que se compran con dinero real (antes en
    server/src/gilcoinPackages.js). `id` es el slug ya conocido por el
    frontend, ej. "pack-575"."""

    id = models.SlugField(primary_key=True, max_length=32)
    name = models.CharField(max_length=80)
    gilcoins = models.PositiveIntegerField()
    price_cents = models.PositiveIntegerField(help_text="Precio real en centavos de USD.")
    compare_at_price_cents = models.PositiveIntegerField(
        help_text="Precio 'antes' ficticio, solo para mostrar el descuento tachado. No afecta el cobro real.",
    )
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.name


class GilcoinPurchase(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente"
        PAID = "paid", "Pagado"

    class Provider(models.TextChoices):
        STRIPE = "stripe", "Stripe"
        PAYPAL = "paypal", "PayPal"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="gilcoin_purchases")
    package = models.ForeignKey(GilcoinPackage, on_delete=models.PROTECT, related_name="purchases")
    gilcoins = models.PositiveIntegerField()
    price_cents = models.PositiveIntegerField()
    provider = models.CharField(max_length=10, choices=Provider.choices)
    provider_ref = models.CharField(max_length=255, unique=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} · {self.package_id} · {self.status}"


class GilcoinTransaction(models.Model):
    class Reason(models.TextChoices):
        PACK_PURCHASE = "pack_purchase", "Compra de paquete"
        STORE_PURCHASE = "store_purchase", "Compra en tienda"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="gilcoin_transactions")
    delta = models.IntegerField(help_text="Positivo al acreditar, negativo al gastar.")
    reason = models.CharField(max_length=20, choices=Reason.choices)
    reference = models.CharField(max_length=255, blank=True, null=True)
    balance_after = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["user", "created_at"])]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} · {self.delta:+d} · {self.reason}"
