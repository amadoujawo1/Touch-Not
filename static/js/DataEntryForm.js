class DataEntryForm {
  constructor(formId) {
    this.form = document.getElementById(formId);
    this.totalAttendedElement = document.getElementById('totalAttended');
    this.resetButton = document.getElementById('resetButton');
    this.init();
  }

  init() {
    if (!this.form) return;
    
    // Add event listeners to calculate total
    this.form.querySelectorAll('input[type="number"]').forEach(input => {
      input.addEventListener('input', () => this.calculateTotal());
    });
    
    // Reset button confirmation
    if (this.resetButton) {
      this.resetButton.addEventListener('click', (e) => {
        if (!confirm('Are you sure you want to clear the form? All data will be cleared.')) {
          e.preventDefault();
        }
      });
    }
    
    // Form submission confirmation
    this.form.addEventListener('submit', (e) => {
      if (!this.validateForm()) {
        e.preventDefault();
        return false;
      }
      
      if (!confirm('Are you sure you want to submit this data? Once submitted, you cannot edit it.')) {
        e.preventDefault();
        return false;
      }
    });
    
    // Initial calculation
    this.calculateTotal();
  }

  calculateTotal() {
    if (!this.form || !this.totalAttendedElement) return;
    
    const formData = new FormData(this.form);
    const sum = [
      'paid', 'diplomats', 'infants', 'not_paid', 'paid_card_qr',
      'deportees', 'transit', 'waivers', 'prepaid_bank',
      'round_trip', 'late_payment'
    ].reduce((sum, field) => {
      return sum + Number(formData.get(field) || 0);
    }, 0);
    
    const refunds = Number(formData.get('refunds') || 0);
    this.totalAttendedElement.textContent = sum - refunds;
  }

  validateForm() {
    if (!this.form) return false;
    
    const formData = new FormData(this.form);
    
    // Required fields
    const requiredFields = ['date', 'ref_no', 'supervisor', 'flight', 'zone'];
    for (const field of requiredFields) {
      if (!formData.get(field)) {
        alert(`Please fill in the ${field.replace('_', ' ')} field.`);
        return false;
      }
    }
    
    // Validate numeric fields (non-negative)
    const numericFields = [
      'paid', 'diplomats', 'infants', 'not_paid', 'paid_card_qr',
      'refunds', 'deportees', 'transit', 'waivers', 'prepaid_bank',
      'round_trip', 'late_payment'
    ];
    
    for (const field of numericFields) {
      const value = Number(formData.get(field));
      if (isNaN(value) || value < 0) {
        alert(`${field.replace('_', ' ')} must be a non-negative number.`);
        return false;
      }
    }
    
    return true;
  }
}

// Initialize data entry form when document is ready
document.addEventListener('DOMContentLoaded', function() {
  const dataEntryForm = new DataEntryForm('dataEntryForm');
});
