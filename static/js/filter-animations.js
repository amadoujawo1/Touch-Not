document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggleFilters');
    const filterContent = document.getElementById('filterContent');
    let isExpanded = true;

    // Initialize height for smooth animation
    filterContent.style.maxHeight = filterContent.scrollHeight + 'px';
    filterContent.style.overflow = 'hidden';
    filterContent.style.transition = 'max-height 0.3s ease-in-out';

    toggleButton.addEventListener('click', function() {
        isExpanded = !isExpanded;
        
        // Rotate arrow icon
        const arrow = this.querySelector('svg');
        arrow.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
        arrow.style.transition = 'transform 0.3s ease';

        // Toggle content visibility
        filterContent.style.maxHeight = isExpanded ? filterContent.scrollHeight + 'px' : '0';
    });

    // Add visual feedback for active filters
    const filterInputs = document.querySelectorAll('#filterContent input');
    filterInputs.forEach(input => {
        input.addEventListener('input', function() {
            const hasValue = this.value.trim().length > 0;
            this.parentElement.classList.toggle('active-filter', hasValue);
            if (hasValue) {
                this.style.borderColor = '#3B82F6';
                this.style.backgroundColor = '#EFF6FF';
            } else {
                this.style.borderColor = '';
                this.style.backgroundColor = '';
            }
        });
    });
});