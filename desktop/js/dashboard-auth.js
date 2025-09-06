/* /js/dashboard-auth.js
   - Lógica de autenticação e hidratação de dados do usuário.
   - Dispara um evento 'auth:ready' quando a verificação termina.
*/
(() => {
  'use strict';

  const log = (enabled => (...args) => enabled && console.log("[DashboardAuth]", ...args))(false);

  function dispatchAuthReady(detail) {
    log('Disparando evento auth:ready', detail);
    document.dispatchEvent(new CustomEvent('auth:ready', { detail }));
  }
  
  function removeAntiFlash() {
    document.documentElement.setAttribute('data-auth', 'valid');
  }

  function hydrateUserData(user) {
    if (!user) return;
    const name = user.name || user.email.split('@')[0];
    const role = (user.role || 'aluno').replace(/^\w/, c => c.toUpperCase());

    document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = name);
    document.querySelectorAll('[data-user-role]').forEach(el => el.textContent = role);
  }

  function handleLogout() {
    document.querySelectorAll('[data-action="logout"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.authManager) {
                log('Executando logout via authManager...');
                window.authManager.logout();
            }
        });
    });
  }

  function runAuthCheck() {
    log('Executando verificação de autenticação...');
    
    if (!window.authManager) {
        console.error("[DashboardAuth] authManager não está disponível. Redirecionando para login.");
        window.location.href = '/desktop/pages/login-aluno.html';
        return;
    }

    const body = document.body;
    const expectedRole = body.getAttribute('data-dashboard-role');

    if (!expectedRole) {
        console.error("[DashboardAuth] Atributo 'data-dashboard-role' não encontrado no <body>.");
        removeAntiFlash();
        return;
    }

    // Usando o authGuard para proteger a página
    window.authManager.authGuard({ allowedRoles: [expectedRole] });

    const user = window.authManager.getUser();

    if (user) {
        log('Usuário autenticado:', user);
        hydrateUserData(user);
        dispatchAuthReady({ success: true, user });
    } else {
        // O authGuard já deve ter redirecionado, mas como fallback:
        log('Nenhum usuário encontrado após authGuard.');
        dispatchAuthReady({ success: false, error: 'Usuário não autenticado' });
    }
    
    removeAntiFlash();
    handleLogout();
  }

  // Espera o auth.js carregar e inicializar o authManager
  // Adicionamos um pequeno delay para garantir que a instância global esteja pronta.
  setTimeout(runAuthCheck, 50);

})();