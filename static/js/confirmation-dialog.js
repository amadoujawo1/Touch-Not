class ConfirmationDialog {
    constructor() {
        this.modal = null;
        this.confirmButton = null;
        this.cancelButton = null;
        this.backdrop = null;
        this.initialize();
    }

    initialize() {
        // Create modal elements
        this.modal = document.createElement('div');
        this.modal.className = 'fixed inset-0 flex items-center justify-center z-50 hidden';
        
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'fixed inset-0 bg-black bg-opacity-50 transition-opacity';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'bg-white rounded-lg p-6 max-w-sm mx-auto relative z-10 transform transition-all';
        
        const title = document.createElement('h3');
        title.className = 'text-lg font-medium text-gray-900 mb-4';
        title.textContent = 'Confirm Submission';
        
        const message = document.createElement('p');
        message.className = 'text-sm text-gray-500 mb-6';
        message.textContent = 'Are you sure you want to submit this data?';
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex justify-end gap-3';
        
        this.confirmButton = document.createElement('button');
        this.confirmButton.className = 'inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all';
        this.confirmButton.textContent = 'Confirm';
        
        this.cancelButton = document.createElement('button');
        this.cancelButton.className = 'inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all';
        this.cancelButton.textContent = 'Cancel';
        
        buttonContainer.appendChild(this.cancelButton);
        buttonContainer.appendChild(this.confirmButton);
        
        modalContent.appendChild(title);
        modalContent.appendChild(message);
        modalContent.appendChild(buttonContainer);
        
        this.modal.appendChild(this.backdrop);
        this.modal.appendChild(modalContent);
        
        document.body.appendChild(this.modal);
        
        // Add event listeners
        this.backdrop.addEventListener('click', () => this.hide());
        this.cancelButton.addEventListener('click', () => this.hide());
    }

    show() {
        this.modal.classList.remove('hidden');
        return new Promise((resolve) => {
            const confirm = () => {
                this.hide();
                resolve(true);
                cleanup();
            };
            
            const cancel = () => {
                this.hide();
                resolve(false);
                cleanup();
            };
            
            const cleanup = () => {
                this.confirmButton.removeEventListener('click', confirm);
                this.cancelButton.removeEventListener('click', cancel);
                this.backdrop.removeEventListener('click', cancel);
            };
            
            this.confirmButton.addEventListener('click', confirm);
            this.cancelButton.addEventListener('click', cancel);
            this.backdrop.addEventListener('click', cancel);
        });
    }

    hide() {
        this.modal.classList.add('hidden');
    }
}

// Initialize the confirmation dialog
const confirmationDialog = new ConfirmationDialog();

// Add form submit handler
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('dataEntryForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const confirmed = await confirmationDialog.show();
            if (confirmed) {
                const formData = new FormData(form);
                const response = await fetch(form.action, {
                    method: form.method,
                    body: formData
                });
                if (response.redirected) {
                    window.location.href = response.url;
                }
            }
        });
    }
});