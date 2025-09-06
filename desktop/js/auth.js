/**
 * /js/auth.js — Gerenciador de Sessão - Instituto Buriti
 * Responsável pelo estado da sessão (login, logout, verificação) e guarda de rotas.
 * O ato de logar via formulário é tratado por /js/login.js, que chama os métodos deste manager.
 */

(function() {
  "use strict";

  const SUPABASE_URL = "https://ngvljtxkinvygynwcckp.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndmxqdHhraW52eWd5bndjY2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzIxNzksImV4cCI6MjA2NzkwODE3OX0.vwJgc2E_erC3giIofKiVY5ipYM2uRP8m9Yxy0fqE2yY";
  const DEBUG_AUTH = false; // Mude para true para ver logs detalhados no console

  // Funções de Log
  const log = (...args) => DEBUG_AUTH && console.log("[AuthManager]", ...args);
  const error = (...args) => DEBUG_AUTH && console.error("[AuthManager]", ...args);

  class AuthManager {
      constructor() {
          log("Inicializando...");
          this.session = this.loadSession();
          this.addStorageListener();
          this.verifySession();
      }

      // --- MÉTODOS DE SESSÃO ---

      loadSession() {
          try {
              const sessionData = localStorage.getItem("auth_session");
              return sessionData ? JSON.parse(sessionData) : null;
          } catch (e) {
              error("Erro ao carregar sessão do localStorage.", e);
              return null;
          }
      }

      saveSession(supabasePayload) {
          if (!supabasePayload || !supabasePayload.access_token || !supabasePayload.user) {
              this.clearSession();
              error("Tentativa de salvar sessão com dados inválidos.");
              return;
          }

          const expires_at = Date.now() + (supabasePayload.expires_in || 3600) * 1000;
          const user = this.normalizeUser(supabasePayload.user);
          
          this.session = {
              access_token: supabasePayload.access_token,
              refresh_token: supabasePayload.refresh_token,
              user: user,
              expires_at: expires_at,
          };

          try {
              localStorage.setItem("auth_session", JSON.stringify(this.session));
              log("Sessão salva com sucesso para o usuário:", user.email);
          } catch (e) {
              error("Erro ao salvar sessão no localStorage.", e);
          }
      }

      clearSession() {
          log("Limpando sessão.");
          this.session = null;
          localStorage.removeItem("auth_session");
          localStorage.removeItem("auth_token"); // Compatibilidade com scripts antigos
          localStorage.removeItem("user_data"); // Compatibilidade com scripts antigos
      }

      verifySession() {
          if (!this.session || !this.session.access_token || !this.session.expires_at) {
              log("Nenhuma sessão válida encontrada.");
              return false;
          }
          if (Date.now() >= this.session.expires_at) {
              log("Sessão expirada. Limpando...");
              this.clearSession();
              return false;
          }
          log("Sessão válida encontrada.");
          return true;
      }

      // --- MÉTODOS DE ESTADO ---

      isAuthenticated() {
          return this.verifySession();
      }

      getUser() {
          return this.session ? this.session.user : null;
      }

      getToken() {
          return this.session ? this.session.access_token : null;
      }

      getUserRole() {
          const user = this.getUser();
          return user ? user.role : null;
      }

      // --- AÇÕES ---

      async logout(redirectPath = '/desktop/pages/login-aluno.html') {
          log(`Efetuando logout e redirecionando para ${redirectPath}...`);
          const token = this.getToken();
          
          this.clearSession(); // Limpa a sessão local imediatamente

          // Tenta invalidar o token no Supabase (não bloqueante)
          if (token) {
              try {
                  await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
                      method: "POST",
                      headers: {
                          "Content-Type": "application/json",
                          "apikey": SUPABASE_ANON_KEY,
                          "Authorization": `Bearer ${token}`
                      }
                  });
                  log("Sessão invalidada no Supabase.");
              } catch (e) {
                  error("Falha ao invalidar sessão no Supabase (não crítico).", e);
              }
          }

          if (redirectPath) {
              window.location.href = redirectPath;
          }
      }

      // --- GUARDA DE ROTAS ---

      authGuard(config = {}) {
          const {
              allowedRoles = [], // Se vazio, apenas requer autenticação
              redirectUrl = '/desktop/pages/login-aluno.html'
          } = config;

          if (!this.isAuthenticated()) {
              log("Auth Guard: Usuário não autenticado. Redirecionando...");
              window.location.href = redirectUrl;
              return;
          }

          if (allowedRoles.length > 0) {
              const userRole = this.getUserRole();
              if (!userRole || !allowedRoles.includes(userRole)) {
                  log(`Auth Guard: Acesso negado. Papel '${userRole}' não está em [${allowedRoles.join(', ')}]. Redirecionando...`);
                  alert("Você não tem permissão para acessar esta página.");
                  window.location.href = '/desktop/index.html'; // Redireciona para a home em caso de falta de permissão
              }
          }
           log("Auth Guard: Acesso permitido.");
      }

      // --- HELPERS ---

      normalizeUser(user) {
          if (!user) return null;
          const role = (
              user.app_metadata?.role ||
              user.user_metadata?.role ||
              "aluno"
          ).toLowerCase();
          
          return {
              id: user.id,
              email: user.email,
              name: user.user_metadata?.name || user.email.split('@')[0],
              role: role,
          };
      }
      
      addStorageListener() {
          window.addEventListener('storage', (event) => {
              if (event.key === 'auth_session') {
                  log('Sessão alterada em outra aba. Sincronizando...');
                  this.session = this.loadSession();
              }
          });
      }
  }

  // Expor instância global
  window.authManager = new AuthManager();
  log("AuthManager globalmente disponível.", `Modo: SUPABASE`);

})();