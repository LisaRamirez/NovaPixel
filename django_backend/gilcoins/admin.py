from django.contrib import admin
from django.db.models import Count, Sum
from django.template.response import TemplateResponse
from django.urls import path
from django.utils.html import format_html

from novapixel.admin_export import ExportMixin

from .models import GilcoinPackage, GilcoinPurchase, GilcoinTransaction

GILCOIN_STATUS_COLORS = {
    GilcoinPurchase.Status.PENDING: "#ffd23f",
    GilcoinPurchase.Status.PAID: "#4caf50",
}


class GilcoinPurchaseInline(admin.TabularInline):
    """Historial de compras de GGcoins de la cuenta, visible directamente
    desde su ficha en accounts.UserAdmin. Solo lectura: las compras se crean
    desde el checkout, no a mano."""

    model = GilcoinPurchase
    fk_name = "user"
    extra = 0
    can_delete = False
    fields = ("package", "gilcoins", "price_cents", "provider", "status", "created_at", "paid_at")
    readonly_fields = fields
    ordering = ("-created_at",)

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(GilcoinPackage)
class GilcoinPackageAdmin(ExportMixin, admin.ModelAdmin):
    list_display = ("id", "name", "gilcoins", "price_cents", "compare_at_price_cents", "is_active", "order")
    ordering = ("order",)
    export_title = "Paquetes de GGcoins"
    export_fields = [
        ("ID", "id"),
        ("Nombre", "name"),
        ("GGcoins", "gilcoins"),
        ("Precio (USD)", lambda o: f"{o.price_cents / 100:.2f}"),
        ("Activo", lambda o: "Sí" if o.is_active else "No"),
    ]


@admin.register(GilcoinPurchase)
class GilcoinPurchaseAdmin(ExportMixin, admin.ModelAdmin):
    list_display = ("id", "user", "package", "gilcoins", "provider", "status_badge", "created_at", "paid_date")
    list_filter = ("provider", "status")
    search_fields = ("user__username", "user__minecraft_nick", "provider_ref")
    readonly_fields = ("provider_ref", "created_at")
    change_list_template = "admin/gilcoins/gilcoinpurchase_change_list.html"
    export_title = "Compras de GGcoins"
    export_fields = [
        ("ID", "id"),
        ("Usuario", "user.username"),
        ("Nick de Minecraft", "user.minecraft_nick"),
        ("Paquete", "package.name"),
        ("GGcoins", "gilcoins"),
        ("Precio (USD)", lambda o: f"{o.price_cents / 100:.2f}"),
        ("Proveedor", "get_provider_display"),
        ("Estado", "get_status_display"),
        ("Creado", lambda o: o.created_at.strftime("%d/%m/%Y %H:%M")),
        ("Pagado", lambda o: o.paid_at.strftime("%d/%m/%Y %H:%M") if o.paid_at else ""),
    ]

    @admin.display(description="Estado", ordering="status")
    def status_badge(self, obj):
        color = GILCOIN_STATUS_COLORS.get(obj.status, "#b8aed1")
        return format_html(
            '<span style="color:{}; font-weight:700;">● {}</span>', color, obj.get_status_display()
        )

    @admin.display(description="Pagado el", ordering="paid_at")
    def paid_date(self, obj):
        if obj.paid_at:
            return format_html('<span style="color:#4caf50;">{}</span>', obj.paid_at.strftime("%d/%m/%Y %H:%M"))
        return format_html('<span style="color:#7a7286;">{}</span>', "— pendiente —")

    def get_urls(self):
        return [
            path("dashboard/", self.admin_site.admin_view(self.dashboard_view), name="gilcoins_dashboard"),
        ] + super().get_urls()

    def dashboard_view(self, request):
        """Métricas de GGcoins: cuánta gente compró, cuánto se recaudó en
        total y el detalle por cuenta, con acceso directo al historial de
        cada una (compras de GGcoins y compras en la tienda)."""
        paid = GilcoinPurchase.objects.filter(status=GilcoinPurchase.Status.PAID)

        totals = paid.aggregate(
            total_purchases=Count("id"),
            total_gilcoins=Sum("gilcoins"),
            total_revenue_cents=Sum("price_cents"),
        )
        unique_buyers = paid.values("user_id").distinct().count()

        buyers = (
            paid.values("user_id", "user__username", "user__minecraft_nick")
            .annotate(
                purchase_count=Count("id"),
                total_gilcoins=Sum("gilcoins"),
                total_spent_cents=Sum("price_cents"),
            )
            .order_by("-total_spent_cents")
        )

        context = {
            **self.admin_site.each_context(request),
            "title": "Panel de GGcoins",
            "total_purchases": totals["total_purchases"] or 0,
            "total_gilcoins": totals["total_gilcoins"] or 0,
            "total_revenue": (totals["total_revenue_cents"] or 0) / 100,
            "unique_buyers": unique_buyers,
            "buyers": [
                {
                    "user_id": b["user_id"],
                    "username": b["user__username"],
                    "minecraft_nick": b["user__minecraft_nick"],
                    "purchase_count": b["purchase_count"],
                    "total_gilcoins": b["total_gilcoins"],
                    "total_spent": b["total_spent_cents"] / 100,
                }
                for b in buyers
            ],
            "opts": self.model._meta,
        }
        return TemplateResponse(request, "admin/gilcoins/dashboard.html", context)


@admin.register(GilcoinTransaction)
class GilcoinTransactionAdmin(admin.ModelAdmin):
    """Es un ledger de auditoría: se genera solo desde el código al
    acreditar/gastar GGcoins, nunca se edita a mano desde el admin."""

    list_display = ("id", "user", "delta", "reason", "balance_after", "created_at")
    list_filter = ("reason",)
    search_fields = ("user__username", "user__minecraft_nick", "reference")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
