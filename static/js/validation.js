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

// Export the ValidationUtils class
window.ValidationUtils = ValidationUtils;