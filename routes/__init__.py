
from flask import Blueprint

# Create blueprints
auth_bp = Blueprint('auth', __name__)
admin_bp = Blueprint('admin', __name__)
team_lead_bp = Blueprint('team_lead', __name__)
data_analyst_bp = Blueprint('data_analyst', __name__)
cash_controller_bp = Blueprint('cash_controller', __name__)
common_bp = Blueprint('common', __name__)

# Import routes using absolute imports
from routes import auth
from routes import admin
from routes import team_lead
from routes import data_analyst
from routes import cash_controller
from routes import common
