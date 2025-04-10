document.addEventListener('DOMContentLoaded', function() {
    // Get the total display element from the form footer
    const totalDisplay = document.getElementById('total-display').querySelector('span');

    // Get all input fields that contribute to total attended
    const inputFields = [
        'paid',
        'diplomats',
        'infants',
        'not_paid',
        'paid_card_qr',
        'refunds',
        'deportees',
        'transit',
        'waivers',
        'prepaid_bank',
        'round_trip',
        'late_payment'
    ];

    // Function to calculate and update total
    function updateTotalAttended() {
        let total = 0;
        let refunds = 0;
        
        // Sum up all input values except refunds
        inputFields.forEach(fieldName => {
            const input = document.querySelector(`input[name="${fieldName}"]`);
            if (input && fieldName !== 'refunds') {
                const value = parseInt(input.value) || 0;
                total += value;
            } else if (input && fieldName === 'refunds') {
                refunds = parseInt(input.value) || 0;
            }
        });

        // Subtract refunds from total
        const finalTotal = total - refunds;

        // Update both the form field and display element
        const totalAttendedInput = document.getElementById('total_attended');
        if (totalAttendedInput) {
            totalAttendedInput.value = finalTotal;
        }
        
        // Update the display element with formatted total
        totalDisplay.textContent = finalTotal.toLocaleString();
        
        // Add a subtle animation
        totalDisplay.style.transform = 'scale(1.1)';
        setTimeout(() => {
            totalDisplay.style.transform = 'scale(1)';
        }, 150);
    }

    // Add event listeners to all input fields
    inputFields.forEach(fieldName => {
        const input = document.querySelector(`input[name="${fieldName}"]`);
        if (input) {
            input.addEventListener('input', updateTotalAttended);
        }
    });

    // Initial calculation
    updateTotalAttended();
});