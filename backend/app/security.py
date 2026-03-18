"""Security Middleware for KerfOS

Implements:
- Rate limiting (DoS protection)
- Security headers (OWASP recommendations)
- CSRF protection
- Input validation
- IP-based blocking
- Request logging
"""
from fastapi import Request, HTTPException, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from typing import Dict, Optional, List, Callable
from datetime import datetime, timedelta
from collections import defaultdict
import time
import re
import secrets
import hashlib
from enum import Enum


# ============================================
# CONFIGURATION
# ============================================

class SecurityConfig:
    """Security configuration settings"""
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS = 100  # requests per window
    RATE_LIMIT_WINDOW = 60  # seconds
    RATE_LIMIT_AUTH_REQUESTS = 10  # stricter for auth endpoints
    RATE_LIMIT_AUTH_WINDOW = 60  # seconds
    
    # Security Headers
    CONTENT_SECURITY_POLICY = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self' data:; "
        "connect-src 'self' https://api.stripe.com; "
        "frame-src https://js.stripe.com https://hooks.stripe.com; "
        "object-src 'none'; "
        "base-uri 'self'; "
        "form-action 'self';"
    )
    X_FRAME_OPTIONS = "DENY"
    X_CONTENT_TYPE_OPTIONS = "nosniff"
    X_XSS_PROTECTION = "1; mode=block"
    REFERRER_POLICY = "strict-origin-when-cross-origin"
    PERMISSIONS_POLICY = "geolocation=(), microphone=(), camera=()"
    
    # CSRF
    CSRF_HEADER_NAME = "X-CSRF-Token"
    CSRF_COOKIE_NAME = "csrf_token"
    CSRF_TOKEN_LENGTH = 32
    
    # IP Blocking
    BLOCKED_IPS: List[str] = []  # Add IPs to block
    SUSPICIOUS_USER_AGENTS = [
        "sqlmap",
        "nikto",
        "nmap",
        "masscan",
        "zap",
        "burp",
        "dirbuster",
        "gobuster",
        "wpscan",
        "nuclei",
    ]
    
    # Input Validation
    MAX_REQUEST_SIZE = 10 * 1024 * 1024  # 10MB
    SQL_INJECTION_PATTERNS = [
        r"('|(\\')|(\\\\'))*(\s|\+|%20)*(or|and)(\s|\+|%20)*.*=.*--",
        r"union(\s|\+|%20)+select",
        r"insert(\s|\+|%20)+into",
        r"delete(\s|\+|%20)+from",
        r"drop(\s|\+|%20)+table",
        r"exec(\s|\+|%20)+xp_",
        r"waitfor(\s|\+|%20)+delay",
        r"benchmark\s*\(",
        r"sleep\s*\(",
    ]
    
    # Exempt paths (no rate limiting or CSRF)
    EXEMPT_PATHS = [
        "/health",
        "/",
        "/docs",
        "/openapi.json",
        "/redoc",
    ]
    CSRF_EXEMPT_PATHS = [
        "/api/auth/login",
        "/api/auth/register",
        "/api/gdpr/privacy-policy",
        "/api/gdpr/terms-of-service",
        "/api/gdpr/cookie-policy",
    ]


# ============================================
# RATE LIMITER
# ============================================

class RateLimiter:
    """Sliding window rate limiter"""
    
    def __init__(self):
        self.requests: Dict[str, List[float]] = defaultdict(list)
        self.auth_requests: Dict[str, List[float]] = defaultdict(list)
    
    def is_rate_limited(
        self,
        key: str,
        is_auth: bool = False
    ) -> tuple[bool, int, int]:
        """
        Check if the key is rate limited.
        Returns: (is_limited, remaining_requests, reset_seconds)
        """
        now = time.time()
        
        if is_auth:
            window = SecurityConfig.RATE_LIMIT_AUTH_WINDOW
            max_requests = SecurityConfig.RATE_LIMIT_AUTH_REQUESTS
            requests = self.auth_requests[key]
        else:
            window = SecurityConfig.RATE_LIMIT_WINDOW
            max_requests = SecurityConfig.RATE_LIMIT_REQUESTS
            requests = self.requests[key]
        
        # Remove old requests outside the window
        cutoff = now - window
        while requests and requests[0] < cutoff:
            requests.pop(0)
        
        current_count = len(requests)
        remaining = max(0, max_requests - current_count)
        reset_seconds = int(window - (now - requests[0])) if requests else int(window)
        
        if current_count >= max_requests:
            return True, 0, reset_seconds
        
        # Add current request
        requests.append(now)
        return False, remaining - 1, reset_seconds
    
    def reset(self, key: str):
        """Reset rate limit for a key"""
        self.requests[key] = []
        self.auth_requests[key] = []


# Global rate limiter instance
rate_limiter = RateLimiter()


# ============================================
# CSRF PROTECTION
# ============================================

class CSRFProtection:
    """CSRF token management"""
    
    def __init__(self):
        self.tokens: Dict[str, float] = {}  # token -> expiry
        self.token_lifetime = 3600  # 1 hour
    
    def generate_token(self) -> str:
        """Generate a new CSRF token"""
        token = secrets.token_hex(SecurityConfig.CSRF_TOKEN_LENGTH)
        self.tokens[token] = time.time() + self.token_lifetime
        return token
    
    def validate_token(self, token: str) -> bool:
        """Validate a CSRF token"""
        if not token:
            return False
        
        if token not in self.tokens:
            return False
        
        # Check expiry
        if self.tokens[token] < time.time():
            del self.tokens[token]
            return False
        
        return True
    
    def cleanup_expired(self):
        """Remove expired tokens"""
        now = time.time()
        expired = [t for t, exp in self.tokens.items() if exp < now]
        for token in expired:
            del self.tokens[token]


# Global CSRF instance
csrf_protection = CSRFProtection()


# ============================================
# INPUT VALIDATOR
# ============================================

class InputValidator:
    """Input validation for security threats"""
    
    @staticmethod
    def check_sql_injection(value: str) -> bool:
        """Check for SQL injection patterns"""
        if not isinstance(value, str):
            return False
        
        value_lower = value.lower()
        for pattern in SecurityConfig.SQL_INJECTION_PATTERNS:
            if re.search(pattern, value_lower, re.IGNORECASE):
                return True
        return False
    
    @staticmethod
    def check_xss(value: str) -> bool:
        """Check for XSS patterns"""
        if not isinstance(value, str):
            return False
        
        xss_patterns = [
            r"<script",
            r"javascript:",
            r"onerror\s*=",
            r"onload\s*=",
            r"onclick\s*=",
            r"onmouseover\s*=",
            r"<iframe",
            r"<embed",
            r"<object",
        ]
        
        value_lower = value.lower()
        for pattern in xss_patterns:
            if re.search(pattern, value_lower, re.IGNORECASE):
                return True
        return False
    
    @staticmethod
    def check_path_traversal(value: str) -> bool:
        """Check for path traversal patterns"""
        if not isinstance(value, str):
            return False
        
        traversal_patterns = [
            r"\.\./",
            r"\.\.\\",
            r"%2e%2e",
            r"%252e",
        ]
        
        for pattern in traversal_patterns:
            if re.search(pattern, value, re.IGNORECASE):
                return True
        return False
    
    @classmethod
    def validate_input(cls, data: any) -> tuple[bool, Optional[str]]:
        """
        Validate input data for security threats.
        Returns: (is_valid, error_message)
        """
        if isinstance(data, str):
            if cls.check_sql_injection(data):
                return False, "Potential SQL injection detected"
            if cls.check_xss(data):
                return False, "Potential XSS attack detected"
            if cls.check_path_traversal(data):
                return False, "Path traversal attempt detected"
        elif isinstance(data, dict):
            for value in data.values():
                is_valid, error = cls.validate_input(value)
                if not is_valid:
                    return is_valid, error
        elif isinstance(data, list):
            for item in data:
                is_valid, error = cls.validate_input(item)
                if not is_valid:
                    return is_valid, error
        
        return True, None


# ============================================
# SECURITY MIDDLEWARE
# ============================================

class SecurityMiddleware(BaseHTTPMiddleware):
    """Main security middleware"""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.validator = InputValidator()
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Get client IP
        client_ip = self._get_client_ip(request)
        
        # Check blocked IPs
        if client_ip in SecurityConfig.BLOCKED_IPS:
            return JSONResponse(
                status_code=403,
                content={"detail": "Access denied"}
            )
        
        # Check suspicious user agents
        user_agent = request.headers.get("user-agent", "").lower()
        for suspicious in SecurityConfig.SUSPICIOUS_USER_AGENTS:
            if suspicious in user_agent:
                return JSONResponse(
                    status_code=403,
                    content={"detail": "Access denied"}
                )
        
        # Check request size
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > SecurityConfig.MAX_REQUEST_SIZE:
            return JSONResponse(
                status_code=413,
                content={"detail": "Request too large"}
            )
        
        # Skip rate limiting for exempt paths
        path = request.url.path
        if path in SecurityConfig.EXEMPT_PATHS:
            response = await call_next(request)
            self._add_security_headers(response)
            return response
        
        # Rate limiting
        is_auth = "/auth/" in path or "/login" in path or "/register" in path
        is_limited, remaining, reset = rate_limiter.is_rate_limited(client_ip, is_auth)
        
        if is_limited:
            response = JSONResponse(
                status_code=429,
                content={
                    "detail": "Too many requests. Please try again later.",
                    "retry_after": reset
                }
            )
            response.headers["Retry-After"] = str(reset)
            response.headers["X-RateLimit-Limit"] = str(
                SecurityConfig.RATE_LIMIT_AUTH_REQUESTS if is_auth else SecurityConfig.RATE_LIMIT_REQUESTS
            )
            response.headers["X-RateLimit-Remaining"] = "0"
            response.headers["X-RateLimit-Reset"] = str(reset)
            return response
        
        # CSRF protection for state-changing methods
        if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
            if path not in SecurityConfig.CSRF_EXEMPT_PATHS:
                csrf_token = request.headers.get(SecurityConfig.CSRF_HEADER_NAME)
                if not csrf_protection.validate_token(csrf_token):
                    # Generate new token for next request
                    new_token = csrf_protection.generate_token()
                    response = JSONResponse(
                        status_code=403,
                        content={
                            "detail": "Invalid or missing CSRF token",
                            "csrf_token": new_token
                        }
                    )
                    response.set_cookie(
                        key=SecurityConfig.CSRF_COOKIE_NAME,
                        value=new_token,
                        httponly=True,
                        secure=True,
                        samesite="strict"
                    )
                    return response
        
        # Process request
        response = await call_next(request)
        
        # Add security headers
        self._add_security_headers(response)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(
            SecurityConfig.RATE_LIMIT_AUTH_REQUESTS if is_auth else SecurityConfig.RATE_LIMIT_REQUESTS
        )
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(reset)
        
        # Add CSRF token for GET requests
        if request.method == "GET":
            token = csrf_protection.generate_token()
            response.set_cookie(
                key=SecurityConfig.CSRF_COOKIE_NAME,
                value=token,
                httponly=True,
                secure=True,
                samesite="strict"
            )
            response.headers["X-CSRF-Token"] = token
        
        return response
    
    def _get_client_ip(self, request: Request) -> str:
        """Get client IP, considering proxies"""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"
    
    def _add_security_headers(self, response: Response):
        """Add security headers to response"""
        response.headers["X-Content-Type-Options"] = SecurityConfig.X_CONTENT_TYPE_OPTIONS
        response.headers["X-Frame-Options"] = SecurityConfig.X_FRAME_OPTIONS
        response.headers["X-XSS-Protection"] = SecurityConfig.X_XSS_PROTECTION
        response.headers["Referrer-Policy"] = SecurityConfig.REFERRER_POLICY
        response.headers["Permissions-Policy"] = SecurityConfig.PERMISSIONS_POLICY
        response.headers["Content-Security-Policy"] = SecurityConfig.CONTENT_SECURITY_POLICY
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"


# ============================================
# INPUT VALIDATION MIDDLEWARE
# ============================================

class InputValidationMiddleware(BaseHTTPMiddleware):
    """Validate request body for security threats"""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.validator = InputValidator()
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip validation for GET requests and exempt paths
        if request.method == "GET":
            return await call_next(request)
        
        path = request.url.path
        if path in SecurityConfig.EXEMPT_PATHS:
            return await call_next(request)
        
        # Validate query parameters
        for key, value in request.query_params.items():
            is_valid, error = self.validator.validate_input(value)
            if not is_valid:
                return JSONResponse(
                    status_code=400,
                    content={"detail": f"Invalid query parameter '{key}': {error}"}
                )
        
        # Validate path parameters
        for key, value in request.path_params.items():
            is_valid, error = self.validator.validate_input(value)
            if not is_valid:
                return JSONResponse(
                    status_code=400,
                    content={"detail": f"Invalid path parameter '{key}': {error}"}
                )
        
        return await call_next(request)


# ============================================
# REQUEST LOGGING MIDDLEWARE
# ============================================

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log all requests for audit purposes"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # Get client info
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        
        # Process request
        response = await call_next(request)
        
        # Calculate duration
        duration = time.time() - start_time
        
        # Log request (in production, send to logging service)
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": round(duration * 1000, 2),
            "client_ip": client_ip,
            "user_agent": user_agent,
        }
        
        # In production: send to logging service (e.g., Datadog, Logflare, etc.)
        # print(json.dumps(log_entry))
        
        # Add timing header
        response.headers["X-Response-Time"] = f"{duration * 1000:.2f}ms"
        
        return response
