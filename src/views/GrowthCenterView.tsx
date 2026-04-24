import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Target, Video, CheckCircle2, QrCode, AlertCircle, X, ExternalLink, DollarSign, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  icon: any;
  color: string;
  tags: string[];
}

const SERVICES: Service[] = [
  {
    id: 'ads-vip',
    title: 'Tráfego Pago VIP',
    description: 'Gerenciamos seus anúncios no Facebook/Instagram para atrair compradores reais e escaláveis.',
    price: 20.00,
    icon: Target,
    color: 'from-blue-600 to-cyan-500',
    tags: ['ROI ALTO', 'CONVERSÃO']
  },
  {
    id: 'creative-video',
    title: 'Vídeos Criativos TikTok/Reels',
    description: 'Criamos vídeos virais do seu produto focados em retenção para o tráfego orgânico ou pago.',
    price: 10.00,
    icon: Video,
    color: 'from-purple-600 to-pink-500',
    tags: ['VIRAL', 'ENGANJAMENTO']
  }
];

export default function GrowthCenterView({ userType, onNavigate }: { userType: string; onNavigate: (tab: string) => void }) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [productLink, setProductLink] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPix, setShowPix] = useState(false);

  const handleContract = async (e: any) => {
    e.preventDefault();
    if (!selectedService || !supabase) return;

    setIsSubmitting(true);
    try {
      let message = '';
      if (selectedService.id === 'ads-vip') {
        message = encodeURIComponent('Olá! Quero contratar o serviço de tráfego pago para meu produto.');
      } else if (selectedService.id === 'creative-video') {
        message = encodeURIComponent('Olá! Quero que você crie os vídeos para o meu produto.');
      } else {
        message = encodeURIComponent(`Olá! Gostaria de saber mais sobre o serviço: ${selectedService.title}`);
      }
      
      window.open(`https://wa.me/5577981531398?text=${message}`, '_blank');
      closeModal();
    } catch (err: any) {
      alert('Erro ao redirecionar para o WhatsApp: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setSelectedService(null);
    setProductLink('');
    setNotes('');
  };

  if (userType !== 'produtor') {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
        <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-600 border border-slate-700">
          <Rocket size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Central de Crescimento</h2>
          <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-xs max-w-xs">Esta área é exclusiva para produtores que desejam escalar suas vendas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
          <Rocket className="text-cyan-500 animate-pulse" size={32} />
          Impulsionar Vendas
        </h2>
        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Escale seu negócio com serviços profissionais de elite</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {SERVICES.map((service) => (
          <motion.div
            key={service.id}
            whileHover={{ y: -8 }}
            className="group relative bg-[#1e293b] border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all hover:border-cyan-500/30"
          >
            <div className={`h-32 bg-gradient-to-br ${service.color} opacity-20 group-hover:opacity-30 transition-opacity`} />
            
            <div className="p-10 -mt-20 space-y-6">
              <div className={`w-20 h-20 bg-gradient-to-br ${service.color} rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/20`}>
                <service.icon size={36} className="text-white" />
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  {service.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{service.title}</h3>
                <p className="text-slate-400 font-medium text-sm leading-relaxed">{service.description}</p>
              </div>

              <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Investimento</p>
                  <p className="text-3xl font-black text-white font-mono">R$ {service.price.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => setSelectedService(service)}
                  className={`px-8 py-4 bg-gradient-to-r ${service.color} text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:brightness-110 active:scale-95 transition-all`}
                >
                  Contratar Agora
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal de Contratação */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 sm:p-10 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-xl bg-[#0f172a] border border-slate-700 rounded-[3rem] overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={closeModal}
                className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

               <div className="p-10 sm:p-12 space-y-8">
                  <div className="space-y-2">
                     <div className={`w-12 h-12 bg-gradient-to-br ${selectedService.color} rounded-xl flex items-center justify-center mb-4`}>
                      <selectedService.icon size={24} className="text-white" />
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Confirmar Contratação</h3>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                      Serviço Selecionado: {selectedService.title}
                    </p>
                  </div>

                  <form onSubmit={handleContract} className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Link do Produto</label>
                      <input
                        required
                        type="url"
                        value={productLink}
                        onChange={(e) => setProductLink(e.target.value)}
                        placeholder="Cole o link da Shopee/Página aqui"
                        className="w-full bg-[#1e293b] border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-cyan-500 transition-all outline-none"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Observações (Opcional)</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Instruções específicas para nossa equipe..."
                        className="w-full bg-[#1e293b] border border-slate-800 rounded-2xl px-6 py-4 text-white min-h-[120px] focus:border-cyan-500 transition-all outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-cyan-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? 'Redirecionando...' : (
                        <>
                          <MessageCircle size={20} />
                          CONTINUAR PARA PAGAMENTO
                        </>
                      )}
                    </button>
                  </form>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
