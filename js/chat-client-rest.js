/**
 * Cliente REST para Chat (sem WebSocket)
 * Instituto Buriti - Sistema de Chat
 */

class ChatClientREST {
    constructor(apiBaseUrl = 'https://mzhyi8cn6w70.manus.space') {
        this.apiBaseUrl = apiBaseUrl;
        this.currentRoom = null;
        this.currentUser = null;
        this.isConnected = false;
        this.pollInterval = null;
        this.lastMessageId = null;
        
        // Callbacks
        this.onConnect = null;
        this.onDisconnect = null;
        this.onRoomsLoaded = null;
        this.onRoomJoined = null;
        this.onChatHistory = null;
        this.onNewMessage = null;
        this.onUserJoined = null;
        this.onUserLeft = null;
        this.onError = null;
        
        this.initializeClient();
    }

    /**
     * Inicializar cliente
     */
    initializeClient() {
        console.log('Inicializando cliente REST para chat');
        
        // Simular conexão
        setTimeout(() => {
            this.isConnected = true;
            console.log('Cliente REST conectado');
            
            if (this.onConnect) {
                this.onConnect();
            }
            
            // Carregar salas automaticamente
            this.loadRooms();
        }, 1000);
    }

    /**
     * Carregar salas de chat
     */
    async loadRooms() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/chat/rooms`);
            const data = await response.json();
            
            if (data.success && this.onRoomsLoaded) {
                console.log('Salas carregadas:', data.rooms);
                this.onRoomsLoaded(data.rooms);
            }
        } catch (error) {
            console.error('Erro ao carregar salas:', error);
            if (this.onError) {
                this.onError('Erro ao carregar salas de chat');
            }
        }
    }

    /**
     * Entrar em uma sala
     */
    async joinRoom(roomId, userData) {
        try {
            this.currentRoom = roomId;
            this.currentUser = userData;
            
            // Fazer join via API
            const joinResponse = await fetch(`${this.apiBaseUrl}/api/chat/join/${roomId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userData.user_id,
                    username: userData.username,
                    user_type: userData.user_type
                })
            });
            
            const joinData = await joinResponse.json();
            
            if (joinData.success) {
                console.log('Entrou na sala:', joinData);
                
                // Carregar histórico de mensagens
                await this.loadChatHistory(roomId);
                
                // Simular dados de entrada na sala
                const roomJoinedData = {
                    room_id: roomId,
                    room_info: joinData.room_info,
                    online_users: [userData] // Simular usuário atual online
                };
                
                if (this.onRoomJoined) {
                    this.onRoomJoined(roomJoinedData);
                }
                
                // Iniciar polling para novas mensagens
                this.startPolling();
            }
        } catch (error) {
            console.error('Erro ao entrar na sala:', error);
            if (this.onError) {
                this.onError('Erro ao entrar na sala');
            }
        }
    }

    /**
     * Carregar histórico de mensagens
     */
    async loadChatHistory(roomId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/chat/rooms/${roomId}/messages`);
            const data = await response.json();
            
            if (data.success && this.onChatHistory) {
                console.log('Histórico carregado:', data);
                
                // Armazenar ID da última mensagem
                if (data.messages.length > 0) {
                    this.lastMessageId = data.messages[data.messages.length - 1].id;
                }
                
                this.onChatHistory({
                    room_id: roomId,
                    messages: data.messages
                });
            }
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
        }
    }

    /**
     * Enviar mensagem
     */
    async sendMessage(message, type = 'text') {
        if (!this.currentRoom || !this.currentUser) {
            console.error('Não está em uma sala ou usuário não definido');
            return false;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/chat/rooms/${this.currentRoom}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: this.currentUser.user_id,
                    username: this.currentUser.username,
                    user_type: this.currentUser.user_type,
                    message: message,
                    type: type
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log('Mensagem enviada:', data.message);
                
                // Simular recebimento da própria mensagem
                if (this.onNewMessage) {
                    this.onNewMessage(data.message);
                }
                
                this.lastMessageId = data.message.id;
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            return false;
        }
    }

    /**
     * Adicionar reação a mensagem
     */
    async addReaction(messageId, reaction) {
        if (!this.currentRoom || !this.currentUser) {
            return false;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/chat/messages/${messageId}/reactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: this.currentUser.user_id,
                    reaction: reaction,
                    room_id: this.currentRoom
                })
            });
            
            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Erro ao adicionar reação:', error);
            return false;
        }
    }

    /**
     * Iniciar polling para novas mensagens
     */
    startPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }
        
        this.pollInterval = setInterval(async () => {
            await this.checkForNewMessages();
        }, 3000); // Verificar a cada 3 segundos
    }

    /**
     * Verificar novas mensagens
     */
    async checkForNewMessages() {
        if (!this.currentRoom) return;
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/chat/rooms/${this.currentRoom}/messages`);
            const data = await response.json();
            
            if (data.success && data.messages.length > 0) {
                // Verificar se há mensagens novas
                const newMessages = data.messages.filter(msg => {
                    return !this.lastMessageId || msg.id !== this.lastMessageId;
                });
                
                if (newMessages.length > 0) {
                    // Processar apenas a mensagem mais recente
                    const latestMessage = newMessages[newMessages.length - 1];
                    
                    // Verificar se não é mensagem própria
                    if (latestMessage.user_id !== this.currentUser.user_id && this.onNewMessage) {
                        console.log('Nova mensagem recebida:', latestMessage);
                        this.onNewMessage(latestMessage);
                    }
                    
                    this.lastMessageId = latestMessage.id;
                }
            }
        } catch (error) {
            console.error('Erro ao verificar novas mensagens:', error);
        }
    }

    /**
     * Parar polling
     */
    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }

    /**
     * Sair da sala atual
     */
    leaveRoom() {
        this.stopPolling();
        this.currentRoom = null;
        this.lastMessageId = null;
    }

    /**
     * Desconectar
     */
    disconnect() {
        this.stopPolling();
        this.isConnected = false;
        this.currentRoom = null;
        this.currentUser = null;
        
        if (this.onDisconnect) {
            this.onDisconnect();
        }
    }

    /**
     * Verificar se está conectado
     */
    isClientConnected() {
        return this.isConnected;
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

// Instância global
let chatClientREST = null;

/**
 * Inicializar cliente REST
 */
function initializeChatClientREST(apiBaseUrl) {
    if (!chatClientREST) {
        chatClientREST = new ChatClientREST(apiBaseUrl);
    }
    return chatClientREST;
}

/**
 * Obter instância do cliente REST
 */
function getChatClientREST() {
    return chatClientREST;
}

// Exportar para uso global
window.ChatClientREST = ChatClientREST;
window.initializeChatClientREST = initializeChatClientREST;
window.getChatClientREST = getChatClientREST;

