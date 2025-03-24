from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, current_user, login_required
from werkzeug.security import check_password_hash, generate_password_hash
from app import db
from models import User
from forms import LoginForm, RegisterForm

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/')
def index():
    if current_user.is_authenticated:
        if current_user.role == 'admin':
            return redirect(url_for('admin.dashboard'))
        elif current_user.role == 'teamLead':
            return redirect(url_for('team_lead.dashboard'))
        elif current_user.role == 'dataAnalyst':
            return redirect(url_for('data_analyst.dashboard'))
        elif current_user.role == 'cashController':
            return redirect(url_for('cash_controller.dashboard'))
    return redirect(url_for('auth.login'))

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('auth.index'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        
        if user and check_password_hash(user.password_hash, form.password.data) and user.active:
            login_user(user)
            next_page = request.args.get('next')
            return redirect(next_page or url_for('auth.index'))
        else:
            flash('Invalid credentials or user is deactivated. Please try again or contact Admin.', 'danger')
    
    return render_template('login.html', form=form)

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('auth.login'))

@auth_bp.route('/register', methods=['GET', 'POST'])
@login_required
def register():
    if current_user.role != 'admin':
        flash('Only Admin can create user accounts.', 'danger')
        return redirect(url_for('auth.index'))
    
    form = RegisterForm()
    if form.validate_on_submit():
        # Check if username already exists
        if User.query.filter_by(username=form.username.data).first():
            flash('Username already exists.', 'danger')
            return render_template('register.html', form=form)
        
        user = User(
            username=form.username.data,
            password_hash=generate_password_hash(form.password.data),
            email=form.email.data,
            role=form.role.data,
            gender=form.gender.data,
            telephone=form.telephone.data,
            active=True
        )
        
        db.session.add(user)
        db.session.commit()
        
        flash('User account created successfully.', 'success')
        return redirect(url_for('admin.manage_users'))
    
    return render_template('register.html', form=form)
