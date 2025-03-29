// notifications.js - Real-time notification system

class NotificationSystem {
    constructor() {
        this.notificationContainer = document.getElementById('notification-container');
        if (!this.notificationContainer) {
            this.createNotificationContainer();
        }
        this.checkForUpdates();
    }

    createNotificationContainer() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.id = 'notification-container';
        this.notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
        `;
        document.body.appendChild(this.notificationContainer);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-bottom: 10px;
            padding: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            animation: slideIn 0.3s ease-out;
        `;

        const icon = this.getIcon(type);
        const color = this.getColor(type);
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center;">
                <i class="${icon}" style="color: ${color}; margin-right: 10px;"></i>
                <span>${message}</span>
            </div>
            <button class="close-btn" style="background: none; border: none; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        `;

        this.notificationContainer.appendChild(notification);

        // Add click event for close button
        notification.querySelector('.close-btn').addEventListener('click', () => {
            notification.remove();
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    getColor(type) {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        return colors[type] || colors.info;
    }

    checkForUpdates() {
        // Check for report verifications
        if (window.location.pathname.includes('team-lead')) {
            this.checkReportVerifications();
        }

        // Check for new reports if user is a data analyst
        if (window.location.pathname.includes('data-analyst')) {
            this.checkNewReports();
        }
    }

    checkReportVerifications() {
        setInterval(() => {
            fetch('/team-lead/api/reports')
                .then(response => response.json())
                .then(reports => {
                    const recentVerifications = reports.filter(report => 
                        report.verified && 
                        new Date(report.updated_at) > new Date(Date.now() - 300000) // Last 5 minutes
                    );

                    recentVerifications.forEach(report => {
                        this.showNotification(
                            `Report ${report.refNo} has been verified by ${report.verifiedBy}`,
                            'success'
                        );
                    });
                })
                .catch(error => console.error('Error checking verifications:', error));
        }, 300000); // Check every 5 minutes
    }

    checkNewReports() {
        setInterval(() => {
            fetch('/data-analyst/api/reports')
                .then(response => response.json())
                .then(reports => {
                    const recentReports = reports.filter(report => 
                        !report.verified && 
                        new Date(report.created_at) > new Date(Date.now() - 300000) // Last 5 minutes
                    );

                    recentReports.forEach(report => {
                        this.showNotification(
                            `New report submitted by ${report.submittedBy} for flight ${report.flightName}`,
                            'info'
                        );
                    });
                })
                .catch(error => console.error('Error checking new reports:', error));
        }, 300000); // Check every 5 minutes
    }
}

// Initialize notification system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.notificationSystem = new NotificationSystem();
});

// Add styles to the document
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    .notification {
        transition: transform 0.3s ease-out;
    }

    .notification:hover {
        transform: translateY(-2px);
    }
`;
document.head.appendChild(style);