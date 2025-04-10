/**
 * Utility for exporting data to CSV
 */
class ExportUtils {
  /**
   * Export data to CSV and trigger download
   * @param {Array} data - Array of report objects to export
   */
  static exportToCSV(data) {
    if (!data || data.length === 0) {
      alert('No data to export.');
      return;
    }

    // Define headers
    const headers = [
      'Date', 'Ref No', 'Supervisor', 'Flight Name', 'Zone', 'Paid', 'Diplomats', 'Infants', 
      'Not Paid', 'Paid Card/QR', 'Refunds', 'Deportees', 'Transit', 'Waivers', 
      'Prepaid Bank', 'Round Trip', 'Late Payment', 'Total Attended',
      'IICS Infant', 'IICS Adult', 'IICS Total', 'GIA Infant', 'GIA Adult', 'GIA Total', 
      'IICS-Total Difference', 'GIA-Total Difference', 'Status', 'Submitted By', 
      'Verified By', 'Remarks'
    ];

    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(report => {
      const row = [
        report.date || '',
        this.escapeCSV(report.refNo || ''),
        this.escapeCSV(report.supervisor || ''),
        this.escapeCSV(report.flightName || ''),
        this.escapeCSV(report.zone || ''),
        report.paid || 0,
        report.diplomats || 0,
        report.infants || 0,
        report.notPaid || 0,
        report.paidCardQr || 0,
        report.refunds || 0,
        report.deportees || 0,
        report.transit || 0,
        report.waivers || 0,
        report.prepaidBank || 0,
        report.roundTrip || 0,
        report.latePayment || 0,
        report.totalAttended || 0,
        report.iicsInfant || 0,
        report.iicsAdult || 0,
        report.iicsTotal || 0,
        report.giaInfant || 0,
        report.giaAdult || 0,
        report.giaTotal || 0,
        (report.iicsTotal || 0) - (report.totalAttended || 0),
        (report.giaTotal || 0) - (report.totalAttended || 0),
        report.verified ? 'Verified' : 'Pending',
        this.escapeCSV(report.submittedBy || ''),
        this.escapeCSV(report.verifiedBy || ''),
        this.escapeCSV(report.remarks || '')
      ];
      
      csvContent += row.join(',') + '\n';
    });

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cash-collection-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Escape special characters for CSV
   * @param {string} value - Value to escape
   * @returns {string} - Escaped value
   */
  static escapeCSV(value) {
    if (value === null || value === undefined) return '';
    
    // Convert to string
    value = String(value);
    
    // Check if value contains comma, double quote, or newline
    if (/[,"\n]/.test(value)) {
      // Escape double quotes by doubling them and wrap in quotes
      return `"${value.replace(/"/g, '""')}"`;
    }
    
    return value;
  }

  /**
   * Generate download URL with filters
   * @param {Object} filters - Filter parameters
   * @returns {string} - Download URL
   */
  static getDownloadURL(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.supervisor) params.append('supervisor', filters.supervisor);
    if (filters.flight) params.append('flight', filters.flight);
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    
    return `/cash-controller/download-csv?${params.toString()}`;
  }
}

// Add global export handler for download button
document.addEventListener('DOMContentLoaded', function() {
  const downloadBtn = document.getElementById('downloadBtn');
  
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function() {
      const filters = {
        supervisor: document.getElementById('supervisorFilter')?.value || '',
        flight: document.getElementById('flightFilter')?.value || '',
        startDate: document.getElementById('startDateFilter')?.value || '',
        endDate: document.getElementById('endDateFilter')?.value || ''
      };
      
      window.location.href = ExportUtils.getDownloadURL(filters);
    });
  }
});
