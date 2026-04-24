import { motion } from 'motion/react';
import { Lock, CreditCard, Sparkles, AlertTriangle } from 'lucide-react';

interface SubscriptionGateProps {
  onActivate: () => void;
}

export default function SubscriptionGate({ onActivate }: SubscriptionGateProps) {
  const handleActivate = () => {
    const message = encodeURIComponent('Olá! Quero ativar minha assinatura anual na Logistack.');
    window.open(`https://wa.me/5577981531398?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-[#1e293b] border-2 border-amber-500/30 rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative space-y-6">
          <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500 border border-amber-500/20">
            <Lock size={48} className="animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Seu Prazo de Teste Expirou</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Acesso à Vitrine e Gestão Bloqueado</p>
          </div>

          <p className="text-slate-500 text-sm leading-relaxed font-medium">
            Sua vitrine da Logistack atingiu o limite de 7 dias gratuitos. Para continuar minerando os melhores produtos e faturando alto, ative sua assinatura vitalícia abaixo.
          </p>

          <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                <Sparkles size={20} />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-white uppercase tracking-tight">Plano Vitalício</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sem mensalidade</p>
              </div>
            </div>
            <p className="text-xl font-black text-white font-mono">R$ 30,00</p>
          </div>

          <button 
            onClick={handleActivate}
            className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-3"
          >
            <CreditCard size={18} />
            Ativar minha vitrine agora
          </button>

          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
            Liberação imediata via PIX ou Cartão
          </p>
        </div>
      </motion.div>
    </div>
  );
}
