import pytest
import requests

BASE_URL = "http://localhost:5000"

@pytest.fixture
def user_token():
    """Crea un usuario y obtiene un token válido."""
    # suponemos que ya tenés algún usuario de prueba creado
    # o si querés, acá podrías registrar uno igual que el test de ejemplo
    login_data = {"username": "user1", "password": "password"}
    resp = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    assert resp.status_code == 200
    return resp.json()["token"]

def test_sql_injection_is_blocked(user_token):
    """
    Prueba que el endpoint de invoices NO sea vulnerable a SQL injection.
    """
    headers = {"Authorization": f"Bearer {user_token}"}

    # payload malicioso probado en PoC
    malicious_status = "paid' OR '1'='1"
    operator = "="

    # en la versión vulnerable, esto devuelve *todas* las facturas
    # en la mitigada, solo debería devolver 0 o las del usuario
    response = requests.get(
        f"{BASE_URL}/invoices",
        params={"operator": operator, "status": malicious_status},
        headers=headers
    )

    assert response.status_code == 200, "El endpoint no respondió correctamente"
    invoices = response.json()

    # si hay más facturas de las que debería, es vulnerable
    assert isinstance(invoices, list), "La respuesta no es una lista"

    # chequeo básico de vulnerabilidad
    if len(invoices) > 0:
        user_ids = {inv["userId"] for inv in invoices}
        assert len(user_ids) == 1, "Posible SQL Injection: devolvió facturas de múltiples usuarios"
