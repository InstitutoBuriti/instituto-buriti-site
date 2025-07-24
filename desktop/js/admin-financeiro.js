/**
 * Financial Admin Panel JavaScript - Instituto Buriti
 * Gerencia métricas financeiras, relatórios e análises
 */

class FinancialAdminPanel {
    constructor() {
        this.charts = {};
        this.financialData = {};
        this.currentPeriod = '30d';
        this.init();
    }
    
    init() {
        this.loadFinancialData();
        this.setupEventListeners();
        this.initializeCharts();
        this.updateMetrics();
        this.loadTransactions();
        this.setupTableResponsive();
    }
    
    loadFinancialData() {
        // Simular dados financeiros completos
        this.financialData = {
            overview: {
                totalRevenue: 47850.00,
                revenueGrowth: 12.5,
                activeSubscribers: 1247,
                subscribersGrowth: 8.3,
                courseSales: 342,
                courseSalesGrowth: 15.7,
                conversionRate: 3.8,
                conversionGrowth: -2.1
            },
            revenueTimeline: this.generateRevenueTimeline(),
            revenueSources: {
                subscriptions: 32750.00,
                courses: 11100.00,
                certificates: 4000.00
            },
            paymentMethods: {
                creditCard: { amount: 32750.00, percentage: 68.5 },
                pix: { amount: 11100.00, percentage: 23.2 },
                boleto: { amount: 4000.00, percentage: 8.3 }
            },
            transactionStatus: {
                approved: 94.2,
                pending: 3.1,
                failed: 2.7
            },
            topCourses: [
                {
                    id: 1,
                    name: 'Fundamentos da IA',
                    instructor: 'Dr. Carlos Mendes',
                    sales: 127,
                    revenue: 25400.00,
                    image: '/upload/ChatGPTImage19dejul.de2025,19_04_54.png'
                },
                {
                    id: 2,
                    name: 'Gestão de Projetos Culturais',
                    instructor: 'Maria Santos',
                    sales: 89,
                    revenue: 13350.00,
                    image: '/upload/IMG_F027CED18C1C-1.jpeg'
                },
                {
                    id: 3,
                    name: 'Educação Especial Inclusiva',
                    instructor: 'Prof. Ana Oliveira',
                    sales: 76,
                    revenue: 9100.00,
                    image: '/upload/IMG_65A477CACFA8-1.jpeg'
                }
            ],
            categoryRevenue: {
                technology: 25400.00,
                culture: 13350.00,
                education: 9100.00
            }
        };
    }
    
    generateRevenueTimeline() {
        const timeline = [];
        const baseDate = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(baseDate);
            date.setDate(date.getDate() - i);
            
            const revenue = 1000 + Math.random() * 2000 + (i < 7 ? 500 : 0);
            const transactions = Math.floor(10 + Math.random() * 30);
            const users = Math.floor(5 + Math.random() * 15);
            
            timeline.push({
                date: date.toISOString().split('T')[0],
                revenue: revenue,
                transactions: transactions,
                users: users
            });
        }
        
        return timeline;
    }
    
    setupEventListeners() {
        // Period selector
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentPeriod = btn.dataset.period;
                this.updateCharts();
            });
        });
        
        // Chart controls
        document.querySelectorAll('.chart-control').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.chart-control').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateMainChart(btn.dataset.type);
            });
        });
        
        // Quick actions
        document.getElementById('generateReportBtn').addEventListener('click', () => {
            this.generateReport();
        });
        
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData();
        });
        
        document.getElementById('refreshDataBtn').addEventListener('click', () => {
            this.refreshData();
        });
        
        // Transaction actions
        this.setupTransactionActions();
        
        // Report actions
        this.setupReportActions();
        
        // Search and filters
        this.setupSearchAndFilters();
    }
    
    initializeCharts() {
        this.createMetricCharts();
        this.createMainRevenueChart();
        this.createRevenueSourcesChart();
        this.createTransactionStatusChart();
        this.createCategoryRevenueChart();
    }
    
    createMetricCharts() {
        // Revenue mini chart
        const revenueCtx = document.getElementById('revenueChart');
        if (revenueCtx) {
            this.charts.revenue = new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: this.financialData.revenueTimeline.slice(-7).map(d => d.date.split('-')[2]),
                    datasets: [{
                        data: this.financialData.revenueTimeline.slice(-7).map(d => d.revenue),
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { display: false },
                        y: { display: false }
                    },
                    elements: { point: { radius: 0 } }
                }
            });
        }
        
        // Subscribers mini chart
        const subscribersCtx = document.getElementById('subscribersChart');
        if (subscribersCtx) {
            this.charts.subscribers = new Chart(subscribersCtx, {
                type: 'line',
                data: {
                    labels: this.financialData.revenueTimeline.slice(-7).map(d => d.date.split('-')[2]),
                    datasets: [{
                        data: this.financialData.revenueTimeline.slice(-7).map(d => d.users * 10),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { display: false },
                        y: { display: false }
                    }
                }
            });
        }
        
        // Courses mini chart
        const coursesCtx = document.getElementById('coursesChart');
        if (coursesCtx) {
            this.charts.courses = new Chart(coursesCtx, {
                type: 'bar',
                data: {
                    labels: this.financialData.revenueTimeline.slice(-7).map(d => d.date.split('-')[2]),
                    datasets: [{
                        data: this.financialData.revenueTimeline.slice(-7).map(d => d.transactions),
                        backgroundColor: '#8b5cf6',
                        borderRadius: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { display: false },
                        y: { display: false }
                    }
                }
            });
        }
        
        // Conversion mini chart
        const conversionCtx = document.getElementById('conversionChart');
        if (conversionCtx) {
            this.charts.conversion = new Chart(conversionCtx, {
                type: 'line',
                data: {
                    labels: this.financialData.revenueTimeline.slice(-7).map(d => d.date.split('-')[2]),
                    datasets: [{
                        data: [4.2, 3.8, 4.1, 3.9, 3.7, 3.8, 3.8],
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { display: false },
                        y: { display: false }
                    }
                }
            });
        }
    }
    
    createMainRevenueChart() {
        const ctx = document.getElementById('mainRevenueChart');
        if (!ctx) return;
        
        this.charts.mainRevenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.financialData.revenueTimeline.map(d => {
                    const date = new Date(d.date);
                    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                }),
                datasets: [{
                    label: 'Receita (R$)',
                    data: this.financialData.revenueTimeline.map(d => d.revenue),
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#8b5cf6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#8b5cf6',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `Receita: R$ ${context.parsed.y.toFixed(2).replace('.', ',')}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#6b7280',
                            callback: function(value) {
                                return 'R$ ' + value.toFixed(0);
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }
    
    createRevenueSourcesChart() {
        const ctx = document.getElementById('revenueSourcesChart');
        if (!ctx) return;
        
        const data = this.financialData.revenueSources;
        
        this.charts.revenueSources = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Assinaturas', 'Cursos Individuais', 'Certificados'],
                datasets: [{
                    data: [data.subscriptions, data.courses, data.certificates],
                    backgroundColor: [
                        '#8b5cf6',
                        '#f97316',
                        '#10b981'
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#8b5cf6',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: R$ ${value.toFixed(2).replace('.', ',')} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
        
        // Create legend
        this.createRevenueLegend();
    }
    
    createRevenueLegend() {
        const legendContainer = document.getElementById('revenueLegend');
        if (!legendContainer) return;
        
        const data = this.financialData.revenueSources;
        const colors = ['#8b5cf6', '#f97316', '#10b981'];
        const labels = ['Assinaturas', 'Cursos Individuais', 'Certificados'];
        const values = [data.subscriptions, data.courses, data.certificates];
        
        legendContainer.innerHTML = labels.map((label, index) => `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${colors[index]}"></div>
                <span>${label}</span>
                <strong>R$ ${values[index].toFixed(2).replace('.', ',')}</strong>
            </div>
        `).join('');
    }
    
    createTransactionStatusChart() {
        const ctx = document.getElementById('transactionStatusChart');
        if (!ctx) return;
        
        const data = this.financialData.transactionStatus;
        
        this.charts.transactionStatus = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Aprovadas', 'Pendentes', 'Falharam'],
                datasets: [{
                    data: [data.approved, data.pending, data.failed],
                    backgroundColor: [
                        '#10b981',
                        '#f59e0b',
                        '#ef4444'
                    ],
                    borderWidth: 0,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#8b5cf6',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed}%`;
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }
    
    createCategoryRevenueChart() {
        const ctx = document.getElementById('categoryRevenueChart');
        if (!ctx) return;
        
        const data = this.financialData.categoryRevenue;
        
        this.charts.categoryRevenue = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Tecnologia', 'Cultura', 'Educação'],
                datasets: [{
                    data: [data.technology, data.culture, data.education],
                    backgroundColor: [
                        '#8b5cf6',
                        '#f97316',
                        '#10b981'
                    ],
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#8b5cf6',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `Receita: R$ ${context.parsed.y.toFixed(2).replace('.', ',')}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#6b7280',
                            callback: function(value) {
                                return 'R$ ' + (value / 1000).toFixed(0) + 'k';
                            }
                        }
                    }
                }
            }
        });
    }
    
    updateMetrics() {
        const overview = this.financialData.overview;
        
        // Update metric values
        document.getElementById('totalRevenue').textContent = 
            `R$ ${overview.totalRevenue.toFixed(2).replace('.', ',').replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.')}`;
        
        document.getElementById('activeSubscribers').textContent = 
            overview.activeSubscribers.toLocaleString('pt-BR');
        
        document.getElementById('courseSales').textContent = 
            overview.courseSales.toString();
        
        document.getElementById('conversionRate').textContent = 
            `${overview.conversionRate}%`;
        
        // Update trends
        this.updateTrendIndicators();
    }
    
    updateTrendIndicators() {
        const trends = [
            { selector: '.revenue .metric-trend', value: this.financialData.overview.revenueGrowth },
            { selector: '.subscriptions .metric-trend', value: this.financialData.overview.subscribersGrowth },
            { selector: '.courses .metric-trend', value: this.financialData.overview.courseSalesGrowth },
            { selector: '.conversion .metric-trend', value: this.financialData.overview.conversionGrowth }
        ];
        
        trends.forEach(trend => {
            const element = document.querySelector(trend.selector);
            if (element) {
                const isPositive = trend.value > 0;
                element.className = `metric-trend ${isPositive ? 'up' : 'down'}`;
                element.innerHTML = `
                    <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i>
                    <span>${isPositive ? '+' : ''}${trend.value}%</span>
                `;
            }
        });
    }
    
    updateMainChart(type) {
        if (!this.charts.mainRevenue) return;
        
        let data, label, color;
        
        switch (type) {
            case 'revenue':
                data = this.financialData.revenueTimeline.map(d => d.revenue);
                label = 'Receita (R$)';
                color = '#8b5cf6';
                break;
            case 'transactions':
                data = this.financialData.revenueTimeline.map(d => d.transactions);
                label = 'Transações';
                color = '#f97316';
                break;
            case 'users':
                data = this.financialData.revenueTimeline.map(d => d.users);
                label = 'Novos Usuários';
                color = '#10b981';
                break;
        }
        
        this.charts.mainRevenue.data.datasets[0].data = data;
        this.charts.mainRevenue.data.datasets[0].label = label;
        this.charts.mainRevenue.data.datasets[0].borderColor = color;
        this.charts.mainRevenue.data.datasets[0].backgroundColor = color + '20';
        this.charts.mainRevenue.data.datasets[0].pointBackgroundColor = color;
        
        this.charts.mainRevenue.update();
    }
    
    updateCharts() {
        // Simular atualização baseada no período
        console.log('Atualizando gráficos para período:', this.currentPeriod);
        
        // Recriar timeline baseado no período
        this.financialData.revenueTimeline = this.generateRevenueTimeline();
        
        // Atualizar gráficos
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.update) {
                chart.update();
            }
        });
        
        this.showNotification('Gráficos atualizados com sucesso!', 'success');
    }
    
    loadTransactions() {
        // Dados já estão na tabela HTML
        // Aqui poderia carregar dados dinâmicos via API
        console.log('Transações carregadas');
    }
    
    setupTransactionActions() {
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.title.toLowerCase();
                const row = btn.closest('.table-row');
                const transactionId = row.querySelector('.transaction-id').textContent;
                
                if (action.includes('detalhes')) {
                    this.showTransactionDetails(transactionId);
                } else if (action.includes('estornar')) {
                    this.refundTransaction(transactionId);
                } else if (action.includes('recibo')) {
                    this.downloadReceipt(transactionId);
                } else if (action.includes('cancelar')) {
                    this.cancelTransaction(transactionId);
                } else if (action.includes('tentar')) {
                    this.retryTransaction(transactionId);
                } else if (action.includes('contatar')) {
                    this.contactCustomer(transactionId);
                }
            });
        });
    }
    
    setupReportActions() {
        document.querySelectorAll('.report-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.classList.contains('view') ? 'view' :
                             btn.classList.contains('download') ? 'download' :
                             btn.classList.contains('schedule') ? 'schedule' : 'unknown';
                
                const reportCard = btn.closest('.report-card');
                const reportTitle = reportCard.querySelector('h3').textContent;
                
                this.handleReportAction(action, reportTitle);
            });
        });
    }
    
    setupSearchAndFilters() {
        // Search functionality
        const searchInput = document.getElementById('transactionSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterTransactions(e.target.value);
            });
        }
        
        // Filter button
        const filterBtn = document.getElementById('filterTransactionsBtn');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                this.showFilterModal();
            });
        }
        
        // Export button
        const exportBtn = document.getElementById('exportTransactionsBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportTransactions();
            });
        }
    }
    
    setupTableResponsive() {
        // Add data labels for mobile view
        const tableCells = document.querySelectorAll('.table-cell');
        const headers = ['ID', 'Cliente', 'Produto', 'Método', 'Status', 'Valor', 'Data', 'Ações'];
        
        tableCells.forEach((cell, index) => {
            const headerIndex = index % headers.length;
            cell.setAttribute('data-label', headers[headerIndex]);
        });
    }
    
    generateReport() {
        this.showNotification('Gerando relatório financeiro...', 'info');
        
        // Simular geração de relatório
        setTimeout(() => {
            const reportContent = this.createReportContent();
            this.downloadReport(reportContent);
            this.showNotification('Relatório gerado com sucesso!', 'success');
        }, 2000);
    }
    
    createReportContent() {
        const overview = this.financialData.overview;
        const currentDate = new Date().toLocaleDateString('pt-BR');
        
        return `
INSTITUTO BURITI - RELATÓRIO FINANCEIRO
=======================================
Data: ${currentDate}

RESUMO EXECUTIVO
================
Receita Total: R$ ${overview.totalRevenue.toFixed(2).replace('.', ',')}
Crescimento: ${overview.revenueGrowth > 0 ? '+' : ''}${overview.revenueGrowth}%

Assinantes Ativos: ${overview.activeSubscribers}
Crescimento: ${overview.subscribersGrowth > 0 ? '+' : ''}${overview.subscribersGrowth}%

Vendas de Cursos: ${overview.courseSales}
Crescimento: ${overview.courseSalesGrowth > 0 ? '+' : ''}${overview.courseSalesGrowth}%

Taxa de Conversão: ${overview.conversionRate}%
Variação: ${overview.conversionGrowth > 0 ? '+' : ''}${overview.conversionGrowth}%

FONTES DE RECEITA
=================
Assinaturas: R$ ${this.financialData.revenueSources.subscriptions.toFixed(2).replace('.', ',')}
Cursos Individuais: R$ ${this.financialData.revenueSources.courses.toFixed(2).replace('.', ',')}
Certificados: R$ ${this.financialData.revenueSources.certificates.toFixed(2).replace('.', ',')}

MÉTODOS DE PAGAMENTO
====================
Cartão de Crédito: R$ ${this.financialData.paymentMethods.creditCard.amount.toFixed(2).replace('.', ',')} (${this.financialData.paymentMethods.creditCard.percentage}%)
PIX: R$ ${this.financialData.paymentMethods.pix.amount.toFixed(2).replace('.', ',')} (${this.financialData.paymentMethods.pix.percentage}%)
Boleto: R$ ${this.financialData.paymentMethods.boleto.amount.toFixed(2).replace('.', ',')} (${this.financialData.paymentMethods.boleto.percentage}%)

STATUS DAS TRANSAÇÕES
=====================
Aprovadas: ${this.financialData.transactionStatus.approved}%
Pendentes: ${this.financialData.transactionStatus.pending}%
Falharam: ${this.financialData.transactionStatus.failed}%

CURSOS MAIS VENDIDOS
====================
${this.financialData.topCourses.map((course, index) => 
    `${index + 1}. ${course.name} - ${course.sales} vendas - R$ ${course.revenue.toFixed(2).replace('.', ',')}`
).join('\\n')}

=======================================
Instituto Buriti - Relatório Automático
contato@institutoburiti.com.br
        `;
    }
    
    downloadReport(content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    exportData() {
        this.showNotification('Exportando dados financeiros...', 'info');
        
        // Simular exportação
        setTimeout(() => {
            const csvContent = this.createCSVContent();
            this.downloadCSV(csvContent);
            this.showNotification('Dados exportados com sucesso!', 'success');
        }, 1500);
    }
    
    createCSVContent() {
        const headers = ['Data', 'Receita', 'Transações', 'Usuários'];
        const rows = this.financialData.revenueTimeline.map(d => [
            d.date,
            d.revenue.toFixed(2),
            d.transactions,
            d.users
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\\n');
    }
    
    downloadCSV(content) {
        const blob = new Blob([content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dados-financeiros-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    refreshData() {
        this.showNotification('Atualizando dados...', 'info');
        
        // Simular refresh
        setTimeout(() => {
            this.loadFinancialData();
            this.updateMetrics();
            this.updateCharts();
            this.showNotification('Dados atualizados com sucesso!', 'success');
        }, 1000);
    }
    
    showTransactionDetails(transactionId) {
        const modal = this.createModal(`Detalhes da Transação ${transactionId}`, `
            <div class="transaction-details">
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="label">ID da Transação:</span>
                        <span class="value">${transactionId}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Data e Hora:</span>
                        <span class="value">19/07/2025 às 14:30</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Cliente:</span>
                        <span class="value">Ana Silva (ana.silva@email.com)</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Produto:</span>
                        <span class="value">Assinatura Premium - Mensal</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Valor:</span>
                        <span class="value">R$ 59,90</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Método de Pagamento:</span>
                        <span class="value">Cartão de Crédito •••• 1234</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Status:</span>
                        <span class="value status success">Aprovada</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Gateway:</span>
                        <span class="value">PagSeguro</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Taxa:</span>
                        <span class="value">R$ 2,40 (4%)</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Valor Líquido:</span>
                        <span class="value">R$ 57,50</span>
                    </div>
                </div>
            </div>
        `, [
            { text: 'Fechar', class: 'btn-secondary', action: 'close' },
            { text: 'Baixar Recibo', class: 'btn-primary', action: 'download' }
        ]);
        
        modal.querySelector('.btn-primary').addEventListener('click', () => {
            this.downloadReceipt(transactionId);
        });
    }
    
    refundTransaction(transactionId) {
        const modal = this.createModal('Confirmar Estorno', `
            <div class="refund-content">
                <div class="warning-box">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Tem certeza que deseja estornar a transação ${transactionId}?</p>
                    <p><strong>Esta ação não pode ser desfeita.</strong></p>
                </div>
                <div class="refund-details">
                    <div class="detail-item">
                        <span class="label">Valor a ser estornado:</span>
                        <span class="value">R$ 59,90</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Prazo para estorno:</span>
                        <span class="value">1-3 dias úteis</span>
                    </div>
                </div>
                <div class="refund-reason">
                    <label for="refundReason">Motivo do estorno:</label>
                    <select id="refundReason">
                        <option value="">Selecione o motivo</option>
                        <option value="customer_request">Solicitação do cliente</option>
                        <option value="technical_error">Erro técnico</option>
                        <option value="fraud">Suspeita de fraude</option>
                        <option value="other">Outro motivo</option>
                    </select>
                </div>
            </div>
        `, [
            { text: 'Cancelar', class: 'btn-secondary', action: 'close' },
            { text: 'Confirmar Estorno', class: 'btn-danger', action: 'refund' }
        ]);
        
        modal.querySelector('.btn-danger').addEventListener('click', () => {
            const reason = modal.querySelector('#refundReason').value;
            if (!reason) {
                this.showNotification('Por favor, selecione o motivo do estorno', 'error');
                return;
            }
            
            this.processRefund(transactionId, reason);
            document.body.removeChild(modal);
        });
    }
    
    processRefund(transactionId, reason) {
        this.showNotification('Processando estorno...', 'info');
        
        // Simular processamento
        setTimeout(() => {
            this.showNotification(`Estorno da transação ${transactionId} processado com sucesso!`, 'success');
        }, 2000);
    }
    
    downloadReceipt(transactionId) {
        const receiptContent = `
INSTITUTO BURITI - RECIBO
========================
Transação: ${transactionId}
Data: 19/07/2025 14:30

Cliente: Ana Silva
Email: ana.silva@email.com

Produto: Assinatura Premium - Mensal
Valor: R$ 59,90
Método: Cartão •••• 1234
Status: Aprovada

========================
Instituto Buriti
contato@institutoburiti.com.br
        `;
        
        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recibo-${transactionId.replace('#', '')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Recibo baixado com sucesso!', 'success');
    }
    
    cancelTransaction(transactionId) {
        this.showNotification(`Cancelando transação ${transactionId}...`, 'info');
        
        setTimeout(() => {
            this.showNotification('Transação cancelada com sucesso!', 'success');
        }, 1500);
    }
    
    retryTransaction(transactionId) {
        this.showNotification(`Tentando novamente transação ${transactionId}...`, 'info');
        
        setTimeout(() => {
            this.showNotification('Nova tentativa de pagamento iniciada!', 'success');
        }, 1500);
    }
    
    contactCustomer(transactionId) {
        const modal = this.createModal('Contatar Cliente', `
            <div class="contact-form">
                <div class="customer-info">
                    <h4>Maria Santos</h4>
                    <p>maria.santos@email.com</p>
                    <p>Transação: ${transactionId}</p>
                </div>
                <div class="contact-options">
                    <button class="contact-btn email">
                        <i class="fas fa-envelope"></i>
                        Enviar Email
                    </button>
                    <button class="contact-btn whatsapp">
                        <i class="fab fa-whatsapp"></i>
                        WhatsApp
                    </button>
                    <button class="contact-btn phone">
                        <i class="fas fa-phone"></i>
                        Ligar
                    </button>
                </div>
                <div class="message-template">
                    <label for="messageTemplate">Modelo de mensagem:</label>
                    <select id="messageTemplate">
                        <option value="">Selecione um modelo</option>
                        <option value="payment_failed">Falha no pagamento</option>
                        <option value="refund_info">Informações sobre estorno</option>
                        <option value="support">Suporte geral</option>
                    </select>
                    <textarea placeholder="Mensagem personalizada..."></textarea>
                </div>
            </div>
        `, [
            { text: 'Cancelar', class: 'btn-secondary', action: 'close' },
            { text: 'Enviar', class: 'btn-primary', action: 'send' }
        ]);
        
        modal.querySelector('.btn-primary').addEventListener('click', () => {
            this.sendCustomerMessage(transactionId);
            document.body.removeChild(modal);
        });
    }
    
    sendCustomerMessage(transactionId) {
        this.showNotification('Mensagem enviada para o cliente!', 'success');
    }
    
    filterTransactions(searchTerm) {
        const rows = document.querySelectorAll('.table-row');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const matches = text.includes(searchTerm.toLowerCase());
            row.style.display = matches ? '' : 'none';
        });
    }
    
    showFilterModal() {
        const modal = this.createModal('Filtrar Transações', `
            <div class="filter-form">
                <div class="form-group">
                    <label>Período:</label>
                    <select id="periodFilter">
                        <option value="all">Todos os períodos</option>
                        <option value="today">Hoje</option>
                        <option value="week">Esta semana</option>
                        <option value="month">Este mês</option>
                        <option value="custom">Período personalizado</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Status:</label>
                    <select id="statusFilter">
                        <option value="all">Todos os status</option>
                        <option value="success">Aprovadas</option>
                        <option value="pending">Pendentes</option>
                        <option value="failed">Falharam</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Método de Pagamento:</label>
                    <select id="methodFilter">
                        <option value="all">Todos os métodos</option>
                        <option value="credit-card">Cartão de Crédito</option>
                        <option value="pix">PIX</option>
                        <option value="boleto">Boleto</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Valor mínimo:</label>
                    <input type="number" id="minAmount" placeholder="R$ 0,00">
                </div>
                <div class="form-group">
                    <label>Valor máximo:</label>
                    <input type="number" id="maxAmount" placeholder="R$ 1000,00">
                </div>
            </div>
        `, [
            { text: 'Limpar', class: 'btn-secondary', action: 'clear' },
            { text: 'Aplicar Filtros', class: 'btn-primary', action: 'apply' }
        ]);
        
        modal.querySelector('.btn-secondary').addEventListener('click', () => {
            this.clearFilters();
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.btn-primary').addEventListener('click', () => {
            this.applyFilters(modal);
            document.body.removeChild(modal);
        });
    }
    
    clearFilters() {
        document.querySelectorAll('.table-row').forEach(row => {
            row.style.display = '';
        });
        this.showNotification('Filtros removidos', 'info');
    }
    
    applyFilters(modal) {
        // Aplicar filtros baseado nos valores do modal
        this.showNotification('Filtros aplicados com sucesso!', 'success');
    }
    
    exportTransactions() {
        this.showNotification('Exportando transações...', 'info');
        
        setTimeout(() => {
            const csvContent = `ID,Cliente,Produto,Método,Status,Valor,Data
#IB-001247,Ana Silva,Assinatura Premium,Cartão,Aprovada,R$ 59.90,19/07/2025
#IB-001246,João Mendes,Fundamentos da IA,PIX,Pendente,R$ 199.90,19/07/2025
#IB-001245,Maria Santos,Plano Anual,Boleto,Falhou,R$ 499.90,18/07/2025`;
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transacoes-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Transações exportadas com sucesso!', 'success');
        }, 1500);
    }
    
    handleReportAction(action, reportTitle) {
        switch (action) {
            case 'view':
                this.showNotification(`Abrindo ${reportTitle}...`, 'info');
                break;
            case 'download':
                this.showNotification(`Baixando ${reportTitle}...`, 'info');
                setTimeout(() => {
                    this.showNotification('Download concluído!', 'success');
                }, 2000);
                break;
            case 'schedule':
                this.showNotification(`Você será notificado quando ${reportTitle} estiver pronto`, 'info');
                break;
        }
    }
    
    createModal(title, content, buttons = []) {
        const modal = document.createElement('div');
        modal.className = 'financial-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        ${buttons.map(btn => `
                            <button class="${btn.class}" data-action="${btn.action}">
                                ${btn.text}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        this.addModalStyles();
        document.body.appendChild(modal);
        
        // Close events
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal-overlay')) {
                document.body.removeChild(modal);
            }
        });
        
        // Button events
        buttons.forEach(btn => {
            if (btn.action === 'close') {
                modal.querySelector(`[data-action="${btn.action}"]`).addEventListener('click', () => {
                    document.body.removeChild(modal);
                });
            }
        });
        
        return modal;
    }
    
    addModalStyles() {
        if (document.querySelector('#financial-modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'financial-modal-styles';
        style.textContent = `
            .financial-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
            }
            
            .modal-content {
                background: white;
                border-radius: 16px;
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                z-index: 1;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .modal-header h3 {
                margin: 0;
                color: #1f2937;
                font-size: 1.3rem;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #6b7280;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            
            .modal-close:hover {
                background: #f3f4f6;
                color: #374151;
            }
            
            .modal-body {
                padding: 1.5rem;
            }
            
            .modal-footer {
                display: flex;
                gap: 1rem;
                padding: 1.5rem;
                border-top: 1px solid #e5e7eb;
                justify-content: flex-end;
            }
            
            .detail-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
            }
            
            .detail-item {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }
            
            .detail-item .label {
                font-weight: 600;
                color: #6b7280;
                font-size: 0.9rem;
            }
            
            .detail-item .value {
                color: #1f2937;
                font-weight: 500;
            }
            
            .warning-box {
                background: rgba(245, 158, 11, 0.1);
                border: 1px solid rgba(245, 158, 11, 0.3);
                border-radius: 8px;
                padding: 1rem;
                text-align: center;
                margin-bottom: 1rem;
            }
            
            .warning-box i {
                color: #f59e0b;
                font-size: 2rem;
                margin-bottom: 0.5rem;
            }
            
            .form-group {
                margin-bottom: 1rem;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 600;
                color: #374151;
            }
            
            .form-group select,
            .form-group input,
            .form-group textarea {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 1rem;
                transition: border-color 0.3s ease;
            }
            
            .form-group select:focus,
            .form-group input:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: #8b5cf6;
                box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
            }
            
            .form-group textarea {
                height: 80px;
                resize: vertical;
            }
            
            .contact-options {
                display: flex;
                gap: 1rem;
                margin: 1rem 0;
                justify-content: center;
            }
            
            .contact-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;
                padding: 1rem;
                border: 2px solid #e5e7eb;
                background: white;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 80px;
            }
            
            .contact-btn:hover {
                border-color: #8b5cf6;
                background: rgba(139, 92, 246, 0.05);
            }
            
            .contact-btn i {
                font-size: 1.5rem;
                color: #8b5cf6;
            }
            
            @media (max-width: 768px) {
                .modal-content {
                    width: 95%;
                    margin: 1rem;
                }
                
                .modal-footer {
                    flex-direction: column;
                }
                
                .detail-grid {
                    grid-template-columns: 1fr;
                }
                
                .contact-options {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `financial-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            font-family: 'Inter', sans-serif;
            font-size: 0.9rem;
            font-weight: 500;
        `;
        
        notification.querySelector('.notification-content').style.cssText = `
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FinancialAdminPanel();
});

