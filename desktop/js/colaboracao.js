// Collaboration Tools JavaScript

// Global variables
let currentTool = 'pen';
let isDrawing = false;
let canvas, ctx;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    initializeWhiteboard();
    simulateRealTimeUpdates();
});

// Study Room Functions
function joinStudyRoom() {
    showNotification('Entrando na sala de estudos...', 'info');
    setTimeout(() => {
        showNotification('Conectado! Bem-vindo à sala de estudos.', 'success');
    }, 2000);
}

function createStudyRoom() {
    showNotification('Criando nova sala de estudos...', 'info');
    setTimeout(() => {
        showNotification('Sala criada com sucesso! Compartilhe o link com outros estudantes.', 'success');
    }, 1500);
}

function joinRoom(roomId) {
    const roomNames = {
        1: 'Fundamentos de IA - Grupo de Estudos',
        2: 'Gestão de Projetos Culturais',
        3: 'Educação Especial Inclusiva'
    };
    
    showNotification(`Entrando na sala: ${roomNames[roomId]}`, 'info');
    setTimeout(() => {
        showNotification('Conectado à sala! Você pode começar a colaborar.', 'success');
    }, 1500);
}

// Messenger Functions
function openMessenger() {
    const modal = document.getElementById('messengerModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMessenger() {
    const modal = document.getElementById('messengerModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Whiteboard Functions
function openWhiteboard() {
    const modal = document.getElementById('whiteboardModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Initialize canvas after modal is shown
    setTimeout(() => {
        initializeWhiteboard();
    }, 100);
}

function closeWhiteboard() {
    const modal = document.getElementById('whiteboardModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function initializeWhiteboard() {
    canvas = document.getElementById('whiteboard');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Set default drawing properties
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Add event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);
    
    // Tool buttons
    const toolButtons = document.querySelectorAll('.tool-btn');
    toolButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            toolButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentTool = this.dataset.tool;
            updateCursor();
        });
    });
    
    // Color picker
    const colorPicker = document.querySelector('.color-picker');
    if (colorPicker) {
        colorPicker.addEventListener('change', function() {
            ctx.strokeStyle = this.value;
        });
    }
}

function startDrawing(e) {
    if (currentTool === 'pen' || currentTool === 'eraser') {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (currentTool === 'pen') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineTo(x, y);
        ctx.stroke();
    } else if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineTo(x, y);
        ctx.stroke();
    }
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                     e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function updateCursor() {
    if (!canvas) return;
    
    switch(currentTool) {
        case 'pen':
            canvas.style.cursor = 'crosshair';
            break;
        case 'eraser':
            canvas.style.cursor = 'grab';
            break;
        case 'text':
            canvas.style.cursor = 'text';
            break;
        default:
            canvas.style.cursor = 'default';
    }
}

// Other Tool Functions
function openDocuments() {
    showNotification('Abrindo documentos compartilhados...', 'info');
    setTimeout(() => {
        showNotification('12 documentos disponíveis para colaboração.', 'success');
    }, 1000);
}

function openScreenShare() {
    showNotification('Iniciando compartilhamento de tela...', 'info');
    setTimeout(() => {
        showNotification('Compartilhamento de tela ativo! Outros usuários podem ver sua tela.', 'success');
    }, 2000);
}

// Animation Functions
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
    
    const statsElements = document.querySelectorAll('.stat-card');
    statsElements.forEach(el => observer.observe(el));
}

function animateStats(element) {
    const numberEl = element.querySelector('.stat-number');
    if (numberEl && !numberEl.classList.contains('animated')) {
        numberEl.classList.add('animated');
        const finalValue = numberEl.textContent;
        const numericValue = parseFloat(finalValue.replace(/[^\d.]/g, ''));
        
        if (numericValue) {
            animateNumber(numberEl, 0, numericValue, finalValue);
        }
    }
}

function animateNumber(element, start, end, finalText) {
    const duration = 2000;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = start + (end - start) * easeOutQuart(progress);
        
        if (finalText.includes('K')) {
            element.textContent = (current / 1000).toFixed(1) + 'K';
        } else if (finalText.includes('.')) {
            element.textContent = current.toFixed(1);
        } else {
            element.textContent = Math.floor(current);
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = finalText;
        }
    }
    
    requestAnimationFrame(updateNumber);
}

function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
}

// Real-time Updates Simulation
function simulateRealTimeUpdates() {
    // Update online users count
    setInterval(() => {
        const onlineElement = document.querySelector('.stat-card:first-child .stat-number');
        if (onlineElement) {
            const current = parseInt(onlineElement.textContent);
            const change = Math.floor(Math.random() * 10) - 5; // -5 to +5
            const newValue = Math.max(100, current + change);
            onlineElement.textContent = newValue;
        }
    }, 30000);
    
    // Add new activity items
    setInterval(() => {
        addNewActivity();
    }, 45000);
    
    // Update room participants
    setInterval(() => {
        updateRoomParticipants();
    }, 20000);
}

function addNewActivity() {
    const activities = [
        {
            user: 'Carlos Silva',
            action: 'entrou em uma sala de estudos',
            details: '"Python para Iniciantes"',
            icon: 'video',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face'
        },
        {
            user: 'Ana Costa',
            action: 'compartilhou um arquivo',
            details: '"Exercícios de Machine Learning.pdf"',
            icon: 'file-text',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face'
        },
        {
            user: 'Roberto Lima',
            action: 'criou um quadro colaborativo',
            details: '"Brainstorm - Projeto Final"',
            icon: 'edit',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face'
        }
    ];
    
    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    const activityFeed = document.querySelector('.activity-feed');
    
    if (activityFeed) {
        const newActivity = document.createElement('div');
        newActivity.className = 'activity-item';
        newActivity.style.opacity = '0';
        newActivity.style.transform = 'translateX(-20px)';
        
        newActivity.innerHTML = `
            <div class="activity-avatar">
                <img src="${randomActivity.avatar}" alt="${randomActivity.user}">
            </div>
            <div class="activity-content">
                <div class="activity-header">
                    <span class="activity-user">${randomActivity.user}</span>
                    <span class="activity-action">${randomActivity.action}</span>
                    <span class="activity-time">agora</span>
                </div>
                <div class="activity-details">${randomActivity.details}</div>
            </div>
            <div class="activity-type">
                <i data-lucide="${randomActivity.icon}"></i>
            </div>
        `;
        
        activityFeed.insertBefore(newActivity, activityFeed.firstChild);
        
        // Initialize Lucide icons for new element
        lucide.createIcons();
        
        // Animate in
        setTimeout(() => {
            newActivity.style.transition = 'all 0.3s ease';
            newActivity.style.opacity = '1';
            newActivity.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove oldest activity if more than 6
        const activities = activityFeed.querySelectorAll('.activity-item');
        if (activities.length > 6) {
            activities[activities.length - 1].remove();
        }
    }
}

function updateRoomParticipants() {
    const participantElements = document.querySelectorAll('.room-participants span');
    participantElements.forEach(element => {
        const [current, max] = element.textContent.split('/').map(n => parseInt(n));
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        const newCurrent = Math.max(0, Math.min(max, current + change));
        element.textContent = `${newCurrent}/${max}`;
    });
}

// Notification System
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
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        border-left: 4px solid ${getNotificationColor(type)};
        z-index: 3000;
        transform: translateX(400px);
        transition: all 0.3s ease;
        max-width: 350px;
        backdrop-filter: blur(10px);
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: ${getNotificationColor(type)};
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            ">
                <i data-lucide="${getNotificationIcon(type)}"></i>
            </div>
            <span style="color: #333; font-weight: 500; line-height: 1.4;">${message}</span>
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

    // Hide notification after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
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
        'info': '#40E0D0'
    };
    return colors[type] || '#40E0D0';
}

// Keyboard Shortcuts
document.addEventListener('keydown', function(event) {
    // Press 'M' to open messenger
    if (event.key === 'm' || event.key === 'M') {
        if (!document.getElementById('messengerModal').classList.contains('active')) {
            openMessenger();
        }
    }
    
    // Press 'W' to open whiteboard
    if (event.key === 'w' || event.key === 'W') {
        if (!document.getElementById('whiteboardModal').classList.contains('active')) {
            openWhiteboard();
        }
    }
    
    // Press 'Escape' to close modals
    if (event.key === 'Escape') {
        closeMessenger();
        closeWhiteboard();
    }
    
    // Press 'Enter' in chat input to send message
    if (event.key === 'Enter' && event.target.matches('.chat-input input')) {
        sendMessage();
    }
});

// Chat Functions
function sendMessage() {
    const input = document.querySelector('.chat-input input');
    if (input && input.value.trim()) {
        const message = input.value.trim();
        addMessageToChat(message, 'sent');
        input.value = '';
        
        // Simulate response
        setTimeout(() => {
            const responses = [
                'Entendi! Obrigado pela explicação.',
                'Isso faz muito sentido.',
                'Vou tentar implementar isso.',
                'Ótima ideia!',
                'Posso ajudar com isso também.'
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addMessageToChat(randomResponse, 'received');
        }, 1000 + Math.random() * 2000);
    }
}

function addMessageToChat(message, type) {
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageElement.innerHTML = `
        <div class="message-content">${message}</div>
        <div class="message-time">${timeString}</div>
    `;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Modal click outside to close
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        closeMessenger();
        closeWhiteboard();
    }
});

// Initialize chat input functionality
document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.querySelector('.chat-input input');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    const sendButton = document.querySelector('.chat-input button');
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
});

// Add hover effects to interactive elements
document.addEventListener('DOMContentLoaded', function() {
    const interactiveElements = document.querySelectorAll('.room-card, .tool-card, .activity-item');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Initialize page with welcome message
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        showNotification('Bem-vindo às Ferramentas Colaborativas! Explore as salas de estudo e conecte-se com outros estudantes.', 'info');
    }, 1000);
});

