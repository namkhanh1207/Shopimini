import React from 'react';
import { Flame, Sword, Shirt, Skull } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
  { id: 'offers', label: 'Offers', icon: <Flame size={20} className="text-orange-500" /> },
  { id: 'Weapons', label: 'Weapons', icon: <Sword size={20} className="text-cyan-400" /> },
  { id: 'Skins', label: 'Skins', icon: <Shirt size={20} className="text-pink-400" /> },
  { id: 'Dragons', label: 'Dragons', icon: <Skull size={20} className="text-purple-500" /> },
];

export default function Sidebar({ setFilterAttribute }) {
  return (
    <aside className="w-64 min-h-screen border-r border-[#ffffff10] p-6 hidden md:block">
      <nav className="space-y-4 pt-4">
        {tabs.map((tab) => (
          <motion.button
            whileHover={{ scale: 1.05, filter: 'drop-shadow(0 0 10px rgba(0,255,255,0.4))' }}
            whileTap={{ scale: 0.95 }}
            key={tab.id}
            onClick={() => setFilterAttribute(tab.id === 'offers' ? '' : tab.id)}
            className="w-full flex items-center p-3 space-x-4 bg-gradient-to-r from-[#1e2535] to-[#121622] rounded-xl border border-[#334155] shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <div className="bg-[#0a0f1a] p-2 rounded-lg border border-[#ffffff10]">
               {tab.icon}
            </div>
            <span className="font-bold text-gray-200 uppercase tracking-wider">{tab.label}</span>
          </motion.button>
        ))}
      </nav>
    </aside>
  );
}
