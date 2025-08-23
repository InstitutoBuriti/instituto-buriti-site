"use strict";

/**
 * login.js — Instituto Buriti
 * - Login via Supabase Auth (resource owner password)
 * - Lida com lembrar login, validação visual, recuperação de senha
 * - Redireciona por papel (role) com base no token/jwt
 */

const SUPABASE_URL = "https://ngvljtxkinvygynwcckp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndmxqdHhraW52eWd5bndjY2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzIxNzksImV4cCI6MjA2NzkwODE3OX0.vwJgc2E_erC3giIofKiVY5ipYM2uRP8m9Yxy0fqE2yY";

// Mapeamento de dashboard por papel
const ROLE_REDIRECT = {
  admin: "/pages/dashboard-admin.html",
  instrutor: "/pages/dashboard-instrutor.html",
  financeiro: "/pages/dashboard-financeiro.html",
  suporte: "/pages/dashboard-suporte.html",
  parceiro: "/pages/dashboard-parceiro.html",
  aluno: "/pages/dashboard-aluno.html",
  default: "/pages/dashboard-aluno.html",
};

document.addEventListener("DOMContentLoaded", () => {
  console.info("[login.js] módulo carregado");
  initializeLoginForm();
  initializeAnimations();
  initializeFormValidation();
  initializeForgotPassword();
  initializeRememberLogin();
});

// ---------------- Inicializações ----------------
function initializeLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleLogin().catch((err) => {
      console.error("[login] erro não tratado:", err);
      showFormError("Ocorreu um erro inesperado. Tente novamente.");
      setLoading(false);
      setFormBusy(false);
    });
  });
}

function initializeForgotPassword() {
  // Abre modal
  const forgotPasswordLink = document.querySelector('a[href="#esqueci"], .forgot-password, a[onclick*="esqueci"]');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();
      showForgotPasswordModal();
    });
  }

  // Submete recuperação
  const forgotForm = document.getElementById("forgotForm");
  if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleForgot();
    });
  }

  // Botões de fechar modal
  document.querySelectorAll('[data-close="forgot-modal"]').forEach((btn) => {
    btn.addEventListener("click", hideForgotPasswordModal);
  });
}

function initializeRememberLogin() {
  const rememberCheckbox = document.getElementById("remember-login");
  const emailInput = document.getElementById("email");
  if (rememberCheckbox) {
    rememberCheckbox.checked = localStorage.getItem("rememberLogin") === "true";
  }
  if (emailInput && rememberCheckbox?.checked) {
    const rememberEmail = localStorage.getItem("rememberEmail");
    if (rememberEmail) emailInput.value = rememberEmail;
  }
  if (rememberCheckbox && emailInput) {
    rememberCheckbox.addEventListener("change", () => {
      localStorage.setItem("rememberLogin", rememberCheckbox.checked ? "true" : "false");
      if (!rememberCheckbox.checked) localStorage.removeItem("rememberEmail");
    });
    emailInput.addEventListener("blur", () => {
      if (rememberCheckbox.checked) localStorage.setItem("rememberEmail", emailInput.value.trim());
    });
  }
}

// ---------------- Login ----------------
async function handleLogin() {
  const form = document.getElementById("loginForm");
  if (!form) {
    console.warn("[login] formulário não encontrado");
    return;
  }
  const emailEl = form.querySelector("#email");
  const passEl = form.querySelector("#password");
  const email = (emailEl?.value || "").trim();
  const password = (passEl?.value || "").trim();

  if (!validateForm()) return;

  setLoading(true);
  setFormBusy(true);

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ email, password }),
      mode: "cors",
    });

    const payload = await readJsonSafe(response);

    if (!response.ok) {
      const msg =
        payload?.error_description ||
        payload?.msg ||
        payload?.message ||
        "Usuário ou senha inválidos";
      showFormError(msg);
      return;
    }

    persistSession(payload);

    const role = inferRoleFromSession(payload) || "aluno";

    if (document.getElementById("remember-login")?.checked) {
      localStorage.setItem("rememberLogin", "true");
      localStorage.setItem("rememberEmail", email);
    }

    const target = safeRedirect(getUrlParam("target"));
    const redirectUrl = target || ROLE_REDIRECT[role] || ROLE_REDIRECT.default;
    window.location.href = redirectUrl;
  } catch (err) {
    console.error("[login] network error:", err);
    showFormError("Erro de rede. Verifique sua conexão.");
  } finally {
    setLoading(false);
    setFormBusy(false);
  }
}

// ---------------- Recuperação de Senha ----------------
function showForgotPasswordModal() {
  const modal = document.getElementById("forgot-modal");
  if (modal) modal.style.display = "block";
}
function hideForgotPasswordModal() {
  const modal = document.getElementById("forgot-modal");
  if (modal) modal.style.display = "none";
}

async function handleForgot() {
  const email = (document.getElementById("forgot-email")?.value || "").trim();
  if (!email) {
    alert("Informe seu e-mail.");
    return;
  }

  try {
    const resp = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email }),
      mode: "cors",
    });

    const payload = await readJsonSafe(resp);

    if (!resp.ok) {
      alert(payload?.message || "Erro ao enviar e-mail de recuperação.");
      return;
    }

    alert("Enviamos um e-mail com o link de recuperação.");
    hideForgotPasswordModal();
  } catch {
    alert("Erro ao enviar e-mail.");
  }
}

// ---------------- Sessão / Util ----------------
function persistSession(data) {
  const remember = localStorage.getItem("rememberLogin") === "true";
  const storage = remember ? localStorage : sessionStorage;

  const now = Date.now();
  const expiresAt = now + (Number(data.expires_in || 3600) * 1000);

  storage.setItem("auth_token", data.access_token || "");
  if (data.refresh_token) storage.setItem("refresh_token", data.refresh_token);
  storage.setItem("auth_expires_at", String(expiresAt));

  if (data.user) {
    try {
      storage.setItem("auth_user", JSON.stringify(data.user));
    } catch {}
  }
}

/**
 * Tenta extrair um "role" útil:
 * - de user.app_metadata.role
 * - ou de user.user_metadata.role
 * - ou decodificando o JWT (claim 'role' ou app_metadata.role)
 */
function inferRoleFromSession(data) {
  const u = data?.user || {};
  const roleFromUser =
    u?.app_metadata?.role ||
    u?.user_metadata?.role ||
    u?.role;
  if (typeof roleFromUser === "string") return roleFromUser.toLowerCase();

  const token = data?.access_token;
  if (token && token.split(".").length === 3) {
    try {
      const [, payloadB64] = token.split(".");
      const json = JSON.parse(b64UrlToStr(payloadB64));
      const roleFromJwt =
        json?.app_metadata?.role ||
        json?.user_metadata?.role ||
        json?.role;
      if (typeof roleFromJwt === "string") return roleFromJwt.toLowerCase();
    } catch (_) {}
  }

  return "aluno";
}

function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function safeRedirect(url) {
  try {
    const u = new URL(url, window.location.origin);
    if (u.origin === window.location.origin && u.pathname.startsWith("/")) {
      return u.pathname + u.search + u.hash;
    }
  } catch (_) {}
  return null;
}

function b64UrlToStr(b64url) {
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);
  return atob(b64);
}

async function readJsonSafe(resp) {
  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

// ---------------- Auxiliares UI ----------------
function setLoading(isLoading) {
  const submitBtn = document.querySelector(".login-submit");
  if (!submitBtn) return;

  submitBtn.disabled = isLoading;

  const btnText = submitBtn.querySelector(".btn-text");
  if (btnText) {
    btnText.textContent = isLoading ? "Entrando..." : "Entrar";
  } else {
    submitBtn.textContent = isLoading ? "Entrando..." : "Entrar";
  }
}

function setFormBusy(busy) {
  const form = document.getElementById("loginForm");
  if (form) form.setAttribute("aria-busy", busy ? "true" : "false");
}

function showFormError(message) {
  const errorEl = document.querySelector(".form-error");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
  } else {
    alert(message);
  }
}

function validateForm() {
  const form = document.getElementById("loginForm");
  if (!form) return false;

  const inputs = form.querySelectorAll("input[required]");
  let valid = true;
  inputs.forEach((input) => {
    if (!input.value.trim()) {
      input.classList.add("is-invalid");
      input.classList.remove("is-valid");
      valid = false;
    } else {
      input.classList.remove("is-invalid");
      input.classList.add("is-valid");
    }
  });

  if (!valid) {
    showFormError("Preencha os campos obrigatórios.");
  }
  return valid;
}

// ---------------- Animações / Validação visual ----------------
function initializeAnimations() {
  const form = document.querySelector(".login-form");
  if (form) form.classList.add("fade-in");

  const inputs = document.querySelectorAll(".form-group input");
  inputs.forEach((input, i) => {
    input.style.animationDelay = `${i * 0.08}s`;
    input.classList.add("slide-up");
  });
}

function initializeFormValidation() {
  const inputs = document.querySelectorAll(".form-group input");
  inputs.forEach((input) => {
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => validateField(input));
  });
}

function validateField(field) {
  const value = (field.value || "").trim();
  const name = field.getAttribute("name") || field.id;

  field.classList.remove("is-invalid", "is-valid");

  if (name === "email" || field.id === "email") {
    if (!value || !isValidEmail(value)) {
      field.classList.add("is-invalid");
      return false;
    }
    field.classList.add("is-valid");
    return true;
  }
  if (name === "password" || field.id === "password") {
    if (!value) {
      field.classList.add("is-invalid");
      return false;
    }
    field.classList.add("is-valid");
    return true;
  }
  return true;
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}