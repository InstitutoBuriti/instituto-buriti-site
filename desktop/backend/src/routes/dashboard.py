"""
Rotas de Dashboard - Instituto Buriti
Endpoints específicos para dashboards de aluno, instrutor e admin
"""

from flask import Blueprint, request, jsonify
from functools import wraps
from datetime import datetime, timedelta
import sqlite3
import jwt

dashboard_bp = Blueprint('dashboard', __name__)

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

def require_role(role):
    """Decorator para verificar role específico"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(request, 'user') or request.user.get('role') != role:
                return jsonify({'error': 'Acesso negado'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

@dashboard_bp.route('/aluno', methods=['GET'])
@require_auth
@require_role('aluno')
def dashboard_aluno():
    """Dashboard específico para alunos"""
    try:
        user_id = request.user['user_id']
        
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        # Estatísticas do aluno
        cursor.execute('''
            SELECT COUNT(*) FROM enrollments 
            WHERE user_id = ? AND status = 'active'
        ''', (user_id,))
        cursos_matriculados = cursor.fetchone()[0]
        
        cursor.execute('''
            SELECT COUNT(*) FROM enrollments 
            WHERE user_id = ? AND completion_date IS NOT NULL
        ''', (user_id,))
        cursos_concluidos = cursor.fetchone()[0]
        
        cursor.execute('''
            SELECT COUNT(*) FROM certificates 
            WHERE user_id = ? AND status = 'valid'
        ''', (user_id,))
        certificados = cursor.fetchone()[0]
        
        cursor.execute('''
            SELECT AVG(s.grade) FROM submissions s
            JOIN activities a ON s.activity_id = a.id
            WHERE s.user_id = ? AND s.grade IS NOT NULL
        ''', (user_id,))
        media_result = cursor.fetchone()[0]
        media_geral = round(media_result, 1) if media_result else 0
        
        # Próximos prazos
        cursor.execute('''
            SELECT a.title, a.due_date, c.title as course_title
            FROM activities a
            JOIN courses c ON a.course_id = c.id
            JOIN enrollments e ON e.course_id = c.id
            WHERE e.user_id = ? AND a.due_date > datetime('now')
            ORDER BY a.due_date ASC
            LIMIT 5
        ''', (user_id,))
        
        proximos_prazos = []
        for row in cursor.fetchall():
            proximos_prazos.append({
                'titulo': row[0],
                'prazo': row[1],
                'curso': row[2]
            })
        
        # Aulas ao vivo (simulado)
        aulas_ao_vivo = [
            {
                'titulo': 'Redes Neurais na Prática',
                'instrutor': 'Dr. Carlos Mendes',
                'data': (datetime.now() + timedelta(days=2)).isoformat(),
                'link': 'https://meet.google.com/abc-def-ghi'
            },
            {
                'titulo': 'Workshop: Gestão Cultural',
                'instrutor': 'Maria Santos',
                'data': (datetime.now() + timedelta(days=5)).isoformat(),
                'link': 'https://meet.google.com/xyz-uvw-rst'
            }
        ]
        
        # Conquistas (simulado)
        conquistas = [
            {'nome': 'Primeiro Curso', 'descricao': 'Completou seu primeiro curso', 'obtida': True},
            {'nome': 'Nota Excelente', 'descricao': 'Obteve nota acima de 9.0', 'obtida': True},
            {'nome': 'Participativo', 'descricao': 'Participou de 5 fóruns', 'obtida': False},
            {'nome': 'Especialista', 'descricao': 'Completou 3 cursos da mesma área', 'obtida': False}
        ]
        
        # Anúncios
        cursor.execute('''
            SELECT title, content, created_at
            FROM announcements
            WHERE (target_role IS NULL OR target_role = 'aluno')
            AND active = 1
            ORDER BY created_at DESC
            LIMIT 3
        ''')
        
        anuncios = []
        for row in cursor.fetchall():
            anuncios.append({
                'titulo': row[0],
                'conteudo': row[1],
                'data': row[2]
            })
        
        # Anotações recentes
        cursor.execute('''
            SELECT title, content, updated_at, course_id
            FROM notes
            WHERE user_id = ?
            ORDER BY updated_at DESC
            LIMIT 5
        ''', (user_id,))
        
        anotacoes = []
        for row in cursor.fetchall():
            anotacoes.append({
                'titulo': row[0],
                'conteudo': row[1][:100] + '...' if len(row[1]) > 100 else row[1],
                'data': row[2],
                'curso_id': row[3]
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'dashboard': {
                'estatisticas': {
                    'cursos_matriculados': cursos_matriculados,
                    'cursos_concluidos': cursos_concluidos,
                    'certificados': certificados,
                    'media_geral': media_geral
                },
                'proximos_prazos': proximos_prazos,
                'aulas_ao_vivo': aulas_ao_vivo,
                'conquistas': conquistas,
                'anuncios': anuncios,
                'anotacoes': anotacoes
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/instrutor', methods=['GET'])
@require_auth
@require_role('instrutor')
def dashboard_instrutor():
    """Dashboard específico para instrutores"""
    try:
        user_id = request.user['user_id']
        
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        # Buscar nome do instrutor
        cursor.execute('SELECT name FROM users WHERE id = ?', (user_id,))
        instrutor_name = cursor.fetchone()[0]
        
        # Estatísticas do instrutor
        cursor.execute('''
            SELECT COUNT(*) FROM courses 
            WHERE instructor = ? AND active = 1
        ''', (instrutor_name,))
        cursos_criados = cursor.fetchone()[0]
        
        cursor.execute('''
            SELECT COUNT(DISTINCT e.user_id) FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            WHERE c.instructor = ? AND e.status = 'active'
        ''', (instrutor_name,))
        alunos_ativos = cursor.fetchone()[0]
        
        cursor.execute('''
            SELECT COUNT(*) FROM activities a
            JOIN courses c ON a.course_id = c.id
            WHERE c.instructor = ?
        ''', (instrutor_name,))
        atividades_criadas = cursor.fetchone()[0]
        
        cursor.execute('''
            SELECT COUNT(*) FROM submissions s
            JOIN activities a ON s.activity_id = a.id
            JOIN courses c ON a.course_id = c.id
            WHERE c.instructor = ? AND s.grade IS NULL
        ''', (instrutor_name,))
        avaliacoes_pendentes = cursor.fetchone()[0]
        
        # Cursos do instrutor
        cursor.execute('''
            SELECT id, title, students, rating
            FROM courses
            WHERE instructor = ? AND active = 1
        ''', (instrutor_name,))
        
        meus_cursos = []
        for row in cursor.fetchall():
            meus_cursos.append({
                'id': row[0],
                'titulo': row[1],
                'alunos': row[2],
                'avaliacao': row[3]
            })
        
        # Atividades recentes
        cursor.execute('''
            SELECT a.title, a.due_date, c.title as course_title, a.type
            FROM activities a
            JOIN courses c ON a.course_id = c.id
            WHERE c.instructor = ?
            ORDER BY a.created_at DESC
            LIMIT 5
        ''', (instrutor_name,))
        
        atividades_recentes = []
        for row in cursor.fetchall():
            atividades_recentes.append({
                'titulo': row[0],
                'prazo': row[1],
                'curso': row[2],
                'tipo': row[3]
            })
        
        # Submissões para avaliar
        cursor.execute('''
            SELECT s.id, u.name, a.title, s.submitted_at, c.title as course_title
            FROM submissions s
            JOIN users u ON s.user_id = u.id
            JOIN activities a ON s.activity_id = a.id
            JOIN courses c ON a.course_id = c.id
            WHERE c.instructor = ? AND s.grade IS NULL
            ORDER BY s.submitted_at ASC
            LIMIT 10
        ''', (instrutor_name,))
        
        submissoes_pendentes = []
        for row in cursor.fetchall():
            submissoes_pendentes.append({
                'id': row[0],
                'aluno': row[1],
                'atividade': row[2],
                'data_submissao': row[3],
                'curso': row[4]
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'dashboard': {
                'estatisticas': {
                    'cursos_criados': cursos_criados,
                    'alunos_ativos': alunos_ativos,
                    'atividades_criadas': atividades_criadas,
                    'avaliacoes_pendentes': avaliacoes_pendentes
                },
                'meus_cursos': meus_cursos,
                'atividades_recentes': atividades_recentes,
                'submissoes_pendentes': submissoes_pendentes
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/admin', methods=['GET'])
@require_auth
@require_role('admin')
def dashboard_admin():
    """Dashboard específico para administradores"""
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        # Estatísticas gerais
        cursor.execute('SELECT COUNT(*) FROM users WHERE active = 1')
        total_usuarios = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM courses WHERE active = 1')
        total_cursos = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM enrollments WHERE status = "active"')
        total_matriculas = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM certificates WHERE status = "valid"')
        total_certificados = cursor.fetchone()[0]
        
        # Usuários por role
        cursor.execute('SELECT role, COUNT(*) FROM users WHERE active = 1 GROUP BY role')
        usuarios_por_role = dict(cursor.fetchall())
        
        # Cursos mais populares
        cursor.execute('''
            SELECT c.title, c.students, c.rating
            FROM courses c
            WHERE c.active = 1
            ORDER BY c.students DESC
            LIMIT 5
        ''')
        
        cursos_populares = []
        for row in cursor.fetchall():
            cursos_populares.append({
                'titulo': row[0],
                'alunos': row[1],
                'avaliacao': row[2]
            })
        
        # Atividade recente
        cursor.execute('''
            SELECT u.name, 'Novo usuário cadastrado' as acao, u.created_at as data
            FROM users u
            WHERE u.created_at > datetime('now', '-7 days')
            UNION ALL
            SELECT c.instructor, 'Curso criado: ' || c.title, c.created_at
            FROM courses c
            WHERE c.created_at > datetime('now', '-7 days')
            ORDER BY data DESC
            LIMIT 10
        ''')
        
        atividade_recente = []
        for row in cursor.fetchall():
            atividade_recente.append({
                'usuario': row[0],
                'acao': row[1],
                'data': row[2]
            })
        
        # Relatórios de uso
        cursor.execute('''
            SELECT DATE(e.enrollment_date) as data, COUNT(*) as matriculas
            FROM enrollments e
            WHERE e.enrollment_date > datetime('now', '-30 days')
            GROUP BY DATE(e.enrollment_date)
            ORDER BY data DESC
            LIMIT 7
        ''')
        
        matriculas_recentes = []
        for row in cursor.fetchall():
            matriculas_recentes.append({
                'data': row[0],
                'matriculas': row[1]
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'dashboard': {
                'estatisticas': {
                    'total_usuarios': total_usuarios,
                    'total_cursos': total_cursos,
                    'total_matriculas': total_matriculas,
                    'total_certificados': total_certificados
                },
                'usuarios_por_role': usuarios_por_role,
                'cursos_populares': cursos_populares,
                'atividade_recente': atividade_recente,
                'matriculas_recentes': matriculas_recentes
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

