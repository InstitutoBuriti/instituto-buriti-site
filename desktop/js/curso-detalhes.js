// 🚀 FASE 2 SEÇÃO 4 QWEN: Sistema de Detalhes do Curso
// Implementação completa conforme metodologia Qwen

const cursoDetalhesManager = {
    // Estado da aplicação
    currentUser: null,
    currentCourse: null,
    userEnrollments: [],
    userProgress: {},
    
    // Dados dos cursos (sincronizado com biblioteca-fase2.js)
    coursesData: {
        'ia-fundamentos': {
            id: 'ia-fundamentos',
            title: 'Fundamentos da Inteligência Artificial',
            description: 'Domine os conceitos fundamentais de IA e machine learning com aplicações práticas. Aprenda desde os algoritmos básicos até implementações reais.',
            area: 'tecnologia',
            nivel: 'basico',
            tipo: 'gratuito',
            price: 0,
            duration: '40 horas',
            students: '1.2k alunos',
            rating: 4.8,
            instructor: {
                name: 'Dr. Carlos Mendes',
                image: '../upload/IMG_1885.JPG'
            },
            image: '../upload/ChatGPTImage19dejul.de2025,19_04_54.png',
            overview: 'Este curso abrangente oferece uma introdução sólida aos conceitos fundamentais da Inteligência Artificial. Você aprenderá sobre algoritmos de machine learning, redes neurais, processamento de linguagem natural e visão computacional. O curso combina teoria e prática, com projetos hands-on que demonstram aplicações reais da IA.',
            objectives: [
                'Compreender os conceitos fundamentais de IA e Machine Learning',
                'Implementar algoritmos básicos de aprendizado supervisionado e não supervisionado',
                'Trabalhar com redes neurais e deep learning',
                'Aplicar técnicas de processamento de linguagem natural',
                'Desenvolver projetos práticos com Python e bibliotecas de IA'
            ],
            prerequisites: 'Conhecimentos básicos de programação (Python recomendado) e matemática do ensino médio.',
            modules: [
                {
                    title: 'Introdução à Inteligência Artificial',
                    lessons: ['História da IA', 'Tipos de IA', 'Aplicações Atuais', 'Ética em IA', 'Ferramentas e Linguagens'],
                    duration: '8 horas'
                },
                {
                    title: 'Machine Learning Fundamentals',
                    lessons: ['Aprendizado Supervisionado', 'Aprendizado Não Supervisionado', 'Algoritmos Clássicos', 'Avaliação de Modelos', 'Projeto Prático 1'],
                    duration: '10 horas'
                },
                {
                    title: 'Redes Neurais e Deep Learning',
                    lessons: ['Perceptron', 'Redes Neurais Multicamadas', 'Backpropagation', 'CNNs', 'RNNs'],
                    duration: '12 horas'
                },
                {
                    title: 'Processamento de Linguagem Natural',
                    lessons: ['Tokenização', 'Análise de Sentimentos', 'Word Embeddings', 'Transformers', 'Projeto Prático 2'],
                    duration: '8 horas'
                },
                {
                    title: 'Projeto Final',
                    lessons: ['Definição do Projeto', 'Desenvolvimento', 'Testes', 'Apresentação', 'Avaliação'],
                    duration: '2 horas'
                }
            ]
        },
        'gestao-cultural': {
            id: 'gestao-cultural',
            title: 'Gestão de Projetos Culturais',
            description: 'Aprenda a elaborar, executar e gerenciar projetos culturais de sucesso. Desde a concepção até a prestação de contas.',
            area: 'artes',
            nivel: 'intermediario',
            tipo: 'pago',
            price: 350,
            duration: '60 horas',
            students: '850 alunos',
            rating: 4.9,
            instructor: {
                name: 'Maria Santos',
                image: '../upload/IMG_F027CED18C1C-1.jpeg'
            },
            image: '../upload/imagemóperasite.jpg',
            overview: 'Um curso completo para profissionais que desejam atuar na gestão de projetos culturais. Aborda desde a concepção e planejamento até a execução e prestação de contas, incluindo captação de recursos, marketing cultural e avaliação de impacto.',
            objectives: [
                'Elaborar projetos culturais consistentes e viáveis',
                'Dominar técnicas de captação de recursos e financiamento',
                'Gerenciar equipes e cronogramas de projetos culturais',
                'Aplicar estratégias de marketing e comunicação cultural',
                'Realizar prestação de contas e avaliação de resultados'
            ],
            prerequisites: 'Experiência básica em gestão ou interesse comprovado na área cultural.',
            modules: [
                {
                    title: 'Fundamentos da Gestão Cultural',
                    lessons: ['Conceitos Básicos', 'Políticas Culturais', 'Mercado Cultural', 'Legislação', 'Ética Profissional'],
                    duration: '12 horas'
                },
                {
                    title: 'Elaboração de Projetos',
                    lessons: ['Diagnóstico', 'Objetivos e Metas', 'Metodologia', 'Cronograma', 'Orçamento'],
                    duration: '15 horas'
                },
                {
                    title: 'Captação de Recursos',
                    lessons: ['Fontes de Financiamento', 'Editais Públicos', 'Patrocínio Privado', 'Crowdfunding', 'Estratégias de Captação'],
                    duration: '12 horas'
                },
                {
                    title: 'Execução e Gestão',
                    lessons: ['Gestão de Equipes', 'Controle Financeiro', 'Logística', 'Comunicação', 'Resolução de Problemas'],
                    duration: '15 horas'
                },
                {
                    title: 'Avaliação e Prestação de Contas',
                    lessons: ['Indicadores de Resultado', 'Relatórios', 'Prestação de Contas', 'Avaliação de Impacto', 'Projeto Final'],
                    duration: '6 horas'
                }
            ]
        },
        'educacao-inclusiva': {
            id: 'educacao-inclusiva',
            title: 'Educação Especial na Perspectiva Inclusiva',
            description: 'Explore metodologias inovadoras para uma educação mais inclusiva e acessível. Teoria e prática para transformar vidas.',
            area: 'educacao',
            nivel: 'avancado',
            tipo: 'gratuito',
            price: 0,
            duration: '80 horas',
            students: '2.1k alunos',
            rating: 4.7,
            instructor: {
                name: 'Prof. Ana Oliveira',
                image: '../upload/IMG_1885.JPG'
            },
            image: '../upload/IMG_65A477CACFA8-1.jpeg',
            overview: 'Este curso avançado aborda as mais recentes metodologias e práticas em educação inclusiva. Destinado a educadores, gestores e profissionais da educação que buscam criar ambientes verdadeiramente inclusivos e acessíveis para todos os estudantes.',
            objectives: [
                'Compreender os fundamentos teóricos da educação inclusiva',
                'Desenvolver estratégias pedagógicas adaptadas',
                'Implementar tecnologias assistivas em sala de aula',
                'Criar planos educacionais individualizados',
                'Promover a participação ativa de todos os estudantes'
            ],
            prerequisites: 'Formação em educação ou áreas afins. Experiência em sala de aula é recomendada.',
            modules: [
                {
                    title: 'Fundamentos da Educação Inclusiva',
                    lessons: ['História da Educação Especial', 'Marcos Legais', 'Paradigmas Atuais', 'Direitos Humanos', 'Diversidade e Diferença'],
                    duration: '16 horas'
                },
                {
                    title: 'Deficiências e Necessidades Especiais',
                    lessons: ['Deficiência Intelectual', 'Deficiências Sensoriais', 'Deficiências Físicas', 'Transtornos do Espectro Autista', 'Altas Habilidades'],
                    duration: '20 horas'
                },
                {
                    title: 'Metodologias e Estratégias',
                    lessons: ['Desenho Universal', 'Adaptações Curriculares', 'Metodologias Ativas', 'Avaliação Inclusiva', 'Projeto Pedagógico'],
                    duration: '20 horas'
                },
                {
                    title: 'Tecnologias Assistivas',
                    lessons: ['Recursos de Acessibilidade', 'Software Educativo', 'Comunicação Alternativa', 'Ferramentas Digitais', 'Implementação Prática'],
                    duration: '16 horas'
                },
                {
                    title: 'Prática e Avaliação',
                    lessons: ['Estudos de Caso', 'Plano de Ação', 'Implementação', 'Avaliação de Resultados', 'Apresentação Final'],
                    duration: '8 horas'
                }
            ]
        }
    },

    // 🚀 FASE 2 SEÇÃO 4 QWEN: Inicialização do sistema
    init() {
        console.log('🚀 FASE 2 SEÇÃO 4 QWEN: Inicializando detalhes do curso...');
        
        this.checkAuthentication();
        this.loadCourseFromURL();
        this.loadUserData();
        this.setupEventListeners();
        this.updateUI();
        
        console.log('✅ FASE 2 SEÇÃO 4 QWEN: Detalhes do curso inicializados');
    },

    // 🔍 FASE 2 SEÇÃO 4 QWEN: Verificação de autenticação
    checkAuthentication() {
        console.log('🔍 FASE 2 SEÇÃO 4 QWEN: Verificando autenticação...');
        
        try {
            if (typeof authManager !== 'undefined' && authManager.isAuthenticated()) {
                this.currentUser = authManager.getCurrentUser();
                console.log('✅ FASE 2 SEÇÃO 4 QWEN: Usuário autenticado:', this.currentUser.name);
                this.updateAuthHeader();
            } else {
                console.log('⚠️ FASE 2 SEÇÃO 4 QWEN: Usuário não autenticado');
                this.updateAuthHeader();
            }
        } catch (error) {
            console.log('❌ FASE 2 SEÇÃO 4 QWEN: Erro na verificação de autenticação:', error);
            this.updateAuthHeader();
        }
    },

    // 📖 FASE 2 SEÇÃO 4 QWEN: Carregamento do curso pela URL
    loadCourseFromURL() {
        console.log('📖 FASE 2 SEÇÃO 4 QWEN: Carregando curso da URL...');
        
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('curso') || 'ia-fundamentos'; // Default para demonstração
        
        this.currentCourse = this.coursesData[courseId];
        
        if (!this.currentCourse) {
            console.log('❌ FASE 2 SEÇÃO 4 QWEN: Curso não encontrado:', courseId);
            this.showMessage('error', 'Curso não encontrado');
            return;
        }
        
        console.log('✅ FASE 2 SEÇÃO 4 QWEN: Curso carregado:', this.currentCourse.title);
    },

    // 👤 FASE 2 SEÇÃO 4 QWEN: Carregamento de dados do usuário
    loadUserData() {
        console.log('👤 FASE 2 SEÇÃO 4 QWEN: Carregando dados do usuário...');
        
        if (!this.currentUser) {
            console.log('⚠️ FASE 2 SEÇÃO 4 QWEN: Usuário não logado');
            return;
        }

        try {
            // Carregar inscrições
            const enrollmentsKey = `enrollments_${this.currentUser.id}`;
            const savedEnrollments = localStorage.getItem(enrollmentsKey);
            this.userEnrollments = savedEnrollments ? JSON.parse(savedEnrollments) : [];
            
            // Carregar progresso
            const progressKey = `progress_${this.currentUser.id}`;
            const savedProgress = localStorage.getItem(progressKey);
            this.userProgress = savedProgress ? JSON.parse(savedProgress) : {};
            
            console.log('✅ FASE 2 SEÇÃO 4 QWEN: Dados do usuário carregados');
        } catch (error) {
            console.log('❌ FASE 2 SEÇÃO 4 QWEN: Erro ao carregar dados do usuário:', error);
        }
    },

    // 🎛️ FASE 2 SEÇÃO 4 QWEN: Configuração de event listeners
    setupEventListeners() {
        console.log('🎛️ FASE 2 SEÇÃO 4 QWEN: Configurando event listeners...');
        
        // Botão principal de ação
        const mainActionBtn = document.getElementById('mainActionBtn');
        if (mainActionBtn) {
            mainActionBtn.addEventListener('click', () => this.handleMainAction());
        }

        // Botão de ação rápida
        const quickEnrollBtn = document.getElementById('quickEnrollBtn');
        if (quickEnrollBtn) {
            quickEnrollBtn.addEventListener('click', () => this.handleMainAction());
        }

        // Abas de navegação
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                this.switchTab(tabId);
            });
        });
        
        console.log('✅ FASE 2 SEÇÃO 4 QWEN: Event listeners configurados');
    },

    // 🔄 FASE 2 SEÇÃO 4 QWEN: Atualização da interface
    updateUI() {
        console.log('🔄 FASE 2 SEÇÃO 4 QWEN: Atualizando interface...');
        
        if (!this.currentCourse) {
            console.log('❌ FASE 2 SEÇÃO 4 QWEN: Nenhum curso para exibir');
            return;
        }

        this.updateCourseInfo();
        this.updateActionButtons();
        this.updateProgress();
        this.loadCurriculum();
        this.loadRelatedCourses();
        
        console.log('✅ FASE 2 SEÇÃO 4 QWEN: Interface atualizada');
    },

    // 📋 FASE 2 SEÇÃO 4 QWEN: Atualização das informações do curso
    updateCourseInfo() {
        const course = this.currentCourse;
        
        // Breadcrumb
        document.getElementById('courseBreadcrumb').textContent = course.title;
        
        // Cabeçalho
        document.getElementById('courseCategory').innerHTML = `
            <i class="fas fa-${this.getCategoryIcon(course.area)}"></i>
            <span>${this.getCategoryName(course.area)}</span>
        `;
        document.getElementById('courseTitle').textContent = course.title;
        document.getElementById('courseDescription').textContent = course.description;
        
        // Meta informações
        document.getElementById('courseDuration').textContent = course.duration;
        document.getElementById('courseStudents').textContent = course.students;
        document.getElementById('courseRating').textContent = course.rating;
        document.getElementById('courseLevel').textContent = this.getLevelName(course.nivel);
        
        // Instrutor
        document.getElementById('instructorImage').src = course.instructor.image;
        document.getElementById('instructorName').textContent = course.instructor.name;
        
        // Preço
        const priceElement = document.getElementById('coursePrice');
        if (course.tipo === 'gratuito') {
            priceElement.innerHTML = `
                <span class="price-label">Preço</span>
                <span class="price-value free">Gratuito</span>
            `;
        } else {
            priceElement.innerHTML = `
                <span class="price-label">Preço</span>
                <span class="price-value">R$ ${course.price}</span>
            `;
        }
        
        // Visão geral
        document.getElementById('courseOverview').innerHTML = `<p>${course.overview}</p>`;
        
        // Objetivos
        const objectivesList = document.getElementById('learningObjectives');
        objectivesList.innerHTML = course.objectives.map(obj => `<li>${obj}</li>`).join('');
        
        // Pré-requisitos
        document.getElementById('prerequisites').innerHTML = `<p>${course.prerequisites}</p>`;
    },

    // 🔘 FASE 2 SEÇÃO 4 QWEN: Atualização dos botões de ação
    updateActionButtons() {
        const isEnrolled = this.userEnrollments.includes(this.currentCourse.id);
        const mainBtn = document.getElementById('mainActionBtn');
        const quickBtn = document.getElementById('quickEnrollBtn');
        
        if (!this.currentUser) {
            // Usuário não logado
            mainBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i><span>Fazer Login</span>';
            mainBtn.className = 'btn-secondary course-main-action';
            quickBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i><span>Login</span>';
        } else if (isEnrolled) {
            // Usuário inscrito
            mainBtn.innerHTML = '<i class="fas fa-play"></i><span>Continuar Curso</span>';
            mainBtn.className = 'btn-primary course-main-action';
            quickBtn.innerHTML = '<i class="fas fa-play"></i><span>Continuar</span>';
        } else {
            // Usuário não inscrito
            const btnText = this.currentCourse.tipo === 'gratuito' ? 'Inscrever-se Grátis' : `Inscrever-se - R$ ${this.currentCourse.price}`;
            mainBtn.innerHTML = `<i class="fas fa-plus"></i><span>${btnText}</span>`;
            mainBtn.className = 'btn-success course-main-action';
            quickBtn.innerHTML = '<i class="fas fa-plus"></i><span>Inscrever-se</span>';
        }
    },

    // 📊 FASE 2 SEÇÃO 4 QWEN: Atualização do progresso
    updateProgress() {
        if (!this.currentUser || !this.userEnrollments.includes(this.currentCourse.id)) {
            return;
        }

        const progressElement = document.getElementById('courseProgress');
        const userProgress = this.userProgress[this.currentCourse.id] || 0;
        
        progressElement.style.display = 'block';
        progressElement.querySelector('.progress-percentage').textContent = `${userProgress}%`;
        progressElement.querySelector('.progress-fill').style.width = `${userProgress}%`;
    },

    // 📚 FASE 2 SEÇÃO 4 QWEN: Carregamento do currículo
    loadCurriculum() {
        const modulesList = document.getElementById('modulesList');
        const course = this.currentCourse;
        
        modulesList.innerHTML = course.modules.map((module, index) => `
            <div class="module-item">
                <div class="module-header">
                    <h4>
                        <i class="fas fa-folder"></i>
                        Módulo ${index + 1}: ${module.title}
                    </h4>
                    <span class="module-duration">${module.duration}</span>
                </div>
                <div class="lessons-list">
                    ${module.lessons.map((lesson, lessonIndex) => `
                        <div class="lesson-item">
                            <i class="fas fa-play-circle"></i>
                            <span>Aula ${lessonIndex + 1}: ${lesson}</span>
                            <span class="lesson-duration">~${Math.ceil(parseInt(module.duration) / module.lessons.length)}h</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    },

    // 🔗 FASE 2 SEÇÃO 4 QWEN: Carregamento de cursos relacionados
    loadRelatedCourses() {
        const relatedContainer = document.getElementById('relatedCourses');
        const currentArea = this.currentCourse.area;
        
        const relatedCourses = Object.values(this.coursesData)
            .filter(course => course.id !== this.currentCourse.id && course.area === currentArea)
            .slice(0, 2);
        
        if (relatedCourses.length === 0) {
            relatedContainer.innerHTML = '<p>Nenhum curso relacionado encontrado.</p>';
            return;
        }
        
        relatedContainer.innerHTML = relatedCourses.map(course => `
            <div class="related-course-item">
                <img src="${course.image}" alt="${course.title}">
                <div class="related-course-info">
                    <h5>${course.title}</h5>
                    <span class="related-course-meta">
                        <i class="fas fa-star"></i> ${course.rating}
                    </span>
                    <a href="curso-detalhes.html?curso=${course.id}" class="related-course-link">
                        Ver Detalhes
                    </a>
                </div>
            </div>
        `).join('');
    },

    // 🎯 FASE 2 SEÇÃO 4 QWEN: Manipulação da ação principal
    handleMainAction() {
        console.log('🎯 FASE 2 SEÇÃO 4 QWEN: Ação principal executada');
        
        if (!this.currentUser) {
            console.log('🔐 FASE 2 SEÇÃO 4 QWEN: Redirecionando para login...');
            this.showMessage('info', 'Faça login para acessar o curso');
            setTimeout(() => {
                window.location.href = 'login-aluno.html';
            }, 1500);
            return;
        }

        const isEnrolled = this.userEnrollments.includes(this.currentCourse.id);

        if (isEnrolled) {
            // Continuar curso
            console.log('▶️ FASE 2 SEÇÃO 4 QWEN: Continuando curso');
            this.showMessage('success', 'Continuando curso...');
            setTimeout(() => {
                this.showMessage('info', 'Página de aulas em desenvolvimento');
            }, 1000);
        } else {
            // Inscrever-se no curso
            this.enrollInCourse();
        }
    },

    // ✅ FASE 2 SEÇÃO 4 QWEN: Sistema de inscrição
    enrollInCourse() {
        console.log('✅ FASE 2 SEÇÃO 4 QWEN: Inscrevendo no curso');
        
        this.showMessage('info', 'Processando inscrição...');
        
        setTimeout(() => {
            // Adicionar à lista de inscrições
            this.userEnrollments.push(this.currentCourse.id);
            this.saveUserEnrollments();
            
            // Inicializar progresso
            this.userProgress[this.currentCourse.id] = 0;
            this.saveUserProgress();
            
            // Atualizar interface
            this.updateActionButtons();
            this.updateProgress();
            
            // Feedback de sucesso
            const message = this.currentCourse.tipo === 'gratuito' 
                ? `Parabéns! Você foi inscrito em "${this.currentCourse.title}" com sucesso!`
                : `Inscrição em "${this.currentCourse.title}" realizada com sucesso! Valor: R$ ${this.currentCourse.price}`;
            
            this.showMessage('success', message);
            
            console.log('🎉 FASE 2 SEÇÃO 4 QWEN: Inscrição realizada com sucesso');
        }, 1500);
    },

    // 💾 FASE 2 SEÇÃO 4 QWEN: Salvamento de inscrições
    saveUserEnrollments() {
        if (!this.currentUser) return;
        
        try {
            const enrollmentsKey = `enrollments_${this.currentUser.id}`;
            localStorage.setItem(enrollmentsKey, JSON.stringify(this.userEnrollments));
            console.log('💾 FASE 2 SEÇÃO 4 QWEN: Inscrições salvas');
        } catch (error) {
            console.log('❌ FASE 2 SEÇÃO 4 QWEN: Erro ao salvar inscrições:', error);
        }
    },

    // 💾 FASE 2 SEÇÃO 4 QWEN: Salvamento de progresso
    saveUserProgress() {
        if (!this.currentUser) return;
        
        try {
            const progressKey = `progress_${this.currentUser.id}`;
            localStorage.setItem(progressKey, JSON.stringify(this.userProgress));
            console.log('💾 FASE 2 SEÇÃO 4 QWEN: Progresso salvo');
        } catch (error) {
            console.log('❌ FASE 2 SEÇÃO 4 QWEN: Erro ao salvar progresso:', error);
        }
    },

    // 🔄 FASE 2 SEÇÃO 4 QWEN: Troca de abas
    switchTab(tabId) {
        console.log('🔄 FASE 2 SEÇÃO 4 QWEN: Trocando para aba:', tabId);
        
        // Atualizar botões
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        
        // Atualizar conteúdo
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');
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

    // 📢 FASE 2 SEÇÃO 4 QWEN: Sistema de mensagens
    showMessage(type, text) {
        console.log(`📢 FASE 2 SEÇÃO 4 QWEN: Mensagem (${type}): ${text}`);
        
        const messageContainer = document.getElementById('message-container');
        if (!messageContainer) return;
        
        const messageIcon = messageContainer.querySelector('.message-icon');
        const messageText = messageContainer.querySelector('.message-text');
        
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
        
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 3000);
    },

    // 🏷️ FASE 2 SEÇÃO 4 QWEN: Funções auxiliares
    getCategoryIcon(area) {
        const icons = {
            tecnologia: 'robot',
            artes: 'palette',
            educacao: 'graduation-cap',
            negocios: 'briefcase'
        };
        return icons[area] || 'tag';
    },

    getCategoryName(area) {
        const names = {
            tecnologia: 'Tecnologia',
            artes: 'Artes',
            educacao: 'Educação',
            negocios: 'Negócios'
        };
        return names[area] || area;
    },

    getLevelName(nivel) {
        const names = {
            basico: 'Básico',
            intermediario: 'Intermediário',
            avancado: 'Avançado'
        };
        return names[nivel] || nivel;
    }
};

// 🚀 FASE 2 SEÇÃO 4 QWEN: Logs de inicialização
console.log('🚀 FASE 2 SEÇÃO 4 QWEN: Script curso-detalhes.js carregado');
console.log('🎯 FASE 2 SEÇÃO 4 QWEN: Metodologia Qwen - Sistema de Detalhes do Curso');
console.log('✅ FASE 2 SEÇÃO 4 QWEN: Funcionalidades implementadas:');
console.log('   - Página completa de detalhes do curso');
console.log('   - Sistema de inscrições integrado');
console.log('   - Navegação por abas (Visão Geral, Currículo, Avaliações)');
console.log('   - Progresso do usuário');
console.log('   - Cursos relacionados');

