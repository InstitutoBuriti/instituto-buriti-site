// Helpers
const Dom = {
  $: (sel, root=document) => root.querySelector(sel),
  $$: (sel, root=document) => Array.from(root.querySelectorAll(sel)),
  on: (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts)
};

// Router simples por âncora (#id)
function initSectionRouter() {
  const links = Dom.$$('.sidebar-nav .nav-link');
  function activateSection(id) {
    Dom.$$('.dashboard-section').forEach(sec => sec.classList.remove('active'));
    const target = Dom.$(id);
    if (target) {
      target.classList.add('active');
      Dom.$$('.sidebar-nav .nav-link').forEach(a => a.removeAttribute('aria-current'));
      Dom.$(`.sidebar-nav .nav-link[href="${id}"]`)?.setAttribute('aria-current', 'page');
    }
  }
  links.forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href.startsWith('#')) {
      Dom.on(link, 'click', (e) => { e.preventDefault(); activateSection(href); });
    }
  });
  const firstActive = Dom.$('.dashboard-section.active');
  if (firstActive) {
    Dom.$(`.sidebar-nav .nav-link[href="#${firstActive.id}"]`)?.setAttribute('aria-current', 'page');
  }
}

// Dropdown do usuário (acessível)
function initUserDropdown() {
  const dropdown = Dom.$('.login-dropdown');
  if (!dropdown) return;
  const btn = Dom.$('.login-btn', dropdown);
  const menu = Dom.$('.dropdown-menu', dropdown);
  if (!btn || !menu) return;

  function close() {
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', outside);
    document.removeEventListener('keydown', esc);
  }
  function open() {
    menu.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    setTimeout(() => Dom.$('a,button,[tabindex="0"]', menu)?.focus(), 0);
    document.addEventListener('click', outside);
    document.addEventListener('keydown', esc);
  }
  function outside(e) { if (!dropdown.contains(e.target)) close(); }
  function esc(e) { if (e.key === 'Escape') close(); }
  Dom.on(btn, 'click', () => menu.classList.contains('open') ? close() : open());
}

// Toggle do sidebar
function initSidebarToggle() {
  const sidebar = Dom.$('#sidebar');
  const toggle = Dom.$('#sidebarToggle');
  if (!sidebar || !toggle) return;
  Dom.on(toggle, 'click', () => {
    sidebar.classList.toggle('collapsed');
    const isCollapsed = sidebar.classList.contains('collapsed');
    toggle.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
    toggle.setAttribute('aria-label', isCollapsed ? 'Expandir menu' : 'Recolher menu');
  });
}

// Logout
function initLogoutLinks() {
  Dom.$$('a[data-action="logout"]').forEach(a => {
    Dom.on(a, 'click', async (e) => {
      e.preventDefault();
      try { await window.Auth?.logout?.(); } catch {}
      location.replace('/pages/login-aluno.html');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initSectionRouter();
  initUserDropdown();
  initSidebarToggle();
  initLogoutLinks();
});