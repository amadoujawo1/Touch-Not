import os
import logging
import pymysql
from flask import Flask,render_template
from extensions import db, login_manager
from config import Config

# Configure logging
logging.basicConfig(level=logging.DEBUG)

from urllib.parse import urlparse

def create_mysql_database(app):
    """Create the MySQL database if it doesn't exist - parses URI for credentials"""
    try:
        full_uri = app.config['SQLALCHEMY_DATABASE_URI']
        if 'mysql+pymysql' in full_uri:
            # Parse the URI to get credentials
            parsed = urlparse(full_uri)
            db_name = parsed.path.lstrip('/')
            
            # Connect to MySQL server (without specifying a database)
            logging.info(f"Attempting to create database '{db_name}' if it doesn't exist")

            try:
                connection = pymysql.connect(
                    host=parsed.hostname or 'localhost',
                    port=parsed.port or 3306,
                    user=parsed.username or 'root',
                    password=parsed.password or '',
                    charset='utf8mb4',
                    cursorclass=pymysql.cursors.DictCursor
                )

                with connection.cursor() as cursor:
                    cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}`")
                connection.commit()
                logging.info(f"Database '{db_name}' created or already exists")
                return True
            except Exception as e:
                logging.error(f"Error creating database: {e}")
                return False
            finally:
                if 'connection' in locals() and connection:
                    connection.close()
    except Exception as e:
        logging.error(f"Error attempting to create database: {e}")
        return False

def register_blueprints(app):
    from routes.auth import auth_bp
    from routes.admin import admin_bp
    from routes.team_lead import team_lead_bp
    from routes.data_analyst import data_analyst_bp
    from routes.cash_controller import cash_controller_bp
    from routes.common import common_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(team_lead_bp, url_prefix='/team-lead')
    app.register_blueprint(data_analyst_bp, url_prefix='/data-analyst')
    app.register_blueprint(cash_controller_bp, url_prefix='/cash-controller')
    app.register_blueprint(common_bp)

def setup_database(app):
    """Initialize database and create tables if needed."""
    if 'mysql+pymysql' in app.config.get('SQLALCHEMY_DATABASE_URI', ''):
        create_mysql_database(app)

    @app.errorhandler(500)
    def handle_db_error(e):
        return render_template('error.html', 
                               error="Internal Server Error", 
                               message=f"An error occurred: {str(e.original_exception if hasattr(e, 'original_exception') else e)}. Please check the server logs."), 500

    with app.app_context():
        try:
            import models
            db.create_all()

            from models import User
            from werkzeug.security import generate_password_hash

            admin = User.query.filter_by(username='admin').first()
            if not admin:
                admin = User(
                    username='admin',
                    password_hash=generate_password_hash('admin123'),
                    role='admin',
                    email='admin@example.com',
                    telephone='123-456-7890',
                    gender='other',
                    active=True
                )
                db.session.add(admin)
                db.session.commit()
                logging.info("Admin user created")
        except Exception as e:
            logging.error(f"Database connection error: {str(e)}")
            if 'Unknown database' in str(e):
                logging.error("Database does not exist. Ensure MySQL is running and create the database manually.")
            elif 'Access denied' in str(e):
                logging.error("Check MySQL username and password.")
            elif 'Can\'t connect' in str(e) or 'Connection refused' in str(e):
                logging.error("Ensure MySQL server is running.")
            logging.error(f"Error details: {str(e)}")

def create_app():
    """Initialize Flask app."""
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message_category = 'info'

    register_blueprints(app)

    setup_database(app)

    return app

@login_manager.user_loader
def load_user(user_id):
    from models import User
    return User.query.get(int(user_id))

# Create and run the app
app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)