/**
 * /js/login.js — Lógica do Formulário de Login - Instituto Buriti
 * Responsável por:
 * - Validação de campos do formulário de login.
 * - Gerenciamento do estado da UI (loading, erros).
 * - Comunicação com o Supabase para autenticação.
 * - Entrega dos dados da sessão para o authManager.
 */

(function() {
  "use strict";

  const SUPABASE_URL = "https://ngvljtxkinvygynwcckp.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndmxqdHhraW52eWd5bndjY2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzIxNzksImV4cCI6MjA2NzkwODE3OX0.vwJgc2E_erC3giIofKiVY5ipYM2uRP8m9Yxy0fqE2yY";
  const DEBUG_LOGIN = false; // Mude para true para ver logs detalhados

  const log = (...args) => DEBUG_LOGIN && console.log("[LoginScript]", ...args);
  const error = (...args) => DEBUG_LOGIN && console.error("[LoginScript]", ...args);
  
  // Mapeamento de dashboard por papel do usuário
  const ROLE_REDIRECT_MAP = {
      aluno: '/desktop/pages/dashboard-aluno.html',
      instrutor: '/desktop/pages/dashboard-instrutor.html',
      admin: '/desktop/pages/dashboard-admin.html',
      default: '/desktop/pages/dashboard-aluno.html'
  };

  document.addEventListener("DOMContentLoaded", () => {
      log("Inicializando script de login.");
      const loginForm = document.getElementById("loginForm");
      if (loginForm) {
          loginForm.addEventListener("submit", handleFormSubmit);
          initializeFormValidation(loginForm);
          initializeRememberLogin();
      } else {
          error("Formulário de login #loginForm não encontrado no DOM.");
      }
  });

  async function handleFormSubmit(event) {
      event.preventDefault();
      const form = event.currentTarget;
      const emailInput = form.querySelector("#email");
      const passwordInput = form.querySelector("#password");

      clearFormError(form);

      // Validação final antes de enviar
      if (!validateField(emailInput) || !validateField(passwordInput)) {
          showFormError(form, "Por favor, corrija os campos destacados.");
          return;
      }

      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      setLoadingState(form, true);

      try {
          log(`Tentando autenticar com o e-mail: ${email}`);
          const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "apikey": SUPABASE_ANON_KEY,
              },
              body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
              const errorMessage = data.error_description || "E-mail ou senha inválidos.";
              log("Falha na autenticação:", errorMessage);
              showFormError(form, errorMessage);
              setLoadingState(form, false);
              return;
          }

          log("Autenticação bem-sucedida. Salvando sessão...");
          if (window.authManager) {
              window.authManager.saveSession(data);
          } else {
              error("authManager global não encontrado! A sessão não pôde ser salva.");
              showFormError(form, "Erro crítico ao inicializar a sessão.");
              setLoadingState(form, false);
              return;
          }

          // Lógica de "Lembrar-me"
          handleRememberMe(email);

          const userRole = window.authManager.getUserRole() || 'aluno';
          const redirectUrl = ROLE_REDIRECT_MAP[userRole] || ROLE_REDIRECT_MAP.default;

          log(`Redirecionando para o dashboard: ${redirectUrl}`);
          window.location.href = redirectUrl;

      } catch (err) {
          error("Erro de rede durante o login:", err);
          showFormError(form, "Erro de conexão. Verifique sua internet e tente novamente.");
          setLoadingState(form, false);
      }
  }
  
  function initializeFormValidation(form) {
      const inputs = form.querySelectorAll("input[required]");
      inputs.forEach(input => {
          input.addEventListener('blur', () => validateField(input));
          input.addEventListener('input', () => {
              if(input.classList.contains('is-invalid')) {
                  validateField(input);
              }
          });
      });
  }
  
  function validateField(input) {
      let isValid = true;
      input.classList.remove('is-invalid');

      if (!input.value.trim()) {
          isValid = false;
      }

      if (input.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(input.value.trim())) {
              isValid = false;
          }
      }
      
      if (input.type === 'password' && input.value.trim().length < 6) {
          isValid = false;
      }

      if (!isValid) {
          input.classList.add('is-invalid');
      }
      
      return isValid;
  }
  
  function initializeRememberLogin() {
      const rememberCheckbox = document.getElementById("remember-login");
      const emailInput = document.getElementById("email");
      if (rememberCheckbox && localStorage.getItem("rememberLogin") === "true") {
          rememberCheckbox.checked = true;
          if (emailInput) {
              emailInput.value = localStorage.getItem("rememberEmail") || "";
          }
      }
  }

  function handleRememberMe(email) {
      const rememberCheckbox = document.getElementById("remember-login");
      if (rememberCheckbox && rememberCheckbox.checked) {
          localStorage.setItem("rememberLogin", "true");
          localStorage.setItem("rememberEmail", email);
      } else {
          localStorage.removeItem("rememberLogin");
          localStorage.removeItem("rememberEmail");
      }
  }
  
  // --- Funções de UI ---

  function setLoadingState(form, isLoading) {
      const button = form.querySelector(".login-submit");
      if (button) {
          button.disabled = isLoading;
          if (isLoading) {
              button.classList.add('loading');
          } else {
              button.classList.remove('loading');
          }
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
  
  // --- Funções Auxiliares ---

  window.fillTestCredentialsHandler = function() {
      log("Preenchendo credenciais de teste.");
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
      
      if (emailInput && passwordInput) {
          emailInput.value = 'aluno@teste.com';
          passwordInput.value = 'aluno123';
          validateField(emailInput);
          validateField(passwordInput);
      }
  };

})();