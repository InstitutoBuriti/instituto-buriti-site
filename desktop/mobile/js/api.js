/**
 * Instituto Buriti - API Client
 * Comunicação entre frontend mobile e backend Node.js
 */

class InstitutoBuritiAPI {
    constructor() {
        this.baseURL = 'https://3001-ifhi7f8oa3ymuvv1vqdew-68fc912d.manusvm.computer/api';
        this.token = localStorage.getItem('instituto_buriti_token');
    }

    // Headers padrão para requisições
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Método genérico para fazer requisições
    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const config = {
                headers: this.getHeaders(),
                ...options
            };

            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    }

    // ==================== AUTENTICAÇÃO ====================
    
    async login(email, password, perfil = 'aluno') {
        try {
            const response = await this.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password, perfil })
            });
            
            if (response.token) {
                this.token = response.token;
                localStorage.setItem('instituto_buriti_token', response.token);
                localStorage.setItem('instituto_buriti_user', JSON.stringify(response.user));
            }
            
            return response;
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    }

    logout() {
        // Limpar completamente o localStorage
        localStorage.clear();
        
        // Limpar também sessionStorage
        sessionStorage.clear();
        
        // Resetar token da instância
        this.token = null;
        
        // Forçar limpeza de cache do navegador
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    caches.delete(name);
                });
            });
        }
        
        // Redirecionar para login com parâmetro para forçar limpeza
        window.location.href = '/login.html?logout=true';
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('instituto_buriti_user');
        return userStr ? JSON.parse(userStr) : null;
    }

    isAuthenticated() {
        return !!this.token;
    }

    // ==================== CURSOS ====================
    
    async getCursos() {
        return await this.request('/cursos');
    }

    async getCurso(id) {
        return await this.request(`/cursos/${id}`);
    }

    async getCursosAluno(alunoId) {
        // A API atual retorna todos os cursos em /cursos
        // Vamos usar essa rota por enquanto
        return await this.request('/cursos');
    }

    // ==================== GAMIFICAÇÃO ====================
    
    async getGamificacao(userId) {
        return await this.request(`/gamificacao/${userId}`);
    }

    async getRanking() {
        return await this.request('/gamificacao/ranking');
    }

    async getBadges(userId) {
        return await this.request(`/gamificacao/badges/${userId}`);
    }

    // ==================== ADMIN ====================
    
    async getUsuarios() {
        return await this.request('/admin/usuarios');
    }

    async getEstatisticas() {
        return await this.request('/admin/estatisticas');
    }

    async getRelatorios() {
        return await this.request('/admin/relatorios');
    }

    // ==================== NOTIFICAÇÕES ====================
    
    async getNotificacoes(userId) {
        return await this.request(`/notificacoes/${userId}`);
    }

    async marcarNotificacaoLida(notificacaoId) {
        return await this.request(`/notificacoes/${notificacaoId}/lida`, {
            method: 'PUT'
        });
    }

    // ==================== FÓRUM ====================
    
    async getTopicosForun(cursoId) {
        return await this.request(`/forum/curso/${cursoId}`);
    }

    async getPostsForum(topicoId) {
        return await this.request(`/forum/topico/${topicoId}`);
    }

    // ==================== CERTIFICADOS ====================
    
    async getCertificados(alunoId) {
        return await this.request(`/certificados/aluno/${alunoId}`);
    }

    async downloadCertificado(certificadoId) {
        return await this.request(`/certificados/${certificadoId}/download`);
    }

    // ==================== HEALTH CHECK ====================
    
    async healthCheck() {
        return await this.request('/health');
    }
}

// Instância global da API
const api = new InstitutoBuritiAPI();

// Funções utilitárias
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading">Carregando...</div>';
    }
}

function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        const loading = element.querySelector('.loading');
        if (loading) {
            loading.remove();
        }
    }
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<div class="error">Erro: ${message}</div>`;
    }
}

// Verificar autenticação ao carregar páginas protegidas
function checkAuth() {
    if (!api.isAuthenticated()) {
        window.location.href = '/index.html';
        return false;
    }
    return true;
}

// Middleware para páginas que requerem autenticação
function requireAuth() {
    if (!checkAuth()) {
        return;
    }
    
    // Adicionar informações do usuário no header se existir
    const user = api.getCurrentUser();
    if (user) {
        const userInfo = document.querySelector('.user-info');
        if (userInfo) {
            userInfo.textContent = user.nome || user.email;
        }
    }
}

// Auto-executar verificação de auth em páginas de dashboard
if (window.location.pathname.includes('dashboard-')) {
    document.addEventListener('DOMContentLoaded', requireAuth);
}

console.log('🚀 Instituto Buriti API Client carregado com sucesso!');

