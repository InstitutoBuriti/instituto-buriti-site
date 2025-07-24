from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from .user import db

class Course(db.Model):
    """Modelo para cursos do Instituto Buriti"""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    short_description = db.Column(db.String(500))
    instructor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category = db.Column(db.String(100), nullable=False)  # Tecnologias, Gestão, Cultura, etc.
    level = db.Column(db.String(50), nullable=False)  # Iniciante, Intermediário, Avançado
    duration_hours = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, default=0.0)
    is_free = db.Column(db.Boolean, default=False)
    has_certificate = db.Column(db.Boolean, default=True)
    image_url = db.Column(db.String(500))
    is_published = db.Column(db.Boolean, default=False)
    is_featured = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    instructor = db.relationship('User', backref=db.backref('courses_taught', lazy=True))
    enrollments = db.relationship('Enrollment', backref='course', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Course {self.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'short_description': self.short_description,
            'instructor_id': self.instructor_id,
            'instructor_name': self.instructor.name if self.instructor else None,
            'category': self.category,
            'level': self.level,
            'duration_hours': self.duration_hours,
            'price': self.price,
            'is_free': self.is_free,
            'has_certificate': self.has_certificate,
            'image_url': self.image_url,
            'is_published': self.is_published,
            'is_featured': self.is_featured,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'total_enrollments': len(self.enrollments),
            'active_enrollments': len([e for e in self.enrollments if e.is_active])
        }

class Enrollment(db.Model):
    """Modelo para matrículas de alunos em cursos"""
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow)
    progress_percentage = db.Column(db.Float, default=0.0)
    is_active = db.Column(db.Boolean, default=True)
    completed_at = db.Column(db.DateTime)
    grade = db.Column(db.Float)  # Nota final (0-10)
    certificate_issued = db.Column(db.Boolean, default=False)
    
    # Relacionamentos
    student = db.relationship('User', backref=db.backref('enrollments', lazy=True))
    
    def __repr__(self):
        return f'<Enrollment {self.student.name} - {self.course.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else None,
            'course_id': self.course_id,
            'course_title': self.course.title if self.course else None,
            'enrolled_at': self.enrolled_at.isoformat() if self.enrolled_at else None,
            'progress_percentage': self.progress_percentage,
            'is_active': self.is_active,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'grade': self.grade,
            'certificate_issued': self.certificate_issued
        }

class Activity(db.Model):
    """Modelo para atividades dos cursos"""
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    activity_type = db.Column(db.String(50), nullable=False)  # quiz, assignment, forum, video
    due_date = db.Column(db.DateTime)
    max_score = db.Column(db.Float, default=10.0)
    is_required = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    course = db.relationship('Course', backref=db.backref('activities', lazy=True))
    submissions = db.relationship('ActivitySubmission', backref='activity', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Activity {self.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'course_id': self.course_id,
            'course_title': self.course.title if self.course else None,
            'title': self.title,
            'description': self.description,
            'activity_type': self.activity_type,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'max_score': self.max_score,
            'is_required': self.is_required,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'total_submissions': len(self.submissions)
        }

class ActivitySubmission(db.Model):
    """Modelo para submissões de atividades pelos alunos"""
    id = db.Column(db.Integer, primary_key=True)
    activity_id = db.Column(db.Integer, db.ForeignKey('activity.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text)
    file_url = db.Column(db.String(500))
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    score = db.Column(db.Float)
    feedback = db.Column(db.Text)
    graded_at = db.Column(db.DateTime)
    graded_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    
    # Relacionamentos
    student = db.relationship('User', foreign_keys=[student_id], backref=db.backref('submissions', lazy=True))
    grader = db.relationship('User', foreign_keys=[graded_by])
    
    def __repr__(self):
        return f'<ActivitySubmission {self.student.name} - {self.activity.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'activity_id': self.activity_id,
            'activity_title': self.activity.title if self.activity else None,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else None,
            'content': self.content,
            'file_url': self.file_url,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'score': self.score,
            'feedback': self.feedback,
            'graded_at': self.graded_at.isoformat() if self.graded_at else None,
            'grader_name': self.grader.name if self.grader else None
        }

class Announcement(db.Model):
    """Modelo para anúncios e comunicações"""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    target_audience = db.Column(db.String(50), nullable=False)  # all, students, instructors, course_specific
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'))  # Para anúncios específicos de curso
    is_urgent = db.Column(db.Boolean, default=False)
    is_published = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime)
    
    # Relacionamentos
    author = db.relationship('User', backref=db.backref('announcements', lazy=True))
    course = db.relationship('Course', backref=db.backref('announcements', lazy=True))
    
    def __repr__(self):
        return f'<Announcement {self.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'author_id': self.author_id,
            'author_name': self.author.name if self.author else None,
            'target_audience': self.target_audience,
            'course_id': self.course_id,
            'course_title': self.course.title if self.course else None,
            'is_urgent': self.is_urgent,
            'is_published': self.is_published,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None
        }

