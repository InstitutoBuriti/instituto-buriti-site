/**
 * Sistema de Notificações Push - Frontend
 * Instituto Buriti - Registro e Permissões
 */

class PushNotificationManager {
    constructor() {
        this.apiClient = window.apiClient;
        this.swRegistration = null;
        this.subscription = null;
        this.isSupported = this.checkSupport();
        this.isSubscribed = false;
        
        this.init();
    }
    
    checkSupport() {
        return 'serviceWorker' in navigator && 
               'PushManager' in window && 
               'Notification' in window;
    }
    
    async init() {
        if (!this.isSupported) {
            console.warn('Push notifications não suportadas neste navegador');
            return;
        }
        
        try {
            // Registrar Service Worker
            await this.registerServiceWorker();
            
            // Verificar subscription existente
            await this.checkExistingSubscription();
            
            // Atualizar UI
            this.updateUI();
            
            console.log('PushNotificationManager inicializado');
        } catch (error) {
            console.error('Erro ao inicializar push notifications:', error);
        }
    }
    
    async registerServiceWorker() {
        try {
            this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });
            
            console.log('Service Worker registrado:', this.swRegistration);
            
            // Aguardar SW estar pronto
            await navigator.serviceWorker.ready;
            
        } catch (error) {
            console.error('Erro ao registrar Service Worker:', error);
            throw error;
        }
    }
    
    async checkExistingSubscription() {
        try {
            if (!this.swRegistration) return;
            
            this.subscription = await this.swRegistration.pushManager.getSubscription();
            this.isSubscribed = !(this.subscription === null);
            
            if (this.isSubscribed) {
                console.log('Subscription existente encontrada');
                // Verificar se ainda é válida no servidor
                await this.validateSubscription();
            }
            
        } catch (error) {
            console.error('Erro ao verificar subscription:', error);
        }
    }
    
    async validateSubscription() {
        try {
            // Implementar validação no servidor se necessário
            console.log('Validando subscription no servidor...');
        } catch (error) {
            console.error('Erro ao validar subscription:', error);
        }
    }
    
    async requestPermission() {
        try {
            if (!this.isSupported) {
                throw new Error('Push notifications não suportadas');
            }
            
            // Verificar permissão atual
            let permission = Notification.permission;
            
            if (permission === 'default') {
                // Solicitar permissão
                permission = await Notification.requestPermission();
            }
            
            if (permission === 'granted') {
                console.log('Permissão concedida para notificações');
                return true;
            } else if (permission === 'denied') {
                console.warn('Permissão negada para notificações');
                this.showPermissionDeniedMessage();
                return false;
            } else {
                console.warn('Permissão não concedida');
                return false;
            }
            
        } catch (error) {
            console.error('Erro ao solicitar permissão:', error);
            return false;
        }
    }
    
    async subscribe() {
        try {
            // Solicitar permissão primeiro
            const hasPermission = await this.requestPermission();
            if (!hasPermission) {
                return false;
            }
            
            // Criar subscription
            const applicationServerKey = this.urlBase64ToUint8Array(
                'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9LQjhWQBTDPtBmWPiTBWR4gjmTcLDHBHqReMaEAkTXxVDNSRUQVs'
            );
            
            this.subscription = await this.swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey
            });
            
            console.log('Nova subscription criada:', this.subscription);
            
            // Enviar subscription para o servidor
            const success = await this.sendSubscriptionToServer();
            
            if (success) {
                this.isSubscribed = true;
                this.updateUI();
                this.showSuccessMessage('Notificações ativadas com sucesso!');
                return true;
            } else {
                throw new Error('Falha ao registrar no servidor');
            }
            
        } catch (error) {
            console.error('Erro ao criar subscription:', error);
            this.showErrorMessage('Erro ao ativar notificações');
            return false;
        }
    }
    
    async unsubscribe() {
        try {
            if (!this.subscription) {
                console.warn('Nenhuma subscription ativa');
                return true;
            }
            
            // Cancelar subscription
            const success = await this.subscription.unsubscribe();
            
            if (success) {
                console.log('Subscription cancelada');
                
                // Notificar servidor
                await this.removeSubscriptionFromServer();
                
                this.subscription = null;
                this.isSubscribed = false;
                this.updateUI();
                this.showSuccessMessage('Notificações desativadas');
                return true;
            } else {
                throw new Error('Falha ao cancelar subscription');
            }
            
        } catch (error) {
            console.error('Erro ao cancelar subscription:', error);
            this.showErrorMessage('Erro ao desativar notificações');
            return false;
        }
    }
    
    async sendSubscriptionToServer() {
        try {
            const response = await this.apiClient.post('/push/subscribe', {
                endpoint: this.subscription.endpoint,
                keys: {
                    p256dh: this.arrayBufferToBase64(this.subscription.getKey('p256dh')),
                    auth: this.arrayBufferToBase64(this.subscription.getKey('auth'))
                }
            });
            
            return response.success;
            
        } catch (error) {
            console.error('Erro ao enviar subscription para servidor:', error);
            return false;
        }
    }
    
    async removeSubscriptionFromServer() {
        try {
            // Implementar remoção no servidor se necessário
            console.log('Removendo subscription do servidor...');
        } catch (error) {
            console.error('Erro ao remover subscription do servidor:', error);
        }
    }
    
    async sendTestNotification(type = 'test') {
        try {
            const templates = {
                test: {
                    title: '🔔 Teste de Notificação',
                    body: 'Esta é uma notificação de teste do Instituto Buriti!',
                    data: { type: 'test' }
                },
                study: {
                    title: '📚 Hora de estudar!',
                    body: 'Que tal continuar seus estudos? Você está indo muito bem!',
                    data: { type: 'study_reminder' }
                },
                achievement: {
                    title: '🏆 Nova conquista!',
                    body: 'Parabéns! Você conquistou uma nova badge.',
                    data: { type: 'achievement' }
                },
                course: {
                    title: '🎓 Novidade no seu curso',
                    body: 'Nova aula disponível! Continue sua jornada de aprendizado.',
                    data: { type: 'course_update' }
                },
                motivation: {
                    title: '🌟 Motivação do dia',
                    body: 'O sucesso é a soma de pequenos esforços repetidos dia após dia.',
                    data: { type: 'motivation' }
                }
            };
            
            const notification = templates[type] || templates.test;
            
            const response = await this.apiClient.post('/push/send', {
                user_email: 'aluno@demo.com',
                ...notification
            });
            
            if (response.success) {
                this.showSuccessMessage('Notificação de teste enviada!');
            } else {
                throw new Error(response.error);
            }
            
        } catch (error) {
            console.error('Erro ao enviar notificação de teste:', error);
            this.showErrorMessage('Erro ao enviar notificação de teste');
        }
    }
    
    updateUI() {
        // Atualizar botões e status na interface
        const subscribeBtn = document.getElementById('subscribe-push-btn');
        const unsubscribeBtn = document.getElementById('unsubscribe-push-btn');
        const statusElement = document.getElementById('push-status');
        
        if (subscribeBtn) {
            subscribeBtn.style.display = this.isSubscribed ? 'none' : 'block';
            subscribeBtn.disabled = !this.isSupported;
        }
        
        if (unsubscribeBtn) {
            unsubscribeBtn.style.display = this.isSubscribed ? 'block' : 'none';
        }
        
        if (statusElement) {
            if (!this.isSupported) {
                statusElement.textContent = 'Notificações não suportadas';
                statusElement.className = 'status-error';
            } else if (this.isSubscribed) {
                statusElement.textContent = 'Notificações ativadas';
                statusElement.className = 'status-success';
            } else {
                statusElement.textContent = 'Notificações desativadas';
                statusElement.className = 'status-warning';
            }
        }
        
        // Atualizar configurações se a página estiver carregada
        if (typeof updateNotificationSettings === 'function') {
            updateNotificationSettings();
        }
    }
    
    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }
    
    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }
    
    showPermissionDeniedMessage() {
        const message = `
            <strong>Notificações bloqueadas</strong><br>
            Para ativar as notificações:<br>
            1. Clique no ícone de cadeado na barra de endereços<br>
            2. Altere as notificações para "Permitir"<br>
            3. Recarregue a página
        `;
        this.showMessage(message, 'warning', 8000);
    }
    
    showMessage(message, type = 'info', duration = 4000) {
        // Usar sistema de notificações existente se disponível
        if (window.NotificationSystem) {
            const iconMap = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };
            
            window.NotificationSystem.show({
                type: 'custom',
                title: `${iconMap[type]} Push Notifications`,
                message: message,
                duration: duration
            });
        } else {
            // Fallback para console
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
    
    // Utilitários
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
    
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
    
    // Métodos públicos para uso externo
    getStatus() {
        return {
            isSupported: this.isSupported,
            isSubscribed: this.isSubscribed,
            permission: Notification.permission
        };
    }
    
    async toggleSubscription() {
        if (this.isSubscribed) {
            return await this.unsubscribe();
        } else {
            return await this.subscribe();
        }
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para garantir que outros scripts carregaram
    setTimeout(() => {
        window.pushManager = new PushNotificationManager();
    }, 1000);
});

// Exportar para uso global
window.PushNotificationManager = PushNotificationManager;

