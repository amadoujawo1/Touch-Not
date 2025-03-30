# routes/admin.py
from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify, current_app
from flask_login import login_required, current_user
from werkzeug.security import generate_password_hash
from models import User, Flight, FlightSupervisor
from forms import RegisterForm, FlightSupervisorForm
from extensions import db



admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    @login_required
    def decorated_function(*args, **kwargs):
        if current_user.role != 'admin':
            flash('You do not have permission to access this page.', 'danger')
            return redirect(url_for('auth.index'))
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

@admin_bp.route('/dashboard')
@admin_required
def dashboard():
    # Get counts for dashboard
    user_count = User.query.count()
    team_lead_count = User.query.filter_by(role='teamLead').count()
    data_analyst_count = User.query.filter_by(role='dataAnalyst').count()
    cash_controller_count = User.query.filter_by(role='cashController').count()
    
    return render_template('admin/dashboard.html', 
                          user_count=user_count, 
                          team_lead_count=team_lead_count,
                          data_analyst_count=data_analyst_count,
                          cash_controller_count=cash_controller_count)

@admin_bp.route('/users')
@admin_required
def manage_users():
    search_term = request.args.get('search', '')
    
    if search_term:
        users = User.query.filter(User.username.like(f'%{search_term}%')).all()
    else:
        users = User.query.all()
    
    return render_template('admin/manage_users.html', users=users, search_term=search_term)

@admin_bp.route('/users/<int:user_id>/activate', methods=['POST'])
@admin_required
def activate_user(user_id):
    user = User.query.get_or_404(user_id)
    user.active = True
    current_app.db.session.commit()
    flash(f'User {user.username} has been activated.', 'success')
    return redirect(url_for('admin.manage_users'))

@admin_bp.route('/users/<int:user_id>/deactivate', methods=['POST'])
@admin_required
def deactivate_user(user_id):
    user = User.query.get_or_404(user_id)
    if user.username == 'admin':
        flash('Cannot deactivate admin user.', 'danger')
    else:
        user.active = False
        current_app.db.session.commit()
        flash(f'User {user.username} has been deactivated.', 'success')
    return redirect(url_for('admin.manage_users'))

@admin_bp.route('/users/<int:user_id>/delete', methods=['POST'])
@admin_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    if user.username == 'admin':
        flash('Cannot delete admin user.', 'danger')
    else:
        current_app.db.session.delete(user)
        current_app.db.session.commit()
        flash(f'User {user.username} has been deleted.', 'success')
    return redirect(url_for('admin.manage_users'))

@admin_bp.route('/users/<int:user_id>/reset-password', methods=['POST'])
@admin_required
def reset_password(user_id):
    user = User.query.get_or_404(user_id)
    new_password = request.form.get('new_password')
    
    if not new_password:
        flash('Password is required.', 'danger')
    else:
        user.password_hash = generate_password_hash(new_password)
        db.session.commit()
        flash(f'Password for {user.username} has been reset.', 'success')
    
    return redirect(url_for('admin.manage_users'))

@admin_bp.route('/flights-supervisors')
@admin_required
def manage_flights_supervisors():
    flights = Flight.query.all()
    supervisors = FlightSupervisor.query.all()
    form = FlightSupervisorForm()
    
    return render_template('admin/manage_flights.html', 
                          flights=flights, 
                          supervisors=supervisors, 
                          form=form)

@admin_bp.route('/flights', methods=['POST'])

@admin_required
def add_flight():
    flight_name = request.form.get('flight_name')
    
    if not flight_name:
        flash('Flight name is required.', 'danger')
    else:
        existing_flight = Flight.query.filter_by(name=flight_name).first()
        if existing_flight:
            flash(f'Flight "{flight_name}" already exists.', 'danger')
        else:
            flight = Flight(name=flight_name)
            db.session.add(flight)
            db.session.commit()
            flash(f'Flight "{flight_name}" has been added.', 'success')
    
    return redirect(url_for('admin.manage_flights_supervisors'))

@admin_bp.route('/flights/<int:flight_id>/delete', methods=['POST'])
@admin_required
def delete_flight(flight_id):
    flight = Flight.query.get_or_404(flight_id)
    db.session.delete(flight)
    db.session.commit()
    flash(f'Flight "{flight.name}" has been deleted.', 'success')
    return redirect(url_for('admin.manage_flights_supervisors'))

@admin_bp.route('/supervisors', methods=['POST'])
@admin_required
def add_supervisor():
    supervisor_name = request.form.get('supervisor_name')
    
    if not supervisor_name:
        flash('Supervisor name is required.', 'danger')
    else:
        existing_supervisor = FlightSupervisor.query.filter_by(name=supervisor_name).first()
        if existing_supervisor:
            flash(f'Supervisor "{supervisor_name}" already exists.', 'danger')
        else:
            supervisor = FlightSupervisor(name=supervisor_name)
            db.session.add(supervisor)
            db.session.commit()
            flash(f'Supervisor "{supervisor_name}" has been added.', 'success')
    
    return redirect(url_for('admin.manage_flights_supervisors'))

@admin_bp.route('/supervisors/<int:supervisor_id>/delete', methods=['POST'])
@admin_required
def delete_supervisor(supervisor_id):
    supervisor = FlightSupervisor.query.get_or_404(supervisor_id)
    db.session.delete(supervisor)
    db.session.commit()
    flash(f'Supervisor "{supervisor.name}" has been deleted.', 'success')
    return redirect(url_for('admin.manage_flights_supervisors'))

@admin_bp.route('/api/flights')
@admin_required
def get_flights():
    flights = Flight.query.all()
    return jsonify([flight.name for flight in flights])

@admin_bp.route('/api/supervisors')
@admin_required
def get_supervisors():
    supervisors = FlightSupervisor.query.all()
    return jsonify([supervisor.name for supervisor in supervisors])