from flask import Blueprint, jsonify
from flask_login import login_required
from app import db
from models import Flight, FlightSupervisor

common_bp = Blueprint('common', __name__)

@common_bp.route('/api/flights-supervisors')
@login_required
def get_flights_supervisors():
    flights = Flight.query.all()
    supervisors = FlightSupervisor.query.all()
    
    return jsonify({
        'flights': [flight.name for flight in flights],
        'supervisors': [supervisor.name for supervisor in supervisors]
    })
