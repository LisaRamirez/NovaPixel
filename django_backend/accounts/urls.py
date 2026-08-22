from django.urls import path

from . import views

urlpatterns = [
    path("register", views.register),
    path("login", views.login_view),
    path("logout", views.logout_view),
    path("me", views.me),
    path("forgot-password", views.forgot_password),
    path("reset-password", views.reset_password),
    # Inicio de sesión con Google. "callback" tiene que coincidir con la URI
    # de redireccionamiento dada de alta en la consola de Google.
    path("google/start", views.google_start),
    path("google/callback", views.google_callback),
    path("google/pending", views.google_pending),
    path("google/complete", views.google_complete),
]
