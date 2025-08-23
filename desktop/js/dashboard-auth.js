/* /js/dashboard-auth.js
   Proteção e sessão dos dashboards (aluno, instrutor, admin, financeiro, suporte, parceiro)
   - Verifica autenticação
   - Aplica guarda por perfil (role)
   - Preenche nome/role dinamicamente
   - Logout unificado
   - Remove anti-flash (html[data-auth="checking"]) quando pronto
*/
(() => {
  'use strict';

  // --- Config (mantidas locais para compatibilidade com <script defer>) ---
  const DASHBOARD_PAGES = {
    aluno: ['/pages/dashboard-aluno.html', '/pages/perfil-aluno.html'],
    instrutor: ['/pages/dashboard-instrutor.html'],
    admin: ['/pages/dashboard-admin.html'],
    financeiro: ['/pages/dashboard-financeiro.html'],
    suporte: ['/pages/dashboard-suporte.html'],
    parceiro: ['/pages/dashboard-parceiro.html'],
  };
  const ROLE_LOGIN = {
    aluno: '/pages/login-aluno.html',
    instrutor: '/pages/login-instrutor.html',
    admin: '/pages/login-admin.html',
    financeiro: '/pages/login-financeiro.html',
    suporte: '/pages/login-suporte.html',
    parceiro: '/pages/login-parceiro.html',
    default: '/pages/login-aluno.html',
  };

  // --- Helpers ---
  const $all = (sel) => Array.from(document.querySelectorAll(sel));
  const lower = (s) => String(s || '').trim().toLowerCase();

  function dispatchReady(user, extra = {}) {
    try { document.dispatchEvent(new CustomEvent('dashboard-auth:ready', { detail: { user, ...extra } })); } catch {}
    try { window.dispatchEvent(new CustomEvent('dashboard-auth:ready', { detail: { user, ...extra } })); } catch {}
  }

  function removeAntiFlash() {
    if (document.documentElement.getAttribute('data-auth') === 'checking') {
      document.documentElement.removeAttribute('data-auth');
    }
  }

  function normalizePath(p) {
    return String(p || '').replace(/\/+$/, '');
  }

  function isDashboardPageFor(role) {
    const path = normalizePath(location.pathname);
    return (DASHBOARD_PAGES[role] || []).some(p => normalizePath(p) === path);
  }

  function roleToLabel(role) {
    const r = lower(role);
    if (r === 'aluno') return 'Aluna(o)';
    if (r === 'instrutor') return 'Instrutor(a)';
    if (r === 'admin') return 'Administrador(a)';
    if (r === 'financeiro') return 'Financeiro';
    if (r === 'suporte') return 'Suporte';
    if (r === 'parceiro') return 'Parceiro';
    return 'Usuário';
  }

  function hydrateHeaderUser(user) {
    const name = user?.name || user?.full_name || user?.username || user?.email || 'Usuário';
    const role = user?.role || 'aluno';

    // Nome
    [...$all('.login-dropdown .login-btn.user-name'), ...$all('[data-user-name]')]
      .forEach(el => { if (!el.hasAttribute('data-static')) el.textContent = name; });

    // Papel
    [...$all('.user-role'), ...$all('[data-user-role]')]
      .forEach(el => { if (!el.hasAttribute('data-static')) el.textContent = roleToLabel(role); });

    const btn = document.querySelector('.login-dropdown .login-btn.user-name');
    if (btn) btn.setAttribute('aria-label', `Conta de ${name}`);
  }

  function safeGetFromStorages(key) {
    try { const v = sessionStorage.getItem(key); if (v !== null) return v; } catch {}
    try { const v = localStorage.getItem(key); if (v !== null) return v; } catch {}
    return null;
  }

  // --- Inferências / leitura de sessão ---
  function inferRoleFromSession() {
    const userStr = safeGetFromStorages('auth_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        const roleFromUser = u?.app_metadata?.role || u?.user_metadata?.role || u?.role;
        if (typeof roleFromUser === 'string') return roleFromUser.toLowerCase();
      } catch (e) {
        console.warn('[dashboard-auth] Erro ao parsear auth_user:', e);
      }
    }

    const token = safeGetFromStorages('auth_token');
    if (token && token.split('.').length === 3) {
      try {
        const [, payloadB64] = token.split('.');
        const json = JSON.parse(b64UrlToStr(payloadB64));
        const roleFromJwt = json?.app_metadata?.role || json?.user_metadata?.role || json?.role;
        if (typeof roleFromJwt === 'string') return roleFromJwt.toLowerCase();
      } catch (e) {
        console.warn('[dashboard-auth] Erro ao decodificar JWT:', e);
      }
    }

    return 'aluno'; // Fallback padrão
  }

  function inferRoleFromPath() {
    const p = lower(location.pathname);
    if (p.includes('admin')) return 'admin';
    if (p.includes('instrutor') || p.includes('prof') || p.includes('teacher')) return 'instrutor';
    if (p.includes('financeiro')) return 'financeiro';
    if (p.includes('suporte')) return 'suporte';
    if (p.includes('parceiro')) return 'parceiro';
    return 'aluno';
  }

  function getExpectedRole() {
    const bodyRole = document.body?.getAttribute('data-dashboard-role');
    if (bodyRole) return lower(bodyRole);
    return inferRoleFromPath();
  }

  function normalizeUser(raw) {
    if (!raw) return null;
    const role = lower(raw.role || raw.type || raw.user_type || raw.app_metadata?.role || raw.user_metadata?.role);
    const name = raw.name || raw.full_name || raw.username || raw.user_metadata?.name || raw.email || 'Usuário';
    const email = raw.email || raw.user_email || null;
    return { ...raw, role: role || 'aluno', name, email };
  }

  function readUser() {
    // Preferir window.Auth
    try {
      if (window.Auth && typeof window.Auth.getCurrentUser === 'function') {
        const u = window.Auth.getCurrentUser();
        if (u && typeof u.then !== 'function') return normalizeUser(u); // Evita Promise
      }
    } catch {}
    // Depois authManager
    try {
      if (window.authManager && typeof window.authManager.getUser === 'function') {
        const u = window.authManager.getUser();
        if (u && typeof u.then !== 'function') return normalizeUser(u); // Evita Promise
      }
    } catch {}
    // Depois storages conhecidos
    try {
      const snap = safeGetFromStorages('auth_user');
      if (snap) return normalizeUser(JSON.parse(snap));
    } catch {}
    try {
      const legacy = localStorage.getItem('user_data');
      if (legacy) return normalizeUser(JSON.parse(legacy));
    } catch {}
    return null;
  }

  function hasValidSession() {
    // Preferir APIs se disponíveis
    try { if (typeof window.Auth?.isAuthenticated === 'function') return !!window.Auth.isAuthenticated(); } catch {}
    try { if (typeof window.authManager?.isAuthenticated === 'function') return !!window.authManager.isAuthenticated(); } catch {}

    // Checa expiração quando houver
    const exp = Number(safeGetFromStorages('auth_expires_at') || 0);
    if (exp && exp < Date.now()) return false;

    // Fallback simples por token/sessão
    return !!(safeGetFromStorages('auth_token') || safeGetFromStorages('auth_session'));
  }

  function b64UrlToStr(b64url) {
    let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4;
    if (pad) b64 += '='.repeat(4 - pad);
    return atob(b64);
  }

  // Logout seletivo (não apagar preferências)
  async function logoutAll(expectedRole, { wipeRemember = false } = {}) {
    try { if (window.Auth?.logout) await window.Auth.logout(); } catch (e) { console.error('[dashboard-auth] Auth.logout:', e); }
    try { if (window.authManager?.logout) await window.authManager.logout({ redirect: false }); } catch (e) { console.error('[dashboard-auth] authManager.logout:', e); }

    const AUTH_KEYS = ['auth_token','refresh_token','auth_expires_at','auth_user','auth_session'];
    const PREF_KEYS = wipeRemember ? ['rememberLogin','rememberEmail'] : [];

    for (const k of [...AUTH_KEYS, ...PREF_KEYS]) {
      try { sessionStorage.removeItem(k); } catch {}
      try { localStorage.removeItem(k); } catch {}
    }

    // Broadcast multi-aba
    try { localStorage.setItem('auth:broadcast', JSON.stringify({ e: 'logout', t: Date.now() })); } catch {}

    console.info('[dashboard-auth] Sessão limpa com sucesso.');
    location.replace(ROLE_LOGIN[expectedRole] || ROLE_LOGIN.default);
  }

  // --- Guard principal ---
  async function runGuard() {
    const expectedRole = document.body?.dataset?.dashboardRole;

    // Se não for uma página de dashboard protegida, apenas libera renderização
    if (!expectedRole || !isDashboardPageFor(expectedRole)) {
      console.info('[dashboard-auth] Não é página protegida, liberando renderização.');
      dispatchReady();
      removeAntiFlash();
      document.body.setAttribute('aria-busy', 'false');
      return;
    }

    // Modo dev: se não houver Auth, liberar ou redirecionar
    const DEV_MODE = false; // true no dev, false em produção
    if (!window.Auth || typeof window.Auth.getCurrentUser !== 'function') {
      if (DEV_MODE) {
        console.warn('[dashboard-auth] Auth ausente (DEV_MODE ativo); liberando render.');
        dispatchReady();
        removeAntiFlash();
        document.body.setAttribute('aria-busy', 'false');
        return;
      } else {
        console.warn('[dashboard-auth] Auth ausente; redirecionando para login.');
        await logoutAll(expectedRole);
        return;
      }
    }

    try {
      // Checar expiração
      const expiresAt = Number(safeGetFromStorages('auth_expires_at') || 0);
      if (!expiresAt || expiresAt < Date.now()) {
        console.warn('[dashboard-auth] Sessão expirada; forçando logout.');
        await logoutAll(expectedRole);
        return;
      }

      // Tenta obter usuário do Auth
      let user = await window.Auth.getCurrentUser().catch(() => null);

      // Fallback: se não veio user ou faltou role/name, tenta inferir da sessão
      if (!user || !user.role || !user.name) {
        const roleInferred = inferRoleFromSession();
        if (!user) user = {};
        if (!user.role) user.role = roleInferred;
        if (!user.name) {
          try {
            const uStr = safeGetFromStorages('auth_user');
            if (uStr) {
              const u = JSON.parse(uStr);
              user.name = u?.user_metadata?.name || u?.name || u?.email || 'Usuário';
            }
          } catch (e) {
            console.warn('[dashboard-auth] Erro ao buscar nome de auth_user:', e);
          }
        }
      }

      if (!user) {
        console.warn('[dashboard-auth] Usuário não autenticado; redirecionando para login.');
        await logoutAll(expectedRole);
        return;
      }

      // Redirecionamento gentil: se papel incorreto, vai para o dashboard do usuário
      if ((user.role || '').toLowerCase() !== expectedRole) {
        console.warn('[dashboard-auth] Papel incorreto. Esperado:', expectedRole, 'Atual:', user.role);
        const userRole = (user.role || '').toLowerCase();
        const targetDashboard = (DASHBOARD_PAGES[userRole] || [])[0];
        if (targetDashboard) {
          console.info('[dashboard-auth] Redirecionando para dashboard correto:', targetDashboard);
          location.replace(targetDashboard + location.search + location.hash);
        } else {
          await logoutAll(expectedRole);
        }
        return;
      }

      hydrateHeaderUser(user);
      console.info('[dashboard-auth] Autenticação e role validados com sucesso.');
      dispatchReady(user, { role: lower(user?.role), isProtected: true, expectedRole });
      removeAntiFlash();
      document.body.setAttribute('aria-busy', 'false');
    } catch (err) {
      console.error('[dashboard-auth] Erro na autenticação:', err);
      await logoutAll(expectedRole);
    }
  }

  // Listener para logout multi-aba (broadcast)
  window.addEventListener('storage', (e) => {
    if (e.key !== 'auth:broadcast' || !e.newValue) return;
    try {
      const msg = JSON.parse(e.newValue);
      if (msg?.e === 'logout') {
        const expected = getExpectedRole();
        location.replace(ROLE_LOGIN[expected] || ROLE_LOGIN.default);
      }
    } catch {}
  });

  // --- Boot ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runGuard, { once: true });
  } else {
    runGuard();
  }

  // Fallback anti-flash: remove o flag em 2s se nada acontecer
  setTimeout(() => {
    if (document.documentElement.getAttribute('data-auth') === 'checking') {
      console.warn('[dashboard-auth] Fallback anti-flash ativado.');
      removeAntiFlash();
      dispatchReady(readUser());
      document.body.setAttribute('aria-busy', 'false');
    }
  }, 2000);
})();