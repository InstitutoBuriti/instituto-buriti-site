/**
 * Sistema de Moderação para Chat
 * Instituto Buriti - Funcionalidades para Instrutores
 */

class ChatModeration {
    constructor(chatClient) {
        this.chatClient = chatClient;
        this.currentUser = null;
        this.isInstructor = false;
        this.moderationActions = [];
        
        this.initializeModeration();
    }

    /**
     * Inicializar sistema de moderação
     */
    initializeModeration() {
        this.currentUser = this.getCurrentUser();
        this.isInstructor = this.currentUser && 
            (this.currentUser.user_type === 'instructor' || this.currentUser.user_type === 'admin');
        
        if (this.isInstructor) {
            this.setupModerationUI();
        }
    }

    /**
     * Obter dados do usuário atual
     */
    getCurrentUser() {
        const userData = localStorage.getItem('userData');
        if (userData) {
            try {
                return JSON.parse(userData);
            } catch (error) {
                return null;
            }
        }
        return null;
    }

    /**
     * Configurar interface de moderação
     */
    setupModerationUI() {
        // Adicionar botões de moderação ao header do chat
        const roomActions = document.querySelector('.room-actions');
        if (roomActions && !document.getElementById('moderationBtn')) {
            const moderationBtn = document.createElement('button');
            moderationBtn.id = 'moderationBtn';
            moderationBtn.className = 'action-btn moderation-btn';
            moderationBtn.title = 'Ferramentas de Moderação';
            moderationBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5z"></path>
                    <path d="M9 12l2 2 4-4"></path>
                </svg>
                Moderação
            `;
            
            moderationBtn.addEventListener('click', () => {
                this.showModerationPanel();
            });
            
            roomActions.appendChild(moderationBtn);
        }

        // Adicionar menu de contexto às mensagens
        this.setupMessageContextMenu();
    }

    /**
     * Configurar menu de contexto para mensagens
     */
    setupMessageContextMenu() {
        document.addEventListener('contextmenu', (e) => {
            const messageElement = e.target.closest('.message');
            if (messageElement && !messageElement.classList.contains('own')) {
                e.preventDefault();
                this.showMessageContextMenu(e, messageElement);
            }
        });
    }

    /**
     * Mostrar menu de contexto para mensagem
     */
    showMessageContextMenu(event, messageElement) {
        // Remover menu existente
        const existingMenu = document.querySelector('.message-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const messageId = messageElement.dataset.messageId;
        const authorElement = messageElement.querySelector('.message-author');
        const authorName = authorElement ? authorElement.textContent : 'Usuário';

        const contextMenu = document.createElement('div');
        contextMenu.className = 'message-context-menu';
        contextMenu.style.position = 'fixed';
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';
        contextMenu.style.zIndex = '1000';
        contextMenu.style.background = 'white';
        contextMenu.style.border = '1px solid #e1e5e9';
        contextMenu.style.borderRadius = '8px';
        contextMenu.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        contextMenu.style.padding = '8px 0';
        contextMenu.style.minWidth = '180px';

        const actions = [
            {
                icon: '⚠️',
                text: 'Reportar Mensagem',
                action: () => this.reportMessage(messageId, authorName)
            },
            {
                icon: '🗑️',
                text: 'Deletar Mensagem',
                action: () => this.deleteMessage(messageId, authorName),
                dangerous: true
            },
            {
                icon: '🔇',
                text: 'Silenciar Usuário',
                action: () => this.muteUser(authorName)
            },
            {
                icon: '🚫',
                text: 'Banir Usuário',
                action: () => this.banUser(authorName),
                dangerous: true
            }
        ];

        actions.forEach(action => {
            const actionElement = document.createElement('div');
            actionElement.className = 'context-menu-item';
            actionElement.style.padding = '8px 16px';
            actionElement.style.cursor = 'pointer';
            actionElement.style.display = 'flex';
            actionElement.style.alignItems = 'center';
            actionElement.style.gap = '8px';
            actionElement.style.fontSize = '14px';
            actionElement.style.color = action.dangerous ? '#e74c3c' : '#2c3e50';
            
            actionElement.innerHTML = `
                <span>${action.icon}</span>
                <span>${action.text}</span>
            `;

            actionElement.addEventListener('mouseenter', () => {
                actionElement.style.background = action.dangerous ? '#fdf2f2' : '#f8f9fa';
            });

            actionElement.addEventListener('mouseleave', () => {
                actionElement.style.background = 'transparent';
            });

            actionElement.addEventListener('click', () => {
                action.action();
                contextMenu.remove();
            });

            contextMenu.appendChild(actionElement);
        });

        document.body.appendChild(contextMenu);

        // Remover menu ao clicar fora
        setTimeout(() => {
            document.addEventListener('click', function removeMenu() {
                contextMenu.remove();
                document.removeEventListener('click', removeMenu);
            });
        }, 100);
    }

    /**
     * Mostrar painel de moderação
     */
    showModerationPanel() {
        // Remover painel existente
        const existingPanel = document.querySelector('.moderation-panel');
        if (existingPanel) {
            existingPanel.remove();
            return;
        }

        const panel = document.createElement('div');
        panel.className = 'moderation-panel';
        panel.style.position = 'fixed';
        panel.style.top = '50%';
        panel.style.left = '50%';
        panel.style.transform = 'translate(-50%, -50%)';
        panel.style.background = 'white';
        panel.style.border = '1px solid #e1e5e9';
        panel.style.borderRadius = '12px';
        panel.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
        panel.style.padding = '20px';
        panel.style.width = '400px';
        panel.style.maxHeight = '500px';
        panel.style.overflow = 'auto';
        panel.style.zIndex = '1000';

        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #2c3e50;">Ferramentas de Moderação</h3>
                <button class="close-panel" style="background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
            </div>
            
            <div class="moderation-section">
                <h4 style="color: #973CBF; margin-bottom: 10px;">📊 Estatísticas da Sala</h4>
                <div class="stats-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 6px; text-align: center;">
                        <div style="font-size: 20px; font-weight: bold; color: #973CBF;">${this.getOnlineUsersCount()}</div>
                        <div style="font-size: 12px; color: #6c757d;">Usuários Online</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 6px; text-align: center;">
                        <div style="font-size: 20px; font-weight: bold; color: #973CBF;">${this.getTotalMessagesCount()}</div>
                        <div style="font-size: 12px; color: #6c757d;">Mensagens Hoje</div>
                    </div>
                </div>
            </div>

            <div class="moderation-section">
                <h4 style="color: #973CBF; margin-bottom: 10px;">🛡️ Ações de Moderação</h4>
                <div class="moderation-actions" style="display: flex; flex-direction: column; gap: 8px;">
                    <button class="mod-action-btn" data-action="clear-chat" style="padding: 10px; border: 1px solid #e1e5e9; border-radius: 6px; background: white; cursor: pointer; text-align: left;">
                        🗑️ Limpar Chat
                    </button>
                    <button class="mod-action-btn" data-action="mute-all" style="padding: 10px; border: 1px solid #e1e5e9; border-radius: 6px; background: white; cursor: pointer; text-align: left;">
                        🔇 Silenciar Todos
                    </button>
                    <button class="mod-action-btn" data-action="announcement" style="padding: 10px; border: 1px solid #e1e5e9; border-radius: 6px; background: white; cursor: pointer; text-align: left;">
                        📢 Fazer Anúncio
                    </button>
                    <button class="mod-action-btn" data-action="export-log" style="padding: 10px; border: 1px solid #e1e5e9; border-radius: 6px; background: white; cursor: pointer; text-align: left;">
                        📄 Exportar Log
                    </button>
                </div>
            </div>

            <div class="moderation-section">
                <h4 style="color: #973CBF; margin-bottom: 10px;">📋 Histórico de Ações</h4>
                <div class="moderation-log" style="max-height: 150px; overflow-y: auto; background: #f8f9fa; padding: 10px; border-radius: 6px; font-size: 12px;">
                    ${this.renderModerationLog()}
                </div>
            </div>
        `;

        // Adicionar event listeners
        panel.querySelector('.close-panel').addEventListener('click', () => {
            panel.remove();
        });

        panel.querySelectorAll('.mod-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.executeModerationAction(action);
            });

            btn.addEventListener('mouseenter', () => {
                btn.style.background = '#f8f9fa';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'white';
            });
        });

        document.body.appendChild(panel);

        // Fechar ao clicar fora
        setTimeout(() => {
            document.addEventListener('click', function closePanel(e) {
                if (!panel.contains(e.target)) {
                    panel.remove();
                    document.removeEventListener('click', closePanel);
                }
            });
        }, 100);
    }

    /**
     * Reportar mensagem
     */
    reportMessage(messageId, authorName) {
        const reason = prompt(`Reportar mensagem de ${authorName}.\nMotivo:`);
        if (reason) {
            this.logModerationAction('report', `Mensagem de ${authorName} reportada: ${reason}`);
            this.showModerationNotification(`Mensagem de ${authorName} foi reportada`, 'warning');
        }
    }

    /**
     * Deletar mensagem
     */
    deleteMessage(messageId, authorName) {
        if (confirm(`Deletar mensagem de ${authorName}?`)) {
            // Aqui seria feita a chamada para o backend
            const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
            if (messageElement) {
                messageElement.style.opacity = '0.5';
                messageElement.querySelector('.message-text').innerHTML = '<em>Mensagem removida pela moderação</em>';
            }
            
            this.logModerationAction('delete', `Mensagem de ${authorName} deletada`);
            this.showModerationNotification(`Mensagem de ${authorName} foi deletada`, 'success');
        }
    }

    /**
     * Silenciar usuário
     */
    muteUser(username) {
        const duration = prompt(`Silenciar ${username} por quantos minutos?`, '5');
        if (duration && !isNaN(duration)) {
            this.logModerationAction('mute', `${username} silenciado por ${duration} minutos`);
            this.showModerationNotification(`${username} foi silenciado por ${duration} minutos`, 'warning');
        }
    }

    /**
     * Banir usuário
     */
    banUser(username) {
        if (confirm(`Banir ${username} permanentemente?`)) {
            this.logModerationAction('ban', `${username} banido permanentemente`);
            this.showModerationNotification(`${username} foi banido`, 'error');
        }
    }

    /**
     * Executar ação de moderação
     */
    executeModerationAction(action) {
        switch (action) {
            case 'clear-chat':
                if (confirm('Limpar todo o chat? Esta ação não pode ser desfeita.')) {
                    this.clearChat();
                }
                break;
            case 'mute-all':
                if (confirm('Silenciar todos os usuários por 5 minutos?')) {
                    this.muteAll();
                }
                break;
            case 'announcement':
                this.makeAnnouncement();
                break;
            case 'export-log':
                this.exportChatLog();
                break;
        }
    }

    /**
     * Limpar chat
     */
    clearChat() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.innerHTML = `
                <div class="moderation-notice" style="text-align: center; padding: 20px; color: #6c757d; font-style: italic;">
                    💬 Chat limpo pela moderação
                </div>
            `;
        }
        this.logModerationAction('clear', 'Chat limpo');
        this.showModerationNotification('Chat foi limpo', 'success');
    }

    /**
     * Silenciar todos
     */
    muteAll() {
        this.logModerationAction('mute-all', 'Todos os usuários silenciados por 5 minutos');
        this.showModerationNotification('Todos os usuários foram silenciados por 5 minutos', 'warning');
    }

    /**
     * Fazer anúncio
     */
    makeAnnouncement() {
        const message = prompt('Digite o anúncio:');
        if (message) {
            // Simular envio de anúncio
            const announcementMessage = {
                id: 'announcement_' + Date.now(),
                user_id: 'system',
                username: 'Sistema',
                user_type: 'system',
                message: message,
                type: 'announcement',
                timestamp: new Date().toISOString(),
                reactions: {}
            };
            
            this.displayAnnouncementMessage(announcementMessage);
            this.logModerationAction('announcement', `Anúncio enviado: ${message}`);
            this.showModerationNotification('Anúncio enviado', 'success');
        }
    }

    /**
     * Exibir mensagem de anúncio
     */
    displayAnnouncementMessage(message) {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = 'message announcement-message';
        messageElement.style.margin = '20px 0';
        messageElement.style.textAlign = 'center';

        messageElement.innerHTML = `
            <div style="background: linear-gradient(135deg, #973CBF 0%, #A95028 100%); color: white; padding: 15px; border-radius: 12px; margin: 0 20px;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 20px;">📢</span>
                    <strong>Anúncio da Moderação</strong>
                </div>
                <div style="font-size: 16px; line-height: 1.4;">${message.message}</div>
                <div style="font-size: 12px; opacity: 0.8; margin-top: 8px;">
                    ${new Date(message.timestamp).toLocaleTimeString('pt-BR')}
                </div>
            </div>
        `;

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Exportar log do chat
     */
    exportChatLog() {
        const messages = document.querySelectorAll('.message');
        let log = 'Log do Chat - Instituto Buriti\n';
        log += `Exportado em: ${new Date().toLocaleString('pt-BR')}\n`;
        log += '=' .repeat(50) + '\n\n';

        messages.forEach(message => {
            const author = message.querySelector('.message-author')?.textContent || 'Sistema';
            const time = message.querySelector('.message-time')?.textContent || '';
            const text = message.querySelector('.message-text')?.textContent || '';
            
            log += `[${time}] ${author}: ${text}\n`;
        });

        log += '\n' + '='.repeat(50) + '\n';
        log += 'Ações de Moderação:\n';
        this.moderationActions.forEach(action => {
            log += `[${action.timestamp}] ${action.type}: ${action.description}\n`;
        });

        // Criar e baixar arquivo
        const blob = new Blob([log], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-log-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        this.showModerationNotification('Log exportado com sucesso', 'success');
    }

    /**
     * Registrar ação de moderação
     */
    logModerationAction(type, description) {
        const action = {
            type,
            description,
            moderator: this.currentUser.username,
            timestamp: new Date().toLocaleString('pt-BR')
        };
        
        this.moderationActions.unshift(action);
        
        // Manter apenas as últimas 50 ações
        if (this.moderationActions.length > 50) {
            this.moderationActions = this.moderationActions.slice(0, 50);
        }
    }

    /**
     * Renderizar log de moderação
     */
    renderModerationLog() {
        if (this.moderationActions.length === 0) {
            return '<div style="color: #6c757d; text-align: center;">Nenhuma ação de moderação registrada</div>';
        }

        return this.moderationActions.slice(0, 10).map(action => `
            <div style="margin-bottom: 8px; padding: 6px; background: white; border-radius: 4px;">
                <strong>[${action.timestamp}]</strong> ${action.type.toUpperCase()}<br>
                <span style="color: #6c757d;">${action.description}</span><br>
                <small style="color: #973CBF;">Por: ${action.moderator}</small>
            </div>
        `).join('');
    }

    /**
     * Mostrar notificação de moderação
     */
    showModerationNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'moderation-notification';
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.background = type === 'error' ? '#e74c3c' : 
                                      type === 'warning' ? '#f39c12' : 
                                      type === 'success' ? '#27ae60' : '#3498db';
        notification.style.color = 'white';
        notification.style.padding = '12px 16px';
        notification.style.borderRadius = '8px';
        notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        notification.style.zIndex = '1001';
        notification.style.maxWidth = '300px';
        notification.style.fontSize = '14px';
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Obter contagem de usuários online
     */
    getOnlineUsersCount() {
        const onlineCount = document.getElementById('onlineCount');
        return onlineCount ? onlineCount.textContent.split(' ')[0] : '0';
    }

    /**
     * Obter contagem total de mensagens
     */
    getTotalMessagesCount() {
        return document.querySelectorAll('.message').length;
    }

    /**
     * Verificar se é instrutor
     */
    isInstructorUser() {
        return this.isInstructor;
    }
}

// Instância global
let chatModeration = null;

/**
 * Inicializar sistema de moderação
 */
function initializeChatModeration(chatClient) {
    if (!chatModeration) {
        chatModeration = new ChatModeration(chatClient);
    }
    return chatModeration;
}

/**
 * Obter instância de moderação
 */
function getChatModeration() {
    return chatModeration;
}

// Exportar para uso global
window.ChatModeration = ChatModeration;
window.initializeChatModeration = initializeChatModeration;
window.getChatModeration = getChatModeration;

