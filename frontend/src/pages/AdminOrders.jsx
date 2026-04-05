import React, { useState, useEffect } from 'react';
import api from '../api';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data.orders);
    } catch(e) { console.error('Failed to load orders', e); }
  };

  return (
    <div className="max-w-6xl mx-auto">
        <div className="mb-8">
           <h1 className="text-3xl font-bold flex items-center text-purple-400">
               <span className="mr-3">📜</span> Master's Tributes (Orders)
           </h1>
           <p className="text-gray-400 mt-2">View the tributes submitted by mortals across all realms.</p>
        </div>
        
        <div className="bg-[#111520] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
           <table className="w-full text-left">
              <thead className="bg-[#1a1f2e] text-gray-400 uppercase text-xs tracking-wider">
                 <tr>
                    <th className="p-4">Order Ref</th>
                    <th className="p-4">Mortal Name</th>
                    <th className="p-4">Destination Base</th>
                    <th className="p-4 text-right">Total Tribute</th>
                    <th className="p-4 text-right">Date Received</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                 {orders.map(o => (
                   <tr key={o.id} className="hover:bg-[#151a25] transition">
                      <td className="p-4 font-bold text-gray-300">#{o.id}</td>
                      <td className="p-4 text-cyan-300 font-bold">{o.customer_name}</td>
                      <td className="p-4 text-sm text-gray-400">{o.customer_address}</td>
                      <td className="p-4 text-yellow-500 font-black text-right text-lg">💰 {Number(o.total_price).toLocaleString()}</td>
                      <td className="p-4 text-gray-500 text-right text-sm">
                         {new Date(o.created_at).toLocaleString()}
                      </td>
                   </tr>
                 ))}
                 {orders.length === 0 && (
                     <tr><td colSpan="5" className="p-8 text-center text-gray-500">No mortal has offered tribute yet.</td></tr>
                 )}
              </tbody>
           </table>
        </div>
    </div>
  );
}
