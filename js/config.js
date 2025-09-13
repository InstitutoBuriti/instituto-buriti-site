// /js/config.js
// PONTO CENTRAL E ÚNICA FONTE DA VERDADE PARA CONFIGURAÇÃO DO SUPABASE.
// Versão Final - Com logs de diagnóstico aprimorados.

(function() {
    "use strict";

    // Credenciais corretas e confirmadas do seu projeto Supabase
    const SUPABASE_URL = 'https://ngvljtxkinvygynwcckp.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndmxqdHhraW52eWd5bndjY2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzIxNzksImV4cCI6MjA2NzkwODE3OX0.vwJgc2E_erC3giIofKiVY5ipYM2uRP8m9Yxy0fqE2yY';

    try {
        console.log('Tentando inicializar o cliente Supabase a partir do config.js da raiz...');
        
        if (window.supabase) {
            // Cria a instância do cliente e a anexa ao objeto global 'window'
            // para que todos os outros scripts possam acessá-la.
            window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Cliente Supabase inicializado com sucesso.');
        } else {
            // Este erro aparecerá se a biblioteca principal do Supabase não for carregada antes deste script.
            throw new Error("CRÍTICO: A biblioteca principal do Supabase (window.supabase) não foi encontrada!");
        }
    } catch (err) {
        console.error("Falha crítica na inicialização do Supabase:", err);
        // Opcional: Mostrar um erro visual para o usuário
        document.body.innerHTML = '<div style="text-align: center; padding: 50px; font-family: sans-serif;"><h1>Erro Crítico de Configuração</h1><p>Não foi possível conectar ao sistema. Por favor, contate o suporte.</p></div>';
    }

})();