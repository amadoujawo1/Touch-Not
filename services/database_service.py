from datetime import datetime
from models import db, Report, Flight, FlightSupervisor, User

class DatabaseService:
    @staticmethod
    def get_reports():
        try:
            return Report.query.all()
        except Exception as error:
            print('Error getting reports:', error)
            return []

    @staticmethod
    def get_report_by_id(id):
        try:
            return Report.query.get(id)
        except Exception as error:
            print('Error getting report:', error)
            return None

    @staticmethod
    def get_reports_by_user(user_id):
        try:
            return Report.query.filter_by(submitted_by_id=user_id).all()
        except Exception as error:
            print('Error getting reports by user:', error)
            return []

    @staticmethod
    def save_report(report_data, user_id):
        try:
            new_report = Report(
                date=datetime.strptime(report_data['date'], '%Y-%m-%d').date(),
                ref_no=Report.generate_ref_no(),
                supervisor=report_data['supervisor'],
                flight_name=report_data['flight_name'],
                zone=report_data['zone'],
                paid=report_data.get('paid', 0),
                diplomats=report_data.get('diplomats', 0),
                infants=report_data.get('infants', 0),
                not_paid=report_data.get('not_paid', 0),
                paid_card_qr=report_data.get('paid_card_qr', 0),
                refunds=report_data.get('refunds', 0),
                deportees=report_data.get('deportees', 0),
                transit=report_data.get('transit', 0),
                waivers=report_data.get('waivers', 0),
                prepaid_bank=report_data.get('prepaid_bank', 0),
                round_trip=report_data.get('round_trip', 0),
                late_payment=report_data.get('late_payment', 0),
                submitted_by_id=user_id
            )
            new_report.total_attended = new_report.calculate_total()
            db.session.add(new_report)
            db.session.commit()
            return True
        except Exception as error:
            print('Error saving report:', error)
            db.session.rollback()
            return False

    @staticmethod
    def update_report(id, updated_data):
        try:
            report = Report.query.get(id)
            if report:
                for key, value in updated_data.items():
                    if hasattr(report, key):
                        setattr(report, key, value)
                report.total_attended = report.calculate_total()
                report.updated_at = datetime.utcnow()
                db.session.commit()
                return True
            return False
        except Exception as error:
            print('Error updating report:', error)
            db.session.rollback()
            return False

    @staticmethod
    def get_flights():
        try:
            return [flight.name for flight in Flight.query.all()]
        except Exception as error:
            print('Error getting flights:', error)
            return []

    @staticmethod
    def get_supervisors():
        try:
            return [supervisor.name for supervisor in FlightSupervisor.query.all()]
        except Exception as error:
            print('Error getting supervisors:', error)
            return []

    @staticmethod
    def set_flights(flights):
        try:
            # Clear existing flights
            Flight.query.delete()
            # Add new flights
            for flight_name in flights:
                db.session.add(Flight(name=flight_name))
            db.session.commit()
            return True
        except Exception as error:
            print('Error setting flights:', error)
            db.session.rollback()
            return False

    @staticmethod
    def set_supervisors(supervisors):
        try:
            # Clear existing supervisors
            FlightSupervisor.query.delete()
            # Add new supervisors
            for supervisor_name in supervisors:
                db.session.add(FlightSupervisor(name=supervisor_name))
            db.session.commit()
            return True
        except Exception as error:
            print('Error setting supervisors:', error)
            db.session.rollback()
            return False