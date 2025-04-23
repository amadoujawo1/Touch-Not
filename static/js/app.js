// Get CSRF token from meta tag
function getCSRFToken() {
  return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

// Database API Utilities
class Storage {
  static async getReports() {
    try {
      const response = await fetch('/api/reports');
      const reports = await response.json();
      return reports;
    } catch (error) {
      console.error('Error getting reports:', error);
      return [];
    }
  }

  static async getReportById(id) {
    try {
      const response = await fetch(`/api/reports/${id}`);
      const report = await response.json();
      return report;
    } catch (error) {
      console.error('Error getting report:', error);
      return null;
    }
  }

  static async getReportsByUser(username) {
    try {
      const response = await fetch(`/api/reports/user/${username}`);
      const reports = await response.json();
      return reports;
    } catch (error) {
      console.error('Error getting user reports:', error);
      return [];
    }
  }

  static async saveReport(report) {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify(report)
      });
      return response.ok;
    } catch (error) {
      console.error('Error saving report:', error);
      return false;
    }
  }

  static async updateReport(id, updatedData) {
    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify(updatedData)
      });
      return response.ok;
    } catch (error) {
      console.error('Error updating report:', error);
      return false;
    }
  }

  static async isUpdateActivated(username, date) {
    try {
      const response = await fetch(`/api/team-lead/activation/check?username=${username}&date=${date}`);
      const data = await response.json();
      return data.activated;
    } catch (error) {
      console.error('Error checking update activation:', error);
      return false;
    }
  }

  static async setUpdateActivation(username, date) {
    try {
      const response = await fetch('/api/team-lead/activation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({ username, date })
      });
      return response.ok;
    } catch (error) {
      console.error('Error setting update activation:', error);
      return false;
    }
  }

  static async clearUpdateActivation() {
    try {
      const response = await fetch('/api/team-lead/activation', {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Error clearing update activation:', error);
      return false;
    }
  }

  static async getFlights() {
    try {
      const response = await fetch('/api/flights');
      const flights = await response.json();
      return flights;
    } catch (error) {
      console.error('Error getting flights:', error);
      return [];
    }
  }

  static async getSupervisors() {
    try {
      const response = await fetch('/api/supervisors');
      const supervisors = await response.json();
      return supervisors;
    } catch (error) {
      console.error('Error getting supervisors:', error);
      return [];
    }
  }

  static async setFlights(flights) {
    try {
      const response = await fetch('/api/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify(flights)
      });
      return response.ok;
    } catch (error) {
      console.error('Error setting flights:', error);
      return false;
    }
  }

  static async setSupervisors(supervisors) {
    try {
      const response = await fetch('/api/supervisors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify(supervisors)
      });
      return response.ok;
    } catch (error) {
      console.error('Error setting supervisors:', error);
      return false;
    }
  }
}

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
}

// Chart Colors Configuration
const chartColors = {
  blue: 'rgba(59, 130, 246, 0.5)',
  green: 'rgba(16, 185, 129, 0.5)',
  purple: 'rgba(139, 92, 246, 0.5)',
  orange: 'rgba(249, 115, 22, 0.5)',
  borderBlue: 'rgb(59, 130, 246)',
  borderGreen: 'rgb(16, 185, 129)',
  borderPurple: 'rgb(139, 92, 246)',
  borderOrange: 'rgb(249, 115, 22)',
  lightBlue: 'rgba(59, 130, 246, 0.1)',
  lightGreen: 'rgba(16, 185, 129, 0.1)',
  lightPurple: 'rgba(139, 92, 246, 0.1)',
  lightOrange: 'rgba(249, 115, 22, 0.1)'
};

// Dashboard Charts
class DashboardCharts {
  constructor() {
    this.charts = {};
    this.chartConfigs = {
      passengerTrends: {
        type: 'line',
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0,0,0,0.1)' }
            },
            x: { grid: { display: false } }
          }
        }
      },
      passengerTypes: {
        type: 'doughnut',
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          cutout: '70%'
        }
      },
      verificationStatus: {
        type: 'bar',
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0,0,0,0.1)' }
            },
            x: { grid: { display: false } }
          }
        }
      }
    };

    this.initializeCharts();
    this.setupAutoRefresh();
  }

  initializeCharts() {
    this.initializeChart('passengerTrends', {
      labels: [],
      datasets: [{
        label: 'Hourly Flow',
        data: [],
        borderColor: chartColors.borderBlue,
        backgroundColor: chartColors.lightBlue,
        tension: 0.4,
        fill: true
      }]
    });

    this.initializeChart('passengerTypes', {
      labels: ['IICS', 'GIA', 'Others'],
      datasets: [{
        data: [],
        backgroundColor: [chartColors.blue, chartColors.green, chartColors.purple],
        borderWidth: 0
      }]
    });

    this.initializeChart('verificationStatus', {
      labels: ['Verified', 'Pending'],
      datasets: [{
        data: [],
        backgroundColor: [chartColors.green, chartColors.orange],
        borderRadius: 6
      }]
    });
  }

  initializeChart(chartId, chartData) {
    const canvas = document.getElementById(`${chartId}Chart`);
    if (!canvas) {
      console.error(`Canvas element not found for chart: ${chartId}`);
      return;
    }

    const ctx = canvas.getContext('2d');
    const config = this.chartConfigs[chartId];
    
    this.charts[chartId] = new Chart(ctx, {
      type: config.type,
      data: chartData,
      options: config.options
    });
  }

  async fetchDashboardData() {
    try {
      const response = await fetch('/data-analyst/dashboard-data');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return null;
    }
  }

  updateCharts(data) {
    if (!data) return;

    if (this.charts.passengerTrends) {
      const trendData = data.hourlyFlow || [];
      this.charts.passengerTrends.data.labels = trendData.map(item => item.hour);
      this.charts.passengerTrends.data.datasets[0].data = trendData.map(item => item.total);
      this.charts.passengerTrends.update();
    }

    if (this.charts.passengerTypes && data.typeDistribution) {
      const { iics, gia, others } = data.typeDistribution;
      this.charts.passengerTypes.data.datasets[0].data = [iics, gia, others];
      this.charts.passengerTypes.update();
    }

    if (this.charts.verificationStatus && data.verificationStatus) {
      const { verified, pending } = data.verificationStatus;
      this.charts.verificationStatus.data.datasets[0].data = [verified, pending];
      this.charts.verificationStatus.update();
    }
  }

  async refreshDashboard() {
    const data = await this.fetchDashboardData();
    if (data) {
      this.updateCharts(data);
    }
  }

  setupAutoRefresh() {
    this.refreshDashboard();
    setInterval(() => this.refreshDashboard(), 60000);
  }
}

// Team Lead Charts
class TeamLeadCharts {
  constructor() {
    this.initializeCharts();
  }

  initializeCharts() {
    this.initDailyTrendsChart({});
    this.initPassengerDistributionChart();
    this.initPaymentMethodsChart();
    this.initVerificationStatusChart();
  }

  initDailyTrendsChart(data) {
    const ctx = document.getElementById('dailyTrendsChart')?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Total Passengers',
          data: data.values || [65, 59, 80, 81, 56, 55, 40],
          fill: false,
          borderColor: '#3b82f6',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Daily Passenger Trends',
            font: { size: 16 }
          },
          legend: { position: 'bottom' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  initPassengerDistributionChart(data) {
    const ctx = document.getElementById('passengerDistributionChart')?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Paid', 'Diplomats', 'Infants', 'Not Paid', 'Transit'],
        datasets: [{
          data: data || [300, 50, 30, 20, 100],
          backgroundColor: [
            '#3b82f6',
            '#22c55e',
            '#f59e0b',
            '#ef4444',
            '#64748b'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Passenger Distribution',
            font: { size: 16 }
          },
          legend: { position: 'bottom' }
        }
      }
    });
  }

  initPaymentMethodsChart(data) {
    const ctx = document.getElementById('paymentMethodsChart')?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Card/QR', 'Bank Transfer', 'Late Payment', 'Refunds'],
        datasets: [{
          label: 'Payment Methods',
          data: data || [400, 200, 50, 30],
          backgroundColor: '#3b82f6'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Payment Methods Distribution',
            font: { size: 16 }
          },
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  initVerificationStatusChart(data) {
    const ctx = document.getElementById('verificationStatusChart')?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Verified', 'Pending', 'Rejected'],
        datasets: [{
          data: data || [70, 20, 10],
          backgroundColor: [
            '#22c55e',
            '#f59e0b',
            '#ef4444'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Report Verification Status',
            font: { size: 16 }
          },
          legend: { position: 'bottom' }
        }
      }
    });
  }
}

// Verification Summary
class VerificationSummary {
  constructor() {
    this.setupEventListeners();
    this.initializeFilters();
    this.setupVerificationHandlers();
  }

  setupEventListeners() {
    document.getElementById('supervisorFilter')?.addEventListener('input', () => this.filterTable());
    document.getElementById('flightFilter')?.addEventListener('input', () => this.filterTable());
    document.getElementById('startDateFilter')?.addEventListener('input', () => this.filterTable());
    document.getElementById('endDateFilter')?.addEventListener('input', () => this.filterTable());
    document.getElementById('downloadBtn')?.addEventListener('click', () => this.handleDownload());
  }

  initializeFilters() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const startDateFilter = document.getElementById('startDateFilter');
    const endDateFilter = document.getElementById('endDateFilter');

    if (startDateFilter) startDateFilter.value = thirtyDaysAgo.toISOString().split('T')[0];
    if (endDateFilter) endDateFilter.value = today.toISOString().split('T')[0];

    this.filterTable();
  }

  setupVerificationHandlers() {
    document.querySelectorAll('a[href*="verify_report"]').forEach(link => {
      link.addEventListener('click', (e) => this.handleVerification(e));
    });
  }

  async handleVerification(event) {
    event.preventDefault();
    const link = event.currentTarget;
    const row = link.closest('tr');

    try {
      const response = await fetch(link.href);
      const data = await response.json();

      if (data.success) {
        row.querySelector('td:nth-last-child(2)').innerHTML =
          '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Verified</span>';
        link.parentElement.innerHTML = '';
        this.updateVerificationTotals();
        this.showNotification('Report verified successfully', 'success');
      } else {
        this.showNotification('Failed to verify report', 'error');
      }
    } catch (error) {
      console.error('Error verifying report:', error);
      this.showNotification('Error occurred while verifying report', 'error');
    }
  }

  async updateVerificationTotals() {
    try {
      const response = await fetch('/data-analyst/verification-totals');
      const data = await response.json();

      document.getElementById('iicsTotal').textContent = data.iics_total || '0';
      document.getElementById('giaTotal').textContent = data.gia_total || '0';
      document.getElementById('iicsDiff').textContent = data.iics_diff || '0';
      document.getElementById('giaDiff').textContent = data.gia_diff || '0';

      window.dashboardCharts?.updateCharts();
    } catch (error) {
      console.error('Error updating totals:', error);
    }
  }

  filterTable() {
    const rows = document.querySelectorAll('#reportTableBody tr');
    const filters = {
      supervisor: document.getElementById('supervisorFilter')?.value.toLowerCase() || '',
      flight: document.getElementById('flightFilter')?.value.toLowerCase() || '',
      startDate: document.getElementById('startDateFilter')?.value || '',
      endDate: document.getElementById('endDateFilter')?.value || ''
    };

    rows.forEach(row => {
      const rowData = {
        supervisor: row.getAttribute('data-supervisor')?.toLowerCase() || '',
        flight: row.getAttribute('data-flight-name')?.toLowerCase() || '',
        date: row.getAttribute('data-date') || ''
      };

      const matchesSupervisor = !filters.supervisor || rowData.supervisor.includes(filters.supervisor);
      const matchesFlight = !filters.flight || rowData.flight.includes(filters.flight);
      const matchesDate = (!filters.startDate || rowData.date >= filters.startDate) &&
                         (!filters.endDate || rowData.date <= filters.endDate);

      row.style.display = (matchesSupervisor && matchesFlight && matchesDate) ? '' : 'none';
    });

    this.updateFilterSummary();
  }

  updateFilterSummary() {
    const visibleRows = document.querySelectorAll('#reportTableBody tr:not([style*="display: none"])');
    const totalRows = document.querySelectorAll('#reportTableBody tr');
    const verifiedCount = Array.from(visibleRows).filter(row =>
      row.querySelector('td:nth-last-child(2)')?.textContent.includes('Verified')
    ).length;

    const summaryElement = document.getElementById('filterSummary');
    if (summaryElement) {
      summaryElement.textContent = `Showing ${visibleRows.length} of ${totalRows.length} reports (${verifiedCount} verified)`;
    }
  }

  handleDownload() {
    const params = new URLSearchParams();
    const filters = {
      supervisor: document.getElementById('supervisorFilter')?.value || '',
      flight_name: document.getElementById('flightFilter')?.value || '',
      start_date: document.getElementById('startDateFilter')?.value || '',
      end_date: document.getElementById('endDateFilter')?.value || '',
      verified: true
    };

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    window.location.href = `/data-analyst/download-csv?${params.toString()}`;
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`;
    notification.textContent = message;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }
}

// Total Attended Calculator
class TotalAttendedCalculator {
  constructor() {
    this.totalDisplay = document.getElementById('total-display')?.querySelector('span');
    this.inputFields = [
      'paid', 'diplomats', 'infants', 'not_paid', 'paid_card_qr',
      'refunds', 'deportees', 'transit', 'waivers', 'prepaid_bank',
      'round_trip', 'late_payment'
    ];

    this.initialize();
  }

  initialize() {
    this.inputFields.forEach(fieldName => {
      const input = document.querySelector(`input[name="${fieldName}"]`);
      if (input) {
        input.addEventListener('input', () => this.updateTotalAttended());
      }
    });

    this.updateTotalAttended();
  }

  updateTotalAttended() {
    let total = 0;
    let refunds = 0;

    this.inputFields.forEach(fieldName => {
      const input = document.querySelector(`input[name="${fieldName}"]`);
      if (input && fieldName !== 'refunds') {
        total += parseInt(input.value) || 0;
      } else if (input && fieldName === 'refunds') {
        refunds = parseInt(input.value) || 0;
      }
    });

    const finalTotal = total - refunds;

    const totalAttendedInput = document.getElementById('total_attended');
    if (totalAttendedInput) {
      totalAttendedInput.value = finalTotal;
    }

    if (this.totalDisplay) {
      this.totalDisplay.textContent = finalTotal.toLocaleString();
      this.totalDisplay.style.transform = 'scale(1.1)';
      setTimeout(() => {
        this.totalDisplay.style.transform = 'scale(1)';
      }, 150);
    }
  }
}

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize verification summary if on verification page
  if (document.getElementById('reportTableBody')) {
    window.verificationSummary = new VerificationSummary();
  }

  // Initialize dashboard charts if on dashboard page
  if (document.getElementById('passengerTrendsChart')) {
    window.dashboardCharts = new DashboardCharts();
  }

  // Initialize team lead charts if on team lead dashboard
  if (document.getElementById('dailyTrendsChart')) {
    new TeamLeadCharts();
  }

  // Initialize total attended calculator if on report form
  if (document.getElementById('total-display')) {
    new TotalAttendedCalculator();
  }
});