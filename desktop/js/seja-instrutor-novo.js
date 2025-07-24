// Seja um Instrutor JavaScript - Versão Corrigida

document.addEventListener('DOMContentLoaded', function() {
    initializeScrollAnimations();
    initializeCTAButton();
    initializeHoverEffects();
});

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

    // Observe all cards and sections
    const animatableElements = document.querySelectorAll('.benefit-card, .step-card, .requirement-item');
    animatableElements.forEach(el => {
        observer.observe(el);
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
            
            // For demo purposes, show an alert
            alert('Redirecionando para o formulário de inscrição de instrutor!');
        });
    }
}

function initializeHoverEffects() {
    // Enhanced hover effects for instructor images
    const instructorImages = document.querySelectorAll('.instructor-main, .instructor-floating');
    instructorImages.forEach(image => {
        image.addEventListener('mouseenter', function() {
            this.style.transform = this.classList.contains('instructor-main') 
                ? 'translate(-50%, -50%) scale(1.05) rotate(2deg)'
                : 'scale(1.05) rotate(-2deg)';
        });
        
        image.addEventListener('mouseleave', function() {
            this.style.transform = this.classList.contains('instructor-main')
                ? 'translate(-50%, -50%) scale(1) rotate(0deg)'
                : 'scale(1) rotate(0deg)';
        });
    });
}

// Add CSS for animations and ripple effect
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        animation: slideUpFade 0.6s ease-out forwards;
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
    
    @keyframes slideUpFade {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Smooth scrolling */
    html {
        scroll-behavior: smooth;
    }
    
    /* Loading animation */
    body.loaded .hero-title,
    body.loaded .hero-subtitle {
        animation-play-state: running;
    }
`;
document.head.appendChild(style);

// Add loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// Add floating animation to dots with random timing
const floatingDots = document.querySelectorAll('.dot');
floatingDots.forEach((dot, index) => {
    const randomDelay = Math.random() * 2;
    const randomDuration = 3 + Math.random() * 2;
    
    dot.style.animationDelay = `${randomDelay}s`;
    dot.style.animationDuration = `${randomDuration}s`;
});

