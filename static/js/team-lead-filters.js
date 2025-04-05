document.addEventListener('DOMContentLoaded', function() {
    const supervisorFilter = document.getElementById('supervisorFilter');
    const flightFilter = document.getElementById('flightFilter');
    const startDateFilter = document.getElementById('startDateFilter');
    const endDateFilter = document.getElementById('endDateFilter');
    const reportTableBody = document.getElementById('reportTableBody');

    function filterTable() {
        const rows = reportTableBody.getElementsByTagName('tr');
        const supervisorValue = supervisorFilter.value.toLowerCase();
        const flightValue = flightFilter.value.toLowerCase();
        const startDate = startDateFilter.value ? new Date(startDateFilter.value) : null;
        const endDate = endDateFilter.value ? new Date(endDateFilter.value) : null;

        for (let row of rows) {
            let show = true;
            const cells = row.getElementsByTagName('td');
            
            if (cells.length === 0) continue;

            const rowDate = new Date(cells[0].textContent);
            const supervisorText = cells[2].textContent.toLowerCase();
            const flightText = cells[3].textContent.toLowerCase();

            // Filter by supervisor
            if (supervisorValue && !supervisorText.includes(supervisorValue)) {
                show = false;
            }

            // Filter by flight
            if (flightValue && !flightText.includes(flightValue)) {
                show = false;
            }

            // Filter by date range
            if (startDate && rowDate < startDate) {
                show = false;
            }
            if (endDate && rowDate > endDate) {
                show = false;
            }

            row.style.display = show ? '' : 'none';
        }
    }

    // Add event listeners for real-time filtering
    supervisorFilter.addEventListener('input', filterTable);
    flightFilter.addEventListener('input', filterTable);
    startDateFilter.addEventListener('change', filterTable);
    endDateFilter.addEventListener('change', filterTable);

    // Initialize export functionality
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            const visibleRows = Array.from(reportTableBody.getElementsByTagName('tr'))
                .filter(row => {
                    // Only include visible rows that are verified
                    const cells = row.getElementsByTagName('td');
                    return row.style.display !== 'none' && 
                           cells.length > 0 && 
                           cells[6].textContent.trim().toLowerCase() === 'verified';
                })
                .map(row => {
                    const cells = row.getElementsByTagName('td');
                    return {
                        date: cells[0].textContent,
                        refNo: cells[1].textContent,
                        supervisor: cells[2].textContent,
                        flightName: cells[3].textContent,
                        zone: cells[4].textContent,
                        totalAttended: parseInt(cells[5].textContent),
                        status: cells[6].textContent.trim()
                    };
                });

            if (visibleRows.length === 0) {
                alert('No verified reports found to export.');
                return;
            }
            
            ExportUtils.exportToCSV(visibleRows);
        });
    }
});