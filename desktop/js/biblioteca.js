// 🚀 FASE 2 SEÇÃO 4 QWEN: Sistema de Biblioteca Integrada com Usuário Logado
// Implementação completa conforme metodologia Qwen - VERSÃO ATUALIZADA COM NAVEGAÇÃO
// Atualizado em: 05/08/2025 - Correção conforme diagnóstico da Qwen

const bibliotecaManager = {
    // Estado da aplicação
    currentUser: null,
    userEnrollments: [],
    allCourses: [
        {
            id: 'ia-fundamentos',
            title: 'Fundamentos da Inteligência Artificial',
            area: 'tecnologia',
            nivel: 'basico',
            tipo: 'gratuito',
            price: 0,
            description: 'Domine os conceitos fundamentais de IA e machine learning com aplicações práticas.'
        },
        {
            id: 'gestao-cultural',
            title: 'Gestão de Projetos Culturais',
            area: 'artes',
            nivel: 'intermediario',
            tipo: 'pago',
            price: 350,
            description: 'Aprenda a elaborar, executar e gerenciar projetos culturais de sucesso.'
        },
        {
            id: 'educacao-inclusiva',
            title: 'Educação Especial na Perspectiva Inclusiva',
            area: 'educacao',
            nivel: 'avancado',
            tipo: 'gratuito',
            price: 0,
            description: 'Explore metodologias inovadoras para uma educação mais acessível e inclusiva.'
        }
    ],

    // 🚀 FASE 2 SEÇÃO 4 QWEN: Inicialização do sistema
    init() {
        // *** INÍCIO DA CORREÇÃO ***
        // O bloco de código desta função foi reorganizado para garantir
        // que a função renderCourses() seja chamada.

        console.log('🚀 FASE 2 SEÇÃO 4 QWEN: Inicializando biblioteca integrada...');
        
        this.checkAuthentication();
        this.loadUserEnrollments();

        // Esta é a ordem para desenhar os cursos na tela.
        this.renderCourses(); 

        this.setupEventListeners(); // Movido para depois de renderCourses
        this.updateUI();
        
        console.log('✅ FASE 2 SEÇÃO 4 QWEN: Biblioteca inicializada com sucesso');
        // *** FIM DA CORREÇÃO ***
    },

    // 🔍 FASE 2 SEÇÃO 4 QWEN: Verificação de autenticação
    checkAuthentication() {
        console.log('🔍 FASE 2 SEÇÃO 4 QWEN: Verificando autenticação...');
        
        try {
            // Integração com auth.js da Seção 3
            if (typeof authManager !== 'undefined' && authManager.isAuthenticated()) {
                this.currentUser = authManager.getUser();
                console.log('✅ FASE 2 SEÇÃO 4 QWEN: Usuário autenticado:', this.currentUser.name);
                this.updateAuthHeader();
                this.showUserFilters();
            } else {
                console.log('⚠️ FASE 2 SEÇÃO 4 QWEN: Usuário não autenticado');
                this.updateAuthHeader();
                this.hideUserFilters();
            }
        } catch (error) {
            console.log('❌ FASE 2 SEÇÃO 4 QWEN: Erro na verificação de autenticação:', error);
            this.updateAuthHeader();
            this.hideUserFilters();
        }
    },

    // 📚 FASE 2 SEÇÃO 4 QWEN: Carregamento de inscrições do usuário
    loadUserEnrollments() {
        console.log('📚 FASE 2 SEÇÃO 4 QWEN: Carregando inscrições do usuário...');
        
        if (!this.currentUser) {
            console.log('⚠️ FASE 2 SEÇÃO 4 QWEN: Usuário não logado, sem inscrições');
            return;
        }

        try {
            const enrollmentsKey = `enrollments_${this.currentUser.id}`;
            const savedEnrollments = localStorage.getItem(enrollmentsKey);
            
            if (savedEnrollments) {
                this.userEnrollments = JSON.parse(savedEnrollments);
                console.log('✅ FASE 2 SEÇÃO 4 QWEN: Inscrições carregadas:', this.userEnrollments);
            } else {
                // Simular algumas inscrições para demonstração
                this.userEnrollments = ['gestao-cultural']; // Ana já está inscrita em Gestão Cultural
                this.saveUserEnrollments();
                console.log('🎯 FASE 2 SEÇÃO 4 QWEN: Inscrições iniciais criadas:', this.userEnrollments);
            }
        } catch (error) {
            console.log('❌ FASE 2 SEÇÃO 4 QWEN: Erro ao carregar inscrições:', error);
            this.userEnrollments = [];
        }
    },

    // 💾 FASE 2 SEÇÃO 4 QWEN: Salvamento de inscrições
    saveUserEnrollments() {
        if (!this.currentUser) return;
        
        try {
            const enrollmentsKey = `enrollments_${this.currentUser.id}`;
            localStorage.setItem(enrollmentsKey, JSON.stringify(this.userEnrollments));
            console.log('💾 FASE 2 SEÇÃO 4 QWEN: Inscrições salvas com sucesso');
        } catch (error) {
            console.log('❌ FASE 2 SEÇÃO 4 QWEN: Erro ao salvar inscrições:', error);
        }
    },

    // 🎛️ FASE 2 SEÇÃO 4 QWEN: Configuração de event listeners
    setupEventListeners() {
        console.log('🎛️ FASE 2 SEÇÃO 4 QWEN: Configurando event listeners...');
        
        const coursesContainer = document.getElementById('coursesContainer');

        // Usar delegação de eventos para os botões e títulos
        if(coursesContainer) {
            coursesContainer.addEventListener('click', (e) => {
                const courseCard = e.target.closest('.course-card');
                if (!courseCard) return;
                const courseId = courseCard.dataset.courseId;

                // Checar se o clique foi no botão de ação
                if (e.target.closest('.course-action-btn')) {
                    this.handleCourseAction(courseId);
                }
                // Checar se o clique foi no título
                else if (e.target.closest('.course-title')) {
                    this.navigateToCourseDetails(courseId);
                }
            });
        }

        // Filtros
        document.getElementById('searchInput')?.addEventListener('input', () => this.applyFilters());
        document.getElementById('areaFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('nivelFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('tipoFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('statusFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('clearFilters')?.addEventListener('click', () => this.clearAllFilters());
        
        console.log('✅ FASE 2 SEÇÃO 4 QWEN: Event listeners configurados');
    },

    // 🔄 FASE 2 SEÇÃO 4 QWEN: Atualização da interface
    updateUI() {
        console.log('🔄 FASE 2 SEÇÃO 4 QWEN: Atualizando interface...');
        
        // As atualizações agora são feitas dentro de applyFilters e renderCourses
        this.applyFilters();
        
        console.log('✅ FASE 2 SEÇÃO 4 QWEN: Interface atualizada');
    },

    // 🔗 FASE 2 SEÇÃO 4 QWEN: Atualização do header de autenticação
    updateAuthHeader() {
        const authSection = document.getElementById('authSection');
        if (!authSection) return;

        if (this.currentUser) {
            // Atualizar para o dropdown do usuário logado
            authSection.innerHTML = `
                <button class="login-btn">${this.currentUser.name}</button>
                <div class="dropdown-menu">
                    <a href="dashboard-aluno.html" class="dropdown-item">Dashboard</a>
                    <a href="perfil-aluno.html" class="dropdown-item">Perfil</a>
                    <a href="#" class="dropdown-item" onclick="logout()">Sair</a>
                </div>
            `;
        } else {
            // Manter o dropdown de login padrão
            authSection.innerHTML = `
                <button class="login-btn">Login</button>
                <div class="dropdown-menu">
                    <a href="login-aluno.html" class="dropdown-item">Aluno</a>
                    <a href="login-instrutor.html" class="dropdown-item">Instrutor</a>
                    <a href="login-admin.html" class="dropdown-item">Administrador</a>
                </div>
            `;
        }
    },

    // 👁️ FASE 2 SEÇÃO 4 QWEN: Mostrar filtros de usuário
    showUserFilters() {
        const userStatusFilter = document.getElementById('userStatusFilter');
        if (userStatusFilter) {
            userStatusFilter.style.display = 'block';
            console.log('👁️ FASE 2 SEÇÃO 4 QWEN: Filtros de usuário exibidos');
        }
    },

    // 🙈 FASE 2 SEÇÃO 4 QWEN: Ocultar filtros de usuário
    hideUserFilters() {
        const userStatusFilter = document.getElementById('userStatusFilter');
        if (userStatusFilter) {
            userStatusFilter.style.display = 'none';
            console.log('🙈 FASE 2 SEÇÃO 4 QWEN: Filtros de usuário ocultados');
        }
    },

    // 🔘 FASE 2 SEÇÃO 4 QWEN: Atualização dos botões dos cursos
    updateCourseButtons() {
        console.log('🔘 FASE 2 SEÇÃO 4 QWEN: Atualizando botões dos cursos...');
        
        document.querySelectorAll('.course-card').forEach(card => {
            const courseId = card.dataset.courseId;
            const course = this.allCourses.find(c => c.id === courseId);
            const btn = card.querySelector('.course-action-btn');
            if (!btn || !course) return;

            const isEnrolled = this.currentUser && this.userEnrollments.includes(course.id);

            btn.classList.remove('login', 'enroll', 'continue');
            const btnText = btn.querySelector('.btn-text');
            const btnIcon = btn.querySelector('i');

            if (!this.currentUser) {
                btn.classList.add('login');
                btnText.textContent = 'Fazer Login';
                btnIcon.className = 'fas fa-sign-in-alt';
            } else if (isEnrolled) {
                btn.classList.add('continue');
                btnText.textContent = 'Continuar Curso';
                btnIcon.className = 'fas fa-play';
            } else {
                btn.classList.add('enroll');
                btnText.textContent = course.tipo === 'gratuito' ? 'Inscrever-se Grátis' : `Inscrever-se - R$ ${course.price.toFixed(2).replace('.', ',')}`;
                btnIcon.className = 'fas fa-plus';
            }
        });
        
        console.log('✅ FASE 2 SEÇÃO 4 QWEN: Botões atualizados');
    },

    // 🎯 FASE 2 SEÇÃO 4 QWEN: Manipulação de ações dos cursos
    handleCourseAction(courseId) {
        console.log('🎯 FASE 2 SEÇÃO 4 QWEN: Ação do curso:', courseId);
        
        if (!this.currentUser) {
            console.log('🔐 FASE 2 SEÇÃO 4 QWEN: Redirecionando para login...');
            this.showMessage('info', 'Faça login para acessar os cursos');
            setTimeout(() => {
                window.location.href = 'login-aluno.html';
            }, 1500);
            return;
        }

        const isEnrolled = this.userEnrollments.includes(courseId);
        if (isEnrolled) {
            this.navigateToCourseDetails(courseId);
        } else {
            this.enrollInCourse(courseId);
        }
    },

    // 🧭 FASE 2 SEÇÃO 4 QWEN: Navegação para detalhes do curso
    navigateToCourseDetails(courseId) {
        console.log('🧭 FASE 2 SEÇÃO 4 QWEN: Navegando para detalhes do curso:', courseId);
        const course = this.allCourses.find(c => c.id === courseId);
        if (!course) return;
        this.showMessage('info', `Carregando detalhes de "${course.title}"...`);
        setTimeout(() => {
            window.location.href = `curso-detalhes.html?curso=${courseId}`;
        }, 500);
    },

    // ✅ FASE 2 SEÇÃO 4 QWEN: Sistema de inscrição em cursos
    enrollInCourse(courseId) {
        console.log('✅ FASE 2 SEÇÃO 4 QWEN: Inscrevendo no curso:', courseId);
        
        const course = this.allCourses.find(c => c.id === courseId);
        if (!course) return;

        this.showMessage('info', 'Processando inscrição...');
        
        setTimeout(() => {
            this.userEnrollments.push(courseId);
            this.saveUserEnrollments();
            this.updateCourseButtons();
            
            const message = `Inscrição em "${course.title}" realizada com sucesso!`;
            this.showMessage('success', message);
            console.log('🎉 FASE 2 SEÇÃO 4 QWEN: Inscrição realizada com sucesso:', course.title);
        }, 1000);
    },

    // 🔍 FASE 2 SEÇÃO 4 QWEN: Sistema de filtros
    applyFilters() {
        console.log('🔍 FASE 2 SEÇÃO 4 QWEN: Aplicando filtros...');
        
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const areaFilter = document.getElementById('areaFilter')?.value || '';
        const nivelFilter = document.getElementById('nivelFilter')?.value || '';
        const tipoFilter = document.getElementById('tipoFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        
        const courseCards = document.querySelectorAll('.course-card');
        let visibleCount = 0;
        
        courseCards.forEach(card => {
            const courseId = card.dataset.courseId;
            const area = card.dataset.area;
            const nivel = card.dataset.nivel;
            const tipo = card.dataset.tipo;
            const title = card.querySelector('.course-title')?.textContent.toLowerCase() || '';
            
            const matchesSearch = !searchTerm || title.includes(searchTerm);
            const matchesArea = !areaFilter || area === areaFilter;
            const matchesNivel = !nivelFilter || nivel === nivelFilter;
            const matchesTipo = !tipoFilter || tipo === tipoFilter;
            
            let matchesStatus = true;
            if (this.currentUser && statusFilter) {
                const isEnrolled = this.userEnrollments.includes(courseId);
                if (statusFilter === 'enrolled') matchesStatus = isEnrolled;
                if (statusFilter === 'not-enrolled') matchesStatus = !isEnrolled;
            }
            
            const isVisible = matchesSearch && matchesArea && matchesNivel && matchesTipo && matchesStatus;
            
            card.style.display = isVisible ? 'flex' : 'none'; // Usar 'flex' para manter o layout do card
            if (isVisible) visibleCount++;
        });
        
        const coursesCountElement = document.getElementById('coursesCount');
        const coursesContainer = document.getElementById('coursesContainer');
        const noCoursesMessage = coursesContainer.querySelector('.no-courses-message');

        if (visibleCount > 0) {
            coursesCountElement.textContent = `${visibleCount} curso${visibleCount > 1 ? 's' : ''} encontrado${visibleCount > 1 ? 's' : ''}`;
            if(noCoursesMessage) noCoursesMessage.remove();
        } else {
            coursesCountElement.textContent = 'Nenhum curso encontrado';
            if(!noCoursesMessage) {
                coursesContainer.innerHTML += `
                    <div class="no-courses-message" style="grid-column: 1 / -1;">
                        <h3>Nenhum curso encontrado com os filtros aplicados.</h3>
                        <p>Tente ajustar suas opções de filtro ou limpar a busca.</p>
                    </div>
                `;
            }
        }
        
        console.log('✅ FASE 2 SEÇÃO 4 QWEN: Filtros aplicados. Cursos visíveis:', visibleCount);
    },

    // 💬 FASE 2 SEÇÃO 4 QWEN: Exibir mensagens dinâmicas
    showMessage(type, text) {
        const messageContainer = document.getElementById('messageContainer');
        if (!messageContainer) return;
        const messageText = messageContainer.querySelector('.message-text');
        const messageIcon = messageContainer.querySelector('.message-icon');

        messageContainer.className = `message-container ${type} show`;
        messageIcon.className = 'message-icon fas';

        switch (type) {
            case 'success': messageIcon.classList.add('fa-check-circle'); break;
            case 'error': messageIcon.classList.add('fa-times-circle'); break;
            case 'info': messageIcon.classList.add('fa-info-circle'); break;
            case 'warning': messageIcon.classList.add('fa-exclamation-triangle'); break;
        }
        messageText.textContent = text;

        setTimeout(() => messageContainer.classList.remove('show'), 3000);
    },

    // ➕ FASE 2 SEÇÃO 4 QWEN: Renderizar cursos dinamicamente
    renderCourses() {
        console.log('➕ FASE 2 SEÇÃO 4 QWEN: Renderizando cursos...');
        const coursesContainer = document.getElementById('coursesContainer');
        if (!coursesContainer) return;

        coursesContainer.innerHTML = ''; 

        this.allCourses.forEach(course => {
            const priceDisplay = course.tipo === 'gratuito' ? 'Gratuito' : `R$ ${course.price.toFixed(2).replace('.', ',')}`;
            const priceClass = course.tipo === 'gratuito' ? 'free' : '';

            const courseHTML = `
                <div class="course-card" data-course-id="${course.id}" data-area="${course.area}" data-nivel="${course.nivel}" data-tipo="${course.tipo}" style="display: flex;">
                    <div class="course-image">
                        <i class="fas fa-book-open"></i>
                    </div>
                    <div class="course-content">
                        <h3 class="course-title" style="cursor: pointer;">${course.title}</h3>
                        <p class="course-description">${course.description || 'Descrição do curso não disponível.'}</p>
                        <div class="course-meta">
                            <span class="course-price ${priceClass}">${priceDisplay}</span>
                        </div>
                        <div class="course-action">
                            <button class="course-action-btn" data-course-id="${course.id}">
                                <i class="fas fa-spinner fa-spin"></i> <span class="btn-text">Carregando...</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            coursesContainer.insertAdjacentHTML('beforeend', courseHTML);
        });

        this.updateCourseButtons();
        console.log('✅ FASE 2 SEÇÃO 4 QWEN: Cursos renderizados.');
    }
};

// Expor o logout globalmente para o header
function logout() {
    if (typeof authManager !== 'undefined') {
        authManager.logout();
        window.location.reload(); 
    }
}

// Inicialização ao carregar o DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM carregado, inicializando bibliotecaManager...');
    if (typeof bibliotecaManager !== 'undefined') {
        bibliotecaManager.init();
    } else {
        console.error('❌ bibliotecaManager não encontrado!');
    }
});