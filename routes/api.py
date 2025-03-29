# routes/api.py
from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required, current_user
from models.comment import Comment
from models import Report
from datetime import datetime

api_bp = Blueprint('api', __name__)

@api_bp.route('/reports/<int:report_id>/comments')
@login_required
def get_comments(report_id):
    report = Report.query.get_or_404(report_id)
    comments = report.comments.order_by(Comment.created_at.desc()).all()
    return jsonify([comment.to_dict() for comment in comments])

@api_bp.route('/reports/<int:report_id>/comments', methods=['POST'])
@login_required
def add_comment(report_id):
    report = Report.query.get_or_404(report_id)
    data = request.get_json()
    
    comment = Comment(
        content=data['content'],
        report_id=report_id,
        author_id=current_user.id
    )
    
    current_app.db.session.add(comment)
    current_app.db.session.commit()
    
    return jsonify(comment.to_dict())

@api_bp.route('/reports/<int:report_id>/comments/<int:comment_id>', methods=['DELETE'])
@login_required
def delete_comment(report_id, comment_id):
    comment = Comment.query.get_or_404(comment_id)
    
    # Only allow comment author or admin to delete
    if comment.author_id != current_user.id and current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    current_app.db.session.delete(comment)
    current_app.db.session.commit()
    
    return jsonify({'success': True})