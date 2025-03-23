class DataEntryForm {
  constructor(container) {
    this.container = container;
  }

  calculateTotal(formData) {
    const sum = [
      'paid', 'diplomats', 'infants', 'notPaid', 'paidCardQr',
      'deportees', 'transit', 'waivers', 'prepaidBank',
      'roundTrip', 'latePayment'
    ].reduce((sum, field) => sum + Number(formData[field] || 0), 0);
    return sum - Number(formData['refunds'] || 0);
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
                name="refNo"
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
                  <option value="${supervisor}">${supervisor}</option>
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
                  <option value="${flight}">${flight}</option>
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
            ${[
              { label: 'Paid', name: 'paid', icon: '💰' },
              { label: 'Diplomats', name: 'diplomats', icon: '🎖️' },
              { label: 'Infants', name: 'infants', icon: '👶' },
              { label: 'Not Paid', name: 'notPaid', icon: '❌' },
              { label: 'Paid Card/QR', name: 'paidCardQr', icon: '💳' },
              { label: 'Refunds', name: 'refunds', icon: '↩️' },
              { label: 'Deportees', name: 'deportees', icon: '🚫' },
              { label: 'Transit', name: 'transit', icon: '🔄' },
              { label: 'Waivers', name: 'waivers', icon: '📋' },
              { label: 'Prepaid Bank', name: 'prepaidBank', icon: '🏦' },
              { label: 'Round Trip', name: 'roundTrip', icon: '🔁' },
              { label: 'Late Payment', name: 'latePayment', icon: '⏰' },
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
                  placeholder="0"
                />
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Remarks Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sm:p-4 md:p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 sm:text-base md:text-lg">Additional Information</h3>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1 sm:text-xs md:text-sm">Remarks</label>
            <textarea
              name="remarks"
              rows="3"
              placeholder="Enter any additional remarks or notes"
              class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all sm:text-xs md:text-sm"
            ></textarea>
          </div>
        </div>

        <!-- Form Footer -->
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100 sm:p-4 md:p-6">
          <div class="text-lg font-semibold flex items-center gap-2 sm:text-base md:text-lg">
            <span class="text-gray-700 sm:text-sm md:text-base">Total Attended:</span>
            <span id="totalAttended" class="text-2xl text-blue-600 sm:text-xl md:text-2xl">0</span>
          </div>
          <div class="flex gap-4 flex-col sm:flex-row">
            <button
              type="button"
              id="resetButton"
              class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all sm:text-xs md:text-sm sm:px-3 sm:py-1 md:px-4 md:py-2"
            >
              Clear Form
            </button>
            <button
              type="submit"
              class="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all sm:text-xs md:text-sm sm:px-4 sm:py-1 md:px-6 md:py-2"
            >
              Submit Data
            </button>
          </div>
        </div>
      </form>
    `;

    const form = this.container.querySelector('#dataEntryForm');
    const totalAttendedSpan = this.container.querySelector('#totalAttended');
    const resetButton = this.container.querySelector('#resetButton');

    form.querySelectorAll('input[type="number"]').forEach(input => {
      input.addEventListener('input', () => {
        const formData = Object.fromEntries(new FormData(form));
        totalAttendedSpan.textContent = this.calculateTotal(formData);
      });
    });

    resetButton.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear the form? All data will be cleared.')) {
        form.reset();
        totalAttendedSpan.textContent = '0';
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(form));
      formData.totalAttended = this.calculateTotal(formData) - Number(formData['refunds'] || 0); // Subtract refunds from total attended
      
      if (Object.keys(validation.validateReport(formData)).length > 0) {
        this.showModal('Validation Error', 'Please fill all required fields correctly.', () => {});
        return;
      }

      this.showModal('Confirm Submission', 'Are you sure you want to submit this data? Once submitted, you cannot edit it.', () => {
        onSubmit(formData);
      });
    });
  }

  showModal(title, message, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="modal-content bg-white p-6 rounded-lg shadow-lg max-w-md w-full sm:max-w-lg md:max-w-xl">
        <h3 class="text-lg font-bold mb-4 sm:text-base md:text-lg">${title}</h3>
        <p class="mb-4 sm:text-sm md:text-base">${message}</p>
        <div class="flex justify-end gap-4">
          <button class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-gray-800 sm:text-sm md:text-base">Cancel</button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 sm:text-sm md:text-base" id="confirmBtn">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#confirmBtn').addEventListener('click', () => {
      onConfirm();
      document.body.removeChild(modal);
    });

    modal.querySelector('button:nth-child(1)').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  }
}