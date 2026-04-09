import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { Edit, Trash, Plus, Search, GripVertical } from 'lucide-react';

/* ── Rarity visual config ── */
const RARITY_CFG = {
  Legendary: { badge: 'bg-yellow-900/40 text-yellow-500 border border-yellow-600/60', row: 'border-l-4 border-l-yellow-500', glow: 'rgba(255,215,0,0.04)' },
  Epic:      { badge: 'bg-purple-900/40 text-purple-400 border border-purple-600/60', row: 'border-l-4 border-l-purple-500', glow: 'rgba(187,0,255,0.04)' },
  Rare:      { badge: 'bg-blue-900/40 text-blue-400 border border-blue-600/60', row: 'border-l-4 border-l-blue-500', glow: 'rgba(0,119,255,0.04)' },
  Common:    { badge: 'bg-gray-800 text-gray-400 border border-gray-600', row: 'border-l-4 border-l-gray-500', glow: 'rgba(120,140,150,0.02)' },
};
const getRarity = (r) => RARITY_CFG[r] || RARITY_CFG.Common;

const ALL_ELEMENTS = [
  'Weapon', 'Physical', 'Magic', 'Defense', 'Support', 'Fast', 'Lifesteal', 'Fire', 'Ice', 'Mana', 'HP', 'Speed', 'Explosive', 'Light', 'Dragon', 'Skin', 'Material',
  'Vũ khí', 'Vật lý', 'Phép thuật', 'Phòng thủ', 'Hỗ trợ', 'Tốc đánh', 'Hút máu', 'Thiêu đốt', 'Tốc chạy', 'Phản sát thương', 'Máu', 'Lá chắn', 'Hồi phục', 'Giải khống', 'Kháng phép', 'Tầm nhìn',
];

const INPUT_CLS = 'w-full bg-[#0d1018] text-gray-200 p-3 rounded-lg border border-gray-700 outline-none focus:border-cyan-500 transition';
const LABEL_CLS = 'block text-gray-400 text-xs font-bold mb-1.5 uppercase tracking-wider';

const EMPTY_FORM = {
  name: '', price: '', image: '', description: '',
  game: 'lienquan', rarity: 'Common', attributes: '',
  unlockDate: '', requiredLevel: '',
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm]         = useState(null);
  const [search, setSearch]     = useState('');
  const [filterGame, setFilterGame]     = useState('');
  const [filterRarity, setFilterRarity] = useState('');
  const [filterElement, setFilterElement] = useState('');
  
  // Drag and drop state
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [draggingId, setDraggingId] = useState(null);

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data.products || []);
    } catch(e) { console.error('Cannot load products', e); }
  };

  const filtered = products.filter(p => {
    const nameMatch    = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const gameMatch    = !filterGame   || p.game === filterGame;
    const rarityMatch  = !filterRarity || p.rarity === filterRarity;
    const elementMatch = !filterElement || (Array.isArray(p.attributes) ? p.attributes : []).some(a => a.toLowerCase().includes(filterElement.toLowerCase()));
    return nameMatch && gameMatch && rarityMatch && elementMatch;
  });

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      attributes: form.attributes ? (typeof form.attributes === 'string' ? form.attributes.split(',').map(s => s.trim()).filter(Boolean) : form.attributes) : [],
    };
    try {
      if (form.id) await api.put(`/admin/products/${form.id}`, payload);
      else          await api.post('/admin/products', payload);
      setForm(null);
      loadProducts();
    } catch { alert('Lỗi khi lưu sản phẩm.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa sản phẩm này?')) return;
    await api.delete(`/admin/products/${id}`);
    loadProducts();
  };

  // Drag and drop handlers
  const handleDragStart = (e, index, id) => {
    dragItem.current = index;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    // Slightly hide original draging item
    setTimeout(() => { e.target.style.opacity = '0.4'; }, 0);
  };

  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = async (e) => {
     e.target.style.opacity = '1';
     setDraggingId(null);
     
     if(dragItem.current === null || dragOverItem.current === null) return;
     if(dragItem.current === dragOverItem.current) return;

     // Calculate new order locally to give immediate feedback
     const newItems = [...products];
     const draggedItemContent = newItems[dragItem.current];
     newItems.splice(dragItem.current, 1);
     newItems.splice(dragOverItem.current, 0, draggedItemContent);
     
     // Determine the movement relative to backend API
     // Backend only supports patch { direction: 'up' | 'down' } for contiguous movements right now.
     // To support arbitrary drops, we should ideally have a sync route. 
     // For this simple version relying on current endpoints, let's just make the visually sorted local state permanent for now
     // Because we have many items, and standard API only assumes one hop "up" or "down", we will implement sequential calls to backend OR best practice: update the actual db. 
     // WAIT. The existing backend logic only takes direction 'up' / 'down'. Let's do a loop of API calls.
     const diff = dragOverItem.current - dragItem.current;
     const direction = diff > 0 ? 'down' : 'up';
     const steps = Math.abs(diff);
     const idToMove = draggedItemContent.id;
     
     dragItem.current = null;
     dragOverItem.current = null;

     // Optimistic UI update
     setProducts(newItems); 

     // Send requests backend
     try {
       for(let i=0; i < steps; i++) {
         await api.patch(`/admin/products/${idToMove}/order`, { direction });
       }
     } catch (e) {
       console.error("Order sync failed", e);
       loadProducts(); // revert on fail
     }
  };

  if (form !== null) return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-[#151923] rounded-2xl border border-gray-800 p-8 shadow-2xl">
        <h2 className="text-2xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
          {form.id ? '✏️ Sửa Sản Phẩm' : '⚒️ Thêm Sản Phẩm Mới'}
        </h2>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div><label className={LABEL_CLS}>Tên Sản Phẩm</label><input required type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className={INPUT_CLS} /></div>
          <div><label className={LABEL_CLS}>Giá (VNĐ)</label><input required type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} className={INPUT_CLS} /></div>
          <div className="md:col-span-2"><label className={LABEL_CLS}>URL Ảnh</label>
            <input type="text" value={form.image||''} onChange={e=>setForm({...form,image:e.target.value})} className={INPUT_CLS} />
            {form.image && <img src={form.image} alt="preview" className="mt-2 h-20 rounded-lg border border-gray-700 object-cover" />}
          </div>
          <div className="md:col-span-2"><label className={LABEL_CLS}>Mô tả</label>
            <textarea rows="3" value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})} className={INPUT_CLS} /></div>
          <div><label className={LABEL_CLS}>Trò chơi</label>
            <select value={form.game} onChange={e=>setForm({...form,game:e.target.value})} className={INPUT_CLS}>
              <option value="lienquan">Liên Quân</option><option value="lienminh">Liên Minh</option><option value="gunny">Gunny 360</option>
              <option value="soulknight">Soul Knight</option><option value="pubg">PUBG</option><option value="dragonmania">Dragon Mania Legends</option>
            </select>
          </div>
          <div><label className={LABEL_CLS}>Độ hiếm</label>
            <select value={form.rarity} onChange={e=>setForm({...form,rarity:e.target.value})} className={INPUT_CLS}>
              <option value="Common">Common</option><option value="Rare">Rare</option><option value="Epic">Epic</option><option value="Legendary">Legendary</option>
            </select>
          </div>
          <div><label className={LABEL_CLS}>Thuộc tính (cách bằng dấu phẩy)</label><input type="text" value={form.attributes||''} onChange={e=>setForm({...form,attributes:e.target.value})} className={INPUT_CLS} /></div>
          <div><label className={LABEL_CLS}>Cấp độ yêu cầu</label><input type="number" value={form.requiredLevel||''} onChange={e=>setForm({...form,requiredLevel:e.target.value})} className={INPUT_CLS} /></div>
          <div className="md:col-span-2 flex gap-3 mt-4">
            <button type="submit" className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg transition">Lưu Thay Đổi</button>
            <button type="button" onClick={()=>setForm(null)} className="px-8 bg-gray-800 text-gray-300 font-bold py-3 rounded-xl hover:bg-gray-700 transition">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4 font-[Nunito]">
      {/* Header */}
      <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
          📦 Quản Lý Sản Phẩm
          <span className="text-sm text-gray-500 font-normal ml-2">{filtered.length} / {products.length} sản phẩm</span>
        </h1>
        <button
          onClick={()=>setForm({...EMPTY_FORM})}
          className="flex items-center gap-2 bg-[#1b64f2] hover:bg-[#256ef5] px-5 py-2.5 rounded-lg text-white font-bold shadow-lg transition text-sm"
        >
          <Plus size={16}/> Thêm Sản Phẩm
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-3 bg-[#171a26] p-3 rounded-xl border border-gray-800 shadow-md">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Tìm tên..." value={search} onChange={e=>setSearch(e.target.value)}
                 className="w-full bg-[#0d101a] text-gray-200 pl-9 pr-3 py-2 rounded-lg border border-gray-700 outline-none focus:border-blue-500 text-sm transition" />
        </div>
        <select value={filterGame} onChange={e=>setFilterGame(e.target.value)} className="bg-[#0d101a] text-gray-300 px-3 py-2 rounded-lg border border-gray-700 outline-none text-sm cursor-pointer">
          <option value="">Tất cả Game</option>
          <option value="lienquan">Liên Quân</option><option value="lienminh">Liên Minh</option><option value="gunny">Gunny 360</option>
          <option value="soulknight">Soul Knight</option><option value="pubg">PUBG</option><option value="dragonmania">Dragon Mania</option>
        </select>
        <select value={filterRarity} onChange={e=>setFilterRarity(e.target.value)} className="bg-[#0d101a] text-gray-300 px-3 py-2 rounded-lg border border-gray-700 outline-none text-sm cursor-pointer">
          <option value="">Tất cả Rarity</option>
          <option value="Legendary">Legendary</option><option value="Epic">Epic</option><option value="Rare">Rare</option><option value="Common">Common</option>
        </select>
        <select value={filterElement} onChange={e=>setFilterElement(e.target.value)} className="bg-[#0d101a] text-gray-300 px-3 py-2 rounded-lg border border-gray-700 outline-none text-sm cursor-pointer">
          <option value="">Tất cả Element</option>
          {ALL_ELEMENTS.filter(Boolean).map(el => (<option key={el} value={el}>{el}</option>))}
        </select>
        {(search || filterGame || filterRarity || filterElement) && (
          <button onClick={()=>{ setSearch(''); setFilterGame(''); setFilterRarity(''); setFilterElement(''); }} className="text-xs text-gray-500 hover:text-red-400 px-2 flex items-center gap-1 transition">
            ✕ Xóa lọc
          </button>
        )}
      </div>

      {/* Product table */}
      <div className="bg-[#171a26] rounded-xl border border-gray-800 shadow-xl overflow-hidden mt-4">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#11131c] text-white text-[0.7rem] uppercase tracking-wider font-bold">
            <tr>
              <th className="p-4 text-center w-16">Thứ tự</th>
              <th className="p-4 w-20">Ảnh</th>
              <th className="p-4">Tên Sản Phẩm</th>
              <th className="p-4 w-32">Game</th>
              <th className="p-4 w-32">Rarity</th>
              <th className="p-4">Elements</th>
              <th className="p-4 text-right w-32">Giá</th>
              <th className="p-4 text-center w-28">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {filtered.length === 0 && (
              <tr><td colSpan="8" className="p-8 text-center text-gray-500 text-sm">Không tìm thấy sản phẩm.</td></tr>
            )}
            {filtered.map((p, idx) => {
              const rc = getRarity(p.rarity);
              const attrs = Array.isArray(p.attributes) ? p.attributes : [];
              const isDragging = draggingId === p.id;
              return (
                <tr
                  key={p.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx, p.id)}
                  onDragEnter={(e) => handleDragEnter(e, idx)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className={`${rc.row} hover:bg-[#1f2436] transition-colors cursor-grab active:cursor-grabbing ${isDragging ? 'bg-[#1b253b] scale-[0.99] opacity-50 border border-blue-500' : ''}`}
                  style={{ background: isDragging ? undefined : rc.glow }}
                >
                  <td className="p-4 text-center text-gray-400 font-bold select-none flex items-center justify-center gap-1">
                    <GripVertical size={14} className="text-gray-600 inline opacity-50" />
                    {idx + 1}
                  </td>
                  <td className="p-4 align-middle">
                    <img src={p.image || `https://picsum.photos/seed/${p.id}/60/60`} alt={p.name} className="w-12 h-12 object-cover rounded-md border border-gray-700 shadow-md" />
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-[0.9rem] text-gray-100 block">{p.name}</span>
                    {p.description && <span className="text-xs text-gray-500 truncate block max-w-[200px] mt-1">{p.description}</span>}
                  </td>
                  <td className="p-4">
                    <span className="bg-[#0f121d] px-3 py-1 rounded-full text-xs border border-gray-700/50 text-gray-400">
                      {p.game}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${rc.badge}`}>
                      {p.rarity}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {attrs.slice(0, 3).map((a, i) => (
                        <span key={i} className="bg-gray-800/80 border border-gray-700/50 text-cyan-400 px-2 py-0.5 rounded text-[0.65rem] tracking-wider uppercase font-semibold">
                          {a}
                        </span>
                      ))}
                      {attrs.length > 3 && <span className="text-gray-600 text-[0.7rem] pt-0.5">+{attrs.length - 3}</span>}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-bold text-[#f5a623] text-sm">
                      💰 {Number(p.price).toLocaleString('vi-VN')} đ
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                       <button onClick={() => setForm({...p, attributes: Array.isArray(p.attributes) ? p.attributes.join(', ') : (p.attributes||'')})} className="w-8 h-8 rounded bg-[#1b263b] flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition" title="Sửa">
                         <Edit size={14}/>
                       </button>
                       <button onClick={() => handleDelete(p.id)} className="w-8 h-8 rounded bg-[#3b1b1b] flex items-center justify-center text-red-500 hover:bg-red-600 hover:text-white transition" title="Xóa">
                         <Trash size={14}/>
                       </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
