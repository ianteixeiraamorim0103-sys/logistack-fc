/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, AlertTriangle, Clock } from 'lucide-react';
import Sidebar from './components/Sidebar';
import LoginProdutor from './components/LoginProdutor';
import LoginAfiliado from './components/LoginAfiliado';
import DashboardView from './views/DashboardView';
import ProductsView from './views/ProductsView';
import ProfileView from './views/ProfileView';
import MasterAdminView from './views/MasterAdminView';
import ActivateAccountView from './views/ActivateAccountView';
import GrowthCenterView from './views/GrowthCenterView';
import SuperAdminView from './views/SuperAdminView';
import SubscriptionGate from './components/SubscriptionGate';
import PixelTracker from './components/PixelTracker';
import { supabase } from './lib/supabase';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true); 
  const [activeTab, setActiveTab] = useState('products');
  const [userType, setUserType] = useState<'afiliado' | 'produtor'>('afiliado');
  const [userProfile, setUserProfile] = useState<{ created_at: string; status_pagamento: string; email: string } | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isSuperAdminRoute, setIsSuperAdminRoute] = useState(currentPath === '/mestre-logistack');

  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Efeito para buscar perfil e validar tempo de uso
  useEffect(() => {
    async function checkSubscription() {
      if (!supabase) return;
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const userEmail = user?.email || '';

        // TEMPORÁRIO: Não ler perfil logo de cara para evitar erro 400
        let profileDate: string;
        let paymentStatus: string;
        let type: 'afiliado' | 'produtor' = 'afiliado';

        // Usar localStorage temporariamente para evitar leitura de perfil
        profileDate = localStorage.getItem('logistack_trial_start') || new Date().toISOString();
        paymentStatus = 'pendente';
        if (!localStorage.getItem('logistack_trial_start')) {
          localStorage.setItem('logistack_trial_start', profileDate);
        }

        const startDate = new Date(profileDate);
        const today = new Date();
        const diffTime = today.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const remaining = 7 - diffDays;

        setDaysRemaining(remaining > 0 ? remaining : 0);
        setUserProfile({ created_at: profileDate, status_pagamento: paymentStatus, email: userEmail });
        setUserType(type);
        
        if (remaining <= 0 && paymentStatus !== 'assinante_ativo') {
          setIsExpired(true);
        }
      } catch (e) {
        console.error('Erro ao validar assinatura:', e);
      }
    }

    checkSubscription();
  }, []);

  const handleLogin = (type: 'afiliado' | 'produtor') => {
    setUserType(type);
    setIsLoggedIn(true);
    // Redirecionamento baseado no tipo
    if (type === 'afiliado') {
      setActiveTab('dashboard'); // Afiliado vai para o Painel do Afiliado
    } else {
      setActiveTab('dashboard'); // Produtor vai para o Dashboard de Gestão
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('dashboard');
  };

  if (!isLoggedIn) {
    // TRAVA DE SEGURANÇA: Apenas rotas específicas permitidas
    if (currentPath === '/login-produtor' || currentPath === '/entrar-produtor') {
      return <LoginProdutor onLogin={handleLogin} />;
    }
    if (currentPath === '/login-afiliado' || currentPath === '/entrar-afiliado') {
      return <LoginAfiliado onLogin={handleLogin} />;
    }
    
    // Se tentar acessar qualquer outra rota sem estar logado, redirecionar para página de erro
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 font-sans">
        <div className="text-center">
          <h1 className="text-4xl font-black text-white mb-4 tracking-tighter italic uppercase">
            LOGI<span className="text-cyan-500">STACK</span>
          </h1>
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-red-500 mb-4">Acesso Restrito</h2>
            <p className="text-slate-400 mb-6">Use uma porta de entrada válida:</p>
            <div className="space-y-3">
              <a 
                href="/login-produtor" 
                className="block w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest py-3 rounded-xl transition-all"
              >
                Portal do Produtor
              </a>
              <a 
                href="/login-afiliado" 
                className="block w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest py-3 rounded-xl transition-all border-2 border-emerald-500/30"
              >
                🚀 Entrar como Afiliado
              </a>
              <a 
                href="/cadastro-afiliado" 
                className="block w-full bg-slate-800 hover:bg-slate-700 text-cyan-400 font-black uppercase tracking-widest py-3 rounded-xl transition-all border border-slate-600"
              >
                📝 Sou Afiliado e quero me cadastrar
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30 selection:text-white flex border-hidden relative">
      <PixelTracker />
      {/* Sidebar - Fixed/Aside */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        userType={userType}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 ml-64 bg-[#0f172a]">
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-800 bg-[#0f172a]/50 sticky top-0 z-40 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <img src="https://vroxxpzceusbyrfjhptu.supabase.co/storage/v1/object/public/public-assents/WhatsApp%20Image%202026-04-23%20at%2014.15.15%20(1).jpeg" alt="Logistack" className="h-8 w-auto rounded-lg" style={{ borderRadius: '8px' }} />
            <span className="mx-2 text-slate-700">/</span> 
            <span className="text-white capitalize font-black tracking-tight text-xs">{activeTab}</span>
            <span className="ml-3 px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-400 uppercase font-black uppercase tracking-widest">{userType === 'produtor' ? 'Produtor' : 'Afiliado'}</span>
            {userProfile?.email && (
              <span className="ml-2 px-3 py-1 bg-cyan-600/10 border border-cyan-500/20 rounded-full text-[10px] text-cyan-400 font-black uppercase tracking-widest">
                {userProfile.email}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {daysRemaining !== null && !isExpired && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
                <Clock size={12} className="text-amber-500" />
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                  {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'} de teste restantes
                </span>
              </div>
            )}
                        <div className="h-4 w-[1px] bg-slate-800"></div>
            <span className="text-xs text-slate-500 font-mono">v1.2.0</span>
          </div>
        </header>

        <div className="flex-1 p-8">
          {isSuperAdminRoute ? (
            <SuperAdminView currentUserEmail="iangamer815@gmail.com" />
          ) : isExpired ? (
            <SubscriptionGate onActivate={() => {}} />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                {/* TRAVA DE SEGURANÇA: Dashboard apenas para Produtores */}
                {activeTab === 'dashboard' && userType === 'produtor' && <DashboardView userType={userType} />}
                {activeTab === 'dashboard' && userType === 'afiliado' && (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Acesso Negado</h2>
                    <p className="text-slate-400 mb-6">Afiliados não têm acesso ao Dashboard de Gestão.</p>
                    <button 
                      onClick={() => setActiveTab('products')}
                      className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black uppercase tracking-widest transition-all"
                    >
                      Ir para Vitrine
                    </button>
                  </div>
                )}
                {activeTab === 'products' && <ProductsView userType={userType} />}
                {activeTab === 'growth' && <GrowthCenterView userType={userType} onNavigate={setActiveTab} />}
                {activeTab === 'activate' && <ActivateAccountView />}
                {activeTab === 'profile' && <ProfileView userType={userType} userEmail={userProfile?.email || ''} />}
                {/* TRAVA DE SEGURANÇA: Admin apenas para Produtores */}
                {activeTab === 'admin' && userType === 'produtor' && <MasterAdminView userType={userType} />}
                {activeTab === 'admin' && userType === 'afiliado' && (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Acesso Negado</h2>
                    <p className="text-slate-400 mb-6">Apenas Produtores têm acesso à Gestão Master.</p>
                    <button 
                      onClick={() => setActiveTab('products')}
                      className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black uppercase tracking-widest transition-all"
                    >
                      Ir para Vitrine
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <footer className="p-8 border-t border-slate-800 text-center">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
            Logistack © 2026 - Tecnologia para Afiliados e Produtores
          </p>
        </footer>
      </main>

      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.open('https://wa.me/5577981531398', '_blank')} 
        className="fixed bottom-8 right-8 z-[100] bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-4 rounded-full shadow-[0_10px_40px_rgba(16,185,129,0.4)] flex items-center gap-3 font-black uppercase tracking-widest text-[10px] transition-all border-4 border-[#020617]"
      >
        <div className="flex items-center gap-2 border-r border-white/20 pr-3 mr-1">
          <img src="https://vroxxpzceusbyrfjhptu.supabase.co/storage/v1/object/public/public-assents/WhatsApp%20Image%202026-04-23%20at%2014.15.15%20(1).jpeg" alt="Logistack" className="h-6 w-auto rounded" />
        </div>
        <div className="flex items-center gap-2">
          <MessageCircle size={18} />
          <span>Suporte Humano</span>
        </div>
      </motion.button>
    </div>
  );
}
