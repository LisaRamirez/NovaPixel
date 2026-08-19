import secrets

from django.db import transaction
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from gilcoins.services import try_spend_gilcoins
from novapixel.http_utils import error_response, json_body

from .models import Product, Purchase

MAX_CART_LINES = 50
MAX_QTY_PER_ITEM = 20


@csrf_exempt
@require_http_methods(["POST"])
def checkout(request):
    if not request.user.is_authenticated:
        return error_response("Debes iniciar sesión.", status=401)

    data = json_body(request)
    items = data.get("items")

    if not isinstance(items, list) or len(items) == 0:
        return error_response("El carrito está vacío.")
    if len(items) > MAX_CART_LINES:
        return error_response("Demasiados productos distintos en el carrito.")

    validated_items = []
    total_gilcoins = 0
    products_by_id = {}

    for raw_item in items:
        if not isinstance(raw_item, dict):
            return error_response("Producto no válido.")

        product_id = raw_item.get("productId")
        quantity = raw_item.get("quantity")

        product = products_by_id.get(product_id)
        if product is None:
            product = Product.objects.filter(pk=product_id, is_active=True).first()
            if product is None:
                return error_response("Producto no válido.")
            products_by_id[product_id] = product

        if not isinstance(quantity, int) or isinstance(quantity, bool) or not (1 <= quantity <= MAX_QTY_PER_ITEM):
            return error_response("Cantidad inválida.")

        total_gilcoins += product.price_gilcoins * quantity
        validated_items.append((product, quantity))

    reference = f"gilcoin:{secrets.token_hex(8)}"
    new_balance = try_spend_gilcoins(request.user, total_gilcoins, "store_purchase", reference)
    if new_balance is None:
        return error_response("Saldo de GGcoins insuficiente.")

    now = timezone.now()
    purchases = []
    with transaction.atomic():
        for product, quantity in validated_items:
            for _ in range(quantity):
                purchases.append(
                    Purchase(
                        minecraft_nick=request.user.minecraft_nick,
                        product=product,
                        reference=f"{reference}-{len(purchases)}",
                        status=Purchase.Status.PAID,
                        paid_at=now,
                    )
                )
        Purchase.objects.bulk_create(purchases)

    try:
        from pluginapi.realtime import notify_purchase

        notify_purchase(request.user.minecraft_nick)
    except Exception:
        pass  # la entrega en tiempo real es una optimización; el plugin igual la agarra por sondeo

    return JsonResponse({"ok": True, "gilcoinBalance": new_balance})


@require_http_methods(["GET"])
def purchases_me(request):
    if not request.user.is_authenticated:
        return error_response("Debes iniciar sesión.", status=401)

    rows = Purchase.objects.filter(minecraft_nick__iexact=request.user.minecraft_nick).select_related("product")
    purchases = [
        {
            "id": row.id,
            "productName": row.product.name if row.product_id else row.product_id,
            "status": row.status,
            "createdAt": row.created_at.isoformat(),
            "paidAt": row.paid_at.isoformat() if row.paid_at else None,
            "deliveredAt": row.delivered_at.isoformat() if row.delivered_at else None,
        }
        for row in rows
    ]
    return JsonResponse({"purchases": purchases})
