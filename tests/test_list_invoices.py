import pytest
import random
import requests
import time
from requests.utils import unquote
import quopri
import re

BASE_URL = "http://localhost:5000"
MAILHOG_API = "http://localhost:8025/api/v2/messages"

def get_last_email_body():
    resp = requests.get(MAILHOG_API, timeout=5)
    resp.raise_for_status()
    data = resp.json()
    if not data["items"]:
        return None
    last_email = data["items"][0]
    body = last_email["Content"]["Body"]
    decoded = quopri.decodestring(body).decode("utf-8", errors="replace")
    return unquote(decoded)

def extract_links(decoded_html):
    matches = re.findall(r'<a\s+href=["\']([^"\']+)["\']', decoded_html, re.IGNORECASE)
    return matches[0] if matches else None

def extract_query_params(url):
    m = re.search(r"(?:[?&])token=([^&#]+)", url)
    return m.group(1) if m else None

@pytest.fixture
def user_token():
    """
    Crea un usuario temporal, espera el mail de activación en MailHog,
    activa el usuario y devuelve un token válido.
    """
    i = random.randint(1000, 999999)
    username = f"user{i}"
    email = f"{username}@test.com"
    password = "password"

    # Crear usuario (usa data si tu endpoint espera form; usa json si espera JSON)
    try:
        r = requests.post(
            f"{BASE_URL}/users",
            data={
                "username": username,
                "password": password,
                "email": email,
                "first_name": "Test",
                "last_name": "User"
            },
            timeout=5
        )
    except requests.exceptions.RequestException as e:
        pytest.fail(f"No se pudo conectar a {BASE_URL}/users: {e}")

    if r.status_code not in (200, 201):
        pytest.fail(f"Creación de usuario falló ({r.status_code}): {r.text}")

    # Esperar y buscar el mail de activación en MailHog (polling, hasta 10s)
    mail = None
    deadline = time.time() + 10
    while time.time() < deadline:
        try:
            mail = get_last_email_body()
        except Exception as e:
            # sigue intentando, pero no explota inmediatamente
            mail = None
        if mail:
            break
        time.sleep(0.5)

    if not mail:
        pytest.fail("No se recibió email de activación en MailHog dentro de 10s")

    link = extract_links(mail)
    if not link:
        pytest.fail("No se encontró link de activación en el email:\n" + mail[:400])

    token = extract_query_params(link)
    if not token:
        pytest.fail(f"No se pudo extraer token del link: {link}")

    # Activar usuario (aceptamos 200 o 204 como éxito)
    try:
        r = requests.post(
            f"{BASE_URL}/auth/set-password",
            json={"token": token, "newPassword": password},
            timeout=5
        )
    except requests.exceptions.RequestException as e:
        pytest.fail(f"No se pudo conectar a {BASE_URL}/auth/set-password: {e}")

    if r.status_code not in (200, 204):
        pytest.fail(f"Activación falló ({r.status_code}): {r.text if r.text else '<no body>'}")

    # Login y devolver token
    try:
        login = requests.post(
            f"{BASE_URL}/auth/login",
            json={"username": username, "password": password},
            timeout=5
        )
    except requests.exceptions.RequestException as e:
        pytest.fail(f"No se pudo conectar a {BASE_URL}/auth/login: {e}")

    if login.status_code != 200:
        pytest.fail(f"Login falló ({login.status_code}): {login.text}")

    token = login.json().get("token")
    if not token:
        pytest.fail(f"Login no devolvió token: {login.text}")

    return token



def test_sql_injection_is_blocked(user_token):
    headers = {"Authorization": f"Bearer {user_token}"}
    malicious_status = "paid' OR '1'='1"
    operator = "="

    response = requests.get(f"{BASE_URL}/invoices",
                            params={"operator": operator, "status": malicious_status},
                            headers=headers)
    assert response.status_code == 200
    invoices = response.json()
    assert isinstance(invoices, list)
    if len(invoices) > 0:
        user_ids = {inv["userId"] for inv in invoices}
        assert len(user_ids) == 1
