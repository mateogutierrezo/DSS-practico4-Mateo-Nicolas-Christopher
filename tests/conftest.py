# tests/conftest.py
import pytest
import random
import requests
from requests.utils import unquote
import quopri
import re
import time

MAILHOG_API = "http://localhost:8025/api/v2/messages"

def get_last_email_body(retries: int = 10, wait: float = 0.3):
    """
    Consulta MailHog y devuelve el body del último email (decodificado).
    Hace varios reintentos porque a veces el envío tarda un poco.
    """
    for _ in range(retries):
        resp = requests.get(MAILHOG_API)
        resp.raise_for_status()
        data = resp.json()
        if data.get("items"):
            last_email = data["items"][0]
            body = last_email["Content"]["Body"]
            decoded = quopri.decodestring(body).decode("utf-8", errors="replace")
            return unquote(decoded)
        time.sleep(wait)
    return None

def extract_links(decoded_html):
    """Extrae el primer href encontrado en el HTML del email."""
    found = re.findall(r'<a\s+href=["\']([^"\']+)["\']', decoded_html, re.IGNORECASE)
    return found[0] if found else None

def extract_query_params(url):
    """Extrae el parámetro 'token' de una URL."""
    patron = re.compile(r"(?:[?&])token=([^&#]+)")
    m = patron.search(url)
    return m.group(1) if m else None

@pytest.fixture(scope="function", autouse=True)
def setup_create_user():
    """
    Fixture que crea un usuario real vía API y lo activa con MailHog.
    Autouse=True para replicar el comportamiento que tenías: se ejecuta antes de cada test.
    Devuelve [username, password].
    """
    i = random.randint(1000, 999999)
    username = f"user{i}"
    email = f"{username}@test.com"
    password = "password"

    salida = requests.post(
        "http://localhost:5000/users",
        data={
            "username": username,
            "password": password,
            "email": email,
            "first_name": "Name",
            "last_name": f"{username}son",
        },
        timeout=5,
    )

    assert salida.status_code == 201, f"Creación de usuario falló: {salida.status_code} {salida.text}"

    mail = get_last_email_body()
    assert mail, "No se recibió email de activación en MailHog (http://localhost:8025)."
    link = extract_links(mail)
    assert link, "No se encontró link de activación en el email."
    token = extract_query_params(link)
    assert token, f"No se pudo extraer token del link: {link}"

    response = requests.post(
        "http://localhost:5000/auth/set-password", json={"token": token, "newPassword": password}, timeout=5
    )
    assert response.status_code in (200, 204), f"Activación fallida: {response.status_code} {response.text}"

    return [username, password]