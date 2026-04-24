import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Copy, TrendingUp, RefreshCcw, ExternalLink, Image as ImageIcon, Trash2, Search, Share2, ShieldCheck, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SuggestProductModal from '../components/SuggestProductModal';

interface Product {
  id: string;
  name: string;
  category: string;
  cost: number;
  price: number;
  image: string;
  description: string;
  link_externo?: string;
  whatsapp_suporte?: string;
  cliques?: number;
}

export default function ProductsView({ userType }: { userType: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'vitrine' | 'links'>('vitrine');
  const [filter, setFilter] = useState('Todos');
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [affiliateName, setAffiliateName] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['Todos', 'Casa & Estilo de Vida', 'Beleza', 'Suplementos', 'Outros'];

  // Personalização da Vitrine via URL (ex: /vitrine/ian)
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/vitrine/')) {
      const name = path.split('/vitrine/')[1]?.split('/')[0];
      if (name) {
        const decodedName = decodeURIComponent(name);
        setAffiliateName(decodedName);
        document.title = `Vitrine de ${decodedName} | Logistack`;
      }
    } else {
      document.title = 'Vitrine Geral | Logistack';
    }
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      if (!supabase) return;

      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('publicado', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setProducts(data.map(item => ({
          id: item.id,
          name: item.nome,
          price: item.preco_sugerido || 0,
          category: item.categoria || 'Outros',
          cost: item.preco_custo || 0,
          image: item.imagem_url || '',
          description: item.descricao,
          link_externo: item.link_externo,
          whatsapp_suporte: item.whatsapp_suporte,
          cliques: item.cliques || 0
        })));
      }
    } catch (err: any) {
      console.error('Erro ao buscar produtos:', err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const registrarClique = async (produtoId: string) => {
    const product = products.find(p => p.id === produtoId);
    if (!product) return;

    const novoTotal = (product.cliques || 0) + 1;

    // Local state update (optimistic)
    setProducts(prev => prev.map(p => p.id === produtoId ? { ...p, cliques: novoTotal } : p));

    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // 1. Atualiza total global no produto
        await supabase
          .from('produtos')
          .update({ cliques: novoTotal })
          .eq('id', produtoId);

        // 2. Registra conexão/clique do afiliado específico
        if (user && userType === 'afiliado') {
          await supabase
            .from('cliques_afiliados')
            .upsert({ 
              afiliado_id: user.id, 
              produto_id: produtoId,
              cliques: 1 // No dashboard do afiliado podemos somar ou apenas contar registros
            }, { onConflict: 'afiliado_id,produto_id' });
        }
      } catch (e) {
        console.error('Erro ao registrar clique:', e);
      }
    }
  };

  const handleCopy = (product: Product) => {
    const text = `📦 ${product.name}\n\n📝 ${product.description}\n\n💰 Valor Sugerido: R$ ${product.price.toFixed(2)}\n\n🔗 Compre Aqui: ${product.link_externo || 'Link pendente'}`;
    navigator.clipboard.writeText(text);
    setCopyingId(product.id);
    setTimeout(() => setCopyingId(null), 2000);
  };

  const handleBuy = async (product: Product) => {
    if (!product.link_externo) {
      alert('Link da Shopee não disponível no momento.');
      return;
    }
    
    // Dispara o registro de clique
    await registrarClique(product.id);
    
    // Abre o link
    window.open(product.link_externo, '_blank');
  };

  const handleAfiliarse = (product: Product) => {
    // Abre direto o link do produtor sem validações
    window.open(product.link_externo, '_blank');
  };

  const handleSupportWhatsApp = (product: Product) => {
    const phone = product.whatsapp_suporte || '5577981531398';
    const text = `Olá, tenho uma dúvida sobre o produto ${product.name} na Logistack.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const deleteProduct = async (id: string) => {
    if (userType !== 'produtor') return;
    if (!window.confirm('Deseja apagar este produto permanentemente?')) return;
    
    try {
      const { error } = await supabase.from('produtos').delete().eq('id', id);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 pb-12 relative animate-in fade-in duration-500">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            {affiliateName ? `Vitrine de ${affiliateName}` : 'Vitrine Pública'}
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">
            {affiliateName ? 'Curadoria exclusiva para sua operação' : 'Mineramos os melhores itens para você lucrar'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchProducts}
            className="p-3 bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all active:rotate-180"
            title="Sincronizar Vitrine"
          >
            <RefreshCcw size={18} />
          </button>
          
          {userType === 'produtor' && (
            <button 
              onClick={() => setIsSuggestModalOpen(true)}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-cyan-600/20 active:scale-95"
            >
              <Plus size={20} />
              Novo Produto
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-6">
        {/* Barra de Pesquisa Otimizada */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-500 transition-colors">
            <Search size={20} />
          </div>
          <input 
            type="text"
            placeholder="O que você está procurando hoje?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1e293b]/50 border-2 border-slate-800 rounded-[2rem] pl-14 pr-6 py-5 text-white placeholder:text-slate-600 focus:border-cyan-500 focus:bg-[#1e293b] outline-none transition-all shadow-xl font-bold"
          />
        </div>

              </div>

      {viewMode === 'vitrine' ? (
        <>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-cyan-600/10 border-t-cyan-500 rounded-full animate-spin" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Alinhando satélites da operação...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
              <AnimatePresence mode="popLayout">
                {products
                  .filter(p => (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                               p.description.toLowerCase().includes(searchTerm.toLowerCase())))
                  .map((product) => {
                    return (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group relative flex flex-col bg-[#1e293b] border border-slate-800 rounded-[2.5rem] overflow-hidden hover:border-cyan-500 transition-all duration-300 shadow-2xl"
                      >
                        {/* Trust Badge */}
                        <div className="absolute top-4 left-4 z-10">
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">
                            <ShieldCheck size={12} />
                            Oferta Verificada
                          </span>
                        </div>

                        <div className="relative aspect-square overflow-hidden bg-slate-900">
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-4xl">📦</span>
                            </div>
                          )}
                          
                          
                          <div className="absolute top-4 right-4 flex flex-col gap-2">
                             {userType === 'produtor' && (
                              <button 
                                onClick={() => deleteProduct(product.id)}
                                className="p-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-full transition-all backdrop-blur-md"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleSupportWhatsApp(product)}
                              className="p-3 bg-emerald-500 text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                              title="Conversar com Produtor"
                            >
                              <MessageCircle size={18} />
                              <span className="text-[10px] font-black uppercase tracking-widest pr-1">Dúvidas</span>
                            </button>
                          </div>
                        </div>

                        <div className="p-6 space-y-4 flex-1 flex flex-col">
                          <div>
                            <h3 className="text-xl font-black text-white leading-tight mb-1 uppercase tracking-tighter line-clamp-2">{product.name}</h3>
                            <p className="text-slate-500 text-xs font-bold line-clamp-1">{product.description}</p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
                            <div>
                               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Preço Sugerido</p>
                               <p className="text-2xl font-black text-white font-mono tracking-tighter">R$ {product.price.toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-[8px] font-black text-cyan-500 uppercase tracking-widest">✨ NOVO PRODUTO</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleAfiliarse(product)}
                            className="w-full py-5 bg-cyan-500 hover:bg-cyan-400 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-2xl shadow-cyan-500/30 flex items-center justify-center gap-3 active:brightness-110 border-b-4 border-cyan-700"
                          >
                            <ExternalLink size={18} />
                            AFILIAR-SE AGORA
                          </button>

                          {userType === 'produtor' && (
                             <button 
                                onClick={() => handleCopy(product)}
                                className="w-full py-3 bg-slate-800/50 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-white transition-all border border-slate-800"
                              >
                                <Copy size={16} /> {copyingId === product.id ? 'Copiado!' : 'Copiar Texto de Venda'}
                              </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            </div>
          )}
        </>
      ) : (
        <div className="bg-[#1e293b] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900/50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                  <th className="px-8 py-6">Produto</th>
                  <th className="px-8 py-6 text-center">Cliques</th>
                  <th className="px-8 py-6 text-right">Link Direto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {products.length > 0 ? products.map((product) => (
                  <tr key={product.id} className="hover:bg-cyan-500/5 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden">
                          <img src={product.image} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-white font-bold text-sm tracking-tight">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="px-3 py-1 bg-cyan-500/10 text-cyan-500 rounded-lg text-lg font-black border border-cyan-500/20 shadow-inner">
                        {product.cliques || 0}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button onClick={() => handleBuy(product)} className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all">
                        <ExternalLink size={18} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="px-8 py-20 text-center text-slate-600 font-bold uppercase tracking-widest text-xs">
                      Nenhum dado registrado nesta operação.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SuggestProductModal 
        isOpen={isSuggestModalOpen} 
        onClose={() => setIsSuggestModalOpen(false)} 
      />
    </div>
  );
}
