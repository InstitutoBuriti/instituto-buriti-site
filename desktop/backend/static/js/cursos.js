// Cursos Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS (Animate On Scroll)
    initializeAOS();
    
    // Initialize course card interactions
    initializeCourseCards();
    
    // Initialize scroll animations
    initializeScrollAnimations();
});

// Initialize AOS library simulation
function initializeAOS() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
            }
        });
    }, observerOptions);

    // Observe all elements with data-aos attribute
    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });
}

// Initialize course card interactions
function initializeCourseCards() {
    const courseCards = document.querySelectorAll('.course-card');
    
    courseCards.forEach((card, index) => {
        // Add staggered animation delay
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Add hover sound effect (visual feedback)
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        // Add click handler for course buttons
        const courseBtn = card.querySelector('.course-btn');
        if (courseBtn) {
            courseBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Add click animation
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
                
                // Get course title for future navigation
                const courseTitle = card.querySelector('.course-title').textContent;
                console.log(`Navegando para detalhes do curso: ${courseTitle}`);
                
                // Future: Navigate to course details page
                // window.location.href = `curso-detalhes.html?curso=${encodeURIComponent(courseTitle)}`;
            });
        }
    });
}

// Initialize scroll animations
function initializeScrollAnimations() {
    // Hero subtitle animation
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        setTimeout(() => {
            heroSubtitle.style.opacity = '1';
            heroSubtitle.style.transform = 'translateY(0)';
        }, 300);
    }
    
    // Floating shapes animation
    const shapes = document.querySelectorAll('.floating-shape');
    shapes.forEach((shape, index) => {
        shape.style.animationDelay = `${index * 2}s`;
    });
    
    // CTA section scroll trigger
    const ctaSection = document.querySelector('.cta-section');
    if (ctaSection) {
        const ctaObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.3 });
        
        ctaObserver.observe(ctaSection);
    }
}

// Add smooth scroll behavior for CTA buttons
document.querySelectorAll('.cta-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        // Add click animation
        this.style.transform = 'translateY(-3px) scale(0.98)';
        setTimeout(() => {
            this.style.transform = 'translateY(-3px) scale(1)';
        }, 150);
    });
});

// Add parallax effect to abstract shapes
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const shapes = document.querySelectorAll('.floating-shape, .cta-shape');
    
    shapes.forEach((shape, index) => {
        const speed = 0.5 + (index * 0.1);
        const yPos = -(scrolled * speed);
        shape.style.transform = `translateY(${yPos}px) rotate(${scrolled * 0.1}deg)`;
    });
});

// Course filter functionality (for future enhancement)
function initializeCourseFilters() {
    // This function can be expanded to add filtering by category, price, method, etc.
    console.log('Course filters ready for implementation');
}

// Search functionality (for future enhancement)
function initializeCourseSearch() {
    // This function can be expanded to add search functionality
    console.log('Course search ready for implementation');
}

