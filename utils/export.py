from flask import make_response
import csv
from io import StringIO

def export_to_csv(reports):
    """
    Export reports to CSV file
    
    Args:
        reports: List of Report objects to export
        
    Returns:
        Flask response with CSV attachment
    """
    # Create output in memory
    output = StringIO()
    writer = csv.writer(output)
    
    # Write header row
    headers = [
        'Date', 'Ref No', 'Supervisor', 'Flight Name', 'Zone', 'Paid', 'Diplomats', 'Infants', 'Not Paid', 'Paid Card/QR',
        'Refunds', 'Deportees', 'Transit', 'Waivers', 'Prepaid Bank', 'Round Trip', 'Late Payment', 'Total Attended',
        'IICS Infant', 'IICS Adult', 'IICS Total', 'GIA Infant', 'GIA Adult', 'GIA Total', 'IICS-Total Difference', 
        'GIA-Total Difference', 'Status', 'Submitted By', 'Verified By', 'Remarks'
    ]
    writer.writerow(headers)
    
    # Write data rows
    for report in reports:
        writer.writerow([
            report.date.strftime('%Y-%m-%d'),
            report.ref_no,
            report.supervisor,
            report.flight_name,
            report.zone,
            report.paid,
            report.diplomats,
            report.infants,
            report.not_paid,
            report.paid_card_qr,
            report.refunds,
            report.deportees,
            report.transit,
            report.waivers,
            report.prepaid_bank,
            report.round_trip,
            report.late_payment,
            report.total_attended,
            report.iics_infant,
            report.iics_adult,
            report.iics_total,
            report.gia_infant,
            report.gia_adult,
            report.gia_total,
            (report.iics_total or 0) - (report.total_attended or 0),  # IICS - Total Attended
            (report.gia_total or 0) - (report.total_attended or 0),   # GIA - Total Attended
            'Verified' if report.verified else 'Pending',
            report.submitter.username if report.submitter else '',
            report.verified_by.username if report.verified_by else '',
            report.remarks or ''
        ])
    
    # Create response
    response = make_response(output.getvalue())
    response.headers['Content-Disposition'] = f'attachment; filename=cash-collection-report.csv'
    response.headers['Content-type'] = 'text/csv'
    
    return response
