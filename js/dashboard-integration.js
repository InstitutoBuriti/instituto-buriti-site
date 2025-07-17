// ===== INTEGRAÇÃO DASHBOARDS COM API =====
// Instituto Buriti Mobile

class DashboardManager {
    constructor() {
        this.userType = apiClient.getUserType();
        this.userData = apiClient.getCurrentUserData();
        this.dashboardData = null;
    }

    async init() {
        // Verificar autenticação
        if (!apiClient.isAuthenticated()) {
            window.location.href = '/pages/login.html';
            return;
        }

        // Verificar se está na página correta
        this.checkCorrectDashboard();

        // Carregar dados do dashboard
        await this.loadDashboardData();

        // Renderizar interface
        this.renderDashboard();

        // Configurar eventos
        this.setupEventListeners();
    }

    checkCorrectDashboard() {
        const currentPage = window.location.pathname;
        const expectedPage = `/pages/dashboard-${this.userType}.html`;

        if (!currentPage.includes(`dashboard-${this.userType}`)) {
            // Redirecionar para o dashboard correto
            window.location.href = expectedPage;
        }
    }

    async loadDashboardData() {
        try {
            showLoadingState(true);

            const response = await apiClient.makeRequest(`/api/dashboard/${this.userType}`);

            if (response.success) {
                this.dashboardData = response.data;
                console.log('Dashboard data loaded:', this.dashboardData);
            } else {
                showNotification(response.message || 'Erro ao carregar dados do dashboard', 'error');
            }
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
            showNotification('Erro de conexão ao carregar dashboard', 'error');
        } finally {
            showLoadingState(false);
        }
    }

    renderDashboard() {
        if (!this.dashboardData) {
            console.warn('Dados do dashboard não carregados');
            return;
        }

        // Atualizar informações do usuário
        this.updateUserInfo();

        // Renderizar baseado no tipo de usuário
        switch (this.userType) {
            case 'aluno':
                this.renderStudentDashboard();
                break;
            case 'instrutor':
                this.renderInstructorDashboard();
                break;
            case 'admin':
                this.renderAdminDashboard();
                break;
        }
    }

    updateUserInfo() {
        // Atualizar nome do usuário
        const userNameElements = document.querySelectorAll('.user-name, .welcome-name');
        userNameElements.forEach(element => {
            if (this.userData && this.userData.full_name) {
                element.textContent = this.userData.full_name;
            }
        });

        // Atualizar avatar
        const avatarElements = document.querySelectorAll('.user-avatar');
        avatarElements.forEach(element => {
            if (this.userData && this.userData.avatar_url) {
                element.src = this.userData.avatar_url;
            } else {
                // Avatar padrão baseado no tipo de usuário
                const defaultAvatars = {
                    'aluno': '👨‍🎓',
                    'instrutor': '👨‍🏫',
                    'admin': '👨‍💼'
                };
                element.textContent = defaultAvatars[this.userType] || '👤';
            }
        });
    }

    renderStudentDashboard() {
        const data = this.dashboardData;

        // Atualizar estatísticas
        this.updateElement('.stat-total-courses', data.stats.total_courses);
        this.updateElement('.stat-completed-courses', data.stats.completed_courses);
        this.updateElement('.stat-active-courses', data.stats.active_courses);
        this.updateElement('.stat-study-time', `${data.stats.total_study_time_hours}h`);
        this.updateElement('.stat-overall-progress', `${data.stats.overall_progress}%`);

        // Atualizar barra de progresso geral
        const progressBar = document.querySelector('.overall-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${data.stats.overall_progress}%`;
        }

        // Renderizar cursos em andamento
        this.renderActiveCourses(data.active_courses);

        // Renderizar próximas atividades
        this.renderUpcomingActivities(data.upcoming_activities);

        // Renderizar conquistas
        this.renderAchievements(data.achievements);

        // Atualizar sequência de estudos
        if (data.study_streak) {
            this.updateElement('.current-streak', data.study_streak.current_streak);
            this.updateElement('.longest-streak', data.study_streak.longest_streak);
        }
    }

    renderInstructorDashboard() {
        const data = this.dashboardData;

        // Atualizar estatísticas
        this.updateElement('.stat-total-courses', data.stats.total_courses);
        this.updateElement('.stat-published-courses', data.stats.published_courses);
        this.updateElement('.stat-total-students', data.stats.total_students);
        this.updateElement('.stat-total-revenue', `R$ ${data.stats.total_revenue.toFixed(2)}`);
        this.updateElement('.stat-average-rating', data.stats.average_rating);

        // Renderizar cursos populares
        this.renderPopularCourses(data.popular_courses);

        // Renderizar atividades recentes
        this.renderRecentActivities(data.recent_activities);

        // Atualizar estatísticas mensais
        if (data.monthly_stats) {
            this.updateElement('.monthly-enrollments', data.monthly_stats.new_enrollments);
            this.updateElement('.monthly-completions', data.monthly_stats.course_completions);
            this.updateElement('.monthly-revenue', `R$ ${data.monthly_stats.revenue.toFixed(2)}`);
        }
    }

    renderAdminDashboard() {
        const data = this.dashboardData;

        // Atualizar estatísticas gerais
        this.updateElement('.stat-total-users', data.stats.total_users);
        this.updateElement('.stat-active-users', data.stats.active_users);
        this.updateElement('.stat-students', data.stats.students);
        this.updateElement('.stat-instructors', data.stats.instructors);
        this.updateElement('.stat-total-courses', data.stats.total_courses);
        this.updateElement('.stat-total-enrollments', data.stats.total_enrollments);
        this.updateElement('.stat-total-revenue', `R$ ${data.stats.total_revenue.toFixed(2)}`);
        this.updateElement('.stat-monthly-growth', `${data.stats.monthly_growth}%`);

        // Atualizar status do sistema
        this.renderSystemStatus(data.system_status);

        // Renderizar atividades recentes
        this.renderRecentActivities(data.recent_activities);

        // Atualizar estatísticas mensais
        if (data.monthly_stats) {
            this.updateElement('.monthly-users', data.monthly_stats.new_users);
            this.updateElement('.monthly-courses', data.monthly_stats.new_courses);
            this.updateElement('.monthly-enrollments', data.monthly_stats.new_enrollments);
            this.updateElement('.monthly-revenue', `R$ ${data.monthly_stats.revenue.toFixed(2)}`);
        }
    }

    renderActiveCourses(courses) {
        const container = document.querySelector('.active-courses-container');
        if (!container || !courses) return;

        container.innerHTML = '';

        courses.forEach(enrollment => {
            const course = enrollment.course;
            const courseElement = document.createElement('div');
            courseElement.className = 'course-card';
            courseElement.innerHTML = `
                <div class="course-thumbnail">
                    <img src="${course.thumbnail_url || '/img/default-course.jpg'}" alt="${course.title}">
                </div>
                <div class="course-info">
                    <h4>${course.title}</h4>
                    <p>Instrutor: ${course.instructor?.full_name || 'N/A'}</p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${enrollment.progress_percentage}%"></div>
                    </div>
                    <span class="progress-text">${enrollment.progress_percentage}% concluído</span>
                </div>
                <button class="continue-btn" onclick="continueCourse('${course.slug}')">
                    Continuar
                </button>
            `;
            container.appendChild(courseElement);
        });
    }

    renderUpcomingActivities(activities) {
        const container = document.querySelector('.upcoming-activities-container');
        if (!container || !activities) return;

        container.innerHTML = '';

        activities.forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.className = 'activity-item';
            
            const dueDate = new Date(activity.due_date);
            const formattedDate = dueDate.toLocaleDateString('pt-BR');
            
            activityElement.innerHTML = `
                <div class="activity-icon ${activity.type}">
                    ${activity.type === 'assignment' ? '📝' : '🧪'}
                </div>
                <div class="activity-info">
                    <h5>${activity.title}</h5>
                    <p>${activity.course}</p>
                    <span class="due-date">Prazo: ${formattedDate}</span>
                </div>
            `;
            container.appendChild(activityElement);
        });
    }

    renderAchievements(achievements) {
        const container = document.querySelector('.achievements-container');
        if (!container || !achievements) return;

        container.innerHTML = '';

        achievements.forEach(achievement => {
            const achievementElement = document.createElement('div');
            achievementElement.className = 'achievement-item';
            achievementElement.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <h5>${achievement.title}</h5>
                    <p>${achievement.description}</p>
                </div>
            `;
            container.appendChild(achievementElement);
        });
    }

    renderSystemStatus(status) {
        const statusElements = {
            '.server-status': status.server,
            '.database-status': status.database,
            '.api-status': status.api,
            '.uptime-status': status.uptime
        };

        Object.entries(statusElements).forEach(([selector, value]) => {
            const element = document.querySelector(selector);
            if (element) {
                element.textContent = value;
                element.className = `status ${value === 'online' || value === 'operational' || value === 'healthy' ? 'status-good' : 'status-warning'}`;
            }
        });
    }

    renderRecentActivities(activities) {
        const container = document.querySelector('.recent-activities-container');
        if (!container || !activities) return;

        container.innerHTML = '';

        activities.forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.className = 'activity-item';
            
            const timestamp = new Date(activity.timestamp);
            const timeAgo = this.getTimeAgo(timestamp);
            
            activityElement.innerHTML = `
                <div class="activity-content">
                    <p>${activity.message}</p>
                    <span class="activity-time">${timeAgo}</span>
                </div>
            `;
            container.appendChild(activityElement);
        });
    }

    updateElement(selector, value) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = value;
        }
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Agora mesmo';
        if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h atrás`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} dias atrás`;
    }

    setupEventListeners() {
        // Botão de logout
        const logoutBtn = document.querySelector('.logout-btn, .btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await performLogout();
            });
        }

        // Botões de navegação entre abas
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(button.dataset.tab);
            });
        });

        // Atualizar dados periodicamente
        setInterval(() => {
            this.loadDashboardData();
        }, 5 * 60 * 1000); // A cada 5 minutos
    }

    switchTab(tabName) {
        // Remover classe ativa de todas as abas
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Ativar aba selecionada
        const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
        const activeContent = document.querySelector(`#${tabName}`);

        if (activeButton) activeButton.classList.add('active');
        if (activeContent) activeContent.classList.add('active');
    }
}

// ===== FUNÇÕES GLOBAIS =====

function continueCourse(courseSlug) {
    // Navegar para a página do curso
    window.location.href = `/pages/curso.html?slug=${courseSlug}`;
}

function showLoadingState(isLoading) {
    const loadingElements = document.querySelectorAll('.loading-spinner, .dashboard-loading');
    loadingElements.forEach(element => {
        element.style.display = isLoading ? 'block' : 'none';
    });

    const contentElements = document.querySelectorAll('.dashboard-content');
    contentElements.forEach(element => {
        element.style.opacity = isLoading ? '0.5' : '1';
    });
}

// ===== INICIALIZAÇÃO =====

document.addEventListener('DOMContentLoaded', function() {
    const dashboardManager = new DashboardManager();
    dashboardManager.init();
});

