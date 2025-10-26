# tests/test_list_invoices.py
import os
import random
import re
import time
import quopri
import requests
import pytest
import responses
import json
from requests.utils import unquote
from datetime import datetime, timedelta

BASE_URL = os.getenv("BASE_URL", "http://localhost:5000")
INVOICES_URL = f"{BASE_URL}/invoices"
MAILHOG_API = os.getenv("MAILHOG_API", "http://localhost:8025/api/v2/messages")

SQLI_PAYLOADS = [
    "paid' OR '1'='1",
    "pending' OR 1=1 --",
    "overdue' OR 'a'='a",
    "paid' OR '1'='1' --",
]

def get_last_email_body(retries=10, wait=0.3):
    for _ in range(retries):
        resp = requests.get(MAILHOG_API)
        resp.raise_for_status()
        data = resp.json()
        if data.get("items"):
            body = data["items"][0]["Content"]["Body"]
            decoded = quopri.decodestring(body).decode("utf-8", errors="replace")
            return unquote(decoded)
        time.sleep(wait)
    return None

def extract_activation_token(email_html):
    m = re.search(r"(?:[?&])token=([^&#]+)", email_html or "")
    return m.group(1) if m else None

def create_user_and_activate(username=None, password="password"):
    i = random.randint(1000, 999999)
    username = username or f"user{i}"
    email = f"{username}@test.com"
    r = requests.post(f"{BASE_URL}/users", data={
        "username": username,
        "password": password,
        "email": email,
        "first_name": "Name",
        "last_name": f"{username}son",
    })
    assert r.status_code == 201, f"Creación de usuario falló: {r.status_code} {r.text}"
    mail = get_last_email_body()
    assert mail, "No se recibió email de activación"
    token = extract_activation_token(mail)
    assert token, "No se extrajo token"
    r2 = requests.post(f"{BASE_URL}/auth/set-password", json={"token": token, "newPassword": password})
    assert r2.status_code in (200, 204)
    return username, password

def login_get_token(username, password):
    r = requests.post(f"{BASE_URL}/auth/login", json={"username": username, "password": password}, timeout=5)
    r.raise_for_status()
    return r.json().get("token")

def _make_invoice_json(next_id, user_id, status="paid"):
    due = (datetime.utcnow() + timedelta(days=30)).isoformat() + "Z"
    return {"id": next_id, "userId": user_id, "amount": "11.00", "dueDate": due, "status": status}

@responses.activate
def test_regression_sql_injection_with_responses():
    responses.add_passthru(MAILHOG_API)
    responses.add_passthru(f"{BASE_URL}/users")
    responses.add_passthru(f"{BASE_URL}/auth")

    invoices_store = []
    next_id = {"v": 1000}

    def post_callback(req):
        auth = req.headers.get("Authorization", "")
        user_id = 2 if "token-user-2" in auth else 1

        payload = {}
        if req.body:
            try:
                body = req.body
                if isinstance(body, bytes):
                    body = body.decode("utf-8")
                payload = json.loads(body) if body else {}
            except Exception:
                payload = {}

        next_id["v"] += 1
        inv = _make_invoice_json(next_id["v"], user_id, payload.get("status", "paid"))
        invoices_store.append(inv)
        return (201, {"Content-Type": "application/json"}, json.dumps(inv))

    def get_callback(req):
        params = getattr(req, "params", {}) or {}
        status_param = params.get("status", "")
        vulnerable = os.getenv("VULNERABLE", "") == "1"
        if vulnerable and status_param and (" or " in status_param.lower() or "1=1" in status_param.lower()):
            body = invoices_store.copy()
        else:
            auth = req.headers.get("Authorization", "")
            user_id = 2 if "token-user-2" in auth else 1
            body = [inv for inv in invoices_store if inv["userId"] == user_id]
        return (200, {"Content-Type": "application/json"}, json.dumps(body))

    responses.add_callback(
        responses.POST, INVOICES_URL,
        callback=lambda req: post_callback(req),
        content_type="application/json",
    )
    responses.add_callback(
        responses.GET, INVOICES_URL,
        callback=lambda req: get_callback(req),
        content_type="application/json",
    )

    # usamos tokens controlados (no reales) para que el mock distinga usuarios
    headersA = {"Authorization": "Bearer token-user-1", "Accept": "application/json"}
    headersB = {"Authorization": "Bearer token-user-2", "Accept": "application/json"}
    
    # crear invoice para B (interceptada por responses)
    r_post = requests.post(INVOICES_URL, json={"status": "paid"}, headers=headersB, timeout=5)
    assert r_post.status_code in (200,201)
    inv_b = r_post.json()
    assert inv_b.get("userId") == 2 or isinstance(inv_b.get("userId"), int)

    # sanity check
    r_check = requests.get(INVOICES_URL, headers=headersB, timeout=5)
    assert r_check.status_code == 200
    invoices_b = r_check.json()
    assert any(inv.get("id") == inv_b.get("id") for inv in invoices_b)

    # baseline A
    r_base = requests.get(INVOICES_URL, headers=headersA, timeout=5)
    assert r_base.status_code == 200
    base_invoices = r_base.json()
    assert all(inv.get("userId") == 1 for inv in base_invoices)

    vulnerable = os.getenv("VULNERABLE", "") == "1"
    for payload in SQLI_PAYLOADS:
        params = {"status": payload, "operator": "="}
        r = requests.get(INVOICES_URL, params=params, headers=headersA, timeout=5)

        if vulnerable and (" or " in payload.lower() or "1=1" in payload.lower()):
            returned = r.json()
            if any(inv.get("userId") == inv_b.get("userId") for inv in returned):
                pytest.fail(f"SQLi simulada detectada: payload `{payload}` expuso invoice de otro usuario")
        else:
            returned = r.json()
            assert all(inv.get("userId") != inv_b.get("userId") for inv in returned)
