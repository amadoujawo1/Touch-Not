import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class ProductionConfig:
    # Database Configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Security Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SESSION_COOKIE_SECURE = True
    REMEMBER_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    
    # Logging Configuration
    LOG_LEVEL = 'INFO'
    
    # Performance Configuration
    TEMPLATES_AUTO_RELOAD = False
    
    # Cache Configuration
    CACHE_TYPE = 'redis'
    CACHE_REDIS_URL = os.environ.get('REDIS_URL')
    
    # Security Headers
    STRICT_TRANSPORT_SECURITY = True
    CONTENT_SECURITY_POLICY = {
        'default-src': "'self'",
        'img-src': "'self' data:",
        'script-src': "'self'",
        'style-src': "'self' 'unsafe-inline'"
    }