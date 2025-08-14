// Instituto Buriti - Main JavaScript (corrigido)

document.addEventListener('DOMContentLoaded', function() {
    normalizeAllLinksToAbsolutePages();   // ← NOVO: força /pages/...
    initializeMainNavigation();           // navegação por texto/href (agora usando absolutos)
    initializeScrollEffects();
    initializeAnimations();
    initializeMobileMenu();
    initializeFormHandlers();
    initializeSearchFunctionality();
});

// --- Normalização global de links /pages/... ---
function normalizeAllLinksToAbsolutePages() {
    const aTags = document.querySelectorAll('a[href]');
    aTags.forEach(a => {
        const raw = a.getAttribute('href')?.trim() || '';

        // ignora âncoras, externos e telefones/emails
        if (!raw || raw.startsWith('#') || raw.startsWith('http') || raw.startsWith('mailto:') || raw.startsWith('tel:')) {
            return;
        }

        // 1) Qualquer variação que contenha /pages/ vira absoluta a partir da raiz
        //    Ex.: "pages/x", "./pages/x", "../pages/x" → "/pages/x"
        const pagesMatch = raw.match(/(^|\/)pages\/(.+)/);
        if (pagesMatch) {
            a.setAttribute('href', '/pages/' + pagesMatch[2].replace(/^\/+/, ''));
            return;
        }

        // 2) Se o link é apenas "cursos.html", "quem-somos.html", etc. (estando dentro de /pages/),
        //    também viram absolutos: "/pages/arquivo.html"
        if (/^[a-z0-9\-]+\.html$/i.test(raw)) {
            a.setAttribute('href', '/pages/' + raw);
            return;
        }

        // 3) Home raiz deve ser absoluta
        if (raw === 'index.html' || raw === './index.html' || raw === '../index.html') {
            a.setAttribute('href', '/index.html');
            return;
        }
    });
}

// CORREÇÃO CRÍTICA: Navegação Principal Funcional
function initializeMainNavigation() {
    const navLinks = document.querySelectorAll('nav a, .nav-link, .menu-link, .navbar-nav a, .main-nav a');

    navLinks.forEach(link => {
        const href = (link.getAttribute('href') || '').trim();
        const linkText = (link.textContent || '').trim().toLowerCase();

        // Corrigir links baseado no texto ou href atual — sempre absolutos
        if (href === '#quem-somos' || href === 'quem-somos' || linkText.includes('quem somos') || linkText.includes('sobre')) {
            link.setAttribute('href', '/pages/quem-somos.html');
        } else if (href === '#cursos' || href === 'cursos' || linkText.includes('cursos')) {
            link.setAttribute('href', '/pages/cursos.html');
        } else if (href === '#seja-instrutor' || href === 'seja-instrutor' || linkText.includes('seja instrutor') || linkText.includes('instrutor')) {
            // NOME CORRETO DO ARQUIVO
            link.setAttribute('href', '/pages/seja-instrutor-novo.html');
        } else if (href === '#contato' || href === 'contato' || linkText.includes('contato')) {
            link.setAttribute('href', '/pages/contato.html');
        } else if (href === '#certificados' || href === 'certificados' || linkText.includes('certificados')) {
            link.setAttribute('href', '/pages/certificados.html');
        } else if (href === '#biblioteca' || href === 'biblioteca' || linkText.includes('biblioteca')) {
            link.setAttribute('href', '/pages/biblioteca.html');
        }

        // Feedback visual ao clicar (sem interromper navegação normal)
        link.addEventListener('click', function(e) {
            const targetHref = this.getAttribute('href') || '';

            // Rolagem suave apenas para âncoras locais
            if (targetHref.startsWith('#') && document.querySelector(targetHref)) {
                e.preventDefault();
                const targetElement = document.querySelector(targetHref);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
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
        link.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
            this.style.transform = 'translateY(-2px)';
        });
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Corrigir botões específicos que usam onclick para navegar
    const specificButtons = document.querySelectorAll('button[onclick*="location"], a[onclick*="location"]');
    specificButtons.forEach(button => {
        const onclickAttr = button.getAttribute('onclick');
        if (onclickAttr) {
            button.removeAttribute('onclick');

            if (onclickAttr.includes('cursos')) {
                button.setAttribute('href', '/pages/cursos.html');
            } else if (onclickAttr.includes('quem-somos')) {
                button.setAttribute('href', '/pages/quem-somos.html');
            } else if (onclickAttr.includes('seja-instrutor')) {
                button.setAttribute('href', '/pages/seja-instrutor-novo.html');
            } else if (onclickAttr.includes('contato')) {
                button.setAttribute('href', '/pages/contato.html');
            }

            // Converter button em <a> se necessário
            if (button.tagName === 'BUTTON' && button.getAttribute('href')) {
                const link = document.createElement('a');
                link.href = button.getAttribute('href');
                link.className = button.className;
                link.innerHTML = button.innerHTML;
                link.style.cssText = button.style.cssText;
                button.parentNode.replaceChild(link, button);
            }
        }
    });

    console.log('Navegação principal inicializada e corrigida (links absolutos /pages/...)');
}

function showNavigationFeedback(message, type = 'info') {
    const feedback = document.createElement('div');
    feedback.className = `navigation-feedback feedback-${type}`;

    let backgroundColor;
    switch(type) {
        case 'success': backgroundColor = '#28a745'; break;
        case 'error':   backgroundColor = '#dc3545'; break;
        case 'warning': backgroundColor = '#ffc107'; break;
        default:        backgroundColor = '#667eea';
    }

    feedback.style.cssText = `
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
        padding: 12px 24px; border-radius: 25px; color: white; font-weight: 500; z-index: 1000;
        background: ${backgroundColor}; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        font-size: 14px; opacity: 0; transition: opacity 0.3s ease;
    `;
    feedback.textContent = message;

    document.body.appendChild(feedback);
    setTimeout(() => { feedback.style.opacity = '1'; }, 100);
    setTimeout(() => {
        feedback.style.opacity = '0';
        setTimeout(() => { feedback.remove(); }, 300);
    }, 2000);
}

// Scroll Effects
function initializeScrollEffects() {
    let lastScrollTop = 0;
    const header = document.querySelector('header, .header, .navbar');

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (header) {
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
        }
        lastScrollTop = scrollTop;
    });
}

// Intersection Observer for animations
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('fade-in-up'); });
}, observerOptions);

// Enhanced hover effects for step cards
const stepCards = document.querySelectorAll('.step-card, .course-card, .news-card');
stepCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-15px) scale(1.05)';
        this.style.boxShadow = '0 25px 70px rgba(160, 32, 240, 0.2)';
    });
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1.05)';
        this.style.boxShadow = '0 25px 70px rgba(160, 32, 240, 0.2)';
    });
});

// Observe elements for animation
const animatedElements = document.querySelectorAll('.event-card, .course-card, .step-card, .news-card');
animatedElements.forEach(el => observer.observe(el));

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

    fadeElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.6s ease';
        fadeObserver.observe(element);
    });

    const counters = document.querySelectorAll('.counter, .stat-number');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) animateCounter(entry.target); });
    });
    counters.forEach(counter => counterObserver.observe(counter));
}

function animateCounter(element) {
    const target = parseInt(element.textContent) || parseInt(element.getAttribute('data-target')) || 0;
    const duration = 2000;
    const steps = 60;
    const stepValue = target / steps;
    let currentValue = 0;
    let currentStep = 0;

    const interval = setInterval(() => {
        currentStep++;
        currentValue = Math.min(Math.round(stepValue * currentStep), target);
        element.textContent = currentValue;
        if (currentStep >= steps || currentValue >= target) {
            clearInterval(interval);
            element.textContent = target;
        }
    }, duration / steps);
}

function initializeMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle, .hamburger, .menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu, .nav-mobile, .mobile-nav');
    const navLinks = document.querySelectorAll('.mobile-menu a, .nav-mobile a');

    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            this.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        document.addEventListener('click', function(e) {
            if (!mobileMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                mobileMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

function initializeFormHandlers() {
    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form, #newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput?.value || '';
            if (validateEmail(email)) {
                showNotification('Obrigado! Você foi inscrito na nossa newsletter.', 'success');
                emailInput.value = '';
            } else {
                showNotification('Por favor, insira um e-mail válido.', 'error');
            }
        });
    }

    // Contact form (compatível com name/nome e message/mensagem)
    const contactForm = document.querySelector('.contact-form, #contact-form, #contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const name = formData.get('name') || formData.get('nome');
            const email = formData.get('email');
            const message = formData.get('message') || formData.get('mensagem');

            if (name && validateEmail(String(email)) && message) {
                showNotification('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
                this.reset();
            } else {
                showNotification('Por favor, preencha todos os campos corretamente.', 'error');
            }
        });
    }
}

function initializeSearchFunctionality() {
    const searchInput = document.querySelector('.search-input, #search');
    const searchButton = document.querySelector('.search-button, .search-btn');

    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') performSearch(this.value);
        });
    }
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            const query = searchInput ? searchInput.value : '';
            performSearch(query);
        });
    }
}

function performSearch(query) {
    if (String(query).trim()) {
        showNotification(`Buscando por: "${query}"...`, 'info');
        setTimeout(() => { showNotification('Funcionalidade de busca em desenvolvimento!', 'warning'); }, 1500);
    } else {
        showNotification('Por favor, digite algo para buscar.', 'warning');
    }
}

// Utility functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(email));
}

function showNotification(message, type = 'info') {
    document.querySelectorAll('.notification').forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    let backgroundColor, icon;
    switch(type) {
        case 'success': backgroundColor = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'; icon = '✓'; break;
        case 'error':   backgroundColor = 'linear-gradient(135deg, #dc3545 0%, #e74c3c 100%)'; icon = '✕'; break;
        case 'warning': backgroundColor = 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)'; icon = '⚠'; break;
        default:        backgroundColor = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; icon = 'ℹ';
    }

    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 20px; border-radius: 8px; color: white;
        font-weight: 500; z-index: 1000; max-width: 350px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        background: ${backgroundColor}; transform: translateX(400px); transition: transform 0.3s ease;
        display: flex; align-items: center; gap: 10px;
    `;
    notification.innerHTML = `<span style="font-size: 18px;">${icon}</span><span>${message}</span>`;
    document.body.appendChild(notification);
    setTimeout(() => { notification.style.transform = 'translateX(0)'; }, 100);
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => { notification.remove(); }, 300);
    }, 4000);
}

// Smooth scrolling for anchor links
function initializeSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerHeight = document.querySelector('header, .header')?.offsetHeight || 0;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });
}
initializeSmoothScrolling();

// Lazy loading for images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    images.forEach(img => imageObserver.observe(img));
}
initializeLazyLoading();

// Performance optimization
function optimizePerformance() {
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function() {
            // espaço para lógicas dependentes de scroll
        }, 16);
    });

    const criticalLinks = document.querySelectorAll('a[href$=".html"]');
    criticalLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            const href = this.getAttribute('href');
            if (href && !document.querySelector(`link[rel="prefetch"][href="${href}"]`)) {
                const prefetchLink = document.createElement('link');
                prefetchLink.rel = 'prefetch';
                prefetchLink.href = href;
                document.head.appendChild(prefetchLink);
            }
        });
    });
}
optimizePerformance();

console.log('Main JavaScript initialized with absolute navigation corrections');
