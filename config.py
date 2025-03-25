import os
import logging

class Config:
    # Database configuration
    # Use MySQL database for local development
    
    # MySQL configuration
    mysql_user = os.environ.get('MYSQL_USER', 'jawo')  # Default to 'jawo' if not provided
    mysql_password = os.environ.get('MYSQL_PASSWORD', 'abc_123')  # Default to 'abc_123'
    mysql_host = os.environ.get('MYSQL_HOST', 'localhost')
    mysql_db = os.environ.get('MYSQL_DB', 'cash_collection')
    
    # Create MySQL connection string
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{mysql_user}:{mysql_password}@{mysql_host}/{mysql_db}"
    logging.info(f"Using MySQL database on {mysql_host}")
    
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








# import os
# import logging
# import sys

# class Config:
#     # Database configuration
#     # For deployment: Use PostgreSQL database provided by Replit
#     # For local development: Configure MySQL or SQLite
    
#     # Determine if we're running on Replit or locally
#     if os.environ.get('REPL_ID'):
#         # On Replit - use PostgreSQL
#         SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
#         logging.info("Running on Replit, using PostgreSQL")
#     else:
#         # Check if SQLite is explicitly requested (more beginner-friendly)
#         use_sqlite = os.environ.get('USE_SQLITE', '').lower() in ('true', '1', 'yes')
        
#         if use_sqlite:
#             # Use SQLite - simplest option for local development
#             sqlite_path = os.environ.get('SQLITE_PATH', 'cash_collection.db')
#             SQLALCHEMY_DATABASE_URI = f'sqlite:///{sqlite_path}'
#             logging.info(f"Running locally, using SQLite database at {sqlite_path}")
#         else:
#             # Running locally - Try MySQL with configurable credentials
#             mysql_user = os.environ.get('MYSQL_USER', 'jawo')  # Default to 'root' if not provided
#             mysql_password = os.environ.get('MYSQL_PASSWORD', 'abc_123')  # Default to empty password
#             mysql_host = os.environ.get('MYSQL_HOST', 'localhost')
#             mysql_db = os.environ.get('MYSQL_DB', 'cash_collection')
            
#             # Create MySQL connection string 
#             SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{mysql_user}:{mysql_password}@{mysql_host}/{mysql_db}"
#             logging.info(f"Running locally, using MySQL on {mysql_host}")
    
#     # Fallback to SQLite in case of database connection issues
#     if not SQLALCHEMY_DATABASE_URI:
#         SQLALCHEMY_DATABASE_URI = 'sqlite:///cash_collection.db'
#         logging.warning("No database configuration found, falling back to SQLite")
    
#     SQLALCHEMY_TRACK_MODIFICATIONS = False
#     SQLALCHEMY_ENGINE_OPTIONS = {
#         "pool_recycle": 300,
#         "pool_pre_ping": True,
#     }
    
#     # Security configuration
#     SECRET_KEY = os.environ.get("SESSION_SECRET") or 'dev-key-for-testing'
    
#     # Other configuration
#     UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
#     MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload
