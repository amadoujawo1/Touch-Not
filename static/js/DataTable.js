class DataTable {
  constructor(container) {
    this.container = container;
    this.currentUser = null; // Store the current user for role-based checks
    this.uniqueSupervisors = [];
    this.uniqueFlights = [];
  }

  setCurrentUser(user) {
    this.currentUser = user;
  }

  render({ data, showVerification, onVerify, onUpdate, onDownload, canDownload }) {
    this.data = data;
    this.showVerification = showVerification;
    this.onVerify = onVerify;
    this.onUpdate = onUpdate;
    this.onDownload = onDownload;
    this.canDownload = canDownload;

    // Extract unique supervisors and flights
    this.uniqueSupervisors = [...new Set(data.map(item => item.supervisor))].sort();
    this.uniqueFlights = [...new Set(data.map(item => item.flightName).filter(Boolean))].sort();

    this.container.innerHTML = `
      <div class="space-y-4">
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <div class="p-4 bg-gray-50 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-800">Filter Reports</h3>
          </div>
          <div class="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="space-y-2">
              <label for="supervisorFilter" class="block text-sm font-medium text-gray-700">Supervisor</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <i class="fas fa-user"></i>
                </span>
                <select id="supervisorFilter" 
                  class="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                  <option value="">All Supervisors</option>
                  ${this.uniqueSupervisors.map(supervisor => `<option value="${supervisor}">${supervisor}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="space-y-2">
              <label for="flightFilter" class="block text-sm font-medium text-gray-700">Flight</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <i class="fas fa-plane"></i>
                </span>
                <select id="flightFilter" 
                  class="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                  <option value="">All Flights</option>
                  ${this.uniqueFlights.map(flight => `<option value="${flight}">${flight}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="space-y-2">
              <label for="startDateFilter" class="block text-sm font-medium text-gray-700">Start Date</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <i class="fas fa-calendar"></i>
                </span>
                <input type="date" id="startDateFilter" 
                  class="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
            <div class="space-y-2">
              <label for="endDateFilter" class="block text-sm font-medium text-gray-700">End Date</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <i class="fas fa-calendar"></i>
                </span>
                <input type="date" id="endDateFilter" 
                  class="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          </div>
          ${canDownload ? `
            <div class="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button id="downloadBtn" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                <i class="fas fa-download mr-2"></i>
                Download Verified Reports
              </button>
            </div>
          ` : ''}
        </div>
        <div class="bg-white rounded-lg shadow-lg overflow-hidden mt-4">
          <div class="overflow-x-auto">
            <div class="table-container max-h-[600px] overflow-y-auto">
              <table class="min-w-full divide-y divide-gray-200 table-auto">
                <thead class="bg-gray-50 sticky top-0 z-20">
                  <tr class="text-xs font-medium text-gray-500 uppercase tracking-wider">
                ${[
                  'Date', 'Ref No', 'Supervisor', 'Flight Name', 'Zone', 'Paid', 'Diplomats', 'Infants', 'Not Paid', 'Paid Card/QR', 'Refunds', 'Deportees', 'Transit', 'Waivers', 'Prepaid Bank', 'Round Trip', 'Late Payment', 'Total Attended',
                  ...(showVerification ? ['IICS Infant', 'IICS Adult', 'IICS Total', 'GIA Infant', 'GIA Adult', 'GIA Total', 'IICS-Total Difference', 'GIA-Total Difference'] : []),
                  'Status',
                  ...(showVerification || (onUpdate && this.currentUser && this.currentUser.role === 'teamLead' && storage.isUpdateActivated(this.currentUser.username)) ? ['Actions'] : []),
                ].map(header => `
                  <th class="px-0.5 py-0.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-20 sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">
                    ${header}
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200" id="tableBody">
              ${this.renderRows(data, showVerification, onUpdate)}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const tableBody = this.container.querySelector('#tableBody');
    const supervisorFilter = this.container.querySelector('#supervisorFilter');
    const flightFilter = this.container.querySelector('#flightFilter');
    const startDateFilter = this.container.querySelector('#startDateFilter');
    const endDateFilter = this.container.querySelector('#endDateFilter');
    const downloadBtn = this.container.querySelector('#downloadBtn');

    if (showVerification && this.currentUser && this.currentUser.role === 'dataAnalyst') {
      tableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-btn')) {
          const row = e.target.closest('tr');
          const id = row.dataset.id;
          if (row && id && !row.dataset.verified) {
            this.enableVerificationEditing(row, id, onVerify);
          } else {
            alert('This report is already verified or cannot be edited.');
          }
        }
      });
    }

    if (onUpdate && this.currentUser && this.currentUser.role === 'teamLead') {
      tableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('update-btn')) {
          const row = e.target.closest('tr');
          const id = row.dataset.id;
          const isActivated = row.dataset.canUpdate === 'true';
          if (isActivated) {
            this.enableUpdateEditing(row, id, onUpdate);
          } else {
            alert('You do not have permission to update this report. Contact the Data Analyst for activation.');
          }
        }
      });
    }

    const filterTable = () => {
      const filteredData = this.data.filter((item) => {
        const matchesSupervisor = !supervisorFilter.value || item.supervisor === supervisorFilter.value;
        const matchesFlight = !flightFilter.value || item.flightName === flightFilter.value;
        const itemDate = new Date(item.date);
        const startDate = startDateFilter.value ? new Date(startDateFilter.value) : null;
        const endDate = endDateFilter.value ? new Date(endDateFilter.value) : null;
        let matchesDate = true;
        if (startDate && endDate) {
          matchesDate = itemDate >= startDate && itemDate <= endDate;
        } else if (startDate) {
          matchesDate = itemDate >= startDate;
        } else if (endDate) {
          matchesDate = itemDate <= endDate;
        }
        return matchesSupervisor && matchesFlight && matchesDate;
      });
      tableBody.innerHTML = this.renderRows(filteredData, showVerification, onUpdate);
    };

    supervisorFilter.addEventListener('input', filterTable);
    flightFilter.addEventListener('input', filterTable);
    startDateFilter.addEventListener('input', filterTable);
    endDateFilter.addEventListener('input', filterTable);

    if (downloadBtn && canDownload) {
      downloadBtn.addEventListener('click', () => {
        onDownload(this.data.filter(item => item.verified));
      });
    }
  }

  renderRows(data, showVerification, onUpdate) {
    if (data.length === 0) {
      return `<tr><td colspan="${showVerification ? 26 : 18}" class="px-0.5 py-0.5 text-center text-gray-500 sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">No data available</td></tr>`;
    }

    return data.map(item => `
      <tr data-id="${item.id}" data-verified="${item.verified}" data-can-update="${storage.isUpdateActivated(this.currentUser?.username)}">
        <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">${item.date}</td>
        <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">${item.refNo}</td>
        <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">${item.supervisor}</td>
        <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">${item.flightName || 'N/A'}</td>
        <td class="px-0.5 py-0.5 whitespace-nowrap capitalize sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">${item.zone}</td>
        <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">${item.paid || 0}</td>
        <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">${item.diplomats || 0}</td>
        <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">${item.infants || 0}</td>
        <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">${item.notPaid || 0}</td>
        <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">${item.paidCardQr || 0}</td>
        <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">${item.refunds || 0}</td>
        <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">${item.deportees || 0}</td>
        <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">${item.transit || 0}</td>
        <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">${item.waivers || 0}</td>
        <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">${item.prepaidBank || 0}</td>
        <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">${item.roundTrip || 0}</td>
        <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">${item.latePayment || 0}</td>
        <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">${item.totalAttended || 0}</td>
        ${showVerification ? `
          <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">
            <input type="number" min="0" class="w-[80px] min-w-[60px] h-8 px-0.5 py-0.25 border rounded-md text-xs font-medium overflow-auto text-left iics-infant sm:w-[60px] sm:min-w-[50px] sm:h-6 sm:px-0.25 sm:py-0.125 sm:text-2xs md:w-[80px] md:min-w-[60px] md:h-8 md:px-0.5 md:py-0.25 md:text-xs" value="${item.iicsInfant || 0}" placeholder="0">
          </td>
          <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">
            <input type="number" min="0" class="w-[80px] min-w-[60px] h-8 px-0.5 py-0.25 border rounded-md text-xs font-medium overflow-auto text-left iics-adult sm:w-[60px] sm:min-w-[50px] sm:h-6 sm:px-0.25 sm:py-0.125 sm:text-2xs md:w-[80px] md:min-w-[60px] md:h-8 md:px-0.5 md:py-0.25 md:text-xs" value="${item.iicsAdult || 0}" placeholder="0">
          </td>
          <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">
            <input type="number" min="0" class="w-[80px] min-w-[60px] h-8 px-0.5 py-0.25 border rounded-md text-xs font-medium overflow-auto text-left iics-total sm:w-[60px] sm:min-w-[50px] sm:h-6 sm:px-0.25 sm:py-0.125 sm:text-2xs md:w-[80px] md:min-w-[60px] md:h-8 md:px-0.5 md:py-0.25 md:text-xs" value="${item.iicsTotal || 0}" placeholder="0" readonly>
          </td>
          <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">
            <input type="number" min="0" class="w-[80px] min-w-[60px] h-8 px-0.5 py-0.25 border rounded-md text-xs font-medium overflow-auto text-left gia-infant sm:w-[60px] sm:min-w-[50px] sm:h-6 sm:px-0.25 sm:py-0.125 sm:text-2xs md:w-[80px] md:min-w-[60px] md:h-8 md:px-0.5 md:py-0.25 md:text-xs" value="${item.giaInfant || 0}" placeholder="0">
          </td>
          <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">
            <input type="number" min="0" class="w-[80px] min-w-[60px] h-8 px-0.5 py-0.25 border rounded-md text-xs font-medium overflow-auto text-left gia-adult sm:w-[60px] sm:min-w-[50px] sm:h-6 sm:px-0.25 sm:py-0.125 sm:text-2xs md:w-[80px] md:min-w-[60px] md:h-8 md:px-0.5 md:py-0.25 md:text-xs" value="${item.giaAdult || 0}" placeholder="0">
          </td>
          <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">
            <input type="number" min="0" class="w-[80px] min-w-[60px] h-8 px-0.5 py-0.25 border rounded-md text-xs font-medium overflow-auto text-left gia-total sm:w-[60px] sm:min-w-[50px] sm:h-6 sm:px-0.25 sm:py-0.125 sm:text-2xs md:w-[80px] md:min-w-[60px] md:h-8 md:px-0.5 md:py-0.25 md:text-xs" value="${item.giaTotal || 0}" placeholder="0" readonly>
          </td>
          <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">${(item.iicsTotal || 0) - (item.totalAttended || 0)}</td>
          <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">${(item.giaTotal || 0) - (item.totalAttended || 0)}</td>
        ` : ''}
        <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} sm:text-xs md:text-sm">
            ${item.verified ? 'Verified' : 'Pending'}
          </span>
        </td>
        ${showVerification && !item.verified && this.currentUser && this.currentUser.role === 'dataAnalyst' ? `
          <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">
            <button class="edit-btn px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 sm:px-2 sm:py-0.5 md:px-3 md:py-1 sm:text-xs md:text-sm">Edit</button>
          </td>
        ` : (onUpdate && this.currentUser && this.currentUser.role === 'teamLead' && storage.isUpdateActivated(this.currentUser.username)) ? `
          <td class="px-0.5 py-0.5 whitespace-nowrap sm:px-0.5 sm:py-0.5 md:px-0.5 md:py-0.5">
            <button class="update-btn px-3 py-1 text-white rounded-md sm:px-2 sm:py-0.5 md:px-3 md:py-1 sm:text-xs md:text-sm ${storage.isUpdateActivated(this.currentUser?.username) ? 'bg-green-600 hover:bg-green-700 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}" ${!storage.isUpdateActivated(this.currentUser?.username) ? 'disabled' : ''}>Update</button>
          </td>
        ` : ''}
      </tr>
    `).join('');
  }

  enableVerificationEditing(row, id, onVerify) {
    const inputs = row.querySelectorAll('input[type="number"]');
    const editBtn = row.querySelector('.edit-btn');

    inputs.forEach(input => {
      input.removeAttribute('readonly');
      input.classList.add('border-blue-500');

      if (input.classList.contains('iics-infant') || input.classList.contains('iics-adult')) {
        input.addEventListener('input', () => {
          const iicsInfant = parseInt(row.querySelector('.iics-infant').value) || 0;
          const iicsAdult = parseInt(row.querySelector('.iics-adult').value) || 0;
          row.querySelector('.iics-total').value = iicsInfant + iicsAdult;
        });
      }

      if (input.classList.contains('gia-infant') || input.classList.contains('gia-adult')) {
        input.addEventListener('input', () => {
          const giaInfant = parseInt(row.querySelector('.gia-infant').value) || 0;
          const giaAdult = parseInt(row.querySelector('.gia-adult').value) || 0;
          row.querySelector('.gia-total').value = giaInfant + giaAdult;
        });
      }
    });

    editBtn.textContent = 'Save';
    editBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
    editBtn.classList.add('bg-green-600', 'hover:bg-green-700');

    const originalClickHandler = editBtn.onclick;
    editBtn.onclick = async () => {
      const verificationData = {
        id,
        iicsInfant: parseInt(row.querySelector('.iics-infant').value) || 0,
        iicsAdult: parseInt(row.querySelector('.iics-adult').value) || 0,
        iicsTotal: parseInt(row.querySelector('.iics-total').value) || 0,
        giaInfant: parseInt(row.querySelector('.gia-infant').value) || 0,
        giaAdult: parseInt(row.querySelector('.gia-adult').value) || 0,
        giaTotal: parseInt(row.querySelector('.gia-total').value) || 0
      };

      await onVerify(verificationData);

      inputs.forEach(input => {
        input.setAttribute('readonly', true);
        input.classList.remove('border-blue-500');
      });

      editBtn.textContent = 'Edit';
      editBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
      editBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
      editBtn.onclick = originalClickHandler;
    };
  }

  enableUpdateEditing(row, id, onUpdate) {
    const cells = row.querySelectorAll('td');
    const updateBtn = row.querySelector('.update-btn');
    const originalValues = {};
    const editableCells = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]; // Indices of editable cells

    editableCells.forEach(index => {
      const cell = cells[index];
      const value = cell.textContent.trim();
      originalValues[index] = value;

      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.value = value;
      input.className = 'w-full px-2 py-1 border rounded text-sm';

      cell.textContent = '';
      cell.appendChild(input);
    });

    updateBtn.textContent = 'Save';
    updateBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
    updateBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');

    const originalClickHandler = updateBtn.onclick;
    updateBtn.onclick = async () => {
      const updateData = {
        id,
        paid: parseInt(cells[5].querySelector('input').value) || 0,
        diplomats: parseInt(cells[6].querySelector('input').value) || 0,
        infants: parseInt(cells[7].querySelector('input').value) || 0,
        notPaid: parseInt(cells[8].querySelector('input').value) || 0,
        paidCardQr: parseInt(cells[9].querySelector('input').value) || 0,
        refunds: parseInt(cells[10].querySelector('input').value) || 0,
        deportees: parseInt(cells[11].querySelector('input').value) || 0,
        transit: parseInt(cells[12].querySelector('input').value) || 0,
        waivers: parseInt(cells[13].querySelector('input').value) || 0,
        prepaidBank: parseInt(cells[14].querySelector('input').value) || 0,
        roundTrip: parseInt(cells[15].querySelector('input').value) || 0,
        latePayment: parseInt(cells[16].querySelector('input').value) || 0
      };

      try {
        await onUpdate(updateData);

        editableCells.forEach(index => {
          const cell = cells[index];
          const input = cell.querySelector('input');
          cell.textContent = input.value;
        });

        updateBtn.textContent = 'Update';
        updateBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        updateBtn.classList.add('bg-green-600', 'hover:bg-green-700');
        updateBtn.onclick = originalClickHandler;
      } catch (error) {
        console.error('Error updating report:', error);
        alert('Failed to update report. Please try again.');

        editableCells.forEach(index => {
          const cell = cells[index];
          cell.textContent = originalValues[index];
        });
      }
    };
  }
}
