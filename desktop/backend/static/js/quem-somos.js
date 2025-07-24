// Quem Somos - JavaScript Functionality

// Carousel functionality
let slideIndex = 1;
showSlide(slideIndex);

// Auto-advance carousel
setInterval(() => {
    slideIndex++;
    if (slideIndex > 3) slideIndex = 1;
    showSlide(slideIndex);
}, 5000);

function currentSlide(n) {
    showSlide(slideIndex = n);
}

function showSlide(n) {
    const slides = document.querySelectorAll('.carousel-item');
    const dots = document.querySelectorAll('.dot');
    
    if (n > slides.length) slideIndex = 1;
    if (n < 1) slideIndex = slides.length;
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    if (slides[slideIndex - 1]) {
        slides[slideIndex - 1].classList.add('active');
    }
    if (dots[slideIndex - 1]) {
        dots[slideIndex - 1].classList.add('active');
    }
}

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all evento items
document.querySelectorAll('.evento-item').forEach(item => {
    observer.observe(item);
});

// Smooth scrolling for internal links
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

// Add hover effects to valor cards
document.querySelectorAll('.valor-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroSection = document.querySelector('.hero-section');
    const shapes = document.querySelectorAll('.shape');
    
    if (heroSection) {
        const rate = scrolled * -0.5;
        heroSection.style.transform = `translateY(${rate}px)`;
    }
    
    shapes.forEach((shape, index) => {
        const rate = scrolled * (0.2 + index * 0.1);
        shape.style.transform = `translate(-50%, -50%) translateY(${rate}px) rotate(${rate * 0.5}deg)`;
    });
});

// Loading animation
document.addEventListener('DOMContentLoaded', function() {
    // Animate hero subtitle
    const subtitle = document.querySelector('.hero-subtitle');
    if (subtitle) {
        setTimeout(() => {
            subtitle.classList.add('slide-up');
        }, 500);
    }
    
    // Animate section titles on scroll
    const sectionTitles = document.querySelectorAll('.section-title');
    const titleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.5 });
    
    sectionTitles.forEach(title => {
        title.style.opacity = '0';
        title.style.transform = 'translateY(30px)';
        title.style.transition = 'all 0.6s ease';
        titleObserver.observe(title);
    });
});

// Add dynamic background to abstract shapes
function animateShapes() {
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach((shape, index) => {
        const randomX = Math.sin(Date.now() * 0.001 + index) * 10;
        const randomY = Math.cos(Date.now() * 0.001 + index) * 10;
        shape.style.transform += ` translate(${randomX}px, ${randomY}px)`;
    });
    requestAnimationFrame(animateShapes);
}

// Start shape animation
animateShapes();

