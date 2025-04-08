from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required
from services.database_service import DatabaseService

api = Blueprint('api', __name__)

@api.route('/reports', methods=['GET'])
@login_required
def get_reports():
    reports = DatabaseService.get_reports()
    return jsonify([report.to_dict() for report in reports])

@api.route('/reports/<int:id>', methods=['GET'])
@login_required
def get_report(id):
    report = DatabaseService.get_report_by_id(id)
    return jsonify(report.to_dict() if report else None)

@api.route('/reports/user/<username>', methods=['GET'])
@login_required
def get_user_reports(username):
    reports = DatabaseService.get_reports_by_user(current_user.id)
    return jsonify([report.to_dict() for report in reports])

@api.route('/reports', methods=['POST'])
@login_required
def save_report():
    report_data = request.get_json()
    success = DatabaseService.save_report(report_data, current_user.id)
    return jsonify({'success': success})

@api.route('/reports/<int:id>', methods=['PUT'])
@login_required
def update_report(id):
    updated_data = request.get_json()
    success = DatabaseService.update_report(id, updated_data)
    return jsonify({'success': success})

@api.route('/team-lead/activation', methods=['GET'])
@login_required
def check_activation():
    username = request.args.get('username')
    date = request.args.get('date')
    # For now, we'll return True as the activation status is not stored in DB
    # This can be enhanced later with proper DB implementation
    return jsonify({'activated': True})

@api.route('/team-lead/activation', methods=['POST'])
@login_required
def set_activation():
    # For now, we'll return success as the activation status is not stored in DB
    # This can be enhanced later with proper DB implementation
    return jsonify({'success': True})

@api.route('/team-lead/activation', methods=['DELETE'])
@login_required
def clear_activation():
    # For now, we'll return success as the activation status is not stored in DB
    # This can be enhanced later with proper DB implementation
    return jsonify({'success': True})

@api.route('/flights', methods=['GET'])
@login_required
def get_flights():
    flights = DatabaseService.get_flights()
    return jsonify(flights)

@api.route('/flights', methods=['PUT'])
@login_required
def set_flights():
    flights = request.get_json()
    success = DatabaseService.set_flights(flights)
    return jsonify({'success': success})

@api.route('/supervisors', methods=['GET'])
@login_required
def get_supervisors():
    supervisors = DatabaseService.get_supervisors()
    return jsonify(supervisors)

@api.route('/supervisors', methods=['PUT'])
@login_required
def set_supervisors():
    supervisors = request.get_json()
    success = DatabaseService.set_supervisors(supervisors)
    return jsonify({'success': success})