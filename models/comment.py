from datetime import datetime
from extensions import db

class Comment(db.Model):
    __tablename__ = 'comments'
    
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign Keys
    report_id = db.Column(db.Integer, db.ForeignKey('reports.id'), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    report = db.relationship('Report', backref=db.backref('comments', lazy='dynamic'))
    author = db.relationship('User', backref=db.backref('comments', lazy='dynamic'))
    
    def __repr__(self):
        return f'<Comment {self.id} by {self.author.username} on Report {self.report_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'created_at': self.created_at.isoformat(),
            'report_id': self.report_id,
            'author': self.author.username
        }