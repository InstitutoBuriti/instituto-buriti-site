/**
 * Accessibility Manager - Instituto Buriti
 * Funcionalidades de acessibilidade e WCAG compliance
 */

class AccessibilityManager {
    constructor() {
        this.isKeyboardNavigation = false;
        this.focusableElements = [];
        this.currentFocusIndex = -1;
        this.announcements = [];
        
        this.init();
    }
    
    init() {
        this.setupKeyboardNavigation();
        this.setupScreenReader();
        this.setupFocusManagement();
        this.setupSkipLinks();
        this.setupModalAccessibility();
        this.setupFormAccessibility();
        this.setupLiveRegions();
        this.setupColorContrastToggle();
        this.setupFontSizeControls();
        
        console.log('♿ Accessibility Manager inicializado');
    }
    
    setupKeyboardNavigation() {
        // Detectar navegação por teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.isKeyboardNavigation = true;
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            this.isKeyboardNavigation = false;
            document.body.classList.remove('keyboard-navigation');
        });
        
        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }
    
    handleKeyboardShortcuts(e) {
        // Alt + 1: Ir para conteúdo principal
        if (e.altKey && e.key === '1') {
            e.preventDefault();
            this.focusMainContent();
        }
        
        // Alt + 2: Ir para navegação
        if (e.altKey && e.key === '2') {
            e.preventDefault();
            this.focusNavigation();
        }
        
        // Alt + 3: Ir para busca
        if (e.altKey && e.key === '3') {
            e.preventDefault();
            this.focusSearch();
        }
        
        // Escape: Fechar modais/menus
        if (e.key === 'Escape') {
            this.closeModalsAndMenus();
        }
        
        // Enter/Space em elementos clicáveis
        if ((e.key === 'Enter' || e.key === ' ') && this.isClickableElement(e.target)) {
            e.preventDefault();
            e.target.click();
        }
    }
    
    setupScreenReader() {
        // Criar região de anúncios para screen readers
        if (!document.getElementById('sr-announcements')) {
            const announceRegion = document.createElement('div');
            announceRegion.id = 'sr-announcements';
            announceRegion.setAttribute('aria-live', 'polite');
            announceRegion.setAttribute('aria-atomic', 'true');
            announceRegion.className = 'sr-only';
            document.body.appendChild(announceRegion);
        }
        
        // Região para anúncios urgentes
        if (!document.getElementById('sr-alerts')) {
            const alertRegion = document.createElement('div');
            alertRegion.id = 'sr-alerts';
            alertRegion.setAttribute('aria-live', 'assertive');
            alertRegion.setAttribute('aria-atomic', 'true');
            alertRegion.className = 'sr-only';
            document.body.appendChild(alertRegion);
        }
    }
    
    setupFocusManagement() {
        // Atualizar lista de elementos focáveis
        this.updateFocusableElements();
        
        // Observar mudanças no DOM
        const observer = new MutationObserver(() => {
            this.updateFocusableElements();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['tabindex', 'disabled', 'aria-hidden']
        });
    }
    
    updateFocusableElements() {
        const selector = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]'
        ].join(', ');
        
        this.focusableElements = Array.from(document.querySelectorAll(selector))
            .filter(el => {
                return !el.closest('[aria-hidden="true"]') && 
                       this.isVisible(el) && 
                       !el.hasAttribute('inert');
            });
    }
    
    setupSkipLinks() {
        // Adicionar skip links se não existirem
        if (!document.querySelector('.skip-link')) {
            const skipLinks = document.createElement('div');
            skipLinks.className = 'skip-links';
            skipLinks.innerHTML = `
                <a href="#main-content" class="skip-link">Pular para conteúdo principal</a>
                <a href="#navigation" class="skip-link">Pular para navegação</a>
                <a href="#footer" class="skip-link">Pular para rodapé</a>
            `;
            document.body.insertBefore(skipLinks, document.body.firstChild);
        }
        
        // Adicionar IDs se não existirem
        this.ensureMainContentId();
        this.ensureNavigationId();
        this.ensureFooterId();
    }
    
    setupModalAccessibility() {
        // Observar modais
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-modal-trigger]')) {
                const modalId = e.target.getAttribute('data-modal-trigger');
                this.openModal(modalId);
            }
            
            if (e.target.matches('.modal-close, [data-modal-close]')) {
                this.closeModal();
            }
        });
        
        // Fechar modal com Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }
    
    setupFormAccessibility() {
        // Melhorar formulários
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            this.enhanceForm(form);
        });
        
        // Observar novos formulários
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        const forms = node.querySelectorAll ? node.querySelectorAll('form') : [];
                        forms.forEach(form => this.enhanceForm(form));
                    }
                });
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    enhanceForm(form) {
        // Associar labels com inputs
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
                const label = form.querySelector(`label[for="${input.id}"]`);
                if (!label && input.id) {
                    // Criar label se não existir
                    const newLabel = document.createElement('label');
                    newLabel.setAttribute('for', input.id);
                    newLabel.textContent = this.generateLabelText(input);
                    input.parentNode.insertBefore(newLabel, input);
                }
            }
        });
        
        // Adicionar validação acessível
        form.addEventListener('submit', (e) => {
            this.validateFormAccessibly(form, e);
        });
        
        // Validação em tempo real
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateFieldAccessibly(input);
            });
        });
    }
    
    setupLiveRegions() {
        // Configurar regiões dinâmicas
        const dynamicElements = document.querySelectorAll('[data-live-region]');
        dynamicElements.forEach(element => {
            if (!element.getAttribute('aria-live')) {
                element.setAttribute('aria-live', 'polite');
            }
        });
    }
    
    setupColorContrastToggle() {
        // Botão de alto contraste
        const contrastToggle = document.createElement('button');
        contrastToggle.id = 'contrast-toggle';
        contrastToggle.className = 'accessibility-control';
        contrastToggle.innerHTML = '🎨 Alto Contraste';
        contrastToggle.setAttribute('aria-label', 'Alternar modo de alto contraste');
        
        contrastToggle.addEventListener('click', () => {
            this.toggleHighContrast();
        });
        
        this.addAccessibilityControl(contrastToggle);
    }
    
    setupFontSizeControls() {
        // Controles de tamanho da fonte
        const fontControls = document.createElement('div');
        fontControls.className = 'font-size-controls accessibility-control';
        fontControls.innerHTML = `
            <button id="font-decrease" aria-label="Diminuir tamanho da fonte">A-</button>
            <button id="font-reset" aria-label="Tamanho normal da fonte">A</button>
            <button id="font-increase" aria-label="Aumentar tamanho da fonte">A+</button>
        `;
        
        fontControls.addEventListener('click', (e) => {
            if (e.target.id === 'font-decrease') this.changeFontSize(-1);
            if (e.target.id === 'font-reset') this.resetFontSize();
            if (e.target.id === 'font-increase') this.changeFontSize(1);
        });
        
        this.addAccessibilityControl(fontControls);
    }
    
    addAccessibilityControl(control) {
        let controlsContainer = document.getElementById('accessibility-controls');
        
        if (!controlsContainer) {
            controlsContainer = document.createElement('div');
            controlsContainer.id = 'accessibility-controls';
            controlsContainer.className = 'accessibility-controls';
            controlsContainer.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 5px;
                background: white;
                padding: 10px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                border: 1px solid #ddd;
            `;
            document.body.appendChild(controlsContainer);
        }
        
        controlsContainer.appendChild(control);
    }
    
    // Métodos públicos
    announce(message, priority = 'polite') {
        const region = priority === 'assertive' ? 
            document.getElementById('sr-alerts') : 
            document.getElementById('sr-announcements');
        
        if (region) {
            region.textContent = message;
            
            // Limpar após 5 segundos
            setTimeout(() => {
                region.textContent = '';
            }, 5000);
        }
        
        console.log(`📢 Anúncio (${priority}):`, message);
    }
    
    focusMainContent() {
        const main = document.getElementById('main-content') || document.querySelector('main');
        if (main) {
            main.focus();
            this.announce('Navegando para conteúdo principal');
        }
    }
    
    focusNavigation() {
        const nav = document.getElementById('navigation') || document.querySelector('nav');
        if (nav) {
            const firstLink = nav.querySelector('a, button');
            if (firstLink) {
                firstLink.focus();
                this.announce('Navegando para menu principal');
            }
        }
    }
    
    focusSearch() {
        const search = document.querySelector('input[type="search"], input[name="search"], #search');
        if (search) {
            search.focus();
            this.announce('Navegando para campo de busca');
        }
    }
    
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // Salvar elemento focado anteriormente
        this.previousFocus = document.activeElement;
        
        // Mostrar modal
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        
        // Focar primeiro elemento focável
        const firstFocusable = modal.querySelector('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
        
        // Trap focus
        this.trapFocus(modal);
        
        this.announce('Modal aberto');
    }
    
    closeModal() {
        const modal = document.querySelector('.modal[aria-hidden="false"]');
        if (!modal) return;
        
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        
        // Restaurar foco
        if (this.previousFocus) {
            this.previousFocus.focus();
        }
        
        this.announce('Modal fechado');
    }
    
    closeModalsAndMenus() {
        // Fechar modais
        this.closeModal();
        
        // Fechar menu mobile
        const mobileNav = document.getElementById('mobileNav');
        if (mobileNav && mobileNav.classList.contains('active')) {
            mobileNav.classList.remove('active');
            this.announce('Menu fechado');
        }
    }
    
    trapFocus(container) {
        const focusableElements = container.querySelectorAll(
            'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        container.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    }
    
    validateFormAccessibly(form, event) {
        const errors = [];
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                errors.push({
                    element: input,
                    message: `${this.getFieldLabel(input)} é obrigatório`
                });
            }
        });
        
        if (errors.length > 0) {
            event.preventDefault();
            this.displayFormErrors(errors);
            errors[0].element.focus();
        }
    }
    
    validateFieldAccessibly(field) {
        this.removeFieldError(field);
        
        if (field.hasAttribute('required') && !field.value.trim()) {
            this.addFieldError(field, `${this.getFieldLabel(field)} é obrigatório`);
        }
        
        if (field.type === 'email' && field.value && !this.isValidEmail(field.value)) {
            this.addFieldError(field, 'Email inválido');
        }
    }
    
    displayFormErrors(errors) {
        // Remover erros anteriores
        const existingErrors = document.querySelectorAll('.error-message');
        existingErrors.forEach(error => error.remove());
        
        // Adicionar novos erros
        errors.forEach(error => {
            this.addFieldError(error.element, error.message);
        });
        
        // Anunciar erros
        const errorCount = errors.length;
        this.announce(`Formulário contém ${errorCount} erro${errorCount > 1 ? 's' : ''}`, 'assertive');
    }
    
    addFieldError(field, message) {
        field.setAttribute('aria-invalid', 'true');
        
        const errorId = `${field.id || 'field'}-error`;
        field.setAttribute('aria-describedby', errorId);
        
        const errorElement = document.createElement('div');
        errorElement.id = errorId;
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');
        
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    }
    
    removeFieldError(field) {
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-describedby');
        
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    toggleHighContrast() {
        document.body.classList.toggle('high-contrast');
        const isActive = document.body.classList.contains('high-contrast');
        
        localStorage.setItem('high-contrast', isActive);
        this.announce(`Alto contraste ${isActive ? 'ativado' : 'desativado'}`);
    }
    
    changeFontSize(direction) {
        const currentSize = parseInt(getComputedStyle(document.body).fontSize);
        const newSize = currentSize + (direction * 2);
        
        if (newSize >= 12 && newSize <= 24) {
            document.body.style.fontSize = `${newSize}px`;
            localStorage.setItem('font-size', newSize);
            this.announce(`Tamanho da fonte ${direction > 0 ? 'aumentado' : 'diminuído'}`);
        }
    }
    
    resetFontSize() {
        document.body.style.fontSize = '';
        localStorage.removeItem('font-size');
        this.announce('Tamanho da fonte restaurado');
    }
    
    // Métodos auxiliares
    isVisible(element) {
        const style = getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0';
    }
    
    isClickableElement(element) {
        return element.matches('button, a, [role="button"], [tabindex]:not([tabindex="-1"])');
    }
    
    getFieldLabel(field) {
        const label = document.querySelector(`label[for="${field.id}"]`);
        if (label) return label.textContent.trim();
        
        const ariaLabel = field.getAttribute('aria-label');
        if (ariaLabel) return ariaLabel;
        
        const placeholder = field.getAttribute('placeholder');
        if (placeholder) return placeholder;
        
        return 'Campo';
    }
    
    generateLabelText(input) {
        const type = input.type || 'text';
        const name = input.name || input.id || '';
        
        const labels = {
            email: 'Email',
            password: 'Senha',
            text: 'Texto',
            tel: 'Telefone',
            url: 'URL',
            search: 'Busca'
        };
        
        return labels[type] || name || 'Campo';
    }
    
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    ensureMainContentId() {
        let main = document.getElementById('main-content');
        if (!main) {
            main = document.querySelector('main') || document.querySelector('.main-content');
            if (main) {
                main.id = 'main-content';
                main.setAttribute('tabindex', '-1');
            }
        }
    }
    
    ensureNavigationId() {
        let nav = document.getElementById('navigation');
        if (!nav) {
            nav = document.querySelector('nav') || document.querySelector('.nav-desktop');
            if (nav) {
                nav.id = 'navigation';
            }
        }
    }
    
    ensureFooterId() {
        let footer = document.getElementById('footer');
        if (!footer) {
            footer = document.querySelector('footer');
            if (footer) {
                footer.id = 'footer';
            }
        }
    }
    
    // Carregar preferências salvas
    loadSavedPreferences() {
        // Alto contraste
        if (localStorage.getItem('high-contrast') === 'true') {
            document.body.classList.add('high-contrast');
        }
        
        // Tamanho da fonte
        const savedFontSize = localStorage.getItem('font-size');
        if (savedFontSize) {
            document.body.style.fontSize = `${savedFontSize}px`;
        }
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityManager = new AccessibilityManager();
    window.accessibilityManager.loadSavedPreferences();
});

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityManager;
}

