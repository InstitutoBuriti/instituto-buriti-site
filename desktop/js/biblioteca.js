/* ===== BIBLIOTECA GROK - FUNCIONALIDADES ESPECÍFICAS ===== */

// Aguarda o DOM estar carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎨 GROK DESIGN: Inicializando funcionalidades específicas...');
    
    // Inicializar funcionalidades
    initializeNavigation();
    initializeFilters();
    initializeCarousel();
    initializePagination();
    initializeAnimations();
    
    console.log('✅ GROK DESIGN: Todas as funcionalidades inicializadas');
});

/* ===== NAVEGAÇÃO ===== */
function initializeNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    const loginDropdown = document.getElementById('loginDropdown');
    const loginMenu = document.getElementById('loginMenu');
    
    // Menu Mobile Toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Fechar menu ao clicar em um link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
    
    // Login Dropdown (funcionalidade adicional se necessário)
    if (loginDropdown && loginMenu) {
        loginDropdown.addEventListener('click', function(e) {
            e.preventDefault();
            loginMenu.classList.toggle('show');
        });
        
        // Fechar dropdown ao clicar fora
        document.addEventListener('click', function(e) {
            if (!loginDropdown.contains(e.target)) {
                loginMenu.classList.remove('show');
            }
        });
    }
}

/* ===== FILTROS APRIMORADOS ===== */
function initializeFilters() {
    const searchInput = document.getElementById('searchCourse');
    const levelSelect = document.getElementById('courseLevel');
    const durationSelect = document.getElementById('courseDuration');
    const clearFiltersBtn = document.getElementById('clearFilters');
    
    // Aplicar filtros com debounce
    let filterTimeout;
    
    function applyFiltersWithDelay() {
        clearTimeout(filterTimeout);
        filterTimeout = setTimeout(() => {
            applyFilters();
        }, 300);
    }
    
    // Event listeners para filtros
    if (searchInput) {
        searchInput.addEventListener('input', applyFiltersWithDelay);
    }
    
    if (levelSelect) {
        levelSelect.addEventListener('change', applyFilters);
    }
    
    if (durationSelect) {
        durationSelect.addEventListener('change', applyFilters);
    }
    
    // Limpar filtros
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            // Limpar campos
            if (searchInput) searchInput.value = '';
            if (levelSelect) levelSelect.value = '';
            if (durationSelect) durationSelect.value = '';
            
            // Aplicar filtros limpos
            applyFilters();
            
            // Feedback visual
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    }
    
    function applyFilters() {
        // Esta função será integrada com o bibliotecaManager existente
        if (typeof bibliotecaManager !== 'undefined' && bibliotecaManager.applyFilters) {
            const filters = {
                search: searchInput ? searchInput.value : '',
                level: levelSelect ? levelSelect.value : '',
                duration: durationSelect ? durationSelect.value : ''
            };
            
            bibliotecaManager.applyFilters(filters);
        }
    }
}

/* ===== CAROUSEL DE DESTAQUES ===== */
function initializeCarousel() {
    const carousel = document.getElementById('highlightsCarousel');
    const dotsContainer = document.getElementById('carouselDots');
    
    if (!carousel) return;
    
    let currentSlide = 0;
    const slides = carousel.children;
    const totalSlides = slides.length;
    
    // Criar dots
    if (dotsContainer && totalSlides > 1) {
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('div');
            dot.className = 'carousel-dot';
            if (i === 0) dot.classList.add('active');
            
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }
    
    function goToSlide(index) {
        currentSlide = index;
        const translateX = -index * 100;
        carousel.style.transform = `translateX(${translateX}%)`;
        
        // Atualizar dots
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
    
    // Auto-play (opcional)
    if (totalSlides > 1) {
        setInterval(() => {
            currentSlide = (currentSlide + 1) % totalSlides;
            goToSlide(currentSlide);
        }, 5000);
    }
}

/* ===== PAGINAÇÃO ===== */
function initializePagination() {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const paginationNumbers = document.getElementById('paginationNumbers');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (typeof bibliotecaManager !== 'undefined' && bibliotecaManager.previousPage) {
                bibliotecaManager.previousPage();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (typeof bibliotecaManager !== 'undefined' && bibliotecaManager.nextPage) {
                bibliotecaManager.nextPage();
            }
        });
    }
}

/* ===== ANIMAÇÕES E EFEITOS ===== */
function initializeAnimations() {
    // Intersection Observer para animações de entrada
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observar elementos animáveis
    const animatedElements = document.querySelectorAll('.course-card, .testimonial-card, .highlight-card');
    animatedElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });
    
    // Smooth scroll para links internos
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Parallax suave para elementos decorativos
    window.addEventListener('scroll', throttle(() => {
        const scrolled = window.pageYOffset;
        const decorations = document.querySelectorAll('.decoration-circle');
        
        decorations.forEach((decoration, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrolled * speed);
            decoration.style.transform = `translateY(${yPos}px)`;
        });
    }, 16));
}

/* ===== UTILITÁRIOS ===== */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

/* ===== INTEGRAÇÃO COM BIBLIOTECA MANAGER ===== */
// Função para atualizar a contagem de cursos
function updateCoursesCount(count) {
    const coursesCount = document.getElementById('coursesCount');
    if (coursesCount) {
        coursesCount.textContent = `${count} curso${count !== 1 ? 's' : ''}`;
    }
}

// Função para mostrar/ocultar loading
function toggleLoading(show) {
    const loadingState = document.getElementById('loadingState');
    const coursesGrid = document.getElementById('coursesGrid');
    
    if (loadingState) {
        loadingState.style.display = show ? 'block' : 'none';
    }
    
    if (coursesGrid) {
        coursesGrid.style.display = show ? 'none' : 'grid';
    }
}

// Função para renderizar curso com design Grok
function renderCourseCard(course) {
    return `
        <div class="course-card" data-course-id="${course.id}">
            <img src="${course.image || '../images/course-placeholder.jpg'}" alt="${course.title}" class="course-image">
            <div class="course-content">
                <h3 class="course-title">${course.title}</h3>
                <p class="course-description">${course.description}</p>
                <div class="course-details">
                    <span class="course-badge">${course.level || 'Todos os níveis'}</span>
                    <span class="course-badge">${course.duration || 'Flexível'}</span>
                    <span class="course-badge">${course.category || 'Geral'}</span>
                </div>
                <div class="course-footer">
                    <div class="course-price">${course.price || 'Gratuito'}</div>
                    <a href="curso-detalhes.html?id=${course.id}" class="course-btn">
                        Ver Detalhes
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Função para renderizar cursos em destaque
function renderHighlightCard(course) {
    return `
        <div class="highlight-card" data-course-id="${course.id}">
            <div class="highlight-badge">Destaque</div>
            <img src="${course.image || '../images/course-placeholder.jpg'}" alt="${course.title}" class="course-image">
            <div class="course-content">
                <h3 class="course-title">${course.title}</h3>
                <p class="course-description">${course.description}</p>
                <div class="course-footer">
                    <div class="course-price">${course.price || 'Gratuito'}</div>
                    <a href="curso-detalhes.html?id=${course.id}" class="course-btn">
                        Ver Detalhes
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Exportar funções para uso global
window.GrokDesign = {
    updateCoursesCount,
    toggleLoading,
    renderCourseCard,
    renderHighlightCard
};

console.log('🎨 GROK DESIGN: Biblioteca de funcionalidades carregada');

