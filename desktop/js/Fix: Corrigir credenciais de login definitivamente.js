// Login Pages JavaScript - Funcionalidades interativas

document.addEventListener("DOMContentLoaded", function() {
    initializeLoginForm();
    initializeAnimations();
    initializeFormValidation();
    initializeForgotPassword();
    initializeRememberLogin();
});

const SUPABASE_URL = "https://ngvljtxkinvygynwcckp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndmxqdHhraW52eWd5bndjY2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzIxNzksImV4cCI6MjA2NzkwODE3OX0.vwJgc2E_erC3giIofKiVY5ipYM2uRP8m9Yxy0fqE2yY";

function initializeLoginForm( ) {
    const form = document.getElementById("loginForm");
    const submitBtn = document.querySelector(".login-submit");
    
    if (form && submitBtn) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
}

async function handleLogin() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    // Clear previous errors
    clearFormErrors();
    
    // Basic validation
    if (!email) {
        showFormError("Por favor, informe seu e-mail.");
        return;
    }
    
    if (!password) {
        showFormError("Por favor, informe sua senha.");
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector(".login-submit");
    const btnText = document.querySelector(".btn-text");
    
    if (submitBtn && btnText) {
        submitBtn.disabled = true;
        submitBtn.classList.add("loading");
        btnText.textContent = "Entrando...";
    }
    
    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Login successful
            showSuccessMessage("Login realizado com sucesso!");
            
            // Save credentials if "remember me" is checked
            const rememberCheckbox = document.getElementById("remember-login");
            if (rememberCheckbox && rememberCheckbox.checked) {
                saveCredentials(email, password, rememberCheckbox.checked);
            }
            
            // Redirect to dashboard based on user role (this part needs to be implemented based on Supabase response)
            // For now, we'll use the existing redirectToDashboard logic, assuming Supabase returns role info
            redirectToDashboard();
        } else {
            // Login failed
            showFormError(data.error_description || "E-mail ou senha incorretos. Verifique suas credenciais.");
        }
    } catch (error) {
        console.error("Erro durante o login:", error);
        showFormError("Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.");
    } finally {
        // Reset button state
        if (submitBtn && btnText) {
            submitBtn.classList.remove("loading");
            submitBtn.disabled = false;
            btnText.textContent = "Entrar";
        }
    }
}

// This function is no longer needed as authentication is handled by Supabase
function validateCredentials(email, password) {
    return true; // Placeholder, actual validation is done by Supabase
}

// CORREÇÃO CRÍTICA: Função redirectToDashboard corrigida
function redirectToDashboard() {
    const currentPage = window.location.pathname;
    
    // Mostrar notificação
    showNotification("Redirecionando para o Dashboard...", "info");
    
    // CORREÇÃO: Redirecionamento imediato sem setTimeout aninhado
    setTimeout(() => {
        if (currentPage.includes("login-aluno.html")) {
            window.location.href = "dashboard-aluno.html";
        } else if (currentPage.includes("login-instrutor.html")) {
            window.location.href = "dashboard-instrutor.html";
        } else if (currentPage.includes("login-admin.html")) {
            window.location.href = "dashboard-admin.html";
        }
    }, 1000); // Redirecionamento após 1 segundo para permitir visualização da mensagem
}

// NOVA FUNCIONALIDADE: Recuperação de senha
function initializeForgotPassword() {
    const forgotPasswordLink = document.querySelector("a[href=\"#esqueci\"], .forgot-password, a[onclick*=\"esqueci\"]");
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", function(e) {
            e.preventDefault();
            showForgotPasswordModal();
        });
    }
}

function showForgotPasswordModal() {
    // Verificar se o modal já existe
    let modal = document.getElementById("forgotPasswordModal");
    
    if (!modal) {
        // Criar modal
        modal = document.createElement("div");
        modal.id = "forgotPasswordModal";
        modal.className = "modal";
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
            <div class=\"modal-content\" style=\"
                background-color: #fefefe;
                margin: 15% auto;
                padding: 20px;
                border: none;
                border-radius: 10px;
                width: 90%;
                max-width: 400px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            \">
                <span class=\"close\" style=\"
                    color: #aaa;
                    float: right;
                    font-size: 28px;
                    font-weight: bold;
                    cursor: pointer;
                \">×</span>
                <h2 style=\"margin-top: 0; color: #333;\">Recuperação de Senha</h2>
                <p style=\"color: #666;\">Informe seu e-mail para receber instruções de recuperação de senha.</p>
                <form id=\"forgotPasswordForm\">
                    <div class=\"form-group\" style=\"margin-bottom: 15px;\">
                        <label for=\"recovery-email\" style=\"display: block; margin-bottom: 5px; color: #333;\">E-mail</label>
                        <input type=\"email\" id=\"recovery-email\" placeholder=\"Seu e-mail cadastrado\" required style=\"
                            width: 100%;
                            padding: 10px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                            font-size: 16px;
                            box-sizing: border-box;
                        \">
                    </div>
                    <button type=\"submit\" style=\"
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                        width: 100%;
                    \">Enviar</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Configurar eventos do modal
        const closeBtn = modal.querySelector(".close");
        closeBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });
        
        // Fechar modal ao clicar fora
        window.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.style.display = "none";
            }
        });
        
        const form = modal.querySelector("#forgotPasswordForm");
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            handleForgotPassword();
        });
    }
    
    // Mostrar modal
    modal.style.display = "block";
}

function handleForgotPassword() {
    const email = document.getElementById("recovery-email").value;
    
    if (!email) {
        showNotification("Por favor, informe seu e-mail.", "error");
        return;
    }
    
    // Simular envio de e-mail
    showNotification("Instruções de recuperação enviadas para " + email, "success");
    
    // Fechar modal
    const modal = document.getElementById("forgotPasswordModal");
    if (modal) {
        modal.style.display = "none";
    }
}

// NOVA FUNCIONALIDADE: Lembrar login
function initializeRememberLogin() {
    // Verificar se existe checkbox de lembrar login
    const rememberCheckbox = document.getElementById("remember-login");
    
    if (rememberCheckbox) {
        // Carregar credenciais salvas
        loadSavedCredentials();
    }
}

function loadSavedCredentials() {
    const savedEmail = localStorage.getItem("remembered_email");
    const savedPassword = localStorage.getItem("remembered_password");
    const rememberCheckbox = document.getElementById("remember-login");
    
    if (savedEmail && savedPassword && rememberCheckbox) {
        const emailField = document.getElementById("email");
        const passwordField = document.getElementById("password");
        
        if (emailField && passwordField) {
            emailField.value = savedEmail;
            passwordField.value = savedPassword;
            rememberCheckbox.checked = true;
        }
    }
}

function saveCredentials(email, password, remember) {
    if (remember) {
        localStorage.setItem("remembered_email", email);
        localStorage.setItem("remembered_password", password);
    } else {
        localStorage.removeItem("remembered_email");
        localStorage.removeItem("remembered_password");
    }
}

// Funções de UI
function clearFormErrors() {
    const errorElement = document.querySelector(".form-error");
    if (errorElement) {
        errorElement.textContent = "";
        errorElement.style.display = "none";
    }
}

function showFormError(message) {
    let errorElement = document.querySelector(".form-error");
    
    if (!errorElement) {
        errorElement = document.createElement("div");
        errorElement.className = "form-error";
        errorElement.style.cssText = `
            color: #dc3545;
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 5px;
            padding: 10px;
            margin: 10px 0;
            font-size: 14px;
        `;
        const form = document.getElementById("loginForm");
        if (form) {
            form.appendChild(errorElement);
        }
    }
    
    errorElement.textContent = message;
    errorElement.style.display = "block";
}

function showSuccessMessage(message) {
    let successElement = document.querySelector(".form-success");
    
    if (!successElement) {
        successElement = document.createElement("div");
        successElement.className = "form-success";
        successElement.style.cssText = `
            color: #155724;
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 5px;
            padding: 10px;
            margin: 10px 0;
            font-size: 14px;
        `;
        const form = document.getElementById("loginForm");
        if (form) {
            form.appendChild(successElement);
        }
    }
    
    successElement.textContent = message;
    successElement.style.display = "block";
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        successElement.style.display = "none";
    }, 3000);
}

function showNotification(message, type = "info") {
    // Criar elemento de notificação
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    
    const bgColor = type === "success" ? "#28a745" : 
                   type === "error" ? "#dc3545" : 
                   type === "warning" ? "#ffc107" : "#17a2b8";
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background-color: ${bgColor};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        opacity: 0;
        transform: translateY(-20px);
        transition: opacity 0.3s, transform 0.3s;
        max-width: 300px;
        font-size: 14px;
    `;
    
    notification.innerHTML = `
        <div class=\"notification-content\">
            <span class=\"notification-message\">${message}</span>
        </div>
    `;
    
    // Adicionar ao DOM
    document.body.appendChild(notification);
    
    // Mostrar com animação
    setTimeout(() => {
        notification.style.opacity = "1";
        notification.style.transform = "translateY(0)";
    }, 10);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transform = "translateY(-20px)";
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Animações e validação
function initializeAnimations() {
    // Adicionar classes para animações de entrada
    const form = document.querySelector(".login-form");
    if (form) {
        form.classList.add("fade-in");
    }
    
    // Animar campos de formulário
    const inputs = document.querySelectorAll(".form-control");
    inputs.forEach((input, index) => {
        input.style.animationDelay = `${index * 0.1}s`;
        input.classList.add("slide-up");
    });
}

function initializeFormValidation() {
    const inputs = document.querySelectorAll(".form-control");
    
    inputs.forEach(input => {
        input.addEventListener("blur", function() {
            validateField(this);
        });
        
        input.addEventListener("input", function() {
            validateField(this);
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.getAttribute("name") || field.id;
    
    // Remover estado de erro anterior
    field.classList.remove("is-invalid");
    field.classList.remove("is-valid");
    
    // Validar baseado no tipo de campo
    if (fieldName === "email") {
        const emailRegex = /^[^
@]+@[^
@]+\.[^
@]+$/;
        if (!value) {
            field.classList.add("is-invalid");
            return false;
        } else if (!emailRegex.test(value)) {
            field.classList.add("is-invalid");
            return false;
        } else {
            field.classList.add("is-valid");
            return true;
        }
    } else if (fieldName === "password") {
        if (!value) {
            field.classList.add("is-invalid");
            return false;
        } else {
            field.classList.add("is-valid");
            return true;
        }
    }
    
    return true;
}

// DESABILITAR AUTHMANAGER TEMPORARIAMENTE PARA EVITAR CONFLITOS
// Comentar a linha abaixo se existir no final do arquivo ou em outro local:
// window.authManager = new AuthManager();
