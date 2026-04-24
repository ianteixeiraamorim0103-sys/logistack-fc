import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, MousePointer2, DollarSign, TrendingUp, HelpCircle, Clock, ExternalLink, Phone, MessageCircle, Save } from 'lucide-react';
import HowItWorksModal from '../components/HowItWorksModal';
import { supabase } from '../lib/supabase';

interface AffiliateMetricState {
  totalAffiliated: number;
  totalClicks: number;
  estimatedCommissions: number;
  recentConnections: any[];
  loading: boolean;
}

export default function DashboardAfiliado() {
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [whatsapp, setWhatsapp] = useState('');
  const [isSavingWhatsApp, setIsSavingWhatsApp] = useState(false);
  const [metrics, setMetrics] = useState<AffiliateMetricState>({
    totalAffiliated: 0,
    totalClicks: 0,
    estimatedCommissions: 0,
    recentConnections: [],
    loading: true
  });

  useEffect(() => {
    async function fetchAffiliateMetrics() {
      if (!supabase) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Simulando a busca de produtos que o afiliado se conectou
        // Assumindo uma tabela 'conexoes_afiliados' que registra quando o afiliado clica em "Afiliar-se"
        // Se ela não existir, vamos tentar buscar da produtos mas filtrada por algo?
        // Na falta de uma tabela real de conexões por enquanto, vamos buscar produtos com cliques > 0 
        // mas o ideal é que essa lógica seja real.
        
        // Vamos tentar buscar de 'cliques_afiliados' (tabela que vamos sugerir/assumir)
        const { data: conexoes, error: connError } = await supabase
          .from('cliques_afiliados')
          .select('*, produtos(*)')
          .eq('afiliado_id', user.id)
          .order('created_at', { ascending: false });

        if (!connError && conexoes) {
          const totalClicks = conexoes.reduce((acc, curr) => acc + (curr.cliques || 1), 0);
          // Comissão estimada baseada em 30% do preço sugerido (exemplo)
          const estimatedCommissions = conexoes.reduce((acc, curr) => {
            const price = curr.produtos?.preco_sugerido || 0;
            return acc + (price * 0.3);
          }, 0);

          setMetrics({
            totalAffiliated: conexoes.length,
            totalClicks: totalClicks,
            estimatedCommissions: estimatedCommissions,
            recentConnections: conexoes,
            loading: false
          });
        } else {
          // Fallback se a tabela não existir ou estiver vazia
          setMetrics(prev => ({ ...prev, loading: false }));
        }

      } catch (error) {
        console.error('Erro ao carregar métricas do afiliado:', error);
        setMetrics(prev => ({ ...prev, loading: false }));
      }
    }

    fetchAffiliateMetrics();

    // Buscar WhatsApp atual do usuário
    async function fetchCurrentWhatsApp() {
      if (!supabase) return;
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('telefone')
          .eq('id', user.id)
          .single();

        if (profile?.telefone) {
          setWhatsapp(profile.telefone);
        }
      } catch (error) {
        console.error('Erro ao buscar WhatsApp:', error);
      }
    }

    // Função para salvar WhatsApp
    const handleSaveWhatsApp = async () => {
      if (!supabase) return;
      if (!whatsapp.trim()) {
        alert('Por favor, digite seu número de WhatsApp.');
        return;
      }

      setIsSavingWhatsApp(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('profiles')
          .update({ telefone: whatsapp })
          .eq('id', user.id);

        if (error) throw error;

        alert('WhatsApp salvo com sucesso!');
      } catch (error: any) {
        alert('Erro ao salvar WhatsApp: ' + error.message);
      } finally {
        setIsSavingWhatsApp(false);
      }
    };

    fetchCurrentWhatsApp();
  }, []);

  const stats = [
    { label: 'Saldo Total', value: `R$ ${(metrics.totalClicks * 5).toFixed(2)}`, type: 'emerald', detail: 'Bônus de R$ 5 por venda', icon: DollarSign },
    { label: 'Produtos Afiliados', value: metrics.totalAffiliated.toString(), type: 'blue', detail: 'Total de Conexões', icon: Package },
    { label: 'Vendas Realizadas', value: metrics.totalClicks.toString(), type: 'amber', detail: 'Cliques Convertidos', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <header className="mb-10">
        <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic select-none">
          Painel <span className="text-slate-500">Afiliado</span><span className="text-cyan-500">stack</span>
        </h2>
        <p className="text-cyan-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1 ml-1 opacity-70">Acesso Elite • Ecossistema Logistack</p>
      </header>

      <div className="flex justify-start">
        <button 
          onClick={() => setIsHowItWorksOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 rounded-xl text-slate-300 text-xs font-bold transition-all active:scale-95 group"
        >
          <HelpCircle size={16} className="text-blue-500 group-hover:rotate-12 transition-transform" />
          ❓ Como o Logistack funciona para Afiliados?
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
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-3xl font-bold mt-2 text-white">
                  {metrics.loading ? '...' : stat.value}
                </h3>
              </div>
              <div className={`p-2 rounded-xl ${
                stat.type === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 
                stat.type === 'amber' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
              }`}>
                <stat.icon size={20} />
              </div>
            </div>
            <p className={`text-[10px] mt-4 flex items-center gap-1 font-bold uppercase tracking-widest ${
              stat.type === 'emerald' ? 'text-emerald-400' : 
              stat.type === 'amber' ? 'text-amber-400' : 'text-blue-400'
            }`}>
              {stat.detail}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/30">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
              <Phone size={14} className="text-emerald-500" /> Meu Suporte / WhatsApp
            </h4>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <MessageCircle size={12} className="text-emerald-500" />
                  Seu WhatsApp para Suporte
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="5511999999999"
                  className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/40 transition-all font-medium"
                />
                <p className="text-[9px] text-slate-600 ml-1">Com DDD (ex: 5511999999999)</p>
              </div>
              <button
                onClick={handleSaveWhatsApp}
                disabled={isSavingWhatsApp}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                {isSavingWhatsApp ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} />
                    Salvar WhatsApp
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden lg:col-span-2">
          <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/30">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
              <Package size={14} className="text-blue-500" /> Vitrine de Produtos
            </h4>
          </div>
          <div className="p-6">
            {metrics.recentConnections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics.recentConnections.map((conn) => {
                  const product = conn.produtos;
                  if (!product) return null;
                  return (
                    <div key={conn.id} className="bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all group cursor-pointer" onClick={() => window.open(product.link_externo, '_blank')}>
                      <div className="aspect-video bg-slate-900 relative overflow-hidden">
                        {product.imagem_url ? (
                          <img src={product.imagem_url} alt={product.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                            <Package size={32} className="text-slate-600" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h5 className="text-white font-bold text-sm mb-2 truncate">{product.nome}</h5>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-slate-400">R$ {product.preco_sugerido?.toFixed(2)}</span>
                          <span className="text-xs font-black text-emerald-500">R$ {(product.preco_sugerido * 0.3).toFixed(2)}</span>
                        </div>
                        <button className="w-full mt-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
                          <ExternalLink size={14} />
                          Acessar Produto
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package size={48} className="text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 font-medium mb-4">Você ainda não se afiliou a nenhum produto.</p>
                <button className="text-[10px] font-black text-cyan-500 uppercase tracking-widest hover:underline">Explorar Vitrine</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
