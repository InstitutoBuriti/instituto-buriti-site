// Instituto Buriti - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeMainNavigation(); // ← NOVA FUNCIONALIDADE
    initializeScrollEffects();
    initializeAnimations();
    initializeMobileMenu();
    initializeFormHandlers();
    initializeSearchFunctionality();
});

// CORREÇÃO CRÍTICA: Navegação Principal Funcional
function initializeMainNavigation() {
    // Selecionar todos os links de navegação
    const navLinks = document.querySelectorAll('nav a, .nav-link, .menu-link, .navbar-nav a, .main-nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const linkText = link.textContent.trim().toLowerCase();
        
        // Corrigir links baseado no texto ou href atual
        if (href === '#quem-somos' || href === 'quem-somos' || linkText.includes('quem somos') || linkText.includes('sobre')) {
            link.setAttribute('href', 'pages/quem-somos.html');
            console.log('Corrigido link Quem Somos');
        } else if (href === '#cursos' || href === 'cursos' || linkText.includes('cursos')) {
            link.setAttribute('href', 'pages/cursos.html');
            console.log('Corrigido link Cursos');
        } else if (href === '#seja-instrutor' || href === 'seja-instrutor' || linkText.includes('seja instrutor') || linkText.includes('instrutor')) {
            link.setAttribute('href', 'pages/seja-instrutor.html');
            console.log('Corrigido link Seja Instrutor');
        } else if (href === '#contato' || href === 'contato' || linkText.includes('contato')) {
            link.setAttribute('href', 'pages/contato.html');
            console.log('Corrigido link Contato');
        } else if (href === '#certificados' || href === 'certificados' || linkText.includes('certificados')) {
            link.setAttribute('href', 'pages/certificados.html');
            console.log('Corrigido link Certificados');
        } else if (href === '#biblioteca' || href === 'biblioteca' || linkText.includes('biblioteca')) {
            link.setAttribute('href', 'pages/biblioteca.html');
            console.log('Corrigido link Biblioteca');
        }
        
        // Adicionar event listener para navegação suave e feedback
        link.addEventListener('click', function(e) {
            const targetHref = this.getAttribute('href');
            
            // Se for link interno da página atual (âncora), manter comportamento padrão
            if (targetHref.startsWith('#') && document.querySelector(targetHref)) {
                // Navegação suave para âncoras
                e.preventDefault();
                const targetElement = document.querySelector(targetHref);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                return;
            }
            
            // Para links externos, adicionar feedback visual
            if (targetHref.includes('.html')) {
                // Adicionar loading state
                this.style.opacity = '0.7';
                this.style.pointerEvents = 'none';
                
                // Mostrar notificação de carregamento
                showNavigationFeedback('Carregando página...', 'info');
                
                // Restaurar estado após um tempo
                setTimeout(() => {
                    this.style.opacity = '1';
                    this.style.pointerEvents = 'auto';
                }, 2000);
            }
        });
        
        // Adicionar efeito hover melhorado
        link.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
            this.style.transform = 'translateY(-2px)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Corrigir botões específicos que podem não estar em nav
    const specificButtons = document.querySelectorAll('button[onclick*="location"], a[onclick*="location"]');
    specificButtons.forEach(button => {
        const onclickAttr = button.getAttribute('onclick');
        if (onclickAttr) {
            // Remover onclick e adicionar href correto
            button.removeAttribute('onclick');
            
            if (onclickAttr.includes('cursos')) {
                button.setAttribute('href', 'pages/cursos.html');
            } else if (onclickAttr.includes('quem-somos')) {
                button.setAttribute('href', 'pages/quem-somos.html');
            } else if (onclickAttr.includes('contato')) {
                button.setAttribute('href', 'pages/contato.html');
            }
            
            // Converter button para link se necessário
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
    
    console.log('Navegação principal inicializada e corrigida');
}

function showNavigationFeedback(message, type = 'info') {
    // Criar elemento de feedback
    const feedback = document.createElement('div');
    feedback.className = `navigation-feedback feedback-${type}`;
    
    let backgroundColor;
    switch(type) {
        case 'success':
            backgroundColor = '#28a745';
            break;
        case 'error':
            backgroundColor = '#dc3545';
            break;
        case 'warning':
            backgroundColor = '#ffc107';
            break;
        default:
            backgroundColor = '#667eea';
    }
    
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        border-radius: 25px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        background: ${backgroundColor};
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        font-size: 14px;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    feedback.textContent = message;
    
    document.body.appendChild(feedback);
    
    // Animar entrada
    setTimeout(() => {
        feedback.style.opacity = '1';
    }, 100);
    
    // Remover após 2 segundos
    setTimeout(() => {
        feedback.style.opacity = '0';
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 300);
    }, 2000);
}

// Scroll Effects
function initializeScrollEffects() {
    let lastScrollTop = 0;
    const header = document.querySelector('header, .header, .navbar');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Header hide/show on scroll
        if (header) {
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                header.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                header.style.transform = 'translateY(0)';
            }
        }
        
        lastScrollTop = scrollTop;
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
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
animatedElements.forEach(el => {
    observer.observe(el);
});

function initializeAnimations() {
    // Fade in animation for elements
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
    
    // Counter animation
    const counters = document.querySelectorAll('.counter, .stat-number');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
            }
        });
    });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
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
            
            // Prevent body scroll when menu is open
            if (mobileMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Close menu when clicking on links
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu when clicking outside
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
            const email = emailInput.value;
            
            if (validateEmail(email)) {
                // Simulate newsletter subscription
                showNotification('Obrigado! Você foi inscrito na nossa newsletter.', 'success');
                emailInput.value = '';
            } else {
                showNotification('Por favor, insira um e-mail válido.', 'error');
            }
        });
    }
    
    // Contact form
    const contactForm = document.querySelector('.contact-form, #contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');
            
            if (name && validateEmail(email) && message) {
                // Simulate form submission
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
            if (e.key === 'Enter') {
                performSearch(this.value);
            }
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
    if (query.trim()) {
        // Simulate search functionality
        showNotification(`Buscando por: "${query}"...`, 'info');
        
        // In a real implementation, this would redirect to search results
        setTimeout(() => {
            showNotification('Funcionalidade de busca em desenvolvimento!', 'warning');
        }, 1500);
    } else {
        showNotification('Por favor, digite algo para buscar.', 'warning');
    }
}

// Utility functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    let backgroundColor;
    let icon;
    switch(type) {
        case 'success':
            backgroundColor = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
            icon = '✓';
            break;
        case 'error':
            backgroundColor = 'linear-gradient(135deg, #dc3545 0%, #e74c3c 100%)';
            icon = '✕';
            break;
        case 'warning':
            backgroundColor = 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)';
            icon = '⚠';
            break;
        default:
            backgroundColor = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            icon = 'ℹ';
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        max-width: 350px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        background: ${backgroundColor};
        transform: translateX(400px);
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    notification.innerHTML = `
        <span style="font-size: 18px;">${icon}</span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
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
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize smooth scrolling
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
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// Initialize lazy loading
initializeLazyLoading();

// Performance optimization
function optimizePerformance() {
    // Debounce scroll events
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(function() {
            // Scroll-dependent operations here
        }, 16); // ~60fps
    });
    
    // Preload critical resources
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

// Initialize performance optimizations
optimizePerformance();

console.log('Main JavaScript initialized with navigation corrections');

