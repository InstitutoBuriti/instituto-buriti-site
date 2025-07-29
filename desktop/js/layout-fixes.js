// Layout Fixes - Instituto Buriti
// Correções permanentes para todas as seções problemáticas

(function() {
    'use strict';
    
    console.log('🔧 LAYOUT FIXES - Iniciando correções permanentes...');
    
    // Função para aplicar correções com máxima especificidade
    function applyLayoutFixes() {
        console.log('📐 Aplicando correções de layout...');
        
        // 1. CORREÇÃO: Cursos em Destaque - 3 colunas
        const coursesGrid = document.querySelector('.courses-grid');
        if (coursesGrid) {
            coursesGrid.style.setProperty('display', 'grid', 'important');
            coursesGrid.style.setProperty('grid-template-columns', 'repeat(3, 1fr)', 'important');
            coursesGrid.style.setProperty('gap', '20px', 'important');
            coursesGrid.style.setProperty('width', '100%', 'important');
            console.log('✅ Cursos em Destaque: 3 colunas aplicadas');
        } else {
            console.log('❌ Cursos em Destaque: elemento não encontrado');
        }
        
        // 2. CORREÇÃO: Como Funciona - Layout horizontal
        const stepsGrid = document.querySelector('.steps-grid');
        if (stepsGrid) {
            stepsGrid.style.setProperty('display', 'flex', 'important');
            stepsGrid.style.setProperty('flex-direction', 'row', 'important');
            stepsGrid.style.setProperty('justify-content', 'space-between', 'important');
            stepsGrid.style.setProperty('align-items', 'flex-start', 'important');
            stepsGrid.style.setProperty('gap', '20px', 'important');
            console.log('✅ Como Funciona: layout horizontal aplicado');
        } else {
            console.log('❌ Como Funciona: elemento não encontrado');
        }
        
        // 3. CORREÇÃO: Últimas Notícias - 3 colunas
        const newsGrid = document.querySelector('.news-grid');
        if (newsGrid) {
            newsGrid.style.setProperty('display', 'grid', 'important');
            newsGrid.style.setProperty('grid-template-columns', 'repeat(3, 1fr)', 'important');
            newsGrid.style.setProperty('gap', '20px', 'important');
            newsGrid.style.setProperty('width', '100%', 'important');
            console.log('✅ Últimas Notícias: 3 colunas aplicadas');
        } else {
            console.log('❌ Últimas Notícias: elemento não encontrado');
        }
        
        // 4. VERIFICAÇÃO: Compartilhe (já deveria estar correto)
        const shareSection = document.querySelector('.share-section');
        if (shareSection) {
            console.log('✅ Compartilhe: seção encontrada (layout já correto)');
        }
        
        console.log('🎯 Todas as correções de layout foram aplicadas!');
    }
    
    // Função para aguardar elementos carregarem
    function waitForElements() {
        const checkInterval = setInterval(() => {
            const coursesGrid = document.querySelector('.courses-grid');
            const stepsGrid = document.querySelector('.steps-grid');
            const newsGrid = document.querySelector('.news-grid');
            
            if (coursesGrid || stepsGrid || newsGrid) {
                console.log('📍 Elementos encontrados, aplicando correções...');
                applyLayoutFixes();
                clearInterval(checkInterval);
            }
        }, 100);
        
        // Timeout de segurança
        setTimeout(() => {
            clearInterval(checkInterval);
            console.log('⏰ Timeout atingido, forçando aplicação das correções...');
            applyLayoutFixes();
        }, 5000);
    }
    
    // Múltiplos pontos de execução para garantir funcionamento
    
    // 1. Se DOM já está carregado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForElements);
    } else {
        waitForElements();
    }
    
    // 2. Quando window carrega completamente
    window.addEventListener('load', applyLayoutFixes);
    
    // 3. Observer para mudanças no DOM
    const observer = new MutationObserver(() => {
        applyLayoutFixes();
    });
    
    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }
    
    // 4. Execução imediata
    setTimeout(applyLayoutFixes, 1000);
    setTimeout(applyLayoutFixes, 3000);
    setTimeout(applyLayoutFixes, 5000);
    
    console.log('🚀 Sistema de correções permanentes inicializado!');
})();

