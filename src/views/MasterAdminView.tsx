import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit2, LayoutDashboard, ShoppingBag, Users, Save, AlertCircle, ExternalLink, Package, DollarSign, Image as ImageIcon, Link, Lock, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  nome: string;
  preco_custo: number;
  preco_sugerido: number;
  imagem_url: string;
  whatsapp_fornecedor: string;
  criativos_url?: string;
  descricao: string;
  categoria: string;
  is_locked: boolean;
  status?: string;
}

// TODO: No futuro, proteger esta rota com senha de admin.
export default function MasterAdminView({ userType }: { userType: string }) {
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nome: '',
    imagem_url: '',
    preco_custo: '',
    preco_sugerido: '',
    whatsapp_fornecedor: '',
    criativos_url: '',
    descricao: '',
    categoria: 'Casa & Estilo de Vida',
    is_locked: false
  });

  useEffect(() => {
    if (userType === 'produtor') {
      fetchAdminProducts();
    }
  }, [userType]);

  if (userType !== 'produtor') {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
          <Lock size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Acesso Restrito</h2>
          <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-xs">Apenas produtores podem acessar esta área.</p>
        </div>
      </div>
    );
  }

  async function fetchAdminProducts() {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        alert('Erro de conexão: Verifique a internet ou as chaves do banco');
        throw error;
      }
      setProdutos(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Falha ao carregar produtos. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      alert('Supabase não configurado! Verifique as chaves em Secrets.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('produtos')
        .insert([{
          nome: formData.nome,
          imagem_url: formData.imagem_url,
          preco_custo: parseFloat(formData.preco_custo),
          preco_sugerido: parseFloat(formData.preco_sugerido),
          whatsapp_fornecedor: formData.whatsapp_fornecedor,
          criativos_url: formData.criativos_url,
          descricao: formData.descricao,
          categoria: formData.categoria,
          is_locked: formData.is_locked,
          status: 'ativo'
        }]);

      if (error) throw error;

      // Reset form and refresh list
      setFormData({
        nome: '',
        imagem_url: '',
        preco_custo: '',
        preco_sugerido: '',
        whatsapp_fornecedor: '',
        criativos_url: '',
        descricao: '',
        categoria: 'Eletrônicos',
        is_locked: false
      });
      fetchAdminProducts();
      alert('Produto cadastrado com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  };

  const apagarProduto = async (id: string) => {
    console.log('Testando conexão com Supabase...');
    console.log('Tentando apagar o produto ID:', id);
    if (!supabase) return;

    if (!window.confirm('Deseja apagar este produto permanentemente?')) return;

    const { error } = await supabase.from('produtos').delete().eq('id', id);
    
    if (error) {
      console.error('Erro detalhado do Supabase:', error);
      alert('Erro do banco: ' + error.message);
    } else {
      console.log('Sucesso! Deletado.');
      alert('Apagado com sucesso! A página vai recarregar.');
      window.location.reload();
    }
  };

  const toggleLock = async (product: Product) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('produtos')
        .update({ is_locked: !product.is_locked })
        .eq('id', product.id);
      
      if (error) throw error;
      setProdutos(produtos.map(p => p.id === product.id ? { ...p, is_locked: !p.is_locked } : p));
    } catch (err: any) {
      alert(`Erro ao atualizar status: ${err.message}`);
    }
  };

  const publishProduct = async (id: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('produtos')
        .update({ publicado: true, status: 'ativo' })
        .eq('id', id);
      
      if (error) throw error;
      
      setProdutos(produtos.map(p => p.id === id ? { ...p, publicado: true, status: 'ativo' } : p));
      
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none animate-in fade-in duration-300';
      overlay.innerHTML = `
        <div className="bg-emerald-600 text-white px-8 py-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in slide-in-from-bottom-10 duration-500">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black uppercase tracking-tighter">Produto Publicado!</p>
            <p className="text-sm font-bold opacity-80 uppercase tracking-widest mt-1">Já disponível na vitrine</p>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      
      setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 500);
      }, 2500);

    } catch (err: any) {
      alert(`Erro ao aprovar: ${err.message}`);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header Admin */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center gap-3 italic select-none">
            LOGI<span className="text-cyan-500">STACK</span> <span className="text-sm font-black text-slate-500 border-l border-slate-700 pl-3 not-italic">ADM</span>
          </h2>
          <p className="text-slate-400 mt-2 font-medium tracking-tight">Controle total do ecossistema de fornecimento.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-yellow-400/10 border border-yellow-400/20 px-6 py-4 rounded-3xl text-center">
            <p className="text-[10px] text-yellow-400 font-black uppercase tracking-widest mb-1">Produtos Ativos</p>
            <p className="text-2xl font-black text-white">{produtos.length}</p>
          </div>
          <div className="bg-purple-600/10 border border-purple-600/20 px-6 py-4 rounded-3xl text-center">
            <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest mb-1">Vendedores VIP</p>
            <p className="text-2xl font-black text-white">42</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Formulário de Cadastro */}
        <div className="lg:col-span-1">
          <div className="bg-[#1e293b] border-2 border-yellow-400/30 rounded-3xl p-8 sticky top-24">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Plus className="text-yellow-400" /> Cadastrar Produto
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2">
                  <Package size={14} /> Nome do Produto
                </label>
                <input 
                  required
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Ex: Drone 4K Pro"
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-yellow-400 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2">
                  <ImageIcon size={14} /> URL da Imagem
                </label>
                <input 
                  required
                  name="imagem_url"
                  value={formData.imagem_url}
                  onChange={handleInputChange}
                  placeholder="https://imagem.com/foto.jpg"
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-yellow-400 transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2">
                    <DollarSign size={14} /> Custo (R$)
                  </label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    name="preco_custo"
                    value={formData.preco_custo}
                    onChange={handleInputChange}
                    placeholder="45.00"
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-yellow-400 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2">
                    Sugestão (R$)
                  </label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    name="preco_sugerido"
                    value={formData.preco_sugerido}
                    onChange={handleInputChange}
                    placeholder="129.90"
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-yellow-400 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2">
                  WhatsApp Fornecedor
                </label>
                <input 
                  required
                  name="whatsapp_fornecedor"
                  value={formData.whatsapp_fornecedor}
                  onChange={handleInputChange}
                  placeholder="Formato: 5511999999999"
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-yellow-400 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2">
                  <Link size={14} /> Link Criativos
                </label>
                <input 
                  name="criativos_url"
                  value={formData.criativos_url}
                  onChange={handleInputChange}
                  placeholder="Drive, TikTok ou Pinterest"
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-yellow-400 transition-all outline-none"
                />
              </div>

              <div className="flex items-center gap-3 py-2">
                <input 
                  type="checkbox"
                  id="is_locked"
                  name="is_locked"
                  checked={formData.is_locked}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded bg-slate-800 border-slate-700 text-yellow-400 focus:ring-yellow-400"
                />
                <label htmlFor="is_locked" className="text-sm font-bold text-white cursor-pointer select-none">
                  Bloquear para Plano Gratuito?
                </label>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 disabled:bg-slate-700 text-slate-900 font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(250,204,21,0.2)] flex items-center justify-center gap-3 active:scale-95"
              >
                {saving ? 'Processando...' : <><Save size={20} /> Salvar no Catálogo</>}
              </button>
            </form>
          </div>
        </div>

        {/* Gestão de Produtos */}
        <div className="lg:col-span-2 space-y-8">
          {/* Solicitações Pendentes */}
          <div className="bg-[#1e293b] border-2 border-blue-500/30 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.1)]">
            <div className="p-8 border-b border-slate-800 bg-blue-500/5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-3 uppercase tracking-tighter">
                <AlertCircle className="text-blue-400" size={20} /> Solicitações Pendentes
              </h3>
              <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full px-2">
                {produtos.filter(p => p.status === 'pendente').length} NOVAS
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#0f172a]/50 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                    <th className="px-8 py-4">Produto</th>
                    <th className="px-8 py-4">Preços</th>
                    <th className="px-8 py-4 text-right">Ações de Curadoria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {produtos.filter(p => p.status === 'pendente').length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-8 py-12 text-center text-slate-500 font-medium">Nenhuma solicitação aguardando.</td>
                    </tr>
                  ) : (
                    produtos.filter(p => p.status === 'pendente').map((p) => (
                      <tr key={p.id} className="hover:bg-blue-500/5 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <img src={p.imagem_url} className="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-slate-700" alt="" />
                            <div>
                              <p className="text-sm font-bold text-white tracking-tight">{p.nome}</p>
                              <p className="text-[10px] text-slate-500 font-medium">{p.categoria}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-white">R$ {p.preco_sugerido?.toFixed(2)}</p>
                          <p className="text-xs text-slate-500">Custo: R$ {p.preco_custo?.toFixed(2)}</p>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button 
                              onClick={() => apagarProduto(p.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-red-500 transition-all active:scale-95 shadow-lg shadow-red-600/20"
                            >
                              <Trash2 size={14} /> Apagar
                            </button>
                            <button 
                              onClick={() => publishProduct(p.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-500 transition-all shadow-lg active:scale-95 animate-pulse"
                            >
                              <CheckCircle2 size={14} /> Confirmar e Publicar na Vitrine
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inventário Ativo */}
          <div className="bg-[#1e293b] border border-slate-800 rounded-3xl overflow-hidden">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-3 uppercase tracking-tighter">
                <ShoppingBag className="text-slate-400" size={20} /> Inventário Ativo (No Ar)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#0f172a]/50 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                    <th className="px-8 py-4">Produto</th>
                    <th className="px-8 py-4">Preços</th>
                    <th className="px-8 py-4">Visibilidade</th>
                    <th className="px-8 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {produtos.filter(p => p.publicado).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center text-slate-500 font-medium">Nenhum produto publicado.</td>
                    </tr>
                  ) : (
                    produtos.filter(p => p.publicado).map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <img src={p.imagem_url} className="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-slate-700" alt="" />
                            <div>
                              <p className="text-sm font-bold text-white tracking-tight">{p.nome}</p>
                              <p className="text-[10px] text-slate-500 font-medium">{p.categoria}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-white">R$ {p.preco_sugerido?.toFixed(2)}</p>
                          <p className="text-xs text-slate-500">Custo: R$ {p.preco_custo?.toFixed(2)}</p>
                        </td>
                        <td className="px-8 py-6">
                          <button 
                            onClick={() => toggleLock(p)}
                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                              p.is_locked 
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            }`}
                          >
                            {p.is_locked ? <><Lock size={12} /> Bloqueado</> : 'Público'}
                          </button>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button 
                              onClick={() => apagarProduto(p.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-red-500 transition-all active:scale-95 shadow-lg shadow-red-600/20"
                            >
                              <Trash2 size={14} /> Apagar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
