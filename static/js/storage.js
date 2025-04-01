class Storage {
  static REPORTS_KEY = 'reports';
  static ACTIVATED_TEAM_LEAD_KEY = 'activatedTeamLead';
  static FLIGHTS_KEY = 'flights';
  static SUPERVISORS_KEY = 'supervisors';

  static getReports() {
    try {
      const reports = JSON.parse(localStorage.getItem(this.REPORTS_KEY) || '[]');
      return reports;
    } catch (error) {
      console.error('Error getting reports:', error);
      return [];
    }
  }

  static getReportById(id) {
    const reports = this.getReports();
    return reports.find(report => report.id === id) || null;
  }

  static getReportsByUser(username) {
    const reports = this.getReports();
    return reports.filter(report => report.submittedBy === username);
  }

  static saveReport(report) {
    try {
      const reports = this.getReports();
      report.id = report.id || Date.now().toString();
      reports.push(report);
      localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));
      return true;
    } catch (error) {
      console.error('Error saving report:', error);
      return false;
    }
  }

  static updateReport(id, updatedData) {
    try {
      const reports = this.getReports();
      const index = reports.findIndex(report => report.id === id);
      if (index !== -1) {
        reports[index] = { ...reports[index], ...updatedData };
        localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating report:', error);
      return false;
    }
  }

  static isUpdateActivated(username, date) {
    try {
      const activation = JSON.parse(localStorage.getItem(this.ACTIVATED_TEAM_LEAD_KEY) || '{}');
      return activation.username === username && activation.date === date;
    } catch (error) {
      console.error('Error checking update activation:', error);
      return false;
    }
  }

  static setUpdateActivation(username, date) {
    try {
      localStorage.setItem(this.ACTIVATED_TEAM_LEAD_KEY, JSON.stringify({ username, date }));
      return true;
    } catch (error) {
      console.error('Error setting update activation:', error);
      return false;
    }
  }

  static clearUpdateActivation() {
    localStorage.removeItem(this.ACTIVATED_TEAM_LEAD_KEY);
  }

  static getFlights() {
    try {
      return JSON.parse(localStorage.getItem(this.FLIGHTS_KEY) || '[]');
    } catch (error) {
      console.error('Error getting flights:', error);
      return [];
    }
  }

  static getSupervisors() {
    try {
      return JSON.parse(localStorage.getItem(this.SUPERVISORS_KEY) || '[]');
    } catch (error) {
      console.error('Error getting supervisors:', error);
      return [];
    }
  }

  static setFlights(flights) {
    try {
      localStorage.setItem(this.FLIGHTS_KEY, JSON.stringify(flights));
      return true;
    } catch (error) {
      console.error('Error setting flights:', error);
      return false;
    }
  }

  static setSupervisors(supervisors) {
    try {
      localStorage.setItem(this.SUPERVISORS_KEY, JSON.stringify(supervisors));
      return true;
    } catch (error) {
      console.error('Error setting supervisors:', error);
      return false;
    }
  }
}

// Export the Storage class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
} else {
  window.storage = Storage;
}