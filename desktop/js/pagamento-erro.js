/**
 * Payment Error JavaScript - Instituto Buriti
 * Gerencia a página de erro de pagamento
 */

class PaymentErrorManager {
    constructor() {
        this.errorData = {};
        this.retryCount = 0;
        this.maxRetries = 3;
        this.init();
    }
    
    init() {
        this.loadErrorData();
        this.updatePageContent();
        this.setupEventListeners();
        this.startErrorAnimations();
        this.logErrorEvent();
        this.setupRetryMechanism();
    }
    
    loadErrorData() {
        // Carregar dados do erro da URL
        const urlParams = new URLSearchParams(window.location.search);
        
        this.errorData = {
            errorCode: urlParams.get('error') || 'PAY_001',
            errorMessage: urlParams.get('message') || 'Falha na comunicação com o processador de pagamento',
            courseId: urlParams.get('course') || 'ia-fundamentos',
            amount: parseFloat(urlParams.get('amount')) || 199.90,
            paymentMethod: urlParams.get('method') || 'credit-card',
            errorTime: new Date(),
            sessionId: this.generateSessionId()
        };
        
        // Salvar no localStorage para análise
        this.saveErrorLog();
    }
    
    generateSessionId() {
        return 'sess_' + Math.random().toString(36).substr(2, 9);
    }
    
    saveErrorLog() {
        const errorLog = {
            ...this.errorData,
            userAgent: navigator.userAgent,
            timestamp: this.errorData.errorTime.toISOString(),
            url: window.location.href,
            referrer: document.referrer
        };
        
        // Salvar no localStorage
        const existingLogs = JSON.parse(localStorage.getItem('paymentErrorLogs') || '[]');
        existingLogs.push(errorLog);
        
        // Manter apenas os últimos 10 logs
        if (existingLogs.length > 10) {
            existingLogs.splice(0, existingLogs.length - 10);
        }
        
        localStorage.setItem('paymentErrorLogs', JSON.stringify(existingLogs));
    }
    
    updatePageContent() {
        // Atualizar código do erro
        document.getElementById('errorCode').textContent = this.errorData.errorCode;
        
        // Atualizar mensagem de erro
        document.getElementById('errorMessage').textContent = this.errorData.errorMessage;
        
        // Atualizar horário do erro
        const formattedTime = this.formatDate(this.errorData.errorTime);
        document.getElementById('errorTime').textContent = formattedTime;
        
        // Atualizar informações do curso
        this.updateCourseInfo();
        
        // Atualizar links de retry
        this.updateRetryLinks();
        
        // Personalizar mensagem baseada no tipo de erro
        this.customizeErrorMessage();
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
        
        const course = courses[this.errorData.courseId] || courses['ia-fundamentos'];
        
        document.getElementById('courseTitle').textContent = course.title;
        document.getElementById('courseInstructor').textContent = course.instructor;
        document.getElementById('courseImage').src = course.image;
        
        // Atualizar valor do curso
        const formattedAmount = `R$ ${this.errorData.amount.toFixed(2).replace('.', ',')}`;
        document.getElementById('courseAmount').textContent = formattedAmount;
    }
    
    updateRetryLinks() {
        // Atualizar link de retry principal
        const retryButton = document.getElementById('retryPayment');
        if (retryButton) {
            const retryUrl = new URL('checkout.html', window.location.origin);
            retryUrl.searchParams.set('course', this.errorData.courseId);
            retryUrl.searchParams.set('retry', 'true');
            retryUrl.searchParams.set('session', this.errorData.sessionId);
            retryButton.href = retryUrl.toString();
        }
        
        // Atualizar links de métodos alternativos
        const pixLink = document.querySelector('a[href*="method=pix"]');
        if (pixLink) {
            const pixUrl = new URL(pixLink.href, window.location.origin);
            pixUrl.searchParams.set('course', this.errorData.courseId);
            pixLink.href = pixUrl.toString();
        }
        
        const boletoLink = document.querySelector('a[href*="method=boleto"]');
        if (boletoLink) {
            const boletoUrl = new URL(boletoLink.href, window.location.origin);
            boletoUrl.searchParams.set('course', this.errorData.courseId);
            boletoLink.href = boletoUrl.toString();
        }
    }
    
    customizeErrorMessage() {
        const errorMessages = {
            'PAY_001': {
                title: 'Falha na Comunicação',
                description: 'Houve um problema temporário na comunicação com o processador de pagamento.',
                suggestion: 'Tente novamente em alguns minutos ou use um método de pagamento alternativo.'
            },
            'PAY_002': {
                title: 'Cartão Recusado',
                description: 'Seu cartão foi recusado pelo banco emissor.',
                suggestion: 'Verifique os dados do cartão ou entre em contato com seu banco.'
            },
            'PAY_003': {
                title: 'Limite Insuficiente',
                description: 'O limite do seu cartão é insuficiente para esta transação.',
                suggestion: 'Use outro cartão ou tente o PIX para pagamento instantâneo.'
            },
            'PAY_004': {
                title: 'Timeout na Transação',
                description: 'A transação demorou mais que o esperado e foi cancelada.',
                suggestion: 'Verifique sua conexão com a internet e tente novamente.'
            },
            'PAY_005': {
                title: 'Dados Inválidos',
                description: 'Alguns dados do pagamento estão incorretos ou inválidos.',
                suggestion: 'Verifique todos os dados e tente novamente.'
            }
        };
        
        const errorInfo = errorMessages[this.errorData.errorCode] || errorMessages['PAY_001'];
        
        // Atualizar título do erro se necessário
        const errorTitle = document.querySelector('.error-hero h1');
        if (errorTitle && errorInfo.title !== 'Falha na Comunicação') {
            errorTitle.textContent = `😔 ${errorInfo.title}`;
        }
        
        // Adicionar sugestão personalizada
        this.addCustomSuggestion(errorInfo.suggestion);
    }
    
    addCustomSuggestion(suggestion) {
        const suggestionElement = document.createElement('div');
        suggestionElement.className = 'custom-suggestion';
        suggestionElement.innerHTML = `
            <div class="suggestion-content">
                <div class="suggestion-icon">
                    <i class="fas fa-lightbulb"></i>
                </div>
                <div class="suggestion-text">
                    <h3>Sugestão Personalizada</h3>
                    <p>${suggestion}</p>
                </div>
            </div>
        `;
        
        // Adicionar estilos
        const style = document.createElement('style');
        style.textContent = `
            .custom-suggestion {
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
                border: 1px solid #3b82f6;
                border-radius: 16px;
                padding: 1.5rem;
                margin: 2rem 0;
            }
            
            .suggestion-content {
                display: flex;
                gap: 1rem;
                align-items: flex-start;
            }
            
            .suggestion-icon {
                width: 50px;
                height: 50px;
                border-radius: 12px;
                background: #3b82f6;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            
            .suggestion-icon i {
                color: white;
                font-size: 1.2rem;
            }
            
            .suggestion-text h3 {
                color: #1f2937;
                font-size: 1.1rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
            }
            
            .suggestion-text p {
                color: #374151;
                line-height: 1.6;
            }
            
            @media (max-width: 768px) {
                .suggestion-content {
                    flex-direction: column;
                    text-align: center;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Inserir após a seção de informações do curso
        const courseInfo = document.querySelector('.course-info');
        if (courseInfo) {
            courseInfo.insertAdjacentElement('afterend', suggestionElement);
        }
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
        // Adicionar eventos para botões de retry
        this.setupRetryButtons();
        
        // Adicionar eventos para suporte
        this.setupSupportButtons();
        
        // Adicionar eventos para relatório de erro
        this.setupErrorReporting();
        
        // Adicionar eventos de tracking
        this.setupAnalyticsTracking();
    }
    
    setupRetryButtons() {
        const retryButtons = document.querySelectorAll('a[href*="checkout.html"]');
        retryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.retryCount++;
                this.trackRetryAttempt(button.textContent.trim());
                
                if (this.retryCount >= this.maxRetries) {
                    e.preventDefault();
                    this.showMaxRetriesMessage();
                }
            });
        });
    }
    
    setupSupportButtons() {
        // Adicionar dados do erro aos links de suporte
        const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');
        whatsappLinks.forEach(link => {
            const originalHref = link.href;
            const errorDetails = `Erro: ${this.errorData.errorCode} - ${this.errorData.errorMessage}. Sessão: ${this.errorData.sessionId}`;
            
            if (originalHref.includes('text=')) {
                link.href = originalHref + ` ${errorDetails}`;
            } else {
                link.href = originalHref + `?text=${encodeURIComponent(errorDetails)}`;
            }
        });
        
        // Adicionar dados do erro aos links de email
        const emailLinks = document.querySelectorAll('a[href*="mailto:"]');
        emailLinks.forEach(link => {
            const url = new URL(link.href);
            url.searchParams.set('subject', `Erro no Pagamento - ${this.errorData.errorCode}`);
            url.searchParams.set('body', `
Detalhes do Erro:
- Código: ${this.errorData.errorCode}
- Mensagem: ${this.errorData.errorMessage}
- Curso: ${document.getElementById('courseTitle').textContent}
- Valor: ${document.getElementById('courseAmount').textContent}
- Horário: ${this.formatDate(this.errorData.errorTime)}
- Sessão: ${this.errorData.sessionId}

Por favor, me ajudem a resolver este problema.
            `.trim());
            link.href = url.toString();
        });
    }
    
    setupErrorReporting() {
        // Criar botão de relatório de erro
        const reportButton = document.createElement('button');
        reportButton.className = 'btn-outline';
        reportButton.innerHTML = '<i class="fas fa-bug"></i> Reportar Erro';
        reportButton.style.marginTop = '1rem';
        
        reportButton.addEventListener('click', () => {
            this.showErrorReportModal();
        });
        
        // Adicionar após os botões de solução
        const solutionsGrid = document.querySelector('.solutions-grid');
        if (solutionsGrid) {
            const reportContainer = document.createElement('div');
            reportContainer.style.textAlign = 'center';
            reportContainer.style.marginTop = '2rem';
            reportContainer.appendChild(reportButton);
            solutionsGrid.insertAdjacentElement('afterend', reportContainer);
        }
    }
    
    showErrorReportModal() {
        const modal = document.createElement('div');
        modal.className = 'error-report-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Reportar Erro</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>Ajude-nos a melhorar! Descreva o que aconteceu:</p>
                        <textarea id="errorDescription" placeholder="Descreva o que você estava fazendo quando o erro ocorreu..."></textarea>
                        <div class="error-details">
                            <h4>Detalhes Técnicos:</h4>
                            <p><strong>Código:</strong> ${this.errorData.errorCode}</p>
                            <p><strong>Mensagem:</strong> ${this.errorData.errorMessage}</p>
                            <p><strong>Sessão:</strong> ${this.errorData.sessionId}</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary modal-cancel">Cancelar</button>
                        <button class="btn-primary modal-submit">Enviar Relatório</button>
                    </div>
                </div>
            </div>
        `;
        
        // Adicionar estilos do modal
        const modalStyle = document.createElement('style');
        modalStyle.textContent = `
            .error-report-modal {
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
                max-width: 500px;
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
            }
            
            .modal-body {
                padding: 1.5rem;
            }
            
            .modal-body p {
                margin-bottom: 1rem;
                color: #374151;
            }
            
            .modal-body textarea {
                width: 100%;
                height: 100px;
                padding: 0.75rem;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                resize: vertical;
                font-family: inherit;
                margin-bottom: 1rem;
            }
            
            .modal-body textarea:focus {
                outline: none;
                border-color: #8b5cf6;
                box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
            }
            
            .error-details {
                background: #f9fafb;
                padding: 1rem;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }
            
            .error-details h4 {
                margin: 0 0 0.5rem 0;
                color: #374151;
                font-size: 0.9rem;
            }
            
            .error-details p {
                margin: 0.25rem 0;
                font-size: 0.8rem;
                color: #6b7280;
            }
            
            .modal-footer {
                display: flex;
                gap: 1rem;
                padding: 1.5rem;
                border-top: 1px solid #e5e7eb;
                justify-content: flex-end;
            }
            
            .modal-cancel {
                background: #f3f4f6;
                color: #374151;
                border: 2px solid #e5e7eb;
            }
            
            .modal-submit {
                background: linear-gradient(135deg, #8b5cf6, #f97316);
                color: white;
                border: none;
            }
        `;
        document.head.appendChild(modalStyle);
        
        document.body.appendChild(modal);
        
        // Adicionar eventos do modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(modalStyle);
        });
        
        modal.querySelector('.modal-cancel').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(modalStyle);
        });
        
        modal.querySelector('.modal-submit').addEventListener('click', () => {
            const description = modal.querySelector('#errorDescription').value;
            this.submitErrorReport(description);
            document.body.removeChild(modal);
            document.head.removeChild(modalStyle);
        });
        
        modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal-overlay')) {
                document.body.removeChild(modal);
                document.head.removeChild(modalStyle);
            }
        });
    }
    
    async submitErrorReport(description) {
        const reportData = {
            ...this.errorData,
            userDescription: description,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };
        
        try {
            // Simular envio do relatório
            console.log('Error report submitted:', reportData);
            
            // Aqui você faria a chamada real para sua API
            // await fetch('/api/error-reports', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(reportData)
            // });
            
            this.showNotification('Relatório enviado com sucesso! Obrigado pelo feedback.', 'success');
            
        } catch (error) {
            console.error('Error submitting report:', error);
            this.showNotification('Erro ao enviar relatório. Tente novamente.', 'error');
        }
    }
    
    setupRetryMechanism() {
        // Implementar retry automático para alguns tipos de erro
        if (this.shouldAutoRetry()) {
            this.scheduleAutoRetry();
        }
    }
    
    shouldAutoRetry() {
        const autoRetryErrors = ['PAY_001', 'PAY_004']; // Timeout e comunicação
        return autoRetryErrors.includes(this.errorData.errorCode) && this.retryCount === 0;
    }
    
    scheduleAutoRetry() {
        const retryDelay = 30000; // 30 segundos
        
        // Mostrar countdown
        this.showRetryCountdown(retryDelay / 1000);
        
        setTimeout(() => {
            if (this.retryCount === 0) { // Só retry se o usuário não tentou manualmente
                this.performAutoRetry();
            }
        }, retryDelay);
    }
    
    showRetryCountdown(seconds) {
        const countdownElement = document.createElement('div');
        countdownElement.className = 'auto-retry-countdown';
        countdownElement.innerHTML = `
            <div class="countdown-content">
                <div class="countdown-icon">
                    <i class="fas fa-redo"></i>
                </div>
                <div class="countdown-text">
                    <h3>Tentativa Automática</h3>
                    <p>Tentaremos processar seu pagamento novamente em <span id="countdown">${seconds}</span> segundos</p>
                    <button class="btn-outline cancel-retry">Cancelar</button>
                </div>
            </div>
        `;
        
        // Adicionar estilos
        const style = document.createElement('style');
        style.textContent = `
            .auto-retry-countdown {
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1));
                border: 1px solid #3b82f6;
                border-radius: 16px;
                padding: 1.5rem;
                margin: 2rem 0;
                text-align: center;
            }
            
            .countdown-content {
                display: flex;
                gap: 1rem;
                align-items: center;
                justify-content: center;
            }
            
            .countdown-icon {
                width: 50px;
                height: 50px;
                border-radius: 12px;
                background: #3b82f6;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: spin 2s linear infinite;
            }
            
            .countdown-icon i {
                color: white;
                font-size: 1.2rem;
            }
            
            .countdown-text h3 {
                color: #1f2937;
                margin-bottom: 0.5rem;
            }
            
            .countdown-text p {
                color: #374151;
                margin-bottom: 1rem;
            }
            
            #countdown {
                font-weight: 700;
                color: #3b82f6;
            }
            
            .cancel-retry {
                padding: 0.5rem 1rem;
                font-size: 0.9rem;
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            @media (max-width: 768px) {
                .countdown-content {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Inserir após a seção de soluções
        const solutions = document.querySelector('.solutions');
        if (solutions) {
            solutions.insertAdjacentElement('afterend', countdownElement);
        }
        
        // Iniciar countdown
        let remaining = seconds;
        const countdownSpan = countdownElement.querySelector('#countdown');
        const interval = setInterval(() => {
            remaining--;
            countdownSpan.textContent = remaining;
            
            if (remaining <= 0) {
                clearInterval(interval);
                if (document.body.contains(countdownElement)) {
                    document.body.removeChild(countdownElement);
                    document.head.removeChild(style);
                }
            }
        }, 1000);
        
        // Botão de cancelar
        countdownElement.querySelector('.cancel-retry').addEventListener('click', () => {
            clearInterval(interval);
            this.retryCount = this.maxRetries; // Prevenir auto retry
            document.body.removeChild(countdownElement);
            document.head.removeChild(style);
            this.showNotification('Tentativa automática cancelada.', 'info');
        });
    }
    
    performAutoRetry() {
        this.retryCount++;
        this.showNotification('Tentando processar o pagamento novamente...', 'info');
        
        // Redirecionar para checkout com parâmetros de retry
        const retryUrl = new URL('checkout.html', window.location.origin);
        retryUrl.searchParams.set('course', this.errorData.courseId);
        retryUrl.searchParams.set('auto_retry', 'true');
        retryUrl.searchParams.set('session', this.errorData.sessionId);
        
        setTimeout(() => {
            window.location.href = retryUrl.toString();
        }, 2000);
    }
    
    showMaxRetriesMessage() {
        this.showNotification('Muitas tentativas. Entre em contato com o suporte para ajuda personalizada.', 'error');
        
        // Destacar opções de suporte
        const supportSection = document.querySelector('.support-section');
        if (supportSection) {
            supportSection.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(245, 158, 11, 0.05))';
            supportSection.style.border = '2px solid #ef4444';
            supportSection.style.borderRadius = '16px';
            supportSection.style.margin = '2rem 0';
            supportSection.style.padding = '2rem';
        }
    }
    
    setupAnalyticsTracking() {
        this.trackErrorEvent();
        this.trackPageView();
    }
    
    trackErrorEvent() {
        const errorEventData = {
            error_code: this.errorData.errorCode,
            error_message: this.errorData.errorMessage,
            course_id: this.errorData.courseId,
            amount: this.errorData.amount,
            payment_method: this.errorData.paymentMethod,
            session_id: this.errorData.sessionId
        };
        
        console.log('Error event tracked:', errorEventData);
        
        // Aqui você integraria com suas ferramentas de analytics
        // gtag('event', 'payment_error', errorEventData);
    }
    
    trackRetryAttempt(buttonText) {
        const retryEventData = {
            retry_count: this.retryCount,
            retry_method: buttonText,
            original_error: this.errorData.errorCode,
            session_id: this.errorData.sessionId
        };
        
        console.log('Retry attempt tracked:', retryEventData);
        
        // Aqui você integraria com suas ferramentas de analytics
        // gtag('event', 'payment_retry', retryEventData);
    }
    
    trackPageView() {
        console.log('Page view tracked: Payment Error');
        
        // Aqui você integraria com suas ferramentas de analytics
        // gtag('config', 'GA_MEASUREMENT_ID', { page_title: 'Payment Error' });
    }
    
    startErrorAnimations() {
        setTimeout(() => {
            this.animateErrorElements();
        }, 500);
    }
    
    animateErrorElements() {
        const elements = document.querySelectorAll('.error-card, .solution-card, .issue-card');
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(20px)';
                element.style.transition = 'all 0.6s ease';
                
                setTimeout(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, 100);
            }, index * 150);
        });
    }
    
    logErrorEvent() {
        // Log detalhado do erro para debugging
        console.group('Payment Error Details');
        console.log('Error Code:', this.errorData.errorCode);
        console.log('Error Message:', this.errorData.errorMessage);
        console.log('Course ID:', this.errorData.courseId);
        console.log('Amount:', this.errorData.amount);
        console.log('Payment Method:', this.errorData.paymentMethod);
        console.log('Session ID:', this.errorData.sessionId);
        console.log('Timestamp:', this.errorData.errorTime);
        console.log('User Agent:', navigator.userAgent);
        console.log('URL:', window.location.href);
        console.groupEnd();
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
            max-width: 300px;
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
        
        // Remover após 5 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new PaymentErrorManager();
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
            max-width: none;
        }
        
        .notification.show {
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

