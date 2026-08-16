from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.urls import reverse
from django.utils.html import format_html
from django.utils.http import urlencode

from gilcoins.admin import GilcoinPurchaseInline
from novapixel.admin_export import ExportMixin

from .models import PasswordResetToken, User


@admin.register(User)
class UserAdmin(ExportMixin, DjangoUserAdmin):
    list_display = ("username", "minecraft_nick", "email", "gilcoin_balance", "staff_role", "is_active")
    list_filter = ("staff_role", "is_active")
    search_fields = ("username", "minecraft_nick", "email")
    ordering = ("username",)
    inlines = [GilcoinPurchaseInline]
    export_title = "Usuarios"
    export_fields = [
        ("Usuario", "username"),
        ("Nick de Minecraft", "minecraft_nick"),
        ("Correo", "email"),
        ("Saldo de Gilcoins", "gilcoin_balance"),
        ("Rol de staff", "get_staff_role_display"),
        ("Activo", lambda o: "Sí" if o.is_active else "No"),
        ("Fecha de registro", lambda o: o.date_joined.strftime("%d/%m/%Y %H:%M") if o.date_joined else ""),
    ]

    fieldsets = DjangoUserAdmin.fieldsets + (
        ("NovaPixel", {"fields": ("minecraft_nick", "gilcoin_balance", "staff_role", "store_purchase_history")}),
    )
    add_fieldsets = DjangoUserAdmin.add_fieldsets + (
        ("NovaPixel", {"fields": ("minecraft_nick", "email", "staff_role")}),
    )
    readonly_fields = ("store_purchase_history",)

    @admin.display(description="Compras en la tienda")
    def store_purchase_history(self, obj):
        if not obj.pk:
            return "—"
        url = reverse("admin:store_purchase_changelist")
        qs = urlencode({"minecraft_nick": obj.minecraft_nick})
        return format_html('<a href="{}?{}">Ver historial de compras de {}</a>', url, qs, obj.minecraft_nick)


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ("user", "expires_at", "created_at")
    readonly_fields = ("token", "user", "expires_at", "created_at")
    search_fields = ("user__username", "user__minecraft_nick")

    def has_add_permission(self, request):
        return False
