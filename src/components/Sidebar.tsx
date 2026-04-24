import { LayoutDashboard, Package, User, LogOut, CreditCard, Star, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout, userType }: SidebarProps & { userType: string }) {
  // TRAVA DE SEGURANÇA: Menu items baseados no tipo de usuário
  const menuItems = [
    // Dashboard apenas para Produtores
    ...(userType === 'produtor' ? [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, emoji: '🏠' }] : []),
    // Vitrine para ambos
    { id: 'products', label: 'Vitrine', icon: Package, emoji: '📦' },
    // Impulsionar para ambos
    { id: 'growth', label: 'Impulsionar', icon: TrendingUp, emoji: '🚀' },
    // Perfil para ambos
    { id: 'profile', label: 'Perfil', icon: User, emoji: '👤' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col border-r border-slate-800 bg-[#010409] fixed left-0 top-0 h-screen z-50">
      <div className="p-6 mb-4 flex items-center gap-3">
        <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic select-none">
          LOGI<span className="text-cyan-500 underline decoration-cyan-500/30 underline-offset-4">STACK</span>
        </h1>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-bold rounded-xl transition-all ${
              activeTab === item.id
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <span className="text-base">{item.emoji}</span>
            <span>{item.label}</span>
          </button>
        ))}

        {userType === 'produtor' && (
          <div className="pt-6 mt-6 border-t border-slate-800/50 space-y-1">
            <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Administração</p>
            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-widest border border-yellow-400/10 ${
                activeTab === 'admin' 
                  ? 'bg-yellow-400 text-slate-900 shadow-[0_0_20px_rgba(250,204,21,0.2)]' 
                  : 'text-yellow-400/80 hover:bg-yellow-400/5'
              }`}
            >
              <span className="text-base group-hover:scale-125 transition-transform">⚙️</span>
              Gestão Master
            </button>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-black text-white uppercase tracking-tighter border border-slate-600">
            {userType === 'produtor' ? 'PRO' : 'AFI'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-white truncate uppercase tracking-tighter">
              {userType === 'produtor' ? 'Produtor' : 'Afiliado'}
            </p>
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest truncate">Acesso Verificado</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-[10px] font-black text-red-500 rounded-xl transition-all uppercase tracking-widest"
        >
          <LogOut size={14} />
          Sair da Conta
        </button>
      </div>
    </aside>
  );
}

