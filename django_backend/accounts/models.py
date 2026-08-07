from django.contrib.auth.models import AbstractUser
from django.db import models


class StaffRole(models.TextChoices):
    """Jerarquía de staff, de menor a mayor privilegio.

    Se usa para asignar automáticamente el Group de Django correspondiente
    (ver accounts/apps.py) que controla qué puede hacer cada quien en el
    admin. "dev" es el único rol que además recibe is_superuser.
    """

    NONE = "none", "Sin rol de staff"
    HELPER = "helper", "Helper"
    MOD = "mod", "Moderador"
    ADMIN = "admin", "Administrador"
    DEV = "dev", "Desarrollador"


class User(AbstractUser):
    minecraft_nick = models.CharField(
        max_length=16,
        unique=True,
        help_text="Nick de Minecraft (Java o Bedrock) ligado a esta cuenta.",
    )
    email = models.EmailField(unique=True, blank=True, null=True)
    gilcoin_balance = models.PositiveIntegerField(default=0)
    staff_role = models.CharField(max_length=10, choices=StaffRole.choices, default=StaffRole.NONE)

    def __str__(self):
        return self.username


class PasswordResetToken(models.Model):
    token = models.CharField(max_length=64, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="password_resets")
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
