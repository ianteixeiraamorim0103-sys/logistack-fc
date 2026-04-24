import { createClient } from '@supabase/supabase-js';

// CONFIGURAÇÃO DIRETA - CORRIGINDO ERRO "No API key found"
const supabaseUrl = 'https://vroxxpzceusbyrfjhptu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyb3h4cHpjZXVzYnlyZmpocHR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDEwNTk0MCwiZXhwIjoyMDg5NjgxOTQwfQ.c637d3xUPs_BIJIeTR_ITyHbtVgD0mwKXavZlR34rMI';

console.log('🔌 Configurando Supabase com chaves diretas para corrigir API Key...');
console.log('URL do Banco:', supabaseUrl);
console.log('Chave sendo usada:', supabaseAnonKey);

// Inicializa o cliente Supabase com as chaves diretas
console.log('🔌 Tentando conectar ao banco de dados Logistack...');
console.log('🔑 URL:', supabaseUrl);
console.log('🔑 Key presente:', supabaseAnonKey ? 'SIM' : 'NÃO');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
  db: { schema: 'public' },
  global: { 
    headers: { 'x-my-custom-header': 'logistack-v1' } 
  }
});

if (supabase) {
  console.log('📡 Supabase Client inicializado com sucesso.');
} else {
  console.error('❌ Falha na inicialização do Supabase: Chaves ausentes.');
}

export async function checkSupabaseConnection() {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('produtos').select('id').limit(1);
    if (error) throw error;
    console.log('✅ Conexão Corrigida!');
    return true;
  } catch (err) {
    console.warn('Supabase connection check failed:', err);
    return false;
  }
}
