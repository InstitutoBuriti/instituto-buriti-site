/**
 * Sistema de Gamificação - Instituto Buriti
 * Gerenciamento de XP, badges, desafios e ranking
 */

class GamificationSystem {
    constructor() {
        this.apiBaseUrl = 'https://zmhqivcvkygp.manus.space/api';
        this.currentUser = this.getCurrentUser();
        this.userProgress = {};
        this.challenges = [];
        this.badges = [];
        this.leaderboard = [];
        this.rewards = [];
        
        this.init();
    }
    
    init() {
        this.loadGamificationData();
        this.setupEventListeners();
        this.startTimers();
        
        console.log('🎮 Sistema de Gamificação inicializado');
    }
    
    getCurrentUser() {
        // Simular usuário logado
        return {
            id: 'user-123',
            name: 'João Silva',
            email: 'joao.silva@email.com',
            level: 8,
            xp: 7500,
            xpToNextLevel: 10000,
            coins: 2450,
            consecutiveDays: 45,
            badges: 12,
            title: '🏆 Estudante Dedicado'
        };
    }
    
    async loadGamificationData() {
        try {
            await Promise.all([
                this.loadUserProgress(),
                this.loadDailyChallenges(),
                this.loadBadges(),
                this.loadLeaderboard(),
                this.loadRewards()
            ]);
            
            this.updateUI();
        } catch (error) {
            console.error('Erro ao carregar dados de gamificação:', error);
            this.showNotification('Erro ao carregar dados', 'error');
        }
    }
    
    async loadUserProgress() {
        // Simular dados de progresso do usuário
        this.userProgress = {
            level: 8,
            xp: 7500,
            xpToNextLevel: 10000,
            coins: 2450,
            consecutiveDays: 45,
            totalBadges: 12,
            weeklyXP: 1250,
            monthlyXP: 4800,
            totalXP: 7500
        };
    }
    
    async loadDailyChallenges() {
        // Simular desafios diários
        this.challenges = [
            {
                id: 'challenge-1',
                title: 'Estudar por 30 minutos',
                description: 'Complete uma sessão de estudo',
                icon: '📚',
                progress: 30,
                target: 30,
                reward: 100,
                status: 'completed'
            },
            {
                id: 'challenge-2',
                title: 'Assistir 3 videoaulas',
                description: 'Complete videoaulas de qualquer curso',
                icon: '🎥',
                progress: 2,
                target: 3,
                reward: 150,
                status: 'active'
            },
            {
                id: 'challenge-3',
                title: 'Participar do chat',
                description: 'Envie 5 mensagens no chat da comunidade',
                icon: '💬',
                progress: 0,
                target: 5,
                reward: 75,
                status: 'pending'
            },
            {
                id: 'challenge-4',
                title: 'Fazer um quiz',
                description: 'Complete um quiz com nota mínima 8.0',
                icon: '📝',
                progress: 0,
                target: 1,
                reward: 200,
                status: 'pending'
            }
        ];
    }
    
    async loadBadges() {
        // Simular badges
        this.badges = [
            {
                id: 'badge-1',
                title: 'Primeiro Curso',
                description: 'Complete seu primeiro curso',
                icon: '🎓',
                rarity: 'rare',
                earned: true,
                earnedDate: '2025-07-15'
            },
            {
                id: 'badge-2',
                title: 'Sequência de 30 dias',
                description: 'Estude por 30 dias consecutivos',
                icon: '🔥',
                rarity: 'epic',
                earned: true,
                earnedDate: '2025-07-10'
            },
            {
                id: 'badge-3',
                title: 'Nota Perfeita',
                description: 'Tire nota 10 em um quiz',
                icon: '💯',
                rarity: 'common',
                earned: true,
                earnedDate: '2025-07-08'
            },
            {
                id: 'badge-4',
                title: 'Socialização',
                description: 'Envie 100 mensagens no chat',
                icon: '👥',
                rarity: 'common',
                earned: true,
                earnedDate: '2025-07-05'
            },
            {
                id: 'badge-5',
                title: 'Mestre dos Cursos',
                description: 'Complete 10 cursos diferentes',
                icon: '🏆',
                rarity: 'legendary',
                earned: false,
                progress: 5,
                target: 10
            },
            {
                id: 'badge-6',
                title: 'Velocidade da Luz',
                description: 'Complete um curso em menos de 7 dias',
                icon: '⚡',
                rarity: 'epic',
                earned: false
            },
            {
                id: 'badge-7',
                title: 'Perfeccionista',
                description: 'Tire nota 10 em 5 quizzes seguidos',
                icon: '🎯',
                rarity: 'rare',
                earned: false,
                progress: 2,
                target: 5
            },
            {
                id: 'badge-8',
                title: 'Estrela Cadente',
                description: 'Ganhe 1000 XP em um único dia',
                icon: '🌟',
                rarity: 'legendary',
                earned: false
            }
        ];
    }
    
    async loadLeaderboard() {
        // Simular ranking
        this.leaderboard = [
            {
                id: 'user-456',
                name: 'Maria Santos',
                level: 12,
                weeklyXP: 2850,
                position: 1
            },
            {
                id: 'user-789',
                name: 'Carlos Admin',
                level: 15,
                weeklyXP: 2100,
                position: 2
            },
            {
                id: 'user-321',
                name: 'Ana Costa',
                level: 9,
                weeklyXP: 1750,
                position: 3
            },
            {
                id: 'user-123',
                name: 'João Silva (Você)',
                level: 8,
                weeklyXP: 1250,
                position: 4,
                isCurrentUser: true
            },
            {
                id: 'user-654',
                name: 'Pedro Oliveira',
                level: 6,
                weeklyXP: 980,
                position: 5
            }
        ];
    }
    
    async loadRewards() {
        // Simular loja de recompensas
        this.rewards = [
            {
                id: 'reward-1',
                title: 'Avatar Personalizado',
                description: 'Desbloqueie novos avatars únicos',
                icon: '🎨',
                price: 500,
                available: true
            },
            {
                id: 'reward-2',
                title: 'Multiplicador XP 2x',
                description: 'Ganhe XP em dobro por 24 horas',
                icon: '🎯',
                price: 1000,
                available: true
            },
            {
                id: 'reward-3',
                title: 'Curso Premium Grátis',
                description: 'Acesso gratuito a um curso premium',
                icon: '📚',
                price: 2500,
                available: false
            },
            {
                id: 'reward-4',
                title: 'Título Especial',
                description: 'Exiba um título único no seu perfil',
                icon: '🏷️',
                price: 750,
                available: true
            }
        ];
    }
    
    updateUI() {
        this.updateUserProgress();
        this.updateChallenges();
        this.updateBadges();
        this.updateLeaderboard();
        this.updateRewards();
    }
    
    updateUserProgress() {
        // Atualizar barra de progresso do nível
        const progressFill = document.querySelector('.level-progress .progress-fill');
        if (progressFill) {
            const percentage = (this.userProgress.xp / this.userProgress.xpToNextLevel) * 100;
            progressFill.style.width = `${percentage}%`;
        }
        
        // Atualizar texto de progresso
        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = `${this.userProgress.xp.toLocaleString()} / ${this.userProgress.xpToNextLevel.toLocaleString()} XP para Nível ${this.userProgress.level + 1}`;
        }
        
        // Atualizar estatísticas
        const statValues = document.querySelectorAll('.stat-value');
        if (statValues.length >= 3) {
            statValues[0].textContent = this.userProgress.totalXP.toLocaleString();
            statValues[1].textContent = this.userProgress.consecutiveDays.toString();
            statValues[2].textContent = this.userProgress.totalBadges.toString();
        }
    }
    
    updateChallenges() {
        // Atualizar progresso dos desafios
        this.challenges.forEach(challenge => {
            const challengeCard = document.querySelector(`[data-challenge-id="${challenge.id}"]`);
            if (challengeCard) {
                const progressFill = challengeCard.querySelector('.progress-fill');
                const progressText = challengeCard.querySelector('.challenge-progress span');
                
                if (progressFill && progressText) {
                    const percentage = (challenge.progress / challenge.target) * 100;
                    progressFill.style.width = `${percentage}%`;
                    
                    if (challenge.status === 'completed') {
                        progressText.textContent = `${challenge.target}/${challenge.target} ${this.getProgressUnit(challenge.id)}`;
                    } else {
                        progressText.textContent = `${challenge.progress}/${challenge.target} ${this.getProgressUnit(challenge.id)}`;
                    }
                }
            }
        });
    }
    
    getProgressUnit(challengeId) {
        const units = {
            'challenge-1': 'min',
            'challenge-2': 'vídeos',
            'challenge-3': 'mensagens',
            'challenge-4': 'quiz'
        };
        return units[challengeId] || '';
    }
    
    updateBadges() {
        // Filtrar badges baseado no filtro ativo
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        this.filterBadges(activeFilter);
    }
    
    updateLeaderboard() {
        // Atualizar ranking
        console.log('Ranking atualizado:', this.leaderboard);
    }
    
    updateRewards() {
        // Atualizar loja de recompensas
        console.log('Recompensas atualizadas:', this.rewards);
    }
    
    setupEventListeners() {
        // Filtros de badges
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterBadges(btn.dataset.filter);
            });
        });
        
        // Período do ranking
        const rankingPeriod = document.getElementById('rankingPeriod');
        if (rankingPeriod) {
            rankingPeriod.addEventListener('change', () => {
                this.updateRankingPeriod(rankingPeriod.value);
            });
        }
        
        // Botões de compra na loja
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-buy') && !e.target.classList.contains('disabled')) {
                const rewardItem = e.target.closest('.reward-item');
                if (rewardItem) {
                    this.buyReward(rewardItem.dataset.rewardId);
                }
            }
        });
        
        // Simular progresso em tempo real
        this.simulateProgress();
    }
    
    filterBadges(filter) {
        const badgeCards = document.querySelectorAll('.badge-card');
        
        badgeCards.forEach(card => {
            const isEarned = card.classList.contains('earned');
            const isLocked = card.classList.contains('locked');
            
            let show = false;
            
            switch (filter) {
                case 'all':
                    show = true;
                    break;
                case 'earned':
                    show = isEarned;
                    break;
                case 'locked':
                    show = isLocked;
                    break;
            }
            
            card.style.display = show ? 'block' : 'none';
        });
    }
    
    updateRankingPeriod(period) {
        // Simular mudança de período do ranking
        console.log('Período do ranking alterado para:', period);
        this.showNotification(`Ranking atualizado para: ${this.getPeriodLabel(period)}`, 'info');
    }
    
    getPeriodLabel(period) {
        const labels = {
            'week': 'Esta semana',
            'month': 'Este mês',
            'all': 'Todos os tempos'
        };
        return labels[period] || period;
    }
    
    async buyReward(rewardId) {
        try {
            const reward = this.rewards.find(r => r.id === rewardId);
            if (!reward) return;
            
            if (this.userProgress.coins < reward.price) {
                this.showNotification('Moedas insuficientes!', 'error');
                return;
            }
            
            // Simular compra
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.userProgress.coins -= reward.price;
            this.showNotification(`${reward.title} comprado com sucesso!`, 'success');
            
            // Atualizar UI
            this.updateCoinsDisplay();
            
        } catch (error) {
            console.error('Erro ao comprar recompensa:', error);
            this.showNotification('Erro ao processar compra', 'error');
        }
    }
    
    updateCoinsDisplay() {
        const coinsDisplay = document.querySelector('.user-coins strong');
        if (coinsDisplay) {
            coinsDisplay.textContent = this.userProgress.coins.toLocaleString();
        }
    }
    
    startTimers() {
        // Timer para reset dos desafios diários
        this.updateResetTimer();
        setInterval(() => this.updateResetTimer(), 1000);
        
        // Simular ganho de XP periódico
        setInterval(() => this.simulateXPGain(), 30000); // A cada 30 segundos
    }
    
    updateResetTimer() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const timeLeft = tomorrow - now;
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        const timerElement = document.getElementById('resetTimer');
        if (timerElement) {
            timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    simulateProgress() {
        // Simular progresso em desafios
        setTimeout(() => {
            this.updateChallengeProgress('challenge-2', 1);
        }, 10000);
        
        setTimeout(() => {
            this.updateChallengeProgress('challenge-3', 2);
        }, 20000);
    }
    
    simulateXPGain() {
        // Simular ganho de XP aleatório
        const xpGain = Math.floor(Math.random() * 50) + 10;
        this.addXP(xpGain, 'Atividade automática');
    }
    
    updateChallengeProgress(challengeId, increment) {
        const challenge = this.challenges.find(c => c.id === challengeId);
        if (challenge && challenge.status !== 'completed') {
            challenge.progress = Math.min(challenge.progress + increment, challenge.target);
            
            if (challenge.progress >= challenge.target) {
                challenge.status = 'completed';
                this.completeChallenge(challengeId);
            }
            
            this.updateChallenges();
        }
    }
    
    completeChallenge(challengeId) {
        const challenge = this.challenges.find(c => c.id === challengeId);
        if (challenge) {
            this.addXP(challenge.reward, `Desafio: ${challenge.title}`);
            this.showNotification(`Desafio concluído: ${challenge.title}! +${challenge.reward} XP`, 'success');
            
            // Animação de conclusão
            const challengeCard = document.querySelector(`[data-challenge-id="${challengeId}"]`);
            if (challengeCard) {
                challengeCard.classList.add('completed');
                challengeCard.style.animation = 'badgeEarned 0.8s ease-in-out';
            }
        }
    }
    
    addXP(amount, source = '') {
        const oldLevel = this.userProgress.level;
        this.userProgress.xp += amount;
        this.userProgress.totalXP += amount;
        
        // Verificar se subiu de nível
        while (this.userProgress.xp >= this.userProgress.xpToNextLevel) {
            this.userProgress.xp -= this.userProgress.xpToNextLevel;
            this.userProgress.level++;
            this.userProgress.xpToNextLevel = this.calculateXPForNextLevel(this.userProgress.level);
            
            this.levelUp(oldLevel, this.userProgress.level);
        }
        
        // Mostrar ganho de XP
        this.showXPGain(amount, source);
        this.updateUserProgress();
    }
    
    calculateXPForNextLevel(level) {
        // Fórmula para calcular XP necessário para próximo nível
        return Math.floor(1000 * Math.pow(1.2, level - 1));
    }
    
    levelUp(oldLevel, newLevel) {
        this.showNotification(`🎉 Parabéns! Você subiu para o Nível ${newLevel}!`, 'success');
        
        // Animação de level up
        const levelCard = document.querySelector('.user-level-card');
        if (levelCard) {
            levelCard.classList.add('level-up-animation');
            setTimeout(() => levelCard.classList.remove('level-up-animation'), 600);
        }
        
        // Recompensas por subir de nível
        const coinsReward = newLevel * 50;
        this.userProgress.coins += coinsReward;
        this.showNotification(`Recompensa de nível: +${coinsReward} moedas!`, 'info');
        
        this.updateCoinsDisplay();
    }
    
    showXPGain(amount, source) {
        // Criar elemento de ganho de XP
        const xpElement = document.createElement('div');
        xpElement.className = 'xp-gain-popup';
        xpElement.innerHTML = `+${amount} XP`;
        xpElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 1.2rem;
            z-index: 10000;
            box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
            pointer-events: none;
        `;
        
        document.body.appendChild(xpElement);
        
        // Animar
        xpElement.style.animation = 'xpGain 1s ease-out forwards';
        
        // Remover após animação
        setTimeout(() => {
            if (xpElement.parentElement) {
                xpElement.remove();
            }
        }, 1000);
        
        console.log(`XP ganho: +${amount} (${source})`);
    }
    
    earnBadge(badgeId) {
        const badge = this.badges.find(b => b.id === badgeId);
        if (badge && !badge.earned) {
            badge.earned = true;
            badge.earnedDate = new Date().toISOString().split('T')[0];
            
            this.showNotification(`🏅 Nova conquista desbloqueada: ${badge.title}!`, 'success');
            
            // Animação de badge
            const badgeCard = document.querySelector(`[data-badge-id="${badgeId}"]`);
            if (badgeCard) {
                badgeCard.classList.remove('locked');
                badgeCard.classList.add('earned');
                badgeCard.style.animation = 'badgeEarned 0.8s ease-in-out';
            }
            
            this.updateBadges();
        }
    }
    
    showNotification(message, type = 'info') {
        // Criar notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">
                    ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
                </span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Adicionar estilos
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
            border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
            border-radius: 8px;
            padding: 15px;
            max-width: 400px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        notification.querySelector('.notification-content').style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        notification.querySelector('.notification-close').style.cssText = `
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            margin-left: auto;
        `;
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover automaticamente
        const removeNotification = () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        };
        
        // Botão de fechar
        notification.querySelector('.notification-close').addEventListener('click', removeNotification);
        
        // Auto-remover após 5 segundos
        setTimeout(removeNotification, 5000);
    }
    
    // Métodos de integração com API
    async syncProgress() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/gamification/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(this.userProgress)
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao sincronizar progresso:', error);
            throw error;
        }
    }
    
    getAuthToken() {
        return localStorage.getItem('auth_token') || 'demo-token';
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window !== 'undefined') {
        window.GamificationSystem = GamificationSystem;
    }
});

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GamificationSystem;
}

