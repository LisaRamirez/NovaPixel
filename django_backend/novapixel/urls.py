from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

admin.site.site_header = "NovaPixel · Panel de Administración"
admin.site.site_title = "NovaPixel Admin"
admin.site.index_title = "Gestión de la tienda"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/store/", include("store.urls")),
    path("api/purchases/", include("store.purchases_urls")),
    path("api/gilcoins/", include("gilcoins.urls")),
    path("api/plugin/", include("pluginapi.urls")),
    path("api/events/", include("events.urls")),
    path("webhook/", include("gilcoins.webhook_urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
