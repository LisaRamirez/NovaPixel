import requests
from django.conf import settings


def _base_url():
    return "https://api-m.paypal.com" if settings.PAYPAL_MODE == "live" else "https://api-m.sandbox.paypal.com"


def _get_access_token():
    response = requests.post(
        f"{_base_url()}/v1/oauth2/token",
        auth=(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_CLIENT_SECRET),
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={"grant_type": "client_credentials"},
        timeout=10,
    )
    response.raise_for_status()
    return response.json()["access_token"]


def create_order(price_cents, reference_id, return_url, cancel_url):
    token = _get_access_token()
    body = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "reference_id": reference_id,
                "amount": {"currency_code": "USD", "value": f"{price_cents / 100:.2f}"},
            }
        ],
        "application_context": {
            "return_url": return_url,
            "cancel_url": cancel_url,
            "user_action": "PAY_NOW",
        },
    }
    response = requests.post(
        f"{_base_url()}/v2/checkout/orders",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json=body,
        timeout=10,
    )
    response.raise_for_status()
    data = response.json()
    approve_url = next((link["href"] for link in data.get("links", []) if link.get("rel") == "approve"), None)
    return {"order_id": data["id"], "approve_url": approve_url}


def capture_order(order_id):
    token = _get_access_token()
    response = requests.post(
        f"{_base_url()}/v2/checkout/orders/{order_id}/capture",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        timeout=10,
    )
    if not response.ok:
        raise RuntimeError(f"PayPal capture falló ({response.status_code}): {response.text}")
    data = response.json()
    return {"completed": data.get("status") == "COMPLETED", "raw": data}
