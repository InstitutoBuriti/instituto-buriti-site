/**
 * Sistema de Autenticação - Instituto Buriti
 * Gerenciamento de login, logout e verificação de tokens
 * 
 * VERSÃO CORRIGIDA CONFORME ORIENTAÇÃO QWEN
 * - Credenciais corretas: ana.silva@email.com / 123456
 * - Logs de debug implementados
 */ 

// Configuração para usar validação local temporariamente
const USE_SUPABASE = false;

// CORREÇÃO QWEN: Credenciais válidas corretas para demonstração
const VALID_CREDENTIALS = {
        'ana.silva@email.com': '123456'  // ✅ CREDENCIAIS CORRETAS CONFORME QWEN
};

// Função de validação local com logs de debug
function validateLocalCredentials(email, password) {
        console.log("🔍 QWEN DEBUG: Validando credenciais locais...");
        console.log("📧 Email recebido:", email);
        console.log("🔑 Senha recebida:", password);
        console.log("📋 Credenciais válidas disponíveis:", Object.keys(VALID_CREDENTIALS));
        
        const isValid = VALID_CREDENTIALS[email] === password;
        console.log("✅ Resultado da validação:", isValid);
        
        return isValid;
}

// Sistema de autenticação simplificado
class AuthManager {
        constructor() {
                    console.log("🚀 QWEN DEBUG: Inicializando AuthManager...");
                    this.token = localStorage.getItem('auth_token');
                    this.user = JSON.parse(localStorage.getItem('user_data') || 'null');
                    console.log("💾 Token existente:", this.token);
                    console.log("👤 Usuário existente:", this.user);
                    this.init();
        }

    init() {
                console.log("🔧 QWEN DEBUG: Inicializando sistema de autenticação...");
                // Verificar token ao inicializar
            if (this.token) {
                            console.log("🔍 Token encontrado, verificando...");
                            this.verifyToken();
            } else {
                            console.log("❌ Nenhum token encontrado");
            }
    }

    async login(email, password) {
                console.log("🚀 QWEN DEBUG: authenticateUser chamada com:", { email, password });
                
                try {
                                if (USE_SUPABASE) {
                                                    console.log("🌐 Usando autenticação Supabase...");
                                                    // Código Supabase original (desabilitado)
                                    return { success: false, error: 'Supabase temporariamente desabilitado' };
                                } else {
                                                    console.log("🏠 Usando validação local...");
                                                    
                                    // Validação local para demonstração
                                    const isValid = validateLocalCredentials(email, password);
                                    
                                    if (isValid) {
                                                            console.log("🔑 QWEN DEBUG: Login válido, salvando estado...");
                                                            
                                                            this.token = 'demo_token_' + Date.now();
                                                            this.user = {
                                                                                        id: 1,
                                                                                        email: email,
                                                                                        name: 'Ana Silva',
                                                                                        role: 'aluno'
                                                            };

                                                        console.log("💾 Salvando no localStorage...");
                                                        localStorage.setItem('auth_token', this.token);
                                                            localStorage.setItem('user_data', JSON.stringify(this.user));
                                                            localStorage.setItem('userLoggedIn', 'true');
                                                            localStorage.setItem('userEmail', email);
                                                            
                                                            console.log("💾 QWEN DEBUG: Estado salvo no localStorage:");
                                                            console.log("  - auth_token:", localStorage.getItem('auth_token'));
                                                            console.log("  - user_data:", localStorage.getItem('user_data'));
                                                            console.log("  - userLoggedIn:", localStorage.getItem('userLoggedIn'));
                                                            console.log("  - userEmail:", localStorage.getItem('userEmail'));

                                                        console.log("🧭 QWEN DEBUG: Redirecionando para o dashboard...");
                                                        return { success: true, user: this.user };
                                    } else {
                                                            console.error("❌ QWEN DEBUG: Credenciais inválidas.");
                                                            return { success: false, error: 'E-mail ou senha incorretos' };
                                    }
                                }
                } catch (error) {
                                console.error('🚨 QWEN DEBUG: Erro no login:', error);
                                return { success: false, error: 'Erro de conexão' };
                }
    }

    logout() {
                console.log("🚪 QWEN DEBUG: Executando logout...");
                
                this.token = null;
                this.user = null;
                
                console.log("🗑️ Removendo dados do localStorage...");
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
                localStorage.removeItem('userLoggedIn');
                localStorage.removeItem('userEmail');
                
                console.log("✅ Dados removidos do localStorage");

            // Redirecionar para página de login
            console.log("🧭 QWEN DEBUG: Redirecionando para login...");
            window.location.href = '/pages/login-aluno.html';
    }

    isAuthenticated() {
                const authenticated = !!this.token && !!this.user;
                console.log("🔍 QWEN DEBUG: Verificando autenticação:", authenticated);
                return authenticated;
    }

    getUser() {
                console.log("👤 QWEN DEBUG: Retornando usuário:", this.user);
                return this.user;
    }

    // FASE 2 SEÇÃO 4 QWEN: Função de compatibilidade para biblioteca.js
    getCurrentUser() {
                console.log("👤 QWEN DEBUG: getCurrentUser chamada - redirecionando para getUser()");
                return this.getUser();
    }

    verifyToken() {
                console.log("🔍 QWEN DEBUG: Verificando token...");
                // Para demonstração, sempre considerar token válido se existir
            if (!this.token) {
                            console.log("❌ Token inválido, fazendo logout...");
                            this.logout();
            } else {
                            console.log("✅ Token válido");
            }
    }
}

// Instância global do AuthManager
console.log("🌟 QWEN DEBUG: Criando instância global do AuthManager...");
const authManager = new AuthManager();

// Exportar para uso global
window.authManager = authManager;
console.log("✅ QWEN DEBUG: AuthManager disponível globalmente");

// QWEN DEBUG: Timestamp da correção
console.log("🕒 QWEN CORREÇÃO IMPLEMENTADA EM:", new Date().toISOString());

