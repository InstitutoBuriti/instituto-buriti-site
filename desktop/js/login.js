/**
 * /js/login.js — Lógica do Formulário de Login - Instituto Buriti
 */
(function() {
  "use strict";

  const SUPABASE_URL = "https://ngvljtxkinvygynwcckp.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndmxqdHhraW52eWd5bndjY2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzIxNzksImV4cCI6MjA2NzkwODE3OX0.vwJgc2E_erC3giIofKiVY5ipYM2uRP8m9Yxy0fqE2yY";
  
  const ROLE_REDIRECT_MAP = {
      aluno: 'dashboard-aluno.html',
      instrutor: 'dashboard-instrutor.html',
      admin: 'dashboard-admin.html',
      default: 'dashboard-aluno.html'
  };

  document.addEventListener("DOMContentLoaded", () => {
      const loginForm = document.getElementById("loginForm");
      if (loginForm) {
          loginForm.addEventListener("submit", handleFormSubmit);
          initializeFormValidation(loginForm);
          initializeRememberLogin();
      }
  });

  async function handleFormSubmit(event) {
      event.preventDefault();
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
              showFormError(form, errorMessage);
              setLoadingState(form, false);
              return;
          }

          if (window.authManager) {
              window.authManager.saveSession(data);
          } else {
              showFormError(form, "Erro crítico ao inicializar a sessão.");
              setLoadingState(form, false);
              return;
          }

          handleRememberMe(email);

          const userRole = window.authManager.getUserRole() || 'aluno';
          const redirectUrl = ROLE_REDIRECT_MAP[userRole] || ROLE_REDIRECT_MAP.default;
          
          window.location.href = redirectUrl;

      } catch (err) {
          showFormError(form, "Erro de conexão. Verifique sua internet e tente novamente.");
          setLoadingState(form, false);
      }
  }
  
  function initializeFormValidation(form) {
      const inputs = form.querySelectorAll("input[required]");
      inputs.forEach(input => {
          input.addEventListener('blur', () => validateField(input));
          input.addEventListener('input', () => {
              if(input.classList.contains('is-invalid')) validateField(input);
          });
      });
  }
  
  function validateField(input) {
      let isValid = true;
      input.classList.remove('is-invalid');
      if (!input.value.trim()) isValid = false;
      if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) isValid = false;
      if (input.type === 'password' && input.value.trim().length < 6) isValid = false;
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

  window.fillTestCredentialsHandler = function() {
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