from django.urls import path

from . import views

urlpatterns = [
    path("purchases/<str:nick>", views.purchases_for_nick),
    path("purchases/<int:purchase_id>/delivered", views.mark_delivered),
]
