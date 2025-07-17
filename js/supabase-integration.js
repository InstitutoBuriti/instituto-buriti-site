/**
 * Integração Supabase para Instituto Buriti
 * Preparado para autenticação e dados reais
 */

class SupabaseIntegration {
    constructor() {
        this.apiBaseUrl = 'https://zmhqivcvkygp.manus.space/api';
        this.supabaseReady = false;
        this.demoMode = true;
        
        this.init();
    }
    
    async init() {
        try {
            // Verificar status da integração Supabase
            const response = await fetch(`${this.apiBaseUrl}/supabase/status`);
            const data = await response.json();
            
            if (data.supabase_integration) {
                this.supabaseReady = data.supabase_integration.status === 'ready';
                this.demoMode = data.supabase_integration.mode === 'demo';
                
                console.log('🔗 Supabase Integration Status:', {
                    ready: this.supabaseReady,
                    mode: this.demoMode ? 'Demo' : 'Production',
                    features: data.supabase_integration
                });
                
                // Mostrar notificação se em modo demo
                if (this.demoMode) {
                    this.showDemoNotification();
                }
            }
        } catch (error) {
            console.warn('⚠️ Erro ao verificar status Supabase:', error);
        }
    }
    
    showDemoNotification() {
        // Criar notificação discreta sobre modo demo
        const notification = document.createElement('div');
        notification.className = 'supabase-demo-notification';
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 10px;
                right: 10px;
                background: linear-gradient(135deg, #973CBF, #FF6B35);
                color: white;
                padding: 10px 15px;
                border-radius: 8px;
                font-size: 12px;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                max-width: 300px;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
            ">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span>🔧</span>
                    <div>
                        <strong>Supabase Preparado</strong><br>
                        <small>Sistema pronto para banco real</small>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" style="
                        background: none;
                        border: none;
                        color: white;
                        cursor: pointer;
                        font-size: 16px;
                        margin-left: auto;
                    ">×</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            const notif = notification.querySelector('div');
            notif.style.opacity = '1';
            notif.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                const notif = notification.querySelector('div');
                notif.style.opacity = '0';
                notif.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    // Métodos para futuras funcionalidades Supabase
    async authenticateWithSupabase(email, password) {
        if (this.demoMode) {
            console.log('🔧 Demo Mode: Usando autenticação simulada');
            return this.demoAuth(email, password);
        }
        
        // Implementação futura com Supabase real
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erro na autenticação Supabase:', error);
            return { success: false, error: 'Erro de conexão' };
        }
    }
    
    async registerWithSupabase(userData) {
        if (this.demoMode) {
            console.log('🔧 Demo Mode: Usando registro simulado');
            return this.demoRegister(userData);
        }
        
        // Implementação futura com Supabase real
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erro no registro Supabase:', error);
            return { success: false, error: 'Erro de conexão' };
        }
    }
    
    async getCourses(filters = {}) {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const url = `${this.apiBaseUrl}/courses${queryParams ? '?' + queryParams : ''}`;
            
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar cursos:', error);
            return { success: false, error: 'Erro de conexão' };
        }
    }
    
    async getMaterials(filters = {}) {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const url = `${this.apiBaseUrl}/materials${queryParams ? '?' + queryParams : ''}`;
            
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar materiais:', error);
            return { success: false, error: 'Erro de conexão' };
        }
    }
    
    async getUserRanking() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/users/ranking`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar ranking:', error);
            return { success: false, error: 'Erro de conexão' };
        }
    }
    
    async getChatRooms() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/chat/rooms`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar salas de chat:', error);
            return { success: false, error: 'Erro de conexão' };
        }
    }
    
    // Métodos demo (serão removidos quando Supabase estiver ativo)
    demoAuth(email, password) {
        const demoUsers = {
            'aluno@institutoburiti.com': {
                password: '123456',
                user: {
                    id: 'user-aluno-123',
                    email: 'aluno@institutoburiti.com',
                    full_name: 'João Silva',
                    user_type: 'student'
                }
            },
            'instrutor@institutoburiti.com': {
                password: '123456',
                user: {
                    id: 'user-instrutor-456',
                    email: 'instrutor@institutoburiti.com',
                    full_name: 'Maria Santos',
                    user_type: 'instructor'
                }
            },
            'admin@institutoburiti.com': {
                password: '123456',
                user: {
                    id: 'user-admin-789',
                    email: 'admin@institutoburiti.com',
                    full_name: 'Carlos Admin',
                    user_type: 'admin'
                }
            }
        };
        
        if (email in demoUsers && demoUsers[email].password === password) {
            return {
                success: true,
                user: demoUsers[email].user,
                message: 'Login realizado com sucesso (Demo - Supabase preparado)'
            };
        } else {
            return {
                success: false,
                error: 'Email ou senha incorretos'
            };
        }
    }
    
    demoRegister(userData) {
        return {
            success: true,
            user: {
                id: `demo-user-${Date.now()}`,
                email: userData.email,
                full_name: userData.full_name,
                user_type: userData.user_type || 'student'
            },
            message: 'Conta criada com sucesso! (Demo - Supabase preparado)'
        };
    }
    
    // Utilitários
    isSupabaseReady() {
        return this.supabaseReady && !this.demoMode;
    }
    
    isDemoMode() {
        return this.demoMode;
    }
    
    getIntegrationStatus() {
        return {
            ready: this.supabaseReady,
            demo: this.demoMode,
            production: this.supabaseReady && !this.demoMode
        };
    }
}

// Instância global
window.supabaseIntegration = new SupabaseIntegration();

// Exportar para uso em outros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SupabaseIntegration;
}

