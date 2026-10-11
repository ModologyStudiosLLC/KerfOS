import os

os.environ["AGENT_SHARED_SECRET"] = "s" * 48
os.environ.setdefault("ANTHROPIC_API_KEY", "test-key-not-real")

from fastapi.testclient import TestClient  # noqa: E402

from main import app  # noqa: E402

client = TestClient(app)


def test_health_is_open():
    assert client.get("/health").status_code == 200


def test_agent_endpoint_rejects_missing_or_wrong_secret():
    assert client.post("/", json={}).status_code == 401
    assert client.post("/", json={}, headers={"x-agent-secret": "wrong"}).status_code == 401


def test_agent_endpoint_accepts_the_shared_secret():
    r = client.post("/", json={}, headers={"x-agent-secret": "s" * 48})
    assert r.status_code != 401
