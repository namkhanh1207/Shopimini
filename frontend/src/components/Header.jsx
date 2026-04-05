import React from 'react';
import { PlusCircle } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 glass-panel px-6 py-4 flex justify-between items-center text-white">
      <div className="flex items-center space-x-3 gap-2">
         <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Avatar" className="w-12 h-12 rounded-full border-2 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
         <div className="flex flex-col">
           <span className="font-bold text-lg leading-tight">Master</span>
           <span className="text-xs bg-yellow-600 text-white px-2 py-[2px] rounded text-center w-max mt-1 font-bold">Lv.8</span>
         </div>
      </div>
      <div className="absolute left-1/2 -translate-x-1/2">
         <h1 className="text-3xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500" style={{ fontFamily: 'Georgia, serif' }}>
           ShopiMini
         </h1>
      </div>
      <div className="flex items-center space-x-6">
         <div className="relative group cursor-pointer flex items-center bg-gray-800 bg-opacity-50 pr-8 pl-3 py-1 rounded-full border border-yellow-600/50">
           <span className="text-yellow-400 mr-2 text-xl">💰</span>
           <span className="font-bold">12,450</span>
           <button className="absolute -right-3 bg-green-500 hover:bg-green-400 rounded-full w-8 h-8 flex items-center justify-center border-2 border-[#0a0f1a] transition-transform group-hover:scale-110">
             <PlusCircle size={20} className="text-white" />
           </button>
         </div>
         <div className="relative group cursor-pointer flex items-center bg-gray-800 bg-opacity-50 pr-8 pl-3 py-1 rounded-full border border-purple-600/50">
           <span className="text-purple-400 mr-2 text-xl">💎</span>
           <span className="font-bold">850</span>
           <button className="absolute -right-3 bg-green-500 hover:bg-green-400 rounded-full w-8 h-8 flex items-center justify-center border-2 border-[#0a0f1a] transition-transform group-hover:scale-110">
             <PlusCircle size={20} className="text-white" />
           </button>
         </div>
      </div>
    </header>
  );
}
