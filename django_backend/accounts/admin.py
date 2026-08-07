from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import PasswordResetToken, User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ("username", "minecraft_nick", "email", "gilcoin_balance", "staff_role", "is_active")
    list_filter = ("staff_role", "is_active")
    search_fields = ("username", "minecraft_nick", "email")
    ordering = ("username",)

    fieldsets = DjangoUserAdmin.fieldsets + (
        ("NovaPixel", {"fields": ("minecraft_nick", "gilcoin_balance", "staff_role")}),
    )
    add_fieldsets = DjangoUserAdmin.add_fieldsets + (
        ("NovaPixel", {"fields": ("minecraft_nick", "email", "staff_role")}),
    )


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ("user", "expires_at", "created_at")
    readonly_fields = ("token", "user", "expires_at", "created_at")
    search_fields = ("user__username", "user__minecraft_nick")

    def has_add_permission(self, request):
        return False
