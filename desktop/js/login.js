// Login Pages JavaScript - Funcionalidades interativas

document.addEventListener('DOMContentLoaded', function() {
    initializeLoginForm();
    initializeAnimations();
    initializeFormValidation();
    initializeForgotPassword();
    initializeRememberLogin();
});

function initializeLoginForm() {
    const form = document.getElementById('loginForm');
    const submitBtn = document.querySelector('.login-submit');
    
    if (form && submitBtn) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin(e);  // Corrigido: Passando o evento como parâmetro
        });
    }
}

function handleLogin(e) {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Clear previous errors
    clearFormErrors();
    
    // Basic validation
    if (!email) {
        showFormError('Por favor, informe seu e-mail.');
        return;
    }
    
    if (!password) {
        showFormError('Por favor, informe sua senha.');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('.login-submit');
    const btnText = document.querySelector('.btn-text');
    
    if (submitBtn && btnText) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        btnText.textContent = 'Entrando...';
    }
    
    // Validate credentials
    if (validateCredentials(email, password)) {
        // Save credentials if "remember me" is checked
        const rememberCheckbox = document.getElementById('remember-login');
        if (rememberCheckbox && rememberCheckbox.checked) {
            saveCredentials(email, password, rememberCheckbox.checked);
        }
        
        showSuccessMessage('Login realizado com sucesso!');
        
        // CORREÇÃO: Redirecionamento imediato sem setTimeout aninhado
        redirectToDashboard();
    } else {
        showFormError('E-mail ou senha incorretos. Verifique suas credenciais.');
    }
    
    // Reset button state
    setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        btnText.textContent = 'Entrar';
    }, 2000);
}

function validateCredentials(email, password) {
    const currentPage = window.location.pathname;
    
    // Test credentials for each user type
    const credentials = {
        'login-aluno.html': {
            email: 'ana.silva@email.com',
            password: 'senhaAluno'
        },
        'login-instrutor.html': {
            email: 'prof.joao@teste.com',
            password: 'senhaInstrutor'
        },
        'login-admin.html': {
            email: 'admin@institutoburiti.com',
            password: 'senhaAdmin'
        }
    };
    
    // Check if current page is in credentials
    if (currentPage.includes(Object.keys(credentials).find(page => currentPage.includes(page)))) {
        return email === credentials[Object.keys(credentials).find(page => currentPage.includes(page))].email && 
               password === credentials[Object.keys(credentials).find(page => currentPage.includes(page))].password;
    }
    
    return false;
}

// CORREÇÃO CRÍTICA: Função redirectToDashboard corrigida
function redirectToDashboard() {
    const currentPage = window.location.pathname;
    
    // Mostrar notificação
    showNotification('Redirecionando para o Dashboard...', 'info');
    
    // CORREÇÃO: Redirecionamento imediato sem setTimeout aninhado
    if (currentPage.includes('login-aluno.html')) {
        window.location.href = 'dashboard-aluno.html';
    } else if (currentPage.includes('login-instrutor.html')) {
        window.location.href = 'dashboard-instrutor.html';
    } else if (currentPage.includes('login-admin.html')) {
        window.location.href = 'dashboard-admin.html';
    }
}

// NOVA FUNCIONALIDADE: Recuperação de senha
function initializeForgotPassword() {
    const forgotPasswordLink = document.querySelector('a[href="#esqueci"], .forgot-password, a[onclick*="esqueci"]');
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            showForgotPasswordModal();
        });
    }
}

function showForgotPasswordModal() {
    // Verificar se o modal já existe
    let modal = document.getElementById('forgotPasswordModal');
    
    if (!modal) {
        // Criar modal
        modal = document.createElement('div');
        modal.id = 'forgotPasswordModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Recuperação de Senha</h2>
                <p>Informe seu e-mail para receber instruções de recuperação de senha.</p>
                <form id="forgotPasswordForm">
                    <div class="form-group">
                        <label for="recovery-email">E-mail</label>
                        <input type="email" id="recovery-email" placeholder="Seu e-mail cadastrado" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Enviar</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Configurar eventos do modal
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        const form = modal.querySelector('#forgotPasswordForm');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleForgotPassword();
        });
    }
    
    // Mostrar modal
    modal.style.display = 'block';
}

function handleForgotPassword() {
    const email = document.getElementById('recovery-email').value;
    
    if (!email) {
        showNotification('Por favor, informe seu e-mail.', 'error');
        return;
    }
    
    // Simular envio de e-mail
    showNotification('Instruções de recuperação enviadas para ' + email, 'success');
    
    // Fechar modal
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// NOVA FUNCIONALIDADE: Lembrar login
function initializeRememberLogin() {
    // Verificar se existe checkbox de lembrar login
    const rememberCheckbox = document.getElementById('remember-login');
    
    if (rememberCheckbox) {
        // Carregar credenciais salvas
        loadSavedCredentials();
    }
}

function loadSavedCredentials() {
    const savedEmail = localStorage.getItem('remembered_email');
    const savedPassword = localStorage.getItem('remembered_password');
    const rememberCheckbox = document.getElementById('remember-login');
    
    if (savedEmail && savedPassword && rememberCheckbox) {
        document.getElementById('email').value = savedEmail;
        document.getElementById('password').value = savedPassword;
        rememberCheckbox.checked = true;
    }
}

function saveCredentials(email, password, remember) {
    if (remember) {
        localStorage.setItem('remembered_email', email);
        localStorage.setItem('remembered_password', password);
    } else {
        localStorage.removeItem('remembered_email');
        localStorage.removeItem('remembered_password');
    }
}

// Funções de UI
function clearFormErrors() {
    const errorElement = document.querySelector('.form-error');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

function showFormError(message) {
    let errorElement = document.querySelector('.form-error');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        const form = document.getElementById('loginForm');
        form.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function showSuccessMessage(message) {
    let successElement = document.querySelector('.form-success');
    
    if (!successElement) {
        successElement = document.createElement('div');
        successElement.className = 'form-success';
        const form = document.getElementById('loginForm');
        form.appendChild(successElement);
    }
    
    successElement.textContent = message;
    successElement.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        successElement.style.display = 'none';
    }, 3000);
}

function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    // Adicionar ao DOM
    document.body.appendChild(notification);
    
    // Mostrar com animação
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Animações e validação
function initializeAnimations() {
    // Adicionar classes para animações de entrada
    const form = document.querySelector('.login-form');
    if (form) {
        form.classList.add('fade-in');
    }
    
    // Animar campos de formulário
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach((input, index) => {
        input.style.animationDelay = `${index * 0.1}s`;
        input.classList.add('slide-up');
    });
}

function initializeFormValidation() {
    const inputs = document.querySelectorAll('.form-control');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            validateField(this);
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.getAttribute('name') || field.id;
    
    // Remover estado de erro anterior
    field.classList.remove('is-invalid');
    field.classList.remove('is-valid');
    
    // Validar baseado no tipo de campo
    if (fieldName === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
            field.classList.add('is-invalid');
            return false;
        } else if (!emailRegex.test(value)) {
            field.classList.add('is-invalid');
            return false;
        } else {
            field.classList.add('is-valid');
            return true;
        }
    } else if (fieldName === 'password') {
        if (!value) {
            field.classList.add('is-invalid');
            return false;
        } else {
            field.classList.add('is-valid');
            return true;
        }
    }
    
    return true;
}

