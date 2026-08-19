from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve

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

# Las imágenes que se suben desde el admin (eventos) viven en MEDIA_ROOT.
# `static()` sólo las sirve con DEBUG=True, así que en producción se
# enrutan explícitamente: en cPanel no hay nginx propio delante y sin esto
# los eventos quedarían sin imagen. El volumen es bajo (unas pocas fotos).
urlpatterns += [
    re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
]
