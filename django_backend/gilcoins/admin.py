from django.contrib import admin

from .models import GilcoinPackage, GilcoinPurchase, GilcoinTransaction


@admin.register(GilcoinPackage)
class GilcoinPackageAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "gilcoins", "price_cents", "compare_at_price_cents", "is_active", "order")
    ordering = ("order",)


@admin.register(GilcoinPurchase)
class GilcoinPurchaseAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "package", "gilcoins", "provider", "status", "created_at", "paid_at")
    list_filter = ("provider", "status")
    search_fields = ("user__username", "user__minecraft_nick", "provider_ref")
    readonly_fields = ("provider_ref", "created_at")


@admin.register(GilcoinTransaction)
class GilcoinTransactionAdmin(admin.ModelAdmin):
    """Es un ledger de auditoría: se genera solo desde el código al
    acreditar/gastar Gilcoins, nunca se edita a mano desde el admin."""

    list_display = ("id", "user", "delta", "reason", "balance_after", "created_at")
    list_filter = ("reason",)
    search_fields = ("user__username", "user__minecraft_nick", "reference")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
