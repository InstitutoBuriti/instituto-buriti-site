/**
 * /js/module-loader.js — Módulo de Carregamento para Dashboards
 * - Responsável por inicializar a lógica específica de cada dashboard.
 * - Realiza a verificação de autenticação (authGuard).
 * - Carrega dinamicamente o script do dashboard correspondente.
 */

import '/desktop/js/auth.js?v=1.3'; // Garante que o authManager seja carregado primeiro
import '/desktop/js/dashboard-auth.js?v=1.0'; // Script que popula nome de usuário, etc.
import '/desktop/js/dashboard.js?v=1.0'; // Script com funcionalidades comuns de dashboards

(function() {
    "use strict";

    const DEBUG_LOADER = true;
    const log = (...args) => DEBUG_LOADER && console.log("[ModuleLoader]", ...args);
    const error = (...args) => DEBUG_LOADER && console.error("[ModuleLoader]", ...args);

    document.addEventListener('DOMContentLoaded', () => {
        log("DOM carregado. Iniciando carregador de módulo...");

        const body = document.body;
        const role = body.getAttribute('data-dashboard-role');

        if (!role) {
            error("Atributo 'data-dashboard-role' não encontrado no <body>. A inicialização foi abortada.");
            return;
        }

        log(`Papel detectado: ${role}. Verificando autenticação...`);

        // Protege a página usando o authManager
        if (window.authManager) {
            // A configuração abaixo exige que o usuário esteja logado e tenha o papel 'aluno'
            window.authManager.authGuard({
                allowedRoles: [role],
                redirectUrl: `/desktop/pages/login-${role}.html`
            });
            log("Verificação do Auth Guard concluída.");
        } else {
            error("window.authManager não está definido. O auth.js foi carregado corretamente?");
            // Força o redirecionamento se o authManager falhar em carregar
            window.location.href = '/desktop/pages/login-aluno.html';
            return;
        }
        
        log("Autenticação validada. O dashboard pode ser renderizado.");
        // Remove o estilo "anti-flash" para mostrar o corpo da página
        document.documentElement.setAttribute('data-auth', 'valid');

    });

})();