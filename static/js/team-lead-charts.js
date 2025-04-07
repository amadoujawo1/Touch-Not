// Team Lead Dashboard Charts

// Daily Trends Chart
function initDailyTrendsChart(data) {
    const ctx = document.getElementById('dailyTrendsChart').getContext('2d');
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

// Passenger Distribution Chart
function initPassengerDistributionChart(data) {
    const ctx = document.getElementById('passengerDistributionChart').getContext('2d');
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

// Payment Methods Chart
function initPaymentMethodsChart(data) {
    const ctx = document.getElementById('paymentMethodsChart').getContext('2d');
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

// Verification Status Chart
function initVerificationStatusChart(data) {
    const ctx = document.getElementById('verificationStatusChart').getContext('2d');
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

// Calculate total passengers
function calculateTotal() {
    const total_attended = parseInt(document.getElementById('total_attended').value) || 0;
    const paid = parseInt(document.getElementById('paid').value) || 0;
    const diplomats = parseInt(document.getElementById('diplomats').value) || 0;
    const infants = parseInt(document.getElementById('infants').value) || 0;
    const not_paid = parseInt(document.getElementById('not_paid').value) || 0;
    const transit = parseInt(document.getElementById('transit').value) || 0;

    const calculatedTotal = paid + diplomats + infants + not_paid + transit;
    
    if (calculatedTotal !== total_attended) {
        alert(`Warning: The sum of passenger categories (${calculatedTotal}) does not match the total attended (${total_attended})`);
    }

    document.getElementById('total_attended').value = calculatedTotal;
}

// Initialize all charts when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts with default data
    // In production, this data should come from your backend
    initDailyTrendsChart({});
    initPassengerDistributionChart();
    initPaymentMethodsChart();
    initVerificationStatusChart();

    // Add form validation
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            calculateTotal(); // Verify totals before submission
            // If validation passes, submit the form
            this.submit();
        });
    }
});