import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Trash2 } from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const res = await api.get('/cart');
      if (res.data.cart) {
        setCart(res.data.cart);
      }
    } catch(err) { console.error(err); }
  };

  const updateQuantity = async (id, quantity) => {
    await api.post('/cart/update', { productId: id, quantity });
    loadCart();
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
       <Header />
       <div className="container mx-auto p-6 max-w-4xl mt-10">
          <h2 className="text-3xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-500">🛒 The Hoard</h2>
          <div className="glass-panel rounded-2xl p-6">
             {cart.length === 0 ? (
                <div className="text-center text-gray-500 py-10">Your hoard is empty, master...</div>
             ) : (
                <div className="space-y-6">
                   {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between bg-[#111520] p-4 rounded-xl border border-gray-700 shadow-md">
                         <div className="flex items-center space-x-4">
                            <img src={item.image} className="w-16 h-16 rounded object-cover border border-cyan-500" alt={item.name} />
                            <div>
                               <h4 className="font-bold">{item.name}</h4>
                               <div className="text-yellow-500 text-sm">💰 {item.price.toLocaleString()}</div>
                            </div>
                         </div>
                             <div className="flex items-center space-x-6">
                                 <div className="flex items-center bg-[#0a0f1a] rounded-lg overflow-hidden border border-gray-600">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-700">-</button>
                                    <span className="px-3 py-1 font-bold">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-700">+</button>
                                 </div>
                                 <div className="font-extrabold text-xl text-green-400 w-32 text-right">
                                    💰 {(item.price * item.quantity).toLocaleString()}
                                 </div>
                                 <button onClick={() => updateQuantity(item.id, 0)} className="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition" title="Discard Tribute">
                                    <Trash2 size={20} />
                                 </button>
                             </div>
                      </div>
                   ))}
                   <div className="pt-6 border-t border-gray-700 flex justify-between items-center">
                       <span className="text-2xl text-gray-400">Total Treasury</span>
                       <span className="text-3xl font-black text-yellow-500">💰 {total.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-end pt-4">
                       <button onClick={() => navigate('/checkout')} className="bg-gradient-to-r from-emerald-500 to-green-600 px-8 py-3 rounded-full font-bold text-lg shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:scale-105 transition">
                           Proceed to Checkout ➜
                       </button>
                   </div>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}
