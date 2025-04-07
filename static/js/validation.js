/**
 * Utility for form validation
 */
class ValidationUtils {
  /**
   * Validate the main report data
   * @param {Object} data - Report data from form
   * @returns {Object} - Object containing validation errors
   */
  static validateReport(data) {
    const errors = {};

    // Validate required fields
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

    // Validate numeric fields (non-negative)
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

  /**
   * Validate IICS and GIA fields
   * @param {number} iicsInfant - IICS infant count
   * @param {number} iicsAdult - IICS adult count
   * @param {number} iicsTotal - IICS total count
   * @param {number} giaInfant - GIA infant count
   * @param {number} giaAdult - GIA adult count
   * @param {number} giaTotal - GIA total count
   * @returns {Object} - Object containing validation errors
   */
  static validateIICSGIA(iicsInfant, iicsAdult, iicsTotal, giaInfant, giaAdult, giaTotal) {
    const errors = {};

    // Validate IICS fields
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

    // Validate GIA fields
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

  /**
   * Validate the difference between Total Attended and GIA/IICS Totals
   * @param {number} totalAttended - Total attended count
   * @param {number} iicsTotal - IICS total count
   * @param {number} giaTotal - GIA total count
   * @returns {Object} - Object containing validation errors
   */
  static validateDifference(totalAttended, iicsTotal, giaTotal) {
    const errors = {};

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

  /**
   * Validate password complexity
   * @param {string} password - Password to validate
   * @returns {Object} - Object containing validation result and message
   */
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

  /**
   * Validate if passwords match
   * @param {string} password - Password
   * @param {string} confirmPassword - Confirm password
   * @returns {boolean} - True if passwords match
   */
  static passwordsMatch(password, confirmPassword) {
    return password === confirmPassword;
  }
}

// Add form validation on page load
document.addEventListener('DOMContentLoaded', function() {
  // Register form validation
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
        
        if (!document.getElementById('password-feedback')) {
          this.parentNode.appendChild(feedbackElement);
        }
      });
      
      confirmPasswordInput.addEventListener('input', function() {
        const passwordsMatch = ValidationUtils.passwordsMatch(
          passwordInput.value, this.value
        );
        
        const feedbackElement = document.getElementById('confirm-password-feedback') || 
                              document.createElement('div');
        
        feedbackElement.id = 'confirm-password-feedback';
        feedbackElement.className = passwordsMatch ? 
                                   'text-xs text-green-500 mt-1' : 
                                   'text-xs text-red-500 mt-1';
        feedbackElement.textContent = passwordsMatch ? 
                                     'Passwords match' : 
                                     'Passwords do not match';
        
        if (!document.getElementById('confirm-password-feedback')) {
          this.parentNode.appendChild(feedbackElement);
        }
      });
    }
  }
  
  // Verification form validation
  const verificationForm = document.getElementById('verificationForm');
  if (verificationForm) {
    const iicsInfantInput = document.getElementById('iics_infant');
    const iicsAdultInput = document.getElementById('iics_adult');
    const iicsTotalInput = document.getElementById('iics_total');
    const giaInfantInput = document.getElementById('gia_infant');
    const giaAdultInput = document.getElementById('gia_adult');
    const giaTotalInput = document.getElementById('gia_total');
    
    const calculateTotals = () => {
      // Calculate IICS total
      if (iicsInfantInput && iicsAdultInput && iicsTotalInput) {
        const iicsInfant = Number(iicsInfantInput.value || 0);
        const iicsAdult = Number(iicsAdultInput.value || 0);
        iicsTotalInput.value = iicsInfant + iicsAdult;
      }
      
      // Calculate GIA total
      if (giaInfantInput && giaAdultInput && giaTotalInput) {
        const giaInfant = Number(giaInfantInput.value || 0);
        const giaAdult = Number(giaAdultInput.value || 0);
        giaTotalInput.value = giaInfant + giaAdult;
      }
    };
    
    // Add event listeners
    [iicsInfantInput, iicsAdultInput, giaInfantInput, giaAdultInput].forEach(input => {
      if (input) {
        input.addEventListener('input', calculateTotals);
      }
    });
    
    // Initial calculation
    calculateTotals();
  }
});
