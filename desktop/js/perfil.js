// /js/perfil.js
// Sistema de Perfil do Aluno — integrado ao auth.js / dashboard-auth.js
// ✅ Robusto para DOM parcial, preferências persistidas e acessibilidade nos erros.

console.log('🚀 perfil.js: carregando...');

// Helpers para localStorage seguro
function safeGet(key, fallback=null) {
  try { const v = localStorage.getItem(key); return v === null ? fallback : v; } catch { return fallback; }
}
function safeSet(key, val) {
  try { localStorage.setItem(key, val); } catch {}
}

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

    if (!window.Auth) {
      console.warn('[perfil] Auth indisponível (modo preview). Funcionalidades críticas desabilitadas.');
    }
  },

  // ---------- Dados ----------
  loadUserData() {
    console.log('📥 perfil.js: carregando dados do usuário...');
    try {
      const userDataStr = safeGet('user_data');

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
    try {
      const prefs = JSON.parse(safeGet('user_preferences', '{}'));

      const dark = !!prefs.darkMode;
      document.body.classList.toggle('dark-mode', dark);
      const dm = document.getElementById('dark-mode');
      if (dm) dm.checked = dark;

      const em = document.getElementById('email-notifications');
      if (em) em.checked = ('emailNotifications' in prefs) ? !!prefs.emailNotifications : true;

      const pn = document.getElementById('push-notifications');
      if (pn) pn.checked = ('pushNotifications' in prefs) ? !!prefs.pushNotifications : false;
    } catch {}
  },

  updatePreference(preference, value) {
    console.log(`⚙️ perfil.js: preferência ${preference} = ${value}`);
    const prefs = JSON.parse(safeGet('user_preferences', '{}'));
    prefs[preference] = value;
    safeSet('user_preferences', JSON.stringify(prefs));

    if (preference === 'darkMode') {
      document.body.classList.toggle('dark-mode', !!value);
    }
    this.showMessage(`Preferência atualizada: ${preference}`, 'success');
  },

  // ---------- Interface ----------
  updateInterface() {
    console.log('🖥️ perfil.js: atualizando interface...');
    if (!this.userData) return;

    // Hidratação do nome (compat com data-user-name e #sidebar-user-name)
    const name = this.userData?.name || 'Aluno(a)';
    document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = name);
    const side = document.getElementById('sidebar-user-name');
    if (side) side.textContent = name;

    // Atualizar campos de exibição
    const fields = {
      'display-name': this.userData.name,
      'display-email': this.userData.email,
      'display-phone': this.userData.phone,
      'display-birthdate': this.formatDate(this.userData.birthdate),
      'display-city': this.userData.city,
      'display-profession': this.userData.profession,
      'member-since': this.userData.memberSince,
      'total-courses': this.userData.totalCourses,
      'completed-courses': this.userData.completedCourses,
      'total-achievements': this.userData.totalAchievements,
      'last-login': this.userData.lastLogin
    };

    Object.entries(fields).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value || 'Não informado';
    });

    // Atualizar inputs
    const inputs = {
      'input-name': this.userData.name,
      'input-email': this.userData.email,
      'input-phone': this.userData.phone,
      'input-birthdate': this.userData.birthdate,
      'input-city': this.userData.city,
      'input-profession': this.userData.profession
    };

    Object.entries(inputs).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.value = value || '';
    });
  },

  formatDate(dateString) {
    if (!dateString) return '';
    // aceita "YYYY-MM-DD" ou "DD/MM/YYYY"
    let [y, m, d] = (dateString.includes('-')) ? dateString.split('-') // YYYY-MM-DD
      : dateString.split('/').reverse(); // DD/MM/YYYY -> YYYY,MM,DD
    const date = new Date(`${y}-${m}-${d}`);
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('pt-BR');
  },

  toggleEditMode() {
    console.log('✏️ perfil.js: alternando modo de edição...');
    this.isEditMode = !this.isEditMode;

    document.querySelectorAll('.field-value').forEach(el => el.style.display = this.isEditMode ? 'none' : 'block');
    document.querySelectorAll('.field-input').forEach(el => el.style.display = this.isEditMode ? 'block' : 'none');

    const editBtn = document.getElementById('edit-profile-btn');
    const actions = document.getElementById('profile-actions');
    if (editBtn) editBtn.style.display = this.isEditMode ? 'none' : 'inline-flex';
    if (actions) actions.style.display = this.isEditMode ? 'flex' : 'none';

    if (this.isEditMode) {
      document.getElementById('input-name')?.focus();
    } else {
      // Limpa marcas de erro ao sair do modo edição
      document.querySelectorAll('.field-input').forEach(el => el.classList.remove('input-error'));
    }
  },

  // ---------- Salvamento ----------
  saveProfile() {
    console.log('💾 perfil.js: salvando perfil...');
    const data = {
      name: document.getElementById('input-name')?.value,
      email: document.getElementById('input-email')?.value,
      phone: document.getElementById('input-phone')?.value,
      birthdate: document.getElementById('input-birthdate')?.value,
      city: document.getElementById('input-city')?.value,
      profession: document.getElementById('input-profession')?.value
    };

    if (!this.validateProfileData(data)) return;

    this.userData = { ...this.userData, ...data };
    safeSet('user_data', JSON.stringify(this.userData));
    this.toggleEditMode();
    this.updateInterface();
    this.showMessage('Perfil atualizado com sucesso!', 'success');
  },

  validateProfileData(data) {
    console.log('🔍 perfil.js: validando dados...');

    // Função auxiliar para marcar inválido
    const mark = (id, ok) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.toggle('input-error', !ok);
    };

    if (!data.name || data.name.trim().length < 2) {
      mark('input-name', false);
      this.showMessage('Nome deve ter pelo menos 2 caracteres', 'error');
      return false;
    } else {
      mark('input-name', true);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      mark('input-email', false);
      this.showMessage('E-mail inválido', 'error');
      return false;
    } else {
      mark('input-email', true);
    }

    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    if (data.phone && !phoneRegex.test(data.phone)) {
      mark('input-phone', false);
      this.showMessage('Telefone deve estar no formato (11) 99999-9999', 'error');
      return false;
    } else {
      mark('input-phone', true);
    }

    // Outras validações opcionais aqui (ex.: birthdate, city, profession)
    return true;
  },

  cancelEdit() {
    console.log('↩️ perfil.js: cancelando edição...');
    this.updateInterface();      // restaura valores originais
    this.toggleEditMode();       // sai do modo de edição
    // Limpa marcas de erro
    document.querySelectorAll('.field-input').forEach(el => el.classList.remove('input-error'));
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
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(container);
    }
    return container;
  },

  showMessage(message, type = 'info') {
    console.log(`📢 perfil.js: mensagem (${type}) ${message}`);
    const container = this.ensureMessageContainer();

    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.setAttribute('role', 'status');
    messageEl.setAttribute('aria-live', 'polite');

    const icon = document.createElement('i');
    icon.className = `fas fa-${this.getMessageIcon(type)}`;
    icon.setAttribute('aria-hidden', 'true');

    const span = document.createElement('span');
    span.textContent = message; // <-- sem HTML, evita XSS

    const btn = document.createElement('button');
    btn.className = 'message-close';
    btn.setAttribute('aria-label', 'Fechar mensagem');
    btn.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i>';
    btn.addEventListener('click', () => messageEl.remove());

    messageEl.append(icon, span, btn);
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
    if (el) {
      el.setAttribute('aria-invalid', isInvalid ? 'true' : 'false');
      el.classList.toggle('input-error', isInvalid);
    }
  },

  // ---------- Eventos ----------
  setupEventListeners() {
    console.log('🎯 perfil.js: configurando listeners...');

    document.getElementById('edit-profile-btn')?.addEventListener('click', () => this.toggleEditMode());
    document.getElementById('save-profile-btn')?.addEventListener('click', () => this.saveProfile());
    document.getElementById('cancel-edit-btn')?.addEventListener('click', () => this.cancelEdit());
    document.getElementById('change-avatar-btn')?.addEventListener('click', () => this.changeAvatar());
    document.getElementById('change-password-btn')?.addEventListener('click', () => this.changePassword());

    document.getElementById('dark-mode')?.addEventListener('change', (e) => this.updatePreference('darkMode', e.target.checked));
    document.getElementById('email-notifications')?.addEventListener('change', (e) => this.updatePreference('emailNotifications', e.target.checked));
    document.getElementById('push-notifications')?.addEventListener('change', (e) => this.updatePreference('pushNotifications', e.target.checked));
  }
};

// Inicialização idempotente + espera pelo guard
if (!window.__perfilInit) {
  window.__perfilInit = true;
  const start = () => profileManager.init();
  if (document.readyState !== 'loading') {
    if (document.documentElement.getAttribute('data-auth') !== 'checking') start();
    else window.addEventListener('dashboard-auth:ready', start, { once: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.documentElement.getAttribute('data-auth') !== 'checking') start();
      else window.addEventListener('dashboard-auth:ready', start, { once: true });
    }, { once: true });
  }
}

// Export global para debug
window.profileManager = profileManager;

console.log('✅ perfil.js: carregado com sucesso');