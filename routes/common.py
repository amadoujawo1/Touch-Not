<<<<<<< HEAD
# # routes/common.py
# from flask import Blueprint, jsonify, redirect, url_for, current_app
# from flask_login import login_required, current_user
# from models import Flight, FlightSupervisor

# common_bp = Blueprint('common', __name__)

# @common_bp.route('/')
# def index():
#     if current_user.is_authenticated:
#         if current_user.role == 'admin':
#             return redirect(url_for('admin.dashboard'))
#         elif current_user.role == 'teamLead':
#             return redirect(url_for('team_lead.dashboard'))
#         elif current_user.role == 'dataAnalyst':
#             return redirect(url_for('data_analyst.dashboard'))
#         elif current_user.role == 'cashController':
#             return redirect(url_for('cash_controller.dashboard'))
#     return redirect(url_for('auth.login'))

# @common_bp.route('/api/flights-supervisors')
# @login_required
# def get_flights_supervisors():
#     flights = Flight.query.all()
#     supervisors = FlightSupervisor.query.all()
    
#     return jsonify({
#         'flights': [flight.name for flight in flights],
#         'supervisors': [supervisor.name for supervisor in supervisors]
#     })




# routes/common.py
from flask import Blueprint, jsonify, redirect, url_for, current_app
from flask_login import login_required, current_user
from models import Flight, FlightSupervisor

common_bp = Blueprint('common', __name__)

@common_bp.route('/')
def index():
    if current_user.is_authenticated:
        if current_user.role == 'admin':
            return redirect(url_for('admin.dashboard'))
        elif current_user.role == 'teamLead':
            return redirect(url_for('team_lead.dashboard'))
        elif current_user.role == 'dataAnalyst':
            return redirect(url_for('data_analyst.dashboard'))
        elif current_user.role == 'cashController':
            return redirect(url_for('cash_controller.dashboard'))
    return redirect(url_for('auth.login'))

@common_bp.route('/api/flights-supervisors')
@login_required
def get_flights_supervisors():
    flights = Flight.query.all()
    supervisors = FlightSupervisor.query.all()
    
    return jsonify({
        'flights': [flight.name for flight in flights],
        'supervisors': [supervisor.name for supervisor in supervisors]
=======
# routes/common.py
from flask import Blueprint, jsonify, redirect, url_for, current_app
from flask_login import login_required, current_user
from models import Flight, FlightSupervisor

common_bp = Blueprint('common', __name__)

@common_bp.route('/')
def index():
    if current_user.is_authenticated:
        if current_user.role == 'admin':
            return redirect(url_for('admin.dashboard'))
        elif current_user.role == 'teamLead':
            return redirect(url_for('team_lead.dashboard'))
        elif current_user.role == 'dataAnalyst':
            return redirect(url_for('data_analyst.dashboard'))
        elif current_user.role == 'cashController':
            return redirect(url_for('cash_controller.dashboard'))
    return redirect(url_for('auth.login'))

@common_bp.route('/api/flights-supervisors')
@login_required
def get_flights_supervisors():
    flights = Flight.query.all()
    supervisors = FlightSupervisor.query.all()
    
    return jsonify({
        'flights': [flight.name for flight in flights],
        'supervisors': [supervisor.name for supervisor in supervisors]
>>>>>>> 98107f59a4616fd4b5fc6c38d9276c6029e43b1d
    })