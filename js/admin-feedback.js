/**
 * Painel Administrativo de Feedback
 * Instituto Buriti - JavaScript Completo
 */

class AdminFeedbackSystem {
    constructor() {
        this.feedbacks = [];
        this.tests = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentFilter = 'all';
        this.currentPeriod = 7;
        this.selectedFeedback = null;
        
        this.init();
    }

    init() {
        this.generateSampleData();
        this.setupEventListeners();
        this.renderDashboard();
        this.renderFeedbackTable();
        this.renderTests();
        this.renderCharts();
        this.updateMetrics();
    }

    // ===== GERAÇÃO DE DADOS DE EXEMPLO ===== //
    generateSampleData() {
        // Gerar feedbacks de exemplo
        this.feedbacks = this.generateSampleFeedbacks();
        this.tests = this.generateSampleTests();
    }

    generateSampleFeedbacks() {
        const types = ['bug', 'feature', 'improvement', 'compliment', 'complaint'];
        const pages = ['home', 'courses', 'materials', 'chat', 'payments', 'gamification', 'auth'];
        const priorities = ['low', 'medium', 'high', 'critical'];
        const statuses = ['pending', 'analyzing', 'resolved', 'thanked'];
        
        const sampleTitles = {
            bug: ['Erro no carregamento', 'Bug no formulário', 'Problema de navegação', 'Falha na autenticação'],
            feature: ['Adicionar filtros', 'Sistema de notificações', 'Modo escuro', 'Exportar dados'],
            improvement: ['Melhorar performance', 'Otimizar interface', 'Simplificar processo', 'Atualizar design'],
            compliment: ['Excelente plataforma', 'Interface intuitiva', 'Ótimo suporte', 'Conteúdo de qualidade'],
            complaint: ['Muito lento', 'Difícil de usar', 'Falta de recursos', 'Problemas técnicos']
        };

        const feedbacks = [];
        for (let i = 1; i <= 50; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const titles = sampleTitles[type];
            const title = titles[Math.floor(Math.random() * titles.length)];
            
            feedbacks.push({
                id: i,
                type: type,
                title: title,
                description: `Descrição detalhada do feedback ${i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
                page: pages[Math.floor(Math.random() * pages.length)],
                priority: priorities[Math.floor(Math.random() * priorities.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                user: `Usuário ${i}`,
                email: `usuario${i}@email.com`,
                allowContact: Math.random() > 0.5,
                timestamp: Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000), // Últimos 30 dias
                rating: Math.floor(Math.random() * 5) + 1
            });
        }
        
        return feedbacks.sort((a, b) => b.timestamp - a.timestamp);
    }

    generateSampleTests() {
        return [
            {
                id: 1,
                name: 'Teste de Interface de Navegação',
                description: 'Comparando layout atual vs. novo design do menu',
                type: 'interface',
                status: 'active',
                duration: 14,
                targetParticipants: 200,
                currentParticipants: 156,
                progress: 65,
                startDate: Date.now() - (7 * 24 * 60 * 60 * 1000),
                endDate: Date.now() + (7 * 24 * 60 * 60 * 1000)
            },
            {
                id: 2,
                name: 'Teste de Usabilidade Mobile',
                description: 'Avaliando experiência em dispositivos móveis',
                type: 'mobile',
                status: 'recruiting',
                duration: 21,
                targetParticipants: 150,
                currentParticipants: 89,
                progress: 35,
                startDate: Date.now() - (3 * 24 * 60 * 60 * 1000),
                endDate: Date.now() + (18 * 24 * 60 * 60 * 1000)
            }
        ];
    }

    // ===== EVENT LISTENERS ===== //
    setupEventListeners() {
        // Filtros de feedback
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Filtros de tempo
        document.querySelectorAll('.time-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setPeriod(parseInt(e.target.dataset.period));
            });
        });

        // Paginação
        document.getElementById('prevPage')?.addEventListener('click', () => {
            this.previousPage();
        });

        document.getElementById('nextPage')?.addEventListener('click', () => {
            this.nextPage();
        });

        // Fechar modais com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Fechar modais clicando fora
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });
    }

    // ===== FILTROS E NAVEGAÇÃO ===== //
    setFilter(filter) {
        this.currentFilter = filter;
        this.currentPage = 1;
        
        // Atualizar botões
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderFeedbackTable();
    }

    setPeriod(period) {
        this.currentPeriod = period;
        
        // Atualizar botões
        document.querySelectorAll('.time-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-period="${period}"]`).classList.add('active');
        
        this.renderCharts();
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderFeedbackTable();
        }
    }

    nextPage() {
        const filteredFeedbacks = this.getFilteredFeedbacks();
        const totalPages = Math.ceil(filteredFeedbacks.length / this.itemsPerPage);
        
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderFeedbackTable();
        }
    }

    getFilteredFeedbacks() {
        if (this.currentFilter === 'all') {
            return this.feedbacks;
        }
        return this.feedbacks.filter(feedback => feedback.status === this.currentFilter);
    }

    // ===== RENDERIZAÇÃO ===== //
    renderDashboard() {
        this.updateMetrics();
    }

    updateMetrics() {
        const totalFeedbacks = this.feedbacks.length;
        const activeTests = this.tests.filter(t => t.status === 'active').length;
        const totalParticipants = this.tests.reduce((sum, test) => sum + test.currentParticipants, 0);
        const avgRating = this.feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / this.feedbacks.length;

        document.getElementById('totalFeedbacks').textContent = totalFeedbacks;
        document.getElementById('activeTests').textContent = activeTests;
        document.getElementById('totalParticipants').textContent = totalParticipants.toLocaleString();
        document.getElementById('avgSatisfaction').textContent = `${avgRating.toFixed(1)}/5`;
    }

    renderFeedbackTable() {
        const tbody = document.getElementById('feedbackTableBody');
        const filteredFeedbacks = this.getFilteredFeedbacks();
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = filteredFeedbacks.slice(startIndex, endIndex);

        tbody.innerHTML = pageData.map(feedback => `
            <tr>
                <td>#${feedback.id}</td>
                <td><span class="type-badge">${this.getTypeIcon(feedback.type)} ${this.getTypeName(feedback.type)}</span></td>
                <td>${feedback.title}</td>
                <td>${this.getPageName(feedback.page)}</td>
                <td><span class="priority-badge ${feedback.priority}">${this.getPriorityName(feedback.priority)}</span></td>
                <td><span class="status-badge ${feedback.status}">${this.getStatusName(feedback.status)}</span></td>
                <td>${this.formatDate(feedback.timestamp)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="adminSystem.viewFeedback(${feedback.id})" title="Ver detalhes">👁️</button>
                        <button class="action-btn" onclick="adminSystem.editFeedback(${feedback.id})" title="Editar">✏️</button>
                        <button class="action-btn" onclick="adminSystem.deleteFeedback(${feedback.id})" title="Excluir">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.updatePagination(filteredFeedbacks.length);
    }

    updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const paginationInfo = document.getElementById('paginationInfo');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');

        paginationInfo.textContent = `Página ${this.currentPage} de ${totalPages}`;
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages;
    }

    renderTests() {
        const container = document.getElementById('testsGrid');
        
        container.innerHTML = this.tests.map(test => `
            <div class="test-card ${test.status}">
                <div class="test-header">
                    <div>
                        <h3 class="test-title">${test.name}</h3>
                        <p class="test-description">${test.description}</p>
                    </div>
                    <span class="status-badge ${test.status}">${this.getTestStatusName(test.status)}</span>
                </div>
                
                <div class="test-meta">
                    <div class="test-meta-item">
                        <span class="test-meta-label">Tipo</span>
                        <span class="test-meta-value">${this.getTypeIcon(test.type)} ${this.getTypeName(test.type)}</span>
                    </div>
                    <div class="test-meta-item">
                        <span class="test-meta-label">Duração</span>
                        <span class="test-meta-value">${test.duration} dias</span>
                    </div>
                    <div class="test-meta-item">
                        <span class="test-meta-label">Participantes</span>
                        <span class="test-meta-value">${test.currentParticipants} participantes</span>
                    </div>
                    <div class="test-meta-item">
                        <span class="test-meta-label">Meta</span>
                        <span class="test-meta-value">${test.targetParticipants} participantes</span>
                    </div>
                </div>
                
                <div class="test-progress">
                    <div class="test-progress-label">
                        <span>Progresso</span>
                        <span>${test.progress}% concluído</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${test.progress}%"></div>
                    </div>
                </div>
                
                <div class="test-actions">
                    ${test.status === 'active' ? `
                        <button class="btn-small" onclick="adminSystem.viewTestResults(${test.id})">📊 Ver Resultados</button>
                        <button class="btn-small" onclick="adminSystem.configureTest(${test.id})">⚙️ Configurar</button>
                        <button class="btn-small" onclick="adminSystem.stopTest(${test.id})">⏹️ Parar</button>
                    ` : test.status === 'recruiting' ? `
                        <button class="btn-small" onclick="adminSystem.startTest(${test.id})">🚀 Iniciar</button>
                        <button class="btn-small" onclick="adminSystem.configureTest(${test.id})">⚙️ Configurar</button>
                        <button class="btn-small" onclick="adminSystem.deleteTest(${test.id})">🗑️ Excluir</button>
                    ` : `
                        <button class="btn-small" onclick="adminSystem.viewTestResults(${test.id})">📊 Ver Resultados</button>
                        <button class="btn-small" onclick="adminSystem.archiveTest(${test.id})">📦 Arquivar</button>
                    `}
                </div>
            </div>
        `).join('');
    }

    renderCharts() {
        this.renderFeedbackCategoryChart();
        this.renderSatisfactionChart();
        this.renderResolutionChart();
        this.renderParticipationChart();
    }

    renderFeedbackCategoryChart() {
        const canvas = document.getElementById('feedbackCategoryChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const categories = ['Bug', 'Funcionalidade', 'Melhoria', 'Elogio', 'Reclamação'];
        const data = [
            this.feedbacks.filter(f => f.type === 'bug').length,
            this.feedbacks.filter(f => f.type === 'feature').length,
            this.feedbacks.filter(f => f.type === 'improvement').length,
            this.feedbacks.filter(f => f.type === 'compliment').length,
            this.feedbacks.filter(f => f.type === 'complaint').length
        ];

        this.drawPieChart(ctx, data, categories, ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']);
    }

    renderSatisfactionChart() {
        const canvas = document.getElementById('satisfactionChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const days = 7;
        const labels = [];
        const data = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
            data.push(3.5 + Math.random() * 1.5); // Dados simulados
        }

        this.drawLineChart(ctx, data, labels, '#667eea');
    }

    renderResolutionChart() {
        const canvas = document.getElementById('resolutionChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const statuses = ['Pendente', 'Em Análise', 'Resolvido'];
        const data = [
            this.feedbacks.filter(f => f.status === 'pending').length,
            this.feedbacks.filter(f => f.status === 'analyzing').length,
            this.feedbacks.filter(f => f.status === 'resolved').length
        ];

        this.drawBarChart(ctx, data, statuses, ['#ef4444', '#3b82f6', '#10b981']);
    }

    renderParticipationChart() {
        const canvas = document.getElementById('participationChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const testNames = this.tests.map(t => t.name.split(' ').slice(0, 2).join(' '));
        const data = this.tests.map(t => t.currentParticipants);

        this.drawBarChart(ctx, data, testNames, ['#667eea', '#f093fb', '#43e97b']);
    }

    // ===== FUNÇÕES DE DESENHO DE GRÁFICOS ===== //
    drawPieChart(ctx, data, labels, colors) {
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        const total = data.reduce((sum, value) => sum + value, 0);
        let currentAngle = -Math.PI / 2;

        data.forEach((value, index) => {
            const sliceAngle = (value / total) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.lineTo(centerX, centerY);
            ctx.fillStyle = colors[index];
            ctx.fill();
            
            // Desenhar label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
            
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(value, labelX, labelY);
            
            currentAngle += sliceAngle;
        });
    }

    drawLineChart(ctx, data, labels, color) {
        const padding = 40;
        const width = ctx.canvas.width - 2 * padding;
        const height = ctx.canvas.height - 2 * padding;
        
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        const maxValue = Math.max(...data);
        const minValue = Math.min(...data);
        const range = maxValue - minValue || 1;
        
        // Desenhar linha
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        
        data.forEach((value, index) => {
            const x = padding + (index / (data.length - 1)) * width;
            const y = padding + height - ((value - minValue) / range) * height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Desenhar pontos
        ctx.fillStyle = color;
        data.forEach((value, index) => {
            const x = padding + (index / (data.length - 1)) * width;
            const y = padding + height - ((value - minValue) / range) * height;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    drawBarChart(ctx, data, labels, colors) {
        const padding = 40;
        const width = ctx.canvas.width - 2 * padding;
        const height = ctx.canvas.height - 2 * padding;
        
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        const maxValue = Math.max(...data);
        const barWidth = width / data.length * 0.8;
        const barSpacing = width / data.length * 0.2;
        
        data.forEach((value, index) => {
            const barHeight = (value / maxValue) * height;
            const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
            const y = padding + height - barHeight;
            
            ctx.fillStyle = colors[index % colors.length];
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Desenhar valor
            ctx.fillStyle = '#374151';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(value, x + barWidth / 2, y - 5);
        });
    }

    // ===== AÇÕES DE FEEDBACK ===== //
    viewFeedback(id) {
        const feedback = this.feedbacks.find(f => f.id === id);
        if (!feedback) return;

        this.selectedFeedback = feedback;
        
        const modalBody = document.getElementById('feedbackModalBody');
        modalBody.innerHTML = `
            <div class="feedback-details">
                <div class="detail-row">
                    <strong>ID:</strong> #${feedback.id}
                </div>
                <div class="detail-row">
                    <strong>Tipo:</strong> ${this.getTypeIcon(feedback.type)} ${this.getTypeName(feedback.type)}
                </div>
                <div class="detail-row">
                    <strong>Título:</strong> ${feedback.title}
                </div>
                <div class="detail-row">
                    <strong>Página:</strong> ${this.getPageName(feedback.page)}
                </div>
                <div class="detail-row">
                    <strong>Prioridade:</strong> <span class="priority-badge ${feedback.priority}">${this.getPriorityName(feedback.priority)}</span>
                </div>
                <div class="detail-row">
                    <strong>Status:</strong> <span class="status-badge ${feedback.status}">${this.getStatusName(feedback.status)}</span>
                </div>
                <div class="detail-row">
                    <strong>Usuário:</strong> ${feedback.user}
                </div>
                <div class="detail-row">
                    <strong>Email:</strong> ${feedback.email}
                </div>
                <div class="detail-row">
                    <strong>Permite contato:</strong> ${feedback.allowContact ? 'Sim' : 'Não'}
                </div>
                <div class="detail-row">
                    <strong>Data:</strong> ${this.formatDateTime(feedback.timestamp)}
                </div>
                <div class="detail-row">
                    <strong>Avaliação:</strong> ${'⭐'.repeat(feedback.rating || 0)}
                </div>
                <div class="detail-row">
                    <strong>Descrição:</strong>
                    <div style="margin-top: 0.5rem; padding: 1rem; background: #f9fafb; border-radius: 8px;">
                        ${feedback.description}
                    </div>
                </div>
            </div>
        `;

        this.showModal('feedbackModal');
    }

    editFeedback(id) {
        this.showNotification('Funcionalidade de edição será implementada em breve.', 'info');
    }

    deleteFeedback(id) {
        if (confirm('Tem certeza que deseja excluir este feedback?')) {
            this.feedbacks = this.feedbacks.filter(f => f.id !== id);
            this.renderFeedbackTable();
            this.updateMetrics();
            this.showNotification('Feedback excluído com sucesso!', 'success');
        }
    }

    updateFeedbackStatus() {
        if (!this.selectedFeedback) return;

        const newStatus = prompt('Novo status (pending, analyzing, resolved, thanked):', this.selectedFeedback.status);
        if (newStatus && ['pending', 'analyzing', 'resolved', 'thanked'].includes(newStatus)) {
            this.selectedFeedback.status = newStatus;
            this.renderFeedbackTable();
            this.closeFeedbackModal();
            this.showNotification('Status atualizado com sucesso!', 'success');
        }
    }

    // ===== AÇÕES DE TESTES ===== //
    viewTestResults(id) {
        this.showNotification('Visualização de resultados será implementada em breve.', 'info');
    }

    configureTest(id) {
        this.showNotification('Configuração de teste será implementada em breve.', 'info');
    }

    startTest(id) {
        const test = this.tests.find(t => t.id === id);
        if (test) {
            test.status = 'active';
            this.renderTests();
            this.showNotification(`Teste "${test.name}" iniciado com sucesso!`, 'success');
        }
    }

    stopTest(id) {
        const test = this.tests.find(t => t.id === id);
        if (test && confirm(`Tem certeza que deseja parar o teste "${test.name}"?`)) {
            test.status = 'completed';
            test.progress = 100;
            this.renderTests();
            this.showNotification(`Teste "${test.name}" finalizado!`, 'success');
        }
    }

    deleteTest(id) {
        const test = this.tests.find(t => t.id === id);
        if (test && confirm(`Tem certeza que deseja excluir o teste "${test.name}"?`)) {
            this.tests = this.tests.filter(t => t.id !== id);
            this.renderTests();
            this.showNotification('Teste excluído com sucesso!', 'success');
        }
    }

    archiveTest(id) {
        this.showNotification('Funcionalidade de arquivamento será implementada em breve.', 'info');
    }

    createNewTest() {
        const form = document.getElementById('createTestForm');
        const formData = new FormData(form);
        
        const newTest = {
            id: this.tests.length + 1,
            name: formData.get('testName'),
            description: formData.get('testDescription'),
            type: formData.get('testType'),
            duration: parseInt(formData.get('testDuration')),
            targetParticipants: parseInt(formData.get('testParticipants')),
            currentParticipants: 0,
            progress: 0,
            status: 'recruiting',
            startDate: Date.now(),
            endDate: Date.now() + (parseInt(formData.get('testDuration')) * 24 * 60 * 60 * 1000)
        };

        // Validação
        if (!newTest.name || !newTest.description || !newTest.type) {
            this.showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }

        this.tests.push(newTest);
        this.renderTests();
        this.closeCreateTestModal();
        form.reset();
        
        this.showNotification(`Teste "${newTest.name}" criado com sucesso!`, 'success');
    }

    // ===== MODAIS ===== //
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
        document.body.style.overflow = '';
    }

    closeFeedbackModal() {
        this.closeModal('feedbackModal');
        this.selectedFeedback = null;
    }

    closeCreateTestModal() {
        this.closeModal('createTestModal');
    }

    // ===== UTILITÁRIOS ===== //
    getTypeIcon(type) {
        const icons = {
            'bug': '🐛',
            'feature': '💡',
            'improvement': '⚡',
            'compliment': '👏',
            'complaint': '😤',
            'interface': '🎨',
            'mobile': '📱',
            'functionality': '⚡',
            'content': '📝'
        };
        return icons[type] || '📝';
    }

    getTypeName(type) {
        const names = {
            'bug': 'Bug',
            'feature': 'Funcionalidade',
            'improvement': 'Melhoria',
            'compliment': 'Elogio',
            'complaint': 'Reclamação',
            'interface': 'Interface',
            'mobile': 'Mobile',
            'functionality': 'Funcionalidade',
            'content': 'Conteúdo'
        };
        return names[type] || 'Outro';
    }

    getPageName(page) {
        const names = {
            'home': 'Página Inicial',
            'courses': 'Cursos',
            'materials': 'Materiais',
            'chat': 'Chat',
            'payments': 'Pagamentos',
            'gamification': 'Gamificação',
            'auth': 'Login/Registro'
        };
        return names[page] || 'Geral';
    }

    getPriorityName(priority) {
        const names = {
            'low': 'Baixa',
            'medium': 'Média',
            'high': 'Alta',
            'critical': 'Crítica'
        };
        return names[priority] || 'Média';
    }

    getStatusName(status) {
        const names = {
            'pending': 'Pendente',
            'analyzing': 'Em Análise',
            'resolved': 'Resolvido',
            'thanked': 'Agradecido'
        };
        return names[status] || 'Pendente';
    }

    getTestStatusName(status) {
        const names = {
            'active': 'Ativo',
            'recruiting': 'Recrutando',
            'completed': 'Concluído'
        };
        return names[status] || 'Inativo';
    }

    formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString('pt-BR');
    }

    formatDateTime(timestamp) {
        return new Date(timestamp).toLocaleString('pt-BR');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span>${this.getNotificationIcon(type)}</span>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }
}

// ===== FUNÇÕES GLOBAIS ===== //
function openCreateTestModal() {
    window.adminSystem.showModal('createTestModal');
}

function closeCreateTestModal() {
    window.adminSystem.closeCreateTestModal();
}

function closeFeedbackModal() {
    window.adminSystem.closeFeedbackModal();
}

function updateFeedbackStatus() {
    window.adminSystem.updateFeedbackStatus();
}

function createNewTest() {
    window.adminSystem.createNewTest();
}

function exportFeedbacks() {
    const data = {
        feedbacks: window.adminSystem.feedbacks,
        tests: window.adminSystem.tests,
        exportDate: new Date().toISOString(),
        totalFeedbacks: window.adminSystem.feedbacks.length,
        summary: {
            byType: {
                bug: window.adminSystem.feedbacks.filter(f => f.type === 'bug').length,
                feature: window.adminSystem.feedbacks.filter(f => f.type === 'feature').length,
                improvement: window.adminSystem.feedbacks.filter(f => f.type === 'improvement').length,
                compliment: window.adminSystem.feedbacks.filter(f => f.type === 'compliment').length,
                complaint: window.adminSystem.feedbacks.filter(f => f.type === 'complaint').length
            },
            byStatus: {
                pending: window.adminSystem.feedbacks.filter(f => f.status === 'pending').length,
                analyzing: window.adminSystem.feedbacks.filter(f => f.status === 'analyzing').length,
                resolved: window.adminSystem.feedbacks.filter(f => f.status === 'resolved').length,
                thanked: window.adminSystem.feedbacks.filter(f => f.status === 'thanked').length
            }
        }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `instituto_buriti_admin_export_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    window.adminSystem.showNotification('Dados exportados com sucesso!', 'success');
}

// ===== INICIALIZAÇÃO ===== //
document.addEventListener('DOMContentLoaded', () => {
    window.adminSystem = new AdminFeedbackSystem();
});

