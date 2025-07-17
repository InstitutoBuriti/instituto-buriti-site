/**
 * Institutional Sales - Sistema de Vendas Institucionais
 * Instituto Buriti - 2025
 */

class InstitutionalSales {
    constructor() {
        this.selectedPlan = null;
        this.formData = {};
        
        this.initializeElements();
        this.bindEvents();
        this.initializeAnimations();
    }
    
    initializeElements() {
        // Formulário
        this.quoteForm = document.getElementById('quoteForm');
        this.submitBtn = this.quoteForm?.querySelector('.submit-btn');
        
        // Modais
        this.successModal = document.getElementById('successModal');
        
        // Campos do formulário
        this.formFields = {
            companyName: document.getElementById('companyName'),
            cnpj: document.getElementById('cnpj'),
            contactName: document.getElementById('contactName'),
            position: document.getElementById('position'),
            email: document.getElementById('email'),
            phone: document.getElementById('phone'),
            employees: document.getElementById('employees'),
            segment: document.getElementById('segment'),
            message: document.getElementById('message')
        };
    }
    
    bindEvents() {
        // Formulário de cotação
        if (this.quoteForm) {
            this.quoteForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        // Máscaras de input
        this.setupInputMasks();
        
        // Validação em tempo real
        this.setupRealTimeValidation();
        
        // Smooth scroll para seções
        this.setupSmoothScroll();
        
        // Fechar modais
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal);
            });
        });
        
        // Clique fora do modal
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });
    }
    
    setupInputMasks() {
        // Máscara para CNPJ
        if (this.formFields.cnpj) {
            this.formFields.cnpj.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/^(\d{2})(\d)/, '$1.$2');
                value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
                value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
                value = value.replace(/(\d{4})(\d)/, '$1-$2');
                e.target.value = value;
            });
        }
        
        // Máscara para telefone
        if (this.formFields.phone) {
            this.formFields.phone.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/^(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
                e.target.value = value;
            });
        }
    }
    
    setupRealTimeValidation() {
        Object.keys(this.formFields).forEach(fieldName => {
            const field = this.formFields[fieldName];
            if (field) {
                field.addEventListener('blur', () => this.validateField(fieldName));
                field.addEventListener('input', () => this.clearFieldError(fieldName));
            }
        });
        
        // Validação de email
        if (this.formFields.email) {
            this.formFields.email.addEventListener('blur', () => {
                this.validateEmail();
            });
        }
        
        // Validação de CNPJ
        if (this.formFields.cnpj) {
            this.formFields.cnpj.addEventListener('blur', () => {
                this.validateCNPJ();
            });
        }
    }
    
    setupSmoothScroll() {
        // Adicionar comportamento de scroll suave para links internos
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    initializeAnimations() {
        // Animações de entrada para elementos
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observar elementos para animação
        document.querySelectorAll('.benefit-card, .solution-card, .story-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });
    }
    
    validateField(fieldName) {
        const field = this.formFields[fieldName];
        if (!field) return true;
        
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Validação básica de campo obrigatório
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Este campo é obrigatório';
        }
        
        // Validações específicas
        switch (fieldName) {
            case 'companyName':
                if (value && value.length < 2) {
                    isValid = false;
                    errorMessage = 'Nome da empresa deve ter pelo menos 2 caracteres';
                }
                break;
                
            case 'contactName':
                if (value && value.length < 2) {
                    isValid = false;
                    errorMessage = 'Nome deve ter pelo menos 2 caracteres';
                }
                break;
        }
        
        this.showFieldError(field, isValid ? null : errorMessage);
        return isValid;
    }
    
    validateEmail() {
        const field = this.formFields.email;
        if (!field) return true;
        
        const email = field.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        let isValid = true;
        let errorMessage = '';
        
        if (field.hasAttribute('required') && !email) {
            isValid = false;
            errorMessage = 'E-mail é obrigatório';
        } else if (email && !emailRegex.test(email)) {
            isValid = false;
            errorMessage = 'E-mail inválido';
        }
        
        this.showFieldError(field, isValid ? null : errorMessage);
        return isValid;
    }
    
    validateCNPJ() {
        const field = this.formFields.cnpj;
        if (!field) return true;
        
        const cnpj = field.value.replace(/\D/g, '');
        
        let isValid = true;
        let errorMessage = '';
        
        if (field.hasAttribute('required') && !cnpj) {
            isValid = false;
            errorMessage = 'CNPJ é obrigatório';
        } else if (cnpj && cnpj.length !== 14) {
            isValid = false;
            errorMessage = 'CNPJ deve ter 14 dígitos';
        }
        
        this.showFieldError(field, isValid ? null : errorMessage);
        return isValid;
    }
    
    showFieldError(field, errorMessage) {
        // Remover erro anterior
        this.clearFieldError(field);
        
        if (errorMessage) {
            field.style.borderColor = '#EF4444';
            
            const errorEl = document.createElement('div');
            errorEl.className = 'field-error';
            errorEl.textContent = errorMessage;
            errorEl.style.cssText = `
                color: #EF4444;
                font-size: 0.8rem;
                margin-top: 5px;
                animation: slideDown 0.3s ease;
            `;
            
            field.parentNode.appendChild(errorEl);
        } else {
            field.style.borderColor = '#10B981';
        }
    }
    
    clearFieldError(field) {
        if (typeof field === 'string') {
            field = this.formFields[field];
        }
        
        if (field) {
            field.style.borderColor = '';
            const errorEl = field.parentNode.querySelector('.field-error');
            if (errorEl) {
                errorEl.remove();
            }
        }
    }
    
    validateForm() {
        let isValid = true;
        
        // Validar todos os campos
        Object.keys(this.formFields).forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                isValid = false;
            }
        });
        
        // Validações específicas
        if (!this.validateEmail()) isValid = false;
        if (!this.validateCNPJ()) isValid = false;
        
        // Validar checkboxes de interesse
        const interests = document.querySelectorAll('input[name="interests"]:checked');
        if (interests.length === 0) {
            isValid = false;
            this.showNotification('Selecione pelo menos uma área de interesse', 'error');
        }
        
        // Validar política de privacidade
        const privacy = document.querySelector('input[name="privacy"]');
        if (privacy && !privacy.checked) {
            isValid = false;
            this.showNotification('Você deve aceitar os termos de uso e política de privacidade', 'error');
        }
        
        return isValid;
    }
    
    async handleFormSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }
        
        // Mostrar loading
        this.setSubmitLoading(true);
        
        try {
            // Coletar dados do formulário
            const formData = new FormData(this.quoteForm);
            const data = Object.fromEntries(formData.entries());
            
            // Coletar interesses selecionados
            const interests = Array.from(document.querySelectorAll('input[name="interests"]:checked'))
                .map(cb => cb.value);
            data.interests = interests;
            
            // Adicionar plano selecionado se houver
            if (this.selectedPlan) {
                data.selectedPlan = this.selectedPlan;
            }
            
            // Simular envio (em produção, enviar para API)
            await this.submitQuote(data);
            
            // Mostrar sucesso
            this.showSuccessModal();
            this.resetForm();
            
        } catch (error) {
            console.error('Erro ao enviar cotação:', error);
            this.showNotification('Erro ao enviar solicitação. Tente novamente.', 'error');
        } finally {
            this.setSubmitLoading(false);
        }
    }
    
    async submitQuote(data) {
        // Simular delay de envio
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Em produção, fazer requisição para API
        console.log('Dados da cotação:', data);
        
        // Salvar no localStorage para demonstração
        const quotes = JSON.parse(localStorage.getItem('institutionalQuotes') || '[]');
        quotes.push({
            ...data,
            id: Date.now(),
            timestamp: new Date().toISOString(),
            status: 'pending'
        });
        localStorage.setItem('institutionalQuotes', JSON.stringify(quotes));
        
        return { success: true };
    }
    
    setSubmitLoading(loading) {
        if (!this.submitBtn) return;
        
        const btnText = this.submitBtn.querySelector('.btn-text');
        const btnLoading = this.submitBtn.querySelector('.btn-loading');
        
        if (loading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline-flex';
            this.submitBtn.disabled = true;
        } else {
            btnText.style.display = 'inline-flex';
            btnLoading.style.display = 'none';
            this.submitBtn.disabled = false;
        }
    }
    
    resetForm() {
        if (this.quoteForm) {
            this.quoteForm.reset();
            
            // Limpar erros
            Object.keys(this.formFields).forEach(fieldName => {
                this.clearFieldError(fieldName);
            });
        }
    }
    
    showSuccessModal() {
        if (this.successModal) {
            this.successModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    selectPlan(planType) {
        this.selectedPlan = planType;
        
        // Scroll para formulário
        this.scrollToQuote();
        
        // Destacar plano selecionado
        document.querySelectorAll('.solution-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`.solution-card.${planType}`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        // Mostrar notificação
        const planNames = {
            starter: 'Starter',
            professional: 'Professional',
            enterprise: 'Enterprise'
        };
        
        this.showNotification(`Plano ${planNames[planType]} selecionado! Preencha o formulário abaixo.`, 'success');
    }
    
    scrollToQuote() {
        const quoteSection = document.getElementById('quote');
        if (quoteSection) {
            quoteSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    scrollToSolutions() {
        const solutionsSection = document.getElementById('solutions');
        if (solutionsSection) {
            solutionsSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    openWhatsApp() {
        const message = encodeURIComponent(
            'Olá! Gostaria de saber mais sobre as soluções corporativas do Instituto Buriti.'
        );
        const whatsappUrl = `https://wa.me/5511999999999?text=${message}`;
        window.open(whatsappUrl, '_blank');
    }
    
    showNotification(message, type = 'info') {
        // Remover notificação anterior se existir
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Criar nova notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const colors = {
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#3B82F6'
        };
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icons[type]}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // Remover após 5 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Instância global
let institutionalSales;

// Funções globais para compatibilidade
function initializeInstitutionalSales() {
    institutionalSales = new InstitutionalSales();
}

function selectPlan(planType) {
    if (institutionalSales) {
        institutionalSales.selectPlan(planType);
    }
}

function scrollToQuote() {
    if (institutionalSales) {
        institutionalSales.scrollToQuote();
    }
}

function scrollToSolutions() {
    if (institutionalSales) {
        institutionalSales.scrollToSolutions();
    }
}

function openWhatsApp() {
    if (institutionalSales) {
        institutionalSales.openWhatsApp();
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal && institutionalSales) {
        institutionalSales.closeModal(modal);
    }
}

// Adicionar estilos para notificações e animações
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-icon {
        font-size: 1.2rem;
        flex-shrink: 0;
    }
    
    .notification-message {
        font-weight: 600;
        line-height: 1.4;
    }
    
    .solution-card.selected {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(151, 60, 191, 0.2);
        transform: translateY(-5px);
    }
    
    .solution-card.selected .solution-btn {
        background: linear-gradient(135deg, var(--secondary-color), #FFA500);
        color: var(--text-primary);
    }
`;
document.head.appendChild(notificationStyles);

