#   Prueba de seguridad (Pytest) que valida la mitigación del SQLi
#   en la funcionalidad de listar facturas (InvoiceService.list).
 
#   Objetivo:
#   - Verificar que los campos provistos por el usuario 
#     que contengan operadores SQL NO sean
#     concatenados en la consulta a la base de datos.

import pytest
import random
import time
import requests
from requests.utils import unquote
import quopri
import re

BASE_URL = "http://localhost:5000"
MAILHOG_API = "http://localhost:8025/api/v2/messages"

def get_last_email_body():
   
    resp = requests.get(MAILHOG_API, timeout=5)
    resp.raise_for_status()
    items = resp.json().get("items", [])
    if not items:
        return None
    body = items[0]["Content"]["Body"]
    decoded = quopri.decodestring(body).decode("utf-8", errors="replace")
    return unquote(decoded)

def extract_link_from_html(html):

    m = re.search(r'<a\s+href=[\'"]([^\'"]+)[\'"]', html, re.IGNORECASE)
    return m.group(1) if m else None

def extract_token_from_url(url):
    
    m = re.search(r"(?:[?&])token=([^&#'\"]+)", url)
    return m.group(1) if m else None

@pytest.fixture
def user_token():
    """
    Crea usuario temporal, espera el mail de activación en MailHog,
    activa el usuario y hace login -> devuelve JWT (Bearer token).
    """
    i = random.randint(1000, 999999)
    username = f"user{i}"
    email = f"{username}@test.com"
    password = "password"

    # crear usuario
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
    if r.status_code not in (200, 201):
        pytest.fail(f"Creación de usuario falló ({r.status_code}): {r.text}")

    # esperar email de activación
    deadline = time.time() + 15 
    mail_body = None
    while time.time() < deadline:
        try:
            mail_body = get_last_email_body()
        except Exception:
            mail_body = None
        if mail_body and (username in mail_body or email in mail_body):
            break
        time.sleep(0.5)

    if not mail_body:
        pytest.fail("No se recibió email de activación en MailHog dentro de 15s")

    #  extraer token de activación y activar
    link = extract_link_from_html(mail_body)
    if not link:
        pytest.fail("No se encontró link de activación en el email (fragmento):\n" + mail_body[:400])
    activation_token = extract_token_from_url(link)
    if not activation_token:
        pytest.fail("No se pudo extraer token de activación del link")

    r = requests.post(
        f"{BASE_URL}/auth/set-password",
        json={"token": activation_token, "newPassword": password},
        timeout=5
    )
    if r.status_code not in (200, 204):
        pytest.fail(f"Activación falló ({r.status_code}): {r.text if r.text else '<no body>'}")

    # hacer login y devolver JWT
    r = requests.post(
        f"{BASE_URL}/auth/login",
        json={"username": username, "password": password},
        timeout=5
    )
    if r.status_code != 200:
        pytest.fail(f"Login falló ({r.status_code}): {r.text}")
    jwt = r.json().get("token")
    if not jwt:
        pytest.fail(f"Login no devolvió token: {r.text}")

    return jwt




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
