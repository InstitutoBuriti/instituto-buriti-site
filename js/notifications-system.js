/**
 * Sistema de Notificações de Conquistas
 * Instituto Buriti - Gamificação
 */

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.isInitialized = false;
        this.soundEnabled = true;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.createNotificationContainer();
        this.loadSettings();
        this.isInitialized = true;
    }

    createNotificationContainer() {
        // Criar container para notificações se não existir
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.innerHTML = `
                <style>
                    #notification-container {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        z-index: 10000;
                        pointer-events: none;
                    }

                    .achievement-notification {
                        background: linear-gradient(135deg, #973CBF 0%, #A95028 100%);
                        color: white;
                        padding: 20px;
                        border-radius: 15px;
                        margin-bottom: 15px;
                        min-width: 300px;
                        max-width: 400px;
                        box-shadow: 0 10px 30px rgba(151, 60, 191, 0.4);
                        transform: translateX(100%);
                        opacity: 0;
                        transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                        pointer-events: auto;
                        cursor: pointer;
                        position: relative;
                        overflow: hidden;
                    }

                    .achievement-notification::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                        animation: shimmer 2s infinite;
                    }

                    @keyframes shimmer {
                        0% { left: -100%; }
                        100% { left: 100%; }
                    }

                    .achievement-notification.show {
                        transform: translateX(0);
                        opacity: 1;
                    }

                    .achievement-notification.hide {
                        transform: translateX(100%);
                        opacity: 0;
                    }

                    .notification-header {
                        display: flex;
                        align-items: center;
                        margin-bottom: 10px;
                    }

                    .notification-icon {
                        font-size: 2.5em;
                        margin-right: 15px;
                        animation: bounce 1s infinite alternate;
                    }

                    @keyframes bounce {
                        0% { transform: translateY(0); }
                        100% { transform: translateY(-5px); }
                    }

                    .notification-title {
                        font-size: 1.3em;
                        font-weight: bold;
                        margin: 0;
                    }

                    .notification-subtitle {
                        font-size: 0.9em;
                        opacity: 0.9;
                        margin: 0;
                    }

                    .notification-content {
                        margin-bottom: 15px;
                    }

                    .notification-description {
                        font-size: 1em;
                        line-height: 1.4;
                        margin-bottom: 10px;
                    }

                    .notification-reward {
                        display: flex;
                        align-items: center;
                        gap: 15px;
                        flex-wrap: wrap;
                    }

                    .reward-item {
                        background: rgba(255, 255, 255, 0.2);
                        padding: 8px 12px;
                        border-radius: 20px;
                        font-size: 0.9em;
                        font-weight: bold;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    }

                    .notification-close {
                        position: absolute;
                        top: 10px;
                        right: 15px;
                        background: none;
                        border: none;
                        color: white;
                        font-size: 1.5em;
                        cursor: pointer;
                        opacity: 0.7;
                        transition: opacity 0.3s ease;
                    }

                    .notification-close:hover {
                        opacity: 1;
                    }

                    .notification-progress {
                        background: rgba(255, 255, 255, 0.2);
                        height: 4px;
                        border-radius: 2px;
                        overflow: hidden;
                        margin-top: 15px;
                    }

                    .notification-progress-bar {
                        height: 100%;
                        background: rgba(255, 255, 255, 0.8);
                        border-radius: 2px;
                        transition: width 0.3s ease;
                    }

                    /* Tipos específicos de notificação */
                    .notification-points {
                        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    }

                    .notification-badge {
                        background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
                    }

                    .notification-level {
                        background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%);
                    }

                    .notification-streak {
                        background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
                    }

                    .notification-course {
                        background: linear-gradient(135deg, #17a2b8 0%, #6610f2 100%);
                    }

                    /* Responsivo */
                    @media (max-width: 768px) {
                        #notification-container {
                            top: 10px;
                            right: 10px;
                            left: 10px;
                        }

                        .achievement-notification {
                            min-width: auto;
                            max-width: none;
                        }
                    }
                </style>
            `;
            document.body.appendChild(container);
        }
    }

    loadSettings() {
        const settings = localStorage.getItem('notification_settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.soundEnabled = parsed.soundEnabled !== false;
        }
    }

    saveSettings() {
        localStorage.setItem('notification_settings', JSON.stringify({
            soundEnabled: this.soundEnabled
        }));
    }

    // Mostrar notificação de pontos ganhos
    showPointsNotification(points, activity = 'Atividade concluída') {
        const notification = {
            type: 'points',
            icon: '🎯',
            title: 'Pontos Ganhos!',
            subtitle: activity,
            description: `Você ganhou ${points} pontos!`,
            rewards: [
                { icon: '⭐', text: `+${points} pontos` }
            ],
            duration: 4000
        };

        this.showNotification(notification);
    }

    // Mostrar notificação de badge conquistada
    showBadgeNotification(badge) {
        const notification = {
            type: 'badge',
            icon: badge.icon || '🏆',
            title: 'Badge Conquistada!',
            subtitle: badge.name,
            description: badge.description,
            rewards: [
                { icon: '🏆', text: 'Nova badge' },
                { icon: '⭐', text: `+${badge.points} pontos` }
            ],
            duration: 6000
        };

        this.showNotification(notification);
    }

    // Mostrar notificação de subida de nível
    showLevelUpNotification(newLevel, pointsEarned = 0) {
        const notification = {
            type: 'level',
            icon: '🚀',
            title: 'Nível Aumentado!',
            subtitle: `Parabéns! Você chegou ao nível ${newLevel}`,
            description: 'Continue assim e alcance novos patamares!',
            rewards: [
                { icon: '🚀', text: `Nível ${newLevel}` },
                ...(pointsEarned > 0 ? [{ icon: '⭐', text: `+${pointsEarned} pontos bônus` }] : [])
            ],
            duration: 7000
        };

        this.showNotification(notification);
    }

    // Mostrar notificação de streak
    showStreakNotification(days) {
        const notification = {
            type: 'streak',
            icon: '🔥',
            title: 'Sequência Mantida!',
            subtitle: `${days} dias consecutivos`,
            description: 'Você está em chamas! Continue estudando todos os dias.',
            rewards: [
                { icon: '🔥', text: `${days} dias` },
                { icon: '⭐', text: `+${days * 10} pontos` }
            ],
            duration: 5000
        };

        this.showNotification(notification);
    }

    // Mostrar notificação de curso concluído
    showCourseCompletedNotification(courseName, points = 0, certificateAvailable = false) {
        const rewards = [
            { icon: '🎓', text: 'Curso concluído' }
        ];

        if (points > 0) {
            rewards.push({ icon: '⭐', text: `+${points} pontos` });
        }

        if (certificateAvailable) {
            rewards.push({ icon: '📜', text: 'Certificado disponível' });
        }

        const notification = {
            type: 'course',
            icon: '🎓',
            title: 'Curso Concluído!',
            subtitle: courseName,
            description: 'Parabéns por completar mais um curso!',
            rewards: rewards,
            duration: 6000
        };

        this.showNotification(notification);
    }

    // Método principal para mostrar notificações
    showNotification(notificationData) {
        if (!this.isInitialized) {
            this.init();
        }

        const container = document.getElementById('notification-container');
        if (!container) return;

        // Criar elemento da notificação
        const notificationEl = document.createElement('div');
        notificationEl.className = `achievement-notification notification-${notificationData.type}`;
        
        // Gerar ID único
        const notificationId = 'notification-' + Date.now() + Math.random().toString(36).substr(2, 9);
        notificationEl.id = notificationId;

        // Construir HTML da notificação
        const rewardsHTML = notificationData.rewards.map(reward => 
            `<div class="reward-item">
                <span>${reward.icon}</span>
                <span>${reward.text}</span>
            </div>`
        ).join('');

        notificationEl.innerHTML = `
            <button class="notification-close" onclick="notificationSystem.closeNotification('${notificationId}')">&times;</button>
            <div class="notification-header">
                <div class="notification-icon">${notificationData.icon}</div>
                <div>
                    <h3 class="notification-title">${notificationData.title}</h3>
                    <p class="notification-subtitle">${notificationData.subtitle}</p>
                </div>
            </div>
            <div class="notification-content">
                <p class="notification-description">${notificationData.description}</p>
                <div class="notification-reward">
                    ${rewardsHTML}
                </div>
            </div>
            <div class="notification-progress">
                <div class="notification-progress-bar" id="progress-${notificationId}"></div>
            </div>
        `;

        // Adicionar ao container
        container.appendChild(notificationEl);

        // Animar entrada
        setTimeout(() => {
            notificationEl.classList.add('show');
        }, 100);

        // Tocar som se habilitado
        if (this.soundEnabled) {
            this.playNotificationSound(notificationData.type);
        }

        // Animar barra de progresso
        this.animateProgress(notificationId, notificationData.duration);

        // Auto-remover após duração especificada
        setTimeout(() => {
            this.closeNotification(notificationId);
        }, notificationData.duration);

        // Adicionar à lista de notificações ativas
        this.notifications.push({
            id: notificationId,
            data: notificationData,
            timestamp: Date.now()
        });

        // Limitar número de notificações simultâneas
        this.limitNotifications();
    }

    // Fechar notificação específica
    closeNotification(notificationId) {
        const notificationEl = document.getElementById(notificationId);
        if (notificationEl) {
            notificationEl.classList.add('hide');
            setTimeout(() => {
                if (notificationEl.parentNode) {
                    notificationEl.parentNode.removeChild(notificationEl);
                }
            }, 500);
        }

        // Remover da lista
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
    }

    // Animar barra de progresso
    animateProgress(notificationId, duration) {
        const progressBar = document.getElementById(`progress-${notificationId}`);
        if (progressBar) {
            progressBar.style.width = '100%';
            progressBar.style.transition = `width ${duration}ms linear`;
            
            setTimeout(() => {
                progressBar.style.width = '0%';
            }, 100);
        }
    }

    // Limitar número de notificações simultâneas
    limitNotifications(maxNotifications = 3) {
        if (this.notifications.length > maxNotifications) {
            const oldestNotifications = this.notifications
                .sort((a, b) => a.timestamp - b.timestamp)
                .slice(0, this.notifications.length - maxNotifications);

            oldestNotifications.forEach(notification => {
                this.closeNotification(notification.id);
            });
        }
    }

    // Tocar som de notificação
    playNotificationSound(type) {
        try {
            // Criar contexto de áudio
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Frequências diferentes para cada tipo
            const frequencies = {
                points: [523.25, 659.25], // C5, E5
                badge: [523.25, 659.25, 783.99], // C5, E5, G5
                level: [523.25, 659.25, 783.99, 1046.50], // C5, E5, G5, C6
                streak: [659.25, 783.99], // E5, G5
                course: [523.25, 698.46, 880.00] // C5, F5, A5
            };

            const freqs = frequencies[type] || frequencies.points;
            
            // Tocar sequência de notas
            freqs.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.3);
                }, index * 150);
            });
        } catch (error) {
            console.log('Som de notificação não disponível:', error);
        }
    }

    // Alternar som
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.saveSettings();
        return this.soundEnabled;
    }

    // Limpar todas as notificações
    clearAll() {
        this.notifications.forEach(notification => {
            this.closeNotification(notification.id);
        });
    }

    // Método para testar notificações (desenvolvimento)
    test() {
        setTimeout(() => this.showPointsNotification(50, 'Quiz completado'), 1000);
        setTimeout(() => this.showBadgeNotification({
            name: 'Primeiro Passo',
            description: 'Complete seu primeiro curso',
            icon: '🎯',
            points: 100
        }), 3000);
        setTimeout(() => this.showLevelUpNotification(5, 200), 5000);
        setTimeout(() => this.showStreakNotification(7), 7000);
        setTimeout(() => this.showCourseCompletedNotification('Excel Básico', 300, true), 9000);
    }
}

// Instância global do sistema de notificações
const notificationSystem = new NotificationSystem();

// Exportar para uso em outros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;
}

