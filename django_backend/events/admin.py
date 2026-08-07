from django.contrib import admin

from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "frequency", "badge_label", "is_active", "order", "starts_at", "ends_at")
    list_filter = ("frequency", "is_active")
    search_fields = ("title", "description")
    ordering = ("order", "-created_at")
