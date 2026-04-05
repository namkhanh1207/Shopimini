import React from 'react';
import { Search } from 'lucide-react';

export default function FilterBar({ filters, setFilters, onSelectGame }) {
  return (
    <div className="flex flex-wrap items-center justify-between bg-[#121622] p-4 rounded-xl border border-[#ffffff10] shadow-lg mb-8 gap-4">
       <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search items..." 
            className="w-full bg-[#0a0f1a] text-white pl-10 pr-4 py-2 rounded-full border border-gray-700 outline-none focus:border-cyan-500 focus:shadow-[0_0_8px_rgba(0,255,255,0.3)] transition"
          />
       </div>
       <div className="flex space-x-3">
          <select 
             className="bg-[#1e2535] text-white p-2 rounded-full border border-gray-600 outline-none focus:border-cyan-400"
             value={filters.game || ''}
             onChange={(e) => {
                 setFilters(prev => ({ ...prev, game: e.target.value }));
                 if(e.target.value) onSelectGame(e.target.value);
             }}
          >
             <option value="">All Games</option>
             <option value="lienquan">Liên Quân</option>
             <option value="lienminh">Liên Minh</option>
             <option value="gunny">Gunny 360</option>
             <option value="soulknight">Soul Knight</option>
             <option value="pubg">PUBG</option>
             <option value="dragonmania">Dragon Mania</option>
          </select>
          
          <select 
             className="bg-[#1e2535] text-white p-2 rounded-full border border-gray-600 outline-none focus:border-purple-400"
             value={filters.rarity || ''}
             onChange={(e) => setFilters(prev => ({ ...prev, rarity: e.target.value }))}
          >
             <option value="">Rarity (All)</option>
             <option value="Common">Common</option>
             <option value="Rare">Rare</option>
             <option value="Epic">Epic</option>
             <option value="Legendary">Legendary</option>
          </select>
       </div>
    </div>
  );
}
