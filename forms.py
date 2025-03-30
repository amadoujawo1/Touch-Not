# forms.py
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SelectField, DateField, IntegerField, TextAreaField, SubmitField
from wtforms.validators import DataRequired, Email, EqualTo, Length, ValidationError, NumberRange
import re

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Sign In')

class RegisterForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=64)])
    password = PasswordField('Password', validators=[
        DataRequired(), 
        Length(min=8, message='Password must be at least 8 characters long')
    ])
    confirm_password = PasswordField('Confirm Password', validators=[
        DataRequired(), 
        EqualTo('password', message='Passwords must match')
    ])
    email = StringField('Email', validators=[DataRequired(), Email()])
    role = SelectField('Role', choices=[
        ('', 'Select a role'),
        ('teamLead', 'Team Lead'),
        ('dataAnalyst', 'Data Analyst'),
        ('cashController', 'Cash Controller')
    ], validators=[DataRequired()])
    gender = SelectField('Gender', choices=[
        ('', 'Select gender'),
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other')
    ], validators=[DataRequired()])
    telephone = StringField('Telephone', validators=[DataRequired()])
    submit = SubmitField('Create Account')
    
    def validate_password(self, field):
        password = field.data
        if not re.search(r'[A-Z]', password):
            raise ValidationError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', password):
            raise ValidationError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', password):
            raise ValidationError('Password must contain at least one number')
        if not re.search(r'[@$!%*?&]', password):
            raise ValidationError('Password must contain at least one special character (@$!%*?&)')

class ChangePasswordForm(FlaskForm):
    current_password = PasswordField('Current Password')
    new_password = PasswordField('New Password', validators=[
        DataRequired(),
        Length(min=8, message='Password must be at least 8 characters long')
    ])
    confirm_password = PasswordField('Confirm New Password', validators=[
        DataRequired(),
        EqualTo('new_password', message='Passwords must match')
    ])
    submit = SubmitField('Change Password')
    
    def validate_new_password(self, field):
        password = field.data
        if not re.search(r'[A-Z]', password):
            raise ValidationError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', password):
            raise ValidationError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', password):
            raise ValidationError('Password must contain at least one number')
        if not re.search(r'[@$!%*?&]', password):
            raise ValidationError('Password must contain at least one special character (@$!%*?&)')

class ReportForm(FlaskForm):
    date = DateField('Date', validators=[DataRequired()])
    ref_no = StringField('Reference Number', validators=[DataRequired()])
    supervisor = SelectField('Supervisor', validators=[DataRequired()])
    flight = SelectField('Flight', validators=[DataRequired()])
    zone = SelectField('Zone', choices=[
        ('', 'Select zone'),
        ('arrival', 'Arrival'),
        ('departure', 'Departure')
    ], validators=[DataRequired()])
    
    # Passenger counts
    total_attended = IntegerField('Total Attended', default=0, validators=[NumberRange(min=0)])
    paid = IntegerField('Paid', default=0, validators=[NumberRange(min=0)])
    diplomats = IntegerField('Diplomats', default=0, validators=[NumberRange(min=0)])
    infants = IntegerField('Infants', default=0, validators=[NumberRange(min=0)])
    not_paid = IntegerField('Not Paid', default=0, validators=[NumberRange(min=0)])
    paid_card_qr = IntegerField('Paid Card/QR', default=0, validators=[NumberRange(min=0)])
    refunds = IntegerField('Refunds', default=0, validators=[NumberRange(min=0)])
    deportees = IntegerField('Deportees', default=0, validators=[NumberRange(min=0)])
    transit = IntegerField('Transit', default=0, validators=[NumberRange(min=0)])
    waivers = IntegerField('Waivers', default=0, validators=[NumberRange(min=0)])
    prepaid_bank = IntegerField('Prepaid Bank', default=0, validators=[NumberRange(min=0)])
    round_trip = IntegerField('Round Trip', default=0, validators=[NumberRange(min=0)])
    late_payment = IntegerField('Late Payment', default=0, validators=[NumberRange(min=0)])
    
    # Additional information
    remarks = TextAreaField('Remarks')
    
    submit = SubmitField('Submit Data')

class VerificationForm(FlaskForm):
    iics_infant = IntegerField('IICS Infant', default=0, validators=[NumberRange(min=0)])
    iics_adult = IntegerField('IICS Adult', default=0, validators=[NumberRange(min=0)])
    gia_infant = IntegerField('GIA Infant', default=0, validators=[NumberRange(min=0)])
    gia_adult = IntegerField('GIA Adult', default=0, validators=[NumberRange(min=0)])
    submit = SubmitField('Verify Report')

class FlightSupervisorForm(FlaskForm):
    flight_name = StringField('Flight Name', validators=[DataRequired()])
    supervisor_name = StringField('Supervisor Name', validators=[DataRequired()])
    submit = SubmitField('Save')

class TeamLeadActivationForm(FlaskForm):
    team_lead = SelectField('Team Lead', validators=[DataRequired()])
    date = DateField('Date', validators=[DataRequired()])
    submit = SubmitField('Activate Team Lead Update')