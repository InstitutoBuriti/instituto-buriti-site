// Login Pages JavaScript - Funcionalidades interativas

document.addEventListener('DOMContentLoaded', function() {
    initializeLoginForm();
    initializeAnimations();
    initializeFormValidation();
});

function initializeLoginForm() {
    const form = document.getElementById('loginForm');
    const submitBtn = document.querySelector('.login-submit');
    
    if (form && submitBtn) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
}

function handleLogin() {
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
            email: 'ana.silva@teste.com',
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

function redirectToDashboard() {
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('login-aluno.html')) {
        showNotification('Redirecionando para o Dashboard do Aluno...', 'info');
        // CORREÇÃO: Redirecionamento descomentado e funcional
        window.location.href = 'dashboard-aluno.html';
    } else if (currentPage.includes('login-instrutor.html')) {
        showNotification('Redirecionando para o Dashboard do Instrutor...', 'info');
        // CORREÇÃO: Redirecionamento descomentado e funcional
        window.location.href = 'dashboard-instrutor.html';
    } else if (currentPage.includes('login-admin.html')) {
        showNotification('Redirecionando para o Painel Administrativo...', 'info');
        // CORREÇÃO: Redirecionamento descomentado e funcional
        window.location.href = 'dashboard-admin.html';
    }
}

function fillTestCredentials() {
    const currentPage = window.location.pathname;
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    let testEmail = '';
    let testPassword = '';
    
    if (currentPage.includes('login-aluno.html')) {
        testEmail = 'ana.silva@teste.com';
        testPassword = 'senhaAluno';
    } else if (currentPage.includes('login-instrutor.html')) {
        testEmail = 'prof.joao@teste.com';
        testPassword = 'senhaInstrutor';
    } else if (currentPage.includes('login-admin.html')) {
        testEmail = 'admin@institutoburiti.com';
        testPassword = 'senhaAdmin';
    }
    
    // Animate the filling
    emailInput.value = '';
    passwordInput.value = '';
    
    typeText(emailInput, testEmail, 50, () => {
        typeText(passwordInput, testPassword, 50);
    });
    
    showNotification('Credenciais de teste preenchidas!', 'success');
}

function typeText(element, text, speed, callback) {
    let i = 0;
    const timer = setInterval(() => {
        element.value += text.charAt(i);
        i++;
        if (i >= text.length) {
            clearInterval(timer);
            if (callback) callback();
        }
    }, speed);
}

function initializeFormValidation() {
    const inputs = document.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

function validateField(field) {
    const formGroup = field.closest('.form-group');
    const value = field.value.trim();
    
    // Clear previous states
    formGroup.classList.remove('error', 'success');
    
    if (!value) {
        setFieldError(formGroup, 'Este campo é obrigatório.');
        return false;
    }
    
    if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            setFieldError(formGroup, 'Por favor, insira um e-mail válido.');
            return false;
        }
    }
    
    if (field.type === 'password' && value.length < 6) {
        setFieldError(formGroup, 'A senha deve ter pelo menos 6 caracteres.');
        return false;
    }
    
    formGroup.classList.add('success');
    return true;
}

function setFieldError(formGroup, message) {
    formGroup.classList.add('error');
    
    let errorElement = formGroup.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        formGroup.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
}

function clearFormErrors() {
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.classList.remove('error', 'success');
    });
    
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
}

function showFormError(message) {
    showNotification(message, 'error');
}

function showSuccessMessage(message) {
    showNotification(message, 'success');
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '16px 24px',
        borderRadius: '12px',
        color: 'white',
        fontWeight: '600',
        zIndex: '9999',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        maxWidth: '400px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
    });
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #10B981, #059669)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';
    } else if (type === 'info') {
        notification.style.background = 'linear-gradient(135deg, #3B82F6, #1D4ED8)';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

function initializeAnimations() {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.login-submit, .fill-credentials');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple-effect');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add floating animation to shapes with random timing
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach((shape, index) => {
        const randomDelay = Math.random() * 2;
        const randomDuration = 4 + Math.random() * 4;
        
        shape.style.animationDelay = `${randomDelay}s`;
        shape.style.animationDuration = `${randomDuration}s`;
    });
}

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: rippleAnimation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes rippleAnimation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Add loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// Handle forgot password links
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('forgot-password')) {
        e.preventDefault();
        showNotification('Funcionalidade de recuperação de senha será implementada em breve.', 'info');
    }
});


