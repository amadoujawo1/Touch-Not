
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
#             password_hash=generate_password_hash('Securiport@123'),  # Admin sets a default password
#             email=form.email.data,
#             role=form.role.data,
#             gender=form.gender.data,
#             telephone=form.telephone.data,
#             active=True
#         )

#         db.session.add(user)
#         db.session.commit()

#         flash('User account created successfully. User can change password after first login.', 'success')
#         return redirect(url_for('auth.index'))

#     return render_template('register.html', form=form)

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
        if current_user.first_login:
            return redirect(url_for('auth.change_password'))
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
            if user.first_login:
                return redirect(url_for('auth.change_password'))
            
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

@auth_bp.route('/change-password', methods=['GET', 'POST'])
@login_required
def change_password():
    if request.method == 'POST':
        current_password = request.form.get('current_password')
        new_password = request.form.get('new_password')
        confirm_password = request.form.get('confirm_password')
        
        # Validate current password
        if not check_password_hash(current_user.password_hash, current_password):
            flash('Current password is incorrect.', 'danger')
            return render_template('change_password.html')
        
        # Validate new password
        if new_password != confirm_password:
            flash('New passwords do not match.', 'danger')
            return render_template('change_password.html')
        
        # Password complexity validation
        if len(new_password) < 8:
            flash('Password must be at least 8 characters long.', 'danger')
            return render_template('change_password.html')
        if not any(c.isupper() for c in new_password):
            flash('Password must contain at least one uppercase letter.', 'danger')
            return render_template('change_password.html')
        if not any(c.islower() for c in new_password):
            flash('Password must contain at least one lowercase letter.', 'danger')
            return render_template('change_password.html')
        if not any(c.isdigit() for c in new_password):
            flash('Password must contain at least one number.', 'danger')
            return render_template('change_password.html')
        if not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in new_password):
            flash('Password must contain at least one special character.', 'danger')
            return render_template('change_password.html')
        
        # Update password and first_login status
        current_user.password_hash = generate_password_hash(new_password)
        current_user.first_login = False
        db.session.commit()
        
        flash('Password changed successfully.', 'success')
        
        # Redirect based on role
        if current_user.role == 'admin':
            return redirect(url_for('admin.dashboard'))
        elif current_user.role == 'teamLead':
            return redirect(url_for('team_lead.dashboard'))
        elif current_user.role == 'dataAnalyst':
            return redirect(url_for('data_analyst.dashboard'))
        elif current_user.role == 'cashController':
            return redirect(url_for('cash_controller.dashboard'))
    
    return render_template('change_password.html')

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

    return render_template('register.html', form=form)