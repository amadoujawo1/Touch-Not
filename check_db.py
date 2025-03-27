#!/usr/bin/env python3
# check_db.py - Utility to verify database connection
import os
import sys
import logging
import pymysql
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

def check_mysql_connection():
    """Check MySQL connection and database existence"""
    mysql_user = os.environ.get('MYSQL_USER', 'jawo')  # Default to 'root' if not provided
    mysql_password = os.environ.get('MYSQL_PASSWORD', 'abc_123')  # Default to empty password
    mysql_host = os.environ.get('MYSQL_HOST', 'localhost')
    mysql_db = os.environ.get('MYSQL_DB', 'cash_collection')
    
    # First check if we can connect to MySQL server
    try:
        logging.info(f"Attempting to connect to MySQL server at {mysql_host} as user '{mysql_user}'")
        connection = pymysql.connect(
            host=mysql_host,
            user=mysql_user,
            password=mysql_password,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
            logging.info(f"Connected to MySQL server: {version.get('VERSION()', 'Unknown')}")
        
        # Check if database exists
        with connection.cursor() as cursor:
            cursor.execute("SHOW DATABASES")
            databases = [x['Database'] for x in cursor.fetchall()]
            
            if mysql_db in databases:
                logging.info(f"Database '{mysql_db}' exists")
            else:
                logging.warning(f"Database '{mysql_db}' does not exist")
                
                # Try to create the database
                logging.info(f"Attempting to create database '{mysql_db}'...")
                cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{mysql_db}`")
                connection.commit()
                logging.info(f"Database '{mysql_db}' created successfully!")
        
        connection.close()
        return True
        
    except Exception as e:
        logging.error(f"MySQL connection error: {e}")
        
        if "Access denied" in str(e):
            logging.error(f"Access denied for user '{mysql_user}'. Check your MySQL credentials.")
            logging.error("Set MYSQL_USER and MYSQL_PASSWORD environment variables with correct credentials.")
        elif "Can't connect" in str(e) or "Connection refused" in str(e):
            logging.error("Cannot connect to MySQL server. Make sure MySQL is running.")
        
        return False

def check_sqlalchemy_connection():
    """Check SQLAlchemy connection to the database"""
    if os.environ.get('REPL_ID'):
        # On Replit, use PostgreSQL
        db_uri = os.environ.get('DATABASE_URL')
        db_type = "PostgreSQL"
    else:
        # Running locally - check for SQLite preference
        use_sqlite = os.environ.get('USE_SQLITE', '').lower() in ('true', '1', 'yes')
        
        if use_sqlite:
            # Use SQLite
            sqlite_path = os.environ.get('SQLITE_PATH', 'cash_collection.db')
            db_uri = f'sqlite:///{sqlite_path}'
            db_type = "SQLite"
        else:
            # Use MySQL
            mysql_user = os.environ.get('MYSQL_USER', 'root') 
            mysql_password = os.environ.get('MYSQL_PASSWORD', '')
            mysql_host = os.environ.get('MYSQL_HOST', 'localhost')
            mysql_db = os.environ.get('MYSQL_DB', 'cash_collection')
            
            db_uri = f"mysql+pymysql://{mysql_user}:{mysql_password}@{mysql_host}/{mysql_db}"
            db_type = "MySQL"
    
    logging.info(f"Testing {db_type} connection with SQLAlchemy...")
    
    try:
        engine = create_engine(db_uri)
        connection = engine.connect()
        connection.close()
        logging.info(f"Successfully connected to {db_type} database")
        return True
    except OperationalError as e:
        logging.error(f"SQLAlchemy connection error: {e}")
        
        if "Unknown database" in str(e) and db_type == "MySQL":
            logging.error(f"Database '{os.environ.get('MYSQL_DB', 'cash_collection')}' does not exist")
            check_mysql_connection()  # Try to create the database
        
        return False
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        return False

if __name__ == "__main__":
    print("\n===== Database Connection Check =====\n")
    
    if not os.environ.get('REPL_ID') and not os.environ.get('USE_SQLITE'):
        # Local MySQL check
        mysql_ok = check_mysql_connection()
        if not mysql_ok:
            print("\nMySQL connection failed. You have some options:")
            print("1. Make sure MySQL server is running")
            print("2. Check your MySQL credentials")
            print("   - Set MYSQL_USER and MYSQL_PASSWORD environment variables")
            print("3. Or use SQLite instead (more beginner-friendly):")
            print("   - Set USE_SQLITE=1 environment variable")
            print("\nExample to use SQLite:")
            print("   export USE_SQLITE=1 (Linux/Mac)")
            print("   set USE_SQLITE=1 (Windows)")
    
    # SQLAlchemy check (works for all database types)
    sqlalchemy_ok = check_sqlalchemy_connection()
    
    if sqlalchemy_ok:
        print("\n✅ Database connection successful! The application should work properly.\n")
    else:
        print("\n❌ Database connection failed. Please fix the issues before continuing.\n")
        sys.exit(1)