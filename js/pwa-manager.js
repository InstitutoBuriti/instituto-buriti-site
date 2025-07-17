/**
 * PWA Manager - Instituto Buriti
 * Gerencia instalação, atualizações e funcionalidades PWA
 */

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isStandalone = false;
        this.swRegistration = null;
        
        this.init();
    }
    
    init() {
        this.checkInstallation();
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupUpdatePrompt();
        this.setupNotifications();
        
        console.log('📱 PWA Manager inicializado');
    }
    
    checkInstallation() {
        // Verificar se está rodando como PWA
        this.isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                           window.navigator.standalone ||
                           document.referrer.includes('android-app://');
        
        // Verificar se está instalado
        this.isInstalled = this.isStandalone || localStorage.getItem('pwa-installed') === 'true';
        
        if (this.isInstalled) {
            this.hideInstallPrompt();
            this.showPWAFeatures();
        }
        
        console.log('📱 PWA Status:', {
            installed: this.isInstalled,
            standalone: this.isStandalone
        });
    }
    
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                });
                
                console.log('✅ Service Worker registrado:', this.swRegistration.scope);
                
                // Verificar atualizações
                this.swRegistration.addEventListener('updatefound', () => {
                    this.handleServiceWorkerUpdate();
                });
                
                // Escutar mensagens do SW
                navigator.serviceWorker.addEventListener('message', event => {
                    this.handleServiceWorkerMessage(event);
                });
                
            } catch (error) {
                console.error('❌ Erro ao registrar Service Worker:', error);
            }
        }
    }
    
    setupInstallPrompt() {
        // Escutar evento beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('📱 PWA pode ser instalado');
            
            // Prevenir prompt automático
            e.preventDefault();
            this.deferredPrompt = e;
            
            // Mostrar botão de instalação customizado
            this.showInstallButton();
        });
        
        // Escutar evento de instalação
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA instalado com sucesso');
            this.deferredPrompt = null;
            this.isInstalled = true;
            localStorage.setItem('pwa-installed', 'true');
            
            this.hideInstallPrompt();
            this.showInstallSuccess();
            this.showPWAFeatures();
        });
    }
    
    setupUpdatePrompt() {
        // Verificar atualizações periodicamente
        setInterval(() => {
            if (this.swRegistration) {
                this.swRegistration.update();
            }
        }, 60000); // A cada minuto
    }
    
    setupNotifications() {
        // Solicitar permissão para notificações
        if ('Notification' in window && 'serviceWorker' in navigator) {
            this.requestNotificationPermission();
        }
    }
    
    showInstallButton() {
        // Criar botão de instalação se não existir
        let installButton = document.getElementById('pwa-install-btn');
        
        if (!installButton) {
            installButton = document.createElement('button');
            installButton.id = 'pwa-install-btn';
            installButton.className = 'pwa-install-button';
            installButton.innerHTML = `
                <span class="install-icon">📱</span>
                <span class="install-text">Instalar App</span>
            `;
            
            // Adicionar estilos
            installButton.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #973CBF, #667eea);
                color: white;
                border: none;
                border-radius: 50px;
                padding: 15px 25px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(151, 60, 191, 0.4);
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
                animation: pulse 2s infinite;
            `;
            
            // Adicionar hover effect
            installButton.addEventListener('mouseenter', () => {
                installButton.style.transform = 'translateY(-2px)';
                installButton.style.boxShadow = '0 6px 25px rgba(151, 60, 191, 0.6)';
            });
            
            installButton.addEventListener('mouseleave', () => {
                installButton.style.transform = 'translateY(0)';
                installButton.style.boxShadow = '0 4px 20px rgba(151, 60, 191, 0.4)';
            });
            
            // Adicionar evento de clique
            installButton.addEventListener('click', () => {
                this.installPWA();
            });
            
            document.body.appendChild(installButton);
        }
        
        // Adicionar animação CSS se não existir
        if (!document.getElementById('pwa-animations')) {
            const style = document.createElement('style');
            style.id = 'pwa-animations';
            style.textContent = `
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                
                @keyframes slideInUp {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                
                .pwa-install-button {
                    animation: slideInUp 0.5s ease-out;
                }
            `;
            document.head.appendChild(style);
        }
        
        installButton.style.display = 'flex';
    }
    
    hideInstallPrompt() {
        const installButton = document.getElementById('pwa-install-btn');
        if (installButton) {
            installButton.style.display = 'none';
        }
    }
    
    async installPWA() {
        if (!this.deferredPrompt) {
            console.log('❌ Prompt de instalação não disponível');
            return;
        }
        
        try {
            // Mostrar prompt de instalação
            this.deferredPrompt.prompt();
            
            // Aguardar escolha do usuário
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log('📱 Resultado da instalação:', outcome);
            
            if (outcome === 'accepted') {
                console.log('✅ Usuário aceitou instalar o PWA');
            } else {
                console.log('❌ Usuário recusou instalar o PWA');
            }
            
            this.deferredPrompt = null;
            
        } catch (error) {
            console.error('❌ Erro ao instalar PWA:', error);
        }
    }
    
    showInstallSuccess() {
        // Mostrar notificação de sucesso
        this.showNotification('🎉 App instalado com sucesso!', 'success');
        
        // Esconder botão de instalação
        this.hideInstallPrompt();
    }
    
    showPWAFeatures() {
        // Mostrar recursos específicos do PWA
        console.log('🚀 Recursos PWA ativados');
        
        // Adicionar atalhos de teclado
        this.setupKeyboardShortcuts();
        
        // Configurar compartilhamento
        this.setupWebShare();
        
        // Configurar modo offline
        this.setupOfflineMode();
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K para busca
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearch();
            }
            
            // Ctrl/Cmd + H para home
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                window.location.href = '/';
            }
            
            // Ctrl/Cmd + M para menu
            if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
                e.preventDefault();
                this.toggleMenu();
            }
        });
    }
    
    setupWebShare() {
        if (navigator.share) {
            // Adicionar botões de compartilhamento
            const shareButtons = document.querySelectorAll('.share-btn');
            shareButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.shareContent();
                });
            });
        }
    }
    
    setupOfflineMode() {
        // Detectar status de conexão
        window.addEventListener('online', () => {
            this.showNotification('🌐 Conexão restaurada', 'success');
            this.syncOfflineData();
        });
        
        window.addEventListener('offline', () => {
            this.showNotification('📱 Modo offline ativado', 'info');
        });
    }
    
    handleServiceWorkerUpdate() {
        const newWorker = this.swRegistration.installing;
        
        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nova versão disponível
                this.showUpdatePrompt();
            }
        });
    }
    
    showUpdatePrompt() {
        const updatePrompt = document.createElement('div');
        updatePrompt.className = 'update-prompt';
        updatePrompt.innerHTML = `
            <div class="update-content">
                <span class="update-icon">🔄</span>
                <span class="update-text">Nova versão disponível!</span>
                <button class="update-btn" onclick="window.pwaManager.updateApp()">Atualizar</button>
                <button class="update-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        updatePrompt.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border: 2px solid #973CBF;
            border-radius: 10px;
            padding: 15px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            z-index: 10001;
            animation: slideInDown 0.5s ease-out;
        `;
        
        document.body.appendChild(updatePrompt);
        
        // Auto-remover após 10 segundos
        setTimeout(() => {
            if (updatePrompt.parentElement) {
                updatePrompt.remove();
            }
        }, 10000);
    }
    
    updateApp() {
        if (this.swRegistration && this.swRegistration.waiting) {
            this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    }
    
    async requestNotificationPermission() {
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            console.log('🔔 Permissão de notificação:', permission);
        }
    }
    
    showNotification(message, type = 'info') {
        // Criar notificação visual
        const notification = document.createElement('div');
        notification.className = `pwa-notification pwa-notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
            border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
            border-radius: 8px;
            padding: 15px 20px;
            z-index: 10002;
            display: flex;
            align-items: center;
            gap: 15px;
            animation: slideInDown 0.5s ease-out;
            max-width: 90vw;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutUp 0.5s ease-out';
                setTimeout(() => notification.remove(), 500);
            }
        }, 5000);
    }
    
    async shareContent() {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Instituto Buriti',
                    text: 'Plataforma educacional completa com cursos e certificações',
                    url: window.location.href
                });
                console.log('✅ Conteúdo compartilhado');
            } catch (error) {
                console.log('❌ Erro ao compartilhar:', error);
            }
        }
    }
    
    openSearch() {
        // Implementar busca global
        console.log('🔍 Abrindo busca global');
    }
    
    toggleMenu() {
        // Toggle do menu mobile
        const mobileNav = document.getElementById('mobileNav');
        if (mobileNav) {
            mobileNav.classList.toggle('active');
        }
    }
    
    async syncOfflineData() {
        if (this.swRegistration && this.swRegistration.sync) {
            try {
                await this.swRegistration.sync.register('background-sync');
                console.log('🔄 Sincronização em background registrada');
            } catch (error) {
                console.error('❌ Erro ao registrar sync:', error);
            }
        }
    }
    
    handleServiceWorkerMessage(event) {
        const { data } = event;
        
        if (data.type === 'VERSION') {
            console.log('📦 Versão do SW:', data.version);
        }
    }
    
    // Métodos públicos para integração
    getInstallationStatus() {
        return {
            isInstalled: this.isInstalled,
            isStandalone: this.isStandalone,
            canInstall: !!this.deferredPrompt
        };
    }
    
    forceUpdate() {
        if (this.swRegistration) {
            this.swRegistration.update();
        }
    }
    
    unregisterServiceWorker() {
        if (this.swRegistration) {
            this.swRegistration.unregister();
        }
    }
}

// Inicializar PWA Manager quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.pwaManager = new PWAManager();
});

// Adicionar animações CSS
const pwaStyles = document.createElement('style');
pwaStyles.textContent = `
    @keyframes slideInDown {
        from {
            transform: translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutUp {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(-100%);
            opacity: 0;
        }
    }
    
    .update-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .update-btn {
        background: #973CBF;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
    }
    
    .update-close, .notification-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;

document.head.appendChild(pwaStyles);

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAManager;
}

