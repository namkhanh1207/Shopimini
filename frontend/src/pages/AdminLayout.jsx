import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Ticket, PackageOpen, ScrollText, LogOut, ArrowLeft, ShieldAlert } from 'lucide-react';
import api from '../api';

export default function AdminLayout() {
  const [auth, setAuth] = useState(null);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  const checkAuth = async () => {
    try {
      const res = await api.get('/admin/check');
      setAuth(res.data.loggedIn);
    } catch { setAuth(false); }
  };

  if (auth === null) return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col items-center justify-center">
      <ShieldAlert size={48} className="text-cyan-500 animate-pulse mb-4" />
      <div className="text-cyan-400 text-xl font-bold tracking-widest uppercase">Verifying Clearance...</div>
    </div>
  );
  if (!auth) return <Navigate to="/admin/login" />;

  const navItems = [
    { name: 'Overview', path: 'dashboard', icon: LayoutDashboard, color: 'text-emerald-400', activeBg: 'from-emerald-900/40 to-emerald-800/20', activeBorder: 'border-emerald-500/50' },
    { name: 'Cư dân', path: 'customers', icon: Users, color: 'text-blue-400', activeBg: 'from-blue-900/40 to-blue-800/20', activeBorder: 'border-blue-500/50' },
    { name: 'Nạp tiền', path: 'topup', icon: CreditCard, color: 'text-yellow-400', activeBg: 'from-yellow-900/40 to-yellow-800/20', activeBorder: 'border-yellow-500/50' },
    { name: 'Vouchers', path: 'vouchers', icon: Ticket, color: 'text-amber-400', activeBg: 'from-amber-900/40 to-amber-800/20', activeBorder: 'border-amber-500/50' },
    { name: 'Products Grimoire', path: 'products', icon: PackageOpen, color: 'text-cyan-400', activeBg: 'from-cyan-900/40 to-cyan-800/20', activeBorder: 'border-cyan-500/50' },
    { name: 'Tributes (Orders)', path: 'orders', icon: ScrollText, color: 'text-purple-400', activeBg: 'from-purple-900/40 to-purple-800/20', activeBorder: 'border-purple-500/50' },
  ];

  return (
    <div className="flex min-h-screen bg-[#0a0f1a] text-gray-200 font-sans">
      
      {/* SIDEBAR */}
      <div className="w-[280px] bg-[#10131e] border-r border-[#1e2436] flex flex-col relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.4)]">
         
         {/* HEADER */}
         <div className="p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600"></div>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a233a] to-[#0a0f1a] border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.15)]">
                  <ShieldAlert size={20} className="text-cyan-400" />
               </div>
               <div>
                  <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 tracking-wider">ADMIN VAULT</div>
                  <div className="text-[0.65rem] text-cyan-500/60 uppercase tracking-widest font-bold">System Override Active</div>
               </div>
            </div>
         </div>
         
         {/* NAVIGATION */}
         <nav className="p-4 flex-1 space-y-2 overflow-y-auto dml-scroll">
            <div className="px-3 mb-2 text-xs font-bold text-gray-500/60 uppercase tracking-widest">Main Modules</div>
            {navItems.map(item => {
               const isActive = location.pathname.includes(item.path) || (item.path === 'dashboard' && location.pathname === '/admin');
               return (
                  <Link 
                     key={item.name} 
                     to={`/admin/${item.path}`} 
                     className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold transition-all duration-300 ${
                        isActive 
                        ? `bg-gradient-to-r ${item.activeBg} ${item.color} border border-l-4 ${item.activeBorder} shadow-lg` 
                        : 'hover:bg-[#1a2030] text-gray-400 border border-transparent border-l-4 hover:border-l-gray-600'
                     }`}
                  >
                     <item.icon size={20} className={isActive ? item.color : 'text-gray-500 group-hover:text-gray-300 transition-colors'} strokeWidth={isActive ? 2.5 : 2} />
                     <span className="tracking-wide text-[0.95rem]">{item.name}</span>
                  </Link>
               );
            })}
         </nav>
         
         {/* FOOTER */}
         <div className="p-5 border-t border-[#1e2436] bg-[#0d1018]">
            <button 
               onClick={async () => { await api.post('/admin/logout'); setAuth(false); }} 
               className="w-full flex items-center justify-center gap-2 bg-[#1a0f14] hover:bg-[#2a1218] text-red-400 border border-red-900/50 p-3 rounded-xl transition duration-300 font-bold tracking-wide shadow-[0_4px_10px_rgba(200,0,0,0.1)] hover:shadow-[0_4px_15px_rgba(200,0,0,0.2)]"
            >
               <LogOut size={18} strokeWidth={2.5} />
               SEAL THE GATES
            </button>
            <Link to="/" className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-cyan-400 mt-4 transition-colors">
               <ArrowLeft size={14} />
               Return to Store
            </Link>
         </div>
      </div>
      
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto bg-[#0a0f1a] relative">
         <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-cyan-900/10 to-transparent pointer-events-none"></div>
         <div className="p-8 relative z-10 min-h-full">
            <Outlet />
         </div>
      </div>
    </div>
  );
}
