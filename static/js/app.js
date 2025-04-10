// Storage Utilities
class Storage {
  static REPORTS_KEY = 'reports';
  static ACTIVATED_TEAM_LEAD_KEY = 'activatedTeamLead';
  static FLIGHTS_KEY = 'flights';
  static SUPERVISORS_KEY = 'supervisors';

  static getReports() {
    try {
      const reports = JSON.parse(localStorage.getItem(this.REPORTS_KEY) || '[]');
      return reports;
    } catch (error) {
      console.error('Error getting reports:', error);
      return [];
    }
  }

  static getReportById(id) {
    const reports = this.getReports();
    return reports.find(report => report.id === id) || null;
  }

  static getReportsByUser(username) {
    const reports = this.getReports();
    return reports.filter(report => report.submittedBy === username);
  }

  static saveReport(report) {
    try {
      const reports = this.getReports();
      report.id = report.id || Date.now().toString();
      reports.push(report);
      localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));
      return true;
    } catch (error) {
      console.error('Error saving report:', error);
      return false;
    }
  }

  static updateReport(id, updatedData) {
    try {
      const reports = this.getReports();
      const index = reports.findIndex(report => report.id === id);
      if (index !== -1) {
        reports[index] = { ...reports[index], ...updatedData };
        localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating report:', error);
      return false;
    }
  }

  static isUpdateActivated(username, date) {
    try {
      const activation = JSON.parse(localStorage.getItem(this.ACTIVATED_TEAM_LEAD_KEY) || '{}');
      return activation.username === username && activation.date === date;
    } catch (error) {
      console.error('Error checking update activation:', error);
      return false;
    }
  }

  static setUpdateActivation(username, date) {
    try {
      localStorage.setItem(this.ACTIVATED_TEAM_LEAD_KEY, JSON.stringify({ username, date }));
      return true;
    } catch (error) {
      console.error('Error setting update activation:', error);
      return false;
    }
  }

  static clearUpdateActivation() {
    localStorage.removeItem(this.ACTIVATED_TEAM_LEAD_KEY);
  }

  static getFlights() {
    try {
      return JSON.parse(localStorage.getItem(this.FLIGHTS_KEY) || '[]');
    } catch (error) {
      console.error('Error getting flights:', error);
      return [];
    }
  }

  static getSupervisors() {
    try {
      return JSON.parse(localStorage.getItem(this.SUPERVISORS_KEY) || '[]');
    } catch (error) {
      console.error('Error getting supervisors:', error);
      return [];
    }
  }

  static setFlights(flights) {
    try {
      localStorage.setItem(this.FLIGHTS_KEY, JSON.stringify(flights));
      return true;
    } catch (error) {
      console.error('Error setting flights:', error);
      return false;
    }
  }

  static setSupervisors(supervisors) {
    try {
      localStorage.setItem(this.SUPERVISORS_KEY, JSON.stringify(supervisors));
      return true;
    } catch (error) {
      console.error('Error setting supervisors:', error);
      return false;
    }
  }
}

// Validation Utilities
class ValidationUtils {
  static validateReport(data) {
    const errors = {};

    const requiredFields = [
      { field: 'date', message: 'Date is required' },
      { field: 'ref_no', message: 'Reference number is required' },
      { field: 'supervisor', message: 'Supervisor name is required' },
      { field: 'flight', message: 'Flight is required' },
      { field: 'zone', message: 'Zone is required' },
    ];

    requiredFields.forEach(({ field, message }) => {
      if (!data[field] || String(data[field]).trim() === '') {
        errors[field] = message;
      }
    });

    const numericFields = [
      { field: 'paid', message: 'Paid must be a non-negative number' },
      { field: 'diplomats', message: 'Diplomats must be a non-negative number' },
      { field: 'infants', message: 'Infants must be a non-negative number' },
      { field: 'not_paid', message: 'Not Paid must be a non-negative number' },
      { field: 'paid_card_qr', message: 'Paid Card/QR must be a non-negative number' },
      { field: 'refunds', message: 'Refunds must be a non-negative number' },
      { field: 'deportees', message: 'Deportees must be a non-negative number' },
      { field: 'transit', message: 'Transit must be a non-negative number' },
      { field: 'waivers', message: 'Waivers must be a non-negative number' },
      { field: 'prepaid_bank', message: 'Prepaid Bank must be a non-negative number' },
      { field: 'round_trip', message: 'Round Trip must be a non-negative number' },
      { field: 'late_payment', message: 'Late Payment must be a non-negative number' },
    ];

    numericFields.forEach(({ field, message }) => {
      const value = Number(data[field]);
      if (value === undefined || value === null || isNaN(value) || value < 0) {
        errors[field] = message;
      }
    });

    return errors;
  }

  static validateIICSGIA(iicsInfant, iicsAdult, iicsTotal, giaInfant, giaAdult, giaTotal) {
    const errors = {};

    const validateNumber = (value, field) => {
      if (value === undefined || value === null || isNaN(value) || value < 0) {
        return `${field} must be a non-negative number`;
      }
      return null;
    };

    const iicsInfantError = validateNumber(iicsInfant, 'IICS Infant');
    if (iicsInfantError) errors.iicsInfant = iicsInfantError;

    const iicsAdultError = validateNumber(iicsAdult, 'IICS Adult');
    if (iicsAdultError) errors.iicsAdult = iicsAdultError;
    
    const calculatedIICSTotal = Number(iicsInfant || 0) + Number(iicsAdult || 0);
    if (iicsTotal !== calculatedIICSTotal) {
      errors.iicsTotal = 'IICS Total must be the sum of IICS Infant and IICS Adult';
    }

    const giaInfantError = validateNumber(giaInfant, 'GIA Infant');
    if (giaInfantError) errors.giaInfant = giaInfantError;

    const giaAdultError = validateNumber(giaAdult, 'GIA Adult');
    if (giaAdultError) errors.giaAdult = giaAdultError;
    
    const calculatedGIATotal = Number(giaInfant || 0) + Number(giaAdult || 0);
    if (giaTotal !== calculatedGIATotal) {
      errors.giaTotal = 'GIA Total must be the sum of GIA Infant and GIA Adult';
    }

    return errors;
  }

  static validateDifference(totalAttended, iicsTotal, giaTotal) {
    const errors = {};

    const validateNumber = (value, field) => {
      if (value === undefined || value === null || isNaN(value) || value < 0) {
        return `${field} must be a non-negative number`;
      }
      return null;
    };

    const totalAttendedError = validateNumber(totalAttended, 'Total Attended');
    if (totalAttendedError) errors.totalAttended = totalAttendedError;

    const iicsTotalError = validateNumber(iicsTotal, 'IICS Total');
    if (iicsTotalError) errors.iicsTotal = iicsTotalError;

    const giaTotalError = validateNumber(giaTotal, 'GIA Total');
    if (giaTotalError) errors.giaTotal = giaTotalError;

    if (totalAttended < giaTotal || totalAttended < iicsTotal) {
      errors.difference = 'Total Attended cannot be less than GIA or IICS Total';
    }

    return errors;
  }

  static validatePassword(password) {
    const result = {
      valid: true,
      message: 'Password meets all criteria'
    };

    if (!password || password.length < 8) {
      result.valid = false;
      result.message = 'Password must be at least 8 characters long';
      return result;
    }

    if (!/[A-Z]/.test(password)) {
      result.valid = false;
      result.message = 'Password must contain at least one uppercase letter';
      return result;
    }

    if (!/[a-z]/.test(password)) {
      result.valid = false;
      result.message = 'Password must contain at least one lowercase letter';
      return result;
    }

    if (!/[0-9]/.test(password)) {
      result.valid = false;
      result.message = 'Password must contain at least one number';
      return result;
    }

    if (!/[@$!%*?&]/.test(password)) {
      result.valid = false;
      result.message = 'Password must contain at least one special character (@$!%*?&)';
      return result;
    }

    return result;
  }

  static passwordsMatch(password, confirmPassword) {
    return password === confirmPassword;
  }
}

// Confirmation Dialog
class ConfirmationDialog {
  constructor() {
    this.dialog = null;
    this.confirmTotalAttended = null;
    this.onConfirm = null;
    this.init();
  }

  init() {
    if (!document.getElementById('confirmationDialog')) {
      const dialog = document.createElement('div');
      dialog.id = 'confirmationDialog';
      dialog.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden';
      dialog.innerHTML = `
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div class="mt-3 text-center">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Confirm Submission</h3>
            <div class="mt-2 px-7 py-3">
              <p class="text-sm text-gray-500">
                Total number of passengers attended: <span id="confirmTotalAttended" class="font-bold text-gray-700"></span>
              </p>
              <p class="mt-1 text-sm text-gray-500">Are you sure you want to submit this report?</p>
            </div>
            <div class="items-center px-4 py-3">
              <button id="confirmButton"
                class="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 mr-2">
                Confirm
              </button>
              <button id="cancelButton"
                class="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(dialog);
      this.dialog = dialog;
      this.confirmTotalAttended = document.getElementById('confirmTotalAttended');

      document.getElementById('cancelButton').addEventListener('click', () => {
        this.hide();
      });

      document.getElementById('confirmButton').addEventListener('click', () => {
        if (this.onConfirm) {
          this.onConfirm();
        }
        this.hide();
      });
    } else {
      this.dialog = document.getElementById('confirmationDialog');
    }
  }

  show(totalAttended, onConfirm) {
    if (this.dialog && this.confirmTotalAttended) {
      this.confirmTotalAttended.textContent = totalAttended;
      this.onConfirm = onConfirm;
      this.dialog.classList.remove('hidden');
    }
  }

  hide() {
    if (this.dialog) {
      this.dialog.classList.add('hidden');
    }
  }
}

// Create a single instance of ConfirmationDialog
const confirmationDialog = new ConfirmationDialog();
window.confirmationDialog = confirmationDialog;

// Main App Class
class App {
  constructor() {
    this.container = document.getElementById('app');
    this.currentUser = null;
    this.filteredReports = null;
    this.selectedDate = null;
    this.selectedTeamLead = null;
    this.inactivityTimeout = null;

    if (!Storage.findUser('admin')) {
      Storage.saveUser({
        username: 'admin',
        password: Storage.hashPassword('admin123'),
        role: 'admin',
        gender: 'other',
        email: 'admin@securiport.com',
        telephone: '123-456-7890'
      });
      Storage.saveFlightsAndSupervisors(['Brussel', 'Asky', 'Turkish Airline'], ['John Doe', 'Jane Smith', 'Bob Johnson']);
    }

    this.loadActivationData();
    this.init();
  }

  loadActivationData() {
    const activation = JSON.parse(localStorage.getItem(Storage.ACTIVATED_TEAM_LEAD_KEY) || '{}');
    if (this.currentUser && this.currentUser.role === 'teamLead' && activation.username === this.currentUser.username) {
      this.selectedDate = activation.date || null;
    }
  }

  init() {
    this.header = new Header(document.createElement('div'));
    this.welcomeMessage = new WelcomeMessage(document.createElement('div'));
    this.loginForm = new LoginForm(document.createElement('div'));
    this.registerForm = new RegisterForm(document.createElement('div'));
    this.dataEntryForm = new DataEntryForm(document.createElement('div'));
    this.dataTable = new DataTable(document.createElement('div'));
    this.setupInactivityLogout();
    this.showLoginScreen();
  }

  // ... rest of the App class implementation ...
}

// Initialize form validation on page load
document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    
    if (passwordInput && confirmPasswordInput) {
      passwordInput.addEventListener('input', function() {
        const validation = ValidationUtils.validatePassword(this.value);
        const feedbackElement = document.getElementById('password-feedback') || 
                              document.createElement('div');
        
        feedbackElement.id = 'password-feedback';
        feedbackElement.className = validation.valid ? 
                                   'text-xs text-green-500 mt-1' : 
                                   'text-xs text-red-500 mt-1';
        feedbackElement.textContent = validation.message;
        
        if (!this.parentNode.contains(feedbackElement)) {
          this.parentNode.appendChild(feedbackElement);
        }
      });

      confirmPasswordInput.addEventListener('input', function() {
        const validation = ValidationUtils.passwordsMatch(
          passwordInput.value,
          this.value
        );
        
        const feedbackElement = document.getElementById('confirm-password-feedback') || 
                              document.createElement('div');
        
        feedbackElement.id = 'confirm-password-feedback';
        feedbackElement.className = validation ? 
                                   'text-xs text-green-500 mt-1' : 
                                   'text-xs text-red-500 mt-1';
        feedbackElement.textContent = validation ? 
                                     'Passwords match' : 
                                     'Passwords do not match';
        
        if (!this.parentNode.contains(feedbackElement)) {
          this.parentNode.appendChild(feedbackElement);
        }
      });
    }
  }
});

// Export necessary classes and utilities
window.Storage = Storage;
window.ValidationUtils = ValidationUtils;
window.App = App;