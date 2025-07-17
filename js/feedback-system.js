/**
 * Sistema de Feedback e Testes A/B
 * Instituto Buriti - JavaScript Completo
 */

class FeedbackSystem {
    constructor() {
        this.currentRating = 0;
        this.currentEmotion = null;
        this.feedbackData = [];
        this.testParticipations = [];
        this.analytics = {
            sessionStart: Date.now(),
            pageViews: 0,
            interactions: 0,
            scrollDepth: 0
        };
        
        this.init();
    }

    init() {
        this.loadStoredData();
        this.setupEventListeners();
        this.initializeAnalytics();
        this.renderFeedbackHistory();
        this.updateRewardProgress();
        this.startSessionTimer();
        this.showWelcomeNotification();
    }

    // ===== GERENCIAMENTO DE DADOS ===== //
    loadStoredData() {
        const stored = localStorage.getItem('instituto_buriti_feedback');
        if (stored) {
            const data = JSON.parse(stored);
            this.feedbackData = data.feedbacks || [];
            this.testParticipations = data.tests || [];
            this.analytics = { ...this.analytics, ...data.analytics };
        }
    }

    saveData() {
        const data = {
            feedbacks: this.feedbackData,
            tests: this.testParticipations,
            analytics: this.analytics,
            lastUpdate: Date.now()
        };
        localStorage.setItem('instituto_buriti_feedback', JSON.stringify(data));
    }

    // ===== EVENT LISTENERS ===== //
    setupEventListeners() {
        // Sistema de estrelas
        this.setupStarRating();
        
        // Sistema de emojis
        this.setupEmojiSystem();
        
        // Formulário de feedback
        this.setupFeedbackForm();
        
        // Testes A/B
        this.setupABTesting();
        
        // Analytics tracking
        this.setupAnalyticsTracking();
        
        // Auto-save do formulário
        this.setupAutoSave();
    }

    setupStarRating() {
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                this.setRating(index + 1);
                this.trackInteraction('star_rating', { rating: index + 1 });
            });
            
            star.addEventListener('mouseenter', () => {
                this.highlightStars(index + 1);
            });
        });
        
        document.querySelector('.star-rating').addEventListener('mouseleave', () => {
            this.highlightStars(this.currentRating);
        });
    }

    setupEmojiSystem() {
        const emojiButtons = document.querySelectorAll('.emoji-btn');
        emojiButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const emotion = btn.dataset.emotion;
                this.setEmotion(emotion);
                this.trackInteraction('emoji_feedback', { emotion });
            });
        });
    }

    setupFeedbackForm() {
        const form = document.getElementById('feedbackForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitFeedback();
            });
        }
    }

    setupABTesting() {
        const testButtons = document.querySelectorAll('[data-test]');
        testButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const testId = btn.dataset.test;
                this.joinTest(testId);
            });
        });
    }

    setupAnalyticsTracking() {
        // Tracking de cliques
        document.addEventListener('click', (e) => {
            this.analytics.interactions++;
            this.trackInteraction('click', {
                element: e.target.tagName,
                className: e.target.className
            });
        });

        // Tracking de scroll
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateScrollDepth();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Tracking de tempo na página
        window.addEventListener('beforeunload', () => {
            this.saveData();
        });
    }

    setupAutoSave() {
        const formInputs = document.querySelectorAll('#feedbackForm input, #feedbackForm select, #feedbackForm textarea');
        formInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.autoSaveForm();
            });
        });
        
        // Carregar dados salvos
        this.loadAutoSavedForm();
    }

    // ===== SISTEMA DE AVALIAÇÃO ===== //
    setRating(rating) {
        this.currentRating = rating;
        this.highlightStars(rating);
        this.showNotification(`Obrigado pela avaliação de ${rating} estrela${rating > 1 ? 's' : ''}!`, 'success');
        
        // Salvar avaliação rápida
        const quickFeedback = {
            type: 'quick_rating',
            rating: rating,
            timestamp: Date.now()
        };
        this.feedbackData.push(quickFeedback);
        this.saveData();
    }

    highlightStars(count) {
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < count) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    setEmotion(emotion) {
        // Remover seleção anterior
        document.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Adicionar nova seleção
        const selectedBtn = document.querySelector(`[data-emotion="${emotion}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
            this.currentEmotion = emotion;
            
            const emotionTexts = {
                'muito-feliz': 'Que ótimo que você está adorando!',
                'feliz': 'Ficamos felizes que esteja gostando!',
                'neutro': 'Obrigado pelo feedback!',
                'triste': 'Vamos trabalhar para melhorar sua experiência!',
                'muito-triste': 'Sentimos muito! Vamos resolver isso!'
            };
            
            this.showNotification(emotionTexts[emotion], 'success');
            
            // Salvar feedback emocional
            const emotionFeedback = {
                type: 'emotion_feedback',
                emotion: emotion,
                timestamp: Date.now()
            };
            this.feedbackData.push(emotionFeedback);
            this.saveData();
        }
    }

    // ===== FORMULÁRIO DE FEEDBACK ===== //
    submitFeedback() {
        const form = document.getElementById('feedbackForm');
        const formData = new FormData(form);
        
        const feedback = {
            id: Date.now(),
            type: formData.get('feedbackType'),
            page: formData.get('feedbackPage'),
            title: formData.get('feedbackTitle'),
            description: formData.get('feedbackDescription'),
            priority: formData.get('feedbackPriority'),
            allowContact: formData.get('allowContact') === 'on',
            status: 'pending',
            timestamp: Date.now()
        };

        // Validação
        if (!feedback.type || !feedback.page || !feedback.title || !feedback.description) {
            this.showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }

        // Adicionar feedback
        this.feedbackData.push(feedback);
        this.saveData();
        
        // Limpar formulário
        form.reset();
        this.clearAutoSavedForm();
        
        // Atualizar interface
        this.renderFeedbackHistory();
        this.updateRewardProgress();
        
        // Notificação de sucesso
        this.showNotification('Feedback enviado com sucesso! Obrigado pela contribuição.', 'success');
        
        // Tracking
        this.trackInteraction('feedback_submitted', {
            type: feedback.type,
            priority: feedback.priority
        });
        
        // Scroll para o histórico
        setTimeout(() => {
            document.querySelector('.feedback-history').scrollIntoView({
                behavior: 'smooth'
            });
        }, 1000);
    }

    autoSaveForm() {
        const form = document.getElementById('feedbackForm');
        if (form) {
            const formData = new FormData(form);
            const draft = {};
            for (let [key, value] of formData.entries()) {
                draft[key] = value;
            }
            localStorage.setItem('feedback_draft', JSON.stringify(draft));
        }
    }

    loadAutoSavedForm() {
        const draft = localStorage.getItem('feedback_draft');
        if (draft) {
            const data = JSON.parse(draft);
            Object.keys(data).forEach(key => {
                const input = document.querySelector(`[name="${key}"]`);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = data[key] === 'on';
                    } else {
                        input.value = data[key];
                    }
                }
            });
        }
    }

    clearAutoSavedForm() {
        localStorage.removeItem('feedback_draft');
    }

    // ===== TESTES A/B ===== //
    joinTest(testId) {
        const existingParticipation = this.testParticipations.find(p => p.testId === testId);
        
        if (existingParticipation) {
            this.showNotification('Você já está participando deste teste!', 'warning');
            return;
        }

        const participation = {
            testId: testId,
            joinedAt: Date.now(),
            status: 'active'
        };

        this.testParticipations.push(participation);
        this.saveData();
        this.updateRewardProgress();

        const testNames = {
            'interface': 'Teste de Interface',
            'mobile': 'Teste Mobile',
            'gamification': 'Teste de Gamificação'
        };

        this.showNotification(`Você se inscreveu no ${testNames[testId]}! Obrigado pela participação.`, 'success');
        
        // Atualizar botão
        const button = document.querySelector(`[data-test="${testId}"]`);
        if (button) {
            button.textContent = 'Participando';
            button.disabled = true;
            button.style.background = '#10b981';
            button.style.color = 'white';
            button.style.borderColor = '#10b981';
        }

        this.trackInteraction('test_joined', { testId });
    }

    // ===== HISTÓRICO DE FEEDBACK ===== //
    renderFeedbackHistory() {
        const container = document.getElementById('feedbackHistory');
        if (!container) return;

        // Adicionar alguns feedbacks de exemplo se não houver dados
        if (this.feedbackData.length === 0) {
            this.addSampleFeedbacks();
        }

        const feedbacks = this.feedbackData
            .filter(f => f.type !== 'quick_rating' && f.type !== 'emotion_feedback')
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 10); // Mostrar apenas os 10 mais recentes

        if (feedbacks.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #6b7280;">
                    <p>Nenhum feedback detalhado enviado ainda.</p>
                    <p>Envie seu primeiro feedback usando o formulário acima!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = feedbacks.map(feedback => `
            <div class="feedback-item">
                <div class="feedback-header">
                    <h4 class="feedback-title">${feedback.title}</h4>
                    <span class="feedback-type ${feedback.type}">${this.getFeedbackTypeIcon(feedback.type)} ${this.getFeedbackTypeName(feedback.type)}</span>
                </div>
                <p class="feedback-description">${feedback.description}</p>
                <div class="feedback-meta">
                    <span class="feedback-date">${this.formatDate(feedback.timestamp)}</span>
                    <span class="feedback-status ${feedback.status}">${this.getStatusName(feedback.status)}</span>
                </div>
            </div>
        `).join('');
    }

    addSampleFeedbacks() {
        const sampleFeedbacks = [
            {
                id: 1,
                type: 'improvement',
                page: 'courses',
                title: 'Melhoria no sistema de busca',
                description: 'Sugestão para adicionar filtros avançados na busca de cursos',
                priority: 'medium',
                allowContact: true,
                status: 'analyzing',
                timestamp: Date.now() - (3 * 24 * 60 * 60 * 1000) // 3 dias atrás
            },
            {
                id: 2,
                type: 'bug',
                page: 'chat',
                title: 'Bug no chat mobile',
                description: 'Mensagens não aparecem corretamente no celular',
                priority: 'high',
                allowContact: true,
                status: 'resolved',
                timestamp: Date.now() - (6 * 24 * 60 * 60 * 1000) // 6 dias atrás
            },
            {
                id: 3,
                type: 'compliment',
                page: 'general',
                title: 'Parabéns pela plataforma!',
                description: 'Excelente qualidade dos cursos e interface intuitiva',
                priority: 'low',
                allowContact: false,
                status: 'thanked',
                timestamp: Date.now() - (8 * 24 * 60 * 60 * 1000) // 8 dias atrás
            }
        ];

        this.feedbackData.push(...sampleFeedbacks);
        this.saveData();
    }

    getFeedbackTypeIcon(type) {
        const icons = {
            'bug': '🐛',
            'feature': '💡',
            'improvement': '⚡',
            'compliment': '👏',
            'complaint': '😤',
            'other': '🤔'
        };
        return icons[type] || '📝';
    }

    getFeedbackTypeName(type) {
        const names = {
            'bug': 'Bug',
            'feature': 'Funcionalidade',
            'improvement': 'Melhoria',
            'compliment': 'Elogio',
            'complaint': 'Reclamação',
            'other': 'Outro'
        };
        return names[type] || 'Feedback';
    }

    getStatusName(status) {
        const names = {
            'pending': 'Pendente',
            'analyzing': 'Em Análise',
            'resolved': 'Resolvido',
            'thanked': 'Agradecido'
        };
        return names[status] || 'Pendente';
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('pt-BR');
    }

    // ===== SISTEMA DE RECOMPENSAS ===== //
    updateRewardProgress() {
        const feedbackCount = this.feedbackData.filter(f => 
            f.type !== 'quick_rating' && f.type !== 'emotion_feedback'
        ).length;
        const testCount = this.testParticipations.length;

        // Atualizar progresso de feedback
        this.updateProgressBar('.reward-card:nth-child(1) .progress-fill', feedbackCount, 5);
        this.updateProgressText('.reward-card:nth-child(1) .reward-progress span', `${feedbackCount}/5 feedbacks este mês`);

        // Atualizar progresso de testes
        this.updateProgressBar('.reward-card:nth-child(2) .progress-fill', testCount, 3);
        this.updateProgressText('.reward-card:nth-child(2) .reward-progress span', `${testCount}/3 testes este mês`);

        // Atualizar progresso de contribuidor ativo
        const totalActivities = feedbackCount + testCount;
        this.updateProgressBar('.reward-card:nth-child(3) .progress-fill', totalActivities, 10);
        this.updateProgressText('.reward-card:nth-child(3) .reward-progress span', `${totalActivities}/10 atividades`);
    }

    updateProgressBar(selector, current, max) {
        const progressBar = document.querySelector(selector);
        if (progressBar) {
            const percentage = Math.min((current / max) * 100, 100);
            progressBar.style.width = `${percentage}%`;
        }
    }

    updateProgressText(selector, text) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = text;
        }
    }

    // ===== ANALYTICS ===== //
    initializeAnalytics() {
        this.analytics.pageViews++;
        this.updateAnalyticsDisplay();
    }

    updateScrollDepth() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        this.analytics.scrollDepth = Math.max(this.analytics.scrollDepth, scrollPercent);
    }

    updateAnalyticsDisplay() {
        // Atualizar tempo de sessão
        const sessionTime = this.getSessionTime();
        const timeElement = document.querySelector('.analytics-card:nth-child(1) .metric-value');
        if (timeElement) {
            timeElement.textContent = sessionTime;
        }

        // Atualizar páginas visitadas
        const pagesElement = document.querySelector('.analytics-card:nth-child(2) .metric-value');
        if (pagesElement) {
            pagesElement.textContent = this.analytics.pageViews;
        }

        // Atualizar interações
        const interactionsElement = document.querySelector('.analytics-card:nth-child(4) .metric-value');
        if (interactionsElement) {
            interactionsElement.textContent = this.analytics.interactions;
        }
    }

    getSessionTime() {
        const elapsed = Date.now() - this.analytics.sessionStart;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        return `${minutes}min ${seconds}s`;
    }

    startSessionTimer() {
        setInterval(() => {
            this.updateAnalyticsDisplay();
        }, 1000);
    }

    trackInteraction(action, data = {}) {
        const interaction = {
            action,
            data,
            timestamp: Date.now(),
            page: window.location.pathname
        };
        
        // Salvar interação (em produção, enviaria para analytics)
        console.log('Interaction tracked:', interaction);
    }

    // ===== NOTIFICAÇÕES ===== //
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span>${this.getNotificationIcon(type)}</span>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Mostrar notificação
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Remover notificação
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    showWelcomeNotification() {
        setTimeout(() => {
            this.showNotification('Bem-vindo ao sistema de feedback! Sua opinião é muito importante para nós.', 'success');
        }, 1000);
    }
}

// ===== INICIALIZAÇÃO ===== //
document.addEventListener('DOMContentLoaded', () => {
    window.feedbackSystem = new FeedbackSystem();
});

// ===== FUNÇÕES GLOBAIS ===== //
window.submitTestFeedback = function(testId, rating, comments) {
    if (window.feedbackSystem) {
        const feedback = {
            type: 'test_feedback',
            testId: testId,
            rating: rating,
            comments: comments,
            timestamp: Date.now()
        };
        
        window.feedbackSystem.feedbackData.push(feedback);
        window.feedbackSystem.saveData();
        window.feedbackSystem.showNotification('Feedback do teste enviado com sucesso!', 'success');
    }
};

window.exportFeedbackData = function() {
    if (window.feedbackSystem) {
        const data = {
            feedbacks: window.feedbackSystem.feedbackData,
            tests: window.feedbackSystem.testParticipations,
            analytics: window.feedbackSystem.analytics,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `instituto_buriti_feedback_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        window.feedbackSystem.showNotification('Dados exportados com sucesso!', 'success');
    }
};

