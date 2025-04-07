# models.py
from datetime import datetime, date
from flask_login import UserMixin
from extensions import db

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(20), nullable=False)  # admin, teamLead, dataAnalyst, cashController
    gender = db.Column(db.String(10), nullable=False)  # male, female, other
    telephone = db.Column(db.String(20), nullable=False)
    active = db.Column(db.Boolean, default=True)
    first_login = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    reports = db.relationship('Report', backref=db.backref('submitter', uselist=False), lazy='dynamic', foreign_keys='Report.submitted_by_id')
    
    def __repr__(self):
        return f'<User {self.username}>'

class FlightSupervisor(db.Model):
    __tablename__ = 'flight_supervisors'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    
    def __repr__(self):
        return f'<Supervisor {self.name}>'

class Flight(db.Model):
    __tablename__ = 'flights'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    
    def __repr__(self):
        return f'<Flight {self.name}>'

class Report(db.Model):
    __tablename__ = 'reports'
    
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    ref_no = db.Column(db.String(50), unique=True, nullable=False)
    
    @staticmethod
    def generate_ref_no():
        """Generate a unique reference number"""
        # Get the latest report ordered by id
        latest_report = Report.query.order_by(Report.id.desc()).first()
        
        # If no reports exist, start with 1, otherwise increment the last number
        if not latest_report:
            next_number = 1
        else:
            # Extract the number from the last ref_no and increment it
            try:
                last_number = int(latest_report.ref_no)
                next_number = last_number + 1
            except ValueError:
                # If the last ref_no wasn't a number, start with 1
                next_number = 1
        
        return str(next_number)
    
    supervisor = db.Column(db.String(100), nullable=False)
    flight_name = db.Column(db.String(100), nullable=False)
    zone = db.Column(db.String(20), nullable=False)  # arrival, departure
    
    # Passenger counts
    paid = db.Column(db.Integer, default=0)
    diplomats = db.Column(db.Integer, default=0)
    infants = db.Column(db.Integer, default=0)
    not_paid = db.Column(db.Integer, default=0)
    paid_card_qr = db.Column(db.Integer, default=0)
    refunds = db.Column(db.Integer, default=0)
    deportees = db.Column(db.Integer, default=0)
    transit = db.Column(db.Integer, default=0)
    waivers = db.Column(db.Integer, default=0)
    prepaid_bank = db.Column(db.Integer, default=0)
    round_trip = db.Column(db.Integer, default=0)
    late_payment = db.Column(db.Integer, default=0)
    total_attended = db.Column(db.Integer, default=0)
    
    # Verification data
    iics_infant = db.Column(db.Integer, default=0)
    iics_adult = db.Column(db.Integer, default=0)
    iics_total = db.Column(db.Integer, default=0)
    gia_infant = db.Column(db.Integer, default=0)
    gia_adult = db.Column(db.Integer, default=0)
    gia_total = db.Column(db.Integer, default=0)
    
    # Status
    verified = db.Column(db.Boolean, default=False)
    verified_date = db.Column(db.DateTime)
    remarks = db.Column(db.Text)
    
    # Relationships
    submitted_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    verified_by_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    verified_by = db.relationship('User', foreign_keys=[verified_by_id])
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Report {self.ref_no} - {self.date}>'
    
    def calculate_total(self):
        """Calculate total attended passengers"""
        return (
            self.paid + self.diplomats + self.infants + 
            self.not_paid + self.paid_card_qr + 
            self.deportees + self.transit + self.waivers + 
            self.prepaid_bank + self.round_trip + self.late_payment
        ) - self.refunds
    
    def to_dict(self):
        """Convert report to dictionary for API responses with proper JSON serialization"""
        try:
            total_attended = self.calculate_total()
        except (TypeError, AttributeError):
            total_attended = 0
            
        def safe_int(value):
            try:
                return int(value) if value is not None else 0
            except (TypeError, ValueError):
                return 0
                
        def safe_str(value):
            return str(value) if value else ''
            
        def safe_date(value):
            try:
                if value is None or value == "undefined" or value == "" or value == "null" or value == "NaN":
                    return None
                if isinstance(value, str):
                    value = value.strip()
                    if not value:
                        return None
                    try:
                        # Try to parse string as datetime with microseconds
                        parsed_date = datetime.strptime(value, '%Y-%m-%d %H:%M:%S.%f')
                        return parsed_date.strftime('%Y-%m-%d %H:%M:%S')
                    except ValueError:
                        try:
                            # Try to parse string as datetime
                            parsed_date = datetime.strptime(value, '%Y-%m-%d %H:%M:%S')
                            return parsed_date.strftime('%Y-%m-%d %H:%M:%S')
                        except ValueError:
                            try:
                                # Try to parse string as date
                                parsed_date = datetime.strptime(value, '%Y-%m-%d')
                                return parsed_date.strftime('%Y-%m-%d')
                            except ValueError:
                                return None
                if isinstance(value, datetime):
                    return value.strftime('%Y-%m-%d %H:%M:%S')
                if isinstance(value, date):
                    return value.strftime('%Y-%m-%d')
                return None
            except (AttributeError, ValueError, TypeError):
                return None
                
        def safe_username(user):
            if user is None or isinstance(user, type(None)) or user == "undefined":
                return ""
            try:
                # Handle User object directly
                if isinstance(user, User):
                    return user.username if hasattr(user, 'username') else ""
                # Handle user ID
                if isinstance(user, (int, str)):
                    try:
                        # Convert to string and strip any whitespace
                        user_str = str(user).strip()
                        # Check if the string is empty or contains invalid values
                        if not user_str or user_str.lower() in ["undefined", "null", "nan", ""]:
                            return ""
                        # Check if the string is a valid number
                        if user_str.isdigit():
                            user_id = int(user_str)
                            # First try to get user from relationships
                            if hasattr(self, 'verified_by') and self.verified_by and self.verified_by.id == user_id:
                                return self.verified_by.username
                            if hasattr(self, 'submitter') and self.submitter and self.submitter.id == user_id:
                                return self.submitter.username
                            # If not found in relationships, try database lookup
                            try:
                                user_obj = User.query.get(user_id)
                                if user_obj and hasattr(user_obj, 'username'):
                                    return user_obj.username
                            except Exception:
                                return ""
                    except (ValueError, TypeError, AttributeError):
                        return ""
                return ""
            except Exception:
                return ""
            
        def safe_bool(value):
            if value is None:
                return False
            return bool(value)
            
        return {
            'id': safe_int(self.id),
            'date': safe_date(self.date),
            'refNo': safe_str(self.ref_no),
            'supervisor': safe_str(self.supervisor),
            'flightName': safe_str(self.flight_name),
            'zone': safe_str(self.zone),
            'paid': safe_int(self.paid),
            'diplomats': safe_int(self.diplomats),
            'infants': safe_int(self.infants),
            'notPaid': safe_int(self.not_paid),
            'paidCardQr': safe_int(self.paid_card_qr),
            'refunds': safe_int(self.refunds),
            'deportees': safe_int(self.deportees),
            'transit': safe_int(self.transit),
            'waivers': safe_int(self.waivers),
            'prepaidBank': safe_int(self.prepaid_bank),
            'roundTrip': safe_int(self.round_trip),
            'latePayment': safe_int(self.late_payment),
            'totalAttended': safe_int(total_attended),
            'iicsInfant': safe_int(self.iics_infant),
            'iicsAdult': safe_int(self.iics_adult),
            'iicsTotal': safe_int(self.iics_total),
            'giaInfant': safe_int(self.gia_infant),
            'giaAdult': safe_int(self.gia_adult),
            'giaTotal': safe_int(self.gia_total),
            'verified': safe_bool(self.verified),
            'verifiedDate': safe_date(self.verified_date),
            'remarks': safe_str(self.remarks),
            'submittedBy': safe_username(self.submitted_by_id),
            'verifiedBy': safe_username(self.verified_by_id),
            'createdAt': safe_date(self.created_at),
            'updatedAt': safe_date(self.updated_at)
        }

class TeamLeadActivation(db.Model):
    __tablename__ = 'team_lead_activations'
    
    id = db.Column(db.Integer, primary_key=True)
    team_lead_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    activated_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    team_lead = db.relationship('User', foreign_keys=[team_lead_id])
    activated_by = db.relationship('User', foreign_keys=[activated_by_id])
    
    def __repr__(self):
        return f'<TeamLeadActivation {self.team_lead.username} - {self.date}>'