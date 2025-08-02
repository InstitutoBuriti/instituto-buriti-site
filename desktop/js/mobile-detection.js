/**
 * Mobile Detection Script - Instituto Buriti
 * Detecta dispositivos móveis e redireciona para versão mobile apropriada
 * Versão: 1.1 CORRIGIDA - Caminhos relativos para Netlify
 * Autor: Manus AI
 */

(function() {
    'use strict';
    
    // Configurações
    const CONFIG = {
        mobileBreakpoint: 768,
        tabletBreakpoint: 1024,
        redirectDelay: 0, // ms
        debugMode: false
    };
    
    // Função para log de debug
    function debugLog(message, data = null) {
        if (CONFIG.debugMode) {
            console.log('[Mobile Detection]', message, data || '');
        }
    }
    
    // Função avançada para detectar dispositivos móveis
    function isMobileDevice() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        
        // Lista abrangente de user agents móveis
        const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet|kindle|silk|playbook|bb10|meego|fennec|maemo|tizen|bada|symbian|palm|windows phone|windows mobile|iemobile\/|mobile safari|chrome mobile|firefox mobile/i;
        
        // Verificar user agent
        const isMobileUA = mobileRegex.test(userAgent.toLowerCase());
        
        // Verificar largura da tela
        const isMobileScreen = window.innerWidth <= CONFIG.mobileBreakpoint;
        
        // Verificar suporte a touch
        const isTouchDevice = ('ontouchstart' in window) || 
                             (navigator.maxTouchPoints > 0) || 
                             (navigator.msMaxTouchPoints > 0);
        
        // Verificar orientação (disponível em dispositivos móveis)
        const hasOrientation = typeof window.orientation !== 'undefined';
        
        // Verificar se é tablet (considerado mobile para nossos propósitos)
        const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(userAgent);
        
        debugLog('Detection results:', {
            userAgent: userAgent,
            isMobileUA: isMobileUA,
            isMobileScreen: isMobileScreen,
            isTouchDevice: isTouchDevice,
            hasOrientation: hasOrientation,
            isTablet: isTablet,
            screenWidth: window.innerWidth
        });
        
        // Retornar true se qualquer condição for verdadeira
        return isMobileUA || isMobileScreen || (isTouchDevice && hasOrientation) || isTablet;
    }
    
    // Função para mapear páginas desktop para mobile
    function getMobilePath(currentPath) {
        // Normalizar path (remover parâmetros e hash)
        const cleanPath = currentPath.split('?')[0].split('#')[0];
        
        // CORREÇÃO: Usar caminhos relativos em vez de absolutos
        // Mapeamento completo de páginas
        const pathMappings = {
            '/': 'mobile/index.html',
            '/index.html': 'mobile/index.html',
            '/pages/quem-somos.html': 'mobile/sobre-nos.html',
            '/pages/cursos.html': 'mobile/cursos.html',
            '/pages/biblioteca-cursos.html': 'mobile/cursos.html',
            '/pages/seja-instrutor-novo.html': 'mobile/seja-instrutor.html',
            '/pages/contato.html': 'mobile/contato.html',
            '/pages/login-aluno.html': 'mobile/login.html',
            '/pages/login-instrutor.html': 'mobile/login.html',
            '/pages/login-admin.html': 'mobile/login.html',
            '/pages/dashboard-aluno.html': 'mobile/dashboard-aluno.html',
            '/pages/dashboard-instrutor.html': 'mobile/dashboard-instrutor.html',
            '/pages/dashboard-admin.html': 'mobile/dashboard-admin.html',
            '/pages/forum.html': 'mobile/forum.html',
            '/pages/gamificacao.html': 'mobile/gamificacao.html'
        };
        
        // Retornar mapeamento ou página padrão
        const mobilePath = pathMappings[cleanPath] || 'mobile/index.html';
        
        debugLog('Path mapping:', {
            original: currentPath,
            clean: cleanPath,
            mobile: mobilePath
        });
        
        return mobilePath;
    }
    
    // Função para verificar se já está na versão mobile
    function isAlreadyMobile() {
        return window.location.pathname.includes('/mobile/');
    }
    
    // Função para verificar se o redirecionamento foi desabilitado
    function isRedirectDisabled() {
        // Verificar parâmetro URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('nomobile') === '1' || urlParams.get('desktop') === '1') {
            return true;
        }
        
        // Verificar localStorage
        try {
            if (localStorage.getItem('forceDesktop') === 'true') {
                return true;
            }
        } catch (e) {
            // Ignorar erros de localStorage
        }
        
        // Verificar sessionStorage
        try {
            if (sessionStorage.getItem('skipMobileRedirect') === 'true') {
                return true;
            }
        } catch (e) {
            // Ignorar erros de sessionStorage
        }
        
        return false;
    }
    
    // Função para criar link "Ver versão desktop"
    function addDesktopLink() {
        if (!isAlreadyMobile()) return;
        
        // Verificar se link já existe
        if (document.getElementById('desktop-version-link')) return;
        
        // Criar link para versão desktop
        const desktopLink = document.createElement('a');
        desktopLink.id = 'desktop-version-link';
        desktopLink.href = '/?desktop=1';
        desktopLink.textContent = '🖥️ Ver versão desktop';
        desktopLink.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 25px;
            text-decoration: none;
            font-size: 12px;
            z-index: 9999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        `;
        
        // Adicionar efeito hover
        desktopLink.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(0,0,0,0.9)';
            this.style.transform = 'scale(1.05)';
        });
        
        desktopLink.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(0,0,0,0.8)';
            this.style.transform = 'scale(1)';
        };
        
        document.body.appendChild(desktopLink);
    }
    
    // Função principal de redirecionamento
    function handleMobileRedirect() {
        debugLog('Starting mobile detection...');
        
        // Verificar se já está na versão mobile
        if (isAlreadyMobile()) {
            debugLog('Already on mobile version');
            addDesktopLink();
            return;
        }
        
        // Verificar se redirecionamento foi desabilitado
        if (isRedirectDisabled()) {
            debugLog('Mobile redirect disabled');
            return;
        }
        
        // Verificar se é dispositivo mobile
        if (!isMobileDevice()) {
            debugLog('Desktop device detected');
            return;
        }
        
        debugLog('Mobile device detected, preparing redirect...');
        
        // Obter caminho mobile
        const currentPath = window.location.pathname;
        const mobilePath = getMobilePath(currentPath);
        
        // Construir URL completa
        const fullMobileUrl = mobilePath + window.location.search + window.location.hash;
        
        debugLog('Redirecting to:', fullMobileUrl);
        
        // Executar redirecionamento
        if (CONFIG.redirectDelay > 0) {
            setTimeout(() => {
                window.location.href = fullMobileUrl;
            }, CONFIG.redirectDelay);
        } else {
            window.location.href = fullMobileUrl;
        }
    }
    
    // Função para lidar com mudanças de tamanho da janela
    function handleResize() {
        // Debounce para evitar múltiplas execuções
        clearTimeout(window.mobileDetectionResizeTimer);
        window.mobileDetectionResizeTimer = setTimeout(() => {
            debugLog('Window resized, checking mobile status...');
            handleMobileRedirect();
        }, 250);
    }
    
    // Função de inicialização
    function init() {
        debugLog('Initializing mobile detection...');
        
        // Executar detecção inicial
        handleMobileRedirect();
        
        // Adicionar listener para resize
        window.addEventListener('resize', handleResize);
        
        // Adicionar listener para mudanças de orientação
        window.addEventListener('orientationchange', () => {
            setTimeout(handleMobileRedirect, 500);
        });
        
        debugLog('Mobile detection initialized');
    }
    
    // Executar quando DOM estiver carregado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Expor funções para debug (apenas em modo debug)
    if (CONFIG.debugMode) {
        window.MobileDetection = {
            isMobileDevice: isMobileDevice,
            getMobilePath: getMobilePath,
            handleMobileRedirect: handleMobileRedirect,
            config: CONFIG
        };
    }
    
})();

