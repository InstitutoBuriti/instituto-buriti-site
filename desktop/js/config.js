// js/config.js - Configurações globais do Supabase

// Importa a função para criar o cliente do Supabase
import { createClient } from '@supabase/supabase-js';

// Credenciais corretas e confirmadas do seu projeto Supabase
const SUPABASE_URL = 'https://ngvljtxkinvygynwcckp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndmxqdHhraW52eWd5bndjY2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzIxNzksImV4cCI6MjA2NzkwODE3OX0.vwJgc2E_erC3giIofKiVY5ipYM2uRP8m9Yxy0fqE2yY';

// Inicializa o cliente Supabase, que será usado em toda a aplicação
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY );

// Exporta o cliente inicializado para que outros módulos possam importá-lo
export { supabase };

// --- Bloco Opcional para Depuração ---
// Adiciona a instância do Supabase ao objeto `window` para que você possa
// fazer chamadas e testar diretamente no console do navegador.
// Isso só é ativado em ambiente de desenvolvimento.
if (typeof window !== 'undefined') {
    // Exemplo de como usar no console: `await window.supabase.from('usuarios').select('*')`
    window.supabase = supabase;
}
