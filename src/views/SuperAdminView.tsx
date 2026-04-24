import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, CheckCircle, Users, BarChart3, ExternalLink, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ServiceRequest {
  id: string;
  tipo: string;
  link_produto: string;
  observacoes: string;
  status: string;
  created_at: string;
  contato?: string; // Simulado vindo do profile associado
}

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  status_pagamento: string;
  tipo_usuario: string;
}

interface TopProduct {
  id: string;
  nome: string;
  cliques: number;
}

export default function SuperAdminView({ currentUserEmail }: { currentUserEmail: string }) {
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const IS_SUPER_ADMIN = currentUserEmail === 'iangamer815@gmail.com';

  useEffect(() => {
    if (IS_SUPER_ADMIN) {
      fetchAdminData();
    }
  }, [IS_SUPER_ADMIN]);

  async function fetchAdminData() {
    if (!supabase) return;
    setLoading(true);
    try {
      // 1. Pedidos de Tráfego Pendentes
      const { data: servs } = await supabase
        .from('servicos')
        .select('*')
        .eq('status', 'pendente_pagamento')
        .order('created_at', { ascending: false });

      // 2. Status de Usuários
      const { data: profs } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // 3. Ranking de Cliques
      const { data: prods } = await supabase
        .from('produtos')
        .select('id, nome, cliques')
        .order('cliques', { ascending: false })
        .limit(10);

      setServices(servs || []);
      setUsers(profs || []);
      setTopProducts(prods || []);
    } catch (e) {
      console.error('Erro ao carregar dados admin:', e);
    } finally {
      setLoading(false);
    }
  }

  const handleFinishService = async (id: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('servicos')
        .update({ status: 'finalizado' })
        .eq('id', id);
      
      if (error) throw error;
      setServices(prev => prev.filter(s => s.id !== id));
      alert('Pedido finalizado com sucesso!');
    } catch (e) {
      alert('Erro ao finalizar pedido');
    }
  };

  if (!IS_SUPER_ADMIN) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 border border-red-500/20">
            <Shield size={40} />
          </div>
          <h2 className="text-2xl font-black text-white uppercase italic">Acesso Negado</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Área restrita ao Super Administrador</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic flex items-center gap-4">
            <span className="p-3 bg-cyan-600 rounded-2xl shadow-xl shadow-cyan-600/20">
              <Shield size={24} />
            </span>
            Mestre Logistack
          </h2>
          <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Controle Supremo da Operação</p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Coluna 1: Pedidos de Tráfego */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tighter">Pedidos Pendentes</h3>
          </div>
          
          <div className="space-y-4">
            {services.length === 0 ? (
              <div className="p-10 bg-slate-900/30 border border-slate-800 rounded-3xl text-center text-slate-600 font-bold uppercase text-[10px] tracking-widest">
                Sem pedidos no momento
              </div>
            ) : (
              services.map(s => (
                <div key={s.id} className="bg-[#1e293b] border border-slate-800 p-6 rounded-3xl space-y-4 hover:border-amber-500/30 transition-all group">
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                      {s.tipo}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono italic">
                      {new Date(s.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-black text-white uppercase tracking-tight">Link do Produto:</p>
                    <a href={s.link_produto} target="_blank" className="text-cyan-400 text-xs font-medium hover:underline flex items-center gap-1">
                      {s.link_produto} <ExternalLink size={12} />
                    </a>
                  </div>

                  {s.observacoes && (
                    <div className="p-3 bg-slate-950 rounded-xl">
                      <p className="text-[10px] text-slate-500 italic">" {s.observacoes} "</p>
                    </div>
                  )}

                  <button 
                    onClick={() => handleFinishService(s.id)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/10 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} /> Concluir Pedido
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coluna 2: Status de Usuários */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <Users size={20} />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tighter">Status dos Usuários</h3>
          </div>

          <div className="bg-[#1e293b] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900/50 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                    <th className="px-6 py-4">Usuário</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {users.map(u => {
                    const diff = Date.now() - new Date(u.created_at).getTime();
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const isBlocked = days >= 7 && u.status_pagamento !== 'assinante_ativo';
                    
                    return (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-white truncate w-32">{u.email}</p>
                          <p className="text-[9px] text-slate-500 font-mono">Entrou: {new Date(u.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1 w-fit ${
                            isBlocked ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          }`}>
                            {isBlocked ? <><AlertTriangle size={10} /> Bloqueado</> : <><CheckCircle2 size={10} /> Ativo</>}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Coluna 3: Ranking de Cliques */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tighter">Ranking de Cliques</h3>
          </div>

          <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            {topProducts.map((p, index) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-2xl border border-slate-800/50 group hover:border-purple-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-black ${
                    index === 0 ? 'bg-yellow-500 text-slate-950' : 
                    index === 1 ? 'bg-slate-300 text-slate-900' : 
                    index === 2 ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {index + 1}
                  </span>
                  <p className="text-sm font-bold text-white uppercase tracking-tighter truncate w-32">{p.nome}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-purple-400 font-mono tracking-tighter">{p.cliques} CLIQUES</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
