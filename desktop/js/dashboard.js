// Dashboard JavaScript - Funcionalidades interativas

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    // Initialize sidebar navigation
    initSidebarNavigation();
    
    // Initialize sidebar toggle
    initSidebarToggle();
    
    // Initialize section switching
    initSectionSwitching();
    
    // Initialize interactive elements
    initInteractiveElements();
    
    // Initialize real-time updates
    initRealTimeUpdates();
    
    // Initialize responsive behavior
    initResponsiveBehavior();
}

// Sidebar Navigation
function initSidebarNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get target section
            const targetSection = this.getAttribute('data-section');
            
            // Switch to target section
            switchSection(targetSection);
            
            // Add ripple effect
            createRippleEffect(this, e);
        });
    });
}

// Sidebar Toggle
function initSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            
            // Save state to localStorage
            const isCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', isCollapsed);
        });
        
        // Restore sidebar state
        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState === 'true') {
            sidebar.classList.add('collapsed');
        }
    }
}

// Section Switching
function initSectionSwitching() {
    // Set initial active section
    const initialSection = 'overview';
    switchSection(initialSection);
}

function switchSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Animate section entrance
        animateSectionEntrance(targetSection);
        
        // Load section-specific data
        loadSectionData(sectionId);
    }
}

// Interactive Elements
function initInteractiveElements() {
    // Initialize buttons
    initButtons();
    
    // Initialize progress bars
    initProgressBars();
    
    // Initialize cards
    initCards();
    
    // Initialize tooltips
    initTooltips();
}

function initButtons() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-live');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add loading state
            if (!this.disabled) {
                this.classList.add('loading');
                
                // Create ripple effect
                createRippleEffect(this, e);
                
                // Simulate action
                setTimeout(() => {
                    this.classList.remove('loading');
                    handleButtonAction(this);
                }, 1000);
            }
        });
    });
}

function handleButtonAction(button) {
    const buttonText = button.textContent.trim();
    
    switch(buttonText) {
        case 'Continuar':
        case 'Continuar Curso':
            showNotification('Redirecionando para o curso...', 'success');
            break;
        case 'Ver Detalhes':
            showNotification('Carregando detalhes do curso...', 'info');
            break;
        case 'Entrar':
            showNotification('Entrando na aula ao vivo...', 'success');
            break;
        default:
            showNotification('Ação executada com sucesso!', 'success');
    }
}

function initProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    
    // Animate progress bars on load
    progressBars.forEach(bar => {
        const targetWidth = bar.style.width;
        bar.style.width = '0%';
        
        setTimeout(() => {
            bar.style.width = targetWidth;
        }, 500);
    });
}

function initCards() {
    const cards = document.querySelectorAll('.dashboard-card, .stat-card, .course-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

function initTooltips() {
    const elementsWithTooltips = document.querySelectorAll('[data-tooltip]');
    
    elementsWithTooltips.forEach(element => {
        element.addEventListener('mouseenter', function(e) {
            showTooltip(e, this.getAttribute('data-tooltip'));
        });
        
        element.addEventListener('mouseleave', function() {
            hideTooltip();
        });
    });
}

// Real-time Updates
function initRealTimeUpdates() {
    // Update time-sensitive elements
    updateTimeElements();
    
    // Set interval for updates
    setInterval(updateTimeElements, 60000); // Update every minute
    
    // Simulate real-time notifications
    simulateNotifications();
}

function updateTimeElements() {
    const now = new Date();
    
    // Update live class countdown
    updateLiveClassCountdown(now);
    
    // Update deadline urgency
    updateDeadlineUrgency(now);
    
    // Update last activity time
    updateLastActivityTime(now);
}

function updateLiveClassCountdown(now) {
    const liveClassButton = document.querySelector('.btn-live');
    if (liveClassButton) {
        // Simulate countdown (for demo purposes)
        const hoursUntilClass = 2;
        const minutesUntilClass = 15;
        
        if (hoursUntilClass > 0) {
            liveClassButton.innerHTML = `<i class="fas fa-video"></i> Entrar (em ${hoursUntilClass}h)`;
            liveClassButton.disabled = true;
        } else if (minutesUntilClass > 15) {
            liveClassButton.innerHTML = `<i class="fas fa-video"></i> Entrar (em ${minutesUntilClass}min)`;
            liveClassButton.disabled = true;
        } else {
            liveClassButton.innerHTML = `<i class="fas fa-video"></i> Entrar Agora`;
            liveClassButton.disabled = false;
            liveClassButton.classList.add('pulse');
        }
    }
}

function updateDeadlineUrgency(now) {
    const deadlineItems = document.querySelectorAll('.deadline-item');
    
    deadlineItems.forEach(item => {
        const deadlineText = item.querySelector('.deadline-date').textContent;
        // In a real app, you would parse the actual deadline date
        // For demo, we'll simulate urgency based on existing classes
        
        if (item.classList.contains('urgent')) {
            item.style.animation = 'pulse 2s infinite';
        }
    });
}

function updateLastActivityTime(now) {
    // Update last activity timestamps
    const timeElements = document.querySelectorAll('[data-time]');
    
    timeElements.forEach(element => {
        const timestamp = element.getAttribute('data-time');
        const relativeTime = getRelativeTime(new Date(timestamp), now);
        element.textContent = relativeTime;
    });
}

function simulateNotifications() {
    // Simulate incoming notifications
    setTimeout(() => {
        showNotification('Nova mensagem do instrutor Carlos Mendes', 'info');
        updateNotificationBadge('messages', 1);
    }, 5000);
    
    setTimeout(() => {
        showNotification('Lembrete: Ensaio sobre Acessibilidade Web vence amanhã', 'warning');
        updateNotificationBadge('deadlines', 1);
    }, 10000);
}

// Responsive Behavior
function initResponsiveBehavior() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    // Handle mobile sidebar
    if (window.innerWidth <= 1024) {
        sidebar.classList.add('collapsed');
        
        // Add overlay for mobile
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.remove();
        });
        
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            if (sidebar.classList.contains('open')) {
                document.body.appendChild(overlay);
            }
        });
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) {
            sidebar.classList.remove('open');
            const overlay = document.querySelector('.sidebar-overlay');
            if (overlay) overlay.remove();
        }
    });
}

// Utility Functions
function createRippleEffect(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s linear;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

function animateSectionEntrance(section) {
    const cards = section.querySelectorAll('.dashboard-card, .stat-card, .course-card');
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function loadSectionData(sectionId) {
    // Simulate loading section-specific data
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('loading');
        
        setTimeout(() => {
            section.classList.remove('loading');
            
            // Load specific data based on section
            switch(sectionId) {
                case 'courses':
                    loadCoursesData();
                    break;
                case 'assignments':
                    loadAssignmentsData();
                    break;
                case 'performance':
                    loadPerformanceData();
                    break;
            }
        }, 500);
    }
}

function loadCoursesData() {
    // Simulate loading courses data
    console.log('Loading courses data...');
}

function loadAssignmentsData() {
    // Simulate loading assignments data
    console.log('Loading assignments data...');
}

function loadPerformanceData() {
    // Simulate loading performance data
    console.log('Loading performance data...');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add notification styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                padding: 16px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                z-index: 1000;
                animation: slideInRight 0.3s ease;
            }
            .notification-success { border-left: 4px solid #10B981; }
            .notification-error { border-left: 4px solid #EF4444; }
            .notification-warning { border-left: 4px solid #F59E0B; }
            .notification-info { border-left: 4px solid #3B82F6; }
            .notification-content { display: flex; align-items: center; gap: 8px; }
            .notification-close { background: none; border: none; cursor: pointer; }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        case 'info': return 'info-circle';
        default: return 'bell';
    }
}

function updateNotificationBadge(section, count) {
    const navLink = document.querySelector(`[data-section="${section}"]`);
    if (navLink) {
        let badge = navLink.querySelector('.notification-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'notification-badge';
            navLink.appendChild(badge);
        }
        
        const currentCount = parseInt(badge.textContent) || 0;
        const newCount = currentCount + count;
        badge.textContent = newCount;
        badge.style.display = newCount > 0 ? 'block' : 'none';
    }
}

function showTooltip(event, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
        position: absolute;
        background: #1f2937;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 0.8rem;
        z-index: 1000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = tooltip.getBoundingClientRect();
    tooltip.style.left = `${event.clientX - rect.width / 2}px`;
    tooltip.style.top = `${event.clientY - rect.height - 10}px`;
    
    setTimeout(() => {
        tooltip.style.opacity = '1';
    }, 100);
    
    window.currentTooltip = tooltip;
}

function hideTooltip() {
    if (window.currentTooltip) {
        window.currentTooltip.remove();
        window.currentTooltip = null;
    }
}

function getRelativeTime(date, now) {
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
}

function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        showNotification('Fazendo logout...', 'info');
        setTimeout(() => {
            window.location.href = '../pages/login-aluno.html';
        }, 1000);
    }
}

// Add CSS animations
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
    
    .pulse {
        animation: pulse 2s infinite;
    }
    
    .notification-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: #EF4444;
        color: white;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        font-size: 0.7rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
    }
    
    .sidebar-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 99;
    }
`;
document.head.appendChild(animationStyles);

