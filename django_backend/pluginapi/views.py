import hmac

from django.conf import settings
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from store.models import Purchase


def _plugin_secret_ok(request):
    # hmac.compare_digest ya compara en tiempo constante y maneja largos
    # distintos de forma segura sola — no hace falta el truco de "comparar
    # contra sí mismo" que usa timingSafeEqualStrings en el backend Node.
    provided = request.headers.get("X-Plugin-Secret", "")
    return hmac.compare_digest(provided, settings.PLUGIN_SHARED_SECRET)


@csrf_exempt
@require_http_methods(["GET"])
def purchases_for_nick(request, nick):
    if not _plugin_secret_ok(request):
        return JsonResponse({"error": "No autorizado."}, status=401)

    rows = (
        Purchase.objects.filter(minecraft_nick__iexact=nick, status=Purchase.Status.PAID)
        .select_related("product")
        .order_by("paid_at")
    )
    purchases = [
        {
            "id": row.id,
            "productId": row.product_id,
            "productName": row.product.name,
            "commands": row.product.commands,
            "manual": row.product.manual_delivery,
        }
        for row in rows
    ]
    return JsonResponse({"purchases": purchases})


@csrf_exempt
@require_http_methods(["POST"])
def mark_delivered(request, purchase_id):
    if not _plugin_secret_ok(request):
        return JsonResponse({"error": "No autorizado."}, status=401)

    updated = Purchase.objects.filter(pk=purchase_id, status=Purchase.Status.PAID).update(
        status=Purchase.Status.DELIVERED, delivered_at=timezone.now()
    )
    if updated == 0:
        return JsonResponse({"error": "Compra no encontrada o ya entregada."}, status=404)
    return JsonResponse({"ok": True})
