// Dashboard Admin - Instituto Buriti
// Funcionalidades específicas do dashboard administrativo

class AdminDashboard {
    constructor() {
        this.currentUser = {
            name: 'Admin Geral',
            role: 'administrator',
            permissions: ['view_all', 'edit_all', 'delete_all', 'export_data']
        };
        
        this.init();
    }
    
    init() {
        this.setupAdminFeatures();
        this.loadAdminData();
        this.setupRealTimeUpdates();
    }
    
    setupAdminFeatures() {
        // Configurar funcionalidades específicas do admin
        this.setupBulkActions();
        this.setupAdvancedFilters();
        this.setupUserManagement();
        this.setupSystemMonitoring();
    }
    
    setupBulkActions() {
        // Ações em lote para cursos
        const bulkActions = document.createElement('div');
        bulkActions.className = 'bulk-actions';
        bulkActions.innerHTML = `
            <div class="bulk-controls">
                <input type="checkbox" id="selectAll" class="bulk-checkbox">
                <label for="selectAll">Selecionar Todos</label>
                <select id="bulkAction" class="bulk-select">
                    <option value="">Ações em Lote</option>
                    <option value="activate">Ativar Cursos</option>
                    <option value="deactivate">Desativar Cursos</option>
                    <option value="archive">Arquivar Cursos</option>
                    <option value="delete">Excluir Cursos</option>
                </select>
                <button id="applyBulkAction" class="btn btn-outline btn-sm">Aplicar</button>
            </div>
        `;
        
        const tableHeader = document.querySelector('.table-header');
        if (tableHeader) {
            tableHeader.appendChild(bulkActions);
        }
        
        // Event listeners para ações em lote
        const selectAll = document.getElementById('selectAll');
        const applyBulkAction = document.getElementById('applyBulkAction');
        
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.row-checkbox');
                checkboxes.forEach(cb => cb.checked = e.target.checked);
                this.updateBulkActionState();
            });
        }
        
        if (applyBulkAction) {
            applyBulkAction.addEventListener('click', () => {
                this.executeBulkAction();
            });
        }
    }
    
    setupAdvancedFilters() {
        // Filtros avançados específicos do admin
        const advancedFilters = document.createElement('div');
        advancedFilters.className = 'advanced-filters';
        advancedFilters.innerHTML = `
            <div class="filter-row">
                <div class="filter-group">
                    <label for="statusFilter">Status</label>
                    <select id="statusFilter" class="filter-select">
                        <option value="all">Todos os Status</option>
                        <option value="active">Ativo</option>
                        <option value="pending">Pendente</option>
                        <option value="archived">Arquivado</option>
                        <option value="draft">Rascunho</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="categoryFilter">Categoria</label>
                    <select id="categoryFilter" class="filter-select">
                        <option value="all">Todas as Categorias</option>
                        <option value="tecnologia">Tecnologia</option>
                        <option value="gestao">Gestão</option>
                        <option value="educacao">Educação</option>
                        <option value="marketing">Marketing</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="revenueFilter">Receita</label>
                    <select id="revenueFilter" class="filter-select">
                        <option value="all">Todas as Faixas</option>
                        <option value="high">Alta (>R$ 20.000)</option>
                        <option value="medium">Média (R$ 5.000 - R$ 20.000)</option>
                        <option value="low">Baixa (<R$ 5.000)</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="dateRange">Período de Criação</label>
                    <input type="date" id="dateFrom" class="filter-input">
                    <input type="date" id="dateTo" class="filter-input">
                </div>
            </div>
        `;
        
        const filtersSection = document.querySelector('.filters-panel');
        if (filtersSection) {
            filtersSection.appendChild(advancedFilters);
        }
    }
    
    setupUserManagement() {
        // Adicionar seção de gerenciamento de usuários
        const userManagement = document.createElement('section');
        userManagement.className = 'user-management-section';
        userManagement.innerHTML = `
            <div class="container">
                <div class="section-header">
                    <h2>Gerenciamento de Usuários</h2>
                    <div class="section-actions">
                        <button class="btn btn-primary" id="addUser">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <line x1="19" y1="8" x2="19" y2="14"/>
                                <line x1="22" y1="11" x2="16" y2="11"/>
                            </svg>
                            Adicionar Usuário
                        </button>
                        <button class="btn btn-outline" id="exportUsers">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7,10 12,15 17,10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Exportar Lista
                        </button>
                    </div>
                </div>
                <div class="user-stats">
                    <div class="stat-card">
                        <div class="stat-value">318</div>
                        <div class="stat-label">Alunos</div>
                        <div class="stat-change positive">+12 hoje</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">12</div>
                        <div class="stat-label">Instrutores</div>
                        <div class="stat-change positive">+1 esta semana</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">5</div>
                        <div class="stat-label">Administradores</div>
                        <div class="stat-change neutral">Sem alterações</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">23</div>
                        <div class="stat-label">Usuários Online</div>
                        <div class="stat-change positive">Agora</div>
                    </div>
                </div>
            </div>
        `;
        
        const tablesSection = document.querySelector('.tables-section');
        if (tablesSection) {
            tablesSection.parentNode.insertBefore(userManagement, tablesSection);
        }
    }
    
    setupSystemMonitoring() {
        // Adicionar monitoramento do sistema
        const systemMonitoring = document.createElement('section');
        systemMonitoring.className = 'system-monitoring-section';
        systemMonitoring.innerHTML = `
            <div class="container">
                <div class="section-header">
                    <h2>Monitoramento do Sistema</h2>
                    <div class="system-status">
                        <span class="status-indicator status-online"></span>
                        <span class="status-text">Sistema Online</span>
                    </div>
                </div>
                <div class="monitoring-grid">
                    <div class="monitor-card">
                        <div class="monitor-header">
                            <h4>Performance do Servidor</h4>
                            <div class="monitor-value">98.5%</div>
                        </div>
                        <div class="monitor-chart">
                            <canvas id="serverChart" width="200" height="100"></canvas>
                        </div>
                    </div>
                    <div class="monitor-card">
                        <div class="monitor-header">
                            <h4>Uso de Banda</h4>
                            <div class="monitor-value">2.3 GB/h</div>
                        </div>
                        <div class="monitor-chart">
                            <canvas id="bandwidthChart" width="200" height="100"></canvas>
                        </div>
                    </div>
                    <div class="monitor-card">
                        <div class="monitor-header">
                            <h4>Erros do Sistema</h4>
                            <div class="monitor-value">0.02%</div>
                        </div>
                        <div class="error-log">
                            <div class="log-entry">
                                <span class="log-time">14:32</span>
                                <span class="log-message">Cache limpo automaticamente</span>
                            </div>
                            <div class="log-entry">
                                <span class="log-time">13:45</span>
                                <span class="log-message">Backup realizado com sucesso</span>
                            </div>
                        </div>
                    </div>
                    <div class="monitor-card">
                        <div class="monitor-header">
                            <h4>Segurança</h4>
                            <div class="monitor-value">Seguro</div>
                        </div>
                        <div class="security-status">
                            <div class="security-item">
                                <span class="security-check">✓</span>
                                <span>SSL Ativo</span>
                            </div>
                            <div class="security-item">
                                <span class="security-check">✓</span>
                                <span>Firewall Ativo</span>
                            </div>
                            <div class="security-item">
                                <span class="security-check">✓</span>
                                <span>Backup Atualizado</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const chartsSection = document.querySelector('.charts-section');
        if (chartsSection) {
            chartsSection.parentNode.insertBefore(systemMonitoring, chartsSection.nextSibling);
        }
        
        // Inicializar gráficos de monitoramento
        this.initMonitoringCharts();
    }
    
    initMonitoringCharts() {
        // Gráfico de performance do servidor
        const serverCtx = document.getElementById('serverChart');
        if (serverCtx) {
            new Chart(serverCtx, {
                type: 'line',
                data: {
                    labels: ['', '', '', '', '', '', ''],
                    datasets: [{
                        data: [95, 97, 98, 96, 99, 98, 98.5],
                        borderColor: '#28A745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: { display: false },
                        y: { 
                            display: false,
                            min: 90,
                            max: 100
                        }
                    },
                    elements: {
                        point: { radius: 0 }
                    }
                }
            });
        }
        
        // Gráfico de uso de banda
        const bandwidthCtx = document.getElementById('bandwidthChart');
        if (bandwidthCtx) {
            new Chart(bandwidthCtx, {
                type: 'bar',
                data: {
                    labels: ['', '', '', '', '', '', ''],
                    datasets: [{
                        data: [1.8, 2.1, 2.5, 2.2, 2.8, 2.4, 2.3],
                        backgroundColor: '#17A2B8',
                        borderRadius: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: { display: false },
                        y: { 
                            display: false,
                            min: 0,
                            max: 3
                        }
                    }
                }
            });
        }
    }
    
    loadAdminData() {
        // Carregar dados específicos do admin
        this.loadUserActivity();
        this.loadSystemAlerts();
        this.loadRecentActions();
    }
    
    loadUserActivity() {
        // Simular carregamento de atividade dos usuários
        const userActivity = {
            online: 23,
            todayLogins: 156,
            newRegistrations: 12,
            activeInstructors: 8
        };
        
        // Atualizar interface com dados de atividade
        this.updateUserActivityDisplay(userActivity);
    }
    
    loadSystemAlerts() {
        // Carregar alertas do sistema
        const alerts = [
            {
                type: 'info',
                message: 'Backup automático realizado com sucesso',
                time: '2 horas atrás'
            },
            {
                type: 'warning',
                message: 'Uso de armazenamento em 85%',
                time: '4 horas atrás'
            },
            {
                type: 'success',
                message: 'Atualização de segurança aplicada',
                time: '1 dia atrás'
            }
        ];
        
        this.displaySystemAlerts(alerts);
    }
    
    loadRecentActions() {
        // Carregar ações recentes dos administradores
        const recentActions = [
            {
                user: 'Admin Geral',
                action: 'Aprovou curso "Metodologias Ativas"',
                time: '15 min atrás'
            },
            {
                user: 'Admin Financeiro',
                action: 'Gerou relatório mensal',
                time: '1 hora atrás'
            },
            {
                user: 'Admin Conteúdo',
                action: 'Publicou novo artigo',
                time: '2 horas atrás'
            }
        ];
        
        this.displayRecentActions(recentActions);
    }
    
    updateUserActivityDisplay(activity) {
        // Atualizar display de atividade dos usuários
        const onlineCount = document.querySelector('.stat-card:last-child .stat-value');
        if (onlineCount) {
            onlineCount.textContent = activity.online;
        }
    }
    
    displaySystemAlerts(alerts) {
        // Criar seção de alertas se não existir
        let alertsContainer = document.querySelector('.system-alerts');
        if (!alertsContainer) {
            alertsContainer = document.createElement('div');
            alertsContainer.className = 'system-alerts';
            alertsContainer.innerHTML = `
                <h4>Alertas do Sistema</h4>
                <div class="alerts-list"></div>
            `;
            
            const sidebar = document.querySelector('.monitoring-grid');
            if (sidebar) {
                sidebar.appendChild(alertsContainer);
            }
        }
        
        const alertsList = alertsContainer.querySelector('.alerts-list');
        if (alertsList) {
            alertsList.innerHTML = alerts.map(alert => `
                <div class="alert-item alert-${alert.type}">
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-time">${alert.time}</div>
                </div>
            `).join('');
        }
    }
    
    displayRecentActions(actions) {
        // Exibir ações recentes
        console.log('Ações recentes:', actions);
    }
    
    setupRealTimeUpdates() {
        // Configurar atualizações em tempo real
        setInterval(() => {
            this.updateRealTimeData();
        }, 30000); // Atualizar a cada 30 segundos
    }
    
    updateRealTimeData() {
        // Simular atualizações em tempo real
        const onlineUsers = Math.floor(Math.random() * 10) + 20;
        const onlineDisplay = document.querySelector('.stat-card:last-child .stat-value');
        if (onlineDisplay) {
            onlineDisplay.textContent = onlineUsers;
        }
        
        // Atualizar timestamp da última atualização
        const timestamp = new Date().toLocaleTimeString('pt-BR');
        console.log(`Dados atualizados em: ${timestamp}`);
    }
    
    executeBulkAction() {
        const action = document.getElementById('bulkAction')?.value;
        const selectedRows = document.querySelectorAll('.row-checkbox:checked');
        
        if (!action || selectedRows.length === 0) {
            this.showAlert('Selecione uma ação e pelo menos um item.', 'warning');
            return;
        }
        
        const actionNames = {
            'activate': 'ativar',
            'deactivate': 'desativar',
            'archive': 'arquivar',
            'delete': 'excluir'
        };
        
        const confirmMessage = `Tem certeza que deseja ${actionNames[action]} ${selectedRows.length} item(s)?`;
        
        if (confirm(confirmMessage)) {
            // Simular execução da ação
            this.showAlert(`${selectedRows.length} item(s) ${actionNames[action]}(s) com sucesso!`, 'success');
            
            // Limpar seleções
            selectedRows.forEach(cb => cb.checked = false);
            document.getElementById('selectAll').checked = false;
            this.updateBulkActionState();
        }
    }
    
    updateBulkActionState() {
        const selectedRows = document.querySelectorAll('.row-checkbox:checked');
        const bulkAction = document.getElementById('bulkAction');
        const applyButton = document.getElementById('applyBulkAction');
        
        if (bulkAction && applyButton) {
            const hasSelection = selectedRows.length > 0;
            bulkAction.disabled = !hasSelection;
            applyButton.disabled = !hasSelection;
        }
    }
    
    showAlert(message, type = 'info') {
        // Usar o sistema de notificações do analytics-core
        if (window.analytics) {
            window.analytics.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Inicializar dashboard admin quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se estamos na página do dashboard admin
    if (document.querySelector('.metrics-overview')) {
        window.adminDashboard = new AdminDashboard();
    }
});

// Adicionar estilos específicos do admin
const adminStyles = document.createElement('style');
adminStyles.textContent = `
    .bulk-actions {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--gray-200);
    }
    
    .bulk-controls {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
    }
    
    .bulk-checkbox {
        margin-right: 0.5rem;
    }
    
    .bulk-select {
        padding: 0.5rem;
        border: 1px solid var(--gray-300);
        border-radius: 0.375rem;
        min-width: 150px;
    }
    
    .advanced-filters {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--gray-200);
    }
    
    .filter-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        align-items: end;
    }
    
    .user-management-section,
    .system-monitoring-section {
        padding: 2rem 0;
        background: var(--gray-50);
        margin: 2rem 0;
    }
    
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }
    
    .section-header h2 {
        font-family: var(--font-primary);
        font-size: 2rem;
        color: var(--gray-800);
        margin: 0;
    }
    
    .section-actions {
        display: flex;
        gap: 1rem;
    }
    
    .user-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }
    
    .stat-card {
        background: var(--white);
        padding: 1.5rem;
        border-radius: 0.75rem;
        box-shadow: var(--shadow-md);
        text-align: center;
    }
    
    .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: var(--primary-color);
        margin-bottom: 0.5rem;
    }
    
    .stat-label {
        font-size: 0.875rem;
        color: var(--gray-600);
        margin-bottom: 0.25rem;
    }
    
    .stat-change {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
    }
    
    .stat-change.positive {
        background: rgba(40, 167, 69, 0.1);
        color: var(--success-color);
    }
    
    .stat-change.neutral {
        background: rgba(108, 117, 125, 0.1);
        color: var(--gray-500);
    }
    
    .system-status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .status-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--success-color);
        animation: pulse 2s infinite;
    }
    
    .status-indicator.status-online {
        background: var(--success-color);
    }
    
    .status-indicator.status-warning {
        background: var(--warning-color);
    }
    
    .status-indicator.status-error {
        background: var(--danger-color);
    }
    
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
    
    .status-text {
        font-weight: 600;
        color: var(--success-color);
    }
    
    .monitoring-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
    }
    
    .monitor-card {
        background: var(--white);
        border-radius: 0.75rem;
        padding: 1.5rem;
        box-shadow: var(--shadow-md);
    }
    
    .monitor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .monitor-header h4 {
        font-size: 1rem;
        color: var(--gray-700);
        margin: 0;
    }
    
    .monitor-value {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--primary-color);
    }
    
    .monitor-chart {
        height: 100px;
        position: relative;
    }
    
    .error-log {
        max-height: 100px;
        overflow-y: auto;
    }
    
    .log-entry {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--gray-200);
        font-size: 0.875rem;
    }
    
    .log-time {
        color: var(--gray-500);
        font-weight: 600;
    }
    
    .log-message {
        color: var(--gray-700);
    }
    
    .security-status {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .security-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
    }
    
    .security-check {
        color: var(--success-color);
        font-weight: 700;
    }
    
    @media (max-width: 768px) {
        .bulk-controls {
            flex-direction: column;
            align-items: stretch;
        }
        
        .section-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
        }
        
        .section-actions {
            justify-content: center;
        }
        
        .user-stats {
            grid-template-columns: 1fr;
        }
        
        .monitoring-grid {
            grid-template-columns: 1fr;
        }
    }
`;

document.head.appendChild(adminStyles);

