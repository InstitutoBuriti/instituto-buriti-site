/**
 * Sistema de Biblioteca de Cursos - Instituto Buriti
 * Funcionalidades: Filtros, Busca, Navegação
 */

class BibliotecaCursos {
    constructor() {
        this.cursos = [];
        this.filtrosAtivos = {
            busca: '',
            area: '',
            nivel: '',
            tipo: ''
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.carregarCursos();
        this.atualizarContador();
        this.verificarAutenticacao();
    }

    setupEventListeners() {
        // Busca
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filtrosAtivos.busca = e.target.value.toLowerCase();
                this.aplicarFiltros();
            });
        }

        // Filtros
        const areaFilter = document.getElementById('areaFilter');
        const nivelFilter = document.getElementById('nivelFilter');
        const tipoFilter = document.getElementById('tipoFilter');

        if (areaFilter) {
            areaFilter.addEventListener('change', (e) => {
                this.filtrosAtivos.area = e.target.value;
                this.aplicarFiltros();
            });
        }

        if (nivelFilter) {
            nivelFilter.addEventListener('change', (e) => {
                this.filtrosAtivos.nivel = e.target.value;
                this.aplicarFiltros();
            });
        }

        if (tipoFilter) {
            tipoFilter.addEventListener('change', (e) => {
                this.filtrosAtivos.tipo = e.target.value;
                this.aplicarFiltros();
            });
        }

        // Limpar filtros
        const clearFilters = document.getElementById('clearFilters');
        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                this.limparFiltros();
            });
        }

        // Animações de scroll
        this.setupScrollAnimations();
    }

    carregarCursos() {
        // Obter todos os cards de curso do DOM
        const courseCards = document.querySelectorAll('.course-card');
        this.cursos = Array.from(courseCards);
    }

    aplicarFiltros() {
        let cursosVisiveis = 0;

        this.cursos.forEach(curso => {
            const area = curso.dataset.area || '';
            const nivel = curso.dataset.nivel || '';
            const tipo = curso.dataset.tipo || '';
            const titulo = curso.querySelector('h3').textContent.toLowerCase();
            const descricao = curso.querySelector('p').textContent.toLowerCase();

            // Verificar filtros
            const passaBusca = !this.filtrosAtivos.busca || 
                              titulo.includes(this.filtrosAtivos.busca) || 
                              descricao.includes(this.filtrosAtivos.busca);
            
            const passaArea = !this.filtrosAtivos.area || area === this.filtrosAtivos.area;
            const passaNivel = !this.filtrosAtivos.nivel || nivel === this.filtrosAtivos.nivel;
            const passaTipo = !this.filtrosAtivos.tipo || tipo === this.filtrosAtivos.tipo;

            const visivel = passaBusca && passaArea && passaNivel && passaTipo;

            if (visivel) {
                curso.style.display = 'block';
                curso.style.animation = 'fadeInUp 0.5s ease forwards';
                cursosVisiveis++;
            } else {
                curso.style.display = 'none';
            }
        });

        this.atualizarContador(cursosVisiveis);
        this.mostrarMensagemSemResultados(cursosVisiveis === 0);
    }

    limparFiltros() {
        // Resetar filtros
        this.filtrosAtivos = {
            busca: '',
            area: '',
            nivel: '',
            tipo: ''
        };

        // Limpar campos
        const searchInput = document.getElementById('searchInput');
        const areaFilter = document.getElementById('areaFilter');
        const nivelFilter = document.getElementById('nivelFilter');
        const tipoFilter = document.getElementById('tipoFilter');

        if (searchInput) searchInput.value = '';
        if (areaFilter) areaFilter.value = '';
        if (nivelFilter) nivelFilter.value = '';
        if (tipoFilter) tipoFilter.value = '';

        // Mostrar todos os cursos
        this.cursos.forEach(curso => {
            curso.style.display = 'block';
            curso.style.animation = 'fadeInUp 0.5s ease forwards';
        });

        this.atualizarContador(this.cursos.length);
        this.mostrarMensagemSemResultados(false);

        // Feedback visual
        this.mostrarNotificacao('Filtros limpos com sucesso!', 'success');
    }

    atualizarContador(quantidade = null) {
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            const total = quantidade !== null ? quantidade : this.cursos.length;
            const texto = total === 1 ? 'curso encontrado' : 'cursos encontrados';
            resultsCount.textContent = `${total} ${texto}`;
        }
    }

    mostrarMensagemSemResultados(mostrar) {
        const noResults = document.getElementById('noResults');
        const coursesGrid = document.getElementById('coursesGrid');
        
        if (noResults && coursesGrid) {
            if (mostrar) {
                noResults.style.display = 'block';
                coursesGrid.style.display = 'none';
            } else {
                noResults.style.display = 'none';
                coursesGrid.style.display = 'grid';
            }
        }
    }

    verificarAutenticacao() {
        // Atualizar interface baseado no status de autenticação
        if (window.authManager && window.authManager.isAuthenticated()) {
            const user = window.authManager.getUser();
            if (user) {
                this.atualizarInterfaceUsuario(user);
            }
        }
    }

    atualizarInterfaceUsuario(user) {
        // Atualizar dropdown de login
        const loginButton = document.querySelector('.login-button');
        if (loginButton) {
            loginButton.innerHTML = `
                <i class="fas fa-user"></i>
                ${user.name}
                <i class="fas fa-chevron-down"></i>
            `;
        }

        // Atualizar dropdown content
        const dropdownContent = document.querySelector('.dropdown-content');
        if (dropdownContent) {
            dropdownContent.innerHTML = `
                <a href="${this.getDashboardPage(user.role)}" class="dropdown-item">
                    <i class="fas fa-tachometer-alt"></i> Dashboard
                </a>
                <a href="#" class="dropdown-item" onclick="authManager.logout()">
                    <i class="fas fa-sign-out-alt"></i> Sair
                </a>
            `;
        }
    }

    getDashboardPage(role) {
        const pages = {
            'aluno': 'dashboard-aluno.html',
            'instrutor': 'dashboard-instrutor.html',
            'admin': 'dashboard-admin.html'
        };
        return pages[role] || 'dashboard-aluno.html';
    }

    setupScrollAnimations() {
        // Animação de entrada dos cards
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                }
            });
        }, observerOptions);

        // Observar cards de curso
        this.cursos.forEach(curso => {
            observer.observe(curso);
        });
    }

    mostrarNotificacao(mensagem, tipo = 'info') {
        // Usar sistema de notificações do auth.js se disponível
        if (window.showNotification) {
            window.showNotification(mensagem, tipo);
        } else {
            // Fallback simples
            alert(mensagem);
        }
    }
}

/**
 * Função para acessar curso
 */
function accessCourse(courseId) {
    // Verificar se usuário está logado
    if (window.authManager && !window.authManager.isAuthenticated()) {
        // Mostrar modal de login ou redirecionar
        if (confirm('Você precisa estar logado para acessar os cursos. Deseja fazer login agora?')) {
            window.location.href = 'login-aluno.html';
        }
        return;
    }

    // Redirecionar para página do curso
    window.location.href = `curso-template.html?id=${courseId}`;
}

/**
 * Animações CSS adicionais
 */
const additionalStyles = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .course-card {
        opacity: 0;
        transform: translateY(30px);
    }

    .course-card.visible {
        animation: fadeInUp 0.6s ease forwards;
    }

    /* Efeito de hover melhorado */
    .course-card:hover .course-access-btn {
        background: linear-gradient(135deg, #7C3AED, #6D28D9);
    }

    /* Loading state para filtros */
    .filters-loading {
        opacity: 0.6;
        pointer-events: none;
    }

    /* Transições suaves */
    .course-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Efeito de pulso para botões */
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }

    .course-access-btn:active {
        animation: pulse 0.3s ease;
    }
`;

// Adicionar estilos ao documento
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Inicializar quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.bibliotecaCursos = new BibliotecaCursos();
});

// Exportar para uso global
window.accessCourse = accessCourse;

