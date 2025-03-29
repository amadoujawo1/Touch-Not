// team-lead-charts.js - Data visualization for the team lead dashboard

function initializeTeamLeadCharts() {
    // Fetch report data from the API
    fetch('/team-lead/api/reports')
        .then(response => response.json())
        .then(reports => {
            createDailyTrendsChart(reports);
            createPassengerDistributionChart(reports);
            createPaymentMethodsChart(reports);
            createVerificationStatusChart(reports);
        })
        .catch(error => console.error('Error fetching report data:', error));
}

function createDailyTrendsChart(reports) {
    const ctx = document.getElementById('dailyTrendsChart').getContext('2d');
    
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
                    text: 'Daily Passenger Trends'
                }
            }
        }
    });
}

function createPassengerDistributionChart(reports) {
    const ctx = document.getElementById('passengerDistributionChart').getContext('2d');
    
    // Get the latest report
    const latestReport = reports.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Paid', 'Diplomats', 'Infants', 'Not Paid', 'Transit'],
            datasets: [{
                data: [
                    latestReport.paid,
                    latestReport.diplomats,
                    latestReport.infants,
                    latestReport.notPaid,
                    latestReport.transit
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
                    text: 'Latest Report Passenger Distribution'
                }
            }
        }
    });
}

function createPaymentMethodsChart(reports) {
    const ctx = document.getElementById('paymentMethodsChart').getContext('2d');
    
    // Get the latest report
    const latestReport = reports.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Card/QR', 'Prepaid Bank', 'Late Payment'],
            datasets: [{
                label: 'Payment Methods',
                data: [
                    latestReport.paidCardQr,
                    latestReport.prepaidBank,
                    latestReport.latePayment
                ],
                backgroundColor: 'rgb(54, 162, 235)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Latest Report Payment Methods'
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
                    text: 'Reports Verification Status'
                }
            }
        }
    });
}

// Initialize charts when the page loads
document.addEventListener('DOMContentLoaded', initializeTeamLeadCharts);