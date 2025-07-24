// Seja um Instrutor JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    initializeCTAButton();
    initializeScrollAnimations();
    initializeParallax();
});

function initializeAnimations() {
    // Add staggered animations to benefit cards
    const benefitCards = document.querySelectorAll('.benefit-card');
    benefitCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('animate-on-scroll');
    });

    // Add staggered animations to step cards
    const stepCards = document.querySelectorAll('.step-card');
    stepCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
        card.classList.add('animate-on-scroll');
    });

    // Add animations to requirement items
    const requirementItems = document.querySelectorAll('.requirement-item');
    requirementItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
        item.classList.add('animate-on-scroll');
    });
}

function initializeCTAButton() {
    const ctaButton = document.querySelector('.cta-button');
    
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            // Add ripple effect
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            // Remove ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
            
            // Here you would typically redirect to a form or modal
            console.log('Redirecting to instructor registration form...');
            
            // For demo purposes, show an alert
            alert('Redirecionando para o formulário de inscrição de instrutor!');
        });
    }
}

function initializeScrollAnimations() {
    // Create intersection observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe all animatable elements
    const animatableElements = document.querySelectorAll('.animate-on-scroll');
    animatableElements.forEach(el => {
        observer.observe(el);
    });
}

function initializeParallax() {
    // Add parallax effect to floating shapes
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const heroShapes = document.querySelectorAll('.hero-shape');
        const ctaShapes = document.querySelectorAll('.cta-shape');
        
        heroShapes.forEach((shape, index) => {
            const speed = 0.5 + (index * 0.2);
            shape.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
        });
        
        ctaShapes.forEach((shape, index) => {
            const speed = 0.3 + (index * 0.1);
            shape.style.transform = `translateY(${-scrolled * speed}px) rotate(${-scrolled * 0.1}deg)`;
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
}

// Add CSS for scroll animations and ripple effect
const style = document.createElement('style');
style.textContent = `
    .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    .animate-on-scroll.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: rippleEffect 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes rippleEffect {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .benefit-card:nth-child(1) { animation-delay: 0.1s; }
    .benefit-card:nth-child(2) { animation-delay: 0.2s; }
    .benefit-card:nth-child(3) { animation-delay: 0.3s; }
    .benefit-card:nth-child(4) { animation-delay: 0.4s; }
    .benefit-card:nth-child(5) { animation-delay: 0.5s; }
    .benefit-card:nth-child(6) { animation-delay: 0.6s; }
    
    .step-card:nth-child(1) { animation-delay: 0.1s; }
    .step-card:nth-child(2) { animation-delay: 0.3s; }
    .step-card:nth-child(3) { animation-delay: 0.5s; }
    .step-card:nth-child(4) { animation-delay: 0.7s; }
    
    .requirement-item:nth-child(1) { animation-delay: 0.1s; }
    .requirement-item:nth-child(2) { animation-delay: 0.2s; }
    .requirement-item:nth-child(3) { animation-delay: 0.3s; }
    .requirement-item:nth-child(4) { animation-delay: 0.4s; }
    .requirement-item:nth-child(5) { animation-delay: 0.5s; }
    .requirement-item:nth-child(6) { animation-delay: 0.6s; }
    
    /* Loading animation */
    body.loaded .hero-title,
    body.loaded .hero-subtitle {
        animation-play-state: running;
    }
    
    /* Smooth scrolling for internal links */
    html {
        scroll-behavior: smooth;
    }
`;
document.head.appendChild(style);

// Add smooth scrolling for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// Enhanced hover effects for instructor images
const instructorImages = document.querySelectorAll('.instructor-image');
instructorImages.forEach(image => {
    image.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05) rotate(2deg)';
        this.style.boxShadow = '0 25px 80px rgba(160, 32, 240, 0.3)';
    });
    
    image.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1) rotate(0deg)';
        this.style.boxShadow = '0 20px 60px rgba(160, 32, 240, 0.2)';
    });
});

// Add floating animation to dots
const floatingDots = document.querySelectorAll('.floating-dot');
floatingDots.forEach((dot, index) => {
    const randomDelay = Math.random() * 2;
    const randomDuration = 3 + Math.random() * 2;
    
    dot.style.animationDelay = `${randomDelay}s`;
    dot.style.animationDuration = `${randomDuration}s`;
});

// Performance optimization: Throttle scroll events
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

// Apply throttle to scroll handler for better performance
const throttledScrollHandler = throttle(() => {
    const scrolled = window.pageYOffset;
    const heroShapes = document.querySelectorAll('.hero-shape');
    const ctaShapes = document.querySelectorAll('.cta-shape');
    
    heroShapes.forEach((shape, index) => {
        const speed = 0.5 + (index * 0.2);
        shape.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
    });
    
    ctaShapes.forEach((shape, index) => {
        const speed = 0.3 + (index * 0.1);
        shape.style.transform = `translateY(${-scrolled * speed}px) rotate(${-scrolled * 0.1}deg)`;
    });
}, 16); // ~60fps

window.addEventListener('scroll', throttledScrollHandler);

