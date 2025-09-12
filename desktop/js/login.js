/**
 * /js/login.js — Lógica Unificada para Formulários de Login - Instituto Buriti
 * - Validação de campos.
 * - Gerenciamento de UI (loading, erros).
 * - Comunicação com Supabase para autenticação.
 * - Lógica para recuperação de senha.
 */
(function() {
    "use strict";

    // As chaves do Supabase devem ser mantidas aqui, pois são chaves públicas (anon)
    const SUPABASE_URL = "https://ngvljtxkinvygynwcckp.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndmxqdHhraW52eWd5bndjY2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzIxNzksImV4cCI6MjA2NzkwODE3OX0.vwJgc2E_erC3giIofKiVY5ipYM2uRP8m9Yxy0fqE2yY";
    
    // Mapeamento de redirecionamento por perfil de usuário
    const ROLE_REDIRECT_MAP = {
        aluno: 'dashboard-aluno.html',
        instrutor: 'dashboard-instrutor.html',
        admin: 'dashboard-admin.html',
        default: 'dashboard-aluno.html' // Redirecionamento padrão
    };

    // Inicializa os scripts quando o conteúdo da página é carregado
    document.addEventListener("DOMContentLoaded", () => {
        // Inicializa o cliente Supabase globalmente
        if (window.supabase) {
            window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } else {
            console.error("Supabase client não pôde ser inicializado.");
        }
        
        const loginForm = document.getElementById("loginForm");
        if (loginForm) {
            loginForm.addEventListener("submit", handleFormSubmit);
            initializeFormValidation(loginForm);
            initializeRememberLogin();
        }
        initializePasswordRecovery();
    });

    /**
     * Lida com a submissão do formulário de login.
     */
    async function handleFormSubmit(event) {
        event.preventDefault(); // Previne o envio padrão do formulário (que usa GET)
        const form = event.currentTarget;
        const emailInput = form.querySelector("#email");
        const passwordInput = form.querySelector("#password");

        clearFormError(form);

        if (!validateField(emailInput) || !validateField(passwordInput)) {
            showFormError(form, "Por favor, corrija os campos destacados.");
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        setLoadingState(form, true);

        try {
            if (!window.supabaseClient) throw new Error("Cliente Supabase não está pronto.");

            const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });

            if (error) throw error;
            
            if (window.authManager) {
                window.authManager.saveSession(data.session);
            } else {
                throw new Error("Erro crítico: gerenciador de autenticação não encontrado.");
            }

            handleRememberMe(email);

            const userRole = window.authManager.getUserRole() || 'aluno';
            const redirectUrl = ROLE_REDIRECT_MAP[userRole] || ROLE_REDIRECT_MAP.default;
            
            window.location.href = redirectUrl;

        } catch (err) {
            showFormError(form, err.message || "E-mail ou senha inválidos.");
            setLoadingState(form, false);
        }
    }

    /**
     * Inicializa a funcionalidade de recuperação de senha.
     */
    function initializePasswordRecovery() {
        const modal = document.getElementById('forgotPasswordModal');
        const forgotLinks = document.querySelectorAll('.forgot-password');
        const closeModalButtons = modal?.querySelectorAll('.close-modal');
        const forgotForm = document.getElementById('forgotPasswordForm');

        if (!modal || !forgotLinks.length || !forgotForm) return;

        const showModal = () => modal.style.display = 'flex';
        const hideModal = () => modal.style.display = 'none';

        forgotLinks.forEach(link => link.addEventListener('click', (e) => {
            e.preventDefault();
            showModal();
        }));

        closeModalButtons?.forEach(btn => btn.addEventListener('click', hideModal));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideModal();
        });

        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const feedbackEl = forgotForm.querySelector('.form-feedback');
            const email = forgotForm.querySelector('#forgot-email').value;
            const submitButton = forgotForm.querySelector('button[type="submit"]');

            feedbackEl.textContent = 'Enviando...';
            feedbackEl.style.color = 'inherit';
            submitButton.disabled = true;

            try {
                if (!window.supabaseClient) throw new Error("Cliente Supabase não está pronto.");

                // A URL de redirecionamento deve apontar para uma página que você criará para o usuário definir a nova senha.
                const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin + '/desktop/pages/reset-password.html'
                });

                if (error) throw error;
                
                feedbackEl.textContent = 'Link de recuperação enviado! Verifique seu e-mail.';
                feedbackEl.style.color = 'green';
            } catch (err) {
                feedbackEl.textContent = err.message || 'Falha ao enviar e-mail. Verifique o endereço digitado.';
                feedbackEl.style.color = 'red';
            } finally {
                submitButton.disabled = false;
            }
        });
    }
    
    // --- Demais funções auxiliares ---
    function initializeFormValidation(form) {
        const inputs = form.querySelectorAll("input[required]");
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('is-invalid')) validateField(input);
            });
        });
    }
    
    function validateField(input) {
        let isValid = true;
        input.classList.remove('is-invalid');
        if (!input.value.trim()) isValid = false;
        if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) isValid = false;
        if (input.type === 'password' && input.getAttribute('minlength') && input.value.trim().length < parseInt(input.getAttribute('minlength'), 10)) isValid = false;
        if (!isValid) input.classList.add('is-invalid');
        return isValid;
    }
    
    function initializeRememberLogin() {
        const rememberCheckbox = document.getElementById("remember-login");
        const emailInput = document.getElementById("email");
        if (rememberCheckbox && localStorage.getItem("rememberLogin") === "true") {
            rememberCheckbox.checked = true;
            if (emailInput) emailInput.value = localStorage.getItem("rememberEmail") || "";
        }
    }

    function handleRememberMe(email) {
        const rememberCheckbox = document.getElementById("remember-login");
        if (rememberCheckbox?.checked) {
            localStorage.setItem("rememberLogin", "true");
            localStorage.setItem("rememberEmail", email);
        } else {
            localStorage.removeItem("rememberLogin");
            localStorage.removeItem("rememberEmail");
        }
    }

    function setLoadingState(form, isLoading) {
        const button = form.querySelector(".login-submit");
        if (button) {
            button.disabled = isLoading;
            button.classList.toggle('loading', isLoading);
        }
    }

    function showFormError(form, message) {
        const errorElement = form.querySelector(".form-error");
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = "block";
        }
    }

    function clearFormError(form) {
        const errorElement = form.querySelector(".form-error");
        if (errorElement) {
            errorElement.textContent = "";
            errorElement.style.display = "none";
        }
    }
    
    window.fillTestCredentialsHandler = function(email, password) {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        if (emailInput && passwordInput) {
            emailInput.value = email || 'aluno@teste.com';
            passwordInput.value = password || 'aluno123';
            validateField(emailInput);
            validateField(passwordInput);
        }
    };
})();