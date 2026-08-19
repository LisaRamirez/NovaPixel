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
        verbose_name="Nick de Minecraft",
        help_text="Nick de Minecraft (Java o Bedrock) ligado a esta cuenta.",
    )
    email = models.EmailField(unique=True, blank=True, null=True, verbose_name="Correo electrónico")
    gilcoin_balance = models.PositiveIntegerField(default=0, verbose_name="Saldo de GGcoins")
    staff_role = models.CharField(
        max_length=10, choices=StaffRole.choices, default=StaffRole.NONE, verbose_name="Rol de staff"
    )

    class Meta(AbstractUser.Meta):
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"

    def __str__(self):
        return self.username


class PasswordResetToken(models.Model):
    token = models.CharField(max_length=64, primary_key=True, verbose_name="Token")
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="password_resets", verbose_name="Usuario"
    )
    expires_at = models.DateTimeField(verbose_name="Expira el")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creado el")

    class Meta:
        verbose_name = "Token de restablecimiento de contraseña"
        verbose_name_plural = "Tokens de restablecimiento de contraseña"
