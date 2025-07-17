/**
 * Sistema de Pagamentos - Instituto Buriti
 * Gerenciamento de métodos de pagamento, assinaturas e histórico
 */

class PaymentSystem {
    constructor() {
        this.apiBaseUrl = 'https://zmhqivcvkygp.manus.space/api';
        this.currentUser = this.getCurrentUser();
        this.paymentMethods = [];
        this.purchaseHistory = [];
        this.subscription = null;
        
        this.init();
    }
    
    init() {
        this.loadPaymentData();
        this.setupEventListeners();
        this.setupModal();
        this.setupTabs();
        
        console.log('💳 Sistema de Pagamentos inicializado');
    }
    
    getCurrentUser() {
        // Simular usuário logado
        return {
            id: 'user-123',
            name: 'João Silva',
            email: 'joao.silva@email.com',
            plan: 'premium'
        };
    }
    
    async loadPaymentData() {
        try {
            // Simular carregamento de dados
            await this.loadPaymentMethods();
            await this.loadSubscription();
            await this.loadPurchaseHistory();
            
            this.updateUI();
        } catch (error) {
            console.error('Erro ao carregar dados de pagamento:', error);
            this.showNotification('Erro ao carregar dados', 'error');
        }
    }
    
    async loadPaymentMethods() {
        // Simular dados de métodos de pagamento
        this.paymentMethods = [
            {
                id: 'pm-1',
                type: 'card',
                brand: 'Visa',
                last4: '1234',
                holder: 'João Silva',
                expiry: '12/26',
                isDefault: true
            },
            {
                id: 'pm-2',
                type: 'card',
                brand: 'Mastercard',
                last4: '5678',
                holder: 'João Silva',
                expiry: '08/25',
                isDefault: false
            },
            {
                id: 'pm-3',
                type: 'pix',
                key: 'joao.silva@email.com',
                keyType: 'email',
                isDefault: false
            }
        ];
    }
    
    async loadSubscription() {
        // Simular dados de assinatura
        this.subscription = {
            id: 'sub-1',
            plan: 'premium',
            status: 'active',
            price: 49.90,
            currency: 'BRL',
            nextBilling: '2025-08-15',
            paymentMethod: 'pm-1'
        };
    }
    
    async loadPurchaseHistory() {
        // Simular histórico de compras
        this.purchaseHistory = [
            {
                id: 'purchase-1',
                type: 'course',
                title: 'Desenvolvimento Web Completo',
                amount: 299.90,
                date: '2025-07-15',
                status: 'completed',
                paymentMethod: 'Visa **** 1234'
            },
            {
                id: 'purchase-2',
                type: 'subscription',
                title: 'Plano Premium - Julho',
                amount: 49.90,
                date: '2025-07-15',
                status: 'completed',
                paymentMethod: 'Visa **** 1234'
            },
            {
                id: 'purchase-3',
                type: 'course',
                title: 'Marketing Digital Avançado',
                amount: 399.90,
                date: '2025-07-10',
                status: 'completed',
                paymentMethod: 'PIX'
            },
            {
                id: 'purchase-4',
                type: 'course',
                title: 'Design Gráfico Profissional',
                amount: 349.90,
                date: '2025-07-05',
                status: 'processing',
                paymentMethod: 'Mastercard **** 5678'
            }
        ];
    }
    
    updateUI() {
        this.updateStats();
        this.updatePaymentMethods();
        this.updateSubscription();
        this.updatePurchaseHistory();
    }
    
    updateStats() {
        const totalInvested = this.purchaseHistory
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + p.amount, 0);
        
        const coursesAcquired = this.purchaseHistory
            .filter(p => p.type === 'course' && p.status === 'completed')
            .length;
        
        // Atualizar elementos da UI (se existirem)
        const statsElements = document.querySelectorAll('.stat-info h3');
        if (statsElements.length >= 4) {
            statsElements[0].textContent = `R$ ${totalInvested.toFixed(2).replace('.', ',')}`;
            statsElements[1].textContent = coursesAcquired.toString();
            statsElements[2].textContent = '5'; // Cursos concluídos (simulado)
            statsElements[3].textContent = this.subscription?.plan || 'Básico';
        }
    }
    
    updatePaymentMethods() {
        // Atualizar lista de métodos de pagamento na UI
        console.log('Métodos de pagamento atualizados:', this.paymentMethods);
    }
    
    updateSubscription() {
        // Atualizar informações de assinatura na UI
        console.log('Assinatura atualizada:', this.subscription);
    }
    
    updatePurchaseHistory() {
        // Atualizar histórico de compras na UI
        console.log('Histórico atualizado:', this.purchaseHistory);
    }
    
    setupEventListeners() {
        // Adicionar método de pagamento
        const addPaymentBtn = document.getElementById('addPaymentMethod');
        if (addPaymentBtn) {
            addPaymentBtn.addEventListener('click', () => this.showAddPaymentModal());
        }
        
        // Gerenciar assinatura
        const manageSubBtn = document.getElementById('manageSubscription');
        if (manageSubBtn) {
            manageSubBtn.addEventListener('click', () => this.showSubscriptionModal());
        }
        
        // Ações rápidas
        const quickActions = {
            'buyCredits': () => this.showBuyCreditsModal(),
            'giftCard': () => this.showGiftCardModal(),
            'corporateAccount': () => this.showCorporateModal(),
            'referralProgram': () => this.showReferralModal()
        };
        
        Object.entries(quickActions).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });
        
        // Filtros de histórico
        const filterPeriod = document.getElementById('filterPeriod');
        const filterType = document.getElementById('filterType');
        
        if (filterPeriod) {
            filterPeriod.addEventListener('change', () => this.filterPurchaseHistory());
        }
        
        if (filterType) {
            filterType.addEventListener('change', () => this.filterPurchaseHistory());
        }
        
        // Botões de ação nos cartões
        this.setupCardActions();
    }
    
    setupCardActions() {
        // Definir como padrão
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-set-default')) {
                const card = e.target.closest('.payment-method-card');
                if (card) {
                    this.setDefaultPaymentMethod(card.dataset.id);
                }
            }
            
            // Editar método
            if (e.target.classList.contains('btn-edit')) {
                const card = e.target.closest('.payment-method-card');
                if (card) {
                    this.editPaymentMethod(card.dataset.id);
                }
            }
            
            // Deletar método
            if (e.target.classList.contains('btn-delete')) {
                const card = e.target.closest('.payment-method-card');
                if (card) {
                    this.deletePaymentMethod(card.dataset.id);
                }
            }
            
            // Baixar recibo
            if (e.target.classList.contains('btn-receipt')) {
                const item = e.target.closest('.purchase-item');
                if (item) {
                    this.downloadReceipt(item.dataset.id);
                }
            }
        });
    }
    
    setupModal() {
        const modal = document.getElementById('paymentMethodModal');
        const closeBtn = modal?.querySelector('.modal-close');
        const cancelBtn = document.getElementById('cancelPaymentMethod');
        const saveBtn = document.getElementById('savePaymentMethod');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideModal());
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.savePaymentMethod());
        }
        
        // Fechar modal clicando fora
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }
    }
    
    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                
                // Remover classe active de todos
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Adicionar classe active ao selecionado
                btn.classList.add('active');
                const targetTab = document.getElementById(tabId + 'Tab');
                if (targetTab) {
                    targetTab.classList.add('active');
                }
            });
        });
    }
    
    showAddPaymentModal() {
        const modal = document.getElementById('paymentMethodModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    hideModal() {
        const modal = document.getElementById('paymentMethodModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    async savePaymentMethod() {
        try {
            // Simular salvamento
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.showNotification('Método de pagamento adicionado com sucesso!', 'success');
            this.hideModal();
            this.loadPaymentMethods();
        } catch (error) {
            console.error('Erro ao salvar método:', error);
            this.showNotification('Erro ao salvar método de pagamento', 'error');
        }
    }
    
    async setDefaultPaymentMethod(methodId) {
        try {
            // Simular API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Atualizar dados locais
            this.paymentMethods.forEach(method => {
                method.isDefault = method.id === methodId;
            });
            
            this.showNotification('Método padrão atualizado!', 'success');
            this.updatePaymentMethods();
        } catch (error) {
            console.error('Erro ao definir método padrão:', error);
            this.showNotification('Erro ao atualizar método padrão', 'error');
        }
    }
    
    async editPaymentMethod(methodId) {
        try {
            const method = this.paymentMethods.find(m => m.id === methodId);
            if (method) {
                // Abrir modal de edição com dados preenchidos
                this.showAddPaymentModal();
                // Preencher formulário com dados existentes
                console.log('Editando método:', method);
            }
        } catch (error) {
            console.error('Erro ao editar método:', error);
            this.showNotification('Erro ao carregar dados do método', 'error');
        }
    }
    
    async deletePaymentMethod(methodId) {
        if (!confirm('Tem certeza que deseja remover este método de pagamento?')) {
            return;
        }
        
        try {
            // Simular API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Remover dos dados locais
            this.paymentMethods = this.paymentMethods.filter(m => m.id !== methodId);
            
            this.showNotification('Método de pagamento removido!', 'success');
            this.updatePaymentMethods();
        } catch (error) {
            console.error('Erro ao deletar método:', error);
            this.showNotification('Erro ao remover método de pagamento', 'error');
        }
    }
    
    async downloadReceipt(purchaseId) {
        try {
            // Simular download de recibo
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const purchase = this.purchaseHistory.find(p => p.id === purchaseId);
            if (purchase) {
                // Simular download
                const blob = new Blob([`Recibo - ${purchase.title}\nValor: R$ ${purchase.amount}\nData: ${purchase.date}`], 
                    { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `recibo-${purchase.id}.txt`;
                a.click();
                URL.revokeObjectURL(url);
                
                this.showNotification('Recibo baixado com sucesso!', 'success');
            }
        } catch (error) {
            console.error('Erro ao baixar recibo:', error);
            this.showNotification('Erro ao baixar recibo', 'error');
        }
    }
    
    filterPurchaseHistory() {
        const periodFilter = document.getElementById('filterPeriod')?.value;
        const typeFilter = document.getElementById('filterType')?.value;
        
        let filteredHistory = [...this.purchaseHistory];
        
        // Filtrar por período
        if (periodFilter && periodFilter !== 'all') {
            const days = parseInt(periodFilter);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            
            filteredHistory = filteredHistory.filter(purchase => {
                const purchaseDate = new Date(purchase.date);
                return purchaseDate >= cutoffDate;
            });
        }
        
        // Filtrar por tipo
        if (typeFilter && typeFilter !== 'all') {
            filteredHistory = filteredHistory.filter(purchase => 
                purchase.type === typeFilter
            );
        }
        
        console.log('Histórico filtrado:', filteredHistory);
        // Atualizar UI com histórico filtrado
    }
    
    showSubscriptionModal() {
        this.showNotification('Modal de gerenciamento de assinatura em desenvolvimento', 'info');
    }
    
    showBuyCreditsModal() {
        this.showNotification('Sistema de créditos em desenvolvimento', 'info');
    }
    
    showGiftCardModal() {
        this.showNotification('Sistema de cartão presente em desenvolvimento', 'info');
    }
    
    showCorporateModal() {
        this.showNotification('Contas corporativas em desenvolvimento', 'info');
    }
    
    showReferralModal() {
        this.showNotification('Programa de indicação em desenvolvimento', 'info');
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
    async processPayment(paymentData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/payments/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(paymentData)
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao processar pagamento:', error);
            throw error;
        }
    }
    
    async createSubscription(planData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/subscriptions/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(planData)
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao criar assinatura:', error);
            throw error;
        }
    }
    
    getAuthToken() {
        // Retornar token de autenticação
        return localStorage.getItem('auth_token') || 'demo-token';
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window !== 'undefined') {
        window.PaymentSystem = PaymentSystem;
    }
});

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaymentSystem;
}

