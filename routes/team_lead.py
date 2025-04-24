from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify
from flask_login import login_required, current_user
from datetime import datetime
from extensions import db
from models import Report, Flight, FlightSupervisor, TeamLeadActivation
from forms import ReportForm
from utils.export import export_to_csv
from sqlalchemy.exc import IntegrityError  # Add for specific error handling

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
    flights = Flight.query.all()
    supervisors = FlightSupervisor.query.all()
    
    form = ReportForm()
    form.flight.choices = [(str(flight.name), str(flight.name)) for flight in flights]
    form.flight.choices.insert(0, ('', 'Select Flight'))
    form.supervisor.choices = [(str(supervisor.name), str(supervisor.name)) for supervisor in supervisors]
    form.supervisor.choices.insert(0, ('', 'Select Supervisor'))

    # Check for update activation
    is_update_activated = False
    activation = TeamLeadActivation.query.filter_by(team_lead_id=current_user.id).order_by(TeamLeadActivation.id.desc()).first()
    activated_date = None

    if activation and activation.date == datetime.now().date():
        is_update_activated = True
        activated_date = activation.created_at  # Using created_at instead of date
        is_update_activated = True
        activated_date = activation.created_at

    reports = Report.query.filter_by(submitted_by_id=current_user.id).order_by(Report.verified.asc(), Report.date.desc()).all()

    return render_template('team_lead/dashboard.html', form=form, reports=reports,
                          is_update_activated=is_update_activated,
                          activated_date=activated_date)

@team_lead_bp.route('/reports/submit', methods=['POST'])
@team_lead_required
def submit_report():
    flights = Flight.query.all()
    supervisors = FlightSupervisor.query.all()
    
    form = ReportForm()
    form.flight.choices = [(str(flight.name), str(flight.name)) for flight in flights]
    form.flight.choices.insert(0, ('', 'Select Flight'))
    form.supervisor.choices = [(str(supervisor.name), str(supervisor.name)) for supervisor in supervisors]
    form.supervisor.choices.insert(0, ('', 'Select Supervisor'))

    if not form.validate_on_submit():
        for field, errors in form.errors.items():
            for error in errors:
                flash(f'{getattr(form, field).label.text}: {error}', 'danger')
        return redirect(url_for('team_lead.dashboard'))

    try:
        # Check if reference number already exists
        existing_report = Report.query.filter_by(ref_no=form.ref_no.data).first()
        if existing_report:
            flash('A report with this reference number already exists.', 'danger')
            return redirect(url_for('team_lead.dashboard'))

        # Convert form data to integers with default value 0
        paid = int(form.paid.data or 0)
        diplomats = int(form.diplomats.data or 0)
        infants = int(form.infants.data or 0)
        not_paid = int(form.not_paid.data or 0)
        paid_card_qr = int(form.paid_card_qr.data or 0)
        refunds = int(form.refunds.data or 0)
        deportees = int(form.deportees.data or 0)
        transit = int(form.transit.data or 0)
        waivers = int(form.waivers.data or 0)
        prepaid_bank = int(form.prepaid_bank.data or 0)
        round_trip = int(form.round_trip.data or 0)
        late_payment = int(form.late_payment.data or 0)

        # Calculate total attended
        total_attended = (
            paid + diplomats + infants + 
            not_paid + paid_card_qr + 
            deportees + transit + waivers + 
            prepaid_bank + round_trip + late_payment
        ) - refunds

        report = Report(
            date=form.date.data,
            ref_no=form.ref_no.data,
            supervisor=form.supervisor.data,
            flight_name=form.flight.data,
            zone=form.zone.data,
            paid=paid,
            diplomats=diplomats,
            infants=infants,
            not_paid=not_paid,
            paid_card_qr=paid_card_qr,
            refunds=refunds,
            deportees=deportees,
            transit=transit,
            waivers=waivers,
            prepaid_bank=prepaid_bank,
            round_trip=round_trip,
            late_payment=late_payment,
            total_attended=total_attended,
            remarks=form.remarks.data,
            submitted_by_id=current_user.id
        )

        db.session.add(report)
        db.session.commit()

        flash('Report submitted successfully.', 'success')
        return redirect(url_for('team_lead.dashboard'))

    except IntegrityError:
        db.session.rollback()
        flash('A database integrity error occurred. Please ensure all fields are correct.', 'danger')
        return redirect(url_for('team_lead.dashboard'))
    except Exception as e:
        db.session.rollback()
        flash(f'An error occurred while submitting the report: {str(e)}. Please try again.', 'error')
        return redirect(url_for('team_lead.dashboard'))

@team_lead_bp.route('/reports/<int:report_id>/update', methods=['POST'])
@team_lead_required
def update_report(report_id):
    report = Report.query.get_or_404(report_id)

    if report.submitted_by_id != current_user.id:
        flash('You do not have permission to update this report.', 'danger')
        return redirect(url_for('team_lead.dashboard'))

    # Check if the team lead is activated for updates
    activation = TeamLeadActivation.query.filter_by(team_lead_id=current_user.id).order_by(TeamLeadActivation.id.desc()).first()
    is_activated = False

    if activation and activation.date == datetime.now().date():
        is_update_activated = True
        activated_date = activation.created_at  # Using created_at instead of date
        is_activated = True

    if not is_activated:
        flash('You do not have permission to update reports. Contact a Data Analyst for activation.', 'danger')
        return redirect(url_for('team_lead.dashboard'))

    # Get updated data from form
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

@team_lead_bp.route('/reports/<int:report_id>/edit')
@team_lead_required
def edit_report(report_id):
    report = Report.query.get_or_404(report_id)

    if report.submitted_by_id != current_user.id:
        flash('You do not have permission to edit this report.', 'danger')
        return redirect(url_for('team_lead.dashboard'))

    if report.verified:
        flash('This report has already been verified and cannot be edited.', 'danger')
        return redirect(url_for('team_lead.dashboard'))

    # Check if the team lead is activated for updates
    activation = TeamLeadActivation.query.filter_by(team_lead_id=current_user.id).order_by(TeamLeadActivation.id.desc()).first()
    is_activated = False

    if activation and activation.date == datetime.now().date():
        is_update_activated = True
        activated_date = activation.created_at  # Using created_at instead of date
        is_activated = True

    if not is_activated:
        flash('You do not have permission to edit reports. Contact a Data Analyst for activation.', 'danger')
        return redirect(url_for('team_lead.dashboard'))

    return render_template('team_lead/edit_report.html', report=report)



@team_lead_bp.route('/api/reports')
@team_lead_required
def get_reports():
    reports = Report.query.filter_by(submitted_by_id=current_user.id).order_by(Report.verified.asc(), Report.date.desc()).all()
    return jsonify([report.to_dict() for report in reports])

@team_lead_bp.route('/reports/<int:report_id>/download')
@team_lead_required
def download_report(report_id):
    report = Report.query.get_or_404(report_id)
    
    if report.submitted_by_id != current_user.id:
        flash('You do not have permission to download this report.', 'danger')
        return redirect(url_for('team_lead.dashboard'))
        
    if not report.verified:
        flash('Only verified reports can be downloaded.', 'warning')
        return redirect(url_for('team_lead.dashboard'))
    
    # Export single report to CSV
    return export_to_csv([report])

@team_lead_bp.route('/reports/<int:report_id>')
@team_lead_required
def view_report(report_id):
    report = Report.query.get_or_404(report_id)
    
    # Verify that this report belongs to the current user
    if report.submitted_by_id != current_user.id:
        flash('You do not have permission to view this report.', 'danger')
        return redirect(url_for('team_lead.dashboard'))
    
    from forms import VerificationForm
    form = VerificationForm()
    return render_template('report_view.html', report=report, form=form)

# Delete functionality removed for team leads

@team_lead_bp.route('/api/team-lead/flights-supervisors')
@team_lead_required
def get_team_lead_flights_supervisors():
    flights = Flight.query.all()
    supervisors = FlightSupervisor.query.all()
    return jsonify({
        'flights': [flight.name for flight in flights],
        'supervisors': [supervisor.name for supervisor in supervisors]
    })
