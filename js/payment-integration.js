/**
 * Integração de Pagamentos - Instituto Buriti
 * Sistema completo de checkout e processamento de pagamentos
 */

class PaymentIntegration {
    constructor() {
        this.apiClient = window.apiClient;
        this.currentPayment = null;
        this.paymentMethods = [];
    }

    // Inicializar sistema de pagamento
    async init() {
        try {
            await this.loadPaymentMethods();
            this.setupEventListeners();
        } catch (error) {
            console.error('Erro ao inicializar sistema de pagamento:', error);
        }
    }

    // Carregar métodos de pagamento disponíveis
    async loadPaymentMethods() {
        try {
            const response = await fetch('https://5002-ipafj8spwnkxxeryczx5i-b12bc5d0.manusvm.computer/api/payments/payment-methods');
            const data = await response.json();
            
            if (data.success) {
                this.paymentMethods = data.payment_methods;
                return this.paymentMethods;
            }
            throw new Error('Erro ao carregar métodos de pagamento');
        } catch (error) {
            console.error('Erro ao carregar métodos de pagamento:', error);
            return [];
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Adicionar botões de "Comprar" nos cursos
        this.addBuyButtonsToCourses();
        
        // Configurar formulários de pagamento
        this.setupPaymentForms();
    }

    // Adicionar botões de compra aos cursos
    addBuyButtonsToCourses() {
        const courseCards = document.querySelectorAll('.course-card, .featured-course');
        
        courseCards.forEach(card => {
            const existingButton = card.querySelector('.buy-button');
            if (existingButton) return; // Já tem botão
            
            const courseId = this.extractCourseId(card);
            const price = this.extractCoursePrice(card);
            
            if (courseId && price) {
                const buyButton = this.createBuyButton(courseId, price);
                
                // Inserir botão no local apropriado
                const buttonContainer = card.querySelector('.course-actions') || 
                                      card.querySelector('.course-footer') ||
                                      card;
                
                buttonContainer.appendChild(buyButton);
            }
        });
    }

    // Extrair ID do curso do card
    extractCourseId(card) {
        // Tentar diferentes métodos para identificar o curso
        const titleElement = card.querySelector('h3, .course-title, .featured-title');
        if (!titleElement) return null;
        
        const title = titleElement.textContent.toLowerCase();
        
        // Mapear títulos para IDs
        const titleToId = {
            'fundamentos da inteligência artificial': 'ia-fundamentals',
            'desenvolvimento web completo': 'web-development',
            'design gráfico profissional': 'graphic-design',
            'gestão eficaz de projetos culturais': 'project-management',
            'empreendedorismo digital': 'digital-entrepreneurship',
            'ux/ui design mobile': 'mobile-design',
            'python para iniciantes': 'python-basics',
            'história da música brasileira': 'brazilian-music'
        };
        
        for (const [titleKey, id] of Object.entries(titleToId)) {
            if (title.includes(titleKey)) {
                return id;
            }
        }
        
        return null;
    }

    // Extrair preço do curso
    extractCoursePrice(card) {
        const priceElement = card.querySelector('.course-price, .price, .featured-price');
        if (!priceElement) return null;
        
        const priceText = priceElement.textContent;
        const priceMatch = priceText.match(/R\$\s*([\d,]+\.?\d*)/);
        
        if (priceMatch) {
            return parseFloat(priceMatch[1].replace(',', '.'));
        }
        
        return null;
    }

    // Criar botão de compra
    createBuyButton(courseId, price) {
        const button = document.createElement('button');
        button.className = 'buy-button';
        button.innerHTML = '🛒 Comprar Agora';
        button.style.cssText = `
            background: linear-gradient(135deg, #973CBF, #A95028);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 10px;
            width: 100%;
            transition: all 0.3s ease;
        `;
        
        button.onmouseover = () => {
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 4px 15px rgba(151, 60, 191, 0.3)';
        };
        
        button.onmouseout = () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = 'none';
        };
        
        button.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.redirectToCheckout(courseId);
        };
        
        return button;
    }

    // Redirecionar para checkout
    redirectToCheckout(courseId) {
        // Verificar se usuário está logado
        if (!this.apiClient.isAuthenticated()) {
            if (confirm('Você precisa estar logado para comprar um curso. Deseja fazer login agora?')) {
                window.location.href = `pages/login.html?redirect=checkout&course_id=${courseId}`;
            }
            return;
        }
        
        // Redirecionar para página de checkout
        window.location.href = `pages/checkout.html?course_id=${courseId}`;
    }

    // Processar pagamento
    async processPayment(paymentData) {
        try {
            const response = await this.apiClient.makeRequest('/payments/create-payment', {
                method: 'POST',
                body: JSON.stringify(paymentData)
            });

            const result = await response.json();

            if (result.success) {
                this.currentPayment = result.payment;
                return result.payment;
            } else {
                throw new Error(result.error || 'Erro ao processar pagamento');
            }
        } catch (error) {
            console.error('Erro no processamento do pagamento:', error);
            throw error;
        }
    }

    // Verificar status do pagamento
    async checkPaymentStatus(paymentId) {
        try {
            const response = await this.apiClient.makeRequest(`/payments/payment-status/${paymentId}`);
            const result = await response.json();
            
            if (result.success) {
                return result.payment;
            }
            throw new Error('Erro ao verificar status do pagamento');
        } catch (error) {
            console.error('Erro ao verificar status:', error);
            throw error;
        }
    }

    // Confirmar pagamento e processar matrícula
    async confirmPayment(paymentId) {
        try {
            const response = await this.apiClient.makeRequest('/payments/confirm-payment', {
                method: 'POST',
                body: JSON.stringify({ payment_id: paymentId })
            });

            const result = await response.json();

            if (result.success) {
                return result.enrollment;
            } else {
                throw new Error(result.error || 'Erro ao confirmar pagamento');
            }
        } catch (error) {
            console.error('Erro ao confirmar pagamento:', error);
            throw error;
        }
    }

    // Listar pagamentos do usuário
    async getMyPayments() {
        try {
            const response = await this.apiClient.makeRequest('/payments/my-payments');
            const result = await response.json();
            
            if (result.success) {
                return result.payments;
            }
            return [];
        } catch (error) {
            console.error('Erro ao carregar pagamentos:', error);
            return [];
        }
    }

    // Listar matrículas do usuário
    async getMyEnrollments() {
        try {
            const response = await this.apiClient.makeRequest('/payments/my-enrollments');
            const result = await response.json();
            
            if (result.success) {
                return result.enrollments;
            }
            return [];
        } catch (error) {
            console.error('Erro ao carregar matrículas:', error);
            return [];
        }
    }

    // Configurar formulários de pagamento
    setupPaymentForms() {
        // Configurar máscaras para cartão de crédito
        this.setupCardMasks();
        
        // Configurar validações
        this.setupValidations();
    }

    // Configurar máscaras para cartão
    setupCardMasks() {
        const cardNumberInput = document.getElementById('cardNumber');
        const cardExpiryInput = document.getElementById('cardExpiry');
        const cardCVVInput = document.getElementById('cardCVV');
        
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', function() {
                this.value = this.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
                if (this.value.length > 19) {
                    this.value = this.value.substring(0, 19);
                }
            });
        }
        
        if (cardExpiryInput) {
            cardExpiryInput.addEventListener('input', function() {
                this.value = this.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
                if (this.value.length > 5) {
                    this.value = this.value.substring(0, 5);
                }
            });
        }
        
        if (cardCVVInput) {
            cardCVVInput.addEventListener('input', function() {
                this.value = this.value.replace(/\D/g, '');
                if (this.value.length > 4) {
                    this.value = this.value.substring(0, 4);
                }
            });
        }
    }

    // Configurar validações
    setupValidations() {
        const cardForm = document.getElementById('cardForm');
        if (!cardForm) return;
        
        cardForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (this.validateCardForm()) {
                // Processar pagamento
                this.processCardPayment();
            }
        });
    }

    // Validar formulário de cartão
    validateCardForm() {
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const cardExpiry = document.getElementById('cardExpiry').value;
        const cardCVV = document.getElementById('cardCVV').value;
        const cardName = document.getElementById('cardName').value;
        
        if (cardNumber.length < 13 || cardNumber.length > 19) {
            alert('Número do cartão inválido');
            return false;
        }
        
        if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
            alert('Data de validade inválida');
            return false;
        }
        
        if (cardCVV.length < 3 || cardCVV.length > 4) {
            alert('CVV inválido');
            return false;
        }
        
        if (cardName.trim().length < 2) {
            alert('Nome no cartão é obrigatório');
            return false;
        }
        
        return true;
    }

    // Processar pagamento com cartão
    async processCardPayment() {
        const paymentData = {
            course_id: this.getCurrentCourseId(),
            amount: this.getCurrentCoursePrice(),
            payment_method: 'credit_card',
            card_info: {
                number: document.getElementById('cardNumber').value.replace(/\s/g, ''),
                expiry: document.getElementById('cardExpiry').value,
                cvv: document.getElementById('cardCVV').value,
                name: document.getElementById('cardName').value,
                installments: parseInt(document.getElementById('installments').value)
            }
        };
        
        try {
            const payment = await this.processPayment(paymentData);
            this.handlePaymentResult(payment);
        } catch (error) {
            alert('Erro ao processar pagamento: ' + error.message);
        }
    }

    // Obter ID do curso atual
    getCurrentCourseId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('course_id');
    }

    // Obter preço do curso atual
    getCurrentCoursePrice() {
        // Implementar lógica para obter preço do curso
        return 500.00; // Valor padrão
    }

    // Tratar resultado do pagamento
    handlePaymentResult(payment) {
        if (payment.status === 'approved') {
            this.showPaymentSuccess();
        } else if (payment.status === 'declined') {
            alert('Pagamento recusado. Tente novamente.');
        } else {
            this.monitorPaymentStatus(payment.payment_id);
        }
    }

    // Monitorar status do pagamento
    async monitorPaymentStatus(paymentId) {
        const checkStatus = async () => {
            try {
                const payment = await this.checkPaymentStatus(paymentId);
                
                if (payment.status === 'approved') {
                    this.showPaymentSuccess();
                    return;
                }
                
                if (payment.status === 'declined') {
                    alert('Pagamento recusado.');
                    return;
                }
                
                // Verificar novamente em 5 segundos
                setTimeout(checkStatus, 5000);
            } catch (error) {
                console.error('Erro ao verificar status:', error);
                setTimeout(checkStatus, 10000);
            }
        };
        
        checkStatus();
    }

    // Mostrar sucesso do pagamento
    showPaymentSuccess() {
        const successMessage = document.getElementById('successMessage');
        if (successMessage) {
            successMessage.classList.add('active');
            document.querySelector('.checkout-container').style.display = 'none';
        } else {
            alert('Pagamento aprovado! Você já pode acessar o curso.');
            window.location.href = 'dashboard-aluno.html';
        }
    }

    // Utilitários para formatação
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR');
    }
}

// Inicializar sistema de pagamento quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    if (typeof apiClient !== 'undefined') {
        window.paymentIntegration = new PaymentIntegration();
        window.paymentIntegration.init();
    }
});

// Exportar para uso global
window.PaymentIntegration = PaymentIntegration;

