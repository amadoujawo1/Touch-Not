// Dashboard Charts Configuration
const chartColors = {
    blue: 'rgba(59, 130, 246, 0.5)',
    green: 'rgba(16, 185, 129, 0.5)',
    purple: 'rgba(139, 92, 246, 0.5)',
    orange: 'rgba(249, 115, 22, 0.5)',
    borderBlue: 'rgb(59, 130, 246)',
    borderGreen: 'rgb(16, 185, 129)',
    borderPurple: 'rgb(139, 92, 246)',
    borderOrange: 'rgb(249, 115, 22)'
};

class DashboardCharts {
    constructor() {
        this.charts = {};
        this.initializeCharts();
        this.setupAutoRefresh();
    }

    initializeCharts() {
        this.initializePassengerTrendsChart();
        this.initializePassengerTypesChart();
        this.initializeVerificationStatusChart();
        this.initializeZoneDistributionChart();
    }

    async fetchChartData() {
        try {
            const response = await fetch('/data-analyst/chart-data');
            return await response.json();
        } catch (error) {
            console.error('Error fetching chart data:', error);
            return null;
        }
    }

    initializePassengerTrendsChart() {
        const ctx = document.getElementById('passengerTrendsChart').getContext('2d');
        this.charts.passengerTrends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Total Passengers',
                    data: [],
                    borderColor: chartColors.borderBlue,
                    backgroundColor: chartColors.blue,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Passenger Trends (Last 7 Days)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    initializePassengerTypesChart() {
        const ctx = document.getElementById('passengerTypesChart').getContext('2d');
        this.charts.passengerTypes = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['IICS', 'GIA', 'Others'],
                datasets: [{
                    data: [],
                    backgroundColor: [chartColors.blue, chartColors.green, chartColors.purple]
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

    initializeVerificationStatusChart() {
        const ctx = document.getElementById('verificationStatusChart').getContext('2d');
        this.charts.verificationStatus = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Verified', 'Pending'],
                datasets: [{
                    label: 'Reports Status',
                    data: [],
                    backgroundColor: [chartColors.green, chartColors.orange]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Verification Status'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    initializeZoneDistributionChart() {
        const ctx = document.getElementById('zoneDistributionChart').getContext('2d');
        this.charts.zoneDistribution = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: []
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Zone Distribution'
                    }
                }
            }
        });
    }

    async updateCharts() {
        const data = await this.fetchChartData();
        if (!data) return;

        // Update Passenger Trends
        this.charts.passengerTrends.data.labels = data.trends.dates;
        this.charts.passengerTrends.data.datasets[0].data = data.trends.counts;
        this.charts.passengerTrends.update();

        // Update Passenger Types
        this.charts.passengerTypes.data.datasets[0].data = [
            data.types.iics,
            data.types.gia,
            data.types.others
        ];
        this.charts.passengerTypes.update();

        // Update Verification Status
        this.charts.verificationStatus.data.datasets[0].data = [
            data.verification.verified,
            data.verification.pending
        ];
        this.charts.verificationStatus.update();

        // Update Zone Distribution
        this.charts.zoneDistribution.data.labels = data.zones.labels;
        this.charts.zoneDistribution.data.datasets[0].data = data.zones.counts;
        this.charts.zoneDistribution.data.datasets[0].backgroundColor = 
            data.zones.labels.map((_, i) => `hsl(${(i * 360) / data.zones.labels.length}, 70%, 60%)`);
        this.charts.zoneDistribution.update();
    }

    setupAutoRefresh() {
        // Update charts every 5 minutes
        setInterval(() => this.updateCharts(), 5 * 60 * 1000);
    }
}

// Initialize dashboard charts when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const dashboardCharts = new DashboardCharts();
    dashboardCharts.updateCharts();
});