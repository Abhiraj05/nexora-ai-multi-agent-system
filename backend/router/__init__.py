from .auth_router import auth_router
from .email_router import email_router
from .health_router import health_router
from .otp_router import otp_router
from .password_router import password_router
from .research_router import research_router
from .reports_router import reports_router

__all__ = [
    "auth_router",
    "email_router",
    "health_router",
    "otp_router",
    "password_router",
    "research_router",
    "reports_router",
]
