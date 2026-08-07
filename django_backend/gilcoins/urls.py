from django.urls import path

from . import views

urlpatterns = [
    path("checkout/stripe", views.checkout_stripe),
    path("checkout/paypal", views.checkout_paypal),
    path("paypal/capture", views.paypal_capture),
]
