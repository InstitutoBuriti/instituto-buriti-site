// /desktop/js/config.js
// Ponto central de configuração e inicialização do Supabase.
// Este script DEVE ser carregado antes de qualquer outro script que use o Supabase.

(function() {
    "use strict";

    const SUPABASE_URL = "https://ngvljtxkinvygynwcckp.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI-NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndmxqdHhraW52eWd5bndjY2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzIxNzksImV4cCI6MjA2NzkwODE3OX0.vwJgc2E_erC3giIofKiVY5ipYM2uRP8m9Yxy0fqE2yY";

    try {
        if (window.supabase) {
            // Cria a instância do cliente e a anexa ao objeto global 'window'
            // para que todos os outros scripts possam acessá-la.
            window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Cliente Supabase inicializado com sucesso a partir do config.js');
        } else {
            throw new Error("Biblioteca principal do Supabase (supabase-js) não foi encontrada.");
        }
    } catch (err) {
        console.error("Falha crítica na inicialização do Supabase:", err);
        // Opcional: Mostrar um erro visual para o usuário
        document.body.innerHTML = '<div style="text-align: center; padding: 50px; font-family: sans-serif;"><h1>Erro Crítico</h1><p>Não foi possível conectar ao sistema. Por favor, tente novamente mais tarde.</p></div>';
    }

})();