import { useState } from 'react';
import { User, Mail, Shield, Bell, Settings, ShoppingBag, Rocket, ExternalLink, Link as LinkIcon, Save, Star } from 'lucide-react';

interface ProfileViewProps {
  userType: 'afiliado' | 'produtor';
  userEmail: string;
}

export default function ProfileView({ userType, userEmail }: ProfileViewProps) {
  const [vendorCheckout, setVendorCheckout] = useState(localStorage.getItem('checkout_link') || '');
  const [saved, setSaved] = useState(false);

  const handleSaveCheckout = () => {
    localStorage.setItem('checkout_link', vendorCheckout);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const getInitials = (email: string) => {
    if (!email) return 'AD';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-5xl space-y-12 pb-20">
      <header>
        <h2 className="text-3xl font-bold text-white tracking-tight border-b border-slate-800 pb-4">Meu Perfil</h2>
        <p className="text-slate-400 mt-4 leading-relaxed">Gerencie as informações da sua conta operacional Logistack.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informações Básicas (Sidebar do perfil) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-8 text-center bg-[#1e293b] border border-slate-800 rounded-3xl shadow-2xl">
            <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-3xl font-black border-4 border-[#0f172a] shadow-[0_0_30px_rgba(37,99,235,0.2)]">
              {getInitials(userEmail)}
            </div>
            <h3 className="text-sm font-bold text-white lowercase tracking-tight opacity-80 mb-2 truncate px-2">{userEmail}</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Status da Operação</p>
            
            <div className="mt-8 pt-6 border-t border-slate-800">
               <div className="flex items-center justify-center gap-2 text-emerald-500 bg-emerald-500/10 py-2 rounded-xl border border-emerald-500/20">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Status da Conta: Ativa</span>
               </div>
            </div>
          </div>
          
          <nav className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-4 rounded-xl bg-blue-600/10 text-blue-500 font-black text-xs uppercase tracking-widest border border-blue-500/10 transition-all">
              <User size={18} /> Dados Cadastrais
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-slate-500 hover:bg-slate-800/50 transition-colors text-xs font-black uppercase tracking-widest">
              <Shield size={18} /> Segurança da Conta
            </button>
          </nav>
        </div>

        {/* Detalhes Técnicos */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card p-8 bg-[#1e293b] border border-slate-800 rounded-3xl shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Configurações da Conta</h4>
              <span className="text-[10px] font-black text-blue-500 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20 uppercase tracking-widest">Acesso VIP</span>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Identidade (E-mail)</p>
                  <div className="p-4 bg-[#0f172a] rounded-2xl border border-slate-800 text-sm text-slate-300 font-bold">
                    {userEmail}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Cargo</p>
                  <div className="p-4 bg-[#0f172a] rounded-2xl border border-slate-800 text-sm text-yellow-500 font-black uppercase tracking-tighter">
                    {userType === 'produtor' ? 'Produtor' : 'Afiliado'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          
          <div className="card p-8 bg-[#1e293b] border border-slate-800 rounded-3xl shadow-2xl space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <LinkIcon size={20} className="text-blue-500" />
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Configuração de Checkout de Vendas</h4>
            </div>
            
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Define o link destino para onde seus clientes serão enviados ao clicar em "Comprar" na sua vitrine.
            </p>

            <div className="space-y-3">
              <input
                type="url"
                value={vendorCheckout}
                onChange={(e) => setVendorCheckout(e.target.value)}
                placeholder="Ex: https://checkout.kiwify.com.br/xxxxx"
                className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-blue-500 transition-all outline-none text-sm"
              />
              <button
                onClick={handleSaveCheckout}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 ${
                  saved ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {saved ? '✅ Link Atualizado' : <><Save size={16} /> Salvar Link de Checkout</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

