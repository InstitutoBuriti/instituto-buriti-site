"""
Instituto Buriti - Sistema de Autenticação e Educação
Backend Flask com JWT, SQLite e funcionalidades educacionais
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime, timedelta
import jwt
import sqlite3
import hashlib
import os
import uuid

# Importar blueprints
from .routes.auth import auth_bp
from .routes.dashboard import dashboard_bp
from .routes.courses import courses_bp
from .routes.educational import educational_bp
from .routes.payments import payments_bp

app = Flask(__name__, static_folder='static')
app.config['SECRET_KEY'] = 'instituto-buriti-secret-key-2025'

# Configurar CORS para permitir requisições do frontend
CORS(app, origins=['*'], supports_credentials=True)

# Registrar blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
app.register_blueprint(courses_bp, url_prefix='/api/courses')
app.register_blueprint(educational_bp, url_prefix='/api/educational')
app.register_blueprint(payments_bp, url_prefix='/api/payments')

# Configuração do banco de dados
DATABASE = 'instituto_buriti.db'

# Servir arquivos estáticos
@app.route('/static/<path:filename>')
def serve_static(filename):
    """Servir arquivos estáticos"""
    return send_from_directory(app.static_folder, filename)

@app.route('/')
def index():
    """Página inicial - redirecionar para index.html"""
    return send_from_directory(app.static_folder, 'index.html')

def init_db():
    """Inicializar banco de dados com tabelas necessárias"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Tabela de usuários
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'aluno',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP,
            active BOOLEAN DEFAULT 1
        )
    ''')
    
    # Tabela de cursos
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS courses (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            instructor TEXT NOT NULL,
            category TEXT NOT NULL,
            level TEXT NOT NULL,
            type TEXT NOT NULL,
            duration INTEGER NOT NULL,
            rating REAL DEFAULT 0,
            students INTEGER DEFAULT 0,
            image TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            active BOOLEAN DEFAULT 1
        )
    ''')
    
    # Tabela de matrículas
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS enrollments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            course_id TEXT NOT NULL,
            enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completion_date TIMESTAMP,
            progress REAL DEFAULT 0,
            status TEXT DEFAULT 'active',
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (course_id) REFERENCES courses (id)
        )
    ''')
    
    # Tabela de atividades
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            type TEXT NOT NULL,
            due_date TIMESTAMP,
            points INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (course_id) REFERENCES courses (id)
        )
    ''')
    
    # Tabela de submissões
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            activity_id INTEGER NOT NULL,
            content TEXT,
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            grade REAL,
            feedback TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (activity_id) REFERENCES activities (id)
        )
    ''')
    
    # Tabela de anúncios
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS announcements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            author_id INTEGER NOT NULL,
            target_role TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            active BOOLEAN DEFAULT 1,
            FOREIGN KEY (author_id) REFERENCES users (id)
        )
    ''')
    
    # Tabela de anotações
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            course_id TEXT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (course_id) REFERENCES courses (id)
        )
    ''')
    
    # Tabela de certificados
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS certificates (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            course_id TEXT NOT NULL,
            verification_code TEXT UNIQUE NOT NULL,
            issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            grade REAL NOT NULL,
            status TEXT DEFAULT 'valid',
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (course_id) REFERENCES courses (id)
        )
    ''')
    
    # Tabela de progresso de aulas
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS lesson_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            course_id TEXT NOT NULL,
            lesson_id INTEGER NOT NULL,
            completed BOOLEAN DEFAULT 0,
            completed_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (course_id) REFERENCES courses (id)
        )
    ''')
    
    # Tabela de tentativas de quiz
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS quiz_attempts (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            quiz_id TEXT NOT NULL,
            course_id TEXT NOT NULL,
            answers TEXT NOT NULL,
            score REAL NOT NULL,
            passed BOOLEAN NOT NULL,
            attempt_number INTEGER NOT NULL,
            time_taken INTEGER NOT NULL,
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (course_id) REFERENCES courses (id)
        )
    ''')
    
    conn.commit()
    conn.close()

def seed_data():
    """Popular banco com dados iniciais"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Verificar se já existem usuários
    cursor.execute('SELECT COUNT(*) FROM users')
    if cursor.fetchone()[0] > 0:
        conn.close()
        return
    
    # Criar usuários de teste
    users = [
        ('Ana Silva Santos', 'ana.silva@teste.com', 'senhaAluno', 'aluno'),
        ('Prof. João Mendes', 'prof.joao@teste.com', 'senhaInstrutor', 'instrutor'),
        ('Admin Sistema', 'admin@institutoburiti.com', 'senhaAdmin', 'admin')
    ]
    
    for name, email, password, role in users:
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        cursor.execute('''
            INSERT INTO users (name, email, password, role)
            VALUES (?, ?, ?, ?)
        ''', (name, email, hashed_password, role))
    
    # Criar cursos
    courses = [
        ('ia-fundamentos', 'Fundamentos da Inteligência Artificial', 
         'Domine os conceitos fundamentais de IA e machine learning com aplicações práticas.',
         'Dr. Carlos Mendes', 'Tecnologia', 'Básico', 'Gratuito', 40, 4.8, 1200,
         '/upload/ChatGPTImage19dejul.de2025,19_04_54.png'),
        ('gestao-cultural', 'Gestão de Projetos Culturais',
         'Aprenda a planejar, executar e avaliar projetos culturais de forma eficiente.',
         'Maria Santos', 'Artes', 'Intermediário', 'Pago', 30, 4.6, 850,
         '/upload/IMG_F027CED18C1C-1.jpeg'),
        ('educacao-inclusiva', 'Educação Especial na Perspectiva Inclusiva',
         'Desenvolva competências para promover uma educação verdadeiramente inclusiva.',
         'Prof. Ana Oliveira', 'Educação', 'Avançado', 'Gratuito', 35, 4.9, 950,
         '/upload/IMG_65A477CACFA8-1.jpeg')
    ]
    
    for course_data in courses:
        cursor.execute('''
            INSERT INTO courses (id, title, description, instructor, category, level, type, duration, rating, students, image)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', course_data)
    
    # Matricular Ana Silva nos cursos
    cursor.execute('SELECT id FROM users WHERE email = ?', ('ana.silva@teste.com',))
    ana_id = cursor.fetchone()[0]
    
    enrollments = [
        (ana_id, 'ia-fundamentos', 65.0),
        (ana_id, 'gestao-cultural', 40.0)
    ]
    
    for user_id, course_id, progress in enrollments:
        cursor.execute('''
            INSERT INTO enrollments (user_id, course_id, progress)
            VALUES (?, ?, ?)
        ''', (user_id, course_id, progress))
    
    # Criar atividades
    activities = [
        ('ia-fundamentos', 'Quiz: Introdução à IA', 'Teste seus conhecimentos básicos sobre IA', 'quiz', 
         datetime.now() + timedelta(days=7), 10),
        ('ia-fundamentos', 'Projeto: Aplicação de IA', 'Desenvolva uma aplicação simples usando IA', 'projeto',
         datetime.now() + timedelta(days=14), 20),
        ('gestao-cultural', 'Ensaio: Gestão Cultural', 'Escreva sobre a importância da gestão cultural', 'ensaio',
         datetime.now() + timedelta(days=10), 15)
    ]
    
    for course_id, title, description, activity_type, due_date, points in activities:
        cursor.execute('''
            INSERT INTO activities (course_id, title, description, type, due_date, points)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (course_id, title, description, activity_type, due_date, points))
    
    # Criar submissões para Ana
    cursor.execute('SELECT id FROM activities WHERE course_id = ?', ('ia-fundamentos',))
    activity_ids = cursor.fetchall()
    
    for activity_id in activity_ids[:2]:  # Submeter 2 atividades
        cursor.execute('''
            INSERT INTO submissions (user_id, activity_id, content, grade)
            VALUES (?, ?, ?, ?)
        ''', (ana_id, activity_id[0], 'Conteúdo da submissão...', 8.5))
    
    # Criar anúncios
    cursor.execute('SELECT id FROM users WHERE role = ?', ('admin',))
    admin_id = cursor.fetchone()[0]
    
    announcements = [
        ('Bem-vindos ao Instituto Buriti!', 
         'Estamos felizes em tê-los conosco. Aproveitem ao máximo nossos cursos!', admin_id, None),
        ('Nova funcionalidade: Certificados digitais',
         'Agora vocês podem baixar seus certificados em PDF diretamente da plataforma!', admin_id, 'aluno'),
        ('Reunião pedagógica - Instrutores',
         'Reunião marcada para sexta-feira às 14h para discutir melhorias nos cursos.', admin_id, 'instrutor')
    ]
    
    for title, content, author_id, target_role in announcements:
        cursor.execute('''
            INSERT INTO announcements (title, content, author_id, target_role)
            VALUES (?, ?, ?, ?)
        ''', (title, content, author_id, target_role))
    
    # Criar anotações para Ana
    notes = [
        ('Conceitos importantes de IA', 'Machine Learning é um subcampo da IA...', 'ia-fundamentos'),
        ('Ideias para projeto final', 'Pensar em uma aplicação de reconhecimento de imagens...', 'ia-fundamentos'),
        ('Lembrete pessoal', 'Revisar material antes da próxima aula', None)
    ]
    
    for title, content, course_id in notes:
        cursor.execute('''
            INSERT INTO notes (user_id, course_id, title, content)
            VALUES (?, ?, ?, ?)
        ''', (ana_id, course_id, title, content))
    
    conn.commit()
    conn.close()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint de verificação de saúde"""
    return jsonify({
        'status': 'healthy',
        'message': 'Instituto Buriti API está funcionando',
        'timestamp': datetime.now().isoformat(),
        'version': '2.0.0'
    })

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Endpoint para estatísticas gerais"""
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        # Contar usuários por role
        cursor.execute('SELECT role, COUNT(*) FROM users GROUP BY role')
        users_by_role = dict(cursor.fetchall())
        
        # Contar cursos
        cursor.execute('SELECT COUNT(*) FROM courses WHERE active = 1')
        total_courses = cursor.fetchone()[0]
        
        # Contar matrículas
        cursor.execute('SELECT COUNT(*) FROM enrollments WHERE status = "active"')
        total_enrollments = cursor.fetchone()[0]
        
        # Contar certificados
        cursor.execute('SELECT COUNT(*) FROM certificates WHERE status = "valid"')
        total_certificates = cursor.fetchone()[0]
        
        # Contar atividades
        cursor.execute('SELECT COUNT(*) FROM activities')
        total_activities = cursor.fetchone()[0]
        
        # Contar submissões
        cursor.execute('SELECT COUNT(*) FROM submissions')
        total_submissions = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'success': True,
            'stats': {
                'users': {
                    'total': sum(users_by_role.values()),
                    'by_role': users_by_role
                },
                'courses': total_courses,
                'enrollments': total_enrollments,
                'certificates': total_certificates,
                'activities': total_activities,
                'submissions': total_submissions,
                'last_updated': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint não encontrado'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Erro interno do servidor'}), 500

if __name__ == '__main__':
    # Inicializar banco de dados
    init_db()
    seed_data()
    
    print("🎓 Instituto Buriti - Sistema Educacional")
    print("📚 Backend iniciado com sucesso!")
    print("🔗 API disponível em: http://localhost:5002")
    print("📊 Health check: http://localhost:5002/api/health")
    print("📈 Estatísticas: http://localhost:5002/api/stats")
    print("🔐 Autenticação: http://localhost:5002/api/auth/")
    print("📖 Educacional: http://localhost:5002/api/educational/")
    print("🌐 Frontend: http://localhost:5002/static/")
    
    # Executar aplicação
    app.run(host='0.0.0.0', port=5003, debug=True)

