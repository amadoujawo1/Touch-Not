// charts.js - Data visualization for the data analyst dashboard

function initializeCharts() {
    // Fetch report data from the API
    fetch('/data-analyst/api/reports')
        .then(response => response.json())
        .then(reports => {
            createPassengerTrendsChart(reports);
            createPassengerTypesChart(reports);
            createVerificationStatusChart(reports);
            createZoneDistributionChart(reports);
        })
        .catch(error => console.error('Error fetching report data:', error));
}

function createPassengerTrendsChart(reports) {
    const ctx = document.getElementById('passengerTrendsChart').getContext('2d');
    
    // Process data for the last 7 days
    const last7Days = reports
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 7)
        .reverse();

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7Days.map(report => report.date),
            datasets: [{
                label: 'Total Passengers',
                data: last7Days.map(report => report.totalAttended),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Passenger Trends (Last 7 Days)'
                }
            }
        }
    });
}

function createPassengerTypesChart(reports) {
    const ctx = document.getElementById('passengerTypesChart').getContext('2d');
    
    // Aggregate passenger types across all reports
    const totals = reports.reduce((acc, report) => ({
        paid: acc.paid + report.paid,
        diplomats: acc.diplomats + report.diplomats,
        infants: acc.infants + report.infants,
        transit: acc.transit + report.transit,
        others: acc.others + report.notPaid + report.deportees + report.waivers
    }), { paid: 0, diplomats: 0, infants: 0, transit: 0, others: 0 });

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Paid', 'Diplomats', 'Infants', 'Transit', 'Others'],
            datasets: [{
                data: [
                    totals.paid,
                    totals.diplomats,
                    totals.infants,
                    totals.transit,
                    totals.others
                ],
                backgroundColor: [
                    'rgb(54, 162, 235)',
                    'rgb(255, 99, 132)',
                    'rgb(255, 205, 86)',
                    'rgb(75, 192, 192)',
                    'rgb(153, 102, 255)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Passenger Types Distribution'
                }
            }
        }
    });
}

function createVerificationStatusChart(reports) {
    const ctx = document.getElementById('verificationStatusChart').getContext('2d');
    
    const verificationStatus = reports.reduce((acc, report) => {
        report.verified ? acc.verified++ : acc.pending++;
        return acc;
    }, { verified: 0, pending: 0 });

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Verified', 'Pending'],
            datasets: [{
                data: [verificationStatus.verified, verificationStatus.pending],
                backgroundColor: ['rgb(75, 192, 192)', 'rgb(255, 205, 86)']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Report Verification Status'
                }
            }
        }
    });
}

function createZoneDistributionChart(reports) {
    const ctx = document.getElementById('zoneDistributionChart').getContext('2d');
    
    const zoneData = reports.reduce((acc, report) => {
        acc[report.zone] = (acc[report.zone] || 0) + report.totalAttended;
        return acc;
    }, {});

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(zoneData),
            datasets: [{
                label: 'Total Passengers by Zone',
                data: Object.values(zoneData),
                backgroundColor: 'rgb(54, 162, 235)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Passenger Distribution by Zone'
                }
            }
        }
    });
}

// Initialize charts when the page loads
document.addEventListener('DOMContentLoaded', initializeCharts);