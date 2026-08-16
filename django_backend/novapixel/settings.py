"""
Django settings for the NovaPixel store backend.

Puerto Python/Django del backend Node/Express original (ver /server). La
paridad de comportamiento con ese backend se documenta en cada app; las
diferencias deliberadas (sesiones nativas de Django en vez de una tabla
`sessions` a mano, catálogo de productos en la base de datos en vez de un
archivo JS hardcodeado, etc.) están señaladas en comentarios.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "django-insecure-dev-only-change-me")
DEBUG = os.environ.get("DJANGO_DEBUG", "true").lower() == "true"
ALLOWED_HOSTS = [h.strip() for h in os.environ.get("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",") if h.strip()]

INSTALLED_APPS = [
    "daphne",  # primero: reemplaza `runserver` por uno que sirve ASGI (necesario para el WebSocket del plugin)
    "jazzmin",  # antes de django.contrib.admin: le da al admin un look moderno (sidebar, dashboard, buscador)
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "channels",
    "accounts",
    "store",
    "gilcoins",
    "pluginapi",
    "events",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "novapixel.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "novapixel.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "store.db",
    }
}

AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
]

LANGUAGE_CODE = "es"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATICFILES_DIRS = [BASE_DIR / "static"]
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Se necesita antes de JAZZMIN_SETTINGS para el link "Volver al sitio web".
SITE_URL = os.environ.get("SITE_URL", "http://localhost:8080")

# Jazzmin: tema moderno para el admin (sidebar con iconos, buscador, look
# oscuro acorde a la web). Solo cambia la UI, no el comportamiento del admin.
JAZZMIN_SETTINGS = {
    "site_title": "NovaPixel Admin",
    "site_header": "NovaPixel",
    "site_brand": "NovaPixel Admin",
    "site_logo": "admin/logo-novapixel.png",
    "login_logo": "admin/logo-novapixel.png",
    "site_logo_classes": "",
    "welcome_sign": "Panel de administración de NovaPixel",
    "copyright": "NovaPixel",
    "search_model": ["accounts.User", "store.Product", "store.Purchase", "gilcoins.GilcoinPurchase"],
    "topmenu_links": [
        {"name": "Volver al sitio web", "url": f"{SITE_URL}/index.html", "new_window": True, "icon": "fas fa-arrow-left"},
        {"name": "Panel de Gilcoins", "url": "admin:gilcoins_dashboard", "permissions": ["gilcoins.view_gilcoinpurchase"]},
    ],
    "icons": {
        "accounts.User": "fas fa-user",
        "accounts.PasswordResetToken": "fas fa-key",
        "events.Event": "fas fa-calendar-star",
        "gilcoins.GilcoinPackage": "fas fa-coins",
        "gilcoins.GilcoinPurchase": "fas fa-shopping-cart",
        "gilcoins.GilcoinTransaction": "fas fa-receipt",
        "store.Product": "fas fa-store",
        "store.Purchase": "fas fa-bag-shopping",
        "auth.Group": "fas fa-users-cog",
    },
    "order_with_respect_to": ["accounts", "store", "gilcoins", "events", "auth"],
    "hide_models": [],
    "language_chooser": False,
}

JAZZMIN_UI_TWEAKS = {
    "theme": "darkly",
    "default_theme_mode": "dark",  # sin esto el contenido central queda con fondo claro (solo navbar/sidebar quedan oscuros)
    "navbar": "navbar-dark",
    "sidebar": "sidebar-dark-primary",
    "brand_colour": "navbar-dark",
    "accent": "accent-warning",
}

# --- Config específica de NovaPixel (equivalentes a server/.env.example) ---

STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
PLUGIN_SHARED_SECRET = os.environ.get("PLUGIN_SHARED_SECRET", "")
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
RESEND_FROM_EMAIL = os.environ.get("RESEND_FROM_EMAIL", "NovaPixel <onboarding@resend.dev>")
PAYPAL_CLIENT_ID = os.environ.get("PAYPAL_CLIENT_ID", "")
PAYPAL_CLIENT_SECRET = os.environ.get("PAYPAL_CLIENT_SECRET", "")
PAYPAL_MODE = os.environ.get("PAYPAL_MODE", "sandbox")

# CORS: mismo modelo de protección que el backend Node (origin explícito +
# credentials, nunca "*" — un origin abierto con cookies sería una falla
# CSRF). Las vistas de la API usan @csrf_exempt (ver cada app) porque el
# frontend es JS estático sin plantillas de Django que inyecten
# {% csrf_token %}; la protección contra CSRF sigue siendo SameSite=Lax +
# este origin restringido, igual que en el backend original.
CORS_ALLOWED_ORIGINS = [SITE_URL]
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = [SITE_URL]

# Sesiones: se usa el framework de sesiones nativo de Django (tabla
# django_session) en vez de reimplementar una tabla `sessions` a mano como
# en el backend Node — mismo comportamiento (cookie httpOnly + expiración),
# menos código propio que mantener.
SESSION_COOKIE_NAME = "npx_session"
SESSION_COOKIE_AGE = 30 * 24 * 60 * 60  # 30 días, igual que SESSION_TTL_SECONDS en el backend Node
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "false").lower() == "true"
SESSION_SAVE_EVERY_REQUEST = False

# WebSocket del plugin (entrega en tiempo real): el checkout le avisa al
# plugin al instante en vez de esperar su sondeo periódico. InMemoryChannelLayer
# alcanza para un solo proceso/servidor — si en el futuro se corre con varios
# workers (gunicorn/daphne -w N) hay que cambiar esto por el backend de Redis
# (channels_redis), porque la memoria no se comparte entre procesos.
ASGI_APPLICATION = "novapixel.asgi.application"
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    }
}
