import os

class Config:
    # Database configuration
    # Explicitly use MySQL for local development
    # You may need to create the 'cash_collection' database first
    # and update credentials if needed
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:password@localhost/cash_collection'
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
