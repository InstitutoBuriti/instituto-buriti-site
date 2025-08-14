/**
 * Sistema de Autenticação - Instituto Buriti
 * Gerenciamento de login, logout e verificação de tokens
 *
 * MODO DEMO (sem backend)
 * - Credenciais válidas de demonstração:
 *      email:    ana.silva@email.com
 *      senha:    123456
 */

const USE_SUPABASE = false;
const DEBUG = false; // <-- altere para true se quiser ver logs

// Credenciais demo
const VALID_CREDENTIALS = {
  'ana.silva@email.com': '123456'
};

// Utils de log seguro
function dbg(...args){ if (DEBUG) console.log('[AUTH]', ...args); }
function warn(...args){ if (DEBUG) console.warn('[AUTH]', ...args); }
function err(...args){ if (DEBUG) console.error('[AUTH]', ...args); }

// Normalizadores
function normEmail(s){
  return String(s || '')
    .trim()
    .toLowerCase();
}
function normPass(s){
  // não logamos senha em nenhuma circunstância
  return String(s || '').trim();
}

// Validação local (demo)
function validateLocalCredentials(email, password) {
  const e = normEmail(email);
  const p = normPass(password);
  const ok = VALID_CREDENTIALS[e] === p;
  dbg('validando credenciais locais para', e, '=>', ok);
  return ok;
}

class AuthManager {
  constructor() {
    dbg('Inicializando AuthManager...');
    // Carregar token e usuário do localStorage com segurança
    this.token = localStorage.getItem('auth_token') || null;
    this.user = null;

    try {
      const raw = localStorage.getItem('user_data');
      this.user = raw ? JSON.parse(raw) : null;
    } catch (e) {
      warn('user_data inválido no localStorage — limpando.', e);
      localStorage.removeItem('user_data');
      this.user = null;
    }

    // manter abas sincronizadas (logout em todas)
    window.addEventListener('storage', (ev) => {
      if (ev.key === 'auth_token' && !ev.newValue) {
        dbg('Detectado logout em outra aba; limpando estado local...');
        this.token = null;
        this.user = null;
      }
    });

    this.init();
  }

  init() {
    dbg('init()');
    // Apenas valida token se existir (não força logout em páginas públicas).
    if (this.token) {
      this.verifyToken();
    }
  }

  async login(email, password) {
    dbg('login() chamado');

    try {
      if (USE_SUPABASE) {
        // Placeholder para backend real
        return { success: false, error: 'Supabase temporariamente desabilitado' };
      } else {
        const ok = validateLocalCredentials(email, password);
        if (!ok) {
          return { success: false, error: 'E-mail ou senha incorretos' };
        }

        // Gera token demo e persiste
        this.token = 'demo_token_' + Date.now();
        this.user = {
          id: 1,
          email: normEmail(email),
          name: 'Ana Silva',
          role: 'aluno'
        };

        localStorage.setItem('auth_token', this.token);
        localStorage.setItem('user_data', JSON.stringify(this.user));
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userEmail', this.user.email);

        dbg('login ok; user:', this.user);
        return { success: true, user: this.user };
      }
    } catch (e) {
      err('Erro no login:', e);
      return { success: false, error: 'Erro de conexão' };
    }
  }

  logout(redirectToLogin = true) {
    dbg('logout()');
    this.token = null;
    this.user = null;

    // limpar storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userEmail');

    if (redirectToLogin) {
      window.location.href = '/pages/login-aluno.html';
    }
  }

  isAuthenticated() {
    const ok = !!this.token && !!this.user;
    dbg('isAuthenticated() =>', ok);
    return ok;
  }

  getUser() {
    return this.user;
  }

  // compat com outras partes do site
  getCurrentUser() {
    return this.getUser();
  }

  verifyToken() {
    // Em demo, considerar válido se existir
    if (!this.token) {
      warn('Token ausente/ inválido.');
      // NÃO chamamos logout automático aqui para evitar redirecionar páginas públicas.
      // Páginas protegidas devem chamar authGuard().
      return false;
    }
    return true;
  }

  /**
   * Protege páginas privadas.
   * Use nas páginas que exigirem login:
   *   if (!authManager.authGuard()) return;
   */
  authGuard({ redirect = '/pages/login-aluno.html' } = {}) {
    if (!this.isAuthenticated()) {
      window.location.href = redirect;
      return false;
    }
    return true;
  }
}

// Instância global
const authManager = new AuthManager();
window.authManager = authManager;
dbg('AuthManager pronto');
