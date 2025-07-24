/**
 * Subscription Management JavaScript - Instituto Buriti
 * Gerencia assinaturas, pagamentos e benefícios
 */

class SubscriptionManager {
    constructor() {
        this.currentSubscription = {};
        this.paymentHistory = [];
        this.usageStats = {};
        this.init();
    }
    
    init() {
        this.loadSubscriptionData();
        this.updatePageContent();
        this.setupEventListeners();
        this.loadPaymentHistory();
        this.loadUsageStats();
        this.setupTableResponsive();
    }
    
    loadSubscriptionData() {
        // Simular dados da assinatura atual
        this.currentSubscription = {
            planId: 'premium',
            planName: 'Plano Premium',
            planDescription: 'Acesso ilimitado a todos os cursos',
            price: 59.90,
            period: 'mensal',
            status: 'active',
            nextPayment: new Date('2025-08-19'),
            paymentMethod: {
                type: 'credit-card',
                last4: '1234',
                brand: 'Visa'
            },
            memberSince: new Date('2025-01-19'),
            coursesAccessed: 12,
            benefits: [
                'unlimited_access',
                'premium_certificates',
                'priority_support',
                'live_classes'
            ]
        };
        
        // Salvar no localStorage
        localStorage.setItem('currentSubscription', JSON.stringify(this.currentSubscription));
    }
    
    updatePageContent() {
        // Atualizar informações do plano atual
        document.getElementById('planName').textContent = this.currentSubscription.planName;
        document.getElementById('planDescription').textContent = this.currentSubscription.planDescription;
        document.getElementById('planPrice').textContent = `R$ ${this.currentSubscription.price.toFixed(2).replace('.', ',')}`;
        
        // Atualizar status
        const statusElement = document.getElementById('planStatus');
        statusElement.className = `plan-status ${this.currentSubscription.status}`;
        statusElement.innerHTML = `
            <i class="fas fa-${this.currentSubscription.status === 'active' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${this.currentSubscription.status === 'active' ? 'Ativo' : 'Inativo'}</span>
        `;
        
        // Atualizar próximo pagamento
        document.getElementById('nextPayment').textContent = this.formatDate(this.currentSubscription.nextPayment);
        
        // Atualizar método de pagamento
        const paymentMethodText = this.getPaymentMethodText();
        document.getElementById('paymentMethod').textContent = paymentMethodText;
        
        // Atualizar data de membro
        document.getElementById('memberSince').textContent = this.formatDate(this.currentSubscription.memberSince);
        
        // Atualizar cursos acessados
        document.getElementById('coursesAccessed').textContent = `${this.currentSubscription.coursesAccessed} cursos`;
        
        // Atualizar benefícios
        this.updateBenefits();
    }
    
    getPaymentMethodText() {
        const method = this.currentSubscription.paymentMethod;
        switch (method.type) {
            case 'credit-card':
                return `${method.brand || 'Cartão'} •••• ${method.last4}`;
            case 'pix':
                return 'PIX';
            case 'boleto':
                return 'Boleto Bancário';
            default:
                return 'Não definido';
        }
    }
    
    updateBenefits() {
        const benefitsGrid = document.getElementById('benefitsGrid');
        const benefitCards = benefitsGrid.querySelectorAll('.benefit-card');
        
        benefitCards.forEach(card => {
            const benefitType = this.getBenefitType(card);
            const isActive = this.currentSubscription.benefits.includes(benefitType);
            
            if (isActive) {
                card.classList.add('active');
                card.classList.remove('inactive');
            } else {
                card.classList.add('inactive');
                card.classList.remove('active');
            }
        });
    }
    
    getBenefitType(card) {
        const title = card.querySelector('h3').textContent.toLowerCase();
        if (title.includes('ilimitado')) return 'unlimited_access';
        if (title.includes('certificados')) return 'premium_certificates';
        if (title.includes('suporte')) return 'priority_support';
        if (title.includes('aulas ao vivo')) return 'live_classes';
        if (title.includes('mentoria')) return 'individual_mentoring';
        if (title.includes('antecipado')) return 'early_access';
        return 'unknown';
    }
    
    formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    
    setupEventListeners() {
        // Botões de ação da assinatura
        this.setupSubscriptionActions();
        
        // Botões dos planos
        this.setupPlanButtons();
        
        // Histórico de pagamentos
        this.setupPaymentHistoryActions();
        
        // Filtros e downloads
        this.setupFilterAndDownload();
    }
    
    setupSubscriptionActions() {
        // Alterar método de pagamento
        document.getElementById('updatePaymentMethod').addEventListener('click', () => {
            this.showUpdatePaymentModal();
        });
        
        // Fazer upgrade
        document.getElementById('upgradeSubscription').addEventListener('click', () => {
            this.showUpgradeModal();
        });
        
        // Cancelar assinatura
        document.getElementById('cancelSubscription').addEventListener('click', () => {
            this.showCancelModal();
        });
    }
    
    setupPlanButtons() {
        const planButtons = document.querySelectorAll('.plan-button[data-plan]');
        planButtons.forEach(button => {
            button.addEventListener('click', () => {
                const planType = button.dataset.plan;
                this.changePlan(planType);
            });
        });
    }
    
    setupPaymentHistoryActions() {
        // Botões de ação na tabela
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = button.title.toLowerCase();
                const row = button.closest('.table-row');
                const invoice = row.querySelector('.invoice').textContent;
                
                if (action.includes('detalhes')) {
                    this.showPaymentDetails(invoice);
                } else if (action.includes('recibo')) {
                    this.downloadReceipt(invoice);
                }
            });
        });
        
        // Paginação
        const paginationButtons = document.querySelectorAll('.pagination-btn');
        paginationButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (!button.disabled) {
                    const direction = button.textContent.includes('Anterior') ? 'prev' : 'next';
                    this.changePage(direction);
                }
            });
        });
    }
    
    setupFilterAndDownload() {
        // Download do histórico
        document.getElementById('downloadHistory').addEventListener('click', () => {
            this.downloadPaymentHistory();
        });
        
        // Filtrar histórico
        document.getElementById('filterHistory').addEventListener('click', () => {
            this.showFilterModal();
        });
    }
    
    showUpdatePaymentModal() {
        const modal = this.createModal('Alterar Método de Pagamento', `
            <div class="payment-methods">
                <h4>Escolha o novo método de pagamento:</h4>
                <div class="method-options">
                    <label class="method-option">
                        <input type="radio" name="paymentMethod" value="credit-card" checked>
                        <div class="method-card">
                            <i class="fas fa-credit-card"></i>
                            <span>Cartão de Crédito</span>
                        </div>
                    </label>
                    <label class="method-option">
                        <input type="radio" name="paymentMethod" value="pix">
                        <div class="method-card">
                            <i class="fas fa-qrcode"></i>
                            <span>PIX</span>
                        </div>
                    </label>
                    <label class="method-option">
                        <input type="radio" name="paymentMethod" value="boleto">
                        <div class="method-card">
                            <i class="fas fa-barcode"></i>
                            <span>Boleto</span>
                        </div>
                    </label>
                </div>
                <div class="card-form" id="cardForm">
                    <div class="form-group">
                        <label>Número do Cartão</label>
                        <input type="text" placeholder="1234 5678 9012 3456" maxlength="19">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Validade</label>
                            <input type="text" placeholder="MM/AA" maxlength="5">
                        </div>
                        <div class="form-group">
                            <label>CVV</label>
                            <input type="text" placeholder="123" maxlength="4">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Nome no Cartão</label>
                        <input type="text" placeholder="Nome como está no cartão">
                    </div>
                </div>
            </div>
        `, [
            { text: 'Cancelar', class: 'btn-secondary', action: 'close' },
            { text: 'Salvar Método', class: 'btn-primary', action: 'save' }
        ]);
        
        // Adicionar estilos específicos
        this.addPaymentModalStyles();
        
        // Adicionar eventos
        const methodInputs = modal.querySelectorAll('input[name="paymentMethod"]');
        const cardForm = modal.querySelector('#cardForm');
        
        methodInputs.forEach(input => {
            input.addEventListener('change', () => {
                cardForm.style.display = input.value === 'credit-card' ? 'block' : 'none';
            });
        });
        
        // Ação de salvar
        modal.querySelector('.btn-primary').addEventListener('click', () => {
            this.updatePaymentMethod(modal);
        });
    }
    
    addPaymentModalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .payment-methods h4 {
                margin-bottom: 1rem;
                color: #1f2937;
            }
            
            .method-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 1rem;
                margin-bottom: 2rem;
            }
            
            .method-option {
                cursor: pointer;
            }
            
            .method-option input {
                display: none;
            }
            
            .method-card {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;
                padding: 1rem;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                transition: all 0.3s ease;
                text-align: center;
            }
            
            .method-option input:checked + .method-card {
                border-color: #8b5cf6;
                background: rgba(139, 92, 246, 0.05);
            }
            
            .method-card i {
                font-size: 1.5rem;
                color: #6b7280;
            }
            
            .method-option input:checked + .method-card i {
                color: #8b5cf6;
            }
            
            .card-form {
                background: #f9fafb;
                padding: 1.5rem;
                border-radius: 12px;
                border: 1px solid #e5e7eb;
            }
            
            .form-group {
                margin-bottom: 1rem;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 600;
                color: #374151;
            }
            
            .form-group input {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 1rem;
                transition: border-color 0.3s ease;
            }
            
            .form-group input:focus {
                outline: none;
                border-color: #8b5cf6;
                box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 1rem;
            }
        `;
        document.head.appendChild(style);
    }
    
    updatePaymentMethod(modal) {
        const selectedMethod = modal.querySelector('input[name="paymentMethod"]:checked').value;
        
        // Simular atualização
        this.currentSubscription.paymentMethod = {
            type: selectedMethod,
            last4: selectedMethod === 'credit-card' ? '5678' : null,
            brand: selectedMethod === 'credit-card' ? 'Mastercard' : null
        };
        
        // Atualizar na página
        document.getElementById('paymentMethod').textContent = this.getPaymentMethodText();
        
        // Fechar modal
        document.body.removeChild(modal);
        
        this.showNotification('Método de pagamento atualizado com sucesso!', 'success');
    }
    
    showUpgradeModal() {
        const modal = this.createModal('Fazer Upgrade para Plano Anual', `
            <div class="upgrade-content">
                <div class="upgrade-comparison">
                    <div class="current-plan">
                        <h4>Plano Atual</h4>
                        <div class="plan-info">
                            <span class="plan-name">Premium Mensal</span>
                            <span class="plan-price">R$ 59,90/mês</span>
                            <span class="plan-total">R$ 719,80/ano</span>
                        </div>
                    </div>
                    <div class="upgrade-arrow">
                        <i class="fas fa-arrow-right"></i>
                    </div>
                    <div class="new-plan">
                        <h4>Novo Plano</h4>
                        <div class="plan-info">
                            <span class="plan-name">Premium Anual</span>
                            <span class="plan-price">R$ 499,90/ano</span>
                            <span class="plan-savings">Economize R$ 219,90</span>
                        </div>
                    </div>
                </div>
                <div class="upgrade-benefits">
                    <h4>Benefícios Adicionais:</h4>
                    <ul>
                        <li><i class="fas fa-check"></i> Mentoria individual mensal</li>
                        <li><i class="fas fa-check"></i> Acesso antecipado a novos cursos</li>
                        <li><i class="fas fa-check"></i> Desconto em eventos presenciais</li>
                        <li><i class="fas fa-check"></i> Certificados com design exclusivo</li>
                    </ul>
                </div>
                <div class="payment-info">
                    <p><strong>Próxima cobrança:</strong> R$ 499,90 em 19/08/2025</p>
                    <p><small>Você será cobrado proporcionalmente pelo período restante do mês atual.</small></p>
                </div>
            </div>
        `, [
            { text: 'Cancelar', class: 'btn-secondary', action: 'close' },
            { text: 'Confirmar Upgrade', class: 'btn-primary', action: 'upgrade' }
        ]);
        
        // Adicionar estilos
        this.addUpgradeModalStyles();
        
        // Ação de upgrade
        modal.querySelector('.btn-primary').addEventListener('click', () => {
            this.performUpgrade();
            document.body.removeChild(modal);
        });
    }
    
    addUpgradeModalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .upgrade-comparison {
                display: grid;
                grid-template-columns: 1fr auto 1fr;
                gap: 1rem;
                align-items: center;
                margin-bottom: 2rem;
                padding: 1.5rem;
                background: #f9fafb;
                border-radius: 12px;
            }
            
            .current-plan, .new-plan {
                text-align: center;
                padding: 1rem;
                border-radius: 8px;
            }
            
            .current-plan {
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.3);
            }
            
            .new-plan {
                background: rgba(16, 185, 129, 0.1);
                border: 1px solid rgba(16, 185, 129, 0.3);
            }
            
            .upgrade-comparison h4 {
                margin-bottom: 1rem;
                color: #374151;
            }
            
            .plan-info {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .plan-name {
                font-weight: 600;
                color: #1f2937;
            }
            
            .plan-price {
                font-size: 1.2rem;
                font-weight: 700;
                color: #1f2937;
            }
            
            .plan-total {
                color: #6b7280;
                font-size: 0.9rem;
            }
            
            .plan-savings {
                color: #10b981;
                font-weight: 600;
                font-size: 0.9rem;
            }
            
            .upgrade-arrow {
                color: #8b5cf6;
                font-size: 1.5rem;
            }
            
            .upgrade-benefits {
                margin-bottom: 2rem;
            }
            
            .upgrade-benefits h4 {
                margin-bottom: 1rem;
                color: #1f2937;
            }
            
            .upgrade-benefits ul {
                list-style: none;
                padding: 0;
            }
            
            .upgrade-benefits li {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 0.5rem;
                color: #374151;
            }
            
            .upgrade-benefits i {
                color: #10b981;
                width: 16px;
            }
            
            .payment-info {
                background: #f9fafb;
                padding: 1rem;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }
            
            .payment-info p {
                margin-bottom: 0.5rem;
                color: #374151;
            }
            
            .payment-info small {
                color: #6b7280;
            }
        `;
        document.head.appendChild(style);
    }
    
    performUpgrade() {
        // Simular upgrade
        this.currentSubscription.planId = 'annual';
        this.currentSubscription.planName = 'Plano Anual';
        this.currentSubscription.price = 499.90;
        this.currentSubscription.period = 'anual';
        this.currentSubscription.benefits.push('individual_mentoring', 'early_access');
        
        // Atualizar página
        this.updatePageContent();
        
        this.showNotification('Upgrade realizado com sucesso! Bem-vindo ao Plano Anual!', 'success');
    }
    
    showCancelModal() {
        const modal = this.createModal('Cancelar Assinatura', `
            <div class="cancel-content">
                <div class="cancel-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h4>Tem certeza que deseja cancelar?</h4>
                    <p>Você perderá acesso a todos os benefícios premium, incluindo:</p>
                </div>
                <div class="cancel-benefits">
                    <ul>
                        <li><i class="fas fa-times"></i> Acesso ilimitado aos cursos</li>
                        <li><i class="fas fa-times"></i> Certificados premium</li>
                        <li><i class="fas fa-times"></i> Suporte prioritário</li>
                        <li><i class="fas fa-times"></i> Aulas ao vivo</li>
                    </ul>
                </div>
                <div class="cancel-alternatives">
                    <h4>Que tal uma pausa?</h4>
                    <p>Você pode pausar sua assinatura por até 3 meses sem perder seus benefícios.</p>
                    <button class="btn-outline pause-btn">Pausar Assinatura</button>
                </div>
                <div class="cancel-feedback">
                    <h4>Nos ajude a melhorar:</h4>
                    <select id="cancelReason">
                        <option value="">Motivo do cancelamento</option>
                        <option value="price">Preço muito alto</option>
                        <option value="content">Falta de conteúdo interessante</option>
                        <option value="time">Não tenho tempo para estudar</option>
                        <option value="technical">Problemas técnicos</option>
                        <option value="other">Outro motivo</option>
                    </select>
                    <textarea placeholder="Comentários adicionais (opcional)"></textarea>
                </div>
            </div>
        `, [
            { text: 'Manter Assinatura', class: 'btn-primary', action: 'close' },
            { text: 'Confirmar Cancelamento', class: 'btn-danger', action: 'cancel' }
        ]);
        
        // Adicionar estilos
        this.addCancelModalStyles();
        
        // Eventos
        modal.querySelector('.pause-btn').addEventListener('click', () => {
            this.pauseSubscription();
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.btn-danger').addEventListener('click', () => {
            this.cancelSubscription(modal);
        });
    }
    
    addCancelModalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .cancel-warning {
                text-align: center;
                margin-bottom: 2rem;
                padding: 1.5rem;
                background: rgba(239, 68, 68, 0.1);
                border-radius: 12px;
                border: 1px solid rgba(239, 68, 68, 0.3);
            }
            
            .cancel-warning i {
                font-size: 3rem;
                color: #ef4444;
                margin-bottom: 1rem;
            }
            
            .cancel-warning h4 {
                color: #1f2937;
                margin-bottom: 1rem;
            }
            
            .cancel-benefits ul {
                list-style: none;
                padding: 0;
                margin-bottom: 2rem;
            }
            
            .cancel-benefits li {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 0.5rem;
                color: #374151;
            }
            
            .cancel-benefits i {
                color: #ef4444;
                width: 16px;
            }
            
            .cancel-alternatives {
                background: rgba(59, 130, 246, 0.1);
                padding: 1.5rem;
                border-radius: 12px;
                border: 1px solid rgba(59, 130, 246, 0.3);
                margin-bottom: 2rem;
                text-align: center;
            }
            
            .cancel-alternatives h4 {
                color: #1f2937;
                margin-bottom: 1rem;
            }
            
            .cancel-alternatives p {
                color: #374151;
                margin-bottom: 1rem;
            }
            
            .pause-btn {
                padding: 0.5rem 1rem;
                font-size: 0.9rem;
            }
            
            .cancel-feedback h4 {
                margin-bottom: 1rem;
                color: #1f2937;
            }
            
            .cancel-feedback select,
            .cancel-feedback textarea {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                margin-bottom: 1rem;
                font-family: inherit;
            }
            
            .cancel-feedback textarea {
                height: 80px;
                resize: vertical;
            }
            
            .cancel-feedback select:focus,
            .cancel-feedback textarea:focus {
                outline: none;
                border-color: #8b5cf6;
                box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
            }
        `;
        document.head.appendChild(style);
    }
    
    pauseSubscription() {
        this.showNotification('Assinatura pausada por 30 dias. Você pode reativar a qualquer momento.', 'info');
    }
    
    cancelSubscription(modal) {
        const reason = modal.querySelector('#cancelReason').value;
        const comments = modal.querySelector('textarea').value;
        
        // Simular cancelamento
        this.currentSubscription.status = 'cancelled';
        
        // Enviar feedback
        console.log('Cancelamento:', { reason, comments });
        
        document.body.removeChild(modal);
        this.showNotification('Assinatura cancelada. Você terá acesso até 19/08/2025.', 'info');
        
        // Atualizar página
        this.updatePageContent();
    }
    
    changePlan(planType) {
        const plans = {
            basic: { name: 'Plano Básico', price: 29.90 },
            premium: { name: 'Plano Premium', price: 59.90 },
            annual: { name: 'Plano Anual', price: 499.90 }
        };
        
        const plan = plans[planType];
        if (!plan) return;
        
        // Simular mudança de plano
        this.currentSubscription.planId = planType;
        this.currentSubscription.planName = plan.name;
        this.currentSubscription.price = plan.price;
        
        this.updatePageContent();
        this.showNotification(`Plano alterado para ${plan.name} com sucesso!`, 'success');
    }
    
    loadPaymentHistory() {
        // Simular histórico de pagamentos
        this.paymentHistory = [
            {
                id: '#IB-20250719-001',
                date: new Date('2025-07-19T14:30:00'),
                description: 'Assinatura Premium - Julho/2025',
                method: { type: 'credit-card', last4: '1234' },
                status: 'success',
                amount: 59.90
            },
            {
                id: '#IB-20250619-001',
                date: new Date('2025-06-19T14:30:00'),
                description: 'Assinatura Premium - Junho/2025',
                method: { type: 'credit-card', last4: '1234' },
                status: 'success',
                amount: 59.90
            },
            {
                id: '#IB-20250519-001',
                date: new Date('2025-05-19T14:30:00'),
                description: 'Assinatura Premium - Maio/2025',
                method: { type: 'credit-card', last4: '1234' },
                status: 'success',
                amount: 59.90
            },
            {
                id: '#IB-20250419-002',
                date: new Date('2025-04-19T15:45:00'),
                description: 'Curso: Fundamentos da IA',
                method: { type: 'pix' },
                status: 'success',
                amount: 199.90
            }
        ];
    }
    
    loadUsageStats() {
        // Simular estatísticas de uso
        this.usageStats = {
            studyTime: { value: 127, unit: 'h', trend: 'up', change: '+15% este mês' },
            completedCourses: { value: 12, unit: '', trend: 'up', change: '+3 este mês' },
            certificates: { value: 8, unit: '', trend: 'up', change: '+2 este mês' },
            totalInvested: { value: 359.40, unit: 'R$', trend: 'neutral', change: 'Desde Jan/2025' }
        };
    }
    
    showPaymentDetails(invoice) {
        const payment = this.paymentHistory.find(p => p.id === invoice);
        if (!payment) return;
        
        const modal = this.createModal('Detalhes do Pagamento', `
            <div class="payment-details">
                <div class="detail-header">
                    <h4>${payment.id}</h4>
                    <span class="status ${payment.status}">
                        <i class="fas fa-${payment.status === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                        ${payment.status === 'success' ? 'Pago' : 'Pendente'}
                    </span>
                </div>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="label">Data e Hora:</span>
                        <span class="value">${this.formatDateTime(payment.date)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Descrição:</span>
                        <span class="value">${payment.description}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Método:</span>
                        <span class="value">${this.getPaymentMethodText(payment.method)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Valor:</span>
                        <span class="value">R$ ${payment.amount.toFixed(2).replace('.', ',')}</span>
                    </div>
                </div>
            </div>
        `, [
            { text: 'Baixar Recibo', class: 'btn-outline', action: 'download' },
            { text: 'Fechar', class: 'btn-primary', action: 'close' }
        ]);
        
        // Ação de download
        modal.querySelector('.btn-outline').addEventListener('click', () => {
            this.downloadReceipt(invoice);
        });
    }
    
    getPaymentMethodText(method) {
        switch (method.type) {
            case 'credit-card':
                return `Cartão •••• ${method.last4}`;
            case 'pix':
                return 'PIX';
            case 'boleto':
                return 'Boleto Bancário';
            default:
                return 'Não definido';
        }
    }
    
    formatDateTime(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${day}/${month}/${year} às ${hours}:${minutes}`;
    }
    
    downloadReceipt(invoice) {
        const payment = this.paymentHistory.find(p => p.id === invoice);
        if (!payment) return;
        
        const receiptContent = `
INSTITUTO BURITI - RECIBO DE PAGAMENTO
=====================================

Número: ${payment.id}
Data: ${this.formatDateTime(payment.date)}

DESCRIÇÃO:
${payment.description}

PAGAMENTO:
Valor: R$ ${payment.amount.toFixed(2).replace('.', ',')}
Método: ${this.getPaymentMethodText(payment.method)}
Status: ${payment.status === 'success' ? 'Pago' : 'Pendente'}

CLIENTE:
Email: ${this.getCurrentUserEmail()}

=====================================
Instituto Buriti - Educação que transforma
contato@institutoburiti.com.br
(11) 99999-9999
        `;
        
        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recibo-${payment.id.replace('#', '')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Recibo baixado com sucesso!', 'success');
    }
    
    getCurrentUserEmail() {
        const userData = localStorage.getItem('userData');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                return user.email || 'cliente@institutoburiti.com.br';
            } catch (e) {
                return 'cliente@institutoburiti.com.br';
            }
        }
        return 'cliente@institutoburiti.com.br';
    }
    
    downloadPaymentHistory() {
        const csvContent = [
            'Data,Descrição,Método,Status,Valor',
            ...this.paymentHistory.map(payment => [
                this.formatDate(payment.date),
                payment.description,
                this.getPaymentMethodText(payment.method),
                payment.status === 'success' ? 'Pago' : 'Pendente',
                `R$ ${payment.amount.toFixed(2).replace('.', ',')}`
            ].join(','))
        ].join('\\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'historico-pagamentos.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Histórico baixado com sucesso!', 'success');
    }
    
    showFilterModal() {
        const modal = this.createModal('Filtrar Histórico', `
            <div class="filter-form">
                <div class="form-group">
                    <label>Período:</label>
                    <select id="periodFilter">
                        <option value="all">Todos os períodos</option>
                        <option value="last30">Últimos 30 dias</option>
                        <option value="last90">Últimos 90 dias</option>
                        <option value="last365">Último ano</option>
                        <option value="custom">Período personalizado</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Status:</label>
                    <select id="statusFilter">
                        <option value="all">Todos os status</option>
                        <option value="success">Pagos</option>
                        <option value="pending">Pendentes</option>
                        <option value="failed">Falharam</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Método de Pagamento:</label>
                    <select id="methodFilter">
                        <option value="all">Todos os métodos</option>
                        <option value="credit-card">Cartão de Crédito</option>
                        <option value="pix">PIX</option>
                        <option value="boleto">Boleto</option>
                    </select>
                </div>
                <div class="custom-period" id="customPeriod" style="display: none;">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Data Inicial:</label>
                            <input type="date" id="startDate">
                        </div>
                        <div class="form-group">
                            <label>Data Final:</label>
                            <input type="date" id="endDate">
                        </div>
                    </div>
                </div>
            </div>
        `, [
            { text: 'Limpar Filtros', class: 'btn-secondary', action: 'clear' },
            { text: 'Aplicar Filtros', class: 'btn-primary', action: 'apply' }
        ]);
        
        // Mostrar/ocultar período personalizado
        modal.querySelector('#periodFilter').addEventListener('change', (e) => {
            const customPeriod = modal.querySelector('#customPeriod');
            customPeriod.style.display = e.target.value === 'custom' ? 'block' : 'none';
        });
        
        // Ações dos botões
        modal.querySelector('.btn-secondary').addEventListener('click', () => {
            this.clearFilters();
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.btn-primary').addEventListener('click', () => {
            this.applyFilters(modal);
            document.body.removeChild(modal);
        });
    }
    
    clearFilters() {
        // Limpar filtros e recarregar tabela
        this.showNotification('Filtros removidos', 'info');
    }
    
    applyFilters(modal) {
        const period = modal.querySelector('#periodFilter').value;
        const status = modal.querySelector('#statusFilter').value;
        const method = modal.querySelector('#methodFilter').value;
        
        // Aplicar filtros
        console.log('Filtros aplicados:', { period, status, method });
        this.showNotification('Filtros aplicados com sucesso!', 'success');
    }
    
    changePage(direction) {
        // Simular mudança de página
        console.log('Mudando página:', direction);
        this.showNotification(`Carregando ${direction === 'next' ? 'próxima' : 'anterior'} página...`, 'info');
    }
    
    setupTableResponsive() {
        // Adicionar labels para versão mobile
        const tableCells = document.querySelectorAll('.table-cell');
        const headers = ['Data', 'Descrição', 'Método', 'Status', 'Valor', 'Ações'];
        
        tableCells.forEach((cell, index) => {
            const headerIndex = index % headers.length;
            cell.setAttribute('data-label', headers[headerIndex]);
        });
    }
    
    createModal(title, content, buttons = []) {
        const modal = document.createElement('div');
        modal.className = 'subscription-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        ${buttons.map(btn => `
                            <button class="${btn.class}" data-action="${btn.action}">
                                ${btn.text}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // Adicionar estilos do modal
        this.addModalStyles();
        
        document.body.appendChild(modal);
        
        // Eventos de fechar
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal-overlay')) {
                document.body.removeChild(modal);
            }
        });
        
        // Eventos dos botões
        buttons.forEach(btn => {
            if (btn.action === 'close') {
                modal.querySelector(`[data-action="${btn.action}"]`).addEventListener('click', () => {
                    document.body.removeChild(modal);
                });
            }
        });
        
        return modal;
    }
    
    addModalStyles() {
        if (document.querySelector('#subscription-modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'subscription-modal-styles';
        style.textContent = `
            .subscription-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
            }
            
            .modal-content {
                background: white;
                border-radius: 16px;
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                z-index: 1;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .modal-header h3 {
                margin: 0;
                color: #1f2937;
                font-size: 1.3rem;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #6b7280;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            
            .modal-close:hover {
                background: #f3f4f6;
                color: #374151;
            }
            
            .modal-body {
                padding: 1.5rem;
            }
            
            .modal-footer {
                display: flex;
                gap: 1rem;
                padding: 1.5rem;
                border-top: 1px solid #e5e7eb;
                justify-content: flex-end;
            }
            
            @media (max-width: 768px) {
                .modal-content {
                    width: 95%;
                    margin: 1rem;
                }
                
                .modal-footer {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `subscription-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            font-family: 'Inter', sans-serif;
            font-size: 0.9rem;
            font-weight: 500;
        `;
        
        notification.querySelector('.notification-content').style.cssText = `
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new SubscriptionManager();
});

