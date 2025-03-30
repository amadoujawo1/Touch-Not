# routes/__init__.py
from .auth import auth_bp
from .admin import admin_bp
from .team_lead import team_lead_bp
from .data_analyst import data_analyst_bp
from .cash_controller import cash_controller_bp
from .common import common_bp

__all__ = ['auth_bp', 'admin_bp', 'team_lead_bp', 'data_analyst_bp', 'cash_controller_bp', 'common_bp']