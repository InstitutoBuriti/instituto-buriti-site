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
            navLinks.forEach(l => l.classList.remove('active'));
            
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
    // CORREÇÃO: Seletores atualizados para encontrar elementos reais na página
    const userMenuButton = document.querySelector('.user-profile-button, button:contains("Ana Silva"), button.user-button');
    const userNameElement = document.querySelector('.user-name, .profile-name, button:contains("Ana Silva")');
    
    // Se encontrou elemento do usuário, adicionar funcionalidade de logout
    if (userMenuButton || userNameElement) {
        // CORREÇÃO: Usar qualquer elemento disponível
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
            
            // Posicionar dropdown
            const container = targetElement.parentNode;
            container.style.position = 'relative';
            container.appendChild(dropdownMenu);
            
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
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    
    loadingOverlay.innerHTML = `
        <div class="loading-spinner" style="
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        "></div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    document.body.appendChild(loadingOverlay);
}

function showUserSettings() {
    // Redirecionar para página de configurações
    window.location.href = 'configuracoes.html';
}

// Notificações
function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        opacity: 0;
        transform: translateY(-20px);
        transition: opacity 0.3s, transform 0.3s;
    `;
    
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    // Adicionar ao DOM
    document.body.appendChild(notification);
    
    // Mostrar com animação
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Resto do código do dashboard.js permanece igual...
function initSidebarToggle() {
    const toggleBtn = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');
    
    if (toggleBtn && sidebar && content) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            content.classList.toggle('expanded');
        });
    }
}

function initSectionSwitching() {
    // Inicializar mostrando a seção padrão
    showSection('overview');
    
    // Configurar links de navegação
    const navLinks = document.querySelectorAll('[data-section]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
}

function showSection(sectionId) {
    // Esconder todas as seções
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Mostrar a seção selecionada
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.style.display = 'block';
        
        // Inicializar funcionalidades específicas da seção
        initSectionSpecific(sectionId);
    }
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
    // Inicializar tooltips
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', function() {
            const text = this.getAttribute('data-tooltip');
            showTooltip(this, text);
        });
        
        tooltip.addEventListener('mouseleave', function() {
            const tooltipElement = document.querySelector('.tooltip');
            if (tooltipElement) {
                document.body.removeChild(tooltipElement);
            }
        });
    });
    
    // Inicializar modais
    const modalTriggers = document.querySelectorAll('[data-modal]');
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.getAttribute('data-modal');
            showModal(modalId);
        });
    });
}

function initRealTimeUpdates() {
    // Simular atualizações em tempo real
    setInterval(() => {
        updateDashboardStats();
    }, 30000); // Atualizar a cada 30 segundos
}

function updateDashboardStats() {
    // Simular mudanças nos dados
    const onlineUsers = Math.floor(Math.random() * 50) + 10;
    const newMessages = Math.floor(Math.random() * 5);
    
    // Atualizar contadores
    const onlineCounter = document.querySelector('.online-users-count');
    const messagesCounter = document.querySelector('.new-messages-count');
    
    if (onlineCounter) {
        animateNumberChange(onlineCounter, parseInt(onlineCounter.textContent), onlineUsers);
    }
    
    if (messagesCounter) {
        animateNumberChange(messagesCounter, parseInt(messagesCounter.textContent), newMessages);
    }
}

function animateNumberChange(element, oldValue, newValue) {
    const duration = 1000; // 1 segundo
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsedTime = currentTime - startTime;
        
        if (elapsedTime < duration) {
            const progress = elapsedTime / duration;
            const currentValue = Math.floor(oldValue + (newValue - oldValue) * progress);
            element.textContent = currentValue;
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = newValue;
        }
    }
    
    requestAnimationFrame(updateNumber);
}

function initResponsiveBehavior() {
    // Verificar tamanho inicial
    handleResize();
    
    // Adicionar listener para redimensionamento
    window.addEventListener('resize', handleResize);
}

function handleResize() {
    const width = window.innerWidth;
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');
    
    if (width < 768 && sidebar && content) {
        sidebar.classList.add('collapsed');
        content.classList.add('expanded');
    }
}

function showTooltip(element, text) {
    // Remover tooltip existente
    const existingTooltip = document.querySelector('.tooltip');
    if (existingTooltip) {
        document.body.removeChild(existingTooltip);
    }
    
    // Criar novo tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
        position: absolute;
        background-color: #333;
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1000;
        pointer-events: none;
    `;
    
    document.body.appendChild(tooltip);
    
    // Posicionar tooltip
    const rect = element.getBoundingClientRect();
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
    tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    
    if (modal) {
        modal.style.display = 'block';
        
        // Configurar botão de fechar
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                hideModal(modalId);
            });
        }
        
        // Fechar ao clicar fora
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideModal(modalId);
            }
        });
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    
    if (modal) {
        modal.style.display = 'none';
    }
}

// Funções específicas de seção
function initOverviewCharts() {
    // Implementação de gráficos
    console.log('Inicializando gráficos do dashboard');
}

function initCourseManagement() {
    // Implementação de gerenciamento de cursos
    console.log('Inicializando gerenciamento de cursos');
}

function initStudentManagement() {
    // Implementação de gerenciamento de alunos
    console.log('Inicializando gerenciamento de alunos');
}

function initAnalytics() {
    // Implementação de análises
    console.log('Inicializando análises');
}

