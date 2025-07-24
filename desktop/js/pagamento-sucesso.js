/**
 * Payment Success JavaScript - Instituto Buriti
 * Gerencia a página de sucesso de pagamento
 */

class PaymentSuccessManager {
    constructor() {
        this.transactionData = {};
        this.init();
    }
    
    init() {
        this.loadTransactionData();
        this.updatePageContent();
        this.setupEventListeners();
        this.startSuccessAnimations();
        this.sendConfirmationEmail();
    }
    
    loadTransactionData() {
        // Carregar dados da transação da URL
        const urlParams = new URLSearchParams(window.location.search);
        
        this.transactionData = {
            orderNumber: this.generateOrderNumber(),
            courseId: urlParams.get('course') || 'ia-fundamentos',
            amount: parseFloat(urlParams.get('amount')) || 199.90,
            paymentMethod: urlParams.get('method') || 'credit-card',
            couponCode: urlParams.get('coupon') || '',
            paymentDate: new Date(),
            customerEmail: this.getCustomerEmail()
        };
        
        // Salvar no localStorage para futuras referências
        localStorage.setItem('lastTransaction', JSON.stringify(this.transactionData));
    }
    
    generateOrderNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        
        return `#IB-${year}${month}${day}-${random}`;
    }
    
    getCustomerEmail() {
        // Tentar obter email do usuário logado ou localStorage
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
    
    updatePageContent() {
        // Atualizar número do pedido
        document.getElementById('orderNumber').textContent = this.transactionData.orderNumber;
        
        // Atualizar valor pago
        const formattedAmount = `R$ ${this.transactionData.amount.toFixed(2).replace('.', ',')}`;
        document.getElementById('paidAmount').textContent = formattedAmount;
        
        // Atualizar data do pagamento
        const formattedDate = this.formatDate(this.transactionData.paymentDate);
        document.getElementById('paymentDate').textContent = formattedDate;
        
        // Atualizar informações do curso
        this.updateCourseInfo();
        
        // Atualizar links com parâmetros do curso
        this.updateCourseLinks();
    }
    
    updateCourseInfo() {
        const courses = {
            'ia-fundamentos': {
                title: 'Fundamentos da Inteligência Artificial',
                instructor: 'Dr. Carlos Mendes',
                image: '/upload/ChatGPTImage19dejul.de2025,19_04_54.png'
            },
            'gestao-cultural': {
                title: 'Gestão de Projetos Culturais',
                instructor: 'Maria Santos',
                image: '/upload/IMG_F027CED18C1C-1.jpeg'
            },
            'educacao-inclusiva': {
                title: 'Educação Especial na Perspectiva Inclusiva',
                instructor: 'Prof. Ana Oliveira',
                image: '/upload/IMG_65A477CACFA8-1.jpeg'
            }
        };
        
        const course = courses[this.transactionData.courseId] || courses['ia-fundamentos'];
        
        document.getElementById('courseTitle').textContent = course.title;
        document.getElementById('courseInstructor').textContent = course.instructor;
        document.getElementById('courseImage').src = course.image;
    }
    
    updateCourseLinks() {
        // Atualizar links para incluir o ID do curso
        const courseLinks = document.querySelectorAll('a[href*="curso-template.html"]');
        courseLinks.forEach(link => {
            const url = new URL(link.href, window.location.origin);
            url.searchParams.set('course', this.transactionData.courseId);
            link.href = url.toString();
        });
        
        // Atualizar links de checkout para cursos recomendados
        const checkoutLinks = document.querySelectorAll('a[href*="checkout.html"]');
        checkoutLinks.forEach(link => {
            // Manter parâmetros existentes
            const url = new URL(link.href, window.location.origin);
            if (!url.searchParams.has('course')) {
                url.searchParams.set('course', 'gestao-cultural');
            }
            link.href = url.toString();
        });
    }
    
    formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${day}/${month}/${year} às ${hours}:${minutes}`;
    }
    
    setupEventListeners() {
        // Adicionar eventos para compartilhamento social
        this.setupSocialSharing();
        
        // Adicionar evento para download do recibo
        this.setupReceiptDownload();
        
        // Adicionar eventos de tracking
        this.setupAnalyticsTracking();
    }
    
    setupSocialSharing() {
        // Criar botões de compartilhamento dinâmicos
        const shareButtons = document.createElement('div');
        shareButtons.className = 'social-share';
        shareButtons.innerHTML = `
            <h3>Compartilhe sua conquista!</h3>
            <div class="share-buttons">
                <button class="share-btn linkedin" data-platform="linkedin">
                    <i class="fab fa-linkedin"></i>
                    LinkedIn
                </button>
                <button class="share-btn facebook" data-platform="facebook">
                    <i class="fab fa-facebook"></i>
                    Facebook
                </button>
                <button class="share-btn twitter" data-platform="twitter">
                    <i class="fab fa-twitter"></i>
                    Twitter
                </button>
                <button class="share-btn whatsapp" data-platform="whatsapp">
                    <i class="fab fa-whatsapp"></i>
                    WhatsApp
                </button>
            </div>
        `;
        
        // Adicionar estilos
        const style = document.createElement('style');
        style.textContent = `
            .social-share {
                background: white;
                border-radius: 16px;
                padding: 2rem;
                margin: 2rem 0;
                text-align: center;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                border: 1px solid #e5e7eb;
            }
            
            .social-share h3 {
                color: #1f2937;
                margin-bottom: 1rem;
                font-size: 1.2rem;
            }
            
            .share-buttons {
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .share-btn {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                color: white;
            }
            
            .share-btn.linkedin { background: #0077b5; }
            .share-btn.facebook { background: #1877f2; }
            .share-btn.twitter { background: #1da1f2; }
            .share-btn.whatsapp { background: #25d366; }
            
            .share-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            
            @media (max-width: 768px) {
                .share-buttons {
                    flex-direction: column;
                    align-items: center;
                }
                
                .share-btn {
                    width: 200px;
                    justify-content: center;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Inserir após a seção de acesso ao curso
        const courseAccess = document.querySelector('.course-access');
        if (courseAccess) {
            courseAccess.insertAdjacentElement('afterend', shareButtons);
        }
        
        // Adicionar eventos de clique
        shareButtons.addEventListener('click', (e) => {
            if (e.target.closest('.share-btn')) {
                const platform = e.target.closest('.share-btn').dataset.platform;
                this.shareOnSocial(platform);
            }
        });
    }
    
    shareOnSocial(platform) {
        const course = document.getElementById('courseTitle').textContent;
        const message = `🎉 Acabei de me matricular no curso "${course}" no Instituto Buriti! Educação que transforma. #InstitutoBuriti #Educacao`;
        const url = window.location.origin;
        
        const shareUrls = {
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(message)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(message + ' ' + url)}`
        };
        
        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
    }
    
    setupReceiptDownload() {
        // Criar botão de download do recibo
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'btn-secondary';
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Baixar Recibo';
        downloadBtn.style.marginTop = '1rem';
        
        downloadBtn.addEventListener('click', () => {
            this.generateReceipt();
        });
        
        // Adicionar após os botões de ação
        const accessActions = document.querySelector('.access-actions');
        if (accessActions) {
            accessActions.appendChild(downloadBtn);
        }
    }
    
    generateReceipt() {
        const receiptData = {
            orderNumber: this.transactionData.orderNumber,
            date: this.formatDate(this.transactionData.paymentDate),
            course: document.getElementById('courseTitle').textContent,
            instructor: document.getElementById('courseInstructor').textContent,
            amount: document.getElementById('paidAmount').textContent,
            method: this.getPaymentMethodName(),
            customer: this.transactionData.customerEmail
        };
        
        // Criar conteúdo do recibo
        const receiptContent = `
            INSTITUTO BURITI - RECIBO DE PAGAMENTO
            =====================================
            
            Pedido: ${receiptData.orderNumber}
            Data: ${receiptData.date}
            
            CURSO ADQUIRIDO:
            ${receiptData.course}
            Instrutor: ${receiptData.instructor}
            
            PAGAMENTO:
            Valor: ${receiptData.amount}
            Método: ${receiptData.method}
            
            CLIENTE:
            Email: ${receiptData.customer}
            
            =====================================
            Instituto Buriti - Educação que transforma
            contato@institutoburiti.com.br
            (11) 99999-9999
        `;
        
        // Criar e baixar arquivo
        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recibo-${this.transactionData.orderNumber.replace('#', '')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Recibo baixado com sucesso!', 'success');
    }
    
    getPaymentMethodName() {
        const methods = {
            'credit-card': 'Cartão de Crédito',
            'pix': 'PIX',
            'boleto': 'Boleto Bancário'
        };
        
        return methods[this.transactionData.paymentMethod] || 'Cartão de Crédito';
    }
    
    setupAnalyticsTracking() {
        // Simular eventos de analytics
        this.trackPurchaseEvent();
        this.trackPageView();
    }
    
    trackPurchaseEvent() {
        // Simular tracking de compra para analytics
        const purchaseData = {
            transaction_id: this.transactionData.orderNumber,
            value: this.transactionData.amount,
            currency: 'BRL',
            items: [{
                item_id: this.transactionData.courseId,
                item_name: document.getElementById('courseTitle').textContent,
                category: 'Curso Online',
                quantity: 1,
                price: this.transactionData.amount
            }]
        };
        
        console.log('Purchase tracked:', purchaseData);
        
        // Aqui você integraria com Google Analytics, Facebook Pixel, etc.
        // gtag('event', 'purchase', purchaseData);
    }
    
    trackPageView() {
        // Simular tracking de visualização de página
        console.log('Page view tracked: Payment Success');
        
        // Aqui você integraria com suas ferramentas de analytics
        // gtag('config', 'GA_MEASUREMENT_ID', { page_title: 'Payment Success' });
    }
    
    startSuccessAnimations() {
        // Animar elementos da página
        setTimeout(() => {
            this.animateSuccessElements();
        }, 500);
        
        // Animar confetti
        setTimeout(() => {
            this.startConfettiAnimation();
        }, 1000);
    }
    
    animateSuccessElements() {
        const elements = document.querySelectorAll('.detail-card, .step-card, .course-card');
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(20px)';
                element.style.transition = 'all 0.6s ease';
                
                setTimeout(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, 100);
            }, index * 200);
        });
    }
    
    startConfettiAnimation() {
        const confettiPieces = document.querySelectorAll('.confetti-piece');
        confettiPieces.forEach((piece, index) => {
            setTimeout(() => {
                piece.style.animation = `confetti-fall 3s infinite`;
                piece.style.animationDelay = `${index * 0.5}s`;
            }, index * 100);
        });
    }
    
    async sendConfirmationEmail() {
        // Simular envio de email de confirmação
        try {
            const emailData = {
                to: this.transactionData.customerEmail,
                subject: `Confirmação de Compra - ${this.transactionData.orderNumber}`,
                course: document.getElementById('courseTitle').textContent,
                amount: this.transactionData.amount,
                orderNumber: this.transactionData.orderNumber
            };
            
            // Simular chamada para API de email
            console.log('Sending confirmation email:', emailData);
            
            // Aqui você faria a chamada real para sua API
            // await fetch('/api/send-confirmation-email', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(emailData)
            // });
            
            // Simular sucesso
            setTimeout(() => {
                this.showNotification('Email de confirmação enviado!', 'success');
            }, 2000);
            
        } catch (error) {
            console.error('Error sending confirmation email:', error);
        }
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
        
        // Remover após 4 segundos
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
    new PaymentSuccessManager();
});

// Adicionar estilos dinâmicos
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

