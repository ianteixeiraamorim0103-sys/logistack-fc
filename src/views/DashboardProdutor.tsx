import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, Users, ArrowUpRight, TrendingUp, HelpCircle, Clock } from 'lucide-react';
import HowItWorksModal from '../components/HowItWorksModal';
import { supabase } from '../lib/supabase';

interface MetricState {
  totalActive: number;
  totalPending: number;
  recentProducts: any[];
  loading: boolean;
}

export default function DashboardProdutor() {
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [metrics, setMetrics] = useState<MetricState>({
    totalActive: 0,
    totalPending: 0,
    recentProducts: [],
    loading: true
  });

  useEffect(() => {
    async function fetchDashboardMetrics() {
      if (!supabase) return;

      try {
        // Busca contagem de produtos ativos
        const { count: activeCount } = await supabase
          .from('produtos')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'ativo');

        // Busca contagem de produtos pendentes
        const { count: pendingCount } = await supabase
          .from('produtos')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pendente');

        // Busca as 5 movimentações mais recentes (produtos adicionados)
        const { data: recent } = await supabase
          .from('produtos')
          .select('id, nome, created_at, status')
          .order('created_at', { ascending: false })
          .limit(5);

        setMetrics({
          totalActive: activeCount || 0,
          totalPending: pendingCount || 0,
          recentProducts: recent || [],
          loading: false
        });
      } catch (error) {
        console.error('Erro ao carregar métricas:', error);
        setMetrics(prev => ({ ...prev, loading: false }));
      }
    }

    fetchDashboardMetrics();
  }, []);
  
  const stats = [
    { label: 'Total em Estoque', value: metrics.totalActive.toString(), type: 'emerald', detail: 'Produtos Ativos' },
    { label: 'Pedidos Pendentes', value: metrics.totalPending.toString(), type: 'amber', detail: 'Aguardando Aprovação' },
    { label: 'Eficiência', value: '100%', type: 'blue', detail: 'Aguardando Dados' },
  ];

  return (
    <div className="space-y-6">
      <header className="mb-10">
        <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic select-none">
          Painel <span className="text-slate-500">Logi</span><span className="text-cyan-500">stack</span>
        </h2>
        <p className="text-cyan-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1 ml-1 opacity-70">Acesso Premium • Ecossistema Logistack</p>
      </header>

      <div className="flex justify-start">
        <button 
          onClick={() => setIsHowItWorksOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 rounded-xl text-slate-300 text-xs font-bold transition-all active:scale-95 group"
        >
          <HelpCircle size={16} className="text-blue-500 group-hover:rotate-12 transition-transform" />
          ❓ Como o Logistack funciona?
        </button>
      </div>

      <HowItWorksModal 
        isOpen={isHowItWorksOpen} 
        onClose={() => setIsHowItWorksOpen(false)} 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="card p-5"
          >
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-3xl font-bold mt-2 text-white">
              {metrics.loading ? '...' : stat.value}
            </h3>
            <p className={`text-[10px] mt-2 flex items-center gap-1 font-bold uppercase tracking-widest ${
              stat.type === 'emerald' ? 'text-emerald-400' : 
              stat.type === 'amber' ? 'text-amber-400' : 'text-blue-400'
            }`}>
              {stat.detail}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/30">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
              <Clock size={14} className="text-blue-500" /> Movimentações Recentes
            </h4>
          </div>
          <div className="divide-y divide-slate-800">
            {metrics.recentProducts.length > 0 ? (
              metrics.recentProducts.map((product) => {
                const date = new Date(product.created_at);
                const timeAgo = date.toLocaleDateString('pt-BR');
                return (
                  <div key={product.id} className="p-4 flex justify-between items-center hover:bg-slate-800/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${product.status === 'ativo' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{product.nome}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-black">Status: {product.status}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{timeAgo}</span>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center">
                <p className="text-sm text-slate-500 font-medium">Nenhuma movimentação registrada no momento.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
