"""
Rotas de Cursos - Instituto Buriti
Endpoints para gerenciamento de cursos e matrículas
"""

from flask import Blueprint, request, jsonify
from functools import wraps
from datetime import datetime
import sqlite3
import jwt

courses_bp = Blueprint('courses', __name__)

# Configurações
SECRET_KEY = 'instituto-buriti-secret-key-2025'
DATABASE = 'instituto_buriti.db'

def verify_token(token):
    """Verificar e decodificar token JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def require_auth(f):
    """Decorator para verificar autenticação"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token de acesso requerido'}), 401
        
        token = auth_header.split(' ')[1]
        payload = verify_token(token)
        
        if not payload:
            return jsonify({'error': 'Token inválido ou expirado'}), 401
        
        request.user = payload
        return f(*args, **kwargs)
    
    return decorated_function

@courses_bp.route('/management', methods=['GET'])
@require_auth
def get_courses_management():
    """Obter cursos para gerenciamento (instrutor/admin)"""
    try:
        user_role = request.user.get('role')
        user_id = request.user.get('user_id')
        
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        if user_role == 'admin':
            # Admin vê todos os cursos
            cursor.execute('''
                SELECT c.*, COUNT(e.id) as enrollments
                FROM courses c
                LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
                WHERE c.active = 1
                GROUP BY c.id
                ORDER BY c.created_at DESC
            ''')
        elif user_role == 'instrutor':
            # Instrutor vê apenas seus cursos
            cursor.execute('SELECT name FROM users WHERE id = ?', (user_id,))
            instrutor_name = cursor.fetchone()[0]
            
            cursor.execute('''
                SELECT c.*, COUNT(e.id) as enrollments
                FROM courses c
                LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
                WHERE c.instructor = ? AND c.active = 1
                GROUP BY c.id
                ORDER BY c.created_at DESC
            ''', (instrutor_name,))
        else:
            return jsonify({'error': 'Acesso negado'}), 403
        
        courses = []
        for row in cursor.fetchall():
            courses.append({
                'id': row[0],
                'title': row[1],
                'description': row[2],
                'instructor': row[3],
                'category': row[4],
                'level': row[5],
                'type': row[6],
                'duration': row[7],
                'rating': row[8],
                'students': row[9],
                'image': row[10],
                'created_at': row[11],
                'enrollments': row[13]
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'courses': courses
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/create', methods=['POST'])
@require_auth
def create_course():
    """Criar novo curso"""
    try:
        user_role = request.user.get('role')
        user_id = request.user.get('user_id')
        
        if user_role not in ['admin', 'instrutor']:
            return jsonify({'error': 'Acesso negado'}), 403
        
        data = request.get_json()
        
        # Validar dados obrigatórios
        required_fields = ['id', 'title', 'description', 'category', 'level', 'type', 'duration']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        # Verificar se ID já existe
        cursor.execute('SELECT id FROM courses WHERE id = ?', (data['id'],))
        if cursor.fetchone():
            conn.close()
            return jsonify({'error': 'ID do curso já existe'}), 400
        
        # Obter nome do instrutor
        if user_role == 'admin' and data.get('instructor'):
            instructor = data['instructor']
        else:
            cursor.execute('SELECT name FROM users WHERE id = ?', (user_id,))
            instructor = cursor.fetchone()[0]
        
        # Criar curso
        cursor.execute('''
            INSERT INTO courses (id, title, description, instructor, category, level, type, duration, image)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['id'],
            data['title'],
            data['description'],
            instructor,
            data['category'],
            data['level'],
            data['type'],
            data['duration'],
            data.get('image', '')
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Curso criado com sucesso',
            'course_id': data['id']
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/<course_id>/activities', methods=['GET'])
@require_auth
def get_course_activities(course_id):
    """Obter atividades de um curso"""
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT a.*, COUNT(s.id) as submissions
            FROM activities a
            LEFT JOIN submissions s ON a.id = s.activity_id
            WHERE a.course_id = ?
            GROUP BY a.id
            ORDER BY a.created_at DESC
        ''', (course_id,))
        
        activities = []
        for row in cursor.fetchall():
            activities.append({
                'id': row[0],
                'course_id': row[1],
                'title': row[2],
                'description': row[3],
                'type': row[4],
                'due_date': row[5],
                'points': row[6],
                'created_at': row[7],
                'submissions': row[8]
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'activities': activities
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/<course_id>/activities', methods=['POST'])
@require_auth
def create_activity(course_id):
    """Criar nova atividade"""
    try:
        user_role = request.user.get('role')
        
        if user_role not in ['admin', 'instrutor']:
            return jsonify({'error': 'Acesso negado'}), 403
        
        data = request.get_json()
        
        # Validar dados obrigatórios
        required_fields = ['title', 'description', 'type']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        # Verificar se o curso existe
        cursor.execute('SELECT id FROM courses WHERE id = ?', (course_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Curso não encontrado'}), 404
        
        # Criar atividade
        cursor.execute('''
            INSERT INTO activities (course_id, title, description, type, due_date, points)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            course_id,
            data['title'],
            data['description'],
            data['type'],
            data.get('due_date'),
            data.get('points', 0)
        ))
        
        activity_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Atividade criada com sucesso',
            'activity_id': activity_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/<course_id>/students', methods=['GET'])
@require_auth
def get_course_students(course_id):
    """Obter alunos matriculados em um curso"""
    try:
        user_role = request.user.get('role')
        
        if user_role not in ['admin', 'instrutor']:
            return jsonify({'error': 'Acesso negado'}), 403
        
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT u.id, u.name, u.email, e.enrollment_date, e.progress, e.status
            FROM users u
            JOIN enrollments e ON u.id = e.user_id
            WHERE e.course_id = ?
            ORDER BY e.enrollment_date DESC
        ''', (course_id,))
        
        students = []
        for row in cursor.fetchall():
            students.append({
                'id': row[0],
                'name': row[1],
                'email': row[2],
                'enrollment_date': row[3],
                'progress': row[4],
                'status': row[5]
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'students': students
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/submissions/<submission_id>/grade', methods=['POST'])
@require_auth
def grade_submission(submission_id):
    """Avaliar submissão de atividade"""
    try:
        user_role = request.user.get('role')
        
        if user_role not in ['admin', 'instrutor']:
            return jsonify({'error': 'Acesso negado'}), 403
        
        data = request.get_json()
        grade = data.get('grade')
        feedback = data.get('feedback', '')
        
        if grade is None:
            return jsonify({'error': 'Nota é obrigatória'}), 400
        
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        # Atualizar submissão
        cursor.execute('''
            UPDATE submissions 
            SET grade = ?, feedback = ?
            WHERE id = ?
        ''', (grade, feedback, submission_id))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({'error': 'Submissão não encontrada'}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Avaliação salva com sucesso'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

