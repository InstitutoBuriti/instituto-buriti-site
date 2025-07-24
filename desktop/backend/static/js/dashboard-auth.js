/**
 * Sistema de Proteção de Rotas para Dashboards - Instituto Buriti
 * Protege dashboards e carrega dados específicos do usuário
 */

class DashboardAuth {
    constructor(requiredRole) {
        this.requiredRole = requiredRole;
        this.apiBaseUrl = window.location.origin;
        this.init();
    }

    async init() {
        try {
            // Verificar autenticação e proteção de rota
            const isAuthorized = await authManager.protectPage(this.requiredRole);
            
            if (isAuthorized) {
                // Carregar dados do dashboard
                await this.loadDashboardData();
                
                // Atualizar interface do usuário
                this.updateUserInterface();
                
                // Configurar eventos
                this.setupEventListeners();
            }
        } catch (error) {
            console.error('Erro ao inicializar dashboard:', error);
            showNotification('Erro ao carregar dashboard', 'error');
            
            // Redirecionar para login em caso de erro
            setTimeout(() => {
                window.location.href = authManager.getLoginPage(this.requiredRole);
            }, 2000);
        }
    }

    async loadDashboardData() {
        try {
            // Mostrar loading
            this.showLoading();

            // Carregar dados do dashboard
            const dashboardData = await authManager.getDashboardData();
            
            // Renderizar dados baseado no tipo de dashboard
            this.renderDashboard(dashboardData);
            
            // Esconder loading
            this.hideLoading();
            
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
            this.hideLoading();
            showNotification('Erro ao carregar dados do dashboard', 'error');
        }
    }

    renderDashboard(data) {
        const user = data.user;
        const stats = data.stats;

        // Atualizar informações do usuário
        this.updateUserInfo(user);

        // Renderizar baseado no tipo de dashboard
        switch (this.requiredRole) {
            case 'aluno':
                this.renderStudentDashboard(data);
                break;
            case 'instrutor':
                this.renderInstructorDashboard(data);
                break;
            case 'admin':
                this.renderAdminDashboard(data);
                break;
        }
    }

    renderStudentDashboard(data) {
        const { user, stats, upcoming_deadlines, live_classes, achievements, announcements } = data;

        // Atualizar estatísticas principais
        this.updateStatsCards([
            { id: 'total-courses', value: stats.total_courses, label: 'Cursos Matriculados' },
            { id: 'completed-courses', value: stats.completed_courses, label: 'Cursos Concluídos' },
            { id: 'avg-progress', value: `${stats.avg_progress}%`, label: 'Progresso Médio' },
            { id: 'avg-grade', value: stats.avg_grade.toFixed(1), label: 'Nota Média' }
        ]);

        // Renderizar próximos prazos
        this.renderUpcomingDeadlines(upcoming_deadlines);

        // Renderizar aulas ao vivo
        this.renderLiveClasses(live_classes);

        // Renderizar conquistas
        this.renderAchievements(achievements);

        // Renderizar anúncios
        this.renderAnnouncements(announcements);

        // Renderizar cursos matriculados
        this.renderEnrolledCourses(stats.enrollments);
    }

    renderInstructorDashboard(data) {
        const { user, stats, pending_activities, upcoming_classes, performance, announcements } = data;

        // Atualizar estatísticas principais
        this.updateStatsCards([
            { id: 'total-courses', value: stats.total_courses, label: 'Cursos Criados' },
            { id: 'total-students', value: stats.total_students, label: 'Total de Alunos' },
            { id: 'pending-grading', value: stats.pending_grading, label: 'Pendentes de Correção' },
            { id: 'avg-rating', value: stats.avg_rating.toFixed(1), label: 'Avaliação Média' }
        ]);

        // Renderizar atividades pendentes
        this.renderPendingActivities(pending_activities);

        // Renderizar próximas aulas
        this.renderUpcomingClasses(upcoming_classes);

        // Renderizar estatísticas de performance
        this.renderPerformanceStats(performance);

        // Renderizar anúncios
        this.renderAnnouncements(announcements);
    }

    renderAdminDashboard(data) {
        const { user, stats, system_alerts, recent_activities, pending_instructors, financial_stats } = data;

        // Atualizar estatísticas principais
        this.updateStatsCards([
            { id: 'total-users', value: stats.total_users, label: 'Total de Usuários' },
            { id: 'total-courses', value: stats.total_courses, label: 'Total de Cursos' },
            { id: 'total-enrollments', value: stats.total_enrollments, label: 'Matrículas Ativas' },
            { id: 'monthly-revenue', value: `R$ ${stats.monthly_revenue.toLocaleString('pt-BR')}`, label: 'Receita Mensal' }
        ]);

        // Renderizar alertas do sistema
        this.renderSystemAlerts(system_alerts);

        // Renderizar atividades recentes
        this.renderRecentActivities(recent_activities);

        // Renderizar instrutores pendentes
        this.renderPendingInstructors(pending_instructors);

        // Renderizar estatísticas financeiras
        this.renderFinancialStats(financial_stats);
    }

    updateUserInfo(user) {
        // Atualizar nome do usuário
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(element => {
            element.textContent = user.name;
        });

        // Atualizar email
        const userEmailElements = document.querySelectorAll('.user-email');
        userEmailElements.forEach(element => {
            element.textContent = user.email;
        });

        // Atualizar bio se existir
        const userBioElements = document.querySelectorAll('.user-bio');
        userBioElements.forEach(element => {
            element.textContent = user.bio || 'Sem biografia';
        });

        // Atualizar avatar se existir
        const userAvatarElements = document.querySelectorAll('.user-avatar img');
        userAvatarElements.forEach(element => {
            if (user.avatar_url) {
                element.src = user.avatar_url;
            }
        });
    }

    updateStatsCards(stats) {
        stats.forEach(stat => {
            const element = document.getElementById(stat.id);
            if (element) {
                const valueElement = element.querySelector('.stat-value');
                const labelElement = element.querySelector('.stat-label');
                
                if (valueElement) valueElement.textContent = stat.value;
                if (labelElement) labelElement.textContent = stat.label;
            }
        });
    }

    renderUpcomingDeadlines(deadlines) {
        const container = document.getElementById('upcoming-deadlines');
        if (!container) return;

        if (deadlines.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhum prazo próximo</p>';
            return;
        }

        container.innerHTML = deadlines.map(deadline => `
            <div class="deadline-item ${deadline.is_urgent ? 'urgent' : ''}">
                <div class="deadline-info">
                    <h4>${deadline.activity.title}</h4>
                    <p>${deadline.course_title}</p>
                </div>
                <div class="deadline-time">
                    <span class="days-left">${deadline.days_left} dias</span>
                    ${deadline.is_urgent ? '<i class="fas fa-exclamation-triangle urgent-icon"></i>' : ''}
                </div>
            </div>
        `).join('');
    }

    renderLiveClasses(classes) {
        const container = document.getElementById('live-classes');
        if (!container) return;

        if (classes.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhuma aula ao vivo agendada</p>';
            return;
        }

        container.innerHTML = classes.map(liveClass => `
            <div class="live-class-item">
                <div class="class-info">
                    <h4>${liveClass.title}</h4>
                    <p>${liveClass.course}</p>
                    <div class="class-schedule">
                        <i class="fas fa-calendar"></i> ${liveClass.date}
                        <i class="fas fa-clock"></i> ${liveClass.time}
                        <i class="fas fa-hourglass-half"></i> ${liveClass.duration}
                    </div>
                </div>
                <button class="join-class-btn" onclick="joinLiveClass('${liveClass.join_url}')">
                    <i class="fas fa-video"></i> Participar
                </button>
            </div>
        `).join('');
    }

    renderAchievements(achievements) {
        const container = document.getElementById('achievements');
        if (!container) return;

        container.innerHTML = achievements.map(achievement => `
            <div class="achievement-item ${achievement.earned ? 'earned' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                ${achievement.earned ? '<i class="fas fa-check achievement-check"></i>' : '<i class="fas fa-lock achievement-lock"></i>'}
            </div>
        `).join('');
    }

    renderAnnouncements(announcements) {
        const container = document.getElementById('announcements');
        if (!container) return;

        if (announcements.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhum anúncio recente</p>';
            return;
        }

        container.innerHTML = announcements.map(announcement => `
            <div class="announcement-item ${announcement.is_urgent ? 'urgent' : ''}">
                <div class="announcement-header">
                    <h4>${announcement.title}</h4>
                    <span class="announcement-date">${new Date(announcement.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <p>${announcement.content}</p>
                <div class="announcement-author">Por: ${announcement.author_name}</div>
            </div>
        `).join('');
    }

    renderEnrolledCourses(enrollments) {
        const container = document.getElementById('enrolled-courses');
        if (!container) return;

        if (enrollments.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhum curso matriculado</p>';
            return;
        }

        container.innerHTML = enrollments.map(enrollment => `
            <div class="course-item">
                <div class="course-info">
                    <h4>${enrollment.course_title}</h4>
                    <div class="course-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${enrollment.progress_percentage}%"></div>
                        </div>
                        <span class="progress-text">${enrollment.progress_percentage}%</span>
                    </div>
                </div>
                <button class="continue-course-btn" onclick="continueCourse(${enrollment.course_id})">
                    <i class="fas fa-play"></i> Continuar
                </button>
            </div>
        `).join('');
    }

    updateUserInterface() {
        const user = authManager.getUser();
        if (!user) return;

        // Atualizar dropdown de login no header
        const loginDropdown = document.querySelector('.login-dropdown');
        if (loginDropdown) {
            const loginBtn = loginDropdown.querySelector('.login-btn');
            if (loginBtn) {
                loginBtn.textContent = user.name;
            }

            const dropdownMenu = loginDropdown.querySelector('.dropdown-menu');
            if (dropdownMenu) {
                dropdownMenu.innerHTML = `
                    <a href="${authManager.getDashboardPage(user.role)}" class="dropdown-item active">Dashboard</a>
                    <a href="#" class="dropdown-item" onclick="authManager.logout()">Sair</a>
                `;
            }
        }
    }

    setupEventListeners() {
        // Configurar logout
        window.logout = () => authManager.logout();
        
        // Configurar outras funções globais
        window.joinLiveClass = (url) => {
            if (url && url !== '#') {
                window.open(url, '_blank');
            } else {
                showNotification('Link da aula não disponível', 'info');
            }
        };

        window.continueCourse = (courseId) => {
            // Implementar navegação para o curso
            showNotification('Redirecionando para o curso...', 'info');
            // window.location.href = `/course/${courseId}`;
        };
    }

    showLoading() {
        const loadingElement = document.getElementById('dashboard-loading');
        if (loadingElement) {
            loadingElement.style.display = 'flex';
        }
    }

    hideLoading() {
        const loadingElement = document.getElementById('dashboard-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
}

// Função para inicializar dashboard baseado na página atual
function initializeDashboard() {
    const path = window.location.pathname;
    let requiredRole = null;

    if (path.includes('dashboard-aluno')) {
        requiredRole = 'aluno';
    } else if (path.includes('dashboard-instrutor')) {
        requiredRole = 'instrutor';
    } else if (path.includes('dashboard-admin')) {
        requiredRole = 'admin';
    }

    if (requiredRole) {
        new DashboardAuth(requiredRole);
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initializeDashboard);

