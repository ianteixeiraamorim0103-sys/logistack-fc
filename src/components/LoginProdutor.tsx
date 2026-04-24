import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, ShieldCheck, Truck, UserPlus, Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginProdutorProps {
  onLogin: (userType: 'produtor') => void;
}

export default function LoginProdutor({ onLogin }: LoginProdutorProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              tipo_usuario: 'produtor',
            }
          }
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          // Usar upsert para evitar duplicate key - se já existe, atualiza, senão insere
          const profileData = {
            id: authData.user.id,
            email: email,
            tipo_usuario: 'produtor'
          };
          
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert(profileData);

          // Se for duplicate key (23505), usuário já existe - seguir em frente
          if (profileError && profileError.code === '23505') {
            console.log('📝 Perfil já existe, seguindo em frente...');
            // Não mostrar erro, apenas redirecionar
          } else if (profileError) {
            throw profileError;
          }
          
          console.log('✅ Cadastro/Login de produtor concluído!');
          onLogin('produtor');
        }
      } else {
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (authData.user) {
          // BLOQUEIO DE SEGURANÇA: Verificar tipo_usuario no banco
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('tipo_usuario')
            .eq('id', authData.user.id)
            .single();

          if (profileError) {
            // Se não encontrar perfil, deslogar e bloquear
            await supabase.auth.signOut();
            throw new Error('Perfil não encontrado. Contate o suporte.');
          }
          
          // TRAVA DE SEGURANÇA: Verificar se é realmente produtor
          if (profile.tipo_usuario !== 'produtor') {
            // Deslogar imediatamente
            await supabase.auth.signOut();
            throw new Error('Acesso negado. Você não é um Produtor. Use a porta de Afiliados: /login-afiliado');
          }
          
          // Se for produtor, permitir acesso
          onLogin('produtor');
        }
      }
    } catch (err: any) {
      // Debug detalhado no console
      console.error('ERRO NO CADASTRO DE PRODUTOR:', err);
      console.error('Tipo do erro:', typeof err);
      console.error('Mensagem completa:', err.message);
      console.error('Detalhes do erro:', err);
      
      // Mostrar erro na tela para debug
      alert(`ERRO: ${err.message}\n\nVerifique o console do navegador (F12) para mais detalhes.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 font-sans">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter italic uppercase select-none">
            LOGI<span className="text-cyan-500">STACK</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            Portal do Produtor
          </p>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
          <div className="flex bg-[#020617] p-1 rounded-2xl mb-8">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}
            >
              Acessar
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="flex flex-col items-center gap-3 p-4 rounded-2xl border-2 bg-cyan-600/10 border-cyan-500 text-white">
                    <Briefcase size={24} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Conta de Produtor</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@logistack.com"
                  className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-600/40 transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Senha</label>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-600/40 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg shadow-cyan-600/20 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
                  {mode === 'login' ? 'Entrar como Produtor' : 'Criar Conta de Produtor'}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#1e293b] flex items-center justify-center gap-2 text-slate-600 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck size={14} className="text-cyan-500/50" />
            <span>Conexão Segura Logistack</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
