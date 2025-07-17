/**
 * Sistema de Autenticação Real - Instituto Buriti
 * Integração com Supabase Auth
 */

class AuthReal {
    constructor() {
        this.apiBaseUrl = 'https://zmhqivcvkygp.manus.space/api/auth';
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Inicializar estado da autenticação
        this.initAuthState();
    }
    
    /**
     * Inicializa o estado de autenticação
     */
    initAuthState() {
        const userData = localStorage.getItem('instituto_buriti_user');
        const token = localStorage.getItem('instituto_buriti_token');
        
        if (userData && token) {
            try {
                this.currentUser = JSON.parse(userData);
                this.isAuthenticated = true;
                
                // Verificar se o token ainda é válido
                this.verifyToken(token);
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
                this.clearAuthData();
            }
        }
    }
    
    /**
     * Verifica se um token é válido
     */
    async verifyToken(token) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/verify-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ token })
            });
            
            const result = await response.json();
            
            if (!result.success || !result.valid) {
                this.clearAuthData();
            }
        } catch (error) {
            console.error('Erro ao verificar token:', error);
            this.clearAuthData();
        }
    }
    
    /**
     * Limpa dados de autenticação
     */
    clearAuthData() {
        localStorage.removeItem('instituto_buriti_user');
        localStorage.removeItem('instituto_buriti_token');
        localStorage.removeItem('instituto_buriti_refresh_token');
        this.currentUser = null;
        this.isAuthenticated = false;
    }
    
    /**
     * Salva dados de autenticação
     */
    saveAuthData(user, tokens) {
        localStorage.setItem('instituto_buriti_user', JSON.stringify(user));
        localStorage.setItem('instituto_buriti_token', tokens.access_token);
        if (tokens.refresh_token) {
            localStorage.setItem('instituto_buriti_refresh_token', tokens.refresh_token);
        }
        this.currentUser = user;
        this.isAuthenticated = true;
    }
    
    /**
     * Faz login do usuário
     */
    async login(email, password, rememberMe = false) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email.toLowerCase().trim(),
                    password: password,
                    remember_me: rememberMe
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.saveAuthData(result.user, result.tokens);
                return {
                    success: true,
                    user: result.user,
                    message: result.message
                };
            } else {
                return {
                    success: false,
                    error: result.error || 'Erro ao fazer login'
                };
            }
        } catch (error) {
            console.error('Erro no login:', error);
            return {
                success: false,
                error: 'Erro de conexão. Tente novamente.'
            };
        }
    }
    
    /**
     * Registra um novo usuário
     */
    async register(userData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: userData.email.toLowerCase().trim(),
                    password: userData.password,
                    full_name: userData.fullName.trim(),
                    user_type: userData.userType || 'student'
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                return {
                    success: true,
                    user: result.user,
                    message: result.message
                };
            } else {
                return {
                    success: false,
                    error: result.error || 'Erro ao criar conta'
                };
            }
        } catch (error) {
            console.error('Erro no registro:', error);
            return {
                success: false,
                error: 'Erro de conexão. Tente novamente.'
            };
        }
    }
    
    /**
     * Faz logout do usuário
     */
    async logout() {
        try {
            const token = localStorage.getItem('instituto_buriti_token');
            
            if (token) {
                await fetch(`${this.apiBaseUrl}/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            console.error('Erro no logout:', error);
        } finally {
            this.clearAuthData();
        }
    }
    
    /**
     * Solicita reset de senha
     */
    async resetPassword(email) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email.toLowerCase().trim()
                })
            });
            
            const result = await response.json();
            
            return {
                success: result.success,
                message: result.message || result.error
            };
        } catch (error) {
            console.error('Erro no reset de senha:', error);
            return {
                success: false,
                message: 'Erro de conexão. Tente novamente.'
            };
        }
    }
    
    /**
     * Obtém dados do usuário atual
     */
    async getCurrentUser() {
        try {
            const token = localStorage.getItem('instituto_buriti_token');
            
            if (!token) {
                return { success: false, error: 'Não autenticado' };
            }
            
            const response = await fetch(`${this.apiBaseUrl}/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.currentUser = result.user;
                localStorage.setItem('instituto_buriti_user', JSON.stringify(result.user));
                return { success: true, user: result.user };
            } else {
                this.clearAuthData();
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            return { success: false, error: 'Erro de conexão' };
        }
    }
    
    /**
     * Login demonstração
     */
    async demoLogin(userType) {
        const demoCredentials = {
            student: {
                email: 'aluno@institutoburiti.com',
                password: '123456'
            },
            instructor: {
                email: 'instrutor@institutoburiti.com',
                password: '123456'
            },
            admin: {
                email: 'admin@institutoburiti.com',
                password: '123456'
            }
        };
        
        const credentials = demoCredentials[userType];
        if (!credentials) {
            return { success: false, error: 'Tipo de usuário inválido' };
        }
        
        return await this.login(credentials.email, credentials.password);
    }
    
    /**
     * Valida email
     */
    validateEmail(email) {
        const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return pattern.test(email);
    }
    
    /**
     * Valida força da senha
     */
    validatePassword(password) {
        const result = {
            isValid: false,
            strength: 'weak',
            message: '',
            score: 0
        };
        
        if (password.length < 6) {
            result.message = 'Mínimo 6 caracteres';
            return result;
        }
        
        let score = 0;
        
        // Comprimento
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        
        // Caracteres
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^a-zA-Z0-9]/.test(password)) score += 1;
        
        result.score = score;
        
        if (score < 3) {
            result.strength = 'weak';
            result.message = 'Senha fraca';
        } else if (score < 5) {
            result.strength = 'medium';
            result.message = 'Senha média';
            result.isValid = true;
        } else {
            result.strength = 'strong';
            result.message = 'Senha forte';
            result.isValid = true;
        }
        
        return result;
    }
    
    /**
     * Inicializa página de login
     */
    static initLoginPage() {
        const authReal = new AuthReal();
        
        // Elementos do formulário
        const loginForm = document.getElementById('loginForm');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const passwordToggle = document.getElementById('passwordToggle');
        const rememberMeInput = document.getElementById('rememberMe');
        const loginButton = document.getElementById('loginButton');
        const loginLoader = document.getElementById('loginLoader');
        const formMessage = document.getElementById('formMessage');
        const loadingOverlay = document.getElementById('loadingOverlay');
        const successModal = document.getElementById('successModal');
        const forgotPassword = document.getElementById('forgotPassword');
        const forgotModal = document.getElementById('forgotModal');
        const forgotModalClose = document.getElementById('forgotModalClose');
        const forgotForm = document.getElementById('forgotForm');
        const demoButtons = document.querySelectorAll('.demo-button');
        
        // Toggle de senha
        if (passwordToggle) {
            passwordToggle.addEventListener('click', function() {
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                this.querySelector('.toggle-icon').textContent = type === 'password' ? '👁️' : '🙈';
            });
        }
        
        // Validação em tempo real
        emailInput.addEventListener('blur', function() {
            const emailError = document.getElementById('emailError');
            if (this.value && !authReal.validateEmail(this.value)) {
                emailError.textContent = 'Email inválido';
                this.classList.add('error');
            } else {
                emailError.textContent = '';
                this.classList.remove('error');
            }
        });
        
        // Formulário de login
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const rememberMe = rememberMeInput.checked;
            
            // Validações
            if (!email || !password) {
                authReal.showMessage('Preencha todos os campos', 'error');
                return;
            }
            
            if (!authReal.validateEmail(email)) {
                authReal.showMessage('Email inválido', 'error');
                return;
            }
            
            // Mostrar loading
            authReal.showLoading(true);
            loginButton.disabled = true;
            loginLoader.style.display = 'block';
            
            try {
                const result = await authReal.login(email, password, rememberMe);
                
                if (result.success) {
                    authReal.showMessage('Login realizado com sucesso!', 'success');
                    
                    // Mostrar modal de sucesso
                    successModal.style.display = 'flex';
                    
                    // Redirecionar após 2 segundos
                    setTimeout(() => {
                        window.location.href = '../index.html';
                    }, 2000);
                } else {
                    authReal.showMessage(result.error, 'error');
                }
            } catch (error) {
                authReal.showMessage('Erro de conexão. Tente novamente.', 'error');
            } finally {
                authReal.showLoading(false);
                loginButton.disabled = false;
                loginLoader.style.display = 'none';
            }
        });
        
        // Botões de demo
        demoButtons.forEach(button => {
            button.addEventListener('click', async function() {
                const userType = this.dataset.type;
                
                authReal.showLoading(true);
                
                try {
                    const result = await authReal.demoLogin(userType);
                    
                    if (result.success) {
                        authReal.showMessage(`Login como ${userType} realizado!`, 'success');
                        successModal.style.display = 'flex';
                        
                        setTimeout(() => {
                            window.location.href = '../index.html';
                        }, 2000);
                    } else {
                        authReal.showMessage(result.error, 'error');
                    }
                } catch (error) {
                    authReal.showMessage('Erro de conexão. Tente novamente.', 'error');
                } finally {
                    authReal.showLoading(false);
                }
            });
        });
        
        // Esqueci minha senha
        if (forgotPassword) {
            forgotPassword.addEventListener('click', function(e) {
                e.preventDefault();
                forgotModal.style.display = 'flex';
            });
        }
        
        if (forgotModalClose) {
            forgotModalClose.addEventListener('click', function() {
                forgotModal.style.display = 'none';
            });
        }
        
        if (forgotForm) {
            forgotForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const email = document.getElementById('forgotEmail').value.trim();
                
                if (!email || !authReal.validateEmail(email)) {
                    authReal.showMessage('Email inválido', 'error');
                    return;
                }
                
                const result = await authReal.resetPassword(email);
                authReal.showMessage(result.message, result.success ? 'success' : 'error');
                
                if (result.success) {
                    forgotModal.style.display = 'none';
                }
            });
        }
        
        // Fechar modais clicando fora
        window.addEventListener('click', function(e) {
            if (e.target === forgotModal) {
                forgotModal.style.display = 'none';
            }
        });
    }
    
    /**
     * Inicializa página de registro
     */
    static initRegisterPage() {
        const authReal = new AuthReal();
        
        // Elementos do formulário
        const registerForm = document.getElementById('registerForm');
        const fullNameInput = document.getElementById('fullName');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const userTypeSelect = document.getElementById('userType');
        const acceptTermsInput = document.getElementById('acceptTerms');
        const passwordToggle = document.getElementById('passwordToggle');
        const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
        const registerButton = document.getElementById('registerButton');
        const registerLoader = document.getElementById('registerLoader');
        const formMessage = document.getElementById('formMessage');
        const loadingOverlay = document.getElementById('loadingOverlay');
        const successModal = document.getElementById('successModal');
        const successButton = document.getElementById('successButton');
        const passwordStrength = document.getElementById('passwordStrength');
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        
        // Toggle de senhas
        if (passwordToggle) {
            passwordToggle.addEventListener('click', function() {
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                this.querySelector('.toggle-icon').textContent = type === 'password' ? '👁️' : '🙈';
            });
        }
        
        if (confirmPasswordToggle) {
            confirmPasswordToggle.addEventListener('click', function() {
                const type = confirmPasswordInput.type === 'password' ? 'text' : 'password';
                confirmPasswordInput.type = type;
                this.querySelector('.toggle-icon').textContent = type === 'password' ? '👁️' : '🙈';
            });
        }
        
        // Validação de força da senha
        passwordInput.addEventListener('input', function() {
            const validation = authReal.validatePassword(this.value);
            
            if (this.value) {
                passwordStrength.style.display = 'block';
                strengthText.textContent = validation.message;
                
                const percentage = (validation.score / 6) * 100;
                strengthFill.style.width = percentage + '%';
                
                strengthFill.className = 'strength-fill ' + validation.strength;
                strengthText.className = 'strength-text ' + validation.strength;
            } else {
                passwordStrength.style.display = 'none';
            }
        });
        
        // Validação em tempo real
        emailInput.addEventListener('blur', function() {
            const emailError = document.getElementById('emailError');
            if (this.value && !authReal.validateEmail(this.value)) {
                emailError.textContent = 'Email inválido';
                this.classList.add('error');
            } else {
                emailError.textContent = '';
                this.classList.remove('error');
            }
        });
        
        confirmPasswordInput.addEventListener('blur', function() {
            const confirmPasswordError = document.getElementById('confirmPasswordError');
            if (this.value && this.value !== passwordInput.value) {
                confirmPasswordError.textContent = 'Senhas não coincidem';
                this.classList.add('error');
            } else {
                confirmPasswordError.textContent = '';
                this.classList.remove('error');
            }
        });
        
        // Formulário de registro
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                fullName: fullNameInput.value.trim(),
                email: emailInput.value.trim(),
                password: passwordInput.value,
                confirmPassword: confirmPasswordInput.value,
                userType: userTypeSelect.value,
                acceptTerms: acceptTermsInput.checked
            };
            
            // Validações
            if (!formData.fullName || !formData.email || !formData.password || 
                !formData.confirmPassword || !formData.userType) {
                authReal.showMessage('Preencha todos os campos obrigatórios', 'error');
                return;
            }
            
            if (!authReal.validateEmail(formData.email)) {
                authReal.showMessage('Email inválido', 'error');
                return;
            }
            
            const passwordValidation = authReal.validatePassword(formData.password);
            if (!passwordValidation.isValid) {
                authReal.showMessage('Senha muito fraca. Use pelo menos 6 caracteres com letras e números.', 'error');
                return;
            }
            
            if (formData.password !== formData.confirmPassword) {
                authReal.showMessage('Senhas não coincidem', 'error');
                return;
            }
            
            if (!formData.acceptTerms) {
                authReal.showMessage('Você deve aceitar os termos de uso', 'error');
                return;
            }
            
            // Mostrar loading
            authReal.showLoading(true);
            registerButton.disabled = true;
            registerLoader.style.display = 'block';
            
            try {
                const result = await authReal.register(formData);
                
                if (result.success) {
                    authReal.showMessage('Conta criada com sucesso!', 'success');
                    successModal.style.display = 'flex';
                } else {
                    authReal.showMessage(result.error, 'error');
                }
            } catch (error) {
                authReal.showMessage('Erro de conexão. Tente novamente.', 'error');
            } finally {
                authReal.showLoading(false);
                registerButton.disabled = false;
                registerLoader.style.display = 'none';
            }
        });
        
        // Botão de sucesso
        if (successButton) {
            successButton.addEventListener('click', function() {
                window.location.href = 'login-real.html';
            });
        }
        
        // Fechar modal clicando fora
        window.addEventListener('click', function(e) {
            if (e.target === successModal) {
                window.location.href = 'login-real.html';
            }
        });
    }
    
    /**
     * Mostra mensagem para o usuário
     */
    showMessage(message, type = 'info') {
        const formMessage = document.getElementById('formMessage');
        if (formMessage) {
            formMessage.textContent = message;
            formMessage.className = `form-message ${type}`;
            formMessage.style.display = 'block';
            
            // Esconder após 5 segundos
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 5000);
        }
    }
    
    /**
     * Mostra/esconde loading
     */
    showLoading(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    }
}

// Instância global
window.AuthReal = AuthReal;

