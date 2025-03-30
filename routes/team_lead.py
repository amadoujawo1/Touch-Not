# routes/team_lead.py
from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify
from flask_login import login_required, current_user
from datetime import datetime
from extensions import db
from models import Report, Flight, FlightSupervisor, TeamLeadActivation
from forms import ReportForm

team_lead_bp = Blueprint('team_lead', __name__)

def team_lead_required(f):
    @login_required
    def decorated_function(*args, **kwargs):
        if current_user.role != 'teamLead':
            flash('You do not have permission to access this page.', 'danger')
            return redirect(url_for('auth.index'))
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

@team_lead_bp.route('/dashboard')
@team_lead_required
def dashboard():
    # Get flights and supervisors for form
    flights = Flight.query.all()
    supervisors = FlightSupervisor.query.all()

    # Create a new form with dynamic choices
    form = ReportForm()
    form.flight.choices = [('', 'Select Flight')] + [(flight.name, flight.name) for flight in flights]
    form.supervisor.choices = [('', 'Select Supervisor')] + [(supervisor.name, supervisor.name) for supervisor in supervisors]

    # Check if team lead has update activation
    is_update_activated = False
    activation = TeamLeadActivation.query.filter_by(team_lead_id=current_user.id).order_by(TeamLeadActivation.id.desc()).first()
    activated_date = None

    if activation:
        today = datetime.now().date()
        if activation.date == today:
            is_update_activated = True
            activated_date = activation.date

    # Get reports submitted by this team lead
    reports = Report.query.filter_by(submitted_by_id=current_user.id).order_by(Report.date.desc()).all()

    return render_template('team_lead/dashboard.html', 
                          form=form, 
                          reports=reports, 
                          is_update_activated=is_update_activated,
                          activated_date=activated_date)

@team_lead_bp.route('/reports/submit', methods=['POST'])
@team_lead_required
def submit_report():
    flights = Flight.query.all()
    supervisors = FlightSupervisor.query.all()

    form = ReportForm()
    form.flight.choices = [('', 'Select Flight')] + [(flight.name, flight.name) for flight in flights]
    form.supervisor.choices = [('', 'Select Supervisor')] + [(supervisor.name, supervisor.name) for supervisor in supervisors]

    if form.validate_on_submit():
        # Calculate total attended
        total_attended = (
            form.paid.data + form.diplomats.data + form.infants.data + 
            form.not_paid.data + form.paid_card_qr.data + 
            form.deportees.data + form.transit.data + form.waivers.data + 
            form.prepaid_bank.data + form.round_trip.data + form.late_payment.data
        ) - form.refunds.data

        report = Report(
            date=form.date.data,
            ref_no=form.ref_no.data,
            supervisor=form.supervisor.data,
            flight_name=form.flight.data,
            zone=form.zone.data,
            paid=form.paid.data,
            diplomats=form.diplomats.data,
            infants=form.infants.data,
            not_paid=form.not_paid.data,
            paid_card_qr=form.paid_card_qr.data,
            refunds=form.refunds.data,
            deportees=form.deportees.data,
            transit=form.transit.data,
            waivers=form.waivers.data,
            prepaid_bank=form.prepaid_bank.data,
            round_trip=form.round_trip.data,
            late_payment=form.late_payment.data,
            total_attended=total_attended,
            remarks=form.remarks.data,
            submitted_by_id=current_user.id
        )

        db.session.add(report)
        db.session.commit()

        flash('Report submitted successfully.', 'success')
        return redirect(url_for('team_lead.dashboard'))

    for field, errors in form.errors.items():
        for error in errors:
            flash(f'{getattr(form, field).label.text}: {error}', 'danger')

    return redirect(url_for('team_lead.dashboard'))

@team_lead_bp.route('/reports/<int:report_id>/update', methods=['POST'])
@team_lead_required
def update_report(report_id):
    report = Report.query.get_or_404(report_id)

    # Verify that this report belongs to the current user
    if report.submitted_by_id != current_user.id:
        flash('You do not have permission to update this report.', 'danger')
        return redirect(url_for('team_lead.dashboard'))

    # Check if the team lead is activated for updates
    activation = TeamLeadActivation.query.filter_by(team_lead_id=current_user.id).order_by(TeamLeadActivation.id.desc()).first()
    is_activated = False

    if activation:
        today = datetime.now().date()
        if activation.date == today:
            is_activated = True

    if not is_activated:
        flash('You do not have permission to update reports. Contact a Data Analyst for activation.', 'danger')
        return redirect(url_for('team_lead.dashboard'))

    # Get data from request
    paid = int(request.form.get('paid', 0))
    diplomats = int(request.form.get('diplomats', 0))
    infants = int(request.form.get('infants', 0))
    not_paid = int(request.form.get('not_paid', 0))
    paid_card_qr = int(request.form.get('paid_card_qr', 0))
    refunds = int(request.form.get('refunds', 0))
    deportees = int(request.form.get('deportees', 0))
    transit = int(request.form.get('transit', 0))
    waivers = int(request.form.get('waivers', 0))
    prepaid_bank = int(request.form.get('prepaid_bank', 0))
    round_trip = int(request.form.get('round_trip', 0))
    late_payment = int(request.form.get('late_payment', 0))
    remarks = request.form.get('remarks', '')

    # Calculate total attended
    total_attended = (
        paid + diplomats + infants + not_paid + paid_card_qr + 
        deportees + transit + waivers + prepaid_bank + round_trip + late_payment
    ) - refunds

    # Update report
    report.paid = paid
    report.diplomats = diplomats
    report.infants = infants
    report.not_paid = not_paid
    report.paid_card_qr = paid_card_qr
    report.refunds = refunds
    report.deportees = deportees
    report.transit = transit
    report.waivers = waivers
    report.prepaid_bank = prepaid_bank
    report.round_trip = round_trip
    report.late_payment = late_payment
    report.total_attended = total_attended
    report.remarks = remarks
    report.verified = False  # Reset verification status
    report.verified_by_id = None

    db.session.commit()

    flash('Report updated successfully. It will need to be verified again.', 'success')
    return redirect(url_for('team_lead.dashboard'))

@team_lead_bp.route('/api/reports')
@team_lead_required
def get_reports():
    reports = Report.query.filter_by(submitted_by_id=current_user.id).order_by(Report.date.desc()).all()
    return jsonify([report.to_dict() for report in reports])