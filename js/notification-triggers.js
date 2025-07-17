/**
 * Sistema de Triggers Automáticos de Notificação
 * Instituto Buriti - Integração com backend
 */

class NotificationTriggers {
    constructor() {
        this.apiClient = window.apiClient;
        this.isInitialized = false;
        this.activityQueue = [];
        this.lastActivity = null;
        
        this.init();
    }
    
    async init() {
        try {
            // Configurar triggers para o usuário atual
            await this.setupUserTriggers();
            
            // Iniciar monitoramento de atividades
            this.startActivityMonitoring();
            
            this.isInitialized = true;
            console.log('Sistema de triggers inicializado');
            
        } catch (error) {
            console.error('Erro ao inicializar triggers:', error);
        }
    }
    
    async setupUserTriggers() {
        try {
            // Obter configurações do usuário
            const settings = this.getUserSettings();
            
            const response = await this.apiClient.post('/scheduler/triggers/setup', settings);
            
            if (response.success) {
                console.log('Triggers configurados:', response.triggers);
            }
            
        } catch (error) {
            console.error('Erro ao configurar triggers:', error);
        }
    }
    
    getUserSettings() {
        // Obter configurações salvas ou usar padrões
        const saved = localStorage.getItem('notification_settings');
        
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Configurações padrão
        return {
            study_reminders: true,
            achievement_alerts: true,
            inactivity_alerts: true,
            streak_notifications: true,
            weekend_challenges: false,
            course_deadlines: true,
            reminder_time: '19:00',
            timezone: 'America/Sao_Paulo'
        };
    }
    
    startActivityMonitoring() {
        // Monitorar login
        this.logActivity('login', {
            platform: 'web',
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
        });
        
        // Monitorar mudanças de página
        this.setupPageChangeMonitoring();
        
        // Monitorar interações
        this.setupInteractionMonitoring();
        
        // Monitorar tempo de sessão
        this.setupSessionMonitoring();
    }
    
    setupPageChangeMonitoring() {
        // Monitorar mudanças de URL
        let currentPage = window.location.pathname;
        
        const checkPageChange = () => {
            const newPage = window.location.pathname;
            if (newPage !== currentPage) {
                this.logActivity('page_view', {
                    from: currentPage,
                    to: newPage,
                    timestamp: new Date().toISOString()
                });
                currentPage = newPage;
            }
        };
        
        // Verificar a cada 2 segundos
        setInterval(checkPageChange, 2000);
        
        // Também monitorar eventos de navegação
        window.addEventListener('popstate', checkPageChange);
    }
    
    setupInteractionMonitoring() {
        // Monitorar cliques em botões importantes
        document.addEventListener('click', (event) => {
            const target = event.target;
            
            // Botões de curso
            if (target.matches('.course-button, .start-course, .continue-course')) {
                this.logActivity('course_interaction', {
                    action: 'button_click',
                    element: target.textContent.trim(),
                    course_id: target.dataset.courseId || 'unknown'
                });
            }
            
            // Botões de quiz
            if (target.matches('.quiz-button, .start-quiz')) {
                this.logActivity('quiz_start', {
                    quiz_id: target.dataset.quizId || 'unknown'
                });
            }
            
            // Botões de certificado
            if (target.matches('.download-certificate')) {
                this.logActivity('certificate_download', {
                    certificate_id: target.dataset.certificateId || 'unknown'
                });
            }
        });
    }
    
    setupSessionMonitoring() {
        let sessionStart = Date.now();
        let lastActivity = Date.now();
        
        // Atualizar última atividade em qualquer interação
        ['click', 'scroll', 'keypress', 'mousemove'].forEach(event => {
            document.addEventListener(event, () => {
                lastActivity = Date.now();
            }, { passive: true });
        });
        
        // Verificar inatividade a cada minuto
        setInterval(() => {
            const now = Date.now();
            const inactiveTime = now - lastActivity;
            const sessionTime = now - sessionStart;
            
            // Se inativo por mais de 5 minutos, registrar
            if (inactiveTime > 5 * 60 * 1000) {
                this.logActivity('session_inactive', {
                    inactive_duration: inactiveTime,
                    session_duration: sessionTime
                });
            }
            
            // Se sessão ativa por mais de 30 minutos, registrar milestone
            if (sessionTime > 30 * 60 * 1000 && sessionTime % (30 * 60 * 1000) < 60 * 1000) {
                this.logActivity('session_milestone', {
                    session_duration: sessionTime,
                    milestone: '30min'
                });
            }
        }, 60 * 1000);
        
        // Registrar fim de sessão
        window.addEventListener('beforeunload', () => {
            this.logActivity('session_end', {
                session_duration: Date.now() - sessionStart
            });
        });
    }
    
    async logActivity(type, details = {}) {
        try {
            const activity = {
                type,
                details: {
                    ...details,
                    url: window.location.href,
                    timestamp: new Date().toISOString()
                }
            };
            
            // Adicionar à fila
            this.activityQueue.push(activity);
            this.lastActivity = activity;
            
            // Enviar para o backend
            const response = await this.apiClient.post('/scheduler/triggers/activity', activity);
            
            if (response.success) {
                console.log(`Atividade registrada: ${type}`);
            }
            
        } catch (error) {
            console.error('Erro ao registrar atividade:', error);
        }
    }
    
    // Métodos específicos para diferentes tipos de conquistas
    
    async triggerLessonComplete(courseId, lessonId, score = null) {
        await this.logActivity('lesson_complete', {
            course_id: courseId,
            lesson_id: lessonId,
            score: score,
            completion_time: new Date().toISOString()
        });
        
        // Verificar se deve disparar notificação de progresso
        this.checkProgressMilestone(courseId);
    }
    
    async triggerQuizComplete(quizId, score, passed) {
        await this.logActivity('quiz_complete', {
            quiz_id: quizId,
            score: score,
            passed: passed,
            completion_time: new Date().toISOString()
        });
        
        // Se passou no quiz, pode ter conquistado badge
        if (passed && score >= 80) {
            this.checkQuizMasterBadge();
        }
    }
    
    async triggerCourseComplete(courseId, finalScore) {
        await this.logActivity('course_complete', {
            course_id: courseId,
            final_score: finalScore,
            completion_time: new Date().toISOString()
        });
        
        // Disparar notificação de conclusão de curso
        await this.triggerAchievementNotification('course_complete', {
            course_id: courseId,
            course_name: this.getCourseNameById(courseId),
            final_score: finalScore
        });
    }
    
    async triggerBadgeEarned(badgeId, badgeName, points) {
        // Disparar notificação de badge
        await this.triggerAchievementNotification('badge', {
            badge_id: badgeId,
            badge_name: badgeName,
            points: points
        });
    }
    
    async triggerLevelUp(newLevel, totalPoints) {
        // Disparar notificação de subida de nível
        await this.triggerAchievementNotification('level_up', {
            new_level: newLevel,
            points: totalPoints
        });
    }
    
    async triggerStreakMilestone(streakDays) {
        // Disparar notificação de streak
        await this.triggerAchievementNotification('streak', {
            streak_days: streakDays
        });
    }
    
    async triggerAchievementNotification(type, data) {
        try {
            const response = await this.apiClient.post('/scheduler/triggers/achievement', {
                type: type,
                data: data
            });
            
            if (response.success) {
                console.log(`Notificação de conquista enviada: ${type}`);
                
                // Também mostrar notificação local se disponível
                if (window.NotificationSystem) {
                    const notification = response.notification;
                    window.NotificationSystem.show({
                        type: 'achievement',
                        title: notification.title,
                        message: notification.body,
                        duration: 5000
                    });
                }
            }
            
        } catch (error) {
            console.error('Erro ao disparar notificação de conquista:', error);
        }
    }
    
    // Métodos auxiliares
    
    checkProgressMilestone(courseId) {
        // Verificar quantas lições foram completadas neste curso
        const courseActivities = this.activityQueue.filter(
            a => a.type === 'lesson_complete' && a.details.course_id === courseId
        );
        
        const lessonsCompleted = courseActivities.length;
        
        // Marcos de progresso (5, 10, 15, 20 lições)
        if ([5, 10, 15, 20].includes(lessonsCompleted)) {
            this.logActivity('progress_milestone', {
                course_id: courseId,
                lessons_completed: lessonsCompleted,
                milestone_type: 'lessons'
            });
        }
    }
    
    checkQuizMasterBadge() {
        // Verificar quantos quizzes foram passados
        const quizzesPassed = this.activityQueue.filter(
            a => a.type === 'quiz_complete' && a.details.passed === true
        ).length;
        
        // Badge de Mestre dos Quizzes aos 10 quizzes
        if (quizzesPassed === 10) {
            this.triggerBadgeEarned('quiz_master', 'Mestre dos Quizzes', 300);
        }
    }
    
    getCourseNameById(courseId) {
        const courseNames = {
            'python-intro': 'Introdução ao Python',
            'excel-basico': 'Excel Básico',
            'ia-fundamentals': 'Fundamentos de IA',
            'web-dev': 'Desenvolvimento Web',
            'data-science': 'Ciência de Dados'
        };
        
        return courseNames[courseId] || 'Curso Desconhecido';
    }
    
    // Método para agendar notificação personalizada
    async scheduleCustomNotification(title, body, scheduledFor, recurring = false) {
        try {
            const response = await this.apiClient.post('/scheduler/schedule', {
                title: title,
                body: body,
                scheduled_for: scheduledFor,
                type: 'custom',
                recurring: recurring,
                interval_hours: recurring ? 24 : null
            });
            
            if (response.success) {
                console.log('Notificação agendada:', response.schedule_id);
                return response.schedule_id;
            }
            
        } catch (error) {
            console.error('Erro ao agendar notificação:', error);
        }
        
        return null;
    }
    
    // Obter estatísticas do agendador
    async getSchedulerStats() {
        try {
            const response = await this.apiClient.get('/scheduler/stats');
            return response.success ? response.stats : null;
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            return null;
        }
    }
}

// Inicializar sistema de triggers quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar API client estar pronto
    const initTriggers = () => {
        if (window.apiClient) {
            window.notificationTriggers = new NotificationTriggers();
        } else {
            setTimeout(initTriggers, 1000);
        }
    };
    
    initTriggers();
});

// Exportar para uso global
window.NotificationTriggers = NotificationTriggers;

