from flask import Blueprint, jsonify
from datetime import datetime, timedelta
from models import Report
from sqlalchemy import func

charts_bp = Blueprint('charts', __name__)

@charts_bp.route('/data-analyst/chart-data')
def get_chart_data():
    # Get the date range for the last 7 days
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=6)
    
    # Query data for passenger trends
    trends_data = Report.query\
        .with_entities(
            func.date(Report.date).label('date'),
            func.sum(Report.total_attended).label('total')
        )\
        .filter(Report.date >= start_date)\
        .group_by(func.date(Report.date))\
        .order_by(func.date(Report.date))\
        .all()
    
    # Query data for passenger types
    types_data = Report.query\
        .with_entities(
            func.sum(Report.iics_count).label('iics'),
            func.sum(Report.gia_count).label('gia'),
            func.sum(Report.other_count).label('others')
        )\
        .filter(Report.date >= start_date)\
        .first()
    
    # Query data for verification status
    verification_data = Report.query\
        .with_entities(
            func.count(Report.id).filter(Report.verified == True).label('verified'),
            func.count(Report.id).filter(Report.verified == False).label('pending')
        )\
        .filter(Report.date >= start_date)\
        .first()
    
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