class DataTable {
  constructor(container) {
    this.container = container;
    this.currentUser = null; // Store the current user for role-based checks
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

    this.container.innerHTML = `
      <div class="space-y-4">
        <div class="flex flex-wrap gap-4 p-4 bg-white rounded-lg shadow sm:p-2 md:p-4">
          <input type="text" id="supervisorFilter" placeholder="Filter by Supervisor" class="flex-1 min-w-[200px] px-3 py-2 border rounded-md sm:min-w-[150px] sm:px-2 sm:py-1 md:min-w-[200px] md:px-3 md:py-2" />
          <input type="text" id="flightFilter" placeholder="Filter by Flight Name" class="flex-1 min-w-[200px] px-3 py-2 border rounded-md sm:min-w-[150px] sm:px-2 sm:py-1 md:min-w-[200px] md:px-3 md:py-2" />
          <div class="flex-1 min-w-[200px] flex items-center sm:min-w-[150px]">
            <label for="startDateFilter" class="mr-2 text-gray-700 sm:text-xs md:text-sm">Start Date:</label>
            <input type="date" id="startDateFilter" class="flex-1 px-3 py-2 border rounded-md sm:px-2 sm:py-1 md:px-3 md:py-2" />
          </div>
          <div class="flex-1 min-w-[200px] flex items-center sm:min-w-[150px]">
            <label for="endDateFilter" class="mr-2 text-gray-700 sm:text-xs md:text-sm">End Date:</label>
            <input type="date" id="endDateFilter" class="flex-1 px-3 py-2 border rounded-md sm:px-2 sm:py-1 md:px-3 md:py-2" />
          </div>
          ${canDownload ? `
            <button id="downloadBtn" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 sm:px-3 sm:py-1 md:px-4 md:py-2 sm:text-xs md:text-sm">
              Download Report (Verified Only)
            </button>
          ` : ''}
        </div>
        <div class="table-container max-h-[400px] overflow-auto">
          <table class="min-w-full divide-y divide-gray-200 table-auto">
            <thead class="bg-gray-50 sticky top-0 z-20">
              <tr>
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
        console.log('Click event triggered on table body'); // Debug log
        if (e.target.classList.contains('edit-btn')) {
          console.log('Edit button clicked'); // Debug log
          const row = e.target.closest('tr');
          const id = row.dataset.id;
          console.log('Row ID:', id, 'Current User:', this.currentUser); // Debug log
          if (row && id && !storage.getReportById(id).verified) {
            console.log('Enabling verification editing for report ID:', id); // Debug log
            this.enableVerificationEditing(row, id, onVerify);
          } else {
            console.log('Cannot edit: Report is verified or row/ID not found'); // Debug log
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
          const activation = JSON.parse(localStorage.getItem(storage.ACTIVATED_TEAM_LEAD_KEY) || '{}');
          const isActivated = storage.isUpdateActivated(this.currentUser.username, activation.date);
          console.log('Update button clicked for:', { username: this.currentUser.username, activationDate: activation.date, isActivated }); // Debug log
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
        const matchesSupervisor = !supervisorFilter.value || item.supervisor.toLowerCase().includes(supervisorFilter.value.toLowerCase());
        const matchesFlight = !flightFilter.value || (item.flightName || '').toLowerCase().includes(flightFilter.value.toLowerCase());
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
    const activation = JSON.parse(localStorage.getItem(storage.ACTIVATED_TEAM_LEAD_KEY) || '{}');
    const selectedDate = activation.date;

    return data.map(item => `
      <tr data-id="${item.id}">
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
            <button class="update-btn px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 sm:px-2 sm:py-0.5 md:px-3 md:py-1 sm:text-xs md:text-sm">Update</button>
          </td>
        ` : ''}
      </tr>
    `).join('');
  }

  enableVerificationEditing(row, id, onVerify) {
    if (!this.currentUser || this.currentUser.role !== 'dataAnalyst') {
      alert('Only Data Analysts can edit and verify reports.');
      return;
    }

    const cells = row.querySelectorAll('td');
    const iicsInfantCell = cells[18];
    const iicsAdultCell = cells[19];
    const iicsTotalCell = cells[20];
    const giaInfantCell = cells[21];
    const giaAdultCell = cells[22];
    const giaTotalCell = cells[23];
    const actionCell = cells[25]; // Adjusted for Data Analyst edit

    console.log('Enabling verification editing for row:', row, 'ID:', id); // Debug log

    // Save original content with null checks and debug logs
    const getInputValue = (cell, selector) => {
      const input = cell.querySelector(selector);
      console.log(`Querying ${selector} in cell:`, cell, 'Input found:', input); // Debug log
      return input?.value || '0';
    };

    iicsInfantCell._originalContent = getInputValue(iicsInfantCell, '.iics-infant');
    iicsAdultCell._originalContent = getInputValue(iicsAdultCell, '.iics-adult');
    iicsTotalCell._originalContent = getInputValue(iicsTotalCell, '.iics-total');
    giaInfantCell._originalContent = getInputValue(giaInfantCell, '.gia-infant');
    giaAdultCell._originalContent = getInputValue(giaAdultCell, '.gia-adult');
    giaTotalCell._originalContent = getInputValue(giaTotalCell, '.gia-total');

    // Add event listeners for real-time total calculation with null checks and debug logs
    const updateTotals = () => {
      console.log('Updating totals for row:', row); // Debug log
      const iicsInfantInput = iicsInfantCell.querySelector('.iics-infant');
      const iicsAdultInput = iicsAdultCell.querySelector('.iics-adult');
      const iicsTotalInput = iicsTotalCell.querySelector('.iics-total');
      const giaInfantInput = giaInfantCell.querySelector('.gia-infant');
      const giaAdultInput = giaAdultCell.querySelector('.gia-adult');
      const giaTotalInput = giaTotalCell.querySelector('.gia-total');

      console.log('Inputs found:', { iicsInfantInput, iicsAdultInput, iicsTotalInput, giaInfantInput, giaAdultInput, giaTotalInput }); // Debug log

      const iicsInfant = Number(iicsInfantInput?.value) || 0;
      const iicsAdult = Number(iicsAdultInput?.value) || 0;
      const giaInfant = Number(giaInfantInput?.value) || 0;
      const giaAdult = Number(giaAdultInput?.value) || 0;

      if (iicsTotalInput) iicsTotalInput.value = iicsInfant + iicsAdult;
      if (giaTotalInput) giaTotalInput.value = giaInfant + giaAdult;
    };

    // Add event listeners with null checks and debug logs
    const addInputListener = (input, event, callback) => {
      if (input) {
        console.log(`Adding ${event} listener to input:`, input); // Debug log
        input.addEventListener(event, callback);
      } else {
        console.log(`Input not found for event ${event}`); // Debug log
      }
    };

    addInputListener(iicsInfantCell.querySelector('.iics-infant'), 'input', updateTotals);
    addInputListener(iicsAdultCell.querySelector('.iics-adult'), 'input', updateTotals);
    addInputListener(giaInfantCell.querySelector('.gia-infant'), 'input', updateTotals);
    addInputListener(giaAdultCell.querySelector('.gia-adult'), 'input', updateTotals);

    // Replace the Edit button with Save and Cancel buttons
    actionCell.innerHTML = `
      <div class="space-x-2 sm:space-x-1">
        <button class="verify-btn px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 sm:px-3 sm:py-1 md:px-4 md:py-2 sm:text-sm md:text-base">
          Verify
        </button>
        <button class="cancel-btn px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 sm:px-3 sm:py-1 md:px-4 md:py-2 sm:text-sm md:text-base">
          Cancel
        </button>
      </div>
    `;

    // Add event listeners for Save and Cancel with null checks and debug logs
    const verifyBtn = actionCell.querySelector('.verify-btn');
    const cancelBtn = actionCell.querySelector('.cancel-btn');
    const iicsInfantInput = iicsInfantCell.querySelector('.iics-infant');
    const iicsAdultInput = iicsAdultCell.querySelector('.iics-adult');
    const iicsTotalInput = iicsTotalCell.querySelector('.iics-total');
    const giaInfantInput = giaInfantCell.querySelector('.gia-infant');
    const giaAdultInput = giaAdultCell.querySelector('.gia-adult');
    const giaTotalInput = giaTotalCell.querySelector('.gia-total');

    console.log('Verify/Cancel Buttons and Inputs:', { verifyBtn, cancelBtn, iicsInfantInput, iicsAdultInput, iicsTotalInput, giaInfantInput, giaAdultInput, giaTotalInput }); // Debug log

    if (verifyBtn) {
      verifyBtn.addEventListener('click', () => {
        console.log('Verify button clicked'); // Debug log
        const iicsInfant = Number(iicsInfantInput?.value) || 0;
        const iicsAdult = Number(iicsAdultInput?.value) || 0;
        const iicsTotal = Number(iicsTotalInput?.value) || 0;
        const giaInfant = Number(giaInfantInput?.value) || 0;
        const giaAdult = Number(giaAdultInput?.value) || 0;
        const giaTotal = Number(giaTotalInput?.value) || 0;

        if (Object.keys(validation.validateIICSGIA(iicsInfant, iicsAdult, iicsTotal, giaInfant, giaAdult, giaTotal)).length > 0) {
          alert('Please enter valid non-negative numbers and ensure totals match.');
          return;
        }

        const report = storage.getReportById(id);
        const totalAttended = report.totalAttended || 0;
        const iicsTotalDifference = iicsTotal - totalAttended;
        const giaTotalDifference = giaTotal - totalAttended;

        if (Object.keys(validation.validateDifference(totalAttended, iicsTotal, giaTotal)).length > 0) {
          this.showModal('Validation Error', 'Total Attended cannot be less than IICS or GIA Total.', () => {});
          return;
        }

        if (confirm('Are you sure you want to verify this data?')) {
          onVerify(id, { iicsInfant, iicsAdult, iicsTotal, giaInfant, giaAdult, giaTotal, iicsTotalDifference, giaTotalDifference });
        }
      });
    } else {
      console.log('Verify button not found'); // Debug log
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        console.log('Cancel button clicked'); // Debug log
        // Restore original content with null checks
        if (iicsInfantInput) iicsInfantInput.value = iicsInfantCell._originalContent;
        if (iicsAdultInput) iicsAdultInput.value = iicsAdultCell._originalContent;
        if (iicsTotalInput) iicsTotalInput.value = iicsTotalCell._originalContent;
        if (giaInfantInput) giaInfantInput.value = giaInfantCell._originalContent;
        if (giaAdultInput) giaAdultInput.value = giaAdultCell._originalContent;
        if (giaTotalInput) giaTotalInput.value = giaTotalCell._originalContent;
        actionCell.innerHTML = `
          <button class="edit-btn px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 sm:px-2 sm:py-0.5 md:px-3 md:py-1 sm:text-xs md:text-sm">
            Edit
          </button>
        `;
      });
    } else {
      console.log('Cancel button not found'); // Debug log
    }
  }

  enableUpdateEditing(row, id, onUpdate) {
    if (!this.currentUser || this.currentUser.role !== 'teamLead') {
      alert('Only Team Leads can update reports.');
      return;
    }

    const cells = row.querySelectorAll('td');
    const actionCell = cells[cells.length - 1]; // Last cell contains the Update button

    // Define editable columns (12 fields, starting after Date, Ref No, Supervisor, Flight Name, Zone)
    const editableColumns = ['paid', 'diplomats', 'infants', 'notPaid', 'paidCardQr', 'refunds', 'deportees', 'transit', 'waivers', 'prepaidBank', 'roundTrip', 'latePayment'];

    // Save original content and replace with smaller, readable inputs, starting after the first 5 columns
    editableColumns.forEach((column, index) => {
      const cell = cells[index + 5]; // Skip the first 5 columns (Date, Ref No, Supervisor, Flight Name, Zone)
      cell._originalContent = cell.textContent || '0';
      cell.innerHTML = `
        <input type="number" min="0" class="w-[80px] min-w-[60px] h-8 px-0.5 py-0.25 border rounded-md text-xs font-medium overflow-auto text-left sm:w-[60px] sm:min-w-[50px] sm:h-6 sm:px-0.25 sm:py-0.125 sm:text-2xs md:w-[80px] md:min-w-[60px] md:h-8 md:px-0.5 md:py-0.25 md:text-xs" value="${cell.textContent}">
      `;
    });

    // Replace the Update button with Save and Cancel buttons
    actionCell.innerHTML = `
      <div class="space-x-2 sm:space-x-1">
        <button class="save-btn px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 sm:px-3 sm:py-1 md:px-4 md:py-2 sm:text-sm md:text-base">
          Save
        </button>
        <button class="cancel-btn px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 sm:px-3 sm:py-1 md:px-4 md:py-2 sm:text-sm md:text-base">
          Cancel
        </button>
      </div>
    `;

    // Add event listeners for Save and Cancel
    const saveBtn = actionCell.querySelector('.save-btn');
    const cancelBtn = actionCell.querySelector('.cancel-btn');

    saveBtn.addEventListener('click', () => {
      const updatedData = {};
      editableColumns.forEach((column, index) => {
        const cell = cells[index + 5]; // Match the index offset used above
        const input = cell.querySelector('input');
        updatedData[column] = Number(input.value) || 0;
      });

      const total = storage.calculateTotal(updatedData);
      const totalAttended = total - Number(updatedData['refunds'] || 0); // Subtract refunds for total attended
      const iicsTotal = total; // IICS Total includes all fields, including refunds
      const giaTotal = totalAttended; // GIA Total matches total attended (excluding refunds)

      console.log('Updated Data Before Save:', updatedData, 'Total:', total, 'Total Attended:', totalAttended, 'IICS Total:', iicsTotal, 'GIA Total:', giaTotal); // Debug log

      const report = storage.getReportById(id);
      const activation = JSON.parse(localStorage.getItem(storage.ACTIVATED_TEAM_LEAD_KEY) || '{}');
      const selectedDate = activation.date;

      if (!selectedDate || report.date !== selectedDate) {
        alert('You can only update reports for the date activated by the Data Analyst.');
        return;
      }

      if (confirm('Are you sure you want to update this data?')) {
        onUpdate(id, { ...updatedData, totalAttended, iicsTotal, giaTotal, iicsInfant: Number(updatedData.infants || 0), iicsAdult: iicsTotal - Number(updatedData.infants || 0), giaInfant: Number(updatedData.infants || 0), giaAdult: giaTotal - Number(updatedData.infants || 0), iicsTotalDifference: iicsTotal - totalAttended, giaTotalDifference: giaTotal - totalAttended });
      }
    });

    cancelBtn.addEventListener('click', () => {
      // Restore original content
      editableColumns.forEach((column, index) => {
        const cell = cells[index + 5]; // Match the index offset used above
        cell.innerHTML = cell._originalContent;
      });
      actionCell.innerHTML = `
        <button class="update-btn px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 sm:px-2 sm:py-0.5 md:px-3 md:py-1 sm:text-xs md:text-sm">
          Update
        </button>
      `;
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