/**
 * Quiz Engine - Sistema Principal de Quizzes
 * Instituto Buriti
 */

class QuizEngine {
    constructor() {
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.startTime = null;
        this.endTime = null;
        this.timer = null;
        this.timeRemaining = 0;
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        // Telas
        this.startScreen = document.getElementById('quizStartScreen');
        this.activeScreen = document.getElementById('quizActiveScreen');
        this.resultScreen = document.getElementById('quizResultScreen');
        
        // Elementos da tela de início
        this.quizTitle = document.getElementById('quizTitle');
        this.questionCount = document.getElementById('questionCount');
        this.timeLimit = document.getElementById('timeLimit');
        this.passingScore = document.getElementById('passingScore');
        this.quizInstructions = document.getElementById('quizInstructions');
        this.attemptsList = document.getElementById('attemptsList');
        this.startQuizBtn = document.getElementById('startQuizBtn');
        
        // Elementos da tela ativa
        this.currentQuestionNum = document.getElementById('currentQuestionNum');
        this.totalQuestions = document.getElementById('totalQuestions');
        this.progressFill = document.getElementById('progressFill');
        this.timerDisplay = document.getElementById('timerDisplay');
        this.questionType = document.getElementById('questionType');
        this.questionPoints = document.getElementById('questionPoints');
        this.questionText = document.getElementById('questionText');
        this.questionImageContainer = document.getElementById('questionImageContainer');
        this.questionImage = document.getElementById('questionImage');
        this.answerOptions = document.getElementById('answerOptions');
        this.essayAnswer = document.getElementById('essayAnswer');
        this.essayText = document.getElementById('essayText');
        this.trueFalseOptions = document.getElementById('trueFalseOptions');
        this.charCount = document.getElementById('charCount');
        
        // Navegação
        this.prevQuestionBtn = document.getElementById('prevQuestionBtn');
        this.nextQuestionBtn = document.getElementById('nextQuestionBtn');
        this.finishQuizBtn = document.getElementById('finishQuizBtn');
        this.answeredCount = document.getElementById('answeredCount');
        this.totalQuestionsNav = document.getElementById('totalQuestionsNav');
        this.questionGrid = document.getElementById('questionGrid');
        
        // Elementos de resultado
        this.resultStatus = document.getElementById('resultStatus');
        this.statusIcon = document.getElementById('statusIcon');
        this.statusText = document.getElementById('statusText');
        this.finalScore = document.getElementById('finalScore');
        this.correctAnswers = document.getElementById('correctAnswers');
        this.incorrectAnswers = document.getElementById('incorrectAnswers');
        this.timeSpent = document.getElementById('timeSpent');
        this.attemptNumber = document.getElementById('attemptNumber');
        this.reviewList = document.getElementById('reviewList');
        
        // Botões de ação
        this.reviewQuizBtn = document.getElementById('reviewQuizBtn');
        this.retakeQuizBtn = document.getElementById('retakeQuizBtn');
        this.backToCourseBtn = document.getElementById('backToCourseBtn');
        
        // Modal
        this.confirmModal = document.getElementById('confirmModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalMessage = document.getElementById('modalMessage');
        this.closeModal = document.getElementById('closeModal');
        this.cancelAction = document.getElementById('cancelAction');
        this.confirmAction = document.getElementById('confirmAction');
    }

    bindEvents() {
        // Botão iniciar quiz
        this.startQuizBtn?.addEventListener('click', () => this.startQuiz());
        
        // Navegação
        this.prevQuestionBtn?.addEventListener('click', () => this.previousQuestion());
        this.nextQuestionBtn?.addEventListener('click', () => this.nextQuestion());
        this.finishQuizBtn?.addEventListener('click', () => this.showFinishConfirmation());
        
        // Contador de caracteres para resposta dissertativa
        this.essayText?.addEventListener('input', () => this.updateCharCount());
        
        // Botões de resultado
        this.reviewQuizBtn?.addEventListener('click', () => this.reviewQuiz());
        this.retakeQuizBtn?.addEventListener('click', () => this.retakeQuiz());
        this.backToCourseBtn?.addEventListener('click', () => this.backToCourse());
        
        // Modal
        this.closeModal?.addEventListener('click', () => this.hideModal());
        this.cancelAction?.addEventListener('click', () => this.hideModal());
        
        // Fechar modal clicando fora
        this.confirmModal?.addEventListener('click', (e) => {
            if (e.target === this.confirmModal) {
                this.hideModal();
            }
        });
        
        // Prevenir saída acidental durante o quiz
        window.addEventListener('beforeunload', (e) => {
            if (this.isQuizActive()) {
                e.preventDefault();
                e.returnValue = 'Você tem um quiz em andamento. Tem certeza que deseja sair?';
                return e.returnValue;
            }
        });
    }

    async loadQuiz(quizId) {
        try {
            // Simular carregamento de quiz (substituir por API real)
            this.currentQuiz = await this.fetchQuizData(quizId);
            this.displayQuizInfo();
            this.loadAttempts();
        } catch (error) {
            console.error('Erro ao carregar quiz:', error);
            this.showError('Erro ao carregar o quiz. Tente novamente.');
        }
    }

    async fetchQuizData(quizId) {
        // Dados simulados - substituir por chamada à API real
        return {
            id: quizId || 'quiz-1',
            title: 'Avaliação - Módulo 1: Fundamentos',
            description: 'Teste seus conhecimentos sobre os conceitos fundamentais apresentados no módulo.',
            instructions: [
                'Leia cada questão com atenção antes de responder',
                'Você pode navegar entre as questões livremente',
                'Certifique-se de responder todas as questões antes de finalizar',
                'O tempo limite é rigorosamente respeitado',
                'Você pode fazer até 3 tentativas'
            ],
            timeLimit: 15, // minutos
            passingScore: 70, // porcentagem
            maxAttempts: 3,
            questions: [
                {
                    id: 1,
                    type: 'multiple_choice',
                    points: 2,
                    question: 'Qual é a principal função do HTML em uma página web?',
                    image: null,
                    options: [
                        { id: 'a', text: 'Definir a estrutura e o conteúdo da página' },
                        { id: 'b', text: 'Aplicar estilos visuais à página' },
                        { id: 'c', text: 'Adicionar interatividade à página' },
                        { id: 'd', text: 'Conectar a página a um banco de dados' }
                    ],
                    correctAnswer: 'a',
                    explanation: 'HTML (HyperText Markup Language) é responsável por definir a estrutura e o conteúdo de uma página web.'
                },
                {
                    id: 2,
                    type: 'multiple_choice',
                    points: 2,
                    question: 'Qual propriedade CSS é usada para alterar a cor do texto?',
                    image: null,
                    options: [
                        { id: 'a', text: 'background-color' },
                        { id: 'b', text: 'color' },
                        { id: 'c', text: 'text-color' },
                        { id: 'd', text: 'font-color' }
                    ],
                    correctAnswer: 'b',
                    explanation: 'A propriedade "color" é usada para definir a cor do texto em CSS.'
                },
                {
                    id: 3,
                    type: 'true_false',
                    points: 1,
                    question: 'JavaScript é uma linguagem de programação que roda apenas no navegador.',
                    correctAnswer: false,
                    explanation: 'JavaScript pode rodar tanto no navegador quanto no servidor (Node.js) e em outros ambientes.'
                },
                {
                    id: 4,
                    type: 'multiple_choice',
                    points: 3,
                    question: 'Qual é a diferença entre margin e padding em CSS?',
                    image: null,
                    options: [
                        { id: 'a', text: 'Margin é o espaço interno, padding é o espaço externo' },
                        { id: 'b', text: 'Margin é o espaço externo, padding é o espaço interno' },
                        { id: 'c', text: 'Não há diferença, são sinônimos' },
                        { id: 'd', text: 'Margin afeta apenas a largura, padding afeta apenas a altura' }
                    ],
                    correctAnswer: 'b',
                    explanation: 'Margin é o espaço externo ao elemento, enquanto padding é o espaço interno entre o conteúdo e a borda.'
                },
                {
                    id: 5,
                    type: 'essay',
                    points: 4,
                    question: 'Explique brevemente a importância da semântica em HTML e cite pelo menos 3 elementos semânticos.',
                    maxLength: 500,
                    explanation: 'Elementos semânticos como <header>, <nav>, <main>, <article>, <section>, <aside>, <footer> tornam o código mais legível e acessível.'
                }
            ]
        };
    }

    displayQuizInfo() {
        if (!this.currentQuiz) return;
        
        this.quizTitle.textContent = this.currentQuiz.title;
        this.questionCount.textContent = `${this.currentQuiz.questions.length} questões`;
        this.timeLimit.textContent = `${this.currentQuiz.timeLimit} minutos`;
        this.passingScore.textContent = `${this.currentQuiz.passingScore}% para aprovação`;
        
        // Instruções
        const instructionsHtml = `
            <p>${this.currentQuiz.description}</p>
            <ul>
                ${this.currentQuiz.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
            </ul>
        `;
        this.quizInstructions.innerHTML = instructionsHtml;
    }

    loadAttempts() {
        // Simular tentativas anteriores
        const attempts = this.getStoredAttempts();
        
        if (attempts.length === 0) {
            this.attemptsList.innerHTML = '<p style="color: #666; font-style: italic;">Nenhuma tentativa anterior</p>';
            return;
        }
        
        const attemptsHtml = attempts.map((attempt, index) => `
            <div class="attempt-item">
                <div class="attempt-info">
                    <span class="attempt-score ${attempt.passed ? 'passed' : 'failed'}">
                        ${attempt.score}% ${attempt.passed ? '✓' : '✗'}
                    </span>
                    <span class="attempt-date">${this.formatDate(attempt.date)}</span>
                </div>
            </div>
        `).join('');
        
        this.attemptsList.innerHTML = attemptsHtml;
        
        // Verificar se pode fazer nova tentativa
        if (attempts.length >= this.currentQuiz.maxAttempts) {
            this.startQuizBtn.disabled = true;
            this.startQuizBtn.textContent = 'Limite de tentativas atingido';
        }
    }

    startQuiz() {
        if (!this.currentQuiz) return;
        
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.startTime = new Date();
        this.timeRemaining = this.currentQuiz.timeLimit * 60; // converter para segundos
        
        this.showScreen('active');
        this.setupQuestionNavigation();
        this.startTimer();
        this.displayCurrentQuestion();
    }

    showScreen(screen) {
        this.startScreen.style.display = screen === 'start' ? 'block' : 'none';
        this.activeScreen.style.display = screen === 'active' ? 'block' : 'none';
        this.resultScreen.style.display = screen === 'result' ? 'block' : 'none';
    }

    setupQuestionNavigation() {
        this.totalQuestions.textContent = this.currentQuiz.questions.length;
        this.totalQuestionsNav.textContent = this.currentQuiz.questions.length;
        
        // Criar botões de navegação rápida
        this.questionGrid.innerHTML = '';
        for (let i = 0; i < this.currentQuiz.questions.length; i++) {
            const btn = document.createElement('button');
            btn.className = 'question-nav-btn';
            btn.textContent = i + 1;
            btn.addEventListener('click', () => this.goToQuestion(i));
            this.questionGrid.appendChild(btn);
        }
    }

    displayCurrentQuestion() {
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        if (!question) return;
        
        // Atualizar informações da questão
        this.currentQuestionNum.textContent = this.currentQuestionIndex + 1;
        this.questionType.textContent = this.getQuestionTypeLabel(question.type);
        this.questionPoints.textContent = `${question.points} ${question.points === 1 ? 'ponto' : 'pontos'}`;
        this.questionText.textContent = question.question;
        
        // Imagem da questão
        if (question.image) {
            this.questionImage.src = question.image;
            this.questionImageContainer.style.display = 'block';
        } else {
            this.questionImageContainer.style.display = 'none';
        }
        
        // Limpar opções anteriores
        this.answerOptions.innerHTML = '';
        this.essayAnswer.style.display = 'none';
        this.trueFalseOptions.style.display = 'none';
        
        // Exibir opções baseadas no tipo
        switch (question.type) {
            case 'multiple_choice':
                this.displayMultipleChoice(question);
                break;
            case 'true_false':
                this.displayTrueFalse(question);
                break;
            case 'essay':
                this.displayEssay(question);
                break;
        }
        
        // Restaurar resposta anterior se existir
        this.restorePreviousAnswer(question);
        
        // Atualizar progresso
        this.updateProgress();
        this.updateNavigationButtons();
        this.updateQuestionNavigation();
    }

    displayMultipleChoice(question) {
        this.answerOptions.style.display = 'block';
        
        question.options.forEach(option => {
            const optionHtml = `
                <div class="answer-option">
                    <input type="radio" id="option_${option.id}" name="question_${question.id}" value="${option.id}">
                    <label for="option_${option.id}" class="answer-label">
                        <div class="option-marker"></div>
                        <div class="option-text">${option.text}</div>
                    </label>
                </div>
            `;
            this.answerOptions.insertAdjacentHTML('beforeend', optionHtml);
        });
        
        // Adicionar event listeners
        const radioButtons = this.answerOptions.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', () => this.saveAnswer(question.id, radio.value));
        });
    }

    displayTrueFalse(question) {
        this.trueFalseOptions.style.display = 'flex';
        
        const trueRadio = document.getElementById('tfTrue');
        const falseRadio = document.getElementById('tfFalse');
        
        // Limpar seleções anteriores
        trueRadio.checked = false;
        falseRadio.checked = false;
        
        // Adicionar event listeners
        trueRadio.addEventListener('change', () => {
            if (trueRadio.checked) this.saveAnswer(question.id, true);
        });
        
        falseRadio.addEventListener('change', () => {
            if (falseRadio.checked) this.saveAnswer(question.id, false);
        });
    }

    displayEssay(question) {
        this.essayAnswer.style.display = 'block';
        this.essayText.value = '';
        this.essayText.maxLength = question.maxLength || 1000;
        
        this.essayText.addEventListener('input', () => {
            this.saveAnswer(question.id, this.essayText.value);
            this.updateCharCount();
        });
        
        this.updateCharCount();
    }

    updateCharCount() {
        const current = this.essayText.value.length;
        const max = this.essayText.maxLength;
        this.charCount.textContent = current;
        
        if (current > max * 0.9) {
            this.charCount.style.color = '#e74c3c';
        } else if (current > max * 0.7) {
            this.charCount.style.color = '#ffc107';
        } else {
            this.charCount.style.color = '#666';
        }
    }

    saveAnswer(questionId, answer) {
        this.answers[questionId] = {
            answer: answer,
            timestamp: new Date()
        };
        
        this.updateProgress();
        this.updateQuestionNavigation();
    }

    restorePreviousAnswer(question) {
        const savedAnswer = this.answers[question.id];
        if (!savedAnswer) return;
        
        switch (question.type) {
            case 'multiple_choice':
                const radio = document.querySelector(`input[value="${savedAnswer.answer}"]`);
                if (radio) radio.checked = true;
                break;
                
            case 'true_false':
                if (savedAnswer.answer === true) {
                    document.getElementById('tfTrue').checked = true;
                } else if (savedAnswer.answer === false) {
                    document.getElementById('tfFalse').checked = true;
                }
                break;
                
            case 'essay':
                this.essayText.value = savedAnswer.answer || '';
                this.updateCharCount();
                break;
        }
    }

    updateProgress() {
        const answeredQuestions = Object.keys(this.answers).length;
        const totalQuestions = this.currentQuiz.questions.length;
        const progressPercent = (this.currentQuestionIndex / totalQuestions) * 100;
        
        this.progressFill.style.width = `${progressPercent}%`;
        this.answeredCount.textContent = answeredQuestions;
    }

    updateNavigationButtons() {
        this.prevQuestionBtn.disabled = this.currentQuestionIndex === 0;
        
        const isLastQuestion = this.currentQuestionIndex === this.currentQuiz.questions.length - 1;
        this.nextQuestionBtn.style.display = isLastQuestion ? 'none' : 'inline-block';
        this.finishQuizBtn.style.display = isLastQuestion ? 'inline-block' : 'none';
    }

    updateQuestionNavigation() {
        const navButtons = this.questionGrid.querySelectorAll('.question-nav-btn');
        navButtons.forEach((btn, index) => {
            btn.classList.remove('current', 'answered', 'unanswered');
            
            if (index === this.currentQuestionIndex) {
                btn.classList.add('current');
            } else if (this.answers[this.currentQuiz.questions[index].id]) {
                btn.classList.add('answered');
            } else {
                btn.classList.add('unanswered');
            }
        });
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayCurrentQuestion();
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayCurrentQuestion();
        }
    }

    goToQuestion(index) {
        if (index >= 0 && index < this.currentQuiz.questions.length) {
            this.currentQuestionIndex = index;
            this.displayCurrentQuestion();
        }
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                this.finishQuiz(true); // true = tempo esgotado
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.timerDisplay.textContent = timeString;
        
        // Avisos visuais
        if (this.timeRemaining <= 60) {
            this.timerDisplay.classList.add('time-critical');
        } else if (this.timeRemaining <= 300) {
            this.timerDisplay.classList.add('time-warning');
        }
    }

    showFinishConfirmation() {
        const answeredCount = Object.keys(this.answers).length;
        const totalCount = this.currentQuiz.questions.length;
        const unansweredCount = totalCount - answeredCount;
        
        let message = 'Tem certeza que deseja finalizar o quiz?';
        if (unansweredCount > 0) {
            message += `\n\nVocê ainda tem ${unansweredCount} questão(ões) não respondida(s).`;
        }
        
        this.showModal('Finalizar Quiz', message, () => this.finishQuiz(false));
    }

    finishQuiz(timeUp = false) {
        this.endTime = new Date();
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        const result = this.calculateResult();
        this.saveAttempt(result);
        this.displayResult(result, timeUp);
        this.showScreen('result');
    }

    calculateResult() {
        let totalPoints = 0;
        let earnedPoints = 0;
        const questionResults = [];
        
        this.currentQuiz.questions.forEach(question => {
            totalPoints += question.points;
            const userAnswer = this.answers[question.id];
            let isCorrect = false;
            let points = 0;
            
            if (userAnswer) {
                switch (question.type) {
                    case 'multiple_choice':
                        isCorrect = userAnswer.answer === question.correctAnswer;
                        break;
                    case 'true_false':
                        isCorrect = userAnswer.answer === question.correctAnswer;
                        break;
                    case 'essay':
                        // Para dissertativas, assumir pontuação manual posterior
                        isCorrect = true; // Temporário
                        points = question.points * 0.8; // 80% temporário
                        break;
                }
                
                if (isCorrect && question.type !== 'essay') {
                    points = question.points;
                }
            }
            
            earnedPoints += points;
            questionResults.push({
                question: question,
                userAnswer: userAnswer ? userAnswer.answer : null,
                isCorrect: isCorrect,
                points: points
            });
        });
        
        const scorePercentage = Math.round((earnedPoints / totalPoints) * 100);
        const passed = scorePercentage >= this.currentQuiz.passingScore;
        const timeSpent = this.endTime - this.startTime;
        
        return {
            scorePercentage,
            earnedPoints,
            totalPoints,
            passed,
            timeSpent,
            questionResults,
            answeredCount: Object.keys(this.answers).length,
            totalQuestions: this.currentQuiz.questions.length
        };
    }

    displayResult(result, timeUp) {
        // Status
        if (timeUp) {
            this.statusIcon.textContent = '⏰';
            this.statusText.textContent = 'Tempo Esgotado!';
        } else if (result.passed) {
            this.statusIcon.textContent = '🎉';
            this.statusText.textContent = 'Parabéns!';
        } else {
            this.statusIcon.textContent = '😔';
            this.statusText.textContent = 'Não foi desta vez...';
        }
        
        // Pontuação
        this.finalScore.textContent = `${result.scorePercentage}%`;
        
        // Estatísticas
        const correctCount = result.questionResults.filter(r => r.isCorrect).length;
        const incorrectCount = result.totalQuestions - correctCount;
        
        this.correctAnswers.textContent = correctCount;
        this.incorrectAnswers.textContent = incorrectCount;
        this.timeSpent.textContent = this.formatDuration(result.timeSpent);
        
        const attempts = this.getStoredAttempts();
        this.attemptNumber.textContent = `${attempts.length + 1}ª`;
        
        // Revisão das questões
        this.displayQuestionReview(result.questionResults);
    }

    displayQuestionReview(questionResults) {
        const reviewHtml = questionResults.map((result, index) => {
            const question = result.question;
            const statusClass = result.isCorrect ? 'correct' : 'incorrect';
            const statusIcon = result.isCorrect ? '✓' : '✗';
            
            let answerText = 'Não respondida';
            if (result.userAnswer !== null) {
                if (question.type === 'multiple_choice') {
                    const option = question.options.find(opt => opt.id === result.userAnswer);
                    answerText = option ? option.text : result.userAnswer;
                } else if (question.type === 'true_false') {
                    answerText = result.userAnswer ? 'Verdadeiro' : 'Falso';
                } else if (question.type === 'essay') {
                    answerText = result.userAnswer.substring(0, 100) + '...';
                }
            }
            
            return `
                <div class="review-item ${statusClass}">
                    <div class="review-question">
                        ${index + 1}. ${question.question}
                    </div>
                    <div class="review-answer ${statusClass}">
                        ${statusIcon} Sua resposta: ${answerText}
                    </div>
                    ${question.explanation ? `<div class="review-explanation" style="margin-top: 8px; font-size: 13px; color: #666;">💡 ${question.explanation}</div>` : ''}
                </div>
            `;
        }).join('');
        
        this.reviewList.innerHTML = reviewHtml;
    }

    saveAttempt(result) {
        const attempts = this.getStoredAttempts();
        const newAttempt = {
            date: new Date().toISOString(),
            score: result.scorePercentage,
            passed: result.passed,
            timeSpent: result.timeSpent,
            answers: this.answers
        };
        
        attempts.push(newAttempt);
        localStorage.setItem(`quiz_attempts_${this.currentQuiz.id}`, JSON.stringify(attempts));
    }

    getStoredAttempts() {
        const stored = localStorage.getItem(`quiz_attempts_${this.currentQuiz.id}`);
        return stored ? JSON.parse(stored) : [];
    }

    reviewQuiz() {
        // Implementar visualização detalhada das respostas
        alert('Funcionalidade de revisão detalhada será implementada em breve.');
    }

    retakeQuiz() {
        const attempts = this.getStoredAttempts();
        if (attempts.length >= this.currentQuiz.maxAttempts) {
            alert('Você atingiu o limite máximo de tentativas para este quiz.');
            return;
        }
        
        this.showModal(
            'Refazer Quiz',
            'Tem certeza que deseja fazer uma nova tentativa? Seu progresso atual será perdido.',
            () => {
                this.showScreen('start');
                this.loadAttempts();
            }
        );
    }

    backToCourse() {
        window.location.href = 'curso-player.html';
    }

    showModal(title, message, confirmCallback) {
        this.modalTitle.textContent = title;
        this.modalMessage.textContent = message;
        this.confirmModal.classList.add('show');
        
        // Remover listeners anteriores
        const newConfirmBtn = this.confirmAction.cloneNode(true);
        this.confirmAction.parentNode.replaceChild(newConfirmBtn, this.confirmAction);
        this.confirmAction = newConfirmBtn;
        
        // Adicionar novo listener
        this.confirmAction.addEventListener('click', () => {
            this.hideModal();
            if (confirmCallback) confirmCallback();
        });
    }

    hideModal() {
        this.confirmModal.classList.remove('show');
    }

    isQuizActive() {
        return this.activeScreen.style.display !== 'none' && this.timer !== null;
    }

    getQuestionTypeLabel(type) {
        const labels = {
            'multiple_choice': 'Múltipla Escolha',
            'true_false': 'Verdadeiro/Falso',
            'essay': 'Dissertativa'
        };
        return labels[type] || type;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    formatDuration(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Instância global do quiz
let quizEngine;

// Função de inicialização
function initializeQuiz() {
    quizEngine = new QuizEngine();
    
    // Carregar quiz baseado no parâmetro da URL ou ID padrão
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quiz') || 'quiz-1';
    
    quizEngine.loadQuiz(quizId);
}

// Exportar para uso global
window.QuizEngine = QuizEngine;
window.initializeQuiz = initializeQuiz;

