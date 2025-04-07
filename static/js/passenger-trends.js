// Passenger Trends Chart Configuration
const passengerTrendsConfig = {
    chartColors: {
        blue: 'rgba(59, 130, 246, 0.5)',
        borderBlue: 'rgb(59, 130, 246)'
    }
};

class PassengerTrendsChart {
    constructor() {
        this.chart = null;
        this.initialize();
        this.setupAutoRefresh();
    }

    initialize() {
        const ctx = document.getElementById('passengerTrendsChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Total Passengers',
                    data: [],
                    borderColor: passengerTrendsConfig.chartColors.borderBlue,
                    backgroundColor: passengerTrendsConfig.chartColors.blue,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Passenger Trends (Last 7 Days)',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `Total Passengers: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    async fetchData() {
        try {
            const response = await fetch('/data-analyst/chart-data');
            const data = await response.json();
            return data.trends;
        } catch (error) {
            console.error('Error fetching passenger trends data:', error);
            return null;
        }
    }

    async updateChart() {
        const data = await this.fetchData();
        if (data) {
            this.chart.data.labels = data.dates;
            this.chart.data.datasets[0].data = data.counts;
            this.chart.update();
        }
    }

    setupAutoRefresh() {
        // Update chart every 5 minutes
        setInterval(() => this.updateChart(), 5 * 60 * 1000);
    }
}

// Initialize the chart when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const trendsChart = new PassengerTrendsChart();
    trendsChart.updateChart(); // Initial data fetch and update
});