// Instituto Buriti — main.js (revisado e endurecido)
// Objetivo: padronizar rotas absolutas, corrigir qualquer referência
// "detalhes-cursos.html" (plural) para "/pages/detalhes-curso.html" (singular),
// e manter navegação/efeitos estáveis.

(function hardenDetailsRoute() {
  // Redireciona imediatamente se alguém acessar a URL antiga (plural)
  try {
    const DETAILS_PAGE = '/pages/detalhes-curso.html';
    const path = window.location.pathname || '';
    if (/\/pages\/detalhes-cursos\.html$/i.test(path)) {
      const search = window.location.search || '';
      window.location.replace(`${DETAILS_PAGE}${search}`);
    }
  } catch (e) { /* noop */ }
})();

// ---- Constantes centrais de rota ----
const DETAILS_PAGE = '/pages/detalhes-curso.html';

// Observers compartilhados
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('fade-in-up'); });
}, observerOptions);

// Boot
document.addEventListener('DOMContentLoaded', function () {
  normalizeAllLinksToAbsolutePages();
  rewriteCourseDetailAnchors(); // reforço específico
  installDetailLinkClickGuard();

  initializeMainNavigation();
  initializeScrollEffects();
  initializeAnimations();
  initializeMobileMenu();
  initializeFormHandlers();
  initializeSearchFunctionality();

  initializeSmoothScrolling();
  initializeLazyLoading();
  optimizePerformance();

  console.log('main.js: inicializado com rotas absolutas e guardas de detalhes.');
});

// --- 1) Normalização global de links /pages/... + correção singular ---
function normalizeAllLinksToAbsolutePages() {
  const aTags = document.querySelectorAll('a[href]');
  aTags.forEach(a => {
    const raw = (a.getAttribute('href') || '').trim();
    if (!raw || raw.startsWith('#') || raw.startsWith('http') || raw.startsWith('mailto:') || raw.startsWith('tel:')) return;

    // Se contiver querystring, separe para preservar
    const qIndex = raw.indexOf('?');
    const base = qIndex >= 0 ? raw.slice(0, qIndex) : raw;
    const qs = qIndex >= 0 ? raw.slice(qIndex) : '';

    // (A) Correção específica: qualquer variação de detalhes-cursos → detalhes-curso
    if (/(^|\/)detalhes-cursos\.html$/i.test(base) || /(^|\/)pages\/detalhes-cursos\.html$/i.test(base)) {
      a.setAttribute('href', `${DETAILS_PAGE}${qs}`);
      return;
    }

    // (B) Qualquer variação que contenha /pages/ vira absoluta
    const pagesMatch = raw.match(/(^|\/)pages\/(.+)/i);
    if (pagesMatch) {
      a.setAttribute('href', '/pages/' + pagesMatch[2].replace(/^\/+/, ''));
      return;
    }

    // (C) Se o link é apenas "arquivo.html", transforme em "/pages/arquivo.html"
    if (/^[a-z0-9\-]+\.html$/i.test(raw)) {
      a.setAttribute('href', '/pages/' + raw);
      return;
    }

    // (D) Home raiz deve ser absoluta
    if (raw === 'index.html' || raw === './index.html' || raw === '../index.html') {
      a.setAttribute('href', '/index.html');
      return;
    }
  });
}

// --- 2) Reforço: reescrever anchors de detalhes (plural → singular) ---
function rewriteCourseDetailAnchors() {
  const anchors = document.querySelectorAll('a[href*="detalhes-curso"], a[href*="detalhes-cursos"]');
  anchors.forEach(a => {
    const href = a.getAttribute('href') || '';
    // Troca apenas se detectar o plural
    if (/detalhes-cursos\.html/i.test(href)) {
      a.setAttribute('href', href.replace(/detalhes-cursos\.html/ig, 'detalhes-curso.html'));
    }
    // Garante prefixo absoluto /pages/
    const urlNoQS = href.split('?')[0];
    if (!/^\//.test(urlNoQS)) {
      const qs = href.includes('?') ? '?' + href.split('?')[1] : '';
      if (/(^|\/)detalhes-curso\.html$/i.test(urlNoQS)) {
        a.setAttribute('href', `${DETAILS_PAGE}${qs}`);
      }
    }
  });
}

// --- 3) Última proteção: intercepta cliques em links de detalhes no plural ---
function installDetailLinkClickGuard() {
  document.addEventListener('click', function (e) {
    const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (/detalhes-cursos\.html/i.test(href)) {
      e.preventDefault();
      const fixed = href.replace(/detalhes-cursos\.html/ig, 'detalhes-curso.html');
      window.location.href = fixed.startsWith('/') ? fixed : DETAILS_PAGE + (fixed.includes('?') ? fixed.slice(fixed.indexOf('?')) : '');
    }
  }, true);
}

// --- Navegação Principal (corrigida) ---
function initializeMainNavigation() {
  const navLinks = document.querySelectorAll('nav a, .nav-link, .menu-link, .navbar-nav a, .main-nav a');

  navLinks.forEach(link => {
    const href = (link.getAttribute('href') || '').trim();
    const linkText = (link.textContent || '').trim().toLowerCase();

    if (href === '#quem-somos' || href === 'quem-somos' || linkText.includes('quem somos') || linkText.includes('sobre')) {
      link.setAttribute('href', '/pages/quem-somos.html');
    } else if (href === '#cursos' || href === 'cursos' || linkText.includes('cursos')) {
      link.setAttribute('href', '/pages/cursos.html');
    } else if (href === '#seja-instrutor' || href === 'seja-instrutor' || linkText.includes('seja instrutor') || linkText.includes('instrutor')) {
      link.setAttribute('href', '/pages/seja-instrutor-novo.html');
    } else if (href === '#contato' || href === 'contato' || linkText.includes('contato')) {
      link.setAttribute('href', '/pages/contato.html');
    } else if (href === '#certificados' || href === 'certificados' || linkText.includes('certificados')) {
      link.setAttribute('href', '/pages/certificados.html');
    } else if (href === '#biblioteca' || href === 'biblioteca' || linkText.includes('biblioteca')) {
      link.setAttribute('href', '/pages/biblioteca.html');
    }

    // Feedback visual ao clicar (sem interromper navegação normal)
    link.addEventListener('click', function (e) {
      const targetHref = this.getAttribute('href') || '';

      // Rolagem suave apenas para âncoras locais
      if (targetHref.startsWith('#') && document.querySelector(targetHref)) {
        e.preventDefault();
        const targetElement = document.querySelector(targetHref);
        if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      if (targetHref.includes('.html')) {
        this.style.opacity = '0.7';
        this.style.pointerEvents = 'none';
        showNavigationFeedback('Carregando página...', 'info');
        setTimeout(() => {
          this.style.opacity = '1';
          this.style.pointerEvents = 'auto';
        }, 2000);
      }
    });

    // Hover melhorado
    link.addEventListener('mouseenter', function () {
      this.style.transition = 'all 0.3s ease';
      this.style.transform = 'translateY(-2px)';
    });
    link.addEventListener('mouseleave', function () {
      this.style.transform = 'translateY(0)';
    });
  });

  // Corrigir botões que usam onclick para navegar
  const specificButtons = document.querySelectorAll('button[onclick*="location"], a[onclick*="location"]');
  specificButtons.forEach(button => {
    const onclickAttr = button.getAttribute('onclick');
    if (!onclickAttr) return;

    // Normaliza rota de detalhes se aparecer dentro do JS inline
    const normalized = onclickAttr.replace(/detalhes-cursos\.html/ig, 'detalhes-curso.html');

    button.removeAttribute('onclick');

    if (/cursos/.test(normalized) && !/detalhes-curso/.test(normalized)) {
      button.setAttribute('href', '/pages/cursos.html');
    } else if (/quem-somos/.test(normalized)) {
      button.setAttribute('href', '/pages/quem-somos.html');
    } else if (/seja-?instrutor/.test(normalized)) {
      button.setAttribute('href', '/pages/seja-instrutor-novo.html');
    } else if (/contato/.test(normalized)) {
      button.setAttribute('href', '/pages/contato.html');
    } else if (/detalhes-curso/.test(normalized)) {
      // Se for um botão que já compõe slug, deixe o href para DETAILS_PAGE (slug virá na query do onclick original)
      button.setAttribute('href', DETAILS_PAGE);
    }

    // Se for <button>, converta em <a>
    if (button.tagName === 'BUTTON' && button.getAttribute('href')) {
      const link = document.createElement('a');
      link.href = button.getAttribute('href');
      link.className = button.className;
      link.innerHTML = button.innerHTML;
      link.style.cssText = button.style.cssText;
      button.parentNode.replaceChild(link, button);
    }
  });

  console.log('Navegação principal inicializada (rotas absolutas /pages/...).');
}

function showNavigationFeedback(message, type = 'info') {
  const feedback = document.createElement('div');
  feedback.className = `navigation-feedback feedback-${type}`;
  const bg = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#667eea';
  feedback.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:25px;color:#fff;font-weight:500;z-index:1000;background:${bg};box-shadow:0 4px 12px rgba(0,0,0,.2);font-size:14px;opacity:0;transition:opacity .3s ease;`;
  feedback.textContent = message;
  document.body.appendChild(feedback);
  requestAnimationFrame(() => (feedback.style.opacity = '1'));
  setTimeout(() => { feedback.style.opacity = '0'; setTimeout(() => feedback.remove(), 300); }, 2000);
}

// --- Scroll Effects ---
function initializeScrollEffects() {
  let lastScrollTop = 0;
  const header = document.querySelector('header, .header, .navbar');
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (header) header.style.transform = (scrollTop > lastScrollTop && scrollTop > 100) ? 'translateY(-100%)' : 'translateY(0)';
    lastScrollTop = scrollTop;
  });
}

// --- Animações e hovers ---
function initializeAnimations() {
  const fadeElements = document.querySelectorAll('.fade-in, .animate-on-scroll');
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  });
  fadeElements.forEach(el => { el.style.opacity = '0'; el.style.transform = 'translateY(20px)'; el.style.transition = 'all .6s ease'; fadeObserver.observe(el); });

  // Hovers dos cards e observar para animação de entrada
  const cards = document.querySelectorAll('.step-card, .course-card, .news-card, .event-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-15px) scale(1.05)';
      this.style.boxShadow = '0 25px 70px rgba(160, 32, 240, 0.2)';
      this.style.transition = 'transform .25s ease, box-shadow .25s ease';
    });
    card.addEventListener('mouseleave', function () {
      this.style.transform = 'translateY(0) scale(1)'; // corrigido: volta ao scale(1)
      this.style.boxShadow = '';
    });

    observer.observe(card);
  });

  const counters = document.querySelectorAll('.counter, .stat-number');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) animateCounter(entry.target); });
  });
  counters.forEach(counter => counterObserver.observe(counter));
}

function animateCounter(element) {
  const target = parseInt(element.textContent) || parseInt(element.getAttribute('data-target')) || 0;
  const duration = 2000, steps = 60, stepValue = target / steps;
  let currentValue = 0, currentStep = 0;
  const interval = setInterval(() => {
    currentStep++;
    currentValue = Math.min(Math.round(stepValue * currentStep), target);
    element.textContent = currentValue;
    if (currentStep >= steps || currentValue >= target) { clearInterval(interval); element.textContent = target; }
  }, duration / steps);
}

// --- Mobile Menu ---
function initializeMobileMenu() {
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle, .hamburger, .menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu, .nav-mobile, .mobile-nav');
  const navLinks = document.querySelectorAll('.mobile-menu a, .nav-mobile a');
  if (!mobileMenuToggle || !mobileMenu) return;

  mobileMenuToggle.addEventListener('click', function () {
    mobileMenu.classList.toggle('active');
    this.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  navLinks.forEach(link => link.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    mobileMenuToggle.classList.remove('active');
    document.body.style.overflow = '';
  }));

  document.addEventListener('click', function (e) {
    if (!mobileMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
      mobileMenu.classList.remove('active');
      mobileMenuToggle.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// --- Formulários ---
function initializeFormHandlers() {
  const newsletterForm = document.querySelector('.newsletter-form, #newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const emailInput = this.querySelector('input[type="email"]');
      const email = emailInput?.value || '';
      if (validateEmail(email)) { showNotification('Obrigado! Você foi inscrito na nossa newsletter.', 'success'); emailInput.value = ''; }
      else { showNotification('Por favor, insira um e-mail válido.', 'error'); }
    });
  }

  const contactForm = document.querySelector('.contact-form, #contact-form, #contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const formData = new FormData(this);
      const name = formData.get('name') || formData.get('nome');
      const email = formData.get('email');
      const message = formData.get('message') || formData.get('mensagem');
      if (name && validateEmail(String(email)) && message) { showNotification('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success'); this.reset(); }
      else { showNotification('Por favor, preencha todos os campos corretamente.', 'error'); }
    });
  }
}

// --- Busca ---
function initializeSearchFunctionality() {
  const searchInput = document.querySelector('.search-input, #search');
  const searchButton = document.querySelector('.search-button, .search-btn');
  if (searchInput) searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(searchInput.value); });
  if (searchButton) searchButton.addEventListener('click', () => performSearch(searchInput ? searchInput.value : ''));
}

function performSearch(query) {
  if (String(query).trim()) {
    showNotification(`Buscando por: "${query}"...`, 'info');
    setTimeout(() => showNotification('Funcionalidade de busca em desenvolvimento!', 'warning'), 1500);
  } else {
    showNotification('Por favor, digite algo para buscar.', 'warning');
  }
}

// --- Utils ---
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
}

function showNotification(message, type = 'info') {
  document.querySelectorAll('.notification').forEach(n => n.remove());
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  const bg = type === 'success' ? 'linear-gradient(135deg,#28a745 0%,#20c997 100%)' :
            type === 'error'   ? 'linear-gradient(135deg,#dc3545 0%,#e74c3c 100%)' :
            type === 'warning' ? 'linear-gradient(135deg,#ffc107 0%,#ff9800 100%)' :
                                 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)';
  notification.style.cssText = 'position:fixed;top:20px;right:20px;padding:15px 20px;border-radius:8px;color:#fff;font-weight:500;z-index:1000;max-width:350px;box-shadow:0 4px 12px rgba(0,0,0,.3);background:' + bg + ';transform:translateX(400px);transition:transform .3s ease;display:flex;align-items:center;gap:10px;';
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ';
  notification.innerHTML = `<span style="font-size:18px;">${icon}</span><span>${message}</span>`;
  document.body.appendChild(notification);
  requestAnimationFrame(() => (notification.style.transform = 'translateX(0)'));
  setTimeout(() => { notification.style.transform = 'translateX(400px)'; setTimeout(() => notification.remove(), 300); }, 4000);
}

// --- Smooth scrolling para âncoras ---
function initializeSmoothScrolling() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(link => link.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;
    e.preventDefault();
    const headerHeight = document.querySelector('header, .header')?.offsetHeight || 0;
    const targetPosition = targetElement.offsetTop - headerHeight - 20;
    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
  }));
}

// --- Lazy loading simples ---
function initializeLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target; img.src = img.dataset.src; img.classList.remove('lazy'); imageObserver.unobserve(img);
      }
    });
  });
  images.forEach(img => imageObserver.observe(img));
}

// --- Otimizações leves ---
function optimizePerformance() {
  let scrollTimeout;
  window.addEventListener('scroll', function () {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function () { /* espaço para lógicas dependentes de scroll */ }, 16);
  });

  const criticalLinks = document.querySelectorAll('a[href$=".html"]');
  criticalLinks.forEach(link => link.addEventListener('mouseenter', function () {
    const href = this.getAttribute('href');
    if (!href || document.querySelector(`link[rel="prefetch"][href="${href}"]`)) return;
    const prefetchLink = document.createElement('link');
    prefetchLink.rel = 'prefetch';
    prefetchLink.href = href;
    document.head.appendChild(prefetchLink);
  }));
}
