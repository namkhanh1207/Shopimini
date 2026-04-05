import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
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

  if (auth === null) return <div className="text-white text-center mt-20 text-xl font-bold tracking-widest text-cyan-400">Verifying Realm Access...</div>;
  if (!auth) return <Navigate to="/admin/login" />;

  return (
    <div className="flex min-h-screen bg-[#0a0f1a] text-white">
      <div className="w-64 bg-[#111520] border-r border-gray-800 flex flex-col">
         <div className="p-6 text-2xl font-black text-cyan-400 border-b border-gray-800 tracking-wider">Admin Vault</div>
         <nav className="p-4 flex-1 space-y-3">
            <Link to="/admin/products" className={`block w-full p-4 rounded-xl font-bold transition ${location.pathname.includes('products') ? 'bg-gradient-to-r from-cyan-900 to-blue-900 text-cyan-300 border border-cyan-700 shadow-md' : 'hover:bg-gray-800 text-gray-400 border border-transparent'}`}>🌟 Products Grimoire</Link>
            <Link to="/admin/orders" className={`block w-full p-4 rounded-xl font-bold transition ${location.pathname.includes('orders') ? 'bg-gradient-to-r from-purple-900 to-pink-900 text-purple-300 border border-purple-700 shadow-md' : 'hover:bg-gray-800 text-gray-400 border border-transparent'}`}>📜 Tributes (Orders)</Link>
         </nav>
         <div className="p-4">
            <button onClick={async () => { await api.post('/admin/logout'); setAuth(false); }} className="w-full bg-red-900/40 text-red-400 border border-red-800/80 p-3 rounded-xl hover:bg-red-800 hover:text-white transition font-bold tracking-wide">Seal the Gates</button>
            <Link to="/" className="w-full text-center block text-gray-400 underline mt-4 hover:text-white pb-4">Return to Public Store</Link>
         </div>
      </div>
      <div className="flex-1 p-8 overflow-y-auto">
         <Outlet />
      </div>
    </div>
  );
}
