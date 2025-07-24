// Gamification JavaScript

// Sample badges data
const badgesData = [
    {
        id: 1,
        title: "Primeiro Passo",
        description: "Complete sua primeira aula",
        icon: "play-circle",
        color: "green",
        earned: true,
        progress: "1/1",
        category: "iniciante"
    },
    {
        id: 2,
        title: "Estudante Dedicado",
        description: "Complete 5 aulas em uma semana",
        icon: "book-open",
        color: "blue",
        earned: true,
        progress: "5/5",
        category: "progresso"
    },
    {
        id: 3,
        title: "Mestre dos Quizzes",
        description: "Acerte 90% em 3 quizzes consecutivos",
        icon: "brain",
        color: "purple",
        earned: true,
        progress: "3/3",
        category: "conhecimento"
    },
    {
        id: 4,
        title: "Maratonista",
        description: "Estude por 5 horas em um dia",
        icon: "zap",
        color: "gold",
        earned: false,
        progress: "3.2/5",
        category: "dedicacao"
    },
    {
        id: 5,
        title: "Colaborador",
        description: "Participe de 10 discussões no fórum",
        icon: "message-circle",
        color: "blue",
        earned: false,
        progress: "7/10",
        category: "social"
    },
    {
        id: 6,
        title: "Explorador",
        description: "Complete cursos de 3 categorias diferentes",
        icon: "compass",
        color: "green",
        earned: false,
        progress: "2/3",
        category: "diversidade"
    },
    {
        id: 7,
        title: "Perfeccionista",
        description: "Obtenha nota máxima em 5 avaliações",
        icon: "star",
        color: "gold",
        earned: true,
        progress: "5/5",
        category: "excelencia"
    },
    {
        id: 8,
        title: "Mentor",
        description: "Ajude 5 colegas no fórum",
        icon: "users",
        color: "purple",
        earned: false,
        progress: "2/5",
        category: "social"
    },
    {
        id: 9,
        title: "Sequência de Ouro",
        description: "Mantenha uma sequência de 30 dias",
        icon: "calendar",
        color: "gold",
        earned: false,
        progress: "18/30",
        category: "consistencia"
    },
    {
        id: 10,
        title: "Especialista IA",
        description: "Complete todos os cursos de IA",
        icon: "cpu",
        color: "red",
        earned: false,
        progress: "4/6",
        category: "especializacao"
    },
    {
        id: 11,
        title: "Velocista",
        description: "Complete uma aula em menos de 10 minutos",
        icon: "clock",
        color: "blue",
        earned: true,
        progress: "1/1",
        category: "velocidade"
    },
    {
        id: 12,
        title: "Colecionador",
        description: "Conquiste 20 badges diferentes",
        icon: "award",
        color: "gold",
        earned: false,
        progress: "12/20",
        category: "conquista"
    }
];

let currentBadgeFilter = 'all';

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadBadges();
    initializeAnimations();
    updateProgressBars();
});

// Load and display badges
function loadBadges() {
    const badgesGrid = document.getElementById('badgesGrid');
    if (!badgesGrid) return;

    let filteredBadges = [...badgesData];

    // Apply filter
    if (currentBadgeFilter === 'earned') {
        filteredBadges = filteredBadges.filter(badge => badge.earned);
    } else if (currentBadgeFilter === 'locked') {
        filteredBadges = filteredBadges.filter(badge => !badge.earned);
    }

    // Generate HTML
    badgesGrid.innerHTML = filteredBadges.map(badge => createBadgeCard(badge)).join('');
    
    // Re-initialize Lucide icons
    setTimeout(() => {
        lucide.createIcons();
    }, 100);
}

// Create badge card HTML
function createBadgeCard(badge) {
    const earnedClass = badge.earned ? 'earned' : 'locked';
    const progressText = badge.earned ? 'Conquistado!' : badge.progress;
    const progressClass = badge.earned ? 'badge-earned' : '';

    return `
        <div class="badge-card ${earnedClass}" onclick="showBadgeDetails(${badge.id})">
            <div class="badge-icon ${badge.color}">
                <i data-lucide="${badge.icon}"></i>
            </div>
            <h3 class="badge-title">${badge.title}</h3>
            <p class="badge-description">${badge.description}</p>
            <div class="badge-progress ${progressClass}">${progressText}</div>
        </div>
    `;
}

// Filter badges
function filterBadges(filter) {
    currentBadgeFilter = filter;
    
    // Update button states
    document.querySelectorAll('.section-filters .filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    loadBadges();
}

// Filter leaderboard
function filterLeaderboard(filter) {
    // Update button states
    document.querySelectorAll('.leaderboard-filters .filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Here you would typically load different leaderboard data
    showNotification(`Carregando ranking: ${getFilterName(filter)}`, 'info');
}

function getFilterName(filter) {
    const names = {
        'global': 'Global',
        'friends': 'Amigos',
        'course': 'Curso Atual'
    };
    return names[filter] || filter;
}

// Show badge details (could open a modal)
function showBadgeDetails(badgeId) {
    const badge = badgesData.find(b => b.id === badgeId);
    if (!badge) return;
    
    const status = badge.earned ? 'conquistado' : 'em progresso';
    showNotification(`Badge "${badge.title}" - ${status}`, badge.earned ? 'success' : 'info');
}

// Initialize animations
function initializeAnimations() {
    // Animate floating elements
    const floatingElements = document.querySelectorAll('.floating-element');
    floatingElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 2}s`;
    });
    
    // Animate stats on scroll
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats(entry.target);
            }
        });
    }, observerOptions);
    
    const statsElements = document.querySelectorAll('.hero-stat, .stat-card');
    statsElements.forEach(el => observer.observe(el));
}

// Animate stats numbers
function animateStats(element) {
    const numbers = element.querySelectorAll('.stat-number, .hero-stat .stat-number');
    numbers.forEach(numberEl => {
        const finalValue = numberEl.textContent;
        const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
        
        if (numericValue && !numberEl.classList.contains('animated')) {
            numberEl.classList.add('animated');
            animateNumber(numberEl, 0, numericValue, finalValue);
        }
    });
}

// Animate number counting
function animateNumber(element, start, end, finalText) {
    const duration = 2000;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (end - start) * easeOutQuart(progress));
        
        if (finalText.includes('#')) {
            element.textContent = '#' + current;
        } else if (finalText.includes('K')) {
            element.textContent = (current / 1000).toFixed(1) + 'K';
        } else if (finalText.includes('h')) {
            element.textContent = current + 'h';
        } else {
            element.textContent = current.toLocaleString();
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = finalText;
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Easing function
function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
}

// Update progress bars with animation
function updateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill, .xp-fill');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');
                animateProgressBar(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    progressBars.forEach(bar => observer.observe(bar));
}

// Animate progress bar
function animateProgressBar(element) {
    const finalWidth = element.style.width || '0%';
    const finalValue = parseInt(finalWidth);
    
    element.style.width = '0%';
    
    setTimeout(() => {
        element.style.transition = 'width 1.5s ease-out';
        element.style.width = finalWidth;
    }, 100);
}

// Reward redemption
function redeemReward(rewardName, cost) {
    const currentXP = 2847; // This would come from user data
    
    if (currentXP >= cost) {
        showNotification(`Recompensa "${rewardName}" resgatada com sucesso!`, 'success');
        // Here you would update the user's XP and add the reward to their inventory
    } else {
        const needed = cost - currentXP;
        showNotification(`Você precisa de mais ${needed} XP para resgatar esta recompensa.`, 'warning');
    }
}

// Add event listeners to reward buttons
document.addEventListener('DOMContentLoaded', function() {
    const rewardButtons = document.querySelectorAll('.reward-btn');
    rewardButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.reward-card');
            const rewardName = card.querySelector('h3').textContent;
            const costText = card.querySelector('.reward-price span').textContent;
            const cost = parseInt(costText.replace(/[^\d]/g, ''));
            
            redeemReward(rewardName, cost);
        });
    });
});

// Challenge interaction
function updateChallengeProgress(challengeId, newProgress) {
    const challengeCard = document.querySelector(`[data-challenge-id="${challengeId}"]`);
    if (challengeCard) {
        const progressBar = challengeCard.querySelector('.progress-fill');
        const progressText = challengeCard.querySelector('.challenge-progress span');
        
        progressBar.style.width = newProgress + '%';
        // Update progress text based on challenge type
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        border-left: 4px solid ${getNotificationColor(type)};
        z-index: 3000;
        transform: translateX(400px);
        transition: all 0.3s ease;
        max-width: 300px;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i data-lucide="${getNotificationIcon(type)}" style="color: ${getNotificationColor(type)};"></i>
            <span style="color: #333; font-weight: 500;">${message}</span>
        </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Initialize icon
    lucide.createIcons();

    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'x-circle',
        'warning': 'alert-triangle',
        'info': 'info'
    };
    return icons[type] || 'info';
}

function getNotificationColor(type) {
    const colors = {
        'success': '#10b981',
        'error': '#ef4444',
        'warning': '#f59e0b',
        'info': '#3b82f6'
    };
    return colors[type] || '#3b82f6';
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Press 'B' to focus on badges
    if (event.key === 'b' || event.key === 'B') {
        const badgesSection = document.querySelector('.badges-section');
        if (badgesSection) {
            badgesSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // Press 'C' to focus on challenges
    if (event.key === 'c' || event.key === 'C') {
        const challengesSection = document.querySelector('.challenges-section');
        if (challengesSection) {
            challengesSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // Press 'L' to focus on leaderboard
    if (event.key === 'l' || event.key === 'L') {
        const leaderboardSection = document.querySelector('.leaderboard-section');
        if (leaderboardSection) {
            leaderboardSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // Press 'R' to focus on rewards
    if (event.key === 'r' || event.key === 'R') {
        const rewardsSection = document.querySelector('.rewards-section');
        if (rewardsSection) {
            rewardsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Add hover effects to interactive elements
document.addEventListener('DOMContentLoaded', function() {
    // Add hover sound effect (visual feedback)
    const interactiveElements = document.querySelectorAll('.badge-card, .challenge-card, .reward-card, .leaderboard-item');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Simulate real-time updates
function simulateRealTimeUpdates() {
    setInterval(() => {
        // Randomly update some progress
        const progressBars = document.querySelectorAll('.challenge-card .progress-fill');
        if (progressBars.length > 0) {
            const randomBar = progressBars[Math.floor(Math.random() * progressBars.length)];
            const currentWidth = parseInt(randomBar.style.width) || 0;
            if (currentWidth < 100) {
                const newWidth = Math.min(currentWidth + Math.random() * 5, 100);
                randomBar.style.width = newWidth + '%';
            }
        }
    }, 30000); // Update every 30 seconds
}

// Start real-time updates
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(simulateRealTimeUpdates, 5000); // Start after 5 seconds
});

// Add particle effects for special achievements
function createParticleEffect(element) {
    const particles = [];
    const colors = ['#FFD700', '#FF69B4', '#32CD32', '#FF4500', '#9C27B0'];
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 6px;
            height: 6px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
        `;
        
        const rect = element.getBoundingClientRect();
        particle.style.left = (rect.left + rect.width / 2) + 'px';
        particle.style.top = (rect.top + rect.height / 2) + 'px';
        
        document.body.appendChild(particle);
        particles.push(particle);
        
        // Animate particle
        const angle = (Math.PI * 2 * i) / 20;
        const velocity = 100 + Math.random() * 100;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        let x = 0, y = 0;
        const gravity = 500;
        const startTime = performance.now();
        
        function animateParticle(currentTime) {
            const elapsed = (currentTime - startTime) / 1000;
            
            x = vx * elapsed;
            y = vy * elapsed + 0.5 * gravity * elapsed * elapsed;
            
            particle.style.transform = `translate(${x}px, ${y}px)`;
            particle.style.opacity = Math.max(0, 1 - elapsed / 2);
            
            if (elapsed < 2) {
                requestAnimationFrame(animateParticle);
            } else {
                particle.remove();
            }
        }
        
        requestAnimationFrame(animateParticle);
    }
}

// Trigger particle effect on badge earn
function earnBadge(badgeId) {
    const badge = badgesData.find(b => b.id === badgeId);
    if (badge && !badge.earned) {
        badge.earned = true;
        badge.progress = "Conquistado!";
        
        loadBadges();
        
        const badgeElement = document.querySelector(`[onclick="showBadgeDetails(${badgeId})"]`);
        if (badgeElement) {
            createParticleEffect(badgeElement);
            showNotification(`🎉 Parabéns! Você conquistou o badge "${badge.title}"!`, 'success');
        }
    }
}

