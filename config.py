import os

class Config:
    # Database configuration
    # If DATABASE_URL environment variable is not set, use the local SQLite connection for easier local development
    # For production, set the DATABASE_URL environment variable to your MySQL connection string
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///cash_collection.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_recycle": 300,
        "pool_pre_ping": True,
    }
    
    # Security configuration
    SECRET_KEY = os.environ.get("SESSION_SECRET") or 'dev-key-for-testing'
    
    # Other configuration
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload
