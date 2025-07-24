// Analytics Core - Instituto Buriti
// Sistema de Analytics e Relatórios

class AnalyticsCore {
    constructor() {
        this.data = {
            overview: {
                activeStudents: 318,
                instructors: 12,
                activeCourses: 15,
                pendingCourses: 3,
                archivedCourses: 8,
                totalRevenue: 48900.00,
                monthlyRevenue: 12750.00,
                conversionRate: 4.2,
                averageTime: "2h 34min",
                deviceAccess: {
                    desktop: 65,
                    mobile: 28,
                    tablet: 7
                }
            },
            engagement: {
                dailyAccess: [120, 135, 98, 156, 142, 178, 165, 189, 201, 167, 145, 198, 234, 187, 156, 178, 165, 189, 201, 167, 145, 198, 234, 187, 156, 178, 165, 189, 201, 167],
                weeklyAccess: [1250, 1380, 1456, 1234, 1567, 1678, 1789],
                monthlyAccess: [5670, 6234, 5890, 6456, 7123, 6789, 7234, 6890, 7456, 7123, 6789, 7890],
                completionRate: 78,
                dropoutClusters: {
                    module1: 15,
                    module2: 8,
                    module3: 5,
                    module4: 3
                },
                hourlyUsage: [5, 3, 2, 1, 2, 8, 15, 25, 35, 42, 38, 45, 48, 52, 46, 41, 38, 32, 28, 22, 18, 12, 8, 6]
            },
            courses: [
                {
                    id: 1,
                    name: "Inteligência Artificial na Educação",
                    instructor: "Dr. Carlos Mendes",
                    students: 127,
                    completionRate: 82,
                    revenue: 25400.00,
                    avgRating: 4.8,
                    category: "Tecnologia",
                    enrollments: [15, 18, 22, 19, 25, 28, 20],
                    progress: [65, 70, 75, 78, 80, 82, 82]
                },
                {
                    id: 2,
                    name: "Gestão de Projetos Culturais",
                    instructor: "Maria Santos",
                    students: 89,
                    completionRate: 75,
                    revenue: 13350.00,
                    avgRating: 4.6,
                    category: "Gestão",
                    enrollments: [12, 14, 16, 15, 18, 20, 14],
                    progress: [60, 65, 68, 70, 72, 74, 75]
                },
                {
                    id: 3,
                    name: "Educação Especial Inclusiva",
                    instructor: "Prof. Ana Oliveira",
                    students: 76,
                    completionRate: 88,
                    revenue: 9100.00,
                    avgRating: 4.9,
                    category: "Educação",
                    enrollments: [10, 12, 14, 13, 16, 18, 12],
                    progress: [70, 75, 80, 83, 85, 87, 88]
                },
                {
                    id: 4,
                    name: "Marketing Digital para Educadores",
                    instructor: "João Silva",
                    students: 64,
                    completionRate: 71,
                    revenue: 7680.00,
                    avgRating: 4.4,
                    category: "Marketing",
                    enrollments: [8, 10, 12, 11, 14, 16, 10],
                    progress: [55, 60, 63, 66, 68, 70, 71]
                },
                {
                    id: 5,
                    name: "Metodologias Ativas de Ensino",
                    instructor: "Dra. Patricia Costa",
                    students: 52,
                    completionRate: 85,
                    revenue: 6240.00,
                    avgRating: 4.7,
                    category: "Educação",
                    enrollments: [6, 8, 10, 9, 12, 14, 8],
                    progress: [65, 70, 75, 78, 81, 83, 85]
                }
            ],
            revenue: {
                daily: [1200, 1350, 980, 1560, 1420, 1780, 1650, 1890, 2010, 1670, 1450, 1980, 2340, 1870, 1560, 1780, 1650, 1890, 2010, 1670, 1450, 1980, 2340, 1870, 1560, 1780, 1650, 1890, 2010, 1670],
                weekly: [8750, 9380, 9456, 8234, 10567, 11678, 12789],
                monthly: [35670, 38234, 35890, 40456, 43123, 41789, 45234, 42890, 47456, 45123, 44789, 48900],
                sources: {
                    subscriptions: 32750.00,
                    individual_courses: 11100.00,
                    certificates: 4000.00,
                    events: 1050.00
                },
                methods: {
                    credit_card: 68.5,
                    pix: 23.2,
                    bank_slip: 8.3
                }
            },
            transactions: {
                approved: 94.2,
                pending: 3.1,
                failed: 2.7
            }
        };
        
        this.filters = {
            period: 30,
            course: 'all',
            instructor: 'all',
            search: ''
        };
        
        this.charts = {};
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadCharts();
    }
    
    setupEventListeners() {
        // Filtros
        const periodFilter = document.getElementById('periodFilter');
        const courseFilter = document.getElementById('courseFilter');
        const instructorFilter = document.getElementById('instructorFilter');
        const searchFilter = document.getElementById('searchFilter');
        const resetFilters = document.getElementById('resetFilters');
        
        if (periodFilter) {
            periodFilter.addEventListener('change', (e) => {
                this.filters.period = parseInt(e.target.value);
                this.updateCharts();
            });
        }
        
        if (courseFilter) {
            courseFilter.addEventListener('change', (e) => {
                this.filters.course = e.target.value;
                this.updateCharts();
            });
        }
        
        if (instructorFilter) {
            instructorFilter.addEventListener('change', (e) => {
                this.filters.instructor = e.target.value;
                this.updateCharts();
            });
        }
        
        if (searchFilter) {
            searchFilter.addEventListener('input', (e) => {
                this.filters.search = e.target.value.toLowerCase();
                this.updateTable();
            });
        }
        
        if (resetFilters) {
            resetFilters.addEventListener('click', () => {
                this.resetFilters();
            });
        }
        
        // Botões de ação
        const generateReport = document.getElementById('generateReport');
        const exportData = document.getElementById('exportData');
        const refreshData = document.getElementById('refreshData');
        
        if (generateReport) {
            generateReport.addEventListener('click', () => {
                this.generateReport();
            });
        }
        
        if (exportData) {
            exportData.addEventListener('click', () => {
                this.exportData();
            });
        }
        
        if (refreshData) {
            refreshData.addEventListener('click', () => {
                this.refreshData();
            });
        }
        
        // Tabs de gráficos
        const chartTabs = document.querySelectorAll('.chart-tab');
        chartTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const chartType = e.target.dataset.chart;
                this.switchChart(chartType);
                
                // Update active tab
                chartTabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }
    
    loadCharts() {
        this.createRevenueChart();
        this.createDeviceChart();
        this.createCourseChart();
        this.createEngagementChart();
        this.createCompletionChart();
    }
    
    createRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;
        
        const labels = this.generateDateLabels(this.filters.period);
        const data = this.getRevenueData(this.filters.period);
        
        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Receita (R$)',
                    data: data,
                    borderColor: '#A020F0',
                    backgroundColor: 'rgba(160, 32, 240, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#A020F0',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
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
                        borderColor: '#A020F0',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `R$ ${context.parsed.y.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
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
                            color: '#6C757D'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#6C757D',
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }
    
    createDeviceChart() {
        const ctx = document.getElementById('deviceChart');
        if (!ctx) return;
        
        this.charts.device = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Desktop', 'Mobile', 'Tablet'],
                datasets: [{
                    data: [65, 28, 7],
                    backgroundColor: ['#A020F0', '#6B8C79', '#A95028'],
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
                        borderColor: '#A020F0',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed}%`;
                            }
                        }
                    }
                },
                cutout: '60%',
                animation: {
                    animateRotate: true,
                    duration: 1000
                }
            }
        });
    }
    
    createCourseChart() {
        const ctx = document.getElementById('courseChart');
        if (!ctx) return;
        
        const courses = this.data.courses.slice(0, 5);
        
        this.charts.course = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: courses.map(c => c.name.length > 20 ? c.name.substring(0, 20) + '...' : c.name),
                datasets: [
                    {
                        label: 'Alunos',
                        data: courses.map(c => c.students),
                        backgroundColor: 'rgba(160, 32, 240, 0.8)',
                        borderColor: '#A020F0',
                        borderWidth: 1,
                        borderRadius: 4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Taxa de Conclusão (%)',
                        data: courses.map(c => c.completionRate),
                        backgroundColor: 'rgba(107, 140, 121, 0.8)',
                        borderColor: '#6B8C79',
                        borderWidth: 1,
                        borderRadius: 4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#A020F0',
                        borderWidth: 1,
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6C757D',
                            maxRotation: 45
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#6C757D'
                        },
                        title: {
                            display: true,
                            text: 'Número de Alunos',
                            color: '#6C757D'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            color: '#6C757D',
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Taxa de Conclusão (%)',
                            color: '#6C757D'
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }
    
    createEngagementChart() {
        const ctx = document.getElementById('engagementChart');
        if (!ctx) return;
        
        const hours = Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`);
        
        this.charts.engagement = new Chart(ctx, {
            type: 'line',
            data: {
                labels: hours,
                datasets: [{
                    label: 'Usuários Ativos',
                    data: this.data.engagement.hourlyUsage,
                    borderColor: '#6B8C79',
                    backgroundColor: 'rgba(107, 140, 121, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#6B8C79',
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
                        borderColor: '#6B8C79',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6C757D',
                            maxTicksLimit: 12
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#6C757D'
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }
    
    createCompletionChart() {
        const ctx = document.getElementById('completionChart');
        if (!ctx) return;
        
        const courses = this.data.courses.slice(0, 5);
        
        this.charts.completion = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: courses.map(c => c.name.split(' ').slice(0, 2).join(' ')),
                datasets: [{
                    label: 'Taxa de Conclusão (%)',
                    data: courses.map(c => c.completionRate),
                    borderColor: '#A95028',
                    backgroundColor: 'rgba(169, 80, 40, 0.2)',
                    borderWidth: 2,
                    pointBackgroundColor: '#A95028',
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
                        borderColor: '#A95028',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.r}%`;
                            }
                        }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        pointLabels: {
                            color: '#6C757D',
                            font: {
                                size: 12
                            }
                        },
                        ticks: {
                            color: '#6C757D',
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }
    
    generateDateLabels(days) {
        const labels = [];
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            if (days <= 7) {
                labels.push(date.toLocaleDateString('pt-BR', { weekday: 'short' }));
            } else if (days <= 30) {
                labels.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
            } else {
                labels.push(date.toLocaleDateString('pt-BR', { month: 'short' }));
            }
        }
        
        return labels;
    }
    
    getRevenueData(days) {
        if (days <= 7) {
            return this.data.revenue.daily.slice(-days);
        } else if (days <= 30) {
            return this.data.revenue.daily.slice(-days);
        } else if (days <= 90) {
            return this.data.revenue.weekly.slice(-Math.ceil(days / 7));
        } else {
            return this.data.revenue.monthly.slice(-Math.ceil(days / 30));
        }
    }
    
    switchChart(chartType) {
        const ctx = document.getElementById('revenueChart');
        if (!ctx || !this.charts.revenue) return;
        
        let data, label, color;
        
        switch (chartType) {
            case 'students':
                data = this.data.engagement.dailyAccess.slice(-this.filters.period);
                label = 'Novos Alunos';
                color = '#6B8C79';
                break;
            case 'courses':
                data = Array.from({length: this.filters.period}, () => Math.floor(Math.random() * 5) + 1);
                label = 'Novos Cursos';
                color = '#A95028';
                break;
            default:
                data = this.getRevenueData(this.filters.period);
                label = 'Receita (R$)';
                color = '#A020F0';
        }
        
        this.charts.revenue.data.datasets[0].data = data;
        this.charts.revenue.data.datasets[0].label = label;
        this.charts.revenue.data.datasets[0].borderColor = color;
        this.charts.revenue.data.datasets[0].backgroundColor = color + '20';
        this.charts.revenue.data.datasets[0].pointBackgroundColor = color;
        this.charts.revenue.update();
    }
    
    updateCharts() {
        // Atualizar labels baseado no período
        const labels = this.generateDateLabels(this.filters.period);
        
        if (this.charts.revenue) {
            this.charts.revenue.data.labels = labels;
            this.charts.revenue.data.datasets[0].data = this.getRevenueData(this.filters.period);
            this.charts.revenue.update();
        }
        
        // Filtrar dados por curso/instrutor se necessário
        this.updateTable();
    }
    
    updateTable() {
        const table = document.getElementById('coursesTable');
        if (!table) return;
        
        const tbody = table.querySelector('tbody');
        let filteredCourses = [...this.data.courses];
        
        // Aplicar filtros
        if (this.filters.course !== 'all') {
            filteredCourses = filteredCourses.filter(c => c.id === parseInt(this.filters.course));
        }
        
        if (this.filters.instructor !== 'all') {
            const instructorNames = {
                1: 'Dr. Carlos Mendes',
                2: 'Maria Santos',
                3: 'Prof. Ana Oliveira'
            };
            filteredCourses = filteredCourses.filter(c => c.instructor === instructorNames[this.filters.instructor]);
        }
        
        if (this.filters.search) {
            filteredCourses = filteredCourses.filter(c => 
                c.name.toLowerCase().includes(this.filters.search) ||
                c.instructor.toLowerCase().includes(this.filters.search) ||
                c.category.toLowerCase().includes(this.filters.search)
            );
        }
        
        // Atualizar tabela
        tbody.innerHTML = filteredCourses.map(course => `
            <tr>
                <td>
                    <div class="course-info">
                        <div class="course-name">${course.name}</div>
                        <div class="course-category">${course.category}</div>
                    </div>
                </td>
                <td>${course.instructor}</td>
                <td>${course.students}</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${course.completionRate}%;"></div>
                        <span class="progress-text">${course.completionRate}%</span>
                    </div>
                </td>
                <td>R$ ${course.revenue.toLocaleString('pt-BR')}</td>
                <td>
                    <div class="rating">
                        <span class="stars">${'★'.repeat(Math.floor(course.avgRating))}${'☆'.repeat(5 - Math.floor(course.avgRating))}</span>
                        <span class="rating-value">${course.avgRating}</span>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" title="Ver Detalhes">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                        <button class="btn-icon" title="Editar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    resetFilters() {
        this.filters = {
            period: 30,
            course: 'all',
            instructor: 'all',
            search: ''
        };
        
        // Reset form elements
        const periodFilter = document.getElementById('periodFilter');
        const courseFilter = document.getElementById('courseFilter');
        const instructorFilter = document.getElementById('instructorFilter');
        const searchFilter = document.getElementById('searchFilter');
        
        if (periodFilter) periodFilter.value = '30';
        if (courseFilter) courseFilter.value = 'all';
        if (instructorFilter) instructorFilter.value = 'all';
        if (searchFilter) searchFilter.value = '';
        
        this.updateCharts();
    }
    
    generateReport() {
        this.showNotification('Gerando relatório...', 'info');
        
        setTimeout(() => {
            const reportData = {
                period: `Últimos ${this.filters.period} dias`,
                generated: new Date().toLocaleString('pt-BR'),
                overview: this.data.overview,
                courses: this.data.courses,
                revenue: this.data.revenue
            };
            
            const reportText = this.formatReport(reportData);
            this.downloadFile('relatorio-analytics.txt', reportText);
            this.showNotification('Relatório gerado com sucesso!', 'success');
        }, 1500);
    }
    
    exportData() {
        this.showNotification('Exportando dados...', 'info');
        
        setTimeout(() => {
            const csvData = this.formatCSV(this.data.courses);
            this.downloadFile('dados-cursos.csv', csvData);
            this.showNotification('Dados exportados com sucesso!', 'success');
        }, 1000);
    }
    
    refreshData() {
        this.showNotification('Atualizando dados...', 'info');
        
        // Simular atualização de dados
        setTimeout(() => {
            // Pequenas variações nos dados
            this.data.overview.activeStudents += Math.floor(Math.random() * 10) - 5;
            this.data.overview.monthlyRevenue += Math.floor(Math.random() * 1000) - 500;
            
            this.updateCharts();
            this.showNotification('Dados atualizados!', 'success');
        }, 1000);
    }
    
    formatReport(data) {
        return `
RELATÓRIO DE ANALYTICS - INSTITUTO BURITI
=========================================

Período: ${data.period}
Gerado em: ${data.generated}

VISÃO GERAL
-----------
Alunos Ativos: ${data.overview.activeStudents}
Instrutores: ${data.overview.instructors}
Cursos Ativos: ${data.overview.activeCourses}
Receita Mensal: R$ ${data.overview.monthlyRevenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
Taxa de Conversão: ${data.overview.conversionRate}%
Tempo Médio: ${data.overview.averageTime}

CURSOS MAIS POPULARES
--------------------
${data.courses.map((course, index) => `
${index + 1}. ${course.name}
   Instrutor: ${course.instructor}
   Alunos: ${course.students}
   Taxa de Conclusão: ${course.completionRate}%
   Receita: R$ ${course.revenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
   Avaliação: ${course.avgRating}/5.0
`).join('')}

RECEITA POR FONTE
----------------
Assinaturas: R$ ${data.revenue.sources.subscriptions.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
Cursos Individuais: R$ ${data.revenue.sources.individual_courses.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
Certificados: R$ ${data.revenue.sources.certificates.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
Eventos: R$ ${data.revenue.sources.events.toLocaleString('pt-BR', {minimumFractionDigits: 2})}

---
Instituto Buriti - Educação que transforma
        `;
    }
    
    formatCSV(courses) {
        const headers = ['Nome do Curso', 'Instrutor', 'Categoria', 'Alunos', 'Taxa de Conclusão (%)', 'Receita (R$)', 'Avaliação'];
        const rows = courses.map(course => [
            course.name,
            course.instructor,
            course.category,
            course.students,
            course.completionRate,
            course.revenue.toFixed(2),
            course.avgRating
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    downloadFile(filename, content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
    
    showNotification(message, type = 'info') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Adicionar estilos se não existirem
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    padding: 16px;
                    min-width: 300px;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                }
                .notification.show {
                    transform: translateX(0);
                }
                .notification-info {
                    border-left: 4px solid #17A2B8;
                }
                .notification-success {
                    border-left: 4px solid #28A745;
                }
                .notification-warning {
                    border-left: 4px solid #FFC107;
                }
                .notification-error {
                    border-left: 4px solid #DC3545;
                }
                .notification-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .notification-message {
                    color: #333;
                    font-weight: 500;
                }
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    color: #999;
                    margin-left: 16px;
                }
                .notification-close:hover {
                    color: #333;
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Adicionar ao DOM
        document.body.appendChild(notification);
        
        // Mostrar notificação
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remover automaticamente
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
        
        // Botão de fechar
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        });
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.analytics = new AnalyticsCore();
});

