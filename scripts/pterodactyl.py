"""
Cliente mínimo de la API Client de Pterodactyl (panel de TaroHosting) para
desplegar el plugin de NovaPixel en el servidor de Minecraft remoto.

Lee PTERODACTYL_URL / PTERODACTYL_API_KEY / PTERODACTYL_SERVER_ID desde
django_backend/.env. Uso:

    python scripts/pterodactyl.py status
    python scripts/pterodactyl.py list [directorio]
    python scripts/pterodactyl.py upload <archivo_local> [directorio_remoto]
    python scripts/pterodactyl.py command "<comando de consola>"
    python scripts/pterodactyl.py power <start|stop|restart|kill>
"""

import sys
from pathlib import Path

import requests
from dotenv import dotenv_values

ENV = dotenv_values(Path(__file__).resolve().parent.parent / "django_backend" / ".env")
BASE_URL = ENV["PTERODACTYL_URL"].rstrip("/")
API_KEY = ENV["PTERODACTYL_API_KEY"]
SERVER_ID = ENV["PTERODACTYL_SERVER_ID"]

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Accept": "application/json",
}


def api(method, path, **kwargs):
    resp = requests.request(method, f"{BASE_URL}/api/client/servers/{SERVER_ID}{path}", headers=HEADERS, **kwargs)
    resp.raise_for_status()
    return resp


def status():
    data = api("GET", "/resources").json()["attributes"]
    print("Estado:", data["current_state"])
    print("Uso:", data["resources"])


def list_files(directory="/"):
    data = api("GET", "/files/list", params={"directory": directory}).json()["data"]
    for entry in data:
        attrs = entry["attributes"]
        kind = "DIR" if attrs["is_file"] is False else "FILE"
        print(f"{kind:5} {attrs['name']}")


def upload(local_path, remote_directory="/plugins"):
    signed = api("GET", "/files/upload").json()["attributes"]["url"]
    with open(local_path, "rb") as fh:
        resp = requests.post(
            signed,
            params={"directory": remote_directory},
            files={"files": (Path(local_path).name, fh, "application/java-archive")},
        )
        resp.raise_for_status()
    print(f"Subido {local_path} -> {remote_directory}/{Path(local_path).name}")


def command(cmd):
    api("POST", "/command", json={"command": cmd})
    print("Comando enviado:", cmd)


def power(signal):
    assert signal in ("start", "stop", "restart", "kill")
    api("POST", "/power", json={"signal": signal})
    print("Señal de energía enviada:", signal)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    action = sys.argv[1]
    args = sys.argv[2:]

    if action == "status":
        status()
    elif action == "list":
        list_files(args[0] if args else "/")
    elif action == "upload":
        upload(args[0], args[1] if len(args) > 1 else "/plugins")
    elif action == "command":
        command(args[0])
    elif action == "power":
        power(args[0])
    else:
        print(__doc__)
        sys.exit(1)
