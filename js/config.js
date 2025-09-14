// /config.js
// VERSÃO DEFINITIVA - ÚNICA FONTE DA VERDADE PARA CONFIGURAÇÃO DO SUPABASE
// Localizado na raiz do projeto. Com proteção contra reinicialização e logs de diagnóstico.

(function() {
    "use strict";

    // Verificação de segurança crucial para prevenir múltiplas inicializações.
    // Isso resolve o warning "Multiple GoTrueClient instances detected".
    if (window.supabaseClient) {
        console.warn("AVISO: Tentativa de reinicializar o cliente Supabase. Operação ignorada.");
        return;
    }

    // Suas credenciais confirmadas do projeto Supabase.
    const SUPABASE_URL = 'https://ngvljtxkinvygynwcckp.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndmxqdHhraW52eWd5bndjY2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzIxNzksImV4cCI6MjA2NzkwODE3OX0.vwJgc2E_erC3giIofKiVY5ipYM2uRP8m9Yxy0fqE2yY';

    try {
        // Verifica se a biblioteca principal do Supabase foi carregada via CDN.
        if (!window.supabase) {
            throw new Error("CRÍTICO: A biblioteca principal do Supabase (supabase-js) não foi carregada. Verifique o link da CDN no seu HTML.");
        }
        
        console.log("Iniciando o cliente Supabase a partir de /config.js (raiz)...");
        
        // Cria a instância do cliente e a anexa ao objeto global 'window'
        // para que todos os outros scripts (auth.js, login.js) possam acessá-la.
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        console.log('✅ SUCESSO: Cliente Supabase inicializado e pronto para uso.');

    } catch (err) {
        console.error("❌ ERRO FATAL: Falha crítica na inicialização do Supabase.", err.message);
        // Em caso de falha, impede a interação com a página e avisa o usuário.
        document.body.innerHTML = '<div style="text-align: center; padding: 50px; font-family: sans-serif;"><h1>Erro Crítico de Configuração</h1><p>Não foi possível conectar ao sistema de autenticação. Por favor, contate o suporte técnico.</p></div>';
    }

})();