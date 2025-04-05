from flask import Blueprint, jsonify
from datetime import datetime, timedelta
from models import Report
from sqlalchemy import func
from routes.data_analyst import data_analyst_required

charts_bp = Blueprint('charts', __name__)

@charts_bp.route('/data-analyst/dashboard-data')
@data_analyst_required
def get_dashboard_data():
    now = datetime.now()
    today = now.date()
    yesterday = today - timedelta(days=1)
    
    # Get today's total passengers and comparison with yesterday
    today_total = Report.query.with_entities(func.sum(Report.total_attended))\
        .filter(func.date(Report.date) == today).scalar() or 0
    yesterday_total = Report.query.with_entities(func.sum(Report.total_attended))\
        .filter(func.date(Report.date) == yesterday).scalar() or 1  # Avoid division by zero
    
    # Calculate verification rate
    total_reports = Report.query.filter(func.date(Report.date) == today).count()
    verified_reports = Report.query.filter(func.date(Report.date) == today, Report.verified == True).count()
    
    # Get active team leads in last 24 hours
    active_team_leads = Report.query.with_entities(Report.supervisor)\
        .filter(Report.date >= now - timedelta(hours=24))\
        .distinct().count()
    
    # Calculate average processing time (mock data for now)
    avg_processing_time = 15  # minutes

    # No hourly or type distribution data needed

    # Prepare response data
    response_data = {
        'todayTotal': int(today_total),
        'passengerChange': (today_total - yesterday_total) / yesterday_total,
        'verificationRate': verified_reports / total_reports if total_reports > 0 else 0,
        'totalReports': total_reports,
        'activeTeamLeads': active_team_leads,
        'avgProcessingTime': avg_processing_time,
        'verificationStatus': {
            'verified': verified_reports,
            'pending': total_reports - verified_reports
        }
    }

    return jsonify(response_data)
    
    # Query data for zone distribution
    zone_data = Report.query\
        .with_entities(
            Report.zone,
            func.count(Report.id).label('count')
        )\
        .filter(Report.date >= start_date)\
        .group_by(Report.zone)\
        .all()
    
    return jsonify({
        'trends': {
            'dates': [d.date.strftime('%Y-%m-%d') for d, _ in trends_data],
            'counts': [int(t.total or 0) for _, t in trends_data]
        },
        'types': {
            'iics': int(types_data.iics or 0),
            'gia': int(types_data.gia or 0),
            'others': int(types_data.others or 0)
        },
        'verification': {
            'verified': verification_data.verified,
            'pending': verification_data.pending
        },
        'zones': {
            'labels': [z.zone for z, _ in zone_data],
            'counts': [z.count for _, z in zone_data]
        }
    })