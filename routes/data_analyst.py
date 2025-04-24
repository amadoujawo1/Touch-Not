# routes/data_analyst.py
from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify, current_app, Response
from flask_login import login_required, current_user
from datetime import datetime
from models import Report, User, TeamLeadActivation
from forms import VerificationForm, TeamLeadActivationForm
from extensions import db

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
    
    # Get reports for verification, prioritizing recent and pending reports
    reports = Report.query.filter_by(verified=False).order_by(Report.date.desc()).all() + \
              Report.query.filter_by(verified=True).order_by(Report.date.desc()).limit(10).all()
    
    # Get recent activations
    recent_activations = TeamLeadActivation.query.order_by(TeamLeadActivation.created_at.desc()).limit(5).all()
    
    return render_template('data_analyst/dashboard.html', 
                          reports=reports, 
                          activation_form=activation_form,
                          recent_activations=recent_activations,
                          now=datetime.now())

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
        
        # Calculate differences
        iics_total_difference = iics_total - report.total_attended if report.total_attended else 0
        gia_total_difference = gia_total - report.total_attended if report.total_attended else 0
        
        # Update report with verification data
        report.iics_infant = iics_infant
        report.iics_adult = iics_adult
        report.iics_total = iics_total
        report.gia_infant = gia_infant
        report.gia_adult = gia_adult
        report.gia_total = gia_total
        report.iics_total_difference = iics_total_difference
        report.gia_total_difference = gia_total_difference
        report.verified = True
        report.verified_by_id = current_user.id
        report.verified_date = datetime.utcnow()
        
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

@data_analyst_bp.route('/verification-totals')
@data_analyst_required
def verification_totals():
    # Get today's reports
    today = datetime.utcnow().date()
    reports = Report.query.filter(Report.date == today).all()
    
    # Calculate totals
    iics_total = sum(r.iics_total or 0 for r in reports if r.verified)
    gia_total = sum(r.gia_total or 0 for r in reports if r.verified)
    iics_diff = sum((r.total_attended or 0) - (r.iics_total or 0) for r in reports if r.verified)
    gia_diff = sum((r.total_attended or 0) - (r.gia_total or 0) for r in reports if r.verified)
    
    return jsonify({
        'iics_total': iics_total,
        'gia_total': gia_total,
        'iics_diff': iics_diff,
        'gia_diff': gia_diff
    })

@data_analyst_bp.route('/get-recent-activations')
@data_analyst_required
def get_recent_activations():
    # Get recent activations
    recent_activations = TeamLeadActivation.query.order_by(TeamLeadActivation.created_at.desc()).limit(5).all()
    return render_template('data_analyst/activations_list.html',
                          recent_activations=recent_activations,
                          now=datetime.now())

@data_analyst_bp.route('/download-csv')
@data_analyst_required
def download_csv():
    from io import StringIO
    import csv
    from datetime import datetime

    # Get filter parameters
    supervisor = request.args.get('supervisor')
    flight = request.args.get('flight')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    # Base query
    query = Report.query

    # Apply filters
    if supervisor:
        query = query.filter(Report.supervisor.ilike(f'%{supervisor}%'))
    if flight:
        query = query.filter(Report.flight.ilike(f'%{flight}%'))
    if start_date:
        query = query.filter(Report.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
    if end_date:
        query = query.filter(Report.date <= datetime.strptime(end_date, '%Y-%m-%d').date())

    # Filter verified reports
    query = query.filter_by(verified=True)

    # Get filtered reports
    reports = query.order_by(Report.date.desc()).all()

    # Create CSV file
    si = StringIO()
    cw = csv.writer(si)
    
    # Write headers
    cw.writerow(['Date', 'Supervisor', 'Flight', 'IICS Total', 'GIA Total', 'Verified By', 'Verification Date'])
    
    # Write data
    for report in reports:
        verified_by = User.query.get(report.verified_by_id).username if report.verified_by_id else 'N/A'
        cw.writerow([
            report.date.strftime('%Y-%m-%d'),
            report.supervisor,
            report.flight_name,
            report.iics_total,
            report.gia_total,
            verified_by,
            report.verified_date.strftime('%Y-%m-%d') if report.verified_date else 'N/A'
        ])

    output = si.getvalue()
    si.close()

    return Response(
        output,
        mimetype='text/csv',
        headers={'Content-Disposition': f'attachment;filename=verified_reports_{datetime.now().strftime("%Y%m%d")}.csv'}
    )