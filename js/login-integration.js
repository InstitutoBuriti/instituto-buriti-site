// ===== INTEGRAÇÃO LOGIN COM API =====
// Instituto Buriti Mobile

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se já está logado
    if (apiClient.isAuthenticated()) {
        redirectToDashboard();
        return;
    }

    // Elementos do formulário
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.querySelector('.login-btn');
    const loadingSpinner = document.querySelector('.loading-spinner');

    // Botões de conta demo
    const demoButtons = document.querySelectorAll('.demo-btn');

    // ===== MANIPULAÇÃO DO FORMULÁRIO =====

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleLogin();
        });
    }

    // ===== FUNÇÃO DE LOGIN =====
    async function handleLogin() {
        const email = emailInput?.value?.trim();
        const password = passwordInput?.value;

        // Validação básica
        if (!email || !password) {
            showNotification('Por favor, preencha todos os campos', 'error');
            return;
        }

        // Mostrar loading
        setLoadingState(true);

        try {
            const response = await apiClient.login(email, password);

            if (response.success) {
                showNotification('Login realizado com sucesso!', 'success');
                
                // Aguardar um pouco para mostrar a mensagem
                setTimeout(() => {
                    redirectToDashboard();
                }, 1000);
            } else {
                showNotification(response.message || 'Erro ao fazer login', 'error');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            showNotification('Erro de conexão. Tente novamente.', 'error');
        } finally {
            setLoadingState(false);
        }
    }

    // ===== CONTAS DEMO =====
    demoButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const userType = this.dataset.userType;
            await handleDemoLogin(userType);
        });
    });

    async function handleDemoLogin(userType) {
        setLoadingState(true);

        try {
            const response = await apiClient.demoLogin(userType);

            if (response.success) {
                showNotification(`Login demo ${userType} realizado com sucesso!`, 'success');
                
                setTimeout(() => {
                    redirectToDashboard();
                }, 1000);
            } else {
                showNotification(response.message || 'Erro ao fazer login demo', 'error');
            }
        } catch (error) {
            console.error('Erro no login demo:', error);
            showNotification('Erro de conexão. Tente novamente.', 'error');
        } finally {
            setLoadingState(false);
        }
    }

    // ===== ESTADO DE LOADING =====
    function setLoadingState(isLoading) {
        if (loginButton) {
            loginButton.disabled = isLoading;
            loginButton.textContent = isLoading ? 'Entrando...' : 'Entrar';
        }

        if (loadingSpinner) {
            loadingSpinner.style.display = isLoading ? 'block' : 'none';
        }

        // Desabilitar botões demo durante loading
        demoButtons.forEach(button => {
            button.disabled = isLoading;
        });
    }

    // ===== MODAL ESQUECI SENHA =====
    const forgotPasswordBtn = document.querySelector('.forgot-password-btn');
    const forgotModal = document.getElementById('forgotPasswordModal');
    const closeForgotModal = document.querySelector('.close-forgot-modal');

    if (forgotPasswordBtn && forgotModal) {
        forgotPasswordBtn.addEventListener('click', function(e) {
            e.preventDefault();
            forgotModal.style.display = 'flex';
        });
    }

    if (closeForgotModal && forgotModal) {
        closeForgotModal.addEventListener('click', function() {
            forgotModal.style.display = 'none';
        });
    }

    // Fechar modal clicando fora
    if (forgotModal) {
        forgotModal.addEventListener('click', function(e) {
            if (e.target === forgotModal) {
                forgotModal.style.display = 'none';
            }
        });
    }

    // ===== TESTE DE CONEXÃO COM API =====
    async function testApiConnection() {
        try {
            const response = await apiClient.healthCheck();
            
            if (response.success) {
                console.log('✅ Conexão com API estabelecida');
                console.log('Supabase Status:', response.supabase_status);
            } else {
                console.warn('⚠️ API respondeu mas com problemas:', response);
            }
        } catch (error) {
            console.error('❌ Erro ao conectar com API:', error);
            
            // Mostrar notificação discreta sobre problemas de conexão
            setTimeout(() => {
                showNotification('Verificando conexão com servidor...', 'warning');
            }, 2000);
        }
    }

    // Testar conexão ao carregar a página
    testApiConnection();

    // ===== ENTER PARA SUBMIT =====
    if (emailInput) {
        emailInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                passwordInput?.focus();
            }
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }

    // ===== VALIDAÇÃO EM TEMPO REAL =====
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const email = this.value.trim();
            if (email && !isValidEmail(email)) {
                this.style.borderColor = '#EF4444';
                showNotification('Por favor, insira um email válido', 'warning');
            } else {
                this.style.borderColor = '';
            }
        });
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // ===== FEEDBACK VISUAL =====
    function addInputFeedback() {
        const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');
        
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.style.borderColor = '#973CBF';
                this.style.boxShadow = '0 0 0 3px rgba(151, 60, 191, 0.1)';
            });

            input.addEventListener('blur', function() {
                this.style.borderColor = '';
                this.style.boxShadow = '';
            });
        });
    }

    addInputFeedback();
});

