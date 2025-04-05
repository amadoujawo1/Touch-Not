// Direct form submission without confirmation modal
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('dataEntryForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            // Let the form submit naturally
            return true;
        });
    }
});