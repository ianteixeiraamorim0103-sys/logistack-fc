import { motion } from 'motion/react';
import { MessageCircle, ShieldCheck, Zap, Star, Shield } from 'lucide-react';

export default function ActivateAccountView() {
  const handleWhatsApp = () => {
    window.open('https://w.app/div2yp', '_blank');
  };

  const benefits = [
    { icon: <Zap size={18} />, title: "Vendas Ilimitadas", desc: "Remova o limite de 5 vendas por mês." },
    { icon: <Star size={18} />, title: "Suporte VIP", desc: "Canal direto com nossa equipe de suporte." },
    { icon: <Shield size={18} />, title: "Selo de Verificado", desc: "Destaque seus produtos na vitrine oficial." },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-widest">
          <ShieldCheck size={16} />
          Conta em Modo Demonstração
        </div>
        <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Ativar Conta Logistack</h2>
        <p className="text-slate-400 max-w-xl mx-auto font-medium">
          Sua conta está atualmente limitada. Para liberar todo o potencial do Logistack e começar a escalar sua operação, mude para o Plano Profissional agora.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {benefits.map((b, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#1e293b] border border-slate-800 p-6 rounded-3xl space-y-3"
          >
            <div className="w-10 h-10 bg-blue-600/20 text-blue-500 rounded-xl flex items-center justify-center">
              {b.icon}
            </div>
            <h4 className="text-white font-bold">{b.title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">{b.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border-2 border-blue-600/30 p-10 rounded-[2.5rem] text-center space-y-8 relative overflow-hidden group shadow-2xl"
      >
        {/* Abstract shapes for background */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-colors" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-600/5 rounded-full blur-3xl" />
        
        <div className="space-y-4 relative z-10">
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Fale com nosso Gerente de Contas</h3>
          <p className="text-slate-400 font-medium max-w-sm mx-auto">
            A ativação é feita de forma manual e imediata após o contato. Clique no botão abaixo para iniciar.
          </p>
        </div>

        <button 
          onClick={handleWhatsApp}
          className="relative z-10 inline-flex items-center gap-3 px-10 py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95 group"
        >
          <MessageCircle size={24} className="group-hover:rotate-12 transition-transform" />
          Ativar Via WhatsApp
        </button>

        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          Resposta imediata • Ativação em menos de 5 minutos
        </p>
      </motion.div>
    </div>
  );
}
