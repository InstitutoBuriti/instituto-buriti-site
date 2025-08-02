// Dashboard JavaScript - Funcionalidades interativas

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    initializeLogout(); // ← NOVA FUNCIONALIDADE
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
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get target section
            const targetSection = this.getAttribute('data-section');
            if (targetSection) {
                showSection(targetSection);
            }
        });
    });
}

// NOVA FUNCIONALIDADE: Sistema de Logout Completo
function initializeLogout() {
    // Procurar por elementos que podem ser usados para logout
    const userMenuButton = document.querySelector('.user-menu-button, button[onclick*="Ana Silva"], .user-dropdown, .user-profile, .profile-button');
    const userNameElement = document.querySelector('.user-name, .profile-name');
    
    // Se encontrou elemento do usuário, adicionar funcionalidade de logout
    if (userMenuButton || userNameElement) {
        const targetElement = userMenuButton || userNameElement;
        
        // Criar dropdown de logout se não existir
        let dropdownMenu = document.querySelector('.user-dropdown-menu');
        if (!dropdownMenu) {
            dropdownMenu = document.createElement('div');
            dropdownMenu.className = 'user-dropdown-menu';
            dropdownMenu.style.cssText = `
                display: none;
                position: absolute;
                right: 0;
                top: 100%;
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                min-width: 180px;
                z-index: 1000;
                padding: 8px 0;
            `;
            
            dropdownMenu.innerHTML = `
                <a href="#" onclick="performLogout()" class="logout-link" style="
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    color: #dc3545;
                    text-decoration: none;
                    font-size: 14px;
                    transition: background-color 0.2s;
                ">
                    <i class="fas fa-sign-out-alt" style="margin-right: 8px;"></i>
                    Sair
                </a>
                <a href="#" onclick="showUserSettings()" class="settings-link" style="
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    color: #666;
                    text-decoration: none;
                    font-size: 14px;
                    transition: background-color 0.2s;
                    border-top: 1px solid #eee;
                ">
                    <i class="fas fa-cog" style="margin-right: 8px;"></i>
                    Configurações
                </a>
            `;
            
            // Posicionar dropdown
            const container = targetElement.parentNode;
            container.style.position = 'relative';
            container.appendChild(dropdownMenu);
            
            // Adicionar estilos hover
            const links = dropdownMenu.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = '#f8f9fa';
                });
                link.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = 'transparent';
                });
            });
        }
        
        // Toggle dropdown no clique
        targetElement.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isVisible = dropdownMenu.style.display === 'block';
            dropdownMenu.style.display = isVisible ? 'none' : 'block';
        });
        
        // Fechar dropdown ao clicar fora
        document.addEventListener('click', function(e) {
            if (!targetElement.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.style.display = 'none';
            }
        });
    }
    
    // Adicionar botão de logout alternativo se não houver menu de usuário
    if (!userMenuButton && !userNameElement) {
        addAlternativeLogoutButton();
    }
}

function addAlternativeLogoutButton() {
    // Procurar por local adequado para adicionar botão de logout
    const sidebar = document.querySelector('.sidebar, .nav-sidebar, .side-nav');
    const header = document.querySelector('.header, .top-bar, .navbar');
    
    const targetContainer = sidebar || header;
    
    if (targetContainer) {
        const logoutButton = document.createElement('button');
        logoutButton.className = 'logout-button';
        logoutButton.style.cssText = `
            background: #dc3545;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            margin: 10px;
            transition: background-color 0.2s;
        `;
        logoutButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sair';
        logoutButton.onclick = performLogout;
        
        logoutButton.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#c82333';
        });
        logoutButton.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#dc3545';
        });
        
        targetContainer.appendChild(logoutButton);
    }
}

function performLogout() {
    // Mostrar confirmação
    const confirmLogout = confirm('Tem certeza que deseja sair?');
    
    if (confirmLogout) {
        // Mostrar loading
        showLogoutLoading();
        
        // Limpar dados de autenticação
        if (typeof authManager !== 'undefined') {
            authManager.logout();
        } else {
            // Fallback manual
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            localStorage.removeItem('remembered_email');
            localStorage.removeItem('remembered_password');
        }
        
        // Simular processo de logout
        setTimeout(() => {
            // Mostrar mensagem de sucesso
            showNotification('Logout realizado com sucesso!', 'success');
            
            // Redirecionar para login após 1 segundo
            setTimeout(() => {
                // Determinar página de login baseada na URL atual
                const currentUrl = window.location.pathname;
                let loginPage = 'login-aluno.html';
                
                if (currentUrl.includes('admin')) {
                    loginPage = 'login-admin.html';
                } else if (currentUrl.includes('instrutor')) {
                    loginPage = 'login-instrutor.html';
                }
                
                window.location.href = loginPage;
            }, 1000);
        }, 1500);
    }
}

function showLogoutLoading() {
    // Criar overlay de loading
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'logout-loading';
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    
    loadingOverlay.innerHTML = `
        <div style="
            background: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        ">
            <div style="
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #dc3545;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 15px;
            "></div>
            <p style="margin: 0; color: #666; font-size: 16px;">Fazendo logout...</p>
        </div>
    `;
    
    // Adicionar animação CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(loadingOverlay);
    
    // Remover loading após logout
    setTimeout(() => {
        if (loadingOverlay.parentNode) {
            loadingOverlay.parentNode.removeChild(loadingOverlay);
        }
    }, 2000);
}

function showUserSettings() {
    showNotification('Funcionalidade de configurações em desenvolvimento!', 'info');
}

function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    let backgroundColor;
    switch(type) {
        case 'success':
            backgroundColor = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
            break;
        case 'error':
            backgroundColor = 'linear-gradient(135deg, #dc3545 0%, #e74c3c 100%)';
            break;
        case 'warning':
            backgroundColor = 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)';
            break;
        default:
            backgroundColor = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
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
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 4 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Funções originais do dashboard (mantidas)
function initSidebarToggle() {
    const toggleBtn = document.querySelector('.sidebar-toggle, .menu-toggle');
    const sidebar = document.querySelector('.sidebar, .nav-sidebar');
    
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            
            // Update main content margin
            const mainContent = document.querySelector('.main-content, .content');
            if (mainContent) {
                if (sidebar.classList.contains('collapsed')) {
                    mainContent.style.marginLeft = '60px';
                } else {
                    mainContent.style.marginLeft = '250px';
                }
            }
        });
    }
}

function initSectionSwitching() {
    const sections = document.querySelectorAll('.dashboard-section');
    
    function showSection(sectionId) {
        // Hide all sections
        sections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            
            // Trigger any section-specific initialization
            initSectionSpecific(sectionId);
        }
    }
    
    // Show first section by default
    if (sections.length > 0) {
        sections[0].style.display = 'block';
    }
    
    // Make showSection available globally
    window.showSection = showSection;
}

function initSectionSpecific(sectionId) {
    switch(sectionId) {
        case 'overview':
            initOverviewCharts();
            break;
        case 'courses':
            initCourseManagement();
            break;
        case 'students':
            initStudentManagement();
            break;
        case 'analytics':
            initAnalytics();
            break;
    }
}

function initInteractiveElements() {
    // Initialize tooltips
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
    
    // Initialize modals
    const modalTriggers = document.querySelectorAll('[data-modal]');
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            showModal(modalId);
        });
    });
    
    // Initialize dropdowns
    const dropdownTriggers = document.querySelectorAll('.dropdown-trigger');
    dropdownTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdown = this.nextElementSibling;
            if (dropdown && dropdown.classList.contains('dropdown-menu')) {
                dropdown.classList.toggle('show');
            }
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
        const openDropdowns = document.querySelectorAll('.dropdown-menu.show');
        openDropdowns.forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    });
}

function initRealTimeUpdates() {
    // Simulate real-time data updates
    setInterval(() => {
        updateDashboardStats();
    }, 30000); // Update every 30 seconds
}

function updateDashboardStats() {
    // Update various dashboard statistics
    const statElements = document.querySelectorAll('.stat-value');
    statElements.forEach(element => {
        const currentValue = parseInt(element.textContent) || 0;
        const variation = Math.floor(Math.random() * 10) - 5; // -5 to +5
        const newValue = Math.max(0, currentValue + variation);
        
        if (newValue !== currentValue) {
            animateNumberChange(element, currentValue, newValue);
        }
    });
}

function animateNumberChange(element, from, to) {
    const duration = 1000;
    const steps = 20;
    const stepValue = (to - from) / steps;
    let currentStep = 0;
    
    const interval = setInterval(() => {
        currentStep++;
        const currentValue = Math.round(from + (stepValue * currentStep));
        element.textContent = currentValue;
        
        if (currentStep >= steps) {
            clearInterval(interval);
            element.textContent = to;
        }
    }, duration / steps);
}

function initResponsiveBehavior() {
    // Handle responsive behavior
    function handleResize() {
        const width = window.innerWidth;
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (width <= 768) {
            // Mobile behavior
            if (sidebar) {
                sidebar.classList.add('mobile');
            }
            if (mainContent) {
                mainContent.style.marginLeft = '0';
            }
        } else {
            // Desktop behavior
            if (sidebar) {
                sidebar.classList.remove('mobile');
            }
            if (mainContent && !sidebar.classList.contains('collapsed')) {
                mainContent.style.marginLeft = '250px';
            }
        }
    }
    
    // Initial call
    handleResize();
    
    // Listen for resize events
    window.addEventListener('resize', handleResize);
}

// Utility functions
function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = this.getAttribute('data-tooltip');
    tooltip.style.cssText = `
        position: absolute;
        background: #333;
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1000;
        pointer-events: none;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = this.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
    
    this._tooltip = tooltip;
}

function hideTooltip() {
    if (this._tooltip) {
        this._tooltip.remove();
        this._tooltip = null;
    }
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('show');
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
}

// Dashboard-specific initialization functions
function initOverviewCharts() {
    // Initialize charts for overview section
    console.log('Initializing overview charts...');
}

function initCourseManagement() {
    // Initialize course management functionality
    console.log('Initializing course management...');
}

function initStudentManagement() {
    // Initialize student management functionality
    console.log('Initializing student management...');
}

function initAnalytics() {
    // Initialize analytics functionality
    console.log('Initializing analytics...');
}

