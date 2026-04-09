import React, { useState } from 'react';
import Header from '../components/Header';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CheckoutPage() {
  const { reload } = useAuth();
  const [form, setForm] = useState({ name: '', address: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/checkout', { 
         customer_name: form.name, 
         customer_address: form.address 
      });
      if(res.data.success) {
         await reload();
         alert('Epic Purchase Successful! Order #' + res.data.orderId);
         navigate('/');
      }
    } catch(err) {
       alert(err.response?.data?.error || 'Failed to checkout');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
       <Header />
       <div className="container mx-auto p-6 max-w-2xl mt-10">
          <div className="glass-panel rounded-3xl p-8 border-cyan-500/30">
             <h2 className="text-3xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Finalize Trade</h2>
             <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                   <label className="block text-gray-300 font-bold mb-2">Master Name</label>
                   <input required type="text" className="w-full bg-[#111520] p-4 rounded-xl border border-gray-600 outline-none focus:border-cyan-500" placeholder="Dragon Lord..." value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                   <label className="block text-gray-300 font-bold mb-2">Island Address</label>
                   <textarea required rows="3" className="w-full bg-[#111520] p-4 rounded-xl border border-gray-600 outline-none focus:border-purple-500" placeholder="Fire Sanctuary, Block A..." value={form.address} onChange={e => setForm({...form, address: e.target.value})}></textarea>
                </div>
                <button type="submit" className="w-full py-4 rounded-full font-black text-xl tracking-wider text-black bg-gradient-to-r from-cyan-400 to-[#00ffff] hover:shadow-[0_0_20px_#00ffff] transition-all">
                    CONFIRM TRIBUTE
                </button>
             </form>
          </div>
       </div>
    </div>
  );
}
