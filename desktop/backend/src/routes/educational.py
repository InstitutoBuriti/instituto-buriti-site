"""
Rotas Educacionais - Instituto Buriti
Endpoints para cursos, avaliações e certificados
"""

from flask import Blueprint, request, jsonify
from functools import wraps
from datetime import datetime, timedelta
import uuid
import json

educational_bp = Blueprint('educational', __name__)

# Dados simulados para demonstração
COURSES_DATA = {
    'ia-fundamentos': {
        'id': 'ia-fundamentos',
        'title': 'Fundamentos da Inteligência Artificial',
        'description': 'Domine os conceitos fundamentais de IA e machine learning com aplicações práticas.',
        'instructor': 'Dr. Carlos Mendes',
        'category': 'Tecnologia',
        'level': 'Básico',
        'type': 'Gratuito',
        'duration': 40,
        'rating': 4.8,
        'students': 1200,
        'image': '/upload/ChatGPTImage19dejul.de2025,19_04_54.png',
        'modules': [
            {
                'id': 1,
                'title': 'Introdução à IA',
                'duration': '2h 30min',
                'lessons': [
                    {'id': 1, 'title': 'O que é Inteligência Artificial?', 'duration': '15min', 'completed': True},
                    {'id': 2, 'title': 'História e Evolução da IA', 'duration': '20min', 'completed': True},
                    {'id': 3, 'title': 'Tipos de IA: Fraca vs Forte', 'duration': '18min', 'completed': True},
                    {'id': 4, 'title': 'Aplicações Práticas da IA', 'duration': '25min', 'completed': False}
                ]
            },
            {
                'id': 2,
                'title': 'Machine Learning',
                'duration': '3h 15min',
                'lessons': [
                    {'id': 5, 'title': 'Introdução ao Machine Learning', 'duration': '30min', 'completed': False},
                    {'id': 6, 'title': 'Algoritmos Supervisionados', 'duration': '45min', 'completed': False}
                ]
            }
        ],
        'quiz': {
            'id': 'quiz-ia-modulo1',
            'title': 'Quiz: Fundamentos da IA',
            'description': 'Teste seus conhecimentos sobre os conceitos fundamentais de IA.',
            'questions': 5,
            'timeLimit': 15,
            'passingGrade': 7.0,
            'attempts': 3
        }
    },
    'gestao-cultural': {
        'id': 'gestao-cultural',
        'title': 'Gestão de Projetos Culturais',
        'description': 'Aprenda a planejar, executar e avaliar projetos culturais de forma eficiente.',
        'instructor': 'Maria Santos',
        'category': 'Artes',
        'level': 'Intermediário',
        'type': 'Pago',
        'duration': 30,
        'rating': 4.6,
        'students': 850,
        'image': '/upload/IMG_F027CED18C1C-1.jpeg',
        'modules': [
            {
                'id': 1,
                'title': 'Fundamentos da Gestão Cultural',
                'duration': '2h 00min',
                'lessons': [
                    {'id': 1, 'title': 'Introdução à Gestão Cultural', 'duration': '20min', 'completed': False}
                ]
            }
        ]
    },
    'educacao-inclusiva': {
        'id': 'educacao-inclusiva',
        'title': 'Educação Especial na Perspectiva Inclusiva',
        'description': 'Desenvolva competências para promover uma educação verdadeiramente inclusiva.',
        'instructor': 'Prof. Ana Oliveira',
        'category': 'Educação',
        'level': 'Avançado',
        'type': 'Gratuito',
        'duration': 35,
        'rating': 4.9,
        'students': 950,
        'image': '/upload/IMG_65A477CACFA8-1.jpeg',
        'modules': [
            {
                'id': 1,
                'title': 'Fundamentos da Educação Inclusiva',
                'duration': '2h 30min',
                'lessons': [
                    {'id': 1, 'title': 'Princípios da Educação Inclusiva', 'duration': '25min', 'completed': False}
                ]
            }
        ]
    }
}

QUIZ_DATA = {
    'quiz-ia-modulo1': {
        'id': 'quiz-ia-modulo1',
        'courseId': 'ia-fundamentos',
        'title': 'Quiz: Fundamentos da IA',
        'description': 'Teste seus conhecimentos sobre os conceitos fundamentais de IA.',
        'questions': [
            {
                'id': 1,
                'type': 'multiple_choice',
                'question': 'O que significa a sigla "IA" em tecnologia?',
                'options': [
                    {'id': 'a', 'text': 'Inteligência Artificial'},
                    {'id': 'b', 'text': 'Internet Avançada'},
                    {'id': 'c', 'text': 'Informática Aplicada'},
                    {'id': 'd', 'text': 'Interface Automática'}
                ],
                'correct': 'a',
                'points': 2
            },
            {
                'id': 2,
                'type': 'true_false',
                'question': 'A Inteligência Artificial foi criada apenas nos últimos 10 anos.',
                'correct': False,
                'points': 2
            },
            {
                'id': 3,
                'type': 'multiple_choice',
                'question': 'Qual das seguintes opções NÃO é uma aplicação comum de IA?',
                'options': [
                    {'id': 'a', 'text': 'Reconhecimento de voz'},
                    {'id': 'b', 'text': 'Carros autônomos'},
                    {'id': 'c', 'text': 'Calculadora básica'},
                    {'id': 'd', 'text': 'Assistentes virtuais'}
                ],
                'correct': 'c',
                'points': 2
            },
            {
                'id': 4,
                'type': 'text',
                'question': 'Cite duas diferenças principais entre IA Fraca e IA Forte:',
                'maxLength': 200,
                'points': 2
            },
            {
                'id': 5,
                'type': 'multiple_choice',
                'question': 'Qual é o principal objetivo do Machine Learning?',
                'options': [
                    {'id': 'a', 'text': 'Criar programas que aprendem automaticamente a partir de dados'},
                    {'id': 'b', 'text': 'Substituir completamente os programadores'},
                    {'id': 'c', 'text': 'Criar robôs físicos inteligentes'},
                    {'id': 'd', 'text': 'Melhorar apenas a velocidade dos computadores'}
                ],
                'correct': 'a',
                'points': 2
            }
        ],
        'timeLimit': 15,
        'passingGrade': 7.0,
        'maxAttempts': 3
    }
}

# Simulação de dados de usuário
USER_PROGRESS = {}
USER_QUIZ_ATTEMPTS = {}
USER_CERTIFICATES = {}

def require_auth(f):
    """Decorator para verificar autenticação"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token de acesso requerido'}), 401
        
        # Aqui você validaria o token JWT
        # Por simplicidade, vamos assumir que o token é válido
        return f(*args, **kwargs)
    
    return decorated_function

@educational_bp.route('/courses', methods=['GET'])
def get_courses():
    """Listar todos os cursos disponíveis"""
    try:
        # Filtros opcionais
        category = request.args.get('category')
        level = request.args.get('level')
        type_filter = request.args.get('type')
        search = request.args.get('search', '').lower()
        
        courses = list(COURSES_DATA.values())
        
        # Aplicar filtros
        if category:
            courses = [c for c in courses if c['category'].lower() == category.lower()]
        
        if level:
            courses = [c for c in courses if c['level'].lower() == level.lower()]
        
        if type_filter:
            courses = [c for c in courses if c['type'].lower() == type_filter.lower()]
        
        if search:
            courses = [c for c in courses if search in c['title'].lower() or search in c['description'].lower()]
        
        return jsonify({
            'success': True,
            'courses': courses,
            'total': len(courses)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@educational_bp.route('/courses/<course_id>', methods=['GET'])
def get_course_details(course_id):
    """Obter detalhes de um curso específico"""
    try:
        if course_id not in COURSES_DATA:
            return jsonify({'error': 'Curso não encontrado'}), 404
        
        course = COURSES_DATA[course_id].copy()
        
        # Adicionar progresso do usuário se autenticado
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            user_id = 'user_123'  # Extrair do token
            progress = USER_PROGRESS.get(f"{user_id}_{course_id}", {
                'completedLessons': [],
                'currentLesson': 1,
                'progressPercent': 0,
                'enrollmentDate': datetime.now().isoformat(),
                'lastAccessed': datetime.now().isoformat()
            })
            course['userProgress'] = progress
        
        return jsonify({
            'success': True,
            'course': course
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@educational_bp.route('/courses/<course_id>/enroll', methods=['POST'])
@require_auth
def enroll_course(course_id):
    """Matricular usuário em um curso"""
    try:
        if course_id not in COURSES_DATA:
            return jsonify({'error': 'Curso não encontrado'}), 404
        
        user_id = 'user_123'  # Extrair do token
        progress_key = f"{user_id}_{course_id}"
        
        if progress_key not in USER_PROGRESS:
            USER_PROGRESS[progress_key] = {
                'completedLessons': [],
                'currentLesson': 1,
                'progressPercent': 0,
                'enrollmentDate': datetime.now().isoformat(),
                'lastAccessed': datetime.now().isoformat(),
                'status': 'active'
            }
        
        return jsonify({
            'success': True,
            'message': 'Matrícula realizada com sucesso',
            'progress': USER_PROGRESS[progress_key]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@educational_bp.route('/courses/<course_id>/progress', methods=['POST'])
@require_auth
def update_progress(course_id):
    """Atualizar progresso do usuário em um curso"""
    try:
        data = request.get_json()
        lesson_id = data.get('lessonId')
        completed = data.get('completed', False)
        
        user_id = 'user_123'  # Extrair do token
        progress_key = f"{user_id}_{course_id}"
        
        if progress_key not in USER_PROGRESS:
            return jsonify({'error': 'Usuário não matriculado no curso'}), 400
        
        progress = USER_PROGRESS[progress_key]
        
        if completed and lesson_id not in progress['completedLessons']:
            progress['completedLessons'].append(lesson_id)
        elif not completed and lesson_id in progress['completedLessons']:
            progress['completedLessons'].remove(lesson_id)
        
        # Calcular progresso
        course = COURSES_DATA[course_id]
        total_lessons = sum(len(module['lessons']) for module in course['modules'])
        progress['progressPercent'] = (len(progress['completedLessons']) / total_lessons) * 100
        progress['lastAccessed'] = datetime.now().isoformat()
        
        return jsonify({
            'success': True,
            'progress': progress
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@educational_bp.route('/quizzes/<quiz_id>', methods=['GET'])
def get_quiz(quiz_id):
    """Obter dados de um quiz"""
    try:
        if quiz_id not in QUIZ_DATA:
            return jsonify({'error': 'Quiz não encontrado'}), 404
        
        quiz = QUIZ_DATA[quiz_id].copy()
        
        # Remover respostas corretas para o frontend
        for question in quiz['questions']:
            if 'correct' in question:
                del question['correct']
        
        return jsonify({
            'success': True,
            'quiz': quiz
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@educational_bp.route('/quizzes/<quiz_id>/submit', methods=['POST'])
@require_auth
def submit_quiz(quiz_id):
    """Submeter respostas de um quiz"""
    try:
        if quiz_id not in QUIZ_DATA:
            return jsonify({'error': 'Quiz não encontrado'}), 404
        
        data = request.get_json()
        answers = data.get('answers', {})
        time_taken = data.get('timeTaken', 0)
        
        user_id = 'user_123'  # Extrair do token
        quiz = QUIZ_DATA[quiz_id]
        
        # Calcular pontuação
        total_points = 0
        correct_answers = 0
        
        for question in quiz['questions']:
            question_id = f"q{question['id']}"
            user_answer = answers.get(question_id)
            
            if question['type'] in ['multiple_choice', 'true_false']:
                if user_answer == question['correct']:
                    total_points += question['points']
                    correct_answers += 1
            elif question['type'] == 'text':
                # Para questões dissertativas, dar pontuação baseada no comprimento
                if user_answer and len(user_answer.strip()) > 50:
                    total_points += question['points']
                    correct_answers += 1
        
        max_points = sum(q['points'] for q in quiz['questions'])
        score = (total_points / max_points) * 10  # Nota de 0 a 10
        passed = score >= quiz['passingGrade']
        
        # Salvar tentativa
        attempt_key = f"{user_id}_{quiz_id}"
        if attempt_key not in USER_QUIZ_ATTEMPTS:
            USER_QUIZ_ATTEMPTS[attempt_key] = []
        
        attempt = {
            'id': str(uuid.uuid4()),
            'date': datetime.now().isoformat(),
            'answers': answers,
            'score': score,
            'correctAnswers': correct_answers,
            'totalQuestions': len(quiz['questions']),
            'timeTaken': time_taken,
            'passed': passed,
            'attempt': len(USER_QUIZ_ATTEMPTS[attempt_key]) + 1
        }
        
        USER_QUIZ_ATTEMPTS[attempt_key].append(attempt)
        
        return jsonify({
            'success': True,
            'result': {
                'score': score,
                'correctAnswers': correct_answers,
                'totalQuestions': len(quiz['questions']),
                'percentage': (correct_answers / len(quiz['questions'])) * 100,
                'passed': passed,
                'timeTaken': time_taken,
                'attempt': attempt['attempt'],
                'maxAttempts': quiz['maxAttempts']
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@educational_bp.route('/certificates/generate', methods=['POST'])
@require_auth
def generate_certificate():
    """Gerar certificado de conclusão"""
    try:
        data = request.get_json()
        course_id = data.get('courseId')
        
        if course_id not in COURSES_DATA:
            return jsonify({'error': 'Curso não encontrado'}), 404
        
        user_id = 'user_123'  # Extrair do token
        course = COURSES_DATA[course_id]
        
        # Verificar se o usuário completou o curso
        progress_key = f"{user_id}_{course_id}"
        if progress_key not in USER_PROGRESS:
            return jsonify({'error': 'Usuário não matriculado no curso'}), 400
        
        progress = USER_PROGRESS[progress_key]
        if progress['progressPercent'] < 100:
            return jsonify({'error': 'Curso não foi completado'}), 400
        
        # Gerar certificado
        certificate_id = f"IB-{datetime.now().year}-{course_id.upper()[:2]}-{str(uuid.uuid4())[:6].upper()}"
        
        certificate = {
            'id': certificate_id,
            'userId': user_id,
            'courseId': course_id,
            'courseName': course['title'],
            'instructor': course['instructor'],
            'duration': course['duration'],
            'completionDate': datetime.now().isoformat(),
            'issueDate': datetime.now().isoformat(),
            'verificationCode': certificate_id,
            'grade': 8.5,  # Calcular baseado nas avaliações
            'status': 'valid'
        }
        
        USER_CERTIFICATES[certificate_id] = certificate
        
        return jsonify({
            'success': True,
            'certificate': certificate
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@educational_bp.route('/certificates/<certificate_id>', methods=['GET'])
def get_certificate(certificate_id):
    """Obter dados de um certificado"""
    try:
        if certificate_id not in USER_CERTIFICATES:
            return jsonify({'error': 'Certificado não encontrado'}), 404
        
        certificate = USER_CERTIFICATES[certificate_id]
        
        return jsonify({
            'success': True,
            'certificate': certificate
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@educational_bp.route('/certificates/verify/<verification_code>', methods=['GET'])
def verify_certificate(verification_code):
    """Verificar autenticidade de um certificado"""
    try:
        certificate = None
        for cert in USER_CERTIFICATES.values():
            if cert['verificationCode'] == verification_code:
                certificate = cert
                break
        
        if not certificate:
            return jsonify({
                'success': False,
                'valid': False,
                'message': 'Certificado não encontrado'
            })
        
        return jsonify({
            'success': True,
            'valid': True,
            'certificate': {
                'id': certificate['id'],
                'courseName': certificate['courseName'],
                'instructor': certificate['instructor'],
                'completionDate': certificate['completionDate'],
                'issueDate': certificate['issueDate'],
                'status': certificate['status']
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@educational_bp.route('/user/courses', methods=['GET'])
@require_auth
def get_user_courses():
    """Obter cursos do usuário"""
    try:
        user_id = 'user_123'  # Extrair do token
        
        user_courses = []
        for progress_key, progress in USER_PROGRESS.items():
            if progress_key.startswith(user_id):
                course_id = progress_key.replace(f"{user_id}_", "")
                if course_id in COURSES_DATA:
                    course = COURSES_DATA[course_id].copy()
                    course['userProgress'] = progress
                    user_courses.append(course)
        
        return jsonify({
            'success': True,
            'courses': user_courses
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@educational_bp.route('/user/certificates', methods=['GET'])
@require_auth
def get_user_certificates():
    """Obter certificados do usuário"""
    try:
        user_id = 'user_123'  # Extrair do token
        
        user_certificates = [
            cert for cert in USER_CERTIFICATES.values()
            if cert['userId'] == user_id
        ]
        
        return jsonify({
            'success': True,
            'certificates': user_certificates
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@educational_bp.route('/stats', methods=['GET'])
def get_educational_stats():
    """Obter estatísticas educacionais"""
    try:
        total_courses = len(COURSES_DATA)
        total_students = sum(course['students'] for course in COURSES_DATA.values())
        total_certificates = len(USER_CERTIFICATES)
        avg_rating = sum(course['rating'] for course in COURSES_DATA.values()) / total_courses
        
        return jsonify({
            'success': True,
            'stats': {
                'totalCourses': total_courses,
                'totalStudents': total_students,
                'totalCertificates': total_certificates,
                'averageRating': round(avg_rating, 1),
                'categories': list(set(course['category'] for course in COURSES_DATA.values())),
                'popularCourse': max(COURSES_DATA.values(), key=lambda x: x['students'])['title']
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

