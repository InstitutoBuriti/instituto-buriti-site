/**
 * Sistema de Autenticação - Instituto Buriti
 * Gerenciamento de login, logout e verificação de tokens
 * 
 * TEMPORARIAMENTE DESABILITADO PARA EVITAR CONFLITOS COM SISTEMA LOCAL
 */

// COMENTADO TEMPORARIAMENTE PARA RESOLVER CONFLITOS
/*
class AuthManager {
    constructor() {
        this.apiUrl = 'https://5002-idb5bmuu5i8izu2rz3i4k-6db1e2e4.manusvm.computer/api';
        this.token = localStorage.getItem('auth_token');
        this.user = JSON.parse(localStorage.getItem('user_data') || 'null');
        
        this.init();
    }

    init() {
        // Verificar token ao inicializar
        if (this.token) {
            this.verifyToken();
        }
        
        // Configurar interceptador para requisições
        this.setupRequestInterceptor();
    }

    async login(email, password) {
        try {
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                this.user = data.user;
                
                localStorage.setItem('auth_token', this.token);
                localStorage.setItem('user_data', JSON.stringify(this.user));
                
                return { success: true, user: this.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Erro no login:', error);
            return { success: false, error: 'Erro de conexão' };
        }
    }

    async register(name, email, password, role = 'aluno') {
        try {
            const response = await fetch(`${this.apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, role })
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                this.user = data.user;
                
                localStorage.setItem('auth_token', this.token);
                localStorage.setItem('user_data', JSON.stringify(this.user));
                
                return { success: true, user: this.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Erro no registro:', error);
            return { success: false, error: 'Erro de conexão' };
        }
    }

    async verifyToken() {
        if (!this.token) return false;

        try {
            const response = await fetch(`${this.apiUrl}/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                this.user = data.user;
                localStorage.setItem('user_data', JSON.stringify(this.user));
                return true;
            } else {
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('Erro na verificação do token:', error);
            this.logout();
            return false;
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        
        // Redirecionar para página inicial se não estiver nela
        if (!window.location.pathname.includes('index.html') && 
            !window.location.pathname.endsWith('/')) {
            window.location.href = '../index.html';
        }
    }

    isAuthenticated() {
        return this.token !== null && this.user !== null;
    }

    getUser() {
        return this.user;
    }

    getToken() {
        return this.token;
    }

    hasRole(role) {
        return this.user && this.user.role === role;
    }

    setupRequestInterceptor() {
        // Interceptar todas as requisições fetch para adicionar token automaticamente
        const originalFetch = window.fetch;
        
        window.fetch = async (url, options = {}) => {
            // Adicionar token se for uma requisição para nossa API
            if (url.includes(this.apiUrl) && this.token) {
                options.headers = {
                    ...options.headers,
                    'Authorization': `Bearer ${this.token}`
                };
            }
            
            const response = await originalFetch(url, options);
            
            // Se receber 401, fazer logout automático
            if (response.status === 401 && url.includes(this.apiUrl)) {
                this.logout();
            }
            
            return response;
        };
    }

    // Métodos para requisições autenticadas
    async authenticatedRequest(endpoint, options = {}) {
        if (!this.token) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${this.apiUrl}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`,
                ...options.headers
            }
        });

        if (response.status === 401) {
            this.logout();
            throw new Error('Sessão expirada');
        }

        return response.json();
    }

    // Métodos específicos para dashboards
    async getDashboardData() {
        if (!this.user) return null;
        
        const endpoint = `/dashboard/${this.user.role}`;
        return this.authenticatedRequest(endpoint);
    }

    // Métodos para cursos
    async getCourses(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.authenticatedRequest(`/educational/courses?${params}`);
    }

    async getCourseDetails(courseId) {
        return this.authenticatedRequest(`/educational/courses/${courseId}`);
    }

    async enrollCourse(courseId) {
        return this.authenticatedRequest(`/educational/courses/${courseId}/enroll`, {
            method: 'POST'
        });
    }

    // Métodos para quizzes
    async getQuiz(quizId) {
        return this.authenticatedRequest(`/educational/quizzes/${quizId}`);
    }

    async submitQuiz(quizId, answers, timeTaken) {
        return this.authenticatedRequest(`/educational/quizzes/${quizId}/submit`, {
            method: 'POST',
            body: JSON.stringify({ answers, timeTaken })
        });
    }

    // Métodos para certificados
    async generateCertificate(courseId) {
        return this.authenticatedRequest('/educational/certificates/generate', {
            method: 'POST',
            body: JSON.stringify({ courseId })
        });
    }

    async getCertificate(certificateId) {
        return this.authenticatedRequest(`/educational/certificates/${certificateId}`);
    }

    // Método para atualizar progresso
    async updateProgress(courseId, lessonId, completed) {
        return this.authenticatedRequest(`/educational/courses/${courseId}/progress`, {
            method: 'POST',
            body: JSON.stringify({ lessonId, completed })
        });
    }

    // Método para obter estatísticas
    async getStats() {
        const response = await fetch(`${this.apiUrl}/stats`);
        return response.json();
    }
}

// COMENTADO TEMPORARIAMENTE PARA EVITAR CONFLITOS
// Inicializar gerenciador de autenticação globalmente
// window.authManager = new AuthManager();

// Funções auxiliares para uso em páginas
window.requireAuth = function(requiredRole = null) {
    if (!window.authManager || !window.authManager.isAuthenticated()) {
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = 'login-aluno.html';
        return false;
    }
    
    if (requiredRole && !window.authManager.hasRole(requiredRole)) {
        alert('Você não tem permissão para acessar esta página.');
        window.location.href = '../index.html';
        return false;
    }
    
    return true;
};

window.updateUserInterface = function() {
    if (!window.authManager) return;
    
    const user = window.authManager.getUser();
    
    if (user) {
        // Atualizar botão de login para mostrar usuário
        const loginButton = document.querySelector('.login-button');
        if (loginButton) {
            loginButton.innerHTML = `
                <i class="fas fa-user"></i>
                ${user.name}
                <i class="fas fa-chevron-down"></i>
            `;
        }

        // Atualizar dropdown
        const dropdownContent = document.querySelector('.dropdown-content');
        if (dropdownContent) {
            const dashboardPage = getDashboardPage(user.role);
            dropdownContent.innerHTML = `
                <a href="${dashboardPage}" class="dropdown-item">
                    <i class="fas fa-tachometer-alt"></i> Dashboard
                </a>
                <a href="#" class="dropdown-item" onclick="window.authManager.logout()">
                    <i class="fas fa-sign-out-alt"></i> Sair
                </a>
            `;
        }
    }
};

function getDashboardPage(role) {
    const pages = {
        'aluno': 'pages/dashboard-aluno.html',
        'instrutor': 'pages/dashboard-instrutor.html',
        'admin': 'pages/dashboard-admin.html'
    };
    return pages[role] || 'pages/dashboard-aluno.html';
}

// Atualizar interface quando DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    if (window.updateUserInterface) {
        window.updateUserInterface();
    }
});

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
*/

// SISTEMA SIMPLIFICADO TEMPORÁRIO PARA TESTES
console.log('AuthManager temporariamente desabilitado para resolver conflitos de autenticação');

// Funções básicas para compatibilidade
window.requireAuth = function(requiredRole = null) {
    // Sempre permitir acesso durante os testes
    return true;
};

window.updateUserInterface = function() {
    // Função vazia para compatibilidade
    console.log('Interface de usuário não atualizada - AuthManager desabilitado');
};

