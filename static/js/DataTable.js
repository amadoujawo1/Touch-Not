class DataTable {
  constructor(tableId, options = {}) {
    this.tableId = tableId;
    this.table = document.getElementById(tableId);
    this.tableBody = this.table ? this.table.querySelector('tbody') : null;
    this.options = {
      showVerification: false,
      canEdit: false,
      canVerify: false,
      canDownload: false,
      ...options
    };
    
    this.init();
  }

  init() {
    if (!this.table) return;
    
    // Initialize filters
    this.initFilters();
    
    // Initialize actions
    this.initActions();
    
    // Initialize download button if applicable
    if (this.options.canDownload) {
      this.initDownload();
    }
  }

  initFilters() {
    const supervisorFilter = document.getElementById('supervisorFilter');
    const flightFilter = document.getElementById('flightFilter');
    const startDateFilter = document.getElementById('startDateFilter');
    const endDateFilter = document.getElementById('endDateFilter');
    
    if (!supervisorFilter && !flightFilter && !startDateFilter && !endDateFilter) return;
    
    const filterFunction = () => {
      if (!this.tableBody) return;
      
      const rows = this.tableBody.querySelectorAll('tr');
      
      rows.forEach(row => {
        const supervisor = row.getAttribute('data-supervisor') || row.cells[2]?.textContent || '';
        const flight = row.getAttribute('data-flight') || row.cells[3]?.textContent || '';
        const date = row.getAttribute('data-date') || row.cells[0]?.textContent || '';
        
        // Apply filters
        const matchesSupervisor = !supervisorFilter?.value || 
                                 supervisor.toLowerCase().includes(supervisorFilter.value.toLowerCase());
        const matchesFlight = !flightFilter?.value || 
                             flight.toLowerCase().includes(flightFilter.value.toLowerCase());
        
        let matchesDate = true;
        if (startDateFilter?.value && endDateFilter?.value) {
          matchesDate = date >= startDateFilter.value && date <= endDateFilter.value;
        } else if (startDateFilter?.value) {
          matchesDate = date >= startDateFilter.value;
        } else if (endDateFilter?.value) {
          matchesDate = date <= endDateFilter.value;
        }
        
        // Show/hide row
        row.style.display = (matchesSupervisor && matchesFlight && matchesDate) ? '' : 'none';
      });
    };
    
    // Add event listeners
    if (supervisorFilter) supervisorFilter.addEventListener('input', filterFunction);
    if (flightFilter) flightFilter.addEventListener('input', filterFunction);
    if (startDateFilter) startDateFilter.addEventListener('input', filterFunction);
    if (endDateFilter) endDateFilter.addEventListener('input', filterFunction);
  }

  initActions() {
    if (!this.tableBody) return;
    
    // Edit buttons
    if (this.options.canEdit) {
      this.tableBody.querySelectorAll('.update-report-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const reportId = btn.getAttribute('data-report-id');
          this.openEditModal(reportId);
        });
      });
    }
    
    // Verify buttons
    if (this.options.canVerify) {
      this.tableBody.querySelectorAll('.verify-report-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const reportId = btn.getAttribute('data-report-id');
          window.location.href = `/data-analyst/reports/${reportId}/verify`;
        });
      });
    }
  }

  initDownload() {
    const downloadBtn = document.getElementById('downloadBtn');
    if (!downloadBtn) return;
    
    downloadBtn.addEventListener('click', () => {
      const supervisorFilter = document.getElementById('supervisorFilter')?.value || '';
      const flightFilter = document.getElementById('flightFilter')?.value || '';
      const startDateFilter = document.getElementById('startDateFilter')?.value || '';
      const endDateFilter = document.getElementById('endDateFilter')?.value || '';
      
      // Build query params
      const params = new URLSearchParams();
      if (supervisorFilter) params.append('supervisor', supervisorFilter);
      if (flightFilter) params.append('flight', flightFilter);
      if (startDateFilter) params.append('start_date', startDateFilter);
      if (endDateFilter) params.append('end_date', endDateFilter);
      
      // Redirect to download endpoint
      window.location.href = `/cash-controller/download-csv?${params.toString()}`;
    });
  }

  async openEditModal(reportId) {
    try {
      // Fetch report data
      const response = await fetch(`/team-lead/api/reports?id=${reportId}`);
      if (!response.ok) throw new Error('Failed to fetch report data');
      
      const data = await response.json();
      
      if (data.length === 0) throw new Error('Report not found');
      
      const report = data[0];
      
      // Get modal elements
      const modal = document.getElementById('updateReportModal');
      const modalBody = document.getElementById('updateReportModalBody');
      
      if (!modal || !modalBody) throw new Error('Modal elements not found');
      
      // Create form HTML
      const formHtml = this.createEditForm(report, reportId);
      modalBody.innerHTML = formHtml;
      
      // Initialize form events
      this.initEditForm();
      
      // Show modal
      new bootstrap.Modal(modal).show();
      
    } catch (error) {
      console.error('Error opening edit modal:', error);
      alert('Failed to load report data. Please try again.');
    }
  }

  createEditForm(report, reportId) {
    return `
      <form id="updateReportForm" method="POST" action="/team-lead/reports/${reportId}/update">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="form-group">
            <label for="paid">Paid</label>
            <input type="number" id="paid" name="paid" class="form-control" value="${report.paid || 0}" min="0">
          </div>
          <div class="form-group">
            <label for="diplomats">Diplomats</label>
            <input type="number" id="diplomats" name="diplomats" class="form-control" value="${report.diplomats || 0}" min="0">
          </div>
          <div class="form-group">
            <label for="infants">Infants</label>
            <input type="number" id="infants" name="infants" class="form-control" value="${report.infants || 0}" min="0">
          </div>
          <div class="form-group">
            <label for="not_paid">Not Paid</label>
            <input type="number" id="not_paid" name="not_paid" class="form-control" value="${report.notPaid || 0}" min="0">
          </div>
          <div class="form-group">
            <label for="paid_card_qr">Paid Card/QR</label>
            <input type="number" id="paid_card_qr" name="paid_card_qr" class="form-control" value="${report.paidCardQr || 0}" min="0">
          </div>
          <div class="form-group">
            <label for="refunds">Refunds</label>
            <input type="number" id="refunds" name="refunds" class="form-control" value="${report.refunds || 0}" min="0">
          </div>
          <div class="form-group">
            <label for="deportees">Deportees</label>
            <input type="number" id="deportees" name="deportees" class="form-control" value="${report.deportees || 0}" min="0">
          </div>
          <div class="form-group">
            <label for="transit">Transit</label>
            <input type="number" id="transit" name="transit" class="form-control" value="${report.transit || 0}" min="0">
          </div>
          <div class="form-group">
            <label for="waivers">Waivers</label>
            <input type="number" id="waivers" name="waivers" class="form-control" value="${report.waivers || 0}" min="0">
          </div>
          <div class="form-group">
            <label for="prepaid_bank">Prepaid Bank</label>
            <input type="number" id="prepaid_bank" name="prepaid_bank" class="form-control" value="${report.prepaidBank || 0}" min="0">
          </div>
          <div class="form-group">
            <label for="round_trip">Round Trip</label>
            <input type="number" id="round_trip" name="round_trip" class="form-control" value="${report.roundTrip || 0}" min="0">
          </div>
          <div class="form-group">
            <label for="late_payment">Late Payment</label>
            <input type="number" id="late_payment" name="late_payment" class="form-control" value="${report.latePayment || 0}" min="0">
          </div>
        </div>
        
        <div class="mt-4">
          <label>Total Attended:</label>
          <span id="editTotalAttended" class="font-bold ml-2">0</span>
        </div>
        
        <div class="form-group mt-4">
          <label for="remarks">Remarks</label>
          <textarea id="remarks" name="remarks" class="form-control" rows="3">${report.remarks || ''}</textarea>
        </div>
        
        <div class="mt-4 flex justify-end space-x-2">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-primary">Update Report</button>
        </div>
      </form>
    `;
  }

  initEditForm() {
    const form = document.getElementById('updateReportForm');
    if (!form) return;
    
    const totalElement = document.getElementById('editTotalAttended');
    
    // Calculate total function
    const calculateTotal = () => {
      if (!totalElement) return;
      
      const formData = new FormData(form);
      const sum = [
        'paid', 'diplomats', 'infants', 'not_paid', 'paid_card_qr',
        'deportees', 'transit', 'waivers', 'prepaid_bank',
        'round_trip', 'late_payment'
      ].reduce((sum, field) => {
        return sum + Number(formData.get(field) || 0);
      }, 0);
      
      const refunds = Number(formData.get('refunds') || 0);
      totalElement.textContent = sum - refunds;
    };
    
    // Add event listeners
    form.querySelectorAll('input[type="number"]').forEach(input => {
      input.addEventListener('input', calculateTotal);
    });
    
    // Initial calculation
    calculateTotal();
    
    // Form submission
    form.addEventListener('submit', (e) => {
      if (!confirm('Are you sure you want to update this report? It will need to be verified again.')) {
        e.preventDefault();
      }
    });
  }
}

// Initialize data tables when document is ready
document.addEventListener('DOMContentLoaded', function() {
  // Team Lead reports table
  if (document.getElementById('teamLeadReportsTable')) {
    const isUpdateActivated = !!document.querySelector('[data-update-activated="true"]');
    new DataTable('teamLeadReportsTable', {
      canEdit: isUpdateActivated
    });
  }
  
  // Data Analyst reports table
  if (document.getElementById('dataAnalystReportsTable')) {
    new DataTable('dataAnalystReportsTable', {
      showVerification: true,
      canVerify: true,
      canDownload: true
    });
  }
  
  // Cash Controller reports table
  if (document.getElementById('cashControllerReportsTable')) {
    new DataTable('cashControllerReportsTable', {
      canDownload: true
    });
  }
});
