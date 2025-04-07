class DataEntryForm {
  constructor(container) {
    this.container = container;
    this.form = null;
    this.totalAttendedElement = null;
    this.confirmationDialog = null;
    this.init();
  }

  async init() {
    // Initialize confirmation dialog
    if (!window.confirmationDialog) {
      // Ensure ConfirmationDialog class is loaded
      if (typeof ConfirmationDialog === 'undefined') {
        console.error('ConfirmationDialog class not found');
        return;
      }
      window.confirmationDialog = new ConfirmationDialog();
    }
    this.confirmationDialog = window.confirmationDialog;
    try {
      const response = await fetch('/api/flights-supervisors');
      const data = await response.json();
      storage.setFlights(data.flights.map(name => ({ name })));
      storage.setSupervisors(data.supervisors.map(name => ({ name })));
    } catch (error) {
      console.error('Error fetching flights and supervisors:', error);
    }

    this.render({
      onSubmit: this.handleSubmit.bind(this),
      flights: this.getFlights(),
      supervisors: this.getSupervisors()
    });
    
    this.form = this.container.querySelector('#dataEntryForm');
    this.totalAttendedElement = document.getElementById('total_attended');
    
    if (this.form) {
      this.form.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', () => this.updateTotal());
      });
    }
  }

  calculateTotal(formData) {
    const sum = [
      'paid', 'diplomats', 'infants', 'not_paid', 'paid_card_qr',
      'deportees', 'transit', 'waivers', 'prepaid_bank',
      'round_trip', 'late_payment'
    ].reduce((sum, field) => sum + Number(formData[field] || 0), 0);
    return sum - Number(formData['refunds'] || 0);
  }

  updateTotal() {
    if (!this.form || !this.totalAttendedElement) return;
    
    const formData = Object.fromEntries(new FormData(this.form));
    const total = this.calculateTotal(formData);
    this.totalAttendedElement.value = total;
  }

  getFlights() {
    return storage.getFlights();
  }

  getSupervisors() {
    return storage.getSupervisors();
  }

  handleSubmit(event) {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(this.form));
    
    if (this.validateForm(formData)) {
      const totalAttended = this.calculateTotal(formData);
      const reportData = {
        ...formData,
        totalAttended,
        submittedBy: window.currentUser?.username,
        verified: false,
        date: new Date(formData.date).toISOString().split('T')[0]
      };

      // Always show confirmation dialog before submitting
      if (!window.confirmationDialog) {
        console.error('Confirmation dialog not initialized');
        return;
      }
      
      // Show confirmation dialog with total attended count
      window.confirmationDialog.show(totalAttended, () => {
        // Submit the form data to the server
        fetch(this.form.action, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reportData)
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            this.form.reset();
            // Update the DataTable if it exists
            const dataTable = document.querySelector('#dataTableContainer');
            if (dataTable) {
              const reports = storage.getReports();
              dataTable.render({
                data: reports,
                showVerification: false,
                canDownload: true
              });
            }
            window.dispatchEvent(new CustomEvent('reportUpdated', { detail: reportData }));
          } else {
            alert(data.message || 'Failed to submit report. Please try again.');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Failed to submit report. Please try again.');
        })
      });
    }
  }

  validateForm(formData) {
    const requiredFields = ['date', 'ref_no', 'supervisor', 'flight', 'zone'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        alert(`Please fill in the ${field.replace('_', ' ')} field.`);
        return false;
      }
    }

    const numericFields = [
      'paid', 'diplomats', 'infants', 'not_paid', 'paid_card_qr',
      'refunds', 'deportees', 'transit', 'waivers', 'prepaid_bank',
      'round_trip', 'late_payment'
    ];

    for (const field of numericFields) {
      const value = Number(formData[field]);
      if (isNaN(value) || value < 0) {
        alert(`${field.replace('_', ' ')} must be a non-negative number.`);
        return false;
      }
    }

    return true;
  }

  render({ onSubmit, flights, supervisors }) {
    this.container.innerHTML = `
      <form id="dataEntryForm" class="space-y-8 bg-gradient-to-b from-white to-gray-50 p-8 rounded-xl shadow-lg max-w-5xl mx-auto sm:p-6 md:p-8">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800 sm:text-xl md:text-2xl">Flight Data Entry Form</h2>
          <p class="text-gray-600 sm:text-sm md:text-base">Enter flight details and passenger information</p>
        </div>

        <!-- Flight Information Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sm:p-4 md:p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 sm:text-base md:text-lg">Flight Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-4">
            <div class="relative">
              <label class="block text-sm font-medium text-gray-700 mb-1 sm:text-xs md:text-sm">Date</label>
              <input
                type="date"
                name="date"
                required
                class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all sm:text-xs md:text-sm"
              />
            </div>
            <div class="relative">
              <label class="block text-sm font-medium text-gray-700 mb-1 sm:text-xs md:text-sm">Reference Number</label>
              <input
                type="text"
                name="ref_no"
                required
                placeholder="Enter reference number"
                class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all sm:text-xs md:text-sm"
              />
            </div>
            <div class="relative">
              <label class="block text-sm font-medium text-gray-700 mb-1 sm:text-xs md:text-sm">Supervisor</label>
              <select
                name="supervisor"
                required
                class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all sm:text-xs md:text-sm"
              >
                <option value="" disabled selected>Select Supervisor</option>
                ${supervisors.map(supervisor => `
                  <option value="${supervisor.name}">${supervisor.name}</option>
                `).join('')}
              </select>
            </div>
            <div class="relative">
              <label class="block text-sm font-medium text-gray-700 mb-1 sm:text-xs md:text-sm">Flight</label>
              <select
                name="flight"
                required
                class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all sm:text-xs md:text-sm"
              >
                <option value="" disabled selected>Select Flight</option>
                ${flights.map(flight => `
                  <option value="${flight.name}">${flight.name}</option>
                `).join('')}
              </select>
            </div>
            <div class="relative">
              <label class="block text-sm font-medium text-gray-700 mb-1 sm:text-xs md:text-sm">Zone</label>
              <select
                name="zone"
                required
                class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all sm:text-xs md:text-sm"
              >
                <option value="" disabled selected>Select zone</option>
                <option value="arrival">Arrival</option>
                <option value="departure">Departure</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Passenger Counts Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sm:p-4 md:p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 sm:text-base md:text-lg">Passenger Counts</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-2">
            ${
              [
                { label: 'Paid', name: 'paid', icon: '💰' },
                { label: 'Diplomats', name: 'diplomats', icon: '🎖️' },
                { label: 'Infants', name: 'infants', icon: '👶' },
                { label: 'Not Paid', name: 'not_paid', icon: '❌' },
                { label: 'Paid Card/QR', name: 'paid_card_qr', icon: '💳' },
                { label: 'Refunds', name: 'refunds', icon: '↩️' },
                { label: 'Deportees', name: 'deportees', icon: '🚫' },
                { label: 'Transit', name: 'transit', icon: '🔄' },
                { label: 'Waivers', name: 'waivers', icon: '📋' },
                { label: 'Prepaid Bank', name: 'prepaid_bank', icon: '🏦' },
                { label: 'Round Trip', name: 'round_trip', icon: '🔁' },
                { label: 'Late Payment', name: 'late_payment', icon: '⏰' },
              ].map(({ label, name, icon }) => `
                <div class="bg-gray-50 p-3 rounded-lg transition-all hover:shadow-md sm:p-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1 sm:text-xs md:text-sm">
                    ${icon} ${label}
                  </label>
                  <input
                    type="number"
                    name="${name}"
                    min="0"
                    value="0"
                    class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all sm:text-xs md:text-sm"
                  />
                </div>
              `).join('')
            }
          </div>
        </div>

        <div class="flex justify-between items-center space-x-4 mt-6">
          <div class="flex items-center">
            <label for="total_attended" class="text-gray-700 font-medium mr-2">Total Attended:</label>
            <input type="number" id="total_attended" name="total_attended" class="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-all duration-200" readonly>
          </div>
          <div class="flex space-x-4">
            <button type="reset"
                    class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-all duration-200 flex items-center shadow-md hover:shadow-lg transform hover:scale-[1.02]">
              <i class="fas fa-eraser mr-2"></i>Clear Form
            </button>
            <button type="submit" 
                    class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all duration-200 flex items-center shadow-md hover:shadow-lg transform hover:scale-[1.02]">
              <i class="fas fa-paper-plane mr-2"></i>Submit Report
            </button>
          </div>
        </div>
      </form>
    `;

    this.form = this.container.querySelector('#dataEntryForm');
    if (this.form) {
      this.form.addEventListener('submit', onSubmit);
      
      // Add event listener for the reset button
      const resetButton = this.form.querySelector('button[type="reset"]');
      if (resetButton) {
        resetButton.addEventListener('click', (e) => {
          e.preventDefault(); // Prevent default reset behavior
          if (confirm('Are you sure you want to clear the form? All data will be lost.')) {
            this.form.reset();
            if (this.totalAttendedElement) {
              this.totalAttendedElement.value = '0';
            }
          }
        });
      }
    }
  }
}

// Initialize the form when the document is ready
document.addEventListener('DOMContentLoaded', function() {
  const container = document.querySelector('#formContainer');
  if (container) {
    new DataEntryForm(container);
  }
});
