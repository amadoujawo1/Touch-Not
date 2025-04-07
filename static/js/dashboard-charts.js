// Dashboard Charts Configuration
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

// Utility functions
const formatNumber = (num) => new Intl.NumberFormat().format(num);
const formatPercent = (num) => `${Math.round(num * 100)}%`;
const formatTime = (minutes) => `${minutes}m`;

const updateSummaryCards = (data) => {
    const elements = {
        todayTotalPassengers: formatNumber(data.todayTotal),
        passengerChange: formatPercent(data.passengerChange),
        verificationRate: formatPercent(data.verificationRate),
        totalReports: formatNumber(data.totalReports),
        activeTeamLeads: formatNumber(data.activeTeamLeads),
        avgProcessingTime: formatTime(data.avgProcessingTime),
        lastUpdate: 'just now'
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
};

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

        // Update Passenger Trends
        if (this.charts.passengerTrends) {
            const trendData = data.hourlyFlow || [];
            this.charts.passengerTrends.data.labels = trendData.map(item => item.hour);
            this.charts.passengerTrends.data.datasets[0].data = trendData.map(item => item.total);
            this.charts.passengerTrends.update();
        }

        // Update Passenger Types
        if (this.charts.passengerTypes && data.typeDistribution) {
            const { iics, gia, others } = data.typeDistribution;
            this.charts.passengerTypes.data.datasets[0].data = [iics, gia, others];
            this.charts.passengerTypes.update();
        }

        // Update Verification Status
        if (this.charts.verificationStatus && data.verificationStatus) {
            const { verified, pending } = data.verificationStatus;
            this.charts.verificationStatus.data.datasets[0].data = [verified, pending];
            this.charts.verificationStatus.update();
        }
    }

    async refreshDashboard() {
        const data = await this.fetchDashboardData();
        if (data) {
            updateSummaryCards(data);
            this.updateCharts(data);
        }
    }

    setupAutoRefresh() {
        // Initial update
        this.refreshDashboard();
        
        // Setup WebSocket connection for real-time updates
        this.setupWebSocket();
        
        // Fallback refresh every minute in case WebSocket fails
        setInterval(() => this.refreshDashboard(), 60000);
    }

    setupWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/dashboard-updates`;
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            updateSummaryCards(data);
            this.updateCharts(data);
        };
        
        this.ws.onclose = () => {
            console.log('WebSocket connection closed. Attempting to reconnect...');
            // Try to reconnect in 2 seconds
            setTimeout(() => this.setupWebSocket(), 2000);
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            // Close the connection on error to trigger reconnect
            this.ws.close();
        };

        // Ping server every 30 seconds to keep connection alive
        this.pingInterval = setInterval(() => {
            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.send('ping');
            }
        }, 30000);
    }

    // Cleanup method to prevent memory leaks
    destroy() {
        Object.values(this.charts).forEach(chart => chart.destroy());
        this.charts = {};
    }
}

// Initialize dashboard charts when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardCharts = new DashboardCharts();
});