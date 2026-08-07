from django.contrib.auth.models import Group
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import StaffRole, User

# Nombre del Group de Django que corresponde a cada staff_role. "dev" no
# tiene grupo: se maneja aparte como superusuario (ver abajo).
ROLE_GROUP_NAMES = {
    StaffRole.ADMIN: "Admin",
    StaffRole.MOD: "Mod",
    StaffRole.HELPER: "Helper",
}


@receiver(post_save, sender=User)
def sync_staff_role(sender, instance, **kwargs):
    """Mantiene is_staff / is_superuser / membresía de Group en sincronía
    con el campo staff_role, para que asignar un rol desde el admin sea
    suficiente — no hace falta tocar permisos a mano aparte."""
    all_role_groups = Group.objects.filter(name__in=ROLE_GROUP_NAMES.values())
    target_group_name = ROLE_GROUP_NAMES.get(instance.staff_role)

    desired_is_staff = instance.staff_role != StaffRole.NONE
    desired_is_superuser = instance.staff_role == StaffRole.DEV

    needs_update = instance.is_staff != desired_is_staff or instance.is_superuser != desired_is_superuser
    if needs_update:
        User.objects.filter(pk=instance.pk).update(is_staff=desired_is_staff, is_superuser=desired_is_superuser)
        instance.is_staff = desired_is_staff
        instance.is_superuser = desired_is_superuser

    instance.groups.remove(*all_role_groups)
    if target_group_name:
        group = all_role_groups.filter(name=target_group_name).first()
        if group:
            instance.groups.add(group)
