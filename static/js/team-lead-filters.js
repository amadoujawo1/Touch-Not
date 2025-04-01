document.addEventListener('DOMContentLoaded', function() {
    const filterSupervisor = document.getElementById('filterSupervisor');
    const filterFlight = document.getElementById('filterFlight');
    const filterButton = document.getElementById('filterReports');
    const reportTable = document.querySelector('table tbody');

    function filterReports() {
        const rows = reportTable.getElementsByTagName('tr');
        
        for (let row of rows) {
            let show = true;
            const cells = row.getElementsByTagName('td');
            
            // Filter by supervisor
            if (filterSupervisor.value && cells[2].textContent !== filterSupervisor.value) {
                show = false;
            }
            
            // Filter by flight
            if (filterFlight.value && cells[3].textContent !== filterFlight.value) {
                show = false;
            }
            
            row.style.display = show ? '' : 'none';
        }
    }

    // Add event listeners
    filterButton.addEventListener('click', filterReports);
});