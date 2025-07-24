// Instituto Buriti - Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-item a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
        
        lastScrollTop = scrollTop;
    });

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

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.event-card, .course-card, .step-card, .news-card');
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // Enhanced hover effects for step cards
    const stepCards = document.querySelectorAll('.step-card');
    stepCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.05)';
            this.style.boxShadow = '0 25px 70px rgba(160, 32, 240, 0.2)';
            
            const stepImage = this.querySelector('.step-image');
            if (stepImage) {
                stepImage.style.transform = 'scale(1.15)';
                stepImage.style.borderColor = 'var(--primary-purple)';
            }
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = 'none';
            
            const stepImage = this.querySelector('.step-image');
            if (stepImage) {
                stepImage.style.transform = 'scale(1)';
                stepImage.style.borderColor = 'var(--light-purple)';
            }
        });
    });

    // Image loading optimization
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });

        img.addEventListener('error', function() {
            console.warn('Failed to load image:', this.src);
            this.style.opacity = '0.5';
            this.style.filter = 'grayscale(100%)';
        });

        // Set initial opacity
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        
        // If image is already loaded
        if (img.complete) {
            img.style.opacity = '1';
        }
    });

    // Enhanced button interactions
    const buttons = document.querySelectorAll('.course-btn, .btn-primary, .btn-secondary, .login-btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });

        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });

        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(-1px) scale(0.98)';
        });

        button.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-3px) scale(1)';
        });
    });

    // Floating elements animation
    const floatingElements = document.querySelectorAll('.floating-circle-1, .floating-circle-2');
    floatingElements.forEach((element, index) => {
        const duration = 3000 + (index * 1000);
        const amplitude = 20 + (index * 10);
        
        setInterval(() => {
            const randomY = Math.sin(Date.now() / duration) * amplitude;
            const randomX = Math.cos(Date.now() / (duration * 1.5)) * (amplitude / 2);
            element.style.transform = `translate(${randomX}px, ${randomY}px)`;
        }, 50);
    });

    // SVG animations
    const svgElements = document.querySelectorAll('.svg-decoration circle, .svg-decoration path');
    svgElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transition = 'opacity 1s ease';
        
        setTimeout(() => {
            element.style.opacity = '0.7';
        }, Math.random() * 2000);
    });

    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-image, .floating-elements');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });

    // Dynamic gradient animation
    const gradientElements = document.querySelectorAll('.login-btn, .course-btn, .btn-primary');
    gradientElements.forEach(element => {
        element.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;
            
            this.style.background = `linear-gradient(${45 + deltaX * 20}deg, var(--primary-purple), var(--primary-orange))`;
        });

        element.addEventListener('mouseleave', function() {
            this.style.background = 'linear-gradient(135deg, var(--primary-purple), var(--primary-orange))';
        });
    });

    // Course card enhanced interactions
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const image = this.querySelector('.course-image');
            if (image) {
                image.style.transform = 'scale(1.1)';
            }
        });

        card.addEventListener('mouseleave', function() {
            const image = this.querySelector('.course-image');
            if (image) {
                image.style.transform = 'scale(1)';
            }
        });
    });

    // News card interactions
    const newsCards = document.querySelectorAll('.news-card');
    newsCards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('h3').textContent;
            console.log('News article clicked:', title);
            // Here you could add navigation to full article
        });
    });

    // Loading state management
    function showLoading(element) {
        element.classList.add('loading');
    }

    function hideLoading(element) {
        element.classList.remove('loading');
    }

    // Form validation (if forms are added later)
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Utility function for smooth animations
    function animateElement(element, properties, duration = 300) {
        return new Promise(resolve => {
            const startTime = performance.now();
            const startValues = {};
            
            Object.keys(properties).forEach(prop => {
                startValues[prop] = parseFloat(getComputedStyle(element)[prop]) || 0;
            });

            function animate(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                Object.keys(properties).forEach(prop => {
                    const startValue = startValues[prop];
                    const endValue = properties[prop];
                    const currentValue = startValue + (endValue - startValue) * progress;
                    element.style[prop] = currentValue + (prop.includes('opacity') ? '' : 'px');
                });

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            }

            requestAnimationFrame(animate);
        });
    }

    // Performance optimization
    let ticking = false;

    function updateAnimations() {
        // Update any continuous animations here
        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateAnimations);
            ticking = true;
        }
    }

    // Throttled scroll handler
    window.addEventListener('scroll', requestTick);

    // Preload critical images
    const criticalImages = [
        'images/LogomarcaInstitutoBuriti.png',
        'images/ChatGPTImage10dejul.de2025,23_58_19.png'
    ];

    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    console.log('Instituto Buriti - Website loaded successfully!');
});

