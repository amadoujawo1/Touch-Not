class ConfirmationDialog {
    constructor() {
        this.dialog = null;
        this.init();
    }

    init() {
        // Create dialog element if it doesn't exist
        if (!document.getElementById('confirmationDialog')) {
            const dialog = document.createElement('div');
            dialog.id = 'confirmationDialog';
            dialog.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden';
            dialog.innerHTML = `
                <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                    <div class="mt-3 text-center">
                        <h3 class="text-lg leading-6 font-medium text-gray-900">Confirm Submission</h3>
                        <div class="mt-2 px-7 py-3">
                            <p class="text-sm text-gray-500">
                                Total number of passengers attended: <span id="confirmTotalAttended" class="font-bold text-gray-700"></span>
                            </p>
                            <p class="mt-1 text-sm text-gray-500">Are you sure you want to submit this report?</p>
                        </div>
                        <div class="items-center px-4 py-3">
                            <button id="confirmButton"
                                class="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 mr-2">
                                Confirm
                            </button>
                            <button id="cancelButton"
                                class="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(dialog);
            this.dialog = dialog;

            // Add event listener for cancel button
            document.getElementById('cancelButton').addEventListener('click', () => {
                this.hide();
            });

            // Add event listener for confirm button
            document.getElementById('confirmButton').addEventListener('click', () => {
                if (this.onConfirm) {
                    this.onConfirm();
                }
                this.hide();
            });
        } else {
            this.dialog = document.getElementById('confirmationDialog');
        }
    }

    show(totalAttended, onConfirm) {
        document.getElementById('confirmTotalAttended').textContent = totalAttended;
        this.dialog.classList.remove('hidden');
        this.onConfirm = onConfirm;
    }

    hide() {
        this.dialog.classList.add('hidden');
    }
}

// Create a single instance
const confirmationDialog = new ConfirmationDialog();

// Export the instance
window.confirmationDialog = confirmationDialog;