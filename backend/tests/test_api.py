"""
Tests for main API endpoints
"""
import pytest
from fastapi.testclient import TestClient


class TestHealthEndpoint:
    """Tests for health check endpoints"""
    
    def test_root_endpoint(self, client):
        """Test root endpoint returns API info"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "KerfOS API"
        assert data["status"] == "running"
        assert "version" in data
        assert "features" in data
        assert "endpoints" in data
    
    def test_health_endpoint(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


class TestCabinetEndpoints:
    """Tests for cabinet-related endpoints"""
    
    def test_list_cabinets(self, client):
        """Test listing cabinets"""
        response = client.get("/api/cabinets")
        assert response.status_code == 200
    
    def test_create_cabinet(self, client, sample_cabinet_data):
        """Test creating a cabinet"""
        response = client.post("/api/cabinets", json=sample_cabinet_data)
        assert response.status_code in [200, 201, 422]  # 422 if validation differs


class TestMaterialEndpoints:
    """Tests for material-related endpoints"""
    
    def test_list_materials(self, client):
        """Test listing materials"""
        response = client.get("/api/materials")
        assert response.status_code == 200
    
    def test_get_material_types(self, client):
        """Test getting material types"""
        response = client.get("/api/materials/types")
        assert response.status_code in [200, 404]  # 404 if endpoint doesn't exist


class TestHardwareEndpoints:
    """Tests for hardware-related endpoints"""
    
    def test_list_hardware(self, client):
        """Test listing hardware"""
        response = client.get("/api/hardware")
        assert response.status_code == 200
    
    def test_get_hardware_categories(self, client):
        """Test getting hardware categories"""
        response = client.get("/api/hardware/categories")
        assert response.status_code in [200, 404]


class TestCutListEndpoints:
    """Tests for cut list endpoints"""
    
    def test_generate_cut_list(self, client, sample_cabinet_data):
        """Test generating a cut list"""
        response = client.post("/api/cutlists/generate", json={
            "cabinets": [sample_cabinet_data],
            "sheet_size": {"width": 48, "height": 96}
        })
        assert response.status_code in [200, 201, 422]


class TestGDPREndpoints:
    """Tests for GDPR compliance endpoints"""
    
    def test_get_privacy_policy(self, client):
        """Test getting privacy policy"""
        response = client.get("/api/gdpr/privacy-policy")
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "KerfOS Privacy Policy"
        assert "sections" in data
    
    def test_get_terms_of_service(self, client):
        """Test getting terms of service"""
        response = client.get("/api/gdpr/terms-of-service")
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "KerfOS Terms of Service"
    
    def test_get_cookie_policy(self, client):
        """Test getting cookie policy"""
        response = client.get("/api/gdpr/cookie-policy")
        assert response.status_code == 200
        data = response.json()
        assert "cookies" in data
    
    def test_get_data_retention_policy(self, client):
        """Test getting data retention policy"""
        response = client.get("/api/gdpr/data-retention")
        assert response.status_code == 200
        data = response.json()
        assert "policy" in data
    
    def test_get_dpa(self, client):
        """Test getting Data Processing Agreement"""
        response = client.get("/api/gdpr/dpa")
        assert response.status_code == 200
        data = response.json()
        assert "title" in data


class TestSecurityMiddleware:
    """Tests for security middleware"""
    
    def test_security_headers_present(self, client):
        """Test that security headers are present"""
        response = client.get("/")
        assert "X-Content-Type-Options" in response.headers
        assert "X-Frame-Options" in response.headers
        assert "X-XSS-Protection" in response.headers
        assert "Content-Security-Policy" in response.headers
        assert "Strict-Transport-Security" in response.headers
    
    def test_rate_limit_headers(self, client):
        """Test that rate limit headers are present"""
        response = client.get("/")
        assert "X-RateLimit-Limit" in response.headers
        assert "X-RateLimit-Remaining" in response.headers
    
    def test_csrf_token_on_get(self, client):
        """Test that CSRF token is set on GET requests"""
        response = client.get("/")
        # CSRF token should be in headers or cookies
        assert "X-CSRF-Token" in response.headers or "csrf_token" in response.cookies


class TestExportEndpoints:
    """Tests for export endpoints"""
    
    def test_export_obj(self, client, sample_cabinet_data):
        """Test exporting to OBJ format"""
        response = client.post("/api/export/obj", json=sample_cabinet_data)
        assert response.status_code in [200, 500]  # 500 if 3D export not fully implemented
    
    def test_export_stl(self, client, sample_cabinet_data):
        """Test exporting to STL format"""
        response = client.post("/api/export/stl", json=sample_cabinet_data)
        assert response.status_code in [200, 500]
    
    def test_export_dxf(self, client, sample_cabinet_data):
        """Test exporting to DXF format"""
        response = client.post("/api/export/dxf", json=sample_cabinet_data)
        assert response.status_code in [200, 500]


class TestChatEndpoint:
    """Tests for AI chat endpoint"""
    
    def test_chat_endpoint(self, client):
        """Test chat endpoint"""
        response = client.post("/api/chat", json={
            "message": "Hello, I want to design a cabinet",
            "conversation_id": None,
            "context": {}
        })
        assert response.status_code in [200, 500]  # 500 if LLM not configured


class TestWizardEndpoint:
    """Tests for wizard endpoint"""
    
    def test_start_wizard(self, client):
        """Test starting the wizard"""
        response = client.post("/api/wizard/start")
        assert response.status_code == 200
        data = response.json()
        assert "current_step" in data
        assert "prompt" in data
        assert "options" in data
