/**
 * Sistema de Autenticação - Instituto Buriti
 * Gerenciamento de login, logout e verificação de tokens
 * 
 * VERSÃO COM VALIDAÇÃO LOCAL PARA DEMONSTRAÇÃO
 */

// Configuração para usar validação local temporariamente
const USE_SUPABASE = false;

// Credenciais válidas para demonstração
const VALID_CREDENTIALS = {
        'ana.silva@teste.com': 'senhaAluno'
};

// Função de validação local
function validateLocalCredentials(email, password) {
        return VALID_CREDENTIALS[email] === password;
}

// Sistema de autenticação simplificado
class AuthManager {
        constructor() {
                    this.token = localStorage.getItem('auth_token');
                    this.user = JSON.parse(localStorage.getItem('user_data') || 'null');
                    this.init();
        }

    init() {
                // Verificar token ao inicializar
            if (this.token) {
                            this.verifyToken();
            }
    }

    async login(email, password) {
                try {
                                if (USE_SUPABASE) {
                                                    // Código Supabase original (desabilitado)
                                    return { success: false, error: 'Supabase temporariamente desabilitado' };
                                } else {
                                                    // Validação local para demonstração
                                    if (validateLocalCredentials(email, password)) {
                                                            this.token = 'demo_token_' + Date.now();
                                                            this.user = {
                                                                                        id: 1,
                                                                                        email: email,
                                                                                        name: 'Ana Silva',
                                                                                        role: 'aluno'
                                                            };

                                                        localStorage.setItem('auth_token', this.token);
                                                            localStorage.setItem('user_data', JSON.stringify(this.user));
                                                            localStorage.setItem('userLoggedIn', 'true');
                                                            localStorage.setItem('userEmail', email);

                                                        return { success: true, user: this.user };
                                    } else {
                                                            return { success: false, error: 'E-mail ou senha incorretos' };
                                    }
                                }
                } catch (error) {
                                console.error('Erro no login:', error);
                                return { success: false, error: 'Erro de conexão' };
                }
    }

    logout() {
                this.token = null;
                this.user = null;
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
                localStorage.removeItem('userLoggedIn');
                localStorage.removeItem('userEmail');

            // Redirecionar para página de login
            window.location.href = '/pages/login-aluno.html';
    }

    isAuthenticated() {
                return !!this.token && !!this.user;
    }

    getUser() {
                return this.user;
    }

    verifyToken() {
                // Para demonstração, sempre considerar token válido se existir
            if (!this.token) {
                            this.logout();
            }
    }
}

// Instância global do AuthManager
const authManager = new AuthManager();

// Exportar para uso global
window.authManager = authManager;
