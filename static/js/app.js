class App {
  constructor() {
    this.container = document.getElementById('app');
    this.currentUser = null;
    this.filteredReports = null;
    this.selectedDate = null; // For specific date updates
    this.selectedTeamLead = null; // For Data Analyst to select Team Lead for updates
    this.inactivityTimeout = null; // For automatic logout

    // Initialize with default flights and supervisors (Admin can modify)
    if (!storage.findUser('admin')) {
      storage.saveUser({
        username: 'admin',
        password: storage.hashPassword('admin123'),
        role: 'admin',
        gender: 'other',
        email: 'admin@securiport.com',
        telephone: '123-456-7890'
      });
      storage.saveFlightsAndSupervisors(['Brussel', 'Asky', 'Turkish Airline'], ['John Doe', 'Jane Smith', 'Bob Johnson']);
    }

    // Load activation data for the current user on initialization
    this.loadActivationData();

    this.init();
  }

  loadActivationData() {
    const activation = JSON.parse(localStorage.getItem(storage.ACTIVATED_TEAM_LEAD_KEY) || '{}');
    if (this.currentUser && this.currentUser.role === 'teamLead' && activation.username === this.currentUser.username) {
      this.selectedDate = activation.date || null;
    }
  }

  init() {
    this.header = new Header(document.createElement('div'));
    this.welcomeMessage = new WelcomeMessage(document.createElement('div'));
    this.loginForm = new LoginForm(document.createElement('div'));
    this.registerForm = new RegisterForm(document.createElement('div'));
    this.dataEntryForm = new DataEntryForm(document.createElement('div'));
    this.dataTable = new DataTable(document.createElement('div'));
    this.setupInactivityLogout(); // Set up inactivity logout
    this.showLoginScreen();
  }

  // Render the Securiport logo with responsive sizing
  renderLogo() {
    const logo = document.createElement('img');
    logo.src = '/css/image/my-logo.png'; // Updated to my-logo.png as requested
    logo.alt = 'Securiport Logo';
    logo.className = 'mx-auto my-2 w-[200px] h-[50px] sm:w-[250px] sm:h-[62.5px] md:w-[300px] md:h-[75px] lg:w-[400px] lg:h-[100px]'; // Adjusted for logo dimensions
    this.container.appendChild(logo);
  }

  // Show the login screen
  showLoginScreen() {
    this.clearContainer();
    this.renderLogo();
    this.welcomeMessage.render();
    this.container.appendChild(this.welcomeMessage.container);

    this.loginForm.render({
      onLogin: this.handleLogin.bind(this)
    });
    this.container.appendChild(this.loginForm.container);
    this.resetInactivityTimeout();
  }

  // Show the registration screen (Admin only)
  showRegisterScreen() {
    if (this.currentUser && this.currentUser.role !== 'admin') {
      this.showModal('Permission Denied', 'Only Admin can create user accounts.', () => {});
      return;
    }

    this.clearContainer();
    this.renderLogo();
    this.welcomeMessage.render();
    this.container.appendChild(this.welcomeMessage.container);

    this.registerForm.render({
      onRegister: this.handleRegister.bind(this),
      onCancel: () => this.showLoginScreen()
    });
    this.container.appendChild(this.registerForm.container);
    this.resetInactivityTimeout();
  }

  // Handle user login
  handleLogin(username, password) {
    const user = storage.findUser(username, password);
    if (user) {
      this.currentUser = user;
      this.loadActivationData(); // Load activation data after login
      this.showDashboard();
    } else {
      this.showModal('Login Failed', 'Invalid credentials or user is deactivated. Please try again or contact Admin.', () => {});
    }
  }

  // Handle user registration (Admin only)
  handleRegister(username, password, role, gender, email, telephone) {
    if (this.currentUser.role !== 'admin') {
      this.showModal('Permission Denied', 'Only Admin can create user accounts.', () => {});
      return;
    }

    if (storage.findUserByUsername(username)) {
      this.showModal('Registration Failed', 'Username already exists.', () => {});
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
      this.showModal('Registration Failed', 'Password does not meet complexity requirements.', () => {});
      return;
    }

    storage.saveUser({ username, password, role, gender, email, telephone });
    this.showModal('Registration Successful', 'User account created successfully. Please log in.', () => this.showLoginScreen());
  }

  // Handle user logout
  handleLogout() {
    this.currentUser = null;
    this.filteredReports = null;
    this.selectedDate = null;
    this.selectedTeamLead = null;
    clearTimeout(this.inactivityTimeout);
    this.showLoginScreen();
  }

  // Show the appropriate dashboard based on user role
  showDashboard() {
    this.clearContainer();
    this.header.render(this.currentUser.username, () => this.handleLogout());
    this.container.appendChild(this.header.container);
    this.resetInactivityTimeout();

    if (this.currentUser.role === 'admin') {
      this.showAdminDashboard();
    } else if (this.currentUser.role === 'teamLead') {
      this.showTeamLeadDashboard();
    } else if (this.currentUser.role === 'dataAnalyst') {
      this.showDataAnalystDashboard();
    } else if (this.currentUser.role === 'cashController') {
      this.showCashControllerDashboard();
    }
  }

  showAdminDashboard() {
    this.clearContainer();
    this.header.render(this.currentUser.username, () => this.handleLogout());
    this.container.appendChild(this.header.container);
    this.resetInactivityTimeout();

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'userSearch';
    searchInput.placeholder = 'Search users by name';
    searchInput.className = 'p-2 border rounded w-full md:w-auto mb-4 sm:p-1 sm:text-sm md:p-2 md:text-base';

    const navBar = document.createElement('nav');
    navBar.className = 'flex flex-col md:flex-row justify-end gap-2 p-2 sm:p-4';
    navBar.innerHTML = `
      <button id="createAccountBtn" class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 w-full md:w-auto sm:text-sm md:text-base">Create Account</button>
      <button id="manageFlightsSupervisorsBtn" class="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-700 w-full md:w-auto sm:text-sm md:text-base">Manage Flights/Supervisors</button>
      <button id="viewReportsBtn" class="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-700 w-full md:w-auto sm:text-sm md:text-base">View Reports</button>
    `;
    this.container.appendChild(searchInput);
    this.container.appendChild(navBar);

    document.getElementById('createAccountBtn').addEventListener('click', () => this.showRegisterScreen());
    document.getElementById('manageFlightsSupervisorsBtn').addEventListener('click', () => this.showFlightsSupervisorsModal());
    document.getElementById('viewReportsBtn').addEventListener('click', () => this.showAllReports());
    document.getElementById('userSearch').addEventListener('input', (e) => this.showUserManagementModal(e.target.value));

    this.showUserManagementModal(); // Default show all users
  }

  showTeamLeadDashboard() {
    if (this.currentUser.role === 'dataAnalyst' && this.selectedTeamLead) {
      this.showModal('Permission Denied', 'Data Analysts cannot access the Team Lead dashboard after activating a Team Lead update.', () => this.showDataAnalystDashboard());
      return;
    }

    this.clearContainer();
    this.header.render(this.currentUser.username, () => this.handleLogout());
    this.container.appendChild(this.header.container);
    this.resetInactivityTimeout();

    const { flights, supervisors } = storage.getFlightsAndSupervisors();
    this.dataEntryForm.render({
      onSubmit: this.handleReportSubmit.bind(this),
      flights,
      supervisors
    });
    this.container.appendChild(this.dataEntryForm.container);

    // Load activation data for the current Team Lead
    const activation = JSON.parse(localStorage.getItem(storage.ACTIVATED_TEAM_LEAD_KEY) || '{}');
    this.selectedDate = activation.date || null; // Set selectedDate from activation data
    const isUpdateActivated = storage.isUpdateActivated(this.currentUser.username, this.selectedDate);
    console.log('Team Lead Activation Status:', { username: this.currentUser.username, selectedDate: this.selectedDate, isUpdateActivated }); // Debug log

    this.dataTable.setCurrentUser(this.currentUser); // Pass current user to DataTable
    this.dataTable.render({
      data: storage.getReportsByUser(this.currentUser.username).sort((a, b) => new Date(b.date) - new Date(a.date)),
      showVerification: false,
      onUpdate: isUpdateActivated ? this.handleReportUpdate.bind(this) : null,
      onDownload: () => exportUtils.exportToCSV(storage.getReportsByUser(this.currentUser.username).filter(r => r.verified && this.isFiltered(r))),
      canDownload: false // Team Leads cannot download by default
    });
    this.container.appendChild(this.dataTable.container);
  }

  showDataAnalystDashboard() {
    this.clearContainer();
    this.header.render(this.currentUser.username, () => this.handleLogout());
    this.container.appendChild(this.header.container);
    this.resetInactivityTimeout();

    const teamLeads = storage.getUsers().filter(user => user.role === 'teamLead' && user.active);
    const teamLeadSelect = document.createElement('select');
    teamLeadSelect.id = 'teamLeadSelect';
    teamLeadSelect.className = 'p-2 border rounded w-full md:w-auto mb-4 sm:p-1 sm:text-sm md:p-2 md:text-base';
    teamLeadSelect.innerHTML = '<option value="">Select Team Lead</option>';
    teamLeads.forEach(teamLead => {
      const option = document.createElement('option');
      option.value = teamLead.username;
      option.textContent = teamLead.username;
      teamLeadSelect.appendChild(option);
    });

    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.id = 'teamLeadUpdateDate';
    dateInput.className = 'p-2 border rounded w-full md:w-auto mb-4 sm:p-1 sm:text-sm md:p-2 md:text-base';

    const activateButton = document.createElement('button');
    activateButton.textContent = 'Activate Team Lead Update';
    activateButton.className = 'bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 w-full md:w-auto mb-4 sm:p-1 sm:text-sm md:p-2 md:text-base';
    activateButton.addEventListener('click', () => {
      const teamLead = teamLeadSelect.value;
      const date = dateInput.value;
      if (teamLead && date) {
        storage.activateUpdateForTeamLead(teamLead, date);
        this.selectedTeamLead = teamLead;
        this.selectedDate = date; // Set selectedDate for the App instance
        this.showModal('Activation Successful', `Update button activated for ${teamLead} on ${date}.`, () => {
          this.showDataAnalystDashboard(); // Prevent Data Analyst from accessing Team Lead dashboard
        });
      } else {
        this.showModal('Error', 'Please select both a Team Lead and a date.', () => {});
      }
    });

    this.container.appendChild(teamLeadSelect);
    this.container.appendChild(dateInput);
    this.container.appendChild(activateButton);

    this.dataTable.setCurrentUser(this.currentUser); // Pass current user to DataTable
    this.dataTable.render({
      data: this.filteredReports || storage.getReports().sort((a, b) => new Date(b.date) - new Date(a.date)),
      showVerification: true,
      onVerify: this.handleReportVerification.bind(this),
      onUpdate: this.handleReportUpdate.bind(this), // Allow Data Analyst to edit data
      onDownload: () => exportUtils.exportToCSV((this.filteredReports || storage.getReports()).filter(r => r.verified && this.isFiltered(r))),
      canDownload: true
    });
    this.container.appendChild(this.dataTable.container);
  }

  showCashControllerDashboard() {
    this.clearContainer();
    this.header.render(this.currentUser.username, () => this.handleLogout());
    this.container.appendChild(this.header.container);
    this.resetInactivityTimeout();

    this.dataTable.setCurrentUser(this.currentUser); // Pass current user to DataTable
    this.dataTable.render({
      data: this.filteredReports || storage.getReports().sort((a, b) => new Date(b.date) - new Date(a.date)),
      showVerification: false,
      onVerify: null,
      onUpdate: null,
      onDownload: () => exportUtils.exportToCSV((this.filteredReports || storage.getReports()).filter(r => r.verified && this.isFiltered(r))),
      canDownload: true
    });
    this.container.appendChild(this.dataTable.container);
  }

  // Clear the container
  clearContainer() {
    this.container.innerHTML = '';
    this.filteredReports = null;
  }

  // Filter data by date range
  filterDataByDateRange(start, end) {
    this.filteredReports = storage.getReports().filter((report) => {
      const reportDate = new Date(report.date);
      return reportDate >= start && reportDate <= end;
    });

    this.dataTable.setCurrentUser(this.currentUser); // Pass current user to DataTable
    this.dataTable.render({
      data: this.filteredReports,
      showVerification: this.currentUser.role === 'dataAnalyst' || this.currentUser.role === 'admin',
      onVerify: this.handleReportVerification.bind(this),
      onUpdate: this.currentUser.role === 'dataAnalyst' ? this.handleReportUpdate.bind(this) : null,
      onDownload: () => exportUtils.exportToCSV(this.filteredReports.filter(r => r.verified)),
      canDownload: this.currentUser.role === 'dataAnalyst' || this.currentUser.role === 'cashController' || this.currentUser.role === 'admin'
    });
  }

  // Show all reports for Admin (without table)
  showAllReports() {
    this.clearContainer();
    this.header.render(this.currentUser.username, () => this.handleLogout());
    this.container.appendChild(this.header.container);
    this.resetInactivityTimeout();

    const dateRangeInput = document.createElement('input');
    dateRangeInput.type = 'text';
    dateRangeInput.id = 'dateRangePicker';
    dateRangeInput.className = 'date-range-picker-input w-full md:w-auto mb-4 p-2 border rounded sm:text-sm md:text-base';
    this.container.appendChild(dateRangeInput);

    $(function () {
      $('#dateRangePicker').daterangepicker({
        opens: 'left',
      }, (start, end) => {
        this.filterDataByDateRange(start, end);
      });
    });

    const reportList = document.createElement('div');
    reportList.className = 'p-4 bg-white rounded-lg shadow sm:p-2 md:p-4';
    reportList.innerHTML = `
      <h3 class="text-lg font-bold mb-4 sm:text-base md:text-lg">Reports</h3>
      <p class="text-gray-600">Use the date range picker above to filter reports, then download the filtered data using the Data Analyst or Cash Controller dashboard.</p>
    `;
    this.container.appendChild(reportList);
  }

  // Handle report submission (No validation for Team Lead)
  handleReportSubmit(data) {
    const total = storage.calculateTotal(data);
    const totalAttended = total - Number(data['refunds'] || 0); // Subtract refunds for total attended
    const iicsTotal = total; // IICS Total includes all fields, including refunds
    const giaTotal = totalAttended; // GIA Total matches total attended (excluding refunds)

    const report = {
      ...data,
      id: crypto.randomUUID(),
      submittedBy: this.currentUser.username,
      verified: false,
      totalAttended,
      iicsTotal,
      giaTotal,
      iicsInfant: Number(data.infants || 0),
      iicsAdult: iicsTotal - Number(data.infants || 0),
      giaInfant: Number(data.infants || 0),
      giaAdult: giaTotal - Number(data.infants || 0),
      iicsTotalDifference: iicsTotal - totalAttended, // IICS - Total Attended
      giaTotalDifference: giaTotal - totalAttended,   // GIA - Total Attended
      flightName: data.flight, // Fix flight name issue
      remarks: data.remarks || ''
    };

    this.showModal('Confirm Submission', 'Are you sure you want to submit this data? Once submitted, you cannot edit it.', () => {
      storage.saveReport(report);
      this.showModal('Success', 'Report submitted successfully!', () => this.showDashboard());
      
      // Reflect updates on Data Analyst dashboard
      if (this.currentUser.role === 'teamLead') {
        this.updateDataAnalystTable();
      }
    });
  }

  // Handle report update (Allow editing for activated Team Leads on selected date)
  handleReportUpdate(id, updatedData) {
    const report = storage.getReportById(id);
    const activation = JSON.parse(localStorage.getItem(storage.ACTIVATED_TEAM_LEAD_KEY) || '{}');
    const selectedDate = activation.date;

    if (!selectedDate) {
      this.showModal('Error', 'No activation date set by Data Analyst. Contact the Data Analyst for activation.', () => {});
      return;
    }

    if (report.date !== selectedDate) {
      this.showModal('Error', 'You can only update reports for the date activated by the Data Analyst.', () => {});
      return;
    }

    if (this.currentUser.role === 'teamLead' && report.submittedBy === this.currentUser.username && storage.isUpdateActivated(this.currentUser.username, selectedDate)) {
      const total = storage.calculateTotal(updatedData);
      const totalAttended = total - Number(updatedData['refunds'] || 0); // Subtract refunds for total attended
      const iicsTotal = total; // IICS Total includes all fields, including refunds
      const giaTotal = totalAttended; // GIA Total matches total attended (excluding refunds)

      console.log('Updated Data Before Save:', updatedData, 'Total:', total, 'Total Attended:', totalAttended, 'IICS Total:', iicsTotal, 'GIA Total:', giaTotal); // Debug log

      const updatedReport = {
        ...updatedData,
        totalAttended,
        iicsTotal,
        giaTotal,
        iicsInfant: Number(updatedData.infants || 0),
        iicsAdult: iicsTotal - Number(updatedData.infants || 0),
        giaInfant: Number(updatedData.infants || 0),
        giaAdult: giaTotal - Number(updatedData.infants || 0),
        iicsTotalDifference: iicsTotal - totalAttended, // IICS - Total Attended
        giaTotalDifference: giaTotal - totalAttended,   // GIA - Total Attended
        flightName: updatedData.flight, // Fix flight name issue
      };

      if (storage.updateReport(id, updatedReport)) {
        this.showModal('Success', 'Report updated successfully!', () => {
          this.showTeamLeadDashboard();
          this.updateDataAnalystTable(); // Reflect updates on Data Analyst dashboard immediately
        });
      } else {
        this.showModal('Error', 'Failed to update the report. Please try again.', () => {});
      }
    } else if (this.currentUser.role === 'dataAnalyst') {
      const iicsInfant = Number(updatedData.iicsInfant) || 0;
      const iicsAdult = Number(updatedData.iicsAdult) || 0;
      const iicsTotal = Number(updatedData.iicsTotal) || 0;
      const giaInfant = Number(updatedData.giaInfant) || 0;
      const giaAdult = Number(updatedData.giaAdult) || 0;
      const giaTotal = Number(updatedData.giaTotal) || 0;

      if (Object.keys(validation.validateIICSGIA(iicsInfant, iicsAdult, iicsTotal, giaInfant, giaAdult, giaTotal)).length > 0) {
        this.showModal('Validation Error', 'Please enter valid non-negative numbers and ensure totals match.', () => {});
        return;
      }

      const totalAttended = report.totalAttended || 0;
      const iicsTotalDifference = iicsTotal - totalAttended;
      const giaTotalDifference = giaTotal - totalAttended;

      if (Object.keys(validation.validateDifference(totalAttended, iicsTotal, giaTotal)).length > 0) {
        this.showModal('Validation Error', 'Total Attended cannot be less than IICS or GIA Total.', () => {});
        return;
      }

      storage.updateReport(id, { ...updatedData, iicsTotalDifference, giaTotalDifference });
      this.showModal('Success', 'Report updated successfully!', () => this.showDataAnalystDashboard());
    } else {
      this.showModal('Permission Denied', 'You do not have permission to update this report or the Team Lead update is not activated for you.', () => {});
    }
  }

  // Handle report verification (Validation only for Data Analyst)
  handleReportVerification(id, { iicsInfant, iicsAdult, iicsTotal, giaInfant, giaAdult, giaTotal, iicsTotalDifference, giaTotalDifference }) {
    if (this.currentUser.role !== 'dataAnalyst') {
      this.showModal('Permission Denied', 'Only Data Analysts can verify reports.', () => {});
      return;
    }

    const errors = validation.validateIICSGIA(iicsInfant, iicsAdult, iicsTotal, giaInfant, giaAdult, giaTotal);
    if (Object.keys(errors).length > 0) {
      this.showModal('Validation Error', Object.values(errors).join('\n'), () => {});
      return;
    }

    const report = storage.getReportById(id);
    const totalAttended = report.totalAttended || 0;

    if (Object.keys(validation.validateDifference(totalAttended, iicsTotal, giaTotal)).length > 0) {
      this.showModal('Validation Error', 'Total Attended cannot be less than IICS or GIA Total.', () => {});
      return;
    }

    storage.verifyUpdate(id, 'approved', this.currentUser.username);
    storage.updateReport(id, { iicsInfant, iicsAdult, iicsTotal, giaInfant, giaAdult, giaTotal, iicsTotalDifference, giaTotalDifference, verified: true, verifiedBy: this.currentUser.username });
    this.showModal('Success', 'Report verified successfully!', () => this.showDashboard());
  }

  // Show user management modal for Admin with search
  showUserManagementModal(searchQuery = '') {
    const users = storage.getUsers().filter(user => 
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    let modalContent = `
      <h3 class="text-lg font-bold mb-4 sm:text-base md:text-lg">Manage Users</h3>
      <div class="max-h-64 overflow-y-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-2 text-left sm:text-sm md:text-base">Username</th>
              <th class="p-2 text-left sm:text-sm md:text-base">Role</th>
              <th class="p-2 text-left sm:text-sm md:text-base">Status</th>
              <th class="p-2 text-left sm:text-sm md:text-base">Actions</th>
            </tr>
          </thead>
          <tbody>
    `;

    users.forEach(user => {
      modalContent += `
        <tr class="border-b">
          <td class="p-2 sm:text-sm md:text-base">${user.username}</td>
          <td class="p-2 sm:text-sm md:text-base">${user.role}</td>
          <td class="p-2 sm:text-sm md:text-base">${user.active ? 'Active' : 'Deactivated'}</td>
          <td class="p-2 space-x-2 sm:space-x-1">
            <button class="deactivate-btn bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 sm:text-xs md:text-sm" data-username="${user.username}">${user.active ? 'Deactivate' : 'Activate'}</button>
            <button class="delete-btn bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 sm:text-xs md:text-sm" data-username="${user.username}">Delete</button>
            <button class="change-password-btn bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 sm:text-xs md:text-sm" data-username="${user.username}">Change Password</button>
          </td>
        </tr>
      `;
    });

    modalContent += `
          </tbody>
        </table>
      </div>
    `;

    this.showModal('Manage Users', modalContent, () => {}, true);

    const modal = document.querySelector('.modal');
    modal.querySelectorAll('.deactivate-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const username = btn.dataset.username;
        if (storage.findUserByUsername(username).active) {
          storage.deactivateUser(username);
        } else {
          storage.activateUser(username);
        }
        this.showModal('Success', `User ${username} ${storage.findUserByUsername(username).active ? 'activated' : 'deactivated'} successfully!`, () => this.showUserManagementModal(searchQuery));
      });
    });

    modal.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const username = btn.dataset.username;
        if (confirm(`Are you sure you want to delete ${username}?`)) {
          storage.deleteUser(username);
          this.showModal('Success', `User ${username} deleted successfully!`, () => this.showUserManagementModal(searchQuery));
        }
      });
    });

    modal.querySelectorAll('.change-password-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const username = btn.dataset.username;
        const newPassword = prompt('Enter new password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char):');
        if (newPassword && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(newPassword)) {
          storage.updateUserPassword(username, newPassword);
          this.showModal('Success', `Password for ${username} updated successfully!`, () => this.showUserManagementModal(searchQuery));
        } else {
          this.showModal('Error', 'Invalid password format.', () => {});
        }
      });
    });
  }

  // Show flights and supervisors management modal for Admin (persist permanently)
  showFlightsSupervisorsModal() {
    const { flights, supervisors } = storage.getFlightsAndSupervisors();
    let modalContent = `
      <h3 class="text-lg font-bold mb-4 sm:text-base md:text-lg">Manage Flights & Supervisors</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 sm:text-base">Flights (comma-separated)</label>
          <input type="text" id="flightsInput" value="${flights.join(', ')}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm md:text-base" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 sm:text-base">Supervisors (comma-separated)</label>
          <input type="text" id="supervisorsInput" value="${supervisors.join(', ')}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm md:text-base" />
        </div>
        <button id="saveFlightsSupervisors" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 sm:text-sm md:text-base">Save Changes</button>
      </div>
    `;

    this.showModal('Manage Flights & Supervisors', modalContent, () => {}, true);

    const modal = document.querySelector('.modal');
    modal.querySelector('#saveFlightsSupervisors').addEventListener('click', () => {
      const flightsInput = modal.querySelector('#flightsInput').value.trim().split(',').map(f => f.trim()).filter(Boolean);
      const supervisorsInput = modal.querySelector('#supervisorsInput').value.trim().split(',').map(s => s.trim()).filter(Boolean);
      storage.saveFlightsAndSupervisors(flightsInput, supervisorsInput);
      this.showModal('Success', 'Flights and supervisors updated successfully and saved permanently!', () => this.showAdminDashboard());
    });
  }

  // Update Data Analyst table to reflect Team Lead updates
  updateDataAnalystTable() {
    if (this.currentUser && this.currentUser.role === 'dataAnalyst') {
      this.showDataAnalystDashboard();
    } else {
      // If no current user (e.g., after logout), try to notify Data Analyst
      const dataAnalystUsers = storage.getUsers().filter(user => user.role === 'dataAnalyst' && user.active);
      if (dataAnalystUsers.length > 0) {
        dataAnalystUsers.forEach(user => {
          // This is a placeholder; in a real app, you might use a notification system
          console.log(`Update available for Data Analyst ${user.username}.`);
        });
      }
    }
  }

  // Setup inactivity logout (2 minutes = 120,000 ms)
  setupInactivityLogout() {
    const resetInactivity = () => {
      clearTimeout(this.inactivityTimeout);
      this.inactivityTimeout = setTimeout(() => {
        this.showModal('Session Expired', 'You have been logged out due to inactivity (2 minutes).', () => this.handleLogout());
      }, 120000); // 2 minutes
    };

    // Reset timeout on any user interaction
    ['mousemove', 'keypress', 'click', 'scroll'].forEach(event => {
      document.addEventListener(event, resetInactivity);
    });

    // Clean up event listeners on logout
    window.addEventListener('unload', () => {
      ['mousemove', 'keypress', 'click', 'scroll'].forEach(event => {
        document.removeEventListener(event, resetInactivity);
      });
    });
  }

  // Reset inactivity timeout
  resetInactivityTimeout() {
    clearTimeout(this.inactivityTimeout);
    this.inactivityTimeout = setTimeout(() => {
      this.showModal('Session Expired', 'You have been logged out due to inactivity (2 minutes).', () => this.handleLogout());
    }, 120000); // 2 minutes
  }

  // Show modal for user interactions
  showModal(title, message, onConfirm, persistent = false) {
    const modal = document.createElement('div');
    modal.className = 'modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="modal-content bg-white p-6 rounded-lg shadow-lg max-w-md w-full sm:max-w-lg md:max-w-xl">
        <h3 class="text-lg font-bold mb-4 sm:text-base md:text-lg">${title}</h3>
        <p class="mb-4 sm:text-sm md:text-base">${message}</p>
        <div class="flex justify-end gap-4">
          ${persistent ? '' : '<button class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-gray-800 sm:text-sm md:text-base">Cancel</button>'}
          <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 sm:text-sm md:text-base" id="confirmBtn">${persistent ? 'Close' : 'Confirm'}</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#confirmBtn').addEventListener('click', () => {
      if (onConfirm) onConfirm();
      document.body.removeChild(modal);
      this.resetInactivityTimeout(); // Reset timeout after modal interaction
    });

    if (!persistent) {
      modal.querySelector('button:nth-child(1)').addEventListener('click', () => {
        document.body.removeChild(modal);
        this.resetInactivityTimeout(); // Reset timeout after modal interaction
      });
    }
  }
}

new App();