// ===== INTERAÇÕES ESPECIAIS MOBILE - INSTITUTO BURITI =====

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== EFEITOS DE TOQUE PARA SEÇÃO "COMO FUNCIONA" =====
    const stepCards = document.querySelectorAll('.step-card');
    
    stepCards.forEach(card => {
        // Touch events
        card.addEventListener('touchstart', function(e) {
            this.classList.add('touched');
            
            // Adicionar efeito de ondulação
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('div');
            const size = Math.max(rect.width, rect.height);
            const x = e.touches[0].clientX - rect.left - size / 2;
            const y = e.touches[0].clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(151, 60, 191, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                z-index: 1;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
        
        card.addEventListener('touchend', function() {
            setTimeout(() => {
                this.classList.remove('touched');
            }, 150);
        });
        
        card.addEventListener('touchcancel', function() {
            this.classList.remove('touched');
        });
        
        // Mouse events para desktop
        card.addEventListener('mouseenter', function() {
            this.classList.add('touched');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('touched');
        });
    });
    
    // ===== ANIMAÇÃO DE RIPPLE =====
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);
    
    // ===== SCROLL REVEAL ANIMATIONS =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Adicionar classe de animação baseada no tipo de elemento
                if (element.classList.contains('card-mobile')) {
                    element.classList.add('animate-scale-in');
                } else if (element.classList.contains('step-card')) {
                    element.classList.add('animate-slide-up');
                } else if (element.classList.contains('hero-mobile')) {
                    element.classList.add('animate-fade-in');
                } else {
                    element.classList.add('animate-slide-up');
                }
                
                // Parar de observar após animação
                revealObserver.unobserve(element);
            }
        });
    }, observerOptions);
    
    // Observar elementos para animação
    const elementsToReveal = document.querySelectorAll('.card-mobile, .step-card, .section, .hero-mobile');
    elementsToReveal.forEach(el => revealObserver.observe(el));
    
    // ===== PARALLAX EFFECT SIMPLES =====
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax-element');
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
        
        ticking = false;
    }
    
    function requestParallaxUpdate() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestParallaxUpdate);
    
    // ===== EFEITOS DE HOVER/TOUCH PARA CARDS =====
    const cards = document.querySelectorAll('.card-mobile');
    
    cards.forEach(card => {
        card.addEventListener('touchstart', function() {
            this.classList.add('touched');
        });
        
        card.addEventListener('touchend', function() {
            setTimeout(() => {
                this.classList.remove('touched');
            }, 200);
        });
        
        card.addEventListener('mouseenter', function() {
            this.classList.add('touched');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('touched');
        });
    });
    
    // ===== EFEITOS PARA BOTÕES =====
    const buttons = document.querySelectorAll('.btn-mobile');
    
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.classList.add('micro-bounce');
        });
        
        button.addEventListener('touchend', function() {
            setTimeout(() => {
                this.classList.remove('micro-bounce');
            }, 200);
        });
        
        button.addEventListener('click', function(e) {
            // Efeito de ondulação no clique
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('div');
            const size = Math.max(rect.width, rect.height);
            const x = (e.clientX || e.touches[0].clientX) - rect.left - size / 2;
            const y = (e.clientY || e.touches[0].clientY) - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                z-index: 1;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // ===== LAZY LOADING AVANÇADO =====
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // Criar placeholder enquanto carrega
                const placeholder = document.createElement('div');
                placeholder.style.cssText = `
                    width: 100%;
                    height: 200px;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                    border-radius: 15px;
                `;
                
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.onload = function() {
                        img.classList.add('animate-fade-in');
                    };
                }
                
                imageObserver.unobserve(img);
            }
        });
    });
    
    // Observar imagens com lazy loading
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
    
    // ===== ANIMAÇÃO DE LOADING =====
    const loadingStyle = document.createElement('style');
    loadingStyle.textContent = `
        @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
    `;
    document.head.appendChild(loadingStyle);
    
    // ===== FEEDBACK TÁTIL (VIBRAÇÃO) =====
    function vibrate(pattern = [50]) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }
    
    // Adicionar vibração em botões importantes
    const importantButtons = document.querySelectorAll('.btn-mobile');
    importantButtons.forEach(button => {
        button.addEventListener('touchstart', () => vibrate([30]));
    });
    
    // ===== GESTOS DE SWIPE =====
    let startX, startY, endX, endY;
    
    document.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', function(e) {
        endX = e.changedTouches[0].clientX;
        endY = e.changedTouches[0].clientY;
        handleSwipe();
    });
    
    function handleSwipe() {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;
        
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                // Swipe right
                console.log('Swipe right detected');
            } else {
                // Swipe left
                console.log('Swipe left detected');
            }
        }
    }
    
    // ===== PERFORMANCE OPTIMIZATION =====
    
    // Throttle scroll events
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(function() {
            // Scroll ended
            document.body.classList.remove('scrolling');
        }, 150);
        
        document.body.classList.add('scrolling');
    });
    
    // Debounce resize events
    let resizeTimeout;
    window.addEventListener('resize', function() {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
        resizeTimeout = setTimeout(function() {
            // Resize ended
            window.dispatchEvent(new Event('resizeEnd'));
        }, 250);
    });
    
    // ===== ACCESSIBILITY IMPROVEMENTS =====
    
    // Adicionar indicadores de foco para navegação por teclado
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });
    
    // ===== INICIALIZAÇÃO COMPLETA =====
    console.log('🎨 Interações Mobile - Instituto Buriti carregadas com sucesso!');
    
    // Adicionar classe para indicar que JS está ativo
    document.body.classList.add('js-enabled');
    
    // Trigger evento personalizado
    window.dispatchEvent(new CustomEvent('mobileInteractionsLoaded'));
});

