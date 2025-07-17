/**
 * Integração entre Sistema de Gamificação e Notificações
 * Instituto Buriti
 */

class GamificationIntegration {
    constructor() {
        this.lastKnownStats = null;
        this.isMonitoring = false;
        this.checkInterval = null;
        this.init();
    }

    async init() {
        // Carregar estatísticas iniciais
        await this.loadInitialStats();
        
        // Iniciar monitoramento
        this.startMonitoring();
        
        // Configurar eventos
        this.setupEventListeners();
    }

    async loadInitialStats() {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            const response = await apiClient.get('/gamification/user-stats');
            if (response.success) {
                this.lastKnownStats = response.stats;
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas iniciais:', error);
        }
    }

    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        
        // Verificar mudanças a cada 30 segundos
        this.checkInterval = setInterval(() => {
            this.checkForUpdates();
        }, 30000);
    }

    stopMonitoring() {
        this.isMonitoring = false;
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    async checkForUpdates() {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            const response = await apiClient.get('/gamification/user-stats');
            if (response.success) {
                const newStats = response.stats;
                
                if (this.lastKnownStats) {
                    this.compareAndNotify(this.lastKnownStats, newStats);
                }
                
                this.lastKnownStats = newStats;
            }
        } catch (error) {
            console.error('Erro ao verificar atualizações:', error);
        }
    }

    compareAndNotify(oldStats, newStats) {
        // Verificar mudança de nível
        if (newStats.level > oldStats.level) {
            const levelDiff = newStats.level - oldStats.level;
            for (let i = 1; i <= levelDiff; i++) {
                const newLevel = oldStats.level + i;
                notificationSystem.showLevelUpNotification(newLevel, 100);
            }
        }

        // Verificar novos pontos
        if (newStats.total_points > oldStats.total_points) {
            const pointsDiff = newStats.total_points - oldStats.total_points;
            if (pointsDiff > 0) {
                notificationSystem.showPointsNotification(pointsDiff);
            }
        }

        // Verificar novas badges
        if (newStats.badges_earned > oldStats.badges_earned) {
            this.checkForNewBadges();
        }

        // Verificar streak
        if (newStats.streak_days > oldStats.streak_days) {
            notificationSystem.showStreakNotification(newStats.streak_days);
        }

        // Verificar cursos concluídos
        if (newStats.courses_completed > oldStats.courses_completed) {
            notificationSystem.showCourseCompletedNotification(
                'Curso Concluído',
                200,
                true
            );
        }
    }

    async checkForNewBadges() {
        try {
            const response = await apiClient.get('/gamification/user-badges');
            if (response.success) {
                const badges = response.badges;
                
                // Verificar badges recentes (últimas 24 horas)
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                
                badges.forEach(badge => {
                    const earnedDate = new Date(badge.earned_at);
                    if (earnedDate > oneDayAgo) {
                        notificationSystem.showBadgeNotification({
                            name: badge.badge_name,
                            description: badge.description,
                            icon: this.getBadgeIcon(badge.badge_id),
                            points: badge.points_earned
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao verificar novas badges:', error);
        }
    }

    getBadgeIcon(badgeId) {
        const icons = {
            'primeiro_passo': '🎯',
            'dedicado': '🔥',
            'imparavel': '⚡',
            'mestre_quizzes': '🧠',
            'aprendiz_veloz': '🚀',
            'perfeccionista': '💎',
            'mentor': '👨‍🏫',
            'madrugador': '🌅'
        };
        return icons[badgeId] || '🏆';
    }

    setupEventListeners() {
        // Escutar eventos personalizados de conquistas
        document.addEventListener('achievement-earned', (event) => {
            const { type, data } = event.detail;
            
            switch (type) {
                case 'points':
                    notificationSystem.showPointsNotification(data.points, data.activity);
                    break;
                case 'badge':
                    notificationSystem.showBadgeNotification(data);
                    break;
                case 'level':
                    notificationSystem.showLevelUpNotification(data.level, data.bonusPoints);
                    break;
                case 'streak':
                    notificationSystem.showStreakNotification(data.days);
                    break;
                case 'course':
                    notificationSystem.showCourseCompletedNotification(
                        data.courseName,
                        data.points,
                        data.certificateAvailable
                    );
                    break;
            }
        });

        // Escutar eventos de ações do usuário
        document.addEventListener('user-action', (event) => {
            const { action, data } = event.detail;
            this.handleUserAction(action, data);
        });

        // Escutar mudanças de página para atualizar estatísticas
        window.addEventListener('beforeunload', () => {
            this.stopMonitoring();
        });

        // Reativar monitoramento quando a página volta ao foco
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && !this.isMonitoring) {
                this.startMonitoring();
            } else if (document.hidden) {
                this.stopMonitoring();
            }
        });
    }

    async handleUserAction(action, data) {
        // Processar ações do usuário que podem gerar conquistas
        switch (action) {
            case 'quiz-completed':
                await this.processQuizCompletion(data);
                break;
            case 'lesson-completed':
                await this.processLessonCompletion(data);
                break;
            case 'course-started':
                await this.processCourseStart(data);
                break;
            case 'daily-login':
                await this.processDailyLogin(data);
                break;
        }
    }

    async processQuizCompletion(data) {
        // Simular pontos por quiz completado
        const points = Math.floor(data.score * 10); // 10 pontos por ponto de score
        
        // Disparar evento de conquista
        document.dispatchEvent(new CustomEvent('achievement-earned', {
            detail: {
                type: 'points',
                data: {
                    points: points,
                    activity: `Quiz: ${data.quizName}`
                }
            }
        }));

        // Verificar se merece badge de quiz master
        if (data.score >= 9.0) {
            this.checkQuizMasterBadge();
        }
    }

    async processLessonCompletion(data) {
        // Pontos por aula completada
        const points = 25;
        
        document.dispatchEvent(new CustomEvent('achievement-earned', {
            detail: {
                type: 'points',
                data: {
                    points: points,
                    activity: `Aula: ${data.lessonName}`
                }
            }
        }));
    }

    async processCourseStart(data) {
        // Verificar se é o primeiro curso (badge Primeiro Passo)
        if (data.isFirstCourse) {
            document.dispatchEvent(new CustomEvent('achievement-earned', {
                detail: {
                    type: 'badge',
                    data: {
                        name: 'Primeiro Passo',
                        description: 'Complete seu primeiro curso',
                        icon: '🎯',
                        points: 100
                    }
                }
            }));
        }
    }

    async processDailyLogin(data) {
        // Verificar streak de login
        if (data.streakDays > 1) {
            document.dispatchEvent(new CustomEvent('achievement-earned', {
                detail: {
                    type: 'streak',
                    data: {
                        days: data.streakDays
                    }
                }
            }));
        }

        // Badge de madrugador (login antes das 7h)
        const hour = new Date().getHours();
        if (hour < 7) {
            this.checkEarlyBirdBadge();
        }
    }

    async checkQuizMasterBadge() {
        // Lógica para verificar se o usuário merece a badge de Quiz Master
        // (implementação simplificada)
        const quizCount = parseInt(localStorage.getItem('quiz_count') || '0') + 1;
        localStorage.setItem('quiz_count', quizCount.toString());

        if (quizCount >= 10) {
            document.dispatchEvent(new CustomEvent('achievement-earned', {
                detail: {
                    type: 'badge',
                    data: {
                        name: 'Mestre dos Quizzes',
                        description: 'Acerte 100 questões',
                        icon: '🧠',
                        points: 300
                    }
                }
            }));
        }
    }

    async checkEarlyBirdBadge() {
        const earlyLogins = parseInt(localStorage.getItem('early_logins') || '0') + 1;
        localStorage.setItem('early_logins', earlyLogins.toString());

        if (earlyLogins >= 5) {
            document.dispatchEvent(new CustomEvent('achievement-earned', {
                detail: {
                    type: 'badge',
                    data: {
                        name: 'Madrugador',
                        description: 'Estude antes das 7h',
                        icon: '🌅',
                        points: 150
                    }
                }
            }));
        }
    }

    // Método para forçar verificação manual
    async forceCheck() {
        await this.checkForUpdates();
    }

    // Método para simular conquistas (desenvolvimento)
    simulateAchievements() {
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('user-action', {
                detail: {
                    action: 'quiz-completed',
                    data: {
                        quizName: 'Excel Básico - Quiz 1',
                        score: 9.5
                    }
                }
            }));
        }, 2000);

        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('user-action', {
                detail: {
                    action: 'lesson-completed',
                    data: {
                        lessonName: 'Introdução ao Excel'
                    }
                }
            }));
        }, 4000);

        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('user-action', {
                detail: {
                    action: 'daily-login',
                    data: {
                        streakDays: 5
                    }
                }
            }));
        }, 6000);
    }
}

// Instância global da integração
const gamificationIntegration = new GamificationIntegration();

// Exportar para uso em outros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GamificationIntegration;
}

