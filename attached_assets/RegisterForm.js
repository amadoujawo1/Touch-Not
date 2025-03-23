class RegisterForm {
  constructor(container) {
    this.container = container;
  }

  render({ onRegister, onCancel }) {
    this.container.innerHTML = `
      <div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg sm:p-10 md:p-12">
        <h2 class="text-2xl font-bold text-center mb-6 sm:text-xl md:text-2xl">Register New User (Admin Only)</h2>
        <form id="registerForm" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 sm:text-base">Username</label>
            <input
              type="text"
              id="username"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm md:text-base"
              placeholder="Enter your username"
            />
            <p class="text-xs text-gray-500 mt-1 sm:text-sm">Username must be unique.</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 sm:text-base">Password</label>
            <input
              type="password"
              id="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm md:text-base"
              placeholder="Enter your password"
            />
            <p class="text-xs text-gray-500 mt-1 sm:text-sm">Password must be at least 8 characters, with one uppercase, one lowercase, one number, and one special character.</p>
            <span id="passwordFeedback" class="text-xs text-red-500 hidden sm:text-sm"></span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 sm:text-base">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm md:text-base"
              placeholder="Confirm your password"
            />
            <span id="confirmPasswordFeedback" class="text-xs text-red-500 hidden sm:text-sm"></span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 sm:text-base">Role</label>
            <select
              id="role"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm md:text-base"
            >
              <option value="">Select a role</option>
              <option value="teamLead">Team Lead</option>
              <option value="dataAnalyst">Data Analyst</option>
              <option value="cashController">Cash Controller</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 sm:text-base">Gender</label>
            <select
              id="gender"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm md:text-base"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 sm:text-base">Email</label>
            <input
              type="email"
              id="email"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm md:text-base"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 sm:text-base">Telephone</label>
            <input
              type="tel"
              id="telephone"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm md:text-base"
              placeholder="Enter your telephone number"
            />
          </div>
          <div class="flex justify-between">
            <button
              type="submit"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 sm:px-5 sm:py-2 md:px-6 md:py-3"
            >
              Create Account
            </button>
            <button
              type="button"
              id="cancelBtn"
              class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 sm:px-5 sm:py-2 md:px-6 md:py-3"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    `;

    const passwordInput = this.container.querySelector('#password');
    const confirmPasswordInput = this.container.querySelector('#confirmPassword');
    const passwordFeedback = this.container.querySelector('#passwordFeedback');
    const confirmPasswordFeedback = this.container.querySelector('#confirmPasswordFeedback');

    const validatePasswords = () => {
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;

      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
        passwordFeedback.textContent = 'Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character.';
        passwordFeedback.classList.remove('hidden');
        passwordFeedback.classList.add('text-red-500');
      } else {
        passwordFeedback.textContent = 'Password meets all criteria.';
        passwordFeedback.classList.remove('hidden');
        passwordFeedback.classList.add('text-green-500');
      }

      if (password !== confirmPassword) {
        confirmPasswordFeedback.textContent = 'Passwords do not match.';
        confirmPasswordFeedback.classList.remove('hidden');
        confirmPasswordFeedback.classList.add('text-red-500');
      } else {
        confirmPasswordFeedback.textContent = 'Passwords match.';
        confirmPasswordFeedback.classList.remove('hidden');
        confirmPasswordFeedback.classList.add('text-green-500');
      }
    };

    passwordInput.addEventListener('input', validatePasswords);
    confirmPasswordInput.addEventListener('input', validatePasswords);

    this.container.querySelector('#registerForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const username = this.container.querySelector('#username').value;
      const password = this.container.querySelector('#password').value;
      const confirmPassword = this.container.querySelector('#confirmPassword').value;
      const role = this.container.querySelector('#role').value;
      const gender = this.container.querySelector('#gender').value;
      const email = this.container.querySelector('#email').value;
      const telephone = this.container.querySelector('#telephone').value;

      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
        alert('Password does not meet complexity requirements.');
        return;
      }

      if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
      }

      onRegister(username, password, role, gender, email, telephone);
    });

    this.container.querySelector('#cancelBtn').addEventListener('click', onCancel);
  }
}