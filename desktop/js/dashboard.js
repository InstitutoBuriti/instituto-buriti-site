/* /js/dashboard.js
 * Núcleo de UI para Dashboards (Aluno, Instrutor, Admin)
 * - SPA leve por seções (data-section)
 * - Integra com authManager/dashboardAuth
 * - Notificações (toast)
 * - Hooks por perfil: PageHooks.aluno / instrutor / admin
 */
(() => {
  const waitReady = (evtName, timeout = 800) =>
    new Promise(resolve => {
      let done = false;
      const t = setTimeout(() => { if (!done) { done = true; resolve(); } }, timeout);
      document.addEventListener(evtName, () => {
        if (!done) { done = true; clearTimeout(t); resolve(); }
      }, { once: true });
    });

  const getUser = () => {
    try {
      if (window.authManager?.getUser) return window.authManager.getUser();
      if (window.dashboardAuth?.readUser) return window.dashboardAuth.readUser();
      const raw = localStorage.getItem('user_data');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };

  const getRoleFromBodyOrPath = () => {
    const attr = document.body?.getAttribute('data-dashboard-role');
    if (attr) return String(attr).toLowerCase();
    const p = (location.pathname || '').toLowerCase();
    if (p.includes('dashboard-admin')) return 'admin';
    if (p.includes('dashboard-instrutor')) return 'instrutor';
    return 'aluno';
  };

  // === HTTP helper com Bearer automático (compatível com auth.js revisado) ===
  const HTTP = {
    async get(url, opts = {}) { return HTTP._fetch('GET', url, null, opts); },
    async post(url, body, opts = {}) { return HTTP._fetch('POST', url, body, opts); },
    async put(url, body, opts = {}) { return HTTP._fetch('PUT', url, body, opts); },
    async del(url, opts = {}) { return HTTP._fetch('DELETE', url, null, opts); },

    async _fetch(method, url, body, opts) {
      const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };

      // Injeta Bearer se existir (prioriza auth_session do auth.js)
      try {
        const session = window.authManager?.session || null;
        const bearer = session?.access_token || localStorage.getItem('auth_token') || null;
        if (bearer && url.startsWith('/api')) headers['Authorization'] = `Bearer ${bearer}`;
      } catch { /* noop */ }

      const res = await fetch(url, {
        method,
        headers,
        ...(body != null ? { body: JSON.stringify(body) } : {}),
        ...opts
      });

      const ct = res.headers.get('content-type') || '';
      const isJSON = ct.includes('application/json');
      const data = isJSON ? await res.json() : await res.text();

      if (!res.ok) {
        const msg = isJSON ? (data?.message || data?.error || JSON.stringify(data)) : String(data);
        throw new Error(msg || `HTTP ${res.status}`);
      }
      return data;
    }
  };

  const DASHBOARD = {
    user: null,

    async init() {
      // Aguarda (se houver) o evento do dashboard-auth para evitar flash
      await waitReady('dashboard-auth:ready');

      this.user = getUser();
      this.cacheDom();
      this.hydrateUserUI();      // usa dados já normalizados pelo dashboard-auth

      this.bindSidebarToggle();
      this.bindDropdown();
      this.bindSectionNav();
      this.restoreSectionFromHash();
      this.bindHashChange();

      this.runProfileHooks();

      // Qualquer boot global adicional…
    },

    // === Cache de elementos ===
    cacheDom() {
      this.$sidebar = document.getElementById('sidebar');
      this.$sidebarToggle = document.getElementById('sidebarToggle');
      this.$dropdownBtn = document.querySelector('.login-dropdown .login-btn');
      this.$dropdownMenu = document.querySelector('.login-dropdown .dropdown-menu');
      this.$navLinks = Array.from(document.querySelectorAll('.sidebar-nav .nav-link[data-section]'));
      this.$sections = Array.from(document.querySelectorAll('.dashboard-section'));
      this.$main = document.querySelector('.main-content');
    },

    // === Hidratar cabeçalho/Sidebar com dados do usuário (idempotente) ===
    hydrateUserUI() {
      if (!this.user) return;
      const { name, email, role } = this.user;
      const displayName = name || email || 'Minha conta';
      const displayRole = role ? (String(role)[0].toUpperCase() + String(role).slice(1)) : '';

      // Alvos sem “data-static”
      const nameTargets = document.querySelectorAll('.user-name,[data-user-name]');
      const roleTargets = document.querySelectorAll('.user-role,[data-user-role]');
      const btn = document.querySelector('.login-dropdown .login-btn');

      nameTargets.forEach(el => { if (!el.hasAttribute('data-static')) el.textContent = displayName; });
      roleTargets.forEach(el => { if (!el.hasAttribute('data-static')) el.textContent = displayRole || el.textContent || ''; });
      if (btn && !btn.hasAttribute('data-static')) btn.textContent = displayName;
    },

    // === Toggle da sidebar ===
    bindSidebarToggle() {
      this.$sidebarToggle?.addEventListener('click', () => {
        this.$sidebar?.classList.toggle('collapsed');
      });
    },

    // === Dropdown de conta (com fechamento por foco/teclado) ===
    bindDropdown() {
      if (!this.$dropdownBtn || !this.$dropdownMenu) return;

      const toggle = (open) => {
        this.$dropdownMenu.style.display = open ? 'block' : 'none';
        this.$dropdownBtn.setAttribute('aria-expanded', String(open));
      };

      let isOpen = false;
      this.$dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isOpen = !isOpen;
        toggle(isOpen);
        if (isOpen) this.$dropdownMenu.querySelector('a,button')?.focus();
      });

      document.addEventListener('click', () => { if (isOpen) { isOpen = false; toggle(false); } });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen) { isOpen = false; toggle(false); this.$dropdownBtn.focus(); } });

      // Fecha ao sair do menu via tab
      this.$dropdownMenu.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && !e.shiftKey) {
          const last = [...this.$dropdownMenu.querySelectorAll('a,button')].pop();
          if (document.activeElement === last) { isOpen = false; toggle(false); }
        }
      });
    },

    // === Navegação entre seções (SPA leve) ===
    bindSectionNav() {
      if (!this.$navLinks.length || !this.$sections.length) return;

      this.$navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          const section = link.dataset.section;
          if (!section) return; // links reais continuam navegando

          e.preventDefault();
          this.activateSection(section);

          // Atualiza hash (sem mudar histórico)
          history.replaceState(null, '', `#${encodeURIComponent(section)}`);

          // Estado visual & a11y
          this.$navLinks.forEach(a => a.classList.toggle('active', a === link));
          link.setAttribute('aria-current', 'page');
          this.$navLinks.filter(a => a !== link).forEach(a => a.removeAttribute('aria-current'));

          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });
    },

    bindHashChange() {
      window.addEventListener('hashchange', () => this.restoreSectionFromHash());
    },

    activateSection(sectionId) {
      this.$sections.forEach(sec => {
        const isActive = sec.id === sectionId;
        sec.classList.toggle('active', isActive);
        sec.setAttribute('aria-hidden', String(!isActive));
      });
    },

    restoreSectionFromHash() {
      const hash = decodeURIComponent((location.hash || '').replace('#', ''));
      const exists = this.$sections.some(s => s.id === hash);
      const initial = exists ? hash : 'overview';
      this.activateSection(initial);

      this.$navLinks.forEach(a => {
        const on = a.dataset.section === initial;
        a.classList.toggle('active', on);
        if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
      });
    },

    // === Hooks por perfil ===
    async runProfileHooks() {
      const explicitRole = (this.user && String(this.user.role || '').toLowerCase()) || null;
      const role = explicitRole || getRoleFromBodyOrPath();
      const hooks = (window.PageHooks && window.PageHooks[role]) || null;

      if (typeof hooks === 'function') {
        try {
          await hooks({ user: this.user, notify: this.notify, http: HTTP });
        } catch (e) {
          console.error('[dashboard] erro ao executar hooks do perfil:', e);
          this.notify('Erro ao carregar dados do painel.', 'error');
        }
      }
    },

    // === Notificações (toast) ===
    notify(message, type = 'info', timeout = 4000) {
      const colors = { success: '#28a745', error: '#dc3545', warning: '#ffc107', info: '#17a2b8' };
      const el = document.createElement('div');
      el.className = `ib-toast ${type}`;
      el.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        background: ${colors[type] || colors.info}; color: #fff;
        padding: 12px 16px; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,.15);
        font: 500 14px/1.3 Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        opacity: 0; transform: translateY(-8px); transition: all .25s ease;
        max-width: 360px;
      `;
      el.innerHTML = `<div>${message}</div>`;
      document.body.appendChild(el);
      requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
      setTimeout(() => {
        el.style.opacity = '0'; el.style.transform = 'translateY(-8px)';
        setTimeout(() => el.remove(), 250);
      }, timeout);
    }
  };

  // Hooks vazios (pode sobrescrever em cada página)
  window.PageHooks = window.PageHooks || {
    aluno: async () => {},
    instrutor: async () => {},
    admin: async () => {}
  };

  // Boot
  document.addEventListener('DOMContentLoaded', () => DASHBOARD.init());

  // Expor utilitários básicos
  window.IBDashboard = { notify: DASHBOARD.notify, http: HTTP };
})();