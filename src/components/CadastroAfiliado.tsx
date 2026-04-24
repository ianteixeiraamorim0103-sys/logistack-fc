import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, Mail, Phone, Lock, ArrowLeft, CheckCircle2, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CadastroAfiliadoProps {
  onCadastroSucesso: () => void;
  onVoltar: () => void;
}

export default function CadastroAfiliado({ onCadastroSucesso, onVoltar }: CadastroAfiliadoProps) {
  const [formData, setFormData] = useState({
    email: '',
    whatsapp: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    
    // Validar WhatsApp obrigatório
    if (!formData.whatsapp.trim()) {
      alert('WhatsApp é obrigatório para cadastro. Precisamos deste contato para o Suporte Humano.');
      return;
    }
    
    setIsLoading(true);

    try {
      // Trava de 10 vagas para afiliados
      const { data: existingAffiliates, error: countError } = await supabase
        .from('profiles')
        .select('id')
        .eq('tipo_usuario', 'afiliado');
      
      if (countError) {
        alert('Erro ao verificar vagas. Tente novamente.');
        return;
      }
      
      if (existingAffiliates && existingAffiliates.length >= 10) {
        alert('Vagas VIP encerradas.');
        return;
      }

      // Gerar senha temporária automática
      const senhaTemporaria = Math.random().toString(36).slice(-8);

      // Criar usuário no Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: senhaTemporaria,
        options: {
          data: {
            tipo_usuario: 'afiliado'
          }
        }
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        // Atualizar perfil com WhatsApp e tipo_usuario
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: formData.email,
            telefone: formData.whatsapp, // Salvar na coluna telefone
            tipo_usuario: 'afiliado',
            status_pagamento: 'pendente'
          });

        if (profileError) throw profileError;

        setSuccess(true);
        setTimeout(() => {
          onCadastroSucesso();
        }, 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Erro no cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-[2.5rem] p-8 shadow-2xl text-center">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full mx-auto mb-6 flex items-center justify-center">
              <CheckCircle2 className="text-emerald-500" size={40} />
            </div>
            <h2 className="text-2xl font-black text-white mb-4">Cadastro Concluído!</h2>
            <p className="text-slate-400 mb-6">Bem-vindo ao ecossistema Logistack. Redirecionando para seu painel...</p>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3 }}
                className="h-full bg-emerald-500"
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

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
          <button
            onClick={onVoltar}
            className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter italic uppercase select-none">
            LOGI<span className="text-cyan-500">STACK</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            Cadastro de Afiliado VIP
          </p>
          <p className="text-cyan-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 opacity-70">
            Ecossistema Exclusivo • Vagas Limitadas
          </p>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Mail size={14} />
                E-mail do Gmail
              </label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@gmail.com"
                className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-600/40 transition-all font-medium"
              />
              <p className="text-[9px] text-slate-600 ml-1">Será usado como seu login</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Phone size={14} />
                Número do WhatsApp
              </label>
              <input
                required
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="5511999999999"
                className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-600/40 transition-all font-medium"
              />
              <p className="text-[9px] text-slate-600 ml-1">Com DDD (ex: 5511999999999)</p>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-800/30 p-3 rounded-lg">
              <Shield size={14} className="text-emerald-500" />
              <span>Seus dados estão seguros e serão usados apenas para suporte.</span>
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
                  <UserPlus size={20} />
                  Cadastrar
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#1e293b] flex items-center justify-center gap-2 text-slate-600 text-[10px] font-black uppercase tracking-widest">
            <span>🔒</span>
            <span>Conexão Segura • Dados Protegidos</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
