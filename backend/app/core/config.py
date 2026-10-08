import os
from dotenv import load_dotenv

load_dotenv()

# Database
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://miki_user:password@localhost:5432/miki_db"
)

# JWT
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# API
API_VERSION = "v1"
API_TITLE = "Miki API"
API_DESCRIPTION = "Oriental Fortune & Destiny Reader API"

# Environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = ENVIRONMENT == "development"

# CORS
CORS_ORIGINS = [
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:3000",
    "http://127.0.0.1",
]

if ENVIRONMENT == "production":
    CORS_ORIGINS.extend([
        "https://miki.app",
    ])
