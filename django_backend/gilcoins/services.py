from django.db.models import F

from .models import GilcoinTransaction

# Igual que trySpendGilcoins/creditGilcoins en server/src/db.js: el
# descuento es atómico gracias a la condición gilcoin_balance >= amount
# dentro del propio UPDATE, así que dos compras casi simultáneas nunca
# dejan el saldo negativo.


def try_spend_gilcoins(user, amount, reason, reference=None):
    from accounts.models import User

    updated = User.objects.filter(pk=user.pk, gilcoin_balance__gte=amount).update(
        gilcoin_balance=F("gilcoin_balance") - amount
    )
    if updated == 0:
        return None

    user.refresh_from_db(fields=["gilcoin_balance"])
    GilcoinTransaction.objects.create(
        user=user, delta=-amount, reason=reason, reference=reference, balance_after=user.gilcoin_balance
    )
    return user.gilcoin_balance


def credit_gilcoins(user, amount, reason, reference=None):
    from accounts.models import User

    User.objects.filter(pk=user.pk).update(gilcoin_balance=F("gilcoin_balance") + amount)
    user.refresh_from_db(fields=["gilcoin_balance"])
    GilcoinTransaction.objects.create(
        user=user, delta=amount, reason=reason, reference=reference, balance_after=user.gilcoin_balance
    )
    return user.gilcoin_balance
