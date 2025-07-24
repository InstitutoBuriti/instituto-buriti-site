"""
Rotas de Autenticação - Instituto Buriti
Endpoints para login, logout, registro e verificação de token
"""

from flask import Blueprint, request, jsonify
import sqlite3
import hashlib
import jwt
from datetime import datetime, timedelta
import uuid

auth_bp = Blueprint('auth', __name__)

# Configurações
SECRET_KEY = 'instituto-buriti-secret-key-2025'
DATABASE = 'instituto_buriti.db'

def generate_token(user_data):
    """Gerar token JWT para o usuário"""
    payload = {
        'user_id': user_data['id'],
        'email': user_data['email'],
        'role': user_data['role'],
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def verify_token(token):
    """Verificar e decodificar token JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

@auth_bp.route('/login', methods=['POST'])
def login():
    """Endpoint de login"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email e senha são obrigatórios'}), 400
        
        # Buscar usuário no banco
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        cursor.execute('''
            SELECT id, name, email, role, active 
            FROM users 
            WHERE email = ? AND password = ?
        ''', (email, hashed_password))
        
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return jsonify({'error': 'Credenciais inválidas'}), 401
        
        if not user[4]:  # active
            return jsonify({'error': 'Conta desativada'}), 401
        
        user_data = {
            'id': user[0],
            'name': user[1],
            'email': user[2],
            'role': user[3]
        }
        
        # Gerar token
        token = generate_token(user_data)
        
        # Atualizar último login
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?
        ''', (user[0],))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Login realizado com sucesso',
            'token': token,
            'user': user_data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    """Endpoint de registro"""
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'aluno')
        
        if not all([name, email, password]):
            return jsonify({'error': 'Nome, email e senha são obrigatórios'}), 400
        
        # Verificar se email já existe
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Email já cadastrado'}), 400
        
        # Criar usuário
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        cursor.execute('''
            INSERT INTO users (name, email, password, role)
            VALUES (?, ?, ?, ?)
        ''', (name, email, hashed_password, role))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        user_data = {
            'id': user_id,
            'name': name,
            'email': email,
            'role': role
        }
        
        # Gerar token
        token = generate_token(user_data)
        
        return jsonify({
            'success': True,
            'message': 'Usuário criado com sucesso',
            'token': token,
            'user': user_data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/verify', methods=['GET'])
def verify():
    """Verificar token de autenticação"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token não fornecido'}), 401
        
        token = auth_header.split(' ')[1]
        payload = verify_token(token)
        
        if not payload:
            return jsonify({'error': 'Token inválido ou expirado'}), 401
        
        # Buscar dados atualizados do usuário
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, name, email, role, active 
            FROM users 
            WHERE id = ?
        ''', (payload['user_id'],))
        
        user = cursor.fetchone()
        conn.close()
        
        if not user or not user[4]:
            return jsonify({'error': 'Usuário não encontrado ou inativo'}), 401
        
        user_data = {
            'id': user[0],
            'name': user[1],
            'email': user[2],
            'role': user[3]
        }
        
        return jsonify({
            'success': True,
            'user': user_data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Endpoint de logout"""
    try:
        # Em uma implementação real, você poderia invalidar o token
        # Por simplicidade, apenas retornamos sucesso
        return jsonify({
            'success': True,
            'message': 'Logout realizado com sucesso'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/change-password', methods=['POST'])
def change_password():
    """Alterar senha do usuário"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token não fornecido'}), 401
        
        token = auth_header.split(' ')[1]
        payload = verify_token(token)
        
        if not payload:
            return jsonify({'error': 'Token inválido'}), 401
        
        data = request.get_json()
        current_password = data.get('currentPassword')
        new_password = data.get('newPassword')
        
        if not current_password or not new_password:
            return jsonify({'error': 'Senha atual e nova senha são obrigatórias'}), 400
        
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        # Verificar senha atual
        current_hashed = hashlib.sha256(current_password.encode()).hexdigest()
        cursor.execute('SELECT id FROM users WHERE id = ? AND password = ?', 
                      (payload['user_id'], current_hashed))
        
        if not cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Senha atual incorreta'}), 400
        
        # Atualizar senha
        new_hashed = hashlib.sha256(new_password.encode()).hexdigest()
        cursor.execute('UPDATE users SET password = ? WHERE id = ?',
                      (new_hashed, payload['user_id']))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Senha alterada com sucesso'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

