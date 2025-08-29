// desktop/js/config.js - Configurações do Supabase para Instituto Buriti
// Versão: Desktop
// Data: 29-08-2025

// Configurações do Supabase
const SUPABASE_URL = 'https://xyzcompany.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MjU0ODAwMCwiZXhwIjoxOTU4MTI0MDAwfQ.example_key_here';

// Inicializar cliente Supabase
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exportar para uso global
window.supabaseClient = supabaseClient;

// Log de inicialização
console.log('✅ Supabase configurado para desktop - Instituto Buriti');

// CACHE BUSTER DESKTOP: 29-08-2025-01-21-FINAL

