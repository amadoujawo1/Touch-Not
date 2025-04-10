# Daily Cash Collection Report Application

A Flask-based web application for managing daily cash collection reports with role-based access control.

## Features

- Role-based access control (Admin, Team Lead, Data Analyst, Cash Controller)
- Flight and supervisor management
- Data entry forms for cash collection reports
- Report verification workflow
- Report viewing and filtering
- Data export functionality
- User management

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- MySQL Server (optional - can use SQLite instead)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/cash-collection-app.git
   cd cash-collection-app
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

### Database Configuration

You have two options for database configuration:

#### Option 1: Use SQLite (Simplest)

Set the environment variable to use SQLite:
- Linux/Mac: `export USE_SQLITE=1`
- Windows: `set USE_SQLITE=1`

#### Option 2: Use MySQL

1. Make sure MySQL server is running
2. Configure MySQL connection (optional - defaults shown below):
   - Linux/Mac:
     ```
     export MYSQL_USER=root
     export MYSQL_PASSWORD=your_password
     export MYSQL_HOST=localhost
     export MYSQL_DB=cash_collection
     ```
   - Windows:
     ```
     set MYSQL_USER=root
     set MYSQL_PASSWORD=your_password
     set MYSQL_HOST=localhost
     set MYSQL_DB=cash_collection
     ```

### Verify Database Connection

1. Run the database check utility:
   ```
   python check_db.py
   ```

2. Fix any issues reported by the utility.

### Run the Application

1. Start the application:
   ```
   python main.py
   ```

2. Access the application at `http://localhost:5000`

### Default Admin Account

- Username: `admin`
- Password: `admin123`

## Development

### Project Structure

- `app.py` - Flask application factory and configuration
- `config.py` - Configuration settings
- `models.py` - Database models
- `forms.py` - Flask-WTF form definitions
- `routes/` - Application routes organized by role
  - `auth.py` - Authentication routes
  - `admin.py` - Admin routes
  - `team_lead.py` - Team Lead routes
  - `data_analyst.py` - Data Analyst routes
  - `cash_controller.py` - Cash Controller routes
  - `common.py` - Common API endpoints
- `static/` - Static assets (CSS, JavaScript)
- `templates/` - HTML templates
- `utils/` - Utility functions

### Troubleshooting

#### Database Connection Issues

1. **Unknown database error**:
   - Make sure the database exists: `CREATE DATABASE cash_collection;`
   - Or set `USE_SQLITE=1` to use SQLite instead

2. **Access denied**:
   - Check your MySQL username and password
   - Set environment variables with correct credentials:
     ```
     export MYSQL_USER=your_username
     export MYSQL_PASSWORD=your_password
     ```

3. **Cannot connect to MySQL server**:
   - Ensure MySQL server is running
   - Check the host name/IP address is correct
   - Verify port settings if using a non-default port

## License

This project is licensed under the MIT License - see the LICENSE file for details.