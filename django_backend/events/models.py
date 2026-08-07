from django.db import models


class Event(models.Model):
    """Eventos del servidor, administrables desde el admin para que el staff
    pueda actualizar la web sin tocar código. Reemplaza las event-card
    hardcodeadas que antes vivían directo en index.html."""

    class Frequency(models.TextChoices):
        ONE_TIME = "one_time", "Única vez"
        DAILY = "daily", "Diario"
        WEEKLY = "weekly", "Semanal"
        MONTHLY = "monthly", "Mensual"

    title = models.CharField(max_length=120)
    description = models.TextField(help_text="Qué deben hacer los jugadores en este evento.")
    image = models.ImageField(upload_to="events/", blank=True, null=True)
    badge_label = models.CharField(
        max_length=40,
        default="Evento",
        help_text="Texto de la etiqueta sobre la imagen, ej. 'Evento Activo', 'Novedad'.",
    )
    frequency = models.CharField(max_length=10, choices=Frequency.choices, default=Frequency.ONE_TIME)
    is_active = models.BooleanField(default=True, help_text="Solo los eventos activos se muestran en el sitio.")
    starts_at = models.DateTimeField(blank=True, null=True)
    ends_at = models.DateTimeField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0, help_text="Orden en la web (menor primero).")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "-created_at"]

    def __str__(self):
        return self.title
