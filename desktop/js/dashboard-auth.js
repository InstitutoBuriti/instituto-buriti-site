/* /js/dashboard-auth.js
   Proteção e sessão dos dashboards (aluno, instrutor, admin)
   - Verifica autenticação
   - Aplica guarda por perfil (role)
   - Preenche nome/role dinamicamente
   - Centraliza logout
   - Remove anti-flash (html[data-auth="checking"]) quando pronto
*/
(() => {
  'use strict';

  // --- Config ---
  const DEFAULT_LOGIN_BY_ROLE = {
    aluno: '/pages/login-aluno.html',
    instrutor: '/pages/login-instrutor.html',
    admin: '/pages/login-admin.html',
  };
  const FALLBACK_LOGIN = '/pages/login-aluno.html';

  // --- Helpers ---
  const $all = (sel) => Array.from(document.querySelectorAll(sel));
  const lower = (s) => String(s || '').trim().toLowerCase();

  function inferRoleFromPath() {
    const p = location.pathname.toLowerCase();
    if (p.includes('admin')) return 'admin';
    if (p.includes('instrutor') || p.includes('prof') || p.includes('teacher')) return 'instrutor';
    return 'aluno';
  }

  function getExpectedRole() {
    // 1) Se o body declarar explicitamente
    const bodyRole = document.body?.getAttribute('data-dashboard-role');
    if (bodyRole) return lower(bodyRole);
    // 2) Inferir pelo path como fallback
    return inferRoleFromPath();
  }

  // Normaliza estrutura do usuário salva pelo login (role/type)
  function normalizeUser(raw) {
    if (!raw) return null;
    const role = lower(raw.role || raw.type || raw.user_type || '');
    const name = raw.name || raw.full_name || raw.username || raw.email || 'Usuário';
    const email = raw.email || raw.user_email || null;
    return { ...raw, role: role || 'aluno', name, email };
  }

  // Preferir AuthManager quando existir; caso contrário, localStorage
  function readUser() {
    try {
      if (window.authManager && typeof window.authManager.getUser === 'function') {
        const u = window.authManager.getUser();
        return normalizeUser(u);
      }
    } catch { /* noop */ }

    try {
      const raw = localStorage.getItem('user_data');
      return normalizeUser(raw ? JSON.parse(raw) : null);
    } catch {
      localStorage.removeItem('user_data');
      return null;
    }
  }

  function hasValidSession() {
    if (window.authManager && typeof window.authManager.isAuthenticated === 'function') {
      try { return !!window.authManager.isAuthenticated(); } catch { return false; }
    }
    // Fallback simples
    return !!(localStorage.getItem('auth_token') || localStorage.getItem('auth_session'));
  }

  function loginURLForRole(role) {
    return DEFAULT_LOGIN_BY_ROLE[role] || FALLBACK_LOGIN;
  }

  function goToLogin(preferredRole) {
    const url = loginURLForRole(preferredRole || inferRoleFromPath());
    window.location.assign(url);
  }

  // --- Guard ---
  function guard({ allowRoles = null } = {}) {
    const authed = hasValidSession();
    const user = readUser();

    if (!authed || !user) {
      goToLogin(Array.isArray(allowRoles) && allowRoles.length ? allowRoles[0] : inferRoleFromPath());
      return false;
    }

    const allowed = Array.isArray(allowRoles) ? allowRoles.map(lower) : null;
    const role = lower(user.role) || 'aluno';

    if (allowed && allowed.length && !allowed.includes(role)) {
      // Logado, mas no dashboard errado → levar ao login do seu papel real
      window.location.assign(loginURLForRole(role));
      return false;
    }
    return true;
  }

  // --- Render user info ---
  function renderUserInfo() {
    const user = readUser();
    if (!user) return;

    // Nome
    [...$all('.user-name'), ...$all('.login-btn'), ...$all('[data-user-name]')].forEach(el => {
      if (el && !el.hasAttribute('data-static')) {
        el.textContent = user.name || user.email || 'Usuário';
      }
    });

    // Papel
    const role = lower(user.role);
    let roleLabel = 'Usuário';
    if (role === 'aluno') roleLabel = 'Aluna(o)';
    if (role === 'instrutor') roleLabel = 'Instrutor(a)';
    if (role === 'admin') roleLabel = 'Administrador(a)';

    [...$all('.user-role'), ...$all('[data-user-role]')].forEach(el => {
      if (el && !el.hasAttribute('data-static')) {
        el.textContent = roleLabel;
      }
    });
  }

  // --- Logout ---
  function logout({ redirect = true } = {}) {
    try {
      if (window.authManager && typeof window.authManager.logout === 'function') {
        // Nosso authManager já limpa storage e pode redirecionar.
        // Passamos redirect:false para controlarmos o destino aqui.
        window.authManager.logout({ redirect: false });
      }
    } catch { /* noop */ }

    // Garante limpeza no fallback
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_session');
    localStorage.removeItem('user_data');
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userEmail');

    if (redirect) {
      // Redireciona para o login coerente com o dashboard atual
      goToLogin(getExpectedRole());
    }
  }

  // --- Delegação de logout ---
  function bindLogoutDelegation() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a,button');
      if (!a) return;
      if (
        a.matches('[data-action="logout"], .logout, a[href="#logout"], a[href*="sair"], a.dropdown-item[href="#"][onclick*="logout"]')
      ) {
        e.preventDefault();
        logout({ redirect: true });
      }
    });
  }

  // --- Anti-flash: remove sinalizador quando pronto ---
  function removeAntiFlash() {
    if (document.documentElement.getAttribute('data-auth') === 'checking') {
      document.documentElement.removeAttribute('data-auth');
    }
  }

  // --- Boot ---
  document.addEventListener('DOMContentLoaded', () => {
    // Se for um dashboard, restringe ao papel esperado
    const isDashboard = /dashboard-(aluno|instrutor|admin)\.html/i.test(location.pathname)
      || document.body?.hasAttribute('data-dashboard-role');

    if (isDashboard) {
      const expected = getExpectedRole();
      const ok = guard({ allowRoles: [expected] });
      if (!ok) return; // guard redirecionou
    } else {
      // Em páginas privadas que reutilizem este script
      if (!guard()) return;
    }

    renderUserInfo();
    bindLogoutDelegation();
    removeAntiFlash();

    // Notifica outros scripts que a sessão/guard/hidratação finalizaram
    document.dispatchEvent(new CustomEvent('dashboard-auth:ready', {
      detail: { user: readUser() }
    }));
  });

  // Export utilitários para depuração ou reuso
  window.dashboardAuth = {
    guard,
    renderUserInfo,
    logout,
    readUser,
    hasValidSession
  };
})();