document.addEventListener('DOMContentLoaded', function() {
    const reportTableBody = document.getElementById('reportTableBody');
    let isRefreshing = false;

    // Function to fetch and update reports
    async function refreshReports() {
        if (isRefreshing) return;
        isRefreshing = true;

        try {
            const response = await fetch('/api/reports');
            if (!response.ok) throw new Error('Failed to fetch reports');
            
            const reports = await response.json();
            
            // Store current filter values
            const currentFilters = {
                supervisor: document.getElementById('supervisorFilter').value,
                flight: document.getElementById('flightFilter').value,
                startDate: document.getElementById('startDateFilter').value,
                endDate: document.getElementById('endDateFilter').value
            };

            // Update table with new data while preserving filters
            reportTableBody.innerHTML = reports.map(report => `
                <tr data-supervisor="${report.supervisor}" data-flight="${report.flight_name}" data-date="${report.date}">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${report.date}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${report.ref_no}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${report.supervisor}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${report.flight_name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${report.zone}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${report.paid}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${report.diplomats}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${report.infants}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${report.not_paid}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${report.paid_card_qr}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${report.deportees}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${report.transit}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${report.waivers}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${report.prepaid_bank}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${report.round_trip}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${report.late_payment}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${report.total_attended}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${report.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                            ${report.verified ? 'Verified' : 'Pending'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div class="flex space-x-2">
                            <a href="/reports/${report.id}" class="text-indigo-600 hover:text-indigo-900">View</a>
                            ${!report.verified ? `
                                <a href="/reports/${report.id}/edit" class="text-blue-600 hover:text-blue-900">Edit</a>
                            ` : ''}
                            ${report.verified ? `
                                <a href="/reports/${report.id}/download" class="text-green-600 hover:text-green-900">Download</a>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `).join('');

            // Reapply filters
            if (window.applyFilters) {
                window.applyFilters();
            }

        } catch (error) {
            console.error('Error refreshing reports:', error);
        } finally {
            isRefreshing = false;
        }
    }

    // Refresh data every 30 seconds
    setInterval(refreshReports, 30000);

    // Initial refresh
    refreshReports();
});