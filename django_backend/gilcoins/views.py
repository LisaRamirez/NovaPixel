import stripe
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from novapixel.http_utils import error_response, json_body

from . import paypal
from .models import GilcoinPackage, GilcoinPurchase
from .services import credit_gilcoins

stripe.api_key = settings.STRIPE_SECRET_KEY


def _mark_gilcoin_purchase_paid_and_credit(provider_ref):
    """Igual que markGilcoinPurchasePaidAndCredit en server/src/db.js:
    idempotente — si ya estaba 'paid' (reintento de webhook o de retorno de
    PayPal) no vuelve a acreditar, devuelve None."""
    purchase = GilcoinPurchase.objects.filter(provider_ref=provider_ref).first()
    if purchase is None or purchase.status != GilcoinPurchase.Status.PENDING:
        return None

    purchase.status = GilcoinPurchase.Status.PAID
    purchase.paid_at = timezone.now()
    purchase.save(update_fields=["status", "paid_at"])

    return credit_gilcoins(purchase.user, purchase.gilcoins, "pack_purchase", purchase.package_id)


@csrf_exempt
@require_http_methods(["POST"])
def checkout_stripe(request):
    if not request.user.is_authenticated:
        return error_response("Debes iniciar sesión.", status=401)

    package = GilcoinPackage.objects.filter(pk=json_body(request).get("packageId"), is_active=True).first()
    if package is None:
        return error_response("Paquete no válido.")

    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {"name": f"{package.name} ({package.gilcoins} GGcoins)"},
                        "unit_amount": package.price_cents,
                    },
                    "quantity": 1,
                }
            ],
            metadata={"packageId": package.id, "userId": str(request.user.id)},
            success_url=f"{settings.SITE_URL}/tienda.html?gilcoins=exito",
            cancel_url=f"{settings.SITE_URL}/tienda.html?gilcoins=cancelado",
        )
    except Exception:
        return error_response("No se pudo iniciar el pago.", status=500)

    GilcoinPurchase.objects.create(
        user=request.user,
        package=package,
        gilcoins=package.gilcoins,
        price_cents=package.price_cents,
        provider=GilcoinPurchase.Provider.STRIPE,
        provider_ref=session.id,
    )
    return JsonResponse({"url": session.url})


@csrf_exempt
@require_http_methods(["POST"])
def checkout_paypal(request):
    if not request.user.is_authenticated:
        return error_response("Debes iniciar sesión.", status=401)

    package = GilcoinPackage.objects.filter(pk=json_body(request).get("packageId"), is_active=True).first()
    if package is None:
        return error_response("Paquete no válido.")

    try:
        result = paypal.create_order(
            price_cents=package.price_cents,
            reference_id=package.id,
            return_url=f"{settings.SITE_URL}/gilcoins-callback.html",
            cancel_url=f"{settings.SITE_URL}/tienda.html?gilcoins=cancelado",
        )
    except Exception:
        return error_response("No se pudo iniciar el pago con PayPal.", status=500)

    GilcoinPurchase.objects.create(
        user=request.user,
        package=package,
        gilcoins=package.gilcoins,
        price_cents=package.price_cents,
        provider=GilcoinPurchase.Provider.PAYPAL,
        provider_ref=result["order_id"],
    )
    return JsonResponse({"url": result["approve_url"]})


@csrf_exempt
@require_http_methods(["POST"])
def paypal_capture(request):
    if not request.user.is_authenticated:
        return error_response("Debes iniciar sesión.", status=401)

    order_id = json_body(request).get("orderId")
    if not isinstance(order_id, str) or not order_id:
        return error_response("Falta el id de la orden.")

    # Verifica que la orden pendiente sea del usuario logueado ANTES de
    # capturarla — evita que alguien fuerce la captura de la orden de otra
    # persona adivinando/copiando el orderId (IDOR).
    pending = GilcoinPurchase.objects.filter(provider_ref=order_id).first()
    if pending is None or pending.user_id != request.user.id:
        return error_response("Orden no encontrada.", status=404)

    try:
        result = paypal.capture_order(order_id)
    except Exception:
        return error_response("No se pudo confirmar el pago.", status=500)

    if not result["completed"]:
        return error_response("El pago no se completó.")

    new_balance = _mark_gilcoin_purchase_paid_and_credit(order_id)
    if new_balance is None:
        request.user.refresh_from_db(fields=["gilcoin_balance"])
        new_balance = request.user.gilcoin_balance

    return JsonResponse({"ok": True, "gilcoinBalance": new_balance})


@csrf_exempt
@require_http_methods(["POST"])
def stripe_webhook(request):
    signature = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(request.body, signature, settings.STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.SignatureVerificationError) as exc:
        return HttpResponse(f"Webhook Error: {exc}", status=400)

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        if session.get("payment_status") != "paid":
            # métodos de pago async (OXXO, transferencia bancaria) — no se
            # acredita todavía, Stripe reenviará el evento cuando se pague.
            return JsonResponse({"received": True})
        _mark_gilcoin_purchase_paid_and_credit(session["id"])

    return JsonResponse({"received": True})
