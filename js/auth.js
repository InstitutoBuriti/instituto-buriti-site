/**
 * Sistema de Autenticação Básico
 * Instituto Buriti
 */

/**
 * Verificar se o usuário está autenticado
 */
function isAuthenticated() {
    const userData = localStorage.getItem('userData');
    const token = localStorage.getItem('authToken');
    
    return userData && token;
}

/**
 * Obter dados do usuário atual
 */
function getCurrentUser() {
    const userData = localStorage.getItem('userData');
    if (userData) {
        try {
            return JSON.parse(userData);
        } catch (error) {
            console.error('Erro ao parsear dados do usuário:', error);
            return null;
        }
    }
    return null;
}

/**
 * Fazer login (simulado para demo)
 */
function login(email, password) {
    // Simulação de login para demo
    const demoUsers = {
        'aluno@demo.com': {
            id: 'demo_student',
            name: 'Aluno Demo',
            email: 'aluno@demo.com',
            type: 'student',
            user_type: 'student'
        },
        'instrutor@demo.com': {
            id: 'demo_instructor',
            name: 'Instrutor Demo',
            email: 'instrutor@demo.com',
            type: 'instructor',
            user_type: 'instructor'
        },
        'admin@demo.com': {
            id: 'demo_admin',
            name: 'Admin Demo',
            email: 'admin@demo.com',
            type: 'admin',
            user_type: 'admin'
        }
    };

    const user = demoUsers[email];
    if (user && password === 'senha123') {
        localStorage.setItem('userData', JSON.stringify(user));
        localStorage.setItem('authToken', 'demo_token_' + Date.now());
        return true;
    }
    
    return false;
}

/**
 * Fazer logout
 */
function logout() {
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    window.location.href = '../pages/login.html';
}

/**
 * Verificar autenticação na inicialização
 */
function checkAuth() {
    if (!isAuthenticated()) {
        // Para demo, fazer login automático como aluno
        login('aluno@demo.com', 'senha123');
    }
}

// Auto-login para demo se não estiver autenticado
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});

// Exportar funções para uso global
window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser;
window.login = login;
window.logout = logout;
window.checkAuth = checkAuth;

