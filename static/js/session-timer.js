class SessionTimer {
    constructor(timeoutDuration = 120000) { // 2 minutes in milliseconds
        this.timeoutDuration = timeoutDuration;
        this.warningThreshold = 30000; // Show warning 30 seconds before timeout
        this.timer = null;
        this.warningTimer = null;
        this.warningShown = false;
        this.modal = null;
        this.setupModal();
        this.initializeEventListeners();
        this.startTimer();
    }

    setupModal() {
        // Create modal element
        this.modal = document.createElement('div');
        this.modal.className = 'session-timeout-modal';
        this.modal.style.cssText = `
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
        `;

        this.modal.innerHTML = `
            <h3 style="margin-top: 0;">Session Timeout Warning</h3>
            <p>Your session will expire soon due to inactivity.</p>
            <p>You will be logged out in <span id="countdown">30</span> seconds.</p>
            <button onclick="sessionTimer.resetTimer()" style="
                background: #007bff;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
            ">Stay Logged In</button>
        `;

        // Add modal overlay
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 999;
        `;

        document.body.appendChild(this.overlay);
        document.body.appendChild(this.modal);
    }

    initializeEventListeners() {
        // Track user activity
        this.activities = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        this.activityHandler = () => this.resetTimer();
        this.activities.forEach(activity => {
            document.addEventListener(activity, this.activityHandler);
        });
    }

    removeEventListeners() {
        // Clean up event listeners
        if (this.activities && this.activityHandler) {
            this.activities.forEach(activity => {
                document.removeEventListener(activity, this.activityHandler);
            });
        }
    }

    startTimer() {
        this.clearTimers();
        this.timer = setTimeout(() => this.logout(), this.timeoutDuration);
        this.warningTimer = setTimeout(() => this.showWarning(), 
            this.timeoutDuration - this.warningThreshold);
    }

    resetTimer() {
        this.hideWarning();
        this.startTimer();
    }

    clearTimers() {
        if (this.timer) clearTimeout(this.timer);
        if (this.warningTimer) clearTimeout(this.warningTimer);
        this.warningShown = false;
    }

    showWarning() {
        if (this.warningShown) return;
        this.warningShown = true;
        this.modal.style.display = 'block';
        this.overlay.style.display = 'block';

        let countdown = 30;
        const countdownElement = document.getElementById('countdown');
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdownElement) countdownElement.textContent = countdown;
            if (countdown <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);
    }

    hideWarning() {
        this.modal.style.display = 'none';
        this.overlay.style.display = 'none';
        this.warningShown = false;
    }

    async logout() {
        try {
            // Clear all timers
            this.clearTimers();
            
            // Clear any stored session data
            localStorage.clear();
            sessionStorage.clear();
            
            // Remove all cookies
            document.cookie.split(';').forEach(cookie => {
                document.cookie = cookie.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
            });

            // Attempt to logout from server
            const response = await fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include' // Include cookies in the request
            });

            if (!response.ok) {
                throw new Error(`Logout failed with status: ${response.status}`);
            }

            // Clear any application-specific data
            if (window.indexedDB) {
                const databases = await window.indexedDB.databases();
                databases.forEach(db => window.indexedDB.deleteDatabase(db.name));
            }

            // Remove any custom event listeners
            this.removeEventListeners();

            // Force clear any authentication tokens
            if (window.sessionStorage) sessionStorage.clear();
            if (window.localStorage) localStorage.clear();

            // Invalidate any service worker caches
            if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
            }

            // Redirect to login page
            window.location.replace('/login?expired=true');

        } catch (error) {
            console.error('Logout process failed:', error);
            // Even if the logout process fails, clear client-side data and redirect
            if (window.sessionStorage) sessionStorage.clear();
            if (window.localStorage) localStorage.clear();
            window.location.replace('/login?error=true');
        }
    }
}

// Initialize the session timer
const sessionTimer = new SessionTimer();
// Make it globally accessible
window.sessionTimer = sessionTimer;