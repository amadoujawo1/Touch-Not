# models.py
from datetime import datetime
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
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    reports = db.relationship('Report', backref='submitter', lazy='dynamic', foreign_keys='Report.submitted_by_id')
    
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
    ref_no = db.Column(db.String(50), nullable=False)
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
        """Convert report to dictionary for API responses"""
        return {
            'id': self.id,
            'date': self.date.strftime('%Y-%m-%d'),
            'refNo': self.ref_no,
            'supervisor': self.supervisor,
            'flightName': self.flight_name,
            'zone': self.zone,
            'paid': self.paid,
            'diplomats': self.diplomats,
            'infants': self.infants,
            'notPaid': self.not_paid,
            'paidCardQr': self.paid_card_qr,
            'refunds': self.refunds,
            'deportees': self.deportees,
            'transit': self.transit,
            'waivers': self.waivers,
            'prepaidBank': self.prepaid_bank,
            'roundTrip': self.round_trip,
            'latePayment': self.late_payment,
            'totalAttended': self.total_attended,
            'iicsInfant': self.iics_infant,
            'iicsAdult': self.iics_adult,
            'iicsTotal': self.iics_total,
            'giaInfant': self.gia_infant,
            'giaAdult': self.gia_adult,
            'giaTotal': self.gia_total,
            'verified': self.verified,
            'remarks': self.remarks,
            'submittedBy': self.submitter.username if self.submitter else None,
            'verifiedBy': self.verified_by.username if self.verified_by else None
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