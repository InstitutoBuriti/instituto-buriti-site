// Dashboard Data Integration - Integração de dados reais para dashboards
// Substitui dados mock por dados reais do Supabase

import { dataService } from './data-service.js';
import { customAuth } from './custom-auth.js';

class DashboardDataIntegration {
    constructor() {
        this.currentUser = null;
        this.refreshInterval = null;
        this.subscriptions = [];
    }

    // Inicializa integração de dados
    async initialize() {
        try {
            this.currentUser = customAuth.getCurrentUser();
            if (!this.currentUser) {
                throw new Error('Usuário não autenticado');
            }

            console.log('Inicializando integração de dados para:', this.currentUser.role);
            
            // Carrega dados iniciais
            await this.loadInitialData();
            
            // Configura atualizações automáticas
            this.setupAutoRefresh();
            
            // Configura subscriptions em tempo real
            this.setupRealTimeSubscriptions();
            
        } catch (error) {
            console.error('Erro ao inicializar integração de dados:', error);
            this.showError('Erro ao carregar dados do dashboard');
        }
    }

    // Carrega dados iniciais baseado no papel do usuário
    async loadInitialData() {
        const userRole = this.currentUser.role;
        
        try {
            // Mostra loading
            this.showLoading(true);
            
            switch (userRole) {
                case 'admin':
                    await this.loadAdminData();
                    break;
                case 'instrutor':
                    await this.loadInstructorData();
                    break;
                case 'aluno':
                    await this.loadStudentData();
                    break;
                default:
                    throw new Error('Papel de usuário não reconhecido');
            }
            
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
            this.showError('Erro ao carregar dados');
        } finally {
            this.showLoading(false);
        }
    }

    // Carrega dados para dashboard admin
    async loadAdminData() {
        try {
            // Estatísticas gerais
            const stats = await dataService.getDashboardStats(this.currentUser.id, 'admin');
            this.updateStatsCards(stats);
            
            // Usuários recentes
            const recentUsers = await dataService.getUsers();
            this.updateRecentUsers(recentUsers.slice(0, 5));
            
            // Cursos populares
            const courses = await dataService.getCourses({ ativo: true });
            this.updatePopularCourses(courses.slice(0, 5));
            
            // Matrículas recentes
            const enrollments = await dataService.getEnrollments();
            this.updateRecentEnrollments(enrollments.slice(0, 10));
            
            console.log('Dados admin carregados com sucesso');
            
        } catch (error) {
            console.error('Erro ao carregar dados admin:', error);
            throw error;
        }
    }

    // Carrega dados para dashboard instrutor
    async loadInstructorData() {
        try {
            // Estatísticas do instrutor
            const stats = await dataService.getDashboardStats(this.currentUser.id, 'instrutor');
            this.updateStatsCards(stats);
            
            // Cursos do instrutor
            const instructorCourses = await dataService.getCourses({ 
                instrutor_id: this.currentUser.id 
            });
            this.updateInstructorCourses(instructorCourses);
            
            // Alunos dos cursos
            const courseIds = instructorCourses.map(c => c.id);
            if (courseIds.length > 0) {
                const enrollments = await dataService.getEnrollments({ 
                    curso_id: courseIds 
                });
                this.updateStudentsList(enrollments);
            }
            
            console.log('Dados instrutor carregados com sucesso');
            
        } catch (error) {
            console.error('Erro ao carregar dados instrutor:', error);
            throw error;
        }
    }

    // Carrega dados para dashboard aluno
    async loadStudentData() {
        try {
            // Estatísticas do aluno
            const stats = await dataService.getDashboardStats(this.currentUser.id, 'aluno');
            this.updateStatsCards(stats);
            
            // Cursos matriculados
            const enrollments = await dataService.getEnrollments({ 
                usuario_id: this.currentUser.id 
            });
            this.updateEnrolledCourses(enrollments);
            
            // Progresso dos cursos
            this.updateCourseProgress(enrollments);
            
            // Cursos recomendados
            const recommendedCourses = await dataService.getCourses({ ativo: true });
            this.updateRecommendedCourses(recommendedCourses.slice(0, 3));
            
            console.log('Dados aluno carregados com sucesso');
            
        } catch (error) {
            console.error('Erro ao carregar dados aluno:', error);
            throw error;
        }
    }

    // Atualiza cards de estatísticas
    updateStatsCards(stats) {
        const statsContainer = document.querySelector('.stats-grid');
        if (!statsContainer) return;

        // Limpa cards existentes
        statsContainer.innerHTML = '';

        // Cria cards baseado no papel do usuário
        const userRole = this.currentUser.role;
        let cardsData = [];

        if (userRole === 'admin') {
            cardsData = [
                { icon: 'fas fa-users', title: 'Total de Usuários', value: stats.totalUsers || 0 },
                { icon: 'fas fa-book', title: 'Total de Cursos', value: stats.totalCourses || 0 },
                { icon: 'fas fa-graduation-cap', title: 'Matrículas', value: stats.totalEnrollments || 0 },
                { icon: 'fas fa-chart-line', title: 'Usuários Ativos', value: stats.activeUsers || 0 }
            ];
        } else if (userRole === 'instrutor') {
            cardsData = [
                { icon: 'fas fa-book', title: 'Meus Cursos', value: stats.totalCourses || 0 },
                { icon: 'fas fa-users', title: 'Total de Alunos', value: stats.totalStudents || 0 },
                { icon: 'fas fa-check-circle', title: 'Cursos Concluídos', value: stats.completedCourses || 0 },
                { icon: 'fas fa-star', title: 'Avaliação Média', value: (stats.averageRating || 0).toFixed(1) }
            ];
        } else if (userRole === 'aluno') {
            cardsData = [
                { icon: 'fas fa-book-open', title: 'Cursos Matriculados', value: stats.enrolledCourses || 0 },
                { icon: 'fas fa-check-circle', title: 'Concluídos', value: stats.completedCourses || 0 },
                { icon: 'fas fa-clock', title: 'Em Andamento', value: stats.inProgressCourses || 0 },
                { icon: 'fas fa-hourglass-half', title: 'Horas Totais', value: stats.totalHours || 0 }
            ];
        }

        // Cria HTML dos cards
        cardsData.forEach(card => {
            const cardElement = this.createStatCard(card);
            statsContainer.appendChild(cardElement);
        });
    }

    // Cria um card de estatística
    createStatCard(cardData) {
        const card = document.createElement('div');
        card.className = 'stat-card';
        card.innerHTML = `
            <div class="stat-icon">
                <i class="${cardData.icon}"></i>
            </div>
            <div class="stat-info">
                <h3>${cardData.value}</h3>
                <p>${cardData.title}</p>
            </div>
        `;
        return card;
    }

    // Atualiza lista de usuários recentes (admin)
    updateRecentUsers(users) {
        const container = document.querySelector('.recent-users-list');
        if (!container) return;

        container.innerHTML = users.map(user => `
            <div class="user-item">
                <div class="user-avatar">
                    ${user.nome.charAt(0).toUpperCase()}
                </div>
                <div class="user-info">
                    <h4>${user.nome}</h4>
                    <p>${user.email}</p>
                    <span class="user-role">${user.role || 'aluno'}</span>
                </div>
            </div>
        `).join('');
    }

    // Atualiza cursos populares (admin)
    updatePopularCourses(courses) {
        const container = document.querySelector('.popular-courses-list');
        if (!container) return;

        container.innerHTML = courses.map(course => `
            <div class="course-item">
                <div class="course-info">
                    <h4>${course.titulo}</h4>
                    <p>${course.categoria || 'Geral'}</p>
                </div>
                <div class="course-stats">
                    <span class="course-price">R$ ${course.preco || '0,00'}</span>
                </div>
            </div>
        `).join('');
    }

    // Atualiza matrículas recentes (admin)
    updateRecentEnrollments(enrollments) {
        const container = document.querySelector('.recent-enrollments-list');
        if (!container) return;

        container.innerHTML = enrollments.map(enrollment => `
            <div class="enrollment-item">
                <div class="enrollment-info">
                    <h4>${enrollment.usuarios?.nome || 'Usuário'}</h4>
                    <p>${enrollment.cursos?.titulo || 'Curso'}</p>
                    <span class="enrollment-date">${new Date(enrollment.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <div class="enrollment-status">
                    <span class="status ${enrollment.status}">${enrollment.status || 'ativo'}</span>
                </div>
            </div>
        `).join('');
    }

    // Atualiza cursos do instrutor
    updateInstructorCourses(courses) {
        const container = document.querySelector('.instructor-courses-list');
        if (!container) return;

        container.innerHTML = courses.map(course => `
            <div class="course-card">
                <div class="course-content">
                    <h3>${course.titulo}</h3>
                    <p>${course.descricao || 'Sem descrição'}</p>
                    <div class="course-meta">
                        <span class="course-category">${course.categoria || 'Geral'}</span>
                        <span class="course-price">R$ ${course.preco || '0,00'}</span>
                    </div>
                </div>
                <div class="course-actions">
                    <button class="btn-secondary" onclick="editCourse('${course.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Atualiza lista de alunos (instrutor)
    updateStudentsList(enrollments) {
        const container = document.querySelector('.students-list');
        if (!container) return;

        container.innerHTML = enrollments.map(enrollment => `
            <div class="student-item">
                <div class="student-avatar">
                    ${enrollment.usuarios?.nome?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div class="student-info">
                    <h4>${enrollment.usuarios?.nome || 'Aluno'}</h4>
                    <p>${enrollment.cursos?.titulo || 'Curso'}</p>
                    <span class="enrollment-status ${enrollment.status}">${enrollment.status || 'ativo'}</span>
                </div>
                <div class="student-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${enrollment.progresso || 0}%"></div>
                    </div>
                    <span class="progress-text">${enrollment.progresso || 0}%</span>
                </div>
            </div>
        `).join('');
    }

    // Atualiza cursos matriculados (aluno)
    updateEnrolledCourses(enrollments) {
        const container = document.querySelector('.enrolled-courses-list');
        if (!container) return;

        container.innerHTML = enrollments.map(enrollment => `
            <div class="course-card">
                <div class="course-content">
                    <h3>${enrollment.cursos?.titulo || 'Curso'}</h3>
                    <p>${enrollment.cursos?.categoria || 'Geral'}</p>
                    <div class="course-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${enrollment.progresso || 0}%"></div>
                        </div>
                        <span class="progress-text">${enrollment.progresso || 0}% concluído</span>
                    </div>
                </div>
                <div class="course-actions">
                    <button class="btn-primary" onclick="continueCourse('${enrollment.curso_id}')">
                        <i class="fas fa-play"></i> Continuar
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Atualiza progresso dos cursos (aluno)
    updateCourseProgress(enrollments) {
        const container = document.querySelector('.course-progress-list');
        if (!container) return;

        const progressData = enrollments.map(enrollment => ({
            title: enrollment.cursos?.titulo || 'Curso',
            progress: enrollment.progresso || 0,
            status: enrollment.status || 'em_andamento'
        }));

        container.innerHTML = progressData.map(item => `
            <div class="progress-item">
                <div class="progress-info">
                    <h4>${item.title}</h4>
                    <span class="progress-percentage">${item.progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${item.progress}%"></div>
                </div>
                <span class="progress-status ${item.status}">${item.status}</span>
            </div>
        `).join('');
    }

    // Atualiza cursos recomendados (aluno)
    updateRecommendedCourses(courses) {
        const container = document.querySelector('.recommended-courses-list');
        if (!container) return;

        container.innerHTML = courses.map(course => `
            <div class="course-card">
                <div class="course-content">
                    <h3>${course.titulo}</h3>
                    <p>${course.descricao || 'Sem descrição'}</p>
                    <div class="course-meta">
                        <span class="course-category">${course.categoria || 'Geral'}</span>
                        <span class="course-price">R$ ${course.preco || '0,00'}</span>
                    </div>
                </div>
                <div class="course-actions">
                    <button class="btn-primary" onclick="enrollInCourse('${course.id}')">
                        <i class="fas fa-plus"></i> Matricular
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Configura atualização automática
    setupAutoRefresh() {
        // Atualiza dados a cada 5 minutos
        this.refreshInterval = setInterval(() => {
            console.log('Atualizando dados do dashboard...');
            this.loadInitialData();
        }, 5 * 60 * 1000);
    }

    // Configura subscriptions em tempo real
    setupRealTimeSubscriptions() {
        // Subscription para mudanças em usuários
        const usersSubscription = dataService.subscribeToTable('usuarios', (payload) => {
            console.log('Mudança em usuários:', payload);
            if (this.currentUser.role === 'admin') {
                this.loadAdminData();
            }
        });
        this.subscriptions.push(usersSubscription);

        // Subscription para mudanças em cursos
        const coursesSubscription = dataService.subscribeToTable('cursos', (payload) => {
            console.log('Mudança em cursos:', payload);
            this.loadInitialData();
        });
        this.subscriptions.push(coursesSubscription);

        // Subscription para mudanças em matrículas
        const enrollmentsSubscription = dataService.subscribeToTable('matriculas', (payload) => {
            console.log('Mudança em matrículas:', payload);
            this.loadInitialData();
        });
        this.subscriptions.push(enrollmentsSubscription);
    }

    // Mostra/esconde loading
    showLoading(show) {
        const loadingElements = document.querySelectorAll('.loading-spinner');
        loadingElements.forEach(element => {
            element.style.display = show ? 'block' : 'none';
        });

        const contentElements = document.querySelectorAll('.dashboard-content');
        contentElements.forEach(element => {
            element.style.opacity = show ? '0.5' : '1';
        });
    }

    // Mostra erro
    showError(message) {
        const errorContainer = document.querySelector('.error-container');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>${message}</span>
                    <button onclick="dashboardData.loadInitialData()" class="btn-retry">
                        <i class="fas fa-redo"></i> Tentar Novamente
                    </button>
                </div>
            `;
            errorContainer.style.display = 'block';
        }
    }

    // Limpa recursos
    cleanup() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        this.subscriptions.forEach(subscription => {
            dataService.unsubscribe(subscription);
        });
        this.subscriptions = [];
    }

    // Força atualização dos dados
    async refresh() {
        await this.loadInitialData();
    }
}

// Cria instância global
const dashboardData = new DashboardDataIntegration();

// Exporta para uso
export { dashboardData };

// Também disponibiliza globalmente
window.dashboardData = dashboardData;

// Auto-inicialização quando módulos estiverem prontos
if (typeof moduleLoader !== 'undefined') {
    moduleLoader.onReady(() => {
        if (document.body.classList.contains('page-dashboard-admin') ||
            document.body.classList.contains('page-dashboard-instrutor') ||
            document.body.classList.contains('page-dashboard-aluno')) {
            dashboardData.initialize();
        }
    });
}

