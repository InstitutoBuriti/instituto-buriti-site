// FASE 1 SEÇÃO 4 QWEN: Sistema de Perfil do Aluno
// Integração com auth.js e funcionalidades de edição de perfil

console.log('🚀 FASE 1 SEÇÃO 4 QWEN: Carregando perfil.js...');

// Gerenciador de Perfil
const profileManager = {
    // Dados do usuário
    userData: null,
    isEditMode: false,
    
    // Inicializar sistema de perfil
    init() {
        console.log('🔧 FASE 1 SEÇÃO 4 QWEN: Inicializando profileManager...');
        
        // Carregar dados do usuário
        this.loadUserData();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Atualizar interface
        this.updateInterface();
        
        console.log('✅ FASE 1 SEÇÃO 4 QWEN: ProfileManager inicializado com sucesso');
    },
    
    // Carregar dados do usuário do localStorage
    loadUserData() {
        console.log('📥 FASE 1 SEÇÃO 4 QWEN: Carregando dados do usuário...');
        
        try {
            // Buscar dados do auth.js
            const userDataStr = localStorage.getItem('user_data');
            const authToken = localStorage.getItem('auth_token');
            
            if (userDataStr) {
                this.userData = JSON.parse(userDataStr);
                console.log('✅ FASE 1 SEÇÃO 4 QWEN: Dados do usuário carregados:', this.userData);
            } else {
                // Dados padrão se não encontrar no localStorage
                this.userData = {
                    id: 1,
                    name: 'Ana Silva',
                    email: 'ana.silva@email.com',
                    phone: '(11) 99999-9999',
                    birthdate: '1995-03-15',
                    city: 'São Paulo, SP',
                    profession: 'Desenvolvedora Web',
                    memberSince: 'Março 2024',
                    totalCourses: 2,
                    completedCourses: 0,
                    totalAchievements: 3,
                    lastLogin: 'Hoje às 14:30 - São Paulo, SP'
                };
                console.log('⚠️ FASE 1 SEÇÃO 4 QWEN: Usando dados padrão do usuário');
            }
        } catch (error) {
            console.error('❌ FASE 1 SEÇÃO 4 QWEN: Erro ao carregar dados do usuário:', error);
            this.showMessage('Erro ao carregar dados do perfil', 'error');
        }
    },
    
    // Configurar event listeners
    setupEventListeners() {
        console.log('🔗 FASE 1 SEÇÃO 4 QWEN: Configurando event listeners...');
        
        // Botão de editar perfil
        const editBtn = document.getElementById('edit-profile-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.toggleEditMode());
        }
        
        // Botão de salvar
        const saveBtn = document.getElementById('save-profile-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveProfile());
        }
        
        // Botão de cancelar
        const cancelBtn = document.getElementById('cancel-edit-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelEdit());
        }
        
        // Botão de alterar foto
        const changeAvatarBtn = document.getElementById('change-avatar-btn');
        if (changeAvatarBtn) {
            changeAvatarBtn.addEventListener('click', () => this.changeAvatar());
        }
        
        // Botão de alterar senha
        const changePasswordBtn = document.getElementById('change-password-btn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => this.changePassword());
        }
        
        // Toggle switches de preferências
        this.setupPreferenceToggles();
        
        console.log('✅ FASE 1 SEÇÃO 4 QWEN: Event listeners configurados');
    },
    
    // Configurar toggles de preferências
    setupPreferenceToggles() {
        const emailNotifications = document.getElementById('email-notifications');
        const pushNotifications = document.getElementById('push-notifications');
        const darkMode = document.getElementById('dark-mode');
        
        if (emailNotifications) {
            emailNotifications.addEventListener('change', (e) => {
                this.updatePreference('emailNotifications', e.target.checked);
            });
        }
        
        if (pushNotifications) {
            pushNotifications.addEventListener('change', (e) => {
                this.updatePreference('pushNotifications', e.target.checked);
            });
        }
        
        if (darkMode) {
            darkMode.addEventListener('change', (e) => {
                this.updatePreference('darkMode', e.target.checked);
            });
        }
    },
    
    // Atualizar interface com dados do usuário
    updateInterface() {
        console.log('🎨 FASE 1 SEÇÃO 4 QWEN: Atualizando interface do perfil...');
        
        if (!this.userData) {
            console.error('❌ FASE 1 SEÇÃO 4 QWEN: Dados do usuário não disponíveis');
            return;
        }
        
        // Atualizar campos de exibição
        this.updateField('display-name', this.userData.name);
        this.updateField('display-email', this.userData.email);
        this.updateField('display-phone', this.userData.phone);
        this.updateField('display-birthdate', this.formatDate(this.userData.birthdate));
        this.updateField('display-city', this.userData.city);
        this.updateField('display-profession', this.userData.profession);
        
        // Atualizar campos de input
        this.updateField('input-name', this.userData.name, 'value');
        this.updateField('input-email', this.userData.email, 'value');
        this.updateField('input-phone', this.userData.phone, 'value');
        this.updateField('input-birthdate', this.userData.birthdate, 'value');
        this.updateField('input-city', this.userData.city, 'value');
        this.updateField('input-profession', this.userData.profession, 'value');
        
        // Atualizar sidebar
        this.updateField('sidebar-user-name', this.userData.name);
        
        // Atualizar estatísticas
        this.updateField('member-since', this.userData.memberSince);
        this.updateField('total-courses', this.userData.totalCourses);
        this.updateField('completed-courses', this.userData.completedCourses);
        this.updateField('total-achievements', this.userData.totalAchievements);
        this.updateField('last-login', this.userData.lastLogin);
        
        console.log('✅ FASE 1 SEÇÃO 4 QWEN: Interface atualizada com sucesso');
    },
    
    // Atualizar campo específico
    updateField(elementId, value, property = 'textContent') {
        const element = document.getElementById(elementId);
        if (element && value !== undefined) {
            element[property] = value;
        }
    },
    
    // Formatar data para exibição
    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    },
    
    // Alternar modo de edição
    toggleEditMode() {
        console.log('✏️ FASE 1 SEÇÃO 4 QWEN: Alternando modo de edição...');
        
        this.isEditMode = !this.isEditMode;
        
        // Mostrar/ocultar campos de input
        const displayFields = document.querySelectorAll('.field-value');
        const inputFields = document.querySelectorAll('.field-input');
        const profileActions = document.getElementById('profile-actions');
        const editBtn = document.getElementById('edit-profile-btn');
        
        displayFields.forEach(field => {
            field.style.display = this.isEditMode ? 'none' : 'block';
        });
        
        inputFields.forEach(field => {
            field.style.display = this.isEditMode ? 'block' : 'none';
        });
        
        if (profileActions) {
            profileActions.style.display = this.isEditMode ? 'flex' : 'none';
        }
        
        if (editBtn) {
            editBtn.style.display = this.isEditMode ? 'none' : 'inline-flex';
        }
        
        console.log(`✅ FASE 1 SEÇÃO 4 QWEN: Modo de edição ${this.isEditMode ? 'ativado' : 'desativado'}`);
    },
    
    // Salvar perfil
    saveProfile() {
        console.log('💾 FASE 1 SEÇÃO 4 QWEN: Salvando perfil...');
        
        try {
            // Coletar dados dos campos de input
            const updatedData = {
                ...this.userData,
                name: document.getElementById('input-name').value,
                email: document.getElementById('input-email').value,
                phone: document.getElementById('input-phone').value,
                birthdate: document.getElementById('input-birthdate').value,
                city: document.getElementById('input-city').value,
                profession: document.getElementById('input-profession').value
            };
            
            // Validar dados
            if (!this.validateProfileData(updatedData)) {
                return;
            }
            
            // Salvar no localStorage
            this.userData = updatedData;
            localStorage.setItem('user_data', JSON.stringify(this.userData));
            
            // Atualizar interface
            this.updateInterface();
            
            // Sair do modo de edição
            this.toggleEditMode();
            
            // Mostrar mensagem de sucesso
            this.showMessage('Perfil atualizado com sucesso!', 'success');
            
            console.log('✅ FASE 1 SEÇÃO 4 QWEN: Perfil salvo com sucesso:', this.userData);
            
        } catch (error) {
            console.error('❌ FASE 1 SEÇÃO 4 QWEN: Erro ao salvar perfil:', error);
            this.showMessage('Erro ao salvar perfil. Tente novamente.', 'error');
        }
    },
    
    // Validar dados do perfil
    validateProfileData(data) {
        console.log('🔍 FASE 1 SEÇÃO 4 QWEN: Validando dados do perfil...');
        
        // Validar nome
        if (!data.name || data.name.trim().length < 2) {
            this.showMessage('Nome deve ter pelo menos 2 caracteres', 'error');
            return false;
        }
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            this.showMessage('E-mail inválido', 'error');
            return false;
        }
        
        // Validar telefone (formato brasileiro básico)
        const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        if (data.phone && !phoneRegex.test(data.phone)) {
            this.showMessage('Telefone deve estar no formato (11) 99999-9999', 'error');
            return false;
        }
        
        console.log('✅ FASE 1 SEÇÃO 4 QWEN: Dados validados com sucesso');
        return true;
    },
    
    // Cancelar edição
    cancelEdit() {
        console.log('❌ FASE 1 SEÇÃO 4 QWEN: Cancelando edição...');
        
        // Restaurar valores originais
        this.updateInterface();
        
        // Sair do modo de edição
        this.toggleEditMode();
        
        this.showMessage('Edição cancelada', 'info');
    },
    
    // Alterar avatar (simulação)
    changeAvatar() {
        console.log('📷 FASE 1 SEÇÃO 4 QWEN: Alterando avatar...');
        
        // Simulação de alteração de avatar
        this.showMessage('Funcionalidade de alterar foto será implementada em breve', 'info');
    },
    
    // Alterar senha (simulação)
    changePassword() {
        console.log('🔑 FASE 1 SEÇÃO 4 QWEN: Alterando senha...');
        
        // Simulação de alteração de senha
        const newPassword = prompt('Digite a nova senha:');
        if (newPassword && newPassword.length >= 6) {
            this.showMessage('Senha alterada com sucesso!', 'success');
            console.log('✅ FASE 1 SEÇÃO 4 QWEN: Senha alterada');
        } else if (newPassword) {
            this.showMessage('Senha deve ter pelo menos 6 caracteres', 'error');
        }
    },
    
    // Atualizar preferência
    updatePreference(preference, value) {
        console.log(`⚙️ FASE 1 SEÇÃO 4 QWEN: Atualizando preferência ${preference}: ${value}`);
        
        // Salvar preferência no localStorage
        const preferences = JSON.parse(localStorage.getItem('user_preferences') || '{}');
        preferences[preference] = value;
        localStorage.setItem('user_preferences', JSON.stringify(preferences));
        
        // Aplicar preferência se necessário
        if (preference === 'darkMode') {
            document.body.classList.toggle('dark-mode', value);
        }
        
        this.showMessage(`Preferência ${preference} atualizada`, 'success');
    },
    
    // Mostrar mensagem
    showMessage(message, type = 'info') {
        console.log(`📢 FASE 1 SEÇÃO 4 QWEN: Mensagem (${type}): ${message}`);
        
        const container = document.getElementById('message-container');
        if (!container) return;
        
        // Criar elemento de mensagem
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.innerHTML = `
            <i class="fas fa-${this.getMessageIcon(type)}"></i>
            <span>${message}</span>
            <button class="message-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Adicionar ao container
        container.appendChild(messageEl);
        
        // Remover automaticamente após 5 segundos
        setTimeout(() => {
            if (messageEl.parentElement) {
                messageEl.remove();
            }
        }, 5000);
    },
    
    // Obter ícone da mensagem
    getMessageIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
};

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 FASE 1 SEÇÃO 4 QWEN: DOM carregado, inicializando perfil...');
    profileManager.init();
});

// Exportar para uso global
window.profileManager = profileManager;

console.log('✅ FASE 1 SEÇÃO 4 QWEN: perfil.js carregado com sucesso');

