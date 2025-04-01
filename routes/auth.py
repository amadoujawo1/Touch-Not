<<<<<<< HEAD

from flask import Blueprint, render_template, redirect, url_for, request, flash
from flask import Blueprint, render_template, redirect, url_for, request, flash
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import check_password_hash, generate_password_hash
from forms import LoginForm, RegisterForm, ChangePasswordForm
from models import User
from extensions import db

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
    # Always check for timeout first
    if request.args.get('timeout') == 'true':
        flash('Your session has expired due to inactivity. Please log in again.', 'warning')
        # Ensure user is logged out
        if current_user.is_authenticated:
            logout_user()
        return render_template('login.html', form=LoginForm())

    if current_user.is_authenticated:
        if current_user.role == 'admin':
            return redirect(url_for('admin.dashboard'))
        elif current_user.role == 'teamLead':
            return redirect(url_for('team_lead.dashboard'))
        elif current_user.role == 'dataAnalyst':
            return redirect(url_for('data_analyst.dashboard'))
        elif current_user.role == 'cashController':
            return redirect(url_for('cash_controller.dashboard'))

    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()

        if not user:
            flash('Invalid credentials. Please try again.', 'danger')
        elif not user.active:
            flash('Your account has been deactivated. Please contact Admin.', 'warning')
        elif not check_password_hash(user.password_hash, form.password.data):
            flash('Invalid password. Please try again.', 'danger')
        else:
            login_user(user)
            # Check if user's role is compatible with the requested page
            next_page = request.args.get('next')
            if next_page:
                # Prevent team lead from accessing cash controller/admin pages and vice versa
                if (user.role == 'teamLead' and ('cash_controller' in next_page or 'admin' in next_page)) or \
                   ((user.role == 'cashController' or user.role == 'admin') and 'team_lead' in next_page):
                    next_page = None

            if next_page:
                return redirect(next_page)
            elif user.role == 'admin':
                return redirect(url_for('admin.dashboard'))
            elif user.role == 'teamLead':
                return redirect(url_for('team_lead.dashboard'))
            elif user.role == 'dataAnalyst':
                return redirect(url_for('data_analyst.dashboard'))
            elif user.role == 'cashController':
                return redirect(url_for('cash_controller.dashboard'))

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
        if User.query.filter_by(username=form.username.data).first():
            flash('Username already exists.', 'danger')
            return render_template('register.html', form=form)

        user = User(
            username=form.username.data,
            password_hash=generate_password_hash('Securiport@123'),  # Admin sets a default password
            email=form.email.data,
            role=form.role.data,
            gender=form.gender.data,
            telephone=form.telephone.data,
            active=True
        )

        db.session.add(user)
        db.session.commit()

        flash('User account created successfully. User can change password after first login.', 'success')
        return redirect(url_for('auth.index'))

=======
# # routes/auth.py
# from flask import Blueprint, render_template, redirect, url_for, request, flash
# from flask_login import login_user, logout_user, login_required, current_user
# from werkzeug.security import check_password_hash, generate_password_hash
# from forms import LoginForm, RegisterForm
# from models import User
# from extensions import db

# auth_bp = Blueprint('auth', __name__)

# @auth_bp.route('/')
# def index():
#     if current_user.is_authenticated:
#         return redirect(url_for('admin.dashboard'))
#     return redirect(url_for('auth.login'))

# @auth_bp.route('/login', methods=['GET', 'POST'])
# def login():
#     if current_user.is_authenticated:
#         return redirect(url_for('admin.dashboard'))

#     form = LoginForm()
#     if form.validate_on_submit():
#         user = User.query.filter_by(username=form.username.data).first()

#         if user and check_password_hash(user.password_hash, form.password.data) and user.active:
#             login_user(user)
#             next_page = request.args.get('next')
#             return redirect(next_page or url_for('admin.dashboard'))
#         else:
#             flash('Invalid credentials or user is deactivated. Please try again or contact Admin.', 'danger')

#     return render_template('login.html', form=form)

# @auth_bp.route('/logout')
# @login_required
# def logout():
#     logout_user()
#     flash('You have been logged out.', 'info')
#     return redirect(url_for('auth.login'))

# @auth_bp.route('/register', methods=['GET', 'POST'])
# @login_required
# def register():
#     if current_user.role != 'admin':
#         flash('Only Admin can create user accounts.', 'danger')
#         return redirect(url_for('auth.index'))

#     form = RegisterForm()
#     if form.validate_on_submit():
#         if User.query.filter_by(username=form.username.data).first():
#             flash('Username already exists.', 'danger')
#             return render_template('register.html', form=form)

#         user = User(
#             username=form.username.data,
#             password_hash=generate_password_hash(form.password.data),
#             email=form.email.data,
#             role=form.role.data,
#             gender=form.gender.data,
#             telephone=form.telephone.data,
#             active=True
#         )

#         db.session.add(user)
#         db.session.commit()

#         flash('User account created successfully.', 'success')
#         return redirect(url_for('auth.index'))

#     return render_template('register.html', form=form)




# routes/auth.py
from flask import Blueprint, render_template, redirect, url_for, request, flash
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import check_password_hash, generate_password_hash
from forms import LoginForm, RegisterForm
from models import User
from extensions import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('admin.dashboard'))
    return redirect(url_for('auth.login'))

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('admin.dashboard'))

    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()

        if user and check_password_hash(user.password_hash, form.password.data) and user.active:
            login_user(user)
            next_page = request.args.get('next')
            return redirect(next_page or url_for('admin.dashboard'))
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
        if User.query.filter_by(username=form.username.data).first():
            flash('Username already exists.', 'danger')
            return render_template('register.html', form=form)

        user = User(
            username=form.username.data,
            password_hash=generate_password_hash('Securiport@123'),  # Admin sets a default password
            email=form.email.data,
            role=form.role.data,
            gender=form.gender.data,
            telephone=form.telephone.data,
            active=True
        )

        db.session.add(user)
        db.session.commit()

        flash('User account created successfully. User can change password after first login.', 'success')
        return redirect(url_for('auth.index'))

>>>>>>> 98107f59a4616fd4b5fc6c38d9276c6029e43b1d
    return render_template('register.html', form=form)