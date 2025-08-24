/**
 * /js/auth.js — SUBSTITUIÇÃO TOTAL
 * Sistema de Autenticação — Instituto Buriti
 * - Guarda de rotas, login/logout programático e verificação de sessão
 * - Compatível com dois modos:
 *      1) DEMO (sem backend) — credenciais fake
 *      2) SUPABASE (produção) — REST Auth v1
 *
 * Observações:
 * - O fluxo de login nas páginas é tratado por /js/login.js.
 *   Este arquivo foca em: estado de sessão, logout, authGuard e utilidades.
 * - Ative o Supabase definindo USE_SUPABASE=true **ou**
 *   expondo window.SUPABASE_URL e window.SUPABASE_ANON_KEY (auto-detect).
 */

/* ==============================
   Configuração
   ============================== */
   // Usar configurações do arquivo centralizado config.js
   const { SUPABASE_URL, SUPABASE_ANON_KEY, USE_SUPABASE } = window.APP_CONFIG || {};
   const DEBUG = false;                // mude para true para ver logs
   
   // Credenciais DEMO (modo sem backend)
   const VALID_CREDENTIALS = {
     "ana.silva@email.com": "123456"
   };
   
   /* ==============================
      Utils de log
      ============================== */
   function dbg(...a){ if (DEBUG) console.log("[AUTH]", ...a); }
   function warn(...a){ if (DEBUG) console.warn("[AUTH]", ...a); }
   function err(...a){ if (DEBUG) console.error("[AUTH]", ...a); }
   
   /* ==============================
      Helpers
      ============================== */
   const normEmail = (s) => String(s||"").trim().toLowerCase();
   const now = () => Date.now();
   
   function storageGetJSON(key, fallback=null){
     try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
     catch { return fallback; }
   }
   function storageSetJSON(key, obj){
     try { localStorage.setItem(key, JSON.stringify(obj)); } catch {}
   }
   
   /** Normaliza o objeto de usuário para sempre conter `role` e `type` */
   function normalizeUser(user){
     if (!user) return null;
     const role = (user.role || user.type || "aluno").toString().toLowerCase();
     return { ...user, role, type: role };
   }
   
   /* ==============================
      AuthManager
      ============================== */
   class AuthManager {
     constructor() {
       dbg("Inicializando AuthManager…");
   
       // Estado
       this.session = storageGetJSON("auth_session", null);
       // { access_token, refresh_token, expires_at(ms), user:{id,email,name,role,type} }
   
       // Sync entre abas
       window.addEventListener("storage", (ev) => {
         if (ev.key === "auth_session") {
           this.session = storageGetJSON("auth_session", null);
           dbg("Sessão sincronizada entre abas:", !!this.session);
           // garante que espelhos estejam coerentes ao sincronizar
           if (this.session) {
             try {
               if (this.session.access_token) localStorage.setItem("auth_token", this.session.access_token);
               if (this.session.user)        storageSetJSON("user_data", this.session.user);
             } catch {}
           }
         }
       });
   
       // Verificação inicial
       this.verifySession();
     }
   
     /* --------- Persistência --------- */
     saveSession(sess){
       this.session = sess ? { ...sess, user: normalizeUser(sess.user) } : null;
   
       if (this.session) {
         // grava sessão principal
         storageSetJSON("auth_session", this.session);
         // espelhos para compat com dashboard.js e dashboard-auth.js
         try {
           if (this.session.access_token) localStorage.setItem("auth_token", this.session.access_token);
           if (this.session.user)        storageSetJSON("user_data", this.session.user);
         } catch {}
       } else {
         localStorage.removeItem("auth_session");
         localStorage.removeItem("auth_token");
         localStorage.removeItem("user_data");
       }
     }
   
     clearSession(){
       this.saveSession(null);
     }
   
     /* --------- Estado --------- */
     isAuthenticated(){
       if (!this.session || !this.session.access_token) return false;
       if (typeof this.session.expires_at === "number" && now() >= this.session.expires_at) {
         dbg("Token expirado.");
         return false;
       }
       return true;
     }
     getUser(){ return this.session?.user || null; }
   
     /* --------- Guarda de rota ---------
        allowed: [] → sem restrição de papel (apenas exige login)
        allowed: ["admin"] → exige papel específico
     ------------------------------------ */
     authGuard({ redirect = this.getDefaultLoginPath(), allowed = [] } = {}){
       if (!this.isAuthenticated()){
         window.location.href = redirect;
         return false;
       }
       if (Array.isArray(allowed) && allowed.length > 0){
         const role = (this.getUser()?.role || "").toLowerCase();
         if (!allowed.includes(role)){
           // autenticado, porém não autorizado
           window.location.href = redirect;
           return false;
         }
       }
       return true;
     }
   
     getDefaultLoginPath(){
       // login padrão para público geral (aluno)
       return "/pages/login-aluno.html";
     }
   
     /* --------- Verificação inicial --------- */
     verifySession(){
       if (!this.session) { dbg("Sem sessão."); return false; }
       // normaliza caso versões antigas tenham salvo sem role/type
       if (this.session.user && (!this.session.user.role || !this.session.user.type)) {
         this.session.user = normalizeUser(this.session.user);
         storageSetJSON("auth_session", this.session);
       }
       if (!this.isAuthenticated()){
         warn("Sessão inválida/expirada — limpando.");
         this.clearSession();
         return false;
       }
       // garante espelhos mesmo após reload (se vieram de versões antigas)
       try {
         if (this.session.access_token) localStorage.setItem("auth_token", this.session.access_token);
         if (this.session.user)        storageSetJSON("user_data", this.session.user);
       }
       dbg("Sessão válida, expira em:", new Date(this.session.expires_at||0).toISOString());
       return true;
     }
   
     /* --------- Login programático (opcional) ---------
        OBS: As páginas de login usarão /js/login.js.
        Este método existe caso algum fluxo precise autenticar por aqui. */
     async login(email, password){
       const e = normEmail(email || "");
       const p = String(password || "");
   
       if (!e || !p) return { success:false, error:"Credenciais ausentes." };
   
       try {
         if (USE_SUPABASE){
           // Supabase: password grant
           const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
             method: "POST",
             headers: {
               "Content-Type": "application/json",
               "apikey": SUPABASE_ANON_KEY,
               "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
             },
             body: JSON.stringify({ email: e, password: p })
           });
   
           const data = await res.json().catch(()=> ({}));
           if (!res.ok){
             const msg = data?.error_description || data?.msg || "Falha no login.";
             return { success:false, error: msg };
           }
   
           const access_token  = data.access_token;
           const refresh_token = data.refresh_token;
           const expires_in    = Number(data.expires_in || 3600); // segundos
           const expires_at    = now() + expires_in*1000;
   
           // Buscar usuário (metadados)
           let user = { email: e };
           try {
             const uRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
               method: "GET",
               headers: {
                 "apikey": SUPABASE_ANON_KEY,
                 "Authorization": `Bearer ${access_token}`
               }
             });
             if (uRes.ok){
               const u = await uRes.json();
               user = {
                 id: u?.id,
                 email: u?.email || e,
                 name: u?.user_metadata?.name || u?.email || "Usuário",
                 role: (u?.user_metadata?.role || "aluno")
               };
             }
           } catch { /* noop */ }
   
           user = normalizeUser(user);
           this.saveSession({ access_token, refresh_token, expires_at, user });
           dbg("Login OK via Supabase para:", user.email, "role:", user.role);
           return { success:true, user };
         }
   
         // DEMO
         if (VALID_CREDENTIALS[e] === p){
           const expires_at = now() + 3600*1000;
           const user = normalizeUser({ id: 1, email: e, name: "Ana Silva", role: "aluno" });
           this.saveSession({ access_token: "demo_"+Date.now(), refresh_token: null, expires_at, user });
           dbg("Login DEMO OK:", user.email, "role:", user.role);
           return { success:true, user };
         }
         return { success:false, error:"E-mail ou senha incorretos." };
   
       } catch (ex){
         err("Erro no login:", ex);
         return { success:false, error:"Erro de conexão." };
       }
     }
   
     /* --------- Logout --------- */
     async logout(opts = {}){
       let redirectTo;
       if (typeof opts === 'boolean') {
         redirectTo = opts ? this.getDefaultLoginPath() : false;
       } else if (typeof opts === 'string') {
         redirectTo = opts;
       } else if (opts && typeof opts === 'object' && 'redirect' in opts) {
         redirectTo = opts.redirect;
       } else {
         // Se nenhuma opção de redirecionamento for fornecida, tenta inferir o papel
         // e redireciona para a página de login correspondente.
         const userRole = this.getUser()?.role;
         if (userRole) {
           switch (userRole) {
             case 'admin':
               redirectTo = '/pages/login-admin.html';
               break;
             case 'instrutor':
               redirectTo = '/pages/login-instrutor.html';
               break;
             // Adicione outros casos conforme necessário
             default:
               redirectTo = this.getDefaultLoginPath(); // Redirecionamento padrão para aluno
           }
         } else {
           redirectTo = this.getDefaultLoginPath(); // Redirecionamento padrão se o papel não puder ser inferido
         }
       }
   
       try {
         if (USE_SUPABASE && this.session?.access_token){
           // Invalida a sessão no Supabase (best-effort)
           try {
             await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
               method: "POST",
               headers: {
                 "apikey": SUPABASE_ANON_KEY,
                 "Authorization": `Bearer ${this.session.access_token}`
               }
             });
           } catch { /* noop */ }
         }
       } finally {
         this.clearSession();
         if (redirectTo !== false) {
           window.location.href = (typeof redirectTo === 'string' && redirectTo) ? redirectTo : this.getDefaultLoginPath();
         }
       }
     }
   }
   
   /* ==============================
      Instância global
      ============================== */
   const authManager = new AuthManager();
   window.authManager = authManager;
   dbg("AuthManager pronto — modo:", USE_SUPABASE ? "SUPABASE" : "DEMO");
   
   /* ==============================
      Dica de uso nos dashboards
      ------------------------------
      // Aluno:
      // window.authManager.authGuard({ redirect: "/pages/login-aluno.html", allowed: ["aluno"] });
   
      // Instrutor:
      // window.authManager.authGuard({ redirect: "/pages/login-instrutor.html", allowed: ["instrutor","instructor","professor"] });
   
      // Admin:
      // window.authManager.authGuard({ redirect: "/pages/login-admin.html", allowed: ["admin"] });
      ============================== */




