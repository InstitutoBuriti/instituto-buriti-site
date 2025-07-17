/**
 * Materials Manager - Sistema de Gerenciamento de Materiais
 * Instituto Buriti - 2025
 */

class MaterialsManager {
    constructor() {
        this.materials = [];
        this.filteredMaterials = [];
        this.currentView = 'grid';
        this.currentFilters = {
            course: '',
            category: '',
            search: ''
        };
        this.currentSort = 'name';
        
        this.initializeElements();
        this.loadMaterials();
        this.bindEvents();
    }
    
    initializeElements() {
        // Filtros
        this.courseFilter = document.getElementById('courseFilter');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.searchInput = document.getElementById('searchMaterial');
        this.sortSelect = document.getElementById('sortBy');
        
        // Visualização
        this.gridViewBtn = document.getElementById('gridViewBtn');
        this.listViewBtn = document.getElementById('listViewBtn');
        
        // Estatísticas
        this.totalMaterialsEl = document.getElementById('totalMaterials');
        this.totalDownloadsEl = document.getElementById('totalDownloads');
        
        // Modais
        this.previewModal = document.getElementById('previewModal');
        this.downloadModal = document.getElementById('downloadModal');
        
        // Estado vazio
        this.emptyState = document.getElementById('emptyState');
    }
    
    loadMaterials() {
        // Dados simulados dos materiais
        this.materials = [
            {
                id: 1,
                title: 'Apostila HTML5 Completa',
                description: 'Guia completo sobre HTML5 com exemplos práticos e exercícios',
                course: 'curso-1',
                courseName: 'Desenvolvimento Web',
                category: 'apostila',
                fileType: 'pdf',
                fileName: 'html5-apostila.pdf',
                size: '2.5 MB',
                sizeBytes: 2621440,
                date: '2025-07-15',
                downloads: 45,
                tags: ['HTML5', 'Básico'],
                previewable: true
            },
            {
                id: 2,
                title: 'Códigos de Exemplo CSS3',
                description: 'Coleção de exemplos práticos de CSS3 com animações e efeitos',
                course: 'curso-1',
                courseName: 'Desenvolvimento Web',
                category: 'codigo',
                fileType: 'zip',
                fileName: 'css3-exemplos.zip',
                size: '1.8 MB',
                sizeBytes: 1887437,
                date: '2025-07-12',
                downloads: 32,
                tags: ['CSS3', 'Exemplos'],
                previewable: false
            },
            {
                id: 3,
                title: 'Exercícios JavaScript',
                description: 'Lista de exercícios práticos para fixação do conteúdo',
                course: 'curso-1',
                courseName: 'Desenvolvimento Web',
                category: 'exercicio',
                fileType: 'pdf',
                fileName: 'js-exercicios.pdf',
                size: '1.2 MB',
                sizeBytes: 1258291,
                date: '2025-07-10',
                downloads: 28,
                tags: ['JavaScript', 'Exercícios'],
                previewable: true
            },
            {
                id: 4,
                title: 'Template Responsivo',
                description: 'Template HTML/CSS responsivo pronto para uso',
                course: 'curso-1',
                courseName: 'Desenvolvimento Web',
                category: 'template',
                fileType: 'zip',
                fileName: 'template-responsivo.zip',
                size: '3.1 MB',
                sizeBytes: 3250585,
                date: '2025-07-08',
                downloads: 67,
                tags: ['Template', 'Responsivo'],
                previewable: false
            },
            {
                id: 5,
                title: 'Guia de SEO 2025',
                description: 'Estratégias atualizadas de SEO para melhorar o ranking',
                course: 'curso-2',
                courseName: 'Marketing Digital',
                category: 'apostila',
                fileType: 'pdf',
                fileName: 'seo-guia-2025.pdf',
                size: '4.2 MB',
                sizeBytes: 4404019,
                date: '2025-07-14',
                downloads: 89,
                tags: ['SEO', '2025'],
                previewable: true
            },
            {
                id: 6,
                title: 'Planilha de Métricas',
                description: 'Template para acompanhamento de métricas de marketing',
                course: 'curso-2',
                courseName: 'Marketing Digital',
                category: 'template',
                fileType: 'xlsx',
                fileName: 'metricas-template.xlsx',
                size: '856 KB',
                sizeBytes: 876544,
                date: '2025-07-11',
                downloads: 54,
                tags: ['Métricas', 'Excel'],
                previewable: false
            },
            {
                id: 7,
                title: 'Pack de Brushes Photoshop',
                description: 'Coleção de brushes profissionais para Photoshop',
                course: 'curso-3',
                courseName: 'Design Gráfico',
                category: 'recurso',
                fileType: 'zip',
                fileName: 'brushes-pack.zip',
                size: '15.3 MB',
                sizeBytes: 16052148,
                date: '2025-07-13',
                downloads: 123,
                tags: ['Brushes', 'Photoshop'],
                previewable: false
            },
            {
                id: 8,
                title: 'Templates de Cartão',
                description: 'Modelos editáveis de cartão de visita profissional',
                course: 'curso-3',
                courseName: 'Design Gráfico',
                category: 'template',
                fileType: 'psd',
                fileName: 'cartao-templates.psd',
                size: '8.7 MB',
                sizeBytes: 9126805,
                date: '2025-07-09',
                downloads: 76,
                tags: ['Cartão', 'Template'],
                previewable: false
            }
        ];
        
        this.filteredMaterials = [...this.materials];
        this.updateStatistics();
        this.renderMaterials();
    }
    
    bindEvents() {
        // Filtros
        this.courseFilter?.addEventListener('change', () => this.applyFilters());
        this.categoryFilter?.addEventListener('change', () => this.applyFilters());
        this.searchInput?.addEventListener('input', () => this.applyFilters());
        this.sortSelect?.addEventListener('change', () => this.applySorting());
        
        // Visualização
        this.gridViewBtn?.addEventListener('click', () => this.setView('grid'));
        this.listViewBtn?.addEventListener('click', () => this.setView('list'));
        
        // Toggle de cursos
        document.querySelectorAll('.toggle-course').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const courseId = e.target.closest('.toggle-course').dataset.course;
                this.toggleCourse(courseId);
            });
        });
        
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
    
    applyFilters() {
        this.currentFilters.course = this.courseFilter?.value || '';
        this.currentFilters.category = this.categoryFilter?.value || '';
        this.currentFilters.search = this.searchInput?.value.toLowerCase() || '';
        
        this.filteredMaterials = this.materials.filter(material => {
            const matchesCourse = !this.currentFilters.course || material.course === this.currentFilters.course;
            const matchesCategory = !this.currentFilters.category || material.category === this.currentFilters.category;
            const matchesSearch = !this.currentFilters.search || 
                material.title.toLowerCase().includes(this.currentFilters.search) ||
                material.description.toLowerCase().includes(this.currentFilters.search) ||
                material.tags.some(tag => tag.toLowerCase().includes(this.currentFilters.search));
            
            return matchesCourse && matchesCategory && matchesSearch;
        });
        
        this.applySorting();
        this.renderMaterials();
        this.updateStatistics();
    }
    
    applySorting() {
        this.currentSort = this.sortSelect?.value || 'name';
        
        this.filteredMaterials.sort((a, b) => {
            switch (this.currentSort) {
                case 'name':
                    return a.title.localeCompare(b.title);
                case 'date':
                    return new Date(b.date) - new Date(a.date);
                case 'size':
                    return b.sizeBytes - a.sizeBytes;
                case 'downloads':
                    return b.downloads - a.downloads;
                default:
                    return 0;
            }
        });
        
        this.renderMaterials();
    }
    
    setView(view) {
        this.currentView = view;
        
        // Atualizar botões
        this.gridViewBtn?.classList.toggle('active', view === 'grid');
        this.listViewBtn?.classList.toggle('active', view === 'list');
        
        // Atualizar grids
        document.querySelectorAll('.materials-grid').forEach(grid => {
            grid.classList.toggle('list-view', view === 'list');
        });
    }
    
    toggleCourse(courseId) {
        const courseSection = document.querySelector(`[data-course="${courseId}"]`);
        if (courseSection) {
            courseSection.classList.toggle('collapsed');
        }
    }
    
    renderMaterials() {
        // Agrupar materiais por curso
        const materialsByCourse = this.groupMaterialsByCourse();
        
        // Renderizar cada seção de curso
        Object.keys(materialsByCourse).forEach(courseId => {
            const grid = document.getElementById(`materialsGrid${courseId.split('-')[1]}`);
            if (grid) {
                const materials = materialsByCourse[courseId];
                grid.innerHTML = materials.map(material => this.renderMaterialCard(material)).join('');
                
                // Atualizar contador
                const courseSection = document.querySelector(`[data-course="${courseId}"]`);
                const countEl = courseSection?.querySelector('.material-count');
                if (countEl) {
                    countEl.textContent = `${materials.length} materiais`;
                }
            }
        });
        
        // Mostrar/ocultar estado vazio
        const hasResults = this.filteredMaterials.length > 0;
        this.emptyState.style.display = hasResults ? 'none' : 'block';
        
        // Ocultar seções de curso sem materiais
        document.querySelectorAll('.course-section').forEach(section => {
            const courseId = section.dataset.course;
            const hasMaterials = materialsByCourse[courseId] && materialsByCourse[courseId].length > 0;
            section.style.display = hasMaterials ? 'block' : 'none';
        });
    }
    
    groupMaterialsByCourse() {
        const grouped = {};
        
        this.filteredMaterials.forEach(material => {
            if (!grouped[material.course]) {
                grouped[material.course] = [];
            }
            grouped[material.course].push(material);
        });
        
        return grouped;
    }
    
    renderMaterialCard(material) {
        const fileTypeClass = material.fileType.toLowerCase();
        const previewButton = material.previewable ? 
            `<button class="btn-preview" onclick="materialsManager.previewMaterial('${material.fileName}', '${material.title}')">
                👁️ Visualizar
            </button>` : '';
        
        return `
            <div class="material-card" data-category="${material.category}">
                <div class="material-icon">
                    <span class="file-type ${fileTypeClass}">${material.fileType.toUpperCase()}</span>
                </div>
                <div class="material-info">
                    <h3 class="material-title">${material.title}</h3>
                    <p class="material-description">${material.description}</p>
                    <div class="material-meta">
                        <span class="material-size">${material.size}</span>
                        <span class="material-date">${this.formatDate(material.date)}</span>
                        <span class="download-count">${material.downloads} downloads</span>
                    </div>
                    <div class="material-tags">
                        ${material.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="material-actions">
                    <button class="btn-download" onclick="materialsManager.downloadMaterial('${material.fileName}', '${material.title}', '${material.size}')">
                        📥 Download
                    </button>
                    ${previewButton}
                </div>
            </div>
        `;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
    
    updateStatistics() {
        const totalMaterials = this.materials.length;
        const totalDownloads = this.materials.reduce((sum, material) => sum + material.downloads, 0);
        
        if (this.totalMaterialsEl) {
            this.totalMaterialsEl.textContent = totalMaterials;
        }
        
        if (this.totalDownloadsEl) {
            this.totalDownloadsEl.textContent = totalDownloads;
        }
    }
    
    downloadMaterial(fileName, title, size) {
        // Simular download
        this.showDownloadModal(fileName, title, size);
        
        // Incrementar contador de downloads
        const material = this.materials.find(m => m.fileName === fileName);
        if (material) {
            material.downloads++;
            this.updateStatistics();
            this.renderMaterials();
        }
        
        // Simular progresso de download
        this.simulateDownload();
    }
    
    previewMaterial(fileName, title) {
        const modal = this.previewModal;
        const titleEl = document.getElementById('previewTitle');
        const frame = document.getElementById('previewFrame');
        const loading = document.getElementById('previewLoading');
        
        if (titleEl) titleEl.textContent = `Visualizar: ${title}`;
        
        // Mostrar loading
        loading.style.display = 'flex';
        frame.style.display = 'none';
        
        // Simular carregamento do preview
        setTimeout(() => {
            // Para PDFs, usar um viewer online ou local
            const previewUrl = `../materials/${fileName}`;
            frame.src = previewUrl;
            
            loading.style.display = 'none';
            frame.style.display = 'block';
        }, 1500);
        
        this.showModal(modal);
    }
    
    showDownloadModal(fileName, title, size) {
        const modal = this.downloadModal;
        const fileNameEl = document.getElementById('downloadFileName');
        const fileSizeEl = document.getElementById('downloadFileSize');
        
        if (fileNameEl) fileNameEl.textContent = title;
        if (fileSizeEl) fileSizeEl.textContent = size;
        
        this.showModal(modal);
    }
    
    simulateDownload() {
        const progressBar = document.getElementById('downloadProgress');
        const progressPercent = document.getElementById('progressPercent');
        const downloadSpeed = document.getElementById('downloadSpeed');
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            
            if (progressBar) progressBar.style.width = `${progress}%`;
            if (progressPercent) progressPercent.textContent = `${Math.round(progress)}%`;
            if (downloadSpeed) {
                const speed = Math.round(Math.random() * 500 + 100);
                downloadSpeed.textContent = `${speed} KB/s`;
            }
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    this.closeModal(this.downloadModal);
                    this.showSuccessMessage('Download concluído com sucesso!');
                }, 1000);
            }
        }, 200);
    }
    
    showModal(modal) {
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            
            // Limpar iframe se for o modal de preview
            if (modal === this.previewModal) {
                const frame = document.getElementById('previewFrame');
                if (frame) frame.src = '';
            }
        }
    }
    
    clearFilters() {
        if (this.courseFilter) this.courseFilter.value = '';
        if (this.categoryFilter) this.categoryFilter.value = '';
        if (this.searchInput) this.searchInput.value = '';
        if (this.sortSelect) this.sortSelect.value = 'name';
        
        this.applyFilters();
    }
    
    showSuccessMessage(message) {
        // Criar notificação de sucesso
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✅</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        // Adicionar estilos
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Instância global
let materialsManager;

// Função de inicialização
function initializeMaterials() {
    materialsManager = new MaterialsManager();
}

// Funções globais para compatibilidade
function downloadMaterial(fileName) {
    const material = materialsManager.materials.find(m => m.fileName === fileName);
    if (material) {
        materialsManager.downloadMaterial(fileName, material.title, material.size);
    }
}

function previewMaterial(fileName) {
    const material = materialsManager.materials.find(m => m.fileName === fileName);
    if (material) {
        materialsManager.previewMaterial(fileName, material.title);
    }
}

function clearFilters() {
    materialsManager.clearFilters();
}

// Adicionar estilos para notificações
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
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-icon {
        font-size: 1.2rem;
    }
    
    .notification-message {
        font-weight: 600;
    }
`;
document.head.appendChild(notificationStyles);

