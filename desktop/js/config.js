// config.js - Configurações globais do Supabase

import { createClient } from '@supabase/supabase-js';

// Credenciais do seu projeto Supabase
const SUPABASE_URL = 'https://ngvljtxkinvygynwcckp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndmxqdHhraW52eWd5bndjY2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzIxNzksImV4cCI6MjA2NzkwODE3OX0.vwJgc2E_erC3giIofKiVY5ipYM2uRP8m9Yxy0fqE2yY';

// Inicializa o cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY );

// Exporta o cliente Supabase para ser usado em outros módulos
export { supabase };

// Opcional: Adiciona ao objeto window para fácil acesso no console (apenas para desenvolvimento)
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    window.supabase = supabase;
}
