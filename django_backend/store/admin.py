from django.contrib import admin

from .models import Product, Purchase


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "category", "price_gilcoins", "manual_delivery", "is_active", "order")
    list_filter = ("category", "manual_delivery", "is_active")
    search_fields = ("id", "name")
    ordering = ("category", "order")


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ("id", "minecraft_nick", "product", "status", "created_at", "paid_at", "delivered_at")
    list_filter = ("status", "product__category")
    search_fields = ("minecraft_nick", "reference")
    readonly_fields = ("reference", "created_at")
    date_hierarchy = "created_at"
