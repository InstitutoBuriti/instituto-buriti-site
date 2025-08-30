// js/config.js - Configurações globais do Supabase para CDN

// Credenciais corretas e confirmadas do seu projeto Supabase
const SUPABASE_URL = 'https://ngvljtxkinvygynwcckp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndmxqdHhraW52eWd5bndjY2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzIxNzksImV4cCI6MjA2NzkwODE3OX0.vwJgc2E_erC3giIofKiVY5ipYM2uRP8m9Yxy0fqE2yY';

// Inicializa o cliente Supabase usando o CDN (window.supabase)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exporta o cliente para uso global
window.supabaseClient = supabaseClient;

// Também mantém compatibilidade com window.supabase
window.supabase.client = supabaseClient;

// Log para confirmar inicialização
console.log('Supabase client inicializado via CDN');

// CACHE BUSTER CDN: 30-08-2025-17-35-CDN-FIX

