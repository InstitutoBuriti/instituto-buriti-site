/**
 * Cliente WebSocket para Chat em Tempo Real
 * Instituto Buriti - Sistema de Chat
 */

class ChatClient {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.currentRoom = null;
        this.currentUser = null;
        this.typingTimeout = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        
        // Callbacks para eventos
        this.onConnected = null;
        this.onDisconnected = null;
        this.onRoomJoined = null;
        this.onNewMessage = null;
        this.onUserJoined = null;
        this.onUserLeft = null;
        this.onUserTyping = null;
        this.onMessageUpdated = null;
        this.onError = null;
    }

    /**
     * Conectar ao servidor WebSocket
     */
    connect(serverUrl = 'http://localhost:5001') {
        try {
            console.log('Conectando ao servidor de chat:', serverUrl);
            
            this.socket = io(serverUrl, {
                transports: ['websocket', 'polling'],
                timeout: 10000,
                forceNew: true
            });

            this.setupEventListeners();
            
        } catch (error) {
            console.error('Erro ao conectar:', error);
            this.handleError('Erro de conexão', error.message);
        }
    }

    /**
     * Configurar listeners de eventos do socket
     */
    setupEventListeners() {
        // Conexão estabelecida
        this.socket.on('connect', () => {
            console.log('Conectado ao servidor de chat');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            
            if (this.onConnected) {
                this.onConnected();
            }
        });

        // Conexão perdida
        this.socket.on('disconnect', (reason) => {
            console.log('Desconectado do servidor:', reason);
            this.isConnected = false;
            
            if (this.onDisconnected) {
                this.onDisconnected(reason);
            }

            // Tentar reconectar automaticamente
            if (reason === 'io server disconnect') {
                this.attemptReconnect();
            }
        });

        // Erro de conexão
        this.socket.on('connect_error', (error) => {
            console.error('Erro de conexão:', error);
            this.handleError('Erro de conexão', 'Não foi possível conectar ao servidor de chat');
            this.attemptReconnect();
        });

        // Confirmação de entrada na sala
        this.socket.on('joined_room', (data) => {
            console.log('Entrou na sala:', data);
            this.currentRoom = data.room_id;
            
            if (this.onRoomJoined) {
                this.onRoomJoined(data);
            }
        });

        // Histórico de mensagens
        this.socket.on('chat_history', (data) => {
            console.log('Histórico de mensagens recebido:', data);
            
            if (this.onChatHistory) {
                this.onChatHistory(data);
            }
        });

        // Nova mensagem
        this.socket.on('new_message', (message) => {
            console.log('Nova mensagem:', message);
            
            if (this.onNewMessage) {
                this.onNewMessage(message);
            }
        });

        // Usuário entrou na sala
        this.socket.on('user_joined', (data) => {
            console.log('Usuário entrou:', data);
            
            if (this.onUserJoined) {
                this.onUserJoined(data);
            }
        });

        // Usuário saiu da sala
        this.socket.on('user_left', (data) => {
            console.log('Usuário saiu:', data);
            
            if (this.onUserLeft) {
                this.onUserLeft(data);
            }
        });

        // Usuário digitando
        this.socket.on('user_typing', (data) => {
            if (this.onUserTyping) {
                this.onUserTyping(data);
            }
        });

        // Mensagem atualizada (reações)
        this.socket.on('message_updated', (data) => {
            console.log('Mensagem atualizada:', data);
            
            if (this.onMessageUpdated) {
                this.onMessageUpdated(data);
            }
        });

        // Erro do servidor
        this.socket.on('error', (error) => {
            console.error('Erro do servidor:', error);
            this.handleError('Erro do servidor', error.message);
        });
    }

    /**
     * Entrar em uma sala de chat
     */
    joinRoom(roomId, userData) {
        if (!this.isConnected) {
            this.handleError('Não conectado', 'Conecte-se ao servidor primeiro');
            return;
        }

        console.log('Entrando na sala:', roomId, userData);
        
        this.currentUser = userData;
        
        this.socket.emit('join_chat', {
            user_id: userData.user_id,
            username: userData.username,
            user_type: userData.user_type || 'student',
            room_id: roomId
        });
    }

    /**
     * Enviar mensagem
     */
    sendMessage(message, messageType = 'text') {
        if (!this.isConnected || !this.currentRoom || !this.currentUser) {
            this.handleError('Não conectado', 'Entre em uma sala primeiro');
            return;
        }

        if (!message.trim() && messageType === 'text') {
            this.handleError('Mensagem vazia', 'Digite uma mensagem');
            return;
        }

        console.log('Enviando mensagem:', message);

        this.socket.emit('send_message', {
            user_id: this.currentUser.user_id,
            username: this.currentUser.username,
            user_type: this.currentUser.user_type,
            room_id: this.currentRoom,
            message: message,
            type: messageType
        });
    }

    /**
     * Indicar que está digitando
     */
    startTyping() {
        if (!this.isConnected || !this.currentRoom || !this.currentUser) {
            return;
        }

        this.socket.emit('typing_start', {
            user_id: this.currentUser.user_id,
            username: this.currentUser.username,
            room_id: this.currentRoom
        });

        // Parar de digitar automaticamente após 3 segundos
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }

        this.typingTimeout = setTimeout(() => {
            this.stopTyping();
        }, 3000);
    }

    /**
     * Parar de digitar
     */
    stopTyping() {
        if (!this.isConnected || !this.currentRoom || !this.currentUser) {
            return;
        }

        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
            this.typingTimeout = null;
        }

        this.socket.emit('typing_stop', {
            user_id: this.currentUser.user_id,
            username: this.currentUser.username,
            room_id: this.currentRoom
        });
    }

    /**
     * Adicionar reação a uma mensagem
     */
    addReaction(messageId, reaction) {
        if (!this.isConnected || !this.currentRoom || !this.currentUser) {
            return;
        }

        console.log('Adicionando reação:', messageId, reaction);

        this.socket.emit('message_reaction', {
            user_id: this.currentUser.user_id,
            username: this.currentUser.username,
            room_id: this.currentRoom,
            message_id: messageId,
            reaction: reaction
        });
    }

    /**
     * Tentar reconectar
     */
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Máximo de tentativas de reconexão atingido');
            this.handleError('Conexão perdida', 'Não foi possível reconectar ao servidor');
            return;
        }

        this.reconnectAttempts++;
        console.log(`Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

        setTimeout(() => {
            if (!this.isConnected) {
                this.socket.connect();
            }
        }, this.reconnectDelay * this.reconnectAttempts);
    }

    /**
     * Desconectar do servidor
     */
    disconnect() {
        if (this.socket) {
            console.log('Desconectando do servidor de chat');
            this.socket.disconnect();
            this.socket = null;
        }
        
        this.isConnected = false;
        this.currentRoom = null;
        this.currentUser = null;
        
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
            this.typingTimeout = null;
        }
    }

    /**
     * Tratar erros
     */
    handleError(title, message) {
        console.error(`${title}: ${message}`);
        
        if (this.onError) {
            this.onError(title, message);
        }
    }

    /**
     * Verificar se está conectado
     */
    isSocketConnected() {
        return this.socket && this.isConnected;
    }

    /**
     * Obter sala atual
     */
    getCurrentRoom() {
        return this.currentRoom;
    }

    /**
     * Obter usuário atual
     */
    getCurrentUser() {
        return this.currentUser;
    }
}

// Instância global do cliente de chat
let chatClient = null;

/**
 * Inicializar cliente de chat
 */
function initializeChatClient(serverUrl) {
    if (chatClient) {
        chatClient.disconnect();
    }
    
    chatClient = new ChatClient();
    chatClient.connect(serverUrl);
    
    return chatClient;
}

/**
 * Obter cliente de chat
 */
function getChatClient() {
    return chatClient;
}

/**
 * Utilitários para formatação de mensagens
 */
const ChatUtils = {
    /**
     * Formatar timestamp
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        // Se foi hoje
        if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
            return date.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        // Se foi ontem
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.getDate() === yesterday.getDate()) {
            return 'Ontem ' + date.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        // Mais de um dia
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Escapar HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Detectar URLs e criar links
     */
    linkify(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    },

    /**
     * Processar emojis
     */
    processEmojis(text) {
        // Lista básica de emojis comuns
        const emojiMap = {
            ':)': '😊',
            ':-)': '😊',
            ':(': '😢',
            ':-(': '😢',
            ':D': '😃',
            ':-D': '😃',
            ':P': '😛',
            ':-P': '😛',
            ';)': '😉',
            ';-)': '😉',
            '<3': '❤️',
            '</3': '💔',
            ':thumbsup:': '👍',
            ':thumbsdown:': '👎',
            ':fire:': '🔥',
            ':star:': '⭐',
            ':heart:': '❤️',
            ':clap:': '👏'
        };

        let processedText = text;
        for (const [emoticon, emoji] of Object.entries(emojiMap)) {
            const regex = new RegExp(emoticon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            processedText = processedText.replace(regex, emoji);
        }

        return processedText;
    },

    /**
     * Gerar iniciais do nome
     */
    getInitials(name) {
        if (!name) return 'U';
        
        const words = name.trim().split(' ');
        if (words.length === 1) {
            return words[0].charAt(0).toUpperCase();
        }
        
        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    },

    /**
     * Gerar cor baseada no nome
     */
    getColorFromName(name) {
        if (!name) return '#973CBF';
        
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const colors = [
            '#973CBF', '#A95028', '#e74c3c', '#3498db', 
            '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c',
            '#34495e', '#e67e22', '#95a5a6', '#16a085'
        ];
        
        return colors[Math.abs(hash) % colors.length];
    }
};

// Exportar para uso global
window.ChatClient = ChatClient;
window.ChatUtils = ChatUtils;
window.initializeChatClient = initializeChatClient;
window.getChatClient = getChatClient;

