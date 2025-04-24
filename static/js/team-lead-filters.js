document.addEventListener('DOMContentLoaded', function() {
    // Get filter elements
    const supervisorFilter = document.getElementById('supervisorFilter');
    const flightFilter = document.getElementById('flightFilter');
    const startDateFilter = document.getElementById('startDateFilter');
    const endDateFilter = document.getElementById('endDateFilter');
    const reportTableBody = document.getElementById('reportTableBody');
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    const toggleButton = document.getElementById('toggleFilters');
    const filterContent = document.getElementById('filterContent');
    let isExpanded = true;

    // Initialize height for smooth animation
    if (filterContent) {
        filterContent.style.maxHeight = filterContent.scrollHeight + 'px';
        filterContent.style.overflow = 'hidden';
        filterContent.style.transition = 'max-height 0.3s ease-in-out';
    }

    // Toggle filters visibility
    if (toggleButton) {
        toggleButton.addEventListener('click', function() {
            isExpanded = !isExpanded;
            
            // Rotate arrow icon
            const arrow = this.querySelector('svg');
            if (arrow) {
                arrow.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
                arrow.style.transition = 'transform 0.3s ease';
            }

            // Toggle content visibility
            filterContent.style.maxHeight = isExpanded ? filterContent.scrollHeight + 'px' : '0';
        });
    }

    // Configure date inputs for MM/DD/YYYY format
    startDateFilter.setAttribute('pattern', '\d{2}/\d{2}/\d{4}');
    endDateFilter.setAttribute('pattern', '\d{2}/\d{2}/\d{4}');
    startDateFilter.setAttribute('placeholder', 'MM/DD/YYYY');
    endDateFilter.setAttribute('placeholder', 'MM/DD/YYYY');
    startDateFilter.value = '';
    endDateFilter.value = '';

    // Store original table data
    const originalRows = Array.from(reportTableBody.getElementsByTagName('tr'));
    
    // Initialize statistics with all data
    updateFilteredStats();

    // Helper function to format date for comparison
    function formatDate(dateStr) {
        if (!dateStr) return null;
        
        // First try to parse as YYYY-MM-DD (HTML date input format)
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return date.getTime();
        }
        
        // Fallback for other formats (MM/DD/YYYY)
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            return new Date(parts[2], parts[0] - 1, parts[1]).getTime();
        }
        
        return null;
    }

    // Function to check if a value matches the filter (case-insensitive partial match)
    function matchesFilter(value, filterText) {
        if (!filterText) return true;
        if (!value) return false;
        return value.toString().toLowerCase().replace(/\s+/g, ' ').trim()
            .includes(filterText.toLowerCase().replace(/\s+/g, ' ').trim());
    }

    // Function to clear all filters
    function clearFilters() {
        supervisorFilter.value = '';
        flightFilter.value = '';
        startDateFilter.value = '';
        endDateFilter.value = '';
        applyFilters();
    }

    // Function to apply all filters
    function applyFilters() {
        const supervisorValue = supervisorFilter.value.trim();
        const flightValue = flightFilter.value.trim();
        const startDate = startDateFilter.value ? formatDate(startDateFilter.value) : null;
        const endDate = endDateFilter.value ? formatDate(endDateFilter.value) : null;

        originalRows.forEach(row => {
            const supervisor = row.cells[2].textContent; // Supervisor column
            const flight = row.cells[3].textContent;    // Flight column
            const rowDate = formatDate(row.cells[0].textContent); // Date column

            const matchesSupervisor = !supervisorValue || matchesFilter(supervisor, supervisorValue);
            const matchesFlight = !flightValue || matchesFilter(flight, flightValue);
            const matchesDateRange = (!startDate || rowDate >= startDate) && (!endDate || rowDate <= endDate);

            row.style.display = (matchesSupervisor && matchesFlight && matchesDateRange) ? '' : 'none';
        });

        // Update statistics after filtering
        updateFilteredStats();
    }

    // Function to update statistics based on filtered rows
    function updateFilteredStats() {
        const visibleRows = originalRows.filter(row => row.style.display !== 'none');
        
        // Update statistics in the summary cards
        document.querySelector('[data-stat="total-reports"]').textContent = visibleRows.length;
        
        const totalPassengers = visibleRows.reduce((sum, row) => {
            return sum + parseInt(row.cells[17].textContent || 0); // Total Attended column
        }, 0);
        document.querySelector('[data-stat="total-passengers"]').textContent = totalPassengers;

        const uniqueFlights = new Set(visibleRows.map(row => row.cells[3].textContent));
        document.querySelector('[data-stat="flights-covered"]').textContent = uniqueFlights.size;
    }

    // Add event listeners to filters
    supervisorFilter.addEventListener('input', function() {
        applyFilters();
        updateFilterStyle(this);
    });
    flightFilter.addEventListener('input', function() {
        applyFilters();
        updateFilterStyle(this);
    });
    startDateFilter.addEventListener('change', function() {
        applyFilters();
        updateFilterStyle(this);
    });
    endDateFilter.addEventListener('change', function() {
        applyFilters();
        updateFilterStyle(this);
    });
    clearFilterBtn.addEventListener('click', function() {
        clearFilters();
        // Reset filter styles
        [supervisorFilter, flightFilter, startDateFilter, endDateFilter].forEach(filter => {
            filter.style.borderColor = '';
            filter.style.backgroundColor = '';
            filter.parentElement.classList.remove('active-filter');
        });
    });

    // Function to update filter input styles
    function updateFilterStyle(input) {
        const hasValue = input.value.trim().length > 0;
        input.parentElement.classList.toggle('active-filter', hasValue);
        if (hasValue) {
            input.style.borderColor = '#3B82F6';
            input.style.backgroundColor = '#EFF6FF';
        } else {
            input.style.borderColor = '';
            input.style.backgroundColor = '';
        }
    }
});