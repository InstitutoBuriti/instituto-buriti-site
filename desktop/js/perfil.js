// /js/perfil.js
// Sistema de Perfil do Aluno — integrado ao auth.js / dashboard-auth.js
// ✅ Robusto para DOM parcial, preferências persistidas e acessibilidade nos erros.

console.log('🚀 perfil.js: carregando...');

const profileManager = {
  // Estado
  userData: null,
  isEditMode: false,

  // ---------- Ciclo de vida ----------
  init() {
    console.log('🔧 perfil.js: inicializando...');
    this.loadUserData();
    this.applySavedPreferences();     // aplica preferências salvas (dark mode, notificações, etc.)
    this.setupEventListeners();
    this.updateInterface();
    console.log('✅ perfil.js: pronto');
  },

  // ---------- Dados ----------
  loadUserData() {
    console.log('📥 perfil.js: carregando dados do usuário...');
    try {
      const userDataStr = localStorage.getItem('user_data');

      if (userDataStr) {
        this.userData = JSON.parse(userDataStr);
        console.log('✅ perfil.js: user_data do localStorage', this.userData);
      } else {
        // Fallback seguro (exibe algo se ainda não houver auth real)
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
        console.warn('⚠️ perfil.js: usando dados padrão (sem user_data no localStorage)');
      }
    } catch (err) {
      console.error('❌ perfil.js: erro ao parsear user_data:', err);
      this.showMessage('Erro ao carregar dados do perfil', 'error');
      // fallback mínimo
      this.userData = this.userData || { name: 'Aluno(a)' };
    }
  },

  // ---------- Preferências ----------
  applySavedPreferences() {
    const prefs = JSON.parse(localStorage.getItem('user_preferences') || '{}');

    // Dark mode
    const dark = !!prefs.darkMode;
    document.body.classList.toggle('dark-mode', dark);
    const darkInput = document.getElementById('dark-mode');
    if (darkInput) darkInput.checked = dark;

    // Email notifications (padrão true se não definido)
    const email = prefs.emailNotifications !== undefined ? !!prefs.emailNotifications : true;
    const emailInput = document.getElementById('email-notifications');
    if (emailInput) emailInput.checked = email;

    // Push notifications
    const push = !!prefs.pushNotifications;
    const pushInput = document.getElementById('push-notifications');
    if (pushInput) pushInput.checked = push;
  },

  updatePreference(preference, value) {
    console.log(`⚙️ perfil.js: preferência ${preference} = ${value}`);
    const prefs = JSON.parse(localStorage.getItem('user_preferences') || '{}');
    prefs[preference] = value;
    localStorage.setItem('user_preferences', JSON.stringify(prefs));

    if (preference === 'darkMode') {
      document.body.classList.toggle('dark-mode', !!value);
    }
    this.showMessage(`Preferência ${preference} atualizada`, 'success');
  },

  // ---------- UI ----------
  setupEventListeners() {
    console.log('🔗 perfil.js: configurando eventos...');
    // Editar
    const editBtn = document.getElementById('edit-profile-btn');
    if (editBtn) editBtn.addEventListener('click', () => this.toggleEditMode());

    // Salvar
    const saveBtn = document.getElementById('save-profile-btn');
    if (saveBtn) saveBtn.addEventListener('click', () => this.saveProfile());

    // Cancelar
    const cancelBtn = document.getElementById('cancel-edit-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.cancelEdit());

    // Avatar
    const changeAvatarBtn = document.getElementById('change-avatar-btn');
    if (changeAvatarBtn) changeAvatarBtn.addEventListener('click', () => this.changeAvatar());

    // Senha
    const changePasswordBtn = document.getElementById('change-password-btn');
    if (changePasswordBtn) changePasswordBtn.addEventListener('click', () => this.changePassword());

    // Toggles de preferências
    this.setupPreferenceToggles();

    console.log('✅ perfil.js: eventos prontos');
  },

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

  updateInterface() {
    console.log('🎨 perfil.js: atualizando UI...');
    if (!this.userData) return;

    // Exibição
    this.updateField('display-name', this.userData.name);
    this.updateField('display-email', this.userData.email);
    this.updateField('display-phone', this.userData.phone);
    this.updateField('display-birthdate', this.formatDate(this.userData.birthdate));
    this.updateField('display-city', this.userData.city);
    this.updateField('display-profession', this.userData.profession);

    // Inputs
    this.updateField('input-name', this.userData.name, 'value');
    this.updateField('input-email', this.userData.email, 'value');
    this.updateField('input-phone', this.userData.phone, 'value');
    this.updateField('input-birthdate', this.userData.birthdate, 'value');
    this.updateField('input-city', this.userData.city, 'value');
    this.updateField('input-profession', this.userData.profession, 'value');

    // Sidebar/Stats
    this.updateField('sidebar-user-name', this.userData.name);
    this.updateField('member-since', this.userData.memberSince);
    this.updateField('total-courses', this.userData.totalCourses);
    this.updateField('completed-courses', this.userData.completedCourses);
    this.updateField('total-achievements', this.userData.totalAchievements);
    this.updateField('last-login', this.userData.lastLogin);

    console.log('✅ perfil.js: UI atualizada');
  },

  updateField(elementId, value, property = 'textContent') {
    const el = document.getElementById(elementId);
    if (!el || value === undefined) return;
    el[property] = value;
  },

  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('pt-BR');
  },

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;

    const displayFields = document.querySelectorAll('.field-value');
    const inputFields = document.querySelectorAll('.field-input');
    const profileActions = document.getElementById('profile-actions');
    const editBtn = document.getElementById('edit-profile-btn');

    displayFields.forEach(f => { if (f) f.style.display = this.isEditMode ? 'none' : 'block'; });
    inputFields.forEach(f => { if (f) f.style.display = this.isEditMode ? 'block' : 'none'; });

    if (profileActions) profileActions.style.display = this.isEditMode ? 'flex' : 'none';
    if (editBtn) editBtn.style.display = this.isEditMode ? 'none' : 'inline-flex';

    // limpar marcações de erro ao entrar em edição
    if (this.isEditMode) ['input-name','input-email','input-phone'].forEach(id => this.markInvalid(id, false));

    console.log(`✏️ perfil.js: modo de edição ${this.isEditMode ? 'ativado' : 'desativado'}`);
  },

  // ---------- Ações ----------
  saveProfile() {
    console.log('💾 perfil.js: salvando perfil...');
    try {
      const updatedData = {
        ...this.userData,
        name: document.getElementById('input-name')?.value ?? this.userData.name,
        email: document.getElementById('input-email')?.value ?? this.userData.email,
        phone: document.getElementById('input-phone')?.value ?? this.userData.phone,
        birthdate: document.getElementById('input-birthdate')?.value ?? this.userData.birthdate,
        city: document.getElementById('input-city')?.value ?? this.userData.city,
        profession: document.getElementById('input-profession')?.value ?? this.userData.profession
      };

      if (!this.validateProfileData(updatedData)) return;

      this.userData = updatedData;
      localStorage.setItem('user_data', JSON.stringify(this.userData));

      this.updateInterface();
      this.toggleEditMode();

      // UX: foca no card pra ver a confirmação
      document.querySelector('.profile-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

      this.showMessage('Perfil atualizado com sucesso!', 'success');
      console.log('✅ perfil.js: perfil salvo', this.userData);
    } catch (err) {
      console.error('❌ perfil.js: erro ao salvar perfil:', err);
      this.showMessage('Erro ao salvar perfil. Tente novamente.', 'error');
    }
  },

  validateProfileData(data) {
    // reset marcações
    ['input-name','input-email','input-phone'].forEach(id => this.markInvalid(id, false));

    if (!data.name || data.name.trim().length < 2) {
      this.markInvalid('input-name', true);
      this.showMessage('Nome deve ter pelo menos 2 caracteres', 'error');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      this.markInvalid('input-email', true);
      this.showMessage('E-mail inválido', 'error');
      return false;
    }
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    if (data.phone && !phoneRegex.test(data.phone)) {
      this.markInvalid('input-phone', true);
      this.showMessage('Telefone deve estar no formato (11) 99999-9999', 'error');
      return false;
    }
    return true;
  },

  cancelEdit() {
    console.log('↩️ perfil.js: cancelando edição...');
    this.updateInterface();      // restaura valores originais
    this.toggleEditMode();       // sai do modo de edição
    this.showMessage('Edição cancelada', 'info');
  },

  changeAvatar() {
    console.log('📷 perfil.js: alterar avatar (simulação)');
    this.showMessage('Funcionalidade de alterar foto será implementada em breve', 'info');
  },

  changePassword() {
    console.log('🔑 perfil.js: alterar senha (simulação)');
    const newPassword = prompt('Digite a nova senha:');
    if (newPassword && newPassword.length >= 6) {
      this.showMessage('Senha alterada com sucesso!', 'success');
      console.log('✅ perfil.js: senha alterada');
    } else if (newPassword) {
      this.showMessage('Senha deve ter pelo menos 6 caracteres', 'error');
    }
  },

  // ---------- Mensagens ----------
  ensureMessageContainer() {
    let container = document.getElementById('message-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'message-container';
      container.className = 'message-container';
      document.body.appendChild(container);
    }
    return container;
  },

  showMessage(message, type = 'info') {
    console.log(`📢 perfil.js: mensagem (${type}) ${message}`);
    const container = this.ensureMessageContainer();

    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.innerHTML = `
      <i class="fas fa-${this.getMessageIcon(type)}" aria-hidden="true"></i>
      <span>${message}</span>
      <button class="message-close" aria-label="Fechar mensagem">
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    `;

    // fechar no X
    messageEl.querySelector('.message-close')?.addEventListener('click', () => messageEl.remove());

    container.appendChild(messageEl);
    setTimeout(() => messageEl.remove(), 5000);
  },

  getMessageIcon(type) {
    const icons = {
      success: 'check-circle',
      error: 'exclamation-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle'
    };
    return icons[type] || 'info-circle';
  },

  // ---------- Acessibilidade ----------
  markInvalid(id, isInvalid) {
    const el = document.getElementById(id);
    if (el) el.setAttribute('aria-invalid', isInvalid ? 'true' : 'false');
  }
};

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  console.log('🧩 perfil.js: DOM pronto, iniciando...');
  profileManager.init();
});

// Export global (útil pra debug)
window.profileManager = profileManager;

console.log('✅ perfil.js: carregado com sucesso');