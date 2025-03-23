const exportUtils = {
  exportToCSV(data) {
    if (!data || data.length === 0) {
      alert('No data to export.');
      return;
    }

    const headers = [
      'Date', 'Ref No', 'Supervisor', 'Flight Name', 'Zone', 'Paid', 'Diplomats', 'Infants', 'Not Paid', 'Paid Card/QR',
      'Refunds', 'Deportees', 'Transit', 'Waivers', 'Prepaid Bank', 'Round Trip', 'Late Payment', 'Total Attended',
      'IICS Infant', 'IICS Adult', 'IICS Total', 'GIA Infant', 'GIA Adult', 'GIA Total', 'IICS-Total Difference', 
      'GIA-Total Difference', 'Status', 'Submitted By', 'Verified By', 'Remarks'
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(report => [
        report.date || '',
        report.refNo || '',
        report.supervisor || '',
        report.flightName || '',
        report.zone || '',
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
        (report.iicsTotal || 0) - (report.totalAttended || 0), // IICS - Total Attended
        (report.giaTotal || 0) - (report.totalAttended || 0),  // GIA - Total Attended
        report.verified ? 'Verified' : 'Pending',
        report.submittedBy || '',
        report.verifiedBy || '',
        report.remarks || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cash-collection-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};