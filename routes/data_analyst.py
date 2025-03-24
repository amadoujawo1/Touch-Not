from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify
from flask_login import login_required, current_user
from datetime import datetime
from app import db
from models import Report, User, TeamLeadActivation
from forms import VerificationForm, TeamLeadActivationForm

data_analyst_bp = Blueprint('data_analyst', __name__)

def data_analyst_required(f):
    @login_required
    def decorated_function(*args, **kwargs):
        if current_user.role != 'dataAnalyst':
            flash('You do not have permission to access this page.', 'danger')
            return redirect(url_for('auth.index'))
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

@data_analyst_bp.route('/dashboard')
@data_analyst_required
def dashboard():
    # Get active team leads for activation form
    team_leads = User.query.filter_by(role='teamLead', active=True).all()
    
    activation_form = TeamLeadActivationForm()
    activation_form.team_lead.choices = [('', 'Select Team Lead')] + [(str(tl.id), tl.username) for tl in team_leads]
    
    # Get reports for verification
    reports = Report.query.order_by(Report.date.desc()).all()
    
    # Get recent activations
    recent_activations = TeamLeadActivation.query.order_by(TeamLeadActivation.created_at.desc()).limit(5).all()
    
    return render_template('data_analyst/dashboard.html', 
                          reports=reports, 
                          activation_form=activation_form,
                          recent_activations=recent_activations)

@data_analyst_bp.route('/reports/<int:report_id>/verify', methods=['GET', 'POST'])
@data_analyst_required
def verify_report(report_id):
    report = Report.query.get_or_404(report_id)
    form = VerificationForm()
    
    if request.method == 'GET':
        # Pre-fill form with existing data if any
        if report.iics_infant:
            form.iics_infant.data = report.iics_infant
        if report.iics_adult:
            form.iics_adult.data = report.iics_adult
        if report.gia_infant:
            form.gia_infant.data = report.gia_infant
        if report.gia_adult:
            form.gia_adult.data = report.gia_adult
    
    if form.validate_on_submit():
        # Calculate totals
        iics_infant = form.iics_infant.data
        iics_adult = form.iics_adult.data
        iics_total = iics_infant + iics_adult
        
        gia_infant = form.gia_infant.data
        gia_adult = form.gia_adult.data
        gia_total = gia_infant + gia_adult
        
        # Update report with verification data
        report.iics_infant = iics_infant
        report.iics_adult = iics_adult
        report.iics_total = iics_total
        report.gia_infant = gia_infant
        report.gia_adult = gia_adult
        report.gia_total = gia_total
        report.verified = True
        report.verified_by_id = current_user.id
        
        db.session.commit()
        
        flash('Report has been verified successfully.', 'success')
        return redirect(url_for('data_analyst.dashboard'))
    
    return render_template('report_view.html', report=report, form=form)

@data_analyst_bp.route('/activate-team-lead', methods=['POST'])
@data_analyst_required
def activate_team_lead():
    form = TeamLeadActivationForm()
    
    # Get active team leads for the form
    team_leads = User.query.filter_by(role='teamLead', active=True).all()
    form.team_lead.choices = [('', 'Select Team Lead')] + [(str(tl.id), tl.username) for tl in team_leads]
    
    if form.validate_on_submit():
        team_lead_id = int(form.team_lead.data)
        date = form.date.data
        
        # Create activation record
        activation = TeamLeadActivation(
            team_lead_id=team_lead_id,
            date=date,
            activated_by_id=current_user.id
        )
        
        db.session.add(activation)
        db.session.commit()
        
        team_lead = User.query.get(team_lead_id)
        flash(f'Update activated for {team_lead.username} on {date.strftime("%Y-%m-%d")}.', 'success')
    else:
        for field, errors in form.errors.items():
            for error in errors:
                flash(f'{getattr(form, field).label.text}: {error}', 'danger')
    
    return redirect(url_for('data_analyst.dashboard'))

@data_analyst_bp.route('/api/reports')
@data_analyst_required
def get_reports():
    reports = Report.query.order_by(Report.date.desc()).all()
    return jsonify([report.to_dict() for report in reports])

@data_analyst_bp.route('/api/reports/unverified')
@data_analyst_required
def get_unverified_reports():
    reports = Report.query.filter_by(verified=False).order_by(Report.date.desc()).all()
    return jsonify([report.to_dict() for report in reports])
