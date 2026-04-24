import { useState } from 'react';
import Sidebar from './Sidebar';

interface MobileMenuProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  userType: string;
}

export default function MobileMenu({ activeTab, setActiveTab, onLogout, userType }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-slate-800 rounded-lg text-white"
        >
          {isOpen ? '✕' : '☰'}
        </button>
        <h1 className="text-lg font-bold">LOGISTACK</h1>
        <div className="w-8"></div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsOpen(false)}>
          <div className="w-64 h-full bg-slate-900 p-4" onClick={(e) => e.stopPropagation()}>
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} userType={userType} />
          </div>
        </div>
      )}
    </>
  );
}
