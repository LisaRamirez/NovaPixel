from django.contrib import admin
from django.utils.html import format_html

from novapixel.admin_export import ExportMixin

from .models import Product, Purchase

STATUS_COLORS = {
    Purchase.Status.PENDING: "#ffd23f",
    Purchase.Status.PAID: "#3fc7b0",
    Purchase.Status.DELIVERED: "#4caf50",
}


def _fmt_dt(dt):
    return dt.strftime("%d/%m/%Y %H:%M") if dt else ""


@admin.register(Product)
class ProductAdmin(ExportMixin, admin.ModelAdmin):
    list_display = ("id", "name", "category", "price_gilcoins", "manual_delivery", "is_active", "order")
    list_filter = ("category", "manual_delivery", "is_active")
    search_fields = ("id", "name")
    ordering = ("category", "order")
    export_title = "Productos"
    export_fields = [
        ("ID", "id"),
        ("Nombre", "name"),
        ("Categoría", "category"),
        ("Precio (Gilcoins)", "price_gilcoins"),
        ("Entrega manual", lambda o: "Sí" if o.manual_delivery else "No"),
        ("Activo", lambda o: "Sí" if o.is_active else "No"),
    ]


@admin.register(Purchase)
class PurchaseAdmin(ExportMixin, admin.ModelAdmin):
    list_display = ("id", "minecraft_nick", "product", "status_badge", "created_at", "paid_at", "delivery_date")
    export_title = "Compras"
    export_fields = [
        ("ID", "id"),
        ("Nick de Minecraft", "minecraft_nick"),
        ("Producto", "product.name"),
        ("Estado", "get_status_display"),
        ("Creado", lambda o: _fmt_dt(o.created_at)),
        ("Pagado", lambda o: _fmt_dt(o.paid_at)),
        ("Entregado", lambda o: _fmt_dt(o.delivered_at)),
    ]
    list_filter = ("status", "product__category")
    search_fields = ("minecraft_nick", "reference")
    readonly_fields = ("reference", "created_at")
    date_hierarchy = "created_at"

    @admin.display(description="Estado", ordering="status")
    def status_badge(self, obj):
        color = STATUS_COLORS.get(obj.status, "#b8aed1")
        return format_html(
            '<span style="color:{}; font-weight:700;">● {}</span>', color, obj.get_status_display()
        )

    @admin.display(description="Entregado el", ordering="delivered_at")
    def delivery_date(self, obj):
        if obj.delivered_at:
            return format_html('<span style="color:#4caf50;">{}</span>', obj.delivered_at.strftime("%d/%m/%Y %H:%M"))
        return format_html('<span style="color:#7a7286;">{}</span>', "— sin entregar —")
