# routes/cash_controller.py
from flask import Blueprint, render_template, redirect, url_for, request, jsonify, current_app
from flask_login import login_required, current_user
from models import Report
from utils.export import export_to_csv
from io import StringIO

cash_controller_bp = Blueprint('cash_controller', __name__)

def cash_controller_required(f):
    @login_required
    def decorated_function(*args, **kwargs):
        if current_user.role != 'cashController':
            return redirect(url_for('auth.index'))
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

@cash_controller_bp.route('/dashboard')
@cash_controller_required
def dashboard():
    reports = Report.query.filter_by(verified=True).order_by(Report.date.desc()).all()
    return render_template('cash_controller/dashboard.html', reports=reports)

@cash_controller_bp.route('/download-csv')
@cash_controller_required
def download_csv():
    # Get filter parameters
    supervisor = request.args.get('supervisor', '')
    flight = request.args.get('flight', '')
    start_date = request.args.get('start_date', '')
    end_date = request.args.get('end_date', '')
    
    # Build query with filters
    query = Report.query.filter_by(verified=True)
    
    if supervisor:
        query = query.filter(Report.supervisor.like(f'%{supervisor}%'))
    
    if flight:
        query = query.filter(Report.flight_name.like(f'%{flight}%'))
    
    if start_date:
        query = query.filter(Report.date >= start_date)
    
    if end_date:
        query = query.filter(Report.date <= end_date)
    
    reports = query.order_by(Report.date.desc()).all()
    
    # Export reports to CSV
    if not reports:
        return "No data to export", 404
    
    csv_data = export_to_csv(reports)
    return csv_data

@cash_controller_bp.route('/api/reports')
@cash_controller_required
def get_reports():
    # Get filter parameters
    supervisor = request.args.get('supervisor', '')
    flight = request.args.get('flight', '')
    start_date = request.args.get('start_date', '')
    end_date = request.args.get('end_date', '')
    
    # Build query with filters
    query = Report.query.filter_by(verified=True)
    
    if supervisor:
        query = query.filter(Report.supervisor.like(f'%{supervisor}%'))
    
    if flight:
        query = query.filter(Report.flight_name.like(f'%{flight}%'))
    
    if start_date:
        query = query.filter(Report.date >= start_date)
    
    if end_date:
        query = query.filter(Report.date <= end_date)
    
    reports = query.order_by(Report.date.desc()).all()
    
    return jsonify([report.to_dict() for report in reports])