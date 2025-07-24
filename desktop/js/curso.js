/**
 * Sistema de Curso - Instituto Buriti
 * Funcionalidades: Player, Navegação, Anotações, Progresso
 */

class CursoManager {
    constructor() {
        this.currentLesson = 4;
        this.totalLessons = 10;
        this.courseData = this.initCourseData();
        this.userNotes = {};
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCourseFromURL();
        this.updateProgress();
        this.loadUserNotes();
        this.verificarAutenticacao();
    }

    initCourseData() {
        return {
            'ia-fundamentos': {
                title: 'Fundamentos da Inteligência Artificial',
                category: 'Tecnologia',
                instructor: 'Dr. Carlos Mendes',
                lessons: [
                    { id: 1, title: 'O que é Inteligência Artificial?', duration: '15min', videoId: 'dQw4w9WgXcQ', completed: true },
                    { id: 2, title: 'História e Evolução da IA', duration: '20min', videoId: 'dQw4w9WgXcQ', completed: true },
                    { id: 3, title: 'Tipos de IA: Fraca vs Forte', duration: '18min', videoId: 'dQw4w9WgXcQ', completed: true },
                    { id: 4, title: 'Aplicações Práticas da IA', duration: '25min', videoId: 'dQw4w9WgXcQ', completed: false },
                    { id: 5, title: 'Introdução ao Machine Learning', duration: '30min', videoId: 'dQw4w9WgXcQ', completed: false },
                    { id: 6, title: 'Algoritmos Supervisionados', duration: '45min', videoId: 'dQw4w9WgXcQ', completed: false },
                    { id: 7, title: 'Fundamentos de Redes Neurais', duration: '40min', videoId: 'dQw4w9WgXcQ', completed: false }
                ]
            },
            'gestao-cultural': {
                title: 'Gestão de Projetos Culturais',
                category: 'Artes',
                instructor: 'Maria Santos',
                lessons: [
                    { id: 1, title: 'Introdução à Gestão Cultural', duration: '20min', videoId: 'dQw4w9WgXcQ', completed: false }
                ]
            },
            'educacao-inclusiva': {
                title: 'Educação Especial na Perspectiva Inclusiva',
                category: 'Educação',
                instructor: 'Prof. Ana Oliveira',
                lessons: [
                    { id: 1, title: 'Fundamentos da Educação Inclusiva', duration: '25min', videoId: 'dQw4w9WgXcQ', completed: false }
                ]
            }
        };
    }

    setupEventListeners() {
        // Tabs
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Navegação de aulas
        const prevBtn = document.getElementById('prevLessonBtn');
        const nextBtn = document.getElementById('nextLessonBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousLesson());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextLesson());
        }

        // Marcar como concluída
        const markCompleteBtn = document.getElementById('markCompleteBtn');
        if (markCompleteBtn) {
            markCompleteBtn.addEventListener('click', () => this.markLessonComplete());
        }

        // Anotações
        const takeNotesBtn = document.getElementById('takeNotesBtn');
        if (takeNotesBtn) {
            takeNotesBtn.addEventListener('click', () => this.openNotesModal());
        }

        const saveNotesBtn = document.querySelector('.save-notes-btn');
        if (saveNotesBtn) {
            saveNotesBtn.addEventListener('click', () => this.saveNotes());
        }

        // Clique nas aulas da sidebar
        const lessonItems = document.querySelectorAll('.lesson-item');
        lessonItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const lessonId = parseInt(e.currentTarget.dataset.lesson);
                if (lessonId <= this.currentLesson) {
                    this.goToLesson(lessonId);
                }
            });
        });

        // Responsividade - toggle sidebar em mobile
        this.setupMobileToggle();
    }

    loadCourseFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('id') || 'ia-fundamentos';
        
        if (this.courseData[courseId]) {
            this.loadCourse(courseId);
        }
    }

    loadCourse(courseId) {
        const course = this.courseData[courseId];
        if (!course) return;

        // Atualizar título e informações
        document.getElementById('courseTitle').textContent = course.title;
        
        // Carregar primeira aula ou aula atual
        this.loadLesson(this.currentLesson);
    }

    loadLesson(lessonId) {
        const course = this.courseData['ia-fundamentos']; // Default para demo
        const lesson = course.lessons.find(l => l.id === lessonId);
        
        if (!lesson) return;

        // Atualizar player de vídeo
        this.updateVideoPlayer(lesson.videoId);
        
        // Atualizar informações da aula
        document.getElementById('currentLessonTitle').textContent = lesson.title;
        document.querySelector('.lesson-number').textContent = `Aula ${lessonId} de ${this.totalLessons}`;
        document.querySelector('.lesson-duration').textContent = lesson.duration;
        
        // Atualizar sidebar
        this.updateSidebar(lessonId);
        
        // Atualizar navegação
        this.updateNavigation(lessonId);
        
        // Carregar anotações da aula
        this.loadLessonNotes(lessonId);
        
        this.currentLesson = lessonId;
    }

    updateVideoPlayer(videoId) {
        const iframe = document.querySelector('.video-player iframe');
        if (iframe) {
            iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1`;
        }
    }

    updateSidebar(currentLessonId) {
        const lessonItems = document.querySelectorAll('.lesson-item');
        
        lessonItems.forEach(item => {
            const lessonId = parseInt(item.dataset.lesson);
            const statusIcon = item.querySelector('.lesson-status i');
            
            // Remover classes anteriores
            item.classList.remove('current', 'completed');
            statusIcon.classList.remove('completed', 'current', 'locked');
            
            if (lessonId < currentLessonId) {
                // Aula concluída
                item.classList.add('completed');
                statusIcon.classList.add('completed');
                statusIcon.className = 'fas fa-check-circle completed';
            } else if (lessonId === currentLessonId) {
                // Aula atual
                item.classList.add('current');
                statusIcon.classList.add('current');
                statusIcon.className = 'fas fa-play-circle current';
            } else {
                // Aula bloqueada
                statusIcon.classList.add('locked');
                statusIcon.className = 'fas fa-lock locked';
            }
        });
    }

    updateNavigation(currentLessonId) {
        const prevBtn = document.getElementById('prevLessonBtn');
        const nextBtn = document.getElementById('nextLessonBtn');
        
        // Botão anterior
        if (prevBtn) {
            if (currentLessonId > 1) {
                prevBtn.style.display = 'flex';
                const prevLesson = this.courseData['ia-fundamentos'].lessons.find(l => l.id === currentLessonId - 1);
                if (prevLesson) {
                    prevBtn.querySelector('strong').textContent = prevLesson.title;
                }
            } else {
                prevBtn.style.display = 'none';
            }
        }
        
        // Botão próximo
        if (nextBtn) {
            if (currentLessonId < this.totalLessons) {
                nextBtn.style.display = 'flex';
                const nextLesson = this.courseData['ia-fundamentos'].lessons.find(l => l.id === currentLessonId + 1);
                if (nextLesson) {
                    nextBtn.querySelector('strong').textContent = nextLesson.title;
                }
            } else {
                nextBtn.style.display = 'none';
            }
        }
    }

    updateProgress() {
        const completedLessons = this.currentLesson - 1;
        const progressPercent = Math.round((completedLessons / this.totalLessons) * 100);
        
        // Atualizar círculo de progresso
        const progressText = document.querySelector('.progress-text');
        const progressDetail = document.querySelector('.progress-detail');
        const progressRing = document.querySelector('.progress-ring-progress');
        
        if (progressText) progressText.textContent = `${progressPercent}%`;
        if (progressDetail) progressDetail.textContent = `${completedLessons} de ${this.totalLessons} aulas`;
        
        if (progressRing) {
            const circumference = 2 * Math.PI * 25; // raio = 25
            const offset = circumference - (progressPercent / 100) * circumference;
            progressRing.style.strokeDashoffset = offset;
        }
        
        // Atualizar barra de progresso do certificado
        const certificateProgress = document.querySelector('.certificate-progress .progress-fill');
        if (certificateProgress) {
            certificateProgress.style.width = `${progressPercent}%`;
        }
        
        const certificateText = document.querySelector('.certificate-progress span');
        if (certificateText) {
            certificateText.textContent = `${progressPercent}% concluído`;
        }
    }

    switchTab(tabName) {
        // Remover active de todos os botões e painéis
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
        
        // Ativar botão e painel selecionados
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');
    }

    previousLesson() {
        if (this.currentLesson > 1) {
            this.loadLesson(this.currentLesson - 1);
        }
    }

    nextLesson() {
        if (this.currentLesson < this.totalLessons) {
            this.loadLesson(this.currentLesson + 1);
        }
    }

    goToLesson(lessonId) {
        if (lessonId <= this.currentLesson) {
            this.loadLesson(lessonId);
        } else {
            this.showNotification('Complete as aulas anteriores para desbloquear esta aula.', 'warning');
        }
    }

    markLessonComplete() {
        // Marcar aula atual como concluída
        const course = this.courseData['ia-fundamentos'];
        const lesson = course.lessons.find(l => l.id === this.currentLesson);
        
        if (lesson) {
            lesson.completed = true;
            
            // Atualizar interface
            this.updateSidebar(this.currentLesson);
            this.updateProgress();
            
            // Feedback visual
            this.showNotification('Aula marcada como concluída!', 'success');
            
            // Auto-avançar para próxima aula se disponível
            setTimeout(() => {
                if (this.currentLesson < this.totalLessons) {
                    this.nextLesson();
                }
            }, 1500);
        }
    }

    openNotesModal() {
        // Implementar modal de anotações (simplificado)
        const notesTextarea = document.getElementById('notesTextarea');
        if (notesTextarea) {
            notesTextarea.focus();
            this.switchTab('notes');
        }
    }

    saveNotes() {
        const notesTextarea = document.getElementById('notesTextarea');
        if (notesTextarea) {
            const notes = notesTextarea.value;
            this.userNotes[this.currentLesson] = notes;
            
            // Salvar no localStorage
            localStorage.setItem('curso_notes', JSON.stringify(this.userNotes));
            
            this.showNotification('Anotações salvas com sucesso!', 'success');
        }
    }

    loadUserNotes() {
        const savedNotes = localStorage.getItem('curso_notes');
        if (savedNotes) {
            this.userNotes = JSON.parse(savedNotes);
        }
    }

    loadLessonNotes(lessonId) {
        const notesTextarea = document.getElementById('notesTextarea');
        if (notesTextarea && this.userNotes[lessonId]) {
            notesTextarea.value = this.userNotes[lessonId];
        } else if (notesTextarea) {
            notesTextarea.value = '';
        }
    }

    setupMobileToggle() {
        // Adicionar botão de toggle para sidebar em mobile
        if (window.innerWidth <= 1024) {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'sidebar-toggle';
            toggleBtn.innerHTML = '<i class="fas fa-bars"></i> Conteúdo';
            toggleBtn.style.cssText = `
                position: fixed;
                top: 80px;
                left: 20px;
                z-index: 1000;
                background: #8B5CF6;
                color: white;
                border: none;
                padding: 10px 15px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            
            document.body.appendChild(toggleBtn);
            
            toggleBtn.addEventListener('click', () => {
                const sidebar = document.getElementById('courseSidebar');
                sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
            });
        }
    }

    verificarAutenticacao() {
        // Verificar se usuário está logado
        if (window.authManager && window.authManager.isAuthenticated()) {
            const user = window.authManager.getUser();
            if (user) {
                this.atualizarInterfaceUsuario(user);
            }
        } else {
            // Redirecionar para login se não autenticado
            setTimeout(() => {
                if (confirm('Você precisa estar logado para acessar este curso. Deseja fazer login agora?')) {
                    window.location.href = 'login-aluno.html';
                }
            }, 2000);
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

    showNotification(message, type = 'info') {
        // Usar sistema de notificações do auth.js se disponível
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            // Fallback simples
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                z-index: 10000;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    }
}

// Inicializar quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.cursoManager = new CursoManager();
});

// Exportar para uso global
window.CursoManager = CursoManager;

