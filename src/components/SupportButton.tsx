import { motion } from 'motion/react';
import { MessageCircle } from 'lucide-react';

export default function SupportButton() {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => window.open('https://wa.me/5577981531398', '_blank')} 
      className="fixed bottom-8 right-8 z-[100] bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-4 rounded-full shadow-[0_10px_40px_rgba(16,185,129,0.4)] flex items-center gap-3 font-black uppercase tracking-widest text-[10px] transition-all border-4 border-[#020617]"
    >
      <div className="flex items-center gap-2 border-r border-white/20 pr-3 mr-1">
        <img 
          src="https://vroxxpzceusbyrfjhptu.supabase.co/storage/v1/object/public/public-assents/WhatsApp%20Image%202026-04-23%20at%2014.15.15%20(1).jpeg" 
          alt="Logistack" 
          className="h-6 w-auto rounded" 
        />
      </div>
      <div className="flex items-center gap-2">
        <MessageCircle size={18} />
        <span>Suporte Humano</span>
      </div>
    </motion.button>
  );
}
