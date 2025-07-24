from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import secrets

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='aluno')  # aluno, instrutor, admin
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Campos específicos para instrutor
    bio = db.Column(db.Text)
    expertise = db.Column(db.String(200))
    is_approved = db.Column(db.Boolean, default=False)  # Para instrutores
    
    # Campos específicos para aluno
    enrollment_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Campos adicionais para perfil
    phone = db.Column(db.String(20))
    avatar_url = db.Column(db.String(500))
    birth_date = db.Column(db.Date)
    city = db.Column(db.String(100))
    state = db.Column(db.String(50))
    
    # Configurações de notificação
    email_notifications = db.Column(db.Boolean, default=True)
    sms_notifications = db.Column(db.Boolean, default=False)
    
    def __repr__(self):
        return f'<User {self.email}>'
    
    def set_password(self, password):
        """Define a senha do usuário com hash"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verifica se a senha está correta"""
        return check_password_hash(self.password_hash, password)
    
    def get_dashboard_data(self):
        """Retorna dados específicos para o dashboard do usuário"""
        if self.role == 'aluno':
            return self._get_student_dashboard_data()
        elif self.role == 'instrutor':
            return self._get_instructor_dashboard_data()
        elif self.role == 'admin':
            return self._get_admin_dashboard_data()
        return {}
    
    def _get_student_dashboard_data(self):
        """Dados específicos para dashboard do aluno"""
        # Import aqui para evitar circular import
        from .course import Enrollment, ActivitySubmission
        
        enrollments = Enrollment.query.filter_by(student_id=self.id, is_active=True).all()
        submissions = ActivitySubmission.query.filter_by(student_id=self.id).all()
        
        # Calcular estatísticas
        total_courses = len(enrollments)
        avg_progress = sum([e.progress_percentage for e in enrollments]) / total_courses if total_courses > 0 else 0
        completed_courses = len([e for e in enrollments if e.progress_percentage == 100])
        avg_grade = sum([s.score for s in submissions if s.score]) / len([s for s in submissions if s.score]) if submissions else 0
        
        return {
            'total_courses': total_courses,
            'completed_courses': completed_courses,
            'avg_progress': round(avg_progress, 1),
            'avg_grade': round(avg_grade, 1),
            'total_submissions': len(submissions),
            'pending_activities': len([s for s in submissions if not s.score]),
            'enrollments': [e.to_dict() for e in enrollments[:5]],  # Últimos 5 cursos
            'recent_submissions': [s.to_dict() for s in submissions[-5:]]  # Últimas 5 submissões
        }
    
    def _get_instructor_dashboard_data(self):
        """Dados específicos para dashboard do instrutor"""
        # Import aqui para evitar circular import
        from .course import Course, Enrollment, ActivitySubmission
        
        courses = Course.query.filter_by(instructor_id=self.id).all()
        all_enrollments = []
        all_submissions = []
        
        for course in courses:
            all_enrollments.extend(course.enrollments)
            for activity in course.activities:
                all_submissions.extend(activity.submissions)
        
        # Calcular estatísticas
        total_courses = len(courses)
        total_students = len(set([e.student_id for e in all_enrollments if e.is_active]))
        pending_grading = len([s for s in all_submissions if not s.score])
        avg_rating = 4.8  # Placeholder - implementar sistema de avaliação
        
        return {
            'total_courses': total_courses,
            'total_students': total_students,
            'pending_grading': pending_grading,
            'avg_rating': avg_rating,
            'published_courses': len([c for c in courses if c.is_published]),
            'courses': [c.to_dict() for c in courses[:5]],  # Últimos 5 cursos
            'recent_enrollments': [e.to_dict() for e in all_enrollments[-5:]]  # Últimas 5 matrículas
        }
    
    def _get_admin_dashboard_data(self):
        """Dados específicos para dashboard do admin"""
        # Import aqui para evitar circular import
        from .course import Course, Enrollment, Announcement
        
        total_users = User.query.count()
        total_courses = Course.query.count()
        total_enrollments = Enrollment.query.filter_by(is_active=True).count()
        pending_approvals = User.query.filter_by(role='instrutor', is_approved=False).count()
        
        # Estatísticas de receita (placeholder)
        monthly_revenue = 47200.00
        
        return {
            'total_users': total_users,
            'total_courses': total_courses,
            'total_enrollments': total_enrollments,
            'pending_approvals': pending_approvals,
            'monthly_revenue': monthly_revenue,
            'system_uptime': 94.2,
            'recent_users': [u.to_dict() for u in User.query.order_by(User.created_at.desc()).limit(5)],
            'recent_courses': [c.to_dict() for c in Course.query.order_by(Course.created_at.desc()).limit(5)]
        }
    
    def to_dict(self):
        """Converte o usuário para dicionário (sem senha)"""
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'bio': self.bio,
            'expertise': self.expertise,
            'is_approved': self.is_approved,
            'enrollment_date': self.enrollment_date.isoformat() if self.enrollment_date else None,
            'phone': self.phone,
            'avatar_url': self.avatar_url,
            'birth_date': self.birth_date.isoformat() if self.birth_date else None,
            'city': self.city,
            'state': self.state,
            'email_notifications': self.email_notifications,
            'sms_notifications': self.sms_notifications
        }

class Session(db.Model):
    """Modelo para gerenciar sessões de usuário"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    session_token = db.Column(db.String(255), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    ip_address = db.Column(db.String(45))  # Para IPv4 e IPv6
    user_agent = db.Column(db.String(500))
    
    user = db.relationship('User', backref=db.backref('sessions', lazy=True))
    
    def __repr__(self):
        return f'<Session {self.session_token[:10]}...>'
    
    @staticmethod
    def generate_token():
        """Gera um token de sessão único"""
        return secrets.token_urlsafe(32)
    
    def is_expired(self):
        """Verifica se a sessão expirou"""
        return datetime.utcnow() > self.expires_at
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'session_token': self.session_token,
            'created_at': self.created_at.isoformat(),
            'expires_at': self.expires_at.isoformat(),
            'is_active': self.is_active,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent
        }

class UserNote(db.Model):
    """Modelo para bloquinho de anotações dos usuários"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    is_private = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    user = db.relationship('User', backref=db.backref('notes', lazy=True))
    
    def __repr__(self):
        return f'<UserNote {self.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'content': self.content,
            'is_private': self.is_private,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

