// Main application script for client-side functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize inactivity timeout for automatic logout
    initInactivityTimeout();
    
    // Initialize the appropriate dashboard based on user role
    initializeDashboard();
    
    // Set up event listeners for common elements
    setupEventListeners();
});

// Constants
const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 minutes
let inactivityTimer;

// Initialize inactivity timeout for automatic logout
function initInactivityTimeout() {
    resetInactivityTimeout();
    
    // Monitor user activity to reset the timeout
    ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
        document.addEventListener(event, resetInactivityTimeout);
    });
}

// Reset the inactivity timeout
function resetInactivityTimeout() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        // Show a user-friendly message before logout
        const message = 'Your session has expired due to inactivity. For security reasons, you have been logged out after 2 minutes of inactivity.';
        // Clear any existing session data
        sessionStorage.clear();
        localStorage.clear();
        // Perform a server-side logout first
        fetch('/logout', { method: 'GET' })
            .finally(() => {
                // Always redirect to login page with timeout message, regardless of logout success
                window.location.href = '/login?timeout=true';
                sessionStorage.setItem('timeoutMessage', message);
            });
    }, INACTIVITY_TIMEOUT);
}

// Initialize dashboard based on user role
function initializeDashboard() {
    // Check if data-role attribute exists on body element
    const userRole = document.body.dataset.role;
    
    if (!userRole) return;
    
    switch (userRole) {
        case 'admin':
            initAdminDashboard();
            break;
        case 'teamLead':
            initTeamLeadDashboard();
            break;
        case 'dataAnalyst':
            initDataAnalystDashboard();
            break;
        case 'cashController':
            initCashControllerDashboard();
            break;
    }
}

// Initialize Admin Dashboard
function initAdminDashboard() {
    // Setup user search functionality
    const userSearchInput = document.getElementById('userSearch');
    if (userSearchInput) {
        userSearchInput.addEventListener('input', handleUserSearch);
    }
    
    // Setup modal for reset password
    initResetPasswordModal();
}

// Initialize Team Lead Dashboard
function initTeamLeadDashboard() {
    // Initialize the data entry form
    initDataEntryForm();
    
    // Initialize report filters
    initReportFilters();
    
    // Setup update report modal
    initUpdateReportModal();
}

// Initialize Data Analyst Dashboard
function initDataAnalystDashboard() {
    // Initialize report filters
    initReportFilters();
    
    // Initialize verification functionality
    initVerificationForm();
}

// Initialize Cash Controller Dashboard
function initCashControllerDashboard() {
    // Initialize report filters
    initReportFilters();
    
    // Setup download functionality
    setupDownloadButton();
}

// Setup event listeners for common elements
function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.location.href = '/logout';
        });
    }
    
    // Flash messages dismissal
    document.querySelectorAll('.alert').forEach(alert => {
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.className = 'close';
        closeBtn.addEventListener('click', () => {
            alert.style.display = 'none';
        });
        alert.appendChild(closeBtn);
    });
}

// Initialize data entry form
function initDataEntryForm() {
    const dataEntryForm = document.getElementById('dataEntryForm');
    if (!dataEntryForm) return;
    
    // Calculate total on input
    const numberInputs = dataEntryForm.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        input.addEventListener('input', calculateTotal);
    });
    
    // Confirm form submission
    dataEntryForm.addEventListener('submit', e => {
        if (!confirm('Are you sure you want to submit this data? Once submitted, you cannot edit it.')) {
            e.preventDefault();
        }
    });
    
    // Handle reset button
    const resetButton = document.getElementById('resetButton');
    if (resetButton) {
        resetButton.addEventListener('click', e => {
            if (!confirm('Are you sure you want to clear the form? All data will be cleared.')) {
                e.preventDefault();
            }
        });
    }
    
    // Calculate initial total
    calculateTotal();
}

// Calculate total attended passengers
function calculateTotal() {
    const form = document.getElementById('dataEntryForm');
    if (!form) return;
    
    const totalAttendedElement = document.getElementById('totalAttended');
    if (!totalAttendedElement) return;
    
    const fields = [
        'paid', 'diplomats', 'infants', 'not_paid', 'paid_card_qr',
        'deportees', 'transit', 'waivers', 'prepaid_bank',
        'round_trip', 'late_payment'
    ];
    
    const sum = fields.reduce((total, field) => {
        const input = form.querySelector(`[name="${field}"]`);
        return total + (parseInt(input?.value) || 0);
    }, 0);
    
    const refundsInput = form.querySelector('[name="refunds"]');
    const refunds = parseInt(refundsInput?.value) || 0;
    
    totalAttendedElement.textContent = sum - refunds;
}

// Initialize report filters
function initReportFilters() {
    const supervisorFilter = document.getElementById('supervisorFilter');
    const flightFilter = document.getElementById('flightFilter');
    const startDateFilter = document.getElementById('startDateFilter');
    const endDateFilter = document.getElementById('endDateFilter');
    
    if (!supervisorFilter && !flightFilter && !startDateFilter && !endDateFilter) return;
    
    const filterTable = () => {
        const reportRows = document.querySelectorAll('#reportTableBody tr');
        
        reportRows.forEach(row => {
            const supervisor = row.querySelector('[data-supervisor]')?.dataset.supervisor || 
                               row.cells[2]?.textContent || '';
            const flight = row.querySelector('[data-flight]')?.dataset.flight || 
                           row.cells[3]?.textContent || '';
            const date = row.querySelector('[data-date]')?.dataset.date || 
                         row.cells[0]?.textContent || '';
            
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
            
            row.style.display = (matchesSupervisor && matchesFlight && matchesDate) ? '' : 'none';
        });
    };
    
    // Add event listeners to filters
    if (supervisorFilter) supervisorFilter.addEventListener('input', filterTable);
    if (flightFilter) flightFilter.addEventListener('input', filterTable);
    if (startDateFilter) startDateFilter.addEventListener('input', filterTable);
    if (endDateFilter) endDateFilter.addEventListener('input', filterTable);
}

// Initialize verification form
function initVerificationForm() {
    const verificationForm = document.getElementById('verificationForm');
    if (!verificationForm) return;
    
    // Calculate IICS total and GIA total automatically
    const iicsInfantInput = document.getElementById('iics_infant');
    const iicsAdultInput = document.getElementById('iics_adult');
    const iicsTotalInput = document.getElementById('iics_total');
    
    const giaInfantInput = document.getElementById('gia_infant');
    const giaAdultInput = document.getElementById('gia_adult');
    const giaTotalInput = document.getElementById('gia_total');
    
    const calculateTotals = () => {
        const iicsInfant = parseInt(iicsInfantInput?.value) || 0;
        const iicsAdult = parseInt(iicsAdultInput?.value) || 0;
        if (iicsTotalInput) iicsTotalInput.value = iicsInfant + iicsAdult;
        
        const giaInfant = parseInt(giaInfantInput?.value) || 0;
        const giaAdult = parseInt(giaAdultInput?.value) || 0;
        if (giaTotalInput) giaTotalInput.value = giaInfant + giaAdult;
    };
    
    // Add event listeners to inputs
    if (iicsInfantInput) iicsInfantInput.addEventListener('input', calculateTotals);
    if (iicsAdultInput) iicsAdultInput.addEventListener('input', calculateTotals);
    if (giaInfantInput) giaInfantInput.addEventListener('input', calculateTotals);
    if (giaAdultInput) giaAdultInput.addEventListener('input', calculateTotals);
    
    // Calculate initial totals
    calculateTotals();
}

// Setup download button for reports
function setupDownloadButton() {
    const downloadBtn = document.getElementById('downloadBtn');
    if (!downloadBtn) return;
    
    downloadBtn.addEventListener('click', () => {
        const supervisorFilter = document.getElementById('supervisorFilter')?.value || '';
        const flightFilter = document.getElementById('flightFilter')?.value || '';
        const startDateFilter = document.getElementById('startDateFilter')?.value || '';
        const endDateFilter = document.getElementById('endDateFilter')?.value || '';
        
        const params = new URLSearchParams();
        if (supervisorFilter) params.append('supervisor', supervisorFilter);
        if (flightFilter) params.append('flight', flightFilter);
        if (startDateFilter) params.append('start_date', startDateFilter);
        if (endDateFilter) params.append('end_date', endDateFilter);
        
        window.location.href = `/cash-controller/download-csv?${params.toString()}`;
    });
}

// Initialize update report modal
function initUpdateReportModal() {
    const updateButtons = document.querySelectorAll('.update-report-btn');
    
    updateButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const reportId = btn.getAttribute('data-report-id');
            const modalBody = document.getElementById('updateReportModalBody');
            
            try {
                const response = await fetch(`/team-lead/api/reports?id=${reportId}`);
                if (!response.ok) throw new Error('Failed to fetch report data');
                
                const reports = await response.json();
                
                if (reports.length > 0) {
                    const report = reports[0];
                    
                    // Create update form in modal
                    modalBody.innerHTML = createUpdateFormHTML(report, reportId);
                    
                    // Show modal
                    const updateModal = new bootstrap.Modal(document.getElementById('updateReportModal'));
                    updateModal.show();
                    
                    // Add event listeners for calculation
                    document.querySelectorAll('#updateReportForm input[type="number"]').forEach(input => {
                        input.addEventListener('input', calculateUpdateTotal);
                    });
                    
                    // Calculate initial total
                    calculateUpdateTotal();
                }
            } catch (error) {
                console.error('Error fetching report data:', error);
                alert('Failed to load report data. Please try again.');
            }
        });
    });
}

// Create HTML for update form
function createUpdateFormHTML(report, reportId) {
    return `
        <form id="updateReportForm" method="POST" action="/team-lead/reports/${reportId}/update">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="form-group">
                    <label for="u_paid">Paid</label>
                    <input type="number" id="u_paid" name="paid" class="form-control" value="${report.paid || 0}" min="0">
                </div>
                <div class="form-group">
                    <label for="u_diplomats">Diplomats</label>
                    <input type="number" id="u_diplomats" name="diplomats" class="form-control" value="${report.diplomats || 0}" min="0">
                </div>
                <div class="form-group">
                    <label for="u_infants">Infants</label>
                    <input type="number" id="u_infants" name="infants" class="form-control" value="${report.infants || 0}" min="0">
                </div>
                <div class="form-group">
                    <label for="u_not_paid">Not Paid</label>
                    <input type="number" id="u_not_paid" name="not_paid" class="form-control" value="${report.notPaid || 0}" min="0">
                </div>
                <div class="form-group">
                    <label for="u_paid_card_qr">Paid Card/QR</label>
                    <input type="number" id="u_paid_card_qr" name="paid_card_qr" class="form-control" value="${report.paidCardQr || 0}" min="0">
                </div>
                <div class="form-group">
                    <label for="u_refunds">Refunds</label>
                    <input type="number" id="u_refunds" name="refunds" class="form-control" value="${report.refunds || 0}" min="0">
                </div>
                <div class="form-group">
                    <label for="u_deportees">Deportees</label>
                    <input type="number" id="u_deportees" name="deportees" class="form-control" value="${report.deportees || 0}" min="0">
                </div>
                <div class="form-group">
                    <label for="u_transit">Transit</label>
                    <input type="number" id="u_transit" name="transit" class="form-control" value="${report.transit || 0}" min="0">
                </div>
                <div class="form-group">
                    <label for="u_waivers">Waivers</label>
                    <input type="number" id="u_waivers" name="waivers" class="form-control" value="${report.waivers || 0}" min="0">
                </div>
                <div class="form-group">
                    <label for="u_prepaid_bank">Prepaid Bank</label>
                    <input type="number" id="u_prepaid_bank" name="prepaid_bank" class="form-control" value="${report.prepaidBank || 0}" min="0">
                </div>
                <div class="form-group">
                    <label for="u_round_trip">Round Trip</label>
                    <input type="number" id="u_round_trip" name="round_trip" class="form-control" value="${report.roundTrip || 0}" min="0">
                </div>
                <div class="form-group">
                    <label for="u_late_payment">Late Payment</label>
                    <input type="number" id="u_late_payment" name="late_payment" class="form-control" value="${report.latePayment || 0}" min="0">
                </div>
            </div>
            
            <div class="mt-4">
                <label for="total_attended">Total Attended:</label>
                <span id="update_total_attended" class="font-bold ml-2">0</span>
            </div>
            
            <div class="form-group mt-4">
                <label for="u_remarks">Remarks</label>
                <textarea id="u_remarks" name="remarks" class="form-control" rows="3">${report.remarks || ''}</textarea>
            </div>
            
            <div class="d-flex justify-content-end mt-4">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Report</button>
            </div>
        </form>
    `;
}

// Calculate total for update form
function calculateUpdateTotal() {
    const form = document.getElementById('updateReportForm');
    if (!form) return;
    
    const totalElement = document.getElementById('update_total_attended');
    if (!totalElement) return;
    
    const fields = [
        'paid', 'diplomats', 'infants', 'not_paid', 'paid_card_qr',
        'deportees', 'transit', 'waivers', 'prepaid_bank',
        'round_trip', 'late_payment'
    ];
    
    const sum = fields.reduce((total, field) => {
        const input = form.querySelector(`[name="${field}"]`);
        return total + (parseInt(input?.value) || 0);
    }, 0);
    
    const refundsInput = form.querySelector('[name="refunds"]');
    const refunds = parseInt(refundsInput?.value) || 0;
    
    totalElement.textContent = sum - refunds;
}

// Initialize reset password modal
function initResetPasswordModal() {
    const resetBtns = document.querySelectorAll('.reset-password-btn');
    const resetModal = document.getElementById('resetPasswordModal');
    
    if (!resetBtns.length || !resetModal) return;
    
    resetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = btn.getAttribute('data-userid');
            const resetForm = document.getElementById('resetPasswordForm');
            
            if (resetForm) {
                resetForm.action = `/admin/users/${userId}/reset-password`;
                resetModal.classList.remove('hidden');
                resetModal.classList.add('flex');
            }
        });
    });
    
    const closeBtn = document.getElementById('closeResetModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            resetModal.classList.add('hidden');
            resetModal.classList.remove('flex');
            document.getElementById('resetPasswordForm')?.reset();
        });
    }
    
    // Setup password validation
    const newPasswordInput = document.getElementById('new_password');
    const confirmPasswordInput = document.getElementById('confirm_new_password');
    const passwordMatchMessage = document.getElementById('password-match-message');
    const submitBtn = document.getElementById('submitResetPassword');
    
    if (newPasswordInput && confirmPasswordInput && passwordMatchMessage && submitBtn) {
        const validatePassword = () => {
            const password = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            
            if (confirmPassword) {
                passwordMatchMessage.classList.remove('hidden');
                
                if (password === confirmPassword) {
                    passwordMatchMessage.textContent = 'Passwords match';
                    passwordMatchMessage.className = 'text-xs text-green-500 mt-1';
                    submitBtn.disabled = false;
                } else {
                    passwordMatchMessage.textContent = 'Passwords do not match';
                    passwordMatchMessage.className = 'text-xs text-red-500 mt-1';
                    submitBtn.disabled = true;
                }
            }
            
            // Check password complexity
            const hasUppercase = /[A-Z]/.test(password);
            const hasLowercase = /[a-z]/.test(password);
            const hasNumber = /\d/.test(password);
            const hasSpecial = /[@$!%*?&]/.test(password);
            const isLongEnough = password.length >= 8;
            
            if (!(hasUppercase && hasLowercase && hasNumber && hasSpecial && isLongEnough)) {
                submitBtn.disabled = true;
            }
        };
        
        newPasswordInput.addEventListener('input', validatePassword);
        confirmPasswordInput.addEventListener('input', validatePassword);
    }
}

// Handle user search in admin dashboard
function handleUserSearch() {
    const searchInput = document.getElementById('userSearch');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const userRows = document.querySelectorAll('#userTableBody tr');
    
    userRows.forEach(row => {
        const username = row.cells[0].textContent.toLowerCase();
        row.style.display = username.includes(searchTerm) ? '' : 'none';
    });
}
