import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from flask_login import LoginManager

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Define the base model class
class Base(DeclarativeBase):
    pass

# Initialize extensions
db = SQLAlchemy(model_class=Base)
login_manager = LoginManager()

# Create the Flask application
app = Flask(__name__)
app.config.from_object('config.Config')
app.secret_key = os.environ.get("SESSION_SECRET") or 'dev-key-for-testing'

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

# Import and register blueprints
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
        logging.error("Make sure your MySQL server is running and the 'cash_collection' database exists")
        logging.error("You may need to create the database first with: CREATE DATABASE cash_collection;")

@login_manager.user_loader
def load_user(user_id):
    from models import User
    return User.query.get(int(user_id))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
