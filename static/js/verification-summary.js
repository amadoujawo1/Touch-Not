// // Verification Summary Handler
// class VerificationSummary {
//     constructor() {
//         this.setupEventListeners();
//         this.initializeFilters();
//         this.setupVerificationHandlers();
//     }

//     setupEventListeners() {
//         // Filter event listeners
//         document.getElementById('supervisorFilter').addEventListener('input', () => this.filterTable());
//         document.getElementById('flightFilter').addEventListener('input', () => this.filterTable());
//         document.getElementById('startDateFilter').addEventListener('input', () => this.filterTable());
//         document.getElementById('endDateFilter').addEventListener('input', () => this.filterTable());

//         // Download button handler
//         document.getElementById('downloadBtn').addEventListener('click', () => this.handleDownload());
//     }

//     initializeFilters() {
//         // Set initial date range (last 30 days)
//         const today = new Date();
//         const thirtyDaysAgo = new Date(today);
//         thirtyDaysAgo.setDate(today.getDate() - 30);

//         document.getElementById('startDateFilter').value = thirtyDaysAgo.toISOString().split('T')[0];
//         document.getElementById('endDateFilter').value = today.toISOString().split('T')[0];

//         // Initial filter application
//         this.filterTable();
//     }

//     setupVerificationHandlers() {
//         document.querySelectorAll('a[href*="verify_report"]').forEach(link => {
//             link.addEventListener('click', (e) => this.handleVerification(e));
//         });
//     }

//     async handleVerification(event) {
//         event.preventDefault();
//         const link = event.currentTarget;
//         const row = link.closest('tr');

//         try {
//             const response = await fetch(link.href);
//             const data = await response.json();

//             if (data.success) {
//                 // Update row status
//                 row.querySelector('td:nth-last-child(2)').innerHTML =
//                     '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Verified</span>';
//                 link.parentElement.innerHTML = '';

//                 // Update verification totals
//                 this.updateVerificationTotals();

//                 // Show success message
//                 this.showNotification('Report verified successfully', 'success');
//             } else {
//                 this.showNotification('Failed to verify report', 'error');
//             }
//         } catch (error) {
//             console.error('Error verifying report:', error);
//             this.showNotification('Error occurred while verifying report', 'error');
//         }
//     }

//     async updateVerificationTotals() {
//         try {
//             const response = await fetch('/data-analyst/verification-totals');
//             const data = await response.json();

//             // Update totals in the UI
//             document.getElementById('iicsTotal').textContent = data.iics_total || '0';
//             document.getElementById('giaTotal').textContent = data.gia_total || '0';
//             document.getElementById('iicsDiff').textContent = data.iics_diff || '0';
//             document.getElementById('giaDiff').textContent = data.gia_diff || '0';

//             // Trigger charts update
//             window.dashboardCharts?.updateCharts();
//         } catch (error) {
//             console.error('Error updating totals:', error);
//         }
//     }

//     filterTable() {
//         const rows = document.querySelectorAll('#reportTableBody tr');
//         const filters = {
//             supervisor: document.getElementById('supervisorFilter').value.toLowerCase(),
//             flight: document.getElementById('flightFilter').value.toLowerCase(),
//             startDate: document.getElementById('startDateFilter').value,
//             endDate: document.getElementById('endDateFilter').value
//         };

//         rows.forEach(row => {
//             const rowData = {
//                 supervisor: row.getAttribute('data-supervisor').toLowerCase(),
//                 flight: row.getAttribute('data-flight-name').toLowerCase(),
//                 date: row.getAttribute('data-date')
//             };

//             const matchesSupervisor = !filters.supervisor || rowData.supervisor.includes(filters.supervisor);
//             const matchesFlight = !filters.flight || rowData.flight.includes(filters.flight);
//             const matchesDate = (!filters.startDate || rowData.date >= filters.startDate) &&
//                                (!filters.endDate || rowData.date <= filters.endDate);

//             row.style.display = (matchesSupervisor && matchesFlight && matchesDate) ? '' : 'none';
//         });

//         this.updateFilterSummary();
//     }

//     updateFilterSummary() {
//         const visibleRows = document.querySelectorAll('#reportTableBody tr:not([style*="display: none"])');
//         const totalRows = document.querySelectorAll('#reportTableBody tr');
//         const verifiedCount = Array.from(visibleRows).filter(row => 
//             row.querySelector('td:nth-last-child(2)').textContent.includes('Verified')
//         ).length;

//         // Update filter summary if element exists
//         const summaryElement = document.getElementById('filterSummary');
//         if (summaryElement) {
//             summaryElement.textContent = `Showing ${visibleRows.length} of ${totalRows.length} reports (${verifiedCount} verified)`;
//         }
//     }

//     handleDownload() {
//         const params = new URLSearchParams();
//         const filters = {
//             supervisor: document.getElementById('supervisorFilter').value,
//             flight_name: document.getElementById('flightFilter').value,
//             start_date: document.getElementById('startDateFilter').value,
//             end_date: document.getElementById('endDateFilter').value,
//             verified: true
//         };

//         Object.entries(filters).forEach(([key, value]) => {
//             if (value) params.append(key, value);
//         });

//         window.location.href = `/data-analyst/download-csv?${params.toString()}`;
//     }

//     showNotification(message, type) {
//         const notification = document.createElement('div');
//         notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`;
//         notification.textContent = message;

//         document.body.appendChild(notification);
//         setTimeout(() => notification.remove(), 3000);
//     }
// }

// // Initialize verification summary when the page loads
// document.addEventListener('DOMContentLoaded', () => {
//     window.verificationSummary = new VerificationSummary();
// });