const storage = {
  USERS_KEY: 'cash_collection_users',
  REPORTS_KEY: 'cash_collection_reports',
  PENDING_UPDATES_KEY: 'cash_collection_pending_updates',
  ACTIVATED_TEAM_LEAD_KEY: 'cash_collection_activated_team_lead',
  FLIGHTS_SUPERVISORS_KEY: 'cash_collection_flights_supervisors',

  // User management
  getUsers() {
    return JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
  },

  saveUser(user) {
    const users = this.getUsers();
    const existingUser = users.find((u) => u.username === user.username);
    if (existingUser) {
      Object.assign(existingUser, user); // Update existing user
    } else {
      users.push({ ...user, active: true, password: this.hashPassword(user.password) }); // Hash password
    }
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  },

  findUser(username, password) {
    const users = this.getUsers();
    const hashedPassword = this.hashPassword(password);
    const user = users.find((u) => u.username === username && u.password === hashedPassword);
    return user && user.active ? user : null; // Only return active users
  },

  findUserByUsername(username) {
    const users = this.getUsers();
    return users.find((u) => u.username === username);
  },

  deactivateUser(username) {
    const users = this.getUsers();
    const user = users.find((u) => u.username === username);
    if (user) {
      user.active = false;
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }
  },

  activateUser(username) {
    const users = this.getUsers();
    const user = users.find((u) => u.username === username);
    if (user) {
      user.active = true;
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }
  },

  deleteUser(username) {
    const users = this.getUsers();
    const updatedUsers = users.filter((u) => u.username !== username);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(updatedUsers));
  },

  updateUserPassword(username, newPassword) {
    const users = this.getUsers();
    const user = users.find((u) => u.username === username);
    if (user) {
      user.password = this.hashPassword(newPassword);
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }
  },

  hashPassword(password) {
    // Simple hash for demonstration (not secure for production, use bcrypt or similar)
    return btoa(password); // Base64 encode for basic obfuscation
  },

  // Report management
  getReports() {
    return JSON.parse(localStorage.getItem(this.REPORTS_KEY) || '[]');
  },

  saveReport(report) {
    const reports = this.getReports();
    reports.push({ ...report, id: crypto.randomUUID(), submittedBy: report.submittedBy, verified: false, verifiedBy: null });
    localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));
  },

  updateReport(id, updates) {
    const reports = this.getReports();
    const index = reports.findIndex((r) => r.id === id);
    if (index !== -1) {
      reports[index] = { ...reports[index], ...updates };
      localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));
      return true;
    }
    return false;
  },

  getReportById(id) {
    const reports = this.getReports();
    return reports.find((r) => r.id === id);
  },

  getReportsByUser(username) {
    const reports = this.getReports();
    return reports.filter((r) => r.submittedBy === username);
  },

  deleteReport(id) {
    const reports = this.getReports();
    const updatedReports = reports.filter((r) => r.id !== id);
    localStorage.setItem(this.REPORTS_KEY, JSON.stringify(updatedReports));
  },

  // Pending updates
  getPendingUpdates() {
    return JSON.parse(localStorage.getItem(this.PENDING_UPDATES_KEY) || '[]');
  },

  savePendingUpdate(id, updatedData, submittedBy) {
    const pendingUpdates = this.getPendingUpdates();
    pendingUpdates.push({
      id,
      updatedData,
      submittedBy,
      status: 'pending',
    });
    localStorage.setItem(this.PENDING_UPDATES_KEY, JSON.stringify(pendingUpdates));
  },

  getPendingUpdatesByUser(username) {
    const pendingUpdates = this.getPendingUpdates();
    return pendingUpdates.filter((update) => update.submittedBy === username);
  },

  getAllPendingUpdates() {
    const pendingUpdates = this.getPendingUpdates();
    return pendingUpdates.filter((update) => update.status === 'pending');
  },

  verifyUpdate(id, status, verifier) {
    const pendingUpdates = this.getPendingUpdates();
    const update = pendingUpdates.find((u) => u.id === id);
    if (update) {
      update.status = status; // approved or rejected
      if (status === 'approved') {
        const reports = this.getReports();
        const report = reports.find((r) => r.id === id);
        if (report) {
          Object.assign(report, update.updatedData); // Apply the update to the report
          report.verified = true;
          report.verifiedBy = verifier;
          localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));
        }
      }
      localStorage.setItem(this.PENDING_UPDATES_KEY, JSON.stringify(pendingUpdates));
    }
  },

  // Activation for Team Leads
  activateUpdateForTeamLead(username, date) {
    localStorage.setItem(this.ACTIVATED_TEAM_LEAD_KEY, JSON.stringify({ username, date }));
  },

  isUpdateActivated(username, date) {
    const activated = JSON.parse(localStorage.getItem(this.ACTIVATED_TEAM_LEAD_KEY) || '{}');
    console.log('Checking activation for:', { username, date, activated }); // Debug log
    if (!date) {
      // If no date is provided, check if the username matches any active activation
      return activated.username === username;
    }
    return activated.username === username && activated.date === date;
  },

  // Flights and Supervisors (for Admin, persist permanently)
  getFlightsAndSupervisors() {
    const data = JSON.parse(localStorage.getItem(this.FLIGHTS_SUPERVISORS_KEY) || '{"flights": ["Brussel", "Asky", "Turkish Airline"], "supervisors": ["John Doe", "Jane Smith", "Bob Johnson"]}');
    return { flights: data.flights || [], supervisors: data.supervisors || [] };
  },

  saveFlightsAndSupervisors(flights, supervisors) {
    localStorage.setItem(this.FLIGHTS_SUPERVISORS_KEY, JSON.stringify({ flights, supervisors }));
  },

  // Utility to calculate total attended
  calculateTotal(formData) {
    const sumFields = [
      'paid', 'diplomats', 'infants', 'notPaid', 'paidCardQr',
      'deportees', 'transit', 'waivers', 'prepaidBank',
      'roundTrip', 'latePayment', 'refunds' // Include refunds in the total calculation
    ];
    const total = sumFields.reduce((sum, field) => sum + (Number(formData[field]) || 0), 0);
    console.log('Calculated Total:', total, 'from formData:', formData); // Debug log
    return total;
  },

  // Clear all data (for testing purposes)
  clearAll() {
    localStorage.removeItem(this.USERS_KEY);
    localStorage.removeItem(this.REPORTS_KEY);
    localStorage.removeItem(this.PENDING_UPDATES_KEY);
    localStorage.removeItem(this.ACTIVATED_TEAM_LEAD_KEY);
    localStorage.removeItem(this.FLIGHTS_SUPERVISORS_KEY);
  },
};