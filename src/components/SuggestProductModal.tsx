import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, MessageCircle, DollarSign, Image as ImageIcon, Link as LinkIcon, FileText, Send, TrendingUp, Lock, Truck } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SuggestProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuggestProductModal({ isOpen, onClose }: SuggestProductModalProps) {
  const [saving, setSaving] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp_fornecedor: '',
    preco_custo: '',
    preco_sugerido: '',
    imagem_url: '',
    criativos_url: '',
    link_externo: '', // Original (Link de Compra Direta)
    whatsapp_suporte: '', // WhatsApp para dúvidas do afiliado
    descricao: '',
    categoria: 'Casa & Estilo de Vida'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-fill logic
    if (name === 'link_externo' && value.startsWith('http')) {
      handleAutoFill(value);
    }
  };

  const handleAutoFill = async (url: string) => {
    if (formData.nome && formData.imagem_url) return; 
    
    setIsAutoFilling(true);
    // Simulação de detecção de link
    setTimeout(() => {
      const urlLower = url.toLowerCase();
      let autoData: Partial<typeof formData> = {};

      if (urlLower.includes('shopee.com')) {
        autoData = {
          nome: 'Link da Shopee Detectado',
          categoria: 'Eletrônicos',
          imagem_url: '' // Garantir que está vazio para o usuário colar
        };
        console.log('Shopee detectado. Imagem deve ser colada manualmente.');
      } else if (urlLower.includes('mercadolivre.com')) {
        autoData = {
          nome: 'Link do Mercado Livre Detectado',
          categoria: 'Casa',
          imagem_url: '' 
        };
      }

      setFormData(prev => ({
        ...prev,
        ...autoData
      }));
      setIsAutoFilling(false);
    }, 800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação Inteligente: Se tiver link externo, nome e preço sugerido, pode enviar.
    if (!formData.nome || !formData.preco_sugerido || (!formData.descricao && !formData.link_externo)) {
      alert('Por favor, preencha o Nome, Preço e a Descrição (ou Link Externo).');
      return;
    }

    // Proteção Anti-Spam (Bot Check) - Verifica se o formulário foi preenchido rápido demais
    const submitKey = 'last_submit_time';
    const lastSubmit = localStorage.getItem(submitKey);
    const now = Date.now();
    if (lastSubmit && now - parseInt(lastSubmit) < 30000) { // 30 segundos de intervalo
      alert('Por favor, aguarde um momento antes de enviar outro produto.');
      return;
    }

    console.log('🚀 Iniciando envio de sugestão de produto (Link Ext)...', formData);
    setSaving(true);
    setSuccess(false);
    localStorage.setItem(submitKey, now.toString());

    // Timer de segurança para destravar o botão após 10 segundos
    const timeout = setTimeout(() => {
      if (saving) {
        console.error('❌ Tempo limite de 10s atingido no envio.');
        setSaving(false);
        alert('O envio está demorando muito. Verifique sua conexão e tente novamente.');
      }
    }, 10000);

    try {
      console.log('📡 Enviando para tabela: produtos...');
      
      // Obter usuário logado para o user_id
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Objeto enviado coincide exatamente com as colunas esperadas
      const { data, error } = await supabase
        .from('produtos')
        .insert([{
          user_id: userId, // ID do produtor logado
          nome: formData.nome || 'Sem Nome',
          whatsapp_fornecedor: formData.whatsapp_fornecedor,
          preco_custo: parseFloat(formData.preco_custo) || 0,
          preco_sugerido: parseFloat(formData.preco_sugerido) || 0,
          imagem_url: formData.imagem_url,
          criativos_url: formData.criativos_url,
          link_externo: formData.link_externo,
          whatsapp_suporte: formData.whatsapp_suporte, // Coluna com underline confirmada
          descricao: formData.descricao,
          categoria: formData.categoria,
          publicado: false, // Novo campo solicitado
          status: 'pendente'
        }])
        .select();

      clearTimeout(timeout);

      if (error) {
        console.group('🔍 Supabase Insert Error');
        console.log('Error:', error);
        console.groupEnd();
        throw error;
      }
      
      console.log('✅ Envio bem-sucedido:', data);
      setSuccess(true);
      
      // Limpa formulário imediatamente
      setFormData({
        nome: '',
        whatsapp_fornecedor: '',
        preco_custo: '',
        preco_sugerido: '',
        imagem_url: '',
        criativos_url: '',
        link_externo: '',
        whatsapp_suporte: '',
        descricao: '',
        categoria: 'Casa & Estilo de Vida'
      });

      // Fecha o modal após 3 segundos mostrando a vitória
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setSaving(false);
      }, 3000);

    } catch (err: any) {
      console.error('❌ Erro no envio:', err.message);
      alert('Erro de conexão: Verifique a internet ou as chaves do banco');
      setSaving(false);
    } finally {
      clearTimeout(timeout);
    }
  };

  if (!isOpen) return null;

  const profit = (parseFloat(formData.preco_sugerido) || 0) - (parseFloat(formData.preco_custo) || 0);
  const margin = parseFloat(formData.preco_custo) > 0 ? (profit / parseFloat(formData.preco_custo)) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#020617]/90 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-5xl bg-[#0f172a] border border-slate-700 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-700 flex justify-between items-center bg-[#0f172a] sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-tighter">
              <Send className="text-cyan-500" size={24} /> Sugerir Novo Produto
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 relative">
          <AnimatePresence>
            {success && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 z-50 bg-[#0f172a] flex flex-col items-center justify-center text-center p-8"
              >
                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)] border-2 border-emerald-500/30">
                  <CheckCircle2 className="text-emerald-500" size={48} />
                </div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">✅ PRODUTO ENVIADO!</h3>
                <p className="text-slate-400 font-bold max-w-xs leading-relaxed">
                  O ADMIN VAI REVISAR SUAS INFORMAÇÕES E LIBERAR PARA A VITRINE.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form Section */}
            <div className="space-y-8">
              <div className="bg-cyan-600/10 border border-cyan-500/20 p-6 rounded-2xl">
                <p className="text-cyan-400 font-bold text-sm leading-relaxed">
                  🚀 <span className="text-white">Cadastre seu estoque</span> e coloque um exército de vendedores para trabalhar para você. Ganhe no volume, sem custos de marketing.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Nome do Produto</label>
                  <input 
                    required name="nome" value={formData.nome} onChange={handleInputChange}
                    placeholder="Ex: Smartwatch Ultra Y60"
                    className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:border-cyan-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    WhatsApp Comercial <CheckCircle2 size={14} className="text-blue-500" />
                  </label>
                  <div className="relative">
                    <input 
                      required={false} name="whatsapp_fornecedor" value={formData.whatsapp_fornecedor} onChange={handleInputChange}
                      placeholder="5511999999999"
                      className="w-full bg-[#020617] border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-cyan-500 outline-none transition-all"
                    />
                    <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Preço de Custo (R$)</label>
                    <div className="relative">
                      <input 
                        required={false} type="number" step="0.01" name="preco_custo" value={formData.preco_custo} onChange={handleInputChange}
                        placeholder="0.00"
                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-10 pr-4 py-3.5 text-white focus:border-blue-500 outline-none transition-all"
                      />
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Preço Sugerido (R$)</label>
                    <div className="relative">
                      <input 
                        required type="number" step="0.01" name="preco_sugerido" value={formData.preco_sugerido} onChange={handleInputChange}
                        placeholder="0.00"
                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-10 pr-4 py-3.5 text-white focus:border-blue-500 outline-none transition-all"
                      />
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Link da Imagem Principal (URL)</label>
                  <div className="relative">
                    <input 
                      required={false} name="imagem_url" value={formData.imagem_url} onChange={handleInputChange}
                      placeholder="https://suaimagem.com/foto.jpg"
                      className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-blue-500 outline-none transition-all"
                    />
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                  </div>
                </div>

                
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">WhatsApp de Suporte (Afiliados)</label>
                  <div className="relative">
                    <input 
                      required name="whatsapp_suporte" value={formData.whatsapp_suporte} onChange={handleInputChange}
                      placeholder="5577981531398"
                      className="w-full bg-[#020617] border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-cyan-500 outline-none transition-all"
                    />
                    <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={20} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Link dos Criativos (Drive/TikTok)</label>
                  <div className="relative">
                    <input 
                      required={false} name="criativos_url" value={formData.criativos_url} onChange={handleInputChange}
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-blue-500 outline-none transition-all"
                    />
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    🔗 Link do Produto (Shopee, Mercado Livre, etc) <span className="text-blue-500 font-black">*</span>
                    {isAutoFilling && <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity }} className="text-[10px] text-cyan-500 italic">Extraindo dados...</motion.span>}
                  </label>
                  <div className="relative">
                    <input 
                      name="link_externo" value={formData.link_externo} onChange={handleInputChange}
                      placeholder="https://shopee.com.br/seu-produto..."
                      className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-cyan-500 outline-none transition-all"
                    />
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" size={20} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Descrição e Benefícios</label>
                  <textarea 
                    name="descricao" value={formData.descricao} onChange={handleInputChange}
                    rows={4}
                    placeholder={formData.link_externo ? "Opcional: Descreva benefícios extras..." : "Destaque o que torna este produto irresistível..."}
                    required={!formData.link_externo}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:border-blue-500 outline-none transition-all resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={saving || success}
                  className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-cyan-600/20 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  {success ? (
                    <><CheckCircle2 size={24} /> Enviado!</>
                  ) : (
                    <>{saving ? 'Enviando...' : 'Enviar para Aprovação'}</>
                  )}
                </button>
              </form>
            </div>

            {/* Preview Section */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Visualização Prévia
              </h3>
              
              <div className="bg-[#0f172a]/50 p-8 rounded-3xl border-2 border-dashed border-slate-700/50">
                <p className="text-[10px] font-black text-slate-600 uppercase mb-4 text-center">Como seu produto aparecerá para os vendedores</p>
                
                <div className="max-w-[320px] mx-auto bg-[#1e293b] border border-slate-700 rounded-3xl overflow-hidden shadow-2xl scale-95 origin-top transition-all">
                  <div className="relative h-48 bg-slate-900 flex items-center justify-center overflow-hidden group/image">
                    {formData.imagem_url ? (
                      <img src={formData.imagem_url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-slate-700 flex flex-col items-center gap-3">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="flex items-center justify-center p-6 bg-slate-800/20 rounded-full"
                        >
                          <span className="text-4xl font-black italic tracking-tighter opacity-10">L<span className="text-cyan-500">S</span></span>
                        </motion.div>
                        <div className="flex flex-col items-center">
                          <ImageIcon size={24} className="opacity-40" />
                          <span className="text-[10px] uppercase font-black tracking-widest mt-2 opacity-40">Aguardando Link da Foto</span>
                        </div>
                      </div>
                    )}
                    
                    {formData.link_externo && !formData.imagem_url && (
                       <div className="absolute inset-0 bg-cyan-600/5 flex items-center justify-center pointer-events-none">
                         <div className="bg-[#0f172a] p-4 rounded-xl border border-cyan-500/30 text-center shadow-2xl">
                           <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest leading-tight">
                             Link detectado!<br/>
                             <span className="text-white">Cole a URL da Imagem</span><br/>
                             para ver o preview.
                           </p>
                         </div>
                       </div>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <h4 className="text-white font-bold mb-3 truncate">{formData.nome || 'Nome do Produto'}</h4>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-500 uppercase">Custo</span>
                        <span className="text-slate-300 font-mono">R$ {(parseFloat(formData.preco_custo) || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold border-b border-slate-800 pb-2">
                        <span className="text-slate-500 uppercase">Sugestão</span>
                        <span className="text-white font-mono">R$ {(parseFloat(formData.preco_sugerido) || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm items-center pt-1">
                        <span className="text-emerald-500 font-black flex items-center gap-1">
                          <TrendingUp size={12} /> Lucro
                        </span>
                        <div className="text-right">
                          <p className="text-emerald-400 font-black">R$ {profit.toFixed(2)}</p>
                          <p className="text-[8px] text-emerald-500 font-black">+{margin.toFixed(0)}% MARGEM</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="py-2 bg-slate-800 border border-slate-700 rounded-lg text-[9px] font-black text-center text-slate-400 uppercase">Dados</div>
                      <div className="py-2 bg-emerald-600/10 border border-emerald-600/20 rounded-lg text-[9px] font-black text-center text-emerald-500 uppercase">Contato</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 space-y-4">
                <h4 className="text-xs font-black text-white uppercase flex items-center gap-2">
                   Por que anunciar?
                </h4>
                <ul className="space-y-3">
                  {[
                    'Exposição para +5.000 vendedores ativos',
                    'Zero investimento em anúncios',
                    'Suporte na criação de ofertas matadoras',
                    'Foco total na sua logística'
                  ].map((text, i) => (
                    <li key={i} className="flex gap-3 text-xs text-slate-400 font-medium leading-relaxed">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
