// 🚀 FASE 2 SEÇÃO 4 QWEN: Sistema de Biblioteca Integrada com Usuário Logado
// Implementação completa conforme metodologia Qwen - VERSÃO ATUALIZADA COM NAVEGAÇÃO

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
            price: 0
        },
        {
            id: 'gestao-cultural',
            title: 'Gestão de Projetos Culturais',
            area: 'artes',
            nivel: 'intermediario',
            tipo: 'pago',
            price: 350
        },
        {
            id: 'educacao-inclusiva',
            title: 'Educação Especial na Perspectiva Inclusiva',
            area: 'educacao',
            nivel: 'avancado',
            tipo: 'gratuito',
            price: 0
        }
    ],

    // 🚀 FASE 2 SEÇÃO 4 QWEN: Inicialização do sistema
    init() {
        console.log('🚀 FASE 2 SEÇÃO 4 QWEN: Inicializando biblioteca integrada...');
        
        this.checkAuthentication();
        this.loadUserEnrollments();
        this.setupEventListeners();
        this.updateUI();
        
        console.log('✅ FASE 2 SEÇÃO 4 QWEN: Biblioteca inicializada com sucesso');
    },

    // 🔍 FASE 2 SEÇÃO 4 QWEN: Verificação de autenticação
    checkAuthentication() {
        console.log('🔍 FASE 2 SEÇÃO 4 QWEN: Verificando autenticação...');
        
        try {
            // Integração com auth.js da Seção 3
            if (typeof authManager !== 'undefined' && authManager.isAuthenticated()) {
                this.currentUser = authManager.getCurrentUser();
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
        
        // Filtro de status do usuário
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }

        // Botões de ação dos cursos
        document.querySelectorAll('.course-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const courseId = e.target.closest('.course-action-btn').dataset.courseId;
                this.handleCourseAction(courseId);
            });
        });

        // FASE 2 SEÇÃO 4 QWEN: Event listeners para títulos dos cursos (navegação para detalhes)
        document.querySelectorAll('.course-card h3').forEach(title => {
            title.style.cursor = 'pointer';
            title.addEventListener('click', (e) => {
                const courseCard = e.target.closest('.course-card');
                const courseId = courseCard.dataset.courseId;
                this.navigateToCourseDetails(courseId);
            });
        });

        // Outros filtros existentes
        document.getElementById('searchInput')?.addEventListener('input', () => this.applyFilters());
        document.getElementById('areaFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('nivelFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('tipoFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('clearFilters')?.addEventListener('click', () => this.clearAllFilters());
        
        console.log('✅ FASE 2 SEÇÃO 4 QWEN: Event listeners configurados');
    },

    // 🔄 FASE 2 SEÇÃO 4 QWEN: Atualização da interface
    updateUI() {
        console.log('🔄 FASE 2 SEÇÃO 4 QWEN: Atualizando interface...');
        
        this.updateCourseButtons();
        this.updateEnrollmentStatus();
        this.applyFilters();
        
        console.log('✅ FASE 2 SEÇÃO 4 QWEN: Interface atualizada');
    },

    // 🔗 FASE 2 SEÇÃO 4 QWEN: Atualização do header de autenticação
    updateAuthHeader() {
        const authSection = document.getElementById('authSection');
        if (!authSection) return;

        if (this.currentUser) {
            authSection.innerHTML = `
                <button class="login-button">${this.currentUser.name}</button>
                <div class="dropdown-content">
                    <a href="dashboard-aluno.html" class="dropdown-item">
                        <i class="fas fa-tachometer-alt"></i> Dashboard
                    </a>
                    <a href="perfil-aluno.html" class="dropdown-item">
                        <i class="fas fa-user"></i> Perfil
                    </a>
                    <a href="#" class="dropdown-item" onclick="logout()">
                        <i class="fas fa-sign-out-alt"></i> Sair
                    </a>
                </div>
            `;
        } else {
            authSection.innerHTML = `
                <button class="login-button">Login</button>
                <div class="dropdown-content">
                    <a href="login-aluno.html" class="dropdown-item">
                        <i class="fas fa-user-graduate"></i> Aluno
                    </a>
                    <a href="login-instrutor.html" class="dropdown-item">
                        <i class="fas fa-chalkboard-teacher"></i> Instrutor
                    </a>
                    <a href="login-admin.html" class="dropdown-item">
                        <i class="fas fa-user-shield"></i> Admin
                    </a>
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
        
        this.allCourses.forEach(course => {
            const btn = document.getElementById(`btn-${course.id}`);
            if (!btn) return;

            const isEnrolled = this.userEnrollments.includes(course.id);
            const btnText = btn.querySelector('.btn-text');
            const btnIcon = btn.querySelector('i');

            if (!this.currentUser) {
                // Usuário não logado
                btnText.textContent = 'Fazer Login';
                btnIcon.className = 'fas fa-sign-in-alt';
                btn.className = 'btn-secondary course-action-btn';
            } else if (isEnrolled) {
                // Usuário inscrito
                btnText.textContent = 'Continuar Curso';
                btnIcon.className = 'fas fa-play';
                btn.className = 'btn-primary course-action-btn';
            } else {
                // Usuário não inscrito
                btnText.textContent = course.tipo === 'gratuito' ? 'Inscrever-se Grátis' : `Inscrever-se - R$ ${course.price}`;
                btnIcon.className = 'fas fa-plus';
                btn.className = 'btn-success course-action-btn';
            }
        });
        
        console.log('✅ FASE 2 SEÇÃO 4 QWEN: Botões atualizados');
    },

    // 📊 FASE 2 SEÇÃO 4 QWEN: Atualização do status de inscrição
    updateEnrollmentStatus() {
        console.log('📊 FASE 2 SEÇÃO 4 QWEN: Atualizando status de inscrição...');
        
        if (!this.currentUser) return;

        this.allCourses.forEach(course => {
            const statusElement = document.getElementById(`status-${course.id}`);
            if (!statusElement) return;

            const isEnrolled = this.userEnrollments.includes(course.id);
            
            if (isEnrolled) {
                statusElement.innerHTML = '<i class="fas fa-check-circle"></i> Inscrito';
                statusElement.className = 'enrollment-status enrolled';
                statusElement.style.display = 'block';
            } else {
                statusElement.style.display = 'none';
            }
        });
        
        console.log('✅ FASE 2 SEÇÃO 4 QWEN: Status de inscrição atualizado');
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

        const course = this.allCourses.find(c => c.id === courseId);
        if (!course) {
            console.log('❌ FASE 2 SEÇÃO 4 QWEN: Curso não encontrado:', courseId);
            return;
        }

        const isEnrolled = this.userEnrollments.includes(courseId);

        if (isEnrolled) {
            // Continuar curso - navegar para detalhes
            console.log('▶️ FASE 2 SEÇÃO 4 QWEN: Continuando curso:', course.title);
            this.navigateToCourseDetails(courseId);
        } else {
            // Inscrever-se no curso
            this.enrollInCourse(courseId);
        }
    },

    // 🧭 FASE 2 SEÇÃO 4 QWEN: Navegação para detalhes do curso
    navigateToCourseDetails(courseId) {
        console.log('🧭 FASE 2 SEÇÃO 4 QWEN: Navegando para detalhes do curso:', courseId);
        
        const course = this.allCourses.find(c => c.id === courseId);
        if (!course) {
            console.log('❌ FASE 2 SEÇÃO 4 QWEN: Curso não encontrado para navegação:', courseId);
            return;
        }

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

        // Simular processo de inscrição
        this.showMessage('info', 'Processando inscrição...');
        
        setTimeout(() => {
            // Adicionar à lista de inscrições
            this.userEnrollments.push(courseId);
            this.saveUserEnrollments();
            
            // Atualizar interface
            this.updateCourseButtons();
            this.updateEnrollmentStatus();
            
            // Feedback de sucesso
            const message = course.tipo === 'gratuito' 
                ? `Parabéns! Você foi inscrito em "${course.title}" com sucesso!`
                : `Inscrição em "${course.title}" realizada com sucesso! Valor: R$ ${course.price}`;
            
            this.showMessage('success', message);
            
            console.log('🎉 FASE 2 SEÇÃO 4 QWEN: Inscrição realizada com sucesso:', course.title);
        }, 1500);
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
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const description = card.querySelector('p')?.textContent.toLowerCase() || '';
            
            // Filtro de busca
            const matchesSearch = !searchTerm || title.includes(searchTerm) || description.includes(searchTerm);
            
            // Filtros de categoria
            const matchesArea = !areaFilter || area === areaFilter;
            const matchesNivel = !nivelFilter || nivel === nivelFilter;
            const matchesTipo = !tipoFilter || tipo === tipoFilter;
            
            // Filtro de status do usuário
            let matchesStatus = true;
            if (statusFilter && this.currentUser) {
                const isEnrolled = this.userEnrollments.includes(courseId);
                if (statusFilter === 'inscrito') {
                    matchesStatus = isEnrolled;
                } else if (statusFilter === 'disponivel') {
                    matchesStatus = !isEnrolled;
                }
            }
            
            const isVisible = matchesSearch && matchesArea && matchesNivel && matchesTipo && matchesStatus;
            
            card.style.display = isVisible ? 'block' : 'none';
            if (isVisible) visibleCount++;
        });
        
        // Atualizar contador de resultados
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            resultsCount.textContent = `${visibleCount} curso${visibleCount !== 1 ? 's' : ''} encontrado${visibleCount !== 1 ? 's' : ''}`;
        }
        
        // Mostrar/ocultar mensagem de "nenhum resultado"
        const noResults = document.getElementById('noResults');
        if (noResults) {
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }
        
        console.log('✅ FASE 2 SEÇÃO 4 QWEN: Filtros aplicados, cursos visíveis:', visibleCount);
    },

    // 🧹 FASE 2 SEÇÃO 4 QWEN: Limpeza de filtros
    clearAllFilters() {
        console.log('🧹 FASE 2 SEÇÃO 4 QWEN: Limpando todos os filtros...');
        
        document.getElementById('searchInput').value = '';
        document.getElementById('areaFilter').value = '';
        document.getElementById('nivelFilter').value = '';
        document.getElementById('tipoFilter').value = '';
        
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.value = '';
        }
        
        this.applyFilters();
        this.showMessage('info', 'Filtros limpos');
        
        console.log('✅ FASE 2 SEÇÃO 4 QWEN: Filtros limpos');
    },

    // 📢 FASE 2 SEÇÃO 4 QWEN: Sistema de mensagens
    showMessage(type, text) {
        console.log(`📢 FASE 2 SEÇÃO 4 QWEN: Mensagem (${type}): ${text}`);
        
        const messageContainer = document.getElementById('message-container');
        if (!messageContainer) return;
        
        const messageIcon = messageContainer.querySelector('.message-icon');
        const messageText = messageContainer.querySelector('.message-text');
        
        // Configurar ícone baseado no tipo
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle'
        };
        
        messageIcon.className = `message-icon ${icons[type] || icons.info}`;
        messageText.textContent = text;
        messageContainer.className = `message-container ${type}`;
        messageContainer.style.display = 'block';
        
        // Auto-ocultar após 3 segundos
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 3000);
    }
};

// 🚀 FASE 2 SEÇÃO 4 QWEN: Função global para compatibilidade
function accessCourse(courseId) {
    console.log('🔗 FASE 2 SEÇÃO 4 QWEN: Função legacy accessCourse chamada:', courseId);
    bibliotecaManager.handleCourseAction(courseId);
}

// 🚀 FASE 2 SEÇÃO 4 QWEN: Logs de inicialização
console.log('🚀 FASE 2 SEÇÃO 4 QWEN: Script biblioteca-fase2.js carregado - VERSÃO ATUALIZADA');
console.log('🎯 FASE 2 SEÇÃO 4 QWEN: Metodologia Qwen - Sistema de Biblioteca Integrada');
console.log('✅ FASE 2 SEÇÃO 4 QWEN: Funcionalidades implementadas:');
console.log('   - Filtros por usuário logado');
console.log('   - Sistema de inscrições simulado');
console.log('   - Navegação para detalhes/aulas dos cursos');
console.log('   - Integração com autenticação da Seção 3');
console.log('   - Persistência no localStorage');
console.log('   - Feedback visual completo');

