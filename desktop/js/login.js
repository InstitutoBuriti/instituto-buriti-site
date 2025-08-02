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
            handleLogin(e);
        });
    }
}

function handleLogin(e) {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const submitBtn = document.querySelector('.login-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    
    // Clear previous errors
    clearFormErrors();
    
    // Basic validation
    if (!email || !password) {
        showFormError('Por favor, preencha todos os campos.');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showFormError('Por favor, insira um e-mail válido.');
        return;
    }
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    btnText.textContent = 'Entrando...';
    
    // Simulate login process
    setTimeout(() => {
        // Check credentials based on current page
        const isValidLogin = validateCredentials(email, password);
        
        if (isValidLogin) {
            // Save credentials if "remember me" is checked
            const rememberCheckbox = document.getElementById('remember-login');
            if (rememberCheckbox) {
                saveCredentials(email, password, rememberCheckbox.checked);
            }
            
            showSuccessMessage('Login realizado com sucesso!');
            
            // Redirect based on user type
            setTimeout(() => {
                redirectToDashboard();
            }, 1500);
        } else {
            showFormError('E-mail ou senha incorretos. Verifique suas credenciais.');
        }
        
        // Reset button state
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
    
    // Find matching credentials
    for (const [page, creds] of Object.entries(credentials)) {
        if (currentPage.includes(page)) {
            return email === creds.email && password === creds.password;
        }
    }
    
    return false;
}

// CORREÇÃO CRÍTICA: Função redirectToDashboard corrigida
function redirectToDashboard() {
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('login-aluno.html')) {
        showNotification('Redirecionando para o Dashboard do Aluno...', 'info');
        setTimeout(() => {
            window.location.href = 'dashboard-aluno.html';
        }, 1500);
    } else if (currentPage.includes('login-instrutor.html')) {
        showNotification('Redirecionando para o Dashboard do Instrutor...', 'info');
        setTimeout(() => {
            window.location.href = 'dashboard-instrutor.html';
        }, 1500);
    } else if (currentPage.includes('login-admin.html')) {
        showNotification('Redirecionando para o Painel Administrativo...', 'info');
        setTimeout(() => {
            window.location.href = 'dashboard-admin.html';
        }, 1500);
    }
}

// NOVA FUNCIONALIDADE: Recuperação de senha
function initializeForgotPassword() {
    const forgotPasswordLink = document.querySelector('a[href*="esqueci"], .forgot-password, a[onclick*="esqueci"]');
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            showForgotPasswordModal();
        });
    }
}

function showForgotPasswordModal() {
    // Criar modal se não existir
    let modal = document.getElementById('forgot-password-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'forgot-password-modal';
        modal.className = 'modal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
        `;
        
        modal.innerHTML = `
            <div class="modal-content" style="
                background-color: #fefefe;
                margin: 10% auto;
                padding: 20px;
                border: none;
                border-radius: 10px;
                width: 90%;
                max-width: 400px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            ">
                <span class="close" style="
                    color: #aaa;
                    float: right;
                    font-size: 28px;
                    font-weight: bold;
                    cursor: pointer;
                ">&times;</span>
                <h2 style="color: #333; margin-bottom: 20px;">Recuperar Senha</h2>
                <form id="forgot-password-form">
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label for="recovery-email" style="display: block; margin-bottom: 5px; color: #555;">E-mail:</label>
                        <input type="email" id="recovery-email" required 
                               placeholder="Digite seu e-mail cadastrado"
                               style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
                    </div>
                    <button type="submit" style="
                        width: 100%;
                        padding: 12px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: bold;
                    ">Enviar Link de Recuperação</button>
                </form>
                <div id="recovery-message" style="display: none; margin-top: 15px;"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Event listeners do modal
        modal.querySelector('.close').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        modal.querySelector('#forgot-password-form').addEventListener('submit', handleForgotPassword);
    }
    
    modal.style.display = 'block';
}

function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('recovery-email').value;
    const messageDiv = document.getElementById('recovery-message');
    
    // Simular envio (implementar integração real posteriormente)
    messageDiv.innerHTML = `
        <div style="
            padding: 15px;
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 5px;
            color: #155724;
        ">
            <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
            Link de recuperação enviado para ${email}!<br>
            Verifique sua caixa de entrada e spam.
        </div>
    `;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        document.getElementById('forgot-password-modal').style.display = 'none';
        messageDiv.style.display = 'none';
        document.getElementById('recovery-email').value = '';
    }, 3000);
}

// NOVA FUNCIONALIDADE: Lembrar Login
function initializeRememberLogin() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    // Adicionar checkbox se não existir
    let rememberCheckbox = document.getElementById('remember-login');
    if (!rememberCheckbox) {
        const passwordField = document.getElementById('password');
        if (passwordField) {
            const rememberDiv = document.createElement('div');
            rememberDiv.className = 'form-group remember-me';
            rememberDiv.style.cssText = 'margin: 15px 0; display: flex; align-items: center;';
            rememberDiv.innerHTML = `
                <label style="display: flex; align-items: center; cursor: pointer; font-size: 14px; color: #666;">
                    <input type="checkbox" id="remember-login" name="remember" style="margin-right: 8px;">
                    <span>Lembrar-me</span>
                </label>
            `;
            passwordField.parentNode.insertBefore(rememberDiv, passwordField.nextSibling);
        }
    }
    
    // Carregar credenciais salvas
    loadSavedCredentials();
}

function loadSavedCredentials() {
    const savedEmail = localStorage.getItem('remembered_email');
    const savedPassword = localStorage.getItem('remembered_password');
    
    if (savedEmail && savedPassword) {
        const emailField = document.getElementById('email');
        const passwordField = document.getElementById('password');
        const rememberCheckbox = document.getElementById('remember-login');
        
        if (emailField && passwordField) {
            emailField.value = savedEmail;
            passwordField.value = atob(savedPassword); // Decodificar
            if (rememberCheckbox) {
                rememberCheckbox.checked = true;
            }
        }
    }
}

function saveCredentials(email, password, remember) {
    if (remember) {
        localStorage.setItem('remembered_email', email);
        localStorage.setItem('remembered_password', btoa(password)); // Codificar básico
    } else {
        localStorage.removeItem('remembered_email');
        localStorage.removeItem('remembered_password');
    }
}

// Utility functions
function clearFormErrors() {
    const errorElements = document.querySelectorAll('.form-error, .error-message');
    errorElements.forEach(element => {
        element.remove();
    });
    
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.classList.remove('error');
    });
}

function showFormError(message) {
    const form = document.getElementById('loginForm');
    if (!form) return;
    
    // Remove existing errors
    clearFormErrors();
    
    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.style.cssText = `
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        color: #721c24;
        padding: 12px;
        border-radius: 5px;
        margin-bottom: 15px;
        font-size: 14px;
    `;
    errorDiv.textContent = message;
    
    // Insert at top of form
    form.insertBefore(errorDiv, form.firstChild);
}

function showSuccessMessage(message) {
    const form = document.getElementById('loginForm');
    if (!form) return;
    
    // Remove existing messages
    clearFormErrors();
    
    // Create success element
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
        background-color: #d4edda;
        border: 1px solid #c3e6cb;
        color: #155724;
        padding: 12px;
        border-radius: 5px;
        margin-bottom: 15px;
        font-size: 14px;
    `;
    successDiv.textContent = message;
    
    // Insert at top of form
    form.insertBefore(successDiv, form.firstChild);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        background: ${type === 'info' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#dc3545'};
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Animation functions (mantidas do arquivo original)
function initializeAnimations() {
    // Animações de entrada
    const formElements = document.querySelectorAll('.form-group');
    formElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function initializeFormValidation() {
    const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            // Remove error styling on input
            this.parentNode.classList.remove('error');
            const errorMsg = this.parentNode.querySelector('.field-error');
            if (errorMsg) {
                errorMsg.remove();
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    let isValid = true;
    let errorMessage = '';
    
    // Remove previous error
    field.parentNode.classList.remove('error');
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Validation logic
    if (!value) {
        isValid = false;
        errorMessage = 'Este campo é obrigatório.';
    } else if (fieldType === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Por favor, insira um e-mail válido.';
        }
    } else if (fieldType === 'password') {
        if (value.length < 6) {
            isValid = false;
            errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
        }
    }
    
    // Show error if invalid
    if (!isValid) {
        field.parentNode.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = 'color: #dc3545; font-size: 12px; margin-top: 5px;';
        errorDiv.textContent = errorMessage;
        field.parentNode.appendChild(errorDiv);
    }
    
    return isValid;
}

