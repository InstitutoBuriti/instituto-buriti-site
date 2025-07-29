// CORREÇÕES DEFINITIVAS GROK - Arquivo JavaScript Externo
// Solução para problemas de grids 3 colunas no Instituto Buriti

console.log('GROK FIXES: Arquivo JavaScript externo carregado');

// Função para aplicar correções
function applyGrokFixes() {
    console.log('GROK FIXES: Aplicando correções...');
    
    // Força grid 3 colunas para cursos
    const coursesGrid = document.querySelector('.courses-grid');
    if (coursesGrid) {
        coursesGrid.style.display = 'grid';
        coursesGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        coursesGrid.style.gap = '40px';
        coursesGrid.style.width = '100%';
        console.log('GROK FIXES: Courses grid fixed to 3 columns');
    } else {
        console.log('GROK FIXES: Courses grid NOT FOUND');
    }
    
    // Força grid 3 colunas para notícias
    const newsGrid = document.querySelector('.news-grid');
    if (newsGrid) {
        newsGrid.style.display = 'grid';
        newsGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        newsGrid.style.gap = '40px';
        newsGrid.style.width = '100%';
        console.log('GROK FIXES: News grid fixed to 3 columns');
    } else {
        console.log('GROK FIXES: News grid NOT FOUND');
    }
    
    // Força flex horizontal para steps
    const stepsGrid = document.querySelector('.steps-grid');
    if (stepsGrid) {
        stepsGrid.style.display = 'flex';
        stepsGrid.style.justifyContent = 'space-between';
        stepsGrid.style.gap = '40px';
        stepsGrid.style.flexDirection = 'row';
        console.log('GROK FIXES: Steps grid fixed to horizontal flex');
    } else {
        console.log('GROK FIXES: Steps grid NOT FOUND');
    }
    
    // Força flex horizontal para share-content
    const shareContent = document.querySelector('.share-content');
    if (shareContent) {
        shareContent.style.display = 'flex';
        shareContent.style.alignItems = 'center';
        shareContent.style.gap = '40px';
        shareContent.style.flexDirection = 'row';
        console.log('GROK FIXES: Share content fixed to horizontal flex');
    } else {
        console.log('GROK FIXES: Share content NOT FOUND');
    }
    
    console.log('GROK FIXES: Todas as correções aplicadas com sucesso!');
}

// Aplicar correções quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyGrokFixes);
} else {
    applyGrokFixes();
}

// Backup com window.onload
window.addEventListener('load', function() {
    console.log('GROK FIXES: Window load backup executando...');
    applyGrokFixes();
});

// Backup com setTimeout para garantir execução
setTimeout(function() {
    console.log('GROK FIXES: setTimeout backup executando...');
    const coursesGrid = document.querySelector('.courses-grid');
    if (coursesGrid && window.getComputedStyle(coursesGrid).gridTemplateColumns === '464px 464px') {
        console.log('GROK FIXES: Aplicando correção via setTimeout backup');
        applyGrokFixes();
    }
}, 3000);

