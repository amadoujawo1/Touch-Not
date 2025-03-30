document.addEventListener('DOMContentLoaded', function() {
    // Create a display element for real-time total
    const totalDisplay = document.createElement('div');
    totalDisplay.id = 'total-display';
    totalDisplay.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 15px; background: #007bff; color: white; border-radius: 5px; font-size: 18px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 1000;';
    document.body.appendChild(totalDisplay);

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
        
        // Sum up all input values
        inputFields.forEach(fieldName => {
            const input = document.querySelector(`input[name="${fieldName}"]`);
            if (input) {
                const value = parseInt(input.value) || 0;
                total += value;
            }
        });

        // Update both the form field and display element
        const totalAttendedInput = document.getElementById('total_attended');
        if (totalAttendedInput) {
            totalAttendedInput.value = total;
        }
        
        // Update the display element with formatted total
        totalDisplay.textContent = `Total Attended: ${total.toLocaleString()}`;
        
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