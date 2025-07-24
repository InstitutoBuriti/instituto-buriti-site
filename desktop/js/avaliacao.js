/**
 * Sistema de Avaliações - Instituto Buriti
 * Funcionalidades: Quiz, Timer, Pontuação, Navegação
 */

class AvaliacaoManager {
    constructor() {
        this.currentQuestion = 1;
        this.totalQuestions = 5;
        this.timeLimit = 15 * 60; // 15 minutos em segundos
        this.timeRemaining = this.timeLimit;
        this.timer = null;
        this.answers = {};
        this.score = 0;
        this.isQuizStarted = false;
        this.isQuizFinished = false;
        
        // Respostas corretas
        this.correctAnswers = {
            q1: 'a', // Inteligência Artificial
            q2: 'false', // IA não foi criada nos últimos 10 anos
            q3: 'c', // Calculadora básica não é IA
            q4: 'text', // Resposta dissertativa
            q5: 'a' // Machine Learning aprende automaticamente
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.verificarAutenticacao();
        this.loadQuizState();
    }

    setupEventListeners() {
        // Botão iniciar quiz
        const startBtn = document.getElementById('startQuizBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startQuiz());
        }

        // Navegação de questões
        const prevBtn = document.getElementById('prevQuestionBtn');
        const nextBtn = document.getElementById('nextQuestionBtn');
        const finishBtn = document.getElementById('finishQuizBtn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousQuestion());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextQuestion());
        }
        
        if (finishBtn) {
            finishBtn.addEventListener('click', () => this.finishQuiz());
        }

        // Navegação lateral
        const navBtns = document.querySelectorAll('.question-nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const questionNum = parseInt(e.target.dataset.question);
                this.goToQuestion(questionNum);
            });
        });

        // Salvar progresso
        const saveBtn = document.getElementById('saveProgressBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveProgress());
        }

        // Sair da avaliação
        const exitBtn = document.getElementById('exitQuizBtn');
        if (exitBtn) {
            exitBtn.addEventListener('click', () => this.showExitConfirmation());
        }

        // Respostas
        this.setupAnswerListeners();

        // Modal
        this.setupModalListeners();

        // Contador de caracteres
        this.setupCharCounter();

        // Botões de resultado
        this.setupResultListeners();
    }

    setupAnswerListeners() {
        // Radio buttons
        const radioInputs = document.querySelectorAll('input[type="radio"]');
        radioInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.saveAnswer(e.target.name, e.target.value);
                this.updateQuestionStatus(e.target.name);
            });
        });

        // Textarea
        const textareas = document.querySelectorAll('textarea[name^="q"]');
        textareas.forEach(textarea => {
            textarea.addEventListener('input', (e) => {
                this.saveAnswer(e.target.name, e.target.value);
                this.updateQuestionStatus(e.target.name);
            });
        });
    }

    setupCharCounter() {
        const textarea = document.querySelector('textarea[name="q4"]');
        const counter = document.querySelector('.current-chars');
        
        if (textarea && counter) {
            textarea.addEventListener('input', (e) => {
                counter.textContent = e.target.value.length;
            });
        }
    }

    setupModalListeners() {
        const modal = document.getElementById('confirmModal');
        const closeBtn = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelAction');
        const confirmBtn = document.getElementById('confirmAction');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideModal());
        }
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.confirmAction());
        }

        // Fechar modal clicando fora
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }
    }

    setupResultListeners() {
        const viewAnswersBtn = document.getElementById('viewAnswersBtn');
        const retryBtn = document.getElementById('retryQuizBtn');

        if (viewAnswersBtn) {
            viewAnswersBtn.addEventListener('click', () => this.viewAnswers());
        }
        
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.retryQuiz());
        }
    }

    startQuiz() {
        this.isQuizStarted = true;
        this.startTimer();
        
        // Esconder tela de início
        document.getElementById('quizStart').style.display = 'none';
        
        // Mostrar questões
        document.getElementById('quizQuestions').style.display = 'block';
        
        // Mostrar primeira questão
        this.showQuestion(1);
        
        // Atualizar interface
        this.updateProgress();
        this.updateNavigation();
        
        this.showNotification('Avaliação iniciada! Boa sorte!', 'success');
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const timeElement = document.querySelector('.time-remaining');
        if (timeElement) {
            timeElement.textContent = timeDisplay;
            
            // Alerta quando restam 5 minutos
            if (this.timeRemaining === 300) {
                this.showNotification('Atenção: Restam apenas 5 minutos!', 'warning');
            }
            
            // Alerta quando restam 1 minuto
            if (this.timeRemaining === 60) {
                this.showNotification('Atenção: Resta apenas 1 minuto!', 'warning');
            }
            
            // Mudar cor quando restam menos de 2 minutos
            if (this.timeRemaining < 120) {
                timeElement.style.color = '#ef4444';
            }
        }
    }

    timeUp() {
        clearInterval(this.timer);
        this.showNotification('Tempo esgotado! Finalizando avaliação...', 'warning');
        setTimeout(() => {
            this.finishQuiz();
        }, 2000);
    }

    showQuestion(questionNum) {
        // Esconder todas as questões
        document.querySelectorAll('.question-container').forEach(container => {
            container.classList.remove('active');
        });
        
        // Mostrar questão atual
        const currentContainer = document.querySelector(`[data-question="${questionNum}"]`);
        if (currentContainer) {
            currentContainer.classList.add('active');
        }
        
        this.currentQuestion = questionNum;
        this.updateProgress();
        this.updateNavigation();
        this.updateSidebarNavigation();
    }

    nextQuestion() {
        if (this.currentQuestion < this.totalQuestions) {
            this.showQuestion(this.currentQuestion + 1);
        }
    }

    previousQuestion() {
        if (this.currentQuestion > 1) {
            this.showQuestion(this.currentQuestion - 1);
        }
    }

    goToQuestion(questionNum) {
        if (questionNum >= 1 && questionNum <= this.totalQuestions) {
            this.showQuestion(questionNum);
        }
    }

    saveAnswer(questionName, value) {
        this.answers[questionName] = value;
        this.saveProgress();
    }

    updateQuestionStatus(questionName) {
        const questionNum = questionName.replace('q', '');
        const navBtn = document.querySelector(`[data-question="${questionNum}"]`);
        
        if (navBtn && this.answers[questionName]) {
            navBtn.classList.add('answered');
        }
    }

    updateProgress() {
        const answeredCount = Object.keys(this.answers).length;
        const progressPercent = Math.round((answeredCount / this.totalQuestions) * 100);
        
        // Atualizar círculo de progresso
        const progressText = document.querySelector('.progress-text');
        const currentQuestionSpan = document.querySelector('.current-question');
        const progressRing = document.querySelector('.progress-ring-progress');
        
        if (progressText) progressText.textContent = `${progressPercent}%`;
        if (currentQuestionSpan) currentQuestionSpan.textContent = `Questão ${this.currentQuestion} de ${this.totalQuestions}`;
        
        if (progressRing) {
            const circumference = 2 * Math.PI * 35; // raio = 35
            const offset = circumference - (progressPercent / 100) * circumference;
            progressRing.style.strokeDashoffset = offset;
        }
    }

    updateNavigation() {
        const prevBtn = document.getElementById('prevQuestionBtn');
        const nextBtn = document.getElementById('nextQuestionBtn');
        const finishBtn = document.getElementById('finishQuizBtn');
        
        // Botão anterior
        if (prevBtn) {
            prevBtn.style.display = this.currentQuestion > 1 ? 'flex' : 'none';
        }
        
        // Botão próximo/finalizar
        if (this.currentQuestion === this.totalQuestions) {
            if (nextBtn) nextBtn.style.display = 'none';
            if (finishBtn) finishBtn.style.display = 'flex';
        } else {
            if (nextBtn) nextBtn.style.display = 'flex';
            if (finishBtn) finishBtn.style.display = 'none';
        }
    }

    updateSidebarNavigation() {
        // Atualizar botões de navegação lateral
        document.querySelectorAll('.question-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const currentBtn = document.querySelector(`[data-question="${this.currentQuestion}"]`);
        if (currentBtn) {
            currentBtn.classList.add('active');
        }
    }

    finishQuiz() {
        if (!this.isQuizStarted || this.isQuizFinished) return;
        
        clearInterval(this.timer);
        this.isQuizFinished = true;
        
        // Calcular pontuação
        this.calculateScore();
        
        // Mostrar resultado
        this.showResult();
        
        // Salvar resultado
        this.saveResult();
    }

    calculateScore() {
        let correctCount = 0;
        
        // Verificar respostas objetivas
        Object.keys(this.correctAnswers).forEach(questionKey => {
            if (questionKey !== 'q4') { // Pular questão dissertativa
                if (this.answers[questionKey] === this.correctAnswers[questionKey]) {
                    correctCount++;
                }
            }
        });
        
        // Para questão dissertativa, dar pontuação baseada no comprimento (simplificado)
        if (this.answers.q4 && this.answers.q4.length > 50) {
            correctCount++; // Considerar correta se tiver mais de 50 caracteres
        }
        
        this.score = (correctCount / this.totalQuestions) * 10; // Nota de 0 a 10
        this.correctCount = correctCount;
    }

    showResult() {
        // Esconder questões
        document.getElementById('quizQuestions').style.display = 'none';
        
        // Mostrar resultado
        const resultDiv = document.getElementById('quizResult');
        resultDiv.style.display = 'block';
        
        // Atualizar dados do resultado
        this.updateResultDisplay();
    }

    updateResultDisplay() {
        const scoreNumber = document.querySelector('.score-number');
        const scoreProgress = document.querySelector('.score-progress');
        const resultIcon = document.querySelector('.result-icon i');
        const resultTitle = document.querySelector('.result-content h2');
        
        // Atualizar nota
        if (scoreNumber) {
            scoreNumber.textContent = this.score.toFixed(1);
        }
        
        // Atualizar círculo de progresso
        if (scoreProgress) {
            const circumference = 2 * Math.PI * 50;
            const offset = circumference - (this.score / 10) * circumference;
            scoreProgress.style.strokeDashoffset = offset;
            
            // Mudar cor baseado na nota
            if (this.score >= 7) {
                scoreProgress.setAttribute('stroke', '#10b981');
            } else {
                scoreProgress.setAttribute('stroke', '#ef4444');
            }
        }
        
        // Atualizar ícone e título
        if (this.score >= 7) {
            if (resultIcon) {
                resultIcon.className = 'fas fa-trophy';
                resultIcon.style.color = '#10b981';
            }
            if (resultTitle) {
                resultTitle.textContent = 'Parabéns! Você foi aprovado!';
            }
        } else {
            if (resultIcon) {
                resultIcon.className = 'fas fa-times-circle';
                resultIcon.style.color = '#ef4444';
            }
            if (resultTitle) {
                resultTitle.textContent = 'Não foi desta vez. Tente novamente!';
            }
        }
        
        // Atualizar detalhes
        const detailItems = document.querySelectorAll('.detail-value');
        if (detailItems.length >= 4) {
            detailItems[0].textContent = `${this.correctCount} de ${this.totalQuestions}`;
            detailItems[1].textContent = `${Math.round((this.correctCount / this.totalQuestions) * 100)}%`;
            
            const timeUsed = this.timeLimit - this.timeRemaining;
            const minutes = Math.floor(timeUsed / 60);
            const seconds = timeUsed % 60;
            detailItems[2].textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            detailItems[3].textContent = this.score >= 7 ? 'Aprovado' : 'Reprovado';
            detailItems[3].className = this.score >= 7 ? 'detail-value approved' : 'detail-value failed';
        }
    }

    viewAnswers() {
        // Implementar visualização de respostas
        this.showNotification('Funcionalidade em desenvolvimento', 'info');
    }

    retryQuiz() {
        if (confirm('Tem certeza que deseja refazer a avaliação? Seu progresso atual será perdido.')) {
            this.resetQuiz();
        }
    }

    resetQuiz() {
        // Resetar variáveis
        this.currentQuestion = 1;
        this.timeRemaining = this.timeLimit;
        this.answers = {};
        this.score = 0;
        this.isQuizStarted = false;
        this.isQuizFinished = false;
        
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // Limpar respostas do formulário
        document.querySelectorAll('input[type="radio"]').forEach(input => {
            input.checked = false;
        });
        
        document.querySelectorAll('textarea').forEach(textarea => {
            textarea.value = '';
        });
        
        // Resetar interface
        document.querySelectorAll('.question-nav-btn').forEach(btn => {
            btn.classList.remove('answered', 'active');
        });
        
        // Mostrar tela inicial
        document.getElementById('quizResult').style.display = 'none';
        document.getElementById('quizQuestions').style.display = 'none';
        document.getElementById('quizStart').style.display = 'block';
        
        // Resetar timer display
        const timeElement = document.querySelector('.time-remaining');
        if (timeElement) {
            timeElement.textContent = '15:00';
            timeElement.style.color = '#f59e0b';
        }
        
        this.showNotification('Avaliação resetada. Você pode começar novamente!', 'success');
    }

    saveProgress() {
        const progressData = {
            currentQuestion: this.currentQuestion,
            timeRemaining: this.timeRemaining,
            answers: this.answers,
            isQuizStarted: this.isQuizStarted
        };
        
        localStorage.setItem('quiz_progress', JSON.stringify(progressData));
    }

    loadQuizState() {
        const savedProgress = localStorage.getItem('quiz_progress');
        if (savedProgress) {
            const data = JSON.parse(savedProgress);
            
            // Só carregar se o quiz não foi finalizado
            if (!this.isQuizFinished && data.isQuizStarted) {
                this.currentQuestion = data.currentQuestion;
                this.timeRemaining = data.timeRemaining;
                this.answers = data.answers || {};
                this.isQuizStarted = data.isQuizStarted;
                
                if (this.isQuizStarted) {
                    // Restaurar estado do quiz
                    document.getElementById('quizStart').style.display = 'none';
                    document.getElementById('quizQuestions').style.display = 'block';
                    this.showQuestion(this.currentQuestion);
                    this.startTimer();
                    
                    // Restaurar respostas
                    this.restoreAnswers();
                    
                    this.showNotification('Progresso restaurado!', 'info');
                }
            }
        }
    }

    restoreAnswers() {
        Object.keys(this.answers).forEach(questionKey => {
            const value = this.answers[questionKey];
            
            if (questionKey === 'q4') {
                // Textarea
                const textarea = document.querySelector(`textarea[name="${questionKey}"]`);
                if (textarea) {
                    textarea.value = value;
                    // Atualizar contador
                    const counter = document.querySelector('.current-chars');
                    if (counter) {
                        counter.textContent = value.length;
                    }
                }
            } else {
                // Radio buttons
                const radio = document.querySelector(`input[name="${questionKey}"][value="${value}"]`);
                if (radio) {
                    radio.checked = true;
                }
            }
            
            this.updateQuestionStatus(questionKey);
        });
    }

    saveResult() {
        const resultData = {
            score: this.score,
            correctCount: this.correctCount,
            totalQuestions: this.totalQuestions,
            timeUsed: this.timeLimit - this.timeRemaining,
            date: new Date().toISOString(),
            passed: this.score >= 7
        };
        
        // Salvar no histórico
        let history = JSON.parse(localStorage.getItem('quiz_history') || '[]');
        history.push(resultData);
        localStorage.setItem('quiz_history', JSON.stringify(history));
        
        // Limpar progresso
        localStorage.removeItem('quiz_progress');
    }

    showExitConfirmation() {
        const modal = document.getElementById('confirmModal');
        const message = document.getElementById('confirmMessage');
        
        if (message) {
            message.textContent = 'Tem certeza que deseja sair da avaliação? Seu progresso será perdido.';
        }
        
        this.pendingAction = 'exit';
        this.showModal();
    }

    showModal() {
        const modal = document.getElementById('confirmModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    hideModal() {
        const modal = document.getElementById('confirmModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.pendingAction = null;
    }

    confirmAction() {
        if (this.pendingAction === 'exit') {
            window.location.href = 'curso-template.html?id=ia-fundamentos';
        }
        this.hideModal();
    }

    verificarAutenticacao() {
        if (window.authManager && window.authManager.isAuthenticated()) {
            const user = window.authManager.getUser();
            if (user) {
                this.atualizarInterfaceUsuario(user);
            }
        } else {
            setTimeout(() => {
                if (confirm('Você precisa estar logado para fazer esta avaliação. Deseja fazer login agora?')) {
                    window.location.href = 'login-aluno.html';
                }
            }, 2000);
        }
    }

    atualizarInterfaceUsuario(user) {
        const loginButton = document.querySelector('.login-button');
        if (loginButton) {
            loginButton.innerHTML = `
                <i class="fas fa-user"></i>
                ${user.name}
                <i class="fas fa-chevron-down"></i>
            `;
        }

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
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : type === 'error' ? '#ef4444' : '#3b82f6'};
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                z-index: 10000;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                max-width: 300px;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 4000);
        }
    }
}

// Inicializar quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.avaliacaoManager = new AvaliacaoManager();
});

// Exportar para uso global
window.AvaliacaoManager = AvaliacaoManager;

