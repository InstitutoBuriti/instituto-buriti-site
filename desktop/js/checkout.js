/**
 * Checkout JavaScript - Instituto Buriti
 * Sistema completo de checkout com validações e processamento de pagamento
 */

class CheckoutManager {
    constructor() {
        this.courseData = {
            id: 'ia-fundamentos',
            title: 'Fundamentos da Inteligência Artificial',
            instructor: 'Dr. Carlos Mendes',
            originalPrice: 199.90,
            currentPrice: 199.90,
            image: '/upload/ChatGPTImage19dejul.de2025,19_04_54.png'
        };
        
        this.coupons = {
            'BURITI10': { type: 'percentage', value: 10, description: '10% de desconto' },
            'BEMVINDO': { type: 'percentage', value: 20, description: '20% de desconto' },
            'NATAL2025': { type: 'fixed', value: 50, description: 'R$ 50 de desconto' },
            'IA2025': { type: 'percentage', value: 15, description: '15% de desconto em IA' }
        };
        
        this.appliedCoupon = null;
        this.currentPaymentMethod = 'credit-card';
        
        this.init();
    }
    
    init() {
        this.loadCourseFromURL();
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupPaymentMethods();
        this.updateOrderSummary();
    }
    
    loadCourseFromURL() {
        // Carregar dados do curso da URL ou localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('course');
        
        if (courseId) {
            // Simular carregamento de dados do curso
            this.loadCourseData(courseId);
        }
        
        this.renderCourseInfo();
    }
    
    loadCourseData(courseId) {
        // Dados simulados de cursos
        const courses = {
            'ia-fundamentos': {
                id: 'ia-fundamentos',
                title: 'Fundamentos da Inteligência Artificial',
                instructor: 'Dr. Carlos Mendes',
                originalPrice: 199.90,
                image: '/upload/ChatGPTImage19dejul.de2025,19_04_54.png'
            },
            'gestao-cultural': {
                id: 'gestao-cultural',
                title: 'Gestão de Projetos Culturais',
                instructor: 'Maria Santos',
                originalPrice: 149.90,
                image: '/upload/IMG_F027CED18C1C-1.jpeg'
            },
            'educacao-inclusiva': {
                id: 'educacao-inclusiva',
                title: 'Educação Especial na Perspectiva Inclusiva',
                instructor: 'Prof. Ana Oliveira',
                originalPrice: 89.90,
                image: '/upload/IMG_65A477CACFA8-1.jpeg'
            }
        };
        
        if (courses[courseId]) {
            this.courseData = { ...courses[courseId], currentPrice: courses[courseId].originalPrice };
        }
    }
    
    renderCourseInfo() {
        document.getElementById('courseTitle').textContent = this.courseData.title;
        document.querySelector('.instructor').textContent = this.courseData.instructor;
        document.querySelector('.course-image').src = this.courseData.image;
        document.getElementById('originalPrice').textContent = `R$ ${this.courseData.originalPrice.toFixed(2).replace('.', ',')}`;
        document.getElementById('finalPrice').textContent = `R$ ${this.courseData.currentPrice.toFixed(2).replace('.', ',')}`;
    }
    
    setupEventListeners() {
        // Cupom de desconto
        document.getElementById('applyCoupon').addEventListener('click', () => this.applyCoupon());
        document.getElementById('couponCode').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.applyCoupon();
        });
        
        // Cupons populares
        document.querySelectorAll('.coupon-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const coupon = tag.dataset.coupon;
                document.getElementById('couponCode').value = coupon;
                this.applyCoupon();
            });
        });
        
        // CEP lookup
        document.getElementById('cep').addEventListener('blur', () => this.lookupCEP());
        
        // Termos de uso
        document.getElementById('acceptTerms').addEventListener('change', () => this.updatePurchaseButton());
        
        // Botão de finalizar compra
        document.getElementById('finalizePurchase').addEventListener('click', () => this.processPurchase());
        
        // Auto-preenchimento de teste
        this.addTestDataButton();
    }
    
    addTestDataButton() {
        // Adicionar botão de preenchimento automático para testes
        const billingSection = document.querySelector('.billing-section h3');
        const testButton = document.createElement('button');
        testButton.type = 'button';
        testButton.className = 'test-fill-btn';
        testButton.innerHTML = '<i class="fas fa-magic"></i> Preencher Dados de Teste';
        testButton.style.cssText = `
            background: #10b981;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-size: 0.8rem;
            cursor: pointer;
            margin-left: 1rem;
            transition: all 0.3s ease;
        `;
        
        testButton.addEventListener('click', () => this.fillTestData());
        testButton.addEventListener('mouseenter', () => {
            testButton.style.background = '#059669';
            testButton.style.transform = 'translateY(-1px)';
        });
        testButton.addEventListener('mouseleave', () => {
            testButton.style.background = '#10b981';
            testButton.style.transform = 'translateY(0)';
        });
        
        billingSection.appendChild(testButton);
    }
    
    fillTestData() {
        const testData = {
            fullName: 'Ana Silva Santos',
            email: 'ana.silva@teste.com',
            cpf: '123.456.789-00',
            phone: '(11) 99999-9999',
            cep: '01310-100',
            address: 'Avenida Paulista',
            number: '1000',
            complement: 'Apto 101',
            city: 'São Paulo',
            state: 'SP'
        };
        
        Object.keys(testData).forEach(key => {
            const field = document.getElementById(key);
            if (field) {
                field.value = testData[key];
                this.validateField(field);
            }
        });
        
        // Preencher dados do cartão
        if (this.currentPaymentMethod === 'credit-card') {
            document.getElementById('cardNumber').value = '4111 1111 1111 1111';
            document.getElementById('cardExpiry').value = '12/30';
            document.getElementById('cardCvv').value = '123';
            document.getElementById('cardName').value = 'ANA SILVA SANTOS';
        }
        
        // Aceitar termos
        document.getElementById('acceptTerms').checked = true;
        this.updatePurchaseButton();
        
        this.showNotification('Dados de teste preenchidos!', 'success');
    }
    
    setupFormValidation() {
        const form = document.getElementById('checkoutForm');
        const inputs = form.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
        
        // Máscaras de entrada
        this.setupInputMasks();
    }
    
    setupInputMasks() {
        // Máscara CPF
        document.getElementById('cpf').addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        });
        
        // Máscara telefone
        document.getElementById('phone').addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = value;
        });
        
        // Máscara CEP
        document.getElementById('cep').addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = value;
        });
        
        // Máscara cartão de crédito
        document.getElementById('cardNumber').addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})(\d)/, '$1 $2');
            value = value.replace(/(\d{4})(\d)/, '$1 $2');
            value = value.replace(/(\d{4})(\d)/, '$1 $2');
            e.target.value = value;
        });
        
        // Máscara validade cartão
        document.getElementById('cardExpiry').addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{2})(\d)/, '$1/$2');
            e.target.value = value;
        });
        
        // Máscara CVV
        document.getElementById('cardCvv').addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Validação por tipo de campo
        switch (field.id) {
            case 'fullName':
                if (!value || value.length < 3) {
                    isValid = false;
                    errorMessage = 'Nome deve ter pelo menos 3 caracteres';
                }
                break;
                
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value || !emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Email inválido';
                }
                break;
                
            case 'cpf':
                if (!this.validateCPF(value)) {
                    isValid = false;
                    errorMessage = 'CPF inválido';
                }
                break;
                
            case 'phone':
                const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
                if (!value || !phoneRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Telefone inválido';
                }
                break;
                
            case 'cep':
                const cepRegex = /^\d{5}-\d{3}$/;
                if (!value || !cepRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'CEP inválido';
                }
                break;
                
            case 'cardNumber':
                if (!this.validateCardNumber(value)) {
                    isValid = false;
                    errorMessage = 'Número do cartão inválido';
                }
                break;
                
            case 'cardExpiry':
                if (!this.validateCardExpiry(value)) {
                    isValid = false;
                    errorMessage = 'Data de validade inválida';
                }
                break;
                
            case 'cardCvv':
                if (!value || value.length < 3) {
                    isValid = false;
                    errorMessage = 'CVV inválido';
                }
                break;
                
            default:
                if (field.hasAttribute('required') && !value) {
                    isValid = false;
                    errorMessage = 'Campo obrigatório';
                }
        }
        
        this.showFieldError(field, isValid, errorMessage);
        return isValid;
    }
    
    validateCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11) return false;
        
        // Verificar se todos os dígitos são iguais
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        
        // Validar dígitos verificadores
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let digit1 = 11 - (sum % 11);
        if (digit1 > 9) digit1 = 0;
        
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        let digit2 = 11 - (sum % 11);
        if (digit2 > 9) digit2 = 0;
        
        return digit1 === parseInt(cpf.charAt(9)) && digit2 === parseInt(cpf.charAt(10));
    }
    
    validateCardNumber(cardNumber) {
        const number = cardNumber.replace(/\s/g, '');
        if (!/^\d{13,19}$/.test(number)) return false;
        
        // Algoritmo de Luhn
        let sum = 0;
        let isEven = false;
        
        for (let i = number.length - 1; i >= 0; i--) {
            let digit = parseInt(number.charAt(i));
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    }
    
    validateCardExpiry(expiry) {
        const match = expiry.match(/^(\d{2})\/(\d{2})$/);
        if (!match) return false;
        
        const month = parseInt(match[1]);
        const year = parseInt('20' + match[2]);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        
        if (month < 1 || month > 12) return false;
        if (year < currentYear || (year === currentYear && month < currentMonth)) return false;
        
        return true;
    }
    
    showFieldError(field, isValid, errorMessage) {
        const errorElement = field.parentNode.querySelector('.error-message');
        
        if (isValid) {
            field.classList.remove('error');
            errorElement.classList.remove('show');
        } else {
            field.classList.add('error');
            errorElement.textContent = errorMessage;
            errorElement.classList.add('show');
        }
    }
    
    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }
    
    async lookupCEP() {
        const cep = document.getElementById('cep').value.replace(/\D/g, '');
        if (cep.length !== 8) return;
        
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            
            if (!data.erro) {
                document.getElementById('address').value = data.logradouro;
                document.getElementById('city').value = data.localidade;
                document.getElementById('state').value = data.uf;
                
                // Focar no campo número
                document.getElementById('number').focus();
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        }
    }
    
    applyCoupon() {
        const couponCode = document.getElementById('couponCode').value.trim().toUpperCase();
        const messageElement = document.getElementById('couponMessage');
        
        if (!couponCode) {
            this.showCouponMessage('Digite um código de cupom', 'error');
            return;
        }
        
        if (this.coupons[couponCode]) {
            const coupon = this.coupons[couponCode];
            this.appliedCoupon = { code: couponCode, ...coupon };
            
            this.calculateDiscount();
            this.updateOrderSummary();
            this.showCouponMessage(`Cupom aplicado: ${coupon.description}`, 'success');
        } else {
            this.showCouponMessage('Cupom inválido ou expirado', 'error');
        }
    }
    
    calculateDiscount() {
        if (!this.appliedCoupon) return;
        
        const originalPrice = this.courseData.originalPrice;
        let discount = 0;
        
        if (this.appliedCoupon.type === 'percentage') {
            discount = originalPrice * (this.appliedCoupon.value / 100);
        } else if (this.appliedCoupon.type === 'fixed') {
            discount = Math.min(this.appliedCoupon.value, originalPrice);
        }
        
        this.courseData.currentPrice = Math.max(0, originalPrice - discount);
        this.courseData.discount = discount;
    }
    
    showCouponMessage(message, type) {
        const messageElement = document.getElementById('couponMessage');
        messageElement.textContent = message;
        messageElement.className = `coupon-message ${type}`;
    }
    
    setupPaymentMethods() {
        const methods = document.querySelectorAll('.payment-method');
        const forms = document.querySelectorAll('.payment-form');
        
        methods.forEach(method => {
            method.addEventListener('click', () => {
                // Remover classe active de todos
                methods.forEach(m => m.classList.remove('active'));
                forms.forEach(f => f.classList.add('hidden'));
                
                // Ativar método selecionado
                method.classList.add('active');
                this.currentPaymentMethod = method.dataset.method;
                
                // Mostrar formulário correspondente
                const formId = `${this.currentPaymentMethod.replace('-', '')}Form`;
                const form = document.getElementById(formId);
                if (form) {
                    form.classList.remove('hidden');
                }
                
                this.updateInstallments();
            });
        });
    }
    
    updateInstallments() {
        const installmentsSelect = document.getElementById('installments');
        if (!installmentsSelect) return;
        
        const price = this.courseData.currentPrice;
        const options = [
            { value: 1, text: `1x de R$ ${price.toFixed(2).replace('.', ',')} sem juros` },
            { value: 2, text: `2x de R$ ${(price / 2).toFixed(2).replace('.', ',')} sem juros` },
            { value: 3, text: `3x de R$ ${(price / 3).toFixed(2).replace('.', ',')} sem juros` },
            { value: 6, text: `6x de R$ ${(price / 6).toFixed(2).replace('.', ',')} sem juros` },
            { value: 12, text: `12x de R$ ${(price * 1.1 / 12).toFixed(2).replace('.', ',')} com juros` }
        ];
        
        installmentsSelect.innerHTML = '';
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            installmentsSelect.appendChild(optionElement);
        });
    }
    
    updateOrderSummary() {
        const subtotal = this.courseData.originalPrice;
        const discount = this.courseData.discount || 0;
        const total = this.courseData.currentPrice;
        
        document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        document.getElementById('totalAmount').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        
        const discountLine = document.getElementById('discountLine');
        const discountAmount = document.getElementById('discountAmount');
        
        if (discount > 0) {
            discountLine.classList.remove('hidden');
            discountAmount.textContent = `-R$ ${discount.toFixed(2).replace('.', ',')}`;
        } else {
            discountLine.classList.add('hidden');
        }
        
        // Atualizar preço final no resumo do curso
        document.getElementById('finalPrice').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        
        // Atualizar parcelamento
        this.updateInstallments();
    }
    
    updatePurchaseButton() {
        const termsAccepted = document.getElementById('acceptTerms').checked;
        const button = document.getElementById('finalizePurchase');
        
        button.disabled = !termsAccepted;
    }
    
    async processPurchase() {
        if (!this.validateForm()) {
            this.showNotification('Por favor, corrija os erros no formulário', 'error');
            return;
        }
        
        const button = document.getElementById('finalizePurchase');
        const buttonText = button.querySelector('span');
        const buttonLoading = button.querySelector('.btn-loading');
        
        // Mostrar loading
        button.disabled = true;
        buttonText.style.display = 'none';
        buttonLoading.classList.remove('hidden');
        
        try {
            // Simular processamento de pagamento
            await this.simulatePaymentProcessing();
            
            // Redirecionar para página de sucesso
            const params = new URLSearchParams({
                course: this.courseData.id,
                amount: this.courseData.currentPrice.toFixed(2),
                method: this.currentPaymentMethod,
                coupon: this.appliedCoupon?.code || ''
            });
            
            window.location.href = `pagamento-sucesso.html?${params.toString()}`;
            
        } catch (error) {
            console.error('Erro no pagamento:', error);
            
            // Redirecionar para página de erro
            const params = new URLSearchParams({
                error: 'payment_failed',
                message: 'Falha no processamento do pagamento'
            });
            
            window.location.href = `pagamento-erro.html?${params.toString()}`;
        } finally {
            // Restaurar botão
            button.disabled = false;
            buttonText.style.display = 'inline';
            buttonLoading.classList.add('hidden');
        }
    }
    
    async simulatePaymentProcessing() {
        // Simular tempo de processamento
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simular sucesso/falha (90% sucesso)
        if (Math.random() < 0.9) {
            return { success: true };
        } else {
            throw new Error('Payment failed');
        }
    }
    
    validateForm() {
        const form = document.getElementById('checkoutForm');
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        // Validar campos específicos do método de pagamento
        if (this.currentPaymentMethod === 'credit-card') {
            const cardFields = ['cardNumber', 'cardExpiry', 'cardCvv', 'cardName'];
            cardFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field && !this.validateField(field)) {
                    isValid = false;
                }
            });
        }
        
        return isValid;
    }
    
    showNotification(message, type = 'info') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Estilos da notificação
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        notification.querySelector('.notification-content').style.cssText = `
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new CheckoutManager();
});

// Adicionar estilos dinâmicos para notificações
const style = document.createElement('style');
style.textContent = `
    .notification {
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
        font-weight: 500;
    }
    
    .notification i {
        font-size: 1.1rem;
    }
    
    @media (max-width: 768px) {
        .notification {
            right: 10px;
            left: 10px;
            transform: translateY(-100%);
        }
        
        .notification.show {
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

