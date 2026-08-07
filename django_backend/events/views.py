from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from .models import Event


@require_http_methods(["GET"])
def list_events(request):
    events = Event.objects.filter(is_active=True)
    payload = [
        {
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "image": request.build_absolute_uri(event.image.url) if event.image else None,
            "badgeLabel": event.badge_label,
            "frequency": event.frequency,
            "startsAt": event.starts_at.isoformat() if event.starts_at else None,
            "endsAt": event.ends_at.isoformat() if event.ends_at else None,
        }
        for event in events
    ]
    return JsonResponse({"events": payload})
