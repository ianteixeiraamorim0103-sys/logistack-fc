import { useState } from 'react';
import { Clock } from 'lucide-react';
import Sidebar from './Sidebar';

interface DesktopLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  userType: string;
  userProfile: { created_at: string; status_pagamento: string; email: string } | null;
  daysRemaining: number | null;
  isExpired: boolean;
}

export default function DesktopLayout({ 
  activeTab, 
  setActiveTab, 
  onLogout, 
  userType, 
  userProfile, 
  daysRemaining, 
  isExpired 
}: DesktopLayoutProps) {
  return (
    <div className="hidden lg:block">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} userType={userType} />
    </div>
  );
}
