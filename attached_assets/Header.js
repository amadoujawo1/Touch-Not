class Header {
  constructor(container) {
    this.container = container;
  }

  render(username, onLogout) {
    this.container.innerHTML = `
      <header class="bg-white shadow-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div class="flex items-center space-x-4">
            <img src="/css/image/my-logo.png" alt="Securiport Logo" class="h-10 w-auto sm:h-12 md:h-14">
            <h1 class="text-2xl font-bold text-gray-900 sm:text-xl md:text-2xl">
              Daily Cash Collection Report
            </h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-gray-600 text-sm sm:text-base">Welcome, ${username}</span>
            <button id="logoutBtn" class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 sm:px-4 sm:py-2">
              Logout
            </button>
          </div>
        </div>
      </header>
    `;

    this.container.querySelector('#logoutBtn').addEventListener('click', onLogout);
  }
}