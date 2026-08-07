import json

from django.http import JsonResponse


def json_body(request):
    """Los endpoints de la API son JSON puro (el frontend es JS estático,
    no hay formularios de Django) — Django no parsea el body solo, a
    diferencia de express.json() en el backend Node."""
    if not request.body:
        return {}
    try:
        data = json.loads(request.body)
    except (ValueError, TypeError):
        return {}
    return data if isinstance(data, dict) else {}


def error_response(message, status=400):
    return JsonResponse({"error": message}, status=status)
