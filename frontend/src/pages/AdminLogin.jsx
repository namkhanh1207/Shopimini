import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/login', { username, password });
      if(res.data.success) {
         navigate('/admin/products');
      }
    } catch(err) { alert('Login failed: Identify yourself properly, mortal.'); }
  };

  return (
     <div className="min-h-screen bg-[#0a0f1a] flex flex-col items-center justify-center p-4">
        <form onSubmit={handleLogin} className="glass-panel p-10 rounded-3xl w-full max-w-md shadow-[0_0_50px_rgba(0,255,255,0.1)] border border-cyan-500/20">
           <h2 className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-extrabold mb-8 text-center tracking-widest uppercase">Admin Vault</h2>
           <div>
              <label className="text-gray-400 text-sm font-bold uppercase tracking-widest pl-2">Username</label>
              <input type="text" value={username} onChange={e=>setUsername(e.target.value)} className="w-full mb-6 mt-1 p-4 rounded-xl bg-[#0a0f1a] text-white outline-none focus:border-cyan-500 border border-gray-700" />
           </div>
           <div>
              <label className="text-gray-400 text-sm font-bold uppercase tracking-widest pl-2">Passphrase</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full mb-8 mt-1 p-4 rounded-xl bg-[#0a0f1a] text-white outline-none focus:border-cyan-500 border border-gray-700" />
           </div>
           <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 text-xl tracking-wider rounded-xl shadow-lg border border-cyan-400/50 transition">OPEN GATES</button>
        </form>
        <button type="button" onClick={()=>navigate('/')} className="mt-8 text-gray-500 underline hover:text-white transition">Abandon attempt and return to Store</button>
     </div>
  );
}
