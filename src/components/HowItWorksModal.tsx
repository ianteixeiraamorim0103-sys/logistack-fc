import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, TrendingUp, Handshake, DollarSign, ArrowRight } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  if (!isOpen) return null;

  const steps = [
    {
      title: 'Fornecedor Cadastra (Escala)',
      description: 'Você coloca seu produto aqui e ganha um exército de vendedores. Seu lucro vem no volume de vendas, sem gastar com anúncios.',
      icon: Settings,
      color: 'cyan'
    },
    {
      title: 'Vendedor Minera (Praticidade)',
      description: 'O vendedor escolhe produtos já validados, copia os criativos e foca apenas em vender. Sem estoque próprio.',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      title: 'A Ponte (Segurança)',
      description: 'O Logistack garante a conexão. O vendedor chama o fornecedor no Zap oficial, passa o pedido e todo mundo ganha sua parte.',
      icon: Handshake,
      color: 'emerald'
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-[#0f172a]/70 border border-slate-700/50 rounded-[2.5rem] shadow-2xl overflow-hidden backdrop-blur-xl"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-700/50 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">O Jogo do Logistack</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Como transformamos logística em lucro</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-800/50 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-6 items-start group">
                <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center bg-${step.color}-600/10 border border-${step.color}-500/20 text-${step.color}-500 group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-black uppercase">Passo 0{i+1}</span>
                    {step.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-emerald-600/20 to-cyan-600/20 border border-emerald-500/30 p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <DollarSign size={80} className="text-emerald-400" />
            </div>
            <div className="relative z-10">
              <h4 className="text-emerald-400 font-black uppercase tracking-widest text-[10px] mb-3">Conclusão de Mercado</h4>
              <p className="text-white text-xl font-black italic tracking-tight leading-snug">
                "💰 Ganho Real: Fornecedor gira estoque + Vendedor ganha comissão + Logistack garante a elite."
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 bg-white text-slate-900 font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            Entendi, Vamos Lucrar <ArrowRight size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
