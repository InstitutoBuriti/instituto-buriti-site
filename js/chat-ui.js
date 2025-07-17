/**
 * Interface de Usuário para Chat em Tempo Real
 * Instituto Buriti - Sistema class ChatUI {
    constructor(chatClient = null) {
        this.chatClient = chatClient || getChatClient();
        this.currentUser = null;
        this.currentRoom = null;
        this.typingUsers = new Map();
        this.participants = [];
        this.rooms = [];
        this.isInitialized = false;
        
        this.initialize();
    }'😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
            people: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
            nature: ['🌟', '⭐', '🌙', '☀️', '⛅', '🌈', '🔥', '💧', '❄️', '⚡', '🌸', '🌺', '🌻', '🌷', '🌹', '🌿', '🍀', '🌱', '🌳', '🌲', '🍃', '🍂', '🍁', '🌾', '🌵', '🌴', '🌊', '🏔️', '⛰️', '🗻'],
            objects: ['📚', '📖', '📝', '✏️', '🖊️', '🖋️', '🖍️', '📄', '📃', '📑', '📊', '📈', '📉', '📇', '📅', '📆', '🗓️', '📋', '📌', '📍', '📎', '🖇️', '📏', '📐', '✂️', '🗃️', '🗄️', '🗂️', '📂', '📁'],
            symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐']
        };
        
        this.initializeElements();
        this.setupEventListeners();
    }

    /**
     * Inicializar elementos DOM
     */
    initializeElements() {
        // Elementos principais
        this.roomsList = document.getElementById('roomsList');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.participantsPanel = document.getElementById('participantsPanel');
        this.participantsList = document.getElementById('participantsList');
        this.emojiPickerModal = document.getElementById('emojiPickerModal');
        this.emojiGrid = document.getElementById('emojiGrid');
        this.chatNotifications = document.getElementById('chatNotifications');
        
        // Elementos de informação
        this.currentRoomName = document.getElementById('currentRoomName');
        this.currentRoomDescription = document.getElementById('currentRoomDescription');
        this.participantsCount = document.getElementById('participantsCount');
        this.onlineCount = document.getElementById('onlineCount');
        this.charCounter = document.getElementById('charCounter');
        
        // Elementos de usuário
        this.userNameDisplay = document.getElementById('userNameDisplay');
        this.sidebarUsername = document.getElementById('sidebarUsername');
        this.userTypeDisplay = document.getElementById('userTypeDisplay');
        this.userAvatar = document.getElementById('userAvatar');
        this.userInitials = document.getElementById('userInitials');
        
        // Botões
        this.participantsBtn = document.getElementById('participantsBtn');
        this.emojiBtn = document.getElementById('emojiBtn');
        this.attachBtn = document.getElementById('attachBtn');
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Input de mensagem
        if (this.messageInput) {
            this.messageInput.addEventListener('input', () => {
                this.handleInputChange();
            });
            
            this.messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                } else if (e.key === 'Enter' && e.shiftKey) {
                    // Permitir quebra de linha com Shift+Enter
                    return;
                }
            });
            
            this.messageInput.addEventListener('focus', () => {
                if (this.chatClient) {
                    this.chatClient.startTyping();
                }
            });
            
            this.messageInput.addEventListener('blur', () => {
                if (this.chatClient) {
                    this.chatClient.stopTyping();
                }
            });
        }

        // Botão enviar
        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        // Botão participantes
        if (this.participantsBtn) {
            this.participantsBtn.addEventListener('click', () => {
                this.toggleParticipantsPanel();
            });
        }

        // Botão emoji
        if (this.emojiBtn) {
            this.emojiBtn.addEventListener('click', () => {
                this.toggleEmojiPicker();
            });
        }

        // Fechar emoji picker ao clicar fora
        document.addEventListener('click', (e) => {
            if (this.emojiPickerModal && 
                !this.emojiPickerModal.contains(e.target) && 
                !this.emojiBtn.contains(e.target)) {
                this.hideEmojiPicker();
            }
        });

        // Auto-resize do textarea
        if (this.messageInput) {
            this.messageInput.addEventListener('input', () => {
                this.autoResizeTextarea();
            });
        }
    }

    /**
     * Inicializar chat
     */
    async initialize() {
        try {
            // Obter dados do usuário
            this.currentUser = this.getCurrentUserData();
            if (!this.currentUser) {
                throw new Error('Usuário não autenticado');
            }

            // Atualizar interface com dados do usuário
            this.updateUserInterface();

            // Inicializar cliente de chat
            const serverUrl = window.API_BASE_URL || 'http://localhost:5001';
            this.chatClient = initializeChatClient(serverUrl);

            // Configurar callbacks do cliente
            this.setupChatClientCallbacks();

            // Carregar salas disponíveis
            await this.loadRooms();

            // Conectar à sala padrão
            setTimeout(() => {
                this.joinRoom('general');
            }, 1000);

        } catch (error) {
            console.error('Erro ao inicializar chat:', error);
            this.showNotification('Erro', 'Não foi possível inicializar o chat', 'error');
        }
    }

    /**
     * Obter dados do usuário atual
     */
    getCurrentUserData() {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const user = JSON.parse(userData);
            return {
                user_id: user.id || user.user_id || 'demo_user',
                username: user.name || user.username || 'Usuário Demo',
                user_type: user.type || user.user_type || 'student',
                email: user.email || 'demo@institutoburiti.com'
            };
        }
        
        // Fallback para usuário demo
        return {
            user_id: 'demo_user',
            username: 'Usuário Demo',
            user_type: 'student',
            email: 'demo@institutoburiti.com'
        };
    }

    /**
     * Atualizar interface com dados do usuário
     */
    updateUserInterface() {
        if (!this.currentUser) return;

        const initials = ChatUtils.getInitials(this.currentUser.username);
        const userTypeText = this.currentUser.user_type === 'instructor' ? 'Instrutor' : 'Aluno';

        // Atualizar elementos de usuário
        if (this.userNameDisplay) this.userNameDisplay.textContent = this.currentUser.username;
        if (this.sidebarUsername) this.sidebarUsername.textContent = this.currentUser.username;
        if (this.userTypeDisplay) this.userTypeDisplay.textContent = userTypeText;
        if (this.userInitials) this.userInitials.textContent = initials;
    }

    /**
     * Configurar callbacks do cliente de chat
     */
    setupChatClientCallbacks() {
        if (!this.chatClient) return;

        this.chatClient.onConnected = () => {
            console.log('Chat conectado');
            this.showNotification('Conectado', 'Chat conectado com sucesso!', 'success');
        };

        this.chatClient.onDisconnected = (reason) => {
            console.log('Chat desconectado:', reason);
            this.showNotification('Desconectado', 'Conexão com o chat perdida', 'warning');
        };

        this.chatClient.onRoomJoined = (data) => {
            console.log('Entrou na sala:', data);
            this.currentRoom = data.room_id;
            this.updateRoomInterface(data);
            this.participants = data.online_users || [];
            this.updateParticipantsList();
        };

        this.chatClient.onChatHistory = (data) => {
            console.log('Histórico recebido:', data);
            this.displayChatHistory(data.messages || []);
        };

        this.chatClient.onNewMessage = (message) => {
            console.log('Nova mensagem:', message);
            this.displayMessage(message);
            this.scrollToBottom();
            
            // Tocar som se não for mensagem própria
            if (message.user_id !== this.currentUser.user_id) {
                const chatSounds = getChatSounds();
                if (chatSounds) {
                    chatSounds.playNewMessage();
                }
            }
        };

        this.chatClient.onUserJoined = (data) => {
            console.log('Usuário entrou:', data);
            this.addParticipant(data);
            this.showNotification('Usuário entrou', `${data.username} entrou na sala`, 'info');
            
            // Tocar som
            const chatSounds = getChatSounds();
            if (chatSounds) {
                chatSounds.playUserJoined();
            }
        };

        this.chatClient.onUserLeft = (data) => {
            console.log('Usuário saiu:', data);
            this.removeParticipant(data.user_id);
            this.showNotification('Usuário saiu', `${data.username} saiu da sala`, 'info');
            
            // Tocar som
            const chatSounds = getChatSounds();
            if (chatSounds) {
                chatSounds.playUserLeft();
            }
        };

        this.chatClient.onUserTyping = (data) => {
            this.handleUserTyping(data);
        };

        this.chatClient.onMessageUpdated = (data) => {
            this.updateMessageReactions(data);
        };

        this.chatClient.onError = (title, message) => {
            this.showNotification(title, message, 'error');
        };
    }

    /**
     * Carregar salas disponíveis
     */
    async loadRooms() {
        try {
            const response = await fetch(`${window.API_BASE_URL || 'http://localhost:5001'}/api/chat/rooms`);
            const data = await response.json();
            
            if (data.success) {
                this.rooms = data.rooms;
                this.displayRooms();
            }
        } catch (error) {
            console.error('Erro ao carregar salas:', error);
            this.showNotification('Erro', 'Não foi possível carregar as salas', 'error');
        }
    }

    /**
     * Exibir salas na sidebar
     */
    displayRooms() {
        if (!this.roomsList) return;

        this.roomsList.innerHTML = '';

        this.rooms.forEach(room => {
            const roomElement = document.createElement('div');
            roomElement.className = 'room-item';
            roomElement.dataset.roomId = room.id;
            
            const badgeClass = room.type === 'support' ? 'support' : 
                             room.type === 'announcements' ? 'announcements' : '';
            
            roomElement.innerHTML = `
                <div class="room-name">
                    ${room.name}
                    <span class="room-badge ${badgeClass}">${room.participants_count}</span>
                </div>
                <div class="room-description">${room.description}</div>
            `;

            roomElement.addEventListener('click', () => {
                this.joinRoom(room.id);
            });

            this.roomsList.appendChild(roomElement);
        });
    }

    /**
     * Entrar em uma sala
     */
    joinRoom(roomId) {
        if (!this.chatClient || !this.currentUser) {
            console.error('Cliente de chat não inicializado');
            return;
        }

        // Remover classe active de todas as salas
        document.querySelectorAll('.room-item').forEach(item => {
            item.classList.remove('active');
        });

        // Adicionar classe active à sala atual
        const roomElement = document.querySelector(`[data-room-id="${roomId}"]`);
        if (roomElement) {
            roomElement.classList.add('active');
        }

        // Limpar mensagens
        this.clearMessages();

        // Entrar na sala
        this.chatClient.joinRoom(roomId, this.currentUser);
    }

    /**
     * Atualizar interface da sala
     */
    updateRoomInterface(roomData) {
        const room = this.rooms.find(r => r.id === roomData.room_id);
        
        if (room && this.currentRoomName && this.currentRoomDescription) {
            this.currentRoomName.textContent = room.name;
            this.currentRoomDescription.textContent = room.description;
        }

        if (this.participantsCount) {
            this.participantsCount.textContent = roomData.online_users ? roomData.online_users.length : 0;
        }
    }

    /**
     * Exibir histórico de mensagens
     */
    displayChatHistory(messages) {
        this.clearMessages();
        
        messages.forEach(message => {
            this.displayMessage(message, false);
        });
        
        this.scrollToBottom();
    }

    /**
     * Exibir uma mensagem
     */
    displayMessage(message, animate = true) {
        if (!this.messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.user_id === this.currentUser.user_id ? 'own' : ''}`;
        messageElement.dataset.messageId = message.id;
        
        if (animate) {
            messageElement.style.opacity = '0';
            messageElement.style.transform = 'translateY(20px)';
        }

        const initials = ChatUtils.getInitials(message.username);
        const formattedTime = ChatUtils.formatTime(message.timestamp);
        const userTypeText = message.user_type === 'instructor' ? 'Instrutor' : 'Aluno';
        const userTypeBadge = message.user_type === 'instructor' ? 'instructor' : '';
        
        // Processar texto da mensagem
        let processedMessage = ChatUtils.escapeHtml(message.message);
        processedMessage = ChatUtils.linkify(processedMessage);
        processedMessage = ChatUtils.processEmojis(processedMessage);

        messageElement.innerHTML = `
            <div class="message-avatar">
                ${initials}
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author">${ChatUtils.escapeHtml(message.username)}</span>
                    <span class="user-type-badge ${userTypeBadge}">${userTypeText}</span>
                    <span class="message-time">${formattedTime}</span>
                </div>
                <div class="message-bubble">
                    <p class="message-text">${processedMessage}</p>
                </div>
                <div class="message-reactions" data-message-id="${message.id}">
                    ${this.renderReactions(message.reactions || {})}
                </div>
            </div>
        `;

        // Adicionar event listeners para reações
        this.setupMessageReactions(messageElement, message.id);

        this.messagesContainer.appendChild(messageElement);

        // Animar entrada da mensagem
        if (animate) {
            setTimeout(() => {
                messageElement.style.transition = 'all 0.3s ease-out';
                messageElement.style.opacity = '1';
                messageElement.style.transform = 'translateY(0)';
            }, 50);
        }
    }

    /**
     * Renderizar reações de uma mensagem
     */
    renderReactions(reactions) {
        let html = '';
        
        for (const [emoji, users] of Object.entries(reactions)) {
            if (users.length > 0) {
                const isActive = users.includes(this.currentUser.user_id);
                html += `
                    <span class="reaction ${isActive ? 'active' : ''}" data-emoji="${emoji}">
                        ${emoji} ${users.length}
                    </span>
                `;
            }
        }
        
        // Botão para adicionar reação
        html += `
            <span class="reaction add-reaction" title="Adicionar reação">
                ➕
            </span>
        `;
        
        return html;
    }

    /**
     * Configurar event listeners para reações
     */
    setupMessageReactions(messageElement, messageId) {
        const reactionsContainer = messageElement.querySelector('.message-reactions');
        
        reactionsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('reaction')) {
                if (e.target.classList.contains('add-reaction')) {
                    this.showEmojiPickerForMessage(messageId, e.target);
                } else {
                    const emoji = e.target.dataset.emoji;
                    if (emoji && this.chatClient) {
                        this.chatClient.addReaction(messageId, emoji);
                    }
                }
            }
        });
    }

    /**
     * Atualizar reações de uma mensagem
     */
    updateMessageReactions(data) {
        const messageElement = document.querySelector(`[data-message-id="${data.message_id}"]`);
        if (messageElement) {
            const reactionsContainer = messageElement.querySelector('.message-reactions');
            reactionsContainer.innerHTML = this.renderReactions(data.reactions);
            this.setupMessageReactions(messageElement, data.message_id);
        }
    }

    /**
     * Enviar mensagem
     */
    sendMessage() {
        if (!this.messageInput || !this.chatClient) return;

        const message = this.messageInput.value.trim();
        if (!message) return;

        this.chatClient.sendMessage(message);
        this.messageInput.value = '';
        this.updateCharCounter();
        this.autoResizeTextarea();
        this.updateSendButton();
        
        // Parar indicador de digitação
        this.chatClient.stopTyping();
    }

    /**
     * Lidar com mudanças no input
     */
    handleInputChange() {
        this.updateCharCounter();
        this.updateSendButton();
        this.autoResizeTextarea();
        
        // Indicar que está digitando
        if (this.chatClient && this.messageInput.value.trim()) {
            this.chatClient.startTyping();
        } else if (this.chatClient) {
            this.chatClient.stopTyping();
        }
    }

    /**
     * Atualizar contador de caracteres
     */
    updateCharCounter() {
        if (!this.charCounter || !this.messageInput) return;
        
        const length = this.messageInput.value.length;
        const maxLength = this.messageInput.maxLength || 1000;
        
        this.charCounter.textContent = `${length}/${maxLength}`;
        
        if (length > maxLength * 0.9) {
            this.charCounter.style.color = '#e74c3c';
        } else {
            this.charCounter.style.color = '#6c757d';
        }
    }

    /**
     * Atualizar estado do botão enviar
     */
    updateSendButton() {
        if (!this.sendBtn || !this.messageInput) return;
        
        const hasText = this.messageInput.value.trim().length > 0;
        this.sendBtn.disabled = !hasText;
    }

    /**
     * Auto-resize do textarea
     */
    autoResizeTextarea() {
        if (!this.messageInput) return;
        
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    /**
     * Lidar com usuário digitando
     */
    handleUserTyping(data) {
        if (data.user_id === this.currentUser.user_id) return;

        if (data.typing) {
            this.typingUsers.add(data.username);
        } else {
            this.typingUsers.delete(data.username);
        }

        this.updateTypingIndicator();
    }

    /**
     * Atualizar indicador de digitação
     */
    updateTypingIndicator() {
        if (!this.typingIndicator) return;

        if (this.typingUsers.size === 0) {
            this.typingIndicator.style.display = 'none';
            return;
        }

        const typingText = document.getElementById('typingText');
        const users = Array.from(this.typingUsers);
        
        let text;
        if (users.length === 1) {
            text = `${users[0]} está digitando...`;
        } else if (users.length === 2) {
            text = `${users[0]} e ${users[1]} estão digitando...`;
        } else {
            text = `${users[0]} e mais ${users.length - 1} pessoas estão digitando...`;
        }

        if (typingText) {
            typingText.textContent = text;
        }
        
        this.typingIndicator.style.display = 'flex';
    }

    /**
     * Atualizar lista de participantes
     */
    updateParticipantsList() {
        if (!this.participantsList) return;

        this.participantsList.innerHTML = '';

        this.participants.forEach(participant => {
            const participantElement = document.createElement('div');
            participantElement.className = 'participant-item';
            
            const initials = ChatUtils.getInitials(participant.username);
            const userTypeText = participant.user_type === 'instructor' ? 'Instrutor' : 'Aluno';

            participantElement.innerHTML = `
                <div class="participant-avatar">
                    ${initials}
                </div>
                <div class="participant-info">
                    <div class="participant-name">${ChatUtils.escapeHtml(participant.username)}</div>
                    <div class="participant-status">${userTypeText}</div>
                </div>
            `;

            this.participantsList.appendChild(participantElement);
        });

        // Atualizar contador
        if (this.participantsCount) {
            this.participantsCount.textContent = this.participants.length;
        }
    }

    /**
     * Adicionar participante
     */
    addParticipant(participant) {
        const exists = this.participants.find(p => p.user_id === participant.user_id);
        if (!exists) {
            this.participants.push(participant);
            this.updateParticipantsList();
        }
    }

    /**
     * Remover participante
     */
    removeParticipant(userId) {
        this.participants = this.participants.filter(p => p.user_id !== userId);
        this.updateParticipantsList();
    }

    /**
     * Toggle painel de participantes
     */
    toggleParticipantsPanel() {
        if (!this.participantsPanel) return;
        
        const isVisible = this.participantsPanel.style.display !== 'none';
        this.participantsPanel.style.display = isVisible ? 'none' : 'flex';
    }

    /**
     * Toggle emoji picker
     */
    toggleEmojiPicker() {
        if (!this.emojiPickerModal) return;
        
        const isVisible = this.emojiPickerModal.style.display !== 'none';
        
        if (isVisible) {
            this.hideEmojiPicker();
        } else {
            this.showEmojiPicker();
        }
    }

    /**
     * Mostrar emoji picker
     */
    showEmojiPicker() {
        if (!this.emojiPickerModal) return;
        
        this.loadEmojis('smileys');
        this.emojiPickerModal.style.display = 'block';
        
        // Configurar categorias
        const categories = this.emojiPickerModal.querySelectorAll('.emoji-category');
        categories.forEach(category => {
            category.addEventListener('click', () => {
                categories.forEach(c => c.classList.remove('active'));
                category.classList.add('active');
                this.loadEmojis(category.dataset.category);
            });
        });
    }

    /**
     * Esconder emoji picker
     */
    hideEmojiPicker() {
        if (this.emojiPickerModal) {
            this.emojiPickerModal.style.display = 'none';
        }
    }

    /**
     * Carregar emojis por categoria
     */
    loadEmojis(category) {
        if (!this.emojiGrid) return;
        
        const emojis = this.emojiCategories[category] || this.emojiCategories.smileys;
        
        this.emojiGrid.innerHTML = '';
        
        emojis.forEach(emoji => {
            const emojiButton = document.createElement('button');
            emojiButton.className = 'emoji-item';
            emojiButton.textContent = emoji;
            
            emojiButton.addEventListener('click', () => {
                this.insertEmoji(emoji);
                this.hideEmojiPicker();
            });
            
            this.emojiGrid.appendChild(emojiButton);
        });
    }

    /**
     * Inserir emoji no input
     */
    insertEmoji(emoji) {
        if (!this.messageInput) return;
        
        const start = this.messageInput.selectionStart;
        const end = this.messageInput.selectionEnd;
        const text = this.messageInput.value;
        
        this.messageInput.value = text.substring(0, start) + emoji + text.substring(end);
        this.messageInput.selectionStart = this.messageInput.selectionEnd = start + emoji.length;
        
        this.messageInput.focus();
        this.handleInputChange();
    }

    /**
     * Mostrar notificação
     */
    showNotification(title, message, type = 'info') {
        if (!this.chatNotifications) return;

        const notification = document.createElement('div');
        notification.className = 'chat-notification';
        
        const iconMap = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        notification.innerHTML = `
            <div class="notification-header">
                <span class="notification-icon">${iconMap[type] || iconMap.info}</span>
                <span class="notification-title">${ChatUtils.escapeHtml(title)}</span>
            </div>
            <div class="notification-message">${ChatUtils.escapeHtml(message)}</div>
        `;

        this.chatNotifications.appendChild(notification);

        // Remover após 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
    }

    /**
     * Limpar mensagens
     */
    clearMessages() {
        if (this.messagesContainer) {
            this.messagesContainer.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-icon">💬</div>
                    <h3>Carregando mensagens...</h3>
                    <p>Aguarde enquanto carregamos o histórico da conversa.</p>
                </div>
            `;
        }
    }

    /**
     * Rolar para o final
     */
    scrollToBottom() {
        if (this.messagesContainer) {
            setTimeout(() => {
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            }, 100);
        }
    }

    /**
     * Destruir instância
     */
    destroy() {
        if (this.chatClient) {
            this.chatClient.disconnect();
            this.chatClient = null;
        }
        
        this.typingUsers.clear();
        this.participants = [];
        this.rooms = [];
    }
}

// Instância global da UI do chat
let chatUI = null;

/**
 * Inicializar interface do chat
 */
function initializeChatUI(chatClient = null) {
    if (!chatUI) {
        chatUI = new ChatUI(chatClient);
    }
    return chatUI;
}

/**
 * Obter instância da UI do chat
 */
function getChatUI() {
    return chatUI;
}

// Exportar para uso global
window.ChatUI = ChatUI;
window.initializeChatUI = initializeChatUI;
window.getChatUI = getChatUI;

