import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, ShieldCheck, Truck, UserPlus, User, Briefcase, Handshake } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
  onLogin: (userType: 'afiliado' | 'produtor') => void;
  forcedType?: 'afiliado' | 'produtor' | null;
}

export default function LoginPage({ onLogin, forcedType }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [userType, setUserType] = useState<'afiliado' | 'produtor'>(forcedType || 'afiliado');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        // Trava de 10 vagas para afiliados
        if (userType === 'afiliado') {
          const { data: existingAffiliates, error: countError } = await supabase
            .from('profiles')
            .select('id')
            .eq('tipo_usuario', 'afiliado');
          
          if (countError) {
            alert('Erro ao verificar vagas. Tente novamente.');
            return;
          }
          
          if (existingAffiliates && existingAffiliates.length >= 10) {
            alert('Vagas esgotadas para o grupo VIP. Entre na lista de espera.');
            return;
          }
        }
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: senha
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          // Update manual na tabela profiles para evitar erro 422
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              email: email,
              telefone: whatsapp, // Salvar WhatsApp na coluna telefone
              tipo_usuario: userType, // Forçar tipo_usuario como 'afiliado'
              status_pagamento: 'pendente'
            });

          if (profileError) throw profileError;
          onLogin(userType);
        }
      } else {
        // Login único - sistema identifica automaticamente o tipo
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: senha,
        });

        if (signInError) throw signInError;

        if (authData.user) {
          // Buscar tipo do usuário no banco
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('tipo_usuario')
            .eq('id', authData.user.id)
            .single();

          if (profileError) {
            // Fallback: se não encontrar perfil, verificar nos metadados do auth
            const userType = authData.user.user_metadata?.tipo_usuario || 'afiliado';
            onLogin(userType as 'afiliado' | 'produtor');
            return;
          }
          
          // Redirecionar baseado no tipo encontrado no banco
          onLogin(profile.tipo_usuario as 'afiliado' | 'produtor');
        }
      }
    } catch (err: any) {
      alert(err.message);
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
            {forcedType === 'produtor' ? 'Portal do Produtor' : forcedType === 'afiliado' ? 'Portal do Afiliado' : 'Acesso ao Ecossistema'}
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
            {mode === 'signup' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Eu sou um:</label>
                  <select
                    value={userType}
                    onChange={(e) => setUserType(e.target.value as 'afiliado' | 'produtor')}
                    className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-600/40 transition-all font-medium"
                  >
                    <option value="produtor">Produtor</option>
                    <option value="afiliado">Afiliado</option>
                  </select>
                </div>
              )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail (Gmail)</label>
                <input
                  required
                  type="email"
                  placeholder="Seu E-mail do Gmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-600/40 transition-all font-medium"
                />
              </div>

              {mode === 'signup' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Seu WhatsApp (com DDD)</label>
                  <input
                    required
                    type="tel"
                    placeholder="Seu WhatsApp (com DDD)"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-600/40 transition-all font-medium"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Senha</label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
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
                  {mode === 'login' ? 'Entrar no Sistema' : 'Criar Minha Conta'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => window.location.href = '/cadastro-afiliado'}
              className="text-cyan-500 hover:text-cyan-400 text-xs font-black uppercase tracking-widest transition-colors underline underline-offset-2"
            >
              Sou Afiliado e quero me cadastrar
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-[#1e293b] flex items-center justify-center gap-2 text-slate-600 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck size={14} className="text-cyan-500/50" />
            <span>Conexão Segura Logistack</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
