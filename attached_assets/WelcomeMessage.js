class WelcomeMessage {
  constructor(container) {
    this.container = container;
  }

  render() {
    this.container.innerHTML = `
      <div class="text-center mb-8 p-4">
        <h1 class="text-3xl font-bold text-blue-900 mb-2 sm:text-2xl md:text-3xl">
          Daily Cash Collection Report
        </h1>
        <p class="text-gray-600 sm:text-base md:text-lg">
          Please log in to continue
        </p>
      </div>
    `;
  }
}