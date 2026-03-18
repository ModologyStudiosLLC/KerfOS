"""
Tests for security module
"""
import pytest
from app.security import (
    SecurityConfig, RateLimiter, CSRFProtection, InputValidator
)


class TestRateLimiter:
    """Tests for rate limiting"""
    
    def test_rate_limiter_allows_requests(self):
        """Test that rate limiter allows requests under limit"""
        limiter = RateLimiter()
        is_limited, remaining, reset = limiter.is_rate_limited("test_ip")
        assert is_limited is False
        assert remaining > 0
    
    def test_rate_limiter_blocks_excess(self):
        """Test that rate limiter blocks requests over limit"""
        limiter = RateLimiter()
        # Make many requests
        for _ in range(SecurityConfig.RATE_LIMIT_REQUESTS + 10):
            limiter.is_rate_limited("test_ip_2")
        
        is_limited, remaining, reset = limiter.is_rate_limited("test_ip_2")
        assert is_limited is True
        assert remaining == 0
    
    def test_rate_limiter_separate_keys(self):
        """Test that rate limiter tracks different IPs separately"""
        limiter = RateLimiter()
        
        # Exhaust rate limit for IP1
        for _ in range(SecurityConfig.RATE_LIMIT_REQUESTS + 5):
            limiter.is_rate_limited("ip1")
        
        # IP2 should still be allowed
        is_limited, _, _ = limiter.is_rate_limited("ip2")
        assert is_limited is False
    
    def test_rate_limiter_reset(self):
        """Test rate limiter reset functionality"""
        limiter = RateLimiter()
        
        # Exhaust rate limit
        for _ in range(SecurityConfig.RATE_LIMIT_REQUESTS + 5):
            limiter.is_rate_limited("reset_test_ip")
        
        # Reset
        limiter.reset("reset_test_ip")
        
        # Should be allowed again
        is_limited, remaining, _ = limiter.is_rate_limited("reset_test_ip")
        assert is_limited is False


class TestCSRFProtection:
    """Tests for CSRF protection"""
    
    def test_generate_token(self):
        """Test CSRF token generation"""
        csrf = CSRFProtection()
        token = csrf.generate_token()
        
        assert token is not None
        assert len(token) == SecurityConfig.CSRF_TOKEN_LENGTH * 2  # hex encoding
    
    def test_validate_token(self):
        """Test CSRF token validation"""
        csrf = CSRFProtection()
        token = csrf.generate_token()
        
        assert csrf.validate_token(token) is True
        assert csrf.validate_token("invalid_token") is False
        assert csrf.validate_token("") is False
    
    def test_unique_tokens(self):
        """Test that generated tokens are unique"""
        csrf = CSRFProtection()
        tokens = [csrf.generate_token() for _ in range(100)]
        
        assert len(set(tokens)) == 100  # All unique


class TestInputValidator:
    """Tests for input validation"""
    
    def test_sql_injection_detection(self):
        """Test SQL injection detection"""
        validator = InputValidator()
        
        malicious_inputs = [
            "'; DROP TABLE users; --",
            "1' OR '1'='1",
            "UNION SELECT * FROM users",
            "1; DELETE FROM cabinets WHERE 1=1",
        ]
        
        for malicious in malicious_inputs:
            is_valid, error = validator.validate_input(malicious)
            assert is_valid is False
            assert "SQL" in error or "sql" in error.lower()
    
    def test_xss_detection(self):
        """Test XSS detection"""
        validator = InputValidator()
        
        malicious_inputs = [
            "<script>alert('xss')</script>",
            "<img src=x onerror=alert('xss')>",
            "javascript:alert('xss')",
            "<iframe src='evil.com'>",
        ]
        
        for malicious in malicious_inputs:
            is_valid, error = validator.validate_input(malicious)
            assert is_valid is False
            assert "XSS" in error or "xss" in error.lower()
    
    def test_path_traversal_detection(self):
        """Test path traversal detection"""
        validator = InputValidator()
        
        malicious_inputs = [
            "../../../etc/passwd",
            "..\\..\\..\\windows\\system32",
            "%2e%2e%2f%2e%2e%2f",
        ]
        
        for malicious in malicious_inputs:
            is_valid, error = validator.validate_input(malicious)
            assert is_valid is False
            assert "traversal" in error.lower()
    
    def test_valid_input_passes(self):
        """Test that valid input passes validation"""
        validator = InputValidator()
        
        valid_inputs = [
            "Kitchen Cabinet",
            "24x36 base cabinet",
            "user@example.com",
            "This is a normal description for a cabinet.",
        ]
        
        for valid in valid_inputs:
            is_valid, error = validator.validate_input(valid)
            assert is_valid is True
            assert error is None
    
    def test_nested_validation(self):
        """Test validation of nested data structures"""
        validator = InputValidator()
        
        malicious_nested = {
            "name": "Cabinet",
            "description": "<script>alert('xss')</script>",
            "dimensions": {"width": 24, "height": 36}
        }
        
        is_valid, error = validator.validate_input(malicious_nested)
        assert is_valid is False


class TestSecurityConfig:
    """Tests for security configuration"""
    
    def test_rate_limit_settings(self):
        """Test rate limit configuration values"""
        assert SecurityConfig.RATE_LIMIT_REQUESTS > 0
        assert SecurityConfig.RATE_LIMIT_WINDOW > 0
        assert SecurityConfig.RATE_LIMIT_AUTH_REQUESTS > 0
        assert SecurityConfig.RATE_LIMIT_AUTH_REQUESTS < SecurityConfig.RATE_LIMIT_REQUESTS
    
    def test_security_headers_configured(self):
        """Test that security headers are configured"""
        assert SecurityConfig.X_FRAME_OPTIONS is not None
        assert SecurityConfig.X_CONTENT_TYPE_OPTIONS is not None
        assert SecurityConfig.CONTENT_SECURITY_POLICY is not None
    
    def test_csrf_configured(self):
        """Test CSRF configuration"""
        assert SecurityConfig.CSRF_TOKEN_LENGTH >= 16
        assert SecurityConfig.CSRF_HEADER_NAME is not None
        assert SecurityConfig.CSRF_COOKIE_NAME is not None
    
    def test_sql_injection_patterns(self):
        """Test SQL injection patterns are defined"""
        assert len(SecurityConfig.SQL_INJECTION_PATTERNS) > 0
    
    def test_suspicious_user_agents(self):
        """Test suspicious user agents list"""
        assert len(SecurityConfig.SUSPICIOUS_USER_AGENTS) > 0
        assert "sqlmap" in SecurityConfig.SUSPICIOUS_USER_AGENTS
