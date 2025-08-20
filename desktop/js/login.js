/* /js/login.js — SUBSTITUIÇÃO TOTAL
   Login com Supabase (REST), recuperação de senha e “lembrar-me”
   Requisitos no HTML:
   - <form id="loginForm"> com inputs #email, #password e botão .login-submit > .btn-text
   - (opcional) checkbox #remember-login
   - este script referenciado por caminho ABSOLUTO: <script src="/js/login.js?v=2025-08-17-1" type="module" defer></script>
*/
"use strict";

const SUPABASE_URL = "https://ngvljtxkinvygynwcckp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndmxqdHhraW52eWd5bndjY2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzIxNzksImV4cCI6MjA2NzkwODE3OX0.vwJgc2E_erC3giIofKiVY5ipYM2uRP8m9Yxy0fqE2yY";

// ---------------- Boot ----------------
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
    });
  });
}

function initializeForgotPassword() {
  const forgotPasswordLink = document.querySelector('a[href="#esqueci"], .forgot-password, a[onclick*="esqueci"]');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();
      showForgotPasswordModal();
    });
  }
}

function initializeRememberLogin() {
  const rememberCheckbox = document.getElementById("remember-login");
  if (!rememberCheckbox) return;

  // Pré-preenche apenas o e-mail (evitar salvar senha em claro)
  const savedEmail = localStorage.getItem("remembered_email");
  if (savedEmail) {
    const emailField = document.getElementById("email");
    if (emailField) {
      emailField.value = savedEmail;
      rememberCheckbox.checked = true;
    }
  }
}

// ---------------- Login ----------------
async function handleLogin() {
  clearFormErrors();

  const emailEl = document.getElementById("email");
  const passEl  = document.getElementById("password");

  const email = (emailEl?.value || "").trim();
  const password = passEl?.value || "";

  if (!email) {
    showFormError("Por favor, informe seu e-mail.");
    return;
  }
  if (!isValidEmail(email)) {
    showFormError("E-mail inválido.");
    return;
  }
  if (!password) {
    showFormError("Por favor, informe sua senha.");
    return;
  }

  setLoading(true, "Entrando...");

  // Chamada REST oficial: password grant
  const url = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
  const headers = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
  };

  const body = JSON.stringify({ email, password });

  let resp, data;
  try {
    resp = await fetch(url, { method: "POST", headers, body });
  } catch (networkErr) {
    console.error("[login] erro de rede:", networkErr);
    showFormError("Falha de conexão. Verifique sua internet e tente novamente.");
    setLoading(false);
    return;
  }

  try {
    data = await resp.json();
  } catch {
    data = null;
  }

  if (!resp.ok) {
    const msg =
      data?.error_description ||
      data?.error ||
      (resp.status === 401 ? "Credenciais inválidas." : "Não foi possível autenticar.");
    console.warn("[login] falha:", resp.status, data);
    showFormError(msg);
    setLoading(false);
    return;
  }

  // Sucesso: tokens e usuário
  const { access_token, refresh_token, user } = data || {};
  console.debug("[login] sucesso:", { hasAccessToken: !!access_token, user });

  // Persistência de sessão
  const remember = !!document.getElementById("remember-login")?.checked;
  persistSession({ access_token, refresh_token, user, email, remember });

  showSuccessMessage("Login realizado com sucesso!");
  setTimeout(() => redirectToDashboard(), 800);
}

// ---------------- Recuperação de Senha ----------------
function showForgotPasswordModal() {
  // Se já existe, só abre
  let modal = document.getElementById("forgotPasswordModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "forgotPasswordModal";
    modal.className = "modal";
    modal.style.cssText = `
      display:none; position:fixed; inset:0; z-index:1000;
      background:rgba(0,0,0,.5);
    `;
    modal.innerHTML = `
      <div class="modal-content" style="
        background:#fff; margin:10% auto; padding:20px; border-radius:12px;
        width:92%; max-width:420px; box-shadow:0 10px 30px rgba(0,0,0,.25);
      ">
        <button class="close" aria-label="Fechar" style="
          border:none; background:transparent; font-size:26px; float:right; cursor:pointer;
        ">&times;</button>
        <h2 style="margin:0 0 8px">Recuperação de Senha</h2>
        <p style="margin:0 0 16px; color:#555">Informe seu e-mail para receber o link de redefinição.</p>
        <form id="forgotPasswordForm">
          <label for="recovery-email" style="display:block; margin-bottom:6px">E-mail</label>
          <input type="email" id="recovery-email" required placeholder="seu@email.com" style="
            width:100%; padding:10px 12px; border:1px solid #ddd; border-radius:8px; margin-bottom:14px;
          ">
          <button type="submit" style="
            width:100%; padding:10px 14px; background:#2563eb; color:#fff; border:none; border-radius:8px; cursor:pointer;
          ">Enviar</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector(".close").addEventListener("click", () => (modal.style.display = "none"));
    window.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

    modal.querySelector("#forgotPasswordForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("recovery-email").value.trim();
      if (!isValidEmail(email)) {
        showNotification("Informe um e-mail válido.", "error");
        return;
      }
      try {
        const resp = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ email }),
        });
        if (!resp.ok) {
          const j = await resp.json().catch(() => ({}));
          console.warn("[recover] falha:", resp.status, j);
          showNotification(j?.error_description || "Não foi possível iniciar a recuperação.", "error");
        } else {
          showNotification("Se o e-mail existir, o link de recuperação foi enviado.", "success");
          modal.style.display = "none";
        }
      } catch (err) {
        console.error("[recover] erro de rede:", err);
        showNotification("Falha de conexão. Tente novamente.", "error");
      }
    });
  }
  modal.style.display = "block";
}

// ---------------- Utilidades de Sessão/Redirect ----------------
function persistSession({ access_token, refresh_token, user, email, remember }) {
  const storage = remember ? localStorage : sessionStorage;
  try {
    storage.setItem("sb_access_token", access_token || "");
    storage.setItem("sb_refresh_token", refresh_token || "");
    storage.setItem("sb_user_email", email || user?.email || "");
  } catch (e) {
    console.warn("[login] não foi possível salvar sessão:", e);
  }

  // “Lembrar-me”: só e-mail (nunca senha)
  if (remember) {
    try {
      localStorage.setItem("remembered_email", email || user?.email || "");
    } catch {}
  } else {
    try { localStorage.removeItem("remembered_email"); } catch {}
  }
}

// Redireciona pelo contexto da página de login atual
function redirectToDashboard() {
  const path = (location.pathname || "").toLowerCase();

  showNotification("Redirecionando para o Dashboard...", "info");

  let target = "/pages/dashboard-aluno.html";
  if (path.includes("login-admin.html"))      target = "/pages/dashboard-admin.html";
  else if (path.includes("login-instrutor"))  target = "/pages/dashboard-instrutor.html";
  else if (path.includes("login-aluno"))      target = "/pages/dashboard-aluno.html";

  // fallback de segurança após 1s
  setTimeout(() => (window.location.href = target), 1000);
}

// ---------------- UI helpers ----------------
function setLoading(on, label = "Entrar") {
  const submitBtn = document.querySelector(".login-submit");
  const btnText = document.querySelector(".btn-text") || submitBtn;
  if (!submitBtn || !btnText) return;

  submitBtn.disabled = !!on;
  if (on) {
    submitBtn.classList.add("loading");
    btnText.textContent = label;
  } else {
    submitBtn.classList.remove("loading");
    btnText.textContent = "Entrar";
  }
}

function clearFormErrors() {
  const el = document.querySelector(".form-error");
  if (el) {
    el.textContent = "";
    el.style.display = "none";
  }
}

function showFormError(message) {
  let el = document.querySelector(".form-error");
  if (!el) {
    el = document.createElement("div");
    el.className = "form-error";
    el.style.cssText = `
      color:#dc3545;background:#f8d7da;border:1px solid #f5c6cb;border-radius:8px;
      padding:10px;margin:10px 0;font-size:14px;
    `;
    document.getElementById("loginForm")?.appendChild(el);
  }
  el.textContent = message;
  el.style.display = "block";
}

function showSuccessMessage(message) {
  let el = document.querySelector(".form-success");
  if (!el) {
    el = document.createElement("div");
    el.className = "form-success";
    el.style.cssText = `
      color:#155724;background:#d4edda;border:1px solid #c3e6cb;border-radius:8px;
      padding:10px;margin:10px 0;font-size:14px;
    `;
    document.getElementById("loginForm")?.appendChild(el);
  }
  el.textContent = message;
  el.style.display = "block";
  setTimeout(() => (el.style.display = "none"), 3000);
}

function showNotification(message, type = "info") {
  const bg =
    type === "success" ? "#28a745" :
    type === "error"   ? "#dc3545" :
    type === "warning" ? "#ffc107" : "#2563eb";

  const n = document.createElement("div");
  n.className = `notification ${type}`;
  n.style.cssText = `
    position:fixed; top:20px; right:20px; padding:14px 20px; color:#fff; background:${bg};
    border-radius:10px; box-shadow:0 6px 18px rgba(0,0,0,.2); z-index:9999;
    opacity:0; transform:translateY(-12px); transition:opacity .25s, transform .25s; max-width:320px;
  `;
  n.innerHTML = `<div class="notification-content">${message}</div>`;
  document.body.appendChild(n);
  requestAnimationFrame(() => { n.style.opacity = "1"; n.style.transform = "translateY(0)"; });
  setTimeout(() => {
    n.style.opacity = "0"; n.style.transform = "translateY(-12px)";
    setTimeout(() => n.remove(), 300);
  }, 3200);
}

// ---------------- Animações / Validação visual ----------------
function initializeAnimations() {
  const form = document.querySelector(".login-form");
  if (form) form.classList.add("fade-in");

  const inputs = document.querySelectorAll(".form-control");
  inputs.forEach((input, i) => {
    input.style.animationDelay = `${i * 0.08}s`;
    input.classList.add("slide-up");
  });
}

function initializeFormValidation() {
  const inputs = document.querySelectorAll(".form-control");
  inputs.forEach((input) => {
    input.addEventListener("blur",  () => validateField(input));
    input.addEventListener("input", () => validateField(input));
  });
}

function validateField(field) {
  const value = (field.value || "").trim();
  const name = field.getAttribute("name") || field.id;

  field.classList.remove("is-invalid", "is-valid");

  if (name === "email" || field.id === "email") {
    if (!value || !isValidEmail(value)) { field.classList.add("is-invalid"); return false; }
    field.classList.add("is-valid"); return true;
  }
  if (name === "password" || field.id === "password") {
    if (!value) { field.classList.add("is-invalid"); return false; }
    field.classList.add("is-valid"); return true;
  }
  return true;
}

function isValidEmail(email) {
  // regex simples e robusta
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

// ---------------- Nota ----------------
// Caso exista algum AuthManager legado, mantenha desativado para evitar conflito:
// window.authManager = new AuthManager();  // <- NÃO usar enquanto estivermos no fluxo Supabase REST.
