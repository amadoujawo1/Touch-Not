const validation = {
  // Validate the main report data (for Data Analyst only)
  validateReport(data) {
    const errors = {};

    // Validate required fields
    const requiredFields = [
      { field: 'date', message: 'Date is required' },
      { field: 'refNo', message: 'Reference number is required' },
      { field: 'supervisor', message: 'Supervisor name is required' },
      { field: 'flight', message: 'Flight is required' },
      { field: 'zone', message: 'Zone is required' },
    ];

    requiredFields.forEach(({ field, message }) => {
      if (!data[field] || data[field].trim() === '') {
        errors[field] = message;
      }
    });

    // Validate numeric fields (non-negative)
    const numericFields = [
      { field: 'paid', message: 'Paid must be a non-negative number' },
      { field: 'diplomats', message: 'Diplomats must be a non-negative number' },
      { field: 'infants', message: 'Infants must be a non-negative number' },
      { field: 'notPaid', message: 'Not Paid must be a non-negative number' },
      { field: 'paidCardQr', message: 'Paid Card/QR must be a non-negative number' },
      { field: 'refunds', message: 'Refunds must be a non-negative number' },
      { field: 'deportees', message: 'Deportees must be a non-negative number' },
      { field: 'transit', message: 'Transit must be a non-negative number' },
      { field: 'waivers', message: 'Waivers must be a non-negative number' },
      { field: 'prepaidBank', message: 'Prepaid Bank must be a non-negative number' },
      { field: 'roundTrip', message: 'Round Trip must be a non-negative number' },
      { field: 'latePayment', message: 'Late Payment must be a non-negative number' },
    ];

    numericFields.forEach(({ field, message }) => {
      const value = Number(data[field]);
      if (isNaN(value) || value < 0) {
        errors[field] = message;
      }
    });

    return errors;
  },

  // Validate IICS and GIA fields (for Data Analyst only)
  validateIICSGIA(iicsInfant, iicsAdult, iicsTotal, giaInfant, giaAdult, giaTotal) {
    const errors = {};

    // Validate IICS fields
    if (iicsInfant === undefined || isNaN(iicsInfant) || iicsInfant < 0) {
      errors.iicsInfant = 'IICS Infant must be a non-negative number';
    }
    if (iicsAdult === undefined || isNaN(iicsAdult) || iicsAdult < 0) {
      errors.iicsAdult = 'IICS Adult must be a non-negative number';
    }
    if (iicsTotal === undefined || isNaN(iicsTotal) || iicsTotal < 0 || iicsTotal !== (iicsInfant + iicsAdult)) {
      errors.iicsTotal = 'IICS Total must be the sum of IICS Infant and IICS Adult';
    }

    // Validate GIA fields
    if (giaInfant === undefined || isNaN(giaInfant) || giaInfant < 0) {
      errors.giaInfant = 'GIA Infant must be a non-negative number';
    }
    if (giaAdult === undefined || isNaN(giaAdult) || giaAdult < 0) {
      errors.giaAdult = 'GIA Adult must be a non-negative number';
    }
    if (giaTotal === undefined || isNaN(giaTotal) || giaTotal < 0 || giaTotal !== (giaInfant + giaAdult)) {
      errors.giaTotal = 'GIA Total must be the sum of GIA Infant and GIA Adult';
    }

    return errors;
  },

  // Validate the difference between Total Attended and GIA/IICS Totals (for Data Analyst only)
  validateDifference(totalAttended, iicsTotal, giaTotal) {
    const errors = {};

    if (totalAttended === undefined || isNaN(totalAttended) || totalAttended < 0) {
      errors.totalAttended = 'Total Attended must be a non-negative number';
    }
    if (iicsTotal === undefined || isNaN(iicsTotal) || iicsTotal < 0) {
      errors.iicsTotal = 'IICS Total must be a non-negative number';
    }
    if (giaTotal === undefined || isNaN(giaTotal) || giaTotal < 0) {
      errors.giaTotal = 'GIA Total must be a non-negative number';
    }

    if (totalAttended < giaTotal || totalAttended < iicsTotal) {
      errors.difference = 'Total Attended cannot be less than GIA or IICS Total';
    }

    return errors;
  },
};