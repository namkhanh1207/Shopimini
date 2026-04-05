import React, { useState, useEffect } from 'react';
import api from '../api';
import { Edit, Trash, Plus } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(null); // null means showing list, object means form

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
       const res = await api.get('/products');
       setProducts(res.data.products);
    } catch(e) { console.error("Could not load items", e); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { 
       ...form, 
       attributes: form.attributes ? (typeof form.attributes === 'string' ? form.attributes.split(',').map(s=>s.trim()) : form.attributes) : [] 
    };
    try {
       if(form.id) {
          await api.put(`/admin/products/${form.id}`, payload);
       } else {
          await api.post('/admin/products', payload);
       }
       setForm(null);
       loadProducts();
    } catch(err) { alert('Failed to forge item.'); }
  };

  const handleDelete = async (id) => {
     if(window.confirm('Cast this item into the void?')) {
        await api.delete(`/admin/products/${id}`);
        loadProducts();
     }
  };

  if(form !== null) return (
     <div className="glass-panel p-8 rounded-2xl border border-cyan-500/30 max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
           {form.id ? 'Edit Magical Item' : 'Forge New Item'}
        </h2>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">Item Name</label>
              <input required type="text" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full bg-[#111520] p-3 rounded-lg border border-gray-700 outline-none focus:border-cyan-500" />
           </div>
           <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">Price (Gold)</label>
              <input required type="number" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} className="w-full bg-[#111520] p-3 rounded-lg border border-gray-700 outline-none focus:border-cyan-500" />
           </div>
           <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">Image URL</label>
              <input type="text" value={form.image} onChange={e=>setForm({...form, image:e.target.value})} className="w-full bg-[#111520] p-3 rounded-lg border border-gray-700 outline-none focus:border-cyan-500" />
           </div>
           <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">Description</label>
              <textarea rows="3" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} className="w-full bg-[#111520] p-3 rounded-lg border border-gray-700 outline-none focus:border-cyan-500" />
           </div>
           <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">Game</label>
              <select value={form.game} onChange={e=>setForm({...form, game:e.target.value})} className="w-full bg-[#111520] p-3 rounded-lg border border-gray-700 outline-none focus:border-cyan-500">
                 <option value="lienquan">Liên Quân</option>
                 <option value="lienminh">Liên Minh</option>
                 <option value="gunny">Gunny 360</option>
                 <option value="soulknight">Soul Knight</option>
                 <option value="pubg">PUBG</option>
                 <option value="dragonmania">Dragon Mania Legends</option>
              </select>
           </div>
           <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">Rarity</label>
              <select value={form.rarity} onChange={e=>setForm({...form, rarity:e.target.value})} className="w-full bg-[#111520] p-3 rounded-lg border border-gray-700 outline-none focus:border-cyan-500">
                 <option value="Common">Common</option>
                 <option value="Rare">Rare</option>
                 <option value="Epic">Epic</option>
                 <option value="Legendary">Legendary</option>
              </select>
           </div>
           <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">Attributes (Comma sep)</label>
              <input type="text" value={form.attributes} onChange={e=>setForm({...form, attributes:e.target.value})} placeholder="Weapon, Physical, Fire" className="w-full bg-[#111520] p-3 rounded-lg border border-gray-700 outline-none focus:border-cyan-500" />
           </div>
           <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">Required Level</label>
              <input type="number" value={form.requiredLevel || ''} onChange={e=>setForm({...form, requiredLevel:e.target.value})} placeholder="Leave blank if none" className="w-full bg-[#111520] p-3 rounded-lg border border-gray-700 outline-none focus:border-cyan-500" />
           </div>
           <div className="md:col-span-2 flex space-x-4 mt-6">
              <button type="submit" className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg">SAVE ITEM</button>
              <button type="button" onClick={() => setForm(null)} className="px-8 bg-gray-800 text-gray-300 font-bold py-3 rounded-lg hover:bg-gray-700">CANCEL</button>
           </div>
        </form>
     </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
           <h1 className="text-3xl font-bold text-cyan-400">Inventory Catalog</h1>
           <button onClick={() => setForm({name:'', price:'', image:'', description:'', game:'lienquan', rarity:'Common', attributes:'', unlockDate:'', requiredLevel:''})} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 flex items-center px-6 py-3 rounded-xl text-white font-bold shadow-[0_0_15px_rgba(0,255,255,0.2)]">
              <Plus size={20} className="mr-2" /> Forge New Item
           </button>
        </div>
        <div className="bg-[#111520] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
           <table className="w-full text-left">
              <thead className="bg-[#1a1f2e] text-gray-400 uppercase text-xs tracking-wider">
                 <tr>
                    <th className="p-4">Item</th>
                    <th className="p-4">Game</th>
                    <th className="p-4">Rarity</th>
                    <th className="p-4 text-right">Price</th>
                    <th className="p-4 text-center">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                 {products.map(p => (
                   <tr key={p.id} className="hover:bg-[#151a25] transition">
                      <td className="p-4 flex items-center space-x-4">
                         <img src={p.image || `https://picsum.photos/seed/${p.id}/50/50`} className="w-12 h-12 object-cover rounded-lg border border-gray-700" alt={p.name} />
                         <div>
                            <span className="font-bold block text-lg">{p.name}</span>
                            <span className="text-xs text-gray-500 max-w-xs truncate block">{p.description}</span>
                         </div>
                      </td>
                      <td className="p-4">
                         <span className="bg-[#0a0f1a] px-3 py-1 rounded-full text-xs border border-gray-700 text-gray-300">{p.game}</span>
                      </td>
                      <td className="p-4">
                         <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                             p.rarity==='Legendary' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-700/50' :
                             p.rarity==='Epic' ? 'bg-purple-900/50 text-purple-400 border border-purple-700/50' :
                             p.rarity==='Rare' ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-700/50' :
                             'bg-gray-800 text-gray-400 border border-gray-600'
                         }`}>
                            {p.rarity}
                         </span>
                      </td>
                      <td className="p-4 text-yellow-500 font-bold text-right text-lg">💰 {p.price.toLocaleString()}</td>
                      <td className="p-4">
                         <div className="flex justify-center space-x-3">
                            <button onClick={() => setForm({...p, attributes: Array.isArray(p.attributes) ? p.attributes.join(', ') : p.attributes})} className="p-3 bg-blue-900/30 text-blue-400 rounded-lg hover:bg-blue-800 hover:text-white transition" title="Edit">
                               <Edit size={18}/>
                            </button>
                            <button onClick={() => handleDelete(p.id)} className="p-3 bg-red-900/30 text-red-500 rounded-lg hover:bg-red-800 hover:text-white transition" title="Delete">
                               <Trash size={18}/>
                            </button>
                         </div>
                      </td>
                   </tr>
                 ))}
                 {products.length === 0 && (
                     <tr><td colSpan="5" className="p-8 text-center text-gray-500">The vault is completely empty.</td></tr>
                 )}
              </tbody>
           </table>
        </div>
    </div>
  );
}
