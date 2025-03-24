# Cash Collection System

A Flask-based Daily Cash Collection Report application with role-based access control, data entry forms, and report management.

## Local Development Setup

### Prerequisites

1. Python 3.7 or higher
2. MySQL Server

### Database Setup

1. Create the MySQL database:
   ```sql
   CREATE DATABASE cash_collection;
   ```

2. Update credentials in `config.py` if needed:
   ```python
   SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:password@localhost/cash_collection'
   ```

### Installation

1. Install required packages:
   ```bash
   pip install flask flask-login flask-sqlalchemy flask-wtf sqlalchemy pymysql email-validator
   ```

2. Run the application:
   ```bash
   python main.py
   ```

3. Access the application at: http://localhost:5000

### Admin Login

- Username: `admin`
- Password: `admin123`

## Roles

- Admin: Manages users, flights, and supervisors
- Team Lead: Submits reports
- Data Analyst: Verifies reports
- Cash Controller: Views reports and exports data

## Database

The application uses a MySQL database with the following tables:
- users
- reports
- flights
- flight_supervisors
- team_lead_activations

## Environment Variables

- `DATABASE_URL`: MySQL connection string (optional)
- `SESSION_SECRET`: Secret key for session management (optional)