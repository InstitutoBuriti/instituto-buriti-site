/**
 * Cliente API para Instituto Buriti
 * Integração com backend Flask + Supabase
 */

class APIClient {
    constructor() {
        // Detectar URL da API automaticamente
        this.baseURL = this.detectAPIURL();
        this.accessToken = localStorage.getItem('access_token');
        this.refreshToken = localStorage.getItem('refresh_token');
    }

    detectAPIURL() {
        // Se estiver em desenvolvimento local, usar localhost
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:5004/api';
        }
        
        // Se estiver em produção, usar URL do backend deployado
        const currentHost = window.location.host;
        if (currentHost.includes('manus')) {
            // Para ambiente Manus, usar backend com push notifications em produção
            return 'https://mzhyi8cn6wky.manus.space/api';
        }
        
        // Fallback para produção
        return '/api';
    }

    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        // Adicionar token de autorização se disponível
        if (this.accessToken) {
            defaultOptions.headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, finalOptions);
            
            // Se token expirou, tentar renovar
            if (response.status === 401 && this.refreshToken) {
                const renewed = await this.refreshAccessToken();
                if (renewed) {
                    // Tentar novamente com novo token
                    finalOptions.headers['Authorization'] = `Bearer ${this.accessToken}`;
                    return await fetch(url, finalOptions);
                }
            }

            return response;
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    }

    // Métodos de autenticação
    async login(email, password) {
        const response = await this.makeRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            this.setTokens(data.access_token, data.refresh_token);
            return { success: true, user: data.user };
        } else {
            const error = await response.json();
            return { success: false, message: error.message };
        }
    }

    async demoLogin(userType) {
        const response = await this.makeRequest(`/auth/demo-login/${userType}`, {
            method: 'POST',
        });

        if (response.ok) {
            const data = await response.json();
            this.setTokens(data.access_token, data.refresh_token);
            return { success: true, user: data.user };
        } else {
            const error = await response.json();
            return { success: false, message: error.message };
        }
    }

    async logout() {
        try {
            await this.makeRequest('/auth/logout', {
                method: 'POST',
            });
        } catch (error) {
            console.error('Erro no logout:', error);
        } finally {
            this.clearTokens();
        }
    }

    async refreshAccessToken() {
        if (!this.refreshToken) {
            return false;
        }

        try {
            const response = await this.makeRequest('/auth/refresh', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.refreshToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                this.setTokens(data.access_token, this.refreshToken);
                return true;
            }
        } catch (error) {
            console.error('Erro ao renovar token:', error);
        }

        this.clearTokens();
        return false;
    }

    async getCurrentUser() {
        const response = await this.makeRequest('/auth/me');
        
        if (response.ok) {
            return await response.json();
        }
        
        return null;
    }

    async changePassword(currentPassword, newPassword) {
        const response = await this.makeRequest('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword,
            }),
        });

        return response.ok;
    }

    // Métodos de cursos
    async getCourses() {
        const response = await this.makeRequest('/courses');
        if (response.ok) {
            return await response.json();
        }
        return [];
    }

    async getFeaturedCourses() {
        const response = await this.makeRequest('/courses/featured');
        if (response.ok) {
            return await response.json();
        }
        return [];
    }

    async getCoursesByCategory(category) {
        const response = await this.makeRequest(`/courses/by-category/${category}`);
        if (response.ok) {
            return await response.json();
        }
        return [];
    }

    async getMyEnrollments() {
        const response = await this.makeRequest('/courses/my-enrollments');
        if (response.ok) {
            return await response.json();
        }
        return [];
    }

    // Métodos de dashboard
    async getDashboardData(userType) {
        const response = await this.makeRequest(`/dashboard/${userType}`);
        if (response.ok) {
            return await response.json();
        }
        return {};
    }

    // Métodos auxiliares
    setTokens(accessToken, refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
    }

    clearTokens() {
        this.accessToken = null;
        this.refreshToken = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }

    isAuthenticated() {
        return !!this.accessToken;
    }

    // Teste de conexão
    async testConnection() {
        try {
            const response = await this.makeRequest('/health');
            return response.ok;
        } catch (error) {
            console.error('Erro ao testar conexão:', error);
            return false;
        }
    }
}

// Instância global do cliente API
const apiClient = new APIClient();


// Métodos genéricos para compatibilidade
apiClient.get = async function(endpoint) {
    const response = await this.makeRequest(endpoint, { method: 'GET' });
    if (response.ok) {
        return await response.json();
    } else {
        const error = await response.json();
        throw new Error(error.message || 'Erro na requisição');
    }
};

apiClient.post = async function(endpoint, data = null) {
    const options = { method: 'POST' };
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    const response = await this.makeRequest(endpoint, options);
    if (response.ok) {
        return await response.json();
    } else {
        const error = await response.json();
        throw new Error(error.message || 'Erro na requisição');
    }
};

console.log('🚀 API Client carregado com métodos GET e POST genéricos');

