import { useState } from 'react';
import { Clock } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import SuperAdminView from '../views/SuperAdminView';
import SubscriptionGate from './SubscriptionGate';
import DashboardView from '../views/DashboardView';
import ProductsView from '../views/ProductsView';
import GrowthCenterView from '../views/GrowthCenterView';
import ActivateAccountView from '../views/ActivateAccountView';
import ProfileView from '../views/ProfileView';
import MasterAdminView from '../views/MasterAdminView';

interface MainContentProps {
  activeTab: string;
  userType: string;
  isSuperAdminRoute: boolean;
  isExpired: boolean;
  userProfile: { created_at: string; status_pagamento: string; email: string } | null;
  daysRemaining: number | null;
}

export default function MainContent({ 
  activeTab, 
  userType, 
  isSuperAdminRoute, 
  isExpired, 
  userProfile, 
  daysRemaining 
}: MainContentProps) {
  return (
    <div className="flex-1 flex flex-col">
      <header className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-4">
          <img 
            src="https://vroxxpzceusbyrfjhptu.supabase.co/storage/v1/object/public/public-assents/WhatsApp%20Image%202026-04-23%20at%2014.15.15%20(1).jpeg" 
            alt="Logistack" 
            className="h-8 w-auto rounded-lg" 
            style={{ borderRadius: '8px' }} 
          />
          <span className="mx-2 text-slate-700">/</span> 
          <span className="text-white capitalize font-black tracking-tight text-xs">{activeTab}</span>
          <span className="ml-3 px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-400 uppercase font-black uppercase tracking-widest">
            {userType === 'produtor' ? 'Produtor' : 'Afiliado'}
          </span>
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

      <div className="flex-1 p-4 lg:p-8 overflow-x-hidden w-full max-w-screen-xl mx-auto">
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
                    onClick={() => {}}
                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black uppercase tracking-widest transition-all"
                  >
                    Ir para Vitrine
                  </button>
                </div>
              )}
              {activeTab === 'products' && <ProductsView userType={userType} />}
              {activeTab === 'growth' && <GrowthCenterView userType={userType} onNavigate={() => {}} />}
              {activeTab === 'activate' && <ActivateAccountView />}
              {activeTab === 'profile' && <ProfileView userType={userType} userEmail={userProfile?.email || ''} />}
              {/* TRAVA DE SEGURANÇA: Admin apenas para Produtores */}
              {activeTab === 'admin' && userType === 'produtor' && <MasterAdminView userType={userType} />}
              {activeTab === 'admin' && userType === 'afiliado' && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <h2 className="text-2xl font-bold text-red-500 mb-4">Acesso Negado</h2>
                  <p className="text-slate-400 mb-6">Apenas Produtores têm acesso à Gestão Master.</p>
                  <button 
                    onClick={() => {}}
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
    </div>
  );
}
