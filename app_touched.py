import os
import logging
import sys
from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from flask_login import LoginManager
import pymysql

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Define the base model class
class Base(DeclarativeBase):
    pass

# Initialize extensions without app
db = SQLAlchemy(model_class=Base)
login_manager = LoginManager()

def create_mysql_database(app):
    """Create the MySQL database if it doesn't exist - for local MySQL setup"""
    # Extract database info from connection string
    try:
        if 'mysql+pymysql' in app.config['SQLALCHEMY_DATABASE_URI']:
            full_uri = app.config['SQLALCHEMY_DATABASE_URI']
            uri_parts = full_uri.split('/')
            db_name = uri_parts[-1].split('?')[0]  # Get database name
            
            # Connect without specifying database
            logging.info(f"Attempting to create database '{db_name}' if it doesn't exist")
            
            try:
                connection = pymysql.connect(
                    host=os.environ.get('MYSQL_HOST', 'localhost'),
                    user=os.environ.get('MYSQL_USER', 'jawo'),
                    password=os.environ.get('MYSQL_PASSWORD', 'abc_123'),
                    charset='utf8mb4',
                    cursorclass=pymysql.cursors.DictCursor
                )
                
                with connection.cursor() as cursor:
                    # Create database if it doesn't exist
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
    
    return True

def register_blueprints(app):
    # Import blueprints from routes package
    from routes import auth_bp, admin_bp, team_lead_bp, data_analyst_bp, cash_controller_bp, common_bp

    # Register all blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(team_lead_bp, url_prefix='/team-lead')
    app.register_blueprint(data_analyst_bp, url_prefix='/data-analyst')
    app.register_blueprint(cash_controller_bp, url_prefix='/cash-controller')
    app.register_blueprint(common_bp)

def setup_database(app):
    # Check if we're using MySQL locally and try to create database if needed
    if not os.environ.get('REPL_ID') and 'mysql+pymysql' in app.config.get('SQLALCHEMY_DATABASE_URI', 'navicat://conn.mysql@local/4511B031a1896af2?Conn.Host=localhost&Conn.Name=cash_collection&Conn.Port=3306&Conn.UseHTTP=false&Conn.UseSSH=false&Conn.UseSSL=false&Conn.UseSocketFile=false&Conn.Username=jawo'):
        create_mysql_database(app)
    
    # Add error handler for database errors
    @app.errorhandler(500)
    def handle_db_error(e):
        return render_template('error.html', 
                              error="Database Error", 
                              message="There was a problem connecting to the database. Please check your database configuration."), 500
    
    # Create database tables
    with app.app_context():
        try:
            import models
            db.create_all()
            
            # Create admin user if not exists
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
                logging.error("Make sure your database server is running and the database exists")
                logging.error("You may need to create the database manually with: CREATE DATABASE cash_collection;")
                logging.error("Or, set USE_SQLITE=1 in your environment variables to use SQLite instead")
            elif 'Access denied' in str(e):
                logging.error("Database access denied. Check your MySQL username and password.")
                logging.error("Set MYSQL_USER and MYSQL_PASSWORD environment variables with correct credentials.")
            elif 'Can\'t connect' in str(e) or 'Connection refused' in str(e):
                logging.error("Cannot connect to MySQL server. Make sure MySQL is running.")
            
            logging.error(f"Error details: {str(e)}")

def create_app():
    # Create the Flask application
    app = Flask(__name__)
    app.config.from_object('config.Config')
    app.secret_key = os.environ.get("SESSION_SECRET") or 'dev-key-for-testing'

    # Create error template if it doesn't exist
    templates_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')
    error_template_path = os.path.join(templates_dir, 'error.html')
    
    if not os.path.exists(error_template_path):
        os.makedirs(templates_dir, exist_ok=True)
        with open(error_template_path, 'w') as f:
            f.write("""
<!DOCTYPE html>
<html>
<head>
    <title>Error</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='css/styles.css') }}">
    <style>
        .error-container {
            max-width: 800px;
            margin: 100px auto;
            padding: 30px;
            background-color: #f9f9f9;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .error-title {
            color: #e74c3c;
            font-size: 24px;
            margin-bottom: 20px;
        }
        .error-message {
            font-size: 18px;
            margin-bottom: 30px;
        }
        .btn-primary {
            background-color: #3498db;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            text-decoration: none;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h1 class="error-title">{{ error }}</h1>
        <p class="error-message">{{ message }}</p>
        <a href="/" class="btn-primary">Back to Home</a>
    </div>
</body>
</html>
            """)

    # Log database connection info
    try:
        logging.info(f"Using database: {app.config.get('SQLALCHEMY_DATABASE_URI').split('@')[-1]}")
    except Exception as e:
        logging.error(f"Error parsing database URI: {e}")

    # Initialize extensions with the app
    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message_category = 'info'
    
    # Register blueprints and set up the database
    with app.app_context():
        register_blueprints(app)
        setup_database(app)

    return app

@login_manager.user_loader
def load_user(user_id):
    from models import User
    return User.query.get(int(user_id))

# Create the app instance
app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
